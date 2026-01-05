import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { cleanCompodocJson } from '../src/lib/util-storybook/clean-compodoc-json';
import {
  applyThemeState,
  initializeRuntimeTheming,
} from '../src/storybook/runtime-theme-injector';
import { getDefaultThemeState } from '../src/storybook/theme-defaults';
import type { ThemeState } from './addons/theme-panel/types';
import { THEME_STATE_KEY } from './addons/theme-panel/constants';

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
// Runtime Theming (Storybook-only)
// ═══════════════════════════════════════════════════════════════════════════════
// Enables runtime Foundation theming in Storybook by compiling Sass in the browser.
// Users can customize theme variables via the Theme addon panel.
//
// Architecture:
// 1. Sass sources are bundled at build time (bundle-sass target)
// 2. Dart Sass is lazy-loaded from JSPM CDN on first use
// 3. Theme changes trigger recompilation (cached for instant switching)
// 4. Compiled CSS is injected into a <style> element, overriding precompiled styles

// Initialize runtime theming (preloads Sass compiler)
// Fire-and-forget: don't block Storybook startup
initializeRuntimeTheming().catch((error) => {
  console.error('[nfs-theme] Failed to initialize:', error);
});

// Track current theme state hash to detect changes
let currentThemeStateHash: string | null = null;

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
    // Theme state is managed by the Theme addon panel, not a toolbar dropdown
  },
  initialGlobals: {
    direction: 'ltr',
    [THEME_STATE_KEY]: getDefaultThemeState(),
  },
  decorators: [
    // Apply direction based on toolbar selection
    (story, context) => {
      const direction = context.globals['direction'] || 'ltr';
      document.documentElement.dir = direction;
      return story();
    },
    // Apply theme state from addon panel
    (story, context) => {
      const themeState =
        (context.globals[THEME_STATE_KEY] as ThemeState) ||
        getDefaultThemeState();
      const hash = JSON.stringify(themeState);

      // Only apply if theme state changed (prevents re-compilation on every render)
      if (hash !== currentThemeStateHash) {
        currentThemeStateHash = hash;
        // Fire-and-forget: theme will be applied asynchronously
        // The visual update happens when the style element is updated
        applyThemeState(themeState).catch((error) => {
          console.error('[nfs-theme] Failed to apply theme state:', error);
        });
      }

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
