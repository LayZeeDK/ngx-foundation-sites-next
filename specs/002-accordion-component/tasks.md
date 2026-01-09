# Tasks: Accessible Accordion Component

**Input**: Design documents from `/specs/002-accordion-component/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests are OPTIONAL and only included per feature specification request. This implementation focuses on Storybook interactive tests as primary testing strategy per spec.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is an Nx monorepo with library at `packages/ngx-foundation-sites/`. Component implementation is in `packages/ngx-foundation-sites/src/lib/accordion/`. Storybook stories are in `packages/ngx-foundation-sites/.storybook/stories/accordion/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic accordion structure

- [ ] T001 Verify Nx library structure exists at packages/ngx-foundation-sites/
- [ ] T002 Verify ng-packagr configuration for library publishing in packages/ngx-foundation-sites/ng-package.json
- [ ] T003 [P] Verify component selector prefix is `nfs-` in packages/ngx-foundation-sites/project.json
- [ ] T004 [P] Verify ESLint and Prettier configuration in .eslintrc.json and .prettierrc
- [ ] T005 [P] Verify Storybook is configured at packages/ngx-foundation-sites/.storybook/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create accordion directory structure at packages/ngx-foundation-sites/src/lib/accordion/
- [ ] T007 [P] Set up Foundation SCSS imports in packages/ngx-foundation-sites/src/lib/accordion/\_accordion-imports.scss
- [ ] T008 [P] Create injection token file at packages/ngx-foundation-sites/src/lib/accordion/accordion.token.ts (exports nfsAccordionToken for DI)
- [ ] T009 Install @angular/cdk if not present (for FocusMonitor, ListKeyManager, a11y utilities)
- [ ] T009a Verify @angular/cdk importability and required utilities (FocusMonitor, ListKeyManager). Confirm version matches workspace policy and that Storybook builds import the CDK without errors. (Blocking verification)
- [ ] T010 [P] Create public API exports file at packages/ngx-foundation-sites/src/lib/accordion/index.ts
- [x] T011 Create API design document using `foundation-api-design` skill at packages/ngx-foundation-sites/ACCORDION_API_DESIGN.md
  - Verified: 2026-01-09 (file exists, 771 lines, covers Foundation CSS mapping, WAI-ARIA requirements, CDK-style DI patterns)
- [ ] T012 [P] Create README documentation template at packages/ngx-foundation-sites/src/lib/accordion/README.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Single Accordion Interaction (Priority: P1) 🎯 MVP

**Goal**: Core accordion pattern - one answer visible at a time, click to expand/collapse, Foundation CSS classes applied correctly

**Independent Test**: Render a basic accordion with 3 items, click titles to expand/collapse panels, verify only one panel is open at a time. Delivers immediately usable FAQ/content organization functionality.

### Storybook Tests for User Story 1

> **NOTE: Storybook interactive tests are PRIMARY testing strategy per spec.md. Write these FIRST.**

- [ ] T013 [P] [US1] Create basic Storybook story with 3 FAQ items at packages/ngx-foundation-sites/.storybook/stories/accordion/Basic.story.ts
- [ ] T014 [US1] Add play function to Basic story: click item 2 title, verify item 2 expands, verify aria-expanded="true"
- [ ] T015 [US1] Add play function to Basic story: click item 3 title, verify item 3 expands and item 2 collapses
- [ ] T016 [US1] Add play function to Basic story: click expanded item 1 title, verify item 1 collapses
- [ ] T017 [P] [US1] Add accessibility checks to Basic story using @storybook/addon-a11y
- [ ] T183 [P] [US1] Add Storybook story variant to Basic story: render accordion with interactive elements inside title content (button, link), verify host trigger still toggles and nested elements are focusable in packages/ngx-foundation-sites/.storybook/stories/accordion/Basic.story.ts

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create NfsAccordion component at packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts (standalone, OnPush, host class="accordion", selector: nfs-accordion)
- [ ] T019 [P] [US1] Create NfsAccordionItem component at packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts (standalone, OnPush, host class="accordion-item", selector: nfs-accordion-item)
- [ ] T020 [P] [US1] Create NfsAccordionTitle component at packages/ngx-foundation-sites/src/lib/accordion/accordion-title.component.ts (standalone, OnPush, selector: nfs-accordion-title, renders as button)
- [ ] T021 [US1] Implement NfsAccordion inputs using input() function: multiExpand (default: false), allowAllClosed (default: false)
- [ ] T022 [US1] Implement NfsAccordionItem inputs: panelId (optional string; system generates when absent), expanded (model signal, default: false), disabled (default: false)
- [ ] T023 [US1] Implement state management in NfsAccordion: #openItemIds signal, registerItem(), unregisterItem(), notifyItemToggle()
- [ ] T024 [US1] Implement single-expand logic: when multiExpand=false, expanding one item closes others
- [ ] T025 [US1] Implement NfsAccordion provides nfsAccordionToken (useExisting pattern)
- [ ] T026 [US1] Implement NfsAccordionItem injects nfsAccordionToken (optional: true, skipSelf: true)
- [ ] T027 [US1] Implement click handler in NfsAccordionTitle that calls parent item's toggle() method
- [ ] T028 [US1] Add Foundation CSS classes: .accordion, .accordion-item, .accordion-title, .accordion-content
- [ ] T029 [US1] Implement .is-active class binding on NfsAccordionItem when expanded=true
- [ ] T030 [US1] Add JSDoc comments documenting Foundation for Sites equivalents (data-multi-expand → multiExpand)
- [ ] T031 [US1] Export all components from packages/ngx-foundation-sites/src/lib/accordion/index.ts
- [ ] T184 [US1] Implement nested focusable detection in NfsAccordionTitle: detect if projected content contains focusable elements, if element appears to replace host trigger, call ErrorHandler.handleError() with guidance in packages/ngx-foundation-sites/src/lib/accordion/accordion-title.component.ts

