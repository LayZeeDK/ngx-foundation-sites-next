import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fn } from 'storybook/test';
import { NfsDisclosure } from './disclosure';
import { NfsDisclosureHost } from './disclosure-host';

// PROTOTYPE: one CSF file shared by Storybook, addon-vitest, Playwright CT and a Vitest Browser spec.
const meta: Meta<NfsDisclosureHost> = {
  title: 'Disclosure',
  component: NfsDisclosureHost,
  args: { label: 'Details', expanded: false, toggled: fn() },
};

export default meta;
type Story = StoryObj<NfsDisclosureHost>;

/** Renders the host component from args; the play function is the shared interaction test. */
export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: 'Details' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(button);

    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveClass('is-active');
    await expect(canvas.getByText('Panel content')).toBeVisible();
    await expect(args.toggled).toHaveBeenCalledWith(true);
  },
};

/** The directive written straight into a story template, no host component. */
export const OnButton: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [NfsDisclosure] },
    template: `
      <button nfsDisclosure="on-button-panel" [(expanded)]="expanded" (toggled)="toggled($event)">{{ label }}</button>
      <div id="on-button-panel" [hidden]="!expanded">Panel content</div>
    `,
  }),
  play: Default.play,
};
