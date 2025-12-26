# Angular ARIA Accordion: DI & Content Projection Findings

This document captures lessons learned while attempting to integrate Angular ARIA's accordion directives with our content projection-based component architecture.

## Background

We attempted to create an accordion component with this API:

```html
<nfs-accordion>
  <nfs-accordion-item panelId="panel-1">
    <nfs-accordion-header>Title</nfs-accordion-header>
    <p>Content</p>
  </nfs-accordion-item>
</nfs-accordion>
```

Where:

- `NfsAccordion` uses `AccordionGroup` for coordination
- `NfsAccordionItem` uses `AccordionTrigger` and `AccordionPanel` for ARIA

## Angular ARIA Accordion Architecture

### Components and Their Roles

| Directive          | Selector               | Purpose                                           |
| ------------------ | ---------------------- | ------------------------------------------------- |
| `AccordionGroup`   | `[ngAccordionGroup]`   | Parent container that coordinates triggers/panels |
| `AccordionTrigger` | `[ngAccordionTrigger]` | Button that toggles a panel                       |
| `AccordionPanel`   | `[ngAccordionPanel]`   | Content region controlled by a trigger            |

### Internal DI Token

Angular ARIA uses an **internal** `ACCORDION_GROUP` injection token:

```typescript
// In @angular/aria/accordion (NOT EXPORTED)
const ACCORDION_GROUP = new InjectionToken('ACCORDION_GROUP');

// AccordionGroup provides itself via this token
@Directive({
  selector: '[ngAccordionGroup]',
  providers: [{ provide: ACCORDION_GROUP, useExisting: AccordionGroup }]
})
export class AccordionGroup { ... }

// AccordionTrigger injects via this token
@Directive({
  selector: '[ngAccordionTrigger]',
})
export class AccordionTrigger {
  _accordionGroup = inject(ACCORDION_GROUP); // REQUIRED injection
}
```

**Key Point**: The `ACCORDION_GROUP` token is **not exported** from `@angular/aria/accordion`. Only these are exported:

- `AccordionGroup`
- `AccordionTrigger`
- `AccordionPanel`
- `AccordionContent`

### How AccordionGroup Finds Children

AccordionGroup uses `@ContentChildren` queries with `descendants: true`:

```typescript
@ContentChildren(AccordionTrigger, { descendants: true }) _triggers;
@ContentChildren(AccordionPanel, { descendants: true }) _panels;
```

## The Content Projection Problem

### Angular DI with Content Projection

Angular's dependency injection for content-projected elements follows the **logical component tree** (where elements are declared), NOT the **DOM tree** (where they render).

```
User Template (where NfsAccordionItem is DECLARED):
┌─────────────────────────────────────────┐
│ <app-my-page>                           │
│   <nfs-accordion>                       │  ← DI lookup does NOT go here
│     <nfs-accordion-item>                │  ← DI lookup starts here
│       ...AccordionTrigger...            │
│     </nfs-accordion-item>               │
│   </nfs-accordion>                      │
│ </app-my-page>                          │  ← DI lookup goes UP to here
└─────────────────────────────────────────┘
```

### What Happens

1. `NfsAccordionItem` is **declared** in the user's template (e.g., `AppMyPageComponent`)
2. `NfsAccordionItem` is **projected** into `NfsAccordion` via `<ng-content>`
3. `AccordionTrigger` inside `NfsAccordionItem` tries to inject `ACCORDION_GROUP`
4. DI lookup goes: `AccordionTrigger` → `NfsAccordionItem` → `AppMyPageComponent` → `NullInjector`
5. **Result**: `NG0201: No provider found for InjectionToken ACCORDION_GROUP`

The `AccordionGroup` directive on `NfsAccordion` is **never in the DI chain** because content children use their declaration site's injector.

### Attempted Solutions

| Approach                                              | Why It Doesn't Work                                           |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| `hostDirectives` with `AccordionGroup`                | hostDirective providers aren't visible to content children    |
| `AccordionGroup` on inner `<div>`                     | Content children still use declaration-site injector          |
| Extend `AccordionGroup` to override `multiExpandable` | `InputSignalWithTransform` type prevents clean override       |
| Provide `AccordionGroup` in component `providers`     | Creates a disconnected instance (no host element for events)  |
| Create our own `ACCORDION_GROUP` token                | Different object reference than Angular ARIA's internal token |

