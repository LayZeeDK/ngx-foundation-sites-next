import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';

// Configure Compodoc documentation for automatic prop extraction
setCompodocJson(docJson);

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    controls: { expanded: true },
    a11y: {
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
