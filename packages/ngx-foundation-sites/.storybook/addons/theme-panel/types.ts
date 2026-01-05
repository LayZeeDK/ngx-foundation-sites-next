/**
 * Type Definitions for Foundation Theme Addon
 *
 * Defines the structure for configurable Sass variables, sections,
 * and the overall theme state used by the addon panel.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Variable Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Types of controls available for Sass variables.
 */
export type VariableType =
  | 'color' // Standard color picker
  | 'size' // Slider for rem/px values
  | 'spacing' // Dual sliders for vertical/horizontal
  | 'duration' // Slider for animation timing (ms)
  | 'boolean' // Checkbox toggle
  | 'linkedColor' // Color with palette reference option
  | 'select' // Dropdown with predefined options
  | 'text' // Free text input
  | 'number' // Unitless number input
  | 'map' // Key-value map editor
  | 'percentage'; // Percentage slider (-100% to 100%)

/**
 * Option for select controls.
 */
export interface SelectOption {
  /** Value stored in state */
  value: string;
  /** Display label */
  label: string;
}

/**
 * Entry for map controls (e.g., $button-sizes).
 */
export interface MapEntry {
  /** Map key (e.g., 'tiny', 'small') */
  key: string;
  /** Display label */
  label: string;
  /** Default value for this entry */
  defaultValue: string;
}

/**
 * Definition of a configurable Sass variable.
 */
export interface VariableDefinition {
  /** Sass variable name (without $) */
  sassVar: string;
  /** Human-readable label for the control */
  label: string;
  /** Type of control to render */
  type: VariableType;
  /** Default value (from Foundation/NFS) */
  defaultValue: string | boolean | LinkedColorValue | Record<string, string>;
  /** Unit for size/duration values (rem, px, ms, etc.) */
  unit?: string;
  /** Minimum value for sliders */
  min?: number;
  /** Maximum value for sliders */
  max?: number;
  /** Step increment for sliders */
  step?: number;
  /** Options for select controls */
  options?: SelectOption[];
  /** Placeholder text for text inputs */
  placeholder?: string;
  /** Map entries for map controls */
  mapEntries?: MapEntry[];
}

/**
 * A collapsible section of related variables.
 */
