# Accordion Component Implementation Plan

## Overview

This plan implements the Foundation for Sites Accordion component using Angular ARIA directives as the primary building block, with Foundation's CSS styling.

## References

- [Foundation for Sites Accordion Docs](https://get.foundation/sites/docs/accordion.html)
- [Angular ARIA Accordion](https://angular.dev/api/aria/accordion/AccordionGroup)
- [LayZeeDK/ngx-foundation-sites styling pattern](https://github.com/LayZeeDK/ngx-foundation-sites)

---

## Phase 0: Foundation Styles Infrastructure ✅

**Goal:** Set up global Foundation styles for Storybook that work for both dev server and static build.

### 0.1 Create Global Foundation Settings ✅

**File:** `packages/ngx-foundation-sites/src/lib/_foundation-settings.scss`

```scss
// Global Foundation for Sites settings
// Override Foundation defaults with CSS custom properties for theming

@use 'foundation-sites/scss/settings' as foundation-settings;

// Text direction
$global-text-direction: ltr !default;

// Layout
$global-flexbox: true !default;

// Colors - use CSS custom properties for theming
$foundation-palette: (
  primary: #1779ba,
  secondary: #767676,
  success: #3adb76,
  warning: #ffae00,
  alert: #cc4b37,
) !default;
```

### 0.2 Create Foundation Components Mixin ✅

**File:** `packages/ngx-foundation-sites/src/lib/_foundation-components.scss`

```scss
// Foundation component includes for global styles
@use 'foundation-sites/scss/foundation';

@mixin foundation-global-styles {
  @include foundation.foundation-global-styles;
  @include foundation.foundation-typography;
  @include foundation.foundation-forms;
  @include foundation.foundation-button;
  // Add more global components as needed
}
```

### 0.3 Create Storybook Global Styles ✅

**File:** `packages/ngx-foundation-sites/src/storybook/styles.scss`

```scss
@use '../lib/foundation-settings' as settings;
@use '../lib/foundation-components' as components;
@use 'foundation-sites/scss/util/util';

// Include global Foundation styles
@include components.foundation-global-styles;

// CSS Custom Properties for theming (nfs- prefix)
:root {
  --nfs-primary-color: #{map-get(settings.$foundation-palette, primary)};
  --nfs-secondary-color: #{map-get(settings.$foundation-palette, secondary)};
  --nfs-success-color: #{map-get(settings.$foundation-palette, success)};
  --nfs-warning-color: #{map-get(settings.$foundation-palette, warning)};
  --nfs-alert-color: #{map-get(settings.$foundation-palette, alert)};
}
```

### 0.4 Configure Storybook to Load Styles ✅

**File:** `packages/ngx-foundation-sites/project.json`

Add `styles` option to both `storybook` and `build-storybook` targets:

```json
{
  "storybook": {
    "options": {
      "styles": ["packages/ngx-foundation-sites/src/storybook/styles.scss"]
    }
  },
  "build-storybook": {
    "options": {
      "styles": ["packages/ngx-foundation-sites/src/storybook/styles.scss"]
    }
  }
}
```

### 0.5 Update Storybook Preview (Optional Decorators) ✅

**File:** `packages/ngx-foundation-sites/.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/angular';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
  },
};

export default preview;
```

### Phase 0 Implementation Notes

**Adjustments made during implementation:**

1. **Sass module syntax**: Used `@use 'sass:map'` and `map.get()` instead of deprecated `map-get()` global function (required for Dart Sass 3.0 compatibility)

2. **Simplified settings file**: Removed unused `@use 'foundation-sites/scss/settings'` import - only the custom variables are needed

3. **Foundation version**: Using `foundation-sites` v6.9.0

**Actual file contents differ slightly from plan examples** - see committed files for accurate implementation.

---

## Phase 1: Core Accordion Implementation ✅

**Goal:** Implement basic accordion with expand/collapse using @angular/aria.

### 1.1 Create Accordion Directory Structure

```
src/lib/accordion/
├── index.ts                      # Public API exports
├── accordion.ts                  # AccordionGroup wrapper
├── accordion-item.ts             # AccordionItem wrapper
├── accordion-trigger.ts          # Trigger directive/component
├── accordion-panel.ts            # Panel directive/component
├── accordion-content.ts          # Lazy content directive
├── _foundation-accordion-settings.scss  # Component settings
├── accordion.component.scss      # Component styles (optional)
└── accordion.stories.ts          # Storybook stories
```

### 1.2 Accordion Group Component

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AccordionGroup } from '@angular/aria/accordion';

@Component({
  selector: 'nfs-accordion',
  hostDirectives: [
    {
      directive: AccordionGroup,
      inputs: ['multiExpandable', 'disabled', 'wrap'],
    },
  ],
  template: `
    <ul class="accordion" role="presentation">
      <ng-content />
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordion {
  /** Allow all panels to be closed */
  readonly allowAllClosed = input(false);
}
```

### 1.3 Accordion Item Component

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion-item.ts`

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AccordionTrigger, AccordionPanel, AccordionContent } from '@angular/aria/accordion';

@Component({
  selector: 'nfs-accordion-item',
  imports: [AccordionTrigger, AccordionPanel, AccordionContent],
  template: `
    <li class="accordion-item" [class.is-active]="expanded()">
      <button type="button" class="accordion-title" ngAccordionTrigger [panelId]="panelId()" [disabled]="disabled()" [(expanded)]="expandedModel">
        <ng-content select="[nfsAccordionTitle]" />
      </button>
      <div ngAccordionPanel [panelId]="panelId()" class="accordion-content">
        <ng-template ngAccordionContent>
          <ng-content />
        </ng-template>
      </div>
    </li>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordionItem {
  readonly panelId = input.required<string>();
  readonly disabled = input(false);
  readonly expanded = input(false);

  // For two-way binding
  expandedModel = this.expanded();
}
```

### 1.4 Accordion Title Directive

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion-title.ts`

```typescript
import { Directive } from '@angular/core';

@Directive({
  selector: '[nfsAccordionTitle]',
})
export class NfsAccordionTitle {}
```

### 1.5 Public API Exports

**File:** `packages/ngx-foundation-sites/src/lib/accordion/index.ts`

```typescript
export { NfsAccordion } from './accordion';
export { NfsAccordionItem } from './accordion-item';
export { NfsAccordionTitle } from './accordion-title';
```

**Update:** `packages/ngx-foundation-sites/src/index.ts`

```typescript
export * from './lib/accordion';
```

### 1.6 Foundation Accordion Styles

**File:** `packages/ngx-foundation-sites/src/lib/accordion/_foundation-accordion-settings.scss`

```scss
// Foundation Accordion settings with CSS custom properties (nfs- prefix)
@use 'foundation-sites/scss/util/util';

// Accordion CSS custom properties
$accordion-background: var(--nfs-accordion-background, #fefefe) !default;
$accordion-title-font-size: var(--nfs-accordion-title-font-size, #{util.rem-calc(12)}) !default;
$accordion-item-color: var(--nfs-accordion-item-color, var(--nfs-primary-color, #1779ba)) !default;
$accordion-item-background-hover: var(--nfs-accordion-item-background-hover, #e6e6e6) !default;
$accordion-item-padding: 1.25rem 1rem !default;
$accordion-content-background: var(--nfs-accordion-content-background, #fefefe) !default;
$accordion-content-border: 1px solid #e6e6e6 !default;
$accordion-content-color: var(--nfs-accordion-content-color, #0a0a0a) !default;
$accordion-content-padding: 1rem !default;
$accordion-plusminus: true !default;
```

### 1.7 Add Accordion to Storybook Styles

**Update:** `packages/ngx-foundation-sites/src/storybook/styles.scss`

Add accordion to global styles:

```scss
@use 'foundation-sites/scss/components/accordion';
@include accordion.foundation-accordion;
```

### Phase 1 Implementation Notes ✅

**Adjustments made during implementation:**

1. **Simplified directory structure**: Did not create separate wrapper files for `accordion-trigger.ts`, `accordion-panel.ts`, or `accordion-content.ts` - the @angular/aria directives are used directly in `NfsAccordionItem`

2. **Used `model()` for two-way binding**: The `expanded` property on `NfsAccordionItem` uses Angular's `model()` function for proper two-way binding with @angular/aria's `AccordionTrigger`

3. **Skipped `allowAllClosed`**: Deferred to Phase 3 (section 3.5) since @angular/aria doesn't support this natively

4. **Skipped component SCSS file**: `accordion.component.scss` not needed - Foundation's global accordion styles are sufficient

**Actual file contents differ slightly from plan examples** - see committed files for accurate implementation.

### Phase 1 Review Fixes ✅

**Issues identified and resolved during code review:**

1. **Added `AccordionContent` for lazy rendering**: Wrapped content in `<ng-template ngAccordionContent>` to enable lazy content rendering (content only renders when panel first expands)

2. **Fixed two-way binding**: Changed `expanded` from `input(false)` to `model(false)` in `NfsAccordionItem` for proper bidirectional sync with Angular ARIA

3. **Added `wrap` input**: Exposed the `wrap` input from `AccordionGroup` on `NfsAccordion` to control keyboard navigation wrapping

4. **Removed unused SCSS file**: Deleted `_foundation-accordion-settings.scss` since Foundation's default accordion styles are used via global styles

5. **Added `role="presentation"`**: Added `role="presentation"` to the `<ul>` element as specified in the original plan

---

## Phase 2: Storybook Stories & Interaction Tests ✅

**Goal:** Create comprehensive stories with interaction tests.

### 2.1 Template-Based Architecture for Angular ARIA

**Challenge:** Angular ARIA's `AccordionTrigger` and `AccordionPanel` inject `ACCORDION_GROUP` token, but this token is internal (not exported). When using wrapper components (`NfsAccordion`, `NfsAccordionItem`), the DI chain breaks because projected content can't access the parent's directive providers.

**Solution:** Render all Angular ARIA directives in `NfsAccordion`'s template and use `NgTemplateOutlet` to project user content:

1. **`NfsAccordionItem`** - Collects title/content templates via `contentChild`
2. **`NfsAccordion`** - Renders `ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel` in its own template
3. **Structural directives** - `*nfsAccordionTitle` and `*nfsAccordionContent` provide clean API

### 2.2 Updated Component API

**Usage:**

```html
<nfs-accordion [multiExpandable]="true">
  <nfs-accordion-item panelId="panel-1">
    <span *nfsAccordionTitle>Accordion 1</span>
    <p *nfsAccordionContent>Panel 1 content.</p>
  </nfs-accordion-item>
</nfs-accordion>
```

**Exports:**

- `NfsAccordion` - Accordion group component
- `NfsAccordionItem` - Item component (collects templates)
- `NfsAccordionTitleDef` - Structural directive for title
- `NfsAccordionContentDef` - Structural directive for content

### 2.3 Stories Implemented

| Story                | Purpose              | Interaction Test                     |
| -------------------- | -------------------- | ------------------------------------ |
| `Default`            | Single-expand mode   | Click tests, verify aria-expanded    |
| `MultiExpand`        | Multiple panels open | Open multiple, verify both stay open |
| `Disabled`           | Disabled state       | Group and item-level disabled        |
| `InitiallyExpanded`  | Pre-expanded panel   | Verify initial state                 |
| `KeyboardNavigation` | Keyboard a11y        | Arrow keys, Enter/Space              |

### Phase 2 Implementation Notes ✅

**Adjustments made during implementation:**

1. **Template-based architecture**: Used `NgTemplateOutlet` to project user content within Angular ARIA directive context, ensuring proper `ACCORDION_GROUP` injection

2. **Structural directive syntax**: Changed from attribute directive (`<span nfsAccordionTitle>`) to structural directive (`<span *nfsAccordionTitle>`) for cleaner template capture

3. **Added `NfsAccordionContentDef`**: New directive to capture content templates separately from title

4. **Renamed exports**: `NfsAccordionTitle` → `NfsAccordionTitleDef` to clarify it's a template definition directive

5. **Added `@angular/common` peer dependency**: Required for `NgTemplateOutlet`

6. **Keyboard navigation included**: Angular ARIA provides Arrow keys, Home/End, Enter/Space - tested in `KeyboardNavigation` story

7. **CSS override for Foundation**: Foundation CSS uses `.is-active` class to show accordion content, but Angular ARIA uses `aria-expanded`. Added component styles using `:has(button[aria-expanded="true"])` selector to bridge this gap.

**Actual file contents differ from original plan examples** - see committed files for accurate implementation.

### Phase 2 Review Fixes ✅

**Issues identified and resolved during code review:**

1. **Added `play` function to `Disabled` story**: Verifies `aria-disabled="true"` on both triggers, confirms panels start collapsed, clicks disabled buttons, and verifies they remain collapsed

2. **Added `play` function to `InitiallyExpanded` story**: Verifies first panel starts with `aria-expanded="true"`, second panel starts collapsed, and expanded panel content is visible

---

## Phase 3: Advanced Features ✅

**Goal:** Implement all Foundation Accordion features.

### 3.1 Animation Support (slide-speed) ✅

Used Angular v21's native CSS animation with `animate.enter`/`animate.leave` instead of `@angular/animations`:

**Implementation:**

- CSS Grid animation using `grid-template-rows: 0fr → 1fr` with `@starting-style`
- CSS custom property `--nfs-accordion-slide-speed` for configurable duration
- `slideSpeed` input on `NfsAccordion` component

**Stories added:** `SlowAnimation`, `NoAnimation`

### 3.2 Deep Linking Support ✅

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion-deep-link.service.ts`

Service provides:

- `getHashPanelId()` - Read panel ID from URL hash
- `updateHash()` - Update URL hash with `pushState` or `replaceState`
- `clearHash()` - Clear URL hash
- `scrollToPanel()` - Scroll to panel after delay
- `onHashChange()` - Listen for browser back/forward navigation

### 3.3 Deep Link Smudge (Scroll Adjustment) ✅

Implemented in `AccordionDeepLinkService.scrollToPanel()` with configurable delay.

### 3.4 Update Accordion with Deep Link Inputs ✅

**Inputs added to `NfsAccordion`:**

```typescript
readonly deepLink = input(false);
readonly deepLinkSmudge = input(false);
readonly deepLinkSmudgeDelay = input(300);
readonly updateHistory = input(false);
```

**Story added:** `DeepLink`

### 3.5 Allow All Closed Support ✅

**Goal:** Implement Foundation's `allowAllClosed` behavior (by default, at least one panel must be open).

**Implementation:**

- Added `allowAllClosed` input (default: `false`)
- Effect watches expansion state and re-opens last expanded panel when all close
- Uses `queueMicrotask` to write signals outside effect context
- Skips enforcement when accordion group is disabled
- `allowSignalWrites: true` option on effect

**Story added:** `RequireOneOpen`

### Phase 3 Implementation Notes

**Adjustments made during implementation:**

1. **Animation approach**: Used Angular v21's native `animate.enter`/`animate.leave` with CSS Grid animation instead of `@angular/animations` (which is deprecated)

2. **Deep linking in Storybook**: Cannot be reliably tested in Storybook interaction tests due to iframe context - added E2E test plan for Phase 5.3

3. **allowAllClosed timing**: Required careful signal management with `queueMicrotask` and `allowSignalWrites: true` to properly enforce the constraint

4. **Disabled accordion handling**: Added check to skip `allowAllClosed` enforcement when the accordion group is disabled

---

## Phase 4: Keyboard Navigation ✅

**Goal:** Ensure full keyboard accessibility (handled by @angular/aria).

Angular ARIA's `AccordionGroup` provides:

- Arrow Up/Down navigation between triggers
- Home/End to jump to first/last
- Enter/Space to toggle
- Tab navigation respects `disabled` and `wrap` settings

### 4.1 Verify Keyboard Navigation in Stories ✅

Keyboard navigation is tested in the `KeyboardNavigation` story (implemented in Phase 2).

---

## Phase 5: Testing & Documentation

### 5.1 Unit Tests ✅

**Files:**

- `packages/ngx-foundation-sites/src/lib/accordion/accordion.spec.ts` (33 tests)
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-deep-link.service.spec.ts` (15 tests)

Test cases:

- Single expand mode closes previous panel
- Multi-expand mode keeps panels open
- Disabled panels cannot be toggled
- Initially expanded panels render content
- Deep linking activates correct panel
- Keyboard navigation works correctly

**Implementation Notes:**

1. **Vitest Browser mode**: Configured with Playwright (Chromium) because jsdom doesn't support modern CSS (`@starting-style`, `:has()`) used by the accordion component

2. **Zoneless testing**: Uses `provideZonelessChangeDetection()` and `fixture.whenStable()` instead of `fakeAsync`/`tick` (zone-testing.js not available in Vitest)

3. **Keyboard events for triggers**: Angular ARIA's AccordionTrigger doesn't respond to native `.click()` in tests; uses `KeyboardEvent('keydown', { key: 'Enter' })` instead

4. **afterNextRender behavior**: Deep link initialization tests require creating fixture with `deepLink=true` before first render (afterNextRender only runs once)

5. **Edge case coverage**: Added tests for allowAllClosed enforcement, slideSpeed CSS property, expansion state tracking, and service error handling

### 5.2 Accessibility Tests

- Verify ARIA attributes (aria-expanded, aria-controls, aria-disabled)
- Test with AXE in Storybook
- Verify focus management
- Test screen reader announcements

### 5.3 Deep Linking E2E Tests (Playwright)

**Why E2E?** Deep linking cannot be reliably tested in Storybook interaction tests because stories run in an iframe with its own URL context. Playwright E2E tests run in a real browser and can:

- Navigate directly to URLs with hash fragments
- Verify URL hash changes after user interactions
- Test browser back/forward navigation

**File:** `apps/ngx-foundation-sites-e2e/src/accordion-deep-link.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Accordion Deep Linking', () => {
  const storyUrl = '/iframe.html?id=components-accordion--deep-link';

  test('opens panel from initial URL hash', async ({ page }) => {
    await page.goto(`${storyUrl}#panel-2`);

    const trigger2 = page.getByRole('button', { name: /Accordion 2/i });
    await expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  test('updates URL hash when panel is expanded', async ({ page }) => {
    await page.goto(storyUrl);

    await page.getByRole('button', { name: /Accordion 1/i }).click();

    await expect(page).toHaveURL(/#panel-1$/);
  });

  test('responds to browser back/forward navigation', async ({ page }) => {
    await page.goto(storyUrl);

    // Open panel 1, then panel 2
    await page.getByRole('button', { name: /Accordion 1/i }).click();
    await page.getByRole('button', { name: /Accordion 2/i }).click();

    // Go back - panel 1 should be active
    await page.goBack();
    const trigger1 = page.getByRole('button', { name: /Accordion 1/i });
    await expect(trigger1).toHaveAttribute('aria-expanded', 'true');
  });

  test('scrolls to panel when deepLinkSmudge is enabled', async ({ page }) => {
    // Add content above accordion to test scroll behavior
    await page.goto(`${storyUrl}#panel-3`);

    // Verify panel 3 is in viewport after smudge delay
    const trigger3 = page.getByRole('button', { name: /Accordion 3/i });
    await expect(trigger3).toBeInViewport();
  });
});
```

**Test Cases:**

| Test Case                        | Description                                                     |
| -------------------------------- | --------------------------------------------------------------- |
| Initial hash opens panel         | Navigate to `#panel-2`, verify panel 2 is expanded              |
| Click updates hash               | Click panel 1, verify URL ends with `#panel-1`                  |
| Browser back/forward             | Open panels sequentially, use back button, verify correct panel |
| Scroll to panel (smudge)         | Navigate with hash, verify panel scrolls into view              |
| Hash cleared when panel closed   | In multi-expand, close all panels, verify hash is cleared       |
| Invalid hash ignored             | Navigate with `#invalid-panel`, verify no panel opens           |
| updateHistory=false uses replace | Verify history.replaceState is used (history.length unchanged)  |

### 5.4 Run CI Verification

```bash
npm run ci
```

---

## Files to Create/Modify

### New Files

| Path                                                    | Purpose                     | Status              |
| ------------------------------------------------------- | --------------------------- | ------------------- |
| `src/lib/_foundation-settings.scss`                     | Global Foundation settings  | ✅                  |
| `src/lib/_foundation-components.scss`                   | Foundation component mixins | ✅                  |
| `src/storybook/styles.scss`                             | Storybook global styles     | ✅                  |
| `src/lib/accordion/index.ts`                            | Public exports              | ✅                  |
| `src/lib/accordion/accordion.ts`                        | Accordion group component   | ✅                  |
| `src/lib/accordion/accordion-item.ts`                   | Accordion item component    | ✅                  |
| `src/lib/accordion/accordion-title.ts`                  | Title template directive    | ✅                  |
| `src/lib/accordion/accordion-content.ts`                | Content template directive  | ✅                  |
| `src/lib/accordion/_foundation-accordion-settings.scss` | Component SCSS settings     | ❌ Removed (unused) |
| `src/lib/accordion/accordion.stories.ts`                | Storybook stories           | ✅                  |
| `src/lib/accordion/accordion.spec.ts`                   | Unit tests                  | ✅                  |
| `src/lib/accordion/accordion-deep-link.service.ts`      | Deep linking service        | ✅                  |
| `src/lib/accordion/accordion-deep-link.service.spec.ts` | Service unit tests          | ✅                  |
| `apps/.../accordion-deep-link.spec.ts`                  | Playwright E2E tests        |                     |

### Modified Files

| Path                                                  | Change                              | Status |
| ----------------------------------------------------- | ----------------------------------- | ------ |
| `packages/ngx-foundation-sites/project.json`          | Add styles to storybook targets     | ✅     |
| `packages/ngx-foundation-sites/project.json`          | Add Vitest Browser mode (chromium)  | ✅     |
| `packages/ngx-foundation-sites/.storybook/preview.ts` | Add preview configuration           | ✅     |
| `packages/ngx-foundation-sites/src/index.ts`          | Export accordion module             | ✅     |
| `package.json`                                        | Add @vitest/browser-playwright      | ✅     |

---

## Implementation Order

1. **Phase 0** - Foundation styles infrastructure (required for all components) ✅
2. **Phase 1** - Core accordion with @angular/aria ✅
3. **Phase 2** - Storybook stories with interaction tests ✅
4. **Phase 3** - Advanced features (animation, deep linking) ✅
5. **Phase 4** - Keyboard navigation verification (partially done in Phase 2) ✅
6. **Phase 5** - Testing and documentation
   - **5.1** Unit tests ✅ (48 tests: 33 component + 15 service)
   - **5.2** Accessibility tests
   - **5.3** Deep linking E2E tests (Playwright)
   - **5.4** CI verification

---

## Decision Points (Ask Before Proceeding)

1. **@angular/aria limitations**: If AccordionGroup doesn't support `allowAllClosed`, should we:
   - Extend with custom logic?
   - Use @angular/cdk/accordion instead?

2. **Deep linking scope**: Should deep linking be:
   - Built into the accordion component?
   - Provided as a separate optional service?

3. **Animation approach**: Should we use:
   - CSS transitions (simpler, recommended)?
   - Angular animations (`animate.enter`/`animate.leave`)?

---

## Naming Conventions

All custom CSS properties and class prefixes use `nfs-` (ngx-foundation-sites):

- CSS custom properties: `--nfs-primary-color`, `--nfs-accordion-background`
- Component selectors: `nfs-accordion`, `nfs-accordion-item`
- Directive selectors: `nfsAccordionTitle`
