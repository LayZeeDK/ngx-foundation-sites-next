import { Routes } from '@angular/router';

// PROBE 192: lazy routes, so a page's families land in the page's chunk graph, not in main.js.
export const appRoutes: Routes = [
  { path: 'lifecycle', loadComponent: () => import('./lifecycle-page').then((m) => m.LifecyclePage) },
  { path: 'ssr', loadComponent: () => import('./ssr-page').then((m) => m.SsrPage) },
  { path: 'client-defer', loadComponent: () => import('./client-defer-page').then((m) => m.ClientDeferPage) },
  { path: 'enter', loadComponent: () => import('./enter-page').then((m) => m.EnterPage) },
  { path: 'hydrate-defer', loadComponent: () => import('./hydrate-defer-page').then((m) => m.HydrateDeferPage) },
  { path: 'churn', loadComponent: () => import('./churn-page').then((m) => m.ChurnPage) },
  { path: 'order', loadComponent: () => import('./order-page').then((m) => m.OrderPage) },
  {
    path: 'order-ssr-normal',
    loadComponent: () => import('./order-page').then((m) => m.OrderPage),
    data: { ssr: 'normal' },
  },
  {
    path: 'order-ssr-reversed',
    loadComponent: () => import('./order-page').then((m) => m.OrderPage),
    data: { ssr: 'reversed' },
  },
];
