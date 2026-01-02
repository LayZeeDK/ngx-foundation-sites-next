# Phase 5: Testing & Documentation

## 5.1 Unit Tests ✅

**Files:**

- `packages/ngx-foundation-sites/src/lib/accordion/accordion.spec.ts` (33 tests)
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-deep-link.service.spec.ts` (15 tests)

Test cases:

- Single expand mode closes previous panel
- Multi-expand mode keeps panels open
- Disabled panels cannot be toggled
- Initially expanded panels render content
- Deep linking activates correct panel
- Keyboard navigation works correctly

**Implementation Notes:**

1. **Vitest Browser mode**: Configured with Playwright (Chromium) because jsdom doesn't support modern CSS (`@starting-style`, `:has()`) used by the accordion component

2. **Zoneless testing**: Uses `provideZonelessChangeDetection()` and `fixture.whenStable()` instead of `fakeAsync`/`tick` (zone-testing.js not available in Vitest)

3. **Keyboard events for triggers**: Angular ARIA's AccordionTrigger doesn't respond to native `.click()` in tests; uses `KeyboardEvent('keydown', { key: 'Enter' })` instead

4. **afterNextRender behavior**: Deep link initialization tests require creating fixture with `deepLink=true` before first render (afterNextRender only runs once)

5. **Edge case coverage**: Added tests for allowAllClosed enforcement, slideSpeed CSS property, expansion state tracking, and service error handling

## 5.2 Accessibility Tests ✅

**Files:**

- `packages/ngx-foundation-sites/.storybook/main.ts` - Addon registration
- `packages/ngx-foundation-sites/.storybook/preview.ts` - AXE configuration
- `packages/ngx-foundation-sites/.storybook/tsconfig.json` - TypeScript configuration for Compodoc
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts` - Accessibility stories
- `packages/ngx-foundation-sites/src/lib/_foundation-settings.scss` - WCAG AA color palette
- `packages/ngx-foundation-sites/src/lib/_foundation-components.scss` - Consolidated palette import

**Test coverage:**

- ✅ Verify ARIA attributes (aria-expanded, aria-controls, aria-labelledby, aria-disabled)
- ✅ Verify `role="region"` on accordion panels
- ✅ Test with AXE in Storybook (@storybook/addon-a11y)
- ✅ Programmatic AXE checks in CI via `test: 'error'`
- ✅ Verify focus management with disabled items
- ✅ WCAG 2.0 A/AA and 2.1 A/AA compliance

**Stories added:**

| Story                         | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `Accessibility`               | ARIA attribute verification        |
| `FocusManagementWithDisabled` | Focus behavior with disabled items |

**Implementation Notes:**

1. **@storybook/addon-a11y**: Configured AXE-based accessibility testing with WCAG rules. Disabled landmark rules not applicable to isolated components (`landmark-one-main`, `page-has-heading-one`, `region`).

2. **@storybook/addon-docs with Compodoc**: Added documentation addon for autodocs generation:
   - Added `@storybook/addon-docs` to `main.ts` addons array
   - Added `tags: ['autodocs']` to `preview.ts` for automatic documentation
   - Configured `setCompodocJson()` in `preview.ts` for Angular component documentation
   - Added `component: NfsAccordion` to story meta for Compodoc integration
   - Configured Compodoc with `-p packages/ngx-foundation-sites/tsconfig.lib.json` in `project.json`
   - Added `resolveJsonModule: true` to `.storybook/tsconfig.json` for JSON import

3. **Programmatic AXE checks in CI**: Added `test: 'error'` to `parameters.a11y` in `preview.ts`:
   - When `test-storybook` runs, axe-core checks are automatically executed for each story
   - Violations cause test failures (CI will fail)
   - No additional dependencies (axe-playwright) or configuration files needed
   - Uses the same WCAG rules configured in `parameters.a11y.config`

