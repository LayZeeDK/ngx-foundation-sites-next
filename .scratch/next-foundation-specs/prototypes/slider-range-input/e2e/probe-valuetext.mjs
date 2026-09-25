// PROTOTYPE probe: does Chromium's accessibility tree honour aria-valuetext and
// aria-orientation on a native <input type="range">? Control: a div role=slider.
import { chromium } from '@playwright/test';

const html = `
<label for="a">native</label><input id="a" type="range" min="0" max="1000" value="309" aria-valuetext="50 dollars">
<label for="b">native-vertical</label><input id="b" type="range" aria-orientation="vertical">
<div role="slider" tabindex="0" aria-label="custom" aria-valuenow="309" aria-valuemin="0" aria-valuemax="1000" aria-valuetext="50 dollars" aria-orientation="vertical"></div>
<label for="c">native-set-later</label><input id="c" type="range" value="10">`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.evaluate(() => document.getElementById('c').setAttribute('aria-valuetext', 'ten units'));
const cdp = await page.context().newCDPSession(page);
const { nodes } = await cdp.send('Accessibility.getFullAXTree');

for (const n of nodes.filter((n) => n.role?.value === 'slider')) {
  const props = Object.fromEntries((n.properties ?? []).map((p) => [p.name, p.value.value]));
  console.log(JSON.stringify({ name: n.name?.value, value: n.value?.value, valuetext: props.valuetext, orientation: props.orientation }));
}

console.log('chromium', browser.version());
await browser.close();