**Checkpoint**: User Story 1 should be fully functional - basic FAQ accordion works

---

## Phase 4: User Story 2 - Keyboard Navigation and Focus Management (Priority: P1)

**Goal**: Keyboard-only user can navigate using Tab, arrow keys, Enter/Space without a mouse

**Independent Test**: Render accordion, use only keyboard (Tab to first title, ArrowDown/Up, Enter/Space to toggle, Home/End). Delivers complete keyboard accessibility.

### Storybook Tests for User Story 2

- [ ] T032 [P] [US2] Create KeyboardNavigation story at packages/ngx-foundation-sites/.storybook/stories/accordion/KeyboardNavigation.story.ts
- [ ] T033 [US2] Add play function: simulate Tab, verify focus on first title
- [ ] T034 [US2] Add play function: simulate ArrowDown, verify focus moves to next title
- [ ] T035 [US2] Add play function: simulate ArrowUp, verify focus moves to previous title (with wraparound from first to last)
- [ ] T036 [US2] Add play function: simulate Home, verify focus moves to first title
- [ ] T037 [US2] Add play function: simulate End, verify focus moves to last title
- [ ] T038 [US2] Add play function: simulate Enter/Space on collapsed title, verify panel expands
- [ ] T039 [P] [US2] Add accessibility checks for keyboard navigation and focus indicators
- [ ] T181 [P] [US2] Add Storybook play test: simulate ArrowDown keyboard event and simultaneous click on different item within 10ms, verify events are serialized (FIFO by timestamp), final expansion state is stable in packages/ngx-foundation-sites/.storybook/stories/accordion/KeyboardNavigation.story.ts

### Implementation for User Story 2

- [ ] T040 [US2] Implement keyboard event handler in NfsAccordion: (keydown) host binding with handleKeydown() method
- [ ] T041 [US2] Implement ArrowDown handler: move focus to next enabled title (skip disabled)
- [ ] T042 [US2] Implement ArrowUp handler: move focus to previous enabled title (skip disabled)
- [ ] T043 [US2] Implement Home handler: move focus to first enabled title
- [ ] T044 [US2] Implement End handler: move focus to last enabled title
- [ ] T045 [US2] Implement Enter/Space handlers in NfsAccordionTitle: toggle parent item expansion
- [ ] T046 [US2] Add focus management utilities: focusItem(index), findNextEnabledItem(), findPreviousEnabledItem()
- [ ] T047 [US2] Implement focus() and blur() public methods on NfsAccordionTitle
- [ ] T048 [US2] Add tabindex="0" to title buttons for keyboard accessibility
- [ ] T049 [US2] Ensure focus indicators meet WCAG contrast requirements (verify with Foundation CSS)
- [ ] T182 [US2] Implement event timestamp ordering in NfsAccordion: enqueue all UI events with `{ ts: performance.now(), type, eventTarget, payload }`, process event queue FIFO while allowing cross-item concurrency in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
- [ ] T182b [P] [US2] Add unit test for FR-106a event timestamp ordering logic: verify FIFO processing order, cross-item concurrency allowed, focus updates get priority, expansion state resolves by timestamp in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.spec.ts

**Checkpoint**: Keyboard navigation fully functional - all interactions work without mouse

---

## Phase 5: User Story 3 - Screen Reader Compatibility (Priority: P1)

**Goal**: Screen reader users understand structure, state, and relationships

**Independent Test**: Test with NVDA/JAWS/VoiceOver, verify announcements include role, state, content. Delivers accessible experience.

### Storybook Tests for User Story 3

- [ ] T050 [P] [US3] Create ScreenReader story at packages/ngx-foundation-sites/.storybook/stories/accordion/ScreenReader.story.ts
- [ ] T051 [US3] Add assertions for ARIA attributes: aria-expanded, aria-controls, aria-labelledby on all items
- [ ] T052 [US3] Add assertions for role="region" on panel content wrappers
- [ ] T053 [US3] Add assertions for unique auto-generated IDs (verify no collisions)
- [ ] T054 [P] [US3] Run AXE checks with @storybook/addon-a11y to verify ARIA compliance
- [ ] T176 [P] [US3] Add Storybook test: change panelId at runtime, verify item re-registers with parent and ARIA IDs update atomically in packages/ngx-foundation-sites/.storybook/stories/accordion/ScreenReader.story.ts
- [ ] T177 [US3] Add Storybook test: change panelId while deepLink enabled, verify item does NOT auto-expand (deep link only responds to URL hash changes) in packages/ngx-foundation-sites/.storybook/stories/accordion/DeepLinking.story.ts (covers FR-020c: panelId/deepLink interaction)
- [ ] T185 [P] [US3] Add Storybook story variant to ScreenReader story: render accordion with empty panel content, verify panel wrapper maintains valid ARIA even with no inner content in packages/ngx-foundation-sites/.storybook/stories/accordion/ScreenReader.story.ts
- [ ] T187 [P] [US3] Add Storybook play test to ScreenReader story: change accordion title text dynamically, verify live region announces change when announce=true in packages/ngx-foundation-sites/.storybook/stories/accordion/ScreenReader.story.ts
- [ ] T199 [P] [US3] Add Storybook play test to ScreenReader story: verify live region receives expand/collapse announcements when announce=true, no live region when announce=false in packages/ngx-foundation-sites/.storybook/stories/accordion/ScreenReader.story.ts (covers AR-027a expand/collapse; see T187 for complementary title-change announcement coverage)

