import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  // Serve precompiled CSS at root (files have nfs- prefix: /nfs-accordion.css)
  staticDirs: [{ from: '../dist-css', to: '/' }],
};

export default config;
