# Phase 7: Feature Parity & Theming Enhancements

**Goal:** Complete Foundation feature parity, expose Angular ARIA features, and enable compile-time Sass variable theming.

## 7.1 Feature Comparison Analysis

### Foundation JavaScript Options (9 total)

| Foundation Option              | Default | Our Input                           | Status |
| ------------------------------ | ------- | ----------------------------------- | ------ |
| `data-slide-speed`             | 250     | `$nfs-accordion-slide-speed` (Sass) | ✅     |
| `data-multi-expand`            | false   | `multiExpandable`                   | ✅     |
| `data-allow-all-closed`        | false   | `allowAllClosed`                    | ✅     |
| `data-deep-link`               | false   | `deepLink`                          | ✅     |
| `data-deep-link-smudge`        | false   | `deepLinkSmudge`                    | ✅     |
| `data-deep-link-smudge-delay`  | 300     | `deepLinkSmudgeDelay`               | ✅     |
| `data-deep-link-smudge-offset` | 0       | `deepLinkSmudgeOffset`              | ✅     |
| `data-update-history`          | false   | `updateHistory`                     | ✅     |
| `disabled` (attr)              | —       | `disabled`                          | ✅     |

**Result: 9/9 options implemented (100%) ✅**

### Foundation Sass Variables (12 total)

| Sass Variable                      | Default                 | Implementation | Status |
| ---------------------------------- | ----------------------- | -------------- | ------ |
| `$accordion-background`            | `$white`                | Sass variable  | ✅     |
| `$accordion-plusminus`             | `true`                  | Sass variable  | ✅     |
| `$accordion-plus-content`          | `'\002B'`               | Sass variable  | ✅     |
| `$accordion-minus-content`         | `'\2013'`               | Sass variable  | ✅     |
| `$accordion-title-font-size`       | `rem-calc(12)`          | Sass variable  | ✅     |
| `$accordion-item-color`            | `$primary-color`        | Sass variable  | ✅     |
| `$accordion-item-background-hover` | `$light-gray`           | Sass variable  | ✅     |
| `$accordion-item-padding`          | `1.25rem 1rem`          | Sass variable  | ✅     |
| `$accordion-content-background`    | `$white`                | Sass variable  | ✅     |
| `$accordion-content-border`        | `1px solid $light-gray` | Sass variable  | ✅     |
| `$accordion-content-color`         | `$body-font-color`      | Sass variable  | ✅     |
| `$accordion-content-padding`       | `1rem`                  | Sass variable  | ✅     |

**Result: 12/12 exposed as Sass variables for compile-time theming (100%) ✅**

### Angular ARIA Features (10 total)

| Angular ARIA Feature   | Our Implementation                   | Status |
| ---------------------- | ------------------------------------ | ------ |
| `multiExpandable`      | ✅ Exposed as input                  | ✅     |
| `disabled` (group)     | ✅ Exposed as input                  | ✅     |
| `disabled` (item)      | ✅ Exposed on `NfsAccordionItem`     | ✅     |
| `wrap`                 | ✅ Exposed as input                  | ✅     |
| `softDisabled`         | ✅ Exposed as input                  | ✅     |
| `expandAll()` method   | ✅ Exposed as public method          | ✅     |
| `collapseAll()` method | ✅ Exposed as public method          | ✅     |
| `preserveContent`      | ❌ Not public API (internal)         | ⚠️     |
| `textDirection`        | ✅ Auto-detected via `dir` attribute | ✅     |
| Lazy rendering         | ✅ Built-in                          | ✅     |

**Result: 9/10 features accessible to consumers (90%)**

> **Note:** `preserveContent` is inherited from Angular ARIA's internal `DeferredContentAware` class and is not exported as a public API. The `textDirection` is automatically detected from the nearest `dir` attribute (or document root) via Angular CDK's `Directionality` service — no explicit input is needed. Both keyboard navigation behavior AND visual styling (via CSS Logical Properties) automatically adapt to RTL mode.

## 7.2 Implementation: Foundation Feature Parity ✅

### 7.2.1 Add `deepLinkSmudgeOffset` Input ✅

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

## 7.3 Implementation: Angular ARIA Feature Exposure ✅

### 7.3.1 Add `softDisabled` Input ✅

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
/** Whether to allow disabled items to receive focus.
 * When true, disabled items are focusable but not interactive.
 * When false, disabled items are skipped during navigation.
 * Default: true (allows focus for screen reader announcement)
 */
