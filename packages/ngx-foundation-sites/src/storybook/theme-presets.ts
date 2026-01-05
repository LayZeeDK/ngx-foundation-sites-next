/**
 * Foundation Theme Presets for Runtime Theming
 *
 * Predefined color palettes that can be selected from the Storybook toolbar.
 * Each preset provides a complete `$foundation-palette` configuration.
 *
 * @example
 * ```typescript
 * import { THEME_PRESETS, DEFAULT_THEME } from './theme-presets';
 *
 * const oceanPalette = THEME_PRESETS['ocean'];
 * const defaultPalette = THEME_PRESETS[DEFAULT_THEME];
 * ```
 */

import type { FoundationPalette } from './browser-sass-compiler';

// ═══════════════════════════════════════════════════════════════════════════════
// Theme Presets
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Available theme preset names.
 */
export const THEME_NAMES = ['default', 'ocean', 'forest', 'sunset'] as const;

/**
 * Type for available theme names.
 */
export type ThemeName = (typeof THEME_NAMES)[number];

/**
 * Default theme to use when no theme is selected.
 */
export const DEFAULT_THEME: ThemeName = 'default';

/**
 * Predefined theme palettes.
 *
 * Colors are WCAG AA compliant for text contrast where applicable.
 * Each palette is designed to work harmoniously across UI elements.
 */
export const THEME_PRESETS: Record<ThemeName, FoundationPalette> = {
  /**
   * Default Foundation-like palette with balanced colors.
   * Based on Foundation's default palette with accessibility improvements.
   */
  default: {
    primary: '#1779ba', // Foundation default blue
    secondary: '#767676', // Neutral gray (WCAG AA compliant)
    success: '#3adb76', // Vibrant green
    warning: '#ffae00', // Amber
    alert: '#cc4b37', // Muted red
  },

  /**
   * Ocean-inspired palette with cool blues and teals.
   * Evokes depth and tranquility.
   */
  ocean: {
    primary: '#006994', // Deep ocean blue
    secondary: '#40798c', // Slate teal
    success: '#70a9a1', // Sea foam
    warning: '#e9c46a', // Sandy gold
    alert: '#e76f51', // Coral
  },

  /**
   * Forest-inspired palette with natural greens.
   * Evokes growth and sustainability.
   */
  forest: {
    primary: '#2d6a4f', // Deep forest green
    secondary: '#40916c', // Sage
    success: '#52b788', // Bright green
    warning: '#95d5b2', // Mint (used for caution, not warning)
    alert: '#9d4edd', // Purple contrast
  },

  /**
   * Sunset-inspired palette with warm earth tones.
   * Evokes warmth and creativity.
   */
  sunset: {
    primary: '#e07a5f', // Terra cotta
    secondary: '#3d405b', // Deep indigo
    success: '#81b29a', // Sage green
    warning: '#f2cc8f', // Warm sand
    alert: '#c1121f', // Deep red
  },
};

/**
 * Toolbar item configuration for Storybook globalTypes.
 * Used to populate the theme dropdown in the toolbar.
 */
export const THEME_TOOLBAR_ITEMS = THEME_NAMES.map((name) => ({
  value: name,
  title: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
}));
