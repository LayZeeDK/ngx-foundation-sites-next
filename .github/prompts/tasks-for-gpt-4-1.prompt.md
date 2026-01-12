---
description: Analyze tasks.md and identify tasks suitable for GPT-4.1 implementation. Creates optimized artifacts for large literal mechanical tasks requiring 1M context.
agent: tasks-for-gpt-4-1
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

- Claude Sonnet: `copilot -m "claude-sonnet-4.5" slash tasks-for-gpt-4-1`
- GPT-5.1-Codex-Mini: `copilot -m "gpt-5.1-codex-mini" slash tasks-for-gpt-4-1`

**Why these models?**

- **Sonnet 4.5**: Deep reasoning for context size estimation
- **GPT-5.1-Codex-Mini**: Adaptive reasoning, 400K context for analyzing large task lists

**Expected Performance**: 2-5 minutes for analysis, identifies large-scale literal tasks requiring GPT-4.1's 1M context

---

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script

---

## Goal

Analyze tasks.md and identify tasks suitable for GPT-4.1 implementation based on:

- Large context requirements (>200K tokens)
- Purely literal/mechanical procedures (no reasoning benefit)
- Cross-file consistency needs
- Precision requirements (minimal unnecessary changes)

Create optimized artifacts:

- gpt41-suitable-tasks.md (filtered task list with literal procedures)
- gpt41-implementation-context.md (sandwich method templates)
- gpt41-task-analysis.md (detailed suitability report with SWE-bench context)

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
- OUTPUT_TASKS = FEATURE_DIR/gpt41-suitable-tasks.md
- OUTPUT_CONTEXT = FEATURE_DIR/gpt41-implementation-context.md
- OUTPUT_ANALYSIS = FEATURE_DIR/gpt41-task-analysis.md

### Step 1: Load Context Documents

1. **tasks.md** (REQUIRED): Parse all tasks, estimate context per task
2. **spec.md** (OPTIONAL): Understand requirements
3. **plan.md** (OPTIONAL): Understand file structure, identify large files
4. **Implementation files** (OPTIONAL): Assess actual file sizes

### Step 2: Classify Tasks Using 4-Dimension Scoring

For each task, evaluate:

**Dimension 1: Context Size (0-10)**

Does this task require >200K tokens of context?

- Task involves file >3K lines? +4
- Task involves 10+ files simultaneously? +3
- Task needs to see all files at once? +3

**Critical**: If task fits in 200K, score 0—GPT-5 Mini is better choice (faster, 69-70% SWE-bench).

**Dimension 2: Literal-Only Procedure (0-10)**

Is the task 100% literal with NO reasoning benefit?

- Task has STEP 1, 2, 3... format? +4
- Every step specifies exact action (no "intelligently")? +3
- Task requires zero interpretation or adaptation? +3

**Critical**: If task benefits from minimal reasoning, score 0—GPT-5 Mini is better.

**Dimension 3: Cross-File Consistency (0-10)**

Does task require coordinating changes across multiple files?

- Updates interface + all implementations? +4
- Maintains consistency across 5+ files? +3
- Has explicit mechanical consistency checks? +3

**Dimension 4: Precision (0-10)**

