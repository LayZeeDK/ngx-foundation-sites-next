// PROTOTYPE -- in-place Anchored pane: the Positionable port measured in afterRenderEffect,
// re-run from ResizeObserver, writing top/left on Foundation's own position: absolute element.
import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  ViewContainerRef,
  ComponentRef,
} from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Alignment, bodyBounds, explicitOffsets as explicit, Placement, place, Position, resolveStart } from './positionable';

interface PositionerConfig {
  kind: 'dropdown' | 'tooltip';
  open: () => boolean;
  anchor: () => HTMLElement | null;
  position: () => Position | 'auto';
  alignment: () => Alignment | 'auto';
  vOffset: () => number;
  hOffset: () => number;
  allowOverlap: () => boolean;
  allowBottomOverlap: () => boolean;
  /** Not Foundation: also re-run on any scroll (captured at the document) while open. */
  followScroll?: () => boolean;
}

/** Call from an injection context. Returns the resolved placement as a signal. */
export function anchoredPositioner(cfg: PositionerConfig) {
  const el: HTMLElement = inject(ElementRef).nativeElement;
  const doc = inject(DOCUMENT);
  const dir = inject(Directionality);
  const placed = signal<Placement | null>(null);
  const tick = signal(0);
  const pip = cfg.kind === 'tooltip' ? { height: 14, width: 12 } : { height: 0, width: 0 }; // Tooltip tooltipHeight/tooltipWidth defaults

  // ResizeObserver on pane, anchor and body box (the body box is Foundation's collision bound).
  // Created lazily inside the render callback, which never runs on the server.
  let ro: ResizeObserver | null = null;
  let observedAnchor: HTMLElement | null = null;
  const onScroll = () => tick.update((n) => n + 1);
  let scrollListening = false;
  const listenScroll = (on: boolean) => {
    if (on !== scrollListening) {
      doc[on ? 'addEventListener' : 'removeEventListener']('scroll', onScroll, { capture: true, passive: true } as AddEventListenerOptions);
      scrollListening = on;
    }
  };
  inject(DestroyRef).onDestroy(() => {
    ro?.disconnect();
    listenScroll(false);
  });

  afterRenderEffect({
    earlyRead: () => {
      tick();
      listenScroll(cfg.open() && !!cfg.followScroll?.());

      if (!cfg.open()) {
        return null;
      }

      const anchor = cfg.anchor();

      if (!anchor) {
        return null;
      }

      const win = doc.defaultView!;

      if (!ro) {
        ro = new win.ResizeObserver(() => tick.update((n) => n + 1));
        ro.observe(el);
        ro.observe(doc.body);
      }

      if (observedAnchor !== anchor) {
        ro.observe(anchor);
        observedAnchor = anchor;
      }

      const sx = win.scrollX;
      const sy = win.scrollY;
      const a = anchor.getBoundingClientRect();
      const p = el.getBoundingClientRect();
      const cs = win.getComputedStyle(el);
      const b = doc.body.getBoundingClientRect();

      return {
        anchor: { top: a.top + sy, left: a.left + sx, width: a.width, height: a.height },
        size: { width: p.width, height: p.height },
        // Containing-block origin in document coordinates: where top:0/left:0 would put the pane.
        // This replaces jQuery's $.fn.offset({top, left}) conversion.
        origin: { top: p.top + sy - px(cs.top, el.offsetTop), left: p.left + sx - px(cs.left, el.offsetLeft) },
        bounds: bodyBounds({ width: b.width, height: b.height }, sx, sy),
      };
    },
    write: (m) => {
      const measured = m();

      if (!measured) {
        return;
      }

      const start = resolveStart(cfg.kind, cfg.position(), cfg.alignment(), dir.valueSignal() === 'rtl');
      const offsets = (pos: Position) => ({
        v: cfg.vOffset() + (pos === 'top' || pos === 'bottom' ? pip.height : 0),
        h: cfg.hOffset() + (pos === 'left' || pos === 'right' ? pip.width : 0),
      });
      const at = (pl: Placement) => {
        const o = offsets(pl.position);
        const { top, left } = explicit(measured.anchor, measured.size, pl, o.v, o.h);

        return { top, left, ...measured.size };
      };
      // Simplification: one measurement per open/resize (earlyRead), candidates computed from a fixed
      // size. Foundation re-measures per candidate; this differs only when the pane's width
      // depends on where it sits (shrink-to-fit), and the ResizeObserver then re-runs it.
      const result = place(
        { start, allowOverlap: cfg.allowOverlap(), allowBottomOverlap: cfg.allowBottomOverlap(), offsets },
        measured.bounds,
        at,
      );
      const final = at(result);
      el.style.top = `${final.top - measured.origin.top}px`;
      el.style.left = `${final.left - measured.origin.left}px`;
      placed.set({ position: result.position, alignment: result.alignment });
    },
  });

  return placed.asReadonly();
}

