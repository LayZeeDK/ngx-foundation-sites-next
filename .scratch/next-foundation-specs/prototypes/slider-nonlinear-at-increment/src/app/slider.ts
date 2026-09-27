// PROTOTYPE -- throwaway. Extends the slider-hydration-nonlinear prototype's
// directive to answer one question: can a numeric native `step` plus an `input`
// rule make assistive-technology increment and decrement actions move a
// non-linear Handle one value step?
//
// Changes against that prototype, all on non-linear Handles only:
// 1. The key handler writes the live native value and dispatches `input` and
//    `change` itself (Slider spec D18), which its own listener ignores.
// 2. The native `step` is a prototype knob (`nativeStepMode`): 'any' (the spec
//    today), 'raw' (step 1 with the spec's unrounded positions), or 'grid'
//    (step 1 with every native value and bound rounded to the integer grid).
// 3. The native range is a knob (`resolution`): 'fixed' (0..1000, ADR 0020) or
//    'auto' (the smallest 1000 * 10^k that gives every value step at least two
//    native units).
// 4. The `input` rule (`atRule`): a native value change with no pointer pressed
//    on the Handle and not dispatched by the directive, whose mapped value
//    equals the current value, moves one value step in the direction of the
//    change and writes the native value.
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
export type NfsNativeStepMode = 'any' | 'raw' | 'grid';

export const nfsSliderToken = new InjectionToken<NfsSlider>('nfsSliderToken');

/** Foundation `baseLog`, `_logTransform`, `_powTransform` (foundation.slider.js:173-182). */
function logTransform(p: number, base: number): number {
  return Math.log(p * (base - 1) + 1) / Math.log(base);
}

function powTransform(p: number, base: number): number {
  return (Math.pow(base, p) - 1) / (base - 1);
}

@Directive({
  selector: '[nfsSlider]',
  exportAs: 'nfsSlider',
  providers: [{ provide: nfsSliderToken, useExisting: NfsSlider }],
  host: {
    class: 'slider',
    '[class.disabled]': 'disabled()',
    '[style.--nfs-slider-lo]': 'fillStart()',
    '[style.--nfs-slider-hi]': 'fillEnd()',
    '(pointerdown)': 'onPointerDown($event)',
    '(click)': 'onTrackClick($event)',
  },
})
export class NfsSlider {
  readonly start = input(0, { transform: numberAttribute });
  readonly end = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly positionValueFunction = input<NfsPositionValueFunction>('linear');
  readonly nonLinearBase = input(5, { transform: numberAttribute });
  readonly decimal = input(2, { transform: numberAttribute });
  /** PROTOTYPE knob: the native `step` of a non-linear Handle. */
  readonly nativeStepMode = input<NfsNativeStepMode>('grid');
  /** PROTOTYPE knob: the native range of a non-linear Handle. */
  readonly resolution = input<'fixed' | 'auto'>('fixed');
  /** PROTOTYPE knob: the assistive-technology `input` rule. */
  readonly atRule = input(true, { transform: booleanAttribute });
  /** PROTOTYPE knob: false drops the rule's "no pointer pressed" condition, to show why it is needed. */
  readonly pressGuard = input(true, { transform: booleanAttribute });

  readonly #el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly handles = signal<readonly NfsSliderHandle[]>([]);
  readonly isRange = computed(() => this.handles().length === 2);
  readonly nonLinear = computed(() => this.positionValueFunction() !== 'linear');

  /**
   * Native units of the whole track on a non-linear slider. 'auto' keeps every
   * value step at least two native units wide where the scale is densest (the
   * start of Foundation's `log` option, the end of its `pow` option), so a
   * one-unit change never crosses two value steps and rounding to the integer
   * grid never maps a value back to its neighbour.
   */
  readonly positionMax = computed(() => {
    if (this.resolution() === 'fixed') {
      return 1000;
    }

    const b = this.nonLinearBase();
    const steps = (this.end() - this.start()) / this.step();
    const minSlope = this.positionValueFunction() === 'log' ? Math.log(b) / (b - 1) : (b - 1) / (b * Math.log(b));
    let max = 1000;

    while ((max * minSlope) / steps < 2) {
      max *= 10;
    }

    return max;
  });