## AccordionGroup's ContentChildren Queries

Even though DI fails, the `@ContentChildren` queries in `AccordionGroup` **might still work** with content projection because:

- `descendants: true` includes content-projected descendants
- Queries use the rendered DOM tree, not the logical component tree

However, this is moot because `AccordionTrigger` fails to inject `ACCORDION_GROUP` before the queries can run.

## AccordionGroup Features We Need

| Feature                 | Description                   | Works with Content Projection? |
| ----------------------- | ----------------------------- | ------------------------------ |
| `multiExpandable` input | Allow multiple panels open    | N/A (DI fails first)           |
| `disabled` input        | Disable all items             | N/A                            |
| `softDisabled` input    | Focusable but not activatable | N/A                            |
| `wrap` input            | Keyboard nav wraps around     | N/A                            |
| `expandAll()` method    | Expand all panels             | N/A                            |
| `collapseAll()` method  | Collapse all panels           | N/A                            |
| Keyboard navigation     | Arrow keys, Home/End          | N/A                            |
| Coordination            | Single-expand mode            | N/A                            |

## Viable Architectural Options

### Option A: No Content Projection (Data-Driven)

Render items inside `NfsAccordion`'s template using `@for`:

```html
<!-- User template -->
<nfs-accordion [items]="accordionItems" />
```

```typescript
// NfsAccordion template (view children, not content children)
@for (item of items(); track item.id) {
  <div class="accordion-item">
    <button ngAccordionTrigger [panelId]="item.id">{{ item.title }}</button>
    <div ngAccordionPanel [panelId]="item.id">{{ item.content }}</div>
  </div>
}
```

**Pros**: Full Angular ARIA integration works
**Cons**: Less flexible API, can't project arbitrary content

### Option B: Template-Based Items (ViewContainerRef)

Pass templates, render them inside `NfsAccordion`:

```html
<nfs-accordion>
  <ng-template nfsAccordionItem let-expanded>
    <span>Title</span>
    <div *ngIf="expanded">Content</div>
  </ng-template>
</nfs-accordion>
```

**Pros**: Templates become view children when rendered
**Cons**: Different API, more complex for users

### Option C: Manual ARIA Implementation

Don't use `AccordionTrigger`/`AccordionPanel`. Implement ARIA attributes directly:

```html
<button type="button" role="button" [attr.aria-expanded]="expanded()" [attr.aria-controls]="panelId()" [attr.aria-disabled]="disabled() || null" (click)="toggle()"></button>
```

**Pros**: Content projection works, simpler DI
**Cons**: Loses Angular ARIA's keyboard handling, must reimplement

### Option D: Hybrid with Manual Coordination

Use `AccordionGroup` on a wrapper, implement our own trigger/panel without DI:

```typescript
@Component({
  selector: 'nfs-accordion',
  template: `
    <div ngAccordionGroup [multiExpandable]="true">
      <ng-content />
    </div>
  `
})
export class NfsAccordion {
  // Manual coordination via contentChildren query
  items = contentChildren(NfsAccordionItem);

  // Handle single-expand ourselves
  effect(() => { ... });
}
```

Where `NfsAccordionItem` implements ARIA without `AccordionTrigger`/`AccordionPanel`.

**Pros**: AccordionGroup handles keyboard events on its element
**Cons**: Keyboard navigation may not work (needs events to bubble up)

### Option E: Inject Parent Manually

Have `NfsAccordionItem` skip standard DI and look up the DOM tree:

```typescript
export class NfsAccordionItem {
  constructor() {
    // Walk up DOM to find element with ngAccordionGroup
    // This is hacky and fragile
  }
}
```

**Pros**: Might work
**Cons**: Fragile, not idiomatic Angular, breaks with OnPush

## Questions to Answer

1. **Is content projection essential?** Our current API mirrors Material's `mat-expansion-panel`. Is a data-driven API acceptable?

2. **Which Angular ARIA features are critical?**
   - Keyboard navigation (Arrow keys, Home/End)?
   - Focus management?
   - Coordination (single-expand)?
   - ARIA attributes?

3. **Can we contribute to Angular ARIA?** Could we propose exporting `ACCORDION_GROUP` token or adding a content-projection-friendly mode?

