---
description: Generate a custom checklist for the current feature based on user requirements. Optimized for Claude Haiku 4.5's speed and cost efficiency.
agent: checklist.haiku-4-5
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Model Selection

**Preferred Model**: Claude Haiku 4.5 (`claude-haiku-4.5`)
**Invoke with**: `copilot -m "claude-haiku-4.5" slash checklist-haiku-4-5`

**Optimization Strategy**: Structured prompts, step-bounded reasoning, explicit constraints
**Expected Performance**: 10-15 seconds, 0.33x cost vs Sonnet 4.5

---

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path is missing/unclear, STOP and re-run prerequisite script
- All file paths must be absolute

---

## Execution Steps

### Step 1: Setup & Path Discovery

Run prerequisite check from repository root to get absolute paths.

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json
```

**Parse JSON output for**:

- `FEATURE_DIR`: Absolute path to feature directory
- `AVAILABLE_DOCS`: List of existing files (spec.md, plan.md, tasks.md)

**PowerShell String Escaping**:

- For single quotes in args like "I'm Groot", use: `'I'\''m Groot'`
- Or use double quotes: `"I'm Groot"`

---

### Step 2: Clarify Intent (Maximum 3 Questions)

**Constraints**:

- Generate 0-3 contextual questions from user input and spec signals
- Skip questions if already answered in $ARGUMENTS
- Only ask about information that materially changes checklist
- Use tables for options (max 5 choices: A-E)
- Never ask user to restate what they already said
- Prefer precision over breadth

**Question Generation Algorithm**:

1. Extract signals from user input:
   - Domain keywords (auth, latency, UX, API)
   - Risk indicators ("critical", "must", "compliance")
   - Stakeholder hints ("QA", "review", "security team")
   - Explicit deliverables ("a11y", "rollback", "contracts")

2. Cluster signals into candidate focus areas (max 4, ranked by relevance)

3. Identify probable audience & timing:
   - Author, Reviewer, QA, Release
   - If not explicit, infer from context

4. Detect missing dimensions:
   - Scope breadth vs depth
   - Risk emphasis
   - Exclusion boundaries
   - Measurable acceptance criteria

5. Formulate up to 3 questions from these archetypes:
   - **Scope refinement**: "Should this include integration touchpoints with X and Y or stay limited to local module correctness?"
   - **Risk prioritization**: "Which of these potential risk areas should receive mandatory gating checks?"
   - **Depth calibration**: "Is this a lightweight pre-commit sanity list or a formal release gate?"
   - **Audience framing**: "Will this be used by the author only or peers during PR review?"
   - **Boundary exclusion**: "Should we explicitly exclude performance tuning items this round?"
   - **Scenario class gap**: "No recovery flows detected—are rollback/partial failure paths in scope?"

**Question Format**:

- If presenting options, use compact table: Option | Candidate | Why It Matters
- Limit to A-E options maximum
- Omit table if free-form answer is clearer

**Defaults if interaction impossible**:

- Depth: Standard
- Audience: Reviewer (PR) if code-related; Author otherwise
- Focus: Top 2 relevance clusters

**Optional Follow-up**: After initial answers, if ≥2 scenario classes remain unclear (Alternate/Exception/Recovery/Non-Functional), you MAY ask up to 2 more targeted questions (Q4/Q5) with one-line justification each. Do not exceed 5 total questions.

---

### Step 3: Understand User Request

Combine $ARGUMENTS + clarifying answers to determine:

- **Checklist theme**: e.g., security, review, deploy, ux, api, performance
- **Explicit must-have items**: Any specific checks mentioned by user
- **Focus selections**: Map to category scaffolding
- **Inferred context**: From spec/plan/tasks (do NOT hallucinate)

---

### Step 4: Load Feature Context

**Context Loading Strategy** - Efficient, targeted loading (NOT full-file dumping):

1. Load ONLY sections relevant to active focus areas
2. Summarize long sections into concise bullets
3. Use progressive disclosure: add follow-on retrieval only if gaps detected
4. If source docs are large (>500 lines), generate interim summaries instead of embedding raw text

Read from FEATURE_DIR:

- **spec.md**: Feature requirements and scope (prioritize FR/NFR sections)
- **plan.md** (if exists): Technical details, dependencies
- **tasks.md** (if exists): Implementation tasks

---

### Step 5: Generate Checklist

**Output Structure**:

Create `FEATURE_DIR/checklists/` directory if it doesn't exist.

**Filename format**: `[domain].md`

- Use short, descriptive domain name based on theme
- Examples: `ux.md`, `api.md`, `security.md`, `performance.md`
- If file exists, append to existing file
- Each `/checklist-haiku-4-5` run creates a NEW file (never overwrites existing checklists)

**Item numbering**: Sequential starting from CHK001

**Checklist Quality Dimensions** - Group items by requirement quality categories:

1. **Requirement Completeness** - Are all necessary requirements documented?
2. **Requirement Clarity** - Are requirements specific and unambiguous?
3. **Requirement Consistency** - Do requirements align without conflicts?
4. **Acceptance Criteria Quality** - Are success criteria measurable?
5. **Scenario Coverage** - Are all flows/cases addressed?
6. **Edge Case Coverage** - Are boundary conditions defined?
7. **Non-Functional Requirements** - Performance, Security, Accessibility specified?
8. **Dependencies & Assumptions** - Are they documented and validated?
9. **Ambiguities & Conflicts** - What needs clarification?

**Scenario Coverage** - Check if requirements exist for these scenario classes:

- Primary scenarios (happy path)
- Alternate flows
- Exception/Error cases
- Recovery procedures
- Non-Functional requirements (performance, security, accessibility)

For each scenario class:

- Ask: "Are [scenario type] requirements complete, clear, and consistent?"
- If missing: "Are [scenario type] requirements intentionally excluded or missing? [Gap]"
- Include resilience/rollback when state mutation occurs: "Are rollback requirements defined for migration failures? [Gap]"

**Content Consolidation** - If raw candidate items > 40:

- Prioritize by risk/impact
- Merge near-duplicates checking the same requirement aspect
- If >5 low-impact edge cases, create one consolidated item: "Are edge cases X, Y, Z addressed in requirements? [Coverage]"

---

### Step 6: Structure Output

Follow template from `.specify/templates/checklist-template.md`:

```markdown
# [CHECKLIST TYPE] Checklist: [FEATURE NAME]

**Purpose**: [Brief description of what this checklist covers]
**Created**: [DATE]
**Feature**: [Link to spec.md or relevant documentation]

## [Category 1: e.g., Requirement Completeness]

- [ ] CHK001 First requirement quality item with traceability
- [ ] CHK002 Second requirement quality item

## [Category 2: e.g., Requirement Clarity]

- [ ] CHK003 Item checking for ambiguities
- [ ] CHK004 Item checking for measurability

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Link to relevant resources or documentation
```

**If template unavailable**, use:

- H1 title
- Purpose/created meta lines
- `##` category sections
- `- [ ] CHK### <requirement item>` with globally incrementing IDs starting at CHK001

---

### Step 7: Report Results

Output in this exact structure:

**✅ Checklist Generated**

1. **File**: [Full absolute path to checklist file]
2. **Items**: [Number] checklist items
3. **Configuration**:
   - Focus areas: [List selected focus areas]
   - Depth level: [Standard/Lightweight/Comprehensive]
   - Audience: [Author/Reviewer/QA/Release]
4. **Must-Have Items**: [List any user-specified items incorporated, or "None specified"]

**📋 Reminder**: Each `/checklist-haiku-4-5` command creates a new file using short, descriptive names. This allows:

- Multiple checklists of different types (e.g., `ux.md`, `test.md`, `security.md`)
- Simple, memorable filenames indicating purpose
- Easy navigation in `checklists/` folder

**Next Steps**:

- Review checklist for completeness
- Run additional `/checklist-haiku-4-5` for different domains if needed
- Use checklist to validate requirements quality
- Clean up obsolete checklists when done

---

## Item Examples

### Correct Examples - Testing Requirements Quality

**Completeness**:

- "Are error handling requirements defined for all API failure modes? [Gap]"
- "Are accessibility requirements specified for all interactive elements? [Completeness]"
- "Are mobile breakpoint requirements defined for responsive layouts? [Gap]"

