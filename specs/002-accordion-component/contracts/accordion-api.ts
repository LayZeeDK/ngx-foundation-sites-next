/**
 * TypeScript API Contract for Accordion Components
 * 
 * This file defines the public API interfaces for all accordion components.
 * It serves as the contract between implementation and consumers.
 * 
 * **FOUNDATION API PARITY**: This API provides equivalent methods and events
 * to Foundation for Sites accordion JavaScript plugin:
 * - Foundation methods: toggle, down, up, destroy
 * - Foundation events: down, up (Foundation emits these as `down.zf.accordion` / `up.zf.accordion`)
 * - Angular equivalents documented below
 *
 * Naming rule: Prefer Foundation names for inputs/outputs/methods unless it would cause a name clash on the same Angular class.
 * Exceptions:
 * - `destroy()` → handled via Angular lifecycle / DestroyRef (not a public method)
 * - `init()` → handled by Angular auto-initialization (not a public method)
 * 
 * Phase: 1 - Design & Contracts
 * Date: 2026-01-07
 * Updated: 2025-01-06 (Added Foundation API parity)
 */

import { Signal, WritableSignal, ModelSignal, OutputEmitterRef, InputSignal, TemplateRef } from '@angular/core';

// ============================================================================
// Core Types
// ============================================================================

/**
 * Valid heading levels for accordion titles.
 * Used for ARIA document outline when titleHeadingLevel is set.
 */
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Event payload when accordion item state changes.
 */
export interface AccordionItemChangeEvent {
  /** ID of the item that changed */
  itemId: string;
  /** New expansion state (true = expanded, false = collapsed) */
  expanded: boolean;
}

// ============================================================================
// NfsAccordion (Container Component)
// ============================================================================

/**
 * Public API for NfsAccordion component.
 * Root container that manages overall accordion state.
 */
export interface NfsAccordionApi {
  // ── Inputs ──────────────────────────────────────────────────────────────
  
  /** Allow multiple panels to be expanded simultaneously */
  readonly multiExpand: InputSignal<boolean>;
  
  /** Allow all panels to be closed (if false, one panel must always be open) */
  readonly allowAllClosed: InputSignal<boolean>;
  
  /** Disable all accordion items */
  readonly disabled: InputSignal<boolean>;
  
  /** Synchronize expanded panel with URL hash */
  readonly deepLink: InputSignal<boolean>;
  
  /** Auto-scroll to expanded panel when deep linking */
  readonly deepLinkSmudge: InputSignal<boolean>;
  
  /** Delay in milliseconds before scrolling to deep-linked panel */
  readonly deepLinkSmudgeDelay: InputSignal<number>;
  
  /** Scroll offset in pixels (useful for sticky headers) */
  readonly deepLinkSmudgeOffset: InputSignal<number>;
  
  /** Use pushState instead of replaceState (enables browser back button for panels) */
  readonly updateHistory: InputSignal<boolean>;
  
  /** Enable wraparound for arrow key navigation (last → first, first → last) */
  readonly wrap: InputSignal<boolean>;
  
  /** Heading level for accordion titles (wraps buttons in <div role="heading">) */
  readonly titleHeadingLevel: InputSignal<AccordionHeadingLevel | null>;
  
  /** When disabled, items remain focusable but not activatable (true = aria-disabled, false = disabled attribute) */
  readonly softDisabled: InputSignal<boolean>;
  
  /** Optional custom ID for the accordion container */
  readonly id: InputSignal<string | undefined>;
  
  // ── Outputs ─────────────────────────────────────────────────────────────
  
  /**
   * Emitted when a panel is opened.
   *
   * @foundation API Parity: Equivalent to Foundation's `down.zf.accordion` event.
   */
  readonly down: OutputEmitterRef<AccordionItemChangeEvent>;

  /**
   * Emitted when a panel is closed.
   *
   * @foundation API Parity: Equivalent to Foundation's `up.zf.accordion` event.
   */
  readonly up: OutputEmitterRef<AccordionItemChangeEvent>;
}

// ============================================================================
// NfsAccordionItem (Item Component)
// ============================================================================

/**
 * Public API for NfsAccordionItem component.
 * Individual accordion item that manages its expanded/collapsed state.
 */
export interface NfsAccordionItemApi {
  // ── Inputs ──────────────────────────────────────────────────────────────
  
  /** 
   * Unique identifier for this panel (required).
   * Used for deep linking and ARIA relationships.
   */
  readonly panelId: InputSignal<string>;
  
  /** 
   * Whether the panel is expanded.
   * Supports two-way binding via [(expanded)].
   */
  readonly expanded: ModelSignal<boolean>;
  
  /** Whether this item is disabled */
  readonly disabled: InputSignal<boolean>;
  
  // ── Public Methods ──────────────────────────────────────────────────────
  
  /** 
   * Expand this panel (if not disabled).
   * 
   * @foundation API Parity: Equivalent to Foundation's `.down($target)` method.
   */
  down(): void;
  
  /** 
   * Collapse this panel (if allowed by parent accordion rules).
   * 
   * @foundation API Parity: Equivalent to Foundation's `.up($target)` method.
   */
  up(): void;
  
  /** 
   * Toggle expansion state (expand if collapsed, collapse if expanded).
   * 
   * @foundation API Parity: Equivalent to Foundation's `.toggle($target)` method.
   */
  toggle(): void;
}

// ============================================================================
// NfsAccordionTitle (Trigger Component)
// ============================================================================

/**
 * Public API for NfsAccordionTitle component.
 * Clickable button element that triggers expansion/collapse.
 * 
 * Note: This component has no public inputs/outputs.
 * It automatically coordinates with its parent NfsAccordionItem.
 */
