/**
 * Runtime Theme Injector for Storybook
 *
 * Manages dynamic CSS injection for runtime theming. Compiles Sass in a
 * Web Worker to prevent UI freezing, with caching for instant theme switching.
 *
 * Architecture:
 * - Web Worker: Sass compilation runs off-main-thread (~1.5-2s without blocking UI)
 * - Fallback: Main thread compilation if workers unavailable
 * - Caching: Hash-based cache prevents redundant compilations
 *
 * @example
 * ```typescript
 * import { applyThemeState, isThemeStateApplied } from './runtime-theme-injector';
 * import { getDefaultThemeState } from './theme-defaults';
 *
 * // Apply a custom theme state
 * const themeState = {
 *   ...getDefaultThemeState(),
 *   palette: { ...getDefaultThemeState().palette, primary: '#ff6600' },
 * };
 * await applyThemeState(themeState);
 *
 * // Check if a theme state is applied
 * if (isThemeStateApplied(themeState)) {
 *   console.log('Custom theme is active');
 * }
 * ```
 */

import { compileComponentsSelectively, preloadWorker } from './sass-compiler';
import { getDefaultThemeState } from './theme-defaults';
import type { ThemeState } from '../../.storybook/addons/theme-panel/types';
import {
  AVAILABLE_COMPONENTS,
  type AvailableComponent,
} from './generated/sass-bundle';
import {
  hashComponentState,
  getAffectedComponents,
} from './component-dependencies';
import { LruCache } from './lru-cache';
import {
  getPersistedCSS,
  setPersistedCSS,
  createCacheKey,
} from './theme-cache-db';

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ID of the style element used for runtime theme CSS.
 */
const STYLE_ELEMENT_ID = 'nfs-runtime-theme';

/**
 * ID prefix for NfsStyleLoader's dynamic stylesheets.
 * These need to be disabled when runtime theming is active.
 */
const NFS_STYLE_PREFIX = 'nfs-style';

// ═══════════════════════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Per-component CSS cache with LRU eviction.
 * Key: "component:{...relevantState}" - only component's dependencies
 * Value: Compiled CSS for that single component
 * Max 50 entries (~2.5MB) - enough for typical theme exploration
 */
const componentCache = new LruCache<string, string>(50);

/**
 * Combined CSS cache with LRU eviction.
 * Key: Full theme state hash (JSON.stringify)
 * Value: All components CSS concatenated
 * Max 10 entries (~500KB) - fewer full-state variations explored
 */
const combinedCache = new LruCache<string, string>(10);

/**
 * Last applied theme state for change detection.
 * Used to determine which components need recompilation.
 */
let lastAppliedState: ThemeState | null = null;

/**
 * Currently applied theme state hash.
 */
let currentThemeStateHash: string | null = null;

/**
 * Promise tracking in-flight compilation (prevents duplicate compilations).
 */
let compilationPromise: Promise<string> | null = null;

/**
 * Theme state hash being compiled.
 */
let compilingThemeStateHash: string | null = null;

/**
 * Promise that resolves when the initial theme is ready.
 * Used by Storybook loaders to ensure CSS is in place before story rendering.
 */
let initialThemeReadyResolve: (() => void) | null = null;
const initialThemeReadyPromise = new Promise<void>((resolve) => {
  initialThemeReadyResolve = resolve;
});

/**
 * Whether the initial theme has been applied.
 */
let initialThemeApplied = false;

// ═══════════════════════════════════════════════════════════════════════════════
// Coalescing State (Part 4 optimization)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pending theme state during coalescing.
 * When a new request arrives during compilation, we buffer it here
 * instead of starting another parallel compilation.
 */
let pendingCoalescedState: {
  themeState: ThemeState;
  options?: ApplyThemeOptions;
} | null = null;

/**
 * Whether a coalesced apply loop is currently running.
 */
let isApplyLoopRunning = false;

/**
 * Statistics for coalescing (visible in console for debugging).
 */
let coalescingStats = {
  coalesced: 0,
  applied: 0,
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOM Management
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MutationObserver to disable dynamically-added NFS stylesheets.
 * Components load their CSS on-demand via NfsStyleLoader, which happens
 * AFTER the runtime theme is applied. Without this observer, the precompiled
 * CSS would override our runtime-compiled theme.
 */
let styleObserver: MutationObserver | null = null;

/**
 * Gets or creates the style element for runtime theme CSS.
 */
function getStyleElement(): HTMLStyleElement {
  let styleEl = document.getElementById(
    STYLE_ELEMENT_ID,
  ) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    // Insert at end of head to override other styles
    document.head.appendChild(styleEl);
  }

  return styleEl;
}

