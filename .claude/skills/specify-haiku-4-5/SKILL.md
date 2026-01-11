---
description: Create or update the feature specification from a natural language feature description. Optimized for Claude Haiku 4.5's synthesis and pattern-matching capabilities.
model_override: claude-haiku-4.5
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
  - label: Clarify Spec Requirements
    agent: speckit.clarify
    prompt: Clarify specification requirements
    send: true
---

# Feature Specification - Haiku 4.5 Optimized

## Model Configuration

**Model**: Claude Haiku 4.5  
**Optimization Strategy**: Synthesis + pattern matching, structured template filling, step-bounded reasoning  
**Expected Performance**: 15-25 seconds, 0.33x cost vs Sonnet

## Goal

<goal>
Transform natural language feature description into structured specification document.

**Task Type**: Synthesis + pattern matching (good fit for Haiku with optimization)

- Extract key concepts (actors, actions, data, constraints)
- Make informed guesses for gaps (based on industry standards)
- Fill template sections with coherent narratives
- Validate against quality checklist
  </goal>

## User Input

```text
$ARGUMENTS
```

**IMPORTANT**: The text the user typed after `/specify-haiku-4-5` **is** the feature description. Assume you always have it available even if `$ARGUMENTS` appears literally. Do not ask the user to repeat it unless they provided an empty command.

---

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

### Step 1: Generate Feature Short Name

<short_name_generation>
Analyze the feature description and create a concise branch name (2-4 words):

**Rules**:

- Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
- Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
- Keep lowercase with hyphens
- Must be descriptive enough to understand at a glance

**Examples**:

- "I want to add user authentication" → "user-auth"
- "Implement OAuth2 integration for the API" → "oauth2-api-integration"
- "Create a dashboard for analytics" → "analytics-dashboard"
- "Fix payment processing timeout bug" → "fix-payment-timeout"

**Process**:

1. Extract 2-4 most meaningful keywords from description
2. Combine with hyphens in action-noun order
3. Simplify but preserve technical specificity
   </short_name_generation>

---

### Step 2: Check for Existing Branches & Create Feature

<branch_checking>
**Process**:

1. **Fetch latest remote branches**:

   ```bash
   git fetch --all --prune
   ```

2. **Find highest feature number for this short-name**:
   - Remote branches: `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<short-name>$'`
   - Local branches: `git branch | grep -E '^[* ]*[0-9]+-<short-name>$'`
   - Specs directories: Check for `specs/[0-9]+-<short-name>` directories

3. **Determine next number**:
   - Extract all numbers from all three sources
   - Find highest number N
   - Use N+1 for new branch
   - If no existing branches/directories found: Start with 1

4. **Run create-new-feature script**:
   ```powershell
   pwsh ./.specify/scripts/powershell/create-new-feature.ps1 -Json -Number N+1 -ShortName "your-short-name" "$ARGUMENTS"
   ```

**CRITICAL**:

- Check ALL three sources (remote, local, specs dirs)
- Only match exact short-name pattern
- Run script ONCE per feature
- Parse JSON output for BRANCH_NAME and SPEC_FILE paths
- For single quotes: Use `'I'\''m Groot'` or `"I'm Groot"`
  </branch_checking>

**PowerShell String Escaping**:

- Single quotes in args: `'I'\''m Groot'` or `"I'm Groot"`

---

### Step 3: Load Specification Template

<task>
Load `.specify/templates/spec-template.md` to understand required sections.
</task>

**Purpose**: Understand section structure, headings, and expected content format.

---

### Step 4: Extract Key Concepts & Synthesize Specification

<extraction_synthesis_process>
**This is where Haiku's synthesis capability is critical.**

**Step 4.1: Parse Feature Description**

```
IF description is empty:
  ERROR "No feature description provided"

EXTRACT from description:
- Actors (who uses this?)
- Actions (what do they do?)
- Data (what information is involved?)
- Constraints (limitations, requirements, edge cases)
```

**Step 4.2: Apply Informed Guesses for Gaps**

