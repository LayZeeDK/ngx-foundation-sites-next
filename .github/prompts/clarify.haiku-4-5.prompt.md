---
description: Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions. Optimized for Claude Haiku 4.5's speed and pattern-matching capabilities.
agent: clarify.haiku-4-5
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Model Selection

**Preferred Model**: Claude Haiku 4.5 (`claude-haiku-4.5`)
**Invoke with**: `copilot -m "claude-haiku-4.5" slash clarify-haiku-4-5`

**Optimization Strategy**: Structured taxonomy scan, step-bounded reasoning, explicit question criteria
**Expected Performance**: 15-25 seconds for analysis + question generation, 0.33x cost vs Sonnet 4.5

---

## Goal

Detect and reduce ambiguity or missing decision points in the active feature specification. Record clarifications directly in the spec file through interactive Q&A.

**Timing**: This clarification workflow is expected to run (and be completed) BEFORE invoking `/speckit.plan`.

**Warning**: If user explicitly states they are skipping clarification (e.g., exploratory spike), you may proceed, but must warn that downstream rework risk increases.

---

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths (e.g. avoid fallback paths like `/Users/...`)
- Treat paths emitted by the `.specify` PowerShell scripts (`-Json` output) as the **only source of truth**; use them verbatim
- If a required path is missing/unclear, STOP and re-run the prerequisite script (or ask the user) instead of synthesizing a path
- All file paths must be absolute

---

## Execution Steps

### Step 1: Setup & Path Discovery

Run prerequisite check from repository root to get absolute paths.

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly
```

**Parse JSON output for**:

- `FEATURE_DIR`: Absolute path to feature directory
- `FEATURE_SPEC`: Absolute path to spec.md file
- (Optionally) `IMPL_PLAN`, `TASKS`: For future chained flows

**Error Handling**:

- If JSON parsing fails: Abort and instruct user to re-run `/speckit.specify` or verify feature branch environment
- If spec file missing: Cannot proceed - instruct user to run `/speckit.specify` first (do not create a new spec here)

**PowerShell String Escaping**:

- For single quotes in args like "I'm Groot", use escape syntax: `'I'\''m Groot'`
- Or use double quotes if possible: `"I'm Groot"`

---

### Step 2: Load Spec & Perform Coverage Scan

Load the current spec file from FEATURE_SPEC path.

**Loading Strategy**: Full read required for this task (cannot use progressive disclosure for ambiguity detection).

**Coverage Taxonomy** - For each category, mark status: **Clear** / **Partial** / **Missing**:

**1. Functional Scope & Behavior**

- Core user goals & success criteria
- Explicit out-of-scope declarations
- User roles / personas differentiation

**2. Domain & Data Model**

- Entities, attributes, relationships
- Identity & uniqueness rules
- Lifecycle/state transitions
- Data volume / scale assumptions

**3. Interaction & UX Flow**

- Critical user journeys / sequences
- Error/empty/loading states
- Accessibility or localization notes

**4. Non-Functional Quality Attributes**

- Performance (latency, throughput targets)
- Scalability (horizontal/vertical, limits)
- Reliability & availability (uptime, recovery expectations)
- Observability (logging, metrics, tracing signals)
- Security & privacy (authN/Z, data protection, threat assumptions)
- Compliance / regulatory constraints (if any)

**5. Integration & External Dependencies**

- External services/APIs and failure modes
- Data import/export formats
- Protocol/versioning assumptions

**6. Edge Cases & Failure Handling**

- Negative scenarios
- Rate limiting / throttling
- Conflict resolution (e.g., concurrent edits)

**7. Constraints & Tradeoffs**

- Technical constraints (language, storage, hosting)
- Explicit tradeoffs or rejected alternatives

**8. Terminology & Consistency**

- Canonical glossary terms
- Avoided synonyms / deprecated terms

**9. Completion Signals**

- Acceptance criteria testability
- Measurable Definition of Done style indicators

**10. Misc / Placeholders**

- TODO markers / unresolved decisions
- Ambiguous adjectives ("robust", "intuitive") lacking quantification

**Candidate Question Generation**:

For each category with **Partial** or **Missing** status, add a candidate question opportunity **UNLESS**:

- Clarification would NOT materially change implementation or validation strategy
- Information is better deferred to planning phase (note internally)

**Prioritization Formula**: Impact × Uncertainty

- **Impact**: How much does this affect architecture, data modeling, task decomposition, test design, UX behavior, operational readiness, or compliance validation?
- **Uncertainty**: How ambiguous or missing is this information?

---

### Step 3: Generate Prioritized Question Queue (Maximum 5)

Generate (internally) a prioritized queue of candidate clarification questions (maximum 5). **Do NOT output them all at once.**

**Hard Limits**:

- Maximum of 10 total questions across the whole session
- Maximum of 5 questions in initial queue

