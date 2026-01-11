---
name: spec.clarify
description: Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.
agent: spec.clarify
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

Guide the user through a structured clarification process to identify missing, ambiguous, or underspecified requirements in the current feature spec. Ask targeted questions, interpret the answers, and prepare a refinement summary.

## Execution Steps

1. **Initialize Context**  
   Run the prerequisite script:  
   `./.specify/scripts/powershell/check-prerequisites.ps1 -Json`  
   Extract `FEATURE_DIR` and available documents.  
   All paths must be absolute.

2. **Load Feature Artifacts**  
   From `FEATURE_DIR`, load minimal necessary portions of:
   - `spec.md`
   - `plan.md` (if present)
   - `tasks.md` (if present)  
     Use progressive disclosure and avoid full-file dumps.

3. **Generate Clarification Questions**
   - Extract signals from user input and artifacts
   - Cluster signals into focus areas
   - Generate up to three initial questions
   - Skip questions already answered
   - Use option tables when appropriate
   - If scenario classes remain unclear, ask up to two follow-ups (max total 5)

4. **Interpret Answers**  
   Combine `$ARGUMENTS` and user responses to determine:
   - Missing requirements
   - Ambiguous requirements
   - Conflicting requirements
   - Missing scenario classes
   - Missing acceptance criteria
   - Missing non-functional requirements

5. **Produce Clarification Summary**  
   Output a structured summary containing:
   - What was clarified
   - What remains ambiguous
   - Recommended spec updates
   - Any required next steps

6. **Offer Handoff**  
   Present the option to continue with the technical plan using the handoff defined in Frontmatter.
