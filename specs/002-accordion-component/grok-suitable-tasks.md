# Grok-Suitable Tasks: Accessible Accordion Component

**Generated**: 2026-01-12
**Source**: tasks.md (212 tasks)
**Target Model**: Grok Code Fast 1 (256K context, 0x cost in GitHub Copilot)

**Optimization Strategy**: Fast agentic execution with iterative refinement

---

## Task Summary

- **Total Tasks in tasks.md**: 212
- **Grok-Suitable (HIGH ≥75%)**: 89 (42%)
- **Grok-Suitable (MEDIUM 50-74%)**: 58 (27%)
- **Sonnet-Recommended (LOW <50%)**: 65 (31%)

**Estimated Performance**:

- **Speed**: 4× faster than other agentic models
- **Cost**: 0x in GitHub Copilot (free!)
- **Quality**: 70.8% SWE-bench (90%+ for suitable tasks)

---

## P0 BLOCKING Tasks - ✅ RESOLVED

**Status**: All P0 gaps have been resolved as of 2026-01-12.

- [x] ~~T021~~ - `multiExpandable` renamed to `multiExpand` ✅
- [x] ~~T140-T142~~ - `down()`, `up()`, `toggle()` methods implemented ✅
- [x] ~~T143-T144~~ - `(down)`, `(up)` outputs implemented ✅

---

## Phase 1: Setup - HIGH 90%

**All 5 tasks are Grok-suitable verification tasks**

- [x] T001 [Pattern: Verification] Verify Nx library structure exists at packages/ngx-foundation-sites/
  - **Score**: 95% | **Time**: 1 min | **Strategy**: ls directory → confirm structure

- [x] T002 [Pattern: Verification] Verify ng-packagr config in packages/ngx-foundation-sites/ng-package.json
  - **Score**: 95% | **Time**: 1 min | **Strategy**: Read file → verify fields

- [x] T003 [P] [Pattern: Verification] Verify component selector prefix is `nfs-`
  - **Score**: 95% | **Time**: 1 min | **Strategy**: Read project.json → check prefix

- [x] T004 [P] [Pattern: Verification] Verify ESLint and Prettier configuration
  - **Score**: 95% | **Time**: 1 min | **Strategy**: Check files exist

- [x] T005 [P] [Pattern: Verification] Verify Storybook is configured
  - **Score**: 95% | **Time**: 1 min | **Strategy**: Check .storybook/ directory

---

## Phase 2: Foundational - HIGH 85%

**7/8 tasks Grok-suitable (T011 already complete)**

- [x] T006 [Pattern: Scaffolding] Create accordion directory structure
  - **Score**: 90% | **Time**: 1 min | **Strategy**: mkdir → verify

- [x] T007 [P] [Pattern: Scaffolding] Set up Foundation SCSS imports
  - **Score**: 85% | **Time**: 3 min | **Strategy**: Create file → add imports

- [x] T008 [P] [Pattern: Scaffolding] Create injection token file (nfsAccordionToken)
  - **Score**: 85% | **Time**: 3 min | **Strategy**: Copy CDK pattern → customize

- [x] T009 [Pattern: Verification] Install @angular/cdk if not present
  - **Score**: 80% | **Time**: 2 min | **Strategy**: Check package.json → npm install if needed

- [x] T009a [Pattern: Verification] Verify @angular/cdk importability
  - **Score**: 85% | **Time**: 2 min | **Strategy**: Create test import → build

- [x] T010 [P] [Pattern: Scaffolding] Create public API exports file (index.ts)
  - **Score**: 90% | **Time**: 2 min | **Strategy**: Create barrel file

- [x] T012 [P] [Pattern: Scaffolding] Create README documentation template
  - **Score**: 80% | **Time**: 5 min | **Strategy**: Use existing component READMEs as pattern

---

## Phase 3: US1 Basic Accordion - HIGH Tasks (12/22)

### Test Writing Tasks - HIGH 90%+