**Question Format Requirements**:

Each question must be answerable with EITHER:

- **Multiple-choice**: 2–5 distinct, mutually exclusive options, OR
- **Short answer**: One-word / short-phrase answer with explicit constraint: "Answer in ≤5 words"

**Inclusion Criteria** (all must be true):

- Answer materially impacts: architecture, data modeling, task decomposition, test design, UX behavior, operational readiness, OR compliance validation
- Clarification would reduce downstream rework risk OR prevent misaligned acceptance tests
- Information is NOT better deferred to planning phase

**Exclusion Criteria**:

- Already answered in spec
- Trivial stylistic preferences
- Plan-level execution details (unless blocking correctness)

**Category Coverage Balance**:

- Attempt to cover the highest impact unresolved categories first
- Avoid asking two low-impact questions when a single high-impact area (e.g., security posture) is unresolved
- If more than 5 categories remain unresolved, select the top 5 by (Impact × Uncertainty) heuristic

**Output**: Internal queue only (do not display).

---

### Step 4: Sequential Questioning Loop (Interactive)

Present **EXACTLY ONE question at a time**.

**For Multiple-Choice Questions**:

1. **Analyze all options** and determine the **most suitable option** based on:
   - Best practices for the project type
   - Common patterns in similar implementations
   - Risk reduction (security, performance, maintainability)
   - Alignment with any explicit project goals or constraints visible in the spec

2. **Present your recommended option prominently** at the top with clear reasoning:

   ```
   **Recommended:** Option [X] - <reasoning in 1-2 sentences explaining why this is the best choice>
   ```

3. **Render all options as a Markdown table**:

   ```markdown
   | Option | Description                                                                                        |
   | ------ | -------------------------------------------------------------------------------------------------- |
   | A      | <Option A description>                                                                             |
   | B      | <Option B description>                                                                             |
   | C      | <Option C description>                                                                             |
   | D      | <Option D description> (add D/E as needed up to 5)                                                 |
   | Short  | Provide a different short answer (≤5 words) (Include only if free-form alternative is appropriate) |
   ```

4. **After the table, add**:
   ```
   You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or provide your own short answer.
   ```

**For Short-Answer Style** (no meaningful discrete options):

1. **Provide your suggested answer** based on best practices and context:

   ```
   **Suggested:** <your proposed answer> - <brief reasoning>
   ```

2. **Then output**:
   ```
   Format: Short answer (≤5 words). You can accept the suggestion by saying "yes" or "suggested", or provide your own answer.
   ```

**After the User Answers**:

- If the user replies with **"yes", "recommended", or "suggested"**: Use your previously stated recommendation/suggestion as the answer
- Otherwise: Validate the answer maps to one option or fits the ≤5 word constraint
- If ambiguous: Ask for a quick disambiguation (count still belongs to same question; do not advance)
- Once satisfactory: Record it in working memory (do not yet write to disk) and move to the next queued question

**Stop asking further questions when**:

- All critical ambiguities resolved early (remaining queued items become unnecessary), OR
- User signals completion ("done", "good", "no more"), OR
- You reach 5 asked questions

**Never reveal future queued questions in advance.**

**No Questions Case**:

If no valid questions exist at start:

- Immediately report: **"No critical ambiguities detected worth formal clarification."**
- Suggest proceeding to `/speckit.plan`

---

### Step 5: Integration After EACH Accepted Answer (Incremental Update)

Maintain in-memory representation of the spec (loaded once at start) plus the raw file contents.

**For the First Integrated Answer in This Session**:

1. Ensure a `## Clarifications` section exists
   - Create it just after the highest-level contextual/overview section per the spec template if missing
2. Under it, create (if not present) a `### Session YYYY-MM-DD` subheading for today

**After EACH Accepted Answer**:

1. **Append a bullet line immediately**:

   ```markdown
   - Q: <question> → A: <final answer>
   ```

2. **Then immediately apply the clarification to the most appropriate section(s)**:
   - **Functional ambiguity** → Update or add a bullet in Functional Requirements
   - **User interaction / actor distinction** → Update User Stories or Actors subsection (if present) with clarified role, constraint, or scenario
   - **Data shape / entities** → Update Data Model (add fields, types, relationships) preserving ordering; note added constraints succinctly
   - **Non-functional constraint** → Add/modify measurable criteria in Non-Functional / Quality Attributes section (convert vague adjective to metric or explicit target)
   - **Edge case / negative flow** → Add a new bullet under Edge Cases / Error Handling (or create such subsection if template provides placeholder for it)
   - **Terminology conflict** → Normalize term across spec; retain original only if necessary by adding `(formerly referred to as "X")` once

3. **If the clarification invalidates an earlier ambiguous statement**:
   - Replace that statement instead of duplicating
   - Leave no obsolete contradictory text

