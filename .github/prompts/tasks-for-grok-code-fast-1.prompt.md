---
description: Analyze tasks.md and identify tasks suitable for Grok Code Fast 1 implementation. Creates optimized artifacts for fast, agentic execution.
agent: tasks-for-grok-code-fast-1
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Model Selection

**Preferred Model**: Claude Sonnet 4.5 (`claude-sonnet-4.5`)
**Invoke with**: `copilot -m "claude-sonnet-4.5" slash tasks-for-grok-code-fast-1`

**Why Sonnet**: Task classification requires reasoning about agentic suitability - Sonnet's strength.
**Expected Performance**: 2-5 minutes for analysis, one-time cost that saves 50-70% on implementation.

---

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script

---

## Goal

Analyze tasks.md and identify tasks suitable for Grok Code Fast 1 implementation based on agentic suitability, iterative potential, and scope clarity.

Create optimized artifacts:

- grok-suitable-tasks.md (filtered task list)
- grok-implementation-context.md (focused context for Grok)
- grok-task-analysis.md (suitability analysis report)

---

## Execution Steps

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
- `OUTPUT_TASKS` = FEATURE_DIR/grok-suitable-tasks.md
- `OUTPUT_CONTEXT` = FEATURE_DIR/grok-implementation-context.md
- `OUTPUT_ANALYSIS` = FEATURE_DIR/grok-task-analysis.md

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

**Score each task 0-10 on these dimensions:**

1. **Agentic Potential (0-10)**:
   - 10: Perfect for iterative cycles (read → edit → test → refine)
   - 5: Some iteration helpful, but mostly one-shot
   - 0: Pure one-shot task, no iteration benefit

2. **Scope Clarity (0-10)**:
   - 10: Exact file path, clear action, explicit acceptance criteria
   - 5: File mentioned, action somewhat clear, implicit criteria
   - 0: Vague location, ambiguous action, no clear success definition

3. **Complexity (0-10)**:
   - 10: Bug fix, scaffold, test - Grok's sweet spot
   - 5: Moderate logic (conditional logic, basic algorithms)
   - 0: Deep reasoning (architectural decisions, trade-off analysis)

4. **Pattern Recognition (0-10)**:
   - 10: Follows existing pattern in codebase (copy similar code)
   - 5: Partially follows patterns, some new logic needed
   - 0: Novel implementation, no existing patterns

**Suitability Score Calculation:**

```
total_score = agentic_potential + scope_clarity + complexity + pattern_recognition
suitability = total_score / 40 * 100
```

**Classification:**

- **HIGH** (≥75%): Perfect for Grok Code Fast 1 - fast, iterative execution
- **MEDIUM** (50-74%): Suitable but may need more iterations
- **LOW** (<50%): Better suited for Claude Sonnet 4.5 - needs deep reasoning

### Step 4: Detect Task Patterns

**Automatically classify tasks by pattern:**

**Pattern A: Bug Fix (HIGH suitability)**:

- Keywords: "fix", "bug", "error", "broken", "issue"
- Characteristics: Search → diagnose → patch → verify cycle
- Example: "Fix accordion keyboard navigation bug"
- Grok Advantage: Rapid iteration, quick refinement

**Pattern B: Scaffolding (HIGH suitability)**:

- Keywords: "create", "scaffold", "generate", "setup", "boilerplate"
- Characteristics: Generate structure, iterate on details
- Example: "Create new component with tests"
- Grok Advantage: Fast generation, quick adjustments

**Pattern C: Test Writing (HIGH suitability)**:

- Keywords: "add test", "write test", "test coverage", "play function"
- Characteristics: Follow existing test patterns, incremental coverage
- Example: "Add Storybook play function for toggle() method"
- Grok Advantage: Pattern-based, iterative verification

**Pattern D: Add Method/Property (HIGH suitability)**:

- Keywords: "add method", "implement method", "create property"
- Characteristics: Insert code block, follow existing patterns
- Example: "Add down() method to accordion-item"
- Grok Advantage: Copy pattern, quick implementation

**Pattern E: Update Documentation (HIGH suitability)**:

- Keywords: "update docs", "add example", "document API"
- Characteristics: Sync docs with code changes
- Example: "Update API_REFERENCE.md with new inputs"
- Grok Advantage: Fast updates, easy iteration

**Pattern F: Rename/Update (HIGH suitability)**:

- Keywords: "rename", "update name", "change from X to Y"
- Characteristics: Find-replace operation, multiple file edits
- Example: "Rename multiExpandable → multiExpand"
- Grok Advantage: Systematic search-replace

**Pattern G: Refactor (MEDIUM suitability)**:

- Keywords: "refactor", "reorganize", "extract", "split"
- Characteristics: Structural changes, requires understanding context
- Example: "Extract validation logic to separate service"
- Consideration: May need more iterations

**Pattern H: Design/Architecture (LOW suitability)**:

- Keywords: "design", "choose", "decide", "architect"
- Characteristics: Requires reasoning about trade-offs
- Example: "Design state management approach"
- Use Instead: Claude Sonnet 4.5

