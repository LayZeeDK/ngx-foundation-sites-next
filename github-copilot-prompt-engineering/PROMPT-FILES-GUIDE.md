# GitHub Copilot Prompt Files (`*.prompt.md`)

**Last Updated:** 2026-01-20

This document provides comprehensive documentation for GitHub Copilot's `*.prompt.md` reusable prompt files, including structure, YAML frontmatter options, variables, and best practices.

---

## Overview

Prompt files are **reusable prompt templates** stored as `*.prompt.md` files that extend GitHub Copilot with pre-configured workflows for development scenarios. Unlike custom instructions that apply automatically, prompt files are **triggered on-demand** for specific tasks.

### Key Characteristics

| Aspect           | Description                                              |
| ---------------- | -------------------------------------------------------- |
| **Extension**    | `.prompt.md`                                             |
| **Location**     | `.github/prompts/` (workspace) or VS Code profile (user) |
| **Activation**   | On-demand via `/promptName` in chat                      |
| **Availability** | VS Code, Visual Studio, JetBrains IDEs (public preview)  |

### When to Use Prompt Files

**Use for:**

- Task-specific reusable prompts
- Code generation templates
- Review checklists
- Scaffolding workflows
- Controlled, limited-scope tasks

**Don't use for:**

- Project-wide conventions (use `copilot-instructions.md`)
- Always-on context (use custom instructions)
- Agent personas (use `.agent.md`)

---

## File Structure

Prompt files consist of three components:

```markdown
---
# YAML Frontmatter (configuration)
name: prompt-name
description: What this prompt does
agent: agent
tools: ['read', 'edit']
model: GPT-4o
---

# Markdown Body (the actual prompt)

You are a code reviewer specializing in React...

## Task

Analyze the provided code for:

1. Performance issues
2. Accessibility gaps
3. Best practice violations

## Input

Code to review: ${input:code:Paste your code here}
```

---

## YAML Frontmatter Reference

### All Available Properties

| Property        | Type   | Required | Default       | Description                                              |
| --------------- | ------ | -------- | ------------- | -------------------------------------------------------- |
| `name`          | string | No       | filename      | Identifier used after `/` in chat                        |
| `description`   | string | **Yes**  | -             | Brief explanation of prompt purpose                      |
| `agent`         | string | No       | -             | Execution agent: `ask`, `edit`, `agent`, or custom agent |
| `model`         | string | No       | current model | AI model to use (e.g., `GPT-4o`, `GPT-5 mini`)           |
| `tools`         | list   | No       | all tools     | Available tools (e.g., `["read", "edit", "search"]`)     |
| `argument-hint` | string | No       | -             | Hint text shown in chat input field                      |

### Agent Types

| Value         | Behavior                                |
| ------------- | --------------------------------------- |
| `ask`         | Question-answering mode, read-only      |
| `edit`        | Can make file edits                     |
| `agent`       | Full agent mode with autonomous actions |
| `@agent-name` | Use a specific custom agent             |

### Tool Configuration

Tools can be specified as:

```yaml
# Enable specific tools
tools: ["read", "edit", "search"]

# Enable specific tool + MCP tool
tools: ["read", "edit", "some-mcp-server/tool-1"]

# Reference tool sets
tools: ["#tool:githubRepo", "#tool:search/codebase"]

# Enable all tools (default if omitted)
tools: ["*"]

# Disable all tools
tools: []
```

**Available Tool Aliases:**

| Alias             | Description                    |
| ----------------- | ------------------------------ |
| `read`            | Read file contents             |
| `edit`            | Modify file contents           |
| `search`          | Search files/text (Grep, Glob) |
| `execute`         | Run shell commands             |
| `agent`           | Invoke other agents            |
| `githubRepo`      | GitHub repository tools        |
| `search/codebase` | Codebase search                |

---

## Variable Syntax

Prompt files support dynamic variable substitution.

### Input Variables

Prompt users for input when the prompt runs:

```markdown
# Basic input
${input:variableName}

# Input with placeholder hint
${input:variableName:Placeholder text for user}

# Examples
${input:code:Paste your code here}
${input:audience:Who is this explanation for?}
${input:componentName:Name of the component to create}
```

### Workspace Variables

Reference workspace paths:

```markdown
${workspaceFolder}            # Full workspace path
${workspaceFolderBasename}    # Workspace folder name only
```

### Selection Variables

Reference current editor selection:

```markdown
${selection}      # Currently selected text
${selectedText}   # Alias for ${selection}
```

### File Context Variables

Reference current file:

```markdown
${file}                       # Full file path
${fileBasename}               # Filename with extension
${fileDirname}                # Directory containing file
${fileBasenameNoExtension}    # Filename without extension
```

---

## File References

Reference other files in your prompt using Markdown links:

```markdown
# Reference instruction files
Follow the guidelines in [coding standards](../instructions/coding.instructions.md)

# Reference code files
Use the pattern from [example component](../../src/components/Example.tsx)

# Reference with relative paths
See [API documentation](../docs/api.md) for details
```

### Tool References

Reference tools inline with `#tool:` syntax:

```markdown
Use #tool:githubRepo to fetch repository information.
Search the codebase with #tool:search/codebase for similar patterns.
```

---

## Complete Examples

### Example 1: Code Explanation Prompt

```markdown
---
name: explain-code
description: Generate a clear code explanation with examples
agent: ask
---

# Code Explanation Prompt

Explain the following code in a clear, beginner-friendly way:

## Input

**Code to explain:** ${input:code:Paste your code here}

**Target audience:** ${input:audience:Who is this explanation for? (beginners, intermediate, etc.)}

## Output Requirements

Please provide:

1. **Overview** - What the code does in 1-2 sentences
2. **Step-by-step breakdown** - Walk through the main parts
3. **Key concepts** - Explain any important terminology
4. **Simple example** - Show how it works in practice
5. **Use cases** - When you might use this approach

Use clear, simple language and avoid unnecessary jargon.
```

### Example 2: Component Generator

```markdown
---
name: new-component
description: Generate component with tests
agent: agent
tools: ['read', 'edit', 'search']
model: GPT-4o
---

# Component Generator

Generate a new component following project conventions.

## Conventions

- Use functional components
- Use TypeScript
- Include proper type definitions
- Follow project structure

## Input

**Component name:** ${input:name:PascalCase name, e.g., UserProfile}

**Description:** ${input:description:What does this component do?}

**Inputs:** ${input:inputs:List of props (comma-separated)}

## Output Files

Generate these files in `${workspaceFolder}/src/components/${input:name}/`:

1. `${input:name}.tsx` - Component file
2. `${input:name}.test.tsx` - Unit tests
3. `index.ts` - Barrel export
```

### Example 3: Code Review Checklist

```markdown
---
name: code-review
description: Review code for best practices
agent: ask
tools: ['read', 'search']
---

# Code Review Checklist

Review the selected code for the following criteria:

## 1. Code Quality

- [ ] Follows project style guide
- [ ] Uses appropriate patterns
- [ ] Proper error handling
- [ ] No code duplication

## 2. Performance

- [ ] Efficient algorithms
- [ ] No memory leaks
- [ ] Optimized renders (if UI)

## 3. Accessibility

- [ ] ARIA attributes present where needed
- [ ] Keyboard navigation supported
- [ ] Semantic HTML elements used

## 4. Testing

- [ ] Unit tests exist
- [ ] Edge cases covered
- [ ] Error scenarios tested

## Output Format

For each issue found:

```
**Issue:** [Description]
**Severity:** [Critical/Major/Minor]
**Location:** [file:line]
**Recommendation:** [How to fix]
```
```

### Example 4: Multi-Step Workflow

```markdown
---
name: implement-feature
description: Complete feature implementation workflow
agent: agent
tools: ['read', 'edit', 'search', 'execute']
---

# Feature Implementation Workflow

Execute these steps in order for implementing a new feature.

## Step 1: Research

1. Search codebase for similar patterns
2. Identify files that need modification
3. Review existing tests for patterns

**Input required:** ${input:feature:Describe the feature to implement}

## Step 2: Implement

1. Create/modify source files
2. Follow project conventions from [AGENTS.md](../AGENTS.md)
3. Use consistent patterns

## Step 3: Test

1. Create unit tests
2. Add interaction tests for user flows
3. Run test suite: `npm test`

## Step 4: Verify

1. Run linter: `npm run lint`
2. Run formatter: `npm run format`
3. Check for TypeScript errors: `npx tsc --noEmit`

## Step 5: Document

1. Add JSDoc comments to public API
2. Update CHANGELOG if needed

Report status after each step before proceeding.
```

---

## Storage Locations

### Workspace Prompts

Store in `.github/prompts/` for repository-specific prompts:

```
.github/
└── prompts/
    ├── new-component.prompt.md
    ├── code-review.prompt.md
    ├── test-generator.prompt.md
    └── docs-generator.prompt.md
```

### User Prompts

Store in VS Code profile for prompts available across all workspaces:

- **Windows:** `%APPDATA%\Code\User\prompts\`
- **macOS:** `~/Library/Application Support/Code/User/prompts/`
- **Linux:** `~/.config/Code/User/prompts/`

### Custom Locations

Configure additional prompt folders in VS Code settings:

```json
{
  "chat.promptFilesLocations": [".github/prompts", "team-prompts", "/shared/company-prompts"]
}
```

---

## Invocation

### VS Code

Type `/promptName` in Copilot Chat:

```
/new-component
/code-review
/explain-code
```

### Visual Studio

Type `#promptName` in Copilot Chat:

```
#new-component
#code-review
```

### JetBrains

Access via Copilot Chat with `/` prefix (same as VS Code).

### Command Palette

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Copilot: Run Prompt"
3. Select prompt from list

---

## Tool Priority

When a prompt file specifies tools, this precedence applies:

1. **Prompt file–specified tools** (highest priority)
2. **Custom agent tools** (if agent specified)
3. **Default agent tools** (lowest priority)

**Note:** If a specified tool is not available, it is silently ignored.

---

## Best Practices

### Do

1. **Use descriptive names**

   ```yaml
   name: react-component-review    # Good
   name: review                     # Too generic
   ```

2. **Provide clear descriptions**

   ```yaml
   description: Review React component for performance, accessibility, and best practices
   ```

3. **Include input validation hints**

   ```markdown
   ${input:name:PascalCase component name, e.g., UserProfile}
   ```

4. **Structure output expectations**

   ```markdown
   ## Output Format

   - Summary (2-3 sentences)
   - Issues found (bulleted list)
   - Recommendations (numbered list)
   ```

5. **Reference related files**

   ```markdown
   Follow conventions from [AGENTS.md](../AGENTS.md)
   ```

6. **Specify appropriate tools**

   ```yaml
   # Read-only review
   tools: ["read", "search"]

   # Code generation
   tools: ["read", "edit", "search"]
   ```

### Avoid

1. **Vague prompts**

   ```markdown
   # Bad
   Review the code

   # Good
   Review the React component for:
   - Performance optimization
   - Accessibility compliance
   - Best practices adherence
   ```

2. **Hardcoded paths**

   ```markdown
   # Bad
   Check C:\Users\me\project\src\app.ts

   # Good
   Check the selected file
   ```

3. **Missing output structure**

   ```markdown
   # Bad
   Give me feedback

   # Good
   Provide feedback in this format:
   - Issue: [description]
   - Severity: [high/medium/low]
   - Fix: [code example]
   ```

4. **Overly complex single prompts**
   - Break into smaller, focused prompts
   - Chain prompts together for workflows

---

## Combining with Other Files

### With Custom Instructions

```
.github/
├── copilot-instructions.md       # Always-active conventions
├── instructions/
│   └── react.instructions.md     # Path-specific rules
└── prompts/
    └── new-component.prompt.md   # On-demand workflow
```

Prompt files automatically receive context from active instructions.

### With Custom Agents

Reference agents in prompt frontmatter:

```yaml
---
name: security-review
description: Security-focused code review
agent: '@security-agent'    # Uses custom agent
tools: ['read', 'search']
---
```

---

## Debugging Prompts

### Testing

1. Use VS Code editor preview (play button)
2. Check tool availability in chat
3. Verify input variables populate correctly

### Common Issues

| Issue                | Cause               | Solution                              |
| -------------------- | ------------------- | ------------------------------------- |
| Prompt not appearing | Wrong location      | Move to `.github/prompts/`            |
| Tools not working    | Tool not available  | Check tool name spelling              |
| Variables empty      | Wrong syntax        | Use `${input:name:hint}` format       |
| Model errors         | Model not available | Remove `model` or use available model |

---

## Sources

- [Prompt Files - GitHub Docs](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files)
- [Your First Prompt File - GitHub Docs](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file)
- [Use Prompt Files in VS Code](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [Awesome GitHub Copilot Repository](https://github.com/github/awesome-copilot)
- [Prompt Files vs Custom Instructions vs Custom Agents](https://gist.github.com/burkeholland/435ab18c549ddbefde1846165e8b2e08)
