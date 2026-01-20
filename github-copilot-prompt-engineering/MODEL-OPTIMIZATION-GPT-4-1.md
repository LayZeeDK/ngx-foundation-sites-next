# GPT-4.1 Prompt Optimization Guide

**Last Updated:** 2026-01-20

This document provides optimization strategies for GPT-4.1, OpenAI's 1M context window model optimized for long-context work.

---

## Model Characteristics

| Attribute | Value |
|-----------|-------|
| **Context Window** | 1,000,000 tokens |
| **Reasoning** | Non-reasoning (procedural) |
| **Cost** | 0x (free in GitHub Copilot), 85% cheaper than GPT-4o via API |
| **Best For** | Large features (>180K tokens) requiring long-context analysis |

### Key Capabilities

1. **1M token context window** - First OpenAI model with this capacity
2. **Accurate retrieval at all positions** - Consistently finds information throughout 1M context
3. **Literal instruction following** - Does EXACTLY what instructions say (no implicit inference)
4. **Non-reasoning model** - Optimized for following procedures, not creative problem-solving

**Source**: [Introducing GPT-4.1 in the API | OpenAI](https://openai.com/index/gpt-4-1/)

---

## Quick Reference

| Optimization | Description | Priority |
|-------------|-------------|----------|
| [Sandwich Method](#optimization-1-sandwich-method-critical-for-long-context) | Instructions at beginning AND end | Critical |
| [Literal Instructions](#optimization-2-literal-instruction-following) | Be extremely explicit | Critical |
| [Progressive Disclosure](#optimization-3-progressive-disclosure-for-very-large-features) | Load artifacts progressively | High |
| [Structured Formatting](#optimization-4-structured-formatting-for-long-context-navigation) | Use markdown headers for navigation | High |
| [Explicit Validation](#optimization-5-explicit-validation-and-error-handling) | Define exact error conditions | Medium |

---

## Optimization 1: Sandwich Method (Critical for Long Context)

### The Technique

**Place instructions at BOTH beginning AND end of prompt** when dealing with long context (>100K tokens).

**Research Finding**:

> "For long contexts, the best results come from placing instructions both before and after the provided content. The sandwich method works best."
>
> "If you can only place instructions in one location, placing them at the end performs better than the beginning."

**Source**: [GPT-4.1 Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt4-1_prompting_guide)

### Why It Works

GPT-4.1 processes 1M tokens but may start "reading" from different positions. Instructions at both ends ensure:

- ✅ **Accessible from any position** in the long context
- ✅ **Reinforcement** of critical constraints
- ✅ **No scrolling required** to find instructions

### Implementation Pattern

```markdown
# [BEGINNING OF PROMPT]

## Goal

[High-level objective]

## Execution Steps

### Step 0: Initialize
[Detailed instructions]

### Step 1: Load Artifacts
[Detailed instructions]

### Step 2-5: Analysis Steps
[Detailed instructions - may be 500+ lines]

### Step 6: Output
[Detailed instructions]

---

[MIDDLE: Large artifacts - documents, code files]
[This section can be 500K-900K tokens]

---

# [END OF PROMPT - SANDWICH]

# 🔁 FINAL EXECUTION REMINDER (Sandwich Method)

**You are GPT-4.1 with 1M context. Execute this workflow EXACTLY:**

□ Step 0: Initialize
□ Step 1: Load artifacts
□ Step 2: Analyze
□ Step 3: Build output
□ Step 4: Validate
□ Step 5: Write file
□ Step 6: Report to user

**Critical constraints** (repeated from beginning):
- [Key constraint 1]
- [Key constraint 2]
- [Key constraint 3]

**Execute Step 6 now.**
```

### Example: Analysis Workflow

**Beginning**:

```markdown
## Goal

Generate analysis report by following 6-step mechanical workflow.

## Step 6: Write Report

Use Write tool to create analysis-report.md with COMPLETE template.
Do NOT summarize - write full structured report.
```

**End (Sandwich)**:

```markdown
# 🔁 FINAL EXECUTION REMINDER

Execute Steps 0-6 EXACTLY:
□ Step 6: Write analysis-report.md (Use Write tool with COMPLETE template)

**Critical**: Write FULL report to file (not summary)

**Execute STEP 6 now. Use Write tool. Write complete report.**
```

**Benefit**: Even if GPT-4.1 is processing the end of a 1M context, it sees the instructions immediately.

---

## Optimization 2: Literal Instruction Following

### The Technique

**Be EXTREMELY explicit** - GPT-4.1 follows instructions literally without inference.

**Research Finding**:

> "GPT-4.1 won't follow implicit rules anymore—it does exactly what you tell it to do, no more, no less. You need to be explicit and should test all old prompts thoroughly."

**Source**: [The Complete Guide to GPT-4.1 - PromptHub](https://www.prompthub.us/blog/the-complete-guide-to-gpt-4-1-models-performance-pricing-and-prompting-tips)

### Why It Works

GPT-4.1 is trained to follow instructions more closely and more literally than predecessors (GPT-4, GPT-4o), which liberally inferred intent from prompts.

**Key difference**:

- **GPT-4o**: "Write a report" → Infers you want structured evidence
- **GPT-4.1**: "Write a report" → Might write prose summary ❌
- **GPT-4.1 with explicit template**: Writes exact format ✅

### Implementation Pattern

#### ❌ Implicit Instructions (Don't Use)

```markdown
- "Identify issues intelligently"
- "Handle errors gracefully"
- "Write a good report"
- "Analyze thoroughly"
- "Use best practices"
```

**Problem**: GPT-4.1 doesn't know what "intelligently", "gracefully", "good", "thoroughly", or "best practices" mean.

#### ✅ Explicit Instructions (Use These)

```markdown
- "FOR EACH requirement: EXTRACT keywords → SEARCH files → IF NOT FOUND: add to list"
- "IF config.md not found: STOP, OUTPUT 'config.md not found', EXIT"
- "Use Write tool, file path = analysis-report.md, content = template with ALL [placeholders] filled"
- "Search in this order: 1. Source files, 2. Templates, 3. Tests"
- "Apply validation score: score = 0; IF has_spec_line: score += 2; IF has_task_id: score += 2"
```

### Explicit Command Patterns

| Pattern | Explicit Version |
|---------|------------------|
| **Conditionals** | `IF condition: action ELSE: alternative_action` |
| **Loops** | `FOR EACH item in list: action1 → action2 → action3` |
| **Validation** | `CHECK all boxes: □ Check1 □ Check2 IF all checked: PROCEED ELSE: STOP` |
| **Output format** | Provide exact template with `[placeholders]` to fill |
| **Error handling** | `IF error_X: STOP, OUTPUT "message", EXIT` |

---

## Optimization 3: Progressive Disclosure (For Very Large Features)

### The Technique

**Load artifacts progressively** instead of all at once, even though GPT-4.1 can handle 1M tokens.

**Research Finding**:

> "GPT-4.1 consistently retrieves information accurately at all positions up to 1M tokens. However, while GPT-4.1 can process up to 1 million tokens, performance can taper off. Break large inputs into logical chunks, summarize results, and feed them iteratively."

**Source**: [Inside GPT-4.1: Technical Analysis - Trickle](https://trickle.so/blog/inside-gpt-4-1-technical-analysis)

### Why It Works

Even though GPT-4.1's 1M context is powerful:

- ✅ **Focused working memory** improves accuracy
- ✅ **Chunking reduces noise** from irrelevant sections
- ✅ **Performance improvement** on very large codebases (>500K tokens)

### Implementation Strategy

#### For Features >500K Tokens

```markdown
### STEP 1: Load Minimal Sections First

**spec.md**:
- Load: "Functional Requirements" section only
- Skip: Examples, detailed prose, success criteria

**plan.md**:
- Load: "Phases" and "Architecture" sections only
- Skip: Detailed implementation notes, checkpoints

**tasks.md**:
- Load: Task IDs and descriptions only
- Skip: Checkpoint criteria, notes

### STEP 2: Search Implementation (Use Grep First)

**Before loading full files**:
- Use Grep tool for keyword search
- Get file list with matches
- Only Read full files when grep finds matches

**Why**: Avoid loading 50+ implementation files when only 5 are relevant

### STEP 3: Load Contracts On-Demand

**When validation requires contract verification**:
- Use Glob to find contract files
- Read specific contracts only (not all at once)
- Verify interface definitions for evidence

**Why**: Contracts can be large (TypeScript with JSDoc) - load only when needed
```

#### Example Workflow

```markdown
# Feature with 800K tokens total

STEP 1: Load requirements (100K)
- spec.md Functional Requirements section
- plan.md Phases section
- tasks.md Task IDs only

STEP 2: Search for "submit()" keyword (0K - just grep)
- Grep: form-handler.ts, form.component.ts
- Result: NOT FOUND in both

STEP 3: Load contract for verification (50K)
- Read: contracts/form-api.ts
- Verify: Interface defines submit() method

STEP 4: Build evidence (already have all needed info)
- Don't load full implementation files (not needed)

Total loaded: 150K tokens (instead of 800K)
Performance: Much faster, same accuracy
```

---

## Optimization 4: Structured Formatting for Long-Context Navigation

### The Technique

**Use structural markers** to help GPT-4.1 navigate 1M context efficiently.

**Research Finding**:

> "Use markdown titles for major sections and subsections, inline backticks or backtick blocks to precisely wrap code, and standard numbered or bulleted lists as needed. XML also performs well for precisely wrapping sections with start and end tags."

**Source**: [GPT-4.1 Prompting Guide - God of Prompt](https://www.godofprompt.ai/blog/gpt-4-1-prompting-guide)

### Why It Works

GPT-4.1 uses structural markers for "jump to section" retrieval in long context:

- ✅ **Markdown headers** (`##`, `###`) create navigable sections
- ✅ **Consistent formatting** improves position-independent retrieval
- ✅ **Visual hierarchy** helps GPT-4.1 understand information architecture

### Implementation Pattern

#### Markdown Headers (Hierarchical Structure)

```markdown
# Level 1: Major Sections
## Level 2: Steps (## Step 0, ## Step 1)
### Level 3: Sub-steps (### 2.1, ### 2.2)
#### Level 4: Procedures (#### 2.1.1, #### 2.1.2)
```

**Benefits**:
- GPT-4.1 can reference "See Step 2.3 above" and jump directly
- Hierarchical structure creates logical tree
- Headers act as bookmarks in 1M context

#### Code/Command Wrapping

```markdown
**Inline code**: Use `backticks` for keywords like `submit()`, `REQ-075`, `T140`

**Code blocks**: Use triple backticks for multi-line

```typescript
// Example code
function submit(): void {
  this.submitted.set(true);
}
```
```

#### XML for Structured Data

```xml
<!-- For registry or structured state -->
<registry>
  <item id="ITEM-1">
    <title>Title</title>
    <status>PENDING</status>
  </item>
</registry>
```

**Use XML when**: Representing structured data, multi-level hierarchies, or state machines.

### Long-Context References

**Repeat key information** across long distances:

```markdown
## STEP 3: Build List

**REMINDER from Step 0.5**: Check against KNOWN_ITEMS registry before adding each item.

FOR EACH potential item:
  Check KNOWN_ITEMS (loaded in Step 0.5 above)
  IF match found: SKIP
  ELSE: Add to list
```

**Why**: Don't assume GPT-4.1 "remembers" constraints from 500K tokens ago - repeat them.

---

## Optimization 5: Explicit Validation and Error Handling

### The Technique

**Specify exact error conditions** with explicit STOP/PROCEED actions.

### Implementation Pattern

#### Error Conditions

```markdown
## Error Handling

### If artifact not found:

IF config.md not found:
  STOP execution immediately
  OUTPUT: "config.md not found. Run setup first."
  EXIT (do NOT continue to next step)

### If context overflow:

IF total_tokens > 1000000:
  STOP execution immediately
  OUTPUT: "Feature too large (>1M tokens). Split into smaller components."
  EXIT

### If validation fails:

IF validation_score < 6:
  REMOVE item from final list
  ADD to false_positives section
  CONTINUE to next item
```

#### Validation Checklists

**Use checkboxes for self-validation**:

```markdown
Before proceeding to Step 6, verify ALL checkboxes:

- [ ] Completed Steps 0-5
- [ ] All items have REQ-XXX references
- [ ] All items have validation scores ≥ 6/10
- [ ] Checked against KNOWN_ITEMS registry
- [ ] False positives removed

IF all checked: PROCEED to Step 6
ELSE: FIX issues and re-check
```

**Why**: Checklists are mechanical and match GPT-4.1's procedural strength.

---

## Performance Characteristics

### Speed vs Context Trade-offs

| Feature Size | Recommended Approach | Performance |
|-------------|---------------------|-------------|
| **<180K tokens** | Use GPT-5 Mini | 10-20 sec ⚡ |
| **180K-500K tokens** | GPT-4.1 (standard) | 30-60 sec |
| **500K-900K tokens** | GPT-4.1 + progressive disclosure | 45-90 sec |
| **>900K tokens** | Split into chunks | Multiple runs |

### Long-Context Retrieval Performance

**Research Finding**:

> "GPT-4.1 consistently retrieves information accurately at all positions and all context lengths, all the way up to 1 million tokens."

**Source**: [Inside GPT-4.1: Technical Analysis - Trickle](https://trickle.so/blog/inside-gpt-4-1-technical-analysis)

**Practical implications**:
- ✅ Can place important info at beginning, middle, or end
- ✅ Sandwich method works because retrieval is position-independent
- ✅ Can reference "See Step 2.3 above" from Step 6 reliably

---

## Common Pitfalls to Avoid

### ❌ Pitfall 1: Implicit Instructions

```markdown
❌ BAD: "Analyze the code and find issues"
✅ GOOD: "FOR EACH requirement: SEARCH implementation files using keywords → IF NOT FOUND: add to list"
```

### ❌ Pitfall 2: Assuming Inference

```markdown
❌ BAD: "Write a comprehensive report"
✅ GOOD: "Use Write tool. File: analysis-report.md. Content: [exact template]. Include ALL items with Evidence sections."
```

### ❌ Pitfall 3: Vague Error Handling

```markdown
❌ BAD: "Handle errors appropriately"
✅ GOOD: "IF file not found: STOP, OUTPUT 'File X not found', EXIT. IF validation fails: REMOVE item, ADD to false_positives."
```

### ❌ Pitfall 4: No End Instructions (Long Context)

```markdown
❌ BAD: [Instructions only at beginning of 1M prompt]
✅ GOOD: [Instructions at beginning + sandwich reminder at end]
```

### ❌ Pitfall 5: Loading Everything at Once

```markdown
❌ BAD: "Load all artifacts: spec, plan, tasks, contracts, implementation"
✅ GOOD: "Load minimal sections first. Use Grep before Read. Load contracts on-demand."
```

---

## Best Practices Summary

### For Long Context (>100K tokens)

1. **Use sandwich method** - Instructions at beginning AND end
2. **Repeat constraints** in each major step (don't assume memory)
3. **Reference by heading** - "See Step 2.3 above" instead of repeating content
4. **Use markdown headers** - Create navigable sections (##, ###)
5. **Progressive disclosure** - Load minimal → search → load on-demand

### For Literal Following

1. **No implicit verbs** - Replace "intelligently" with explicit FOR EACH loops
2. **Provide templates** - Show exact format with [placeholders]
3. **Explicit conditionals** - IF-THEN-ELSE, not "handle appropriately"
4. **Specify tools** - "Use Write tool" not "save the output"
5. **Validation checklists** - Checkboxes for self-verification

### For Non-Reasoning Model

1. **Mechanical procedures** - Pattern matching, not creative problem-solving
2. **Arithmetic scoring** - `score = 0; IF condition: score += 2`
3. **Rule-based filtering** - `IF contains "CSS-only": SKIP`
4. **No judgment calls** - Everything must be computable/matchable

---

## Comparison: GPT-4.1 vs Other Models

| Aspect | GPT-4.1 | GPT-5 Mini | Sonnet 4.5 |
|--------|---------|------------|------------|
| **Context** | 1M | 200K | 200K |
| **Reasoning** | None | Minimal | High |
| **Instruction style** | **Very literal** | Literal | Inference-capable |
| **Optimization** | Sandwich method | CTCO + XML | Natural language |
| **Best for** | Large features | Fast small features | Complex reasoning |
| **Cost (Copilot)** | 0x | 0x | 1x |

---

## Tools and Techniques

### GitHub Copilot Agent Tools

GPT-4.1 agents typically have:

- ✅ **Read**: Read files with line numbers
- ✅ **Write**: Write file contents
- ✅ **Glob**: Find files by pattern
- ✅ **Grep**: Search file contents
- ❌ **Bash**: No direct shell access
- ✅ **AskUserQuestion**: Prompt user with options

**Implication**: All operations must use these tools (no shell commands).

### Recommended Workflows

**Pattern**: Load → Filter → Search → Validate → Output

```markdown
1. Load artifacts (Read tool - progressive disclosure)
2. Filter requirements (rule-based exclusions)
3. Search implementation (Grep before Read)
4. Validate items (arithmetic scoring, checklists)
5. Output report (Write tool with exact template)
```

---

## Testing Your Prompts

### Verification Checklist

Before deploying a GPT-4.1 prompt:

- [ ] **Sandwich method applied** - Instructions at beginning AND end?
- [ ] **All verbs are explicit** - No "intelligently", "appropriately", "well"?
- [ ] **Templates provided** - Exact format with [placeholders] shown?
- [ ] **Error conditions explicit** - IF-THEN for each error case?
- [ ] **Validation checkboxes** - Self-verification steps included?
- [ ] **Progressive disclosure** - Large features loaded in chunks?
- [ ] **Markdown headers** - Navigable structure (##, ###, ####)?
- [ ] **No inference assumptions** - Everything spelled out?

### Test Cases

**Test 1: Literal Following**
- Prompt: "Write output"
- Expected: GPT-4.1 asks "What format?" (too vague)
- Fixed: "Use Write tool, file: output.md, content: [template]"

**Test 2: Long Context**
- Prompt: [Instructions at beginning only, 800K context]
- Expected: May miss instructions at end
- Fixed: Add sandwich reminder at end

**Test 3: Error Handling**
- Prompt: "Handle missing files"
- Expected: GPT-4.1 might skip or guess
- Fixed: "IF file not found: STOP, OUTPUT 'error', EXIT"

---

## Research Sources

**Primary Sources**:

- [GPT-4.1 Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt4-1_prompting_guide) - Sandwich method, literal following
- [The Complete Guide to GPT-4.1 - PromptHub](https://www.prompthub.us/blog/the-complete-guide-to-gpt-4-1-models-performance-pricing-and-prompting-tips) - Comprehensive optimization strategies
- [GPT-4.1 Prompting Guide - God of Prompt](https://www.godofprompt.ai/blog/gpt-4-1-prompting-guide) - Structured formatting, explicit commands
- [Inside GPT-4.1: Technical Analysis - Trickle](https://trickle.so/blog/inside-gpt-4-1-technical-analysis) - Long-context performance, progressive disclosure
- [Getting the Most Out of GPT-4.1 - Steve Kinney](https://stevekinney.com/writing/getting-the-most-out-of-gpt-4-1) - Practical optimization tips
- [GPT-4.1 Model Documentation | OpenAI](https://platform.openai.com/docs/models/gpt-4.1) - Official specifications

---

## Related Documents

- [MODEL-OPTIMIZATION-GPT-5-MINI.md](./MODEL-OPTIMIZATION-GPT-5-MINI.md) - For smaller features (<180K tokens)
- [MODEL-OPTIMIZATION-GPT-5-1-CODEX.md](./MODEL-OPTIMIZATION-GPT-5-1-CODEX.md) - For code implementation tasks
- [MODEL-FRONTMATTER.md](./MODEL-FRONTMATTER.md) - How to specify models in agent/prompt files
