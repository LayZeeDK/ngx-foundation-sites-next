# Phase 0: Foundation Styles Infrastructure ✅

**Goal:** Set up global Foundation styles for Storybook that work for both dev server and static build.

## 0.1 Create Global Foundation Settings ✅

**File:** `packages/ngx-foundation-sites/src/lib/_foundation-settings.scss`

```scss
// Global Foundation for Sites settings
// Override Foundation defaults with CSS custom properties for theming

@use 'foundation-sites/scss/settings' as foundation-settings;

// Text direction
$global-text-direction: ltr !default;

// Layout
$global-flexbox: true !default;

// Colors - use CSS custom properties for theming
$foundation-palette: (
  primary: #1779ba,
  secondary: #767676,
  success: #3adb76,
  warning: #ffae00,
  alert: #cc4b37,
) !default;
```

## 0.2 Create Foundation Components Mixin ✅

**File:** `packages/ngx-foundation-sites/src/lib/_foundation-components.scss`

```scss
// Foundation component includes for global styles
@use 'foundation-sites/scss/foundation';

@mixin foundation-global-styles {
  @include foundation.foundation-global-styles;
  @include foundation.foundation-typography;
  @include foundation.foundation-forms;
  @include foundation.foundation-button;
  // Add more global components as needed
}
```

## 0.3 Create Storybook Global Styles ✅

**File:** `packages/ngx-foundation-sites/src/storybook/styles.scss`

```scss
@use '../lib/foundation-settings' as settings;
@use '../lib/foundation-components' as components;
@use 'foundation-sites/scss/util/util';

// Include global Foundation styles
@include components.foundation-global-styles;

// CSS Custom Properties for theming (nfs- prefix)
:root {
  --nfs-primary-color: #{map-get(settings.$foundation-palette, primary)};
  --nfs-secondary-color: #{map-get(settings.$foundation-palette, secondary)};
  --nfs-success-color: #{map-get(settings.$foundation-palette, success)};
  --nfs-warning-color: #{map-get(settings.$foundation-palette, warning)};
  --nfs-alert-color: #{map-get(settings.$foundation-palette, alert)};
}
```

## 0.4 Configure Storybook to Load Styles ✅

**File:** `packages/ngx-foundation-sites/project.json`

Add `styles` option to both `storybook` and `build-storybook` targets:

```json
{
  "storybook": {
    "options": {
      "styles": ["packages/ngx-foundation-sites/src/storybook/styles.scss"]
    }
  },
  "build-storybook": {
    "options": {
      "styles": ["packages/ngx-foundation-sites/src/storybook/styles.scss"]
    }
  }
}
```

## 0.5 Update Storybook Preview (Optional Decorators) ✅

**File:** `packages/ngx-foundation-sites/.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/angular';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
  },
};

export default preview;
```

## Implementation Notes

**Adjustments made during implementation:**

1. **Sass module syntax**: Used `@use 'sass:map'` and `map.get()` instead of deprecated `map-get()` global function (required for Dart Sass 3.0 compatibility)

2. **Simplified settings file**: Removed unused `@use 'foundation-sites/scss/settings'` import - only the custom variables are needed

3. **Foundation version**: Using `foundation-sites` v6.9.0

**Actual file contents differ slightly from plan examples** - see committed files for accurate implementation.
