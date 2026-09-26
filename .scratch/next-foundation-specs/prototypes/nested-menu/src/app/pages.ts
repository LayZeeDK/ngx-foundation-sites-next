// PROTOTYPE (throwaway) -- one route per case. The same three-level menu is
// written out per root, because content projected through a template declared
// outside the root would resolve DI at its declaration site.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NESTED_MENU } from './nested-menu/nested-menu';
import { BreakpointSim } from './nested-menu/breakpoint-sim';

@Component({
  selector: 'app-status',
  template: `<p class="status" data-testid="status">breakpoint: {{ bp.current() }}</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Status {
  readonly bp = inject(BreakpointSim);
}

@Component({
  selector: 'app-accordion-page',
  imports: [NESTED_MENU, Status],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-status />
    <nav aria-label="Prototype site">
      <ul class="vertical menu" nfsAccordionMenu>
        <li nfsMenuItem>
          <button nfsSubmenuToggle>Item 1</button>
          <ul class="menu vertical nested" nfsSubmenu>
            <li nfsMenuItem>
              <button nfsSubmenuToggle>Item 1A</button>
              <ul class="menu vertical nested" nfsSubmenu>
                <li nfsMenuItem><a href="#one-a-i">Item 1A i</a></li>
                <li nfsMenuItem><a href="#one-a-ii">Item 1A ii</a></li>
              </ul>
            </li>
            <li nfsMenuItem><a href="#one-b">Item 1B</a></li>
          </ul>
        </li>
        <li nfsMenuItem>
          <a href="#two">Item 2</a>
          <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Item 2 pages</span></button>
          <ul class="menu vertical nested" nfsSubmenu>
            <li nfsMenuItem><a href="#two-a">Item 2A</a></li>
            <li nfsMenuItem><a href="#two-b">Item 2B</a></li>
          </ul>
        </li>
        <li nfsMenuItem><a href="#three" aria-current="page">Item 3</a></li>
      </ul>
    </nav>
    <p><a href="#after">Link after the menu</a></p>
  `,
})
export class AccordionPage {}

@Component({
  selector: 'app-drilldown-page',
  imports: [NESTED_MENU, Status],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-status />
    <nav aria-label="Prototype site">
      <div nfsDrilldownWrapper>
        <ul class="vertical menu" nfsDrilldown>
          <li nfsMenuItem>
            <button nfsSubmenuToggle>Item 1</button>
            <ul class="menu vertical nested" nfsSubmenu>
              <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back</button></li>
              <li nfsMenuItem>
                <button nfsSubmenuToggle>Item 1A</button>
                <ul class="menu vertical nested" nfsSubmenu>
                  <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back</button></li>
                  <li nfsMenuItem><a href="#one-a-i">Item 1A i</a></li>
                  <li nfsMenuItem><a href="#one-a-ii">Item 1A ii</a></li>
                  <li nfsMenuItem><a href="#one-a-iii">Item 1A iii</a></li>
                  <li nfsMenuItem><a href="#one-a-iv">Item 1A iv</a></li>
                  <li nfsMenuItem><a href="#one-a-v">Item 1A v</a></li>
                </ul>
              </li>
              <li nfsMenuItem><a href="#one-b">Item 1B</a></li>
            </ul>
          </li>
          <li nfsMenuItem>
            <a href="#two">Item 2</a>
            <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Item 2 pages</span></button>
            <ul class="menu vertical nested" nfsSubmenu>
              <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back</button></li>
              <li nfsMenuItem><a href="#two-a">Item 2A</a></li>
              <li nfsMenuItem><a href="#two-b">Item 2B</a></li>
            </ul>
          </li>
          <li nfsMenuItem><a href="#three" aria-current="page">Item 3</a></li>
        </ul>
      </div>
    </nav>
    <p><a href="#after">Link after the menu</a></p>
  `,
})
export class DrilldownPage {}

@Component({
  selector: 'app-dropdown-page',
  imports: [NESTED_MENU, Status],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-status />
    <nav aria-label="Prototype site">
      <ul class="dropdown menu" [style.margin-left.px]="edge ? 500 : null" nfsDropdownMenu>
        <li nfsMenuItem>
          <button nfsSubmenuToggle>Item 1</button>
          <ul class="menu vertical nested" nfsSubmenu>
            <li nfsMenuItem>
              <button nfsSubmenuToggle>Item 1A</button>
              <ul class="menu vertical nested" nfsSubmenu>
                <li nfsMenuItem><a href="#one-a-i">Item 1A i</a></li>
                <li nfsMenuItem><a href="#one-a-ii">Item 1A ii</a></li>
              </ul>
            </li>
            <li nfsMenuItem><a href="#one-b">Item 1B</a></li>
          </ul>
        </li>
        <li nfsMenuItem>
          <a href="#two">Item 2</a>
          <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Item 2 pages</span></button>
          <ul class="menu vertical nested" nfsSubmenu>
            <li nfsMenuItem><a href="#two-a">Item 2A</a></li>
            <li nfsMenuItem><a href="#two-b">Item 2B</a></li>
          </ul>
        </li>
        <li nfsMenuItem><a href="#three" aria-current="page">Item 3</a></li>
      </ul>
    </nav>
    <p><a href="#after">Link after the menu</a></p>
  `,
})
export class DropdownPage {
  /** Harness: pushes the menu toward the right viewport edge, for the collision flip. */
  readonly edge: boolean = inject(ActivatedRoute).snapshot.data['edge'] === true;
}

