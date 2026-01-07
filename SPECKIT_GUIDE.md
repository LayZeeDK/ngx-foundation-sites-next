# Spec Kit Guide

Spec Kit is a specification-driven workflow for working with AI agents: establish project principles, write a feature spec, plan the implementation, generate tasks, then implement with high confidence.

- Spec Kit website: https://speckit.org/
- Installation / getting started guide: https://github.com/github/spec-kit?tab=readme-ov-file#-get-started

## Agent Folder Security

Some agents may store credentials, auth tokens, or other identifying and private artifacts in the agent folder within your project.

- Consider adding `.github/` (or parts of it) to `.gitignore` to prevent accidental credential leakage.

## Next Steps

We have already established project principles using the `/speckit.constitution` command.

Start using slash commands with your AI agent:

1. `/speckit.specify` — Create baseline specification by describing what you want to build. Focus on the **what** and **why**, not the tech stack.
1. `/speckit.clarify` (optional) — Ask structured questions to de-risk ambiguous areas before planning (run before `/speckit.plan` if used)
1. `/speckit.plan` — Create implementation plan and provide your tech stack and architecture choices
1. `/speckit.checklist` (optional) — Generate quality checklists to validate requirements completeness, clarity, and consistency (after `/speckit.plan`)
1. `/speckit.tasks` — Generate an actionable task list from the implementation plan
1. `/speckit.analyze` (optional) — Cross-artifact consistency and alignment report (after `/speckit.tasks`, before `/speckit.implement`)
1. `/speckit.implement` — Execute all tasks and build the feature according to the plan

## Specs Artifact Structure (Recommended)

Use one canonical folder per feature using a stable ID/slug:

```text
specs/
  ###-feature-slug/
    spec.md
    plan.md
    tasks.md
    README.md              (optional)
    API_REFERENCE.md       (optional)
    VALIDATION_RESULTS.md  (optional)
    research.md            (optional)
    data-model.md          (optional)
    quickstart.md          (optional)
    contracts/             (optional)
    checklists/            (optional)
```

### Artifact Purpose

- **spec.md**: “what/why” — user stories, requirements, acceptance criteria.
- **plan.md**: “how” — architecture/tech decisions, mapping requirements to implementation.
- **tasks.md**: executable checklist derived from plan (often dependency-ordered / parallelizable).
- **contracts/**: interfaces/agreements (API/component contracts, CSS contracts, etc.).
- **checklists/**: quality gates (requirements quality, consistency checks). Treat as a review harness.
- **VALIDATION_RESULTS.md**: evidence that the requirements were met (tests run, outcomes, gaps).

## Using a Checklist File (e.g., `requirements-quality.md`)

Spec Kit doesn’t have a built-in “execute this checklist file” command. The intended workflow is to use the checklist as a **review harness** and have your agent **update the checklist** with evidence.

### In Copilot CLI (recommended)

1. Attach the checklist file (e.g. `@specs\001-button\checklists\requirements-quality.md`).
2. Ask your agent to go **CHK001 → end** and for each item:
   - Cite evidence from `specs\001-button\spec.md`, `plan.md`, and `contracts\*.md`
   - Mark `[x]` + add a 1-line evidence note, or leave `[ ]` + add the missing info needed
3. When the checklist reveals ambiguity, run `/speckit.clarify` to fix the spec, then re-run the checklist pass.
4. Optionally run `/speckit.analyze` after updates to confirm cross-artifact consistency before marking items complete.

### With `specify` CLI

There isn’t a “checklist runner” here either; use `specify` to keep feature context consistent, then do the same “update-the-checklist-with-evidence” pass via your agent.

- Set the feature context (example):
  - `SPECIFY_FEATURE=001-button`

### What the checklist is (and isn’t)

- `requirements-quality.md` evaluates the **documents** (`spec.md` / `plan.md` / `contracts/`), not implementation tasks.
- `/speckit.analyze` helps validate **alignment** across artifacts (spec ↔ plan ↔ tasks).
- Neither must block implementation unless you choose to enforce them as gates.

Typical flow:

1. `/speckit.plan`
2. `/speckit.checklist` (generate)
3. Fill the checklist with evidence; use `/speckit.clarify` if needed
4. `/speckit.tasks`
5. `/speckit.analyze` (catch cross-artifact drift)
6. `/speckit.implement`

## What to Keep After Merge

Recommended to keep the canonical `specs/###-feature-slug/` folder in `main` for traceability. If you want a leaner `main`, consider archiving (not deleting) planning-only artifacts like `research.md`, `data-model.md`, and `checklists/` once the feature is stable.
