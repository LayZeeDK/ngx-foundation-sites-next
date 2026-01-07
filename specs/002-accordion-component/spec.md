# Feature Specification: Accessible Accordion Component

**Feature Branch**: `002-accordion-component`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: Create a feature specification for an accessible, self-contained Accordion component and sub-components for the ngx-foundation-sites Angular component library

## Clarifications

### Session 2026-01-07

- Q: What is the **maximum number of accordion items** the component should efficiently support without performance degradation (rendering, keyboard navigation, ARIA updates)? → A: 100 items
- Q: How should accordion items **locate their parent accordion** component for state coordination? → A: Implicit query via DI token pattern
- Q: Should the component use **CDK-style pattern** (exported `nfsAccordionToken` + optional injection with `skipSelf`) or create a **custom DI token strategy** for parent-child communication? → A: CDK-style pattern with exported `nfsAccordionToken` + optional injection with `skipSelf`
- Q: Should the component support **eager content projection only** (always rendered), **lazy content via ng-template only**, or **both patterns**? → A: Both (eager via ng-content, lazy via ng-template[nfsAccordionContent])
- Q: When an accordion item is collapsed, should the content be **removed from DOM** (@if) or **kept in DOM with display:none** (CSS)? → A: Removed from DOM (@if conditional rendering)

### Session 2026-01-22

- Q: When **both** `accordion.disabled="true"` (global) **and** `item.disabled="false"` (per-item) are set, which takes precedence? → A: Additive (item disabled if either global OR item-level is true)
- Q: When keyboard navigation moves between accordion titles (ArrowUp/Down/Home/End), should focus transitions be animated? → A: Instant without animation (aligns with WAI-ARIA APG)
- Q: When an accordion is rendered with **zero accordion items** (e.g., `@for` iterating over an empty array), what should the component display? → A: Render empty container with no visual indicator
- Q: When deep linking encounters duplicate panel IDs across multiple accordion instances, should the system: (A) expand the first matching panel only, (B) expand all matching panels, (C) log a warning and expand the first match, or (D) log a warning and expand no panels? → A: Option D but pass an error to `ErrorHandler.handleError` instead of logging directly to console (expand first matching panel and report error via ErrorHandler)
- Q: When lazy-loaded content (`ng-template[nfsAccordionContent]`) is collapsed after being expanded, should the lifecycle mirror @defer behavior (where the referenced Angular Aria Accordion merge request will define the standard)? → A: Mirror @defer lifecycle (content rendered once and kept in memory until item destroyed). Angular Aria Accordion merge request will inform future optimizations, but MVP uses simple once-rendered-always-retained strategy.
- Q: For an accordion with the maximum supported item count (100 items), what are the acceptable performance targets for (A) initial render time and (B) toggle responsiveness (expand/collapse a single item)? → A: 5s render, 200ms toggle
- Q: When user-generated HTML is projected into accordion title or content via ng-content, how should the component handle potential XSS risks? → A: Option B - Treat all projected content as trusted (no built-in sanitization) and document that developers must sanitize externally before binding

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
5. **Given** an expanded item, **When** rendered, **Then** Foundation state classes are correctly applied (see FR-033 for .is-active class requirement)

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
3. **Given** an accordion with allowAllClosed="true", **When** user closes the last open item, **Then** all items are collapsed

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

A developer uses `@for` to render accordion items from a dynamic array. Items can be added, removed, or reordered without breaking keyboard navigation or ARIA relationships.

**Why this priority**: Real-world apps use dynamic data. Critical for production use but can be validated after core functionality works.

**Independent Test**: Can be tested by rendering an accordion with 3 items, adding a new item, removing an item, and verifying keyboard navigation and IDs update correctly. Delivers dynamic content support.

**Acceptance Scenarios**:

1. **Given** an accordion with 3 items rendered via `@for`, **When** a new item is added to the array, **Then** the new item renders with correct IDs and keyboard navigation includes it
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

