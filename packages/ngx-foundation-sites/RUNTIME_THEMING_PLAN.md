# Runtime Sass Theming for ngx-foundation-sites Storybook

## Goal

Enable runtime Foundation theming in Storybook by compiling Sass in the browser, allowing users to adjust `$foundation-palette` and component-specific variables (e.g., `$accordion-background`) and see changes instantly.

---

## Status

| Phase   | Status      | Notes                                       |
| ------- | ----------- | ------------------------------------------- |
| Phase 1 | ✅ Complete | POC validated, all success criteria met     |
| Phase 2 | 📋 Planned  | Full addon panel with per-variable controls |

---

## Phase 1: Proof of Concept ✅

Start with a minimal POC to validate browser Sass compilation with Foundation imports.

### POC Scope

- Browser Sass compilation working with Foundation import chains
- `$foundation-palette` colors configurable (5 colors)
- Simple Storybook toolbar dropdown for preset themes
- Component-specific variables (future)
- Custom addon panel (future)
- Color pickers / individual controls (future)

### POC Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STORYBOOK                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌─────────────────────────────────┐   │
│  │ Toolbar Dropdown │    │         Story Preview           │   │
│  │ [Theme: Default▼]│    │                                 │   │
│  │  • Default       │───▶│  <style id="nfs-runtime-css">   │   │
│  │  • Ocean         │    │    .accordion { ... }           │   │
│  │  • Forest        │    │  </style>                       │   │
│  │  • Sunset        │    │                                 │   │
│  └──────────────────┘    └─────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Browser Sass Compiler                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ Preset Vars  │  │ Sass Bundle  │  │ Dart Sass    │  │   │
│  │  │ (in code)    │  │ (static JS)  │  │ (lazy CDN)   │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### POC Implementation Steps

#### Step 1: Sass Source Bundler

**File**: `packages/ngx-foundation-sites/tools/bundle-sass-sources.mjs`

Create a Node.js script that reads all necessary Sass files and outputs a TypeScript module.

```javascript
// Discovers and bundles:
// - Library: _nfs-settings.scss, accordion.scss, button.scss
// - Foundation: util/*, _global.scss, components/*, vendor/*
// Output: src/storybook/generated/sass-bundle.ts
```

**Output format**:

```typescript
export const SASS_SOURCES: Record<string, string> = {
  'nfs-settings': `$nfs-accordion-slide-speed: 250ms !default;`,
  'foundation-sites/scss/util/util': `@import 'math'; @import 'unit'; ...`,
  'foundation-sites/scss/util/_math': `/* math functions */`,
  // ... ~50 files
};
```

#### Step 2: Browser Sass Compiler Module

**File**: `packages/ngx-foundation-sites/src/storybook/browser-sass-compiler.ts`

A standalone module (not Angular service for simplicity in POC):

```typescript
import { SASS_SOURCES } from './generated/sass-bundle';

let sassModule: typeof import('sass') | null = null;

export async function compileSass(component: string, palette: FoundationPalette): Promise<string> {
  // Lazy load Dart Sass from JSPM
  if (!sassModule) {
    sassModule = await import('https://jspm.dev/sass');
  }

  const scss = `
    $foundation-palette: (
      primary: ${palette.primary},
      secondary: ${palette.secondary},
      success: ${palette.success},
      warning: ${palette.warning},
      alert: ${palette.alert},
    );
    @import '${component}';
  `;

  const result = await sassModule.compileStringAsync(scss, {
    importers: [
      {
        canonicalize(url: string) {
          return new URL(`bundle:${url}`);
        },
        load(url: URL) {
          const path = url.pathname;
          const content = SASS_SOURCES[path] ?? SASS_SOURCES[`_${path}`];
          if (!content) throw new Error(`Sass file not found: ${path}`);
          return { contents: content, syntax: 'scss' as const };
        },
      },
    ],
  });

  return result.css;
}

export interface FoundationPalette {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  alert: string;
}
```

#### Step 3: Preset Themes

**File**: `packages/ngx-foundation-sites/src/storybook/theme-presets.ts`

