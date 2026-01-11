---
description: Execute Haiku-suitable tasks with Claude Haiku 4.5 optimizations. Fast, cost-effective implementation for focused, bounded tasks.
model_override: claude-haiku-4.5
---

# Haiku-Optimized Task Implementation

## Model Configuration

**Model**: Claude Haiku 4.5
**Context**: 200K tokens (GitHub Copilot Business / Claude Code Team)
**Optimization**: Concise prompts, step-bounded reasoning, pattern-based execution
**Expected Performance**: 2-5× faster than Sonnet, 66% cost savings

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script

## Goal

<goal>
Execute Haiku-suitable tasks from haiku-suitable-tasks.md using Haiku 4.5 optimizations.

**Focus**: Fast, reliable execution of focused, bounded tasks
**Strategy**: Pattern-based implementation, step-bounded reasoning, systematic verification
</goal>

---

## Execution Steps

### Step 1: Initialize & Load Context

<task>
Run prerequisite check and load focused context for Haiku.
</task>

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON output for:**

- `FEATURE_DIR`: Absolute path to feature directory

**Load required files**:

1. **haiku-suitable-tasks.md** (REQUIRED):
   - Task list filtered for Haiku
   - Suitability scores
   - Estimated times

2. **haiku-implementation-context.md** (REQUIRED):
   - Code patterns
   - File paths
   - Success criteria

3. **spec.md** (OPTIONAL):
   - Requirements reference (load only if context file references it)

4. **plan.md** (OPTIONAL):
   - File structure (load only if needed for navigation)

**If haiku-suitable-tasks.md NOT FOUND**:

```
❌ Error: haiku-suitable-tasks.md not found

Run `/tasks-for-haiku-4-5` first to identify Haiku-suitable tasks.

STOP execution.
```

---

### Step 2: Verify Task Scope

<scope_check>

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

</scope_check>

---

### Step 3: Create Execution Plan

<planning>

**Generate TODO list with TodoWrite**:

```typescript
TodoWrite([
  { content: 'Verify test environment', status: 'pending', activeForm: 'Verifying test environment' },
  { content: 'T001: [Brief description]', status: 'pending', activeForm: 'Implementing T001' },
  { content: 'T002: [Brief description]', status: 'pending', activeForm: 'Implementing T002' },
  // ... for all HIGH and MEDIUM tasks
  { content: 'Run full verification suite', status: 'pending', activeForm: 'Running verification' },
  { content: 'Update tracking documents', status: 'pending', activeForm: 'Updating tracking' },
  { content: 'Create git commit', status: 'pending', activeForm: 'Creating commit' },
]);
```

**Execution order**:

1. Verify test environment (setup)
2. Execute HIGH suitability tasks (parallel where possible)
3. Execute MEDIUM suitability tasks (with extended thinking if needed)
4. Verify all changes
5. Update tracking
6. Commit

</planning>

---

### Step 4: Execute Tasks (Pattern-Based)

<execution_rules>

For each task, apply the appropriate pattern-based execution template.

</execution_rules>

#### Pattern A: Add Method/Property

<pattern_a>

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

```typescript
Edit(
  file_path: "[absolute path]",
  old_string: "[exact closing brace context]",
  new_string: "[new method + closing brace]"
)
```

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

</pattern_a>

#### Pattern B: Rename/Update

<pattern_b>

**Step 1**: Identify all occurrences (3-step search)

1. Search in implementation files (.ts, .component.ts, .directive.ts)
2. Search in template files (.html)
3. Search in test/story files (.spec.ts, .stories.ts)

```bash
# Use Grep for comprehensive search
grep -r "oldName" packages/ngx-foundation-sites/src/lib/[component]/
```

**Step 2**: Sort occurrences by file

- Group by file path
- Order: implementation → templates → tests → stories

**Step 3**: Edit each file sequentially

```typescript
// File 1: Implementation
Edit(
  file_path: "[path]",
  old_string: "[exact old text]",
  new_string: "[exact new text]"
)

// File 2: Template
Edit(
  file_path: "[path]",
  old_string: "[exact old text]",
  new_string: "[exact new text]"
)

// Continue for all files...
```

**Step 4**: Verify complete replacement

```bash
# Should return nothing
grep -r "oldName" packages/ngx-foundation-sites/src/lib/[component]/
```

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

</pattern_b>

#### Pattern C: Add Test (Storybook)

<pattern_c>

**Step 1**: Load story file

```typescript
Read('[component].stories.ts');
```

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

**Step 4**: Insert test (before export default or at end)

```typescript
Edit(
  file_path: "[stories path]",
  old_string: "[insertion context]",
  new_string: "[new story + insertion context]"
)
```

