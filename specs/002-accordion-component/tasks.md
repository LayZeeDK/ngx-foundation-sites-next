---
description: 'Actionable task list for Accessible Accordion Component implementation'
---

# Tasks: Accessible Accordion Component

**Input**: Design documents from `/specs/002-accordion-component/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL - only included in tasks if explicitly requested. The spec does request Storybook play functions as the primary testing approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for accordion component

- [ ] T001 Verify Foundation for Sites CSS is available in packages/ngx-foundation-sites/dist-css/
- [ ] T002 [P] Create accordion directory structure in packages/ngx-foundation-sites/src/lib/accordion/
- [ ] T003 [P] Set up component selector prefix verification (nfs- for components, nfs for directives)
- [ ] T004 [P] Create index.ts barrel file in packages/ngx-foundation-sites/src/lib/accordion/index.ts for public API exports
- [ ] T005 [P] Update main index.ts at packages/ngx-foundation-sites/src/index.ts to re-export accordion components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create injection token in packages/ngx-foundation-sites/src/lib/accordion/accordion.token.ts (export const nfsAccordionToken with CDK-style pattern)
- [ ] T007 [P] Create TypeScript type definitions in packages/ngx-foundation-sites/src/lib/accordion/accordion.types.ts (AccordionHeadingLevel, AccordionItemChangeEvent, ACCORDION_DEFAULTS)
- [ ] T008 [P] Verify @angular/cdk/a11y is available for FocusMonitor and accessibility utilities
- [ ] T009 [P] Create base accordion component structure with standalone config in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts (skeleton with inputs/outputs signatures)
- [ ] T010 [P] Create accordion item component structure with standalone config in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts (skeleton with inputs/outputs)
- [ ] T011 [P] Create accordion title component structure with standalone config in packages/ngx-foundation-sites/src/lib/accordion/accordion-title.component.ts (skeleton)
- [ ] T012 [P] Create accordion content directive structure in packages/ngx-foundation-sites/src/lib/accordion/accordion-content.directive.ts (structural directive skeleton)
- [ ] T013 Create base Storybook story in packages/ngx-foundation-sites/src/storybook/accordion/accordion.stories.ts with Foundation CSS imports
- [ ] T014 [P] Add README.md in packages/ngx-foundation-sites/src/lib/accordion/README.md documenting Foundation API parity (toggle, down, up methods and events)
- [ ] T015 Configure TypeScript strict mode compliance for all accordion files in tsconfig.lib.json
- [ ] T015b Verify Foundation API parity matches contracts/accordion-api.ts FOUNDATION_API_MAPPING (toggle/down/up methods + down/up events)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Single Accordion Interaction (Priority: P1) 🎯 MVP

**Goal**: Single-expand mode where clicking a title expands/collapses panels, only one panel open at a time

**Independent Test**: Render accordion with 3 items, click titles to expand/collapse, verify only one panel open at a time and correct Foundation CSS classes applied

### Tests for User Story 1

> **NOTE: Storybook interactive tests are PREFERRED per spec.**

- [ ] T016 [P] [US1] Create Storybook play function for basic click interactions in packages/ngx-foundation-sites/src/storybook/accordion/Basic.story.ts
- [ ] T017 [P] [US1] Create Storybook play function for single-expand mode validation (only one open) in packages/ngx-foundation-sites/src/storybook/accordion/Basic.story.ts
- [ ] T018 [P] [US1] Create Storybook play function for Foundation CSS class verification (.accordion, .accordion-item, .accordion-title, .accordion-content, .is-active) in packages/ngx-foundation-sites/src/storybook/accordion/Basic.story.ts

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implement NfsAccordion component in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts with multiExpand and allowAllClosed inputs using input() function
- [ ] T020 [P] [US1] Create NfsAccordion template in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.html with <ul class="accordion"> structure and ng-content for items
- [ ] T021 [P] [US1] Implement NfsAccordionItem component in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts with panelId, expanded (model), and disabled inputs
- [ ] T022 [P] [US1] Create NfsAccordionItem template in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.html with <li class="accordion-item"> and stable panel wrapper
- [ ] T023 [US1] Implement parent-child DI communication in NfsAccordionItem (inject nfsAccordionToken with optional: true, skipSelf: true)
- [ ] T024 [US1] Implement state management signals in NfsAccordion (#openItemIds WritableSignal, computed for allClosed, canCloseItem)
- [ ] T025 [US1] Implement state management signals in NfsAccordionItem (expanded ModelSignal, computed for shouldRenderContent, ariaExpanded)
- [ ] T026 [US1] Implement registerItem/unregisterItem/notifyItemToggle methods in NfsAccordion for parent-child coordination
- [ ] T027 [US1] Implement single-expand logic in NfsAccordion (when multiExpand=false, close others when one opens)
- [ ] T028 [US1] Implement allowAllClosed enforcement in NfsAccordion (prevent closing last item when allowAllClosed=false)
- [ ] T029 [US1] Implement Foundation API parity methods in NfsAccordionItem (down(), up(), toggle())
- [ ] T030 [US1] Implement Foundation API parity outputs in NfsAccordion using output() function (down, up events with AccordionItemChangeEvent payload { itemId, expanded } per contracts/accordion-api.ts)
- [ ] T031 [US1] Add CSS class bindings to NfsAccordionItem host ([class.is-active]="expanded()")
- [ ] T032 [US1] Implement stable panel wrapper that stays in DOM, with @if conditional rendering inside it (render content only when expanded; wrapper remains stable for ARIA/SSR)
- [ ] T033 [US1] Add ChangeDetectionStrategy.OnPush to all accordion components
- [ ] T034 [US1] Add JSDoc comments documenting Foundation equivalents in all components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Keyboard Navigation and Focus Management (Priority: P1)

**Goal**: Keyboard-only navigation using Tab, arrow keys, Enter, Space, Home, End to expand/collapse without mouse

**Independent Test**: Use only keyboard (Tab to first title, ArrowDown/Up to move between titles, Enter/Space to toggle, Home/End to jump)

### Tests for User Story 2

- [ ] T035 [P] [US2] Create Storybook play function for Tab key navigation in packages/ngx-foundation-sites/src/storybook/accordion/KeyboardNavigation.story.ts
- [ ] T036 [P] [US2] Create Storybook play function for ArrowDown/ArrowUp navigation in packages/ngx-foundation-sites/src/storybook/accordion/KeyboardNavigation.story.ts
- [ ] T037 [P] [US2] Create Storybook play function for Home/End key navigation in packages/ngx-foundation-sites/src/storybook/accordion/KeyboardNavigation.story.ts
- [ ] T038 [P] [US2] Create Storybook play function for Enter/Space toggle in packages/ngx-foundation-sites/src/storybook/accordion/KeyboardNavigation.story.ts

### Implementation for User Story 2

- [ ] T039 [P] [US2] Implement NfsAccordionTitle component in packages/ngx-foundation-sites/src/lib/accordion/accordion-title.component.ts with focus/blur methods
- [ ] T040 [P] [US2] Create NfsAccordionTitle template in packages/ngx-foundation-sites/src/lib/accordion/accordion-title.component.html with <button class="accordion-title"> and click handler
- [ ] T041 [US2] Implement keyboard event handler in NfsAccordion component (host: {'(keydown)': 'handleKeydown($event)'})
- [ ] T042 [US2] Implement arrow key navigation logic in NfsAccordion (focusNextItem, focusPreviousItem methods)
- [ ] T043 [US2] Implement Home/End key navigation logic in NfsAccordion (focusFirstItem, focusLastItem methods)
- [ ] T044 [US2] Implement wrap input support in NfsAccordion (wraparound navigation when wrap=true)
- [ ] T045 [US2] Implement click handler in NfsAccordionTitle that calls parent item's toggle() method
- [ ] T046 [US2] Add Enter/Space key handling to NfsAccordionTitle button element
- [ ] T047 [US2] Import and use FocusMonitor from @angular/cdk/a11y for focus management in NfsAccordionTitle
- [ ] T048 [US2] Implement focus tracking signal in NfsAccordionTitle (#focused WritableSignal)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Screen Reader Compatibility (Priority: P1)

**Goal**: Screen reader users understand accordion structure, state (expanded/collapsed), and relationships between titles and content

**Independent Test**: Test with NVDA/JAWS/VoiceOver by navigating accordion and verifying announcements include role, state, and content

### Tests for User Story 3

- [ ] T049 [P] [US3] Create Storybook play function with AXE accessibility checks in packages/ngx-foundation-sites/src/storybook/accordion/ScreenReader.story.ts
- [ ] T050 [P] [US3] Create Storybook story documenting ARIA attributes for manual screen reader testing in packages/ngx-foundation-sites/src/storybook/accordion/ScreenReader.story.ts

### Implementation for User Story 3

- [ ] T051 [P] [US3] Implement ID generation strategy in NfsAccordion (static counter + instanceId)
- [ ] T052 [P] [US3] Generate unique trigger IDs and panel IDs in NfsAccordionItem (triggerId, panelId computed signals)
- [ ] T052b [US3] Verify auto-generated IDs are unique across multiple accordions rendered on the same page (no collisions)
- [ ] T053 [US3] Add ARIA attributes to NfsAccordionTitle button (aria-expanded, aria-controls, id)
- [ ] T054 [US3] Add ARIA attributes to panel wrapper in NfsAccordionItem (role="region", aria-labelledby, id)
- [ ] T055 [US3] Implement inert attribute binding on panel wrapper when collapsed ([attr.inert]="expanded() ? null : ''")
- [ ] T056 [US3] Implement titleHeadingLevel support in NfsAccordion (input and provide to children via DI)
- [ ] T057 [US3] Wrap NfsAccordionTitle button in <div role="heading" aria-level="N"> when titleHeadingLevel is set
- [ ] T058 [US3] Verify ARIA relationships in computed signals (ariaControls, ariaExpanded, ariaDisabled)

**Checkpoint**: All P1 user stories should now be independently functional with full accessibility

---

## Phase 6: User Story 4 - Multi-Expand Mode (Priority: P2)

**Goal**: Allow multiple panels to be open simultaneously (Foundation's data-multi-expand behavior)

**Independent Test**: Render accordion with multiExpand="true", expand multiple items, verify all remain open

### Tests for User Story 4

- [ ] T059 [P] [US4] Create Storybook play function for multi-expand mode in packages/ngx-foundation-sites/src/storybook/accordion/MultiExpand.story.ts
- [ ] T060 [P] [US4] Create Storybook play function verifying multiple open panels in packages/ngx-foundation-sites/src/storybook/accordion/MultiExpand.story.ts

### Implementation for User Story 4

- [ ] T061 [US4] Implement multiExpand input handling in NfsAccordion (update notifyItemToggle to skip closing others when multiExpand=true)
- [ ] T062 [US4] Update state management in NfsAccordion to track multiple open items in #openItemIds array
- [ ] T063 [US4] Verify multiExpand interacts correctly with allowAllClosed logic

**Checkpoint**: User Story 4 complete - multi-expand mode functional

---

## Phase 7: User Story 5 - Allow All Closed Mode (Priority: P2)

**Goal**: Configure whether all panels can be closed simultaneously or require at least one open

**Independent Test**: Render accordion with allowAllClosed="false", attempt to close last open item, verify it remains open

### Tests for User Story 5

- [ ] T064 [P] [US5] Create Storybook play function for allowAllClosed=false in packages/ngx-foundation-sites/src/storybook/accordion/AllowAllClosed.story.ts
- [ ] T065 [P] [US5] Create Storybook play function verifying last item cannot close when allowAllClosed=false in packages/ngx-foundation-sites/src/storybook/accordion/AllowAllClosed.story.ts

### Implementation for User Story 5

- [ ] T066 [US5] Implement allowAllClosed input handling in NfsAccordion
- [ ] T067 [US5] Implement canCloseItem method in NfsAccordion (check if closing would violate allowAllClosed=false)
- [ ] T068 [US5] Update NfsAccordionItem toggle logic to check parent's canCloseItem before closing
- [ ] T069 [US5] Verify allowAllClosed output events do not fire when action is prevented

**Checkpoint**: User Story 5 complete - allowAllClosed constraint enforced

---

## Phase 8: User Story 6 - Disabled Items (Priority: P2)

**Goal**: Mark specific accordion items as disabled to prevent interaction

**Independent Test**: Render accordion with item 2 disabled, attempt to click/keyboard activate, verify it doesn't expand and is skipped in keyboard navigation

### Tests for User Story 6

- [ ] T070 [P] [US6] Create Storybook play function for disabled item click prevention in packages/ngx-foundation-sites/src/storybook/accordion/DisabledItems.story.ts
- [ ] T071 [P] [US6] Create Storybook play function for keyboard navigation skipping disabled items in packages/ngx-foundation-sites/src/storybook/accordion/DisabledItems.story.ts

### Implementation for User Story 6

- [ ] T072 [P] [US6] Implement disabled input handling in NfsAccordionItem (prevent toggle when disabled=true)
- [ ] T073 [P] [US6] Implement softDisabled input handling in NfsAccordion (provide to children via DI)
- [ ] T074 [US6] Add disabled check in NfsAccordionItem toggle method (early return if disabled)
- [ ] T075 [US6] Update keyboard navigation in NfsAccordion to skip disabled items (filter enabled items only)
- [ ] T076 [US6] Add aria-disabled attribute binding to NfsAccordionTitle when softDisabled=true ([attr.aria-disabled]="disabled() || null")
- [ ] T077 [US6] Add disabled attribute binding to NfsAccordionTitle button when softDisabled=false ([attr.disabled]="disabled() || null")
- [ ] T078 [US6] Add .is-disabled CSS class binding to NfsAccordionItem host ([class.is-disabled]="disabled()")

**Checkpoint**: User Story 6 complete - disabled items functional

---

## Phase 9: User Story 7 - Initial Open Item Configuration (Priority: P3)

**Goal**: Configure which accordion item(s) should be open when component first renders

**Independent Test**: Render accordion with initialOpenIndex="1", verify item at index 1 is expanded on load

### Tests for User Story 7

- [ ] T079 [P] [US7] Create Storybook play function for initial expanded state in packages/ngx-foundation-sites/src/storybook/accordion/InitialState.story.ts
- [ ] T080 [P] [US7] Create Storybook play function for multiple initial expanded items (multiExpand mode) in packages/ngx-foundation-sites/src/storybook/accordion/InitialState.story.ts

### Implementation for User Story 7

- [ ] T081 [US7] Implement initial expanded state handling in NfsAccordionItem (use expanded input default value)
- [ ] T082 [US7] Verify expanded model signal supports setting initial value from parent template ([expanded]="true")
- [ ] T083 [US7] Document initial state configuration in README.md with examples

**Checkpoint**: User Story 7 complete - initial state configuration works

---

## Phase 10: User Story 8 - Dynamic Item Management (Priority: P3)

**Goal**: Support dynamically added/removed accordion items via @for without breaking keyboard navigation or ARIA

**Independent Test**: Render accordion with 3 items, add a new item, remove an item, verify keyboard navigation and IDs update correctly

### Tests for User Story 8

- [ ] T084 [P] [US8] Create Storybook play function for adding items dynamically in packages/ngx-foundation-sites/src/storybook/accordion/DynamicContent.story.ts
- [ ] T085 [P] [US8] Create Storybook play function for removing items dynamically in packages/ngx-foundation-sites/src/storybook/accordion/DynamicContent.story.ts
- [ ] T086 [P] [US8] Create Storybook play function verifying ARIA relationships after item changes in packages/ngx-foundation-sites/src/storybook/accordion/DynamicContent.story.ts

### Implementation for User Story 8

- [ ] T087 [US8] Verify registerItem/unregisterItem lifecycle works with dynamic items
- [ ] T088 [US8] Implement focus management when focused item is removed (move focus to safe location)
- [ ] T089 [US8] Test dynamic item management with large item count (100 items per spec)
- [ ] T090 [US8] Document dynamic item patterns in README.md

**Checkpoint**: User Story 8 complete - dynamic items fully supported

---

## Phase 11: User Story 9 - SSR Compatibility (Priority: P3)

**Goal**: Component renders server-side (Angular Universal/SSR) without errors and hydrates correctly on client

**Independent Test**: Render accordion in SSR context, verify no server-side errors, confirm client-side hydration activates interactivity

### Tests for User Story 9

- [ ] T091 [P] [US9] Create E2E test for SSR rendering in packages/ngx-foundation-sites-e2e/src/accordion-ssr.spec.ts
- [ ] T092 [P] [US9] Verify SSR-rendered HTML includes correct semantic structure and ARIA attributes

### Implementation for User Story 9

- [ ] T093 [US9] Add PLATFORM_ID injection to NfsAccordion component
- [ ] T094 [US9] Wrap browser-only code (deep linking) in isPlatformBrowser checks
- [ ] T095 [US9] Use afterRender hook for browser-specific initialization
- [ ] T096 [US9] Verify no direct window/document references during initialization
- [ ] T097 [US9] Test component in SSR mode (Angular Universal build)

**Checkpoint**: User Story 9 complete - SSR compatibility verified

---

## Phase 12: User Story 10 - URL Hash Deep Linking (Priority: P4)

**Goal**: Navigate to URL with hash (#accordion-item-2) and accordion automatically opens matching item

**Independent Test**: Navigate to URL with #accordion-item-2, verify accordion opens item 2 and scrolls to it

### Tests for User Story 10

- [ ] T098 [P] [US10] Create E2E test for URL hash navigation in packages/ngx-foundation-sites-e2e/src/accordion-deeplink.spec.ts (History API requires E2E)
- [ ] T099 [P] [US10] Create E2E test for deepLinkSmudge scroll behavior in packages/ngx-foundation-sites-e2e/src/accordion-deeplink.spec.ts
- [ ] T100 [P] [US10] Create Storybook story documenting deep linking in packages/ngx-foundation-sites/src/storybook/accordion/DeepLinking.story.ts

### Implementation for User Story 10

- [ ] T101 [P] [US10] Implement deepLink input handling in NfsAccordion
- [ ] T102 [P] [US10] Implement deepLinkSmudge input handling in NfsAccordion
- [ ] T103 [P] [US10] Implement deepLinkSmudgeDelay input handling in NfsAccordion
- [ ] T104 [P] [US10] Implement deepLinkSmudgeOffset input handling in NfsAccordion
- [ ] T105 [P] [US10] Implement updateHistory input handling in NfsAccordion
- [ ] T106 [US10] Implement URL hash listener in NfsAccordion (afterRender hook + location.hash)
- [ ] T107 [US10] Implement hash change handler (find item by panelId, expand)
- [ ] T108 [US10] Implement scroll-to-panel logic with delay and offset
- [ ] T109 [US10] Implement URL hash update when panel opens (pushState vs replaceState based on updateHistory)
- [ ] T110 [US10] Wrap all deep linking code in isPlatformBrowser checks for SSR compatibility

**Checkpoint**: User Story 10 complete - deep linking functional

---

## Phase 13: Lazy Content Loading (Enhancement)

**Goal**: Support ng-template[nfsAccordionContent] directive for lazy rendering of expensive content

**Independent Test**: Render accordion with lazy content template, verify content only rendered when first opened

### Tests for Lazy Content

- [ ] T111 [P] Create Storybook play function for lazy content initialization in packages/ngx-foundation-sites/src/storybook/accordion/LazyContent.story.ts
- [ ] T112 [P] Create Storybook play function to verify lazy content persists after first expansion (not destroyed on collapse)

### Implementation for Lazy Content

- [ ] T113 [P] Implement NfsAccordionContentDirective in packages/ngx-foundation-sites/src/lib/accordion/accordion-content.directive.ts
- [ ] T114 Implement templateRef property in NfsAccordionContentDirective (TemplateRef<void>)
- [ ] T115 Register NfsAccordionContentDirective with parent NfsAccordionItem via DI
- [ ] T116 Implement hasBeenExpanded tracking signal in NfsAccordionItem so lazy content renders on first expansion and remains available on subsequent collapses (spec FR-027)
- [ ] T117 Update NfsAccordionItem template to support both eager (ng-content) and lazy (ng-template) content
- [ ] T118 Implement NgTemplateOutlet rendering in NfsAccordionItem for lazy content
- [ ] T119 Document lazy content pattern in README.md

**Checkpoint**: Lazy content loading functional

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T120 [P] Update packages/ngx-foundation-sites/src/lib/accordion/README.md with complete usage examples
- [ ] T121 [P] Add Foundation API parity mapping table to README.md (methods: toggle/down/up, events: down/up)
- [ ] T122 [P] Document migration guide from Foundation JS to Angular in README.md
- [ ] T123 [P] Verify all components have complete JSDoc comments
- [ ] T124 [P] Export all accordion components from packages/ngx-foundation-sites/src/lib/accordion/index.ts
- [ ] T125 [P] Verify all accordion exports in packages/ngx-foundation-sites/src/index.ts
- [ ] T126 Run all Storybook interactive tests via test-storybook target
- [ ] T127 [P] Verify AXE accessibility checks pass on all stories
- [ ] T128 [P] Perform manual screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] T129 [P] Performance test with 100 items (spec requirement)
- [ ] T130 Validate quickstart.md examples are accurate
- [ ] T131 [P] Add API documentation to Compodoc
- [ ] T132 Code cleanup and refactoring for consistency
- [ ] T133 Final review against spec.md requirements (FR-001 through CA-011)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1-3 (Phase 3-5)**: All P1 stories depend on Foundational phase completion, can proceed in parallel
- **User Story 4-6 (Phase 6-8)**: All P2 stories depend on Foundational phase completion, can proceed in parallel (independent of P1 stories)
- **User Story 7-9 (Phase 9-11)**: All P3 stories depend on Foundational phase completion, can proceed in parallel (independent of P1/P2 stories)
- **User Story 10 (Phase 12)**: P4 story depends on Foundational phase completion and US9 (SSR) for isPlatformBrowser pattern
- **Lazy Content (Phase 13)**: Enhancement, can proceed after Foundational phase completion
- **Polish (Phase 14)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 (needs NfsAccordionTitle integration with NfsAccordionItem)
- **User Story 3 (P1)**: Depends on US1 and US2 (needs components with keyboard navigation for ARIA)
- **User Story 4 (P2)**: Can start after Foundational - Independent of other stories (extends US1 logic)
- **User Story 5 (P2)**: Can start after Foundational - Independent of other stories (extends US1 logic)
- **User Story 6 (P2)**: Depends on US2 (needs keyboard navigation to skip disabled items)
- **User Story 7 (P3)**: Can start after Foundational - Independent of other stories (uses existing expanded input)
- **User Story 8 (P3)**: Depends on US1-US3 (needs full component functionality to test dynamic changes)
- **User Story 9 (P3)**: Can start after Foundational - Independent of other stories (SSR compatibility checks)
- **User Story 10 (P4)**: Depends on US1 and US9 (needs basic functionality + SSR pattern for browser checks)

### Within Each User Story

- Tests (Storybook play functions) SHOULD be written FIRST and FAIL before implementation (TDD approach)
- Components before templates
- State management signals before event handlers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Within Setup (Phase 1)**: T002, T003, T004, T005 can run in parallel

**Within Foundational (Phase 2)**: T007, T008, T009, T010, T011, T012, T014 can run in parallel

**After Foundational Complete**:
- US1 Tests: T016, T017, T018 in parallel
- US1 Implementation: T019, T020, T021, T022 in parallel (separate files)
- US2 Tests: T035, T036, T037, T038 in parallel
- US2 Implementation: T039, T040 in parallel
- US3 Tests: T049, T050 in parallel
- US3 Implementation: T051, T052 in parallel
- US4 Tests: T059, T060 in parallel
- US5 Tests: T064, T065 in parallel
- US6 Tests: T070, T071 in parallel
- US6 Implementation: T072, T073 in parallel
- US7 Tests: T079, T080 in parallel
- US8 Tests: T084, T085, T086 in parallel
- US9 Tests: T091, T092 in parallel
- US10 Tests: T098, T099, T100 in parallel
- US10 Implementation: T101, T102, T103, T104, T105 in parallel
- Lazy Content Tests: T111, T112 in parallel
- Lazy Content Implementation: T113 in parallel
- Polish: T120, T121, T122, T123, T124, T125, T127, T128, T129, T131 in parallel

**Parallel User Stories**: After Foundational is complete:
- Developer A: US1 → US2 → US3 (P1 stories in sequence)
- Developer B: US4 → US5 (P2 stories)
- Developer C: US6 → US7 (P2/P3 stories)
- Developer D: US8 → US9 (P3 stories)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T016: "Create Storybook play function for basic click interactions"
Task T017: "Create Storybook play function for single-expand mode validation"
Task T018: "Create Storybook play function for Foundation CSS class verification"

# Launch component structure tasks together:
Task T019: "Implement NfsAccordion component"
Task T020: "Create NfsAccordion template"
Task T021: "Implement NfsAccordionItem component"
Task T022: "Create NfsAccordionItem template"

# Then sequential tasks for integration:
Task T023: "Implement parent-child DI communication"
Task T024: "Implement state management signals in NfsAccordion"
Task T025: "Implement state management signals in NfsAccordionItem"
# ... and so on
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only - All P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Basic interaction)
4. Complete Phase 4: User Story 2 (Keyboard navigation)
5. Complete Phase 5: User Story 3 (Screen reader support)
6. **STOP and VALIDATE**: Test P1 stories independently - this is a production-ready accordion
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Basic accordion works
3. Add User Story 2 → Test independently → Keyboard navigation works
4. Add User Story 3 → Test independently → Accessible accordion (MVP!) → Deploy/Demo
5. Add User Story 4 → Test independently → Multi-expand mode → Deploy/Demo
6. Add User Story 5 → Test independently → Always-one-open constraint → Deploy/Demo
7. Add User Story 6 → Test independently → Disabled items → Deploy/Demo
8. Continue with P3/P4 stories as needed

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 → User Story 2 → User Story 3 (P1 sequence)
   - Developer B: User Story 4 → User Story 5 (P2 features)
   - Developer C: User Story 6 → User Story 7 (P2/P3 features)
   - Developer D: User Story 8 → User Story 9 (P3 features)
3. Stories complete and integrate independently
4. Final team effort on Phase 14: Polish

---

## Notes

- [P] tasks = different files, no dependencies on other tasks completing first
- [Story] label maps task to specific user story from spec.md for traceability
- Each user story should be independently completable and testable
- Storybook play functions are the PRIMARY testing mechanism (per spec)
- E2E tests ONLY for History API (deep linking) - avoid for other features
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Foundation API parity is MANDATORY: methods (toggle, down, up) and events (down, up)
- US1-US3 (all P1) form the MVP - fully accessible, keyboard-navigable accordion
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Summary

- **Total Tasks**: 133 tasks
- **Task Count by User Story**:
  - Setup: 5 tasks
  - Foundational: 10 tasks (BLOCKS all stories)
  - US1 (P1): 20 tasks
  - US2 (P1): 14 tasks
  - US3 (P1): 10 tasks
  - US4 (P2): 5 tasks
  - US5 (P2): 6 tasks
  - US6 (P2): 9 tasks
  - US7 (P3): 5 tasks
  - US8 (P3): 7 tasks
  - US9 (P3): 7 tasks
  - US10 (P4): 13 tasks
  - Lazy Content: 9 tasks
  - Polish: 14 tasks

- **Parallel Opportunities**: 47 tasks marked [P] can run in parallel within their phases
- **Independent Test Criteria**: Each user story has clear Storybook play function tests
- **Suggested MVP Scope**: User Stories 1-3 (all P1) = 44 implementation tasks for fully accessible accordion
- **Format Validation**: ✅ ALL tasks follow checklist format (checkbox, ID, labels, file paths)

**Implementation Path**: Setup (5) → Foundational (10) → US1 (20) → US2 (14) → US3 (10) = 59 tasks for production-ready MVP