/**
 * Disables NfsStyleLoader's dynamic stylesheets.
 * When runtime theming is active, we need to disable the pre-compiled styles
 * to avoid conflicts.
 */
function disablePrecompiledStyles(): void {
  document
    .querySelectorAll<HTMLLinkElement>(`link[id^="${NFS_STYLE_PREFIX}"]`)
    .forEach((link) => {
      link.disabled = true;
    });
}

/**
 * Starts watching for dynamically-added NFS stylesheets and disables them.
 * This handles components that load their CSS after the runtime theme is applied.
 */
function startStyleObserver(): void {
  if (styleObserver) return; // Already watching

  styleObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // NodeList needs Array.from() for TypeScript iteration
      for (const node of Array.from(mutation.addedNodes)) {
        if (
          node instanceof HTMLLinkElement &&
          node.id?.startsWith(NFS_STYLE_PREFIX)
        ) {
          node.disabled = true;
          console.log(`[nfs-theme] Disabled dynamic stylesheet: ${node.id}`);
        }
      }
    }
  });

  styleObserver.observe(document.head, { childList: true });
}

/**
 * Stops watching for dynamically-added stylesheets.
 */
function stopStyleObserver(): void {
  if (styleObserver) {
    styleObserver.disconnect();
    styleObserver = null;
  }
}

/**
 * Re-enables NfsStyleLoader's dynamic stylesheets.
 * Called when runtime theming is disabled.
 */
