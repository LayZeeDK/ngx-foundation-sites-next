---
description: Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions. Optimized for Claude Haiku 4.5's speed and pattern-matching capabilities.
model_override: claude-haiku-4.5
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
---

# Spec Clarification - Haiku 4.5 Optimized

## Model Configuration

**Model**: Claude Haiku 4.5  
**Optimization Strategy**: Structured taxonomy scan, step-bounded reasoning, explicit question criteria  
**Expected Performance**: 15-25 seconds for analysis + question generation, 0.33x cost vs Sonnet

## Goal

<goal>
Detect and reduce ambiguity or missing decision points in the active feature specification.
Record clarifications directly in the spec file through interactive Q&A.

**Timing**: This clarification workflow runs BEFORE `/speckit.plan`.
**Warning**: If user skips clarification, downstream rework risk increases.
</goal>

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Path Grounding (CRITICAL)

<path_rules>

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script
- All file paths must be absolute
  </path_rules>

---

## Execution Steps

### Step 1: Setup & Path Discovery (AUTO-DETECT)

<task>
**IMMEDIATELY** run the prerequisite check. Do NOT ask the user which feature to clarify.
The script auto-detects the feature from the current git branch.
</task>

<critical>
**NO USER CONFIRMATION REQUIRED**: Execute this command as your FIRST action.
The script uses `git rev-parse --abbrev-ref HEAD` to detect the branch (e.g., `002-accordion-component`)
and derives the feature directory automatically (`specs/002-accordion-component/`).
</critical>

<evaluation_criteria>
**Success**: Script executes, JSON output parsed, FEATURE_DIR extracted
**Failure**: Asking "Which feature?" or "What should I clarify?" BEFORE running the script
</evaluation_criteria>

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly
```

**Parse JSON output for**:

- `FEATURE_DIR`: Absolute path to feature directory
- `FEATURE_SPEC`: Absolute path to spec.md file
- (Optional) `IMPL_PLAN`, `TASKS`: For future chained flows

**Error Handling**:

- If JSON parsing fails: Abort and instruct user to run `/speckit.specify` first
- If spec file missing: Cannot proceed, instruct user to create spec first

**PowerShell String Escaping**:

- For single quotes in args like "I'm Groot", use: `'I'\''m Groot'`
- Or use double quotes: `"I'm Groot"`

---

### Step 2: Load Spec & Perform Coverage Scan

<context_loading>
Load the current spec file from FEATURE_SPEC path.

**Strategy**: Full read required (cannot use progressive disclosure for ambiguity detection).
</context_loading>

<coverage_taxonomy>
Perform structured scan using this taxonomy. For each category, mark status: Clear / Partial / Missing.

**Taxonomy Categories** (in priority order):

1. **Functional Scope & Behavior**
   - Core user goals & success criteria
   - Explicit out-of-scope declarations
   - User roles / personas differentiation

2. **Domain & Data Model**
   - Entities, attributes, relationships
   - Identity & uniqueness rules
   - Lifecycle/state transitions
   - Data volume / scale assumptions

3. **Interaction & UX Flow**
   - Critical user journeys / sequences
   - Error/empty/loading states
   - Accessibility or localization notes

4. **Non-Functional Quality Attributes**
   - Performance (latency, throughput targets)
   - Scalability (horizontal/vertical, limits)
   - Reliability & availability (uptime, recovery)
   - Observability (logging, metrics, tracing)
   - Security & privacy (authN/Z, data protection, threat assumptions)
   - Compliance / regulatory constraints

5. **Integration & External Dependencies**
   - External services/APIs and failure modes
   - Data import/export formats
   - Protocol/versioning assumptions

6. **Edge Cases & Failure Handling**
   - Negative scenarios
   - Rate limiting / throttling
   - Conflict resolution (e.g., concurrent edits)

7. **Constraints & Tradeoffs**
   - Technical constraints (language, storage, hosting)
   - Explicit tradeoffs or rejected alternatives

8. **Terminology & Consistency**
   - Canonical glossary terms
   - Avoided synonyms / deprecated terms

9. **Completion Signals**
   - Acceptance criteria testability
   - Measurable Definition of Done indicators

10. **Misc / Placeholders** - TODO markers / unresolved decisions - Ambiguous adjectives ("robust", "intuitive") lacking quantification
    </coverage_taxonomy>

<prioritization_rules>
For each category with Partial or Missing status:

- Add candidate question opportunity ONLY IF:
  - Clarification would materially change implementation OR validation strategy
  - Information is NOT better deferred to planning phase

