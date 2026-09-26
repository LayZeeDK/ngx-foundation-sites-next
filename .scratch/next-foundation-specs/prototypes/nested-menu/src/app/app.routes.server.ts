import { RenderMode, ServerRoute } from '@angular/ssr';

// PROTOTYPE: every route is server-rendered per request (no prerender), so one
// SSR server exercises SSR plus full hydration.
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Server }];
