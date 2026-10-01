// PROTOTYPE (ticket 190): scenario 2, the target of a client-side navigation. Its families
// (menu, dropdown-menu, dropdown) are not used by the landing page.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { markHydrated } from './mark-hydrated';
import { RouterLink } from '@angular/router';
import { NfsDropdownMenu, NfsDropdownPane, NfsMenu } from '../lib/directives';

@Component({
  selector: 'nfs-menus-page',
  imports: [RouterLink, NfsMenu, NfsDropdownMenu, NfsDropdownPane],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="padding-1">
      <h1>Menus</h1>
      <ul nfsMenu id="menu">
        <li><a href="#one">One</a></li>
        <li><a href="#two">Two</a></li>
      </ul>
      <ul nfsDropdownMenu id="dd">
        <li class="is-dropdown-submenu-parent">
          <a href="#parent">Parent</a>
          <ul class="menu is-dropdown-submenu" id="dd-sub">
            <li><a href="#child-a">Closed child A</a></li>
            <li><a href="#child-b">Closed child B</a></li>
          </ul>
        </li>
        <li><a href="#sibling">Sibling</a></li>
      </ul>
      <div nfsDropdownPane id="pane-closed">
        Closed pane content. <a href="#hidden">A link in the closed pane</a>
      </div>
      <p id="after">A paragraph after the menus, to see layout positions move.</p>
      <p><a routerLink="/">Back to the landing page</a></p>
    </main>
  `,
})
export class MenusPage {
  constructor() {
    markHydrated();
  }
}
