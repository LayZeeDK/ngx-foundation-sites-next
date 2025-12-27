# NfsTabs API Design

## Goal

Design an Angular component API for Foundation Tabs that:

- Uses **Foundation for Sites CSS** (no Foundation JavaScript)
- Complies with **WAI-ARIA Tabs pattern**
- Follows **Angular Material Tabs API conventions** (familiar to Angular developers)
- Uses **modern Angular APIs** (signals, input/output functions)
- Names components to match **Foundation CSS class names** (`.tabs`, `.tabs-panel`, `.tabs-title`)
- Supports both **eager and lazy content rendering**

---

## Research Summary

### Foundation Tabs Features

| Feature         | CSS/HTML                   | Notes                                   |
| --------------- | -------------------------- | --------------------------------------- |
| Container       | `.tabs`                    | Tab list wrapper (`<ul>`)               |
| Tab item        | `.tabs-title`              | Individual tab (`<li>`)                 |
| Tab link        | `<a>` inside `.tabs-title` | Clickable trigger                       |
| Content wrapper | `.tabs-content`            | Container for all panels                |
| Panel           | `.tabs-panel`              | Individual content panel                |
| Active state    | `.is-active`               | On both `.tabs-title` and `.tabs-panel` |
| Vertical        | `.vertical`                | On both `.tabs` and `.tabs-content`     |

### Foundation Data Attributes → Input Names

| Data Attribute                 | Input Name             | Type      | Default |
| ------------------------------ | ---------------------- | --------- | ------- |
| `data-deep-link`               | `deepLink`             | `boolean` | `false` |
| `data-deep-link-smudge`        | `deepLinkSmudge`       | `boolean` | `false` |
| `data-deep-link-smudge-delay`  | `deepLinkSmudgeDelay`  | `number`  | `300`   |
| `data-deep-link-smudge-offset` | `deepLinkSmudgeOffset` | `number`  | `0`     |
| `data-update-history`          | `updateHistory`        | `boolean` | `false` |
| `data-active-collapse`         | `activeCollapse`       | `boolean` | `false` |
| `data-wrap-on-keys`            | `wrapOnKeys`           | `boolean` | `true`  |
| `data-match-height`            | `matchHeight`          | `boolean` | `false` |
| `data-auto-focus`              | `autoFocus`            | `boolean` | `false` |

### Foundation Sass Variables → CSS Custom Properties

| Sass Variable                | CSS Custom Property               |
| ---------------------------- | --------------------------------- |
| `$tab-margin`                | `--nfs-tab-margin`                |
| `$tab-background`            | `--nfs-tab-background`            |
| `$tab-color`                 | `--nfs-tab-color`                 |
| `$tab-background-active`     | `--nfs-tab-background-active`     |
| `$tab-active-color`          | `--nfs-tab-active-color`          |
| `$tab-item-font-size`        | `--nfs-tab-item-font-size`        |
| `$tab-item-background-hover` | `--nfs-tab-item-background-hover` |
| `$tab-item-padding`          | `--nfs-tab-item-padding`          |
| `$tab-content-background`    | `--nfs-tab-content-background`    |
| `$tab-content-border`        | `--nfs-tab-content-border`        |
| `$tab-content-color`         | `--nfs-tab-content-color`         |
| `$tab-content-padding`       | `--nfs-tab-content-padding`       |

### WAI-ARIA Requirements

| Element       | Role       | ARIA Attributes                                                    |
| ------------- | ---------- | ------------------------------------------------------------------ |
| Tab container | `tablist`  | `aria-label` or `aria-labelledby`, `aria-orientation`              |
| Tab           | `tab`      | `aria-selected`, `aria-controls`, `id`, `tabindex`                 |
| Panel         | `tabpanel` | `aria-labelledby`, `id`, `tabindex="0"` (if no focusable children) |

### Keyboard Navigation

