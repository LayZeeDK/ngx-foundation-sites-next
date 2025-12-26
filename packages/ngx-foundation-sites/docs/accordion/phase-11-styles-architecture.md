# Phase 11: Styles Architecture Refactoring ✅

**Goal:** Separate global Foundation styles from component-specific styles so that:

1. The library exposes a public SCSS stylesheet for consumers to import global styles
2. Component-specific styles (like accordion) are loaded only when the component is used
3. Bundle size is reduced for consumers who don't use all components

## 11.1 Background

Previously, all Foundation styles (including accordion) were loaded globally via `storybook/styles.scss`. This meant:

- Consumers had no public stylesheet to import
- Accordion CSS was always included even if the component wasn't used
- No clear separation between global and component-scoped styles

## 11.2 Architecture Changes

### 11.2.1 Public Global Stylesheet Entry Point

**File:** `src/lib/styles/_index.scss`

Created a new public stylesheet that exposes Foundation styles via mixins:

```scss
@use 'ngx-foundation-sites/styles' as nfs;

// Option 1: Include all recommended global styles
@include nfs.nfs-all-global-styles;

// Option 2: Selectively include
@include nfs.foundation-global-styles;
@include nfs.foundation-typography;
@include nfs.foundation-forms;
@include nfs.foundation-button;
@include nfs.nfs-theme-properties;
```

**Available mixins:**

| Mixin                           | Description                             |
| ------------------------------- | --------------------------------------- |
| `foundation-global-styles`      | Core resets, box-sizing, base HTML/body |
| `foundation-typography`         | Headings, paragraphs, lists, links      |
| `foundation-forms`              | Base form element styles                |
| `foundation-button`             | Button component styles                 |
| `foundation-visibility-classes` | Show/hide at breakpoints                |
| `foundation-float-classes`      | Float utility classes                   |
| `nfs-theme-properties`          | CSS custom properties (--nfs-\* prefix) |
| `nfs-all-global-styles`         | All recommended styles (convenience)    |

### 11.2.2 Component-Scoped Accordion Styles

**File:** `src/lib/accordion/accordion.scss`

The accordion component now loads Foundation's accordion styles directly:

```scss
@use 'foundation-sites/scss/foundation' as foundation with (
  $foundation-palette: settings.$foundation-palette,
  $accordion-background: accordion-settings.$accordion-background // ... all accordion settings
);

@include foundation.foundation-accordion;
```

**Key changes:**

1. Foundation's main module is imported to get global variables (`$global-left`, etc.)
2. Accordion-specific settings use CSS Custom Properties for runtime theming
3. All accordion customizations (RTL, animations, plusminus icons) are in component stylesheet

### 11.2.3 Accordion Settings with CSS Custom Properties

**File:** `src/lib/accordion/_foundation-accordion-settings.scss`

Maps Foundation Sass variables to CSS Custom Properties:

```scss
$accordion-background: var(--nfs-accordion-background, #fefefe);
$accordion-item-color: var(--nfs-accordion-item-color, var(--nfs-primary-color, #0d5a89));
// ... etc
```

## 11.3 Angular View Encapsulation: ViewEncapsulation.None ✅

**Decision:** Use `ViewEncapsulation.None` for all components in the library.

**Benefits:**

- Eliminates Angular's `_ngcontent-*` attribute selectors from CSS output
- Reduces bundle size
- Simplifies selectors (no need for `:host()` or specificity workarounds)
- Better Foundation CSS compatibility

**Styling conventions:**

| Selector Type              | Purpose                               | Example                             |
| -------------------------- | ------------------------------------- | ----------------------------------- |
| Host element               | Target the component host             | `nfs-accordion { display: block; }` |
| Foundation class overrides | Customize Foundation's default styles | `.accordion-title { width: 100%; }` |
| `nfs-` prefixed classes    | Custom component-specific behavior    | `.nfs-accordion-no-plusminus`       |

**Why element selectors for host styles?**

- Same specificity as class selectors (0,0,1,0)
- No need to add extra classes to the host element
- More idiomatic for Angular components

**Why `nfs-` prefix for custom behavior classes?**

- Prevents clashes with consumer's global styles
- Clear distinction between "adapting Foundation" and "adding new behavior"

**Enforcement:**

A custom ESLint rule (`@nfs/require-view-encapsulation-none`) enforces this across all library components:

```javascript
// packages/ngx-foundation-sites/eslint.config.mjs
{
  files: ['**/src/lib/**/*.ts'],
  ignores: ['**/*.spec.ts', '**/*.test.ts'],
  plugins: {
    '@nfs': { rules: nfsRules },
  },
  rules: {
    '@nfs/require-view-encapsulation-none': 'error',
  },
}
```

**Generator defaults:**

New components automatically use `ViewEncapsulation.None` via project-level generator config:

```json
// packages/ngx-foundation-sites/project.json
{
  "generators": {
    "@nx/angular:component": {
      "viewEncapsulation": "None"
    }
  }
}
```

## 11.4 Files Created

| File                                                    | Purpose                                |
| ------------------------------------------------------- | -------------------------------------- |
| `src/lib/styles/_index.scss`                            | Public global stylesheet entry point   |
| `src/lib/accordion/_foundation-accordion-settings.scss` | Accordion CSS Custom Property settings |

## 11.5 Files Modified

| File                                  | Change                                           |
| ------------------------------------- | ------------------------------------------------ |
| `ng-package.json`                     | Added `assets` config to export SCSS files       |
| `src/lib/_foundation-components.scss` | Removed accordion include (now component-scoped) |
| `src/lib/accordion/accordion.scss`    | Loads Foundation accordion + all customizations  |
| `src/storybook/styles.scss`           | Simplified to use new public stylesheet          |

## 11.6 Consumer Usage

After publishing, consumers can use the library:

**Option 1: Include all recommended global styles**

```scss
@use 'ngx-foundation-sites/styles' as nfs;
@include nfs.nfs-all-global-styles;
```

**Option 2: Selectively include only what you need**

```scss
@use 'ngx-foundation-sites/styles' as nfs;

@include nfs.foundation-global-styles;
@include nfs.foundation-typography;
@include nfs.nfs-theme-properties;
```

**Option 3: Access Foundation settings for customization**

```scss
@use 'ngx-foundation-sites/styles' as nfs;
@use 'sass:map';

$my-primary: map.get(nfs.$foundation-palette, primary);
```

## 11.7 Bundle Size Impact

- **Before:** Accordion CSS always included in global styles (~2KB)
- **After:** Accordion CSS only loaded when `<nfs-accordion>` is used
- **Benefit:** Smaller initial bundle for apps that don't use accordion
