/**
 * Foundation Theme Defaults and Variable Definitions
 *
 * This module defines:
 * 1. DEFAULT_THEME_STATE - Foundation's default values for all configurable variables
 * 2. VARIABLE_SECTIONS - UI configuration for the theme panel (sections and controls)
 *
 * These defaults are sourced from Foundation for Sites documentation and source code.
 *
 * @see https://get.foundation/sites/docs/global.html
 * @see https://get.foundation/sites/docs/accordion.html
 * @see https://get.foundation/sites/docs/button.html
 */

import type {
  ThemeState,
  VariableSection,
  SpacingValue,
} from '../../.storybook/addons/theme-panel/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Default Theme State
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Foundation's default color palette.
 * @see https://get.foundation/sites/docs/global.html#colors
 */
export const DEFAULT_PALETTE = {
  primary: '#1779ba',
  secondary: '#767676',
  success: '#3adb76',
  warning: '#ffae00',
  alert: '#cc4b37',
} as const;

/**
 * Default accordion component settings.
 * @see https://get.foundation/sites/docs/accordion.html#sass-reference
 */
export const DEFAULT_ACCORDION = {
  background: '#fefefe',
  plusminus: true,
  titleFontSize: '0.75rem',
  itemPadding: { vertical: '1.25rem', horizontal: '1rem' } as SpacingValue,
  slideSpeed: '250ms',
} as const;

/**
 * Default button component settings.
 * @see https://get.foundation/sites/docs/button.html#sass-reference
 */
export const DEFAULT_BUTTON = {
  padding: { vertical: '0.85em', horizontal: '1em' } as SpacingValue,
  radius: '0',
  fontSize: '0.9rem',
} as const;

/**
 * Complete default theme state with all Foundation defaults.
 */
