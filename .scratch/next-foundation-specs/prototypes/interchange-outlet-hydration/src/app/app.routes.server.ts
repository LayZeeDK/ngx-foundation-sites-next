import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'csr', renderMode: RenderMode.Client },
  { path: 'ssr', renderMode: RenderMode.Server },
  { path: 'prerendered', renderMode: RenderMode.Prerender },
  { path: 'csr-fallback', renderMode: RenderMode.Client },
  { path: 'ssr-fallback', renderMode: RenderMode.Server },
  { path: 'prerendered-fallback', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
