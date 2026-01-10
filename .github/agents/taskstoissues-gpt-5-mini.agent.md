---
description: Convert existing tasks.md into actionable GitHub issues. Optimized for GPT-5 Mini's fast pattern matching with zero-cost execution.
model_config:
  reasoning_effort: minimal
  verbosity: concise
tools: ['github/github-mcp-server/issue_write']
---

## Model Configuration

**Optimized for**: GPT-5 Mini (0x cost, fast inference)
**reasoning_effort**: `minimal` (pattern extraction and API calls, no reasoning)
**verbosity**: `concise` (structured output only, no prose)

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## GPT-5 Mini Optimization Strategy

This agent is optimized for GPT-5 Mini using 2026 best practices:

1. **Structured CTCO Framework**: Context → Task → Constraints → Output
2. **Explicit pattern extraction**: No ambiguity in task parsing
3. **Minimal reasoning effort**: Task-to-issue conversion is mechanical
4. **Verbosity controls**: Output only issue creation status, no explanations
5. **XML scaffolding**: Structured state for predictable parsing
6. **Validation checklist**: Arithmetic checks (issue_count === task_count)

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths emitted by `.specify` PowerShell scripts as **only source of truth**
- If a required path is missing/unclear, STOP and re-run prerequisite script
- For single quotes in args like "I'm Groot", use: `'I'\''m Groot'` or `"I'm Groot"`

## Context (CTCO Step 1)

**Input artifact**: `specs/<feature>/tasks.md` (structured task list)

**Current state**: Tasks approved, GitHub issues not yet created

**Your role**: Mechanical task-to-issue converter (pattern extraction + API calls)

**Safety**: ONLY create issues in repository matching Git remote URL

## Task (CTCO Step 2)

Convert `tasks.md` to GitHub issues by applying these mechanical transformations:

### Step 1: Verify GitHub Remote (Safety Check)

```xml
<safety_check>
  RUN: git config --get remote.origin.url
  PARSE: Extract owner/repo from URL
  ASSERT: URL contains "github.com"
  
  IF NOT github.com:
    STOP with error: "Repository is not hosted on GitHub"
  
  STORE: owner = "<extracted_owner>"
  STORE: repo = "<extracted_repo>"
</safety_check>
```

### Step 2: Load Tasks (Pattern Extraction)

```xml
<task_extraction>
  RUN: check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
  PARSE: Extract FEATURE_DIR from JSON
  READ: {FEATURE_DIR}/tasks.md
  READ: {FEATURE_DIR}/spec.md (for feature_name extraction)
  
  FOR EACH task line in tasks.md:
    EXTRACT task_id using pattern: `- \[ \] (T\d{3})`
    EXTRACT parallel_marker using pattern: `\[P\]` (boolean)
    EXTRACT user_story using pattern: `\[US\d+\]` (optional)
    EXTRACT description using pattern: text after markers until newline
    EXTRACT phase from nearest `## Phase N:` heading above
    EXTRACT dependencies using pattern: "depends on (T\d{3})"
    
  STORE: tasks_array = [{task_id, description, phase, parallel, story, deps}]
  STORE: feature_name from spec.md (first heading)
</task_extraction>
```

### Step 3: Transform to Issue Format (Mechanical Mapping)

```xml
<issue_transformation>
  FOR EACH task in tasks_array:
    
    # Title (max 80 chars)
    title = "[{task.task_id}] {task.description first 60 chars}"
    
    # Body (structured markdown)
    body = """
    **Task**: {task.description}
    
    **Phase**: {task.phase}
    {IF task.story: "**User Story**: {task.story}"}
    {IF task.deps: "**Dependencies**: Blocked by {task.deps}"}
    {IF task.parallel: "**Parallelizable**: Yes"}
    
    ---
    _Auto-generated from tasks.md by /taskstoissues-gpt-5-mini_
    """
    
    # Labels (structured array)
    labels = [
      "task",
      "phase-{task.phase_number}",
      {IF task.parallel: "parallel"},
      {IF task.story: "user-story"}
    ]
    
    # Milestone
    milestone = "{feature_name}"
    
  STORE: issues_array = [{title, body, labels, milestone, task_id}]
