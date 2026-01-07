# Quickstart: Accordion Component

**Phase**: 1 - Design & Contracts  
**Date**: 2025-06-10  
**Updated**: 2025-01-06 (Added Foundation API parity)  
**Purpose**: Provide usage examples for developers

## Foundation JavaScript API Parity

This Angular accordion component provides **full API parity** with Foundation for Sites accordion JavaScript plugin. If you're migrating from Foundation JS, use this mapping:

| Foundation JS | Angular Equivalent | Example |
|--------------|-------------------|---------|
| `$('#accordion').foundation('toggle', $('#panel'))` | `item.toggle()` | `this.items().at(0)?.toggle()` |
| `$('#accordion').foundation('down', $('#panel'))` | `item.down()` | `this.items().at(0)?.down()` |
| `$('#accordion').foundation('up', $('#panel'))` | `item.up()` | `this.items().at(0)?.up()` |
| `$('#accordion').foundation('destroy')` | Angular lifecycle / `DestroyRef` | Auto cleanup |
| `$('#accordion').on('down.zf.accordion', fn)` | `(down)` output | `<nfs-accordion (down)="onDown($event)">` |
| `$('#accordion').on('up.zf.accordion', fn)` | `(up)` output | `<nfs-accordion (up)="onUp($event)">` |

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
  "styles": [
    "node_modules/foundation-sites/dist/css/foundation.min.css"
  ]
}
```

### 2. Import Components

Import the accordion components in your component:

```typescript
import { Component } from '@angular/core';
import { 
  NfsAccordion, 
  NfsAccordionItem, 
  NfsAccordionTitle 
} from 'ngx-foundation-sites';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle],
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
  <nfs-accordion-item panelId="faq-1">
    <nfs-accordion-title>What is Foundation for Sites?</nfs-accordion-title>
    <p>Foundation is a responsive front-end framework that makes it easy to design beautiful websites.</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="faq-2">
    <nfs-accordion-title>How do I install Foundation?</nfs-accordion-title>
    <p>You can install Foundation via npm: <code>npm install foundation-sites</code></p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="faq-3">
    <nfs-accordion-title>Is Foundation accessible?</nfs-accordion-title>
    <p>Yes! Foundation includes built-in accessibility features and follows WCAG 2.1 AA standards.</p>
  </nfs-accordion-item>
</nfs-accordion>
```

**Behavior**:
- Clicking a question expands it and collapses the previously opened question
- All questions start collapsed
- Keyboard navigation works: Tab to focus, Enter/Space to toggle, Arrow keys to navigate

---

### Example 2: Multi-Expand Accordion

**Goal**: Allow multiple panels to be open simultaneously.

**Code**:
```html
<nfs-accordion [multiExpand]="true">
  <nfs-accordion-item panelId="feature-1">
    <nfs-accordion-title>Responsive Grid</nfs-accordion-title>
    <p>Foundation's grid system adapts to any screen size.</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="feature-2">
    <nfs-accordion-title>Flexible Components</nfs-accordion-title>
    <p>Mix and match components to build your perfect site.</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="feature-3">
    <nfs-accordion-title>Accessibility First</nfs-accordion-title>
    <p>Built-in ARIA support for screen readers and keyboard navigation.</p>
  </nfs-accordion-item>
</nfs-accordion>
```

**Behavior**:
- Multiple panels can be open at the same time
- Clicking a panel toggles it without affecting other panels
- Useful for comparison scenarios or settings panels

---

### Example 3: Always One Open

**Goal**: Require at least one panel to always be open (wizard-style).

**Code**:
```html
<nfs-accordion [allowAllClosed]="false" [multiExpand]="false">
  <nfs-accordion-item panelId="step-1" [expanded]="true">
    <nfs-accordion-title>Step 1: Personal Information</nfs-accordion-title>
    <form>
      <label>Name: <input type="text" /></label>
      <label>Email: <input type="email" /></label>
    </form>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="step-2">
    <nfs-accordion-title>Step 2: Preferences</nfs-accordion-title>
    <form>
      <label><input type="checkbox" /> Newsletter</label>
      <label><input type="checkbox" /> Notifications</label>
    </form>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="step-3">
    <nfs-accordion-title>Step 3: Review & Submit</nfs-accordion-title>
    <p>Please review your information before submitting.</p>
    <button type="submit">Submit</button>
  </nfs-accordion-item>
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
import { NfsAccordion, NfsAccordionItem, NfsAccordionTitle } from 'ngx-foundation-sites';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle],
  template: `
    <button (click)="toggleDetails()">Toggle Details</button>
    
    <nfs-accordion>
      <nfs-accordion-item panelId="details" [(expanded)]="detailsOpen">
        <nfs-accordion-title>Details</nfs-accordion-title>
        <p>This panel is controlled by the button above.</p>
      </nfs-accordion-item>
    </nfs-accordion>
    
    <p>Details panel is {{ detailsOpen() ? 'open' : 'closed' }}</p>
  `,
})
export class ExampleComponent {
  detailsOpen = signal(false);
  
