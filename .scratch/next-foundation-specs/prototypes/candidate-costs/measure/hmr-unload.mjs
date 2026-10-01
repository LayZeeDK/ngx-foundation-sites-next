// PROTOTYPE 198, point 1 follow-up: after a settings edit is applied by the dev server, does the
// family still unload? Client-only callouts on /lifecycle (no dehydrated instance to hold it).
// Usage: node measure-198/hmr-unload.mjs <own|link|chunk>
import { chromium, firefox, webkit } from 'playwright';
import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const setups = {
  own: { dir: 'D:/tmp/nfs-proto-198-188', target: 'fixture:serve', port: 4821 },
  link: { dir: 'D:/tmp/nfs-proto-198-189', target: 'fixture:serve', port: 4822 },
  chunk: { dir: 'D:/tmp/nfs-proto-198-192', target: 'fixture:serve', port: 4823 },
};
const name = process.argv[2];
const { dir, target, port } = setups[name];
const base = `http://localhost:${port}`;
const settingsFile = `${dir}/apps/fixture/src/foundation-settings/_settings.scss`;
const setRem = (rem) =>
  writeFileSync(
    settingsFile,
    readFileSync(settingsFile, 'utf8').replace(
      /^\$callout-sizes: .*$/m,
      `$callout-sizes: (small: 0.5rem, default: ${rem}rem, large: 3rem); // default 1rem`,
    ),
  );
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
setRem('2.75');

let log = '';
const child = spawn(process.execPath, ['node_modules/nx/dist/bin/nx.js', 'run', target], {
  cwd: dir,
  env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true', FORCE_COLOR: '0' },
});
child.stdout.on('data', (d) => (log += d));
child.stderr.on('data', (d) => (log += d));

for (;;) {
  try {
    if ((await fetch(`${base}/lifecycle`)).ok) {
      break;
    }
  } catch {
    // not yet
  }

  await sleep(200);
}

const head = () =>
  [...document.head.querySelectorAll('style, link[rel="stylesheet"]')]
    .filter((e) => /nfs-callout|\.callout\{|\.callout \{|nfs\.callout/.test((e.getAttribute('href') ?? '') + (e.textContent ?? '')) || e.getAttribute('data-nfs-family') === 'callout')
    .map((e) => `${e.tagName.toLowerCase()}${e.hasAttribute('data-nfs-family') ? '[owned]' : ''}${e.getAttribute('href') ? ' ' + e.getAttribute('href').replace(/\?.*/, '?…') : ''}`);
const padding = () => {
  const el = document.querySelector('.c-item') ?? document.body.appendChild(Object.assign(document.createElement('div'), { className: 'callout' }));

  return getComputedStyle(el).paddingTop;
};
const results = [];
let rem = '2.75';

for (const [engineName, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  const page = await browser.newPage();
  await page.goto(`${base}/lifecycle`, { waitUntil: 'load' });
  await sleep(1000);
  await page.click('#add');
  await sleep(800);
  const row = { engine: engineName, before: await page.evaluate(padding), headBefore: await page.evaluate(head) };
  await page.evaluate(() => (window.__sentinel = true));
  rem = rem === '2.75' ? '3.5' : '2.75';
  setRem(rem);
  const want = rem === '3.5' ? '56px' : '44px';
  await page
    .waitForFunction((w) => getComputedStyle(document.querySelector('.c-item')).paddingTop === w, want, { timeout: 20000 })
    .catch(() => null);
  await sleep(1500);
  row.afterEdit = await page.evaluate(padding);
  row.reloaded = await page.evaluate(() => window.__sentinel !== true);
  row.headAfterEdit = await page.evaluate(head);

  if (row.reloaded) {
    // A reload dropped the callout; add it back so the unload has something to release.
    await page.click('#add');
    await sleep(800);
  }

  await page.click('#remove');
  await sleep(800);
  row.probeAfterRemove = await page.evaluate(padding);
  row.headAfterRemove = await page.evaluate(head);
  // And once more: add and remove again.
  await page.click('#add');
  await sleep(800);
  row.secondAdd = await page.evaluate(padding);
  await page.click('#remove');
  await sleep(800);
  row.probeAfterSecondRemove = await page.evaluate(padding);
  row.headAfterSecondRemove = await page.evaluate(head);
  console.log(name, JSON.stringify(row));
  results.push(row);
  await browser.close();
}

try {
  execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: 'ignore' });
} catch {
  // gone
}

setRem('2.75');
mkdirSync('D:/tmp/nfs-proto-198-189/out-198', { recursive: true });
writeFileSync(`D:/tmp/nfs-proto-198-189/out-198/hmr-unload-${name}.json`, JSON.stringify(results, null, 1));
