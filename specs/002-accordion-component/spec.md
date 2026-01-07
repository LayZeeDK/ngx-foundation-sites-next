# Feature Specification: Accessible Accordion Component

**Feature Branch**: `002-accordion-component`  
**Created**: 2025-06-10  
**Status**: Draft  
**Input**: Create a feature specification for an accessible, self-contained Accordion component and sub-components for the ngx-foundation-sites Angular component library

## Clarifications

### Session 2025-06-10

- Q: What is the **maximum number of accordion items** the component should efficiently support without performance degradation (rendering, keyboard navigation, ARIA updates)? → A: 100 items
- Q: How should accordion items **locate their parent accordion** component for state coordination? → A: Implicit query via DI token pattern

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Basic Single Accordion Interaction (Priority: P1)

A developer adds an accordion component to display FAQ content. End users click on question titles to reveal/hide answers. Only one answer is visible at a time (default behavior).

**Why this priority**: This is the core accordion pattern that 90% of use cases require. Without this, there's no viable component.

**Independent Test**: Can be fully tested by rendering a basic accordion with 3 items, clicking titles to expand/collapse panels, and verifying only one panel is open at a time. Delivers immediately usable FAQ/content organization functionality.

**Acceptance Scenarios**:

1. **Given** an accordion with 3 items (all collapsed), **When** user clicks the title of item 2, **Then** item 2's content panel expands and is visible
2. **Given** an accordion with item 2 expanded, **When** user clicks the title of item 3, **Then** item 3 expands and item 2 automatically collapses
3. **Given** an accordion with item 1 expanded, **When** user clicks item 1's title again, **Then** item 1 collapses (all items closed)
4. **Given** an accordion rendered, **When** page loads, **Then** correct Foundation CSS classes are applied (.accordion, .accordion-item, .accordion-title, .accordion-content)
5. **Given** an expanded item, **When** rendered, **Then** the .is-active class is present on the accordion-item

---

### User Story 2 - Keyboard Navigation and Focus Management (Priority: P1)

A keyboard-only user navigates through accordion items using Tab, arrow keys, Enter, and Space to expand/collapse content without using a mouse.

**Why this priority**: Keyboard accessibility is legally required (WCAG AA) and blocks production use if missing. This is not optional functionality.

**Independent Test**: Can be tested by rendering an accordion and using only keyboard (Tab to focus first title, ArrowDown/Up to move between titles, Enter/Space to toggle, Home/End to jump). Delivers complete keyboard accessibility.

**Acceptance Scenarios**:

1. **Given** an accordion rendered, **When** user presses Tab, **Then** focus moves to the first accordion title
2. **Given** focus on a title, **When** user presses ArrowDown, **Then** focus moves to the next title
3. **Given** focus on a title, **When** user presses ArrowUp, **Then** focus moves to the previous title
4. **Given** focus on the first title, **When** user presses ArrowUp, **Then** focus moves to the last title (wraparound)
5. **Given** focus on a title, **When** user presses Home, **Then** focus moves to the first title
6. **Given** focus on a title, **When** user presses End, **Then** focus moves to the last title
7. **Given** focus on a collapsed title, **When** user presses Enter or Space, **Then** the content panel expands
8. **Given** focus on an expanded title, **When** user presses Enter or Space, **Then** the content panel collapses

---

### User Story 3 - Screen Reader Compatibility (Priority: P1)

A screen reader user navigates an accordion and understands the structure, state (expanded/collapsed), and relationships between titles and content panels.

**Why this priority**: Screen reader support is required for WCAG AA compliance. Without proper ARIA, the component is unusable for blind users.

**Independent Test**: Can be tested with NVDA/JAWS/VoiceOver by navigating the accordion and verifying announcements include role, state, and content. Delivers accessible experience for screen reader users.

**Acceptance Scenarios**:

1. **Given** a screen reader user navigates to an accordion, **When** the accordion is announced, **Then** proper semantic structure is conveyed (accordion/region with appropriate role or structure)
2. **Given** a screen reader user focuses on a title, **When** announced, **Then** the title includes role="button", aria-expanded state (true/false), and aria-controls pointing to the content panel ID
3. **Given** a collapsed title, **When** announced, **Then** screen reader says "collapsed" or "aria-expanded false"
4. **Given** an expanded title, **When** announced, **Then** screen reader says "expanded" or "aria-expanded true"
5. **Given** a content panel, **When** rendered, **Then** it has role="region" and aria-labelledby pointing to the title ID
6. **Given** unique accordion items, **When** rendered, **Then** each title-content pair has unique, auto-generated IDs for aria-controls/aria-labelledby relationships

---

### User Story 4 - Multi-Expand Mode (Priority: P2)

A developer configures an accordion to allow multiple panels to be open simultaneously (Foundation's data-multi-expand behavior).

**Why this priority**: Common use case for comparison scenarios, settings panels, or filtering UIs. Enhances flexibility but not required for basic accordion functionality.

**Independent Test**: Can be tested by rendering an accordion with multiExpand="true", expanding multiple items, and verifying all remain open. Delivers comparison/multi-section viewing capability.

**Acceptance Scenarios**:

1. **Given** an accordion with multiExpand enabled, **When** user expands item 1, **Then** item 1 opens
2. **Given** an accordion with multiExpand enabled and item 1 open, **When** user expands item 2, **Then** both item 1 and item 2 remain open
3. **Given** an accordion with multiExpand enabled and items 1 and 2 open, **When** user collapses item 1, **Then** item 1 closes and item 2 remains open

---

### User Story 5 - Allow All Closed Mode (Priority: P2)

A developer configures an accordion where all panels can be closed simultaneously, or disables this to require at least one panel always open (Foundation's data-allow-all-closed behavior).

**Why this priority**: Supports use cases like progressive disclosure wizards where at least one section must be visible. Adds configurability without changing core behavior.

**Independent Test**: Can be tested by rendering an accordion with allowAllClosed="false", attempting to close the last open item, and verifying it remains open. Delivers "always one open" constraint for guided workflows.

**Acceptance Scenarios**:

1. **Given** an accordion with allowAllClosed="false" and item 1 open (only one open), **When** user clicks item 1's title, **Then** item 1 remains open
2. **Given** an accordion with allowAllClosed="false" and items 1 and 2 open (multiExpand), **When** user closes item 1, **Then** item 1 closes and item 2 remains open
3. **Given** an accordion with allowAllClosed="true" (default), **When** user closes the last open item, **Then** all items are collapsed

---

### User Story 6 - Disabled Items (Priority: P2)

A developer marks specific accordion items as disabled to prevent interaction (e.g., locked premium content, unavailable options).

**Why this priority**: Required for conditional access scenarios and feature gating. Common pattern in enterprise applications.

**Independent Test**: Can be tested by rendering an accordion with item 2 disabled, attempting to click/keyboard activate it, and verifying it doesn't expand. Delivers item-level control and visual feedback.

**Acceptance Scenarios**:

1. **Given** an accordion with item 2 disabled, **When** user clicks item 2's title, **Then** item 2 does not expand
2. **Given** an accordion with item 2 disabled, **When** user presses Enter/Space on item 2's title, **Then** item 2 does not expand
3. **Given** an accordion with item 2 disabled, **When** rendered, **Then** item 2's title has aria-disabled="true" and visual disabled styling
4. **Given** keyboard navigation with item 2 disabled, **When** user presses ArrowDown from item 1, **Then** focus moves to item 3 (skipping disabled item 2)
5. **Given** keyboard navigation with item 2 disabled, **When** user presses ArrowUp from item 3, **Then** focus moves to item 1 (skipping disabled item 2)

---

### User Story 7 - Initial Open Item Configuration (Priority: P3)

A developer configures which accordion item(s) should be open when the component first renders.

**Why this priority**: Useful for deep linking, default content visibility, or guided experiences. Nice-to-have for better UX but not blocking.

**Independent Test**: Can be tested by rendering an accordion with initialOpenIndex="1", verifying item at index 1 is expanded on load. Delivers controlled initial state.

**Acceptance Scenarios**:

1. **Given** an accordion with initialOpenIndex="1", **When** component renders, **Then** item at index 1 is expanded
2. **Given** an accordion with multiExpand and initialOpenIndexes="[0, 2]", **When** component renders, **Then** items at indexes 0 and 2 are expanded
3. **Given** an accordion with no initialOpenIndex, **When** component renders, **Then** all items are collapsed

---

### User Story 8 - Dynamic Item Management (Priority: P3)

A developer uses *ngFor to render accordion items from a dynamic array. Items can be added, removed, or reordered without breaking keyboard navigation or ARIA relationships.

**Why this priority**: Real-world apps use dynamic data. Critical for production use but can be validated after core functionality works.

**Independent Test**: Can be tested by rendering an accordion with 3 items, adding a new item, removing an item, and verifying keyboard navigation and IDs update correctly. Delivers dynamic content support.

**Acceptance Scenarios**:

1. **Given** an accordion with 3 items rendered via *ngFor, **When** a new item is added to the array, **Then** the new item renders with correct IDs and keyboard navigation includes it
2. **Given** an accordion with 4 items, **When** item 2 is removed from the array, **Then** remaining items maintain correct aria-controls/aria-labelledby IDs
3. **Given** an accordion with items reordered, **When** keyboard navigation is used, **Then** focus moves in the new DOM order

---

### User Story 9 - SSR Compatibility (Priority: P3)

A developer renders the accordion component server-side (Angular Universal/SSR). The component renders without errors and is hydrated correctly on the client.

**Why this priority**: Required for SEO and performance in SSR applications. Can be validated after core functionality is stable.

**Independent Test**: Can be tested by rendering the accordion in an SSR context, verifying no server-side errors, and confirming client-side hydration activates interactivity. Delivers SSR support.

**Acceptance Scenarios**:

1. **Given** an accordion component in an SSR application, **When** server-side rendering occurs, **Then** no runtime errors occur
2. **Given** an SSR-rendered accordion, **When** HTML is generated, **Then** correct semantic structure and ARIA attributes are present in the HTML
3. **Given** an SSR-rendered accordion, **When** client-side hydration occurs, **Then** click and keyboard interactions work correctly

---

### User Story 10 - URL Hash Deep Linking (Priority: P4)

A user visits a URL with a hash (e.g., #faq-question-3), and the accordion automatically opens the item with the matching ID.

**Why this priority**: Enhances shareability and bookmarking. Advanced feature that can be added later without impacting core functionality.

**Independent Test**: Can be tested by navigating to a URL with #accordion-item-2, verifying the accordion opens item 2 and scrolls to it. Delivers deep linking capability.

**Acceptance Scenarios**:

1. **Given** a URL with hash #accordion-item-2, **When** page loads, **Then** accordion item 2 automatically expands
2. **Given** an expanded item via hash, **When** page loads, **Then** browser scrolls to the expanded item
3. **Given** a URL hash changes (e.g., user clicks anchor link), **When** hash matches an accordion item, **Then** that item expands

---

### Edge Cases

- **Empty accordion**: What happens when no accordion items are provided? (Should render empty container without errors)
- **Single item accordion**: Does keyboard navigation work correctly with only one item? (Home/End/Arrow keys should no-op or stay on single item)
- **All items disabled**: Can the accordion be rendered with all items disabled? (Should render but have no interactive items)
- **Nested accordions**: What happens if an accordion-item's content contains another accordion? (Should work independently with separate keyboard navigation contexts via DI token pattern)
- **Rapid clicks**: What happens if user rapidly clicks multiple titles in succession? (Should handle state transitions cleanly without race conditions)
- **Long content**: What happens when panel content is very long and causes scrolling? (Should scroll to reveal expanded content if needed)
- **ID collisions**: What happens if multiple accordions exist on the same page? (Auto-generated IDs must be unique across all instances using a counter or UUID strategy)
- **Programmatic control**: Can developers programmatically expand/collapse items via the component API? (Should provide methods or signal inputs for external control)
- **Focus management during removal**: What happens if the focused item is removed from the DOM? (Focus should move to a safe location, like the next item or parent accordion)
- **ARIA in nested content**: What happens if accordion-content contains interactive elements (buttons, links)? (Should maintain proper tab order and not interfere with child element accessibility)

## Requirements _(mandatory)_

### Functional Requirements

#### Component Structure

- **FR-001**: System MUST provide four standalone components: `<nfs-accordion>`, `<nfs-accordion-item>`, `<nfs-accordion-title>`, and `<nfs-accordion-content>`
- **FR-002**: Component selectors MUST use the prefix "nfs-" (ngx-foundation-sites)
- **FR-003**: `<nfs-accordion>` MUST act as the root container component
- **FR-004**: `<nfs-accordion-item>` MUST represent individual collapsible items
- **FR-005**: `<nfs-accordion-title>` MUST represent the clickable trigger/header for each item
- **FR-006**: `<nfs-accordion-content>` MUST represent the expandable panel content for each item
- **FR-007**: Parent-child relationships MUST be established via Angular DI using injection tokens (item finds parent accordion without direct property binding through implicit DI query pattern)

#### Expansion Behavior

- **FR-008**: By default, only one accordion item MUST be expandable at a time (single-expand mode)
- **FR-009**: Clicking an expanded item's title MUST collapse that item (toggle behavior)
- **FR-010**: When multiExpand input is false (default), expanding a new item MUST automatically collapse the previously expanded item
- **FR-011**: When multiExpand input is true, multiple items MUST be able to remain open simultaneously
- **FR-012**: When allowAllClosed input is false, at least one item MUST remain expanded at all times
- **FR-013**: When allowAllClosed input is true (default), all items MUST be able to be collapsed simultaneously

#### Public API - Inputs

- **FR-014**: `<nfs-accordion>` MUST accept a `multiExpand` signal input (boolean, default: false) to enable multi-expand mode
- **FR-015**: `<nfs-accordion>` MUST accept an `allowAllClosed` signal input (boolean, default: true) to control if all items can be closed
- **FR-016**: `<nfs-accordion>` MUST accept an optional `id` input (string) for the root container element
- **FR-017**: `<nfs-accordion-item>` MUST accept a `disabled` signal input (boolean, default: false) to disable individual items
- **FR-018**: `<nfs-accordion-item>` MUST accept an optional `id` input (string) for the item container element
- **FR-019**: `<nfs-accordion-item>` MUST accept an `isOpen` signal input (boolean, default: false) for controlled mode or initial state
- **FR-020**: If no `id` is provided for accordion-item, title, or content, system MUST auto-generate unique IDs

#### Public API - Outputs

- **FR-021**: `<nfs-accordion>` MUST emit an output event when any item's expansion state changes, providing the item index or ID and new state
- **FR-022**: `<nfs-accordion-item>` MUST emit an `openChange` output event when the item's expansion state changes (EventEmitter<boolean>)
- **FR-023**: Output events MUST be emitted after state changes are complete and DOM updates have occurred

#### Content Projection

- **FR-024**: `<nfs-accordion>` MUST accept `<nfs-accordion-item>` components via content projection (ng-content)
- **FR-025**: `<nfs-accordion-item>` MUST accept exactly one `<nfs-accordion-title>` and one `<nfs-accordion-content>` via content projection
- **FR-026**: `<nfs-accordion-title>` MUST accept arbitrary HTML content via content projection
- **FR-027**: `<nfs-accordion-content>` MUST accept arbitrary HTML content via content projection

#### Styling and CSS Classes

- **FR-028**: `<nfs-accordion>` root element MUST have the CSS class `.accordion`
- **FR-029**: `<nfs-accordion-item>` element MUST have the CSS class `.accordion-item`
- **FR-030**: `<nfs-accordion-title>` element MUST have the CSS class `.accordion-title`
- **FR-031**: `<nfs-accordion-content>` element MUST have the CSS class `.accordion-content`
- **FR-032**: When an item is expanded, its `<nfs-accordion-item>` element MUST have the CSS class `.is-active` added
- **FR-033**: When an item is collapsed, the `.is-active` class MUST be removed
- **FR-034**: When an item is disabled, its `<nfs-accordion-item>` element MUST have a CSS class indicating disabled state (e.g., `.is-disabled`)
- **FR-035**: Component MUST NOT include Foundation JavaScript; all behavior MUST be implemented in Angular

#### Keyboard Interactions

- **FR-036**: Pressing Tab MUST move focus to the next focusable element in the natural tab order
- **FR-037**: When focused on an accordion title, pressing Enter or Space MUST toggle the item's expansion state
- **FR-038**: When focused on an accordion title, pressing ArrowDown MUST move focus to the next enabled accordion title
- **FR-039**: When focused on an accordion title, pressing ArrowUp MUST move focus to the previous enabled accordion title
- **FR-040**: Arrow key navigation MUST wrap (ArrowDown on last item moves to first; ArrowUp on first item moves to last)
- **FR-041**: When focused on an accordion title, pressing Home MUST move focus to the first enabled accordion title
- **FR-042**: When focused on an accordion title, pressing End MUST move focus to the last enabled accordion title
- **FR-043**: Disabled items MUST be skipped during arrow key navigation
- **FR-044**: Keyboard interactions MUST only affect the title/trigger elements, not the content panels

#### Disabled State

- **FR-045**: Disabled accordion items MUST NOT respond to click events
- **FR-046**: Disabled accordion items MUST NOT respond to Enter/Space keyboard events
- **FR-047**: Disabled accordion items MUST be skipped during keyboard navigation (ArrowUp/Down)
- **FR-048**: Disabled items MUST have `aria-disabled="true"` on the title element
- **FR-049**: Disabled items MUST have visual styling indicating they are not interactive

#### Dynamic Content

- **FR-050**: Component MUST support dynamically added/removed accordion items (e.g., via *ngFor)
- **FR-051**: When items are added/removed, ARIA relationships (aria-controls, aria-labelledby) MUST remain correctly linked
- **FR-052**: When items are added/removed, keyboard navigation MUST update to include/exclude items accordingly
- **FR-053**: If a focused item is removed from the DOM, focus MUST move to a safe location (next item, previous item, or parent)

#### SSR Compatibility

- **FR-054**: Component MUST render without runtime errors in Angular Universal/SSR context
- **FR-055**: Component MUST NOT reference browser-only APIs (window, document) during SSR initialization
- **FR-056**: Component MUST use Angular's platform detection or afterRender hooks for browser-specific code
- **FR-057**: Server-rendered HTML MUST include correct semantic structure and ARIA attributes before client hydration

### Accessibility Requirements (MANDATORY)

#### WCAG and AXE Compliance

- **AR-001**: Component MUST pass all AXE automated accessibility checks
- **AR-002**: Component MUST meet WCAG 2.1 AA standards
- **AR-003**: All color contrast requirements MUST be met (4.5:1 for normal text, 3:1 for large text)
- **AR-004**: Component MUST be testable with NVDA, JAWS, and VoiceOver screen readers

#### ARIA Roles and Attributes

- **AR-005**: Each `<nfs-accordion-title>` element MUST have `role="button"`
- **AR-006**: Each `<nfs-accordion-title>` element MUST have `aria-expanded` attribute reflecting current state ("true" when open, "false" when closed)
- **AR-007**: Each `<nfs-accordion-title>` element MUST have `aria-controls` attribute pointing to the ID of its associated content panel
- **AR-008**: Each `<nfs-accordion-content>` element MUST have `role="region"`
- **AR-009**: Each `<nfs-accordion-content>` element MUST have `aria-labelledby` attribute pointing to the ID of its associated title
- **AR-010**: Disabled items MUST have `aria-disabled="true"` on the title element
- **AR-011**: Title and content elements MUST have unique IDs for proper ARIA relationships across multiple accordion instances on the same page

#### Keyboard Accessibility

- **AR-012**: All interactive elements (accordion titles) MUST be keyboard accessible
- **AR-013**: Tab key MUST follow natural DOM tab order
- **AR-014**: Enter and Space keys MUST activate the focused accordion title
- **AR-015**: Arrow keys (Up/Down), Home, and End MUST navigate between accordion titles per FR-036 to FR-043

#### Focus Management

- **AR-016**: Focus indicators MUST be visible and meet WCAG contrast requirements
- **AR-017**: Focus MUST be managed correctly when items are dynamically added/removed
- **AR-018**: Focus MUST NOT be lost or trapped within the accordion
- **AR-019**: When an item is expanded via keyboard, focus MUST remain on the title element (not move to content)

#### Screen Reader Support

- **AR-020**: Screen readers MUST announce the accordion title text and button role
- **AR-021**: Screen readers MUST announce the current expansion state (expanded/collapsed)
- **AR-022**: Screen readers MUST convey the relationship between titles and content panels
- **AR-023**: When an item expands/collapses, screen readers MUST announce the state change

### Component API Requirements

- **CA-001**: All components MUST use standalone architecture (no NgModules required)
- **CA-002**: Component inputs MUST use the `input()` signal function with proper type annotations
- **CA-003**: Component outputs MUST use the `output()` function
- **CA-004**: Component state MUST be managed using signals (computed, effect as appropriate)
- **CA-005**: All components MUST use `ChangeDetectionStrategy.OnPush`
- **CA-006**: Component selectors MUST follow the naming convention: `nfs-accordion`, `nfs-accordion-item`, `nfs-accordion-title`, `nfs-accordion-content`
- **CA-007**: Component API MUST align with Foundation for Sites naming conventions (multiExpand maps to data-multi-expand, allowAllClosed maps to data-allow-all-closed)
- **CA-008**: Before implementation, an API design document MUST be created using the `foundation-api-design` skill to document the complete component API, inputs, outputs, content projection, ARIA requirements, and usage examples

### Key Entities _(Component Architecture)_

- **NfsAccordionComponent**: Root container component that manages overall accordion state, tracks which items are open, enforces multiExpand and allowAllClosed rules, and provides context to child items via DI token
- **NfsAccordionItemComponent**: Individual accordion item that manages its own expanded/collapsed state, communicates with parent accordion, handles disabled state, and coordinates title/content sub-components
- **NfsAccordionTitleComponent**: Clickable trigger element that displays the title content, manages button role and ARIA attributes, handles click and keyboard events, and triggers expansion/collapse
- **NfsAccordionContentComponent**: Collapsible content panel that displays when item is expanded, manages visibility based on item state, handles ARIA region role, and projects arbitrary HTML content
- **AccordionContext (DI Token)**: Injection token providing access to parent accordion component, enabling decoupled parent-child communication without property binding, used by items to register with parent and query multiExpand/allowAllClosed settings

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Component passes 100% of AXE automated accessibility checks with no violations
- **SC-002**: Component meets WCAG 2.1 AA standards verified by manual audit with screen readers (NVDA, JAWS, VoiceOver)
- **SC-003**: Keyboard-only users can complete all accordion interactions (expand, collapse, navigate) without using a mouse
- **SC-004**: All keyboard interactions respond within 100ms of key press
- **SC-005**: Component renders and hydrates successfully in SSR context without runtime errors
- **SC-006**: Developers can implement a basic FAQ accordion with 5 items in under 10 lines of template code
- **SC-007**: Component API documentation includes complete examples for all configuration options (multiExpand, allowAllClosed, disabled, initial state)
- **SC-008**: All user stories P1-P3 pass acceptance tests in Storybook play functions
- **SC-009**: Component supports dynamic item arrays of 100 items without performance degradation (tested via *ngFor with maximum supported item count)
- **SC-010**: Focus management maintains correct state through 10 consecutive add/remove operations on dynamic items

## Goals and Non-Goals

### Goals

- Provide a fully accessible, WCAG AA-compliant accordion component
- Implement all Foundation for Sites accordion features without JavaScript dependency
- Use modern Angular patterns (standalone, signals, OnPush, @angular/aria)
- Support both simple use cases (basic FAQ) and advanced scenarios (multi-expand, controlled state, dynamic content)
- Ensure SSR compatibility for Angular Universal applications
- Enable keyboard-only navigation and screen reader usability
- Provide a self-contained component set that works out-of-the-box with Foundation CSS

### Non-Goals

- Implementing animation/transition effects (Foundation CSS handles visual transitions via CSS; Angular component only manages state and classes)
- Providing custom styling or themes beyond Foundation CSS classes
- Supporting legacy Foundation JavaScript API compatibility
- Implementing accordion features not present in Foundation for Sites (e.g., nested drag-and-drop reordering)
- Providing form integration or validation logic (accordion is a disclosure widget, not a form control)
- Building a generic disclosure/expander component (scope is specifically Foundation accordion pattern)

## Testing Strategy

### Primary Testing Approach: Storybook Play Functions

- **Rationale**: Storybook with play functions provides visual regression testing, interaction testing, and accessibility testing in one tool
- **Coverage**: All user stories (P1-P4) will have corresponding Storybook stories with play functions that automate acceptance scenarios
- **Example Stories**:
  - `Basic.story.ts`: Single-expand mode with 3 items (User Story 1)
  - `KeyboardNavigation.story.ts`: Arrow keys, Home/End, Enter/Space (User Story 2)
  - `MultiExpand.story.ts`: Multiple items open simultaneously (User Story 4)
  - `DisabledItems.story.ts`: Disabled item interactions and keyboard skip (User Story 6)
  - `DynamicContent.story.ts`: Adding/removing items via array mutation (User Story 8)
- **Play Function Actions**:
  - Simulate clicks on titles
  - Simulate keyboard events (ArrowDown, Enter, Space, etc.)
  - Assert on aria-expanded state changes
  - Assert on .is-active class presence
  - Assert on focus location after keyboard navigation
- **Accessibility Testing**: Integrate `@storybook/addon-a11y` to run AXE checks on every story

### Secondary Testing: Minimal Unit Tests

- **Rationale**: Unit tests for edge cases and internal logic not easily tested via Storybook
- **Coverage**:
  - ID auto-generation logic (ensure uniqueness across multiple instances)
  - allowAllClosed enforcement (prevent last item from closing when false)
  - Disabled item keyboard navigation skip logic
  - DI token injection and parent-child communication
  - Signal reactivity and state synchronization
- **Framework**: Jasmine/Jest (based on project configuration) with Angular TestBed

### Tertiary Testing: Playwright E2E (Optional, for URL hash deep linking)

- **Rationale**: Deep linking (User Story 10) requires browser navigation and URL manipulation
- **Coverage**:
  - Navigate to URL with hash (#accordion-item-2)
  - Verify correct item expands and scrolls into view
  - Verify hash change listener triggers item expansion
- **Execution**: Optional; only if deep linking feature is implemented

### Manual Testing Checklist

- Screen reader testing with NVDA (Windows), JAWS (Windows), VoiceOver (macOS)
- Keyboard-only navigation in Chrome, Firefox, Safari, Edge
- Visual verification of Foundation CSS classes and styling
- SSR rendering in a sample Angular Universal application

## Implementation Notes

### DI Token Pattern for Parent-Child Communication

The accordion item components need to communicate with the parent accordion without direct property binding. Use Angular's dependency injection:

```typescript
// Injection token
export const NFS_ACCORDION = new InjectionToken<NfsAccordionComponent>('NFS_ACCORDION');

// In NfsAccordionComponent
providers: [{ provide: NFS_ACCORDION, useExisting: NfsAccordionComponent }]

// In NfsAccordionItemComponent
private accordion = inject(NFS_ACCORDION);
```

This allows items to register with the parent and query settings like `multiExpand` and `allowAllClosed` without tight coupling.

### ID Generation Strategy

To avoid collisions across multiple accordion instances:

```typescript
private static accordionCounter = 0;
private instanceId = `nfs-accordion-${NfsAccordionComponent.accordionCounter++}`;

// For items:
private itemId = `${this.accordion.instanceId}-item-${index}`;
```

### Keyboard Event Handling

Arrow key navigation should be handled at the accordion level (not individual items) to maintain focus management context:

```typescript
// In NfsAccordionComponent
@HostListener('keydown', ['$event'])
handleKeydown(event: KeyboardEvent) {
  if (event.target matches '.accordion-title') {
    // Handle ArrowUp/Down/Home/End
    // Call focusItem(index) to move focus
  }
}
```

### State Management with Signals

Use signals to manage expansion state reactively:

```typescript
// In NfsAccordionItemComponent
isOpen = signal(false);

// In NfsAccordionComponent
openItems = signal<number[]>([]);

// Computed to check if item should be open
isItemOpen = computed(() => this.openItems().includes(this.itemIndex));
```

### CSS Class Application

Use host bindings or `[class.is-active]` to apply Foundation classes:

```typescript
// In NfsAccordionItemComponent
@HostBinding('class.is-active')
get isActive() {
  return this.isOpen();
}
```

### SSR Compatibility

Avoid direct `document` or `window` references during initialization. Use `afterRender` or `isPlatformBrowser`:

```typescript
import { afterRender, isPlatformBrowser, PLATFORM_ID } from '@angular/core';

private platformId = inject(PLATFORM_ID);

constructor() {
  if (isPlatformBrowser(this.platformId)) {
    afterRender(() => {
      // Browser-specific code (e.g., URL hash handling)
    });
  }
}
```

## Assumptions

- Foundation for Sites CSS is available and included in the application (either via CDN or npm package)
- The project uses Angular v20+ with standalone components as the default
- The selector prefix `nfs-` is consistent with the ngx-foundation-sites library convention
- Developers using the component are familiar with Angular content projection and component composition patterns
- The component will be used in applications where Foundation CSS classes are the primary styling mechanism (no expectation for custom theming API)
- Browser support aligns with Angular's supported browsers (modern evergreen browsers: Chrome, Firefox, Safari, Edge)
- Screen reader testing will be conducted on Windows (NVDA, JAWS) and macOS (VoiceOver) as representative platforms
- Storybook is configured in the project for component development and testing
- The project uses either Jasmine or Jest for unit testing (component will be compatible with both)
- SSR rendering will use Angular Universal (not other SSR solutions like Analog or custom Node servers)

## Dependencies and Constraints

### External Dependencies

- **Foundation for Sites CSS**: Required for `.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`, `.is-active` classes
- **@angular/core**: v20+ for standalone components, signals, and modern APIs
- **@angular/common**: For common directives if needed (e.g., *ngFor in examples)
- **@angular/aria** (if available): Preferred for ARIA utilities and accessibility primitives
- **@angular/cdk** (if @angular/aria insufficient): Fallback for accessibility utilities

### Technical Constraints

- **No Foundation JavaScript**: Must not depend on or conflict with Foundation's jQuery-based JavaScript
- **OnPush Change Detection**: All components must use OnPush strategy for performance
- **Signal-based APIs**: All inputs must use `input()`, outputs must use `output()`, state must use signals
- **Standalone Architecture**: No NgModules; all components must be standalone
- **CSS-only Animations**: Component does not manage animations; relies on Foundation CSS transitions

### Browser and Platform Constraints

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **SSR Compatibility**: Must work with Angular Universal server-side rendering
- **Mobile Support**: Must work on touch devices (though keyboard navigation is desktop-focused)

### Accessibility Constraints

- **WCAG 2.1 AA**: Non-negotiable requirement
- **Screen Reader Support**: NVDA, JAWS, VoiceOver minimum
- **Keyboard Navigation**: All functionality must be keyboard accessible per ARIA accordion pattern

## Out of Scope (Future Enhancements)

The following features are explicitly out of scope for the initial implementation but may be considered for future versions:

- **Animations API**: Programmatic control over expand/collapse animations (Foundation CSS handles this)
- **Custom Theming**: CSS custom properties or theming API beyond Foundation classes
- **Nested Accordion Management**: Helper APIs for coordinating parent/child nested accordions
- **Accordion Groups**: Multiple accordion instances that coordinate state across instances
- **Lazy Content Loading**: Deferring content rendering until item is first expanded
- **URL Routing Integration**: Deep integration with Angular router for accordion state in URL
- **Persistence**: Saving/restoring accordion state to localStorage or other storage
- **Analytics Integration**: Built-in event tracking for accordion interactions
- **Right-to-Left (RTL) Support**: Specific RTL layout handling (may work by default with Foundation CSS)
- **Touch Gestures**: Swipe to expand/collapse on mobile devices
