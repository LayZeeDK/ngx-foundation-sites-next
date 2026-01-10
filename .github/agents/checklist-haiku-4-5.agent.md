---
description: Generate a custom checklist for the current feature based on user requirements. Optimized for Claude Haiku 4.5's speed and cost efficiency.
---

## Model Selection

**Preferred Model**: Claude Haiku 4.5 (`claude-haiku-4.5`)  
**Invoke with**: `gh copilot -m "claude-haiku-4.5" slash checklist-haiku-4-5`

**Optimization Strategy**: Structured prompts, step-bounded reasoning, explicit constraints  
**Expected Performance**: 10-15 seconds, 0.33x cost vs Sonnet 4.5

---

## Core Principle: "Unit Tests for Requirements"

<principle>
Checklists are UNIT TESTS FOR REQUIREMENTS WRITING - they validate the quality, clarity, and completeness of requirements documentation.

NOT for verification/testing:
- ❌ "Verify the button clicks correctly" (implementation test)
- ❌ "Test error handling works" (code test)
- ❌ "Confirm API returns 200" (behavior test)

FOR requirements quality validation:
- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)
</principle>

---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Path Grounding (CRITICAL)

<path_rules>
- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path is missing/unclear, STOP and re-run prerequisite script
- All file paths must be absolute
</path_rules>

---

## Execution Steps

### Step 1: Setup & Path Discovery

<task>
Run prerequisite check from repository root to get absolute paths.
</task>

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

<constraints>
- Generate 0-3 contextual questions from user input and spec signals
- Skip questions if already answered in $ARGUMENTS
- Only ask about information that materially changes checklist
- Use tables for options (max 5 choices: A-E)
- Never ask user to restate what they already said
- Prefer precision over breadth
</constraints>

<question_generation_algorithm>
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
</question_generation_algorithm>

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

<consolidation>
Combine $ARGUMENTS + clarifying answers to determine:

- **Checklist theme**: e.g., security, review, deploy, ux, api, performance
- **Explicit must-have items**: Any specific checks mentioned by user
- **Focus selections**: Map to category scaffolding
- **Inferred context**: From spec/plan/tasks (do NOT hallucinate)
</consolidation>

---

### Step 4: Load Feature Context

<context_loading_strategy>
Efficient, targeted loading - NOT full-file dumping:

1. Load ONLY sections relevant to active focus areas
2. Summarize long sections into concise bullets
3. Use progressive disclosure: add follow-on retrieval only if gaps detected
4. If source docs are large (>500 lines), generate interim summaries instead of embedding raw text

Read from FEATURE_DIR:
- **spec.md**: Feature requirements and scope (prioritize FR/NFR sections)
- **plan.md** (if exists): Technical details, dependencies
- **tasks.md** (if exists): Implementation tasks
</context_loading_strategy>

---

### Step 5: Generate Checklist

<output_structure>
Create `FEATURE_DIR/checklists/` directory if it doesn't exist.

**Filename format**: `[domain].md`
- Use short, descriptive domain name based on theme
- Examples: `ux.md`, `api.md`, `security.md`, `performance.md`
- If file exists, append to existing file
- Each `/checklist-haiku-4-5` run creates a NEW file (never overwrites existing checklists)

**Item numbering**: Sequential starting from CHK001
</output_structure>

<core_principle>
Test the REQUIREMENTS, NOT the implementation.

Every checklist item MUST evaluate the REQUIREMENTS THEMSELVES for:
- **Completeness**: Are all necessary requirements present?
- **Clarity**: Are requirements unambiguous and specific?
- **Consistency**: Do requirements align with each other?
- **Measurability**: Can requirements be objectively verified?
- **Coverage**: Are all scenarios/edge cases addressed?
</core_principle>

<checklist_quality_dimensions>
Group items by requirement quality categories:

1. **Requirement Completeness** - Are all necessary requirements documented?
2. **Requirement Clarity** - Are requirements specific and unambiguous?
3. **Requirement Consistency** - Do requirements align without conflicts?
4. **Acceptance Criteria Quality** - Are success criteria measurable?
5. **Scenario Coverage** - Are all flows/cases addressed?
6. **Edge Case Coverage** - Are boundary conditions defined?
7. **Non-Functional Requirements** - Performance, Security, Accessibility specified?
8. **Dependencies & Assumptions** - Are they documented and validated?
9. **Ambiguities & Conflicts** - What needs clarification?
</checklist_quality_dimensions>

<item_structure>
Each checklist item MUST follow this pattern:

**Format**: "Are [requirement aspect] defined/specified/documented for [scenario]? [Quality Dimension, Spec Reference]"

**Components**:
- Question format asking about requirement quality
- Focus on what's WRITTEN (or not written) in the spec/plan
- Quality dimension tag in brackets: [Completeness], [Clarity], [Consistency], [Coverage], [Measurability]
- Traceability reference: [Spec §X.Y] when checking existing requirements, or [Gap] for missing, [Ambiguity], [Conflict], [Assumption]

**Traceability Requirement**: ≥80% of items MUST include at least one traceability reference
</item_structure>

