# Research: Button Component

**Feature**: Accessible Button Component  
**Date**: 2026-01-06  
**Status**: Complete

## Overview

This document consolidates research findings for implementing the Button component in ngx-foundation-sites. All technical unknowns from the plan's Technical Context have been resolved through analysis of the existing implementation, Foundation for Sites documentation, and Angular best practices.

## Technical Context Findings

### Language/Version

**Decision**: Angular 21.0.6, TypeScript 5.9.2  
**Rationale**: Found in `package.json` - using latest stable Angular with modern features (signals, new control flow, standalone components)  
**Alternatives considered**: N/A - project already established

### Primary Dependencies

**Decision**: 
- `@angular/core` ~21.0.6
- `@angular/aria` ~21.0.5 (available for accessibility primitives)
- `@angular/cdk` ~21.0.5 (available if needed)
- `foundation-sites` ~6.9.0 (CSS only)

**Rationale**: Button component is foundational and requires minimal dependencies. Existing implementation shows no need for ARIA or CDK - the button pattern is simple enough for native implementation.

**Alternatives considered**: None - dependencies align with constitution requirements.

### Testing Framework

**Decision**: Vitest 4.0.9 for unit tests, Storybook 10.1.10 with interaction tests, Playwright 1.36.0 for e2e  
**Rationale**: Constitution mandates Storybook-first testing. Existing `button.stories.ts` shows Storybook is already set up.  
**Alternatives considered**: Jest - but project uses Vitest as shown in `package.json`

### Target Platform

**Decision**: Web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)  
**Rationale**: Angular web application, Foundation targets standard web browsers  
**Alternatives considered**: N/A - web-only project

### Performance Goals

**Decision**: 
- Minimal bundle size (<2KB gzipped for component logic)
- Zero runtime overhead for non-soft-disabled buttons
- OnPush change detection for optimal rendering
- Reference-counted style loading

**Rationale**: Button is a frequently-used primitive. Existing implementation demonstrates these optimizations:
- Click listener only added when `softDisabled=true` (zero overhead otherwise)
- Style loading via `NfsStyleLoader` with reference counting
- OnPush change detection strategy

**Alternatives considered**: Always-on click listener - rejected due to unnecessary overhead

### Scale/Scope

**Decision**: Foundation-level component used across entire application  
**Rationale**: Buttons are core UI primitives. Will be used in every feature.  
**Alternatives considered**: N/A

## Architecture Decisions

### 1. Component vs. Directive

**Decision**: Component with attribute selector (`button[nfsButton], a[nfsButton]`)  
**Rationale**: 
- Enables style loading via component metadata (styleUrl, encapsulation)
- Maintains attribute-selector syntax for native element integration
- Preserves accessibility (native button/anchor semantics)

**Alternatives considered**:
- Directive: Would work but complicates style loading (needs manual style injection)
- Custom element: Would break native accessibility semantics

**Reference**: Existing implementation uses this pattern successfully

### 2. Anchor Element Semantics

**Decision**: Conditional button pattern based on `href` presence
- Anchors WITH `href`: Keep native link semantics (no role override)
- Anchors WITHOUT `href`: Apply button pattern (`role="button"`, `tabindex="0"`, Space activation)

**Rationale**: 
- WAI-ARIA APG: Don't override native semantics when appropriate
- Links should be links, buttons should be buttons
- Anchors without href are not inherently actionable, so button pattern is appropriate

**Alternatives considered**:
- Always apply `role="button"` to anchors: Rejected - confuses screen reader users when href is present
- Never apply `role="button"`: Rejected - anchors without href have no semantic meaning

**References**: 
- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- Existing implementation follows this pattern correctly

### 3. Soft-Disabled Implementation

**Decision**: Use capture-phase click prevention with reactive listener attachment
- Add listener only when `softDisabled` changes to `true`
- Use capture phase to intercept before Angular event bindings
- Run outside NgZone for zero change detection overhead

**Rationale**:
- Most buttons are never soft-disabled, so zero overhead is critical
- Capture phase prevents all click handlers, including Angular's
- Running outside NgZone avoids unnecessary change detection cycles

**Alternatives considered**:
- Always-on click listener: Rejected - adds overhead to every button instance
- Template-level click handler: Rejected - doesn't prevent other click handlers

**Reference**: Existing implementation demonstrates this pattern effectively

### 4. Responsive Expanded Breakpoints

