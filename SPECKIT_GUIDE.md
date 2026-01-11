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
   - **Cost-optimized**: `/specify-haiku-4-5` (0.33x cost, 85-90% quality, 15-25s)
1. `/speckit.clarify` (optional) — Ask structured questions to de-risk ambiguous areas before planning (run before `/speckit.plan` if used)
   - **Cost-optimized**: `/clarify-haiku-4-5` (0.33x cost, 85-90% quality, 15-25s)
1. `/speckit.plan` — Create implementation plan and provide your tech stack and architecture choices
1. `/speckit.checklist` (optional) — Generate quality checklists to validate requirements completeness, clarity, and consistency (after `/speckit.plan`)
   - **Cost-optimized**: `/checklist-haiku-4-5` (0.33x cost, 90-95% quality, 10-15s)
1. `/speckit.tasks` — Generate an actionable task list from the implementation plan
   - **Cost-optimized**: `/tasks-haiku-4-5` (0.33x cost, 95%+ quality, 10-20s)
1. `/speckit.analyze` (optional) — Cross-artifact consistency and alignment report (after `/speckit.tasks`, before `/speckit.implement`)
1. `/speckit.taskstoissues` (optional) — Convert tasks.md to GitHub issues for project tracking
   - **Cost-optimized**: `/taskstoissues-gpt-5-mini` (0x cost, 95%+ quality, 10-20s) — GitHub Copilot only
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

