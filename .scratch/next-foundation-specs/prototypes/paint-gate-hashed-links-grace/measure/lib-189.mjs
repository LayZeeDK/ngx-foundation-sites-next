// PROTOTYPE 197: ticket 189 measurement functions, extracted from measure.mjs (m6Leave takes a base URL).
// Usage: node measure/measure.mjs [chromium|firefox|webkit ...]
import { chromium, firefox, webkit } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = {
  production: 'http://localhost:4691',
  unlayered: 'http://localhost:4692',
  preload: 'http://localhost:4693',
  single: 'http://localhost:4694',
  subpath: 'http://localhost:4695/sub',
  cdn: 'http://localhost:4696',
  i18nDa: 'http://localhost:4697/da',
  i18nEn: 'http://localhost:4697/en-US',
  plugin: 'http://localhost:4698',
  noskip: 'http://localhost:4699',
};
const LAZY = BASE.production;
const engines = { chromium, firefox, webkit };
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(engines);

// Consumer settings -> expected computed values (Foundation defaults in comments).
const EXPECT = {
  calloutPadding: '44px', // 2.75rem; default 16px
  buttonBg: 'rgb(163, 0, 30)', // default rgb(23, 121, 186)
  buttonRadius: '8px', // default 0px
  buttonPaddingLeft: '31.68px', // 2.2em of .button's 0.9rem; default 14.4px
  menuLinkPaddingTop: '19.2px', // 1.2rem; default 11.2px
  submenuBg: 'rgb(253, 243, 208)', // default rgb(255, 255, 255)
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const samePx = (a, b) =>
  a === b || (!!a && a.endsWith('px') && Math.abs(parseFloat(a) - parseFloat(b)) < 0.05);

/** In-page: the library's elements per family (`<link>`, or `<style>` in the plugin build). */
function familyCounts() {
  const counts = { button: 0, callout: 0, menu: 0, 'dropdown-menu': 0, all: 0 };
  const order = [];

  for (const el of document.head.querySelectorAll('[data-nfs-family]')) {
    if (el.tagName === 'STYLE' || el.rel === 'stylesheet') {
      counts[el.dataset.nfsFamily]++;
      order.push(el.dataset.nfsFamily);
    }
  }

  return { ...counts, order: order.join(' > ') };
}

/** Init script: records <style>/<link> mutations and samples computed styles every frame. */
function recorder(sample) {
  const t0 = performance.now();
  window.__muts = [];
  window.__frames = [];
  window.__dcl = null;
  document.addEventListener('DOMContentLoaded', () => (window.__dcl = performance.now() - t0));
  new MutationObserver((records) => {
    for (const r of records) {
      for (const [kind, list] of [
        ['add', r.addedNodes],
        ['remove', r.removedNodes],
      ]) {
        for (const n of list) {
          if (n.nodeName === 'STYLE' || n.nodeName === 'LINK') {
            window.__muts.push({
              kind,
              t: Math.round(performance.now() - t0),
              afterDcl: window.__dcl !== null,
              text: (n.getAttribute('href') || n.textContent || '').slice(0, 40),
            });
          }
        }
      }

      if (r.type === 'attributes' && r.target.nodeName === 'LINK') {
        window.__muts.push({
          kind: `attr ${r.attributeName}`,
          t: Math.round(performance.now() - t0),
          afterDcl: window.__dcl !== null,
          text: r.target.getAttribute('href'),
        });
      }
    }
  }).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['media', 'rel', 'href'],
  });
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
  // A fresh Firefox sometimes never reports networkidle for its first page; fall back to load.
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => page.waitForLoadState('load'));
  await sleep(400);
}

const css = (page, sel, prop) =>
  page.evaluate(
    ([s, p]) => {
      const el = document.querySelector(s);

      return el ? getComputedStyle(el)[p] : null;
    },
    [sel, prop],
  );

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

const settingsPass = (got) => Object.entries(EXPECT).every(([k, v]) => samePx(got[k], v));

/** Measurement 1, for any build. */
async function m1Settings(browser, base) {
  const page = await browser.newPage();
  await page.goto(`${base}/ssr`);
  await settled(page);
  const got = await readSettings(page);
  await page.close();

  return { pass: settingsPass(got), got };
}

