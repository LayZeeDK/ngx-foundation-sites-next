# Phase 1: Core Accordion Implementation ✅

**Goal:** Implement basic accordion with expand/collapse using @angular/aria.

## 1.1 Create Accordion Directory Structure

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

## 1.2 Accordion Group Component

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

## 1.3 Accordion Item Component

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

## 1.4 Accordion Title Directive

**File:** `packages/ngx-foundation-sites/src/lib/accordion/accordion-title.ts`

```typescript
import { Directive } from '@angular/core';

@Directive({
  selector: '[nfsAccordionTitle]',
})
export class NfsAccordionTitle {}
```

## 1.5 Public API Exports

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

## 1.6 Foundation Accordion Styles

**File:** `packages/ngx-foundation-sites/src/lib/accordion/_foundation-accordion-settings.scss`

```scss
// Foundation Accordion settings (Sass variables)
@use 'foundation-sites/scss/util/util';

// Accordion Sass variables
$accordion-background: #fefefe !default;
$accordion-title-font-size: util.rem-calc(12) !default;
$accordion-item-color: #1779ba !default;
$accordion-item-background-hover: #e6e6e6 !default;
$accordion-item-padding: 1.25rem 1rem !default;
$accordion-content-background: #fefefe !default;
$accordion-content-border: 1px solid #e6e6e6 !default;
$accordion-content-color: #0a0a0a !default;
$accordion-content-padding: 1rem !default;
$accordion-plusminus: true !default;
```

## 1.7 Add Accordion to Storybook Styles

**Update:** `packages/ngx-foundation-sites/src/storybook/styles.scss`

Add accordion to global styles:

```scss
@use 'foundation-sites/scss/components/accordion';
@include accordion.foundation-accordion;
```

## Implementation Notes ✅

**Adjustments made during implementation:**

1. **Simplified directory structure**: Did not create separate wrapper files for `accordion-trigger.ts`, `accordion-panel.ts`, or `accordion-content.ts` - the @angular/aria directives are used directly in `NfsAccordionItem`

2. **Used `model()` for two-way binding**: The `expanded` property on `NfsAccordionItem` uses Angular's `model()` function for proper two-way binding with @angular/aria's `AccordionTrigger`

3. **Skipped `allowAllClosed`**: Deferred to Phase 3 (section 3.5) since @angular/aria doesn't support this natively

4. **Skipped component SCSS file**: `accordion.component.scss` not needed - Foundation's global accordion styles are sufficient

**Actual file contents differ slightly from plan examples** - see committed files for accurate implementation.

## Review Fixes ✅

**Issues identified and resolved during code review:**

1. **Added `AccordionContent` for lazy rendering**: Wrapped content in `<ng-template ngAccordionContent>` to enable lazy content rendering (content only renders when panel first expands)

2. **Fixed two-way binding**: Changed `expanded` from `input(false)` to `model(false)` in `NfsAccordionItem` for proper bidirectional sync with Angular ARIA

3. **Added `wrap` input**: Exposed the `wrap` input from `AccordionGroup` on `NfsAccordion` to control keyboard navigation wrapping

4. **Removed unused SCSS file**: Deleted `_foundation-accordion-settings.scss` since Foundation's default accordion styles are used via global styles

5. **Added `role="presentation"`**: Added `role="presentation"` to the `<ul>` element as specified in the original plan