### Implementation for User Story 3

- [ ] T055 [P] [US3] Implement ARIA attributes on NfsAccordionTitle button: aria-expanded (computed from item.expanded signal)
- [ ] T056 [P] [US3] Implement ARIA attributes on NfsAccordionTitle button: aria-controls (references panel ID)
- [ ] T057 [US3] Implement unique ID generation in NfsAccordion: static counter + instance ID (nfs-accordion-${counter++})
- [ ] T057b [P] [US3] Implement ID auto-generation as an Angular injectable service (`NfsAccordionIdGeneratorService`) in packages/ngx-foundation-sites/src/lib/accordion/accordion-id-generator.service.ts (service providedIn: 'platform'). **Intentionally internal**: This service SHOULD NOT be exported from public barrel index.ts because ID generation is an implementation detail—consumers use `panelId` input or rely on auto-generation, never the service directly. See T-AC-004 for naming harmonization.
- [ ] T057c [US3] Implement panelId duplicate detection per FR-020a: maintain registration registry `Map<string, NfsAccordionItem[]>` in NfsAccordion, validate uniqueness on registerItem() and panelId changes, call ErrorHandler.handleError() with structured Error on duplicates, expand first-registered item only in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
- [ ] T058 [US3] Generate title button ID: ${accordionInstanceId}-title-${itemIndex}
- [ ] T059 [US3] Use user-provided panelId or generate: ${accordionInstanceId}-panel-${itemIndex}
- [ ] T060 [P] [US3] Create panel wrapper element in NfsAccordionItem template with role="region"
- [ ] T061 [P] [US3] Add aria-labelledby on panel wrapper referencing title button ID
- [ ] T062 [US3] Ensure panel wrapper remains in DOM when collapsed (for stable aria-controls reference)
- [ ] T063 [US3] Add inert attribute on panel wrapper when collapsed (prevent keyboard access)
- [ ] T064 [US3] Implement @if conditional rendering for panel content (remove content from DOM when collapsed, keep wrapper)
- [ ] T178 [US3] Implement panelId change handler in NfsAccordionItem: on panelId input change, unregister old ID from parent, re-register new ID, update all ARIA attributes atomically in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts
- [ ] T178b [P] [US3] Add unit test for FR-020b panelId runtime changes: verify re-registration occurs on panelId change, ARIA attributes update atomically, duplicate detection triggers ErrorHandler.handleError(), expansion state unchanged in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.spec.ts
- [ ] T178c [P] [US3] Add unit test for FR-020c panelId/deepLink non-auto-expand: when deepLink=true and panelId changes to match current URL hash, verify item does NOT auto-expand (deep link only responds to URL hash changes, not panelId mutations) in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.spec.ts
- [ ] T186 [US3] Implement empty-state handling in NfsAccordionItem: when no content is projected, render an invisible placeholder comment (no visual output) to ensure stable ARIA structure; empty-state UI is consumer's responsibility via content projection per FR-114a in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts
- [ ] T188 [US3] Implement title change detection in NfsAccordion: track NfsAccordionTitle content changes, publish to live region if announce=true, debounce by 100ms in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
- [ ] T196 [P] [US3] Add `announce = input(false)` InputSignal to NfsAccordion component in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
- [ ] T197 [P] [US3] Render visually-hidden live region element in NfsAccordion template with `aria-live="polite"` and `aria-atomic="true"` (shown only when announce=true) in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
- [ ] T198 [US3] Implement live-region message publishing: on expand/collapse, set live region textContent to concise message, debounce updates by 100ms in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts

**Checkpoint**: Screen reader support complete - ARIA relationships valid, announces correctly

---

## Phase 6: User Story 4 - Multi-Expand Mode (Priority: P2)

**Goal**: Allow multiple panels open simultaneously

**Independent Test**: Render accordion with multiExpand=true, expand multiple items, verify all remain open. Delivers comparison/multi-section viewing.

### Storybook Tests for User Story 4

- [ ] T065 [P] [US4] Create MultiExpand story at packages/ngx-foundation-sites/.storybook/stories/accordion/MultiExpand.story.ts
- [ ] T066 [US4] Add play function: expand item 1, verify item 1 opens
- [ ] T067 [US4] Add play function: expand item 2, verify both item 1 and item 2 remain open
- [ ] T068 [US4] Add play function: collapse item 1, verify item 1 closes and item 2 remains open

### Implementation for User Story 4

- [ ] T069 [US4] Implement multiExpand logic in NfsAccordion.notifyItemToggle(): if multiExpand=true, do not close other items
- [ ] T070 [US4] Add multiExpand input to NfsAccordion (InputSignal<boolean>, default: false)
- [ ] T071 [US4] Update #openItemIds signal to support array of multiple open items
- [ ] T072 [US4] Update state management to track multiple open items when multiExpand=true

**Checkpoint**: Multi-expand mode works - multiple panels can be open simultaneously

---

## Phase 7: User Story 5 - Allow All Closed Mode (Priority: P2)

**Goal**: Configure whether all panels can be closed or require one always open

**Independent Test**: Render accordion with allowAllClosed=false, attempt to close last open item, verify it remains open. Delivers "always one open" constraint.

### Storybook Tests for User Story 5

