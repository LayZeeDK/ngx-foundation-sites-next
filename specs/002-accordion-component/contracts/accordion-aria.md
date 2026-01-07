# ARIA Requirements: Accordion Component

**Phase**: 1 - Design & Contracts  
**Date**: 2026-01-07  
**Purpose**: Document ARIA attributes, roles, and relationships for WCAG AA compliance

## Standards Reference

- **WCAG 2.1 AA**: Web Content Accessibility Guidelines Level AA
- **ARIA 1.2**: Accessible Rich Internet Applications specification
- **WAI-ARIA Authoring Practices**: Accordion pattern guidance

---

## Component ARIA Structure

### NfsAccordion (Container)

**Element**: `<ul>` or `<div>` (host element)

**ARIA Attributes**:

- `role`: Not required (semantic `<ul>` preferred) or `"region"` if `<div>`
- `aria-label` or `aria-labelledby`: Optional, recommended if multiple accordions on page

**Rationale**: Container provides context but doesn't need special role. Semantic HTML `<ul>` is preferred.

**Example**:

```html
<ul class="accordion" aria-label="Frequently Asked Questions">
  <!-- accordion items -->
</ul>
```

---

### NfsAccordionItem (Item Container)

**Element**: `<li>` or `<div>` (host element)

**ARIA Attributes**:

- `role`: Not required (semantic `<li>` preferred within `<ul>`)
- `class`: `.accordion-item` (Foundation CSS)
- `[class.is-active]`: Applied when expanded=true

**Rationale**: Item is a structural container. The title button and panel region carry the ARIA semantics.

**Example**:

```html
<li class="accordion-item" [class.is-active]="expanded()">
  <!-- title and content -->
</li>
```

---

### NfsAccordionTitle (Trigger Button)

**Element**: `<button type="button">` inside optional `<div role="heading">`

**ARIA Attributes** (always required):

- `role`: `"button"` (implicit from `<button>` element, no explicit role needed)
- `aria-expanded`: `"true"` when item is expanded, `"false"` when collapsed
- `aria-controls`: ID of the associated panel content wrapper
- `id`: Auto-generated unique ID for this button (for `aria-labelledby` on panel)

**ARIA Attributes** (conditional):

- `aria-disabled`: `"true"` when item is disabled AND softDisabled=true
- `disabled`: Attribute present when item is disabled AND softDisabled=false

**Optional Heading Wrapper**:
When `titleHeadingLevel` is set on parent accordion:

```html
<div role="heading" aria-level="3">
  <button class="accordion-title" ...>
    <!-- title content -->
  </button>
</div>
```

**Rationale**:

- `aria-expanded` communicates current state to screen readers
- `aria-controls` establishes relationship between button and panel
- Heading wrapper creates document outline for screen reader navigation
- `aria-disabled` vs `disabled` attribute: soft disabled keeps item in tab order for better accessibility

**Example** (without heading):

```html
<button type="button" class="accordion-title" [id]="triggerId()" [attr.aria-expanded]="expanded() ? 'true' : 'false'" [attr.aria-controls]="panelId()" [attr.aria-disabled]="disabled() ? 'true' : null">Section Title</button>
```

**Example** (with heading level 2):

```html
<div role="heading" aria-level="2">
  <button type="button" class="accordion-title" ...>Section Title</button>
</div>
```

---

### Panel Content Wrapper

**Element**: `<div>` (always in DOM, even when collapsed)

**ARIA Attributes** (always required):

- `role`: `"region"` - Identifies panel as landmark region
- `aria-labelledby`: ID of the associated title button
- `id`: User-provided `panelId` or auto-generated unique ID
- `class`: `.accordion-content` (Foundation CSS)

**ARIA Attributes** (conditional):

- `inert`: Attribute present when panel is collapsed (prevents keyboard access to hidden content)
- `hidden`: NOT used (conflicts with stable ARIA relationship requirement)

**Rationale**:

- `role="region"` marks panel as a navigable landmark
- `aria-labelledby` establishes relationship with title button
- Panel wrapper MUST remain in DOM when collapsed to maintain valid `aria-controls` reference
- `inert` attribute prevents keyboard focus on collapsed panel content
- `hidden` attribute NOT used because it would invalidate `aria-controls` reference

**Example**:

```html
<div class="accordion-content" role="region" [id]="panelId()" [attr.aria-labelledby]="triggerId()" [attr.inert]="expanded() ? null : ''">
  <!-- Content conditionally rendered with @if -->
  @if (expanded()) {
  <ng-content />
  }
</div>
```