/** Measurement 2: count of the callout link over add/remove; server HTML of /lifecycle. */
async function m2Lifecycle(browser, base = LAZY) {
  const page = await browser.newPage();
  const requests = [];
  page.on('request', (r) => {
    if (/nfs-[\w-]+\.css/.test(r.url())) {
      requests.push(r.url().replace(/^.*\//, ''));
    }
  });
  await page.goto(`${base}/lifecycle`);
  await settled(page);
  const steps = [];
  const step = async (label, click, wait = 300) => {
    if (click) {
      await page.click(click);
    }

    await sleep(wait);
    const c = await page.evaluate(familyCounts);
    steps.push({ label, n: c.callout + c.all, padding: await css(page, '.c-item', 'paddingTop') });
  };
  await step('before first instance');
  await step('1 instance', '#add');
  await step('2 instances', '#add');
  await step('1 instance after remove', '#remove');
  await step('0 instances', '#remove', 600);
  await step('re-added', '#add');
  await step('0 again', '#remove', 600);
  await page.close();
  const want = [0, 1, 1, 1, 0, 1, 0];
  const html = await (await fetch(`${base}/lifecycle`)).text();

  return {
    pass: steps.every((s, i) => s.n === want[i]),
    counts: steps.map((s) => s.n).join(' '),
    paddings: steps.map((s) => s.padding).join(' '),
    requests: requests.join(' '),
    serverHtmlHasFamilyElement: /data-nfs-family/.test(html),
  };
}

/** Measurement 6 (point 5): three leave-animation scenarios, immediate and the public wait. */
async function m6Leave(browser, base = LAZY, modes = ["immediate", "animations", "host"]) {
  const out = {};

  for (const mode of modes) {
    const run = async (name, fn) => {
      const page = await browser.newPage();
      await page.goto(`${base}/lifecycle?unload=${mode}`);
      await settled(page);
      out[`${mode}/${name}`] = await fn(page);
      await page.close();
    };
    const count = async (page) => (await page.evaluate(familyCounts)).callout;
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
      // Every frame: is the leaving wrapper in the DOM, the callout's padding, the link count.
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
            links: document.head.querySelectorAll('link[data-nfs-family="callout"]').length,
          });

          if (performance.now() - t0 < 1500) {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      });
      await page.click('#leaving'); // starts the 600 ms leave
      await sleep(250);
      const duringLeave = {
        wrapperInDom: await page.evaluate(() => !!document.getElementById('leaving-wrap')),
        calloutPadding: await css(page, '#leaving-callout', 'paddingTop'),
        links: await count(page),
      };
      await sleep(1500);
      const l1 = await page.evaluate(() => window.__l1);
      const wrapGone = l1.find((f) => !f.wrap)?.t;
      const linkGone = l1.find((f) => f.links === 0)?.t;

      return {
        duringLeave,
        unstyledFramesWhileLeaving: l1.filter((f) => f.wrap && f.pad !== '44px').length,
        linkRemovedMsAfterHostLeft: wrapGone === undefined || linkGone === undefined ? null : linkGone - wrapGone,
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

      return {
        whileListenerPresent,
        afterListenerLeft: await count(page),
        afterRecheck: await recheck(page),
      };
    });
  }

  return out;
}

/** Measurements 3a/3b (point 1), 7, and the 8 probe, for any build. */
async function m3m7Ssr(browser, base, hold) {
  const html = await (await fetch(`${base}/ssr`)).text();
  const head = html.slice(0, html.indexOf('</head>'));
  const serverElements = [
    ...head.replace(/<noscript>[\s\S]*?<\/noscript>/g, '').matchAll(/<(link|style)[^>]*data-nfs-family="([\w-]+)"[^>]*>/g),
  ].map((m) => `${m[1]}:${m[2]}${/media="print"/.test(m[0]) ? '(print)' : ''}`);
  const inlined = head.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const p0 = await noJs.newPage();
  await p0.goto(`${base}/ssr`);
  const noJsSettings = await readSettings(p0);
  const noJsResult = {
    settingsPass: settingsPass(noJsSettings),
    deferred: await css(p0, '#c-deferred', 'paddingTop'),
    submenu: await css(p0, '#dd-sub', 'display'),
  };
  await noJs.close();

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(recorder, {
    'c-hydrated': 'paddingTop',
    'c-deferred': 'paddingTop',
    btn: 'backgroundColor',
  });
  await page.goto(`${base}/ssr${hold ? '' : '?hold=off'}`);
  await settled(page);
  const afterHydration = await page.evaluate(familyCounts);
  const muts = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl));
  const frames = await page.evaluate(() => window.__frames);
  const unstyledFrames = frames.filter(
    (f) =>
      (f['c-hydrated'] && f['c-hydrated'] !== '44px') ||
      (f['c-deferred'] && f['c-deferred'] !== '44px') ||
      (f.btn && f.btn !== EXPECT.buttonBg),
  ).length;

  await page.click('#toggle-hydrated');
  await sleep(800);
  const m7 = {
    linksWhileDehydratedRemains: (await page.evaluate(familyCounts)).callout,
    dehydratedPadding: await css(page, '#c-deferred', 'paddingTop'),
  };
  await page.click('#c-deferred');
  await sleep(800);
  m7.afterHydratingDeferred = (await page.evaluate(familyCounts)).callout;
  m7.mutationsAfterDcl = await page.evaluate(
    () => window.__muts.filter((m) => m.afterDcl && m.kind !== 'attr media').length,
  );
  await page.click('#toggle-deferred');
  await sleep(800);
  m7.afterLastDestroyed = (await page.evaluate(familyCounts)).callout;
  // Measurement 8: a plain .callout after the unload; an inlined critical copy would style it.
  m7.probeAfterUnload = await page.evaluate(() => {
    const d = document.createElement('div');
    d.className = 'callout';
    document.body.append(d);

    return getComputedStyle(d).paddingTop;
  });
  await ctx.close();

  return {
    serverElements: serverElements.join(' '),
    inlinedCriticalHasFamilyRules: /@layer nfs\.(button|callout|menu|dropdown-menu)\{/.test(inlined),
    noJs: noJsResult,
    afterHydration,
    styleMutationsAfterDcl: muts,
    unstyledFrames,
    framesSampled: frames.length,
    m7,
  };
}

