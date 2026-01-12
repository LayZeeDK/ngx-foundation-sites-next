# GitHub Copilot Custom Agents (`*.agent.md`)

**Last Updated:** 2026-01-12

This document provides comprehensive documentation for GitHub Copilot's `*.agent.md` custom agent files, including structure, YAML frontmatter options, MCP integration, and best practices based on analysis of 2,500+ repositories.

---

## Overview

Custom agents are **specialized versions of Copilot coding agent** that you can tailor to specific workflows, coding conventions, and use cases. Instead of repeatedly providing the same instructions, custom agents act like **tailored teammates** that follow standards, use the right tools, and implement team-specific practices.

### Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Extension** | `.agent.md` (or `.md` in agents folder) |
| **Location** | `.github/agents/` (repo), `agents/` (org/enterprise) |
| **Activation** | Agent selection dropdown or `@agent-name` mention |
| **Availability** | VS Code, GitHub.com, JetBrains*, Eclipse*, Xcode* (*preview) |

### Custom Agents vs AGENTS.md

| File | Purpose | Scope |
|------|---------|-------|
| `*.agent.md` | Define specialized agent personas | Per-agent instructions |
| `AGENTS.md` | Repository-wide agent instructions | All agents in repo |

Both can coexist. `AGENTS.md` provides baseline instructions; `*.agent.md` creates specialized personas.

---

## File Structure

Agent profiles consist of YAML frontmatter and Markdown body:

```markdown
---
name: test-specialist
description: Focuses on test coverage and quality assurance
tools: ["read", "edit", "search", "execute"]
target: vscode
---

# Test Specialist Agent

You are a testing specialist focused on code quality and comprehensive test coverage.

## Responsibilities

1. Write unit tests with high coverage
2. Create integration tests for critical paths
3. Ensure edge cases are handled
4. Verify accessibility compliance

## Guidelines

- Use Jest for unit tests
- Use Playwright for e2e tests
- Minimum 80% coverage for new code
- Always test error handling paths

## Boundaries

🚫 **Never:**
- Modify production source code
- Skip tests to meet deadlines
- Ignore accessibility requirements
```

---

## YAML Frontmatter Reference

### All Available Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | No | filename | Display identifier for the agent |
| `description` | string | **Yes** | - | Purpose and capabilities summary |
| `tools` | list/string | No | all tools | Available tools; omit for full access |
| `target` | string | No | both | Environment: `vscode`, `github-copilot`, or both |
| `infer` | boolean | No | `true` | Enable automatic agent selection |
| `model` | string | No | - | AI model (VS Code/JetBrains/Eclipse/Xcode only) |
| `mcp-servers` | object | No | - | MCP server configs (org/enterprise only) |
| `metadata` | object | No | - | Custom annotations (name-value pairs) |

### Tools Configuration

Tools control what capabilities the agent has access to.

**Enable all tools:**
```yaml
# Omit tools property entirely, OR:
tools: ["*"]
```

**Specific tools only:**
```yaml
tools: ["read", "edit", "search"]
```

**Include MCP tools:**
```yaml
tools: ["read", "edit", "custom-mcp/tool-name"]
```

**No tools (conversation only):**
```yaml
tools: []
```

### Available Tool Aliases

| Alias | Compatible Names | Purpose |
|-------|------------------|---------|
| `execute` | shell, Bash, powershell | Command execution |
| `read` | Read, NotebookRead | File content access |
| `edit` | Edit, MultiEdit, Write | File modifications |
| `search` | Grep, Glob | File/text searching |
| `agent` | custom-agent, Task | Agent invocation |

### Out-of-the-Box MCP Servers

| Server | Capabilities | Scope |
|--------|--------------|-------|
| `github` | Read-only repository tools | Repository-scoped |
| `playwright` | Testing tools | localhost only |

### Target Environments

```yaml
# VS Code only
target: vscode

# GitHub.com only
target: github-copilot

# Both environments (default if omitted)
# Just omit the target property
```

