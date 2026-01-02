import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { cleanCompodocJson } from '../src/lib/util-storybook/clean-compodoc-json';
import { provideNfsTesting } from 'ngx-foundation-sites/testing';

// Configure Compodoc documentation for automatic prop extraction
// cleanCompodocJson removes placeholder strings like "___COMPODOC_EMPTY_LINE___"
setCompodocJson(cleanCompodocJson(docJson));

/**
 * Set the document's text direction for RTL testing.
 *
 * Both LTR and RTL styles are loaded together. RTL styles are scoped with
 * [dir='rtl'] selector, so they only apply when dir="rtl" is set on an ancestor.
 * This leverages Foundation's compile-time RTL while enabling runtime switching.
 */
function setDirection(direction: 'ltr' | 'rtl'): void {
  document.documentElement.dir = direction;
}

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    direction: {
      description: 'Text direction for RTL testing',
      toolbar: {
        title: 'Direction',
        icon: 'globe',
        items: [
          { value: 'ltr', title: 'LTR', right: '→' },
          { value: 'rtl', title: 'RTL', right: '←' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    direction: 'ltr',
  },
  decorators: [
    // Apply direction based on toolbar selection
    (story, context) => {
      const direction = context.globals['direction'] || 'ltr';
      setDirection(direction);
      return story();
    },
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
