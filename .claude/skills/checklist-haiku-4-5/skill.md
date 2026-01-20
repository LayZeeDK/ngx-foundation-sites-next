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

### Step 1: Setup & Path Discovery (AUTO-DETECT)

<task>
**IMMEDIATELY** run the prerequisite check. Do NOT ask the user which feature to process.
The script auto-detects the feature from the current git branch.
</task>

<critical>
**NO USER CONFIRMATION REQUIRED**: Execute this command as your FIRST action.
The script uses `git rev-parse --abbrev-ref HEAD` to detect the branch (e.g., `002-accordion-component`)
and derives the feature directory automatically (`specs/002-accordion-component/`).
</critical>

<evaluation_criteria>
**Success**: Script executes, JSON output parsed, FEATURE_DIR extracted
**Failure**: Asking "Which feature?" or "What should I check?" BEFORE running the script
</evaluation_criteria>

```bash
# Get resolved core artifact paths
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly

# Get available optional docs
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json
```

**Parse both JSON outputs:**

From -PathsOnly:
```
FEATURE_DIR = json1.FEATURE_DIR
FEATURE_SPEC = json1.FEATURE_SPEC
IMPL_PLAN = json1.IMPL_PLAN (if present)
TASKS = json1.TASKS (if present)
```

From -Json:
```
AVAILABLE_DOCS = json2.AVAILABLE_DOCS
```

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

### Step 3: Load Feature Context (with Semantic Chunking)

<context_loading_strategy>
Load artifacts using semantic section chunking for files > 1,250 lines (~25K tokens).

**Strategy**: Use full read for small files, semantic section reading for large files.

Based on research-backed best practices from [CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md](../../../prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md).

**Load artifacts using resolved paths:**

**FEATURE_SPEC** (semantic chunking if > 1,250 lines):

```
# Step 1: Discover section boundaries (if file is large)
Grep(
  pattern: "^#{1,3}\\s+",
  path: FEATURE_SPEC,
  output_mode: "content",
  -n: true  # Include line numbers
)

# Step 2: Parse section ranges and identify relevant sections based on focus areas
# Map focus areas to spec sections:
# - UX/UI focus → "User Interface Requirements", "Interaction Patterns", "Visual Design"
# - API focus → "API Requirements", "Endpoints", "Data Contracts"
# - Security focus → "Security Requirements", "Authentication", "Authorization"
# - Performance focus → "Non-Functional Requirements", "Performance", "Scalability"
# - ALL focus → "Functional Requirements", "User Stories", "Acceptance Criteria"

sections_needed = identify_sections_for_focus_areas(user_focus_areas)

# Step 3: Read only relevant sections
FOR EACH section IN sections_needed:
  IF section exists in sections_map:
    Read(FEATURE_SPEC, offset=section.start, limit=section.lines)
    EXTRACT requirements (FR-XXX, NFR-XXX)
    EXTRACT user stories
    EXTRACT acceptance criteria
    ACCUMULATE into requirements inventory

# Step 4: Skip irrelevant sections
# Example: If focus is "API", skip "Visual Design", "Interaction Patterns"
# Example: If focus is "UX", skip "Database Schema", "Infrastructure"
```

**IMPL_PLAN** (if present) - Semantic chunking if > 1,250 lines:

```
sections_needed = [
  "Technical Details",
  "Architecture",
  "Technology Stack",
  "Implementation Approach"
]

FOR EACH section IN sections_needed:
  Read(IMPL_PLAN, offset=section.start, limit=section.lines)
  EXTRACT technical constraints
  EXTRACT design decisions
```

**TASKS** (if present) - Full read (typically structured/small):

```
Read(TASKS)  # Tasks files are typically well-structured and <500 lines
EXTRACT task descriptions for traceability
```

**Why semantic chunking works for checklist generation**:

Checklist generation is **focus-area driven** and **section-aligned**:
- ✅ **UX checklist**: Only needs UI/Interaction/Visual Design sections
- ✅ **API checklist**: Only needs API/Endpoints/Contracts sections
- ✅ **Security checklist**: Only needs Security/Auth/Privacy sections
- ✅ **Performance checklist**: Only needs NFR/Performance sections

**Key insight**: User specifies focus area → Load ONLY relevant sections. No need to load entire spec.md.

