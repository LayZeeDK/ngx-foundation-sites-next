# GitHub Copilot Customization Files Comparison

**Last Updated:** 2026-01-20

This document provides a comprehensive comparison of all GitHub Copilot customization file types, including when to use each, their differences, and how they work together.

---

## Quick Reference Matrix

| File Type               | Extension          | Location                | Activation               | Scope               | Best For                      |
| ----------------------- | ------------------ | ----------------------- | ------------------------ | ------------------- | ----------------------------- |
| **Custom Instructions** | `.instructions.md` | `.github/`              | Automatic                | Every request       | Project conventions           |
| **Path Instructions**   | `.instructions.md` | `.github/instructions/` | Automatic (path-matched) | Specific file paths | File-type-specific rules      |
| **Prompt Files**        | `.prompt.md`       | `.github/prompts/`      | `/command`               | On-demand           | Task-specific workflows       |
| **Custom Agents**       | `.agent.md`        | `.github/agents/`       | Agent selection          | Session             | Specialized personas          |
| **AGENTS.md**           | `AGENTS.md`        | Repository root         | Automatic (agents)       | All agents          | Repository-wide agent context |

---

## Detailed Comparison

### Activation Behavior

| File Type                 | When Applied                           | User Action Required               |
| ------------------------- | -------------------------------------- | ---------------------------------- |
| `copilot-instructions.md` | Every chat request                     | None (automatic)                   |
| `*.instructions.md`       | Requests involving matching file paths | None (automatic)                   |
| `*.prompt.md`             | Only when invoked                      | Type `/promptName`                 |
| `*.agent.md`              | When agent is selected                 | Select from dropdown or `@mention` |
| `AGENTS.md`               | All agent requests in repo             | None (automatic for agents)        |

### Frontmatter Capabilities

| Property                | `.prompt.md`  | `.agent.md`         | `.instructions.md` |
| ----------------------- | ------------- | ------------------- | ------------------ |
| `name`                  | Yes           | Yes                 | No                 |
| `description`           | Yes (required)| Yes (required)      | Yes (optional)     |
| `agent`                 | Yes           | No                  | No                 |
| `model`                 | Yes           | Yes                 | No                 |
| `tools`                 | Yes           | Yes                 | No                 |
| `target`                | No            | Yes                 | No                 |
| `mcp-servers`           | No            | Yes (org/enterprise)| No                 |
| `applyTo`               | No            | No                  | Yes (glob pattern) |
| `infer`                 | No            | Yes                 | No                 |
| Variables (`${input:}`) | Yes           | No                  | No                 |

### Content Capabilities

| Feature             | `.prompt.md`            | `.agent.md`  | `.instructions.md` | `AGENTS.md` |
| ------------------- | ----------------------- | ------------ | ------------------ | ----------- |
| Max content size    | ~unlimited              | 30,000 chars | ~unlimited         | ~unlimited  |
| File references     | Yes (Markdown links)    | Yes          | Yes                | Yes         |
| Tool references     | Yes (`#tool:name`)      | No           | No                 | No          |
| Input variables     | Yes (`${input:}`)       | No           | No                 | No          |
| Workspace variables | Yes (`${workspaceFolder}`) | No        | No                 | No          |
| Code examples       | Yes                     | Yes          | Yes                | Yes         |

### Platform Availability

| File Type           | VS Code | Visual Studio | JetBrains | Eclipse | Xcode | GitHub.com |
| ------------------- | ------- | ------------- | --------- | ------- | ----- | ---------- |
| Custom Instructions | Yes     | Yes           | Yes       | Yes     | Yes   | Yes        |
| Path Instructions   | Yes     | Yes           | Yes       | No      | No    | No         |
| Prompt Files        | Yes     | Yes           | Yes       | No      | No    | No         |
| Custom Agents       | Yes     | No            | Yes*      | Yes*    | Yes*  | Yes        |
| AGENTS.md           | Yes     | No            | No        | No      | No    | Yes        |

*Public preview

---

## When to Use Each

### Custom Instructions (`copilot-instructions.md`)

**Use for:** Project-wide context that applies to ALL interactions

```markdown
# .github/copilot-instructions.md

## Project Overview
This is a React component library using TypeScript.

## Coding Standards
- Use functional components with hooks
- Use TypeScript strict mode
- Prefer composition over inheritance

## Testing
- Write Jest tests alongside implementation
- Use React Testing Library for component tests
```

