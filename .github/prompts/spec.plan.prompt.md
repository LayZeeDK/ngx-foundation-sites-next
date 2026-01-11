---
name: spec.plan
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
agent: spec.plan
handoffs:
  - label: Create Tasks
    agent: spec.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: spec.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding.

## Task

Execute the implementation planning workflow using the plan template. Resolve unknowns, generate research tasks, produce design artifacts, and enforce constitution alignment.

## Execution Steps

1. **Setup**  
   Run:  
   `./.specify/scripts/powershell/setup-plan.ps1 -Json`  
   Extract:
   - `FEATURE_SPEC`
   - `IMPL_PLAN`
   - `SPECS_DIR`
   - `BRANCH`  
     All paths must be absolute.

2. **Load Context**
   - Read `FEATURE_SPEC`
   - Read `.specify/memory/constitution.md`
   - Load the copied `IMPL_PLAN` template

3. **Execute Plan Workflow**  
   Follow the structure in the plan template to:
   - Fill Technical Context (unknowns → `NEEDS CLARIFICATION`)
   - Populate Constitution Check
   - Evaluate gates (ERROR if unjustified violations)
   - **Phase 0**: Generate `research.md`
   - **Phase 1**: Generate `data-model.md`, `/contracts/`, `quickstart.md`
   - Update agent context via PowerShell script
   - Re-evaluate Constitution Check after design

4. **Stop and Report**  
   End after Phase 2 planning.  
   Report:
   - Branch
   - IMPL_PLAN path
   - Generated artifacts

## Phases

### Phase 0: Outline & Research

1. Extract unknowns from Technical Context:
   - Unknowns → research tasks
   - Dependencies → best practices tasks
   - Integrations → patterns tasks

2. Generate research tasks:

   ```
   For each unknown:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. Consolidate findings into `research.md`:
   - Decision
   - Rationale
   - Alternatives considered

**Output**: `research.md` with all unknowns resolved

### Phase 1: Design & Contracts

**Prerequisite:** `research.md` complete

1. Extract entities → `data-model.md`
2. Generate API contracts → `/contracts/`
3. Update agent context:  
   `./.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`

**Output**:

- `data-model.md`
- `/contracts/*`
- `quickstart.md`
- Updated agent context file

## Key Rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
