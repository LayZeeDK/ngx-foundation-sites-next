import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  render: (args) => ({
    props: args,
    template: `<nfs-button [type]="type" [disabled]="disabled">Click me</nfs-button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Default: Story = {
  args: {
    type: 'button',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    type: 'button',
    disabled: true,
  },
};
