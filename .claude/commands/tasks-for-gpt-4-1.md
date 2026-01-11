---
description: Analyze tasks.md and identify tasks suitable for GPT-4.1 implementation. Creates optimized artifacts for large literal mechanical tasks requiring 1M context.
---

## Model Selection

**Optimized For**: Claude Sonnet 4.5
**Expected Performance**: 2-5 minutes for analysis, identifies large-scale mechanical tasks that exceed GPT-5 Mini's 200K context limit

**Why Sonnet**: Task classification requires reasoning about context size, complexity, and literal procedure suitability—Sonnet's deep reasoning ensures accurate classification.

---

## Goal

<goal>
Analyze tasks.md and identify tasks suitable for GPT-4.1 implementation based on:
- Large context requirements (>200K tokens)
- Purely literal/mechanical procedures (no reasoning benefit)
- Cross-file consistency needs
- Precision requirements (minimal unnecessary changes)

Create optimized artifacts:

- gpt41-suitable-tasks.md (filtered task list with literal procedures)
- gpt41-implementation-context.md (focused context for GPT-4.1)
- gpt41-task-analysis.md (detailed suitability report)
  </goal>

## GPT-4.1 Characteristics

<model_profile>
**GPT-4.1 Strengths:**

- 1M token context window (5× larger than GPT-5 Mini's 200K)
- Zero cost (0× multiplier in GitHub Copilot)
- Literal instruction following (49% benchmark vs GPT-4o's 29%)
- Cross-file refactoring with consistency maintenance
- 2% unnecessary edits (vs GPT-4o's 9%) - very precise
- 54.6% SWE-bench Verified (proven implementation capability)

**GPT-4.1 Limitations:**

- Non-reasoning model (cannot make creative decisions)
- Slower than GPT-5 Mini (30-60s vs 10-20s)
- Lower SWE-bench than GPT-5 Mini (54.6% vs 69-70%)
- Requires sandwich method optimization (instructions at both ends)
- Needs extremely literal instructions (no inference)

**GPT-4.1 Sweet Spot:**

- ✅ Large-context mechanical tasks (200K-900K tokens)
- ✅ Repository-wide literal transformations (50+ files)
- ✅ Cross-file consistency with exact procedures
- ✅ Large file edits with explicit line-by-line instructions
- ✅ Multi-file coordination (mechanical, not reasoned)
- ✅ Precision-critical tasks (only touch specified files)

**NOT Suitable for GPT-4.1:**

- ❌ Tasks needing ANY reasoning (use GPT-5 Mini, Haiku, or Sonnet instead)
- ❌ Small tasks <200K context (use GPT-5 Mini—faster and better SWE-bench)
- ❌ Pattern adaptation (needs minimal reasoning)
- ❌ Implicit dependency resolution
- ❌ Creative problem-solving

**Key Insight**: GPT-5 Mini has 69-70% SWE-bench (15 points BETTER than GPT-4.1's 54.6%) due to minimal reasoning. Only use GPT-4.1 when context size (>200K) forces it AND task is purely literal.
</model_profile>

---

## Prerequisites

Run from repository root:

```bash
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON output for:**

- `FEATURE_DIR` - Absolute path to feature directory
- `AVAILABLE_DOCS` - List of existing files

**Derive paths:**

- `TASKS` = FEATURE_DIR/tasks.md (REQUIRED)
- `SPEC` = FEATURE_DIR/spec.md (OPTIONAL)
- `PLAN` = FEATURE_DIR/plan.md (OPTIONAL)
- `OUTPUT_TASKS` = FEATURE_DIR/gpt41-suitable-tasks.md
- `OUTPUT_CONTEXT` = FEATURE_DIR/gpt41-implementation-context.md
- `OUTPUT_ANALYSIS` = FEATURE_DIR/gpt41-task-analysis.md

---

## Analysis Workflow

<workflow>

### Step 1: Load Context Documents

Load in this order:

1. **tasks.md** (REQUIRED):
   - Parse all tasks
   - Estimate context size per task
   - Identify multi-file tasks

2. **spec.md** (OPTIONAL):
   - Understand requirements
   - Assess feature complexity

3. **plan.md** (OPTIONAL):
   - Understand file structure
   - Identify large files

4. **Implementation files** (OPTIONAL - use extended thinking):
   - Assess actual file sizes
   - Identify large files (>2K lines)
   - Count total files in feature

### Step 2: Classify Tasks Using 4-Dimension Scoring

For each task, score 0-10 on these dimensions:

#### Dimension 1: Context Size (0-10)

Does this task require >200K tokens of context?

**Scoring criteria:**

- Task involves file >3K lines? +4
- Task involves 10+ files simultaneously? +3
- Task needs to see all files at once? +3

**Examples:**

- **10 points**: Refactor 5K-line component OR update 15 files for consistency
- **5 points**: Edit 2K-line file OR update 5 files
- **0 points**: Edit 500-line file OR single file update

#### Dimension 2: Literal-Only Procedure (0-10)

Is the task 100% literal with NO reasoning benefit?

**Scoring criteria:**

- Task has STEP 1, 2, 3... format? +4
- Every step specifies exact action (no "intelligently")? +3
- Task requires zero interpretation? +3

**Examples:**

- **10 points**: "STEP 1: Go to line 145. STEP 2: Insert [exact code]. STEP 3: Go to line 289..."
- **5 points**: "Add method following pattern" (needs minimal reasoning to adapt)
- **0 points**: "Refactor to improve performance" (needs reasoning)

**Critical**: If task benefits from GPT-5 Mini's minimal reasoning, score 0—GPT-5 Mini is better choice.

#### Dimension 3: Cross-File Consistency (0-10)

Does task require coordinating changes across multiple files?

**Scoring criteria:**

- Updates interface + all implementations? +4
- Maintains consistency across 5+ files? +3
- Has explicit consistency checks? +3

**Examples:**

- **10 points**: "Update AccordionConfig interface + all 12 usages across 5 files, verify consistency"
- **5 points**: "Update component and its test file"
- **0 points**: "Update single file"

#### Dimension 4: Precision (0-10)

Does task require minimal unnecessary changes?

**Scoring criteria:**

- Specifies exact files only (no exploration)? +3
- Has explicit boundaries ("do NOT modify X")? +3
- Requires only changed lines (not full rewrites)? +4

**Examples:**

- **10 points**: "Update ONLY files A, B, C. Do NOT modify D, E. Change only lines matching pattern."
- **5 points**: "Update component (may need to touch related files)"
- **0 points**: "Improve the codebase" (vague scope)

#### Calculate Suitability

```
total_score = context_size + literal_only + cross_file + precision
suitability_percentage = (total_score / 40) * 100

IF suitability_percentage >= 75:
  classification = "HIGH" (GPT-4.1 recommended)
ELSE IF suitability_percentage >= 50:
  classification = "MEDIUM" (Consider Haiku 4.5 - has reasoning + context)
ELSE:
  classification = "LOW" (Use GPT-5 Mini or Haiku - better for small/reasoning tasks)
```

### Step 3: Assess Context Requirements

For HIGH/MEDIUM tasks, estimate actual context needed:

<context_estimation>

**Per-Task Context Calculation:**

```
task_context = 0

# Base files needed
FOR EACH file in task.file_list:
  file_size = estimate_file_size(file)
  task_context += file_size

# Dependencies
IF task requires seeing dependencies:
  task_context += estimate_dependencies(task)

# Related files for consistency
IF task has cross-file consistency:
  task_context += count_related_files(task) × average_file_size

# Buffer for instructions
task_context += 20000  # 20K buffer
```

**Classification Adjustment:**

```
IF task_context > 900000:
  WARN: "Task may exceed GPT-4.1's 1M context"
  SUGGEST: "Split into subtasks or use progressive disclosure"

ELSE IF task_context < 200000:
  DOWNGRADE: "Task fits in GPT-5 Mini (200K)"
  RECOMMEND: "Use GPT-5 Mini instead (faster, 69-70% SWE-bench vs GPT-4.1's 54.6%)"
```

</context_estimation>

### Step 4: Detect Task Patterns

<task_patterns>

**Pattern A: Repository-Wide Find-Replace** (HIGH - typically 90-100%)

- Keywords: "repository-wide", "all files", "50+ files"
- Context: 400K-800K tokens
- GPT-4.1 advantage: Can see all files, ensure consistency
- Example: "Rename oldName → newName across all 75 files"

**Pattern B: Large File Literal Edit** (HIGH - typically 85-95%)

- Keywords: "at line X", "insert at line Y", "large file", ">3K lines"
- Context: 200K-400K tokens
- GPT-4.1 advantage: Can hold entire large file in context
- Example: "Edit accordion.component.ts (5K lines) with exact steps"

**Pattern C: Cross-File Consistency Update** (HIGH - typically 85-95%)

- Keywords: "update interface + implementations", "maintain consistency", "verify across"
- Context: 300K-600K tokens
- GPT-4.1 advantage: See all related files simultaneously
- Example: "Update interface + 15 implementations, verify consistency"

**Pattern D: Multi-File Mechanical Transform** (HIGH - typically 80-90%)

- Keywords: "apply to all", "batch update", "10+ files"
- Context: 250K-500K tokens
- GPT-4.1 advantage: Batch processing with global view
- Example: "Convert all 20 components to inject() pattern"

**Pattern E: Small File Update** (LOW - use GPT-5 Mini instead)

- Context: <100K tokens
- Better model: GPT-5 Mini (faster, 69-70% SWE-bench)
- Example: "Add method to single component"

**Pattern F: Adaptive Implementation** (LOW - use GPT-5 Mini/Haiku instead)

- Needs minimal reasoning to adapt patterns
- Better model: GPT-5 Mini (has minimal reasoning, 69-70% SWE-bench)
- Example: "Add method following pattern" (needs adaptation)

</task_patterns>

### Step 5: Generate Artifacts

Create three output files with GPT-4.1-specific optimizations.

</workflow>

---

## Output Structures

### Artifact 1: gpt41-suitable-tasks.md

<output_template_1>

````markdown
# GPT-4.1 Suitable Tasks: [Feature Name]

**Generated**: [Date]
**Source**: tasks.md
**Target Model**: GPT-4.1 (1M context, non-reasoning, 0× cost)

**Optimization Strategy**: Large-scale literal mechanical tasks exceeding GPT-5 Mini's 200K context

---

## Task Summary

- **Total Tasks in tasks.md**: [number]
- **GPT-4.1 Suitable (HIGH)**: [number] ([percentage]%)
- **Haiku Recommended (MEDIUM)**: [number] ([percentage]%)
- **GPT-5 Mini Recommended (LOW)**: [number] ([percentage]%)

**Context Size Distribution**:

- Tasks requiring >500K context: [number]
- Tasks requiring 200K-500K context: [number]
- Tasks requiring <200K context: [number] (use GPT-5 Mini instead)

**Expected Performance**:

- GPT-4.1 tasks: Zero cost (0×), 30-60s each
- Quality: 54.6% SWE-bench (acceptable for literal-only tasks)

---

## Phase 1: [Phase Name]

### HIGH Suitability Tasks (GPT-4.1 - 1M context, 0× cost)

- [ ] T087 [Pattern: Repo-Wide] Apply inject() pattern to 25 component files
  - **Suitability Score**: 95% (Context: 10/10, Literal: 10/10, Cross-File: 10/10, Precision: 10/10)
  - **Context Required**: ~450K tokens (25 files × 18K average)
  - **Why GPT-4.1**: Exceeds GPT-5 Mini's 200K limit, purely mechanical procedure
  - **Why NOT GPT-5 Mini**: Context overflow (69-70% SWE-bench wasted)
  - **Estimated Time**: 30-45 minutes
  - **Literal Procedure**:
    ```
    STEP 1: FOR EACH file in [exact list of 25 files]
    STEP 2: Find constructor injection pattern
    STEP 3: Replace with inject() function (exact template provided)
    STEP 4: Update imports
    STEP 5: Verify TypeScript compilation
    ```

- [ ] T042 [Pattern: Large File] Refactor accordion.component.ts (5K lines) with literal steps
  - **Suitability Score**: 88% (Context: 10/10, Literal: 9/10, Cross-File: 7/10, Precision: 9/10)
  - **Context Required**: ~300K tokens (5K-line file + dependencies)
  - **Why GPT-4.1**: Large file needs 1M context, literal refactoring steps provided
  - **Why NOT GPT-5 Mini**: File size exceeds 200K context
  - **Estimated Time**: 20-30 minutes
  - **Literal Procedure**:
    ```
    STEP 1: Extract lines 145-289 to new class AccordionState
    STEP 2: Update imports at lines 12-15
    STEP 3: Update 15 method calls at lines [exact list]
    STEP 4: Verify TypeScript compilation
    ```

### MEDIUM Suitability Tasks (Haiku 4.5 Recommended - 0.33×)

- [ ] T055 [Pattern: Cross-File] Update AccordionConfig across 5 files with adaptation
  - **Suitability Score**: 65% (Context: 8/10, Literal: 5/10, Cross-File: 9/10, Precision: 8/10)
  - **Context Required**: ~180K tokens (5 files, near GPT-5 Mini limit)
  - **Why Haiku**: Needs light reasoning for pattern adaptation, 73.3% SWE-bench
  - **Why NOT GPT-4.1**: Benefits from reasoning (GPT-4.1 is 54.6% SWE-bench)
  - **Why NOT GPT-5 Mini**: Near context limit, better with Haiku's 200K + reasoning

---

## Excluded Tasks (GPT-5 Mini or Haiku Recommended)

### Use GPT-5 Mini (0×, faster, better SWE-bench)

- [ ] T001 [LOW: 25%] Add down() method to accordion-item-def.ts
  - **Context Required**: ~15K tokens (single small file)
  - **Reason**: Fits in GPT-5 Mini's 200K, GPT-5 Mini has better SWE-bench (69-70% vs 54.6%)
  - **GPT-5 Mini Advantage**: Faster (10-20s vs 30-60s), minimal reasoning helps adaptation

### Use Haiku 4.5 (0.33×, reasoning + agentic)

- [ ] T030 [LOW: 35%] Refactor with architectural decisions
  - **Context Required**: ~120K tokens
  - **Reason**: Needs light reasoning for design decisions
  - **Haiku Advantage**: 73.3% SWE-bench, agentic capabilities, worth 0.33× cost

---

## Implementation Strategy

**Recommended Approach**:

1. **GPT-5 Mini First**: Execute small mechanical tasks (<200K context) - Fast, 69-70% SWE-bench
2. **GPT-4.1 for Large Literal**: Execute large literal tasks (>200K context) - 0× cost, 1M context
3. **Haiku for Large + Reasoning**: Execute large tasks needing reasoning - 0.33×, 73.3% SWE-bench
4. **Sonnet for Complex**: Hand off reasoning-heavy tasks - 1×, expert quality

**Expected Performance**:

- GPT-4.1 tasks: [X] tasks, 0× cost, handles scale GPT-5 Mini cannot
- Total savings: Use free GPT-4.1 instead of Haiku (0× vs 0.33×) for literal-only large tasks

---

## Next Steps

1. Review this analysis
2. Run GPT-4.1 execution: `gh copilot -m "gpt-4.1" slash implement-tasks-for-gpt-4-1` (to be created)
3. Use GPT-5 Mini for small tasks: `gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini`
4. Use Haiku for large tasks needing reasoning: `gh copilot -m "claude-haiku-4.5" slash implement-tasks-for-haiku-4-5`
````

</output_template_1>

### Artifact 2: gpt41-implementation-context.md

<output_template_2>

```markdown
# GPT-4.1 Implementation Context: [Feature Name]

**Purpose**: Provide literal, explicit context for GPT-4.1 task execution

**GPT-4.1 Requirements**: Sandwich method, literal instructions, no inference

---

## Literal Procedures (Per Pattern)

### Pattern: Repository-Wide Find-Replace

**BEGINNING INSTRUCTIONS**:

STEP 1: FOR EACH file in [exact list]:
a. Read(file)
b. Count exact matches of "oldString"
c. IF count > 0: Edit(file, old="oldString", new="newString", replace_all=true)
d. Record: "[file]: [count] replacements"

STEP 2: Verify TypeScript compilation:
npx tsc --noEmit

STEP 3: Report completion with counts

**Files** (exact list): [complete file paths]

**END INSTRUCTIONS** (repeated):
Execute STEP 1-3 EXACTLY. No interpretation. Literal following only.

---

### Pattern: Large File Literal Edit

**BEGINNING INSTRUCTIONS**:

STEP 1: Read [large_file.ts]
STEP 2: Go to line [X]
STEP 3: Insert exact code block:
```

[exact code provided]

```
STEP 4: Go to line [Y]
STEP 5: Replace lines [Y]-[Z] with exact code block:
```

[exact code provided]

```
STEP 6: Verify TypeScript compilation

**END INSTRUCTIONS** (repeated):
Execute STEP 1-6 EXACTLY at specified line numbers. Do NOT interpret or adapt.

---

### Pattern: Cross-File Consistency Update

**BEGINNING INSTRUCTIONS**:

STEP 1: Read interface definition file
STEP 2: Record current interface structure
STEP 3: FOR EACH implementation file in [exact list]:
  a. Read file
  b. Find all usages of interface
  c. Update to match new structure (exact template provided)
  d. Verify consistency with interface
STEP 4: Verify TypeScript compilation across all files

**Files** (exact list): [interface file + all implementation files]

**END INSTRUCTIONS** (repeated):
Execute STEP 1-4 EXACTLY. Verify consistency mechanically (no interpretation).

---

## File Path Reference

[Complete list of all files for GPT-4.1 tasks]

---

## Success Criteria (Literal Verification)

**Repository-Wide Update**:
- [ ] All [N] files processed (no files skipped)
- [ ] Exact string replaced ([M] total replacements)
- [ ] No partial matches replaced
- [ ] TypeScript compilation succeeds
- [ ] No files modified outside [exact list]

**Large File Edit**:
- [ ] Code inserted at exact line [X]
- [ ] Code replaced at exact lines [Y]-[Z]
- [ ] No other changes made
- [ ] TypeScript compilation succeeds
- [ ] File size increased by expected amount

**Cross-File Consistency**:
- [ ] Interface updated
- [ ] All [N] implementations updated
- [ ] Consistency verified mechanically
- [ ] TypeScript compilation succeeds
- [ ] No orphaned references remain

---

## Constraints (CRITICAL)

- **LITERAL FOLLOWING ONLY**: Do EXACTLY what instructions say
- **NO INTERPRETATION**: If unclear, STOP and ask (do NOT infer)
- **NO REASONING**: If task needs reasoning, STOP (wrong model)
- **EXACT FILES ONLY**: Touch only specified files
- **MINIMAL CHANGES**: Only change what's explicitly required (target: 2% unnecessary edits)
- **SANDWICH METHOD**: Instructions at BEGINNING and END of each task
```

</output_template_2>

### Artifact 3: gpt41-task-analysis.md

<output_template_3>

```markdown
# GPT-4.1 Task Suitability Analysis: [Feature Name]

**Generated**: [Date]
**Analyzer**: Claude Sonnet 4.5
**Target Model**: GPT-4.1 (1M context, non-reasoning, 0× cost)

---

## Executive Summary

**Tasks Analyzed**: [number]
**GPT-4.1 Suitable (HIGH)**: [number] ([percentage]%)
**Haiku Recommended (MEDIUM)**: [number] ([percentage]%)
**GPT-5 Mini Recommended (LOW)**: [number] ([percentage]%)

**Key Finding**: [X] tasks require >200K context and are purely literal (GPT-4.1's sweet spot)

**SWE-bench Context**:

- GPT-4.1: 54.6% (acceptable for literal-only tasks)
- GPT-5 Mini: 69-70% (better for tasks needing minimal reasoning)
- Recommendation: Use GPT-4.1 ONLY when context forces it (>200K)

---

## Detailed Task Analysis

### Task: T087 - Repository-wide inject() pattern update

**Classification**: HIGH (95%)
**Pattern**: Repo-Wide Find-Replace
**Files**: 25 component files
**Context Required**: ~450K tokens

**Scores**:

- Context Size: 10/10 (25 files, ~450K tokens, EXCEEDS GPT-5 Mini's 200K)
- Literal-Only: 10/10 (exact STEP 1-5 procedure, no interpretation)
- Cross-File: 10/10 (all 25 files must be consistent)
- Precision: 10/10 (exact file list, no exploration, only specified changes)

**Rationale**:
This task is perfect for GPT-4.1 because it requires 450K tokens of context (2.25× GPT-5 Mini's limit) and is purely mechanical with no reasoning benefit. GPT-4.1's 1M context can hold all 25 files simultaneously to ensure consistency. The literal STEP 1-5 procedure aligns with GPT-4.1's non-reasoning strength.

**Why NOT GPT-5 Mini**:

- ❌ Context overflow: 450K > 200K limit
- ⚠️ Would need to process in batches (risks inconsistency)
- ✅ GPT-5 Mini's 69-70% SWE-bench wasted (no reasoning needed)

**Why NOT Haiku 4.5**:

- ⚠️ Costs 0.33× (vs GPT-4.1's 0×)
- ⚠️ Reasoning capability wasted (purely mechanical task)
- ✅ Could handle it, but GPT-4.1 is free and sufficient

**GPT-4.1 Optimization**:

- Use sandwich method (instructions at both ends)
- Provide exact file list (no wildcards)
- Specify literal procedure (STEP 1, 2, 3...)
- Verify with TypeScript compilation

**Estimated Time**:

- GPT-4.1: 30-45 minutes
- Alternative (Haiku 4.5): 25-35 minutes (faster but costs 0.33×)

---

[Repeat for all tasks...]

---

## Context Size Analysis

**Distribution**:
| Context Range | Task Count | Recommended Model |
|---------------|------------|-------------------|
| <100K tokens | [N] | GPT-5 Mini (faster, better SWE-bench) |
| 100-200K tokens | [N] | GPT-5 Mini (fits in 200K context) |
| 200-500K tokens | [N] | **GPT-4.1** (exceeds GPT-5 Mini) |
| 500K-900K tokens | [N] | **GPT-4.1** (large-scale operations) |
| >900K tokens | [N] | Split task or use progressive disclosure |

---

## Pattern Distribution

| Pattern                | Count | Avg Context | Avg Suitability | GPT-4.1?           |
| ---------------------- | ----- | ----------- | --------------- | ------------------ |
| Repo-Wide Transform    | [N]   | 450K        | 95%             | ✅ Yes             |
| Large File Edit        | [N]   | 320K        | 88%             | ✅ Yes             |
| Cross-File Consistency | [N]   | 280K        | 90%             | ✅ Yes             |
| Multi-File Mechanical  | [N]   | 250K        | 85%             | ✅ Yes             |
| Small File Update      | [N]   | 80K         | 25%             | ❌ No (GPT-5 Mini) |

---

## Cost-Benefit Analysis

### Option 1: All-Sonnet (Baseline)

- Total tasks: [N]
- Time: [X] minutes
- Cost: $[Y]
- Quality: 100% (gold standard)

### Option 2: Optimized (GPT-5 Mini + GPT-4.1 + Haiku + Sonnet)

**GPT-5 Mini** (<200K context, mechanical):

- Tasks: [A]
- Time: [B] minutes
- Cost: $0
- SWE-bench: 69-70%

**GPT-4.1** (>200K context, literal-only):

- Tasks: [C]
- Time: [D] minutes
- Cost: $0
- SWE-bench: 54.6%

**Haiku 4.5** (>200K context, needs reasoning):

- Tasks: [E]
- Time: [F] minutes
- Cost: $[G] (0.33×)
- SWE-bench: 73.3%

**Sonnet 4.5** (complex reasoning):

- Tasks: [H]
- Time: [I] minutes
- Cost: $[J] (1×)

**Totals**: [Time] minutes, $[Cost] ([Savings]% cheaper than all-Sonnet)

---

## Recommendations

1. ✅ **Use GPT-4.1 for [X] HIGH tasks** (>200K context, literal-only, 0× cost)
   - Accept 54.6% SWE-bench (vs GPT-5 Mini's 69-70%) as trade-off for 1M context
   - Purely mechanical tasks don't benefit from reasoning anyway

2. ⚠️ **Use Haiku 4.5 for [Y] MEDIUM tasks** (>200K context, needs reasoning, 0.33×)
   - Worth the cost: 73.3% SWE-bench (19 points better than GPT-4.1)
   - Light reasoning valuable for adaptation

3. ✅ **Use GPT-5 Mini for [Z] LOW tasks** (<200K context, 0×)
   - Faster (10-20s vs 30-60s)
   - Better SWE-bench (69-70% vs 54.6%)
   - Minimal reasoning helps with adaptation

4. 📊 **Track GPT-4.1 precision** (target: 2% unnecessary edits)
   - Measure files touched vs files specified
   - Compare actual vs expected changes
   - Validate GPT-4.1's precision advantage

---

## Next Steps

1. Review this analysis
2. Run: `/implement-tasks-for-gpt-4-1` (to be created)
3. Monitor GPT-4.1 execution (precision, time, context usage)
4. Compare results vs GPT-5 Mini/Haiku alternatives
```

</output_template_3>

---

## Extended Thinking Configuration

<extended_thinking>

**Budget**: 8K-16K tokens (deep reasoning)

**When to use extended thinking:**

1. Estimating context size for complex multi-file tasks
2. Determining if task truly benefits from 1M context
3. Assessing whether literal-only is sufficient (vs needs minimal reasoning)
4. Justifying GPT-4.1 over GPT-5 Mini (despite lower SWE-bench)

**Critical analysis needed**:

- Is >200K context truly required? (Extended thinking to analyze file sizes)
- Would minimal reasoning help? (If yes, use GPT-5 Mini despite context constraints)
- Is 54.6% SWE-bench acceptable? (Literal tasks may tolerate lower score)

</extended_thinking>

---

## Path Grounding

<path_protocol>

**CRITICAL**: Do **not** guess or "fix up" filesystem paths.

**Rules**:

1. Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
2. Use paths verbatim
3. If required path missing/unclear, STOP and re-run prerequisite script

</path_protocol>

---

## Error Handling

### If tasks.md not found:

```
STOP
OUTPUT: "❌ Error: tasks.md not found. Run /speckit.tasks first."
EXIT
```

### If all tasks score LOW:

```
IF all tasks require <200K context:
  OUTPUT: "✅ All tasks fit in GPT-5 Mini's 200K context (better model: 69-70% SWE-bench)\n\nNo tasks suitable for GPT-4.1.\n\nRecommend: Use /tasks-for-gpt-5-mini instead."
  EXIT
```

### If task context >900K:

```
IF task requires >900K context:
  WARN: "⚠️ Task [id] may exceed GPT-4.1's 1M context\n\nEstimated: [X]K tokens\n\nSuggest: Split into subtasks or use progressive disclosure"
```

---

## Notes

- This command uses **Sonnet 4.5's deep reasoning** for accurate context size estimation
- GPT-4.1 is a **specialized tool** for large literal tasks (not a general implementation model)
- **GPT-5 Mini is better** for most tasks (<200K context, 69-70% vs 54.6% SWE-bench)
- GPT-4.1's value is **1M context at 0× cost**, not implementation quality
- Use GPT-4.1 when **context forces it** AND task is **purely literal**

---

## Related Commands

- `/speckit.tasks` - Generate tasks.md (run before this command)
- `/tasks-for-gpt-5-mini` - Identify small mechanical tasks (default, better SWE-bench)
- `/tasks-for-haiku-4-5` - Identify agentic tasks (0.33×, 73.3% SWE-bench)
- `/implement-tasks-for-gpt-4-1` - Execute GPT-4.1-suitable tasks (to be created)
