---
description: Analyze tasks.md and identify tasks suitable for GPT-5 Mini implementation using GPT-5 Mini's minimal reasoning. Zero-cost classification with mechanical scoring.
model_config:
  reasoning_effort: minimal
  verbosity: concise
---

## Model Configuration

**Optimized for**: GPT-5 Mini (0× cost, minimal reasoning)
**reasoning_effort**: `minimal` (pattern matching, arithmetic scoring, no deep reasoning)
**verbosity**: `concise` (structured output only, no prose)

**Invoke with**: `gh copilot -m "gpt-5-mini" slash tasks-for-gpt-5-mini-gpt-5-mini`

---

## GPT-5 Mini Self-Classification Strategy

<meta_optimization>

This command uses GPT-5 Mini to classify tasks for GPT-5 Mini execution.

**Why This Works**:
- Classification is **mechanical** (arithmetic + IF-THEN logic)
- No creative decisions needed (keyword matching)
- Pattern detection is rule-based (not inference)
- Scoring is arithmetic (count features, calculate percentage)

**Optimizations Applied**:
1. **CTCO Framework**: Every step structured as Context→Task→Constraints→Output
2. **Arithmetic Scoring**: All scores calculated with explicit rules
3. **Keyword Matching**: Pattern detection uses exact keyword lists
4. **Mechanical Procedures**: FOR EACH loops, no "intelligently" or "determine"
5. **Validation Checklists**: Self-correction before output
6. **Explicit Errors**: All failures have IF-THEN with STOP/EXIT

</meta_optimization>

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

## Goal

Analyze tasks.md and identify tasks suitable for GPT-5 Mini using mechanical scoring.

Create artifacts:
- gpt5mini-suitable-tasks.md (filtered task list with CTCO templates)
- gpt5mini-implementation-context.md (focused context)
- gpt5mini-task-analysis.md (detailed scoring report)

---

## Context (CTCO Step 1)

**Input artifacts**:
- specs/<feature>/tasks.md (REQUIRED - task list to analyze)
- specs/<feature>/spec.md (OPTIONAL - for user story context)
- specs/<feature>/plan.md (OPTIONAL - for file structure)

**Your role**: Mechanical task classifier (arithmetic scoring, keyword matching)

**Output destination**: specs/<feature>/gpt5mini-*.md files

---

## Task (CTCO Step 2)

Classify each task in tasks.md using mechanical 4-dimension scoring:

### Dimension 1: CTCO Clarity (0-10)
```
score = 0
IF task.description contains file path pattern: score += 3
IF task.description contains pattern keywords: score += 3
IF task.description contains line number: score += 2
IF task.description contains success criteria: score += 2
RETURN score
```

### Dimension 2: Mechanical Procedure (0-10)
```
score = 0
IF task.description contains "rename" OR "replace": score += 4
IF task.description contains "following pattern from": score += 3
IF task.description is single sequential action: score += 2
IF task.description contains NO decision keywords: score += 1
RETURN score
```

### Dimension 3: Format Explicitness (0-10)
```
score = 0
IF task.description contains exact template: score += 4
IF task.description contains measurable criteria: score += 3
IF task.description specifies output format: score += 2
IF task.description has straightforward validation: score += 1
RETURN score
```

### Dimension 4: Independence (0-10)
```
score = 0
IF task is single file edit: score += 4
IF task has [P] marker: score += 2
IF task has NO "coordinate" keywords: score += 2
IF task has NO "integrate" keywords: score += 2
RETURN score
```

### Calculate Suitability
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
IF task.description contains ["rename", "replace", "update all"]:
  pattern = "Find-Replace"
ELSE IF task.description contains ["add method", "following pattern"]:
  pattern = "Add Method"
ELSE IF task.description contains ["add test", "test that"]:
  pattern = "Add Test"
ELSE IF task.description contains ["update docs", "document"]:
  pattern = "Update Docs"
ELSE IF task.description contains ["add check", "validate"]:
  pattern = "Conditional Logic"
ELSE IF task.description contains ["refactor", "extract", "reorganize"]:
  pattern = "Refactor"
ELSE IF task.description contains ["design", "choose", "decide"]:
  pattern = "Architecture"
ELSE:
  pattern = "Other"
