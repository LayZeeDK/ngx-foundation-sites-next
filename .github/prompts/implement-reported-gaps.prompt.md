---
description: Executes gap fixes from REMEDIATION_CHECKLIST.md with systematic verification and progress tracking. Use after /analyze-prepare-reported-gaps-for-implementation creates the remediation checklist.
agent: implement-reported-gaps
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Goal

Execute gap fixes from REMEDIATION_CHECKLIST.md systematically, verify each fix with tests, update tracking documents, and commit in logical increments.

---

## Prerequisites

Before running this agent:

1. `REMEDIATION_CHECKLIST.md` exists in `specs/<feature>/`
2. `GAPS_REMEDIATION.md` exists in `specs/<feature>/`
3. Implementation files are accessible
4. Local test environment is functional

---

## Execution Steps

### STEP 0: MANDATORY PREREQUISITE CHECK ⛔

**CRITICAL**: You MUST perform this check BEFORE proceeding with any other steps.

```bash
# Check if REMEDIATION_CHECKLIST.md exists in any feature directory
find specs -name "REMEDIATION_CHECKLIST.md" -type f 2>/dev/null | head -1 | grep -q . && echo "✓ Prerequisite found" || echo "✗ MISSING PREREQUISITE"
```

**If the file does NOT exist:**

1. **STOP immediately** - Do NOT proceed to any other steps
2. **Exit with this error message:**

   ```
   ❌ PREREQUISITE MISSING: REMEDIATION_CHECKLIST.md not found in specs/

   The /implement-reported-gaps command requires a remediation checklist to know
   which gaps to fix and how to fix them. Without this file, I cannot safely
   modify your code.

   ▶ Next Steps:

   1. Run the prerequisite commands in order:
      a. /analyze-report-gaps.gpt-5-mini (or gpt-4-1) - generates gap report
      b. /analyze-prepare-reported-gaps-for-implementation - creates checklist

   2. After the checklist is created, re-run: /implement-reported-gaps

   The checklist should be located at: specs/<feature>/REMEDIATION_CHECKLIST.md
   ```

3. **Do NOT guess which gaps to implement**
4. **Do NOT modify any code files**
5. **Do NOT create commits**

**Only proceed if:** `REMEDIATION_CHECKLIST.md` exists and is readable.

---

### Step 1: Initialize and Scope

**Prerequisite:** STEP 0 passed - `REMEDIATION_CHECKLIST.md` exists.

#### 1.1: Locate Checklist

```bash
CHECKLIST_PATH=$(find specs -name "REMEDIATION_CHECKLIST.md" -type f 2>/dev/null | head -1)
echo "Found checklist at: $CHECKLIST_PATH"
```

#### 1.2: Read Documents

Load:

- `REMEDIATION_CHECKLIST.md` (get gaps, priorities, steps, estimated times)
- `GAPS_REMEDIATION.md` (get statuses, evidence, fix snippets)

#### 1.3: Ask User for Scope

Use AskUserQuestion tool:

```typescript
AskUserQuestion({
  questions: [
    {
      question: 'Which priority level should I implement?',
      header: 'Scope',
      multiSelect: false,
      options: [
        { label: 'P0 only (BLOCKING)', description: 'Critical fixes only' },
        { label: 'P0 + P1 (IMPORTANT)', description: 'Critical + important fixes' },
        { label: 'P0 + P1 + P2 (ALL)', description: 'Complete remediation' },
        { label: 'Specific gaps only', description: "I'll specify which GAP-N to implement" },
      ],
    },
  ],
});
```

---

### Step 2: Create Implementation Plan

Use TodoWrite to create visible progress tracker:

```typescript
TodoWrite({
  todos: [
    { content: 'Verify test environment', status: 'pending', activeForm: 'Verifying test environment' },
    { content: 'Implement GAP-3 (rename multiExpandable)', status: 'pending', activeForm: 'Implementing GAP-3' },
    { content: 'Implement GAP-1 (add methods)', status: 'pending', activeForm: 'Implementing GAP-1' },
    // ... add all gaps in scope
    { content: 'Run full test suite', status: 'pending', activeForm: 'Running full test suite' },
    { content: 'Update tracking documents', status: 'pending', activeForm: 'Updating tracking documents' },
    { content: 'Commit changes', status: 'pending', activeForm: 'Committing changes' },
  ],
});
```

---

### Step 3: Execute Each Gap Systematically

For each gap in selected scope (in order from checklist):

#### 3.1: Mark Gap In Progress

Update TodoWrite with `in_progress` status for current gap.

#### 3.2: Read Gap Checklist Section