Calculate priority: Impact × Uncertainty

- Impact: How much does this affect architecture/data model/tests/UX/ops/compliance?
- Uncertainty: How ambiguous or missing is this information?
  </prioritization_rules>

**Output**: Internal coverage map with priorities (do not display unless no questions generated).

---

### Step 3: Generate Question Queue (Maximum 5)

<question_constraints>
Generate prioritized queue of clarification questions (maximum 5 total).

**Hard Constraints**:

- Maximum 10 questions total across entire session
- Each question answerable with EITHER:
  - Multiple-choice (2-5 distinct, mutually exclusive options), OR
  - Short answer (≤5 words)
- Only include questions whose answers materially impact:
  - Architecture
  - Data modeling
  - Task decomposition
  - Test design
  - UX behavior
  - Operational readiness
  - Compliance validation

**Exclusion Criteria**:

- Already answered in spec
- Trivial stylistic preferences
- Plan-level execution details (unless blocking correctness)
- Would not reduce downstream rework risk
- Would not prevent misaligned acceptance tests

**Balance Requirement**:

- Cover highest impact unresolved categories first
- Avoid asking two low-impact questions when high-impact area (e.g., security) unresolved
- If >5 categories unresolved, select top 5 by (Impact × Uncertainty)
  </question_constraints>

<question_format_rules>
For each question, determine best format:

**Multiple-Choice** (when discrete options exist):

- 2-5 mutually exclusive options
- Each option should be viable and distinct
- Include "Short" option for free-form answer if appropriate

**Short Answer** (when no meaningful discrete options):

- Constrain to ≤5 words
- Provide suggested answer based on best practices
  </question_format_rules>

**Output**: Internal queue of 0-5 questions (do not display all at once).

---

### Step 4: Interactive Questioning Loop

<questioning_process>
Present EXACTLY ONE question at a time.

**For Multiple-Choice Questions**:

1. **Analyze all options** and determine most suitable based on:
   - Best practices for project type
   - Common patterns in similar implementations
   - Risk reduction (security, performance, maintainability)
   - Alignment with explicit project goals/constraints in spec

2. **Present recommendation prominently**:

   ```
   **Recommended:** Option [X] - <reasoning in 1-2 sentences>
   ```

3. **Render options table**:

   ```markdown
   | Option | Description                               |
   | ------ | ----------------------------------------- |
   | A      | <Option A description>                    |
   | B      | <Option B description>                    |
   | C      | <Option C description>                    |
   | Short  | Provide different short answer (≤5 words) |
   ```

4. **Add instruction**:
   ```
   You can reply with option letter (e.g., "A"), accept recommendation by saying "yes" or "recommended", or provide your own short answer.
   ```

**For Short-Answer Questions**:

1. **Provide suggested answer**:

   ```
   **Suggested:** <your proposed answer> - <brief reasoning>
   ```

2. **Add instruction**:
   ```
   Format: Short answer (≤5 words). Accept suggestion by saying "yes" or "suggested", or provide your own answer.
   ```

**After User Answers**:

- If "yes", "recommended", or "suggested" → Use your stated recommendation/suggestion
- Otherwise → Validate answer maps to option OR fits ≤5 word constraint
- If ambiguous → Ask quick disambiguation (does NOT count as new question)
- Once satisfactory → Record in working memory, move to next question

**Termination Conditions**:

- All critical ambiguities resolved (remaining queue becomes unnecessary), OR
- User signals completion ("done", "good", "no more"), OR
- 5 questions asked

**Never reveal future queued questions in advance.**
</questioning_process>

<no_questions_case>
If no valid questions exist at start:

- Report: "No critical ambiguities detected worth formal clarification."
- Suggest proceeding to `/speckit.plan`
  </no_questions_case>

---

### Step 5: Integrate Answers into Spec (After EACH Answer)

<incremental_integration>
After each accepted answer, immediately update spec file.

**First Answer in Session**:

1. Ensure `## Clarifications` section exists
   - Create it after highest-level overview section if missing
2. Create `### Session YYYY-MM-DD` subheading for today if missing

**For Each Answer**:

1. Append bullet to Clarifications session:

   ```markdown
   - Q: <question> → A: <final answer>
   ```

2. Apply clarification to appropriate section(s):
   - **Functional ambiguity** → Update/add bullet in Functional Requirements
   - **User interaction/actor** → Update User Stories or Actors subsection
   - **Data shape/entities** → Update Data Model (add fields, types, relationships)
   - **Non-functional constraint** → Add/modify measurable criteria in NFR section
   - **Edge case/negative flow** → Add bullet under Edge Cases / Error Handling
   - **Terminology conflict** → Normalize term across spec

