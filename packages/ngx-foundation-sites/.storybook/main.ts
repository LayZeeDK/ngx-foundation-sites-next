import type { StorybookConfig } from '@storybook/angular';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  webpackFinal: async (config) => {
    // Add rule for importing SCSS files as raw CSS strings using ?inline query
    // This enables dynamic stylesheet swapping for RTL/LTR direction toggle
    config.module?.rules?.unshift({
      test: /\.scss$/,
      resourceQuery: /inline/,
      use: [
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              includePaths: [
                path.resolve(__dirname, '../src/storybook'),
                path.resolve(__dirname, '../../../node_modules'),
                path.resolve(
                  __dirname,
                  '../../../node_modules/foundation-sites/scss',
                ),
              ],
            },
          },
        },
      ],
      type: 'asset/source',
    });

    return config;
  },
};

export default config;
