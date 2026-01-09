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

## Model Selection (Unified)

Use one simple rule: **pick the model based on the job** (reasoning vs. speed vs. long context vs. code-heavy), not based on which product you’re in.

- **Default for most Spec Kit work:** Sonnet-class (Sonnet 4.5)
- **Deep reasoning / finding problems:** Opus-class (Opus 4.5)
- **Fast/mechanical outputs:** Haiku-class (Haiku 4.5)
- **Very large context:** Sonnet 4.5 1M (**Claude Code-only**; GitHub Copilot alternatives: **GPT-4.1** or **Gemini 3 Pro**)
- **Code-heavy implementation:** Codex-class (GPT-5.1-Codex / Codex-Max in GitHub Copilot)

**GPT-4.1 note (GitHub Copilot):** GPT-4.1 is excellent for **zero-cost input gathering** (1M-context reading/summarizing large specs/code). For **reasoning-heavy** work like `/speckit.plan`, `/speckit.analyze`, and complex `/speckit.clarify`, use GPT-4.1 to load/condense context, then switch to a reasoning model (Sonnet 4.5 / Opus 4.5 / GPT-5.2).

### Recommended models by Spec Kit command

| Spec Kit command     | Claude Code                                                       | GitHub Copilot CLI                                                                     | Notes                                                                                          |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/speckit.specify`   | Sonnet 4.5 → Opus 4.5 if domain is complex                        | Sonnet 4.5 (or GPT-5.2) → Opus 4.5 if domain is complex                                | Capture nuance + requirements structure                                                        |
| `/speckit.clarify`   | Sonnet 4.5                                                        | Sonnet 4.5 (or GPT-5.2)                                                                | Fast iteration; ask the right questions                                                        |
| `/speckit.plan`      | Opus 4.5 → **Sonnet 4.5 1M** if artifacts are huge                | Opus 4.5 (or GPT-5.2) → **GPT-4.1 / Gemini 3 Pro** if artifacts are huge               | For huge _code + session history_ in GitHub Copilot, prefer **GPT-5.1-Codex-Max (compaction)** |
| `/speckit.checklist` | Sonnet 4.5                                                        | Sonnet 4.5 (or GPT-5.1)                                                                | Structured generation with moderate reasoning                                                  |
| `/speckit.tasks`     | Haiku 4.5 for speed → Sonnet 4.5 if it keeps missing dependencies | Haiku 4.5 / GPT-5.1-Codex-Mini for speed → Sonnet 4.5 if it keeps missing dependencies | Mostly mechanical breakdown from plan                                                          |
| `/speckit.analyze`   | Opus 4.5 → **Sonnet 4.5 1M** if artifacts are huge                | Opus 4.5 (or GPT-5.2) → **GPT-4.1 / Gemini 3 Pro** if artifacts are huge               | For huge _code + session history_ in GitHub Copilot, prefer **GPT-5.1-Codex-Max (compaction)** |
| `/speckit.implement` | Sonnet 4.5 (→ Opus 4.5 for risky refactors)                       | GPT-5.1-Codex → Codex-Max for hardest refactors; otherwise Sonnet 4.5                  | Use code-specialized models for multi-file changes                                             |

### Budget-Conscious Approach

| Spec Kit command     | Claude Code                        | GitHub Copilot CLI                             |
| -------------------- | ---------------------------------- | ---------------------------------------------- |
| `/speckit.specify`   | Haiku 4.5                          | Haiku 4.5                                      |
| `/speckit.clarify`   | Haiku 4.5                          | Haiku 4.5                                      |
| `/speckit.plan`      | Sonnet 4.5                         | Sonnet 4.5                                     |
| `/speckit.checklist` | Haiku 4.5                          | Haiku 4.5                                      |
| `/speckit.tasks`     | Haiku 4.5                          | Haiku 4.5 or GPT-5.1-Codex-Mini                |
| `/speckit.analyze`   | Sonnet 4.5                         | GPT-4.1 (summarize) → Sonnet 4.5               |
| `/speckit.implement` | Haiku 4.5 → Sonnet 4.5 when needed | GPT-5.1-Codex-Mini → GPT-5.1-Codex when needed |

> Trade-off: expect more iterations; upgrade to Sonnet/Opus (or Codex/Codex-Max) when you hit ambiguity or cross-cutting changes.

**Example: GPT-4.1 (brief) → Sonnet 4.5 (`/speckit.analyze`)**

1. **GPT-4.1 brief (read everything, compress hard):**

Attach your artifacts (e.g. `@specs\###-feature\spec.md`, `@specs\###-feature\plan.md`, `@specs\###-feature\tasks.md`, plus any key code files) and prompt:

```text
# CROSS-ARTIFACT ANALYSIS BRIEF

Analyze attached artifacts for implementation gaps. Follow steps sequentially.

## STEP 1: Extract Requirements (scan spec.md)

For each requirement found, record:
- REQ-[ID]: [description]
- Mandatory: [YES if "MUST"/"shall"/FR-XXX, NO if "MAY"/"optional"]
- Location: spec.md:[line]

List 15-20 requirements. Stop before analyzing.

## STEP 2: Check Implementation (one requirement at a time)

For EACH requirement:

1. Does spec say "opt-in", "CSS-only", or "handled by [framework]"?
   - YES → Mark "Not a gap (intentional design)"
   - NO → Continue

2. Search code for [3-5 keywords from requirement]
   - Found in: [file:line] or "NOT FOUND"

3. If delegated to framework (e.g., @angular/aria):
   - Spec says "prefer @angular/aria" → Mark "✅ Delegated (correct)"
   - Spec silent on delegation → Mark "⚠️ Verify acceptable"

4. Status:
   - ✅ Fully implemented [file:line]
   - ⚠️ Partially implemented (specify missing parts)
   - ❌ Not found
   - 🔀 Delegated to [framework]

Complete for ALL requirements before Step 3.

## STEP 3: Gap List (only ❌ or ⚠️ items)

Format:
```

GAP-[N]: [REQ-ID] - [one sentence]
Evidence:

- Spec: [FR-XXX or line number with exact quote]
- Search: [keywords used]
- Files checked: [list]
- Status: [not found / partially implemented + details]
  Priority: [P0 if "MUST", P1 if "should", P2 otherwise]

```

List max 10 gaps (highest priority first).

## STEP 4: Anti-False-Positive Check

For EACH gap, verify:
- □ Checked if spec says "CSS-only" / "opt-in" / "framework-handled"?
- □ Searched for @angular/aria / @angular/cdk delegation?
- □ Confirmed this is "MUST" (not "MAY")?
- □ Checked contracts/ folder?
- □ Checked test/story files?

Any unchecked → mark "⚠️ LOW CONFIDENCE"

## FORBIDDEN (never report as gaps):
- ❌ "Animation hooks missing" when spec says "CSS-only"
- ❌ "ARIA incomplete" when code uses @angular/aria directives
- ❌ "Custom content partial" without citing missing specific slot
- ❌ "Test coverage gaps" without citing spec-required test cases
- ❌ "SSR not implemented" when afterNextRender() exists

## FINAL OUTPUT

### 1) Executive Summary (10 bullets)
- Bullet 1: "X% complete based on Y/Z requirements implemented"
- Bullets 2-10: P0/P1 gaps only

### 2) Requirements Inventory
[All requirements from Step 2 with status]

### 3) Top 10 Gaps
[Gaps from Step 3 with HIGH/MEDIUM confidence after Step 4]

### 4) Open Questions
Only questions where:
- Searched spec.md for [keywords]
- Answer not in [sections checked]

EXAMPLE GOOD GAP:
```

GAP-3: REQ-API-002 - Foundation outputs missing
Evidence:

- Spec: FR-076 (L345) "MUST emit (down)/(up) events"
- Search: "output", "emit", "down", "up"
- Files: accordion.ts, accordion-item-def.ts
- Status: No output() calls found
  Priority: P0

```

Do NOT propose fixes yet; just summarize with evidence.
```

2. **Sonnet 4.5 analyze (do the reasoning):**

Attach the generated brief (and only the most critical excerpts, if needed) and run:

```text
/speckit.analyze

Use the attached GPT-4.1 analysis brief as the primary input. Validate each claimed gap against the source artifacts.

Deliver:
- A prioritized list of real inconsistencies/gaps (with exact file + heading/line pointers)
- For each gap: why it matters, and the smallest fix (spec vs plan vs tasks)
- Call out any “false positives” from the brief and why they’re false
```

**Example: Budget-Conscious Implementation (cheap model → capable model when needed) (`/speckit.implement`)**