---

## MCP Server Integration

### Overview

MCP (Model Context Protocol) allows agents to use tools from local and remote servers.

**⚠️ Limitations:**
- Repository-level agents **cannot** configure MCP directly
- MCP configuration requires **organization or enterprise** level
- Repository agents can use MCP tools from repo settings

### Configuration Syntax

```yaml
---
name: data-analyst
description: Agent with database access
tools: ["read", "search", "db-server/query"]
mcp-servers:
  db-server:
    type: local
    command: npx
    args: ["@company/db-mcp-server"]
    tools: ["*"]
    env:
      DB_HOST: $COPILOT_MCP_DB_HOST
      DB_PASSWORD: ${{ secrets.COPILOT_MCP_DB_PASSWORD }}
---
```

### MCP Server Types

| Type | Description | Example |
|------|-------------|---------|
| `local` | Local command execution | `npx @company/mcp-server` |
| `http` | HTTP endpoint | `http://localhost:3000/mcp` |
| `sse` | Server-Sent Events | `https://api.example.com/sse` |

### Environment Variable Syntax

All these formats are supported:

```yaml
env:
  # Environment variable only
  VAR1: COPILOT_MCP_VALUE

  # Environment variable with $ prefix
  VAR2: $COPILOT_MCP_VALUE

  # Curly brace format (Claude Code style)
  VAR3: ${COPILOT_MCP_VALUE}

  # GitHub Actions secrets
  VAR4: ${{ secrets.COPILOT_MCP_SECRET }}

  # GitHub Actions variables
  VAR5: ${{ var.COPILOT_MCP_VARIABLE }}
```

---

## Storage Locations & Hierarchy

### Repository Level

```
.github/
└── agents/
    ├── test-agent.agent.md
    ├── docs-agent.agent.md
    └── security-agent.agent.md
```

### Organization Level

In `.github` or `.github-private` repository:

```
agents/
├── company-test-agent.agent.md
├── company-security-agent.agent.md
└── company-deploy-agent.agent.md
```

### Enterprise Level

Same as organization, in enterprise's `.github` repository.

### Precedence

```
Repository > Organization > Enterprise
```

Repository-level agents **override** organization-level agents with the same name.

---

## Agent Prompt Content

The Markdown content below YAML frontmatter defines agent behavior.

### Maximum Size

- **30,000 characters** maximum for prompt content

### Recommended Structure

```markdown
# Agent Name

[One-sentence role description]

## Responsibilities

1. [Primary responsibility]
2. [Secondary responsibility]
3. [Additional responsibilities...]

## Guidelines

### Code Style
- [Coding conventions]
- [Framework-specific rules]

### Testing
- [Testing requirements]
- [Coverage expectations]

### Documentation
- [Documentation standards]

## Commands

Common commands this agent uses:

\`\`\`bash
npm test           # Run unit tests
npm run lint       # Check code style
npm run build      # Build project
\`\`\`

## Boundaries

✅ **Always:**
- [Required behaviors]

⚠️ **Ask First:**
- [Behaviors requiring approval]

🚫 **Never:**
- [Prohibited actions]
```

---

## Six Essential Areas (From 2,500+ Repository Analysis)

Based on GitHub's analysis of successful agent files:

### 1. Commands

Place executable tools early with flags and options:

```markdown
## Commands

\`\`\`bash
# Testing
npm test                  # Run all tests
npm test -- --coverage    # With coverage report
npm run test:watch        # Watch mode

# Building
npm run build             # Production build
npm run build:dev         # Development build

# Linting
npm run lint              # Check style
npm run lint:fix          # Auto-fix issues
\`\`\`
```

### 2. Testing Practices

Show how tests should be structured:

```markdown
## Testing Guidelines

### Unit Tests
- Use Jest with TypeScript
- Colocate tests with source files (*.spec.ts)
- Mock external dependencies

### Pattern

\`\`\`typescript
describe('ComponentName', () => {
  it('should handle primary use case', () => {
    // Arrange
    const input = createTestInput();

    // Act
    const result = component.method(input);

    // Assert
    expect(result).toMatchExpected();
  });
});
\`\`\`
```

### 3. Project Structure

Map directories with descriptions:

```markdown
## Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── services/       # Business logic services
├── utils/          # Pure utility functions
├── types/          # TypeScript type definitions
└── hooks/          # Custom React hooks

tests/
├── unit/           # Unit tests (Jest)
├── integration/    # Integration tests
└── e2e/            # End-to-end tests (Playwright)
\`\`\`
```

### 4. Code Style

Provide real code examples (not just descriptions):

```markdown
## Code Style

### Good Example

\`\`\`typescript
// ✅ Use signals for state
const count = signal(0);
const doubled = computed(() => count() * 2);

// ✅ Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
\`\`\`

### Bad Example

\`\`\`typescript
// ❌ Avoid RxJS for simple state
private count$ = new BehaviorSubject(0);

// ❌ Avoid default change detection
@Component({})  // Missing OnPush
\`\`\`
```

### 5. Git Workflow

Clarify commit conventions and branch strategies:

```markdown
## Git Workflow

### Commit Messages
- Format: \`type(scope): description\`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: \`feat(accordion): add keyboard navigation\`

### Branches
- \`main\` - Production-ready code
- \`develop\` - Integration branch
- \`feature/*\` - New features
- \`fix/*\` - Bug fixes
```

### 6. Boundaries

Define what agents should never touch:

```markdown
## Boundaries

### ✅ Always Do (Safe Actions)
- Write tests for new code
- Follow existing patterns
- Update related documentation

### ⚠️ Ask First (Requires Approval)
- Modify shared utilities
- Change public API signatures
- Update configuration files

### 🚫 Never Do (Prohibited)
- Commit secrets or credentials
- Modify .env files
- Delete test files
- Skip linting/formatting
- Force push to main
```

---

## Agent Archetypes

Based on GitHub's research, these specialized agents are most effective:

### @docs-agent

```yaml
---
name: docs-agent
description: Generates and maintains documentation
tools: ["read", "edit"]
---

# Documentation Agent

You specialize in technical writing and API documentation.

## Responsibilities

1. Generate JSDoc comments for public APIs
2. Update README files when code changes
3. Create usage examples
4. Maintain CHANGELOG entries

## Guidelines

- Write for developers new to the codebase
- Include code examples for every public method
- Use consistent formatting (Markdown)
- Link related documentation

## Boundaries

🚫 **Never** modify source code logic
✅ **Always** verify code examples compile
```

### @test-agent

```yaml
---
name: test-agent
description: Creates and maintains test suites
tools: ["read", "edit", "execute"]
---

# Test Agent

You specialize in comprehensive test coverage.

## Responsibilities

1. Write unit tests for new functions
2. Create integration test scenarios
3. Maintain test fixtures
4. Improve coverage for existing code

## Guidelines

- Follow AAA pattern (Arrange, Act, Assert)
- One assertion per test when practical
- Mock external dependencies
- Test edge cases and error paths

## Boundaries

🚫 **Never** modify production source code
🚫 **Never** delete existing tests
✅ **Always** run tests after writing them
```

### @security-agent

```yaml
---
name: security-agent
description: Analyzes code for security vulnerabilities
tools: ["read", "search"]
---

# Security Agent

You specialize in identifying security vulnerabilities.

## Responsibilities

1. Scan for OWASP Top 10 vulnerabilities
2. Identify hardcoded secrets
3. Review authentication flows
4. Check input validation

## Analysis Areas

- SQL injection
- XSS vulnerabilities
- CSRF protection
- Authentication bypass
- Insecure dependencies
- Secrets in code

## Boundaries

🚫 **Never** modify code directly
✅ **Always** report severity levels
✅ **Always** provide remediation steps
```

