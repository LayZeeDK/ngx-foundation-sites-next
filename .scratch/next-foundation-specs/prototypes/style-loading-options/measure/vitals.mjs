// PROTOTYPE (ticket 190): scenarios 1-5 x the loading options, with web-vitals 6.2.2 (attribution
// build), layout shifts, long tasks, and a painted-frame probe for unstyled frames.
// Usage: [OPTS=A,B] [TAG=-x] node measure/vitals.mjs <engine> <profile> [runs] [scenario ...]
//   engine: chromium | firefox | webkit; profile: unthrottled | slow4g4x | delay300
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { applySlow4g, carrierChunks, engines, isCarrier, OPTIONS, sleep } from './common.mjs';

const [engineName = 'chromium', profile = 'unthrottled', runsArg = '7', ...only] = process.argv.slice(2);
const runs = Number(runsArg);
const WV = join(import.meta.dirname, '..', 'node_modules', 'web-vitals', 'dist', 'web-vitals.attribution.iife.js');

// Playwright wraps init scripts, so publish the IIFE's global explicitly.
const WV_SOURCE = readFileSync(WV, 'utf8') + ';window.webVitals = webVitals;';

if (profile === 'slow4g4x' && engineName !== 'chromium') {
  throw new Error('slow4g4x needs CDP: Chromium only');
}