**Pattern I: Complex Integration (LOW suitability)**:

- Keywords: "integrate", "coordinate", "sync across"
- Characteristics: Multi-file coordination, implicit dependencies
- Example: "Integrate ErrorHandler with all components"
- Use Instead: Claude Sonnet 4.5

### Step 5: Generate grok-suitable-tasks.md

Create file with:

```markdown
# Grok-Suitable Tasks: [Feature Name]

**Generated**: [Date]
**Source**: tasks.md
**Target Model**: Grok Code Fast 1 (256K context, 0x cost in GitHub Copilot)

**Optimization Strategy**: Fast agentic execution with iterative refinement

---

## Task Summary

- **Total Tasks in tasks.md**: [number]
- **Grok-Suitable (HIGH)**: [number] ([percentage]%)
- **Grok-Suitable (MEDIUM)**: [number] ([percentage]%)
- **Sonnet-Recommended (LOW)**: [number] ([percentage]%)

**Estimated Performance**:

- **Speed**: 4× faster than other agentic models
- **Cost**: 0x in GitHub Copilot (free!)
- **Quality**: 70.8% SWE-bench (90%+ for suitable tasks)

---

## Phase 1: [Phase Name]

**Suitability**: [HIGH/MEDIUM/LOW overall for this phase]

### HIGH Suitability Tasks (Grok Recommended)

- [ ] T001 [P] [Pattern: Bug Fix] Description with file path
  - **Suitability Score**: 90% (Agentic: 10/10, Scope: 9/10, Complexity: 9/10, Pattern: 8/10)
  - **Estimated Time (Grok)**: 2-5 minutes
  - **Iteration Strategy**: Search bug → patch → test → refine

---

## Excluded Tasks (Sonnet Recommended)

**These tasks require Claude Sonnet 4.5's deeper reasoning:**

- [ ] T015 [LOW: 35%] Design state management approach
  - **Reason**: Architectural decision, trade-off analysis required
  - **Better Model**: Claude Sonnet 4.5 (extended thinking)

---

## Implementation Strategy

**Recommended Approach (Rapid Iteration)**:

1. **Grok First**: Execute all HIGH suitability tasks with rapid iteration
2. **Refine as needed**: Use Grok's 4x speed for quick fixes
3. **Sonnet for Complexity**: Hand off LOW suitability tasks to Sonnet

**Grok Optimization Tips**:

- Use native tool-calling (not XML)
- Keep prompts short, iterate quickly
- Specify file paths and scope explicitly
- Let Grok run search → edit → test cycles
```

### Step 6: Generate grok-implementation-context.md

Create file with focused, concise context:

````markdown
# Grok Implementation Context: [Feature Name]

**Purpose**: Provide minimal, focused context for Grok Code Fast 1 task execution

**Key Grok Optimizations**:

- Use native tool-calling (not XML)
- Short prompts, rapid iteration
- Explicit file paths and scope
- Let model run iterative cycles

---

## Project Structure (Focused)

**Only include files relevant to Grok-suitable tasks:**

packages/
ngx-foundation-sites/
src/
lib/
[component]/
[relevant files only]

---

## Agentic Patterns (Concise)

### Pattern: Bug Fix Cycle

1. Search for bug location (grep/read)
2. Read surrounding context
3. Apply minimal patch
4. Run tests to verify
5. Refine if needed (iterate quickly!)

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
```
````

**Example from existing code**: [file:line]

---

## Success Criteria (Per Task Type)

**Bug Fix**:

- [ ] Bug identified and patched
- [ ] Tests pass (existing + new if needed)
- [ ] No regressions introduced
- [ ] TypeScript compilation succeeds

**Add Method**:

- [ ] Method added with JSDoc
- [ ] TypeScript compilation succeeds
- [ ] Method follows existing pattern
- [ ] Exports updated if needed

---

## Constraints (Explicit)

- **NO** architectural changes
- **NO** multi-file refactoring beyond explicit task scope
- **FOLLOW** existing patterns exactly
- **PRESERVE** code style and formatting
- **VERIFY** TypeScript compilation after each change
- **ITERATE** quickly - use Grok's speed advantage

````

### Step 7: Generate grok-task-analysis.md

Create file with detailed breakdown:

```markdown
# Grok Task Suitability Analysis: [Feature Name]

**Generated**: [Date]
**Analyzer**: Claude Sonnet 4.5
**Target Model**: Grok Code Fast 1

---

## Executive Summary

**Tasks Analyzed**: [number]
**Grok-Suitable (HIGH)**: [number] ([percentage]%) - **Recommended for Grok**
**Grok-Suitable (MEDIUM)**: [number] ([percentage]%) - **Grok with more iterations**
**Sonnet-Recommended (LOW)**: [number] ([percentage]%) - **Keep on Sonnet**

---

## Detailed Task Analysis

### Task: T001 - [Description]

