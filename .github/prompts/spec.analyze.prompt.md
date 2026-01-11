---
name: spec.analyze
description: Perform a cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md.
agent: spec.analyze
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding (if not empty).

## Task

Perform a **non-destructive**, **read‑only** analysis of the three core Spec Kit artifacts:

- `spec.md`
- `plan.md`
- `tasks.md`

This command must only run after `/spec.tasks` has successfully produced a complete `tasks.md`.

## Execution Steps

### 1. Initialize Analysis Context

Run:

```
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse JSON for:

- `FEATURE_DIR`
- `AVAILABLE_DOCS`

Derive absolute paths:

- `SPEC = FEATURE_DIR/spec.md`
- `PLAN = FEATURE_DIR/plan.md`
- `TASKS = FEATURE_DIR/tasks.md`

Abort with an error if any required file is missing.

### 2. Load Artifacts (Progressive Disclosure)

Load only the minimal necessary sections:

**From spec.md:**

- Overview/Context
- Functional Requirements
- Non-Functional Requirements
- User Stories
- Edge Cases

**From plan.md:**

- Architecture/stack choices
- Data Model references
- Phases
- Technical constraints

**From tasks.md:**

- Task IDs
- Descriptions
- Phase grouping
- Parallel markers `[P]`
- Referenced file paths

**From constitution:**

- `.specify/memory/constitution.md`

### 3. Build Semantic Models

Construct internal representations:

- Requirements inventory
- User story/action inventory
- Task coverage mapping
- Constitution rule set

### 4. Run Detection Passes

Identify:

- Duplication
- Ambiguity
- Underspecification
- Constitution alignment issues
- Coverage gaps
- Inconsistencies

Limit to 50 findings; summarize overflow.

### 5. Assign Severity

Use CRITICAL / HIGH / MEDIUM / LOW heuristics.

### 6. Produce Analysis Report

Output a Markdown report containing:

- Findings table
- Coverage summary
- Constitution alignment issues
- Unmapped tasks
- Metrics

### 7. Provide Next Actions

Recommend next steps based on severity distribution.

### 8. Offer Remediation

Ask:

> “Would you like me to suggest concrete remediation edits for the top N issues?”

Do not apply changes automatically.
