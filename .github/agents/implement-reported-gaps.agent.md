---
description: Executes gap fixes from REMEDIATION_CHECKLIST.md with systematic verification and progress tracking. Use after /analyze-prepare-reported-gaps-for-implementation creates the remediation checklist. Optimized for Sonnet 4.5's implementation capabilities.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Prerequisites

Before running this agent:

1. `REMEDIATION_CHECKLIST.md` exists in `specs/<feature>/`
2. `GAPS_REMEDIATION.md` exists in `specs/<feature>/`
3. Implementation files are accessible
4. Local test environment is functional

## Goal

Execute gap fixes from REMEDIATION_CHECKLIST.md systematically, verify each fix with tests, update tracking documents, and commit in logical increments.

## Execution Steps

### Step 0: Initialize and Scope

#### 0.1: Locate Checklist

```bash
# Find REMEDIATION_CHECKLIST.md
ls specs/*/REMEDIATION_CHECKLIST.md
```

If not found, tell user: "REMEDIATION_CHECKLIST.md not found. Run `/analyze-prepare-reported-gaps-for-implementation` first."

#### 0.2: Read Documents

Load:

- `REMEDIATION_CHECKLIST.md` (get gaps, priorities, steps, estimated times)
- `GAPS_REMEDIATION.md` (get statuses, evidence, fix snippets)

#### 0.3: Ask User for Scope

Use AskUserQuestion tool:

```typescript
AskUserQuestion({
  questions: [
    {
      question: 'Which priority level should I implement?',
      header: 'Scope',
      multiSelect: false,
      options: [
        {
          label: 'P0 only (BLOCKING) - 32 min',
          description: 'Critical fixes: API parity (GAP-1, GAP-2, GAP-3)',
        },
        {
          label: 'P0 + P1 (IMPORTANT) - 167 min',
          description: 'Critical + important: adds accessibility & diagnostics',
        },
        {
          label: 'P0 + P1 + P2 (ALL) - 182 min',
          description: 'Complete remediation including polish',
        },
        {
          label: 'Specific gaps only',
          description: "I'll specify which GAP-N to implement",
        },
      ],
    },
  ],
});
```

If "Specific gaps only" selected, ask follow-up:

```typescript
AskUserQuestion({
  questions: [
    {
      question: 'Which gaps should I implement? (comma-separated)',
      header: 'Gaps',
      multiSelect: false,
      options: [{ label: 'GAP-1, GAP-3', description: 'Example: implement specific gaps' }],
    },
  ],
});
```

### Step 1: Create Implementation Plan

Use TodoWrite to create visible progress tracker:

```typescript
TodoWrite({
  todos: [
    { content: 'Verify test environment', status: 'pending', activeForm: 'Verifying test environment' },
    { content: 'Implement GAP-3 (rename multiExpandable)', status: 'pending', activeForm: 'Implementing GAP-3' },
    { content: 'Implement GAP-1 (add methods)', status: 'pending', activeForm: 'Implementing GAP-1' },
    { content: 'Implement GAP-2 (add outputs)', status: 'pending', activeForm: 'Implementing GAP-2' },
    { content: 'Run full test suite', status: 'pending', activeForm: 'Running full test suite' },
    { content: 'Update GAPS_REMEDIATION.md', status: 'pending', activeForm: 'Updating GAPS_REMEDIATION.md' },
    { content: 'Commit P0 fixes', status: 'pending', activeForm: 'Committing P0 fixes' },
  ],
});
```

Tell user:

```markdown
Starting gap remediation implementation...

📋 **Implementation Plan**:

- Scope: [P0 / P0+P1 / P0+P1+P2 / Custom]
- Gaps to fix: [N] ([GAP-IDs])
- Estimated time: [X] minutes
- Approach: Systematic execution with verification after each step

I'll update the TODO list as I progress.
```

### Step 2: Execute Each Gap Systematically

For each gap in selected scope (in order from checklist):

#### 2.1: Mark Gap In Progress

```typescript
TodoWrite({
  todos: [
    // ... previous todos with updated statuses
    { content: 'Implement GAP-N', status: 'in_progress', activeForm: 'Implementing GAP-N' },
    // ...
  ],
});
```

