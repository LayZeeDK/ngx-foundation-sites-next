// PROTOTYPE (ticket 190): scenario 3, client-only @defer blocks (on interaction, on viewport).
// The server-rendered part uses no family, so every deferred family is new to the page.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { markHydrated } from './mark-hydrated';
import { NfsButton, NfsCallout, NfsDropdownMenu } from '../lib/directives';

@Component({
  selector: 'nfs-defer-page',
  imports: [NfsButton, NfsCallout, NfsDropdownMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="padding-1">
      <h1>Deferred blocks</h1>
      @defer (on interaction) {
        <div nfsCallout id="c-int">A client-only callout, rendered on interaction.</div>
      } @placeholder {
        <button type="button" id="ph">Load the callout</button>
      }
      <p id="after-int">A paragraph after the interaction block.</p>
      <div style="height: 3000px">Spacer below the fold.</div>
      @defer (on viewport) {
        <section id="vblock">
          <button nfsButton type="button" id="vbtn">A deferred button</button>
          <ul nfsDropdownMenu id="dd">
            <li class="is-dropdown-submenu-parent">
              <a href="#parent">Parent</a>
              <ul class="menu is-dropdown-submenu" id="dd-sub">
                <li><a href="#child-a">Closed child A</a></li>
              </ul>
            </li>
            <li><a href="#sibling">Sibling</a></li>
          </ul>
          <p id="after">A paragraph after the deferred menu.</p>
        </section>
      } @placeholder {
        <div id="vph" style="height: 200px">Viewport placeholder</div>
      }
    </main>
  `,
})
export class DeferPage {
  constructor() {
    markHydrated();
  }
}