---

## ARIA Relationship Map

```
Accordion Container (optional aria-label)
  └── Item Container (no ARIA)
       ├── Title Button
       │    ├── id: "accordion-0-title-0"
       │    ├── aria-expanded: "true" | "false"
       │    ├── aria-controls: "accordion-0-panel-0" ──┐
       │    └── aria-disabled: "true" (if disabled)     │
       └── Panel Region                                 │
            ├── id: "accordion-0-panel-0" ◄─────────────┘
            ├── role: "region"
            ├── aria-labelledby: "accordion-0-title-0" ──┐
            └── inert (if collapsed)                      │
                                                          │
            ┌─────────────────────────────────────────────┘
            Button text: "Section Title"
```

**Key Relationships**:

1. Button `aria-controls` → Panel `id` (button controls this panel)
2. Panel `aria-labelledby` → Button `id` (panel labeled by this button)
3. Button `aria-expanded` reflects panel expansion state
4. Panel `inert` prevents focus when collapsed but keeps element in DOM

---

## ID Generation Strategy

**Pattern**: `<accordion-instance-id>-<item-type>-<item-index>`

**Components**:

- `accordion-instance-id`: `nfs-accordion-${staticCounter++}`
- `item-type`: `"title"` or `"panel"`
- `item-index`: Zero-based index of item in accordion

**Examples**:

```typescript
// First accordion instance
accordion-instance-id: "nfs-accordion-0"
title-id: "nfs-accordion-0-title-0"
panel-id: "nfs-accordion-0-panel-0" (or user-provided panelId)

// Second accordion instance
accordion-instance-id: "nfs-accordion-1"
title-id: "nfs-accordion-1-title-0"
panel-id: "nfs-accordion-1-panel-0"
```

**Uniqueness Guarantees**:

- Static counter ensures unique accordion instance IDs across page
- Item index ensures unique IDs within accordion
- User-provided `panelId` input overrides auto-generated panel ID
- Title IDs always auto-generated (no user override)

**Collision Prevention**:

- Multiple accordions on same page: Different instance IDs
- Dynamic items (add/remove): IDs regenerate but remain unique
- Nested accordions: Each has independent instance ID

---

## Keyboard Interaction Requirements

| Key           | Focus Location | Action                                       | ARIA Impact                                           |
| ------------- | -------------- | -------------------------------------------- | ----------------------------------------------------- |
| **Tab**       | Any            | Move to next focusable element in page order | Focus moves to next element                           |
| **Shift+Tab** | Any            | Move to previous focusable element           | Focus moves to previous element                       |
| **Enter**     | Title button   | Toggle expansion state                       | `aria-expanded` flips between `"true"` and `"false"`  |
| **Space**     | Title button   | Toggle expansion state                       | `aria-expanded` flips between `"true"` and `"false"`  |
| **ArrowDown** | Title button   | Move focus to next enabled title             | Focus changes, `aria-expanded` unchanged on old title |
| **ArrowUp**   | Title button   | Move focus to previous enabled title         | Focus changes, `aria-expanded` unchanged              |
| **Home**      | Title button   | Move focus to first enabled title            | Focus changes                                         |
| **End**       | Title button   | Move focus to last enabled title             | Focus changes                                         |

**Disabled Item Behavior**:

- **Soft disabled** (`softDisabled=true`): Title has `aria-disabled="true"`, remains focusable via Tab but Enter/Space do nothing
- **Hard disabled** (`softDisabled=false`): Title has `disabled` attribute, not in tab order, skipped by arrow keys

**Arrow Key Wraparound** (when `wrap=true`):

- ArrowDown on last title → focus first title
- ArrowUp on first title → focus last title

---

## Screen Reader Announcements

### Initial Focus on Title (Collapsed)

**Expected Announcement**:

> "Section Title, button, collapsed"

**Required ARIA**:

- `role="button"` (implicit)
- `aria-expanded="false"`

---

### Initial Focus on Title (Expanded)

**Expected Announcement**:

> "Section Title, button, expanded"

**Required ARIA**:

- `role="button"` (implicit)
- `aria-expanded="true"`

---

### Expanding a Panel (Enter/Space)

**Expected Announcement**:

> "Section Title, button, expanded"

**Required ARIA**:

- `aria-expanded` changes from `"false"` to `"true"`

---

### Collapsing a Panel (Enter/Space)

**Expected Announcement**:

> "Section Title, button, collapsed"

**Required ARIA**:

- `aria-expanded` changes from `"true"` to `"false"`

