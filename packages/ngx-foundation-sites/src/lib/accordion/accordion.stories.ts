import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { NfsAccordion } from './accordion';
import { NfsAccordionItem } from './accordion-item';
import { NfsAccordionTitleDef } from './accordion-title';
import { NfsAccordionContentDef } from './accordion-content';

const meta: Meta<NfsAccordion> = {
  title: 'Components/Accordion',
  component: NfsAccordion,
  tags: ['autodocs'],
  // Descriptions come from JSDoc comments in the component via Compodoc.
  // Only custom control configurations are needed here.
  argTypes: {
    deepLinkSmudgeDelay: {
      control: { type: 'number', min: 0, max: 1000 },
    },
  },
};

export default meta;
type Story = StoryObj<NfsAccordion>;

/**
 * Extended args type for the ThemeControls story.
 * Includes CSS custom property values alongside component inputs.
 */
interface ThemeControlsArgs {
  // Component inputs
  multiExpandable: boolean;
  disabled: boolean;
  allowAllClosed: boolean;
  // CSS Custom Properties
  accordionBackground: string;
  accordionTitleFontSize: string;
  accordionItemColor: string;
  accordionItemBackgroundHover: string;
  accordionItemPadding: string;
  accordionContentBackground: string;
  accordionContentBorder: string;
  accordionContentColor: string;
  accordionContentPadding: string;
  accordionSlideSpeed: string;
  accordionSlideEasing: string;
}
type ThemeControlsStory = StoryObj<ThemeControlsArgs>;

export const Default: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    softDisabled: true,
    deepLink: false,
    deepLinkSmudge: false,
    deepLinkSmudgeDelay: 300,
    updateHistory: false,
    allowAllClosed: false,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        [softDisabled]="softDisabled"
        [deepLink]="deepLink"
        [deepLinkSmudge]="deepLinkSmudge"
        [deepLinkSmudgeDelay]="deepLinkSmudgeDelay"
        [updateHistory]="updateHistory"
        [allowAllClosed]="allowAllClosed"
      >
        <nfs-accordion-item panelId="panel-1">
          <span *nfsAccordionTitle>Accordion 1</span>
          <p *nfsAccordionContent>Panel 1 content. Lorem ipsum dolor sit amet.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2">
          <span *nfsAccordionTitle>Accordion 2</span>
          <p *nfsAccordionContent>Panel 2 content. Suspendisse eu ligula.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-3">
          <span *nfsAccordionTitle>Accordion 3</span>
          <p *nfsAccordionContent>Panel 3 content. Nullam sed est.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click first accordion
    const trigger1 = canvas.getByRole('button', { name: /Accordion 1/i });
    await userEvent.click(trigger1);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Click second accordion - first should close (single expand mode)
    const trigger2 = canvas.getByRole('button', { name: /Accordion 2/i });
    await userEvent.click(trigger2);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

