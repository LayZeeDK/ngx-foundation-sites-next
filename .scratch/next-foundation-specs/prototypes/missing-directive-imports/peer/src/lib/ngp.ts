// Variant B, the ng-primitives style: every child injects its parent without
// `optional`, so a forgotten parent throws NG0201 at creation. No development
// checks at all. Same stand-ins, selectors, and classes as aria.ts.
import {
  Directive,
  InjectionToken,
  inject,
  input,
  signal,
  type OnDestroy,
  type OnInit,
} from '@angular/core';

function registry<T>() {
  const items = signal<ReadonlySet<T>>(new Set());

  return {
    items,
    add: (item: T) => items.update((s) => new Set(s).add(item)),
    remove: (item: T) =>
      items.update((s) => {
        const next = new Set(s);
        next.delete(item);

        return next;
      }),
  };
}

// ---------------------------------------------------------------- Accordion

// The token description is the only text NG0201 prints about the token, so it
// names the directive to import. Angular's own tokens drop it in production
// (`ngDevMode ? '...' : ''`); measured both ways in the README.
export const nfsAccordionToken = new InjectionToken<NfsAccordion>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'nfsAccordionToken (import NfsAccordion)' : '',
);
export const nfsAccordionItemToken = new InjectionToken<NfsAccordionItem>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'nfsAccordionItemToken (import NfsAccordionItem)' : '',
);

@Directive({
  selector: '[nfsAccordion]',
  host: { class: 'accordion' },
  providers: [{ provide: nfsAccordionToken, useExisting: NfsAccordion }],
})
export class NfsAccordion {
  readonly items = registry<NfsAccordionItem>();
}

@Directive({
  selector: '[nfsAccordionItem]',
  host: { class: 'accordion-item', '[class.is-active]': 'expanded()' },
  providers: [{ provide: nfsAccordionItemToken, useExisting: NfsAccordionItem }],
})
export class NfsAccordionItem implements OnInit, OnDestroy {
  readonly #accordion = inject(nfsAccordionToken);
  readonly expanded = signal(false);

  ngOnInit(): void {
    this.#accordion.items.add(this);
  }

  ngOnDestroy(): void {
    this.#accordion.items.remove(this);
  }
}

@Directive({
  selector: 'button[nfsAccordionTitle]',
  host: {
    class: 'accordion-title',
    type: 'button',
    '[attr.aria-expanded]': 'item.expanded()',
    '(click)': 'item.expanded.set(!item.expanded())',
  },
})
export class NfsAccordionTitle {
  protected readonly item = inject(nfsAccordionItemToken);
  /** Stand-in for a bound input on the title (`[expanded]` in the spec). */
  readonly expanded = input<boolean>();
}

@Directive({
  selector: '[nfsAccordionContent]',
  host: { class: 'accordion-content', '[style.display]': 'item.expanded() ? "block" : "none"' },
  exportAs: 'nfsAccordionContent',
})
export class NfsAccordionContent {
  protected readonly item = inject(nfsAccordionItemToken);
}

export const NFS_ACCORDION = [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent] as const;

// ---------------------------------------------------------------- Menu

export const nfsMenuModeToken = new InjectionToken<NfsDropdownMenu>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'nfsMenuModeToken (import NfsDropdownMenu)' : '',
);

@Directive({
  selector: 'ul[nfsSubmenu]',
  host: { class: 'menu submenu is-dropdown-submenu', '[hidden]': '!item.open()' },
})
export class NfsSubmenu {
  // Injected by class: NG0201 then names the class to import.
  protected readonly item = inject(NfsMenuItem);
}

@Directive({
  selector: 'ul[nfsDropdownMenu]',
  host: { class: 'dropdown menu' },
  providers: [{ provide: nfsMenuModeToken, useExisting: NfsDropdownMenu }],
})
export class NfsDropdownMenu {
  readonly items = registry<NfsMenuItem>();
}

@Directive({
  selector: 'li[nfsMenuItem]',
  host: { '[class.is-active]': 'open()' },
})
export class NfsMenuItem implements OnDestroy {
  // Required here, against building-blocks 1.9, which keeps it optional so an item may stand alone.
  readonly #root = inject(nfsMenuModeToken);
  readonly open = signal(false);

  constructor() {
    this.#root.items.add(this);
  }

  ngOnDestroy(): void {
    this.#root.items.remove(this);
  }
}

@Directive({
  selector: 'button[nfsSubmenuToggle]',
  host: {
    class: 'submenu-toggle',
    type: 'button',
    '[attr.aria-expanded]': 'item.open()',
    '(click)': 'item.open.set(!item.open())',
  },
})
export class NfsSubmenuToggle {
  protected readonly item = inject(NfsMenuItem);
}

export const NFS_DROPDOWN_MENU = [NfsDropdownMenu, NfsMenuItem, NfsSubmenu, NfsSubmenuToggle] as const;

// ---------------------------------------------------------------- Button (a single directive)

@Directive({
  selector: 'button[nfsButton], a[nfsButton]',
  host: { class: 'button', '[class]': 'color() ?? ""' },
})
export class NfsButton {
  readonly color = input<'primary' | 'secondary' | 'alert'>();
}
