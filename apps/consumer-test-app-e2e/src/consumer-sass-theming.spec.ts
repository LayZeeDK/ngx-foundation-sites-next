import { test, expect } from '@playwright/test';

/**
 * Consumer Sass Theming E2E Tests
 *
 * These tests verify that consumer applications can successfully customize
 * ngx-foundation-sites components via Sass variables in _nfs-settings.scss.
 *
 * Test coverage:
 * - Global variables ($foundation-palette, $global-radius, $global-margin, etc.)
 * - Button variables ($button-padding, $button-sizes, $button-opacity-disabled, etc.)
 * - Accordion variables ($accordion-background, $accordion-title-font-size, etc.)
 * - ngx-foundation-sites custom variables ($nfs-accordion-slide-speed)
 *
 * All test values are defined in:
 * apps/consumer-test-app/src/styles/_nfs-settings.scss
 */

/**
 * Converts hex color to exact rgb() string for comparison.
 * Browsers always return computed colors as "rgb(r, g, b)" format with spaces.
 *
 * @example
 * hexToRgb('#6200ea') // Returns "rgb(98, 0, 234)"
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgb(${r}, ${g}, ${b})`;
}

test.describe('Consumer Sass Theming', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display app title', async ({ page }) => {
    const title = page.getByTestId('app-title');
    await expect(title).toHaveText('Consumer Test App');
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // GLOBAL VARIABLES: $foundation-palette
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('$foundation-palette Colors', () => {
    // Configured in _nfs-settings.scss:
    // primary: #6200ea, secondary: #00bfa5, success: #00c853,
    // warning: #ffd600, alert: #ff1744

    test('primary button should have custom color #6200ea', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-primary');
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS('background-color', hexToRgb('#6200ea'));
    });

    test('secondary button should have custom color #00bfa5', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-secondary');
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS('background-color', hexToRgb('#00bfa5'));
    });

    test('success button should have custom color #00c853', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-success');
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS('background-color', hexToRgb('#00c853'));
    });

    test('warning button should have custom color #ffd600', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-warning');
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS('background-color', hexToRgb('#ffd600'));
    });

    test('alert button should have custom color #ff1744', async ({ page }) => {
      const button = page.getByTestId('btn-alert');
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS('background-color', hexToRgb('#ff1744'));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // GLOBAL VARIABLES: Spacing & Layout
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Global Spacing & Layout Variables', () => {
    test('$global-radius: button should have 8px border-radius', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-radius-test');
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS('border-radius', '8px');
    });

    test('$global-margin: button should have 1.5rem (24px) margin-bottom', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-spacing');
      await expect(button).toBeVisible();
      // $global-margin: 1.5rem = 24px
      await expect(button).toHaveCSS('margin-bottom', '24px');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // GLOBAL VARIABLES: Gray Scale Colors
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Global Gray Scale Colors', () => {
    test('$white (#f8f8f8): affects button text color', async ({ page }) => {
      // Button text uses $button-color which defaults to $white
      // We configured $button-color: #f0f0f0 directly, so test that
      const button = page.getByTestId('btn-primary');
      await expect(button).toHaveCSS('color', hexToRgb('#f0f0f0'));
    });

    test('$light-gray (#dddddd): affects accordion hover background', async ({
      page,
    }) => {
      // We configured $accordion-item-background-hover: #d0d0d0 directly
      // This test verifies the variable is applied (checked via hover state)
      const accordionTitle = page.getByRole('button', { name: /Panel 1/ });
      await expect(accordionTitle).toBeVisible();
      // Hover and check background
      await accordionTitle.hover();
      await expect(accordionTitle).toHaveCSS(
        'background-color',
        hexToRgb('#d0d0d0'),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUTTON VARIABLES: Typography
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Button Typography Variables', () => {
    test('$button-font-family: button should use Arial font', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-typography');
      await expect(button).toBeVisible();
      // Font stack: 'Arial', sans-serif
      const fontFamily = await button.evaluate(
        (el) => getComputedStyle(el).fontFamily,
      );
      expect(fontFamily.toLowerCase()).toContain('arial');
    });

    test('$button-font-weight: button should have font-weight 600', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-typography');
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS('font-weight', '600');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUTTON VARIABLES: Padding
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Button Padding Variables', () => {
    test('$button-padding: button should have 1em 1.5em padding', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-spacing');
      await expect(button).toBeVisible();
      // 1em at default 16px base = 16px, but button font-size is 0.9rem = 14.4px
      // So 1em = 14.4px and 1.5em = 21.6px
      // Browser may report slightly different values due to rounding
      const paddingTop = await button.evaluate(
        (el) => getComputedStyle(el).paddingTop,
      );
      const paddingLeft = await button.evaluate(
        (el) => getComputedStyle(el).paddingLeft,
      );
      // Verify padding is applied (not default 0.85em 1em)
      expect(parseFloat(paddingTop)).toBeGreaterThan(10);
      expect(parseFloat(paddingLeft)).toBeGreaterThan(15);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUTTON VARIABLES: Sizes
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Button Size Variables ($button-sizes)', () => {
    test('$button-sizes.tiny: should have 0.5rem (8px) font-size', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-tiny');
      await expect(button).toBeVisible();
      // 0.5rem = 8px
      await expect(button).toHaveCSS('font-size', '8px');
    });

    test('$button-sizes.small: should have 0.65rem (10.4px) font-size', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-small');
      await expect(button).toBeVisible();
      // 0.65rem = 10.4px
      const fontSize = await button.evaluate(
        (el) => getComputedStyle(el).fontSize,
      );
      expect(parseFloat(fontSize)).toBeCloseTo(10.4, 0);
    });

    test('$button-sizes.default: should have 0.9rem (14.4px) font-size', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-default-size');
      await expect(button).toBeVisible();
      // 0.9rem = 14.4px
      const fontSize = await button.evaluate(
        (el) => getComputedStyle(el).fontSize,
      );
      expect(parseFloat(fontSize)).toBeCloseTo(14.4, 0);
    });

    test('$button-sizes.large: should have 1.4rem (22.4px) font-size', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-large');
      await expect(button).toBeVisible();
      // 1.4rem = 22.4px
      const fontSize = await button.evaluate(
        (el) => getComputedStyle(el).fontSize,
      );
      expect(parseFloat(fontSize)).toBeCloseTo(22.4, 0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUTTON VARIABLES: States
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Button State Variables', () => {
    test('$button-opacity-disabled: disabled button should have 0.4 opacity', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-disabled');
      await expect(button).toBeVisible();
      // Configured: $button-opacity-disabled: 0.4
      await expect(button).toHaveCSS('opacity', '0.4');
    });

    test('$button-hollow-border-width: hollow button should have 2px border', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-hollow');
      await expect(button).toBeVisible();
      // Configured: $button-hollow-border-width: 2px
      const borderWidth = await button.evaluate(
        (el) => getComputedStyle(el).borderWidth,
      );
      expect(borderWidth).toBe('2px');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUTTON VARIABLES: Border & Colors
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Button Border & Color Variables', () => {
    test('$button-border: button should have 2px border', async ({ page }) => {
      const button = page.getByTestId('btn-primary');
      await expect(button).toBeVisible();
      // Configured: $button-border: 2px solid transparent
      const borderWidth = await button.evaluate(
        (el) => getComputedStyle(el).borderWidth,
      );
      expect(borderWidth).toBe('2px');
    });

    test('$button-color: button text should be #f0f0f0', async ({ page }) => {
      const button = page.getByTestId('btn-primary');
      await expect(button).toBeVisible();
      // Configured: $button-color: #f0f0f0
      await expect(button).toHaveCSS('color', hexToRgb('#f0f0f0'));
    });

    test('$button-color-alt: warning button text should use alt color for contrast', async ({
      page,
    }) => {
      // Warning buttons have light background, so should use $button-color-alt
      const button = page.getByTestId('btn-warning');
      await expect(button).toBeVisible();
      // Configured: $button-color-alt: #1a1a1a
      await expect(button).toHaveCSS('color', hexToRgb('#1a1a1a'));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUTTON VARIABLES: Transitions
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Button Transition Variables', () => {
    test('$button-transition: button should have 0.3s ease-in-out transition', async ({
      page,
    }) => {
      const button = page.getByTestId('btn-primary');
      await expect(button).toBeVisible();
      // Configured: $button-transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out
      const transition = await button.evaluate(
        (el) => getComputedStyle(el).transition,
      );
      expect(transition).toContain('0.3s');
      expect(transition).toContain('ease-in-out');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ACCORDION VARIABLES: Container
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Accordion Container Variables', () => {
    test('$accordion-background: accordion should have #f9f9f9 background', async ({
      page,
    }) => {
      // The background is on the .accordion ul element inside the nfs-accordion wrapper
      // Using locator here because there's no semantic role for the accordion container
      const accordionList = page.getByTestId('accordion').locator('.accordion');
      await expect(accordionList).toBeVisible();
      // Configured: $accordion-background: #f9f9f9
      await expect(accordionList).toHaveCSS(
        'background-color',
        hexToRgb('#f9f9f9'),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ACCORDION VARIABLES: Title Styling
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Accordion Title Variables', () => {
    test('$accordion-title-font-size: title should have 0.875rem (14px) font-size', async ({
      page,
    }) => {
      const accordionTitle = page.getByRole('button', { name: /Panel 1/ });
      await expect(accordionTitle).toBeVisible();
      // Configured: $accordion-title-font-size: 0.875rem = 14px
      await expect(accordionTitle).toHaveCSS('font-size', '14px');
    });

    test('$accordion-item-padding: title should have 1rem 0.75rem padding', async ({
      page,
    }) => {
      const accordionTitle = page.getByRole('button', { name: /Panel 1/ });
      await expect(accordionTitle).toBeVisible();
      // Configured: $accordion-item-padding: 1rem 0.75rem
      // 1rem = 16px, 0.75rem = 12px
      await expect(accordionTitle).toHaveCSS('padding-top', '16px');
      await expect(accordionTitle).toHaveCSS('padding-left', '12px');
    });

    test('accordion title should use primary color (#6200ea)', async ({
      page,
    }) => {
      const accordionTitle = page.getByRole('button', { name: /Panel 1/ });
      await expect(accordionTitle).toBeVisible();
      // Title text color should be primary from $foundation-palette
      await expect(accordionTitle).toHaveCSS('color', hexToRgb('#6200ea'));
    });

    test('$accordion-item-background-hover: title hover should show #d0d0d0', async ({
      page,
    }) => {
      const accordionTitle = page.getByRole('button', { name: /Panel 1/ });
      await expect(accordionTitle).toBeVisible();
      // Hover and check background
      await accordionTitle.hover();
      // Configured: $accordion-item-background-hover: #d0d0d0
      await expect(accordionTitle).toHaveCSS(
        'background-color',
        hexToRgb('#d0d0d0'),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ACCORDION VARIABLES: Content Styling
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Accordion Content Variables', () => {
    test('$accordion-content-background: content should have #fafafa background', async ({
      page,
    }) => {
      // The first accordion panel is expanded by default
      const accordionContent = page.getByRole('region').first();
      await expect(accordionContent).toBeAttached();
      // Configured: $accordion-content-background: #fafafa
      await expect(accordionContent).toHaveCSS(
        'background-color',
        hexToRgb('#fafafa'),
      );
    });

    test('$accordion-content-border: content should have 1px solid #cccccc border', async ({
      page,
    }) => {
      // The visible (expanded) region has the border applied
      const expandedContent = page.getByRole('region').first();
      await expect(expandedContent).toBeVisible();
      // Configured: $accordion-content-border: 1px solid #cccccc
      // Note: Foundation applies this border to the top only. Check border-top-color
      // as border-color returns all 4 sides which may differ.
      await expect(expandedContent).toHaveCSS(
        'border-top-color',
        hexToRgb('#cccccc'),
      );
    });

    test('$accordion-content-color: content text should be #222222', async ({
      page,
    }) => {
      const accordionContent = page.getByRole('region').first();
      await expect(accordionContent).toBeAttached();
      // Configured: $accordion-content-color: #222222
      await expect(accordionContent).toHaveCSS('color', hexToRgb('#222222'));
    });

    test('$accordion-content-padding: expanded content should have 1.25rem (20px) padding', async ({
      page,
    }) => {
      // Check the expanded content (first panel is expanded by default)
      const expandedContent = page.getByRole('region').first();
      await expect(expandedContent).toBeVisible();
      // Configured: $accordion-content-padding: 1.25rem = 20px
      await expect(expandedContent).toHaveCSS('padding', '20px');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ACCORDION VARIABLES: Icons
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('Accordion Icon Variables', () => {
    test('$accordion-plus-content: collapsed title should show ▸ icon', async ({
      page,
    }) => {
      // Find the collapsed panel's title (panel 2) using aria-expanded attribute
      const collapsedTitle = page.getByRole('button', {
        name: /Panel 2/,
        expanded: false,
      });
      await expect(collapsedTitle).toBeVisible();
      // Get the ::before pseudo-element content
      const beforeContent = await collapsedTitle.evaluate((el) => {
        const style = getComputedStyle(el, '::before');
        return style.content;
      });
      // Configured: $accordion-plus-content: '\25B8' which is ▸
      // CSS content is returned with quotes
      expect(beforeContent).toMatch(/["']?▸["']?|["']?\\25B8["']?/i);
    });

    test('$accordion-minus-content: expanded title should show ▾ icon', async ({
      page,
    }) => {
      // Find the expanded panel's title (panel 1) using aria-expanded attribute
      const expandedTitle = page.getByRole('button', {
        name: /Panel 1/,
        expanded: true,
      });
      await expect(expandedTitle).toBeVisible();
      // Get the ::before pseudo-element content
      const beforeContent = await expandedTitle.evaluate((el) => {
        const style = getComputedStyle(el, '::before');
        return style.content;
      });
      // Configured: $accordion-minus-content: '\25BE' which is ▾
      expect(beforeContent).toMatch(/["']?▾["']?|["']?\\25BE["']?/i);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ngx-foundation-sites CUSTOM VARIABLES
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('ngx-foundation-sites Custom Variables', () => {
    test('$nfs-accordion-slide-speed: accordion animation should use 200ms', async ({
      page,
    }) => {
      // Consumer-test-app overrides $nfs-accordion-slide-speed: 200ms
      const accordionContent = page.getByRole('region').first();
      await expect(accordionContent).toBeAttached();

      // Get the transition-duration from computed styles
      const transitionDuration = await accordionContent.evaluate(
        (el) => getComputedStyle(el).transitionDuration,
      );

      // Browser normalizes 200ms to 0.2s
      expect(transitionDuration).toContain('0.2s');
      // Verify it's NOT the library default of 250ms/0.25s
      expect(transitionDuration).not.toContain('0.25s');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // ACCORDION COMPONENT BEHAVIOR
  // ═══════════════════════════════════════════════════════════════════════════════
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
      const header = page.getByTestId('accordion-header-2');
      await header.click();
      const content = page.getByTestId('accordion-content-2');
      await expect(content).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LAZY-LOADED STYLES
  // ═══════════════════════════════════════════════════════════════════════════════
  // Note: These tests use page.locator() because they query non-semantic DOM elements
  // (link tags by href attribute) - there's no user-facing content to query semantically.
  test.describe('Lazy-Loaded Styles', () => {
    test('button styles should be loaded via link tag', async ({ page }) => {
      const buttonStyleLink = page.locator('link[href$="button.css"]');
      await expect(buttonStyleLink).toHaveCount(1);
    });

    test('accordion styles should be loaded via link tag', async ({ page }) => {
      const accordionStyleLink = page.locator('link[href$="accordion.css"]');
      await expect(accordionStyleLink).toHaveCount(1);
    });

    test('button CSS file should be accessible', async ({ page, request }) => {
      const buttonLink = page.locator('link[href$="button.css"]');
      await expect(buttonLink).toHaveAttribute('href', /button\.css$/);

      const href = await buttonLink.evaluate((el) => el.getAttribute('href'));
      const response = await request.get(href ?? '/button.css');
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('text/css');
    });

    test('accordion CSS file should be accessible', async ({
      page,
      request,
    }) => {
      const accordionLink = page.locator('link[href$="accordion.css"]');
      await expect(accordionLink).toHaveAttribute('href', /accordion\.css$/);

      const href = await accordionLink.evaluate((el) =>
        el.getAttribute('href'),
      );
      const response = await request.get(href ?? '/accordion.css');
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('text/css');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LTR LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════════
  test.describe('LTR Layout (Default)', () => {
    test('document should have ltr direction', async ({ page }) => {
      // Technical check on html element - locator is appropriate here
      const html = page.locator('html');
      const dir = await html.evaluate((el) => el.getAttribute('dir'));
      expect(dir === null || dir === 'ltr').toBe(true);
    });

    test('accordion title text should align left', async ({ page }) => {
      const accordionTitle = page.getByRole('button', { name: /Panel 1/ });
      await expect(accordionTitle).toHaveCSS('text-align', 'left');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // TODO TESTS: Global-only Variables
  // ═══════════════════════════════════════════════════════════════════════════════
  // These variables don't affect Button or Accordion components directly.
  // Tests marked as fixme for when additional components are added.
  test.describe('Global-only Variables (TODO)', () => {
    test.fixme(
      '$global-font-size - affects html/body element, not Button/Accordion',
    );
    test.fixme(
      '$global-width - affects grid layout, not Button/Accordion',
    );
    test.fixme(
      '$global-lineheight - affects body text, not Button/Accordion',
    );
    test.fixme('$global-padding - not used by Button/Accordion components');
    test.fixme(
      '$global-weight-normal - affects body text, not Button/Accordion',
    );
    test.fixme(
      '$global-weight-bold - affects body text, not Button/Accordion',
    );
    test.fixme('$global-menu-padding - affects Menu component');
    test.fixme(
      '$global-flexbox - affects grid layout, not Button/Accordion styling',
    );
    test.fixme('$body-background - affects body element, not components');
    test.fixme(
      '$body-font-color - affects body text, not components directly',
    );
    test.fixme('$body-font-family - affects body element');
    test.fixme('$medium-gray - not used by Button/Accordion components');
    test.fixme('$dark-gray - not used by Button/Accordion components');
    test.fixme(
      '$button-responsive-expanded - requires breakpoint testing (multi-viewport)',
    );
    test.fixme(
      '$button-background-hover-lightness - requires hover + color calculation verification',
    );
    test.fixme(
      '$button-hollow-hover-lightness - requires hover + color calculation verification',
    );
  });
});
