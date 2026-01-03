import { test, expect } from '@playwright/test';

/**
 * Consumer Sass Theming E2E Tests
 *
 * These tests verify that consumer applications can successfully customize
 * ngx-foundation-sites components via Sass variables.
 *
 * Test coverage:
 * - Theme colors from $foundation-palette
 * - Global settings like $global-radius
 * - Lazy-loaded component styles
 * - Accordion component functionality
 */

test.describe('Consumer Sass Theming', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display app title', async ({ page }) => {
    const title = page.getByTestId('app-title');
    await expect(title).toHaveText('Consumer Test App');
  });

  test.describe('Theme Colors', () => {
    test('primary button should have custom color #6200ea', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-primary');
      await expect(button).toBeVisible();

      // Verify background color is the custom primary (#6200ea = rgb(98, 0, 234))
      await expect(button).toHaveCSS('background-color', 'rgb(98, 0, 234)');
    });

    test('secondary button should have custom color #00bfa5', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-secondary');
      await expect(button).toBeVisible();

      // #00bfa5 = rgb(0, 191, 165)
      await expect(button).toHaveCSS('background-color', 'rgb(0, 191, 165)');
    });

    test('success button should have custom color #00c853', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-success');
      await expect(button).toBeVisible();

      // #00c853 = rgb(0, 200, 83)
      await expect(button).toHaveCSS('background-color', 'rgb(0, 200, 83)');
    });

    test('warning button should have custom color #ffd600', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-warning');
      await expect(button).toBeVisible();

      // #ffd600 = rgb(255, 214, 0)
      await expect(button).toHaveCSS('background-color', 'rgb(255, 214, 0)');
    });

    test('alert button should have custom color #ff1744', async ({ page }) => {
      const button = page.getByTestId('btn-alert');
      await expect(button).toBeVisible();

      // #ff1744 = rgb(255, 23, 68)
      await expect(button).toHaveCSS('background-color', 'rgb(255, 23, 68)');
    });
  });

  test.describe('Global Radius', () => {
    test('button should have 8px border-radius from $global-radius', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-radius-test');
      await expect(button).toBeVisible();

      // Verify border-radius is 8px
      await expect(button).toHaveCSS('border-radius', '8px');
    });
  });

  test.describe('Accordion Component', () => {
    test('accordion should be visible', async ({ page }) => {
      const accordion = page.getByTestId('accordion');
      await expect(accordion).toBeVisible();
    });

    test('first panel should be expanded by default', async ({ page }) => {
      const content = page.getByTestId('accordion-content-1');
      await expect(content).toBeVisible();
    });

    test('second panel should be collapsed by default', async ({ page }) => {
      const content = page.getByTestId('accordion-content-2');
      await expect(content).toBeHidden();
    });

    test('clicking collapsed panel header should expand it', async ({
      page,
    }) => {
      // Click the second panel header
      const header = page.getByTestId('accordion-header-2');
      await header.click();

      // Content should become visible
      const content = page.getByTestId('accordion-content-2');
      await expect(content).toBeVisible();
    });

    test('accordion title should use primary color', async ({ page }) => {
      // Find the accordion title button containing the header text
      const accordionTitle = page
        .locator('.accordion-title')
        .filter({ hasText: 'Panel 1' });
      await expect(accordionTitle).toBeVisible();

      // Title text color should be primary (#6200ea = rgb(98, 0, 234))
      await expect(accordionTitle).toHaveCSS('color', 'rgb(98, 0, 234)');
    });
  });

  test.describe('Lazy-Loaded Styles', () => {
    test('button styles should be loaded via link tag', async ({ page }) => {
      // Check for link tag with button styles
      // bundleName "button" produces /button.css
      const buttonStyleLink = page.locator('link[href$="button.css"]');
      await expect(buttonStyleLink).toHaveCount(1);
    });

    test('accordion styles should be loaded via link tag', async ({ page }) => {
      // Check for link tag with accordion styles
      // bundleName "accordion" produces /accordion.css
      const accordionStyleLink = page.locator('link[href$="accordion.css"]');
      await expect(accordionStyleLink).toHaveCount(1);
    });

    test('button CSS file should be accessible', async ({ page, request }) => {
      // Verify the link tag has an href attribute
      const buttonLink = page.locator('link[href$="button.css"]');
      await expect(buttonLink).toHaveAttribute('href', /button\.css$/);

      // Get href for the request (using evaluate to avoid lint warning)
      const href = await buttonLink.evaluate((el) => el.getAttribute('href'));

      // Verify the CSS file loads successfully
      const response = await request.get(href ?? '/button.css');
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('text/css');
    });

    test('accordion CSS file should be accessible', async ({
      page,
      request,
    }) => {
      // Verify the link tag has an href attribute
      const accordionLink = page.locator('link[href$="accordion.css"]');
      await expect(accordionLink).toHaveAttribute('href', /accordion\.css$/);

      // Get href for the request (using evaluate to avoid lint warning)
      const href = await accordionLink.evaluate((el) =>
        el.getAttribute('href'),
      );

      // Verify the CSS file loads successfully
      const response = await request.get(href ?? '/accordion.css');
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('text/css');
    });
  });

  test.describe('LTR Layout (Default)', () => {
    test('document should have ltr direction', async ({ page }) => {
      const html = page.locator('html');
      // Default is ltr - either no dir attribute or dir="ltr"
      // Check that it's NOT rtl (covers both null and 'ltr' cases)
      const dir = await html.evaluate((el) => el.getAttribute('dir'));
      expect(dir === null || dir === 'ltr').toBe(true);
    });

    test('accordion title text should align left', async ({ page }) => {
      const accordionTitle = page
        .locator('.accordion-title')
        .filter({ hasText: 'Panel 1' });

      // In LTR, text-align should be left
      await expect(accordionTitle).toHaveCSS('text-align', 'left');
    });
  });
});
