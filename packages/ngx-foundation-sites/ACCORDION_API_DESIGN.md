# NfsAccordion API Design

## Goal

Provide an Angular-native, accessible implementation of Foundation for Sites' Accordion component that exposes Foundation-equivalent inputs, outputs, and methods, follows the project's directive-first design philosophy, and uses Foundation's CSS classes for styling (no Foundation JS).

## Research Summary

### Foundation Accordion Features

| Feature | CSS/HTML | Notes |
| ------- | ------- | ----- |
| Container | `.accordion` | Top-level wrapper for accordion items |
| Item | `.accordion-item` | Represents a single accordion panel and title |
| Title | `.accordion-title` | Clickable control that toggles an item's panel |
| Content | `.accordion-content` | Panel wrapper containing item content |
| State classes | `.is-active`, `.is-open` | Used to reflect expanded state |

### CSS Class → Angular Mapping

| Foundation CSS Class | Angular Component/Directive | Rationale |
| -------------------- | --------------------------- | --------- |
| `.accordion` | `NfsAccordion` (component) | Container that manages items and shared config |
| `.accordion-item` | `NfsAccordionItem` (component) | Per-item host, owns expanded state and IDs |
| `.accordion-title` | `NfsAccordionTitle` (component) | Renders as a native `button` with proper ARIA |
| `.accordion-content` | `NfsAccordionContent` (structural directive) | Lazy content rendering via `ng-template` |

### WAI-ARIA Requirements

| Element | ARIA Attributes |
| ------- | --------------- |
| Title button | `aria-expanded`, `aria-controls`, `aria-disabled` (if applicable) |
| Panel wrapper | `role="region"`, `aria-labelledby` |
| IDs | Unique `id` for title and panel to link `aria-controls`/`aria-labelledby` |

## Proposed Component API

### Component Hierarchy

NfsAccordion
├─ NfsAccordionItem[]
   ├─ NfsAccordionTitle
   └─ NfsAccordionContent (ng-template)

### 1. NfsAccordion (Container)

- Selector: `nfs-accordion`
- Host class: `accordion`
- ChangeDetection: `OnPush`

Inputs (match Foundation `data-*` names in camelCase):
- `multiExpand: InputSignal<boolean>` — Foundation `data-multi-expand` (default: `false`)
- `allowAllClosed: InputSignal<boolean>` — Foundation `data-allow-all-closed` (default: `false`)
- `deepLink: InputSignal<boolean>` — Foundation `data-deep-link` (default: `false`)
- `deepLinkSmudge: InputSignal<boolean>` — Foundation option (default: `false`)
- `deepLinkSmudgeDelay: InputSignal<number>` — (default: `300`)
- `deepLinkSmudgeOffset: InputSignal<number>` — (default: `0`)
- `updateHistory: InputSignal<boolean>` — control history updates (default: `false`)

Outputs:
- `down: OutputEmitterRef<{ itemId: string; expanded: true }>` — emitted when an item opens (Foundation parity)
- `up: OutputEmitterRef<{ itemId: string; expanded: false }>` — emitted when an item closes

Public methods:
- `openAll?()` — optional utility when `multiExpand=true`
- `closeAll?()` — optional utility

DI Token:
- Exported token `nfsAccordionToken` (InjectionToken<NfsAccordion>) — provide `useExisting: NfsAccordion` in component providers. Children inject with `{ optional: true, skipSelf: true }`.

Behavior:
- Manages item registration (`registerItem(item: NfsAccordionItem)`) and state notifications (`notifyItemToggle(itemId, expanded)`).
- Enforces single-expand when `multiExpand=false` and prevents closing last item when `allowAllClosed=false`.

### 2. NfsAccordionItem (Child)

- Selector: `nfs-accordion-item`
- Host class: `accordion-item`

