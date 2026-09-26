import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // PROTOTYPE: plain provideClientHydration() -- in 22.2 it turns on incremental hydration and,
    // through it, event replay (the generator wrote withEventReplay(), which is redundant).
    provideClientHydration(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
  ],
};