readonly softDisabled = input(true);
```

Update template:

```html
<ul ngAccordionGroup ... [softDisabled]="softDisabled()"></ul>
```

### 7.3.2 Add `preserveContent` Input to `NfsAccordionItem` — NOT IMPLEMENTED

**Discovery:** During implementation, TypeScript compilation revealed that `preserveContent` is inherited from `DeferredContentAware`, which is an **internal class** not exported from `@angular/aria/accordion`. Attempting to bind to this property results in:

```
NG3004: Unable to import symbol DeferredContentAware.
The symbol is not exported from @angular/aria/accordion
```

**Decision:** This feature cannot be exposed as it's not part of Angular ARIA's public API. The default behavior (content preserved after first expansion) is maintained.

### 7.3.3 Expose `expandAll()` and `collapseAll()` Methods ✅

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
/** Reference to the AccordionGroup directive for programmatic control */
private readonly accordionGroup = viewChild(AccordionGroup);

/**
 * Expands all accordion panels.
 * Only works when `multiExpandable` is true.
 */
expandAll(): void {
  this.accordionGroup()?.expandAll();
}

/**
 * Collapses all accordion panels.
 * Note: If `allowAllClosed` is false, at least one panel will remain open.
 */
collapseAll(): void {
  this.accordionGroup()?.collapseAll();
}
```

### 7.3.4 Phase 7.3 Implementation Notes

**Adjustments made during implementation:**

1. **Signal-based viewChild**: Used `viewChild(AccordionGroup)` instead of `@ViewChild` decorator for consistency with Angular's modern signal-based APIs.

2. **preserveContent unavailable**: The `preserveContent` property is not a public API in Angular ARIA. It's inherited from the internal `DeferredContentAware` class which controls lazy content rendering. This feature was removed from the implementation scope.

3. **softDisabled behavior**: When `softDisabled=true` (default), disabled accordion items can receive keyboard focus for screen reader announcement but cannot be activated. When `softDisabled=false`, disabled items are completely skipped during keyboard navigation.

4. **Removed deprecated `allowSignalWrites` flag**: Angular 21 no longer requires `{ allowSignalWrites: true }` on effects—signal writes are always allowed. Removed the deprecated option to eliminate console warnings.

**Stories added:**

- `SoftDisabled` - Demonstrates focus skipping when `softDisabled=false`
- `ExpandCollapseAll` - Demonstrates programmatic `expandAll()` and `collapseAll()` methods with external buttons

**Unit tests added:**

- `softDisabled` - 3 tests for focus behavior with disabled items
- `expandAll and collapseAll` - 4 tests for programmatic panel control

## 7.4 Implementation: CSS Custom Properties for Theming ✅

### 7.4.1 CSS-First Approach (No Angular Inputs)

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

### 7.4.2 Available CSS Custom Properties

| Property                                | Description              | Default             |
| --------------------------------------- | ------------------------ | ------------------- |
| `--nfs-accordion-background`            | Container background     | `#fefefe`           |
| `--nfs-accordion-title-font-size`       | Title font size          | `rem-calc(12)`      |
| `--nfs-accordion-item-color`            | Title text color         | `#0d5a89`           |
| `--nfs-accordion-item-background-hover` | Title hover background   | `#e6e6e6`           |
| `--nfs-accordion-item-padding`          | Title padding            | `1.25rem 1rem`      |
| `--nfs-accordion-content-background`    | Content background       | `#fefefe`           |
| `--nfs-accordion-content-border`        | Content border           | `1px solid #e6e6e6` |
| `--nfs-accordion-content-color`         | Content text color       | `#0a0a0a`           |
| `--nfs-accordion-content-padding`       | Content padding          | `1rem`              |
| `--nfs-accordion-slide-speed`           | Animation duration       | `250ms`             |
| `--nfs-accordion-slide-easing`          | Animation easing         | `ease-out`          |
| `--nfs-accordion-plus-content`          | Collapsed icon character | `'+'`               |
| `--nfs-accordion-minus-content`         | Expanded icon character  | `'–'`               |

### 7.4.3 Updated Storybook Styles

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

### 7.4.4 Phase 7.4 Implementation Notes

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

**Stories added:**

- `CustomTheme` - Demonstrates runtime theming with a dark color scheme
- `ThemeControls` - Interactive Storybook controls for ALL CSS custom properties

### 7.4.6 ThemeControls Story Implementation ✅

**Purpose:** Provides interactive Storybook controls for all 11 CSS custom properties, enabling real-time theme customization in the Storybook UI.

**Implementation approach:**

1. **Custom TypeScript interface**: Created `ThemeControlsArgs` interface to extend story args with CSS custom property values (since `StoryObj<NfsAccordion>` only accepts component inputs)

2. **argTypes configuration**: Each CSS property mapped to an appropriate Storybook control:
   - Color properties → `control: { type: 'color' }` with color picker
   - Text properties (padding, font-size, border) → `control: { type: 'text' }`
   - Easing function → `control: 'select'` with predefined options

3. **Category grouping**: All CSS controls grouped under `table: { category: 'CSS Custom Properties' }` for clear organization in the Controls panel

