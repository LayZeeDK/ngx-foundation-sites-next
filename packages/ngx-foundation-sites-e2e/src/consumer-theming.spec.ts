import { test, expect } from '@playwright/test';

/**
 * Consumer Theming E2E Tests
 *
 * These tests verify that consumer Sass customizations via _nfs-settings.scss
 * are correctly applied to ngx-foundation-sites components.
 *
 * Consumer test app configuration (apps/consumer-test-app/src/styles/_nfs-settings.scss):
 *   - primary: #6200ea (purple)
 *   - secondary: #00bfa5 (teal)
 *   - $global-radius: 8px
 *
 * These colors are intentionally different from Foundation defaults to prove
 * that consumer theming works.
 *
 * Color testing strategy:
 *   - Accordion titles: Use exact primary color for text
 *   - Filled buttons: Use exact palette color for background-color
 *     (scale-color transforms are only applied on hover)
 */

/**
 * Converts a hex color to a regex that matches the equivalent rgb()/rgba() format.
 * Browsers always return computed colors as rgb/rgba, never hex.
 *
 * @example
 * hexToRgbRegex('#6200ea') // Returns /rgba?\(98,\s*0,\s*234(?:,\s*1)?\)/
 */
function hexToRgbRegex(hex: string): RegExp {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // Match both rgb(r, g, b) and rgba(r, g, b, 1) formats
  return new RegExp(`rgba?\\(${r},\\s*${g},\\s*${b}(?:,\\s*1)?\\)`);
}

test.describe('Consumer Sass Theming', () => {
  // Consumer test app runs on port 4200
  const baseUrl = 'http://localhost:4200';

  // Consumer palette colors defined as hex (matching _nfs-settings.scss)
  const CONSUMER_PRIMARY = '#6200ea';
  const CONSUMER_SECONDARY = '#00bfa5';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    // Wait for accordion to be visible (component is rendered)
    await expect(page.getByTestId('accordion')).toBeVisible();
  });

  test(`accordion title uses exact consumer primary color (${CONSUMER_PRIMARY})`, async ({
    page,
  }) => {
    // Accordion title text color should be exactly the consumer's primary color
    // Using web-first assertion with automatic retry
    const accordionTitle = page.locator('.accordion-title').first();
    await expect(accordionTitle).toHaveCSS(
      'color',
      hexToRgbRegex(CONSUMER_PRIMARY),
    );
  });

  test(`primary button background uses exact consumer primary color (${CONSUMER_PRIMARY})`, async ({
    page,
  }) => {
    // Filled buttons use the exact palette color for background-color
    // (scale-color is only applied on hover state)
    // Using web-first assertion with automatic retry for CSS loading
    const button = page.getByTestId('btn-primary');
    await expect(button).toHaveCSS(
      'background-color',
      hexToRgbRegex(CONSUMER_PRIMARY),
    );
  });

  test(`secondary button background uses exact consumer secondary color (${CONSUMER_SECONDARY})`, async ({
    page,
  }) => {
    // Filled buttons use the exact palette color for background-color
    // (scale-color is only applied on hover state)
    // Using web-first assertion with automatic retry for CSS loading
    const button = page.getByTestId('btn-secondary');
    await expect(button).toHaveCSS(
      'background-color',
      hexToRgbRegex(CONSUMER_SECONDARY),
    );
  });

  test('button has consumer global-radius (8px)', async ({ page }) => {
    // Consumer $global-radius: 8px
    const button = page.getByTestId('btn-radius-test');
    await expect(button).toHaveCSS('border-radius', '8px');
  });

  test('accordion styles are loaded dynamically', async ({ page }) => {
    // Verify accordion CSS is loaded as a separate stylesheet (lazy loading)
    const accordionStylesheet = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      );
      return links.some(
        (link) =>
          link.id.includes('accordion') ||
          (link as HTMLLinkElement).href.includes('accordion'),
      );
    });

    expect(accordionStylesheet).toBe(true);
  });
});
