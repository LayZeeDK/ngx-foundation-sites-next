# Button Component Quick Start

**Feature**: Accessible Button Component  
**Last Updated**: 2025-01-22

## 5-Minute Quick Start

### Installation

The button component is part of the `ngx-foundation-sites` library:

```bash
npm install ngx-foundation-sites
```

### Basic Usage

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { NfsButton } from 'ngx-foundation-sites/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NfsButton],
  template: `
    <button nfsButton>Click Me</button>
  `
})
export class AppComponent {}
```

**That's it!** Foundation styles are automatically loaded.

---

## Common Patterns

### 1. Button Variants

```html
<!-- Size variants -->
<button nfsButton size="tiny">Tiny</button>
<button nfsButton size="small">Small</button>
<button nfsButton>Default</button>
<button nfsButton size="large">Large</button>

<!-- Color variants -->
<button nfsButton color="primary">Primary</button>
<button nfsButton color="secondary">Secondary</button>
<button nfsButton color="success">Success</button>
<button nfsButton color="alert">Delete</button>
<button nfsButton color="warning">Warning</button>

<!-- Fill variants -->
<button nfsButton fill="solid">Solid</button>
<button nfsButton fill="hollow">Hollow</button>
<button nfsButton fill="clear">Clear</button>
```

### 2. Full-Width Buttons

```html
<!-- Always full-width -->
<button nfsButton [expanded]="true">Full Width</button>
<!-- Or use attribute syntax -->
<button nfsButton expanded>Full Width</button>

<!-- Responsive full-width -->
<button nfsButton expanded="small-only">Expanded on Small Only</button>
<button nfsButton expanded="medium">Expanded on Medium+</button>
```

### 3. Links Styled as Buttons

```html
<!-- Link with href (keeps link semantics) -->
<a nfsButton href="/dashboard">Go to Dashboard</a>

<!-- Anchor without href (button semantics) -->
<a nfsButton (click)="performAction()">Trigger Action</a>
```

### 4. Disabled States

```html
<!-- Hard disabled (not focusable) -->
<button nfsButton disabled>Cannot Submit</button>

<!-- Soft disabled (focusable, supports tooltips) -->
<button nfsButton [softDisabled]="!isFormValid" title="Complete form to enable">
  Submit
</button>
```

### 5. Event Handling

```typescript
@Component({
  template: `
    <button nfsButton (click)="handleClick()">
      Click Me
    </button>
  `
})
export class MyComponent {
  handleClick() {
    console.log('Button clicked!');
  }
}
```

---

## Accessibility Features

### ✅ Out-of-the-Box Accessibility

- **Keyboard navigation**: Tab to focus, Enter/Space to activate
- **Screen reader support**: Proper ARIA semantics
- **Focus indicators**: Visible focus styles from Foundation
- **Color contrast**: WCAG AA compliant (via Foundation config)

### Accessible Patterns

```html
<!-- Icon button with accessible label -->
<button nfsButton aria-label="Close dialog">
  <span aria-hidden="true">&times;</span>
</button>

<!-- Button with tooltip on disabled state -->
<button 
  nfsButton 
  [softDisabled]="true" 
  title="Action unavailable until form is complete">
  Submit
</button>

<!-- Link styled as button (correct semantics) -->
<a nfsButton href="/settings" aria-label="Open settings page">
  <span>Settings</span>
</a>
```

---

## Real-World Examples

### Form Buttons

```html
<form (submit)="handleSubmit($event)">
  <!-- Primary submit button -->
  <button nfsButton type="submit" color="success">
    Save Changes
  </button>
  
  <!-- Secondary cancel button -->
  <button nfsButton type="button" color="secondary" fill="hollow" (click)="cancel()">
    Cancel
  </button>
  
  <!-- Destructive action -->
  <button nfsButton type="button" color="alert" fill="clear" (click)="confirmDelete()">
    Delete
  </button>
