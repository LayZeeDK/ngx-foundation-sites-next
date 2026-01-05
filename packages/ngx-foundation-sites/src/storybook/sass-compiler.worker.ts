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

interface ThemeState {
  palette: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    alert: string;
  };
  accordion: {
    background: string;
    plusminus: boolean;
    titleFontSize: string;
    itemPadding: { vertical: string; horizontal: string };
    slideSpeed: string;
  };
  button: {
    padding: { vertical: string; horizontal: string };
    radius: string;
    fontSize: string;
  };
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

const SASS_CDN_URL = 'https://jspm.dev/sass';
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
 * Loads Dart Sass from JSPM CDN.
 *
 * Load priority:
 * 1. In-memory cache (sassModule) - instant
 * 2. Browser HTTP cache - fast (~50ms)
 * 3. CDN fetch - ~200-300ms
 *
 * Note: We rely on browser HTTP caching rather than IndexedDB because ES modules
 * from CDNs like JSPM have internal imports that can't be resolved from blob URLs.
 * The browser's HTTP cache provides excellent caching for CDN resources.
 */
async function loadSass(): Promise<SassModule> {
  if (sassModule) return sassModule;

  console.log('[sass-worker] Loading Dart Sass from CDN...');
  const startTime = performance.now();

  // Dynamic import in worker context - browser HTTP cache handles caching
  const module = await import(/* webpackIgnore: true */ SASS_CDN_URL);

  const loadTime = Math.round(performance.now() - startTime);
  console.log(`[sass-worker] Sass loaded in ${loadTime}ms`);

  // Handle different module structures (ESM vs CommonJS default export)
  if (typeof module.compileStringAsync === 'function') {
    sassModule = module as SassModule;
  } else if (
    module.default &&
    typeof module.default.compileStringAsync === 'function'
  ) {
    sassModule = module.default as SassModule;
  } else {
    throw new Error('Sass module structure not recognized');
  }

  return sassModule;
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
  const { palette, accordion, button } = themeState;

  return `
// Injected theme variables (runtime - worker)
$foundation-palette: (
  "primary": ${palette.primary},
  "secondary": ${palette.secondary},
  "success": ${palette.success},
  "warning": ${palette.warning},
  "alert": ${palette.alert},
);

$accordion-background: ${accordion.background};
$accordion-plusminus: ${accordion.plusminus};
$accordion-title-font-size: ${accordion.titleFontSize};
$accordion-item-padding: ${accordion.itemPadding.vertical} ${accordion.itemPadding.horizontal};
$nfs-accordion-slide-speed: ${accordion.slideSpeed};

$button-padding: ${button.padding.vertical} ${button.padding.horizontal};
$button-radius: ${button.radius};
$button-font-size: ${button.fontSize};

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
