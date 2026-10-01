import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';

// No library provider: the consumer adds no TypeScript for family styles.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // 22.2: incremental hydration and event replay are on by default.
    provideClientHydration(),
    provideRouter(appRoutes, withComponentInputBinding()),
  ],
};
