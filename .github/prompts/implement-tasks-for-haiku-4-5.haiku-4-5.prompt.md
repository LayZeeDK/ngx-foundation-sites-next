---
description: Execute Haiku-suitable tasks with Claude Haiku 4.5 optimizations. Fast, cost-effective implementation for focused, bounded tasks.
agent: implement-tasks-for-haiku-4-5.haiku-4-5
model: claude-haiku-4.5
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

## Goal

Execute Haiku-suitable tasks from haiku-suitable-tasks.md using Haiku 4.5 optimizations.

**Focus**: Fast, reliable execution of focused, bounded tasks
**Strategy**: Pattern-based implementation, step-bounded reasoning, systematic verification

---

## Execution Steps

### Step 1: Initialize & Load Context

Run prerequisite check and load focused context for Haiku.

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON output for:**

- `FEATURE_DIR`: Absolute path to feature directory

**Load required files**:

1. **haiku-suitable-tasks.md** (REQUIRED): Task list filtered for Haiku, suitability scores, estimated times
2. **haiku-implementation-context.md** (REQUIRED): Code patterns, file paths, success criteria
3. **spec.md** (OPTIONAL): Load only if context file references it
4. **plan.md** (OPTIONAL): Load only if needed for navigation

**If haiku-suitable-tasks.md NOT FOUND**:

```
❌ Error: haiku-suitable-tasks.md not found

Run `copilot -m "claude-sonnet-4.5" slash tasks-for-haiku-4-5` first to identify Haiku-suitable tasks.

STOP execution.
```

---

### Step 2: Verify Task Scope

Count tasks by suitability:

- **HIGH suitability**: Tasks with ≥75% score
- **MEDIUM suitability**: Tasks with 50-74% score
- **LOW suitability**: Should not be in Haiku task list

**If LOW suitability tasks found**:

```
⚠️ Warning: Found [X] LOW suitability tasks in Haiku task list

These tasks may be better suited for Sonnet 4.5:
- [Task IDs and reasons]

Proceed anyway? (yes/no)
```

Wait for user confirmation before continuing.

---

### Step 3: Create Execution Plan

**Report execution plan**:

```markdown
## Execution Plan

**HIGH Suitability Tasks**: [number] tasks

- Estimated time: [X] minutes
- Pattern distribution: [counts by pattern]

**MEDIUM Suitability Tasks**: [number] tasks

- Estimated time: [Y] minutes (with extended thinking)
- Pattern distribution: [counts by pattern]

**Total Estimated Time**: [X + Y] minutes
**Estimated Speedup vs Sonnet**: [Z]×
**Estimated Cost Savings**: $[amount] (66%)

**Execution Order**:

1. Verify test environment (setup)
2. Execute HIGH suitability tasks (parallel where possible)
3. Execute MEDIUM suitability tasks (with extended thinking if needed)
4. Verify all changes
5. Update tracking
6. Commit
```

---

### Step 4: Execute Tasks (Pattern-Based)

For each task, apply the appropriate pattern-based execution template.

#### Pattern A: Add Method/Property

**Step 1**: Load target file

```typescript
Read(file_path);
```

**Step 2**: Identify insertion point (3-step bounded reasoning)

1. Find similar methods in the same class
2. Identify class structure (properties → methods → end)
3. Locate insertion point (end of methods section, before closing brace)

**Step 3**: Extract pattern from similar method

- Copy JSDoc format
- Copy method signature style
- Copy implementation structure

**Step 4**: Generate new method following pattern

```typescript
/**
 * [Description from task]
 * @public
 */
methodName(params): ReturnType {
  // Implementation
}
```

**Step 5**: Insert using Edit tool

**Step 6**: Verify

```bash
# TypeScript compilation
npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json

# If tests exist for this component
npm run test -- [component-name]
```

**Success Criteria**:

- [ ] Method added with JSDoc
- [ ] TypeScript compilation succeeds
- [ ] Method signature matches pattern
- [ ] Existing tests still pass

#### Pattern B: Rename/Update

**Step 1**: Identify all occurrences (3-step search)

1. Search in implementation files (.ts, .component.ts, .directive.ts)
2. Search in template files (.html)
3. Search in test/story files (.spec.ts, .stories.ts)

