---
description: Create or update the feature specification from a natural language feature description. Optimized for Claude Haiku 4.5's synthesis and pattern-matching capabilities.
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
  - label: Clarify Spec Requirements
    agent: speckit.clarify
    prompt: Clarify specification requirements
    send: true
---

## Model Selection

**Preferred Model**: Claude Haiku 4.5 (`claude-haiku-4.5`)  
**Invoke with**: `gh copilot -m "claude-haiku-4.5" slash specify-haiku-4-5`

**Optimization Strategy**: Synthesis + pattern matching, structured template filling, step-bounded reasoning  
**Expected Performance**: 15-25 seconds, 0.33x cost vs Sonnet 4.5

---

## Goal

<goal>
Transform natural language feature description into structured specification document.

**Task Type**: Synthesis + pattern matching (good fit for Haiku with optimization)
- Extract key concepts (actors, actions, data, constraints)
- Make informed guesses for gaps (based on industry standards)
- Fill template sections with coherent narratives
- Validate against quality checklist
</goal>

---

## User Input

```text
$ARGUMENTS
```

**IMPORTANT**: The text the user typed after `/specify-haiku-4-5` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `$ARGUMENTS` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

---

## Path Grounding (CRITICAL)

<path_rules>
- Do **not** guess or "fix up" filesystem paths (e.g. avoid fallback paths like `/Users/...`)
- Treat paths emitted by the `.specify` PowerShell scripts (`-Json` output) as the **only source of truth**; use them verbatim
- If a required path is missing/unclear, STOP and re-run the prerequisite script (or ask the user) instead of synthesizing a path
- All file paths must be absolute
</path_rules>

---

## Execution Steps

### Step 1: Generate Concise Short Name (2-4 Words)

<short_name_generation>
Analyze the feature description and extract the most meaningful keywords to create a concise branch name:

**Rules**:
- Create 2-4 word short name capturing feature essence
- Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
- Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
- Keep lowercase with hyphens as separators
- Must be concise but descriptive enough to understand at a glance

**Examples**:
- "I want to add user authentication" → "user-auth"
- "Implement OAuth2 integration for the API" → "oauth2-api-integration"
- "Create a dashboard for analytics" → "analytics-dashboard"
- "Fix payment processing timeout bug" → "fix-payment-timeout"

**Generation Process**:
1. Analyze feature description
2. Extract 2-4 most meaningful keywords
3. Combine with hyphens in action-noun order
4. Simplify while preserving technical specificity
</short_name_generation>

---

### Step 2: Check for Existing Branches Before Creating New One

<branch_checking>
**Process**:

**a. First, fetch all remote branches to ensure latest information**:
```bash
git fetch --all --prune
```

**b. Find the highest feature number across all sources for the short-name**:
- **Remote branches**: `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<short-name>$'`
- **Local branches**: `git branch | grep -E '^[* ]*[0-9]+-<short-name>$'`
- **Specs directories**: Check for directories matching `specs/[0-9]+-<short-name>`

**c. Determine the next available number**:
- Extract all numbers from all three sources
- Find the highest number N
- Use N+1 for the new branch number

**d. Run the script with calculated number and short-name**:
```powershell
pwsh ./.specify/scripts/powershell/create-new-feature.ps1 -Json -Number N+1 -ShortName "your-short-name" "$ARGUMENTS"
```

**Bash example**: 
```bash
./.specify/scripts/powershell/create-new-feature.ps1 -Json "$ARGUMENTS" -Number 5 -ShortName "user-auth" "Add user authentication"
```

**PowerShell example**:
```powershell
./.specify/scripts/powershell/create-new-feature.ps1 -Json "$ARGUMENTS" -Number 5 -ShortName "user-auth" "Add user authentication"
```

**IMPORTANT**:
- Check all three sources (remote branches, local branches, specs directories) to find the highest number
- Only match branches/directories with the exact short-name pattern
- If no existing branches/directories found with this short-name, start with number 1
- You must only ever run this script once per feature
- The JSON is provided in the terminal as output - always refer to it to get the actual content you're looking for
- The JSON output will contain BRANCH_NAME and SPEC_FILE paths
- For single quotes in args like "I'm Groot", use escape syntax: `'I'\''m Groot'` (or double-quote if possible: `"I'm Groot"`)
</branch_checking>

---

### Step 3: Load Specification Template

<task>
Load `.specify/templates/spec-template.md` to understand required sections.
</task>

**Purpose**: Understand section structure, headings, and expected content format before filling.