3. **Replace** (don't duplicate) if clarification invalidates earlier ambiguous statement

4. **Save spec file** AFTER each integration (atomic overwrite)

5. **Preserve formatting**:
   - Don't reorder unrelated sections
   - Keep heading hierarchy intact
   - Keep clarifications minimal and testable
     </incremental_integration>

---

### Step 6: Validation (After Each Write + Final Pass)

<validation_checklist>
After EACH write plus final pass, verify:

- [ ] Clarifications session contains exactly one bullet per accepted answer (no duplicates)
- [ ] Total asked (accepted) questions ≤ 5
- [ ] Updated sections contain no lingering vague placeholders
- [ ] No contradictory earlier statement remains
- [ ] Markdown structure valid
- [ ] Only allowed new headings: `## Clarifications`, `### Session YYYY-MM-DD`
- [ ] Terminology consistency: same canonical term used across all updated sections
      </validation_checklist>

---

### Step 7: Report Completion

<output_format>
After questioning loop ends or early termination:

**📋 Clarification Summary**

1. **Questions Asked & Answered**: [Number]
2. **Updated Spec**: [Full absolute path to FEATURE_SPEC]
3. **Sections Touched**: [List section names]
4. **Coverage Summary**:

   | Category     | Status                                    | Notes        |
   | ------------ | ----------------------------------------- | ------------ |
   | [Category 1] | Resolved / Deferred / Clear / Outstanding | [Brief note] |
   | [Category 2] | ...                                       | ...          |

   **Status Definitions**:
   - **Resolved**: Was Partial/Missing, now addressed
   - **Deferred**: Exceeds question quota or better suited for planning
   - **Clear**: Already sufficient
   - **Outstanding**: Still Partial/Missing but low impact

5. **Recommendation**:
   - If Outstanding/Deferred remain: [Suggest proceed to `/speckit.plan` OR run `/speckit.clarify` again]
   - If all Clear/Resolved: "Proceed to `/speckit.plan`"

**Next Steps**:

- Review updated spec for accuracy
- Run `/speckit.plan` to create technical plan
  </output_format>

---

## Behavior Rules

<behavior_constraints>

- **NEVER ask the user which feature to clarify** — run the prerequisite script FIRST; it auto-detects from git branch
- If no meaningful ambiguities found: Report "No critical ambiguities detected" and suggest proceeding
- If spec file missing: Instruct user to run `/speckit.specify` first
- Never exceed 5 total asked questions (clarification retries don't count as new)
- Avoid speculative tech stack questions unless absence blocks functional clarity
- Respect user early termination signals ("stop", "done", "proceed")
- If no questions asked due to full coverage: Output compact coverage summary, suggest advancing
- If quota reached with unresolved high-impact categories: Flag them under Deferred with rationale
  </behavior_constraints>

---

## Optimization Notes for Haiku 4.5

<optimization_strategy>
This command is optimized for Haiku 4.5's strengths:

1. **Structured Taxonomy**: Explicit 10-category checklist for systematic scan
2. **Step-Bounded**: 7 concrete steps, no open-ended exploration
3. **Pattern Matching**: Identify gaps via keyword/structure recognition
4. **Explicit Criteria**: Clear rules for what counts as ambiguous/missing
5. **Incremental Updates**: Small, atomic file writes after each answer
6. **Checklists Built-In**: Validation checklist, coverage summary table
7. **Prioritization Formula**: Impact × Uncertainty (mechanical calculation)

**Performance Expectations**:

- **Analysis Speed**: 15-25 seconds (vs 30-45s with Sonnet)
- **Cost**: 0.33x vs Sonnet 4.5
- **Quality**: 85-90% of Sonnet for ambiguity detection
- **Best for**: Structured gap identification with predefined taxonomy

**Limitations vs Sonnet**:

- May miss subtle conceptual ambiguities requiring deep reasoning
- Better at detecting missing sections than inferring implicit assumptions
- Recommendations based on common patterns, not deep architectural analysis

**When to Use Sonnet Instead**:

- Complex architectural decisions requiring multi-step reasoning
- Novel/unusual project types without established patterns
- Deep synthesis across multiple interconnected ambiguities
  </optimization_strategy>

---

## Context for Prioritization

```text
$ARGUMENTS
```

Use user input to adjust:

- Which taxonomy categories to prioritize
- What counts as "high impact" for this specific feature
- Domain-specific best practices to apply