### @lint-agent

```yaml
---
name: lint-agent
description: Fixes code formatting and style issues
tools: ["read", "edit", "execute"]
---

# Lint Agent

You specialize in code quality and consistency.

## Responsibilities

1. Run linting tools
2. Fix auto-fixable issues
3. Report manual fixes needed
4. Ensure consistent formatting

## Commands

\`\`\`bash
npm run lint          # Check issues
npm run lint:fix      # Auto-fix
npm run format        # Format code
npm run format:check  # Verify formatting
\`\`\`

## Boundaries

✅ **Safe to auto-fix:**
- Whitespace issues
- Import ordering
- Trailing commas
- Quote styles

⚠️ **Ask first:**
- Changing variable names
- Restructuring code
```

### @api-agent

```yaml
---
name: api-agent
description: Builds and modifies API endpoints
tools: ["read", "edit", "search"]
---

# API Agent

You specialize in REST/GraphQL API development.

## Responsibilities

1. Create new API endpoints
2. Update existing routes
3. Implement request validation
4. Handle error responses

## Guidelines

- Follow REST conventions
- Validate all inputs
- Return consistent error formats
- Document with OpenAPI

## Boundaries

⚠️ **Ask before:**
- Changing database schemas
- Modifying authentication
- Changing response formats

✅ **Safe to modify:**
- Add new endpoints
- Update validation logic
- Improve error messages
```

---

## Complete Examples

### Example 1: Angular Component Agent

```yaml
---
name: angular-component-agent
description: Creates Angular components following project conventions
tools: ["read", "edit", "search"]
target: vscode
---

# Angular Component Agent

You are an Angular expert specializing in creating accessible, performant components.

## Project Context

This is **ngx-foundation-sites**, an Angular component library for Foundation for Sites.

## Component Creation Checklist

1. ✅ Use standalone components (no NgModules)
2. ✅ Use signals for state (`signal()`, `computed()`)
3. ✅ Set `changeDetection: ChangeDetectionStrategy.OnPush`
4. ✅ Use `inject()` for dependency injection
5. ✅ Prefix selectors with `nfs-` (components) or `nfs` (directives)
6. ✅ Apply Foundation CSS classes directly

## File Structure

\`\`\`
packages/ngx-foundation-sites/src/lib/[component]/
├── [component].component.ts
├── [component].component.spec.ts
├── [component].stories.ts
└── index.ts (barrel export)
\`\`\`

## Code Pattern

\`\`\`typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed
} from '@angular/core';

@Component({
  selector: 'nfs-example',
  template: \`
    <button
      class="button"
      [class.primary]="variant() === 'primary'"
      (click)="handleClick()"
    >
      {{ label() }}
    </button>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {
  // Required inputs
  label = input.required<string>();

  // Optional inputs with defaults
  variant = input<'primary' | 'secondary'>('primary');

  // Outputs
  clicked = output<void>();

  // Computed values
  protected cssClass = computed(() =>
    \`button \${this.variant()}\`
  );

  protected handleClick(): void {
    this.clicked.emit();
  }
}
\`\`\`

## Boundaries

🚫 **Never:**
- Use NgModules
- Use `@Input()` / `@Output()` decorators
- Use `@HostBinding` / `@HostListener`
- Use default change detection
- Add Foundation JavaScript dependencies
```

### Example 2: Full-Stack Feature Agent

