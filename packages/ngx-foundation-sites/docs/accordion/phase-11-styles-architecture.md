# Phase 11: Styles Architecture ✅

**Goal:** Implement a Sass-only styling architecture that enables:

1. Full Sass variable theming at consumer's build time
2. Lazy-loaded component styles for optimal bundle size
3. Compile-time RTL support via `$global-text-direction`

## 11.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONSUMER APPLICATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  angular.json (inject: false)         │  src/styles/_nfs-settings.scss      │
│  ┌────────────────────────────────────┤  ┌────────────────────────────────┐ │
│  │ "styles": [                        │  │ // Global Sass variables       │ │
│  │   { "input": ".../accordion.scss", │  │ $foundation-palette: (         │ │
│  │     "bundleName": "nfs-accordion", │  │   primary: #1e88e5, ...        │ │
│  │     "inject": false }              │  │ );                             │ │
│  │ ]                                  │  │ $global-text-direction: ltr;   │ │
│  └────────────────────────────────────┘  └────────────────────────────────┘ │
│          │                                          │                       │
│          │ Sass compile (with consumer's globals) ◄─┘                       │
│          ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  dist/                                                                  ││
│  │      ├── nfs-accordion.css  ◄── NOT injected, lazy-loaded               ││
│  │      └── nfs-button.css     ◄── NOT injected, lazy-loaded               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ NfsStyleLoader.load()
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ngx-foundation-sites LIBRARY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Components call: NfsStyleLoader.load('accordion', '/nfs-accordion.css')    │
│  Service creates <link> element, browser fetches CSS lazily                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 11.2 Key Design Decisions

### 11.2.1 Global Sass Variables (Not @use ... with)

**Why global variables instead of `@use ... with (...)`?**

Foundation v6.9.0 uses the legacy `@import` system internally. This means:

- Foundation reads configuration from **global Sass scope**
- The modern `@use ... with (...)` syntax configures **module scope**
- These two scopes don't communicate

Consumer's `_nfs-settings.scss` must set variables as globals:

```scss
// src/styles/_nfs-settings.scss

// These become global variables that Foundation reads via @import
$foundation-palette: (
  primary: #1e88e5,
  secondary: #757575,
  success: #43a047,
  warning: #fb8c00,
  alert: #e53935,
);

$global-text-direction: ltr;
$global-flexbox: true;
```

### 11.2.2 Consumer-Compiled SCSS

Component SCSS files are distributed as source and compiled by the consumer's build:

```json
// Consumer's angular.json
{
  "styles": [
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

**Benefits:**

- Consumer's Sass variable overrides apply to component styles
- Lazy loading via `inject: false` reduces initial bundle
- Consumer controls which components to include

**Important:** The `bundleName` must use the `nfs-` prefix (e.g., `nfs-accordion`) to match the paths expected by components.

### 11.2.3 Component SCSS Structure

Each component SCSS file follows this pattern:

```scss
// accordion.scss

// 1. Import consumer's settings (sets globals)
@import 'nfs-settings';

// 2. Import Foundation (reads globals)
@import 'foundation-sites/scss/util/util';
@import 'foundation-sites/scss/global';
@import 'foundation-sites/scss/components/accordion';

// 3. Include component styles
@include foundation-accordion;

// 4. Add custom styles using Foundation variables
.accordion-title {
  text-align: $global-left; // RTL-aware
}
```

### 11.2.4 NfsStyleLoader Service

Components load styles dynamically using `NfsStyleLoader`:

```typescript
@Component({
  selector: 'nfs-accordion',
  // NO styleUrl - styles loaded dynamically
  encapsulation: ViewEncapsulation.None,
})
export class NfsAccordion {
  readonly #styleLoader = inject(NfsStyleLoader);
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.#styleLoader.load('accordion', '/nfs-accordion.css');
    });

    this.#destroyRef.onDestroy(() => {
      this.#styleLoader.unload('accordion');
    });
  }
}
```

**Benefits:**

- Works with consumer-compiled SCSS
- Reference-counted: first instance loads, last instance removes
- Platform-scoped: works across Storybook story boundaries
- SSR-safe: uses `afterNextRender` to load only in browser

**Why not CSS `@import url()`?** ng-packagr uses ESBuild which resolves and inlines `@import` statements at build time. Runtime URLs don't exist during library builds.

## 11.3 File Structure

```
src/lib/
├── core/
│   ├── nfs-style-loader.service.ts   # Dynamic CSS loading
│   └── index.ts                      # Public exports
│
├── scss/
│   ├── defaults/
│   │   └── _nfs-settings.scss        # Library defaults (fallback)
│   ├── _global.scss                  # Re-exports Foundation global
│   ├── accordion.scss                # Compiled by consumer
│   └── button.scss
│
└── accordion/
    └── accordion.ts                  # Uses NfsStyleLoader
