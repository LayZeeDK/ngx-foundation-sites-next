# Quickstart: Accordion Component

**Phase**: 1 - Design & Contracts
**Date**: 2026-01-07
**Updated**: 2026-01-09 (Corrected to reflect template-directive architecture)
**Purpose**: Provide usage examples for developers

## Architecture Note

This accordion component uses **template-directive composition** with `ng-template[nfsAccordionItem]` rather than component wrappers. This design leverages `@angular/aria`'s accordion primitives for maximum accessibility compliance.

## Foundation JavaScript API Parity

This Angular accordion component provides **full API parity** with Foundation for Sites accordion JavaScript plugin. If you're migrating from Foundation JS, use this mapping:

| Foundation JS                                       | Angular Equivalent               | Example                                   |
| --------------------------------------------------- | -------------------------------- | ----------------------------------------- |
| `$('#accordion').foundation('toggle', $('#panel'))` | `item.toggle()`                  | `this.items().at(0)?.toggle()`            |
| `$('#accordion').foundation('down', $('#panel'))`   | `item.down()`                    | `this.items().at(0)?.down()`              |
| `$('#accordion').foundation('up', $('#panel'))`     | `item.up()`                      | `this.items().at(0)?.up()`                |
| `$('#accordion').foundation('destroy')`             | Angular lifecycle / `DestroyRef` | Auto cleanup                              |
| `$('#accordion').on('down.zf.accordion', fn)`       | `(down)` output                  | `<nfs-accordion (down)="onDown($event)">` |
| `$('#accordion').on('up.zf.accordion', fn)`         | `(up)` output                    | `<nfs-accordion (up)="onUp($event)">`     |

**Note**: Method implementations (`down()`, `up()`, `toggle()`) are currently in development. Use `[(expanded)]` two-way binding for programmatic control in the meantime.

**See Example 9** below for programmatic control patterns.

## Installation

The accordion component is part of the `ngx-foundation-sites` package.

```bash
npm install ngx-foundation-sites foundation-sites
```

## Prerequisites

### 1. Include Foundation CSS

**Option A: In your global `styles.scss`**:

```scss
@import 'foundation-sites/scss/foundation';
@include foundation-everything;
```

**Option B: Import specific components**:

```scss
@import 'foundation-sites/scss/foundation';
@include foundation-accordion;
```

**Option C: Use precompiled CSS** (in `angular.json`):

```json
{
  "styles": ["node_modules/foundation-sites/dist/css/foundation.min.css"]
}
```

### 2. Import Components

Import the accordion directives in your component:

```typescript
import { Component } from '@angular/core';
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef, NfsAccordionContentDef } from 'ngx-foundation-sites/accordion';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef, NfsAccordionContentDef],
  templateUrl: './example.component.html',
})
export class ExampleComponent {}
```

---

## Basic Usage

### Example 1: Simple FAQ Accordion

**Goal**: Create a basic FAQ accordion where only one answer is visible at a time.

**Code**:

```html
<nfs-accordion>
  <ng-template nfsAccordionItem panelId="faq-1">
    <ng-template nfsAccordionHeader>What is Foundation for Sites?</ng-template>
    <p>Foundation is a responsive front-end framework that makes it easy to design beautiful websites.</p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="faq-2">
    <ng-template nfsAccordionHeader>How do I install Foundation?</ng-template>
    <p>You can install Foundation via npm: <code>npm install foundation-sites</code></p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="faq-3">
    <ng-template nfsAccordionHeader>Is Foundation accessible?</ng-template>
    <p>Yes! Foundation includes built-in accessibility features and follows WCAG 2.1 AA standards.</p>
  </ng-template>
</nfs-accordion>
```

**Behavior**:

- Clicking a question expands it and collapses the previously opened question
- All questions start collapsed
- Keyboard navigation works: Tab to focus, Enter/Space to toggle, Arrow keys to navigate

**Template Structure**:

- Outer `ng-template[nfsAccordionItem]`: Defines the item
- Inner `ng-template[nfsAccordionHeader]`: Defines the clickable header/title
- Direct content: Eager-rendered panel content

---

### Example 2: Multi-Expand Accordion

**Goal**: Allow multiple panels to be open simultaneously.

**Code**:

```html
<nfs-accordion [multiExpandable]="true">
  <ng-template nfsAccordionItem panelId="feature-1">
    <ng-template nfsAccordionHeader>Responsive Grid</ng-template>
    <p>Foundation's grid system adapts to any screen size.</p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="feature-2">
    <ng-template nfsAccordionHeader>Flexible Components</ng-template>
    <p>Mix and match components to build your perfect site.</p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="feature-3">
    <ng-template nfsAccordionHeader>Accessibility First</ng-template>
    <p>Built-in ARIA support for screen readers and keyboard navigation.</p>
  </ng-template>
</nfs-accordion>
```

**Behavior**:

- Multiple panels can be open at the same time
- Clicking a panel toggles it without affecting other panels
- Useful for comparison scenarios or settings panels

**Note**: Input is `multiExpandable` (not `multiExpand` as shown in some docs).

---

### Example 3: Always One Open

**Goal**: Require at least one panel to always be open (wizard-style).

**Code**:

```html
<nfs-accordion [allowAllClosed]="false" [multiExpandable]="false">
  <ng-template nfsAccordionItem panelId="step-1" [expanded]="true">
    <ng-template nfsAccordionHeader>Step 1: Personal Information</ng-template>
    <form>
      <label>Name: <input type="text" /></label>
      <label>Email: <input type="email" /></label>
    </form>
  </ng-template>

  <ng-template nfsAccordionItem panelId="step-2">
    <ng-template nfsAccordionHeader>Step 2: Preferences</ng-template>
    <form>
      <label><input type="checkbox" /> Newsletter</label>
      <label><input type="checkbox" /> Notifications</label>
    </form>
  </ng-template>

  <ng-template nfsAccordionItem panelId="step-3">
    <ng-template nfsAccordionHeader>Step 3: Review & Submit</ng-template>
    <p>Please review your information before submitting.</p>
    <button type="submit">Submit</button>
  </ng-template>
</nfs-accordion>
```

**Behavior**:

- Step 1 is open initially
- Clicking the open step does nothing (it stays open)
- Opening a different step closes the current step
- Useful for guided workflows where context must always be visible

---

### Example 4: Two-Way Binding

**Goal**: Programmatically control accordion state from component code.

**Component**:

```typescript
import { Component, signal } from '@angular/core';
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef } from 'ngx-foundation-sites/accordion';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef],
  template: `
    <button (click)="toggleDetails()">Toggle Details</button>

    <nfs-accordion>
      <ng-template nfsAccordionItem panelId="details" [(expanded)]="detailsOpen">
        <ng-template nfsAccordionHeader>Details</ng-template>
        <p>This panel is controlled by the button above.</p>
      </ng-template>
    </nfs-accordion>

    <p>Details panel is {{ detailsOpen() ? 'open' : 'closed' }}</p>
  `,
})
export class ExampleComponent {
  detailsOpen = signal(false);

  toggleDetails() {
    this.detailsOpen.update((open) => !open);
  }
}
```

**Behavior**:

- Button toggles the accordion panel externally
- `[(expanded)]` provides two-way binding
- Component can read and control expansion state

---

### Example 5: Disabled Items

**Goal**: Disable specific accordion items (e.g., locked premium content).

**Code**:

```html
<nfs-accordion>
  <ng-template nfsAccordionItem panelId="free-feature">
    <ng-template nfsAccordionHeader>Free Feature</ng-template>
    <p>This content is available to all users.</p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="premium-feature" [disabled]="true">
    <ng-template nfsAccordionHeader>Premium Feature 🔒</ng-template>
    <p>Upgrade to unlock this feature.</p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="another-free">
    <ng-template nfsAccordionHeader>Another Free Feature</ng-template>
    <p>More free content here.</p>
  </ng-template>
</nfs-accordion>
```

**Behavior**:

- Disabled items cannot be expanded
- Click and keyboard events ignored
- Keyboard navigation skips disabled items
- Visual styling indicates disabled state

---

### Example 6: Lazy Content Loading

**Goal**: Render expensive content only when panel is first opened.

**Component**:

```typescript
import { Component } from '@angular/core';
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef, NfsAccordionContentDef } from 'ngx-foundation-sites/accordion';
import { ExpensiveComponent } from './expensive.component';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef, NfsAccordionContentDef, ExpensiveComponent],
  template: `
    <nfs-accordion>
      <ng-template nfsAccordionItem panelId="light">
        <ng-template nfsAccordionHeader>Lightweight Content</ng-template>
        <p>This content is always in the DOM (eager).</p>
      </ng-template>

      <ng-template nfsAccordionItem panelId="heavy">
        <ng-template nfsAccordionHeader>Heavy Content</ng-template>
        <ng-template nfsAccordionContent>
          <!-- Only rendered when panel is first opened -->
          <app-expensive-component />
        </ng-template>
      </ng-template>
    </nfs-accordion>
  `,
})
export class ExampleComponent {}
```

**Behavior**:

- Content inside `ng-template[nfsAccordionContent]` is **lazy** (not rendered until first expand)
- Content outside `ng-template[nfsAccordionContent]` is **eager** (always in DOM)
- Lazy content persists after first expansion (not destroyed on collapse)
- Improves initial render performance for large accordions

---

### Example 7: Deep Linking

**Goal**: Link to a specific accordion panel via URL hash.

**Code**:

```html
<nfs-accordion [deepLink]="true" [deepLinkSmudge]="true" [deepLinkSmudgeDelay]="500" [deepLinkSmudgeOffset]="80">
  <ng-template nfsAccordionItem panelId="overview">
    <ng-template nfsAccordionHeader>Overview</ng-template>
    <p>General information about the product.</p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="pricing">
    <ng-template nfsAccordionHeader>Pricing</ng-template>
    <p>Detailed pricing information.</p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="support">
    <ng-template nfsAccordionHeader>Support</ng-template>
    <p>How to get help.</p>
  </ng-template>
</nfs-accordion>
```

**Usage**:

- Navigate to `/page#pricing` → automatically opens "Pricing" panel
- Scrolls to panel with 500ms delay and 80px offset (for sticky headers)
- Shareable URLs for specific content sections

---

### Example 8: Dynamic Items

**Goal**: Render accordion items from a data array.

**Component**:

```typescript
import { Component, signal } from '@angular/core';
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef } from 'ngx-foundation-sites/accordion';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef],
  template: `
    <button (click)="addItem()">Add FAQ</button>
    <button (click)="removeItem()">Remove Last FAQ</button>

    <nfs-accordion>
      @for (item of faqs(); track item.id) {
        <ng-template nfsAccordionItem [panelId]="item.id">
          <ng-template nfsAccordionHeader>{{ item.question }}</ng-template>
          <p>{{ item.answer }}</p>
        </ng-template>
      }
    </nfs-accordion>
  `,
})
export class ExampleComponent {
  faqs = signal<FaqItem[]>([
    { id: 'q1', question: 'What is Angular?', answer: 'A web framework.' },
    { id: 'q2', question: 'What is Foundation?', answer: 'A CSS framework.' },
  ]);

  addItem() {
    const newId = `q${this.faqs().length + 1}`;
    this.faqs.update((items) => [
      ...items,
      {
        id: newId,
        question: 'New Question',
        answer: 'New Answer',
      },
    ]);
  }

  removeItem() {
    this.faqs.update((items) => items.slice(0, -1));
  }
}
```

**Behavior**:

- Items added/removed dynamically
- Keyboard navigation updates automatically
- ARIA relationships maintained correctly

---

### Example 9: Programmatic Control (Work in Progress)

**Goal**: Control accordion from component methods using Foundation API parity.

**Status**: The `down()`, `up()`, `toggle()` methods are **not yet implemented** on `NfsAccordionItemDef`. Use `[(expanded)]` two-way binding instead:

**Current Workaround**:

```typescript
import { Component, contentChildren } from '@angular/core';
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef } from 'ngx-foundation-sites/accordion';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef],
  template: `
    <div>
      <button (click)="expandFirst()">Expand First</button>
      <button (click)="collapseFirst()">Collapse First</button>
    </div>

    <nfs-accordion [multiExpandable]="true">
      <ng-template nfsAccordionItem panelId="item-1">
        <ng-template nfsAccordionHeader>Item 1</ng-template>
        <p>Content 1</p>
      </ng-template>

      <ng-template nfsAccordionItem panelId="item-2">
        <ng-template nfsAccordionHeader>Item 2</ng-template>
        <p>Content 2</p>
      </ng-template>

      <ng-template nfsAccordionItem panelId="item-3">
        <ng-template nfsAccordionHeader>Item 3</ng-template>
        <p>Content 3</p>
      </ng-template>
    </nfs-accordion>
  `,
})
export class ExampleComponent {
  protected readonly items = contentChildren(NfsAccordionItemDef);

  expandFirst() {
    // TODO: Replace with this.items().at(0)?.down() when implemented
    const item = this.items().at(0);
    if (item) item.expanded.set(true);
  }

  collapseFirst() {
    // TODO: Replace with this.items().at(0)?.up() when implemented
    const item = this.items().at(0);
    if (item) item.expanded.set(false);
  }
}
```

**Future API (when implemented)**:

```typescript
expandFirst() {
  this.items().at(0)?.down();   // Foundation parity: .down($target)
}

collapseFirst() {
  this.items().at(0)?.up();     // Foundation parity: .up($target)
}

toggleFirst() {
  this.items().at(0)?.toggle(); // Foundation parity: .toggle($target)
}
```

---

### Example 10: Event Handling (Work in Progress)

**Goal**: Listen to accordion events (Foundation `down` / `up` equivalents).

**Status**: The `(down)` and `(up)` outputs are **not yet implemented** on `NfsAccordion`.

**Future API (when implemented)**:

```typescript
import { Component } from '@angular/core';
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef } from 'ngx-foundation-sites/accordion';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef],
  template: `
    <nfs-accordion (down)="onDown($event)" (up)="onUp($event)">
      <ng-template nfsAccordionItem panelId="panel-1">
        <ng-template nfsAccordionHeader>Panel 1</ng-template>
        <p>Content 1</p>
      </ng-template>

      <ng-template nfsAccordionItem panelId="panel-2">
        <ng-template nfsAccordionHeader>Panel 2</ng-template>
        <p>Content 2</p>
      </ng-template>
    </nfs-accordion>

    <p>Last event: {{ lastEvent }}</p>
  `,
})
export class ExampleComponent {
  lastEvent = '';

  // Equivalent to Foundation's: $('#accordion').on('down.zf.accordion', ...)
  onDown(event: { itemId: string; expanded: true }) {
    this.lastEvent = `Panel ${event.itemId} opened`;
    console.log('Panel opened:', event.itemId);
  }

  // Equivalent to Foundation's: $('#accordion').on('up.zf.accordion', ...)
  onUp(event: { itemId: string; expanded: false }) {
    this.lastEvent = `Panel ${event.itemId} closed`;
    console.log('Panel closed:', event.itemId);
  }
}
```

**Migration from Foundation JS**:

```javascript
// Foundation JS (OLD):
$('#myAccordion').on('down.zf.accordion', function (e) {
  console.log('Panel opened:', $(e.target).attr('id'));
});

$('#myAccordion').on('up.zf.accordion', function (e) {
  console.log('Panel closed:', $(e.target).attr('id'));
});

// Angular (NEW - when implemented):
// Use (down) and (up) outputs on <nfs-accordion>
```

---

## API Reference Summary

### NfsAccordion Inputs

| Input                  | Type      | Default | Description                   |
| ---------------------- | --------- | ------- | ----------------------------- |
| `multiExpandable`      | `boolean` | `false` | Allow multiple panels open    |
| `allowAllClosed`       | `boolean` | `false` | Allow all panels closed       |
| `disabled`             | `boolean` | `false` | Disable all items             |
| `deepLink`             | `boolean` | `false` | Sync with URL hash            |
| `deepLinkSmudge`       | `boolean` | `false` | Auto-scroll to panel          |
| `deepLinkSmudgeDelay`  | `number`  | `300`   | Scroll delay (ms)             |
| `deepLinkSmudgeOffset` | `number`  | `0`     | Scroll offset (px)            |
| `updateHistory`        | `boolean` | `false` | Use pushState                 |
| `wrap`                 | `boolean` | `false` | Wrap arrow key navigation     |
| `softDisabled`         | `boolean` | `true`  | Keep disabled items focusable |

**Note**: `titleHeadingLevel` is not yet implemented.

### NfsAccordion Outputs (Not Yet Implemented)

