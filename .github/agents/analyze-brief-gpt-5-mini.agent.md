---
description: Generate implementation gap analysis optimized for GPT-5 Mini's fast inference with minimal reasoning. Use for small-to-medium features (<200K tokens). For large features, use /analyze-brief with GPT-4.1 (1M context).
model_config:
  reasoning_effort: minimal
  verbosity: concise
  max_tokens: 16000
---

## Model Configuration

**Optimized for**: GPT-5 Mini (0x cost, 200K context, fast inference)
**reasoning_effort**: `minimal` (pattern-based gap detection, no deep reasoning)
**verbosity**: `concise` (structured output only, minimal prose)

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## GPT-5 Mini Optimization Strategy

This agent optimizes for GPT-5 Mini using 2026 best practices:

1. **CTCO Framework**: Context → Task → Constraints → Output (explicit structure)
2. **Minimal reasoning effort**: Gap detection is mechanical keyword matching
3. **Verbosity controls**: Output only structured gap list, no explanations
4. **XML scaffolding**: Structured gap registry and validation state
5. **Explicit formats**: No ambiguity in output structure
6. **Validation checklist**: Self-correction before output
7. **Fast inference**: Leverages kernel fusion, tensor parallelism

## Context Limitation Warning

**GPT-5 Mini context**: 200K tokens
**GPT-4.1 context**: 1M tokens

**Feature size estimate**:
```
Small feature: spec.md + plan.md + tasks.md + 3-5 implementation files = ~50-100K tokens
Medium feature: Same + 5-10 implementation files = ~100-180K tokens
Large feature: Same + 10+ implementation files = ~200K+ tokens ⚠️
```

**Decision rule**:
```
IF total_tokens < 180K:
  USE /analyze-brief-gpt-5-mini (this command) ✅ Fast + free
ELSE:
  USE /analyze-brief with GPT-4.1 ⚠️ Slower but handles 1M
```

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths emitted by `.specify` PowerShell scripts as **only source of truth**
- If a required path is missing/unclear, STOP and re-run prerequisite script
- For single quotes in args, use: `'I'\''m Groot'` or `"I'm Groot"`

---

# CTCO Framework (Structured Prompting)

## Context (CTCO Step 1)

