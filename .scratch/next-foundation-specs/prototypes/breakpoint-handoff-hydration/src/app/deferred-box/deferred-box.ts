import { Component, inject } from '@angular/core';
import { NfsMediaQuery } from '../media-query/nfs-media-query';

// PROTOTYPE (throwaway). Its own component (not inlined into breakpoint-page)
// so the `@defer` block below has a real lazy chunk to hydrate, per the
// rendering-mode-test-seam prototype's finding: "A component used both inside
// and outside a @defer block in one file is eager."
@Component({
  selector: 'app-deferred-box',
  template: `
    <p data-testid="defer-current">{{ mq.current() }}</p>
    @if (mq.atLeast('large')) {
      <div data-testid="defer-branch-large">Deferred: large layout (large and up)</div>
    } @else {
      <div data-testid="defer-branch-small">Deferred: small layout</div>
    }
  `,
})
export class DeferredBox {
  protected readonly mq = inject(NfsMediaQuery);
}