| Spec Kit command       | Claude Code                                                       | GitHub Copilot CLI                                                                     | Notes                                                                                          |
| ---------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/speckit.specify`     | Sonnet 4.5 → Opus 4.5 if domain is complex                        | Sonnet 4.5 (or GPT-5.2) → Opus 4.5 if domain is complex                                | Capture nuance + requirements structure                                                        |
| `/specify-haiku-4-5`   | **Haiku 4.5** (0.33x cost, 15-25s)                                | **Haiku 4.5** (0.33x cost, 15-25s)                                                     | 85-90% quality; good for straightforward features                                              |
| `/speckit.clarify`     | Sonnet 4.5                                                        | Sonnet 4.5 (or GPT-5.2)                                                                | Fast iteration; ask the right questions                                                        |
| `/clarify-haiku-4-5`   | **Haiku 4.5** (0.33x cost, 15-25s)                                | **Haiku 4.5** (0.33x cost, 15-25s)                                                     | 85-90% quality; 10-category taxonomy scan                                                      |
| `/speckit.plan`        | Opus 4.5 → **Sonnet 4.5 1M** if artifacts are huge                | Opus 4.5 (or GPT-5.2) → **GPT-4.1 / Gemini 3 Pro** if artifacts are huge               | For huge _code + session history_ in GitHub Copilot, prefer **GPT-5.1-Codex-Max (compaction)** |
| `/speckit.checklist`   | Sonnet 4.5                                                        | Sonnet 4.5 (or GPT-5.1)                                                                | Structured generation with moderate reasoning                                                  |
| `/checklist-haiku-4-5` | **Haiku 4.5** (0.33x cost, 10-15s)                                | **Haiku 4.5** (0.33x cost, 10-15s)                                                     | 90-95% quality; mechanical validation                                                          |
| `/speckit.tasks`       | Haiku 4.5 for speed → Sonnet 4.5 if it keeps missing dependencies | Haiku 4.5 / GPT-5.1-Codex-Mini for speed → Sonnet 4.5 if it keeps missing dependencies | Mostly mechanical breakdown from plan                                                          |
| `/tasks-haiku-4-5`     | **Haiku 4.5** (0.33x cost, 10-20s)                                | **Haiku 4.5** (0.33x cost, 10-20s)                                                     | 95%+ quality; perfect for pattern-based task generation                                        |
| `/speckit.analyze`     | Opus 4.5 → **Sonnet 4.5 1M** if artifacts are huge                | Opus 4.5 (or GPT-5.2) → **GPT-4.1 / Gemini 3 Pro** if artifacts are huge               | For huge _code + session history_ in GitHub Copilot, prefer **GPT-5.1-Codex-Max (compaction)** |
| `/speckit.implement`   | Sonnet 4.5 (→ Opus 4.5 for risky refactors)                       | GPT-5.1-Codex → Codex-Max for hardest refactors; otherwise Sonnet 4.5                  | Use code-specialized models for multi-file changes                                             |

### Budget-Conscious Approach

Use Haiku-optimized commands for 66% cost savings with minimal quality loss:

| Spec Kit command       | Claude Code | GitHub Copilot CLI               | Quality vs Standard    |
| ---------------------- | ----------- | -------------------------------- | ---------------------- |
| `/specify-haiku-4-5`   | Haiku 4.5   | Haiku 4.5                        | 85-90%                 |
| `/clarify-haiku-4-5`   | Haiku 4.5   | Haiku 4.5                        | 85-90%                 |
| `/speckit.plan`        | Sonnet 4.5  | Sonnet 4.5                       | 100% (needs reasoning) |
| `/checklist-haiku-4-5` | Haiku 4.5   | Haiku 4.5                        | 90-95%                 |
| `/tasks-haiku-4-5`     | Haiku 4.5   | Haiku 4.5 or GPT-5.1-Codex-Mini  | 95%+                   |
| `/speckit.analyze`     | Sonnet 4.5  | GPT-4.1 (summarize) → Sonnet 4.5 | 100% (needs reasoning) |

**When to use Haiku-optimized commands:**

- ✅ **Mechanical tasks** (checklist, tasks) — 95%+ quality, 3× faster
- ✅ **Structured pattern matching** (clarify taxonomy scan) — 85-90% quality
- ✅ **Straightforward features** (specify simple components) — 85-90% quality
- ✅ **Budget is a priority** — 0.33x cost vs Sonnet

**When to stick with standard commands:**

- ⚠️ **Complex reasoning** (plan, analyze) — Needs Sonnet/Opus
- ⚠️ **Domain complexity** (medical, financial) — Use Opus for specify
- ⚠️ **First-time workflows** — Standard commands have proven track record

### Ultra-Budget Approach (Zero-Cost Where Possible)

**Haiku-optimized commands** for Claude Code + GitHub Copilot, **GPT-5 Mini commands** for GitHub Copilot only:

| Spec Kit command            | Claude Code | GitHub Copilot CLI                                                                        | Cost Savings                           |
| --------------------------- | ----------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| `/specify-haiku-4-5`        | Haiku 4.5   | Haiku 4.5                                                                                 | 0.33x                                  |
| `/clarify-haiku-4-5`        | Haiku 4.5   | Haiku 4.5                                                                                 | 0.33x                                  |
| `/speckit.plan`             | Sonnet 4.5  | Sonnet 4.5                                                                                | 1x                                     |
| `/checklist-haiku-4-5`      | Haiku 4.5   | Haiku 4.5                                                                                 | 0.33x                                  |
| `/tasks-haiku-4-5`          | Haiku 4.5   | Haiku 4.5 or **GPT-5 mini** (`/tasks-gpt-5-mini`) ⭐                                      | 0.33x (Haiku) / **0x** (GPT-5 Mini) ✅ |
| `/speckit.analyze`          | Sonnet 4.5  | GPT-4.1 → Sonnet 4.5                                                                      | 0x → 1x                                |
| `/taskstoissues-gpt-5-mini` | —           | **GPT-5 mini** ⭐                                                                         | **0x** ✅                              |
| `/analyze-brief`            | —           | **GPT-5 mini** (`/analyze-brief-gpt-5-mini`) ⭐ or **GPT-4.1** (`/analyze-brief-gpt-4-1`) | **0x** ✅                              |

**GPT-5 mini advantages**:

- ✅ **Zero cost** (0x multiplier)
- ✅ **Fast inference** (kernel fusion, tensor parallelism)
- ✅ **200K context** (same as Haiku 4.5)
- ✅ **Structured prompts** (CTCO framework, XML scaffolding)

**GPT-5 mini limitations**:

- ⚠️ **Reduced reasoning** vs full GPT-5 (good for mechanical tasks only)
- ⚠️ **Higher sensitivity** to ambiguous prompts (needs explicit format specs)
- ⚠️ **Quality trade-off** vs Haiku 4.5 (validate output carefully)

**When to use `/tasks-haiku-4-5`** (vs `/tasks-gpt-5-mini`):

- Quality > cost (0.33x vs 0x, but better reasoning)
- Plan.md has subtle dependencies
- First time using SpecKit (less risky)

**When to use `/tasks-gpt-5-mini`**:

- Budget is critical (0x vs 0.33x)
- Plan.md has clear, unambiguous action items
- Tasks are mechanical pattern-based transformations
- You can validate output (compare to Haiku 4.5 baseline)

**When to use `/taskstoissues-gpt-5-mini`**:

- ✅ **Always** (pure mechanical transformation)
- ✅ **Perfect fit**: Pattern extraction (task → GitHub issue)
- ✅ **Zero cost**: No reasoning needed for API calls
- ✅ **Fast**: 2× faster than standard command (10-20s vs 30-40s)
- ⚠️ **Requires**: tasks.md in standard format, GitHub repository

**Example workflow**:

```bash
# 1. Generate tasks (choose based on budget)
gh copilot -m "gpt-5-mini" slash tasks-gpt-5-mini          # 0x cost
# OR
gh copilot -m "claude-haiku-4.5" slash tasks-haiku-4-5    # 0.33x cost

