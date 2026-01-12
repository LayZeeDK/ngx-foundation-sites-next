---
description: Analyze tasks.md and identify tasks suitable for Claude Haiku 4.5 implementation. Creates optimized artifacts for fast, cost-effective execution.
agent: tasks-for-haiku-4-5
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Model Selection

**Preferred Model**: Claude Sonnet 4.5 (`claude-sonnet-4.5`)
**Invoke with**: `copilot -m "claude-sonnet-4.5" slash tasks-for-haiku-4-5`

**Why Sonnet**: Task classification requires reasoning about complexity and suitability—Sonnet's strength.
**Expected Performance**: 2-5 minutes for analysis, one-time cost that saves 40-60% on implementation.

---

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script

---

## Goal

Analyze tasks.md and identify tasks suitable for Claude Haiku 4.5 implementation based on task complexity, scope, and clarity.

Create optimized artifacts:

- haiku-suitable-tasks.md (filtered task list)
- haiku-implementation-context.md (focused context for Haiku)
- haiku-task-analysis.md (suitability analysis report)

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
- `OUTPUT_TASKS` = FEATURE_DIR/haiku-suitable-tasks.md
- `OUTPUT_CONTEXT` = FEATURE_DIR/haiku-implementation-context.md
- `OUTPUT_ANALYSIS` = FEATURE_DIR/haiku-task-analysis.md

### Step 2: Load Context Documents

**Load in this order:**

1. **tasks.md** (REQUIRED): Parse all task phases, extract IDs, descriptions, file paths, markers
2. **spec.md** (OPTIONAL): Load user stories for context
3. **plan.md** (OPTIONAL): Load tech stack and file structure

### Step 3: Analyze Task Suitability

For each task in tasks.md, evaluate against these criteria:

**Score each task 0-10 on these dimensions:**

1. **Scope Clarity (0-10)**: 10 = exact file path, clear action, explicit criteria
2. **Complexity (0-10)**: 10 = simple pattern-based edit; 0 = complex reasoning
3. **Dependencies (0-10)**: 10 = fully independent [P]; 0 = complex multi-task deps
4. **Pattern Recognition (0-10)**: 10 = follows existing pattern; 0 = novel implementation

**Suitability Score Calculation:**

```
total_score = scope_clarity + complexity + dependencies + pattern_recognition
suitability = total_score / 40 * 100
```

**Classification:**

- **HIGH** (≥75%): Perfect for Haiku 4.5
- **MEDIUM** (50-74%): Haiku with extended thinking (2K-4K budget)
- **LOW** (<50%): Better suited for Sonnet 4.5

**Task Pattern Detection:**

- **Pattern A: Rename/Update** (HIGH): Find-replace operations
- **Pattern B: Add Method/Property** (HIGH): Insert code following existing patterns
- **Pattern C: Add Test** (HIGH): Follow existing test patterns
- **Pattern D: Update Documentation** (HIGH): Write prose, code snippets
- **Pattern E: Refactor** (MEDIUM-LOW): Structural changes
- **Pattern F: Design/Architecture** (LOW): Requires trade-off reasoning
- **Pattern G: Complex Integration** (LOW): Multi-file coordination

### Step 4: Generate haiku-suitable-tasks.md

Create filtered task list with suitability scores, estimated times, and context requirements.

### Step 5: Generate haiku-implementation-context.md

Create focused, concise context including:

- Project structure (relevant files only)
- Code patterns (templates with examples)
- File path reference (exact paths from tasks)
- Success criteria (per task type)
- Constraints (explicit boundaries)

### Step 6: Generate haiku-task-analysis.md

Create detailed breakdown including:

- Executive summary
- Detailed task analysis (per task)
- Pattern distribution table
- Phase-by-phase breakdown
- Implementation strategy options
- Quality assurance strategy
- Risk assessment
- Recommendations

### Step 7: Report Completion

**✅ Haiku Task Analysis Complete**

**Files Generated:**

1. **haiku-suitable-tasks.md** - Filtered task list with suitability scores
2. **haiku-implementation-context.md** - Focused context for Haiku execution
3. **haiku-task-analysis.md** - Detailed analysis report

**Summary:**

- **Total Tasks Analyzed**: [number]
- **Haiku-Suitable (HIGH)**: [number] ([percentage]%) - Recommended
- **Haiku-Suitable (MEDIUM)**: [number] ([percentage]%) - With extended thinking
- **Sonnet-Recommended (LOW)**: [number] ([percentage]%) - Keep on Sonnet

**Estimated Savings:**

- **Time**: [X]× faster on [number] tasks
- **Cost**: $[amount] saved (66% on Haiku tasks)

**Recommended Next Step:**
Run `copilot -m "claude-haiku-4.5" slash implement-tasks-for-haiku-4-5` to execute the Haiku-suitable tasks.

---

## Optimization Notes

**Why This Command Uses Sonnet 4.5:**

This analysis command requires reasoning about task complexity and suitability—Sonnet's strength. One-time cost (2-5 min) saves 40-60% on implementation.

**ROI**: Spending 2-5 minutes with Sonnet to properly classify tasks saves 40-60% time on implementation.

---

## Related Commands

- Standard task generation - Run before this command
- `implement-tasks-for-haiku-4-5` - Execute Haiku-suitable tasks (run after)
- Standard implementation - Alternative for Sonnet-based full implementation

---

## Notes

- This command is **read-only** (analyzes, doesn't modify implementation)
- Designed for **Sonnet 4.5's analytical capabilities** (classification requires judgment)
- Creates **artifacts optimized for Haiku** (concise context, clear patterns)
- **Iterative refinement** - classification improves with feedback from actual Haiku executions
