// The shared test cases, one page each. Every page imports a deliberate subset
// of the stand-in directives; the route path is the case id used in the README.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  NfsAccordion,
  NfsAccordionContent,
  NfsAccordionItem,
  NfsAccordionTitle,
  NfsButton,
  NfsDropdownMenu,
  NfsMenuItem,
  NfsSubmenu,
  NfsSubmenuToggle,
} from '../lib';

const ITEMS = `
  <li nfsAccordionItem>
    <h3><button nfsAccordionTitle>First</button></h3>
    <div nfsAccordionContent>First panel</div>
  </li>
  <li nfsAccordionItem>
    <h3><button nfsAccordionTitle>Second</button></h3>
    <div nfsAccordionContent>Second panel</div>
  </li>`;
const ACC = `<ul nfsAccordion>${ITEMS}</ul>`;
const MENU = `
<ul nfsDropdownMenu>
  <li nfsMenuItem><a href="#">Leaf</a></li>
  <li nfsMenuItem>
    <button nfsSubmenuToggle>More</button>
    <ul nfsSubmenu>
      <li nfsMenuItem><a href="#">Sub one</a></li>
    </ul>
  </li>
</ul>`;
const BTN = `<button nfsButton>Save</button>`;

const A = [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent];
const M = [NfsDropdownMenu, NfsMenuItem, NfsSubmenu, NfsSubmenuToggle];
const OnPush = ChangeDetectionStrategy.OnPush;

@Component({ selector: 'app-ok', changeDetection: OnPush, imports: [...A, ...M, NfsButton], template: ACC + MENU + BTN })
export class OkPage {}

@Component({ selector: 'app-acc-no-accordion', changeDetection: OnPush, imports: [NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent], template: ACC })
export class AccNoAccordionPage {}

@Component({ selector: 'app-acc-no-item', changeDetection: OnPush, imports: [NfsAccordion, NfsAccordionTitle, NfsAccordionContent], template: ACC })
export class AccNoItemPage {}

@Component({ selector: 'app-acc-no-title', changeDetection: OnPush, imports: [NfsAccordion, NfsAccordionItem, NfsAccordionContent], template: ACC })
export class AccNoTitlePage {}

@Component({ selector: 'app-acc-family', changeDetection: OnPush, imports: [], template: ACC })
export class AccFamilyPage {}

@Component({ selector: 'app-menu-no-root', changeDetection: OnPush, imports: [NfsMenuItem, NfsSubmenu, NfsSubmenuToggle], template: MENU })
export class MenuNoRootPage {}

@Component({ selector: 'app-menu-no-item', changeDetection: OnPush, imports: [NfsDropdownMenu, NfsSubmenu, NfsSubmenuToggle], template: MENU })
export class MenuNoItemPage {}

@Component({ selector: 'app-menu-no-toggle', changeDetection: OnPush, imports: [NfsDropdownMenu, NfsMenuItem, NfsSubmenu], template: MENU })
export class MenuNoTogglePage {}

@Component({ selector: 'app-menu-family', changeDetection: OnPush, imports: [], template: MENU })
export class MenuFamilyPage {}

@Component({ selector: 'app-button', changeDetection: OnPush, imports: [], template: BTN })
export class ButtonPage {}

// Attributes the consumer writes only as CSS hooks, starting with nfs.
@Component({ selector: 'app-css-attr',
  changeDetection: OnPush,
  imports: [...A],
  template: `
<div nfsCard class="callout">
  <ul nfsAccordion>
    <li nfsAccordionItem nfsFancyItem>
      <h3><button nfsAccordionTitle><span nfsHighlight>First</span></button></h3>
      <div nfsAccordionContent><p nfsaccordion-note>Note</p></div>
    </li>
  </ul>
</div>`,
})
export class CssAttrPage {}

@Component({ selector: 'app-defer',
  changeDetection: OnPush,
  imports: [NfsAccordion, NfsAccordionTitle, NfsAccordionContent],
  template: `@defer (on timer(200ms)) {${ACC}} @placeholder {<p>Loading</p>}`,
})
export class DeferPage {}

// Incremental hydration: the accordion hydrates at once, its items only on interaction.
@Component({ selector: 'app-defer-hydrate-ok',
  changeDetection: OnPush,
  imports: [...A],
  template: `<ul nfsAccordion>@defer (hydrate on interaction) {${ITEMS}} @placeholder {<li>Loading</li>}</ul>`,
})
export class DeferHydrateOkPage {}

@Component({ selector: 'app-defer-hydrate-no-item',
  changeDetection: OnPush,
  imports: [NfsAccordion, NfsAccordionTitle, NfsAccordionContent],
  template: `<ul nfsAccordion>@defer (hydrate on interaction) {${ITEMS}} @placeholder {<li>Loading</li>}</ul>`,
})
export class DeferHydrateNoItemPage {}

