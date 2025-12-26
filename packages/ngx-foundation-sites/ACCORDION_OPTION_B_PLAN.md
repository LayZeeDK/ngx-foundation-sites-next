# Accordion Option B: Template-Based Implementation Plan

## Current State (Before Implementation)

**The codebase is currently broken.** The previous attempt (content projection with Angular ARIA) failed due to DI limitations. Key files need attention:

| File                     | Status                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `accordion.ts`           | Broken - uses `AccordionGroup` in template but content projection doesn't work       |
| `accordion-item.ts`      | Broken - uses `AccordionTrigger`/`AccordionPanel` which can't find `ACCORDION_GROUP` |
| `accordion-header.ts`    | Exists but will be replaced                                                          |
| `accordion-content.ts`   | Keep - `NfsAccordionContentDef` works as-is                                          |
| `accordion.stories.ts`   | Uses broken API                                                                      |
| `nfs-accordion-group.ts` | Deleted                                                                              |

**Storybook shows**: `NG0201: No provider found for InjectionToken ACCORDION_GROUP`

## Comparison: Committed vs Uncommitted vs Option B

| Aspect                        | Committed (Working)                                                 | Uncommitted (Broken)                                 | Option B (Planned)                                     |
| ----------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| **API**                       | `*nfsAccordionTitle` / `*nfsAccordionContent` structural directives | `<nfs-accordion-item>` component with `<ng-content>` | `<ng-template nfsAccordionItem>` with nested templates |
| **How items provided**        | Structural directives on elements                                   | Content-projected components                         | Template directives queried by parent                  |
| **Who renders trigger/panel** | NfsAccordion (parent renders all)                                   | NfsAccordionItem (self-renders)                      | NfsAccordion (parent renders all)                      |
| **Angular ARIA DI**           | Works (view children)                                               | Broken (content children)                            | Works (view children)                                  |
| **Status**                    | ✓ Working                                                           | ✗ `NG0201` error                                     | Planned                                                |

### Why Committed Works

The committed version uses structural directives (`*nfsAccordionTitle`). NfsAccordion queries these `TemplateRef`s and renders them **in its own template** with `ngAccordionTrigger`/`ngAccordionPanel`. Angular ARIA's DI works because everything is a view child.

### Why Uncommitted is Broken

The uncommitted attempt uses content projection (`<nfs-accordion-item>`). NfsAccordionItem tries to use `ngAccordionTrigger`/`ngAccordionPanel` internally, but they can't find `ACCORDION_GROUP` because content-projected components use their **declaration site's** injector.

### Why Option B Will Work

Option B returns to having NfsAccordion render everything, but with a cleaner API using `<ng-template>` instead of structural directives. The key is that Angular ARIA directives are **always rendered by NfsAccordion**, keeping them as view children.

## Recommendation for Next Session

**Start fresh from committed state:**

```bash
git restore packages/ngx-foundation-sites/src/lib/accordion/
```

Then implement Option B on top of the working committed code.

## Key Learnings (See ANGULAR_ARIA_ACCORDION_FINDINGS.md)

1. **Angular ARIA's `ACCORDION_GROUP` token is NOT exported** - can't provide it ourselves
2. **Content projection uses logical tree for DI** - not DOM tree
3. **Angular Material/CDK works differently** - exported tokens, optional injection
4. **CDK Accordion lacks accessibility** - ruled out as alternative
5. **Solution**: Render Angular ARIA directives as VIEW CHILDREN (templates)

## Goal

Implement an accordion component using Angular ARIA that works around the content projection DI limitation by having users provide templates that NfsAccordion renders as view children.

## Target API

```html
<nfs-accordion [multiExpandable]="false" [disabled]="false">
  <!-- Each item is a template that NfsAccordion will render -->
  <ng-template nfsAccordionItem [panelId]="'panel-1'">
    <nfs-accordion-header>First Panel</nfs-accordion-header>
    <p>Eager content - rendered immediately</p>
  </ng-template>

  <ng-template nfsAccordionItem [panelId]="'panel-2'" [expanded]="true">
    <nfs-accordion-header>Second Panel (Initially Open)</nfs-accordion-header>
    <p>This panel starts expanded</p>
  </ng-template>

  <ng-template nfsAccordionItem [panelId]="'panel-3'" [disabled]="true">
    <nfs-accordion-header>Disabled Panel</nfs-accordion-header>
    <p>This panel cannot be opened</p>
  </ng-template>

  <ng-template nfsAccordionItem [panelId]="'panel-4'">
    <nfs-accordion-header>Lazy Panel</nfs-accordion-header>
    <!-- Lazy content - only rendered when first expanded -->
    <ng-template nfsAccordionContent>
      <heavy-component />
    </ng-template>
  </ng-template>
</nfs-accordion>
```

