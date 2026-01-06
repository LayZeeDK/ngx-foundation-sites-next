import { test, expect } from '@playwright/test';

/**
 * RTL Layout E2E Tests
 *
 * These tests verify that the RTL build configuration is working correctly.
 * They run against the RTL serve configuration (consumer-test-app:serve:rtl)
 * which uses $global-text-direction: rtl in the Sass settings.
 *
 * Run with: npx nx run consumer-test-app-e2e:e2e-rtl
 */

test.describe('RTL Layout Styles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('html element should have dir="rtl" attribute', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('accordion component should have RTL direction in computed styles', async ({
    page,
  }) => {
    const accordion = page.locator('.accordion').first();

    // In RTL build, the computed direction should be 'rtl'
    // This comes from Foundation's CSS compiled with $global-text-direction: rtl
    const direction = await accordion.evaluate(
      (el) => getComputedStyle(el).direction,
    );

    expect(direction).toBe('rtl');
  });

  test('button row should have reversed visual order in RTL', async ({
    page,
  }) => {
    // Get button locators and assert they're visible
    const primaryBtn = page.getByTestId('btn-primary');
    const secondaryBtn = page.getByTestId('btn-secondary');
    await expect(primaryBtn).toBeVisible();
    await expect(secondaryBtn).toBeVisible();

    // Get horizontal positions using evaluate (avoids null checks)
    const primaryX = await primaryBtn.evaluate(
      (el) => el.getBoundingClientRect().x,
    );
    const secondaryX = await secondaryBtn.evaluate(
      (el) => el.getBoundingClientRect().x,
    );

    // In RTL with flexbox, the primary button should be RIGHT of secondary
    // (visual order is reversed from reading direction)
    expect(primaryX).toBeGreaterThan(secondaryX);
  });
});
