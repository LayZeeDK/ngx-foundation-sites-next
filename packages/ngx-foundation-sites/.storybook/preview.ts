import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { cleanCompodocJson } from '../src/lib/util-storybook/clean-compodoc-json';
import { provideNfsTesting } from 'ngx-foundation-sites/testing';

// Import both LTR and RTL stylesheets as raw CSS strings for dynamic swapping.
// The ?inline query triggers our custom webpack rule in main.ts.
// Foundation compiles direction-specific CSS (e.g., `right: 1rem` for LTR vs `left: 1rem` for RTL).
// Loading both simultaneously causes conflicts, so we swap between them.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - webpack ?inline query imports CSS as string
import ltrStyles from '../src/storybook/all-components-ltr.scss?inline';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - webpack ?inline query imports CSS as string
import rtlStyles from '../src/storybook/all-components-rtl.scss?inline';

// Configure Compodoc documentation for automatic prop extraction
// cleanCompodocJson removes placeholder strings like "___COMPODOC_EMPTY_LINE___"
setCompodocJson(cleanCompodocJson(docJson));

const DIRECTION_STYLE_ID = 'nfs-direction-styles';

/**
 * Set the document's text direction and swap stylesheets for RTL/LTR.
 *
 * Foundation compiles direction-specific CSS (e.g., `right: 1rem` vs `left: 1rem`).
 * Loading both stylesheets causes conflicts. This function:
 * 1. Sets the `dir` attribute on <html>
 * 2. Swaps the active stylesheet (only one is active at a time)
 */
function setDirection(direction: 'ltr' | 'rtl'): void {
  document.documentElement.dir = direction;

  // Remove existing direction stylesheet
  document.getElementById(DIRECTION_STYLE_ID)?.remove();

  // Inject the appropriate stylesheet
  const style = document.createElement('style');
  style.id = DIRECTION_STYLE_ID;
  style.textContent = direction === 'rtl' ? rtlStyles : ltrStyles;
  document.head.appendChild(style);
}

// Initialize LTR styles immediately (before any story renders)
setDirection('ltr');

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