Inputs:
- `panelId: string | undefined` — user-provided panel id; if not provided, generated as `${accordionInstanceId}-panel-${index}`
- `expanded: ModelSignal<boolean>` — two-way model signal for expanded state (default: `false`)
- `disabled: InputSignal<boolean>` — (default: `false`)

Public methods (Foundation JS parity):
- `down()` — expand the item (respects `disabled`)
- `up()` — collapse the item (asks parent `canCloseItem()`)
- `toggle()` — toggle expanded state

Behavior:
- Registers with parent `NfsAccordion` on init and unregisters on destroy.
- Emits state changes via container `down`/`up` outputs through `notifyItemToggle`.
- Applies `.is-active` class when expanded.

### 3. NfsAccordionTitle

- Selector: `nfs-accordion-title` (consumer can use via component or directive alternative)
- Renders as `<button>` with `aria-expanded`, `aria-controls`, and `id` attributes.

Behavior:
- Clicking calls the associated `NfsAccordionItem.toggle()` method.
- Handles keyboard activation (Enter/Space) and delegates focus management to `NfsAccordion`.

### 4. NfsAccordionContent (Structural Directive)

- Selector: `ng-template[nfsAccordionContent]`
- Purpose: Lazy rendering of panel content. Stores `TemplateRef` and lets `NfsAccordionItem` render it when expanded or when `hasBeenExpanded()` is true.

## Usage Examples

Basic accordion (single expand):

```html
<nfs-accordion>
  <nfs-accordion-item>
    <nfs-accordion-title>Section 1</nfs-accordion-title>
    <ng-template nfsAccordionContent>
      <p>Content for section 1</p>
    </ng-template>
  </nfs-accordion-item>
  <nfs-accordion-item>
    <nfs-accordion-title>Section 2</nfs-accordion-title>
    <ng-template nfsAccordionContent>
      <p>Content for section 2</p>
    </ng-template>
  </nfs-accordion-item>
</nfs-accordion>
```

Multi-expand with deep linking:

```html
<nfs-accordion [multiExpand]="true" [deepLink]="true" [updateHistory]="true">
  <!-- items -->
</nfs-accordion>
```

Programmatic control (Foundation parity):

```ts
// Inject or query the item instance
item.down(); // opens
item.up(); // closes
item.toggle(); // toggles

// Listen to container events
accordion.down.subscribe(({ itemId }) => console.log('opened', itemId));
accordion.up.subscribe(({ itemId }) => console.log('closed', itemId));
```

## Rendered HTML Structure (expected)

```html
<div class="accordion">
  <div class="accordion-item is-active">
    <button class="accordion-title" id="accordion-1-title-0" aria-expanded="true" aria-controls="accordion-1-panel-0">Section 1</button>
    <div id="accordion-1-panel-0" class="accordion-content" role="region" aria-labelledby="accordion-1-title-0"> ... </div>
  </div>
  <!-- more items -->
</div>
```

## CSS Custom Properties

- Prefer Foundation Sass variables; expose minimal CSS custom properties only when necessary for runtime theming.

## Keyboard Navigation

| Key | Action |
| --- | ------ |
| Enter / Space | Toggle focused title |
| ArrowDown | Move focus to next enabled title (wrap if configured) |
| ArrowUp | Move focus to previous enabled title |
| Home | Move focus to first title |
| End | Move focus to last title |

## Comparison with Foundation JS

- Foundation JS exposes `.down($target)`, `.up($target)`, `.toggle($target)` and jQuery events `down.zf.accordion`, `up.zf.accordion`.
- This design provides `down()`, `up()`, `toggle()` methods on `NfsAccordionItem` and container outputs `down`/`up` (payload: `{ itemId, expanded }`) to match behavior and naming.

## Implementation Notes

