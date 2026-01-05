# Plan: Sass Compilation Performance Optimization

## Research Summary

After extensive research, here are the findings on bundle optimization approaches:

| Approach            | Feasibility    | Expected Gain                     | Status                      |
| ------------------- | -------------- | --------------------------------- | --------------------------- |
| ES2024 target       | ✅ Done        | 0% (dart2js outputs ES5)          | Implemented                 |
| Terser minification | ✅ Tested      | -1.8% size, no parse improvement  | Reverted                    |
| Lebab ES5→ES6       | ⚠️ Risky       | ~2-3% size, high risk of breaking | Not recommended             |
| AssemblyScript port | ❌ Blocked     | N/A                               | Missing closures/regex      |
| dart2wasm           | ❌ Blocked     | N/A                               | Sass uses incompatible deps |
| Web API             | ❌ Not helpful | Adds latency                      | No public API available     |

**Conclusion**: Bundle-level optimizations have hit diminishing returns. Focus on **runtime optimizations** instead.

---

## Current Performance Profile

```
Sass load:        ~165ms (one-time)
Theme compile:    ~500-1300ms (per theme change)
Worker init:      ~200ms (one-time, parallel)
```

The **compilation time** (~500-1300ms) is the real bottleneck, not Sass loading.

---

## Recommended Optimizations

### Option 1: CSS Caching (HIGH IMPACT)

Cache compiled CSS per component + theme state hash. On theme change, only recompile components with changed variables.

**How it works:**

1. Generate hash from theme state relevant to each component
2. Store compiled CSS in IndexedDB/localStorage
3. On theme change, check cache before recompiling
4. Only recompile components with cache miss

**Expected improvement:**

- Repeated theme switches: **~95% faster** (cache hit)
- First compile: Same as now

**Files to modify:**

- `src/storybook/sass-compiler.ts` — Add caching layer
- Create `src/storybook/sass-cache.ts` — Cache management

---

### Option 2: Precompiled Default Themes (MEDIUM IMPACT)

Ship precompiled CSS for common theme configurations (default, dark, high-contrast).

**How it works:**

1. At build time, compile CSS for preset themes
2. Store in `.storybook/static/themes/`
3. Load precompiled CSS instantly for known themes
4. Fall back to runtime compilation for custom themes

**Expected improvement:**

- Default themes: **~100% faster** (no compilation)
- Custom themes: Same as now

**Files to modify:**

- Create `tools/precompile-themes.mjs`
- Modify `sass-compiler.ts` to check for precompiled CSS

---

### Option 3: Lazy Sass Loading (LOW IMPACT)

Defer Sass loading until first theme switch (instead of on Storybook load).

**How it works:**

1. Don't initialize worker pool on page load
2. Load Sass only when user interacts with theme panel
3. Show loading indicator during first compilation

**Expected improvement:**

- Initial page load: **165ms faster**
- First theme switch: Same (deferred cost)

**Trade-off:** First theme interaction is slower.

---

### Option 4: Component-Level Change Detection (MEDIUM IMPACT)

Track which theme variables affect which components. Only recompile affected components.

**How it works:**

1. Map theme variables → components (e.g., `accordion.background` only affects accordion)
2. On theme change, diff old vs new state
3. Recompile only components with changed variables

**Expected improvement:**

- Partial theme changes: **50-80% faster**
- Full theme changes: Same as now

**Files to modify:**

- `src/storybook/sass-compiler.ts` — Add variable→component mapping
- Leverage existing `compileComponentsSelectively()` API

---

## Selected: Component Change Detection

Track which theme variables affect which components. Only recompile components with changed variables.

**Expected improvement:**

- Partial theme changes: **50-80% faster**
- Full theme changes: Same as now
- Leverages existing `compileComponentsSelectively()` API

---

## Implementation Plan

### Step 1: Create Variable→Component Mapping

Create `src/storybook/theme-variable-map.ts`:

```typescript
import type { ThemeState } from '../../.storybook/addons/theme-panel/types';
import type { AvailableComponent } from './generated/sass-bundle';

/**
 * Maps theme state paths to the components they affect.
 * Used to determine which components need recompilation when theme changes.
 */
export const THEME_VARIABLE_MAP: Record<string, AvailableComponent[]> = {
  // Palette affects all components (global colors)
  'palette.primary': ['accordion', 'button'],
  'palette.secondary': ['accordion', 'button'],
  'palette.success': ['button'],
  'palette.warning': ['button'],
  'palette.alert': ['button'],

  // Accordion-specific variables
  'accordion.background': ['accordion'],
  'accordion.plusminus': ['accordion'],
  'accordion.titleFontSize': ['accordion'],
  'accordion.itemPadding': ['accordion'],
  'accordion.slideSpeed': ['accordion'],

  // Button-specific variables
  'button.padding': ['button'],
  'button.radius': ['button'],
  'button.fontSize': ['button'],
};

/**
 * Compares two theme states and returns which components need recompilation.
 */
export function getAffectedComponents(oldState: ThemeState | null, newState: ThemeState): AvailableComponent[] {
  // First compilation - all components
  if (!oldState) {
    return ['accordion', 'button'];
  }

  const affected = new Set<AvailableComponent>();

  for (const [path, components] of Object.entries(THEME_VARIABLE_MAP)) {
    const oldValue = getNestedValue(oldState, path);
    const newValue = getNestedValue(newState, path);

    if (!deepEqual(oldValue, newValue)) {
      components.forEach((c) => affected.add(c));
    }
  }

  return [...affected];
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((curr, key) => (curr as Record<string, unknown>)?.[key], obj);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
```

### Step 2: Add State Tracking to Theme Service

Modify `.storybook/addons/theme-panel/nfs-theme.service.ts`:

Add previous state tracking:

```typescript
#previousThemeState: ThemeState | null = null;

async applyThemeState(themeState: ThemeState): Promise<void> {
  const affected = getAffectedComponents(this.#previousThemeState, themeState);

  if (affected.length === 0) {
    console.log('[nfs-theme] No components affected, skipping compilation');
    return;
  }

  console.log(`[nfs-theme] Recompiling ${affected.length} component(s):`, affected);

  // Use selective compilation
  const cssMap = await compileComponentsSelectively(affected, themeState);

  // Merge with existing CSS for unchanged components
  this.#updateStyles(cssMap, affected);

  this.#previousThemeState = structuredClone(themeState);
}
```

### Step 3: Update Style Application

The style application needs to handle partial updates:

```typescript
#componentStyles = new Map<AvailableComponent, string>();

#updateStyles(newCss: Map<AvailableComponent, string>, affected: AvailableComponent[]): void {
  // Update only affected components
  for (const [component, css] of newCss) {
    this.#componentStyles.set(component, css);
  }

  // Combine all component styles
  const fullCss = [...this.#componentStyles.values()].join('\n');
  this.#applyToStyleElement(fullCss);
}
```

---

## Files to Create/Modify

| File                                                 | Action                                          |
| ---------------------------------------------------- | ----------------------------------------------- |
| `src/storybook/theme-variable-map.ts`                | **Create** — Variable→component mapping         |
| `.storybook/addons/theme-panel/nfs-theme.service.ts` | Add change detection                            |
| `src/storybook/sass-compiler.ts`                     | Already has `compileComponentsSelectively()` ✅ |

---

## Verification

1. Open Storybook with console open
2. Change only accordion background color
3. Verify console shows: `Recompiling 1 component(s): ["accordion"]`
4. Change a palette color (affects all components)
5. Verify console shows: `Recompiling 2 component(s): ["accordion", "button"]`
6. Measure time improvement for partial changes

---

## Research References

- [Speeding Up Sass Compilation (OddBird)](https://www.oddbird.net/2024/08/14/sass-compiler/)
- [Making Sass Faster (CSS-Tricks)](https://css-tricks.com/a-proof-of-concept-for-making-sass-faster/)
- [dart2js ES target discussion](https://github.com/dart-lang/sdk/issues/37759)
- [Dart to Wasm tracking issue](https://github.com/dart-lang/sdk/issues/32894)
- [AssemblyScript status](https://www.assemblyscript.org/status.html)
