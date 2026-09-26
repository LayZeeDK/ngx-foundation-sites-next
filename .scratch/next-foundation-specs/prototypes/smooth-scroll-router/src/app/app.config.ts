import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

/**
 * Reads `?restoration=enabled|top|disabled` from the current URL. Angular's
 * withInMemoryScrolling takes one static options object, so this factory is what makes the
 * ticket's "configurable per query parameter" requirement work with one prerendered build: a
 * static file server ignores the query string when it resolves a file, so /page-a?restoration=top
 * still serves the same prerendered page, and this factory reads the real query string when the
 * client bundle evaluates in the browser.
 */
function scrollRestorationFromQuery(): 'enabled' | 'top' | 'disabled' {
  if (typeof location === 'undefined') {
    return 'enabled';
  }

  const value = new URLSearchParams(location.search).get('restoration');

  return value === 'top' || value === 'disabled' ? value : 'enabled';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: scrollRestorationFromQuery(),
        anchorScrolling: 'disabled',
      }),
    ),
    provideClientHydration(),
  ],
};
