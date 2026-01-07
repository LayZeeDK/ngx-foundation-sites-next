# NfsButton API Design

## Goal

Design an Angular directive API for Foundation Button that:

- Uses **Foundation for Sites CSS** (no Foundation JavaScript)
- Preserves **native button/anchor accessibility** (uses component with attribute selector)
- Follows **Angular Material button API conventions**
- Uses **modern Angular APIs** (signals, input functions)
- Complies with **WAI-ARIA Button pattern**

---

## Research Summary

### Foundation Button Features

| Feature         | CSS Class                     | Notes                          |
| --------------- | ----------------------------- | ------------------------------ |
| Base button     | `.button`                     | Applied to `<button>` or `<a>` |
| **Sizes**       |                               |                                |
| Tiny            | `.tiny`                       | Smallest size                  |
| Small           | `.small`                      | Small size                     |
| Default         | (none)                        | Default size                   |
| Large           | `.large`                      | Large size                     |
| Expanded        | `.expanded`                   | Full-width button              |
| **Colors**      |                               |                                |
| Primary         | `.primary`                    | Primary theme color (default)  |
| Secondary       | `.secondary`                  | Secondary theme color          |
| Success         | `.success`                    | Green/success color            |
| Alert           | `.alert`                      | Red/danger color               |
| Warning         | `.warning`                    | Yellow/warning color           |
| **Fill Styles** |                               |                                |
| Solid           | (none)                        | Default filled style           |
| Hollow          | `.hollow`                     | Outline/border only            |
| Clear           | `.clear`                      | Text only, no border           |
| **States**      |                               |                                |
| Disabled        | `.disabled` / `disabled` attr | Visual + functional disabled   |

### CSS Class → Angular Mapping

| Foundation CSS Class           | Angular Directive/Input    | Rationale                                     |
| ------------------------------ | -------------------------- | --------------------------------------------- |
| `.button`                      | `nfsButton` directive      | Base directive applied to `<button>` or `<a>` |
| `.tiny`, `.small`, `.large`    | `size` input               | Size variants                                 |
| `.expanded`                    | `expanded` input (boolean) | Full-width behavior                           |
| `.primary`, `.secondary`, etc. | `color` input              | Color variants                                |
| `.hollow`, `.clear`            | `fill` input               | Fill style variants                           |
| `.disabled`                    | Native `disabled` attr     | Handled by browser                            |

### WAI-ARIA Requirements

| Element                     | ARIA Attributes                         | Notes                                      |
| --------------------------- | --------------------------------------- | ------------------------------------------ |
| `<button>`                  | None required                           | Native button has implicit `role="button"` |
| `<a nfsButton href>`        | None                                    | Keep native link semantics                 |
| `<a nfsButton>` (no `href`) | `role="button"`, `tabindex="0"`         | Action anchors must follow button pattern  |
| Soft-disabled `<a>`         | `aria-disabled="true"`, `tabindex="-1"` | Remove from tab order when soft-disabled   |
| Icon-only button            | `aria-label`                            | Required for accessibility                 |

### Angular Material Button Pattern

Angular Material uses **attribute directives** on native elements:

```html
<!-- Material approach -->
<button matButton>Basic</button>
<button matButton="filled">Filled</button>
<a matButton href="/page">Link</a>
<button mat-icon-button aria-label="Menu">
  <mat-icon>menu</mat-icon>
</button>
```

Key patterns:

- Directive applied to native `<button>` or `<a>`
- Appearance variants via attribute value (`matButton="filled"`)
- `disabledInteractive` input for focusable disabled buttons
- `MAT_BUTTON_CONFIG` injection token for global defaults

---

## Proposed Component API

### Component Hierarchy

```
NfsButton (directive on <button> or <a>)
└── Applies Foundation CSS classes based on inputs
```

### NfsButton Component

**Selector:** `button[nfsButton], a[nfsButton]`

**Host Element:** Native `<button>` or `<a>` element