```typescript
import type { FoundationPalette } from './browser-sass-compiler';

export const THEME_PRESETS: Record<string, FoundationPalette> = {
  default: {
    primary: '#0d5a89',
    secondary: '#595959',
    success: '#1a7f3e',
    warning: '#8a6500',
    alert: '#a33a2a',
  },
  ocean: {
    primary: '#006994',
    secondary: '#40798c',
    success: '#70a9a1',
    warning: '#cfd7c7',
    alert: '#f6511d',
  },
  forest: {
    primary: '#2d6a4f',
    secondary: '#40916c',
    success: '#52b788',
    warning: '#95d5b2',
    alert: '#b7094c',
  },
  sunset: {
    primary: '#e07a5f',
    secondary: '#3d405b',
    success: '#81b29a',
    warning: '#f2cc8f',
    alert: '#c1121f',
  },
};
```

#### Step 4: Storybook Integration

**Modify**: `packages/ngx-foundation-sites/.storybook/preview.ts`

Add theme toolbar and decorator:

```typescript
// Add to globalTypes
globalTypes: {
  direction: { /* existing */ },
  nfsTheme: {
    description: 'Foundation color theme',
    toolbar: {
      title: 'Theme',
      icon: 'paintbrush',
      items: [
        { value: 'default', title: 'Default' },
        { value: 'ocean', title: 'Ocean' },
        { value: 'forest', title: 'Forest' },
        { value: 'sunset', title: 'Sunset' },
      ],
      dynamicTitle: true,
    },
  },
},

// Add theme decorator
decorators: [
  // Existing direction decorator...

  // Theme decorator
  (story, context) => {
    const themeName = context.globals['nfsTheme'] || 'default';
    // Compile and inject CSS (with caching/debouncing)
    injectRuntimeTheme(themeName);
    return story();
  },
],
```

#### Step 5: Runtime CSS Injection

**File**: `packages/ngx-foundation-sites/src/storybook/runtime-theme-injector.ts`

```typescript
import { compileSass } from './browser-sass-compiler';
import { THEME_PRESETS } from './theme-presets';

const compiledCache = new Map<string, string>();
let currentStyleElement: HTMLStyleElement | null = null;

export async function injectRuntimeTheme(themeName: string) {
  // Check cache
  if (!compiledCache.has(themeName)) {
    const palette = THEME_PRESETS[themeName];

    // Compile all components (or just the ones in use)
    const accordionCss = await compileSass('accordion', palette);
    const buttonCss = await compileSass('button', palette);

    compiledCache.set(themeName, accordionCss + buttonCss);
  }

  // Inject CSS
  if (!currentStyleElement) {
    currentStyleElement = document.createElement('style');
    currentStyleElement.id = 'nfs-runtime-theme';
    document.head.appendChild(currentStyleElement);
  }

  currentStyleElement.textContent = compiledCache.get(themeName)!;
}
```

### POC Files Summary

| File                                      | Type      | Description                       |
| ----------------------------------------- | --------- | --------------------------------- |
| `tools/bundle-sass-sources.mjs`           | New       | Build script to bundle Sass       |
| `src/storybook/generated/sass-bundle.ts`  | Generated | Bundled Sass files as strings     |
| `src/storybook/browser-sass-compiler.ts`  | New       | Browser Sass compilation logic    |
| `src/storybook/theme-presets.ts`          | New       | Preset palette definitions        |
| `src/storybook/runtime-theme-injector.ts` | New       | CSS injection logic               |
| `.storybook/preview.ts`                   | Modify    | Add globalTypes + decorator       |
| `project.json`                            | Modify    | Add bundle-sass target dependency |

### POC Build Integration

Add to `packages/ngx-foundation-sites/project.json`:

```json
{
  "targets": {
    "bundle-sass": {
      "executor": "nx:run-commands",
      "options": {
        "command": "node tools/bundle-sass-sources.mjs",
        "cwd": "packages/ngx-foundation-sites"
      }
    },
    "storybook": {
      "dependsOn": ["build-css", "bundle-sass"]
    }
  }
}
```

### POC Success Criteria

All criteria verified and passing:

- [x] Storybook loads without errors
- [x] Theme dropdown appears in toolbar
- [x] Selecting a theme triggers Sass compilation (visible in console)
- [x] Component colors change according to selected palette
- [x] Compilation completes in <500ms after first load
- [x] Subsequent theme switches use cached CSS (instant)

### Implementation Notes

**Key Learnings from POC:**

1. **Foundation color extraction**: Must call `@include add-foundation-colors()` after injecting the palette to populate `-color` suffixed variables (e.g., `$primary-color`).

2. **Sass importer resolution**: Foundation's `@import 'util/util'` chains require careful path normalization. The bundler maps both prefixed (`_util`) and non-prefixed (`util`) paths.

