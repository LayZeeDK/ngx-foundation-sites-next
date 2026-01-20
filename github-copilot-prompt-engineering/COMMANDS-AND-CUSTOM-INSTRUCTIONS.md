# GitHub Copilot Commands and Custom Instructions

**Last Updated:** 2026-01-20

This document provides optimization strategies for GitHub Copilot slash commands and custom instructions, including built-in commands, custom prompt files, and integration patterns.

---

## Slash Commands Overview

### Purpose

Slash commands help you avoid writing complex prompts for common scenarios. You simply type `/` in the chat prompt box, followed by the command name.

**Benefits:**

- **Shortcut syntax** - No need for verbose prompts
- **Intent-specific actions** - Trigger specialized AI behaviors
- **Discoverability** - Type `/` to see available commands
- **Consistency** - Same command produces predictable results

---

## Built-in Slash Commands

### Core Commands

GitHub Copilot includes several powerful built-in commands:

#### 1. `/optimize`

**Purpose:** Analyzes code and proposes optimizations

**Use Cases:**
- Performance improvements
- Reducing lines of code
- Algorithmic efficiency
- Memory optimization

**Example:**

```typescript
// Select this code and run /optimize
function findUser(users: User[], id: number): User | undefined {
  let result = undefined;
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      result = users[i];
      break;
    }
  }
  return result;
}

// Copilot suggests:
// "Use Array.find() for cleaner, more performant lookup"
const findUser = (users: User[], id: number) => users.find((u) => u.id === id);
```

**Best Practice:** Use `/optimize` after implementing features to identify improvement opportunities.

#### 2. `/tests`

**Purpose:** Creates unit tests for selected code

**Use Cases:**
- Generate test boilerplate
- Cover edge cases
- Achieve coverage goals
- Regression testing

**Example:**

```typescript
// Select function and run /tests
export function calculateDiscount(price: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0 and 100');
  }
  return price * (1 - discountPercent / 100);
}

// Copilot generates:
describe('calculateDiscount', () => {
  it('applies discount correctly', () => {
    expect(calculateDiscount(100, 10)).toBe(90);
  });

  it('throws error for negative discount', () => {
    expect(() => calculateDiscount(100, -5)).toThrow();
  });

  it('throws error for discount over 100', () => {
    expect(() => calculateDiscount(100, 150)).toThrow();
  });
});
```

**Best Practice:** Run `/tests` immediately after writing new functions to ensure comprehensive coverage.

#### 3. `/fix`

**Purpose:** Automatically suggests corrections for errors

**Use Cases:**
- Typo correction
- Type errors
- Logic bugs
- Syntax fixes

**Example:**

```typescript
// Code with error
function getUserNmae(user: User): string {
  return user.name;
}

// Run /fix, Copilot suggests:
// "Typo: 'getUserNmae' → 'getUserName'"
function getUserName(user: User): string {
  return user.name;
}
```

**Best Practice:** Use `/fix` as first response to compiler errors before manual debugging.

#### 4. `/explain`

**Purpose:** Provides detailed code explanations

**Use Cases:**
- Understanding unfamiliar code
- Onboarding documentation
- Code review context
- Learning complex algorithms

**Example:**

```typescript
// Select code and run /explain
const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Copilot explains:
// "This is a memoization higher-order function that caches function results.
// It takes a function 'fn', creates a Map for caching, and returns a wrapper
// that checks the cache before calling the original function. Arguments are
// serialized as JSON for the cache key..."
```

**Best Practice:** Use `/explain` when reviewing PRs to understand implementation choices.

#### 5. `/doc`

**Purpose:** Generates documentation for code

**Use Cases:**
- API documentation
- JSDoc comments
- README sections
- Usage examples

**Example:**

