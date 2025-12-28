import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import compodocConfig from '../.compodocrc.json';
import { cleanCompodocJson } from '../src/lib/util-storybook/clean-compodoc-json';
import { filterPrivateFields } from '../src/lib/util-storybook/filter-private-fields';

// Configure Compodoc documentation for automatic prop extraction
// Apply transformations: clean placeholders, then filter ES private fields if configured
// Note: filterPrivateFields is needed because Compodoc's disablePrivate option doesn't
// filter ES private fields (#) from JSON output (see https://github.com/compodoc/compodoc/issues/1687)
let processedJson = cleanCompodocJson(docJson);
if (compodocConfig.disablePrivate) {
  processedJson = filterPrivateFields(processedJson);
}
setCompodocJson(processedJson);

const preview: Preview = {
  tags: ['autodocs'],
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