- **Empty accordion**: When no accordion items are provided (e.g., `@for` over empty array), the component renders the empty container (`<ul class="accordion"></ul>`) with no focusable elements or broken ARIA references, and no built-in "No items" message (see FR-057)
- **Single item accordion**: Does keyboard navigation work correctly with only one item? (Home/End/Arrow keys should no-op or stay on single item)
- **All items disabled**: Can the accordion be rendered with all items disabled? (Should render but have no interactive items)
- **Nested accordions**: What happens if an accordion-item's content contains another accordion? (Should work independently with separate keyboard navigation contexts via DI token pattern)
- **Rapid clicks**: What happens if user rapidly clicks multiple titles in succession? (Should handle state transitions cleanly without race conditions)
- **Long content**: What happens when panel content is very long and causes scrolling? (Should scroll to reveal expanded content if needed)
- **ID collisions**: What happens if multiple accordions exist on the same page? (Auto-generated IDs must be unique across all instances using a counter or UUID strategy; for deep linking, duplicate `panelId` values across multiple accordion instances will expand the first matching panel and report an error via `ErrorHandler.handleError()`)
- **Programmatic control**: Can developers programmatically expand/collapse items via the component API? (Should provide methods per FR-075: `toggle()`, `down()`, `up()` exposed on NfsAccordionItem)
- **Focus management during removal**: What happens if the focused item is removed from the DOM? (Focus should move to a safe location, like the next item or parent accordion)
- **ARIA in nested content**: What happens if accordion-content contains interactive elements (buttons, links)? (Should maintain proper tab order and not interfere with child element accessibility)

## Requirements _(mandatory)_

### Functional Requirements

#### Component Structure

- **FR-001**: System MUST provide three standalone components (`<nfs-accordion>`, `<nfs-accordion-item>`, `<nfs-accordion-title>`) and one structural directive (`[nfsAccordionContent]`) per constitution principle: prefer directives over components when possible
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
- **FR-013**: When allowAllClosed input is true, all items MUST be able to be collapsed simultaneously

#### Public API - Inputs

- **FR-014**: `<nfs-accordion>` MUST accept a `multiExpand` signal input (boolean, default: false) to enable multi-expand mode
- **FR-015**: `<nfs-accordion>` MUST accept an `allowAllClosed` signal input (boolean, default: false) to control if all items can be closed
- **FR-016**: `<nfs-accordion>` MUST accept additional configuration signal inputs per `contracts/accordion-api.ts` (including `disabled`, `deepLink`, `deepLinkSmudge`, `deepLinkSmudgeDelay`, `deepLinkSmudgeOffset`, `updateHistory`, `wrap`, `titleHeadingLevel`, `softDisabled`, and optional `id`)
- **FR-017**: `<nfs-accordion-item>` MUST accept a required `panelId` signal input (string) used for deep linking and ARIA relationships
- **FR-018**: `<nfs-accordion-item>` MUST expose an `expanded` model signal (boolean, default: false) that supports two-way binding via `[(expanded)]`
- **FR-019**: `<nfs-accordion-item>` MUST accept a `disabled` signal input (boolean, default: false) to disable the item
- **FR-020**: System MUST auto-generate unique IDs for title/content elements used by `aria-controls` / `aria-labelledby` relationships when not explicitly provided

#### Public API - Outputs

- **FR-021**: `<nfs-accordion>` MUST expose `down` and `up` output events (Foundation parity), each providing the item ID and new expanded state
- **FR-022**: Output events MUST NOT fire when an action is prevented (e.g., disabled item or cannot close last open item)
- **FR-023**: Output payload MUST include `itemId` and `expanded` for consumers to react without querying DOM

#### Content Projection

- **FR-024**: `<nfs-accordion>` MUST accept `<nfs-accordion-item>` components via content projection (ng-content)
- **FR-025**: `<nfs-accordion-item>` MUST accept exactly one `<nfs-accordion-title>` and one of: (a) eager content via ng-content, or (b) lazy content via `ng-template[nfsAccordionContent]`
- **FR-026**: `<nfs-accordion-title>` MUST accept arbitrary HTML content via content projection
- **FR-027**: `<nfs-accordion-item>` MUST support lazy content loading via `ng-template[nfsAccordionContent]` directive (content rendered only when first expanded)
- **FR-028**: The structural directive content MUST use a lifecycle that mirrors @defer retention behavior: once rendered (on first expand), content stays in memory until item destroyed. This is the MVP fallback strategy; future Angular ARIA accordion patterns may inform lifecycle optimizations post-v1.0

