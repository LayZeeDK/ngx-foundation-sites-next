// PROTOTYPE (ticket 188): every unload mode, in 184's three leave scenarios plus SSR checks.
// Usage: node measure/measure-188.mjs <chromium|firefox|webkit> [mode ...]
// Server: NG_ALLOWED_HOSTS=localhost PORT=4621 node dist/apps/fixture/server/server.mjs
import { chromium, firefox, webkit } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4621';
const engines = { chromium, firefox, webkit };
const [engine, ...modeArgs] = process.argv.slice(2);
const MODES = modeArgs.length
  ? modeArgs
  : ['immediate', 'animations', 'private', 'repair', 'host', 'host-animations', 'after-render',
     'retry', 'own-style', 'adopted', 'own-link'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Init script: per frame, whether the callout family applies, and the leaving callout's padding. */
function recorder() {
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
            window.__muts.push({ kind, t: Math.round(performance.now() - t0), afterDcl: window.__dcl !== null });
          }
        }
      }
    }
  }).observe(document, { childList: true, subtree: true });
  const pad = (el) => (el ? getComputedStyle(el).paddingTop : null);
  const tick = () => {
    window.__frames.push({
      t: Math.round(performance.now()),
      probe: pad(document.getElementById('probe')),
      leaving: pad(document.getElementById('leaving-callout')),
      wrap: !!document.getElementById('leaving-wrap'),
      item: pad(document.querySelector('.c-item')),
      hydrated: pad(document.getElementById('c-hydrated')),
      deferred: pad(document.getElementById('c-deferred')),
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** In page: every place the callout family's CSS lives (style, link, adopted sheet). */
function copies() {
  const styles = [...document.querySelectorAll('style')].filter((s) =>
    s.textContent.includes('@layer nfs.callout{'),
  ).length;
  const links = [...document.querySelectorAll('link[rel=stylesheet]')].filter(
    (l) => l.href.includes('nfs-callout.css') && !l.closest('noscript'),
  ).length;
  const adopted = document.adoptedStyleSheets.filter((s) =>
    [...s.cssRules].some((r) => r.name === 'nfs.callout'),
  ).length;

  return { styles, links, adopted, total: styles + links + adopted };
}

/** A fresh plain .callout: 44px means some copy of the family CSS still applies. */
const probe = (page) =>
  page.evaluate(() => {
    const d = document.createElement('div');
    d.className = 'callout';
    document.body.appendChild(d);
    const v = getComputedStyle(d).paddingTop;
    d.remove();

    return v;
  });
const applied = async (page) => (await probe(page)) === '44px';

async function open(browser, path) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(recorder);
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState('networkidle');
  await sleep(400);

  return { ctx, page };
}

// After a scenario, add and remove a callout twice: a lost decrement shows as CSS that stays.
async function recheck(page) {
  const out = [];

  for (let i = 0; i < 2; i++) {
    await page.click('#add');
    await sleep(300);
    const styled = await page.evaluate(() => getComputedStyle(document.querySelector('.c-item')).paddingTop);
    await page.click('#remove');
    await sleep(1500);
    out.push(`${styled}/${(await applied(page)) ? 'stays' : 'gone'}`);
  }

  return out.join(' ');
}

async function scenarios(browser, mode) {
  const r = {};
  const q = `?unload=${mode}`;

  // L1: callout inside an element with animate.leave (600 ms) is removed.
  {
    const { ctx, page } = await open(browser, `/lifecycle${q}`);
    await page.click('#leaving');
    await sleep(300);
    const tClick = await page.evaluate(() => performance.now());
    await page.click('#leaving');
    await sleep(2000);
    const f = await page.evaluate(() => window.__frames);
    const after = f.filter((x) => x.t >= tClick - 50);
    const leaveFrames = after.filter((x) => x.leaving !== null);
    const wrapGone = after.find((x) => !x.wrap)?.t ?? null;
    const unloadAt = after.find((x) => x.probe !== '44px')?.t ?? null;
    r.L1 = {
      framesWithLeavingCallout: leaveFrames.length,
      unstyledDuringLeave: leaveFrames.filter((x) => x.leaving !== '44px').length,
      leaveMs: wrapGone === null ? null : Math.round(wrapGone - tClick),
      unloadAfterHostGoneMs: unloadAt === null || wrapGone === null ? null : Math.round(unloadAt - wrapGone),
      unloaded: !(await applied(page)),
      recheck: await recheck(page),
    };
    await ctx.close();
  }

  // L2: last callout destroyed while an unrelated element runs its leave animation.
  {
    const { ctx, page } = await open(browser, `/lifecycle${q}`);
    await page.click('#other');
    await page.click('#add');
    await sleep(300);
    await page.click('#other');
    const tRemove = await page.evaluate(() => performance.now());
    await page.click('#remove');
    await sleep(1500);
    const f = await page.evaluate(() => window.__frames);
    const unloadAt = f.find((x) => x.t >= tRemove && x.probe !== '44px')?.t ?? null;
    r.L2 = {
      unloadAfterDestroyMs: unloadAt === null ? null : Math.round(unloadAt - tRemove),
      unloaded: !(await applied(page)),
      recheck: await recheck(page),
    };
    await ctx.close();
  }

  // L3: last callout destroyed while an element with an (animate.leave) listener is present.
  {
    const { ctx, page } = await open(browser, `/lifecycle${q}`);
    await page.click('#listener');
    await page.click('#add');
    await sleep(300);
    await page.click('#remove');
    await sleep(1500);
    const whileListenerPresent = !(await applied(page));
    await page.click('#listener');
    await sleep(1500);
    r.L3 = {
      unloadedWhileListenerPresent: whileListenerPresent,
      unloadedAfterListenerLeft: !(await applied(page)),
      recheck: await recheck(page),
      retries: await page.evaluate(() => window.__nfsRetries ?? 0),
    };
    await ctx.close();
  }

  // Client-only first render: frames where the new callout is in the DOM but unstyled.
  {
    const { ctx, page } = await open(browser, `/lifecycle${q}`);
    const t = await page.evaluate(() => performance.now());
    await page.click('#add');
    await sleep(800);
    const f = (await page.evaluate(() => window.__frames)).filter((x) => x.t >= t && x.item !== null);
    r.clientFirstRender = { unstyledFrames: f.filter((x) => x.item !== '44px').length, of: f.length };
    await ctx.close();
  }

  // SSR, full hydration: one server-rendered callout (?n=1).
  {
    const html = await (await fetch(`${BASE}/lifecycle${q}&n=1`)).text();
    const head = html.slice(0, html.indexOf('</head>'));
    const firstStyle = head.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
    const ctxNoJs = await browser.newContext({ javaScriptEnabled: false });
    const p0 = await ctxNoJs.newPage();
    await p0.goto(`${BASE}/lifecycle${q}&n=1`);
    const noJs = await p0.evaluate(() => getComputedStyle(document.querySelector('.c-item')).paddingTop);
    await ctxNoJs.close();

    const { ctx, page } = await open(browser, `/lifecycle${q}&n=1`);
    const f = await page.evaluate(() => window.__frames);
    const muts = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl));
    const afterHydration = await page.evaluate(copies);
    await page.click('#remove');
    await sleep(1500);
    r.ssrFull = {
      serverHtml: {
        angularStyle: (head.match(/<style ng-app-id="ng">@layer nfs\.callout\{/g) ?? []).length,
        ownStyle: (head.match(/<style data-nfs-family="callout"/g) ?? []).length,
        ownLink: (head.match(/<link[^>]*nfs-callout\.css[^>]*>/g) ?? []).length,
        beastiesCopiedCalloutRules: /[}{,]\.callout\b/.test(firstStyle),
      },
      noJsPadding: noJs,
      styleMutationsAfterDcl: muts.length,
      unstyledFrames: f.filter((x) => x.item !== null && x.item !== '44px').length,
      framesSampled: f.length,
      copiesAfterHydration: afterHydration,
      unloadedAfterRemove: !(await applied(page)),
    };
    await ctx.close();
  }

  // Incremental hydration: /ssr has a callout in @defer (hydrate on interaction).
  {
    const { ctx, page } = await open(browser, `/ssr${q}`);
    const dehydrated = await page.evaluate(() => getComputedStyle(document.getElementById('c-deferred')).paddingTop);
    const mutsBefore = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl).length);
    await page.click('#toggle-hydrated');
    await sleep(800);
    const whileOnlyDehydrated = await page.evaluate(() => getComputedStyle(document.getElementById('c-deferred')).paddingTop);
    await page.click('#c-deferred');
    await sleep(800);
    const mutsAtHydration = (await page.evaluate(() => window.__muts.filter((m) => m.afterDcl).length)) - mutsBefore;
    const copiesAfter = await page.evaluate(copies);
    await page.click('#toggle-deferred');
    await sleep(1500);
    r.ssrIncremental = {
      dehydratedPadding: dehydrated,
      mutationsAtBootstrap: mutsBefore,
      paddingWhileOnlyDehydratedRemains: whileOnlyDehydrated,
      mutationsAtIncrementalHydration: mutsAtHydration,
      copiesAfterHydration: copiesAfter,
      probeAfterLastDestroyed: await probe(page),
      copiesAfterLastDestroyed: await page.evaluate(copies),
    };
    await ctx.close();
  }

  return r;
}

const browser = await engines[engine].launch();
const results = { engine, version: browser.version(), modes: {} };

for (const mode of MODES) {
  results.modes[mode] = await scenarios(browser, mode);
  console.log(`${engine} ${mode}`, JSON.stringify(results.modes[mode]));
}

await browser.close();
mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
writeFileSync(new URL(`../out/results-188${process.env.TAG ?? ''}-${engine}.json`, import.meta.url), JSON.stringify(results, null, 2));
