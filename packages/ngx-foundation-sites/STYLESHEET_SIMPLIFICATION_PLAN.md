# Simplified Consumer Setup for ngx-foundation-sites

## Goal

Simplify the consumer/library setup by:

1. **Eliminating** the requirement to create `_nfs-settings.scss` (ship defaults)
2. **Simplifying** the `inject: false` entries (keep but streamline)
3. **Replacing** NfsStyleLoader with native CSS `@import` (simpler components)

While preserving:

- Full Foundation Sass variable theming
- Lazy loading of component CSS

## Current Consumer Requirements (Pain Points)

```
Consumer must:
├── Create _nfs-settings.scss with Sass variables     ← ELIMINATE (ship defaults)
├── Add inject: false entries for EACH component      ← KEEP (required for lazy loading)
├── Configure stylePreprocessorOptions.includePaths   ← SIMPLIFY (better defaults)
└── NfsStyleLoader service loads CSS at runtime       ← REPLACE (use CSS @import)
```

## Proposed Solution: Default Settings + CSS @import

### Overview

1. **Ship default `_nfs-settings.scss`** with Foundation defaults (using `!default` flags)
2. **Simplify `includePaths`** so library defaults are found automatically
3. **Replace NfsStyleLoader with CSS `@import url()`** in component styles
4. **Consumers only create settings file if customizing** (optional, not required)

### New Consumer Experience

**Minimal setup (using defaults):**

```json
// angular.json - just add inject: false entries
{
  "styles": ["src/styles.scss", { "input": "node_modules/ngx-foundation-sites/scss/accordion.scss", "bundleName": "accordion", "inject": false }, { "input": "node_modules/ngx-foundation-sites/scss/button.scss", "bundleName": "button", "inject": false }],
  "stylePreprocessorOptions": {
    "includePaths": ["node_modules"]
  }
}
```

**Custom theming (override defaults):**

```scss
// src/styles/_nfs-settings.scss (optional - only if customizing)
// First, import library defaults to get !default values
@import 'ngx-foundation-sites/scss/nfs-settings';

// Then override what you want
$foundation-palette: (
  primary: #6200ea,
  secondary: #00bfa5,
  success: #00c853,
  warning: #ffd600,
  alert: #ff1744,
);
```

```json
// angular.json - add consumer's styles folder to includePaths
{
  "stylePreprocessorOptions": {
    "includePaths": ["node_modules", "src/styles"]
  }
}
```

---

## Implementation Plan

### Phase 1: Ship Default Settings

**File:** `packages/ngx-foundation-sites/src/lib/scss/_nfs-settings.scss` (new)

Create a default settings file that **forwards Foundation's defaults** rather than listing every variable:

```scss
// ═══════════════════════════════════════════════════════════════════════════════
// ngx-foundation-sites Default Settings
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file forwards Foundation's ~490 default variables via @import.
// Consumers can override any variable by creating their own _nfs-settings.scss
// and setting variables BEFORE this import.
//
// Example consumer override:
//   $foundation-palette: (primary: #6200ea, ...);
//   @import 'ngx-foundation-sites/scss/nfs-settings';
//
// ═══════════════════════════════════════════════════════════════════════════════

// Forward ALL Foundation defaults (490 variables with !default flags)
// Foundation's _settings.scss uses !default, so any variable set before
// this import will take precedence.
@import 'foundation-sites/scss/settings/settings';

// ═══════════════════════════════════════════════════════════════════════════════
// ngx-foundation-sites Custom Variables
// ═══════════════════════════════════════════════════════════════════════════════

// Animation speed for accordion expand/collapse (replaces Foundation's JS option)
$nfs-accordion-slide-speed: 250ms !default;
```

**Why this approach:**

- Foundation's `_settings.scss` contains ~490 variables, all with `!default` flags
- By importing it, consumers get all Foundation defaults automatically
- Consumers only need to set variables they want to override BEFORE the import
- No need to manually maintain a copy of Foundation's variables

**Update:** `packages/ngx-foundation-sites/ng-package.json`

