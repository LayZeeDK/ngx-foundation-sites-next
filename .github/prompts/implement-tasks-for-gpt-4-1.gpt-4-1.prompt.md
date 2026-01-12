---
description: Execute GPT-4.1-suitable tasks with sandwich method optimizations. Large-scale literal mechanical implementation using 1M context at zero cost.
agent: implement-tasks-for-gpt-4-1.gpt-4-1
model: gpt-4.1
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

Execute GPT-4.1-suitable tasks from gpt41-suitable-tasks.md using literal procedures.

**Focus**: Large-scale literal mechanical implementation (>200K context per task)
**Strategy**: Sandwich method, literal following, precision execution (2% target)

### Execution Checklist (7 Steps)

```
□ Step 0: Initialize (load gpt41-suitable-tasks.md + context)
□ Step 1: Verify Scope (check all tasks are HIGH suitability ≥75%)
□ Step 2: Create Execution Plan (calculate time, order tasks)
□ Step 3: Execute Tasks (apply literal procedures)
□ Step 4: Verify Changes (TypeScript, tests, lint)
□ Step 5: Track Precision (count files, calculate %)
□ Step 6: Report Completion (summary with metrics)
```

### Critical Constraints

**Literal instruction following** (GPT-4.1 requirement):

- Do EXACTLY what each STEP says (no implicit inference)
- Do NOT adapt or improve (follow instructions literally)
- Do NOT touch files not explicitly listed
- Do NOT skip any steps

**Precision target** (GPT-4.1 strength):

- Only modify files explicitly listed in task
- Only change lines/sections specified
- Target: 2% unnecessary edits

---

## Execution Steps

### Step 0: Initialize & Load Context

**BEGINNING INSTRUCTIONS for Step 0**:

Load GPT-4.1-suitable tasks and context files EXACTLY as specified.

**Procedure**:

```bash
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON**:

```
FEATURE_DIR = json.FEATURE_DIR
```

**Load files** (EXACTLY these, no others):

1. **gpt41-suitable-tasks.md** (REQUIRED)
2. **gpt41-implementation-context.md** (REQUIRED)
3. **spec.md** (OPTIONAL): Load only if context file explicitly references it

**Error Condition**:

```
IF gpt41-suitable-tasks.md NOT FOUND:
  STOP
  OUTPUT: "❌ Error: gpt41-suitable-tasks.md not found\n\nRun: copilot -m \"claude-sonnet-4.5\" slash tasks-for-gpt-4-1"
  EXIT
```

**END INSTRUCTIONS for Step 0** (repeated):

Load gpt41-suitable-tasks.md and gpt41-implementation-context.md EXACTLY. Do NOT load other files unless context file explicitly references them. EXECUTE Step 1 next.

---

### Step 1: Verify Task Scope

**BEGINNING INSTRUCTIONS for Step 1**:

Count tasks by suitability. STOP if LOW suitability tasks found.

**Procedure**:

```
task_count = 0
high_count = 0
medium_count = 0
low_count = 0

FOR EACH task in gpt41-suitable-tasks.md:
  task_count += 1
  IF task.suitability >= 75:
    high_count += 1
  ELSE IF task.suitability >= 50:
    medium_count += 1
  ELSE:
    low_count += 1
```

**Output**:

```
Tasks: [task_count] total
- HIGH (≥75%): [high_count]
- MEDIUM (50-74%): [medium_count]
- LOW (<50%): [low_count]
```

**Error Condition**:

```
IF low_count > 0:
  STOP
  OUTPUT: "⚠️ Warning: Found [low_count] LOW suitability tasks\n\nLOW tasks not suitable for GPT-4.1"
  WAIT for user to confirm removal or cancel
```

**END INSTRUCTIONS for Step 1** (repeated):

Verify all tasks are HIGH or MEDIUM. STOP if LOW tasks found. EXECUTE Step 2 next.

---

### Step 2: Create Execution Plan

**BEGINNING INSTRUCTIONS for Step 2**:

Calculate time estimates and generate execution order.

**Output**:

```markdown
## Execution Plan

