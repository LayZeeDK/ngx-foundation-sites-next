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
  // Serve static assets at root:
  // - dist-css: Precompiled CSS (nfs-accordion.css, etc.)
  // - static: Pre-bundled Sass compiler (sass-browser.mjs)
  staticDirs: [
    { from: '../dist-css', to: '/' },
    { from: './static', to: '/' },
  ],
};

export default config;