```
FOR EACH unclear aspect:
  IF has reasonable industry standard default:
    USE standard default
    DOCUMENT in Assumptions section
  ELSE IF multiple viable interpretations exist:
    IF impacts scope/security/UX significantly:
      MARK with [NEEDS CLARIFICATION: specific question]
      LIMIT: Maximum 3 markers total
    ELSE:
      MAKE educated guess based on context
      DOCUMENT in Assumptions section
```

**Prioritization for [NEEDS CLARIFICATION]**:

1. Scope (what's included/excluded)
2. Security/Privacy (data protection, authentication)
3. User Experience (flows, interactions)
4. Technical Details (lowest priority - make informed guess)

**Step 4.3: Synthesize Template Sections**

Use step-bounded reasoning (3-5 steps per section):

**For Feature Overview**:

1. Extract core purpose from description
2. Identify primary user benefit
3. Synthesize 2-3 sentence summary

**For User Scenarios**:

1. Identify primary actor from description
2. List sequential actions in user flow
3. Define happy path first, then alternates
   IF no clear flow can be determined:
   ERROR "Cannot determine user scenarios from description"

**For Functional Requirements**:

1. Extract must-have capabilities from description
2. Each requirement = testable statement
3. Use "The system shall..." format
4. Apply reasonable defaults for unspecified details

**For Success Criteria**:

1. Define measurable outcomes (quantitative)
2. Define qualitative measures (satisfaction, completion)
3. Each criterion must be verifiable
4. NO implementation details (technology-agnostic)

**For Key Entities** (if data involved):

1. Identify nouns from description (User, Order, Product...)
2. List core attributes per entity
3. Note relationships between entities
   </extraction_synthesis_process>

---

### Step 5: Write Specification to SPEC_FILE

<specification_writing>
Write spec.md to SPEC_FILE using template structure:

**Preserve**:

- Section order from template
- Heading hierarchy
- Placeholder format

**Fill with**:

- Concrete details from feature description
- Synthesized narratives (user scenarios, requirements)
- Informed guesses (documented in Assumptions)
- [NEEDS CLARIFICATION: ...] markers (max 3)

**Avoid**:

- Implementation details (languages, frameworks, APIs)
- Technical jargon (write for non-technical stakeholders)
- Ambiguous requirements (each must be testable)
  </specification_writing>

---

### Step 6: Specification Quality Validation

<validation_process>
After writing initial spec, validate against quality criteria.

**Step 6.1: Create Spec Quality Checklist**

Generate `FEATURE_DIR/checklists/requirements.md`:

```markdown
# Specification Quality Checklist: [FEATURE NAME]

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: [DATE]
**Feature**: [Link to spec.md]

## Content Quality

- [ ] CHK001 No implementation details (languages, frameworks, APIs)
- [ ] CHK002 Focused on user value and business needs
- [ ] CHK003 Written for non-technical stakeholders
- [ ] CHK004 All mandatory sections completed

## Requirement Completeness

- [ ] CHK005 No [NEEDS CLARIFICATION] markers remain
- [ ] CHK006 Requirements are testable and unambiguous
- [ ] CHK007 Success criteria are measurable
- [ ] CHK008 Success criteria are technology-agnostic (no implementation details)
- [ ] CHK009 All acceptance scenarios are defined
- [ ] CHK010 Edge cases are identified
- [ ] CHK011 Scope is clearly bounded
- [ ] CHK012 Dependencies and assumptions identified

## Feature Readiness

- [ ] CHK013 All functional requirements have clear acceptance criteria
- [ ] CHK014 User scenarios cover primary flows
- [ ] CHK015 Feature meets measurable outcomes defined in Success Criteria
- [ ] CHK016 No implementation details leak into specification

## Notes

- Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`
```

**Step 6.2: Run Validation Check**

Review spec against each checklist item:

```
FOR EACH checklist_item:
  EVALUATE against spec content
  IF fails:
    RECORD specific issue (quote relevant spec section)
```

**Step 6.3: Handle Validation Results**

**Case A: All items pass**

- Mark checklist complete
- Proceed to Step 7

**Case B: Items fail (excluding [NEEDS CLARIFICATION])**

1. List failing items and specific issues
2. Update spec to address each issue
3. Re-run validation (max 3 iterations)
4. If still failing after 3 iterations:
   - Document remaining issues in checklist notes
   - Warn user

**Case C: [NEEDS CLARIFICATION] markers remain**

1. Extract all [NEEDS CLARIFICATION: ...] markers from spec
2. **LIMIT CHECK**: If >3 markers, keep only top 3 by priority (scope→security→UX→technical)
3. For each marker (max 3), present options to user:

```markdown
## Question [N]: [Topic]

**Context**: [Quote relevant spec section]

**What we need to know**: [Specific question from marker]

**Suggested Answers**:

| Option | Answer                  | Implications                  |
| ------ | ----------------------- | ----------------------------- |
| A      | [First suggestion]      | [Impact on feature]           |
| B      | [Second suggestion]     | [Impact on feature]           |
| C      | [Third suggestion]      | [Impact on feature]           |
| Custom | Provide your own answer | [How to provide custom input] |

**Your choice**: _[Wait for user response]_
```

4. **Table Formatting** (CRITICAL):
   - Consistent spacing: `| Content |` not `|Content|`
   - Header separator: `|--------|` (at least 3 dashes)
   - Test markdown rendering

5. Number questions Q1, Q2, Q3 (max 3 total)
6. Present all questions together
7. Wait for user responses (e.g., "Q1: A, Q2: Custom - [details], Q3: B")
8. Update spec: Replace each [NEEDS CLARIFICATION] with user's answer
9. Re-run validation

**Step 6.4: Update Checklist**

After each validation iteration, update checklist with current pass/fail status.
</validation_process>

---

### Step 7: Report Completion

<output_format>
**✅ Feature Specification Created**

1. **Branch**: [BRANCH_NAME from JSON]
2. **Spec File**: [Full absolute path to SPEC_FILE]
3. **Checklist**: [Path to requirements.md]

4. **Validation Results**:
   - Content Quality: [Pass/Fail count]
   - Requirement Completeness: [Pass/Fail count]
   - Feature Readiness: [Pass/Fail count]
   - Overall Status: [✅ Ready / ⚠️ Needs attention]

5. **[NEEDS CLARIFICATION] Markers**:
   - [List any remaining markers if present]

6. **Next Steps**:
   - If all validations pass: "Ready for `/speckit.clarify` or `/speckit.plan`"
   - If clarifications needed: "Answer questions above, then re-run validation"
   - If issues remain: "Review checklist and update spec"

**Note**: The script created and checked out the new branch automatically.
</output_format>

---

## Optimization Notes for Haiku 4.5

<optimization_strategy>
This command is optimized for Haiku 4.5's strengths:

1. **Synthesis + Pattern Matching**: Extract concepts AND synthesize narratives
2. **Step-Bounded Reasoning**: 3-5 steps per section (prevents runaway verbosity)
3. **Informed Guess Rules**: Clear criteria for when to guess vs ask
4. **Structured Template Filling**: Haiku excels at filling predefined structures
5. **Validation Checklist**: Built-in quality control (Haiku's strength)
6. **Prioritization Formula**: Scope→Security→UX→Technical (mechanical ordering)
7. **Maximum 3 Clarifications**: Prevents over-questioning, forces synthesis

**Performance Expectations**:

- **Speed**: 15-25 seconds
- **Cost**: 0.33x vs Sonnet 4.5
- **Quality**: 85-90% of Sonnet for specification synthesis
- **Best for**: Typical feature descriptions requiring some inference

**Why Haiku Works Here**:

- Has reasoning capability (unlike GPT-4.1/GPT-5 Mini)
- Can synthesize coherent narratives (not just pattern matching)
- Follows templates well
- Good at making informed guesses with context
- Strong validation/checklist execution

**Limitations vs Sonnet**:

- May need more explicit guidance for novel architectures
- Slightly weaker at detecting implicit requirements
- Better with templates than freeform synthesis
- Less creative in user scenario generation

**When to Use Sonnet Instead**:

- Highly novel features without similar examples
- Complex multi-system features requiring deep synthesis
- When specification quality is more critical than speed/cost
  </optimization_strategy>

---

## Context for Specification

```text
$ARGUMENTS
```

Use feature description to:

- Identify domain-specific patterns
- Apply industry standard defaults
- Infer reasonable assumptions
- Generate appropriate user scenarios
