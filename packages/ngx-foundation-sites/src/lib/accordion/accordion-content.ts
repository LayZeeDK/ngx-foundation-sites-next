import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Structural directive to mark accordion item content.
 *
 * @example
 * ```html
 * <nfs-accordion-item panelId="panel-1">
 *   <span *nfsAccordionTitle>My Title</span>
 *   <div *nfsAccordionContent>My Content</div>
 * </nfs-accordion-item>
 * ```
 */
@Directive({
  selector: '[nfsAccordionContent]',
})
export class NfsAccordionContentDef {
  readonly templateRef = inject(TemplateRef);
}
