import { ApplicationConfig, REQUEST, inject, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { NfsBreakpointName, nfsBreakpointsToken, nfsDefaultBreakpointMap } from './media-query/nfs-breakpoints-token';

// PROTOTYPE (throwaway). Stand-in for the client-hint recipe in
// specs/breakpoint-service.md: a `?bp=large` query parameter instead of a
// `Sec-CH-Viewport-Width` header, because Playwright's request object is
// easier to drive with a query string than with a client-hint header round
// trip. `REQUEST` is null while prerendering (RenderMode.Prerender), so that
// route always falls back to the default Server breakpoint (`small`).
function serverBreakpointFromQueryParam(): NfsBreakpointName | undefined {
  const request = inject(REQUEST);

  if (!request) {
    return undefined;
  }

  const bp = new URL(request.url).searchParams.get('bp');

  return bp && bp in nfsDefaultBreakpointMap ? (bp as NfsBreakpointName) : undefined;
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: nfsBreakpointsToken,
      // useFactory runs per request; useValue would be shared by every request.
      useFactory: () => ({
        map: nfsDefaultBreakpointMap,
        serverBreakpoint: serverBreakpointFromQueryParam() ?? 'small',
      }),
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
