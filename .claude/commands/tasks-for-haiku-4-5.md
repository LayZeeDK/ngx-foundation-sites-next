---
description: Analyze tasks.md and identify tasks suitable for Claude Haiku 4.5 implementation. Creates optimized artifacts for fast, cost-effective execution.
---

# Haiku-Suitable Task Identification

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
Analyze tasks.md and identify tasks suitable for Claude Haiku 4.5 implementation based on task complexity, scope, and clarity.

Create optimized artifacts:

- haiku-suitable-tasks.md (filtered task list)
- haiku-implementation-context.md (focused context for Haiku)
- Task suitability analysis report
  </goal>

## Model Selection Rationale

**Claude Haiku 4.5 Strengths:**

- 2-5× faster than Sonnet 4.5
- 66% cheaper than Sonnet ($1/$5 per 1M tokens vs $3/$15)
- 90% of Sonnet's agentic performance
- Optimized for: focused tasks, pattern matching, mechanical transformations

**Ideal Task Characteristics:**

- ✅ Single file changes with clear scope
- ✅ Pattern-based implementations (follow existing code)
- ✅ Simple CRUD operations
- ✅ UI updates with explicit specifications
- ✅ Test writing from existing patterns
- ✅ Documentation updates
- ✅ Clear acceptance criteria
- ✅ Tasks with explicit file paths
- ✅ Tasks marked [P] (parallel/independent)

**Unsuitable Task Characteristics:**

- ❌ Deep multi-step reasoning required
- ❌ Complex synthesis across many documents
- ❌ Architectural decisions or design trade-offs
- ❌ Multi-file refactoring with complex dependencies
- ❌ Ambiguous requirements needing clarification
- ❌ Tasks requiring >200K context

## Outline

### Step 1: Setup & Path Discovery

Run prerequisite check from repository root:

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON output for:**

- `FEATURE_DIR`: Absolute path to feature directory
- `AVAILABLE_DOCS`: List of existing files

**Derive paths:**

- `TASKS` = FEATURE_DIR/tasks.md (REQUIRED)
- `SPEC` = FEATURE_DIR/spec.md (OPTIONAL - for context)
- `PLAN` = FEATURE_DIR/plan.md (OPTIONAL - for file structure)
- `OUTPUT_TASKS` = FEATURE_DIR/haiku-suitable-tasks.md
- `OUTPUT_CONTEXT` = FEATURE_DIR/haiku-implementation-context.md
- `OUTPUT_ANALYSIS` = FEATURE_DIR/haiku-task-analysis.md

### Step 2: Load Context Documents

**Load in this order:**

1. **tasks.md** (REQUIRED):
   - Parse all task phases
   - Extract task IDs, descriptions, file paths, markers
   - Identify dependencies and parallel opportunities

2. **spec.md** (OPTIONAL):
   - Load user stories for context
   - Understand feature requirements

3. **plan.md** (OPTIONAL):
   - Load tech stack and file structure
   - Understand project architecture

### Step 3: Analyze Task Suitability

For each task in tasks.md, evaluate against these criteria:

<suitability_criteria>

**Score each task 0-10 on these dimensions:**

1. **Scope Clarity (0-10)**:
   - 10: Exact file path, clear action, explicit acceptance criteria
   - 5: File mentioned, action somewhat clear, implicit criteria
   - 0: Vague location, ambiguous action, no clear success definition

2. **Complexity (0-10)**:
   - 10: Simple pattern-based edit (rename, copy-paste, add method)
   - 5: Moderate logic (conditional logic, basic algorithms)
   - 0: Complex reasoning (architectural decisions, trade-off analysis)

3. **Dependencies (0-10)**:
   - 10: Fully independent ([P] marker, no blocking dependencies)
   - 5: Sequential but clear prerequisites
   - 0: Complex multi-task dependencies, unclear ordering

4. **Pattern Recognition (0-10)**:
   - 10: Follows existing pattern in codebase (copy similar code)
   - 5: Partially follows patterns, some new logic needed
   - 0: Novel implementation, no existing patterns

**Suitability Score Calculation:**

