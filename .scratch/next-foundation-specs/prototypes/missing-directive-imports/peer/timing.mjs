// Times 50 renders of /csr/big (500 accordion items) in each development build.
// Usage: node timing.mjs (starts and stops the servers itself)
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();

for (const [name, port] of [['aria-dev', 5496], ['ngp-dev', 5497]]) {
  const server = spawn(process.execPath, [`dist/${name}/server/server.mjs`], {
    env: { ...process.env, PORT: String(port), NG_ALLOWED_HOSTS: 'localhost' },
  });
  await sleep(1500);
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/csr/big`, { waitUntil: 'networkidle' });
  const ms = await page.evaluate(async () => {
    const button = document.querySelector('#tick');
    const times = [];

    for (let i = 0; i < 50; i++) {
      const start = performance.now();
      button.click();
      // A click schedules change detection; wait until the rendered count moves.
      while (!button.textContent.includes(`Tick ${i + 1}`)) {
        await new Promise((r) => setTimeout(r, 0));
      }
      times.push(performance.now() - start);
    }

    times.sort((a, b) => a - b);

    return { median: times[25].toFixed(2), p90: times[45].toFixed(2) };
  });
  console.log(name, 'ms per render (median, p90):', ms.median, ms.p90);
  await page.close();
  server.kill();
}

await browser.close();
