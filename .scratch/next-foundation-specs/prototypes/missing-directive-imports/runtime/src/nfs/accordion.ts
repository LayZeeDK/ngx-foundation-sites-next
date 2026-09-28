import { Directive, InjectionToken, inject, signal } from '@angular/core';
import { nfsDevDirective } from './import-check/index';

/** Stand-in for `ngx-foundation-sites/accordion`: a family of four. Parents are injected
 * optionally so a forgotten parent never throws; the peer-check prototype covers that side. */
export const nfsAccordionToken = new InjectionToken<NfsAccordion>('nfsAccordionToken');
export const nfsAccordionItemToken = new InjectionToken<NfsAccordionItem>('nfsAccordionItemToken');

@Directive({
  selector: '[nfsAccordion]',
  host: { class: 'accordion' },
  providers: [{ provide: nfsAccordionToken, useExisting: NfsAccordion }],
})
export class NfsAccordion {
  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevDirective('NfsAccordion');
    }
  }
}

@Directive({
  selector: '[nfsAccordionItem]',
  host: { class: 'accordion-item', '[class.is-active]': 'expanded()' },
  providers: [{ provide: nfsAccordionItemToken, useExisting: NfsAccordionItem }],
})
export class NfsAccordionItem {
  readonly accordion = inject(nfsAccordionToken, { optional: true });
  readonly expanded = signal(false);

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevDirective('NfsAccordionItem');
    }
  }

  toggle(): void {
    this.expanded.update((value) => !value);
  }
}

@Directive({
  selector: 'button[nfsAccordionTitle]',
  host: {
    class: 'accordion-title',
    type: 'button',
    '[attr.aria-expanded]': 'item?.expanded() ?? null',
    '(click)': 'item?.toggle()',
  },
})
export class NfsAccordionTitle {
  protected readonly item = inject(nfsAccordionItemToken, { optional: true });

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevDirective('NfsAccordionTitle');
    }
  }
}

@Directive({
  selector: '[nfsAccordionContent]',
  host: { class: 'accordion-content', '[hidden]': '!(item?.expanded() ?? true)' },
})
export class NfsAccordionContent {
  protected readonly item = inject(nfsAccordionItemToken, { optional: true });

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevDirective('NfsAccordionContent');
    }
  }
}
