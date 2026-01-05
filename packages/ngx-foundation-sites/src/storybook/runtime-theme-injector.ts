/**
 * Runtime Theme Injector for Storybook
 *
 * Manages dynamic CSS injection for runtime theming. Compiles Sass on-demand
 * and caches results for instant theme switching after first compilation.
 *
 * @example
 * ```typescript
 * import { applyTheme, isThemeApplied, clearThemeCache } from './runtime-theme-injector';
 *
 * // Apply a theme (compiles if not cached)
 * await applyTheme('ocean');
 *
 * // Check if a theme is ready
 * if (isThemeApplied('ocean')) {
 *   console.log('Ocean theme is active');
 * }
 * ```
 */

import { compileComponents, preloadSass } from './browser-sass-compiler';
import { THEME_PRESETS, DEFAULT_THEME, type ThemeName } from './theme-presets';
import { AVAILABLE_COMPONENTS } from './generated/sass-bundle';

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
 * Cache of compiled CSS by theme name.
 */
const compiledCache = new Map<ThemeName, string>();

/**
 * Currently applied theme name (null if no theme applied).
 */
let currentTheme: ThemeName | null = null;

/**
 * Promise tracking in-flight compilation (prevents duplicate compilations).
 */
let compilationPromise: Promise<string> | null = null;

/**
 * Theme being compiled (to prevent duplicate compilations).
 */
let compilingTheme: ThemeName | null = null;

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
// Theme Application
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compiles a theme if not already cached.
 *
 * @param themeName - Theme to compile
 * @returns Promise resolving to compiled CSS
 */
async function compileTheme(themeName: ThemeName): Promise<string> {
  // Return cached if available
  const cached = compiledCache.get(themeName);
  if (cached) {
    return cached;
  }

  // If already compiling this theme, return the existing promise
  if (compilingTheme === themeName && compilationPromise) {
    return compilationPromise;
  }

  // Start new compilation
  compilingTheme = themeName;
  const palette = THEME_PRESETS[themeName];

  compilationPromise = compileComponents(
    [...AVAILABLE_COMPONENTS],
    palette,
  ).then((css) => {
    compiledCache.set(themeName, css);
    compilingTheme = null;
    compilationPromise = null;
    return css;
  });

  return compilationPromise;
}

/**
 * Applies a theme by compiling (if needed) and injecting CSS.
 *
 * First-time compilation takes ~200-500ms. Subsequent applications
 * of the same theme are instant due to caching.
 *
 * @param themeName - Theme to apply
 * @returns Promise that resolves when theme is applied
 *
 * @example
 * ```typescript
 * // Apply ocean theme
 * await applyTheme('ocean');
 *
 * // Theme is now visible
 * ```
 */
export async function applyTheme(themeName: ThemeName): Promise<void> {
  // Skip if already applied
  if (currentTheme === themeName) {
    return;
  }

  console.log(`[nfs-theme] Applying theme: ${themeName}`);
  const startTime = performance.now();

  // Compile theme (uses cache if available)
  const css = await compileTheme(themeName);

  // Inject CSS
  const styleEl = getStyleElement();
  styleEl.textContent = css;

  // Disable pre-compiled styles to avoid conflicts
  disablePrecompiledStyles();

  currentTheme = themeName;

  const totalTime = Math.round(performance.now() - startTime);
  const cached = compiledCache.has(themeName) ? ' (cached)' : '';
  console.log(`[nfs-theme] Theme applied in ${totalTime}ms${cached}`);
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
  currentTheme = null;

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
  compiledCache.clear();
  console.log('[nfs-theme] Cache cleared');
}

/**
 * Pre-compiles all themes to warm the cache.
 * Call this during idle time for instant theme switching.
 *
 * @returns Promise that resolves when all themes are compiled
 */
export async function precompileAllThemes(): Promise<void> {
  console.log('[nfs-theme] Pre-compiling all themes...');
  const startTime = performance.now();

  // Compile all themes in parallel
  await Promise.all(
    Object.keys(THEME_PRESETS).map((name) => compileTheme(name as ThemeName)),
  );

  const totalTime = Math.round(performance.now() - startTime);
  console.log(`[nfs-theme] All themes compiled in ${totalTime}ms`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Query Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gets the currently applied theme name.
 * @returns Current theme name or null if no theme is applied
 */
export function getCurrentTheme(): ThemeName | null {
  return currentTheme;
}

/**
 * Checks if a specific theme is currently applied.
 * @param themeName - Theme to check
 * @returns True if the theme is currently applied
 */
export function isThemeApplied(themeName: ThemeName): boolean {
  return currentTheme === themeName;
}

/**
 * Checks if a theme has been compiled and cached.
 * @param themeName - Theme to check
 * @returns True if the theme is in the cache
 */
export function isThemeCached(themeName: ThemeName): boolean {
  return compiledCache.has(themeName);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initializes the runtime theming system.
 * Call this early in the application lifecycle to preload Sass.
 *
 * @param precompile - If true, pre-compiles all themes for instant switching
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeRuntimeTheming(
  precompile = false,
): Promise<void> {
  console.log('[nfs-theme] Initializing runtime theming...');

  // Preload Sass compiler
  await preloadSass();

  // Optionally pre-compile all themes
  if (precompile) {
    await precompileAllThemes();
  }

  console.log('[nfs-theme] Ready');
}

// Re-export for convenience
export { DEFAULT_THEME, THEME_PRESETS, type ThemeName };
