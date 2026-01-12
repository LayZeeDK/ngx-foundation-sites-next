# GPT-5 Mini Suitable Tasks

**Generated**: 2026-01-22  
**Source**: tasks.md  
**Classification Model**: GPT-4.1 (1M context, mechanical scoring)  
**Total Tasks**: 208

## Summary

| Classification      | Count | Percentage |
| ------------------- | ----- | ---------- |
| **HIGH** (≥75%)     | 4     | 1.9%       |
| **MEDIUM** (50-74%) | 51    | 24.5%      |
| **LOW** (<50%)      | 153   | 73.6%      |

## Interpretation

**HIGH tasks** are ideal for GPT-5 Mini:

- Clear file paths and explicit patterns
- Mechanical procedures with exact specifications
- Single-file edits with measurable success criteria
- High independence (parallelizable)

**MEDIUM tasks** are suitable with CTCO templates:

- Some mechanical elements but need more context
- May involve multiple coordinated changes
- Benefit from explicit templates and examples

**LOW tasks** require human judgment:

- Architecture decisions
- Complex multi-file coordination
- Requires understanding of broader system context
- Design and planning activities

---

## Pattern Distribution

| Pattern           | HIGH | MEDIUM | LOW | Total |
| ----------------- | ---- | ------ | --- | ----- |
| Add Method        | 3    | 19     | 78  | 100   |
| Add Test          | 0    | 13     | 29  | 42    |
| Conditional Logic | 1    | 19     | 12  | 32    |
| Update Docs       | 0    | 0      | 6   | 6     |
| Refactor          | 0    | 0      | 1   | 1     |
| Other             | 0    | 0      | 27  | 27    |

---

## HIGH Suitability Tasks (≥75%)

### T003 - Conditional Logic (77.5%)

**Description**: [P] Verify component selector prefix is `nfs-` in packages/ngx-foundation-sites/project.json

**Scoring**:

- CTCO Clarity: 5/10 (file path, verification criteria)
- Mechanical Procedure: 3/10 (verification task)
- Format Explicitness: 10/10 (explicit prefix, file)
- Independence: 8/10 (single file, parallelizable)

**CTCO Template**:

```
Context: Verify Angular component selector prefix configuration
Task: Check that project.json contains selectorPrefix: "nfs-"
Code: packages/ngx-foundation-sites/project.json
Output: Verification result (pass/fail)
```

**Estimated Time**: 2-3 minutes

---

### T188a - Add Method (80.0%)

**Description**: [P] [US3] Add title text extraction helper method per AR-027a: implement `extractTitleText(titleComponent: NfsAccordionTitle): string` that returns `titleComponent.elementRef.nativeElement.textContent.trim()` to handle complex projected content (icons, badges, nested elements) by collapsing to readable text in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts

**Scoring**:

- CTCO Clarity: 6/10 (file path, method signature provided)
- Mechanical Procedure: 3/10 (single method implementation)
- Format Explicitness: 10/10 (exact signature and implementation provided)
- Independence: 8/10 (single file, method addition)

**CTCO Template**:

```
Context: Add helper method for extracting text from accordion title components
Task: Implement extractTitleText() method in NfsAccordion
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
  Method signature: extractTitleText(titleComponent: NfsAccordionTitle): string
  Implementation: return titleComponent.elementRef.nativeElement.textContent.trim()
Output: Method added to component class
```

**Estimated Time**: 5-7 minutes

---

### T195a - Add Method (80.0%)

**Description**: [P] [US15/Advanced] Add focus preservation helper method for heading wrapper swaps: implement `preserveFocusDuring(atomicOperation: () => void)` that captures currently focused title button's panelId, executes the operation, then restores focus to the same item's title button by panelId lookup per FR-176a in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts

**Scoring**:

- CTCO Clarity: 6/10 (file path, method signature)
- Mechanical Procedure: 3/10 (method implementation)
- Format Explicitness: 10/10 (exact signature and behavior)
- Independence: 8/10 (single file, method addition)

**CTCO Template**:

```
Context: Add helper method for preserving focus during DOM updates
Task: Implement preserveFocusDuring() method in NfsAccordion
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
  Method signature: preserveFocusDuring(atomicOperation: () => void): void
  Logic:
    1. Capture currently focused element's panelId
    2. Execute atomicOperation callback
    3. Find title button by captured panelId
    4. Restore focus to that button
Output: Method added with focus preservation logic
```

**Estimated Time**: 10-15 minutes

---

### T196 - Add Method (80.0%)

**Description**: [P] [US3] Add `announce = input(false)` InputSignal to NfsAccordion component in packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts

**Scoring**:

- CTCO Clarity: 6/10 (file path, input definition)
- Mechanical Procedure: 3/10 (add input declaration)
- Format Explicitness: 10/10 (exact syntax provided)
- Independence: 8/10 (single file, single input)

**CTCO Template**:

```
Context: Add input property to NfsAccordion for ARIA live region control
Task: Add announce input signal to component
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
  Input: announce = input(false)
  Type: InputSignal<boolean>
Output: Input property added to component class
```

**Estimated Time**: 2-3 minutes

---

## MEDIUM Suitability Tasks (50-74%)

### Add Method Pattern (19 tasks)

**T055** (70.0%): [P] [US3] Implement ARIA attributes on NfsAccordionTitle button: aria-expanded (computed from item.expanded signal)

**T056** (70.0%): [P] [US3] Implement ARIA attributes on NfsAccordionTitle button: aria-controls (references panel ID)

**T057b** (70.0%): [P] [US3] Implement ID auto-generation as an Angular injectable service (`NfsAccordionIdGeneratorService`) in packages/ngx-foundation-sites/src/lib/accordion/accordion-id-generator.service.ts

**T060** (70.0%): [P] [US3] Create panel wrapper element in NfsAccordionItem template with role="region"

**T061** (70.0%): [P] [US3] Add aria-labelledby on panel wrapper referencing title button ID

**T087** (70.0%): [P] [US6] Add disabled input to NfsAccordion (InputSignal<boolean>, default: false, disables all items)

**T088** (70.0%): [P] [US6] Add disabled input to NfsAccordionItem (InputSignal<boolean>, default: false, disables this item)

**T111** (70.0%): [P] [US9] Inject PLATFORM_ID in NfsAccordion component

**T112** (70.0%): [P] [US9] Use isPlatformBrowser() guard before accessing window, document, history APIs

**T122** (70.0%): [P] [US10] Add deepLink input to NfsAccordion (InputSignal<boolean>, default: false)

**T123** (70.0%): [P] [US10] Add deepLinkSmudge input (boolean, default: false)

**T124** (70.0%): [P] [US10] Add deepLinkSmudgeDelay input (number, default: 300)

**T125** (70.0%): [P] [US10] Add deepLinkSmudgeOffset input (number, default: 0)

**T126** (70.0%): [P] [US10] Add updateHistory input (boolean, default: false)

**T140** (70.0%): [P] [API] Implement down() method on NfsAccordionItem: set expanded signal to true (if not disabled)

**T141** (70.0%): [P] [API] Implement up() method on NfsAccordionItem: set expanded signal to false (if canClose)

**T142** (70.0%): [P] [API] Implement toggle() method on NfsAccordionItem: flip expanded signal (if allowed)

**T143** (70.0%): [P] [API] Add down output to NfsAccordion (OutputEmitterRef<AccordionItemChangeEvent>)

**T144** (70.0%): [P] [API] Add up output to NfsAccordion (OutputEmitterRef<AccordionItemChangeEvent>)

### Add Test Pattern (13 tasks)

**T178b** (70.0%): [P] [US3] Add unit test for FR-017b panelId runtime changes

**T178c** (70.0%): [P] [US3] Add unit test for FR-017c panelId/deepLink non-auto-expand

**T182b** (65.0%): [P] [US2] Add unit test for FR-106a event timestamp ordering logic

**T014** (60.0%): [US1] Add play function to Basic story: click item 2 title, verify item 2 expands

**T015** (60.0%): [US1] Add play function to Basic story: click item 3 title, verify item 3 expands and item 2 collapses

**T033** (60.0%): [US2] Add play function: simulate Tab, verify focus on first title

**T034** (60.0%): [US2] Add play function: simulate ArrowDown, verify focus moves to next title

**T035** (60.0%): [US2] Add play function: simulate ArrowUp, verify focus moves to previous title

**T036** (60.0%): [US2] Add play function: simulate Home, verify focus moves to first title

**T037** (60.0%): [US2] Add play function: simulate End, verify focus moves to last title

**T051** (60.0%): [US3] Add assertions for ARIA attributes on all items

**T066** (60.0%): [US4] Add play function: expand item 1, verify item 1 opens

**T067** (60.0%): [US4] Add play function: expand item 2, verify both items remain open

### Conditional Logic Pattern (19 tasks)

**T183** (70.0%): [P] [US1] Add Storybook story variant to Basic story: render accordion with interactive elements inside title content

**T186** (70.0%): [US3] Implement empty-state handling in NfsAccordionItem

