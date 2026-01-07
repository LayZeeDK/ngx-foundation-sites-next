import { Injectable } from '@angular/core';

/**
 * Angular service for generating stable accordion instance and item IDs.
 * Provided in the platform injector to avoid id clashes across multiple
 * Angular applications on the same page.
 */
@Injectable({ providedIn: 'platform' })
export class NfsAccordionIdGenerator {
  // instance-private counter so tests can construct a fresh instance
  // and obtain deterministic ids without needing a test-only reset API.
  #accordionCounter = 0;

  /** Returns a stable unique accordion instance id. */
  nextAccordionInstanceId(): string {
    this.#accordionCounter += 1;
    return `nfs-accordion-${this.#accordionCounter}`;
  }

  /** Generate a panel id within an accordion instance. */
  panelIdFor(instanceId: string, index: number, provided?: string): string {
    if (provided && provided.length > 0) return provided;
    return `${instanceId}-panel-${index}`;
  }

  /** Generate a title id within an accordion instance. */
  titleIdFor(instanceId: string, index: number, provided?: string): string {
    if (provided && provided.length > 0) return provided;
    return `${instanceId}-title-${index}`;
  }
}
