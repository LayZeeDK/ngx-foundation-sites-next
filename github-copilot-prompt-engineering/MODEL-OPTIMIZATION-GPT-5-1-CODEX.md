# GPT-5.1-Codex Prompt Optimization Guide

**Last Updated:** 2026-01-20

This document provides optimization strategies for GPT-5.1-Codex and GPT-5.1-Codex-Mini, OpenAI's adaptive reasoning models optimized for agentic coding workflows.

---

## Model Family Overview

### Model Variants

| Model | Context | Reasoning | Cost (API) | Best For |
|-------|---------|-----------|------------|----------|
| **GPT-5.1-Codex-Mini** | 400K | Adaptive | $0.25/M in, $2/M out | Cost-effective coding tasks |
| **GPT-5.1-Codex** | 400K | Adaptive (medium/high) | Moderate | Standard implementation |
| **GPT-5.1-Codex-Max** | 400K+ compaction | Adaptive (to xHigh) | Higher | Very large features (>400K) |

### Key Characteristics

1. **Adaptive Reasoning** - Dynamically adjusts computational approach based on task complexity
   - Simple queries: Fast, direct responses
   - Complex challenges: Deeper analysis with stepwise reasoning

2. **400K Context Window** - 2× larger than GPT-5 Mini (200K) and Haiku 4.5 (200K)

3. **Multimodal Intelligence** - Understands text and images, can use external tools/APIs

4. **Agentic Optimization** - Optimized for long-running, agentic coding tasks

5. **Bias Toward Action** - Persists until tasks are fully handled end-to-end

