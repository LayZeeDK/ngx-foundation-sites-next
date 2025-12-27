# NfsAccordion API Implementation Plan

This document outlines the path from the current implementation to the target API defined in `ACCORDION_API_DESIGN.md`.

---

## Current State

The accordion is implemented using a **template-based approach**:

```html
<nfs-accordion>
  <ng-template nfsAccordionItem panelId="panel-1">
    <ng-template nfsAccordionHeader>Section 1</ng-template>
    <p>Content...</p>
  </ng-template>
</nfs-accordion>
```

**Key characteristics:**
- Uses `ng-template` directives (`NfsAccordionItemDef`, `NfsAccordionHeaderDef`, `NfsAccordionContentDef`)
- Delegates ARIA to `@angular/aria/accordion` directives
- Supports deep linking, animations, and all Foundation options
- CSS Grid animation for smooth expand/collapse

---

## Target State (from API Design)

The API design specifies a **component-based content projection** approach:

```html
<nfs-accordion>
  <nfs-accordion-item panelId="panel-1">
    <nfs-accordion-title>Section 1</nfs-accordion-title>
    <p>Content...</p>
  </nfs-accordion-item>
</nfs-accordion>
```

**Key differences:**
- Uses components instead of template directives
- Manual ARIA attributes instead of Angular ARIA delegation
- Component names match Foundation CSS classes (`.accordion-title` → `NfsAccordionTitle`)

---

## Angular CDK/Material API Design Inspiration

The Angular Material Expansion Panel provides a well-established pattern for accordion APIs:

| Material API | NfsAccordion Equivalent | Description |
|--------------|-------------------------|-------------|
| `<mat-accordion>` | `<nfs-accordion>` | Container with shared configuration |
| `<mat-expansion-panel>` | `<nfs-accordion-item>` | Individual collapsible panel |
| `<mat-expansion-panel-header>` | `<nfs-accordion-title>` | Clickable trigger region |
| `ng-template[matExpansionPanelContent]` | `ng-template[nfsAccordionContent]` | Lazy-loaded content |
| `[multi]` | `[multiExpand]` | Allow multiple panels open |
| `[(expanded)]` | `[(expanded)]` | Two-way binding for panel state |
| `(opened)`, `(closed)` | `(opened)`, `(closed)` | State change events |
| `(afterExpand)`, `(afterCollapse)` | `(afterExpand)`, `(afterCollapse)` | Animation completion events |
| `open()`, `close()`, `toggle()` | `open()`, `close()`, `toggle()` | Programmatic control methods |
| `openAll()`, `closeAll()` | `openAll()`, `closeAll()` | Bulk operations on container |

**Key API principles from Material:**
- Two-way binding (`[(expanded)]`) for declarative state management
- Separate events for state change vs. animation completion
- Container-level configuration that items inherit
- Lazy content via `ng-template` for performance

---

## WAI-ARIA Accordion Pattern

From [WAI-ARIA APG Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/):

### Required Structure

```html
<!-- Heading wrapper (optional but recommended for document outline) -->
<h3>
  <button id="trigger-1"
          aria-expanded="true|false"
          aria-controls="panel-1"
          aria-disabled="true|false">
    Section Title
  </button>
</h3>

<!-- Content panel -->
<div id="panel-1"
     role="region"
     aria-labelledby="trigger-1">
  Panel content...
</div>
```

### Required ARIA Attributes

| Element | Attribute | Purpose |
|---------|-----------|---------|
| Trigger | `aria-expanded` | Indicates whether the panel is open |
| Trigger | `aria-controls` | Points to the panel ID |
| Trigger | `aria-disabled` | Indicates disabled state (keep focusable) |
| Panel | `role="region"` | Identifies the content region |
| Panel | `aria-labelledby` | Points to the trigger ID |

### Required Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Toggle the focused panel |
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move to previous focusable element |

### Optional Keyboard Navigation

