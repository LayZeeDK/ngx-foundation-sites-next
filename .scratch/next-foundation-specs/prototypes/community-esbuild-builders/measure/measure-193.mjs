// PROTOTYPE 193: proposal A built by @angular-builders/custom-esbuild in a plain Angular CLI
// workspace, against the production SSR server. Reruns 192's probe (SSR, client-only @defer,
// enter animations), 189's settings read and hydrate-defer page, 188's L1-L3 in host mode, and
// checks the prerendered route.
// Usage: BASE=http://localhost:4731 node measure/measure-193.mjs [chromium|firefox|webkit ...]
import { chromium, firefox, webkit } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4731';
const engines = { chromium, firefox, webkit };
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(engines);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PAD = '44px'; // the consumer's $callout-sizes default (2.75rem); Foundation's default is 16px

// Consumer settings -> expected computed values (from 189's measure.mjs).
const EXPECT = {
  calloutPadding: '44px',
  buttonBg: 'rgb(163, 0, 30)',
  buttonRadius: '8px',
  buttonPaddingLeft: '31.68px',
  menuLinkPaddingTop: '19.2px',
  submenuBg: 'rgb(253, 243, 208)',
};
const samePx = (a, b) => a === b || (!!a && a.endsWith('px') && Math.abs(parseFloat(a) - parseFloat(b)) < 0.05);

/** Init script: records <style>/<link> insertions and removals, and samples computed styles each frame. */
function recorder(sample) {
  const t0 = performance.now();
  window.__frames = [];
  window.__muts = [];
  window.__dcl = null;
  document.addEventListener('DOMContentLoaded', () => (window.__dcl = performance.now() - t0));
  new MutationObserver((records) => {
    for (const r of records) {
      for (const [kind, list] of [['add', r.addedNodes], ['remove', r.removedNodes]]) {
        for (const n of list) {
          if (n.nodeName === 'STYLE' || n.nodeName === 'LINK') {
            window.__muts.push({
              kind,
              t: Math.round(performance.now() - t0),
              afterDcl: window.__dcl !== null,
              text: (n.getAttribute('data-nfs-family') || n.getAttribute('href') || '').slice(0, 40),
            });
          }
        }
      }
    }
  }).observe(document, { childList: true, subtree: true });
  const tick = () => {
    const row = { t: Math.round(performance.now() - t0) };

    for (const [id, prop] of Object.entries(sample)) {
      const el = document.getElementById(id);
      row[id] = el ? getComputedStyle(el)[prop] : null;
    }

    window.__frames.push(row);

    if (performance.now() - t0 < 6000) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
}

async function settled(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => page.waitForLoadState('load'));
  await sleep(400);
}

const css = (page, sel, prop) =>
  page.evaluate(([s, p]) => {
    const el = document.querySelector(s);

    return el ? getComputedStyle(el)[p] : null;
  }, [sel, prop]);

const families = (page) =>
  page.evaluate(() => [...document.head.querySelectorAll('[data-nfs-family]')].map((e) => `${e.tagName.toLowerCase()}:${e.getAttribute('data-nfs-family')}`));

async function readSettings(page) {
  return {
    calloutPadding: await css(page, '#c-hydrated', 'paddingTop'),
    buttonBg: await css(page, '#btn', 'backgroundColor'),
    buttonRadius: await css(page, '#btn', 'borderTopLeftRadius'),
    buttonPaddingLeft: await css(page, '#btn', 'paddingLeft'),
    menuLinkPaddingTop: await css(page, '#menu a', 'paddingTop'),
    submenuBg: await css(page, '#dd-sub', 'backgroundColor'),
  };
}

