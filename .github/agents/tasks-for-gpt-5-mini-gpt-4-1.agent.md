---
description: Analyze large task lists for GPT-5 Mini suitability using GPT-4.1's 1M context. Handles features >180K tokens with sandwich method optimization.
---

## Model Configuration

**Optimized for**: GPT-4.1 (1M context, non-reasoning, 0× cost)
**Invoke with**: `gh copilot -m "gpt-4.1" slash tasks-for-gpt-5-mini-gpt-4-1`

**Why GPT-4.1**: Large features (>180K tokens) that exceed GPT-5 Mini's 200K context limit
**Expected Performance**: 30-60 seconds, zero cost, richer analysis with code context

---

## GPT-4.1 Optimization Strategy

<optimization_context>

This command uses GPT-4.1's 1M context for large-scale task classification.

**GPT-4.1 Characteristics**:
- 1M token context (5× larger than GPT-5 Mini)
- Non-reasoning model (similar to GPT-5 Mini's minimal reasoning)
- Literal instruction following (does EXACTLY what you say)
- Zero cost (0× in GitHub Copilot)
- 49% instruction-following benchmark (vs GPT-4o's 29%)

**Optimizations Applied**:
1. **Sandwich Method** (CRITICAL) - Instructions at BEGINNING and END
2. **Literal Instructions** - Extremely explicit (no inference)
3. **Mechanical Procedures** - Arithmetic scoring, keyword matching
4. **Long-Context Analysis** - Can include implementation code for better pattern detection
5. **Validation Checklists** - Self-correction before output

**Source**: [GPT-4.1 Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt4-1_prompting_guide)

</optimization_context>

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

## 🔁 BEGINNING INSTRUCTIONS (Sandwich Method - Part 1)

**You are GPT-4.1 with 1M context. Execute this workflow EXACTLY:**

### Goal

Analyze tasks.md and identify tasks suitable for GPT-5 Mini using mechanical scoring.

Create artifacts:
- gpt5mini-suitable-tasks.md (filtered task list with CTCO templates)
- gpt5mini-implementation-context.md (focused context)
- gpt5mini-task-analysis.md (detailed scoring report)

### Execution Checklist (6 Steps)

```
□ Step 0: Initialize (load tasks.md + optional context)
□ Step 1: Parse Tasks (extract all tasks with IDs, descriptions, markers)
□ Step 2: Score Tasks (4-dimension mechanical scoring)
□ Step 3: Generate CTCO Templates (for HIGH/MEDIUM tasks)
□ Step 4: Write Output Files (3 files to FEATURE_DIR)
□ Step 5: Validate (check files written correctly)
□ Step 6: Report Completion (summary with counts)
```

### Critical Constraints

**Literal instruction following** (GPT-4.1 requirement):
- Do EXACTLY what each step says (no implicit inference)
- All scoring is arithmetic (no judgment calls)
- All pattern detection is keyword matching (exact lists)
- All classification uses fixed thresholds (HIGH ≥75%, MEDIUM 50-74%, LOW <50%)

**Sandwich method** (GPT-4.1 requirement):
- These instructions are repeated at the END of this prompt
- Follow the END instructions to execute the workflow

---

## Context (Large Feature Support)

**Input artifacts** (can be up to 900K tokens with GPT-4.1):

- specs/<feature>/tasks.md (REQUIRED - may be very large)
- specs/<feature>/spec.md (OPTIONAL - for user story context)
- specs/<feature>/plan.md (OPTIONAL - for file structure)
- specs/<feature>/contracts/*.ts (OPTIONAL - for pattern analysis)
- Implementation files (OPTIONAL - for actual code pattern detection)

**Your role**: Mechanical task classifier (arithmetic scoring, keyword matching)

**Output destination**: specs/<feature>/gpt5mini-*.md files

**Context advantage**: With 1M context, can analyze tasks PLUS implementation code for richer pattern detection

---

## Task (Mechanical Classification)

Classify each task using 4-dimension scoring (EXACTLY as specified):

### Dimension 1: CTCO Clarity (0-10)

**Arithmetic scoring** (add points for each condition):

```
score = 0
IF task.description contains file path pattern: score += 3
IF task.description contains pattern keywords: score += 3
IF task.description contains line number: score += 2
IF task.description contains success criteria: score += 2
RETURN score (0-10)
```

**File path patterns**: [".ts", ".html", ".scss", "packages/", "at line"]
**Pattern keywords**: ["following", "pattern from", "similar to", "like"]

### Dimension 2: Mechanical Procedure (0-10)

**Arithmetic scoring**:

```
score = 0
IF task.description contains ["rename", "replace"]: score += 4
IF task.description contains "following pattern": score += 3
IF task.description is single action verb: score += 2
IF task.description has NO decision keywords: score += 1
RETURN score (0-10)
```

**Decision keywords**: ["intelligently", "determine", "choose", "decide"]
**Single action verbs**: ["add", "rename", "update", "create", "delete"]

### Dimension 3: Format Explicitness (0-10)

**Arithmetic scoring**:

```
score = 0
IF task.description contains exact template: score += 4
IF task.description contains measurable criteria: score += 3
IF task.description specifies output format: score += 2
IF task.description has straightforward validation: score += 1
RETURN score (0-10)
```

### Dimension 4: Independence (0-10)

**Arithmetic scoring**:

```
score = 0
IF task is single file edit: score += 4
IF task has [P] marker: score += 2
IF task has NO "coordinate" keywords: score += 2
IF task has NO "integrate" keywords: score += 2
RETURN score (0-10)
```

### Calculate Suitability (Exact Formula)

```
total_score = dimension1 + dimension2 + dimension3 + dimension4
suitability_percentage = (total_score / 40) * 100

IF suitability_percentage >= 75:
  classification = "HIGH"
ELSE IF suitability_percentage >= 50:
  classification = "MEDIUM"
ELSE:
  classification = "LOW"
```

### Detect Pattern (Keyword Matching)

```
desc_lower = description.lower()

IF contains_any(desc_lower, ["rename", "replace", "update all"]):
  pattern = "Find-Replace"
ELSE IF contains_any(desc_lower, ["add method", "following pattern"]):
  pattern = "Add Method"
ELSE IF contains_any(desc_lower, ["add test", "test that"]):
  pattern = "Add Test"
ELSE IF contains_any(desc_lower, ["update docs", "document"]):
  pattern = "Update Docs"
ELSE IF contains_any(desc_lower, ["add check", "validate"]):
  pattern = "Conditional Logic"
ELSE IF contains_any(desc_lower, ["refactor", "extract", "reorganize"]):
  pattern = "Refactor"
ELSE IF contains_any(desc_lower, ["design", "choose", "decide"]):
  pattern = "Architecture"
ELSE:
  pattern = "Other"
```

---

## Constraints

### Literal Instruction Constraints (GPT-4.1 Specific)

**GPT-4.1 follows instructions LITERALLY**:
- Do EXACTLY what each step says
- Do NOT infer implicit requirements
- Do NOT skip any steps
- Do NOT summarize outputs (write complete files)

**Example**:
- Instruction: "Write complete report to file"
- GPT-4.1 interpretation: Write full structured report (not summary)
- ❌ WRONG: "Here's a summary of the report..."
- ✅ CORRECT: [Writes complete 500+ line report to file]

### Scoring Constraints (Mechanical Only)

**All scoring is arithmetic** (no judgment):
- Each dimension has explicit point rules
- All calculations use addition only
- No subjective assessment allowed
- Fixed thresholds (HIGH ≥75%, MEDIUM 50-74%, LOW <50%)

### Output Format Constraints

**File structure** (write COMPLETE files, not summaries):

1. gpt5mini-suitable-tasks.md:
   - Full task list with all HIGH/MEDIUM/LOW tasks
   - Complete CTCO templates for each task
   - Full pattern distribution table
   - Complete execution strategy

2. gpt5mini-implementation-context.md:
   - Complete CTCO templates for all patterns
   - Full file path reference list
   - Complete code pattern examples
   - Full success criteria checklists

3. gpt5mini-task-analysis.md:
   - Complete detailed analysis for ALL tasks
   - Full scoring breakdown for each task
   - Complete pattern distribution table
   - Full recommendations section

**Do NOT write summaries or abbreviated versions.**

---

## Execution Steps

### Step 0: Initialize

**Run prerequisite check**:

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON**:
```
FEATURE_DIR = json.FEATURE_DIR
TASKS_FILE = FEATURE_DIR + "/tasks.md"
SPEC_FILE = FEATURE_DIR + "/spec.md"
PLAN_FILE = FEATURE_DIR + "/plan.md"
```

**Load files** (GPT-4.1 can handle large context):
```
Read(TASKS_FILE)  # REQUIRED (may be 50-100K tokens)

IF SPEC_FILE exists:
  Read(SPEC_FILE)  # OPTIONAL (may be 30-50K tokens)

IF PLAN_FILE exists:
  Read(PLAN_FILE)  # OPTIONAL (may be 25-40K tokens)

# GPT-4.1 advantage: Can also load implementation code
IF implementation files exist AND total_context < 900K:
  Read(implementation_files)  # OPTIONAL (provides actual code patterns)
```

**Error condition**:
```
IF TASKS_FILE NOT FOUND:
  STOP
  OUTPUT: "❌ Error: tasks.md not found. Run /speckit.tasks first."
  EXIT
```

### Step 1: Parse Tasks

**Parse EXACTLY as written** (no interpretation):

```
task_list = []
current_phase = ""

FOR EACH line in tasks.md:
  IF line starts with "## Phase":
    current_phase = extract_phase_name(line)

  ELSE IF line starts with "- [ ]":
    task = {
      "id": extract_task_id(line),
      "description": extract_description(line),
      "markers": extract_markers(line),
      "phase": current_phase
    }
    task_list.append(task)
```

### Step 2: Score All Tasks (Mechanical)

**Apply arithmetic scoring** (EXACTLY as specified above):

```
FOR EACH task in task_list:
  task.dim1_score = calculate_dimension_1(task)
  task.dim2_score = calculate_dimension_2(task)
  task.dim3_score = calculate_dimension_3(task)
  task.dim4_score = calculate_dimension_4(task)
  task.total_score = sum(task.dim1_score, task.dim2_score, task.dim3_score, task.dim4_score)
  task.suitability = (task.total_score / 40) * 100

  IF task.suitability >= 75:
    task.classification = "HIGH"
  ELSE IF task.suitability >= 50:
    task.classification = "MEDIUM"
  ELSE:
    task.classification = "LOW"

  task.pattern = detect_pattern(task.description)
```

### Step 3: Generate CTCO Templates

**Generate for HIGH/MEDIUM tasks**:

```
FOR EACH task in task_list WHERE classification IN ["HIGH", "MEDIUM"]:
  ctco_template = generate_ctco_by_pattern(task.pattern, task.description)
  task.ctco_template = ctco_template
```

### Step 4: Write Output Files

**Write COMPLETE files** (not summaries):

```
# File 1: gpt5mini-suitable-tasks.md
output_file_1 = FEATURE_DIR + "/gpt5mini-suitable-tasks.md"
content_1 = generate_complete_task_list(task_list)
Write(output_file_1, content_1)

# File 2: gpt5mini-implementation-context.md
output_file_2 = FEATURE_DIR + "/gpt5mini-implementation-context.md"
content_2 = generate_complete_context(task_list)
Write(output_file_2, content_2)

# File 3: gpt5mini-task-analysis.md
output_file_3 = FEATURE_DIR + "/gpt5mini-task-analysis.md"
content_3 = generate_complete_analysis(task_list)
Write(output_file_3, content_3)
```

**CRITICAL**: Write FULL files, not summaries or excerpts.

### Step 5: Validate

**Check files written correctly**:

```
validation_results = {}

FOR EACH output_file:
  IF file_exists(output_file) AND file_size(output_file) > 1000:
    validation_results[file] = true
  ELSE:
    validation_results[file] = false

IF all(validation_results.values()) == false:
  STOP
  OUTPUT: "❌ Error: File generation failed"
  EXIT
```

### Step 6: Report Completion

**Generate summary** (after files are written):

```
OUTPUT: """
✅ GPT-5 Mini Task Classification Complete (GPT-4.1)

**Files Generated**:
1. gpt5mini-suitable-tasks.md
2. gpt5mini-implementation-context.md
3. gpt5mini-task-analysis.md

**Summary**:
- Total Tasks: [count]
- HIGH (≥75%): [count] ([percentage]%)
- MEDIUM (50-74%): [count] ([percentage]%)
- LOW (<50%): [count] ([percentage]%)

**Context Used**: [total_tokens]K / 1000K tokens

**Next Step**:
gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini
"""
```

---

## 🔁 END INSTRUCTIONS (Sandwich Method - Part 2)

# FINAL EXECUTION REMINDER

**You are GPT-4.1 with 1M context. Execute ALL 7 steps EXACTLY:**

```
□ Step 0: Initialize (load tasks.md + context)
□ Step 1: Parse Tasks (extract IDs, descriptions, markers)
□ Step 2: Score Tasks (4-dimension arithmetic scoring)
□ Step 3: Generate CTCO Templates (for HIGH/MEDIUM)
□ Step 4: Write Output Files (3 COMPLETE files)
□ Step 5: Validate (check files exist and size > 1000 bytes)
□ Step 6: Report Completion (summary with counts)
```

**CRITICAL CONSTRAINTS** (repeated):

1. **Literal instructions**: Do EXACTLY what each step says (no inference)
2. **Arithmetic scoring**: All scores calculated with explicit rules (no judgment)
3. **Write COMPLETE files**: Do NOT write summaries or excerpts
4. **File structure**: Use Write tool for all 3 output files
5. **Validation**: Check file_exists() AND file_size() > 1000 bytes

**OUTPUT FORMAT** (repeated):

- gpt5mini-suitable-tasks.md: COMPLETE task list (all HIGH/MEDIUM/LOW)
- gpt5mini-implementation-context.md: COMPLETE CTCO templates + patterns
- gpt5mini-task-analysis.md: COMPLETE detailed analysis (all tasks)

**EXECUTE STEP 6 NOW**

Write all files using Write tool, validate, then report completion summary.

---

## Helper Functions (Mechanical)

### contains_any(text, keyword_list)
```
FOR EACH keyword in keyword_list:
  IF keyword in text.lower():
    RETURN true
RETURN false
```

### extract_task_id(line)
```
matches = regex_find(line, r"T\d{3}")
IF matches:
  RETURN matches[0]
ELSE:
  RETURN "UNKNOWN"
```

### count_files_mentioned(description)
```
file_extensions = [".ts", ".html", ".scss", ".spec.ts", ".stories.ts"]
count = 0
FOR EACH extension in file_extensions:
  count += description.count(extension)
RETURN count
```

### estimate_time(pattern)
```
time_estimates = {
  "Find-Replace": "2-5",
  "Add Method": "5-10",
  "Add Test": "5-10",
  "Update Docs": "3-7",
  "Conditional Logic": "10-15",
  "Refactor": "15-30",
  "Architecture": "30-60"
}
RETURN time_estimates.get(pattern, "5-10")
```

---

## Error Handling

### Error 1: tasks.md Not Found
```
IF TASKS_FILE NOT FOUND:
  STOP
  OUTPUT: "❌ Error: tasks.md not found\n\nRun /speckit.tasks first."
  EXIT
```

### Error 2: Context Exceeds 1M
```
IF estimated_tokens > 950000:
  STOP
  OUTPUT: "❌ Error: Context exceeds 1M tokens\n\nSplit feature or reduce artifacts."
  EXIT
```

### Error 3: File Write Failed
```
IF file_write_failed:
  STOP
  OUTPUT: "❌ Error: Could not write [filename]\n\nCheck permissions."
  EXIT
```

### Error 4: Validation Failed
```
IF validation_failed:
  STOP
  OUTPUT: "❌ Error: Files not written correctly\n\nCheck file sizes and content."
  EXIT
```

---

## Optimization Notes

### Why GPT-4.1 for This Task

**Advantages over GPT-5 Mini**:
1. ✅ **5× larger context** - 1M vs 200K tokens
2. ✅ **Can include implementation code** - Better pattern detection
3. ✅ **Handles massive task lists** - 500+ tasks with full context
4. ✅ **Zero cost** - Same as GPT-5 Mini (0×)
5. ✅ **Better instruction following** - 49% benchmark vs baseline

**Trade-offs**:
- ⚠️ **Slower** - 30-60s vs GPT-5 Mini's 10-20s
- ⚠️ **More complex** - Sandwich method required
- ⚠️ **Needs literal instructions** - Less forgiving than GPT-5 Mini

**When to Use GPT-4.1** (vs GPT-5 Mini):
- Task list >180K tokens (exceeds GPT-5 Mini limit)
- Want to include implementation code for better patterns
- Large monorepo with 500+ tasks
- Can accept 30-60s execution time

**When to Use GPT-5 Mini** (default):
- Task list <180K tokens (90% of cases)
- Want fastest classification (10-20s)
- Don't need implementation code context
- Simple, straightforward workflow

### Sandwich Method Rationale

**Research Finding**:
> "For long contexts, the best results come from placing instructions both before and after the provided content."

**Source**: [GPT-4.1 Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt4-1_prompting_guide)

**Why it works**:
- GPT-4.1 processes 1M tokens from different positions
- Instructions at both ends ensure accessibility
- End instructions provide final execution reminder
- Critical for reliability with large contexts

### Literal Instruction Following

**Research Finding**:
> "GPT-4.1 won't follow implicit rules anymore—it does exactly what you tell it to do, no more, no less."

**Source**: [PromptHub GPT-4.1 Guide](https://www.prompthub.us/blog/the-complete-guide-to-gpt-4-1-models-performance-pricing-and-prompting-tips)

**Implementation**:
- All instructions are explicit (no inference)
- "Write complete file" not "write file"
- "Use Write tool" not "create output"
- Repeated constraints at beginning and end

---

## Success Criteria

Classification is successful when:

✅ All 7 steps executed in order
✅ All tasks scored on 4 dimensions
✅ All scores calculated arithmetically
✅ All patterns detected by keywords
✅ Three COMPLETE files written (not summaries)
✅ File validation passed (exists + size > 1000 bytes)
✅ Completion summary provided
✅ Context used <1M tokens
✅ Zero cost (GPT-4.1)

---

## Related Commands

- `/speckit.tasks` - Generate tasks.md (run before this)
- `/tasks-for-gpt-5-mini-gpt-5-mini` - Alternative: GPT-5 Mini classification (faster, <180K tokens)
- `/tasks-for-gpt-5-mini` - Alternative: Sonnet 4.5 classification (best quality)
- `/implement-tasks-for-gpt-5-mini` - Execute GPT-5 Mini-suitable tasks (run after this)

---

## Notes

- This command uses **GPT-4.1** for large-scale classification (>180K tokens)
- **Sandwich method** is CRITICAL for GPT-4.1 reliability (instructions at both ends)
- **Literal instructions** required (GPT-4.1 does EXACTLY what you say)
- **1M context** allows including implementation code for richer analysis
- **Zero cost** (0× multiplier) same as GPT-5 Mini
- **30-60 seconds** execution time (vs GPT-5 Mini's 10-20s)
- Use **GPT-5 Mini** for normal task lists (<180K tokens)
- Use **GPT-4.1** for overflow scenarios (>180K tokens)
