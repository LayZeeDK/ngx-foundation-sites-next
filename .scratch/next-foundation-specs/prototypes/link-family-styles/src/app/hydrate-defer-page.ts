import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsCallout } from '../lib/directives';

/** PROTOTYPE: server-rendered callouts that hydrate later; no other callout is on the page. */
@Component({
  selector: 'nfs-hydrate-defer-page',
  imports: [NfsCallout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (on interaction; hydrate on interaction) {
      <div nfsCallout id="c-int">hydrate on interaction</div>
    } @placeholder {
      <span>placeholder</span>
    }
    <div style="height: 2500px">spacer</div>
    @defer (on viewport; hydrate on viewport) {
      <div nfsCallout id="c-vp">hydrate on viewport</div>
    } @placeholder {
      <span>placeholder</span>
    }
  `,
})
export class HydrateDeferPage {}