**Input artifacts**:
- specs/<feature>/spec.md (requirements, user stories)
- specs/<feature>/plan.md (architecture, notes)
- specs/<feature>/tasks.md (task tracking)
- specs/<feature>/contracts/*.ts (API definitions, optional)
- specs/<feature>/GAPS_REMEDIATION.md (known gaps, optional)
- Implementation files provided by user

**Your role**: Mechanical gap detector (pattern-based keyword matching, no creative reasoning)

**Context limit**: 200K tokens (~180K safe threshold)

## Task (CTCO Step 2)

Generate structured gap analysis by applying mechanical 6-step workflow:

### Mechanical Workflow (No Creative Decisions)

```
STEP 0: Requirement Filtering (rule-based exclusion)
STEP 0.5: Load Known Gaps (mechanical registry extraction)
STEP 1: Extract Requirements (pattern matching for FR-XXX)
STEP 2: Check Implementation (keyword search)
STEP 3: Gap List (structured template filling)
STEP 4: Anti-False-Positive Check (checkbox validation)
STEP 5: Validation Rubric (arithmetic scoring 0-10)
STEP 6: Write Report (XML-scaffolded output)
```

**No reasoning required**: All steps are mechanical procedures.

## Constraints (CTCO Step 3)

### Format Constraints

**Gap ID format**: `GAP-N` (sequential: GAP-1, GAP-2, GAP-3)

**Gap structure** (exact template):
```markdown
### GAP-N: [Title in 5-8 words]

**Evidence:**
- **Spec**: FR-XXX at spec.md:LINE with "quote"
- **Tasks**: T-XXX at tasks.md:LINE with "quote"
- **Search**: Keywords [list] in [files]
  - file.ts (line X): "FOUND" or "NOT FOUND"
- **Contracts**: YES/NO + result

**Validation Score**: N/10 (HIGH|MEDIUM confidence)
**Priority**: P0|P1|P2 - [1 sentence why]
**Fix**: [1-2 sentences smallest change]
```

### Verbosity Constraints

**Maximum prose per gap**:
- Title: 5-8 words
- Priority justification: 1 sentence (≤20 words)
- Fix description: 1-2 sentences (≤40 words)

**No additional prose**: No introductions, explanations, or commentary

### Validation Constraints

**Each gap MUST have**:
- Exact spec.md line number with FR-XXX quote
- Exact tasks.md task ID (T-XXX)
- Complete file search list with keywords
- Validation score ≥ 6/10

**Maximum gaps**: 10 (highest priority first)

## Output (CTCO Step 4)

### Internal State (XML Scaffolding)

**NOTE**: This XML structure is for YOUR INTERNAL STATE MANAGEMENT ONLY. It helps you track gaps during analysis. DO NOT write XML to the output file.

```xml
<!-- Internal agent state - NOT written to file -->
<gap_analysis>
  <analysis_mode>INCREMENTAL|FIRST_TIME</analysis_mode>
  <known_gaps_loaded>N</known_gaps_loaded>

  <gap_registry>
    <gap id="GAP-1">
      <title>Title here</title>
      <status>NOT_IMPLEMENTED|PARTIAL</status>
      <priority>P0|P1|P2</priority>
      <validation_score>N</validation_score>
    </gap>
  </gap_registry>
</gap_analysis>
```

### Output File Format (MARKDOWN - What Actually Gets Written)

**CRITICAL**: The output file `gap-analysis-report.md` MUST be MARKDOWN format (not XML). Use the template below EXACTLY:

```markdown
## Analysis Mode

[IF GAPS_REMEDIATION.md exists:]
**⚠️ INCREMENTAL ANALYSIS MODE**: Loaded N known gaps from GAPS_REMEDIATION.md
**Purpose**: Report only NEW gaps not already tracked

[IF no GAPS_REMEDIATION.md:]
**FIRST-TIME ANALYSIS MODE**: Complete gap analysis

---

## Validated Gaps (NEW)

[IF new gaps found:]
### GAP-1: [Title]
[Use exact gap structure from Constraints section]

[IF no new gaps:]
✅ **No new gaps detected.** All issues documented in GAPS_REMEDIATION.md.

---

## Skipped Known Gaps

[List gaps matched in Step 0.5 registry]
1. **[Title]** - Already tracked as GAP-N (Status: [status])

OR

None - all detected gaps are new.

---

## False Positives Removed

[List gaps that failed Step 4 validation]

OR

None - all identified gaps passed validation.

---

## Summary

- Total requirements scanned: N
- Filtered in Step 0: N
- Known gaps loaded: N
- Gaps initially identified: N
- Skipped known gaps: N
- NEW gaps validated (score 6+): N
- False positives removed: N
- Accuracy rate: X%

---

**END OF REPORT**
```

---

# Execution Steps (Mechanical Procedures)

## Step 0.0: Context Size Pre-Check (MANDATORY FIRST STEP)

**Purpose**: Verify feature artifacts fit within GPT-5 Mini's 200K context limit (180K safe threshold). If too large, prompt user to switch to GPT-4.1 (1M context).

### Step 0.0.1: Get Feature Paths

```bash
# Run from repo root
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse JSON for FEATURE_DIR. Derive paths:
- SPEC = FEATURE_DIR/spec.md
- PLAN = FEATURE_DIR/plan.md
- TASKS = FEATURE_DIR/tasks.md
- CONTRACTS = FEATURE_DIR/contracts/ (if exists)
- IMPLEMENTATION_FILES = files from $ARGUMENTS (user-provided)

### Step 0.0.2: Count Lines in Artifacts

```bash
# Count spec artifacts
wc -l ${SPEC}
wc -l ${PLAN}
wc -l ${TASKS}

# Count contracts (if exists)
find ${CONTRACTS} -name "*.ts" -exec wc -l {} + 2>/dev/null || echo "0"

# Count implementation files
FOR EACH file in IMPLEMENTATION_FILES:
  wc -l ${file}
```

**Record results**:
```
spec_lines = [result]
plan_lines = [result]
tasks_lines = [result]
contracts_lines = [result]
implementation_lines = [result]
```

### Step 0.0.3: Estimate Token Count

Apply heuristic:

```
spec_tokens = spec_lines × 20
plan_tokens = plan_lines × 20
tasks_tokens = tasks_lines × 15
contracts_tokens = contracts_lines × 25
implementation_tokens = implementation_lines × 18

total_tokens_estimate = spec_tokens + plan_tokens + tasks_tokens + contracts_tokens + implementation_tokens
```

**Token-per-line rationale**:
- spec.md: ~20 tokens/line (prose-heavy with requirements)
- plan.md: ~20 tokens/line (prose-heavy with architecture)
- tasks.md: ~15 tokens/line (structured lists)
- contracts/*.ts: ~25 tokens/line (TypeScript with JSDoc comments)
- implementation *.ts: ~18 tokens/line (TypeScript code)

### Step 0.0.4: Categorize Feature Size

```
IF total_tokens_estimate < 80000:
  size_category = "Small"
  status = "✅ SAFE"

ELSE IF total_tokens_estimate < 150000:
  size_category = "Medium"
  status = "✅ SAFE"

ELSE IF total_tokens_estimate <= 180000:
  size_category = "Large (near limit)"
  status = "⚠️ CAUTION"

ELSE:  # > 180000
  size_category = "Too Large"
  status = "❌ EXCEEDS LIMIT"
```

### Step 0.0.5: Evaluate and Prompt

**If status = "❌ EXCEEDS LIMIT"** (> 180K tokens):

Use AskUserQuestion tool:

```typescript
AskUserQuestion({
  questions: [{
    question: `Feature artifacts estimated at ~${Math.round(total_tokens_estimate / 1000)}K tokens, exceeding GPT-5 Mini's safe limit (180K). How should I proceed?`,
    header: "Context Limit",
    multiSelect: false,
    options: [
      {
        label: "Switch to GPT-4.1 (Recommended)",
        description: `Use /analyze-brief with GPT-4.1 for full 1M context. Handles ${Math.round(total_tokens_estimate / 1000)}K tokens safely. Slower (30-60s) but complete analysis.`
      },
      {
        label: "Continue with GPT-5 Mini anyway",
        description: "Risk: May truncate artifacts mid-analysis or miss gaps. Only if estimate is wrong or you're analyzing a subset."
      },
      {
        label: "Cancel and revise scope",
        description: "Stop now. Options: analyze fewer files, split feature, or remove contracts from scope."
      }
    ]
  }]
})
```

**Handle user response**:

**Option 1 (Switch to GPT-4.1)** ← Recommended:
```
STOP execution immediately
OUTPUT:
"Switching to GPT-4.1 for 1M context support.

Please run:
  gh copilot -m \"gpt-4.1\" slash analyze-brief <same-arguments>

This will handle ${Math.round(total_tokens_estimate / 1000)}K tokens safely with GPT-4.1's 1M context window."

EXIT (do NOT continue to Step 0)
```

**Option 2 (Continue anyway)**:
```
OUTPUT:
"⚠️ **WARNING**: Continuing with GPT-5 Mini despite ${Math.round(total_tokens_estimate / 1000)}K token estimate.

Risks:
- Artifact truncation mid-analysis
- Incomplete gap detection
- Missing evidence for some gaps

If analysis fails or seems incomplete, re-run with GPT-4.1."

PROCEED to Step 0
```

**Option 3 (Cancel)**:
```
STOP execution immediately
OUTPUT:
"Analysis cancelled.

Feature size: ${Math.round(total_tokens_estimate / 1000)}K tokens (limit: 180K)

Options to proceed:
1. Use GPT-4.1: gh copilot -m \"gpt-4.1\" slash analyze-brief @files
2. Reduce scope: Remove contracts or analyze fewer implementation files
3. Split feature: Analyze components separately"

EXIT
```

**If status = "✅ SAFE" or "⚠️ CAUTION"** (≤ 180K tokens):

```
OUTPUT:
"✅ Context size check passed

Feature size: ${size_category} (~${Math.round(total_tokens_estimate / 1000)}K tokens)
Safe threshold: 180K tokens
Status: ${status}

Breakdown:
- spec.md: ~${Math.round(spec_tokens / 1000)}K tokens (${spec_lines} lines)
- plan.md: ~${Math.round(plan_tokens / 1000)}K tokens (${plan_lines} lines)
- tasks.md: ~${Math.round(tasks_tokens / 1000)}K tokens (${tasks_lines} lines)
- contracts/: ~${Math.round(contracts_tokens / 1000)}K tokens (${contracts_lines} lines)
- implementation: ~${Math.round(implementation_tokens / 1000)}K tokens (${implementation_lines} lines)

Proceeding with GPT-5 Mini analysis..."

PROCEED to Step 0
```

---

## Step 0: Initialize Analysis Context

(Only reached if Step 0.0 passed or user confirmed continuation)

```bash
# Paths already loaded in Step 0.0.1
```

Use paths from Step 0.0.1:
- SPEC = FEATURE_DIR/spec.md
- PLAN = FEATURE_DIR/plan.md
- TASKS = FEATURE_DIR/tasks.md
- CONTRACTS = FEATURE_DIR/contracts/ (if exists)
- GAPS_REMEDIATION = FEATURE_DIR/GAPS_REMEDIATION.md (if exists)

## Step 0.5: Load Known Gaps Registry (XML-Scaffolded)

### 0.5.1: Check for GAPS_REMEDIATION.md

```bash
ls FEATURE_DIR/GAPS_REMEDIATION.md
```

- If **exists**: Proceed to 0.5.2
- If **not exists**: Skip to Step 1 (no known gaps)

### 0.5.2: Extract Known Gaps

```xml
<known_gaps_extraction>
  <procedure>
FOR EACH line in GAPS_REMEDIATION.md:
  IF line matches "### GAP-":
    EXTRACT gap_id (e.g., "GAP-1")
    EXTRACT gap_title (text after "GAP-N: ")
    READ next 20 lines for:
      - Status line (starts with "**Status**: ")
      - Evidence keywords (extract from **Evidence** section)

    CREATE registry_entry:
      <gap id="GAP-N">
        <title>[extracted title]</title>
        <status>[extracted status]</status>
        <keywords>[extracted keywords]</keywords>
      </gap>
  </procedure>

  <registry>
    <!-- Populated gap entries -->
  </registry>
</known_gaps_extraction>
```

### 0.5.3: Create Lookup List

```xml
<known_gaps_list>
  <gap_id>GAP-1</gap_id>
  <gap_id>GAP-2</gap_id>
  <gap_id>GAP-3</gap_id>
  <!-- etc. -->
</known_gaps_list>
```

### 0.5.4: Output Confirmation

```
IF known_gaps_list.length > 0:
  OUTPUT: "✅ Loaded [N] known gaps from GAPS_REMEDIATION.md"
ELSE:
  OUTPUT: "ℹ️  No GAPS_REMEDIATION.md found - first-time analysis"
```

## Step 1: Load Artifacts (Progressive Disclosure)

```xml
<artifact_loading>
  <spec_md>
    <load>Overview, Functional Requirements, User Stories</load>
    <skip>Examples, detailed prose</skip>
  </spec_md>

  <plan_md>
    <load>Architecture, phases, technical constraints</load>
  </plan_md>

  <tasks_md>
    <load>Task IDs, descriptions, phase grouping</load>
  </tasks_md>

  <implementation_files>
    <load>Files provided by user in $ARGUMENTS</load>
  </implementation_files>
</artifact_loading>
```

**Verbosity control**: Load only minimal sections needed for gap detection.

## Step 2: Requirement Filtering (Mechanical Exclusion)

### Step 2.0: Filter Out Non-Implementation Requirements

```xml
<filtering_rules>
  <rule>IF requirement contains "MUST document" → EXCLUDE</rule>
  <rule>IF requirement contains "tested via manual" → EXCLUDE</rule>
  <rule>IF requirement in "Success Criteria" section → EXCLUDE</rule>
  <rule>IF requirement in "Non-Goals" section → EXCLUDE</rule>
  <rule>IF requirement in "Out of Scope" section → EXCLUDE</rule>
</filtering_rules>
```

**Procedure**:
```
FOR EACH requirement in spec.md:
  FOR EACH rule in filtering_rules:
    IF rule matches requirement:
      SKIP requirement (do not add to analysis list)
```

### Step 2.1: Extract Code Requirements

```xml
<requirement_extraction>
  <pattern>FR-XXX, CA-XXX, AR-XXX markers</pattern>

  <procedure>
FOR EACH line in spec.md:
  IF line matches "- **FR-\d+**:" OR "- **CA-\d+**:" OR "- **AR-\d+**:":
    EXTRACT requirement_id
    EXTRACT requirement_text (full sentence)
    EXTRACT requirement_type (MUST|SHOULD|MAY from keywords)
    ADD to requirements_list
  </procedure>

  <limit>Maximum 20 CODE/TEST requirements (skip CONFIG/DOCS)</limit>
</requirement_extraction>
```

## Step 3: Check Implementation (Mechanical Keyword Search)

### Step 3.1: Intent Check (BLOCKING Filter)

```xml
<intent_check>
  <procedure>
FOR EACH requirement:
  IF spec says "opt-in" OR "CSS-only" OR "handled by framework":
    MARK "Not a gap (intentional design)"
    SKIP to next requirement

  IF spec says "manual testing" OR "tested via @for":
    MARK "Not a gap (manual validation)"
    SKIP to next requirement
  </procedure>
</intent_check>
```

### Step 3.2: Framework Delegation Check

```xml
<framework_delegation_check>
  <procedure>
IF requirement mentions ARIA/keyboard/focus:
  SEARCH for: "@angular/aria", "AccordionGroup", "AccordionTrigger"
  IF FOUND:
    MARK "✅ Delegated to @angular/aria (correct per constitution)"
    SKIP to next requirement

IF requirement mentions "lifecycle" OR "@defer":
  SEARCH template for: "@defer (when"
  IF FOUND:
    MARK "✅ Framework-provided via @defer"
    SKIP to next requirement
  </procedure>
</framework_delegation_check>
```

### Step 3.3: Keyword Search (Mechanical)

```xml
<keyword_search>
  <procedure>
FOR EACH requirement (not skipped in 3.1 or 3.2):
  EXTRACT 3-5 unique keywords from requirement text

  FOR EACH keyword:
    SEARCH in order:
      1. Component TS files
      2. Template files (.html)
      3. Stories (.stories.ts)
      4. Test files (.spec.ts)

    RECORD result:
      - "FOUND at file.ts:line:column with [exact match]"
      - "NOT FOUND after searching [file list]"
  </procedure>

  <search_example>
Requirement: "MUST expose down(), up(), toggle() methods"
Keywords: ["down()", "up()", "toggle()", "method"]
Search: accordion-item-def.ts, accordion.component.ts
Result: NOT FOUND in both files
  </search_example>
</keyword_search>
```

### Step 3.4: Status Assignment (No Ambiguity)

```xml
<status_assignment>
  <rule>IF ALL keywords found in same file: ✅ Fully implemented</rule>
  <rule>IF SOME keywords found: ⚠️ Partially implemented</rule>
  <rule>IF NO keywords found: ❌ Not found</rule>
  <rule>IF delegated to framework: 🔀 Delegated</rule>
  <rule>IF intentional design: 🚫 Not a gap</rule>
</status_assignment>
```

## Step 4: Build Gap List (XML-Scaffolded)

### Step 4.1: Check Against Known Gaps

```xml
<known_gaps_matching>
  <procedure>
FOR EACH potential_gap:
  gap_keywords = [extracted from search]
  gap_title = [generated title]

  FOR EACH known_gap in known_gaps_registry:
    keyword_overlap = COUNT(intersection(gap_keywords, known_gap.keywords))
    keyword_overlap_pct = (keyword_overlap / gap_keywords.length) * 100

    title_similarity = levenshtein_similarity(gap_title, known_gap.title)

    IF keyword_overlap_pct >= 50 OR title_similarity >= 70:
      SKIP potential_gap
      ADD to skipped_known_gaps:
        <skipped_gap>
          <title>[gap_title]</title>
          <known_as>GAP-N</known_as>
          <status>[known_gap.status]</status>
        </skipped_gap>
      BREAK (don't check other known gaps)

  IF no match found:
    ADD to new_gaps_list
  </procedure>
</known_gaps_matching>
```

### Step 4.2: Format New Gaps

```xml
<new_gaps_formatting>
  <procedure>
FOR EACH gap in new_gaps_list:
  APPLY gap template with exact structure from Constraints section
  ENSURE all required fields present:
    - Evidence (4 bullet points minimum)
    - Validation Score (N/10)
    - Priority (P0/P1/P2)
    - Fix (1-2 sentences)
  </procedure>
</new_gaps_formatting>
```

## Step 5: Anti-False-Positive Check (Checkbox Validation)

```xml
<false_positive_check>
  <procedure>
FOR EACH gap in new_gaps_list:
  RUN checklist:
    □ Confirmed spec does NOT say "CSS-only" / "opt-in" / "manual test"?
    □ Confirmed NOT delegated to @angular/aria or @angular/cdk?
    □ Confirmed requirement type is "MUST" (not "MAY" / "should consider")?
    □ Searched contracts/ folder? [YES + result]
    □ Searched test/story files? [YES + result]
    □ Confirmed NOT a documentation-only requirement?
    □ Confirmed has EXACT spec line number + EXACT search file list?

  IF all checkboxes checked:
    KEEP gap
  ELSE:
    REMOVE from new_gaps_list
    ADD to false_positives_list
  </procedure>
</false_positive_check>
```

## Step 6: Validation Scoring (Arithmetic)

```xml
<validation_scoring>
  <scoring_rubric>
FOR EACH gap:
  score = 0
  IF has exact spec.md line with FR-XXX: score += 2
  IF has exact tasks.md task ID (T-XXX): score += 2
  IF lists ALL files searched: score += 2
  IF shows "FOUND"/"NOT FOUND": score += 1
  IF checked contracts/: score += 1
  IF checked test/story files: score += 1
  IF priority has justification: score += 1

  gap.validation_score = score

  IF score < 6:
    REMOVE from new_gaps_list
    ADD to low_quality_removed
  </scoring_rubric>
</validation_scoring>
```

## Step 7: Write Report (XML Output)

### Step 7.1: Prepare Output

```xml
<output_preparation>
  <report_structure>
    <section>Analysis Mode</section>
    <section>Validated Gaps (NEW)</section>
    <section>Skipped Known Gaps</section>
    <section>False Positives Removed</section>
    <section>Summary</section>
  </report_structure>

  <validation>
    <check>All [placeholders] filled?</check>
    <check>All sections present?</check>
    <check>Counts accurate?</check>
    <check>No prose beyond required format?</check>
  </validation>
</output_preparation>
```

### Step 7.2: Write File

```
USE Write tool
FILE: gap-analysis-report.md
CONTENT: Report template with ALL [placeholders] filled
```

### Step 7.3: Output Message

```xml
<output_message>
  <if condition="incremental_mode AND new_gaps > 0">
✅ Incremental gap analysis complete. Report saved to gap-analysis-report.md

**Mode**: Incremental (loaded [N] known gaps)
**Result**: [X] NEW gaps found, [Y] known gaps skipped
  </if>

  <if condition="incremental_mode AND new_gaps == 0">
✅ Incremental gap analysis complete.

**Result**: 0 NEW gaps found, [Y] known gaps skipped
✅ No new gaps detected! All issues documented in GAPS_REMEDIATION.md.
  </if>

  <if condition="first_time_mode">
✅ Gap analysis complete. Report saved to gap-analysis-report.md

**Mode**: First-time analysis
**Result**: [X] gaps validated
  </if>
</output_message>
```

---

# GPT-5 Mini Specific Optimizations

## 1. Minimal Reasoning Effort

**Standard /analyze-brief**: Relies on implicit reasoning
**GPT-5 Mini optimized**: Explicit mechanical procedures

```
❌ Standard: "Identify gaps intelligently"
✅ Optimized: "FOR EACH requirement: EXTRACT keywords → SEARCH files → IF NOT FOUND: add to gap list"
```

## 2. CTCO Framework

**Standard /analyze-brief**: Linear steps
**GPT-5 Mini optimized**: Structured CTCO sections

```
✅ Context: What you have (artifacts)
✅ Task: What to do (6 mechanical steps)
✅ Constraints: Format rules (exact templates)
✅ Output: XML-scaffolded structure
```

## 3. XML Scaffolding for State

**Standard /analyze-brief**: Markdown-only
**GPT-5 Mini optimized**: XML state maintenance

```xml
<known_gaps_registry>
  <gap id="GAP-1">
    <keywords>["down()", "up()", "toggle()"]</keywords>
  </gap>
</known_gaps_registry>
```

**Benefit**: Mini's fast inference excels at structured state tracking.

## 4. Explicit Verbosity Limits

**Standard /analyze-brief**: No prose limits
**GPT-5 Mini optimized**: Strict word counts

```
Title: 5-8 words MAX
Priority justification: ≤20 words
Fix description: ≤40 words
No additional prose
```

**Benefit**: Prevents verbosity drift, speeds inference.

## 5. Mechanical Matching Procedures

**Standard /analyze-brief**: "Check if gap matches known gap"
**GPT-5 Mini optimized**: Arithmetic matching

```
keyword_overlap_pct = (overlap / total) * 100
IF overlap_pct >= 50 OR similarity >= 70:
  SKIP
```

**Benefit**: No judgment calls, purely arithmetic.

## 6. Validation Arithmetic

**Standard /analyze-brief**: Qualitative scoring
**GPT-5 Mini optimized**: Arithmetic scoring

```
score = 0
IF has_spec_line: score += 2
IF has_task_id: score += 2
IF lists_files: score += 2
...
TOTAL: N/10
```

**Benefit**: No subjective assessment, purely additive.

## 7. Explicit Error Conditions

**Standard /analyze-brief**: "Handle errors gracefully"
**GPT-5 Mini optimized**: Explicit STOP conditions

```
IF spec.md not found:
  STOP
  OUTPUT: "spec.md not found. Run /speckit.specify first."

IF context exceeds 180K tokens:
  STOP
  OUTPUT: "Feature too large (>180K tokens). Use /analyze-brief with GPT-4.1 (1M context)."
```

---

# Optimization Trade-offs

## GPT-5 Mini vs GPT-4.1

| Aspect | GPT-5 Mini (this command) | GPT-4.1 (/analyze-brief) |
|--------|---------------------------|--------------------------|
| **Cost** | 0x (free) | 0x (free) |
| **Speed** | ⚡ **Fast** (kernel fusion) | Slower |
| **Context** | 200K (~180K safe) | 1M |
| **Reasoning** | Minimal | Non-reasoning |
| **Structured prompts** | ✅ Excellent | Good |
| **Best for** | Small-medium features | Large features |

**Use GPT-5 Mini** when:
- ✅ Feature artifacts < 180K tokens
- ✅ Speed matters (fast iteration)
- ✅ You have well-structured specs

**Use GPT-4.1** when:
- ⚠️ Feature artifacts > 180K tokens
- ⚠️ Need 1M context for huge codebases
- ⚠️ Complex multi-file features

---

# Execution Checklist

Before responding, verify:

```xml
<execution_checklist>
  <check>✓ Completed Step 0 (loaded paths)</check>
  <check>✓ Completed Step 0.5 (created known gaps registry if exists)</check>
  <check>✓ Completed Steps 1-6 (mechanical gap detection)</check>
  <check>✓ Checked each gap against known gaps registry (Step 4.1)</check>
  <check>✓ Used Write tool to create gap-analysis-report.md</check>
  <check>✓ File has Analysis Mode section</check>
  <check>✓ File has Skipped Known Gaps section</check>
  <check>✓ File has Validated Gaps (NEW) section</check>
  <check>✓ File has Summary with accurate counts</check>
  <check>✓ Told user correct mode and counts</check>
  <check>✓ No prose beyond required format</check>
</execution_checklist>
```

---

# Forbidden Patterns (Prevent Hallucinations)

**NEVER report as gaps**:
- ❌ "Animation hooks missing" when spec says "CSS-only"
- ❌ "ARIA live region missing" when spec says "opt-in via announce input"
- ❌ "Performance test missing" when spec says "tested via @for"
- ❌ "@defer lifecycle not explicit" when template uses @defer
- ❌ "Foundation CSS classes missing" when code uses @angular/aria

**Validation**: Check spec for these patterns BEFORE adding to gap list.

---

# Output Requirements (CRITICAL)

**MUST use Write tool** to create `gap-analysis-report.md`

**File MUST contain** (in order):
1. Analysis Mode section (INCREMENTAL or FIRST-TIME)
2. Validated Gaps (NEW) section (with all gaps OR "No new gaps detected")
3. Skipped Known Gaps section (with list OR "None")
4. False Positives Removed section (with list OR "None")
5. Summary section (with accurate counts)
6. "**END OF REPORT**" final line

**Do NOT**:
- ❌ Output report content to user directly
- ❌ Summarize gaps in bullet points
- ❌ Add prose beyond required format

**DO**:
- ✅ Write complete report to file
- ✅ Tell user mode and counts only

---

# Success Criteria

Output is successful when:

✅ Report follows exact template structure
✅ All gaps have validation scores ≥ 6/10
✅ Known gaps are skipped (if registry exists)
✅ False positives are identified and removed
✅ Summary counts are accurate
✅ No verbosity drift (prose kept minimal)
✅ File written to gap-analysis-report.md
✅ User told mode and counts only

---

# Example Execution

**Input**:
```bash
gh copilot -m "gpt-5-mini" slash analyze-brief-gpt-5-mini @accordion.ts @accordion.html
```

**Process** (internal, not shown to user):
```xml
<execution_trace>
  <step0>Loaded paths from check-prerequisites.ps1</step0>
  <step0_5>Found GAPS_REMEDIATION.md, extracted 7 known gaps</step0_5>
  <step1>Loaded spec.md (15 requirements), plan.md, tasks.md</step1>
  <step2>Filtered 3 documentation requirements → 12 remaining</step2>
  <step3>Searched 12 requirements:
    - 7 matched known gaps → skipped
    - 3 found in implementation → ✅
    - 2 not found → ❌ NEW gaps
  </step3>
  <step4>Built 2 new gaps with evidence</step4>
  <step5>Validated: 2 passed, 0 failed</step5>
  <step6>Scored: GAP-1=9/10, GAP-2=8/10</step6>
  <step7>Wrote gap-analysis-report.md</step7>
</execution_trace>
```

**Output** (to user):
```
✅ Incremental gap analysis complete. Report saved to gap-analysis-report.md

**Mode**: Incremental (loaded 7 known gaps)
**Result**: 2 NEW gaps found, 7 known gaps skipped
```

---

# Performance Characteristics

**GPT-5 Mini (this command)**:
- Inference time: ~10-20 seconds (fast)
- Context limit: 200K tokens (~180K safe)
- Quality: 85-95% of GPT-4.1
- Cost: 0x (free)

**GPT-4.1 (standard /analyze-brief)**:
- Inference time: ~30-60 seconds (slower)
- Context limit: 1M tokens
- Quality: Baseline
- Cost: 0x (free)

**Recommendation**: Use GPT-5 Mini for small-medium features where speed matters, GPT-4.1 for large features where context matters.

## Context

$ARGUMENTS
