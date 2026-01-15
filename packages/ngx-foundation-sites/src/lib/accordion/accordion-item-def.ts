import {
  Directive,
  inject,
  input,
  model,
  signal,
  TemplateRef,
  computed,
  effect,
  Injector,
} from '@angular/core';
import type { NfsAccordionHeaderDef } from './accordion-header-def';
import type { NfsAccordionContentDef } from './accordion-content';
import { nfsAccordionToken } from './accordion.token';

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
  readonly #accordion = inject(nfsAccordionToken, {
    optional: true,
    skipSelf: true,
  });

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
   * Track whether this item has any projected content.
   * Used for empty-state handling per FR-114a.
   */
  readonly hasContent = signal(true);

  /** Track previous panelId for detecting changes (T178) */
  #previousPanelId: string | null = null;

  constructor() {
    // T178: Track panelId changes and notify parent accordion for validation
    effect(() => {
      const currentPanelId = this.panelId();

      // Validate panelId if it changes (not on initial setup)
      if (this.#previousPanelId !== null && this.#previousPanelId !== currentPanelId) {
        // Notify accordion of the change (used by T057c validation)
        const items = this.#accordion?.itemDefs?.() ?? [];
        const itemIndex = items.indexOf(this);
        if (itemIndex >= 0 && this.#accordion) {
          this.#accordion.validatePanelId(currentPanelId, itemIndex);
        }
      }

      // Update tracking state
      this.#previousPanelId = currentPanelId;
    });
  }

  /**
   * Generated title button ID for ARIA relationships.
   * Format: ${instanceId}-title-${itemIndex}
   * Computed based on accordion instance and item position.
   */
  readonly titleId = computed(() => {
    // Get accordion instance ID if available
    const accordionInstanceId = this.#accordion?.getInstanceId?.() ?? 'unknown';
    // Compute a deterministic suffix from panelId to ensure stability
    const panelIdSuffix = this.panelId().replace(/[^a-z0-9-]/gi, '');
    return `${accordionInstanceId}-title-${panelIdSuffix}`;
  });

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
