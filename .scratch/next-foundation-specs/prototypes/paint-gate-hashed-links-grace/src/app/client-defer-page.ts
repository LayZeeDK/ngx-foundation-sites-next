import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsCallout } from '../lib/directives/callout';

// PROTOTYPE 197: a focusable child (focus during the gap) and a following paragraph (layout shift).
@Component({
  selector: 'nfs-client-defer-page',
  imports: [NfsCallout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (on interaction) {
      <div nfsCallout id="c-client">
        client-only deferred callout
        <button id="c-inner" type="button">inner action</button>
      </div>
    } @placeholder {
      <button id="ph" type="button">load</button>
    }
    <p id="after">content below the callout</p>
  `,
})
export class ClientDeferPage {}
