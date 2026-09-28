import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'ok', loadComponent: () => import('./cases/ok').then((m) => m.OkCase) },
  { path: 'member', loadComponent: () => import('./cases/member').then((m) => m.MemberCase) },
  { path: 'family', loadComponent: () => import('./cases/family').then((m) => m.FamilyCase) },
  { path: 'single', loadComponent: () => import('./cases/single').then((m) => m.SingleCase) },
  { path: 'none', loadComponent: () => import('./cases/none').then((m) => m.NoneCase) },
  { path: 'copied', loadComponent: () => import('./cases/copied').then((m) => m.CopiedCase) },
  { path: 'css-attr', loadComponent: () => import('./cases/css-attr').then((m) => m.CssAttrCase) },
  { path: 'defer', loadComponent: () => import('./cases/defer').then((m) => m.DeferCase) },
  { path: 'if', loadComponent: () => import('./cases/if').then((m) => m.IfCase) },
  { path: 'for', loadComponent: () => import('./cases/for').then((m) => m.ForCase) },
  { path: 'outlet', loadComponent: () => import('./cases/outlet').then((m) => m.OutletCase) },
  {
    path: 'projection',
    loadComponent: () => import('./cases/projection').then((m) => m.ProjectionCase),
  },
  { path: 'external', loadComponent: () => import('./cases/external').then((m) => m.ExternalCase) },
  { path: 'hydrate', loadComponent: () => import('./cases/hydrate').then((m) => m.HydrateCase) },
  { path: 'twins', loadComponent: () => import('./cases/twins').then((m) => m.TwinsCase) },
  { path: 'stress', loadComponent: () => import('./cases/stress').then((m) => m.StressCase) },
];

export const caseNames = routes.map((route) => route.path as string);
