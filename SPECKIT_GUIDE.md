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

## Claude Code Model Selection

Different Spec Kit commands benefit from different Claude models. Use this guide to optimize for quality, speed, and cost.

### Model Characteristics

| Model             | Context | Reasoning                 | Speed   | Cost        |
| ----------------- | ------- | ------------------------- | ------- | ----------- |
| **Opus 4.5**      | 200K    | Strongest                 | Slowest | Highest     |
| **Sonnet 4.5**    | 200K    | Very good                 | Fast    | Medium      |
| **Sonnet 4.5 1M** | 1M      | Very good                 | Fast    | Medium-High |
| **Haiku**         | 200K    | Good for structured tasks | Fastest | Lowest      |

### Recommended Models by Command

| Command              | Model          | Rationale                                          |
| -------------------- | -------------- | -------------------------------------------------- |
| `/speckit.clarify`   | Sonnet         | Interactive; benefits from speed + good reasoning  |
| `/speckit.specify`   | Sonnet or Opus | Simple specs → Sonnet; complex domains → Opus      |
| `/speckit.plan`      | **Opus**       | Architectural decisions require deepest reasoning  |
| `/speckit.tasks`     | Haiku          | Mostly mechanical breakdown from existing plan     |
| `/speckit.checklist` | Sonnet         | Structured generation with moderate reasoning      |
| `/speckit.analyze`   | **Opus**       | Cross-artifact consistency needs nuanced reasoning |
| `/speckit.implement` | Mixed          | Simple tasks → Haiku; complex refactors → Opus     |

> **When to use Sonnet 4.5 1M:** Choose over Sonnet 4.5 when context exceeds ~150K tokens. Choose over Opus when you need large context with good (not deepest) reasoning—it's faster and cheaper than Opus while handling 5× more context.

### When to Use Each Model

**Opus 4.5** — Best for "finding problems" and complex reasoning:

- Detecting conflicts between spec and plan
- Constitution alignment checking (needs nuance)
- Ambiguity detection and architectural decisions
- Critical projects where missing edge cases has significant consequences

**Sonnet 4.5** — Best general-purpose model for most work:

- Interactive workflows (`/speckit.clarify`) where speed matters
- Well-defined specs with clear requirements
- Iterative development with multiple quick passes
- Balance of reasoning quality and response speed

**Sonnet 4.5 1M** — Choose when context size is the limiting factor:

- **Over Sonnet 4.5:** Combined artifacts exceed ~150K tokens
- **Over Opus:** Need large context + good reasoning, but faster/cheaper than Opus
- **Over Haiku:** Need large context for any task (Haiku caps at 200K)

Ideal scenarios:

- Large monorepos requiring many reference files loaded simultaneously
- Cross-referencing multiple feature specs or extensive external docs
- Long-running sessions where conversation history accumulates
- Analyzing or refactoring large codebases in a single pass

**Haiku** — Best for "following instructions" on structured tasks:

- Generating task breakdowns from a solid plan
- Simple file scaffolding during implementation
- Boilerplate code generation
- Quick formatting or restructuring of existing specs

**Avoid Haiku for:** Analysis, ambiguity detection, and consistency checking—it tends to take things at face value rather than questioning assumptions.

### Decision Flowchart

```
Is your total context > 150K tokens?
  └─ Yes → Sonnet 4.5 1M (only model that fits)
  └─ No ↓

Will context grow large during the session? (long impl, many files)
  └─ Yes → Sonnet 4.5 1M (prevents mid-session truncation)
  └─ No ↓

Does the task require finding problems or subtle reasoning?
  └─ Yes → Opus 4.5 (analyze, plan, complex specify)
  └─ No ↓

Is the task mostly mechanical/structured?
  └─ Yes → Haiku (tasks, simple implement)
  └─ No → Sonnet 4.5 (clarify, checklist, moderate specify)
```

**Tip:** When in doubt between Sonnet 4.5 and Sonnet 4.5 1M, choose 1M for `/speckit.implement` sessions—implementation often loads many files and accumulates context quickly.

### Switching Models Mid-Session

You can change models during a session using the `/model` command:

```bash
/model sonnet      # Switch to Sonnet 4.5 (200K context)
/model sonnet-1m   # Switch to Sonnet 4.5 1M (1M context)
/model opus        # Switch to Opus 4.5 (200K context)
/model haiku       # Switch to Haiku (200K context)
```

**Context behavior:** Conversation history is preserved and sent to the new model, but it will be **truncated** if it exceeds the new model's context window.

| Switch Direction                              | Safety  | Notes                                       |
| --------------------------------------------- | ------- | ------------------------------------------- |
| Any → Sonnet 1M                               | ✅ Safe | Larger context always fits existing history |
| Between 200K models (Opus ↔ Sonnet ↔ Haiku) | ✅ Safe | Same context size                           |
| Sonnet 1M → Any 200K model                    | ⚠️ Risk | History truncated if > 200K tokens          |

**Recommendations:**

- **Start with your peak-context model** — If you'll need 1M later, start with it
- **Only switch "upward"** — Switching to larger context (→ 1M) is always safe
- **Avoid switching during `/speckit.implement`** — Implementation sessions accumulate context quickly
- **Safe to switch after analysis** — Context is usually small after `/speckit.analyze`; switching Opus → Haiku for `/speckit.tasks` is fine

## Using the `specify` CLI (PowerShell)

In this repo, `specify` is primarily used to **manage the `.specify\` scaffolding** (templates/scripts) and to **check prerequisites**. Feature work is typically driven by the PowerShell scripts under `.specify\scripts\powershell\`.

### Common commands

```powershell
# Verify prerequisites
specify check

# Scaffold/upgrade the .specify folder (use with care; may overwrite scaffold files)
specify init --here --ai copilot --script ps --force
```

### Selecting the active feature

The `.specify` scripts resolve the current feature from either:

- Your **current git branch name**, or
- `$env:SPECIFY_FEATURE` (explicit override)

Example:

```powershell
$env:SPECIFY_FEATURE = '001-button'
```

### Feature workflow (repo scripts)

```powershell
# Create a new feature folder under specs\ and set SPECIFY_FEATURE for this session
.\.specify\scripts\powershell\create-new-feature.ps1 "Button component" -ShortName "button"

# Create/refresh plan.md for the current feature
.\.specify\scripts\powershell\setup-plan.ps1

# Update Copilot agent context from plan.md
.\.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot
```

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

Attach the checklist file (e.g. `@specs\001-button\checklists\requirements-quality.md`) then prompt your agent to:

1. Ask your agent to go **CHK001 → end** and for each item:
   - Cite evidence from `spec.md`, `plan.md`, and `contracts\*.md`
   - Mark `[x]` + add a 1-line evidence note, or leave `[ ]` + add the missing info needed
2. When the checklist reveals ambiguity, run `/speckit.clarify` to fix the spec, then re-run the checklist pass.
3. Optionally run `/speckit.analyze` after updates to confirm cross-artifact consistency before marking items complete.

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