**HIGH Tasks**: [high_count]

- Estimated time: [high_time] minutes
- Patterns: [pattern_counts]

**Total Time**: [total_time] minutes
**Cost**: $0 (GPT-4.1 free)

**Order**: Execute sequentially (verify after each task)
```

**END INSTRUCTIONS for Step 2** (repeated):

Output execution plan. EXECUTE Step 3 next.

---

### Step 3: Execute Tasks (Literal Pattern-Based)

**BEGINNING INSTRUCTIONS for Step 3**:

For each task, apply literal procedure from gpt41-implementation-context.md. Execute tasks sequentially (NOT parallel) to maintain precision.

---

#### Pattern A: Repository-Wide Find-Replace

**BEGINNING PROCEDURE for Pattern A**:

Execute EXACTLY these steps for repository-wide find-replace:

**STEP 1**: Extract parameters from task

```
file_list = extract_file_list(task.description)
old_string = extract_old_string(task.description)
new_string = extract_new_string(task.description)
```

**STEP 2**: Process each file

```
total_replacements = 0

FOR EACH file in file_list:
  Read(file)
  occurrence_count = count_exact_matches(file_content, old_string)

  IF occurrence_count == 0:
    OUTPUT: "⚠️ No matches in [file]"
    CONTINUE to next file

  Edit(file_path: file, old_string: old_string, new_string: new_string, replace_all: true)
  total_replacements += occurrence_count
  OUTPUT: "✅ [file]: [occurrence_count] replacements"
```

**STEP 3**: Verify TypeScript compilation

```bash
npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json
```

**STEP 4**: Report completion

**Verification Checklist**:

```
□ All files in list processed?
□ Exact strings replaced (not partial)?
□ Total count matches expected?
□ TypeScript compilation succeeds?
□ No files outside list modified?
```

**END PROCEDURE for Pattern A** (repeated):

Execute STEP 1-4 EXACTLY for repository-wide find-replace. Verify TypeScript compilation. Report total replacements.

---

#### Pattern B: Large File Literal Edit

**BEGINNING PROCEDURE for Pattern B**:

Execute EXACTLY these steps for large file literal edits:

**STEP 1**: Load large file

```
large_file = extract_file_path(task.description)
Read(large_file)
```

**STEP 2**: Extract edit instructions from task

**STEP 3**: Apply edits sequentially (in reverse order to preserve line numbers)

```
edits_sorted = sort(edits, key=line_number, reverse=true)

FOR EACH edit in edits_sorted:
  Apply edit using Edit tool
  OUTPUT: "✅ Edit at line [line_number]: [action]"
```

**STEP 4**: Verify TypeScript compilation

**STEP 5**: Report completion

**Verification Checklist**:

```
□ All edits from task applied?
□ Line numbers were exact?
□ Only specified sections modified?
□ TypeScript compilation succeeds?
```

**END PROCEDURE for Pattern B** (repeated):

Execute STEP 1-5 EXACTLY for large file edits. Apply edits in reverse order (preserve line numbers). Verify compilation.

---

#### Pattern C: Cross-File Consistency Update

**BEGINNING PROCEDURE for Pattern C**:

Execute EXACTLY these steps for cross-file consistency updates:

**STEP 1**: Load interface definition

**STEP 2**: Load all implementation files (exact list)

**STEP 3**: Update interface file (if modified)

**STEP 4**: Update each implementation file

```
FOR EACH impl_file in implementation_files:
  Find usages, update with exact template
  OUTPUT: "✅ [impl_file]: [usage_count] usages updated"