| Key | Action |
|-----|--------|
| `↓` (Down Arrow) | Move focus to next accordion header |
| `↑` (Up Arrow) | Move focus to previous accordion header |
| `Home` | Move focus to first accordion header |
| `End` | Move focus to last accordion header |

---

## Accessibility Guidelines

1. **Focus Management:**
   - When a panel collapses and focus was inside it, move focus to the trigger button
   - Disabled panels should remain focusable (`aria-disabled="true"` vs `disabled`)
   - Use `softDisabled` pattern: `disabled` prevents action, `aria-disabled` announces state

2. **Hidden Content:**
   - Use `inert` attribute on collapsed panels (preferred over `aria-hidden`)
   - Removes content from tab order and accessibility tree
   - Native browser support, no polyfill needed in modern browsers

3. **Heading Level:**
   - Optionally wrap triggers in heading elements (`<h2>`, `<h3>`, etc.)
   - Use `role="heading" aria-level="N"` if native heading not possible
   - Controlled via `titleHeadingLevel` input on accordion container

4. **Animation Considerations:**
   - Respect `prefers-reduced-motion` media query
   - Ensure content is accessible before animation completes
   - Use CSS Grid animation (`grid-template-rows: 0fr → 1fr`) for smooth transitions

5. **Screen Reader Announcements:**
   - State changes announced via `aria-expanded` updates
   - No additional live region announcements needed for standard accordion behavior

---

## Gap Analysis

| Feature | API Design | Current | Status |
|---------|------------|---------|--------|
| **Architecture** | Component-based | Template-based | 🔒 Blocked |
| **Container** | `NfsAccordion` | `NfsAccordion` | ✅ Match |
| **Item** | `NfsAccordionItem` (component) | `NfsAccordionItemDef` (directive) | ⚠️ Naming |
| **Title** | `NfsAccordionTitle` (component) | `NfsAccordionHeaderDef` (directive) | ⚠️ Naming |
| **Lazy content** | `NfsAccordionContent` | `NfsAccordionContentDef` | ⚠️ Naming |
| **Input: multi** | `multiExpand` | `multiExpandable` | ⚠️ Naming |
| **Input: heading** | `titleHeadingLevel` | Not implemented | ❌ Missing |
| **Item events** | `opened`, `closed`, `afterExpand`, `afterCollapse` | Not implemented | ❌ Missing |
| **Item methods** | `open()`, `close()`, `toggle()` | Not implemented | ❌ Missing |
| **DI token** | `nfsAccordionToken` | Uses Angular ARIA | 🔒 Blocked |

---

## Implementation Phases

### Phase 1: Naming Alignment (Non-Breaking)

These changes can proceed immediately without architectural changes.

#### 1.1 Rename `multiExpandable` → `multiExpand`

**File:** `accordion.ts`

```typescript
// Before
readonly multiExpandable = input(false);

// After
readonly multiExpand = input(false);

/** @deprecated Use `multiExpand` instead */
readonly multiExpandable = this.multiExpand; // Alias for backwards compat
```

#### 1.2 Rename Header → Title

**Files to rename:**
- `accordion-header-def.ts` → `accordion-title-def.ts`
- Class: `NfsAccordionHeaderDef` → `NfsAccordionTitleDef`
- Selector: `nfsAccordionHeader` → `nfsAccordionTitle`

**Deprecation alias in `index.ts`:**
```typescript
/** @deprecated Use NfsAccordionTitleDef instead */
export { NfsAccordionTitleDef as NfsAccordionHeaderDef } from './accordion-title-def';
```

| Task | Description | Status |
|------|-------------|--------|
| 1.1 | Rename `multiExpandable` → `multiExpand` (with deprecation alias) | Pending |
| 1.2 | Rename `NfsAccordionHeaderDef` → `NfsAccordionTitleDef` | Pending |
| 1.3 | Rename selector `nfsAccordionHeader` → `nfsAccordionTitle` | Pending |
| 1.4 | Add deprecation aliases in `index.ts` | Pending |

---

