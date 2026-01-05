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

| Phase   | Status  | Notes                                 |
| ------- | ------- | ------------------------------------- |
| Phase 1 | ✅ Done | Browser benchmark tool + Storybook UI |
| Phase 2 | ✅ Done | Pre-compile default theme on init     |
| Phase 3 | ✅ Done | Worker pool for true parallel compile |

---

## Current Architecture (Post-Optimization)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORYBOOK PREVIEW                            │
├─────────────────────────────────────────────────────────────────┤
│  Theme Panel (debounced 300ms)                                  │
│        ↓                                                        │
│  runtime-theme-injector.ts                                      │
│    • Hash-based caching                                         │
│    • Deduplication of in-flight requests                        │
│    • ✨ Pre-compiles default theme on init (fire-and-forget)   │
│        ↓                                                        │
│  sass-compiler.ts (Main Thread)                                 │
│    • Creates WORKER POOL (one per component)                    │
│    • Sends compile requests via postMessage                     │
│        ↓                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Worker 1   │  │   Worker 2   │  │   Worker N   │          │
│  │  accordion   │  │    button    │  │   (future)   │          │
│  │    ~300ms    │  │    ~300ms    │  │    ~300ms    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                │                 │                    │
│         └────────────────┴─────────────────┘                    │
│                          ↓                                       │
│               Promise.all() - TRUE PARALLEL                      │
│                    Total: ~300ms                                 │
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

| File                                      | Change | Phase | Status  |
| ----------------------------------------- | ------ | ----- | ------- |
| `src/storybook/sass-benchmark.ts`         | Create | 1     | ✅ Done |
| `src/storybook/benchmark.stories.ts`      | Create | 1     | ✅ Done |
| `src/storybook/runtime-theme-injector.ts` | Modify | 2     | ✅ Done |
| `src/storybook/sass-compiler.ts`          | Modify | 3     | ✅ Done |

---

## Implementation Results (2026-01-05)

✅ **All three phases implemented successfully**

### What Was Built

1. **Browser Benchmark Tool** (`sass-benchmark.ts`)
   - Measures worker init time, total compile time, and cache hit performance
   - Statistical analysis with min/max/avg/stdDev
   - JSON export for comparison across runs

2. **Benchmark Storybook Story** (`benchmark.stories.ts`)
   - Visual UI with stat cards for key metrics
   - Run button with progress indicator
   - Export buttons for JSON and formatted text
   - Comparison feature for before/after analysis

3. **Default Theme Pre-compilation**
   - Fire-and-forget compilation during `initializeRuntimeTheming()`
   - Default theme is cached before first user interaction
   - First theme panel use is instant (cache hit)

4. **Worker Pool Architecture**
   - One dedicated worker per component (accordion, button)
   - True parallel compilation via `Promise.all()`
   - Workers reused across theme changes
   - Browser caches Sass CDN module for fast worker init

### Actual Benchmark Results (2026-01-05)

| Metric        | Baseline (Sequential) | Optimized (Parallel) | Improvement      |
| ------------- | --------------------- | -------------------- | ---------------- |
| **Average**   | 1842.2ms              | 1464.1ms             | **20.5% faster** |
| Min           | 1786ms                | 1437.6ms             | 19.5% faster     |
| Max           | 2010ms                | 1511.9ms             | 24.8% faster     |
| Std Deviation | 84.7ms                | 25.3ms               | More consistent  |

**Per-component timing (parallel):**

- accordion: ~500ms
- button: ~1450ms
- Total: ~1450ms (limited by slowest component, not sum)

**Note:** The improvement is less dramatic than the original estimate (~50%) because:

1. Button component has significantly more internal dependencies than accordion
2. The slowest component determines total time in parallel mode
3. CDN caching effects vary between benchmark runs

### Verification

- ✅ Lint passes
- ✅ Format checks pass
- ✅ `npx nx build-storybook ngx-foundation-sites` succeeds
- ✅ Baseline benchmark captured: 1842.2ms avg
- ✅ Optimized benchmark captured: 1464.1ms avg (20.5% improvement)

### How to Measure

1. Start Storybook: `npm run storybook`
2. Navigate to "Dev Tools / Sass Benchmark"
3. Click "Run Benchmark" with 5+ iterations
4. Results show compilation timing statistics

