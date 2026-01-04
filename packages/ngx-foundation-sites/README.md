# ngx-foundation-sites

Angular components built on [Foundation for Sites](https://get.foundation/sites/docs/) CSS framework.

## Features

- **Angular-native components** using signals, new control flow, and modern APIs
- **Foundation's battle-tested CSS** without JavaScript dependencies
- **Full Sass theming** with compile-time variable customization
- **RTL support** via Foundation's `$global-text-direction`
- **WCAG AA accessible** with proper ARIA attributes and keyboard navigation
- **Lazy-loaded styles** via `NfsStyleLoader` for optimal bundle size

## Installation

```bash
npm install ngx-foundation-sites foundation-sites
```

## Quick Start

### Option 1: Precompiled CSS (Zero Config)

For consumers who are happy with Foundation defaults:

#### 1. Copy Precompiled CSS to Assets

```json
// angular.json
{
  "architect": {
    "build": {
      "options": {
        "assets": [{ "glob": "**/*.css", "input": "node_modules/ngx-foundation-sites/css", "output": "/" }]
      }
    }
  }
}
```

#### 2. Import and Use Components

```typescript
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef, NfsAccordionContentDef } from 'ngx-foundation-sites';

@Component({
  imports: [NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef, NfsAccordionContentDef],
  template: `
    <nfs-accordion>
      <ng-template nfsAccordionItem [expanded]="true">
        <ng-template nfsAccordionHeader>Section 1</ng-template>
        <ng-template nfsAccordionContent>Content for section 1</ng-template>
      </ng-template>
    </nfs-accordion>
  `,
})
export class MyComponent {}
```

That's it! Component styles load automatically when components render.

---

### Option 2: Custom Sass Theming

For consumers who want to customize Foundation variables:

#### 1. Create Theme Configuration (Optional)

Create a settings file to configure Foundation variables:

```scss
// src/styles/_nfs-settings.scss

// Set your custom values BEFORE importing library defaults.
// Variables use !default so yours take precedence.
$foundation-palette: (
  primary: #6200ea,
  secondary: #00bfa5,
  success: #00c853,
  warning: #ffd600,
  alert: #ff1744,
);

$global-radius: 8px;

// Import library defaults (gets all Foundation variables)
@import 'ngx-foundation-sites/scss/nfs-settings';
```

> **Why global variables?** Foundation v6.9.0 uses `@import` internally, which reads from Sass's global scope. The modern `@use ... with (...)` syntax only configures module scope, which Foundation doesn't read.

#### 2. Configure angular.json

```json
{
  "architect": {
    "build": {
      "options": {
        "stylePreprocessorOptions": {
          "includePaths": ["src/styles", "node_modules/ngx-foundation-sites/scss/defaults", "node_modules"]
        },
        "styles": [
          "src/styles.scss",
          {
            "input": "node_modules/ngx-foundation-sites/scss/accordion.scss",
            "bundleName": "nfs-accordion",
            "inject": false
          },
          {
            "input": "node_modules/ngx-foundation-sites/scss/button.scss",
            "bundleName": "nfs-button",
            "inject": false
          }
        ]
      }
    }
  }
}
```

**Key points:**

- `includePaths` order matters: your styles folder first, then library defaults
- Component SCSS files use `inject: false` to compile without injecting into index.html
- `bundleName` must use `nfs-` prefix (e.g., `nfs-accordion`) to match component expectations
- Components load their CSS from `/<bundleName>.css` at runtime

#### 3. Add Global Styles (Optional)

Include Foundation's global styles in your main stylesheet if needed:

```scss
// src/styles.scss
@import 'nfs-settings'; // Load theme config FIRST
@import 'foundation-sites/scss/foundation';

@include foundation-global-styles;
@include foundation-typography;
// Add other Foundation mixins as needed
```

---

## Theming

### Sass Variable Configuration

All styling is controlled via Sass variables. Set them in your `_nfs-settings.scss` before importing library defaults:

```scss
// src/styles/_nfs-settings.scss

// Override variables BEFORE importing defaults
$foundation-palette: (
  primary: #1976d2,
  secondary: #424242,
  success: #388e3c,
  warning: #f57c00,
  alert: #d32f2f,
);

$global-radius: 4px;
$nfs-accordion-slide-speed: 200ms;

// Import defaults (provides all other Foundation variables)
@import 'ngx-foundation-sites/scss/nfs-settings';
```

### Available Variables

#### Global

| Variable                 | Default | Description                     |
| ------------------------ | ------- | ------------------------------- |
| `$global-text-direction` | `ltr`   | Text direction (`ltr` or `rtl`) |
| `$global-flexbox`        | `true`  | Enable flexbox layout           |
| `$global-radius`         | `0`     | Default border radius           |
| `$global-margin`         | `1rem`  | Default margin                  |
| `$global-padding`        | `1rem`  | Default padding                 |

#### Color Palette

| Variable              | Default | Description                                        |
| --------------------- | ------- | -------------------------------------------------- |
| `$foundation-palette` | (map)   | Primary, secondary, success, warning, alert colors |

Default palette values:

- `primary`: `#1779ba`
- `secondary`: `#767676`
- `success`: `#3adb76`
- `warning`: `#ffae00`
- `alert`: `#cc4b37`

#### ngx-foundation-sites Custom Variables

| Variable                     | Default | Description                  |
| ---------------------------- | ------- | ---------------------------- |
| `$nfs-accordion-slide-speed` | `250ms` | Accordion animation duration |

See [Foundation's Sass documentation](https://get.foundation/sites/docs/sass.html) for the complete list of configurable variables.

---

## RTL Support

### Build-Time Configuration

For right-to-left languages, set `$global-text-direction` in your settings file:

```scss
// src/styles/_nfs-settings.scss
$global-text-direction: rtl;
@import 'ngx-foundation-sites/scss/nfs-settings';
```

Foundation automatically adjusts all directional styles (margins, paddings, floats, icon positions) based on this setting.

### Precompiled RTL CSS

The library ships both LTR and RTL precompiled CSS:

```
node_modules/ngx-foundation-sites/css/
├── nfs-accordion.css       # LTR (default)
├── nfs-accordion-rtl.css   # RTL
├── nfs-button.css
└── nfs-button-rtl.css
```

For RTL applications using precompiled CSS, copy the RTL variants:

```json
// angular.json
{
  "assets": [{ "glob": "*-rtl.css", "input": "node_modules/ngx-foundation-sites/css", "output": "/" }]
}
```

> **Note:** Components load CSS from paths like `/nfs-accordion.css`. For RTL with precompiled CSS, rename the `-rtl.css` files to remove the suffix (e.g., `nfs-accordion-rtl.css` → `nfs-accordion.css`), or build custom CSS using Sass with `$global-text-direction: rtl`.

---

## Components

### Accordion

Expandable content panels with keyboard navigation.

```typescript
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef, NfsAccordionContentDef } from 'ngx-foundation-sites';
```

**Inputs:**

- `multiExpandable` - Allow multiple panels open (default: `false`)
- `disabled` - Disable all interactions (default: `false`)
- `wrap` - Keyboard navigation wraps (default: `false`)
- `allowAllClosed` - Allow closing all panels (default: `false`)
- `deepLink` - Sync with URL hash (default: `false`)
- `deepLinkSmudge` - Auto-scroll on deep link (default: `false`)
- `deepLinkSmudgeDelay` - Scroll delay in ms (default: `300`)
- `deepLinkSmudgeOffset` - Scroll offset for sticky headers (default: `0`)
- `updateHistory` - Use pushState vs replaceState (default: `false`)

### Button

Foundation-styled buttons with all variants.

```typescript
import { NfsButton } from 'ngx-foundation-sites';
```

**Inputs:**

- `color` - Color variant: `'primary'` | `'secondary'` | `'success'` | `'warning'` | `'alert'`
- `size` - Size variant: `'tiny'` | `'small'` | `'large'`
- `expanded` - Full-width button or responsive breakpoint (default: `false`)
- `fill` - Fill style: `'solid'` | `'hollow'` | `'clear'` (default: `'solid'`)
- `softDisabled` - Disabled appearance but focusable (default: `false`)

---

## Architecture

### How Styles Work

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BUILD TIME (Sass Theming)                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  _nfs-settings.scss              component.scss (accordion, button, etc.)   │
│  ┌─────────────────────────┐     ┌─────────────────────────────────────┐    │
│  │ $foundation-palette:    │────▶│ @import 'nfs-settings';             │    │
│  │   (primary: #1e88e5...) │     │ @import 'foundation-sites/...';     │    │
│  │ $global-text-direction  │     │ @include foundation-accordion;      │    │
│  └─────────────────────────┘     └─────────────────────────────────────┘    │
│           │                                      │                          │
│           │ globals set                          ▼                          │
│           └─────────────────────▶ component.css (themed)                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ RUNTIME (NfsStyleLoader)                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Component calls: NfsStyleLoader.load('accordion', '/nfs-accordion.css')    │
│  Service creates <link> element, browser fetches CSS (lazy loading)         │
│  Reference-counted: multiple instances share one stylesheet                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Expected Sass Warnings

You will see deprecation warnings during compilation:

```
Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
```

These warnings are expected and cannot be avoided while Foundation v6 uses `@import` internally. They do not affect functionality.

---

## SSR Support

The styling architecture is SSR-compatible:

- Styles are compiled at build time
- `NfsStyleLoader` uses `afterNextRender` to load styles only in the browser
- For critical-path optimization, preload styles in `index.html`:

```html
<link rel="preload" href="/nfs-accordion.css" as="style" />
```

Or include critical components with `inject: true` in angular.json.

---

## Development

```bash
# Install dependencies
npm install

# Run Storybook
npm run storybook

# Run tests
npm run test

# Build library
npm run build:ngx-foundation-sites
```

## License

MIT
