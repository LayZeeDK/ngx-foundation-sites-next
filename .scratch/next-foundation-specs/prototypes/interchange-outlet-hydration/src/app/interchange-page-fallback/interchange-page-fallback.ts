import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { NfsInterchangeOutletDoCheck } from '../interchange/nfs-interchange-outlet-docheck';
import { nfsProbeInit, nfsProbeMark, nfsProbeRecord } from '../render-probe';

// PROTOTYPE (throwaway). The ngDoCheck fallback (specs/interchange.md
// decision table row 11), reused at /csr-fallback, /ssr-fallback, and
// /prerendered-fallback. No @defer block here -- the fallback's only job is
// to prove the replaced-ordering fix; cases 1 and 2 (server HTML, clean
// hydration) and the same-tick swap are re-checked for it too, but the
// deferred-hydration placement is not repeated (already proven for the
// primary directive's mechanism, which the fallback does not change).
@Component({
  selector: 'app-interchange-page-fallback',
  imports: [NfsInterchangeOutletDoCheck],
  template: `
    <h1>Interchange outlet hydration prototype (ngDoCheck fallback)</h1>

    <p data-testid="replaced-log">{{ replacedLog().join(',') }}</p>

    <ng-container
      [nfsInterchangeDoCheck]="[[small, 'small'], [large, 'large']]"
      (replaced)="onReplaced($event)"
    />
    <ng-template #small><div data-testid="interchange-small">Small rule template</div></ng-template>
    <ng-template #large><div data-testid="interchange-large">Large rule template</div></ng-template>
  `,
})
export class InterchangePageFallback {
  protected readonly replacedLog = signal<string[]>([]);

  readonly #document = inject(DOCUMENT);
  readonly #probe = nfsProbeInit(this.#document);

  constructor() {
    nfsProbeRecord(this.#document, this.#probe, 'page-ctor');
  }

  protected onReplaced(rule: readonly [unknown, string] | undefined): void {
    this.replacedLog.update((log) => [...log, rule?.[1] ?? 'none']);

    const expected = rule?.[1];
    const shown = expected
      ? this.#document.querySelector(`[data-testid=interchange-${expected}]`) !== null
      : this.#document.querySelector('[data-testid=interchange-small], [data-testid=interchange-large]') === null;
    nfsProbeMark(this.#probe, `replaced-dom-check:${expected ?? 'none'}:${shown ? 'shown' : 'NOT-SHOWN'}`);
  }
}
