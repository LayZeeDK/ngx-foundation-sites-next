// PROTOTYPE -- throwaway. Extends the slider-range-input prototype's directive
// (D:/tmp/nfs-proto-slider-range-input/slider-proto/src/app/slider.ts) to answer:
// do keys and drags made before hydration survive on TWO-HANDLE and NON-LINEAR
// sliders, does a replayed non-linear key apply exactly one step, do a two-handle
// non-linear slider's bar-position bounds keep the thumbs from crossing, and does
// rule 12 give a correct RTL slider?
import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  InjectionToken,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';

export type NfsPositionValueFunction = 'linear' | 'pow' | 'log';

export const nfsSliderToken = new InjectionToken<NfsSlider>('nfsSliderToken');

// Non-linear sliders carry a bar position (0..POSITION_MAX) in the native input
// (ADR 0020); the model value is mapped from it with Foundation's own formulas.
// ponytail: fixed resolution; a `positionResolution` input if 1000 is too coarse.
const POSITION_MAX = 1000;

/** Foundation `baseLog`, `_logTransform`, `_powTransform` (foundation.slider.js:173-182). */
function logTransform(p: number, base: number): number {
  return Math.log(p * (base - 1) + 1) / Math.log(base);
}

function powTransform(p: number, base: number): number {
  return (Math.pow(base, p) - 1) / (base - 1);
}

/** `.slider` container: Foundation's track, `.disabled`, `.vertical`. */
@Directive({
  selector: '[nfsSlider]',
  exportAs: 'nfsSlider',
  providers: [{ provide: nfsSliderToken, useExisting: NfsSlider }],
  host: {
    class: 'slider',
    '[class.vertical]': 'vertical()',
    '[class.disabled]': 'disabled()',
    '[style.--nfs-slider-lo]': 'fillStart()',
    '[style.--nfs-slider-hi]': 'fillEnd()',
    '(pointerdown)': 'onPointerDown($event)',
    '(click)': 'onTrackClick($event)',
  },
})
export class NfsSlider {
  /** Foundation `data-start`. */
  readonly start = input(0, { transform: numberAttribute });
  /** Foundation `data-end`. */
  readonly end = input(100, { transform: numberAttribute });
  /** Foundation `data-step`. */
  readonly step = input(1, { transform: numberAttribute });
  /** Foundation `data-vertical`. */
  readonly vertical = input(false, { transform: booleanAttribute });
  /** Foundation `data-disabled`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Library default per building-blocks 1.10: aria-disabled and still focusable. */
  readonly softDisabled = input(true, { transform: booleanAttribute });
  /** Foundation `data-position-value-function`; ADR 0020: non-linear handles carry the bar position. */
  readonly positionValueFunction = input<NfsPositionValueFunction>('linear');
  /** Foundation `data-non-linear-base`. */
  readonly nonLinearBase = input(5, { transform: numberAttribute });
  /** Foundation `data-decimal`. */
  readonly decimal = input(2, { transform: numberAttribute });

  readonly #el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly handles = signal<readonly NfsSliderHandle[]>([]);
  readonly isRange = computed(() => this.handles().length === 2);
  readonly nonLinear = computed(() => this.positionValueFunction() !== 'linear');

  /** Fill start and end as fractions of the track (thumb-centre positions). */
  readonly fillStart = computed(() => (this.isRange() ? this.fraction(this.handles()[0].value()) : 0));
  readonly fillEnd = computed(() => {
    const hs = this.handles();

    return hs.length ? this.fraction(hs[hs.length - 1].value()) : 0;
  });

  register(handle: NfsSliderHandle): void {
    // ponytail: registration order = DOM order for a static template; building-blocks
    // 1.9 sorts by DOM order with a MutationObserver when handles can move.
    this.handles.update((hs) => [...hs, handle]);
  }

  /** Value -> fraction of the bar, Foundation `_pctOfBar`. */
  fraction(value: number): number {
    const pct = (value - this.start()) / (this.end() - this.start());

    switch (this.positionValueFunction()) {
      case 'pow': {
        return logTransform(pct, this.nonLinearBase());
      }
      case 'log': {
        return powTransform(pct, this.nonLinearBase());
      }
      default: {
        return pct;
      }
    }
  }

  /** Fraction of the bar -> value snapped to step, Foundation `_value` + `_adjustValue`. */
  valueAt(fraction: number): number {
    let p = Math.min(1, Math.max(0, fraction));

    switch (this.positionValueFunction()) {
      case 'pow': {
        p = powTransform(p, this.nonLinearBase());
        break;
      }
      case 'log': {
        p = logTransform(p, this.nonLinearBase());
        break;
      }
    }

    return this.snap(this.start() + p * (this.end() - this.start()));
  }

