import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { NfsAccordion } from './accordion';
import { NfsAccordionItem } from './accordion-item';
import { NfsAccordionTitleDef } from './accordion-title';
import { NfsAccordionContentDef } from './accordion-content';

interface AccordionStoryArgs {
  multiExpandable: boolean;
  disabled: boolean;
  slideSpeed: number;
  deepLink: boolean;
  deepLinkSmudge: boolean;
  deepLinkSmudgeDelay: number;
  updateHistory: boolean;
  allowAllClosed: boolean;
}

const meta: Meta<AccordionStoryArgs> = {
  title: 'Components/Accordion',
  tags: ['autodocs'],
  argTypes: {
    multiExpandable: {
      control: 'boolean',
      description: 'Allow multiple panels open simultaneously',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all accordion interactions',
    },
    slideSpeed: {
      control: { type: 'range', min: 0, max: 1000, step: 50 },
      description: 'Animation duration in milliseconds',
    },
    deepLink: {
      control: 'boolean',
      description: 'Link the location hash to the open pane',
    },
    deepLinkSmudge: {
      control: 'boolean',
      description: 'Adjust scroll position when deep linking',
    },
    deepLinkSmudgeDelay: {
      control: { type: 'number', min: 0, max: 1000 },
      description: 'Delay in milliseconds before scroll adjustment',
    },
    updateHistory: {
      control: 'boolean',
      description: 'Add panel changes to browser history',
    },
    allowAllClosed: {
      control: 'boolean',
      description: 'Allow all panels to be closed (default: false)',
    },
  },
};

export default meta;
type Story = StoryObj<AccordionStoryArgs>;

export const Default: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    slideSpeed: 250,
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
        [slideSpeed]="slideSpeed"
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
  args: { multiExpandable: true, disabled: false, slideSpeed: 250 },
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
  args: { multiExpandable: false, disabled: true, slideSpeed: 250 },
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
      <nfs-accordion [multiExpandable]="multiExpandable" [disabled]="disabled" [slideSpeed]="slideSpeed">
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
  args: { multiExpandable: false, disabled: false, slideSpeed: 250 },
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
      <nfs-accordion [multiExpandable]="multiExpandable" [slideSpeed]="slideSpeed">
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
  args: { multiExpandable: false, disabled: false, slideSpeed: 250 },
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

export const SlowAnimation: Story = {
  args: { multiExpandable: false, disabled: false, slideSpeed: 500 },
  render: Default.render,
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

export const NoAnimation: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    slideSpeed: 0,
    deepLink: false,
    deepLinkSmudge: false,
    deepLinkSmudgeDelay: 300,
    updateHistory: false,
  },
  render: Default.render,
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
    slideSpeed: 250,
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

export const RequireOneOpen: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    slideSpeed: 250,
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
        [slideSpeed]="slideSpeed"
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
    slideSpeed: 0, // Instant animation for reliable testing
    allowAllClosed: true,
  },
  render: Default.render,
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
 * Tests focus management when accordion items are disabled.
 * Angular ARIA allows focus on disabled items (for screen reader announcement)
 * but prevents their activation via click, Enter, or Space.
 */
export const FocusManagementWithDisabled: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    slideSpeed: 0,
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
        [slideSpeed]="slideSpeed"
        [allowAllClosed]="allowAllClosed"
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
