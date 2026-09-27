// THROWAWAY probe for [Decide: the server state of an open-by-default non-modal Reveal's Trigger].
// Only the parts of NfsReveal the question needs: the `open` attribute on the server, what hydration
// does with it, the first render callback, a later close and reopen, and pre-hydration interaction.
import {
  Directive,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  untracked,
} from '@angular/core';

function log(message: string): void {
  (globalThis as { __log?: string[] }).__log?.push(message);
}

@Directive({
  selector: 'dialog[probeReveal]',
  exportAs: 'probeReveal',
  host: {
    class: 'reveal',
    '[class.without-overlay]': '!overlay()',
    // Candidate: `open` bound once, from the first render's state, only for a non-modal Reveal.
    '[attr.open]': 'openAtFirstRender()',
    '(close)': 'onNativeClose()',
  },
})
export class ProbeReveal {
  readonly isOpen = model(false);
  readonly overlay = input(true, { transform: booleanAttribute });
  /** 'candidate' binds `open` from the first render; 'spec' binds nothing (the Reveal spec before the decision). */
  readonly variant = input<string>('candidate');
  /** Candidate refinement: adopt a native close that happened before hydration. */
  readonly adopt = input(true, { transform: booleanAttribute });

  // No tracked dependency: computed once, when the first host-binding pass reads it (inputs are set
  // by then), and never again, so no later change detection writes `open`.
  protected readonly openAtFirstRender = computed(() =>
    untracked(() => this.variant() === 'candidate' && this.isOpen() && !this.overlay()) ? '' : null,
  );

  readonly #el: HTMLDialogElement = inject(ElementRef).nativeElement;
  #first = true;
  #closingByUs = false;

  constructor() {
    afterRenderEffect(() => {
      const want = this.isOpen();
      untracked(() => this.#sync(want));
    });
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  #sync(want: boolean): void {
    const first = this.#first;
    this.#first = false;
    const id = this.#el.id;

    if (want) {
      if (first && this.#el.open && !this.overlay()) {
        // Open at first paint: nothing to show and no `opened`. Focus is placed only when nothing
        // else has it (body, or the dialog itself after HTML autofocus at page load).
        const active = document.activeElement;
        const before = active?.id || active?.tagName;

        if (active === document.body || active === this.#el || active === null) {
          this.#el.removeAttribute('autofocus');
          this.#el.querySelector<HTMLElement>('button')?.focus();
        }

        log(`${id}:first-paint-open active-before=${before} active-after=${document.activeElement?.id || document.activeElement?.tagName}`);

        return;
      }

      if (first && this.openAtFirstRender() === '' && !this.#el.open && this.adopt()) {
        // Rendered open, closed natively before hydration (a `<form method="dialog">` button).
        log(`${id}:adopt-native-close returnValue=${this.#el.returnValue}`);
        this.isOpen.set(false);

        return;
      }

      if (!this.#el.open) {
        if (this.overlay()) {
          this.#el.showModal();
        } else {
          this.#el.show();
        }

        this.#el.querySelector<HTMLElement>('button')?.focus();
        log(`${id}:shown first=${first} active=${document.activeElement?.id}`);
      }
    } else if (this.#el.open) {
      this.#closingByUs = true;
      this.#el.close();
      log(`${id}:closed-by-directive`);
    }
  }

  protected onNativeClose(): void {
    if (this.#closingByUs) {
      this.#closingByUs = false;

      return;
    }

    log(`${this.#el.id}:native-close returnValue=${this.#el.returnValue}`);

    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  }
}

@Directive({
  selector: 'button[probeToggle]',
  host: {
    '(click)': 'onClick()',
    '[attr.aria-expanded]': 'target().isOpen()',
  },
})
export class ProbeToggle {
  readonly target = input.required<ProbeReveal>({ alias: 'probeToggle' });

  protected onClick(): void {
    log(`toggle-click isOpen-before=${this.target().isOpen()}`);
    this.target().toggle();
  }
}