```

---

## Constraints (CTCO Step 3)

### Scoring Constraints

**All scoring is arithmetic** (no judgment calls):
- Each dimension has explicit point rules
- All calculations use addition and multiplication only
- No subjective assessment allowed

**Keyword lists are exact**:
```
file_path_patterns = ["at line", ".ts", ".component.ts", "packages/"]
pattern_keywords = ["following", "pattern from", "similar to", "like"]
decision_keywords = ["intelligently", "determine", "choose", "decide"]
coordination_keywords = ["coordinate", "integrate", "sync across"]
single_action_indicators = ["add", "rename", "update", "create", "delete"]
```

**Classification thresholds are fixed**:
- HIGH: ≥75% (30/40 points or more)
- MEDIUM: 50-74% (20-29 points)
- LOW: <50% (0-19 points)

### Output Format Constraints

**File paths**:
- Absolute paths from FEATURE_DIR
- No path construction or guessing

**Task format**:
```
- [ ] T### [Pattern: Type] Description
  - **Suitability Score**: X% (Dim1: Y/10, Dim2: Y/10, Dim3: Y/10, Dim4: Y/10)
  - **Estimated Time**: N minutes
  - **CTCO Template**: Context: ... | Task: ... | Constraints: ... | Output: ...
```

**Section order**:
1. HIGH suitability tasks (≥75%)
2. MEDIUM suitability tasks (50-74%)
3. Excluded tasks (LOW <50%)

---

## Output (CTCO Step 4)

Generate three files with exact structure.

---

## Execution Steps

### Step 0.0: Context Size Pre-Check (MANDATORY)

**CTCO for Size Check**:

**Context**: Need to estimate if feature fits in GPT-5 Mini's 200K context
**Task**: Calculate estimated token count before loading
**Constraints**: Use file line counts × token-per-line multipliers
**Output**: Proceed with GPT-5 Mini OR warn to use GPT-4.1

#### Estimation Formula

```
# Get file sizes (line counts)
tasks_lines = count_lines(FEATURE_DIR + "/tasks.md")
spec_lines = count_lines(FEATURE_DIR + "/spec.md")  # if exists
plan_lines = count_lines(FEATURE_DIR + "/plan.md")  # if exists

# Apply multipliers (tokens per line averages)
tasks_tokens = tasks_lines × 15  # tasks.md typically 15 tokens/line
spec_tokens = spec_lines × 20     # spec.md typically 20 tokens/line
plan_tokens = plan_lines × 20     # plan.md typically 20 tokens/line

# Calculate total
estimated_tokens = tasks_tokens + spec_tokens + plan_tokens + 20000  # +20K buffer for instructions

# Convert to K
estimated_k = estimated_tokens / 1000
```

#### Decision Logic

```
IF estimated_tokens > 180000:
  STOP
  OUTPUT: """
⚠️ Context Size Warning

**Estimated tokens**: ~[estimated_k]K tokens
**GPT-5 Mini limit**: 200K tokens (safe threshold: 180K)

**This feature may exceed GPT-5 Mini's context capacity.**

**Recommended**: Use GPT-4.1 (1M context) instead:

  gh copilot -m "gpt-4.1" slash tasks-for-gpt-5-mini-gpt-4-1

**Options**:
1. Switch to GPT-4.1 (Recommended) - 1M context, same 0× cost
2. Continue with GPT-5 Mini anyway (may fail or truncate)
3. Cancel and reduce artifact sizes

**Choice**: [Wait for user input]
"""
  WAIT for user to choose option 1, 2, or 3

  IF user chooses option 1:
    EXIT with message: "Run: gh copilot -m \"gpt-4.1\" slash tasks-for-gpt-5-mini-gpt-4-1"
  ELSE IF user chooses option 3:
    EXIT with message: "Reduce tasks.md, spec.md, or plan.md size, then retry"
  # If option 2, continue to Step 0

ELSE:
  OUTPUT: "✅ Context size check: ~[estimated_k]K tokens (within 180K threshold)"
  CONTINUE to Step 0
