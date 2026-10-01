// PROTOTYPE instrumentation (ticket 190): called from each page's constructor. Records when the
// routed page has rendered (hydrated, on a server-rendered load), in every build.
import { afterNextRender } from '@angular/core';

export function markHydrated(): void {
  afterNextRender(() => {
    const times = ((globalThis as any).__nfsTimes ??= {});
    times.hydrated ??= performance.now();
  });
}
