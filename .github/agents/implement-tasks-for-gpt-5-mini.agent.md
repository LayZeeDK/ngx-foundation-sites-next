---
description: Execute GPT-5 Mini-suitable tasks with CTCO framework optimizations. Zero-cost implementation for mechanical, pattern-based tasks.
---

## Model Selection

**Preferred Model**: GPT-5 Mini (`gpt-5-mini`)
**Invoke with**: `gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini`

**Optimization Strategy**: CTCO framework, mechanical procedures, explicit formats, minimal reasoning
**Expected Performance**: 2-3× faster than Sonnet, zero cost (0×)

---

## Model Configuration

**Model**: GPT-5 Mini
**Context**: 200K tokens
**Reasoning**: Minimal (pattern matching, no deep reasoning)
**Cost**: 0× (free in GitHub Copilot)
**Optimization**: CTCO framework, mechanical procedures, validation checklists

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## GPT-5 Mini Optimization Strategy

<optimization_context>

This agent is optimized for GPT-5 Mini using 2026 best practices:

1. **CTCO Framework**: Every task structured as Context → Task → Constraints → Output
2. **Mechanical Procedures**: No "intelligently" or "determine"—only explicit FOR EACH loops
3. **Verbosity Controls**: Output only required information, no explanatory prose
4. **Explicit Formats**: Exact templates, word limits, validation criteria
5. **Validation Checklists**: Self-correction before proceeding
6. **Error Conditions**: Explicit IF-THEN with STOP/EXIT
7. **Pattern-Based Execution**: Copy existing code, don't invent

**GPT-5 Mini Can Do**:

- ✅ Find-replace operations
- ✅ Copy method patterns
- ✅ Follow exact templates
- ✅ Mechanical transformations
- ✅ Simple conditional checks

**GPT-5 Mini Cannot Do**:

- ❌ Architectural decisions
- ❌ Creative problem-solving
- ❌ Implicit dependency resolution
- ❌ Multi-file coordination requiring reasoning

</optimization_context>

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

1. **gpt5mini-suitable-tasks.md** (REQUIRED):
   - Task list filtered for GPT-5 Mini
   - CTCO templates for each task
   - Suitability scores

2. **gpt5mini-implementation-context.md** (REQUIRED):
   - Code patterns (exact templates)
   - File paths (complete list)
   - Success criteria (verification checklist)

3. **spec.md** (OPTIONAL):
   - Load ONLY if context file explicitly references it

4. **plan.md** (OPTIONAL):
   - Load ONLY if needed for file structure navigation

**Error Condition**:

```
IF gpt5mini-suitable-tasks.md NOT FOUND:
  STOP execution
  OUTPUT: "❌ Error: gpt5mini-suitable-tasks.md not found\n\nRun: gh copilot -m \"claude-sonnet-4.5\" slash tasks-for-gpt-5-mini\n\nThis will identify tasks suitable for GPT-5 Mini."
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
  OUTPUT: "⚠️ Warning: Found [low_count] LOW suitability tasks\n\nThese tasks require reasoning (not suitable for GPT-5 Mini):\n[list task IDs]\n\nRemove these tasks or use Sonnet 4.5 instead."
  WAIT for user to confirm removal or cancel
```

---

### Step 2: Create Execution Plan

**CTCO for Planning**:

**Context**: You have verified HIGH/MEDIUM tasks only
**Task**: Calculate estimated time and generate execution order
**Constraints**: Use provided time estimates, order by dependencies
**Output**: Execution plan with time breakdown and order

#### Calculate Estimates

```
total_time = 0
pattern_counts = {}

FOR EACH task in gpt5mini-suitable-tasks.md:
  total_time += task.estimated_time
  pattern = extract_pattern(task.description)
  pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
```

#### Generate Execution Order

```
execution_order = []

FOR EACH phase in gpt5mini-suitable-tasks.md:
  FOR EACH task in phase.tasks:
    IF task.marker == "[P]":
      task.can_parallel = true
    ELSE:
      task.can_parallel = false
    execution_order.append(task)
```

**Output Plan**:

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

**CTCO Template** (from gpt5mini-implementation-context.md):

**Context**: Files [file_list] need renaming from [old_string] to [new_string]
**Task**: Execute find-replace with exact string matching
**Constraints**:

- Preserve case sensitivity
- Only exact matches (not partial strings)
- Update imports/exports if needed
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
    OUTPUT: "⚠️ Warning: No occurrences of '[old_string]' found in [file]"
    CONTINUE to next file

  Edit(
    file_path: file,
    old_string: old_string,
    new_string: new_string,
    replace_all: true
  )

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

**If verification fails**:

```
STOP execution
OUTPUT: "❌ TypeScript compilation failed after find-replace\n\nFile: [file]\nError: [error_message]\n\nRevert changes and investigate."
EXIT
```

---

#### Pattern B: Add Method with Template

**CTCO Template** (from gpt5mini-implementation-context.md):

**Context**: File [file] has method [existing_method] at line [line] as pattern
**Task**: Create method [new_method] following same pattern
**Constraints**:

- Same signature structure (params, return type)
- Same JSDoc format
- Similar implementation (adapt behavior)
- Insert at line [target_line]
  **Output**: File with new method added

**Mechanical Procedure**:

```
file = extract_file(task.description)
existing_method = extract_existing_method(task.description)
new_method = extract_new_method(task.description)
target_line = extract_target_line(task.description)

# Step 1: Load file
Read(file)

# Step 2: Find existing method (exact line reference)
existing_method_start = find_line(file_content, target_line - 10)
existing_method_code = extract_method_at_line(file_content, existing_method, target_line - 10)

# Step 3: Copy pattern
new_method_code = existing_method_code
# Replace method name
new_method_code = replace(new_method_code, existing_method, new_method)
# Adapt behavior (as specified in task)
behavior_change = extract_behavior_change(task.description)
new_method_code = apply_behavior_change(new_method_code, behavior_change)

# Step 4: Find insertion point
insertion_context = extract_context_around_line(file_content, target_line)

# Step 5: Insert using Edit
Edit(
  file_path: file,
  old_string: insertion_context,
  new_string: insertion_context + "\n\n" + new_method_code
)

OUTPUT: "✅ Added [new_method]() at line [target_line]"
```

**Verification Checklist**:

```
□ Method added with correct name?
□ JSDoc comment follows pattern?
□ Method signature matches existing pattern?
□ TypeScript compilation succeeds?
□ Method exported if needed?
```

**Verification Command**:

```bash
npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json
```

---

#### Pattern C: Add Test

**CTCO Template** (from gpt5mini-implementation-context.md):

**Context**: Test file [file] has existing test pattern
**Task**: Add test for [functionality] following pattern
**Constraints**:

- Follow existing play function structure
- Use userEvent for interactions
- Use expect() for assertions
- Test must pass
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
new_test_code = existing_test_code
# Replace test name
new_test_name = generate_test_name(functionality)
new_test_code = replace(new_test_code, existing_test, new_test_name)
# Replace test actions (from task description)
test_actions = extract_test_actions(task.description)
new_test_code = replace_test_actions(new_test_code, test_actions)

# Step 4: Find insertion point (after existing test)
insertion_point = find_test_insertion_point(file_content, existing_test)

# Step 5: Insert using Edit
Edit(
  file_path: test_file,
  old_string: insertion_point,
  new_string: insertion_point + "\n\n" + new_test_code
)

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

**CTCO Template** (from gpt5mini-implementation-context.md):

**Context**: Documentation file [file] needs update in section [section]
**Task**: Add content [content] following format
**Constraints**:

- Follow existing markdown structure
- Use same heading levels
- Include code examples with correct syntax
- Update table of contents if exists
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
existing_format = extract_format(file_content, section)
formatted_content = apply_format(content, existing_format)

# Step 5: Insert using Edit
Edit(
  file_path: doc_file,
  old_string: insertion_point,
  new_string: insertion_point + "\n\n" + formatted_content
)

OUTPUT: "✅ Updated [section] in [doc_file]"
```

**Verification Checklist**:

```
□ Content added to correct section?
□ Markdown formatting correct?
□ Code examples have syntax highlighting?
□ Table of contents updated (if exists)?
□ Links are valid?
```

**Verification Command**:

```bash
# Check markdown formatting
npx markdownlint [doc_file]
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
verification_results = {
  "typescript": false,
  "tests": false,
  "lint": false,
  "build": false
}

FOR EACH verification_step:
  result = run_command(verification_step)
  verification_results[step_name] = result.success

  IF NOT result.success:
    STOP execution
    OUTPUT: "❌ Verification failed: [step_name]\n\nError: [result.error]\n\nReview changes and fix issues."
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

```
completed_tasks = count_completed_tasks()
total_time = calculate_total_time()
patterns_used = count_patterns_used()

OUTPUT: """
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
"""
```

---

## Error Handling

### Error Condition 1: Ambiguous Task Description

```
IF task.description does NOT contain explicit file path:
  STOP execution
  OUTPUT: "❌ Error: Task [task_id] has ambiguous description\n\nDescription: [task.description]\n\nMissing: Explicit file path\n\nFix: Update gpt5mini-suitable-tasks.md with exact file path"
  EXIT
```

### Error Condition 2: Pattern Template Not Found

```
IF task.pattern NOT IN gpt5mini-implementation-context.md:
  STOP execution
  OUTPUT: "❌ Error: Pattern template '[task.pattern]' not found\n\nTask: [task_id]\nPattern: [task.pattern]\n\nFix: Add pattern template to gpt5mini-implementation-context.md"
  EXIT
```

### Error Condition 3: Verification Failure

```
IF verification_command fails:
  STOP execution
  OUTPUT: "❌ Verification failed: [command]\n\nTask: [task_id]\nError: [error_message]\n\nAction: Revert changes and investigate\n\nCommand to revert: git checkout [files]"
  EXIT
```

### Error Condition 4: File Not Found

```
IF file_to_edit NOT FOUND:
  STOP execution
  OUTPUT: "❌ Error: File not found: [file_path]\n\nTask: [task_id]\n\nCheck: File path is correct in gpt5mini-suitable-tasks.md"
  EXIT
```

---

## Optimization Notes

### GPT-5 Mini-Specific Optimizations Applied

1. **CTCO Framework** ✅
   - Every task structured as Context → Task → Constraints → Output
   - No ambiguous instructions

2. **Mechanical Procedures** ✅
   - All logic is FOR EACH loops or IF-THEN conditions
   - No "intelligently" or "determine" instructions

3. **Verbosity Controls** ✅
   - Output only required information (no prose)
   - Status updates are concise

4. **Explicit Formats** ✅
   - Exact templates provided in context file
   - All patterns have step-by-step instructions

5. **Validation Checklists** ✅
   - Every pattern has verification checklist
   - Self-correction before proceeding

6. **Error Conditions** ✅
   - All errors have explicit IF-THEN with STOP/EXIT
   - Clear error messages with actions

7. **Pattern-Based Execution** ✅
   - No creative decisions
   - Copy existing code patterns exactly

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
✅ Execution time within estimates
✅ Zero cost (GPT-5 Mini)

---

## Related Commands

- `/tasks-for-gpt-5-mini` - Identify GPT-5 Mini-suitable tasks (run before this command)
- `/speckit.implement` - Standard implementation (alternative for complex tasks)
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