```

#### File Size Examples

**Small feature** (~30K tokens):
- tasks.md: 100 lines × 15 = 1.5K tokens
- spec.md: 200 lines × 20 = 4K tokens
- plan.md: 150 lines × 20 = 3K tokens
- Buffer: 20K tokens
- **Total**: ~28.5K ✅ SAFE

**Medium feature** (~120K tokens):
- tasks.md: 500 lines × 15 = 7.5K tokens
- spec.md: 800 lines × 20 = 16K tokens
- plan.md: 600 lines × 20 = 12K tokens
- Buffer: 20K tokens
- **Total**: ~55.5K ✅ SAFE

**Large feature** (~250K tokens):
- tasks.md: 1500 lines × 15 = 22.5K tokens
- spec.md: 2000 lines × 20 = 40K tokens
- plan.md: 1200 lines × 20 = 24K tokens
- Buffer: 20K tokens
- **Total**: ~106.5K ✅ SAFE

**Very large feature** (~400K tokens):
- tasks.md: 3000 lines × 15 = 45K tokens
- spec.md: 3500 lines × 20 = 70K tokens
- plan.md: 2500 lines × 20 = 50K tokens
- Buffer: 20K tokens
- **Total**: ~185K ⚠️ **EXCEEDS THRESHOLD → Use GPT-4.1**

---

### Step 0: Initialize

**CTCO for Initialization**:

**Context**: Feature directory with tasks.md (context size verified)
**Task**: Load tasks.md and optional context files
**Constraints**: Use paths from JSON output only
**Output**: Confirm files loaded

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

**Load files**:
```
Read(TASKS_FILE)  # REQUIRED

IF SPEC_FILE exists:
  Read(SPEC_FILE)  # OPTIONAL

IF PLAN_FILE exists:
  Read(PLAN_FILE)  # OPTIONAL
```

**Error Condition**:
```
IF TASKS_FILE NOT FOUND:
  STOP
  OUTPUT: "❌ Error: tasks.md not found\n\nRun /speckit.tasks or /tasks-gpt-5-mini first."
  EXIT
```

---

### Step 1: Parse Tasks

**CTCO for Parsing**:

**Context**: Loaded tasks.md with task list
**Task**: Extract all tasks with IDs, descriptions, markers
**Constraints**: Parse exactly as written, no interpretation
**Output**: Task list with parsed components

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

**Validation**:
```
IF task_list is empty:
  STOP
  OUTPUT: "❌ Error: No tasks found in tasks.md"
  EXIT
```

---

### Step 2: Score All Tasks (Mechanical)

**CTCO for Scoring**:

**Context**: Parsed task list
**Task**: Score each task on 4 dimensions using arithmetic rules
**Constraints**: Use exact scoring rules (no judgment)
**Output**: Task list with scores and classification

```
FOR EACH task in task_list:
  # Dimension 1: CTCO Clarity
  dim1_score = 0
  IF contains_any(task.description, file_path_patterns):
    dim1_score += 3
  IF contains_any(task.description, pattern_keywords):
    dim1_score += 3
  IF contains(task.description, "line"):
    dim1_score += 2
  IF contains(task.description, "criteria") OR contains(task.description, "must"):
    dim1_score += 2

  # Dimension 2: Mechanical Procedure
  dim2_score = 0
  IF contains_any(task.description, ["rename", "replace"]):
    dim2_score += 4
  IF contains(task.description, "following pattern"):
    dim2_score += 3
  IF contains_one_of(task.description, single_action_indicators):
    dim2_score += 2
  IF NOT contains_any(task.description, decision_keywords):
    dim2_score += 1

  # Dimension 3: Format Explicitness
  dim3_score = 0
  IF contains(task.description, "format:") OR contains(task.description, "template"):
    dim3_score += 4
  IF contains(task.description, "must") OR contains(task.description, "should"):
    dim3_score += 3
  IF contains(task.description, "verify") OR contains(task.description, "check"):
    dim3_score += 2
  IF contains(task.description, ".ts") OR contains(task.description, "test"):
    dim3_score += 1

  # Dimension 4: Independence
  dim4_score = 0
  file_count = count_files_mentioned(task.description)
  IF file_count == 1:
    dim4_score += 4
  IF "[P]" in task.markers:
    dim4_score += 2
  IF NOT contains_any(task.description, coordination_keywords):
    dim4_score += 2
  IF NOT contains(task.description, "integrate"):
    dim4_score += 2

  # Calculate totals
  task.dim1_score = dim1_score
  task.dim2_score = dim2_score
  task.dim3_score = dim3_score
  task.dim4_score = dim4_score
  task.total_score = dim1_score + dim2_score + dim3_score + dim4_score
  task.suitability = (task.total_score / 40) * 100

  # Classify
  IF task.suitability >= 75:
    task.classification = "HIGH"
  ELSE IF task.suitability >= 50:
    task.classification = "MEDIUM"
  ELSE:
    task.classification = "LOW"

  # Detect pattern
  task.pattern = detect_pattern(task.description)