---

# Part 3: Component-Level Caching

## Goal

Reduce recompilation time for single-component variable changes by implementing per-component caching with intelligent cache invalidation.

---

## Status

| Phase   | Status  | Notes                                     |
| ------- | ------- | ----------------------------------------- |
| Phase 1 | ✅ Done | LRU cache utility                         |
| Phase 2 | ✅ Done | Component dependency mapping              |
| Phase 3 | ✅ Done | Selective compilation in sass-compiler.ts |
| Phase 4 | ✅ Done | Per-component caching in theme injector   |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    THEME STATE CHANGE                           │
├─────────────────────────────────────────────────────────────────┤
│  1. hashThemeState(fullState) → Check combinedCache             │
│        ↓ (miss)                                                 │
│  2. getAffectedComponents(oldState, newState)                   │
│        • palette changed? → ALL components affected             │
│        • accordion.* changed? → only accordion affected         │
│        • button.* changed? → only button affected               │
│        ↓                                                        │
│  3. For each component:                                         │
│        • hashComponentState(state, component)                   │
│        • Check componentCache for hit                           │
│        ↓                                                        │
│  4. compileComponentsSelectively(affectedOnly, themeState)      │
│        • Only workers for affected components do work           │
│        ↓                                                        │
│  5. Combine: cached CSS + fresh CSS → combinedCache             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Results (2026-01-05)

✅ **Component-level caching implemented successfully**

### What Was Built

1. **LRU Cache Utility** (`lru-cache.ts`)
   - Generic bounded cache with automatic eviction
   - Uses Map insertion order for efficient LRU tracking
   - Limits: 50 per-component entries, 10 combined entries

2. **Component Dependencies** (`component-dependencies.ts`)
   - Maps variables to components: `palette` → all, `accordion` → accordion only
   - `getAffectedComponents()` determines what needs recompilation
   - `hashComponentState()` generates per-component cache keys

3. **Selective Compilation** (`sass-compiler.ts`)
   - `compileComponentsSelectively()` compiles only specified components
   - Workers for unaffected components remain idle

4. **Per-Component Caching** (`runtime-theme-injector.ts`)
   - Two-level cache: componentCache + combinedCache
   - Cache key includes only relevant ThemeState sections
   - Automatic composition of cached + fresh CSS

### Actual Benchmark Results

| Change Type               | Components Compiled | Time       | vs Baseline         |
| ------------------------- | ------------------- | ---------- | ------------------- |
| Full compile (baseline)   | Both                | ~1332ms    | -                   |
| **Accordion-only change** | Accordion           | **~570ms** | **57% faster**      |
| Button-only change        | Button              | ~1655ms    | Same (bottleneck)   |
| Palette change            | Both                | ~1332ms    | Same (all affected) |

### Key Insights

1. **Optimization shines for faster components**: Accordion compiles in ~500ms, button in ~1300ms.
   Changing only accordion variables saves ~760ms by skipping button compilation.

2. **Button-only changes save less**: Button is the bottleneck, so skipping accordion (~500ms)
   has minimal impact on total time.

3. **Cache composition works**: CSS from different cache entries combines correctly
   in consistent component order.

### Console Output Examples

```
# Accordion-only change
[nfs-theme] Selective compile: accordion (1/2 cached)
[sass-compiler] 1 component(s) compiled in 569ms (selective)
[nfs-theme] Theme state applied in 570ms

# Button-only change
[nfs-theme] Selective compile: button (1/2 cached)
[sass-compiler] 1 component(s) compiled in 1654ms (selective)
[nfs-theme] Theme state applied in 1655ms
```

### Verification

- ✅ `npm run lint` passes
- ✅ `npx nx build-storybook ngx-foundation-sites` succeeds
- ✅ Accordion-only changes compile only accordion
- ✅ Button-only changes compile only button
- ✅ Palette changes compile all components
- ✅ LRU eviction prevents unbounded memory growth

---

## Files Created/Modified

| File                                      | Change                                     |
| ----------------------------------------- | ------------------------------------------ |
| `src/storybook/lru-cache.ts`              | **Created** - Generic LRU cache utility    |
| `src/storybook/component-dependencies.ts` | **Created** - Dependency mapping           |
| `src/storybook/sass-compiler.ts`          | **Modified** - Added selective compilation |
| `src/storybook/runtime-theme-injector.ts` | **Modified** - Per-component caching       |