#### 2.2: Read Gap Checklist Section

Use Read tool to load the specific gap section from REMEDIATION_CHECKLIST.md.

Example for GAP-3:

```markdown
### ✅ Checklist: GAP-3 - Rename `multiExpandable` → `multiExpand` (2 min)

**BREAKING CHANGE** - Document in changelog

- [ ] **Step 1**: Update accordion.component.ts line 51
      // ... code snippet
```

#### 2.3: Execute Each Step

For each checklist step:

**A. File Modifications**

Use Edit tool for exact replacements:

```typescript
// Example: GAP-3 Step 1
Edit({
  file_path: 'packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts',
  old_string: 'readonly multiExpandable = input(false);',
  new_string: 'readonly multiExpand = input(false);',
});
```

**B. Immediate Verification**

After modifying code, verify the change:

```typescript
// Read file to confirm change applied
Read("packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts", offset: 45, limit: 10)

// Confirm line 51 now has multiExpand
```

**C. Run Tests**

If step modifies code, run tests:

```bash
npm run test -- accordion
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

#### 2.4: Mark Gap Complete

After all steps for a gap are done:

```typescript
TodoWrite({
  todos: [
    // ... previous todos
    { content: 'Implement GAP-N', status: 'completed', activeForm: 'Implementing GAP-N' },
    // ...
  ],
});
```

Tell user:

```markdown
✅ GAP-N complete (actual: [X] min, estimated: [Y] min)
```

### Step 3: Post-Implementation Verification

After all selected gaps are implemented:

#### 3.1: Run Full Test Suite

```typescript
TodoWrite({
  todos: [
    // ... previous todos
    { content: 'Run full test suite', status: 'in_progress', activeForm: 'Running full test suite' },
    // ...
  ],
});
```

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
- Do NOT proceed to Step 4
- Re-run all verification commands

#### 3.2: Mark Verification Complete

```typescript
TodoWrite({
  todos: [
    // ... previous todos
    { content: 'Run full test suite', status: 'completed', activeForm: 'Running full test suite' },
    // ...
  ],
});
```

### Step 4: Update Tracking Documents

#### 4.1: Update GAPS_REMEDIATION.md

For each completed gap:

```typescript
Edit({
  file_path: 'specs/<feature>/GAPS_REMEDIATION.md',
  old_string: '**Status**: NOT IMPLEMENTED',
  new_string: '**Status**: ✅ FIXED (2026-01-10)',
});
```

**Pattern matching**: Search for exact "### GAP-N:" heading, then find "**Status**:" line below it.

#### 4.2: Update REMEDIATION_CHECKLIST.md

Add completion metadata:

```typescript
Edit({
  file_path: 'specs/<feature>/REMEDIATION_CHECKLIST.md',
  old_string: '**Total Estimated Time**: 182 minutes (~3 hours)\n**Actual Time**: _(fill in after completion)_',
  new_string: '**Total Estimated Time**: 182 minutes (~3 hours)\n**Actual Time**: [calculated] minutes\n\n**Completion Date**: 2026-01-10\n**Scope**: [P0 / P0+P1 / etc.]\n**Gaps Fixed**: [GAP-1, GAP-2, GAP-3]',
});
```

#### 4.3: Update CHANGELOG.md (if breaking changes)

If any gap is marked **BREAKING CHANGE**:

```typescript
// Prepend to CHANGELOG.md
Read('CHANGELOG.md');

Write({
  file_path: 'CHANGELOG.md',
  content: `# Changelog

## [Unreleased]

### BREAKING CHANGES

- **accordion**: Renamed input \`multiExpandable\` → \`multiExpand\` for Foundation naming alignment (FR-014)
  - Migration: Replace [multiExpandable] with [multiExpand] in all accordion usages

${existingContent}
`,
});
```

### Step 5: Commit Changes

Create **one commit per priority level** with conventional format.

#### Commit Structure

**For P0 (includes breaking changes):**

```bash
git add packages/ngx-foundation-sites/src/lib/accordion/ specs/<feature>/

git commit -m "fix(accordion): resolve P0 gaps - Foundation API parity

