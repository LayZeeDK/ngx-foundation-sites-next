import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsCallout } from '../lib/directives';

@Component({
  selector: 'nfs-client-defer-page',
  imports: [NfsCallout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (on interaction) {
      <div nfsCallout id="c-client">client-only deferred callout</div>
    } @placeholder {
      <button id="ph" type="button">load</button>
    }
  `,
})
export class ClientDeferPage {}