4. **WCAG AA color compliance**: Foundation's default primary color (#1779ba) failed contrast requirements (3.75:1). Updated to WCAG AA compliant palette using Sass module configuration (`@use ... with`):
   - primary: #0d5a89 (4.5:1 contrast ratio)
   - secondary: #595959
   - success: #1a7f3e
   - warning: #8a6500
   - alert: #a33a2a

5. **Color palette consolidation**: Eliminated duplicate palette definitions by having `_foundation-components.scss` import from `_foundation-settings.scss`:

   ```scss
   @use './foundation-settings' as settings;
   @use 'foundation-sites/scss/foundation' with (
     $foundation-palette: settings.$foundation-palette
   );
   ```

6. **Angular ARIA focus behavior**: Unlike Foundation's JavaScript, Angular ARIA allows disabled items to receive focus (for screen reader announcement) but prevents activation. This is correct WCAG behavior - tests verify:
   - Arrow keys move focus through ALL items including disabled
   - Click, Enter, and Space do NOT activate disabled items
   - `aria-disabled="true"` is set on disabled triggers

7. **aria-disabled assertion**: Angular ARIA sets `aria-disabled="false"` explicitly on enabled buttons. Tests check `not.toHaveAttribute('aria-disabled', 'true')` rather than absence of attribute.

8. **aria-labelledby verification**: Added comprehensive verification in `Accessibility` story:
   - Each panel has an `aria-labelledby` attribute
   - The attribute value references an existing element ID
   - The referenced element is the correct trigger button

9. **role="region" verification**: Added verification in `Accessibility` story confirming all panels have `role="region"` per ARIA Authoring Practices, enabling screen reader landmark navigation.

### 5.2.10 Storybook Testing Workflow ✅

The project supports two Storybook testing modes for different use cases:

| Target                  | Command                                             | Storybook Mode | Use Case                        |
| ----------------------- | --------------------------------------------------- | -------------- | ------------------------------- |
| `test-storybook`        | `npx nx test-storybook ngx-foundation-sites`        | Dev server     | Development with watch mode/HMR |
| `test-static-storybook` | `npx nx test-static-storybook ngx-foundation-sites` | Static files   | CI/CD pipelines                 |

**Development workflow:**

```bash
# Run Storybook tests with watch mode (uses dev server)
npx nx test-storybook ngx-foundation-sites
```

The dev server provides Hot Module Replacement (HMR), enabling instant feedback when modifying component code or stories.

**CI workflow:**

```bash
# Run full CI (uses static files for Storybook tests)
npm run ci
```

The `npm run ci` script uses `test-static-storybook` which builds static files first, then runs tests against them. This is slower but ensures tests run against the exact output that would be deployed.

**Implementation notes:**

- Nx configurations can only override `options`, not `dependsOn`, so separate targets are required for different dependency chains
- `test-storybook` depends on `storybook` (dev server)
- `test-static-storybook` depends on `static-storybook` → `build-storybook`

### 5.2.11 Storybook Story Args Best Practices ✅

**Discovery:** Compodoc correctly extracts default values from Angular's modern `input()` function into `documentation.json`. Storybook then uses this metadata via `setCompodocJson()` to auto-populate the Controls panel.

**Problem solved:** The `Default` story previously duplicated component defaults in its `args` object, creating two sources of truth that could get out of sync:

```typescript
// ❌ BAD: Duplicates component defaults (can get out of sync)
export const Default: Story = {
  args: {
    multiExpandable: false,
    disabled: false,
    softDisabled: true,
    deepLink: false,
    // ... more duplicated defaults
  },
  render: (args) => ({ ... }),
};
```

**Solution:** Remove explicit `args` from stories that use component defaults. Compodoc extracts these defaults and Storybook displays them in the Controls panel automatically:

```typescript
// ✅ GOOD: Component defaults used, no duplication
export const Default: Story = {
  render: (args) => ({ ... }),
  play: async ({ canvasElement }) => { ... },
};
```