| Key               | Action                                       |
| ----------------- | -------------------------------------------- |
| `←` / `→`         | Move focus to previous/next tab (horizontal) |
| `↑` / `↓`         | Move focus to previous/next tab (vertical)   |
| `Home`            | Move focus to first tab                      |
| `End`             | Move focus to last tab                       |
| `Space` / `Enter` | Activate focused tab (manual mode)           |
| `Tab`             | Move focus to panel content                  |

### Angular Material Tabs API (Reference)

| Component       | Key Inputs                                                                                 | Key Outputs                                                                |
| --------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `MatTabGroup`   | `selectedIndex`, `animationDuration`, `dynamicHeight`, `preserveContent`, `headerPosition` | `selectedIndexChange`, `selectedTabChange`, `focusChange`, `animationDone` |
| `MatTab`        | `label`, `disabled`, `aria-label`, `aria-labelledby`                                       | -                                                                          |
| `MatTabContent` | (lazy loading directive)                                                                   | -                                                                          |
| `MatTabLabel`   | (custom label template)                                                                    | -                                                                          |

---

## Proposed Component API

### Component Hierarchy (Material-style API, Foundation-aligned names)

```
NfsTabs (container, renders .tabs + .tabs-content)
└── NfsTabsPanel (tab+panel component - repeated, renders .tabs-title + .tabs-panel)
    ├── ng-template[nfsTabsTitle] (custom title, optional - for .tabs-title content)
    └── ng-template[nfsTabsPanelContent] (lazy content, optional - for .tabs-panel)
```

**Naming rationale:**

- `NfsTabs` → `.tabs` (main container)
- `NfsTabsPanel` → `.tabs-panel` (the panel, but also defines its associated tab)
- `NfsTabsTitle` → `.tabs-title` (custom content for the tab trigger)
- `NfsTabsPanelContent` → lazy content rendered inside `.tabs-panel`

```html
<!-- Eager content (rendered immediately, hidden when inactive) -->
<nfs-tabs>
  <nfs-tabs-panel label="Tab 1">Content 1</nfs-tabs-panel>
  <nfs-tabs-panel label="Tab 2">Content 2</nfs-tabs-panel>
</nfs-tabs>

<!-- Lazy content (rendered only when selected) -->
<nfs-tabs>
  <nfs-tabs-panel label="Tab 1">
    <ng-template nfsTabsPanelContent>
      <app-heavy-component />
    </ng-template>
  </nfs-tabs-panel>
</nfs-tabs>

<!-- Custom title template (for icons, badges, etc.) -->
<nfs-tabs>
  <nfs-tabs-panel>
    <ng-template nfsTabsTitle> <i class="fa fa-home"></i> Home </ng-template>
    Content here...
  </nfs-tabs-panel>
</nfs-tabs>
```

### 1. NfsTabs (Container)

**Selector:** `nfs-tabs`

```typescript
@Component({
  selector: 'nfs-tabs',
  host: {
    class: 'nfs-tabs',
  },
})
export class NfsTabs {
  // === Foundation-matching inputs ===

  /** Synchronize selected tab with URL hash (data-deep-link) */
  readonly deepLink = input(false);

  /** Auto-scroll to deep-linked panel (data-deep-link-smudge) */
  readonly deepLinkSmudge = input(false);

  /** Delay before scrolling in ms (data-deep-link-smudge-delay) */
  readonly deepLinkSmudgeDelay = input(300);

  /** Scroll offset for sticky headers (data-deep-link-smudge-offset) */
  readonly deepLinkSmudgeOffset = input(0);

  /** Use pushState instead of replaceState (data-update-history) */
  readonly updateHistory = input(false);

  /** Allow clicking active tab to deselect it (data-active-collapse) */
  readonly activeCollapse = input(false);

  /** Keyboard navigation wraps around (data-wrap-on-keys) */
  readonly wrapOnKeys = input(true);

  /** Equalize panel heights (data-match-height) */
  readonly matchHeight = input(false);

  /** Scroll to active panel on load (data-auto-focus) */
  readonly autoFocus = input(false);

  /** Vertical tab orientation */
  readonly vertical = input(false);

  // === Angular extensions ===

  /** Currently selected tab index (two-way bindable) */
  readonly selectedIndex = model(0);

  /** Disable all tabs */
  readonly disabled = input(false);

  /** Keep disabled tabs focusable for screen readers */
  readonly softDisabled = input(true);

  /** Animation duration for tab transitions */
  readonly animationDuration = input('300ms');

  /** Keep inactive tab content in DOM (vs removing) */
  readonly preserveContent = input(false);

  // === Outputs ===

  /** Emitted when selected tab changes */
  readonly selectedTabChange = output<NfsTabChangeEvent>();

  /** Emitted when tab focus changes (keyboard navigation) */
  readonly focusChange = output<NfsTabChangeEvent>();

  // === Methods ===

  /** Select a tab by index */
  selectTab(index: number): void;

  /** Select a tab by panel ID */
  selectTabById(panelId: string): void;
}

interface NfsTabChangeEvent {
  index: number;
  panelId: string;
}
```