Does task require minimal unnecessary changes (GPT-4.1's 2% strength)?

- Specifies exact files only (no exploration)? +3
- Has explicit boundaries ("do NOT modify X")? +3
- Requires only changed lines (not full rewrites)? +4

**Calculate Suitability:**

```
total_score = context_size + literal_only + cross_file + precision
suitability_percentage = (total_score / 40) * 100

IF suitability_percentage >= 75:
  classification = "HIGH" (GPT-4.1 recommended)
ELSE IF suitability_percentage >= 50:
  classification = "MEDIUM" (Consider Haiku 4.5)
ELSE:
  classification = "LOW" (Use GPT-5 Mini)
```

### Step 3: Estimate Context Requirements

For each HIGH/MEDIUM task:

```
task_context = 0

FOR EACH file in task.file_list:
  file_size = estimate_file_size(file)
  task_context += file_size

IF task.cross_file_consistency:
  FOR EACH related_file in identify_related_files(task):
    task_context += estimate_file_size(related_file)

task_context += 20000  # Instructions buffer

IF task_context < 200000:
  DOWNGRADE to LOW
  REASON: "Fits in GPT-5 Mini (faster, 69-70% SWE-bench)"

ELSE IF task_context > 900000:
  WARN: "Task may exceed GPT-4.1's 1M context"
```

### Step 4: Detect Task Patterns

**Pattern A: Repository-Wide Find-Replace** (HIGH - 90-100%)

- Context: 400K-800K tokens
- Example: "Rename oldName → newName across 75 files"

**Pattern B: Large File Literal Edit** (HIGH - 85-95%)

- Context: 200K-400K tokens
- Example: "Edit 5K-line component with exact steps"

**Pattern C: Cross-File Consistency Update** (HIGH - 85-95%)

- Context: 300K-600K tokens
- Example: "Update interface + 15 implementations"

**Pattern D: Multi-File Mechanical Transform** (HIGH - 80-90%)

- Context: 250K-500K tokens
- Example: "Convert 25 components to inject() pattern"

**Pattern E: Small/Medium Tasks** (LOW - use GPT-5 Mini)
**Pattern F: Tasks Needing Adaptation** (LOW - use GPT-5 Mini or Haiku)

### Step 5: Generate gpt41-suitable-tasks.md

Create file with:

- Task list filtered for HIGH suitability (≥75%)
- Literal procedure templates
- Context size estimates
- Sandwich method structure for each task

### Step 6: Generate gpt41-implementation-context.md

Create file with:

- Sandwich method templates (instructions at BEGINNING and END)
- Literal procedures (STEP 1, 2, 3... format)
- Exact file lists (no wildcards)
- Success criteria (mechanical verification)

### Step 7: Generate gpt41-task-analysis.md

Create file with:

- Detailed scoring for all tasks
- Context size analysis
- SWE-bench comparison (GPT-4.1: 54.6%, GPT-5 Mini: 69-70%, Haiku: 73.3%)
- Recommendations with trade-offs

### Step 8: Report Completion

Output summary with:

- Task counts (HIGH/MEDIUM/LOW)
- Context size distribution
- Model recommendations
- Next steps

---

## Error Handling

### If tasks.md not found:

```
STOP
OUTPUT: "❌ Error: tasks.md not found. Run /speckit.tasks first."
```

### If all tasks <200K context:

```
IF all_tasks_fit_in_200k:
  OUTPUT: "✅ All tasks fit in GPT-5 Mini's 200K context"
  OUTPUT: "No tasks require GPT-4.1's 1M context"
  RECOMMEND: "Use /tasks-for-gpt-5-mini instead"
```

### If task context >900K:

```
IF task_context > 900000:
  WARN: "⚠️ Task may exceed GPT-4.1's 1M context"
  SUGGEST: "Split or use progressive disclosure"
```

---

## Critical Decision: GPT-4.1 vs GPT-5 Mini

**Use GPT-4.1 ONLY when**:

1. Task requires >200K tokens (exceeds GPT-5 Mini limit) ✅
2. Task is purely literal (no reasoning benefit) ✅
3. Accept lower SWE-bench (54.6% vs 69-70%) as trade-off ✅

**Otherwise, recommend GPT-5 Mini**:

- Faster (10-20s vs 30-60s)
- Better SWE-bench (69-70% vs 54.6%)
- Minimal reasoning helps with adaptation
- Same cost (0×)

---

## Optimization Notes

### For Claude Sonnet 4.5

- Use extended thinking (8K-16K) for context size estimation
- Analyze whether tasks truly need >200K context
- Assess if literal-only is sufficient (vs benefits from minimal reasoning)
- Justify GPT-4.1 choice despite lower SWE-bench

### For GPT-5.1-Codex-Mini

- Leverage 400K context to analyze large task lists
- Use adaptive reasoning for context size estimation
- Code-focused understanding for file size assessment

---

## Related Commands

- `/speckit.tasks` - Generate tasks.md (run before)
- `/tasks-for-gpt-5-mini` - Identify small mechanical tasks (default, 69-70% SWE-bench)
- `/tasks-for-haiku-4-5` - Identify agentic tasks needing reasoning (0.33×, 73.3% SWE-bench)
- `/implement-tasks-for-gpt-4-1` - Execute GPT-4.1-suitable tasks

---

## Notes

- This command is **read-only** (analyzes tasks.md, doesn't implement)
- GPT-4.1 is a **specialized tool** for large literal tasks, not general implementation
- **GPT-5 Mini is better** for 90% of tasks (<200K context, higher SWE-bench)
- GPT-4.1's value is **1M context at 0× cost** for overflow scenarios
- Use GPT-4.1 when **context forces it** AND task is **purely literal**
- Be conservative: Justify why GPT-5 Mini isn't sufficient
