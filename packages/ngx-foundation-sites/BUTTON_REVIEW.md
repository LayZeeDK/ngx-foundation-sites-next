# NfsButton Implementation Review

This document reviews the `NfsButton` implementation against the [BUTTON_API_DESIGN.md](./BUTTON_API_DESIGN.md) specification and [Foundation Button documentation](https://get.foundation/sites/docs/button.html).

---

## Critical Issues

### 1. `softDisabled` Does Not Prevent Click Events

**Severity:** High

**Issue:** The `softDisabled` input only applies visual styling (`aria-disabled="true"`, `.disabled` class) but does NOT prevent click events from firing. Consumers must manually check the disabled state in their click handlers.

**Current Behavior:**

```typescript
// button.ts - only visual/ARIA attributes, no click prevention
'[class.disabled]': 'softDisabled()',
'[attr.aria-disabled]': 'softDisabled() || null',
```

**Expected Behavior:** Angular Material's `disabledInteractive` prevents the click event from propagating while keeping the button focusable.

**Recommendation:** Add a host listener to prevent default and stop propagation when `softDisabled()` is true:

```typescript
host: {
  '(click)': 'softDisabled() && $event.preventDefault() && $event.stopImmediatePropagation()',
}
```

Or use a more robust approach with a method:

```typescript
@HostListener('click', ['$event'])
protected _handleClick(event: MouseEvent): void {
  if (this.softDisabled()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
```

---

### 2. Anchor `softDisabled` Does Not Prevent Navigation

**Severity:** High

**Issue:** For `<a nfsButton [softDisabled]="true">`, the `tabindex="-1"` prevents keyboard activation, but clicking the link still navigates (if `href` is present).

**Current Implementation:**

```typescript
'[attr.tabindex]': 'softDisabled() && isAnchor ? -1 : null',
```

**Missing:** Click prevention for anchors when `softDisabled` is true.

---

### 3. `softDisabled` Submit Buttons Still Trigger Form Submission

**Severity:** High

**Issue:** A `softDisabled` button with `type="submit"` inside a form will still trigger:

- Native form `submit` event
- Angular's `(ngSubmit)` output

**Example of broken behavior:**

```html
<form (ngSubmit)="onSubmit()">
  <input type="text" />
  <!-- This button looks disabled but STILL submits the form! -->
  <button nfsButton type="submit" [softDisabled]="!isValid">Submit</button>
</form>
```

**Recommendation:** The click handler must call `event.preventDefault()` to prevent form submission:

```typescript
host: {
  '(click)': '_handleClick($event)',
}

protected _handleClick(event: MouseEvent): void {
  if (this.softDisabled()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
```

This single handler addresses issues #1, #2, and #3 together.

---

## Missing Features

### 4. No Responsive Expanded Classes

**Severity:** Low

**Issue:** Foundation supports responsive expanded classes like `small-only-expanded`, `medium-expanded`, `large-down-expanded`, etc. These are not exposed in the Angular API.

**Foundation Usage:**

```html
<a class="button small medium-expanded" href="#">Expand on medium and larger</a>
```

**Recommendation:** Consider adding for v2, or document as a limitation. Users can still add these classes manually via `class` binding.

---

### 5. Missing CSS Custom Properties from Design

**Severity:** Low

**Issue:** The API design document specifies these CSS custom properties that are NOT implemented:

| Design Document                 | Implemented |
| ------------------------------- | ----------- |
| `--nfs-button-background`       | No          |
| `--nfs-button-background-hover` | No          |
| `--nfs-button-color`            | No          |

**Currently Implemented:**

- `--nfs-button-padding` ✓
- `--nfs-button-font-size` ✓
- `--nfs-button-radius` ✓
- `--nfs-button-opacity-disabled` ✓
- `--nfs-button-transition` ✓

**Recommendation:** Either implement the color custom properties or update the design document to reflect the actual API.

---

## Documentation/Consistency Issues

### 6. Component vs Directive Terminology

**Severity:** Low

**Issue:** The API design document says "Directive" but the implementation uses `@Component`. The code comment explains this is intentional for style loading:

```typescript
/**
 * Uses component pattern (not directive) to enable style loading via styleUrl.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[nfsButton], a[nfsButton]',
  ...
})
```

**Recommendation:** Update the design document to reflect that it's technically a component with an attribute selector (not a directive), and explain why.

---

### 7. `expanded` Input Type Inconsistency

**Severity:** Low

**Issue:** The `expanded` input accepts `boolean` but doesn't use `booleanAttribute` transform, so string `"true"` won't work:

```html
<!-- This works -->
<button nfsButton [expanded]="true">
  <!-- This does NOT work (common HTML pattern) -->
  <button nfsButton expanded></button>
</button>
```

**Recommendation:** Add `booleanAttribute` transform for HTML attribute compatibility:

```typescript
readonly expanded = input(false, { transform: booleanAttribute });
```

Same applies to `softDisabled`.

---

### 8. ~~`isAnchor` Visibility~~ ✅ RESOLVED

**Status:** Fixed - `disableProtected: true` in `.compodocrc.json` correctly filters protected members from Storybook Controls after regenerating `documentation.json`.

**Root Cause:** Stale Nx cache was serving old `documentation.json`. Added `inputs` to `storybook` and `build-storybook` targets in `project.json` to ensure cache invalidates when `.compodocrc.json` changes.

---

## Suggestions for Improvement

### 9. ~~Consider Adding Button Group Support~~ N/A

**Status:** Intentionally not supported — Button Group is out of scope for this library.

---

### 10. Form Submission Behavior Documentation

**Severity:** Enhancement

The Storybook stories show form integration, but there's no documentation about the `.submit` class that Foundation recommends:

> Add the attribute `type="button"` to `<button>` elements, unless the button submits a form, in which case you should add the class `.submit`

**Recommendation:** Document this Foundation convention or add a `submit` variant.

---

### 11. Space Key Handling for Anchor Buttons

**Severity:** Medium

**Issue:** Native `<a>` elements don't respond to Space key for activation (only Enter). When `role="button"` is applied, users expect Space to work too.

**Current:** The implementation relies on native behavior, but anchors with `role="button"` should respond to Space.

**Recommendation:** Add keyboard handler for Space on anchor elements:

```typescript
host: {
  '(keydown.space)': 'isAnchor && _handleSpaceKey($event)',
}

protected _handleSpaceKey(event: KeyboardEvent): void {
  if (!this.softDisabled()) {
    event.preventDefault();
    (event.target as HTMLElement).click();
  }
}
```

---

## Test Coverage Observations

### Passing Tests

All 13 Button Storybook interaction tests pass:

- Default
- ColorVariants
- Sizes
- FillStyles
- DisabledStates
- LinksAsButtons
- IconOnlyButtons
- CombinedOptions
- FormIntegration
- KeyboardNavigation
- ThemeControls
- AccessibilityComprehensive

### Missing Test Coverage

1. **Click prevention for `softDisabled`** - No test verifies clicks are prevented
2. **Form submission prevention** - No test verifies `softDisabled` submit buttons don't trigger `(ngSubmit)`
3. **Space key on anchor buttons** - No test for keyboard activation
4. **Dynamic input changes** - No tests for changing inputs at runtime

---

## Summary

| Category             | Count |
| -------------------- | ----- |
| Critical Issues      | 3     |
| Missing Features     | 2     |
| Documentation Issues | 1     |
| Suggestions          | 2     |

### Priority Fixes

1. **[Critical]** Add click prevention for `softDisabled` buttons (fixes click events, anchor navigation, AND form submission in one handler)
2. **[Medium]** Add Space key handling for anchor buttons with `role="button"`
3. **[Low]** Add `booleanAttribute` transforms for boolean inputs

---

_Review conducted: 2025-12-28_
_Reviewed against: BUTTON_API_DESIGN.md, Foundation for Sites 6.9.0_
