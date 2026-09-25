import { Routes } from '@angular/router';
import { FullPage } from './pages/full/full';
import { DeferPage } from './pages/defer/defer';
import { PrerenderedPage } from './pages/prerendered/prerendered';

export const routes: Routes = [
  { path: 'full', component: FullPage },
  { path: 'defer', component: DeferPage },
  { path: 'prerendered', component: PrerenderedPage },
  { path: '', redirectTo: 'full', pathMatch: 'full' },
];
