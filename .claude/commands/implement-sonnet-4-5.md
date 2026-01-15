---
description: Execute implementation plan with Sonnet 4.5 optimizations - parallel context loading, extended thinking for complex tasks, error-first TDD
---

<role>
You are an expert implementation agent executing a systematic task-by-task implementation workflow, optimized for Claude Sonnet 4.5's strengths: 30+ hour focus, parallel tool use, extended thinking, and 0% error rate code editing.
</role>

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Sonnet 4.5 Optimization Strategy

**Key Optimizations Applied**:

1. **Parallel Context Loading** - Load multiple files simultaneously (10-20x speedup)
2. **Extended Thinking** - Use 16K budget for complex tasks, none for mechanical
3. **1M Context Window** - Available in Claude Code for large features (verified 2026-01-15)
   - Use for features >200K tokens (spec + plan + tasks + implementation files)
   - Premium pricing: 2x input / 1.5x output tokens
   - Eliminates progressive disclosure for most features
4. **Error-First TDD** - Write tests, run to get error, fix ONLY that error, repeat
5. **Minimal Implementation** - OUT OF SCOPE list prevents over-engineering
6. **State Tracking** - Mark tasks [X] immediately after completion
7. **Phase-Based Workflow** - Research → Setup → Implement → Verify → Complete

**References**:

- **Optimization Guide**: `prompt-engineering/CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md` - Detailed strategies
- **Beta Features** (verified 2026-01-15): `prompt-engineering/README.md#beta-feature-availability`
  - ✅ **Extended Thinking** (1K-64K budgets) - Used in phases 1, 3, 4 (lines 40, 219, 406)
  - ✅ **1M Context Window** - Available for large features (optimization #3)
  - ✅ **Structured Outputs** - Used for task parsing in Step 3.0 with fallback
  - ❌ **Effort Parameter** - Requires API key (unavailable for subscription-only users)

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths (e.g. avoid fallback paths like `/Users/...`).
- Treat paths emitted by the `.specify` PowerShell scripts (`-Json` output) as the **only source of truth**; use them verbatim.
- If a required path is missing/unclear, STOP and re-run the prerequisite script (or ask the user) instead of synthesizing a path.

---

## Phase 1: Deep Context Gathering (Research-First)

<phase name="context_gathering" extended_thinking="8K">

### Step 1.1: Run Prerequisites Check

```bash
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse output for:

- `FEATURE_DIR` (absolute path)
- `AVAILABLE_DOCS` (list of artifact paths)

All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: `'I'\''m Groot'` (or double-quote if possible: `"I'm Groot"`).

### Step 1.2: Parallel Artifact Loading

**Load ALL artifacts SIMULTANEOUSLY** (not sequentially):

```typescript
// Execute these in a SINGLE message (parallel tool use)
Read(FEATURE_DIR + '/spec.md');
Read(FEATURE_DIR + '/plan.md');
Read(FEATURE_DIR + '/tasks.md');
Read(FEATURE_DIR + '/data-model.md'); // if exists
Read(FEATURE_DIR + '/contracts/*.md'); // if exists
Read(FEATURE_DIR + '/research.md'); // if exists
Read(FEATURE_DIR + '/quickstart.md'); // if exists
Read('CONSTITUTION.md'); // project rules
```

**Speedup**: ~10-20x faster than sequential reads

### Step 1.3: Parallel Implementation File Discovery

**Glob for implementation files SIMULTANEOUSLY**:

```typescript
// Execute in SINGLE message
Glob(pattern: "packages/**/src/**/*.component.ts")
Glob(pattern: "packages/**/src/**/*.directive.ts")
Glob(pattern: "packages/**/src/**/*.service.ts")
Glob(pattern: "packages/**/src/**/*.types.ts")
```

### Step 1.4: Extended Thinking - Understand Architecture

**Use extended thinking** (8K budget) to reflect on:

<extended_thinking_prompt>
Think deeply about:

1. **Architecture**: What's the overall design approach?
2. **Dependencies**: What are the critical file/component dependencies?
3. **Edge Cases**: What error conditions need handling?
4. **Testing Strategy**: What's the test coverage requirement?
5. **Implementation Order**: Are there dependencies between tasks?

After thinking, summarize your understanding for the user.
</extended_thinking_prompt>

**Output to user**:

```
✅ Context loaded (parallel tool use: 8 artifacts in ~15 seconds)

**Summary**:
- Feature: [name from spec.md]
- Tasks: [count] ([P0 count] P0, [P1 count] P1, [P2 count] P2)
- Architecture: [brief summary]
- Critical dependencies: [list]
- Test strategy: [summary]

Ready to proceed with implementation.
```

</phase>

---

## Phase 2: Setup Verification (Systematic)

<phase name="setup_verification" extended_thinking="false">

### Step 2.1: Check Checklists Status

IF `FEATURE_DIR/checklists/` exists:

- Scan all checklist files in the checklists/ directory
- For each checklist, count:
  - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
  - Completed items: Lines matching `- [X]` or `- [x]`
  - Incomplete items: Lines matching `- [ ]`
- Create a status table:

  ```text
  | Checklist | Total | Completed | Incomplete | Status |
  |-----------|-------|-----------|------------|--------|
  | ux.md     | 12    | 12        | 0          | ✓ PASS |
  | test.md   | 8     | 5         | 3          | ✗ FAIL |
  ```

- **If any checklist is incomplete**:
  - Display the table with incomplete item counts
  - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
  - Wait for user response before continuing

- **If all checklists are complete**:
  - Display the table showing all checklists passed
  - Automatically proceed to next step

### Step 2.2: Project Setup Verification

**Reference**: See `shared/ignore-patterns.md` for complete detection logic and technology-specific patterns.

**Quick Reference** (detection triggers):

- Git repo detected → verify/create `.gitignore`
- Dockerfile found → verify/create `.dockerignore`
- ESLint config found → verify/create `.eslintignore` or update `ignores`
- Prettier config found → verify/create `.prettierignore`
- Package publishing → verify/create `.npmignore`
- Terraform files → verify/create `.terraformignore`
- Helm charts → verify/create `.helmignore`

Apply patterns from `shared/ignore-patterns.md` based on detected technology stack.

### Step 2.3: Create TODO List

Use **TodoWrite** to create task tracking:

```typescript
TodoWrite([
  { content: 'Setup verification', status: 'completed', activeForm: 'Setting up verification' },
  { content: 'T1.1: [Task description]', status: 'pending', activeForm: 'Implementing T1.1' },
  { content: 'T1.2: [Task description]', status: 'pending', activeForm: 'Implementing T1.2' },
  // ... all tasks from tasks.md
  { content: 'Verification', status: 'pending', activeForm: 'Verifying implementation' },
  { content: 'Completion', status: 'pending', activeForm: 'Completing implementation' },
]);
```

</phase>

---

## Phase 3: Implementation (Error-First TDD)

<phase name="implementation" extended_thinking="16K">

### Implementation Constraints (CRITICAL - Prevents Over-Engineering)

**OUT OF SCOPE** (do NOT implement unless explicitly in tasks.md):

- ❌ Performance optimizations beyond requirements
- ❌ Refactoring existing working code
- ❌ Additional features "while we're here"
- ❌ Documentation beyond JSDoc on changed functions
- ❌ Extra error handling beyond spec requirements
- ❌ Additional tests beyond coverage requirements

**IN SCOPE** (implement ONLY these):

- ✅ Exact requirements from tasks.md
- ✅ Tests specified in tasks.md
- ✅ Error handling specified in spec.md
- ✅ Accessibility requirements from spec.md
- ✅ Type safety for changed code

### Step 3.0: Parse Task Structure with Structured Outputs (Beta)

**Reference**: See `shared/task-parsing-schema.md` for complete JSON schema and parsing instructions.

**Sonnet-Specific Application**:

- Use structured outputs (beta) for reliable task extraction
- Automatically falls back to text-based parsing if unavailable
- Use parsed complexity to determine extended thinking budget

**Quick Reference**:

| Parsed Complexity  | Sonnet 4.5 Action            |
| ------------------ | ---------------------------- |
| `"simple"`         | No extended thinking         |
| `"moderate"`       | 4K-8K extended thinking      |
| `"complex"`        | 16K+ extended thinking       |
| `isParallel: true` | Batch with other `[P]` tasks |

**⚠️ Beta Feature Note**: Structured outputs verified 2026-01-15. Falls back to text parsing automatically.

### Implementation Loop (FOR EACH Task in tasks.md)

#### Step 3.1: Read Task from tasks.md

Load the current task to implement.

#### Step 3.2: Determine Complexity

**Use Extended Thinking for Complex Tasks**:

| Task Type                                          | Extended Thinking | Budget |
| -------------------------------------------------- | ----------------- | ------ |
| **State management, multi-component coordination** | ✅ Yes            | 16K+   |
| **Error handling, diagnostics**                    | ✅ Yes            | 16K    |
| **Accessibility integration, keyboard navigation** | ✅ Yes            | 16K    |
| **Simple methods, properties, types**              | ❌ No             | 0      |
| **Test writing, story creation**                   | ⚠️ Maybe          | 4K-8K  |
| **File operations, running commands**              | ❌ No             | 0      |

**Extended Thinking Prompt** (for complex tasks):

<extended_thinking_prompt_complex_task>
Think deeply about:

1. **Minimal approach**: What's the SMALLEST implementation that satisfies this task?
2. **Edge cases**: What can go wrong? (disabled state, SSR, animations, null/undefined)
3. **Dependencies**: Does this task depend on other completed tasks?
4. **Testing**: What tests are needed to verify correctness?
5. **Accessibility**: Are there ARIA implications?

After thinking, implement the minimal viable solution.
</extended_thinking_prompt_complex_task>

#### Step 3.3: Error-First TDD Implementation

**IF task requires tests**:

##### 3.3.1: Write Failing Test First

```typescript
// Storybook play function or unit test
export const FeatureTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test the expected behavior
    const element = canvas.getByRole('button');
    await userEvent.click(element);
    await expect(element).toHaveAttribute('aria-expanded', 'true');
  },
};
```

##### 3.3.2: Run Test - Capture EXACT Error

```bash
npm run test -- [test-file-name]
# OR
npm run test-storybook -- [story-name]
```

**Read the error output carefully**. Example:

```
Error: Unable to find role="button"
```

##### 3.3.3: Fix ONLY the Current Error

Don't implement the whole feature. Fix the ONE error:

```typescript
// Add button element
<button role="button">Click me</button>
```

##### 3.3.4: Run Test Again - Get NEXT Error

```bash
npm run test -- [test-file-name]
```

**Next error**:

```
Expected attribute aria-expanded="true" but got null
```

##### 3.3.5: Fix ONLY That Error

```typescript
// Add aria-expanded
<button
  role="button"
  [attr.aria-expanded]="expanded()">
  Click me
</button>
```

##### 3.3.6: Repeat Until All Tests Pass

Continue error → fix → verify loop until:

```
✅ All tests passed
```

**IF task does NOT require tests**:

- Implement the task directly (use minimal approach from extended thinking if complex)
- Run linter to check code quality
- Verify build still succeeds

#### Step 3.4: Immediate State Tracking

**Mark task complete IMMEDIATELY**:

```typescript
// Update tasks.md
Edit(
  file_path: FEATURE_DIR + "/tasks.md",
  old_string: "- [ ] T1.1: [description]",
  new_string: "- [X] T1.1: [description]"
)

// Update TodoWrite
TodoWrite([
  { content: 'Setup verification', status: 'completed', activeForm: 'Setting up verification' },
  { content: 'T1.1: [Task description]', status: 'completed', activeForm: 'Implementing T1.1' },
  { content: 'T1.2: [Task description]', status: 'in_progress', activeForm: 'Implementing T1.2' },
  // ...
]);
```

**NEVER**:

- ❌ Mark task complete if tests fail
- ❌ Mark multiple tasks complete before implementing them
- ❌ Forget to update both tasks.md AND TodoWrite

#### Step 3.5: Continue to Next Task

Repeat Steps 3.1-3.4 for each task in tasks.md, in order.

**Respect dependencies**:

- Sequential tasks: Complete in order
- Parallel tasks `[P]`: Can implement simultaneously
  - **Error handling**: Continue with successful parallel tasks, report failed ones separately
- File-based coordination: Tasks touching same files must be sequential

</phase>

---

## Phase 4: Integration Verification

<phase name="verification" extended_thinking="8K">

### Step 4.1: Run Full Test Suite

```bash
npm run test
```

**IF failures**: Fix issues before proceeding. Do NOT mark verification complete if tests fail.

### Step 4.2: Run Linter

```bash
npm run lint
```

**IF errors**: Fix linting issues before proceeding.

### Step 4.3: Run Build

```bash
npm run build
```

**IF build fails**: Fix compilation errors before proceeding.

### Step 4.4: Extended Thinking - Integration Check

**Use extended thinking** (8K budget) to reflect:

<extended_thinking_prompt_integration>
Think deeply about:

1. **Integration issues**: Do the implemented tasks work together correctly?
2. **Edge cases**: Did I handle all edge cases from the spec?
3. **Accessibility**: Are ARIA attributes correctly applied across all components?
4. **Performance**: Are there any obvious performance issues?
5. **Test coverage**: Do tests cover the critical paths?

After thinking, report any concerns or confirm readiness for completion.
</extended_thinking_prompt_integration>

**IF concerns found**: Address them before marking verification complete.

**IF all checks pass**:

```
✅ Verification complete!

- Tests: [X passing]
- Linting: ✅ Clean
- Build: ✅ Successful
- Integration: ✅ No issues detected

Ready for completion phase.
```

</phase>

---

## Phase 5: Completion & Documentation

<phase name="completion" extended_thinking="false">

### Step 5.1: Final tasks.md Update

Ensure ALL tasks are marked [X] in tasks.md.

### Step 5.2: Create Git Commit(s)

**Reference**: See `shared/commit-templates.md` for complete commit message templates.

**Conventional commit format** (Sonnet 4.5 co-author):

```bash
git add [relevant files]

git commit -m "$(cat <<'EOF'
feat([component]): implement [feature name]

Implement [N] tasks from tasks.md:
- [T1.1 brief description]
- [T1.2 brief description]
- [T1.3 brief description]

Tests: [N] new tests (all passing)
Coverage: [X]% (meets requirement)

[If applicable]
BREAKING CHANGES:
- **[component]**: [description of breaking change]
  - Migration: [how to update code]

Closes: #[issue-number]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

**For breaking changes** (P0 fixes like API renames):

- Document in commit message under "BREAKING CHANGES:"
- Include migration path
- Consider updating CHANGELOG.md

### Step 5.3: Report Completion Summary

```markdown
🎉 Implementation Complete!

**Summary**:

- Tasks completed: [X]/[Y]
- Priority: [P0/P1/P2 breakdown]
- Implementation time: [estimated] vs [actual]
- Tests: ✅ [X] passing
- Linting: ✅ Clean
- Build: ✅ Successful
- Commits: [N] created

**Updated Documents**:

- ✅ tasks.md (all tasks marked [X])
- ✅ Git history (conventional commits)

**Next Steps**:

- Create PR for review
- Run `/analyze-report-gaps-gpt-5-mini` or `/analyze-report-gaps-gpt-4-1` to verify no new gaps introduced
```

</phase>

---

## Progress Tracking Throughout

**Use TodoWrite** to provide real-time progress updates:

```typescript
// At start of new task
TodoWrite([
  { content: 'T1.1: Component class', status: 'completed', activeForm: 'Implementing T1.1' },
  { content: 'T1.2: Methods', status: 'in_progress', activeForm: 'Implementing T1.2' },
  { content: 'T1.3: ARIA', status: 'pending', activeForm: 'Implementing T1.3' },
]);

// After completing task
TodoWrite([
  { content: 'T1.1: Component class', status: 'completed', activeForm: 'Implementing T1.1' },
  { content: 'T1.2: Methods', status: 'completed', activeForm: 'Implementing T1.2' },
  { content: 'T1.3: ARIA', status: 'in_progress', activeForm: 'Implementing T1.3' },
]);
```

**Conversational updates** after each task:

```markdown
✅ T1.2 complete - Added expand(), collapse(), toggle() methods

- Implementation: 3 methods in accordion-item.ts
- Tests: 3 new tests (all passing)
- Time: 3 minutes (estimated: 3 minutes)

Moving to T1.3: ARIA attributes integration...
```

---

## Error Handling

**Reference**: See `shared/error-handling.md` for complete error response patterns.

### Sonnet-Specific Error Handling

**Error-First TDD Approach**: When errors occur during TDD cycle:

1. **Read the EXACT error** - Don't assume, read the actual message
2. **Fix ONLY that error** - Minimal fix, don't over-engineer
3. **Re-run test** - Get next error or confirmation of success
4. **Repeat** - Continue until all tests pass

### Quick Reference

| Error Type            | Action                                             |
| --------------------- | -------------------------------------------------- |
| Compilation           | Fix immediately, don't continue to next task       |
| Test Failure          | Debug and fix before marking task complete         |
| Linting               | Fix all issues before proceeding to commit         |
| Parallel Task Failure | Continue with successful tasks, report failed ones |

See `shared/error-handling.md` for detailed response templates and recovery procedures.

---

## Success Criteria

After execution:

✅ **All tasks marked [X]** in tasks.md
✅ **All tests passing** (npm run test)
✅ **Linting clean** (npm run lint)
✅ **Build successful** (npm run build)
✅ **Git commits created** (conventional format)
✅ **TodoWrite reflects completion** (all items checked)
✅ **User receives summary** with next steps

---

## Optimization Impact

**Compared to standard `/speckit.implement`**:

| Metric                    | Standard  | Sonnet 4.5 Optimized             | Improvement   |
| ------------------------- | --------- | -------------------------------- | ------------- |
| **Context loading**       | 3-5 min   | 15-30 sec                        | 10-20x faster |
| **Implementation**        | 45-60 min | 28-35 min                        | 30-40% faster |
| **Code quality**          | Good      | Excellent (0% error rate)        | Better        |
| **Over-engineering risk** | Moderate  | Low (OUT OF SCOPE list)          | Lower         |
| **State tracking**        | Manual    | Automatic (TodoWrite + tasks.md) | Better        |

**Total speedup**: ~37% faster overall, with better quality

---

## Related Commands

- `/speckit.implement` - Standard implementation command (not Sonnet-optimized)
- `/implement-reported-gaps` - Specialized for gap remediation
- `/implement-tasks-for-haiku-4-5` - Haiku 4.5 optimization (simpler tasks)
- `/analyze-report-gaps-gpt-5-mini` or `/analyze-report-gaps-gpt-4-1` - Verify no new gaps after implementation

---

## Notes

- This command is **Sonnet 4.5 optimized** - uses parallel tool calls, extended thinking, error-first TDD
- **Context windows**: 200K (standard) or 1M (see optimization #3 above)
- For features >200K: See "1M Context Window" in Key Optimizations
- Uses **TodoWrite for progress tracking** (visible to user)
- **Stops on test failures** - ensures quality at each step
- **Commits incrementally** - logical commit boundaries for clean history
- **Prerequisites**: This command requires a complete task breakdown in tasks.md. If tasks are incomplete or missing, run `/speckit.tasks` first to regenerate the task list.

---

**Reference Documentation**: `prompt-engineering/CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md`

**Shared Resources** (generic procedures):

- `shared/task-parsing-schema.md` - JSON schema for task extraction
- `shared/verification-workflow.md` - Standard test/lint/build steps
- `shared/ignore-patterns.md` - Technology-specific ignore patterns
- `shared/commit-templates.md` - Conventional commit formats
- `shared/error-handling.md` - Error response patterns
- `shared/DESIGN-PRINCIPLES.md` - How shared resources work with model-specific optimizations

**Optimization Source**: Research-backed strategies from Anthropic, InfoWorld, Composio, Surge AI (2026)
