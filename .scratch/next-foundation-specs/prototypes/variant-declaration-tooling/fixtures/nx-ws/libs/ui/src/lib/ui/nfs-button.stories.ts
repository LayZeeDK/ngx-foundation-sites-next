import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { NfsButton } from 'ngx-foundation-sites/button';

const meta: Meta<NfsButton> = {
  title: 'NfsButton',
  component: NfsButton,
  render: (args) => ({
    props: args,
    template: `<button nfsButton [color]="color">Button</button>`,
  }),
};
export default meta;

export const Purple: StoryObj<NfsButton> = {
  args: { color: 'purple' } as never,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('button')).toHaveClass('purple');
  },
};
