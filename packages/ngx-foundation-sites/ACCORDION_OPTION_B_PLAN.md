# Accordion Option B: Template-Based Implementation Plan

## Goal

Change the accordion API from structural directives to template directives while preserving the "parent renders everything" architecture that makes Angular ARIA's DI work.

## Design Decisions

- **Eager content is the default**: DOM content directly in item template renders immediately
- **Lazy content uses `<ng-template nfsAccordionContent>`**: Rendered only when expanded
- **Use ViewContainerRef**: Programmatic view creation, no hidden DOM containers

## Current API (Working)

```html
<nfs-accordion>
  <nfs-accordion-item panelId="panel-1" [(expanded)]="isOpen">
    <span *nfsAccordionTitle>Title</span>
    <p *nfsAccordionContent>Content</p>
  </nfs-accordion-item>
</nfs-accordion>
```

## Target API (Option B)

```html
<nfs-accordion>
  <ng-template nfsAccordionItem [panelId]="'panel-1'" [(expanded)]="isOpen">
    <ng-template nfsAccordionHeader>Title</ng-template>
    <p>Eager content - renders immediately</p>
    <ng-template nfsAccordionContent>Lazy content - renders when expanded</ng-template>
  </ng-template>
</nfs-accordion>
```

### Content Behavior

When the item template is rendered:

- `<ng-template nfsAccordionHeader>` → renders as HTML comment (invisible)
- `<p>Eager content</p>` → renders as visible DOM immediately
- `<ng-template nfsAccordionContent>` → renders as HTML comment (invisible)

The header and lazy content templates are extracted and rendered separately in the accordion structure.

## Implementation Approach

### Key Insight: ng-template renders as comments

When you render a template containing `<ng-template>` elements, they become HTML comments in the DOM. Only the non-template content is visible. This means:

1. Render `item.templateRef` in the panel → shows eager content + comment nodes
2. Render `item.headerDef().templateRef` in the trigger → shows header content
3. Render `item.lazyContentDef().templateRef` via @defer → shows lazy content when expanded

### DI Registration Pattern with Custom Injector

Inner directives need to inject their parent `NfsAccordionItemDef`. Since the item is on a content-child ng-template, we use `ngTemplateOutletInjector` to provide it:

```typescript
// In NfsAccordion
readonly #injector = inject(Injector);

createItemInjector(item: NfsAccordionItemDef): Injector {
  return Injector.create({
    providers: [{ provide: NfsAccordionItemDef, useValue: item }],
    parent: this.#injector
  });
}
```

```html
<ng-container
  [ngTemplateOutlet]="item.templateRef"
  [ngTemplateOutletInjector]="createItemInjector(item)"
/>
```

---

## Implementation Phases

### Phase 1: Create Template Directives

#### 1.1 `NfsAccordionItemDef` (accordion-item-def.ts)

```typescript
@Directive({
  selector: 'ng-template[nfsAccordionItem]',
})
export class NfsAccordionItemDef {
  readonly panelId = input.required<string>();
  readonly expanded = model(false);
  readonly disabled = input(false);
  readonly templateRef: TemplateRef<void> = inject(TemplateRef);

  // Populated by child registration during template instantiation
  readonly headerDef = signal<NfsAccordionHeaderDef | null>(null);
  readonly lazyContentDef = signal<NfsAccordionContentDef | null>(null);
}
```

#### 1.2 `NfsAccordionHeaderDef` (accordion-header-def.ts)

```typescript
@Directive({
  selector: 'ng-template[nfsAccordionHeader]',
})
export class NfsAccordionHeaderDef {
  readonly templateRef: TemplateRef<void> = inject(TemplateRef);

  constructor() {
    // Register with parent item (injected via ngTemplateOutletInjector)
    const parentItem = inject(NfsAccordionItemDef, { optional: true });
    parentItem?.headerDef.set(this);
  }
}
```

#### 1.3 Update `NfsAccordionContentDef` (accordion-content.ts)

Add parent registration:

```typescript
@Directive({
  selector: 'ng-template[nfsAccordionContent]',
})
export class NfsAccordionContentDef {
  readonly templateRef: TemplateRef<void> = inject(TemplateRef);

  constructor() {
    // Register with parent item for lazy content
    const parentItem = inject(NfsAccordionItemDef, { optional: true });
    parentItem?.lazyContentDef.set(this);
  }
}
```

### Phase 2: Rewrite NfsAccordion Template

```html
<!-- Wait for initialization to ensure headerDef is populated -->
@if (initialized()) {
<ul
  ngAccordionGroup
  class="accordion"
  role="presentation"
  [multiExpandable]="multiExpandable()"
  [disabled]="disabled()"
  [softDisabled]="softDisabled()"
  [wrap]="wrap()"
>
  @for (item of itemDefs(); track item.panelId()) {
  <li class="accordion-item" [class.is-active]="item.expanded()">
    <button
      ngAccordionTrigger
      type="button"
      class="accordion-title"
      [panelId]="item.panelId()"
      [disabled]="item.disabled()"
      [(expanded)]="item.expanded"
    >
      <!-- Render header template -->
      @if (item.headerDef(); as headerDef) {
      <ng-container [ngTemplateOutlet]="headerDef.templateRef" />
      }
    </button>
    <div
      ngAccordionPanel
      class="accordion-content"
      [panelId]="item.panelId()"
      [id]="item.panelId()"
    >
      <div class="accordion-content-inner">
        <!-- Render item template (eager content + comment nodes) -->
        <ng-container
          [ngTemplateOutlet]="item.templateRef"
          [ngTemplateOutletInjector]="createItemInjector(item)"
        />

        <!-- Render lazy content when expanded -->
        @if (item.lazyContentDef(); as lazyDef) { @defer (when item.expanded()) {
        <ng-container [ngTemplateOutlet]="lazyDef.templateRef" />
        } }
      </div>
    </div>
  </li>
  }
</ul>
}
```

