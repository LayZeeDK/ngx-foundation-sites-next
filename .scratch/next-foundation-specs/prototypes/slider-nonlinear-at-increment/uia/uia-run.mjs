// PROTOTYPE -- sets non-linear Slider Handles from outside through UI Automation
// (RangeValuePattern.SetValue) in headed Chromium and Firefox, and records the
// UIA range properties, the DOM events the platform set dispatched, and the
// model value after each set. Usage: node uia/uia-run.mjs [chromium|firefox ...]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const PORT = 4862;
const base = `http://localhost:${PORT}`;
const MARKER = 'NFSAT slider-at-increment';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function startServer() {
  const child = spawn('node', ['dist/slider-proto/server/server.mjs'], { cwd: root, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });

  return child;
}

async function startAgent() {
  const child = spawn('pwsh', ['-NoProfile', '-File', join(here, 'uia-agent.ps1')], { stdio: ['pipe', 'pipe', 'inherit'] });
  let buffer = '';
  let waiting = null;
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (d) => {
    buffer += d;
    const i = buffer.indexOf('<<END>>');

    if (i >= 0 && waiting) {
      const text = buffer.slice(0, i).trim();
      buffer = buffer.slice(i + 7).replace(/^\r?\n/, '');
      const w = waiting;
      waiting = null;
      w(text);
    }
  });
  const next = () => new Promise((r) => (waiting = r));
  await next();

  return {
    async cmd(line) {
      const p = next();
      child.stdin.write(`${line}\n`);
      const text = await p;

      return JSON.parse(text);
    },
    quit() {
      child.stdin.end();
      child.kill();
    },
  };
}

const fmt = (u) => (u.error ? `UIA error ${u.error}` : `UIA value=${u.value} min=${u.min} max=${u.max} small=${u.small} large=${u.large}`);

// [slider name, case id, input id, plan]
const plans = [
  ['nl-any log', 'nl-any', 'nl-any'],
  ['nl log', 'nl', 'nl'],
  ['nl5 log', 'nl5', 'nl5'],
  ['nl-raw log', 'nl-raw', 'nl-raw'],
  ['pow scale', 'pow', 'pow'],
  ['dense-auto log', 'dense-auto', 'dense-auto'],
  ['nld log minimum', 'nld', 'nld-min'],
  ['nld log maximum', 'nld', 'nld-max'],
  ['nld-raw log maximum', 'nld-raw', 'nld-raw-max'],
  ['lin linear minimum', 'lin', 'lin-min'],
];

const server = startServer();
await sleep(1500);
const agent = await startAgent();
const engines = process.argv.slice(2).length ? process.argv.slice(2) : ['chromium', 'firefox'];
mkdirSync(join(here, 'out'), { recursive: true });

for (const engine of engines) {
  const browser =
    engine === 'chromium'
      ? await chromium.launch({ headless: false, args: ['--force-renderer-accessibility'] })
      : await firefox.launch({ headless: false, firefoxUserPrefs: { 'accessibility.force_disabled': 0 } });
  const page = await (await browser.newContext({ viewport: { width: 1000, height: 900 } })).newPage();
  await page.goto(base);
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
  await page.bringToFront();
  await sleep(1000);
  // The agent caches elements by window title, which both engines share.
  await agent.cmd('reset');
  // Warm-up read: the first UIA client request builds the engine's platform tree.
  await agent.cmd(`read ${MARKER}|lin linear maximum`);
  await agent.cmd('reset');
  await sleep(1000);
  const log = [`# UIA RangeValuePattern.SetValue on non-linear Slider Handles -- ${engine} ${browser.version()} (Playwright, headed), Windows 11 ARM64`];
  await page.evaluate(() => {
    window.__events = [];

    for (const el of document.querySelectorAll('input[type=range]')) {
      for (const t of ['input', 'change', 'keydown', 'pointerdown']) {
        el.addEventListener(t, (e) => window.__events.push(`${el.id}:${t}${e.isTrusted ? '' : '(untrusted)'}`));
      }
    }
  });
  const stateOf = async (caseId) => (await page.locator(`[data-case="${caseId}"] [data-state]`).textContent()).trim();
  const events = async () => (await page.evaluate(() => window.__events.splice(0))).join(' ') || '(no DOM events)';
  const set = async (name, caseId, id, value, why) => {
    const u = await agent.cmd(`set ${MARKER}|${name}|${value}`);
    await sleep(100);
    const live = await page.locator(`#${id}`).inputValue();
    log.push(`  set ${value} (${why}): ${fmt(u)}; DOM ${await events()}; live=${live}; ${await stateOf(caseId)}`);

    return u;
  };

  for (const [name, caseId, id] of plans) {
    const u0 = await agent.cmd(`read ${MARKER}|${name}`);
    log.push(`\n## ${name} (#${id}) start: ${fmt(u0)} framework=${u0.framework}; ${await stateOf(caseId)}`);

    if (u0.error) {
      continue;
    }

    // Chromium's increment and decrement add or subtract 1 and reach the same
    // AXSlider::OnNativeSetValueAction as a UIA SetValue; Firefox for Android's
    // add Step() and reach the same HTMLRangeAccessible::SetCurValue.
    let v = u0.value;
    let u = await set(name, caseId, id, v + 1, 'value + 1, the increment arithmetic');
    u = await set(name, caseId, id, u.value - 1, 'value - 1');
    u = await set(name, caseId, id, u.value - 1, 'value - 1');

    if (u0.small > 0) {
      u = await set(name, caseId, id, u.value + u0.small, 'value + SmallChange');
    }

    u = await set(name, caseId, id, u.value + 3, 'value + 3 native units, inside one value step');
    const far = Math.round(u.min + (u.max - u.min) * 0.8);
    u = await set(name, caseId, id, far, 'absolute set, 80 percent of the native range');
    await set(name, caseId, id, u.value, 'the same value again');
  }

  writeFileSync(join(here, 'out', `uia-${engine}.txt`), `${log.join('\n')}\n`, 'utf8');
  console.log(`wrote uia/out/uia-${engine}.txt`);
  await browser.close();
}

agent.quit();
server.kill();
