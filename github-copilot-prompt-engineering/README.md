# GitHub Copilot Prompt Engineering

> **Audience**: Developers using GitHub Copilot (VS Code, Visual Studio, JetBrains, CLI)
> **Purpose**: Generic, reusable optimization guides for GitHub Copilot and its available models
> **Last Updated**: 2026-01-20

---

## Overview

This directory contains comprehensive documentation for optimizing GitHub Copilot across its various interfaces and supported models. All guides are **generic and project-agnostic**—designed for any codebase, any team.

**What you'll find here:**

- **Platform/Tool Guides** — How to customize Copilot using instructions, prompts, agents, and CLI tools
- **Model Optimization Guides** — Specific techniques for each model available in GitHub Copilot

---

## Document Index

### Platform & Tool Guides

| Document | Description | When to Use |
|----------|-------------|-------------|
| [FEATURES-AND-AVAILABILITY.md](./FEATURES-AND-AVAILABILITY.md) | Feature reference with CLI/VS Code availability | Checking feature status, model availability |
| [FILE-TYPE-COMPARISON.md](./FILE-TYPE-COMPARISON.md) | Compare all customization file types | Choosing between `.instructions.md`, `.prompt.md`, `.agent.md` |
| [COMMANDS-AND-CUSTOM-INSTRUCTIONS.md](./COMMANDS-AND-CUSTOM-INSTRUCTIONS.md) | Slash commands and custom instructions | Setting up project-wide conventions |
| [PROMPT-FILES-GUIDE.md](./PROMPT-FILES-GUIDE.md) | Complete `.prompt.md` file reference | Creating reusable task-specific prompts |
| [AGENT-FILES-GUIDE.md](./AGENT-FILES-GUIDE.md) | Complete `.agent.md` file reference | Building specialized AI personas |
| [AGENTS-AND-WORKFLOWS.md](./AGENTS-AND-WORKFLOWS.md) | Agent Mode and WRAP methodology | Leveraging Agent Mode for complex tasks |
| [CLI-TOOLS-COMPARISON.md](./CLI-TOOLS-COMPARISON.md) | `gh copilot` vs `copilot` CLI comparison | Choosing the right CLI interface |
| [MODEL-FRONTMATTER.md](./MODEL-FRONTMATTER.md) | Model selection in frontmatter | Specifying models in prompt/agent files |

### Model Optimization Guides

| Document | Model | Context | Best For |
|----------|-------|---------|----------|
| [MODEL-OPTIMIZATION-GPT-4-1.md](./MODEL-OPTIMIZATION-GPT-4-1.md) | GPT-4.1 | 1M | Large features requiring long-context analysis |
| [MODEL-OPTIMIZATION-GPT-5-MINI.md](./MODEL-OPTIMIZATION-GPT-5-MINI.md) | GPT-5 Mini | 200K | Fast analysis, cost-effective tasks |
| [MODEL-OPTIMIZATION-GPT-5-1-CODEX.md](./MODEL-OPTIMIZATION-GPT-5-1-CODEX.md) | GPT-5.1-Codex | 400K | Standard implementation work |
| [MODEL-OPTIMIZATION-GPT-5-1-CODEX-MAX.md](./MODEL-OPTIMIZATION-GPT-5-1-CODEX-MAX.md) | GPT-5.1-Codex-Max | 400K+ | Long-horizon multi-file tasks |
| [MODEL-OPTIMIZATION-GROK.md](./MODEL-OPTIMIZATION-GROK.md) | Grok Code Fast 1 | 256K | Agentic workflows, rapid iteration |

---

## Quick Model Selection Guide

### GitHub Copilot Model Availability

| Model | Context | Best For | Cost | Availability |
|-------|---------|----------|------|--------------|
| **GPT-5.1-Codex** | 400K | Standard implementation | Low | VS Code, CLI |
| **GPT-5.1-Codex-Max** | 400K+ | Long-horizon multi-file | Medium | VS Code |
| **GPT-5 Mini** | 200K | Fast analysis tasks | 0x (free) | VS Code |
| **GPT-4.1** | 1M | Large context features | 0x (free) | VS Code |
| **Grok Code Fast 1** | 256K | Agentic iteration | 0x (free) | VS Code |
| **Claude Sonnet 4** | 200K | Complex reasoning | 1x | VS Code |
| **Claude Opus 4** | 200K | Extended thinking | Premium | VS Code |