- Ensure `_nfs-settings.scss` is included in assets (already configured for SCSS)

### Phase 2: Update Component SCSS Import Pattern

**Current pattern (requires consumer file):**

```scss
// accordion.scss
@import 'nfs-settings'; // Requires consumer to create this file
```

**New pattern (uses library defaults, consumer can override):**

```scss
// accordion.scss
@import 'ngx-foundation-sites/scss/nfs-settings'; // Uses library default

// Foundation imports
@import 'foundation-sites/scss/util/util';
@import 'foundation-sites/scss/global';
@import 'foundation-sites/scss/components/accordion';

@include foundation-accordion;
```

**How consumer override works:**

- Consumer creates `src/styles/_nfs-settings.scss` with their customizations
- Consumer adds `src/styles` to `includePaths` BEFORE `node_modules`
- Sass resolver finds consumer's file first, library default is never loaded

**Files to update:**

- `packages/ngx-foundation-sites/src/lib/scss/accordion.scss`
- `packages/ngx-foundation-sites/src/lib/scss/button.scss`
- (and any future component SCSS files)

### Phase 3: Replace NfsStyleLoader with CSS @import

**Before (accordion.ts):**

```typescript
@Component({
  selector: 'nfs-accordion',
  encapsulation: ViewEncapsulation.None,
  // No styles - loaded via NfsStyleLoader
})
export class NfsAccordion {
  constructor() {
    inject(NfsStyleLoader).load('accordion');
  }
}
```

**After (accordion.ts):**

```typescript
@Component({
  selector: 'nfs-accordion',
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      @import url('/accordion.css');
    `,
  ], // Relative to assets base
})
export class NfsAccordion {
  // No constructor injection needed!
}
```

**Benefits:**

- Native browser CSS loading (optimized, cached, HTTP/2 parallel)
- No JavaScript runtime overhead
- Still lazy-loads (browser fetches when component first renders)
- Simpler component code

**Note:** The CSS path `/accordion.css` assumes consumer's angular.json outputs to root.
Consumer configures output location via `bundleName` in their `inject: false` entry.

### Phase 4: Update Consumer Test App

**File:** `apps/consumer-test-app/project.json`

Update to demonstrate custom Sass theming setup:

```json
{
  "styles": [
    "apps/consumer-test-app/src/styles.scss",
    {
      "input": "node_modules/ngx-foundation-sites/scss/accordion.scss",
      "bundleName": "accordion",
      "inject": false
    },
    {
      "input": "node_modules/ngx-foundation-sites/scss/button.scss",
      "bundleName": "button",
      "inject": false
    }
  ],
  "stylePreprocessorOptions": {
    "includePaths": ["apps/consumer-test-app/src/styles", "node_modules"]
  }
}
```

**Key change:** Consumer's styles folder comes BEFORE `node_modules` in `includePaths`.
This allows consumer's `_nfs-settings.scss` to override library defaults.

### Phase 5: Update Documentation

**File:** `packages/ngx-foundation-sites/README.md`

````markdown
## Option 1: Precompiled CSS (Zero Config)

For consumers who are happy with Foundation defaults:

1. Install the package:
   ```bash
   npm install ngx-foundation-sites
   ```
````

2. Copy precompiled CSS to your assets:

   ```bash
   # In angular.json assets array, add:
   { "glob": "**/*.css", "input": "node_modules/ngx-foundation-sites/css", "output": "/" }
   ```

3. Import and use components - styles load automatically via CSS @import.

### Precompiled RTL

For RTL applications using precompiled CSS, copy the RTL variants:

```json
// angular.json - copy RTL CSS and rename to match component expectations
{
  "assets": [
    {
      "glob": "*-rtl.css",
      "input": "node_modules/ngx-foundation-sites/css",
      "output": "/"
      // Rename accordion-rtl.css → accordion.css so @import finds it
      // (Requires custom build script or file copy)
    }
  ]
}
```

**Note:** Since components use `@import url('/accordion.css')`, RTL users need to
copy the `-rtl.css` files and rename them to remove the `-rtl` suffix.

---

## Option 2: Custom Sass Theming

For consumers who want to customize Foundation variables:

1. Install the package:

   ```bash
   npm install ngx-foundation-sites foundation-sites
   ```

2. Create a settings file with your overrides:

   ```scss
   // src/styles/_nfs-settings.scss
   $foundation-palette: (
     primary: #6200ea,
     secondary: #00bfa5,
     success: #00c853,
     warning: #ffd600,
     alert: #ff1744,
   );

   // For RTL:
   // $global-text-direction: rtl;

   // Import library defaults (gets all Foundation variables)
   @import 'ngx-foundation-sites/scss/nfs-settings';
   ```

3. Configure angular.json:

   ```json
   {
     "styles": ["src/styles.scss", { "input": "node_modules/ngx-foundation-sites/scss/accordion.scss", "bundleName": "accordion", "inject": false }],
     "stylePreprocessorOptions": {
       "includePaths": ["src/styles", "node_modules"]
     }
   }
   ```

4. Import and use components - styles load automatically via CSS @import.

````

---

## Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Settings file | **Required** (must create) | **Optional** (defaults shipped) |
| `inject: false` | Required | Required (no change) |
| `includePaths` | Custom folder + node_modules | Same, but order matters |
| Style loading | JavaScript (NfsStyleLoader) | Native CSS @import |
| Component code | `inject(NfsStyleLoader).load()` | CSS `@import url()` |
| Theming | Full Sass variables | Full Sass variables |
| Lazy loading | Yes (JS-controlled) | Yes (browser-controlled) |

---

## RTL Support Strategy

### For Consumers: Build-Time Only

Consumer RTL support is **build-time only**. No runtime direction switching provided.

Consumer sets `$global-text-direction` in their settings file:

```scss
// _nfs-settings.scss
$global-text-direction: rtl;  // Build for RTL
@import 'ngx-foundation-sites/scss/nfs-settings';
````

