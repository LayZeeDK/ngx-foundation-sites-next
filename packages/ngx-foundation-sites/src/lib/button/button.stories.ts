import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { NfsButton } from './button';
import { argsToLiteralTemplate } from '../util-storybook/args-to-literal-template';

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
  },
  render: (args) => ({
    props: args,
    template: `
      <div
        [style.--nfs-button-padding]="buttonPadding"
        [style.--nfs-button-font-size]="buttonFontSize"
        [style.--nfs-button-radius]="buttonRadius"
        [style.--nfs-button-opacity-disabled]="buttonOpacityDisabled"
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
    // Verify CSS custom properties are applied
    const container = canvasElement.querySelector('div') as HTMLElement;
    const style = getComputedStyle(container);

    expect(style.getPropertyValue('--nfs-button-padding').trim()).toBe(
      args.buttonPadding,
    );
    expect(style.getPropertyValue('--nfs-button-font-size').trim()).toBe(
      args.buttonFontSize,
    );
    expect(style.getPropertyValue('--nfs-button-radius').trim()).toBe(
      args.buttonRadius,
    );
    expect(style.getPropertyValue('--nfs-button-opacity-disabled').trim()).toBe(
      String(args.buttonOpacityDisabled),
    );
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
