# Simplified Consumer Setup for ngx-foundation-sites

## Status: ✅ Implemented

This plan has been implemented. See [Implementation Notes](#implementation-notes) for deviations from the original proposal.

---

## Goal

Simplify the consumer/library setup by:

1. **Eliminating** the requirement to create `_nfs-settings.scss` (ship defaults)
2. **Simplifying** the `inject: false` entries (keep but streamline)
3. **Simplifying** NfsStyleLoader (remove RTL logic, keep reference-counted loading)

While preserving:

- Full Foundation Sass variable theming
- Lazy loading of component CSS

## Current Consumer Requirements (Pain Points)

```
Consumer must:
├── Create _nfs-settings.scss with Sass variables     ← ELIMINATE (ship defaults)
├── Add inject: false entries for EACH component      ← KEEP (required for lazy loading)
├── Configure stylePreprocessorOptions.includePaths   ← SIMPLIFY (better defaults)
└── NfsStyleLoader service loads CSS at runtime       ← SIMPLIFY (remove RTL logic)
```

## Solution: Default Settings + Simplified NfsStyleLoader

### Overview

1. **Ship default `_nfs-settings.scss`** with Foundation defaults (using `!default` flags)
2. **Simplify `includePaths`** so library defaults are found automatically
3. **Simplify NfsStyleLoader** to basic load/unload (RTL handled by Storybook only)
4. **Consumers only create settings file if customizing** (optional, not required)

### New Consumer Experience

**Minimal setup (using precompiled CSS):**

```json
// angular.json - copy precompiled CSS to assets
{
  "assets": [{ "glob": "**/*.css", "input": "node_modules/ngx-foundation-sites/css", "output": "/" }]
}
```

**Custom theming (compile Sass with overrides):**

```scss
// src/styles/_nfs-settings.scss (optional - only if customizing)
// Set overrides BEFORE they're used (Sass variables don't have !default in Foundation's settings)
$foundation-palette: (
  primary: #6200ea,
  secondary: #00bfa5,
  success: #00c853,
  warning: #ffd600,
  alert: #ff1744,
);

// For RTL support:
// $global-text-direction: rtl;
```

```json
// angular.json - compile component SCSS with your settings
{
  "styles": [
    "src/styles.scss",
    {
      "input": "node_modules/ngx-foundation-sites/scss/accordion.scss",
      "bundleName": "nfs-accordion",
      "inject": false
    }
  ],
  "stylePreprocessorOptions": {
    "includePaths": ["src/styles", "node_modules/ngx-foundation-sites/scss/defaults", "node_modules"]
  }
}
```

---

## Implementation Plan

### Phase 1: Ship Default Settings ✅

**File:** `packages/ngx-foundation-sites/src/lib/scss/defaults/_nfs-settings.scss`

Created a default settings file in a `defaults/` subfolder:

```scss
// ═══════════════════════════════════════════════════════════════════════════════
// ngx-foundation-sites Default Settings
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file defines library-specific variables for ngx-foundation-sites.
// Foundation defaults are loaded via individual component stylesheets.
//
// IMPORTANT: This file must NOT import Foundation's settings/settings because
// that file unconditionally sets $global-text-direction: ltr (no !default),
// which would override RTL settings.
//
// CONSUMER OVERRIDE PATTERN:
// 1. Create src/styles/_nfs-settings.scss with your customizations
// 2. Add src/styles to includePaths BEFORE node_modules
// 3. Sass resolver finds consumer's file first, library default is never loaded
//
// ═══════════════════════════════════════════════════════════════════════════════

/// Animation speed for accordion expand/collapse.
$nfs-accordion-slide-speed: 250ms !default;
```

**Why `defaults/` subfolder:**

- Allows clear `includePaths` ordering: consumer styles → library defaults → node_modules
- Consumer's `_nfs-settings.scss` takes precedence when their folder is listed first
- The nested structure makes the override mechanism explicit

### Phase 2: Update Component SCSS Import Pattern ✅

Component SCSS files use the simple import pattern:

```scss
// accordion.scss
@import 'nfs-settings'; // Resolved via includePaths

// Foundation imports
@import 'foundation-sites/scss/util/util';
@import 'foundation-sites/scss/global';
@import 'foundation-sites/scss/components/accordion';

@include foundation-accordion;
```

**How consumer override works:**

- Consumer creates `src/styles/_nfs-settings.scss` with their customizations
- Consumer adds `src/styles` to `includePaths` BEFORE library defaults
- Sass resolver finds consumer's file first, library default is never loaded

### Phase 3: Simplify NfsStyleLoader ✅

**Original Plan:** Replace NfsStyleLoader with CSS `@import url()` in component styles.

**Why This Failed:** ng-packagr uses ESBuild for CSS processing. ESBuild resolves and inlines `@import` statements at build time. Runtime URLs like `/accordion.css` don't exist during the library build, causing failures.

**Actual Solution:** Keep NfsStyleLoader but simplify it:

```typescript
@Injectable({ providedIn: 'platform' })
export class NfsStyleLoader {
  readonly #document = inject(DOCUMENT);
  readonly #linkRefs = new Map<string, StyleLinkRef>();

  load(id: string, href: string): void {
    // Reference-counted: first instance loads, subsequent instances increment count
    const existing = this.#linkRefs.get(id);
    if (existing) {
      existing.count++;
      return;
    }

    const link = this.#document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = `nfs-style-${id}`;
    this.#document.head.appendChild(link);
    this.#linkRefs.set(id, { element: link, count: 1 });
  }

  unload(id: string): void {
    // Reference-counted: last instance removes the stylesheet
    const existing = this.#linkRefs.get(id);
    if (!existing) return;

    existing.count--;
    if (existing.count === 0) {
      existing.element.remove();
      this.#linkRefs.delete(id);
    }
  }
}
```

**Components use explicit paths:**

```typescript
// accordion.ts
constructor() {
  afterNextRender(() => {
    this.#styleLoader.load('accordion', '/nfs-accordion.css');
  });

  this.#destroyRef.onDestroy(() => {
    this.#styleLoader.unload('accordion');
  });
}
```

**Benefits of this approach:**

- Reference-counting prevents duplicate stylesheets
- Platform-scoped service works across Storybook story boundaries
- Explicit paths allow consumers to configure output location via `bundleName`
- No ESBuild interference since `<link>` elements are created at runtime

### Phase 4: Update Consumer Test App ✅

**File:** `apps/consumer-test-app/project.json`

```json
{
  "styles": [
    "apps/consumer-test-app/src/styles.scss",
    {
      "input": "dist/packages/ngx-foundation-sites/scss/accordion.scss",
      "bundleName": "nfs-accordion",
      "inject": false
    },
    {
      "input": "dist/packages/ngx-foundation-sites/scss/button.scss",
      "bundleName": "nfs-button",
      "inject": false
    }
  ],
  "stylePreprocessorOptions": {
    "includePaths": ["apps/consumer-test-app/src/styles", "dist/packages/ngx-foundation-sites/scss/defaults", "dist/packages/ngx-foundation-sites/scss", "node_modules"]
  }
}
```

**Key points:**

- `bundleName: "nfs-accordion"` outputs to `/nfs-accordion.css` (matches component expectation)
- Consumer's styles folder comes FIRST in `includePaths` for override precedence
- Library defaults folder comes SECOND as fallback
- Separate RTL configuration uses `styles-rtl/` folder with `$global-text-direction: rtl`

### Phase 5: Update Documentation ✅

**File:** `packages/ngx-foundation-sites/README.md`

Updated with two options:

1. **Option 1: Precompiled CSS (Zero Config)** - Copy CSS from `node_modules/ngx-foundation-sites/css/`
2. **Option 2: Custom Sass Theming** - Compile SCSS with custom `_nfs-settings.scss`

---

## Comparison: Before vs After

| Aspect                | Before                            | After                                      |
| --------------------- | --------------------------------- | ------------------------------------------ |
| Settings file         | **Required** (must create)        | **Optional** (defaults shipped)            |
| `inject: false`       | Required                          | Required (no change)                       |
| `includePaths`        | Custom folder + node_modules      | Same, but order matters for overrides      |
| Style loading         | NfsStyleLoader with RTL logic     | NfsStyleLoader simplified (no RTL logic)   |
| Component code        | `inject(NfsStyleLoader).load(id)` | `NfsStyleLoader.load(id, href)` with path  |
| RTL in Storybook      | Built into NfsStyleLoader         | MutationObserver in preview.ts             |
| RTL for consumers     | Runtime switching possible        | Build-time only (simpler)                  |
| Theming               | Full Sass variables               | Full Sass variables                        |
| Lazy loading          | Yes (JS-controlled)               | Yes (JS-controlled)                        |
| Testing entrypoint    | `ngx-foundation-sites/testing`    | **Removed** (not needed)                   |
| `NFS_STYLE_BASE_PATH` | Configurable injection token      | **Removed** (paths explicit in components) |

---

## RTL Support Strategy

### For Consumers: Build-Time Only

Consumer RTL support is **build-time only**. No runtime direction switching provided.

Consumer sets `$global-text-direction` in their settings file:

```scss
// _nfs-settings.scss
$global-text-direction: rtl; // Build for RTL
```

The compiled `nfs-accordion.css` contains RTL styles. Simple and efficient.

### For Storybook: Runtime Direction Switcher

Storybook needs to test **both directions** without rebuilding. This is handled by:

1. **Compile both LTR and RTL CSS** via `build-component-css.mjs`
2. **Serve both versions** via staticDirs (`/nfs-accordion.css` and `/nfs-accordion-rtl.css`)
3. **MutationObserver in preview.ts** swaps CSS files when direction changes

See `RTL_SIMPLIFICATION_PLAN.md` for details.

---

## Precompiled CSS in Library Package

### Ship Precompiled CSS with Defaults

The library package includes precompiled CSS files with Foundation defaults:

```
dist/ngx-foundation-sites/
├── css/                          # Precompiled CSS
│   ├── nfs-accordion.css         # LTR (default)
│   ├── nfs-accordion-rtl.css     # RTL variant
│   ├── nfs-button.css
│   └── nfs-button-rtl.css
├── scss/                         # SCSS source
│   ├── defaults/
│   │   └── _nfs-settings.scss    # Library defaults
│   ├── accordion.scss
│   └── button.scss
└── ...
```

### Library Build Configuration

**File:** `packages/ngx-foundation-sites/ng-package.json`

```json
{
  "assets": [
    { "input": "./src/lib/scss", "glob": "**/*.scss", "output": "scss" },
    { "input": "./dist-css", "glob": "**/*.css", "output": "css" }
  ]
}
```

**File:** `packages/ngx-foundation-sites/project.json`

```json
{
  "targets": {
    "build-css": {
      "executor": "nx:run-commands",
      "outputs": ["{projectRoot}/dist-css"],
      "options": {
        "command": "node packages/ngx-foundation-sites/tools/build-component-css.mjs"
      }
    },
    "build": {
      "dependsOn": ["build-css"]
    },
    "storybook": {
      "dependsOn": ["build-css"]
    }
  }
}
```

**File:** `packages/ngx-foundation-sites/tools/build-component-css.mjs`

Auto-discovers component SCSS files and compiles both LTR and RTL versions with the `nfs-` prefix.

---

## Storybook Compatibility

### Use Precompiled CSS from Library

Storybook serves precompiled CSS via staticDirs:

**File:** `packages/ngx-foundation-sites/.storybook/main.ts`

```typescript
const config: StorybookConfig = {
  staticDirs: [{ from: '../dist-css', to: '/' }],
};
```

### RTL Direction Switcher

**File:** `packages/ngx-foundation-sites/.storybook/preview.ts`

MutationObserver watches `document.documentElement.dir` and swaps stylesheet hrefs:

```typescript
function swapNfsStylesheets(direction: string) {
  document.querySelectorAll<HTMLLinkElement>('link[id^="nfs-style"]').forEach((link) => {
    const href = link.href;
    if (direction === 'rtl' && !href.includes('-rtl.css')) {
      link.href = href.replace('.css', '-rtl.css');
    } else if (direction !== 'rtl' && href.includes('-rtl.css')) {
      link.href = href.replace('-rtl.css', '.css');
    }
  });
}
```

---

## Implementation Notes

### Why CSS @import Doesn't Work

The original plan proposed using native CSS `@import url()` in component styles:

```typescript
// DOES NOT WORK
@Component({
  styles: [`@import url('/accordion.css');`],
})
```

**This approach failed because:**

1. **ng-packagr uses ESBuild** for CSS processing during library builds
2. **ESBuild resolves `@import` statements** and attempts to inline the referenced CSS
3. **Runtime URLs** like `/accordion.css` don't exist at build time, causing build failures
4. Even if it didn't fail, the CSS would be inlined, defeating lazy-loading

**Solution:** Keep NfsStyleLoader to create `<link>` elements at runtime. The browser fetches CSS lazily when components first render.

### Files Changed

| File                                       | Change                                |
| ------------------------------------------ | ------------------------------------- |
| `src/lib/scss/defaults/_nfs-settings.scss` | **Created** - library defaults        |
| `tools/build-component-css.mjs`            | **Created** - CSS build script        |
| `src/lib/core/nfs-style-loader.service.ts` | Simplified - removed RTL logic        |
| `src/lib/accordion/accordion.ts`           | Updated - explicit CSS path           |
| `src/lib/button/button.ts`                 | Updated - explicit CSS path           |
| `.storybook/main.ts`                       | Updated - staticDirs for CSS          |
| `.storybook/preview.ts`                    | Updated - RTL MutationObserver        |
| `testing/` (entire folder)                 | **Deleted** - no longer needed        |
| `ng-package.json`                          | Updated - include dist-css in assets  |
| `project.json`                             | Updated - build-css target, dependsOn |

### Files NOT Changed (Deviation from Plan)

| File                                    | Planned Change  | Why Not Changed                      |
| --------------------------------------- | --------------- | ------------------------------------ |
| `src/lib/core/nfs-style-loader.service` | Delete          | Still needed (ESBuild limitation)    |
| Component TS files                      | Add CSS @import | Doesn't work with ng-packagr/ESBuild |
