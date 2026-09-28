import { ElementRef, inject } from '@angular/core';
import { nfsImportCheckToken } from './scanner';
import { strategy } from './strategy';

/**
 * Called by every library directive, in development builds only, from its constructor:
 * `if (typeof ngDevMode === 'undefined' || ngDevMode) { nfsDevDirective('NfsButton'); }`.
 * Records the host for the registry approach and starts the scan once per application.
 */
export function nfsDevDirective(directive: string): void {
  const host: object = inject(ElementRef).nativeElement;
  strategy.onDirective?.(host, directive);
  inject(nfsImportCheckToken()).start();
}