The compiled `accordion.css` contains RTL styles. Simple and efficient.

### For Storybook: Runtime Direction Switcher

Storybook needs to test **both directions** without rebuilding. This requires:

1. **Compile both LTR and RTL CSS** via build script
2. **Serve both versions** via staticDirs (`/accordion.css` and `/accordion-rtl.css`)
3. **Globals toolbar switcher** to swap CSS files at runtime

The Storybook direction switcher will:

- Swap `<link>` hrefs between LTR and RTL CSS files
- Update `<html dir="...">` attribute
- Allow testing both directions in one Storybook session

---

## Precompiled CSS in Library Package

### Ship Precompiled CSS with Defaults

The library package includes precompiled CSS files with Foundation defaults:

```
dist/ngx-foundation-sites/
├── css/                      # Precompiled CSS (NEW)
│   ├── accordion.css         # LTR (default)
│   ├── accordion-rtl.css     # RTL variant
│   ├── button.css
│   └── button-rtl.css
├── scss/                     # SCSS source (existing)
│   ├── _nfs-settings.scss
│   ├── accordion.scss
│   └── button.scss
└── ...
```

### Benefits

1. **Zero-config for defaults**: Consumers can use precompiled CSS without any Sass setup
2. **Storybook uses same files**: No separate build script needed
3. **Consistent**: Same CSS in Storybook, consumer defaults, and library tests

### Library Build Configuration

**File:** `packages/ngx-foundation-sites/ng-package.json`

Add CSS compilation to library build:

```json
{
  "assets": [
    { "input": "./src/lib/scss", "glob": "**/*.scss", "output": "scss" },
    { "input": "./dist-css", "glob": "**/*.css", "output": "css" }
  ]
}
```

**File:** `packages/ngx-foundation-sites/project.json`

Add a build target to compile CSS before ng-packagr runs:

```json
{
  "targets": {
    "build-css": {
      "executor": "nx:run-commands",
      "options": {
        "commands": ["node tools/build-component-css.mjs"]
      }
    },
    "build": {
      "dependsOn": ["build-css"]
      // ... existing build config
    }
  }
}
```

**File:** `packages/ngx-foundation-sites/tools/build-component-css.mjs` (new)

