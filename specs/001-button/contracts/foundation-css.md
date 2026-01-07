# Foundation CSS Contract

**Feature**: Accessible Button Component  
**Version**: 1.0.0 (Foundation 6.9.0)  
**Date**: 2026-01-06  
**Status**: Stable

## Overview

This document defines the contract between the `NfsButton` component and Foundation for Sites CSS framework. The component relies on Foundation CSS classes and does not apply custom styles.

## Foundation Version

**Supported**: Foundation for Sites 6.9.0+  
**Reference**: https://get.foundation/sites/docs/button.html

## Required Sass Configuration

The component requires Foundation button styles to be compiled with specific configuration:

```scss
// In consumer's _nfs-settings.scss or equivalent

// REQUIRED: Enable responsive-expanded classes
$button-responsive-expanded: true; // Default in ngx-foundation-sites

// Standard Foundation button variables (configurable by consumer)
$button-padding: 0.85em 1em;
$button-margin: 0 0 $global-margin 0;
$button-fill: solid;
$button-background: $primary-color;
$button-background-hover: scale-color($button-background, $lightness: -15%);
$button-color: $white;
$button-color-alt: $black;
$button-radius: $global-radius;
$button-sizes: (
  tiny: 0.6rem,
  small: 0.75rem,
  default: 0.9rem,
  large: 1.25rem,
);
$button-palette: $foundation-palette;
$button-opacity-disabled: 0.25;
$button-background-hover-lightness: -20%;
$button-hollow-hover-lightness: -50%;
$button-transition:
  background-color 0.25s ease-out,
  color 0.25s ease-out;
```

## CSS Classes Contract

### Base Class (Required)

| Class     | Selector | Purpose                | Styles Applied                     |
| --------- | -------- | ---------------------- | ---------------------------------- |
| `.button` | Always   | Foundation button base | Padding, font, transitions, cursor |

**Contract**: Component MUST apply `.button` to all instances.

### Size Classes

| Class    | Selector               | Foundation Variable     | Purpose                          |
| -------- | ---------------------- | ----------------------- | -------------------------------- |
| `.tiny`  | `size() === 'tiny'`    | `$button-sizes.tiny`    | Extra small button (0.6rem font) |
| `.small` | `size() === 'small'`   | `$button-sizes.small`   | Small button (0.75rem font)      |
| (none)   | `size() === 'default'` | `$button-sizes.default` | Default button (0.9rem font)     |
| `.large` | `size() === 'large'`   | `$button-sizes.large`   | Large button (1.25rem font)      |

**Contract**: Component MUST apply size class when `size !== 'default'`.

### Color Classes (Palette)

| Class        | Selector                  | Foundation Variable | Purpose                  |
| ------------ | ------------------------- | ------------------- | ------------------------ |
| `.primary`   | `color() === 'primary'`   | `$primary-color`    | Primary brand color      |
| `.secondary` | `color() === 'secondary'` | `$secondary-color`  | Secondary/neutral color  |
| `.success`   | `color() === 'success'`   | `$success-color`    | Success/positive action  |
| `.alert`     | `color() === 'alert'`     | `$alert-color`      | Destructive/error action |
| `.warning`   | `color() === 'warning'`   | `$warning-color`    | Warning/caution action   |

**Contract**: Component MUST apply one color class (defaults to `.primary`).

**Foundation Contract**: Each color class applies:

- `background-color` from palette
- `color` from `$button-color` or `$button-color-alt`
- Hover state via `$button-background-hover-lightness`

### Fill Style Classes

| Class     | Selector              | Foundation Variable              | Purpose                             |
| --------- | --------------------- | -------------------------------- | ----------------------------------- |
| (none)    | `fill() === 'solid'`  | N/A (default)                    | Filled background                   |
| `.hollow` | `fill() === 'hollow'` | `$button-hollow-hover-lightness` | Border only, transparent background |
| `.clear`  | `fill() === 'clear'`  | N/A                              | Text only, no border                |

**Contract**: Component MUST apply fill class when `fill !== 'solid'`.

**Foundation Contract**:

- `.hollow` applies `border: 1px solid`, `background: transparent`
- `.clear` applies `border: 0`, `background: transparent`

### Expanded Classes (Full-Width)

| Class                   | Selector                       | Media Query                                                      | Purpose                          |
| ----------------------- | ------------------------------ | ---------------------------------------------------------------- | -------------------------------- |
| `.expanded`             | `expanded() === true`          | None (always)                                                    | Full width (100%)                |
| `.small-only-expanded`  | `expanded() === 'small-only'`  | `@media screen and (max-width: 39.9375em)`                       | Full width on small only         |
| `.medium-only-expanded` | `expanded() === 'medium-only'` | `@media screen and (min-width: 40em) and (max-width: 63.9375em)` | Full width on medium only        |
| `.large-only-expanded`  | `expanded() === 'large-only'`  | `@media screen and (min-width: 64em) and (max-width: 74.9375em)` | Full width on large only         |
| `.medium-expanded`      | `expanded() === 'medium'`      | `@media screen and (min-width: 40em)`                            | Full width on medium+            |
| `.large-expanded`       | `expanded() === 'large'`       | `@media screen and (min-width: 64em)`                            | Full width on large+             |
| `.medium-down-expanded` | `expanded() === 'medium-down'` | `@media screen and (max-width: 63.9375em)`                       | Full width on medium and smaller |
| `.large-down-expanded`  | `expanded() === 'large-down'`  | `@media screen and (max-width: 74.9375em)`                       | Full width on large and smaller  |