</form>
```

### Mobile-Responsive Action Bar

```html
<div class="action-bar">
  <!-- Full-width on mobile, auto on larger screens -->
  <button nfsButton expanded="small-only" color="primary">
    Add to Cart
  </button>
  
  <button nfsButton expanded="small-only" fill="hollow">
    Save for Later
  </button>
</div>
```

### Call-to-Action Buttons

```html
<!-- Large primary CTA -->
<a nfsButton href="/signup" size="large" color="success" expanded>
  Get Started Free
</a>

<!-- Secondary CTA -->
<a nfsButton href="/learn-more" size="large" fill="hollow" expanded>
  Learn More
</a>
```

### Loading State

```typescript
@Component({
  template: `
    <button 
      nfsButton 
      [softDisabled]="isLoading"
      (click)="submitForm()">
      {{ isLoading ? 'Saving...' : 'Save' }}
    </button>
  `
})
export class FormComponent {
  isLoading = false;
  
  async submitForm() {
    this.isLoading = true;
    await this.api.save();
    this.isLoading = false;
  }
}
```

---

## Customization

### Theming with Foundation Sass Variables

```scss
// In your _nfs-settings.scss
@use 'sass:color';

// Override Foundation button variables
$button-background: #3498db;
$button-background-hover: color.scale($button-background, $lightness: -15%);
$button-color: white;
$button-radius: 8px;
$button-sizes: (
  tiny: 0.5rem,
  small: 0.7rem,
  default: 1rem,
  large: 1.5rem,
);

// Import Foundation after overrides
@import 'foundation-sites/scss/foundation';
@include foundation-button;
```

### Custom Colors (Advanced)

```scss
// Add custom color to Foundation palette
$custom-palette: (
  brand: #ff6b6b,
  dark: #2c3e50,
);

$button-palette: map-merge($foundation-palette, $custom-palette);
```

Then use in templates:

```html
<button nfsButton color="brand">Brand Color</button>
<button nfsButton color="dark">Dark Color</button>
```

---

## Troubleshooting

### Styles Not Loading

**Problem**: Buttons appear unstyled.

**Solution**: Ensure `/nfs-button.css` is accessible from your app's base URL. The component auto-loads this file at runtime.

**Alternative**: Include Foundation button styles in your global stylesheet:

```scss
// styles.scss
@import 'foundation-sites/scss/foundation';
@include foundation-button;
```

### Responsive Expanded Not Working

**Problem**: Breakpoint-specific expanded classes don't work.

**Solution**: Ensure `$button-responsive-expanded: true` in your Sass configuration (default in ngx-foundation-sites).

### Click Events Not Firing

**Problem**: Click handler doesn't fire when button is soft-disabled.

**Solution**: This is expected behavior. `softDisabled` prevents all clicks. Check your condition:

```html
<!-- Wrong: will never fire -->
<button nfsButton [softDisabled]="true" (click)="onClick()">
  Click Me
</button>

<!-- Right: conditionally disable -->
<button nfsButton [softDisabled]="!isValid" (click)="onClick()">
  Submit
</button>
```

---

## Next Steps

- **API Reference**: See `API_REFERENCE.md` for complete API documentation
- **Storybook**: Browse interactive examples at `http://localhost:4400`
- **Accessibility**: Review WCAG AA requirements in `spec.md`
- **Advanced Usage**: Check `contracts/` for API contracts and CSS details

---

## Additional Resources

- **Foundation Docs**: https://get.foundation/sites/docs/button.html
- **WAI-ARIA Button Pattern**: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- **Angular Standalone Components**: https://angular.dev/guide/components/importing
- **Angular Signals**: https://angular.dev/guide/signals

---

## Support

- **Issues**: GitHub issues at [ngx-foundation-sites repo]
- **Discussions**: GitHub discussions for questions
- **Contributing**: See `CONTRIBUTING.md` in library root