## Why This Works

```
NfsAccordion's View (DI chain intact!)
┌──────────────────────────────────────────────────────────┐
│ <div ngAccordionGroup>                                   │ ← Provides ACCORDION_GROUP
│   @for (item of itemDefs(); track item.panelId()) {     │
│     <div class="accordion-item">                         │
│       <button ngAccordionTrigger>                        │ ← Injects ACCORDION_GROUP ✓
│         <ng-container [ngTemplateOutlet]="item.header"/> │
│       </button>                                          │
│       <div ngAccordionPanel>                             │ ← Injects ACCORDION_GROUP ✓
│         <ng-container [ngTemplateOutlet]="item.content"/>│
│       </div>                                             │
│     </div>                                               │
│   }                                                      │
│ </div>                                                   │
└──────────────────────────────────────────────────────────┘
```

Because NfsAccordion renders the structure (including `ngAccordionTrigger` and `ngAccordionPanel`), the Angular ARIA directives are **view children** of the element with `ngAccordionGroup`, so DI works.

## Component Architecture

### 1. NfsAccordionItemDef (Directive on ng-template)

Captures the user's template and its configuration inputs.

```typescript
@Directive({
  selector: 'ng-template[nfsAccordionItem]',
})
export class NfsAccordionItemDef {
  /** Unique panel identifier */
  readonly panelId = input.required<string>();

  /** Whether this item starts expanded */
  readonly expanded = input(false);

  /** Whether this item is disabled */
  readonly disabled = input(false);

  /** Reference to the template */
  readonly templateRef = inject(TemplateRef);
}
```

### 2. NfsAccordionHeader (Marker Component)

Simple component that marks the header content within a template.

```typescript
@Component({
  selector: 'nfs-accordion-header',
  template: `<ng-content />`,
  host: { style: 'display: contents' },
})
export class NfsAccordionHeader {}
```

### 3. NfsAccordionContentDef (Lazy Content Directive)

Marks content that should be lazily loaded.

```typescript
@Directive({
  selector: 'ng-template[nfsAccordionContent]',
})
export class NfsAccordionContentDef {
  readonly templateRef = inject(TemplateRef);
}
```

### 4. NfsAccordion (Main Container)

Queries item templates and renders them with Angular ARIA directives.

