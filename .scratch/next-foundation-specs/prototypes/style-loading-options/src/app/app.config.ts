import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNfsFamilyStyles } from '../lib/family-styles';
import { carriers } from '../nfs-families/carriers';
import { prefetch } from '../nfs-families/prefetch';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // 22.2: incremental hydration and event replay are on by default.
    provideClientHydration(),
    provideRouter(appRoutes, withComponentInputBinding()),
    // CONSUMER LINE: the one provider call.
    provideNfsFamilyStyles(carriers, { prefetch }),
  ],
};
