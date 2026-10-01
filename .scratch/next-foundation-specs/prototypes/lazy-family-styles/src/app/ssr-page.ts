import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NfsButton, NfsCallout, NfsDropdownMenu, NfsMenu } from '../lib/directives';

@Component({
  selector: 'nfs-ssr-page',
  imports: [NfsButton, NfsCallout, NfsMenu, NfsDropdownMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="toggle-hydrated" (click)="hydrated.set(!hydrated())">toggle hydrated callout</button>
    <button id="toggle-deferred" (click)="deferred.set(!deferred())">toggle deferred block</button>
    @if (hydrated()) {
      <div nfsCallout id="c-hydrated">hydrated callout</div>
    }
    <button nfsButton type="button" id="btn">Button</button>
    <ul nfsMenu id="menu">
      <li><a href="#">One</a></li>
      <li><a href="#">Two</a></li>
    </ul>
    <ul nfsDropdownMenu id="dd">
      <li class="is-dropdown-submenu-parent">
        <a href="#">Parent</a>
        <ul class="menu is-dropdown-submenu" id="dd-sub">
          <li><a href="#">Child</a></li>
        </ul>
      </li>
      <li><a href="#">Sibling</a></li>
    </ul>
    <form>
      <label for="in-text">Name</label>
      <input type="text" id="in-text" />
      <select id="sel"><option>a</option></select>
    </form>
    @if (deferred()) {
      @defer (on interaction; hydrate on interaction) {
        <div nfsCallout id="c-deferred">deferred callout (hydrate on interaction)</div>
      } @placeholder {
        <span>placeholder</span>
      }
    }
  `,
})
export class SsrPage {
  protected readonly hydrated = signal(true);
  protected readonly deferred = signal(true);
}