```

**STEP 5**: Verify TypeScript compilation across all files

**STEP 6**: Verify consistency mechanically (check no orphaned references)

**STEP 7**: Report completion

**Verification Checklist**:

```
□ Interface updated (if required)?
□ All implementation files updated?
□ No orphaned references?
□ TypeScript compilation succeeds?
```

**END PROCEDURE for Pattern C** (repeated):

Execute STEP 1-7 EXACTLY for cross-file updates. Verify consistency mechanically. No files outside explicit list modified.

---

#### Pattern D: Multi-File Mechanical Transform

**BEGINNING PROCEDURE for Pattern D**:

Execute EXACTLY these steps for multi-file batch transformations:

**STEP 1**: Extract file list and transformation

**STEP 2**: Apply transformation to each file

```
FOR EACH file in file_list:
  OUTPUT: "🔧 Processing [file]..."
  Read(file)
  Apply transformation steps
  OUTPUT: "✅ [file]: Transform applied"
```

**STEP 3**: Verify TypeScript compilation

**STEP 4**: Verify count matches

```
IF processed_count != length(file_list):
  ERROR: "❌ File count mismatch"
  EXIT
```

**STEP 5**: Report completion

**END PROCEDURE for Pattern D** (repeated):

Execute STEP 1-5 EXACTLY for multi-file transforms. Process all files in exact list. Verify count matches.

---

### Step 4: Verification After All Tasks

**BEGINNING INSTRUCTIONS for Step 4**:

Run full verification suite. All must pass.

**Procedure**:

```bash
# STEP 1: TypeScript compilation
npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json

# STEP 2: Run tests
npm run test

# STEP 3: Run linting
npm run lint

# STEP 4: Build library
npm run build
```

**Success Output**:

```markdown
## Verification Complete ✅

- ✅ TypeScript: PASS
- ✅ Tests: PASS ([N] tests)
- ✅ Lint: PASS
- ✅ Build: PASS
```

**END INSTRUCTIONS for Step 4** (repeated):

Run all 4 verifications. STOP if any fail. Report PASS for all.

---

### Step 5: Track Precision Metrics

**BEGINNING INSTRUCTIONS for Step 5**:

Calculate precision metrics (GPT-4.1's 2% target).

**Procedure**:

```
files_specified = count_files_in_tasks(gpt41-suitable-tasks.md)
files_modified = count_modified_files_in_git()

unnecessary_edits = files_modified - files_specified
precision_rate = (unnecessary_edits / files_modified) * 100

OUTPUT: """
## Precision Metrics

- Files specified in tasks: [files_specified]
- Files actually modified: [files_modified]
- Unnecessary edits: [unnecessary_edits]
- Precision rate: [precision_rate]%

**Target**: <2% unnecessary edits
**Result**: [PASS/FAIL based on <2% threshold]
"""
```

**Warning Condition**:

```
IF precision_rate > 2:
  WARN: "⚠️ Precision warning: [precision_rate]% unnecessary edits (target: <2%)"
```

**END INSTRUCTIONS for Step 5** (repeated):

Calculate precision rate. Warn if >2%. Report metrics.

---

### Step 6: Report Completion

**BEGINNING INSTRUCTIONS for Step 6**:

Generate final summary with all metrics.

**Output**:

```markdown
## Implementation Complete ✅

**Tasks Executed**: [completed_count]
**Actual Time**: [actual_time] minutes
**Cost**: $0 (GPT-4.1)
**Quality**: 100% (all verifications passed)

**Pattern Distribution**:

- Repository-Wide: [count]
- Large File Edit: [count]
- Cross-File Consistency: [count]
- Multi-File Transform: [count]

**Precision Metrics**:

- Files specified: [N]
- Files modified: [M]
- Unnecessary edits: [M-N] ([precision_rate]%)
- Target: <2% ✅/❌

**Next Steps**:

1. Review changes: git diff
2. Commit changes
3. Push to remote (if ready)
```

**END INSTRUCTIONS for Step 6** (repeated):

Report completion with full metrics. Include precision rate, verification status, context usage.

---

## 🔁 END INSTRUCTIONS (Sandwich Method - Part 2)

# FINAL EXECUTION REMINDER

**You are GPT-4.1 with 1M context. Execute ALL steps EXACTLY:**

```
□ Step 0: Initialize (load gpt41-suitable-tasks.md + context)
□ Step 1: Verify Scope (all tasks ≥75% suitability)
□ Step 2: Create Plan (calculate time, order tasks)
□ Step 3: Execute Tasks (apply literal procedures from context file)
□ Step 4: Verify (TypeScript, tests, lint, build—ALL must pass)
□ Step 5: Track Precision (count files, calculate %, compare to 2% target)
□ Step 6: Report (summary with metrics)
```

**CRITICAL CONSTRAINTS** (repeated):

1. **Literal following**: Do EXACTLY what each STEP says (no inference, no interpretation)
2. **No improvisation**: Do NOT adapt, improve, or optimize beyond instructions
3. **Precision**: Only touch files explicitly listed (target: <2% unnecessary edits)
4. **Verification**: Run TypeScript compilation after EACH task (STOP if fails)
5. **Exact boundaries**: Do NOT modify files outside explicit lists
6. **Sequential execution**: Process tasks one at a time (NOT parallel—maintain precision)

**PATTERNS** (repeated):

- Pattern A: Repository-wide find-replace (STEP 1-4)
- Pattern B: Large file literal edit (STEP 1-5)
- Pattern C: Cross-file consistency (STEP 1-7)
- Pattern D: Multi-file transform (STEP 1-5)

**EXECUTE NOW**

Apply patterns from gpt41-implementation-context.md. Use sandwich method for each task. Verify after each. Report completion with precision metrics.

---

## Error Handling

### Error 1: gpt41-suitable-tasks.md Not Found

```
IF file NOT FOUND:
  STOP
  OUTPUT: "❌ Error: gpt41-suitable-tasks.md not found\n\nRun classification first:\n  copilot -m \"claude-sonnet-4.5\" slash tasks-for-gpt-4-1"
  EXIT
```

### Error 2: LOW Suitability Tasks Found

```
IF low_tasks > 0:
  STOP
  OUTPUT: "❌ Error: LOW suitability tasks in list (not suitable for GPT-4.1)"
  WAIT for user confirmation
```

### Error 3: TypeScript Compilation Fails

```
IF compilation fails:
  STOP
  OUTPUT: "❌ TypeScript compilation failed\n\nTask: [task_id]\nFile: [file]\nError: [error]\n\nRevert: git checkout [modified_files]"
  EXIT
```

### Error 4: Precision Target Exceeded

```
IF precision_rate > 5:
  WARN: "⚠️ Precision exceeded 5%\n\nMay indicate incorrect file modifications"
```

---

## Success Criteria

Implementation is successful when:

✅ All HIGH suitability tasks completed
✅ TypeScript compilation succeeds
✅ All tests passing
✅ Linting clean
✅ Build successful
✅ No LOW suitability tasks attempted
✅ Precision rate <2% (target) or <5% (acceptable)
✅ Only specified files modified
✅ Zero cost (GPT-4.1)

---

## Related Commands

- `/tasks-for-gpt-4-1` - Identify GPT-4.1-suitable tasks (run before this command)
- `/implement-tasks-for-gpt-5-mini` - Alternative: Small mechanical tasks (faster, better SWE-bench)
- `/implement-tasks-for-haiku-4-5` - Alternative: Tasks needing light reasoning (0.33×, 73.3% SWE-bench)

---

## Notes

- This command uses **GPT-4.1** for large-scale literal execution
- **Sandwich method** is CRITICAL (instructions at both ends of each task)
- **Literal following only** (no adaptation, improvisation, or inference)
- **1M context** allows handling 50+ files or very large files
- **Sequential execution** (NOT parallel) maintains precision
- **2% precision target** (only touch specified files)
- Use **GPT-5 Mini** for tasks <200K context (faster, 69-70% vs 54.6% SWE-bench)