---

### Navigating to Panel Content (Tab from expanded title)

**Expected Announcement**:

> "Section Title, region"  
> [Screen reader then announces content inside region]

**Required ARIA**:

- `role="region"` on panel wrapper
- `aria-labelledby` pointing to title button

---

### Disabled Item (Soft Disabled)

**Expected Announcement**:

> "Section Title, button, dimmed" or "Section Title, button, disabled"

**Required ARIA**:

- `aria-disabled="true"`
- No `disabled` attribute (keeps in tab order)

---

## WCAG AA Compliance Checklist

### 1.3.1 Info and Relationships (Level A)

- [x] Semantic HTML structure (`<ul>`, `<li>`, `<button>`)
- [x] ARIA roles for non-semantic elements (`role="region"`)
- [x] ARIA relationships (`aria-controls`, `aria-labelledby`)

### 1.4.3 Contrast (Minimum) (Level AA)

- [x] Text contrast ≥ 4.5:1 (handled by Foundation CSS)
- [x] Interactive element contrast ≥ 3:1

### 2.1.1 Keyboard (Level A)

- [x] All functionality available via keyboard
- [x] Tab, Enter, Space, Arrow keys, Home, End

### 2.1.2 No Keyboard Trap (Level A)

- [x] Focus can move away from accordion
- [x] No focus traps in expanded panels

### 2.4.3 Focus Order (Level A)

- [x] Focus order matches visual/DOM order
- [x] Tab order is logical (title → content → next title)

### 2.4.7 Focus Visible (Level AA)

- [x] Focus indicators visible on all interactive elements
- [x] Foundation CSS provides focus styles

### 3.2.1 On Focus (Level A)

- [x] Focusing an element does not change context
- [x] Only Enter/Space activate, not focus alone

### 4.1.2 Name, Role, Value (Level A)

- [x] All elements have accessible names (text content, aria-labelledby)
- [x] All elements have correct roles (button, region)
- [x] All elements communicate state (aria-expanded, aria-disabled)

### 4.1.3 Status Messages (Level AA)

- [x] State changes communicated via ARIA attributes
- [x] Screen readers announce expansion state changes

---

## Testing Requirements

### Automated Testing (AXE)

- [ ] Run AXE checks on all accordion states (all collapsed, some expanded, all expanded)
- [ ] Verify no ARIA violations
- [ ] Verify all focusable elements have accessible names

### Manual Testing (Screen Readers)

- [ ] NVDA (Windows): Verify announcements match expected
- [ ] JAWS (Windows): Verify announcements match expected
- [ ] VoiceOver (macOS): Verify announcements match expected

### Keyboard Testing

- [ ] Tab through accordion (should hit all titles)
- [ ] Arrow keys navigate between titles
- [ ] Enter/Space toggle expansion
- [ ] Home/End move to first/last title
- [ ] Disabled items skipped by arrow keys

### Focus Management Testing

- [ ] Focus indicators visible on all elements
- [ ] Focus not lost when items dynamically added/removed
- [ ] Focus restored correctly after keyboard navigation

---

## Implementation Notes

### Why Not Use `aria-hidden` on Collapsed Panels?

**Problem**: `aria-hidden="true"` on panel would conflict with `aria-controls` relationship.

**Solution**: Use `inert` attribute instead. This:

- Prevents keyboard focus on hidden content
- Keeps element in DOM for `aria-controls` relationship
- Is supported in modern browsers (polyfill available for older browsers)

---

### Why Keep Panel Wrapper in DOM When Collapsed?

**ARIA Requirement**: `aria-controls` on button must reference a valid element ID. If the panel is removed from DOM, the reference becomes invalid, which is an ARIA violation.

**Solution**:

- Panel wrapper (`<div role="region">`) stays in DOM always
- Content inside wrapper is conditionally rendered with `@if`
- This maintains valid ARIA relationships while optimizing performance

---

### Why Use `role="heading"` Wrapper?

**Purpose**: Create semantic document outline for screen reader navigation.

**When to Use**: Set `titleHeadingLevel` input on accordion when:

- Accordion is primary page structure
- Screen reader users benefit from heading navigation (H key)
- Accordion fits into document outline (e.g., FAQ page)

**When to Skip**: Leave `titleHeadingLevel` as `null` (default) when:

- Accordion is supplementary content
- Headings would pollute document outline
- Titles are not true headings in semantic sense

---

## References

- [WAI-ARIA Practices: Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [Foundation for Sites: Accordion](https://get.foundation/sites/docs/accordion.html)
