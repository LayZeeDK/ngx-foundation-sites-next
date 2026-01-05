/**
 * Browser Sass Compiler for Runtime Theming
 *
 * This module compiles Sass in the browser using Dart Sass loaded from JSPM CDN.
 * It uses bundled Sass sources and a custom importer to resolve @import statements.
 *
 * @example
 * ```typescript
 * import { compileSass, type FoundationPalette } from './browser-sass-compiler';
 *
 * const palette: FoundationPalette = {
 *   primary: '#006994',
 *   secondary: '#40798c',
 *   success: '#70a9a1',
 *   warning: '#cfd7c7',
 *   alert: '#f6511d',
 * };
 *
 * const css = await compileSass('accordion', palette);
 * ```
 */

import { SASS_SOURCES, type AvailableComponent } from './generated/sass-bundle';
import type { ThemeState } from '../../.storybook/addons/theme-panel/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Foundation color palette configuration.
 * These colors map to Foundation's `$foundation-palette` Sass map.
 */
export interface FoundationPalette {
  /** Primary brand color - used for links, buttons, and key UI elements */
  primary: string;
  /** Secondary color - used for secondary buttons and less prominent elements */
  secondary: string;
  /** Success color - used for positive feedback and success states */
  success: string;
  /** Warning color - used for warning messages and caution states */
  warning: string;
  /** Alert color - used for errors and critical states */
  alert: string;
}

/**
 * Sass number value type.
 */
interface SassNumber {
  value: number;
  numeratorUnits: string[];
  denominatorUnits: string[];
}

/**
 * Sass color value type.
 */
interface SassColor {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly alpha: number;
}

/**
 * Sass number constructor type.
 */
interface SassNumberConstructor {
  new (
    value: number,
    unitOrOptions?:
      | string
      | { numeratorUnits?: string[]; denominatorUnits?: string[] },
  ): SassNumber;
}

/**
 * Sass color constructor type.
 */
interface SassColorConstructor {
  new (options: {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
  }): SassColor;
}

/**
 * Generic Sass value (number or color).
 */
type SassValue = SassNumber | SassColor;

/**
 * Sass compiler module type (subset of dart-sass API we use).
 */
