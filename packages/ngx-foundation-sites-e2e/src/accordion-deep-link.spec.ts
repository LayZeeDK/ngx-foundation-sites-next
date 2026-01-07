import { test, expect } from '@playwright/test';

test.describe('Accordion Deep Linking', () => {
  const storyUrl = '/iframe.html?id=components-accordion--deep-link';
  const slowExpect = expect.configure({ timeout: 10_000 });

  test('opens panel from initial URL hash', async ({ page }) => {
    await page.goto(`${storyUrl}#panel-2`);

    const trigger2 = page.getByRole('button', { name: /Accordion 2/i });
    await slowExpect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  test('updates URL hash when panel is expanded', async ({ page }) => {
    await page.goto(storyUrl);

    await page.getByRole('button', { name: /Accordion 1/i }).click();

    await expect(page).toHaveURL(/#panel-1$/);
  });

  test('responds to browser back/forward navigation', async ({ page }) => {
    await page.goto(storyUrl);

    // Open panel 1, then panel 2
    await page.getByRole('button', { name: /Accordion 1/i }).click();
    await page.waitForURL(/#panel-1$/);

    await page.getByRole('button', { name: /Accordion 2/i }).click();
    await page.waitForURL(/#panel-2$/);

    // Go back - panel 1 should be active
    await page.goBack();

    const trigger1 = page.getByRole('button', { name: /Accordion 1/i });
    await expect(trigger1).toHaveAttribute('aria-expanded', 'true');
  });

  test('scrolls to panel when deepLinkSmudge is enabled', async ({ page }) => {
    await page.goto(`${storyUrl}#panel-3`);

    // Wait for deepLinkSmudgeDelay (300ms) + buffer. This timeout is intentional:
    // the accordion's scroll behavior uses setTimeout internally, so there's no
    // DOM state change or network request to await - only the configured delay.
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(400);

    const trigger3 = page.getByRole('button', { name: /Accordion 3/i });
    await slowExpect(trigger3).toBeInViewport();
  });

  test('clears hash when all panels are closed in multi-expand mode', async ({
    page,
  }) => {
    // Use multi-expand story with deep linking
    const multiStoryUrl =
      '/iframe.html?id=components-accordion--multi-expand-deep-link';
    await page.goto(`${multiStoryUrl}#panel-1`);

    // Wait for panel to expand
    const trigger1 = page.getByRole('button', { name: /Accordion 1/i });
    await slowExpect(trigger1).toHaveAttribute('aria-expanded', 'true');

    // Close the expanded panel
    await trigger1.click();

    // Hash should be cleared
    await expect(page).not.toHaveURL(/#panel/);
  });

  test('ignores invalid hash', async ({ page }) => {
    // Use story with allowAllClosed=true so invalid hash doesn't trigger auto-open
    const allowAllClosedStoryUrl =
      '/iframe.html?id=components-accordion--deep-link-no-history';
    await page.goto(`${allowAllClosedStoryUrl}#invalid-panel-id`);

    // No panel should be expanded when hash doesn't match any panel ID
    const triggers = page.getByRole('button', { name: /Accordion/i });
    const count = await triggers.count();

    for (let i = 0; i < count; i++) {
      await expect(triggers.nth(i)).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('uses replaceState when updateHistory is false', async ({ page }) => {
    // Use story with updateHistory=false
    const replaceStoryUrl =
      '/iframe.html?id=components-accordion--deep-link-no-history';
    await page.goto(replaceStoryUrl);

    const initialHistoryLength = await page.evaluate(() => history.length);

    await page.getByRole('button', { name: /Accordion 1/i }).click();
    await page.getByRole('button', { name: /Accordion 2/i }).click();

    const finalHistoryLength = await page.evaluate(() => history.length);

    // History length should not increase with replaceState
    expect(finalHistoryLength).toBe(initialHistoryLength);
  });
});