- Use `nfsAccordionToken` InjectionToken and `useExisting` provider pattern for DI between container and children.
- Use `signal()`/`computed()` for state and `InputSignal`/`ModelSignal` for inputs and two-way expanded binding.
- Use `@defer` or `ng-template[nfsAccordionContent]` for lazy content.
- Ensure SSR safety: guard window/document usage with `isPlatformBrowser()`.
- Use `inert` on collapsed panel wrappers and keep wrapper in DOM to preserve stable `aria-controls` references.

## Files to Create

- `src/lib/accordion/accordion.component.ts` — `NfsAccordion` container
- `src/lib/accordion/accordion-item.component.ts` — `NfsAccordionItem`
- `src/lib/accordion/accordion-title.component.ts` — `NfsAccordionTitle`
- `src/lib/accordion/accordion-content.directive.ts` — `NfsAccordionContent`
- `src/lib/accordion/accordion.token.ts` — exports `nfsAccordionToken`
- `src/lib/accordion/id-generator.ts` — small helper for unique IDs
- `src/lib/accordion/index.ts` — public exports
- Storybook stories under `.storybook/stories/accordion/`

## Design Decisions

- Directive-first for `nfsAccordionContent` to allow consumers to place templates inline and prevent unnecessary wrapper components.
- Keep Foundation CSS classes as the authoritative source for class names and state classes (`.is-active`).
- Expose Foundation API names for parity; prefer Angular idiomatic patterns where unavoidable but document differences.
# NfsAccordion API Design

## Goal

Design an Angular component API for Foundation Accordion that:

- Uses **Foundation for Sites CSS** (no Foundation JavaScript)
- Complies with **WAI-ARIA Accordion pattern**
- Follows **Angular CDK/Material API conventions**
- Uses **modern Angular APIs** (signals, input/output functions)
- Supports **content projection** (not data-driven)

---

## Research Summary

### Foundation Accordion Features

| Feature          | CSS/HTML              | Notes                       |
| ---------------- | --------------------- | --------------------------- |
| Container        | `.accordion`          | Root element                |
| Item             | `.accordion-item`     | Each panel wrapper          |
| Header/Trigger   | `.accordion-title`    | Clickable header            |
| Panel            | `.accordion-content`  | Collapsible content         |
| Expanded state   | `.is-active`          | On `.accordion-item`        |
| Plus/minus icons | CSS `::before` pseudo | Controlled by Sass variable |

### WAI-ARIA Requirements

| Element         | ARIA Attributes                                                    |
| --------------- | ------------------------------------------------------------------ |
| Trigger         | `role="button"`, `aria-expanded`, `aria-controls`, `aria-disabled` |
| Trigger wrapper | Heading element (`<h3>`) with appropriate level                    |
| Panel           | `role="region"`, `aria-labelledby`                                 |
| Keyboard        | Enter/Space toggle, Arrow keys (optional), Home/End (optional)     |

### Angular CDK Accordion Pattern (Content Projection Compatible!)

```typescript
// CDK exports its token - THIS IS KEY for content projection
const CDK_ACCORDION: InjectionToken<CdkAccordion>;

// Optional injection allows items to work standalone
accordion = inject(CDK_ACCORDION, { optional: true, skipSelf: true });
```

### Why CDK Pattern Works (Angular ARIA Doesn't)

From `ANGULAR_ARIA_ACCORDION_FINDINGS.md`:

- Angular ARIA's `ACCORDION_GROUP` token is **not exported**
- Angular ARIA's injection is **required** (fails without parent)
- CDK's token is **exported** and injection is **optional**
- Content-projected children use **declaration-site injector** (not DOM tree)
- CDK pattern gracefully handles this; Angular ARIA doesn't

---

## Proposed Component API

### Component Hierarchy

```
NfsAccordion (container, class="accordion")
└── NfsAccordionItem (panel wrapper, class="accordion-item")
    ├── NfsAccordionTitle (trigger button, class="accordion-title")
    └── <content> or ng-template[nfsAccordionContent] (lazy, class="accordion-content")
```

**Naming rationale**: Component names match Foundation's CSS class names (`.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`).