4. **Angular style bindings**: Template uses `[style.--nfs-accordion-*]` bindings to pass arg values as CSS custom properties

**CSS Custom Properties with controls:**

| Property                                | Control Type | Default Value       |
| --------------------------------------- | ------------ | ------------------- |
| `--nfs-accordion-background`            | color        | `#fefefe`           |
| `--nfs-accordion-title-font-size`       | text         | `0.75rem`           |
| `--nfs-accordion-item-color`            | color        | `#0d5a89`           |
| `--nfs-accordion-item-background-hover` | color        | `#e6e6e6`           |
| `--nfs-accordion-item-padding`          | text         | `1.25rem 1rem`      |
| `--nfs-accordion-content-background`    | color        | `#fefefe`           |
| `--nfs-accordion-content-border`        | text         | `1px solid #e6e6e6` |
| `--nfs-accordion-content-color`         | color        | `#0a0a0a`           |
| `--nfs-accordion-content-padding`       | text         | `1rem`              |
| `--nfs-accordion-slide-easing`          | select       | `ease-out`          |
| `--nfs-accordion-slide-speed`           | (via input)  | `250ms`             |

### 7.4.5 Bugfix: Plus/Minus Icon Not Toggling ✅

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

## 7.5 Implementation: RTL (Right-to-Left) Support ✅

### 7.5.1 Background: Layered RTL Architecture

RTL support in Angular applications requires two complementary layers:

| Layer        | Responsibility                         | Technology                                                  | How It Works                        |
| ------------ | -------------------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| **Behavior** | Keyboard navigation, focus management  | Angular CDK `Directionality` → Angular ARIA `textDirection` | Auto-detects `dir` attribute        |
| **Styling**  | Visual layout (icon position, margins) | CSS Logical Properties                                      | Auto-flips based on `dir` attribute |

**Why Two Layers?**

- **Angular CDK's `Directionality` service** reads the `dir` attribute and provides a reactive signal
- **Angular ARIA's `AccordionGroup.textDirection`** consumes this signal for keyboard behavior
- **Foundation's CSS** uses compile-time Sass variables (`$global-right`) that don't respond to runtime `dir` changes
- **CSS Logical Properties** provide the missing runtime styling support

### 7.5.2 Layer 1: Behavior (Already Working)

Angular ARIA automatically handles RTL keyboard navigation:

```
dir="rtl" attribute
      ↓
Angular CDK Directionality service
      ↓
AccordionGroup.textDirection signal
      ↓
Keyboard navigation adapts automatically
```

**No action needed** — this layer works out of the box.

### 7.5.3 Layer 2: Styling (CSS Logical Properties)

**File:** `packages/ngx-foundation-sites/src/storybook/styles.scss`

CSS Logical Properties automatically map to physical properties based on text direction:

| Logical Property      | LTR equivalent  | RTL equivalent |
| --------------------- | --------------- | -------------- |
| `inset-inline-start`  | `left`          | `right`        |
| `inset-inline-end`    | `right`         | `left`         |
| `margin-inline-start` | `margin-left`   | `margin-right` |
| `padding-inline-end`  | `padding-right` | `padding-left` |

**Implementation:**

```scss
// RTL Support: Use CSS logical properties for automatic direction handling
.accordion-title::before {
  right: unset; // Remove Foundation's physical property
  inset-inline-end: 1rem; // Automatically maps to right (LTR) or left (RTL)
}
```

**Browser Support:** All modern browsers (Chrome 87+, Firefox 66+, Safari 14.1+, Edge 87+)

### 7.5.4 Story Added

| Story Name  | Purpose                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| RightToLeft | RTL layout with Arabic text, verifies icon position and keyboard navigation |

### 7.5.5 What Users Need to Know

To enable RTL mode:

1. Set `dir="rtl"` on the accordion's ancestor element (or `<html>`)
2. Both behavior AND styling automatically adapt:
   - +/- icons flip to the left side (CSS Logical Properties)
   - Keyboard navigation works correctly (Angular CDK Directionality)
3. No component inputs or configuration required

### 7.5.6 References

