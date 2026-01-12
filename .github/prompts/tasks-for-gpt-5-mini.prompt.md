---
description: Analyze tasks.md and identify tasks suitable for GPT-5 Mini implementation. Creates optimized artifacts for fast, zero-cost execution.
agent: tasks-for-gpt-5-mini
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Model Selection

**Recommended Model**: Claude Sonnet 4.5 or GPT-5.1-Codex-Mini
**Invoke with**:

- Claude Sonnet: `copilot -m "claude-sonnet-4.5" slash tasks-for-gpt-5-mini`
- GPT-5.1-Codex-Mini: `copilot -m "gpt-5.1-codex-mini" slash tasks-for-gpt-5-mini`

**Why these models?**

- **Sonnet 4.5**: Deep reasoning for accurate classification
- **GPT-5.1-Codex-Mini**: Adaptive reasoning + code-focused, cheaper than Sonnet

**Expected Performance**: 2-5 minutes for analysis, one-time cost that enables zero-cost (0×) implementation

---

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script

---

## Goal

Analyze tasks.md and identify tasks suitable for GPT-5 Mini implementation based on task complexity, scope, and clarity.

Create optimized artifacts:

- gpt5mini-suitable-tasks.md (filtered task list with CTCO templates)
- gpt5mini-implementation-context.md (focused context for GPT-5 Mini)
- gpt5mini-task-analysis.md (detailed suitability report)

---

## Execution Steps

### Step 0: Prerequisites

Run from repository root:

```bash
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse JSON for:

- `FEATURE_DIR` - Absolute path to feature directory
- `AVAILABLE_DOCS` - List of existing files

Derive paths:

- TASKS = FEATURE_DIR/tasks.md (REQUIRED)
- SPEC = FEATURE_DIR/spec.md (OPTIONAL)
- PLAN = FEATURE_DIR/plan.md (OPTIONAL)
- OUTPUT_TASKS = FEATURE_DIR/gpt5mini-suitable-tasks.md
- OUTPUT_CONTEXT = FEATURE_DIR/gpt5mini-implementation-context.md
- OUTPUT_ANALYSIS = FEATURE_DIR/gpt5mini-task-analysis.md

### Step 1: Load Context Documents

Load in this order:

1. **tasks.md** (REQUIRED): Parse all task phases, extract IDs, descriptions, file paths, markers
2. **spec.md** (OPTIONAL): Load user stories for context
3. **plan.md** (OPTIONAL): Load tech stack and file structure

### Step 2: Classify Tasks Using 4-Dimension Scoring

For each task, evaluate:

**Dimension 1: CTCO Clarity (0-10)**

- Has explicit file path? +3
- Has pattern/template reference? +3
- Has exact line number or insertion point? +2
- Has success criteria? +2

**Dimension 2: Mechanical Procedure (0-10)**

- Implementation is find-replace? +4
- Implementation follows exact pattern? +3
- Steps are sequential with no branches? +2
- No judgment calls needed? +1

**Dimension 3: Format Explicitness (0-10)**

- Has exact template or example? +4
- Success criteria are measurable? +3
- Output format specified? +2
- Validation is straightforward? +1

**Dimension 4: Independence (0-10)**

- Single file edit? +4
- No shared state? +3
- Marked [P] (parallel)? +2
- No implicit dependencies? +1

**Calculate Suitability:**

```
total_score = ctco_clarity + mechanical_procedure + format_explicitness + independence
suitability_percentage = (total_score / 40) * 100
```

**Classification:**

- **HIGH** (≥75%): Perfect for GPT-5 Mini (0× cost)
- **MEDIUM** (50-74%): Use Haiku 4.5 (0.33×, better reasoning)
- **LOW** (<50%): Use Sonnet 4.5 (1×, deep reasoning)

### Step 3: Detect Task Patterns

**Pattern A: Find-Replace** (HIGH - 90-100%)
**Pattern B: Add Method with Template** (HIGH - 85-95%)
**Pattern C: Simple Test Addition** (HIGH - 80-90%)
**Pattern D: Documentation Update** (HIGH - 85-95%)
**Pattern E: Conditional Logic** (MEDIUM - 60-70%)
**Pattern F: Multi-step Refactoring** (LOW - 30-45%)
**Pattern G: Design/Architecture** (LOW - 10-30%)

### Step 4: Generate gpt5mini-suitable-tasks.md

Create file with:

- Task summary
- HIGH suitability tasks with CTCO templates
- MEDIUM tasks (recommend Haiku 4.5)
- Excluded tasks (Sonnet required)
- Implementation strategy
- Next steps

### Step 5: Generate gpt5mini-implementation-context.md

Create file with:

- CTCO templates per task type
- File path reference
- Code patterns (exact examples)
- Constraints (CRITICAL)
- Success criteria per task type

### Step 6: Generate gpt5mini-task-analysis.md

Create detailed analysis with:

- Executive summary
- Detailed task analysis (per task with scoring)
- Pattern distribution table
- Cost-benefit analysis
- Recommendations

### Step 7: Report Completion

**✅ GPT-5 Mini Task Analysis Complete**

**Files Generated:**

1. gpt5mini-suitable-tasks.md - Filtered task list with CTCO templates
2. gpt5mini-implementation-context.md - Focused context for GPT-5 Mini
3. gpt5mini-task-analysis.md - Detailed suitability report

**Summary:**

- Total Tasks: [N]
- GPT-5 Mini Suitable (HIGH): [X] ([%]%)
- Haiku 4.5 Recommended (MEDIUM): [Y] ([%]%)
- Sonnet Recommended (LOW): [Z] ([%]%)

**Estimated Savings:**

- Cost: $0 for [X] tasks (vs $[amount] with Haiku/Sonnet)
- Time: ~[N]× faster on GPT-5 Mini tasks

**Next Step:**
Run: `copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini`

---

## Error Handling

### If tasks.md not found:

```
STOP
OUTPUT: "tasks.md not found. Run /speckit.tasks or /tasks-gpt-5-mini first."
```

### If context exceeds 200K:

```
IF estimated_tokens > 180000:
  WARN: "Feature may exceed GPT-5 Mini's 200K context limit"
  SUGGEST: "Consider splitting feature or using GPT-4.1 (1M context)"