**Benefits**:
- ✅ Focus-driven loading (only sections matching user's intent)
- ✅ Skip irrelevant sections (significantly reduces tokens)
- ✅ Same checklist quality as full read (generation is section-local)
- ✅ Better token distribution for multiple focus areas

**Cost Impact**: Significant savings when spec.md is large and focus is narrow (e.g., only UX → skip API, Security, Performance sections)
  </context_loading_strategy>

### Step 3b: Content Loading Validation (MANDATORY)

<critical>
**BEFORE proceeding to Step 4 (Generate Checklist), verify you loaded CONTENT not just STRUCTURE.**

This validation prevents the common failure mode of reading headers only via Grep.
</critical>

<validation_checklist>
**For FEATURE_SPEC**:
- [ ] Can you quote a specific requirement from the loaded sections (FR-XXX with full description)?
- [ ] Can you identify specific user stories or acceptance criteria?
- [ ] Can you name specific requirement aspects that need quality checks (e.g., "visual hierarchy", "error handling")?
- [ ] Did you capture the actual requirement text (not just "FR-001 exists")?

**For IMPL_PLAN** (if present):
- [ ] Can you identify specific technology choices or design decisions?
- [ ] Can you quote technical constraints that might affect requirements?

**Focus area validation**:
- [ ] If focus is "UX": Can you quote UI/interaction/visual requirements?
- [ ] If focus is "API": Can you quote endpoint/contract requirements?
- [ ] If focus is "Security": Can you quote authentication/authorization requirements?
- [ ] If focus is "Performance": Can you quote timing/throughput requirements?

**If you answered "NO" to any question above**:
1. STOP immediately
2. Re-read the affected sections using Read(file, offset, limit)
3. Validate again before proceeding to Step 4

**Common Failure Pattern to Avoid**:
```
❌ WRONG: Using Grep(pattern: "^#{1,3}\\s+") to read headers only
         → You get: "## Functional Requirements" but NOT the FR-XXX requirement text
         → Result: Generic checklist items with no traceability
✅ CORRECT: Using Read(file, offset, limit) after Grep identifies boundaries
         → You get: "FR-001: User can upload files up to 10MB" (full requirement)
         → Result: Specific checklist items like "Is file size limit quantified? [Clarity, FR-001]"
```
</validation_checklist>

<evaluation_criteria>
**Success**: You can quote specific requirements with their full descriptions and generate traceable checklist items
**Failure**: You only have section titles but not requirement content; checklist items lack specific references
</evaluation_criteria>

---

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

**Context Window Management**:

This skill uses **semantic section reading** based on Anthropic's official guidance, preventing false positives from header-only reads.

**Why semantic chunking works for checklist generation**:
- Checklist generation is **focus-area driven** (user specifies UX, API, Security, etc.)
- Each focus area maps to specific spec sections (UX → UI/Interaction/Visual sections)
- Checklist items are generated **per requirement** within the focus area
- No cross-section reasoning required (UX checklist doesn't need Security requirements)

**Focus-Driven Token Optimization**:
- **Narrow focus** (e.g., "UX only"): Load 20-30% of spec.md (skip API, Security, Backend sections)
- **Multiple focus areas** (e.g., "UX + API"): Load 40-60% of spec.md (skip unrelated sections)
- **Comprehensive checklist**: Load all requirement sections (skip Background, Goals, Historical Context)

**Alignment with Haiku 4.5 Best Practices** (prompt-engineering/CLAUDE-HAIKU-4-5-OPTIMIZATION.md):
- "Context Window Management: Use only as much context as required per operation"
- "Optimized Input Length: Send only relevant sections, not entire files"
- **Correct interpretation**: "Minimal context" = focus-relevant sections WITH content, NOT structure-only
- Checklist generation is **mechanical extraction** from requirements → Benefits from targeted section reading

**Traceability Impact**:
- Semantic chunking enables specific traceability (e.g., "[Clarity, FR-001]")
- Header-only reads produce vague references (e.g., "[Completeness, Requirements section]")
- ≥80% traceability requirement achievable ONLY with content capture

**Cost Impact**: Significant savings when focus is narrow (e.g., UX-only checklist on 1,400-line spec → 70% token reduction)
**Quality Impact**: HIGH — Content loading enables specific, traceable checklist items instead of generic placeholders
**Documentation**: See [CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md](../../../prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md) for full research
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
