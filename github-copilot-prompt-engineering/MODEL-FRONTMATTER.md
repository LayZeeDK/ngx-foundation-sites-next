# GitHub Copilot Model Frontmatter Support

**Last Updated:** 2026-01-20

This document explains how to specify AI models in GitHub Copilot prompt and agent files using YAML frontmatter.

---

## Summary

The `model` frontmatter property **IS supported** by GitHub Copilot in both prompt files (`*.prompt.md`) and agent files (`*.agent.md`).

---

## Supported Frontmatter Fields

### Agent Files (*.agent.md)

```yaml
---
description: Brief description of what this agent does
model: gpt-5-mini    # Optional - specifies which model runs this agent
---
```

### Prompt Files (*.prompt.md)

```yaml
---
description: Brief description of this prompt workflow
agent: agent-name    # References agent file (without extension)
model: gpt-5-mini    # Optional - specifies which model runs this prompt
---
```

---

## Available Models

The `copilot` CLI supports these models (as of v0.0.377):

| Model ID               | Description                                  |
| ---------------------- | -------------------------------------------- |
| `claude-sonnet-4.5`    | Claude Sonnet 4.5 (default reasoning)        |
| `claude-haiku-4.5`     | Claude Haiku 4.5 (fast, cost-effective)      |
| `claude-opus-4.5`      | Claude Opus 4.5 (highest capability)         |
| `claude-sonnet-4`      | Claude Sonnet 4 (previous generation)        |
| `gpt-5.1-codex-max`    | GPT-5.1 Codex Max (reasoning + compaction)   |
| `gpt-5.1-codex`        | GPT-5.1 Codex (400K context)                 |
| `gpt-5.2`              | GPT-5.2                                      |
| `gpt-5.1`              | GPT-5.1                                      |
| `gpt-5`                | GPT-5                                        |
| `gpt-5.1-codex-mini`   | GPT-5.1 Codex Mini (adaptive reasoning)      |
| `gpt-5-mini`           | GPT-5 Mini (zero cost, minimal reasoning)    |
| `gpt-4.1`              | GPT-4.1 (1M context, non-reasoning, 0× cost) |
| `gemini-3-pro-preview` | Gemini 3 Pro Preview                         |

### Models NOT Supported by `copilot` CLI

The following models are available in **VS Code GitHub Copilot Chat** but **NOT** in the standalone `copilot` CLI:

| Model              | VS Code Copilot Chat | `copilot` CLI | Notes                                 |
| ------------------ | -------------------- | ------------- | ------------------------------------- |
| `grok-code-fast-1` | Yes (0× cost)        | Not found     | xAI model - VS Code model picker only |

**Important**: If you specify `model: grok-code-fast-1` in frontmatter:

- VS Code may show "unknown model" (check your model picker for the exact name)
- `copilot` CLI will ignore it and use the default model

For Grok Code Fast 1 workflows:

1. Use VS Code GitHub Copilot Chat with the model picker
2. Or use the `copilot` CLI with a fallback model and switch models manually

---

## How Model Selection Works

### Priority Order

1. **`--model` flag** (highest priority): `copilot --model gpt-5-mini ...`
2. **`model` frontmatter** in agent/prompt file
3. **Config setting**: `copilot help config` shows the `model` config option
4. **Default**: If none specified, uses configured or default model

### Verification Test

```bash
# Test file: .github/agents/_test-model-frontmatter.agent.md
---
description: Test agent for model frontmatter verification
model: gpt-5-mini
---

# Test command
copilot -p "Respond with the model name" --agent _test-model-frontmatter --allow-all-tools

# Result showed: "Usage by model: gpt-5-mini"
```

---

## File Naming Convention

For agents/prompts that are **run BY** a specific model, use a model infix in the filename:

```
<command-name>.<model-id>.<type>.md

Examples:
- checklist.haiku-4-5.agent.md        (run by Claude Haiku 4.5)
- tasks.gpt-5-mini.prompt.md          (run by GPT-5 Mini)
- implement-tasks.gpt-4-1.agent.md    (run by GPT-4.1)
```

For agents/prompts that **CREATE tasks FOR** specific models (but are run by another model), no model infix:

```
tasks-for-haiku-4-5.agent.md         (run by Sonnet, creates tasks FOR Haiku)
tasks-for-gpt-5-mini.prompt.md       (run by Sonnet, creates tasks FOR GPT-5 Mini)
```

---

## Important Notes

1. **CLI invocation**: Use `copilot`, NOT `gh copilot` (GitHub CLI extension)
2. **Model ID format**: Use hyphenated lowercase (e.g., `gpt-5-mini`, not `GPT-5 Mini`)
3. **Frontmatter is optional**: If not specified, uses default model
4. **`--model` flag overrides**: Command-line flag takes precedence over frontmatter

---

## Related Configuration

The model can also be set globally via config:

```bash
copilot help config
# Shows: model - AI model to use for Copilot CLI
```

Can be changed during session with `/model` command.

---

## Examples

### Agent with Specific Model

```yaml
# .github/agents/fast-analysis.agent.md
---
name: fast-analysis
description: Quick code analysis using a fast model
model: gpt-5-mini
tools: ["read", "search"]
---

# Fast Analysis Agent

You perform quick code analysis tasks with minimal latency.
```

### Prompt with Specific Model

```yaml
# .github/prompts/detailed-review.prompt.md
---
name: detailed-review
description: Thorough code review using advanced reasoning
model: claude-opus-4.5
agent: ask
tools: ["read", "search"]
---

# Detailed Code Review

Perform a comprehensive code review with deep analysis.
```

### Prompt with Agent Reference

```yaml
# .github/prompts/secure-review.prompt.md
---
name: secure-review
description: Security-focused review using security agent
agent: "@security-agent"
model: gpt-5.1-codex
---

# Security Review

Run security analysis using the @security-agent persona.
```

---

## Model Selection Guidelines

| Use Case                | Recommended Model     | Reason                          |
| ----------------------- | --------------------- | ------------------------------- |
| Quick analysis          | `gpt-5-mini`          | Fast, zero cost                 |
| Standard implementation | `gpt-5.1-codex`       | Good balance of speed/quality   |
| Complex reasoning       | `claude-opus-4.5`     | Extended thinking capability    |
| Large context (>200K)   | `gpt-4.1`             | 1M context window               |
| Rapid iteration         | `grok-code-fast-1`*   | 4x faster (VS Code only)        |

*VS Code model picker only, not available in CLI

---

## Sources

- [GitHub Copilot Model Documentation](https://docs.github.com/copilot)
- [Copilot CLI Help](https://docs.github.com/copilot/using-github-copilot/using-github-copilot-in-the-command-line)
