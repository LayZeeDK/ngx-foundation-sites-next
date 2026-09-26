// PROTOTYPE (throwaway) -- case 1, headed-only: a classic (non-overlay) scrollbar under
// the slides would show as extra pixels below `.orbit-container`'s content box. Headless
// engines on this machine already report 0 (see keyboard.spec.ts and the earlier
// orbit-scroll-snap prototype), so this is the one check that needs a real window.
import { expect, test } from '@playwright/test';
import { open, record } from './helpers';

test('headed: the container paints no horizontal scrollbar under the slides', async ({ page }, info) => {
  await open(page);
  const m = await page.evaluate(() => {
    const c = document.querySelector<HTMLElement>('.orbit-container')!;
    const r = c.getBoundingClientRect();
    return {
      clientHeight: c.clientHeight,
      offsetHeight: c.offsetHeight,
      scrollbarWidth: getComputedStyle(c).scrollbarWidth,
      rectHeight: Math.round(r.height),
    };
  });
  await page.screenshot({ path: `results/${info.project.name}-scrollbar.png` });
  record(info, m);
  expect(m.offsetHeight - m.clientHeight).toBe(0);
});
