import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

/** Baseline for the bundle measurement: the library with no import check at all. */
export interface NfsRuntimeChecks {
  strictDirectiveImports: boolean;
  strictUnknownAttributes: boolean;
}

export function nfsDevDirective(_directive: string): void {}

export function provideNfsRuntimeChecks(_checks: Partial<NfsRuntimeChecks>): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
