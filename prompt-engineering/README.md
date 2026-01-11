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

### [GPT-4.1 Optimization Guide](./GPT-4-1-OPTIMIZATION.md)

**Model**: GPT-4.1 (1M context, non-reasoning, 0x cost)

**5 Key Optimizations**:

1. **Sandwich Method** - Instructions at beginning AND end (critical for 1M context)
2. **Literal Instruction Following** - Extremely explicit commands (no inference)
3. **Progressive Disclosure** - Load in chunks for >500K features
4. **Structured Formatting** - Markdown headers for long-context navigation
5. **Explicit Validation** - Checklists and error conditions

**Best for**: Large features (>180K tokens) requiring long-context analysis

**Commands**: `/analyze-brief-gpt-4-1`

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

**Commands**: `/analyze-brief-gpt-5-mini`, `/tasks-gpt-5-mini`

---

## 🎯 When to Use Which Model

### Decision Matrix

```
Feature Size Estimation:
total_tokens = (spec lines × 20) + (plan × 20) + (tasks × 15) + (code × 18)

IF total_tokens < 180K:
  ✅ USE GPT-5 Mini OR Haiku 4.5
  - GPT-5 Mini: 10-20 sec, 0x cost, 85-95% quality
  - Haiku 4.5: 15-25 sec, 0.33x cost, 90% of Sonnet performance

ELSE IF total_tokens < 200K:
  ✅ USE GPT-4.1 OR Haiku 4.5
  - GPT-4.1: 30-60 sec, 0x cost, 1M context
  - Haiku 4.5: 20-35 sec, 0.33x cost, 200K context limit

ELSE IF total_tokens < 1M:
  ✅ USE GPT-4.1 OR Sonnet 4.5
  - GPT-4.1: 30-90 sec, 0x cost
  - Sonnet 4.5: 30-60 sec, 1x cost, better reasoning

ELSE:
  ⚠️ SPLIT feature into smaller components
```

### Task Type Suitability

| Task Type                | GPT-5 Mini         | GPT-4.1            | Haiku 4.5          | Sonnet 4.5           |
| ------------------------ | ------------------ | ------------------ | ------------------ | -------------------- |
| **Gap analysis (small)** | ✅ Best (0x)       | ⚠️ Slower          | ✅ Best (0.33x)    | ⚠️ Overkill          |
| **Gap analysis (large)** | ❌ Context limit   | ✅ Good (0x)       | ✅ Good (0.33x)    | ✅ Best (1x)         |
| **Task generation**      | ✅ Best (0x)       | ✅ Good (0x)       | ✅ Best (0.33x)    | ⚠️ Overkill          |
| **Gap validation**       | ❌ Needs reasoning | ❌ Needs reasoning | ⚠️ Light reasoning | ✅ Best (1x)         |
| **Implementation**       | ❌ No reasoning    | ❌ No reasoning    | ⚠️ Simple code     | ✅ Best (1x)         |
| **Complex reasoning**    | ❌ Not capable     | ❌ Not capable     | ⚠️ Basic           | ✅ Extended thinking |
| **Agentic workflows**    | ❌ Not capable     | ❌ Not capable     | ✅ 90% of Sonnet   | ✅ Best (1x)         |

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

| Model                      | Time      | Cost  | Quality       | Best For          |
| -------------------------- | --------- | ----- | ------------- | ----------------- |
| **GPT-5 Mini** (optimized) | 10-20s ⚡ | 0x    | 85-95%        | Fastest + free    |
| **Haiku 4.5** (optimized)  | 15-25s    | 0.33x | 90% of Sonnet | Agentic tasks     |
| **GPT-4.1** (optimized)    | 30-60s    | 0x    | Baseline      | Free option       |
| **Sonnet 4.5**             | 20-40s    | 1x    | Best          | Complex reasoning |

**Winner for small features**: GPT-5 Mini (fastest + free) or Haiku 4.5 (best agentic performance/cost)

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
gh copilot -m "gpt-5-mini" slash analyze-brief-gpt-5-mini @accordion.ts
# Time: 12 seconds
# Cost: 0x
# Quality: 90% of GPT-4.1
# Output: gap-analysis-report.md

# Step 2: Gap Validation (Sonnet 4.5 - requires reasoning)
gh copilot -m "sonnet-4.5" slash analyze-gaps
# Time: 10 minutes
# Cost: 1x
# Output: GAPS_REMEDIATION.md + REMEDIATION_CHECKLIST.md

# Step 3: Task Generation (GPT-5 Mini)
gh copilot -m "gpt-5-mini" slash tasks-gpt-5-mini
# Time: 7 seconds
# Cost: 0x
# Output: tasks.md

# Step 4: Implementation (Sonnet 4.5 - requires reasoning)
gh copilot -m "sonnet-4.5" slash implement-gap-remediations
# Time: 32 minutes (P0 gaps)
# Cost: 1x
# Output: Fixed code + commits

# Step 5: Re-validate (GPT-5 Mini)
gh copilot -m "gpt-5-mini" slash analyze-brief-gpt-5-mini @accordion.ts
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