```

## 11.4 Consumer Theme Configuration

Consumers create a settings file with global Sass variables:

```scss
// src/styles/_nfs-settings.scss

// ─────────────────────────────────────────────────────────────────────────────
// Color Palette
// ─────────────────────────────────────────────────────────────────────────────

$foundation-palette: (
  primary: #1e88e5,
  secondary: #757575,
  success: #43a047,
  warning: #fb8c00,
  alert: #e53935,
);

// ─────────────────────────────────────────────────────────────────────────────
// Global Settings
// ─────────────────────────────────────────────────────────────────────────────

$global-text-direction: ltr;
$global-flexbox: true;
$global-radius: 4px;

// ─────────────────────────────────────────────────────────────────────────────
// Component Variables
// ─────────────────────────────────────────────────────────────────────────────

$accordion-plusminus: true;
$nfs-accordion-slide-speed: 250ms;
```

**Note:** Consumer settings should NOT use `!default` since they ARE the overrides. The library's `defaults/_nfs-settings.scss` uses `!default` as the fallback.

## 11.5 RTL Support

RTL is a compile-time decision via `$global-text-direction`:

```scss
// src/styles/_nfs-settings.scss
$global-text-direction: rtl;
```

Foundation automatically adjusts all directional styles (margins, paddings, icon positions).

**For consumers:** RTL is build-time only. Create separate build configurations for LTR and RTL.

**For Storybook:** Runtime direction switching is handled via MutationObserver in `preview.ts` that swaps between `/nfs-accordion.css` and `/nfs-accordion-rtl.css`.

## 11.6 Storybook Configuration

Storybook uses precompiled CSS from the `dist-css/` folder:

```typescript
// .storybook/main.ts
const config: StorybookConfig = {
  staticDirs: [{ from: '../dist-css', to: '/' }],
};
```

The `build-css` target compiles both LTR and RTL versions before Storybook starts.

### RTL Testing in Storybook

Storybook's direction toolbar triggers a MutationObserver that swaps stylesheet hrefs:

```typescript
// .storybook/preview.ts
function swapNfsStylesheets(direction: string) {
  document.querySelectorAll<HTMLLinkElement>('link[id^="nfs-style"]').forEach((link) => {
    if (direction === 'rtl' && !link.href.includes('-rtl.css')) {
      link.href = link.href.replace('.css', '-rtl.css');
    } else if (direction !== 'rtl' && link.href.includes('-rtl.css')) {
      link.href = link.href.replace('-rtl.css', '.css');
    }
  });
}
```

## 11.7 ViewEncapsulation.None ✅

All components use `ViewEncapsulation.None` because:

- Foundation's class selectors work directly
- No `_ngcontent-*` attribute pollution in CSS
- Simpler selectors and smaller bundle size

## 11.8 Expected Sass Warnings

During compilation, you will see deprecation warnings:

```
Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
```

These warnings are **expected** and cannot be avoided while Foundation v6 uses `@import` internally. They do not affect functionality.

## 11.9 Files Created/Modified

### Key Files

| File                                       | Purpose                                |
| ------------------------------------------ | -------------------------------------- |
| `src/lib/core/nfs-style-loader.service.ts` | Dynamic CSS loading service            |
| `src/lib/scss/defaults/_nfs-settings.scss` | Library default settings (fallback)    |
| `src/lib/scss/_global.scss`                | Re-exports Foundation global settings  |
| `src/lib/scss/accordion.scss`              | Accordion styles (consumer-compiled)   |
| `src/lib/scss/button.scss`                 | Button styles (consumer-compiled)      |
| `tools/build-component-css.mjs`            | Precompiles CSS for Storybook/defaults |

## 11.10 Precompiled CSS Option

For consumers who don't need Sass theming, the library ships precompiled CSS:

```
dist/ngx-foundation-sites/css/
├── nfs-accordion.css       # LTR (default)
├── nfs-accordion-rtl.css   # RTL
├── nfs-button.css
└── nfs-button-rtl.css
```

Consumers can copy these to their assets folder instead of compiling SCSS.
