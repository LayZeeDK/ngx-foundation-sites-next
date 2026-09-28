// Variant A, the Angular Aria style: every child injects its parent optionally,
// and every part checks its peers in a development-mode render callback (dev.ts).
// Stand-ins only: the class names and selectors follow the specs; behaviour is minimal.
import {
  Directive,
  ElementRef,
  InjectionToken,
  computed,
  inject,
  input,
  signal,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { nfsDevAfterRender, nfsDevCheckChildren, nfsDevCheckParent, nfsDevMark, type NfsDevPart } from './dev';

// The guard is written inline at every site: a hoisted `const dev = ...` kept the checks in the production bundle (measured).

const ACCORDION: NfsDevPart = { attr: 'nfsAccordion', name: 'NfsAccordion' };
const ITEM: NfsDevPart = { attr: 'nfsAccordionItem', name: 'NfsAccordionItem' };
const TITLE: NfsDevPart = { attr: 'nfsAccordionTitle', name: 'NfsAccordionTitle' };
const CONTENT: NfsDevPart = { attr: 'nfsAccordionContent', name: 'NfsAccordionContent' };
const ROOT: NfsDevPart = { attr: 'nfsDropdownMenu', name: 'NfsDropdownMenu' };
const MENU_ITEM: NfsDevPart = { attr: 'nfsMenuItem', name: 'NfsMenuItem' };
const SUBMENU: NfsDevPart = { attr: 'nfsSubmenu', name: 'NfsSubmenu' };
const TOGGLE: NfsDevPart = { attr: 'nfsSubmenuToggle', name: 'NfsSubmenuToggle' };

function host(): HTMLElement {
  return inject(ElementRef).nativeElement;
}

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

export const nfsAccordionToken = new InjectionToken<NfsAccordion>('nfsAccordionToken');
export const nfsAccordionItemToken = new InjectionToken<NfsAccordionItem>('nfsAccordionItemToken');

@Directive({
  selector: '[nfsAccordion]',
  host: { class: 'accordion' },
  providers: [{ provide: nfsAccordionToken, useExisting: NfsAccordion }],
})
export class NfsAccordion {
  readonly #host = host();
  readonly items = registry<NfsAccordionItem>();

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevMark(this.#host, ACCORDION);
      nfsDevAfterRender(() => nfsDevCheckChildren(this.#host, ACCORDION, ITEM, this.items.items()));
    }
  }
}

@Directive({
  selector: '[nfsAccordionItem]',
  host: { class: 'accordion-item', '[class.is-active]': 'expanded()' },
  providers: [{ provide: nfsAccordionItemToken, useExisting: NfsAccordionItem }],
})
export class NfsAccordionItem implements OnInit, OnDestroy {
  readonly #host = host();
  readonly #accordion = inject(nfsAccordionToken, { optional: true });
  readonly titles = registry<NfsAccordionTitle>();
  readonly contents = registry<NfsAccordionContent>();
  readonly expanded = signal(false);

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevMark(this.#host, ITEM);
      nfsDevAfterRender(() => {
        nfsDevCheckParent(this.#host, ITEM, ACCORDION, !!this.#accordion);
        nfsDevCheckChildren(this.#host, ITEM, TITLE, this.titles.items());
        nfsDevCheckChildren(this.#host, ITEM, CONTENT, this.contents.items());
      });
    }
  }

  ngOnInit(): void {
    this.#accordion?.items.add(this);
  }

  ngOnDestroy(): void {
    this.#accordion?.items.remove(this);
  }
}

@Directive({
  selector: 'button[nfsAccordionTitle]',
  host: {
    class: 'accordion-title',
    type: 'button',
    '[attr.aria-expanded]': 'item?.expanded() ?? false',
    '(click)': 'item?.expanded.set(!item.expanded())',
  },
})
export class NfsAccordionTitle implements OnDestroy {
  readonly #host = host();
  protected readonly item = inject(nfsAccordionItemToken, { optional: true });
  /** Stand-in for a bound input on the title (`[expanded]` in the spec). */
  readonly expanded = input<boolean>();

  constructor() {
    this.item?.titles.add(this);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevMark(this.#host, TITLE);
      nfsDevAfterRender(() => nfsDevCheckParent(this.#host, TITLE, ITEM, !!this.item));
    }
  }

  ngOnDestroy(): void {
    this.item?.titles.remove(this);
  }
}

@Directive({
  selector: '[nfsAccordionContent]',
  host: { class: 'accordion-content', '[style.display]': 'item?.expanded() ? "block" : "none"' },
  exportAs: 'nfsAccordionContent',
})
export class NfsAccordionContent implements OnDestroy {
  readonly #host = host();
  protected readonly item = inject(nfsAccordionItemToken, { optional: true });

  constructor() {
    this.item?.contents.add(this);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevMark(this.#host, CONTENT);
      nfsDevAfterRender(() => nfsDevCheckParent(this.#host, CONTENT, ITEM, !!this.item));
    }
  }

  ngOnDestroy(): void {
    this.item?.contents.remove(this);
  }
}

export const NFS_ACCORDION = [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent] as const;

// ---------------------------------------------------------------- Menu

export const nfsMenuModeToken = new InjectionToken<NfsDropdownMenu>('nfsMenuModeToken');

@Directive({
  selector: 'ul[nfsSubmenu]',
  host: { class: 'menu submenu is-dropdown-submenu', '[hidden]': '!(item?.open() ?? true)' },
})
export class NfsSubmenu implements OnDestroy {
  readonly #host = host();
  protected readonly item = inject(NfsMenuItem, { optional: true });

  constructor() {
    this.item?.submenus.add(this);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevMark(this.#host, SUBMENU);
      nfsDevAfterRender(() => nfsDevCheckParent(this.#host, SUBMENU, MENU_ITEM, !!this.item));
    }
  }

  ngOnDestroy(): void {
    this.item?.submenus.remove(this);
  }
}

@Directive({
  selector: 'ul[nfsDropdownMenu]',
  host: { class: 'dropdown menu' },
  providers: [
    { provide: nfsMenuModeToken, useExisting: NfsDropdownMenu },
    // A nested root starts a new tree (the CdkAccordionItem pattern).
    { provide: NfsSubmenu, useValue: null },
  ],
})
export class NfsDropdownMenu {
  readonly #host = host();
  readonly items = registry<NfsMenuItem>();

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevMark(this.#host, ROOT);
      nfsDevAfterRender(() => nfsDevCheckChildren(this.#host, ROOT, MENU_ITEM, this.items.items()));
    }
  }
}

@Directive({
  selector: 'li[nfsMenuItem]',
  host: {
    '[class.is-dropdown-submenu-parent]': 'hasSubmenu()',
    '[class.is-active]': 'open()',
  },
})
export class NfsMenuItem implements OnDestroy {
  readonly #host = host();
  // Optional on purpose: a menu item may stand alone (building-blocks 1.9).
  readonly #root = inject(nfsMenuModeToken, { optional: true });
  readonly submenus = registry<NfsSubmenu>();
  readonly toggles = registry<NfsSubmenuToggle>();
  readonly open = signal(false);
  readonly hasSubmenu = computed(() => this.submenus.items().size > 0);

  constructor() {
    this.#root?.items.add(this);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevMark(this.#host, MENU_ITEM);
      nfsDevAfterRender(() => {
        nfsDevCheckParent(this.#host, MENU_ITEM, ROOT, !!this.#root);
        nfsDevCheckChildren(this.#host, MENU_ITEM, SUBMENU, this.submenus.items());
        nfsDevCheckChildren(this.#host, MENU_ITEM, TOGGLE, this.toggles.items());
      });
    }
  }

  ngOnDestroy(): void {
    this.#root?.items.remove(this);
  }
}

@Directive({
  selector: 'button[nfsSubmenuToggle]',
  host: {
    class: 'submenu-toggle',
    type: 'button',
    '[attr.aria-expanded]': 'item?.open() ?? false',
    '(click)': 'item?.open.set(!item.open())',
  },
})
export class NfsSubmenuToggle implements OnDestroy {
  readonly #host = host();
  protected readonly item = inject(NfsMenuItem, { optional: true });

  constructor() {
    this.item?.toggles.add(this);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevMark(this.#host, TOGGLE);
      nfsDevAfterRender(() => nfsDevCheckParent(this.#host, TOGGLE, MENU_ITEM, !!this.item));
    }
  }

  ngOnDestroy(): void {
    this.item?.toggles.remove(this);
  }
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
