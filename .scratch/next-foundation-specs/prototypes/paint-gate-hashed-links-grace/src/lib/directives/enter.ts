// PROTOTYPE 197, proposal D: an enter animation driven from an `(animate.enter)` host listener that
// waits for the host's family stylesheet, so the keyframes exist when the class is added.
import { AnimationCallbackEvent, Directive, ElementRef, inject, input } from '@angular/core';
import { NfsFamilyStyles } from '../link-styles';

@Directive({ selector: '[nfsEnter]', host: { '(animate.enter)': 'onEnter($event)' } })
export class NfsEnter {
  readonly nfsEnter = input.required<string>();
  readonly #styles = inject(NfsFamilyStyles);
  readonly #host = inject(ElementRef).nativeElement as HTMLElement;

  onEnter(event: AnimationCallbackEvent): void {
    const el = this.#host;
    const cls = this.nfsEnter();
    void this.#styles.whenStyled(el).then(() => {
      let finished = false;
      const done = () => {
        if (!finished) {
          finished = true;
          el.classList.remove(cls);
          event.animationComplete();
        }
      };
      el.addEventListener('animationend', done, { once: true });
      el.classList.add(cls);
      // No animation computed (keyframes missing): do not leave the class behind.
      requestAnimationFrame(() => {
        if (el.getAnimations().length === 0) {
          done();
        }
      });
    });
  }
}