```
total_score = scope_clarity + complexity + dependencies + pattern_recognition
suitability = total_score / 40 * 100
```

**Classification:**

- **HIGH** (≥75%): Perfect for Haiku 4.5 - fast, reliable execution
- **MEDIUM** (50-74%): Suitable with extended thinking (2K-4K budget)
- **LOW** (<50%): Better suited for Sonnet 4.5 - needs deep reasoning

</suitability_criteria>

<task_pattern_detection>

**Automatically classify tasks by pattern:**

**Pattern A: Rename/Update (HIGH suitability)**:

- Keywords: "rename", "update name", "change from X to Y"
- Characteristics: Find-replace operation, multiple file edits
- Example: "Rename multiExpandable → multiExpand"

**Pattern B: Add Method/Property (HIGH suitability)**:

- Keywords: "add method", "implement method", "create property"
- Characteristics: Insert code block, follow existing method patterns
- Example: "Add down() method to accordion-item"

**Pattern C: Add Test (HIGH suitability)**:

- Keywords: "add test", "write test", "test coverage"
- Characteristics: Follow existing test patterns, clear assertions
- Example: "Add Storybook play function for toggle() method"

**Pattern D: Update Documentation (HIGH suitability)**:

- Keywords: "update docs", "add example", "document API"
- Characteristics: Write prose, code snippets, markdown formatting
- Example: "Update API_REFERENCE.md with new inputs"

**Pattern E: Refactor (MEDIUM-LOW suitability)**:

- Keywords: "refactor", "reorganize", "extract", "split"
- Characteristics: Structural changes, requires understanding context
- Example: "Extract validation logic to separate service"

**Pattern F: Design/Architecture (LOW suitability)**:

- Keywords: "design", "choose", "decide", "architect"
- Characteristics: Requires reasoning about trade-offs
- Example: "Design state management approach"

**Pattern G: Complex Integration (LOW suitability)**:

- Keywords: "integrate", "coordinate", "sync across"
- Characteristics: Multi-file coordination, implicit dependencies
- Example: "Integrate ErrorHandler with all components"

</task_pattern_detection>

### Step 4: Generate Haiku-Suitable Task List

Create `haiku-suitable-tasks.md` with:

<output_structure>

```markdown
# Haiku-Suitable Tasks: [Feature Name]

**Generated**: [Date]
**Source**: tasks.md
**Haiku Model**: Claude Haiku 4.5 (200K context, $1/$5 per 1M tokens)

**Optimization Strategy**: Fast execution for focused, bounded tasks

---

## Task Summary

- **Total Tasks in tasks.md**: [number]
- **Haiku-Suitable (HIGH)**: [number] ([percentage]%)
- **Haiku-Suitable (MEDIUM)**: [number] ([percentage]%)
- **Sonnet-Recommended (LOW)**: [number] ([percentage]%)

**Estimated Savings**:

- **Time**: ~[X]× faster with Haiku on suitable tasks
- **Cost**: 66% cheaper ($[amount] vs $[amount])

---

## Phase 1: [Phase Name]

**Suitability**: [HIGH/MEDIUM/LOW overall for this phase]

### HIGH Suitability Tasks (Haiku Recommended)

- [ ] T001 [P] [Pattern: Add Method] Description with file path
  - **Suitability Score**: 85% (Scope: 9/10, Complexity: 10/10, Dependencies: 10/10, Pattern: 8/10)
  - **Estimated Time (Haiku)**: 2-5 minutes
  - **Context Needed**: Existing method patterns from [file]

- [ ] T002 [P] [Pattern: Update Docs] Description with file path
  - **Suitability Score**: 95% (Scope: 10/10, Complexity: 10/10, Dependencies: 10/10, Pattern: 10/10)
  - **Estimated Time (Haiku)**: 1-3 minutes
  - **Context Needed**: API reference format from [file]

### MEDIUM Suitability Tasks (Haiku with Extended Thinking)

- [ ] T003 [Pattern: Refactor] Description with file path
  - **Suitability Score**: 65% (Scope: 8/10, Complexity: 5/10, Dependencies: 7/10, Pattern: 6/10)
  - **Estimated Time (Haiku)**: 10-15 minutes
  - **Extended Thinking Budget**: 2K-4K tokens
  - **Context Needed**: Full class context, dependency graph

---

## Phase 2: [Next Phase]

[Repeat structure...]

---

## Excluded Tasks (Sonnet Recommended)

**These tasks require Sonnet 4.5's deeper reasoning:**

- [ ] T015 [LOW: 35%] Design state management approach
  - **Reason**: Architectural decision, trade-off analysis required
  - **Sonnet Advantages**: Extended thinking, multi-file context synthesis

- [ ] T022 [LOW: 40%] Integrate ErrorHandler across all components
  - **Reason**: Complex coordination, implicit dependencies
  - **Sonnet Advantages**: Better at detecting subtle interactions

---

## Implementation Strategy

**Recommended Approach**:

1. **Haiku First**: Execute all HIGH suitability tasks in parallel where possible
2. **Haiku with Thinking**: Execute MEDIUM tasks with 2K-4K thinking budget
3. **Sonnet for Complexity**: Hand off LOW suitability tasks to Sonnet 4.5

**Expected Performance**:

- **Haiku tasks**: 2-5× faster than Sonnet, 66% cost savings
- **Total feature time**: Reduced by ~40-60% (depending on task mix)
- **Quality**: 90-95% of Sonnet for suitable tasks

---

## Next Steps

1. Review this analysis for accuracy
2. Run `/implement-tasks-for-haiku-4-5` to execute Haiku-suitable tasks
3. Use `/speckit.implement` for remaining Sonnet-recommended tasks
4. Compare actual vs estimated performance
```