- [ ] T073 [P] [US5] Create AllowAllClosed story at packages/ngx-foundation-sites/.storybook/stories/accordion/AllowAllClosed.story.ts
- [ ] T074 [US5] Add play function: set allowAllClosed=false, open only item 1, click item 1, verify it remains open
- [ ] T075 [US5] Add play function: set allowAllClosed=false with multiExpand, close all but one item, verify last item cannot close
- [ ] T076 [US5] Add play function: set allowAllClosed=true, close last open item, verify all items collapsed
- [ ] T190 [P] [US5] Add Storybook play test to AllowAllClosed story: programmatically call item.up() when allowAllClosed=false and item is the last open item, verify method returns silently and NO (up) event emitted in packages/ngx-foundation-sites/.storybook/stories/accordion/AllowAllClosed.story.ts
- [ ] T192 [P] [US5] Add Storybook play test to AllowAllClosed story: set allowAllClosed=false, bind [(expanded)] on last open item, set model to false externally, verify binding coerces to true AND ErrorHandler.handleError() called with coercion diagnostic (FR-174a) in packages/ngx-foundation-sites/.storybook/stories/accordion/AllowAllClosed.story.ts

### Implementation for User Story 5

- [ ] T077 [US5] Add allowAllClosed input to NfsAccordion (InputSignal<boolean>, default: false per Foundation spec)
- [ ] T078 [US5] Implement canCloseItem() method in NfsAccordion: returns false if allowAllClosed=false and only one item open
- [ ] T079 [US5] Update NfsAccordionItem.toggle() to check parent.canCloseItem() before collapsing
- [ ] T080 [US5] Add computed signal canClose in NfsAccordionItem: calls parent.canCloseItem(this.panelId())
- [ ] T193 [US5] Implement binding coercion in NfsAccordionItem.expanded: if allowAllClosed=false and change would close last open item, ignore setter and update model to actual state in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts

**Checkpoint**: Allow all closed mode works - can enforce "at least one open" rule

---

## Phase 8: User Story 6 - Disabled Items (Priority: P2)

**Goal**: Disable specific accordion items to prevent interaction

**Independent Test**: Render accordion with item 2 disabled, attempt to click/keyboard activate, verify it doesn't expand. Delivers item-level control.

### Storybook Tests for User Story 6

- [ ] T081 [P] [US6] Create DisabledItems story at packages/ngx-foundation-sites/.storybook/stories/accordion/DisabledItems.story.ts
- [ ] T082 [US6] Add play function: click disabled item title, verify it does not expand
- [ ] T083 [US6] Add play function: press Enter on disabled item, verify it does not expand
- [ ] T084 [US6] Add play function: verify disabled item has aria-disabled="true"
- [ ] T085 [US6] Add play function: ArrowDown from item 1, verify focus skips disabled item 2 to item 3
- [ ] T086 [US6] Add play function: ArrowUp from item 3, verify focus skips disabled item 2 to item 1
- [ ] T189 [P] [US6] Add Storybook play test to DisabledItems story: programmatically call item.down() on disabled item via viewChild, verify method returns immediately and NO (down) event emitted in packages/ngx-foundation-sites/.storybook/stories/accordion/DisabledItems.story.ts

### Implementation for User Story 6

- [ ] T087 [P] [US6] Add disabled input to NfsAccordion (InputSignal<boolean>, default: false, disables all items)
- [ ] T088 [P] [US6] Add disabled input to NfsAccordionItem (InputSignal<boolean>, default: false, disables this item)
- [ ] T089 [US6] Implement additive disabled logic: item disabled if either accordion.disabled OR item.disabled is true
- [ ] T090 [US6] Add softDisabled input to NfsAccordion (InputSignal<boolean>, default: true per ARIA best practices)
- [ ] T091 [US6] Implement soft disabled (softDisabled=true): add aria-disabled="true" to title button, keep in tab order, prevent activation
- [ ] T092 [US6] Implement hard disabled (softDisabled=false): add disabled attribute to title button, remove from tab order
- [ ] T093 [US6] Update keyboard navigation to skip disabled items (ArrowUp/Down)
- [ ] T094 [US6] Add .is-disabled CSS class to NfsAccordionItem when disabled
- [ ] T095 [US6] Prevent toggle() in NfsAccordionItem if disabled=true (early return)
- [ ] T191 [US6] Implement tryAction() guard method in NfsAccordionItem: wrap down(), up(), toggle() implementations with precondition checks; if precondition fails, call ErrorHandler.handleError() and return without emitting output events in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts

**Checkpoint**: Disabled items work - cannot be activated, keyboard navigation skips them

---

## Phase 9: User Story 7 - Initial Open Item Configuration (Priority: P3)

**Goal**: Configure which item(s) are open when component first renders

**Independent Test**: Render accordion with initialOpenIndex=1, verify item at index 1 is expanded on load. Delivers controlled initial state.

### Storybook Tests for User Story 7

- [ ] T096 [P] [US7] Add story variant to Basic story: set expanded=true on item at index 1, verify it's open on initial render
- [ ] T097 [P] [US7] Add story variant to MultiExpand story: set expanded=true on items at indexes 0 and 2, verify both open on render

### Implementation for User Story 7

- [ ] T098 [US7] Document that expanded input (model signal) controls initial state on NfsAccordionItem
- [ ] T099 [US7] Verify expanded input defaults to false per spec
- [ ] T100 [US7] Add example to quickstart.md showing initialOpenIndex pattern: [expanded]="true" on specific item

**Checkpoint**: Initial state configuration works - items can be pre-expanded

---

## Phase 10: User Story 8 - Dynamic Item Management (Priority: P3)

**Goal**: Support adding/removing accordion items dynamically via @for

**Independent Test**: Render accordion with 3 items, add new item, remove item, verify keyboard navigation and IDs update correctly. Delivers dynamic content support.

### Storybook Tests for User Story 8