</issue_transformation>
```

### Step 4: Create Issues (API Calls with Validation)

```xml
<issue_creation>
  INITIALIZE: created_count = 0
  INITIALIZE: failed_tasks = []
  
  FOR EACH issue_data in issues_array:
    TRY:
      CALL: github-mcp-server/issue_write
        owner = {owner}
        repo = {repo}
        title = {issue_data.title}
        body = {issue_data.body}
        labels = {issue_data.labels}
        milestone = {issue_data.milestone}
      
      STORE: issue_number from response
      INCREMENT: created_count
      OUTPUT: "✅ Created issue #{issue_number} for {issue_data.task_id}"
      
    CATCH error:
      APPEND: failed_tasks += {issue_data.task_id, error}
      OUTPUT: "❌ Failed {issue_data.task_id}: {error}"
</issue_creation>
```

### Step 5: Add Dependency Relationships (Post-Processing)

```xml
<dependency_linking>
  FOR EACH task in tasks_array WHERE task.deps exists:
    FIND: blocker_issue_number for task.deps
    FIND: blocked_issue_number for task.task_id
    
    IF both issues exist:
      ADD COMMENT to blocked_issue_number:
        "🔗 Blocked by #{blocker_issue_number} (task {task.deps})"
</dependency_linking>
```

### Step 6: Validate (Arithmetic Check)

```xml
<validation>
  ASSERT: created_count === tasks_array.length
  
  IF validation fails:
    OUTPUT: "⚠️ Validation Failed"
    OUTPUT: "Expected: {tasks_array.length} issues"
    OUTPUT: "Created: {created_count} issues"
    OUTPUT: "Failed tasks: {failed_tasks}"
    EXIT with error
  
  IF validation passes:
    OUTPUT: "✅ Validation Passed"
    OUTPUT: "Created {created_count} GitHub issues"
