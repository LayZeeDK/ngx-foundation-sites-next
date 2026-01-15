# Verification Workflow

Standard verification steps used across all implementation commands.

## Integration Verification Phase

Run after completing implementation tasks:

### Step 1: Run Full Test Suite

```bash
npm run test
```

**IF failures**:

- Fix issues before proceeding
- Do NOT mark verification complete if tests fail
- Re-run until all tests pass

### Step 2: Run Linter

```bash
npm run lint
```

**IF errors**:

- Fix linting issues before proceeding
- Common fixes: import order, unused variables, formatting

### Step 3: Run Build

```bash
npm run build
```

**IF build fails**:

- Fix compilation errors before proceeding
- Check for TypeScript type errors
- Verify all imports resolve correctly

### Step 4: Run Storybook Tests (if applicable)

```bash
npx nx test-storybook ngx-foundation-sites
```

**IF failures**:

- Check play function assertions
- Verify component renders correctly
- Fix accessibility violations

## Per-Task Verification

Run after each individual task (not just at end):

### TypeScript Compilation Check

```bash
npx tsc --noEmit --project packages/ngx-foundation-sites/tsconfig.lib.json
```

### Component-Specific Tests

```bash
npm run test -- [component-name]
```

### Storybook Story Tests

```bash
npx nx test-storybook ngx-foundation-sites --story="[StoryName]"
```

## Verification Checkpoint Template

After verification, report status:

```markdown
✅ Verification complete!

- Tests: [X passing]
- Linting: ✅ Clean
- Build: ✅ Successful
- Integration: ✅ No issues detected

Ready for completion phase.
```

## Failure Response Protocol

### On Test Failure

```markdown
❌ Tests failed: [N] failing after [Task ID]

Failure 1: [Expected] but got [Actual]
Location: [file]::[line]

Fix: [Description of fix]
✅ Fixed - rerunning tests
✅ All tests passing ([X]/[X])
```

### On Compilation Failure

```markdown
❌ Compilation failed after implementing [Task ID]

Error: [TypeScript error message]
Location: [file]::[line]

Fix: [Description of fix]
✅ Fixed - recompiling
✅ Compilation successful
```

### On Linting Failure

```markdown
❌ Linting failed: [N] errors

Error: [Lint rule violation]
Location: [file]::[line]

Fix: [Description of fix]
✅ Fixed - relinting
✅ Linting clean
```

## Success Criteria

All of the following must be true before marking verification complete:

✅ All tests passing (npm run test)
✅ Linting clean (npm run lint)
✅ Build successful (npm run build)
✅ Storybook tests passing (if applicable)
✅ No TypeScript compilation errors
✅ No accessibility violations