**Clarity**:

- "Is 'fast loading' quantified with specific timing thresholds? [Clarity, Spec §NFR-2]"
- "Are 'related episodes' selection criteria explicitly defined? [Clarity, Spec §FR-5]"
- "Is 'prominent' defined with measurable visual properties? [Ambiguity, Spec §FR-4]"

**Consistency**:

- "Do navigation requirements align across all pages? [Consistency, Spec §FR-10]"
- "Are card component requirements consistent between landing and detail pages? [Consistency]"

**Coverage**:

- "Are requirements defined for zero-state scenarios (no episodes)? [Coverage, Edge Case]"
- "Are concurrent user interaction scenarios addressed? [Coverage, Gap]"
- "Are requirements specified for partial data loading failures? [Coverage, Exception Flow]"

**Measurability**:

- "Are visual hierarchy requirements measurable/testable? [Acceptance Criteria, Spec §FR-1]"
- "Can 'balanced visual weight' be objectively verified? [Measurability, Spec §FR-2]"

### Prohibited Examples - Testing Implementation

❌ **WRONG** - These test implementation, not requirements:

- "Verify landing page displays 3 episode cards" ← tests implementation
- "Test hover states work correctly on desktop" ← tests code
- "Confirm logo click navigates to home page" ← tests behavior
- Any item starting with "Verify", "Test", "Confirm" + implementation behavior

---

## Example Checklist Types

### UX Requirements Quality: `ux.md`

- "Are visual hierarchy requirements defined with measurable criteria? [Clarity, Spec §FR-1]"
- "Is the number and positioning of UI elements explicitly specified? [Completeness, Spec §FR-1]"
- "Are interaction state requirements (hover, focus, active) consistently defined? [Consistency]"
- "Are accessibility requirements specified for all interactive elements? [Coverage, Gap]"
- "Is fallback behavior defined when images fail to load? [Edge Case, Gap]"
- "Can 'prominent display' be objectively measured? [Measurability, Spec §FR-4]"

### API Requirements Quality: `api.md`

- "Are error response formats specified for all failure scenarios? [Completeness]"
- "Are rate limiting requirements quantified with specific thresholds? [Clarity]"
- "Are authentication requirements consistent across all endpoints? [Consistency]"
- "Are retry/timeout requirements defined for external dependencies? [Coverage, Gap]"
- "Is versioning strategy documented in requirements? [Gap]"

### Performance Requirements Quality: `performance.md`

- "Are performance requirements quantified with specific metrics? [Clarity]"
- "Are performance targets defined for all critical user journeys? [Coverage]"
- "Are performance requirements under different load conditions specified? [Completeness]"
- "Can performance requirements be objectively measured? [Measurability]"
- "Are degradation requirements defined for high-load scenarios? [Edge Case, Gap]"

### Security Requirements Quality: `security.md`

- "Are authentication requirements specified for all protected resources? [Coverage]"
- "Are data protection requirements defined for sensitive information? [Completeness]"
- "Is the threat model documented and requirements aligned to it? [Traceability]"
- "Are security requirements consistent with compliance obligations? [Consistency]"
- "Are security failure/breach response requirements defined? [Gap, Exception Flow]"

---

## Optimization Notes for Haiku 4.5

This command is optimized for Claude Haiku 4.5's strengths:

1. **Explicit Structure**: XML tags and clear section boundaries
2. **Step-Bounded**: 7 concrete steps, no open-ended exploration
3. **Mechanical Procedure**: FOR EACH requirement → generate quality check item (pattern matching)
4. **Checklists**: Output format matches Haiku's strength (structured, verifiable)
5. **Constraints First**: Prohibited patterns clearly defined upfront with examples
6. **Context Economy**: Progressive disclosure prevents unnecessary token consumption
7. **Validation Built-In**: ≥80% traceability requirement ensures quality

**Performance Expectations**:

- **Speed**: 10-15 seconds (vs 20-30s with Sonnet 4.5)
- **Cost**: 0.33x vs Sonnet 4.5 (66% cheaper)
- **Quality**: 90-95% of Sonnet output for this mechanical, bounded task
- **Best for**: Generating structured checklists from requirements docs
