import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'csr', renderMode: RenderMode.Client },
  { path: 'ssr', renderMode: RenderMode.Server },
  { path: 'prerendered', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
