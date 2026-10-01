// PROTOTYPE 198, point 1: the dev server (`nx serve`, Angular's Vite dev server) per candidate.
// Cold start (no .angular/cache), warm start, then a Foundation settings edit and a component
// template edit: time until the page shows the change, and whether it needed a full reload.
// Timing in Chromium; one edit of each kind in Firefox and WebKit to see whether they differ.
// Usage: node measure-198/devserver.mjs <own|link|chunk|baseline> [coldStarts] [edits]
// Do not run it while bench.mjs runs: both are timing measurements.
import { chromium, firefox, webkit } from 'playwright';
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const setups = {
  own: { dir: 'D:/tmp/nfs-proto-198-188', target: 'fixture:serve', port: 4821 },
  link: { dir: 'D:/tmp/nfs-proto-198-189', target: 'fixture:serve', port: 4822 },
  chunk: { dir: 'D:/tmp/nfs-proto-198-192', target: 'fixture:serve', port: 4823 },
  // No loader: every family in the injected global stylesheet (189 copy, `development-baseline`).
  baseline: { dir: 'D:/tmp/nfs-proto-198-189', target: 'fixture:serve-baseline', port: 4824 },
};
const name = process.argv[2];
const coldStarts = Number(process.argv[3] ?? 5);
const edits = Number(process.argv[4] ?? 5);
const { dir, target, port } = setups[name];
const base = `http://localhost:${port}`;
const settingsFile = `${dir}/apps/fixture/src/foundation-settings/_settings.scss`;
const componentFile = `${dir}/apps/fixture/src/app/ssr-page.ts`;
const settingsLine = (rem) => `$callout-sizes: (small: 0.5rem, default: ${rem}rem, large: 3rem); // default 1rem`;
const padding = { '2.75': '44px', '3.5': '56px' };

let log = '';

function start() {
  log = '';
  const child = spawn(process.execPath, ['node_modules/nx/dist/bin/nx.js', 'run', target], {
    cwd: dir,
    env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true', FORCE_COLOR: '0' },
  });
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));

  return child;
}

function stop(child) {
  try {
    execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: 'ignore' });
  } catch {
    // already gone
  }
}

async function waitReady(t0) {
  for (;;) {
    try {
      const response = await fetch(`${base}/ssr`);
      const body = await response.text();

      if (response.ok && body.includes('hmr-marker')) {
        return Date.now() - t0;
      }
    } catch {
      // not listening yet
    }

    if (Date.now() - t0 > 180000) {
      throw new Error(`not ready after 180 s:\n${log.slice(-2000)}`);
    }

    await new Promise((r) => setTimeout(r, 100));
  }
}

const results = { name, cold: [], warm: [], edits: [] };

