// PROTOTYPE 197, proposal D: the paint gate and the listener-driven enter animation.
// Usage: node measure/probe-d.mjs <chromium|firefox|webkit> [runs=5]
// Builds: 4791 = 189's <link> loader, 4793 = proposal E (hashed asset <link>). Both fetch on construct.
// Each case runs with and without `?gate=1`; family CSS is delayed 300 ms by cookie (server.ts).
import { chromium, firefox, webkit } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const engines = { chromium, firefox, webkit };
const engine = process.argv[2] ?? 'chromium';
const RUNS = Number(process.argv[3] ?? 5);
const BUILDS = { link: 'http://localhost:4791', file: 'http://localhost:4793' };
const AXE = 'D:/tmp/nfs-proto-190/node_modules/axe-core/axe.min.js'; // axe-core 4.13.0, read only
const STYLED = '44px';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settled(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => page.waitForLoadState('load'));
  await sleep(400);
}

async function context(browser, base, delayMs) {
  const ctx = await browser.newContext();

  if (delayMs) {
    await ctx.addCookies([{ name: 'nfs-delay-css', value: String(delayMs), url: new URL(base).origin }]);
  }

  return ctx;
}

/** In-page (init script): per-frame samples of #c-client and #after, a focus attempt at insertion, CLS. */
function clientDeferRecorder() {
  const t0 = performance.now();
  window.__f = [];
  window.__shifts = [];
  window.__focus = null;

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__shifts.push({ t: Math.round(e.startTime), value: e.value, recent: e.hadRecentInput });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {
    window.__shifts = null; // not supported (Firefox, WebKit)
  }

  new MutationObserver(() => {
    const inner = document.getElementById('c-inner');

    if (inner && !window.__focus) {
      // What a directive that moves focus into new content would do, in the insertion task.
      inner.focus();
      window.__focus = {
        t: Math.round(performance.now() - t0),
        atInsert: document.activeElement?.id || document.activeElement?.tagName,
        pending: document.getElementById('c-client').hasAttribute('data-nfs-pending'),
      };
    }
  }).observe(document, { childList: true, subtree: true });

  const tick = () => {
    const el = document.getElementById('c-client');

    if (el) {
      const cs = getComputedStyle(el);
      window.__f.push({
        t: Math.round(performance.now() - t0),
        pad: cs.paddingTop,
        vis: cs.visibility,
        pending: el.hasAttribute('data-nfs-pending'),
        afterTop: Math.round(document.getElementById('after').getBoundingClientRect().top * 10) / 10,
        active: document.activeElement?.id || document.activeElement?.tagName,
      });
    }

    if (performance.now() - t0 < 8000) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

async function clientDefer(browser, base, gate, delayMs) {
  const ctx = await context(browser, base, delayMs);
  const page = await ctx.newPage();
  await page.addInitScript(clientDeferRecorder);
  await page.goto(`${base}/client-defer${gate ? '?gate=1' : ''}`);
  await settled(page);
  const afterTopBefore = await page.evaluate(() => document.getElementById('after').getBoundingClientRect().top);
  const tClick = await page.evaluate(() => performance.now());
  await page.click('#ph');
  await sleep(delayMs + 1000);
  const f = await page.evaluate(() => window.__f);
  const shifts = await page.evaluate(() => window.__shifts);
  const focus = await page.evaluate(() => window.__focus);
  const activeAfter = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
  await ctx.close();
  const first = f[0]?.t ?? 0;
  const visibleUnstyled = f.filter((x) => x.vis !== 'hidden' && x.pad !== STYLED);
  const invisible = f.filter((x) => x.vis === 'hidden');
  const firstGood = f.find((x) => x.vis !== 'hidden' && x.pad === STYLED);
  const tops = [Math.round(afterTopBefore * 10) / 10, ...f.map((x) => x.afterTop)];
  const moves = tops.filter((v, i) => i > 0 && v !== tops[i - 1]).length;

  return {
    framesWithElement: f.length,
    visibleUnstyledFrames: visibleUnstyled.length,
    invisibleFrames: invisible.length,
    msToFirstStyledVisibleFrame: firstGood ? firstGood.t - first : null,
    // #after's top: before the click, in the first frame with the callout, and at the end.
    afterTop: `${tops[0]} -> ${tops[1]} -> ${tops.at(-1)}`,
    afterMovesWhileElementPresent: moves - (tops[1] !== tops[0] ? 1 : 0),
    layoutShift: shifts && {
      afterClickTotal: +shifts.filter((s) => s.t > tClick).reduce((a, s) => a + s.value, 0).toFixed(4),
      countedTowardsCls: +shifts.filter((s) => s.t > tClick && !s.recent).reduce((a, s) => a + s.value, 0).toFixed(4),
      entries: shifts.filter((s) => s.t > tClick).map((s) => `${Math.round(s.t - tClick)}ms:${s.value.toFixed(4)}${s.recent ? '(recent input)' : ''}`).join(' '),
    },
    focus: { ...focus, activeAfterLoad: activeAfter },
  };
}

/** Enter animation: class form (`animate.enter`) without the gate, listener form (`nfsEnter`) with it. */
async function enter(browser, base, gate, target, delayMs) {
  const ctx = await context(browser, base, delayMs);
  const page = await ctx.newPage();
  await page.goto(`${base}/enter${gate ? '?gate=1' : ''}`);
  await settled(page);
  await page.evaluate((id) => {
    window.__e = [];
    const t0 = performance.now();
    const tick = () => {
      const el = document.getElementById(id);

      if (el) {
        const cs = getComputedStyle(el);
        window.__e.push({
          t: Math.round(performance.now() - t0),
          pad: cs.paddingTop,
          vis: cs.visibility,
          opacity: parseFloat(cs.opacity),
          anims: el.getAnimations().length,
        });
      }

      if (performance.now() - t0 < 3500) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, target);
  await page.click(target === 'c-click' ? '#show' : '#ph');
  await sleep(delayMs + 1800);
  const f = await page.evaluate(() => window.__e);
  await ctx.close();
  const first = f[0]?.t ?? 0;
  const animated = f.filter((x) => x.anims > 0 || x.opacity < 0.99);
  const firstAnim = animated[0];
  const firstStyled = f.find((x) => x.pad === STYLED);
  // A visible, styled, unanimated frame before the animation starts = the final state flashed first.
  const flashBefore = firstAnim
    ? f.filter((x) => x.t < firstAnim.t && x.vis !== 'hidden' && x.pad === STYLED && x.opacity >= 0.99).length
    : null;

  return {
    verdict: !firstAnim ? 'skipped' : firstAnim.t - (firstStyled?.t ?? first) > 20 ? 'late after styling' : 'plays',
    animationStartMs: firstAnim ? firstAnim.t - first : null,
    styledAfterMs: firstStyled ? firstStyled.t - first : null,
    animatedFrames: animated.length,
    visibleUnstyledFrames: f.filter((x) => x.vis !== 'hidden' && x.pad !== STYLED).length,
    invisibleFrames: f.filter((x) => x.vis === 'hidden').length,
    styledFramesBeforeAnimation: flashBefore,
    minOpacity: Math.min(...f.map((x) => x.opacity)),
  };
}

/** axe and the accessibility tree during the gap (CSS delayed 5 s so the window is wide enough). */
async function a11yDuringGap(browser, base, gate) {
  const ctx = await context(browser, base, 5000);
  const page = await ctx.newPage();
  await page.goto(`${base}/client-defer${gate ? '?gate=1' : ''}`);
  await settled(page);
  await page.click('#ph');
  await page.waitForSelector('#c-client', { state: 'attached' });
  const state = () =>
    page.evaluate(() => {
      const el = document.getElementById('c-client');
      const cs = getComputedStyle(el);

      return `${cs.paddingTop}/${cs.visibility}${el.hasAttribute('data-nfs-pending') ? '/pending' : ''}`;
    });
  const before = await state();
  await page.addScriptTag({ path: AXE });
  const axe = async () => {
    const r = await page.evaluate(async () => {
      const res = await window.axe.run(document, { resultTypes: ['violations'] });

      return res.violations.map((v) => `${v.id}(${v.impact}, ${v.nodes.length})`);
    });

    return r.length ? r.join(' ') : 'none';
  };
  const gapTree = await page.locator('body').ariaSnapshot();
  const gapAxe = await axe();
  const after = await state();
  await page.waitForFunction(() => getComputedStyle(document.getElementById('c-client')).paddingTop === '44px', null, { timeout: 15000 });
  await sleep(300);
  const loadedState = await state();
  const loadedAxe = await axe();
  const loadedTree = await page.locator('body').ariaSnapshot();
  await ctx.close();

  return {
    gap: { stateBefore: before, stateAfterChecks: after, axeViolations: gapAxe, tree: gapTree },
    loaded: { state: loadedState, axeViolations: loadedAxe, tree: loadedTree },
  };
}

const out = { engine, runs: RUNS, clientDefer: {}, enter: {}, a11y: {} };
const browser = await engines[engine].launch();

for (const [build, base] of Object.entries(BUILDS)) {
  for (const gate of [false, true]) {
    const label = `${build}${gate ? ' + gate' : ''}`;
    out.clientDefer[label] = [];
    out.enter[`${label}, c-click`] = [];
    out.enter[`${label}, c-defer`] = [];

    for (let i = 0; i < RUNS; i++) {
      out.clientDefer[label].push(await clientDefer(browser, base, gate, 300));
      out.enter[`${label}, c-click`].push(await enter(browser, base, gate, 'c-click', 300));
      out.enter[`${label}, c-defer`].push(await enter(browser, base, gate, 'c-defer', 300));
    }

    if (build === 'link') {
      out.a11y[label] = await a11yDuringGap(browser, base, gate);
    }

    console.log(engine, label, 'done');
  }
}

await browser.close();
const OUT = process.env.OUT ?? 'out';
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/probe-d-${engine}.json`, JSON.stringify(out, null, 2));