/** Server HTML carries the owned <style>; hydration must adopt it with no mutation and no flash. */
async function ssr(browser, path) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const html = await (await fetch(`${BASE}${path}`)).text();
  const serverStyles = [...html.matchAll(/<style data-nfs-family="([\w-]+)"/g)].map((m) => m[1]);
  await page.addInitScript(recorder, { 'c-hydrated': 'paddingTop', 'c-deferred': 'paddingTop' });
  await page.goto(`${BASE}${path}`);
  await settled(page);
  const frames = await page.evaluate(() => window.__frames);
  const muts = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl));
  const unstyled = frames.filter((f) => (f['c-hydrated'] && f['c-hydrated'] !== PAD) || (f['c-deferred'] && f['c-deferred'] !== PAD)).length;
  const settings = await readSettings(page);
  // Incremental hydration: the deferred callout hydrates on interaction.
  await page.click('#c-deferred');
  await sleep(600);
  const deferredHydrated = await page.evaluate(() => !document.getElementById('c-deferred').closest('[ngb]'));
  const mutsAfterHydrate = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl));
  const afterHydrate = await families(page);
  // Unload after the last instance: hide the hydrated callout and the deferred block.
  await page.click('#toggle-hydrated');
  await page.click('#toggle-deferred');
  await sleep(600);
  const afterLast = await families(page);
  const probe = await page.evaluate(() => {
    const d = document.createElement('div');
    d.className = 'callout';
    document.body.appendChild(d);
    const v = getComputedStyle(d).paddingTop;
    d.remove();

    return v;
  });
  await ctx.close();

  return {
    serverStyles,
    framesSampled: frames.length,
    unstyledFrames: unstyled,
    styleMutationsAfterDcl: muts,
    settings,
    settingsPass: Object.entries(EXPECT).every(([k, v]) => samePx(settings[k], v)),
    incremental: { deferredHydrated, styleMutationsAfterDcl: mutsAfterHydrate.length, families: afterHydrate },
    afterLastInstance: { families: afterLast, plainCalloutPadding: probe },
  };
}

async function clientDefer(browser, delayMs) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const requests = [];
  page.on('request', (r) => requests.push(r.url().replace(BASE, '')));

  if (delayMs) {
    await ctx.addCookies([{ name: 'nfs-delay-js', value: String(delayMs), url: new URL(BASE).origin }]);
  }

  await page.addInitScript(recorder, { 'c-client': 'paddingTop' });
  await page.goto(`${BASE}/client-defer`);
  await settled(page);
  const beforeClick = requests.length;
  const familyStylesBefore = (await families(page)).length;
  await page.click('#ph');
  await sleep(delayMs + 1000);
  const frames = await page.evaluate(() => window.__frames.filter((f) => f['c-client'] !== null));
  const unstyled = frames.filter((f) => f['c-client'] !== PAD);
  const muts = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl));
  const after = await families(page);
  await ctx.close();

  return {
    framesWithElement: frames.length,
    unstyledFrames: unstyled.length,
    firstValues: frames.slice(0, 3).map((f) => f['c-client']).join(' '),
    familyStylesBefore,
    familyStylesAfter: after,
    requestsAfterClick: requests.slice(beforeClick),
    styleMutations: muts,
  };
}

async function enter(browser, target, delayMs, warm) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  if (delayMs) {
    await ctx.addCookies([{ name: 'nfs-delay-js', value: String(delayMs), url: new URL(BASE).origin }]);
  }

  await page.goto(`${BASE}/enter`);
  await settled(page);

  if (warm) {
    await page.click(target === 'c-click' ? '#show' : '#ph');
    await sleep(800);
    await page.reload();
    await settled(page);
  }

  await page.evaluate((id) => {
    window.__enter = [];
    const t0 = performance.now();
    const tick = () => {
      const el = document.getElementById(id);

      if (el) {
        window.__enter.push({
          t: Math.round(performance.now() - t0),
          pad: getComputedStyle(el).paddingTop,
          opacity: parseFloat(getComputedStyle(el).opacity),
          anims: el.getAnimations().length,
        });
      }

      if (performance.now() - t0 < 3000) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, target);
  await page.click(target === 'c-click' ? '#show' : '#ph');
  await sleep(delayMs + 1500);
  const f = await page.evaluate(() => window.__enter);
  await ctx.close();
  const first = f[0]?.t ?? 0;
  const animated = f.filter((x) => x.anims > 0 || x.opacity < 0.99);

  return {
    verdict: animated.length === 0 ? 'skipped' : animated[0].t - first > 20 ? 'late' : 'on time',
    unstyledFrames: f.filter((x) => x.pad !== PAD).length,
    animationStartMs: animated.length ? animated[0].t - first : null,
    animatedFrames: animated.length,
  };
}

/** 189's hydrate-defer page: server-rendered callouts in hydrate-on-interaction/viewport blocks. */
async function hydrateDefer(browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(recorder, { 'c-int': 'paddingTop', 'c-vp': 'paddingTop' });
  await page.goto(`${BASE}/hydrate-defer`);
  await settled(page);
  await page.evaluate(() => document.getElementById('c-vp').scrollIntoView());
  await sleep(800);
  const vpHydrated = await page.evaluate(() => !document.getElementById('c-vp').closest('[ngb]'));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('#c-int');
  await sleep(800);
  const intHydrated = await page.evaluate(() => !document.getElementById('c-int').closest('[ngb]'));
  const frames = await page.evaluate(() => window.__frames);
  const muts = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl));
  const after = await families(page);
  await ctx.close();

  return {
    framesSampled: frames.length,
    unstyledFrames: frames.filter((f) => (f['c-int'] && f['c-int'] !== PAD) || (f['c-vp'] && f['c-vp'] !== PAD)).length,
    styleMutationsAfterDcl: muts.length,
    viewportBlockHydrated: vpHydrated,
    interactionBlockHydrated: intHydrated,
    families: after,
  };
}

