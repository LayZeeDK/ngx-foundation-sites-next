# Error Handling Patterns

Standard error handling patterns used across implementation commands.

## Compilation Errors

### Detection

```bash
npx tsc --noEmit --project [tsconfig-path]
```

### Response Template

```markdown
❌ Compilation failed after implementing [Task ID]

Error: [TypeScript error message]
Location: [file]::[line]

Fix: [Description of adjustment]
✅ Fixed - recompiling
✅ Compilation successful
```

### Common Compilation Errors

| Error                                                             | Cause                  | Fix                             |
| ----------------------------------------------------------------- | ---------------------- | ------------------------------- |
| `Type 'X' is not assignable to type 'Y'`                          | Type mismatch          | Adjust type annotation or value |
| `Property 'X' does not exist on type 'Y'`                         | Missing property       | Add property or check interface |
| `Cannot find module 'X'`                                          | Missing import         | Add import statement            |
| `Argument of type 'X' is not assignable to parameter of type 'Y'` | Function call mismatch | Adjust argument type            |

### Action

- Fix immediately
- Do NOT continue to next task until compilation succeeds
- Re-run verification after fix

---

## Test Failures

### Detection

```bash
npm run test -- [component-name]
```

### Response Template

```markdown
❌ Tests failed: [N] failing after [Task ID]

Failure 1: Expected [expected] but got [actual]
Location: [test-file]::[line]

Fix: [Description of fix - signal not updating, edge case missed, etc.]
✅ Fixed - rerunning tests
✅ All tests passing ([X]/[X])
```

### Common Test Failures

| Pattern                           | Cause                | Fix                                   |
| --------------------------------- | -------------------- | ------------------------------------- |
| `Expected 'true' but got 'false'` | State not updated    | Check signal.set() or signal.update() |
| `Expected aria-expanded="true"`   | ARIA attribute wrong | Verify attribute binding              |
| `Unable to find role="button"`    | Element not rendered | Check @if conditions or template      |
| `Timeout waiting for element`     | Async timing         | Add await or increase timeout         |

### Action

- Debug and fix before marking task complete
- Never mark a task as completed if tests fail
- Re-run full test suite after fix

---

## Linting Errors

### Detection

```bash
npm run lint
```

### Response Template

```markdown
❌ Linting failed: [N] errors

Error: [Lint rule - e.g., "Prefer using @if instead of *ngIf"]
Location: [file]::[line]

Fix: [Description of fix]
✅ Fixed - relinting
✅ Linting clean
```

### Common Lint Errors

| Rule                                  | Fix                               |
| ------------------------------------- | --------------------------------- |
| `Prefer using @if instead of *ngIf`   | Replace `*ngIf` with `@if`        |
| `Prefer using @for instead of *ngFor` | Replace `*ngFor` with `@for`      |
| `Unused variable`                     | Remove or use the variable        |
| `Missing explicit return type`        | Add return type annotation        |
| `Import order violation`              | Reorder imports per ESLint config |

### Action

- Fix all linting issues before proceeding to commit
- Common fixes are mechanical - apply immediately

---

## Build Failures

### Detection

```bash
npm run build
```

### Response Template

```markdown
❌ Build failed

Error: [Build error message]
Location: [file or build step]

Analysis:

1. [Check 1]
2. [Check 2]
3. [Root cause identified]

Fix: [Description of fix]
✅ Fixed - rebuilding
✅ Build successful
```

### Common Build Failures

| Error Type             | Cause                  | Fix                     |
| ---------------------- | ---------------------- | ----------------------- |
| TypeScript compilation | Type errors            | Fix type annotations    |
| Missing exports        | Public API incomplete  | Add to index.ts         |
| Circular dependency    | Import cycle           | Refactor to break cycle |
| Asset not found        | Missing file reference | Check paths             |

---

## Verification Failures

### Detection

```bash
grep -r "[pattern]" [directory]
# Should return nothing if replacement complete
```

### Response Template

```markdown
❌ Verification failed: grep found '[pattern]'

Location: [file]::[line] (in [context - code/comment/string])

Fix: [Description - e.g., "Updated comment reference"]
✅ Verification passing
```

---

## Parallel Task Error Handling

For tasks marked `[P]` (parallel execution):

### Strategy

1. **Run parallel tasks simultaneously** - Multiple tasks execute in same phase
2. **IF one task fails**:
   - ✅ Continue with successful parallel tasks
   - ❌ Do NOT halt entire phase
   - 📋 Report failed task with error context
3. **After parallel batch completes**:
   - Summarize successful tasks (marked `[X]`)
   - List failed tasks with failure reasons
   - Suggest fixes or next steps
4. **Sequential tasks**: Failure still halts execution (unchanged)

### Example Output

```markdown
Phase 2: Tests (3 parallel tasks)
✅ T2.1: Unit tests - PASSED
❌ T2.2: Integration tests - FAILED (import error)
✅ T2.3: E2E tests - PASSED

Status: 2/3 complete, proceeding to Phase 3
Deferred: T2.2 needs import path fix
```

---

## Recovery Procedures

### If State Becomes Inconsistent

1. **Check git status** - identify modified files
2. **Run verification suite** - identify what's broken
3. **Fix issues** - address each failure
4. **Re-run verification** - confirm recovery
5. **Resume from last successful task**

### If Tests Cannot Pass

1. **Stop implementation** - do not proceed
2. **Report blocker to user** - explain what's failing
3. **Suggest options**:
   - Fix the failing test
   - Skip the task (if P2/optional)
   - Investigate further
4. **Wait for user decision** before continuing

### If Build Breaks Completely

1. **Check recent changes** - what was modified?
2. **Revert if necessary** - `git checkout [file]` for specific files
3. **Rebuild incrementally** - verify each step
4. **Document the issue** - for future reference