  toggleDetails() {
    this.detailsOpen.update(open => !open);
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
  <nfs-accordion-item panelId="free-feature">
    <nfs-accordion-title>Free Feature</nfs-accordion-title>
    <p>This content is available to all users.</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="premium-feature" [disabled]="true">
    <nfs-accordion-title>Premium Feature 🔒</nfs-accordion-title>
    <p>Upgrade to unlock this feature.</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="another-free">
    <nfs-accordion-title>Another Free Feature</nfs-accordion-title>
    <p>More free content here.</p>
  </nfs-accordion-item>
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
import { NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent } from 'ngx-foundation-sites';
import { ExpensiveComponent } from './expensive.component';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent, ExpensiveComponent],
  template: `
    <nfs-accordion>
      <nfs-accordion-item panelId="light">
        <nfs-accordion-title>Lightweight Content</nfs-accordion-title>
        <p>This content is always in the DOM.</p>
      </nfs-accordion-item>

      <nfs-accordion-item panelId="heavy">
        <nfs-accordion-title>Heavy Content</nfs-accordion-title>
        <ng-template nfsAccordionContent>
          <!-- Only rendered when panel is first opened -->
          <app-expensive-component />
        </ng-template>
      </nfs-accordion-item>
    </nfs-accordion>
  `,
})
export class ExampleComponent {}
```

**Behavior**:
- `ExpensiveComponent` not created until panel is opened
- Content persists after first expansion (not destroyed on collapse)
- Improves initial render performance for large accordions

---

### Example 7: Deep Linking

**Goal**: Link to a specific accordion panel via URL hash.

**Code**:
```html
<nfs-accordion 
  [deepLink]="true" 
  [deepLinkSmudge]="true"
  [deepLinkSmudgeDelay]="500"
  [deepLinkSmudgeOffset]="80">
  
  <nfs-accordion-item panelId="overview">
    <nfs-accordion-title>Overview</nfs-accordion-title>
    <p>General information about the product.</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="pricing">
    <nfs-accordion-title>Pricing</nfs-accordion-title>
    <p>Detailed pricing information.</p>
  </nfs-accordion-item>

  <nfs-accordion-item panelId="support">
    <nfs-accordion-title>Support</nfs-accordion-title>
    <p>How to get help.</p>
  </nfs-accordion-item>
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
import { NfsAccordion, NfsAccordionItem, NfsAccordionTitle } from 'ngx-foundation-sites';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle],
  template: `
    <button (click)="addItem()">Add FAQ</button>
    <button (click)="removeItem()">Remove Last FAQ</button>
    
    <nfs-accordion>
      @for (item of faqs(); track item.id) {
        <nfs-accordion-item [panelId]="item.id">
          <nfs-accordion-title>{{ item.question }}</nfs-accordion-title>
          <p>{{ item.answer }}</p>
        </nfs-accordion-item>
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
    this.faqs.update(items => [
      ...items,
      { id: newId, question: 'New Question', answer: 'New Answer' },
    ]);
  }
  
  removeItem() {
    this.faqs.update(items => items.slice(0, -1));
  }
}
```

**Behavior**:
- Items added/removed dynamically
- Keyboard navigation updates automatically
- ARIA relationships maintained correctly

---

### Example 9: Programmatic Control

**Goal**: Control accordion from component methods.