**Step 5**: Verify

```bash
# Run Storybook tests
nx test-storybook ngx-foundation-sites --story="[StoryName]"
```

**Success Criteria**:

- [ ] Story added with play function
- [ ] Test uses userEvent and expect
- [ ] Test passes in Storybook
- [ ] No AXE violations

</pattern_c>

#### Pattern D: Update Documentation

<pattern_d>

**Step 1**: Load documentation file

```typescript
Read('[doc-file].md');
```

**Step 2**: Identify update location (3-step reasoning)

1. Find relevant section header
2. Locate insertion/replacement point
3. Verify context matches task description

**Step 3**: Generate documentation content

- Follow existing documentation style
- Use consistent heading levels
- Include code examples if applicable
- Maintain markdown formatting

**Step 4**: Update using Edit

```typescript
Edit(
  file_path: "[doc path]",
  old_string: "[section to update]",
  new_string: "[updated section]"
)
```

**Step 5**: Verify

- [ ] Markdown syntax valid
- [ ] Code examples formatted correctly
- [ ] Links are valid (if any)
- [ ] Consistent with surrounding docs

**Success Criteria**:

- [ ] Content clear and accurate
- [ ] Examples work (if provided)
- [ ] Formatting consistent
- [ ] No broken links

</pattern_d>

#### Pattern E: Refactor (MEDIUM - with extended thinking)

<pattern_e>

**Extended Thinking Budget**: 2K-4K tokens

**Step 1**: Load and understand context

```typescript
Read('[file-to-refactor]');
// Read related files if dependencies mentioned
```

**Step 2**: Analyze refactoring scope (extended thinking enabled)
**Think through**:

1. What code is being moved/extracted?
2. What dependencies exist?
3. What tests need updating?
4. What imports need changing?

**Step 3**: Plan refactoring steps (3-5 bounded steps)

1. [Specific action 1]
2. [Specific action 2]
3. [Specific action 3]
4. [Verification step]

**Step 4**: Execute steps sequentially

```typescript
// Step-by-step edits with verification between steps
Edit(...)
// Verify TypeScript compiles
Edit(...)
// Verify tests pass
```

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

</pattern_e>

---

### Step 5: Track Progress

<progress_tracking>

**Update TodoWrite after each task**:

```typescript
// Starting task
TodoWrite([
  { content: 'Verify test environment', status: 'completed', activeForm: '...' },
  { content: 'T001: Add down() method', status: 'in_progress', activeForm: 'Implementing T001' },
  { content: 'T002: Add up() method', status: 'pending', activeForm: 'Implementing T002' },
  // ...
]);

// Completed task
TodoWrite([
  { content: 'Verify test environment', status: 'completed', activeForm: '...' },
  { content: 'T001: Add down() method', status: 'completed', activeForm: 'Implementing T001' },
  { content: 'T002: Add up() method', status: 'in_progress', activeForm: 'Implementing T002' },
  // ...
]);
```

**Provide conversational updates**:

```markdown
✅ T001 complete (2 min) - Added down() method to accordion-item-def.ts

- Followed pattern from existing expanded.set() calls
- TypeScript compilation: ✅
- Tests: ✅ passing

🔧 Starting T002: Add up() method...
```

</progress_tracking>

---

### Step 6: Post-Implementation Verification

<verification>

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

</verification>

---

### Step 7: Update Tracking Documents

<tracking_updates>

**Update haiku-suitable-tasks.md**:

Mark completed tasks with [X]:

```typescript
Edit(
  file_path: "[feature-dir]/haiku-suitable-tasks.md",
  old_string: "- [ ] T001",
  new_string: "- [X] T001"
)
```

**Add completion notes**:

```typescript
Edit(
  file_path: "[feature-dir]/haiku-suitable-tasks.md",
  old_string: "**Estimated Savings**:",
  new_string: `**Actual Performance**:
- **Tasks Completed**: [number] ([percentage]% of Haiku-suitable tasks)
- **Actual Time**: [X] minutes (estimated: [Y] minutes)
- **Speedup**: [Z]× faster than estimated Sonnet time
- **Cost**: $[amount] (66% savings vs Sonnet: $[saved])

**Estimated Savings**:`
)
```

**Update tasks.md** (original file):

Mark Haiku-completed tasks:

```typescript
// For each completed task
Edit(
  file_path: "[feature-dir]/tasks.md",
  old_string: "- [ ] T###",
  new_string: "- [X] T###"
)
```

</tracking_updates>

---

### Step 8: Create Git Commit

<commit_strategy>

**Commit grouping**:

- **Option 1**: One commit per task category (recommended for Haiku)
  - Commit 1: Method additions (T001-T005)
  - Commit 2: Test additions (T010-T015)
  - Commit 3: Documentation updates (T020-T022)

- **Option 2**: One commit for all Haiku tasks
  - Single commit: "feat(component): implement Haiku-suitable tasks"

**Commit message format** (conventional commits):

```bash
git add [files-changed]

git commit -m "feat([component]): implement [X] Haiku-optimized tasks

Implemented using Claude Haiku 4.5 for focused, bounded tasks:

Pattern A (Add Method): [Y] tasks
- T001: Add down() method to accordion-item
- T002: Add up() method to accordion-item
- T003: Add toggle() method to accordion-item

Pattern B (Add Test): [Z] tasks
- T010: Add Storybook test for down()
- T011: Add Storybook test for up()

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

</commit_strategy>

---

## Error Handling

<error_handling>

### Compilation Errors

```
❌ TypeScript compilation failed after T005

Error: Property 'down' does not exist on type 'NfsAccordionItemDef'
Location: accordion.component.ts:125

**Analysis** (3-step bounded):
1. Check if method was added to correct class
2. Verify method is public (not private)
3. Check if class is properly exported

**Fix**:
[Apply appropriate fix based on analysis]

**Verify**:
npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json
```

### Test Failures

```
❌ Test failed after T010: Expected 'true' but got 'false'

**Analysis** (3-step):
1. Review test assertion - what's expected?
2. Check implementation - does it match expectation?
3. Identify mismatch - test wrong or implementation wrong?

**Fix**:
[Adjust implementation or test based on analysis]

**Verify**:
npm run test -- [component-name]
```

### Pattern Mismatch

```
⚠️ Warning: Code doesn't match expected pattern

**Expected**: JSDoc with @public tag
**Found**: No JSDoc on added method

**Fix**: Add JSDoc per haiku-implementation-context.md template

**Verify**: Visual inspection + linting
```

</error_handling>

---

## Optimization Techniques (Haiku-Specific)

<haiku_optimizations>

**1. Concise Context Loading**:

- Load only haiku-implementation-context.md (not full spec/plan)
- Use focused pattern templates
- Avoid verbose explanations

**2. Step-Bounded Reasoning**:

- 3-5 steps maximum per task
- No open-ended exploration
- Clear decision points

**3. Pattern-Based Execution**:

- Match task to pattern (A, B, C, D, E)
- Apply template mechanically
- Verify against success criteria

**4. Explicit Validation**:

- Run verification after each task (not batched)
- Use checklist format for success criteria
- Stop immediately on failure

**5. Structured Output**:

- Use Edit tool for exact replacements
- Follow existing code style exactly
- No creative variations

**6. Extended Thinking (when needed)**:

- Enable for MEDIUM suitability tasks
- Budget: 2K-4K tokens
- Use for refactoring, moderate complexity

**7. Parallel Execution** (when marked [P]):

- Tasks with [P] marker can run concurrently in theory
- In practice: Execute sequentially for simpler tracking
- Document parallel opportunities for future optimization

</haiku_optimizations>

---

## Success Criteria (Overall)

<success_criteria>

**Before marking complete, verify**:

✅ **All Haiku-suitable tasks executed** (HIGH and MEDIUM)
✅ **All tests passing** (npm run test)
✅ **Build successful** (npm run build)
✅ **Linting clean** (npm run lint)
✅ **Storybook tests passing** (if applicable)
✅ **Tracking documents updated**:

- haiku-suitable-tasks.md (tasks marked [X], performance metrics added)
- tasks.md (completed tasks marked [X])
  ✅ **Git commit created** (conventional format with performance metrics)
  ✅ **TodoWrite reflects completion** (all items checked)

**Quality Verification**:
✅ **Pattern adherence**: All code follows existing patterns exactly
✅ **Type safety**: TypeScript compilation succeeds
✅ **Test coverage**: All new code has tests (if requested)
✅ **Documentation**: Updated if tasks included doc updates
✅ **No regressions**: Existing tests still pass

</success_criteria>

---

## Performance Reporting

<performance_report>

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

## Task Breakdown

**Pattern A (Add Method)**: [X] tasks in [Y] minutes

- Average: [Z] min/task (vs ~5 min with Sonnet)
- Speedup: ~[W]× faster

**Pattern B (Rename/Update)**: [X] tasks in [Y] minutes

- Average: [Z] min/task (vs ~3 min with Sonnet)
- Speedup: ~[W]× faster

**Pattern C (Add Test)**: [X] tasks in [Y] minutes

- Average: [Z] min/task (vs ~8 min with Sonnet)
- Speedup: ~[W]× faster

**Pattern D (Update Docs)**: [X] tasks in [Y] minutes

- Average: [Z] min/task (vs ~4 min with Sonnet)
- Speedup: ~[W]× faster

**Pattern E (Refactor - with extended thinking)**: [X] tasks in [Y] minutes

- Average: [Z] min/task (vs ~15 min with Sonnet)
- Speedup: ~[W]× faster

## Quality Metrics

✅ **TypeScript Compilation**: PASS
✅ **Linting**: PASS
✅ **Tests**: [X]/[X] passing (100%)
✅ **Storybook Tests**: [Y]/[Y] passing (100%)
✅ **AXE Violations**: 0
✅ **Regressions**: 0

## Comparison to Estimates

| Task ID | Estimated (Haiku) | Actual | Variance |
| ------- | ----------------- | ------ | -------- |
| T001    | 2 min             | 2 min  | 0%       |
| T002    | 2 min             | 1 min  | -50%     |
| T005    | 5 min             | 6 min  | +20%     |
| ...     | ...               | ...    | ...      |

**Average Variance**: [X]% (positive = slower than estimated)

## Next Steps

**Remaining Tasks** (Sonnet recommended):

- [x] tasks with LOW suitability (estimated [Y] min with Sonnet)
- Run `/speckit.implement` for these tasks

**Optional**:

- Review haiku-task-analysis.md and update classification based on actual performance
- Provide feedback for future Haiku task selection refinement

**Verification**:

- All changes committed: ✅
- Branch ready for PR: ✅
- No manual fixes needed: ✅
```