**Best when:**
- Information applies to every request
- Conventions should never be forgotten
- Architecture decisions need to be known

**Avoid when:**
- Information is task-specific
- Instructions are optional
- Content varies by context

---

### Path Instructions (`*.instructions.md`)

**Use for:** File-type-specific rules that only apply to certain paths

```yaml
# .github/instructions/components.instructions.md
---
applyTo: 'src/components/**/*.tsx'
description: React component conventions
---

## Component Rules
- Always use functional components
- Use custom hooks for shared logic
- Keep components under 200 lines
```

**Best when:**
- Rules only apply to specific file types
- Different conventions for different areas
- Want automatic context without manual selection

**Avoid when:**
- Rules apply everywhere
- Rules should be optional

---

### Prompt Files (`*.prompt.md`)

**Use for:** Repeatable task-specific workflows triggered on-demand

```yaml
# .github/prompts/new-component.prompt.md
---
name: new-component
description: Generate React component with tests
agent: agent
tools: ['read', 'edit', 'search']
---

# Generate Component

Create a new React component with:
- Component file with TypeScript
- Unit test file
- Storybook story

## Input
Name: ${input:name:PascalCase component name}
Description: ${input:desc:What does it do?}
```

**Best when:**
- Task is repeatable but not automatic
- Need dynamic inputs from user
- Want specific tool access
- Task has clear start/end

**Avoid when:**
- Information applies always (use instructions)
- Need persistent persona (use agent)
- Task is one-time

---

### Custom Agents (`*.agent.md`)

**Use for:** Specialized AI personas with distinct roles and boundaries

```yaml
# .github/agents/test-agent.agent.md
---
name: test-agent
description: Testing specialist for unit and integration tests
tools: ["read", "edit", "execute"]
---

# Test Agent

You are a testing specialist. You write comprehensive tests but NEVER modify source code.

## Responsibilities
1. Write unit tests
2. Create integration tests
3. Ensure coverage targets

## Boundaries
- Never modify production code
- Always run tests after writing
```

**Best when:**
- Need specialized expertise
- Want role-specific boundaries
- Task requires persistent context
- Creating "team members" with distinct skills

**Avoid when:**
- Task is one-off (use prompt)
- No special constraints needed
- Same instructions for all tasks

---

### AGENTS.md

**Use for:** Repository-wide context for all coding agent interactions

```markdown
# AGENTS.md

## Project Context
React component library for design system

## Build Commands
npm run build    # Production build
npm run test     # Run tests
npm run lint     # Check code style

## Directory Structure
src/components/  # Component source
src/stories/     # Storybook stories
```

**Best when:**
- Context applies to all agent work
- Commands and structure rarely change
- Want baseline for all specialized agents

**Avoid when:**
- Using only Copilot Chat (not agents)
- Instructions vary by task type

---

## Combination Patterns

### Pattern 1: Layered Instructions

```
.github/
├── copilot-instructions.md           # Global (always applied)
├── instructions/
│   ├── components.instructions.md    # Path-specific (auto-applied)
│   └── tests.instructions.md         # Path-specific (auto-applied)
├── prompts/
│   └── new-component.prompt.md       # On-demand task
└── agents/
    └── test-agent.agent.md           # Specialized persona
```

**Flow:**
1. Global instructions → Always included
2. Path instructions → Added when matching files
3. Agent persona → Added when agent selected
4. Prompt → Added when `/command` invoked

### Pattern 2: Agent Team

```
.github/agents/
├── docs-agent.agent.md      # Documentation specialist
├── test-agent.agent.md      # Testing specialist
├── review-agent.agent.md    # Code review specialist
└── security-agent.agent.md  # Security audit specialist
```

**Usage:**
- Select `@docs-agent` for documentation tasks
- Select `@test-agent` for testing tasks
- Each has distinct boundaries and focus

### Pattern 3: Workflow Prompts with Agent Execution

```yaml
# .github/prompts/feature-implementation.prompt.md
---
agent: "@feature-agent"
tools: ["read", "edit", "search", "execute"]
---

# Implement Feature

Execute using the @feature-agent persona with full tool access.

Feature: ${input:feature:Describe the feature}
```

