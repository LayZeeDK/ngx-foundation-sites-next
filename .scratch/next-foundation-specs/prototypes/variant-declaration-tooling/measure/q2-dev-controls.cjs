// Q2: the Controls panel of `storybook dev` for Ui's Variant input `color`.
// Usage: node q2-dev-controls.cjs <port> <label>
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execSync } = require('node:child_process');

const ws = path.resolve(__dirname, '../nx-ws');
const { chromium } = require(require.resolve('playwright', { paths: [ws] }));
const [port, label] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let log = '';
  const child = spawn(`npx storybook dev -p ${port} --ci --no-open`, {
    cwd: path.join(ws, 'libs/ui'),
    shell: true,
    env: {
      ...process.env,
      NX_DAEMON: 'false',
      FORCE_COLOR: '0',
      STORYBOOK_DISABLE_TELEMETRY: '1',
    },
  });
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
  const result = { label };
  let browser;

  try {
    for (let i = 0; i < 240 && !/Local:|started/.test(log); i++) {
      await sleep(500);
    }

    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}/?path=/story/ui--purple`, {
      waitUntil: 'load',
      timeout: 120000,
    });
    await page
      .getByRole('tab', { name: /Controls/ })
      .click({ timeout: 120000 });
    const row = page
      .getByRole('row')
      .filter({ hasText: /^color/ })
      .first();
    await row.waitFor({ timeout: 120000 });
    await sleep(1500);
    result.colorRowText = (await row.innerText()).replace(/\s+/g, ' ').trim();
    result.selectOptions = await row.locator('select option').allInnerTexts();
    result.radios = await row.locator('input[type=radio]').count();
    result.textInputs = await row.locator('input[type=text], textarea').count();
    await page.screenshot({
      path: path.resolve(__dirname, `../logs/q2-dev-controls-${label}.png`),
    });
  } finally {
    await browser?.close();

    try {
      execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: 'ignore' });
    } catch {
      // already gone
    }

    fs.writeFileSync(
      path.resolve(__dirname, `../logs/q2-dev-controls-${label}.log`),
      log.replace(/\x1b\[[0-9;]*m/g, ''),
    );
  }

  fs.writeFileSync(
    path.resolve(__dirname, `../logs/q2-dev-controls-${label}.json`),
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(JSON.stringify(result, null, 2));
})();