```typescript
// Select function and run /doc
export function retry<T>(fn: () => Promise<T>, maxAttempts: number = 3, delay: number = 1000): Promise<T> {
  return fn().catch((err) => {
    if (maxAttempts <= 1) throw err;
    return new Promise((resolve) => setTimeout(() => resolve(retry(fn, maxAttempts - 1, delay)), delay));
  });
}

// Copilot generates:
/**
 * Retries a promise-returning function with exponential backoff.
 *
 * @template T - The return type of the function
 * @param {() => Promise<T>} fn - The async function to retry
 * @param {number} [maxAttempts=3] - Maximum number of retry attempts
 * @param {number} [delay=1000] - Delay in milliseconds between retries
 * @returns {Promise<T>} A promise that resolves with the function result
 * @throws {Error} Throws the last error if all retries fail
 *
 * @example
 * const data = await retry(() => fetchUserData(userId), 5, 2000);
 */
```

**Best Practice:** Run `/doc` before committing to ensure all public APIs are documented.

---

## Custom Slash Commands

### Creating Custom Commands

GitHub Copilot supports custom commands through multiple mechanisms.

#### 1. Custom Prompt Files

**Location:** `.github/prompts/` directory in repository root

**Format:** `*.prompt.md` files

**Structure:**

```markdown
---
name: component-review
description: Review component for best practices
---

# Component Review Prompt

Analyze the selected component for:

1. **Code Quality**
   - Follows project style guide
   - Uses appropriate patterns
   - Proper error handling

2. **Performance**
   - Efficient algorithms
   - Unnecessary re-renders avoided
   - Memory leaks prevented

3. **Accessibility**
   - ARIA attributes present
   - Keyboard navigation support
   - Semantic HTML usage

4. **Testing**
   - Unit test coverage
   - Integration test scenarios
   - Edge cases handled

Provide specific recommendations with code examples.
```

**Usage:** Type `/component-review` in Copilot Chat

**Optimization:** Create prompt files for repeated code review patterns specific to your project.

#### 2. Custom Instructions File

**Location:** `.github/copilot-instructions.md` in repository root

**Purpose:** Provide project-wide context and conventions to Copilot

**Example:**

```markdown
# Copilot Instructions for MyProject

## Project Overview
React component library implementing a design system.

## Code Conventions

### Components
- Use functional components with hooks
- Use TypeScript strict mode
- Prefer composition over inheritance

### Testing
- Write Jest tests alongside implementation
- Use React Testing Library for component tests
- Achieve minimum 80% coverage

### Accessibility
- Follow WCAG 2.1 AA guidelines
- Include ARIA attributes where needed
- Support keyboard navigation

### Styling
- Use CSS Modules or styled-components
- Follow BEM naming convention
- Document any custom styles

## File Structure
- Components: `src/components/[component]/`
- Tests: `*.test.tsx` in same directory as component
- Stories: `*.stories.tsx` in same directory as component

## Common Commands
- `npm test` - Run tests
- `npm run storybook` - Start Storybook
- `npm run lint` - Check code style
```

**Activation:** Enable in VS Code via `Tools > Options > GitHub Copilot > Custom Instructions`

**Optimization:** Keep instructions focused on project-specific patterns that Copilot can't infer from code alone.

#### 3. VS Code Extension Support

**Mechanism:** GitHub Copilot VS Code extension reads `.github/prompts/*.prompt.md` files

**Discovery:** Custom commands appear in slash command autocomplete

**Example Directory:**

```
.github/prompts/
├── component-review.prompt.md
├── api-security.prompt.md
├── performance-audit.prompt.md
└── test-coverage.prompt.md
```

**Usage:**
- Type `/` in Copilot Chat
- See custom commands in autocomplete list
- Select command to invoke

**Optimization:** Name files descriptively for easy discovery in autocomplete.

---

## Advanced Command Patterns

### 1. Context-Aware Commands

**Pattern:** Commands that adapt to current file type

**Example:**

```markdown
---
name: review
description: Context-aware code review
---

# Smart Review Command

## If file is *.component.ts:
- Check component best practices
- Verify change detection strategy
- Review template bindings

## If file is *.service.ts:
- Check dependency injection patterns
- Verify singleton vs scoped providers
- Review error handling

## If file is *.spec.ts:
- Check test coverage completeness
- Verify mock usage
- Review assertion quality

## If file is *.stories.ts:
- Check story variants coverage
- Verify play function interactions
- Review accessibility tests
```

**Optimization:** Single command adapts to context, reducing command proliferation.

### 2. Multi-Step Workflow Commands