  readonly fillStart = computed(() => (this.isRange() ? this.fraction(this.handles()[0].value()) : 0));
  readonly fillEnd = computed(() => {
    const hs = this.handles();

    return hs.length ? this.fraction(hs[hs.length - 1].value()) : 0;
  });

  register(handle: NfsSliderHandle): void {
    this.handles.update((hs) => [...hs, handle]);
  }

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

  /** A value in the native units its Handle carries: the Bar position on a non-linear slider. */
  toNative(value: number): number {
    if (!this.nonLinear()) {
      return value;
    }

    const position = this.fraction(value) * this.positionMax();

    return this.nativeStepMode() === 'grid' ? Math.round(position) : position;
  }

  snap(value: number): number {
    const step = this.step();
    const snapped = Math.round((value - this.start()) / step) * step + this.start();
    const clamped = Math.min(this.end(), Math.max(this.start(), snapped));

    return Number(clamped.toFixed(this.decimal()));
  }

  protected pressStartedOnThumb = false;

  protected onPointerDown(event: PointerEvent): void {
    this.pressStartedOnThumb = event.target instanceof HTMLInputElement;
  }

  protected onTrackClick(event: MouseEvent): void {
    if (!this.isRange() || this.disabled() || this.pressStartedOnThumb || event.target instanceof HTMLInputElement) {
      return;
    }

    const rect = this.#el.getBoundingClientRect();
    const [first, second] = this.handles();
    const rootFont = parseFloat(getComputedStyle(this.#el.ownerDocument.documentElement).fontSize);
    const thumb = parseFloat(getComputedStyle(this.#el).getPropertyValue('--nfs-slider-thumb')) * rootFont;
    const fraction = (event.clientX - rect.left - thumb / 2) / (rect.width - thumb);
    const value = this.valueAt(fraction);
    const nearest =
      Math.abs(value - first.value()) <= Math.abs(value - second.value()) && value <= second.value() ? first : second;

    nearest.commit(value);
    nearest.element.focus();
  }
}

@Directive({
  selector: 'input[type=range][nfsSliderHandle]',
  exportAs: 'nfsSliderHandle',
  host: {
    '[attr.min]': 'nativeMin()',
    '[attr.max]': 'nativeMax()',
    '[attr.step]': 'nativeStep()',
    '[attr.value]': 'nativeValue()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-disabled]': 'slider.disabled() ? "true" : null',
    '[style.--nfs-slider-span]': 'span()',
    '[style.pointer-events]': 'slider.isRange() ? "none" : null',
    '[style.z-index]': 'onTop() ? 2 : null',
    '(input)': 'onInput()',
    '(keydown)': 'onKeydown($event)',
    // The rule's "no pointer pressed" signal. These are replayed like `input`,
    // in arrival order, so a pre-hydration drag replays as pressed.
    '(pointerdown)': 'pointerPressed = true',
    '(pointerup)': 'pointerPressed = false',
    '(pointercancel)': 'pointerPressed = false',
    '(change)': 'pointerPressed = false',
  },
})
export class NfsSliderHandle {
  protected readonly slider = inject(nfsSliderToken);
  readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  readonly value = model(0);
  readonly displayWith = input<((value: number) => string) | undefined>(undefined);
  /** PROTOTYPE surface: how often the rule moved the value. */
  readonly ruleSteps = signal(0);

  protected pointerPressed = false;
  #synced = false;
  #dispatching = false;
  /** The last native value this Handle saw or wrote; the rule's direction reference. */
  #lastNative: number | undefined;

  constructor() {
    this.slider.register(this);
    afterRenderEffect({
      write: () => {
        const wanted = this.nativeValue();

        if (this.element.value === wanted) {
          this.#synced = true;
          this.#lastNative ??= this.element.valueAsNumber;

          return;
        }

        if (!this.#synced) {
          // First pass (D7): leave a pre-hydration native value alone; its
          // queued `input` event adopts it.
          this.#synced = true;
          this.#lastNative ??= Number(wanted);

          return;
        }

        this.#writeNative(wanted);
      },
    });
  }

  readonly #index = computed((): number => this.slider.handles().indexOf(this));
  readonly #sibling = computed((): NfsSliderHandle | undefined => {
    const hs = this.slider.handles();

    return hs.length === 2 ? hs[1 - this.#index()] : undefined;
  });

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

    return this.slider.nonLinear() ? this.slider.positionMax() : this.slider.end();
  });

  protected readonly nativeStep = computed(() => {
    if (!this.slider.nonLinear()) {
      return this.slider.step();
    }

    return this.slider.nativeStepMode() === 'any' ? 'any' : 1;
  });

  protected readonly nativeValue = computed(() => String(this.slider.toNative(this.value())));

  protected readonly valueText = computed(() => {
    const format = this.displayWith();

    if (format) {
      return format(this.value());
    }

    return this.slider.nonLinear() ? String(this.value()) : null;
  });

  protected readonly span = computed(() => {
    const range = this.slider.nonLinear() ? this.slider.positionMax() : this.slider.end() - this.slider.start();

    return (this.nativeMax() - this.nativeMin()) / range;
  });

  protected readonly onTop = computed(() => {
    const sibling = this.#sibling();

    if (!sibling || sibling.value() !== this.value()) {
      return false;
    }

    const mid = (this.slider.start() + this.slider.end()) / 2;

    return this.#index() === 0 ? this.value() > mid : this.value() <= mid;
  });

  #clampToSibling(value: number): number {
    const sibling = this.#sibling();

    if (!sibling) {
      return value;
    }

    return this.#index() === 0 ? Math.min(value, sibling.value()) : Math.max(value, sibling.value());
  }

