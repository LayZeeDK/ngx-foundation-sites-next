// PROTOTYPE 197, proposal D: does `?gate=1` ever mark server-rendered content during hydration?
// Usage: node measure/probe-d-hydration.mjs   (all three engines; 4791 link build, 4793 file build)
import { chromium, firefox, webkit } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { settled, sleep } from './lib-189.mjs';

const out = {};

for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  out[name] = {};

  for (const base of ['http://localhost:4791', 'http://localhost:4793']) {
    for (const path of ['/ssr?gate=1', '/hydrate-defer?gate=1']) {
      const page = await browser.newPage();
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 120)));
      await page.addInitScript(() => {
        window.__pending = 0;
        window.__frames = 0;
        const tick = () => {
          window.__frames++;
          window.__pending += document.querySelectorAll('[data-nfs-pending]').length;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await page.goto(base + path);
      await settled(page);

      if (path.startsWith('/hydrate-defer')) {
        await page.evaluate(() => document.getElementById('c-vp').scrollIntoView());
        await sleep(600);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.click('#c-int');
        await sleep(600);
      } else {
        await page.click('#c-deferred');
        await sleep(600);
      }

      out[name][`${base} ${path}`] = {
        framesSampled: await page.evaluate(() => window.__frames),
        pendingHostFrames: await page.evaluate(() => window.__pending),
        consoleErrors: errors,
      };
      await page.close();
    }
  }

  await browser.close();
}

mkdirSync('out', { recursive: true });
writeFileSync('out/probe-d-hydration.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
