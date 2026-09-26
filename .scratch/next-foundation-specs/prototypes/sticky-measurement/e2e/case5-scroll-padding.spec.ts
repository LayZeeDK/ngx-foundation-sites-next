// Case 5: consumer scroll-padding-top on the scroll container does not shift the sticky line.
// position: sticky's own clamp is unaffected by scroll-padding (which only steers
// scrollIntoView()/anchor-jump targets), so the pinned inset (the stuck element's offset from
// its own scroll container's top, inside the border) must be identical with and without it.
// Measured relative to each wrapper's own border-box top (not raw viewport top), because
// Playwright's hover()-triggered auto-scroll does not land two independent elements at the same
// viewport position.
import { expect, type Page, test } from '@playwright/test';

async function stickyInsetWhenStuck(page: Page, wrapperTestId: string, stickyTestId: string): Promise<number> {
  const wrapper = page.locator(`[data-testid="${wrapperTestId}"]`);
  const sticky = page.locator(`[data-testid="${stickyTestId}"]`);

  await wrapper.hover();

  for (let step = 0; step < 8; step += 1) {
    if (await sticky.evaluate((el) => el.classList.contains('is-stuck'))) {
      break;
    }

    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(80);
  }

  await expect(sticky).toHaveClass(/is-stuck/);

  return page.evaluate(
    ({ wrapperTestId, stickyTestId }) => {
      const wrapperEl = document.querySelector(`[data-testid="${wrapperTestId}"]`) as HTMLElement;
      const stickyEl = document.querySelector(`[data-testid="${stickyTestId}"]`) as HTMLElement;

      return stickyEl.getBoundingClientRect().top - wrapperEl.getBoundingClientRect().top;
    },
    { wrapperTestId, stickyTestId },
  );
}

test('case 5: scroll-padding-top on the scroll container does not move the sticky line', async ({ page }) => {
  await page.goto('/');

  const plainInset = await stickyInsetWhenStuck(page, 'case5-plain-wrapper', 'case5-plain-sticky');
  const paddedInset = await stickyInsetWhenStuck(page, 'case5-padded-wrapper', 'case5-padded-sticky');

  expect(Math.abs(paddedInset - plainInset)).toBeLessThan(0.5);
});
