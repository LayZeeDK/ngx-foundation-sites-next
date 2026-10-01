import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { NfsCallout } from '../lib/directives/callout';
import { NfsEnter } from '../lib/directives/enter';

/**
 * PROTOTYPE: enter animations whose keyframes ship in the family's lazily loaded CSS.
 * 197: with `?gate=1` the callouts use the `nfsEnter` listener form (proposal D) instead of the
 * class form `animate.enter="proto-enter"`.
 */
@Component({
  selector: 'nfs-enter-page',
  imports: [NfsCallout, NfsEnter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="show" type="button" (click)="show.set(true)">insert callout</button>
    @if (show()) {
      @if (gate) {
        <div nfsCallout id="c-click" nfsEnter="proto-enter">inserted by a click</div>
      } @else {
        <div nfsCallout id="c-click" animate.enter="proto-enter">inserted by a click</div>
      }
    }
    @defer (on interaction(ph)) {
      @if (gate) {
        <div nfsCallout id="c-defer" nfsEnter="proto-enter">client-only deferred</div>
      } @else {
        <div nfsCallout id="c-defer" animate.enter="proto-enter">client-only deferred</div>
      }
    } @placeholder {
      <span>placeholder</span>
    }
    <button id="ph" #ph type="button">load deferred</button>
  `,
})
export class EnterPage {
  protected readonly show = signal(false);
  protected readonly gate = (inject(DOCUMENT).location?.search ?? '').includes('gate=1');
}
