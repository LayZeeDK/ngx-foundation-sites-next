// PROTOTYPE -- ad hoc probes for two findings the main spec surfaced:
// (1) does a pre-hydration ArrowRight move a step="any" native range's raw
//     value at all, per engine; (2) what does forced-colors actually paint.
import { expect, test } from '@playwright/test';

test('probe: native default action of ArrowRight on step=any before hydration', async ({ page, browserName }) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(/main-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  const before = await page.locator('#nl-log').inputValue();
  await page.locator('#nl-log').focus();
  await page.keyboard.press('ArrowRight');
  const afterKeyBeforeHydration = await page.locator('#nl-log').inputValue();
  release();
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
  await page.waitForTimeout(300);
  const afterHydration = await page.locator('#nl-log').inputValue();
  test.info().annotations.push({
    type: `probe ${browserName}`,
    description: `before=${before} native-default-action=${afterKeyBeforeHydration} after-hydration=${afterHydration}`,
  });
  expect(true).toBe(true);
});

test('probe: forced-colors computed colours of the double slider', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'no forced-colors emulation');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/');
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
  const info = await page.evaluate(() => {
    const input = document.getElementById('double-min') as HTMLInputElement;
    const track = getComputedStyle(input);
    const fill = document.querySelector('[data-case="double"] .slider-fill') as HTMLElement;
    const fillStyle = getComputedStyle(fill);
    const container = input.parentElement as HTMLElement;
    const containerStyle = getComputedStyle(container);

    return {
      forcedColors: (window as any).matchMedia?.('(forced-colors: active)').matches,
      inputBackground: track.backgroundColor,
      inputAppearance: track.appearance,
      fillBackground: fillStyle.backgroundColor,
      containerBackground: containerStyle.backgroundColor,
    };
  });
  test.info().annotations.push({ type: `forced-colors probe ${browserName}`, description: JSON.stringify(info) });
  await page.screenshot({ path: `test-results/forced-colors-probe-${browserName}.png`, clip: { x: 0, y: 0, width: 500, height: 200 } });
  expect(true).toBe(true);
});
