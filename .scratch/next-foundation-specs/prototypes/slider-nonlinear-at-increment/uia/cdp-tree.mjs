// PROTOTYPE -- Chromium CDP accessibility nodes of non-linear Handles before and after
// one UIA-style set of the native value one unit up (the increment arithmetic).
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const server = spawn('node', ['dist/slider-proto/server/server.mjs'], { cwd: join(here, '..'), env: { ...process.env, PORT: '4863' }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4863/');
await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
const cdp = await page.context().newCDPSession(page);
await cdp.send('Accessibility.enable');
const lines = [`# Chromium ${browser.version()} CDP accessibility nodes (headless)`];
const node = async (id) => {
  const { result } = await cdp.send('Runtime.evaluate', { expression: `document.getElementById(${JSON.stringify(id)})` });
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { objectId: result.objectId, fetchRelatives: false });
  const n = nodes[0];
  const props = (n.properties ?? []).filter((p) => ['valuemin', 'valuemax', 'valuetext', 'orientation'].includes(p.name)).map((p) => `${p.name}=${p.value.value}`);

  const attr = await page.locator(`#${id}`).getAttribute('aria-valuetext');

  return `${id}: ${n.role.value} "${n.name.value}" value=${n.value?.value} ${props.join(' ')} (CDP valuetext is the native value string; DOM aria-valuetext=${attr})`;
};
const bump = (id) =>
  page.evaluate((i) => {
    const el = document.getElementById(i);
    el.value = String(el.valueAsNumber + 1);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, id);

for (const id of ['nl', 'nl-any', 'nld-min', 'nld-max']) {
  lines.push(`before ${await node(id)}`);
  await bump(id);
  await page.waitForTimeout(100);
  lines.push(`after one unit up: ${await node(id)}`);
}

writeFileSync(join(here, 'out', 'cdp-chromium.txt'), `${lines.join('\n')}\n`, 'utf8');
console.log(lines.join('\n'));
await browser.close();
server.kill();
