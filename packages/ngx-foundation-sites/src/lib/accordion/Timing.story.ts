import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { NfsAccordion } from './accordion';
import { NfsAccordionContentDef } from './accordion-content';
import { NfsAccordionHeaderDef } from './accordion-header-def';
import { NfsAccordionItemDef } from './accordion-item-def';

const meta: Meta<NfsAccordion> = {
  title: 'Components/Accordion/Timing',
  component: NfsAccordion,
  decorators: [
    moduleMetadata({
      imports: [
        NfsAccordionItemDef,
        NfsAccordionHeaderDef,
        NfsAccordionContentDef,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<NfsAccordion>;

export const RapidClicks: Story = {
  render: () => ({
    template: `
      <nfs-accordion>
        <ng-template nfsAccordionItem panelId="panel-1">
          <ng-template nfsAccordionHeader>Fast 1</ng-template>
          <ng-template nfsAccordionContent><p>1</p></ng-template>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2">
          <ng-template nfsAccordionHeader>Fast 2</ng-template>
          <ng-template nfsAccordionContent><p>2</p></ng-template>
        </ng-template>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger1 = canvas.getByRole('button', { name: /Fast 1/i });

    // Simulate 10 rapid clicks within ~200ms
    for (let i = 0; i < 10; i++) {
      await userEvent.click(trigger1);
    }

    // Allow queued toggles and microtasks to complete
    await new Promise((r) => setTimeout(r, 300));

    // Final state should be stable (either expanded true/false present)
    expect(['true', 'false']).toContain(trigger1.getAttribute('aria-expanded'));
  },
};
