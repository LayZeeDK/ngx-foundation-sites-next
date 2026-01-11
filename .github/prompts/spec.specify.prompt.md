---
name: spec.specify
description: Execute the specification workflow to generate or update the feature specification.
agent: spec.specify
handoffs:
  - label: Build Technical Plan
    agent: spec.plan
    prompt: Create a plan for the spec. I am building with...
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding.

## Task

Generate or update the feature specification using the project constitution, user requirements, and any relevant context files.

## Execution Steps

1. **Initialize Context**  
   Run:  
   `./.specify/scripts/powershell/setup-spec.ps1 -Json`  
   Extract:
   - `FEATURE_DIR`
   - `FEATURE_SPEC`
   - `CONSTITUTION`  
     All paths must be absolute.

2. **Load Required Artifacts**
   - Read `FEATURE_SPEC` (existing spec if present)
   - Read `.specify/memory/constitution.md`
   - Load any supporting context (plan, tasks, research) if available

3. **Interpret User Input**
   - Extract functional requirements
   - Extract non‑functional requirements
   - Identify missing acceptance criteria
   - Identify ambiguous or conflicting requirements
   - Identify missing scenario classes

4. **Apply Constitution Rules**
   - Populate constitution‑mandated sections
   - Validate MUST/SHOULD principles
   - Flag violations and require justification

5. **Generate Specification**  
   Produce a structured spec including:
   - Overview / Context
   - Functional Requirements
   - Non‑Functional Requirements
   - User Stories
   - Acceptance Criteria
   - Edge Cases
   - Out‑of‑Scope items
   - Dependencies & Assumptions

6. **Validation**
   - Ensure all requirements are testable
   - Ensure acceptance criteria are measurable
   - Ensure scenario classes are complete or explicitly excluded
   - Ensure no vague language remains

7. **Write Output**  
   Overwrite `FEATURE_SPEC` with the updated specification.  
   Provide a summary of:
   - Added sections
   - Updated sections
   - Remaining ambiguities
   - Recommended next steps

## Completion

After generating the specification, offer the user the option to continue with the technical plan using the handoff defined above.