### 1. NfsAccordion (Container)

**Selector:** `nfs-accordion`

**Host Element:** Renders as `<ul class="accordion">`

```typescript
@Component({
  selector: 'nfs-accordion',
  template: `<ng-content />`,
  host: {
    class: 'accordion',
    '[attr.data-allow-all-closed]': 'allowAllClosed() || null',
  },
})
export class NfsAccordion {
  // === Inputs (names match Foundation data attributes / Sass variables) ===

  /** Allow multiple panels to be expanded simultaneously (data-multi-expand) */
  readonly multiExpand = input(false);

  /** Allow all panels to be closed (data-allow-all-closed) */
  readonly allowAllClosed = input(false);

  /** Disable all accordion items (disabled attribute) */
  readonly disabled = input(false);

  /** Synchronize expanded panel with URL hash (data-deep-link) */
  readonly deepLink = input(false);

  /** Auto-scroll to deep-linked panel (data-deep-link-smudge) */
  readonly deepLinkSmudge = input(false);

  /** Delay before scrolling to deep-linked panel in ms (data-deep-link-smudge-delay) */
  readonly deepLinkSmudgeDelay = input(300);

  /** Offset for scroll position, e.g. sticky header height (data-deep-link-smudge-offset) */
  readonly deepLinkSmudgeOffset = input(0);

  /** Use pushState instead of replaceState for deep linking (data-update-history) */
  readonly updateHistory = input(false);

  // === Inputs (Angular extensions, not in Foundation) ===

  /** Keyboard navigation wraps from last to first (and vice versa) */
  readonly wrap = input(false);

  /** Heading level for accordion titles. Set 1-6 to wrap triggers in heading elements for ARIA. */
  readonly titleHeadingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | null>(null);

  /** When disabled, items remain focusable but not activatable (better a11y) */
  readonly softDisabled = input(true);

  // === Methods ===

  /** Expand all panels (only works when multiExpand=true) */
  openAll(): void;

  /** Collapse all panels (only works when allowAllClosed=true) */
  closeAll(): void;
}
```

### 2. NfsAccordionItem (Panel Wrapper)

**Selector:** `nfs-accordion-item`

**Host Element:** Renders as `<li class="accordion-item">`

```typescript
@Component({
  selector: 'nfs-accordion-item',
  template: `
    <ng-content select="nfs-accordion-title" />
    <div class="accordion-content" [id]="panelId()" role="region" [attr.aria-labelledby]="triggerId()" [attr.inert]="expanded() ? null : ''">
      @if (lazyContent(); as lazy) {
        @if (expanded() || hasBeenExpanded()) {
          <ng-container [ngTemplateOutlet]="lazy.templateRef" />
        }
      } @else {
        <ng-content />
      }
    </div>
  `,
  host: {
    class: 'accordion-item',
    '[class.is-active]': 'expanded()',
  },
})
export class NfsAccordionItem {
  // === Inputs ===

  /** Unique identifier for this panel (used for deep linking and ARIA) */
  readonly panelId = input.required<string>();

  /** Whether the panel is expanded */
  readonly expanded = model(false);

  /** Whether this item is disabled */
  readonly disabled = input(false);

  // === Outputs ===

  /** Emitted when the panel is opened */
  readonly opened = output<void>();

  /** Emitted when the panel is closed */
  readonly closed = output<void>();

  /** Emitted after expand animation completes */
  readonly afterExpand = output<void>();

  /** Emitted after collapse animation completes */
  readonly afterCollapse = output<void>();

  // === Methods ===

  /** Expand this panel */
  open(): void;

  /** Collapse this panel */
  close(): void;

  /** Toggle this panel */
  toggle(): void;
}
```

### 3. NfsAccordionTitle (Trigger)

**Selector:** `nfs-accordion-title`

**Host Element:** `<button class="accordion-title">`, optionally wrapped in heading element

