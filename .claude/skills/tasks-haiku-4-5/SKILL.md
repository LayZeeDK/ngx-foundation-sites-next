---
description: Generate actionable, dependency-ordered tasks.md from plan.md and spec.md. Optimized for Claude Haiku 4.5's speed and pattern-matching capabilities.
model_override: claude-haiku-4.5
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

# Task Generation - Haiku 4.5 Optimized

## Model Configuration

**Model**: Claude Haiku 4.5  
**Optimization Strategy**: Mechanical transformations, pattern matching, structured output  
**Expected Performance**: 10-20 seconds, 0.33x cost vs Sonnet

## Goal

<goal>
Generate actionable, dependency-ordered tasks.md from design artifacts (plan.md, spec.md, data-model.md, contracts/).

**Task Type**: Mechanical pattern-based transformation (perfect for Haiku)

- Extract phases from plan.md
- Convert implementation bullets to tasks
- Map tasks to user stories
- Detect parallelization opportunities
- Order by dependencies
  </goal>

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Path Grounding (CRITICAL)

<path_rules>

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script
- All file paths must be absolute
  </path_rules>

---

## Execution Steps

### Step 1: Setup & Path Discovery (AUTO-DETECT)

<task>
**IMMEDIATELY** run the prerequisite check. Do NOT ask the user which feature to process.
The script auto-detects the feature from the current git branch.
</task>

<critical>
**NO USER CONFIRMATION REQUIRED**: Execute this command as your FIRST action.
The script uses `git rev-parse --abbrev-ref HEAD` to detect the branch (e.g., `002-accordion-component`)
and derives the feature directory automatically (`specs/002-accordion-component/`).
</critical>

<evaluation_criteria>
**Success**: Script executes, JSON output parsed, FEATURE_DIR extracted
**Failure**: Asking "Which feature?" or "What should I process?" BEFORE running the script
</evaluation_criteria>

```powershell
# Get resolved core artifact paths
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly

# Get available optional docs
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json
```

**Parse both JSON outputs and assign variables:**

Core artifacts (from -PathsOnly):
```
SPEC = json1.FEATURE_SPEC
PLAN = json1.IMPL_PLAN
OUTPUT = json1.FEATURE_DIR + "/tasks.md"
```

Optional docs (from -Json AVAILABLE_DOCS):
```
IF "data-model.md" in json2.AVAILABLE_DOCS:
  DATA_MODEL = json1.FEATURE_DIR + "/data-model.md"
IF "contracts/" in json2.AVAILABLE_DOCS:
  CONTRACTS = json1.FEATURE_DIR + "/contracts/"
```

**Path validation**: Prerequisite script validates core files. Proceed to Step 2 on success.

**Error handling**: If script fails with missing file error, ABORT with command:
- spec.md → Run `/speckit.specify`
- plan.md → Run `/speckit.plan`

**PowerShell String Escaping**:

- For single quotes: `'I'\''m Groot'` or `"I'm Groot"`

---

### Step 2: Load Design Documents (with Semantic Chunking)

<context_loading>
Load documents using semantic section chunking for files > 1,250 lines (~25K tokens).

**Strategy**: Use full read for small files, semantic section reading for large files.

Based on research-backed best practices from [CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md](../../../prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md).

Load documents in this order:

**1. plan.md** (REQUIRED) - Semantic chunking if > 1,250 lines:

```
# If large file, discover section boundaries first
Grep(pattern: "^#{1,3}\\s+", path: PLAN, output_mode: "content", -n: true)

# Read relevant sections for task generation
sections_needed = [
  "Technology Stack", "Tech Stack",
  "Project Structure",
  "Phase", "Implementation Phases",
  "Implementation", "Implementation Approach"
]

FOR EACH section IN sections_needed:
  Read(PLAN, offset=section.start, limit=section.lines)
  EXTRACT: Tech stack, libraries, phase definitions, implementation bullets
```

**2. spec.md** (REQUIRED) - Semantic chunking if > 1,250 lines:

```
# Read relevant sections for task mapping
sections_needed = [
  "User Stories",
  "Success Criteria", "Acceptance Criteria",
  "Scope", "Feature Scope",
  "Requirements (mandatory)"
]

FOR EACH section IN sections_needed:
  Read(SPEC, offset=section.start, limit=section.lines)
  EXTRACT: User stories with priorities (P1, P2, P3...), success criteria
```

