// PROTOTYPE probe: does a WebKit drag lose its tail on a plain native range input
// too (engine/harness), or only on the prototype's inputs (design)?
import { chromium, firefox, webkit } from '@playwright/test';

const engines = { chromium, firefox, webkit };
const browser = await engines[process.argv[2] ?? 'webkit'].launch();
const page = await (await browser.newContext({ viewport: { width: 1000, height: 2600 } })).newPage();
await page.goto('http://localhost:4450/');
await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });

async function drag(id, from, to, settle) {
  const box = await page.locator('#' + id).boundingBox();
  const T = 22.4;
  const x = (f) => box.x + T / 2 + f * (box.width - T);
  const y = box.y + box.height / 2;
  await page.mouse.move(x(from), y);
  await page.mouse.down();
  await page.mouse.move(x(to), y, { steps: 12 });

  if (settle) {
    await page.waitForTimeout(100);
  }

  await page.mouse.up();
  return page.locator('#' + id).inputValue();
}

const rows = [];

for (const settle of [false, true]) {
  for (let i = 0; i < 4; i++) {
    const there = await drag(process.argv[3] ?? 'bare', 0.3, 0.9, settle);
    const back = await drag(process.argv[3] ?? 'bare', 0.9, 0.3, settle);
    rows.push(`${process.argv[3] ?? 'bare'} settle=${settle} run ${i}: 0.3->0.9 = ${there} (want 90), back = ${back} (want 30)`);
  }
}

console.log(rows.join('\n'));
await browser.close();
