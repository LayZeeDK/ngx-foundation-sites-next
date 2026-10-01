// PROTOTYPE (ticket 195): under `nx serve fixture` (port 4621), edit a family carrier's .scss and check that the
// stylesheet the dev server swaps in is still filtered by the PostCSS plugin. Chromium only. Restores the file.
import fs from 'node:fs';
import { chromium } from 'playwright';

const FILE = 'apps/fixture/src/nfs-families/callout.scss';
const original = fs.readFileSync(FILE, 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
const log = [];
page.on('console', (m) => log.push(m.text()));
await page.goto('http://localhost:4621/families', { waitUntil: 'networkidle' });

const read = () =>
  page.evaluate(() => {
    const s = [...document.querySelectorAll('style')].map((x) => x.textContent).find((t) => /nfs\.callout\.theme/.test(t.slice(0, 80)));
    const probe = document.createElement('div');
    probe.className = 'nfs-hmr-probe callout';
    document.body.append(probe);
    const cs = getComputedStyle(probe);
    const r = { color: cs.color, position: cs.position, styleCount: document.querySelectorAll('style').length };
    probe.remove();

    return {
      ...r,
      hasMarker: !!s && s.includes('nfs-hmr-probe'),
      // `.callout { position: relative; }` is invariant: filtered out of the theme sheet, carried by the library.
      themeHasInvariant: !!s && /\.callout\s*\{[^}]*position:\s*relative/.test(s),
      themeBytes: s?.length ?? 0,
    };
  });

const before = await read();
const reloads = [];
page.on('framenavigated', (f) => f === page.mainFrame() && reloads.push(f.url()));

try {
  fs.writeFileSync(FILE, original.replace('@include foundation-callout;', '@include foundation-callout;\n  .nfs-hmr-probe { color: rgb(1, 2, 3); }'));
  await page.waitForFunction(() => [...document.querySelectorAll('style')].some((s) => s.textContent.includes('nfs-hmr-probe')), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(500);
  const after = await read();
  console.log(JSON.stringify({ before, after, fullReloads: reloads.length, console: log.filter((l) => /hmr|vite|update/i.test(l)).slice(0, 5) }, null, 1));
} finally {
  fs.writeFileSync(FILE, original);
  await browser.close();
}
