// PROTOTYPE 198, point 4: what the unload machinery costs with 1,000 and 5,000 directive hosts.
// Needs serve-198.sh. One engine per run, so runs do not compete for the CPU.
// Usage: node measure-198/bench.mjs <chromium|firefox|webkit> [reps]
//
// Modes, each on a fresh browser context:
// - none:  `?keep=1`, n plain `<div class="callout">` (no directive). The family CSS is present
//          through one loader instance (#keeper). This is the no-loader baseline.
// - warm:  `?keep=1`, n `<div nfsCallout>`. The family is already loaded; this is the per-host
//          count, release, MutationObserver, and frame check.
// - cold:  `?keep=0`, n `<div nfsCallout>`. The bench hosts load the family and, on removal,
//          unload it.
// - leave-none / leave: as none (keep=1) and cold (keep=0), but the hosts sit inside an element
//          with a 600 ms animate.leave, and an element outside the app changes its text every frame
//          while it leaves, so the MutationObserver host timing runs on every frame.
// Plus the hold scan: the server renders n hosts (`?ssr=loader`) or n plain ones (`?ssr=plain`),
// the client hydrates, and the service's scan of `[data-nfs-styles]` is timed.
import { chromium, firefox, webkit } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const candidates = { own: 'http://localhost:4811', link: 'http://localhost:4812', chunk: 'http://localhost:4813' };
const engineName = process.argv[2] ?? 'chromium';
const reps = Number(process.argv[3] ?? 5);
const engine = { chromium, firefox, webkit }[engineName];
const sizes = [1000, 5000];
const modes = ['none', 'warm', 'cold', 'leave-none', 'leave'];
const insertValue = { none: 'plain', warm: 'loader', cold: 'loader', 'leave-none': 'plain-leave', leave: 'loader-leave' };
const keeps = { none: 1, warm: 1, cold: 0, 'leave-none': 1, leave: 0 };

const pageHelpers = () => {
  window.__lt = [];

  try {
    new PerformanceObserver((list) => window.__lt.push(...list.getEntries().map((e) => [e.startTime, e.duration]))).observe({
      type: 'longtask',
      buffered: true,
    });
  } catch {
    window.__lt = null; // not supported in this engine
  }
};

