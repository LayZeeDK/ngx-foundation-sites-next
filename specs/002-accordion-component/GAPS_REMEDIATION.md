# Accordion Implementation Gaps - Remediation Tracker

**Last Validated**: 2026-01-11
**Validation Method**: Cross-artifact analysis (spec.md vs implementation vs contracts) + GPT-4.1 incremental analysis
**Source**: gap-analysis-report.md (2026-01-11)
**Status**: Remediation in progress

---

## Purpose

This document tracks validated implementation gaps between the accordion specification (spec.md, plan.md, tasks.md, contracts/) and the actual implementation. It serves as the single source of truth for gap analysis tools (`/analyze-report-gaps-gpt-5-mini`, `/analyze-report-gaps-gpt-4-1`) to prevent re-flagging documented gaps.

---

## P0 - BLOCKING (3 gaps, 32 min total) 🚨

### GAP-1: Foundation API Methods Missing on Item

**Status**: NOT IMPLEMENTED
**Validation Score**: 10/10
**Evidence**:

- **Spec**: FR-075 at spec.md:530 — "MUST expose Foundation-equivalent methods: `toggle()`, `down()`, `up()`"
- **Tasks**: T140-T142 at tasks.md:477-479
- **Contract**: `NfsAccordionItemApi` interface at contracts/accordion-api.ts:146-166 defines all three methods
- **Implementation**: Grep search `down\(\)|up\(\)|toggle\(\)` in accordion-item-def.ts (lines 1-58) → **NO MATCHES**

**Impact**: Breaks Foundation JavaScript→Angular migration path. Developers cannot programmatically expand/collapse panels.

**Fix Location**: `packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts`

```typescript
// Add these methods to NfsAccordionItemDef class:

/**
 * Expand this panel.
 * @foundation API Parity: Equivalent to Foundation's `.down($target)` method.
 */
down(): void {
  if (!this.disabled()) {
    this.expanded.set(true);
  }
}

/**
 * Collapse this panel.
 * @foundation API Parity: Equivalent to Foundation's `.up($target)` method.
 */
up(): void {
  if (!this.disabled()) {
    this.expanded.set(false);
  }
}

/**
 * Toggle expansion state.
 * @foundation API Parity: Equivalent to Foundation's `.toggle($target)` method.
 */
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
- **Tasks**: T143-T148 at tasks.md:480-485
- **Contract**: `NfsAccordionApi` interface at contracts/accordion-api.ts:98-116 defines both outputs
- **Implementation**: Grep search `readonly (down|up)\s*=\s*output` in accordion directory → **NO MATCHES**

**Impact**: Consumers cannot react to panel state changes. Essential for analytics and state management integration.

**Fix Location**: `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
import { output } from '@angular/core';
import type { AccordionItemChangeEvent } from '../contracts/accordion-api';

// Add to NfsAccordion class:

/**
 * Emitted when a panel is opened.
 * @foundation API Parity: Equivalent to Foundation's `down.zf.accordion` event.
 */
readonly down = output<AccordionItemChangeEvent>();

/**
 * Emitted when a panel is closed.
 * @foundation API Parity: Equivalent to Foundation's `up.zf.accordion` event.
 */
readonly up = output<AccordionItemChangeEvent>();

