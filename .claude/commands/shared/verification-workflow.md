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

## Post-Commit Verification

Run immediately after each gap commit to ensure commit didn't break anything:

### Step 1: Re-run Full Test Suite

```bash
npm run test
```

**CRITICAL**: If tests fail after commit, the commit likely broke something.

**IF failures**:
- Fix the issue immediately
- Create a follow-up commit: `fix([component]): resolve post-commit verification failure for GAP-[N]`
- Re-run verification
- Only proceed when all tests pass

### Step 2: Re-run Linter

```bash
npm run lint
```

**IF errors**:
- Fix linting issues immediately
- Create a follow-up commit with fixes
- Re-run lint
- Only proceed when linting is clean

### Step 3: Re-run Build

```bash
npm run build
```

**IF build fails**:
- Fix compilation errors immediately
- Create a follow-up commit with fixes
- Re-run build
- Only proceed when build succeeds

### Step 4: Run E2E Tests (if gap requires it)

Run E2E tests if the gap affects:
- Deep linking (History API integration)
- Keyboard navigation
- Responsive behaviors
- Browser-specific features

```bash
npm run e2e -- [component-name]
```

**IF failures**:
- Fix E2E issues immediately
- Create a follow-up commit with fixes
- Re-run E2E tests
- Only proceed when E2E tests pass

### Step 5: Run Accessibility Tests

Run Storybook accessibility tests:

```bash
npx nx test-storybook ngx-foundation-sites --story="[Component]--*"
```

**IF violations**:
- Fix accessibility issues immediately
- Create a follow-up commit with fixes
- Re-run accessibility tests
- Only proceed when accessibility is clean

### Post-Commit Verification Checkpoint

After post-commit verification:

```markdown
✅ Post-commit verification complete!

- Tests: [X] passing (no regressions)
- Linting: ✅ Clean
- Build: ✅ Successful
- E2E: ✅ Passing (if applicable)
- Accessibility: ✅ No violations

Safe to proceed to next gap.
```

---

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
✅ E2E tests passing (if applicable)
✅ No TypeScript compilation errors
✅ No accessibility violations
✅ Post-commit verification passing (for gap remediation workflows)