3. **Build-time vs runtime**: The POC validates that browser Sass compilation is viable (~200-300ms per component). Consumer theming still uses build-time compilation via `_nfs-settings.scss`.

**Files Implemented:**

| File                                      | Description                             |
| ----------------------------------------- | --------------------------------------- |
| `tools/bundle-sass-sources.mjs`           | Bundles Foundation + library Sass files |
| `src/storybook/generated/sass-bundle.ts`  | Generated module with Sass sources      |
| `src/storybook/browser-sass-compiler.ts`  | Browser Sass compilation with JSPM      |
| `src/storybook/theme-presets.ts`          | Four preset color palettes              |
| `src/storybook/runtime-theme-injector.ts` | CSS injection with caching              |
| `.storybook/preview.ts`                   | Theme toolbar + decorator integration   |

---

## Phase 2: Full Implementation

Replace Phase 1 POC (preset theme dropdown) with a custom Storybook addon panel providing fine-grained control over Foundation Sass variables.

### Key Decisions

- **No preset themes** - Custom variable controls with Foundation defaults only
- **Split sliders for spacing** - Multi-value properties use vertical/horizontal sliders
- **Export options** - Both copy-to-clipboard AND file download
- **Debouncing** - 300ms debounce on variable changes

---

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STORYBOOK                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌─────────────────────────────────┐   │
│  │ Theme Addon Panel│    │         Story Preview           │   │
│  │                  │    │                                 │   │
│  │ [Colors]         │───▶│  <style id="nfs-runtime-theme"> │   │
│  │ • Primary: ████  │    │    .accordion { ... }           │   │
│  │ • Secondary: ███ │    │  </style>                       │   │
│  │                  │    │                                 │   │
│  │ [Accordion]      │    │  <nfs-accordion>                │   │
│  │ • Background     │    │    ...                          │   │
│  │ • Title Size     │    │  </nfs-accordion>               │   │
│  └────────┬─────────┘    └─────────────────────────────────┘   │
│           │                              ▲                      │
│           ▼                              │                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Browser Sass Compiler                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ Theme State  │  │ Sass Bundle  │  │ Dart Sass    │   │   │
│  │  │ (globals)    │  │ (static JS)  │  │ (JSPM CDN)   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Files to Create

#### Type Definitions

**File**: `.storybook/addons/theme-panel/types.ts`

```typescript
export type VariableType = 'color' | 'size' | 'spacing' | 'duration' | 'boolean';

export interface VariableDefinition {
  sassVar: string;
  label: string;
  type: VariableType;
  defaultValue: string | boolean;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface VariableSection {
  id: string;
  title: string;
  variables: VariableDefinition[];
}

export interface SpacingValue {
  vertical: string; // e.g., "1.25rem"
  horizontal: string; // e.g., "1rem"
}

export interface ThemeState {
  palette: { primary; secondary; success; warning; alert: string };
  accordion: {
    background: string;
    plusminus: boolean;
    titleFontSize: string;
    itemPadding: SpacingValue;
    slideSpeed: string;
  };
  button: {
    padding: SpacingValue;
    radius: string;
    fontSize: string;
  };
}
```

#### Theme Defaults

**File**: `src/storybook/theme-defaults.ts`

- Foundation's default palette colors (`#1779ba`, `#767676`, etc.)
- Default accordion variables
- Default button variables
- `VARIABLE_SECTIONS` array for UI generation
- `DEFAULT_THEME_STATE` object

#### Addon Components

**Directory**: `.storybook/addons/theme-panel/`

| File                            | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `constants.ts`                  | Addon IDs and param keys                    |
| `manager.tsx`                   | Addon registration with Storybook           |
| `ThemePanel.tsx`                | Main panel with collapsible sections        |
| `components/ColorControl.tsx`   | Color picker + hex input                    |
| `components/SliderControl.tsx`  | Range slider for single-value sizes         |
| `components/SpacingControl.tsx` | Two sliders for vertical/horizontal spacing |
| `components/BooleanControl.tsx` | Checkbox toggle                             |
| `components/SectionHeader.tsx`  | Collapsible section header                  |

---

### Files to Modify

#### Browser Sass Compiler

**File**: `src/storybook/browser-sass-compiler.ts`

**Add**:

- `compileSassWithTheme(component, themeState)` function
- `compileComponentsWithTheme(components[], themeState)` function
- New `buildScssSourceWithTheme()` that injects all variables

