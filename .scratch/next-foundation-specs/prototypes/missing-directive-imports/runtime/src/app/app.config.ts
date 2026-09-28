import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideNfsRuntimeChecks } from '../nfs/import-check/index';
import { routes } from './app.routes';

/** Test switches read from the page URL in the browser (the scan never runs on the server). */
function query(name: string): string | null {
  return typeof location === 'undefined' ? null : new URLSearchParams(location.search).get(name);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withIncrementalHydration()),
    // ?start=provider: start the scan from the application configuration, not from the first
    // library directive; ?typos=1 adds the prefix check; ?checks=off opts the check out.
    ...(query('start') === 'provider'
      ? [provideNfsRuntimeChecks({ strictUnknownAttributes: query('typos') === '1' })]
      : []),
    ...(query('checks') === 'off'
      ? [provideNfsRuntimeChecks({ strictDirectiveImports: false })]
      : []),
  ],
};
