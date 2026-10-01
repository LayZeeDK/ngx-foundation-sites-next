import { RenderMode, ServerRoute } from '@angular/ssr';

// PROTOTYPE 198: /multi is client-rendered (two applications bootstrap on it).
export const serverRoutes: ServerRoute[] = [
  { path: 'multi', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
