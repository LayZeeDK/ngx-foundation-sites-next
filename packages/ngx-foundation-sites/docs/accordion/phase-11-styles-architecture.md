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
│  │     "bundleName": "accordion",     │  │   primary: #1e88e5, ...        │ │
│  │     "inject": false }              │  │ ) !default;                    │ │
│  │ ]                                  │  │ $global-text-direction: ltr;   │ │
│  └────────────────────────────────────┘  └────────────────────────────────┘ │
│          │                                          │                       │
│          │ Sass compile (with consumer's globals) ◄─┘                       │
│          ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  dist/                                                                  ││
│  │      ├── accordion.css  ◄── NOT injected, lazy-loaded                   ││
│  │      └── button.css     ◄── NOT injected, lazy-loaded                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ NfsStyleLoader.load()
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ngx-foundation-sites LIBRARY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Components call: inject(NfsStyleLoader).load('accordion')                  │
│  Styles load from: /accordion.css (or configured base path)                 │
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
) !default;

$global-text-direction: ltr !default;
$global-flexbox: true !default;
```

### 11.2.2 Consumer-Compiled SCSS

Component SCSS files are distributed as source and compiled by the consumer's build:

```json
// Consumer's angular.json
{
  "styles": [
    {
      "input": "node_modules/ngx-foundation-sites/scss/accordion.scss",
      "bundleName": "accordion",
      "inject": false
    }
  ],
  "stylePreprocessorOptions": {
    "includePaths": ["src/styles", "node_modules"]
  }
}
```

**Benefits:**

- Consumer's Sass variable overrides apply to component styles
- Lazy loading via `inject: false` reduces initial bundle
- Consumer controls which components to include

### 11.2.3 Component SCSS Structure

Each component SCSS file follows this pattern:

```scss
// accordion.scss

// 1. Import consumer's settings (sets globals)
@import 'nfs-settings';

// 2. Import Foundation (reads globals)
@import 'foundation-sites/scss/foundation';

// 3. Include component styles
@include foundation-accordion;

// 4. Add custom styles using Foundation variables
.accordion-title {
  text-align: $global-left; // RTL-aware
}
```

### 11.2.4 NfsStyleLoader Service

Components load styles dynamically instead of using `styleUrl`:

```typescript
@Component({
  selector: 'nfs-accordion',
  // NO styleUrl - styles loaded dynamically
  encapsulation: ViewEncapsulation.None,
})
export class NfsAccordion {
  constructor() {
    inject(NfsStyleLoader).load('accordion');
  }
}
```

**Benefits:**

- Works with consumer-compiled SCSS
- Styles load once per component (tracked by service)
- Configurable base path via `NFS_STYLE_BASE_PATH` token

## 11.3 File Structure

```
src/lib/
├── core/
│   ├── nfs-style-loader.service.ts   # Dynamic CSS loading
│   └── index.ts                      # Public exports
│
├── scss/                             # Distributed as npm assets
│   ├── _global.scss                  # Re-exports Foundation global
│   ├── accordion.scss                # Compiled by consumer
│   └── button.scss
│
└── accordion/
    └── accordion.ts                  # NO styleUrl, uses NfsStyleLoader
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
) !default;

// ─────────────────────────────────────────────────────────────────────────────
// Global Settings
// ─────────────────────────────────────────────────────────────────────────────

$global-text-direction: ltr !default;
$global-flexbox: true !default;
$global-radius: 4px !default;

// ─────────────────────────────────────────────────────────────────────────────
// Component Variables
// ─────────────────────────────────────────────────────────────────────────────

$accordion-plusminus: true !default;
$accordion-slide-speed: 250ms !default;
```

## 11.5 RTL Support

RTL is a compile-time decision via `$global-text-direction`:

```scss
// src/styles/_nfs-settings.scss
$global-text-direction: rtl !default;
```

Foundation automatically adjusts all directional styles (margins, paddings, icon positions).

**Note:** To support both LTR and RTL, you need separate builds or use Storybook's dynamic stylesheet swapping pattern.

## 11.6 Testing Environments

For Storybook and unit tests where styles are bundled directly:

```typescript
import { provideNfsTesting } from 'ngx-foundation-sites/testing';

// Prevents 404 errors for /*.css
providers: [provideNfsTesting()];
```

### Storybook RTL/LTR Testing

Storybook supports dynamic direction switching via a toolbar control:

1. **Separate entry points** compile Foundation with LTR or RTL direction:
   - `src/storybook/all-components-ltr.scss` - Default LTR styles
   - `src/storybook/all-components-rtl.scss` - RTL styles

2. **Dynamic stylesheet swapping** in `preview.ts`:

   ```typescript
   import ltrStyles from '../src/storybook/all-components-ltr.scss?inline';
   import rtlStyles from '../src/storybook/all-components-rtl.scss?inline';

   function setDirection(direction: 'ltr' | 'rtl'): void {
     document.documentElement.dir = direction;
     // Inject appropriate stylesheet (only one active at a time)
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

| File                                       | Purpose                               |
| ------------------------------------------ | ------------------------------------- |
| `src/lib/core/nfs-style-loader.service.ts` | Dynamic CSS loading service           |
| `src/lib/scss/_global.scss`                | Re-exports Foundation global settings |
| `src/lib/scss/accordion.scss`              | Accordion styles (consumer-compiled)  |
| `src/lib/scss/button.scss`                 | Button styles (consumer-compiled)     |
| `testing/src/provide-nfs-testing.ts`       | Testing environment providers         |

## 11.10 Migration from Previous Architecture

The previous architecture attempted to use:

- `@forward ... with (...)` for consumer configuration
- CSS Custom Properties for runtime theming

The current architecture provides:

- Global Sass variables for Foundation compatibility
- Full compile-time theming with all Foundation variables
- Lazy-loaded styles from conventional paths
- RTL support via `$global-text-direction`