```typescript
@Component({
  selector: 'nfs-accordion-title',
  template: `
    @if (accordion?.titleHeadingLevel(); as level) {
      <div role="heading" [attr.aria-level]="level">
        <ng-container [ngTemplateOutlet]="buttonTpl" />
      </div>
    } @else {
      <ng-container [ngTemplateOutlet]="buttonTpl" />
    }

    <ng-template #buttonTpl>
      <button type="button" class="accordion-title" [id]="triggerId()" [attr.aria-expanded]="item.expanded()" [attr.aria-controls]="item.panelId()" [attr.aria-disabled]="isAriaDisabled() || null" [disabled]="isHardDisabled() || null" (click)="onClick()" (keydown)="onKeydown($event)">
        <ng-content />
      </button>
    </ng-template>
  `,
})
export class NfsAccordionTitle {
  // Injected references (optional for standalone usage)
  protected readonly accordion = inject(NfsAccordion, { optional: true });
  protected readonly item = inject(NfsAccordionItem);
}
```

### 4. NfsAccordionContent (Lazy Content)

**Selector:** `ng-template[nfsAccordionContent]`

```typescript
@Directive({
  selector: 'ng-template[nfsAccordionContent]',
})
export class NfsAccordionContent {
  readonly templateRef = inject(TemplateRef);

  constructor() {
    // Auto-register with parent item
    inject(NfsAccordionItem).registerLazyContent(this);
  }
}
```

---

## Usage Examples

### Basic Usage

```html
<nfs-accordion>
  <nfs-accordion-item panelId="panel-1">
    <nfs-accordion-title>Section 1</nfs-accordion-title>
    <p>Content for section 1...</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="panel-2">
    <nfs-accordion-title>Section 2</nfs-accordion-title>
    <p>Content for section 2...</p>
  </nfs-accordion-item>
</nfs-accordion>
```

### With Heading Level (for ARIA document outline)

```html
<!-- Wraps triggers in <h3> elements for screen reader navigation -->
<nfs-accordion [titleHeadingLevel]="3">
  <nfs-accordion-item panelId="panel-1">
    <nfs-accordion-title>Section 1</nfs-accordion-title>
    <p>Content...</p>
  </nfs-accordion-item>
</nfs-accordion>
```

### Multi-expand with Initially Expanded Panel

```html
<nfs-accordion [multiExpand]="true">
  <nfs-accordion-item panelId="info" [expanded]="true">
    <nfs-accordion-title>Information</nfs-accordion-title>
    <p>This panel is expanded by default.</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="settings">
    <nfs-accordion-title>Settings</nfs-accordion-title>
    <p>Configure your preferences...</p>
  </nfs-accordion-item>
</nfs-accordion>
```

### Two-way Binding

```html
<nfs-accordion>
  <nfs-accordion-item panelId="details" [(expanded)]="isDetailsOpen">
    <nfs-accordion-title>Details</nfs-accordion-title>
    <p>Details content...</p>
  </nfs-accordion-item>
</nfs-accordion>

<button (click)="isDetailsOpen = !isDetailsOpen">Toggle Details Externally</button>
```

### Lazy Content Loading

```html
<nfs-accordion>
  <nfs-accordion-item panelId="heavy">
    <nfs-accordion-title>Heavy Content</nfs-accordion-title>
    <ng-template nfsAccordionContent>
      <!-- Only rendered when panel is first opened -->
      <app-expensive-component />
    </ng-template>
  </nfs-accordion-item>
</nfs-accordion>
```

### With Events

```html
<nfs-accordion>
  <nfs-accordion-item panelId="events" (opened)="onPanelOpened()" (closed)="onPanelClosed()" (afterExpand)="onAnimationComplete()">
    <nfs-accordion-title>Event Demo</nfs-accordion-title>
    <p>Watch the console...</p>
  </nfs-accordion-item>
</nfs-accordion>
```

### Deep Linking