- [ ] T101 [P] [US8] Create DynamicContent story at packages/ngx-foundation-sites/.storybook/stories/accordion/DynamicContent.story.ts
- [ ] T102 [US8] Add play function: add new item to array, verify it renders with correct ARIA IDs
- [ ] T103 [US8] Add play function: remove item 2, verify remaining items maintain correct aria-controls/aria-labelledby
- [ ] T104 [US8] Add play function: reorder items, verify keyboard navigation follows new DOM order

### Implementation for User Story 8

- [ ] T105 [US8] Verify registerItem() and unregisterItem() handle dynamic items correctly in NfsAccordion
- [ ] T106 [US8] Implement ngOnInit in NfsAccordionItem: call parent.registerItem(this)
- [ ] T107 [US8] Implement ngOnDestroy in NfsAccordionItem: call parent.unregisterItem(this)
- [ ] T108 [US8] Add focus management for removed items: if focused item is removed, move focus to safe location (next/previous item)
- [ ] T109 [US8] Verify ID generation remains unique after add/remove operations
- [ ] T110 [US8] Add example to quickstart.md showing @for with dynamic array

**Checkpoint**: Dynamic content works - items can be added/removed without breaking navigation or ARIA

---

## Phase 11: User Story 9 - SSR Compatibility (Priority: P3)

**Goal**: Render accordion server-side without errors, hydrate correctly on client

**Independent Test**: Render accordion in SSR context, verify no server errors, confirm client hydration activates interactivity. Delivers SSR support.

### Implementation for User Story 9

- [ ] T111 [P] [US9] Inject PLATFORM_ID in NfsAccordion component
- [ ] T112 [P] [US9] Use isPlatformBrowser() guard before accessing window, document, history APIs
- [ ] T113 [US9] Wrap browser-specific code (deep linking) in afterRender() callback
- [ ] T114 [US9] Verify component renders semantic HTML with ARIA attributes during SSR (no client-only logic in template)
- [ ] T115 [US9] Test SSR rendering in an Angular Universal sample application (manual verification)
- [ ] T179 [P] [US9] Add unit test: simulate hydration failure during afterRender() using Angular TestBed with platform mocking, verify component catches exception, reports via ErrorHandler.handleError(), leaves server-rendered HTML intact in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.spec.ts (Note: per constitution V, Playwright reserved for browser-specific APIs only). **Testing strategy exception**: Unit test (not Storybook) is appropriate here because Storybook's jsdom environment cannot simulate real Angular Universal hydration failure scenarios; this is an acceptable exception to the Storybook-primary strategy documented in constitution V.
- [ ] T180 [US9] Implement hydration failure fallback in NfsAccordion: wrap all afterRender and browser-specific code in try/catch, call ErrorHandler.handleError() with metadata on exception in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts

**Checkpoint**: SSR works - component renders server-side and hydrates correctly

---

## Phase 12: User Story 10 - URL Hash Deep Linking (Priority: P4)

**Goal**: Automatically open accordion item matching URL hash

**Independent Test**: Navigate to URL with #accordion-item-2, verify accordion opens item 2 and scrolls to it. Delivers deep linking.

### E2E Tests for User Story 10

> **NOTE: E2E tests required ONLY for History API (browser-specific feature)**

- [ ] T116 [P] [US10] Create E2E test at packages/ngx-foundation-sites-e2e/src/accordion/accordion-deeplink.spec.ts
- [ ] T117 [US10] E2E test: navigate to /page#panel-2, verify accordion item 2 expands automatically
- [ ] T117a [US10] E2E test: navigate to /page#nonexistent-id, verify ErrorHandler.handleError() called with DeepLinkNotFound diagnostic and no panels expand (FR-067b)
- [ ] T117b [US10] E2E test: navigate from #panel-1 to #panel-2 with multiExpand=false, verify panel-1 collapses and panel-2 expands (FR-067c multiExpand interaction)
- [ ] T118 [US10] E2E test: verify browser scrolls to expanded item with correct offset
- [ ] T119 [US10] E2E test: change URL hash, verify new item expands

### Storybook Tests for User Story 10

- [ ] T120 [P] [US10] Create DeepLinking story at packages/ngx-foundation-sites/.storybook/stories/accordion/DeepLinking.story.ts
- [ ] T121 [US10] Add story with deepLink=true, simulate hash change, verify item opens

### Implementation for User Story 10

- [ ] T122 [P] [US10] Add deepLink input to NfsAccordion (InputSignal<boolean>, default: false)
- [ ] T123 [P] [US10] Add deepLinkSmudge input (boolean, default: false)
- [ ] T124 [P] [US10] Add deepLinkSmudgeDelay input (number, default: 300)
- [ ] T125 [P] [US10] Add deepLinkSmudgeOffset input (number, default: 0)
- [ ] T126 [P] [US10] Add updateHistory input (boolean, default: false)
- [ ] T127 [US10] Implement deep linking initialization in afterRender: read location.hash, find matching item, call item.down()
- [ ] T128 [US10] Listen for hashchange events (if deepLink=true), expand matching panel
- [ ] T129 [US10] Update URL hash when panel opens (if deepLink=true): use history.pushState if updateHistory=true, else replaceState
- [ ] T130 [US10] Implement scroll to panel logic (if deepLinkSmudge=true): wait deepLinkSmudgeDelay, scroll with deepLinkSmudgeOffset
- [ ] T131 [US10] Handle duplicate panel IDs: expand first matching panel, report error via ErrorHandler.handleError()
- [ ] T132 [US10] Handle deep linking errors gracefully: report via ErrorHandler, continue component initialization
- [ ] T133 [US10] Inject ErrorHandler service for error reporting per FR-074b (deep linking errors)

