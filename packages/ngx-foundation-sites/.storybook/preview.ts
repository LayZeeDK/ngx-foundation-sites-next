import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';

/**
 * Recursively transforms Compodoc JSON to clean up placeholder strings.
 * Compodoc uses `___COMPODOC_EMPTY_LINE___` to preserve empty lines in JSDoc,
 * but Storybook doesn't process these. This replaces them with actual newlines.
 */
function cleanCompodocJson<T>(obj: T): T {
  if (typeof obj === 'string') {
    // Remove Compodoc placeholder - the surrounding \n already provides spacing
    return obj.split('___COMPODOC_EMPTY_LINE___').join('') as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanCompodocJson) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        cleanCompodocJson(value),
      ]),
    ) as T;
  }
  return obj;
}

// Configure Compodoc documentation for automatic prop extraction
setCompodocJson(cleanCompodocJson(docJson));

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
