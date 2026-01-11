# GitHub Copilot Commands Optimizations

**Last Updated:** 2026-01-11

This document provides optimization strategies for GitHub Copilot slash commands and custom commands, including built-in commands, custom prompt files, and integration patterns.

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

Analyze the selected Angular component for:

1. **Code Quality**
   - Follows Angular style guide
   - Uses appropriate lifecycle hooks
   - Proper dependency injection

2. **Performance**
   - Change detection strategy
   - OnPush compatibility
   - Unnecessary re-renders

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
# Copilot Instructions for ngx-foundation-sites

## Project Overview

Angular component library implementing Foundation for Sites design system.

## Code Conventions

### Components

- Use standalone components (no NgModules)
- Prefix: `nfs-` for components, `nfs` for directives
- Change detection: OnPush
- Use signals for state management

### Testing

- Write Storybook stories with play functions (preferred)
- Use Playwright for e2e tests
- Vitest for unit tests (rare)

### Accessibility

- Follow @angular/aria patterns
- Use @angular/cdk when ARIA insufficient
- All components must pass AXE checks

### Styling

- Use Foundation CSS classes directly
- Avoid custom CSS unless necessary
- Document any custom styles with comments

## File Structure

- Components: `packages/ngx-foundation-sites/src/lib/[component]/`
- Tests: `*.spec.ts` for unit, `*.e2e.ts` for Playwright
- Stories: `*.stories.ts` in same directory as component

## Common Commands

- `npx nx test ngx-foundation-sites` - Run tests
- `npx nx storybook ngx-foundation-sites` - Start Storybook
- `npm run format` - Format code
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

## If file is \*.component.ts:

- Check Angular component best practices
- Verify change detection strategy
- Review template bindings

## If file is \*.service.ts:

- Check dependency injection patterns
- Verify singleton vs scoped providers
- Review error handling

## If file is \*.spec.ts:

- Check test coverage completeness
- Verify mock usage
- Review assertion quality

## If file is \*.stories.ts:

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
- [ ] Storybook story with interactions
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
name: new-directive
description: Generate Angular directive with boilerplate
---

# Directive Generator

Create a new Angular directive with the following structure:

## 1. Directive File

```typescript
import { Directive, input, HostBinding } from '@angular/core';

@Directive({
  selector: '[nfs{{DirectiveName}}]'
})
export class Nfs{{DirectiveName}}Directive {
  // Inputs
  variant = input<'primary' | 'secondary'>('primary');

  // Host bindings
  @HostBinding('class') get hostClasses(): string {
    return `nfs-{{kebab-name}} nfs-{{kebab-name}}--${this.variant()}`;
  }
}
```
````

## 2. Test File

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Nfs{{DirectiveName}}Directive } from './{{kebab-name}}.directive';

@Component({
  template: `<div [nfs{{DirectiveName}}]="variant"></div>`
})
class TestComponent {
  variant = 'primary';
}

describe('Nfs{{DirectiveName}}Directive', () => {
  // Test implementation
});
```

## 3. Story File

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { Nfs{{DirectiveName}}Directive } from './{{kebab-name}}.directive';

const meta: Meta<Nfs{{DirectiveName}}Directive> = {
  title: 'Directives/{{DirectiveName}}',
  component: Nfs{{DirectiveName}}Directive,
};

export default meta;
```

## Variables to populate:

- `{{DirectiveName}}` - PascalCase name
- `{{kebab-name}}` - kebab-case name
- `{{description}}` - Brief description

Ask user for these values before generating.

````

**Optimization:** Consistent code generation reduces boilerplate errors.

---

## Current Limitations

### Copilot CLI

**⚠️ LIMITATION - NOT YET AVAILABLE**

As of January 2026, the GitHub Copilot CLI **only supports built-in commands**.

- ✅ Built-in: `/optimize`, `/tests`, `/fix`, `/explain`, `/doc`
- ❌ Custom: `.github/prompts/*.prompt.md` files **not recognized** in CLI

**Feature Request:** [Issue #618](https://github.com/github/copilot-cli/issues/618) tracks support for custom commands in CLI

**Workaround:** Use VS Code extension for custom commands, or copy prompt content into CLI manually

**Status:** Under active development; **do not rely on this feature** until officially released. Check GitHub Changelog for updates.

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
- Use signals for state management
- Prefer standalone components
- Follow Foundation CSS classes

# Custom Command /new-component (invoked explicitly)
Generate component using:
1. Custom instructions above (automatically applied)
2. Component template structure
3. Foundation CSS integration
4. Storybook story with interactions
````

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

### ✅ Do

1. **Name Commands Clearly**

   ```
   ✅ /component-review
   ✅ /api-security-audit
   ❌ /cr
   ❌ /check
   ```

2. **Provide Context in Prompts**

   ```markdown
   # Good

   Review this Angular component for:

   - Change detection strategy (should be OnPush)
   - Signal usage (prefer signals over RxJS for local state)
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

   \`\`\`typescript
   @Component({
   selector: 'nfs-example',
   template: '<button>{{label()}}</button>',
   changeDetection: ChangeDetectionStrategy.OnPush
   })
   export class ExampleComponent {
   label = input.required<string>();
   }
   \`\`\`
   ```

5. **Version Your Commands**
   ```markdown
   ---
   name: component-review
   version: 2.1.0
   updated: 2026-01-11
   ---
   ```

### ❌ Avoid

1. **Vague Command Names**
   - `/do-stuff`, `/fix-it`, `/check`

2. **Overly Complex Single Commands**
   - Break into smaller, focused commands

3. **Hardcoded Paths**

   ```markdown
   ❌ Check file at C:\Users\me\project\src\app.ts
   ✅ Check the selected file
   ```

4. **Assuming Context**

   ```markdown
   ❌ Review for best practices
   ✅ Review for Angular best practices including:

   - OnPush change detection
   - Signal-based state
   - ARIA compliance
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

**Example Tracking:**

```markdown
## Command Performance Report

### /component-review

- **Invocations:** 127 (last 30 days)
- **Satisfaction:** 4.2/5.0
- **Time Saved:** ~15 min per review × 127 = 31.75 hours
- **Common Issues:**
  - Sometimes misses accessibility checks (v2.1.0 addressed)
  - Doesn't check for Foundation CSS class usage (v2.2.0 will add)

### Planned Improvements

- [ ] Add Foundation CSS class verification
- [ ] Include performance benchmarking suggestions
- [ ] Check for proper signal usage patterns
```

---

## Community Resources

### Custom Command Collections

1. **GitHub Community Discussions**
   - [Custom slash commands for Copilot Chat](https://github.com/orgs/community/discussions/74564)
   - Share and discover community-contributed commands

2. **Microsoft Learn Documentation**
   - [Mastering Slash Commands](https://devblogs.microsoft.com/visualstudio/mastering-slash-commands-with-github-copilot-in-visual-studio/)
   - Official best practices and examples

3. **GitHub Copilot Extensions**
   - Third-party extensions with additional commands
   - Check VS Code Marketplace for Copilot command packs

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
- [Feature Request: Support custom slash commands from .github/prompts directory](https://github.com/github/copilot-cli/issues/618)
