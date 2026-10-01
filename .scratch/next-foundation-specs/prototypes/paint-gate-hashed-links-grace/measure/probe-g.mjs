// PROTOTYPE 197, proposal G: churn when the last instance of a family comes and goes often.
// Usage: node measure/probe-g.mjs <chromium|firefox|webkit> [runs=5]
// /churn toggles one callout over 3,000 other elements: 20 cycles of 100 ms shown, 100 ms hidden.
// Sources: 4791 = 189's <link> loader, 4792 = proposal A (owned <style> from the directive's chunk).
// Modes: baseline host timing (remove at count 0), `grace=1000`, `keep=disabled`, `keep=sheet`.
import { chromium, firefox, webkit } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const engines = { chromium, firefox, webkit };
const engine = process.argv[2] ?? 'chromium';
const RUNS = Number(process.argv[3] ?? 5);
const SOURCES = { link: 'http://localhost:4791', style: 'http://localhost:4792' };
const MODES = { remove: '', 'grace 1000 ms': 'grace=1000', 'keep, element.disabled': 'keep=disabled', 'keep, sheet.disabled': 'keep=sheet' };
const CYCLES = 20;
const HALF_MS = 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settled(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => page.waitForLoadState('load'));
  await sleep(400);
}

/** In-page: counters for head churn, sheet loads, forced style+layout time, and unstyled frames. */
function install() {
  const s = (window.__g = { adds: 0, removes: 0, attrs: 0, loads: 0, flushMs: 0, flushes: 0, frames: 0, unstyled: 0, on: false });
  const flush = () => {
    const t = performance.now();
    void document.body.offsetHeight; // forces style recalc and layout for whatever changed
    s.flushMs += performance.now() - t;
    s.flushes++;
  };
  new MutationObserver((records) => {
    if (!s.on) {
      return;
    }

    for (const r of records) {
      if (r.type === 'attributes') {
        s.attrs++;
      }

      for (const n of r.addedNodes) {
        if (n.nodeName === 'LINK' || n.nodeName === 'STYLE') {
          s.adds++;
        }
      }

      for (const n of r.removedNodes) {
        if (n.nodeName === 'LINK' || n.nodeName === 'STYLE') {
          s.removes++;
        }
      }
    }

    flush();
  }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
  document.addEventListener(
    'load',
    (e) => {
      if (s.on && e.target.nodeName === 'LINK') {
        s.loads++;
        flush();
      }
    },
    true,
  );
  const tick = () => {
    const el = document.getElementById('churn-c');

    if (s.on && el) {
      s.frames++;

      if (getComputedStyle(el).paddingTop !== '44px') {
        s.unstyled++;
      }
    }

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** In-page: what applies after the last instance, and what the library kept in <head>. */
function stale() {
  const probe = document.createElement('div');
  probe.className = 'callout';
  document.body.append(probe);
  const padding = getComputedStyle(probe).paddingTop;
  probe.remove();
  const el = document.head.querySelector('[data-nfs-family="callout"]');

  return {
    probePadding: padding,
    element: el ? `${el.tagName}${el.disabled ? ' disabled' : ''}${el.sheet?.disabled ? ' sheet.disabled' : ''}${el.sheet ? '' : ' (no sheet)'}` : 'none',
  };
}

async function run(browser, base, query) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  let requests = 0;
  page.on('request', (r) => {
    if (/nfs-callout/.test(r.url())) {
      requests++;
    }
  });
  await page.goto(`${base}/churn${query ? `?${query}` : ''}`);
  await settled(page);
  await page.evaluate(install);
  const cdp = engine === 'chromium' ? await ctx.newCDPSession(page) : null;
  const metrics = async () => {
    if (!cdp) {
      return null;
    }

    const { metrics: m } = await cdp.send('Performance.getMetrics');
    const get = (n) => m.find((x) => x.name === n).value;

    return { recalcCount: get('RecalcStyleCount'), recalcMs: get('RecalcStyleDuration') * 1000, layoutMs: get('LayoutDuration') * 1000 };
  };
  await cdp?.send('Performance.enable');
  const m0 = await metrics();
  const requestsBefore = requests;
  const wallMs = await page.evaluate(
    async ([cycles, half]) => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const button = document.getElementById('toggle');
      const t0 = performance.now();
      window.__g.on = true;

      for (let i = 0; i < cycles * 2; i++) {
        button.click();
        await wait(half);
      }

      // Let host timing settle after the last removal (one frame plus the observer).
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      window.__g.on = false;

      return performance.now() - t0;
    },
    [CYCLES, HALF_MS],
  );
  const m1 = await metrics();
  const counters = await page.evaluate(() => window.__g);
  const justAfter = await page.evaluate(stale);
  await sleep(1500); // past the 1000 ms grace
  const afterGrace = await page.evaluate(stale);
  // Re-acquire once more after the grace period: is the family still loadable and styled?
  await page.click('#toggle');
  await sleep(400);
  const reacquired = await page.evaluate(() => getComputedStyle(document.getElementById('churn-c')).paddingTop);
  await ctx.close();

  return {
    headInserts: counters.adds,
    headRemoves: counters.removes,
    disabledToggles: counters.attrs,
    sheetLoadEvents: counters.loads,
    cssRequests: requests - requestsBefore,
    forcedFlushMs: +counters.flushMs.toFixed(2),
    forcedFlushes: counters.flushes,
    unstyledFrames: `${counters.unstyled}/${counters.frames}`,
    chromium: m0 && {
      recalcStyleCount: m1.recalcCount - m0.recalcCount,
      recalcStyleMs: +(m1.recalcMs - m0.recalcMs).toFixed(2),
      layoutMs: +(m1.layoutMs - m0.layoutMs).toFixed(2),
    },
    loopWallMs: Math.round(wallMs),
    justAfterLast: justAfter,
    after1500ms: afterGrace,
    reacquiredPadding: reacquired,
  };
}

const browser = await engines[engine].launch();
const out = { engine, runs: RUNS, cycles: CYCLES, halfCycleMs: HALF_MS, results: {} };

for (const [source, base] of Object.entries(SOURCES)) {
  for (const [mode, query] of Object.entries(MODES)) {
    const label = `${source}, ${mode}`;
    out.results[label] = [];

    for (let i = 0; i < RUNS; i++) {
      out.results[label].push(await run(browser, base, query));
    }

    console.log(engine, label, JSON.stringify(out.results[label][0]));
  }
}

await browser.close();
const OUT = process.env.OUT ?? 'out';
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/probe-g-${engine}.json`, JSON.stringify(out, null, 2));
