# NfsButton Implementation Review

This document reviews the `NfsButton` implementation against the [BUTTON_API_DESIGN.md](./BUTTON_API_DESIGN.md) specification and [Foundation Button documentation](https://get.foundation/sites/docs/button.html).

---

## Critical Issues

### ~~1. `softDisabled` Does Not Prevent Click Events~~ ✅ RESOLVED

**Status:** Fixed — Click handler in capture phase blocks all clicks when `softDisabled` is true.

**Implementation:** Uses `Renderer2.listen()` with `{ capture: true }` to intercept clicks BEFORE Angular's template bindings (which use bubble phase). This ensures `stopImmediatePropagation()` blocks ALL click handlers including template `(click)` bindings.

```typescript
readonly #ngZone = inject(NgZone);
readonly #renderer = inject(Renderer2);

readonly #softDisabledClickEffect = (): (() => void) | undefined => {
  if (!this.softDisabled()) {
    return;
  }

  // Run outside NgZone because we don't change state.
  // Use capture phase to intercept clicks before Angular event bindings.
  const removeClickListener = this.#ngZone.runOutsideAngular(() =>
    this.#renderer.listen(
      this.#elementRef.nativeElement,
      'click',
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true },
    ),
  );

  return () => {
    removeClickListener();
  };
};

constructor() {
  afterRenderEffect(this.#softDisabledClickEffect);
}
```

**Key features:**

- `afterRenderEffect` — Reactively adds/removes listener when `softDisabled` signal changes
- Arrow function class member — Automatic `this` binding, no `.bind()` needed
- `runOutsideAngular` — Avoids triggering change detection
- Zero overhead for buttons with `softDisabled=false` (early return)

**Test Coverage:** `SoftDisabledClickPrevention` story verifies button clicks, form submission, and anchor navigation are all prevented.

---

### ~~2. Anchor `softDisabled` Does Not Prevent Navigation~~ ✅ RESOLVED

**Status:** Fixed — Same capture-phase click handler prevents anchor navigation via `event.preventDefault()`.

---

### ~~3. `softDisabled` Submit Buttons Still Trigger Form Submission~~ ✅ RESOLVED

**Status:** Fixed — Same capture-phase click handler prevents form submission via `event.preventDefault()`.

**Test Coverage:** `SoftDisabledClickPrevention` story includes form submission test.

---

## Missing Features

### ~~4. No Responsive Expanded Classes~~ ✅ RESOLVED

**Status:** Fixed — Extended the `expanded` input to accept responsive breakpoint strings.

**Implementation:** The `expanded` input now accepts both boolean values and breakpoint strings:

```typescript
type NfsButtonExpanded = boolean | 'small-only' | 'medium-only' | 'large-only' | 'medium' | 'large' | 'medium-down' | 'large-down';
```

**Usage:**

```html
<!-- Boolean (existing behavior) -->
<button nfsButton expanded>Always expanded</button>

<!-- Responsive breakpoint strings (new) -->
<button nfsButton expanded="medium">Expanded on medium and larger</button>
<button nfsButton expanded="large-down">Expanded on large and smaller</button>
<button nfsButton expanded="small-only">Expanded only on small</button>
```

**Key features:**

- Custom `expandedTransform` delegates to `booleanAttribute` for boolean coercion
- Breakpoint strings are preserved and map to Foundation CSS classes
- `$button-responsive-expanded: true` enabled in SCSS to generate responsive styles
- Supports all Foundation breakpoint patterns: `-only`, `-up` (implicit), and `-down`

**Test Coverage:** `ResponsiveExpanded` and `ExpandedInputSyntax` stories verify all breakpoint options and input syntaxes.

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

#### Implementation Plan

**Properties to implement:**

| Property                        | Purpose              | Fallback Pattern                    |
| ------------------------------- | -------------------- | ----------------------------------- |
| `--nfs-button-background`       | Background color     | `var(--nfs-primary-color, #0d5a89)` |
| `--nfs-button-background-hover` | Hover/focus bg color | `#0b4d75` (15% darker)              |
| `--nfs-button-color`            | Text color           | `#fefefe`                           |

**Design decisions:**

1. **Scope to primary/default buttons only** — Use `:not()` selectors to exclude color variants (`.secondary`, `.success`, `.warning`, `.alert`). Foundation's color variant classes override via CSS specificity.

2. **Follow existing pattern** — Reference `--nfs-primary-color` (from `_index.scss`) as intermediate fallback, matching the accordion's approach.

3. **Handle fill variants** — Solid, hollow, and clear fills need different handling:
   - Solid: Uses `--nfs-button-background` for background
   - Hollow: Uses `--nfs-button-background` for border/text color (transparent background)
   - Clear: Uses `--nfs-button-background` for text color (transparent background/border)

**Files to modify:**

1. `button.scss` — Add color CSS custom properties scoped to primary buttons:

```scss
// Color Custom Properties (Primary/Default only)
// Color variants (.secondary, .success, etc.) retain Foundation's compiled colors.
&:not(.secondary):not(.success):not(.warning):not(.alert) {
  // Solid fill (default)
  &:not(.hollow):not(.clear) {
    background-color: var(--nfs-button-background, var(--nfs-primary-color, #0d5a89));
    color: var(--nfs-button-color, #fefefe);

    &:hover,
    &:focus {
      background-color: var(--nfs-button-background-hover, #0b4d75);
    }
  }

  // Hollow fill
  &.hollow {
    border-color: var(--nfs-button-background, var(--nfs-primary-color, #0d5a89));
    color: var(--nfs-button-background, var(--nfs-primary-color, #0d5a89));

    &:hover,
    &:focus {
      border-color: var(--nfs-button-background-hover, #0b4d75);
      color: var(--nfs-button-background-hover, #0b4d75);
    }
  }

  // Clear fill
  &.clear {
    color: var(--nfs-button-background, var(--nfs-primary-color, #0d5a89));

    &:hover,
    &:focus {
      color: var(--nfs-button-background-hover, #0b4d75);
    }
  }
}
```

2. `button.stories.ts` — Update `ThemeControls` story with color controls and add `ColorCustomProperties` story with interaction tests.

3. `BUTTON_API_DESIGN.md` — Update CSS Custom Properties section to use WCAG AA colors and remove non-existent `--nfs-primary-color-dark` reference.

**Testing strategy:**

- Storybook interaction tests verify `getComputedStyle()` matches custom properties
- Verify color variants (secondary, success, etc.) are NOT affected
- Test hollow/clear buttons inherit from `--nfs-button-background`
- Use Playwright MCP for visual verification

**Commit strategy:**

1. Add color CSS custom properties to `button.scss`
2. Update `ThemeControls` story with color controls and tests
3. Add `ColorCustomProperties` story with tests
4. Update `BUTTON_API_DESIGN.md` with correct colors
5. Mark issue #5 resolved in `BUTTON_REVIEW.md`

---

## Documentation/Consistency Issues

### ~~6. Component vs Directive Terminology~~ ✅ RESOLVED

**Status:** Fixed — Updated `BUTTON_API_DESIGN.md` to use "component" terminology throughout.

**Changes made:**

- Goal section: "uses directive" → "uses component with attribute selector"
- Section header: "Proposed Directive API" → "Proposed Component API"
- Code example: `@Directive` → `@Component` with template, styleUrl, changeDetection
- Design decisions table: Updated rationale to explain style loading benefit
- Rationale section: "Why Directive Instead of Component?" → "Why Component with Attribute Selector?"

The design document now accurately reflects the implementation and explains why `@Component` is used (enables `styleUrl` for Foundation CSS integration while the attribute selector preserves native element accessibility).

---

### ~~7. `expanded` Input Type Inconsistency~~ ✅ RESOLVED

**Status:** Fixed — Added `booleanAttribute` transform to `expanded` and `softDisabled` inputs.

**Implementation:** Uses Angular's built-in `booleanAttribute` transform to support HTML boolean attribute syntax:

```typescript
readonly expanded = input(false, { transform: booleanAttribute });
readonly softDisabled = input(false, { transform: booleanAttribute });
```

**Supported syntaxes:**

- `expanded` — presence means `true` (HTML attribute style)
- `[expanded]="true"` — property binding (Angular style)
- `expanded="true"` — string `"true"` coerced to boolean `true`
- `expanded="false"` — string `"false"` coerced to boolean `false`

**Test Coverage:** `BooleanAttributeSyntax` story verifies all syntax variants for both `expanded` and `softDisabled` inputs.

---

### 8. ~~`isAnchor` Visibility~~ ✅ RESOLVED

**Status:** Fixed - `disableProtected: true` in `.compodocrc.json` correctly filters protected members from Storybook Controls after regenerating `documentation.json`.

**Root Cause:** Stale Nx cache was serving old `documentation.json`. Added `inputs` to `storybook` and `build-storybook` targets in `project.json` to ensure cache invalidates when `.compodocrc.json` changes.

---

## Suggestions for Improvement

### 9. ~~Consider Adding Button Group Support~~ N/A

**Status:** Intentionally not supported — Button Group is out of scope for this library.

---

### ~~10. Form Submission Behavior Documentation~~ N/A

**Status:** Not applicable — The `.submit` class has no CSS styles in Foundation. Modern HTML uses `type="submit"` (default) vs `type="button"` instead.

---

### ~~11. Space Key Handling for Anchor Buttons~~ ✅ RESOLVED

**Status:** Fixed — Added `(keydown.space)` host binding that triggers click on anchor elements.

**Implementation:** Uses Angular's host binding syntax to handle Space key only on anchor elements:

```typescript
host: {
  '(keydown.space)': 'isAnchor && handleSpaceKey($event)',
}

protected handleSpaceKey(event: Event): void {
  // Prevent page scroll (Space's default behavior)
  event.preventDefault();

  // Only trigger click if not soft-disabled
  if (!this.softDisabled()) {
    (event.target as HTMLElement).click();
  }
}
```

**Key features:**

- Only applies to anchor elements (`isAnchor` check in host binding)
- Always prevents default to stop page scroll (per WAI-ARIA)
- Respects `softDisabled` state
- Zero overhead for native `<button>` elements (they handle Space natively)

**Test Coverage:** `AnchorSpaceKeyActivation` story verifies Space key activation on normal anchors and prevention on soft-disabled anchors.

---

## Test Coverage Observations

### Passing Tests

All 18 Button Storybook interaction tests pass:

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
- SoftDisabledClickPrevention _(added 2025-12-29)_
- AnchorSpaceKeyActivation _(added 2025-12-29)_
- BooleanAttributeSyntax _(added 2025-12-30)_
- ResponsiveExpanded _(added 2025-12-30)_
- ExpandedInputSyntax _(added 2025-12-30)_
- DynamicInputChanges _(added 2025-12-30)_

### Missing Test Coverage

1. ~~**Click prevention for `softDisabled`**~~ ✅ Now tested in `SoftDisabledClickPrevention`
2. ~~**Form submission prevention**~~ ✅ Now tested in `SoftDisabledClickPrevention`
3. ~~**Space key on anchor buttons**~~ ✅ Now tested in `AnchorSpaceKeyActivation`
4. ~~**Dynamic input changes**~~ ✅ Now tested in `DynamicInputChanges`

---

## Summary

| Category             | Count | Resolved |
| -------------------- | ----- | -------- |
| Critical Issues      | 3     | 3 ✅     |
| Missing Features     | 2     | 1 ✅     |
| Documentation Issues | 2     | 2 ✅     |
| Suggestions          | 3     | 2 ✅     |

### Priority Fixes

1. ~~**[Critical]** Add click prevention for `softDisabled` buttons~~ ✅ DONE
2. ~~**[Medium]** Add Space key handling for anchor buttons with `role="button"`~~ ✅ DONE
3. ~~**[Low]** Add `booleanAttribute` transforms for boolean inputs~~ ✅ DONE
4. ~~**[Low]** Add responsive expanded breakpoint support~~ ✅ DONE

---

_Review conducted: 2025-12-28_
_Last updated: 2025-12-30 (marked .submit class as N/A)_
_Reviewed against: BUTTON_API_DESIGN.md, Foundation for Sites 6.9.0_
