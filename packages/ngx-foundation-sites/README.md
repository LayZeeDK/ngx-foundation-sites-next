# ngx-foundation-sites

Angular components built on [Foundation for Sites](https://get.foundation/sites/docs/) CSS framework.

## Features

- **Angular-native components** using signals, new control flow, and modern APIs
- **Foundation's battle-tested CSS** without JavaScript dependencies
- **Full Sass theming** with compile-time variable customization
- **RTL support** via Foundation's `$global-text-direction`
- **WCAG AA accessible** with proper ARIA attributes and keyboard navigation
- **Lazy-loaded styles** for optimal bundle size

## Installation

```bash
npm install ngx-foundation-sites foundation-sites
```

## Quick Start

### 1. Create Theme Configuration

Create a settings file to configure Foundation variables. Variables must be set as **globals** because Foundation v6 uses the legacy `@import` system internally:

```scss
// src/styles/_nfs-settings.scss

// Foundation reads these from global scope via @import.
// Set variables BEFORE they're used by component stylesheets.

$foundation-palette: (
  primary: #1e88e5,
  secondary: #757575,
  success: #43a047,
  warning: #fb8c00,
  alert: #e53935,
) !default;

$global-flexbox: true !default;
$global-radius: 3px !default;
```

> **Why global variables?** Foundation v6.9.0 uses `@import` internally, which reads from Sass's global scope. The modern `@use ... with (...)` syntax only configures module scope, which Foundation doesn't read. This architecture allows full theming while maintaining compatibility with Foundation.

### 2. Configure angular.json

Add the include path and component styles:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "stylePreprocessorOptions": {
              "includePaths": ["src/styles", "node_modules"]
            },
            "styles": [
              "src/styles.scss",
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
            ]
          }
        }
      }
    }
  }
}
```

**Key points:**

- `stylePreprocessorOptions.includePaths` must include `src/styles` so `_nfs-settings.scss` is found
- Component SCSS files use `inject: false` to compile without injecting into index.html
- Components lazy-load their CSS from `/<bundleName>.css`

### 3. Add Global Styles (Optional)

Include Foundation's global styles in your main stylesheet if needed:

```scss
// src/styles.scss
@import 'nfs-settings'; // Load theme config FIRST
@import 'foundation-sites/scss/foundation';

@include foundation-global-styles;
@include foundation-typography;
// Add other Foundation mixins as needed
```

### 4. Import and Use Components

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
      <ng-template nfsAccordionItem>
        <ng-template nfsAccordionHeader>Section 2</ng-template>
        <ng-template nfsAccordionContent>Content for section 2</ng-template>
      </ng-template>
    </nfs-accordion>
  `,
})
export class MyComponent {}
```

## Theming

### Sass Variable Configuration

All styling is controlled via Sass variables. Set them in your `_nfs-settings.scss`:

```scss
// src/styles/_nfs-settings.scss

// ─────────────────────────────────────────────────────────────────────────────
// Color Palette
// ─────────────────────────────────────────────────────────────────────────────

$foundation-palette: (
  primary: #1976d2,
  secondary: #424242,
  success: #388e3c,
  warning: #f57c00,
  alert: #d32f2f,
) !default;

// ─────────────────────────────────────────────────────────────────────────────
// Global Settings
// ─────────────────────────────────────────────────────────────────────────────

$global-radius: 4px !default;
$global-margin: 1rem !default;
$global-padding: 1rem !default;

// ─────────────────────────────────────────────────────────────────────────────
// Button Settings
// ─────────────────────────────────────────────────────────────────────────────

$button-padding: 0.85em 1.5em !default;
$button-font-size: 1rem !default;
$button-radius: 4px !default;

// ─────────────────────────────────────────────────────────────────────────────
// Accordion Settings
// ─────────────────────────────────────────────────────────────────────────────

$accordion-background: #ffffff !default;
$accordion-title-font-size: 0.875rem !default;
$accordion-item-padding: 1rem !default;
$accordion-plusminus: true !default;

// ─────────────────────────────────────────────────────────────────────────────
// ngx-foundation-sites Custom Variables
// ─────────────────────────────────────────────────────────────────────────────

/// Accordion expand/collapse animation duration.
$nfs-accordion-slide-speed: 250ms !default;
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

#### Button