**When to use `args`:**

| Scenario                               | Use `args`? | Example                                    |
| -------------------------------------- | ----------- | ------------------------------------------ |
| Story uses component defaults          | ❌ No       | `Default` story                            |
| Story intentionally overrides defaults | ✅ Yes      | `MultiExpand` sets `multiExpandable: true` |
| Story needs non-default initial state  | ✅ Yes      | `DeepLink` sets `deepLink: true`           |

**How it works:**

1. **Compodoc** parses TypeScript AST and extracts `input()` defaults into `documentation.json`:

   ```json
   { "name": "multiExpandable", "defaultValue": "false" }
   { "name": "softDisabled", "defaultValue": "true" }
   ```

2. **Storybook** imports this via `preview.ts`:

   ```typescript
   import { setCompodocJson } from '@storybook/addon-docs/angular';
   import docJson from '../documentation.json';
   setCompodocJson(docJson);
   ```

3. **Controls panel** shows actual component defaults without requiring explicit `args`

**Files modified:**

- `accordion.stories.ts` — Removed explicit `args` from `Default` and `NoAnimation` stories

## 5.3 Deep Linking E2E Tests (Playwright) ✅

**Why E2E?** Deep linking cannot be reliably tested in Storybook interaction tests because:

1. Stories run in an iframe with its own isolated URL context
2. `window.location.hash` changes affect the iframe, not the parent Storybook URL
3. Browser back/forward navigation can't be simulated within the iframe

**Testing Strategy Alignment with Phase 6:**

The dual-strategy architecture in Phase 6 informs our testing approach:

| Strategy         | Scroll API                          | Testable in Storybook? | Best Test Location        |
| ---------------- | ----------------------------------- | ---------------------- | ------------------------- |
| Native (current) | `scrollIntoView()`                  | ❌ Browser API         | **Playwright E2E**        |
| Router (Phase 6) | `ViewportScroller.scrollToAnchor()` | ✅ Can spy/mock        | **Storybook interaction** |

### 5.3.1 E2E App Directory Structure

```
apps/
└── ngx-foundation-sites-e2e/
    ├── src/
    │   └── accordion-deep-link.spec.ts
    ├── playwright.config.ts
    ├── project.json
    ├── tsconfig.json
    └── .eslintrc.json
```

### 5.3.2 project.json

```json
{
  "name": "ngx-foundation-sites-e2e",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/ngx-foundation-sites-e2e/src",
  "implicitDependencies": ["ngx-foundation-sites"]
}
```

> **Note:** The `@nx/playwright` plugin auto-infers the `e2e` target from `playwright.config.ts`

