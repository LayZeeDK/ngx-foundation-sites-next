/**
 * Sass Compiler with Web Worker Pool
 *
 * Provides off-main-thread Sass compilation using a pool of Web Workers.
 * Each component gets its own dedicated worker, enabling true parallel compilation.
 *
 * Architecture:
 * 1. Main thread creates one worker per component via webpack's native worker URL syntax
 * 2. Each worker receives SASS_SOURCES on init and loads Dart Sass from JSPM CDN
 * 3. Compilation requests run in true parallel across all workers
 * 4. Workers are reused across theme changes for efficiency
 *
 * Performance Characteristics:
 * - Single worker (previous): 2 components × 300ms = 600ms sequential
 * - Worker pool (current): 2 components × 300ms = ~300ms parallel
 *
 * Trade-offs:
 * - Memory: N × Sass (~300KB each) instead of 1 × Sass
 * - CDN: Browser caches Sass module, so subsequent loads are fast
 * - Complexity: Pool management vs single worker
 *
 * @example
 * ```typescript
 * import { compileWithWorker, preloadWorker } from './sass-compiler';
 *
 * // Pre-initialize for faster first compilation
 * await preloadWorker();
 *
 * // Compile all components with a theme state (parallel)
 * const css = await compileWithWorker(themeState);
 * ```
 */

import {
  SASS_SOURCES,
  AVAILABLE_COMPONENTS,
  type AvailableComponent,
} from './generated/sass-bundle';
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

interface WorkerInstance {
  worker: Worker;
  component: string;
  pending: Map<number, PendingRequest>;
  nextId: number;
  ready: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Worker Pool Manager (runs on main thread)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Manages a pool of Sass workers for parallel compilation.
 */
class SassWorkerPool {
  #workers = new Map<string, WorkerInstance>();
  #initPromise: Promise<void> | null = null;

  /**
   * Initialize the worker pool with one worker per component.
   */
  async init(): Promise<void> {
    if (this.#initPromise) {
      return this.#initPromise;
    }

    this.#initPromise = this.#doInit();
    return this.#initPromise;
  }

  async #doInit(): Promise<void> {
    const components = [...AVAILABLE_COMPONENTS];
    console.log(
      `[sass-compiler] Creating worker pool (${components.length} workers)...`,
    );
    const startTime = performance.now();

    // Create and initialize all workers in parallel
    const initPromises = components.map((component) =>
      this.#createWorker(component),
    );
    await Promise.all(initPromises);

    const initTime = Math.round(performance.now() - startTime);
    console.log(`[sass-compiler] Worker pool ready in ${initTime}ms`);
  }

  async #createWorker(component: string): Promise<void> {
    // Create worker using webpack's native worker URL syntax
    const worker = new Worker(
      new URL('./sass-compiler.worker.ts', import.meta.url),
      { type: 'module' },
    );

    const instance: WorkerInstance = {
      worker,
      component,
      pending: new Map(),
      nextId: 1,
      ready: false,
    };

    this.#workers.set(component, instance);