export const DEFAULT_THEME_STATE: ThemeState = {
  palette: { ...DEFAULT_PALETTE },
  accordion: { ...DEFAULT_ACCORDION },
  button: { ...DEFAULT_BUTTON },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Variable Section Definitions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Variable sections for the theme panel UI.
 * Each section groups related variables with their control configurations.
 */
export const VARIABLE_SECTIONS: VariableSection[] = [
  {
    id: 'palette',
    title: 'Color Palette',
    variables: [
      {
        sassVar: 'primary',
        label: 'Primary',
        type: 'color',
        defaultValue: DEFAULT_PALETTE.primary,
      },
      {
        sassVar: 'secondary',
        label: 'Secondary',
        type: 'color',
        defaultValue: DEFAULT_PALETTE.secondary,
      },
      {
        sassVar: 'success',
        label: 'Success',
        type: 'color',
        defaultValue: DEFAULT_PALETTE.success,
      },
      {
        sassVar: 'warning',
        label: 'Warning',
        type: 'color',
        defaultValue: DEFAULT_PALETTE.warning,
      },
      {
        sassVar: 'alert',
        label: 'Alert',
        type: 'color',
        defaultValue: DEFAULT_PALETTE.alert,
      },
    ],
  },
  {
    id: 'accordion',
    title: 'Accordion',
    variables: [
      {
        sassVar: 'accordion-background',
        label: 'Background',
        type: 'color',
        defaultValue: DEFAULT_ACCORDION.background,
      },
      {
        sassVar: 'accordion-plusminus',
        label: 'Show +/- Icons',
        type: 'boolean',
        defaultValue: DEFAULT_ACCORDION.plusminus,
      },
      {
        sassVar: 'accordion-title-font-size',
        label: 'Title Font Size',
        type: 'size',
        defaultValue: DEFAULT_ACCORDION.titleFontSize,
        unit: 'rem',
        min: 0.5,
        max: 2,
        step: 0.05,
      },
      {
        sassVar: 'accordion-item-padding',
        label: 'Item Padding',
        type: 'spacing',
        defaultValue: `${DEFAULT_ACCORDION.itemPadding.vertical} ${DEFAULT_ACCORDION.itemPadding.horizontal}`,
        unit: 'rem',
        min: 0,
        max: 3,
        step: 0.25,
      },
      {
        sassVar: 'nfs-accordion-slide-speed',
        label: 'Slide Speed',
        type: 'duration',
        defaultValue: DEFAULT_ACCORDION.slideSpeed,
        unit: 'ms',
        min: 0,
        max: 1000,
        step: 50,
      },
    ],
  },
  {
    id: 'button',
    title: 'Button',
    variables: [
      {
        sassVar: 'button-padding',
        label: 'Padding',
        type: 'spacing',
        defaultValue: `${DEFAULT_BUTTON.padding.vertical} ${DEFAULT_BUTTON.padding.horizontal}`,
        unit: 'em',
        min: 0,
        max: 3,
        step: 0.05,
      },
      {
        sassVar: 'button-radius',
        label: 'Border Radius',
        type: 'size',
        defaultValue: DEFAULT_BUTTON.radius,
        unit: 'px',
        min: 0,
        max: 20,
        step: 1,
      },
      {
        sassVar: 'button-font-size',
        label: 'Font Size',
        type: 'size',
        defaultValue: DEFAULT_BUTTON.fontSize,
        unit: 'rem',
        min: 0.5,
        max: 2,
        step: 0.05,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a deep copy of the default theme state.
 * Use this to get a fresh, mutable copy for the addon.
 */
export function getDefaultThemeState(): ThemeState {
  return {
    palette: { ...DEFAULT_THEME_STATE.palette },
    accordion: {
      ...DEFAULT_THEME_STATE.accordion,
      itemPadding: { ...DEFAULT_THEME_STATE.accordion.itemPadding },
    },
    button: {
      ...DEFAULT_THEME_STATE.button,
      padding: { ...DEFAULT_THEME_STATE.button.padding },
    },
  };
}

/**
 * Compares two theme states for equality.
 * Used to determine if recompilation is needed.
 */
export function areThemeStatesEqual(a: ThemeState, b: ThemeState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Deep merges a partial theme state with defaults.
 *
 * This is necessary because Storybook's URL-based globals persistence can
 * create partial objects with `undefined` values for unchanged properties.
 * For example, changing only the primary color results in:
 * `{ palette: { primary: '#ff0000' }, accordion: undefined, button: undefined }`
 *
 * This function ensures all required properties have valid values.
 *
 * @param partial - Partial theme state (possibly with undefined values)
 * @returns Complete theme state with all defaults filled in
 */
export function mergeWithDefaults(
  partial: Partial<ThemeState> | undefined,
): ThemeState {
  const defaults = getDefaultThemeState();

  if (!partial) {
    return defaults;
  }

  return {
    palette: {
      primary: partial.palette?.primary ?? defaults.palette.primary,
      secondary: partial.palette?.secondary ?? defaults.palette.secondary,
      success: partial.palette?.success ?? defaults.palette.success,
      warning: partial.palette?.warning ?? defaults.palette.warning,
      alert: partial.palette?.alert ?? defaults.palette.alert,
    },
    accordion: {
      background:
        partial.accordion?.background ?? defaults.accordion.background,
      plusminus: partial.accordion?.plusminus ?? defaults.accordion.plusminus,
      titleFontSize:
        partial.accordion?.titleFontSize ?? defaults.accordion.titleFontSize,
      itemPadding: partial.accordion?.itemPadding ?? {
        ...defaults.accordion.itemPadding,
      },
      slideSpeed:
        partial.accordion?.slideSpeed ?? defaults.accordion.slideSpeed,
    },
    button: {
      padding: partial.button?.padding ?? { ...defaults.button.padding },
      radius: partial.button?.radius ?? defaults.button.radius,
      fontSize: partial.button?.fontSize ?? defaults.button.fontSize,
    },
  };
}

/**
 * Generates SCSS variable declarations from a theme state.
 * Used for the "Export" feature.
 *
 * @param state - Theme state to export
 * @returns SCSS content for _nfs-settings.scss
 */
export function generateScssExport(state: ThemeState): string {
  const lines: string[] = [
    '// Foundation Settings (generated by ngx-foundation-sites Theme Panel)',
    '// Copy this file to your project and import it before ngx-foundation-sites styles.',
    '',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Color Palette',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    '$foundation-palette: (',
    `  "primary": ${state.palette.primary},`,
    `  "secondary": ${state.palette.secondary},`,
    `  "success": ${state.palette.success},`,
    `  "warning": ${state.palette.warning},`,
    `  "alert": ${state.palette.alert},`,
    ');',
    '',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Accordion',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    `$accordion-background: ${state.accordion.background};`,
    `$accordion-plusminus: ${state.accordion.plusminus};`,
    `$accordion-title-font-size: ${state.accordion.titleFontSize};`,
    `$accordion-item-padding: ${state.accordion.itemPadding.vertical} ${state.accordion.itemPadding.horizontal};`,
    `$nfs-accordion-slide-speed: ${state.accordion.slideSpeed};`,
    '',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Button',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    `$button-padding: ${state.button.padding.vertical} ${state.button.padding.horizontal};`,
    `$button-radius: ${state.button.radius};`,
    `$button-font-size: ${state.button.fontSize};`,
  ];

  return lines.join('\n');
}
