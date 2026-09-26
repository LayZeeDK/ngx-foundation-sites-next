import { RenderMode, ServerRoute } from '@angular/ssr';

// PROTOTYPE: server-rendered per request so query-param options reach the server render.
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Server }];