Use a cheap model for mechanical execution, escalating to a more capable model only when hitting blockers:

- **Claude Code:** Haiku 4.5 (0.33x) → Sonnet 4.5 (1x)
- **GitHub Copilot CLI:** GPT-5.1-Codex-Mini (0.33x) → GPT-5.1-Codex (1x)

1. **Step 1: Cheap model (mechanical execution)**

Attach `@specs\###-feature\tasks.md` (and only the minimum needed code files) and prompt:

```text
/speckit.implement

Rules:
- Execute tasks strictly in order from tasks.md.
- Prefer the smallest possible diffs; no refactors unless a task explicitly requires it.
- If you need to change public APIs, stop and ask first.
- After each group of changes, run the relevant Nx command (e.g. `npx nx test <project>` or `npx nx lint <project>`) and include the command + outcome.

If you encounter ambiguity, missing info, or a failing test you can't confidently fix, STOP and output:
- the exact blocker
- the 1–2 files/lines involved
- what decision is required
```

2. **Step 2: Capable model (unblock, reason, continue)**

Switch models, attach the blocker output + the relevant files, and prompt:

```text
Continue `/speckit.implement` from the current state.

First: resolve the blocker (explain the decision briefly, cite spec/plan/tasks evidence).
Then: implement the minimal fix and re-run the failing command(s) until green.
Finally: return to executing the remaining tasks in tasks.md.
```

### Model cheat sheet (availability, context, cost)

> Claude Code pricing is relative (Opus > Sonnet > Haiku). GitHub Copilot multipliers below are GitHub Copilot CLI “premium request” cost units.

| Model                  | Available in                    | Context            | GitHub Copilot cost | Use in Spec Kit                                                                                                        |
| ---------------------- | ------------------------------- | ------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Sonnet 4.5             | Claude Code, GitHub Copilot CLI | 200K               | 1x                  | Default for specify/clarify/checklist; also good for most Angular implementation                                       |
| Opus 4.5               | Claude Code, GitHub Copilot CLI | 200K               | 3x                  | Plan/analyze when you need deep reasoning and edge-case detection                                                      |
| Haiku 4.5              | Claude Code, GitHub Copilot CLI | 200K               | 0.33x               | Tasks + mechanical edits/boilerplate                                                                                   |
| Sonnet 4.5 1M          | Claude Code only                | 1M                 | —                   | Huge artifacts/monorepos; **GitHub Copilot alternatives:** GPT-4.1 or Gemini 3 Pro                                     |
| GPT-5.2                | GitHub Copilot CLI              | 400K               | 1x                  | Strong plan/analyze alternative if you prefer GPT-style reasoning                                                      |
| GPT-5.1-Codex          | GitHub Copilot CLI              | 400K               | 1x                  | Best default for `/speckit.implement` in code-heavy sessions                                                           |
| GPT-5.1-Codex-Max      | GitHub Copilot CLI              | 400K+ (compaction) | 1x                  | Hardest refactors + multi-hour sessions; compaction preserves key details as context grows                             |
| GPT-5.1-Codex-Mini     | GitHub Copilot CLI              | 400K               | 0.33x               | Cheap/faster tasks + small implementation chores                                                                       |
| GPT-4.1                | GitHub Copilot CLI              | 1M                 | 0x                  | Cheap long-context reading/summarization for input gathering; switch to Sonnet/Opus/GPT-5.2 for plan/analyze reasoning |
| Gemini 3 Pro (Preview) | GitHub Copilot CLI              | 1M                 | 1x                  | Long-context planning/reading; UI/styling-heavy iterations                                                             |

**Codex-Max compaction (400K+ effective context):** when context approaches capacity, Codex-Max compresses less relevant info while preserving critical details (current task, key code, recent context). Benefits: better for large projects / multi-hour sessions; tends to use ~30% fewer reasoning tokens than standard Codex. Trade-off: slightly slower due to compression overhead.

### Switching models

Use `/model <name>` (GitHub Copilot CLI or Claude Code) to switch. **Sonnet 4.5 1M is Claude Code-only**; in GitHub Copilot, use **GPT-4.1 / Gemini 3 Pro** (or Codex-Max compaction) when you need very large effective context. Switching to a **smaller context** model can truncate history; switching to a **larger context** model is always safe.

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

# Update GitHub Copilot agent context from plan.md
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

### In your agent (recommended)

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
