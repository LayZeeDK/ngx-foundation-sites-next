/**
 * Sass Web Worker Thread Implementation
 *
 * This file runs in a separate Web Worker thread, handling Sass compilation
 * off the main thread to prevent UI freezing.
 *
 * Note: This file is bundled separately by webpack and runs in an isolated
 * worker context. It cannot directly import from the main bundle.
 */

/// <reference lib="webworker" />

// ═══════════════════════════════════════════════════════════════════════════════
// Types (duplicated here since workers can't share imports with main thread)
// ═══════════════════════════════════════════════════════════════════════════════

interface SpacingValue {
  vertical: string;
  horizontal: string;
}

interface LinkedColorValue {
  mode: 'custom' | 'palette';
  paletteKey?: 'primary' | 'secondary' | 'success' | 'warning' | 'alert';
  customColor?: string;
}

interface PaletteState {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  alert: string;
}

interface ThemeState {
  palette: PaletteState;
  globalColors: {
    white: string;
    lightGray: string;
    mediumGray: string;
    darkGray: string;
    black: string;
    bodyBackground: string;
    bodyFontColor: string;
  };
  typography: {
    globalFontSize: string;
    globalLineHeight: string;
    globalWeightNormal: string;
    globalWeightBold: string;
    bodyFontFamily: string;
    headerFontFamily: string;
    headerLineHeight: string;
  };
  spacing: {
    globalMargin: string;
    globalPadding: string;
    globalRadius: string;
    globalMenuPadding: SpacingValue;
  };
  layout: {
    globalTextDirection: 'ltr' | 'rtl';
    globalWidth: string;
    globalFlexbox: boolean;
  };
  accordion: {
    background: string;
    plusminus: boolean;
    titleFontSize: string;
    itemPadding: SpacingValue;
    slideSpeed: string;
    plusContent: string;
    minusContent: string;
    itemColor: LinkedColorValue;
    itemBackgroundHover: LinkedColorValue;
    contentBackground: string;
    contentBorder: string;
    contentColor: LinkedColorValue;
    contentPadding: string;
  };
  button: {
    padding: SpacingValue;
    radius: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    margin: SpacingValue;
    fill: 'solid' | 'hollow';
    background: LinkedColorValue;
    backgroundHover: LinkedColorValue;
    color: LinkedColorValue;
    colorAlt: LinkedColorValue;
    border: string;
    hollowBorderWidth: string;
    opacityDisabled: string;
    backgroundHoverLightness: string;
    hollowHoverLightness: string;
    transition: string;
    responsiveExpanded: boolean;
    sizes: {
      tiny: string;
      small: string;
      default: string;
      large: string;
    };
  };
}

/**
 * Resolves a LinkedColorValue to its actual hex color.
 */
function resolveLinkedColor(
  value: LinkedColorValue,
  palette: PaletteState,
): string {
  if (value.mode === 'palette' && value.paletteKey) {
    return palette[value.paletteKey];
  }
  return value.customColor ?? '#000000';
}

interface WorkerRequest {
  id: number;
  type: 'init' | 'compile';
  sassSources?: Record<string, string>;
  component?: string;
  themeState?: ThemeState;
}

interface WorkerResponse {
  id: number;
  type: 'ready' | 'compiled' | 'error';
  css?: string;
  error?: string;
  timing?: number;
}

// Type for Dart Sass module loaded from CDN
interface SassModule {
  compileStringAsync: (
    source: string,
    options: SassCompileOptions,
  ) => Promise<{ css: string }>;
  SassNumber: new (
    value: number,
    unit?: string | { numeratorUnits?: string[]; denominatorUnits?: string[] },
  ) => SassNumber;
}

interface SassCompileOptions {
  importers: SassImporter[];
  functions: Record<string, (args: SassValue[]) => SassValue>;
  silenceDeprecations?: string[];
}

interface SassImporter {
  canonicalize: (url: string, context: { containingUrl?: URL }) => URL | null;
  load: (url: URL) => { contents: string; syntax: string } | null;
}