### Phase 3: NfsAccordion Component Updates

**Critical: Initialization Timing**

The trigger button renders BEFORE the panel content. Without pre-initialization, `item.headerDef()` would be `null` when rendering the trigger because the header directive hasn't been instantiated yet.

**Solution**: Initialize all item templates in `ngAfterContentInit` to trigger registration before the accordion structure renders.

```typescript
@Component({
  selector: 'nfs-accordion',
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordion implements AfterContentInit {
  readonly #injector = inject(Injector);
  readonly #viewContainer = inject(ViewContainerRef);

  /** Query all item template definitions */
  readonly itemDefs = contentChildren(NfsAccordionItemDef);

  /** Track initialization state for template rendering (protected for template access) */
  protected readonly initialized = signal(false);

  // ... existing inputs (multiExpandable, disabled, softDisabled, wrap, etc.)

  ngAfterContentInit(): void {
    // Initialize all item templates to trigger header/content registration
    // This happens BEFORE the template renders, ensuring headerDef is populated
    for (const item of this.itemDefs()) {
      const injector = Injector.create({
        providers: [{ provide: NfsAccordionItemDef, useValue: item }],
        parent: this.#injector,
      });
      // Create embedded view to instantiate directives
      const view = this.#viewContainer.createEmbeddedView(
        item.templateRef,
        null,
        { injector }
      );
      view.detectChanges(); // Ensure directive constructors run
      view.destroy(); // Safe to destroy - directive instances & templateRefs remain valid
    }
    this.initialized.set(true);
  }

  /** Create injector for item template to enable child registration */
  protected createItemInjector(item: NfsAccordionItemDef): Injector {
    return Injector.create({
      providers: [{ provide: NfsAccordionItemDef, useValue: item }],
      parent: this.#injector,
    });
  }
}
```

**Why This Works**:

1. `createEmbeddedView()` instantiates all directives in the template
2. `NfsAccordionHeaderDef` constructor runs, injecting `NfsAccordionItemDef` via the custom injector
3. Header registers itself: `parentItem.headerDef.set(this)`
4. After `view.destroy()`, the directive instance and its `templateRef` remain valid
5. When the accordion template renders, `item.headerDef()` returns the registered header

### Phase 4: Port Existing Features

All existing features remain unchanged:

- Deep linking (same logic, just use `itemDefs()` instead of `items()`)
- allowAllClosed enforcement
- expandAll/collapseAll methods
- plusminus toggle CSS class

### Phase 5: Update Stories

Example story with new API:

```typescript
export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        NfsAccordion,
        NfsAccordionItemDef,
        NfsAccordionHeaderDef,
        NfsAccordionContentDef,
      ],
    },
    template: `
      <nfs-accordion [multiExpandable]="multiExpandable" [disabled]="disabled">
        <ng-template nfsAccordionItem panelId="panel-1">
          <ng-template nfsAccordionHeader>Accordion 1</ng-template>
          <p>Panel 1 eager content. Lorem ipsum dolor sit amet.</p>
        </ng-template>
        <ng-template nfsAccordionItem panelId="panel-2">
          <ng-template nfsAccordionHeader>Accordion 2</ng-template>
          <p>Panel 2 eager content.</p>
          <ng-template nfsAccordionContent>
            <p>Lazy loaded content for panel 2.</p>
          </ng-template>
        </ng-template>
      </nfs-accordion>
    `,
  }),
};
```

---

## File Changes Summary

| File                    | Action       | Path                                                                       |
| ----------------------- | ------------ | -------------------------------------------------------------------------- |
| `accordion-item-def.ts` | **NEW**      | `packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts`    |
| `accordion-header.ts`   | **REWRITE**  | Rename to `accordion-header-def.ts`, change to directive                   |
| `accordion-content.ts`  | **MODIFY**   | Add parent registration                                                    |
| `accordion.ts`          | **MODIFY**   | Query itemDefs, add initialization logic, add createItemInjector           |
| `accordion.html`        | **REWRITE**  | New template structure with @if (initialized())                            |
| `accordion-item.ts`     | **DELETE**   | Replaced by `NfsAccordionItemDef` directive                                |
| `accordion-title.ts`    | **DELETE**   | Replaced by `NfsAccordionHeaderDef` directive                              |
| `index.ts`              | **UPDATE**   | Export changes                                                             |
| `accordion.stories.ts`  | **REWRITE**  | New API                                                                    |

---

## Migration Guide

| Old API                                  | New API                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `<nfs-accordion-item panelId="x">`       | `<ng-template nfsAccordionItem panelId="x">`                                                     |
| `<span *nfsAccordionTitle>Title</span>`  | `<ng-template nfsAccordionHeader>Title</ng-template>`                                            |
| `<p *nfsAccordionContent>Content</p>`    | `<p>Content</p>` (eager) or `<ng-template nfsAccordionContent>Content</ng-template>` (lazy)      |
| `[(expanded)]="isOpen"`                  | `[(expanded)]="isOpen"` (unchanged)                                                              |
| `[disabled]="true"`                      | `[disabled]="true"` (unchanged)                                                                  |

---

## Key Learnings (See ANGULAR_ARIA_ACCORDION_FINDINGS.md)

1. **Angular ARIA's `ACCORDION_GROUP` token is NOT exported** - can't provide it ourselves
2. **Content projection uses logical tree for DI** - not DOM tree
3. **Angular Material/CDK works differently** - exported tokens, optional injection
4. **CDK Accordion lacks accessibility** - ruled out as alternative
5. **Solution**: Render Angular ARIA directives as VIEW CHILDREN (templates)