**Component**:
```typescript
import { Component, viewChild, viewChildren } from '@angular/core';
import { NfsAccordion, NfsAccordionItem, NfsAccordionTitle } from 'ngx-foundation-sites';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle],
  template: `
    <div>
      <button (click)="expandAll()">Expand All</button>
      <button (click)="collapseAll()">Collapse All</button>
      <button (click)="expandFirst()">Expand First</button>
    </div>

    <nfs-accordion [multiExpand]="true">
      <nfs-accordion-item panelId="item-1">
        <nfs-accordion-title>Item 1</nfs-accordion-title>
        <p>Content 1</p>
      </nfs-accordion-item>

      <nfs-accordion-item panelId="item-2">
        <nfs-accordion-title>Item 2</nfs-accordion-title>
        <p>Content 2</p>
      </nfs-accordion-item>

      <nfs-accordion-item panelId="item-3">
        <nfs-accordion-title>Item 3</nfs-accordion-title>
        <p>Content 3</p>
      </nfs-accordion-item>
    </nfs-accordion>
  `,
})
export class ExampleComponent {
  protected readonly items = viewChildren(NfsAccordionItem);

  expandFirst() {
    this.items().at(0)?.down();
  }

  collapseFirst() {
    this.items().at(0)?.up();
  }
}
```

**Behavior**:
- Methods control accordion state externally
- Useful for toolbar buttons, shortcuts, or automation

---

### Example 10: Foundation API Parity - Event Handling

**Goal**: Listen to accordion events (Foundation `down` / `up` equivalents; Foundation emits these as `down.zf.accordion` / `up.zf.accordion`).

**Component**:
```typescript
import { Component } from '@angular/core';
import { NfsAccordion, NfsAccordionItem, NfsAccordionTitle } from 'ngx-foundation-sites';

@Component({
  selector: 'app-example',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle],
  template: `
    <nfs-accordion (down)="onDown($event)" (up)="onUp($event)">
      <nfs-accordion-item panelId="panel-1">
        <nfs-accordion-title>Panel 1</nfs-accordion-title>
        <p>Content 1</p>
      </nfs-accordion-item>

      <nfs-accordion-item panelId="panel-2">
        <nfs-accordion-title>Panel 2</nfs-accordion-title>
        <p>Content 2</p>
      </nfs-accordion-item>
    </nfs-accordion>

    <p>Last event: {{ lastEvent }}</p>
  `,
})
export class ExampleComponent {
  lastEvent = '';
  
  // Equivalent to Foundation's: $('#accordion').on('down.zf.accordion', ...)
  onDown(event: { itemId: string; expanded: boolean }) {
    this.lastEvent = `Panel ${event.itemId} opened`;
    console.log('Panel opened:', event.itemId);
  }

  // Equivalent to Foundation's: $('#accordion').on('up.zf.accordion', ...)
  onUp(event: { itemId: string; expanded: boolean }) {
    this.lastEvent = `Panel ${event.itemId} closed`;
    console.log('Panel closed:', event.itemId);
  }
}
```

**Migration from Foundation JS**:
```javascript
// Foundation JS (OLD):
$('#myAccordion').on('down.zf.accordion', function(e) {
  console.log('Panel opened:', $(e.target).attr('id'));
});

$('#myAccordion').on('up.zf.accordion', function(e) {
  console.log('Panel closed:', $(e.target).attr('id'));
});

// Angular (NEW):
// Use (down) and (up) outputs on <nfs-accordion>
```

---

## API Reference Summary

### NfsAccordion Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `multiExpand` | `boolean` | `false` | Allow multiple panels open |
| `allowAllClosed` | `boolean` | `false` | Allow all panels closed |
| `disabled` | `boolean` | `false` | Disable all items |
| `deepLink` | `boolean` | `false` | Sync with URL hash |
| `deepLinkSmudge` | `boolean` | `false` | Auto-scroll to panel |
| `deepLinkSmudgeDelay` | `number` | `300` | Scroll delay (ms) |
| `deepLinkSmudgeOffset` | `number` | `0` | Scroll offset (px) |
| `updateHistory` | `boolean` | `false` | Use pushState |
| `wrap` | `boolean` | `false` | Wrap arrow key navigation |
| `titleHeadingLevel` | `1-6 \| null` | `null` | Heading level for titles |
| `softDisabled` | `boolean` | `true` | Keep disabled items focusable |

### NfsAccordion Outputs

| Output | Type | Description |
|--------|------|-------------|
| `down` | `{ itemId: string; expanded: boolean }` | Emitted when a panel opens |
| `up` | `{ itemId: string; expanded: boolean }` | Emitted when a panel closes |

