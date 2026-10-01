import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NfsCallout } from '../lib/directives';

/** PROTOTYPE: enter animations whose keyframes ship in the family's lazily loaded CSS. */
@Component({
  selector: 'nfs-enter-page',
  imports: [NfsCallout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="show" type="button" (click)="show.set(true)">insert callout</button>
    @if (show()) {
      <div nfsCallout id="c-click" animate.enter="proto-enter">inserted by a click</div>
    }
    @defer (on interaction(ph)) {
      <div nfsCallout id="c-defer" animate.enter="proto-enter">client-only deferred</div>
    } @placeholder {
      <span>placeholder</span>
    }
    <button id="ph" #ph type="button">load deferred</button>
  `,
})
export class EnterPage {
  protected readonly show = signal(false);
}
