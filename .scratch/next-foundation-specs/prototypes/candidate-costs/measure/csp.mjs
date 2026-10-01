// PROTOTYPE 198, point 2: each candidate under a strict CSP with a nonce, in three engines.
// Needs serve-198.sh (ports 4811-4813). Usage: node measure-198/csp.mjs [chromium|firefox|webkit ...]
import { chromium, firefox, webkit } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

// `+nonce` rows are the 189 and A builds with the PROTOTYPE 198 switch `nonce=copy` (copy CSP_NONCE, as 188 does).
const candidates = {
  own: ['http://localhost:4811', ''],
  link: ['http://localhost:4812', ''],
  'link+nonce': ['http://localhost:4812', 'nonce=copy'],
  chunk: ['http://localhost:4813', ''],
  'chunk+nonce': ['http://localhost:4813', 'nonce=copy'],
};
const policies = ['none', 'self', 'nonce', 'tt'];
const engines = { chromium, firefox, webkit };
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(engines);

const collect = () => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) =>
    window.__csp.push({
      directive: e.effectiveDirective,
      blocked: e.blockedURI,
      sample: (e.sample || '').slice(0, 40),
    }),
  );
};

const probe = () => {
  const cs = (sel, prop) => {
    const el = document.querySelector(sel);

    return el ? getComputedStyle(el)[prop] : null;
  };

  return {
    bodyBg: cs('body', 'backgroundColor'), // global stylesheet: rgb(254, 254, 254)
    callout: cs('#c-hydrated', 'paddingTop'), // 44px when the family applies
    button: cs('#btn', 'backgroundColor'), // rgb(163, 0, 30)
    submenu: cs('#dd-sub', 'display'), // none
    families: [...document.head.querySelectorAll('[data-nfs-family]')].map(
      (e) => `${e.tagName.toLowerCase()}:${e.getAttribute('data-nfs-family')}:${e.sheet ? 'sheet' : 'nosheet'}`,
    ),
    trustedTypes: typeof window.trustedTypes !== 'undefined',
  };
};

const summarize = (violations) => {
  const out = {};

  for (const v of violations) {
    const kind = v.blocked === 'inline' ? 'inline' : v.blocked.replace(/^https?:\/\/[^/]+\//, '');
    const key = `${v.directive} ${kind.replace(/-[A-Za-z0-9_-]{8}\.(js|css)$/, '-*.$1')}`;
    out[key] = (out[key] ?? 0) + 1;
  }

  return out;
};

async function run(engineName) {
  const browser = await engines[engineName].launch();
  const results = [];

  for (const [candidate, [base, extra]] of Object.entries(candidates)) {
    for (const policy of policies) {
      const params = [policy === 'none' ? '' : `csp=${policy}`, extra].filter(Boolean).join('&');
      const q = params ? `?${params}` : '';
      const row = { engine: engineName, candidate, policy };

      // Server only: JavaScript off, so only what the server HTML carries can apply.
      {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto(`${base}/ssr${q}`, { waitUntil: 'load' });
        await page.waitForTimeout(300);
        row.serverJsOff = await page.evaluate(probe);
        await context.close();
      }

      // Server HTML, then the client hydrates it.
      {
        const context = await browser.newContext();
        await context.addInitScript(collect);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
        await page.goto(`${base}/ssr${q}`, { waitUntil: 'load' });
        await page.waitForTimeout(800);
        row.hydrated = await page.evaluate(probe);
        // The application runs: the toggle removes the hydrated callout.
        await page.click('#toggle-hydrated');
        await page.waitForTimeout(200);
        row.appRuns = (await page.locator('#c-hydrated').count()) === 0;
        row.ssrViolations = summarize(await page.evaluate(() => window.__csp));
        row.ssrErrors = errors;
        await context.close();
      }

      // Client insert: the family is first used after hydration.
      {
        const context = await browser.newContext();
        await context.addInitScript(collect);
        const page = await context.newPage();
        await page.goto(`${base}/lifecycle${q}`, { waitUntil: 'load' });
        await page.waitForTimeout(500);
        await page.click('#add');
        await page.waitForTimeout(800);
        row.clientInsert = await page.evaluate(() => ({
          callout: getComputedStyle(document.querySelector('.c-item')).paddingTop,
          families: [...document.head.querySelectorAll('[data-nfs-family]')].map(
            (e) => `${e.tagName.toLowerCase()}:${e.getAttribute('data-nfs-family')}:${e.hasAttribute('nonce') || e.nonce ? 'nonce' : 'no-nonce'}`,
          ),
        }));
        row.clientViolations = summarize(await page.evaluate(() => window.__csp));
        await context.close();
      }

      // Client-only @defer: the family arrives with a lazy chunk.
      {
        const context = await browser.newContext();
        await context.addInitScript(collect);
        const page = await context.newPage();
        await page.goto(`${base}/client-defer${q}`, { waitUntil: 'load' });
        await page.waitForTimeout(500);
        await page.click('#ph');
        await page.waitForSelector('#c-client', { timeout: 5000 }).catch(() => null);
        await page.waitForTimeout(800);
        row.clientDefer = await page.evaluate(() => {
          const el = document.querySelector('#c-client');

          return el ? getComputedStyle(el).paddingTop : 'not rendered';
        });
        row.deferViolations = summarize(await page.evaluate(() => window.__csp));
        await context.close();
      }

      console.log(JSON.stringify(row));
      results.push(row);
    }
  }

  await browser.close();

  return results;
}

mkdirSync('D:/tmp/nfs-proto-198-189/out-198', { recursive: true });

for (const engine of wanted) {
  const results = await run(engine);
  writeFileSync(`D:/tmp/nfs-proto-198-189/out-198/csp-${engine}.json`, JSON.stringify(results, null, 1));
}
