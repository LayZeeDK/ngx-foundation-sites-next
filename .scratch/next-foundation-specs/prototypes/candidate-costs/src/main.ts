import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { bootstrapMulti } from './multi';

// PROTOTYPE 198: `/multi` bootstraps two applications instead of the routed one.
if (location.pathname.startsWith('/multi')) {
  bootstrapMulti().catch((err) => console.error(err));
} else {
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
}
