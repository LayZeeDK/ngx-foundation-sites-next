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
 * Responsive expanded breakpoint values.
 * Matches Foundation's responsive expanded class suffixes.
 *
 * @see https://get.foundation/sites/docs/button.html#responsive-expanded
 */
export type NfsButtonExpandedBreakpoint =
  | 'small-only'
  | 'medium-only'
  | 'large-only'
  | 'medium'
  | 'large'
  | 'medium-down'
  | 'large-down';

/**
 * Type for the expanded input.
 * - `false`: Not expanded (default)
 * - `true`: Always expanded (`.expanded` class)
 * - Breakpoint string: Responsive expanded (e.g., `.medium-expanded` class)
 */
export type NfsButtonExpanded = boolean | NfsButtonExpandedBreakpoint;

/**
 * Valid breakpoint values for responsive expanded.
 */
const VALID_EXPANDED_BREAKPOINTS: ReadonlySet<string> = new Set([
  'small-only',
  'medium-only',
  'large-only',
  'medium',
  'large',
  'medium-down',
  'large-down',
]);

/**
 * Transform for the expanded input.
 * Delegates to Angular's booleanAttribute for boolean coercion,
 * while also accepting responsive breakpoint strings.
 *
 * @param value - Raw input value from template
 * @returns Normalized NfsButtonExpanded value
 */
function expandedTransform(value: unknown): NfsButtonExpanded {
  // Check for valid breakpoint strings FIRST (before booleanAttribute converts them)
  if (typeof value === 'string' && VALID_EXPANDED_BREAKPOINTS.has(value)) {
    return value as NfsButtonExpandedBreakpoint;
  }

  // Delegate all other values to Angular's booleanAttribute
  // This handles: true, false, '', 'true', 'false', null, undefined
  return booleanAttribute(value);
}

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

    // Expanded (full-width) - always expanded
    '[class.expanded]': 'expanded() === true',

    // Responsive expanded classes - breakpoint-specific
    '[class.small-only-expanded]': 'expanded() === "small-only"',
    '[class.medium-only-expanded]': 'expanded() === "medium-only"',
    '[class.large-only-expanded]': 'expanded() === "large-only"',
    '[class.medium-expanded]': 'expanded() === "medium"',
    '[class.large-expanded]': 'expanded() === "large"',
    '[class.medium-down-expanded]': 'expanded() === "medium-down"',
    '[class.large-down-expanded]': 'expanded() === "large-down"',

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
   * Whether the button spans full width, optionally at specific breakpoints.
   *
   * Maps to Foundation CSS classes:
   * - `true` or `expanded` attribute: `.expanded` (always full-width)
   * - `'small-only'`: `.small-only-expanded` (full-width only on small screens)
   * - `'medium-only'`: `.medium-only-expanded` (full-width only on medium screens)
   * - `'large-only'`: `.large-only-expanded` (full-width only on large screens)
   * - `'medium'`: `.medium-expanded` (full-width on medium and larger)
   * - `'large'`: `.large-expanded` (full-width on large and larger)
   * - `'medium-down'`: `.medium-down-expanded` (full-width on medium and smaller)
   * - `'large-down'`: `.large-down-expanded` (full-width on large and smaller)
   *
   * Supports both property binding and HTML attribute syntax:
   * - `[expanded]="true"` or `expanded` — always expanded
   * - `expanded="medium"` — responsive expanded
   *
   * @see https://get.foundation/sites/docs/button.html#responsive-expanded
   * @default false
   */
  readonly expanded = input<NfsButtonExpanded, unknown>(false, {
    transform: expandedTransform,
  });

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
