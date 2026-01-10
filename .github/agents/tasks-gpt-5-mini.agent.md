---
description: Generate actionable, dependency-ordered tasks.md from plan.md. Optimized for GPT-5 Mini's fast inference with structured prompts and minimal reasoning effort.
model_config:
  reasoning_effort: minimal
  verbosity: concise
---

## Model Configuration

**Optimized for**: GPT-5 Mini (0x cost, fast inference)
**reasoning_effort**: `minimal` (pattern-based task generation, no deep reasoning)
**verbosity**: `concise` (structured output only, no prose)

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## GPT-5 Mini Optimization Strategy

This agent is optimized for GPT-5 Mini using 2026 best practices:

1. **Structured CTCO Framework**: Context → Task → Constraints → Output
2. **Explicit format specifications**: No ambiguity in output format
3. **Minimal reasoning effort**: Task generation is mechanical pattern-based work
4. **Verbosity controls**: Output only required task list, no explanations
5. **XML scaffolding**: Structured state for predictable parsing

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths emitted by `.specify` PowerShell scripts as **only source of truth**
- If a required path is missing/unclear, STOP and re-run prerequisite script
- For single quotes in args like "I'm Groot", use: `'I'\''m Groot'` or `"I'm Groot"`

## Context (CTCO Step 1)

**Input artifacts**:
- `specs/<feature>/spec.md` (requirements, user stories, success criteria)
- `specs/<feature>/plan.md` (phases, architecture, implementation notes)
- `specs/<feature>/data-model.md` (if exists)
- `specs/<feature>/contracts/*.ts` (if exists)

**Current state**: Plan approved, tasks not yet generated

**Your role**: Mechanical task generator (pattern-based, no creative decisions)

## Task (CTCO Step 2)

Generate `tasks.md` by applying these mechanical transformations:

### Transformation 1: Extract Phases from plan.md

```
FOR EACH "## Phase N:" heading in plan.md:
  CREATE task group header in tasks.md
  COPY phase purpose/goal verbatim
```

### Transformation 2: Convert Implementation Steps to Tasks

```
FOR EACH bullet point in plan.md implementation section:
  IF bullet describes concrete action (has verb + object):
    GENERATE task with format: "[ID] [P?] [Story] Description"
    EXTRACT file path from bullet (if present)
    DETECT parallelizability (different files = can parallel)
```

### Transformation 3: Add User Story Mappings

```
FOR EACH task:
  IF task relates to user story requirement:
    ADD [USN] label (e.g., [US1], [US2])
```

### Transformation 4: Mark Parallel Tasks

```
FOR EACH task:
  IF task operates on different files than dependencies:
    ADD [P] marker
```

### Transformation 5: Order by Dependencies

```
ORDER tasks within each phase:
  1. Infrastructure (tokens, types, base components)
  2. Components (parent before child)
  3. Integration (after components exist)
  4. Tests (after implementation)
  5. Documentation (last)
```

## Constraints (CTCO Step 3)

### Output Format Constraints

**Task ID format**: `T###` (3-digit zero-padded: T001, T023, T145)

**Task line format**:
```
- [ ] T### [P?] [Story?] Description with file path
```

**Examples**:
```
- [ ] T001 Create directory at packages/lib/feature/
- [ ] T002 [P] [US1] Add types.ts with FeatureState interface
- [ ] T023 [US2] Implement handleClick in component.ts
```

### File Path Constraints

**MUST include exact file paths** in task descriptions:
- ✅ `Create component at packages/lib/feature/feature.component.ts`
- ❌ `Create component` (too vague)

**Path format**:
- Relative to repo root
- Use forward slashes
- Include file extension

### Dependency Constraints

**Task ordering rules**:
1. Parent components BEFORE child components
2. Tokens/types BEFORE components that use them
3. Components BEFORE integration
4. Implementation BEFORE tests
5. Tests BEFORE documentation

**Blocking tasks**: Mark with "⚠️ **CRITICAL**: No user story work can begin until this phase is complete"

### Parallelization Constraints

**Mark [P] when**:
- Different files
- No shared state
- No sequential dependency

**Do NOT mark [P] when**:
- Same file edits
- Parent → child relationship
- State depends on previous task

## Output (CTCO Step 4)

### Output Structure (XML Scaffolding)

```xml
<tasks_output>
  <format>markdown</format>
  <file_path>specs/<feature>/tasks.md</file_path>

  <content>
# Tasks: <Feature Name>

**Input**: Design documents from `/specs/<feature>/`
**Prerequisites**: plan.md ✓, spec.md ✓

**Tests**: <Test strategy from spec>

**Organization**: Tasks grouped by <phase structure>

---

## Phase 1: <Phase Name>

**Purpose**: <Phase purpose from plan>

<task_list>
- [ ] T### [P?] [Story?] Description with file path
- [ ] T### [P?] [Story?] Description with file path
</task_list>

**Checkpoint**: <Phase checkpoint criteria>

---

## Phase 2: <Next Phase>

<repeat structure>

---

## Dependencies & Execution Order

<dependency_notes>
### Phase Dependencies
- Phase 2 depends on Phase 1 completion
- etc.

### Parallel Opportunities
- Tasks marked [P] can run in parallel
- etc.
</dependency_notes>

---

## Summary

**Total Tasks**: <count>
**Total Phases**: <count>
**Parallel Opportunities**: <count of [P] tasks>
  </content>
</tasks_output>
```

### Output Validation Checklist

Before returning output, verify:

