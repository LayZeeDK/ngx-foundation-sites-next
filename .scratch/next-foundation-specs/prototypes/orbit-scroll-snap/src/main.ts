import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// PROTOTYPE test hook: when the application first becomes stable (hydration done).
bootstrapApplication(App, appConfig)
  .then((ref) => ref.whenStable())
  .then(() => ((globalThis as unknown as { __stableAt?: number }).__stableAt = Math.round(performance.now())))
  .catch((err) => console.error(err));