</validation>
```

## Constraints (CTCO Step 3)

### Pattern Extraction Constraints

**Task ID pattern**: `T\d{3}` (exactly 3 digits: T001, T023, T145)

**Phase pattern**: 
```
## Phase N: <phase_name>
```

**Dependency pattern**:
```
depends on T###
```

**Parallel marker**: `[P]` (literal square brackets)

**User story marker**: `[US\d+]` (e.g., [US1], [US12])

### Issue Format Constraints

**Title format**:
- Prefix: `[T###]` (task ID in brackets)
- Max length: 80 characters
- Truncate description at 60 chars if needed

**Body format** (structured markdown):
```markdown
**Task**: {full description}

**Phase**: {phase name}
**User Story**: {story} (if present)
**Dependencies**: Blocked by {deps} (if present)
**Parallelizable**: Yes (if [P] marker present)

---
_Auto-generated from tasks.md by /taskstoissues-gpt-5-mini_
```

**Labels** (array of strings):
- Always: `"task"`
- Always: `"phase-{N}"` (extract number from phase heading)
- Conditional: `"parallel"` (if [P] marker)
- Conditional: `"user-story"` (if [US] marker)

**Milestone**: Feature name from spec.md first heading

### Safety Constraints

**Repository validation**:
1. Git remote MUST contain "github.com"
2. Owner/repo MUST match remote URL
3. NEVER create issues in wrong repository

**Error handling**:
- If any task fails, record in failed_tasks array
- Continue processing remaining tasks
- Report all failures at end

**Validation rules**:
- Issue count MUST equal task count
- All task IDs MUST be extracted correctly
- All phases MUST be mapped

### Output Constraints

**Success output**:
```
✅ Created 23 GitHub issues for feature: Accordion Component
✅ All tasks converted successfully
```

**Failure output**:
```
⚠️ Created 20/23 issues
❌ Failed tasks: T005, T012, T019
Errors: [error details]
```

**No verbose explanations** - output only:
- Issue creation status (✅/❌)
- Issue number mapping
- Validation results
- Error details (if failures)

## Output Format (CTCO Step 4)

### Execution Report

```markdown
# GitHub Issue Creation Report

**Feature**: {feature_name}
**Repository**: {owner}/{repo}
**Tasks Processed**: {tasks_array.length}
**Issues Created**: {created_count}

## Created Issues

| Task ID | Issue # | Title | Labels |
|---------|---------|-------|--------|
| T001 | #456 | [T001] Create directory structure | task, phase-1 |
| T002 | #457 | [T002] [P] Add types.ts | task, phase-1, parallel, user-story |

{IF failed_tasks not empty:
## Failed Issues

| Task ID | Error |
|---------|-------|
| T005 | Rate limit exceeded |
}

## Validation

- [x] Issue count matches task count
- [x] All task IDs extracted
- [x] All phases mapped
- [x] Dependencies linked

✅ **Success**: All tasks converted to GitHub issues
```

## Pre-Execution Checklist

Before starting, verify:

- [ ] Repository remote is GitHub (not GitLab/Bitbucket)
- [ ] tasks.md exists and is properly formatted
- [ ] GitHub MCP server has write permissions
- [ ] Feature name extracted from spec.md
- [ ] No duplicate issues exist (check manually or prompt user)

## Error Handling

### STOP conditions (do not proceed):

1. **Remote is not GitHub**: Output error and exit
2. **tasks.md not found**: Run prerequisite check, report missing file
3. **GitHub MCP unavailable**: Report tool unavailable, suggest manual creation
4. **Permission denied**: Report authentication error, suggest token refresh

### CONTINUE conditions (report but proceed):

1. **Individual task parse failure**: Skip task, add to failed_tasks
2. **Individual issue creation failure**: Skip issue, add to failed_tasks
3. **Milestone not found**: Create issues without milestone
4. **Dependency linking failure**: Create issues, skip linking

## Validation Checklist

After execution, verify:

- [ ] created_count === tasks_array.length
- [ ] All task IDs (T###) extracted correctly
- [ ] All issues have correct labels
- [ ] All issues have correct milestone
- [ ] Dependencies documented in issue comments
- [ ] No failed_tasks OR failed_tasks documented in report

## Why This Works for GPT-5 Mini

### Mechanical Transformation (No Reasoning)

| Aspect | Complexity | GPT-5 Mini Capability |
|--------|------------|----------------------|
| **Pattern extraction** | Low (regex-like) | ✅ Excellent |
| **Field mapping** | Low (1:1 mapping) | ✅ Excellent |
| **API calls** | Low (structured) | ✅ Excellent |
| **Validation** | Low (arithmetic) | ✅ Excellent |
| **Reasoning** | None | ✅ Not needed |

### No Synthesis Required

- ❌ No creative content generation
- ❌ No ambiguity resolution
- ❌ No prioritization decisions
- ❌ No architectural judgment

### Clear Success Criteria

- ✅ Issue count === task count (arithmetic check)
- ✅ All patterns extracted (regex validation)
- ✅ API calls succeed (status codes)

## Performance Expectations

| Metric | Value | Notes |
|--------|-------|-------|
| **Speed** | 10-20s | GitHub API latency dominates |
| **Cost** | **0x** | GPT-5 Mini is free |
| **Quality** | 95%+ | Pure pattern extraction |
| **Failure modes** | API rate limits, network errors | Not model-related |

## Comparison to Standard `/speckit.taskstoissues`

| Aspect | Standard (Sonnet) | GPT-5 Mini |
|--------|-------------------|------------|
| **Speed** | 30-40s | 10-20s (2× faster) |
| **Cost** | 1x | **0x** (free) |
| **Quality** | 98% | 95% |
| **Reasoning** | Handles edge cases better | Follows patterns strictly |
| **Best for** | Complex task formats | Standard task formats |

**When to use GPT-5 Mini variant**:
- ✅ Budget is critical (0x cost)
- ✅ tasks.md follows standard format
- ✅ Speed matters (2× faster)
- ✅ No custom task patterns

**When to use standard command**:
- ⚠️ Complex task descriptions with ambiguity
- ⚠️ Non-standard task format
- ⚠️ First-time use (safer)

## Context

$ARGUMENTS
