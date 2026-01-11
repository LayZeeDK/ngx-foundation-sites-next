---
name: spec.implement
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md.
agent: spec.implement
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding.

## Task

Execute the implementation plan defined in `tasks.md`, validate prerequisites, enforce checklist completion, verify project setup, and run tasks phase‑by‑phase with dependency awareness.

## Execution Steps

1. **Initialize Context**  
   Run:  
   `./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`  
   Extract `FEATURE_DIR` and `AVAILABLE_DOCS`.  
   All paths must be absolute.

2. **Check Checklist Status**  
   If `FEATURE_DIR/checklists/` exists:
   - Scan all checklist files.
   - Count total, completed, and incomplete items.
   - Produce a status table.
   - If any checklist is incomplete:
     - Display the table.
     - Ask: “Some checklists are incomplete. Do you want to proceed with implementation anyway?”
     - Halt unless the user explicitly chooses to continue.
   - If all checklists pass, proceed automatically.

3. **Load Implementation Context**  
   Load:
   - `tasks.md` (required)
   - `plan.md` (required)
   - `data-model.md` (optional)
   - `contracts/` (optional)
   - `research.md` (optional)
   - `quickstart.md` (optional)

4. **Project Setup Verification**  
   Detect project technologies and create/verify ignore files:
   - `.gitignore`
   - `.dockerignore`
   - `.eslintignore`
   - `.prettierignore`
   - `.npmignore`
   - `.terraformignore`
   - `.helmignore`  
     Use technology‑specific and tool‑specific patterns based on the tech stack in `plan.md`.

5. **Parse Task Structure**  
   Extract from `tasks.md`:
   - Task phases (Setup, Tests, Core, Integration, Polish)
   - Dependencies (sequential vs parallel `[P]`)
   - Task IDs, descriptions, file paths
   - Execution flow rules

6. **Execute Implementation**
   - Run tasks phase‑by‑phase.
   - Respect sequential and parallel execution rules.
   - Apply TDD: run test tasks before implementation tasks.
   - Ensure tasks touching the same files run sequentially.
   - Validate each phase before moving on.

7. **Execution Rules**
   - Setup: initialize project structure and dependencies
   - Tests: define contracts, entities, integration scenarios
   - Core: implement models, services, endpoints
   - Integration: connect databases, middleware, logging, external services
   - Polish: finalize tests, performance, documentation

8. **Progress Tracking & Error Handling**
   - Report progress after each task
   - Halt on sequential task failure
   - For parallel tasks, continue successful ones and report failures
   - Provide actionable next steps
   - Mark completed tasks as `[X]` in `tasks.md`

9. **Completion Validation**
   - Verify all tasks completed
   - Validate alignment with the specification
   - Ensure tests pass and coverage is sufficient
   - Confirm implementation matches the technical plan
   - Output a final summary of completed work

## Note

If tasks are missing or incomplete, suggest running `/spec.tasks` to regenerate the task list.