- [x] T013 [P] [US1] [Pattern: Test Writing] Add Default story to accordion.stories.ts with 3 FAQ items
  - **Score**: 95% | **Time**: 5 min | **Strategy**: Add story export to existing file
  - **File**: packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts

- [x] T014 [US1] [Pattern: Test Writing] Add play function: click item 2 → verify expands
  - **Score**: 90% | **Time**: 3 min | **Strategy**: Add play function with userEvent.click

- [x] T015 [US1] [Pattern: Test Writing] Add play function: click item 3 → verify item 2 collapses
  - **Score**: 90% | **Time**: 3 min | **Strategy**: Extend T014 play function

- [x] T016 [US1] [Pattern: Test Writing] Add play function: click expanded item 1 → verify collapses
  - **Score**: 90% | **Time**: 3 min | **Strategy**: Add collapse assertion

- [x] T017 [P] [US1] [Pattern: Test Writing] Add accessibility checks using @storybook/addon-a11y
  - **Score**: 92% | **Time**: 2 min | **Strategy**: Add a11y checks to story

### Component Scaffolding - HIGH 85%

- [x] T018 [P] [US1] [Pattern: Scaffolding] Create NfsAccordion component
  - **Score**: 85% | **Time**: 10 min | **Strategy**: Follow Angular standalone pattern
  - **File**: packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts

- [x] T019 [P] [US1] [Pattern: Scaffolding] Create NfsAccordionItem component
  - **Score**: 85% | **Time**: 10 min | **Strategy**: Follow existing component pattern
  - **File**: packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts

- [x] T020 [P] [US1] [Pattern: Scaffolding] Create NfsAccordionTitle component
  - **Score**: 85% | **Time**: 10 min | **Strategy**: Render as button
  - **File**: packages/ngx-foundation-sites/src/lib/accordion/accordion-title.component.ts

### CSS and Documentation - HIGH 85%+

- [x] T028 [US1] [Pattern: Add Method] Add Foundation CSS classes
  - **Score**: 85% | **Time**: 5 min | **Strategy**: Add class bindings per FR-029-035
  - Classes: `.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`

- [x] T029 [US1] [Pattern: Add Method] Implement .is-active class binding
  - **Score**: 88% | **Time**: 2 min | **Strategy**: [class.is-active]="expanded()"

- [x] T030 [US1] [Pattern: Update Docs] Add JSDoc comments for Foundation equivalents
  - **Score**: 90% | **Time**: 5 min | **Strategy**: Document data-\* mapping

- [x] T031 [US1] [Pattern: Scaffolding] Export components from index.ts
  - **Score**: 92% | **Time**: 2 min | **Strategy**: Add export statements

---

## Phase 4: US2 Keyboard - HIGH Tasks (6/14)

- [ ] T032 [P] [US2] [Pattern: Test Writing] Add KeyboardNavigation story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T033-T037 [US2] [Pattern: Test Writing] Play functions for Tab, ArrowDown, ArrowUp, Home, End
  - **Score**: 88% each | **Time**: 2 min each | **Total**: 10 min
  - **Strategy**: Use userEvent.keyboard for key simulation

---

## Phase 5: US3 Screen Reader - HIGH Tasks (14/32)

### Test Writing - HIGH 85%+

- [ ] T050 [P] [US3] [Pattern: Test Writing] Add ScreenReader story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T051-T053 [US3] [Pattern: Test Writing] ARIA attribute assertions
  - **Score**: 88% each | **Time**: 2 min each
  - **Strategy**: expect(element).toHaveAttribute('aria-expanded', 'true')

- [ ] T054 [P] [US3] [Pattern: Test Writing] AXE compliance checks
  - **Score**: 90% | **Time**: 3 min

- [ ] T176 [P] [US3] [Pattern: Test Writing] panelId runtime change test
  - **Score**: 80% | **Time**: 5 min