    // Set up message handler
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.#handleMessage(instance, event.data);
    };

    worker.onerror = (event) => {
      console.error(`[sass-compiler] Worker error (${component}):`, event);
    };

    // Initialize worker with SASS_SOURCES
    await this.#initWorker(instance);
  }

  async #initWorker(instance: WorkerInstance): Promise<void> {
    const initId = instance.nextId++;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Worker init timeout (${instance.component})`));
      }, 30000);

      // Temporarily override handler for init response
      const originalHandler = instance.worker.onmessage;
      instance.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id === initId && event.data.type === 'ready') {
          clearTimeout(timeout);
          instance.worker.onmessage = originalHandler;
          instance.ready = true;
          resolve();
        } else if (originalHandler) {
          originalHandler.call(instance.worker, event);
        }
      };

      instance.worker.postMessage({
        id: initId,
        type: 'init',
        sassSources: SASS_SOURCES,
      } as WorkerRequest);
    });
  }

  #handleMessage(instance: WorkerInstance, response: WorkerResponse): void {
    const pending = instance.pending.get(response.id);
    if (!pending) {
      return;
    }

    instance.pending.delete(response.id);

    if (response.type === 'error') {
      pending.reject(new Error(response.error));
    } else if (response.type === 'compiled') {
      pending.resolve(response.css!);
    }
  }

  /**
   * Compile a component using its dedicated worker.
   */
  async compile(component: string, themeState: ThemeState): Promise<string> {
    // Ensure pool is initialized
    if (!this.#initPromise) {
      await this.init();
    } else {
      await this.#initPromise;
    }

    const instance = this.#workers.get(component);
    if (!instance) {
      throw new Error(`No worker for component: ${component}`);
    }

    const id = instance.nextId++;

    return new Promise((resolve, reject) => {
      instance.pending.set(id, { resolve, reject });

      instance.worker.postMessage({
        id,
        type: 'compile',
        component,
        themeState,
      } as WorkerRequest);
    });
  }

  /**
   * Compile all components in TRUE parallel (each in its own worker).
   */
  async compileAll(themeState: ThemeState): Promise<string> {
    // Ensure pool is initialized
    if (!this.#initPromise) {
      await this.init();
    } else {
      await this.#initPromise;
    }

    const components = [...AVAILABLE_COMPONENTS];
    const startTime = performance.now();

    // True parallel compilation - each component runs in its own worker
    const results = await Promise.all(
      components.map((component) => this.compile(component, themeState)),
    );

    const compileTime = Math.round(performance.now() - startTime);
    console.log(
      `[sass-compiler] All components compiled in ${compileTime}ms (parallel)`,
    );

    return results.join('\n');
  }

  /**
   * Compile specific components in parallel.
   * Used for selective recompilation when only some components are affected.
   *
   * @param components - Components to compile
   * @param themeState - Theme state for compilation
   * @returns Map of component name to compiled CSS
   */
  async compileComponents(
    components: AvailableComponent[],
    themeState: ThemeState,
  ): Promise<Map<AvailableComponent, string>> {
    // Ensure pool is initialized
    if (!this.#initPromise) {
      await this.init();
    } else {
      await this.#initPromise;
    }

    const startTime = performance.now();

    // Parallel compilation of only the specified components
    const results = await Promise.all(
      components.map(async (component) => ({
        component,
        css: await this.compile(component, themeState),
      })),
    );

    const compileTime = Math.round(performance.now() - startTime);
    console.log(
      `[sass-compiler] ${components.length} component(s) compiled in ${compileTime}ms (selective)`,
    );

    // Convert to Map
    return new Map(results.map((r) => [r.component, r.css]));
  }

  /**
   * Terminate all workers in the pool.
   */
  terminate(): void {
    for (const instance of this.#workers.values()) {
      instance.worker.terminate();
    }
    this.#workers.clear();
    this.#initPromise = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton Export
// ═══════════════════════════════════════════════════════════════════════════════

let pool: SassWorkerPool | null = null;

/**
 * Get the singleton Sass worker pool.
 * Lazily creates workers on first call.
 */
async function getPool(): Promise<SassWorkerPool> {
  if (!pool) {
    pool = new SassWorkerPool();
    await pool.init();
  }
  return pool;
}

/**
 * Compile components using the worker pool.
 * This is the main entry point for off-main-thread parallel compilation.
 */
export async function compileWithWorker(
  themeState: ThemeState,
): Promise<string> {
  const instance = await getPool();
  return instance.compileAll(themeState);
}

/**
 * Pre-initialize the worker pool for faster first compilation.
 */
export async function preloadWorker(): Promise<void> {
  await getPool();
}

/**
 * Compile specific components selectively.
 * Used for per-component caching - only recompiles affected components.
 *
 * @param components - Components to compile
 * @param themeState - Theme state for compilation
 * @returns Map of component name to compiled CSS
 */
export async function compileComponentsSelectively(
  components: AvailableComponent[],
  themeState: ThemeState,
): Promise<Map<AvailableComponent, string>> {
  const instance = await getPool();
  return instance.compileComponents(components, themeState);
}