export const MultiExpand: Story = {
  args: { multiExpandable: true, disabled: false },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger1 = canvas.getByRole('button', { name: /Accordion 1/i });
    const trigger2 = canvas.getByRole('button', { name: /Accordion 2/i });

    // Open both panels
    await userEvent.click(trigger1);
    await userEvent.click(trigger2);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

export const Disabled: Story = {
  args: { multiExpandable: false, disabled: true },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion [multiExpandable]="multiExpandable" [disabled]="disabled">
        <nfs-accordion-item panelId="panel-1" [disabled]="true">
          <span *nfsAccordionTitle>Disabled Accordion</span>
          <p *nfsAccordionContent>This panel cannot be opened.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2">
          <span *nfsAccordionTitle>Also Disabled (via group)</span>
          <p *nfsAccordionContent>This panel cannot be opened either.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger1 = canvas.getByRole('button', {
      name: /Disabled Accordion/i,
    });
    const trigger2 = canvas.getByRole('button', {
      name: /Also Disabled \(via group\)/i,
    });

    // Both triggers should have aria-disabled="true"
    expect(trigger1).toHaveAttribute('aria-disabled', 'true');
    expect(trigger2).toHaveAttribute('aria-disabled', 'true');

    // Both should start collapsed
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    expect(trigger2).toHaveAttribute('aria-expanded', 'false');

    // Clicking disabled buttons should not expand them
    await userEvent.click(trigger1);
    await userEvent.click(trigger2);

    // Verify they remain collapsed after click attempts
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

export const InitiallyExpanded: Story = {
  args: { multiExpandable: false, disabled: false },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion [multiExpandable]="multiExpandable">
        <nfs-accordion-item panelId="panel-1" [expanded]="true">
          <span *nfsAccordionTitle>Initially Open</span>
          <p *nfsAccordionContent>This panel starts expanded.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2">
          <span *nfsAccordionTitle>Initially Closed</span>
          <p *nfsAccordionContent>This panel starts collapsed.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger1 = canvas.getByRole('button', { name: /Initially Open/i });
    const trigger2 = canvas.getByRole('button', { name: /Initially Closed/i });

    // First panel should start expanded (use waitFor for async rendering)
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Second panel should start collapsed
    expect(trigger2).toHaveAttribute('aria-expanded', 'false');

    // Verify content is visible for expanded panel
    const panel1Content = canvas.getByText(/This panel starts expanded/i);
    expect(panel1Content).toBeVisible();
  },
};

export const KeyboardNavigation: Story = {
  args: { multiExpandable: false, disabled: false },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger1 = canvas.getByRole('button', { name: /Accordion 1/i });
    trigger1.focus();

    // Press Enter to open
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Press ArrowDown to move to next
    await userEvent.keyboard('{ArrowDown}');
    const trigger2 = canvas.getByRole('button', { name: /Accordion 2/i });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });
  },
};

/**
 * Demonstrates slow animation using CSS custom property.
 * Animation speed is controlled via `--nfs-accordion-slide-speed` CSS custom property.
 */
export const SlowAnimation: Story = {
  args: { multiExpandable: false, disabled: false },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        style="--nfs-accordion-slide-speed: 500ms"
      >
        <nfs-accordion-item panelId="panel-1">
          <span *nfsAccordionTitle>Accordion 1</span>
          <p *nfsAccordionContent>Panel 1 content. Lorem ipsum dolor sit amet.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2">
          <span *nfsAccordionTitle>Accordion 2</span>
          <p *nfsAccordionContent>Panel 2 content. Suspendisse eu ligula.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-3">
          <span *nfsAccordionTitle>Accordion 3</span>
          <p *nfsAccordionContent>Panel 3 content. Nullam sed est.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify CSS custom property is set
    const accordion = canvasElement.querySelector('nfs-accordion');
    expect(accordion).toBeTruthy();

    if (!accordion) return;
    const style = getComputedStyle(accordion);
    expect(style.getPropertyValue('--nfs-accordion-slide-speed').trim()).toBe(
      '500ms',
    );

    // Click to expand and verify animation works
    const trigger1 = canvas.getByRole('button', { name: /Accordion 1/i });
    await userEvent.click(trigger1);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

/**
 * Demonstrates disabling animation using CSS custom property.
 * Set `--nfs-accordion-slide-speed: 0ms` to disable animation.
 * This is also useful for reduced motion accessibility preferences.
 */
export const NoAnimation: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    deepLink: false,
    deepLinkSmudge: false,
    deepLinkSmudgeDelay: 300,
    updateHistory: false,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        [deepLink]="deepLink"
        [deepLinkSmudge]="deepLinkSmudge"
        [deepLinkSmudgeDelay]="deepLinkSmudgeDelay"
        [updateHistory]="updateHistory"
        style="--nfs-accordion-slide-speed: 0ms"
      >
        <nfs-accordion-item panelId="panel-1">
          <span *nfsAccordionTitle>Accordion 1</span>
          <p *nfsAccordionContent>Panel 1 content. Lorem ipsum dolor sit amet.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2">
          <span *nfsAccordionTitle>Accordion 2</span>
          <p *nfsAccordionContent>Panel 2 content. Suspendisse eu ligula.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-3">
          <span *nfsAccordionTitle>Accordion 3</span>
          <p *nfsAccordionContent>Panel 3 content. Nullam sed est.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify CSS custom property is set to 0
    const accordion = canvasElement.querySelector('nfs-accordion');
    expect(accordion).toBeTruthy();

    if (!accordion) return;
    const style = getComputedStyle(accordion);
    expect(style.getPropertyValue('--nfs-accordion-slide-speed').trim()).toBe(
      '0ms',
    );

    // Click to expand - should be instant
    const trigger1 = canvas.getByRole('button', { name: /Accordion 1/i });
    await userEvent.click(trigger1);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

export const DeepLink: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    deepLink: true,
    deepLinkSmudge: true,
    deepLinkSmudgeDelay: 300,
    updateHistory: true,
  },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click to expand first panel
    const trigger1 = canvas.getByRole('button', { name: /Accordion 1/i });
    await userEvent.click(trigger1);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Verify URL hash was updated (in iframe context, this may differ)
    // The deep link feature is primarily tested via manual interaction
    // since Storybook runs in an iframe which may have different URL behavior

    // Click second panel - hash should update
    const trigger2 = canvas.getByRole('button', { name: /Accordion 2/i });
    await userEvent.click(trigger2);

    await waitFor(() => {
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
      // In single-expand mode, first panel should close
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

/**
 * Multi-expand mode with deep linking enabled.
 * Used by E2E tests to verify hash clearing when all panels are closed.
 * No play function - E2E tests handle all interactions.
 */
export const MultiExpandDeepLink: Story = {
  args: {
    multiExpandable: true,
    disabled: false,
    deepLink: true,
    deepLinkSmudge: true,
    deepLinkSmudgeDelay: 300,
    updateHistory: true,
    allowAllClosed: true,
  },
  render: Default.render,
};

/**
 * Deep linking with updateHistory=false.
 * Uses replaceState instead of pushState, so browser history is not modified.
 * No play function - E2E tests handle all interactions.
 */
export const DeepLinkNoHistory: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    deepLink: true,
    deepLinkSmudge: false,
    deepLinkSmudgeDelay: 300,
    updateHistory: false,
    allowAllClosed: true,
  },
  render: Default.render,
};