@Component({
  selector: 'app-responsive-page',
  imports: [NESTED_MENU, Status],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-status />
    <nav aria-label="Prototype site">
      <div nfsDrilldownWrapper>
        <ul class="vertical medium-horizontal menu" [nfsResponsiveMenu]="rules" [focusFixup]="fixup">
          <li nfsMenuItem>
            <button nfsSubmenuToggle>Item 1</button>
            <ul class="menu vertical nested" nfsSubmenu>
              <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back</button></li>
              <li nfsMenuItem>
                <button nfsSubmenuToggle>Item 1A</button>
                <ul class="menu vertical nested" nfsSubmenu>
                  <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back</button></li>
                  <li nfsMenuItem><a href="#one-a-i">Item 1A i</a></li>
                  <li nfsMenuItem><a href="#one-a-ii">Item 1A ii</a></li>
                </ul>
              </li>
              <li nfsMenuItem><a href="#one-b">Item 1B</a></li>
            </ul>
          </li>
          <li nfsMenuItem>
            <a href="#two">Item 2</a>
            <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Item 2 pages</span></button>
            <ul class="menu vertical nested" nfsSubmenu>
              <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back</button></li>
              <li nfsMenuItem><a href="#two-a">Item 2A</a></li>
              <li nfsMenuItem><a href="#two-b">Item 2B</a></li>
            </ul>
          </li>
          <li nfsMenuItem><a href="#three" aria-current="page">Item 3</a></li>
        </ul>
      </div>
    </nav>
    <p><a href="#after">Link after the menu</a></p>
  `,
})
export class ResponsivePage {
  readonly #route = inject(ActivatedRoute);
  readonly rules: string = this.#route.snapshot.data['rules'];
  readonly fixup = this.#route.snapshot.queryParamMap.get('fixup') !== 'off';
}

@Component({
  selector: 'app-index',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Cases</h2>
    <ul>
      <li><a routerLink="/accordion">AccordionMenu</a></li>
      <li><a routerLink="/drilldown">Drilldown</a></li>
      <li><a routerLink="/dropdown">DropdownMenu</a></li>
      <li><a routerLink="/responsive">ResponsiveMenu: drilldown medium-dropdown</a></li>
      <li><a routerLink="/responsive-accordion">ResponsiveMenu: accordion medium-dropdown</a></li>
    </ul>
  `,
})
export class IndexPage {}