/** Client-only @defer (point 1): frames where the callout is in the DOM but unstyled. */
async function m3ClientDefer(browser, base, delayMs, kind) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  if (delayMs) {
    // Server-side delay by cookie (server.ts), so the HTTP cache and preloads behave normally.
    await ctx.addCookies([{ name: `nfs-delay-${kind}`, value: String(delayMs), url: new URL(base).origin }]);
  }

  await page.addInitScript(recorder, { 'c-client': 'paddingTop' });
  await page.goto(`${base}/client-defer`);
  await settled(page);
  await page.click('#ph');
  await sleep(delayMs + 1000);
  const frames = await page.evaluate(() => window.__frames.filter((f) => f['c-client'] !== null));
  const unstyled = frames.filter((f) => f['c-client'] !== '44px');
  await ctx.close();

  return {
    framesWithElement: frames.length,
    unstyledFrames: unstyled.length,
    unstyledMs: unstyled.length ? unstyled.at(-1).t - unstyled[0].t : 0,
    firstValues: frames.slice(0, 3).map((f) => f['c-client']).join(' '),
  };
}

/** Coordinator addition 1: an enter animation whose keyframes ship in the family CSS. */
async function enter(browser, base, target, delayMs, kind, warm) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  if (delayMs) {
    // Server-side delay by cookie (server.ts), so the HTTP cache and preloads behave normally.
    await ctx.addCookies([{ name: `nfs-delay-${kind}`, value: String(delayMs), url: new URL(base).origin }]);
  }

  await page.goto(`${base}/enter`);
  await settled(page);

  if (warm) {
    // Load the family once, then reload: the CSS now comes from the HTTP cache.
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
          cls: el.classList.contains('proto-enter'),
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
  const styled = f.find((x) => x.pad === '44px');
  const animated = f.filter((x) => x.anims > 0 || x.opacity < 0.99);
  const classOn = f.findIndex((x) => x.cls);
  const classGone = classOn < 0 ? undefined : f.slice(classOn).find((x) => !x.cls);

  return {
    verdict: animated.length === 0 ? 'skipped' : animated[0].t - first > 20 ? 'late' : 'on time',
    unstyledFrames: f.filter((x) => x.pad !== '44px').length,
    styledAfterMs: styled ? styled.t - first : null,
    animationStartMs: animated.length ? animated[0].t - first : null,
    animatedFrames: animated.length,
    minOpacity: Math.min(...f.map((x) => x.opacity)),
    classSeen: classOn >= 0,
    classRemovedAfterMs: classGone ? classGone.t - first : null,
  };
}