</output_structure>

### Step 5: Generate Implementation Context for Haiku

Create `haiku-implementation-context.md` with focused, concise context:

<context_structure>

```markdown
# Haiku Implementation Context: [Feature Name]

**Purpose**: Provide minimal, focused context for Claude Haiku 4.5 task execution

---

## Project Structure (Focused)

**Only include files relevant to Haiku-suitable tasks:**
```

packages/
ngx-foundation-sites/
src/
lib/
[component]/
[relevant files only]

````

---

## Code Patterns (Concise)

### Pattern: Add Method

**Template**:
```typescript
/**
 * [Brief description]
 * @public
 */
methodName(): ReturnType {
  // Implementation
}
````

**Example from existing code**: [file:line]

### Pattern: Add Test

**Template**:

```typescript
export const StoryName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Assertions
  },
};
```

**Example from existing code**: [file:line]

---

## File Path Reference (Exact)

**All file paths from Haiku-suitable tasks:**

- src/lib/accordion/accordion.component.ts
- src/lib/accordion/accordion.component.html
- src/lib/accordion/accordion.stories.ts
- [etc.]

---

## Success Criteria (Per Task Type)

**Add Method**:

- [ ] Method added with JSDoc
- [ ] TypeScript compilation succeeds
- [ ] Method follows existing pattern
- [ ] Exports updated if needed

**Add Test**:

- [ ] Test added to story
- [ ] Test uses userEvent and expect
- [ ] Test passes in Storybook
- [ ] No AXE violations

**Update Docs**:

- [ ] Content clear and accurate
- [ ] Code examples work
- [ ] Markdown formatting correct
- [ ] Links valid

---

## Constraints (Explicit)

- **NO** architectural changes
- **NO** multi-file refactoring beyond explicit task scope
- **FOLLOW** existing patterns exactly
- **PRESERVE** code style and formatting
- **VERIFY** TypeScript compilation after each change

````

</context_structure>

### Step 6: Generate Analysis Report

Create `haiku-task-analysis.md` with detailed breakdown:

<analysis_structure>

```markdown
# Haiku Task Suitability Analysis: [Feature Name]

**Generated**: [Date]
**Analyzer**: Claude Sonnet 4.5
**Target Model**: Claude Haiku 4.5

---

## Executive Summary

