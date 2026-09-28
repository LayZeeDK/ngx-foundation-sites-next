import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { nfsImportCheckToken } from './scanner';
import { NfsRuntimeChecks, nfsRuntimeChecksToken } from './types';

/**
 * Development overrides (ADR 0040's shape). Also starts the scan from an environment
 * initializer, so an application whose templates instantiate no library directive at all is
 * still scanned. Returns no providers in a production build.
 */
export function provideNfsRuntimeChecks(checks: Partial<NfsRuntimeChecks>): EnvironmentProviders {
  if (typeof ngDevMode !== 'undefined' && !ngDevMode) {
    return makeEnvironmentProviders([]);
  }

  return makeEnvironmentProviders([
    { provide: nfsRuntimeChecksToken(), useValue: checks },
    provideEnvironmentInitializer(() => inject(nfsImportCheckToken()).start()),
  ]);
}