Prompt triggers a specific agent with defined inputs.

### Pattern 4: Development Lifecycle

```
Instructions (always-on)
    ↓ provide context to
Agents (specialized personas)
    ↓ execute using
Prompts (specific tasks)
```

| Phase          | File Type                 | Purpose                   |
| -------------- | ------------------------- | ------------------------- |
| Planning       | `/plan-feature.prompt.md` | Break down requirements   |
| Implementation | `@feature-agent`          | Code with expertise       |
| Testing        | `@test-agent`             | Write comprehensive tests |
| Review         | `/code-review.prompt.md`  | Structured review         |
| Documentation  | `@docs-agent`             | Generate documentation    |

---

## Frontmatter Reference Summary

### Prompt Files (`.prompt.md`)

```yaml
---
name: string           # Command name (/name)
description: string    # REQUIRED - what it does
agent: string          # ask | edit | agent | @agent-name
model: string          # GPT-4o, GPT-5 mini, etc.
tools: list            # ["read", "edit", "search"]
argument-hint: string  # Hint in chat input
---
```

### Custom Agents (`.agent.md`)

```yaml
---
name: string           # Display name
description: string    # REQUIRED - capabilities
tools: list | string   # ["read", "edit"] or "*"
target: string         # vscode | github-copilot
infer: boolean         # Auto-select agent (default: true)
model: string          # Model preference (IDE only)
mcp-servers: object    # MCP config (org/enterprise only)
metadata: object       # Custom annotations
---
```

### Path Instructions (`.instructions.md`)

```yaml
---
applyTo: string        # REQUIRED - glob pattern
description: string    # What these instructions do
---
```

---

## Decision Flowchart

```
START: What do you need Copilot to do?

Is this information that should ALWAYS be included?
├── YES → Is it path-specific?
│   ├── YES → Use .instructions.md with applyTo
│   └── NO  → Use copilot-instructions.md
└── NO → Does it need a specialized persona?
    ├── YES → Use .agent.md
    └── NO  → Is it a repeatable task with inputs?
        ├── YES → Use .prompt.md
        └── NO  → Just type in chat
```

---

## Common Mistakes

### Using Prompts for Always-On Context

```markdown
# Bad: Creating a prompt for coding standards
# User has to remember to invoke /coding-standards every time
```

**Fix:** Put always-needed context in `copilot-instructions.md`

### Using Instructions for Optional Tasks

```markdown
# Bad: Full test generation template in instructions
# Clutters every request with test boilerplate
```

**Fix:** Create `/generate-tests.prompt.md` for on-demand use

### Single Overloaded Agent

```markdown
# Bad: One agent that does documentation, testing, AND security
# Conflicting responsibilities, unclear boundaries
```

**Fix:** Create specialized agents (`@docs-agent`, `@test-agent`, `@security-agent`)

### Missing Boundaries in Agents

```markdown
# Bad: Agent with no boundaries
# Might modify files it shouldn't
```

**Fix:** Always include boundaries section with what agent CAN and CANNOT do

### Duplicating Context

```markdown
# Bad: Same coding standards in instructions AND agents AND prompts
# Maintenance nightmare, inconsistency risk
```

**Fix:** Put shared context in instructions; reference from agents/prompts

---

## Migration Guide

### From copilot-instructions.md to Specialized Files

**Before (everything in one file):**

```markdown
# copilot-instructions.md

## Project info...
## Coding standards...
## Testing template... (used occasionally)
## Security checklist... (used for reviews)
```

**After (properly separated):**

```
.github/
├── copilot-instructions.md        # Only always-needed info
├── prompts/
│   └── security-review.prompt.md  # On-demand checklist
└── agents/
    └── test-agent.agent.md        # Testing persona
```

---

## Sources

- [GitHub Copilot Customization Docs](https://docs.github.com/copilot/customizing-copilot)
- [VS Code Copilot Customization](https://code.visualstudio.com/docs/copilot/customization)
- [Prompt Files vs Custom Instructions vs Custom Agents](https://gist.github.com/burkeholland/435ab18c549ddbefde1846165e8b2e08)
- [Awesome GitHub Copilot](https://github.com/github/awesome-copilot)
- [All About GitHub Copilot Custom Instructions](https://www.nathannellans.com/post/all-about-github-copilot-custom-instructions)