#### Styling and CSS Classes

- **FR-029**: `<nfs-accordion>` root element MUST have the CSS class `.accordion`
- **FR-030**: `<nfs-accordion-item>` element MUST have the CSS class `.accordion-item`
- **FR-031**: `<nfs-accordion-title>` button element MUST have the CSS class `.accordion-title`
- **FR-032**: Panel content wrapper element MUST have the CSS class `.accordion-content`
- **FR-033**: When an item is expanded, its `<nfs-accordion-item>` element MUST have the CSS class `.is-active` added
- **FR-034**: When an item is collapsed, the `.is-active` class MUST be removed
- **FR-035**: When an item is disabled, its `<nfs-accordion-item>` element MUST have a CSS class indicating disabled state (e.g., `.is-disabled`)
- **FR-036**: Component MUST NOT include Foundation JavaScript; all behavior MUST be implemented in Angular

#### Keyboard Interactions

- **FR-037**: Pressing Tab MUST move focus to the next focusable element in the natural tab order
- **FR-038**: When focused on an accordion title, pressing Enter or Space MUST toggle the item's expansion state
- **FR-039**: When focused on an accordion title, pressing ArrowDown MUST move focus to the next enabled accordion title
- **FR-040**: When focused on an accordion title, pressing ArrowUp MUST move focus to the previous enabled accordion title
- **FR-041**: Arrow key navigation MUST wrap when `wrap` input is true (ArrowDown on last item moves to first; ArrowUp on first item moves to last)
- **FR-042**: When focused on an accordion title, pressing Home MUST move focus to the first enabled accordion title
- **FR-043**: When focused on an accordion title, pressing End MUST move focus to the last enabled accordion title
- **FR-044**: Disabled items MUST be skipped during arrow key navigation
- **FR-045**: Keyboard interactions MUST only affect the title/trigger elements, not the content panels

#### Disabled State

- **FR-046**: Disabled accordion items MUST NOT respond to click events
- **FR-047**: Disabled accordion items MUST NOT respond to Enter/Space keyboard events
- **FR-048**: Disabled accordion items MUST be skipped during keyboard navigation (ArrowUp/Down)
- **FR-049**: An accordion item is considered disabled if **either** the global `accordion.disabled` input is true **OR** the item-level `item.disabled` input is true (additive precedence: disabled state cannot be overridden at item level when global disabled is true)
- **FR-050**: When `softDisabled` is true (default), disabled items MUST remain focusable via Tab but not activatable (aria-disabled="true", no disabled attribute)
- **FR-051**: When `softDisabled` is false, disabled items MUST be completely non-interactive (disabled attribute, not in tab order)
- **FR-052**: Disabled items MUST have visual styling indicating they are not interactive

#### Dynamic Content

- **FR-053**: Component MUST support dynamically added/removed accordion items (e.g., via `@for`)
- **FR-054**: When items are added/removed, ARIA relationships (aria-controls, aria-labelledby) MUST remain correctly linked
- **FR-055**: When items are added/removed, keyboard navigation MUST update to include/exclude items accordingly
- **FR-056**: If a focused item is removed from the DOM, focus MUST move to a safe location (next item, previous item, or parent)
- **FR-057**: When an accordion is rendered with zero accordion items (e.g., `@for` iterating over an empty array), the component MUST render the accordion container element (`<ul class="accordion"></ul>`) without errors, with no focusable elements or broken ARIA references, and without displaying a built-in "No items" message (developers are responsible for conditional rendering or custom empty-state UX)

#### Conditional Rendering and ARIA Stability

- **FR-058**: When an accordion item is collapsed, its content panel MUST be removed from the DOM using @if conditional rendering (not CSS display:none)
- **FR-059**: The panel content wrapper element with `role="region"` and `aria-labelledby` MUST remain in the DOM when collapsed to maintain stable `aria-controls` relationship
- **FR-060**: When collapsed, the panel wrapper MUST have the `inert` attribute to prevent keyboard access to removed content
- **FR-061**: The `aria-controls` attribute on the trigger MUST always reference a valid element ID, even when the content is removed from the DOM

