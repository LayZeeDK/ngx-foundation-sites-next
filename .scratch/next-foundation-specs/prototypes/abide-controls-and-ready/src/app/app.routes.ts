import { Routes } from '@angular/router';
import { DeferPage } from './pages/defer-page';
import { HomePage } from './pages/home-page';
import { PrerenderPage } from './pages/prerender-page';
import { ReadyPage } from './pages/ready-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'ready', component: ReadyPage },
  { path: 'prerender', component: PrerenderPage },
  { path: 'defer', component: DeferPage },
];
