// PROTOTYPE (ticket 190): accessibility while a family's CSS is missing, against the styled state.
// The family style files are held (Playwright route) from the trigger until the "flash" state has
// been measured, then released, and the same page is measured styled. axe-core 4.13.0.
// Usage: node measure/a11y.mjs <engine> [runs]   (options A and L by default; OPTS=A,L)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { carrierChunks, engines, isCarrier, OPTIONS, sleep } from './common.mjs';

const [engineName = 'chromium', runsArg = '3'] = process.argv.slice(2);
const runs = Number(runsArg);
const AXE = readFileSync(join(import.meta.dirname, '..', 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const options = process.env.OPTS ? OPTIONS : { A: OPTIONS.A, L: OPTIONS.L };

const SCENARIOS = {
  // A client-side navigation to a page with families the landing page did not use.
  's2-nav': {
    path: '/',
    trigger: (page) => page.click('#nav'),
    target: '#dd-sub',
    styled: () => getComputedStyle(document.getElementById('dd-sub')).display === 'none',
    hidden: ['Closed child A', 'Closed child B', 'A link in the closed pane'],
  },
  // A client-only @defer (on viewport) block with a dropdown menu and a button.
  's3-view': {
    path: '/defer',
    trigger: (page) => page.evaluate(() => document.getElementById('vph').scrollIntoView()),
    target: '#dd-sub',
    styled: () => getComputedStyle(document.getElementById('dd-sub')).display === 'none',
    hidden: ['Closed child A'],
  },
  // A first click that inserts a dropdown pane.
  's4-pane': {
    path: '/',
    trigger: (page) => page.click('#open-pane'),
    target: '#pane',
    styled: () => getComputedStyle(document.getElementById('pane')).position === 'absolute',
    hidden: [],
  },
};

/** In-page: geometry, focus styles, and transitions of the scenario's region. */
function inspect() {
  const main = document.querySelector('main');
  const controls = [...main.querySelectorAll('a, button')].map((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);

    return {
      text: el.textContent.trim().slice(0, 30),
      w: Math.round(r.width * 10) / 10,
      h: Math.round(r.height * 10) / 10,
      visible: r.width > 0 && r.height > 0 && s.visibility !== 'hidden',
    };
  });
  const rect = (id) => {
    const el = document.getElementById(id);

    if (!el) {
      return null;
    }

    const r = el.getBoundingClientRect();

    return { top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
  };

  return {
    controls,
    after: rect('after'),
    pane: rect('pane'),
    dd: rect('dd'),
    sub: rect('dd-sub'),
    vbtn: rect('vbtn'),
    transitions: document
      .getAnimations()
      .filter((a) => a.constructor.name === 'CSSTransition')
      .map((a) => `${a.effect?.target?.id || a.effect?.target?.nodeName}:${a.transitionProperty}`),
  };
}

/** Tab through the page from the top; record each focused control and its focus indicator. */
async function tabWalk(page, max = 14) {
  // Start sequential focus navigation from the heading, the same way in both states.
  await page.locator('h1').click();
  const steps = [];

  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const step = await page.evaluate(() => {
      const el = document.activeElement;

      if (!el || el === document.body) {
        return null;
      }

      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();

      return {
        text: el.textContent.trim().slice(0, 30),
        outline: `${s.outlineStyle} ${s.outlineWidth}`,
        shadow: s.boxShadow !== 'none',
        onScreen: r.width > 0 && r.height > 0 && s.visibility !== 'hidden',
      };
    });

    if (!step) {
      break;
    }

    steps.push(step);
  }

  return steps;
}

async function measureState(page, scenario) {
  const aria = await page.locator('main').ariaSnapshot();
  await page.evaluate(AXE);
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    });

    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  });

  return {
    ...(await page.evaluate(inspect)),
    hiddenInAria: scenario.hidden.filter((t) => aria.includes(t)),
    axe,
    tab: await tabWalk(page),
    aria,
  };
}

async function runOnce(browser, optName, name, reducedMotion) {
  const opt = options[optName];
  const scenario = SCENARIOS[name];
  const chunks = carrierChunks(opt.dist);
  const context = await browser.newContext({ viewport: { width: 412, height: 823 }, reducedMotion });
  const page = await context.newPage();
  let holding = false;
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route(isCarrier(chunks), async (route) => {
    if (holding) {
      await gate;
    }

    await route.continue();
  });
  await page.goto(`http://localhost:${opt.port}${scenario.path}`, { waitUntil: 'networkidle' });
  await sleep(300);
  holding = true;
  await scenario.trigger(page);
  await page.locator(scenario.target).waitFor({ state: 'attached' });
  await sleep(100);
  const flash = { styled: await page.evaluate(scenario.styled), ...(await measureState(page, scenario)) };
  // Release, then catch the moment the CSS applies, for transitions started by its arrival.
  release();
  await page.waitForFunction(scenario.styled, null, { polling: 'raf', timeout: 10_000 });
  const arrival = await page.evaluate(inspect);
  await sleep(600);
  const styled = { styled: await page.evaluate(scenario.styled), ...(await measureState(page, scenario)) };
  await context.close();

  return { option: optName, scenario: name, engine: engineName, reducedMotion, flash, arrivalTransitions: arrival.transitions, styled };
}

const browser = await engines[engineName].launch();
const out = [];

for (let r = 0; r < runs; r++) {
  for (const name of Object.keys(SCENARIOS)) {
    for (const optName of Object.keys(options)) {
      for (const reducedMotion of ['no-preference', 'reduce']) {
        try {
          out.push({ run: r, ...(await runOnce(browser, optName, name, reducedMotion)) });
        } catch (e) {
          out.push({ run: r, option: optName, scenario: name, reducedMotion, error: String(e).slice(0, 300) });
          console.error(optName, name, String(e).slice(0, 200));
        }
      }
    }
  }
}

await browser.close();
mkdirSync(join(import.meta.dirname, '..', 'out'), { recursive: true });
writeFileSync(join(import.meta.dirname, '..', 'out', `a11y-${engineName}${process.env.TAG ?? ''}.json`), JSON.stringify(out, null, 1));
console.log(`a11y ${engineName}: ${out.length} runs`);