/** Init script: in-page recorders. Runs before any page script, in every document. */
function recorder() {
  const w = window;
  w.__clicks = [];
  w.__shifts = [];
  w.__longtasks = [];
  w.__probe = {};
  w.__wv = {};
  w.__supported = PerformanceObserver.supportedEntryTypes;
  w.__ric = typeof requestIdleCallback;
  w.__afterTops = [];

  for (const type of ['pointerdown', 'click']) {
    addEventListener(type, (e) => w.__clicks.push({ type, t: e.timeStamp, id: e.target.id }), true);
  }

  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        w.__shifts.push({
          t: e.startTime,
          v: e.value,
          recent: e.hadRecentInput,
          src: (e.sources || []).map((s) => s.node?.id || s.node?.nodeName || '?').join(','),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}

  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        w.__longtasks.push({ t: e.startTime, d: e.duration });
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch {}

  // dropdown-menu hides the closed submenu; menu makes the bar a flex row.
  const menuStyled = (sub) =>
    getComputedStyle(sub).display === 'none' &&
    getComputedStyle(sub.parentElement.closest('ul')).display === 'flex';
  // Styled means the family's own rules apply (consumer settings, see 184 measurement 1).
  const PROBES = {
    pane: (el) => getComputedStyle(el).position === 'absolute',
    'dd-sub': menuStyled,
    'dd2-sub': menuStyled,
    'c-int': (el) => getComputedStyle(el).paddingTop === '44px',
    vbtn: (el) => getComputedStyle(el).borderTopLeftRadius === '8px',
    hero: (el) => getComputedStyle(el).paddingTop === '44px',
  };
  // Painted frames: a ResizeObserver callback runs after rAF callbacks, style, and layout, just
  // before paint, so what it sees is what the frame paints. A 1 px off-screen sentinel changes
  // width every frame so the observer fires every frame.
  const paintCheck = () => {
    const t = performance.now();
    w.__frames = (w.__frames ?? 0) + 1;
    // Layout position of the paragraph after the interactive area, in document coordinates.
    const after = document.getElementById('after');

    if (after) {
      const top = Math.round(after.getBoundingClientRect().top + scrollY);
      const last = w.__afterTops.at(-1);

      if (!last || last.top !== top || last.path !== location.pathname) {
        w.__afterTops.push({ t, top, path: location.pathname });
      }
    }

    for (const [id, check] of Object.entries(PROBES)) {
      const el = document.getElementById(id);

      if (!el) {
        continue;
      }

      const p = (w.__probe[id] ??= { present: t, styled: null, unstyled: 0 });

      if (p.styled === null) {
        if (check(el)) {
          p.styled = t;
        } else {
          p.unstyled++;
        }
      }
    }
  };
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:fixed;left:-100px;top:0;height:1px;width:1px;';
  new ResizeObserver(paintCheck).observe(sentinel);
  let odd = false;
  const tick = () => {
    if (!sentinel.isConnected) {
      document.documentElement.append(sentinel);
    }

    odd = !odd;
    sentinel.style.width = odd ? '2px' : '1px';
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const attribution = (m) => {
    const a = m.attribution || {};

    switch (m.name) {
      case 'INP':
        return {
          target: a.interactionTarget,
          type: a.interactionType,
          inputDelay: a.inputDelay,
          processing: a.processingDuration,
          presentation: a.presentationDelay,
        };
      case 'LCP':
        return {
          target: a.target,
          ttfb: a.timeToFirstByte,
          loadDelay: a.resourceLoadDelay,
          loadDuration: a.resourceLoadDuration,
          renderDelay: a.elementRenderDelay,
        };
      case 'CLS':
        return { target: a.largestShiftTarget, value: a.largestShiftValue, time: a.largestShiftTime };
      case 'FCP':
        return { ttfb: a.timeToFirstByte, firstByteToFcp: a.firstByteToFCP };
      default:
        return {};
    }
  };
  const put = (m) => (w.__wv[m.name] = { value: m.value, rating: m.rating, attribution: attribution(m) });
  const opts = { reportAllChanges: true };
  webVitals.onLCP(put, opts);
  webVitals.onCLS(put, opts);
  webVitals.onFCP(put, opts);
  webVitals.onTTFB(put, opts);
  webVitals.onINP(put, { ...opts, durationThreshold: 16 });
}

const readPage = (page) =>
  page.evaluate(() => ({
    clicks: window.__clicks,
    shifts: window.__shifts,
    longtasks: window.__longtasks,
    probe: window.__probe,
    frames: window.__frames,
    ric: window.__ric,
    afterTops: window.__afterTops,
    wv: window.__wv,
    times: window.__nfsTimes ?? {},
    supported: window.__supported,
    now: performance.now(),
  }));

async function waitFor(page, when) {
  if (when === 'early') {
    // As soon as hydration has rendered (for D: before its idle prefetch starts).
    await page.waitForFunction(() => window.__nfsTimes?.hydrated !== undefined, null, {
      polling: 'raf',
      timeout: 30_000,
    });
  } else {
    // Long after idle: no network for 500 ms, then 1 s more.
    await page.waitForLoadState('networkidle');
    await sleep(1000);
  }
}

const waitStyled = (page, id) =>
  page
    .waitForFunction((id) => window.__probe[id]?.styled != null, id, { timeout: 30_000 })
    .catch(() => null);

/** Scenario runners: each returns { marks: { label: {probeId, triggerT} } } after the page settles. */
const SCENARIOS = {
  's1-load': async (page) => {
    await page.waitForLoadState('networkidle');
    await sleep(1000);

    return {};
  },
  ...Object.fromEntries(
    ['early', 'late'].flatMap((when) => [
      [
        `s2-nav-${when}`,
        async (page) => {
          await waitFor(page, when);
          await page.click('#nav');
          await waitStyled(page, 'dd-sub');
          await sleep(700);

          return { probes: ['dd-sub'], trigger: 'click' };
        },
        '/',
      ],
      [
        `s3-int-${when}`,
        async (page) => {
          await waitFor(page, when);
          await page.click('#ph');
          await waitStyled(page, 'c-int');
          await sleep(700);

          return { probes: ['c-int'], trigger: 'click' };
        },
      ],
      [
        `s3-view-${when}`,
        async (page) => {
          await waitFor(page, when);
          const t = await page.evaluate(() => {
            const t = performance.now();
            document.getElementById('vph').scrollIntoView();

            return t;
          });
          await waitStyled(page, 'dd-sub');
          await waitStyled(page, 'vbtn');
          await sleep(700);

          return { probes: ['vbtn', 'dd-sub'], trigger: 'scroll', triggerT: t };
        },
      ],
      [
        `s4-pane-${when}`,
        async (page) => {
          await waitFor(page, when);
          await page.click('#open-pane');
          await waitStyled(page, 'pane');
          await sleep(700);

          return { probes: ['pane'], trigger: 'click' };
        },
      ],
    ]),
  ),
  's5-pane-early-menu-late': async (page) => {
    await waitFor(page, 'early');
    await page.click('#open-pane');
    await waitStyled(page, 'pane');
    await waitFor(page, 'late');
    await page.click('#show-menu');
    await waitStyled(page, 'dd2-sub');
    await sleep(700);

    return { probes: ['pane', 'dd2-sub'], trigger: 'click' };
  },
};

const PATHS = { s1: '/', s2: '/', s3: '/defer', s4: '/', s5: '/' };

async function runOnce(browser, optName, scenario) {
  const opt = OPTIONS[optName];
  const chunks = carrierChunks(opt.dist);
  const context = await browser.newContext({ viewport: { width: 412, height: 823 } });
  const page = await context.newPage();
  await page.addInitScript({ content: WV_SOURCE });
  await page.addInitScript(recorder);

  if (profile === 'slow4g4x') {
    await applySlow4g(context, page);
  }

  if (profile === 'delay300') {
    // server.ts delays every family style file for this cookie; the HTTP cache and preloads stay on.
    await context.addCookies([{ name: 'nfs-delay', value: '300', url: `http://localhost:${opt.port}` }]);
  }

  const carrierRequests = [];
  page.on('requestfinished', async (req) => {
    if (isCarrier(chunks)(req.url())) {
      const timing = req.timing();
      carrierRequests.push({
        file: new URL(req.url()).pathname.slice(1),
        start: timing.startTime,
        end: timing.responseEnd,
      });
    }
  });

  const url = `http://localhost:${opt.port}${PATHS[scenario.slice(0, 2)]}`;
  // Not 'load': Firefox and WebKit hold the load event for dynamic imports started before it.
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const meta = await SCENARIOS[scenario](page);
  // Let web-vitals see a hidden page so CLS and INP report their final values.
  const data = await readPage(page);
  await context.close();

  return { option: optName, scenario, engine: engineName, profile, meta, carrierRequests, ...data };
}

let browser = await engines[engineName].launch();
const out = [];
const scenarios = only.length ? only : Object.keys(SCENARIOS);
const started = Date.now();

// Warm-up: one discarded landing load per option (the first load of a fresh browser is slow).
for (const opt of Object.keys(OPTIONS)) {
  await runOnce(browser, opt, 's1-load').catch(() => {});
}

for (let r = 0; r < runs; r++) {
  for (const scenario of scenarios) {
    for (const opt of Object.keys(OPTIONS)) {
      let timer;

      try {
        const t1 = Date.now();
        // A hung page (seen once in WebKit) never answers page.evaluate: give up on the run.
        const guard = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('run timed out after 120 s')), 120_000);
        });
        out.push({ run: r, ...(await Promise.race([runOnce(browser, opt, scenario), guard])) });
        if (process.env.VERBOSE) console.log(opt, scenario, Date.now() - t1, "ms");
      } catch (e) {
        out.push({ run: r, option: opt, scenario, error: String(e).slice(0, 300) });
        console.error(opt, scenario, String(e).slice(0, 200));

        if (String(e).includes('timed out after 120 s')) {
          // Start a fresh browser so one hung page cannot stall the rest.
          await Promise.race([browser.close().catch(() => {}), sleep(10_000)]);
          browser = await engines[engineName].launch();
        }
      } finally {
        clearTimeout(timer);
      }
    }
  }

  console.log(`${engineName} ${profile}: run ${r + 1}/${runs} done after ${Math.round((Date.now() - started) / 1000)} s`);
}

await browser.close();
mkdirSync(join(import.meta.dirname, '..', 'out'), { recursive: true });
writeFileSync(
  join(import.meta.dirname, '..', 'out', `vitals-${engineName}-${profile}${process.env.TAG ?? ''}.json`),
  JSON.stringify(out, null, 1),
);
