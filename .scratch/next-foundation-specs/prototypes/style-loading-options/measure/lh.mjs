// PROTOTYPE (ticket 190): Lighthouse 13.5.0 mobile on the server-rendered landing page, per option.
// Throttling: `simulate` (Lighthouse's default mobile score), `devtools` (Slow 4G and 4x CPU applied),
// `provided` (unthrottled). Chromium 153 from Playwright, headless.
// Usage: [OPTS=A,B] node measure/lh.mjs [runs] [method ...]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { OPTIONS } from './common.mjs';

const [runsArg = '5', ...methodsArg] = process.argv.slice(2);
const runs = Number(runsArg);
const methods = methodsArg.length ? methodsArg : ['simulate', 'devtools', 'provided'];
const launch = () =>
  chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-first-run', '--disable-gpu'],
  });
let chrome = await launch();
let crashes = 0;

/** Lighthouse's tab crashed now and then on this machine (TARGET_CRASHED): relaunch and retry. */
async function audit(url, method) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await lighthouse(url, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility'],
        throttlingMethod: method,
      });
    } catch (e) {
      crashes++;
      console.error(url, method, String(e).slice(0, 120));
      await chrome.kill();
      chrome = await launch();

      if (attempt === 2) {
        return null;
      }
    }
  }
}
const out = [];
const num = (lhr, id) => lhr.audits[id]?.numericValue ?? null;

for (let r = 0; r < runs; r++) {
  for (const method of methods) {
    for (const [name, opt] of Object.entries(OPTIONS)) {
      const url = `http://localhost:${opt.port}/`;
      const result = await audit(url, method);

      if (!result?.lhr?.categories?.performance?.score) {
        out.push({ run: r, method, option: name, error: result?.lhr?.runtimeError?.code ?? 'failed' });
        continue;
      }

      const lhr = result.lhr;
      const bootup = lhr.audits['bootup-time']?.details?.items ?? [];
      const requests = lhr.audits['network-requests']?.details?.items ?? [];
      const blocking = lhr.audits['render-blocking-insight'] ?? lhr.audits['render-blocking-resources'];
      out.push({
        run: r,
        method,
        option: name,
        performance: lhr.categories.performance.score,
        accessibility: lhr.categories.accessibility.score,
        fcp: num(lhr, 'first-contentful-paint'),
        lcp: num(lhr, 'largest-contentful-paint'),
        tbt: num(lhr, 'total-blocking-time'),
        cls: num(lhr, 'cumulative-layout-shift'),
        si: num(lhr, 'speed-index'),
        tti: num(lhr, 'interactive'),
        bytes: num(lhr, 'total-byte-weight'),
        mainThread: num(lhr, 'mainthread-work-breakdown'),
        bootup: bootup.map((i) => ({
          url: String(i.url).replace(url, ''),
          total: i.total,
          scripting: i.scripting,
          parse: i.scriptParseCompile,
        })),
        requests: requests.map((i) => ({
          url: String(i.url).replace(url, ''),
          type: i.resourceType,
          transfer: i.transferSize,
          size: i.resourceSize,
          start: i.networkRequestTime,
          end: i.networkEndTime,
        })),
        renderBlocking: (blocking?.details?.items ?? []).map((i) => ({
          url: String(i.url).replace(url, ''),
          wasted: i.wastedMs,
        })),
      });
    }
  }

  console.log(`lighthouse: run ${r + 1}/${runs} done (${crashes} retries so far)`);
}

await chrome.kill();
mkdirSync(join(import.meta.dirname, '..', 'out'), { recursive: true });
writeFileSync(join(import.meta.dirname, '..', 'out', `lighthouse${process.env.TAG ?? ''}.json`), JSON.stringify(out, null, 1));