/** Resolved top/left in px; falls back to the offsetParent-relative offset if a browser answers 'auto'. */
function px(value: string, fallback: number): number {
  const n = parseFloat(value);

  return Number.isNaN(n) ? fallback : n;
}

@Directive({
  selector: '[nfsDropdownPane]',
  exportAs: 'nfsDropdownPane',
  host: {
    class: 'dropdown-pane',
    '[class.is-open]': 'isOpen()',
    '[class]': 'placementClasses()',
    '[attr.id]': 'id',
  },
})
export class NfsDropdownPane {
  readonly isOpen = model(false);
  readonly anchor = input<HTMLElement | null>(null);
  readonly position = input<Position | 'auto'>('auto');
  readonly alignment = input<Alignment | 'auto'>('auto');
  readonly vOffset = input(0, { transform: numberAttribute });
  readonly hOffset = input(0, { transform: numberAttribute });
  readonly allowOverlap = input(false, { transform: booleanAttribute });
  readonly allowBottomOverlap = input(true, { transform: booleanAttribute });
  readonly followScroll = input(false, { transform: booleanAttribute });
  readonly id = inject(_IdGenerator).getId('nfs-dropdown-pane-');

  readonly placement = anchoredPositioner({
    kind: 'dropdown',
    open: this.isOpen,
    anchor: this.anchor,
    position: this.position,
    alignment: this.alignment,
    vOffset: this.vOffset,
    hOffset: this.hOffset,
    allowOverlap: this.allowOverlap,
    allowBottomOverlap: this.allowBottomOverlap,
    followScroll: this.followScroll,
  });

  /** Foundation's has-position-* / has-alignment-* (dropdown.js:118-120). */
  protected readonly placementClasses = computed(() => {
    const p = this.placement();

    return p ? `has-position-${p.position} has-alignment-${p.alignment}` : '';
  });

  toggle() {
    this.isOpen.update((o) => !o);
  }
}

@Component({
  selector: 'nfs-tooltip-tip',
  template: '{{ text() }}',
  host: {
    class: 'tooltip',
    role: 'tooltip',
    '[attr.id]': 'id',
    '[hidden]': '!isOpen()',
    '[class]': 'placementClasses()',
  },
})
export class NfsTooltipTip {
  readonly text = signal('');
  readonly isOpen = signal(false);
  readonly anchor = signal<HTMLElement | null>(null);
  readonly options = signal({ position: 'auto' as Position | 'auto', alignment: 'auto' as Alignment | 'auto', vOffset: 0, hOffset: 0 });
  readonly id = inject(_IdGenerator).getId('nfs-tooltip-');

  readonly placement = anchoredPositioner({
    kind: 'tooltip',
    open: this.isOpen,
    anchor: this.anchor,
    position: () => this.options().position,
    alignment: () => this.options().alignment,
    vOffset: () => this.options().vOffset,
    hOffset: () => this.options().hOffset,
    allowOverlap: () => false,
    allowBottomOverlap: () => false, // Tooltip default (tooltip.js:420)
  });

  /** Foundation's {position} and align-{alignment} on the tip (tooltip.js:141-142), read by the pip Sass. */
  protected readonly placementClasses = computed(() => {
    const p = this.placement();

    return p ? `${p.position} align-${p.alignment}` : '';
  });
}

@Directive({
  selector: '[nfsTooltip]',
  exportAs: 'nfsTooltip',
  host: {
    class: 'has-tip',
    '[attr.aria-describedby]': 'tipId()',
    '(focusin)': 'open()',
    '(focusout)': 'close()',
    '(pointerenter)': 'open()',
    '(pointerleave)': 'close()',
    '(keydown.escape)': 'close()',
  },
})
export class NfsTooltip {
  readonly nfsTooltip = input.required<string>();
  readonly position = input<Position | 'auto'>('auto');
  readonly alignment = input<Alignment | 'auto'>('auto');
  readonly vOffset = input(0, { transform: numberAttribute });
  readonly hOffset = input(0, { transform: numberAttribute });

  readonly #vcr = inject(ViewContainerRef);
  readonly #host: HTMLElement = inject(ElementRef).nativeElement;
  readonly #tip = signal<ComponentRef<NfsTooltipTip> | null>(null);
  protected readonly tipId = computed(() => this.#tip()?.instance.id ?? null);

  open() {
    let ref = this.#tip();

    if (!ref) {
      // Created on first show (always a client event) as the trigger's next sibling, then kept.
      ref = this.#vcr.createComponent(NfsTooltipTip);
      this.#tip.set(ref);
    }

    const tip = ref.instance;
    tip.text.set(this.nfsTooltip());
    tip.anchor.set(this.#host);
    tip.options.set({ position: this.position(), alignment: this.alignment(), vOffset: this.vOffset(), hOffset: this.hOffset() });
    tip.isOpen.set(true);
  }

  close() {
    this.#tip()?.instance.isOpen.set(false);
  }
}
