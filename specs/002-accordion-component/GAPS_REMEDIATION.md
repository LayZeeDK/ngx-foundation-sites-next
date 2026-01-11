# Accordion Implementation Gaps - Remediation Tracker

**Last Validated**: 2026-01-10
**Validation Method**: Cross-artifact analysis (spec.md vs implementation vs contracts)
**Source**: gap-analysis-report.md
**Status**: Remediation in progress

---

## Purpose

This document tracks validated implementation gaps between the accordion specification (spec.md, plan.md, tasks.md, contracts/) and the actual implementation. It serves as the single source of truth for gap analysis tools (`/analyze-brief-gpt-5-mini`, `/analyze-brief-gpt-4-1`) to prevent re-flagging documented gaps.

---

## P0 - BLOCKING (3 gaps, 32 min) 🚨

### GAP-1: Foundation API Methods Missing on Item

**Status**: NOT IMPLEMENTED
**Validation Score**: 10/10
**Evidence**:

- **Spec**: FR-075 at spec.md:530 — "MUST expose Foundation-equivalent methods: `toggle()`, `down()`, `up()`"
- **Tasks**: T140-T142 at tasks.md:477-479
- **Contract**: `NfsAccordionItemApi` interface at contracts/accordion-api.ts:146-166 defines all three methods
- **Implementation**: Search in accordion-item-def.ts (lines 1-58) found NO public methods

**Impact**: Breaks Foundation JavaScript→Angular migration path. Developers cannot use programmatic control.

**Fix**:

```typescript
// In packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts
down(): void {
  if (!this.disabled()) {
    this.expanded.set(true);
  }
}

up(): void {
  if (!this.disabled()) {
    this.expanded.set(false);
  }
}

toggle(): void {
  if (!this.disabled()) {
    this.expanded.update(v => !v);
  }
}
```

**Estimated Time**: 10 minutes
**Violates**: FR-075, CA-009 (constitutional requirement)

---

### GAP-2: Foundation API Outputs Missing on Container

**Status**: NOT IMPLEMENTED
**Validation Score**: 10/10
**Evidence**:

- **Spec**: FR-076 at spec.md:531 — "MUST emit Foundation-equivalent events: `down`, `up`"
- **Tasks**: T143-T148 at tasks.md:480-483
- **Contract**: `NfsAccordionApi` interface at contracts/accordion-api.ts:98-116 defines both outputs
- **Implementation**: Search in accordion.ts (lines 1-306) found NO `down` or `up` outputs

**Impact**: Consumers cannot react to panel state changes. Essential for analytics and state management integration.

**Fix**:

```typescript
// In packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
import { output } from '@angular/core';

readonly down = output<{ itemId: string; expanded: true }>();
readonly up = output<{ itemId: string; expanded: false }>();

// Emit in expansion tracking effect (around line 168)
```

**Estimated Time**: 20 minutes
**Violates**: FR-076, CA-010 (constitutional requirement)

---

### GAP-3: Input Naming Inconsistency (multiExpandable vs multiExpand)

**Status**: IMPLEMENTED AS `multiExpandable` (should be `multiExpand`)
**Validation Score**: 10/10
**Evidence**:

- **Spec**: FR-014 at spec.md:289 — "MUST accept a `multiExpand` signal input"
- **Tasks**: T021 at tasks.md:774 with note "Rename `multiExpandable` → `multiExpand` globally (~2min, BREAKING)"
- **Contract**: `NfsAccordionApi` interface at contracts/accordion-api.ts:66 — "readonly multiExpand: InputSignal<boolean>;"
- **Implementation**:
  - accordion.ts line 51: `readonly multiExpandable = input(false);` ❌
  - accordion.html line 12: `[multiExpandable]="multiExpandable()"` ❌
  - accordion.spec.ts line 22: `multiExpandable()` ❌

**Impact**: Breaking API inconsistency. Violates Foundation naming alignment (CA-007). API surface doesn't match specification or contracts.

**Fix**: Global rename in 4 files:

1. packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts line 51
2. packages/ngx-foundation-sites/src/lib/accordion/accordion.component.html line 12
3. packages/ngx-foundation-sites/src/lib/accordion/accordion.component.spec.ts (all occurrences)
4. packages/ngx-foundation-sites/.storybook/stories/accordion/\*.stories.ts (if present)

**Estimated Time**: 2 minutes
**Violates**: FR-014, CA-007
**Breaking Change**: YES - Document in changelog

---

## P1 - IMPORTANT (3 gaps, 135 min) ⚠️

### GAP-4: titleHeadingLevel Input Not Implemented

**Status**: NOT IMPLEMENTED
**Validation Score**: 9/10
**Evidence**:

- **Spec**: FR-016 at spec.md:291 — Lists `titleHeadingLevel` among required inputs
- **Tasks**: T162-T164 at tasks.md:779 with "Status: NOT IMPLEMENTED"
- **Contract**: `NfsAccordionApi` interface at contracts/accordion-api.ts:93 — "readonly titleHeadingLevel: InputSignal<AccordionHeadingLevel | null>;"
- **ARIA Doc**: accordion-aria.md lines 75-106 describes optional heading wrapper requirement
- **Implementation**: Search in accordion.ts (lines 1-306) found NO `titleHeadingLevel` input

**Impact**: Screen reader users cannot navigate accordion using heading shortcuts (H key). Limits WCAG 1.3.1 compliance.

**Fix**:

```typescript
// In accordion.component.ts
readonly titleHeadingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | null>(null);

// In accordion template, wrap button conditionally:
@if (titleHeadingLevel(); as level) {
  <div role="heading" [attr.aria-level]="level">
    <button class="accordion-title">...</button>
  </div>
} @else {
  <button class="accordion-title">...</button>
}
```

**Estimated Time**: 30 minutes (includes template restructuring)
**Violates**: FR-016, FR-110a, FR-176a

---

### GAP-5: ErrorHandler Diagnostics Missing

**Status**: PARTIAL (validators.ts exists for input coercion per T-AC-003, but ErrorHandler calls missing)
**Validation Score**: 7/10
**Evidence**:

- **Spec**: Multiple requirements — FR-017a (duplicate panelId), FR-026a (missing title), FR-067b (deep link errors), FR-089a (rapid toggle), FR-110a (input validation)
- **Tasks**: References at tasks.md (T165-T171, indirect)
- **Plan**: Implementation notes at plan.md:133-176 describe structured error reporting
- **Implementation**: Search in accordion.ts found NO ErrorHandler injection or usage

**Impact**: Silent failures for duplicate IDs, missing titles, invalid inputs, and deep link errors. Makes debugging difficult.

**Fix**: Inject ErrorHandler and add diagnostic calls at 5 validation points:

```typescript
// In accordion.component.ts
readonly #errorHandler = inject(ErrorHandler);

// Example for FR-017a (duplicate panelId):
if (duplicateDetected) {
  this.#errorHandler.handleError(
    new Error(`Duplicate panelId "${id}" detected in accordion...`)
  );
}
```

**Validation Points**:

1. FR-017a: Duplicate panelId detection
2. FR-026a: Missing <nfs-accordion-title> detection
3. FR-067b: Deep link to non-existent panel
4. FR-089a: Rapid toggle serialization errors
5. FR-110a: Input validation edge cases (validators.ts already coerces, needs ErrorHandler calls)

**Estimated Time**: 60 minutes (across 5 validation points)
**Violates**: FR-017a, FR-026a, FR-067b, FR-089a, FR-110a

**Note**: validators.ts (created per T-AC-003) already handles input coercion for FR-110a, but needs ErrorHandler integration for diagnostics.

---

### GAP-6: Storybook Tests for Foundation API Missing

**Status**: NOT IMPLEMENTED
**Validation Score**: 8/10
**Evidence**:

- **Spec**: FR-075, FR-076 at spec.md:530-531
- **Tasks**: T134-T139 at tasks.md:468-473 describe FoundationApiParity story requirement
- **Implementation**:
  - accordion.stories.ts file too large (40.4 KB) to fully verify
  - grep for "FoundationApiParity" found NO results
  - grep for "item.down()" found NO results

**Impact**: No test coverage for Foundation API methods. Breaking changes could be introduced without detection.

**Fix**: Create new Storybook story:

```typescript
// In packages/ngx-foundation-sites/.storybook/stories/accordion/FoundationApiParity.story.ts
export const FoundationApiParity: Story = {
  render: (args) => ({ /* ... */ }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item = /* get item ref */;

    // Test down() method
    item.down();
    await waitFor(() => expect(/* panel expanded */));

    // Test up() method
    item.up();
    await waitFor(() => expect(/* panel collapsed */));

    // Test toggle() method
    item.toggle();
    await waitFor(() => expect(/* panel toggled */));
  }
};
```

**Estimated Time**: 45 minutes
**Violates**: Testing requirements for FR-075, FR-076

---

## P2 - POLISH (2 gaps, 45 min) 🔧

### GAP-7: Missing `announce` Input (FALSE POSITIVE - Meta-task)

**Status**: TRACKED AS T196-T199 (Phase 5, US3)
**Validation Score**: 7/10 (references plan.md not spec.md directly)
**Evidence**:

- **Plan**: AR-027a at plan.md:155 describes `announce` input requirement
- **Tasks**: T196-T199 at tasks.md:258-260 track implementation
- **Tasks Note**: Line 637-641 explicitly states "T-AC-002 _(meta-task)_ — resolved by T196-T199"

**Resolution**: This is NOT a gap—it's a meta-task reference. The actual implementation is tracked via existing tasks T196-T199 in Phase 5.

