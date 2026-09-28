import { Directive, InjectionToken, forwardRef, inject, input } from '@angular/core';

/** Stand-in for the library's Accordion family of four directives. */
export const nfsAccordionToken = new InjectionToken<NfsAccordion>('nfsAccordionToken');
export const nfsAccordionItemToken = new InjectionToken<NfsAccordionItem>('nfsAccordionItemToken');

@Directive({
  selector: '[nfsAccordion]',
  host: { class: 'accordion' },
  providers: [{ provide: nfsAccordionToken, useExisting: forwardRef(() => NfsAccordion) }],
})
export class NfsAccordion {
  readonly multiExpand = input(false);
}

@Directive({
  selector: '[nfsAccordionItem]',
  host: { class: 'accordion-item', '[class.is-active]': 'expanded()' },
  providers: [{ provide: nfsAccordionItemToken, useExisting: forwardRef(() => NfsAccordionItem) }],
})
export class NfsAccordionItem {
  readonly accordion = inject(nfsAccordionToken, { optional: true, skipSelf: true });
  readonly expanded = input(false);
}

@Directive({
  selector: 'button[nfsAccordionTitle]',
  host: { class: 'accordion-title' },
})
export class NfsAccordionTitle {
  readonly item = inject(nfsAccordionItemToken);
}

@Directive({
  selector: '[nfsAccordionContent]',
  host: { class: 'accordion-content' },
  exportAs: 'nfsAccordionContent',
})
export class NfsAccordionContent {}

/** The provisional import array of P24. */
export const NFS_ACCORDION = [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent] as const;
