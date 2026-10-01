// PROTOTYPE 197, proposal E: the plugin's `file` loader (hashed CSS asset URL inserted as a <link>).
// Usage: node measure/probe-e.mjs <chromium|firefox|webkit>
// Needs serve.sh running (4791 link, 4793-4796 file builds). Starts its own server on 4798 for the
// cache-busting swap.
import { chromium, firefox, webkit } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { css, hydrateDefer, m1Settings, m2Lifecycle, m3m7Ssr, m6Leave, settled, sleep, urls } from './lib-189.mjs';

const engines = { chromium, firefox, webkit };
const engine = process.argv[2] ?? 'chromium';
const FILE = {
  production: 'http://localhost:4793',
  subpath: 'http://localhost:4794/sub',
  cdn: 'http://localhost:4795',
  i18nDa: 'http://localhost:4796/da',
  i18nEn: 'http://localhost:4796/en-US',
  // Attempt 2: the URL resolved against the global stylesheet's directory (`protoFilePrefix`).
  'prefix production': 'http://localhost:4801',
  'prefix subpath': 'http://localhost:4802/sub',
  'prefix cdn': 'http://localhost:4803',
  'prefix i18nDa': 'http://localhost:4804/da',
  'prefix i18nEn': 'http://localhost:4804/en-US',
};
const LINK = 'http://localhost:4791';

/** Point 3 of 189 plus where each family CSS request went and what it returned. */
async function urlsAndRequests(browser, base) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const seen = [];
  page.on('response', (r) => {
    if (/nfs-[\w-]+\.css/.test(r.url())) {
      seen.push(`${r.status()} ${r.headers()['content-type']} ${r.url()}`);
    }
  });
  await page.goto(`${base}/ssr`);
  await settled(page);
  await ctx.close();

  return { ...(await urls(browser, base)), ssrCssResponses: [...new Set(seen)].sort() };
}

function startServer(dir, port) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [`dist/apps/${dir}/server/server.mjs`], {
      env: { ...process.env, PORT: String(port), NG_ALLOWED_HOSTS: 'localhost,127.0.0.1' },
    });
    child.stdout.on('data', (d) => String(d).includes('listening') && resolve(child));
    child.on('error', reject);
  });
}

const stop = (child) => new Promise((resolve) => (child.on('exit', resolve), child.kill()));

/** Cache busting: the same browser context reloads after the served build changes one setting. */
async function cacheBust(browser) {
  const port = 4798 + Object.keys(engines).indexOf(engine); // 4798-4800, one per engine
  const base = `http://localhost:${port}`;
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const read = async () => ({
    padding: await css(page, '#c-hydrated', 'paddingTop'),
    href: await page.evaluate(() => document.head.querySelector('link[data-nfs-family="callout"]')?.getAttribute('href')),
  });
  let server = await startServer('fixture-file', port);
  await page.goto(`${base}/ssr`);
  await settled(page);
  const before = await read();
  await stop(server);
  server = await startServer('fixture-file-cachebust', port);
  await page.reload();
  await settled(page);
  const afterSwap = await read();
  await stop(server);
  await ctx.close();

  return { before, afterSwap, pass: before.padding === '44px' && afterSwap.padding === '56px' };
}

const browser = await engines[engine].launch();
const out = { engine, settings: {}, urls: {} };

for (const [name, base] of Object.entries(FILE)) {
  out.settings[name] = await m1Settings(browser, base);
  out.urls[name] = await urlsAndRequests(browser, base);
}

out.cacheBust = await cacheBust(browser);
out.lifecycle = { file: await m2Lifecycle(browser, FILE.production), link: await m2Lifecycle(browser, LINK) };
out.ssr = { file: await m3m7Ssr(browser, FILE.production, true), link: await m3m7Ssr(browser, LINK, true) };
out.hydrateDefer = { file: await hydrateDefer(browser, FILE.production), link: await hydrateDefer(browser, LINK) };
out.leave = { file: await m6Leave(browser, FILE.production, ['host']), link: await m6Leave(browser, LINK, ['host']) };
await browser.close();
mkdirSync('out', { recursive: true });
writeFileSync(`out/probe-e-${engine}.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
await sleep(0);
