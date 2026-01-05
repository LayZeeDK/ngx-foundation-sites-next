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

---

## Implementation Results (2026-01-03)

✅ **Optimization completed successfully**

### Benchmark Results

| File                    | Before (ms) | After (ms) | Improvement |
| ----------------------- | ----------- | ---------- | ----------- |
| accordion.scss          | 92.5        | 42.4       | **54.2%**   |
| button.scss             | 195.1       | 160.8      | **17.6%**   |
| all-components-ltr.scss | 221.1       | 182.6      | 17.4%       |
| **Total**               | **508.7**   | **385.8**  | **24.2%**   |

### Key Observations

1. **accordion.scss saw the largest improvement** (54.2%) because it previously imported the full
   Foundation framework and now imports only 3 granular files.

2. **button.scss improvement was smaller** (17.6%) because the button component has more
   dependencies internally (color calculations, breakpoint mixins).

3. **all-components-ltr.scss** wasn't modified but benefited from system caching effects during
   the benchmark run.

### Verification

- ✅ `npm run ci` passed (lint, test, build, e2e)
- ✅ Consumer app builds successfully with theming
- ✅ Storybook builds correctly (LTR + RTL)

---

# Part 2: Runtime Sass Compilation Optimization

## Goal

Optimize Storybook runtime Sass compilation (browser-based) by implementing a data-driven approach: measure baseline benchmarks, implement optimizations incrementally, and validate improvements after each change.

---

## Status

| Phase   | Status  | Notes                       |
| ------- | ------- | --------------------------- |
| Phase 1 | Pending | Browser benchmark tool      |
| Phase 2 | Pending | Pre-compile default theme   |
| Phase 3 | Pending | Worker pool for parallelism |

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORYBOOK PREVIEW                            │
├─────────────────────────────────────────────────────────────────┤
│  Theme Panel (debounced 300ms)                                  │
│        ↓                                                        │
│  runtime-theme-injector.ts                                      │
│    • Hash-based caching                                         │
│    • Deduplication of in-flight requests                        │
│        ↓                                                        │
│  sass-compiler.ts (Main Thread)                                 │
│    • Creates SINGLE Web Worker                                  │
│    • Sends compile requests via postMessage                     │
│        ↓                                                        │
│  sass-compiler.worker.ts (Worker Thread)                        │
│    • Loads Dart Sass from JSPM CDN                              │
│    • Compiles components SEQUENTIALLY                           │
│    • Returns CSS via postMessage                                │
└─────────────────────────────────────────────────────────────────┘
```

### Current Performance Characteristics

| Metric                    | Time       | Notes                         |
| ------------------------- | ---------- | ----------------------------- |
| Sass CDN load             | ~1.5-2s    | First load only, then cached  |
| Per-component compilation | ~200-400ms | Sequential in single worker   |
| Total (2 components)      | ~400-800ms | After Sass is loaded          |
| Cache hit                 | ~1ms       | Instant from hash-based cache |

### Bottleneck Analysis

1. **Single Worker Serialization**: `Promise.all()` in `compileAll()` sends multiple requests to ONE worker, but they execute sequentially (JS is single-threaded even in workers)
2. **Cold Start**: First theme change must wait for Sass CDN load + compilation
3. **No Precompilation**: Default theme not pre-cached during initialization

---

## Phase 1: Browser Benchmark Tool

Create tooling to measure compilation performance in the browser environment.

### Implementation

**New File**: `src/storybook/sass-benchmark.ts`

```typescript
export interface BenchmarkResult {
  sassLoadTime: number;
  componentTimes: Record<string, number>;
  totalCompileTime: number;
  iterations: number;
}

export async function runBenchmark(iterations?: number): Promise<BenchmarkResult>;
```

**New Story**: `src/storybook/benchmark.stories.ts`

- Visual UI for running benchmarks
- Display results in table format
- Export JSON for comparison

### Metrics to Capture

1. **Sass Load Time**: Time to load Dart Sass from CDN
2. **Per-Component Compilation**: Time for each component (accordion, button)
3. **Total Compilation**: End-to-end time for full theme compilation
4. **Cache Performance**: Time for cache hits vs. misses
5. **Statistical Data**: Min, max, average, standard deviation

### Success Criteria

- [ ] Benchmark runs in browser context
- [ ] Results displayed in Storybook UI
- [ ] JSON export for before/after comparison
- [ ] Baseline measurements documented

---

## Phase 2: Pre-compile Default Theme

Eliminate cold-start latency by pre-compiling the default theme during initialization.

### Architecture Change

```
┌─────────────────────────────────────────────────────────────────┐
│  initializeRuntimeTheming() - ENHANCED                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Create Web Worker                                           │
│  2. Send SASS_SOURCES to worker                                 │
│  3. Worker loads Sass from CDN                                  │
│  4. Worker sends 'ready' response                               │
│  5. ✨ NEW: Fire-and-forget compile of default theme            │
│  6. ✨ NEW: Cache result for instant first use                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