// In the expansion tracking effect (around line 140), emit events:
// When item expands: this.down.emit({ itemId: expandedPanelId, expanded: true });
// When item collapses: this.up.emit({ itemId: collapsedPanelId, expanded: false });
```

**Estimated Time**: 20 minutes
**Violates**: FR-076, CA-010 (constitutional requirement)

---

### GAP-3: Input Naming Inconsistency (multiExpandable vs multiExpand)

**Status**: IMPLEMENTED AS `multiExpandable` (should be `multiExpand`)
**Validation Score**: 10/10
**Evidence**:

- **Spec**: FR-014 at spec.md:289 — "MUST accept a `multiExpand` signal input"
- **Tasks**: T021 at tasks.md:165 with warning note
- **Contract**: `NfsAccordionApi` interface at contracts/accordion-api.ts:66 — `readonly multiExpand: InputSignal<boolean>;`
- **Implementation** (confirmed via Grep):
  - accordion.ts:51: `readonly multiExpandable = input(false);` ❌
  - accordion.html:12: `[multiExpandable]="multiExpandable()"` ❌
  - accordion.spec.ts:22,72,206,242,340,523,755,776,799,800,816: uses `multiExpandable` ❌
  - accordion.stories.ts:109,280,631: uses `multiExpandable` ❌

**Impact**: Breaking API inconsistency. Violates Foundation naming alignment (CA-007). API surface doesn't match specification or contracts.

**Fix**: Global rename in 4 files using replace-all:

| File | Search | Replace |
|------|--------|---------|
| accordion.ts | `multiExpandable` | `multiExpand` |
| accordion.html | `multiExpandable` | `multiExpand` |
| accordion.spec.ts | `multiExpandable` | `multiExpand` |
| accordion.stories.ts | `multiExpandable` | `multiExpand` |

**Estimated Time**: 2 minutes
**Violates**: FR-014, CA-007
**Breaking Change**: YES - Document in CHANGELOG.md

---

## P1 - IMPORTANT (3 gaps, 135 min total) ⚠️

### GAP-4: titleHeadingLevel Input Not Implemented

**Status**: NOT IMPLEMENTED
**Validation Score**: 9/10
**Evidence**:

- **Spec**: FR-016 at spec.md:291 — Lists `titleHeadingLevel` among required inputs
- **Tasks**: T162-T164 at tasks.md:532-536
- **Contract**: `NfsAccordionApi` interface at contracts/accordion-api.ts:93 — `readonly titleHeadingLevel: InputSignal<AccordionHeadingLevel | null>;`
- **ARIA Doc**: accordion-aria.md lines 75-106 describes optional heading wrapper requirement
- **Implementation**: Grep search `titleHeadingLevel` in accordion directory → **NO MATCHES**

**Impact**: Screen reader users cannot navigate accordion using heading shortcuts (H key). Limits WCAG 1.3.1 compliance for document outline.

**Fix Location**: `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts` + `accordion.html`

```typescript
// In accordion.ts, add input:
/**
 * Heading level for accordion titles.
 * When set, wraps trigger buttons in <div role="heading" aria-level="N">.
 */
readonly titleHeadingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | null>(null);

// In accordion.html, conditionally wrap the trigger:
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
- **Tasks**: References at tasks.md T057c, T131-T133, T191, T193
- **Plan**: Implementation notes at plan.md:133-176 describe structured error reporting
- **Implementation**: Grep search `ErrorHandler` in accordion directory → **NO MATCHES**

**Impact**: Silent failures for duplicate IDs, missing titles, invalid inputs, and deep link errors. Makes debugging difficult for consumers.

**Fix Location**: `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
import { ErrorHandler, inject } from '@angular/core';

// In NfsAccordion class:
readonly #errorHandler = inject(ErrorHandler);

// Validation Point 1: FR-017a (duplicate panelId)
// In registerItem() or item registration logic:
if (duplicateDetected) {
  this.#errorHandler.handleError(
    new Error(`Duplicate panelId "${id}" detected in accordion ${accordionInstanceId ?? '<unnamed>'}. Conflicting items at indexes: [${indexes.join(', ')}]. Using first registered item.`)
  );
}

// Validation Point 2: FR-067b (deep link to non-existent panel)
// In #handleInitialHash():
if (!matchingItem && hashPanelId) {
  this.#errorHandler.handleError(
    new Error(`DeepLinkNotFound: Panel with id "${hashPanelId}" not found in accordion.`)
  );
}

// Validation Point 3-5: FR-026a (missing title), FR-089a (rapid toggle), FR-110a (input validation)
// Similar patterns at respective validation points
```

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
- **Implementation**: Grep search `FoundationApiParity|item\.down\(|item\.up\(|item\.toggle\(` in accordion.stories.ts → **NO MATCHES**

**Impact**: No test coverage for Foundation API methods. Breaking changes could be introduced without detection.

**Fix Location**: Create new file `packages/ngx-foundation-sites/src/lib/accordion/foundation-api-parity.stories.ts` or add to existing stories

```typescript
// packages/ngx-foundation-sites/src/lib/accordion/foundation-api-parity.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within, userEvent, waitFor } from '@storybook/test';
import { NfsAccordion } from './accordion';

export default {
  title: 'Components/Accordion/Foundation API Parity',
  component: NfsAccordion,
} as Meta<NfsAccordion>;

type Story = StoryObj<NfsAccordion>;

export const ProgrammaticControl: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Get item reference via viewChild or query
    // Test down() method
    // item.down();
    // await waitFor(() => expect(panel).toHaveAttribute('data-expanded', 'true'));

    // Test up() method
    // item.up();
    // await waitFor(() => expect(panel).toHaveAttribute('data-expanded', 'false'));

    // Test toggle() method
    // item.toggle();
    // await waitFor(() => expect(panel).toHaveAttribute('data-expanded', 'true'));
  }
};

export const OutputEvents: Story = {
  play: async ({ canvasElement, args }) => {
    // Verify (down) and (up) outputs emit with correct payloads
  }
};
```

