import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { NfsInterchangeOutlet } from '../interchange/nfs-interchange-outlet';
import { InterchangeDeferredBox } from '../interchange-deferred-box/interchange-deferred-box';
import { nfsProbeInit, nfsProbeMark, nfsProbeRecord } from '../render-probe';

// PROTOTYPE (throwaway). One page reused at /csr, /ssr, and /prerendered
// (app.routes.server.ts gives each path a different RenderMode). The main
// outlet is the "renders server HTML", "hydrates cleanly", and "same-tick
// swap" cases; the @defer (hydrate on viewport) block further down, holding
// its own outlet instance, is the fourth placement (deferred hydration).
@Component({
  selector: 'app-interchange-page',
  imports: [NfsInterchangeOutlet, InterchangeDeferredBox],
  template: `
    <h1>Interchange outlet hydration prototype</h1>

    <p data-testid="replaced-log">{{ replacedLog().join(',') }}</p>

    <ng-container
      [nfsInterchange]="[[small, 'small'], [large, 'large']]"
      (replaced)="onReplaced($event)"
    />
    <ng-template #small><div data-testid="interchange-small">Small rule template</div></ng-template>
    <ng-template #large><div data-testid="interchange-large">Large rule template</div></ng-template>

    <div style="height: 1600px" data-testid="spacer"></div>

    @defer (hydrate on viewport) {
      <app-interchange-deferred-box />
    } @placeholder {
      <div data-testid="defer-placeholder">Loading below the fold&hellip;</div>
    }
  `,
})
export class InterchangePage {
  protected readonly replacedLog = signal<string[]>([]);

  readonly #document = inject(DOCUMENT);
  readonly #probe = nfsProbeInit(this.#document);

  constructor() {
    nfsProbeRecord(this.#document, this.#probe, 'page-ctor');
  }

  protected onReplaced(rule: readonly [unknown, string] | undefined): void {
    this.replacedLog.update((log) => [...log, rule?.[1] ?? 'none']);

    // Decisive check for assumption 3 (does `replaced` fire after the DOM
    // shows the rule, not before): read the DOM synchronously, at the exact
    // moment the output handler runs, for the element the emitted rule
    // claims is now shown.
    const expected = rule?.[1];
    const shown = expected
      ? this.#document.querySelector(`[data-testid=interchange-${expected}]`) !== null
      : this.#document.querySelector('[data-testid=interchange-small], [data-testid=interchange-large]') === null;
    nfsProbeMark(this.#probe, `replaced-dom-check:${expected ?? 'none'}:${shown ? 'shown' : 'NOT-SHOWN'}`);
  }
}
