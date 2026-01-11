---
description: Generate actionable, dependency-ordered tasks.md from plan.md and spec.md. Optimized for Claude Haiku 4.5's speed and pattern-matching capabilities.
handoffs:
  - label: Analyze For Consistency
    agent: speckit.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: speckit.implement
    prompt: Start the implementation in phases
    send: true
---

## Model Selection

**Preferred Model**: Claude Haiku 4.5 (`claude-haiku-4.5`)  
**Invoke with**: `gh copilot -m "claude-haiku-4.5" slash tasks-haiku-4-5`

**Optimization Strategy**: Mechanical transformations, pattern matching, structured output  
**Expected Performance**: 10-20 seconds, 0.33x cost vs Sonnet 4.5

---

## Goal

<goal>
Generate actionable, dependency-ordered tasks.md from design artifacts (plan.md, spec.md, data-model.md, contracts/).

**Task Type**: Mechanical pattern-based transformation (perfect for Haiku)

- Extract phases from plan.md
- Convert implementation bullets to tasks
- Map tasks to user stories from spec.md
- Detect parallelization opportunities
- Order tasks by dependencies

**Output**: tasks.md file with complete, immediately executable task list
</goal>

---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Path Grounding (CRITICAL)

<path_rules>

- Do **not** guess or "fix up" filesystem paths (e.g. avoid fallback paths like `/Users/...`)
- Treat paths emitted by the `.specify` PowerShell scripts (`-Json` output) as the **only source of truth**; use them verbatim
- If a required path is missing/unclear, STOP and re-run the prerequisite script (or ask the user) instead of synthesizing a path
- All file paths must be absolute
  </path_rules>

---

## Execution Steps

### Step 1: Setup & Path Discovery

<task>
Run prerequisite check from repository root to get absolute paths.
</task>

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json
```

**Parse JSON output for**:

- `FEATURE_DIR`: Absolute path to feature directory
- `AVAILABLE_DOCS`: List of existing files

**Derive paths**:

- `SPEC` = FEATURE_DIR/spec.md (REQUIRED)
- `PLAN` = FEATURE_DIR/plan.md (REQUIRED)
- `DATA_MODEL` = FEATURE_DIR/data-model.md (OPTIONAL)
- `CONTRACTS` = FEATURE_DIR/contracts/ (OPTIONAL)
- `RESEARCH` = FEATURE_DIR/research.md (OPTIONAL)
- `QUICKSTART` = FEATURE_DIR/quickstart.md (OPTIONAL)
- `OUTPUT` = FEATURE_DIR/tasks.md

**PowerShell String Escaping**:

- For single quotes in args like "I'm Groot", use: `'I'\''m Groot'`
- Or use double quotes: `"I'm Groot"`

**Error Handling**:

- If spec.md missing: STOP, instruct user to run `/speckit.specify` first
- If plan.md missing: STOP, instruct user to run `/speckit.plan` first

---

### Step 2: Load Design Documents

<context_loading>
Load documents in priority order:

**1. plan.md (REQUIRED)**:

- Extract tech stack
- Extract libraries
- Extract project structure
- Extract phase definitions ("## Phase N:")
- Extract implementation bullets

**2. spec.md (REQUIRED)**:

- Extract user stories with priorities (P1, P2, P3...)
- Extract success criteria
- Extract feature scope

**3. data-model.md (OPTIONAL)**:

- Extract entities
- Extract attributes
- Extract relationships

**4. contracts/ (OPTIONAL)**:

- Extract API endpoints
- Extract request/response schemas

**5. research.md (OPTIONAL)**:

- Extract design decisions for setup tasks

**6. quickstart.md (OPTIONAL)**:

- Extract test scenarios

**Note**: Not all projects have all documents. Generate tasks based on what's available.
</context_loading>

---

### Step 3: Execute Mechanical Transformations

<transformation_sequence>
Apply these pattern-based transformations in order:

**Transformation 1: Extract Phases from plan.md**

```
FOR EACH "## Phase N:" heading in plan.md:
  CREATE task group header in tasks.md
  COPY phase purpose/goal verbatim
```

**Transformation 2: Convert Implementation Bullets to Tasks**

```
FOR EACH bullet point in plan.md implementation section:
  IF bullet describes concrete action (has verb + object):
    GENERATE task with format: "- [ ] T### [P?] [Story] Description"
    EXTRACT file path from bullet (if present)
    DETECT parallelizability:
      IF operates on different file than dependencies:
        ADD [P] marker
```

**Transformation 3: Map Tasks to User Stories**

```
READ spec.md user stories section
FOR EACH task:
  FOR EACH user_story:
    IF task.description matches user_story keywords:
      ADD [USN] label (e.g., [US1], [US2])
```

