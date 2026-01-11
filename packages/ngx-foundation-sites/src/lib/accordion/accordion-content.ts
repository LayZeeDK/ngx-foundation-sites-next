import { Directive, inject, TemplateRef } from '@angular/core';
import { NfsAccordionItemDef } from './accordion-item-def';

/**
 * Template directive to mark lazy-loaded accordion item content.
 *
 * Content marked with this directive is only rendered when the panel is expanded,
 * providing performance benefits for complex content.
 *
 * For eager content that renders immediately, place DOM elements directly
 * inside the `nfsAccordionItem` template without this directive.
 *
 * The directive automatically registers itself with the parent `NfsAccordionItemDef`
 * via dependency injection.
 *
 * @example
 * ```html
 * <ng-template nfsAccordionItem panelId="panel-1">
 *   <ng-template nfsAccordionHeader>My Title</ng-template>
 *   <p>Eager content - renders immediately</p>
 *   <ng-template nfsAccordionContent>
 *     <heavy-component /> <!-- Only created when expanded -->
 *   </ng-template>
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[nfsAccordionContent]',
  exportAs: 'nfsAccordionContent',
})
export class NfsAccordionContentDef {
  readonly templateRef: TemplateRef<void> = inject(TemplateRef);

  constructor() {
    // Register with parent item for lazy content (injected via ngTemplateOutletInjector)
    const parentItem = inject(NfsAccordionItemDef, { optional: true });
    parentItem?.lazyContentDef.set(this);
  }
}