**Tasks Analyzed**: [number]
**Haiku-Suitable (HIGH)**: [number] ([percentage]%) - **Recommended for Haiku**
**Haiku-Suitable (MEDIUM)**: [number] ([percentage]%) - **Haiku with extended thinking**
**Sonnet-Recommended (LOW)**: [number] ([percentage]%) - **Keep on Sonnet**

**Estimated Performance Gain**:
- **Speed**: [X]× faster on Haiku-suitable tasks
- **Cost Savings**: $[amount] (66% reduction on [number] tasks)
- **Quality**: Expected 90-95% match with Sonnet

---

## Detailed Task Analysis

### Task: T001 - [Description]

**Classification**: HIGH (85%)
**Pattern**: Add Method
**File**: [path]

**Scores**:
- Scope Clarity: 9/10 (exact file, clear method signature)
- Complexity: 10/10 (simple setter, follows pattern)
- Dependencies: 10/10 (no blocking dependencies)
- Pattern Recognition: 8/10 (similar methods exist)

**Rationale**:
Straightforward method addition following existing patterns in the same file. Haiku can copy the pattern from similar methods and adapt the implementation.

**Haiku Optimization**:
- Provide existing method as template
- Specify exact insertion point
- Include JSDoc format from similar methods
- Verify with TypeScript compilation

**Estimated Time**:
- Sonnet 4.5: 3-5 minutes
- Haiku 4.5: 1-2 minutes (2-3× faster)

---

### Task: T002 - [Description]

[Repeat for each task...]

---

## Pattern Distribution

| Pattern Type        | Count | Avg Suitability | Haiku Recommended |
|---------------------|-------|-----------------|-------------------|
| Add Method/Property | 12    | 88%             | ✅ Yes            |
| Add Test            | 8     | 92%             | ✅ Yes            |
| Update Docs         | 5     | 95%             | ✅ Yes            |
| Rename/Update       | 3     | 85%             | ✅ Yes            |
| Refactor            | 7     | 58%             | ⚠️ Medium         |
| Integration         | 4     | 35%             | ❌ No (Sonnet)    |
| Architecture        | 2     | 25%             | ❌ No (Sonnet)    |

---

## Phase-by-Phase Breakdown

### Phase 1: Setup
- **Total Tasks**: [number]
- **Haiku-Suitable**: [number] ([percentage]%)
- **Recommendation**: [Mostly Haiku / Mixed / Mostly Sonnet]

### Phase 2: Foundational
- **Total Tasks**: [number]
- **Haiku-Suitable**: [number] ([percentage]%)
- **Recommendation**: [Mostly Haiku / Mixed / Mostly Sonnet]

[Continue for all phases...]

---

## Implementation Strategy

### Option 1: Parallel Haiku/Sonnet (Recommended)

**Haiku stream** executes HIGH suitability tasks:
- Tasks: T001, T002, T005, T007, T008, T011...
- Estimated time: [X] minutes
- Cost: $[amount]

**Sonnet stream** executes LOW suitability tasks:
- Tasks: T015, T022, T030...
- Estimated time: [Y] minutes
- Cost: $[amount]

**Total time**: MAX([X], [Y]) minutes (parallel execution)
**Total cost**: $[amount Haiku] + $[amount Sonnet]
**Savings**: [Z] minutes, $[amount saved]

### Option 2: Sequential (Simpler)

1. Run Haiku on HIGH tasks first
2. Run Haiku with extended thinking on MEDIUM tasks
3. Hand off to Sonnet for LOW tasks

**Total time**: [X + Y + Z] minutes (sequential)
**Total cost**: Same as Option 1
**Advantage**: Simpler coordination, easier to track

---

## Quality Assurance Strategy

**After Haiku execution:**

1. **TypeScript Compilation Check**:
   - Run `npm run build` to verify no type errors
   - Haiku's pattern-based approach should maintain type safety

2. **Test Execution**:
   - Run `npm run test` for unit tests
   - Run `nx test-storybook` for Storybook tests
   - Expected: 100% pass rate on Haiku-written tests

3. **Linting Check**:
   - Run `npm run lint` to verify code style
   - Haiku follows existing patterns, should pass

4. **Manual Review** (Selective):
   - Spot-check 2-3 Haiku implementations
   - Compare against similar Sonnet implementations
   - Measure quality consistency