**Transformation 4: Order Tasks by Dependencies**

```
ORDER tasks within each phase:
  1. Infrastructure (tokens, types, base components)
  2. Models (data layer)
  3. Services (business logic)
  4. Components (parent before child)
  5. Endpoints/UI (integration)
  6. Tests (if requested - after implementation)
  7. Documentation (last)
```

**Transformation 5: Detect Parallel Opportunities**

```
FOR EACH task:
  IF operates on different files than dependencies:
    AND no shared state:
    AND no sequential dependency:
      MARK with [P]
```

</transformation_sequence>

---

### Step 4: Generate tasks.md

<output_structure>
Use `.specify/templates/tasks-template.md` as structure template.

**File Structure**:

1. **Header**:
   - Feature name from plan.md
   - Prerequisites (plan.md ✓, spec.md ✓)
   - Test strategy
   - Organization approach

2. **Phase 1: Setup** (NO story labels)
   - Project initialization
   - Directory structure
   - Configuration files
   - Shared infrastructure

3. **Phase 2: Foundational** (NO story labels)
   - ⚠️ **CRITICAL**: No user story work can begin until this phase is complete
   - Blocking prerequisites for ALL user stories
   - Base classes/interfaces
   - Shared utilities
   - Core types/tokens

4. **Phase 3+: User Stories** (MUST have story labels)
   - One phase per user story
   - In priority order from spec.md (P1, P2, P3...)
   - Within each story phase:
     1. Tests (if requested)
     2. Models
     3. Services
     4. Endpoints/UI
     5. Integration
   - Each phase = complete, independently testable increment

5. **Final Phase: Polish** (NO story labels)
   - Cross-cutting concerns
   - Documentation
   - Performance optimization
   - Accessibility improvements

6. **Dependencies Section**:
   - Story completion order
   - Phase dependencies

7. **Parallel Execution**:
   - Examples per story
   - Tasks marked [P]

8. **Summary**:
   - Total task count
   - Task count per phase
   - Parallel opportunities
     </output_structure>

<task_format_rules>
**CRITICAL**: Every task MUST strictly follow this format:

```
- [ ] T### [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable
   - Different files
   - No dependencies on incomplete tasks
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc.
   - Maps to user stories from spec.md
   - Setup phase: NO story label
   - Foundational phase: NO story label
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

✅ **CORRECT**:

```markdown
- [ ] T001 Create project structure per implementation plan
- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py
- [ ] T012 [P] [US1] Create User model in src/models/user.py
- [ ] T014 [US1] Implement UserService in src/services/user_service.py
```

❌ **WRONG**:

```markdown
- [ ] Create User model (missing ID and Story label and file path)
      T001 [US1] Create model (missing checkbox and file path)