- [ ] T185 [P] [US3] [Pattern: Test Writing] Empty panel content test
  - **Score**: 82% | **Time**: 3 min

- [ ] T187 [P] [US3] [Pattern: Test Writing] Dynamic title text test
  - **Score**: 80% | **Time**: 5 min

### Add Method - HIGH 85%+

- [ ] T055 [P] [US3] [Pattern: Add Method] aria-expanded binding
  - **Score**: 85% | **Time**: 2 min | [attr.aria-expanded]="expanded()"

- [ ] T056 [P] [US3] [Pattern: Add Method] aria-controls binding
  - **Score**: 85% | **Time**: 2 min | [attr.aria-controls]="panelId()"

- [ ] T060 [P] [US3] [Pattern: Scaffolding] Create panel wrapper with role="region"
  - **Score**: 82% | **Time**: 3 min

- [ ] T061 [P] [US3] [Pattern: Add Method] aria-labelledby binding
  - **Score**: 85% | **Time**: 2 min

- [ ] T196 [P] [US3] [Pattern: Add Method] Add `announce = input(false)`
  - **Score**: 88% | **Time**: 2 min

- [ ] T197 [P] [US3] [Pattern: Scaffolding] Render live region element
  - **Score**: 85% | **Time**: 5 min

---

## Phase 6: US4 Multi-Expand - HIGH Tasks (6/8)

- [ ] T065 [P] [US4] [Pattern: Test Writing] Add MultiExpand story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T066-T068 [US4] [Pattern: Test Writing] Play functions for multi-expand scenarios
  - **Score**: 88% each | **Time**: 2 min each

- [ ] T070 [US4] [Pattern: Add Method] Add multiExpand input
  - **Score**: 85% | **Time**: 3 min

- [ ] T071 [US4] [Pattern: Add Method] Update #openItemIds signal for array
  - **Score**: 75% | **Time**: 5 min

---

## Phase 7: US5 Allow All Closed - HIGH Tasks (5/9)

- [ ] T073 [P] [US5] [Pattern: Test Writing] Add AllowAllClosed story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T074-T076 [US5] [Pattern: Test Writing] Play functions
  - **Score**: 85% each | **Time**: 2 min each

- [ ] T077 [US5] [Pattern: Add Method] Add allowAllClosed input
  - **Score**: 85% | **Time**: 3 min

- [ ] T190 [P] [US5] [Pattern: Test Writing] item.up() programmatic test
  - **Score**: 80% | **Time**: 5 min

---

## Phase 8: US6 Disabled Items - HIGH Tasks (8/15)

- [ ] T081 [P] [US6] [Pattern: Test Writing] Add DisabledItems story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T082-T086 [US6] [Pattern: Test Writing] Play functions for disabled scenarios
  - **Score**: 85% each | **Time**: 2 min each

- [ ] T087 [P] [US6] [Pattern: Add Method] Add accordion disabled input
  - **Score**: 85% | **Time**: 3 min

- [ ] T088 [P] [US6] [Pattern: Add Method] Add item disabled input
  - **Score**: 85% | **Time**: 3 min

- [ ] T094 [US6] [Pattern: Add Method] .is-disabled CSS class
  - **Score**: 82% | **Time**: 2 min

- [ ] T095 [US6] [Pattern: Add Method] Prevent toggle if disabled
  - **Score**: 78% | **Time**: 3 min

- [ ] T189 [P] [US6] [Pattern: Test Writing] Disabled item method test
  - **Score**: 80% | **Time**: 5 min

---

## Phase 9: US7 Initial Open - HIGH 85% (All 5 tasks)

- [ ] T096 [P] [US7] [Pattern: Test Writing] Story variant with expanded=true
  - **Score**: 90% | **Time**: 3 min

- [ ] T097 [P] [US7] [Pattern: Test Writing] MultiExpand story variant
  - **Score**: 90% | **Time**: 3 min

