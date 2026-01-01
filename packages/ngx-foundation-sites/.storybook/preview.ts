import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { cleanCompodocJson } from '../src/lib/util-storybook/clean-compodoc-json';
import { provideNfsTesting } from 'ngx-foundation-sites/testing';

// Configure Compodoc documentation for automatic prop extraction
// cleanCompodocJson removes placeholder strings like "___COMPODOC_EMPTY_LINE___"
setCompodocJson(cleanCompodocJson(docJson));

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    // Use testing providers since Storybook bundles styles directly via webpack.
    // This prevents 404 errors for /assets/ngx-foundation-sites/*.css in the console.
    applicationConfig({
      providers: [provideNfsTesting()],
    }),
  ],
  parameters: {
    controls: { expanded: true },
    docs: {
      codePanel: true,
    },
    a11y: {
      // Enable accessibility testing in test-storybook (fails CI on violations)
      test: 'error',
      // Configure axe-core options
      config: {
        rules: [
          // Disable rules not applicable to isolated components
          { id: 'landmark-one-main', enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'region', enabled: false },
        ],
      },
      // Options for the a11y addon panel
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      },
    },
  },
};

export default preview;
