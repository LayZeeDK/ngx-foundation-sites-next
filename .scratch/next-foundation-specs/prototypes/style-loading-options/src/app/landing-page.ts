// PROTOTYPE (ticket 190): scenarios 1 (SSR landing), 2 (start of a route navigation),
// 4 (a first interaction inserts a new family), and 5 (one family before idle, one after).
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { markHydrated } from './mark-hydrated';
import { NfsButton, NfsCallout, NfsDropdownMenu, NfsDropdownPane } from '../lib/directives';

@Component({
  selector: 'nfs-landing-page',
  imports: [RouterLink, NfsButton, NfsCallout, NfsDropdownPane, NfsDropdownMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="padding-1">
      <h1>Style loading options</h1>
      <div nfsCallout id="hero">
        <p id="lcp">
          This server-rendered callout is the largest block on the page. Its family styles are in
          the server HTML, so every loading option paints it styled from the first frame. The rest
          of the page waits for interactions that insert families the server did not render.
        </p>
      </div>
      <p>
        <button nfsButton type="button" id="open-pane" aria-controls="pane"
          [attr.aria-expanded]="pane()" (click)="pane.set(!pane())">Open pane</button>
        <button nfsButton type="button" id="show-menu" (click)="menu.set(!menu())">Show menu</button>
      </p>
      <div style="position: relative">
        @if (pane()) {
          <div nfsDropdownPane class="is-open" id="pane">
            <p>Pane content, opened by a click.</p>
            <a href="#pane-link" id="pane-link">A link in the pane</a>
          </div>
        }
      </div>
      @if (menu()) {
        <ul nfsDropdownMenu id="dd2">
          <li class="is-dropdown-submenu-parent">
            <a href="#p">Parent</a>
            <ul class="menu is-dropdown-submenu" id="dd2-sub">
              <li><a href="#c1">Closed child one</a></li>
              <li><a href="#c2">Closed child two</a></li>
            </ul>
          </li>
          <li><a href="#s">Sibling</a></li>
        </ul>
      }
      <p id="after">A paragraph after the interactive area, to see layout positions move.</p>
      <p><a routerLink="/menus" id="nav">Go to the menus page</a></p>
      <p><a routerLink="/defer" id="nav-defer">Go to the deferred page</a></p>
    </main>
  `,
})
export class LandingPage {
  constructor() {
    markHydrated();
  }

  protected readonly pane = signal(false);
  protected readonly menu = signal(false);
}
