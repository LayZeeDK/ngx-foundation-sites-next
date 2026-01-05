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
  PaletteState,
  GlobalColorsState,
  TypographyState,
  SpacingGlobalState,
  LayoutState,
  AccordionState,
  ButtonState,
  ButtonSizesMap,
} from '../../.storybook/addons/theme-panel/types';
import {
  createPaletteLink,
  createCustomColor,
  resolveLinkedColor,
} from '../../.storybook/addons/theme-panel/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Default Values by Section
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Foundation's default color palette.
 * @see https://get.foundation/sites/docs/global.html#colors
 */
export const DEFAULT_PALETTE: PaletteState = {
  primary: '#1779ba',
  secondary: '#767676',
  success: '#3adb76',
  warning: '#ffae00',
  alert: '#cc4b37',
};

/**
 * Default gray scale and body colors.
 * @see https://get.foundation/sites/docs/global.html#colors
 */
export const DEFAULT_GLOBAL_COLORS: GlobalColorsState = {
  white: '#fefefe',
  lightGray: '#e6e6e6',
  mediumGray: '#cacaca',
  darkGray: '#8a8a8a',
  black: '#0a0a0a',
  bodyBackground: '#fefefe',
  bodyFontColor: '#0a0a0a',
};

/**
 * Default typography settings.
 * @see https://get.foundation/sites/docs/global.html#font-sizing
 */
export const DEFAULT_TYPOGRAPHY: TypographyState = {
  globalFontSize: '100%',
  globalLineHeight: '1.5',
  globalWeightNormal: 'normal',
  globalWeightBold: 'bold',
  bodyFontFamily: "'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif",
  headerFontFamily: "'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif",
  headerLineHeight: '1.4',
};

/**
 * Default spacing settings.
 * @see https://get.foundation/sites/docs/global.html#the-rem-calc-function
 */
export const DEFAULT_SPACING: SpacingGlobalState = {
  globalMargin: '1rem',
  globalPadding: '1rem',
  globalRadius: '0',
  globalMenuPadding: { vertical: '0.7rem', horizontal: '1rem' } as SpacingValue,
};

/**
 * Default layout settings.
 * @see https://get.foundation/sites/docs/global.html
 */
export const DEFAULT_LAYOUT: LayoutState = {
  globalTextDirection: 'ltr',
  globalWidth: '75rem',
  globalFlexbox: true,
};

/**
 * Default accordion component settings.
 * @see https://get.foundation/sites/docs/accordion.html#sass-reference
 */
export const DEFAULT_ACCORDION: AccordionState = {
  // Existing
  background: '#fefefe',
  plusminus: true,
  titleFontSize: '0.75rem',
  itemPadding: { vertical: '1.25rem', horizontal: '1rem' } as SpacingValue,
  slideSpeed: '250ms',
  // New
  plusContent: '\\002B',
  minusContent: '\\2013',
  itemColor: createPaletteLink('primary'),
  itemBackgroundHover: createCustomColor('#e6e6e6'),
  contentBackground: '#fefefe',
  contentBorder: '1px solid #e6e6e6',
  contentColor: createCustomColor('#0a0a0a'),
  contentPadding: '1rem',
};

/**
 * Default button sizes map.
 */
export const DEFAULT_BUTTON_SIZES: ButtonSizesMap = {
  tiny: '0.6rem',
  small: '0.75rem',
  default: '0.9rem',
  large: '1.25rem',
};

/**
 * Default button component settings.
 * @see https://get.foundation/sites/docs/button.html#sass-reference
 */