```javascript
#!/usr/bin/env node
/**
 * Compiles component SCSS to CSS with Foundation defaults.
 * Generates LTR (default) and RTL versions.
 */
import * as sass from 'sass';
import * as fs from 'fs';
import * as path from 'path';

const components = ['accordion', 'button'];
const outputDir = 'packages/ngx-foundation-sites/dist-css';

fs.mkdirSync(outputDir, { recursive: true });

for (const component of components) {
  for (const direction of ['ltr', 'rtl']) {
    const result = sass.compileString(`$global-text-direction: ${direction};\n@import '${component}';`, {
      loadPaths: ['packages/ngx-foundation-sites/src/lib/scss', 'node_modules'],
    });

    const filename = direction === 'ltr' ? `${component}.css` : `${component}-rtl.css`;
    fs.writeFileSync(path.join(outputDir, filename), result.css);
  }
}

console.log('✓ Component CSS compiled');
```

---

## Storybook Compatibility

### Use Precompiled CSS from Library

Storybook serves the same precompiled CSS files that ship with the library.
**No NfsStyleLoader or NfsTestingStyleLoader needed** - CSS @import in component styles loads directly from staticDirs.

**File:** `packages/ngx-foundation-sites/.storybook/main.ts`

```typescript
const config: StorybookConfig = {
  // ... existing config
  staticDirs: [
    { from: '../dist-css', to: '/' }, // Serve precompiled CSS at root
  ],
};
```

**Note:** Storybook must run after `build-css` target. Update project.json:

```json
{
  "storybook": {
    "dependsOn": ["build-css"]
  }
}
```

### Remove NfsTestingStyleLoader

Since components now use CSS @import and Storybook serves precompiled CSS:

- **Delete** `packages/ngx-foundation-sites/testing/src/nfs-testing-style-loader.service.ts`
- **Remove** NfsTestingStyleLoader from `provideNfsTesting()`
- **Remove** style loader references from `.storybook/preview.ts`

### Storybook Globals Direction Switcher

**File:** `packages/ngx-foundation-sites/.storybook/preview.ts`

```typescript
// Direction switcher - swaps between LTR and RTL CSS files
function setDirection(direction: 'ltr' | 'rtl') {
  document.documentElement.dir = direction;

  // Swap all component CSS files to the correct direction
  document.querySelectorAll('link[data-nfs-component]').forEach((link) => {
    const component = link.getAttribute('data-nfs-component');
    const newHref = direction === 'ltr' ? `/${component}.css` : `/${component}-rtl.css`;
    link.setAttribute('href', newHref);
  });
}

// Storybook globals configuration
export const globalTypes = {
  direction: {
    name: 'Direction',
    description: 'Text direction',
    defaultValue: 'ltr',
    toolbar: {
      icon: 'globe',
      items: ['ltr', 'rtl'],
    },
  },
};

// Decorator to apply direction
export const decorators = [
  (Story, context) => {
    setDirection(context.globals.direction);
    return Story();
  },
];
```

### Handling CSS @import in Storybook

Components use `@import url('/accordion.css')` in their `styles` array.
When Angular renders the component, it creates a `<style>` tag with the @import.

**Solution: Intercept and convert @import to `<link>` tags**

In preview.ts, use a MutationObserver to:

1. Watch for new `<style>` tags with `@import url('/...')`
2. Extract the component name from the URL
3. Create a `<link data-nfs-component="accordion" href="/accordion.css">` tag
4. Remove the `<style>` tag with the @import

This allows the direction switcher to swap `<link>` hrefs.

---

## Implementation Summary

### Step-by-Step Implementation Order

1. **Create default `_nfs-settings.scss`** in `src/lib/scss/`
   - Forward Foundation's settings via `@import 'foundation-sites/scss/settings/settings'`
   - Add only custom ngx-foundation-sites variables (`$nfs-accordion-slide-speed`)

2. **Update component SCSS files** (`accordion.scss`, `button.scss`)
   - Change `@import 'nfs-settings'` to `@import 'ngx-foundation-sites/scss/nfs-settings'`
   - This allows library defaults to be found without consumer creating a file