**Action**: Remove from gap list. Track via T196-T199 execution status instead.

---

### GAP-8: SSR Error Handling Missing in afterNextRender Blocks

**Status**: PARTIAL (uses afterNextRender, but no try/catch)
**Validation Score**: 6/10
**Evidence**:

- **Spec**: FR-062a at plan.md:179-180 — "wrap hydration steps in guarded try/catch"
- **Implementation**: Search in accordion.ts found three unguarded `afterNextRender` blocks:
  - Line 108: Style loader call (unguarded)
  - Line 118: Deep link initialization (unguarded)
  - Line 124: Third afterNextRender block (unguarded)

**Impact**: SSR hydration failures crash silently. Rare but catastrophic when they occur.

**Fix**: Wrap each `afterNextRender` block:

```typescript
afterNextRender(() => {
  try {
    this.#styleLoader.load('accordion', '/nfs-accordion.css');
  } catch (error) {
    this.#errorHandler.handleError(error);
  }
});
```

**Estimated Time**: 15 minutes (3 blocks × 5 min each)
**Violates**: FR-062a

---

## False Positives (Working as Designed) ✅

The following were initially identified as gaps but are **NOT GAPS**:

1. **Animation hooks missing**
   - Status: CSS-only per Goals/Non-Goals:575-577
   - Reason: Foundation CSS handles all transitions via Sass variables

2. **ARIA live region always present**
   - Status: Opt-in via `announce` input (AR-027a, default: false)
   - Reason: Base ARIA compliance uses aria-expanded; live region is enhancement

3. **@defer lifecycle not explicit**
   - Status: Framework-provided via @defer (when ...) syntax
   - Reason: Implementation correctly uses Angular's native @defer pattern

4. **Foundation CSS classes missing**
   - Status: Applied correctly via @angular/aria directives
   - Reason: AccordionTrigger/AccordionPanel add required classes automatically

---

## Remediation Roadmap

### Phase 1: Critical (P0) - 32 minutes

Execute in this order to minimize breaking changes:

1. **GAP-3** (2 min): Rename `multiExpandable` → `multiExpand` globally
   - Mark as BREAKING CHANGE in changelog
2. **GAP-1** (10 min): Add `down()`, `up()`, `toggle()` methods to NfsAccordionItemDef
3. **GAP-2** (20 min): Add `down` and `up` outputs to NfsAccordion

### Phase 2: Important (P1) - 135 minutes

4. **GAP-4** (30 min): Implement `titleHeadingLevel` input with template logic
5. **GAP-5** (60 min): Add ErrorHandler diagnostics for 5 validation points
6. **GAP-6** (45 min): Create FoundationApiParity Storybook story

### Phase 3: Polish (P2) - 15 minutes

7. ~~**GAP-7** (30 min): Implement `announce` input~~ → **TRACKED AS T196-T199**
8. **GAP-8** (15 min): Add try/catch to afterNextRender blocks

---

## Total Fix Estimate

- **P0 (Blocking)**: 32 minutes
- **P0 + P1**: 167 minutes (~2.8 hours)
- **P0 + P1 + P2**: 182 minutes (~3 hours)

---

## Validation Methodology

This analysis followed a 6-step validation workflow:

1. **STEP 0**: Requirement Filtering (excluded documentation-only items)
2. **STEP 1**: Extract Requirements (scanned spec.md for FR-XXX, CA-XXX, AR-XXX)
3. **STEP 2**: Check Implementation (searched implementation files with exact keywords)
4. **STEP 3**: Gap List (created detailed evidence for each ❌ or ⚠️ item)
5. **STEP 4**: Anti-False-Positive Check (verified each gap against 7-point checklist)
6. **STEP 5**: Validation Rubric (scored each gap 0-10 based on evidence quality)

**Evidence Quality**: All validated gaps include:

- ✅ Exact spec.md line numbers with FR-XXX references
- ✅ Exact tasks.md task IDs or plan.md references
- ✅ Complete list of files searched with keywords
- ✅ Exact search results ("FOUND at line X" or "NOT FOUND")
- ✅ Contract verification status
- ✅ Priority justification with impact analysis

---

## For Gap Analysis Tools (`/analyze-brief-gpt-5-mini` / `/analyze-brief-gpt-4-1`)

**When validating future implementation**:

1. Check this document FIRST before flagging gaps
2. Gaps marked "NOT IMPLEMENTED" with evidence are KNOWN and TRACKED
3. Gaps marked "FALSE POSITIVE" should NOT be flagged
4. Only flag NEW gaps not listed here
5. Reference exact FR-XXX and task IDs when validating

**Last Validation**: 2026-01-10
**Next Validation**: After P0 remediation (GAP-1, GAP-2, GAP-3)

---

**END OF REMEDIATION TRACKER**
