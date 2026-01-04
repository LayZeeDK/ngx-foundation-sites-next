import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { cleanCompodocJson } from '../src/lib/util-storybook/clean-compodoc-json';

// Configure Compodoc documentation for automatic prop extraction
// cleanCompodocJson removes placeholder strings like "___COMPODOC_EMPTY_LINE___"
setCompodocJson(cleanCompodocJson(docJson));

// ═══════════════════════════════════════════════════════════════════════════════
// RTL Stylesheet Swapping (Storybook-only)
// ═══════════════════════════════════════════════════════════════════════════════
// Watches document.dir and swaps /nfs-*.css ↔ /nfs-*-rtl.css
// This enables the Storybook direction toolbar to work with NfsStyleLoader
//
// Components use NfsStyleLoader to dynamically load their CSS files.
// Storybook serves pre-built files via staticDirs configured in main.ts.
//
// For production apps, consumers compile SCSS with their settings at build time
// (e.g., $global-text-direction: rtl in _nfs-settings.scss)

let rtlObserver: MutationObserver | null = null;

function swapNfsStylesheets(direction: string) {
  document
    .querySelectorAll<HTMLLinkElement>('link[id^="nfs-style"]')
    .forEach((link) => {
      const href = link.href;
      if (direction === 'rtl' && !href.includes('-rtl.css')) {
        link.href = href.replace('.css', '-rtl.css');
      } else if (direction !== 'rtl' && href.includes('-rtl.css')) {
        link.href = href.replace('-rtl.css', '.css');
      }
    });
}

function setupRtlStyleSwapping() {
  // Clean up any existing observer (important for HMR)
  teardownRtlStyleSwapping();

  let currentDirection = document.documentElement.dir || 'ltr';

  rtlObserver = new MutationObserver(() => {
    const newDirection = document.documentElement.dir || 'ltr';
    if (newDirection !== currentDirection) {
      currentDirection = newDirection;
      swapNfsStylesheets(newDirection);
    }
  });

  rtlObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dir'],
  });
}

function teardownRtlStyleSwapping() {
  if (rtlObserver) {
    rtlObserver.disconnect();
    rtlObserver = null;
  }
}

// Initialize on module load
setupRtlStyleSwapping();

// Cleanup on HMR (Webpack)
// @ts-expect-error - module.hot is Webpack-specific
if (module.hot) {
  // @ts-expect-error - module.hot is Webpack-specific
  module.hot.dispose(() => {
    teardownRtlStyleSwapping();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════

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
      document.documentElement.dir = direction;
      return story();
    },
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
