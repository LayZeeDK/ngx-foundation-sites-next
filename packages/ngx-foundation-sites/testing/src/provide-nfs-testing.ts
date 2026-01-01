import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NfsStyleLoader } from 'ngx-foundation-sites';
import { NfsTestingStyleLoader } from './nfs-testing-style-loader.service';

/**
 * Provides ngx-foundation-sites testing configuration.
 *
 * Use this in test environments (Storybook, unit tests) where component styles
 * are bundled directly and don't need to be loaded dynamically.
 *
 * @usageNotes
 *
 * In Storybook's preview.ts:
 *
 * ```typescript
 * import { applicationConfig } from '@storybook/angular';
 * import { provideNfsTesting } from 'ngx-foundation-sites/testing';
 *
 * const preview: Preview = {
 *   decorators: [
 *     applicationConfig({
 *       providers: [provideNfsTesting()]
 *     })
 *   ]
 * };
 * ```
 *
 * In unit tests with TestBed:
 *
 * ```typescript
 * import { provideNfsTesting } from 'ngx-foundation-sites/testing';
 *
 * beforeEach(() => {
 *   TestBed.configureTestingModule({
 *     providers: [provideNfsTesting()]
 *   });
 * });
 * ```
 *
 * @returns Environment providers for ngx-foundation-sites testing configuration
 */
export function provideNfsTesting(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NfsStyleLoader, useClass: NfsTestingStyleLoader },
  ]);
}