**Step 2**: Sort occurrences by file (implementation → templates → tests → stories)

**Step 3**: Edit each file sequentially

**Step 4**: Verify complete replacement (grep should return nothing)

**Step 5**: Run tests

```bash
npm run test -- [component-name]
npm run lint
```

**Success Criteria**:

- [ ] All occurrences replaced (grep returns empty)
- [ ] TypeScript compilation succeeds
- [ ] Tests pass
- [ ] Linting passes

#### Pattern C: Add Test (Storybook)

**Step 1**: Load story file

**Step 2**: Identify test pattern (3-step analysis)

1. Find existing stories with play functions
2. Extract play function structure
3. Identify common patterns (within, userEvent, expect)

**Step 3**: Generate new test story

```typescript
export const [StoryName]: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Get element
    const element = canvas.getByRole('[role]', { name: /[name]/ });

    // 2. Perform action
    await userEvent.[action](element);

    // 3. Assert result
    await expect(element).to[assertion];
  },
};
```

**Step 4**: Insert test

**Step 5**: Verify

```bash
nx test-storybook ngx-foundation-sites --story="[StoryName]"
```

**Success Criteria**:

- [ ] Story added with play function
- [ ] Test uses userEvent and expect
- [ ] Test passes in Storybook
- [ ] No AXE violations

#### Pattern D: Update Documentation

**Step 1**: Load documentation file

**Step 2**: Identify update location (3-step reasoning)

1. Find relevant section header
2. Locate insertion/replacement point
3. Verify context matches task description

**Step 3**: Generate documentation content (follow existing style)

**Step 4**: Update using Edit

**Step 5**: Verify markdown syntax and code examples

**Success Criteria**:

- [ ] Content clear and accurate
- [ ] Examples work (if provided)
- [ ] Formatting consistent
- [ ] No broken links

#### Pattern E: Refactor (MEDIUM - with extended thinking)

**Extended Thinking Budget**: 2K-4K tokens

**Step 1**: Load and understand context

**Step 2**: Analyze refactoring scope (extended thinking enabled)

Think through:

1. What code is being moved/extracted?
2. What dependencies exist?
3. What tests need updating?
4. What imports need changing?

**Step 3**: Plan refactoring steps (3-5 bounded steps)

**Step 4**: Execute steps sequentially with verification between steps

**Step 5**: Full verification

```bash
npm run build
npm run test
npm run lint
```

**Success Criteria**:

- [ ] Refactoring complete per task description
- [ ] No behavior changes (tests prove this)
- [ ] TypeScript compilation succeeds
- [ ] Linting passes

---

### Step 5: Track Progress

**Provide conversational updates**:

```markdown
✅ T001 complete (2 min) - Added down() method to accordion-item-def.ts

- Followed pattern from existing expanded.set() calls
- TypeScript compilation: ✅
- Tests: ✅ passing

🔧 Starting T002: Add up() method...
```

---

### Step 6: Post-Implementation Verification

**After all tasks complete, run full verification suite**:

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

**If any failures**:

1. **STOP** - do not proceed to commits
2. **Identify failure** - read error output
3. **Fix issue** - adjust implementation
4. **Re-run verification** - must pass before continuing

---

### Step 7: Update Tracking Documents

**Update haiku-suitable-tasks.md**: Mark completed tasks with [X]

**Add completion notes**:

```markdown
**Actual Performance**:

- **Tasks Completed**: [number] ([percentage]% of Haiku-suitable tasks)
- **Actual Time**: [X] minutes (estimated: [Y] minutes)
- **Speedup**: [Z]× faster than estimated Sonnet time
- **Cost**: $[amount] (66% savings vs Sonnet: $[saved])
```

**Update tasks.md** (original file): Mark Haiku-completed tasks

---

### Step 8: Create Git Commit

**Commit message format** (conventional commits):