#### SSR Compatibility

- **FR-062**: Component MUST render without runtime errors in Angular Universal/SSR context
- **FR-063**: Component MUST NOT reference browser-only APIs (window, document) during SSR initialization
- **FR-064**: Component MUST use Angular's platform detection or afterRender hooks for browser-specific code
- **FR-065**: Server-rendered HTML MUST include correct semantic structure and ARIA attributes before client hydration

#### Deep Linking (Foundation Feature Parity)

- **FR-066**: When `deepLink` input is true, opening a panel MUST update the browser URL hash with the panel ID
- **FR-067**: When `deepLink` is true and page loads with a hash matching a panel ID, that panel MUST automatically expand
- **FR-068**: When `updateHistory` is true, panel changes MUST use `history.pushState()` (browser back button navigates between panels)
- **FR-069**: When `updateHistory` is false (default), panel changes MUST use `history.replaceState()` (browser back button does not track panel changes)
- **FR-070**: When `deepLinkSmudge` is true, after expanding a panel via hash, the page MUST scroll to ensure the panel is visible
- **FR-071**: `deepLinkSmudgeDelay` input MUST specify the delay in milliseconds before scrolling (default: 300ms)
- **FR-072**: `deepLinkSmudgeOffset` input MUST specify the scroll offset in pixels (useful for sticky headers, default: 0)
- **FR-073**: When deep linking encounters duplicate `panelId` values across multiple accordion instances on the same page, the system MUST expand the first matching panel only and report an error via `ErrorHandler.handleError()` to warn developers about the invalid configuration while maintaining graceful degradation
- **FR-074**: When deep linking encounters runtime errors (malformed URL hash, invalid panel ID references, or other initialization failures), the component MUST report errors via `ErrorHandler.handleError()` but continue component initialization (graceful degradation) - the accordion remains functional even with broken deep links
- **FR-074b**: `<nfs-accordion>` MUST inject Angular's `ErrorHandler` service for reporting deep linking errors (duplicate panel IDs) per `ErrorHandler.handleError()` API instead of direct console logging

### Accessibility Requirements (MANDATORY)

#### WCAG and AXE Compliance

- **AR-001**: Component MUST pass all AXE automated accessibility checks
- **AR-002**: Component MUST meet WCAG 2.1 AA standards
- **AR-003**: All color contrast requirements MUST be met (4.5:1 for normal text, 3:1 for large text)
- **AR-004**: Component MUST be testable with NVDA, JAWS, and VoiceOver screen readers

#### ARIA Roles and Attributes

Note: AR-005 through AR-012 requirements are covered by corresponding FR requirements (FR-044 through FR-051). The following requirements address unique accessibility concerns not duplicated elsewhere:

- **AR-013**: Title button and panel wrapper elements MUST have unique IDs for proper ARIA relationships across multiple accordion instances on the same page
- **AR-014**: The panel wrapper element MUST remain in the DOM when collapsed to ensure `aria-controls` always references a valid ID

#### Keyboard Accessibility

- **AR-015**: All interactive elements (accordion titles) MUST be keyboard accessible
- **AR-016**: Tab key MUST follow natural DOM tab order
- **AR-017**: Enter and Space keys MUST activate the focused accordion title
- **AR-018**: Arrow keys (Up/Down), Home, and End MUST navigate between accordion titles per FR-036 to FR-043

#### Focus Management

- **AR-019**: Focus indicators MUST be visible and meet WCAG contrast requirements
- **AR-020**: Focus MUST be managed correctly when items are dynamically added/removed
- **AR-021**: Focus MUST NOT be lost or trapped within the accordion
- **AR-022**: When an item is expanded via keyboard, focus MUST remain on the title element (not move to content)
- **AR-023**: When keyboard navigation moves focus between accordion titles (ArrowUp/Down/Home/End), focus transitions MUST be instant without animation to provide immediate feedback and prevent motion-induced disorientation (aligns with WAI-ARIA APG accordion pattern and WCAG best practices)

#### Screen Reader Support

