// PROTOTYPE 198, point 3: two Angular applications on one document (`/multi`), sharing a family
// (both show a callout) and not sharing one (A a button, B a menu). Three engines.
// Needs serve-198.sh. Usage: node measure-198/multi.mjs [chromium|firefox|webkit ...]
import { chromium, firefox, webkit } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const candidates = { own: 'http://localhost:4811', link: 'http://localhost:4812', chunk: 'http://localhost:4813' };
const engines = { chromium, firefox, webkit };
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(engines);

// Probes outside both applications show whether a family's CSS applies to the document at all.
const addProbes = () => {
  const probes = document.createElement('div');
  probes.id = 'probes';
  probes.innerHTML =
    '<div class="callout" id="p-callout">p</div><a class="button" id="p-button">p</a>' +
    '<ul class="menu" id="p-menu"><li><a href="#">p</a></li></ul>';
  document.body.appendChild(probes);
};

const state = () => {
  const cs = (sel, prop) => {
    const el = document.querySelector(sel);

    return el ? getComputedStyle(el)[prop] : '-';
  };
  const s = window.__nfsStats ?? {};

  return {
    // What applies: 44px callout, rgb(163, 0, 30) button, 19.2px menu link padding.
    aCallout: cs('nfs-multi-a .m-callout', 'paddingTop'),
    bCallout: cs('nfs-multi-b .m-callout', 'paddingTop'),
    aButton: cs('nfs-multi-a .m-button', 'backgroundColor'),
    bButton: cs('nfs-multi-b .m-button', 'backgroundColor'),
    bMenu: cs('nfs-multi-b .m-menu a', 'paddingTop'),
    probeCallout: cs('#p-callout', 'paddingTop'),
    probeButton: cs('#p-button', 'backgroundColor'),
    probeMenu: cs('#p-menu a', 'paddingTop'),
    // The engine's own state: family elements and stylesheets in the document.
    familyElements: [...document.querySelectorAll('[data-nfs-family]')].map(
      (e) => `${e.tagName.toLowerCase()}:${e.getAttribute('data-nfs-family')}`,
    ),
    styleSheets: document.styleSheets.length,
    adopted: document.adoptedStyleSheets.length,
    unloads: s.unloads ?? 0,
  };
};

const settle = (page) => page.waitForTimeout(400);

async function scenario(page, base, kind) {
  await page.goto(`${base}/multi`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__multi?.B);
  await page.evaluate(addProbes);
  const steps = [];
  const step = async (label, fn) => {
    if (fn) {
      await page.evaluate(fn);
    }

    await settle(page);
    steps.push({ label, ...(await page.evaluate(state)) });
  };

  await step('both started, nothing shown');

  if (kind === 'shared') {
    await step('A shows callout', () => window.__multi.A.callout.set(true));
    await step('B shows callout', () => window.__multi.B.callout.set(true));
    await step('A hides callout (B still shows)', () => window.__multi.A.callout.set(false));
    await step('A shows callout again', () => window.__multi.A.callout.set(true));
    await step('A destroyed (B still shows)', () => window.__multi.a.destroy());
    await step('B hides callout', () => window.__multi.B.callout.set(false));
    await step('B shows callout again', () => window.__multi.B.callout.set(true));
    await step('B destroyed', () => window.__multi.b.destroy());
  } else {
    await step('A shows button', () => window.__multi.A.button.set(true));
    await step('B shows menu', () => window.__multi.B.menu.set(true));
    await step('A destroyed (B still shows menu)', () => window.__multi.a.destroy());
    await step('B shows button', () => window.__multi.B.button.set(true));
    await step('B hides button and menu', () => {
      window.__multi.B.button.set(false);
      window.__multi.B.menu.set(false);
    });
    await step('B destroyed', () => window.__multi.b.destroy());
  }

  return steps;
}

mkdirSync('D:/tmp/nfs-proto-198-189/out-198', { recursive: true });

for (const engineName of wanted) {
  const browser = await engines[engineName].launch();
  const results = [];

  for (const [candidate, base] of Object.entries(candidates)) {
    for (const kind of ['shared', 'not-shared']) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
      const steps = await scenario(page, base, kind);
      results.push({ engine: engineName, candidate, kind, steps, errors });
      console.log(engineName, candidate, kind);

      for (const s of steps) {
        console.log('  ', JSON.stringify(s));
      }

      if (errors.length) {
        console.log('   errors', errors);
      }

      await context.close();
    }
  }

  await browser.close();
  writeFileSync(`D:/tmp/nfs-proto-198-189/out-198/multi-${engineName}.json`, JSON.stringify(results, null, 1));
}