```typescript
@Component({
  selector: 'button[nfsButton], a[nfsButton]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'button',
    '[class.tiny]': 'size() === "tiny"',
    '[class.small]': 'size() === "small"',
    '[class.large]': 'size() === "large"',
    '[class.expanded]': 'expanded()',
    '[class.primary]': 'color() === "primary"',
    '[class.secondary]': 'color() === "secondary"',
    '[class.success]': 'color() === "success"',
    '[class.alert]': 'color() === "alert"',
    '[class.warning]': 'color() === "warning"',
    '[class.hollow]': 'fill() === "hollow"',
    '[class.clear]': 'fill() === "clear"',
    '[class.disabled]': 'softDisabled()',
    '[attr.aria-disabled]': 'softDisabled() || null',
    '[attr.role]': 'isAnchor ? "button" : null',
    '[attr.tabindex]': 'softDisabled() && isAnchor ? -1 : null',
  },
})
export class NfsButton {
  // === Inputs (names match Foundation CSS classes) ===

  /** Button size variant */
  readonly size = input<'tiny' | 'small' | 'default' | 'large'>('default');

  /** Button color variant (matches Foundation palette) */
  readonly color = input<'primary' | 'secondary' | 'success' | 'alert' | 'warning'>('primary');

  /** Button fill style */
  readonly fill = input<'solid' | 'hollow' | 'clear'>('solid');

  /** Whether the button is full-width */
  readonly expanded = input(false);

  /**
   * Soft disabled state - button appears disabled but remains focusable.
   * Uses aria-disabled instead of disabled attribute for better a11y.
   * Useful for showing tooltips on disabled buttons.
   */
  readonly softDisabled = input(false);

  // === Internal ===

  readonly #elementRef = inject(ElementRef);
  readonly isAnchor = this.#elementRef.nativeElement.tagName === 'A';
}
```

---

## Usage Examples

### Basic Buttons

```html
<!-- Default primary button -->
<button nfsButton>Save</button>

<!-- Secondary button -->
<button nfsButton color="secondary">Cancel</button>

<!-- Link styled as button -->
<a nfsButton href="/dashboard">Go to Dashboard</a>
```

### Size Variants

```html
<button nfsButton size="tiny">Tiny</button>
<button nfsButton size="small">Small</button>
<button nfsButton>Default</button>
<button nfsButton size="large">Large</button>
<button nfsButton [expanded]="true">Full Width</button>
```

### Color Variants

```html
<button nfsButton color="primary">Primary</button>
<button nfsButton color="secondary">Secondary</button>
<button nfsButton color="success">Success</button>
<button nfsButton color="warning">Warning</button>
<button nfsButton color="alert">Alert</button>
```

### Fill Styles

```html
<!-- Solid (default) -->
<button nfsButton>Solid</button>

<!-- Hollow (outline) -->
<button nfsButton fill="hollow">Hollow</button>

<!-- Clear (text only) -->
<button nfsButton fill="clear">Clear</button>
```

### Disabled States

```html
<!-- Hard disabled (native) - not focusable -->
<button nfsButton disabled>Disabled</button>

<!-- Soft disabled - remains focusable for tooltips -->
<button nfsButton [softDisabled]="true">Soft Disabled</button>

<!-- Disabled link -->
<a nfsButton [softDisabled]="true">Disabled Link</a>
```

### Combined Options

```html
<button nfsButton size="large" color="success" fill="hollow" [expanded]="true">Large Hollow Success Expanded</button>
```

### Icon-Only Button (with aria-label)

```html
<button nfsButton aria-label="Close">
  <span aria-hidden="true">&times;</span>
</button>
```

---

## Rendered HTML Structure

### Basic Button

```html
<!-- Input -->
<button nfsButton color="primary">Save</button>

<!-- Output -->
<button class="button primary">Save</button>
```

### Hollow Secondary Large

```html
<!-- Input -->
<button nfsButton color="secondary" fill="hollow" size="large">Cancel</button>

<!-- Output -->
<button class="button secondary hollow large">Cancel</button>
```

### Link as Button

```html
<!-- Input -->
<a nfsButton href="/page">Navigate</a>

<!-- Output -->
<a class="button primary" href="/page">Navigate</a>
```

### Soft Disabled Link

```html
<!-- Input -->
<a nfsButton [softDisabled]="true">Disabled</a>

<!-- Output -->
<a class="button primary disabled" role="button" aria-disabled="true" tabindex="-1">Disabled</a>
```

---

## Keyboard Navigation

| Key         | Action                                                            |
| ----------- | ----------------------------------------------------------------- |
| `Enter`     | Activate (native for `<button>` and `<a>`)                        |
| `Space`     | Activate (native for `<button>`; handled for `<a role="button">`) |
| `Tab`       | Move focus to next element                                        |
| `Shift+Tab` | Move focus to previous element                                    |

Note: `<a>` elements do **not** activate on Space by default. When we apply `role="button"` to anchors, we also add a Space-key handler (e.g. `(keydown.space)`) to match the WAI-ARIA button pattern.

---

## Comparison with Angular Material