| Variable                      | Default          | Description                        |
| ----------------------------- | ---------------- | ---------------------------------- |
| `$button-padding`             | `0.85em 1em`     | Button padding                     |
| `$button-font-size`           | `0.9rem`         | Button font size                   |
| `$button-radius`              | `$global-radius` | Button border radius               |
| `$button-opacity-disabled`    | `0.25`           | Disabled button opacity            |
| `$button-responsive-expanded` | `true`           | Enable responsive expanded classes |

#### Accordion

| Variable                           | Default             | Description             |
| ---------------------------------- | ------------------- | ----------------------- |
| `$accordion-background`            | `#fefefe`           | Container background    |
| `$accordion-title-font-size`       | `0.75rem`           | Title font size         |
| `$accordion-item-color`            | `primary`           | Title text color        |
| `$accordion-item-background-hover` | `#e6e6e6`           | Title hover background  |
| `$accordion-item-padding`          | `1.25rem 1rem`      | Title padding           |
| `$accordion-content-background`    | `#fefefe`           | Content background      |
| `$accordion-content-border`        | `1px solid #e6e6e6` | Content border          |
| `$accordion-content-color`         | `#0a0a0a`           | Content text color      |
| `$accordion-content-padding`       | `1rem`              | Content padding         |
| `$accordion-plusminus`             | `true`              | Show +/- icons          |
| `$accordion-plus-content`          | `'+'`               | Collapsed icon          |
| `$accordion-minus-content`         | `'\2013'`           | Expanded icon (en-dash) |
| `$nfs-accordion-slide-speed`       | `250ms`             | Animation duration      |

See [Foundation's Sass documentation](https://get.foundation/sites/docs/sass.html) for the complete list of configurable variables.

## RTL Support

For right-to-left languages, set `$global-text-direction` in your settings file:

```scss
// src/styles/_nfs-settings.scss
$global-text-direction: rtl !default;
```

Foundation automatically adjusts all directional styles (margins, paddings, floats, icon positions) based on this setting.

**Note:** RTL is a compile-time decision. To support both LTR and RTL, you would need separate builds or use Storybook's dynamic stylesheet swapping pattern (see Storybook configuration).

## Custom Style Path

By default, components load styles from `/<bundleName>.css`. To customize:

```typescript
// app.config.ts
import { NFS_STYLE_BASE_PATH } from 'ngx-foundation-sites';

export const appConfig: ApplicationConfig = {
  providers: [{ provide: NFS_STYLE_BASE_PATH, useValue: '/assets/styles' }],
};
```

## Bundled Environments (Storybook, Tests)

For environments where styles are bundled directly (e.g., Storybook, unit tests), use the testing providers to prevent 404 errors:

```typescript
import { provideNfsTesting } from 'ngx-foundation-sites/testing';

// In Storybook preview.ts
applicationConfig({
  providers: [provideNfsTesting()],
});

// In unit tests
TestBed.configureTestingModule({
  providers: [provideNfsTesting()],
});
```

The `provideNfsTesting()` function configures a no-op style loader since styles are already available via bundling.

## SSR Support

The styling architecture is SSR-compatible:

- Styles are compiled at build time
- Components inject `<link>` tags that work with server rendering
- For critical-path optimization, preload styles in `index.html`:

```html
<link rel="preload" href="/accordion.css" as="style" />
```

Or include critical components with `inject: true` in angular.json.

## Components

### Accordion

Expandable content panels with keyboard navigation.

```typescript
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeaderDef, NfsAccordionContentDef } from 'ngx-foundation-sites';
```

**Inputs:**

- `multiExpand` - Allow multiple panels open (default: `false`)
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
- `expanded` - Full-width button (default: `false`)
- `hollow` - Hollow style (default: `false`)
- `clear` - Clear/transparent style (default: `false`)
- `disabled` - Disabled state (default: `false`)
- `dropdown` - Show dropdown arrow (default: `false`)

## Architecture

### Why Global Sass Variables?

Foundation v6.9.0 uses the legacy Sass `@import` system internally. This means:

- Foundation reads configuration from **global Sass scope**
- The modern `@use ... with (...)` syntax configures **module scope**, which Foundation doesn't read
- Component SCSS files must use `@import` to set globals before importing Foundation

This architecture provides full theming capabilities while maintaining compatibility with Foundation's internals.

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BUILD TIME                                                                  │
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
│ RUNTIME                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  NfsStyleLoader.load('accordion') ──▶ <link href="/accordion.css">          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Expected Sass Warnings

You will see deprecation warnings during compilation:

```
Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
```

These warnings are expected and cannot be avoided while Foundation v6 uses `@import` internally. They do not affect functionality.

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