```html
<!-- URL: /page#settings will auto-expand this panel -->
<nfs-accordion [deepLink]="true" [deepLinkSmudge]="true">
  <nfs-accordion-item panelId="profile">
    <nfs-accordion-title>Profile</nfs-accordion-title>
    <p>Profile settings...</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="settings">
    <nfs-accordion-title>Settings</nfs-accordion-title>
    <p>Application settings...</p>
  </nfs-accordion-item>
</nfs-accordion>
```

### Disabled States

```html
<!-- Entire accordion disabled -->
<nfs-accordion [disabled]="true"> ... </nfs-accordion>

<!-- Individual item disabled -->
<nfs-accordion>
  <nfs-accordion-item panelId="locked" [disabled]="true">
    <nfs-accordion-title>Locked Section</nfs-accordion-title>
    <p>This section cannot be toggled.</p>
  </nfs-accordion-item>
</nfs-accordion>
```

### Programmatic Control

```typescript
@Component({...})
export class MyComponent {
  @ViewChild(NfsAccordion) accordion!: NfsAccordion;
  @ViewChildren(NfsAccordionItem) items!: QueryList<NfsAccordionItem>;

  expandAll() {
    this.accordion.openAll();
  }

  collapseAll() {
    this.accordion.closeAll();
  }

  expandFirst() {
    this.items.first.open();
  }
}
```

---

## Rendered HTML Structure

### Without titleHeadingLevel (default)

```html
<!-- nfs-accordion renders as: -->
<ul class="accordion">
  <!-- nfs-accordion-item renders as: -->
  <li class="accordion-item is-active">
    <!-- nfs-accordion-title renders as (no heading wrapper): -->
    <button type="button" class="accordion-title" id="accordion-item-1-trigger" aria-expanded="true" aria-controls="accordion-item-1-panel">Section Title</button>

    <!-- Panel content (class="accordion-content") -->
    <div class="accordion-content" id="accordion-item-1-panel" role="region" aria-labelledby="accordion-item-1-trigger">
      <p>Panel content here...</p>
    </div>
  </li>
</ul>
```

### With titleHeadingLevel="3"

```html
<ul class="accordion">
  <li class="accordion-item is-active">
    <!-- nfs-accordion-title wrapped in ARIA heading -->
    <div role="heading" aria-level="3">
      <button type="button" class="accordion-title" id="accordion-item-1-trigger" aria-expanded="true" aria-controls="accordion-item-1-panel">Section Title</button>
    </div>

    <div class="accordion-content" id="accordion-item-1-panel" role="region" aria-labelledby="accordion-item-1-trigger">
      <p>Panel content here...</p>
    </div>
  </li>
</ul>
```

---

## Keyboard Navigation

| Key               | Action                             |
| ----------------- | ---------------------------------- |
| `Enter` / `Space` | Toggle focused panel               |
| `Tab`             | Move to next focusable element     |
| `Shift+Tab`       | Move to previous focusable element |
| `↓` (optional)    | Move focus to next header          |
| `↑` (optional)    | Move focus to previous header      |
| `Home` (optional) | Move focus to first header         |
| `End` (optional)  | Move focus to last header          |

---

## Comparison with Angular Material

| Feature      | Angular Material                                           | NfsAccordion                       |
| ------------ | ---------------------------------------------------------- | ---------------------------------- |
| Container    | `<mat-accordion>`                                          | `<nfs-accordion>`                  |
| Item         | `<mat-expansion-panel>`                                    | `<nfs-accordion-item>`             |
| Trigger      | `<mat-expansion-panel-header>`                             | `<nfs-accordion-title>`            |
| Lazy content | `ng-template[matExpansionPanelContent]`                    | `ng-template[nfsAccordionContent]` |
| Multi-expand | `[multi]`                                                  | `[multiExpand]`                    |
| Expanded     | `[expanded]` / `[(expanded)]`                              | `[expanded]` / `[(expanded)]`      |
| Events       | `opened`, `closed`, `afterExpand`, `afterCollapse`         | Same                               |
| Methods      | `open()`, `close()`, `toggle()`, `openAll()`, `closeAll()` | Same                               |