```typescript
@Component({
  selector: 'nfs-accordion',
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, NgTemplateOutlet],
  template: `
    <div class="accordion" ngAccordionGroup [multiExpandable]="multiExpandable()" [disabled]="disabled()" [softDisabled]="softDisabled()" [wrap]="wrap()">
      @for (item of itemDefs(); track item.panelId()) {
        <div class="accordion-item" [class.is-active]="itemExpanded(item)">
          <button ngAccordionTrigger type="button" class="accordion-title" [panelId]="item.panelId()" [disabled]="item.disabled()" [(expanded)]="itemExpandedStates()[item.panelId()]">
            <!-- Render header from template -->
            <ng-container [ngTemplateOutlet]="getHeaderTemplate(item)" />
          </button>
          <div ngAccordionPanel class="accordion-content" [panelId]="item.panelId()" [id]="item.panelId()">
            <div class="accordion-content-inner">
              <!-- Render content (lazy or eager) -->
              @if (getLazyContent(item); as lazyDef) {
                @defer (when itemExpanded(item)) {
                  <ng-container [ngTemplateOutlet]="lazyDef.templateRef" />
                }
              } @else {
                <ng-container [ngTemplateOutlet]="getEagerContent(item)" />
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class NfsAccordion {
  /** Query all item templates */
  protected readonly itemDefs = contentChildren(NfsAccordionItemDef);

  /** Accordion inputs */
  readonly multiExpandable = input(false);
  readonly disabled = input(false);
  readonly softDisabled = input(false);
  readonly wrap = input(false);

  // ... methods to extract header/content from templates
}
```

## Template Parsing Challenge

The main challenge is extracting the header and content from each item template. Options:

### Option A: Render Template, Query Children

1. Render the full template into a hidden container
2. Query for `NfsAccordionHeader` and `NfsAccordionContentDef`
3. Extract their templates/content

**Pros**: Works with any template structure
**Cons**: Complex, requires extra rendering

### Option B: Convention-Based Structure

Require users to structure templates in a specific way:

```html
<ng-template nfsAccordionItem [panelId]="'panel-1'">
  <nfs-accordion-header>Title</nfs-accordion-header>
  <!-- Everything else is content -->
</ng-template>
```

Then NfsAccordion renders the template twice with different selectors.

**Pros**: Simple
**Cons**: Renders template content multiple times

### Option C: Separate Header Template

Require header as a separate nested template:

```html
<ng-template nfsAccordionItem [panelId]="'panel-1'">
  <ng-template nfsAccordionHeader>Title</ng-template>
  <p>Content</p>
</ng-template>
```

**Pros**: Clean separation
**Cons**: More verbose API

### Option D: ViewContainerRef Dynamic Rendering

Render each item template into a ViewContainerRef, then query/move elements.

**Pros**: Full control
**Cons**: Complex DOM manipulation

## Recommended Approach: Option C (Separate Header Template)

This provides the cleanest separation and easiest implementation:

```html
<nfs-accordion>
  <ng-template nfsAccordionItem [panelId]="'panel-1'">
    <ng-template nfsAccordionHeader>
      <span>First Panel Title</span>
    </ng-template>
    <p>Panel content goes here</p>
    <!-- Optional lazy content -->
    <ng-template nfsAccordionContent>
      <heavy-component />
    </ng-template>
  </ng-template>
</nfs-accordion>
```

### Implementation Details

```typescript
@Directive({
  selector: 'ng-template[nfsAccordionItem]',
})
export class NfsAccordionItemDef {
  readonly panelId = input.required<string>();
  readonly expanded = input(false);
  readonly disabled = input(false);

  // Query nested templates
  readonly headerDef = contentChild(NfsAccordionHeaderDef);
  readonly contentDef = contentChild(NfsAccordionContentDef);

  // The main template (for eager content)
  readonly templateRef = inject(TemplateRef);
}

@Directive({
  selector: 'ng-template[nfsAccordionHeader]',
})
export class NfsAccordionHeaderDef {
  readonly templateRef = inject(TemplateRef);
}
```

## File Changes

| File                      | Action                                      |
| ------------------------- | ------------------------------------------- |
| `accordion-item-def.ts`   | **NEW** - NfsAccordionItemDef directive     |
| `accordion-header-def.ts` | **NEW** - NfsAccordionHeaderDef directive   |
| `accordion-content.ts`    | Keep - NfsAccordionContentDef               |
| `accordion.ts`            | **REWRITE** - Template rendering approach   |
| `accordion-item.ts`       | **DELETE** - No longer needed               |
| `accordion-header.ts`     | **DELETE** - Replaced by template directive |
| `accordion.scss`          | Update selectors                            |
| `index.ts`                | Update exports                              |
| `accordion.stories.ts`    | **REWRITE** - New API                       |

## Migration Guide

| Old API                             | New API                            |
| ----------------------------------- | ---------------------------------- |
| `<nfs-accordion-item>` component    | `<ng-template nfsAccordionItem>`   |
| `<nfs-accordion-header>` component  | `<ng-template nfsAccordionHeader>` |
| Direct content                      | Content inside item template       |
| `<ng-template nfsAccordionContent>` | Same (unchanged)                   |

## Implementation Phases

### Phase 1: Create Template Directives

- Create `NfsAccordionItemDef`
- Create `NfsAccordionHeaderDef`
- Keep existing `NfsAccordionContentDef`

### Phase 2: Rewrite NfsAccordion

- Remove hostDirectives approach
- Implement template rendering with @for
- Add ngAccordionGroup to inner div
- Render items with ngAccordionTrigger/Panel

### Phase 3: Handle State Management

- Track expanded state per item
- Implement two-way binding for expanded
- Support initial expanded state

### Phase 4: Deep Linking & Features

- Port deep linking logic
- Port allowAllClosed logic
- Port plusminus toggle

### Phase 5: Update Stories & Test

- Rewrite all Storybook stories
- Verify in Storybook
- Run accessibility tests

## Open Questions

1. **Expanded state binding**: How to provide two-way binding for `expanded` on templates?
   - Option: Use a context object passed to the template
   - Option: Emit events that bubble up

2. **Template context**: Should we provide context to templates (e.g., `let-expanded`)?

3. **Animation**: How to preserve CSS Grid animation with the new structure?

4. **Deep linking**: Does the new structure affect deep linking implementation?
