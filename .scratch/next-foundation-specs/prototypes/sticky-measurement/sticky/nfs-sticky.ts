import { DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, input, numberAttribute, output, signal } from '@angular/core';

import { buildNfsMediaQuery } from './breakpoints';
import { type NfsStickyEdge, canonicalizeStickyOn, computeStickyState } from './state';

export type { NfsStickyEdge } from './state';

/**
 * Prototype only (ticket 63). Implements specs/sticky.md's design: native `position: sticky`
 * gated by CSS (`data-nfs-sticky-on`, built with Foundation's breakpoint() in styles.scss),
 * state derived by the pure function in ./state from the host's own rectangle, sentinels
 * appended at the container's end purely to schedule re-measurement, and a rAF-throttled
 * scroll backstop for jumps the observers miss. Anchor inputs are dropped per ADR 0019; no
 * dev-mode warnings are implemented here (out of the six measurement cases this ticket answers;
 * the spec already designs them).
 */
@Directive({
  selector: '[nfsSticky]',
  exportAs: 'nfsSticky',
  host: {
    class: 'sticky',
    '[attr.data-nfs-sticky-on]': 'canonicalStickyOn()',
    '[style.top]': 'stickTo() === "top" ? insetEm() : null',
    '[style.bottom]': 'stickTo() === "bottom" ? insetEm() : null',
    '[class.is-stuck]': 'isStuck()',
    '[class.is-anchored]': '!isStuck()',
    '[class.is-at-top]': 'edge() === "top"',
    '[class.is-at-bottom]': 'edge() === "bottom"',
  },
})
export class NfsSticky {
  readonly stickTo = input<NfsStickyEdge>('top');
  readonly marginTop = input(1, { transform: numberAttribute });
  readonly marginBottom = input(1, { transform: numberAttribute });
  readonly stickyOn = input('medium');

  readonly stuck = output<NfsStickyEdge>();
  readonly unstuck = output<NfsStickyEdge>();

  readonly #isStuck = signal(false);
  readonly #edge = signal<NfsStickyEdge>('top');
  readonly isStuck = this.#isStuck.asReadonly();
  readonly edge = this.#edge.asReadonly();

  protected readonly canonicalStickyOn = computed(() => canonicalizeStickyOn(this.stickyOn()));
  protected readonly insetEm = computed(() => `${this.stickTo() === 'top' ? this.marginTop() : this.marginBottom()}em`);

  readonly #host = inject(ElementRef<HTMLElement>).nativeElement;
  readonly #destroyRef = inject(DestroyRef);

  #canStick = true;