- [CSS Logical Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)
- [Angular CDK Bidi/Directionality](https://material.angular.io/cdk/bidi/overview)
- [CSS-Tricks: CSS Logical Properties](https://css-tricks.com/css-logical-properties-and-values/)

## 7.10 Implementation: Plus/Minus Icon Customization ✅

**Goal:** Complete Foundation Sass variable coverage for plusminus-related variables.

### 7.10.1 Foundation Sass Variables Covered

| Sass Variable              | Default   | Implementation                      |
| -------------------------- | --------- | ----------------------------------- |
| `$accordion-plusminus`     | `true`    | Sass variable (compile-time)        |
| `$accordion-plus-content`  | `'\002B'` | `--nfs-accordion-plus-content` CSS  |
| `$accordion-minus-content` | `'\2013'` | `--nfs-accordion-minus-content` CSS |

### 7.10.2 Implementation Approach

**Why Sass variable for `$accordion-plusminus`?**

The `$accordion-plusminus` boolean is configured at compile-time in the consumer's `_nfs-settings.scss` file. This matches Foundation's native approach where boolean toggles are decided at build time rather than runtime.

```scss
// Consumer's src/styles/_nfs-settings.scss
@forward 'ngx-foundation-sites/scss/foundation-settings' with (
  $accordion-plusminus: false // Disable +/- icons at compile time
);
```

**CSS Custom Properties for icon content:**

```scss
// Plus/Minus Icon CSS Custom Properties
.accordion-title::before {
  content: var(--nfs-accordion-plus-content, '+');
  // Color inherited from .accordion-title (--nfs-accordion-item-color)
}

.accordion-item.is-active > .accordion-title::before {
  content: var(--nfs-accordion-minus-content, '–');
}
```

### 7.10.3 Stories Added

| Story Name    | Purpose                                   |
| ------------- | ----------------------------------------- |
| `CustomIcons` | Demonstrates chevron icons (▶/▼) via CSS |

### 7.10.4 ThemeControls Updates

Added 2 new controls under "CSS Custom Properties" category:

| Control                         | Type | Default |
| ------------------------------- | ---- | ------- |
| `--nfs-accordion-plus-content`  | text | `'+'`   |
| `--nfs-accordion-minus-content` | text | `'–'`   |

> **Note:** Icon color inherits from `--nfs-accordion-item-color`, matching Foundation's behavior.

### 7.10.5 Result

**Foundation Sass variable coverage: 12/12 (100%) ✅**

## 7.6 Testing & Documentation

### 7.6.1 Unit Tests

- Test `deepLinkSmudgeOffset` with various offset values — ✅ (2 tests added in Phase 7.2)
- Test `softDisabled` focus behavior — ✅ (3 tests added in Phase 7.3)
- Test `preserveContent` DOM cleanup — ❌ (not implemented, internal API)
- Test `expandAll()` / `collapseAll()` methods — ✅ (4 tests added in Phase 7.3)

### 7.6.2 Storybook Stories

| Story Name             | Purpose                                    | Status                      |
| ---------------------- | ------------------------------------------ | --------------------------- |
| `DeepLinkWithOffset`   | Demonstrate sticky header offset           | ✅ (Phase 7.2)              |
| `SoftDisabled`         | Show focus behavior on disabled items      | ✅ (Phase 7.3)              |
| `ExpandCollapseAll`    | Buttons to trigger programmatic methods    | ✅ (Phase 7.3)              |
| `RightToLeft`          | RTL layout with Arabic text and icon tests | ✅ (Phase 7.5)              |
| `PreserveContentFalse` | Show DOM cleanup when panel closes         | ❌ (not possible, internal) |

## 7.7 Files to Modify

| File                                  | Changes                                                 | Status                                                |
| ------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `accordion.ts`                        | Add `softDisabled` input, `viewChild`, methods          | ✅ 7.3                                                |
| `accordion-item.ts`                   | Add `preserveContent` input                             | ❌ (not possible, internal API)                       |
| `accordion-deep-link.service.ts`      | Add offset parameter to `scrollToPanel()`               | ✅ 7.2                                                |
| `styles.scss`                         | Add CSS custom property fallbacks, RTL, icon properties | ✅ 7.4 + 7.5 + 7.10                                   |
| `accordion.stories.ts`                | Add stories for new features                            | ✅ 7.3 + 7.4 + 7.5 + 7.10 (7 stories)                 |
| `accordion.spec.ts`                   | Add unit tests for new features                         | ✅ 7.3 + 7.4 (softDisabled, expand/collapse, theming) |
| `accordion-deep-link.service.spec.ts` | Add offset tests                                        | ✅ 7.2                                                |

## 7.8 Implementation Order

1. **deepLinkSmudgeOffset** (simplest, completes Foundation parity) — ✅ Complete (Phase 7.2)
2. **softDisabled** (simple input passthrough) — ✅ Complete (Phase 7.3)
3. **preserveContent** (simple input passthrough) — ❌ Not possible (internal API)
4. **expandAll/collapseAll** (requires viewChild) — ✅ Complete (Phase 7.3)
5. **RTL support** (CSS Logical Properties for +/- icons) — ✅ Complete (Phase 7.5)

## 7.9 Expected Outcome

**Current status after Phase 7.2 + 7.3 + 7.5:**

- **100%** Foundation JavaScript options (9/9 — all implemented ✅)
- **100%** WAI-ARIA compliance (unchanged)
- **90%** Angular ARIA features exposed (9/10 — `preserveContent` internal, `textDirection` ✅ via CSS Logical Properties)
- **100%** Foundation Sass variables for compile-time theming (12/12 ✅)
