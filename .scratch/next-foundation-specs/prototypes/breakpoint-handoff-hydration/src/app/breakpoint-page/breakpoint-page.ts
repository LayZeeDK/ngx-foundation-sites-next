import { Component, DOCUMENT, afterNextRender, inject } from '@angular/core';
import { DeferredBox } from '../deferred-box/deferred-box';
import { NfsMediaQuery } from '../media-query/nfs-media-query';
import { nfsProbeInit, nfsProbeRecord } from '../render-probe';

// PROTOTYPE (throwaway). One page reused at /csr, /ssr, and /prerendered
// (app.routes.server.ts gives each path a different RenderMode). The main
// @if is the "never paints the Server breakpoint" and "hydration rebuilds
// the branch" case; the @defer (hydrate on viewport) block further down,
// with the same @if, is the third case.
@Component({
  selector: 'app-breakpoint-page',
  imports: [DeferredBox],
  template: `
    <h1>Breakpoint handoff prototype</h1>
    <p data-testid="current">{{ mq.current() }}</p>
    @if (mq.atLeast('large')) {
      <div data-testid="branch-large">Large layout (large and up)</div>
    } @else {
      <div data-testid="branch-small">Small layout (below large)</div>
    }

    <div style="height: 1600px" data-testid="spacer"></div>

    @defer (hydrate on viewport) {
      <app-deferred-box />
    } @placeholder {
      <div data-testid="defer-placeholder">Loading below the fold&hellip;</div>
    }
  `,
})
export class BreakpointPage {
  protected readonly mq = inject(NfsMediaQuery);

  readonly #document = inject(DOCUMENT);
  readonly #probe = nfsProbeInit(this.#document);

  constructor() {
    nfsProbeRecord(this.#document, this.#probe, 'page-ctor');

    // Registered after NfsMediaQuery's own afterNextRender(earlyRead) (that
    // one was registered first, inside the service's constructor, when the
    // `mq` field above injected it) -- earlyRead callbacks across the whole
    // app run in registration order, so this always observes the DOM after
    // the service has switched `current` to the live breakpoint.
    afterNextRender({
      earlyRead: () => nfsProbeRecord(this.#document, this.#probe, 'after-mq-earlyRead'),
    });

    afterNextRender(() => {
      requestAnimationFrame(() => nfsProbeRecord(this.#document, this.#probe, 'raf'));
    });
  }
}