**3. data-model.md** (OPTIONAL) - Full read (typically small):

```
Read(DATA_MODEL)
EXTRACT: Entities, attributes, relationships
```

**4. contracts/** (OPTIONAL) - Read individual files:

```
FOR EACH contract_file IN contracts/:
  Read(contract_file)
  EXTRACT: API endpoints, request/response schemas
```

**5. research.md** (OPTIONAL) - Full read (typically small):

```
Read(RESEARCH)
EXTRACT: Design decisions for setup tasks
```

**6. quickstart.md** (OPTIONAL) - Full read (typically small):

```
Read(QUICKSTART)
EXTRACT: Test scenarios
```

**Why semantic chunking works for task generation**:

The mechanical transformations (Step 3) are **section-aligned**:
- ✅ **Transformation 1 (Extract Phases)**: Reads "Phase N:" headers and purpose → Section-local
- ✅ **Transformation 2 (Convert Bullets to Tasks)**: Reads implementation bullets → Section-local
- ✅ **Transformation 3 (Map to Stories)**: Reads user stories from spec.md → Section-local
- ✅ **Transformation 4 (Order by Dependencies)**: Uses extracted task list, not file content
- ✅ **Transformation 5 (Detect Parallel)**: Uses task metadata, not file content

**Key insight**: Task generation is **extractive**, not **generative**. Each transformation extracts from specific sections, then operates on extracted data structures.

**Benefits**:
- ✅ Natural semantic boundaries (phase blocks, user story blocks)
- ✅ Skip irrelevant sections (Background, Goals, Historical Context)
- ✅ Same transformation quality as full read (operations are section-independent)
- ✅ Better token distribution for multiple files (plan.md + spec.md + optional docs)

**Cost Impact**: Negligible (same total tokens when all sections needed, cheaper when skipping non-essential sections)
</context_loading>

### Step 2b: Content Loading Validation (MANDATORY)

<critical>
**BEFORE proceeding to Step 3 (Mechanical Transformations), verify you loaded CONTENT not just STRUCTURE.**

This validation prevents the common failure mode of reading headers only via Grep.
</critical>

<validation_checklist>
**For plan.md**:
- [ ] Can you list specific technology choices (frameworks, libraries, databases)?
- [ ] Can you quote at least one implementation bullet with its full description?
- [ ] Can you identify phase names AND their objectives/purposes?
- [ ] Did you capture project structure details (directories, files)?

**For spec.md**:
- [ ] Can you list user stories with their priorities (P1, P2, P3...)?
- [ ] Can you quote specific success criteria or acceptance criteria?
- [ ] Can you identify the feature scope boundaries (in-scope vs out-of-scope)?
- [ ] Did you capture user story descriptions (the "As a... I want... So that..." content)?

**For optional docs** (if present):
- [ ] data-model.md: Can you list entities with their attributes (not just entity names)?
- [ ] contracts/: Can you describe endpoint schemas (request/response structure)?

**If you answered "NO" to any question above**:
1. STOP immediately
2. Re-read the affected sections using Read(file, offset, limit)
3. Validate again before proceeding to Step 3

**Common Failure Pattern to Avoid**:
```
❌ WRONG: Using Grep(pattern: "^#{1,3}\\s+") to read headers only
         → You get: "## Phase 1: Setup" but NOT the implementation bullets
✅ CORRECT: Using Read(file, offset, limit) after Grep identifies boundaries
         → You get: "## Phase 1: Setup" PLUS "- Create project structure..."
```
</validation_checklist>

<evaluation_criteria>
**Success**: You can quote specific implementation bullets, user stories, phase objectives with full details
**Failure**: You only have section titles but not the implementation bullets, user story details, or phase objectives
</evaluation_criteria>

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

**Structure**:

1. **Header**: Feature name, prerequisites, test strategy
2. **Phase 1**: Setup (project initialization)
3. **Phase 2**: Foundational (blocking prerequisites)
4. **Phase 3+**: User Stories (one phase per story, P1 → P2 → P3...)
5. **Final Phase**: Polish & cross-cutting concerns
6. **Dependencies Section**: Story completion order
7. **Parallel Execution**: Examples per story
8. **Summary**: Task counts, parallel opportunities
   </output_structure>

<task_format_rules>
**CRITICAL**: Every task MUST follow this exact format:

```
- [ ] T### [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: `- [ ]` (always present)
2. **Task ID**: `T###` (sequential: T001, T002, T003...)
3. **[P] marker**: OPTIONAL - Only if truly parallelizable
4. **[Story] label**: REQUIRED for user story phases only
   - Format: [US1], [US2], [US3]...
   - Maps to user stories from spec.md
   - Setup/Foundational/Polish phases: NO story label
5. **Description**: Clear action + exact file path

**Examples**:

- ✅ `- [ ] T001 Create project structure per implementation plan`
- ✅ `- [ ] T005 [P] Implement auth middleware in src/middleware/auth.py`
- ✅ `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ `- [ ] Create User model` (missing ID, Story, path)
- ❌ `T001 [US1] Create model` (missing checkbox, path)
- ❌ `- [ ] [US1] Create User model` (missing Task ID)
- ❌ `- [ ] T001 [US1] Create model` (missing file path)
  </task_format_rules>

<phase_organization>
**Phase Structure**:

**Phase 1: Setup** (NO story labels)

- Project initialization
- Directory structure
- Configuration files
- Shared infrastructure

**Phase 2: Foundational** (NO story labels)

- Blocking prerequisites for ALL user stories
- Base classes/interfaces
- Shared utilities
- Core types/tokens
- ⚠️ Mark as **CRITICAL**: No user story work can begin until complete

**Phase 3+: User Stories** (MUST have story labels)

- One phase per user story
- In priority order (P1, P2, P3...)
- Within each story:
  1. Tests (if requested)
  2. Models
  3. Services
  4. Endpoints/UI
  5. Integration
- Each phase = complete, independently testable increment

**Final Phase: Polish** (NO story labels)

- Cross-cutting concerns
- Documentation
- Performance optimization
- Accessibility improvements
  </phase_organization>

---

### Step 5: Validation

<validation_checklist>
Before writing tasks.md, verify:

- [ ] All tasks have T### IDs (sequential, zero-padded)
- [ ] All tasks have file paths in description
- [ ] [P] markers only on truly parallel tasks (different files, no dependencies)
- [ ] [Story] labels match user stories in spec.md
- [ ] [Story] labels only in User Story phases (not Setup/Foundational/Polish)
- [ ] Task order follows dependency constraints (infra → models → services → UI)
- [ ] Blocking phases marked with ⚠️ CRITICAL
- [ ] Each phase has checkpoint criteria
- [ ] Summary counts are accurate
      </validation_checklist>

---

### Step 6: Write Output

Write tasks.md to `FEATURE_DIR/tasks.md`.

---

### Step 7: Report Completion

<output_format>
**✅ Tasks Generated**

1. **File**: [Full absolute path to tasks.md]
2. **Total Tasks**: [Number]
3. **Task Breakdown**:
   - Setup: [Number]
   - Foundational: [Number]
   - User Story 1 (P1): [Number]
   - User Story 2 (P2): [Number]
   - ... (list all)
   - Polish: [Number]
4. **Parallel Opportunities**: [Number of [P] tasks]
5. **Independent Test Criteria**: [Per user story]
6. **Suggested MVP Scope**: Typically just User Story 1 (P1)

**Format Validation**:
✅ All tasks follow checklist format (checkbox, ID, labels, file paths)

**Next Steps**:

- Review tasks.md for accuracy
- Run `/speckit.analyze` for consistency check
- Begin implementation with `/speckit.implement`
  </output_format>

---

## Mechanical Transformation Rules

<transformation_details>
These rules guide the pattern-based task generation:

**From User Stories (spec.md)** - PRIMARY ORGANIZATION:

- Each user story (P1, P2, P3...) gets its own phase
- Map all related components to their story:
  - Models needed for that story
  - Services needed for that story
  - Endpoints/UI needed for that story
  - Tests (if requested) specific to that story
- Mark story dependencies (most should be independent)

**From Contracts (contracts/\*.ts)**:

- Map each contract/endpoint → user story it serves
- If tests requested: Contract test task [P] before implementation

**From Data Model (data-model.md)**:

- Map each entity → user story(ies) that need it
- If entity serves multiple stories: Put in earliest story or Setup phase
- Relationships → service layer tasks in appropriate story phase

**From Setup/Infrastructure**:

- Shared infrastructure → Setup phase (Phase 1)
- Foundational/blocking → Foundational phase (Phase 2)
- Story-specific setup → within that story's phase

**Parallelization Detection**:

- Mark [P] when:
  - Different files
  - No shared state
  - No sequential dependency
- Do NOT mark [P] when:
  - Same file edits
  - Parent → child relationship
  - State depends on previous task
    </transformation_details>

---

## Tests Are OPTIONAL

<test_strategy>
**Only generate test tasks if**:

- Explicitly requested in feature specification, OR
- User requests TDD approach, OR
- User input ($ARGUMENTS) mentions testing

**If tests NOT requested**:

- Focus on implementation tasks only
- Skip test task generation
- Note in output: "Tests: Not requested for this feature"

**If tests ARE requested**:

- Add test tasks in appropriate phase
- Tests come AFTER implementation in same phase
- Mark test tasks with [P] if they can run in parallel
  </test_strategy>

---

## Optimization Notes for Haiku 4.5

<optimization_strategy>
This command is optimized for Haiku 4.5's strengths:

1. **Mechanical Transformations**: Pattern-based, no creative decisions
2. **Explicit Format Rules**: Clear task structure, no ambiguity
3. **Structured Input Processing**: Step-by-step extraction from docs
4. **Pattern Matching**: Map keywords to user stories
5. **Formula-Based Prioritization**: Dependency ordering algorithm
6. **Validation Checklist**: Structured verification before output
7. **XML-Style Structure**: Clear transformation sequence

**Performance Expectations**:

- **Speed**: 10-20 seconds (vs 20-40s with Sonnet)
- **Cost**: 0.33x vs Sonnet 4.5
- **Quality**: 95%+ of Sonnet for this mechanical task
- **Best for**: Converting structured design docs to task lists

**Why Haiku Excels Here**:

- Task generation is pattern-matching (Haiku's strength)
- Clear rules with no interpretation needed
- Structured input → structured output
- Minimal reasoning required
- High volume of similar operations (FOR EACH loops)

**Comparison to Sonnet**:

- Haiku: Faster, cheaper, excellent for mechanical conversion
- Sonnet: Slightly better at detecting implicit dependencies
- For this use case: Haiku is recommended (cost/speed benefit > marginal quality difference)

**Context Window Management**:

This skill uses **semantic section reading** based on Anthropic's official guidance, preventing false positives from header-only reads.

**Why semantic chunking works for task generation**:
- The 5 mechanical transformations are **extractive** and **section-aligned**
- Transformation 1 (Extract Phases): Reads phase headers + objectives → Section-local
- Transformation 2 (Convert Bullets): Reads implementation bullets → Section-local
- Transformation 3 (Map to Stories): Reads user stories from spec.md → Section-local
- Transformations 4-5 (Order/Detect Parallel): Operate on extracted task list, not file content
- No cross-section reasoning required for extraction

**Alignment with Haiku 4.5 Best Practices** (prompt-engineering/CLAUDE-HAIKU-4-5-OPTIMIZATION.md):
- "Context Window Management: Use only as much context as required per operation"
- "Optimized Input Length: Send only relevant sections, not entire files"
- **Correct interpretation**: "Minimal context" = relevant sections WITH content, NOT structure-only
- Task generation is **mechanical extraction** → Benefits from focused section reading

**Multi-File Optimization**:
- Task generation loads 2 required files (plan.md + spec.md) + optional docs
- Semantic chunking prevents hitting context limits when both files are large
- Skip irrelevant sections (Background, Historical Context) → More headroom for optional docs
- Better token distribution: Load only implementation-relevant sections from each file

**Cost Impact**: Negligible for small files; significant savings when both plan.md and spec.md exceed 1,250 lines
**Quality Impact**: HIGH — Semantic boundaries ensure complete extraction of phases, bullets, user stories
**Documentation**: See [CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md](../../../prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md) for full research
  </optimization_strategy>

---

## Context for Task Generation

```text
$ARGUMENTS
```

Use to adjust:

- Test strategy (TDD vs implementation-first)
- Specific file naming conventions
- Technology-specific task ordering
- Parallelization preferences