**Contract**: Component MUST apply expanded class when `expanded !== false`.

**Foundation Contract**: Responsive expanded classes are ONLY generated when `$button-responsive-expanded: true`.

**Breakpoint Contract** (Foundation defaults):

```scss
$breakpoints: (
  small: 0,
  medium: 640px,
  large: 1024px,
  xlarge: 1200px,
  xxlarge: 1440px,
);
```

**CRITICAL**: Constitution requires shipping library CSS with `$button-responsive-expanded: true` by default.

### State Classes

| Class       | Selector         | Foundation Variable        | Purpose                       |
| ----------- | ---------------- | -------------------------- | ----------------------------- |
| `.disabled` | `softDisabled()` | `$button-opacity-disabled` | Disabled appearance (opacity) |

**Contract**: Component MUST apply `.disabled` when `softDisabled === true`.

**Foundation Contract**: `.disabled` applies `opacity: $button-opacity-disabled` (default 0.25).

## CSS Specificity Contract

Foundation button styles have these specificity levels:

1. **Base** (lowest): `.button` - Core button styles
2. **Modifiers**: `.button.tiny`, `.button.primary`, etc. - Variant styles
3. **States**: `.button:hover`, `.button:focus`, `.button.disabled` - Interactive states
4. **Combinations**: `.button.hollow.primary:hover` - Complex combinations

**Contract**: Component does NOT add custom styles that override Foundation. Consumers may override via:

- Higher specificity selectors
- CSS custom properties (if Foundation supports them)
- Sass variable overrides (compile-time)

## Required CSS Inclusion

Consumers MUST include Foundation button styles in one of these ways:

### Option 1: Runtime Loading (Default)

Component automatically loads `/nfs-button.css` via `NfsStyleLoader` service:

```typescript
afterNextRender(() => {
  this.#styleLoader.load('button', '/nfs-button.css');
});
```

**Contract**:

- CSS file MUST be available at `/nfs-button.css` relative to app base URL
- CSS MUST be pre-compiled from Foundation Sass with required configuration
- Multiple button instances share one `<link>` tag (reference-counted)
- If CSS fails to load, component MUST remain functional (native semantics + events), MUST NOT throw, and MAY log a console warning (see spec.md FR-020)

### Option 2: Custom Theming (Advanced)

Consumers may compile custom themes and inject with `inject: false`:

```scss
// Custom theme
@import 'foundation-sites/scss/foundation';
@include foundation-button;
```

Then configure `NfsStyleLoader` to skip auto-loading or load custom path.

**Contract**: Custom themes MUST include all Foundation button classes listed above.

## Foundation Sass Mixin Contract

The component expects styles generated by Foundation's button mixin:

```scss
@include foundation-button;
```

This mixin generates:

- `.button` base styles
- Size modifiers (`.tiny`, `.small`, `.large`)
- Color modifiers from `$button-palette`
- Fill modifiers (`.hollow`, `.clear`)
- Expanded classes (`.expanded`, responsive variants)
- State classes (`.disabled`)

**Contract**: Consumers MUST NOT manually write button CSS; use Foundation's mixin.

## Browser Compatibility

Foundation button CSS targets:

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: Last 2 versions

**Contract**: Component does not add vendor prefixes; relies on consumer's autoprefixer configuration.

## CSS Loading Performance

**Contract**:

- First button instance triggers CSS load (asynchronous)
- Subsequent instances reuse loaded CSS (zero overhead)
- CSS unloaded when last button instance destroyed
- No inline styles or style tags (clean DOM)

**Implementation**: `NfsStyleLoader` service with reference counting.

## CSS File Size

Expected size for Foundation button CSS (gzipped):

- **Minimal** (base only): ~2KB
- **Full** (all colors, sizes, responsive): ~4-6KB

**Contract**: Component does not bloat CSS; size determined by Foundation configuration.

## Foundation CSS Updates

**Breaking Change Policy**:

- Component follows Foundation's CSS API (semver)
- Foundation minor/patch updates: No component changes needed
- Foundation major updates: May require component update if CSS API changes

**Current Foundation Version**: 6.9.0  
**Next Foundation Version**: 7.x (when released, component may need updates)

## CSS Validation

This contract is validated by:

- E2E tests in consumer app verifying class application
- Visual regression tests comparing to Foundation docs
- AXE tests verifying Foundation's color contrast ratios

## Contract Compliance

✅ **No custom CSS**: Component uses only Foundation classes  
✅ **Responsive enabled**: `$button-responsive-expanded: true` required  
✅ **All classes supported**: Size, color, fill, expanded, disabled  
✅ **Runtime loading**: Styles loaded via `NfsStyleLoader`  
✅ **Reference counted**: No duplicate style tags  
✅ **Foundation 6.9+ compatible**: Uses stable CSS API
