---
description: Execute Grok-suitable tasks with Grok Code Fast 1 optimizations. Fast, agentic implementation with iterative refinement.
---

## Setup

Repository: ngx-foundation-sites (Angular component library)
Goal: Execute Grok-suitable tasks from grok-suitable-tasks.md with agentic, iterative workflows

## Model Selection

**Model**: Grok Code Fast 1 (`grok-code-fast-1`)
**Context**: 256K tokens
**Cost**: 0x in GitHub Copilot (VS Code)
**Invoke with**: `copilot -m "grok-code-fast-1" slash implement-tasks-for-grok-code-fast-1`

## Tools Available

- Read files from codebase
- Edit files with precise changes
- Run shell commands (build, test, lint)
- Search codebase with grep patterns

## Constraints

- Follow existing code patterns exactly
- Verify TypeScript compilation after each edit
- Run tests frequently (iterations are cheap)
- Mark tasks [X] in tasks.md immediately after completion
- Commit changes at phase boundaries

## Edge Cases

- If grok-suitable-tasks.md missing: STOP, run `/tasks-for-grok-code-fast-1` first
- If compilation fails: iterate quickly (search error → fix → verify)
- If test fails: analyze → patch → re-run (cheap with Grok's speed)
- If task seems too complex: flag for Claude Sonnet 4.5 review

---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script

---

## Grok Optimization Principles

Apply these research-backed techniques throughout execution:

### 1. Rapid Iteration Over Perfect Prompts

Fire fast, refine quickly. 30 seconds × 3 iterations beats 5 minutes × 1 attempt.

### 2. Agentic Cycles

Use search → read → edit → test → refine loops. Each cycle is cheap (4x speed, 0x cost).

### 3. Native Tool-Calling

Call tools directly. Don't construct XML-based tool calls.

### 4. Preserve Context for Caching

Keep conversation consistent. Don't modify earlier context. Leverage 90%+ cache hit rates.

### 5. Explicit Scope Boundaries

Specify exact file paths. Define what NOT to touch. Prevent over-editing.

---

## Execution Workflow

### Phase 0: Prerequisites & Context Loading

#### Step 0.1: Run Prerequisite Check

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON output for:**

- `FEATURE_DIR`: Absolute path to feature directory
- `AVAILABLE_DOCS`: List of existing files

#### Step 0.2: Verify Grok Artifacts Exist

**Required files:**

1. `FEATURE_DIR/grok-suitable-tasks.md` (REQUIRED)
2. `FEATURE_DIR/grok-implementation-context.md` (REQUIRED)

**If grok-suitable-tasks.md NOT FOUND:**

```
❌ Error: grok-suitable-tasks.md not found

Run this command first:
copilot -m "claude-sonnet-4.5" slash tasks-for-grok-code-fast-1

STOP execution.
```

#### Step 0.3: Load Implementation Context

**Load in order:**

1. **grok-suitable-tasks.md**: Task list with suitability scores, iteration strategies
2. **grok-implementation-context.md**: Patterns, file paths, success criteria
3. **tasks.md**: Full task list (for marking completion)
4. **plan.md** (if exists): Tech stack, architecture, file structure
5. **spec.md** (if exists): Requirements reference

#### Step 0.4: Check Checklists (if checklists/ directory exists)

Scan `FEATURE_DIR/checklists/` for incomplete items:

```
| Checklist   | Total | Complete | Incomplete | Status |
|-------------|-------|----------|------------|--------|
| ux.md       | 12    | 12       | 0          | ✓ PASS |
| test.md     | 8     | 5        | 3          | ✗ FAIL |
```

**If any incomplete**: Ask user whether to proceed or wait.

---

### Phase 1: Task Scope Verification

#### Step 1.1: Count Tasks by Suitability

From grok-suitable-tasks.md, count:

- **HIGH suitability** (≥75%): Ideal for Grok
- **MEDIUM suitability** (50-74%): Grok with more iterations
- **LOW suitability** (<50%): Should not be here

#### Step 1.2: Warn on LOW Suitability Tasks

**If LOW suitability tasks found in list:**

```
⚠️ Warning: Found [X] LOW suitability tasks

These tasks should use Claude Sonnet 4.5:
- T015 (35%): Design state management approach
- T022 (40%): Integrate ErrorHandler across components

Options:
1. Skip these tasks (recommended)
2. Attempt anyway (may need rework)
3. Stop and reassign to Sonnet

Choice?
```

#### Step 1.3: Report Execution Plan

```markdown
## Execution Plan

**HIGH Suitability Tasks**: [X] tasks (~[Y] minutes)
**MEDIUM Suitability Tasks**: [Z] tasks (~[W] minutes)
**Estimated Total**: [T] minutes (4× faster than other models)
**Cost**: $0 (0x in GitHub Copilot)

**Execution Order**:

1. Phase 1: Setup tasks
2. Phase 2: Core implementation
3. Phase 3: Tests
4. Phase 4: Documentation
5. Verification & commit
```

---

### Phase 2: Project Setup Verification

#### Step 2.1: Verify Ignore Files

Check and create/update ignore files based on detected technology:

**Detection Logic:**

- Git repo? → verify `.gitignore`
- ESLint config? → verify `.eslintignore` or `ignores` in flat config
- Prettier config? → verify `.prettierignore`

**Angular/TypeScript Patterns:**

```
node_modules/
dist/
build/
*.log
.env*
coverage/
.angular/
```

#### Step 2.2: Verify Build Environment

```bash
# Quick verification (iterate if fails)
npm run build --dry-run 2>/dev/null || npm run build
```

---

### Phase 3: Execute Tasks (Agentic Patterns)

For each task in grok-suitable-tasks.md, apply the matching agentic pattern.

**Key principle**: Quick attempt → verify → refine → repeat

---

#### Pattern A: Bug Fix

**Suitability**: HIGH (90%+)
**Iteration Strategy**: Search → diagnose → patch → verify → refine

**Cycle 1 - Locate:**

```
1. Search for bug keywords in target files
2. Read surrounding context (20-30 lines)
3. Identify exact line(s) to fix
```

**Cycle 2 - Patch:**

```
1. Apply minimal fix
2. Run: npx tsc --noEmit --project [tsconfig]
3. If error: read error, adjust, repeat
```

**Cycle 3 - Verify:**

```
1. Run relevant tests
2. If fail: analyze, adjust, repeat
3. If pass: mark complete, move on
```

**Success Criteria:**

- [ ] Bug patched
- [ ] TypeScript compiles
- [ ] Tests pass
- [ ] No regressions

---

#### Pattern B: Add Method/Property

**Suitability**: HIGH (85%+)
**Iteration Strategy**: Copy pattern → adapt → verify

**Cycle 1 - Find Pattern:**

```
1. Search for similar methods in same class
2. Copy JSDoc and signature style
3. Identify insertion point (before closing brace)
```

**Cycle 2 - Implement:**

```
1. Generate method following pattern exactly
2. Insert using Edit tool
3. Verify compilation
```

**Method Template:**

```typescript
/**
 * [Description from task]
 * @public
 */
methodName(params): ReturnType {
  // Implementation following existing patterns
}
```

**Success Criteria:**

- [ ] Method added with JSDoc
- [ ] Follows existing pattern
- [ ] TypeScript compiles
- [ ] Exports updated if needed

---

#### Pattern C: Add Test (Storybook)

**Suitability**: HIGH (95%+)
**Iteration Strategy**: Write → run → fix → pass

**Cycle 1 - Generate Test:**

```
1. Read existing play functions in stories
2. Generate new test following exact pattern
3. Insert in story file
```

**Test Template:**

```typescript
export const [StoryName]: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Get element
    const element = canvas.getByRole('[role]', { name: /[pattern]/ });

    // Perform action
    await userEvent.[action](element);

    // Assert
    await expect(element).to[assertion];
  },
};
```

**Cycle 2 - Verify:**

```bash
nx test-storybook ngx-foundation-sites --story="[StoryName]"
```

**If fails**: Read error, adjust assertion, re-run (iterations are cheap).

**Success Criteria:**

- [ ] Test added with play function
- [ ] Uses userEvent and expect
- [ ] Passes in Storybook
- [ ] No AXE violations

---

#### Pattern D: Rename/Update

**Suitability**: HIGH (85%+)
**Iteration Strategy**: Search all → replace systematically → verify

**Cycle 1 - Find All:**

```
1. Grep in .ts files
2. Grep in .html files
3. Grep in .spec.ts and .stories.ts files
```

**Cycle 2 - Replace:**

```
1. Replace in implementation files first
2. Replace in templates
3. Replace in tests/stories
4. Verify grep returns empty
```

**Cycle 3 - Verify:**

```bash
npm run build && npm run test && npm run lint
```

**Success Criteria:**

- [ ] All occurrences replaced
- [ ] TypeScript compiles
- [ ] Tests pass
- [ ] Lint passes

---

#### Pattern E: Documentation Update

**Suitability**: HIGH (90%+)
**Iteration Strategy**: Read → update → verify format

**Cycle 1 - Update:**

```
1. Read existing doc structure
2. Apply updates following style
3. Verify markdown formatting
```

**Success Criteria:**

- [ ] Content accurate
- [ ] Code examples work
- [ ] Formatting consistent
- [ ] Links valid

---

#### Pattern F: Refactor (MEDIUM suitability)

**Suitability**: MEDIUM (55-74%)
**Iteration Strategy**: Plan → execute step-by-step → verify each step

**Requires more iterations** - use Grok's speed advantage.

**Cycle 1 - Plan:**

```
1. Analyze code to refactor
2. List 3-5 specific steps
3. Identify dependencies
```

**Cycles 2-N - Execute:**

```
For each step:
1. Apply change
2. Verify compilation immediately
3. If fails: fix before continuing
4. Proceed to next step
```

**Final Cycle - Full Verification:**

```bash
npm run build && npm run test && npm run lint
```

**Success Criteria:**

- [ ] Refactoring complete
- [ ] No behavior changes (tests prove)
- [ ] TypeScript compiles
- [ ] Lint passes

---

### Phase 4: Progress Tracking

#### Step 4.1: Report After Each Task

```markdown
✅ T001 complete (2 min, 3 iterations) - Fixed keyboard navigation

- Iter 1: Located bug in handleKeydown:145
- Iter 2: Patched, fixed syntax error
- Iter 3: Tests passing

🔧 Starting T002: Add down() method...
```

#### Step 4.2: Update Task Files Immediately

**Mark in grok-suitable-tasks.md:**

```
- [X] T001 [Pattern: Bug Fix] Fix keyboard navigation
```

**Mark in tasks.md (original):**

```
- [X] T001 Fix keyboard navigation bug
```

**Do not batch** - mark immediately after each task completes.

#### Step 4.3: Track Iteration Metrics

| Task | Pattern    | Iterations | Time | Notes               |
| ---- | ---------- | ---------- | ---- | ------------------- |
| T001 | Bug Fix    | 3          | 2m   | Syntax error iter2  |
| T002 | Add Method | 2          | 1m   | Clean               |
| T003 | Add Test   | 4          | 3m   | Assertion fix iter3 |

---

### Phase 5: Post-Implementation Verification

#### Step 5.1: Full Verification Suite

```bash
# 1. TypeScript compilation
npm run build

# 2. Linting
npm run lint

# 3. Unit tests
npm run test

# 4. Storybook tests (if applicable)
nx test-storybook ngx-foundation-sites
```

#### Step 5.2: Handle Failures with Iteration

**If any failures:**

1. Read error output
2. Identify failing file/test
3. Apply fix
4. Re-run single check
5. Repeat until passing
6. Re-run full suite

**Grok advantage**: Each iteration costs almost nothing (4x speed, 0x cost).

#### Step 5.3: Verify Task Completion

- [ ] All HIGH suitability tasks executed
- [ ] All MEDIUM suitability tasks executed
- [ ] All tests passing
- [ ] Build successful
- [ ] Lint clean
- [ ] Task files updated with [X] markers

---

### Phase 6: Git Commit

#### Step 6.1: Stage Changes

```bash
git add [all-changed-files]
```

#### Step 6.2: Create Commit

```bash
git commit -m "feat([component]): implement [X] Grok-optimized tasks

Implemented using Grok Code Fast 1 for agentic, iterative tasks:

**Bug Fixes**: [Y] tasks
- T001: Fix keyboard navigation
- T002: Fix focus management

**Method Additions**: [Z] tasks
- T010: Add down() method
- T011: Add up() method
- T012: Add toggle() method

**Test Additions**: [W] tasks
- T020: Add keyboard test
- T021: Add toggle test

**Performance**:
- Time: [X] minutes (4× faster)
- Iterations: [Y] total (avg [Z] per task)
- Cost: $0 (0x in GitHub Copilot)
- Quality: All tests passing

Co-Authored-By: Grok Code Fast 1 <noreply@x.ai>"
```

---

### Phase 7: Completion Report

```markdown
🎉 Grok Implementation Complete!

## Summary

**Tasks Completed**: [X] / [Y] Grok-suitable tasks
**Tasks Skipped**: [Z] (LOW suitability - use Sonnet)

## Performance

| Metric        | Value     | vs Other Models |
| ------------- | --------- | --------------- |
| Time          | [X] min   | 4× faster       |
| Iterations    | [Y] total | avg [Z]/task    |
| Cost          | $0        | 0x (free!)      |
| Tests Passing | 100%      | No regressions  |

## Iteration Analysis

| Pattern    | Tasks | Avg Iters | Avg Time |
| ---------- | ----- | --------- | -------- |
| Bug Fix    | [X]   | 3         | 2 min    |
| Add Method | [Y]   | 2         | 1 min    |
| Add Test   | [Z]   | 2         | 1.5 min  |
| Rename     | [W]   | 2         | 1 min    |
| Refactor   | [V]   | 5         | 5 min    |

## Quality

✅ TypeScript: PASS
✅ Linting: PASS
✅ Tests: [X]/[X] (100%)
✅ Storybook: [Y]/[Y] (100%)
✅ Regressions: 0

## Next Steps

**Remaining (Sonnet recommended)**:

- [x] LOW suitability tasks need Claude Sonnet 4.5

**Verification**:

- All changes committed: ✅
- Branch ready for PR: ✅
```

---

## Error Handling

### Compilation Error

```
❌ TypeScript failed at accordion.component.ts:125

→ Iter 1: Read error - 'down' not on type
→ Iter 2: Check class - method is private, make public
→ Iter 3: Compile passes ✅
→ Fixed in 45 seconds
```

### Test Failure

```
❌ Test failed: Expected 'true' got 'false'

→ Iter 1: Check assertion - correct expectation ✅
→ Iter 2: Check implementation - signal not updating
→ Iter 3: Fix signal.set() call
→ Iter 4: Test passes ✅
→ Fixed in 1 minute
```

### Task Too Complex

```
⚠️ T015 taking >5 iterations, score was 45%

This task may need Claude Sonnet 4.5.
Options:
1. Continue iterating (may take longer)
2. Skip and flag for Sonnet
3. Simplify scope and retry

Choice?
```

---

## When NOT to Use This Command

❌ **Architectural decisions** → Use Claude Sonnet 4.5
❌ **Complex multi-file refactoring** → Use Claude Sonnet 4.5
❌ **Deep reasoning tasks** → Use Claude Sonnet 4.5/Opus 4.5
❌ **>256K context needed** → Use GPT-4.1
❌ **One-shot Q&A** → Use Grok 4
❌ **Production-critical first-try** → Use Claude Opus 4.5

---

## Related Commands

- `tasks-for-grok-code-fast-1` - Identifies Grok-suitable tasks (run BEFORE this)
- `tasks-for-haiku-4-5` - Alternative using Claude Haiku 4.5
- `implement-tasks-for-haiku-4-5` - Execute with Haiku instead

---

## Notes

**Expected Performance:**

- **Speed**: 4× faster than other agentic models
- **Cost**: $0 in GitHub Copilot (0x)
- **Quality**: 90%+ of Sonnet for suitable tasks
- **Best for**: Bug fixes, scaffolding, test writing, iterative tasks

**Key Insight**: Grok's 4× speed makes iteration essentially free. Don't overthink—try, fail fast, fix, repeat.
