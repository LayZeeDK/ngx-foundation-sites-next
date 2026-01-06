# Button Component API Contract

**Feature**: Accessible Button Component  
**Version**: 1.0.0  
**Date**: 2025-01-22  
**Status**: Stable

## Overview

This document defines the public API contract for the `NfsButton` component. This contract is stable and should not introduce breaking changes without a major version bump.

## Component Metadata

```typescript
@Component({
  selector: 'button[nfsButton], a[nfsButton]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class NfsButton { /* ... */ }
```

## Inputs

### `size`

```typescript
readonly size = input<'tiny' | 'small' | 'default' | 'large'>('default');
```

**Contract**:
- **Type**: `'tiny' | 'small' | 'default' | 'large'`
- **Default**: `'default'`
- **Mutability**: Can change at runtime
- **Side Effects**: Updates CSS class binding (`.tiny`, `.small`, `.large`)
- **Breaking Change Policy**: New size values may be added in minor versions; existing values will not be removed or renamed

### `color`

```typescript
readonly color = input<'primary' | 'secondary' | 'success' | 'alert' | 'warning'>('primary');
```

**Contract**:
- **Type**: `'primary' | 'secondary' | 'success' | 'alert' | 'warning'`
- **Default**: `'primary'`
- **Mutability**: Can change at runtime
- **Side Effects**: Updates CSS class binding (`.primary`, `.secondary`, etc.)
- **Breaking Change Policy**: New color values may be added in minor versions to match Foundation palette expansions

### `fill`

```typescript
readonly fill = input<'solid' | 'hollow' | 'clear'>('solid');
```

**Contract**:
- **Type**: `'solid' | 'hollow' | 'clear'`
- **Default**: `'solid'`
- **Mutability**: Can change at runtime
- **Side Effects**: Updates CSS class binding (`.hollow`, `.clear`)
- **Breaking Change Policy**: New fill styles may be added in minor versions; `'solid'` will remain the default

### `expanded`

```typescript
readonly expanded = input<boolean | NfsButtonExpandedBreakpoint, unknown>(
  false,
  { transform: expandedTransform }
);
```

**Contract**:
- **Type**: `boolean | NfsButtonExpandedBreakpoint`
- **Accepted Values**:
  - Boolean: `true`, `false`
  - Breakpoint strings: `'small-only'`, `'medium-only'`, `'large-only'`, `'medium'`, `'large'`, `'medium-down'`, `'large-down'`
- **Default**: `false`
- **Transform**: Custom transform that accepts breakpoint strings or delegates to `booleanAttribute`
- **Mutability**: Can change at runtime
- **Side Effects**: Updates CSS class binding (`.expanded`, `.medium-expanded`, etc.)
- **Breaking Change Policy**: 
  - New breakpoint values may be added in minor versions if Foundation adds them
  - Existing breakpoint values will not be removed or renamed
  - Transform behavior is stable (breakpoint strings bypass boolean coercion)

### `softDisabled`

```typescript
readonly softDisabled = input(false, { transform: booleanAttribute });
```

