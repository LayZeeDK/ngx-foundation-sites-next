// PROTOTYPE (ticket 190 option S): lazy routes, as in ticket 192's probe, so a page's families land
// in the page's chunk graph instead of main.js. Only the scenario pages.
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', loadComponent: () => import('./landing-page.static').then((m) => m.LandingPage) },
  { path: 'menus', loadComponent: () => import('./menus-page.static').then((m) => m.MenusPage) },
  { path: 'defer', loadComponent: () => import('./defer-page.static').then((m) => m.DeferPage) },
];
