// Case 3: the nearest real scroll container as the IntersectionObserver root works inside
// overflow:auto and overflow:hidden wrappers, and overflow:clip on an OffCanvas-style wrapper
// works (the wrapper is skipped by the scroll-container walk, so the window stays the root).
import { expect, test } from '@playwright/test';

test('case 3: overflow:auto panel sticks when the PANEL itself is scrolled', async ({ page }) => {
  await page.goto('/');
  const sticky = page.locator('[data-testid="case3-auto-sticky"]');
  await expect(sticky).not.toHaveClass(/is-stuck/);

  await page.locator('[data-testid="case3-auto-wrapper"]').hover();
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(200);

  await expect(sticky).toHaveClass(/is-stuck/);
});

test('case 3: overflow:hidden wrapper never sticks (nothing scrolls it)', async ({ page }) => {
  await page.goto('/');
  const sticky = page.locator('[data-testid="case3-hidden-sticky"]');
  await expect(sticky).not.toHaveClass(/is-stuck/);

  // Scroll the outer page repeatedly; the hidden wrapper's own scrollTop never moves, so the
  // element's position relative to it never changes.
  for (let step = 0; step < 6; step += 1) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(80);
  }

  await expect(sticky).not.toHaveClass(/is-stuck/);
});

test('case 3: overflow:clip OffCanvas-style wrapper still sticks against the window', async ({ page }) => {
  await page.goto('/');
  const sticky = page.locator('[data-testid="case3-clip-sticky"]');

  // Programmatic positioning here (not real input): this case is about scroll-container
  // detection walking past overflow:clip, not about input realism (case 2 covers that).
  // Absolute document position (not offsetTop, which is relative to the nearest positioned
  // ancestor and would be wrong here since the sticky-container is position: relative).
  const docTop = await sticky.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 500)), docTop);
  await page.waitForTimeout(150);
  await expect(sticky).not.toHaveClass(/is-stuck/);

  await page.evaluate((y) => window.scrollTo(0, y + 50), docTop);
  await page.waitForTimeout(200);
  await expect(sticky).toHaveClass(/is-stuck/);
});
