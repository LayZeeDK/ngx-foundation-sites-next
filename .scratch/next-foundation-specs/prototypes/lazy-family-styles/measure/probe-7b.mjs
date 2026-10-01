// PROTOTYPE: what happens to a dehydrated @defer block when its parent @if turns false.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => console.log('console:', m.text()));
await page.goto('http://localhost:4611/ssr');
await page.waitForLoadState('networkidle');
await new Promise((r) => setTimeout(r, 500));
const snap = (label) =>
  page.evaluate((l) => {
    const d = document.getElementById('c-deferred');

    return `${l}: deferred=${!!d} connected=${d?.isConnected} hydrated=${!!document.getElementById('c-hydrated')} parent=${d?.parentElement?.tagName} attrs=${d ? [...d.attributes].map((a) => a.name).join(',') : ''}`;
  }, label);
console.log(await snap('initial'));
await page.click('#toggle-hydrated');
await new Promise((r) => setTimeout(r, 500));
console.log(await snap('after toggle-hydrated'));
await page.click('#toggle-deferred');
await new Promise((r) => setTimeout(r, 800));
console.log(await snap('after toggle-deferred'));
await page.click('#toggle-deferred');
await new Promise((r) => setTimeout(r, 800));
console.log(await snap('after toggle-deferred again'));
console.log(await page.evaluate(() => document.body.innerHTML.slice(0, 3000)));
await browser.close();
