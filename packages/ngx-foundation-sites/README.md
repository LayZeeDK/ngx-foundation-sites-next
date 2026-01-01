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

Create a settings file to configure Foundation variables:

```scss
// src/styles/_nfs-settings.scss
@forward 'ngx-foundation-sites/scss/foundation-settings' with (
  $foundation-palette: (
    primary: #1e88e5,
    secondary: #757575,
    success: #43a047,
    warning: #fb8c00,
    alert: #e53935,
  ),
  $button-radius: 4px,
  $global-radius: 3px
);
```

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
                "bundleName": "assets/ngx-foundation-sites/accordion",
                "inject": false
              },
              {
                "input": "node_modules/ngx-foundation-sites/scss/button.scss",
                "bundleName": "assets/ngx-foundation-sites/button",
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
- Components lazy-load their CSS from `/assets/ngx-foundation-sites/<component>.css`

### 3. Add Global Styles

Include Foundation's global styles in your main stylesheet:

```scss
// src/styles.scss
@use './nfs-settings'; // Load theme config FIRST
@use 'ngx-foundation-sites/styles' as nfs;

// Include all recommended global styles
@include nfs.nfs-global-styles;

// Or include selectively:
// @include nfs.foundation-global-styles;  // Resets, base HTML styles
// @include nfs.foundation-typography;     // Headings, paragraphs, lists
// @include nfs.foundation-forms;          // Form elements
```

### 4. Import and Use Components

```typescript
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeader, NfsAccordionContent } from 'ngx-foundation-sites';

@Component({
  imports: [NfsAccordion, NfsAccordionItemDef, NfsAccordionHeader, NfsAccordionContent],
  template: `
    <nfs-accordion>
      <ng-template nfsAccordionItemDef [expanded]="true">
        <ng-template nfsAccordionHeader>Section 1</ng-template>
        <ng-template nfsAccordionContent>Content for section 1</ng-template>
      </ng-template>
      <ng-template nfsAccordionItemDef>
        <ng-template nfsAccordionHeader>Section 2</ng-template>
        <ng-template nfsAccordionContent>Content for section 2</ng-template>
      </ng-template>
    </nfs-accordion>
  `,
})
export class MyComponent {}
```

## Theming

### Sass Variable Overrides

All styling is controlled via Sass variables. Override them in your `_nfs-settings.scss`:

```scss
@forward 'ngx-foundation-sites/scss/foundation-settings' with (
  // Global settings
  $global-radius: 4px,
  $global-margin: 1rem,
  $global-padding: 1rem,

  // Color palette
  $foundation-palette: (primary: #1976d2, secondary: #424242, success: #388e3c, warning: #f57c00, alert: #d32f2f),
  // Button settings
  $button-padding: 0.85em 1.5em,
  $button-font-size: 1rem,
  $button-radius: 4px,

  // Accordion settings
  $accordion-background: #ffffff,
  $accordion-title-font-size: 0.875rem,
  $accordion-item-padding: 1rem,
  $accordion-plusminus: true
);
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

Default palette values (WCAG AA compliant):

- `primary`: `#0d5a89`
- `secondary`: `#595959`
- `success`: `#1a7f3e`
- `warning`: `#8a6500`
- `alert`: `#a33a2a`

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
| `$accordion-slide-speed`           | `250ms`             | Animation duration      |

## RTL Support

For right-to-left languages, set `$global-text-direction` at compile time:

```scss
// src/styles/_nfs-settings.scss
@forward 'ngx-foundation-sites/scss/foundation-settings' with (
  $global-text-direction: rtl
);
```

Foundation automatically adjusts all directional styles (margins, paddings, floats, icon positions) based on this setting.

**Note:** RTL is a compile-time decision. To support both LTR and RTL, you would need separate builds.

## Custom Style Path

By default, components load styles from `/assets/ngx-foundation-sites/<component>.css`. To customize:

```typescript
// app.config.ts
import { NFS_STYLE_BASE_PATH } from 'ngx-foundation-sites';

export const appConfig: ApplicationConfig = {
  providers: [{ provide: NFS_STYLE_BASE_PATH, useValue: '/assets/custom-path' }],
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
<link rel="preload" href="/assets/ngx-foundation-sites/accordion.css" as="style" />
```

Or include critical components with `inject: true` in angular.json.

## Components

### Accordion

Expandable content panels with keyboard navigation.

```typescript
import { NfsAccordion, NfsAccordionItemDef, NfsAccordionHeader, NfsAccordionContent } from 'ngx-foundation-sites';
```

**Inputs:**

- `multiExpandable` - Allow multiple panels open (default: `false`)
- `disabled` - Disable all interactions (default: `false`)
- `wrap` - Keyboard navigation wraps (default: `false`)
- `allowAllClosed` - Allow closing all panels (default: `false`)
- `plusminus` - Show +/- icons (default: `true`)
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
