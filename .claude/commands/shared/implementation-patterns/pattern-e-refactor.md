# Pattern E: Refactor (Moderate Complexity)

Refactor code with careful analysis and verification.

## Purpose

Restructure code while preserving behavior.

## When to Use

- Task says "refactor", "extract", "reorganize", or "restructure"
- Multiple files may be affected
- Behavior must remain unchanged
- Requires deeper analysis than simple patterns

## Complexity Note

This pattern is **moderate complexity** and may benefit from:

- **Sonnet 4.5**: Extended thinking (16K budget)
- **Opus 4.5**: Extended thinking (16K-32K budget)
- **Haiku 4.5**: Extended thinking (2K-4K budget) - use sparingly

## Steps

### Step 1: Load and Understand Context

```typescript
Read('[file-to-refactor]');
// Read related files if dependencies mentioned
Read('[related-file]');
```

### Step 2: Analyze Refactoring Scope

**Think through** (extended thinking if available):

1. What code is being moved/extracted?
2. What dependencies exist?
3. What tests need updating?
4. What imports need changing?
5. What's the minimal change to achieve the goal?

### Step 3: Plan Refactoring Steps

Create bounded plan (3-5 steps maximum):

```markdown
1. [Specific action 1] - e.g., Extract interface to new file
2. [Specific action 2] - e.g., Update imports in original file
3. [Specific action 3] - e.g., Update consuming files
4. [Verification step] - e.g., Run tests
```

### Step 4: Execute Steps Sequentially

```typescript
// Step 1: Extract
Write(
  file_path: "[new file]",
  content: "[extracted code]"
)

// Verify compilation
// npx tsc --noEmit

// Step 2: Update original
Edit(
  file_path: "[original file]",
  old_string: "[code to replace]",
  new_string: "[new code with import]"
)

// Verify compilation
// npx tsc --noEmit

// Step 3: Update consumers
Edit(
  file_path: "[consumer file]",
  old_string: "[old import]",
  new_string: "[new import]"
)

// Verify tests pass
// npm run test
```

### Step 5: Full Verification

```bash
npm run build
npm run test
npm run lint
```

## Success Criteria

- [ ] Refactoring complete per task description
- [ ] No behavior changes (tests prove this)
- [ ] TypeScript compilation succeeds
- [ ] All tests pass (same tests, same results)
- [ ] Linting passes
- [ ] No dead code left behind
- [ ] Imports updated correctly

## Common Refactoring Types

### Extract Method

```typescript
// Before: Inline code
doSomething() {
  // complex logic here
  const result = /* 10 lines of code */;
  return result;
}

// After: Extracted method
doSomething() {
  return this.#extractedLogic();
}

#extractedLogic() {
  // complex logic here
}
```

### Extract Interface

```typescript
// Before: Inline type
class MyClass {
  method(param: { name: string; value: number }) {}
}

// After: Extracted interface
interface MyParam {
  name: string;
  value: number;
}

class MyClass {
  method(param: MyParam) {}
}
```

### Move to Separate File

```typescript
// Before: All in one file
// my-component.ts
export class MyComponent { ... }
export interface MyInterface { ... }
export function myHelper() { ... }

// After: Split into files
// my-component.ts
import { MyInterface } from './my-interface';
import { myHelper } from './my-helper';
export class MyComponent { ... }

// my-interface.ts
export interface MyInterface { ... }

// my-helper.ts
export function myHelper() { ... }
```

### Simplify Conditional

```typescript
// Before: Complex conditional
if ((a && b && !c) || d) {
  doX();
} else if (!a && b) {
  doY();
}

// After: Extracted conditions
const shouldDoX = (a && b && !c) || d;
const shouldDoY = !a && b;

if (shouldDoX) {
  doX();
} else if (shouldDoY) {
  doY();
}
```

## Error Recovery

If refactoring breaks something:

1. **Identify the breaking change** - check test output
2. **Verify imports** - most common issue
3. **Check for missed usages** - grep for old references
4. **Consider rollback** - if too complex, revert and re-plan
5. **Incremental approach** - break into smaller steps

## Refactoring Principles

1. **Tests first** - Ensure tests exist before refactoring
2. **Small steps** - Make one change at a time
3. **Verify often** - Run tests after each step
4. **No behavior change** - Refactoring ≠ feature change
5. **Clean up after** - Remove dead code, update docs