4. **Precedent check**: How do Angular Material and Angular CDK handle this? Do they use content projection with their primitives?

## Angular Material Expansion Panel Research

Angular Material's `mat-expansion-panel` uses a **completely different pattern** that DOES work with content projection. Here's why:

### Material's API (Content Projection Works!)

```html
<mat-accordion>
  <mat-expansion-panel>
    <mat-expansion-panel-header>
      <mat-panel-title>Panel Title</mat-panel-title>
    </mat-expansion-panel-header>
    <p>Panel content projected via ng-content</p>
  </mat-expansion-panel>
</mat-accordion>
```

### Key Differences from Angular ARIA

| Aspect             | Angular Material                               | Angular ARIA                       |
| ------------------ | ---------------------------------------------- | ---------------------------------- |
| Token export       | `MAT_ACCORDION` / `CDK_ACCORDION` **EXPORTED** | `ACCORDION_GROUP` **NOT EXPORTED** |
| Injection          | **OPTIONAL** with `skipSelf: true`             | **REQUIRED**                       |
| Standalone support | Items work without parent accordion            | Items fail without parent          |
| Content projection | Works via `<ng-content>`                       | Broken due to DI                   |

### How Material Makes It Work

1. **Exported Token**: `CDK_ACCORDION` is publicly exported, allowing any component to provide it
2. **Optional Injection**: `inject(CDK_ACCORDION, {optional: true, skipSelf: true})`
3. **Graceful Degradation**: Items function independently when no parent exists
4. **Direct Content Projection**: Uses `<ng-content select="mat-expansion-panel-header">` etc.

### Material's Template Structure

```html
<!-- mat-expansion-panel.html -->
<ng-content select="mat-expansion-panel-header"></ng-content>
<div role="region" [attr.inert]="expanded ? null : ''">
  <ng-content></ng-content>
  <ng-template cdkPortalOutlet></ng-template>
  <ng-content select="mat-action-row"></ng-content>
</div>
```

### Material's Provider Pattern

```typescript
// CdkAccordion (exported from @angular/cdk/accordion)
@Directive({
  selector: 'cdk-accordion, [cdkAccordion]',
  providers: [{provide: CDK_ACCORDION, useExisting: CdkAccordion}],
})
export class CdkAccordion { ... }

// CdkAccordionItem - optional parent injection
@Directive({...})
export class CdkAccordionItem {
  accordion = inject(CDK_ACCORDION, {optional: true, skipSelf: true});
  // Works with or without parent!
}
```

## Revised Decision

**New approach: Model after Angular Material/CDK, not Angular ARIA**

The Angular ARIA accordion is designed for **view children only** (directives on elements in the same template). Angular Material's approach explicitly supports content projection.

### Options Reconsidered

1. ~~Option A (Data-driven)~~: Ruled out - too inflexible
2. **Option B (Template-based)**: Still viable but may not be necessary
3. ~~Option C-E~~: Ruled out by user

### New Option F: CDK-Based with Content Projection

Use `@angular/cdk/accordion` instead of `@angular/aria/accordion`:

```html
<nfs-accordion>
  <nfs-accordion-item panelId="panel-1">
    <nfs-accordion-header>Title</nfs-accordion-header>
    <p>Content works via ng-content!</p>
  </nfs-accordion-item>
</nfs-accordion>
```

Where:

- `NfsAccordion` extends or uses `CdkAccordion`
- `NfsAccordionItem` extends or uses `CdkAccordionItem`
- Content projection works because CDK's tokens are exported and injection is optional

**Trade-off**: We lose Angular ARIA's keyboard navigation and ARIA attributes, but we can implement those ourselves on top of CDK's coordination.

## References

- [Angular DI and Content Projection](https://angular.dev/guide/di/hierarchical-dependency-injection)
- [Angular ARIA Accordion Source](https://github.com/angular/components/tree/main/src/components-examples/cdk-experimental/accordion)
- [NG0201 Error](https://v21.angular.dev/errors/NG0201)
- [Angular Material Expansion Panel API](https://material.angular.dev/components/expansion/api)
- [CDK Accordion Source](https://github.com/angular/components/tree/main/src/cdk/accordion)
- [Material Expansion Panel Source](https://github.com/angular/components/tree/main/src/material/expansion)