export const RequireOneOpen: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    allowAllClosed: false,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        [allowAllClosed]="allowAllClosed"
      >
        <nfs-accordion-item panelId="panel-1">
          <span *nfsAccordionTitle>Panel 1</span>
          <p *nfsAccordionContent>Panel 1 content.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2">
          <span *nfsAccordionTitle>Panel 2</span>
          <p *nfsAccordionContent>Panel 2 content.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-3">
          <span *nfsAccordionTitle>Panel 3</span>
          <p *nfsAccordionContent>Panel 3 content.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger1 = canvas.getByRole('button', { name: /Panel 1/i });
    const trigger2 = canvas.getByRole('button', { name: /Panel 2/i });

    // First panel should be auto-opened since allowAllClosed=false
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Click panel 2 - panel 1 should close, panel 2 should open
    await userEvent.click(trigger2);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    // Try to close panel 2 by clicking it again - should stay open
    await userEvent.click(trigger2);

    // Panel 2 should remain open (can't close the last panel)
    await waitFor(() => {
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

/**
 * Comprehensive accessibility testing story.
 * Verifies all ARIA attributes, focus management, and keyboard interactions
 * required for WCAG 2.1 AA compliance.
 */
export const Accessibility: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    // Use instant animation (0ms) for reliable testing
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        [allowAllClosed]="allowAllClosed"
        style="--nfs-accordion-slide-speed: 0ms"
      >
        <nfs-accordion-item panelId="panel-1">
          <span *nfsAccordionTitle>Accordion 1</span>
          <p *nfsAccordionContent>Panel 1 content. Lorem ipsum dolor sit amet.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2">
          <span *nfsAccordionTitle>Accordion 2</span>
          <p *nfsAccordionContent>Panel 2 content. Suspendisse eu ligula.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-3">
          <span *nfsAccordionTitle>Accordion 3</span>
          <p *nfsAccordionContent>Panel 3 content. Nullam sed est.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Get all accordion triggers
    const trigger1 = canvas.getByRole('button', { name: /Accordion 1/i });
    const trigger2 = canvas.getByRole('button', { name: /Accordion 2/i });
    const trigger3 = canvas.getByRole('button', { name: /Accordion 3/i });

    // ═══════════════════════════════════════════════════════════════════════
    // 1. ARIA ATTRIBUTE VERIFICATION
    // ═══════════════════════════════════════════════════════════════════════

    // Verify all triggers have proper type="button"
    expect(trigger1).toHaveAttribute('type', 'button');
    expect(trigger2).toHaveAttribute('type', 'button');
    expect(trigger3).toHaveAttribute('type', 'button');

    // Verify initial aria-expanded states (all collapsed)
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    expect(trigger3).toHaveAttribute('aria-expanded', 'false');

    // Verify aria-controls points to correct panel IDs
    expect(trigger1).toHaveAttribute('aria-controls', 'panel-1');
    expect(trigger2).toHaveAttribute('aria-controls', 'panel-2');
    expect(trigger3).toHaveAttribute('aria-controls', 'panel-3');

    // Verify panels have correct IDs matching aria-controls
    const panel1 = canvasElement.querySelector('#panel-1');
    const panel2 = canvasElement.querySelector('#panel-2');
    const panel3 = canvasElement.querySelector('#panel-3');
    expect(panel1).toBeTruthy();
    expect(panel2).toBeTruthy();
    expect(panel3).toBeTruthy();

    // Verify panels have aria-labelledby pointing to their trigger
    // This is required by ARIA Authoring Practices for screen reader context
    const panel1LabelledBy = panel1?.getAttribute('aria-labelledby');
    const panel2LabelledBy = panel2?.getAttribute('aria-labelledby');
    const panel3LabelledBy = panel3?.getAttribute('aria-labelledby');

    expect(panel1LabelledBy).toBeTruthy();
    expect(panel2LabelledBy).toBeTruthy();
    expect(panel3LabelledBy).toBeTruthy();

    // Verify aria-labelledby references exist and match the triggers
    const labelledByTrigger1 = canvasElement.querySelector(
      `#${panel1LabelledBy}`,
    );
    const labelledByTrigger2 = canvasElement.querySelector(
      `#${panel2LabelledBy}`,
    );
    const labelledByTrigger3 = canvasElement.querySelector(
      `#${panel3LabelledBy}`,
    );

    expect(labelledByTrigger1).toBe(trigger1);
    expect(labelledByTrigger2).toBe(trigger2);
    expect(labelledByTrigger3).toBe(trigger3);

    // Verify panels have role="region" per ARIA Authoring Practices
    // This creates a landmark that screen reader users can navigate to directly
    expect(panel1).toHaveAttribute('role', 'region');
    expect(panel2).toHaveAttribute('role', 'region');
    expect(panel3).toHaveAttribute('role', 'region');

    // ═══════════════════════════════════════════════════════════════════════
    // 2. EXPAND/COLLAPSE STATE CHANGES
    // ═══════════════════════════════════════════════════════════════════════

    // Expand panel 1 and verify aria-expanded updates
    await userEvent.click(trigger1);
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Expand panel 2 - should close panel 1 (single expand mode)
    await userEvent.click(trigger2);
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 3. FOCUS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    // Focus should stay on trigger after click (not move to panel)
    expect(document.activeElement).toBe(trigger2);

    // Tab should move focus to next trigger
    trigger1.focus();
    expect(document.activeElement).toBe(trigger1);

    // ═══════════════════════════════════════════════════════════════════════
    // 4. KEYBOARD NAVIGATION (Arrow Keys)
    // ═══════════════════════════════════════════════════════════════════════

    // ArrowDown should move focus to next trigger
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    // ArrowDown again to trigger 3
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger3);
    });

    // ArrowUp should move focus back to trigger 2
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 5. KEYBOARD ACTIVATION (Enter and Space)
    // ═══════════════════════════════════════════════════════════════════════

    // Focus on trigger3 and activate with Enter
    trigger3.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(trigger3).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    });

    // Activate with Space to toggle
    await userEvent.keyboard(' ');
    await waitFor(() => {
      expect(trigger3).toHaveAttribute('aria-expanded', 'false');
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 6. HOME/END KEY NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════

    // Home should move focus to first trigger
    await userEvent.keyboard('{Home}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger1);
    });

    // End should move focus to last trigger
    await userEvent.keyboard('{End}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger3);
    });
  },
};

