# Phase 12: Template-Based API (Option B)

**Goal:** Change the accordion API from structural directives to template directives while preserving the "parent renders everything" architecture required for Angular ARIA's DI to work.

## 12.1 Motivation

The original API used structural directives (`*nfsAccordionTitle`, `*nfsAccordionContent`) on a component (`<nfs-accordion-item>`). This approach had limitations:

1. **DI complexity**: Inner directives needed special registration mechanisms
2. **Content projection challenges**: Logical tree vs DOM tree DI differences
3. **Initialization timing**: Header content needed before trigger rendered

The template-based API solves these by making everything explicit `ng-template` elements that the parent accordion controls.

## 12.2 API Change

**Old API (Structural Directives):**

```html
<nfs-accordion>
  <nfs-accordion-item panelId="panel-1" [(expanded)]="isOpen">
    <span *nfsAccordionTitle>Title</span>
    <p *nfsAccordionContent>Content</p>
  </nfs-accordion-item>
</nfs-accordion>
```

**New API (Template Directives):**

```html
<nfs-accordion>
  <ng-template nfsAccordionItem panelId="panel-1" [(expanded)]="isOpen">
    <ng-template nfsAccordionHeader>Title</ng-template>
    <p>Eager content - renders immediately</p>
    <ng-template nfsAccordionContent>Lazy content - renders when expanded</ng-template>
  </ng-template>
</nfs-accordion>
```

## 12.3 Content Behavior

When the item template is rendered:

- `<ng-template nfsAccordionHeader>` → renders as HTML comment (invisible)
- `<p>Eager content</p>` → renders as visible DOM immediately
- `<ng-template nfsAccordionContent>` → renders as HTML comment (invisible)

The header and lazy content templates are extracted and rendered separately in the accordion structure.

## 12.4 Key Implementation Details

### DI Registration Pattern

Inner directives inject their parent `NfsAccordionItemDef` via `ngTemplateOutletInjector`:

```typescript
// In NfsAccordion
protected getItemInjector(item: NfsAccordionItemDef): Injector {
  return Injector.create({
    providers: [{ provide: NfsAccordionItemDef, useValue: item }],
    parent: this.#injector,
  });
}
```

```html
<ng-container [ngTemplateOutlet]="item.templateRef" [ngTemplateOutletInjector]="getItemInjector(item)" />
```

### Injector Caching

A `WeakMap` caches injectors to prevent infinite change detection cycles:

```typescript
readonly #itemInjectorCache = new WeakMap<NfsAccordionItemDef, Injector>();

protected getItemInjector(item: NfsAccordionItemDef): Injector {
  const cached = this.#itemInjectorCache.get(item);
  if (cached) return cached;
  // Create and cache new injector...
}
```

### Initialization Timing

The trigger button renders BEFORE panel content. Without pre-initialization, `item.headerDef()` would be `null` when rendering the trigger.

**Solution:** Initialize all item templates in `ngAfterContentInit` to trigger directive registration before the accordion structure renders:

```typescript
ngAfterContentInit(): void {
  for (const item of this.itemDefs()) {
    const injector = Injector.create({
      providers: [{ provide: NfsAccordionItemDef, useValue: item }],
      parent: this.#injector,
    });
    this.#itemInjectorCache.set(item, injector);

    const view = this.#viewContainer.createEmbeddedView(item.templateRef, null, { injector });
    view.detectChanges(); // Ensure directive constructors run
    view.destroy(); // Safe - directive instances & templateRefs remain valid
  }
  this.initialized.set(true);
}
```

### Conditional Rendering

The template waits for initialization before rendering the accordion structure:

```html
@if (initialized()) {
<ul ngAccordionGroup class="accordion" role="presentation">
  @for (item of itemDefs(); track item.panelId()) {
  <!-- ... accordion structure ... -->
  }
</ul>
}
```

## 12.5 Files Created

| File                      | Purpose                                |
| ------------------------- | -------------------------------------- |
| `accordion-item-def.ts`   | Template directive for accordion items |
| `accordion-header-def.ts` | Template directive for header content  |

## 12.6 Files Modified

| File                   | Change                                                       |
| ---------------------- | ------------------------------------------------------------ |
| `accordion.ts`         | Query `itemDefs()`, add initialization logic, injector cache |
| `accordion.html`       | New template structure with `@if (initialized())`            |
| `accordion-content.ts` | Add parent registration via DI                               |
| `accordion.stories.ts` | Updated to new template-based API                            |
| `accordion.spec.ts`    | Updated test templates to new API                            |
| `index.ts`             | Export new directives, remove old ones                       |

## 12.7 Files Deleted

| File                 | Reason                              |
| -------------------- | ----------------------------------- |
| `accordion-item.ts`  | Replaced by `NfsAccordionItemDef`   |
| `accordion-title.ts` | Replaced by `NfsAccordionHeaderDef` |

## 12.8 Migration Guide

| Old API                                 | New API                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `<nfs-accordion-item panelId="x">`      | `<ng-template nfsAccordionItem panelId="x">`                                                |
| `<span *nfsAccordionTitle>Title</span>` | `<ng-template nfsAccordionHeader>Title</ng-template>`                                       |
| `<p *nfsAccordionContent>Content</p>`   | `<p>Content</p>` (eager) or `<ng-template nfsAccordionContent>Content</ng-template>` (lazy) |
| `[(expanded)]="isOpen"`                 | `[(expanded)]="isOpen"` (unchanged)                                                         |
| `[disabled]="true"`                     | `[disabled]="true"` (unchanged)                                                             |

## 12.9 Benefits

1. **Explicit content control**: Clear distinction between eager and lazy content
2. **Simplified DI**: Parent accordion controls all rendering with proper injector context
3. **Better initialization**: Header content available before trigger renders
4. **Preserved Angular ARIA compatibility**: DI chain works correctly for accessibility directives