- [ ] [US1] Create User model (missing Task ID and file path)
- [ ] T001 [US1] Create model (missing file path)
```

**File Path Requirements**:

- MUST include exact file path in task description
- ✅ `Create component at packages/lib/feature/feature.component.ts`
- ❌ `Create component` (too vague)
- Path format: Relative to repo root, forward slashes, include extension
  </task_format_rules>

---

### Step 5: Validation

<validation_checklist>
Before writing tasks.md, verify:

- [ ] All tasks have T### IDs (sequential, zero-padded: T001, T023, T145)
- [ ] All tasks have exact file paths in description
- [ ] [P] markers only on truly parallel tasks (different files, no shared state, no dependencies)
- [ ] [Story] labels match user stories in spec.md (P1→[US1], P2→[US2]...)
- [ ] [Story] labels ONLY in User Story phases (NOT in Setup, Foundational, or Polish)
- [ ] Task order follows dependency constraints (infra → models → services → components → UI → tests → docs)
- [ ] Blocking phases marked with ⚠️ **CRITICAL**
- [ ] Each phase has checkpoint criteria
- [ ] Summary counts are accurate (total tasks, parallel opportunities)
      </validation_checklist>

---

### Step 6: Write Output

Write tasks.md to `FEATURE_DIR/tasks.md`.

---

### Step 7: Report Completion

<completion_report>
After tasks.md is generated:

**✅ Tasks Generated Successfully**

1. **File**: [Full absolute path to tasks.md]

2. **Total Tasks**: [Number of tasks generated]

3. **Task Breakdown by Phase**:
   - Phase 1 - Setup: [Number of tasks]
   - Phase 2 - Foundational: [Number of tasks]
   - Phase 3 - User Story 1 (P1): [Number of tasks]
   - Phase 4 - User Story 2 (P2): [Number of tasks]
   - ... (list all user story phases)
   - Final Phase - Polish: [Number of tasks]

4. **Parallel Opportunities**: [Number of tasks marked with [P]]

5. **Independent Test Criteria**: [List per user story from spec.md]

6. **Suggested MVP Scope**: Typically just User Story 1 (P1)

**Format Validation**:
✅ All tasks follow checklist format (checkbox, ID, labels, file paths)

**Next Steps**:

- Review tasks.md for accuracy and completeness
- Run `/speckit.analyze` for cross-artifact consistency check
- Begin implementation with `/speckit.implement`

**The tasks.md is immediately executable** - each task is specific enough that an LLM can complete it without additional context.
</completion_report>

---

## Task Organization Rules

<organization_details>
**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**From User Stories (spec.md)** - PRIMARY ORGANIZATION:

- Each user story (P1, P2, P3...) gets its own phase
- Map all related components to their story:
  - Models needed for that story
  - Services needed for that story
  - Endpoints/UI needed for that story
  - Tests (if requested) specific to that story
- Mark story dependencies (most stories should be independent)

**From Contracts (contracts/\*.ts)**:

- Map each contract/endpoint → to the user story it serves
- If tests requested: Each contract → contract test task [P] before implementation in that story's phase

**From Data Model (data-model.md)**:

- Map each entity to the user story(ies) that need it
- If entity serves multiple stories: Put in earliest story or Setup phase
- Relationships → service layer tasks in appropriate story phase

**From Setup/Infrastructure**:

- Shared infrastructure → Setup phase (Phase 1)
- Foundational/blocking tasks → Foundational phase (Phase 2)
- Story-specific setup → within that story's phase

**Parallelization Detection Rules**:

**Mark [P] when**:

- Different files
- No shared state
- No sequential dependency

**Do NOT mark [P] when**:

- Same file edits
- Parent → child relationship (e.g., parent component before child component)
- State depends on previous task
  </organization_details>

---

## Tests Are OPTIONAL

<test_strategy>
**Only generate test tasks if**:

- Explicitly requested in feature specification (spec.md has testing requirements), OR
- User requests TDD approach in $ARGUMENTS, OR
- User input mentions testing/tests

**If tests NOT requested**:

- Focus on implementation tasks only
- Skip test task generation
- Note in output header: "**Tests**: Not requested for this feature"

**If tests ARE requested**:

- Add test tasks in appropriate phase for each user story
- Tests come AFTER implementation tasks in the same phase
- Mark test tasks with [P] if they can run in parallel (different test files)
- Include test setup in Foundational phase if shared test infrastructure needed
  </test_strategy>

---

## Optimization Notes for Haiku 4.5

<optimization_strategy>
This command is optimized for Claude Haiku 4.5's strengths:

1. **Mechanical Transformations**: Pattern-based, no creative decisions required
2. **Explicit Format Rules**: Clear task structure with no ambiguity
3. **Structured Input Processing**: Step-by-step extraction algorithm from docs
4. **Pattern Matching**: Map keywords to user stories (Haiku's strength)
5. **Formula-Based Prioritization**: Dependency ordering via explicit algorithm
6. **Validation Checklist**: Structured verification step before output
7. **FOR EACH Loops**: High volume of similar operations (Haiku excels at repetitive tasks)

**Performance Expectations**:

- **Speed**: 10-20 seconds (vs 20-40s with Sonnet 4.5)
- **Cost**: 0.33x vs Sonnet 4.5 (66% cheaper)
- **Quality**: 95%+ of Sonnet for this mechanical task
- **Best for**: Converting structured design docs to executable task lists

**Why Haiku Excels Here**:

- Task generation is pure pattern-matching (Haiku's primary strength)
- Clear, unambiguous rules with zero interpretation needed
- Structured input → structured output transformation
- Minimal reasoning required (just pattern recognition)
- High volume of similar operations (extract, map, order, format)
- No architectural decisions or creative synthesis

**Comparison to Sonnet**:

- **Haiku**: Faster, cheaper, excellent for mechanical conversion
- **Sonnet**: Slightly better at detecting implicit dependencies or architectural patterns
- **For this use case**: Haiku is strongly recommended
  - Cost/speed benefit significantly outweighs marginal quality difference
  - Task generation is well within Haiku's capabilities
  - 95%+ quality at 1/3 the cost and 2x the speed

**When to Use Sonnet Instead**:

- Never recommended for this task (Haiku is optimal)
- Unless: Extremely complex cross-story dependencies requiring deep synthesis
  </optimization_strategy>

---

## Context for Task Generation

```text
$ARGUMENTS
```

Use user input (if provided) to adjust:

- Test strategy (TDD vs implementation-first)
- Specific file naming conventions
- Technology-specific task ordering
- Parallelization preferences
- MVP scope definition
