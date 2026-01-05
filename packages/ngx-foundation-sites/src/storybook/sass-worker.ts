/**
 * Sass Web Worker for Off-Main-Thread Compilation
 *
 * This module creates a Web Worker that runs Sass compilation in a separate
 * thread, preventing UI freezes during the ~1.5-2 second compilation time.
 *
 * Architecture:
 * 1. Main thread creates worker via Blob URL (inline worker code)
 * 2. Main thread sends SASS_SOURCES to worker on init
 * 3. Worker loads Dart Sass from JSPM CDN
 * 4. Compilation requests/responses use postMessage
 *
 * @example
 * ```typescript
 * import { getSassWorker } from './sass-worker';
 *
 * const worker = await getSassWorker();
 * const css = await worker.compile('accordion', themeState);
 * ```
 */

import { SASS_SOURCES, AVAILABLE_COMPONENTS } from './generated/sass-bundle';
import type { ThemeState } from '../../.storybook/addons/theme-panel/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

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

type PendingRequest = {
  resolve: (css: string) => void;
  reject: (error: Error) => void;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Worker Code (runs in separate thread)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Worker code as a string. This will be converted to a Blob URL.
 * Note: This code runs in an isolated worker context with no access to
 * the main thread's scope.
 */
const WORKER_CODE = `
// Worker-side state
let sassModule = null;
let sassSources = null;

// CDN URL for Dart Sass
const SASS_CDN_URL = 'https://jspm.dev/sass';
const BUNDLE_SCHEME = 'nfs-bundle:';

// Load Sass from CDN
async function loadSass() {
  if (sassModule) return sassModule;

  console.log('[sass-worker] Loading Dart Sass from CDN...');
  const startTime = performance.now();

  // Dynamic import in worker context
  const module = await import(SASS_CDN_URL);

  const loadTime = Math.round(performance.now() - startTime);
  console.log('[sass-worker] Sass loaded in ' + loadTime + 'ms');

  // Handle different module structures
  if (typeof module.compileStringAsync === 'function') {
    sassModule = module;
  } else if (module.default && typeof module.default.compileStringAsync === 'function') {
    sassModule = module.default;
  } else {
    throw new Error('Sass module structure not recognized');
  }

  return sassModule;
}

// Resolve import paths in our bundle
function resolveImportPath(importPath, containingUrl) {
  let cleanPath = importPath;
  if (importPath.startsWith(BUNDLE_SCHEME)) {
    cleanPath = importPath.slice(BUNDLE_SCHEME.length);
  }

  if (sassSources[cleanPath]) {
    return cleanPath;
  }

  if (containingUrl?.protocol === 'nfs-bundle:') {
    const containingPath = containingUrl.pathname;
    const containingDir = containingPath.substring(0, containingPath.lastIndexOf('/') + 1);
    const relativePath = containingDir + cleanPath;

    if (sassSources[relativePath]) {
      return relativePath;
    }
  }

  return null;
}

// Create custom importer for bundled sources
function createBundleImporter() {
  return {
    canonicalize(url, context) {
      if (url.startsWith('sass:')) {
        return null;
      }

      const resolved = resolveImportPath(url, context.containingUrl);
      if (resolved) {
        return new URL(BUNDLE_SCHEME + resolved);
      }

      console.warn('[sass-worker] Import not found: "' + url + '"');
      return null;
    },

    load(url) {
      const path = url.pathname;
      const contents = sassSources[path];

      if (contents) {
        return { contents, syntax: 'scss' };
      }

      console.warn('[sass-worker] Failed to load: "' + path + '"');
      return null;
    },
  };
}

// Create legacy math/color functions for Foundation compatibility
function createLegacyFunctions(sass) {
  const { SassNumber } = sass;

  const createMathFn = (fn) => {
    return (args) => {
      const num = args[0];
      return new SassNumber(fn(num.value), {
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
    'percentage($number)': (args) => {
      const num = args[0];
      return new SassNumber(num.value * 100, '%');
    },
    'red($color)': (args) => new SassNumber(args[0].red),
    'green($color)': (args) => new SassNumber(args[0].green),
    'blue($color)': (args) => new SassNumber(args[0].blue),
    'alpha($color)': (args) => new SassNumber(args[0].alpha),
    'opacity($color)': (args) => new SassNumber(args[0].alpha),
  };
}

// Build SCSS source with theme variables
function buildScssSource(component, themeState) {
  const { palette, accordion, button } = themeState;

  return \`
// Injected theme variables (runtime - worker)
$foundation-palette: (
  "primary": \${palette.primary},
  "secondary": \${palette.secondary},
  "success": \${palette.success},
  "warning": \${palette.warning},
  "alert": \${palette.alert},
);

$accordion-background: \${accordion.background};
$accordion-plusminus: \${accordion.plusminus};
$accordion-title-font-size: \${accordion.titleFontSize};
$accordion-item-padding: \${accordion.itemPadding.vertical} \${accordion.itemPadding.horizontal};
$nfs-accordion-slide-speed: \${accordion.slideSpeed};

$button-padding: \${button.padding.vertical} \${button.padding.horizontal};
$button-radius: \${button.radius};
$button-font-size: \${button.fontSize};

@import 'foundation-sites/scss/util/util';
@import 'foundation-sites/scss/global';
@include add-foundation-colors();
@import '\${component}';
\`;
}

// Compile a component
async function compileComponent(component, themeState) {
  const sass = await loadSass();
  const source = buildScssSource(component, themeState);

  const startTime = performance.now();

  const result = await sass.compileStringAsync(source, {
    importers: [createBundleImporter()],
    functions: createLegacyFunctions(sass),
    silenceDeprecations: ['import', 'global-builtin'],
  });

  const compileTime = Math.round(performance.now() - startTime);
  console.log('[sass-worker] ' + component + ' compiled in ' + compileTime + 'ms');

  return { css: result.css, timing: compileTime };
}

// Handle messages from main thread
self.onmessage = async (event) => {
  const request = event.data;

  try {
    if (request.type === 'init') {
      sassSources = request.sassSources;
      console.log('[sass-worker] Initialized with ' + Object.keys(sassSources).length + ' files');

      // Pre-load Sass
      await loadSass();

      self.postMessage({ id: request.id, type: 'ready' });
    } else if (request.type === 'compile') {
      const { css, timing } = await compileComponent(request.component, request.themeState);
      self.postMessage({ id: request.id, type: 'compiled', css, timing });
    }
  } catch (error) {
    console.error('[sass-worker] Error:', error);
    self.postMessage({ id: request.id, type: 'error', error: error.message });
  }
};

console.log('[sass-worker] Worker started');
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Worker Manager (runs on main thread)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Manages the Sass worker lifecycle and communication.
 */
class SassWorkerManager {
  #worker: Worker | null = null;
  #pending = new Map<number, PendingRequest>();
  #nextId = 1;
  #ready = false;
  #readyPromise: Promise<void> | null = null;

  /**
   * Initialize the worker and send SASS_SOURCES.
   */
  async init(): Promise<void> {
    if (this.#readyPromise) {
      return this.#readyPromise;
    }

    this.#readyPromise = this.#doInit();
    return this.#readyPromise;
  }

  async #doInit(): Promise<void> {
    console.log('[sass-worker] Creating worker...');

    // Create worker from Blob URL
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    this.#worker = new Worker(workerUrl, { type: 'module' });

    // Set up message handler
    this.#worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;
      const pending = this.#pending.get(response.id);

      if (!pending) {
        // Init response
        if (response.type === 'ready') {
          this.#ready = true;
          console.log('[sass-worker] Worker ready');
        }
        return;
      }

      this.#pending.delete(response.id);

      if (response.type === 'error') {
        pending.reject(new Error(response.error));
      } else if (response.type === 'compiled') {
        pending.resolve(response.css!);
      }
    };

    this.#worker.onerror = (event) => {
      console.error('[sass-worker] Worker error:', event);
    };

    // Send SASS_SOURCES to worker
    const initId = this.#nextId++;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker init timeout'));
      }, 30000);

      const originalOnMessage = this.#worker!.onmessage;
      this.#worker!.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id === initId && event.data.type === 'ready') {
          clearTimeout(timeout);
          this.#worker!.onmessage = originalOnMessage;
          this.#ready = true;
          resolve();
        } else {
          originalOnMessage?.call(this.#worker!, event);
        }
      };

      this.#worker!.postMessage({
        id: initId,
        type: 'init',
        sassSources: SASS_SOURCES,
      } as WorkerRequest);
    });

    // Clean up blob URL
    URL.revokeObjectURL(workerUrl);
  }

  /**
   * Compile a component in the worker thread.
   */
  async compile(component: string, themeState: ThemeState): Promise<string> {
    if (!this.#ready) {
      await this.init();
    }

    const id = this.#nextId++;

    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });

      this.#worker!.postMessage({
        id,
        type: 'compile',
        component,
        themeState,
      } as WorkerRequest);
    });
  }

  /**
   * Compile multiple components in parallel.
   */
  async compileAll(themeState: ThemeState): Promise<string> {
    const results = await Promise.all(
      [...AVAILABLE_COMPONENTS].map((component) =>
        this.compile(component, themeState),
      ),
    );
    return results.join('\n');
  }

  /**
   * Terminate the worker.
   */
  terminate(): void {
    if (this.#worker) {
      this.#worker.terminate();
      this.#worker = null;
      this.#ready = false;
      this.#readyPromise = null;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════════════════════

let workerManager: SassWorkerManager | null = null;

/**
 * Get the singleton Sass worker manager.
 * Lazily creates the worker on first call.
 */
export async function getSassWorker(): Promise<SassWorkerManager> {
  if (!workerManager) {
    workerManager = new SassWorkerManager();
    await workerManager.init();
  }
  return workerManager;
}

/**
 * Compile components using the worker.
 * This is the main entry point for off-main-thread compilation.
 */
export async function compileWithWorker(
  themeState: ThemeState,
): Promise<string> {
  const worker = await getSassWorker();
  return worker.compileAll(themeState);
}

/**
 * Pre-initialize the worker for faster first compilation.
 */
export async function preloadWorker(): Promise<void> {
  await getSassWorker();
}