export interface NfsAccordionTitleApi {
  // ── Public Methods ──────────────────────────────────────────────────────
  
  /** Programmatically focus this title button */
  focus(): void;
  
  /** Programmatically remove focus from this title button */
  blur(): void;
}

// ============================================================================
// NfsAccordionContent (Content Directive)
// ============================================================================

/**
 * Public API for NfsAccordionContent directive.
 * Structural directive for lazy content loading via ng-template.
 * 
 * Usage: <ng-template nfsAccordionContent>...</ng-template>
 * 
 * Note: This directive has no public inputs/outputs or methods.
 * Content is automatically rendered when the panel is first expanded.
 */
export interface NfsAccordionContentApi {
  /** Reference to the ng-template content (internal use only) */
  readonly templateRef: TemplateRef<void>;
}

// ============================================================================
// Internal Contracts (not part of public API)
// ============================================================================

/**
 * Internal contract for parent-child communication.
 * Items use this to register with and notify the parent accordion.
 * 
 * @internal
 */
export interface AccordionParent {
  /** Register an item with the parent accordion */
  registerItem(item: NfsAccordionItemApi): void;
  
  /** Unregister an item from the parent accordion */
  unregisterItem(item: NfsAccordionItemApi): void;
  
  /** Notify parent that an item's expansion state changed */
  notifyItemToggle(itemId: string, expanded: boolean): void;
  
  /** Check if an item can be closed based on allowAllClosed rule */
  canCloseItem(itemId: string): boolean;
  
  /** Get configuration for child items */
  readonly multiExpand: Signal<boolean>;
  readonly allowAllClosed: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly wrap: Signal<boolean>;
  readonly titleHeadingLevel: Signal<AccordionHeadingLevel | null>;
  readonly softDisabled: Signal<boolean>;
}

/**
 * Internal contract for item-title communication.
 * Title uses this to access item state and trigger actions.
 * 
 * @internal
 */
export interface AccordionItemParent {
  /** Whether the item is expanded */
  readonly expanded: Signal<boolean>;
  
  /** Whether the item is disabled */
  readonly disabled: Signal<boolean>;
  
  /** ID of the panel controlled by this item */
  readonly panelId: Signal<string>;
  
  /** Toggle the item's expansion state */
  toggle(): void;
  
  /** Check if item can be closed */
  readonly canClose: Signal<boolean>;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid heading level.
 */
export function isHeadingLevel(value: unknown): value is AccordionHeadingLevel {
  return typeof value === 'number' && value >= 1 && value <= 6;
}

/**
 * Type guard to check if an object implements AccordionParent.
 */
export function isAccordionParent(value: unknown): value is AccordionParent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'registerItem' in value &&
    'unregisterItem' in value &&
    'notifyItemToggle' in value &&
    'canCloseItem' in value
  );
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration for NfsAccordion.
 * These values are used when inputs are not provided.
 */
export const ACCORDION_DEFAULTS = {
  multiExpand: false,
  allowAllClosed: false,
  disabled: false,
  deepLink: false,
  deepLinkSmudge: false,
  deepLinkSmudgeDelay: 300,
  deepLinkSmudgeOffset: 0,
  updateHistory: false,
  wrap: false,
  titleHeadingLevel: null,
  softDisabled: true,
} as const;

/**
 * Default configuration for NfsAccordionItem.
 */
export const ACCORDION_ITEM_DEFAULTS = {
  expanded: false,
  disabled: false,
} as const;

// ============================================================================
// Foundation for Sites API Parity
// ============================================================================

/**
 * Mapping between Foundation for Sites accordion JavaScript API and Angular equivalents.
 * 
 * This ensures developers migrating from Foundation JS can find equivalent functionality.
 * 
 * @see https://get.foundation/sites/docs/accordion.html#javascript-reference
 */
export const FOUNDATION_API_MAPPING = {
  methods: {
    /** Foundation: `$('#accordion').foundation('toggle', $('#panel'))` */
    toggle: 'NfsAccordionItem.toggle()',
    
    /** Foundation: `$('#accordion').foundation('down', $('#panel'))` */
    down: 'NfsAccordionItem.down()',
    
    /** Foundation: `$('#accordion').foundation('up', $('#panel'))` */
    up: 'NfsAccordionItem.up()',
    
    /** Foundation: `$('#accordion').foundation('destroy')` */
    destroy: 'Handled by Angular lifecycle / DestroyRef (no public method)',
  },
  
  events: {
    /** Foundation: `$('#accordion').on('down.zf.accordion', handler)` */
    down: '(down) output on NfsAccordion (payload includes itemId)',
    
    /** Foundation: `$('#accordion').on('up.zf.accordion', handler)` */
    up: '(up) output on NfsAccordion (payload includes itemId)',
  },
  
  options: {
    /** Foundation: `data-multi-expand="true"` */
    multiExpand: '[multiExpand]="true" input on NfsAccordion',
    
    /** Foundation: `data-allow-all-closed="true"` */
    allowAllClosed: '[allowAllClosed]="true" input on NfsAccordion',
    
    /** Foundation: `data-deep-link="true"` */
    deepLink: '[deepLink]="true" input on NfsAccordion',
    
    /** Foundation: `data-deep-link-smudge="true"` */
    deepLinkSmudge: '[deepLinkSmudge]="true" input on NfsAccordion',
    
    /** Foundation: `data-update-history="true"` */
    updateHistory: '[updateHistory]="true" input on NfsAccordion',
    
    /** Foundation: `data-slide-speed="500"` */
    slideSpeed: 'Handled by Foundation CSS transitions (not in Angular API)',
  },
} as const;