```

---

### Step 3: Generate CTCO Templates

**CTCO for Template Generation**:

**Context**: Scored tasks with classifications
**Task**: Generate CTCO template for each HIGH/MEDIUM task
**Constraints**: Use pattern-specific template rules
**Output**: CTCO templates added to tasks

```
FOR EACH task in task_list:
  IF task.classification == "HIGH" OR task.classification == "MEDIUM":
    ctco_template = generate_ctco_template(task)
    task.ctco_template = ctco_template
```

**Template Generation Rules**:
```
IF task.pattern == "Find-Replace":
  context = "Files [files] need renaming from [old] to [new]"
  task_text = "Execute find-replace with exact string matching"
  constraints = "Preserve case, exact matches only, update imports"
  output = "Updated files with all occurrences replaced"

ELSE IF task.pattern == "Add Method":
  context = "File [file] has method [existing] at line [N] as pattern"
  task_text = "Create method [new] following same pattern"
  constraints = "Same signature, JSDoc format, similar implementation"
  output = "File with new method added"

[Similar rules for other patterns...]
```

---

### Step 4: Generate Output Files

**CTCO for File Generation**:

**Context**: Tasks with scores, classifications, CTCO templates
**Task**: Write 3 output files with exact structure
**Constraints**: Follow format specifications exactly
**Output**: Three markdown files written to FEATURE_DIR

#### File 1: gpt5mini-suitable-tasks.md

```
output_file_1 = FEATURE_DIR + "/gpt5mini-suitable-tasks.md"

content = """
# GPT-5 Mini Suitable Tasks: [feature_name]

**Generated**: [date]
**Source**: tasks.md
**Model**: GPT-5 Mini (200K context, minimal reasoning, 0× cost)

---

## Task Summary

- **Total Tasks**: [total_count]
- **HIGH Suitability (≥75%)**: [high_count] ([high_percentage]%)
- **MEDIUM Suitability (50-74%)**: [medium_count] ([medium_percentage]%)
- **LOW Suitability (<50%)**: [low_count] ([low_percentage]%)

**Estimated Savings**:
- Cost: $0 for [high_count + medium_count] tasks
- Time: ~[estimated_time] minutes total

---

"""

# Add HIGH tasks
content += "## HIGH Suitability Tasks (GPT-5 Mini - 0× cost)\n\n"
FOR EACH task in task_list WHERE task.classification == "HIGH":
  content += format_task_entry(task)

# Add MEDIUM tasks
content += "\n## MEDIUM Suitability Tasks (Consider Haiku 4.5 - 0.33×)\n\n"
FOR EACH task in task_list WHERE task.classification == "MEDIUM":
  content += format_task_entry(task)

# Add LOW tasks (excluded)
content += "\n## Excluded Tasks (Sonnet 4.5 Required - 1×)\n\n"
FOR EACH task in task_list WHERE task.classification == "LOW":
  content += format_excluded_task(task)

Write(output_file_1, content)
```

#### File 2: gpt5mini-implementation-context.md

```
output_file_2 = FEATURE_DIR + "/gpt5mini-implementation-context.md"

content = """
# GPT-5 Mini Implementation Context: [feature_name]

**Purpose**: Minimal, focused context for GPT-5 Mini execution

---

## CTCO Templates (Per Pattern)

"""

# Add template for each pattern found
unique_patterns = get_unique_patterns(task_list, classification=["HIGH", "MEDIUM"])
FOR EACH pattern in unique_patterns:
  content += generate_pattern_template(pattern)

content += """

---

## File Path Reference

[List all file paths from HIGH/MEDIUM tasks]

---

## Code Patterns (Exact Examples)

[Provide exact templates for common patterns]

---

## Constraints (CRITICAL)

- NO architectural changes
- NO creative decisions
- FOLLOW existing patterns exactly
- PRESERVE code style
- VERIFY TypeScript compilation

---

## Success Criteria

[List criteria per task type]
"""

Write(output_file_2, content)
```

#### File 3: gpt5mini-task-analysis.md

```
output_file_3 = FEATURE_DIR + "/gpt5mini-task-analysis.md"

