import { Routes } from '@angular/router';
import { Orbit } from './orbit';
import { DeferredGallery } from './deferred-gallery';

export const routes: Routes = [
  { path: '', component: Orbit },
  // Case 2.5: the carousel inside `@defer (hydrate on viewport)`.
  { path: 'deferred', component: DeferredGallery },
];
