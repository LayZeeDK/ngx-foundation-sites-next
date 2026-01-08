import {
  Directive,
  inject,
  input,
  model,
  signal,
  TemplateRef,
  ErrorHandler,
  InjectionToken,
} from '@angular/core';
import type { NfsAccordionHeaderDef } from './accordion-header-def';
import type { NfsAccordionContentDef } from './accordion-content';

/**
 * Injection token for time provider. Allows tests to control time.
 */
export const NFS_ACCORDION_TIME_PROVIDER = new InjectionToken<() => number>(
  'NFS_ACCORDION_TIME_PROVIDER',
  {
    providedIn: 'root',
    factory: () => Date.now,
  },
);

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

  /** Internal FIFO toggle queue to serialize toggles during transitions */
  readonly #toggleQueue: Array<() => void> = [];
  /** Whether a transition (toggle) is currently active */
  #inTransition = false;

  /** Debounce state for UI-sourced toggles (click/keyboard) */
  #lastUiToggleTs = 0;
  #uiDebounceMs = 50;

  /** Angular ErrorHandler for reporting prevented actions */
  readonly #errorHandler = inject(ErrorHandler);

  /** Time provider for testable timestamp access */
  readonly #timeProvider = inject(NFS_ACCORDION_TIME_PROVIDER);

  /**
   * Request a toggle for this item. UI-sourced toggles (source='ui') are
   * debounced/coalesced within a short window to avoid rapid identical toggles.
   * Programmatic toggles ('program') bypass debounce and enqueue immediately.
   */
  requestToggle(source: 'ui' | 'program' = 'ui'): void {
    try {
      const now = this.#timeProvider();

      if (source === 'ui') {
        if (now - this.#lastUiToggleTs < this.#uiDebounceMs) {
          // Coalesce duplicate UI toggles within debounce window
          // Don't update timestamp for coalesced toggles
          return;
        }
        // Update timestamp only for actual toggles
        this.#lastUiToggleTs = now;
      }

      const work = () => {
        try {
          const target = !this.expanded();
          this.#inTransition = true;
          queueMicrotask(() => {
            try {
              this.expanded.set(target);
            } finally {
              // Mark transition complete on next microtask and process next
              queueMicrotask(() => {
                this.#inTransition = false;
                this.#processNextToggle();
              });
            }
          });
        } catch (err) {
          this.#inTransition = false;
          this.#processNextToggle();
          queueMicrotask(() => {
            throw err;
          });
        }
      };

      this.#toggleQueue.push(work);
      // Kick off processing if idle
      if (!this.#inTransition && this.#toggleQueue.length === 1) {
        this.#processNextToggle();
      }
    } catch (err) {
      queueMicrotask(() => {
        throw err;
      });
    }
  }

  /**
   * Public API: toggle expansion state via queued request.
   * Uses tryAction semantics: reports prevented actions to ErrorHandler and
   * does not throw.
   */
  toggle(): void {
    this.#tryAction(() => {
      this.requestToggle('program');
    }, 'toggle prevented');
  }

  /** Expand the panel (idempotent). */
  down(): void {
    this.#tryAction(() => {
      if (!this.expanded()) this.requestToggle('program');
    }, 'down prevented');
  }

  /** Collapse the panel (idempotent). */
  up(): void {
    this.#tryAction(() => {
      if (this.expanded()) this.requestToggle('program');
    }, 'up prevented');
  }

  /**
   * Wrapper to run an action only when allowed. If prevented, report via
   * ErrorHandler.handleError() instead of throwing.
   */
  #tryAction(action: () => void, reason = 'action prevented'): void {
    try {
      // Respect disabled state at minimum; parent-level policies (allowAllClosed)
      // are enforced at higher layers and should also call ErrorHandler when
      // rejecting actions. Here we guard against disabled items.
      if (this.disabled()) {
        this.#errorHandler?.handleError(new Error(`${reason}: item disabled`));
        return;
      }

      action();
    } catch (err) {
      this.#errorHandler?.handleError(err as Error);
    }
  }

  /** Execute next queued toggle if any */
  #processNextToggle(): void {
    const next = this.#toggleQueue.shift();
    if (!next) return;
    try {
      next();
    } catch (err) {
      queueMicrotask(() => {
        throw err;
      });
      // Continue processing remaining queued items
      this.#inTransition = false;
      this.#processNextToggle();
    }
  }
}
