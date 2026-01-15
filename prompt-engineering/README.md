# Prompt Engineering Documentation

This directory contains research-backed optimization strategies for AI models used in the SpecKit workflow.

---

## 📚 Available Guides

### [Claude 4.5 Sonnet Optimization Guide](./CLAUDE-4-5-OPTIMIZATION.md)

**Model**: Claude Sonnet 4.5 (1M context)

**10 Key Optimizations**:

1. **Structured Prompting with XML** - `<role>`, `<task>`, `<constraints>`, `<output_format>`
2. **Direct Communication** - Skip preambles, be explicit about formats
3. **Extended Thinking** - Deep reasoning for complex tasks (16K+ tokens)
4. **Literal Instruction Following** - Explicit commands (Claude 4.x doesn't infer)
5. **Context Management** - Token budget awareness, context editing (29% improvement)
6. **Agentic Workflows** - Research → action → verify → repeat pattern
7. **Tool Use Optimization** - Treat tool definitions like prompts
8. **Chain-of-Thought** - Prefilling, multishot examples
9. **Memory & Sessions** - memory.md for continuity, /clear for fresh starts
10. **Model Selection** - Right model for the task (Sonnet vs Haiku vs Opus)

**Best for**: Complex reasoning, code implementation, agentic workflows requiring deep analysis

**Commands**: All SpecKit commands, Claude Code workflows

---

---

## GitHub Copilot Customization Files

### [GitHub Prompt Files Guide (`*.prompt.md`)](./GITHUB-PROMPT-MD-FILES.md)

**Purpose:** Comprehensive documentation for reusable prompt templates

**Covers:**

- Complete YAML frontmatter reference (`name`, `description`, `agent`, `model`, `tools`)
- Variable syntax (`${input:}`, `${workspaceFolder}`, `${selection}`)
- File and tool references
- Storage locations and invocation methods
- Complete examples (code explanation, component generator, review checklist)

### [GitHub Custom Agents Guide (`*.agent.md`)](./GITHUB-AGENT-MD-FILES.md)

**Purpose:** Comprehensive documentation for custom agent personas

**Covers:**

- Complete YAML frontmatter reference (`name`, `description`, `tools`, `target`, `mcp-servers`)
- MCP server integration and configuration
- Six essential areas from GitHub's 2,500+ repository analysis
- Agent archetypes (`@docs-agent`, `@test-agent`, `@security-agent`, etc.)
- Complete examples (Angular component agent, full-stack feature agent)

### [GitHub Copilot File Comparison](./GITHUB-COPILOT-FILE-COMPARISON.md)

**Purpose:** Side-by-side comparison of all customization file types

**Covers:**

- Quick reference matrix (all file types at a glance)
- Activation behavior comparison
- Frontmatter capabilities comparison
- Platform availability matrix
- When to use each file type
- Combination patterns and workflows
- Decision flowchart
- Common mistakes and migration guide

---

### [Claude Sonnet 4.5 Implementation Optimization Guide](./CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md)

**Model**: Claude Sonnet 4.5 (200K / 1M context, implementation-optimized)

**7 Implementation-Specific Optimizations**:

1. **Phase-Based Implementation** - Research → Setup → Implement → Verify → Complete with thinking breaks
2. **Parallel Tool Use** - Load multiple files simultaneously (10-20x speedup for context)
3. **Minimal Implementation** - OUT OF SCOPE list prevents over-engineering
4. **State Tracking** - Mark tasks [X] immediately in tasks.md + TodoWrite
5. **Error-First TDD** - Write test → get error → fix ONLY that error → repeat (0% error rate)
6. **Extended Thinking for Complex Logic** - 16K+ budgets for state management, error handling, accessibility
7. **Structured XML** - Multi-phase workflow with clear role, constraints, success criteria

**Best for**: Systematic implementation of tasks.md with TDD, state tracking, and quality verification

**Commands**: `/implement-sonnet-4-5` (Claude Code & GitHub Copilot)

**Performance**: 37% faster than standard implementation with better code quality

**Related**: Based on [Claude 4.5 Optimization Guide](./CLAUDE-4-5-OPTIMIZATION.md) with implementation-specific patterns

---

### [Claude Opus 4.5 Implementation Optimization Guide](./CLAUDE-OPUS-4-5-IMPLEMENTATION-OPTIMIZATION.md)

**Model**: Claude Opus 4.5 (200K context only, effort parameter, hybrid reasoning)

**10 Key Optimizations**:

1. **Effort Parameter** (Opus-only) - Medium default (76% token savings, matches Sonnet best)
2. **Extended Thinking Budgets** - 16K-64K for complex tasks (up to 64K supported)
3. **System Prompt Calibration** - Normal language (Opus more sensitive than previous)
4. **"Think" Word Avoidance** - Use "evaluate", "consider" when extended thinking disabled
5. **Parallel Tool Use** - Load files simultaneously (10-20x speedup)
6. **First-Try Correctness** - Trust expert coding, proactive edge case handling
7. **Vision for UI** - Screenshot comparison, crop tool for detail
8. **Structured XML** - Same as Sonnet 4.5
9. **Literal Instructions** - Same as Sonnet 4.5
10. **Minimal Implementation** - OUT OF SCOPE list

**Best for**: Complex reasoning, first-try correctness critical, deep debugging, state-of-the-art coding

**Performance**: 80.9% SWE-bench (vs Sonnet 4.5's 77.2%), 76% fewer tokens at medium effort

**Commands**: `/implement-opus-4-5` (Claude Code & GitHub Copilot)

**When to Use**: Complex implementations, production code, deep debugging, intricate logic (within 200K context)
**When to Use Sonnet Instead**: Daily work, speed > quality, cost-sensitive, **large features >200K tokens** (Sonnet has 1M context)

**Related**: Based on [Claude 4.5 Optimization Guide](./CLAUDE-4-5-OPTIMIZATION.md) + Opus-specific features

---

### [Claude Haiku 4.5 Optimization Guide](./CLAUDE-HAIKU-4-5-OPTIMIZATION.md)

**Model**: Claude Haiku 4.5 (200K context for GitHub Copilot Business & Claude Code Team)

**Context Window**: 200K tokens (standard), 64K max output

**Related**: [Command Optimization Recommendations](./HAIKU-4-5-COMMAND-OPTIMIZATION-RECOMMENDATIONS.md) - Applying optimizations to Spec Kit commands

### [Haiku 4.5 Command Optimization Recommendations](./HAIKU-4-5-COMMAND-OPTIMIZATION-RECOMMENDATIONS.md)

**Analysis of**: `tasks-haiku-4-5`, `clarify-haiku-4-5`, `specify-haiku-4-5`, `checklist-haiku-4-5`

**Key Recommendations**:

- ✅ **Extended thinking** for tasks-haiku-4-5 (2K budget) - Better dependency detection
- ✅ **Extended thinking** for clarify-haiku-4-5 (4K budget) - Better ambiguity detection
- ⚠️ **Monitor** specify-haiku-4-5 - Implement only if quality issues observed
- 🚫 **Skip beta features** - Structured outputs, interleaved thinking (wait for GA)
- 🚫 **Not applicable** - Prompt caching, batch API, RAG (wrong use case)

**Cost impact**: +$0.01-$0.02 per command with extended thinking

**9 Core Optimizations** (in full guide):

1. Explicit structured instructions | 2. Step-bounded reasoning | 3. Checklists | 4. Role specification
2. Context & motivation | 6. High-quality examples | 7. Meta-prompting | 8. XML tagging | 9. Clear evaluation

**Additional Sections** (in full guide):

- Extended thinking configuration (2K-8K budgets)
- Structured outputs with JSON schema (⚠️ beta - do not use)
- RAG & batch processing optimization (prompt caching, hybrid retrieval)
- Multi-agent orchestration patterns
- Cost reduction strategies

---

### [GPT-5.1-Codex Implementation Optimization Guide](./GPT-5.1-CODEX-IMPLEMENTATION-OPTIMIZATION.md)

**Model**: GPT-5.1-Codex (400K context, adaptive reasoning)

**7 Key Optimizations**:

1. **Remove Guidance Rather Than Add It** - Trained for agentic coding, remove prescriptive steps
2. **Adaptive Reasoning** - No steering needed (model adjusts automatically)
3. **Bias Toward Action & Persistence** - Carry tasks to full completion end-to-end
4. **Engineering Quality Standards** - Correctness, clarity, reliability (no shortcuts)
5. **Tool Usage Optimization** - rg over grep, specialized tools over bash
6. **Progressive Disclosure** - For features >400K tokens (no compaction in regular Codex)
7. **Reasoning Effort** - Medium default (high for complex), no xhigh (Max-only)

**Best for**: GitHub Copilot implementation workflows with 400K context

**Commands**: `/implement-gpt-5-1-codex` (GitHub Copilot)

**Max-Only Features**: Compaction, xHigh reasoning, 30% token efficiency, 24+ hour operation

**Related**: [GPT-5.1-Codex-Mini Optimization](./GPT-5.1-CODEX-MINI-OPTIMIZATION.md)

---

### [GPT-5.1-Codex-Max Implementation Optimization Guide](./GPT-5.1-CODEX-MAX-IMPLEMENTATION-OPTIMIZATION.md)

**Model**: GPT-5.1-Codex-Max (400K base context, compaction for multi-window, xhigh reasoning)

**8 Key Optimizations** (3 Max-specific + 5 shared with regular Codex):

**Max-Only Features**:

1. **Context Compaction** - Automatic multi-window for >400K tokens (millions supported, 24+ hour autonomy)
2. **xHigh Reasoning Effort** - Extra high mode for critical/legacy/security code (5-10x latency, maximum quality)
3. **30% Token Efficiency** - Better performance with 30% fewer thinking tokens than regular Codex

**Shared with Regular Codex**:

4. **Remove Guidance** - Trust agentic training, minimal prompts
5. **Adaptive Reasoning** - Auto-adjusts depth, no steering
6. **Bias Toward Action** - Persist to full completion
7. **Engineering Quality** - Correctness, clarity, reliability (no shortcuts)
8. **Tool Optimization** - rg over grep, specialized tools

**Best for**: Features >400K tokens, multi-hour autonomous work, critical/security code requiring xHigh

**Performance**: 30% more token-efficient, automatic compaction for unlimited tokens, 24+ hour operation

**Commands**: `/implement-gpt-5-1-codex-max` (GitHub Copilot)

**When to Use Max vs. Regular Codex**:

- **Max**: >400K tokens (compaction), critical code (xHigh), project-scale refactors, multi-hour autonomy
- **Regular**: <400K tokens, cost-sensitive, simple-moderate complexity

**Compaction**: Automatic at ~400K, transparent, preserves task progress/objectives, prunes verbose history

**External State**: CRITICAL - mark tasks [X] immediately, commit every 3-5 tasks (survives compaction)

**Related**: Extends [GPT-5.1-Codex Guide](./GPT-5.1-CODEX-IMPLEMENTATION-OPTIMIZATION.md) with Max-only features

---

### [GPT-4.1 Optimization Guide](./GPT-4-1-OPTIMIZATION.md)

**Model**: GPT-4.1 (1M context, non-reasoning, 0x cost)

**5 Key Optimizations**:

1. **Sandwich Method** - Instructions at beginning AND end (critical for 1M context)
2. **Literal Instruction Following** - Extremely explicit commands (no inference)
3. **Progressive Disclosure** - Load in chunks for >500K features
4. **Structured Formatting** - Markdown headers for long-context navigation
5. **Explicit Validation** - Checklists and error conditions

**Best for**: Large features (>180K tokens) requiring long-context analysis

**Commands**: `/analyze-report-gaps-gpt-4-1`

---

### [Grok Code Fast 1 Optimization Guide](./GROK-CODE-FAST-1-OPTIMIZATION.md)

**Model**: grok-code-fast-1 (256K context, agentic reasoning)

**10 Key Optimizations**:

1. **Native Tool-Calling** - Use function calling, not XML (model designed for it)
2. **Detailed System Prompts** - Task, expectations, edge cases upfront
3. **Setup + Tools + Example Pattern** - 3-part prompt structure
4. **Preserve Prompt History for Caching** - 90%+ cache hit rates, 10x cheaper
5. **Agentic Over One-Shot** - Iterative tool-calling, not single-turn Q&A
6. **Rapid Iteration Strategy** - Quick attempts, refine (4x faster, 1/10th cost)
7. **XML/Markdown Context Structuring** - Section markers for 256K context
8. **Access Reasoning Traces** - Streaming mode for `reasoning_content`
9. **Plan-First Execution** - Prevent over-editing with 3-item plans
10. **Scope and File Boundaries** - Explicit paths, negative constraints

**Best for**: Agentic coding (bug fixes, scaffolding, tests), high-volume grunt work, iterative workflows

**Performance**: 70.8% SWE-bench, 92 tokens/sec, 4x faster; **0x cost in GitHub Copilot (VS Code)**

**Commands**: `/tasks-for-grok-code-fast-1` (Claude Code & GitHub Copilot), model picker in VS Code

**Related**: [GPT-5 Mini Guide](./GPT-5-MINI-OPTIMIZATION.md) (alternative for non-agentic tasks)

---

### [GPT-5 Mini Optimization Guide](./GPT-5-MINI-OPTIMIZATION.md)

**Model**: GPT-5 Mini (200K context, minimal reasoning, 0x cost)

**7 Key Optimizations**:

1. **CTCO Framework** - Context → Task → Constraints → Output
2. **reasoning_effort: minimal** - Fast inference with kernel fusion
3. **Verbosity Controls** - Strict word limits (≤8, ≤20, ≤40)
4. **Mechanical Procedures** - FOR EACH loops, arithmetic (no creative decisions)
5. **Validation Checklists** - 8-point self-correction
6. **Explicit Error Conditions** - IF-THEN with STOP/EXIT
7. **XML Scaffolding** - Internal state management (not output)

**Best for**: Small-medium features (<180K tokens) requiring fast analysis

**Commands**: `/analyze-report-gaps-gpt-5-mini`, `/tasks-gpt-5-mini`

---

## 🎯 When to Use Which Model

### Decision Matrix

```
Feature Size Estimation:
total_tokens = (spec lines × 20) + (plan × 20) + (tasks × 15) + (code × 18)

IF total_tokens < 180K:
  ✅ USE GPT-5 Mini OR Haiku 4.5 OR Grok Code Fast 1
  - GPT-5 Mini: 10-20 sec, 0x cost, 85-95% quality (non-agentic)
  - Haiku 4.5: 15-25 sec, 0.33x cost, 90% of Sonnet performance
  - Grok Code Fast 1: 5-15 sec, low cost, 70.8% SWE-bench (agentic tasks)

ELSE IF total_tokens < 256K:
  ✅ USE GPT-4.1 OR Haiku 4.5 OR Grok Code Fast 1
  - GPT-4.1: 30-60 sec, 0x cost, 1M context
  - Haiku 4.5: 20-35 sec, 0.33x cost, 200K context limit
  - Grok Code Fast 1: 10-25 sec, low cost, 256K context (agentic)

ELSE IF total_tokens < 1M:
  ✅ USE GPT-4.1 OR Sonnet 4.5
  - GPT-4.1: 30-90 sec, 0x cost
  - Sonnet 4.5: 30-60 sec, 1x cost, better reasoning

ELSE:
  ⚠️ SPLIT feature into smaller components
```

### Task Type Quick Guide

```
IF task is iterative bug fix/scaffolding/tests:
   ✅ USE Grok Code Fast 1 (fastest agentic, lowest cost)

ELSE IF task is mechanical transformation (no reasoning):
   ✅ USE GPT-5 Mini (0x cost) OR Haiku 4.5 (0.33x)

ELSE IF task needs extended thinking:
   ✅ USE Sonnet 4.5 OR Opus 4.5

ELSE IF context > 256K:
   ✅ USE GPT-4.1 (1M context, 0x cost)
```

### Task Type Suitability

| Task Type                | GPT-5 Mini         | GPT-4.1            | Haiku 4.5          | Grok Code Fast 1      | Sonnet 4.5           |
| ------------------------ | ------------------ | ------------------ | ------------------ | --------------------- | -------------------- |
| **Gap analysis (small)** | ✅ Best (0x)       | ⚠️ Slower          | ✅ Best (0.33x)    | ✅ Good (low cost)    | ⚠️ Overkill          |
| **Gap analysis (large)** | ❌ Context limit   | ✅ Good (0x)       | ✅ Good (0.33x)    | ✅ Good (256K)        | ✅ Best (1x)         |
| **Task generation**      | ✅ Best (0x)       | ✅ Good (0x)       | ✅ Best (0.33x)    | ✅ Good               | ⚠️ Overkill          |
| **Gap validation**       | ❌ Needs reasoning | ❌ Needs reasoning | ⚠️ Light reasoning | ⚠️ Light reasoning    | ✅ Best (1x)         |
| **Implementation**       | ❌ No reasoning    | ❌ No reasoning    | ⚠️ Simple code     | ✅ Agentic (fast)     | ✅ Best (1x)         |
| **Complex reasoning**    | ❌ Not capable     | ❌ Not capable     | ⚠️ Basic           | ⚠️ Basic              | ✅ Extended thinking |
| **Agentic workflows**    | ❌ Not capable     | ❌ Not capable     | ✅ 90% of Sonnet   | ✅ **Best** (4x fast) | ✅ Good (1x)         |
| **Bug fixes/scaffolds**  | ❌ No reasoning    | ❌ No reasoning    | ✅ Good            | ✅ **Best** (cheap)   | ⚠️ Overkill          |

---

## 🔬 Research Foundation

### GPT-4.1 Research (2026)

**Key Finding**: "Sandwich method (instructions at beginning AND end) works best for long context"

- [GPT-4.1 Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt4-1_prompting_guide)
- [The Complete Guide to GPT-4.1 - PromptHub](https://www.prompthub.us/blog/the-complete-guide-to-gpt-4-1-models-performance-pricing-and-prompting-tips)

**Key Finding**: "GPT-4.1 follows instructions literally—does exactly what you tell it"

- [GPT-4.1 Prompting Guide - God of Prompt](https://www.godofprompt.ai/blog/gpt-4-1-prompting-guide)

**Key Finding**: "Retrieves accurately at all positions up to 1M tokens, but performance can taper off—use progressive disclosure"

- [Inside GPT-4.1: Technical Analysis - Trickle](https://trickle.so/blog/inside-gpt-4-1-technical-analysis)

### GPT-5 Mini Research (2026)

**Key Finding**: "Fast inference via kernel fusion, tensor parallelism; prefers shorter internal thinking loops"

- [GPT-5 mini API - CometAPI](https://www.cometapi.com/gpt-5-mini-api/)

**Key Finding**: "Use CTCO Framework, explicitly define Reasoning Effort, use Scope Discipline to prevent verbosity drift"

- [GPT-5.2 Prompting Guide - Atlabs AI](https://www.atlabs.ai/blog/gpt-5.2-prompting-guide-the-2026-playbook-for-developers-agents)

**Key Finding**: "Reduced deep-reasoning capacity vs full GPT-5; higher sensitivity to ambiguous prompts"

- [GPT-5 mini Model Card - PromptHub](https://www.prompthub.us/models/gpt-5-mini)

**Key Finding**: "85-95% of GPT-5 on general benchmarks with substantially improved latency/price"

- [GPT-5 Mini vs Grok Code Fast 1 - Galaxy.ai](https://blog.galaxy.ai/compare/gpt-5-mini-vs-grok-code-fast-1)

---

## 🚀 Performance Comparison

### Speed Benchmarks (Small Feature ~90K tokens)

| Model                      | Time     | Cost  | Quality       | Best For             |
| -------------------------- | -------- | ----- | ------------- | -------------------- |
| **Grok Code Fast 1**       | 5-15s ⚡ | 0x    | 70.8% SWE     | Agentic (bug fixes)  |
| **GPT-5 Mini** (optimized) | 10-20s   | 0x    | 85-95%        | Non-agentic + free   |
| **Haiku 4.5** (optimized)  | 15-25s   | 0.33x | 90% of Sonnet | General agentic      |
| **GPT-4.1** (optimized)    | 30-60s   | 0x    | Baseline      | Large context + free |
| **Sonnet 4.5**             | 20-40s   | 1x    | Best          | Complex reasoning    |

**Winner for small features**:

- **Agentic tasks (bug fixes, scaffolds)**: Grok Code Fast 1 (4x faster, 1/10th cost)
- **Non-agentic (transformations)**: GPT-5 Mini (free) or Haiku 4.5 (better quality)

### Speed Benchmarks (Large Feature ~500K tokens)

| Model                                  | Time                | Cost | Quality   | Context Limit |
| -------------------------------------- | ------------------- | ---- | --------- | ------------- |
| **GPT-5 Mini**                         | ❌ Context overflow | —    | —         | 200K          |
| **Haiku 4.5**                          | ❌ Context overflow | —    | —         | 200K          |
| **GPT-4.1** (optimized)                | 45-90s              | 0x   | Good      | 1M            |
| **GPT-4.1** (+ progressive disclosure) | 60-120s             | 0x   | Excellent | 1M            |
| **Sonnet 4.5** (1M context)            | 30-60s              | 1x   | Best      | 1M (beta)     |

**Winner for large features**:

- Free option: GPT-4.1 (only free 1M context in Copilot)
- Best performance: Sonnet 4.5 (extended thinking + 1M context)

---

## 🎓 Optimization Principles

### Principle 1: Match Model Strengths

**GPT-5 Mini strengths**:

- Fast inference (kernel fusion)
- Structured prompts (CTCO, XML)
- Pattern matching (mechanical procedures)

**GPT-4.1 strengths**:

- 1M context (long documents)
- Position-independent retrieval (sandwich method)
- Literal following (explicit instructions)

**Strategy**: Design prompts that leverage strengths, avoid weaknesses.

### Principle 2: Explicit > Implicit

**Both models are non-reasoning**, so:

- ✅ Explicit: "FOR EACH item: IF condition: action"
- ❌ Implicit: "Process items appropriately"

**GPT-4.1 is MORE literal** than GPT-5 Mini:

- GPT-5 Mini: Can infer basic structure from CTCO
- GPT-4.1: Needs sandwich + exact templates + repeated constraints

### Principle 3: Structure Prevents Hallucinations

**Without structure**:

- GPT-5 Mini: May produce inconsistent format
- GPT-4.1: May miss instructions in 1M context

**With structure**:

- GPT-5 Mini: CTCO + XML → consistent output
- GPT-4.1: Sandwich + headers → reliable retrieval

### Principle 4: Validate, Don't Trust

**Both models can hallucinate**, so:

- ✅ Add validation checklists
- ✅ Specify exact error conditions
- ✅ Test output against baseline
- ✅ Self-correction before final output

---

## 🔄 Complete Workflow Example

### Ultra-Budget Workflow (0x cost)

```bash
# Step 1: Gap Analysis (GPT-5 Mini - small feature)
copilot -m "gpt-5-mini" slash analyze-report-gaps-gpt-5-mini @accordion.ts
# Time: 12 seconds
# Cost: 0x
# Quality: 90% of GPT-4.1
# Output: gap-analysis-report.md

# Step 2: Gap Validation (Sonnet 4.5 - requires reasoning)
copilot -m "sonnet-4.5" slash analyze-gaps
# Time: 10 minutes
# Cost: 1x
# Output: GAPS_REMEDIATION.md + REMEDIATION_CHECKLIST.md

# Step 3: Task Generation (GPT-5 Mini)
copilot -m "gpt-5-mini" slash tasks-gpt-5-mini
# Time: 7 seconds
# Cost: 0x
# Output: tasks.md

# Step 4: Implementation (Sonnet 4.5 - requires reasoning)
copilot -m "sonnet-4.5" slash implement-reported-gaps
# Time: 32 minutes (P0 gaps)
# Cost: 1x
# Output: Fixed code + commits

# Step 5: Re-validate (GPT-5 Mini)
copilot -m "gpt-5-mini" slash analyze-report-gaps-gpt-5-mini @accordion.ts
# Time: 10 seconds
# Cost: 0x
# Output: "✅ No new gaps detected!"
```

**Total cost**: ~2x premium credits (only Steps 2 and 4)
**Total time**: ~42 minutes + 29 seconds
**Speedup from optimizations**: ~50-70 seconds saved (Steps 1, 3, 5)

### Alternative: Claude-Optimized Workflow (Best Performance)

```bash
# Step 1: Gap Analysis (Haiku 4.5 - fast & agentic)
claude analyze-gaps --model haiku-4.5
# Time: 15 seconds
# Cost: 0.33x
# Quality: 90% of Sonnet 4.5
# Output: gap-analysis-report.md

# Step 2: Gap Validation (Sonnet 4.5 - extended thinking)
claude validate-gaps --model sonnet-4.5 --extended-thinking 16K
# Time: 3 minutes
# Cost: 1x
# Output: GAPS_VALIDATION.md + REMEDIATION_CHECKLIST.md

# Step 3: Task Generation (Haiku 4.5 - fast)
claude generate-tasks --model haiku-4.5
# Time: 10 seconds
# Cost: 0.33x
# Output: tasks.md

# Step 4: Implementation (Sonnet 4.5 - TDD + extended thinking)
claude implement-gaps --model sonnet-4.5 --extended-thinking 16K
# Time: 15 minutes (P0 gaps with TDD)
# Cost: 1x
# Output: Fixed code + tests + commits

# Step 5: Re-validate (Haiku 4.5 - quick check)
claude analyze-gaps --model haiku-4.5
# Time: 12 seconds
# Cost: 0.33x
# Output: "✅ No new gaps detected!"
```

**Total cost**: ~2.66x (Haiku for mechanical tasks, Sonnet for reasoning)
**Total time**: ~18 minutes + 37 seconds
**Advantages**:

- 57% faster than Ultra-Budget workflow
- Extended thinking for better implementation quality
- Agentic workflow patterns built-in
- Better TDD support

---

## 📊 Optimization Impact

### Before Optimization (Standard Prompts)

**GPT-5 Mini** (without optimizations):

```
Prompt: "Generate tasks from the plan"
Result: Inconsistent task IDs, missing paths, ambiguous descriptions
Quality: 60-70% usable
Speed: Fast but requires manual fixes
```

**GPT-4.1** (without optimizations):

```
Prompt: "Analyze gaps" (instructions at beginning only)
Result: May summarize instead of full report, miss instructions at end of 1M context
Quality: 70-80% usable
Speed: Slow (30-60s)
```

### After Optimization (This Guide)

**GPT-5 Mini** (with 7 optimizations):

```
Prompt: CTCO + XML + mechanical + validation + verbosity limits
Result: Consistent T### IDs, exact paths, clear dependencies
Quality: 85-95% usable (comparable to Haiku 4.5)
Speed: Fast (10-20s) AND high quality
```

**GPT-4.1** (with 5 optimizations):

```
Prompt: Sandwich + literal + progressive + structured + validation
Result: Complete structured report with all evidence
Quality: Baseline (100% - what we aim for)
Speed: Slower (30-60s) but reliable
```

**Quality improvement**: +25-35 percentage points for GPT-5 Mini
**Reliability improvement**: +20-30 percentage points for GPT-4.1

---

## 🎯 Summary

### GPT-5 Mini Optimizations

**Focus**: Fast inference with structured prompts

**Best practices**:

1. CTCO framework (eliminate ambiguity)
2. reasoning_effort: minimal (leverage speed)
3. Mechanical procedures (no creative decisions)
4. XML scaffolding (explicit state)
5. Verbosity limits (prevent drift)

**Result**: 2-3x faster than GPT-4.1 with 85-95% quality at 0x cost

---

### GPT-4.1 Optimizations

**Focus**: 1M long-context handling with literal following

**Best practices**:

1. Sandwich method (instructions at both ends)
2. Literal instructions (no implicit rules)
3. Progressive disclosure (chunk >500K features)
4. Structured formatting (markdown headers)
5. Explicit validation (checklists, errors)

**Result**: Reliable 1M context analysis with consistent output at 0x cost

---

### When to Use Each

| Scenario                      | Model                    | Rationale                      |
| ----------------------------- | ------------------------ | ------------------------------ |
| **Small feature (<80K)**      | GPT-5 Mini ⭐            | Fastest (10-20s), same quality |
| **Medium feature (80-150K)**  | GPT-5 Mini ⭐            | Fast (10-20s), good quality    |
| **Large feature (150-180K)**  | GPT-5 Mini ⚠️            | Near limit, may be slower      |
| **Large feature (180K-500K)** | GPT-4.1 ✅               | 1M context needed              |
| **Very large (500K-1M)**      | GPT-4.1 + progressive ✅ | Chunking improves performance  |
| **Huge (>1M)**                | Split into components    | Neither model can handle       |

---

## 🔗 Related Documentation

- [SPECKIT_GUIDE.md](../SPECKIT_GUIDE.md) - Complete SpecKit workflow with model recommendations
- [.github/agents/](../.github/agents/) - Agent implementations using these optimizations
- [.claude/skills/](../.claude/skills/) - Claude Code skill implementations

---

## 📋 Source Attribution Standards

All optimization guides MUST follow these standards for claims:

### ✅ Acceptable Sources (Priority Order)

1. **Official vendor documentation** (Anthropic, OpenAI, xAI, Google)
   - Model cards, API docs, official announcements
   - Citation format: `[Feature Name - Official Docs](https://official-url)`

2. **Published benchmarks** (Hugging Face, Papers with Code)
   - Public leaderboards with reproducible methodology
   - Citation format: `[Benchmark Name Leaderboard](https://benchmark-url)`

3. **Peer-reviewed research** (arXiv, ACL, NeurIPS)
   - Academic papers with reproducible experiments
   - Citation format: `[Paper Title - Authors, Year](https://arxiv-url)`

### ⚠️ Community Sources (Require Caveats)

4. **Technical blogs** (InfoWorld, TechCrunch, community analyses)
   - Must be labeled as "third-party analysis"
   - Citation format: `[Article Title](url) (third-party analysis)`

5. **Internal benchmarks** (vendor-specific harnesses)
   - Must note methodology differences
   - Citation format: `[Metric] (vendor internal benchmark, methodology may differ)`

### ❌ Unacceptable

- Marketing claims without evidence
- Subjective superlatives ("best", "fastest") without benchmarks
- Uncited statistics
- Claims from deleted/unavailable sources

### BETA Feature Handling

Features marked as BETA must include:

```markdown
⚠️ **BETA**: This feature is experimental and may change. Not recommended for production use.
```

### Verification Checklist

Before adding claims to optimization guides:

- ☑ Claim has official vendor source OR benchmark source
- ☑ Link to source is accessible and stable
- ☑ Marketing language is replaced with technical specifications
- ☑ BETA features are clearly marked
- ☑ Third-party sources are labeled as such

---

## 🧪 Beta Feature Availability in Claude Code

**⚠️ IMPORTANT**: These results are specific to **Claude Code CLI**. GitHub Copilot Chat (VS Code) and GitHub Copilot CLI may have different feature availability. See notes below.

Based on verification testing (2026-01-15):

### Claude Code CLI

| Feature                | Status         | Notes                                                                                  |
| ---------------------- | -------------- | -------------------------------------------------------------------------------------- |
| **Extended Thinking**  | ✅ Available   | Configurable budgets (1K-64K tokens), works with all Claude 4.5 models                 |
| **1M Context Window**  | ✅ Available   | Available for Sonnet 4.5 (previously beta for tier 4, now accessible)                  |
| **Structured Outputs** | ✅ Available   | Use `--json-schema` flag in CLI, works with all models (beta feature - use cautiously) |
| **Effort Parameter**   | ❌ Unavailable | Opus 4.5 only, requires API key setup (not available with subscription-only access)    |

### GitHub Copilot (VS Code & CLI)

| Feature                | Status        | Notes                                                            |
| ---------------------- | ------------- | ---------------------------------------------------------------- |
| **Extended Thinking**  | ❓ Unverified | Not tested - may require different syntax or model selection     |
| **1M Context Window**  | ❓ Unverified | Not tested - GitHub Copilot may have different context limits    |
| **Structured Outputs** | ❓ Unverified | Not tested - CLI syntax may differ from Claude Code              |
| **Effort Parameter**   | ❓ Unverified | Not tested - likely unavailable or requires different API access |

**Note**: GitHub Copilot feature availability not verified due to premium request limits at time of testing. The `/implement-*` commands in this repository may reference these features but compatibility with GitHub Copilot is not guaranteed.

### Testing Methodology

- **Extended Thinking**: Verified via direct usage in Claude Code conversation
- **1M Context**: Confirmed available for Sonnet 4.5 model
- **Structured Outputs**: Tested via CLI with `--json-schema` flag, successfully validated JSON output
- **Effort Parameter**: Attempted via `--betas effort-2025-11-24` flag - requires API key (unavailable for subscription-only users)

### CLI Testing Commands (Claude Code)

**⚠️ Note**: These commands are for **Claude Code CLI** only. GitHub Copilot CLI (`copilot`) may use different syntax.

```bash
# Test Structured Outputs (✅ Works in Claude Code)
claude --print --model haiku --output-format json \
  --json-schema '{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}' \
  "Your prompt here"

# Test Effort Parameter (❌ Requires API key in Claude Code)
claude --print --model opus --betas effort-2025-11-24 "Your prompt"
# Error: "Custom betas are only available for API key users"
```

**GitHub Copilot users**: Check `copilot --help` for equivalent commands. Feature availability and syntax may differ.

### Detailed Verification Results

See [`scripts/VERIFICATION_RESULTS.md`](../scripts/VERIFICATION_RESULTS.md) for:

- Complete test procedures and results
- Code examples for manual API testing
- GitHub Copilot compatibility considerations
- Recommendations for different access tiers

---

## 📖 Research Sources

All optimization strategies are backed by 2026 research from:

### OpenAI (GPT Models)

- OpenAI official documentation and cookbooks
- PromptHub comprehensive guides
- Atlabs AI prompting playbooks
- Technical analyses from Trickle, Galaxy.ai
- Community best practices from God of Prompt, Vellum, Steve Kinney

### Anthropic (Claude Models)

- Anthropic official documentation (Claude Docs, Extended Thinking, Context Windows)
- Anthropic Research & Engineering (Building Effective Agents, Claude Code Best Practices)
- Third-party analysis (Pantaleone, DreamHost, Sider.ai, ClaudeLog)
- Performance benchmarks (Braintrust, The Neuron, PromptHub)
- AWS documentation (Amazon Bedrock integration)

See individual guides for complete source citations with URLs.

---

**Last Updated**: 2026-01-10
**Maintained by**: SpecKit contributors
