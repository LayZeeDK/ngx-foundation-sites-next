import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** The forgotten directive sits in an @if branch that renders only after a click. */
@Component({
  selector: 'app-if-case',
  imports: [NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a nfsSmoothScroll href="#top">Imported smooth scroll</a>
    <button type="button" (click)="shown.set(true)">Show</button>
    @if (shown()) {
      <button nfsButton>If missing</button>
    }
  `,
})
export class IfCase {
  protected readonly shown = signal(false);
}
