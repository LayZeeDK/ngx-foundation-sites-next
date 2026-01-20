# Prompt Engineering Documentation

This directory contains **project-specific** optimization strategies and verification results for AI models used in the SpecKit workflow.

> **📘 Looking for Claude Code documentation?**
> See [`../claude-prompt-engineering/`](../claude-prompt-engineering/) for generic, reusable Claude Code guides covering:
> - Model optimization (Haiku, Sonnet, Opus)
> - Skills architecture and design patterns
> - Task spawning and parallel execution
> - MCP tool search and lazy loading
> - Large file chunking strategies

> **🤖 Looking for GitHub Copilot documentation?**
> See [`../github-copilot-prompt-engineering/`](../github-copilot-prompt-engineering/) for generic, reusable GitHub Copilot guides covering:
> - Customization file types (`.prompt.md`, `.agent.md`, `AGENTS.md`)
> - Commands, custom instructions, and agent workflows
> - Model optimization (GPT-5.1-Codex, GPT-5 Mini, GPT-4.1, Grok)
> - CLI tools comparison and frontmatter reference

---

## What's In This Directory

This directory contains **project-specific** optimization recommendations that are not generalizable to other projects:

| File | Purpose |
|------|---------|
| [HAIKU-4-5-COMMAND-OPTIMIZATION-RECOMMENDATIONS.md](./HAIKU-4-5-COMMAND-OPTIMIZATION-RECOMMENDATIONS.md) | SpecKit command-specific Haiku optimization |

> **📘 Looking for GitHub Copilot feature availability?**
> See [`../github-copilot-prompt-engineering/FEATURES-AND-AVAILABILITY.md`](../github-copilot-prompt-engineering/FEATURES-AND-AVAILABILITY.md)

---

## 📚 Project-Specific Claude Documentation

### [Haiku 4.5 Command Optimization Recommendations](./HAIKU-4-5-COMMAND-OPTIMIZATION-RECOMMENDATIONS.md)

**Analysis of**: `tasks-haiku-4-5`, `clarify-haiku-4-5`, `specify-haiku-4-5`, `checklist-haiku-4-5`

**Key Recommendations**:

- ✅ **Extended thinking** for tasks-haiku-4-5 (2K budget) - Better dependency detection
- ✅ **Extended thinking** for clarify-haiku-4-5 (4K budget) - Better ambiguity detection
- ⚠️ **Monitor** specify-haiku-4-5 - Implement only if quality issues observed
- ✅ **Interleaved thinking** - GA in CLI (enabled by default)
- ⚠️ **Structured outputs** - Use with fallback (beta)
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

## 🔬 Feature Availability (Moved)

Feature availability documentation has been consolidated:

| Tool | Documentation |
|------|---------------|
| **Claude Code** | [`../claude-prompt-engineering/FEATURES-AND-AVAILABILITY.md`](../claude-prompt-engineering/FEATURES-AND-AVAILABILITY.md) |
| **GitHub Copilot** | [`../github-copilot-prompt-engineering/FEATURES-AND-AVAILABILITY.md`](../github-copilot-prompt-engineering/FEATURES-AND-AVAILABILITY.md) |

---

## 🔗 Related Documentation

### Generic Guides (Use These for New Projects)

| Directory | Content |
|-----------|---------|
| [`../claude-prompt-engineering/`](../claude-prompt-engineering/) | Claude Code optimization, skills, task spawning, chunking |
| [`../github-copilot-prompt-engineering/`](../github-copilot-prompt-engineering/) | GitHub Copilot customization, GPT/Grok model optimization |

### Project Resources

| Resource | Purpose |
|----------|---------|
| [SPECKIT_GUIDE.md](../SPECKIT_GUIDE.md) | Complete SpecKit workflow with model recommendations |
| [.github/agents/](../.github/agents/) | Agent implementations for this project |
| [.claude/skills/](../.claude/skills/) | Claude Code skill implementations |

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

**Last Updated**: 2026-01-20
**Maintained by**: SpecKit contributors