### 2. NfsTabsPanel (Tab + Panel Component)

**Selector:** `nfs-tabs-panel`

Renders both a `.tabs-title` trigger and a `.tabs-panel` content area.

```typescript
@Component({
  selector: 'nfs-tabs-panel',
  template: `<ng-template><ng-content /></ng-template>`,
})
export class NfsTabsPanel {
  /** Unique identifier for this panel (used for deep linking and ARIA) */
  readonly panelId = input<string>(); // Auto-generated if not provided

  /** Simple text label for the tab title */
  readonly label = input<string>();

  /** ARIA label for accessibility */
  readonly ariaLabel = input<string>();

  /** ARIA labelledby reference */
  readonly ariaLabelledby = input<string>();

  /** Whether this tab is disabled */
  readonly disabled = input(false);

  /** Whether this tab is selected (read-only, controlled by parent) */
  readonly selected = signal(false);

  /** Whether this tab is active (has focus) */
  readonly active = signal(false);

  // Content queries for template directives
  readonly titleTemplate = contentChild(NfsTabsTitle);
  readonly panelContentTemplate = contentChild(NfsTabsPanelContent);

  // Reference to eager content template
  readonly implicitContent = viewChild(TemplateRef);
}
```

### 3. NfsTabsTitle (Custom Title Template)

**Selector:** `ng-template[nfsTabsTitle]`

Custom content for the tab trigger (inside `.tabs-title`).

```typescript
@Directive({
  selector: 'ng-template[nfsTabsTitle]',
})
export class NfsTabsTitle {
  readonly templateRef = inject(TemplateRef);
}
```

### 4. NfsTabsPanelContent (Lazy Panel Content)

**Selector:** `ng-template[nfsTabsPanelContent]`

Lazy content rendered inside `.tabs-panel` only when selected.

```typescript
@Directive({
  selector: 'ng-template[nfsTabsPanelContent]',
})
export class NfsTabsPanelContent {
  readonly templateRef = inject(TemplateRef);
}
```

---

## Usage Examples

### Basic Usage with Eager Content

```html
<nfs-tabs>
  <nfs-tabs-panel label="Overview">
    <p>Overview content goes here...</p>
  </nfs-tabs-panel>

  <nfs-tabs-panel label="Features">
    <p>Features content goes here...</p>
  </nfs-tabs-panel>

  <nfs-tabs-panel label="Pricing">
    <p>Pricing content goes here...</p>
  </nfs-tabs-panel>
</nfs-tabs>
```

### Custom Title Templates (with icons)

```html
<nfs-tabs>
  <nfs-tabs-panel>
    <ng-template nfsTabsTitle> <i class="fa fa-home"></i> Home </ng-template>
    <p>Home content...</p>
  </nfs-tabs-panel>

  <nfs-tabs-panel>
    <ng-template nfsTabsTitle> <i class="fa fa-cog"></i> Settings </ng-template>
    <p>Settings content...</p>
  </nfs-tabs-panel>
</nfs-tabs>
```