### NfsAccordionItem Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `panelId` | `string` | Required | Unique ID for this panel |
| `expanded` | `boolean` (model) | `false` | Expansion state (two-way binding) |
| `disabled` | `boolean` | `false` | Disable this item |

### NfsAccordionItem Methods

| Method | Description | Foundation Equivalent |
|--------|-------------|-----------------------|
| `down()` | Expand this panel | `.down($target)` |
| `up()` | Collapse this panel | `.up($target)` |
| `toggle()` | Toggle expansion state | `.toggle($target)` |

---

## Common Patterns

### Pattern: Settings Panel

```html
<nfs-accordion [multiExpand]="true">
  <nfs-accordion-item panelId="general">
    <nfs-accordion-title>General Settings</nfs-accordion-title>
    <!-- Settings form -->
  </nfs-accordion-item>
  
  <nfs-accordion-item panelId="notifications">
    <nfs-accordion-title>Notifications</nfs-accordion-title>
    <!-- Notification preferences -->
  </nfs-accordion-item>
  
  <nfs-accordion-item panelId="privacy">
    <nfs-accordion-title>Privacy</nfs-accordion-title>
    <!-- Privacy controls -->
  </nfs-accordion-item>
</nfs-accordion>
```

### Pattern: Product Details

```html
<nfs-accordion [multiExpand]="true">
  <nfs-accordion-item panelId="description" [expanded]="true">
    <nfs-accordion-title>Description</nfs-accordion-title>
    <p>{{ product.description }}</p>
  </nfs-accordion-item>
  
  <nfs-accordion-item panelId="specs">
    <nfs-accordion-title>Specifications</nfs-accordion-title>
    <dl>
      <dt>Weight:</dt><dd>{{ product.weight }}</dd>
      <dt>Dimensions:</dt><dd>{{ product.dimensions }}</dd>
    </dl>
  </nfs-accordion-item>
  
  <nfs-accordion-item panelId="reviews">
    <nfs-accordion-title>Reviews ({{ product.reviewCount }})</nfs-accordion-title>
    <ng-template nfsAccordionContent>
      <app-reviews [productId]="product.id" />
    </ng-template>
  </nfs-accordion-item>
</nfs-accordion>
```

### Pattern: Help Documentation

```html
<nfs-accordion 
  [deepLink]="true" 
  [deepLinkSmudge]="true"
  [titleHeadingLevel]="2">
  
  <nfs-accordion-item panelId="getting-started">
    <nfs-accordion-title>Getting Started</nfs-accordion-title>
    <!-- Introduction content -->
  </nfs-accordion-item>
  
  <nfs-accordion-item panelId="installation">
    <nfs-accordion-title>Installation</nfs-accordion-title>
    <!-- Installation steps -->
  </nfs-accordion-item>
  
  <nfs-accordion-item panelId="troubleshooting">
    <nfs-accordion-title>Troubleshooting</nfs-accordion-title>
    <!-- Common issues -->
  </nfs-accordion-item>
</nfs-accordion>
```

---

## Next Steps

1. **Explore Storybook**: Run `npx nx storybook ngx-foundation-sites` to see interactive examples
2. **Read ARIA Documentation**: See `contracts/accordion-aria.md` for accessibility details
3. **Review API Contract**: See `contracts/accordion-api.ts` for full TypeScript interfaces
4. **Check Implementation Plan**: See `plan.md` for technical architecture

---

## Troubleshooting

### Issue: Items not expanding

**Solution**: Ensure `panelId` is provided and unique:
```html
<nfs-accordion-item panelId="unique-id">
```

### Issue: Keyboard navigation not working

**Solution**: Ensure Foundation CSS is loaded and buttons are focusable.

### Issue: Screen reader not announcing state

**Solution**: Check browser console for ARIA attribute errors. Ensure IDs are unique.

### Issue: Deep linking not working

**Solution**: Verify `deepLink` input is `true` and `panelId` matches URL hash (without `#`).

---

## Support

- **Documentation**: [ngx-foundation-sites docs](link)
- **GitHub Issues**: [Report a bug](link)
- **Foundation Docs**: [Foundation for Sites Accordion](https://get.foundation/sites/docs/accordion.html)
