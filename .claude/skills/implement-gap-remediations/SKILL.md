---
name: implement-gap-remediations
description: Executes gap fixes from REMEDIATION_CHECKLIST.md with systematic verification and progress tracking. Use after /analyze-gaps creates the remediation checklist. Optimized for Sonnet 4.5's implementation capabilities.
---

# Gap Remediation Implementation Executor

Systematically executes gap fixes from REMEDIATION_CHECKLIST.md with verification and tracking.

## When to Use This Skill

- **After** `/analyze-gaps` creates REMEDIATION_CHECKLIST.md
- When ready to implement P0/P1/P2 gap fixes
- For systematic, verified implementation with progress tracking

## Prerequisites

1. `REMEDIATION_CHECKLIST.md` exists in `specs/<feature>/`
2. `GAPS_REMEDIATION.md` exists in `specs/<feature>/` (for status updates)
3. Implementation files exist and are accessible
4. Tests can be run locally

## Goal

Execute gap fixes from REMEDIATION_CHECKLIST.md systematically, verify each fix, update tracking documents, and commit in logical increments.

## Workflow

### Step 0: Initialize

1. **Locate checklist**:
   ```bash
   ls specs/*/REMEDIATION_CHECKLIST.md
   ```

2. **Read REMEDIATION_CHECKLIST.md** to understand:
   - Total gaps to fix
   - Priority breakdown (P0/P1/P2)
   - Estimated time per gap
   - Verification requirements

3. **Read GAPS_REMEDIATION.md** to get:
   - Gap statuses (NOT IMPLEMENTED vs PARTIAL vs TRACKED AS)
   - Evidence locations
   - Fix code snippets

4. **Ask user for scope**:
   ```
   Which gaps should I implement?
   1. All P0 (BLOCKING) - 32 min
   2. P0 + P1 (IMPORTANT) - 167 min
   3. P0 + P1 + P2 (POLISH) - 182 min
   4. Specific gaps (e.g., GAP-1, GAP-3)
   ```

### Step 1: Plan Execution

Create TODO list with TodoWrite:

```markdown
- [ ] Setup: Verify test environment
- [ ] GAP-3: Rename multiExpandable → multiExpand (2 min) - P0
- [ ] GAP-1: Add Foundation API methods (10 min) - P0
- [ ] GAP-2: Add Foundation API outputs (20 min) - P0
- [ ] Verify: Run full test suite
- [ ] Update: Mark gaps as FIXED in GAPS_REMEDIATION.md
- [ ] Commit: P0 fixes with conventional format
```

### Step 2: Execute Each Gap (Systematic Approach)

For each gap in selected scope:

#### 2.1: Mark In Progress
```
TodoWrite: Mark current gap as in_progress
```

#### 2.2: Read Checklist Steps
Load gap section from REMEDIATION_CHECKLIST.md

#### 2.3: Execute Steps Sequentially

For each step in the checklist:

**File edits:**
```typescript
// Use Edit tool for exact before/after replacements
// Example: GAP-3 Step 1
Edit(
  file_path: "packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts",
  old_string: "readonly multiExpandable = input(false);",
  new_string: "readonly multiExpand = input(false);"
)
```

**Code additions:**
```typescript
// Use Read to understand context, then Edit to add
// Example: GAP-1 Step 1 - Add down() method
Read("packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts")
// Find insertion point (end of class)
Edit(
  file_path: "...",
  old_string: "}", // Last closing brace
  new_string: `
  /**
   * Expands this accordion panel (Foundation API: .down($target))
   * @public
   */
  down(): void {
    if (!this.disabled()) {
      this.expanded.set(true);
    }
  }
}`
)
```

**Verification commands:**
```bash
# Run after each step that modifies code
npm run test -- accordion
npm run lint
```

#### 2.4: Verify Step Completion

After each step:
1. **Read modified file** to confirm change applied
2. **Run verification command** from checklist
3. **Check test output** - if failed, fix before continuing
4. **Update TODO** - Check off completed step

#### 2.5: Mark Gap Complete

```
TodoWrite: Mark gap as completed
```

### Step 3: Post-Implementation Verification

After all gaps in scope are complete:

```bash
# Full test suite
npm run test

# Linting
npm run lint

# Build
npm run build

# Storybook tests (if applicable)
npm run test-storybook
```

If any failures:
- Fix issues
- Re-run verification
- Do NOT proceed to Step 4

### Step 4: Update Tracking Documents

#### 4.1: Update GAPS_REMEDIATION.md

For each completed gap:

```typescript
Edit(
  file_path: "specs/<feature>/GAPS_REMEDIATION.md",
  old_string: "**Status**: NOT IMPLEMENTED",
  new_string: "**Status**: ✅ FIXED (2026-01-10)"
)
```

#### 4.2: Update REMEDIATION_CHECKLIST.md

Add completion notes:

```typescript
Edit(
  file_path: "specs/<feature>/REMEDIATION_CHECKLIST.md",
  old_string: "**Total Estimated Time**: 182 minutes (~3 hours)\n**Actual Time**: _(fill in after completion)_",
  new_string: "**Total Estimated Time**: 182 minutes (~3 hours)\n**Actual Time**: [calculated actual time] minutes\n\n**Completion Date**: 2026-01-10\n**Gaps Fixed**: GAP-1, GAP-2, GAP-3"
)
```

### Step 5: Commit Changes

Create **one commit per priority level** (or per gap for P0):

#### For P0 (BLOCKING) - Breaking Change Example:

```bash
git add packages/ngx-foundation-sites/src/lib/accordion/

git commit -m "fix(accordion): resolve P0 gaps - Foundation API parity

Implement P0 gap remediations from REMEDIATION_CHECKLIST.md:

- GAP-3: Rename multiExpandable → multiExpand (BREAKING CHANGE)
  - Update accordion.component.ts, .html, .spec.ts, .stories.ts
  - API now matches Foundation naming (FR-014, CA-007)

- GAP-1: Add Foundation API methods (down, up, toggle)
  - Implement in accordion-item-def.ts
  - Enables programmatic control per FR-075, CA-009

- GAP-2: Add Foundation API outputs ((down), (up))
  - Implement in accordion.component.ts
  - Enables event notification per FR-076, CA-010

BREAKING CHANGES:
- **accordion**: Renamed input \`multiExpandable\` → \`multiExpand\`
  - Migration: Replace [multiExpandable] with [multiExpand] in templates

Fixes: GAP-1, GAP-2, GAP-3
Time: 32 minutes (estimated: 32 minutes)
Status: Updated in GAPS_REMEDIATION.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### For P1 (IMPORTANT):

```bash
git commit -m "feat(accordion): resolve P1 gaps - accessibility and diagnostics

Implement P1 gap remediations:

- GAP-4: Add titleHeadingLevel input (30 min)
  - Enables ARIA document outline navigation
  - Fixes WCAG 1.3.1 compliance

- GAP-5: Add ErrorHandler diagnostics (60 min)
  - FR-017a: Duplicate panelId detection
  - FR-026a: Missing title detection
  - FR-067b: Deep link error handling
  - FR-089a: Rapid toggle errors
  - FR-110a: Input validation

- GAP-6: Add Foundation API Storybook tests (45 min)
  - FoundationApiParity story with play functions
  - Tests down(), up(), toggle() methods
  - Tests (down), (up) event payloads

Fixes: GAP-4, GAP-5, GAP-6
Time: 135 minutes (estimated: 135 minutes)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Special Handling

### Breaking Changes (GAP-3)

**Before implementing:**
1. Ask user to confirm breaking change
2. Ensure CHANGELOG.md is updated
3. Document migration path
4. Consider deprecation period

**Implementation:**
1. Do global search/replace across all files
2. Update tests, stories, documentation
3. Verify with `grep -r "multiExpandable"` returns nothing

### Test Failures

**If tests fail during verification:**
1. **Stop immediately** - do NOT continue to next gap
2. **Read test output** to understand failure
3. **Fix the issue** - adjust implementation
4. **Re-run tests** - must pass before proceeding
5. **Update TODO** - mark step as completed only after passing

### ErrorHandler Diagnostics (GAP-5)

**Complex implementation requires:**
1. Inject ErrorHandler in constructor
2. Add registry/tracking structures
3. Implement validation at multiple points
4. Add unit tests for each validation
5. Verify error messages match spec format

## Progress Tracking

Use **TodoWrite** throughout:

```typescript
// At start
TodoWrite([
  { content: "Setup verification", status: "pending", activeForm: "Setting up verification" },
  { content: "Implement GAP-3", status: "pending", activeForm: "Implementing GAP-3" },
  { content: "Implement GAP-1", status: "pending", activeForm: "Implementing GAP-1" },
  // ...
])

// When starting a gap
TodoWrite([
  { content: "Setup verification", status: "completed", activeForm: "Setting up verification" },
  { content: "Implement GAP-3", status: "in_progress", activeForm: "Implementing GAP-3" },
  { content: "Implement GAP-1", status: "pending", activeForm: "Implementing GAP-1" },
])

// After completing a gap
TodoWrite([
  { content: "Setup verification", status: "completed", activeForm: "Setting up verification" },
  { content: "Implement GAP-3", status: "completed", activeForm: "Implementing GAP-3" },
  { content: "Implement GAP-1", status: "in_progress", activeForm: "Implementing GAP-1" },
])
```

## Output Format

### Conversational Updates

Provide progress updates as you work:

```markdown
Starting gap remediation implementation...

✅ Loaded REMEDIATION_CHECKLIST.md - 7 gaps total (3 P0, 3 P1, 1 P2)
✅ User selected: P0 gaps only (32 min estimated)

📋 Implementation Plan:
1. GAP-3: Rename multiExpandable → multiExpand (2 min, BREAKING)
2. GAP-1: Add Foundation API methods (10 min)
3. GAP-2: Add Foundation API outputs (20 min)

---

🔧 Starting GAP-3: Rename multiExpandable → multiExpand

Step 1/6: Update accordion.component.ts line 51
✅ Changed `multiExpandable` → `multiExpand`

Step 2/6: Update accordion.component.html line 12
✅ Updated template binding

Step 3/6: Update accordion.component.spec.ts
✅ Replaced all 8 occurrences

Step 4/6: Update accordion.stories.ts
✅ Updated story controls

Step 5/6: Run tests
✅ All tests passing

Step 6/6: Update CHANGELOG.md
✅ Added breaking change notice

✅ GAP-3 complete (actual: 2 min)

---

🔧 Starting GAP-1: Add Foundation API methods

Step 1/5: Add down() method
✅ Method added to accordion-item-def.ts

Step 2/5: Add up() method
✅ Method added

Step 3/5: Add toggle() method
✅ Method added

Step 4/5: Export methods in index.ts
✅ Public API updated

Step 5/5: Add unit tests
✅ 3 tests added and passing

✅ GAP-1 complete (actual: 10 min)

---

[Continue for GAP-2...]

---

🎉 Implementation Complete!

**Summary**:
- Gaps fixed: 3 (GAP-1, GAP-2, GAP-3)
- Priority: P0 (BLOCKING)
- Estimated time: 32 minutes
- Actual time: 32 minutes
- Tests: ✅ All passing
- Commits: 1 (P0 fixes)

**Updated Documents**:
- ✅ GAPS_REMEDIATION.md (3 gaps marked as FIXED)
- ✅ REMEDIATION_CHECKLIST.md (completion notes added)
- ✅ CHANGELOG.md (breaking change documented)

**Next Steps**:
Run `/analyze-brief` to verify no new gaps were introduced.
```

## Error Handling

### Compilation Errors

```
❌ Compilation failed after Step 2

Error: Type 'boolean' is not assignable to type 'string'
Location: accordion.component.ts:51

Fix: Reverting Step 2 and adjusting type...
✅ Fixed - rerunning tests
```

### Test Failures

```
❌ Tests failed: 2 failing

Failure 1: Expected 'multiExpand' but got 'multiExpandable'
Location: accordion.spec.ts:45

Fix: Found missed occurrence in test setup...
✅ Fixed - all tests passing
```

### Verification Failures

```
❌ Verification failed: grep found 'multiExpandable'

Location: accordion.stories.ts:128 (in comment)

Fix: Updated comment reference...
✅ Verification passing
```

## Best Practices

### For Claude Sonnet 4.5

1. **Read before editing**: Always Read files to understand context
2. **Exact replacements**: Use exact old_string from checklist
3. **Verify immediately**: Run tests after each code change
4. **Track progress**: Update TodoWrite after each step
5. **Commit incrementally**: One commit per priority level
6. **Handle failures gracefully**: Stop and fix before continuing

### Code Quality

1. **Preserve formatting**: Match existing code style
2. **Keep JSDoc**: Include all documentation from checklist
3. **Test coverage**: Add unit tests per checklist requirements
4. **Type safety**: Ensure TypeScript compilation succeeds
5. **Breaking changes**: Always document in CHANGELOG.md

### Verification Rigor

1. **Run tests after every change**
2. **Read test output** - don't assume success
3. **Verify grep commands** - ensure old patterns gone
4. **Check build** - compilation must succeed
5. **Review diffs** - confirm changes match intent

## Success Criteria

After execution:

✅ **All selected gaps implemented** with exact code from checklist
✅ **All tests passing** (npm run test)
✅ **Linting clean** (npm run lint)
✅ **Build successful** (npm run build)
✅ **GAPS_REMEDIATION.md updated** (status → FIXED)
✅ **REMEDIATION_CHECKLIST.md updated** (completion notes)
✅ **CHANGELOG.md updated** (if breaking changes)
✅ **Git commits created** (conventional format)
✅ **TodoWrite reflects completion** (all items checked)

## Example Usage

```bash
# In Claude Code CLI
/implement-gap-remediations

# Skill prompts:
"Which gaps should I implement?"
> 1. All P0 (BLOCKING) - 32 min

# Skill executes:
# - Reads REMEDIATION_CHECKLIST.md
# - Creates TODO list
# - Implements GAP-3, GAP-1, GAP-2
# - Runs tests after each
# - Updates tracking documents
# - Creates git commit
# - Reports completion

# Output:
"🎉 Implementation complete! 3 P0 gaps fixed in 32 minutes."
```

## Related Commands

- `/analyze-brief` - Generates initial gap report (run before /analyze-gaps)
- `/analyze-gaps` - Creates REMEDIATION_CHECKLIST.md (run before this command)
- `/speckit.implement` - Alternative implementation command (less specialized)

## Notes

- This skill is **write-heavy** - modifies implementation files extensively
- Designed for **Sonnet 4.5's precise editing** + verification capabilities
- Uses **TodoWrite for progress tracking** (visible to user)
- **Stops on test failures** - ensures quality at each step
- **Commits incrementally** - one per priority level for clean history
