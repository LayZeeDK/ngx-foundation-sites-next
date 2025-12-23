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

### 5.2 Accessibility Tests ✅

**Files:**

- `packages/ngx-foundation-sites/.storybook/main.ts` - Addon registration
- `packages/ngx-foundation-sites/.storybook/preview.ts` - AXE configuration
- `packages/ngx-foundation-sites/.storybook/tsconfig.json` - TypeScript configuration for Compodoc
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts` - Accessibility stories
- `packages/ngx-foundation-sites/src/lib/_foundation-settings.scss` - WCAG AA color palette
- `packages/ngx-foundation-sites/src/lib/_foundation-components.scss` - Consolidated palette import

**Test coverage:**

- ✅ Verify ARIA attributes (aria-expanded, aria-controls, aria-labelledby, aria-disabled)
- ✅ Verify `role="region"` on accordion panels
- ✅ Test with AXE in Storybook (@storybook/addon-a11y)
- ✅ Programmatic AXE checks in CI via `test: 'error'`
- ✅ Verify focus management with disabled items
- ✅ WCAG 2.0 A/AA and 2.1 A/AA compliance

**Stories added:**

| Story                         | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `Accessibility`               | ARIA attribute verification        |
| `FocusManagementWithDisabled` | Focus behavior with disabled items |

**Implementation Notes:**

1. **@storybook/addon-a11y**: Configured AXE-based accessibility testing with WCAG rules. Disabled landmark rules not applicable to isolated components (`landmark-one-main`, `page-has-heading-one`, `region`).

2. **@storybook/addon-docs with Compodoc**: Added documentation addon for autodocs generation:
   - Added `@storybook/addon-docs` to `main.ts` addons array
   - Added `tags: ['autodocs']` to `preview.ts` for automatic documentation
   - Configured `setCompodocJson()` in `preview.ts` for Angular component documentation
   - Added `component: NfsAccordion` to story meta for Compodoc integration
   - Configured Compodoc with `-p packages/ngx-foundation-sites/tsconfig.lib.json` in `project.json`
   - Added `resolveJsonModule: true` to `.storybook/tsconfig.json` for JSON import

3. **Programmatic AXE checks in CI**: Added `test: 'error'` to `parameters.a11y` in `preview.ts`:
   - When `test-storybook` runs, axe-core checks are automatically executed for each story
   - Violations cause test failures (CI will fail)
   - No additional dependencies (axe-playwright) or configuration files needed
   - Uses the same WCAG rules configured in `parameters.a11y.config`

4. **WCAG AA color compliance**: Foundation's default primary color (#1779ba) failed contrast requirements (3.75:1). Updated to WCAG AA compliant palette using Sass module configuration (`@use ... with`):
   - primary: #0d5a89 (4.5:1 contrast ratio)
   - secondary: #595959
   - success: #1a7f3e
   - warning: #8a6500
   - alert: #a33a2a

5. **Color palette consolidation**: Eliminated duplicate palette definitions by having `_foundation-components.scss` import from `_foundation-settings.scss`:

   ```scss
   @use './foundation-settings' as settings;
   @use 'foundation-sites/scss/foundation' with (
     $foundation-palette: settings.$foundation-palette
   );
   ```

6. **Angular ARIA focus behavior**: Unlike Foundation's JavaScript, Angular ARIA allows disabled items to receive focus (for screen reader announcement) but prevents activation. This is correct WCAG behavior - tests verify:
   - Arrow keys move focus through ALL items including disabled
   - Click, Enter, and Space do NOT activate disabled items
   - `aria-disabled="true"` is set on disabled triggers

7. **aria-disabled assertion**: Angular ARIA sets `aria-disabled="false"` explicitly on enabled buttons. Tests check `not.toHaveAttribute('aria-disabled', 'true')` rather than absence of attribute.

8. **aria-labelledby verification**: Added comprehensive verification in `Accessibility` story:
   - Each panel has an `aria-labelledby` attribute
   - The attribute value references an existing element ID
   - The referenced element is the correct trigger button

9. **role="region" verification**: Added verification in `Accessibility` story confirming all panels have `role="region"` per ARIA Authoring Practices, enabling screen reader landmark navigation.

### 5.3 Deep Linking E2E Tests (Playwright) ✅

**Why E2E?** Deep linking cannot be reliably tested in Storybook interaction tests because:

1. Stories run in an iframe with its own isolated URL context
2. `window.location.hash` changes affect the iframe, not the parent Storybook URL
3. Browser back/forward navigation can't be simulated within the iframe

**Testing Strategy Alignment with Phase 6:**

The dual-strategy architecture in Phase 6 informs our testing approach:

| Strategy         | Scroll API                          | Testable in Storybook? | Best Test Location        |
| ---------------- | ----------------------------------- | ---------------------- | ------------------------- |
| Native (current) | `scrollIntoView()`                  | ❌ Browser API         | **Playwright E2E**        |
| Router (Phase 6) | `ViewportScroller.scrollToAnchor()` | ✅ Can spy/mock        | **Storybook interaction** |

#### 5.3.1 E2E App Directory Structure

```
apps/
└── ngx-foundation-sites-e2e/
    ├── src/
    │   └── accordion-deep-link.spec.ts
    ├── playwright.config.ts
    ├── project.json
    ├── tsconfig.json
    └── .eslintrc.json
