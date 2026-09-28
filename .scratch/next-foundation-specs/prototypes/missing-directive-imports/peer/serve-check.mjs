// Visits a few cases on a running `ng serve` (port 5495) and prints the browser warnings.
// Usage: npx ng serve (in another shell), then node serve-check.mjs
import { chromium } from '@playwright/test';

const browser = await chromium.launch();

for (const path of ['/acc-no-item', '/csr/acc-no-item', '/defer-hydrate-ok', '/projected-no-item']) {
  const page = await browser.newPage();
  const warnings = [];
  page.on('console', (m) => m.type() === 'warning' && warnings.push(m.text().slice(0, 140)));
  const response = await page.goto(`http://localhost:5495${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  console.log(path, response.status(), JSON.stringify(warnings));
  await page.close();
}

await browser.close();
