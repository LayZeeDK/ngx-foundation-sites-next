# Plan: Optimize Sass Dependencies in Component Stylesheets

## Goal

Replace full Foundation framework imports with granular, component-specific imports to reduce Sass compilation time.

## Current Problem

Each component stylesheet imports the **entire** Foundation framework (~70+ files):

```scss
@import 'foundation-sites/scss/foundation'; // Loads everything
@include foundation-accordion; // Uses only 1 mixin
```

Foundation's `foundation.scss` imports:

- 7 vendor files (normalize, sassy-lists)
- 10 utility modules
- Forms, typography, grids (float, flex, xy-grid)
- 35+ component files

We only need **3 imports** per component: utilities, global settings, and the component.

---

## Implementation Plan

### Phase 1: Create Baseline Benchmarks

**Create benchmark script:** `tools/benchmark-sass.mjs`

- Uses Node.js `sass` package directly for consistent timing
- Measures 10 iterations per file, reports avg/min/max
- Tests: `accordion.scss`, `button.scss`, `all-components-ltr.scss`

**Record baseline metrics:**

- Individual file compilation times
- `nx build-storybook ngx-foundation-sites` (full build)
- `nx build consumer-test-app` (consumer build)

### Phase 2: Update Component Stylesheets (Direct Approach)

No shared partial needed! Use `util/util` directly in each component.

**Modify:** `packages/ngx-foundation-sites/src/lib/scss/accordion.scss`

```scss
@import 'nfs-settings';
@import 'foundation-sites/scss/util/util'; // All utilities (rem-calc, etc.)
@import 'foundation-sites/scss/global'; // $white, $primary-color, $global-left, etc.
@import 'foundation-sites/scss/components/accordion';
@include foundation-accordion;
// ... rest unchanged
```

**Modify:** `packages/ngx-foundation-sites/src/lib/scss/button.scss`

```scss
@import 'nfs-settings';
@import 'foundation-sites/scss/util/util'; // All utilities
@import 'foundation-sites/scss/global'; // Global settings
@import 'foundation-sites/scss/components/button';
@include foundation-button;
```

**Why no sassy-lists for these components?**

- sassy-lists is only used by `-zf-each-breakpoint-in()` mixin
- Neither accordion nor button use that mixin
- Button's `@include breakpoint()` does NOT require sassy-lists

**Note for future components:** XY Grid components (`xy-grid/position`) use `-zf-each-breakpoint-in()`, so they WILL need sassy-lists imports. When adding grid components, include the 7 sassy-lists files before `util/util`.

**Skipped imports:** normalize, sassy-lists, typography, forms, grids, 35+ unused components

### Phase 3: Verify Changes

1. Run CI: `npm run ci` (lint, test, build, e2e)
2. Visual check in Storybook (LTR + RTL)
3. Verify consumer-test-app theming works

### Phase 4: Post-Optimization Benchmarks

1. Re-run benchmark script
2. Compare before/after times
3. Document results

---

## Files to Create

| File                       | Purpose                               |
| -------------------------- | ------------------------------------- |
| `tools/benchmark-sass.mjs` | Benchmark script for Sass compilation |

## Files to Modify

| File                                                        | Change                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| `packages/ngx-foundation-sites/src/lib/scss/accordion.scss` | Replace full Foundation with `util/util` + `global` + component |
| `packages/ngx-foundation-sites/src/lib/scss/button.scss`    | Replace full Foundation with `util/util` + `global` + component |

---

## Expected Reduction

| Metric                       | Before                      | After                                          |
| ---------------------------- | --------------------------- | ---------------------------------------------- |
| Files imported per component | ~70+                        | ~14 (10 utils + global + settings + component) |
| Components loaded            | 35+                         | 1                                              |
| Grids loaded                 | 3 (float, flex, xy)         | 0                                              |
| Forms/typography             | Yes                         | No                                             |
| Vendor files                 | 8 (normalize + sassy-lists) | 0                                              |

**Expected improvement:** 40-60% faster Sass compilation per file

---

## Rollback Strategy

If builds fail or visual issues occur:

1. Revert to `@import 'foundation-sites/scss/foundation'`
2. Check Sass error for missing variable/function
3. Add missing import before the component import

---

## Risk Mitigation

| Risk                    | Mitigation                                                         |
| ----------------------- | ------------------------------------------------------------------ |
| Missing variable        | CI build fails with clear error; add missing import                |
| RTL breaks              | `$global-left`/`$global-right` come from `_global.scss` (included) |
| Consumer theming breaks | `_nfs-settings` still imported first                               |
| Import order issues     | `util/util` handles internal dependency order                      |
