import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { NfsButton } from './button';
import { argsToLiteralTemplate } from '../util-storybook/args-to-literal-template';
import { pxToEm } from '../util-storybook/px-to-em';
import { pxToRem } from '../util-storybook/px-to-rem';

const meta: Meta<NfsButton> = {
  title: 'Controls/Button',
  component: NfsButton,
  tags: ['autodocs'],
  argTypes: {
    // 5+ options renders as "Set object" button; use select for cleaner UX
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'alert', 'warning'],
    },
    expanded: {
      control: 'select',
      options: [
        false,
        true,
        'small-only',
        'medium-only',
        'large-only',
        'medium',
        'large',
        'medium-down',
        'large-down',
      ],
      description:
        'Full-width expansion. Use breakpoint values for responsive behavior.',
    },
  },
  render: (args) => ({
    props: args,
    template: `<button nfsButton ${argsToLiteralTemplate(args)}>Button</button>`,
  }),
};

export default meta;
type Story = StoryObj<NfsButton>;

// ═══════════════════════════════════════════════════════════════════════════════
// Basic Stories
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Default button with primary color.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Button/i });

    // Verify Foundation classes
    expect(button).toHaveClass('button', 'primary');

    // Verify it's clickable
    await userEvent.click(button);
  },
};

/**
 * All Foundation color variants: primary, secondary, success, warning, alert.
 */
