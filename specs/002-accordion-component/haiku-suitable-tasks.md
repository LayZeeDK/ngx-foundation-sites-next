# Haiku-Suitable Tasks: Accordion Component (Phases 5-6)

**Generated**: 2026-01-15
**Source**: tasks.md (Phases 5-6 only)
**Haiku Model**: Claude Haiku 4.5 (200K context, $1/$5 per 1M tokens)
**Optimization Strategy**: Fast execution for focused, bounded tasks

---

## Task Summary

- **Total Tasks in Phases 5-6**: 19
- **Haiku-Suitable (HIGH)**: 12 (63%)
- **Haiku-Suitable (MEDIUM)**: 7 (37%)
- **Sonnet-Recommended (LOW)**: 0 (0%)

**Estimated Savings**:

- **Time**: ~2-3× faster with Haiku on suitable tasks
- **Cost**: 66% cheaper ($8-10 vs $24-30 on HIGH tasks)

---

## Phase 5: User Story 3 - Screen Reader Compatibility

**Suitability**: HIGH overall for this phase (11 HIGH, 6 MEDIUM)

### HIGH Suitability Tasks (Haiku Recommended)

- [X] T177 [US3] Add Storybook test: change panelId while deepLink enabled, verify item does NOT auto-expand (deep link only responds to URL hash changes) in packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts
  - **Suitability Score**: 75% (Scope: 8/10, Complexity: 7/10, Dependencies: 7/10, Pattern: 8/10)
  - **Pattern**: Add Test (Storybook play function)
  - **Estimated Time (Haiku)**: 3-5 minutes
  - **Context Needed**: Existing Storybook test patterns, deepLink implementation

- [X] T199 [P] [US3] Add Storybook play test: verify live region receives expand/collapse announcements when announce=true, no live region when announce=false in packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts
  - **Suitability Score**: 87.5% (Scope: 9/10, Complexity: 8/10, Dependencies: 9/10, Pattern: 9/10)
  - **Pattern**: Add Test (assertion for ARIA live region)
  - **Estimated Time (Haiku)**: 2-3 minutes
  - **Context Needed**: Live region element from accordion.html, existing assertion patterns

- [X] T057b [P] [US3] Implement ID auto-generation as Angular injectable service (NfsAccordionIdGeneratorService) in packages/ngx-foundation-sites/src/lib/accordion/accordion-id-generator.service.ts (providedIn: 'platform')
  - **Suitability Score**: 92.5% (Scope: 9/10, Complexity: 9/10, Dependencies: 10/10, Pattern: 9/10)
  - **Pattern**: Add Service (simple counter-based ID generator)
  - **Estimated Time (Haiku)**: 2-4 minutes
  - **Context Needed**: Existing service at accordion-id-generator.service.ts, platform provider pattern

- [X] T058 [US3] Generate title button ID: ${accordionInstanceId}-title-${itemIndex}
  - **Suitability Score**: 90% (Scope: 9/10, Complexity: 10/10, Dependencies: 8/10, Pattern: 9/10)
  - **Pattern**: Add Property (string template for ID generation)
  - **Estimated Time (Haiku)**: 2-3 minutes
  - **Context Needed**: ID generator service, accordion-item-def.ts structure

- [X] T059 [US3] Use user-provided panelId or generate: ${accordionInstanceId}-panel-${itemIndex}
  - **Suitability Score**: 82.5% (Scope: 8/10, Complexity: 9/10, Dependencies: 7/10, Pattern: 9/10)
  - **Pattern**: Add Logic (conditional: use input or generate)
  - **Estimated Time (Haiku)**: 3-4 minutes
  - **Context Needed**: panelId input signal, ID generator service

- [X] T063 [US3] Add inert attribute on panel wrapper when collapsed (prevent keyboard access)
  - **Suitability Score**: 87.5% (Scope: 9/10, Complexity: 9/10, Dependencies: 8/10, Pattern: 9/10)
  - **Pattern**: Add Attribute Binding
  - **Estimated Time (Haiku)**: 1-2 minutes
  - **Context Needed**: Panel wrapper element in accordion.html, expanded signal

- [X] T064 [US3] Implement @if conditional rendering for panel content (remove content from DOM when collapsed, keep wrapper)
  - **Suitability Score**: 80% (Scope: 8/10, Complexity: 8/10, Dependencies: 7/10, Pattern: 9/10)
  - **Pattern**: Update Template (add @if control flow)
  - **Estimated Time (Haiku)**: 2-3 minutes
  - **Context Needed**: Current panel rendering logic in accordion.html