<item_examples>
✅ **CORRECT** - Testing requirements quality:

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

---

❌ **PROHIBITED** - Testing implementation:
- "Verify landing page displays 3 episode cards" ← tests implementation
- "Test hover states work on desktop" ← tests code
- "Confirm logo click navigates home" ← tests behavior
- Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
- References to code execution, user actions, system behavior
- "Displays correctly", "works properly", "functions as expected"
- "Click", "navigate", "render", "load", "execute"
</item_examples>

<scenario_coverage>
Check if requirements exist for these scenario classes:
- Primary scenarios (happy path)
- Alternate flows
- Exception/Error cases
- Recovery procedures
- Non-Functional requirements (performance, security, accessibility)

For each scenario class:
- Ask: "Are [scenario type] requirements complete, clear, and consistent?"
- If missing: "Are [scenario type] requirements intentionally excluded or missing? [Gap]"
- Include resilience/rollback when state mutation occurs: "Are rollback requirements defined for migration failures? [Gap]"
</scenario_coverage>

<content_consolidation>
If raw candidate items > 40:
- Prioritize by risk/impact
- Merge near-duplicates checking the same requirement aspect
- If >5 low-impact edge cases, create one consolidated item: "Are edge cases X, Y, Z addressed in requirements? [Coverage]"
</content_consolidation>

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

<output_format>
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
</output_format>

---

## Optimization Notes for Haiku 4.5

<optimization_strategy>
This command is optimized for Claude Haiku 4.5's strengths:

1. **Explicit Structure**: XML tags (`<task>`, `<constraints>`, `<output_format>`) and clear section boundaries
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
</optimization_strategy>

---

## Example Checklist Types & Sample Items

### UX Requirements Quality: `ux.md`

Sample items (testing the requirements, NOT the implementation):

- "Are visual hierarchy requirements defined with measurable criteria? [Clarity, Spec §FR-1]"
- "Is the number and positioning of UI elements explicitly specified? [Completeness, Spec §FR-1]"
- "Are interaction state requirements (hover, focus, active) consistently defined? [Consistency]"
- "Are accessibility requirements specified for all interactive elements? [Coverage, Gap]"
- "Is fallback behavior defined when images fail to load? [Edge Case, Gap]"
- "Can 'prominent display' be objectively measured? [Measurability, Spec §FR-4]"

### API Requirements Quality: `api.md`

Sample items:

- "Are error response formats specified for all failure scenarios? [Completeness]"
- "Are rate limiting requirements quantified with specific thresholds? [Clarity]"
- "Are authentication requirements consistent across all endpoints? [Consistency]"
- "Are retry/timeout requirements defined for external dependencies? [Coverage, Gap]"
- "Is versioning strategy documented in requirements? [Gap]"

### Performance Requirements Quality: `performance.md`

Sample items:

- "Are performance requirements quantified with specific metrics? [Clarity]"
- "Are performance targets defined for all critical user journeys? [Coverage]"
- "Are performance requirements under different load conditions specified? [Completeness]"
- "Can performance requirements be objectively measured? [Measurability]"
- "Are degradation requirements defined for high-load scenarios? [Edge Case, Gap]"

### Security Requirements Quality: `security.md`

Sample items:

- "Are authentication requirements specified for all protected resources? [Coverage]"
- "Are data protection requirements defined for sensitive information? [Completeness]"
- "Is the threat model documented and requirements aligned to it? [Traceability]"
- "Are security requirements consistent with compliance obligations? [Consistency]"
- "Are security failure/breach response requirements defined? [Gap, Exception Flow]"

---

## Anti-Examples: What NOT To Do

**❌ WRONG** - These test implementation, not requirements:

```markdown
- [ ] CHK001 - Verify landing page displays 3 episode cards [Spec §FR-001]
- [ ] CHK002 - Test hover states work correctly on desktop [Spec §FR-003]
- [ ] CHK003 - Confirm logo click navigates to home page [Spec §FR-010]
- [ ] CHK004 - Check that related episodes section shows 3-5 items [Spec §FR-005]
```

**✅ CORRECT** - These test requirements quality:

```markdown
- [ ] CHK001 - Are the number and layout of featured episodes explicitly specified? [Completeness, Spec §FR-001]
- [ ] CHK002 - Are hover state requirements consistently defined for all interactive elements? [Consistency, Spec §FR-003]
- [ ] CHK003 - Are navigation requirements clear for all clickable brand elements? [Clarity, Spec §FR-010]
- [ ] CHK004 - Is the selection criteria for related episodes documented? [Gap, Spec §FR-005]
- [ ] CHK005 - Are loading state requirements defined for asynchronous episode data? [Gap]
- [ ] CHK006 - Can "visual hierarchy" requirements be objectively measured? [Measurability, Spec §FR-001]
```

**Key Differences**:

| Wrong Approach | Correct Approach |
|----------------|------------------|
| Tests if the system works correctly | Tests if requirements are written correctly |
| Verification of behavior | Validation of requirement quality |
| "Does it do X?" | "Is X clearly specified?" |
| Implementation test | Requirements test |
| QA checklist | Requirements quality checklist |
