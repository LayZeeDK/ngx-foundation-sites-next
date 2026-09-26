import { RenderMode, ServerRoute } from '@angular/ssr';

// Server-rendered per request (not prerendered) so the query-string variants reach the server.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
