# Phase 2: Storybook Stories & Interaction Tests ✅

**Goal:** Create comprehensive stories with interaction tests.

## 2.1 Template-Based Architecture for Angular ARIA

**Challenge:** Angular ARIA's `AccordionTrigger` and `AccordionPanel` inject `ACCORDION_GROUP` token, but this token is internal (not exported). When using wrapper components (`NfsAccordion`, `NfsAccordionItem`), the DI chain breaks because projected content can't access the parent's directive providers.

**Solution:** Render all Angular ARIA directives in `NfsAccordion`'s template and use `NgTemplateOutlet` to project user content:

1. **`NfsAccordionItem`** - Collects title/content templates via `contentChild`
2. **`NfsAccordion`** - Renders `ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel` in its own template
3. **Structural directives** - `*nfsAccordionTitle` and `*nfsAccordionContent` provide clean API

## 2.2 Updated Component API

**Usage:**

```html
<nfs-accordion [multiExpandable]="true">
  <nfs-accordion-item panelId="panel-1">
    <span *nfsAccordionTitle>Accordion 1</span>
    <p *nfsAccordionContent>Panel 1 content.</p>
  </nfs-accordion-item>
</nfs-accordion>
```

**Exports:**

- `NfsAccordion` - Accordion group component
- `NfsAccordionItem` - Item component (collects templates)
- `NfsAccordionTitleDef` - Structural directive for title
- `NfsAccordionContentDef` - Structural directive for content

## 2.3 Stories Implemented

| Story                | Purpose              | Interaction Test                     |
| -------------------- | -------------------- | ------------------------------------ |
| `Default`            | Single-expand mode   | Click tests, verify aria-expanded    |
| `MultiExpand`        | Multiple panels open | Open multiple, verify both stay open |
| `Disabled`           | Disabled state       | Group and item-level disabled        |
| `InitiallyExpanded`  | Pre-expanded panel   | Verify initial state                 |
| `KeyboardNavigation` | Keyboard a11y        | Arrow keys, Enter/Space              |

## Implementation Notes ✅

**Adjustments made during implementation:**

1. **Template-based architecture**: Used `NgTemplateOutlet` to project user content within Angular ARIA directive context, ensuring proper `ACCORDION_GROUP` injection

2. **Structural directive syntax**: Changed from attribute directive (`<span nfsAccordionTitle>`) to structural directive (`<span *nfsAccordionTitle>`) for cleaner template capture

3. **Added `NfsAccordionContentDef`**: New directive to capture content templates separately from title

4. **Renamed exports**: `NfsAccordionTitle` → `NfsAccordionTitleDef` to clarify it's a template definition directive

5. **Added `@angular/common` peer dependency**: Required for `NgTemplateOutlet`

6. **Keyboard navigation included**: Angular ARIA provides Arrow keys, Home/End, Enter/Space - tested in `KeyboardNavigation` story

7. **CSS override for Foundation**: Foundation CSS uses `.is-active` class to show accordion content, but Angular ARIA uses `aria-expanded`. Added component styles using `:has(button[aria-expanded="true"])` selector to bridge this gap.

**Actual file contents differ from original plan examples** - see committed files for accurate implementation.

## Review Fixes ✅

**Issues identified and resolved during code review:**

1. **Added `play` function to `Disabled` story**: Verifies `aria-disabled="true"` on both triggers, confirms panels start collapsed, clicks disabled buttons, and verifies they remain collapsed

2. **Added `play` function to `InitiallyExpanded` story**: Verifies first panel starts with `aria-expanded="true"`, second panel starts collapsed, and expanded panel content is visible
