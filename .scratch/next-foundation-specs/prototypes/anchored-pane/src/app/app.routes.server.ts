import { RenderMode, ServerRoute } from '@angular/ssr';

// Server-rendered per request so the fixture's query parameters reach the server render.
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Server }];