| Output | Type                                 | Description                 |
| ------ | ------------------------------------ | --------------------------- |
| `down` | `{ itemId: string; expanded: true}`  | Emitted when a panel opens  |
| `up`   | `{ itemId: string; expanded: false}` | Emitted when a panel closes |

### NfsAccordionItemDef Inputs

| Input      | Type              | Default  | Description                       |
| ---------- | ----------------- | -------- | --------------------------------- |
| `panelId`  | `string`          | Required | Unique ID for this panel          |
| `expanded` | `boolean` (model) | `false`  | Expansion state (two-way binding) |
| `disabled` | `boolean`         | `false`  | Disable this item                 |

### NfsAccordionItemDef Methods (Not Yet Implemented)

| Method     | Description            | Foundation Equivalent |
| ---------- | ---------------------- | --------------------- |
| `down()`   | Expand this panel      | `.down($target)`      |
| `up()`     | Collapse this panel    | `.up($target)`        |
| `toggle()` | Toggle expansion state | `.toggle($target)`    |

**Workaround**: Use `item.expanded.set(true)` / `item.expanded.set(false)` / `item.expanded.update(v => !v)` until methods are implemented.

---

## Common Patterns

### Pattern: Settings Panel

```html
<nfs-accordion [multiExpandable]="true">
  <ng-template nfsAccordionItem panelId="general">
    <ng-template nfsAccordionHeader>General Settings</ng-template>
    <!-- Settings form -->
  </ng-template>

  <ng-template nfsAccordionItem panelId="notifications">
    <ng-template nfsAccordionHeader>Notifications</ng-template>
    <!-- Notification preferences -->
  </ng-template>

  <ng-template nfsAccordionItem panelId="privacy">
    <ng-template nfsAccordionHeader>Privacy</ng-template>
    <!-- Privacy controls -->
  </ng-template>
</nfs-accordion>
```

### Pattern: Product Details

```html
<nfs-accordion [multiExpandable]="true">
  <ng-template nfsAccordionItem panelId="description" [expanded]="true">
    <ng-template nfsAccordionHeader>Description</ng-template>
    <p>{{ product.description }}</p>
  </ng-template>

  <ng-template nfsAccordionItem panelId="specs">
    <ng-template nfsAccordionHeader>Specifications</ng-template>
    <dl>
      <dt>Weight:</dt>
      <dd>{{ product.weight }}</dd>
      <dt>Dimensions:</dt>
      <dd>{{ product.dimensions }}</dd>
    </dl>
  </ng-template>

  <ng-template nfsAccordionItem panelId="reviews">
    <ng-template nfsAccordionHeader>Reviews ({{ product.reviewCount }})</ng-template>
    <ng-template nfsAccordionContent>
      <app-reviews [productId]="product.id" />
    </ng-template>
  </ng-template>
</nfs-accordion>
```

---

## Next Steps

1. **Explore Storybook**: Run `npx nx storybook ngx-foundation-sites` to see interactive examples
2. **Read ARIA Documentation**: See `contracts/accordion-aria.md` for accessibility details
3. **Check Implementation Plan**: See `plan.md` for technical architecture

---

## Troubleshooting

### Issue: Items not expanding

**Solution**: Ensure `panelId` is provided and unique:

```html
<ng-template nfsAccordionItem panelId="unique-id">
  <!-- content -->
</ng-template>
```

### Issue: Keyboard navigation not working

**Solution**: Ensure Foundation CSS is loaded and buttons are focusable.

### Issue: Screen reader not announcing state

**Solution**: Check browser console for ARIA attribute errors. Ensure IDs are unique.

### Issue: Deep linking not working

**Solution**: Verify `deepLink` input is `true` and `panelId` matches URL hash (without `#`).

### Issue: Methods `down()`, `up()`, `toggle()` not found

**Solution**: These methods are not yet implemented. Use `[(expanded)]` two-way binding or direct signal manipulation:

```typescript
// Instead of: item.down()
item.expanded.set(true);

// Instead of: item.up()
item.expanded.set(false);

// Instead of: item.toggle()
item.expanded.update((v) => !v);
```

---

## Support

- **Documentation**: [ngx-foundation-sites docs](link)
- **GitHub Issues**: [Report a bug](link)
- **Foundation Docs**: [Foundation for Sites Accordion](https://get.foundation/sites/docs/accordion.html)