- [ ] T098 [US7] [Pattern: Update Docs] Document expanded input controls initial state
  - **Score**: 92% | **Time**: 3 min

- [ ] T099 [US7] [Pattern: Verification] Verify expanded defaults to false
  - **Score**: 95% | **Time**: 1 min

- [ ] T100 [US7] [Pattern: Update Docs] Add example to quickstart.md
  - **Score**: 90% | **Time**: 5 min

---

## Phase 10: US8 Dynamic Items - HIGH Tasks (5/10)

- [ ] T101 [P] [US8] [Pattern: Test Writing] Add DynamicContent story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T102-T104 [US8] [Pattern: Test Writing] Play functions for dynamic scenarios
  - **Score**: 85% each | **Time**: 3 min each

- [ ] T109 [US8] [Pattern: Verification] Verify ID uniqueness after add/remove
  - **Score**: 88% | **Time**: 3 min

- [ ] T110 [US8] [Pattern: Update Docs] Add @for example to quickstart.md
  - **Score**: 90% | **Time**: 5 min

---

## Phase 11: US9 SSR - HIGH Tasks (4/7)

- [ ] T111 [P] [US9] [Pattern: Add Method] Inject PLATFORM_ID
  - **Score**: 88% | **Time**: 2 min

- [ ] T112 [P] [US9] [Pattern: Add Method] isPlatformBrowser() guard
  - **Score**: 85% | **Time**: 3 min

- [ ] T113 [US9] [Pattern: Add Method] afterRender() callback
  - **Score**: 75% | **Time**: 5 min

- [ ] T114 [US9] [Pattern: Verification] Verify SSR semantic HTML
  - **Score**: 85% | **Time**: 5 min

---

## Phase 12: US10 Deep Linking - HIGH Tasks (9/18)

### Test Writing - HIGH 85%+

- [ ] T116 [P] [US10] [Pattern: Test Writing] Create E2E test file
  - **Score**: 90% | **Time**: 5 min
  - **File**: packages/ngx-foundation-sites-e2e/src/accordion/accordion-deeplink.spec.ts

- [ ] T117-T119 [US10] [Pattern: Test Writing] E2E tests for hash navigation
  - **Score**: 85% each | **Time**: 5 min each

- [ ] T120 [P] [US10] [Pattern: Test Writing] Add DeepLinking story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T121 [US10] [Pattern: Test Writing] Story with hash simulation
  - **Score**: 82% | **Time**: 5 min

### Add Method - HIGH 88%

- [ ] T122 [P] [US10] [Pattern: Add Method] Add deepLink input
  - **Score**: 88% | **Time**: 2 min

- [ ] T123-T126 [P] [US10] [Pattern: Add Method] Add deepLinkSmudge inputs
  - **Score**: 88% each | **Time**: 2 min each

---

## Phase 13: Foundation API Parity - HIGH Tasks (10/15)

### Test Writing - HIGH 85%+

- [ ] T134 [P] [API] [Pattern: Test Writing] Add FoundationApiParity story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T135-T139 [API] [Pattern: Test Writing] Play functions for methods/events
  - **Score**: 85% each | **Time**: 3 min each

### Documentation - HIGH 90%

- [ ] T147 [API] [Pattern: Update Docs] JSDoc for Foundation API equivalents
  - **Score**: 90% | **Time**: 5 min

- [ ] T148 [API] [Pattern: Update Docs] Document (down)/(up) events
  - **Score**: 90% | **Time**: 3 min

---

## Phase 14: Lazy Content - HIGH Tasks (7/11)

- [ ] T149 [P] [Pattern: Test Writing] Add LazyContent story to accordion.stories.ts
  - **Score**: 95% | **Time**: 5 min

- [ ] T150-T152 [Pattern: Test Writing] Play functions
  - **Score**: 85% each | **Time**: 3 min each

- [ ] T153 [P] [Pattern: Scaffolding] Create NfsAccordionContent directive
  - **Score**: 85% | **Time**: 10 min
  - **File**: packages/ngx-foundation-sites/src/lib/accordion/accordion-content.directive.ts

