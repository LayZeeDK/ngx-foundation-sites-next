// Case 6: appending sentinels next to a not-yet-hydrated @defer (hydrate on viewport) sibling
// causes no NG05xx error, and the sticky element still sticks correctly around it.
import { expect, test } from '@playwright/test';

test('case 6: sticky next to a hydrate-on-viewport defer sibling has no NG05xx and still sticks', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/');

  const sticky = page.locator('[data-testid="case6-sticky"]');

  // Programmatic, absolute scroll (case 2 already covers real wheel/keyboard input): reliable
  // regardless of how far down the page this fixture sits.
  const docTop = await sticky.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 100)), docTop);
  await page.waitForTimeout(150);
  await expect(sticky).not.toHaveClass(/is-stuck/);

  await page.evaluate((y) => window.scrollTo(0, y + 50), docTop);
  await page.waitForTimeout(200);
  await expect(sticky).toHaveClass(/is-stuck/);

  // Scroll the deferred sibling into view to fire `hydrate on viewport` (it is a placeholder
  // pre-hydration, real content post-hydration; either testid identifies the same slot).
  const deferSlot = page.locator('[data-testid="case6-defer-block"], [data-testid="case6-defer-placeholder"]');
  await deferSlot.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  await expect(page.locator('[data-testid="case6-defer-block"]')).toBeVisible();

  const ng05xxErrors = consoleErrors.filter((message) => /NG0[45]\d{2,3}/.test(message));
  expect(ng05xxErrors, `console errors: ${JSON.stringify(consoleErrors)}`).toEqual([]);

  // The sticky element must still report correctly after the sibling's own hydration pass.
  await expect(sticky).toHaveClass(/is-stuck/);
});