// Runs in the page: one insert and one remove, timed.
async function operate([mode, value]) {
  const raf = () => new Promise((r) => requestAnimationFrame(r));
  const stats = window.__nfsStats ?? {};
  const clear = () => Object.keys(stats).forEach((k) => delete stats[k]);
  const snapshot = () => ({ ...stats });
  let frames = [];
  let sampling = false;
  const sample = () => {
    frames = [];
    sampling = true;
    let last = performance.now();
    const tick = (t) => {
      frames.push(t - last);
      last = t;

      if (sampling) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };
  const longTasks = (from, to) =>
    window.__lt === null ? null : window.__lt.filter(([s]) => s >= from && s <= to).map(([, d]) => d);
  const familyElement = () => document.querySelector('[data-nfs-family="callout"]');
  const firstStyled = () => {
    const el = document.querySelector('#bench div:not(#leave-wrap)');

    return el && getComputedStyle(el).paddingTop === '44px';
  };

  await raf();
  await raf();
  const out = { mode };

  // Insert.
  clear();
  sample();
  let t0 = performance.now();
  window.__bench.mode.set(value);
  await raf();
  await raf();
  out.insertMs = performance.now() - t0;

  while (!firstStyled() && performance.now() - t0 < 10000) {
    await raf();
  }

  out.styledMs = performance.now() - t0;
  await new Promise((r) => setTimeout(r, 300));
  sampling = false;
  out.insertMaxFrameMs = Math.max(...frames);
  out.insertLongTasks = longTasks(t0, performance.now());
  out.insertStats = snapshot();
  out.hosts = document.querySelectorAll('#bench div:not(#leave-wrap)').length;

  return out;
}

async function remove(mode) {
  const raf = () => new Promise((r) => requestAnimationFrame(r));
  const stats = window.__nfsStats ?? {};
  Object.keys(stats).forEach((k) => delete stats[k]);
  let frames = [];
  let sampling = true;
  let last = performance.now();
  const tick = (t) => {
    frames.push(t - last);
    last = t;

    if (sampling) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
  const out = {};
  // leave modes: page churn outside the app, one text change per frame, while the hosts leave.
  const churn = document.body.appendChild(document.createElement('span'));
  let churning = mode.startsWith('leave');
  const churnTick = (t) => {
    churn.textContent = String(t);

    if (churning) {
      requestAnimationFrame(churnTick);
    }
  };

  if (churning) {
    requestAnimationFrame(churnTick);
  }

  const t0 = performance.now();
  window.__bench.mode.set('off');
  await raf();
  await raf();
  out.removeMs = performance.now() - t0;

  if (mode.startsWith('leave')) {
    while (document.querySelector('#leave-wrap') && performance.now() - t0 < 10000) {
      await raf();
    }

    out.leftMs = performance.now() - t0;
  }

  if (mode === 'cold' || mode === 'leave') {
    while (document.querySelector('[data-nfs-family="callout"]') && performance.now() - t0 < 10000) {
      await raf();
    }

    out.unloadedMs = performance.now() - t0;
    out.unloaded = !document.querySelector('[data-nfs-family="callout"]');
  }

  await new Promise((r) => setTimeout(r, 300));
  churning = false;
  churn.remove();
  sampling = false;
  out.removeMaxFrameMs = Math.max(...frames);
  out.removeLongTasks =
    window.__lt === null ? null : window.__lt.filter(([s]) => s >= t0).map(([, d]) => d);
  out.removeStats = { ...stats };
  out.keeperStyled =
    !document.querySelector('#keeper') || getComputedStyle(document.querySelector('#keeper')).paddingTop === '44px';

  return out;
}

const metricKeys = ['RecalcStyleDuration', 'RecalcStyleCount', 'LayoutDuration', 'LayoutCount', 'ScriptDuration', 'TaskDuration'];

async function cdpMetrics(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics');

  return Object.fromEntries(metrics.filter((m) => metricKeys.includes(m.name)).map((m) => [m.name, m.value]));
}

const diff = (a, b) => Object.fromEntries(Object.keys(b).map((k) => [k, +(b[k] - a[k]).toFixed(4)]));

async function heap(cdp) {
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.collectGarbage');

  return (await cdp.send('Runtime.getHeapUsage')).usedSize;
}

const browser = await engine.launch();
const results = [];

for (const [candidate, base] of Object.entries(candidates)) {
  for (const n of sizes) {
    for (const mode of modes) {
      for (let rep = 0; rep < reps; rep++) {
        const context = await browser.newContext();
        await context.addInitScript(pageHelpers);
        const page = await context.newPage();
        const cdp = engineName === 'chromium' ? await context.newCDPSession(page) : null;
        await page.goto(`${base}/bench?n=${n}&keep=${keeps[mode]}`, { waitUntil: 'load' });
        await page.waitForFunction(() => window.__bench);

        if (keeps[mode]) {
          await page.waitForFunction(() => getComputedStyle(document.querySelector('#keeper')).paddingTop === '44px');
        }

        await page.waitForTimeout(300);
        const row = { engine: engineName, candidate, n, mode, rep };

        if (cdp) {
          await cdp.send('Performance.enable');
          row.heapBefore = await heap(cdp);
        }

        let m0 = cdp && (await cdpMetrics(cdp));
        Object.assign(row, await page.evaluate(operate, [mode, insertValue[mode]]));

        if (cdp) {
          const m1 = await cdpMetrics(cdp);
          row.insertCdp = diff(m0, m1);
          row.heapWith = await heap(cdp);
          m0 = await cdpMetrics(cdp);
        }

        Object.assign(row, await page.evaluate(remove, mode));

        if (cdp) {
          row.removeCdp = diff(m0, await cdpMetrics(cdp));
          row.heapAfter = await heap(cdp);
        }

        results.push(row);
        console.log(
          candidate,
          n,
          mode,
          rep,
          `insert ${row.insertMs.toFixed(1)} styled ${row.styledMs.toFixed(1)} remove ${row.removeMs.toFixed(1)}`,
          `left ${row.leftMs?.toFixed(0) ?? '-'} unloaded ${row.unloadedMs?.toFixed(1) ?? '-'}`,
          `mo ${row.removeStats.moCalls ?? 0}/${(row.removeStats.moMs ?? 0).toFixed(1)}ms`,
          `release ${(row.removeStats.releaseMs ?? 0).toFixed(1)}ms`,
          row.insertCdp ? `recalc ${(row.insertCdp.RecalcStyleDuration * 1000).toFixed(1)}/${(row.removeCdp.RecalcStyleDuration * 1000).toFixed(1)}ms` : '',
        );
        await context.close();
      }
    }

    // Hold scan: server-rendered hosts, hydrated by the client.
    for (const ssr of ['plain', 'loader']) {
      for (let rep = 0; rep < reps; rep++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        const t0 = Date.now();
        const response = await page.goto(`${base}/bench?n=${n}&keep=1&ssr=${ssr}`, { waitUntil: 'load' });
        const html = await response.text();
        await page.waitForFunction(() => window.__bench);
        await page.waitForTimeout(500);
        const s = await page.evaluate(() => ({ ...(window.__nfsStats ?? {}) }));
        const nav = await page.evaluate(() => {
          const e = performance.getEntriesByType('navigation')[0];

          return { ttfb: e.responseStart - e.requestStart, dcl: e.domContentLoadedEventEnd, load: e.loadEventEnd };
        });
        const row = { engine: engineName, candidate, n, mode: `ssr-${ssr}`, rep, holdMs: s.holdMs ?? 0, holdHosts: s.holdHosts ?? 0, htmlBytes: html.length, ...nav, wallMs: Date.now() - t0 };
        results.push(row);
        console.log(candidate, n, row.mode, rep, `hold ${row.holdMs.toFixed(2)}ms over ${row.holdHosts}`, `ttfb ${nav.ttfb.toFixed(0)} load ${nav.load.toFixed(0)}`, `html ${row.htmlBytes}`);
        await context.close();
      }
    }
  }
}

await browser.close();
mkdirSync('D:/tmp/nfs-proto-198-189/out-198', { recursive: true });
writeFileSync(`D:/tmp/nfs-proto-198-189/out-198/bench-${engineName}.json`, JSON.stringify(results, null, 1));