- **AR-024**: Screen readers MUST announce the accordion title text and button role
- **AR-025**: Screen readers MUST announce the current expansion state (expanded/collapsed)
- **AR-026**: Screen readers MUST convey the relationship between titles and content panels
- **AR-027**: When an item expands/collapses, screen readers MUST announce the state change

### Security Requirements

- **SR-001**: The component MUST treat all projected content (via `<ng-content>`) as trusted and perform NO sanitization on developer-provided content
- **SR-002**: The component MUST NOT use `DomSanitizer` or attempt to sanitize projected HTML - sanitization is the developer's responsibility at the data-binding level
- **SR-003**: The component MUST NOT bypass Angular's security context or use methods like `bypassSecurityTrustHtml` internally
- **SR-004**: Component documentation MUST clearly warn developers that they are responsible for sanitizing user-generated content before projecting it into the accordion (using `DomSanitizer` at the application level)
- **SR-005**: The component follows Angular Material's security model: structural components don't sanitize content; developers sanitize at the data source

### Component API Requirements

- **CA-001**: All components MUST use standalone architecture (no NgModules required)
- **CA-002**: Component inputs MUST use the `input()` signal function with proper type annotations
- **CA-003**: Component outputs MUST use the `output()` function
- **CA-004**: Component state MUST be managed using signals (computed, effect as appropriate)
- **CA-005**: All components MUST use `ChangeDetectionStrategy.OnPush`
- **CA-006**: Component selectors MUST follow the naming convention: `nfs-accordion`, `nfs-accordion-item`, `nfs-accordion-title`, `nfs-accordion-content`
- **CA-007**: Component API MUST align with Foundation for Sites naming conventions (multiExpand maps to data-multi-expand, allowAllClosed maps to data-allow-all-closed)
- **CA-008**: Before implementation, an API design document MUST be created using the `foundation-api-design` skill to document the complete component API, inputs, outputs, content projection, ARIA requirements, and usage examples
- **CA-009**: **Foundation JavaScript API Parity (MANDATORY)**: `<nfs-accordion-item>` MUST expose Foundation method names as public Angular methods: `toggle()`, `down()`, `up()` (see FR-075)
- **CA-010**: **Foundation JavaScript Event Parity (MANDATORY)**: Expose Foundation event names (without the `.zf.*` namespace) as Angular outputs: `down`, `up`
- **CA-011**: **Parity Exceptions (MANDATORY)**: `destroy()` is handled via Angular lifecycle / `DestroyRef` (no public method), and `init()` is handled by Angular auto-initialization (no public method)

#### Foundation JavaScript API Alignment

- **FR-075**: `<nfs-accordion-item>` MUST expose Foundation-equivalent methods that mirror Foundation's JavaScript API: `toggle()` (toggles expand/collapse), `down()` (expands panel), `up()` (collapses panel)
- **FR-076**: `<nfs-accordion>` MUST emit Foundation-equivalent events as Angular outputs: `down` (emitted when any panel opens, with payload containing the opened item reference), `up` (emitted when any panel closes, with payload containing the closed item reference)

### Key Entities _(Component Architecture)_

- **NfsAccordion**: Root container component (selector: `<nfs-accordion>`, renders as `<ul class="accordion">`) that manages overall accordion state, tracks which items are open, enforces `multiExpand` and `allowAllClosed` rules, provides context to child items via exported `nfsAccordionToken`, handles keyboard navigation coordination, and implements deep linking features (`deepLink`, `deepLinkSmudge`, `updateHistory`). Emits Foundation parity events via outputs: `down`, `up`.

- **NfsAccordionItem**: Individual accordion item (selector: `<nfs-accordion-item>`, renders as `<li class="accordion-item">`) that manages its own expanded/collapsed state via `expanded` model signal, communicates with parent accordion via optional DI token injection (`inject(nfsAccordionToken, { optional: true, skipSelf: true })`), handles disabled state, coordinates title/content sub-components, and generates unique IDs for ARIA relationships. Accepts input `panelId` (required, string), `expanded` (model, boolean, default false), `disabled` (boolean, default false). Exposes Foundation parity methods: `down()`, `up()`, `toggle()`.