---

## Risk Assessment

**Low Risk Tasks** (Haiku HIGH suitability):
- Pattern-based edits with clear examples
- Documentation updates
- Simple test additions
- Risk: <5% chance of needing rework

**Medium Risk Tasks** (Haiku MEDIUM suitability):
- Moderate refactoring with clear scope
- Tasks needing light reasoning
- Risk: 10-20% chance of needing Sonnet review

**High Risk Tasks** (LOW suitability - use Sonnet):
- Architectural decisions
- Complex multi-file coordination
- Risk: 40-60% chance of issues if attempted with Haiku

---

## Recommendations

1. ✅ **Use Haiku 4.5 for [X] HIGH suitability tasks** (expected 2-5× speedup, 66% cost savings)

2. ⚠️ **Use Haiku with extended thinking (2K-4K budget) for [Y] MEDIUM tasks** (slight speedup, same cost savings)

3. ❌ **Keep [Z] LOW suitability tasks on Sonnet 4.5** (better suited for complexity)

4. 📊 **Track performance metrics** to refine classification:
   - Haiku execution time vs estimates
   - Quality comparison (tests passing, rework needed)
   - Cost savings vs estimates

5. 🔄 **Iterate classification** based on results:
   - If Haiku consistently excels on MEDIUM tasks, lower threshold
   - If Haiku struggles on certain HIGH patterns, adjust scoring

---

## Next Steps

1. **Review this analysis** - validate task classifications
2. **Run `/implement-tasks-for-haiku-4-5`** - execute Haiku-suitable tasks
3. **Monitor execution** - track time, cost, quality
4. **Compare results** - refine future classifications
5. **Update optimization guide** - contribute learnings back

````

</analysis_structure>

### Step 7: Report Completion

<output_format>

**✅ Haiku Task Analysis Complete**

**Files Generated**:

1. **haiku-suitable-tasks.md** - Filtered task list with suitability scores
2. **haiku-implementation-context.md** - Focused context for Haiku execution
3. **haiku-task-analysis.md** - Detailed analysis report

**Summary**:

- **Total Tasks Analyzed**: [number]
- **Haiku-Suitable (HIGH)**: [number] ([percentage]%) - Recommended
- **Haiku-Suitable (MEDIUM)**: [number] ([percentage]%) - With extended thinking
- **Sonnet-Recommended (LOW)**: [number] ([percentage]%) - Keep on Sonnet

**Estimated Savings**:

- **Time**: [X]× faster on [number] tasks (~[Y] minutes saved)
- **Cost**: $[amount] saved (66% on Haiku tasks)

**Recommended Next Step**:
Run `/implement-tasks-for-haiku-4-5` to execute the [number] Haiku-suitable tasks.

**Alternative**:
Review haiku-task-analysis.md for detailed reasoning, then proceed.

</output_format>

---

## Optimization Notes

<optimization_strategy>

**Why This Command Uses Sonnet 4.5**:

This analysis command itself should use **Sonnet 4.5**, not Haiku, because:

1. **Requires reasoning** about task complexity and suitability
2. **Judgment calls** needed for classification (not mechanical)
3. **One-time cost** (run once per feature, not per task)
4. **Quality matters** - wrong classification reduces Haiku benefits

**Command Execution Time**: 2-5 minutes (acceptable for one-time analysis)

**ROI**: Spending 2-5 minutes with Sonnet to properly classify tasks saves 40-60% time on implementation

</optimization_strategy>

## Related Commands

- `/speckit.tasks` - Generates original tasks.md (run before this command)
- `/implement-tasks-for-haiku-4-5` - Executes Haiku-suitable tasks (run after this command)
- `/speckit.implement` - Alternative full implementation (Sonnet-based)

## Notes

- This command is **read-only** (analyzes, doesn't modify implementation)
- Designed for **Sonnet 4.5's analytical capabilities** (classification requires judgment)
- Creates **artifacts optimized for Haiku** (concise context, clear patterns)
- **Iterative refinement** - classification improves with feedback from actual Haiku executions