**Decision**: Support Foundation's full responsive expanded API via custom transform
- Accept boolean values via `booleanAttribute` transform
- Accept breakpoint strings as-is (bypassing `booleanAttribute`)
- Generate host bindings for each breakpoint class

**Rationale**:
- Foundation provides these classes out-of-box: `.small-only-expanded`, `.medium-expanded`, etc.
- Constitution requires shipping library CSS with responsive-expanded selectors enabled
- Custom transform allows both `[expanded]="true"` and `expanded="medium"` syntax

**Alternatives considered**:
- Boolean-only: Rejected - loses Foundation's responsive capabilities
- Separate input per breakpoint: Rejected - poor DX, verbose API

**Reference**: Foundation docs: https://get.foundation/sites/docs/button.html#responsive-expanded

## Accessibility Research

### 1. Button Pattern Requirements (WAI-ARIA APG)

**Findings**:
- Native `<button>` elements: No ARIA needed (implicit role)
- Anchors with `href`: Keep link semantics, don't override
- Anchors without `href`: Requires button pattern
  - `role="button"`
  - `tabindex="0"` (make focusable)
  - Space key activation (in addition to Enter)

**Implementation**: Existing code correctly implements these patterns

**Reference**: https://www.w3.org/WAI/ARIA/apg/patterns/button/

### 2. Disabled State Accessibility

**Findings**:
- Native `disabled`: Not focusable, not announced, no tooltip support
- `aria-disabled="true"`: Remains focusable, announced as disabled, supports tooltips
- For anchors: `aria-disabled` should also set `tabindex="-1"` to prevent activation

**Implementation**: Existing code correctly implements soft-disabled with:
- `aria-disabled="true"` attribute
- `.disabled` class for visual styling
- Capture-phase click prevention
- `tabindex="-1"` for soft-disabled anchors

**Reference**: 
- https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls
- https://inclusive-components.design/buttons/

### 3. AXE Compliance

**Findings**: Button component must pass these AXE rules:
- `button-name`: Buttons must have accessible text
- `color-contrast`: Minimum 4.5:1 for normal text
- `focus-visible`: Focus indicators must be visible