**Pattern:** Commands that execute sequential steps

**Example:**

```markdown
---
name: feature-complete
description: Complete feature implementation checklist
---

# Feature Completion Workflow

Execute these steps in order:

## Step 1: Implementation
- [ ] Feature code complete
- [ ] Follows project conventions
- [ ] No TypeScript errors

## Step 2: Testing
- [ ] Unit tests written and passing
- [ ] Story with interactions
- [ ] E2E test if needed

## Step 3: Documentation
- [ ] JSDoc comments added
- [ ] README updated if needed
- [ ] CHANGELOG entry added

## Step 4: Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Run formatter: `npm run format`
- [ ] Run type check: `tsc --noEmit`

## Step 5: Review
- [ ] Self-review changes
- [ ] Check for console.logs
- [ ] Verify no dead code

Report completion status for each step.
```

**Optimization:** Ensures no steps are missed in complex workflows.

### 3. Template-Based Generation Commands

**Pattern:** Commands that generate code from templates

**Example:**

````markdown
---
name: new-component
description: Generate component with boilerplate
---

# Component Generator

Create a new component with the following structure:

## 1. Component File

```typescript
import { useState } from 'react';

interface {{ComponentName}}Props {
  // Props here
}

export function {{ComponentName}}({ ...props }: {{ComponentName}}Props) {
  return (
    <div className="{{kebab-name}}">
      {/* Component content */}
    </div>
  );
}
```

## 2. Test File

```typescript
import { render, screen } from '@testing-library/react';
import { {{ComponentName}} } from './{{ComponentName}}';

describe('{{ComponentName}}', () => {
  it('renders correctly', () => {
    render(<{{ComponentName}} />);
    // Add assertions
  });
});
```

## 3. Story File

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { {{ComponentName}} } from './{{ComponentName}}';

const meta: Meta<typeof {{ComponentName}}> = {
  title: 'Components/{{ComponentName}}',
  component: {{ComponentName}},
};

export default meta;
```

## Variables to populate:
- `{{ComponentName}}` - PascalCase name
- `{{kebab-name}}` - kebab-case name
- `{{description}}` - Brief description

Ask user for these values before generating.
````

**Optimization:** Consistent code generation reduces boilerplate errors.

---

## Current Limitations

### Copilot CLI

**LIMITATION - NOT YET AVAILABLE**

As of January 2026, the GitHub Copilot CLI **only supports built-in commands**.

- Built-in: `/optimize`, `/tests`, `/fix`, `/explain`, `/doc`
- Custom: `.github/prompts/*.prompt.md` files **not recognized** in CLI

**Feature Request:** Track GitHub issues for support for custom commands in CLI

**Workaround:** Use VS Code extension for custom commands, or copy prompt content into CLI manually

**Status:** Under active development; check GitHub Changelog for updates.

---

## Integration with Custom Instructions

### Layered Configuration

Custom commands work best when combined with custom instructions:

**Layer 1: Custom Instructions** (`.github/copilot-instructions.md`)
- Project-wide conventions
- Architectural patterns
- Code style guidelines

**Layer 2: Custom Commands** (`.github/prompts/*.prompt.md`)
- Specific workflows
- Repeated review patterns
- Code generation templates

**Example Interaction:**

```markdown
# Custom Instructions (always active)
- Use TypeScript strict mode
- Prefer functional components
- Follow design system patterns

# Custom Command /new-component (invoked explicitly)
Generate component using:
1. Custom instructions above (automatically applied)
2. Component template structure
3. Design system integration
4. Story with interactions
```

**Optimization:** Instructions provide context; commands provide action. Together they create consistent, project-specific output.

---

## Command Composition

### Chaining Commands

**Pattern:** Execute multiple commands in sequence

**Example Workflow:**

```
1. Implement feature
   ↓
2. Run /tests to generate tests
   ↓
3. Run /doc to generate documentation
   ↓
4. Run /optimize to refine implementation
   ↓
5. Run /component-review (custom) for final check
```

**Optimization:** Create a custom command that chains these automatically:

```markdown
---
name: complete-feature
description: Full feature implementation workflow
---

# Complete Feature Workflow

Execute the following Copilot commands in sequence:

1. **/tests** - Generate comprehensive tests
2. **/doc** - Add JSDoc documentation
3. **/optimize** - Identify performance improvements
4. **/component-review** - Run project-specific review

