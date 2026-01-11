---
name: spec.implement.grok-code-fast-1
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md.
agent: spec.implement.grok-code-fast-1
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding.

## Task

Execute the implementation plan defined in `tasks.md` using a deterministic, phase‑based workflow. Validate prerequisites, enforce checklist completion, verify project setup, and run tasks with strict dependency awareness.

## Execution Steps

### 1. Initialize Context

Run:
`./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`

Extract:

- `FEATURE_DIR`
- `AVAILABLE_DOCS`
- Absolute path to `tasks.md`

If any required path is missing or unclear, stop.

### 2. Checklist Validation

If `FEATURE_DIR/checklists/` exists:

- Scan all checklist files.
- Count total, completed, incomplete items.
- Produce a status table.
- If any checklist is incomplete:
  - Show the table.
  - Ask: “Some checklists are incomplete. Proceed with implementation anyway?”
  - Stop unless the user explicitly chooses to continue.

### 3. Load Implementation Context

Load the following from `FEATURE_DIR`:

- `tasks.md` (required)
- `plan.md` (required)
- `data-model.md` (optional)
- `contracts/` (optional)
- `research.md` (optional)
- `quickstart.md` (optional)

Use only the minimal sections needed for execution.

### 4. Project Setup Verification

Detect technologies from `plan.md`.  
Create or verify ignore files:

- `.gitignore`
- `.dockerignore`
- `.eslintignore`
- `.prettierignore`
- `.npmignore`
- `.terraformignore`
- `.helmignore`

Append missing critical patterns only.  
Use technology‑specific and tool‑specific patterns.

### 5. Parse Task Structure

Extract from `tasks.md`:

- Phases: Setup, Tests, Core, Integration, Polish
- Dependencies: sequential vs `[P]` parallel
- Task IDs, descriptions, file paths
- Execution flow rules

### 6. Execute Implementation

Follow the phases in order:

**Setup**  
Initialize project structure, dependencies, configuration.

**Tests**  
Define contracts, entities, integration scenarios.

**Core**  
Implement models, services, endpoints.

**Integration**  
Connect databases, middleware, logging, external services.

**Polish**  
Finalize tests, performance, documentation.

Rules:

- Run tasks phase‑by‑phase.
- Respect sequential and parallel execution rules.
- Apply TDD: test tasks before implementation tasks.
- Tasks touching the same files must run sequentially.
- Validate each phase before moving on.

### 7. Progress Tracking & Error Handling

- Report progress after each task.
- Halt on sequential task failure.
- For parallel tasks: continue successful ones, report failures.
- Provide actionable next steps.
- Mark completed tasks as `[X]` in `tasks.md`.

### 8. Completion Validation

- Verify all tasks completed.
- Validate alignment with the specification.
- Ensure tests pass and coverage is sufficient.
- Confirm implementation matches the technical plan.
- Output a final summary of completed work.

## Note

If tasks are missing or incomplete, suggest running `/spec.tasks` to regenerate the task list.