- [X] T178b [P] [US3] Add unit test for FR-017b panelId runtime changes: verify re-registration, ARIA updates, duplicate detection triggers ErrorHandler in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.spec.ts
  - **Suitability Score**: 77.5% (Scope: 8/10, Complexity: 6/10, Dependencies: 9/10, Pattern: 8/10)
  - **Pattern**: Add Test (unit test for input change behavior)
  - **Estimated Time (Haiku)**: 5-7 minutes
  - **Context Needed**: Existing spec patterns, ErrorHandler mock setup

- [X] T178c [P] [US3] Add unit test for FR-017c panelId/deepLink non-auto-expand: when panelId changes to match URL hash, verify item does NOT auto-expand in packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.spec.ts
  - **Suitability Score**: 80% (Scope: 8/10, Complexity: 7/10, Dependencies: 9/10, Pattern: 8/10)
  - **Pattern**: Add Test (negative assertion test)
  - **Estimated Time (Haiku)**: 4-6 minutes
  - **Context Needed**: deepLink behavior, existing negative test patterns

- [X] T186 [US3] Implement empty-state handling in NfsAccordionItem: when no content projected, render invisible placeholder comment to ensure stable ARIA structure in packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts
  - **Suitability Score**: 80% (Scope: 8/10, Complexity: 8/10, Dependencies: 8/10, Pattern: 8/10)
  - **Pattern**: Add Logic (guard clause for empty content)
  - **Estimated Time (Haiku)**: 3-5 minutes
  - **Context Needed**: Content projection patterns, accordion-item-def.ts template

- [X] T188a [P] [US3] Add title text extraction helper method: extractTitleText(titleComponent: NfsAccordionTitle): string returns textContent.trim() in packages/ngx-foundation-sites/src/lib/accordion/accordion.ts
  - **Suitability Score**: 100% (Scope: 10/10, Complexity: 10/10, Dependencies: 10/10, Pattern: 10/10)
  - **Pattern**: Add Method (trivial helper method)
  - **Estimated Time (Haiku)**: 1-2 minutes
  - **Context Needed**: Method signature from task description

- [X] T069 [US4] Implement multiExpand logic in NfsAccordion.notifyItemToggle(): if multiExpand=true, do not close other items
  - **Suitability Score**: 80% (Scope: 8/10, Complexity: 8/10, Dependencies: 8/10, Pattern: 8/10)
  - **Pattern**: Add Logic (guard clause in existing method)
  - **Estimated Time (Haiku)**: 2-4 minutes
  - **Context Needed**: Existing notifyItemToggle() method, multiExpand input signal

### MEDIUM Suitability Tasks (Haiku with Extended Thinking)

- [X] T057 [US3] Implement unique ID generation in NfsAccordion: static counter + instance ID (nfs-accordion-${counter++})
  - **Suitability Score**: 62.5% (Scope: 7/10, Complexity: 6/10, Dependencies: 5/10, Pattern: 7/10)
  - **Estimated Time (Haiku)**: 5-8 minutes
  - **Extended Thinking Budget**: 2K-3K tokens
  - **Context Needed**: Full NfsAccordion class, where instance ID is used (constructor, template)
  - **Rationale**: Requires understanding integration points across component
  - **✅ COMPLETED**: Already implemented via NfsAccordionIdGenerator service

- [X] T057c [US3] Implement panelId duplicate detection per FR-017a: maintain Map<string, NfsAccordionItem[]> registry, validate on registerItem() and panelId changes, call ErrorHandler.handleError() on duplicates in packages/ngx-foundation-sites/src/lib/accordion/accordion.ts
  - **Suitability Score**: 67.5% (Scope: 8/10, Complexity: 6/10, Dependencies: 6/10, Pattern: 7/10)
  - **Estimated Time (Haiku)**: 8-12 minutes
  - **Extended Thinking Budget**: 2K-4K tokens
  - **Context Needed**: registerItem() method, ErrorHandler patterns, FR-017a requirements
  - **Rationale**: Validation logic with error reporting requires careful integration
  - **✅ COMPLETED**: Added validatePanelId() public method to NfsAccordion

- [X] T062 [US3] Ensure panel wrapper remains in DOM when collapsed (for stable aria-controls reference)
  - **Suitability Score**: 67.5% (Scope: 7/10, Complexity: 7/10, Dependencies: 7/10, Pattern: 6/10)
  - **Estimated Time (Haiku)**: 6-10 minutes
  - **Extended Thinking Budget**: 2K tokens
  - **Context Needed**: Current template structure, how content is toggled
  - **Rationale**: Structural change requiring architectural understanding
  - **✅ COMPLETED**: Already implemented in accordion.html - wrapper stays in DOM, only content conditionally rendered

