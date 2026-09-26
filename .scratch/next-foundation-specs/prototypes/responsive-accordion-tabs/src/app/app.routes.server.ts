import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'prerendered', renderMode: RenderMode.Prerender },
  { path: 'client', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