  #writeNative(native: string): void {
    this.element.value = native;
    this.#lastNative = this.element.valueAsNumber;
  }

  /** A directive-made change: model, live native value, then `input` and `change` (spec: events for directive-made changes). */
  commit(value: number): void {
    this.value.set(value);
    this.#writeNative(String(this.slider.toNative(value)));
    this.#dispatching = true;

    try {
      this.element.dispatchEvent(new Event('input', { bubbles: true }));
      this.element.dispatchEvent(new Event('change', { bubbles: true }));
    } finally {
      this.#dispatching = false;
    }
  }

  protected onInput(): void {
    if (this.#dispatching || this.slider.disabled()) {
      return;
    }

    const n = this.element.valueAsNumber;
    const sibling = this.#sibling();

    if (!this.slider.nonLinear()) {
      this.value.set(sibling ? this.#clampToSibling(n) : n);

      return;
    }

    const last = this.#lastNative ?? Number(this.nativeValue());
    this.#lastNative = n;
    let position = n;

    if (sibling) {
      const siblingPosition = this.slider.toNative(sibling.value());
      position = this.#index() === 0 ? Math.min(n, siblingPosition) : Math.max(n, siblingPosition);
    }

    const mapped = this.slider.valueAt(position / this.slider.positionMax());

    const pressed = this.slider.pressGuard() && this.pointerPressed;

    if (this.slider.atRule() && !pressed && n !== last && mapped === this.value()) {
      // The rule: an assistive-technology increment or decrement (or any other
      // outside write) that lands on the same value moves one value step.
      const next = this.#clampToSibling(this.slider.snap(this.value() + Math.sign(n - last) * this.slider.step()));

      if (next !== this.value()) {
        this.ruleSteps.update((c) => c + 1);
      }

      this.value.set(next);
      this.#writeNative(String(this.slider.toNative(next)));

      return;
    }

    this.value.set(mapped);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

    if (!keys.includes(event.key)) {
      return;
    }

    if (this.slider.disabled()) {
      event.preventDefault();

      return;
    }

    if (!this.slider.nonLinear()) {
      return;
    }

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
      next = this.#clampToSibling(this.slider.snap(this.value() + deltas[event.key]));
    }

    // D18: state first (model, live native value, events), preventDefault last;
    // it throws during replay and Angular logs it.
    this.commit(next);
    event.preventDefault();
  }
}