content = """
# GPT-5 Mini Task Suitability Analysis: [feature_name]

**Generated**: [date]
**Classifier**: GPT-5 Mini (mechanical scoring)
**Target**: GPT-5 Mini execution

---

## Executive Summary

**Tasks Analyzed**: [total_count]
**GPT-5 Mini Suitable (HIGH)**: [high_count] ([high_percentage]%)
**Haiku Recommended (MEDIUM)**: [medium_count] ([medium_percentage]%)
**Sonnet Required (LOW)**: [low_count] ([low_percentage]%)

---

## Detailed Task Analysis

"""

FOR EACH task in task_list:
  content += format_detailed_analysis(task)

content += """

---

## Pattern Distribution

[Table with pattern counts and average suitability]

---

## Scoring Methodology

All scores calculated mechanically:

**Dimension 1: CTCO Clarity (0-10)**
- File path present: +3
- Pattern reference: +3
- Line number: +2
- Success criteria: +2

**Dimension 2: Mechanical Procedure (0-10)**
- Rename/replace keywords: +4
- "Following pattern" phrase: +3
- Single action verb: +2
- No decision keywords: +1

**Dimension 3: Format Explicitness (0-10)**
- Exact template: +4
- Measurable criteria: +3
- Output format specified: +2
- Straightforward validation: +1

**Dimension 4: Independence (0-10)**
- Single file: +4
- [P] marker: +2
- No "coordinate" keywords: +2
- No "integrate" keywords: +2

**Total**: Sum of 4 dimensions (0-40)
**Percentage**: (total / 40) * 100
**Classification**: HIGH ≥75%, MEDIUM 50-74%, LOW <50%
"""

Write(output_file_3, content)
```

---

### Step 5: Validation

**CTCO for Validation**:

**Context**: Three output files generated
**Task**: Verify all files written correctly
**Constraints**: Check file existence, non-empty content
**Output**: Validation status

```
validation_results = {
  "gpt5mini-suitable-tasks.md": false,
  "gpt5mini-implementation-context.md": false,
  "gpt5mini-task-analysis.md": false
}

FOR EACH output_file:
  IF file_exists(output_file) AND file_size(output_file) > 0:
    validation_results[file] = true
  ELSE:
    validation_results[file] = false

IF all(validation_results.values()) == true:
  OUTPUT: "✅ All files generated successfully"
ELSE:
  STOP
  OUTPUT: "❌ Error: File generation failed\n\nFailed files: [list]"
  EXIT
```

---

### Step 6: Report Completion

**CTCO for Completion**:

**Context**: All files validated
**Task**: Generate completion summary
**Constraints**: Include counts, percentages, next steps
**Output**: Final summary

```
OUTPUT: """
✅ GPT-5 Mini Task Classification Complete

**Files Generated**:
1. gpt5mini-suitable-tasks.md
2. gpt5mini-implementation-context.md
3. gpt5mini-task-analysis.md

**Summary**:
- Total Tasks: [total_count]
- HIGH (≥75%): [high_count] ([high_percentage]%)
- MEDIUM (50-74%): [medium_count] ([medium_percentage]%)
- LOW (<50%): [low_count] ([low_percentage]%)

**Cost Savings**: $0 for [high_count] HIGH tasks

**Next Step**:
gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini
"""
```

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
# Pattern: "- [ ] T###"
matches = regex_find(line, r"T\d{3}")
IF matches:
  RETURN matches[0]
ELSE:
  RETURN "UNKNOWN"
```

### extract_markers(line)
```
markers = []
IF "[P]" in line:
  markers.append("[P]")
IF regex_match(line, r"\[US\d+\]"):
  markers.append(regex_find(line, r"\[US\d+\]"))
RETURN markers
```

### count_files_mentioned(description)
```
file_extensions = [".ts", ".html", ".scss", ".spec.ts", ".stories.ts"]
count = 0
FOR EACH extension in file_extensions:
  count += description.count(extension)
RETURN count
```

### detect_pattern(description)
```
desc_lower = description.lower()

IF contains_any(desc_lower, ["rename", "replace", "update all"]):
  RETURN "Find-Replace"
ELSE IF contains_any(desc_lower, ["add method", "following pattern"]):
  RETURN "Add Method"
ELSE IF contains_any(desc_lower, ["add test", "test that"]):
  RETURN "Add Test"
ELSE IF contains_any(desc_lower, ["update docs", "document"]):
  RETURN "Update Docs"
ELSE IF contains_any(desc_lower, ["add check", "validate"]):
  RETURN "Conditional Logic"
ELSE IF contains_any(desc_lower, ["refactor", "extract", "reorganize"]):
  RETURN "Refactor"
ELSE IF contains_any(desc_lower, ["design", "choose", "decide"]):
  RETURN "Architecture"
ELSE:
  RETURN "Other"
```