```

#### 5.3.2 project.json

```json
{
  "name": "ngx-foundation-sites-e2e",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/ngx-foundation-sites-e2e/src",
  "implicitDependencies": ["ngx-foundation-sites"]
}
```

> **Note:** The `@nx/playwright` plugin auto-infers the `e2e` target from `playwright.config.ts`

#### 5.3.3 playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4400';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx nx static-storybook ngx-foundation-sites',
    url: 'http://localhost:4400',
    reuseExistingServer: !process.env['CI'],
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

#### 5.3.4 tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "sourceMap": false
  },
  "include": ["**/*.ts", "**/*.js", "playwright.config.ts"]
}
```

#### 5.3.5 accordion-deep-link.spec.ts

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
    await page.waitForURL(/#panel-1$/);

    await page.getByRole('button', { name: /Accordion 2/i }).click();
    await page.waitForURL(/#panel-2$/);

    // Go back - panel 1 should be active
    await page.goBack();

    const trigger1 = page.getByRole('button', { name: /Accordion 1/i });
    await expect(trigger1).toHaveAttribute('aria-expanded', 'true');
  });

  test('scrolls to panel when deepLinkSmudge is enabled', async ({ page }) => {
    await page.goto(`${storyUrl}#panel-3`);

    // Wait for smudge delay (300ms default)
    await page.waitForTimeout(400);

    const trigger3 = page.getByRole('button', { name: /Accordion 3/i });
    await expect(trigger3).toBeInViewport();
  });

  test('clears hash when all panels are closed in multi-expand mode', async ({ page }) => {
    // Use multi-expand story with deep linking
    const multiStoryUrl = '/iframe.html?id=components-accordion--multi-expand-deep-link';
    await page.goto(`${multiStoryUrl}#panel-1`);

    // Close the expanded panel
    await page.getByRole('button', { name: /Accordion 1/i }).click();

    // Hash should be cleared
    await expect(page).not.toHaveURL(/#panel/);
  });

  test('ignores invalid hash', async ({ page }) => {
    await page.goto(`${storyUrl}#invalid-panel-id`);

    // No panel should be expanded
    const triggers = page.getByRole('button', { name: /Accordion/i });
    const count = await triggers.count();

    for (let i = 0; i < count; i++) {
      await expect(triggers.nth(i)).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('uses replaceState when updateHistory is false', async ({ page }) => {
    // Use story with updateHistory=false
    const replaceStoryUrl = '/iframe.html?id=components-accordion--deep-link-no-history';
    await page.goto(replaceStoryUrl);

    const initialHistoryLength = await page.evaluate(() => history.length);

    await page.getByRole('button', { name: /Accordion 1/i }).click();
    await page.getByRole('button', { name: /Accordion 2/i }).click();

    const finalHistoryLength = await page.evaluate(() => history.length);

    // History length should not increase with replaceState
    expect(finalHistoryLength).toBe(initialHistoryLength);
  });
});
```

#### 5.3.6 ESLint Configuration (Optional)

**File:** `apps/ngx-foundation-sites-e2e/.eslintrc.json`

```json
{
  "extends": ["../../.eslintrc.json"],
  "ignorePatterns": ["!**/*"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {}
    },
    {
      "files": ["src/**/*.ts"],
      "extends": ["plugin:playwright/recommended"],
      "rules": {}
    }
  ]
}
```

#### 5.3.7 Required Story Variants

The E2E tests require these additional story variants in `accordion.stories.ts`:

| Story Name            | Purpose                              |
| --------------------- | ------------------------------------ |
| `MultiExpandDeepLink` | Multi-expand with `deepLink=true`    |
| `DeepLinkNoHistory`   | Deep link with `updateHistory=false` |

#### 5.3.8 Test Cases

| Test Case                | Description                             | Why E2E?            |
| ------------------------ | --------------------------------------- | ------------------- |
| Initial hash opens panel | Navigate to `#panel-2`, verify expanded | Real URL navigation |
| Click updates hash       | Click panel, verify URL hash            | Browser URL access  |
| Browser back/forward     | Navigate history, verify state          | Real history API    |
| Scroll to panel (smudge) | Verify scroll position                  | Real viewport       |
| Hash cleared on close    | Close all, verify hash gone             | URL verification    |
| Invalid hash ignored     | Bad hash, no panel opens                | URL parsing         |
| updateHistory=false      | replaceState used                       | History stack       |

#### 5.3.9 Files to Create

| Path                                                            | Purpose                  |
| --------------------------------------------------------------- | ------------------------ |
| `apps/ngx-foundation-sites-e2e/project.json`                    | Nx project configuration |
| `apps/ngx-foundation-sites-e2e/playwright.config.ts`            | Playwright configuration |
| `apps/ngx-foundation-sites-e2e/tsconfig.json`                   | TypeScript configuration |
| `apps/ngx-foundation-sites-e2e/src/accordion-deep-link.spec.ts` | E2E test file            |
| `apps/ngx-foundation-sites-e2e/.eslintrc.json`                  | ESLint config (optional) |

#### 5.3.10 Files to Modify

| Path                                          | Change                                                           |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `packages/.../accordion/accordion.stories.ts` | Add `MultiExpandDeepLink` and `DeepLinkNoHistory` story variants |

#### 5.3.11 Verification

```bash
# Run E2E tests only
npx nx e2e ngx-foundation-sites-e2e

# Run full CI (includes E2E)
npm run ci
```

#### 5.3.12 Future: Phase 6 Router Strategy Testing

When Phase 6 (Angular Router integration) is implemented, Storybook interaction tests become possible:

```typescript
export const DeepLinkRouter: Story = {
  decorators: [
    applicationConfig({
      providers: [provideRouter([], withHashLocation()), provideLocationMocks(), provideAccordionDeepLink('router')],
    }),
  ],
  play: async ({ canvasElement }) => {
    const location = TestBed.inject(Location);
    const viewportScroller = TestBed.inject(ViewportScroller);
    const scrollSpy = vi.spyOn(viewportScroller, 'scrollToAnchor');

    location.go('/#panel-2');

    const trigger2 = within(canvasElement).getByRole('button', { name: /Accordion 2/i });
    await expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(scrollSpy).toHaveBeenCalledWith('panel-2'));
  },
};
```

| Aspect       | E2E (Native)         | Storybook (Router)          |
| ------------ | -------------------- | --------------------------- |
| URL changes  | Real browser URL     | Mocked `Location` service   |
| Back/forward | `page.goBack()`      | `location.simulateUrlPop()` |
| Scroll       | Real viewport scroll | Spy on `ViewportScroller`   |

#### 5.3.13 Implementation Notes ✅

**Completed:** E2E project scaffolded and all 7 test cases passing.

**Scaffolding approach (per user preference):**

1. Generated temporary Angular app with Playwright E2E using `@nx/angular:application`
2. Removed temporary app using `@nx/workspace:remove` generator
3. Moved/renamed E2E project to `packages/ngx-foundation-sites-e2e` using `@nx/workspace:move` generator
4. Manually verified no `temp` references remained after move

**Adjustments made during implementation:**

1. **E2E project location**: Placed in `packages/` rather than `apps/` for consistency with library project

2. **Story variants for E2E**: Created `MultiExpandDeepLink` and `DeepLinkNoHistory` stories without play functions to avoid interference with E2E test interactions

3. **Race condition fix in accordion.ts**: Discovered and fixed a race condition where `effect()` would clear the URL hash before `afterNextRender()` could read the initial hash. Added `initialHashProcessed` flag to prevent premature hash clearing in `allowAllClosed` mode.

4. **Test for "ignores invalid hash"**: Updated to use `DeepLinkNoHistory` story which has `allowAllClosed: true` so that invalid hashes don't trigger auto-open of first panel

**Files created:**

- `packages/ngx-foundation-sites-e2e/project.json` - Nx project with `implicitDependencies: ["ngx-foundation-sites"]`
- `packages/ngx-foundation-sites-e2e/playwright.config.ts` - Configured for static-storybook on port 4400
- `packages/ngx-foundation-sites-e2e/tsconfig.json` - TypeScript configuration
- `packages/ngx-foundation-sites-e2e/src/accordion-deep-link.spec.ts` - 7 E2E test cases

**Files modified:**

- `packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts` - Added `MultiExpandDeepLink` and `DeepLinkNoHistory` stories
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts` - Fixed race condition with `initialHashProcessed` flag

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
| `packages/.../accordion-deep-link.spec.ts`              | Playwright E2E tests        | ✅                  |

### Modified Files

| Path                                                  | Change                             | Status |
| ----------------------------------------------------- | ---------------------------------- | ------ |
| `packages/ngx-foundation-sites/project.json`          | Add styles to storybook targets    | ✅     |
| `packages/ngx-foundation-sites/project.json`          | Add Vitest Browser mode (chromium) | ✅     |
| `packages/ngx-foundation-sites/.storybook/preview.ts` | Add preview configuration          | ✅     |
| `packages/ngx-foundation-sites/src/index.ts`          | Export accordion module            | ✅     |
| `package.json`                                        | Add @vitest/browser-playwright     | ✅     |

---

## Implementation Order

1. **Phase 0** - Foundation styles infrastructure (required for all components) ✅
2. **Phase 1** - Core accordion with @angular/aria ✅
3. **Phase 2** - Storybook stories with interaction tests ✅
4. **Phase 3** - Advanced features (animation, deep linking) ✅
5. **Phase 4** - Keyboard navigation verification (partially done in Phase 2) ✅
6. **Phase 5** - Testing and documentation
   - **5.1** Unit tests ✅ (48 tests: 33 component + 15 service)
   - **5.2** Accessibility tests ✅
   - **5.3** Deep linking E2E tests (Playwright) ✅ (7 tests)
   - **5.4** CI verification
7. **Phase 6** - Angular Router integration (Future Enhancement) — Deferred
8. **Phase 7** - Feature Parity & Theming Enhancements

---

## Phase 6: Angular Router Integration (Future Enhancement)

> **Status:** Deferred — Current native implementation is sufficient for initial release.

**Goal:** Provide optional Angular Router integration for deep linking, enabling seamless interoperability with Angular's navigation system.

### 6.1 Background: Why Both Native and Router Strategies?

| Use Case                                                    | Router Available? | Best Strategy             |
| ----------------------------------------------------------- | ----------------- | ------------------------- |
| Landing pages / One-pagers                                  | ❌ No             | Native                    |
| Widget libraries / Micro-frontends                          | ❌ No             | Native                    |
| Angular apps with path-based routing                        | ✅ Yes            | Either (Native works)     |
| Angular apps with hash-based routing (`useHash: true`)      | ✅ Yes            | **Router required**       |
| Apps using Router's `anchorScrolling` or scroll restoration | ✅ Yes            | Router (avoids conflicts) |

**Current limitation:** The native implementation conflicts with hash-based routing because both the accordion and router manipulate the URL hash.

### 6.2 Architecture: Dual Strategy with Auto-Detection

```
┌─────────────────────────────────────────────┐
│     AccordionDeepLinkService (Interface)    │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
┌──────────────────┐    ┌─────────────────────┐
│ NativeDeepLink   │    │ RouterDeepLink      │
│ (current impl)   │    │ (new)               │
├──────────────────┤    ├─────────────────────┤
│ location.hash    │    │ ActivatedRoute      │
│ history.pushState│    │ Router.navigate()   │
│ hashchange event │    │ fragment observable │
│ scrollIntoView() │    │ ViewportScroller    │
└──────────────────┘    └─────────────────────┘
```

### 6.3 Angular Router Scrolling APIs

**`withInMemoryScrolling()` options:**

```typescript
provideRouter(
  routes,
  withInMemoryScrolling({
    anchorScrolling: 'enabled', // Scroll to #fragment on navigation
    scrollPositionRestoration: 'top', // Reset to top, or restore previous position
  }),
);
```

| Option                      | Values                               | Default      | Behavior                                                          |
| --------------------------- | ------------------------------------ | ------------ | ----------------------------------------------------------------- |
| `anchorScrolling`           | `'disabled'` / `'enabled'`           | `'disabled'` | When `'enabled'`, Router scrolls to anchor on fragment navigation |
| `scrollPositionRestoration` | `'disabled'` / `'enabled'` / `'top'` | `'disabled'` | `'enabled'` restores previous position on back navigation         |

**`ViewportScroller` service:**

```typescript
abstract class ViewportScroller {
  setOffset(offset: [number, number]): void; // Global scroll offset (for fixed headers)
  scrollToAnchor(anchor: string): void; // Scroll to element by ID
  scrollToPosition(position: [number, number]): void;
}
```

**Benefits of `ViewportScroller.scrollToAnchor()`:**

- Respects `setOffset()` for fixed headers
- Integrates with Router's scroll management
- Works in SSR contexts (can be mocked)

### 6.4 Key Insight: Fragment vs Hash Routing

```typescript
// Router fragment (works with ANY routing strategy, including useHash)
this.router.navigate(['/products'], { fragment: 'panel-1' });
// → example.com/products#panel-1  (path strategy)
// → example.com/#/products#panel-1  (hash strategy - fragment is separate!)

// Reading fragment
this.route.fragment.subscribe((fragment) => console.log(fragment));
```

The Router treats fragment as metadata, separate from the route path — this is why the Router strategy works correctly even with hash-based routing.

### 6.5 Implementation Plan

#### Files to Create

| File                                    | Purpose                                |
| --------------------------------------- | -------------------------------------- |
| `accordion-deep-link.interface.ts`      | Extract interface from current service |
| `router-accordion-deep-link.service.ts` | Router-based implementation            |
| `accordion-deep-link.provider.ts`       | Factory provider with auto-detection   |

#### Files to Modify

| File                             | Changes                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| `accordion-deep-link.service.ts` | Rename class to `NativeAccordionDeepLinkService`, implement interface |
| `accordion.ts`                   | Inject via token instead of concrete class                            |
| `index.ts`                       | Export new types and provider function                                |

### 6.6 Provider API

```typescript
// Auto-detect: uses Router strategy if Router is available
provideAccordionDeepLink();

// Explicit native (for landing pages without Router)
provideAccordionDeepLink('native');

// Explicit router (force Router strategy)
provideAccordionDeepLink('router');
```

**Factory implementation:**

```typescript
export const ACCORDION_DEEP_LINK_SERVICE = new InjectionToken<AccordionDeepLinkService>('AccordionDeepLinkService');

export function provideAccordionDeepLink(strategy: 'native' | 'router' | 'auto' = 'auto') {
  return {
    provide: ACCORDION_DEEP_LINK_SERVICE,
    useFactory: (router?: Router, route?: ActivatedRoute, scroller?: ViewportScroller) => {
      if (strategy === 'native') return new NativeAccordionDeepLinkService();
      if (strategy === 'router') return new RouterAccordionDeepLinkService(router!, route!, scroller!);
      // 'auto' - detect if Router is available
      return router ? new RouterAccordionDeepLinkService(router, route!, scroller!) : new NativeAccordionDeepLinkService();
    },
    deps: [
      [new Optional(), Router],
      [new Optional(), ActivatedRoute],
      [new Optional(), ViewportScroller],
    ],
  };
}
```

### 6.7 RouterAccordionDeepLinkService Implementation

```typescript
@Injectable()
export class RouterAccordionDeepLinkService implements AccordionDeepLinkService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly scroller = inject(ViewportScroller);

  getHashPanelId(): string | null {
    return this.route.snapshot.fragment;
  }

  updateHash(panelId: string, useHistory: boolean): void {
    this.router.navigate([], {
      fragment: panelId,
      replaceUrl: !useHistory, // replaceUrl=true → replaceState behavior
    });
  }

  clearHash(useHistory: boolean): void {
    this.router.navigate([], {
      fragment: undefined,
      replaceUrl: !useHistory,
    });
  }

  scrollToPanel(panelId: string, delay = 300): void {
    setTimeout(() => {
      this.scroller.scrollToAnchor(panelId);
    }, delay);
  }

  onHashChange(callback: (panelId: string | null) => void): () => void {
    const subscription = this.route.fragment.subscribe((fragment) => {
      callback(fragment ?? null);
    });
    return () => subscription.unsubscribe();
  }
}
```

### 6.8 Documentation Note

Add to accordion component documentation:

> **Note on Angular Router:** The deep linking feature uses native browser APIs by default and works
> with Angular Router's default path-based routing. If you use hash-based routing (`useHash: true`),
> or Router's `anchorScrolling`/`scrollPositionRestoration` options, add `provideAccordionDeepLink()`
> to your providers for seamless Router integration.

### 6.9 Test Cases (Future)

| Test Case                    | Description                                                |
| ---------------------------- | ---------------------------------------------------------- |
| Auto-detect with Router      | Verify Router strategy is used when Router is provided     |
| Auto-detect without Router   | Verify Native strategy is used when Router is absent       |
| Explicit native with Router  | Verify Native strategy when explicitly requested           |
| Fragment navigation          | Verify `Router.navigate()` is called with correct fragment |
| Fragment subscription        | Verify `ActivatedRoute.fragment` updates trigger callbacks |
| ViewportScroller integration | Verify `scrollToAnchor()` is called with offset support    |
| Hash routing compatibility   | Verify works correctly with `useHash: true`                |

### 6.10 References

- [Angular ViewportScroller API](https://angular.dev/api/common/ViewportScroller)
- [withInMemoryScrolling()](https://angular.dev/api/router/withInMemoryScrolling)
- [Router.navigate() fragment option](https://angular.dev/api/router/NavigationExtras#fragment)
- Current implementation: `src/lib/accordion/accordion-deep-link.service.ts`

---

## Phase 7: Feature Parity & Theming Enhancements

**Goal:** Complete Foundation feature parity, expose Angular ARIA features, and add CSS custom properties for runtime theming.

### 7.1 Feature Comparison Analysis

#### Foundation JavaScript Options (9 total)

| Foundation Option              | Default | Our Input             | Status     |
| ------------------------------ | ------- | --------------------- | ---------- |
| `data-slide-speed`             | 250     | `slideSpeed`          | ✅         |
| `data-multi-expand`            | false   | `multiExpandable`     | ✅         |
| `data-allow-all-closed`        | false   | `allowAllClosed`      | ✅         |
| `data-deep-link`               | false   | `deepLink`            | ✅         |
| `data-deep-link-smudge`        | false   | `deepLinkSmudge`      | ✅         |
| `data-deep-link-smudge-delay`  | 300     | `deepLinkSmudgeDelay` | ✅         |
| `data-deep-link-smudge-offset` | 0       | —                     | ❌ MISSING |
| `data-update-history`          | false   | `updateHistory`       | ✅         |
| `disabled` (attr)              | —       | `disabled`            | ✅         |

**Result: 8/9 options implemented (89%)**

#### Foundation Sass Variables (12 total)

| Sass Variable                      | Default                 | CSS Custom Property                     | Status |
| ---------------------------------- | ----------------------- | --------------------------------------- | ------ |
| `$accordion-background`            | `$white`                | `--nfs-accordion-background`            | ✅     |
| `$accordion-plusminus`             | `true`                  | —                                       | ❌     |
| `$accordion-plus-content`          | `'\002B'`               | —                                       | ❌     |
| `$accordion-minus-content`         | `'\2013'`               | —                                       | ❌     |
| `$accordion-title-font-size`       | `rem-calc(12)`          | `--nfs-accordion-title-font-size`       | ✅     |
| `$accordion-item-color`            | `$primary-color`        | `--nfs-accordion-item-color`            | ✅     |
| `$accordion-item-background-hover` | `$light-gray`           | `--nfs-accordion-item-background-hover` | ✅     |
| `$accordion-item-padding`          | `1.25rem 1rem`          | `--nfs-accordion-item-padding`          | ✅     |
| `$accordion-content-background`    | `$white`                | `--nfs-accordion-content-background`    | ✅     |
| `$accordion-content-border`        | `1px solid $light-gray` | `--nfs-accordion-content-border`        | ✅     |
| `$accordion-content-color`         | `$body-font-color`      | `--nfs-accordion-content-color`         | ✅     |
| `$accordion-content-padding`       | `1rem`                  | `--nfs-accordion-content-padding`       | ✅     |

**Result: 9/12 exposed as CSS custom properties (75%)**

> **Note:** The `$accordion-plusminus`, `$accordion-plus-content`, and `$accordion-minus-content` variables control the ±/- icons and are not yet exposed. These would require component-level CSS changes to support custom icons.

#### Angular ARIA Features (10 total)

| Angular ARIA Feature   | Our Implementation                  | Status |
| ---------------------- | ----------------------------------- | ------ |
| `multiExpandable`      | ✅ Exposed as input                 | ✅     |
| `disabled` (group)     | ✅ Exposed as input                 | ✅     |
| `disabled` (item)      | ✅ Exposed on `NfsAccordionItem`    | ✅     |
| `wrap`                 | ✅ Exposed as input                 | ✅     |
| `softDisabled`         | Not exposed                         | ❌     |
| `expandAll()` method   | Not exposed                         | ❌     |
| `collapseAll()` method | Not exposed                         | ❌     |
| `preserveContent`      | Not exposed                         | ❌     |
| `textDirection`        | Not exposed (auto via Angular ARIA) | ⚠️     |
| Lazy rendering         | ✅ Built-in                         | ✅     |

**Result: 5/10 features accessible to consumers (50%)**

### 7.2 Implementation: Foundation Feature Parity

#### 7.2.1 Add `deepLinkSmudgeOffset` Input

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
/** Scroll offset in pixels for sticky headers when deep linking */
readonly deepLinkSmudgeOffset = input(0);
```

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion-deep-link.service.ts`

Update `scrollToPanel()` to accept offset parameter:

```typescript
scrollToPanel(panelId: string, delay = 300, offset = 0): void {
  setTimeout(() => {
    const element = document.getElementById(panelId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset + rect.top - offset;
      window.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, delay);
}
```

### 7.3 Implementation: Angular ARIA Feature Exposure

#### 7.3.1 Add `softDisabled` Input

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
/** When true, disabled items can receive focus but not be activated */
readonly softDisabled = input(true);
```

Update template:

```html
<ul ngAccordionGroup ... [softDisabled]="softDisabled()"></ul>
```

#### 7.3.2 Add `preserveContent` Input to `NfsAccordionItem`

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion-item.ts`

```typescript
/** Whether to keep content in DOM after panel collapses (default: true) */
readonly preserveContent = input(true);
```

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

Update template:

```html
<div ngAccordionPanel ... [preserveContent]="item.preserveContent()"></div>
```

#### 7.3.3 Expose `expandAll()` and `collapseAll()` Methods

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
@ViewChild(AccordionGroup) private accordionGroup!: AccordionGroup;

/** Expands all panels (only works when multiExpandable is true) */
expandAll(): void {
  this.accordionGroup?.expandAll();
}

/** Collapses all panels */
collapseAll(): void {
  this.accordionGroup?.collapseAll();
}
```

### 7.4 Implementation: CSS Custom Properties for Theming ✅

#### 7.4.1 CSS-First Approach (No Angular Inputs)

**Decision:** Instead of Angular inputs with host bindings, CSS custom properties are set directly via CSS or inline styles. This provides:

- **No framework overhead** - Pure CSS theming without Angular change detection
- **CSS cascade support** - Properties can be set at any ancestor level
- **Media query compatibility** - Properties can change based on `@media` rules
- **CSS-in-JS flexibility** - Works with any styling approach

**Usage:**

```html
<!-- Inline styles -->
<nfs-accordion
  style="--nfs-accordion-item-color: #ff8fa3;
         --nfs-accordion-content-background: #1a1a2e;"
>
  ...
</nfs-accordion>

<!-- Or via CSS class -->
<nfs-accordion class="dark-theme">...</nfs-accordion>
```

```css
.dark-theme {
  --nfs-accordion-item-color: #ff8fa3;
  --nfs-accordion-content-background: #1a1a2e;
}
```

#### 7.4.2 Available CSS Custom Properties

| Property                                | Description            | Default                          |
| --------------------------------------- | ---------------------- | -------------------------------- |
| `--nfs-accordion-background`            | Container background   | `#fefefe`                        |
| `--nfs-accordion-title-font-size`       | Title font size        | `rem-calc(12)`                   |
| `--nfs-accordion-item-color`            | Title text color       | `#0d5a89`                        |
| `--nfs-accordion-item-background-hover` | Title hover background | `#e6e6e6`                        |
| `--nfs-accordion-item-padding`          | Title padding          | `1.25rem 1rem`                   |
| `--nfs-accordion-content-background`    | Content background     | `#fefefe`                        |
| `--nfs-accordion-content-border`        | Content border         | `1px solid #e6e6e6`              |
| `--nfs-accordion-content-color`         | Content text color     | `#0a0a0a`                        |
| `--nfs-accordion-content-padding`       | Content padding        | `1rem`                           |
| `--nfs-accordion-slide-speed`           | Animation duration     | `250ms` (via `slideSpeed` input) |
| `--nfs-accordion-slide-easing`          | Animation easing       | `ease-out`                       |

#### 7.4.3 Updated Storybook Styles

**File:** `packages/ngx-foundation-sites/src/storybook/styles.scss`

```scss
.accordion {
  background: var(--nfs-accordion-background, #fefefe);
}

.accordion-title {
  font-size: var(--nfs-accordion-title-font-size, #{util.rem-calc(12)});
  color: var(--nfs-accordion-item-color, var(--nfs-primary-color, #0d5a89));
  padding: var(--nfs-accordion-item-padding, 1.25rem 1rem);

  &:hover,
  &:focus {
    background-color: var(--nfs-accordion-item-background-hover, #e6e6e6);
  }
}

.accordion-content {
  background: var(--nfs-accordion-content-background, #fefefe);
  color: var(--nfs-accordion-content-color, #0a0a0a);
}
```

#### 7.4.4 Phase 7.4 Implementation Notes

**Adjustments made during implementation:**

1. **Pure CSS approach**: Rejected Angular input properties in favor of CSS custom properties set directly via CSS or inline styles. This aligns with modern CSS theming patterns and avoids unnecessary framework overhead.

2. **Fallback chain**: Properties use `var(--nfs-property, fallback)` syntax, allowing Foundation's defaults to apply when custom properties aren't set.

3. **Component-level CSS**: The accordion component's internal styles also use CSS custom properties for content padding and border during animation transitions.

4. **WCAG compliance**: The `CustomTheme` story uses `#ff8fa3` instead of `#e94560` to meet WCAG 4.5:1 contrast requirements against the dark background.

**Files created/modified:**

- `packages/ngx-foundation-sites/src/storybook/styles.scss` - Added CSS custom property overrides
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts` - Updated component styles to use CSS custom properties for content padding/border
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts` - Added `CustomTheme` story demonstrating dark theme
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.spec.ts` - Added unit tests for CSS custom property theming

**Story added:** `CustomTheme` - Demonstrates runtime theming with a dark color scheme

#### 7.4.5 Bugfix: Plus/Minus Icon Not Toggling ✅

**Issue:** The accordion's +/- indicator icon always showed `+` even when expanded, and icons overlapped title text.

**Root Cause Analysis:**

1. **Icon not toggling:** Foundation's CSS uses `.is-active` class on `.accordion-item` to switch from `+` to `–`:

   ```scss
   .is-active > .accordion-title::before {
     content: '\2013'; // en-dash (–)
   }
   ```

   Our component used `aria-expanded` attribute but never applied `.is-active` class.

2. **Icon overlapping text:** Foundation's `.accordion-title` styles assume `<a>` elements (which fill container width with `display: block`). Our `<button>` elements sized to content, causing the absolutely-positioned icon to overlap.

**Fixes Applied:**

1. **Template binding** — Added `.is-active` class sync in `accordion.ts`:

   ```html
   <li class="accordion-item" [class.is-active]="item.expanded()"></li>
   ```

2. **Button styles CSS** — Added minimal CSS overrides for button elements:

   ```css
   /*
    * Button elements need explicit styles (Foundation assumes <a> elements)
    * - width: 100% because buttons don't fill container like display:block anchors
    * - cursor: pointer because buttons default to cursor:default
    */
   .accordion-title {
     width: 100%;
     cursor: pointer;
   }
   ```

3. **Border correction** — Fixed content border to match Foundation (keeps top border as separator from title):

   ```css
   .accordion-item.is-active > .accordion-content {
     border: var(--nfs-accordion-content-border, 1px solid #e6e6e6);
     border-bottom: 0; /* Foundation removes bottom border, keeps top as separator */
   }
   ```

4. **Simplified CSS selectors** — Changed from `:has(button[aria-expanded='true'])` to `.is-active` for better consistency with Foundation and simpler CSS:

   ```css
   /* Before (complex, less compatible): */
   .accordion-item:has(button[aria-expanded='true']) > .accordion-content { ... }

   /* After (simpler, Foundation-aligned): */
   .accordion-item.is-active > .accordion-content { ... }
   ```

**Design Decision:** Prefer Foundation's existing CSS classes over custom CSS rules. The `.is-active` class binding leverages Foundation's battle-tested styling rather than duplicating logic with custom ARIA-aware selectors.

### 7.5 Testing & Documentation

#### 7.5.1 Unit Tests

- Test `deepLinkSmudgeOffset` with various offset values — ⏳
- Test `softDisabled` focus behavior — ⏳
- Test `preserveContent` DOM cleanup — ⏳
- Test `expandAll()` / `collapseAll()` methods — ⏳
- Test CSS custom property binding — ✅ (3 tests added in Phase 7.4)

#### 7.5.2 Storybook Stories

| Story Name             | Purpose                                 | Status |
| ---------------------- | --------------------------------------- | ------ |
| `DeepLinkWithOffset`   | Demonstrate sticky header offset        | ⏳     |
| `SoftDisabled`         | Show focus behavior on disabled items   | ⏳     |
| `ExpandCollapseAll`    | Buttons to trigger programmatic methods | ⏳     |
| `CustomTheme`          | Demonstrate CSS custom property theming | ✅     |
| `PreserveContentFalse` | Show DOM cleanup when panel closes      | ⏳     |

### 7.6 Files to Modify

| File                                  | Changes                                                | Status                 |
| ------------------------------------- | ------------------------------------------------------ | ---------------------- |
| `accordion.ts`                        | Add 14 new inputs, 2 methods, ViewChild, host bindings | ⏳                     |
| `accordion-item.ts`                   | Add `preserveContent` input                            | ⏳                     |
| `accordion-deep-link.service.ts`      | Add offset parameter to `scrollToPanel()`              | ⏳                     |
| `styles.scss`                         | Add CSS custom property fallbacks                      | ✅ 7.4                 |
| `accordion.stories.ts`                | Add 5 new stories                                      | ✅ 7.4 (CustomTheme)   |
| `accordion.spec.ts`                   | Add unit tests for new features                        | ✅ 7.4 (theming tests) |
| `accordion-deep-link.service.spec.ts` | Add offset tests                                       | ⏳                     |

### 7.7 Implementation Order

1. **deepLinkSmudgeOffset** (simplest, completes Foundation parity) — ⏳ Pending
2. **softDisabled** (simple input passthrough) — ⏳ Pending
3. **preserveContent** (simple input passthrough) — ⏳ Pending
4. **expandAll/collapseAll** (requires ViewChild) — ⏳ Pending
5. **CSS custom properties** (most complex, requires style updates) — ✅ Complete (Phase 7.4)

### 7.8 Expected Outcome

After implementing Phase 7:

- **100%** Foundation JavaScript options
- **100%** WAI-ARIA compliance (unchanged)
- **90%** Angular ARIA features exposed
- **100%** Foundation Sass variables as CSS custom properties

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
