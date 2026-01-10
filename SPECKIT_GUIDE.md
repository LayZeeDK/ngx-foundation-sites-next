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

Use the custom `/analyze-brief` slash command (agent defined in `.github/agents/analyze-brief.agent.md`):

```
/analyze-brief
```

The agent automatically includes current feature's `spec.md`, `plan.md`, `tasks.md`.

Optionally attach implementation files for verification:

```
/analyze-brief @packages/ngx-foundation-sites/src/lib/accordion/accordion.ts @packages/ngx-foundation-sites/src/lib/accordion/accordion.html
```

This:

- Auto-includes current feature's spec/plan/tasks from `specs/` directory
- Follows structured 6-step validation workflow
- Scores each gap on evidence quality (0-10 scale)
- Removes false positives via blocking validation checks
- Writes complete report to `gap-analysis-report.md` (bypasses GPT-4.1's summarization behavior)

**Output**: Agent writes structured report to `gap-analysis-report.md` with:
- Validated gaps (each with evidence, validation score, priority, fix)
- False positives removed
- Summary statistics
- Methodology notes

**Alternative (if `/analyze-brief` unavailable)**: Manually copy the instructions from `.github/agents/analyze-brief.agent.md` and attach spec/plan/tasks/implementation files.

2. **Sonnet 4.5 analyze (do the reasoning):**

Attach the generated `gap-analysis-report.md` file (and only the most critical excerpts, if needed) and run:

```text
/speckit.analyze

Use the attached gap-analysis-report.md as the primary input. Validate each claimed gap against source artifacts (spec.md, plan.md, tasks.md, contracts/).

Your goal: Create remediation documentation that prevents future `/analyze-brief` runs from re-flagging these gaps as new issues.

## Validation Methodology

For each claimed gap:
1. **Verify the gap exists**: Read spec.md for FR-XXX requirements, tasks.md for task IDs, contracts/ for API definitions
2. **Search implementation**: Use Grep/Read to confirm "NOT FOUND" or "FOUND at line X"
3. **Build evidence chain**: FR-XXX (spec.md:line) → Task ID (tasks.md:line) → Contract (contracts/:line) → Implementation status
4. **Score confidence**: 0-10 scale based on evidence quality (10 = exact line numbers + contract verified, 6 = indirect references only)
5. **Assess impact**: Why does this gap matter? (breaks constitutional requirement, limits accessibility, prevents migration, etc.)
6. **Identify smallest fix**: Implementation code change, spec clarification, or task documentation update?

## Deliverables

Create these documents in `specs/<feature>/`:

### 1. GAPS_REMEDIATION.md (comprehensive tracking)
- **Purpose**: Single source of truth for `/analyze-brief` to check before flagging gaps
- **Structure per gap**:
  - Status: NOT IMPLEMENTED | PARTIAL | TRACKED AS T###
  - Validation Score: N/10
  - Evidence: Exact spec FR-XXX, task IDs, contract locations, implementation search results
  - Impact: What breaks without this?
  - Fix: Code snippet or spec update with exact file paths
  - Estimated Time: X minutes
  - Violates: List all FR-XXX, CA-XXX, AR-XXX requirements
- **Include**: False positives section explaining why claimed gaps are actually working as designed
- **Include**: Validation methodology notes for transparency

### 2. REMEDIATION_CHECKLIST.md (implementation guide)
- **Purpose**: Step-by-step developer checklist with exact code snippets
- **Structure per gap**:
  - Checkbox items for each implementation step
  - Before/after code examples
  - Unit test examples
  - Verification criteria
  - Post-remediation validation steps
- **Include**: Breaking change documentation where applicable
- **Include**: Total estimated time vs actual time tracking

### 3. Update Existing Spec Artifacts
- **spec.md**: Add section referencing GAPS_REMEDIATION.md with concise gap summary
- **plan.md**: Update Known Implementation Gaps section to reference GAPS_REMEDIATION.md
- **tasks.md**: Add inline warnings to specific tasks (e.g., T021 ⚠️ **NAMING GAP**: See GAPS_REMEDIATION.md GAP-3)
- **Original gap-analysis-report.md**: Add "SUPERSEDED" notice at top pointing to GAPS_REMEDIATION.md

## False Positive Analysis

For each claimed gap that's NOT actually a gap:
- **Explain why**: "Working as designed per spec.md:line X"
- **Cite evidence**: Goals/Non-Goals section, constitutional requirements, architectural decisions
- **Document in "Not Gaps" section**: Prevents re-flagging by future analysis

## Commit Strategy

Format commits in logical increments:
1. `docs(feature): add validated gap analysis with remediation tracker` (GAPS_REMEDIATION.md)
2. `docs(feature): add detailed remediation implementation checklist` (REMEDIATION_CHECKLIST.md)
3. `docs(feature): update spec/plan/tasks with gap references` (spec.md, plan.md, tasks.md updates)
4. `docs(feature): mark gap analysis report as superseded` (gap-analysis-report.md update)

Use conventional commit format with Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

## Output Format

Deliver:
- ✅ **Validated Gaps** (P0/P1/P2 prioritized with evidence chains, exact file:line pointers, fix estimates)
- ❌ **False Positives** (claimed gaps that are working as designed with citations)
- 📋 **Two new documents** (GAPS_REMEDIATION.md + REMEDIATION_CHECKLIST.md)
- 📝 **Updated spec artifacts** (spec.md, plan.md, tasks.md with cross-references)
- 💾 **Git commits** (4 logical increments with conventional commit messages)

## Success Criteria

Future `/analyze-brief` runs should:
- Find "NOT IMPLEMENTED - TRACKED" markers instead of discovering "new" gaps
- Reference GAPS_REMEDIATION.md for detailed tracking
- Not re-flag false positives documented in "Not Gaps" section
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
