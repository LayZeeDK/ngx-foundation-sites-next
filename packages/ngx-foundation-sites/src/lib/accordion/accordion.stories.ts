import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { NfsAccordion } from './accordion';
import { NfsAccordionItem } from './accordion-item';
import { NfsAccordionTitleDef } from './accordion-title';
import { NfsAccordionContentDef } from './accordion-content';

interface AccordionStoryArgs {
  multiExpandable: boolean;
  disabled: boolean;
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
  },
};

export default meta;
type Story = StoryObj<AccordionStoryArgs>;

export const Default: Story = {
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
      <nfs-accordion [multiExpandable]="multiExpandable" [disabled]="disabled">
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
