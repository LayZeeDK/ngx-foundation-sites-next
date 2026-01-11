---
name: spec.constitution
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
agent: spec.constitution
handoffs:
  - label: Build Specification
    agent: spec.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding.

## Task

Update the project constitution at `.specify/memory/constitution.md` by collecting or deriving values for all placeholder tokens, applying semantic versioning rules, and synchronizing dependent templates.

## Execution Steps

1. **Initialize Context**  
   Run the prerequisite script:  
   `./.specify/scripts/powershell/check-prerequisites.ps1 -Json`  
   Extract `FEATURE_DIR` and available documents.  
   All paths must be absolute.

2. **Load Constitution Template**
   - Read `.specify/memory/constitution.md`.
   - Identify all placeholder tokens of the form `[ALL_CAPS_IDENTIFIER]`.
   - Respect user‑specified principle counts if provided.

3. **Collect or Derive Placeholder Values**
   - Use values from `$ARGUMENTS` when available.
   - Otherwise infer from repository context.
   - Determine `RATIFICATION_DATE`, `LAST_AMENDED_DATE`, and version bump type.
   - If ambiguous, propose reasoning before finalizing.

4. **Draft Updated Constitution**
   - Replace all placeholders with concrete values.
   - Preserve heading hierarchy.
   - Ensure each principle includes name, rules, and rationale.
   - Ensure governance section includes amendment and versioning rules.
   - Justify any intentionally retained placeholders.

5. **Propagate Consistency Across Templates**  
   Validate and update (as needed):
   - `plan-template.md`
   - `spec-template.md`
   - `tasks-template.md`
   - All command templates
   - Runtime docs (README, quickstart, etc.)

6. **Generate Sync Impact Report**  
   Include:
   - Version change
   - Modified principles
   - Added/removed sections
   - Templates requiring updates (updated / pending)
   - Deferred TODOs

7. **Validate Final Output**  
   Ensure:
   - No unexplained bracket tokens
   - ISO‑formatted dates
   - Declarative, testable principles
   - Version line matches impact report

8. **Write Updated Constitution**  
   Overwrite `.specify/memory/constitution.md` with the final content.

9. **Produce Final Summary**  
   Output:
   - New version and rationale
   - Files requiring manual follow‑up
   - Suggested commit message