</performance_report>

---

## Best Practices (Haiku-Specific)

<best_practices>

**1. Load Minimal Context**:

- Use haiku-implementation-context.md (concise, focused)
- Don't load full spec.md or plan.md unless task references them
- Trust the focused context provided

**2. Follow Patterns Exactly**:

- Don't improvise or optimize
- Copy existing code style precisely
- Match indentation, naming, structure

**3. Verify Frequently**:

- Run TypeScript compilation after each task
- Run tests after code changes
- Catch errors early (cheaper to fix)

**4. Use Step-Bounded Reasoning**:

- 3-5 steps maximum
- No open-ended analysis
- Clear decision points

**5. Trust the Classification**:

- Tasks in haiku-suitable-tasks.md are pre-vetted
- If task seems complex, check suitability score
- If <75%, consider flagging for Sonnet review

**6. Track Progress Clearly**:

- Update TodoWrite after each task
- Provide conversational updates
- Show time per task for performance tracking

**7. Handle Errors Gracefully**:

- Stop on first failure
- Analyze with 3-step reasoning
- Fix immediately before continuing

**8. Document Performance**:

- Track actual time vs estimates
- Note any tasks that were harder than expected
- Provide metrics for future classification refinement

</best_practices>

---

## When NOT to Use This Command

<anti_patterns>

**Don't use `/implement-tasks-for-haiku-4-5` for**:

❌ **Architectural decisions**:

- Choosing state management approach
- Designing API structure
- Trade-off analysis

❌ **Complex multi-file refactoring**:

- Splitting components across files
- Reorganizing module structure
- Major restructuring

❌ **Deep reasoning tasks**:

- Root cause analysis for bugs
- Performance optimization planning
- Security vulnerability assessment

❌ **Tasks requiring >200K context**:

- Large feature implementation spanning many files
- Codebase-wide changes
- Complex dependency analysis

**For these, use**: `/speckit.implement` (Sonnet 4.5 with extended thinking)

</anti_patterns>

---

## Related Commands

- `/tasks-for-haiku-4-5` - Identifies Haiku-suitable tasks (run BEFORE this command)
- `/speckit.implement` - Full implementation command (Sonnet-based, for complex tasks)
- `/implement-gap-remediations` - Specialized gap remediation (Sonnet-based)

---

## Notes

- This command is **Haiku 4.5 optimized** (concise, pattern-based, bounded)
- Designed for **focused, bounded tasks** (HIGH and MEDIUM suitability)
- Uses **extended thinking** sparingly (only for MEDIUM tasks, 2K-4K budget)
- **Performance tracking** built-in (time, cost, speedup metrics)
- **Quality assurance** systematic (verify after each task, full suite at end)
- **Iterative refinement** supported (metrics feed back to classification)

**Expected Performance**:

- **Speed**: 2-5× faster than Sonnet on suitable tasks
- **Cost**: 66% cheaper ($1/$5 vs $3/$15 per 1M tokens)
- **Quality**: 90-95% of Sonnet for focused, pattern-based tasks
- **Best ROI**: Features with high proportion of mechanical tasks (renames, additions, tests, docs)
