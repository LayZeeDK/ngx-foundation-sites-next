# Phase 11: Styles Architecture Refactoring ✅

**Goal:** Implement a Sass-only styling architecture that enables:

1. Full Sass variable theming at consumer's build time
2. Lazy-loaded component styles for optimal bundle size
3. Compile-time RTL support via `$global-text-direction`

## 11.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONSUMER APPLICATION                          │
├─────────────────────────────────────────────────────────────────────┤
│  angular.json (inject: false)          │  src/styles/_nfs-settings.scss│
│  ┌─────────────────────────────────────┤  ┌────────────────────────┐ │
│  │ "styles": [                         │  │ @forward '...' with (  │ │
│  │   { "input": ".../accordion.scss",  │  │   $primary: #1e88e5,   │ │
│  │     "bundleName": "assets/nfs/...", │  │   $button-radius: 4px  │ │
│  │     "inject": false }               │  │ );                     │ │
│  │ ]                                   │  └────────────────────────┘ │
│  └─────────────────────────────────────┘            │                │
│          │                                          │                │
│          │ Sass compile (with consumer's config) ◄──┘                │
│          ▼                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  dist/assets/ngx-foundation-sites/                              │ │
│  │      ├── accordion.css  ◄── NOT injected, lazy-loaded           │ │
│  │      └── button.css     ◄── NOT injected, lazy-loaded           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ NfsStyleLoader.load()
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ngx-foundation-sites LIBRARY                     │
├─────────────────────────────────────────────────────────────────────┤
│  Components call: inject(NfsStyleLoader).load('accordion')          │
│  Styles load from: /assets/ngx-foundation-sites/accordion.css       │
└─────────────────────────────────────────────────────────────────────┘
```

## 11.2 Key Design Decisions

### 11.2.1 Sass-Only Theming (No CSS Custom Properties)

**Why Sass variables instead of CSS Custom Properties?**

Foundation uses Sass functions like `scale-color()`, `map-get()`, and conditional logic that cannot accept CSS custom properties. A Sass-only API provides:

- Full access to Foundation's mixins and functions
- Compile-time optimization (only used values in output)
- Native RTL support via `$global-text-direction`

### 11.2.2 Consumer-Compiled SCSS

Component SCSS files are distributed as source and compiled by the consumer's build:

```json
// Consumer's angular.json
{
  "styles": [
    {
      "input": "node_modules/ngx-foundation-sites/scss/accordion.scss",
      "bundleName": "assets/ngx-foundation-sites/accordion",
      "inject": false
    }
  ]
}
```

**Benefits:**

- Consumer's Sass variable overrides apply to component styles
- Lazy loading via `inject: false` reduces initial bundle
- Consumer controls which components to include

### 11.2.3 NfsStyleLoader Service

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
│   ├── _foundation-settings.scss     # Configurable variables
│   ├── accordion.scss                # Compiled by consumer
│   └── button.scss
│
├── styles/
│   └── _index.scss                   # Public Sass API (global styles)
│
└── accordion/
    └── accordion.ts                  # NO styleUrl, uses NfsStyleLoader
```

## 11.4 Consumer Theme Configuration

Consumers create a settings file to customize Foundation variables:

```scss
// src/styles/_nfs-settings.scss
@forward 'ngx-foundation-sites/scss/global' with (
  $foundation-palette: (
    primary: #1e88e5,
    secondary: #757575,
    success: #43a047,
    warning: #fb8c00,
    alert: #e53935,
  ),
  $button-radius: 4px,
  $accordion-plusminus: true,
  $global-text-direction: ltr
);
```

## 11.5 RTL Support

RTL is a compile-time decision via `$global-text-direction`:

```scss
@forward 'ngx-foundation-sites/scss/global' with (
  $global-text-direction: rtl
);
```

Foundation automatically adjusts all directional styles (margins, paddings, icon positions).

## 11.6 Testing Environments

For Storybook and unit tests where styles are bundled directly:

```typescript
import { provideNfsTesting } from 'ngx-foundation-sites/testing';

// Prevents 404 errors for /assets/ngx-foundation-sites/*.css
providers: [provideNfsTesting()];
```

### Storybook RTL/LTR Testing

Storybook supports dynamic direction switching via a toolbar control. This is implemented through:

1. **Separate entry points** compile Foundation with LTR or RTL direction:
   - `src/storybook/all-components-ltr.scss` - Default LTR styles
   - `src/storybook/all-components-rtl.scss` - RTL styles

2. **Parameterized settings** (`src/storybook/_nfs-settings.scss`):

   ```scss
   // Default direction, configurable via @use ... with ($_direction: rtl)
   $_direction: ltr !default;

   @forward 'foundation-sites/scss/global' with (
     $global-text-direction: $_direction // ... other config
   );
   ```

3. **Dynamic stylesheet swapping** in `preview.ts`:

   ```typescript
   // Import both as raw CSS strings via webpack ?inline query
   import ltrStyles from '../src/storybook/all-components-ltr.scss?inline';
   import rtlStyles from '../src/storybook/all-components-rtl.scss?inline';

   // Swap stylesheets when direction changes
   function setDirection(direction: 'ltr' | 'rtl'): void {
     document.documentElement.dir = direction;
     // Inject appropriate stylesheet (only one active at a time)
   }
   ```

This approach ensures Foundation's directional CSS (e.g., `left: 1rem` vs `right: 1rem`) doesn't conflict, since only one stylesheet is active.

## 11.7 ViewEncapsulation.None ✅

All components use `ViewEncapsulation.None` because:

- Foundation's class selectors work directly
- No `_ngcontent-*` attribute pollution in CSS
- Simpler selectors and smaller bundle size

Enforced via custom ESLint rule: `@nfs/require-view-encapsulation-none`

## 11.8 Files Created/Modified

### New Files

| File                                       | Purpose                                  |
| ------------------------------------------ | ---------------------------------------- |
| `src/lib/core/nfs-style-loader.service.ts` | Dynamic CSS loading service              |
| `src/lib/scss/_global.scss`                | Re-exports Foundation global settings    |
| `src/lib/scss/accordion.scss`              | Accordion styles (consumer-compiled)     |
| `src/lib/scss/button.scss`                 | Button styles (consumer-compiled)        |
| `testing/src/provide-nfs-testing.ts`       | Testing environment providers            |
| `src/storybook/_nfs-settings.scss`         | Storybook theme with direction parameter |
| `src/storybook/all-components-ltr.scss`    | LTR entry point for Storybook            |
| `src/storybook/all-components-rtl.scss`    | RTL entry point for Storybook            |

### Modified Files

| File                             | Change                                  |
| -------------------------------- | --------------------------------------- |
| `ng-package.json`                | Export scss/ and styles/ as assets      |
| `src/lib/accordion/accordion.ts` | Use NfsStyleLoader instead of styleUrl  |
| `src/lib/button/button.ts`       | Use NfsStyleLoader instead of styleUrl  |
| `.storybook/preview.ts`          | Dynamic RTL/LTR stylesheet swapping     |
| `.storybook/main.ts`             | Webpack config for ?inline SCSS imports |

## 11.9 Migration from Previous Architecture

The previous architecture used:

- `styleUrl` with component-scoped SCSS
- CSS Custom Properties for runtime theming

The new architecture provides:

- Full Sass variable theming (compile-time)
- Consumer controls compilation with their theme config
- Lazy-loaded styles from conventional path