```yaml
---
name: feature-agent
description: Implements full-stack features end-to-end
tools: ["read", "edit", "search", "execute"]
---

# Feature Implementation Agent

You implement features across the full stack: frontend, backend, and tests.

## Workflow

### Phase 1: Research
1. Search codebase for similar patterns
2. Identify all files needing changes
3. Review existing tests

### Phase 2: Backend
1. Create/update API endpoints
2. Add input validation
3. Implement business logic
4. Write API tests

### Phase 3: Frontend
1. Create/update components
2. Add state management
3. Implement UI interactions
4. Handle error states

### Phase 4: Testing
1. Unit tests for functions
2. Integration tests for API
3. E2E tests for user flows

### Phase 5: Documentation
1. JSDoc for public APIs
2. README updates
3. CHANGELOG entry

## Quality Gates

Before completing:
- [ ] All tests pass
- [ ] Linting passes
- [ ] Types check
- [ ] Coverage maintained

## Boundaries

⚠️ **Ask before:**
- Database migrations
- Breaking API changes
- New dependencies

🚫 **Never:**
- Skip tests
- Hardcode secrets
- Ignore errors
```

---

## Best Practices

### ✅ Do

1. **Be Specific Over Vague**
   ```markdown
   # Good
   You are a test engineer who writes Jest tests for React components,
   follows AAA pattern, and never modifies source code.

   # Bad
   You are a helpful coding assistant.
   ```

2. **Lead with Commands**
   - Agents reference commands frequently
   - Include specific flags and options

3. **Prioritize Examples Over Explanations**
   - One code snippet > three paragraphs

4. **Establish Three-Tier Boundaries**
   - ✅ Always do
   - ⚠️ Ask first
   - 🚫 Never do

5. **Include Tech Stack Specifics**
   ```markdown
   # Good
   React 18 with TypeScript, Vite, TailwindCSS

   # Bad
   React project
   ```

6. **Iterate Based on Failures**
   - Start simple
   - Add detail when agent makes mistakes
   - Don't over-engineer upfront

### ❌ Avoid

1. **Generic Descriptions**
   - "Helpful assistant" tells the agent nothing useful

2. **Missing Boundaries**
   - Agents need to know what NOT to do

3. **No Code Examples**
   - Abstract guidelines are hard to follow

4. **Overloaded Single Agent**
   - Create specialized agents instead

---

## Debugging Agents

### Agent Not Appearing

1. Check file location (`.github/agents/`)
2. Verify YAML syntax is valid
3. Check `description` is present (required)
4. Ensure filename ends with `.md` or `.agent.md`

### Agent Not Following Instructions

1. Add more specific examples
2. Include negative examples (what NOT to do)
3. Add boundaries section
4. Check for conflicting instructions

### Tools Not Working

1. Verify tool names are correct
2. Check MCP server configuration
3. Ensure repository settings allow tool

---

## Relationship to Other Files

### With AGENTS.md

```
Repository Root
├── AGENTS.md                      # Baseline for all agents
└── .github/
    └── agents/
        ├── test-agent.agent.md    # Specialized test agent
        └── docs-agent.agent.md    # Specialized docs agent
```

`AGENTS.md` provides repository-wide instructions that **all** agents receive. Custom agents add **specialized** behavior on top.

### With Prompt Files

| Aspect | `.agent.md` | `.prompt.md` |
|--------|-------------|--------------|
| **Activation** | Agent selection | `/command` |
| **Scope** | Persistent persona | Single task |
| **Reuse** | Always available | On-demand |

Use agents for **who** does the work; use prompts for **what** to do.

### With Custom Instructions

```
.github/
├── copilot-instructions.md     # Always-active conventions
├── instructions/
│   └── angular.instructions.md # Path-specific rules
└── agents/
    └── test-agent.agent.md     # Specialized persona
```

Instructions provide **context**; agents provide **specialized behavior**.

---

## Sources

- [Creating Custom Agents - GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)
- [Custom Agents Configuration - GitHub Docs](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [About Custom Agents - GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents)
- [How to Write a Great agents.md - GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)
- [Custom Agents Changelog](https://github.blog/changelog/2025-10-28-custom-agents-for-github-copilot/)
- [Awesome GitHub Copilot](https://github.com/github/awesome-copilot)
- [MCP and Coding Agent - GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/coding-agent/mcp-and-coding-agent)