**Estimated Time**: 45 minutes
**Violates**: Testing requirements for FR-075, FR-076

---

## P2 - POLISH (1 gap, 15 min total) 🔧

### GAP-7: Missing `announce` Input

**Status**: TRACKED AS T196-T199 (Phase 5, US3) - Meta-task
**Validation Score**: 7/10 (references plan.md not spec.md directly)
**Evidence**:

- **Plan**: AR-027a at plan.md:155 describes `announce` input requirement
- **Tasks**: T196-T199 at tasks.md:258-260 track implementation
- **Tasks Note**: Line 637-641 explicitly states "T-AC-002 _(meta-task)_ — resolved by T196-T199"

**Resolution**: This is NOT a standalone gap—it's tracked via existing tasks T196-T199 in Phase 5 (US3: Screen Reader Compatibility).

**Action**: Track via T196-T199 execution status. No separate remediation entry needed.

---

### GAP-8: SSR Error Handling Missing in afterNextRender Blocks

**Status**: PARTIAL (uses afterNextRender, but no try/catch)
**Validation Score**: 6/10
**Evidence**:

- **Spec**: FR-062a at plan.md:179-180 — "wrap hydration steps in guarded try/catch"
- **Implementation** (confirmed via Grep in accordion.ts):
  - Line 108: `afterNextRender(() => { this.#styleLoader.load(...) });` — **UNGUARDED** ❌
  - Line 118: `afterNextRender(() => { if (this.deepLink()) { ... } });` — **UNGUARDED** ❌

**Impact**: SSR hydration failures crash silently. Rare but catastrophic when they occur.

**Fix Location**: `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`

```typescript
// Wrap each afterNextRender block:
afterNextRender(() => {
  try {
    this.#styleLoader.load('accordion', '/nfs-accordion.css');
  } catch (error) {
    this.#errorHandler.handleError(error);
  }
});

afterNextRender(() => {
  try {
    if (this.deepLink()) {
      this.#handleInitialHash();
      this.#setupHashChangeListener();
    }
    this.#initialHashProcessed = true;
  } catch (error) {
    this.#errorHandler.handleError(error);
  }
});
```

**Estimated Time**: 15 minutes (2 blocks × ~7 min each)
**Violates**: FR-062a

---

## False Positives (Working as Designed) ✅

The following were detected by gap analysis but are **NOT GAPS**:

### 1. Animation hooks missing

- **Status**: CSS-only per spec.md Goals/Non-Goals:575-577
- **Reason**: "Implementing animation/transition effects (Foundation CSS handles visual transitions via CSS; Angular component only manages state and classes)"
- **Evidence**: Foundation CSS handles all transitions via Sass variables (`$accordion-content-transition`). No Angular animation API is required.

### 2. ARIA live region always present

- **Status**: Opt-in via `announce` input (AR-027a, default: false)
- **Reason**: Base ARIA compliance uses `aria-expanded` on trigger; live region is an enhancement for platforms with inconsistent announcements
- **Evidence**: AR-027a at spec.md:502-504 specifies "default: `false`" to avoid duplicate/noisy announcements

### 3. @defer lifecycle not explicit

- **Status**: Framework-provided via Angular's native @defer pattern
- **Reason**: Implementation correctly uses template-directive composition with lazy content registration
- **Evidence**: FR-028 at spec.md:344 states "lifecycle mirrors @defer retention behavior"

### 4. Foundation CSS classes missing

- **Status**: Applied correctly via @angular/aria directives
- **Reason**: AccordionTrigger/AccordionPanel add required classes automatically per Angular integration
- **Evidence**: All required classes (FR-029 through FR-035) present via @angular/aria primitives

### 5. ARIA edge cases not implemented

- **Status**: Delegated to @angular/aria primitives
- **Reason**: AccordionTrigger/AccordionPanel handle aria-controls, aria-expanded, aria-labelledby automatically per Angular framework standards
- **Evidence**: Implementation uses `@angular/aria/accordion` imports (accordion.ts:20-24)