export const ColorVariants: Story = {
  render: () => ({
    template: `
      <div class="margin-bottom-1">
        <button nfsButton color="primary" class="margin-right-1">Primary</button>
        <button nfsButton color="secondary" class="margin-right-1">Secondary</button>
        <button nfsButton color="success" class="margin-right-1">Success</button>
        <button nfsButton color="warning" class="margin-right-1">Warning</button>
        <button nfsButton color="alert">Alert</button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all color variants have correct classes
    const primary = canvas.getByRole('button', { name: /Primary/i });
    expect(primary).toHaveClass('button', 'primary');

    const secondary = canvas.getByRole('button', { name: /Secondary/i });
    expect(secondary).toHaveClass('button', 'secondary');

    const success = canvas.getByRole('button', { name: /Success/i });
    expect(success).toHaveClass('button', 'success');

    const warning = canvas.getByRole('button', { name: /Warning/i });
    expect(warning).toHaveClass('button', 'warning');

    const alert = canvas.getByRole('button', { name: /Alert/i });
    expect(alert).toHaveClass('button', 'alert');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Size Variants
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Foundation button sizes: tiny, small, default, large, and expanded.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="margin-bottom-1">
        <button nfsButton size="tiny" class="margin-right-1">Tiny</button>
        <button nfsButton size="small" class="margin-right-1">Small</button>
        <button nfsButton class="margin-right-1">Default</button>
        <button nfsButton size="large">Large</button>
      </div>
      <div>
        <button nfsButton [expanded]="true">Expanded (Full Width)</button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('button', { name: /Tiny/i })).toHaveClass('tiny');
    expect(canvas.getByRole('button', { name: /Small/i })).toHaveClass('small');
    expect(canvas.getByRole('button', { name: /Large/i })).toHaveClass('large');
    expect(canvas.getByRole('button', { name: /Expanded/i })).toHaveClass(
      'expanded',
    );

    // Default should NOT have size class
    const defaultBtn = canvas.getByRole('button', { name: /^Default$/i });
    expect(defaultBtn).not.toHaveClass('tiny', 'small', 'large');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Fill Styles
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Foundation fill styles: solid (default), hollow (outline), clear (text only).
 */
export const FillStyles: Story = {
  render: () => ({
    template: `
      <div class="margin-bottom-1">
        <button nfsButton class="margin-right-1">Solid (Default)</button>
        <button nfsButton fill="hollow" class="margin-right-1">Hollow</button>
        <button nfsButton fill="clear">Clear</button>
      </div>
      <div class="margin-bottom-1">
        <button nfsButton color="success" class="margin-right-1">Solid Success</button>
        <button nfsButton color="success" fill="hollow" class="margin-right-1">Hollow Success</button>
        <button nfsButton color="success" fill="clear">Clear Success</button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const solid = canvas.getByRole('button', { name: /^Solid \(Default\)$/i });
    expect(solid).not.toHaveClass('hollow', 'clear');

    expect(canvas.getByRole('button', { name: /^Hollow$/i })).toHaveClass(
      'hollow',
    );
    expect(canvas.getByRole('button', { name: /^Clear$/i })).toHaveClass(
      'clear',
    );
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Disabled States
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Demonstrates both hard disabled (native) and soft disabled states.
 *
 * - **Hard disabled**: Native `disabled` attribute. Button is not focusable.
 * - **Soft disabled**: `softDisabled` input. Button appears disabled but remains
 *   focusable, useful for showing tooltips on disabled buttons.
 */
export const DisabledStates: Story = {
  render: () => ({
    template: `
      <main>
        <div class="margin-bottom-1">
          <button nfsButton disabled class="margin-right-1">Disabled (native)</button>
          <button nfsButton [softDisabled]="true">Soft Disabled</button>
        </div>
        <p class="text-secondary">Soft disabled buttons remain focusable for tooltip access.</p>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Native disabled
    const nativeDisabled = canvas.getByRole('button', {
      name: /Disabled \(native\)/i,
    });
    expect(nativeDisabled).toBeDisabled();

    // Soft disabled - focusable but has aria-disabled
    const softDisabled = canvas.getByRole('button', { name: /Soft Disabled/i });
    expect(softDisabled).toHaveClass('disabled');
    expect(softDisabled).toHaveAttribute('aria-disabled', 'true');
    expect(softDisabled).not.toBeDisabled(); // Not native disabled

    // Verify soft disabled is focusable
    softDisabled.focus();
    expect(document.activeElement).toBe(softDisabled);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Links as Buttons
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Links styled as buttons with proper ARIA attributes.
 * Anchor elements get `role="button"` automatically for accessibility.
 */
export const LinksAsButtons: Story = {
  render: () => ({
    template: `
      <div class="margin-bottom-1">
        <a nfsButton href="#" (click)="$event.preventDefault()" class="margin-right-1">Link Button</a>
        <a nfsButton href="#" (click)="$event.preventDefault()" color="secondary" class="margin-right-1">Secondary Link</a>
        <a nfsButton [softDisabled]="true">Disabled Link</a>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Links should have role="button"
    const linkButton = canvas.getByRole('button', { name: /Link Button/i });
    expect(linkButton.tagName).toBe('A');
    expect(linkButton).toHaveAttribute('role', 'button');

    // Disabled link should have proper ARIA
    const disabledLink = canvas.getByRole('button', { name: /Disabled Link/i });
    expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    expect(disabledLink).toHaveAttribute('tabindex', '-1');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Icon-Only Buttons
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Icon-only buttons must have `aria-label` for accessibility.
 * The icon should have `aria-hidden="true"` to prevent screen reader duplication.
 */
export const IconOnlyButtons: Story = {
  render: () => ({
    template: `
      <div>
        <button nfsButton aria-label="Close" class="margin-right-1">
          <span aria-hidden="true">&times;</span>
        </button>
        <button nfsButton aria-label="Menu" color="secondary" class="margin-right-1">
          <span aria-hidden="true">&#9776;</span>
        </button>
        <button nfsButton aria-label="Search" fill="hollow">
          <span aria-hidden="true">&#128269;</span>
        </button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Icon-only buttons must have aria-label
    const closeBtn = canvas.getByRole('button', { name: /Close/i });
    expect(closeBtn).toHaveAttribute('aria-label', 'Close');

    const menuBtn = canvas.getByRole('button', { name: /Menu/i });
    expect(menuBtn).toHaveAttribute('aria-label', 'Menu');

    const searchBtn = canvas.getByRole('button', { name: /Search/i });
    expect(searchBtn).toHaveAttribute('aria-label', 'Search');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Combined Options
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Multiple inputs can be combined for customized buttons.
 */
export const CombinedOptions: Story = {
  render: () => ({
    template: `
      <main>
        <div class="margin-bottom-1">
          <button nfsButton size="large" color="success" fill="hollow" [expanded]="true">
            Large Hollow Success Expanded
          </button>
        </div>
        <div class="margin-bottom-1">
          <button nfsButton size="small" color="alert" fill="clear">
            Small Clear Alert
          </button>
        </div>
        <div>
          <button nfsButton size="tiny" color="warning" fill="hollow">
            Tiny Hollow Warning
          </button>
        </div>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const combined1 = canvas.getByRole('button', {
      name: /Large Hollow Success/i,
    });
    expect(combined1).toHaveClass(
      'button',
      'large',
      'success',
      'hollow',
      'expanded',
    );

    const combined2 = canvas.getByRole('button', {
      name: /Small Clear Alert/i,
    });
    expect(combined2).toHaveClass('button', 'small', 'alert', 'clear');

    const combined3 = canvas.getByRole('button', {
      name: /Tiny Hollow Warning/i,
    });
    expect(combined3).toHaveClass('button', 'tiny', 'warning', 'hollow');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Form Integration
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Buttons in forms with different `type` attributes.
 * Native button attributes work normally since NfsButton uses attribute selector.
 */
export const FormIntegration: Story = {
  render: () => ({
    template: `
      <main>
        <form (submit)="$event.preventDefault()">
          <div class="margin-bottom-1">
            <label for="name">Name</label>
            <input type="text" id="name" placeholder="Enter name" />
          </div>
          <div>
            <button nfsButton type="submit" color="success" class="margin-right-1">Submit</button>
            <button nfsButton type="reset" color="secondary" class="margin-right-1">Reset</button>
            <button nfsButton type="button" fill="hollow">Cancel</button>
          </div>
        </form>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const submitBtn = canvas.getByRole('button', { name: /Submit/i });
    expect(submitBtn).toHaveAttribute('type', 'submit');

    const resetBtn = canvas.getByRole('button', { name: /Reset/i });
    expect(resetBtn).toHaveAttribute('type', 'reset');

    const cancelBtn = canvas.getByRole('button', { name: /Cancel/i });
    expect(cancelBtn).toHaveAttribute('type', 'button');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Keyboard Navigation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Buttons support native keyboard navigation (Tab, Enter, Space).
 * No custom keyboard handling needed for native `<button>` elements.
 */
export const KeyboardNavigation: Story = {
  render: () => ({
    template: `
      <main>
        <div>
          <button nfsButton class="margin-right-1" id="btn1">Button 1</button>
          <button nfsButton color="secondary" class="margin-right-1" id="btn2">Button 2</button>
          <button nfsButton color="success" id="btn3">Button 3</button>
        </div>
        <p class="margin-top-1 text-secondary">Use Tab to navigate, Enter/Space to activate.</p>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const btn1 = canvas.getByRole('button', { name: /Button 1/i });
    const btn2 = canvas.getByRole('button', { name: /Button 2/i });
    const btn3 = canvas.getByRole('button', { name: /Button 3/i });

    // Focus first button
    btn1.focus();
    expect(document.activeElement).toBe(btn1);

    // Tab to next button
    await userEvent.tab();
    expect(document.activeElement).toBe(btn2);

    // Tab to third button
    await userEvent.tab();
    expect(document.activeElement).toBe(btn3);

    // Activate with Enter (native behavior)
    await userEvent.keyboard('{Enter}');

    // Activate with Space (native behavior)
    await userEvent.keyboard(' ');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSS Custom Property Theming
// ═══════════════════════════════════════════════════════════════════════════════

interface ThemeControlsArgs {
  buttonPadding: string;
  buttonFontSize: string;
  buttonRadius: string;
  buttonOpacityDisabled: number;
  buttonTransition: string;
}
type ThemeControlsStory = StoryObj<ThemeControlsArgs>;

/**
 * Customize button appearance via CSS custom properties.
 *
 * Available properties:
 * - `--nfs-button-padding`: Button padding
 * - `--nfs-button-font-size`: Font size
 * - `--nfs-button-radius`: Border radius
 * - `--nfs-button-opacity-disabled`: Opacity for disabled state
 * - `--nfs-button-transition`: Hover transition
 */
export const ThemeControls: ThemeControlsStory = {
  args: {
    buttonPadding: '0.85em 1em',
    buttonFontSize: '0.9rem',
    buttonRadius: '0',
    buttonOpacityDisabled: 0.25,
    buttonTransition: 'background-color 0.25s ease-out, color 0.25s ease-out',
  },
  argTypes: {
    buttonPadding: {
      name: '--nfs-button-padding',
      control: 'text',
      table: { category: 'CSS Custom Properties' },
    },
    buttonFontSize: {
      name: '--nfs-button-font-size',
      control: 'text',
      table: { category: 'CSS Custom Properties' },
    },
    buttonRadius: {
      name: '--nfs-button-radius',
      control: 'text',
      table: { category: 'CSS Custom Properties' },
    },
    buttonOpacityDisabled: {
      name: '--nfs-button-opacity-disabled',
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'CSS Custom Properties' },
    },
    buttonTransition: {
      name: '--nfs-button-transition',
      control: 'text',
      table: { category: 'CSS Custom Properties' },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div
        [style.--nfs-button-padding]="buttonPadding"
        [style.--nfs-button-font-size]="buttonFontSize"
        [style.--nfs-button-radius]="buttonRadius"
        [style.--nfs-button-opacity-disabled]="buttonOpacityDisabled"
        [style.--nfs-button-transition]="buttonTransition"
      >
        <div class="margin-bottom-1">
          <button nfsButton color="primary" class="margin-right-1">Primary</button>
          <button nfsButton color="secondary" class="margin-right-1">Secondary</button>
          <button nfsButton color="success">Success</button>
        </div>
        <div class="margin-bottom-1">
          <button nfsButton fill="hollow" class="margin-right-1">Hollow</button>
          <button nfsButton fill="clear" class="margin-right-1">Clear</button>
          <button nfsButton [softDisabled]="true">Disabled</button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify CSS custom properties actually affect button computed styles
    const primaryButton = canvas.getByRole('button', { name: /Primary/i });
    const primaryStyle = getComputedStyle(primaryButton);
    const fontSizePx = parseFloat(primaryStyle.fontSize);

    // Verify padding is applied (em is relative to element's font-size)
    // Format: '0.85em 1em' = vertical horizontal
    const [expectedVertical, expectedHorizontal] =
      args.buttonPadding.split(' ');
    expect(pxToEm(primaryStyle.paddingTop, fontSizePx)).toBe(expectedVertical);
    expect(pxToEm(primaryStyle.paddingLeft, fontSizePx)).toBe(
      expectedHorizontal,
    );

    // Verify font-size is applied (convert computed px back to rem for readable assertion)
    expect(pxToRem(primaryStyle.fontSize)).toBe(args.buttonFontSize);

    // Verify border-radius is applied (computed styles always use 'px')
    const expectedRadius =
      args.buttonRadius === '0' ? '0px' : args.buttonRadius;
    expect(primaryStyle.borderRadius).toBe(expectedRadius);

    // Verify disabled button opacity
    const disabledButton = canvas.getByRole('button', { name: /Disabled/i });
    const disabledStyle = getComputedStyle(disabledButton);
    expect(disabledStyle.opacity).toBe(String(args.buttonOpacityDisabled));

    // Verify transition is applied
    expect(primaryStyle.transition).toBe(args.buttonTransition);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Accessibility Comprehensive
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Comprehensive accessibility verification for NfsButton.
 * Tests ARIA attributes, roles, and states.
 */
export const AccessibilityComprehensive: Story = {
  render: () => ({
    template: `
      <main>
        <div class="margin-bottom-1">
          <h3>Standard Buttons</h3>
          <button nfsButton class="margin-right-1">Standard Button</button>
          <button nfsButton disabled class="margin-right-1">Disabled Button</button>
          <button nfsButton [softDisabled]="true">Soft Disabled Button</button>
        </div>
        <div class="margin-bottom-1">
          <h3>Links as Buttons</h3>
          <a nfsButton href="#" (click)="$event.preventDefault()" class="margin-right-1">Link Button</a>
          <a nfsButton [softDisabled]="true">Disabled Link</a>
        </div>
        <div>
          <h3>Icon Buttons</h3>
          <button nfsButton aria-label="Close dialog">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Standard button - no role needed (native button)
    const standardBtn = canvas.getByRole('button', {
      name: /Standard Button/i,
    });
    expect(standardBtn.tagName).toBe('BUTTON');
    expect(standardBtn).not.toHaveAttribute('role'); // Native buttons don't need role

    // Disabled button - use exact match to avoid matching "Soft Disabled Button"
    const disabledBtn = canvas.getByRole('button', {
      name: /^Disabled Button$/i,
    });
    expect(disabledBtn).toBeDisabled();

    // Soft disabled button
    const softDisabledBtn = canvas.getByRole('button', {
      name: /^Soft Disabled Button$/i,
    });
    expect(softDisabledBtn).toHaveAttribute('aria-disabled', 'true');
    expect(softDisabledBtn).not.toBeDisabled();

    // Link as button - requires role="button"
    const linkBtn = canvas.getByRole('button', { name: /Link Button/i });
    expect(linkBtn.tagName).toBe('A');
    expect(linkBtn).toHaveAttribute('role', 'button');

    // Disabled link
    const disabledLink = canvas.getByRole('button', { name: /Disabled Link/i });
    expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    expect(disabledLink).toHaveAttribute('tabindex', '-1');

    // Icon button with aria-label
    const iconBtn = canvas.getByRole('button', { name: /Close dialog/i });
    expect(iconBtn).toHaveAttribute('aria-label', 'Close dialog');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Soft Disabled Click Prevention
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifies that `softDisabled` buttons prevent click events from firing.
 *
 * This is critical for:
 * - Preventing user-defined click handlers from executing
 * - Blocking form submission on submit buttons
 * - Preventing anchor navigation
 *
 * Uses `event.preventDefault()` and `event.stopImmediatePropagation()`.
 */
export const SoftDisabledClickPrevention: Story = {
  render: () => ({
    props: {
      clickCount: 0,
      formSubmitCount: 0,
      anchorClickCount: 0,
    },
    template: `
      <main>
        <section class="margin-bottom-2">
          <h3>Button Click Prevention</h3>
          <button
            nfsButton
            [softDisabled]="true"
            (click)="clickCount = clickCount + 1"
            data-testid="soft-disabled-btn"
          >
            Soft Disabled (clicks: {{ clickCount }})
          </button>
        </section>

        <section class="margin-bottom-2">
          <h3>Form Submission Prevention</h3>
          <form (ngSubmit)="formSubmitCount = formSubmitCount + 1">
            <button
              nfsButton
              type="submit"
              [softDisabled]="true"
              color="success"
              data-testid="soft-disabled-submit"
            >
              Submit (submits: {{ formSubmitCount }})
            </button>
          </form>
        </section>

        <section>
          <h3>Anchor Navigation Prevention</h3>
          <a
            nfsButton
            href="#should-not-navigate"
            [softDisabled]="true"
            (click)="anchorClickCount = anchorClickCount + 1"
            data-testid="soft-disabled-anchor"
          >
            Link Button (clicks: {{ anchorClickCount }})
          </a>
        </section>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Button click prevention
    const softDisabledBtn = canvas.getByTestId('soft-disabled-btn');
    expect(softDisabledBtn).toHaveTextContent('clicks: 0');

    // Simulate click via dispatchEvent (userEvent.click respects aria-disabled)
    softDisabledBtn.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    expect(softDisabledBtn).toHaveTextContent('clicks: 0');

    // Test 2: Form submission prevention
    const softDisabledSubmit = canvas.getByTestId('soft-disabled-submit');
    expect(softDisabledSubmit).toHaveTextContent('submits: 0');

    softDisabledSubmit.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    expect(softDisabledSubmit).toHaveTextContent('submits: 0');

    // Test 3: Anchor navigation prevention
    const softDisabledAnchor = canvas.getByTestId('soft-disabled-anchor');
    expect(softDisabledAnchor).toHaveTextContent('clicks: 0');

    // Capture the current URL hash before click
    const hashBefore = window.location.hash;

    softDisabledAnchor.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );

    // Click handler should not have fired
    expect(softDisabledAnchor).toHaveTextContent('clicks: 0');

    // Hash should not have changed (navigation prevented)
    expect(window.location.hash).toBe(hashBefore);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Anchor Space Key Activation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifies that anchor buttons respond to Space key per WAI-ARIA button pattern.
 *
 * Native `<button>` elements respond to both Enter and Space keys, but `<a>`
 * elements only respond to Enter. When `role="button"` is applied to anchors,
 * users expect Space to work too.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
export const AnchorSpaceKeyActivation: Story = {
  render: () => ({
    props: {
      normalClickCount: 0,
      disabledClickCount: 0,
    },
    template: `
      <main>
        <section class="margin-bottom-2">
          <h3>Normal Anchor Button</h3>
          <a
            nfsButton
            href="#"
            (click)="$event.preventDefault(); normalClickCount = normalClickCount + 1"
            data-testid="normal-anchor"
          >
            Link Button (clicks: {{ normalClickCount }})
          </a>
          <p class="margin-top-1 text-secondary">Focus and press Space to activate</p>
        </section>

        <section>
          <h3>Soft Disabled Anchor Button</h3>
          <a
            nfsButton
            [softDisabled]="true"
            href="#"
            (click)="$event.preventDefault(); disabledClickCount = disabledClickCount + 1"
            data-testid="disabled-anchor"
          >
            Disabled Link (clicks: {{ disabledClickCount }})
          </a>
          <p class="margin-top-1 text-secondary">Space should NOT activate when disabled</p>
        </section>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Space key activates normal anchor button
    const normalAnchor = canvas.getByTestId('normal-anchor');
    expect(normalAnchor).toHaveTextContent('clicks: 0');
    expect(normalAnchor).toHaveAttribute('role', 'button');

    // Focus and press Space
    normalAnchor.focus();
    expect(document.activeElement).toBe(normalAnchor);

    await userEvent.keyboard(' '); // Space key
    expect(normalAnchor).toHaveTextContent('clicks: 1');

    // Press Space again to confirm consistent behavior
    await userEvent.keyboard(' ');
    expect(normalAnchor).toHaveTextContent('clicks: 2');

    // Test 2: Space key does NOT activate soft-disabled anchor
    const disabledAnchor = canvas.getByTestId('disabled-anchor');
    expect(disabledAnchor).toHaveTextContent('clicks: 0');
    expect(disabledAnchor).toHaveAttribute('aria-disabled', 'true');

    // Force focus (tabindex=-1 prevents normal tab navigation)
    disabledAnchor.focus();

    await userEvent.keyboard(' ');
    expect(disabledAnchor).toHaveTextContent('clicks: 0'); // Should NOT increment

    // Test 3: Enter key still works on normal anchor
    normalAnchor.focus();
    await userEvent.keyboard('{Enter}');
    expect(normalAnchor).toHaveTextContent('clicks: 3'); // Should increment
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Boolean Attribute Syntax
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Demonstrates HTML boolean attribute syntax support via `booleanAttribute` transform.
 *
 * Angular's `booleanAttribute` transform allows boolean inputs to be set using
 * standard HTML attribute syntax (without square brackets), matching native HTML
 * boolean attributes like `disabled`, `readonly`, etc.
 *
 * **Supported syntaxes:**
 * - `expanded` — presence means `true` (HTML attribute style)
 * - `[expanded]="true"` — property binding (Angular style)
 * - `expanded="true"` — string `"true"` coerced to boolean `true`
 * - `expanded="false"` — string `"false"` coerced to boolean `false`
 *
 * @see https://angular.dev/api/core/booleanAttribute
 */
export const BooleanAttributeSyntax: Story = {
  render: () => ({
    template: `
      <main>
        <section class="margin-bottom-2">
          <h3>HTML Attribute Syntax (presence = true)</h3>
          <div class="margin-bottom-1">
            <button nfsButton expanded data-testid="expanded-attr">Expanded (attribute)</button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton softDisabled data-testid="soft-disabled-attr">Soft Disabled (attribute)</button>
          </div>
        </section>

        <section class="margin-bottom-2">
          <h3>Property Binding Syntax (traditional)</h3>
          <div class="margin-bottom-1">
            <button nfsButton [expanded]="true" data-testid="expanded-binding">Expanded (binding)</button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton [softDisabled]="true" data-testid="soft-disabled-binding">Soft Disabled (binding)</button>
          </div>
        </section>

        <section class="margin-bottom-2">
          <h3>String Attribute Syntax (coerced)</h3>
          <div class="margin-bottom-1">
            <button nfsButton expanded="true" data-testid="expanded-string-true">expanded="true"</button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton expanded="false" data-testid="expanded-string-false">expanded="false"</button>
          </div>
        </section>

        <section>
          <h3>No Attribute (default false)</h3>
          <div>
            <button nfsButton data-testid="no-attrs">Default (no expanded, no softDisabled)</button>
          </div>
        </section>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: HTML attribute syntax (presence = true)
    const expandedAttr = canvas.getByTestId('expanded-attr');
    expect(expandedAttr).toHaveClass('expanded');

    const softDisabledAttr = canvas.getByTestId('soft-disabled-attr');
    expect(softDisabledAttr).toHaveClass('disabled');
    expect(softDisabledAttr).toHaveAttribute('aria-disabled', 'true');

    // Test 2: Property binding syntax (traditional Angular)
    const expandedBinding = canvas.getByTestId('expanded-binding');
    expect(expandedBinding).toHaveClass('expanded');

    const softDisabledBinding = canvas.getByTestId('soft-disabled-binding');
    expect(softDisabledBinding).toHaveClass('disabled');
    expect(softDisabledBinding).toHaveAttribute('aria-disabled', 'true');

    // Test 3: String attribute syntax - "true" should coerce to true
    const expandedStringTrue = canvas.getByTestId('expanded-string-true');
    expect(expandedStringTrue).toHaveClass('expanded');

    // Test 4: String attribute syntax - "false" should coerce to false
    const expandedStringFalse = canvas.getByTestId('expanded-string-false');
    expect(expandedStringFalse).not.toHaveClass('expanded');

    // Test 5: No attributes (default false values)
    const noAttrs = canvas.getByTestId('no-attrs');
    expect(noAttrs).not.toHaveClass('expanded');
    expect(noAttrs).not.toHaveClass('disabled');
    expect(noAttrs).not.toHaveAttribute('aria-disabled');
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Responsive Expanded
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Responsive expanded buttons change width based on viewport breakpoints.
 *
 * Foundation breakpoints (default):
 * - **small**: 0px+ (mobile first)
 * - **medium**: 640px+
 * - **large**: 1024px+
 *
 * **Breakpoint-only classes** (exclusive to one breakpoint):
 * - `small-only-expanded`: Full-width only on small screens (< 640px)
 * - `medium-only-expanded`: Full-width only on medium screens (640px - 1023px)
 * - `large-only-expanded`: Full-width only on large screens (1024px+)
 *
 * **Breakpoint-up classes** (breakpoint and larger):
 * - `medium-expanded`: Full-width on medium screens and larger (640px+)
 * - `large-expanded`: Full-width on large screens and larger (1024px+)
 *
 * **Breakpoint-down classes** (breakpoint and smaller):
 * - `medium-down-expanded`: Full-width on medium screens and smaller (< 1024px)
 * - `large-down-expanded`: Full-width on large screens and smaller (all screens)
 *
 * @see https://get.foundation/sites/docs/button.html#responsive-expanded
 */
export const ResponsiveExpanded: Story = {
  render: () => ({
    template: `
      <main>
        <section class="margin-bottom-2">
          <h3>Breakpoint-Only (exclusive to one breakpoint)</h3>
          <div class="margin-bottom-1">
            <button nfsButton expanded="small-only" data-testid="small-only">
              small-only-expanded (full-width only on small)
            </button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton expanded="medium-only" data-testid="medium-only">
              medium-only-expanded (full-width only on medium)
            </button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton expanded="large-only" data-testid="large-only">
              large-only-expanded (full-width only on large)
            </button>
          </div>
        </section>

        <section class="margin-bottom-2">
          <h3>Breakpoint and Up</h3>
          <div class="margin-bottom-1">
            <button nfsButton expanded="medium" data-testid="medium-up">
              medium-expanded (full-width on medium+)
            </button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton expanded="large" data-testid="large-up">
              large-expanded (full-width on large+)
            </button>
          </div>
        </section>

        <section class="margin-bottom-2">
          <h3>Breakpoint and Down</h3>
          <div class="margin-bottom-1">
            <button nfsButton expanded="medium-down" data-testid="medium-down">
              medium-down-expanded (full-width on medium and smaller)
            </button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton expanded="large-down" data-testid="large-down">
              large-down-expanded (full-width on large and smaller)
            </button>
          </div>
        </section>

        <section>
          <h3>Always Expanded (existing behavior)</h3>
          <div>
            <button nfsButton expanded data-testid="always-expanded">
              expanded (always full-width)
            </button>
          </div>
        </section>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify breakpoint-only classes
    const smallOnly = canvas.getByTestId('small-only');
    expect(smallOnly).toHaveClass('small-only-expanded');
    expect(smallOnly).not.toHaveClass('expanded');

    const mediumOnly = canvas.getByTestId('medium-only');
    expect(mediumOnly).toHaveClass('medium-only-expanded');
    expect(mediumOnly).not.toHaveClass('expanded');

    const largeOnly = canvas.getByTestId('large-only');
    expect(largeOnly).toHaveClass('large-only-expanded');
    expect(largeOnly).not.toHaveClass('expanded');

    // Verify breakpoint-up classes
    const mediumUp = canvas.getByTestId('medium-up');
    expect(mediumUp).toHaveClass('medium-expanded');
    expect(mediumUp).not.toHaveClass('expanded');

    const largeUp = canvas.getByTestId('large-up');
    expect(largeUp).toHaveClass('large-expanded');
    expect(largeUp).not.toHaveClass('expanded');

    // Verify breakpoint-down classes
    const mediumDown = canvas.getByTestId('medium-down');
    expect(mediumDown).toHaveClass('medium-down-expanded');
    expect(mediumDown).not.toHaveClass('expanded');

    const largeDown = canvas.getByTestId('large-down');
    expect(largeDown).toHaveClass('large-down-expanded');
    expect(largeDown).not.toHaveClass('expanded');

    // Verify always-expanded
    const alwaysExpanded = canvas.getByTestId('always-expanded');
    expect(alwaysExpanded).toHaveClass('expanded');
    expect(alwaysExpanded).not.toHaveClass(
      'small-only-expanded',
      'medium-only-expanded',
      'large-only-expanded',
      'medium-expanded',
      'large-expanded',
      'medium-down-expanded',
      'large-down-expanded',
    );
  },
};

/**
 * Demonstrates all supported syntaxes for the responsive expanded input.
 *
 * The `expanded` input supports:
 * - **Boolean values**: `[expanded]="true"` / `[expanded]="false"`
 * - **Attribute presence**: `expanded` (= true)
 * - **String boolean**: `expanded="true"` / `expanded="false"`
 * - **Breakpoint strings**: `expanded="medium"`, `expanded="large-down"`, etc.
 */
export const ExpandedInputSyntax: Story = {
  render: () => ({
    template: `
      <main>
        <section class="margin-bottom-2">
          <h3>Boolean Property Binding</h3>
          <div class="margin-bottom-1">
            <button nfsButton [expanded]="true" data-testid="binding-true">
              [expanded]="true"
            </button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton [expanded]="false" data-testid="binding-false">
              [expanded]="false"
            </button>
          </div>
        </section>

        <section class="margin-bottom-2">
          <h3>Attribute Presence (= true)</h3>
          <div class="margin-bottom-1">
            <button nfsButton expanded data-testid="attr-presence">
              expanded (attribute presence)
            </button>
          </div>
        </section>

        <section class="margin-bottom-2">
          <h3>String Boolean Values</h3>
          <div class="margin-bottom-1">
            <button nfsButton expanded="true" data-testid="string-true">
              expanded="true"
            </button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton expanded="false" data-testid="string-false">
              expanded="false"
            </button>
          </div>
        </section>

        <section>
          <h3>String Breakpoint Values</h3>
          <div class="margin-bottom-1">
            <button nfsButton expanded="medium" data-testid="string-medium">
              expanded="medium"
            </button>
          </div>
          <div class="margin-bottom-1">
            <button nfsButton expanded="large-down" data-testid="string-large-down">
              expanded="large-down"
            </button>
          </div>
        </section>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Boolean binding true -> .expanded
    expect(canvas.getByTestId('binding-true')).toHaveClass('expanded');

    // Boolean binding false -> no expanded class
    expect(canvas.getByTestId('binding-false')).not.toHaveClass('expanded');

    // Attribute presence -> .expanded
    expect(canvas.getByTestId('attr-presence')).toHaveClass('expanded');

    // String "true" -> .expanded
    expect(canvas.getByTestId('string-true')).toHaveClass('expanded');

    // String "false" -> no expanded class
    expect(canvas.getByTestId('string-false')).not.toHaveClass('expanded');

    // String "medium" -> .medium-expanded (not .expanded)
    const mediumBtn = canvas.getByTestId('string-medium');
    expect(mediumBtn).toHaveClass('medium-expanded');
    expect(mediumBtn).not.toHaveClass('expanded');

    // String "large-down" -> .large-down-expanded (not .expanded)
    const largeDownBtn = canvas.getByTestId('string-large-down');
    expect(largeDownBtn).toHaveClass('large-down-expanded');
    expect(largeDownBtn).not.toHaveClass('expanded');
  },
};