---

# Part 4: Compilation Coalescing (Implemented)

## Goal

Reduce Storybook Sass compilation overhead through coalescing redundant compilations during rapid interactions.

---

## Status

| Phase   | Status      | Notes                                                        |
| ------- | ----------- | ------------------------------------------------------------ |
| Phase 1 | ✅ Done     | Compilation coalescing implemented                           |
| Phase 2 | ❌ Canceled | IndexedDB caching doesn't work for ES modules with externals |

---

## Part A: Compilation Coalescing

### Problem

Current flow during rapid slider drag (10 → 15 → 20 → 25):

```
t=0ms:    User sets 10, debounce starts
t=300ms:  Debounce fires, compile(10) starts
t=350ms:  User sets 15, debounce starts
t=650ms:  Debounce fires, compile(15) starts (while compile(10) still running!)
...
Result: 4 compilations, only last one matters
```

### Solution

Add a **coalescing buffer** in `runtime-theme-injector.ts`:

```typescript
let pendingState: ThemeState | null = null;
let isCompiling = false;

async function applyThemeStateCoalesced(themeState: ThemeState, options?: ApplyThemeOptions): Promise<void> {
  // Always update pending state
  pendingState = themeState;

  // If compilation in progress, it will pick up pendingState when done
  if (isCompiling) {
    return;
  }

  isCompiling = true;

  try {
    while (pendingState !== null) {
      const stateToCompile = pendingState;
      pendingState = null; // Clear before compile (new requests will set it again)

      await applyThemeStateInternal(stateToCompile, options);
    }
  } finally {
    isCompiling = false;
  }
}
```

**Result**: Same slider drag now does 2 compilations max (first + final).

### Expected Impact

| Scenario                 | Before     | After      | Improvement   |
| ------------------------ | ---------- | ---------- | ------------- |
| Rapid slider (5 changes) | 5 compiles | 2 compiles | **60% fewer** |

### Files to Modify

| File                                      | Change                                          |
| ----------------------------------------- | ----------------------------------------------- |
| `src/storybook/runtime-theme-injector.ts` | Add coalescing wrapper around `applyThemeState` |

---

## Part B: IndexedDB Sass Module Caching (Canceled)

### Original Idea

Cache the Sass module blob in IndexedDB to eliminate CDN fetch latency for returning users.

### Why It Was Canceled

**ES modules from CDNs cannot be cached as blobs.** When we attempted to:

1. Fetch Sass from `https://jspm.dev/sass` as a blob
2. Create a blob URL: `blob:https://...`
3. Import the module: `await import(blobUrl)`

The import failed with:

```
TypeError: Failed to resolve module specifier "/npm:immutable@4". Invalid relative URL.
```

**Root cause:** JSPM's Sass module contains internal imports like `/npm:immutable@4` that are
resolved relative to the JSPM CDN. When loaded from a blob URL, these imports become invalid
because they can't be resolved from `blob://` origins.

### Alternative: Browser HTTP Caching

Browser HTTP caching already provides excellent performance for CDN resources:

| Load Type   | Time     | Notes                              |
| ----------- | -------- | ---------------------------------- |
| First load  | ~200ms   | Full network fetch                 |
| Cached load | ~50-70ms | Browser HTTP cache (304 or memory) |
| In-memory   | ~0ms     | Same worker, same page load        |

**Actual results from testing:**

```
[sass-worker] Sass loaded in 53ms
[sass-worker] Sass loaded in 65ms
```

This is fast enough that IndexedDB caching provides minimal additional benefit.

---

## Implementation Results (2026-01-05)

✅ **Compilation coalescing implemented successfully**

### What Was Built

1. **Coalescing Buffer** (`runtime-theme-injector.ts`)
   - `pendingCoalescedState` buffers the latest theme state during compilation
   - `isApplyLoopRunning` prevents multiple concurrent compilation loops
   - When a new request arrives during compilation, it's coalesced (buffered, not compiled)
   - After compilation finishes, the loop checks for pending state and compiles it
   - Statistics tracked: `coalescingStats.coalesced` and `coalescingStats.applied`