# 2. Convert to GitHub issues (zero-cost)
gh copilot -m "gpt-5-mini" slash taskstoissues-gpt-5-mini # 0x cost
```

#### Haiku 4.5 Optimization Techniques

All four Haiku-optimized commands (`/specify-haiku-4-5`, `/clarify-haiku-4-5`, `/checklist-haiku-4-5`, `/tasks-haiku-4-5`) apply **9 optimization techniques** based on Claude Haiku 4.5 best practices:

1. **Explicit XML Structure** - `<task>`, `<constraints>`, `<output_format>` tags for clear boundaries
2. **Step-Bounded Reasoning** - Limit to 3-7 concrete steps (no open-ended exploration)
3. **Mechanical Procedures** - FOR EACH loops, pattern matching (Haiku's strength)
4. **Structured Checklists** - Verifiable outputs match Haiku's capabilities
5. **Constraints First** - Define prohibited patterns upfront with examples
6. **Progressive Disclosure** - Context economy prevents token bloat
7. **Validation Built-In** - Include verification checklists in prompts
8. **Pattern-Based Transformations** - Leverage Haiku's fast pattern matching
9. **Formula-Based Prioritization** - Explicit scoring/ranking rules

**Performance benchmarks** (vs Sonnet 4.5):

- **Speed**: 2-3× faster (10-25s vs 30-60s)
- **Cost**: 0.33× ($1/$5 per 1M tokens vs $3/$15)
- **Quality**: 85-95% (depending on task complexity)

**Best fit tasks** for Haiku 4.5:

- ✅ **Perfect**: Mechanical transformations (tasks), structured validation (checklist)
- ✅ **Good**: Pattern detection (clarify), template filling (specify simple features)
- ⚠️ **Avoid**: Deep reasoning (plan), synthesis-heavy analysis (analyze gaps)

See [`prompt-engineering/CLAUDE-HAIKU-4-5-OPTIMIZATION.md`](prompt-engineering/CLAUDE-HAIKU-4-5-OPTIMIZATION.md) for complete optimization guide.

#### Command Comparison: Standard vs Haiku-Optimized

| Task          | Standard Command                | Haiku-Optimized                | When to Use Haiku                | Usage Example                                                                                                               |
| ------------- | ------------------------------- | ------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Specify**   | `/speckit.specify` (Sonnet)     | `/specify-haiku-4-5` (Haiku)   | Simple features, clear scope     | **Claude Code**: `/specify-haiku-4-5`<br>**GitHub Copilot**: `gh copilot -m "claude-haiku-4.5" slash specify-haiku-4-5`     |
| **Clarify**   | `/speckit.clarify` (Sonnet)     | `/clarify-haiku-4-5` (Haiku)   | Structured gap detection         | **Claude Code**: `/clarify-haiku-4-5`<br>**GitHub Copilot**: `gh copilot -m "claude-haiku-4.5" slash clarify-haiku-4-5`     |
| **Checklist** | `/speckit.checklist` (Sonnet)   | `/checklist-haiku-4-5` (Haiku) | Always (mechanical validation)   | **Claude Code**: `/checklist-haiku-4-5`<br>**GitHub Copilot**: `gh copilot -m "claude-haiku-4.5" slash checklist-haiku-4-5` |
| **Tasks**     | `/speckit.tasks` (Haiku/Sonnet) | `/tasks-haiku-4-5` (Haiku)     | Always (pattern-based breakdown) | **Claude Code**: `/tasks-haiku-4-5`<br>**GitHub Copilot**: `gh copilot -m "claude-haiku-4.5" slash tasks-haiku-4-5`         |

**Example workflow with Haiku commands**:

```bash
# 1. Create spec (Haiku if feature is straightforward)
/specify-haiku-4-5  # 15-25s, 0.33x cost, 85-90% quality