**Sources**:
- [GPT-5.1 Codex Model | OpenAI API](https://platform.openai.com/docs/models/gpt-5.1-codex)
- [GPT-5-Codex Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide)

---

## Quick Reference

| Optimization | Description | Priority |
|-------------|-------------|----------|
| [Remove Guidance](#optimization-1-remove-guidance-rather-than-add-it) | Trust adaptive reasoning | Critical |
| [Adaptive Reasoning](#optimization-2-adaptive-reasoning-no-steering-needed) | No manual steering needed | Critical |
| [Bias Toward Action](#optimization-3-bias-toward-action--persistence) | Persist to completion | Critical |
| [Engineering Quality](#optimization-4-engineering-quality-standards) | Correctness, clarity, reliability | High |
| [Tool Optimization](#optimization-5-tool-usage-optimization) | Use fast tools (rg over grep) | Medium |
| [Progressive Disclosure](#optimization-6-progressive-disclosure-for-large-features) | Chunk features >400K tokens | Medium |
| [Reasoning Effort](#optimization-7-reasoning-effort-configuration) | Medium default, high for complex | Medium |

---

## Optimization 1: Remove Guidance Rather Than Add It

### The Technique

**Remove unnecessary guidance** - GPT-5.1-Codex is trained for optimal agentic coding.

**Research Finding**:

> "Because GPT-5-Codex was trained for optimal agentic coding, prompt tuning will more often mean removing guidance than adding it."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

### Why It Works

- GPT-5.1-Codex is trained on real-world software engineering workflows
- It already knows TDD patterns, test-first development, incremental progress
- Over-specification constrains its adaptive reasoning
- Minimal guidance lets it apply optimal approach per task

### Implementation Pattern

#### ❌ Over-Specified (Don't Do This)

```markdown
You are an implementation agent. Follow these steps:

1. First, read the tasks.md file carefully
2. Then, for each task, think about what it means
3. After thinking, decide if you need to write tests
4. If yes, write the tests first
5. Then implement the code
6. Then run the tests
7. If tests fail, fix them
8. Mark the task complete
9. Move to next task
10. Repeat until all tasks done
```

#### ✅ Minimal Guidance (Do This)

```markdown
Execute all tasks from tasks.md in order. Use TDD where specified. Mark tasks complete as you finish them.
```

---

## Optimization 2: Adaptive Reasoning (No Steering Needed)

### The Technique

**Let the model adapt reasoning depth automatically** - no manual steering required.

**Research Finding**:

> "Adaptive reasoning is now the default in GPT-5-Codex. GPT-5-Codex adjusts automatically: for a question like 'How do I undo the last commit but keep all changes staged?', it responds quickly without extra steering. For more complex coding tasks, it takes the time it needs and uses tools as appropriate."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

### Why It Works

GPT-5.1-Codex automatically determines the appropriate reasoning depth:
- Simple task: "rename X to Y" → Fast implementation
- Complex task: "refactor state management" → Deeper analysis

### Implementation Pattern

#### ❌ Manual Reasoning Steering (Don't Do This)

```markdown
For simple tasks (T1.1, T1.2): Implement quickly without deep analysis
For complex tasks (T2.1, T2.2): Think deeply, consider edge cases, reason about architecture
```

#### ✅ Let Model Adapt (Do This)

```markdown
Execute tasks from tasks.md. The model will automatically adjust reasoning depth based on task complexity.
```

### Reasoning Effort Levels

| Setting | Use Case | Latency | Quality |
|---------|----------|---------|---------|
| **None** | Simple queries (not for implementation) | Fastest | Autocomplete |
| **Medium** | Daily driver (scaffolding, endpoints) | Fast | Balanced |
| **High** | Complex refactors, deep debugging | Slower | Higher |
| **xHigh** | Legacy pipelines, race conditions | Slowest | Highest (Max only) |

**Recommendation**: Use **Medium** for standard implementation (balances speed & quality)

---

## Optimization 3: Bias Toward Action & Persistence

### The Technique

**Persist until tasks are fully handled end-to-end** - bias toward implementation over analysis.

**Research Finding**:

> "Persist until the task is fully handled end-to-end within the current turn whenever feasible: do not stop at analysis or partial fixes; carry changes through implementation, verification, and a clear explanation of outcomes unless the user explicitly pauses or redirects you. Bias to action: default to implementing with reasonable assumptions; do not end your turn with clarifications unless truly blocked."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

### Implementation Pattern

```markdown
## Persistence Requirements

**Carry tasks to completion**:
- ✅ Implement the full task (not just analysis)
- ✅ Write tests AND implementation
- ✅ Run tests to verify
- ✅ Fix failures until passing
- ✅ Mark task complete in tasks.md
- ✅ Report clear outcome

**Do NOT stop at**:
- ❌ "I would implement X by doing Y" (implement it!)
- ❌ "The tests might fail because..." (run them and find out!)
- ❌ "You should consider..." (make the decision and proceed!)

**Only stop for clarification if**:
- Truly blocked (missing required information)
- Ambiguous requirement with multiple valid interpretations
- User explicitly asks to pause

## Reasonable Assumptions

**Make reasonable assumptions and proceed**:
- File locations (follow project conventions)
- Test naming (follow existing patterns)
- Import paths (analyze existing imports)
- Styling (match existing code style)

**Document assumptions made** in commit messages or comments.
```

---

## Optimization 4: Engineering Quality Standards

### The Technique

**Act as a discerning engineer** - optimize for correctness, clarity, and reliability over speed.

**Research Finding**:

> "Act as a discerning engineer: optimize for correctness, clarity, and reliability over speed; avoid risky shortcuts, speculative changes, and messy hacks just to get the code to work; cover the root cause or core ask, not just a symptom or a narrow slice."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

### Implementation Pattern

```markdown
## Engineering Principles

**Optimize for**:
- ✅ **Correctness** - Code works as specified
- ✅ **Clarity** - Easy to understand and maintain
- ✅ **Reliability** - Handles edge cases and errors
- ✅ **Root cause fixes** - Address underlying issues

**Avoid**:
- ❌ **Risky shortcuts** - Quick fixes that create tech debt
- ❌ **Speculative changes** - "Maybe this will work" approaches
- ❌ **Messy hacks** - Code that "just works" but is unmaintainable
- ❌ **Symptom fixes** - Addressing visible issue without fixing root cause

## Quality Checklist (Per Task)

Before marking task complete:
- [ ] Code is correct (meets spec requirements)
- [ ] Code is clear (follows project conventions, has documentation)
- [ ] Code is reliable (handles errors, edge cases from spec)
- [ ] Root cause addressed (not just surface-level fix)
- [ ] Tests pass and cover critical paths
- [ ] No messy hacks or speculative changes
```

---

## Optimization 5: Tool Usage Optimization

### The Technique

**Use fast tools** - prefer ripgrep over grep, specialized tools over shell commands.

**Research Finding**:

> "When searching for text or files, prefer using `rg` or `rg --files` respectively because `rg` is much faster than alternatives like `grep`. If a tool exists for an action, prefer to use the tool instead of shell commands."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

### Tool Preference Hierarchy

**For File Search**:
1. ✅ `rg --files` (fastest)
2. ⚠️ `find` (slower, but more flexible)
3. ❌ `ls -R` (slowest, avoid)

**For Content Search**:
1. ✅ `rg <pattern>` (fastest, supports regex)
2. ⚠️ `grep -r <pattern>` (slower)
3. ❌ Manual file-by-file search (slowest)

**For File Operations**:
- ✅ Use specialized tools when available (Grep tool, Glob tool, Read tool)
- ⚠️ Use shell commands only when tool doesn't exist
- ❌ Don't reinvent tools with bash scripts

---

## Optimization 6: Progressive Disclosure for Large Features

### The Technique

**Split large features into phases** when they exceed 400K tokens.

### When to Use

| Feature Size | Strategy |
|-------------|----------|
| **<400K tokens** | Standard workflow (no chunking needed) |
| **>400K tokens** | Progressive disclosure (chunk into phases) |

### Implementation Pattern

```markdown
## Phase-Based Implementation

**Phase 1: Core Component** (load only core files)
- component.ts
- component.types.ts
- Basic tests

**Phase 2: Directives** (load directive files)
- item.directive.ts
- content.directive.ts
- Directive tests

**Phase 3: Integration** (load integration files)
- Styles
- Stories
- E2E tests

## State Preservation Strategy

**Use external state files** for cross-phase tracking:

1. **tasks.md** - Mark phases complete: `[X] Phase 1: Core`
2. **Git commits** - One commit per phase with task IDs
3. **NOTES.md** - Document decisions between phases

## Best Practices

1. **Commit after each phase** (enables context reset)
2. **Mark phase tasks complete** in tasks.md
3. **Include phase number in commits** (Phase 1/3, Phase 2/3, etc.)
4. **Load ONLY necessary files per phase** (not full codebase)
```

---

## Optimization 7: Reasoning Effort Configuration

### The Technique

**Use medium reasoning effort by default**, high for complex tasks.

**Research Finding**:

> "We recommend 'medium' reasoning effort as a good all-around interactive coding model that balances intelligence and speed, while you can use high or xhigh reasoning effort for your hardest tasks."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

### Reasoning Effort Decision Matrix

| Task Type | Reasoning Effort | Rationale |
|-----------|------------------|-----------|
| **Scaffold feature flag** | Medium | Straightforward boilerplate |
| **Wire API endpoint** | Medium | Standard pattern application |
| **Clean up helper module** | Medium | Refactoring with clear scope |
| **Complex refactor** | High | Architecture decisions needed |
| **Deep debugging** | High | Root cause analysis required |
| **Legacy data pipeline** | High | Complex untangling, many edge cases |
| **Race condition analysis** | High | Subtle timing issues, deep analysis |

---

## Performance Characteristics

### Context Window Strategy

| Feature Size | Approach | Expected Performance |
|-------------|----------|---------------------|
| **<200K tokens** | Standard workflow | Fast, high quality |
| **200K-400K tokens** | Standard workflow | Good, within limits |
| **>400K tokens** | Progressive disclosure | Requires chunking |

### Cost Efficiency

**GitHub Copilot Multipliers** (relative to Sonnet 4.5 baseline):

| Model | Multiplier | Context |
|-------|------------|---------|
| GPT-5 Mini | 0x | 200K |
| GPT-5.1-Codex-Mini | ~0.1x | 400K |
| Haiku 4.5 | 0.33x | 200K |
| GPT-5.1-Codex | Moderate | 400K |
| Sonnet 4.5 | 1x | 200K |

### Quality Benchmarks

**Real-World Performance** (from research):

- Advanced anomaly detection task: 11 minutes, working code, edge case handling
- Cost: 43% less than Claude 4.5 Sonnet
- Context: 400K enables larger codebases without chunking

**Source**: [Composio Blog - Best Models for Agentic Coding](https://composio.dev/blog/kimi-k2-thinking-vs-claude-4-5-sonnet-vs-gpt-5-codex-tested-the-best-models-for-agentic-coding)

---

## Common Pitfalls to Avoid

### ❌ Pitfall 1: Over-Specifying Guidance

```markdown
❌ BAD: [500-word prompt with step-by-step instructions]
"First read tasks.md. Then for each task, think about..."

✅ GOOD: "Execute tasks from tasks.md using TDD."
```

**Solution**: Trust adaptive reasoning, remove guidance

### ❌ Pitfall 2: Manual Reasoning Steering

```markdown
❌ BAD: "For simple tasks use minimal reasoning. For complex tasks think deeply."

✅ GOOD: [No reasoning steering - model adapts automatically]
```

**Solution**: Let model adjust reasoning depth automatically

### ❌ Pitfall 3: Stopping at Analysis

```markdown
❌ BAD Model Output:
"I would implement this feature by creating a component with..."
[Stops without implementing]

✅ GOOD Model Output:
"Implementing feature..." [Creates component, tests, verifies, marks complete]
```

**Solution**: Use "bias toward action" instruction in prompt

### ❌ Pitfall 4: Using Slow Tools

```markdown
❌ BAD: grep -r "pattern" .
⚠️ OK: find . -name "*.ts"
✅ GOOD: rg "pattern"
✅ BEST: rg --files | grep "\.ts$"
```

**Solution**: Specify tool preferences in prompt

---

## Model Selection Guide

### When to Use Each Model

| Scenario | GPT-5.1-Codex | Alternative |
|----------|---------------|-------------|
| **Small feature (<200K)** | ✅ Good | GPT-5 Mini (faster, free) |
| **Medium feature (200K-400K)** | ✅ **Best Choice** | Sonnet 4.5 (similar quality) |
| **Large feature (>400K)** | ⚠️ Progressive disclosure | GPT-5.1-Codex-Max |
| **Simple boilerplate** | ⚠️ Overkill | GPT-5 Mini, Haiku 4.5 |
| **Complex reasoning** | ✅ High effort | Sonnet 4.5 (extended thinking) |

---

## Use Cases

### ✅ Excellent For

1. **Standard implementation**
   - Input: tasks.md with feature tasks
   - Process: Adaptive TDD, engineering quality
   - Output: Complete implementation with tests

2. **Medium-sized features** (200K-400K tokens)
   - Leverage 400K context window
   - No chunking required

3. **Task classification** (GPT-5.1-Codex-Mini)
   - Adaptive reasoning for ambiguous tasks
   - Code-focused understanding
   - Cost-effective alternative to Sonnet 4.5

### ❌ Not Suitable For

1. **Very large features** (>400K tokens)
   - Use GPT-5.1-Codex-Max with compaction

2. **Simple mechanical tasks**
   - Use GPT-5 Mini (free, faster)

3. **Deep architectural reasoning**
   - Use Sonnet 4.5 or Opus 4.5

---

## Quick Reference Card

### GPT-5.1-Codex Optimization Checklist

```
✅ Remove guidance (trust adaptive reasoning)
✅ No reasoning steering (model adapts automatically)
✅ Bias toward action (persist to completion)
✅ Engineering quality standards (correctness, clarity, reliability)
✅ Tool optimization (rg over grep, specialized tools over bash)
✅ Progressive disclosure for >400K tokens
✅ External state files (tasks.md progress tracking)
✅ Medium reasoning effort (default, balanced)
✅ High reasoning for complex tasks (debugging, refactors)
```

**Result**: Multi-hour autonomous operation with engineering quality standards.

---

## Research Sources

**OpenAI Official**:
- [GPT-5.1 Codex Model | OpenAI API](https://platform.openai.com/docs/models/gpt-5.1-codex) - Model capabilities
- [GPT-5-Codex Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide) - General optimization
- [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide) - Best practices
- [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/) - Performance analysis

**GitHub Integration**:
- [OpenAI's GPT-5.1 models in GitHub Copilot - GitHub Changelog](https://github.blog/changelog/2025-11-13-openais-gpt-5-1-gpt-5-1-codex-and-gpt-5-1-codex-mini-are-now-in-public-preview-for-github-copilot/)
- [Supported AI models in GitHub Copilot - GitHub Docs](https://docs.github.com/en/copilot/reference/ai-models/supported-models)

**Performance Analysis**:
- [GPT-5.1 Codex vs. Claude 4.5 Sonnet - Composio](https://composio.dev/blog/kimi-k2-thinking-vs-claude-4-5-sonnet-vs-gpt-5-codex-tested-the-best-models-for-agentic-coding)
- [GPT-5.1-Codex-Mini Specs & Benchmarks - Galaxy.ai](https://blog.galaxy.ai/model/gpt-5-1-codex-mini)

---

## Related Documents

- [MODEL-OPTIMIZATION-GPT-5-1-CODEX-MAX.md](./MODEL-OPTIMIZATION-GPT-5-1-CODEX-MAX.md) - For very large features (>400K tokens)
- [MODEL-OPTIMIZATION-GPT-5-MINI.md](./MODEL-OPTIMIZATION-GPT-5-MINI.md) - For fast mechanical tasks
- [MODEL-OPTIMIZATION-GPT-4-1.md](./MODEL-OPTIMIZATION-GPT-4-1.md) - For 1M context features
- [MODEL-FRONTMATTER.md](./MODEL-FRONTMATTER.md) - How to specify models in agent/prompt files
