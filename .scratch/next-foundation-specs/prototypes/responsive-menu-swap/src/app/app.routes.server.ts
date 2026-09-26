import { RenderMode, ServerRoute } from '@angular/ssr';

// PROTOTYPE: /csr* client-rendered, /prerendered* and /deferred-prerendered prerendered at
// build time, everything else server-rendered per request.
export const serverRoutes: ServerRoute[] = [
  { path: 'csr', renderMode: RenderMode.Client },
  { path: 'csr/current', renderMode: RenderMode.Client },
  { path: 'prerendered', renderMode: RenderMode.Prerender },
  { path: 'prerendered/current', renderMode: RenderMode.Prerender },
  { path: 'deferred-prerendered', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
