# GPT-5 Mini Prompt Optimization Guide

**Last Updated:** 2026-01-20

This document provides optimization strategies for GPT-5 Mini, a fast inference model optimized for pattern matching and structured output.

---

## Model Characteristics

| Attribute | Value |
|-----------|-------|
| **Context Window** | 200,000 tokens |
| **Reasoning** | Minimal (pattern matching only) |
| **Cost** | 0x (free in GitHub Copilot) |
| **Best For** | Small-medium features (<180K tokens) requiring fast inference |

### Key Capabilities

1. **Fast inference** - Kernel fusion and tensor parallelism optimization
2. **200K context window** - Same as Haiku 4.5 and Sonnet 4.5
3. **Minimal reasoning capacity** - Optimized for pattern matching, not deep reasoning
4. **Structured prompt excellence** - Excels at following explicit formats (CTCO, XML)
5. **Higher sensitivity to ambiguous prompts** - Needs explicit format specifications

**Performance**: Typically **85-95% of GPT-5** on general benchmarks with **substantially improved latency/price**.

**Source**: [GPT-5 mini Model Card - PromptHub](https://www.prompthub.us/models/gpt-5-mini)

---

## Quick Reference

| Optimization | Description | Priority |
|-------------|-------------|----------|
| [CTCO Framework](#optimization-1-ctco-framework-context--task--constraints--output) | Structure prompts in 4 sections | Critical |
| [Reasoning Effort](#optimization-2-reasoning_effort-minimal) | Set to `minimal` for pattern tasks | Critical |
| [Verbosity Controls](#optimization-3-verbosity-controls-concise-mode) | Explicit length constraints | High |
| [XML Scaffolding](#optimization-4-xml-scaffolding-for-state-maintenance) | Maintain structured state | High |
| [Mechanical Procedures](#optimization-5-mechanical-procedures-no-creative-decisions) | Convert logic to FOR EACH loops | Critical |
| [Validation Checklists](#optimization-6-explicit-validation-checklists) | Self-correction before output | High |
| [Error Conditions](#optimization-7-explicit-error-conditions) | Define exact STOP conditions | Medium |
| [XML Examples](#optimization-8-xml-scaffolding-examples-not-output) | Internal state, markdown output | Medium |

---

## Optimization 1: CTCO Framework (Context → Task → Constraints → Output)

### The Technique

**Structure prompts in 4 explicit sections** to eliminate ambiguity.

**Research Finding**:

> "To maximize performance, use the CTCO Framework (Context → Task → Constraints → Output), explicitly define Reasoning Effort, and use Scope Discipline to prevent verbosity drift."

**Source**: [GPT-5.2 Prompting Guide: The 2026 Playbook - Atlabs AI](https://www.atlabs.ai/blog/gpt-5.2-prompting-guide-the-2026-playbook-for-developers-agents)

### Why It Works

GPT-5 Mini's higher sensitivity to ambiguous prompts means it **needs clear structure**:

- ✅ **Context section**: What you have (artifacts, state, role)
- ✅ **Task section**: What to do (specific actions, no ambiguity)
- ✅ **Constraints section**: Format rules, validation requirements
- ✅ **Output section**: Exact structure, examples, templates

**Without CTCO**: GPT-5 Mini may hallucinate or produce inconsistent output.
**With CTCO**: GPT-5 Mini follows structure reliably.

### Implementation Pattern

```markdown
# CTCO Structure

## Context (CTCO Step 1)

**Input artifacts**:
- docs/feature/plan.md (architecture, phases)
- docs/feature/spec.md (requirements)

**Current state**: Plan approved, tasks not generated

**Your role**: Mechanical task generator (pattern-based, no creative decisions)

**Context limit**: 200K tokens (~180K safe threshold)

---

## Task (CTCO Step 2)

Generate tasks.md by applying these mechanical transformations:

### Transformation 1: Extract Phases

FOR EACH "## Phase N:" heading in plan.md:
  CREATE task group header in tasks.md

### Transformation 2: Convert Bullets to Tasks

FOR EACH bullet point in plan.md:
  IF bullet has verb + object:
    GENERATE task with T### ID

[Additional transformations...]

---

## Constraints (CTCO Step 3)

### Output Format Constraints

**Task ID format**: `T###` (3-digit zero-padded: T001, T023, T145)

**Task line format**:

- [ ] T### [P?] [Story?] Description with file path

**Examples**:

- [ ] T001 Create directory at packages/lib/feature/
- [ ] T002 [P] [US1] Add types.ts with FeatureState interface

### Validation Constraints

**Each task MUST**:
- Have sequential T### ID
- Include exact file path
- Follow dependency ordering

---

## Output (CTCO Step 4)

### Output Structure (XML Scaffolding)

```xml
<tasks_output>
  <format>markdown</format>
  <file_path>docs/feature/tasks.md</file_path>

  <content>
# Tasks: Feature Name

## Phase 1: Setup
- [ ] T001 Task description with file path
  </content>
</tasks_output>
```

### Validation Checklist

□ All tasks have T### IDs?
□ All tasks have file paths?
□ [P] markers accurate?
□ Task order follows dependencies?
```

---

## Optimization 2: reasoning_effort: minimal

### The Technique

**Set reasoning_effort parameter to `minimal`** for pattern-based tasks.

**Research Finding**:

> "Practical speedups come from kernel fusion, tensor parallelism tuned for a smaller graph, and an inference runtime that prefers shorter internal 'thinking' loops unless the developer requests deeper reasoning."

**Source**: [GPT-5 mini API - CometAPI](https://www.cometapi.com/gpt-5-mini-api/)

### Model Configuration

```yaml
model_config:
  reasoning_effort: minimal  # Pattern matching only
  verbosity: concise         # Structured output, no prose
  max_tokens: 16000          # Sufficient for structured output
```

### Why It Works

GPT-5 Mini's architecture is optimized for **fast inference with minimal internal loops**:

- ✅ **Kernel fusion** - Combines operations for speed
- ✅ **Tensor parallelism** - Parallel processing on smaller model
- ✅ **Shorter thinking loops** - Minimal reasoning = faster execution

### When to Use Each Level

| Level | Use Case | GPT-5 Mini Suitable? |
|-------|----------|---------------------|
| **minimal** | Pattern matching, template filling | ✅ **Perfect fit** |
| **low** | Simple logic, basic decisions | ✅ Acceptable |
| **medium** | Standard reasoning tasks | ⚠️ Not recommended |
| **high** | Complex problem-solving | ❌ Use GPT-5.2 or Sonnet instead |

**Source**: [How to write effective prompts for GPT-5 - Vellum](https://www.vellum.ai/blog/gpt-5-prompting-guide)

---

## Optimization 3: Verbosity Controls (Concise Mode)

### The Technique

**Give clear and concrete length constraints** to prevent verbosity drift.

**Research Finding**:

> "Give clear and concrete length constraints, with defaults of 3–6 sentences or ≤5 bullets for typical answers, and ≤2 sentences for simple 'yes/no + short explanation' questions."

**Source**: [GPT-5.2 Prompting Guide - Atlabs AI](https://www.atlabs.ai/blog/gpt-5.2-prompting-guide-the-2026-playbook-for-developers-agents)

### Why It Works

GPT-5 models (including Mini) are prone to verbosity drift without explicit constraints:

- ✅ **Explicit limits** prevent rambling
- ✅ **Faster inference** with less text to generate
- ✅ **Clearer output** focuses on essential information

### Implementation Pattern

#### Specify Exact Word/Sentence Limits

```markdown
### Verbosity Constraints

**Maximum prose per item**:
- Title: 5-8 words MAX
- Priority justification: 1 sentence (≤20 words)
- Fix description: 1-2 sentences (≤40 words)

**No additional prose**: No introductions, explanations, or commentary
```

#### Examples with Limits

**Item title**:

```
❌ BAD (21 words): "This is a critical implementation issue where the API methods including submit, cancel, and reset are not implemented on the form component"
✅ GOOD (6 words): "API Methods Missing on Form"
```

**Priority justification**:

```
❌ BAD (35 words): "This issue is critical because it violates the architectural requirement for API parity and prevents developers from using programmatic control which is essential for migration"
✅ GOOD (15 words): "Breaks API parity requirement, prevents programmatic control for library migration."
```

**Fix description**:

```
❌ BAD (60 words): "The smallest fix would be to add three public methods to the FormComponent class including submit() which triggers validation, cancel() which resets the form, and reset() which clears all fields, and all three should check the disabled state before executing"
✅ GOOD (25 words): "Add three methods to FormComponent: submit() triggers validation, cancel() resets form, reset() clears fields. Check disabled before executing."
```

---

## Optimization 4: XML Scaffolding for State Maintenance

### The Technique

**Use XML tags** to help GPT-5 Mini maintain structured state during multi-step procedures.

**Research Finding**:

> "For agents, utilize XML-tagged scaffolding to maintain state across long horizons."

**Source**: [GPT-5.2 Prompting Guide - Atlabs AI](https://www.atlabs.ai/blog/gpt-5.2-prompting-guide-the-2026-playbook-for-developers-agents)

### Why It Works

GPT-5 Mini has minimal reasoning capacity, so **explicit state structures** help it track information:

- ✅ **Clear data structures** - XML defines state schema
- ✅ **Predictable parsing** - Start/end tags guide extraction
- ✅ **No ambiguity** - State is explicitly represented

**CRITICAL**: XML is for **internal state management** ONLY. Output files should be markdown (or whatever format is required).

### Implementation Pattern

#### Internal State (XML)

```xml
<!-- GPT-5 Mini's working memory during execution -->

<known_items_registry>
  <item id="ITEM-1">
    <title>API Methods Missing</title>
    <keywords>["submit()", "cancel()", "reset()"]</keywords>
    <status>NOT_IMPLEMENTED</status>
  </item>
  <item id="ITEM-2">
    <title>API Events Missing</title>
    <keywords>["(submit)", "(cancel)", "events"]</keywords>
    <status>NOT_IMPLEMENTED</status>
  </item>
</known_items_registry>

<current_analysis>
  <step>3</step>
  <requirement_being_checked>REQ-075</requirement_being_checked>
  <keywords_extracted>["submit()", "cancel()", "reset()"]</keywords_extracted>
  <matching_known_item>ITEM-1</matching_known_item>
  <action>SKIP</action>
</current_analysis>
```

#### Output File (Markdown)

```markdown
## Validated Items (NEW)

### ITEM-8: SSR Error Handling Missing

**Evidence:**
- **Spec**: REQ-062a at plan.md:179
- **Validation Score**: 8/10

[Pure markdown - no XML]
```

---

## Optimization 5: Mechanical Procedures (No Creative Decisions)

### The Technique

**Convert all logic into mechanical FOR EACH loops** and arithmetic operations.

**Research Context**:

> "GPT-5 mini reduced deep-reasoning capacity vs full GPT-5"

**Source**: [GPT-5 Mini vs Grok Code Fast 1 - Galaxy.ai](https://blog.galaxy.ai/compare/gpt-5-mini-vs-grok-code-fast-1)

### Why It Works

GPT-5 Mini cannot handle:

- ❌ "Intelligently determine dependencies"
- ❌ "Creatively solve the problem"
- ❌ "Use best judgment"

But GPT-5 Mini CAN handle:

- ✅ "FOR EACH task: IF file_path != prev_file_path: ADD [P] marker"
- ✅ "score = 0; IF has_spec: score += 2; IF has_tasks: score += 2"
- ✅ "IF keyword_overlap >= 50%: SKIP"

### Implementation Pattern

#### ❌ Creative Instructions (Don't Use)

```markdown
- "Break down the plan intelligently into tasks"
- "Determine which tasks can run in parallel"
- "Assess the quality of evidence"
- "Handle edge cases appropriately"
```

**Problem**: "Intelligently", "determine", "assess", "appropriately" require reasoning.

#### ✅ Mechanical Procedures (Use These)

```markdown
### Transformation 1: Extract Phases

FOR EACH line in plan.md:
  IF line starts with "## Phase":
    EXTRACT phase_number and phase_name
    CREATE phase header in tasks.md

### Transformation 2: Detect Parallelization

FOR EACH task:
  current_file = extract_file_path(task.description)
  previous_file = extract_file_path(previous_task.description)

  IF current_file != previous_file:
    task.parallel = true
    ADD [P] marker
  ELSE:
    task.parallel = false

### Transformation 3: Calculate Validation Score

score = 0
IF has exact spec.md line with REQ-XXX: score += 2
IF has exact tasks.md task ID (T-XXX): score += 2
IF lists ALL files searched: score += 2
IF shows "FOUND" or "NOT FOUND": score += 1
IF checked contracts/: score += 1

TOTAL: score / 10
```

### Mechanical vs Creative Comparison

| Task | Creative Approach | Mechanical Approach |
|------|-------------------|---------------------|
| **Parallelization** | "Determine which tasks are independent" | `IF file_A != file_B: parallel = true` |
| **Validation** | "Assess evidence quality" | `score = 0; IF has_X: score += 2` |
| **Matching** | "Check if item is similar to known item" | `IF overlap >= 50%: match = true` |
| **Filtering** | "Identify documentation requirements" | `IF contains "MUST document": EXCLUDE` |

**GPT-5 Mini works well** when all logic is procedural/arithmetic.

---

## Optimization 6: Explicit Validation Checklists

### The Technique

**Add self-validation checklists** before output to prevent hallucinations.

**Research Context**:

> "Known limitations: higher sensitivity to ambiguous prompts, and remaining risks of hallucination."

**Source**: [GPT-5 mini API - CometAPI](https://www.cometapi.com/gpt-5-mini-api/)

### Why It Works

GPT-5 Mini's reduced reasoning means it can make mistakes without noticing. **Checklists force self-correction**:

- ✅ **Catches errors** before output
- ✅ **Mechanical validation** (checkboxes are procedural)
- ✅ **Quality gate** prevents incomplete output

### Implementation Pattern

#### 8-Point Validation Checklist

```markdown
### Step 7: Validate Output

Before writing to file, verify ALL checkboxes:

□ All tasks have sequential T### IDs (T001, T002, T003...)?
□ All tasks have exact file paths in description?
□ [P] markers only on tasks with different files?
□ [Story] labels match user stories in spec.md?
□ Task order follows dependency constraints?
□ Each phase has checkpoint criteria?
□ Summary counts are accurate (counted manually)?
□ No ambiguous descriptions (all have verb + object + path)?

IF all checked: PROCEED to Step 8 (write file)
ELSE: FIX issues and re-run validation
```

#### Example Validation

```markdown
Task: "- [ ] T042 Implement keyboard handler"

Checklist:
✅ Has T### ID (T042)
❌ Missing file path
❌ Missing [P] or [Story] marker
RESULT: INVALID

Fixed: "- [ ] T042 [US2] Implement keyboard handler in form.component.ts at line 145"

Checklist:
✅ Has T### ID (T042)
✅ Has file path (form.component.ts)
✅ Has [Story] marker (US2)
RESULT: VALID
```

---

## Optimization 7: Explicit Error Conditions

### The Technique

**Define exact STOP conditions** with explicit error messages.

**Research Context**:

> "GPT-5 mini higher sensitivity to ambiguous prompts"

**Source**: [GPT-5 mini Model Card - PromptHub](https://www.prompthub.us/models/gpt-5-mini)

### Why It Works

GPT-5 Mini doesn't handle ambiguity well. **Explicit error conditions** tell it exactly when to stop:

- ✅ **Fail fast** - Better to stop than hallucinate
- ✅ **Clear messages** - User knows what went wrong
- ✅ **No guessing** - Mini doesn't try to "fix" problems creatively

### Implementation Pattern

```markdown
## Error Handling

### If plan.md not found:

STOP execution immediately
OUTPUT: "plan.md not found. Run planning workflow first."
EXIT (do NOT continue to Step 1)

### If context exceeds limit:

IF total_tokens > 180000:
  STOP execution immediately
  OUTPUT: "Feature too large (~[total]K tokens). Use GPT-4.1 (1M context)."
  EXIT

### If ambiguous file path:

IF file_path does NOT match pattern "packages/.+\.(ts|html|scss)":
  STOP execution immediately
  OUTPUT: "Ambiguous file path '[path]' in plan.md at line [N]. Please specify exact path."
  EXIT
```

### Context Size Pre-Check Example

```markdown
## Step 0.0: Context Size Pre-Check (MANDATORY)

### Step 0.0.3: Estimate Token Count
[... calculation ...]

### Step 0.0.4: Evaluate

IF total_tokens_estimate > 180000:
  STOP
  Use AskUserQuestion to prompt:
    "Feature too large (~[X]K tokens). Switch to GPT-4.1?"
    Options:
      1. Switch to GPT-4.1 (Recommended) → EXIT with switch command
      2. Continue anyway → WARN and proceed
      3. Cancel → EXIT with suggestions
```

**Benefit**: User gets clear guidance, GPT-5 Mini doesn't try to "figure it out".

---

## Optimization 8: XML Scaffolding Examples (Not Output)

### The Technique

**Show XML examples for structured data**, but output markdown/JSON as required.

**Clarification**: XML is for **internal state management**, NOT output format.

### Implementation Pattern

```markdown
## Output (CTCO Step 4)

### Internal State (XML Scaffolding)

**NOTE**: This XML structure is for YOUR INTERNAL STATE MANAGEMENT ONLY.
DO NOT write XML to the output file.

```xml
<!-- Internal agent state - NOT written to file -->
<analysis>
  <analysis_mode>INCREMENTAL</analysis_mode>
  <known_items_loaded>7</known_items_loaded>

  <item_registry>
    <item id="ITEM-1">
      <keywords>["submit()", "cancel()"]</keywords>
    </item>
  </item_registry>
</analysis>
```

### Output File Format (MARKDOWN - What Actually Gets Written)

**CRITICAL**: The output file MUST be MARKDOWN format (not XML).

```markdown
## Validated Items (NEW)

### ITEM-1: Title

**Evidence:**
[Pure markdown - no XML]
```
```

**Why separate internal/output**:
- ✅ **Internal XML** helps Mini track state during FOR EACH loops
- ✅ **Output markdown** is what downstream tools expect
- ✅ **Clear separation** prevents confusion

---

## Performance Characteristics

### Speed Optimization

**GPT-5 Mini performance** (from research):

- **Faster inference**: 2-3x faster than GPT-4.1
- **Kernel fusion**: Combines operations for speed
- **Tensor parallelism**: Parallel processing optimization
- **Minimal thinking loops**: Less internal reasoning = faster output

**Real-world timing**:

- Analysis (small feature): 10-20 seconds
- Task generation: 5-10 seconds
- vs GPT-4.1: 30-60 seconds for analysis

### Quality vs Speed Trade-off

**Quality**: 85-95% of GPT-5 full model
**Speed**: 2-3x faster
**Cost**: 0x (free)

**When quality is acceptable**:

- ✅ Mechanical transformations (task generation)
- ✅ Pattern matching (detection tasks)
- ✅ Template filling (structured output)
- ✅ Keyword search (requirement validation)

**When quality matters more**:

- ⚠️ Use Haiku 4.5 (0.33x, better quality)
- ⚠️ Use Sonnet 4.5 (1x, reasoning capable)

---

## Common Pitfalls to Avoid

### ❌ Pitfall 1: Relying on Inference

```markdown
❌ BAD: "Generate tasks intelligently"
✅ GOOD: "FOR EACH bullet in plan.md: IF has verb + object: GENERATE task with T### ID"
```

### ❌ Pitfall 2: No Verbosity Limits

```markdown
❌ BAD: "Describe the issue" (unlimited prose)
✅ GOOD: "Issue title (5-8 words), fix description (≤40 words), no prose"
```

### ❌ Pitfall 3: Assuming Deep Reasoning

```markdown
❌ BAD: "Determine subtle dependencies between tasks"
✅ GOOD: "IF task mentions component_X AND previous task creates component_X: dependency = true"
```

### ❌ Pitfall 4: No Context Size Check

```markdown
❌ BAD: [Just run analysis on 300K tokens]
✅ GOOD: [Pre-check estimates tokens, prompts switch to GPT-4.1 if >180K]
```

### ❌ Pitfall 5: XML in Output Files

```markdown
❌ BAD: Write <item><title>Title</title></item> to report.md
✅ GOOD: Use XML internally, write markdown to file
```

---

## Optimization Comparison: GPT-5 Mini vs GPT-4.1

| Optimization | GPT-5 Mini | GPT-4.1 | Rationale |
|-------------|------------|---------|-----------|
| **CTCO Framework** | ✅ **Required** | ✅ Helpful | Mini needs more structure |
| **reasoning_effort** | ✅ `minimal` | N/A | Mini has this parameter |
| **Verbosity controls** | ✅ **Critical** | ✅ Helpful | Mini more prone to drift |
| **XML scaffolding** | ✅ **Required** | ✅ Examples only | Mini needs explicit state |
| **Mechanical procedures** | ✅ **Required** | ✅ Helpful | Mini can't reason |
| **Validation checklists** | ✅ **Required** | ✅ Helpful | Mini needs self-correction |
| **Explicit errors** | ✅ **Required** | ✅ Helpful | Mini can't infer gracefully |
| **Sandwich method** | ❌ Not needed | ✅ **Required** | 200K vs 1M context |
| **Progressive disclosure** | ❌ Not applicable | ✅ For >500K | Context limit difference |

**Key insight**: GPT-5 Mini needs **MORE structure** (CTCO, XML) but **LESS long-context handling** (no sandwich, no progressive disclosure) than GPT-4.1.

---

## Best Practices Summary

### For Fast Inference

1. **Use `reasoning_effort: minimal`** - Leverage kernel fusion
2. **Keep prompts under 180K** - Leave 20K buffer
3. **Mechanical procedures only** - No creative decisions
4. **Explicit formats** - Show exact templates

### For Structured Output

1. **CTCO framework** - Context → Task → Constraints → Output
2. **Verbosity limits** - Title ≤8 words, fix ≤40 words
3. **XML scaffolding** - Internal state (not output)
4. **Validation checklists** - Self-correction before output

### For Quality

1. **Explicit instructions** - No "intelligently" or "appropriately"
2. **Error conditions** - IF-THEN for every error case
3. **Examples** - Show desired output, not just describe
4. **Testing** - Validate output against baseline (Haiku 4.5)

---

## Use Cases for GPT-5 Mini

### ✅ Excellent For

1. **Task generation**
   - Input: Structured plan.md
   - Output: tasks.md with T### IDs
   - Process: Mechanical transformations

2. **Analysis tasks**
   - Input: spec.md + implementation files (<180K)
   - Output: analysis-report.md
   - Process: Keyword search + pattern matching

3. **Template filling**
   - Input: Data + template
   - Output: Structured document
   - Process: Fill [placeholders]

4. **Structured transformations**
   - Input: Format A
   - Output: Format B
   - Process: Mechanical conversion

### ❌ Not Suitable For

1. **Reasoning tasks** (use GPT-5.2 or Sonnet 4.5)
   - Requires judgment calls
   - Needs inference
   - Complex problem-solving

2. **Large features** (use GPT-4.1)
   - > 180K tokens
   - Needs 1M context
   - Complex codebases

3. **Creative writing** (use Sonnet 4.5)
   - Requires originality
   - Needs domain knowledge
   - Subtle nuance important

4. **Code implementation** (use Sonnet 4.5 or GPT-5.1-Codex)
   - Requires understanding context
   - Needs error recovery
   - Edge case handling

---

## Testing Your Prompts

### Verification Checklist

Before deploying a GPT-5 Mini prompt:

- [ ] **CTCO framework applied** - All 4 sections present?
- [ ] **reasoning_effort: minimal** - Set in model_config?
- [ ] **Verbosity limits specified** - Word counts for each section?
- [ ] **XML scaffolding** - Internal state structures defined?
- [ ] **All logic is mechanical** - No "intelligently" or "determine"?
- [ ] **Validation checklist** - Self-correction steps included?
- [ ] **Error conditions explicit** - IF-THEN for each error?
- [ ] **Context size check** - Pre-check estimates tokens?

### Quality Validation

**Compare to baseline**:

```bash
# Generate with Haiku 4.5 (baseline)
copilot -m "haiku-4.5" /tasks

# Generate with GPT-5 Mini (optimized)
copilot -m "gpt-5-mini" /tasks-gpt-5-mini

# Compare outputs
diff tasks-haiku.md tasks-gpt5mini.md
```

**Acceptance criteria**: 85-95% similarity to Haiku 4.5 output.

---

## Quick Reference Card

### GPT-5 Mini Optimization Checklist

```
✅ CTCO Framework (Context → Task → Constraints → Output)
✅ reasoning_effort: minimal (in model_config)
✅ verbosity: concise (in model_config)
✅ Verbosity limits (≤8 words title, ≤20 priority, ≤40 fix)
✅ XML scaffolding (internal state, not output)
✅ Mechanical procedures (FOR EACH, IF-THEN, arithmetic)
✅ Validation checklist (8-point self-correction)
✅ Explicit error conditions (STOP, OUTPUT, EXIT)
✅ Context size pre-check (180K threshold with prompt)
✅ Examples with exact formats (not just descriptions)
```

**Result**: 85-95% quality at 0x cost with 2-3x faster inference.

---

## Research Sources

**Primary Sources**:

- [GPT-5 mini Model Card - PromptHub](https://www.prompthub.us/models/gpt-5-mini) - Model specifications, performance characteristics
- [GPT-5 mini API - CometAPI](https://www.cometapi.com/gpt-5-mini-api/) - Fast inference, kernel fusion, reasoning_effort parameter
- [GPT-5.2 Prompting Guide: The 2026 Playbook - Atlabs AI](https://www.atlabs.ai/blog/gpt-5.2-prompting-guide-the-2026-playbook-for-developers-agents) - CTCO framework, XML scaffolding, verbosity controls
- [GPT-5 prompting guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide) - Structured prompting best practices
- [How to write effective prompts for GPT-5 - Vellum](https://www.vellum.ai/blog/gpt-5-prompting-guide) - 18 tips including verbosity, reasoning effort
- [GPT-5 Mini vs Grok Code Fast 1 - Galaxy.ai](https://blog.galaxy.ai/compare/gpt-5-mini-vs-grok-code-fast-1) - Comparative analysis, limitations
- [GPT-5 Prompt Migration and Improvement | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/prompt-optimization-cookbook) - Prompt optimizer tool, migration guide

---

## Related Documents

- [MODEL-OPTIMIZATION-GPT-4-1.md](./MODEL-OPTIMIZATION-GPT-4-1.md) - For large features (>180K tokens)
- [MODEL-OPTIMIZATION-GPT-5-1-CODEX.md](./MODEL-OPTIMIZATION-GPT-5-1-CODEX.md) - For code implementation tasks
- [MODEL-FRONTMATTER.md](./MODEL-FRONTMATTER.md) - How to specify models in agent/prompt files
