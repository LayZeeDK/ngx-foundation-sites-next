import { InjectionToken } from '@angular/core';
import type { NfsAccordion } from './accordion';

/**
 * DI token for parent `NfsAccordion` container.
 * Children should inject with `inject(nfsAccordionToken, { optional: true, skipSelf: true })`.
 */
export const nfsAccordionToken = new InjectionToken<NfsAccordion>(
  'nfsAccordionToken',
);