- [ ] T154 [P] [Pattern: Add Method] Inject TemplateRef
  - **Score**: 85% | **Time**: 3 min

- [ ] T159 [Pattern: Scaffolding] Export from public API
  - **Score**: 90% | **Time**: 2 min

---

## Phase 15: Advanced ARIA - HIGH Tasks (4/8)

- [ ] T160 [P] [Pattern: Test Writing] Story variant with titleHeadingLevel=2
  - **Score**: 90% | **Time**: 5 min

- [ ] T161 [P] [Pattern: Test Writing] Keyboard wrap test
  - **Score**: 90% | **Time**: 5 min

- [ ] T162 [P] [Pattern: Add Method] Add titleHeadingLevel input
  - **Score**: 85% | **Time**: 3 min

- [ ] T163 [P] [Pattern: Add Method] Add wrap input
  - **Score**: 85% | **Time**: 2 min

---

## Phase 16: Polish - HIGH Tasks (8/10)

- [ ] T166 [P] [Pattern: Update Docs] Update README.md with usage examples
  - **Score**: 90% | **Time**: 15 min
  - **File**: packages/ngx-foundation-sites/src/lib/accordion/README.md

- [ ] T167 [P] [Pattern: Verification] Verify all JSDoc comments
  - **Score**: 85% | **Time**: 10 min

- [ ] T168 [P] [Pattern: Verification] Review member visibility patterns
  - **Score**: 85% | **Time**: 10 min

- [ ] T170 [P] [Pattern: Test Writing] Performance testing (100 items)
  - **Score**: 80% | **Time**: 15 min

- [ ] T171 [P] [Pattern: Verification] Security review (SR-001 to SR-004)
  - **Score**: 85% | **Time**: 10 min

- [ ] T172 [Pattern: Scaffolding] Update main library index.ts
  - **Score**: 92% | **Time**: 3 min
  - **File**: packages/ngx-foundation-sites/src/index.ts

- [ ] T173 [P] [Pattern: Update Docs] Update accordion README with API reference
  - **Score**: 85% | **Time**: 20 min
  - **File**: packages/ngx-foundation-sites/src/lib/accordion/README.md

- [ ] T174 [Pattern: Verification] Run AXE accessibility checks
  - **Score**: 78% | **Time**: 15 min

---

## Excluded Tasks (Sonnet Recommended)

**These 65 tasks require Claude Sonnet 4.5's deeper reasoning:**

### Design/Architecture Tasks (22 tasks)

