# E01 Remediation: FR-174a Two-way Binding + allowAllClosed Interaction

**Finding ID**: E01
**Severity**: MEDIUM
**Category**: CoverageGap
**Analysis Date**: 2026-01-16

---

## Executive Summary

**Status**: PARTIAL IMPLEMENTATION - Functional logic complete, diagnostic reporting missing

FR-174a requires two behaviors when `[(expanded)]` two-way binding attempts to close the last open item while `allowAllClosed=false`:

1. ✅ **IMPLEMENTED**: Coerce the binding to preserve at least one open item
2. ❌ **MISSING**: Call `ErrorHandler.handleError()` to notify developers of the constraint violation

The accordion correctly re-opens a panel to maintain the "at least one open" constraint, but does so silently without developer notification.

---

## Requirement Analysis

### FR-174a (spec.md:446-448)

> When `[(expanded)]` two-way binding attempts to close the last open item while `allowAllClosed` is `false`, the component MUST coerce the binding to preserve at least one open item: it MUST ignore the binding that would close the last item **and call `ErrorHandler.handleError()` notifying the developer of the constraint**. The two-way binding value should reflect the actual state (i.e., remain `true` in the model) after coercion.

**Key Requirements**:

- ✅ Preserve at least one open item (coerce binding)
- ❌ Call `ErrorHandler.handleError()` with diagnostic
- ✅ Two-way binding reflects actual state (model stays `true`)

---

## Current Implementation

**File**: `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`
**Lines**: 268-290

```typescript
// Handle allowAllClosed enforcement (skip if accordion is disabled)
if (!this.allowAllClosed() && !this.disabled() && expandedItems.length === 0) {
  // Re-open the last expanded panel, or the first non-disabled panel
  const panelToOpen = this.#lastExpandedPanelId ? items.find((item) => item.panelId() === this.#lastExpandedPanelId && !item.disabled()) : items.find((item) => !item.disabled());

  if (panelToOpen) {
    // Use queueMicrotask to write signal outside effect context
    queueMicrotask(() => {
      panelToOpen.expanded.set(true);
    });
    return;
  }
}
```

**What's Working**:

- Detects when all panels are closed despite `allowAllClosed=false`
- Re-opens the last expanded panel (or first non-disabled panel)
- Uses `queueMicrotask` to avoid signal write-during-effect errors
- Two-way binding automatically reflects actual state via Angular's model signal

**What's Missing**:

- No `ErrorHandler.handleError()` call to inform developers why their binding was coerced
- Silent behavior makes debugging difficult for library consumers

---

## Remediation Plan

### Required Code Change

**Location**: `accordion.ts:283-288`

**Before**:

```typescript
if (panelToOpen) {
  // Use queueMicrotask to write signal outside effect context
  queueMicrotask(() => {
    panelToOpen.expanded.set(true);
  });
  return;
}
```

**After**:

```typescript
if (panelToOpen) {
  // Use queueMicrotask to write signal outside effect context
  queueMicrotask(() => {
    panelToOpen.expanded.set(true);

    // FR-174a: Notify developer of binding coercion
    this.#errorHandler.handleError(new Error(`NfsAccordion: Two-way binding coercion - prevented closing last open panel ` + `(panelId: "${panelToOpen.panelId()}") because allowAllClosed=false. ` + `The [(expanded)] model will reflect the actual state (true).`));
  });
  return;
}
```

### Task Updates

**File**: `specs/002-accordion-component/tasks.md`

**Current Status**:

```markdown
- [ ] T193 [US5] Implement binding coercion in NfsAccordionItem.expanded: ...
  - **Status**: PARTIAL - Coercion logic exists in accordion.ts:268-290 (re-opens last panel), but missing ErrorHandler.handleError() call required by FR-174a to notify developers of constraint violation
```

**After Completion**:

```markdown
- [x] T193 [US5] Implement binding coercion in NfsAccordionItem.expanded: ...
  - **Status**: COMPLETE - Coercion logic in accordion.ts:268-290 + ErrorHandler diagnostic (FR-174a)
```

---

## Verification Checklist

- [ ] Add `ErrorHandler.handleError()` call in `accordion.ts:283-288`
- [ ] Error message includes:
  - [ ] Context: "Two-way binding coercion"
  - [ ] Reason: "allowAllClosed=false"
  - [ ] Panel ID that was re-opened
  - [ ] Guidance: "[(expanded)] model reflects actual state (true)"
- [ ] Test error is logged (browser console or test spy)
- [ ] Verify coercion still works correctly (panel re-opens)
- [ ] Mark T193 complete `[x]` in tasks.md
- [ ] Update gap-analysis-report.md to reflect completion

---

## Related Work

### Task T192 (Storybook Test)

```markdown
- [ ] T192 [P] [US5] Add Storybook play test to AllowAllClosed story:
      set allowAllClosed=false, bind [(expanded)] on last open item,
      set model to false externally, verify binding coerces to true
      AND ErrorHandler.handleError() called with coercion diagnostic (FR-174a)
```

**Note**: T192 provides the acceptance test for T193. After implementing the ErrorHandler call, create this Storybook test to verify the behavior.

---

## Impact Assessment

**Risk**: LOW
**Effort**: 5 minutes (implementation) + 2 minutes (testing)
**Breaking Change**: No (adds diagnostic, doesn't change behavior)

**Developer Experience Impact**:

- **Before**: Silent coercion confuses developers ("Why isn't my binding working?")
- **After**: Clear error message explains constraint and actual state

---

## Success Criteria

1. When `allowAllClosed=false` and user attempts to close last panel via `[(expanded)]="false"`:
   - Panel remains open (existing behavior - ✅)
   - `ErrorHandler.handleError()` is called with diagnostic message (NEW - ❌)
   - Error message is visible in browser console
   - Error message includes panelId and constraint explanation

2. Task T193 marked complete `[x]` in tasks.md

3. Finding E01 resolved in gap-analysis-report.md

---

## References

- **Spec**: spec.md:446-448 (FR-174a)
- **Plan**: plan.md:202-204 (FR-174a implementation notes)
- **Tasks**: tasks.md:274 (T193), tasks.md:266 (T192)
- **Implementation**: accordion.ts:268-290
- **Data Model**: data-model.md:317 (NfsAccordionItem error reporting)
- **Checklist**: checklists/comprehensive-review.md:454 (CHK174)
