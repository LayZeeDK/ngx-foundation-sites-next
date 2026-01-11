---
name: spec.checklist
description: Generate a requirements‑quality checklist (“Unit Tests for English”) for the current feature.
agent: spec.checklist
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding.

## Task

Generate a **requirements‑quality checklist** for the current feature. The checklist must validate:

- Completeness
- Clarity
- Consistency
- Measurability
- Scenario & edge‑case coverage
- Non‑functional requirements
- Dependencies, assumptions, ambiguities, conflicts

This checklist evaluates the _quality of the written requirements_, not implementation behavior.

## Execution Steps

1. **Setup**  
   Run:  
   `./.specify/scripts/powershell/check-prerequisites.ps1 -Json`  
   Parse `FEATURE_DIR` and `AVAILABLE_DOCS`.  
   All paths must be absolute.

2. **Clarify Intent**  
   Generate up to three contextual clarifying questions based on user input and feature artifacts.  
   Skip questions already answered.  
   Use defaults if interaction is not possible.

3. **Understand User Request**  
   Combine `$ARGUMENTS` and clarifying answers to determine:
   - Checklist theme (e.g., UX, API, security)
   - Must‑have items
   - Focus areas
   - Depth and audience

4. **Load Feature Context**  
   From `FEATURE_DIR`, load minimal necessary portions of:
   - `spec.md`
   - `plan.md` (if present)
   - `tasks.md` (if present)

5. **Generate Checklist**
   - Create `FEATURE_DIR/checklists/` if missing
   - Choose short domain filename (e.g., `ux.md`, `api.md`)
   - Append if file exists
   - Number items starting at CHK001
   - Group items by requirement‑quality categories
   - Ensure ≥80% traceability references
   - Apply consolidation rules

6. **Structure Reference**  
   Use `.specify/templates/checklist-template.md` if available.  
   Otherwise use fallback structure with H1 title, meta, and category sections.

7. **Report**  
   Output:
   - Full path to created checklist
   - Item count
   - Focus areas
   - Depth level
   - Actor/timing
   - User‑specified must‑have items