4. **Save the spec file AFTER each integration** to minimize risk of context loss (atomic overwrite)

5. **Preserve formatting**:
   - Do not reorder unrelated sections
   - Keep heading hierarchy intact
   - Keep each inserted clarification minimal and testable (avoid narrative drift)

---

### Step 6: Validation (Performed After EACH Write + Final Pass)

After EACH write plus final pass, verify:

- [ ] Clarifications session contains exactly one bullet per accepted answer (no duplicates)
- [ ] Total asked (accepted) questions ≤ 5
- [ ] Updated sections contain no lingering vague placeholders the new answer was meant to resolve
- [ ] No contradictory earlier statement remains (scan for now-invalid alternative choices removed)
- [ ] Markdown structure valid; only allowed new headings: `## Clarifications`, `### Session YYYY-MM-DD`
- [ ] Terminology consistency: same canonical term used across all updated sections

---

### Step 7: Write Updated Spec

Write the updated spec back to `FEATURE_SPEC`.

---

### Step 8: Report Completion

After questioning loop ends or early termination:

**📋 Clarification Summary**

1. **Questions Asked & Answered**: [Number of questions asked & answered]
2. **Updated Spec Path**: [Full absolute path to updated spec]
3. **Sections Touched**: [List names of sections that were updated]

4. **Coverage Summary Table**:

   | Category          | Status                                    | Notes               |
   | ----------------- | ----------------------------------------- | ------------------- |
   | [Category 1 name] | Resolved / Deferred / Clear / Outstanding | [Brief explanation] |
   | [Category 2 name] | ...                                       | ...                 |
   | ...               | ...                                       | ...                 |

   **Status Definitions**:
   - **Resolved**: Was Partial/Missing and addressed in this session
   - **Deferred**: Exceeds question quota or better suited for planning
   - **Clear**: Already sufficient in spec
   - **Outstanding**: Still Partial/Missing but low impact

5. **Recommendation**:
   - If any Outstanding or Deferred remain: [Recommend whether to proceed to `/speckit.plan` or run `/speckit.clarify` again later post-plan]
   - If all Clear/Resolved: "Proceed to `/speckit.plan`"

6. **Suggested Next Command**: [e.g., `/speckit.plan` or another `/speckit.clarify` session]

---

## Behavior Rules

- If no meaningful ambiguities found (or all potential questions would be low-impact): Respond "No critical ambiguities detected worth formal clarification." and suggest proceeding
- If spec file missing: Instruct user to run `/speckit.specify` first (do not create a new spec here)
- Never exceed 5 total asked questions (clarification retries for a single question do not count as new questions)
- Avoid speculative tech stack questions unless the absence blocks functional clarity
- Respect user early termination signals ("stop", "done", "proceed")
- If no questions asked due to full coverage: Output a compact coverage summary (all categories Clear) then suggest advancing
- If quota reached with unresolved high-impact categories remaining: Explicitly flag them under Deferred with rationale

---

## Optimization Notes for Haiku 4.5

This command is optimized for Claude Haiku 4.5's strengths:

1. **Structured Taxonomy**: Explicit 10-category checklist for systematic, mechanical scan
2. **Step-Bounded**: 8 concrete steps, no open-ended exploration
3. **Pattern Matching**: Identify gaps via keyword/structure recognition (Haiku's strength)
4. **Explicit Criteria**: Clear rules for what counts as ambiguous/missing (no inference required)
5. **Incremental Updates**: Small, atomic file writes after each answer (reduces context load)
6. **Checklists Built-In**: Validation checklist, coverage summary table (Haiku excels at structured output)
7. **Prioritization Formula**: Impact × Uncertainty (mechanical calculation, not deep reasoning)

**Performance Expectations**:

- **Analysis Speed**: 15-25 seconds (vs 30-45s with Sonnet 4.5)
- **Cost**: 0.33x vs Sonnet 4.5 (66% cheaper)
- **Quality**: 85-90% of Sonnet for structured ambiguity detection
- **Best for**: Systematic gap identification using predefined taxonomy

**Limitations vs Sonnet**:

- May miss subtle conceptual ambiguities requiring deep reasoning
- Better at detecting missing sections than inferring implicit assumptions
- Recommendations based on common patterns, not deep architectural synthesis
- Less effective for novel/unusual project types without established patterns

**When to Use Sonnet 4.5 Instead**:

- Complex architectural decisions requiring multi-step reasoning
- Novel/unusual project types without common patterns
- Deep synthesis across multiple interconnected ambiguities
- When missing nuances could have high downstream cost

---

## Context for Prioritization

```text
$ARGUMENTS
```

Use user input (if provided) to adjust:

- Which taxonomy categories to prioritize
- What counts as "high impact" for this specific feature
- Domain-specific best practices to apply in recommendations