### Lazy Content Loading

```html
<nfs-tabs>
  <nfs-tabs-panel label="Dashboard">
    <ng-template nfsTabsPanelContent>
      <!-- Only rendered when tab is selected -->
      <app-heavy-dashboard-component />
    </ng-template>
  </nfs-tabs-panel>

  <nfs-tabs-panel label="Analytics">
    <ng-template nfsTabsPanelContent>
      <!-- Only rendered when tab is selected -->
      <app-analytics-charts />
    </ng-template>
  </nfs-tabs-panel>
</nfs-tabs>
```

### Mixed Eager and Lazy Content

```html
<nfs-tabs>
  <!-- Eager: rendered immediately, hidden when inactive -->
  <nfs-tabs-panel label="Quick Info">
    <p>This content is always in the DOM.</p>
  </nfs-tabs-panel>

  <!-- Lazy: only rendered when selected -->
  <nfs-tabs-panel label="Heavy Report">
    <ng-template nfsTabsPanelContent>
      <app-heavy-report-component />
    </ng-template>
  </nfs-tabs-panel>
</nfs-tabs>
```

### Two-way Binding

```html
<nfs-tabs [(selectedIndex)]="currentTabIndex">
  <nfs-tabs-panel label="Tab 1">Content 1</nfs-tabs-panel>
  <nfs-tabs-panel label="Tab 2">Content 2</nfs-tabs-panel>
</nfs-tabs>

<button (click)="currentTabIndex = 0">Go to Tab 1</button>
```

### Vertical Tabs

```html
<nfs-tabs [vertical]="true">
  <nfs-tabs-panel label="Profile">...</nfs-tabs-panel>
  <nfs-tabs-panel label="Account">...</nfs-tabs-panel>
  <nfs-tabs-panel label="Security">...</nfs-tabs-panel>
</nfs-tabs>
```

### Deep Linking

```html
<!-- URL: /page#settings will auto-select the settings tab -->
<nfs-tabs [deepLink]="true" [deepLinkSmudge]="true">
  <nfs-tabs-panel panelId="general" label="General">...</nfs-tabs-panel>
  <nfs-tabs-panel panelId="settings" label="Settings">...</nfs-tabs-panel>
</nfs-tabs>
```

### Collapsible Tabs (all can be deselected)

```html
<nfs-tabs [activeCollapse]="true">
  <nfs-tabs-panel label="Question 1">Answer 1</nfs-tabs-panel>
  <nfs-tabs-panel label="Question 2">Answer 2</nfs-tabs-panel>
</nfs-tabs>
```

### Disabled Tabs

```html
<nfs-tabs>
  <nfs-tabs-panel label="Available">Content here</nfs-tabs-panel>
  <nfs-tabs-panel label="Coming Soon" [disabled]="true">Not yet available</nfs-tabs-panel>
</nfs-tabs>
```

### With Events

```html
<nfs-tabs (selectedTabChange)="onTabChange($event)" (focusChange)="onFocusChange($event)">
  <nfs-tabs-panel label="Tab 1">Content 1</nfs-tabs-panel>
  <nfs-tabs-panel label="Tab 2">Content 2</nfs-tabs-panel>
</nfs-tabs>
```

---

## Rendered HTML Structure

```html
<!-- nfs-tabs renders as: -->
<div class="nfs-tabs">
  <ul class="tabs" role="tablist" aria-orientation="horizontal">
    <li class="tabs-title is-active">
      <button role="tab" id="tab-overview" aria-selected="true" aria-controls="panel-overview" tabindex="0">Overview</button>
    </li>
    <li class="tabs-title">
      <button role="tab" id="tab-features" aria-selected="false" aria-controls="panel-features" tabindex="-1">Features</button>
    </li>
  </ul>

  <div class="tabs-content">
    <div class="tabs-panel is-active" role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
      <p>Overview content goes here...</p>
    </div>
    <div class="tabs-panel" role="tabpanel" id="panel-features" aria-labelledby="tab-features" inert>
      <p>Features content goes here...</p>
    </div>
  </div>
</div>
```

