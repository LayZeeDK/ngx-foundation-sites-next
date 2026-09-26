// PROTOTYPE (throwaway) -- Orbit on CSS scroll snap. One component stands in for the
// spec's directive family (nfsOrbit, nfsOrbitContainer, nfsOrbitSlide, nfsOrbitBullets,
// nfsOrbitBullet, nfsOrbitPrevious/Next, nfsOrbitRotation); Aria Tabs are used directly
// in the template. Options come from query params so one build covers every case.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dir } from '@angular/cdk/bidi';
import { Tab, TabList, TabPanel, Tabs } from '@angular/aria/tabs';

type Cause = 'user' | 'auto';

@Component({
  selector: 'app-orbit',
  imports: [Dir, Tabs, TabList, Tab, TabPanel],
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

  /** Active slide index; the `selected` model of the spec. */
  readonly selected = signal(0);
  readonly selectedValue = computed(() => `s${this.selected()}`);
  /** The user's rotation intent (APG rotation control). */
  readonly playing = signal(this.autoPlay);
  readonly hovered = signal(false);
  readonly rotating = computed(() => this.playing() && !this.hovered());

  protected readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  protected readonly slideEls = viewChildren<ElementRef<HTMLElement>>('slide');

  /** Index a programmatic scroll is heading to; IO ignores other slides until it lands. */
  #target: number | null = null;

  constructor() {
    afterNextRender(() => {
      const container = this.container().nativeElement;

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
    // APG: rotation stops when focus enters the carousel and restarts only on request.
    // The rotation control itself is exempt, or pressing "Start" would stop it again.
    if (!(event.target as HTMLElement).hasAttribute('data-rotation')) {
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
        this.selected.set(i);
        this.#log(i, 'scroll');
      }
    }
  }

  // Test hook: every change of the active index with its cause.
  #log(i: number, cause: string) {
    const w = globalThis as unknown as { __orbitLog?: unknown[] };
    (w.__orbitLog ??= []).push({ i, cause, t: Math.round(performance.now()) });
  }
}
