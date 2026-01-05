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

// ═══════════════════════════════════════════════════════════════════════════════
// DOM Management
// ═══════════════════════════════════════════════════════════════════════════════

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
 * Optimization: Only recompiles components whose relevant variables changed.
 * - Palette changes: recompile all (global colors affect everything)
 * - Component-specific changes: only recompile that component
 *
 * @param themeState - Complete theme state to compile
 * @returns Promise resolving to compiled CSS
 */
async function compileThemeState(themeState: ThemeState): Promise<string> {
  const fullHash = hashThemeState(themeState);

  // Fast path: combined cache hit
  const cachedCombined = combinedCache.get(fullHash);
  if (cachedCombined) {
    return cachedCombined;
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
      const cachedCss = componentCache.get(componentHash);

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

      // Update per-component cache and merge results
      for (const [component, css] of freshCss) {
        const componentHash = hashComponentState(themeState, component);
        componentCache.set(componentHash, css);
        componentCss.set(component, css);
      }
    }

    // Combine CSS in consistent order
    const combined = AVAILABLE_COMPONENTS.map((c) => componentCss.get(c)).join(
      '\n',
    );

    // Cache the combined result
    combinedCache.set(fullHash, combined);

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
 * Applies a complete theme state by compiling (if needed) and injecting CSS.
 *
 * Provides fine-grained control over all Foundation variables via the
 * Theme addon panel in Storybook.
 *
 * @param themeState - Complete theme state with palette and component variables
 * @param options - Optional callbacks for compilation status
 * @returns Promise that resolves when theme is applied
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

  currentThemeStateHash = hash;

  const totalTime = Math.round(performance.now() - startTime);
  const cached = isCached ? ' (cached)' : '';
  console.log(`[nfs-theme] Theme state applied in ${totalTime}ms${cached}`);
}

/**
 * Removes runtime theme and re-enables pre-compiled styles.
 */
export function removeTheme(): void {
  const styleEl = document.getElementById(STYLE_ELEMENT_ID);
  if (styleEl) {
    styleEl.textContent = '';
  }

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
  console.log('[nfs-theme] Cache cleared');
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

  // Preload Web Worker and Sass compiler
  await preloadWorker();

  console.log('[nfs-theme] Ready (Web Worker initialized)');

  // Pre-compile default theme (fire-and-forget) to warm the cache
  // This ensures the first theme panel interaction is instant
  const defaultTheme = getDefaultThemeState();
  compileThemeState(defaultTheme)
    .then(() => {
      console.log('[nfs-theme] Default theme pre-compiled and cached');
    })
    .catch((err) => {
      // Non-fatal: system still works, just has cold-start delay
      console.warn('[nfs-theme] Default theme pre-compilation failed:', err);
    });
}