### Vertical Tabs HTML

```html
<div class="nfs-tabs nfs-tabs-vertical">
  <ul class="tabs vertical" role="tablist" aria-orientation="vertical">
    <!-- tabs... -->
  </ul>
  <div class="tabs-content vertical">
    <!-- panels... -->
  </div>
</div>
```

---

## Comparison with Angular Material

| Feature            | Angular Material                   | NfsTabs                            |
| ------------------ | ---------------------------------- | ---------------------------------- |
| Container          | `<mat-tab-group>`                  | `<nfs-tabs>`                       |
| Tab + Panel        | `<mat-tab>`                        | `<nfs-tabs-panel>`                 |
| Simple label       | `[label]` input                    | `[label]` input                    |
| Custom label       | `<ng-template mat-tab-label>`      | `ng-template[nfsTabsTitle]`        |
| Lazy content       | `<ng-template matTabContent>`      | `ng-template[nfsTabsPanelContent]` |
| Selected index     | `[(selectedIndex)]`                | `[(selectedIndex)]`                |
| Events             | `selectedTabChange`, `focusChange` | Same                               |
| Animation duration | `[animationDuration]`              | `[animationDuration]`              |
| Preserve content   | `[preserveContent]`                | `[preserveContent]`                |
| Dynamic height     | `[dynamicHeight]`                  | Not needed (CSS handles)           |
| Header position    | `[headerPosition]`                 | `[vertical]` (simpler)             |

**Foundation-specific inputs (not in Material):**

- `deepLink`, `deepLinkSmudge`, `deepLinkSmudgeDelay`, `deepLinkSmudgeOffset`
- `updateHistory`, `activeCollapse`, `wrapOnKeys`, `matchHeight`, `autoFocus`

---

## Implementation Notes

### Using @angular/aria/tabs

The component will use `@angular/aria/tabs` primitives under the hood:

```typescript
import { Tabs, TabList, Tab, TabPanel } from '@angular/aria/tabs';

@Component({
  imports: [Tabs, TabList, Tab, TabPanel, NgTemplateOutlet],
  // ...
})
export class NfsTabs {}
```

### Template Structure (Internal)

```html
<div ngTabs class="nfs-tabs" [class.nfs-tabs-vertical]="vertical()">
  <ul ngTabList class="tabs" [class.vertical]="vertical()">
    @for (panel of panels(); track panel.panelId() ?? $index) {
    <li class="tabs-title" [class.is-active]="panel.selected()">
      <button ngTab [value]="panel.panelId()" [disabled]="panel.disabled()">
        @if (panel.titleTemplate(); as titleTpl) {
        <ng-container [ngTemplateOutlet]="titleTpl.templateRef" />
        } @else { {{ panel.label() }} }
      </button>
    </li>
    }
  </ul>

  <div class="tabs-content" [class.vertical]="vertical()" [class.nfs-tabs-match-height]="matchHeight()">
    @for (panel of panels(); track panel.panelId() ?? $index) {
    <div ngTabPanel [value]="panel.panelId()" class="tabs-panel" [class.is-active]="panel.selected()" [attr.inert]="panel.selected() ? null : ''">
      @if (panel.panelContentTemplate(); as lazyTpl) {
      <!-- Lazy content: only render when selected -->
      @defer (when panel.selected()) {
      <ng-container [ngTemplateOutlet]="lazyTpl.templateRef" />
      } } @else if (panel.implicitContent(); as eagerTpl) {
      <!-- Eager content: always in DOM, hidden via CSS/inert -->
      <ng-container [ngTemplateOutlet]="eagerTpl" />
      }
    </div>
    }
  </div>
</div>
```

