# Feature Specification: Accessible Button Component

**Feature Branch**: `feat/button`  
**Created**: 2026-01-06  
**Updated**: 2026-01-07  
**Status**: Final  
**Input**: User description: "Finalize the accessible, self-contained Button component in the current branch. An Angular-native Button component aligned with Foundation for Sites CSS-only approach. Must be accessible (WCAG AA, passes AXE). Self-contained: no dependency on Foundation JS; uses Foundation Sass styles/classes. Use modern Angular patterns: standalone (default), OnPush, input()/output(), signals; no HostBinding/HostListener."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Basic Button Usage (Priority: P1)

Developers need to create standard interactive buttons (submit, cancel, actions) with minimal markup that follow Foundation's visual design system.

**Why this priority**: Core functionality - every application needs basic buttons. This is the minimum viable product.

**Independent Test**: Can be fully tested by rendering buttons with different text content and colors, verifying Foundation classes are applied, and confirming click events fire correctly.

**Acceptance Scenarios**:

1. **Given** a `<button>` element with the `nfsButton` attribute, **When** the page renders, **Then** the Foundation `.button` class is applied and the button appears with Foundation's default styling.
2. **Given** a button with `nfsButton color="success"`, **When** the page renders, **Then** the button displays with the success color (Foundation's `.success` class).
3. **Given** a button with `nfsButton`, **When** a user clicks it, **Then** the Angular click handler executes normally.
4. **Given** a `<button nfsButton>` where the Foundation button CSS fails to load, **When** a user clicks it, **Then** the button remains functional (native semantics + click handler) but may appear unstyled.

---

### User Story 2 - Anchor Buttons (Priority: P1)

Developers need to use native `<a>` elements styled as Foundation buttons.

- When the anchor **has an `href`**, it is a **link** (navigation) and MUST keep native link semantics.
- When the anchor **does not have an `href`**, it is treated as a **button-like action control** and MUST follow the WAI-ARIA button pattern.

**Why this priority**: Styling links as buttons is common, but semantics must remain correct to avoid confusing screen reader users.

**Independent Test**: Can be tested by rendering anchors both with and without `href`, verifying:

- With `href`: role remains link, no `role="button"` is applied
- Without `href`: `role="button"` + `tabindex="0"` are applied and Space activates

**Acceptance Scenarios**:

1. **Given** an `<a nfsButton>` with an `href`, **When** the page renders, **Then** it does NOT receive `role="button"` and remains a link.
2. **Given** an `<a nfsButton>` without an `href`, **When** the page renders, **Then** it receives `role="button"` and `tabindex="0"`.
3. **Given** an anchor button (no `href`) with focus, **When** the user presses Space, **Then** the anchor is activated (same as clicking).

---

### User Story 3 - Size Variants (Priority: P2)

Developers need to create buttons in different sizes (tiny, small, default, large, expanded) to match their UI hierarchy and responsive design needs.

**Why this priority**: Important for visual hierarchy and responsive layouts, but buttons can function with default size.

**Independent Test**: Can be tested by rendering buttons with each size variant and verifying the correct Foundation CSS classes are applied (`.tiny`, `.small`, `.large`, `.expanded`).

**Acceptance Scenarios**:

1. **Given** a button with `size="tiny"`, **When** the page renders, **Then** the Foundation `.tiny` class is applied.
2. **Given** a button with `[expanded]="true"`, **When** the page renders, **Then** the button spans full width with the `.expanded` class.
3. **Given** a button with `expanded="medium"`, **When** viewed on a medium or larger viewport, **Then** the button expands to full width with the `.medium-expanded` class.

---

### User Story 4 - Disabled States (Priority: P2)

Developers need both hard-disabled (not focusable) and soft-disabled ("aria-disabled") buttons to support different UX patterns like showing tooltips on disabled buttons. For native `<button>` elements, soft-disabled remains focusable; for `<a>` elements, soft-disabled is removed from the tab order to prevent keyboard activation.

**Why this priority**: Essential for form validation feedback and tooltip accessibility, but basic button functionality works without it.

**Independent Test**: Can be tested by rendering buttons with `disabled` attribute and `[softDisabled]="true"`, verifying focus behavior, click prevention, and ARIA attributes.

**Acceptance Scenarios**:

1. **Given** a button with the native `disabled` attribute, **When** a user tabs through the page, **Then** the button is skipped in tab order (not focusable).
2. **Given** a button with `[softDisabled]="true"`, **When** a user tabs through the page, **Then** the button receives focus and has `aria-disabled="true"`.
3. **Given** a soft-disabled button with focus, **When** the user clicks it, **Then** the click event is prevented and no action occurs.
4. **Given** a soft-disabled anchor button, **When** a user tabs through the page, **Then** the anchor has `aria-disabled="true"` and `tabindex="-1"` and is skipped.

---

### User Story 5 - Fill Style Variants (Priority: P3)

Developers need hollow (outline) and clear (text-only) button styles to create visual hierarchy and secondary actions without adding color noise.

**Why this priority**: Nice-to-have for advanced styling. Solid buttons cover most use cases.

**Independent Test**: Can be tested by rendering buttons with `fill="hollow"` and `fill="clear"`, verifying the correct Foundation classes (`.hollow`, `.clear`) are applied.

**Acceptance Scenarios**:

1. **Given** a button with `fill="hollow"`, **When** the page renders, **Then** the Foundation `.hollow` class is applied showing an outline style.
2. **Given** a button with `fill="clear"`, **When** the page renders, **Then** the Foundation `.clear` class is applied showing text-only style.

---

### User Story 6 - Keyboard Navigation (Priority: P1)

Users navigating with keyboard need to access all buttons, activate them with Enter/Space, and receive proper focus indicators.

**Why this priority**: Required for WCAG AA compliance and usability for keyboard-only users.

**Independent Test**: Can be tested by focusing buttons with Tab, activating with Enter/Space, and verifying focus styles are visible.

**Acceptance Scenarios**:

1. **Given** buttons on a page, **When** a user presses Tab, **Then** focus moves between buttons in DOM order.
2. **Given** a focused `<button>` element, **When** the user presses Enter or Space, **Then** the button is activated.
3. **Given** a focused anchor button, **When** the user presses Space, **Then** the link is activated (matching native button behavior).

---

### Edge Cases

- **What happens when both `disabled` and `softDisabled` are set?** Native `disabled` takes precedence; element is not focusable.
- **What happens when `softDisabled` changes from `true` to `false` dynamically?** Click listener is removed reactively; button becomes clickable immediately.
- **What happens when an anchor button has `softDisabled="true"` but no `href`?** Component still applies `aria-disabled="true"` and `tabindex="-1"` consistently.
- **What happens when invalid `expanded` breakpoint string is provided?** Value is normalized by the `expanded` input transform: known breakpoint strings (`'small-only'`, `'medium'`, etc.) are preserved; all other values are delegated to `booleanAttribute` (so arbitrary strings like `"foo"` are treated as `true`, except the literal string `"false"` which is treated as `false`).
- **What happens when multiple color classes are set (e.g., changing from primary to success)?** Angular's host bindings reactively update; old class removed, new class applied.
- **What happens with icon-only buttons?** Developer must provide `aria-label` manually; component doesn't enforce this (allows flexibility).
- **What happens when Foundation button CSS fails to load?** Component MUST remain functional (native semantics + events) but may render unstyled until CSS is available.
- **What happens with empty button content?** Allowed, but developer is responsible for ensuring an accessible name (e.g., text content or `aria-label`).
- **What happens with rapid repeated clicks while `softDisabled` is true?** Click prevention still applies; all clicks are prevented while `softDisabled` is true.
- **What happens when `softDisabled` changes while the element is focused?** Component MUST NOT forcibly blur; focus may remain, and anchors may be removed from tab order when `softDisabled` becomes true.
- **What happens when the component is destroyed before runtime styles finish loading?** No errors; style loading MUST remain reference-counted and MUST NOT leak `<link>` elements.
- **What happens if `nfsButton` is applied to an unsupported host element?** Unsupported: selector only targets `button[nfsButton]` and `a[nfsButton]` (other elements will not instantiate the component).

## Requirements _(mandatory)_

> **Note**: This spec defines required observable behavior; design/implementation decisions belong in plan.md and contracts/\*.md.

### Functional Requirements

- **FR-001**: Component MUST apply the Foundation `.button` class to all elements with the `nfsButton` attribute.
- **FR-002**: Component MUST support both `<button>` and `<a>` element hosts using an attribute selector.
- **FR-003**: Component MUST support size variants: `tiny`, `small`, `default` (no class), `large`.
- **FR-004**: Component MUST support color variants: `primary`, `secondary`, `success`, `alert`, `warning`.
- **FR-005**: Component MUST support fill style variants: `solid` (default, no class), `hollow`, `clear`.
- **FR-006**: Component MUST support expanded (full-width) behavior with boolean or responsive breakpoint values.
- **FR-007**: Component MUST support responsive-expanded breakpoints: `small-only`, `medium-only`, `large-only`, `medium`, `large`, `medium-down`, `large-down`.
- **FR-008**: Component MUST support soft-disabled state via `softDisabled` input with `aria-disabled="true"`.
- **FR-009**: Component MUST prevent click events when `softDisabled` is `true` using capture-phase event prevention.
- **FR-010**: Anchors WITH `href` MUST keep native link semantics (MUST NOT apply `role="button"`).
- **FR-011**: Anchors WITHOUT `href` MUST receive `role="button"` and `tabindex="0"`.
- **FR-012**: Anchors WITHOUT `href` MUST respond to Space key activation (in addition to Enter key).
- **FR-013**: Soft-disabled anchor elements MUST have `tabindex="-1"` to prevent keyboard focus.
- **FR-014**: Component MUST use Foundation's CSS classes without modification (no custom button styling).
- **FR-015**: Component MUST load Foundation button styles on first render and unload on destroy.
- **FR-016**: Component MUST use signals for all reactive state (`size()`, `color()`, `fill()`, `expanded()`, `softDisabled()`).
- **FR-017**: Component MUST use `booleanAttribute` transform for `softDisabled`, and a custom transform for `expanded` that accepts breakpoint strings and otherwise delegates to `booleanAttribute` (to support HTML attribute syntax).
- **FR-018**: Component MUST NOT implement Foundation's `.dropdown` or `.arrow-only` button variants (these are dropdown-specific and out of scope for the base button component).
- **FR-019**: Shipped library CSS MUST be compiled with `$button-responsive-expanded: true` so responsive-expanded selectors (e.g. `.small-only-expanded`, `.medium-expanded`, `.medium-down-expanded`, `.large-down-expanded`) exist at runtime.
- **FR-020**: If runtime CSS cannot be loaded (e.g., missing `/nfs-button.css`), component MUST remain functional (native semantics + events), MUST NOT throw, and MAY log a warning (but MUST NOT spam logs on repeated renders).
- **FR-021**: Inputs `size`, `color`, `fill`, and `expanded` MUST be composable; all applicable Foundation classes MUST be applied concurrently (no precedence conflicts).

### Accessibility Requirements (MANDATORY)

- **AR-001**: Component MUST pass all AXE accessibility checks with zero violations.
- **AR-002**: Component MUST meet WCAG AA standards for color contrast (Foundation provides this via Sass configuration).
- **AR-003**: All button elements MUST be keyboard accessible (Tab to focus, Enter/Space to activate).
- **AR-004**: Anchor buttons (anchors without `href`) MUST include `role="button"` to communicate button semantics.
- **AR-005**: Soft-disabled `<button>` elements MUST use `aria-disabled="true"` instead of native `disabled` to remain focusable.
- **AR-006**: Soft-disabled anchors MUST have `tabindex="-1"` to prevent focus while maintaining `aria-disabled="true"`.
- **AR-007**: Component MUST provide visible focus indicators (Foundation's `:focus` styles).
- **AR-008**: Icon-only buttons MUST have `aria-label` provided by the developer (component does not enforce this).
- **AR-009**: Component MUST preserve standard semantics such that it works with common assistive technologies beyond screen readers (e.g., voice control, switch control).
- **AR-010**: When `softDisabled` changes dynamically, component MUST NOT trap focus or forcibly blur; focus behavior MUST remain predictable for keyboard and assistive tech users.
- **AR-011**: In high contrast / forced-colors modes, component MUST remain functional and keyboard accessible; no custom CSS should reduce usability.

### Component API Requirements

- **CA-001**: Component MUST use standalone architecture (no NgModules).
- **CA-002**: Component inputs MUST use `input()` function: `size`, `color`, `fill`, `expanded`, `softDisabled`.
- **CA-003**: Component MUST NOT use `output()` functions (no custom events; relies on native events).
- **CA-004**: Component state MUST use signals for all reactive inputs.
- **CA-005**: Component MUST use `ChangeDetectionStrategy.OnPush`.
- **CA-006**: Component MUST use attribute selector: `button[nfsButton], a[nfsButton]`.
- **CA-007**: Component MUST NOT use `@HostBinding` or `@HostListener` decorators (use `host` object).
- **CA-008**: Component MUST inject dependencies via `inject()` function, not constructor injection.
- **CA-009**: Component MUST load/unload runtime styles in a browser-only, SSR-safe way (no DOM access during SSR).
- **CA-010**: Component MUST prevent click events for `softDisabled` in an SSR-safe way and update reactively when `softDisabled` changes.
- **CA-011**: Component MUST use `#` prefix for private fields not accessed by template.
- **CA-012**: Component MUST use `protected` visibility for template-accessed members.

### Non-Functional Requirements (Performance)

- **PR-001**: Component MUST scale to many instances with minimal overhead (no per-instance global listeners; `softDisabled` prevention only when enabled; style loading is reference-counted).

### Security Requirements

- **SR-001**: Component MUST NOT render unsanitized HTML (button content is projected; no `innerHTML`).
- **SR-002**: Component MUST NOT rewrite or bypass Angular sanitization for `href`; consumers MUST avoid unsafe protocols (e.g. `javascript:`) and rely on Angular/router sanitation.
- **SR-003**: Clickjacking protection is out of scope for the component and MUST be handled at the application level (e.g., CSP `frame-ancestors` / X-Frame-Options).

### Key Entities _(N/A - no data model)_

This component is purely presentational and does not involve data entities.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can create a functional button with 1 line of markup: `<button nfsButton>Text</button>`.
- **SC-002**: Component passes 100% of AXE accessibility checks in Storybook interaction tests.
- **SC-003**: Keyboard users can navigate to and activate all buttons using only Tab, Enter, and Space keys.
- **SC-004**: Soft-disabled `<button>` elements remain focusable for screen reader users (verified by `aria-disabled` presence and focus test).
- **SC-005**: Anchor buttons respond identically to native buttons for Space key activation.
- **SC-006**: All Foundation button CSS classes (`.button`, `.tiny`, `.small`, `.large`, `.expanded`, `.primary`, `.secondary`, `.success`, `.alert`, `.warning`, `.hollow`, `.clear`) are applied correctly based on input values.
- **SC-007**: Responsive expanded classes are applied at correct breakpoints (`.small-only-expanded`, `.medium-expanded`, etc.).
- **SC-008**: Component bundle size <2KB gzipped (no Foundation JavaScript included).
- **SC-009**: Component works correctly in both CSR (client-side rendering) and SSR (server-side rendering) contexts.
- **SC-010**: Component supports dynamic input changes with reactive updates (changing `color` from `primary` to `success` updates classes immediately).
- **SC-011**: Component does not implement out-of-scope Foundation variants (e.g., `.dropdown`, `.arrow-only`) and does not apply dropdown-specific behaviors.
- **SC-012**: Responsive expanded selectors exist at runtime (compiled with `$button-responsive-expanded: true`) and can be validated via CSS/E2E.
- **SC-013**: All acceptance scenarios are validated via Storybook interaction tests (unit tests optional).

## Traceability _(recommended)_

### Functional Requirements → User Stories

| User Story              | Requirements                                   |
| ----------------------- | ---------------------------------------------- |
| US1 Basic Button Usage  | FR-001, FR-004, FR-014, FR-020; SC-001         |
| US2 Anchor Buttons      | FR-002, FR-010..FR-013; AR-004                 |
| US3 Size Variants       | FR-003, FR-006, FR-007, FR-019, FR-021         |
| US4 Disabled States     | FR-008, FR-009, FR-013; AR-005, AR-006, AR-010 |
| US5 Fill Styles         | FR-005                                         |
| US6 Keyboard Navigation | AR-003, AR-007; FR-012                         |

### Accessibility Requirements → Standards

| Requirement                                 | Standards                                                            |
| ------------------------------------------- | -------------------------------------------------------------------- |
| AR-002 (contrast)                           | WCAG 2.1: 1.4.3 Contrast (Minimum) (delegated to Foundation theming) |
| AR-003 (keyboard)                           | WCAG 2.1: 2.1.1 Keyboard                                             |
| AR-004 (role for anchor-buttons)            | WAI-ARIA APG Button Pattern + WCAG 2.1: 4.1.2 Name, Role, Value      |
| AR-005/AR-006 (aria-disabled + focus rules) | WAI-ARIA APG Button Pattern                                          |
| AR-007 (focus visible)                      | WCAG 2.1: 2.4.7 Focus Visible                                        |
| AR-008 (accessible name for icon-only)      | WCAG 2.1: 4.1.2 Name, Role, Value                                    |
| AR-009 (broader AT)                         | WCAG 2.1: 4.1.2 Name, Role, Value                                    |
| AR-011 (forced-colors)                      | WCAG 2.1: 1.4.11 Non-text Contrast (practical validation)            |

**Reference**: https://www.w3.org/WAI/ARIA/apg/patterns/button/