After each step, wait for user approval before proceeding.
```

---

## Best Practices

### Do

1. **Name Commands Clearly**

   ```
   Good: /component-review
   Good: /api-security-audit
   Bad:  /cr
   Bad:  /check
   ```

2. **Provide Context in Prompts**

   ```markdown
   # Good
   Review this component for:
   - Change detection strategy (should be OnPush)
   - State management (prefer signals)
   - Accessibility (must pass AXE checks)

   # Bad
   Review this component
   ```

3. **Use Structured Output**

   ```markdown
   Provide output in this format:

   ## Issues Found
   - [Issue 1 with severity]
   - [Issue 2 with severity]

   ## Recommendations
   1. [Recommendation with code example]
   2. [Recommendation with code example]

   ## Summary
   [Overall assessment]
   ```

4. **Include Examples**

   ```markdown
   Generate component following this pattern:

   ```typescript
   export function ExampleComponent({ label }: Props) {
     return <button>{label}</button>;
   }
   ```

5. **Version Your Commands**
   ```markdown
   ---
   name: component-review
   version: 2.1.0
   updated: 2026-01-20
   ---
   ```

### Avoid

1. **Vague Command Names**
   - `/do-stuff`, `/fix-it`, `/check`

2. **Overly Complex Single Commands**
   - Break into smaller, focused commands

3. **Hardcoded Paths**

   ```markdown
   Bad:  Check file at C:\Users\me\project\src\app.ts
   Good: Check the selected file
   ```

4. **Assuming Context**

   ```markdown
   Bad:  Review for best practices
   Good: Review for React best practices including:
         - Functional components
         - Hooks usage
         - Accessibility
   ```

5. **No Output Structure**
   - Always specify desired output format

---

## Measuring Command Effectiveness

### Key Metrics

1. **Usage Frequency** - How often is command invoked?
2. **Output Quality** - Does output meet expectations?
3. **Time Savings** - Manual time vs command time
4. **Consistency** - Similar inputs produce similar outputs?
5. **Adoption Rate** - % of team using custom commands

### Optimization Loop

```
1. Create custom command
   ↓
2. Team uses command
   ↓
3. Gather feedback on output quality
   ↓
4. Identify improvement areas
   ↓
5. Refine command prompt
   ↓
6. Deploy updated version
   ↓
(repeat)
```

---

## Future Developments

### Roadmap (2026+)

**Expected Features:**

1. **CLI Custom Command Support** - `.github/prompts/` support in Copilot CLI
2. **Command Marketplace** - Share and install community commands
3. **Conditional Commands** - Commands that adapt based on project context
4. **Command Analytics** - Built-in tracking of command usage and effectiveness
5. **AI-Suggested Commands** - Copilot recommends creating commands for repeated patterns

**Status:** Features under active development; check [GitHub Changelog](https://github.blog/changelog/) for updates

---

## Sources

- [Custom slash commands for Copilot Chat - GitHub Community](https://github.com/orgs/community/discussions/74564)
- [Mastering Slash Commands with GitHub Copilot in Visual Studio](https://devblogs.microsoft.com/visualstudio/mastering-slash-commands-with-github-copilot-in-visual-studio/)
- [GitHub Copilot Chat cheat sheet - GitHub Docs](https://docs.github.com/en/copilot/reference/cheat-sheet)
- [Slash Commands in Depth - KodeKloud Notes](https://notes.kodekloud.com/docs/GitHub-Copilot-Certification/Advanced-Features/Slash-Commands-in-Depth)
- [Quickstart: Use GitHub Copilot Slash Commands - Microsoft Learn](https://learn.microsoft.com/en-us/sql/tools/visual-studio-code-extensions/github-copilot/slash-commands)
- [Customize chat responses - Visual Studio](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context)
- [GitHub Copilot: Unlocking Power with Slash Commands](https://medium.com/@sachin.kondana/github-copilot-unlocking-power-with-slash-commands-participants-1c106315335d)
