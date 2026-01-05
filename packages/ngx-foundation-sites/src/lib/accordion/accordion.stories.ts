import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { argsToLiteralTemplate } from '../util-storybook/args-to-literal-template';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { NfsAccordion } from './accordion';
import { NfsAccordionContentDef } from './accordion-content';
import { NfsAccordionHeaderDef } from './accordion-header-def';
import { NfsAccordionItemDef } from './accordion-item-def';

const meta: Meta<NfsAccordion> = {
  title: 'Components/Accordion',
  component: NfsAccordion,
  subcomponents: [
    // NfsAccordionItemDef,
    // NfsAccordionHeaderDef,
    // NfsAccordionContentDef,
  ],
  decorators: [
    moduleMetadata({
      imports: [
        NfsAccordionItemDef,
        NfsAccordionHeaderDef,
        NfsAccordionContentDef,
      ],
    }),
  ],
  tags: ['autodocs'],
  // Descriptions come from JSDoc comments in the component via Compodoc.
  // Only custom control configurations are needed here.
  argTypes: {
    deepLinkSmudgeDelay: {
      control: { type: 'number', min: 0, max: 1000 },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion ${argsToLiteralTemplate(args)}>
        <ng-template nfsAccordionItem panelId="panel-1">
          <ng-template nfsAccordionHeader>Accordion 1</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 1 content. Lorem ipsum dolor sit amet.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2">
          <ng-template nfsAccordionHeader>Accordion 2</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 2 content. Suspendisse eu ligula.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-3">
          <ng-template nfsAccordionHeader>Accordion 3</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 3 content. Nullam sed est.</p>
          </ng-template>
        </ng-template>
      </nfs-accordion>
    `,
  }),
};

export default meta;
type Story = StoryObj<NfsAccordion>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ═══════════════════════════════════════════════════════════════════════
    // REGRESSION TEST: Verify $nfs-accordion-slide-speed (250ms default)
    // ═══════════════════════════════════════════════════════════════════════
    // The Sass variable controls the CSS transition duration on
    // .accordion-content elements. Browser normalizes 250ms to 0.25s.
    // Must wait for runtime Sass compilation to complete.
    const accordionContent = canvasElement.querySelector('.accordion-content');
    expect(accordionContent).toBeTruthy();

    if (accordionContent) {
      // Wait for runtime Sass compiler to apply transition styles
      await waitFor(
        () => {
          const style = getComputedStyle(accordionContent);
          // transitionDuration may be "0.25s, 0.25s, 0.25s" for multiple properties
          expect(style.transitionDuration).toContain('0.25s');
        },
        { timeout: 5000 },
      );
    }

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
  args: { multiExpandable: true },
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
  args: { disabled: true },
  render: ({ disabled, ...args }) => ({
    props: args,
    template: `
      <nfs-accordion [disabled]="${disabled}" ${argsToLiteralTemplate(args)}>
        <ng-template nfsAccordionItem panelId="panel-1" [disabled]="true">
          <ng-template nfsAccordionHeader>Disabled Accordion</ng-template>
          <ng-template nfsAccordionContent>
            <p>This panel cannot be opened.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2">
          <ng-template nfsAccordionHeader>Also Disabled (via group)</ng-template>
          <ng-template nfsAccordionContent>
            <p>This panel cannot be opened either.</p>
          </ng-template>
        </ng-template>
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
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion ${argsToLiteralTemplate(args)}>
        <ng-template nfsAccordionItem panelId="panel-1" [expanded]="true">
          <ng-template nfsAccordionHeader>Initially Open</ng-template>
          <ng-template nfsAccordionContent>
            <p>This panel starts expanded.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2">
          <ng-template nfsAccordionHeader>Initially Closed</ng-template>
          <ng-template nfsAccordionContent>
            <p>This panel starts collapsed.</p>
          </ng-template>
        </ng-template>
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

export const DeepLink: Story = {
  args: {
    deepLink: true,
    deepLinkSmudge: true,
    updateHistory: true,
  },
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
    deepLink: true,
    deepLinkSmudge: true,
    updateHistory: true,
    allowAllClosed: true,
  },
};

/**
 * Deep linking with updateHistory=false.
 * Uses replaceState instead of pushState, so browser history is not modified.
 * No play function - E2E tests handle all interactions.
 */
export const DeepLinkNoHistory: Story = {
  args: {
    deepLink: true,
    allowAllClosed: true,
  },
};

/**
 * Deep linking with sticky header offset.
 * Demonstrates using deepLinkSmudgeOffset to account for fixed navigation.
 * The offset (60px) is subtracted from the scroll position.
 */
export const DeepLinkWithOffset: Story = {
  args: {
    deepLink: true,
    deepLinkSmudge: true,
    deepLinkSmudgeOffset: 60,
    updateHistory: true,
  },
};

export const RequireOneOpen: Story = {
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion ${argsToLiteralTemplate(args)}>
        <ng-template nfsAccordionItem panelId="panel-1">
          <ng-template nfsAccordionHeader>Panel 1</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 1 content.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2">
          <ng-template nfsAccordionHeader>Panel 2</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 2 content.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-3">
          <ng-template nfsAccordionHeader>Panel 3</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 3 content.</p>
          </ng-template>
        </ng-template>
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
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion ${argsToLiteralTemplate(args)}>
        <ng-template nfsAccordionItem panelId="panel-1">
          <ng-template nfsAccordionHeader>Accordion 1</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 1 content. Lorem ipsum dolor sit amet.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2">
          <ng-template nfsAccordionHeader>Accordion 2</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 2 content. Suspendisse eu ligula.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-3">
          <ng-template nfsAccordionHeader>Accordion 3</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 3 content. Nullam sed est.</p>
          </ng-template>
        </ng-template>
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
    allowAllClosed: true,
    softDisabled: false, // Disabled items will be skipped during navigation
  },
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion ${argsToLiteralTemplate(args)}>
        <ng-template nfsAccordionItem panelId="panel-1">
          <ng-template nfsAccordionHeader>Enabled 1</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 1 content.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2" [disabled]="true">
          <ng-template nfsAccordionHeader>Disabled (skipped)</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 2 content (disabled).</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-3">
          <ng-template nfsAccordionHeader>Enabled 2</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 3 content.</p>
          </ng-template>
        </ng-template>
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
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <main>
        <div class="margin-bottom-1">
          <button
            type="button"
            class="button primary margin-right-1"
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
        <nfs-accordion ${argsToLiteralTemplate(args)}
          #accordion
        >
          <ng-template nfsAccordionItem panelId="panel-1">
            <ng-template nfsAccordionHeader>Panel 1</ng-template>
            <ng-template nfsAccordionContent>
              <p>Content for panel 1.</p>
            </ng-template>
          </ng-template>
          <ng-template nfsAccordionItem panelId="panel-2">
            <ng-template nfsAccordionHeader>Panel 2</ng-template>
            <ng-template nfsAccordionContent>
              <p>Content for panel 2.</p>
            </ng-template>
          </ng-template>
          <ng-template nfsAccordionItem panelId="panel-3">
            <ng-template nfsAccordionHeader>Panel 3</ng-template>
            <ng-template nfsAccordionContent>
              <p>Content for panel 3.</p>
            </ng-template>
          </ng-template>
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
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion ${argsToLiteralTemplate(args)}>
        <ng-template nfsAccordionItem panelId="panel-1">
          <ng-template nfsAccordionHeader>Enabled 1</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 1 content.</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2" [disabled]="true">
          <ng-template nfsAccordionHeader>Disabled</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 2 content (disabled).</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-3">
          <ng-template nfsAccordionHeader>Enabled 2</ng-template>
          <ng-template nfsAccordionContent>
            <p>Panel 3 content.</p>
          </ng-template>
        </ng-template>
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

/**
 * Demonstrates Right-to-Left (RTL) language support.
 *
 * The accordion automatically adapts to RTL mode when the document or any ancestor
 * has `dir="rtl"` set. This includes:
 * - Text alignment flips to right-to-left
 * - +/- icons move to the LEFT side (via CSS Logical Properties)
 * - Keyboard navigation works correctly (ArrowDown = forward, ArrowUp = backward)
 *
 * RTL support requires two complementary layers:
 * 1. **Behavior** (Angular CDK Directionality): Auto-detects `dir` attribute for keyboard navigation
 * 2. **Styling** (CSS Logical Properties): `inset-inline-end` auto-maps to `right` (LTR) or `left` (RTL)
 */
export const RightToLeft: Story = {
  args: {
    allowAllClosed: true,
  },
  globals: {
    // Activate RTL stylesheet for compile-time RTL testing
    direction: 'rtl',
  },
  render: (args) => ({
    props: args,
    template: `
      <div dir="rtl" lang="ar">
        <nfs-accordion ${argsToLiteralTemplate(args)}>
          <ng-template nfsAccordionItem panelId="panel-1">
            <ng-template nfsAccordionHeader>العنصر الأول</ng-template>
            <ng-template nfsAccordionContent>
              <p>محتوى اللوحة الأولى. هذا نص تجريبي.</p>
            </ng-template>
          </ng-template>
          <ng-template nfsAccordionItem panelId="panel-2">
            <ng-template nfsAccordionHeader>العنصر الثاني</ng-template>
            <ng-template nfsAccordionContent>
              <p>محتوى اللوحة الثانية.</p>
            </ng-template>
          </ng-template>
          <ng-template nfsAccordionItem panelId="panel-3">
            <ng-template nfsAccordionHeader>العنصر الثالث</ng-template>
            <ng-template nfsAccordionContent>
              <p>محتوى اللوحة الثالثة.</p>
            </ng-template>
          </ng-template>
        </nfs-accordion>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify RTL container is present
    const rtlContainer = canvasElement.querySelector('[dir="rtl"]');
    expect(rtlContainer).toBeTruthy();

    const trigger1 = canvas.getByRole('button', { name: /العنصر الأول/i });
    const trigger2 = canvas.getByRole('button', { name: /العنصر الثاني/i });
    const trigger3 = canvas.getByRole('button', { name: /العنصر الثالث/i });

    // ═══════════════════════════════════════════════════════════════════════
    // 1. VERIFY +/- ICON POSITION (should be on LEFT in RTL)
    // ═══════════════════════════════════════════════════════════════════════
    // Foundation compiles with $global-text-direction: rtl, placing icon on left
    //
    // NOTE: This check is skipped when runtime theming is active because:
    // - Foundation's RTL support requires compile-time $global-text-direction: rtl
    // - Runtime theming compiles CSS dynamically for LTR only
    // - The precompiled RTL stylesheet is disabled when runtime theming overrides
    //
    // The keyboard navigation tests below still verify RTL behavior works correctly.
    const isRuntimeTheming =
      !!document.getElementById('nfs-runtime-theme')?.textContent;
    if (!isRuntimeTheming) {
      const iconStyle = getComputedStyle(trigger1, '::before');
      // In RTL mode, the icon should be positioned on the left side
      // Foundation's #{$global-right} becomes 'left' when compiled with RTL
      const leftValue = parseFloat(iconStyle.left);
      expect(leftValue).toBeLessThan(50); // Icon should be near the left edge (16px = 1rem)
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. KEYBOARD NAVIGATION (ArrowDown = forward in both LTR and RTL)
    // ═══════════════════════════════════════════════════════════════════════
    trigger1.focus();
    expect(document.activeElement).toBe(trigger1);

    // ArrowDown should move to next trigger (forward navigation)
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    // ArrowDown again to move to third trigger
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger3);
    });

    // ArrowUp should move back to second trigger
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger2);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 3. ACTIVATION (Enter key should expand panel)
    // ═══════════════════════════════════════════════════════════════════════
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    // Verify content is visible
    const content = canvas.getByText(/محتوى اللوحة الثانية/i);
    expect(content).toBeVisible();
  },
};

/**
 * Demonstrates eager vs lazy content rendering.
 * - Content directly in the template renders immediately (eager)
 * - Content in nfsAccordionContent renders only when expanded (lazy)
 */
export const EagerVsLazyContent: Story = {
  args: {
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion ${argsToLiteralTemplate(args)}>
        <ng-template nfsAccordionItem panelId="panel-1">
          <ng-template nfsAccordionHeader>Eager Content Example</ng-template>
          <!-- This content renders immediately when accordion initializes -->
          <p class="text-success">This paragraph is eager content - rendered immediately!</p>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2">
          <ng-template nfsAccordionHeader>Lazy Content Example</ng-template>
          <ng-template nfsAccordionContent>
            <!-- This content renders only when panel is expanded -->
            <p class="text-primary">This paragraph is lazy content - rendered when expanded!</p>
          </ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-3">
          <ng-template nfsAccordionHeader>Mixed Content Example</ng-template>
          <!-- Eager content -->
          <p class="text-success">Eager: Always visible in DOM</p>
          <ng-template nfsAccordionContent>
            <!-- Lazy content -->
            <p class="text-primary">Lazy: Only visible when expanded</p>
          </ng-template>
        </ng-template>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Get triggers
    const trigger1 = canvas.getByRole('button', {
      name: /Eager Content Example/i,
    });
    const trigger2 = canvas.getByRole('button', {
      name: /Lazy Content Example/i,
    });
    const trigger3 = canvas.getByRole('button', {
      name: /Mixed Content Example/i,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 1. VERIFY INITIAL STATE - Lazy content NOT in DOM before expansion
    // ═══════════════════════════════════════════════════════════════════════

    // Lazy content from panel 2 should NOT be in the DOM yet
    expect(
      canvas.queryByText(/This paragraph is lazy content/i),
    ).not.toBeInTheDocument();

    // Lazy content from panel 3 should NOT be in the DOM yet
    expect(
      canvas.queryByText(/Lazy: Only visible when expanded/i),
    ).not.toBeInTheDocument();

    // Eager content from panel 1 IS in the DOM (but hidden by collapsed panel)
    expect(
      canvas.queryByText(/This paragraph is eager content/i),
    ).toBeInTheDocument();

    // Eager content from panel 3 IS in the DOM (but hidden by collapsed panel)
    expect(
      canvas.queryByText(/Eager: Always visible in DOM/i),
    ).toBeInTheDocument();

    // ═══════════════════════════════════════════════════════════════════════
    // 2. EXPAND PANEL 2 - Verify lazy content appears
    // ═══════════════════════════════════════════════════════════════════════

    await userEvent.click(trigger2);
    await waitFor(() => {
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    // Now lazy content from panel 2 should be visible
    const lazyContent = canvas.getByText(/This paragraph is lazy content/i);
    expect(lazyContent).toBeVisible();

    // ═══════════════════════════════════════════════════════════════════════
    // 3. COLLAPSE PANEL 2, EXPAND PANEL 3 - Verify mixed content behavior
    // ═══════════════════════════════════════════════════════════════════════

    await userEvent.click(trigger3);
    await waitFor(() => {
      expect(trigger3).toHaveAttribute('aria-expanded', 'true');
      // Panel 2 should close (single expand mode)
      expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    });

    // Panel 3's eager content should be visible
    const mixedEager = canvas.getByText(/Eager: Always visible in DOM/i);
    expect(mixedEager).toBeVisible();

    // Panel 3's lazy content should now be visible (rendered on expand)
    const mixedLazy = canvas.getByText(/Lazy: Only visible when expanded/i);
    expect(mixedLazy).toBeVisible();

    // ═══════════════════════════════════════════════════════════════════════
    // 4. EXPAND PANEL 1 - Verify eager content is visible
    // ═══════════════════════════════════════════════════════════════════════

    await userEvent.click(trigger1);
    await waitFor(() => {
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    });

    // Eager content should be visible
    const eagerContent = canvas.getByText(/This paragraph is eager content/i);
    expect(eagerContent).toBeVisible();
  },
};
