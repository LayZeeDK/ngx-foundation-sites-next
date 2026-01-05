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
  | 'color'
  | 'size'
  | 'spacing'
  | 'duration'
  | 'boolean';

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
  defaultValue: string | boolean;
  /** Unit for size/duration values (rem, px, ms, etc.) */
  unit?: string;
  /** Minimum value for sliders */
  min?: number;
  /** Maximum value for sliders */
  max?: number;
  /** Step increment for sliders */
  step?: number;
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
 * Accordion component variable configuration.
 */
export interface AccordionState {
  /** Background color of accordion items */
  background: string;
  /** Whether to show +/- icons */
  plusminus: boolean;
  /** Font size for accordion titles */
  titleFontSize: string;
  /** Padding around accordion content */
  itemPadding: SpacingValue;
  /** Animation duration for slide transitions */
  slideSpeed: string;
}

/**
 * Button component variable configuration.
 */
export interface ButtonState {
  /** Padding around button content */
  padding: SpacingValue;
  /** Border radius for rounded corners */
  radius: string;
  /** Font size for button text */
  fontSize: string;
}

/**
 * Complete theme state containing all configurable variables.
 */
export interface ThemeState {
  /** Foundation color palette */
  palette: PaletteState;
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
 * Export format options.
 */
export type ExportFormat = 'clipboard' | 'file';