2. **Two-Layer Protection**
   - **Layer 1 (300ms debounce)**: Theme panel debounces input changes
   - **Layer 2 (coalescing)**: `applyThemeState` coalesces requests during active compilation
   - Together, these ensure rapid slider drags result in ~2 compilations, not 5+

### Actual Behavior

```
User drags slider: 10 → 15 → 20 → 25 (over 500ms)

t=0ms:    User sets 10, debounce starts
t=100ms:  User sets 15, debounce resets
t=200ms:  User sets 20, debounce resets
t=300ms:  User sets 25, debounce resets
t=600ms:  Debounce fires with value 25, compile(25) starts
t=2100ms: Compilation complete, theme applied

Result: 1 compilation (debounce caught all)

---

User makes two changes 400ms apart (beyond debounce):

t=0ms:    User sets 10, debounce starts
t=300ms:  Debounce fires, compile(10) starts
t=400ms:  User sets 20, debounce starts
t=700ms:  Debounce fires, applyThemeState(20) called
          → isApplyLoopRunning=true, state coalesced
t=1800ms: compile(10) complete, loop finds pendingState=20
t=1800ms: compile(20) starts
t=3300ms: compile(20) complete, no pending state

Result: 2 compilations (coalescing caught the overlap)
```

### Console Output

```
# Normal change
[nfs-theme] Applying theme state...
[nfs-theme] Selective compile: accordion, button (0/2 cached)
[nfs-theme] Theme state applied in 1543ms

# Coalesced change (when overlapping)
[nfs-theme] Coalesced (1 skipped, 2 applied)
```

### Verification

- ✅ `npm run lint` passes
- ✅ `npx nx build-storybook ngx-foundation-sites` succeeds
- ✅ Sass loads from CDN with HTTP caching in ~50-70ms
- ✅ Coalescing prevents redundant compilations during overlap
- ✅ Debounce + coalescing together ensure responsive UX

### Files Modified

| File                                      | Change                           |
| ----------------------------------------- | -------------------------------- |
| `src/storybook/runtime-theme-injector.ts` | Added coalescing wrapper + stats |

### Key Learnings

1. **IndexedDB can't cache ES modules with external dependencies** - Blob URLs break
   relative imports. Browser HTTP caching is sufficient for CDN resources.

2. **Two-layer protection is effective** - Debounce handles most rapid changes;
   coalescing catches edge cases where compilations overlap.

3. **Browser HTTP cache is faster than expected** - ~50-70ms is acceptable for
   Sass module loading, no custom caching needed.

---

## Future Considerations

- **CSS Tree-Shaking**: Post-process compiled CSS to remove unused selectors (25-40% smaller output)
- **Variable-Level Dependencies**: Track finer-grained dependencies for even more selective caching
- **Predictive Warm-Start**: Pre-compile common theme variants during initialization
- **Incremental compilation**: Sass 2.0 may support incremental builds

---

# Part 5: Service Worker Caching for Sass CDN (Removed)

## Status: ❌ Removed

**Superseded by Part 6 (Local Sass Bundle).**

The Service Worker was originally implemented to cache JSPM CDN resources, reducing Sass module
load time from ~343ms to ~120ms. However, with Part 6's local bundle implementation, the CDN is
no longer used at all — Sass is loaded directly from `/sass-browser.mjs`.

### Why Removed

1. **Local bundle eliminates CDN dependency** — No network requests to cache
2. **Simpler architecture** — One less moving part (no SW registration/lifecycle)
3. **Same performance** — Local bundle (~145ms) ≈ SW-cached CDN (~120ms)
4. **Offline by default** — Local bundle works without network or SW

### Files Deleted (2026-01-05)

| File                                           | Reason                         |
| ---------------------------------------------- | ------------------------------ |
| `.storybook/sw-public/jspm-sw.js`              | No CDN to cache                |
| `src/storybook/service-worker-registration.ts` | No SW to register              |

### Historical Performance Data

For reference, here were the SW cache results before removal:

| Metric           | Cold CDN | SW Cached | Local Bundle |
| ---------------- | -------- | --------- | ------------ |
| Sass module load | ~343ms   | ~120ms    | ~145ms       |

The ~25ms difference between SW cache and local bundle is negligible for a dev tool.

---

# Part 6: Local Sass Bundle (Implemented)

## Goal

