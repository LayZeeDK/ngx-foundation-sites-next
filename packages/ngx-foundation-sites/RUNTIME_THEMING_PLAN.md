# Runtime Sass Theming for ngx-foundation-sites Storybook

## Goal

Enable runtime Foundation theming in Storybook by compiling Sass in the browser, allowing users to adjust `$foundation-palette` and component-specific variables (e.g., `$accordion-background`) and see changes instantly.

---

## Phase 1: Proof of Concept

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

1. Storybook loads without errors
2. Theme dropdown appears in toolbar
3. Selecting a theme triggers Sass compilation (visible in console)
4. Component colors change according to selected palette
5. Compilation completes in <500ms after first load
6. Subsequent theme switches use cached CSS (instant)

---

## Phase 2: Full Implementation (Future)

After POC validation, expand to full feature set.

### Full Architecture

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
│  │              Browser Sass Compiler Service              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ User Vars    │  │ Sass Bundle  │  │ Dart Sass    │  │   │
│  │  │ (globals)    │  │ (static JS)  │  │ (JSPM CDN)   │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Full Implementation Steps

#### Step 1: Sass Source Bundler (Build-time Tool)

**File**: `packages/ngx-foundation-sites/tools/bundle-sass-sources.mjs`

Create a Node.js script that:

1. Reads all required Sass files (Foundation + library)
2. Exports them as a JavaScript module with file paths as keys
3. Runs as part of the Storybook build

**Output**: `packages/ngx-foundation-sites/src/storybook/sass-bundle.generated.ts`

```typescript
export const SASS_SOURCES: Record<string, string> = {
  '_nfs-settings': '/* content */',
  'foundation-sites/scss/util/util': '/* content */',
  'foundation-sites/scss/util/_math': '/* content */',
  // ... all Foundation files
  accordion: '/* component scss */',
};
```

**Files to bundle** (~50-60 files):

- Library: `_nfs-settings.scss`, `accordion.scss`, `button.scss`
- Foundation util: All 11 util files
- Foundation core: `_global.scss`, `vendor/*`
- Foundation components: `_accordion.scss`, `_button.scss`, etc.

---

#### Step 2: Browser Sass Compiler Service

**File**: `packages/ngx-foundation-sites/src/storybook/services/browser-sass-compiler.service.ts`

An Angular service that:

1. Lazy-loads Dart Sass from JSPM CDN
2. Provides a custom importer resolving from `SASS_SOURCES`
3. Compiles SCSS strings with user variables injected
4. Returns compiled CSS

```typescript
@Injectable({ providedIn: 'root' })
export class BrowserSassCompilerService {
  private sass: typeof import('sass') | null = null;

  async compile(component: 'accordion' | 'button', variables: ThemeVariables): Promise<string> {
    await this.loadSass();

    const scss = this.buildScss(component, variables);
    const result = await this.sass!.compileStringAsync(scss, {
      importers: [this.createBundleImporter()],
    });

    return result.css;
  }

  private buildScss(component: string, vars: ThemeVariables): string {
    return `
      // Injected theme variables
      $foundation-palette: (
        primary: ${vars.primaryColor},
        secondary: ${vars.secondaryColor},
        // ...
      );
      $accordion-background: ${vars.accordionBackground};

      // Original component SCSS
      @import '${component}';
    `;
  }

  private createBundleImporter(): Importer {
    return {
      canonicalize: (url) => new URL(`sass-bundle:${url}`),
      load: (url) => ({
        contents: SASS_SOURCES[url.pathname],
        syntax: 'scss',
      }),
    };
  }
}
```

---

#### Step 3: Storybook Theme Addon

**Files**:

- `packages/ngx-foundation-sites/.storybook/addons/theme-panel/register.tsx`
- `packages/ngx-foundation-sites/.storybook/addons/theme-panel/ThemePanel.tsx`
- `packages/ngx-foundation-sites/.storybook/addons/theme-panel/theme-state.ts`

A custom Storybook addon panel that:

1. Provides color pickers for `$foundation-palette`
2. Provides inputs for component-specific variables
3. Stores state in Storybook globals
4. Triggers recompilation on change (debounced 300ms)

**Panel Structure**:

```
┌─ Foundation Theme ────────────────────────────┐
│                                               │
│ ▼ Color Palette                               │
│   Primary     [████████] #0d5a89              │
│   Secondary   [████████] #595959              │
│   Success     [████████] #1a7f3e              │
│   Warning     [████████] #8a6500              │
│   Alert       [████████] #a33a2a              │
│                                               │
│ ▼ Accordion                                   │
│   Background  [████████] #fafafa              │
│   Title Size  [────●────] 1rem                │
│   Slide Speed [────●────] 250ms               │
│                                               │
│ ▼ Button                                      │
│   Padding     [────●────] 0.85em 1em          │
│   Radius      [────●────] 4px                 │
│                                               │
│ [Reset to Defaults]        [Export Settings]  │
└───────────────────────────────────────────────┘
```

---

#### Step 4: Theme Decorator

**File**: `packages/ngx-foundation-sites/.storybook/decorators/with-runtime-theme.ts`

A Storybook decorator that:

1. Subscribes to theme globals changes
2. Calls the BrowserSassCompilerService
3. Injects compiled CSS into a `<style id="nfs-runtime-theme">` tag
4. Disables/overrides the precompiled CSS from NfsStyleLoader

```typescript
export const withRuntimeTheme: DecoratorFunction = (Story, context) => {
  const themeVars = context.globals.nfsTheme;
  const [css, setCss] = useState('');

  useEffect(() => {
    if (themeVars) {
      compilerService.compile('accordion', themeVars).then(setCss);
    }
  }, [themeVars]);

  return (
    <>
      <style id="nfs-runtime-theme">{css}</style>
      <Story />
    </>
  );
};
```

---

#### Step 5: Integration & Configuration

**Files to modify**:

- `.storybook/main.ts` - Register the addon
- `.storybook/preview.ts` - Add the decorator, configure globals
- `project.json` - Add build dependency on sass bundler

**Storybook Configuration**:

```typescript
// .storybook/main.ts
export default {
  addons: [
    // ... existing addons
    './addons/theme-panel/register',
  ],
};

// .storybook/preview.ts
export const decorators = [withRuntimeTheme];
export const globalTypes = {
  nfsTheme: {
    name: 'Foundation Theme',
    defaultValue: DEFAULT_THEME_VARIABLES,
  },
};
```

---

### File Structure (New Files)

```
packages/ngx-foundation-sites/
├── tools/
│   └── bundle-sass-sources.mjs          # Build script
├── src/storybook/
│   ├── sass-bundle.generated.ts         # Generated bundle
│   └── services/
│       └── browser-sass-compiler.service.ts
├── .storybook/
│   ├── addons/
│   │   └── theme-panel/
│   │       ├── register.tsx             # Addon registration
│   │       ├── ThemePanel.tsx           # Panel UI component
│   │       └── theme-state.ts           # Default values, types
│   └── decorators/
│       └── with-runtime-theme.ts        # Story decorator
```

---

### Configurable Variables (Initial Set)

#### Foundation Palette

| Variable    | Default   | Type  |
| ----------- | --------- | ----- |
| `primary`   | `#0d5a89` | color |
| `secondary` | `#595959` | color |
| `success`   | `#1a7f3e` | color |
| `warning`   | `#8a6500` | color |
| `alert`     | `#a33a2a` | color |

#### Accordion

| Variable                     | Default        | Type     |
| ---------------------------- | -------------- | -------- |
| `$accordion-background`      | `$white`       | color    |
| `$accordion-plusminus`       | `true`         | boolean  |
| `$accordion-title-font-size` | `rem-calc(12)` | size     |
| `$accordion-item-padding`    | `1.25rem 1rem` | spacing  |
| `$nfs-accordion-slide-speed` | `250ms`        | duration |

#### Button (example expansion)

| Variable            | Default          | Type    |
| ------------------- | ---------------- | ------- |
| `$button-padding`   | `0.85em 1em`     | spacing |
| `$button-radius`    | `$global-radius` | size    |
| `$button-font-size` | `0.9rem`         | size    |

---

### Performance Considerations

1. **Sass Loading**: Dart Sass (~300KB) loaded lazily on first theme change
2. **Compilation**: ~200-500ms per component (acceptable per user)
3. **Debouncing**: 300ms debounce on control changes
4. **Caching**: Memoize compilation results by variable hash

---

### Future Enhancements (Out of Scope)

- [ ] Export theme as `_nfs-settings.scss` file
- [ ] Preset themes (Material, Bootstrap-like, etc.)
- [ ] Live URL sharing with theme encoded
- [ ] Per-story theme overrides