### Deep Link Service (Reuse from Accordion)

The `AccordionDeepLinkService` can be renamed to `DeepLinkService` and shared:

```typescript
@Injectable({ providedIn: 'root' })
export class DeepLinkService {
  getHashPanelId(): string | null;
  updateHash(panelId: string, updateHistory: boolean): void;
  clearHash(updateHistory: boolean): void;
  scrollToPanel(panelId: string, delay: number, offset: number): void;
  onHashChange(callback: (panelId: string | null) => void): () => void;
}
```

### Match Height Implementation

For `matchHeight`, use CSS flexbox for consistent height across panels:

```scss
.nfs-tabs-match-height .tabs-content {
  display: flex;
  flex-direction: column;
}

.nfs-tabs-match-height .tabs-panel {
  flex: 1 1 auto;
  min-height: 0; // Allow shrinking
}
```

If CSS-only doesn't handle dynamic lazy content heights, use `ResizeObserver`:

```typescript
// Only needed if CSS solution fails for lazy content
effect(() => {
  if (this.matchHeight()) {
    const panels = this.tabPanelElements();
    const observer = new ResizeObserver(() => this.#equalizeHeights(panels));
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }
});
```

---

## Files to Create

```
packages/ngx-foundation-sites/src/lib/tabs/
├── tabs.ts                    # NfsTabs container component
├── tabs.html                  # Container template
├── tabs.scss                  # Component styles
├── tabs-panel.ts              # NfsTabsPanel component (.tabs-panel)
├── tabs-title.ts              # NfsTabsTitle directive (.tabs-title content)
├── tabs-panel-content.ts      # NfsTabsPanelContent directive (lazy)
├── tabs.stories.ts            # Storybook stories
├── tabs.spec.ts               # Unit tests
└── index.ts                   # Public API exports

packages/ngx-foundation-sites/src/lib/shared/
└── deep-link.service.ts       # Shared deep linking service (refactored from accordion)
```

---

## Design Decisions

| Decision             | Choice                                           | Rationale                                                           |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| API pattern          | Material-style (`<nfs-tabs-panel>` component)    | Familiar API, resembles Angular Material Tabs                       |
| Component naming     | Foundation CSS class names                       | `NfsTabsPanel` → `.tabs-panel`, `NfsTabsTitle` → `.tabs-title`      |
| Content rendering    | Both eager and lazy                              | Eager: direct content; Lazy: `ng-template[nfsTabsPanelContent]`     |
| Simple label         | `[label]` input on `<nfs-tabs-panel>`            | Convenience for text-only titles (like Material)                    |
| Custom title         | `ng-template[nfsTabsTitle]`                      | Content for `.tabs-title`, matches Foundation class                 |
| Lazy content         | `ng-template[nfsTabsPanelContent]` with `@defer` | Only render when selected, optimal performance                      |
| Eager content        | Direct `<ng-content>` in panel                   | Always in DOM, hidden via `inert` when inactive                     |
| Building block       | `@angular/aria/tabs`                             | Per COMPONENT_BUILDING_BLOCKS.md, Tier 1 priority                   |
| Tab trigger element  | `<button>` (not `<a>`)                           | Better accessibility, no href needed                                |
| Input naming         | Match Foundation data attributes                 | `deepLink`, `wrapOnKeys`, `activeCollapse`, etc.                    |
| Vertical orientation | Single `[vertical]` input                        | Simpler than Material's `[headerPosition]`                          |
| Animation            | CSS transitions                                  | No Angular animations dependency                                    |
| Deep linking         | Shared service with accordion                    | Code reuse, consistent behavior                                     |
| activeCollapse       | **Included**                                     | User requested; matches Foundation's `data-active-collapse`         |
| matchHeight          | **CSS-first, ResizeObserver fallback**           | CSS flexbox for most cases; ResizeObserver for dynamic lazy content |