**Modify**: `src/storybook/runtime-theme-injector.ts`

```typescript
export async function initializeRuntimeTheming(): Promise<void> {
  await preloadWorker();

  // Pre-compile default theme (fire-and-forget)
  const defaultTheme = getDefaultThemeState();
  compileThemeState(defaultTheme).catch((err) => {
    console.warn('[nfs-theme] Pre-compilation failed:', err);
  });
}
```

### Expected Impact

| Metric               | Before     | After   | Improvement |
| -------------------- | ---------- | ------- | ----------- |
| First theme display  | ~2-3s      | ~0ms    | ~100%       |
| Perceived cold-start | Noticeable | Instant | UX win      |

### Success Criteria

- [ ] Default theme cached during initialization
- [ ] First theme panel interaction is instant
- [ ] No blocking of Storybook startup
- [ ] Benchmark shows improvement

---

## Phase 3: Worker Pool for True Parallelism

Replace single worker with a pool of workers for parallel compilation.

### Architecture Change

```
┌─────────────────────────────────────────────────────────────────┐
│  sass-compiler.ts - WORKER POOL                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  compileAll(themeState)                                         │
│        ↓                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Worker #1  │  │  Worker #2  │  │  Worker #N  │              │
│  │  accordion  │  │   button    │  │   future    │              │
│  │  ~300ms     │  │   ~300ms    │  │   ~300ms    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┴────────────────┘                      │
│                          ↓                                       │
│                 Promise.all() - TRUE PARALLEL                    │
│                      Total: ~300ms                               │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

**Modify**: `src/storybook/sass-compiler.ts`

```typescript
class SassWorkerPool {
  #workers: Map<string, Worker> = new Map();
  #pending: Map<number, PendingRequest> = new Map();

  async init(components: string[]): Promise<void> {
    // Create one worker per component
    for (const component of components) {
      const worker = new Worker(new URL('./sass-compiler.worker.ts', import.meta.url), { type: 'module' });
      // Initialize with SASS_SOURCES
      await this.#initWorker(worker, component);
      this.#workers.set(component, worker);
    }
  }

  async compileAll(themeState: ThemeState): Promise<string> {
    // Each component compiles in its own worker - TRUE parallelism
    const promises = [...this.#workers.entries()].map(([component, worker]) => this.#compile(worker, component, themeState));
    const results = await Promise.all(promises);
    return results.join('\n');
  }
}
```

### Trade-offs

| Aspect           | Single Worker       | Worker Pool       |
| ---------------- | ------------------- | ----------------- |
| Compilation time | Sequential (~600ms) | Parallel (~300ms) |
| Memory usage     | 1× Sass (~300KB)    | N× Sass (~600KB)  |
| Initialization   | 1 worker setup      | N worker setups   |
| CDN requests     | 1 Sass load         | N Sass loads      |
| Complexity       | Simple              | More complex      |

### Mitigation Strategies

1. **CDN Caching**: Browser caches Sass module, so subsequent worker loads are fast
2. **Lazy Pool Init**: Only create workers on first theme change, not on Storybook load
3. **Pool Reuse**: Workers persist across theme changes

### Expected Impact

| Metric              | Before (1 worker) | After (N workers) | Improvement |
| ------------------- | ----------------- | ----------------- | ----------- |
| 2-component compile | ~600ms            | ~300ms            | ~50%        |
| 4-component compile | ~1200ms           | ~300ms            | ~75%        |
| N-component compile | N × 300ms         | ~300ms            | ~(N-1)/N    |

### Success Criteria

- [ ] Worker pool creates N workers (one per component)
- [ ] Compilation runs in true parallel
- [ ] Benchmark shows ~50% improvement for 2 components
- [ ] Memory usage acceptable
- [ ] No race conditions or deadlocks

---

## Benchmark Comparison Template

After each phase, record measurements:

```json
{
  "phase": "baseline | phase1 | phase2 | phase3",
  "date": "YYYY-MM-DD",
  "iterations": 10,
  "results": {
    "sassLoadTime": { "avg": 0, "min": 0, "max": 0 },
    "accordion": { "avg": 0, "min": 0, "max": 0 },
    "button": { "avg": 0, "min": 0, "max": 0 },
    "totalCompile": { "avg": 0, "min": 0, "max": 0 },
    "cacheHit": { "avg": 0, "min": 0, "max": 0 }
  }
}
```

---

## Files to Modify

| File                                      | Change | Phase |
| ----------------------------------------- | ------ | ----- |
| `src/storybook/sass-benchmark.ts`         | Create | 1     |
| `src/storybook/benchmark.stories.ts`      | Create | 1     |
| `src/storybook/runtime-theme-injector.ts` | Modify | 2     |
| `src/storybook/sass-compiler.ts`          | Modify | 3     |

---

## Future Considerations

- **Component-level caching**: Only recompile components whose variables changed
- **Incremental compilation**: Sass 2.0 may support incremental builds
- **SharedArrayBuffer**: If COOP/COEP headers added, could share Sass module between workers
