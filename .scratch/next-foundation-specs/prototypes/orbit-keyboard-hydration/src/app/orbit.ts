// PROTOTYPE (throwaway) -- Orbit keyboard scrolling and hydration details. Builds on
// D:/tmp/nfs-proto-orbit-scroll-snap/orbit (Prototype: Orbit on CSS scroll snap) and adds
// the spec's ADR 0025 `inert` gate, the bullet `tabindex` handover, the inward focus ring,
// the hidden scrollbar, the 24 px bullet floor, the focus handoff when a focused slide
// scrolls out, and rotation stopping only on `:focus-visible`.
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dir } from '@angular/cdk/bidi';
import { Tab, TabList, TabPanel, Tabs } from '@angular/aria/tabs';

type Cause = 'user' | 'auto' | 'scroll';

// ADR 0025: the slide is `inert` only once the Orbit is live (its first render callback),
// never in server HTML, so a no-JS or `hydrate never` residue can still reach every slide.
// A host-directive wrapper around Aria's TabPanel, because TabPanel's own `[attr.inert]`
// binding cannot be reached from outside (building-blocks 1.9: a wrapper's own host
// binding is meant to win over its host directive's). MEASURED: it does not, for this
// specific pairing -- see the ticket's Answer, case 2, "inert gate". `TabList`'s roving
// tabindex override (`BulletGate` below, wrapping `Tab`) uses the identical pattern and
// DOES win, so this is not a blanket hostDirectives limitation; it is specific to
// `TabPanel`'s own `[attr.inert]` binding and was not resolved within this prototype's
// budget. Kept here as the documented (measured-failing) attempt.
@Directive({
  selector: '[slideGate]',
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: {
    '[attr.inert]': 'inertOverride()',
  },
})
export class SlideGate {
  readonly live = input.required<boolean>();
  readonly isSelected = input.required<boolean>();
  protected readonly inertOverride = computed(() => (this.live() && !this.isSelected() ? true : null));
}

// The bullet's pre-hydration tab stop. Aria's roving `tabindex` depends on its internal
// `activeItem`, which is `undefined` until `TabList`'s own render effect runs
// `setDefaultStateEffect()` (browser only, never on the server) -- until then every bullet
// is `tabindex="-1"`, so Tab never reaches the bullets before hydration (measured in the
// scroll-snap prototype). This wrapper forces the selected bullet's tabindex to 0 while
// `live` is false (the same gate the slides use), then hands over entirely to Aria's own
// per-tab `active()` signal once live, so it never fights the roving-tabindex drift Aria
// keeps after a user interacts with the bullets (ADR/decision D13).
@Directive({
  selector: '[bulletGate]',
  hostDirectives: [{ directive: Tab, inputs: ['value'] }],
  host: {
    '[attr.tabindex]': 'tabindexOverride()',
  },
})
export class BulletGate {
  readonly #tab = inject(Tab);
  readonly live = input.required<boolean>();
  readonly isSelected = input.required<boolean>();
  protected readonly tabindexOverride = computed(() => {
    if (!this.live()) {
      return this.isSelected() ? 0 : -1;
    }

    return this.#tab.active() ? 0 : -1;
  });
}

@Component({
  selector: 'app-orbit',
  imports: [Dir, Tabs, TabList, SlideGate, BulletGate],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orbit.html',
})
export class Orbit {
  readonly #zone = inject(NgZone);
  readonly #destroyRef = inject(DestroyRef);
  readonly #params = inject(ActivatedRoute).snapshot.queryParamMap;

