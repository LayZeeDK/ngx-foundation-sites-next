import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  Renderer2,
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

    // Space key activation for anchors (native buttons handle this automatically)
    '(keydown.space)': 'isAnchor && handleSpaceKey($event)',
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
   * Supports both property binding and HTML attribute syntax:
   * - `[expanded]="true"` — property binding
   * - `expanded` — HTML attribute (presence means true)
   *
   * @default false
   */
  readonly expanded = input(false, { transform: booleanAttribute });

  /**
   * Soft disabled state - button appears disabled but remains focusable.
   * Uses `aria-disabled` instead of native `disabled` attribute.
   * Useful for showing tooltips on disabled buttons.
   *
   * For anchor elements, also sets `tabindex="-1"` to prevent keyboard activation.
   *
   * Note: For hard disable (not focusable), use native `disabled` attribute instead.
   *
   * Supports both property binding and HTML attribute syntax:
   * - `[softDisabled]="true"` — property binding
   * - `softDisabled` — HTML attribute (presence means true)
   *
   * @default false
   */
  readonly softDisabled = input(false, { transform: booleanAttribute });

  readonly #elementRef: ElementRef<HTMLAnchorElement | HTMLButtonElement> =
    inject(ElementRef);
  readonly #ngZone = inject(NgZone);
  readonly #renderer = inject(Renderer2);

  /**
   * Whether the host element is an anchor (`<a>`).
   * Used for applying appropriate ARIA attributes (role="button").
   */
  protected readonly isAnchor = this.#elementRef.nativeElement.tagName === 'A';

  /**
   * Effect callback for soft-disabled click prevention.
   *
   * Since toggling `softDisabled` to `true` is rare, we only add/remove
   * the click listener when needed (zero overhead for most buttons).
   *
   * @returns Cleanup function to remove listener, or undefined if not needed.
   */
  readonly #softDisabledClickEffect = (): (() => void) | undefined => {
    if (!this.softDisabled()) {
      return;
    }

    // Run outside NgZone because we don't change state.
    // Use capture phase to intercept clicks before Angular event bindings.
    const removeClickListener = this.#ngZone.runOutsideAngular(() =>
      this.#renderer.listen(
        this.#elementRef.nativeElement,
        'click',
        (event: MouseEvent) => {
          event.preventDefault();
          event.stopImmediatePropagation();
        },
        { capture: true },
      ),
    );

    // Cleanup: remove listener when `softDisabled` becomes `false` or on destroy.
    return () => {
      removeClickListener();
    };
  };

  constructor() {
    // Reactively add/remove click listener based on softDisabled signal.
    // Only adds listener when softDisabled is true (rare), so most buttons
    // have zero click-handling overhead. SSR-safe (only runs in browser).
    afterRenderEffect(this.#softDisabledClickEffect);
  }

  /**
   * Handles Space key activation for anchor elements with `role="button"`.
   *
   * Native `<button>` elements respond to both Enter and Space keys, but
   * `<a>` elements only respond to Enter. When we add `role="button"` to
   * anchors, users expect Space to work too (per WAI-ARIA button pattern).
   *
   * Always prevents default to stop page scroll (Space's native behavior).
   * Only triggers click if not soft-disabled.
   *
   * @see https://www.w3.org/WAI/ARIA/apg/patterns/button/
   */
  protected handleSpaceKey(event: Event): void {
    // Prevent page scroll (Space's default behavior)
    event.preventDefault();

    // Only trigger click if not soft-disabled
    if (!this.softDisabled()) {
      (event.target as HTMLElement).click();
    }
  }
}
