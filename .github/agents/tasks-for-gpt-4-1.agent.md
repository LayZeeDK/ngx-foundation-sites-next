---
description: Analyze tasks.md and identify tasks suitable for GPT-4.1 implementation. Creates optimized artifacts for large literal mechanical tasks requiring 1M context.
---

## Model Selection

**Recommended Model**: Claude Sonnet 4.5 or GPT-5.1-Codex-Mini
**Invoke with**:

- Claude Sonnet: `gh copilot -m "claude-sonnet-4.5" slash tasks-for-gpt-4-1`
- GPT-5.1-Codex-Mini: `gh copilot -m "gpt-5.1-codex-mini" slash tasks-for-gpt-4-1`

**Why these models?**

- **Sonnet 4.5**: Deep reasoning for context size estimation, proven classification quality
- **GPT-5.1-Codex-Mini**: Adaptive reasoning, code-focused, 400K context for analyzing large task lists

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
- gpt41-implementation-context.md (sandwich method templates for GPT-4.1)
- gpt41-task-analysis.md (detailed suitability report with SWE-bench context)

---

## GPT-4.1 Characteristics

**GPT-4.1 Strengths:**

- 1M token context window in GitHub Copilot (5× larger than GPT-5 Mini's 200K)
- Zero cost (0× multiplier in GitHub Copilot)
- Literal instruction following (49% benchmark vs GPT-4o's 29%)
- Cross-file refactoring with consistency maintenance
- 2% unnecessary edits (vs GPT-4o's 9%) - very precise
- 54.6% SWE-bench Verified (proven implementation capability)

**GPT-4.1 Limitations:**

- Non-reasoning model (cannot make creative decisions or adaptations)
- Lower SWE-bench than GPT-5 Mini (54.6% vs 69-70%) due to lack of reasoning
- Slower than GPT-5 Mini (30-60s vs 10-20s)
- Requires sandwich method optimization (instructions at both ends)
- Needs extremely literal instructions (no inference)

**GPT-4.1 Sweet Spot:**

- ✅ Large-context literal tasks (200K-900K tokens)
- ✅ Repository-wide mechanical transformations (50+ files)
- ✅ Cross-file consistency with exact procedures
- ✅ Large file edits with explicit line-by-line instructions
- ✅ Multi-file coordination (mechanical, not reasoned)
- ✅ Precision-critical tasks (only touch specified files)

**NOT Suitable for GPT-4.1:**

- ❌ Tasks needing ANY reasoning (use GPT-5 Mini—better SWE-bench: 69-70% vs 54.6%)
- ❌ Small tasks <200K context (use GPT-5 Mini—faster and better quality)
- ❌ Pattern adaptation (needs minimal reasoning)
- ❌ Implicit dependency resolution
- ❌ Creative problem-solving

**Key Insight**: GPT-5 Mini has 69-70% SWE-bench (15 points BETTER than GPT-4.1's 54.6%) due to minimal reasoning. Only use GPT-4.1 when context size (>200K) forces it AND task is purely literal.

---

## Outline

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

#### Dimension 1: Context Size (0-10)

Does this task require >200K tokens of context?

**Scoring criteria:**

- Task involves file >3K lines? +4
- Task involves 10+ files simultaneously? +3
- Task needs to see all files at once? +3

**Examples:**

- **10 points**: Refactor 5K-line component OR update 15 files for consistency
- **5 points**: Edit 2K-line file OR update 5 files
- **0 points**: Edit 500-line file OR single small file update

**Critical**: If task fits in 200K, score 0—GPT-5 Mini is better choice (faster, 69-70% SWE-bench).

#### Dimension 2: Literal-Only Procedure (0-10)

Is the task 100% literal with NO reasoning benefit?

**Scoring criteria:**

- Task has STEP 1, 2, 3... format? +4
- Every step specifies exact action (no "intelligently")? +3
- Task requires zero interpretation or adaptation? +3

**Examples:**

- **10 points**: "STEP 1: Go to line 145. STEP 2: Insert [exact code]. STEP 3: Update line 289..."
- **5 points**: "Add method following pattern" (needs minimal reasoning to adapt)
- **0 points**: "Refactor to improve performance" (needs reasoning)

**Critical**: If task benefits from minimal reasoning, score 0—GPT-5 Mini is better (69-70% vs 54.6% SWE-bench).

#### Dimension 3: Cross-File Consistency (0-10)

Does task require coordinating changes across multiple files?

**Scoring criteria:**

- Updates interface + all implementations? +4
- Maintains consistency across 5+ files? +3
- Has explicit mechanical consistency checks? +3

**Examples:**

- **10 points**: "Update interface + all 12 usages across 5 files with exact template, verify consistency"
- **5 points**: "Update component and its test file"
- **0 points**: "Update single file"

#### Dimension 4: Precision (0-10)

Does task require minimal unnecessary changes (GPT-4.1's 2% strength)?

**Scoring criteria:**

- Specifies exact files only (no exploration)? +3
- Has explicit boundaries ("do NOT modify X")? +3
- Requires only changed lines (not full rewrites)? +4

**Examples:**

- **10 points**: "Update ONLY files A, B, C. Do NOT modify D, E. Change only lines matching exact pattern."
- **5 points**: "Update component (may need to touch related files)"
- **0 points**: "Improve the codebase" (vague scope)

#### Calculate Suitability

```
total_score = context_size + literal_only + cross_file + precision
suitability_percentage = (total_score / 40) * 100

IF suitability_percentage >= 75:
  classification = "HIGH" (GPT-4.1 recommended)
ELSE IF suitability_percentage >= 50:
  classification = "MEDIUM" (Consider Haiku 4.5—has reasoning + better SWE-bench)
ELSE:
  classification = "LOW" (Use GPT-5 Mini—faster, better SWE-bench)
```

### Step 3: Estimate Context Requirements

For each HIGH/MEDIUM task, calculate actual context needed:

```
task_context = 0

# Files mentioned in task
FOR EACH file in task.file_list:
  file_size = estimate_file_size(file)  # Use plan.md or actual file line count
  task_context += file_size

# Dependencies (if cross-file consistency)
IF task.cross_file_consistency:
  related_files = identify_related_files(task)
  FOR EACH related_file in related_files:
    task_context += estimate_file_size(related_file)

# Instructions buffer
task_context += 20000  # 20K for instructions

# Classification adjustment
IF task_context < 200000:
  DOWNGRADE to LOW
  REASON: "Fits in GPT-5 Mini (faster, 69-70% SWE-bench vs GPT-4.1's 54.6%)"

ELSE IF task_context > 900000:
  WARN: "Task may exceed GPT-4.1's 1M context. Consider splitting."
```

### Step 4: Detect Task Patterns

Automatically classify by pattern:

**Pattern A: Repository-Wide Find-Replace** (HIGH - typically 90-100%)

- Keywords: "repository-wide", "all files", "50+ files", "batch update"
- Context: 400K-800K tokens
- GPT-4.1 advantage: Can hold all files, ensure global consistency
- Example: "Rename oldName → newName across 75 files"

**Pattern B: Large File Literal Edit** (HIGH - typically 85-95%)

- Keywords: "at line X", "insert at line Y", ">3K lines", "5K lines"
- Context: 200K-400K tokens
- GPT-4.1 advantage: Can hold entire large file
- Example: "Edit 5K-line component with exact steps at lines 145, 289, 567..."

**Pattern C: Cross-File Consistency Update** (HIGH - typically 85-95%)

- Keywords: "update interface + implementations", "maintain consistency", "verify across files"
- Context: 300K-600K tokens
- GPT-4.1 advantage: See all related files simultaneously
- Example: "Update interface + 15 implementations, verify mechanical consistency"

**Pattern D: Multi-File Mechanical Transform** (HIGH - typically 80-90%)

- Keywords: "apply to all", "batch transform", "20+ files"
- Context: 250K-500K tokens
- GPT-4.1 advantage: Batch processing with global view
- Example: "Convert 25 components to inject() pattern with exact steps"

**Pattern E: Small/Medium Tasks** (LOW - use GPT-5 Mini)

- Context: <200K tokens
- Better model: GPT-5 Mini (faster, 69-70% SWE-bench)
- Example: Most standard implementation tasks

**Pattern F: Tasks Needing Adaptation** (LOW - use GPT-5 Mini or Haiku)

- Needs minimal or light reasoning
- Better model: GPT-5 Mini (69-70% SWE-bench) or Haiku (73.3%)
- Example: "Add method following pattern" (requires adaptation)

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
- SWE-bench comparison context (GPT-4.1: 54.6%, GPT-5 Mini: 69-70%, Haiku: 73.3%)
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
EXIT
```

### If all tasks <200K context:

```
IF all_tasks_fit_in_200k:
  OUTPUT: "✅ All tasks fit in GPT-5 Mini's 200K context (better SWE-bench: 69-70%)\n\nNo tasks require GPT-4.1's 1M context.\n\nRecommend: Use /tasks-for-gpt-5-mini instead."
  EXIT
```

### If task context >900K:

```
IF task_context > 900000:
  WARN: "⚠️ Task [id] may exceed GPT-4.1's 1M context\n\nEstimated: [X]K tokens\n\nSuggest: Split or use progressive disclosure"
```

---

## Success Criteria

Classification is successful when:

✅ All tasks scored on 4 dimensions
✅ Context size estimated for each task
✅ HIGH tasks truly require >200K context (verified)
✅ HIGH tasks are purely literal (no reasoning benefit verified)
✅ Comparison to GPT-5 Mini/Haiku included
✅ SWE-bench context provided (54.6% vs 69-70% vs 73.3%)
✅ Three output files generated
✅ Recommendations justify GPT-4.1 choice

---

## Optimization Notes

### For Claude Sonnet 4.5

When running with Sonnet 4.5:

- Use extended thinking (8K-16K) for context size estimation
- Analyze whether tasks truly need >200K context (critical decision)
- Assess if literal-only is sufficient (vs benefits from minimal reasoning)
- Justify GPT-4.1 choice despite lower SWE-bench (54.6% vs 69-70%)

### For GPT-5.1-Codex-Mini

When running with GPT-5.1-Codex-Mini:

- Leverage 400K context to analyze large task lists
- Use adaptive reasoning for context size estimation
- Code-focused understanding for file size assessment
- Can read implementation files to estimate sizes accurately

### Critical Decision: GPT-4.1 vs GPT-5 Mini

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

## Related Commands

- `/speckit.tasks` - Generate tasks.md (run before this command)
- `/tasks-for-gpt-5-mini` - Identify small mechanical tasks (default, 69-70% SWE-bench)
- `/tasks-for-haiku-4-5` - Identify agentic tasks needing reasoning (0.33×, 73.3% SWE-bench)
- `/implement-tasks-for-gpt-4-1` - Execute GPT-4.1-suitable tasks (to be created)

---

## Notes

- This command is **read-only** (analyzes tasks.md, doesn't implement)
- Classification uses **reasoning model** (Sonnet 4.5 or GPT-5.1-Codex-Mini)
- GPT-4.1 is a **specialized tool** for large literal tasks, not general implementation
- **GPT-5 Mini is better** for 90% of tasks (<200K context, higher SWE-bench)
- GPT-4.1's value is **1M context at 0× cost** for overflow scenarios
- Use GPT-4.1 when **context forces it** AND task is **purely literal**
- Be conservative: Justify why GPT-5 Mini isn't sufficient