### 6. Custom content projection issues

- **Status**: Architecturally prevented by template-directive design
- **Reason**: Template-directive architecture (`ng-template[nfsAccordionItem]`, `ng-template[nfsAccordionHeader]`) enforces one-header-one-body at compile time
- **Evidence**: accordion-item-def.ts uses `headerDef` and `lazyContentDef` signals for explicit registration

---

## Remediation Roadmap

### Phase 1: Critical (P0) - 32 minutes

Execute in this order to minimize breaking changes:

1. **GAP-3** (2 min): Rename `multiExpandable` → `multiExpand` globally
   - Mark as BREAKING CHANGE in CHANGELOG.md
2. **GAP-1** (10 min): Add `down()`, `up()`, `toggle()` methods to NfsAccordionItemDef
3. **GAP-2** (20 min): Add `down` and `up` outputs to NfsAccordion

### Phase 2: Important (P1) - 135 minutes

4. **GAP-4** (30 min): Implement `titleHeadingLevel` input with template logic
5. **GAP-5** (60 min): Add ErrorHandler diagnostics for 5 validation points
6. **GAP-6** (45 min): Create FoundationApiParity Storybook story

### Phase 3: Polish (P2) - 15 minutes

7. **GAP-8** (15 min): Add try/catch to afterNextRender blocks
8. ~~**GAP-7**~~ → Tracked via T196-T199 (not a remediation item)

---

## Total Fix Estimate

| Priority | Gap Count | Time |
|----------|-----------|------|
| P0 (Blocking) | 3 | 32 min |
| P0 + P1 | 6 | 167 min (~2.8 hours) |
| P0 + P1 + P2 | 7 | 182 min (~3 hours) |

---

## Validation Methodology

This analysis followed a 6-step validation workflow:

1. **STEP 0**: Requirement Filtering (excluded documentation-only items)
2. **STEP 0.5**: Load Known Gaps Registry (checked existing GAPS_REMEDIATION.md)
3. **STEP 1**: Extract Requirements (scanned spec.md for FR-XXX, CA-XXX, AR-XXX)
4. **STEP 2**: Check Implementation (searched implementation files with exact keywords via Grep)
5. **STEP 3**: Gap List with Registry Check (matched potential gaps against known gaps)
6. **STEP 4**: Anti-False-Positive Check (verified each gap against 7-point checklist)
7. **STEP 5**: Validation Rubric (scored each gap 0-10 based on evidence quality)
8. **STEP 6**: Report Generation (created actionable remediation documentation)

**Evidence Quality**: All validated gaps include:

- ✅ Exact spec.md line numbers with FR-XXX references
- ✅ Exact tasks.md task IDs
- ✅ Contract verification (contracts/accordion-api.ts)
- ✅ Grep search results ("FOUND at line X" or "NO MATCHES")
- ✅ Priority justification with impact analysis
- ✅ Exact fix locations and code snippets

---

## For Gap Analysis Tools (`/analyze-report-gaps-gpt-5-mini` / `/analyze-report-gaps-gpt-4-1`)

**When validating future implementation**:

1. Check this document FIRST before flagging gaps
2. Gaps marked "NOT IMPLEMENTED" with evidence are KNOWN and TRACKED
3. Gaps marked "FALSE POSITIVE" or "TRACKED AS T###" should NOT be flagged
4. Only flag NEW gaps not listed here
5. Reference exact FR-XXX and task IDs when validating
6. Compare keyword signatures against this document's evidence chains

**Known Gap Keywords Registry**:

| Gap ID | Keywords |
|--------|----------|
| GAP-1 | `down()`, `up()`, `toggle()`, methods, NfsAccordionItemDef |
| GAP-2 | `down`, `up`, outputs, events, NfsAccordion |
| GAP-3 | `multiExpandable`, `multiExpand`, naming, input |
| GAP-4 | `titleHeadingLevel`, heading, ARIA, level |
| GAP-5 | `ErrorHandler`, `handleError`, diagnostics, validation |
| GAP-6 | `FoundationApiParity`, story, Storybook, tests |
| GAP-8 | `afterNextRender`, try/catch, SSR, hydration |

**Last Validation**: 2026-01-11
**Validation Source**: GPT-4.1 incremental analysis (100% match rate with known gaps)
**Next Validation**: After P0 remediation (GAP-1, GAP-2, GAP-3)

---

**END OF REMEDIATION TRACKER**
