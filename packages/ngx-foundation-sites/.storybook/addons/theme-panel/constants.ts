/**
 * Constants for the Foundation Theme Addon
 */

/** Addon ID - must be unique across all addons */
export const ADDON_ID = 'nfs-theme-panel';

/** Panel ID - used for the panel tab */
export const PANEL_ID = `${ADDON_ID}/panel`;

/** Global key for storing theme state */
export const THEME_STATE_KEY = 'nfsThemeState';

/** Event channel for theme updates */
export const EVENTS = {
  /** Emitted when theme state changes (manager -> preview) */
  THEME_CHANGE: `${ADDON_ID}/theme-change`,
  /** Emitted to request current theme state (preview -> manager) */
  REQUEST_THEME: `${ADDON_ID}/request-theme`,
  /** Emitted when compilation starts */
  COMPILE_START: `${ADDON_ID}/compile-start`,
  /** Emitted when compilation ends */
  COMPILE_END: `${ADDON_ID}/compile-end`,
} as const;

/** Debounce delay in milliseconds for variable changes */
export const DEBOUNCE_MS = 300;