// Every element in <head> that carries callout CSS: the library's own, and any copy HMR made.
const headState = () =>
  [...document.head.querySelectorAll('style, link[rel="stylesheet"]')]
    .filter((e) => e.hasAttribute('data-nfs-family') ? e.getAttribute('data-nfs-family') === 'callout' : /nfs-callout|\.callout\{|\.callout \{|nfs\.callout/.test(e.getAttribute('href') ?? e.textContent))
    .map((e) => `${e.tagName.toLowerCase()}${e.hasAttribute('data-nfs-family') ? '[owned]' : ''}${e.getAttribute('href') ? ' ' + e.getAttribute('href') : ''}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Restore the edited files whatever happened last time.
const restore = () => {
  writeFileSync(settingsFile, readFileSync(settingsFile, 'utf8').replace(/^\$callout-sizes: .*$/m, settingsLine('2.75')));
  writeFileSync(componentFile, readFileSync(componentFile, 'utf8').replace(/<p id="hmr-marker">v\d+<\/p>/, '<p id="hmr-marker">v0</p>'));
};
restore();

for (const kind of ['cold', 'warm']) {
  const runs = kind === 'cold' ? coldStarts : 3;

  for (let i = 0; i < runs; i++) {
    if (kind === 'cold') {
      rmSync(`${dir}/.angular/cache`, { recursive: true, force: true });
    }

    const t0 = Date.now();
    const child = start();
    const ready = await waitReady(t0);
    const generation = [...log.matchAll(/generation complete\. \[([\d.]+) seconds\]/g)].map((m) => +m[1]);
    results[kind].push({ readyMs: ready, bundleSeconds: generation });
    console.log(name, kind, i, `ready ${ready} ms`, generation);
    stop(child);
    await sleep(1500);
  }
}

// Edits against one running server.
const child = start();
await waitReady(Date.now());
const engines = [
  ['chromium', chromium, edits],
  ['firefox', firefox, 1],
  ['webkit', webkit, 1],
];
let rem = '2.75';
let marker = 0;

for (const [engineName, engine, count] of engines) {
  const browser = await engine.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => results.edits.push({ engine: engineName, pageerror: String(e).slice(0, 200) }));
  await page.goto(`${base}/ssr`, { waitUntil: 'load' });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#c-hydrated')).paddingTop !== '');
  await sleep(1500);
  const initial = await page.evaluate(() => getComputedStyle(document.querySelector('#c-hydrated')).paddingTop);
  console.log(engineName, 'initial callout padding', initial);

  for (let i = 0; i < count; i++) {
    for (const edit of ['settings', 'component']) {
      await page.evaluate(() => (window.__sentinel = true));
      const logStart = log.length;
      let expect;
      const t0 = Date.now();

      if (edit === 'settings') {
        rem = rem === '2.75' ? '3.5' : '2.75';
        expect = padding[rem];
        writeFileSync(settingsFile, readFileSync(settingsFile, 'utf8').replace(/^\$callout-sizes: .*$/m, settingsLine(rem)));
      } else {
        marker++;
        expect = `v${marker}`;
        writeFileSync(componentFile, readFileSync(componentFile, 'utf8').replace(/<p id="hmr-marker">v\d+<\/p>/, `<p id="hmr-marker">v${marker}</p>`));
      }

      const read =
        edit === 'settings'
          ? () => getComputedStyle(document.querySelector('#c-hydrated')).paddingTop
          : () => document.querySelector('#hmr-marker')?.textContent;
      let shown = false;

      try {
        await page.waitForFunction(([fn, want]) => new Function(`return (${fn})()`)() === want, [read.toString(), expect], {
          timeout: 20000,
          polling: 25,
        });
        shown = true;
      } catch {
        // not shown without a reload
      }

      const ms = Date.now() - t0;
      const reloaded = await page.evaluate(() => window.__sentinel !== true).catch(() => true);
      await sleep(1500); // let the dev server finish logging
      const out = log.slice(logStart);
      const row = {
        engine: engineName,
        edit,
        expect,
        shown,
        ms: shown ? ms : null,
        reloaded,
        rebuildSeconds: [...out.matchAll(/generation complete\. \[([\d.]+) seconds\]/g)].map((m) => +m[1]),
        sent: [...out.matchAll(/(Page reload sent|Component update sent|Stylesheet update sent|Updated [^\n]*|HMR[^\n]*)/g)].map((m) => m[1]),
      };

      if (!shown) {
        // Did the build produce it? Reload and look again.
        await page.reload({ waitUntil: 'load' });
        await sleep(1500);
        row.afterManualReload = await page.evaluate(new Function(`return (${read.toString()})()`));
      }

      row.head = await page.evaluate(headState);
      results.edits.push(row);
      console.log(JSON.stringify(row));
    }
  }

  // After the edits: remove every callout on the page. Does any callout CSS outlive them?
  await page.click('#toggle-hydrated');
  await page.click('#toggle-deferred');
  await sleep(800);
  const after = await page.evaluate(() => {
    const probe = document.body.appendChild(document.createElement('div'));
    probe.className = 'callout';

    return getComputedStyle(probe).paddingTop;
  });
  results.edits.push({ engine: engineName, unloadAfterEdits: after, head: await page.evaluate(headState) });
  console.log(engineName, 'probe callout after all callouts left:', after, JSON.stringify(await page.evaluate(headState)));

  await browser.close();
}

stop(child);
restore();
mkdirSync('D:/tmp/nfs-proto-198-189/out-198', { recursive: true });
writeFileSync(`D:/tmp/nfs-proto-198-189/out-198/devserver-${name}.json`, JSON.stringify(results, null, 1));