**Foundation-matching inputs:**

- `multiExpand` - Allow multiple panels open (data-multi-expand)
- `allowAllClosed` - Allow all panels closed (data-allow-all-closed)
- `deepLink` - URL hash synchronization (data-deep-link)
- `deepLinkSmudge` - Auto-scroll to panel (data-deep-link-smudge)
- `deepLinkSmudgeDelay` - Scroll delay (data-deep-link-smudge-delay)
- `deepLinkSmudgeOffset` - Scroll offset (data-deep-link-smudge-offset)
- `updateHistory` - Use pushState (data-update-history)

**Angular extensions (not in Foundation):**

- `wrap` - Keyboard navigation wrapping
- `titleHeadingLevel` - Optional heading wrapper for ARIA
- `softDisabled` - Keep disabled items focusable (better a11y)

---

## Implementation Notes

### DI Token Strategy (Critical for Content Projection)

```typescript
// Export the token so consumers can provide alternatives (camelCase with Token suffix)
export const nfsAccordionToken = new InjectionToken<NfsAccordion>('nfsAccordionToken');

@Component({
  selector: 'nfs-accordion',
  providers: [{ provide: nfsAccordionToken, useExisting: NfsAccordion }],
})
export class NfsAccordion { ... }

@Component({
  selector: 'nfs-accordion-item',
})
export class NfsAccordionItem {
  // CRITICAL: Optional injection with skipSelf
  // This allows content projection to work!
  readonly accordion = inject(nfsAccordionToken, { optional: true, skipSelf: true });
}
```

### Animation Strategy

Use CSS Grid animation for smooth expand/collapse:

```scss
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows $nfs-accordion-slide-speed cubic-bezier(0.25, 0.46, 0.45, 0.94);

  > * {
    overflow: hidden;
  }
}

.accordion-item.is-active .accordion-content {
  grid-template-rows: 1fr;
}
```

### Focus Management

When a panel collapses and the focus was inside it, move focus to the panel's trigger button to prevent focus loss.

---

## Files to Create

```
packages/ngx-foundation-sites/src/lib/accordion/
├── accordion.ts                    # NfsAccordion component
├── accordion-item.ts               # NfsAccordionItem component
├── accordion-title.ts              # NfsAccordionTitle component (trigger)
├── accordion-content.ts            # NfsAccordionContent directive (lazy)
├── accordion.token.ts              # nfsAccordionToken injection token
├── accordion-deep-link.service.ts  # Deep linking service
├── accordion.scss                  # Component styles
├── accordion.stories.ts            # Storybook stories
├── accordion.spec.ts               # Unit tests
└── index.ts                        # Public API exports
```

---

## Design Decisions (Finalized)

| Decision            | Choice                               | Rationale                                                |
| ------------------- | ------------------------------------ | -------------------------------------------------------- |
| Input naming        | Match Foundation data attributes     | `multiExpand`, `allowAllClosed`, `deepLink`, etc.        |
| Plus/minus icons    | `$accordion-plusminus` Sass variable | Compile-time theming via consumer's settings file        |
| `titleHeadingLevel` | Default to `null` (no heading)       | Set to 1-6 to wrap triggers in heading elements for ARIA |
| `softDisabled`      | Include (Angular extension)          | Better a11y - disabled items stay in tab order           |
| Action row          | Skip for v1                          | Keep API minimal                                         |
| Eager/lazy content  | Both supported                       | `ng-template[nfsAccordionContent]` for lazy              |
| Component names     | Match Foundation CSS classes         | `.accordion-title` → `NfsAccordionTitle`                 |
| Token naming        | camelCase with `Token` suffix        | `nfsAccordionToken`                                      |
