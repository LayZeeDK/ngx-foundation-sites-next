---
name: spec.tasks
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
agent: spec.tasks
handoffs:
  - label: Analyze For Consistency
    agent: spec.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: spec.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding.

## Task

Generate a complete, dependency‑ordered `tasks.md` using the plan, spec, and available design artifacts. Tasks must follow strict formatting and be organized by user story.

## Execution Steps

1. **Setup**  
   Run:  
   `./.specify/scripts/powershell/check-prerequisites.ps1 -Json`  
   Extract `FEATURE_DIR` and `AVAILABLE_DOCS`.  
   All paths must be absolute.

2. **Load Design Documents**  
   From `FEATURE_DIR`, load:
   - **Required**: `plan.md`, `spec.md`
   - **Optional**: `data-model.md`, `contracts/`, `research.md`, `quickstart.md`  
     Generate tasks based on what exists.

3. **Execute Task Generation Workflow**
   - Extract tech stack, libraries, structure from `plan.md`
   - Extract user stories + priorities from `spec.md`
   - Map entities from `data-model.md`
   - Map endpoints from `contracts/`
   - Extract decisions from `research.md`
   - Generate tasks organized by user story
   - Build dependency graph
   - Identify parallelizable tasks `[P]`
   - Validate completeness and testability

4. **Generate tasks.md**  
   Use `.specify/templates/tasks-template.md` as structure.  
   Populate:
   - Feature name
   - Setup phase
   - Foundational phase
   - One phase per user story (priority order)
   - Polish phase
   - Dependencies section
   - Parallel execution examples
   - Implementation strategy (MVP first)  
     Ensure all tasks follow strict checklist format.

5. **Report**  
   Output:
   - Path to generated `tasks.md`
   - Total task count
   - Tasks per user story
   - Parallel opportunities
   - Independent test criteria
   - Suggested MVP scope
   - Format validation results

## Task Generation Rules

### Checklist Format (Required)

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

### Organization Rules

- User stories drive phase structure.
- Contracts map to story tasks.
- Entities map to story tasks or setup.
- Shared infrastructure → Setup or Foundational.
- Story phases must be independently testable.

### Phase Structure

- Phase 1: Setup
- Phase 2: Foundational
- Phase 3+: User stories in priority order
- Final Phase: Polish & cross‑cutting concerns
