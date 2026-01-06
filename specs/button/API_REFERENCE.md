# Button Component API Reference

## Overview

The `NfsButton` component provides an Angular-native implementation of Foundation for Sites buttons. It applies Foundation CSS classes to native `<button>` and `<a>` elements without requiring Foundation JavaScript.

## Component Selector

```typescript
selector: 'button[nfsButton], a[nfsButton]'
```

Use the `nfsButton` attribute on native `<button>` or `<a>` elements.

## Inputs

### `size`

**Type**: `'tiny' | 'small' | 'default' | 'large'`  
**Default**: `'default'`

Controls button size via Foundation CSS classes.

| Value     | Foundation Class | Description          |
| --------- | ---------------- | -------------------- |
| `'tiny'`  | `.tiny`          | Extra small button   |
| `'small'` | `.small`         | Small button         |
| `'default'` | _(none)_       | Default button size  |
| `'large'` | `.large`         | Large button         |

**Examples**:
```html
<button nfsButton size="tiny">Tiny Button</button>
<button nfsButton size="large">Large Button</button>
```

---

### `color`

**Type**: `'primary' | 'secondary' | 'success' | 'alert' | 'warning'`  
**Default**: `'primary'`

Controls button color via Foundation palette classes.

| Value         | Foundation Class | Description             |
| ------------- | ---------------- | ----------------------- |
| `'primary'`   | `.primary`       | Primary brand color     |
| `'secondary'` | `.secondary`     | Secondary/neutral color |
| `'success'`   | `.success`       | Success/positive action |
| `'alert'`     | `.alert`         | Destructive action      |
| `'warning'`   | `.warning`       | Warning/caution action  |

**Examples**:
```html
<button nfsButton color="success">Save</button>
<button nfsButton color="alert">Delete</button>
```

---

### `fill`

**Type**: `'solid' | 'hollow' | 'clear'`  
**Default**: `'solid'`

Controls button fill style via Foundation classes.

| Value      | Foundation Class | Description                      |
| ---------- | ---------------- | -------------------------------- |
| `'solid'`  | _(none)_         | Filled background (default)      |
| `'hollow'` | `.hollow`        | Outline/border only              |
| `'clear'`  | `.clear`         | Text only, no background/border  |

**Examples**:
```html
<button nfsButton fill="hollow">Hollow Button</button>
<button nfsButton fill="clear">Clear Button</button>
```

---

### `expanded`

**Type**: `boolean | NfsButtonExpandedBreakpoint`  
**Default**: `false`

Controls full-width (expanded) behavior, optionally at specific breakpoints.

#### Boolean Values

| Value   | Foundation Class | Description            |
| ------- | ---------------- | ---------------------- |
| `false` | _(none)_         | Default width (auto)   |
| `true`  | `.expanded`      | Always full-width      |

#### Responsive Breakpoint Values

| Value           | Foundation Class           | Behavior                                 |
| --------------- | -------------------------- | ---------------------------------------- |
| `'small-only'`  | `.small-only-expanded`     | Full-width only on small screens         |
| `'medium-only'` | `.medium-only-expanded`    | Full-width only on medium screens        |
| `'large-only'`  | `.large-only-expanded`     | Full-width only on large screens         |
| `'medium'`      | `.medium-expanded`         | Full-width on medium and larger          |
| `'large'`       | `.large-expanded`          | Full-width on large and larger           |
| `'medium-down'` | `.medium-down-expanded`    | Full-width on medium and smaller         |
| `'large-down'`  | `.large-down-expanded`     | Full-width on large and smaller          |

**Foundation Breakpoints (default)**:
- Small: 0px+ (mobile first)
- Medium: 640px+
- Large: 1024px+

**Examples**:
```html
<!-- Always expanded -->
<button nfsButton [expanded]="true">Full Width Button</button>

<!-- Attribute syntax (presence = true) -->
<button nfsButton expanded>Full Width Button</button>

<!-- Responsive expanded -->
<button nfsButton expanded="medium">Expanded on Medium+</button>
<button nfsButton expanded="small-only">Expanded on Small Only</button>
```

---

### `softDisabled`

**Type**: `boolean`  
**Default**: `false`

Controls soft-disabled state where button appears disabled but remains focusable.