3. **Create CSS build script** (`tools/build-component-css.mjs`)
   - Compile each component SCSS to CSS with Foundation defaults
   - Generate both LTR and RTL versions
   - Output to `dist-css/` folder (included in package)

4. **Update library build configuration**
   - Add `build-css` target to `project.json`
   - Update `ng-package.json` to include `dist-css` in assets
   - Ensure CSS is built before ng-packagr runs

5. **Update component TypeScript files** (`accordion.ts`, `button.ts`)
   - Remove `inject(NfsStyleLoader).load('componentName')` from constructor
   - Add `styles: [`@import url('/componentName.css');`]` to @Component decorator
   - Keep `encapsulation: ViewEncapsulation.None`

6. **Update Storybook configuration**
   - Add `staticDirs` pointing to `dist-css/` folder
   - Update `preview.ts` for LTR/RTL globals switcher
   - Add MutationObserver to convert @import to `<link>` tags

7. **Update consumer test app**
   - Simplify `_nfs-settings.scss` to only contain overrides
   - Update `includePaths` order in `project.json`
   - Verify build works with new setup

8. **Update documentation**
   - Document two usage modes: precompiled CSS vs custom Sass theming
   - Simplify Quick Start for default usage
   - Add Custom Theming section for Sass users

9. **Remove NfsStyleLoader and NfsTestingStyleLoader**
   - Delete `src/lib/core/nfs-style-loader.service.ts`
   - Delete `testing/src/nfs-testing-style-loader.service.ts`
   - Update `provide-nfs-testing.ts` to remove style loader provider
   - Update public API exports

### Key Files Summary

| File                                                                            | Change Type                                                             |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `packages/ngx-foundation-sites/src/lib/scss/_nfs-settings.scss`                 | **Create** - forwards Foundation defaults                               |
| `packages/ngx-foundation-sites/src/lib/scss/accordion.scss`                     | Modify - update import path                                             |
| `packages/ngx-foundation-sites/src/lib/scss/button.scss`                        | Modify - update import path                                             |
| `packages/ngx-foundation-sites/tools/build-component-css.mjs`                   | **Create** - compiles CSS for package                                   |
| `packages/ngx-foundation-sites/project.json`                                    | Modify - add build-css target, storybook dependsOn                      |
| `packages/ngx-foundation-sites/ng-package.json`                                 | Modify - include dist-css in assets                                     |
| `packages/ngx-foundation-sites/src/lib/accordion/accordion.ts`                  | Modify - remove NfsStyleLoader, add CSS @import                         |
| `packages/ngx-foundation-sites/src/lib/button/button.ts`                        | Modify - remove NfsStyleLoader, add CSS @import                         |
| `packages/ngx-foundation-sites/src/lib/core/nfs-style-loader.service.ts`        | **Delete** - no longer needed                                           |
| `packages/ngx-foundation-sites/testing/src/nfs-testing-style-loader.service.ts` | **Delete** - no longer needed                                           |
| `packages/ngx-foundation-sites/testing/src/provide-nfs-testing.ts`              | Modify - remove style loader                                            |
| `packages/ngx-foundation-sites/.storybook/main.ts`                              | Modify - add staticDirs for dist-css                                    |
| `packages/ngx-foundation-sites/.storybook/preview.ts`                           | Modify - add direction switcher + MutationObserver, remove style loader |
| `packages/ngx-foundation-sites/README.md`                                       | Modify - update documentation                                           |
| `apps/consumer-test-app/project.json`                                           | Modify - update config                                                  |
| `apps/consumer-test-app/src/styles/_nfs-settings.scss`                          | Modify - simplify to overrides only                                     |

---

## Migration Path for Existing Consumers

1. **Keep `inject: false` entries** (still required for lazy loading)
2. **Update `includePaths`** order: put custom styles folder BEFORE `node_modules`
3. **Simplify `_nfs-settings.scss`** (optional): remove defaults, keep only overrides
4. **No code changes** needed in application components