# 2. Clarify ambiguities (Haiku for taxonomy scan)
/clarify-haiku-4-5  # 15-25s, 0.33x cost, 85-90% quality

# 3. Plan (Sonnet/Opus - needs reasoning)
/speckit.plan  # Standard command required

# 4. Generate checklist (Haiku - mechanical validation)
/checklist-haiku-4-5  # 10-15s, 0.33x cost, 90-95% quality

# 5. Generate tasks (Haiku - perfect fit)
/tasks-haiku-4-5  # 10-20s, 0.33x cost, 95%+ quality

# 6. Implement (Sonnet - needs reasoning)
/speckit.implement  # Standard command required
```

**Cost savings example** (typical feature):

- Standard workflow: 5 commands × $0.03 = **$0.15**
- Haiku-optimized: 4 Haiku ($0.01 each) + 2 Sonnet ($0.03 each) = **$0.10** (33% savings)
- Quality impact: Minimal (85-95% on mechanical tasks)

**Automatic Context Size Check** (Step 0.0):

Before analysis starts, the command estimates total tokens:

```
Estimate = (spec lines × 20) + (plan lines × 20) + (tasks lines × 15)
         + (contracts lines × 25) + (implementation lines × 18)

Example (accordion component):
- spec.md: 679 lines × 20 = ~13.6K tokens
- plan.md: 380 lines × 20 = ~7.6K tokens
- tasks.md: 841 lines × 15 = ~12.6K tokens
- contracts/: 450 lines × 25 = ~11.3K tokens
- implementation: 2500 lines × 18 = ~45K tokens
Total: ~90K tokens ✅ SAFE (well within 180K limit)
```

**If >180K tokens**, prompts user with options:

1. **Switch to GPT-4.1** (Recommended) - Automatically provides command
2. **Continue anyway** - Warns about truncation risk
3. **Cancel and revise scope** - Suggests reducing files

**When to use `/analyze-brief-gpt-5-mini`**:

- ✅ Just run it! Pre-check handles size automatically
- ✅ Speed matters (10-20 sec vs 30-60 sec)
- ✅ Well-structured specs with clear FR-XXX requirements
- ✅ Agent will prompt if too large (no manual decision needed)

**When to use `/analyze-brief-gpt-4-1`** (GPT-4.1 with 1M context):

- ⚠️ Pre-check prompted you to switch (>180K tokens)
- ⚠️ You know feature is huge (skip pre-check overhead)
- ⚠️ Need guaranteed 1M context

#### GPT-5 Mini Optimizations Applied

Both `/tasks-gpt-5-mini` and `/analyze-brief-gpt-5-mini` use **7 optimization techniques** based on 2026 OpenAI best practices:

1. **CTCO Framework** - Context → Task → Constraints → Output (eliminates ambiguity)
2. **reasoning_effort: minimal** - Pattern matching, no deep reasoning loops
3. **Verbosity controls** - Strict word limits (title ≤8 words, fix ≤40 words)
4. **XML scaffolding** - Structured state for gap registry and validation
5. **Mechanical procedures** - FOR EACH loops, arithmetic matching (no judgment calls)
6. **Validation checklists** - 8-point self-correction before output
7. **Explicit error conditions** - STOP rules for ambiguous inputs

**Result**: GPT-5 Mini achieves **85-95% quality** of standard models (Haiku 4.5, GPT-4.1) at **0x cost** with **2-3x faster inference**.

**Trade-off**: 200K context limit means large features must use GPT-4.1 (1M context) instead.

| `/speckit.implement` | Haiku 4.5 → Sonnet 4.5 when needed | GPT-5.1-Codex-Mini → GPT-5.1-Codex when needed |

> Trade-off: expect more iterations; upgrade to Sonnet/Opus (or Codex/Codex-Max) when you hit ambiguity or cross-cutting changes.

**Example: Zero-Cost Gap Analysis → Sonnet 4.5 Validation**

1. **Step 1: Zero-cost gap detection (choose model based on feature size):**

**Option A: GPT-5 Mini** (small-medium features, <180K tokens, **faster**):

```bash
gh copilot -m "gpt-5-mini" slash analyze-brief-gpt-5-mini @implementation-files
```

**Option B: GPT-4.1** (large features, >180K tokens, **more context**):

```bash
gh copilot -m "gpt-4.1" slash analyze-brief-gpt-4-1 @implementation-files
```

**Both commands**:

- Auto-include current feature's spec.md, plan.md, tasks.md from `specs/` directory
- Follow structured 6-step validation workflow
- Score each gap on evidence quality (0-10 scale)
- Remove false positives via blocking validation checks
- Check for existing GAPS_REMEDIATION.md (skip known gaps in incremental mode)
- Write complete report to `gap-analysis-report.md`

**GPT-5 Mini advantages** (vs GPT-4.1):

- ⚡ **2-3x faster** (10-20 sec vs 30-60 sec) - kernel fusion, tensor parallelism
- ✅ **Better structured output** - CTCO framework, XML scaffolding
- ✅ **Same cost** (both 0x)
- ✅ **Automatic size check** - Estimates tokens, prompts switch to GPT-4.1 if >180K
- ⚠️ **Context limit**: 200K vs 1M (but pre-check handles this automatically)

**Output**: Agent writes structured report to `gap-analysis-report.md` with:

- Validated gaps (each with evidence, validation score, priority, fix)
- Skipped known gaps (if GAPS_REMEDIATION.md exists)
- False positives removed
- Summary statistics

**Alternative (if slash commands unavailable)**: Manually copy instructions from `.github/agents/analyze-brief-gpt-5-mini.agent.md` or `.github/agents/analyze-brief-gpt-4-1.agent.md`

2. **Step 2: Sonnet 4.5 validation (create remediation docs):**

Use `/analyze-gaps` to validate gaps and create remediation documentation:

**Claude Code**:

```bash
/analyze-gaps
```

**GitHub Copilot**:

```bash
gh copilot slash analyze-gaps
```

**What it does**:

1. Validates each claimed gap with 6-step methodology
2. Scores confidence (0-10) based on evidence quality
3. Creates `GAPS_REMEDIATION.md` (comprehensive tracking with evidence chains)
4. Creates `REMEDIATION_CHECKLIST.md` (step-by-step implementation guide)
5. Updates spec.md, plan.md, tasks.md with cross-references
6. Creates 4 git commits with conventional format

**Example output** (from accordion):

- 7 validated gaps (3 P0, 3 P1, 1 P2) with scores 6-10/10
- 4 false positives correctly identified
- GAPS_REMEDIATION.md (377 lines) + REMEDIATION_CHECKLIST.md (635 lines)
- 182-minute fix estimate (P0=32min, P1=135min, P2=15min)

**Success criteria**: Future gap analysis runs (either `/analyze-brief-gpt-5-mini` or `/analyze-brief-gpt-4-1`) will NOT re-flag these gaps because they find:

- "NOT IMPLEMENTED - TRACKED" markers in GAPS_REMEDIATION.md
- Evidence chains (FR-XXX → Task ID → Contract → Implementation status)
- False positives documented in "Not Gaps" section

**Manual alternative** (if slash command unavailable):
Copy instructions from `.github/agents/analyze-gaps.agent.md` and run manually

3. **Step 3: Sonnet 4.5 implementation (execute gap fixes):**

Use `/implement-gap-remediations` to systematically implement gap fixes from REMEDIATION_CHECKLIST.md:

**Claude Code**:

```bash
/implement-gap-remediations
```

**GitHub Copilot**:

```bash
gh copilot slash implement-gap-remediations
```

**What it does**:

1. Reads REMEDIATION_CHECKLIST.md and GAPS_REMEDIATION.md
2. Asks user for scope (P0 only / P0+P1 / P0+P1+P2 / specific gaps)
3. Creates TODO list with TodoWrite (visible progress tracking)
4. Executes each gap systematically:
   - Applies exact code changes from checklist
   - Runs tests after every modification
   - Stops immediately on test failures
   - Updates progress in real-time
5. Verifies with full test suite (test + lint + build)
6. Updates GAPS_REMEDIATION.md (status → ✅ FIXED)
7. Updates REMEDIATION_CHECKLIST.md (completion notes)
8. Updates CHANGELOG.md (if breaking changes)
9. Creates git commits (one per priority level, conventional format)

**Example workflow** (accordion P0 gaps):

```
User selects: P0 only (BLOCKING) - 32 min

