import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'prerendered', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