/** Ticket 188's L1-L3 (from 189's m6Leave), host timing, against the owned <style>. */
async function leave(browser) {
  const out = {};
  const count = (page) => page.evaluate(() => document.head.querySelectorAll('[data-nfs-family="callout"]').length);
  const run = async (name, fn) => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/lifecycle`);
    await settled(page);
    out[name] = await fn(page, count);
    await page.close();
  };
  const recheck = async (page) => {
    const cycles = [];

    for (let i = 0; i < 2; i++) {
      await page.click('#add');
      await sleep(300);
      const styled = await css(page, '.c-item', 'paddingTop');
      await page.click('#remove');
      await sleep(1500);
      cycles.push(`${styled}/${await count(page)}`);
    }

    return cycles.join(' ');
  };

  await run('L1 callout inside leaving element', async (page) => {
    await page.click('#leaving');
    await sleep(300);
    await page.evaluate(() => {
      window.__l1 = [];
      const t0 = performance.now();
      const tick = () => {
        const wrap = document.getElementById('leaving-wrap');
        const c = document.getElementById('leaving-callout');
        window.__l1.push({
          t: Math.round(performance.now() - t0),
          wrap: !!wrap,
          pad: c ? getComputedStyle(c).paddingTop : null,
          styles: document.head.querySelectorAll('[data-nfs-family="callout"]').length,
        });

        if (performance.now() - t0 < 1500) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
    await page.click('#leaving'); // starts the 600 ms leave
    await sleep(250);
    const duringLeave = { wrapperInDom: await page.evaluate(() => !!document.getElementById('leaving-wrap')), styles: await count(page) };
    await sleep(1500);
    const l1 = await page.evaluate(() => window.__l1);
    const wrapGone = l1.find((f) => !f.wrap)?.t;
    const styleGone = l1.find((f) => f.styles === 0)?.t;

    return {
      duringLeave,
      leaveMs: wrapGone ?? null,
      framesWhileLeaving: l1.filter((f) => f.wrap).length,
      unstyledFramesWhileLeaving: l1.filter((f) => f.wrap && f.pad !== PAD).length,
      styleRemovedMsAfterHostLeft: wrapGone === undefined || styleGone === undefined ? null : styleGone - wrapGone,
      afterLeave: await count(page),
      afterRecheck: await recheck(page),
    };
  });

  await run('L2 unrelated leave running', async (page) => {
    await page.click('#other');
    await page.click('#add');
    await sleep(300);
    await page.click('#other');
    await page.click('#remove');
    await sleep(1500);

    return { afterLeave: await count(page), afterRecheck: await recheck(page) };
  });

  await run('L3 (animate.leave) listener on the page', async (page) => {
    await page.click('#listener');
    await page.click('#add');
    await sleep(300);
    await page.click('#remove');
    await sleep(1500);
    const whileListenerPresent = await count(page);
    await page.click('#listener');
    await sleep(1500);

    return { whileListenerPresent, afterListenerLeft: await count(page), afterRecheck: await recheck(page) };
  });

  return out;
}

const out = {};

for (const name of wanted) {
  const browser = await engines[name].launch();
  out[name] = {
    ssr: await ssr(browser, '/ssr'),
    prerendered: await ssr(browser, '/prerendered'),
    hydrateDefer: await hydrateDefer(browser),
    clientDefer: {
      'chunk local': await clientDefer(browser, 0),
      'chunk delayed 300 ms': await clientDefer(browser, 300),
    },
    enter: {},
    leave: await leave(browser),
  };

  for (const target of ['c-click', 'c-defer']) {
    out[name].enter[`${target}, cold local`] = await enter(browser, target, 0, false);
    out[name].enter[`${target}, cold, 300 ms chunk delay`] = await enter(browser, target, 300, false);
    out[name].enter[`${target}, warm cache`] = await enter(browser, target, 0, true);
  }

  await browser.close();
  console.log(name, JSON.stringify(out[name], null, 1));
  mkdirSync('results', { recursive: true });
  writeFileSync(`results/measure-193-${name}.json`, JSON.stringify(out[name], null, 2));
}
