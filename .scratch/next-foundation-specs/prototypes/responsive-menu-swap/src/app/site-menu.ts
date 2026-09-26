// PROTOTYPE (throwaway) -- the consumer's menu, Foundation's responsive navigation markup
// with parents as buttons, back items, and a Hybrid item, under
// nfsResponsiveMenu="drilldown medium-dropdown large-accordion".
// `current` adds Foundation's static `is-active` pre-open marker on the Products submenu
// plus a two-way [(expanded)] on its item (question 3). The two markups are written out
// because a static class cannot be toggled by a binding.
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { NESTED_MENU, NfsMenuItem, NfsResponsiveMenu } from './nested-menu/nested-menu';
import { nfsLog } from './instrument';

export const RULES = 'drilldown medium-dropdown large-accordion';

@Component({
  selector: 'app-site-menu',
  imports: [NESTED_MENU],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Main" data-testid="menu-nav">
      <div nfsDrilldownWrapper>
        @if (current()) {
          <ul
            class="vertical medium-horizontal large-vertical menu"
            data-testid="menu"
            [nfsResponsiveMenu]="rules()"
            #m="nfsResponsiveMenu"
            (opened)="out('opened', $event)"
            (closed)="out('closed', $event)"
          >
            <li nfsMenuItem>
              <button nfsSubmenuToggle>Item 1</button>
              <ul class="menu vertical nested" nfsSubmenu>
                <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
                <li nfsMenuItem>
                  <button nfsSubmenuToggle>Item 1A</button>
                  <ul class="menu vertical nested" nfsSubmenu>
                    <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to Item 1</span></button></li>
                    <li nfsMenuItem><a href="#one-a-i">Item 1A i</a></li>
                    <li nfsMenuItem><a href="#one-a-ii">Item 1A ii</a></li>
                  </ul>
                </li>
                <li nfsMenuItem><a href="#one-b">Item 1B</a></li>
              </ul>
            </li>
            <li nfsMenuItem [(expanded)]="productsOpen" (expandedChange)="xc($event)">
              <a href="#products">Products</a>
              <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Products pages</span></button>
              <ul class="menu vertical nested is-active" nfsSubmenu>
                <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
                <li nfsMenuItem><a href="#boards" aria-current="page">Boards</a></li>
                <li nfsMenuItem><a href="#skates">Skates</a></li>
              </ul>
            </li>
            <li nfsMenuItem><a href="#about">About</a></li>
          </ul>
          <p class="status" data-testid="status">mode={{ m.mode() }} productsOpen={{ productsOpen() }}</p>
        } @else {
          <ul
            class="vertical medium-horizontal large-vertical menu"
            data-testid="menu"
            [nfsResponsiveMenu]="rules()"
            #m="nfsResponsiveMenu"
            (opened)="out('opened', $event)"
            (closed)="out('closed', $event)"
          >
            <li nfsMenuItem>
              <button nfsSubmenuToggle>Item 1</button>
              <ul class="menu vertical nested" nfsSubmenu>
                <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
                <li nfsMenuItem>
                  <button nfsSubmenuToggle>Item 1A</button>
                  <ul class="menu vertical nested" nfsSubmenu>
                    <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to Item 1</span></button></li>
                    <li nfsMenuItem><a href="#one-a-i">Item 1A i</a></li>
                    <li nfsMenuItem><a href="#one-a-ii">Item 1A ii</a></li>
                  </ul>
                </li>
                <li nfsMenuItem><a href="#one-b">Item 1B</a></li>
              </ul>
            </li>
            <li nfsMenuItem>
              <a href="#products">Products</a>
              <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Products pages</span></button>
              <ul class="menu vertical nested" nfsSubmenu>
                <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
                <li nfsMenuItem><a href="#boards" aria-current="page">Boards</a></li>
                <li nfsMenuItem><a href="#skates">Skates</a></li>
              </ul>
            </li>
            <li nfsMenuItem><a href="#about">About</a></li>
          </ul>
          <p class="status" data-testid="status">mode={{ m.mode() }} productsOpen={{ productsOpen() }}</p>
        }
      </div>
    </nav>
  `,
})
export class SiteMenu {
  readonly current = input(false);
  readonly initialRules = input(RULES, { alias: 'rules' });
  /** Harness: window.__setRules(r) changes the rules without moving focus. */
  readonly rules = linkedSignal(() => this.initialRules());
  /** Consumer state behind the two-way [(expanded)] of the Products item (current markup only). */
  readonly productsOpen = signal(true);
  protected readonly menu = viewChild(NfsResponsiveMenu);

  constructor() {
    afterNextRender(() => {
      (window as unknown as { __setRules: (r: string) => void }).__setRules = (r) => this.rules.set(r);
    });
  }

  protected xc(value: boolean): void {
    nfsLog({ kind: 'expandedChange', item: 'Products pages', value, productsOpen: this.productsOpen() });
  }

  protected out(output: 'opened' | 'closed', item: NfsMenuItem): void {
    nfsLog({ kind: 'output', output, item: item.label(), mode: this.menu()?.mode(), productsOpen: this.productsOpen() });
  }
}