---

### Step 4: Follow Execution Flow for Specification Synthesis

<execution_flow>
This step requires **synthesis + reasoning** (Haiku 4.5's strength over GPT-5 Mini/GPT-4.1).

**Step 4.1: Parse User Description from Input**
```
IF description is empty:
  ERROR "No feature description provided"

EXTRACT key concepts from description:
- Actors (who uses this feature?)
- Actions (what do they do?)
- Data (what information is involved?)
- Constraints (limitations, requirements, edge cases)
```

**Step 4.2: Apply Informed Guesses for Unclear Aspects**
```
FOR EACH unclear aspect:
  IF has reasonable industry standard default:
    USE standard default
    DOCUMENT assumption in Assumptions section
  ELSE IF multiple reasonable interpretations exist:
    IF choice significantly impacts scope OR user experience OR security:
      MARK with [NEEDS CLARIFICATION: specific question]
      LIMIT: Maximum 3 markers total
      PRIORITIZE: Scope > Security/Privacy > User Experience > Technical Details
    ELSE:
      MAKE informed guess based on context
      DOCUMENT assumption in Assumptions section
```

**Step 4.3: Fill User Scenarios & Testing Section**

Use step-bounded reasoning (3-5 steps per section):

1. Identify primary actor from description
2. List sequential actions in user flow
3. Define happy path first, then alternate flows
4. Add error cases and edge conditions

IF no clear user flow can be determined:
  ERROR "Cannot determine user scenarios from description"

**Step 4.4: Generate Functional Requirements**

Each requirement must be testable:
```
FOR EACH capability extracted from description:
  WRITE as "The system shall [testable statement]"
  USE reasonable defaults for unspecified details
  DOCUMENT defaults in Assumptions section
```

**Step 4.5: Define Success Criteria**

Create measurable, technology-agnostic outcomes:
```
DEFINE quantitative metrics (time, performance, volume)
DEFINE qualitative measures (user satisfaction, task completion)

FOR EACH criterion:
  ENSURE it is verifiable
  ENSURE NO implementation details (frameworks, languages, APIs)
```

**Step 4.6: Identify Key Entities (if data involved)**

1. Extract nouns from description (User, Order, Product...)
2. List core attributes for each entity
3. Note relationships between entities

**Step 4.7: Return**

SUCCESS (spec ready for planning)
</execution_flow>

---

### Step 5: Write the Specification to SPEC_FILE

<specification_writing>
Write the specification to SPEC_FILE using the template structure.

**Replace placeholders** with concrete details derived from the feature description (arguments) while **preserving**:
- Section order from template
- Heading hierarchy
- Template formatting

**Content Guidelines**:
- **No implementation details** (languages, frameworks, APIs)
- **Focus on user value** and business needs
- **Write for non-technical stakeholders**
- **Each requirement must be testable**
- **Use [NEEDS CLARIFICATION: ...]** markers sparingly (max 3 total)
</specification_writing>

---

### Step 6: Specification Quality Validation

<validation_process>
After writing the initial spec, validate it against quality criteria.

**Step 6.a: Create Spec Quality Checklist**

Generate a checklist file at `FEATURE_DIR/checklists/requirements.md` using this structure:

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

**Step 6.b: Run Validation Check**

Review the spec against each checklist item:
- For each item, determine if it passes or fails
- Document specific issues found (quote relevant spec sections)

**Step 6.c: Handle Validation Results**

**Case A: If all items pass**
- Mark checklist complete
- Proceed to step 7

**Case B: If items fail (excluding [NEEDS CLARIFICATION])**
1. List the failing items and specific issues
2. Update the spec to address each issue
3. Re-run validation until all items pass (max 3 iterations)
4. If still failing after 3 iterations, document remaining issues in checklist notes and warn user

**Case C: If [NEEDS CLARIFICATION] markers remain**

1. Extract all [NEEDS CLARIFICATION: ...] markers from the spec

2. **LIMIT CHECK**: If more than 3 markers exist, keep only the 3 most critical (by scope/security/UX impact) and make informed guesses for the rest

3. For each clarification needed (max 3), present options to user in this format:

```markdown
## Question [N]: [Topic]

**Context**: [Quote relevant spec section]

**What we need to know**: [Specific question from NEEDS CLARIFICATION marker]

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | [First suggested answer] | [What this means for the feature] |
| B | [Second suggested answer] | [What this means for the feature] |
| C | [Third suggested answer] | [What this means for the feature] |
| Custom | Provide your own answer | [Explain how to provide custom input] |

**Your choice**: _[Wait for user response]_
```

4. **CRITICAL - Table Formatting**: Ensure markdown tables are properly formatted:
   - Use consistent spacing with pipes aligned
   - Each cell should have spaces around content: `| Content |` not `|Content|`
   - Header separator must have at least 3 dashes: `|--------|`
   - Test that the table renders correctly in markdown preview

5. Number questions sequentially (Q1, Q2, Q3 - max 3 total)

6. Present all questions together before waiting for responses

7. Wait for user to respond with their choices for all questions (e.g., "Q1: A, Q2: Custom - [details], Q3: B")

8. Update the spec by replacing each [NEEDS CLARIFICATION] marker with the user's selected or provided answer

9. Re-run validation after all clarifications are resolved

**Step 6.d: Update Checklist**

After each validation iteration, update the checklist file with current pass/fail status.
</validation_process>

---

### Step 7: Report Completion

<completion_report>
Report completion with:

**✅ Feature Specification Created**

1. **Branch Name**: [BRANCH_NAME from JSON output]
2. **Spec File**: [Full absolute path to SPEC_FILE]
3. **Checklist File**: [Path to FEATURE_DIR/checklists/requirements.md]

4. **Validation Results**:
   - **Content Quality**: [X/4 items pass]
   - **Requirement Completeness**: [X/8 items pass]
   - **Feature Readiness**: [X/4 items pass]
   - **Overall Status**: [✅ Ready for next phase / ⚠️ Needs attention]

5. **[NEEDS CLARIFICATION] Markers**:
   - [List any remaining markers if present]
   - [Or "None - all clarifications resolved"]

6. **Readiness for Next Phase**:
   - If all validations pass and no clarifications remain: "Ready for `/speckit.clarify` or `/speckit.plan`"
   - If clarifications needed: "Answer questions above, then re-run validation"
   - If validation issues remain: "Review checklist at [path] and update spec"

**Note**: The script created and checked out the new branch automatically.
</completion_report>

---

## Optimization Notes for Haiku 4.5

<optimization_strategy>
This command is optimized for Claude Haiku 4.5's strengths:

1. **Synthesis + Pattern Matching**: Extract concepts AND synthesize coherent narratives
2. **Step-Bounded Reasoning**: 3-5 steps per section (prevents verbosity, maintains focus)
3. **Informed Guess Rules**: Clear criteria for when to guess vs. ask for clarification
4. **Structured Template Filling**: Haiku excels at filling predefined structures
5. **Validation Checklist**: Built-in quality control using checklist format (Haiku's strength)
6. **Prioritization Formula**: Scope→Security→UX→Technical (mechanical ordering)
7. **Maximum 3 Clarifications**: Prevents over-questioning, forces synthesis capability

**Performance Expectations**:
- **Speed**: 15-25 seconds
- **Cost**: 0.33x vs Sonnet 4.5 (66% cheaper)
- **Quality**: 85-90% of Sonnet for specification synthesis
- **Best for**: Typical feature descriptions requiring some inference and synthesis

**Why Haiku 4.5 Works Here** (vs GPT-5 Mini or GPT-4.1):
- **Has reasoning capability** (unlike GPT-4.1 which is non-reasoning)
- **Can synthesize coherent narratives** (not just pattern matching like GPT-5 Mini)
- **Follows templates well** while adding creative content
- **Good at making informed guesses** with context
- **Strong validation/checklist execution**
- **Balances structure with synthesis** (perfect for spec writing)

**Limitations vs Sonnet 4.5**:
- May need more explicit guidance for highly novel architectures
- Slightly weaker at detecting subtle implicit requirements
- Better with template-based synthesis than freeform specification
- Less creative in complex user scenario generation
- May produce slightly simpler specifications for very complex features

**When to Use Sonnet 4.5 Instead**:
- Highly novel features without similar examples or templates
- Complex multi-system features requiring deep architectural synthesis
- When specification quality is more critical than speed/cost (e.g., regulatory features)
- Features with many interconnected implicit requirements
- When 15% quality improvement justifies 3x cost increase
</optimization_strategy>

---

## Context for Specification

```text
$ARGUMENTS
```

Use the feature description to:
- Identify domain-specific patterns and standards
- Apply industry standard defaults appropriately
- Infer reasonable assumptions based on context
- Generate appropriate user scenarios and flows
- Create testable functional requirements