**Behavior**:
- Applies Foundation `.disabled` class for visual styling
- Adds `aria-disabled="true"` attribute
- For `<a>` elements: sets `tabindex="-1"` to prevent keyboard focus
- Prevents click events via capture-phase event handler
- Allows focus for screen reader access and tooltip display

**Comparison with Native `disabled`**:

| Feature                  | Native `disabled`  | `softDisabled`     |
| ------------------------ | ------------------ | ------------------ |
| Visual styling           | ✅ Yes             | ✅ Yes             |
| Focusable                | ❌ No              | ✅ Yes (buttons)   |
| Click prevention         | ✅ Yes             | ✅ Yes             |
| Screen reader accessible | ⚠️ Skipped        | ✅ Announced       |
| Tooltip-friendly         | ❌ No              | ✅ Yes             |
| Use case                 | Hard disable       | Tooltips on disabled |

**Examples**:
```html
<!-- Hard disabled (not focusable) -->
<button nfsButton disabled>Cannot Focus</button>

<!-- Soft disabled (focusable, good for tooltips) -->
<button nfsButton [softDisabled]="true">
  Can Focus for Tooltip
</button>

<!-- Attribute syntax -->
<button nfsButton softDisabled>Soft Disabled</button>
```

---

## Outputs

The component has **no custom outputs**. Use native DOM events:

```html
<button nfsButton (click)="handleClick()">Click Me</button>
<a nfsButton href="/page" (click)="handleNavigation($event)">Navigate</a>
```

---

## Host Element Behavior

### For `<button>` Elements

- Base class: `.button` (always applied)
- No `role` attribute (native buttons have implicit role)
- Responds to Enter and Space keys (native behavior)

### For `<a>` Elements

#### `<a>` with `href` (link semantics)

- Base class: `.button` (always applied)
- Keeps native link semantics (no `role` override)
- Enter activates navigation (native behavior)
- When `softDisabled="true"`: sets `aria-disabled="true"` and `tabindex="-1"` to prevent keyboard focus

#### `<a>` without `href` (button semantics)

- Base class: `.button` (always applied)
- `role="button"`
- `tabindex="0"` (anchors without href are not focusable by default)
- Responds to Enter key AND Space key (Space handling added to match WAI-ARIA)
- When `softDisabled="true"`: sets `aria-disabled="true"` and `tabindex="-1"`

---

## Foundation CSS Classes Applied

The component applies Foundation CSS classes based on input values:

```html
<!-- Example with multiple inputs -->
<button nfsButton 
  size="large" 
  color="success" 
  fill="hollow" 
  expanded>
  
  <!-- Resulting classes: -->
  <!-- .button .large .success .hollow .expanded -->
</button>
```

**Class Application Logic**:

1. **Base class**: Always `.button`
2. **Size class**: Only when not `'default'`
3. **Color class**: Always applied (defaults to `.primary`)
4. **Fill class**: Only when not `'solid'`
5. **Expanded class**: Applied when `true` or a breakpoint string
6. **Disabled class**: `.disabled` when `softDisabled="true"`

---

## Accessibility

### ARIA Attributes

| Element Type | Attribute         | Applied When           | Purpose                      |
| ------------ | ----------------- | ---------------------- | ---------------------------- |
| `<a>` (no `href`) | `role="button"`    | When no `href`            | Button semantics for AT         |
| `<a>` (no `href`) | `tabindex="0"`     | When no `href` (enabled)  | Make anchor keyboard focusable  |
| Any               | `aria-disabled`     | `softDisabled="true"`    | Announce disabled state         |
| `<a>`             | `tabindex="-1"`    | `softDisabled="true"`    | Prevent keyboard focus          |

### Keyboard Navigation

| Key             | Element          | Behavior                           |
| --------------- | ---------------- | ---------------------------------- |
| Tab             | Both             | Move focus to/from button          |
| Enter           | Both             | Activate button/link               |
| Space           | `<button>`       | Activate button (native)           |
| Space           | `<a>` (no `href`) | Activate (custom handling)          |

### Focus Management