/**
 * Demonstrates runtime theming using CSS custom properties.
 * All visual aspects of the accordion can be customized by setting
 * `--nfs-accordion-*` CSS custom properties on the component or any ancestor.
 */
export const CustomTheme: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        [allowAllClosed]="allowAllClosed"
        style="
          --nfs-accordion-background: #1a1a2e;
          --nfs-accordion-title-font-size: 1rem;
          --nfs-accordion-item-color: #ff8fa3;
          --nfs-accordion-item-background-hover: #16213e;
          --nfs-accordion-item-padding: 1rem 1.5rem;
          --nfs-accordion-content-background: #0f0f23;
          --nfs-accordion-content-border: 2px solid #ff8fa3;
          --nfs-accordion-content-color: #eaeaea;
          --nfs-accordion-content-padding: 1.5rem;
        "
      >
        <nfs-accordion-item panelId="theme-1">
          <span *nfsAccordionTitle>🎨 Custom Dark Theme</span>
          <div *nfsAccordionContent>
            <p>This accordion uses a custom dark theme with vibrant accent colors.</p>
            <p>All styling is done via CSS custom properties set on the component.</p>
          </div>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="theme-2">
          <span *nfsAccordionTitle>⚙️ Available Properties</span>
          <div *nfsAccordionContent>
            <ul style="margin: 0; padding-left: 1.5rem;">
              <li><code>--nfs-accordion-background</code></li>
              <li><code>--nfs-accordion-title-font-size</code></li>
              <li><code>--nfs-accordion-item-color</code></li>
              <li><code>--nfs-accordion-item-background-hover</code></li>
              <li><code>--nfs-accordion-item-padding</code></li>
              <li><code>--nfs-accordion-content-background</code></li>
              <li><code>--nfs-accordion-content-border</code></li>
              <li><code>--nfs-accordion-content-color</code></li>
              <li><code>--nfs-accordion-content-padding</code></li>
            </ul>
          </div>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="theme-3">
          <span *nfsAccordionTitle>📝 Usage Example</span>
          <div *nfsAccordionContent>
            <pre style="margin: 0; font-size: 0.875rem; overflow-x: auto;"><code>nfs-accordion {{'{'}}
  --nfs-accordion-item-color: #ff8fa3;
  --nfs-accordion-content-background: #0f0f23;
{{'}'}}</code></pre>
          </div>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify custom theme is applied by checking computed styles
    const accordion = canvasElement.querySelector('nfs-accordion');
    expect(accordion).toBeTruthy();

    if (!accordion) return;
    const style = getComputedStyle(accordion);

    // Check that CSS custom properties are set
    expect(style.getPropertyValue('--nfs-accordion-item-color').trim()).toBe(
      '#ff8fa3',
    );
    expect(
      style.getPropertyValue('--nfs-accordion-content-background').trim(),
    ).toBe('#0f0f23');

    // Click to expand and verify the accordion works with custom theme
    const trigger1 = canvas.getByRole('button', {
      name: /Custom Dark Theme/i,
    });
    await userEvent.click(trigger1);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Verify content is visible
    const content = canvas.getByText(/CSS custom properties/i);
    expect(content).toBeVisible();
  },
};