**Checkpoint**: Deep linking works - URL hash opens corresponding panel

---

## Phase 13: Foundation API Parity - Events and Methods (Cross-Cutting)

**Goal**: Expose Foundation-equivalent methods and events per API parity requirement

**Independent Test**: Use programmatic methods (down(), up(), toggle()) and listen to events ((down), (up)), verify they match Foundation behavior.

### Storybook Tests for Foundation API Parity

- [ ] T134 [P] [API] Create FoundationApiParity story at packages/ngx-foundation-sites/.storybook/stories/accordion/FoundationApiParity.story.ts
- [ ] T135 [API] Add play function: call item.down(), verify panel opens and (down) event emits
- [ ] T136 [API] Add play function: call item.up(), verify panel closes and (up) event emits
- [ ] T137 [API] Add play function: call item.toggle(), verify panel toggles
- [ ] T138 [API] Add play function: verify (down) event payload includes itemId and expanded=true
- [ ] T139 [API] Add play function: verify (up) event payload includes itemId and expanded=false

### Implementation for Foundation API Parity

- [ ] T140 [P] [API] Implement down() method on NfsAccordionItem: set expanded signal to true (if not disabled)
- [ ] T141 [P] [API] Implement up() method on NfsAccordionItem: set expanded signal to false (if canClose)
- [ ] T142 [P] [API] Implement toggle() method on NfsAccordionItem: flip expanded signal (if allowed)
- [ ] T143 [P] [API] Add down output to NfsAccordion (OutputEmitterRef<AccordionItemChangeEvent>)
- [ ] T144 [P] [API] Add up output to NfsAccordion (OutputEmitterRef<AccordionItemChangeEvent>)
- [ ] T145 [API] Emit down event in NfsAccordion.notifyItemToggle() when expanded=true
- [ ] T146 [API] Emit up event in NfsAccordion.notifyItemToggle() when expanded=false
- [ ] T147 [API] Add JSDoc comments documenting Foundation API equivalents: down() ≈ .down($target), up() ≈ .up($target), toggle() ≈ .toggle($target)
- [ ] T148 [API] Document (down) output ≈ Foundation's down.zf.accordion event, (up) output ≈ up.zf.accordion event

**Checkpoint**: Foundation API parity complete - methods and events match Foundation JS behavior

---

## Phase 14: Lazy Content Loading (Optional Feature)

**Goal**: Support lazy content loading via ng-template[nfsAccordionContent]

**Independent Test**: Render accordion with lazy content directive, verify content only renders on first expand. Delivers performance optimization.

### Storybook Tests for Lazy Content

- [ ] T149 [P] Create LazyContent story at packages/ngx-foundation-sites/.storybook/stories/accordion/LazyContent.story.ts
- [ ] T150 Add play function: verify lazy content template is not rendered initially
- [ ] T151 Add play function: expand item with lazy content, verify template renders
- [ ] T152 Add play function: collapse item, verify content persists in memory (mirrors @defer behavior)

### Implementation for Lazy Content

- [ ] T153 [P] Create NfsAccordionContent directive at packages/ngx-foundation-sites/src/lib/accordion/accordion-content.directive.ts (structural directive, selector: ng-template[nfsAccordionContent])
- [ ] T154 [P] Inject TemplateRef in NfsAccordionContent directive, store as public readonly templateRef
- [ ] T155 Register NfsAccordionContent with parent NfsAccordionItem via DI
- [ ] T156 Implement hasBeenExpanded signal in NfsAccordionItem (tracks if item ever expanded)
- [ ] T157 Update NfsAccordionItem template: @if (lazyContent(); as lazy) { @if (expanded() || hasBeenExpanded()) { render lazy template } }
- [ ] T158 Implement content lifecycle: once rendered, stays in memory until item destroyed (mirrors @defer behavior)
- [ ] T159 Export NfsAccordionContent from public API (index.ts)

**Checkpoint**: Lazy content works - templates render on first expand, persist in memory

---

## Phase 15: Heading Level and Advanced ARIA (Optional Feature)

**Goal**: Support titleHeadingLevel for ARIA document outline and wrap navigation

**Independent Test**: Render accordion with titleHeadingLevel=3, verify buttons wrapped in <div role="heading" aria-level="3">. Test wrap=true for keyboard navigation wraparound.

### Storybook Tests for Advanced ARIA

- [ ] T160 [P] Add story variant to ScreenReader story: set titleHeadingLevel=2, verify heading wrappers present
- [ ] T161 [P] Add story variant to KeyboardNavigation story: set wrap=true, verify ArrowDown on last wraps to first
- [ ] T194 [P] [US15/Advanced] Add Storybook play test to ScreenReader story: change titleHeadingLevel at runtime, verify heading wrapper elements update and focus is preserved on same item in packages/ngx-foundation-sites/.storybook/stories/accordion/ScreenReader.story.ts

### Implementation for Advanced ARIA

- [ ] T162 [P] Add titleHeadingLevel input to NfsAccordion (InputSignal<1|2|3|4|5|6|null>, default: null)
- [ ] T163 [P] Add wrap input to NfsAccordion (InputSignal<boolean>, default: false)
- [ ] T164 Update NfsAccordionTitle template: @if (accordion.titleHeadingLevel()) { <div role="heading" [attr.aria-level]="accordion.titleHeadingLevel()"><button>...</button></div> } @else { <button>...</button> }
- [ ] T165 Update keyboard navigation to support wrap: if wrap=true, ArrowDown on last wraps to first, ArrowUp on first wraps to last
- [ ] T195 [US15/Advanced] Implement heading level dynamic updates in NfsAccordion: on titleHeadingLevel change, track focused item ID, update all heading wrappers in single microtask, restore focus in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts

**Checkpoint**: Advanced ARIA features work - heading levels and keyboard wraparound

---

## Phase 16: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T166 [P] Update README.md at packages/ngx-foundation-sites/src/lib/accordion/README.md with complete usage examples
- [ ] T167 [P] Verify all JSDoc comments are complete and accurate across all components
- [ ] T168 [P] Review code for member visibility patterns: use # for private, protected for template-accessible, public for API
- [ ] T169 Run quickstart.md validation: manually test all examples in quickstart.md
- [ ] T170 [P] Performance testing: verify accordion with 100 items renders within 5 seconds, toggle within 200ms
- [ ] T171 [P] Security review: verify component treats projected content as trusted per SR-001 to SR-004
- [ ] T172 Update main library index.ts at packages/ngx-foundation-sites/src/index.ts to export accordion components
- [ ] T173 [P] Create comprehensive Storybook docs page at packages/ngx-foundation-sites/.storybook/stories/accordion/Accordion.mdx with API reference and Foundation migration guide
- [ ] T174 Run AXE accessibility checks on all Storybook stories, verify 100% pass rate (includes AR-003 color contrast verification: 4.5:1 for normal text, 3:1 for large text)
- [ ] T175 [P] Add Storybook stories with play functions for edge cases: empty accordion (FR-057: render empty container with no focusable elements or broken ARIA), single item, all disabled, ID collision detection in packages/ngx-foundation-sites/.storybook/stories/accordion/EdgeCases.story.ts (Note: per constitution V, prefer Storybook interactive tests over unit tests; unit tests reserved for pure functions/services only)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-12)**: All depend on Foundational phase completion
  - User Stories 1-3 are P1 (critical for MVP) and should be done first
  - User Stories 4-6 are P2 (important features) and can follow
  - User Stories 7-9 are P3 (nice-to-have) and can follow
  - User Story 10 is P4 (advanced feature) and can be last
