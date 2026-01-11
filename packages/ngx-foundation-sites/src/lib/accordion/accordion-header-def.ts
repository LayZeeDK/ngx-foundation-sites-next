import { Directive, inject, TemplateRef } from '@angular/core';
import { NfsAccordionItemDef } from './accordion-item-def';

/**
 * Template directive to mark the header content of an accordion item.
 *
 * The header is rendered inside the accordion trigger button.
 * It automatically registers itself with the parent `NfsAccordionItemDef`
 * via dependency injection.
 *
 * @example
 * ```html
 * <ng-template nfsAccordionItem panelId="panel-1">
 *   <ng-template nfsAccordionHeader>My Title</ng-template>
 *   <p>Content here</p>
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[nfsAccordionHeader]',
  exportAs: 'nfsAccordionHeader',
})
export class NfsAccordionHeaderDef {
  readonly templateRef: TemplateRef<void> = inject(TemplateRef);

  constructor() {
    // Register with parent item (injected via ngTemplateOutletInjector)
    const parentItem = inject(NfsAccordionItemDef, { optional: true });
    parentItem?.headerDef.set(this);
  }
}
