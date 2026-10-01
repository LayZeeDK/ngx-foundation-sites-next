import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NfsCallout } from '../lib/directives/callout';

/** PROTOTYPE 197, proposal G: one callout toggled in a loop over a page of 3,000 other elements. */
@Component({
  selector: 'nfs-churn-page',
  imports: [NfsCallout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="toggle" type="button" (click)="on.set(!on())">toggle callout</button>
    @if (on()) {
      <div nfsCallout id="churn-c">churning callout</div>
    }
    <div id="bulk">
      @for (i of rows; track i) {
        <p class="row-{{ i % 7 }}">row {{ i }} <span>text</span></p>
      }
    </div>
  `,
})
export class ChurnPage {
  protected readonly on = signal(false);
  protected readonly rows = Array.from({ length: 3000 }, (_, i) => i);
}
