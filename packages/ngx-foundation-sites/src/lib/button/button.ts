import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * NfsButton - Foundation Button component with attribute selector.
 *
 * Applies Foundation CSS classes to native `<button>` and `<a>` elements.
 * Uses component pattern (not directive) to enable style loading via styleUrl.
 *
 * @example
 * ```html
 * <!-- Basic button -->
 * <button nfsButton>Save</button>
 *
 * <!-- Colored button -->
 * <button nfsButton color="success">Submit</button>
 *
 * <!-- Link styled as button -->
 * <a nfsButton href="/dashboard">Go to Dashboard</a>
 *
 * <!-- Size and fill variants -->
 * <button nfsButton size="large" fill="hollow">Large Hollow</button>
 * ```
 */
@Component({
  // Attribute selector on native elements preserves accessibility.
  // The `nfsButton` attribute follows the `nfs` prefix convention.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[nfsButton], a[nfsButton]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Base Foundation class - always applied
    class: 'button',

    // Size classes (only apply when not default)
    '[class.tiny]': 'size() === "tiny"',
    '[class.small]': 'size() === "small"',
    '[class.large]': 'size() === "large"',

    // Expanded (full-width)
    '[class.expanded]': 'expanded()',

    // Color classes
    '[class.primary]': 'color() === "primary"',
    '[class.secondary]': 'color() === "secondary"',
    '[class.success]': 'color() === "success"',
    '[class.alert]': 'color() === "alert"',
    '[class.warning]': 'color() === "warning"',

    // Fill style classes
    '[class.hollow]': 'fill() === "hollow"',
    '[class.clear]': 'fill() === "clear"',

    // Soft disabled state
    '[class.disabled]': 'softDisabled()',
    '[attr.aria-disabled]': 'softDisabled() || null',

    // Anchor-specific accessibility
    '[attr.role]': 'isAnchor ? "button" : null',
    '[attr.tabindex]': 'softDisabled() && isAnchor ? -1 : null',
  },
})
export class NfsButton {
  /**
   * Button size variant.
   * Maps to Foundation CSS classes: `.tiny`, `.small`, `.large`
   *
   * @default 'default'
   */
  readonly size = input<'tiny' | 'small' | 'default' | 'large'>('default');

  /**
   * Button color variant.
   * Maps to Foundation palette CSS classes: `.primary`, `.secondary`, `.success`, `.alert`, `.warning`
   *
   * @default 'primary'
   */
  readonly color = input<
    'primary' | 'secondary' | 'success' | 'alert' | 'warning'
  >('primary');

  /**
   * Button fill style.
   * Maps to Foundation CSS classes: `.hollow`, `.clear`
   *
   * - `solid`: Default filled style (no additional class)
   * - `hollow`: Outline/border only
   * - `clear`: Text only, no border
   *
   * @default 'solid'
   */
  readonly fill = input<'solid' | 'hollow' | 'clear'>('solid');

  /**
   * Whether the button spans full width.
   * Maps to Foundation `.expanded` class.
   *
   * @default false
   */
  readonly expanded = input(false);

  /**
   * Soft disabled state - button appears disabled but remains focusable.
   * Uses `aria-disabled` instead of native `disabled` attribute.
   * Useful for showing tooltips on disabled buttons.
   *
   * For anchor elements, also sets `tabindex="-1"` to prevent keyboard activation.
   *
   * Note: For hard disable (not focusable), use native `disabled` attribute instead.
   *
   * @default false
   */
  readonly softDisabled = input(false);

  readonly #elementRef = inject(ElementRef);

  /**
   * Whether the host element is an anchor (`<a>`).
   * Used for applying appropriate ARIA attributes (role="button").
   */
  protected readonly isAnchor = this.#elementRef.nativeElement.tagName === 'A';
}