### Phase 2: Missing Features

These features can be added to the current template-based architecture.

#### 2.1 Add `titleHeadingLevel` Input

**File:** `accordion.ts`

```typescript
/** Heading level for accordion titles (1-6). Wraps triggers in heading elements for ARIA. */
readonly titleHeadingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | null>(null);
```

**File:** `accordion.html`

```html
<!-- Wrap trigger in heading when titleHeadingLevel is set -->
@if (titleHeadingLevel(); as level) {
  <div role="heading" [attr.aria-level]="level">
    <button ngAccordionTrigger ...>
      ...
    </button>
  </div>
} @else {
  <button ngAccordionTrigger ...>
    ...
  </button>
}
```

#### 2.2 Add Item Event Outputs

**File:** `accordion-item-def.ts`

```typescript
/** Emitted when the panel is opened */
readonly opened = output<void>();

/** Emitted when the panel is closed */
readonly closed = output<void>();

/** Emitted after expand animation completes */
readonly afterExpand = output<void>();

/** Emitted after collapse animation completes */
readonly afterCollapse = output<void>();
```

Wire up in `accordion.ts` using `effect()` to watch `expanded` signal changes.

#### 2.3 Add Item Control Methods

**File:** `accordion-item-def.ts`

```typescript
/** Expand this panel */
open(): void {
  this.expanded.set(true);
}

/** Collapse this panel */
close(): void {
  this.expanded.set(false);
}

/** Toggle this panel */
toggle(): void {
  this.expanded.update(v => !v);
}
```

| Task | Description | Status |
|------|-------------|--------|
| 2.1 | Add `titleHeadingLevel` input for ARIA heading wrapper | Pending |
| 2.2 | Add `opened`, `closed` event outputs to item | Pending |
| 2.3 | Add `afterExpand`, `afterCollapse` animation event outputs | Pending |
| 2.4 | Add `open()`, `close()`, `toggle()` methods to item | Pending |

---

### Phase 3: Architectural Decision (BLOCKED)

**Waiting on:** https://github.com/angular/components/pull/32591

This PR resolves the Angular ARIA DI issue that prevents content-projected elements from finding their parent accordion group. Once merged and released, we can evaluate:

1. Does Angular ARIA work with content projection out of the box?
2. Is the template-based API acceptable to library consumers?
3. What is the migration cost vs. benefit?

**Options after PR merges:**
- **Option A:** Keep template-based approach (current)
- **Option B:** Migrate to component-based content projection (matches API design)

---

## Files to Modify

### Phase 1 (Naming)
- `src/lib/accordion/accordion.ts` — Add `multiExpand` input
- `src/lib/accordion/accordion-header-def.ts` → `accordion-title-def.ts` — Rename
- `src/lib/accordion/accordion.html` — Update selector references
- `src/lib/accordion/index.ts` — Update exports and add deprecation aliases

### Phase 2 (Features)
- `src/lib/accordion/accordion.ts` — Add `titleHeadingLevel` input
- `src/lib/accordion/accordion.html` — Add heading wrapper conditional
- `src/lib/accordion/accordion-item-def.ts` — Add events and methods
- `src/lib/accordion/accordion.spec.ts` — Add tests
- `src/lib/accordion/accordion.stories.ts` — Add stories for new features

### Phase 3 (Architecture)
- TBD based on PR #32591 outcome

---

## Testing Checklist

- [ ] All existing tests pass after naming changes
- [ ] `multiExpand` and `multiExpandable` both work (deprecation)
- [ ] `nfsAccordionTitle` and `nfsAccordionHeader` both work (deprecation)
- [ ] `titleHeadingLevel` renders heading wrapper correctly
- [ ] `opened`/`closed` events fire on state changes
- [ ] `afterExpand`/`afterCollapse` fire after animations
- [ ] `open()`/`close()`/`toggle()` methods work programmatically
- [ ] Storybook stories demonstrate all new features
- [ ] AXE accessibility checks pass