Agent executes:
✅ GAP-3: Rename multiExpandable → multiExpand (2 min)
  - Updates 4 files with exact replacements
  - Runs tests ✅
  - Documents breaking change in CHANGELOG.md

✅ GAP-1: Add Foundation API methods (10 min)
  - Adds down(), up(), toggle() to accordion-item-def.ts
  - Adds JSDoc comments
  - Adds unit tests ✅

✅ GAP-2: Add Foundation API outputs (20 min)
  - Adds (down), (up) outputs to accordion.component.ts
  - Emits events in expansion effect
  - Adds unit tests ✅

Final verification:
✅ All tests passing
✅ Linting clean
✅ Build successful

Updates:
✅ GAPS_REMEDIATION.md (3 gaps marked FIXED)
✅ REMEDIATION_CHECKLIST.md (completion notes)
✅ CHANGELOG.md (breaking change documented)

Commits:
✅ 1 commit: "fix(accordion): resolve P0 gaps - Foundation API parity"

Result: 3 gaps fixed in 32 minutes (100% accuracy)
```

**Key features**:

- **Test-gated**: Stops immediately if any test fails
- **Progress tracking**: TodoWrite shows real-time progress
- **Incremental commits**: One commit per priority level
- **Breaking change handling**: Asks confirmation, updates CHANGELOG.md
- **Verification rigorous**: Tests after every code change

**Best for**:

- P0/P1 gaps with exact code snippets in checklist
- Non-breaking additions (GAP-1, GAP-2)
- When speed + verification matter
- Systematic implementation with progress visibility

**Manual alternative** (if slash command unavailable):
Copy instructions from `.github/agents/implement-gap-remediations.agent.md` and execute manually, or follow REMEDIATION_CHECKLIST.md step-by-step

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
| Sonnet 4               | Claude Code, GitHub Copilot CLI | 200K               | 1x                  | Previous generation Sonnet; use 4.5 unless specific compatibility needed                                               |
| Haiku 4.5              | Claude Code, GitHub Copilot CLI | 200K               | 0.33x               | Tasks + mechanical edits/boilerplate                                                                                   |
| Sonnet 4.5 1M          | Claude Code only                | 1M                 | —                   | Huge artifacts/monorepos; **GitHub Copilot alternatives:** GPT-4.1 or Gemini 3 Pro                                     |
| GPT-5.2                | GitHub Copilot CLI              | 400K               | 1x                  | Strong plan/analyze alternative if you prefer GPT-style reasoning                                                      |
| GPT-5.1                | GitHub Copilot CLI              | 400K               | 1x                  | Previous generation GPT-5; good general-purpose reasoning model                                                        |
| GPT-5.1-Codex-Max      | GitHub Copilot CLI              | 400K+ (compaction) | 1x                  | Hardest refactors + multi-hour sessions; compaction preserves key details as context grows                             |
| GPT-5.1-Codex          | GitHub Copilot CLI              | 400K               | 1x                  | Best default for `/speckit.implement` in code-heavy sessions                                                           |
| GPT-5.1-Codex-Mini     | GitHub Copilot CLI              | 400K               | 0.33x               | Cheap/faster tasks + small implementation chores                                                                       |
| GPT-5                  | GitHub Copilot CLI              | 200K               | 1x                  | Base GPT-5 model; use 5.1 or 5.2 for better performance                                                                |
| GPT-5 mini             | GitHub Copilot CLI              | 200K               | 0x                  | Zero-cost fast inference; good for simple queries, quick checks, or budget-conscious workflows                         |
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