#### Runtime Theme Injector

**File**: `src/storybook/runtime-theme-injector.ts`

**Add**:

- `applyThemeState(themeState)` function
- Hash-based caching (`JSON.stringify(themeState)` as key)

**Remove**:

- `applyTheme(themeName)` function (preset-based)

#### Files to Delete

- `src/storybook/theme-presets.ts` - No longer needed

#### Storybook Config

**File**: `.storybook/main.ts`

```typescript
addons: [
  '@storybook/addon-docs',
  '@storybook/addon-a11y',
  './addons/theme-panel/manager', // NEW
],
```

**File**: `.storybook/preview.ts`

- Remove `nfsTheme` globalType (preset dropdown)
- Add `nfsThemeState` to `initialGlobals`
- Update theme decorator to use `applyThemeState()`

**File**: `.storybook/tsconfig.json`

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["addons/**/*.tsx", "addons/**/*.ts"]
}
```

---

### Configurable Variables

#### Color Palette (5 colors)

| Sass Variable | Default   | Control      |
| ------------- | --------- | ------------ |
| `primary`     | `#1779ba` | Color picker |
| `secondary`   | `#767676` | Color picker |
| `success`     | `#3adb76` | Color picker |
| `warning`     | `#ffae00` | Color picker |
| `alert`       | `#cc4b37` | Color picker |

#### Accordion (5 variables)

| Sass Variable                | Default        | Control             |
| ---------------------------- | -------------- | ------------------- |
| `$accordion-background`      | `#ffffff`      | Color picker        |
| `$accordion-plusminus`       | `true`         | Checkbox            |
| `$accordion-title-font-size` | `0.75rem`      | Slider (0.5-2rem)   |
| `$accordion-item-padding`    | `1.25rem 1rem` | Split sliders (v/h) |
| `$nfs-accordion-slide-speed` | `250ms`        | Slider (0-1000ms)   |

#### Button (3 variables)

| Sass Variable       | Default      | Control             |
| ------------------- | ------------ | ------------------- |
| `$button-padding`   | `0.85em 1em` | Split sliders (v/h) |
| `$button-radius`    | `0`          | Slider (0-20px)     |
| `$button-font-size` | `0.9rem`     | Slider (0.5-2rem)   |

---

### UI Panel Structure

```
┌─ Foundation Theme ────────────────────────────┐
│                                               │
│ ▼ Color Palette                               │
│   Primary     [████████] #1779ba              │
│   Secondary   [████████] #767676              │
│   Success     [████████] #3adb76              │
│   Warning     [████████] #ffae00              │
│   Alert       [████████] #cc4b37              │
│                                               │
│ ▶ Accordion (collapsed by default)            │
│                                               │
│ ▶ Button (collapsed by default)               │
│                                               │
│ ┌─────────────────┐  ┌─────────────────────┐  │
│ │ Reset Defaults  │  │ Export ▼            │  │
│ └─────────────────┘  │ • Copy to Clipboard │  │
│                      │ • Download File     │  │
│                      └─────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

### Implementation Order

#### Phase A: Core Infrastructure

1. Create `theme-defaults.ts` with Foundation defaults
2. Create `types.ts` with TypeScript interfaces
3. Update `.storybook/tsconfig.json` for JSX support

#### Phase B: Compiler Extensions

4. Extend `browser-sass-compiler.ts` with `compileSassWithTheme()`
5. Extend `runtime-theme-injector.ts` with `applyThemeState()`

#### Phase C: Addon Panel

6. Create addon constants and control components
7. Create `ThemePanel.tsx` with debouncing and export
8. Create `manager.tsx` for addon registration

#### Phase D: Integration

9. Update `main.ts` to register addon
10. Update `preview.ts` - remove preset dropdown
11. Delete `theme-presets.ts`

#### Phase E: Testing

12. Test all controls work correctly
13. Verify debouncing prevents excessive compilation
14. Test export functionality (clipboard + download)

---

### Performance Considerations

1. **Sass Loading**: Dart Sass (~300KB) loaded lazily on first use
2. **Compilation**: ~200-500ms per component
3. **Debouncing**: 300ms debounce on control changes
4. **Caching**: Hash-based caching (`JSON.stringify(themeState)`)

---

### Future Enhancements (Out of Scope)

- [ ] Live URL sharing with theme encoded
- [ ] Per-story theme overrides
- [ ] Additional component variables as library grows