export interface VariableSection {
  /** Unique identifier for the section */
  id: string;
  /** Display title for the section header */
  title: string;
  /** Variables in this section */
  variables: VariableDefinition[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Theme State
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vertical and horizontal values for spacing properties.
 * Foundation uses shorthand like "1.25rem 1rem" (vertical horizontal).
 */
export interface SpacingValue {
  /** Vertical (top/bottom) value, e.g., "1.25rem" */
  vertical: string;
  /** Horizontal (left/right) value, e.g., "1rem" */
  horizontal: string;
}

/**
 * Color value that can either be a custom hex color or reference a palette color.
 * This creates a design system experience where component colors stay in sync
 * with brand colors.
 */
export interface LinkedColorValue {
  /** Whether using a custom color or palette reference */
  mode: 'custom' | 'palette';
  /** Palette key when mode is 'palette' */
  paletteKey?: keyof PaletteState;
  /** Custom hex color when mode is 'custom' */
  customColor?: string;
}

/**
 * Foundation color palette configuration.
 */
export interface PaletteState {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  alert: string;
}

/**
 * Global colors configuration (gray scale and body colors).
 */
export interface GlobalColorsState {
  /** White color (Foundation default: #fefefe) */
  white: string;
  /** Light gray (Foundation default: #e6e6e6) */
  lightGray: string;
  /** Medium gray (Foundation default: #cacaca) */
  mediumGray: string;
  /** Dark gray (Foundation default: #8a8a8a) */
  darkGray: string;
  /** Black color (Foundation default: #0a0a0a) */
  black: string;
  /** Body background color */
  bodyBackground: string;
  /** Body font color */
  bodyFontColor: string;
}

/**
 * Global typography configuration.
 */
export interface TypographyState {
  /** Base font size (percentage, e.g., '100%') */
  globalFontSize: string;
  /** Global line height (unitless, e.g., '1.5') */
  globalLineHeight: string;
  /** Normal font weight */
  globalWeightNormal: string;
  /** Bold font weight */
  globalWeightBold: string;
  /** Body font family stack */
  bodyFontFamily: string;
  /** Header font family stack */
  headerFontFamily: string;
  /** Header line height */
  headerLineHeight: string;
}

/**
 * Global spacing configuration.
 */
export interface SpacingGlobalState {
  /** Global margin (e.g., '1rem') */
  globalMargin: string;
  /** Global padding (e.g., '1rem') */
  globalPadding: string;
  /** Global border radius (e.g., '0') */
  globalRadius: string;
  /** Global menu padding */
  globalMenuPadding: SpacingValue;
}

/**
 * Global layout configuration.
 */
export interface LayoutState {
  /** Text direction (ltr or rtl) */
  globalTextDirection: 'ltr' | 'rtl';
  /** Global max width (e.g., 'rem-calc(1200)') */
  globalWidth: string;
  /** Whether to use flexbox layouts */
  globalFlexbox: boolean;
}

/**
 * Accordion component variable configuration.
 * @see https://get.foundation/sites/docs/accordion.html#sass-reference
 */
export interface AccordionState {
  // ─────────────────────────────────────────────────────────────
  // Existing variables
  // ─────────────────────────────────────────────────────────────
  /** Background color of accordion group ($accordion-background) */
  background: string;
  /** Whether to show +/- icons ($accordion-plusminus) */
  plusminus: boolean;
  /** Font size for accordion titles ($accordion-title-font-size) */
  titleFontSize: string;
  /** Padding around accordion items ($accordion-item-padding) */
  itemPadding: SpacingValue;
  /** Animation duration for slide transitions ($nfs-accordion-slide-speed) */
  slideSpeed: string;

  // ─────────────────────────────────────────────────────────────
  // New variables
  // ─────────────────────────────────────────────────────────────
  /** Plus icon content ($accordion-plus-content, default: '\002B') */
  plusContent: string;
  /** Minus icon content ($accordion-minus-content, default: '\2013') */
  minusContent: string;
  /** Title text color ($accordion-item-color) - can reference palette */
  itemColor: LinkedColorValue;
  /** Title hover background ($accordion-item-background-hover) - can reference palette */
  itemBackgroundHover: LinkedColorValue;
  /** Content panel background ($accordion-content-background) */
  contentBackground: string;
  /** Content panel border ($accordion-content-border) */
  contentBorder: string;
  /** Content panel text color ($accordion-content-color) - can reference palette */
  contentColor: LinkedColorValue;
  /** Content panel padding ($accordion-content-padding) */
  contentPadding: string;
}

/**
 * Button sizes map for $button-sizes.
 * Includes index signature for Record<string, string> compatibility.
 */
export interface ButtonSizesMap {
  tiny: string;
  small: string;
  default: string;
  large: string;
  [key: string]: string;
}

/**
 * Button component variable configuration.
 * @see https://get.foundation/sites/docs/button.html#sass-reference
 */
export interface ButtonState {
  // ─────────────────────────────────────────────────────────────
  // Existing variables
  // ─────────────────────────────────────────────────────────────
  /** Padding around button content ($button-padding) */
  padding: SpacingValue;
  /** Border radius for rounded corners ($button-radius) */
  radius: string;
  /** Default font size ($button-font-size via $button-sizes.default) */
  fontSize: string;

  // ─────────────────────────────────────────────────────────────
  // New variables
  // ─────────────────────────────────────────────────────────────
  /** Font family ($button-font-family, default: 'inherit') */
  fontFamily: string;
  /** Font weight ($button-font-weight, default: null) */
  fontWeight: string;
  /** Margin around buttons ($button-margin) */
  margin: SpacingValue;
  /** Fill style ($button-fill: 'solid' or 'hollow') */
  fill: 'solid' | 'hollow';
  /** Background color ($button-background) - can reference palette */
  background: LinkedColorValue;
  /** Hover background ($button-background-hover) - can reference palette */
  backgroundHover: LinkedColorValue;
  /** Text color ($button-color) - can reference palette */
  color: LinkedColorValue;
  /** Alt text color for light backgrounds ($button-color-alt) - can reference palette */
  colorAlt: LinkedColorValue;
  /** Border style ($button-border) */
  border: string;
  /** Hollow button border width ($button-hollow-border-width) */
  hollowBorderWidth: string;
  /** Disabled opacity ($button-opacity-disabled, 0-1) */
  opacityDisabled: string;
  /** Hover background lightness adjustment ($button-background-hover-lightness) */
  backgroundHoverLightness: string;
  /** Hollow hover lightness adjustment ($button-hollow-hover-lightness) */
  hollowHoverLightness: string;
  /** CSS transition ($button-transition) */
  transition: string;
  /** Responsive expanded behavior ($button-responsive-expanded) */
  responsiveExpanded: boolean;
  /** Size variants ($button-sizes map) */
  sizes: ButtonSizesMap;
}

/**
 * Complete theme state containing all configurable variables.
 * Organized by category: Colors → Typography → Spacing → Layout → Components
 */
export interface ThemeState {
  // ─────────────────────────────────────────────────────────────
  // Colors
  // ─────────────────────────────────────────────────────────────
  /** Foundation brand color palette */
  palette: PaletteState;
  /** Gray scale and body colors */
  globalColors: GlobalColorsState;

  // ─────────────────────────────────────────────────────────────
  // Typography
  // ─────────────────────────────────────────────────────────────
  /** Global typography settings */
  typography: TypographyState;

  // ─────────────────────────────────────────────────────────────
  // Spacing
  // ─────────────────────────────────────────────────────────────
  /** Global spacing settings */
  spacing: SpacingGlobalState;

  // ─────────────────────────────────────────────────────────────
  // Layout
  // ─────────────────────────────────────────────────────────────
  /** Global layout settings */
  layout: LayoutState;

  // ─────────────────────────────────────────────────────────────
  // Components
  // ─────────────────────────────────────────────────────────────
  /** Accordion component settings */
  accordion: AccordionState;
  /** Button component settings */
  button: ButtonState;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Addon Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Props for control components.
 */
export interface ControlProps<T> {
  /** Current value */
  value: T;
  /** Callback when value changes */
  onChange: (value: T) => void;
  /** Variable definition for metadata */
  variable: VariableDefinition;
  /** Whether the control is disabled */
  disabled?: boolean;
}

/**
 * Props for the spacing control (dual sliders).
 */
export interface SpacingControlProps {
  /** Current spacing value */
  value: SpacingValue;
  /** Callback when either value changes */
  onChange: (value: SpacingValue) => void;
  /** Variable definition for metadata */
  variable: VariableDefinition;
  /** Whether the control is disabled */
  disabled?: boolean;
}

/**
 * Props for the linked color control (palette reference or custom).
 */
export interface LinkedColorControlProps {
  /** Current linked color value */
  value: LinkedColorValue;
  /** Callback when value changes */
  onChange: (value: LinkedColorValue) => void;
  /** Variable definition for metadata */
  variable: VariableDefinition;
  /** Current palette state for resolving palette references */
  palette: PaletteState;
  /** Whether the control is disabled */
  disabled?: boolean;
}

/**
 * Props for the map control (key-value editor).
 */
export interface MapControlProps {
  /** Current map value */
  value: Record<string, string>;
  /** Callback when value changes */
  onChange: (value: Record<string, string>) => void;
  /** Variable definition for metadata */
  variable: VariableDefinition;
  /** Whether the control is disabled */
  disabled?: boolean;
}

/**
 * Export format options.
 */
export type ExportFormat = 'clipboard' | 'file';

/**
 * Helper function to resolve a LinkedColorValue to its actual hex color.
 */
export function resolveLinkedColor(
  value: LinkedColorValue,
  palette: PaletteState,
): string {
  if (value.mode === 'palette' && value.paletteKey) {
    return palette[value.paletteKey];
  }
  return value.customColor ?? '#000000';
}

/**
 * Creates a LinkedColorValue that references a palette color.
 */
export function createPaletteLink(key: keyof PaletteState): LinkedColorValue {
  return { mode: 'palette', paletteKey: key };
}

/**
 * Creates a LinkedColorValue with a custom color.
 */
export function createCustomColor(color: string): LinkedColorValue {
  return { mode: 'custom', customColor: color };
}
