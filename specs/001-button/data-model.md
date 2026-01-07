# Data Model: Button Component

**Feature**: Accessible Button Component  
**Date**: 2026-01-06  
**Status**: Complete

## Overview

The Button component is a **purely presentational component** with no persistent data model. This document describes the component's runtime state model and type definitions.

## Component State Model

### NfsButton Component

The button component manages ephemeral UI state through Angular signals. No data persistence or external state management is required.

**State Properties**:

| Property       | Type                                                            | Default     | Mutability | Purpose                                              |
| -------------- | --------------------------------------------------------------- | ----------- | ---------- | ---------------------------------------------------- |
| `size`         | `'tiny' \| 'small' \| 'default' \| 'large'`                     | `'default'` | Input      | Controls button size via Foundation CSS classes      |
| `color`        | `'primary' \| 'secondary' \| 'success' \| 'alert' \| 'warning'` | `'primary'` | Input      | Controls button color via Foundation palette classes |
| `fill`         | `'solid' \| 'hollow' \| 'clear'`                                | `'solid'`   | Input      | Controls button fill style                           |
| `expanded`     | `boolean \| NfsButtonExpandedBreakpoint`                        | `false`     | Input      | Controls full-width behavior (responsive or always)  |
| `softDisabled` | `boolean`                                                       | `false`     | Input      | Controls soft-disabled state (aria-disabled)         |

**Computed Properties**:

| Property         | Type             | Derivation                                     | Purpose                                   |
| ---------------- | ---------------- | ---------------------------------------------- | ----------------------------------------- |
| `isAnchor`       | `boolean`        | `tagName === 'A'`                              | Identifies anchor elements                |
| `hasHref`        | `boolean`        | `getAttribute('href') !== null && !== ''`      | Detects link semantics                    |
| `isButtonAnchor` | `boolean`        | `isAnchor && !hasHref`                         | Identifies anchors needing button pattern |
| `anchorTabIndex` | `number \| null` | Based on `isAnchor`, `hasHref`, `softDisabled` | Controls keyboard focusability            |

**State Transitions**:

```
Initial State (all defaults)
  ↓
[User/Framework updates inputs]
  ↓
Signal updates trigger host bindings
  ↓
DOM classes update reactively
  ↓
[softDisabled changes from false → true]
  ↓
afterRenderEffect adds click listener
  ↓
[softDisabled changes from true → false]
  ↓
afterRenderEffect cleanup removes listener
  ↓
[Component destroyed]
  ↓
Style reference count decremented
```

**Validation Rules**: None - all inputs accept their typed values without validation.

**Relationships**: No relationships with other entities (standalone component).

## Type Definitions

### Exported Types

```typescript
/**
 * Button size variants.
 * Maps to Foundation CSS classes.
 */
export type NfsButtonSize = 'tiny' | 'small' | 'default' | 'large';

/**
 * Button color variants from Foundation palette.
 */
export type NfsButtonColor = 'primary' | 'secondary' | 'success' | 'alert' | 'warning';

/**
 * Button fill style variants.
 */
export type NfsButtonFill = 'solid' | 'hollow' | 'clear';

/**
 * Responsive-expanded breakpoint values.
 * Matches Foundation's responsive-expanded class suffixes.
 */
export type NfsButtonExpandedBreakpoint = 'small-only' | 'medium-only' | 'large-only' | 'medium' | 'large' | 'medium-down' | 'large-down';

/**
 * Expanded input type (boolean or breakpoint string).
 */
export type NfsButtonExpanded = boolean | NfsButtonExpandedBreakpoint;
```

### Internal Constants

```typescript
/**
 * Valid breakpoint values for expanded transform.
 */
const VALID_EXPANDED_BREAKPOINTS: ReadonlySet<string> = new Set(['small-only', 'medium-only', 'large-only', 'medium', 'large', 'medium-down', 'large-down']);
```

## CSS Class Mapping

Foundation CSS classes are applied via host bindings based on component state:

### Base Class (Always Applied)

| State | CSS Class |
| ----- | --------- |
| Any   | `.button` |

### Size Classes (Conditional)

| `size()` Value | CSS Class |
| -------------- | --------- |
| `'tiny'`       | `.tiny`   |
| `'small'`      | `.small`  |
| `'default'`    | (none)    |
| `'large'`      | `.large`  |

### Color Classes (Always Applied)

| `color()` Value | CSS Class    |
| --------------- | ------------ |
| `'primary'`     | `.primary`   |
| `'secondary'`   | `.secondary` |
| `'success'`     | `.success`   |
| `'alert'`       | `.alert`     |
| `'warning'`     | `.warning`   |

### Fill Classes (Conditional)

