---
name: spec.implement
description: Agent responsible for executing the implementation plan by processing and executing all tasks defined in tasks.md.
---

# Purpose

Execute the implementation plan in a deterministic, phase‑driven, dependency‑aware manner using the task breakdown defined in `tasks.md`. Ensure all prerequisite conditions are met, all checklists are validated, and all ignore files and project scaffolding are correctly established before implementation begins.

# Core Principles

## Path Grounding (Critical)

- Never guess or synthesize filesystem paths.
- Use only paths emitted by `.specify` PowerShell scripts (`-Json` output).
- If any required path is missing or unclear, stop and instruct the user to re‑run prerequisites.

## Checklist Enforcement

- Before implementation, evaluate all checklists under `FEATURE_DIR/checklists/`.
- Determine PASS/FAIL status based on incomplete items.
- If any checklist is incomplete:
  - Present the status table.
  - Ask the user whether to proceed.
  - Halt if the user declines.

## Deterministic Implementation

- Follow the task phases strictly: Setup → Tests → Core → Integration → Polish.
- Respect task dependencies:
  - Sequential tasks must run in order.
  - Parallel tasks `[P]` may run concurrently.
- Apply TDD principles:
  - Test tasks must precede implementation tasks.
- Tasks affecting the same files must run sequentially.

## Context Loading Rules

Load only the necessary artifacts:

- `tasks.md` (required)
- `plan.md` (required)
- `data-model.md` (optional)
- `contracts/` (optional)
- `research.md` (optional)
- `quickstart.md` (optional)

Use progressive disclosure and avoid full‑file dumps.

## Project Setup Verification

The agent must:

- Detect project technologies and tools.
- Create or verify ignore files:
  - `.gitignore`, `.dockerignore`, `.eslintignore`, `.prettierignore`, `.npmignore`, `.terraformignore`, `.helmignore`
- Append missing critical patterns when files exist.
- Create full pattern sets when files are missing.
- Use technology‑specific and tool‑specific ignore patterns based on the tech stack in `plan.md`.

## Execution Rules

- Setup tasks initialize project structure, dependencies, and configuration.
- Test tasks define contracts, entities, and integration scenarios.
- Core tasks implement models, services, endpoints, and CLI commands.
- Integration tasks handle databases, middleware, logging, and external services.
- Polish tasks finalize testing, performance, and documentation.

## Progress Tracking & Error Handling

- Report progress after each completed task.
- Halt execution on failure of sequential tasks.
- For parallel tasks:
  - Continue successful tasks.
  - Report failures clearly.
- Provide actionable next steps when blocked.

## Task Completion Marking

- Mark completed tasks as `[X]` in `tasks.md`.
- Ensure the tasks file remains consistent and readable.

## Completion Validation

- Confirm all required tasks are completed.
- Validate alignment with the original specification.
- Ensure tests pass and coverage meets requirements.
- Confirm implementation matches the technical plan.
- Produce a final summary of completed work.

# Output Expectations

The agent must produce:

- Checklist status table
- Implementation progress updates
- Error messages with context
- Final completion summary
