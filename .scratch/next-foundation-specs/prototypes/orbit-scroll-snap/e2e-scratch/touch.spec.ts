// Scratch: does a CDP touch swipe snap in a plain scroll-snap container (no Angular, no inert)?
import { test } from '@playwright/test';

test.use({ hasTouch: true });

const html = `<div id=c style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;width:600px">
${[0, 1, 2, 3].map((i) => `<div style="flex:0 0 100%;height:300px;scroll-snap-align:start;scroll-snap-stop:always;background:hsl(${i * 90} 60% 60%)"></div>`).join('')}</div>`;

for (const inert of [false, true]) {
  test(`plain snap touch, inert=${inert}`, async ({ page }) => {
    await page.setContent(html);

    if (inert) {
      await page.evaluate(() => document.querySelectorAll('#c > div').forEach((d, i) => i > 0 && d.setAttribute('inert', '')));
    }

    const cdp = await page.context().newCDPSession(page);
    const y = 150;
    const x0 = 480;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });

    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 - i * 36, y }] });
    }

    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(1500);
    console.log('dispatchTouchEvent', inert, await page.evaluate(() => document.getElementById('c')!.scrollLeft));
    await page.evaluate(() => (document.getElementById('c')!.scrollLeft = 0));
    await page.waitForTimeout(300);

    for (const d of [360, -360]) {
      await cdp.send('Input.synthesizeScrollGesture', { x: x0, y, xDistance: d, yDistance: 0, gestureSourceType: 'touch', speed: 1200 });
      await page.waitForTimeout(1500);
      console.log('synthesizeScrollGesture', d, inert, await page.evaluate(() => document.getElementById('c')!.scrollLeft));
    }
  });
}