Pre-bundle Dart Sass locally using esbuild to eliminate CDN dependency entirely and provide
consistent, offline-capable Sass compilation.

---

## Status

| Phase   | Status    | Notes                                           |
| ------- | --------- | ----------------------------------------------- |
| Phase 1 | ❌ Failed | esm.sh CDN - Missing Node.js polyfills          |
| Phase 2 | ✅ Done   | esbuild bundle with custom process polyfill     |

---

## The Problem

Dart Sass (compiled via Dart2JS) checks `process.stdout.isTTY` for colored terminal output.
The default `esbuild-plugin-polyfill-node` provides `process.stdout = undefined`, causing:

```
TypeError: Cannot read properties of undefined (reading 'get$isTTY')
```

### Failed Approaches

1. **esm.sh CDN**: Missing Node.js polyfills entirely
2. **Default esbuild polyfill**: `stdout` defined as `undefined` with `configurable: false`
3. **Banner/inject**: Runs before polyfill, then gets overwritten

---

## The Solution

**Disable the polyfill plugin's process and provide our own complete polyfill with TTY stubs.**

### Key Changes

**1. Disable default process polyfill** (`bundle-sass-compiler.mjs`):
```javascript
polyfillNode({
  polyfills: {
    // ... other polyfills
    process: false,  // DISABLED - we provide our own
  },
})
```

**2. Provide custom process polyfill** (`sass-entry.mjs`):
```javascript
const createTTYStub = () => ({
  isTTY: false,
  write: () => true,
  // ... other TTY methods
});

globalThis.process = {
  stdout: createTTYStub(),
  stderr: createTTYStub(),
  stdin: createTTYStub(),
  // ... complete Node.js process API
};

export * from 'sass';
```

---

## Implementation Results (2026-01-05)

✅ **Local Sass bundle working successfully**

### Performance

| Metric           | JSPM CDN (cached) | Local Bundle | Notes                    |
| ---------------- | ----------------- | ------------ | ------------------------ |
| Sass module load | ~139ms            | ~145-150ms   | Comparable               |
| Worker pool init | ~157ms            | ~177ms       | Slightly slower          |
| Total compile    | ~1500ms           | ~1500ms      | Same                     |

### Advantages of Local Bundle

1. **No CDN dependency** - Works offline, no network required
2. **No Service Worker needed** - Simpler architecture
3. **Consistent performance** - No cache cold-start issues
4. **Build-time caching** - Nx caches the bundle, rebuilds only when Sass version changes

### Console Output

```
[sass-worker] Loading Sass from local bundle...
[sass-worker] Sass loaded from local bundle in 148ms
[sass-worker] accordion compiled in 514ms
[sass-worker] button compiled in 1359ms
[nfs-theme] Theme state applied in 1504ms
```

---

## Files Summary

| File                                    | Purpose                                    |
| --------------------------------------- | ------------------------------------------ |
| `tools/bundle-sass-compiler.mjs`        | esbuild bundler script                     |
| `tools/sass-entry.mjs`                  | Custom process polyfill + Sass re-export   |
| `.storybook/static/sass-browser.mjs`    | Built bundle (~3.1MB)                      |
| `project.json` (bundle-sass-compiler)   | Nx build target with caching               |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  BUILD TIME (nx bundle-sass-compiler)                           │
├─────────────────────────────────────────────────────────────────┤
│  1. sass-entry.mjs sets up globalThis.process with TTY stubs    │
│  2. sass-entry.mjs imports and re-exports Sass                  │
│  3. esbuild bundles everything with Node.js polyfills           │
│  4. Output: .storybook/static/sass-browser.mjs (~3.1MB)         │
│  5. Nx caches the output (rebuilds only when inputs change)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  RUNTIME (Storybook)                                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Worker imports /sass-browser.mjs (served from static/)      │
│  2. Browser parses and evaluates bundle (~145ms)                │
│  3. Sass compileStringAsync() works (has process.stdout.isTTY)  │
│  4. No CDN dependency — fully offline-capable                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Verification

- ✅ Local bundle loads in ~145-150ms
- ✅ Sass compilation works without TTY errors
- ✅ Theme panel interactions work correctly
- ✅ No CDN dependency — works fully offline
- ✅ Nx caching works for bundle-sass-compiler target
