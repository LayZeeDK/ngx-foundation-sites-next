import {
  Directive,
  inject,
  input,
  model,
  signal,
  TemplateRef,
} from '@angular/core';
import type { NfsAccordionHeaderDef } from './accordion-header-def';
import type { NfsAccordionContentDef } from './accordion-content';

/**
 * Template directive to define an accordion item.
 *
 * The item's content is divided into:
 * - **Header**: Marked with `nfsAccordionHeader` (required)
 * - **Eager content**: Direct DOM content inside the template (renders immediately)
 * - **Lazy content**: Marked with `nfsAccordionContent` (optional, rendered when expanded)
 *
 * @example
 * ```html
 * <nfs-accordion>
 *   <ng-template nfsAccordionItem panelId="panel-1" [(expanded)]="isOpen">
 *     <ng-template nfsAccordionHeader>Title</ng-template>
 *     <p>Eager content - renders immediately</p>
 *     <ng-template nfsAccordionContent>Lazy content - renders when expanded</ng-template>
 *   </ng-template>
 * </nfs-accordion>
 * ```
 */
@Directive({
  selector: 'ng-template[nfsAccordionItem]',
  exportAs: 'nfsAccordionItem',
})
export class NfsAccordionItemDef {
  /** Unique identifier for the panel, used for ARIA relationships */
  readonly panelId = input.required<string>();

  /** Expanded state (two-way bindable) */
  readonly expanded = model(false);

  /** Whether this item is disabled */
  readonly disabled = input(false);

  /** Reference to the template for rendering */
  readonly templateRef: TemplateRef<void> = inject(TemplateRef);

  /**
   * Populated by child NfsAccordionHeaderDef during template instantiation.
   * The header registers itself via constructor injection.
   */
  readonly headerDef = signal<NfsAccordionHeaderDef | null>(null);

  /**
   * Populated by child NfsAccordionContentDef during template instantiation.
   * The lazy content registers itself via constructor injection.
   */
  readonly lazyContentDef = signal<NfsAccordionContentDef | null>(null);

  /**
   * Expands this accordion panel.
   * @foundation API Parity: Equivalent to Foundation's `.down($target)` method.
   */
  down(): void {
    if (!this.disabled()) {
      this.expanded.set(true);
    }
  }

  /**
   * Collapses this accordion panel.
   * @foundation API Parity: Equivalent to Foundation's `.up($target)` method.
   */
  up(): void {
    if (!this.disabled()) {
      this.expanded.set(false);
    }
  }

  /**
   * Toggles this accordion panel's expansion state.
   * @foundation API Parity: Equivalent to Foundation's `.toggle($target)` method.
   */
  toggle(): void {
    if (!this.disabled()) {
      this.expanded.update((v) => !v);
    }
  }
}
