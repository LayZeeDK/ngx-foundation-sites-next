import {
  Directive,
  ElementRef,
  Renderer2,
  afterNextRender,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

export type NfsStickyEdge = 'top' | 'bottom';

// Foundation's default breakpoint map in px (ADR 0005 / research/foundation-utilities-conventions.md).
// A prototype stand-in for the real nfsBreakpointsToken + NfsMediaQuery service.
const BREAKPOINTS: Record<string, number> = {
  small: 0,
  medium: 640,
  large: 1024,
  xlarge: 1200,
  xxlarge: 1440,
};

/**
 * Prototype only. Answers P7: can CSS `position: sticky` plus IntersectionObserver
 * sentinels honour the Foundation Sticky class contract (`.is-stuck`, `.is-at-top`,
 * `.is-at-bottom`, `.is-anchored`) and the `stuck`/`unstuck` outputs.
 *
 * topAnchor/btmAnchor are recorded as inputs (matching Foundation's data attributes)
 * but are NOT read by this directive: the browser only ever bounds a sticky element
 * by its containing block (the `[nfsStickyContainer]` element), so honouring an
 * arbitrary anchor id means the consumer must size that container to match the
 * anchor range themselves (see prototypes/case-anchor-*). This is the documented
 * limit the prototype README states.
 */
@Directive({
  selector: '[nfsSticky]',
  host: {
    class: 'sticky',
    '[style.position]': 'gateEnabled() ? "sticky" : "static"',
    '[style.top]': 'stickTo() === "top" ? offsetCss() : null',
    '[style.bottom]': 'stickTo() === "bottom" ? offsetCss() : null',
    '[class.is-stuck]': 'isStuck()',
    '[class.is-at-top]': 'isStuck() ? stickTo() === "top" : restingAtTop()',
    '[class.is-at-bottom]': 'isStuck() ? stickTo() === "bottom" : !restingAtTop()',
    '[class.is-anchored]': '!isStuck()',
  },
})
export class NfsSticky {
  readonly stickTo = input<NfsStickyEdge>('top');
  readonly marginTop = input(1, { transform: numberAttribute });
  readonly marginBottom = input(1, { transform: numberAttribute });
  readonly stickyOn = input('medium');

  /** Foundation `data-top-anchor`/`data-btm-anchor`; recorded, not honoured. See class doc. */
  readonly topAnchor = input('');
  readonly btmAnchor = input('');

  readonly stuck = output<NfsStickyEdge>();
  readonly unstuck = output<NfsStickyEdge>();

  /** Read-only: whether the element is currently pinned (position: sticky engaged). */
  readonly isStuck = signal(false);

  protected readonly restingAtTop = signal(true);
  protected readonly gateEnabled = signal(true);
  protected readonly offsetCss = computed(
    () => `${this.stickTo() === 'top' ? this.marginTop() : this.marginBottom()}em`,
  );

  readonly #host = inject(ElementRef<HTMLElement>);
  readonly #renderer = inject(Renderer2);

  constructor() {
    afterNextRender(() => this.#setup());
  }

  #setup(): void {
    const host = this.#host.nativeElement;
    const container = host.parentElement;
    if (!container) {
      return;
    }

    // Sentinels mark the CONTAINER's own bounds (not the host's position within
    // it), because the stuck/unstuck transitions are governed by the containing
    // block's edges, not by where the host happens to sit inside it.
    const topSentinel = this.#createSentinel();
    const bottomSentinel = this.#createSentinel();
    container.insertBefore(topSentinel, container.firstChild);
    container.appendChild(bottomSentinel);

    const fontSizePx = parseFloat(getComputedStyle(document.body).fontSize);
    const offsetPx =
      (this.stickTo() === 'top' ? this.marginTop() : this.marginBottom()) * fontSizePx;
    const elementHeightPx = host.getBoundingClientRect().height;

    const update = () => {
      const passedNearEdge = isPastNearEdge();
      const passedFarEdge = isPastFarEdge();
      // The stickyOn gate wins: below the breakpoint the host is `position:
      // static` and cannot be visually stuck no matter what the sentinels say.
      const nowStuck = this.gateEnabled() && passedNearEdge && !passedFarEdge;
      if (nowStuck !== this.isStuck()) {
        this.isStuck.set(nowStuck);
        const edge = this.stickTo();
        (nowStuck ? this.stuck : this.unstuck).emit(edge);
      }
      // Not stuck: resting at the top of the range until the far sentinel says
      // the container's far edge scrolled past, then resting at the bottom.
      this.restingAtTop.set(!passedFarEdge);
    };

    // Foundation's is-at-top/is-at-bottom are about which end of the CONTAINER
    // the host currently rests against, independent of stickTo: the CSS sticky
    // algorithm's clamp is bound below by the container's top edge (the "phase
    // 1 / not-yet-stuck" resting spot, near edge) and above by the container's
    // bottom edge (the "phase 3 / ran-out-of-room" resting spot, far edge), for
    // BOTH stickTo values. Only the pinned target (measured from the viewport's
    // top or bottom) differs between the two.
    let isPastNearEdge: () => boolean;
    let isPastFarEdge: () => boolean;

    if (this.stickTo() === 'top') {
      const nearShrinkPx = Math.round(offsetPx) + 1;
      const farShrinkPx = Math.round(offsetPx + elementHeightPx) + 1;
      isPastNearEdge = () => topSentinel.getBoundingClientRect().top < nearShrinkPx;
      isPastFarEdge = () => bottomSentinel.getBoundingClientRect().top < farShrinkPx;

      // rootMargin only schedules the IntersectionObserver callback to fire
      // near the exact threshold line, so most scroll frames need no work at
      // all (cheaper than a plain scroll listener); `update` always re-reads
      // the live geometry rather than trusting the observer's own boolean.
      new IntersectionObserver(update, { threshold: [0], rootMargin: `-${nearShrinkPx}px 0px 0px 0px` }).observe(
        topSentinel,
      );
      new IntersectionObserver(update, { threshold: [0], rootMargin: `-${farShrinkPx}px 0px 0px 0px` }).observe(
        bottomSentinel,
      );
    } else {
      const nearLinePx = Math.round(window.innerHeight - offsetPx - elementHeightPx);
      const farLinePx = Math.round(window.innerHeight - offsetPx);
      isPastNearEdge = () => topSentinel.getBoundingClientRect().top < nearLinePx;
      isPastFarEdge = () => bottomSentinel.getBoundingClientRect().bottom < farLinePx;

      new IntersectionObserver(update, {
        threshold: [0],
        rootMargin: `0px 0px -${window.innerHeight - nearLinePx}px 0px`,
      }).observe(topSentinel);
      new IntersectionObserver(update, {
        threshold: [0],
        rootMargin: `0px 0px -${window.innerHeight - farLinePx}px 0px`,
      }).observe(bottomSentinel);
    }

    // Backstop: IntersectionObserver only notifies on a threshold CROSSING
    // between two sampled frames. A single instantaneous jump larger than the
    // shrunk band (`scrollIntoView()`, Home/End on a tall page, a hash
    // navigation, or Playwright's own `window.scrollTo`) can leave the
    // element on one side of the band before the jump and the other side
    // after, with no sampled frame ever inside it - the observer then never
    // fires and the class contract goes stale until the user scrolls back
    // across the same line. Verified in this prototype (see the README).
    // A rAF-throttled native `scroll` listener re-reads the same geometry
    // directly, closing the gap the same way Foundation's own `checkEvery`
    // scroll-driven recompute did.
    let scrollRafId = 0;
    window.addEventListener(
      'scroll',
      () => {
        if (scrollRafId) {
          return;
        }
        scrollRafId = requestAnimationFrame(() => {
          scrollRafId = 0;
          update();
        });
      },
      { passive: true },
    );

    // Set up last: its own `apply()` calls `update()` synchronously, which
    // reads `isPastNearEdge`/`isPastFarEdge` above - both must already be
    // assigned by the branch that ran.
    this.#setupBreakpointGate(update);
  }

  #setupBreakpointGate(onChange: () => void): void {
    const px = BREAKPOINTS[this.stickyOn()] ?? 0;
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const apply = () => {
      this.gateEnabled.set(mq.matches);
      onChange();
    };
    apply();
    mq.addEventListener('change', apply);
  }

  #createSentinel(): HTMLElement {
    const sentinel = this.#renderer.createElement('span') as HTMLElement;
    sentinel.setAttribute('data-nfs-sticky-sentinel', '');
    Object.assign(sentinel.style, {
      display: 'block',
      // 1px, not 0: a zero-area target's intersection ratio is undefined in some
      // engines, so height:0 sentinels report unreliable isIntersecting values.
      height: '1px',
      margin: '0',
      padding: '0',
      pointerEvents: 'none',
    });
    return sentinel;
  }
}