interface SassModule {
  compileStringAsync: (
    source: string,
    options: {
      importers: Array<{
        canonicalize: (
          url: string,
          context: { containingUrl: URL | null },
        ) => URL | null;
        load: (url: URL) => { contents: string; syntax: 'scss' | 'css' } | null;
      }>;
      functions?: Record<string, (args: SassValue[]) => SassValue>;
      silenceDeprecations?: string[];
    },
  ) => Promise<{ css: string }>;
  SassNumber: SassNumberConstructor;
  SassColor: SassColorConstructor;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Module State
// ═══════════════════════════════════════════════════════════════════════════════

/** Cached Sass module after lazy loading */
let sassModule: SassModule | null = null;

/** Promise for loading Sass (prevents concurrent loads) */
let sassLoadPromise: Promise<SassModule> | null = null;

/**
 * CDN URL for Dart Sass - JSPM provides browser-compatible ESM builds.
 * Note: JSPM only serves the latest version. Foundation uses deprecated global
 * math functions (round, ceil, floor) which are now in sass:math module.
 * We silence deprecation warnings to allow compilation.
 */
const SASS_CDN_URL = 'https://jspm.dev/sass';

// ═══════════════════════════════════════════════════════════════════════════════
// Sass Loading
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Dynamically imports a module from a CDN URL.
 * This bypasses Webpack's module resolution by using the browser's native import().
 *
 * @param url - CDN URL to import
 * @returns Promise resolving to the module
 */
async function dynamicImportFromCDN(url: string): Promise<unknown> {
  // Use Function constructor to create a dynamic import that bypasses Webpack
  // This is necessary because Webpack tries to bundle import() calls at build time
  const importFn = new Function('url', 'return import(url)') as (
    url: string,
  ) => Promise<unknown>;
  return importFn(url);
}

/**
 * Lazily loads Dart Sass from JSPM CDN.
 * Uses singleton pattern to avoid multiple loads.
 *
 * @returns Promise resolving to the Sass module
 */
async function loadSass(): Promise<SassModule> {
  if (sassModule) {
    return sassModule;
  }

  if (sassLoadPromise) {
    return sassLoadPromise;
  }

  sassLoadPromise = (async () => {
    console.log('[nfs-theme] Loading Dart Sass from CDN...');
    const startTime = performance.now();

    // Dynamic import from CDN using browser's native import()
    const module = (await dynamicImportFromCDN(SASS_CDN_URL)) as Record<
      string,
      unknown
    >;

    const loadTime = Math.round(performance.now() - startTime);
    console.log(`[nfs-theme] Sass loaded in ${loadTime}ms`);

    // CDNs export modules differently - handle various structures:
    // - Direct export: module.compileStringAsync
    // - Default export: module.default.compileStringAsync
    // Log module keys for debugging
    console.log('[nfs-theme] Module keys:', Object.keys(module));

    let sass: SassModule;
    if (typeof module['compileStringAsync'] === 'function') {
      sass = module as unknown as SassModule;
    } else if (
      module['default'] &&
      typeof (module['default'] as Record<string, unknown>)[
        'compileStringAsync'
      ] === 'function'
    ) {
      sass = module['default'] as SassModule;
    } else {
      throw new Error(
        'Sass module structure not recognized. Check console for module keys.',
      );
    }

    sassModule = sass;
    return sassModule;
  })();

  return sassLoadPromise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Import Resolution
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Custom URL scheme for bundled Sass files.
 */
const BUNDLE_SCHEME = 'nfs-bundle:';

/**
 * Resolves a Sass import path to a canonical path in our bundle.
 *
 * Handles:
 * - Relative imports (e.g., 'math' from within util/)
 * - Absolute imports (e.g., 'foundation-sites/scss/util/util')
 * - Partial resolution (adds _ prefix if needed)
 * - URLs with nfs-bundle: scheme prefix (strips it for lookup)
 *
 * @param importPath - The path being imported
 * @param containingUrl - The URL of the file doing the import
 * @returns Canonical path or null if not found
 */
function resolveImportPath(
  importPath: string,
  containingUrl: URL | null,
): string | null {
  // Strip nfs-bundle: prefix if present (Sass may re-canonicalize URLs)
  let cleanPath = importPath;
  if (importPath.startsWith(BUNDLE_SCHEME)) {
    cleanPath = importPath.slice(BUNDLE_SCHEME.length);
  }

  // Try direct lookup first
  if (SASS_SOURCES[cleanPath]) {
    return cleanPath;
  }

  // If importing from a bundled file, resolve relative paths
  if (containingUrl?.protocol === 'nfs-bundle:') {
    const containingPath = containingUrl.pathname;
    const containingDir = containingPath.substring(
      0,
      containingPath.lastIndexOf('/') + 1,
    );
    const relativePath = containingDir + cleanPath;

    if (SASS_SOURCES[relativePath]) {
      return relativePath;
    }
  }

  // Not found in bundle
  return null;
}

/**
 * Creates a custom Sass importer for our bundled sources.
 */
function createBundleImporter() {
  return {
    canonicalize(
      url: string,
      context: { containingUrl: URL | null },
    ): URL | null {
      // Skip built-in Sass modules (sass:color, sass:math, etc.)
      if (url.startsWith('sass:')) {
        return null;
      }

      const resolved = resolveImportPath(url, context.containingUrl);
      if (resolved) {
        return new URL(`${BUNDLE_SCHEME}${resolved}`);
      }

      // Not found - log for debugging
      console.warn(
        `[nfs-theme] Import not found: "${url}" from ${context.containingUrl?.pathname || 'entry'}`,
      );
      return null;
    },

    load(url: URL): { contents: string; syntax: 'scss' | 'css' } | null {
      const path = url.pathname;
      const contents = SASS_SOURCES[path];

      if (contents) {
        return { contents, syntax: 'scss' };
      }

      console.warn(`[nfs-theme] Failed to load: "${path}"`);
      return null;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Legacy Math Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates legacy global functions that Foundation's Sass code expects.
 * Newer Sass versions moved math functions to sass:math and color functions
 * to sass:color, but Foundation still uses them as global functions.
 *
 * @param sass - The Sass module with SassNumber and SassColor constructors
 * @returns Object of custom function definitions
 */
function createLegacyFunctions(
  sass: SassModule,
): Record<string, (args: SassValue[]) => SassValue> {
  const { SassNumber } = sass;

  /**
   * Helper to create a math function that preserves units.
   */
  const createMathFn = (
    fn: (n: number) => number,
  ): ((args: SassValue[]) => SassNumber) => {
    return (args: SassValue[]) => {
      const num = args[0] as SassNumber;
      return new SassNumber(fn(num.value), {
        numeratorUnits: num.numeratorUnits,
        denominatorUnits: num.denominatorUnits,
      });
    };
  };

  return {
    // Math functions (from sass:math)
    'round($number)': createMathFn(Math.round),
    'ceil($number)': createMathFn(Math.ceil),
    'floor($number)': createMathFn(Math.floor),
    'abs($number)': createMathFn(Math.abs),
    'percentage($number)': (args: SassValue[]) => {
      const num = args[0] as SassNumber;
      return new SassNumber(num.value * 100, '%');
    },

    // Color extraction functions (from sass:color)
    'red($color)': (args: SassValue[]) => {
      const color = args[0] as SassColor;
      return new SassNumber(color.red);
    },
    'green($color)': (args: SassValue[]) => {
      const color = args[0] as SassColor;
      return new SassNumber(color.green);
    },
    'blue($color)': (args: SassValue[]) => {
      const color = args[0] as SassColor;
      return new SassNumber(color.blue);
    },
    'alpha($color)': (args: SassValue[]) => {
      const color = args[0] as SassColor;
      return new SassNumber(color.alpha);
    },
    'opacity($color)': (args: SassValue[]) => {
      const color = args[0] as SassColor;
      return new SassNumber(color.alpha);
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Compilation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Builds the SCSS source with injected theme variables.
 *
 * @param component - Component to compile
 * @param palette - Foundation palette to inject
 * @returns SCSS source string
 */
function buildScssSource(
  component: AvailableComponent,
  palette: FoundationPalette,
): string {
  // Inject palette BEFORE importing Foundation utilities
  // Then call add-foundation-colors() to extract individual color variables
  // ($primary-color, $secondary-color, etc.) that components like accordion use
  return `
// Injected theme variables (runtime)
$foundation-palette: (
  "primary": ${palette.primary},
  "secondary": ${palette.secondary},
  "success": ${palette.success},
  "warning": ${palette.warning},
  "alert": ${palette.alert},
);

// Import Foundation utilities and global settings
@import 'foundation-sites/scss/util/util';
@import 'foundation-sites/scss/global';

// Extract individual color variables from the palette
// This creates $primary-color, $secondary-color, etc.
@include add-foundation-colors();

// Import the component
@import '${component}';
`;
}

/**
 * Compiles a component's Sass with the specified color palette.
 *
 * @param component - Component to compile ('accordion' | 'button')
 * @param palette - Foundation palette colors
 * @returns Promise resolving to compiled CSS string
 * @throws Error if compilation fails
 *
 * @example
 * ```typescript
 * const css = await compileSass('accordion', {
 *   primary: '#006994',
 *   secondary: '#40798c',
 *   success: '#70a9a1',
 *   warning: '#cfd7c7',
 *   alert: '#f6511d',
 * });
 * ```
 */
export async function compileSass(
  component: AvailableComponent,
  palette: FoundationPalette,
): Promise<string> {
  const sass = await loadSass();
  const source = buildScssSource(component, palette);

  console.log(`[nfs-theme] Compiling ${component}...`);
  const startTime = performance.now();

  const legacyFns = createLegacyFunctions(sass);
  console.log(
    `[nfs-theme] Registered custom functions:`,
    Object.keys(legacyFns),
  );

  const result = await sass.compileStringAsync(source, {
    importers: [createBundleImporter()],
    // Provide legacy global functions that Foundation's Sass code expects
    // Newer Sass moved math functions to sass:math and color functions to sass:color
    functions: legacyFns,
    // Suppress deprecation warnings for @import (Foundation uses legacy @import)
    silenceDeprecations: ['import', 'global-builtin'],
  });

  const compileTime = Math.round(performance.now() - startTime);
  console.log(`[nfs-theme] ${component} compiled in ${compileTime}ms`);

  return result.css;
}

/**
 * Compiles multiple components with the specified palette.
 *
 * @param components - Array of components to compile
 * @param palette - Foundation palette colors
 * @returns Promise resolving to concatenated CSS string
 */
export async function compileComponents(
  components: AvailableComponent[],
  palette: FoundationPalette,
): Promise<string> {
  const results = await Promise.all(
    components.map((component) => compileSass(component, palette)),
  );
  return results.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ThemeState-based Compilation (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Builds SCSS source with full theme state including component-specific variables.
 *
 * @param component - Component to compile
 * @param themeState - Complete theme state with palette and component variables
 * @returns SCSS source string
 */
function buildScssSourceWithTheme(
  component: AvailableComponent,
  themeState: ThemeState,
): string {
  const { palette, accordion, button } = themeState;

  return `
// ═══════════════════════════════════════════════════════════════════════════════
// Injected theme variables (runtime)
// ═══════════════════════════════════════════════════════════════════════════════

// Color Palette
$foundation-palette: (
  "primary": ${palette.primary},
  "secondary": ${palette.secondary},
  "success": ${palette.success},
  "warning": ${palette.warning},
  "alert": ${palette.alert},
);

// Accordion Variables
$accordion-background: ${accordion.background};
$accordion-plusminus: ${accordion.plusminus};
$accordion-title-font-size: ${accordion.titleFontSize};
$accordion-item-padding: ${accordion.itemPadding.vertical} ${accordion.itemPadding.horizontal};
$nfs-accordion-slide-speed: ${accordion.slideSpeed};

// Button Variables
$button-padding: ${button.padding.vertical} ${button.padding.horizontal};
$button-radius: ${button.radius};
$button-font-size: ${button.fontSize};

// ═══════════════════════════════════════════════════════════════════════════════
// Foundation Setup
// ═══════════════════════════════════════════════════════════════════════════════

// Import Foundation utilities and global settings
@import 'foundation-sites/scss/util/util';
@import 'foundation-sites/scss/global';

// Extract individual color variables from the palette
// This creates $primary-color, $secondary-color, etc.
@include add-foundation-colors();

// Import the component
@import '${component}';
`;
}

/**
 * Compiles a component's Sass with the complete theme state.
 *
 * This function uses all theme variables (palette + component-specific)
 * for more fine-grained control compared to `compileSass()`.
 *
 * @param component - Component to compile ('accordion' | 'button')
 * @param themeState - Complete theme state
 * @returns Promise resolving to compiled CSS string
 * @throws Error if compilation fails
 *
 * @example
 * ```typescript
 * import { compileSassWithTheme } from './browser-sass-compiler';
 * import { DEFAULT_THEME_STATE } from './theme-defaults';
 *
 * const css = await compileSassWithTheme('accordion', {
 *   ...DEFAULT_THEME_STATE,
 *   accordion: { ...DEFAULT_THEME_STATE.accordion, background: '#f0f0f0' },
 * });
 * ```
 */
export async function compileSassWithTheme(
  component: AvailableComponent,
  themeState: ThemeState,
): Promise<string> {
  const sass = await loadSass();
  const source = buildScssSourceWithTheme(component, themeState);

  console.log(`[nfs-theme] Compiling ${component} with theme state...`);
  const startTime = performance.now();

  const legacyFns = createLegacyFunctions(sass);

  const result = await sass.compileStringAsync(source, {
    importers: [createBundleImporter()],
    functions: legacyFns,
    silenceDeprecations: ['import', 'global-builtin'],
  });

  const compileTime = Math.round(performance.now() - startTime);
  console.log(`[nfs-theme] ${component} compiled in ${compileTime}ms`);

  return result.css;
}

/**
 * Compiles multiple components with the complete theme state.
 *
 * @param components - Array of components to compile
 * @param themeState - Complete theme state
 * @returns Promise resolving to concatenated CSS string
 */
export async function compileComponentsWithTheme(
  components: AvailableComponent[],
  themeState: ThemeState,
): Promise<string> {
  const results = await Promise.all(
    components.map((component) => compileSassWithTheme(component, themeState)),
  );
  return results.join('\n');
}

/**
 * Preloads Dart Sass for faster first compilation.
 * Call this early in the application lifecycle.
 */
export async function preloadSass(): Promise<void> {
  await loadSass();
}
