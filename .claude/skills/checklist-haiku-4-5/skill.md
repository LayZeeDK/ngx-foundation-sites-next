---
description: Generate a custom checklist for the current feature based on user requirements. Optimized for Claude Haiku 4.5's speed and cost efficiency.
model_override: claude-haiku-4.5
---

# Checklist Generation - Haiku 4.5 Optimized

## Model Configuration

**Model**: Claude Haiku 4.5  
**Optimization Strategy**: Structured prompts, step-bounded reasoning, explicit constraints  
**Expected Performance**: 10-15 seconds, 0.33x cost vs Sonnet

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

## User Input

```text
$ARGUMENTS
```

## Execution Steps

### Step 1: Setup & Path Discovery

<task>
Run prerequisite check to get absolute paths.
</task>

```bash
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json
```

Parse JSON for:

- `FEATURE_DIR` (absolute path)
- `AVAILABLE_DOCS` (list of existing files)

**Path Rules**:

- Use absolute paths only
- Do NOT synthesize or guess paths
- If path missing, STOP and re-run prerequisite script

### Step 2: Clarify Intent (Maximum 3 Questions)

<constraints>
- Generate 0-3 contextual questions based on user input
- Skip questions if already answered in $ARGUMENTS
- Focus on information that materially changes checklist content
- Use tables for options (max 5 choices)
- Never ask user to restate what they already said
</constraints>

<question_archetypes>

1. **Scope refinement**: "Should this include integration touchpoints or stay limited to local module?"
2. **Risk prioritization**: "Which risk areas should receive mandatory gating checks?"
3. **Depth calibration**: "Is this a pre-commit sanity list or formal release gate?"
4. **Audience framing**: "Will this be used by author only or peers during PR review?"
5. **Boundary exclusion**: "Should we explicitly exclude performance tuning items?"
6. **Scenario gap**: "Are rollback/partial failure paths in scope?"
   </question_archetypes>

**Defaults if interaction impossible**:

- Depth: Standard
- Audience: Reviewer (PR) if code-related; Author otherwise
- Focus: Top 2 relevance clusters from user input

### Step 3: Load Feature Context

<context_loading_strategy>
Efficient, targeted loading - NOT full-file dumping:

1. Load ONLY sections relevant to active focus areas
2. Summarize long sections into concise bullets
3. Progressive disclosure: add more only if gaps detected
4. If docs are large (>500 lines), generate interim summaries

Read from FEATURE_DIR:

- spec.md: Requirements and scope (prioritize FR/NFR sections)
- plan.md (if exists): Technical details, dependencies
- tasks.md (if exists): Implementation tasks
  </context_loading_strategy>

### Step 4: Generate Checklist

<output_structure>
Create `FEATURE_DIR/checklists/` directory if needed.

Filename format: `[domain].md`

- Use short, descriptive domain name (e.g., `ux.md`, `api.md`, `security.md`)
- If file exists, append to it
- Each run creates NEW file (never overwrites)

Number items sequentially: CHK001, CHK002, CHK003...
</output_structure>

<checklist_quality_dimensions>
Group items by these requirement quality categories:

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

- Question format about requirement quality
- Focus on what's WRITTEN (or missing) in spec/plan
- Quality dimension tag: [Completeness], [Clarity], [Consistency], [Coverage], [Measurability]
- Traceability: [Spec §X.Y] or [Gap], [Ambiguity], [Conflict], [Assumption]

**Required**: ≥80% of items MUST include traceability reference
</item_structure>

<item_examples>
✅ CORRECT - Testing requirements quality:

Completeness:

- "Are error handling requirements defined for all API failure modes? [Gap]"
- "Are accessibility requirements specified for all interactive elements? [Completeness]"

Clarity:

- "Is 'fast loading' quantified with specific timing thresholds? [Clarity, Spec §NFR-2]"
- "Are 'related episodes' selection criteria explicitly defined? [Clarity, Spec §FR-5]"

Consistency:

- "Do navigation requirements align across all pages? [Consistency, Spec §FR-10]"

Coverage:

- "Are requirements defined for zero-state scenarios? [Coverage, Edge Case]"

Measurability:

- "Can visual hierarchy requirements be objectively verified? [Measurability, Spec §FR-1]"

❌ PROHIBITED - Testing implementation:

- "Verify landing page displays 3 episode cards"
- "Test hover states work on desktop"
- "Confirm logo click navigates home"
- Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
  </item_examples>

<scenario_coverage>
Check if requirements exist for:

- Primary scenarios
- Alternate flows
- Exception/Error cases
- Recovery procedures
- Non-Functional requirements (performance, security, a11y)

For each scenario class:

- Ask: "Are [scenario type] requirements complete, clear, and consistent?"
- If missing: "Are [scenario type] requirements intentionally excluded or missing? [Gap]"
  </scenario_coverage>

<content_consolidation>
If candidate items > 40:

- Prioritize by risk/impact
- Merge near-duplicates checking same requirement aspect
- If >5 low-impact edge cases, consolidate into one item
  </content_consolidation>

### Step 5: Structure Output

Follow template from `.specify/templates/checklist-template.md`:

```markdown
# [CHECKLIST TYPE] Checklist: [FEATURE NAME]

**Purpose**: [Brief description]
**Created**: [DATE]
**Feature**: [Link to spec.md]

## [Category 1: e.g., Requirement Completeness]

- [ ] CHK001 [First requirement quality item with traceability]
- [ ] CHK002 [Second requirement quality item]

## [Category 2: e.g., Requirement Clarity]

- [ ] CHK003 [Item checking for ambiguities]
- [ ] CHK004 [Item checking for measurability]

## Notes

- Check items off as completed: `[x]`
- Add comments or findings inline
- Link to relevant resources
```

### Step 6: Report Results

<output_format>
Output in this exact structure:

1. **Checklist Created**: [Full absolute path to checklist file]
2. **Item Count**: [Number of items generated]
3. **Configuration**:
   - Focus areas: [List selected focus areas]
   - Depth level: [Standard/Lightweight/Comprehensive]
   - Audience: [Author/Reviewer/QA/Release]
4. **Must-Have Items**: [List any user-specified items incorporated]
5. **Reminder**: Each `/checklist-haiku-4-5` run creates a new file

**Next Steps**:

- Review checklist for completeness
- Run additional checklists for different domains if needed
- Use checklist to validate requirements quality
  </output_format>

## Optimization Notes for Haiku 4.5

<optimization_strategy>
This command is optimized for Haiku 4.5's strengths:

1. **Explicit Structure**: XML tags and clear section boundaries
2. **Step-Bounded**: 6 concrete steps, no open-ended exploration
3. **Mechanical Procedure**: FOR EACH requirement → generate quality check item
4. **Checklists**: Output format matches Haiku's strength (structured, verifiable)
5. **Constraints First**: Prohibited patterns clearly defined upfront
6. **Context Economy**: Progressive disclosure prevents token bloat
7. **Validation Built-In**: ≥80% traceability requirement

**Expected Performance**:

- Speed: 10-15 seconds (vs 20-30s with Sonnet)
- Cost: 0.33x vs Sonnet 4.5
- Quality: 90-95% of Sonnet output for this mechanical task
  </optimization_strategy>

## Example Checklist Types

**UX Requirements Quality**: `ux.md`

- Focus: Visual design, interaction patterns, accessibility requirements
- Items check if requirements are complete, clear, measurable

**API Requirements Quality**: `api.md`

- Focus: Endpoints, contracts, error handling, versioning
- Items check if API specifications are unambiguous and testable

**Performance Requirements Quality**: `performance.md`

- Focus: Timing, throughput, resource usage requirements
- Items check if performance requirements are quantified and measurable

**Security Requirements Quality**: `security.md`

- Focus: Authentication, authorization, data protection requirements
- Items check if security requirements align with threat model
