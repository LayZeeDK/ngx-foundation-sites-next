// PROTOTYPE -- throwaway `NfsReveal` on a consumer-written `<dialog class="reveal">` (ADR 0007).
// Only what the prototype question needs; the Reveal spec designs the real API.
import {
  DOCUMENT,
  Directive,
  ElementRef,
  Injector,
  NgZone,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { InteractivityChecker } from '@angular/cdk/a11y';

// ponytail: module-level registry of open reveals; the spec decides the real shape (Light dismiss registry or a token).
const openReveals = new Set<NfsReveal>();

@Directive({
  selector: 'dialog[nfsReveal]',
  exportAs: 'nfsReveal',
  host: {
    '[class.is-closing]': 'closing()',
    // Foundation's own `.reveal.without-overlay { position: fixed }` for `overlay: false`.
    '[class.without-overlay]': '!overlay()',
    '(cancel)': 'onCancel($event)',
    '(close)': 'onNativeClose()',
    '(pointerdown)': 'onPointerDown($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NfsReveal {
  readonly isOpen = model(false);
  /** Foundation `data-overlay`. `false` opens with `show()` (non-modal, no backdrop). */
  readonly overlay = input(true, { transform: booleanAttribute });
  /** Foundation `data-close-on-click`. */
  readonly closeOnClick = input(true, { transform: booleanAttribute });
  /** Foundation `data-close-on-esc`. */
  readonly closeOnEsc = input(true, { transform: booleanAttribute });
  /** Foundation `data-multiple-opened`. */
  readonly multipleOpened = input(false, { transform: booleanAttribute });
  /** Material vocabulary: 'first-tabbable' | CSS selector | 'native' (prototype only: leave the browser's choice). */
  readonly autoFocus = input('first-tabbable');
  readonly restoreFocus = input(true, { transform: booleanAttribute });
  /** Prototype switch: wrap Tab / Shift+Tab inside the dialog (the APG keyboard table); native dialogs do not. */
  readonly wrapFocus = input(false, { transform: booleanAttribute });
  /** Prototype switch: 'none' | 'foundation' (port of `html.is-reveal-open` + `top: -scrollY`). */
  readonly scrollLock = input('none');

  readonly opened = output<void>();
  readonly closed = output<void>();

  protected readonly closing = signal(false);

  readonly #el: HTMLDialogElement = inject(ElementRef).nativeElement;
  readonly #doc = inject(DOCUMENT);
  readonly #zone = inject(NgZone);
  readonly #injector = inject(Injector);
  readonly #checker = inject(InteractivityChecker);
  #invoker: Element | null = null;
  #origin: Element | null = null;
  #removeOutsideListener: (() => void) | null = null;

  constructor() {
    // Runs only in the browser, after hydration: covers open-by-default and every isOpen write.
    afterRenderEffect(() => {
      const want = this.isOpen();
      untracked(() => {
        if (want && !this.#el.open) {
          this.#show();
        } else if (!want && this.#el.open && !this.closing()) {
          this.#beginClose();
        }
      });
    });
  }

  /**
   * `origin` is the Trigger element. WebKit does not focus a button on mouse click, so
   * `document.activeElement` at open time is not the invoker there; a Trigger passes itself.
   */
  open(origin?: EventTarget | null): void {
    this.#origin = origin instanceof Element ? origin : null;
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  protected onCancel(event: Event): void {
    // Escape on a modal dialog. Always cancel the native close so the exit animation runs first.
    event.preventDefault();

    if (this.closeOnEsc()) {
      this.close();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    // A non-modal dialog (`show()`) gets no `cancel` on Escape.
    if (event.key === 'Escape' && !this.#el.matches(':modal') && this.closeOnEsc()) {
      this.close();
    }

    if (event.key === 'Tab' && this.wrapFocus()) {
      // The directive moves focus itself on every Tab: wrapping only at the ends is not enough,
      // because WebKit puts the dialog element itself in the sequential focus order.
      const all = this.#tabbables();

      if (!all.length) {
        return;
      }

      const i = all.indexOf(this.#doc.activeElement as HTMLElement);
      const step = event.shiftKey ? -1 : 1;
      const next = i === -1 ? (event.shiftKey ? all.length - 1 : 0) : (i + step + all.length) % all.length;
      all[next].focus();
      event.preventDefault();
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    // `::backdrop` hits report the dialog itself as the target; so do hits on the dialog's padding,
    // hence the geometry check against the border box.
    if (!this.closeOnClick() || event.target !== this.#el || !this.#el.matches(':modal')) {
      return;
    }

    const r = this.#el.getBoundingClientRect();
    const outside =
      event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;

    if (outside) {
      this.close();
    }
  }

  protected onNativeClose(): void {
    // Reached after our own `close()` call, and also when the browser closes the dialog without a
    // cancelable `cancel` (Chromium's close-watcher anti-abuse rule) -- keep state in sync then.
    if (this.closing() || !openReveals.has(this)) {
      return;
    }

    this.#finish(false);
  }

  #show(): void {
    this.#invoker = this.#origin ?? this.#doc.activeElement;
    this.#origin = null;

    if (!this.multipleOpened()) {
      for (const other of [...openReveals]) {
        other.close();
      }
    }

    if (this.scrollLock() === 'foundation' && this.overlay() && ![...openReveals].some((r) => r.overlay())) {
      lockScroll(this.#doc);
    }

    openReveals.add(this);

    // A static `autoFocus="..."` on the host is also the HTML `autofocus` attribute (case-insensitive),
    // which makes Firefox and WebKit focus the dialog itself. Strip it before the dialog focusing steps.
    this.#el.removeAttribute('autofocus');

    if (this.overlay()) {
      this.#el.showModal();
    } else {
      this.#el.show();
      this.#listenOutside();
    }

    this.#placeFocus();
    this.#afterAnimation(() => this.opened.emit());
  }

  #placeFocus(): void {
    const mode = this.autoFocus();

    if (mode === 'native') {
      return;
    }

    let target: HTMLElement | null = null;

    if (mode === 'first-tabbable') {
      target = this.#tabbables()[0] ?? null;
    } else {
      target = this.#el.querySelector<HTMLElement>(mode);
    }

    // No tabbable content: keep whatever the browser chose (never force focus onto the dialog).
    target?.focus();
  }

  #tabbables(): HTMLElement[] {
    const found: HTMLElement[] = [];
    const walker = this.#doc.createTreeWalker(this.#el, NodeFilter.SHOW_ELEMENT);

    while (walker.nextNode()) {
      const node = walker.currentNode as HTMLElement;

      if (this.#checker.isFocusable(node) && this.#checker.isTabbable(node)) {
        found.push(node);
      }
    }

    return found;
  }

  #beginClose(): void {
    this.closing.set(true);
    // The `.is-closing` host binding lands on the next render; wait for the exit keyframes after it.
    afterNextRender(() => this.#afterAnimation(() => this.#finish(true)), { injector: this.#injector });
  }

  #finish(callClose: boolean): void {
    if (callClose) {
      this.#el.close();
    }

    this.closing.set(false);
    this.isOpen.set(false);
    openReveals.delete(this);
    this.#removeOutsideListener?.();
    this.#removeOutsideListener = null;

    if (this.scrollLock() === 'foundation' && ![...openReveals].some((r) => r.overlay())) {
      unlockScroll(this.#doc);
    }

    if (this.restoreFocus() && this.#invoker instanceof HTMLElement && this.#invoker.isConnected) {
      this.#invoker.focus();
    }

    this.closed.emit();
  }

  /** animationend on the host (not a descendant, not ::backdrop), or duration + 100 ms, whichever comes first. */
  #afterAnimation(done: () => void): void {
    const style = getComputedStyle(this.#el);
    const ms = parseDuration(style.animationDuration) + parseDuration(style.animationDelay);

    const name = style.animationName.split(',')[0].trim();

    if (name === 'none' || ms === 0) {
      done();

      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;
      this.#el.removeEventListener('animationend', onEnd);
      clearTimeout(timer);
      done();
    };
    const onEnd = (e: AnimationEvent) => {
      // `::backdrop` animations dispatch on the dialog too. Chromium and Firefox set
      // `pseudoElement: '::backdrop'`; WebKit leaves it '' -- so the dialog's own keyframes are also
      // matched by name (the backdrop uses differently named keyframes in the library CSS).
      if (e.target === this.#el && !e.pseudoElement && e.animationName === name) {
        finish();
      }
    };
    let timer: ReturnType<typeof setTimeout>;
    this.#zone.runOutsideAngular(() => {
      this.#el.addEventListener('animationend', onEnd);
      timer = setTimeout(finish, ms + 100);
    });
  }

  #listenOutside(): void {
    // Foundation `overlay: false` + `closeOnClick`: a click anywhere outside the modal closes it.
    const handler = (e: PointerEvent) => {
      if (this.closeOnClick() && !this.#el.contains(e.target as Node)) {
        this.close();
      }
    };
    this.#doc.addEventListener('pointerdown', handler);
    this.#removeOutsideListener = () => this.#doc.removeEventListener('pointerdown', handler);
  }
}

function parseDuration(value: string): number {
  // First comma-separated entry is enough for the prototype (one animation per state).
  const first = value.split(',')[0].trim();

  return first.endsWith('ms') ? parseFloat(first) : parseFloat(first) * 1000;
}

// Port of Foundation's `_disableScroll`/`_addGlobalClasses` and `_enableScroll`/`_removeGlobalClasses`
// (js/foundation.reveal.js:190-208, 335-349, 430-460). Foundation's Sass rule does the locking.
function lockScroll(doc: Document): void {
  const html = doc.documentElement;
  const tall = html.scrollHeight > html.clientHeight;

  if (tall) {
    html.style.top = `${-html.scrollTop}px`;
  }

  html.classList.toggle('zf-has-scroll', tall);
  html.classList.add('is-reveal-open');
}

function unlockScroll(doc: Document): void {
  const html = doc.documentElement;
  const top = parseInt(html.style.top || '0', 10);
  html.classList.remove('is-reveal-open', 'zf-has-scroll');
  html.style.top = '';
  doc.defaultView?.scrollTo(0, -top);
}