**Contract**:
- **Type**: `boolean`
- **Default**: `false`
- **Transform**: `booleanAttribute` (Angular's standard boolean coercion)
- **Mutability**: Can change at runtime
- **Side Effects**: 
  - Updates CSS class binding (`.disabled`)
  - Updates ARIA attribute (`aria-disabled`)
  - Updates `tabindex` for anchors
  - Adds/removes capture-phase click listener
- **Breaking Change Policy**: Behavior is stable; no changes planned

## Outputs

**Contract**: The component exposes **no custom outputs**.

**Native Events**: Consumers should use native DOM events:
- `(click)` - Click event (prevented when `softDisabled === true`)
- `(focus)` - Focus event
- `(blur)` - Blur event
- All other native button/anchor events

**Breaking Change Policy**: No custom outputs will be added (would be a breaking change to event binding expectations).

## Host Bindings

### CSS Classes

**Always Applied**:
- `.button` - Foundation base class

**Conditionally Applied**:
| Binding | Condition | Class |
|---------|-----------|-------|
| `[class.tiny]` | `size() === 'tiny'` | `.tiny` |
| `[class.small]` | `size() === 'small'` | `.small` |
| `[class.large]` | `size() === 'large'` | `.large` |
| `[class.expanded]` | `expanded() === true` | `.expanded` |
| `[class.small-only-expanded]` | `expanded() === 'small-only'` | `.small-only-expanded` |
| `[class.medium-only-expanded]` | `expanded() === 'medium-only'` | `.medium-only-expanded` |
| `[class.large-only-expanded]` | `expanded() === 'large-only'` | `.large-only-expanded` |
| `[class.medium-expanded]` | `expanded() === 'medium'` | `.medium-expanded` |
| `[class.large-expanded]` | `expanded() === 'large'` | `.large-expanded` |
| `[class.medium-down-expanded]` | `expanded() === 'medium-down'` | `.medium-down-expanded` |
| `[class.large-down-expanded]` | `expanded() === 'large-down'` | `.large-down-expanded` |
| `[class.primary]` | `color() === 'primary'` | `.primary` |
| `[class.secondary]` | `color() === 'secondary'` | `.secondary` |
| `[class.success]` | `color() === 'success'` | `.success` |
| `[class.alert]` | `color() === 'alert'` | `.alert` |
| `[class.warning]` | `color() === 'warning'` | `.warning` |
| `[class.hollow]` | `fill() === 'hollow'` | `.hollow` |
| `[class.clear]` | `fill() === 'clear'` | `.clear` |
| `[class.disabled]` | `softDisabled()` | `.disabled` |

**Breaking Change Policy**: Class bindings are stable and match Foundation's CSS API.

### ARIA Attributes

| Binding | Condition | Attribute | Value |
|---------|-----------|-----------|-------|
| `[attr.role]` | `isButtonAnchor` | `role` | `"button"` |
| `[attr.tabindex]` | `anchorTabIndex !== null` | `tabindex` | `0` or `-1` |
| `[attr.aria-disabled]` | `softDisabled()` | `aria-disabled` | `"true"` |

**Breaking Change Policy**: ARIA attributes follow WAI-ARIA APG standards and are stable.

### Event Listeners

| Binding | Condition | Event | Handler |
|---------|-----------|-------|---------|
| `(keydown.space)` | `isButtonAnchor` | Space key | `handleSpaceKey($event)` |
| `(keydown.enter)` | `isButtonAnchor` | Enter key | `handleEnterKey($event)` |

**Additional Listeners** (not in host object):
- Capture-phase click listener: Added/removed reactively via `afterRenderEffect` when `softDisabled` changes

**Breaking Change Policy**: Event handling is stable per WAI-ARIA button pattern.

## Public Methods

**Contract**: The component exposes **no public methods**.

**Rationale**: The button component is purely declarative; all interactions happen via inputs and native events.

**Breaking Change Policy**: No public methods will be added (Angular signals and inputs cover all use cases).

## Protected Members (Template Access)

These members are part of the internal contract (accessible by Angular template engine):

```typescript
protected readonly isAnchor: boolean;
protected get hasHref(): boolean;
protected get isButtonAnchor(): boolean;
protected get anchorTabIndex(): number | null;
protected handleSpaceKey(event: Event): void;
protected handleEnterKey(event: Event): void;
```

**Contract**: These are implementation details and may change in minor versions without notice.

## Type Exports

```typescript
export type NfsButtonSize = 'tiny' | 'small' | 'default' | 'large';
export type NfsButtonColor = 'primary' | 'secondary' | 'success' | 'alert' | 'warning';
export type NfsButtonFill = 'solid' | 'hollow' | 'clear';
export type NfsButtonExpandedBreakpoint = 
  | 'small-only' 
  | 'medium-only' 
  | 'large-only' 
  | 'medium' 
  | 'large' 
  | 'medium-down' 
  | 'large-down';
export type NfsButtonExpanded = boolean | NfsButtonExpandedBreakpoint;
export class NfsButton { /* ... */ }
```

**Breaking Change Policy**:
- New type values may be added in minor versions
- Existing type values will not be removed or renamed without a major version
- Type names are stable

## Dependency Contracts

### Style Loading

```typescript
// Internal dependency - not part of public API
#styleLoader.load('button', '/nfs-button.css');
#styleLoader.unload('button');
```

**Contract**: 
- Styles loaded in `afterNextRender()` (browser-only)
- Styles unloaded in `DestroyRef.onDestroy()` (reference-counted)
- CSS path is stable: `/nfs-button.css`

**Breaking Change Policy**: Style loading mechanism may change in minor versions (internal detail).

## Usage Examples (Contract Validation)

These examples are guaranteed to work and will not break in minor versions:

```html
<!-- Basic button -->
<button nfsButton>Default Button</button>

<!-- All input combinations -->
<button nfsButton 
  size="large" 
  color="success" 
  fill="hollow" 
  [expanded]="true">
  Combined Inputs
</button>

<!-- Responsive expanded (attribute syntax) -->
<button nfsButton expanded="medium">Expanded on Medium+</button>

<!-- Soft disabled -->
<button nfsButton [softDisabled]="true">Soft Disabled</button>

<!-- Anchor as link (keeps link semantics) -->
<a nfsButton href="/page">Link Button</a>

<!-- Anchor as button (no href) -->
<a nfsButton (click)="handleAction()">Action Button</a>

<!-- Native events -->
<button nfsButton (click)="onClick()" (focus)="onFocus()">
  Event Handling
</button>
```

## Backwards Compatibility Guarantees

### Major Version (Breaking Changes Allowed)

- Removing or renaming inputs
- Removing or renaming type values
- Changing default values
- Changing selector pattern
- Removing CSS class bindings

### Minor Version (Non-Breaking Changes Allowed)

- Adding new type values (e.g., new colors, sizes, breakpoints)
- Adding new inputs (with defaults that don't affect existing usage)
- Internal implementation changes (style loading, event handling)
- Performance optimizations

### Patch Version (Bug Fixes Only)

- Fixing incorrect behavior to match documented contract
- Fixing accessibility issues
- Fixing browser compatibility issues

## Deprecation Policy

If a breaking change is required:

1. Deprecate the old API in a minor version (add deprecation notice)
2. Provide migration path in documentation
3. Support both old and new APIs for at least one major version
4. Remove deprecated API in next major version

## Contract Validation

This contract is validated by:
- Storybook interaction tests (verify inputs, outputs, host bindings)
- AXE accessibility tests (verify ARIA attributes)
- E2E tests (verify Foundation CSS classes render correctly)
- Type tests (verify TypeScript types are correct)

## Contract Compliance

✅ **Stable API**: All inputs have explicit types and defaults  
✅ **Backwards Compatible**: No breaking changes in minor versions  
✅ **Documented**: All public members documented with JSDoc  
✅ **Tested**: Interaction tests validate all contract points  
✅ **Versioned**: Follows semantic versioning (SemVer)
