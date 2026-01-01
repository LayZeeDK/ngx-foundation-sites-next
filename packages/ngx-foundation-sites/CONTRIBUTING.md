# Contributing to ngx-foundation-sites

## Component Authoring Guide

This guide explains how to create new components for the library following the established styling architecture.

### Architecture Overview

Components in this library use a **Sass-only** theming approach:

1. **No `styleUrl`** - Components don't use Angular's `styleUrl` property
2. **NfsStyleLoader** - Components load styles dynamically via the `NfsStyleLoader` service
3. **Consumer compilation** - SCSS is distributed as source and compiled by consumers
4. **Foundation integration** - Styles use Foundation's mixins with consumer-configured variables

### Creating a New Component

#### Step 1: Create Component SCSS

Create `src/lib/scss/<component-name>.scss`:

```scss
// ═══════════════════════════════════════════════════════════════════════════════
// <ComponentName> Component Styles
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file is compiled by the CONSUMER's build process with their theme config.
// It resolves `nfs-settings` from the consumer's src/styles/_nfs-settings.scss
// via their stylePreprocessorOptions.includePaths configuration.
//
// ═══════════════════════════════════════════════════════════════════════════════

// Load consumer's theme configuration (resolves via includePaths)
@use 'nfs-settings' as config;

// Configure Foundation with consumer's settings
@use 'foundation-sites/scss/foundation' as foundation with (
  $foundation-palette: config.$foundation-palette,
  $global-text-direction: config.$global-text-direction,
  $global-flexbox: config.$global-flexbox,
  $global-radius: config.$global-radius,
  // Add any component-specific settings that Foundation needs
  $my-component-setting: config.$my-component-setting
);

// ═══════════════════════════════════════════════════════════════════════════════
// FOUNDATION COMPONENT MIXIN
// ═══════════════════════════════════════════════════════════════════════════════

// Include Foundation's component styles
@include foundation.foundation-my-component;

// ═══════════════════════════════════════════════════════════════════════════════
// ANGULAR INTEGRATION OVERRIDES
// ═══════════════════════════════════════════════════════════════════════════════
// Custom CSS required for Angular integration (accessibility, element types, etc.)

// Example: Button elements need explicit width (Foundation assumes <a> elements)
.my-component-title {
  width: 100%;
}

// Example: RTL adjustments using Foundation's directional variables
[dir='rtl'] .my-component {
  text-align: foundation.$global-right;
}
```

#### Step 2: Add Component Variables to Foundation Settings

Update `src/lib/scss/_foundation-settings.scss`:

```scss
// ─────────────────────────────────────────────────────────────────────────────────
// MyComponent Settings
// ─────────────────────────────────────────────────────────────────────────────────

/// MyComponent background color.
/// @type Color
$my-component-background: #fefefe !default;

/// MyComponent text color.
/// @type Color
$my-component-color: #0a0a0a !default;

/// MyComponent border radius.
/// @type Number
$my-component-radius: $global-radius !default;
```

**Important:** Always use `!default` so consumers can override values.

#### Step 3: Create the Angular Component

Create `src/lib/<component-name>/<component-name>.ts`:

```typescript
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { NfsStyleLoader } from '../core';

@Component({
  selector: 'nfs-my-component',
  templateUrl: './my-component.html',
  // NO styleUrl - styles loaded dynamically via NfsStyleLoader
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsMyComponent {
  constructor() {
    // Load component styles (compiled by consumer's build with their theme config)
    inject(NfsStyleLoader).load('my-component');
  }
}
```

**Key points:**

- **No `styleUrl`** - Styles are loaded dynamically
- **`ViewEncapsulation.None`** - Required for Foundation's class selectors to work
- **`NfsStyleLoader.load()`** - Called in constructor with the component name

#### Step 4: Export the Component

Update `src/lib/index.ts`:

```typescript
export { NfsMyComponent } from './my-component/my-component';
```

#### Step 5: Update ng-package.json (if needed)

The `scss/` folder is already exported as assets. New SCSS files are automatically included.

#### Step 6: Configure Storybook

Update `project.json` to include the new component styles:

```json
{
  "targets": {
    "storybook": {
      "options": {
        "styles": ["packages/ngx-foundation-sites/src/storybook/styles.scss", "packages/ngx-foundation-sites/src/lib/scss/accordion.scss", "packages/ngx-foundation-sites/src/lib/scss/button.scss", "packages/ngx-foundation-sites/src/lib/scss/my-component.scss"]
      }
    }
  }
}
```

### Styling Guidelines

#### 1. Prefer Foundation's Existing Styles

Always use Foundation's CSS classes directly:

```html
<!-- Good: Use Foundation classes -->
<div class="my-component">
  <button class="my-component-title">Title</button>
  <div class="my-component-content">Content</div>
</div>
```

#### 2. Use Foundation's State Classes

Apply state classes via Angular bindings:

```html
<li class="my-item" [class.is-active]="isActive()"></li>
```

#### 3. Document Custom CSS

When custom styles are unavoidable, add comments:

```scss
/* Button elements need explicit width (Foundation assumes <a> elements) */
.my-component-title {
  width: 100%;
}
```

#### 4. Support RTL

Use Foundation's directional variables:

```scss
[dir='rtl'] .my-component {
  text-align: foundation.$global-right;
  margin-#{foundation.$global-left}: 0;
  margin-#{foundation.$global-right}: 1rem;
}
```

### Testing

#### Storybook Interactive Tests

Add play functions to your stories:

```typescript
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};
```

#### Verify Styles Load

Check browser DevTools to confirm:

1. `<link>` tag is added to `<head>` for the component CSS
2. Foundation classes are applied correctly
3. Consumer variable overrides work (test in Storybook)

### Common Patterns

#### Host Element Styling

Use the `host` property in `@Component`:

```typescript
@Component({
  host: {
    'class': 'my-component',
    '[class.is-disabled]': 'disabled()',
  }
})
```

#### Conditional CSS Classes

Use class bindings instead of `ngClass`:

```html
<div class="my-item" [class.is-active]="isActive()" [class.is-disabled]="isDisabled()"></div>
```

#### Animation Integration

Use Foundation's animation variables:

```scss
.my-component-content {
  transition: height config.$my-component-slide-speed ease;
}
```

### File Structure

```
src/lib/
├── core/
│   ├── nfs-style-loader.service.ts
│   └── index.ts
│
├── scss/
│   ├── _foundation-settings.scss  # All configurable variables
│   ├── accordion.scss
│   ├── button.scss
│   └── my-component.scss          # New component
│
├── styles/
│   └── _index.scss                # Public Sass API
│
├── my-component/
│   ├── my-component.ts            # Component (no styleUrl)
│   ├── my-component.html
│   └── my-component.stories.ts
│
└── index.ts                       # Public exports
```

### Checklist

Before submitting a PR for a new component:

- [ ] Created `scss/<component-name>.scss` with Foundation mixin
- [ ] Added variables to `scss/_foundation-settings.scss` with `!default`
- [ ] Component uses `NfsStyleLoader.load()` in constructor
- [ ] Component has `ViewEncapsulation.None`
- [ ] Component has no `styleUrl`
- [ ] Added exports to `index.ts`
- [ ] Updated `project.json` Storybook styles array
- [ ] Created Storybook stories with play functions
- [ ] Documented component inputs in README.md
- [ ] Verified styles render correctly in Storybook
