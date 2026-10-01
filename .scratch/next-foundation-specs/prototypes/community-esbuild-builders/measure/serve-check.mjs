// PROTOTYPE 193: `ng serve` check. Loads /ssr and /client-defer from the dev server in Chromium,
// reports console errors, the owned <style> elements, and the consumer settings; with `--edit`, also
// edits the settings file, waits for the rebuild, reloads, and restores the file.
// Usage: BASE=http://localhost:4732 node measure/serve-check.mjs [--edit]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4732';
const SETTINGS = new URL('../src/foundation-settings/_settings.scss', import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 300)));
page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));

async function read(path) {
  const html = await (await fetch(`${BASE}${path}`)).text();
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await sleep(500);

  if (path === '/client-defer') {
    await page.click('#ph').catch((e) => errors.push(`click: ${e.message.slice(0, 120)}`));
    await sleep(1000);
  }

  return page.evaluate((serverStyles) => {
    const pad = (sel) => {
      const el = document.querySelector(sel);

      return el ? getComputedStyle(el).paddingTop : null;
    };

    return {
      serverStyles,
      families: [...document.head.querySelectorAll('[data-nfs-family]')].map((e) => e.getAttribute('data-nfs-family')),
      calloutPadding: pad('#c-hydrated') ?? pad('#c-client'),
      buttonBg: (() => {
        const b = document.querySelector('#btn');

        return b ? getComputedStyle(b).backgroundColor : null;
      })(),
    };
  }, [...html.matchAll(/<style data-nfs-family="([\w-]+)"/g)].map((m) => m[1]));
}

const out = { ssr: await read('/ssr'), clientDefer: await read('/client-defer') };

if (process.argv.includes('--edit')) {
  const original = readFileSync(SETTINGS, 'utf8');
  writeFileSync(SETTINGS, original.replace('default: 2.75rem', 'default: 3.5rem'));
  const t0 = Date.now();
  let after;

  try {
    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      after = await read('/ssr');

      if (after.calloutPadding === '56px') {
        break;
      }
    }
  } finally {
    writeFileSync(SETTINGS, original);
  }

  out.afterSettingsEdit = { ...after, secondsUntilSeen: Math.round((Date.now() - t0) / 1000) };
}

out.errors = errors;
await browser.close();
console.log(JSON.stringify(out, null, 1));