**T189** (70.0%): [P] [US6] Add Storybook play test to DisabledItems story: call item.down() on disabled item

**T190** (70.0%): [P] [US5] Add Storybook play test to AllowAllClosed story: call item.up() when item is last open

**T192** (70.0%): [P] [US5] Add Storybook play test to AllowAllClosed story: binding coercion test

**T062** (60.0%): [US3] Ensure panel wrapper remains in DOM when collapsed

**T063** (60.0%): [US3] Add inert attribute on panel wrapper when collapsed

**T078** (60.0%): [US5] Implement canCloseItem() method in NfsAccordion

**T079** (60.0%): [US5] Update NfsAccordionItem.toggle() to check parent.canCloseItem()

**T080** (60.0%): [US5] Add computed signal canClose in NfsAccordionItem

**T089** (60.0%): [US6] Implement additive disabled logic

**T090** (60.0%): [US6] Add softDisabled input to NfsAccordion

**T091** (60.0%): [US6] Implement soft disabled: aria-disabled="true", keep in tab order

**T092** (60.0%): [US6] Implement hard disabled: disabled attribute, remove from tab order

**T093** (60.0%): [US6] Update keyboard navigation to skip disabled items

**T095** (60.0%): [US6] Prevent toggle() if disabled=true

**T193** (60.0%): [US5] Implement binding coercion in NfsAccordionItem.expanded

**T191** (60.0%): [US6] Implement tryAction() guard method in NfsAccordionItem

---

## LOW Suitability Tasks (<50%)

**153 tasks** classified as LOW suitability require:

- Complex architectural decisions
- Multi-component coordination
- Design and planning work
- Integration across multiple systems
- Manual testing and verification

**Examples of LOW tasks:**

- T001: Verify Nx library structure (requires system understanding)
- T006: Create directory structure (setup task)
- T011: Create API design document (design work)
- T018-T020: Create component scaffolding (architecture)
- T023: Implement state management (complex coordination)

These tasks should be assigned to experienced developers who understand the full system context.

---

## Execution Strategy

### Phase 1: HIGH Tasks (Parallel)

Execute all 4 HIGH tasks immediately:

1. T003 - Verify selector prefix
2. T188a - Add extractTitleText() method
3. T195a - Add preserveFocusDuring() method
4. T196 - Add announce input

**Estimated time**: 20-30 minutes total (can parallelize)

### Phase 2: MEDIUM Tasks (Grouped by Pattern)

**Group 1: Input/Output Additions** (parallelizable)

- T055, T056, T087, T088, T111, T112, T122-T126, T140-T144
- Estimated time: 60-90 minutes

**Group 2: ARIA Implementation** (sequential)

- T057b, T060, T061, T062, T063
- Estimated time: 45-60 minutes

**Group 3: Logic Implementation** (sequential)

- T078, T079, T080, T089-T093, T095, T186, T191, T193
- Estimated time: 90-120 minutes

**Group 4: Tests** (parallelizable)

- T014, T015, T033-T037, T051, T066, T067, T178b, T178c, T182b, T183, T189, T190, T192
- Estimated time: 120-180 minutes

### Phase 3: LOW Tasks (Manual Review)

- Assign to experienced developers
- Requires architectural understanding
- Not suitable for GPT-5 Mini automation

---

## Usage Notes

**For /implement-tasks-for-gpt-5-mini command:**

1. Process HIGH tasks first (fastest wins)
2. Group MEDIUM tasks by pattern for context efficiency
3. Skip LOW tasks (manual implementation required)

**Expected Success Rate:**

- HIGH: 95%+ (well-defined, mechanical)
- MEDIUM: 70-80% (needs good CTCO templates)
- LOW: <40% (not recommended)

**Total GPT-5 Mini Suitable**: 55 tasks (26.4% of total)  
**Total Implementation Time**: 5-7 hours (with parallelization: 3-4 hours)

---

## Next Steps

Run the implementation command:

```bash
gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini
```

The implementation agent will:

1. Load this file for task prioritization
2. Load gpt5mini-implementation-context.md for CTCO templates
3. Execute HIGH tasks first
4. Group MEDIUM tasks by pattern
5. Skip LOW tasks with reasoning
6. Track progress in real-time
7. Verify each implementation
8. Report completion statistics

---

**Generated by**: GPT-4.1 (tasks-for-gpt-5-mini-gpt-4-1 agent)  
**Validation**: Mechanical scoring (4-dimension arithmetic)  
**Context**: 208 tasks across 16 phases, accordion component feature  
**Classification Date**: 2026-01-22