- Focus styles: Provided by Foundation CSS (`:focus` pseudo-class)
- Focus order: Natural DOM order
- Focus trap: Not applicable (buttons don't trap focus)

### Screen Readers

- Buttons announce as "button" (native or via `role="button"`)
- Soft-disabled buttons announce as "disabled button" (via `aria-disabled`)
- Icon-only buttons: Developer MUST provide `aria-label`

**Example**:
```html
<button nfsButton aria-label="Close dialog">
  <span aria-hidden="true">&times;</span>
</button>
```

---

## Usage Examples

### Basic Buttons

```html
<button nfsButton>Default Button</button>
<button nfsButton color="success">Success Button</button>
<button nfsButton size="large" color="alert">Large Alert Button</button>
```

### Links Styled as Buttons

```html
<a nfsButton href="/dashboard">Go to Dashboard</a>
<a nfsButton href="/settings" color="secondary">Settings</a>
```

### Hollow and Clear Styles

```html
<button nfsButton fill="hollow">Hollow Button</button>
<button nfsButton fill="clear" color="warning">Clear Warning</button>
```

### Expanded (Full-Width) Buttons

```html
<!-- Always expanded -->
<button nfsButton expanded>Full Width</button>

<!-- Responsive expanded -->
<button nfsButton expanded="medium">Expanded on Medium+</button>
<button nfsButton expanded="small-only">Expanded on Small Only</button>
```

### Disabled States

```html
<!-- Hard disabled -->
<button nfsButton disabled>Cannot Focus</button>

<!-- Soft disabled (focusable) -->
<button nfsButton [softDisabled]="true" title="Action unavailable">
  Soft Disabled with Tooltip
</button>
```

### Form Integration

```html
<form (submit)="handleSubmit()">
  <button nfsButton type="submit" color="success">Submit</button>
  <button nfsButton type="reset" color="secondary">Reset</button>
  <button nfsButton type="button" fill="hollow">Cancel</button>
</form>
```

### Combined Options

```html
<button nfsButton 
  size="large" 
  color="warning" 
  fill="hollow" 
  [expanded]="true">
  Large Hollow Warning Expanded
</button>
```

---

## CSS Custom Properties

The component does NOT define custom CSS properties. All styling is provided by Foundation for Sites Sass variables configured in the consumer's `_nfs-settings.scss`:

**Example Foundation Variables**:
```scss
// In consumer's _nfs-settings.scss
$button-background: $primary-color;
$button-background-hover: scale-color($button-background, $lightness: -15%);
$button-color: $white;
$button-radius: $global-radius;
$button-sizes: (
  tiny: 0.6rem,
  small: 0.75rem,
  default: 0.9rem,
  large: 1.25rem,
);
$button-palette: $foundation-palette;
```

---

## Foundation for Sites Reference

This component implements Foundation for Sites Button:
- **Documentation**: https://get.foundation/sites/docs/button.html
- **CSS Classes**: `.button`, `.tiny`, `.small`, `.large`, `.expanded`, `.primary`, `.secondary`, `.success`, `.alert`, `.warning`, `.hollow`, `.clear`, `.disabled`
- **Responsive Expanded**: `.small-only-expanded`, `.medium-only-expanded`, `.large-only-expanded`, `.medium-expanded`, `.large-expanded`, `.medium-down-expanded`, `.large-down-expanded`

---

## Implementation Notes

- **Style Loading**: Component automatically loads Foundation button styles on first render using `NfsStyleLoader` service
- **Style Unloading**: Styles are reference-counted and unloaded when last button instance is destroyed
- **SSR Safe**: Uses `afterNextRender()` and `afterRenderEffect()` for browser-only operations
- **Change Detection**: Uses `OnPush` strategy for optimal performance
- **Reactive Updates**: All inputs are signals; changes trigger reactive class updates via host bindings

---

## TypeScript Types

```typescript
// Size options
type NfsButtonSize = 'tiny' | 'small' | 'default' | 'large';

// Color options
type NfsButtonColor = 'primary' | 'secondary' | 'success' | 'alert' | 'warning';

// Fill style options
type NfsButtonFill = 'solid' | 'hollow' | 'clear';

// Expanded breakpoints
type NfsButtonExpandedBreakpoint = 
  | 'small-only'
  | 'medium-only'
  | 'large-only'
  | 'medium'
  | 'large'
  | 'medium-down'
  | 'large-down';

// Expanded type (boolean or breakpoint)
type NfsButtonExpanded = boolean | NfsButtonExpandedBreakpoint;
```

---

## Browser Support

Supports all browsers supported by:
- Angular 19+
- Foundation for Sites 6.9+

**Minimum versions**:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: Last 2 versions
- Android Chrome: Last 2 versions