interface SassValue {
  value?: number;
  numeratorUnits?: string[];
  denominatorUnits?: string[];
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

interface SassNumber extends SassValue {
  value: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

// Pre-bundled Sass (served from Storybook static directory)
const SASS_LOCAL_URL = '/sass-browser.mjs';
const BUNDLE_SCHEME = 'nfs-bundle:';

// ═══════════════════════════════════════════════════════════════════════════════
// Worker State
// ═══════════════════════════════════════════════════════════════════════════════

let sassModule: SassModule | null = null;
let sassSources: Record<string, string> | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// Sass Loading
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Loads Dart Sass from the local pre-bundled version.
 *
 * The bundle is created by tools/bundle-sass-compiler.mjs and includes
 * Node.js polyfills (process, path, etc.) for browser compatibility.
 */
async function loadSass(): Promise<SassModule> {
  if (sassModule) return sassModule;

  const startTime = performance.now();
  console.log('[sass-worker] Loading Sass from local bundle...');

  const module = await import(/* webpackIgnore: true */ SASS_LOCAL_URL);
  const loadTime = Math.round(performance.now() - startTime);
  console.log(`[sass-worker] Sass loaded in ${loadTime}ms`);

  sassModule = extractSassModule(module);
  return sassModule;
}

/**
 * Extracts the Sass module from different export formats.
 */
function extractSassModule(module: unknown): SassModule {
  const mod = module as Record<string, unknown>;

  // ESM direct export
  if (typeof mod['compileStringAsync'] === 'function') {
    return mod as unknown as SassModule;
  }

  // CommonJS default export
  const defaultExport = mod['default'] as Record<string, unknown> | undefined;
  if (
    defaultExport &&
    typeof defaultExport['compileStringAsync'] === 'function'
  ) {
    return defaultExport as unknown as SassModule;
  }

  throw new Error('Sass module structure not recognized');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Import Resolution
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolves an import path to a key in our bundled sources.
 */
function resolveImportPath(
  importPath: string,
  containingUrl?: URL,
): string | null {
  let cleanPath = importPath;
  if (importPath.startsWith(BUNDLE_SCHEME)) {
    cleanPath = importPath.slice(BUNDLE_SCHEME.length);
  }

  // Direct match
  if (sassSources?.[cleanPath]) {
    return cleanPath;
  }

  // Relative resolution from containing file
  if (containingUrl?.protocol === 'nfs-bundle:') {
    const containingPath = containingUrl.pathname;
    const containingDir = containingPath.substring(
      0,
      containingPath.lastIndexOf('/') + 1,
    );
    const relativePath = containingDir + cleanPath;

    if (sassSources?.[relativePath]) {
      return relativePath;
    }
  }

  return null;
}

/**
 * Creates a custom Sass importer for our bundled sources.
 */
function createBundleImporter(): SassImporter {
  return {
    canonicalize(url: string, context: { containingUrl?: URL }): URL | null {
      // Let Sass handle its built-in modules
      if (url.startsWith('sass:')) {
        return null;
      }

      const resolved = resolveImportPath(url, context.containingUrl);
      if (resolved) {
        return new URL(BUNDLE_SCHEME + resolved);
      }

      console.warn(`[sass-worker] Import not found: "${url}"`);
      return null;
    },

    load(url: URL): { contents: string; syntax: string } | null {
      const path = url.pathname;
      const contents = sassSources?.[path];

      if (contents) {
        return { contents, syntax: 'scss' };
      }

      console.warn(`[sass-worker] Failed to load: "${path}"`);
      return null;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Legacy Function Compatibility
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates legacy math/color functions for Foundation compatibility.
 * Foundation uses deprecated global Sass functions that modern Dart Sass
 * requires to be provided explicitly.
 */
function createLegacyFunctions(
  sass: SassModule,
): Record<string, (args: SassValue[]) => SassValue> {
  const { SassNumber } = sass;

  const createMathFn = (fn: (x: number) => number) => {
    return (args: SassValue[]): SassNumber => {
      const num = args[0];
      return new SassNumber(fn(num.value!), {
        numeratorUnits: num.numeratorUnits,
        denominatorUnits: num.denominatorUnits,
      });
    };
  };

  return {
    'round($number)': createMathFn(Math.round),
    'ceil($number)': createMathFn(Math.ceil),
    'floor($number)': createMathFn(Math.floor),
    'abs($number)': createMathFn(Math.abs),
    'percentage($number)': (args: SassValue[]): SassNumber => {
      const num = args[0];
      return new SassNumber(num.value! * 100, '%');
    },
    'red($color)': (args: SassValue[]): SassNumber =>
      new SassNumber(args[0].red!),
    'green($color)': (args: SassValue[]): SassNumber =>
      new SassNumber(args[0].green!),
    'blue($color)': (args: SassValue[]): SassNumber =>
      new SassNumber(args[0].blue!),
    'alpha($color)': (args: SassValue[]): SassNumber =>
      new SassNumber(args[0].alpha!),
    'opacity($color)': (args: SassValue[]): SassNumber =>
      new SassNumber(args[0].alpha!),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCSS Source Generation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Builds SCSS source with injected theme variables.
 */
function buildScssSource(component: string, themeState: ThemeState): string {
  const {
    palette,
    globalColors,
    typography,
    spacing,
    layout,
    accordion,
    button,
  } = themeState;

  return `
// ═══════════════════════════════════════════════════════════════════════════════
// Injected theme variables (runtime - worker)
// ═══════════════════════════════════════════════════════════════════════════════

// Brand Colors
$foundation-palette: (
  "primary": ${palette.primary},
  "secondary": ${palette.secondary},
  "success": ${palette.success},
  "warning": ${palette.warning},
  "alert": ${palette.alert},
);

// Gray Scale & Body Colors
$white: ${globalColors.white};
$light-gray: ${globalColors.lightGray};
$medium-gray: ${globalColors.mediumGray};
$dark-gray: ${globalColors.darkGray};
$black: ${globalColors.black};
$body-background: ${globalColors.bodyBackground};
$body-font-color: ${globalColors.bodyFontColor};

// Typography
$global-font-size: ${typography.globalFontSize};
$global-lineheight: ${typography.globalLineHeight};
$global-weight-normal: ${typography.globalWeightNormal};
$global-weight-bold: ${typography.globalWeightBold};
$body-font-family: ${typography.bodyFontFamily};
$header-font-family: ${typography.headerFontFamily};
$header-lineheight: ${typography.headerLineHeight};

// Spacing
$global-margin: ${spacing.globalMargin};
$global-padding: ${spacing.globalPadding};
$global-radius: ${spacing.globalRadius};
$global-menu-padding: ${spacing.globalMenuPadding.vertical} ${spacing.globalMenuPadding.horizontal};

// Layout
$global-text-direction: ${layout.globalTextDirection};
$global-width: ${layout.globalWidth};
$global-flexbox: ${layout.globalFlexbox};

// Accordion
$accordion-background: ${accordion.background};
$accordion-plusminus: ${accordion.plusminus};
$accordion-plus-content: '${accordion.plusContent}';
$accordion-minus-content: '${accordion.minusContent}';
$accordion-title-font-size: ${accordion.titleFontSize};
$accordion-item-color: ${resolveLinkedColor(accordion.itemColor, palette)};
$accordion-item-background-hover: ${resolveLinkedColor(accordion.itemBackgroundHover, palette)};
$accordion-item-padding: ${accordion.itemPadding.vertical} ${accordion.itemPadding.horizontal};
$accordion-content-background: ${accordion.contentBackground};
$accordion-content-border: ${accordion.contentBorder};
$accordion-content-color: ${resolveLinkedColor(accordion.contentColor, palette)};
$accordion-content-padding: ${accordion.contentPadding};
$nfs-accordion-slide-speed: ${accordion.slideSpeed};

// Button
$button-fill: ${button.fill};
$button-background: ${resolveLinkedColor(button.background, palette)};
$button-background-hover: ${resolveLinkedColor(button.backgroundHover, palette)};
$button-background-hover-lightness: ${button.backgroundHoverLightness};
$button-color: ${resolveLinkedColor(button.color, palette)};
$button-color-alt: ${resolveLinkedColor(button.colorAlt, palette)};
$button-padding: ${button.padding.vertical} ${button.padding.horizontal};
$button-margin: 0 0 ${button.margin.vertical} 0;
$button-radius: ${button.radius};
$button-border: ${button.border};
$button-hollow-border-width: ${button.hollowBorderWidth};
$button-hollow-hover-lightness: ${button.hollowHoverLightness};
$button-font-family: ${button.fontFamily};
$button-font-weight: ${button.fontWeight};
$button-sizes: (
  tiny: ${button.sizes.tiny},
  small: ${button.sizes.small},
  default: ${button.sizes.default},
  large: ${button.sizes.large},
);
$button-opacity-disabled: ${button.opacityDisabled};
$button-transition: ${button.transition};
$button-responsive-expanded: ${button.responsiveExpanded};

@import 'foundation-sites/scss/util/util';
@import 'foundation-sites/scss/global';
@include add-foundation-colors();
@import '${component}';
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Compilation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compiles a single component with the given theme state.
 */
async function compileComponent(
  component: string,
  themeState: ThemeState,
): Promise<{ css: string; timing: number }> {
  const sass = await loadSass();
  const source = buildScssSource(component, themeState);

  const startTime = performance.now();

  const result = await sass.compileStringAsync(source, {
    importers: [createBundleImporter()],
    functions: createLegacyFunctions(sass),
    silenceDeprecations: ['import', 'global-builtin'],
  });

  const compileTime = Math.round(performance.now() - startTime);
  console.log(`[sass-worker] ${component} compiled in ${compileTime}ms`);

  return { css: result.css, timing: compileTime };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Message Handler
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handles messages from the main thread.
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>): Promise<void> => {
  const request = event.data;

  try {
    if (request.type === 'init') {
      sassSources = request.sassSources ?? null;
      console.log(
        `[sass-worker] Initialized with ${Object.keys(sassSources ?? {}).length} files`,
      );

      // Pre-load Sass module
      await loadSass();

      const response: WorkerResponse = { id: request.id, type: 'ready' };
      self.postMessage(response);
    } else if (request.type === 'compile') {
      const { css, timing } = await compileComponent(
        request.component!,
        request.themeState!,
      );
      const response: WorkerResponse = {
        id: request.id,
        type: 'compiled',
        css,
        timing,
      };
      self.postMessage(response);
    }
  } catch (error) {
    console.error('[sass-worker] Error:', error);
    const response: WorkerResponse = {
      id: request.id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};

console.log('[sass-worker] Worker thread started');