| `fill()` Value | CSS Class |
| -------------- | --------- |
| `'solid'`      | (none)    |
| `'hollow'`     | `.hollow` |
| `'clear'`      | `.clear`  |

### Expanded Classes (Conditional)

| `expanded()` Value | CSS Class               |
| ------------------ | ----------------------- |
| `false`            | (none)                  |
| `true`             | `.expanded`             |
| `'small-only'`     | `.small-only-expanded`  |
| `'medium-only'`    | `.medium-only-expanded` |
| `'large-only'`     | `.large-only-expanded`  |
| `'medium'`         | `.medium-expanded`      |
| `'large'`          | `.large-expanded`       |
| `'medium-down'`    | `.medium-down-expanded` |
| `'large-down'`     | `.large-down-expanded`  |

### State Classes (Conditional)

| `softDisabled()` Value | CSS Class   |
| ---------------------- | ----------- |
| `false`                | (none)      |
| `true`                 | `.disabled` |

## ARIA Attribute Mapping

ARIA attributes are applied via host bindings based on component state and element type:

| Condition                                    | Attribute       | Value      | Purpose                   |
| -------------------------------------------- | --------------- | ---------- | ------------------------- |
| `isButtonAnchor === true`                    | `role`          | `"button"` | Announce button semantics |
| `isButtonAnchor === true && !softDisabled()` | `tabindex`      | `0`        | Make focusable            |
| `isAnchor && softDisabled()`                 | `tabindex`      | `-1`       | Remove from tab order     |
| `softDisabled() === true`                    | `aria-disabled` | `"true"`   | Announce disabled state   |

## Event Model

### Native Events (No Custom Outputs)

The component relies entirely on native DOM events:

| Event           | Element Types    | Trigger                    | Behavior                               |
| --------------- | ---------------- | -------------------------- | -------------------------------------- |
| `click`         | All              | User click or programmatic | Prevented when `softDisabled === true` |
| `keydown.space` | Anchor (no href) | Space key                  | Triggers click if not soft-disabled    |
| `keydown.enter` | Anchor (no href) | Enter key                  | Triggers click if not soft-disabled    |
| `focus`         | All              | Tab/click                  | Native focus behavior                  |
| `blur`          | All              | Tab/click                  | Native blur behavior                   |

**Event Prevention Rules**:

- `softDisabled === true`: All clicks prevented via capture-phase listener
- Space key on button anchors: Default prevented (scroll), click triggered
- Enter key on button anchors: Default prevented, click triggered

## Service Dependencies

### NfsStyleLoader Service

The button component depends on the `NfsStyleLoader` service for runtime CSS management.

**Interface** (conceptual):

```typescript
interface NfsStyleLoader {
  /**
   * Load a component's styles (reference-counted).
   * @param componentName - Unique identifier for this component
   * @param cssPath - Path to CSS file (relative to base URL)
   */
  load(componentName: string, cssPath: string): void;

  /**
   * Unload a component's styles (decrements reference count).
   * @param componentName - Unique identifier for this component
   */
  unload(componentName: string): void;
}
```

**Usage Pattern**:

```typescript
constructor() {
  afterNextRender(() => {
    this.#styleLoader.load('button', '/nfs-button.css');
  });

  this.#destroyRef.onDestroy(() => {
    this.#styleLoader.unload('button');
  });
}
```

**State Management**: Reference counting ensures styles are loaded once and unloaded when no instances remain.

## Edge Case Behaviors

| Scenario                               | Expected Behavior                       | Implementation                                               |
| -------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| Both `disabled` and `softDisabled` set | Native `disabled` takes precedence      | Native disabled prevents focus, rendering soft-disabled moot |
| `softDisabled` changes dynamically     | Click listener added/removed reactively | `afterRenderEffect` cleanup function removes listener        |
| Invalid `expanded` breakpoint          | Treated as boolean `true` (if truthy)   | `booleanAttribute` fallback in transform                     |
| Multiple color classes race condition  | Last signal update wins                 | Angular's host binding mechanism handles this                |
| Anchor with empty `href=""`            | Treated as link (has href attribute)    | `hasHref` checks for `null` and empty string                 |
| Icon-only button (no text)             | Consumer must provide `aria-label`      | Component does not enforce this (flexibility)                |
| Space key on native button             | Native behavior (no handler needed)     | Component only adds handler for button anchors               |

## Persistence and Serialization

**Not Applicable**: The button component has no persistent state. All state is ephemeral UI state managed by Angular signals and destroyed when the component is destroyed.

## Conclusion

The button component is a stateless, presentation-only component with no data model in the traditional sense. Its "state" is entirely comprised of reactive input signals that control CSS class application and ARIA attributes. No external state management, persistence, or serialization is required.
