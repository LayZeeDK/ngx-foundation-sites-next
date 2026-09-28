import { Directive, ElementRef, inject } from '@angular/core';
import { nfsDevDirective } from './import-check/index';

/** Stand-in for `ngx-foundation-sites/smooth-scroll`: a behaviour directive that binds no class,
 * so the class probe cannot see it. */
@Directive({
  selector: 'a[nfsSmoothScroll]',
  host: { '(click)': 'onClick($event)' },
})
export class NfsSmoothScroll {
  readonly #el: HTMLAnchorElement = inject(ElementRef).nativeElement;

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevDirective('NfsSmoothScroll');
    }
  }

  protected onClick(event: MouseEvent): void {
    const id = this.#el.hash.slice(1);
    const target = id ? this.#el.ownerDocument.getElementById(id) : null;

    if (target !== null) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