/**
 * Interactive theme controls story.
 * Demonstrates all available CSS custom properties with live Storybook controls.
 * Each property can be adjusted in real-time to see the visual effect.
 */
export const ThemeControls: ThemeControlsStory = {
  args: {
    multiExpandable: false,
    disabled: false,
    allowAllClosed: true,
    // CSS Custom Property args
    accordionBackground: '#fefefe',
    accordionTitleFontSize: '0.75rem',
    accordionItemColor: '#0d5a89',
    accordionItemBackgroundHover: '#e6e6e6',
    accordionItemPadding: '1.25rem 1rem',
    accordionContentBackground: '#fefefe',
    accordionContentBorder: '1px solid #e6e6e6',
    accordionContentColor: '#0a0a0a',
    accordionContentPadding: '1rem',
    accordionSlideSpeed: '250ms',
    accordionSlideEasing: 'ease-out',
  },
  argTypes: {
    // CSS Custom Property controls
    accordionBackground: {
      name: '--nfs-accordion-background',
      description: 'Background color of the accordion container',
      control: { type: 'color' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionTitleFontSize: {
      name: '--nfs-accordion-title-font-size',
      description: 'Font size of accordion titles',
      control: { type: 'text' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionItemColor: {
      name: '--nfs-accordion-item-color',
      description: 'Text color of accordion titles',
      control: { type: 'color' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionItemBackgroundHover: {
      name: '--nfs-accordion-item-background-hover',
      description: 'Background color of accordion titles on hover/focus',
      control: { type: 'color' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionItemPadding: {
      name: '--nfs-accordion-item-padding',
      description: 'Padding of accordion titles (CSS padding value)',
      control: { type: 'text' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionContentBackground: {
      name: '--nfs-accordion-content-background',
      description: 'Background color of accordion content panels',
      control: { type: 'color' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionContentBorder: {
      name: '--nfs-accordion-content-border',
      description: 'Border of accordion content panels (CSS border value)',
      control: { type: 'text' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionContentColor: {
      name: '--nfs-accordion-content-color',
      description: 'Text color of accordion content panels',
      control: { type: 'color' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionContentPadding: {
      name: '--nfs-accordion-content-padding',
      description: 'Padding of accordion content panels (CSS padding value)',
      control: { type: 'text' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionSlideSpeed: {
      name: '--nfs-accordion-slide-speed',
      description:
        'Animation duration for expand/collapse transitions (CSS time value)',
      control: { type: 'text' },
      table: { category: 'CSS Custom Properties' },
    },
    accordionSlideEasing: {
      name: '--nfs-accordion-slide-easing',
      description: 'Easing function for expand/collapse animation',
      control: 'select',
      options: [
        'linear',
        'ease',
        'ease-in',
        'ease-out',
        'ease-in-out',
        'cubic-bezier(0.4, 0, 0.2, 1)',
      ],
      table: { category: 'CSS Custom Properties' },
    },
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        [allowAllClosed]="allowAllClosed"
        [style.--nfs-accordion-background]="accordionBackground"
        [style.--nfs-accordion-title-font-size]="accordionTitleFontSize"
        [style.--nfs-accordion-item-color]="accordionItemColor"
        [style.--nfs-accordion-item-background-hover]="accordionItemBackgroundHover"
        [style.--nfs-accordion-item-padding]="accordionItemPadding"
        [style.--nfs-accordion-content-background]="accordionContentBackground"
        [style.--nfs-accordion-content-border]="accordionContentBorder"
        [style.--nfs-accordion-content-color]="accordionContentColor"
        [style.--nfs-accordion-content-padding]="accordionContentPadding"
        [style.--nfs-accordion-slide-speed]="accordionSlideSpeed"
        [style.--nfs-accordion-slide-easing]="accordionSlideEasing"
      >
        <nfs-accordion-item panelId="theme-1">
          <span *nfsAccordionTitle>🎨 Theme Controls Demo</span>
          <div *nfsAccordionContent>
            <p>Use the <strong>Controls</strong> panel below to adjust CSS custom properties in real-time.</p>
            <p>All properties are organized under the "CSS Custom Properties" category.</p>
          </div>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="theme-2">
          <span *nfsAccordionTitle>📐 Available Properties</span>
          <div *nfsAccordionContent>
            <ul style="margin: 0; padding-left: 1.5rem;">
              <li><code>--nfs-accordion-background</code> — Container background</li>
              <li><code>--nfs-accordion-title-font-size</code> — Title font size</li>
              <li><code>--nfs-accordion-item-color</code> — Title text color</li>
              <li><code>--nfs-accordion-item-background-hover</code> — Title hover background</li>
              <li><code>--nfs-accordion-item-padding</code> — Title padding</li>
              <li><code>--nfs-accordion-content-background</code> — Content background</li>
              <li><code>--nfs-accordion-content-border</code> — Content border</li>
              <li><code>--nfs-accordion-content-color</code> — Content text color</li>
              <li><code>--nfs-accordion-content-padding</code> — Content padding</li>
              <li><code>--nfs-accordion-slide-easing</code> — Animation easing</li>
              <li><code>--nfs-accordion-slide-speed</code> — Animation duration</li>
            </ul>
          </div>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="theme-3">
          <span *nfsAccordionTitle>💡 Usage Tips</span>
          <div *nfsAccordionContent>
            <p>Set CSS custom properties via:</p>
            <ul style="margin: 0; padding-left: 1.5rem;">
              <li>Inline styles: <code>[style.--nfs-accordion-item-color]="'#ff0000'"</code></li>
              <li>CSS classes on the component or any ancestor</li>
              <li>Global CSS with <code>:root</code> or scoped selectors</li>
            </ul>
          </div>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the accordion renders with custom properties
    const accordion = canvasElement.querySelector('nfs-accordion');
    expect(accordion).toBeTruthy();

    if (!accordion) return;
    const style = getComputedStyle(accordion);

    // Check that CSS custom properties are set
    expect(
      style.getPropertyValue('--nfs-accordion-background').trim(),
    ).toBeTruthy();
    expect(
      style.getPropertyValue('--nfs-accordion-item-color').trim(),
    ).toBeTruthy();
    expect(
      style.getPropertyValue('--nfs-accordion-content-background').trim(),
    ).toBeTruthy();

    // Click to expand first panel and verify accordion works
    const trigger1 = canvas.getByRole('button', {
      name: /Theme Controls Demo/i,
    });
    await userEvent.click(trigger1);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Verify content is visible (use findByText to wait for deferred content)
    // Note: Search for text after the <strong> tag to avoid split element issues
    const content = await canvas.findByText(/adjust CSS custom properties/i);
    expect(content).toBeVisible();
  },
};

/**
 * Tests focus management when accordion items are disabled.
 * Angular ARIA allows focus on disabled items (for screen reader announcement)
 * but prevents their activation via click, Enter, or Space.
 */
/**
 * Demonstrates the `softDisabled` input.
 * When softDisabled=true (default), disabled items can receive focus for screen reader announcement.
 * When softDisabled=false, disabled items are skipped during keyboard navigation.
 */
export const SoftDisabled: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    allowAllClosed: true,
    softDisabled: false, // Disabled items will be skipped during navigation
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    // Use instant animation (0ms) for reliable testing
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        [allowAllClosed]="allowAllClosed"
        [softDisabled]="softDisabled"
        style="--nfs-accordion-slide-speed: 0ms"
      >
        <nfs-accordion-item panelId="panel-1">
          <span *nfsAccordionTitle>Enabled 1</span>
          <p *nfsAccordionContent>Panel 1 content.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2" [disabled]="true">
          <span *nfsAccordionTitle>Disabled (skipped)</span>
          <p *nfsAccordionContent>Panel 2 content (disabled).</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-3">
          <span *nfsAccordionTitle>Enabled 2</span>
          <p *nfsAccordionContent>Panel 3 content.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger1 = canvas.getByRole('button', { name: /Enabled 1/i });
    const trigger2 = canvas.getByRole('button', { name: /Disabled/i });
    const trigger3 = canvas.getByRole('button', { name: /Enabled 2/i });

    // Verify disabled trigger has aria-disabled="true"
    expect(trigger2).toHaveAttribute('aria-disabled', 'true');

    // Focus first trigger
    trigger1.focus();
    expect(document.activeElement).toBe(trigger1);

    // With softDisabled=false, ArrowDown should SKIP the disabled trigger
    // and move directly to the third trigger
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      // Focus should skip trigger2 and go directly to trigger3
      expect(document.activeElement).toBe(trigger3);
    });

    // ArrowUp should also skip the disabled trigger
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger1);
    });
  },
};

/**
 * Demonstrates programmatic `expandAll()` and `collapseAll()` methods.
 * These methods allow external control over all accordion panels.
 */
export const ExpandCollapseAll: Story = {
  args: {
    multiExpandable: true, // Required for expandAll to work
    disabled: false,
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <main>
        <div style="margin-bottom: 1rem;">
          <button
            type="button"
            class="button primary"
            style="margin-right: 0.5rem;"
            (click)="accordion.expandAll()"
          >
            Expand All
          </button>
          <button
            type="button"
            class="button secondary"
            (click)="accordion.collapseAll()"
          >
            Collapse All
          </button>
        </div>
        <nfs-accordion
          #accordion
          [multiExpandable]="multiExpandable"
          [disabled]="disabled"
          [allowAllClosed]="allowAllClosed"
        >
          <nfs-accordion-item panelId="panel-1">
            <span *nfsAccordionTitle>Panel 1</span>
            <p *nfsAccordionContent>Content for panel 1.</p>
          </nfs-accordion-item>
          <nfs-accordion-item panelId="panel-2">
            <span *nfsAccordionTitle>Panel 2</span>
            <p *nfsAccordionContent>Content for panel 2.</p>
          </nfs-accordion-item>
          <nfs-accordion-item panelId="panel-3">
            <span *nfsAccordionTitle>Panel 3</span>
            <p *nfsAccordionContent>Content for panel 3.</p>
          </nfs-accordion-item>
        </nfs-accordion>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const expandAllBtn = canvas.getByRole('button', { name: /Expand All/i });
    const collapseAllBtn = canvas.getByRole('button', {
      name: /Collapse All/i,
    });
    const trigger1 = canvas.getByRole('button', { name: /Panel 1/i });
    const trigger2 = canvas.getByRole('button', { name: /Panel 2/i });
    const trigger3 = canvas.getByRole('button', { name: /Panel 3/i });

    // Initially all panels should be collapsed
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    expect(trigger3).toHaveAttribute('aria-expanded', 'false');

    // Click Expand All button
    await userEvent.click(expandAllBtn);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
      expect(trigger3).toHaveAttribute('aria-expanded', 'true');
    });

    // Click Collapse All button
    await userEvent.click(collapseAllBtn);

    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'false');
      expect(trigger3).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

export const FocusManagementWithDisabled: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItem,
        NfsAccordionTitleDef,
        NfsAccordionContentDef,
      ],
    },
    // Use instant animation (0ms) for reliable testing
    template: `
      <nfs-accordion
        [multiExpandable]="multiExpandable"
        [disabled]="disabled"
        [allowAllClosed]="allowAllClosed"
        style="--nfs-accordion-slide-speed: 0ms"
      >
        <nfs-accordion-item panelId="panel-1">
          <span *nfsAccordionTitle>Enabled 1</span>
          <p *nfsAccordionContent>Panel 1 content.</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-2" [disabled]="true">
          <span *nfsAccordionTitle>Disabled</span>
          <p *nfsAccordionContent>Panel 2 content (disabled).</p>
        </nfs-accordion-item>
        <nfs-accordion-item panelId="panel-3">
          <span *nfsAccordionTitle>Enabled 2</span>
          <p *nfsAccordionContent>Panel 3 content.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger1 = canvas.getByRole('button', { name: /Enabled 1/i });
    const trigger2 = canvas.getByRole('button', { name: /Disabled/i });
    const trigger3 = canvas.getByRole('button', { name: /Enabled 2/i });

    // Verify disabled trigger has aria-disabled="true"
    expect(trigger2).toHaveAttribute('aria-disabled', 'true');
    // Enabled triggers should not be marked as disabled
    // Note: @angular/aria may set aria-disabled="false" explicitly, which is valid ARIA
    expect(trigger1).not.toHaveAttribute('aria-disabled', 'true');
    expect(trigger3).not.toHaveAttribute('aria-disabled', 'true');

    // Focus first trigger
    trigger1.focus();
    expect(document.activeElement).toBe(trigger1);

    // ArrowDown moves focus to disabled trigger (Angular ARIA allows focus on disabled items
    // for screen reader announcement, but prevents activation)
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    // ArrowDown again moves to third trigger
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger3);
    });

    // ArrowUp moves back to disabled trigger
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    // Clicking disabled trigger should not expand it
    await userEvent.click(trigger2);
    await waitFor(() => {
      expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    });

    // Pressing Enter on disabled trigger should not expand it
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    });
  },
};