```

### If all tasks score LOW:

```
IF all_tasks_below_50_percent:
  OUTPUT: "No tasks suitable for GPT-5 Mini"
  RECOMMEND: "Use standard /speckit.implement with Sonnet 4.5"
```

---

## Optimization Notes

### For Claude Sonnet 4.5

- Leverage extended thinking for borderline cases (70-80% range)
- Use XML tags for structured reasoning if helpful
- Focus on precision over speed (classification quality matters)

### For GPT-5.1-Codex-Mini

- Leverage adaptive reasoning (automatically adjusts depth)
- Use code-specific understanding for better task assessment
- 400K context allows analyzing larger task sets

### General Best Practices

- Be conservative on borderline cases (prefer MEDIUM over HIGH when uncertain)
- Justify all HIGH classifications with clear reasoning
- Focus on CTCO compatibility as primary criterion
- Provide explicit CTCO templates for execution

---

## Related Commands

- `/speckit.tasks` or `/tasks-gpt-5-mini` - Generate tasks.md (run before)
- `/implement-tasks-for-gpt-5-mini` - Execute GPT-5 Mini-suitable tasks (run after)
- `/tasks-for-haiku-4-5` - Alternative: Analyze for Haiku 4.5 suitability

---

## Notes

- This command is **read-only** (analyzes tasks.md, doesn't implement)
- Classification is a **one-time cost** that enables **zero-cost execution**
- Focus on **accuracy over speed**—wrong classification wastes user time
- **Conservative classification** is preferred (better to use Haiku than fail with GPT-5 Mini)
