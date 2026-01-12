---
description: Execute GPT-5 Mini-suitable tasks with CTCO framework optimizations. Zero-cost implementation for mechanical, pattern-based tasks.
agent: implement-tasks-for-gpt-5-mini.gpt-5-mini
model: gpt-5-mini
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

Execute GPT-5 Mini-suitable tasks from gpt5mini-suitable-tasks.md using CTCO framework optimizations.

**Focus**: Zero-cost execution of mechanical, pattern-based tasks
**Strategy**: CTCO framework, mechanical procedures, systematic verification

---

## Execution Steps

### Step 0: Initialize & Load Context

**CTCO for Initialization**:

**Context**: You have a feature directory with task files
**Task**: Load GPT-5 Mini-suitable tasks and implementation context
**Constraints**: Only load files that exist, stop if required files missing
**Output**: Confirm files loaded and ready for execution

#### Run Prerequisite Check

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON output for:**

- `FEATURE_DIR`: Absolute path to feature directory

**Load required files**:

1. **gpt5mini-suitable-tasks.md** (REQUIRED): Task list filtered for GPT-5 Mini, CTCO templates, suitability scores
2. **gpt5mini-implementation-context.md** (REQUIRED): Code patterns (exact templates), file paths, success criteria
3. **spec.md** (OPTIONAL): Load ONLY if context file explicitly references it
4. **plan.md** (OPTIONAL): Load ONLY if needed for file structure navigation

**Error Condition**:

```
IF gpt5mini-suitable-tasks.md NOT FOUND:
  STOP execution
  OUTPUT: "❌ Error: gpt5mini-suitable-tasks.md not found\n\nRun: copilot -m \"claude-sonnet-4.5\" slash tasks-for-gpt-5-mini"
  EXIT
```

---

### Step 1: Verify Task Scope

**CTCO for Verification**:

**Context**: You have loaded gpt5mini-suitable-tasks.md with suitability scores
**Task**: Count HIGH vs MEDIUM vs LOW tasks, warn if LOW tasks present
**Constraints**: Only proceed with HIGH (≥75%) and MEDIUM (50-74%) tasks
**Output**: Task count summary and proceed/stop decision

#### Count Tasks by Suitability

```
task_count = 0
high_count = 0
medium_count = 0
low_count = 0

FOR EACH task in gpt5mini-suitable-tasks.md:
  task_count += 1
  IF task.suitability >= 75:
    high_count += 1
  ELSE IF task.suitability >= 50:
    medium_count += 1
  ELSE:
    low_count += 1
```

**Output Summary**:

```markdown
## Task Scope Verification

- **Total tasks**: [task_count]
- **HIGH suitability** (≥75%): [high_count]
- **MEDIUM suitability** (50-74%): [medium_count]
- **LOW suitability** (<50%): [low_count]
```

**Error Condition**:

```
IF low_count > 0:
  STOP execution
  OUTPUT: "⚠️ Warning: Found [low_count] LOW suitability tasks\n\nThese tasks require reasoning (not suitable for GPT-5 Mini)"
  WAIT for user to confirm removal or cancel
```

---

### Step 2: Create Execution Plan

**CTCO for Planning**:

**Context**: You have verified HIGH/MEDIUM tasks only
**Task**: Calculate estimated time and generate execution order
**Constraints**: Use provided time estimates, order by dependencies
**Output**: Execution plan with time breakdown and order

#### Generate Plan

```markdown
## Execution Plan

**HIGH Suitability Tasks**: [high_count] tasks

- Estimated time: [high_time] minutes
- Pattern distribution: [pattern_counts for HIGH]

**MEDIUM Suitability Tasks**: [medium_count] tasks

- Estimated time: [medium_time] minutes
- Pattern distribution: [pattern_counts for MEDIUM]

**Total Estimated Time**: [total_time] minutes
**Cost**: $0 (free with GPT-5 Mini)

**Execution Order**:

1. Verify test environment
2. Execute HIGH tasks (parallel where [P] marker present)
3. Execute MEDIUM tasks (if any)
4. Verify all changes
5. Report completion
```

---

### Step 3: Execute Tasks (CTCO Pattern-Based)

**General Execution Rule**:

```
FOR EACH task in execution_order:
  LOAD ctco_template from gpt5mini-implementation-context.md
  APPLY pattern-specific execution steps
  VERIFY success criteria
  IF verification fails:
    STOP execution
    OUTPUT error details
    EXIT
  ELSE:
    MARK task complete
    CONTINUE to next task
```

---

#### Pattern A: Find-Replace Operation

**CTCO Template**:

**Context**: Files [file_list] need renaming from [old_string] to [new_string]
**Task**: Execute find-replace with exact string matching
**Constraints**: Preserve case sensitivity, only exact matches, update imports/exports if needed
**Output**: Updated files with all occurrences replaced

**Mechanical Procedure**:

```
file_list = extract_files(task.description)
old_string = extract_old_string(task.description)
new_string = extract_new_string(task.description)

FOR EACH file in file_list:
  Read(file)
  occurrence_count = count_exact_matches(file_content, old_string)

  IF occurrence_count == 0:
    OUTPUT: "⚠️ Warning: No occurrences found in [file]"
    CONTINUE to next file

  Edit(file_path: file, old_string: old_string, new_string: new_string, replace_all: true)
  OUTPUT: "✅ Replaced [occurrence_count] occurrences in [file]"
```

**Verification Checklist**:

```
□ All files in file_list processed?
□ All exact matches replaced?
□ Case sensitivity preserved?
□ No partial matches replaced?
□ TypeScript compilation succeeds?
```

**Verification Command**:

```bash
npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json
```

---

#### Pattern B: Add Method with Template

**CTCO Template**:

**Context**: File [file] has method [existing_method] at line [line] as pattern
**Task**: Create method [new_method] following same pattern
**Constraints**: Same signature structure, same JSDoc format, similar implementation
**Output**: File with new method added

**Mechanical Procedure**:

```
file = extract_file(task.description)
existing_method = extract_existing_method(task.description)
new_method = extract_new_method(task.description)

# Step 1: Load file
Read(file)

# Step 2: Find existing method pattern
existing_method_code = extract_method_by_name(file_content, existing_method)

# Step 3: Copy pattern, replace method name
new_method_code = copy_and_adapt(existing_method_code, new_method)

# Step 4: Find insertion point
insertion_context = find_insertion_point(file_content)

# Step 5: Insert using Edit
Edit(file_path: file, old_string: insertion_context, new_string: insertion_context + "\n\n" + new_method_code)

OUTPUT: "✅ Added [new_method]()"
```

**Verification Checklist**:

```
□ Method added with correct name?
□ JSDoc comment follows pattern?
□ Method signature matches existing pattern?
□ TypeScript compilation succeeds?
□ Method exported if needed?
```

---

#### Pattern C: Add Test

**CTCO Template**:

**Context**: Test file [file] has existing test pattern
**Task**: Add test for [functionality] following pattern
**Constraints**: Follow existing play function structure, use userEvent, use expect()
**Output**: Updated test file with new test case

**Mechanical Procedure**:

```
test_file = extract_test_file(task.description)
functionality = extract_functionality(task.description)
existing_test = extract_existing_test_name(task.description)

# Step 1: Load test file
Read(test_file)

# Step 2: Find existing test pattern
existing_test_code = extract_test_by_name(file_content, existing_test)

# Step 3: Copy test structure
new_test_code = copy_and_adapt(existing_test_code, functionality)

# Step 4: Find insertion point
insertion_point = find_test_insertion_point(file_content, existing_test)

# Step 5: Insert using Edit
Edit(file_path: test_file, old_string: insertion_point, new_string: insertion_point + "\n\n" + new_test_code)

OUTPUT: "✅ Added test: [new_test_name]"
```

**Verification Checklist**:

```
□ Test added with correct name?
□ Test uses userEvent for interactions?
□ Test uses expect() for assertions?
□ Test follows existing pattern?
□ Test passes?
```

**Verification Command**:

```bash
npx nx test-storybook ngx-foundation-sites
```

---

#### Pattern D: Update Documentation

**CTCO Template**:

**Context**: Documentation file [file] needs update in section [section]
**Task**: Add content [content] following format
**Constraints**: Follow existing markdown structure, use same heading levels
**Output**: Updated documentation file

**Mechanical Procedure**:

```
doc_file = extract_doc_file(task.description)
section = extract_section(task.description)
content = extract_content(task.description)

# Step 1: Load documentation file
Read(doc_file)

# Step 2: Find section
section_line = find_heading(file_content, section)

# Step 3: Determine insertion point
insertion_point = find_section_end(file_content, section_line)

# Step 4: Format content (preserve existing format)
formatted_content = apply_format(content, existing_format)

# Step 5: Insert using Edit
Edit(file_path: doc_file, old_string: insertion_point, new_string: insertion_point + "\n\n" + formatted_content)

OUTPUT: "✅ Updated [section] in [doc_file]"
```

**Verification Checklist**:

```
□ Content added to correct section?
□ Markdown formatting correct?
□ Code examples have syntax highlighting?
□ Table of contents updated (if exists)?
```

---

### Step 4: Verification After All Tasks

**CTCO for Final Verification**:

**Context**: All tasks completed, need to verify system integrity
**Task**: Run full test suite and build verification
**Constraints**: All must pass (no failures allowed)
**Output**: Verification status and any failures

#### Verification Commands

```bash
# Step 1: TypeScript compilation
npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json

# Step 2: Run tests
npm run test

# Step 3: Run linting
npm run lint

# Step 4: Build library
npm run build
```

**Verification Tracking**:

```
FOR EACH verification_step:
  result = run_command(verification_step)
  IF NOT result.success:
    STOP execution
    OUTPUT: "❌ Verification failed: [step_name]\n\nError: [result.error]"
    EXIT
```

**Success Output**:

```markdown
## Verification Complete ✅

- ✅ TypeScript compilation: PASS
- ✅ Tests: PASS ([X] tests)
- ✅ Linting: PASS
- ✅ Build: PASS

All tasks implemented successfully with zero failures.
```

---

### Step 5: Report Completion

**CTCO for Completion Report**:

**Context**: All tasks executed and verified
**Task**: Generate completion summary with metrics
**Constraints**: Include time, cost, quality metrics
**Output**: Final summary report

#### Generate Summary

```markdown
## Implementation Complete ✅

**Tasks Executed**: [completed_tasks]
**Actual Time**: [total_time] minutes
**Cost**: $0 (GPT-5 Mini)
**Quality**: 100% (all verifications passed)

**Pattern Distribution**:

- Find-Replace: [count]
- Add Method: [count]
- Add Test: [count]
- Update Docs: [count]

**Verification Results**:

- ✅ TypeScript compilation
- ✅ All tests passing
- ✅ Linting clean
- ✅ Build successful

**Next Steps**:

1. Review changes manually (optional)
2. Create git commit
3. Run full CI pipeline
```

---

## Error Handling

### Error Condition 1: Ambiguous Task Description

```
IF task.description does NOT contain explicit file path:
  STOP execution
  OUTPUT: "❌ Error: Task [task_id] has ambiguous description\n\nMissing: Explicit file path"
  EXIT
```

### Error Condition 2: Pattern Template Not Found

```
IF task.pattern NOT IN gpt5mini-implementation-context.md:
  STOP execution
  OUTPUT: "❌ Error: Pattern template '[task.pattern]' not found"
  EXIT
```

### Error Condition 3: Verification Failure

```
IF verification_command fails:
  STOP execution
  OUTPUT: "❌ Verification failed: [command]\n\nAction: Revert changes and investigate"
  EXIT
```

---

## Success Criteria

Implementation is successful when:

✅ All HIGH suitability tasks completed
✅ All MEDIUM suitability tasks completed (if any)
✅ TypeScript compilation succeeds
✅ All tests passing
✅ Linting clean
✅ Build successful
✅ No LOW suitability tasks attempted
✅ All changes verified
✅ Zero cost (GPT-5 Mini)

---

## Related Commands

- `/tasks-for-gpt-5-mini` - Identify GPT-5 Mini-suitable tasks (run before this command)
- `/implement-tasks-for-haiku-4-5` - Alternative: Haiku 4.5 implementation (0.33× cost)

---

## Notes

- This command uses **GPT-5 Mini** for zero-cost execution
- All tasks must be **HIGH (≥75%) or MEDIUM (50-74%)** suitability
- **Pattern-based execution** ensures reliability (no creative decisions)
- **CTCO framework** provides structure for minimal reasoning model
- **Mechanical procedures** prevent hallucinations
- **Explicit verification** catches errors immediately
- Focus on **speed and cost** (2-3× faster, $0 cost)