function enablePrecompiledStyles(): void {
  document
    .querySelectorAll<HTMLLinkElement>(`link[id^="${NFS_STYLE_PREFIX}"]`)
    .forEach((link) => {
      link.disabled = false;
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Theme State Compilation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generates a hash for a theme state for caching purposes.
 */
function hashThemeState(themeState: ThemeState): string {
  return JSON.stringify(themeState);
}

/**
 * Compiles a theme state with per-component caching.
 *
 * Optimization layers (checked in order):
 * 1. In-memory combined cache (fastest, lost on refresh)
 * 2. IndexedDB combined cache (fast, persists across sessions)
 * 3. In-memory component cache (avoids recompiling unchanged components)
 * 4. IndexedDB component cache (persists component CSS across sessions)
 * 5. Full compilation (slowest, only for cache misses)
 *
 * @param themeState - Complete theme state to compile
 * @returns Promise resolving to compiled CSS
 */
async function compileThemeState(themeState: ThemeState): Promise<string> {
  const fullHash = hashThemeState(themeState);
  const combinedKey = createCacheKey(`combined:${fullHash}`);

  // Fast path 1: in-memory combined cache hit
  const cachedCombined = combinedCache.get(fullHash);
  if (cachedCombined) {
    return cachedCombined;
  }

  // Fast path 2: IndexedDB combined cache hit
  const persistedCombined = await getPersistedCSS(combinedKey);
  if (persistedCombined) {
    console.log('[nfs-theme] IndexedDB cache hit (combined)');
    // Promote to memory cache
    combinedCache.set(fullHash, persistedCombined);
    lastAppliedState = structuredClone(themeState);
    return persistedCombined;
  }

  // If already compiling this theme state, return the existing promise
  if (compilingThemeStateHash === fullHash && compilationPromise) {
    return compilationPromise;
  }

  compilingThemeStateHash = fullHash;

  compilationPromise = (async () => {
    // Determine which components need recompilation
    const affectedComponents = getAffectedComponents(
      lastAppliedState,
      themeState,
    );

    // Collect CSS from cache or mark for compilation
    const componentCss = new Map<AvailableComponent, string>();
    const toCompile: AvailableComponent[] = [];

    for (const component of AVAILABLE_COMPONENTS) {
      const componentHash = hashComponentState(themeState, component);
      const componentKey = createCacheKey(`${component}:${componentHash}`);

      // Check in-memory cache first
      let cachedCss = componentCache.get(componentHash);

      // Check IndexedDB if not in memory and component unchanged
      if (!cachedCss && !affectedComponents.has(component)) {
        const persistedCss = await getPersistedCSS(componentKey);
        if (persistedCss) {
          console.log(`[nfs-theme] IndexedDB cache hit (${component})`);
          cachedCss = persistedCss;
          // Promote to memory cache
          componentCache.set(componentHash, persistedCss);
        }
      }

      if (cachedCss && !affectedComponents.has(component)) {
        // Use cached CSS for unchanged components
        componentCss.set(component, cachedCss);
      } else {
        // Need to compile this component
        toCompile.push(component);
      }
    }

    // Log selective compilation info
    const cachedCount = AVAILABLE_COMPONENTS.length - toCompile.length;
    if (toCompile.length > 0) {
      console.log(
        `[nfs-theme] Selective compile: ${toCompile.join(', ')} (${cachedCount}/${AVAILABLE_COMPONENTS.length} cached)`,
      );
    }

    // Compile only affected components
    if (toCompile.length > 0) {
      const freshCss = await compileComponentsSelectively(
        toCompile,
        themeState,
      );

      // Update per-component cache and persist to IndexedDB
      for (const [component, css] of freshCss) {
        const componentHash = hashComponentState(themeState, component);
        const componentKey = createCacheKey(`${component}:${componentHash}`);

        componentCache.set(componentHash, css);
        componentCss.set(component, css);

        // Persist to IndexedDB (fire-and-forget)
        setPersistedCSS(componentKey, css);
      }
    }

    // Combine CSS in consistent order
    const combined = AVAILABLE_COMPONENTS.map((c) => componentCss.get(c)).join(
      '\n',
    );

    // Cache the combined result (memory + IndexedDB)
    combinedCache.set(fullHash, combined);
    setPersistedCSS(combinedKey, combined); // fire-and-forget

    // Update last applied state for next comparison
    lastAppliedState = structuredClone(themeState);

    compilingThemeStateHash = null;
    compilationPromise = null;

    return combined;
  })();

  return compilationPromise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Theme Application
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Options for theme application.
 */
export interface ApplyThemeOptions {
  /** Called when compilation starts (not called if cached) */
  onCompileStart?: () => void;
  /** Called when compilation ends (not called if cached) */
  onCompileEnd?: () => void;
}

/**
 * Internal implementation of theme application (non-coalesced).
 * Called by the coalescing wrapper.
 */
async function applyThemeStateInternal(
  themeState: ThemeState,
  options?: ApplyThemeOptions,
): Promise<void> {
  const hash = hashThemeState(themeState);

  // Skip if already applied
  if (currentThemeStateHash === hash) {
    return;
  }

  console.log('[nfs-theme] Applying theme state...');
  const startTime = performance.now();

  // Check if we need to compile (not in combined cache)
  const isCached = combinedCache.has(hash);

  // Notify compilation start if not cached
  if (!isCached) {
    options?.onCompileStart?.();
  }

  // Compile theme state (uses per-component caching)
  const css = await compileThemeState(themeState);

  // Notify compilation end if we compiled
  if (!isCached) {
    options?.onCompileEnd?.();
  }

  // Inject CSS
  const styleEl = getStyleElement();
  styleEl.textContent = css;

  // Disable pre-compiled styles to avoid conflicts
  disablePrecompiledStyles();

  // Start watching for dynamically-loaded stylesheets (from NfsStyleLoader)
  startStyleObserver();

  currentThemeStateHash = hash;
  coalescingStats.applied++;

  // Signal that initial theme is ready (for Storybook loaders)
  if (!initialThemeApplied) {
    initialThemeApplied = true;
    initialThemeReadyResolve?.();
  }

  const totalTime = Math.round(performance.now() - startTime);
  const cached = isCached ? ' (cached)' : '';
  console.log(`[nfs-theme] Theme state applied in ${totalTime}ms${cached}`);
}

/**
 * Applies a complete theme state with compilation coalescing.
 *
 * **Coalescing behavior:** When multiple theme state changes arrive rapidly
 * (e.g., during slider drag), this function buffers them and only compiles
 * the latest state. This prevents redundant compilations:
 *
 * ```
 * Without coalescing: 10→15→20→25 = 4 compilations
 * With coalescing:    10→15→20→25 = 2 compilations (first + final)
 * ```
 *
 * @param themeState - Complete theme state with palette and component variables
 * @param options - Optional callbacks for compilation status
 * @returns Promise that resolves when this theme state is applied OR coalesced
 *
 * @example
 * ```typescript
 * import { applyThemeState } from './runtime-theme-injector';
 * import { getDefaultThemeState } from './theme-defaults';
 *
 * // Apply custom theme with status callbacks
 * await applyThemeState(
 *   { ...getDefaultThemeState(), palette: { ...getDefaultThemeState().palette, primary: '#ff6600' } },
 *   { onCompileStart: () => console.log('Compiling...'), onCompileEnd: () => console.log('Done!') }
 * );
 * ```
 */
export async function applyThemeState(
  themeState: ThemeState,
  options?: ApplyThemeOptions,
): Promise<void> {
  // Always update the pending state (latest wins)
  pendingCoalescedState = { themeState, options };

  // If a compilation loop is already running, our state was coalesced
  if (isApplyLoopRunning) {
    coalescingStats.coalesced++;
    console.log(
      `[nfs-theme] Coalesced (${coalescingStats.coalesced} skipped, ${coalescingStats.applied} applied)`,
    );
    return;
  }

  // Start the apply loop
  isApplyLoopRunning = true;

  try {
    // Process pending states until none remain
    while (pendingCoalescedState !== null) {
      const { themeState: stateToApply, options: optsToApply } =
        pendingCoalescedState;

      // Clear before compile - new requests during compile will set it again
      pendingCoalescedState = null;

      await applyThemeStateInternal(stateToApply, optsToApply);
    }
  } finally {
    isApplyLoopRunning = false;
  }
}

/**
 * Removes runtime theme and re-enables pre-compiled styles.
 */
export function removeTheme(): void {
  const styleEl = document.getElementById(STYLE_ELEMENT_ID);
  if (styleEl) {
    styleEl.textContent = '';
  }

  // Stop watching for new stylesheets
  stopStyleObserver();

  enablePrecompiledStyles();
  currentThemeStateHash = null;

  console.log('[nfs-theme] Theme removed, using pre-compiled styles');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Cache Management
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Clears the compiled CSS cache.
 * Useful for development when Sass sources change.
 */
export function clearThemeCache(): void {
  componentCache.clear();
  combinedCache.clear();
  lastAppliedState = null;
  coalescingStats = { coalesced: 0, applied: 0 };
  console.log('[nfs-theme] Cache cleared');
}

/**
 * Gets coalescing statistics for debugging/monitoring.
 * @returns Object with coalesced and applied counts
 */
export function getCoalescingStats(): { coalesced: number; applied: number } {
  return { ...coalescingStats };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Query Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Checks if a specific theme state is currently applied.
 * @param themeState - Theme state to check
 * @returns True if the theme state is currently applied
 */
export function isThemeStateApplied(themeState: ThemeState): boolean {
  return currentThemeStateHash === hashThemeState(themeState);
}

/**
 * Gets the current theme state hash.
 * @returns Current theme state hash or null if no theme is applied
 */
export function getCurrentThemeStateHash(): string | null {
  return currentThemeStateHash;
}

/**
 * Waits for the initial theme to be applied.
 * Used by Storybook loaders to ensure CSS is compiled and injected
 * before story rendering and a11y tests run.
 *
 * @returns Promise that resolves when initial theme CSS is ready
 */
export function waitForInitialTheme(): Promise<void> {
  return initialThemeReadyPromise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initializes the runtime theming system.
 * Call this early in the application lifecycle to preload the worker and Sass.
 *
 * This function:
 * 1. Creates the Web Worker and loads Dart Sass
 * 2. Pre-compiles the default theme (fire-and-forget) to warm the cache
 *
 * The pre-compilation ensures the first theme panel interaction is instant
 * by caching the default theme state during initialization.
 *
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeRuntimeTheming(): Promise<void> {
  console.log('[nfs-theme] Initializing runtime theming (Web Worker)...');

  // Start watching for dynamically-loaded stylesheets FIRST
  // This must happen before any components render and load their CSS
  startStyleObserver();

  // Preload Web Worker and Sass compiler
  await preloadWorker();

  console.log('[nfs-theme] Ready (Web Worker initialized)');

  // Apply default theme immediately (not just compile)
  // This ensures the theme CSS is in place for a11y tests via waitForInitialTheme()
  const defaultTheme = getDefaultThemeState();
  try {
    await applyThemeState(defaultTheme);
    console.log('[nfs-theme] Default theme applied');
  } catch (err) {
    // Non-fatal: system still works, decorator will apply theme
    console.warn('[nfs-theme] Default theme application failed:', err);
    // Resolve the promise anyway so tests don't hang
    if (!initialThemeApplied) {
      initialThemeApplied = true;
      initialThemeReadyResolve?.();
    }
  }
}