  constructor() {
    afterNextRender(() => this.#setup());
  }

  #setup(): void {
    const host = this.#host;
    const container = host.parentElement;

    if (!container) {
      return;
    }

    const scrollContainer = findScrollContainer(container);
    const scrollTarget: EventTarget = scrollContainer ?? window;
    const observerRoot: Element | null = scrollContainer;

    // D7: absolutely positioned, appended as the container's last children, so they never
    // shift layout (flex/grid item count included) and never sit ahead of a not-yet-hydrated
    // sibling view in the same container.
    const topSentinel = createSentinel('top');
    const bottomSentinel = createSentinel('bottom');
    container.appendChild(topSentinel);
    container.appendChild(bottomSentinel);

    // Position: sticky pins against the scroll container's PADDING box (inside its border), not
    // its border box, so a border on the scroll container must not shift the stick line.
    const scrollContainerRect = (): { top: number; bottom: number } => {
      if (!scrollContainer) {
        return { top: 0, bottom: window.innerHeight };
      }

      const rect = scrollContainer.getBoundingClientRect();
      const cs = getComputedStyle(scrollContainer);

      return {
        top: rect.top + (parseFloat(cs.borderTopWidth) || 0),
        bottom: rect.bottom - (parseFloat(cs.borderBottomWidth) || 0),
      };
    };

    const insetPx = (): number => {
      const fontSizePx = parseFloat(getComputedStyle(host).fontSize);

      return (this.stickTo() === 'top' ? this.marginTop() : this.marginBottom()) * fontSizePx;
    };

    const measure = (): void => {
      const next = computeStickyState({
        hostRect: host.getBoundingClientRect(),
        containerRect: container.getBoundingClientRect(),
        scrollContainerRect: scrollContainerRect(),
        insetPx: insetPx(),
        stickTo: this.stickTo(),
        canStick: this.#canStick,
      });

      if (next.isStuck === this.#isStuck() && next.edge === this.#edge()) {
        return;
      }

      const wasStuck = this.#isStuck();
      this.#isStuck.set(next.isStuck);
      this.#edge.set(next.edge);

      if (next.isStuck && !wasStuck) {
        this.stuck.emit(next.edge);
      } else if (!next.isStuck && wasStuck) {
        this.unstuck.emit(next.edge);
      }
    };

    // Independent JS breakpoint gate (case 4 compares this against the CSS gate). Foundation's
    // `stickyOn` picks whether the class contract can ever report stuck; the CSS gate alone
    // decides `position: sticky` vs `static`.
    const gateQuery = buildNfsMediaQuery(this.canonicalStickyOn());

    if (gateQuery) {
      const mql = window.matchMedia(gateQuery);
      this.#canStick = mql.matches;
      const onGateChange = (): void => {
        this.#canStick = mql.matches;
        measure();
      };
      mql.addEventListener('change', onGateChange);
      this.#destroyRef.onDestroy(() => mql.removeEventListener('change', onGateChange));
    } else {
      this.#canStick = true;
    }

    // IntersectionObserver: schedules a re-measurement near the two transition lines (cheap,
    // no-op on most frames). Correctness never depends on its precision -- see the scroll
    // backstop below.
    const rebuildObservers = (): (() => void) => {
      const hostHeight = host.getBoundingClientRect().height;
      const inset = insetPx();
      let nearMargin: string;
      let farMargin: string;

      if (this.stickTo() === 'top') {
        nearMargin = `-${Math.round(inset)}px 0px 0px 0px`;
        farMargin = `-${Math.round(inset + hostHeight)}px 0px 0px 0px`;
      } else {
        nearMargin = `0px 0px -${Math.round(inset)}px 0px`;
        farMargin = `0px 0px -${Math.round(inset + hostHeight)}px 0px`;
      }

      const near = new IntersectionObserver(() => measure(), { root: observerRoot, rootMargin: nearMargin });
      const far = new IntersectionObserver(() => measure(), { root: observerRoot, rootMargin: farMargin });
      near.observe(topSentinel);
      far.observe(bottomSentinel);

      return () => {
        near.disconnect();
        far.disconnect();
      };
    };
    let disconnectObservers = rebuildObservers();

    // rAF-throttled scroll backstop: closes the IntersectionObserver correctness gap the
    // sticky-css prototype found for instantaneous jumps (Home/End, scrollIntoView, a hash
    // navigation) -- case 2 of this ticket.
    let scrollScheduled = false;
    const onScroll = (): void => {
      if (scrollScheduled) {
        return;
      }

      scrollScheduled = true;
      requestAnimationFrame(() => {
        scrollScheduled = false;
        measure();
      });
    };
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });

    // ResizeObserver: rebuilds the near/far bands when the host or container resizes
    // (replaces Foundation's `dynamicHeight`).
    const resizeObserver = new ResizeObserver(() => {
      disconnectObservers();
      disconnectObservers = rebuildObservers();
      measure();
    });
    resizeObserver.observe(host);
    resizeObserver.observe(container);

    measure();

    this.#destroyRef.onDestroy(() => {
      disconnectObservers();
      resizeObserver.disconnect();
      scrollTarget.removeEventListener('scroll', onScroll);
      container.removeChild(topSentinel);
      container.removeChild(bottomSentinel);
    });
  }
}

// specs/sticky.md "How the class contract is measured", step 1: the nearest ancestor (starting
// at the parent, i.e. the Sticky range container itself) whose computed overflow-x or
// overflow-y is neither visible nor clip; body/root count as the viewport (represented here by
// null).
function findScrollContainer(start: Element): HTMLElement | null {
  let node: Element | null = start;

  while (node && node !== document.body && node !== document.documentElement) {
    const cs = getComputedStyle(node);

    if (isScrollAxis(cs.overflowX) || isScrollAxis(cs.overflowY)) {
      return node as HTMLElement;
    }

    node = node.parentElement;
  }

  return null;
}

function isScrollAxis(overflow: string): boolean {
  return overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden';
}

function createSentinel(kind: 'top' | 'bottom'): HTMLElement {
  const span = document.createElement('span');
  span.setAttribute('data-nfs-sticky-sentinel', kind);
  span.setAttribute('aria-hidden', 'true');
  Object.assign(span.style, {
    position: 'absolute',
    left: '0',
    width: '1px',
    height: '1px',
    pointerEvents: 'none',
  });
  span.style[kind] = '0';

  return span;
}