- **NfsAccordionTitle**: Clickable trigger element (selector: `<nfs-accordion-title>`, renders as `<button class="accordion-title">`, optionally wrapped in `<div role="heading" aria-level="N">` if `titleHeadingLevel` is set on parent accordion) that displays the title content, manages button role and ARIA attributes (`aria-expanded`, `aria-controls`, `aria-disabled`), handles click and keyboard events (Enter/Space to toggle), and projects title content via ng-content.

- **NfsAccordionContentDirective**: Structural directive (selector: `[nfsAccordionContent]` on `ng-template`) for lazy content loading. Content lifecycle uses simple strategy: once rendered (on first expand), content stays in memory until item destroyed. This mirrors @defer's retention behavior. Angular Aria Accordion merge request (when released) may inform future lifecycle optimizations. Item always maintains a stable panel wrapper element with `role="region"` and `aria-labelledby` in the DOM, even when content is removed via @if, to ensure `aria-controls` references remain valid.

- **nfsAccordionToken (DI Token)**: Exported injection token (`export const nfsAccordionToken = new InjectionToken<NfsAccordionComponent>('nfsAccordionToken')`) providing access to parent accordion component. Enables decoupled parent-child communication without property binding. Used by items to register with parent and query settings like `multiExpand`, `allowAllClosed`, `wrap`, `titleHeadingLevel`, `softDisabled`. Uses CDK-style pattern per constitution: token is exported, injection is optional with `skipSelf`, allowing items to work standalone when no parent exists.

**Rationale for DI Pattern**: This follows the CDK pattern (exported token + optional injection) documented in constitution.md Section VIII. Angular's DI for content-projected elements follows the declaration-site injector, not the DOM tree, so this pattern enables graceful fallback when no parent is found in the DI chain.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Component passes 100% of AXE automated accessibility checks with no violations
- **SC-002**: Component meets WCAG 2.1 AA standards verified by manual audit with screen readers (NVDA, JAWS, VoiceOver)
- **SC-003**: Keyboard-only users can complete all accordion interactions (expand, collapse, navigate) without using a mouse
- **SC-004**: All keyboard interactions respond within 100ms of key press (for accordions with typical item counts; for maximum supported 100 items, toggle operations may take up to 200ms)
- **SC-005**: Component renders and hydrates successfully in SSR context without runtime errors
- **SC-006**: Developers can implement a basic FAQ accordion with 5 items in under 10 lines of template code
- **SC-007**: Component API documentation includes complete examples for all configuration options (multiExpand, allowAllClosed, disabled, initial state)
- **SC-008**: All user stories P1-P3 pass acceptance tests in Storybook play functions
- **SC-009**: Component supports dynamic item arrays of 100 items without performance degradation: initial render completes within 5 seconds, and toggle operations (expand/collapse a single item) complete within 200ms (tested via `@for` with maximum supported item count)
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

## Complete Component API

#### NfsAccordion (Container Component)

**Selector**: `nfs-accordion`  
**Host Element**: Renders as `<ul class="accordion">`

**Inputs**:

- `multiExpand` (boolean, default: `false`) - Allow multiple panels to be expanded simultaneously (maps to Foundation's `data-multi-expand`)
- `allowAllClosed` (boolean, default: `false`) - Allow all panels to be closed (maps to Foundation's `data-allow-all-closed`)
- `disabled` (boolean, default: `false`) - Disable all accordion items
- `deepLink` (boolean, default: `false`) - Synchronize expanded panel with URL hash (maps to Foundation's `data-deep-link`)
- `deepLinkSmudge` (boolean, default: `false`) - Auto-scroll to deep-linked panel (maps to Foundation's `data-deep-link-smudge`)
- `deepLinkSmudgeDelay` (number, default: `300`) - Delay before scrolling to deep-linked panel in milliseconds (maps to Foundation's `data-deep-link-smudge-delay`)
- `deepLinkSmudgeOffset` (number, default: `0`) - Offset for scroll position, e.g., sticky header height in pixels (maps to Foundation's `data-deep-link-smudge-offset`)
- `updateHistory` (boolean, default: `false`) - Use pushState instead of replaceState for deep linking (maps to Foundation's `data-update-history`)
- `wrap` (boolean, default: `false`) - Keyboard navigation wraps from last to first item and vice versa (Angular extension, not in Foundation)
- `titleHeadingLevel` (1 | 2 | 3 | 4 | 5 | 6 | null, default: `null`) - Heading level for accordion titles. When set, wraps trigger buttons in `<div role="heading" aria-level="N">` for ARIA document outline (Angular extension, not in Foundation)
- `softDisabled` (boolean, default: `true`) - When disabled, items remain focusable but not activatable for better accessibility (Angular extension, not in Foundation)

**Outputs**:

- `down` - Emitted when a panel is opened (Foundation parity: `down.zf.accordion`)
- `up` - Emitted when a panel is closed (Foundation parity: `up.zf.accordion`)

**Default Behavior**: Matches Foundation for Sites — by default `allowAllClosed` is `false` (at least one pane must remain open). Set `[allowAllClosed]="true"` to allow all panes to be collapsed.

#### NfsAccordionItem (Item Component)

**Selector**: `nfs-accordion-item`  
**Host Element**: Renders as `<li class="accordion-item">`

**Inputs**:

- `panelId` (string, required) - Unique identifier for this panel (used for deep linking and ARIA relationships)
- `expanded` (boolean model, default: `false`) - Whether the panel is expanded (supports two-way binding via `[(expanded)]`)
- `disabled` (boolean, default: `false`) - Whether this item is disabled

**Methods**:

- `down(): void` - Expand this panel (Foundation parity: `.down($target)`)
- `up(): void` - Collapse this panel (Foundation parity: `.up($target)`)
- `toggle(): void` - Toggle this panel (Foundation parity: `.toggle($target)`)

#### NfsAccordionTitle (Trigger Component)

**Selector**: `nfs-accordion-title`  
**Host Element**: Renders as `<button type="button" class="accordion-title">`, optionally wrapped in `<div role="heading" aria-level="N">` if `titleHeadingLevel` is set on parent accordion

**No public inputs/outputs** - Automatically coordinates with parent item and accordion via DI.

#### NfsAccordionContent (Lazy Content Directive)

**Selector**: `ng-template[nfsAccordionContent]`  
**Usage**: Structural directive for lazy content loading. Content is rendered only when the item is first expanded.

**No public inputs/outputs** - Automatically registers with parent item via DI.

### Usage Examples

#### Basic Accordion

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

#### Multi-Expand Mode

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

#### Two-way Binding

```html
<nfs-accordion>
  <nfs-accordion-item panelId="details" [(expanded)]="isDetailsOpen">
    <nfs-accordion-title>Details</nfs-accordion-title>
    <p>Details content...</p>
  </nfs-accordion-item>
</nfs-accordion>

<button (click)="isDetailsOpen = !isDetailsOpen">Toggle Details Externally</button>
```

#### Lazy Content Loading

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

#### Deep Linking with Scroll Adjustment

```html
<!-- URL: /page#settings will auto-expand the settings panel and scroll to it -->
<nfs-accordion [deepLink]="true" [deepLinkSmudge]="true" [deepLinkSmudgeDelay]="500" [deepLinkSmudgeOffset]="80">
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

#### Heading Level for ARIA Document Outline

```html
<!-- Wraps triggers in <h3> elements for screen reader navigation -->
<nfs-accordion [titleHeadingLevel]="3">
  <nfs-accordion-item panelId="panel-1">
    <nfs-accordion-title>Section 1</nfs-accordion-title>
    <p>Content...</p>
  </nfs-accordion-item>
</nfs-accordion>
```

#### Programmatic Control

```typescript
import { Component, viewChildren } from '@angular/core';

@Component({
  /* ... */
})
export class MyComponent {
  protected readonly items = viewChildren(NfsAccordionItem);

  expandFirst() {
    this.items().at(0)?.down();
  }

  collapseFirst() {
    this.items().at(0)?.up();
  }
}
```

### Conditional Rendering Strategy (@if with ARIA Stability)

**Challenge**: We want to remove collapsed panel content from the DOM for performance (@if conditional rendering) but maintain stable `aria-controls` relationships (which require the referenced element to always exist).

**Solution**: Keep a stable panel wrapper element in the DOM at all times, but conditionally render the content inside it:

```typescript
// In NfsAccordionItemComponent template
<nfs-accordion-title>
  <ng-content select="nfs-accordion-title" />
</nfs-accordion-title>

<!-- Panel wrapper: ALWAYS in DOM for ARIA stability -->
<div
  class="accordion-content"
  [id]="panelId()"
  role="region"
  [attr.aria-labelledby]="triggerId()"
  [attr.inert]="expanded() ? null : ''">

  <!-- Content: CONDITIONALLY rendered with @if -->
  @if (lazyContent(); as lazy) {
    @if (expanded() || hasBeenExpanded()) {
      <ng-container [ngTemplateOutlet]="lazy.templateRef" />
    }
  } @else {
    @if (expanded()) {
      <ng-content />
    }
  }
</div>
```

**Key Points**:

1. The `<div class="accordion-content" role="region">` with the `panelId` is **always in the DOM**, ensuring `aria-controls` on the trigger button always references a valid element.
2. The actual content inside the wrapper is **conditionally rendered** with `@if (expanded())`, removing it from the DOM when collapsed for performance.
3. The `inert` attribute on the wrapper prevents keyboard navigation into an empty collapsed panel.
4. For lazy content (`ng-template[nfsAccordionContent]`), the lifecycle mirrors @defer behavior as defined by the Angular Aria Accordion merge request (awaiting upstream release), aligning with @defer's content retention and destruction semantics rather than implementing a custom lifecycle strategy.

**Benefits**:

- ARIA compliant: `aria-controls` always references a valid ID
- Performance optimized: Collapsed content removed from DOM
- No layout thrashing: Stable wrapper element prevents reflow
- Foundation CSS compatible: `.accordion-content` class always present for styling

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
@Component({
  host: {
    '(keydown)': 'handleKeydown($event)',
  },
})
export class NfsAccordionComponent {
  handleKeydown(event: KeyboardEvent) {
    if (!(event.target as Element | null)?.closest('.accordion-title')) return;

    // Handle ArrowUp/Down/Home/End
    // Call focusItem(index) to move focus
  }
}
```

**Focus Movement Animation**: Per AR-023, focus transitions during keyboard navigation (ArrowUp/Down/Home/End) must be instant without animation. Do not apply CSS transitions to `:focus` or `:focus-visible` states that would delay or animate focus indicator changes. This ensures immediate feedback for keyboard users and prevents motion-induced disorientation (WCAG best practice, WAI-ARIA APG alignment).

### State Management with Signals

Use signals to manage expansion state reactively:

```typescript
// In NfsAccordionItemComponent
expanded = model(false);

// In NfsAccordionComponent
openItemIds = signal<string[]>([]);

// Computed to check if item should be expanded
isItemExpanded = computed(() => this.openItemIds().includes(this.itemId));
```

### CSS Class Application

Use host bindings or `[class.is-active]` to apply Foundation classes:

```typescript
// In NfsAccordionItemComponent
@Component({
  host: {
    '[class.is-active]': 'expanded()',
  },
})
export class NfsAccordionItemComponent {
  expanded = model(false);
}
```

### SSR Compatibility

Avoid direct `document` or `window` references during initialization. Use `afterRender` or `isPlatformBrowser`:

```typescript
import { afterRender, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

private readonly platformId = inject(PLATFORM_ID);

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
- **@angular/common**: For common directives if needed (e.g., `NgTemplateOutlet` in examples)
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

- **Animations API**: Programmatic control over expand/collapse animations (Foundation CSS handles this via CSS transitions)
- **Custom Theming**: CSS custom properties or theming API beyond Foundation classes
- **Nested Accordion Management**: Helper APIs for coordinating parent/child nested accordions
- **Accordion Groups**: Multiple accordion instances that coordinate state across instances
- **URL Routing Integration**: Deep integration with Angular router for accordion state in URL (basic hash-based deep linking is in scope via `deepLink` input)
- **Persistence**: Saving/restoring accordion state to localStorage or other storage
- **Analytics Integration**: Built-in event tracking for accordion interactions
- **Right-to-Left (RTL) Support**: Specific RTL layout handling (may work by default with Foundation CSS)
- **Touch Gestures**: Swipe to expand/collapse on mobile devices