```xml
<validation_checklist>
  <check>✓ All tasks have T### IDs (sequential, zero-padded)</check>
  <check>✓ All tasks have file paths in description</check>
  <check>✓ [P] markers only on truly parallel tasks</check>
  <check>✓ [Story] labels match user stories in spec.md</check>
  <check>✓ Task order follows dependency constraints</check>
  <check>✓ Blocking phases marked with ⚠️ CRITICAL</check>
  <check>✓ Each phase has checkpoint criteria</check>
  <check>✓ Summary counts are accurate</check>
</validation_checklist>
```

## Execution Steps (Mechanical Procedure)

### Step 0: Initialize

```bash
# Run from repo root
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequirePlan -IncludePlan
```

Parse JSON for:
- `FEATURE_DIR` (feature directory path)
- `AVAILABLE_DOCS` (which docs exist)

Derive paths:
- SPEC = FEATURE_DIR/spec.md
- PLAN = FEATURE_DIR/plan.md
- OUTPUT = FEATURE_DIR/tasks.md

### Step 1: Load Plan

```
READ plan.md completely
EXTRACT all "## Phase N:" headings → phase_list
EXTRACT all implementation bullets → action_list
```

### Step 2: Generate Task IDs

```
counter = 1
FOR EACH action in action_list:
  task_id = "T" + zero_pad(counter, 3)
  counter++
```

### Step 3: Detect Parallelization

```
FOR EACH task:
  file_path = extract_file_path(task.description)
  IF file_path != previous_task.file_path:
    task.parallel = true
```

### Step 4: Map User Stories

```
READ spec.md user stories section
FOR EACH task:
  FOR EACH user_story:
    IF task.description matches user_story keywords:
      task.story_label = user_story.id
```

### Step 5: Order Tasks

```
FOR EACH phase:
  SORT tasks by:
    1. Infrastructure first
    2. Parent components before children
    3. Integration after components
    4. Tests after implementation
    5. Documentation last
```

### Step 6: Format Output

```
APPLY XML scaffolding structure
INSERT tasks into phase sections
ADD checkpoint criteria from plan.md
GENERATE summary counts
```

### Step 7: Validate

```
RUN validation checklist
IF any check fails:
  FIX the issue
  RE-RUN validation
```

### Step 8: Write File

```
WRITE output to FEATURE_DIR/tasks.md
TELL user: "✅ tasks.md generated with [N] tasks across [M] phases"
```

## Example Transformation

**Input (plan.md)**:
```markdown
## Phase 1: Setup

- Create directory structure at packages/lib/feature/
- Add types.ts with FeatureState interface
- Create feature.component.ts with basic structure

## Phase 2: Implementation

- Implement handleClick in feature.component.ts
- Add unit tests in feature.component.spec.ts
```

**Output (tasks.md)**:
```markdown
## Phase 1: Setup

**Purpose**: Foundation setup

- [ ] T001 Create directory structure at packages/lib/feature/
- [ ] T002 [P] Add types.ts with FeatureState interface at packages/lib/feature/types.ts
- [ ] T003 [P] Create feature.component.ts with basic structure at packages/lib/feature/feature.component.ts

**Checkpoint**: Foundation ready - implementation can begin

---

## Phase 2: Implementation

**Purpose**: Core feature logic

- [ ] T004 Implement handleClick in feature.component.ts at line 45
- [ ] T005 [P] Add unit tests in feature.component.spec.ts

**Checkpoint**: Feature functional - tests passing
```

## GPT-5 Mini Specific Optimizations

### 1. No Deep Reasoning

**Why**: GPT-5 Mini has reduced deep-reasoning capacity
**Implementation**: All transformations are pattern-based lookups, no creative decisions

### 2. Structured Prompts Only

**Why**: GPT-5 Mini has higher sensitivity to ambiguous prompts
**Implementation**: CTCO framework with explicit format specifications

### 3. Minimal Verbosity

**Why**: Fast inference optimized for concise output
**Implementation**: Output only required task list, no explanatory prose

### 4. XML Scaffolding

**Why**: GPT-5 Mini excels at structured state maintenance
**Implementation**: XML tags for validation and parsing

### 5. Explicit Validation

**Why**: Prevent hallucinations on mechanical tasks
**Implementation**: 8-point validation checklist before output

## Error Handling

### If plan.md not found:
```
STOP
TELL user: "plan.md not found. Run `/speckit.plan` first."
```

### If ambiguous file paths:
```
STOP
TELL user: "Ambiguous file path in plan.md at line [N]. Please clarify exact path."
```

### If circular dependencies detected:
```
STOP
TELL user: "Circular dependency detected: [Task A] → [Task B] → [Task A]. Please revise plan.md."
```

### If validation fails:
```
FIX the specific validation issue
RE-RUN validation
CONTINUE only when all checks pass
```

## Success Criteria

Output is successful when:

✅ All tasks have sequential T### IDs
✅ All tasks have exact file paths
✅ [P] markers are accurate
✅ Task order follows dependencies
✅ Each phase has checkpoint
✅ Summary counts match actual tasks
✅ Output validates against checklist
✅ No ambiguous descriptions

## Optimization Trade-offs

**Using GPT-5 Mini vs Haiku 4.5**:

| Aspect | GPT-5 Mini (0x) | Haiku 4.5 (0.33x) |
|--------|-----------------|-------------------|
| Cost | Free | 0.33x premium |
| Speed | Faster | Fast |
| Reasoning | Minimal | Low |
| Context | 200K | 200K |
| Quality | Good for structured tasks | Excellent |

**When to use GPT-5 Mini** (this command):
- Budget is critical (0x vs 0.33x)
- Plan.md is well-structured with clear actions
- Tasks are mechanical transformations

**When to use Haiku 4.5** (standard /speckit.tasks):
- Quality is more important than cost
- Plan.md has ambiguous descriptions
- Need better dependency detection

## Context

$ARGUMENTS