export const DEFAULT_BUTTON: ButtonState = {
  // Existing
  padding: { vertical: '0.85em', horizontal: '1em' } as SpacingValue,
  radius: '0',
  fontSize: '0.9rem',
  // New
  fontFamily: 'inherit',
  fontWeight: 'normal',
  margin: { vertical: '0', horizontal: '0' } as SpacingValue,
  fill: 'solid',
  background: createPaletteLink('primary'),
  backgroundHover: createCustomColor('#14679e'),
  color: createCustomColor('#fefefe'),
  colorAlt: createCustomColor('#0a0a0a'),
  border: '1px solid transparent',
  hollowBorderWidth: '1px',
  opacityDisabled: '0.25',
  backgroundHoverLightness: '-15%',
  hollowHoverLightness: '-50%',
  transition: 'background-color 0.25s ease-out, color 0.25s ease-out',
  responsiveExpanded: false,
  sizes: { ...DEFAULT_BUTTON_SIZES },
};

/**
 * Complete default theme state with all Foundation defaults.
 */
export const DEFAULT_THEME_STATE: ThemeState = {
  palette: { ...DEFAULT_PALETTE },
  globalColors: { ...DEFAULT_GLOBAL_COLORS },
  typography: { ...DEFAULT_TYPOGRAPHY },
  spacing: {
    ...DEFAULT_SPACING,
    globalMenuPadding: { ...DEFAULT_SPACING.globalMenuPadding },
  },
  layout: { ...DEFAULT_LAYOUT },
  accordion: {
    ...DEFAULT_ACCORDION,
    itemPadding: { ...DEFAULT_ACCORDION.itemPadding },
    itemColor: { ...DEFAULT_ACCORDION.itemColor },
    itemBackgroundHover: { ...DEFAULT_ACCORDION.itemBackgroundHover },
    contentColor: { ...DEFAULT_ACCORDION.contentColor },
  },
  button: {
    ...DEFAULT_BUTTON,
    padding: { ...DEFAULT_BUTTON.padding },
    margin: { ...DEFAULT_BUTTON.margin },
    background: { ...DEFAULT_BUTTON.background },
    backgroundHover: { ...DEFAULT_BUTTON.backgroundHover },
    color: { ...DEFAULT_BUTTON.color },
    colorAlt: { ...DEFAULT_BUTTON.colorAlt },
    sizes: { ...DEFAULT_BUTTON.sizes },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Variable Section Definitions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Variable sections for the theme panel UI.
 * Organized by category: Colors → Typography → Spacing → Layout → Components
 */
export const VARIABLE_SECTIONS: VariableSection[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // COLORS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'palette',
    title: 'Brand Colors',
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
    id: 'globalColors',
    title: 'Gray Scale & Body',
    variables: [
      {
        sassVar: 'white',
        label: 'White',
        type: 'color',
        defaultValue: DEFAULT_GLOBAL_COLORS.white,
      },
      {
        sassVar: 'light-gray',
        label: 'Light Gray',
        type: 'color',
        defaultValue: DEFAULT_GLOBAL_COLORS.lightGray,
      },
      {
        sassVar: 'medium-gray',
        label: 'Medium Gray',
        type: 'color',
        defaultValue: DEFAULT_GLOBAL_COLORS.mediumGray,
      },
      {
        sassVar: 'dark-gray',
        label: 'Dark Gray',
        type: 'color',
        defaultValue: DEFAULT_GLOBAL_COLORS.darkGray,
      },
      {
        sassVar: 'black',
        label: 'Black',
        type: 'color',
        defaultValue: DEFAULT_GLOBAL_COLORS.black,
      },
      {
        sassVar: 'body-background',
        label: 'Body Background',
        type: 'color',
        defaultValue: DEFAULT_GLOBAL_COLORS.bodyBackground,
      },
      {
        sassVar: 'body-font-color',
        label: 'Body Text',
        type: 'color',
        defaultValue: DEFAULT_GLOBAL_COLORS.bodyFontColor,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TYPOGRAPHY
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'typography',
    title: 'Typography',
    variables: [
      {
        sassVar: 'global-font-size',
        label: 'Base Font Size',
        type: 'text',
        defaultValue: DEFAULT_TYPOGRAPHY.globalFontSize,
        placeholder: '100%',
      },
      {
        sassVar: 'global-lineheight',
        label: 'Line Height',
        type: 'number',
        defaultValue: DEFAULT_TYPOGRAPHY.globalLineHeight,
        min: 1,
        max: 3,
        step: 0.1,
      },
      {
        sassVar: 'global-weight-normal',
        label: 'Normal Weight',
        type: 'text',
        defaultValue: DEFAULT_TYPOGRAPHY.globalWeightNormal,
        placeholder: 'normal',
      },
      {
        sassVar: 'global-weight-bold',
        label: 'Bold Weight',
        type: 'text',
        defaultValue: DEFAULT_TYPOGRAPHY.globalWeightBold,
        placeholder: 'bold',
      },
      {
        sassVar: 'body-font-family',
        label: 'Body Font',
        type: 'text',
        defaultValue: DEFAULT_TYPOGRAPHY.bodyFontFamily,
        placeholder: 'sans-serif',
      },
      {
        sassVar: 'header-font-family',
        label: 'Header Font',
        type: 'text',
        defaultValue: DEFAULT_TYPOGRAPHY.headerFontFamily,
        placeholder: 'sans-serif',
      },
      {
        sassVar: 'header-lineheight',
        label: 'Header Line Height',
        type: 'number',
        defaultValue: DEFAULT_TYPOGRAPHY.headerLineHeight,
        min: 1,
        max: 3,
        step: 0.1,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SPACING
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'spacing',
    title: 'Spacing',
    variables: [
      {
        sassVar: 'global-margin',
        label: 'Global Margin',
        type: 'size',
        defaultValue: DEFAULT_SPACING.globalMargin,
        unit: 'rem',
        min: 0,
        max: 3,
        step: 0.25,
      },
      {
        sassVar: 'global-padding',
        label: 'Global Padding',
        type: 'size',
        defaultValue: DEFAULT_SPACING.globalPadding,
        unit: 'rem',
        min: 0,
        max: 3,
        step: 0.25,
      },
      {
        sassVar: 'global-radius',
        label: 'Border Radius',
        type: 'size',
        defaultValue: DEFAULT_SPACING.globalRadius,
        unit: 'px',
        min: 0,
        max: 20,
        step: 1,
      },
      {
        sassVar: 'global-menu-padding',
        label: 'Menu Padding',
        type: 'spacing',
        defaultValue: `${DEFAULT_SPACING.globalMenuPadding.vertical} ${DEFAULT_SPACING.globalMenuPadding.horizontal}`,
        unit: 'rem',
        min: 0,
        max: 2,
        step: 0.1,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'layout',
    title: 'Layout',
    variables: [
      {
        sassVar: 'global-text-direction',
        label: 'Text Direction',
        type: 'select',
        defaultValue: DEFAULT_LAYOUT.globalTextDirection,
        options: [
          { value: 'ltr', label: 'Left-to-Right (LTR)' },
          { value: 'rtl', label: 'Right-to-Left (RTL)' },
        ],
      },
      {
        sassVar: 'global-width',
        label: 'Max Width',
        type: 'text',
        defaultValue: DEFAULT_LAYOUT.globalWidth,
        placeholder: '75rem',
      },
      {
        sassVar: 'global-flexbox',
        label: 'Use Flexbox',
        type: 'boolean',
        defaultValue: DEFAULT_LAYOUT.globalFlexbox,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPONENTS: ACCORDION
  // ─────────────────────────────────────────────────────────────────────────────
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
        sassVar: 'accordion-plus-content',
        label: 'Plus Icon',
        type: 'text',
        defaultValue: DEFAULT_ACCORDION.plusContent,
        placeholder: '\\002B',
      },
      {
        sassVar: 'accordion-minus-content',
        label: 'Minus Icon',
        type: 'text',
        defaultValue: DEFAULT_ACCORDION.minusContent,
        placeholder: '\\2013',
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
        sassVar: 'accordion-item-color',
        label: 'Title Color',
        type: 'linkedColor',
        defaultValue: DEFAULT_ACCORDION.itemColor,
      },
      {
        sassVar: 'accordion-item-background-hover',
        label: 'Hover Background',
        type: 'linkedColor',
        defaultValue: DEFAULT_ACCORDION.itemBackgroundHover,
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
        sassVar: 'accordion-content-background',
        label: 'Content Background',
        type: 'color',
        defaultValue: DEFAULT_ACCORDION.contentBackground,
      },
      {
        sassVar: 'accordion-content-border',
        label: 'Content Border',
        type: 'text',
        defaultValue: DEFAULT_ACCORDION.contentBorder,
        placeholder: '1px solid #e6e6e6',
      },
      {
        sassVar: 'accordion-content-color',
        label: 'Content Color',
        type: 'linkedColor',
        defaultValue: DEFAULT_ACCORDION.contentColor,
      },
      {
        sassVar: 'accordion-content-padding',
        label: 'Content Padding',
        type: 'size',
        defaultValue: DEFAULT_ACCORDION.contentPadding,
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

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPONENTS: BUTTON
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'button',
    title: 'Button',
    variables: [
      {
        sassVar: 'button-fill',
        label: 'Fill Style',
        type: 'select',
        defaultValue: DEFAULT_BUTTON.fill,
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'hollow', label: 'Hollow' },
        ],
      },
      {
        sassVar: 'button-background',
        label: 'Background',
        type: 'linkedColor',
        defaultValue: DEFAULT_BUTTON.background,
      },
      {
        sassVar: 'button-background-hover',
        label: 'Hover Background',
        type: 'linkedColor',
        defaultValue: DEFAULT_BUTTON.backgroundHover,
      },
      {
        sassVar: 'button-background-hover-lightness',
        label: 'Hover Lightness',
        type: 'percentage',
        defaultValue: DEFAULT_BUTTON.backgroundHoverLightness,
        min: -100,
        max: 100,
        step: 5,
      },
      {
        sassVar: 'button-color',
        label: 'Text Color',
        type: 'linkedColor',
        defaultValue: DEFAULT_BUTTON.color,
      },
      {
        sassVar: 'button-color-alt',
        label: 'Alt Text Color',
        type: 'linkedColor',
        defaultValue: DEFAULT_BUTTON.colorAlt,
      },
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
        sassVar: 'button-margin',
        label: 'Margin',
        type: 'spacing',
        defaultValue: `${DEFAULT_BUTTON.margin.vertical} ${DEFAULT_BUTTON.margin.horizontal}`,
        unit: 'rem',
        min: 0,
        max: 3,
        step: 0.25,
      },
      {
        sassVar: 'button-radius',
        label: 'Border Radius',
        type: 'size',
        defaultValue: DEFAULT_BUTTON.radius,
        unit: 'px',
        min: 0,
        max: 50,
        step: 1,
      },
      {
        sassVar: 'button-border',
        label: 'Border',
        type: 'text',
        defaultValue: DEFAULT_BUTTON.border,
        placeholder: '1px solid transparent',
      },
      {
        sassVar: 'button-hollow-border-width',
        label: 'Hollow Border Width',
        type: 'size',
        defaultValue: DEFAULT_BUTTON.hollowBorderWidth,
        unit: 'px',
        min: 1,
        max: 5,
        step: 1,
      },
      {
        sassVar: 'button-hollow-hover-lightness',
        label: 'Hollow Hover Lightness',
        type: 'percentage',
        defaultValue: DEFAULT_BUTTON.hollowHoverLightness,
        min: -100,
        max: 100,
        step: 5,
      },
      {
        sassVar: 'button-font-family',
        label: 'Font Family',
        type: 'text',
        defaultValue: DEFAULT_BUTTON.fontFamily,
        placeholder: 'inherit',
      },
      {
        sassVar: 'button-font-weight',
        label: 'Font Weight',
        type: 'text',
        defaultValue: DEFAULT_BUTTON.fontWeight,
        placeholder: 'normal',
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
      {
        sassVar: 'button-sizes',
        label: 'Size Variants',
        type: 'map',
        defaultValue: DEFAULT_BUTTON.sizes,
        unit: 'rem',
        min: 0.5,
        max: 2,
        step: 0.05,
        mapEntries: [
          {
            key: 'tiny',
            label: 'Tiny',
            defaultValue: DEFAULT_BUTTON_SIZES.tiny,
          },
          {
            key: 'small',
            label: 'Small',
            defaultValue: DEFAULT_BUTTON_SIZES.small,
          },
          {
            key: 'default',
            label: 'Default',
            defaultValue: DEFAULT_BUTTON_SIZES.default,
          },
          {
            key: 'large',
            label: 'Large',
            defaultValue: DEFAULT_BUTTON_SIZES.large,
          },
        ],
      },
      {
        sassVar: 'button-opacity-disabled',
        label: 'Disabled Opacity',
        type: 'number',
        defaultValue: DEFAULT_BUTTON.opacityDisabled,
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        sassVar: 'button-transition',
        label: 'Transition',
        type: 'text',
        defaultValue: DEFAULT_BUTTON.transition,
        placeholder: 'background-color 0.25s ease-out',
      },
      {
        sassVar: 'button-responsive-expanded',
        label: 'Responsive Expanded',
        type: 'boolean',
        defaultValue: DEFAULT_BUTTON.responsiveExpanded,
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
  return JSON.parse(JSON.stringify(DEFAULT_THEME_STATE));
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
    // Colors
    palette: {
      primary: partial.palette?.primary ?? defaults.palette.primary,
      secondary: partial.palette?.secondary ?? defaults.palette.secondary,
      success: partial.palette?.success ?? defaults.palette.success,
      warning: partial.palette?.warning ?? defaults.palette.warning,
      alert: partial.palette?.alert ?? defaults.palette.alert,
    },
    globalColors: {
      white: partial.globalColors?.white ?? defaults.globalColors.white,
      lightGray:
        partial.globalColors?.lightGray ?? defaults.globalColors.lightGray,
      mediumGray:
        partial.globalColors?.mediumGray ?? defaults.globalColors.mediumGray,
      darkGray:
        partial.globalColors?.darkGray ?? defaults.globalColors.darkGray,
      black: partial.globalColors?.black ?? defaults.globalColors.black,
      bodyBackground:
        partial.globalColors?.bodyBackground ??
        defaults.globalColors.bodyBackground,
      bodyFontColor:
        partial.globalColors?.bodyFontColor ??
        defaults.globalColors.bodyFontColor,
    },

    // Typography
    typography: {
      globalFontSize:
        partial.typography?.globalFontSize ??
        defaults.typography.globalFontSize,
      globalLineHeight:
        partial.typography?.globalLineHeight ??
        defaults.typography.globalLineHeight,
      globalWeightNormal:
        partial.typography?.globalWeightNormal ??
        defaults.typography.globalWeightNormal,
      globalWeightBold:
        partial.typography?.globalWeightBold ??
        defaults.typography.globalWeightBold,
      bodyFontFamily:
        partial.typography?.bodyFontFamily ??
        defaults.typography.bodyFontFamily,
      headerFontFamily:
        partial.typography?.headerFontFamily ??
        defaults.typography.headerFontFamily,
      headerLineHeight:
        partial.typography?.headerLineHeight ??
        defaults.typography.headerLineHeight,
    },

    // Spacing
    spacing: {
      globalMargin:
        partial.spacing?.globalMargin ?? defaults.spacing.globalMargin,
      globalPadding:
        partial.spacing?.globalPadding ?? defaults.spacing.globalPadding,
      globalRadius:
        partial.spacing?.globalRadius ?? defaults.spacing.globalRadius,
      globalMenuPadding: partial.spacing?.globalMenuPadding ?? {
        ...defaults.spacing.globalMenuPadding,
      },
    },

    // Layout
    layout: {
      globalTextDirection:
        partial.layout?.globalTextDirection ??
        defaults.layout.globalTextDirection,
      globalWidth: partial.layout?.globalWidth ?? defaults.layout.globalWidth,
      globalFlexbox:
        partial.layout?.globalFlexbox ?? defaults.layout.globalFlexbox,
    },

    // Accordion
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
      plusContent:
        partial.accordion?.plusContent ?? defaults.accordion.plusContent,
      minusContent:
        partial.accordion?.minusContent ?? defaults.accordion.minusContent,
      itemColor: partial.accordion?.itemColor ?? {
        ...defaults.accordion.itemColor,
      },
      itemBackgroundHover: partial.accordion?.itemBackgroundHover ?? {
        ...defaults.accordion.itemBackgroundHover,
      },
      contentBackground:
        partial.accordion?.contentBackground ??
        defaults.accordion.contentBackground,
      contentBorder:
        partial.accordion?.contentBorder ?? defaults.accordion.contentBorder,
      contentColor: partial.accordion?.contentColor ?? {
        ...defaults.accordion.contentColor,
      },
      contentPadding:
        partial.accordion?.contentPadding ?? defaults.accordion.contentPadding,
    },

    // Button
    button: {
      padding: partial.button?.padding ?? { ...defaults.button.padding },
      radius: partial.button?.radius ?? defaults.button.radius,
      fontSize: partial.button?.fontSize ?? defaults.button.fontSize,
      fontFamily: partial.button?.fontFamily ?? defaults.button.fontFamily,
      fontWeight: partial.button?.fontWeight ?? defaults.button.fontWeight,
      margin: partial.button?.margin ?? { ...defaults.button.margin },
      fill: partial.button?.fill ?? defaults.button.fill,
      background: partial.button?.background ?? {
        ...defaults.button.background,
      },
      backgroundHover: partial.button?.backgroundHover ?? {
        ...defaults.button.backgroundHover,
      },
      color: partial.button?.color ?? { ...defaults.button.color },
      colorAlt: partial.button?.colorAlt ?? { ...defaults.button.colorAlt },
      border: partial.button?.border ?? defaults.button.border,
      hollowBorderWidth:
        partial.button?.hollowBorderWidth ?? defaults.button.hollowBorderWidth,
      opacityDisabled:
        partial.button?.opacityDisabled ?? defaults.button.opacityDisabled,
      backgroundHoverLightness:
        partial.button?.backgroundHoverLightness ??
        defaults.button.backgroundHoverLightness,
      hollowHoverLightness:
        partial.button?.hollowHoverLightness ??
        defaults.button.hollowHoverLightness,
      transition: partial.button?.transition ?? defaults.button.transition,
      responsiveExpanded:
        partial.button?.responsiveExpanded ??
        defaults.button.responsiveExpanded,
      sizes: partial.button?.sizes ?? { ...defaults.button.sizes },
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

    // ─────────────────────────────────────────────────────────────────────────
    // Brand Colors
    // ─────────────────────────────────────────────────────────────────────────
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Brand Colors',
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

    // ─────────────────────────────────────────────────────────────────────────
    // Gray Scale & Body
    // ─────────────────────────────────────────────────────────────────────────
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Gray Scale & Body',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    `$white: ${state.globalColors.white};`,
    `$light-gray: ${state.globalColors.lightGray};`,
    `$medium-gray: ${state.globalColors.mediumGray};`,
    `$dark-gray: ${state.globalColors.darkGray};`,
    `$black: ${state.globalColors.black};`,
    `$body-background: ${state.globalColors.bodyBackground};`,
    `$body-font-color: ${state.globalColors.bodyFontColor};`,
    '',

    // ─────────────────────────────────────────────────────────────────────────
    // Typography
    // ─────────────────────────────────────────────────────────────────────────
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Typography',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    `$global-font-size: ${state.typography.globalFontSize};`,
    `$global-lineheight: ${state.typography.globalLineHeight};`,
    `$global-weight-normal: ${state.typography.globalWeightNormal};`,
    `$global-weight-bold: ${state.typography.globalWeightBold};`,
    `$body-font-family: ${state.typography.bodyFontFamily};`,
    `$header-font-family: ${state.typography.headerFontFamily};`,
    `$header-lineheight: ${state.typography.headerLineHeight};`,
    '',

    // ─────────────────────────────────────────────────────────────────────────
    // Spacing
    // ─────────────────────────────────────────────────────────────────────────
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Spacing',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    `$global-margin: ${state.spacing.globalMargin};`,
    `$global-padding: ${state.spacing.globalPadding};`,
    `$global-radius: ${state.spacing.globalRadius};`,
    `$global-menu-padding: ${state.spacing.globalMenuPadding.vertical} ${state.spacing.globalMenuPadding.horizontal};`,
    '',

    // ─────────────────────────────────────────────────────────────────────────
    // Layout
    // ─────────────────────────────────────────────────────────────────────────
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Layout',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    `$global-text-direction: ${state.layout.globalTextDirection};`,
    `$global-width: ${state.layout.globalWidth};`,
    `$global-flexbox: ${state.layout.globalFlexbox};`,
    '',

    // ─────────────────────────────────────────────────────────────────────────
    // Accordion
    // ─────────────────────────────────────────────────────────────────────────
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Accordion',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    `$accordion-background: ${state.accordion.background};`,
    `$accordion-plusminus: ${state.accordion.plusminus};`,
    `$accordion-plus-content: '${state.accordion.plusContent}';`,
    `$accordion-minus-content: '${state.accordion.minusContent}';`,
    `$accordion-title-font-size: ${state.accordion.titleFontSize};`,
    `$accordion-item-color: ${resolveLinkedColor(state.accordion.itemColor, state.palette)};`,
    `$accordion-item-background-hover: ${resolveLinkedColor(state.accordion.itemBackgroundHover, state.palette)};`,
    `$accordion-item-padding: ${state.accordion.itemPadding.vertical} ${state.accordion.itemPadding.horizontal};`,
    `$accordion-content-background: ${state.accordion.contentBackground};`,
    `$accordion-content-border: ${state.accordion.contentBorder};`,
    `$accordion-content-color: ${resolveLinkedColor(state.accordion.contentColor, state.palette)};`,
    `$accordion-content-padding: ${state.accordion.contentPadding};`,
    `$nfs-accordion-slide-speed: ${state.accordion.slideSpeed};`,
    '',

    // ─────────────────────────────────────────────────────────────────────────
    // Button
    // ─────────────────────────────────────────────────────────────────────────
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '// Button',
    '// ═══════════════════════════════════════════════════════════════════════════════',
    '',
    `$button-fill: ${state.button.fill};`,
    `$button-background: ${resolveLinkedColor(state.button.background, state.palette)};`,
    `$button-background-hover: ${resolveLinkedColor(state.button.backgroundHover, state.palette)};`,
    `$button-background-hover-lightness: ${state.button.backgroundHoverLightness};`,
    `$button-color: ${resolveLinkedColor(state.button.color, state.palette)};`,
    `$button-color-alt: ${resolveLinkedColor(state.button.colorAlt, state.palette)};`,
    `$button-padding: ${state.button.padding.vertical} ${state.button.padding.horizontal};`,
    `$button-margin: 0 0 ${state.button.margin.vertical} 0;`,
    `$button-radius: ${state.button.radius};`,
    `$button-border: ${state.button.border};`,
    `$button-hollow-border-width: ${state.button.hollowBorderWidth};`,
    `$button-hollow-hover-lightness: ${state.button.hollowHoverLightness};`,
    `$button-font-family: ${state.button.fontFamily};`,
    `$button-font-weight: ${state.button.fontWeight};`,
    '$button-sizes: (',
    `  tiny: ${state.button.sizes.tiny},`,
    `  small: ${state.button.sizes.small},`,
    `  default: ${state.button.sizes.default},`,
    `  large: ${state.button.sizes.large},`,
    ');',
    `$button-opacity-disabled: ${state.button.opacityDisabled};`,
    `$button-transition: ${state.button.transition};`,
    `$button-responsive-expanded: ${state.button.responsiveExpanded};`,
  ];

  return lines.join('\n');
}
