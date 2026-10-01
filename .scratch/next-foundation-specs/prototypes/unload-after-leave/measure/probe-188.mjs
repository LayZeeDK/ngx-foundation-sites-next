// PROTOTYPE (ticket 188): side probes on /lifecycle?n=1 per mode, Chromium/Firefox/WebKit.
// 1. every <style>/<link> mutation, before and after DOMContentLoaded (the adopted swap);
// 2. which JS chunks the hydrating page fetches (does adoption skip the carrier chunk?);
// 3. where the family CSS lives after hydration.
import { chromium, firefox, webkit } from 'playwright';

const BASE = 'http://localhost:4621';
const out = {};

for (const [name, type] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await type.launch();

  for (const mode of ['immediate', 'own-style', 'adopted', 'own-link']) {
    const page = await browser.newPage();
    const js = [];
    page.on('response', async (res) => {
      if (res.url().endsWith('.js')) {
        const body = await res.text().catch(() => '');
        js.push(body.includes('@layer nfs.callout') ? 'CALLOUT-CARRIER' : 'other');
      }
    });
    await page.addInitScript(() => {
      window.__all = [];
      new MutationObserver((rs) => {
        for (const r of rs) {
          for (const n of r.removedNodes) {
            if (n.nodeName === 'STYLE') {
              window.__all.push(`remove style ${document.readyState}`);
            }
          }
          for (const n of r.addedNodes) {
            if (n.nodeName === 'STYLE' && document.readyState !== 'loading') {
              window.__all.push(`add style ${document.readyState}`);
            }
          }
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto(`${BASE}/lifecycle?unload=${mode}&n=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    out[`${name} ${mode}`] = {
      mutations: await page.evaluate(() => window.__all),
      jsFetched: js,
      where: await page.evaluate(() => ({
        style: [...document.querySelectorAll('style')]
          .filter((s) => s.textContent.includes('@layer nfs.callout{'))
          .map((s) => [...s.attributes].map((a) => a.name).join(',')),
        adopted: document.adoptedStyleSheets.length,
      })),
    };
    await page.close();
  }

  await browser.close();
}

console.log(JSON.stringify(out, null, 1));
