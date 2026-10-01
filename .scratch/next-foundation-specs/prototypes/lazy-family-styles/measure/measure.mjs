// PROTOTYPE: measurements 1-4, 6-8, 10 against the three production SSR servers (serve.sh).
// Usage: node measure/measure.mjs [chromium|firefox|webkit ...]
import { chromium, firefox, webkit } from 'playwright';
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';

const LAZY = 'http://localhost:4611';
const EAGER = 'http://localhost:4612';
const UNLAYERED = 'http://localhost:4613';
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

/** In-page: count <style> elements per family (identified by their first rule). */
function familyCounts() {
  const firsts = {
    button: '.button{',
    callout: '.callout{',
    menu: '.menu{',
    'dropdown-menu': '.dropdown.menu>li.opens-left',
  };
  const counts = { button: 0, callout: 0, menu: 0, 'dropdown-menu': 0 };
  const order = [];

  for (const s of document.querySelectorAll('style')) {
    const text = s.textContent.replace(/^@layer nfs\.[\w-]+\{/, '');

    for (const [family, first] of Object.entries(firsts)) {
      if (text.startsWith(first)) {
        counts[family]++;
        order.push(family);
      }
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
              text: (n.textContent || n.getAttribute('href') || '').slice(0, 40),
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
  await page.waitForLoadState('networkidle');
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

async function m1Settings(browser) {
  const page = await browser.newPage();
  await page.goto(`${LAZY}/ssr`);
  await settled(page);
  const got = {
    calloutPadding: await css(page, '#c-hydrated', 'paddingTop'),
    buttonBg: await css(page, '#btn', 'backgroundColor'),
    buttonRadius: await css(page, '#btn', 'borderTopLeftRadius'),
    buttonPaddingLeft: await css(page, '#btn', 'paddingLeft'),
    menuLinkPaddingTop: await css(page, '#menu a', 'paddingTop'),
    submenuBg: await css(page, '#dd-sub', 'backgroundColor'),
  };
  await page.close();
  // px values within 0.05 px: Firefox and WebKit report sub-pixel layout units (31.6938px).
  const same = (a, b) =>
    a === b || (a.endsWith('px') && Math.abs(parseFloat(a) - parseFloat(b)) < 0.05);
  const pass = Object.entries(EXPECT).every(([k, v]) => same(got[k], v));

  return { pass, got };
}

async function m2Lifecycle(browser) {
  const page = await browser.newPage();
  await page.goto(`${LAZY}/lifecycle`);
  await settled(page);
  const steps = [];
  const step = async (label, click, wait = 300) => {
    if (click) {
      await page.click(click);
    }

    await sleep(wait);
    steps.push({ label, callout: (await page.evaluate(familyCounts)).callout });
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
  const htmlRes = await fetch(`${LAZY}/lifecycle`);
  const html = await htmlRes.text();

  return {
    pass: steps.every((s, i) => s.callout === want[i]),
    steps,
    serverHtmlHasCalloutRules: html.includes('.callout{'),
  };
}

/** Measurement 6: three leave-animation scenarios under each unload mode. */
async function m6Leave(browser) {
  const out = {};

  for (const mode of ['immediate', 'animations', 'private', 'repair']) {
    const run = async (name, fn) => {
      const page = await browser.newPage();
      await page.goto(`${LAZY}/lifecycle?unload=${mode}`);
      await settled(page);
      out[`${mode}/${name}`] = await fn(page);
      await page.close();
    };
    const count = async (page) => (await page.evaluate(familyCounts)).callout;
    // Then add and remove once more: a lost decrement shows as a style that never goes away.
    const recheck = async (page) => {
      const cycles = [];

      for (let i = 0; i < 2; i++) {
        await page.click('#add');
        await sleep(300);
        const styledWhenReAdded = await css(page, '.c-item', 'paddingTop');
        await page.click('#remove');
        await sleep(1500);
        cycles.push(`${styledWhenReAdded}/${await count(page)}`);
      }

      return cycles.join(' ');
    };

    await run('L1 callout inside leaving element', async (page) => {
      await page.click('#leaving');
      await sleep(300);
      await page.click('#leaving'); // starts the 600 ms leave
      await sleep(250);
      const duringLeave = {
        wrapperInDom: await page.evaluate(() => !!document.getElementById('leaving-wrap')),
        calloutPadding: await css(page, '#leaving-callout', 'paddingTop'),
        styles: await count(page),
      };
      await sleep(1500);
      const afterLeave = await count(page);

      return { duringLeave, afterLeave, afterRecheck: await recheck(page) };
    });

    await run('L2 unrelated leave running', async (page) => {
      await page.click('#other');
      await page.click('#add');
      await sleep(300);
      await page.click('#other'); // unrelated leave starts
      await page.click('#remove'); // last callout destroyed during it
      await sleep(1500);
      const afterLeave = await count(page);

      return { afterLeave, afterRecheck: await recheck(page) };
    });

    await run('L3 (animate.leave) listener on the page', async (page) => {
      await page.click('#listener');
      await page.click('#add');
      await sleep(300);
      await page.click('#remove');
      await sleep(1500);
      const whileListenerPresent = await count(page);
      await page.click('#listener'); // the listener element leaves
      await sleep(1500);
      const afterListenerLeft = await count(page);

      return { whileListenerPresent, afterListenerLeft, afterRecheck: await recheck(page) };
    });
  }

  return out;
}

/** Measurement 3 (full and incremental hydration) and 7 (dehydrated instances). */
async function m3m7Ssr(browser, contextOptions, hold) {
  const html = await (await fetch(`${LAZY}/ssr`)).text();
  const serverCounts = Object.fromEntries(
    ['button', 'callout', 'menu', 'dropdown-menu'].map((f) => [
      f,
      html.split(`<style ng-app-id="ng">@layer nfs.${f}{`).length - 1,
    ]),
  );

  // No JavaScript: what the server HTML alone paints.
  const noJs = await browser.newContext({ ...contextOptions, javaScriptEnabled: false });
  const p0 = await noJs.newPage();
  await p0.goto(`${LAZY}/ssr`);
  const noJsCallout = await css(p0, '#c-hydrated', 'paddingTop');
  const noJsDeferred = await css(p0, '#c-deferred', 'paddingTop');
  const noJsSubmenu = await css(p0, '#dd-sub', 'display');
  await noJs.close();

  const ctx = await browser.newContext(contextOptions);
  const page = await ctx.newPage();
  await page.addInitScript(recorder, { 'c-hydrated': 'paddingTop', 'c-deferred': 'paddingTop' });
  await page.goto(`${LAZY}/ssr${hold ? '' : '?hold=off'}`);
  await settled(page);
  const afterHydration = await page.evaluate(familyCounts);
  const muts = await page.evaluate(() => window.__muts.filter((m) => m.afterDcl));
  const frames = await page.evaluate(() => window.__frames);
  const unstyledFrames = frames.filter(
    (f) => (f['c-hydrated'] && f['c-hydrated'] !== '44px') || (f['c-deferred'] && f['c-deferred'] !== '44px'),
  ).length;

  // Measurement 7: destroy the last hydrated callout while the deferred one is still dehydrated.
  await page.click('#toggle-hydrated');
  await sleep(800);
  const m7 = {
    stylesWhileDehydratedRemains: (await page.evaluate(familyCounts)).callout,
    dehydratedPadding: await css(page, '#c-deferred', 'paddingTop'),
  };
  await page.click('#c-deferred'); // hydrate on interaction
  await sleep(800);
  m7.afterHydratingDeferred = (await page.evaluate(familyCounts)).callout;
  m7.mutationsAtIncrementalHydration = await page.evaluate(
    () => window.__muts.filter((m) => m.afterDcl).length,
  );
  await page.click('#toggle-deferred');
  await sleep(800);
  m7.afterLastDestroyed = (await page.evaluate(familyCounts)).callout;
  // Measurement 8: a plain .callout element after the unload; any leftover copy would style it.
  m7.probeAfterUnload = await page.evaluate(() => {
    const d = document.createElement('div');
    d.className = 'callout';
    document.body.append(d);

    return getComputedStyle(d).paddingTop;
  });
  await ctx.close();

  // 7b: the dehydrated block removed before it ever hydrates.
  const ctx2 = await browser.newContext(contextOptions);
  const page2 = await ctx2.newPage();
  await page2.goto(`${LAZY}/ssr${hold ? '' : '?hold=off'}`);
  await settled(page2);
  await page2.click('#toggle-hydrated');
  await sleep(500);
  await page2.click('#toggle-deferred');
  await sleep(800);
  const m7b = {
    deferredInDom: await page2.evaluate(() => !!document.getElementById('c-deferred')),
    stylesAfterDehydratedRemoved: (await page2.evaluate(familyCounts)).callout,
  };
  await ctx2.close();

  return {
    serverCounts,
    noJs: { noJsCallout, noJsDeferred, noJsSubmenu },
    afterHydration,
    styleMutationsAfterDcl: muts,
    unstyledFrames,
    framesSampled: frames.length,
    m7,
    m7b,
  };
}

/** Measurement 3, client-only @defer: frames where the callout is in the DOM but unstyled. */
async function m3ClientDefer(browser, base, delayMs) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  if (delayMs) {
    await page.route(/chunk-.*\.js$/, async (route) => {
      await sleep(delayMs);
      await route.continue();
    });
  }

  await page.addInitScript(recorder, { 'c-client': 'paddingTop' });
  await page.goto(`${base}/client-defer`);
  await settled(page);
  await page.click('#ph');
  await sleep(delayMs + 1000);
  const frames = await page.evaluate(() => window.__frames.filter((f) => f['c-client'] !== null));
  const counts = await page.evaluate(familyCounts);
  await ctx.close();

  return {
    framesWithElement: frames.length,
    unstyledFrames: frames.filter((f) => f['c-client'] !== '44px').length,
    firstValues: frames.slice(0, 3).map((f) => f['c-client']),
    calloutStyles: counts.callout,
  };
}

/** Measurement 4: submenu computed style in each load order, layered and unlayered. */
async function m4Order(browser) {
  const out = {};

  for (const [build, base] of [
    ['layered', LAZY],
    ['unlayered', UNLAYERED],
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

      return r;
    };
    const server = async (path, sub) => {
      const page = await browser.newPage();
      await page.addInitScript(recorder, { [sub.slice(1)]: 'display' });
      await page.goto(`${base}${path}`);
      await settled(page);
      const r = await read(page, sub);
      const frames = await page.evaluate(() => window.__frames);
      r.framesDisplay = [...new Set(frames.map((f) => Object.values(f)[1]))].join(',');
      await page.close();

      return r;
    };
    out[build] = {
      'client: menu sheet first': await client(['#show-dd'], '#dd-sub'),
      'client: dropdown-menu sheet first': await client(['#show-ddr'], '#ddr-sub'),
      'client: plain menu, then dropdown-menu first': await client(['#show-menu', '#show-ddr'], '#ddr-sub'),
      'server: menu sheet first': await server('/order-ssr-normal', '#dd-sub'),
      'server: dropdown-menu sheet first': await server('/order-ssr-reversed', '#ddr-sub'),
    };
  }

  return out;
}

/** Measurement 8: where Beasties' inlined critical CSS sits and whether it starts with @layer. */
async function m8Beasties() {
  const html = await (await fetch(`${LAZY}/ssr`)).text();
  const head = html.slice(0, html.indexOf('</head>'));
  const styles = [...head.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)].map((m) => ({
    attrs: m[1].trim(),
    start: m[2].slice(0, 90),
    length: m[2].length,
  }));
  const linkAt = head.indexOf('<link rel="stylesheet"');
  const firstStyleAt = head.indexOf('<style');

  // Is each server <style> the carrier's whole compiled CSS, or did critical-CSS inlining prune it?
  const dir = new URL('../dist/apps/fixture/browser/', import.meta.url);
  const compiled = readdirSync(dir)
    .map((f) => readFileSync(new URL(f, dir), 'utf8').match(/styles:\[`([^`]*)`\]/)?.[1])
    .filter(Boolean);
  const serverTexts = [...head.matchAll(/<style ng-app-id="ng">([\s\S]*?)<\/style>/g)].map((m) => m[1]);

  return {
    familyStylesEqualCompiledCss: serverTexts.map((t) => compiled.includes(t)),
    firstStyle: styles[0],
    firstStyleBeforeStylesheetLink: firstStyleAt < linkAt,
    familyStylesAfterIt: styles.slice(1).map((s) => `${s.attrs} ${s.start.slice(0, 30)} [${s.length}]`),
    link: head.slice(linkAt, head.indexOf('>', linkAt) + 1),
  };
}

/** Measurement 10: one carrier per instance against one per family, eager build. */
async function m10Bench(browser, n) {
  const page = await browser.newPage();
  await page.goto(`${EAGER}/bench?n=${n}`);
  await settled(page);
  const cdp = browser.browserType().name() === 'chromium' ? await page.context().newCDPSession(page) : null;
  const heap = async () => {
    if (!cdp) {
      return null;
    }

    await cdp.send('HeapProfiler.collectGarbage');

    return (await cdp.send('Runtime.getHeapUsage')).usedSize;
  };
  const time = (sel) =>
    page.evaluate(async (s) => {
      const t0 = performance.now();
      document.querySelector(s).click();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      return performance.now() - t0;
    }, sel);
  const res = { family: { create: [], destroy: [], heap: [] }, instance: { create: [], destroy: [], heap: [] } };
  const base = await heap();

  for (let rep = 0; rep < 5; rep++) {
    for (const mode of ['family', 'instance']) {
      res[mode].create.push(await time(`#${mode}`));
      const h = await heap();
      res[mode].heap.push(h === null ? null : h - base);
      res[mode].styles = (await page.evaluate(familyCounts)).callout;
      res[mode].destroy.push(await time('#none'));
    }
  }

  await page.close();
  const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

  return Object.fromEntries(
    Object.entries(res).map(([k, v]) => [
      k,
      {
        createMs: Math.round(median(v.create)),
        destroyMs: Math.round(median(v.destroy)),
        heapKb: v.heap[0] === null ? null : Math.round(median(v.heap) / 1024),
        stylesWhileRendered: v.styles,
      },
    ]),
  );
}

const results = { beasties: await m8Beasties() };

for (const name of wanted) {
  const browser = await engines[name].launch();
  const r = {};
  r.m1 = await m1Settings(browser);
  r.m2 = await m2Lifecycle(browser);
  r.m3m7 = await m3m7Ssr(browser, {}, true);
  r.m3m7_holdOff = await m3m7Ssr(browser, {}, false);
  r.m3ClientDefer = {
    'lazy carrier, cached': await m3ClientDefer(browser, LAZY, 0),
    'lazy carrier, chunk delayed 300 ms': await m3ClientDefer(browser, LAZY, 300),
    'eager carrier': await m3ClientDefer(browser, EAGER, 0),
  };
  r.m4 = await m4Order(browser);
  r.m6 = await m6Leave(browser);
  r.m10 = { n1000: await m10Bench(browser, 1000), n5000: await m10Bench(browser, 5000) };
  results[name] = r;
  await browser.close();
  console.log(`done ${name}`);
}

mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
writeFileSync(new URL('../out/results.json', import.meta.url), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
