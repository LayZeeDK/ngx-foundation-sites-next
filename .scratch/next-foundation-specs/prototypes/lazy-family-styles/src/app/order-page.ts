import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NfsDropdownMenu, NfsDropdownMenuReversed, NfsMenu } from '../lib/directives';

@Component({
  selector: 'nfs-order-page',
  imports: [NfsMenu, NfsDropdownMenu, NfsDropdownMenuReversed],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="show-menu" (click)="menu.set(!menu())">plain menu</button>
    <button id="show-dd" (click)="dd.set(!dd())">dropdown menu (menu sheet first)</button>
    <button id="show-ddr" (click)="ddr.set(!ddr())">dropdown menu (dropdown-menu sheet first)</button>
    @if (menu()) {
      <ul nfsMenu id="plain-menu">
        <li><a href="#">Plain</a></li>
      </ul>
    }
    @if (ssr() === 'normal' || dd()) {
      <ul nfsDropdownMenu id="dd">
        <li class="is-dropdown-submenu-parent">
          <a href="#">Parent</a>
          <ul class="menu is-dropdown-submenu" id="dd-sub">
            <li><a href="#">Child</a></li>
          </ul>
        </li>
      </ul>
    }
    @if (ssr() === 'reversed' || ddr()) {
      <ul nfsDropdownMenuReversed id="ddr">
        <li class="is-dropdown-submenu-parent">
          <a href="#">Parent</a>
          <ul class="menu is-dropdown-submenu" id="ddr-sub">
            <li><a href="#">Child</a></li>
          </ul>
        </li>
      </ul>
    }
  `,
})
export class OrderPage {
  readonly ssr = input<'normal' | 'reversed'>();
  protected readonly menu = signal(false);
  protected readonly dd = signal(false);
  protected readonly ddr = signal(false);
}