| Feature    | Angular Material                    | NfsButton                           |
| ---------- | ----------------------------------- | ----------------------------------- |
| Selector   | `button[matButton]`, `a[matButton]` | `button[nfsButton]`, `a[nfsButton]` |
| Appearance | `matButton="filled"` etc.           | `fill="solid"` etc.                 |
| Sizes      | Not built-in                        | `size="tiny\|small\|large"`         |
| Colors     | Theme-based                         | `color="primary\|secondary\|..."`   |
| Disabled   | `disabled`, `disabledInteractive`   | `disabled`, `softDisabled`          |

**Key difference**: Foundation has explicit size and color CSS classes, while Material uses theming. Our API exposes Foundation's classes as typed inputs.

---

## Implementation Notes

### Why Component with Attribute Selector?

1. **Enables style loading** - `@Component` allows `styleUrl` for Foundation CSS integration
2. **Preserves native accessibility** - Attribute selector keeps native `<button>` semantics intact
3. **Works with native attributes** - `disabled`, `type="submit"`, etc. work naturally
4. **Follows Material pattern** - Angular Material uses the same approach (`MatButton` is a component)

### Link vs Button Semantics

When `nfsButton` is applied to an `<a>` element:

- If it has an `href`, it remains a **link** (navigation). Do not override semantics with `role`.
- If it does **not** have an `href`, it is treated as a **button-like action control**:
  - add `role="button"`
  - add `tabindex="0"` (so it is keyboard reachable)
  - handle Space key activation per WAI-ARIA APG
- For soft-disabled anchors, set `aria-disabled="true"` and `tabindex="-1"`.

---

## Files to Create

```
packages/ngx-foundation-sites/src/lib/button/
├── button.ts                    # NfsButton directive
├── button.scss                  # Component styles (minimal, mostly Foundation)
├── button.stories.ts            # Storybook stories with interactive tests
└── index.ts                     # Public API exports
```

**Note**: Testing is done via Storybook interactive tests and a11y checks rather than separate unit test files.

---

## Design Decisions

| Decision               | Choice                               | Rationale                                                                               |
| ---------------------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| Directive vs Component | **Component**                        | Enables style loading via `styleUrl`; attribute selector preserves native accessibility |
| Selector               | `button[nfsButton], a[nfsButton]`    | Matches Material pattern                                                                |
| Size input             | `size="tiny\|small\|default\|large"` | Maps to Foundation CSS classes                                                          |
| Color input            | `color="primary\|secondary\|..."`    | Maps to Foundation palette classes                                                      |
| Fill input             | `fill="solid\|hollow\|clear"`        | Maps to Foundation fill classes                                                         |
| Expanded               | Boolean input                        | Maps to `.expanded` class                                                               |
| Disabled               | Native + `softDisabled` input        | Native for hard disable, input for soft                                                 |
| Link accessibility     | Role only for no-`href` anchors      | Keep `<a href>` as links; only no-`href` anchors get `role="button"`                    |
| Toggle buttons         | Not included                         | Keep simple; separate component if needed                                               |
| Config token           | Not included                         | Keep minimal for v1                                                                     |

---

## Storybook Stories with Interactive Tests

Stories should include Storybook play functions for interaction testing and a11y checks.

### Stories to Create

1. **Basic** - All color variants
2. **Sizes** - tiny, small, default, large, expanded
3. **Fill Styles** - solid, hollow, clear
4. **Disabled States** - disabled attribute, softDisabled input
5. **Links as Buttons** - `<a nfsButton>`
6. **Icon-Only Buttons** - With `aria-label`
7. **Combined Options** - Multiple inputs together
8. **Form Integration** - Submit button in form

### Interactive Tests (via Storybook play functions)

Each story should include interaction tests covering:

1. **CSS class assertions** - Verify correct Foundation classes applied
2. **Accessibility checks** - Use `@storybook/addon-a11y` assertions
3. **Click interactions** - Buttons respond to clicks
4. **Keyboard navigation** - Space/Enter activate buttons
5. **Disabled behavior** - Disabled buttons don't respond to interaction
6. **Anchor semantics** - `<a href>` remains a link; only no-`href` anchors get `role="button"`
7. **Soft disabled** - `aria-disabled` and `tabindex` are set correctly

### Example Play Function

```typescript
export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /primary/i });

    // Verify Foundation classes
    expect(button).toHaveClass('button', 'primary');

    // a11y check
    await expect(button).toBeAccessible();

    // Click interaction
    await userEvent.click(button);
  },
};
```
