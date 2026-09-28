import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { Ui } from './ui';

const meta: Meta<Ui> = {
  title: 'Ui',
  component: Ui,
};
export default meta;

export const Purple: StoryObj<Ui> = {
  args: { color: 'purple' },
  play: async ({ canvasElement }) => {
    const buttons = canvasElement.querySelectorAll('button');
    await expect(buttons[0]).toHaveClass('purple');
    await expect(buttons[1]).toHaveClass('purple');
  },
};