### Model Selection Decision Tree

```
What's your primary need?

├── Large codebase (>200K tokens)
│   ├── Need 1M context → GPT-4.1
│   └── Need speed + iteration → Grok Code Fast 1
│
├── Standard implementation
│   ├── Single file/focused → GPT-5.1-Codex
│   └── Multi-file/long-horizon → GPT-5.1-Codex-Max
│
├── Fast analysis/low cost
│   └── GPT-5 Mini (0x cost)
│
├── Complex reasoning needed
│   ├── Extended thinking → Claude Opus 4
│   └── Standard reasoning → Claude Sonnet 4
│
└── Rapid iteration/agentic
    └── Grok Code Fast 1 (4x faster, 1/10th cost)
```

---

## Learning Path

### Beginner

Start here if you're new to GitHub Copilot customization:

1. **[FEATURES-AND-AVAILABILITY.md](./FEATURES-AND-AVAILABILITY.md)** — Know what features are available (CLI vs VS Code)
2. **[FILE-TYPE-COMPARISON.md](./FILE-TYPE-COMPARISON.md)** — Understand all the customization options
3. **[COMMANDS-AND-CUSTOM-INSTRUCTIONS.md](./COMMANDS-AND-CUSTOM-INSTRUCTIONS.md)** — Set up basic project conventions

### Intermediate

Once you understand the basics:

1. **[PROMPT-FILES-GUIDE.md](./PROMPT-FILES-GUIDE.md)** — Create reusable task prompts
2. **[AGENT-FILES-GUIDE.md](./AGENT-FILES-GUIDE.md)** — Build specialized AI personas
3. **[AGENTS-AND-WORKFLOWS.md](./AGENTS-AND-WORKFLOWS.md)** — Master Agent Mode

### Advanced

For power users optimizing for specific models:

1. **Model optimization guides** — Learn model-specific techniques
2. **[MODEL-FRONTMATTER.md](./MODEL-FRONTMATTER.md)** — Target specific models in your files
3. **Combine techniques** — Use the right model for each task type

---

## Key Concepts

### Customization File Hierarchy

```
Repository
├── .github/
│   ├── copilot-instructions.md     # Always applied (project-wide)
│   ├── instructions/
│   │   └── *.instructions.md       # Path-specific (auto-applied)
│   ├── prompts/
│   │   └── *.prompt.md             # On-demand (invoked via /command)
│   └── agents/
│       └── *.agent.md              # Personas (selected explicitly)
└── AGENTS.md                       # Repository-wide agent context
```

### When to Use Each File Type

| Need | File Type | Example |
|------|-----------|---------|
| Project-wide conventions | `copilot-instructions.md` | Coding standards, architecture |
| File-type-specific rules | `*.instructions.md` | Component vs service conventions |
| Repeatable task workflows | `*.prompt.md` | `/generate-tests`, `/code-review` |
| Specialized AI personas | `*.agent.md` | `@test-agent`, `@docs-agent` |

---

## External Resources

### Official Documentation

- [GitHub Copilot Documentation](https://docs.github.com/copilot)
- [VS Code Copilot Customization](https://code.visualstudio.com/docs/copilot/customization)
- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/get-started/best-practices)

### Model-Specific Documentation

- [OpenAI GPT-4.1 Prompting Guide](https://cookbook.openai.com/examples/gpt4-1_prompting_guide)
- [xAI Grok Code Fast 1 Guide](https://docs.x.ai/docs/guides/grok-code-prompt-engineering)

### Community Resources

- [Awesome GitHub Copilot](https://github.com/github/awesome-copilot)
- [GitHub Community Discussions](https://github.com/orgs/community/discussions)

---

## Related Documentation

- **[../claude-prompt-engineering/](../claude-prompt-engineering/)** — Claude Code-specific optimization guides
- **[../prompt-engineering/](../prompt-engineering/)** — Project-specific verification results

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-20 | Initial release with 13 documents |

---

**Maintainer**: Project documentation team
**Last Updated**: 2026-01-20
