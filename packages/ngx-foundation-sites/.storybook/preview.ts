import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { addons } from 'storybook/preview-api';
import docJson from '../documentation.json';
import { cleanCompodocJson } from '../src/lib/util-storybook/clean-compodoc-json';
import { provideNfsStorybookStyleLoader } from '../src/storybook/nfs-storybook-style-loader';
import {
  applyThemeState,
  initializeRuntimeTheming,
  waitForInitialTheme,
} from '../src/storybook/runtime-theme-injector';
import {
  getDefaultThemeState,
  mergeWithDefaults,
} from '../src/storybook/theme-defaults';
import type { ThemeState } from './addons/theme-panel/types';
import { THEME_STATE_KEY, EVENTS } from './addons/theme-panel/constants';

// Configure Compodoc documentation for automatic prop extraction
// cleanCompodocJson removes placeholder strings like "___COMPODOC_EMPTY_LINE___"
setCompodocJson(cleanCompodocJson(docJson));

// ═══════════════════════════════════════════════════════════════════════════════
// Runtime Theming (Storybook-only)
// ═══════════════════════════════════════════════════════════════════════════════
// Enables runtime Foundation theming in Storybook by compiling Sass in the browser.
// Users can customize theme variables via the Theme addon panel.
//
// Architecture:
// 1. Sass sources are bundled at build time (bundle-sass target)
// 2. Dart Sass is loaded from a local pre-bundled file (no CDN dependency)
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
  loaders: [
    // Wait for initial theme CSS to be compiled and injected before rendering
    // This ensures a11y tests run against the runtime-compiled CSS, not unstyled content
    async () => {
      await waitForInitialTheme();
      return {};
    },
  ],
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
    // Provide NfsStorybookStyleLoader to disable precompiled stylesheets when runtime theming is active
    applicationConfig({
      providers: [provideNfsStorybookStyleLoader()],
    }),
    // Apply theme state from addon panel, synced with direction toolbar
    (story, context) => {
      // Get direction from toolbar (synced with theme state's globalTextDirection)
      const direction = (context.globals['direction'] || 'ltr') as
        | 'ltr'
        | 'rtl';
      document.documentElement.dir = direction;

      // Use mergeWithDefaults to handle partial objects from URL globals restoration
      // Storybook's URL persistence can create partial objects with undefined values
      const themeState = mergeWithDefaults(
        context.globals[THEME_STATE_KEY] as Partial<ThemeState> | undefined,
      );

      // Sync toolbar direction with theme state's globalTextDirection
      // This enables runtime Sass compilation with correct RTL/LTR settings
      themeState.layout.globalTextDirection = direction;

      const hash = JSON.stringify(themeState);

      // Only apply if theme state changed (prevents re-compilation on every render)
      if (hash !== currentThemeStateHash) {
        currentThemeStateHash = hash;
        const channel = addons.getChannel();

        // Fire-and-forget: theme will be applied asynchronously
        // The visual update happens when the style element is updated
        applyThemeState(themeState, {
          onCompileStart: () => channel.emit(EVENTS.COMPILE_START),
          onCompileEnd: () => channel.emit(EVENTS.COMPILE_END),
        }).catch((error) => {
          console.error('[nfs-theme] Failed to apply theme state:', error);
          // Ensure we emit end even on error
          channel.emit(EVENTS.COMPILE_END);
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