Implement P0 gap remediations from REMEDIATION_CHECKLIST.md:

- GAP-3: Rename multiExpandable → multiExpand (BREAKING CHANGE)
  - Update accordion.component.ts line 51
  - Update accordion.component.html line 12
  - Update accordion.component.spec.ts (8 occurrences)
  - Update accordion.stories.ts controls
  - API now matches Foundation naming (FR-014, CA-007)

- GAP-1: Add Foundation API methods (down, up, toggle)
  - Implement in accordion-item-def.ts
  - Add JSDoc with Foundation equivalents
  - Add unit tests for each method
  - Enables programmatic control per FR-075, CA-009

- GAP-2: Add Foundation API outputs ((down), (up))
  - Add output signals in accordion.component.ts
  - Emit events in expansion tracking effect (line ~168)
  - Add unit tests for event payloads
  - Enables event notification per FR-076, CA-010

BREAKING CHANGES:
- **accordion**: Renamed input \`multiExpandable\` → \`multiExpand\`
  - Migration: Replace [multiExpandable] with [multiExpand] in all accordion usages

Verification:
- ✅ All tests passing (npm run test)
- ✅ Linting clean (npm run lint)
- ✅ Build successful (npm run build)
- ✅ grep -r 'multiExpandable' returns no results

Fixes: GAP-1, GAP-2, GAP-3
Time: [actual] minutes (estimated: 32 minutes)
Updated: GAPS_REMEDIATION.md, REMEDIATION_CHECKLIST.md, CHANGELOG.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**For P1:**

```bash
git commit -m "feat(accordion): resolve P1 gaps - accessibility and diagnostics

Implement P1 gap remediations from REMEDIATION_CHECKLIST.md:

- GAP-4: Add titleHeadingLevel input (30 min)
  - Support 1-6 or null for ARIA heading wrapper
  - Add conditional template with role=\"heading\"
  - Enables screen reader document outline navigation
  - Fixes WCAG 1.3.1 compliance per FR-016

- GAP-5: Add ErrorHandler diagnostics (60 min)
  - FR-017a: Duplicate panelId detection in registry
  - FR-026a: Missing title detection in ngAfterContentInit
  - FR-067b: Deep link error handling in #handleInitialHash
  - FR-089a: Rapid toggle serialization (verify queue exists)
  - FR-110a: Input validation in validators.ts (add ErrorHandler calls)
  - Inject ErrorHandler service
  - Add panelId registry Map
  - Add unit tests for each validation point

- GAP-6: Add Foundation API Storybook tests (45 min)
  - Create FoundationApiParity.story.ts
  - Test down(), up(), toggle() methods with play functions
  - Test (down), (up) event payloads
  - Verify disabled state prevents methods
  - Covers FR-075, FR-076 testing requirements

Verification:
- ✅ All tests passing
- ✅ Storybook tests pass
- ✅ ErrorHandler integration working
- ✅ Screen reader heading navigation functional

Fixes: GAP-4, GAP-5, GAP-6
Time: [actual] minutes (estimated: 135 minutes)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**For P2:**

```bash
git commit -m "chore(accordion): resolve P2 gap - SSR error handling

Implement P2 gap remediations:

- GAP-8: Add SSR error handling (15 min)
  - Wrap 3 afterNextRender blocks in try/catch
  - Line ~108: Style loader error handling
  - Line ~118: Deep link initialization error handling
  - Line ~124: Third block error handling
  - Add contextual error messages
  - Component remains functional on hydration failure per FR-062a

Verification:
- ✅ Unit test for hydration failure scenario
- ✅ SSR rendering stable

Fixes: GAP-8
Time: [actual] minutes (estimated: 15 minutes)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Step 6: Final Summary

```typescript
TodoWrite({
  todos: [
    // All todos marked as completed
    { content: 'Verify test environment', status: 'completed', activeForm: 'Verifying test environment' },
    { content: 'Implement GAP-3', status: 'completed', activeForm: 'Implementing GAP-3' },
    // ... all completed
  ],
});
```

Tell user:

```markdown
🎉 **Implementation Complete!**

**Summary**:

- Gaps fixed: [N] ([GAP-IDs])
- Priority: [P0 / P0+P1 / P0+P1+P2]
- Estimated time: [X] minutes
- Actual time: [Y] minutes
- Accuracy: [Y/X * 100]%

**Verification**:

- ✅ All tests passing
- ✅ Linting clean
- ✅ Build successful
- ✅ Storybook tests passing (if applicable)

**Updated Documents**:

- ✅ GAPS_REMEDIATION.md ([N] gaps marked as ✅ FIXED)
- ✅ REMEDIATION_CHECKLIST.md (completion notes added)
- ✅ CHANGELOG.md (breaking changes documented)

**Git Commits**:

- [N] commits created with conventional format
- Co-authored with Claude Sonnet 4.5

**Next Steps**:

1. Review the changes: `git diff HEAD~[N]`
2. Push to remote: `git push`
3. Run `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` to verify no new gaps introduced
4. Create pull request if needed
```

## Special Cases

### Breaking Changes

**Detection**: If checklist step has "**BREAKING CHANGE**" marker

**Handling**:

1. Ask user to confirm before implementing
2. Update CHANGELOG.md first
3. Include breaking change in commit message body
4. Document migration path in commit
5. Mark with `BREAKING CHANGES:` section

### Test Failures

**Detection**: npm run test exits with non-zero

**Handling**:

1. **STOP immediately**
2. Read test output
3. Identify failure cause
4. Ask user: "Test failed: [error]. Should I: (1) Fix automatically, (2) Skip this gap, (3) Stop execution?"
5. If fix automatically: adjust implementation and re-test
6. If skip: mark gap as incomplete, continue to next
7. If stop: exit gracefully, update TODOs

### Complex Implementations (GAP-5)

**Detection**: Gap has 5+ sub-steps with multiple file changes

**Handling**:

1. Break into sub-tasks in TodoWrite
2. Execute each sub-task sequentially
3. Verify after each sub-task
4. Ask user for confirmation at key decision points
5. Document assumptions in commit message

### File Not Found

**Detection**: Read or Edit tool fails with file not found

**Handling**:

1. Ask user: "File not found: [path]. Should I: (1) Search for it, (2) Skip this gap, (3) Stop?"
2. If search: use Glob to find similar files
3. If skip: mark gap as incomplete
4. If stop: exit gracefully

## Operating Constraints

- **Write-heavy**: This agent modifies implementation files extensively
- **Test-gated**: Cannot proceed if tests fail
- **Progressive**: Execute gaps in order (P0 → P1 → P2)
- **Visible progress**: Use TodoWrite for user visibility
- **Commit incrementally**: One commit per priority level
- **Sonnet 4.5 optimized**: Leverages precise editing + verification

## Best Practices for Sonnet 4.5

### Code Editing

1. **Read before editing**: Always Read file to understand context
2. **Exact replacements**: Use exact old_string from checklist
3. **Preserve formatting**: Match existing indentation and style
4. **Verify immediately**: Read file after Edit to confirm change

### Testing

1. **Run tests after every code change**
2. **Read test output completely** - don't assume success from exit code alone
3. **Understand failures** - if test fails, read the error message
4. **Fix before proceeding** - never skip a failed test

### Progress Tracking

1. **Update TodoWrite after each step**
2. **Mark in_progress before starting a gap**
3. **Mark completed only after verification passes**
4. **Provide conversational updates** to user

### Error Recovery

1. **Stop on failures** - don't continue past errors
2. **Ask user for guidance** when uncertain
3. **Document workarounds** in commit message
4. **Update tracking docs** even if gap incomplete

## Success Criteria

After execution:

✅ **All selected gaps implemented** with exact code from checklist
✅ **All tests passing** (npm run test)
✅ **Linting clean** (npm run lint)
✅ **Build successful** (npm run build)
✅ **GAPS_REMEDIATION.md updated** (status → ✅ FIXED)
✅ **REMEDIATION_CHECKLIST.md updated** (completion notes)
✅ **CHANGELOG.md updated** (if breaking changes)
✅ **Git commits created** (conventional format, co-authored)
✅ **TodoWrite shows completion** (all items completed status)

## Context

$ARGUMENTS
