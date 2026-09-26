import { Routes } from '@angular/router';
import { DeferredPage, IndexPage, LatePage, MenuPage } from './pages';

const current = { current: true };

export const routes: Routes = [
  { path: '', component: IndexPage },
  { path: 'csr', component: MenuPage },
  { path: 'csr/current', component: MenuPage, data: current },
  { path: 'ssr', component: MenuPage },
  { path: 'ssr/current', component: MenuPage, data: current },
  { path: 'prerendered', component: MenuPage },
  { path: 'prerendered/current', component: MenuPage, data: current },
  { path: 'deferred', component: DeferredPage },
  { path: 'deferred/current', component: DeferredPage, data: current },
  { path: 'deferred-prerendered', component: DeferredPage },
  { path: 'late', component: LatePage },
  { path: 'late/current', component: LatePage, data: current },
];