**Implementation Strategy**:
- Button text: Responsibility of consumer (we don't enforce `aria-label`)
- Color contrast: Foundation Sass variables (consumer configuration)
- Focus indicators: Foundation provides via `:focus` styles

## Foundation for Sites Research

### 1. Button CSS Classes

**Finding**: Foundation provides these classes (from docs and CSS source):

**Base**:
- `.button` - Required base class

**Size**:
- `.tiny` - Extra small button
- `.small` - Small button
- (no class) - Default size
- `.large` - Large button

**Color**:
- `.primary` - Primary brand color
- `.secondary` - Secondary/neutral color
- `.success` - Success/positive action
- `.alert` - Destructive action
- `.warning` - Warning/caution action

**Fill**:
- (no class) - Solid fill (default)
- `.hollow` - Outline/border only
- `.clear` - Text only

**Expanded**:
- `.expanded` - Always full-width
- `.small-only-expanded` - Full-width only on small
- `.medium-only-expanded` - Full-width only on medium
- `.large-only-expanded` - Full-width only on large
- `.medium-expanded` - Full-width on medium and larger
- `.large-expanded` - Full-width on large and larger
- `.medium-down-expanded` - Full-width on medium and smaller
- `.large-down-expanded` - Full-width on large and smaller

**State**:
- `.disabled` - Disabled appearance

**Rationale**: Use Foundation's classes as-is - no custom CSS needed

**Reference**: https://get.foundation/sites/docs/button.html

### 2. Responsive Expanded CSS Generation

**Finding**: Foundation generates responsive-expanded classes via Sass mixin when `$button-responsive-expanded: true`

**Implementation Status**: 
- Library default is `true` (per constitution constraint)
- Classes are generated in Foundation's button Sass
- No custom CSS needed from Angular

**Reference**: Foundation source: `scss/components/_button.scss`

### 3. Explicitly OUT OF SCOPE

**Finding**: Foundation provides these button-related features:

**OUT OF SCOPE (per user constraints)**:
- `.dropdown` class - For dropdown toggle buttons (requires dropdown component)
- `.arrow-only` class - For dropdown arrows without text

**Rationale**: These are dropdown-specific features, not general button features. Will be implemented when dropdown component is created.

**Reference**: Foundation docs section on dropdown buttons

## Angular Best Practices Research

### 1. Signals for Reactive Inputs

**Decision**: Use `input()` function for all component inputs  
**Rationale**: 
- Constitution mandates modern Angular APIs
- Signals provide fine-grained reactivity
- Better performance than decorator-based inputs with OnPush

**Implementation**: Existing code uses signals correctly:
```typescript
readonly size = input<'tiny' | 'small' | 'default' | 'large'>('default');
readonly color = input<'primary' | 'secondary' | 'success' | 'alert' | 'warning'>('primary');
// etc.
```

**Reference**: Angular docs on signal inputs

### 2. Host Bindings via host Object

**Decision**: Use `host` object in `@Component` decorator, not `@HostBinding`  
**Rationale**:
- Constitution forbids `@HostBinding`/`@HostListener` decorators
- `host` object is more declarative and easier to read
- Better tree-shaking and bundle size

**Implementation**: Existing code demonstrates this pattern correctly

**Reference**: Angular best practices

### 3. SSR-Safe Style Loading

**Decision**: Use `afterNextRender()` for style loading  
**Rationale**:
- SSR doesn't have DOM, so style injection must be browser-only
- `afterNextRender()` only runs in browser context
- Reference-counted loading prevents duplicate style tags

**Implementation**: Existing code uses this pattern:
```typescript
afterNextRender(() => {
  this.#styleLoader.load('button', '/nfs-button.css');
});
```

**Reference**: Angular SSR docs

### 4. Member Visibility Guidelines

**Decision**: Follow constitution visibility rules:
- `#` prefix for private fields not accessed by template
- `protected` for template-accessed members
- public (no modifier) for component API

**Implementation**: Existing code follows this pattern correctly

**Reference**: Constitution section IV

## Testing Strategy Research

### 1. Storybook Interaction Tests

**Decision**: Primary testing via Storybook play functions  
**Rationale**:
- Constitution mandates Storybook-first testing
- Tests double as documentation
- Real browser environment catches more issues

**Stories to implement**:
1. Basic buttons (all sizes, colors, fills)
2. Anchor buttons (with/without href)
3. Expanded buttons (boolean and responsive)
4. Disabled states (native and soft)
5. Keyboard navigation
6. Accessibility (AXE checks)

**Reference**: Constitution section V, existing accordion stories as examples

### 2. E2E Tests (Minimal)

**Decision**: E2E tests only for CSS validation in test consumer app  
**Rationale**:
- Verify Foundation Sass variables compile correctly
- Verify responsive-expanded classes are present in shipped CSS
- Verify button styles render correctly

**Out of scope for E2E**: 
- User interactions (covered by Storybook)
- Component logic (covered by unit tests if needed)

**Reference**: Constitution section V

### 3. Unit Tests (Minimal/None)

**Decision**: No unit tests needed for button component  
**Rationale**:
- No complex logic to test (just class bindings and event handlers)
- Storybook interaction tests cover all behaviors
- Unit tests would duplicate Storybook coverage

**Reference**: Constitution section V (unit tests only for pure functions)

## Risk Analysis

### Risk 1: Foundation CSS Not Loaded

**Impact**: Buttons render unstyled  
**Mitigation**: `NfsStyleLoader` service handles runtime CSS injection with reference counting  
**Status**: Implemented correctly in existing code

### Risk 2: Responsive Expanded Classes Not Generated

**Impact**: Breakpoint-specific expanded classes don't work  
**Mitigation**: Constitution requires `$button-responsive-expanded: true` by default  
**Validation**: E2E tests in consumer app verify CSS includes these classes  
**Status**: Handled by Foundation Sass configuration

### Risk 3: Anchor Button Activation Inconsistency

**Impact**: Space key doesn't work on anchor buttons  
**Mitigation**: Explicit Space key handler for anchors without href  
**Status**: Implemented correctly in existing code

### Risk 4: Soft-Disabled Performance Impact

**Impact**: Click listener overhead on every button  
**Mitigation**: Reactive listener attachment (only when soft-disabled)  
**Status**: Implemented with zero overhead for non-soft-disabled buttons

## Conclusion

All technical unknowns have been resolved. The existing implementation demonstrates:
- Correct architecture decisions
- Full accessibility compliance
- Optimal performance patterns
- Constitution-compliant modern Angular usage

No architectural changes or additional research needed. Ready to proceed to Phase 1 (design artifacts).
