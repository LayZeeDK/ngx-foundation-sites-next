import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'csr/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
