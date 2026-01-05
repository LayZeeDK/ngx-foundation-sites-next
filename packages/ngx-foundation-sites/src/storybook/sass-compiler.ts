/**
 * Sass Compiler with Web Worker Support
 *
 * Provides off-main-thread Sass compilation using a Web Worker. This prevents
 * UI freezes during the ~1.5-2 second compilation time when changing themes.
 *
 * Architecture:
 * 1. Main thread creates worker via webpack's native worker URL syntax
 * 2. Main thread sends SASS_SOURCES to worker on init
 * 3. Worker loads Dart Sass from JSPM CDN
 * 4. Compilation requests/responses use postMessage
 *
 * @example
 * ```typescript
 * import { compileWithWorker, preloadWorker } from './sass-compiler';
 *
 * // Pre-initialize for faster first compilation
 * await preloadWorker();
 *
 * // Compile all components with a theme state
 * const css = await compileWithWorker(themeState);
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
// Worker Manager (runs on main thread)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Manages the Sass worker lifecycle and communication.
 */
class SassCompiler {
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
    console.log('[sass-compiler] Creating worker...');

    // Create worker using webpack's native worker URL syntax
    // This bundles the worker separately and handles all the complexity
    this.#worker = new Worker(
      new URL('./sass-compiler.worker.ts', import.meta.url),
      { type: 'module' },
    );

    // Set up message handler
    this.#worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;
      const pending = this.#pending.get(response.id);

      if (!pending) {
        // Init response
        if (response.type === 'ready') {
          this.#ready = true;
          console.log('[sass-compiler] Worker ready');
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
      console.error('[sass-compiler] Worker error:', event);
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

let compiler: SassCompiler | null = null;

/**
 * Get the singleton Sass compiler.
 * Lazily creates the worker on first call.
 */
async function getCompiler(): Promise<SassCompiler> {
  if (!compiler) {
    compiler = new SassCompiler();
    await compiler.init();
  }
  return compiler;
}

/**
 * Compile components using the worker.
 * This is the main entry point for off-main-thread compilation.
 */
export async function compileWithWorker(
  themeState: ThemeState,
): Promise<string> {
  const instance = await getCompiler();
  return instance.compileAll(themeState);
}

/**
 * Pre-initialize the worker for faster first compilation.
 */
export async function preloadWorker(): Promise<void> {
  await getCompiler();
}
