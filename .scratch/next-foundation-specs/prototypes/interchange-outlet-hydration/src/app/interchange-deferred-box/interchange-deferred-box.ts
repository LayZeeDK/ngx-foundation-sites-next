import { Component, signal } from '@angular/core';
import { NfsInterchangeOutlet } from '../interchange/nfs-interchange-outlet';

// PROTOTYPE (throwaway). Its own component (not inlined into
// interchange-page) so the `@defer` block produces a real lazy chunk to
// hydrate, per the rendering-mode-test-seam prototype's finding: "A
// component used both inside and outside a @defer block in one file is
// eager."
@Component({
  selector: 'app-interchange-deferred-box',
  imports: [NfsInterchangeOutlet],
  template: `
    <p data-testid="defer-replaced-log">{{ replacedLog().join(',') }}</p>

    <ng-container
      [nfsInterchange]="[[small, 'small'], [large, 'large']]"
      (replaced)="onReplaced($event)"
    />
    <ng-template #small><div data-testid="defer-interchange-small">Deferred: small rule template</div></ng-template>
    <ng-template #large><div data-testid="defer-interchange-large">Deferred: large rule template</div></ng-template>
  `,
})
export class InterchangeDeferredBox {
  protected readonly replacedLog = signal<string[]>([]);

  protected onReplaced(rule: readonly [unknown, string] | undefined): void {
    this.replacedLog.update((log) => [...log, rule?.[1] ?? 'none']);
  }
}