**Classification**: HIGH (90%)
**Pattern**: Bug Fix
**File**: [path]

**Scores**:

- Agentic Potential: 10/10 (perfect for search → patch → test cycle)
- Scope Clarity: 9/10 (exact file, clear bug description)
- Complexity: 9/10 (focused fix, follows pattern)
- Pattern Recognition: 8/10 (similar fixes exist)

**Rationale**:
Classic bug fix task - Grok excels at iterative search → diagnose → patch → verify cycles. Its 4x speed advantage means rapid iteration is essentially free.

---

## Pattern Distribution

| Pattern Type        | Count | Avg Suitability | Grok Recommended |
| ------------------- | ----- | --------------- | ---------------- |
| Bug Fix             | 8     | 92%             | ✅ Excellent     |
| Scaffolding         | 5     | 88%             | ✅ Excellent     |
| Test Writing        | 10    | 95%             | ✅ Excellent     |
| Add Method/Property | 7     | 85%             | ✅ Good          |
| Update Docs         | 4     | 90%             | ✅ Good          |
| Rename/Update       | 3     | 82%             | ✅ Good          |
| Refactor            | 6     | 55%             | ⚠️ Medium        |
| Integration         | 3     | 38%             | ❌ No (Sonnet)   |
| Architecture        | 2     | 25%             | ❌ No (Sonnet)   |

---

## Cost Comparison

| Model             | Cost (Copilot) | Cost (API)     | Speed |
| ----------------- | -------------- | -------------- | ----- |
| Grok Code Fast 1  | **0x (free)**  | $0.20/$1.50/1M | 4x ⚡ |
| Claude Haiku 4.5  | 0.33x          | $1/$5/1M       | 2-5x  |
| Claude Sonnet 4.5 | 1x             | $3/$15/1M      | 1x    |
| GPT-5 Mini        | 0x (free)      | N/A            | 2-3x  |

---

## Recommendations

1. ✅ **Use Grok Code Fast 1 for [X] HIGH suitability tasks** (4× speedup, 0x cost in Copilot)

2. ⚠️ **Use Grok with more iterations for [Y] MEDIUM tasks** (rapid refinement compensates)

3. ❌ **Keep [Z] LOW suitability tasks on Claude Sonnet 4.5** (needs deep reasoning)

4. 📊 **Track performance metrics** to refine classification

5. 🔄 **Leverage Grok's speed** - don't over-engineer prompts
````

### Step 8: Report Completion

**✅ Grok Task Analysis Complete**

**Files Generated**:

1. **grok-suitable-tasks.md** - Filtered task list with suitability scores
2. **grok-implementation-context.md** - Focused context for Grok execution
3. **grok-task-analysis.md** - Detailed analysis report

**Summary**:

- **Total Tasks Analyzed**: [number]
- **Grok-Suitable (HIGH)**: [number] ([percentage]%) - Recommended
- **Grok-Suitable (MEDIUM)**: [number] ([percentage]%) - With more iterations
- **Sonnet-Recommended (LOW)**: [number] ([percentage]%) - Keep on Sonnet

**Estimated Performance**:

- **Speed**: 4× faster on [number] tasks
- **Cost**: 0x in GitHub Copilot (free!)
- **Quality**: 90%+ match with Sonnet for suitable tasks

**Recommended Next Step**:
Select Grok Code Fast 1 in VS Code model picker and execute the [number] Grok-suitable tasks.

---

## Error Handling

### If tasks.md not found:

```
STOP
OUTPUT: "❌ Error: tasks.md not found. Run /speckit.tasks first."
```

### If all tasks score LOW:

```
IF all_tasks_below_50_percent:
  OUTPUT: "No tasks suitable for Grok Code Fast 1"
  RECOMMEND: "Use standard /speckit.implement with Sonnet 4.5"
```

---

## Optimization Notes

**Why This Command Uses Claude Sonnet 4.5**:

This analysis command itself should use **Claude Sonnet 4.5**, not Grok, because:

1. **Requires reasoning** about task complexity and agentic suitability
2. **Judgment calls** needed for classification (not iterative bug fix)
3. **One-time cost** (run once per feature, not per task)
4. **Quality matters** - wrong classification reduces Grok benefits

**ROI**: Spending 2-5 minutes with Sonnet to properly classify tasks saves 50-70% time on implementation.

---

## Related Commands

- `/speckit.tasks` - Generate tasks.md (run before)
- `/tasks-for-haiku-4-5` - Alternative: Analyze for Claude Haiku 4.5 suitability
- `/tasks-for-gpt-5-mini` - Alternative: Analyze for GPT-5 Mini suitability
- Standard implementation - Execute with selected model

---

## Notes

- This command is **read-only** (analyzes, doesn't modify implementation)
- Designed for **Sonnet 4.5's analytical capabilities** (classification requires judgment)
- Creates **artifacts optimized for Grok's agentic strengths** (iterative, fast, tool-calling)
- **Key insight**: Grok's 4x speed means rapid iteration beats perfect prompts