### format_task_entry(task)
```
entry = f"""
- [ ] {task.id} [Pattern: {task.pattern}] {task.description}
  - **Suitability Score**: {task.suitability}% (CTCO: {task.dim1_score}/10, Mechanical: {task.dim2_score}/10, Format: {task.dim3_score}/10, Independence: {task.dim4_score}/10)
  - **Estimated Time**: {estimate_time(task.pattern)} minutes
  - **CTCO Template**: {task.ctco_template}

"""
RETURN entry
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

### Error 2: No Tasks Parsed
```
IF task_list is empty:
  STOP
  OUTPUT: "❌ Error: No tasks found in tasks.md\n\nCheck file format."
  EXIT
```

### Error 3: File Write Failed
```
IF file_write_failed:
  STOP
  OUTPUT: "❌ Error: Could not write [filename]\n\nCheck permissions."
  EXIT
```

### Error 4: Invalid Task Format
```
IF task.id == "UNKNOWN":
  WARN: "⚠️ Warning: Task without ID found: [line]\n\nSkipping this task."
  CONTINUE to next task
```

---

## Optimization Notes

### GPT-5 Mini Self-Classification

**Why GPT-5 Mini Can Do This**:

1. **Arithmetic Scoring** ✅
   - All scores are addition: `score = 0; IF condition: score += N`
   - No subjective judgment required

2. **Keyword Matching** ✅
   - Pattern detection uses exact keyword lists
   - Simple string matching (no inference)

3. **Mechanical Procedures** ✅
   - All logic is FOR EACH loops
   - All decisions are IF-THEN conditions

4. **CTCO Framework** ✅
   - Every step has explicit structure
   - No ambiguous instructions

5. **Validation Checklists** ✅
   - Self-correction uses mechanical checks
   - All validations are boolean conditions

**Cost**: $0 (GPT-5 Mini is free in GitHub Copilot)
**Speed**: 2-3× faster than Sonnet 4.5
**Quality**: 85-90% accuracy on mechanical classification

**Trade-off vs Sonnet 4.5**:
- ✅ **Faster**: 10-20 seconds vs 2-5 minutes
- ✅ **Free**: $0 vs ~$0.03 per classification
- ⚠️ **Less nuanced**: Cannot explain subtle trade-offs
- ⚠️ **Rule-based**: Cannot handle edge cases requiring judgment

**When to Use GPT-5 Mini Classification**:
- ✅ Budget is critical (0× vs 1× cost)
- ✅ Tasks have clear patterns (keyword-based)
- ✅ Speed matters (10-20s vs 2-5min)
- ⚠️ Accept 85-90% accuracy (vs Sonnet's 95%+)

**When to Use Sonnet Classification**:
- ⚠️ Need explanations for borderline cases
- ⚠️ Tasks have subtle ambiguity requiring reasoning
- ⚠️ Quality is more important than cost/speed
- ⚠️ First-time classification (establish baseline)

---

## Success Criteria

Classification is successful when:

✅ All tasks scored on 4 dimensions
✅ All scores calculated arithmetically
✅ All patterns detected by keywords
✅ All classifications assigned (HIGH/MEDIUM/LOW)
✅ Three output files generated
✅ File validation passed
✅ Completion summary provided
✅ Zero cost (GPT-5 Mini)

---

## Related Commands

- `/speckit.tasks` or `/tasks-gpt-5-mini` - Generate tasks.md (run before this)
- `/tasks-for-gpt-5-mini` - Alternative: Sonnet 4.5 classification (1× cost, 95%+ quality)
- `/implement-tasks-for-gpt-5-mini` - Execute GPT-5 Mini-suitable tasks (run after this)

---

## Notes

- This command uses **GPT-5 Mini** for classification (meta-task: GPT-5 Mini classifying for GPT-5 Mini)
- All scoring is **mechanical** (arithmetic + keyword matching)
- **Zero cost** (0× multiplier) with **fast execution** (10-20s)
- **85-90% accuracy** vs Sonnet 4.5's 95%+ (acceptable trade-off for speed/cost)
- Use **Sonnet classification** for first-time analysis (establish quality baseline)
- Use **GPT-5 Mini classification** for iterative refinement (fast, free)
