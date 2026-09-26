// PROTOTYPE (throwaway) -- Reveal `'auto'` offsets in CSS (issues/69). One server-rendered page with:
//   - `#css` (and `#css2` when nested): `dialog.reveal` placed only by the `nfs-reveal` mixin
//     (rules 4 and 7), numeric offsets bound as the spec's three custom properties;
//   - `#ref` (and `#ref2`): Foundation 6.9's own markup (`.reveal-overlay > .reveal`, or
//     `.reveal.without-overlay` in `body` flow) shown and placed by a line-by-line port of
//     `Reveal._updatePosition` (js/foundation.reveal.js:108-140) and of the open() sequence around it.
// The Playwright suite drives `window.__nfs` and compares bounding rectangles.
import {
  Component,
  Directive,
  DOCUMENT,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

type Offset = number | 'auto';

function offsetAttr(value: unknown): Offset {
  if (value === undefined || value === null || value === '' || value === 'auto') {
    return 'auto';
  }

  return Number(value);
}

// The spec's channel (specs/reveal.md, rendered HTML "offsets"): a numeric vOffset writes
// `--nfs-reveal-top` and a zero `--nfs-reveal-shift`; a numeric hOffset writes `--nfs-reveal-left`.
@Directive({
  selector: 'dialog[nfsRevealOffsets]',
  host: {
    '[style.--nfs-reveal-top]': 'top()',
    '[style.--nfs-reveal-shift]': 'shift()',
    '[style.--nfs-reveal-left]': 'left()',
  },
})
export class NfsRevealOffsets {
  readonly vOffset = input<Offset, unknown>('auto', { transform: offsetAttr });
  readonly hOffset = input<Offset, unknown>('auto', { transform: offsetAttr });
  protected readonly top = computed(() => (this.vOffset() === 'auto' ? null : `${this.vOffset()}px`));
  protected readonly shift = computed(() => (this.vOffset() === 'auto' ? null : '0px'));
  protected readonly left = computed(() => (this.hOffset() === 'auto' ? null : `${this.hOffset()}px`));
}

const or =
  (fallback: string) =>
  (value: string | undefined): string =>
    value ?? fallback;

type Mode = 'css' | 'port-offset' | 'port-natural';

interface OpenOptions {
  mode?: Mode;
  dir?: 'ltr' | 'rtl';
  scrollY?: number;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

function box(el: Element | null): Box | null {
  if (!el) {
    return null;
  }

  const r = el.getBoundingClientRect();

  return { x: r2(r.x), y: r2(r.y), w: r2(r.width), h: r2(r.height) };
}

// Foundation's formula, shared by the reference port and the two fallback ports. `parseInt` is kept
// because Foundation truncates every value it writes.
function foundationTop(height: number, outerHeight: number, vOffset: Offset): number | null {
  if (vOffset === 'auto') {
    if (height > outerHeight) {
      return parseInt(String(Math.min(100, outerHeight / 10)), 10);
    }

    return parseInt(String((outerHeight - height) / 4), 10);
  }

  return parseInt(String(vOffset), 10);
}

@Component({
  selector: 'app-offsets',
  imports: [NfsRevealOffsets, NgTemplateOutlet],
  template: `
    <ng-template #body let-id="id" let-block="block">
      <h1 [id]="id + '-title'">Awesome. I Have It.</h1>
      <p class="lead">Your couch. It is mine.</p>
      <p>I'm a cool paragraph that lives inside of an even cooler modal. Wins!</p>
      @if (block) {
        <div class="fx-block" [style.height.px]="block"></div>
      }
      <button class="close-button" type="button" aria-label="Close modal">
        <span aria-hidden="true">&times;</span>
      </button>
    </ng-template>

    <p>Reveal auto offsets prototype. Page content behind the modal.</p>
    @if (long() === '1') {
      <div class="filler"></div>
    }

    <dialog #css nfsRevealOffsets id="css" [class]="'reveal ' + size()" aria-labelledby="css-title"
            [vOffset]="v()" [hOffset]="h()">
      <ng-container *ngTemplateOutlet="body; context: { id: 'css', block: +content() }" />
    </dialog>
    @if (nested() === '1') {
      <dialog #css2 nfsRevealOffsets id="css2" class="reveal tiny" aria-labelledby="css2-title"
              [vOffset]="v()" [hOffset]="h()">
        <ng-container *ngTemplateOutlet="body; context: { id: 'css2', block: +content2() }" />
      </dialog>
    }

    <!-- Foundation 6.9 reference: the DOM its Reveal plugin builds -->
    @if (refOverlay()) {
      <div class="reveal-overlay" id="ref-overlay">
        <div id="ref" [class]="'reveal ' + size()">
          <ng-container *ngTemplateOutlet="body; context: { id: 'ref', block: +content() }" />
        </div>
      </div>
    } @else {
      <div id="ref" [class]="'reveal without-overlay ' + size()">
        <ng-container *ngTemplateOutlet="body; context: { id: 'ref', block: +content() }" />
      </div>
    }
    @if (nested() === '1') {
      <div class="reveal-overlay" id="ref2-overlay">
        <div id="ref2" class="reveal tiny">
          <ng-container *ngTemplateOutlet="body; context: { id: 'ref2', block: +content2() }" />
        </div>
      </div>
    }
  `,
})
export class Offsets {
  // Query parameters (withComponentInputBinding), so the server renders the configured markup.
  // The router binds `undefined` for an absent parameter, hence the `or` transforms.
  readonly size = input('', { transform: or('') });
  readonly content = input('0', { transform: or('0') });
  readonly content2 = input('0', { transform: or('0') });
  readonly v = input('auto', { transform: or('auto') });
  readonly h = input('auto', { transform: or('auto') });
  readonly overlay = input('1', { transform: or('1') });
  readonly nested = input('0', { transform: or('0') });
  readonly long = input('0', { transform: or('0') });

  // Foundation: `.full` forces `fullScreen`, which forces `overlay: false` (foundation.reveal.js:60-63).
  protected readonly refOverlay = computed(() => this.overlay() === '1' && this.size() !== 'full');

  protected readonly cssEl = viewChild.required<ElementRef<HTMLDialogElement>>('css');

  constructor() {
    const doc = inject(DOCUMENT);
    afterNextRender(() => {
      const win = doc.defaultView as Window & { __nfs?: unknown };
      win.__nfs = this.#harness(doc);
      doc.body.setAttribute('data-hydrated', '');
    });
  }

  #offsets(): { vOffset: Offset; hOffset: Offset } {
    return { vOffset: offsetAttr(this.v()), hOffset: offsetAttr(this.h()) };
  }

  #harness(doc: Document) {
    const html = doc.documentElement;
    const $ = (id: string) => doc.getElementById(id) as HTMLElement | null;
    const winW = () => html.clientWidth; // jQuery $(window).width()
    const winH = () => html.clientHeight; // jQuery $(window).height()
    const docTaller = () => html.scrollHeight > html.clientHeight; // $(document).height() > $(window).height()

    // Port of Reveal._updatePosition, line by line. jQuery's outerWidth/outerHeight are the
    // border-box size of an untransformed element, which is the bounding rectangle here.
    const updatePosition = (el: HTMLElement, hasOverlay: boolean) => {
      const { vOffset, hOffset } = this.#offsets();
      const width = el.getBoundingClientRect().width;
      const outerWidth = winW();
      const height = el.getBoundingClientRect().height;
      const outerHeight = winH();
      let left: number;

      if (hOffset === 'auto') {
        left = parseInt(String((outerWidth - width) / 2), 10);
      } else {
        left = parseInt(String(hOffset), 10);
      }

      const top = foundationTop(height, outerHeight, vOffset);

      if (top !== null) {
        el.style.top = `${top}px`;
      }

      if (!hasOverlay || hOffset !== 'auto') {
        el.style.left = `${left}px`;
        el.style.margin = '0px';
      }
    };

    let locked = false;

    // Port of Reveal.open(): show hidden, scrollTop(0), measure, then _disableScroll for the first
    // visible Reveal, show, _addGlobalClasses.
    const foundationOpen = (el: HTMLElement) => {
      const overlay = el.parentElement?.classList.contains('reveal-overlay') ? el.parentElement : null;
      el.style.visibility = 'hidden';
      el.style.display = 'block';
      el.scrollTop = 0;

      if (overlay) {
        overlay.style.visibility = 'hidden';
        overlay.style.display = 'block';
      }

      updatePosition(el, !!overlay);
      el.style.visibility = '';

      if (overlay) {
        overlay.style.visibility = '';
      }

      if (!locked) {
        const scrollTop = doc.defaultView!.scrollY;

        if (docTaller()) {
          html.style.top = `${-scrollTop}px`;
        }

        html.classList.toggle('zf-has-scroll', docTaller());
        html.classList.add('is-reveal-open');
        locked = true;
      }
    };

    // The two fallbacks. 'port-offset' is the spec's named fallback as written: read offsetHeight,
    // write inline top, drop rule 7's translate. 'port-natural' reads the content's natural height
    // (scrollHeight plus borders, independent of rule 4's cap) and writes the spec's own custom
    // properties, so rule 4 mirrors the written top.
    const port = (el: HTMLDialogElement, mode: Mode) => {
      const { vOffset } = this.#offsets();

      if (mode === 'css' || vOffset !== 'auto') {
        return;
      }

      if (mode === 'port-offset') {
        el.style.top = `${foundationTop(el.offsetHeight, winH(), 'auto')}px`;
        el.style.translate = 'none';

        return;
      }

      const cs = getComputedStyle(el);
      const natural = el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
      el.style.setProperty('--nfs-reveal-top', `${foundationTop(natural, winH(), 'auto')}px`);
      el.style.setProperty('--nfs-reveal-shift', '0px');
    };

    const detail = (el: HTMLElement | null) => {
      if (!el) {
        return null;
      }

      const cs = getComputedStyle(el);

      return {
        box: box(el),
        top: cs.top,
        translate: cs.translate,
        transform: cs.transform,
        marginLeft: cs.marginLeft,
        maxHeight: cs.maxHeight,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      };
    };

    const measure = () => ({
      viewport: { vw: winW(), vh: winH(), innerWidth: doc.defaultView!.innerWidth },
      scrollY: doc.defaultView!.scrollY,
      htmlClass: html.className,
      htmlTop: html.style.top,
      dir: html.dir || 'ltr',
      css: detail($('css')),
      css2: detail($('css2')),
      ref: detail($('ref')),
      ref2: detail($('ref2')),
      cssModal: $('css')?.matches(':modal') ?? false,
    });

    const cssDialogs = () => [$('css'), $('css2')].filter((d): d is HTMLDialogElement => !!d);

    return {
      open: (opts: OpenOptions = {}) => {
        if (opts.dir) {
          html.dir = opts.dir;
        }

        if (opts.scrollY) {
          doc.defaultView!.scrollTo(0, opts.scrollY);
        }

        // Foundation opens the outer, then the nested modal (multipleOpened).
        for (const id of ['ref', 'ref2']) {
          const el = $(id);

          if (el) {
            foundationOpen(el);
          }
        }

        const [outer, inner] = cssDialogs();

        if (this.overlay() === '1') {
          outer.showModal();
        } else {
          outer.show();
        }

        port(outer, opts.mode ?? 'css');

        if (inner) {
          inner.showModal();
          port(inner, opts.mode ?? 'css');
        }

        return measure();
      },
      measure,
      // Re-run of Foundation's `resizeme` handler on every open reference.
      refResize: () => {
        for (const id of ['ref', 'ref2']) {
          const el = $(id);

          if (el) {
            updatePosition(el, !!el.parentElement?.classList.contains('reveal-overlay'));
          }
        }

        return measure();
      },
      addContent: (px: number) => {
        const block = doc.createElement('div');
        block.className = 'fx-block';
        block.style.height = `${px}px`;
        $('css')!.insertBefore(block, $('css')!.querySelector('.close-button'));

        return measure();
      },
      // Case 4: the same dialog with an integer inline top and no translate, or back to rule 7.
      setIntegerTop: (px: number | null) => {
        const el = $('css')!;

        if (px === null) {
          el.style.removeProperty('top');
          el.style.removeProperty('translate');
        } else {
          el.style.top = `${px}px`;
          el.style.translate = 'none';
        }

        return box(el);
      },
      // Case 5: bind a transform keyframe class before showModal (as the spec's phase binding does),
      // let it run to animationend, then remove it; and a paused probe of the first frame.
      motion: async (cls: string) => {
        const el = $('css') as HTMLDialogElement;
        const result: Record<string, unknown> = { cls };
        el.classList.add(cls);
        const ended = new Promise<string>((resolve) => {
          el.addEventListener('animationend', (e) => resolve((e as AnimationEvent).animationName), { once: true });
          setTimeout(() => resolve('timeout'), 3000);
        });
        el.showModal();
        const anim = el.getAnimations()[0];
        anim.pause();
        anim.currentTime = 0;
        result['start'] = { box: box(el), translate: getComputedStyle(el).translate, transform: getComputedStyle(el).transform };
        anim.currentTime = 250;
        result['mid'] = { box: box(el), translate: getComputedStyle(el).translate };
        anim.play();
        result['ended'] = await ended;
        result['atEnd'] = { box: box(el), translate: getComputedStyle(el).translate, transform: getComputedStyle(el).transform };
        el.classList.remove(cls);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        result['rest'] = { box: box(el), translate: getComputedStyle(el).translate, transform: getComputedStyle(el).transform };
        el.close();
        el.showModal();
        result['plain'] = { box: box(el) };

        return result;
      },
    };
  }
}