  /** A handle's value expressed in the native units its own input carries (ADR 0020: bar position for non-linear). */
  toNative(value: number): number {
    return this.nonLinear() ? this.fraction(value) * POSITION_MAX : value;
  }

  snap(value: number): number {
    const step = this.step();
    const snapped = Math.round((value - this.start()) / step) * step + this.start();
    const clamped = Math.min(this.end(), Math.max(this.start(), snapped));

    return Number(clamped.toFixed(this.decimal()));
  }

  /**
   * Foundation `clickSelect` for the range form only: both inputs have
   * `pointer-events: none` so each thumb stays grabbable, which removes the
   * native track click. A single slider keeps the native track click.
   * `click`, not `pointerdown`: focus moves on mousedown, so a focus() call in
   * pointerdown is undone by the browser.
   */
  protected pressStartedOnThumb = false;

  protected onPointerDown(event: PointerEvent): void {
    this.pressStartedOnThumb = event.target instanceof HTMLInputElement;
  }

  protected onTrackClick(event: MouseEvent): void {
    // A thumb drag released over the track fires `click` on the container (the
    // common ancestor); it is not a track click.
    if (!this.isRange() || this.disabled() || this.pressStartedOnThumb || event.target instanceof HTMLInputElement) {
      return;
    }

    const rect = this.#el.getBoundingClientRect();
    const [first, second] = this.handles();
    // ponytail: thumb length from the rem custom property; px or em values need a real parser.
    const rootFont = parseFloat(getComputedStyle(this.#el.ownerDocument.documentElement).fontSize);
    const thumb = parseFloat(getComputedStyle(this.#el).getPropertyValue('--nfs-slider-thumb')) * rootFont;
    const rtl = getComputedStyle(this.#el).direction === 'rtl';
    let fraction: number;

    if (this.vertical()) {
      fraction = (rect.bottom - event.clientY - thumb / 2) / (rect.height - thumb);
    } else if (rtl) {
      fraction = (rect.right - event.clientX - thumb / 2) / (rect.width - thumb);
    } else {
      fraction = (event.clientX - rect.left - thumb / 2) / (rect.width - thumb);
    }

    const value = this.valueAt(fraction);
    const nearest =
      Math.abs(value - first.value()) <= Math.abs(value - second.value()) && value <= second.value()
        ? first
        : second;

    nearest.value.set(value);
    nearest.element.focus();
  }
}

/** One thumb: a native `<input type="range">` inside `[nfsSlider]`. */
@Directive({
  selector: 'input[type=range][nfsSliderHandle]',
  exportAs: 'nfsSliderHandle',
  host: {
    // Attribute order matters: min/max/step before value so the browser does not clamp.
    '[attr.min]': 'nativeMin()',
    '[attr.max]': 'nativeMax()',
    '[attr.step]': 'nativeStep()',
    // Server HTML and default value only; the live `value` property is written in
    // afterRenderEffect so hydration does not overwrite what the user did first.
    '[attr.value]': 'nativeValue()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-orientation]': 'slider.vertical() ? "vertical" : null',
    '[attr.aria-disabled]': 'slider.disabled() && slider.softDisabled() ? "true" : null',
    '[disabled]': 'slider.disabled() && !slider.softDisabled()',
    '[style.--nfs-slider-span]': 'span()',
    '[style.pointer-events]': 'slider.isRange() ? "none" : null',
    '[style.z-index]': 'onTop() ? 2 : null',
    '(input)': 'onInput()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NfsSliderHandle {
  protected readonly slider = inject(nfsSliderToken);
  readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  /** Foundation `data-initial-start` / `data-initial-end`; two-way. */
  readonly value = model(0);
  /** Material `displayWith`, feeds `aria-valuetext`. */
  readonly displayWith = input<((value: number) => string) | undefined>(undefined);

  #synced = false;

  constructor() {
    this.slider.register(this);
    afterRenderEffect({
      write: () => {
        const wanted = this.nativeValue();

        if (this.element.value === wanted) {
          this.#synced = true;

          return;
        }

        if (!this.#synced) {
          // First client render (hydration): the user moved the native thumb
          // (a drag, or a key whose native default action ran) before the app
          // loaded. Its `input` event is already queued for replay (every native
          // value change fires one) and `onInput()` below reads the *live*
          // native value, so replaying it adopts exactly what happened, however
          // many times it replays. Writing the model-computed value here first
          // would not just clobber that (D7); for a non-linear handle it would
          // also make a replayed `keydown` add a second step on top of an
          // explicit adopt, because the keydown handler computes `value + step`
          // from whatever `this.value()` already holds. Doing nothing here and
          // deferring to the queued `input` event keeps a replayed key to
          // exactly one step (see the README "double-step" finding).
          this.#synced = true;

          return;
        }

        this.element.value = wanted;
      },
    });
  }

  readonly #index = computed((): number => this.slider.handles().indexOf(this));
  readonly #sibling = computed((): NfsSliderHandle | undefined => {
    const hs = this.slider.handles();

    return hs.length === 2 ? hs[1 - this.#index()] : undefined;
  });

  // Dependent bounds (APG multi-thumb): the native min/max carry them, because
  // ARIA in HTML says authors SHOULD NOT put aria-valuemin/max on input[type=range].
  // ADR 0020: for a non-linear handle the bound is the sibling's bar position
  // (0..1000), because that is what the native input's own min/max compare against.
  protected readonly nativeMin = computed(() => {
    const sibling = this.#sibling();

    if (sibling && this.#index() === 1) {
      return this.slider.toNative(sibling.value());
    }

    return this.slider.nonLinear() ? 0 : this.slider.start();
  });

  protected readonly nativeMax = computed(() => {
    const sibling = this.#sibling();

    if (sibling && this.#index() === 0) {
      return this.slider.toNative(sibling.value());
    }

    return this.slider.nonLinear() ? POSITION_MAX : this.slider.end();
  });

  protected readonly nativeStep = computed(() => (this.slider.nonLinear() ? 'any' : this.slider.step()));

  protected readonly nativeValue = computed(() => String(this.slider.toNative(this.value())));

  protected readonly valueText = computed(() => {
    const format = this.displayWith();

    if (format) {
      return format(this.value());
    }

    // Non-linear: aria-valuenow is the position, so the value must be spoken as text.
    return this.slider.nonLinear() ? String(this.value()) : null;
  });

  /** Share of the full track this input spans, so its dependent min/max map to the right pixels. */
  protected readonly span = computed(() => {
    if (this.slider.nonLinear()) {
      return (this.nativeMax() - this.nativeMin()) / POSITION_MAX;
    }

    const range = this.slider.end() - this.slider.start();

    return (this.nativeMax() - this.nativeMin()) / range;
  });

  /** When both thumbs meet, the one that can still move must be on top. */
  protected readonly onTop = computed(() => {
    const sibling = this.#sibling();

    if (!sibling || sibling.value() !== this.value()) {
      return false;
    }

    const mid = (this.slider.start() + this.slider.end()) / 2;

    return this.#index() === 0 ? this.value() > mid : this.value() <= mid;
  });

  protected onInput(): void {
    const n = this.element.valueAsNumber;
    const sibling = this.#sibling();

    if (this.slider.nonLinear()) {
      let position = n;

      if (sibling) {
        const siblingPosition = this.slider.toNative(sibling.value());

        position = this.#index() === 0 ? Math.min(n, siblingPosition) : Math.max(n, siblingPosition);
      }

      this.value.set(this.slider.valueAt(position / POSITION_MAX));

      return;
    }

    // The dependent native min/max are host bindings, refreshed on the next
    // change detection; a key press on this thumb in the same frame as a change
    // to the sibling can still see the old bound, so clamp here as well.
    if (sibling) {
      this.value.set(this.#index() === 0 ? Math.min(n, sibling.value()) : Math.max(n, sibling.value()));

      return;
    }

    this.value.set(n);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

    if (!keys.includes(event.key)) {
      return;
    }

    if (this.slider.disabled()) {
      // Soft-disabled: focusable but the native input must not move.
      event.preventDefault();

      return;
    }

    if (!this.slider.nonLinear()) {
      return; // Linear: every key, including the dependent-bound clamp, is native.
    }

    // Non-linear: one key press is one value step, not one bar-position step
    // (ADR 0020); the sibling clamp mirrors the linear native min/max, because a
    // non-linear handle computes its own next value instead of letting the
    // browser clamp it against the native bound.
    const sibling = this.#sibling();
    const step = this.slider.step();
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const deltas: Record<string, number> = {
      ArrowUp: step,
      ArrowDown: -step,
      ArrowRight: rtl ? -step : step,
      ArrowLeft: rtl ? step : -step,
      PageUp: step * 10,
      PageDown: -step * 10,
    };
    let next: number;

    if (event.key === 'Home') {
      next = sibling && this.#index() === 1 ? sibling.value() : this.slider.start();
    } else if (event.key === 'End') {
      next = sibling && this.#index() === 0 ? sibling.value() : this.slider.end();
    } else {
      next = this.slider.snap(this.value() + deltas[event.key]);

      if (sibling) {
        next = this.#index() === 0 ? Math.min(next, sibling.value()) : Math.max(next, sibling.value());
      }
    }

    this.value.set(next);
    // State first, preventDefault last (building-blocks 1.5, replay-safe: this
    // throws during event replay and is logged, never reaching this handler's
    // own code -- OPEN FOR HUMAN 3 in the rendering-modes research).
    event.preventDefault();
  }
}