- [ ] T023 [LOW: 40%] State management (#openItemIds, registerItem, notifyItemToggle)
  - **Reason**: Architecture decision for state coordination
  - **Better Model**: Claude Sonnet 4.5 (extended thinking)

- [ ] T046 [LOW: 35%] Focus management utilities design
  - **Reason**: Complex keyboard navigation architecture
  - **Better Model**: Claude Sonnet 4.5

- [ ] T057c [LOW: 40%] Duplicate panelId detection with registry
  - **Reason**: Registry data structure design
  - **Better Model**: Claude Sonnet 4.5

- [ ] T108 [LOW: 40%] Focus management for removed items
  - **Reason**: Edge case handling requires reasoning
  - **Better Model**: Claude Sonnet 4.5

- [ ] T130 [LOW: 42%] Scroll logic with delays/offsets
  - **Reason**: Timing coordination
  - **Better Model**: Claude Sonnet 4.5

- [ ] T164 [LOW: 38%] Heading wrapper template logic
  - **Reason**: Conditional template architecture
  - **Better Model**: Claude Sonnet 4.5

- [ ] T180 [LOW: 40%] Hydration failure fallback
  - **Reason**: Error recovery architecture
  - **Better Model**: Claude Sonnet 4.5

- [ ] T182 [LOW: 30%] Event timestamp ordering
  - **Reason**: Complex concurrency design
  - **Better Model**: Claude Sonnet 4.5

- [ ] T186 [LOW: 38%] Empty-state handling architecture
  - **Reason**: Design decision
  - **Better Model**: Claude Sonnet 4.5

- [ ] T191 [LOW: 40%] tryAction() guard method
  - **Reason**: Method failure semantics design
  - **Better Model**: Claude Sonnet 4.5

- [ ] T193 [LOW: 40%] Binding coercion implementation
  - **Reason**: Complex state reconciliation
  - **Better Model**: Claude Sonnet 4.5

- [ ] T195 [LOW: 35%] Heading level dynamic updates
  - **Reason**: Focus preservation with DOM changes
  - **Better Model**: Claude Sonnet 4.5

### Integration Tasks (32 tasks)

- [ ] T024-T026 [LOW: 45-48%] DI setup and coordination
- [ ] T040-T045 [LOW: 40-45%] Keyboard handler implementation
- [ ] T069, T072 [LOW: 55-60%] Multi-expand state coordination
- [ ] T078-T080 [LOW: 50-55%] canCloseItem logic
- [ ] T089-T093 [LOW: 45-55%] Disabled state coordination
- [ ] T127-T133 [LOW: 45-60%] Deep linking implementation
- [ ] T145-T146 [LOW: 60%] Event emission in notifyItemToggle
- [ ] T155-T158 [LOW: 40-55%] Lazy content lifecycle
- [ ] T165 [LOW: 55%] Wrap keyboard navigation
- [ ] T178, T188 [LOW: 40-42%] Change detection integration

### Complex Tests (11 tasks)

- [ ] T178b-c [LOW: 45-48%] panelId change unit tests
- [ ] T179 [LOW: 55%] Hydration failure unit test
- [ ] T181 [LOW: 38%] Concurrent interaction test
- [ ] T182b [LOW: 55%] Event ordering unit test
- [ ] T184 [LOW: 55%] Nested focusable detection

---

## Implementation Strategy

### Recommended Approach (Rapid Iteration)

1. **Fix P0 Gaps First** (32 min with Grok):
   - T021: Rename multiExpandable → multiExpand
   - T140-T142: Add down(), up(), toggle() methods
   - T143-T144: Add (down), (up) outputs

2. **Execute Grok HIGH Tasks Phase-by-Phase**:
   - Start with verification tasks (Phase 1-2)
   - Progress to test writing tasks (each phase)
   - Add method/property tasks
   - Update documentation

3. **Hand Off LOW Tasks to Sonnet**:
   - Architecture decisions
   - Complex integration
   - Focus management design

### Grok Optimization Tips

- Use native tool-calling (not XML)
- Keep prompts short, iterate quickly
- Specify file paths and scope explicitly
- Let Grok run search → edit → test cycles
- Don't over-engineer prompts - 3 quick iterations beat 1 perfect prompt

### Expected Performance

- **Grok tasks (89)**: 4× faster, 0x cost (in Copilot)
- **Estimated total time for HIGH tasks**: ~4-5 hours
- **Quality**: 90%+ of Sonnet for suitable tasks

---

## Quick Reference: File Paths

**Component Files**:

- `packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-title.component.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-content.directive.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.token.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/index.ts`

**Story File** (colocated with component):

- `packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts`

**E2E Test Files**:

- `packages/ngx-foundation-sites-e2e/src/accordion/accordion-deeplink.spec.ts`

**Documentation**:

- `packages/ngx-foundation-sites/src/lib/accordion/README.md`
- `specs/002-accordion-component/quickstart.md`

---

## Next Steps

1. Review this task list for accuracy
2. Select Grok Code Fast 1 in VS Code model picker
3. Execute P0 gap tasks first (T021, T140-T144)
4. Execute HIGH suitability tasks by phase
5. Compare actual vs estimated performance
6. Hand off LOW tasks to Claude Sonnet 4.5