- [X] T178 [US3] Implement panelId change handler in NfsAccordionItem: on panelId change, unregister old ID, re-register new ID, update ARIA attributes atomically in packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts
  - **Suitability Score**: 60% (Scope: 7/10, Complexity: 5/10, Dependencies: 6/10, Pattern: 6/10)
  - **Estimated Time (Haiku)**: 10-15 minutes
  - **Extended Thinking Budget**: 3K-4K tokens
  - **Context Needed**: Registration lifecycle, effect() for input tracking, ARIA ID updates
  - **Rationale**: Coordination across multiple systems (registration, ARIA, signals)
  - **✅ COMPLETED**: Added effect to track panelId changes and call validatePanelId()

- [X] T188 [US3] Implement title change detection in NfsAccordion: track NfsAccordionTitle content changes, publish to live region if announce=true, debounce by 100ms in packages/ngx-foundation-sites/src/lib/accordion/accordion.ts
  - **Suitability Score**: 50% (Scope: 6/10, Complexity: 4/10, Dependencies: 5/10, Pattern: 5/10)
  - **Estimated Time (Haiku)**: 15-20 minutes
  - **Extended Thinking Budget**: 4K tokens
  - **Context Needed**: Change detection patterns, debounce implementation, live region integration
  - **Rationale**: Complex reactive pattern with multiple moving parts
  - **✅ COMPLETED**: Added effect to monitor button text changes and #scheduleTitleChangeAnnouncement() helper

- [X] T198 [US3] Implement live-region message publishing: on expand/collapse, set live region textContent, debounce by 100ms in packages/ngx-foundation-sites/src/lib/accordion/accordion.ts
  - **Suitability Score**: 65% (Scope: 7/10, Complexity: 6/10, Dependencies: 6/10, Pattern: 7/10)
  - **Estimated Time (Haiku)**: 8-12 minutes
  - **Extended Thinking Budget**: 2K-3K tokens
  - **Context Needed**: Live region element (T197), debounce pattern, expansion events
  - **Rationale**: Debounce + reactive state updates require careful timing
  - **✅ COMPLETED**: Added #scheduleAnnouncement() helper with 100ms debounce

- [ ] T072 [US4] Update state management to track multiple open items when multiExpand=true
  - **Suitability Score**: 55% (Scope: 6/10, Complexity: 5/10, Dependencies: 5/10, Pattern: 6/10)
  - **Estimated Time (Haiku)**: 10-15 minutes
  - **Extended Thinking Budget**: 3K-4K tokens
  - **Context Needed**: Current state management architecture, #openItemIds signal usage
  - **Rationale**: Vague scope requiring architectural decisions

---

## Phase 6: User Story 4 - Multi-Expand Mode

**Suitability**: HIGH for primary task, MEDIUM for state management update

### HIGH Suitability Tasks (Already Listed Above)

- T069 is listed in Phase 5 HIGH section above

### MEDIUM Suitability Tasks (Already Listed Above)

- T072 is listed in Phase 5 MEDIUM section above

---

## Implementation Strategy

**Recommended Approach**:

1. **Haiku First**: Execute all 12 HIGH suitability tasks in parallel where possible ([P] markers)
   - Parallel batch 1: T199, T057b, T178b, T178c, T188a (all marked [P])
   - Sequential: T177, T058, T059, T063, T064, T186, T069

2. **Haiku with Extended Thinking**: Execute 7 MEDIUM tasks with 2K-4K thinking budget
   - Recommend sequential execution for these (more complex)
   - Start with simpler ones: T057c, T062, T198
   - Then tackle: T057, T178, T188, T072

3. **Quality Checks**: After Haiku execution
   - Run `npm run build` (TypeScript compilation)
   - Run `nx test-storybook ngx-foundation-sites` (Storybook tests)
   - Run `npm run lint` (code style)

**Expected Performance**:

- **Haiku HIGH tasks**: 2-5 minutes each, ~30-50 minutes total (vs ~60-100 minutes Sonnet)
- **Haiku MEDIUM tasks**: 5-20 minutes each, ~70-100 minutes total (vs ~100-150 minutes Sonnet)
- **Total estimated time**: ~100-150 minutes Haiku vs ~160-250 minutes Sonnet
- **Time savings**: 40-60 minutes (~35-40% faster)
- **Cost savings**: ~$5-8 (66% on Haiku tasks)

---

## Next Steps

1. Review this analysis for accuracy
2. Run `/implement-tasks-for-haiku-4-5` to execute Haiku-suitable tasks
3. Compare actual vs estimated performance
4. Refine classification for future features