- **Foundation API Parity (Phase 13)**: Can be done in parallel with or after user stories 1-3 (integrates with existing implementation)
- **Lazy Content (Phase 14)**: Can be done anytime after Phase 3 (extends basic accordion)
- **Advanced ARIA (Phase 15)**: Can be done anytime after Phase 5 (extends screen reader support)
- **Polish (Phase 16)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories (CORE MVP)
- **User Story 2 (P1)**: Can start after Foundational - No dependencies, but integrates with US1 (keyboard for US1's accordion)
- **User Story 3 (P1)**: Can start after Foundational - No dependencies, but adds ARIA to US1/US2 components
- **User Story 4 (P2)**: Depends on US1 complete (extends expansion logic)
- **User Story 5 (P2)**: Depends on US1 complete (extends expansion logic)
- **User Story 6 (P2)**: Depends on US1 and US2 complete (adds disabled state to click and keyboard)
- **User Story 7 (P3)**: Depends on US1 complete (uses existing expanded input)
- **User Story 8 (P3)**: Depends on US1, US2, US3 complete (tests dynamic behavior of core features)
- **User Story 9 (P3)**: Depends on US1 complete (SSR compatibility for basic accordion)
- **User Story 10 (P4)**: Depends on US1 complete (adds deep linking to basic accordion)

### Within Each User Story

- Tests SHOULD be written and SHOULD FAIL before implementation (Storybook test-driven development)
- Models/tokens before components
- Component structure before state management
- State management before ARIA attributes
- Core implementation before integration
- Story complete and independently testable before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- User Stories 1, 2, 3 can start in parallel after Foundational (all P1, no inter-dependencies)
- All Storybook tests within a user story marked [P] can run in parallel
- Component creation tasks within a story marked [P] can run in parallel (different files)
- Different user stories can be worked on in parallel by different team members (if staffed)

---

## Parallel Example: User Story 1

```bash
# Launch all Storybook test tasks for User Story 1 together:
Task T013: "Create basic Storybook story with 3 FAQ items"
Task T017: "Add accessibility checks to Basic story"

# Launch all component creation tasks for User Story 1 together:
Task T018: "Create NfsAccordion component"
Task T019: "Create NfsAccordionItem component"
Task T020: "Create NfsAccordionTitle component"
```

## Additional Remediation Tasks (from cross-artifact analysis)

- [x] T-AC-001 [P?] Implement per-item toggle queue + 50ms debounce and input-source coalescing
- Location: packages/ngx-foundation-sites/src/lib/accordion/
- Description: Implement a per-item FIFO toggle queue that enqueues toggle requests arriving while an item is mid-transition. Coalesce identical toggle requests arriving within 50ms from the same input source. Add timing-sensitive integration tests (Storybook play + Vitest simulation).
- Blocking: YES (prevents race conditions in rapid UI interactions)
- Evidence: `accordion-item-def.ts` updated with `requestToggle()` queue/debounce; `accordion-item-def.spec.ts` simulates rapid toggles

- [ ] T-AC-001b [P?] Add Storybook play test for FR-089a input source distinction
  - Location: packages/ngx-foundation-sites/.storybook/stories/accordion/RapidToggle.story.ts
  - Description: Verify that programmatic toggle (item.toggle()) does NOT coalesce with keyboard toggle (Enter key) within 50ms debounce window—both should execute in order since they originate from different input sources (programmatic vs keyboard). Add play function simulating: keyboard Enter on item, then immediate programmatic toggle() call within 10ms, verify both actions execute sequentially.
  - Acceptance: Play test confirms two distinct state changes occur (not coalesced) when input sources differ. Per FR-089a testing tolerance, timing assertions MUST allow ±10ms variance for JavaScript event loop variability; use mock timers (`vi.useFakeTimers()`) for precise timing validation.

- [ ] T-AC-002 _(meta-task)_ `announce` live-region opt-in — **resolved by T196-T199**
  - Location: packages/ngx-foundation-sites/src/lib/accordion/
  - Description: Add `announce = input(false)` and render a visually-hidden live region with `aria-live="polite"` when enabled. Debounce announcements by 100ms. Add Storybook play tests asserting live region updates on expand/collapse and title updates.
  - **Status**: This remediation task is tracked via Phase 5 (US3) implementation tasks. No separate work item.
  - **Cross-Reference**: T196 (input signal), T197 (live region element), T198 (message publishing), T199 (Storybook test)

- [x] T-AC-003 [P?] Input validators & tests for FR-110a
- Location: packages/ngx-foundation-sites/src/lib/accordion/
- Description: Implement input sanitizers/coercers and `ErrorHandler.handleError()` diagnostics per FR-110a. Add unit tests for invalid/edge inputs and ensure bound models reflect coerced values.
- Evidence: `validators.ts` added; `validators.spec.ts` covers edge cases; `accordion.ts` applies sanitization in constructor

- [x] T-AC-004 [P?] Harmonize ID generator filename and task references
  - Location: packages/ngx-foundation-sites/src/lib/accordion/accordion-id-generator.service.ts
  - Description: Update plan/tasks/spec references to use canonical filename `accordion-id-generator.service.ts` and exported symbol `NfsAccordionIdGeneratorService`. Update any references in plan.md/spec.md/tasks.md.

---

## Parallel Example: P1 User Stories (After Foundational)

```bash
# Three developers can work simultaneously on P1 stories:
Developer A: User Story 1 (Basic accordion interaction)
Developer B: User Story 2 (Keyboard navigation)
Developer C: User Story 3 (Screen reader ARIA)

# They integrate naturally because:
- US1 builds accordion structure
- US2 adds keyboard to US1's components
- US3 adds ARIA to US1's components
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (basic accordion)
4. Complete Phase 4: User Story 2 (keyboard navigation)
5. Complete Phase 5: User Story 3 (screen reader ARIA)
6. **STOP and VALIDATE**: Test all three P1 stories together - this is a complete, production-ready accessible accordion
7. Deploy/demo if ready

**Rationale**: User Stories 1-3 are all P1 (WCAG AA required) and form the minimum viable accessible accordion. This is the smallest shippable increment.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Stories 1+2+3 (P1) → Test together → Deploy/Demo (MVP: accessible accordion!)
3. Add User Story 4 (P2: multi-expand) → Test independently → Deploy/Demo
4. Add User Story 5 (P2: allow all closed) → Test independently → Deploy/Demo
5. Add User Story 6 (P2: disabled items) → Test independently → Deploy/Demo
6. Add User Stories 7-10 (P3/P4) as needed → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (basic accordion)
   - Developer B: User Story 2 (keyboard navigation)
   - Developer C: User Story 3 (screen reader ARIA)
3. P1 stories complete and integrate → MVP ready
4. Team adds P2 stories (4, 5, 6) in parallel or sequence
5. Team adds P3/P4 stories (7-10) as needed

---

## Summary

**Total Tasks**: 212 tasks across 16 phases
**MVP Scope**: Phases 1-5 (User Stories 1-3, P1) = ~75 tasks = ~35% of total
**Task Breakdown by User Story**:

- US1 (Basic Accordion): 21 tasks (includes T183, T184 for interactive title content)
- US2 (Keyboard Navigation): 21 tasks (includes T181, T182, T182b for concurrent interaction handling)
- US3 (Screen Reader): 30 tasks (includes T057c, T176-T178c, T185-T188, T196-T199 for ARIA, announce, panelId handling)
- US4 (Multi-Expand): 8 tasks
- US5 (Allow All Closed): 10 tasks (includes T190, T192, T193 for method failure and binding coercion)
- US6 (Disabled Items): 16 tasks (includes T189, T191 for method failure handling)
- US7 (Initial State): 5 tasks
- US8 (Dynamic Items): 10 tasks
- US9 (SSR): 7 tasks (includes T179, T180 for hydration fallback)
- US10 (Deep Linking): 22 tasks (includes T117a, T117b for ErrorHandler and multiExpand E2E tests)
- Advanced ARIA (Phase 15): 6 tasks (includes T194, T195 for heading level updates)
- Remediation: 5 tasks (T-AC-001 done, T-AC-001b pending, T-AC-002 meta-task→T196-T199, T-AC-003 done, T-AC-004 done)

**Parallel Opportunities**: 74 tasks marked [P] can run in parallel (~35% of total)
**Independent Test Criteria**: Each user story has clear independent test criteria and can be validated separately

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (e.g., [US1], [US2]) maps task to specific user story for traceability
- [API] label = Foundation API parity tasks (Phase 13) that are cross-cutting and don't belong to a single user story
- Each user story should be independently completable and testable
- Storybook tests are PRIMARY testing strategy per spec.md (write these FIRST with play functions)
- E2E tests ONLY for History API (User Story 10 deep linking)
- Verify Storybook tests fail before implementing features (test-driven development)
- Commit after each task or logical group of tasks
- Stop at any checkpoint to validate story independently
- MVP = User Stories 1-3 (P1) = fully accessible accordion component
- Foundation API parity (Phase 13) is cross-cutting and integrates with multiple stories
- Lazy content (Phase 14) and advanced ARIA (Phase 15) are optional extensions
- All 10 user stories delivered = complete feature per spec.md
