# Plan: Optimize Sass Browser Bundle for Faster Parsing

## Goal

Reduce the ~145ms parse/evaluation time of `sass-browser.mjs` through:
1. **ES2024 target** — Avoid transpiling modern syntax, enable JIT optimizations
2. **Two-phase minification** — esbuild bundling + Terser compression

---

## Current State

| Metric | Value |
|--------|-------|
| Bundle size | ~3.1 MB |
| Parse/eval time | ~145-150ms |
| Minifier | esbuild built-in |
| Target | ES2020 |
| Format | ESM |

---

## Research Findings

### Why Two-Phase Minification?

From [makandracards](https://makandracards.com/makandra/622791-esbuild-compressing-javascript-harder-terser):
> "esbuild is used in the first phase to remove the majority of the unused code. Terser can be used as a second phase to further optimize and reduce bundle size."

From [Terser docs](https://terser.org/docs/options/):
> "Whitespace removal and symbol mangling accounts for 95% of the size reduction in minified code."

### Expected Improvement

| Approach | Size Reduction | Parse Time Impact |
|----------|----------------|-------------------|
| esbuild only | Baseline | ~145ms |
| esbuild + Terser | 10-25% smaller | ~110-130ms (estimated) |

Parse time is roughly proportional to file size for minified JavaScript.

---

## Implementation Plan

### Step 1: Install Terser

```bash
npm install --save-dev terser
```

### Step 2: Modify `bundle-sass-compiler.mjs`

**Change 1: Update esbuild target to ES2024**

```javascript
const result = await esbuild.build({
  // ... existing options
  target: ['es2024'],  // Changed from es2020
  // ...
});
```

**Change 2: Add Terser post-processing**

```javascript
import { minify } from 'terser';
import { readFileSync, writeFileSync } from 'node:fs';

async function bundle() {
  // Phase 1: esbuild (fast bundling + basic minification)
  const result = await esbuild.build({
    // ... existing options
    target: ['es2024'],  // Use modern JS features natively
    minify: true,        // Keep esbuild minification as first pass
  });

  // Phase 2: Terser (aggressive compression)
  console.log('[bundle-sass] Applying Terser compression...');
  const bundleCode = readFileSync(OUTPUT_FILE, 'utf8');

  const terserResult = await minify(bundleCode, {
    ecma: 2024,           // Match esbuild target
    module: true,
    compress: {
      ecma: 2024,
      passes: 2,          // Multiple compression passes
      pure_getters: true, // Assume getters are pure
      unsafe_math: true,  // Allow optimizations that may affect floating-point
      toplevel: true,     // Enable top-level optimizations
    },
    mangle: {
      toplevel: true,     // Mangle top-level names
    },
    format: {
      comments: false,    // Remove all comments
      ecma: 2024,
    },
  });

  writeFileSync(OUTPUT_FILE, terserResult.code);

  // Report final size
  const finalSize = Buffer.byteLength(terserResult.code, 'utf8');
  console.log(`[bundle-sass] Final size after Terser: ${Math.round(finalSize / 1024)} KB`);
}
```

### Step 3: Measure Results

1. Record baseline: current bundle size and parse time
2. Apply changes
3. Measure new bundle size and parse time
4. Update `SASS_OPTIMIZATION_PLAN.md` with results

---

## Terser Options Rationale

| Option | Value | Rationale |
|--------|-------|-----------|
| `ecma: 2024` | ES2024 | Use latest syntax, enable all modern optimizations |
| `module: true` | true | Treat as ES module (enables additional optimizations) |
| `passes: 2` | 2 | Multiple compression passes find more optimizations |
| `pure_getters: true` | true | Sass module has no getter side effects |
| `toplevel: true` | true | Mangle/compress top-level scope |
| `comments: false` | false | Remove all comments (legal comments already stripped by esbuild) |

## Why ES2024?

| Feature | ES2020 | ES2024 |
|---------|--------|--------|
| Class fields | Transpiled to constructor | Native syntax |
| Private fields (`#field`) | Transpiled to WeakMap | Native syntax |
| Logical assignment (`??=`) | Transpiled | Native syntax |
| `at()` method | Polyfilled | Native |
| Regex `/v` flag | Transpiled to `new RegExp()` | Native syntax |
| Bundle impact | Larger (transpiled code) | Smaller (native syntax) |
| JIT optimization | Indirect patterns | Direct optimization |

**Browser support**: All modern browsers (Chrome 117+, Firefox 119+, Safari 17+, Edge 117+) fully support ES2024. Since this is a Storybook dev tool, legacy browser support is unnecessary.

**Note**: ES2024 vs ES2023 has minimal bundle impact (only regex `/v` flag difference). The significant gain is ES2020 → ES2024.

### Options NOT Used (Risk of Breaking)

| Option | Why Avoided |
|--------|-------------|
| `mangle.properties` | Would break Sass API (`compileStringAsync`, `SassNumber`) |
| `unsafe` | Could break Sass's internal calculations |
| `passes: 3+` | Diminishing returns, significantly slower |

---

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `terser` as devDependency |
| `tools/bundle-sass-compiler.mjs` | Add Terser post-processing step |
| `SASS_OPTIMIZATION_PLAN.md` | Document results |

---

## Verification

1. **Build succeeds**: `npx nx bundle-sass-compiler ngx-foundation-sites`
2. **Sass works**: Start Storybook, verify theme compilation works
3. **Parse time improved**: Check console logs for load time
4. **Bundle smaller**: Compare file sizes before/after

---

## Rollback Plan

If Terser breaks Sass functionality:
1. Remove Terser post-processing from `bundle-sass-compiler.mjs`
2. Keep esbuild-only minification (current state)

---

## Alternative Approaches Considered

### 1. SWC Minifier
- Similar to Terser but faster
- Less mature, fewer optimization options
- **Not chosen**: Terser is more battle-tested

### 2. Google Closure Compiler
- Most aggressive optimizations
- Requires type annotations for best results
- **Not chosen**: Too invasive, high risk of breaking Sass

### 3. Code Splitting
- Split Sass into chunks loaded on demand
- **Not chosen**: Adds complexity, Sass needs to be fully loaded for compilation

### 4. Scope Hoisting Improvements
- esbuild already performs scope hoisting by default
- **Not applicable**: Already enabled

---

## Actual Results (2026-01-05)

| Metric | Before (ES2020, esbuild only) | After (ES2024 + Terser) | Change |
|--------|-------------------------------|-------------------------|--------|
| Bundle size | 3,147 KB | 3,090 KB | **-1.8%** |
| Parse time | ~145ms | ~144-149ms | **~Same** |
| Build time | ~340ms | ~8,100ms | +7.7s |

**Why the minimal improvement?**

Dart Sass is compiled from Dart to JavaScript via Dart2JS, which already applies heavy optimizations:
- Variable names are already shortened (e.g., `$`, `_`, single letters)
- Dead code is already eliminated
- The code structure (generated, not hand-written) leaves little room for Terser

The ES2024 target change had negligible impact because Dart2JS outputs ES5-compatible code that doesn't use modern syntax features like class fields or private fields.

**Conclusion**: The optimization is in place but provides minimal benefit (~57 KB, 1.8% reduction). The build time increased significantly (340ms → 8.1s) due to Terser processing. The trade-off may not be worthwhile for such small gains.