// The whole accordion appears later; NfsAccordionItem is forgotten.
@Component({ selector: 'app-if-whole',
  changeDetection: OnPush,
  imports: [NfsAccordion, NfsAccordionTitle, NfsAccordionContent],
  template: `<button id="show" (click)="shown.set(true)">Show</button> @if (shown()) {${ACC}}`,
})
export class IfWholePage {
  protected readonly shown = signal(false);
}

// The accordion and items render at once; only the forgotten title appears later.
@Component({ selector: 'app-if-leaf',
  changeDetection: OnPush,
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionContent],
  template: `
<button id="show" (click)="shown.set(true)">Show</button>
<ul nfsAccordion>
  <li nfsAccordionItem>
    <h3>@if (shown()) {<button nfsAccordionTitle>First</button>}</h3>
    <div nfsAccordionContent>First panel</div>
  </li>
</ul>`,
})
export class IfLeafPage {
  protected readonly shown = signal(false);
}

@Component({ selector: 'app-for',
  changeDetection: OnPush,
  imports: [NfsAccordion, NfsAccordionTitle, NfsAccordionContent],
  template: `
<ul nfsAccordion>
  @for (n of numbers; track n) {
    <li nfsAccordionItem>
      <h3><button nfsAccordionTitle>Item {{ n }}</button></h3>
      <div nfsAccordionContent>Panel {{ n }}</div>
    </li>
  }
</ul>`,
})
export class ForPage {
  protected readonly numbers = [1, 2, 3];
}

@Component({ selector: 'app-outlet',
  changeDetection: OnPush,
  imports: [NgTemplateOutlet, NfsAccordion, NfsAccordionTitle, NfsAccordionContent],
  template: `<ng-template #t>${ACC}</ng-template><ng-container [ngTemplateOutlet]="t" />`,
})
export class OutletPage {}

// Everything imported; the items are declared outside the accordion and rendered inside it.
@Component({ selector: 'app-outlet-across',
  changeDetection: OnPush,
  imports: [NgTemplateOutlet, ...A],
  template: `<ng-template #items>${ITEMS}</ng-template><ul nfsAccordion><ng-container [ngTemplateOutlet]="items" /></ul>`,
})
export class OutletAcrossPage {}

// A consumer component that owns the accordion element and projects its items.
@Component({
  selector: 'app-acc-shell',
  changeDetection: OnPush,
  imports: [NfsAccordion],
  template: `<ul nfsAccordion><ng-content /></ul>`,
})
export class AccShell {}

@Component({ selector: 'app-projected-ok', changeDetection: OnPush, imports: [AccShell, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent], template: `<app-acc-shell>${ITEMS}</app-acc-shell>` })
export class ProjectedOkPage {}

@Component({ selector: 'app-projected-no-item',
  changeDetection: OnPush,
  imports: [AccShell, NfsAccordionTitle, NfsAccordionContent],
  template: `<app-acc-shell>${ITEMS}</app-acc-shell>`,
})
export class ProjectedNoItemPage {}

@Component({ selector: 'app-external',
  changeDetection: OnPush,
  imports: [NfsAccordion, NfsAccordionTitle, NfsAccordionContent],
  templateUrl: './external.html',
})
export class ExternalPage {}

// Not a test case: 500 correctly imported items, to time a render with the checks.
@Component({
  selector: 'app-big',
  changeDetection: OnPush,
  imports: [...A],
  template: `
<button id="tick" (click)="ticks.set(ticks() + 1)">Tick {{ ticks() }}</button>
<ul nfsAccordion>
  @for (n of numbers; track n) {
    <li nfsAccordionItem>
      <h3><button nfsAccordionTitle>Item {{ n }}</button></h3>
      <div nfsAccordionContent>Panel {{ n }}</div>
    </li>
  }
</ul>`,
})
export class BigPage {
  protected readonly ticks = signal(0);
  protected readonly numbers = Array.from({ length: 500 }, (_, i) => i);
}

export const CASES = {
  big: BigPage,
  ok: OkPage,
  'acc-no-accordion': AccNoAccordionPage,
  'acc-no-item': AccNoItemPage,
  'acc-no-title': AccNoTitlePage,
  'acc-family': AccFamilyPage,
  'menu-no-root': MenuNoRootPage,
  'menu-no-item': MenuNoItemPage,
  'menu-no-toggle': MenuNoTogglePage,
  'menu-family': MenuFamilyPage,
  button: ButtonPage,
  'css-attr': CssAttrPage,
  defer: DeferPage,
  'defer-hydrate-ok': DeferHydrateOkPage,
  'defer-hydrate-no-item': DeferHydrateNoItemPage,
  'if-whole': IfWholePage,
  'if-leaf': IfLeafPage,
  for: ForPage,
  outlet: OutletPage,
  'outlet-across': OutletAcrossPage,
  'projected-ok': ProjectedOkPage,
  'projected-no-item': ProjectedNoItemPage,
  external: ExternalPage,
};
