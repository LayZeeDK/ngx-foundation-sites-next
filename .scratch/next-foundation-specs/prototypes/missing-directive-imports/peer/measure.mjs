// Runs every case against the four SSR builds (aria/ngp x dev/prod), server-rendered
// and client-only, in Chromium, and records what each reports. Usage: node measure.mjs [out.json] [build prefix]
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const BUILDS = [
  ['aria-dev', 5490],
  ['aria-prod', 5491],
  ['ngp-dev', 5492],
  ['ngp-prod', 5493],
];
const CASES = [
  'ok', 'acc-no-accordion', 'acc-no-item', 'acc-no-title', 'acc-family',
  'menu-no-root', 'menu-no-item', 'menu-no-toggle', 'menu-family', 'button', 'css-attr',
  'defer', 'defer-hydrate-ok', 'defer-hydrate-no-item', 'if-whole', 'if-leaf', 'for',
  'outlet', 'outlet-across', 'projected-ok', 'projected-no-item', 'external',
];
// A click after the first settle: shows the @if content, or hydrates the @defer block.
const ACTIONS = {
  'if-whole': '#show',
  'if-leaf': '#show',
  'defer-hydrate-ok': 'text=First',
  'defer-hydrate-no-item': 'text=First',
};

function short(text) {
  return text.replace(/\s+/g, ' ').replace(/https:\/\/\S+/g, '<link>').slice(0, 1000);
}

async function startServer(name, port) {
  const server = spawn(process.execPath, [`dist/${name}/server/server.mjs`], {
    env: { ...process.env, PORT: String(port), NG_ALLOWED_HOSTS: "localhost" },
  });
  const log = [];
  const collect = (chunk) => log.push(...chunk.toString().split('\n').filter((l) => l.trim()));
  server.stdout.on('data', collect);
  server.stderr.on('data', collect);

  for (let i = 0; i < 50 && !log.some((l) => l.includes('listening')); i++) {
    await sleep(100);
  }

  return { server, log };
}

const results = [];
const browser = await chromium.launch();

const out = process.argv[2] ?? 'results.json';
const only = process.argv[3];

for (const [name, port] of BUILDS.filter(([b]) => !only || b.startsWith(only))) {
  const { server, log } = await startServer(name, port);

  for (const id of CASES) {
    for (const mode of ['ssr', 'csr']) {
      const page = await browser.newPage();
      const messages = [];
      page.on('console', (m) => {
        if (m.type() === 'warning' || m.type() === 'error') {
          messages.push({ phase: 'load', type: m.type(), text: short(m.text()) });
        }
      });
      page.on('pageerror', (e) => messages.push({ phase: 'load', type: 'pageerror', text: short(e.message) }));

      const logStart = log.length;
      const path = mode === 'ssr' ? `/${id}` : `/csr/${id}`;
      const response = await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle' });
      const html = await response.text();
      await sleep(600);

      const probe = await page.evaluate(() => {
        const items = [...document.querySelectorAll('[nfsaccordionitem]')];

        return { text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 60), items: items.length, knownItems: items.filter((el) => window.ng?.getOwningComponent?.(el) !== null).length };
      });

      let after = null;

      if (ACTIONS[id]) {
        messages.forEach((m) => (m.phase = 'load'));
        const before = messages.length;
        await page.locator(ACTIONS[id]).first().click({ timeout: 3000 }).catch((e) => messages.push({ phase: 'action', type: 'click-failed', text: short(e.message) }));
        await sleep(800);
        messages.slice(before).forEach((m) => (m.phase = 'after-click'));
        after = await page.evaluate(() => {
          const items = [...document.querySelectorAll('[nfsaccordionitem]')];

          return { text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 60), items: items.length, knownItems: items.filter((el) => window.ng?.getOwningComponent?.(el) !== null).length };
        });
      }

      results.push({
        build: name,
        id,
        mode,
        status: response.status(),
        ssrHasAccordionMarkup: html.includes('nfsaccordion') || html.includes('nfsAccordion'),
        serverLog: log.slice(logStart).map(short).slice(0, 6),
        messages,
        probe,
        after,
      });
      await page.close();
    }
  }

  server.kill();
}

await browser.close();
writeFileSync(out, JSON.stringify(results, null, 2));
console.log(`wrote ${out} (${results.length} runs)`);
