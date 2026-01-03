# Phase 3: Advanced Features ✅

**Goal:** Implement all Foundation Accordion features.

## 3.1 Animation Support (slide-speed) ✅

Used Angular v21's native CSS animation with `animate.enter`/`animate.leave` instead of `@angular/animations`:

**Implementation:**

- CSS Grid animation using `grid-template-rows: 0fr → 1fr` with `@starting-style`
- Sass variable `$nfs-accordion-slide-speed` for configurable duration (default: `250ms`)
- Compile-time configuration via Sass variables aligns with Foundation 6 architecture

## 3.2 Deep Linking Support ✅

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion-deep-link.service.ts`

Service provides:

- `getHashPanelId()` - Read panel ID from URL hash
- `updateHash()` - Update URL hash with `pushState` or `replaceState`
- `clearHash()` - Clear URL hash
- `scrollToPanel()` - Scroll to panel after delay
- `onHashChange()` - Listen for browser back/forward navigation

## 3.3 Deep Link Smudge (Scroll Adjustment) ✅

Implemented in `AccordionDeepLinkService.scrollToPanel()` with configurable delay.

## 3.4 Update Accordion with Deep Link Inputs ✅

**Inputs added to `NfsAccordion`:**

```typescript
readonly deepLink = input(false);
readonly deepLinkSmudge = input(false);
readonly deepLinkSmudgeDelay = input(300);
readonly updateHistory = input(false);
```

**Story added:** `DeepLink`

## 3.5 Allow All Closed Support ✅

**Goal:** Implement Foundation's `allowAllClosed` behavior (by default, at least one panel must be open).

**Implementation:**

- Added `allowAllClosed` input (default: `false`)
- Effect watches expansion state and re-opens last expanded panel when all close
- Uses `queueMicrotask` to write signals outside effect context
- Skips enforcement when accordion group is disabled
- `allowSignalWrites: true` option on effect

**Story added:** `RequireOneOpen`

## Implementation Notes

**Adjustments made during implementation:**

1. **Animation approach**: Used Angular v21's native `animate.enter`/`animate.leave` with CSS Grid animation instead of `@angular/animations` (which is deprecated)

2. **Deep linking in Storybook**: Cannot be reliably tested in Storybook interaction tests due to iframe context - added E2E test plan for Phase 5.3

3. **allowAllClosed timing**: Required careful signal management with `queueMicrotask` and `allowSignalWrites: true` to properly enforce the constraint

4. **Disabled accordion handling**: Added check to skip `allowAllClosed` enforcement when the accordion group is disabled