/** Coordinator addition 2: server-rendered callouts in hydrate-on-viewport/interaction blocks. */
async function hydrateDefer(browser, base) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(recorder, { 'c-int': 'paddingTop', 'c-vp': 'paddingTop' });
  await page.goto(`${base}/hydrate-defer`);
  await settled(page);
  const before = await page.evaluate(familyCounts);
  await page.evaluate(() => document.getElementById('c-vp').scrollIntoView());
  await sleep(800);
  const vpHydrated = await page.evaluate(() => !document.getElementById('c-vp').closest('[ngb]'));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('#c-int');
  await sleep(800);
  const frames = await page.evaluate(() => window.__frames);
  const muts = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl && m.kind !== 'attr media'));
  const after = await page.evaluate(familyCounts);
  await ctx.close();

  return {
    calloutLinksBeforeHydration: before.callout,
    calloutLinksAfter: after.callout,
    framesSampled: frames.length,
    unstyledFrames: frames.filter(
      (f) => (f['c-int'] && f['c-int'] !== '44px') || (f['c-vp'] && f['c-vp'] !== '44px'),
    ).length,
    styleMutationsAfterDcl: muts.length,
    viewportBlockHydrated: vpHydrated,
  };
}

/** Measurement 4: submenu computed style in each load order, layered and unlayered. */
async function m4Order(browser) {
  const out = {};

  for (const [build, base] of [
    ['layered', BASE.production],
    ['unlayered', BASE.unlayered],
  ]) {
    const read = async (page, sub) => ({
      display: await css(page, sub, 'display'),
      position: await css(page, sub, 'position'),
      order: (await page.evaluate(familyCounts)).order,
    });
    const client = async (clicks, sub) => {
      const page = await browser.newPage();
      await page.goto(`${base}/order`);
      await settled(page);

      for (const c of clicks) {
        await page.click(c);
        await sleep(400);
      }

      const r = await read(page, sub);
      await page.close();

      return `${r.display}/${r.position} [${r.order}]`;
    };
    const server = async (path, sub) => {
      const page = await browser.newPage();
      await page.addInitScript(recorder, { [sub.slice(1)]: 'display' });
      await page.goto(`${base}${path}`);
      await settled(page);
      const r = await read(page, sub);
      const frames = await page.evaluate(() => window.__frames);
      await page.close();
      const seen = [...new Set(frames.map((f) => Object.values(f)[1]))].join(',');

      return `${r.display}/${r.position} [${r.order}] frames: ${seen}`;
    };
    out[build] = {
      'client: menu sheet first': await client(['#show-dd'], '#dd-sub'),
      'client: dropdown-menu sheet first': await client(['#show-ddr'], '#ddr-sub'),
      'client: plain menu, then dropdown-menu first': await client(
        ['#show-menu', '#show-ddr'],
        '#ddr-sub',
      ),
      'server: menu sheet first': await server('/order-ssr-normal', '#dd-sub'),
      'server: dropdown-menu sheet first': await server('/order-ssr-reversed', '#ddr-sub'),
    };
  }

  return out;
}

/** Point 3: resolved URLs and whether the sheets apply, server-rendered and client-inserted. */
async function urls(browser, base) {
  const page = await browser.newPage();
  const failed = [];
  page.on('response', (r) => {
    if (r.status() >= 400) {
      failed.push(`${r.status()} ${r.url()}`);
    }
  });
  await page.goto(`${base}/ssr`);
  await settled(page);
  const got = await readSettings(page);
  const serverHrefs = await page.evaluate(() =>
    [...document.head.querySelectorAll('link[data-nfs-family]')].map((l) => l.href),
  );
  await page.goto(`${base}/lifecycle`);
  await settled(page);
  await page.click('#add');
  await sleep(500);
  const clientPadding = await css(page, '.c-item', 'paddingTop');
  const clientHref = await page.evaluate(
    () => document.head.querySelector('link[data-nfs-family]')?.href,
  );
  await page.close();

  return {
    serverRenderedPass: settingsPass(got),
    serverHrefs: [...new Set(serverHrefs.map((h) => h.replace(/[\w-]+\.css$/, '*.css')))].join(' '),
    clientInsertedPadding: clientPadding,
    clientHref,
    failed,
  };
}

/** Point 4: requests and bytes for the family CSS on a cold /ssr load. */
async function cost(browser, base) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const seen = [];
  page.on('requestfinished', async (r) => {
    if (/nfs-[\w-]+\.css/.test(r.url())) {
      const sizes = await r.sizes();
      seen.push(`${r.url().replace(/^.*\//, '')} ${sizes.responseBodySize}`);
    }
  });
  await page.goto(`${base}/ssr`);
  await settled(page);
  await ctx.close();

  return seen.sort().join(', ');
}


export { settled, css, readSettings, settingsPass, familyCounts, recorder, m1Settings, m2Lifecycle, m6Leave, m3m7Ssr, hydrateDefer, urls, cost, sleep };