### 5.3.3 playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4400';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx nx static-storybook ngx-foundation-sites',
    url: 'http://localhost:4400',
    reuseExistingServer: !process.env['CI'],
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 5.3.4 tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowJs": true,
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "sourceMap": false
  },
  "include": ["**/*.ts", "**/*.js", "playwright.config.ts"]
}
```

### 5.3.5 accordion-deep-link.spec.ts

**File:** `apps/ngx-foundation-sites-e2e/src/accordion-deep-link.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Accordion Deep Linking', () => {
  const storyUrl = '/iframe.html?id=components-accordion--deep-link';

  test('opens panel from initial URL hash', async ({ page }) => {
    await page.goto(`${storyUrl}#panel-2`);

    const trigger2 = page.getByRole('button', { name: /Accordion 2/i });
    await expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  test('updates URL hash when panel is expanded', async ({ page }) => {
    await page.goto(storyUrl);

    await page.getByRole('button', { name: /Accordion 1/i }).click();

    await expect(page).toHaveURL(/#panel-1$/);
  });

  test('responds to browser back/forward navigation', async ({ page }) => {
    await page.goto(storyUrl);

    // Open panel 1, then panel 2
    await page.getByRole('button', { name: /Accordion 1/i }).click();
    await page.waitForURL(/#panel-1$/);

    await page.getByRole('button', { name: /Accordion 2/i }).click();
    await page.waitForURL(/#panel-2$/);

    // Go back - panel 1 should be active
    await page.goBack();

    const trigger1 = page.getByRole('button', { name: /Accordion 1/i });
    await expect(trigger1).toHaveAttribute('aria-expanded', 'true');
  });

  test('scrolls to panel when deepLinkSmudge is enabled', async ({ page }) => {
    await page.goto(`${storyUrl}#panel-3`);

    // Wait for smudge delay (300ms default)
    await page.waitForTimeout(400);

    const trigger3 = page.getByRole('button', { name: /Accordion 3/i });
    await expect(trigger3).toBeInViewport();
  });

  test('clears hash when all panels are closed in multi-expand mode', async ({ page }) => {
    // Use multi-expand story with deep linking
    const multiStoryUrl = '/iframe.html?id=components-accordion--multi-expand-deep-link';
    await page.goto(`${multiStoryUrl}#panel-1`);

    // Close the expanded panel
    await page.getByRole('button', { name: /Accordion 1/i }).click();

    // Hash should be cleared
    await expect(page).not.toHaveURL(/#panel/);
  });

  test('ignores invalid hash', async ({ page }) => {
    await page.goto(`${storyUrl}#invalid-panel-id`);

    // No panel should be expanded
    const triggers = page.getByRole('button', { name: /Accordion/i });
    const count = await triggers.count();

    for (let i = 0; i < count; i++) {
      await expect(triggers.nth(i)).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('uses replaceState when updateHistory is false', async ({ page }) => {
    // Use story with updateHistory=false
    const replaceStoryUrl = '/iframe.html?id=components-accordion--deep-link-no-history';
    await page.goto(replaceStoryUrl);

    const initialHistoryLength = await page.evaluate(() => history.length);

    await page.getByRole('button', { name: /Accordion 1/i }).click();
    await page.getByRole('button', { name: /Accordion 2/i }).click();

    const finalHistoryLength = await page.evaluate(() => history.length);

    // History length should not increase with replaceState
    expect(finalHistoryLength).toBe(initialHistoryLength);
  });
});
```

### 5.3.6 ESLint Configuration (Optional)

**File:** `apps/ngx-foundation-sites-e2e/.eslintrc.json`

```json
{
  "extends": ["../../.eslintrc.json"],
  "ignorePatterns": ["!**/*"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {}
    },
    {
      "files": ["src/**/*.ts"],
      "extends": ["plugin:playwright/recommended"],
      "rules": {}
    }
  ]
}
```

### 5.3.7 Required Story Variants

The E2E tests require these additional story variants in `accordion.stories.ts`:

| Story Name            | Purpose                              |
| --------------------- | ------------------------------------ |
| `MultiExpandDeepLink` | Multi-expand with `deepLink=true`    |
| `DeepLinkNoHistory`   | Deep link with `updateHistory=false` |

### 5.3.8 Test Cases

| Test Case                | Description                             | Why E2E?            |
| ------------------------ | --------------------------------------- | ------------------- |
| Initial hash opens panel | Navigate to `#panel-2`, verify expanded | Real URL navigation |
| Click updates hash       | Click panel, verify URL hash            | Browser URL access  |
| Browser back/forward     | Navigate history, verify state          | Real history API    |
| Scroll to panel (smudge) | Verify scroll position                  | Real viewport       |
| Hash cleared on close    | Close all, verify hash gone             | URL verification    |
| Invalid hash ignored     | Bad hash, no panel opens                | URL parsing         |
| updateHistory=false      | replaceState used                       | History stack       |

### 5.3.9 Files to Create

| Path                                                            | Purpose                  |
| --------------------------------------------------------------- | ------------------------ |
| `apps/ngx-foundation-sites-e2e/project.json`                    | Nx project configuration |
| `apps/ngx-foundation-sites-e2e/playwright.config.ts`            | Playwright configuration |
| `apps/ngx-foundation-sites-e2e/tsconfig.json`                   | TypeScript configuration |
| `apps/ngx-foundation-sites-e2e/src/accordion-deep-link.spec.ts` | E2E test file            |
| `apps/ngx-foundation-sites-e2e/.eslintrc.json`                  | ESLint config (optional) |

### 5.3.10 Files to Modify

| Path                                          | Change                                                           |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `packages/.../accordion/accordion.stories.ts` | Add `MultiExpandDeepLink` and `DeepLinkNoHistory` story variants |

### 5.3.11 Verification

```bash
# Run E2E tests only
npx nx e2e ngx-foundation-sites-e2e

# Run full CI (includes E2E)
npm run ci
```

### 5.3.12 Future: Phase 6 Router Strategy Testing

When Phase 6 (Angular Router integration) is implemented, Storybook interaction tests become possible:

```typescript
export const DeepLinkRouter: Story = {
  decorators: [
    applicationConfig({
      providers: [provideRouter([], withHashLocation()), provideLocationMocks(), provideAccordionDeepLink('router')],
    }),
  ],
  play: async ({ canvasElement }) => {
    const location = TestBed.inject(Location);
    const viewportScroller = TestBed.inject(ViewportScroller);
    const scrollSpy = vi.spyOn(viewportScroller, 'scrollToAnchor');

    location.go('/#panel-2');

    const trigger2 = within(canvasElement).getByRole('button', { name: /Accordion 2/i });
    await expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(scrollSpy).toHaveBeenCalledWith('panel-2'));
  },
};
```

| Aspect       | E2E (Native)         | Storybook (Router)          |
| ------------ | -------------------- | --------------------------- |
| URL changes  | Real browser URL     | Mocked `Location` service   |
| Back/forward | `page.goBack()`      | `location.simulateUrlPop()` |
| Scroll       | Real viewport scroll | Spy on `ViewportScroller`   |

### 5.3.13 Implementation Notes ✅

**Completed:** E2E project scaffolded and all 7 test cases passing.

**Scaffolding approach (per user preference):**

1. Generated temporary Angular app with Playwright E2E using `@nx/angular:application`
2. Removed temporary app using `@nx/workspace:remove` generator
3. Moved/renamed E2E project to `packages/ngx-foundation-sites-e2e` using `@nx/workspace:move` generator
4. Manually verified no `temp` references remained after move

**Adjustments made during implementation:**

1. **E2E project location**: Placed in `packages/` rather than `apps/` for consistency with library project

2. **Story variants for E2E**: Created `MultiExpandDeepLink` and `DeepLinkNoHistory` stories without play functions to avoid interference with E2E test interactions

3. **Race condition fix in accordion.ts**: Discovered and fixed a race condition where `effect()` would clear the URL hash before `afterNextRender()` could read the initial hash. Added `initialHashProcessed` flag to prevent premature hash clearing in `allowAllClosed` mode.

4. **Test for "ignores invalid hash"**: Updated to use `DeepLinkNoHistory` story which has `allowAllClosed: true` so that invalid hashes don't trigger auto-open of first panel

**Files created:**

- `packages/ngx-foundation-sites-e2e/project.json` - Nx project with `implicitDependencies: ["ngx-foundation-sites"]`
- `packages/ngx-foundation-sites-e2e/playwright.config.ts` - Configured for static-storybook on port 4400
- `packages/ngx-foundation-sites-e2e/tsconfig.json` - TypeScript configuration
- `packages/ngx-foundation-sites-e2e/src/accordion-deep-link.spec.ts` - 7 E2E test cases

**Files modified:**

- `packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts` - Added `MultiExpandDeepLink` and `DeepLinkNoHistory` stories
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts` - Fixed race condition with `initialHashProcessed` flag

## 5.4 Run CI Verification

```bash
npm run ci
```
