import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/angular';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    join(__dirname, 'addons/theme-panel/preset.js'), // Foundation Theme Panel
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  // Serve precompiled CSS at root (files have nfs- prefix: /nfs-accordion.css)
  staticDirs: [{ from: '../dist-css', to: '/' }],
};

export default config;