  // Foundation options (data-timer-delay, data-auto-play, data-infinite-wrap) plus dir.
  readonly timerDelay = Number(this.#params.get('delay') ?? 5000);
  readonly autoPlay = this.#params.get('autoplay') !== 'false';
  readonly infiniteWrap = this.#params.get('wrap') !== 'false';
  readonly dir = this.#params.get('dir') === 'rtl' ? 'rtl' : 'ltr';
  /** Control case for the zone build: schedule the autoplay timer inside the zone (zone.run). */
  readonly #insideZone = this.#params.get('inside') === '1';
  /** Variant: arrows and bullets also scroll only the container (no scrollIntoView). */
  readonly #containerNav = this.#params.get('nav') === 'container';

  readonly slides = [
    { src: 'slides/slide-1.svg', alt: 'Blue test card', caption: 'Space, the final frontier.', w: 1200, h: 500 },
    { src: 'slides/slide-2.svg', alt: 'Green test card', caption: 'Lots of green space.', w: 1200, h: 500 },
    { src: 'slides/slide-3.svg', alt: 'Orange test card', caption: 'The tallest slide.', w: 1200, h: 600 },
    { src: 'slides/slide-4.svg', alt: 'Red test card', caption: 'Encapsulating.', w: 1200, h: 500 },
  ];

  /** Active slide index; the `selected` model of the spec. A `selected` query param binds
   *  a non-first initial value, for the instant-alignment case (mechanic 4). */
  readonly selected = signal(Number(this.#params.get('selected') ?? 0));
  readonly selectedValue = computed(() => `s${this.selected()}`);
  /** The user's rotation intent (APG rotation control). */
  readonly playing = signal(this.autoPlay);
  readonly hovered = signal(false);
  readonly rotating = computed(() => this.playing() && !this.hovered());
  /** ADR 0025: false on the server and until the Orbit's first render callback. */
  readonly live = signal(false);

  protected readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  protected readonly slideEls = viewChildren<ElementRef<HTMLElement>>('slide');

  /** Index a programmatic scroll is heading to; IO ignores other slides until it lands. */
  #target: number | null = null;
  /** Mechanic 8: the slide to focus once Angular has actually removed its `inert`. See
   *  the constructor's `afterRenderEffect` -- a slide due to become selected is still
   *  `inert` in the live DOM at the moment the IntersectionObserver fires (the signal
   *  write has not been rendered yet), and `.focus()` on an `inert` element is a silent
   *  no-op, so the handoff cannot happen synchronously in the observer callback. */
  readonly #pendingFocusHandoff = signal<number | null>(null);

  constructor() {
    afterNextRender(() => {
      const container = this.container().nativeElement;

      // ADR 0025 / the bullet tab-stop handover: both gates flip together, once, here.
      this.live.set(true);

      // Mechanic 4: a bound non-first `selected` aligns instantly, with no smooth scroll
      // on load. The container's `scroll-behavior` is overridden to `auto` for this one
      // write only; a container the user already scrolled before hydration is left alone
      // (it is not at scrollLeft 0 any more, so this block does not run) and the
      // IntersectionObserver adopts whatever slide is in view instead.
      const initial = this.selected();

      if (initial !== 0 && container.scrollLeft === 0) {
        const slideEl = this.slideEls()[initial].nativeElement;
        const prevBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = 'auto';
        container.scrollBy({ left: slideEl.getBoundingClientRect().left - container.getBoundingClientRect().left });
        container.style.scrollBehavior = prevBehavior;
        this.#target = initial;
      }

      // Reduced motion: autoplay starts paused (APG); scroll-behavior is CSS-only.
      const reduce = matchMedia('(prefers-reduced-motion: reduce)');

      if (reduce.matches) {
        this.playing.set(false);
      }

      const onReduce = (e: MediaQueryListEvent) => {
        if (e.matches) {
          this.playing.set(false);
        }
      };
      reduce.addEventListener('change', onReduce);

      // Active slide from geometry: whatever slide is at least half visible in the
      // scroll container. Covers swipes, trackpads, scrollbar drags, and keyboard scrolling.
      const io = new IntersectionObserver((entries) => this.#onIntersect(entries), {
        root: container,
        threshold: 0.5,
      });
      this.slideEls().forEach((s) => io.observe(s.nativeElement));

      // A user scroll gesture cancels a pending programmatic target. Passive listeners
      // added in code: they never need to replay (nothing is pending before hydration).
      const cancelTarget = () => (this.#target = null);
      const gestures = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
      gestures.forEach((t) => container.addEventListener(t, cancelTarget, { passive: true }));

      this.#destroyRef.onDestroy(() => {
        io.disconnect();
        reduce.removeEventListener('change', onReduce);
        gestures.forEach((t) => container.removeEventListener(t, cancelTarget));
      });
    });

    // Autoplay: a setTimeout scheduled from a render callback (browser only), outside
    // the zone, restarted on every slide change (Foundation's Timer.restart()).
    afterRenderEffect((onCleanup) => {
      this.selected();

      if (!this.rotating()) {
        return;
      }

      const schedule = () => setTimeout(() => this.next('auto'), this.timerDelay);
      // Render hooks already run outside the zone (core render3/after_render/manager.ts:86),
      // so the control case re-enters the zone explicitly.
      const id = this.#insideZone ? this.#zone.run(schedule) : this.#zone.runOutsideAngular(schedule);
      onCleanup(() => clearTimeout(id));
    });

    // Mechanic 8, continued: perform the deferred focus handoff once this render pass
    // has actually applied the new `inert`/`isSelected` state to the DOM (`write` runs
    // after Angular updates host bindings for this pass, so the target slide is no
    // longer `inert` by the time `.focus()` runs).
    afterRenderEffect({
      write: () => {
        const i = this.#pendingFocusHandoff();

        if (i !== null) {
          this.slideEls()[i].nativeElement.focus({ preventScroll: true });
          this.#pendingFocusHandoff.set(null);
        }
      },
    });
  }

  next(cause: Cause = 'user') {
    let i = this.selected() + 1;

    if (i >= this.slides.length) {
      if (!this.infiniteWrap) {
        return;
      }

      i = 0;
    }

    this.goTo(i, cause);
  }

  previous(cause: Cause = 'user') {
    let i = this.selected() - 1;

    if (i < 0) {
      if (!this.infiniteWrap) {
        return;
      }

      i = this.slides.length - 1;
    }

    this.goTo(i, cause);
  }

  goTo(i: number, cause: Cause) {
    if (i === this.selected()) {
      return;
    }

    this.selected.set(i);
    this.#target = i;
    this.#log(i, cause);
    const slide = this.slideEls()[i].nativeElement;

    if (cause === 'auto' || this.#containerNav) {
      // Autoplay must never move the page: scroll only the container.
      const c = this.container().nativeElement;
      c.scrollBy({ left: slide.getBoundingClientRect().left - c.getBoundingClientRect().left });
    } else {
      slide.scrollIntoView({ block: 'nearest', inline: 'start' });
    }
  }

  /** Aria TabList selection (bullet click, arrow keys, Home/End). */
  protected onTabChange(value: string | undefined) {
    if (value === undefined) {
      return;
    }

    const i = Number(value.slice(1));

    if (i !== this.selected()) {
      this.goTo(i, 'user');
    }
  }

  protected toggleRotation() {
    this.playing.update((p) => !p);
  }

  protected onFocusIn(event: FocusEvent) {
    // APG: rotation stops on keyboard focus entering the carousel, not on every focus
    // (a mouse click that focuses a button must not stop it in every engine). The
    // rotation control itself is exempt, or pressing "Start" would stop it again.
    const target = event.target as HTMLElement;

    if (target.hasAttribute('data-rotation')) {
      return;
    }

    if (target.matches(':focus-visible')) {
      this.playing.set(false);
    }
  }

  #onIntersect(entries: IntersectionObserverEntry[]) {
    for (const e of entries) {
      if (!e.isIntersecting || e.intersectionRatio < 0.5) {
        continue;
      }

      const i = this.slideEls().findIndex((s) => s.nativeElement === e.target);

      if (this.#target !== null) {
        if (i === this.#target) {
          this.#target = null;
        }

        continue;
      }

      if (i !== this.selected()) {
        // Focus handoff (mechanic 8): a native scroll (arrow keys, Page Down/Up, Home,
        // End, wheel, touch) from a focused slide must not drop focus to <body> when the
        // old slide becomes `inert`. Read live focus and move it before the selection
        // (and so the inert attribute) changes.
        const oldEl = this.slideEls()[this.selected()].nativeElement;
        const focusWasInOldSlide = oldEl.contains(document.activeElement);
        this.selected.set(i);
        this.#log(i, 'scroll');

        if (focusWasInOldSlide) {
          this.#pendingFocusHandoff.set(i);
        }
      }
    }
  }

  // Test hook: every change of the active index with its cause.
  #log(i: number, cause: string) {
    const w = globalThis as unknown as { __orbitLog?: unknown[] };
    (w.__orbitLog ??= []).push({ i, cause, t: Math.round(performance.now()) });
  }
}