```bash
git commit -m "feat([component]): implement [X] Haiku-optimized tasks

Implemented using Claude Haiku 4.5 for focused, bounded tasks:

Pattern A (Add Method): [Y] tasks
- T001: Add down() method to accordion-item
- T002: Add up() method to accordion-item

Pattern B (Add Test): [Z] tasks
- T010: Add Storybook test for down()

Pattern C (Update Docs): [W] tasks
- T020: Update API_REFERENCE.md with new methods

**Performance Metrics**:
- Execution time: [X] minutes (vs estimated [Y] min with Sonnet)
- Speedup: [Z]× faster
- Cost: $[amount] (66% savings: $[saved])
- Quality: All tests passing, 0 compilation errors

Relates to: haiku-suitable-tasks.md

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Error Handling

### Compilation Errors

```
❌ TypeScript compilation failed after T005

Error: Property 'down' does not exist on type 'NfsAccordionItemDef'
Location: accordion.component.ts:125

**Analysis** (3-step bounded):
1. Check if method was added to correct class
2. Verify method is public (not private)
3. Check if class is properly exported

**Fix**: [Apply appropriate fix based on analysis]

**Verify**: npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json
```

### Test Failures

```
❌ Test failed after T010: Expected 'true' but got 'false'

**Analysis** (3-step):
1. Review test assertion - what's expected?
2. Check implementation - does it match expectation?
3. Identify mismatch - test wrong or implementation wrong?

**Fix**: [Adjust implementation or test based on analysis]

**Verify**: npm run test -- [component-name]
```

### Pattern Mismatch

```
⚠️ Warning: Code doesn't match expected pattern

**Expected**: JSDoc with @public tag
**Found**: No JSDoc on added method

**Fix**: Add JSDoc per haiku-implementation-context.md template

**Verify**: Visual inspection + linting
```

---

## Performance Reporting

**After completion, provide detailed metrics**:

```markdown
🎉 Haiku Implementation Complete!

## Execution Summary

**Tasks Completed**: [X] / [Y] Haiku-suitable tasks
**Tasks Skipped**: [Z] (LOW suitability - recommend Sonnet)

## Performance Metrics

| Metric               | Value         | Comparison     |
| -------------------- | ------------- | -------------- |
| **Execution Time**   | [X] minutes   | [Y]× faster    |
| **Estimated Sonnet** | [Z] minutes   | (baseline)     |
| **Actual Cost**      | $[amount]     | $[saved] saved |
| **Cost Savings**     | 66% vs Sonnet | (expected)     |

## Quality Metrics

✅ **TypeScript Compilation**: PASS
✅ **Linting**: PASS
✅ **Tests**: [X]/[X] passing (100%)
✅ **Storybook Tests**: [Y]/[Y] passing (100%)
✅ **AXE Violations**: 0
✅ **Regressions**: 0

## Next Steps

**Remaining Tasks** (Sonnet recommended):

- [x] tasks with LOW suitability (estimated [Y] min with Sonnet)
```

---

## Success Criteria (Overall)

**Before marking complete, verify**:

✅ **All Haiku-suitable tasks executed** (HIGH and MEDIUM)
✅ **All tests passing** (npm run test)
✅ **Build successful** (npm run build)
✅ **Linting clean** (npm run lint)
✅ **Storybook tests passing** (if applicable)
✅ **Tracking documents updated**
✅ **Git commit created** (conventional format with performance metrics)

---

## When NOT to Use This Command

❌ **Architectural decisions**: Choosing state management approach
❌ **Complex multi-file refactoring**: Splitting components across files
❌ **Deep reasoning tasks**: Root cause analysis, performance optimization
❌ **Tasks requiring >200K context**: Large feature implementation

**For these, use**: Standard Sonnet 4.5 implementation

---

## Related Commands

- `tasks-for-haiku-4-5` - Identifies Haiku-suitable tasks (run BEFORE this command)
- Standard implementation - Full implementation command (Sonnet-based, for complex tasks)

---

## Notes

- This command is **Haiku 4.5 optimized** (concise, pattern-based, bounded)
- Designed for **focused, bounded tasks** (HIGH and MEDIUM suitability)
- Uses **extended thinking** sparingly (only for MEDIUM tasks, 2K-4K budget)
- **Performance tracking** built-in (time, cost, speedup metrics)
- **Quality assurance** systematic (verify after each task, full suite at end)

**Expected Performance**:

- **Speed**: 2-5× faster than Sonnet on suitable tasks
- **Cost**: 66% cheaper ($1/$5 vs $3/$15 per 1M tokens)
- **Quality**: 90-95% of Sonnet for focused, pattern-based tasks