Use Read tool to load the specific gap section from REMEDIATION_CHECKLIST.md.

#### 3.3: Execute Each Step

For each checklist step:

**A. File Modifications**

Use Edit tool for exact replacements from checklist.

**B. Immediate Verification**

After modifying code, verify the change:

```typescript
// Read file to confirm change applied
Read('[file_path]', offset: [line], limit: 10)
```

**C. Run Tests**

If step modifies code, run tests:

```bash
npm run test -- [component-name]
```

**CRITICAL**: If tests fail:

1. STOP immediately
2. Read test output
3. Fix the issue
4. Re-run tests
5. Only proceed when tests pass

**D. Progress Update**

Tell user:

```markdown
Step [X]/[Y]: [Step description]
✅ [What was done]
✅ Tests passing
```

#### 3.4: Commit Gap and Verify

After all steps for a gap are done:

**A. Update TodoWrite**

Mark gap as `completed` in TodoWrite.

**B. Create Commit**

Create a commit for this gap using conventional format:

```bash
# Determine commit type based on priority
# P0 → fix, P1 → feat/refactor, P2 → chore/style

git add [files modified in this gap]

git commit -m "$(cat <<'EOF'
[type]([component]): resolve GAP-[N] - [brief description]

Implement GAP-[N] from REMEDIATION_CHECKLIST.md:
- [Step 1 description]
- [Step 2 description]

Verification:
- ✅ Tests passing ([X]/[X])
- ✅ Linting clean
- ✅ Build successful

Violates: [FR-XXX], [CA-XXX]
Priority: [P0/P1/P2]
Estimated: [X] minutes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

**C. Post-Commit Verification**

**CRITICAL**: Re-run full verification to ensure commit didn't break anything.

```bash
# Run all verification checks
npm run test
npm run lint
npm run build
```

**If any verification fails**:
1. STOP immediately
2. Fix the issue
3. Create a follow-up commit: `fix([component]): resolve post-commit verification failure for GAP-[N]`
4. Re-run verification
5. Only proceed when all checks pass

**D. E2E Verification (if applicable)**

If the gap affects features requiring web-native APIs:
- Deep linking (History API)
- Keyboard navigation
- Responsive behaviors

Run E2E tests:

```bash
npm run e2e -- [component-name]
```

**E. Accessibility Verification**

Run Storybook accessibility tests:

```bash
npx nx test-storybook ngx-foundation-sites --story="[Component]--*"
```

**F. Progress Update**

Tell user:

```markdown
✅ GAP-[N] complete and committed!

**Commit**: [commit hash]
**Verification**:
- ✅ Tests passing ([X]/[X])
- ✅ Linting clean
- ✅ Build successful
- ✅ E2E passing (if applicable)
- ✅ Accessibility clean

Proceeding to next gap...
```

---

### Step 4: Post-Implementation Verification

After all selected gaps are implemented:

#### 4.1: Run Full Test Suite

```bash
# Full test suite
npm run test

# Linting
npm run lint

# Build
npm run build
```

If any failures:

- **STOP and fix**
- Do NOT proceed to Step 5
- Re-run all verification commands

---

### Step 5: Update Tracking Documents

#### 5.1: Update GAPS_REMEDIATION.md

For each completed gap, change status:

```
**Status**: NOT IMPLEMENTED
```

to:

```
**Status**: ✅ FIXED (2026-01-12)
```

#### 5.2: Update REMEDIATION_CHECKLIST.md

Add completion metadata at top of file.

#### 5.3: Update CHANGELOG.md (if breaking changes)

If any gap is marked **BREAKING CHANGE**, update CHANGELOG.md with migration instructions.

---

### Step 6: Verify All Commits

All gaps have been committed individually in Step 3.4. Verify commit history:

```bash
# Show commits created in this session
git log --oneline --since="30 minutes ago"
```

Expected commits:
- [N] gap remediation commits (one per gap)
- [M] follow-up fix commits (if any post-commit verification failures occurred)

Tell user:

```markdown
📋 **Commit Summary**:

- GAP-1: [commit hash] - [description]
- GAP-2: [commit hash] - [description]
- GAP-3: [commit hash] - [description]
...

Total commits: [N]
All commits verified and passing.
```

---

### Step 7: Final Summary

Update TodoWrite to show all items completed.

Tell user:

```markdown
🎉 **Implementation Complete!**

**Summary**:

- Gaps fixed: [N] ([GAP-IDs])
- Priority: [P0 / P0+P1 / P0+P1+P2]
- Estimated time: [X] minutes
- Actual time: [Y] minutes

**Verification**:

- ✅ All tests passing
- ✅ Linting clean
- ✅ Build successful
- ✅ E2E passing (if applicable)
- ✅ Accessibility clean

**Updated Documents**:

- ✅ GAPS_REMEDIATION.md ([N] gaps marked as ✅ FIXED)
- ✅ REMEDIATION_CHECKLIST.md (completion notes added)
- ✅ CHANGELOG.md (breaking changes documented)

**Git Commits**:

- [N] commits created (one per gap)
- All commits verified with full test suite

**Next Steps**:

1. Review the changes: `git log --oneline --since="30 minutes ago"`
2. Optional: Run gap revalidation to confirm fixes
3. Push to remote: `git push`
4. Create pull request if needed
```

---

### Step 8: Optional Gap Revalidation

Ask user if they want to revalidate gaps:

```typescript
AskUserQuestion({
  questions: [
    {
      question: 'Run gap analysis to confirm all fixes? (recommended for complex features)',
      header: 'Revalidation',
      multiSelect: false,
      options: [
        { label: 'Yes, revalidate', description: 'Run gap analysis to confirm fixes' },
        { label: 'No, skip', description: 'Manual verification is sufficient' },
      ],
    },
  ],
});
```

If user selects "Yes, revalidate":

1. Run gap analysis:
   ```bash
   /analyze-report-gaps-haiku-4-5
   ```

2. Compare new report with original:
   - Read original: `specs/[feature]/gap-analysis-report.md.backup`
   - Read new: `specs/[feature]/gap-analysis-report.md`
   - Identify gaps that are now fixed (no longer in report)
   - Identify gaps that still exist (still in report)

3. Report results:
   ```markdown
   📊 **Gap Revalidation Results**:

   **Fixed Gaps** (no longer appear):
   - GAP-1: Foundation API methods
   - GAP-2: Foundation API outputs
   - GAP-3: Input naming inconsistency

   **Remaining Gaps** (still exist):
   - None

   **New Gaps** (introduced by fixes):
   - None

   ✅ All gaps successfully remediated!
   ```

---

## Special Cases

### Breaking Changes

**Detection**: If checklist step has "**BREAKING CHANGE**" marker

**Handling**:

1. Ask user to confirm before implementing
2. Update CHANGELOG.md first
3. Include breaking change in commit message body
4. Document migration path in commit

### Test Failures

**Detection**: npm run test exits with non-zero

**Handling**:

1. **STOP immediately**
2. Read test output
3. Identify failure cause
4. Ask user: "Test failed: [error]. Should I: (1) Fix automatically, (2) Skip this gap, (3) Stop execution?"

### Complex Implementations (GAP-5 type)

**Detection**: Gap has 5+ sub-steps with multiple file changes

**Handling**:

1. Break into sub-tasks in TodoWrite
2. Execute each sub-task sequentially
3. Verify after each sub-task
4. Ask user for confirmation at key decision points

### File Not Found

**Detection**: Read or Edit tool fails with file not found

**Handling**:

1. Ask user: "File not found: [path]. Should I: (1) Search for it, (2) Skip this gap, (3) Stop?"
2. If search: use Glob to find similar files

---

## Success Criteria

After execution:

✅ **All selected gaps implemented** with exact code from checklist
✅ **All tests passing** (npm run test)
✅ **Linting clean** (npm run lint)
✅ **Build successful** (npm run build)
✅ **E2E tests passing** (if applicable)
✅ **Accessibility clean** (Storybook tests passing)
✅ **GAPS_REMEDIATION.md updated** (status → ✅ FIXED)
✅ **REMEDIATION_CHECKLIST.md updated** (completion notes)
✅ **CHANGELOG.md updated** (if breaking changes)
✅ **Git commits created** (one per gap, conventional format, co-authored)
✅ **Post-commit verification passing** (all commits verified)
✅ **TodoWrite shows completion** (all items completed status)

---

## Related Commands

- `/analyze-report-gaps.gpt-5-mini` - Generate gap report (run first)
- `/analyze-report-gaps.gpt-4-1` - Generate gap report for large features
- `/analyze-prepare-reported-gaps-for-implementation` - Create remediation checklist (run second)

---

## Notes

- **MANDATORY prerequisite check**: MUST check for REMEDIATION_CHECKLIST.md in STEP 0
- **No guessing**: NEVER implement gaps without a validated checklist
- **Write-heavy**: This agent modifies implementation files extensively
- **Test-gated**: Cannot proceed if tests fail
- **Progressive**: Execute gaps in order (P0 → P1 → P2)
- **Visible progress**: Use TodoWrite for user visibility
- **Commit incrementally**: One commit per priority level
