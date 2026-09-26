// PROTOTYPE (throwaway) -- Nested menu directive family, answering
// "Prototype: Nested menu directive family with breakpoint mode switching".
// Not library code: no dev-mode warnings, no defaults tokens, no outputs.
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  InjectionToken,
  Injector,
  input,
  model,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { BreakpointSim, parseRules, resolveMode } from './breakpoint-sim';

export type NfsMenuMode = 'accordion' | 'drilldown' | 'dropdown';

/** The menu root's shared state: the Menu mode signal plus the top-level items. */
export class NfsMenuRootState {
  readonly #source = signal<Signal<NfsMenuMode>>(signal<NfsMenuMode>('accordion'));
  readonly mode = computed(() => this.#source()());
  readonly items = signal<NfsMenuItem[]>([]);
  element!: HTMLElement;
  constructor(mode: NfsMenuMode) {
    this.#source.set(signal(mode));
  }
  drive(mode: Signal<NfsMenuMode>): void {
    this.#source.set(mode);
  }
}

export const nfsMenuModeToken = new InjectionToken<NfsMenuRootState>('nfsMenuModeToken');

// ponytail: element -> directive lookup for DOM-first key handling; the spec
// uses parent-owned registration (building-blocks 1.9) instead.
const itemOf = new WeakMap<Element, NfsMenuItem>();

// ---------------------------------------------------------------- item family

@Directive({
  selector: 'li[nfsMenuItem]',
  exportAs: 'nfsMenuItem',
  host: { '[class]': 'classes()' },
})
export class NfsMenuItem {
  readonly element: HTMLLIElement = inject(ElementRef).nativeElement;
  readonly root = inject(nfsMenuModeToken, { optional: true });
  readonly parentSubmenu = inject(NfsSubmenu, { optional: true });
  readonly #dir = inject(Directionality);
  readonly #injector = inject(Injector);

  readonly expanded = model(false);
  readonly submenu = signal<NfsSubmenu | null>(null);
  readonly toggleButton = signal<NfsSubmenuToggle | null>(null);

  readonly mode = computed(() => this.root?.mode() ?? null);
  /** DropdownMenu collision flip (Foundation _show: Box.ImNotTouchingYou, left/right only). */
  readonly collision = signal<'flipped' | 'inner' | null>(null);
  readonly hybrid = computed(() => this.toggleButton()?.hybrid() ?? false);

  /** Foundation's Nest vocabulary, emitted from the mode signal instead of Nest.Feather. */
  readonly classes = computed(() => {
    const m = this.mode();

    if (!m) {
      return {};
    }

    const isParent = this.submenu() !== null;
    const inSubmenu = this.parentSubmenu !== null;
    const rtl = this.#dir.valueSignal() === 'rtl';
    const base = rtl ? 'left' : 'right';
    const flip = this.collision();
    const side = flip === 'inner' ? 'inner' : flip === 'flipped' ? (rtl ? 'right' : 'left') : base;

    return {
      [`is-${m}-submenu-parent`]: isParent,
      'is-submenu-item': inSubmenu,
      [`is-${m}-submenu-item`]: inSubmenu,
      // Hybrid form: Foundation's AccordionMenu submenu-toggle layout, reused in every mode.
      'has-submenu-toggle': isParent && this.hybrid(),
      // Custom state class for the li-level grid (see _nested-menu.scss).
      'is-expanded': m === 'accordion' && isParent && this.expanded(),
      // DropdownMenu: Foundation's open-parent and alignment classes.
      'is-active': m === 'dropdown' && isParent && this.expanded(),
      'opens-right': m === 'dropdown' && isParent && side === 'right',
      'opens-left': m === 'dropdown' && isParent && side === 'left',
      'opens-inner': m === 'dropdown' && isParent && side === 'inner',
    };
  });

  constructor() {
    itemOf.set(this.element, this);
    const list = this.parentSubmenu?.items ?? this.root?.items;
    list?.update((items) => [...items, this]);
    inject(DestroyRef).onDestroy(() => list?.update((items) => items.filter((i) => i !== this)));

    // Collision check after open: measure in earlyRead, flip in write; the flip re-renders
    // and the effect measures again (base side -> opposite side -> opens-inner).
    afterRenderEffect({
      earlyRead: () => {
        const sub = this.submenu();
        this.collision(); // re-measure after each flip

        if (this.mode() !== 'dropdown' || !this.expanded() || !sub) {
          return null;
        }

        const r = sub.element.getBoundingClientRect();

        return { left: r.left, right: r.right, width: sub.element.ownerDocument.documentElement.clientWidth };
      },
      write: (rect) => {
        const r = rect();
        const current = untracked(() => this.collision());

        if (!r) {
          if (current !== null) {
            this.collision.set(null);
          }

          return;
        }

        if (r.right <= r.width && r.left >= 0) {
          return;
        }

        if (current === null) {
          this.collision.set('flipped');
        } else if (current === 'flipped') {
          this.collision.set('inner');
        }
      },
    });
  }

  siblings(): NfsMenuItem[] {
    return (this.parentSubmenu?.items ?? this.root?.items)?.() ?? [];
  }

  toggle(): void {
    if (this.expanded()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(focusFirst = this.mode() === 'drilldown'): void {
    if (!this.submenu()) {
      return;
    }

    // Drilldown and DropdownMenu show one path; AccordionMenu keeps multiOpen=true (Foundation default).
    if (this.mode() !== 'accordion') {
      this.siblings()
        .filter((s) => s !== this && s.expanded())
        .forEach((s) => s.close());
    }

    this.expanded.set(true);

    if (focusFirst) {
      const sub = this.submenu()!;
      // The toggle becomes invisible in drilldown mode, so focus must move into the new level.
      // preventScroll: mid-slide the level is still beside the wrapper, and focusing it
      // would scroll the `.is-drilldown { overflow: hidden }` wrapper sideways for good
      // (seen in all three engines before this flag). Foundation avoided it by focusing
      // after transitionend.
      const preventScroll = this.mode() === 'drilldown';
      afterNextRender(
        {
          write: () =>
            visibleFocusables(sub.element, true)
              .find((el) => !el.closest('.js-drilldown-back'))
              ?.focus({ preventScroll }),
        },
        { injector: this.#injector },
      );
    }
  }

  close(focusToggle = false): void {
    const sub = this.submenu();

    if (!sub || !this.expanded()) {
      return;
    }

    sub.items().forEach((child) => child.close());
    this.expanded.set(false);

    if (this.mode() === 'drilldown') {
      sub.startClosing();
    }

    if (focusToggle) {
      afterNextRender({ write: () => this.toggleButton()?.element.focus() }, { injector: this.#injector });
    }
  }
}

@Directive({
  selector: 'ul[nfsSubmenu]',
  host: {
    '[id]': 'id',
    '[class]': 'classes()',
    '[attr.inert]': 'item.expanded() ? null : ""',
    '(transitionend)': 'onTransitionEnd($event)',
  },
})
export class NfsSubmenu {
  readonly element: HTMLUListElement = inject(ElementRef).nativeElement;
  readonly item = inject(NfsMenuItem);
  readonly id = inject(_IdGenerator).getId('nfs-submenu-', true);
  readonly items = signal<NfsMenuItem[]>([]);
  readonly closing = signal(false);
  #fallback: ReturnType<typeof setTimeout> | undefined;

  readonly hasOpenChild = computed(() => this.items().some((i) => i.expanded()));

  readonly classes = computed(() => {
    const m = this.item.mode();

    if (!m) {
      return {};
    }

    const open = this.item.expanded();
    const shown = open || this.closing();
    const topLevel = this.item.parentSubmenu === null;

    return {
      submenu: true,
      [`is-${m}-submenu`]: true,
      // AccordionMenu: Foundation's open marker on the submenu.
      'is-active': (m === 'accordion' && open) || (m === 'drilldown' && shown),
      // Drilldown: Foundation's slide and visibility classes. A level with an open
      // child is hidden through `invisible` (visibility), never `inert`, because the
      // open child is its descendant and `inert` cannot be undone inside a subtree.
      'is-closing': m === 'drilldown' && this.closing(),
      visible: m === 'drilldown' && shown && !this.hasOpenChild(),
      invisible: m === 'drilldown' && (!shown || this.hasOpenChild()),
      'drilldown-submenu-cover-previous': m === 'drilldown',
      // DropdownMenu: Foundation's open class and first-level marker.
      'js-dropdown-active': m === 'dropdown' && open,
      'first-sub': m === 'dropdown' && topLevel,
    };
  });

  constructor() {
    this.item.submenu.set(this);
  }

  startClosing(): void {
    this.closing.set(true);
    clearTimeout(this.#fallback);
    // Fallback: $drilldown-transition (0.15s) plus 100 ms, per building-blocks 1.6 rule 1.
    this.#fallback = setTimeout(() => this.closing.set(false), 250);
  }

  onTransitionEnd(event: TransitionEvent): void {
    if (event.target === this.element && event.propertyName === 'transform') {
      clearTimeout(this.#fallback);
      this.closing.set(false);
    }
  }
}

@Directive({
  selector: 'button[nfsSubmenuToggle]',
  host: {
    type: 'button',
    '[attr.aria-expanded]': 'item.expanded()',
    '[attr.aria-controls]': 'item.submenu()?.id',
    '[class.submenu-toggle]': 'hybrid()',
    '(click)': 'item.toggle()',
  },
})
export class NfsSubmenuToggle {
  readonly element: HTMLButtonElement = inject(ElementRef).nativeElement;
  readonly item = inject(NfsMenuItem);
  /** Hybrid disclosure form: the item also has a navigating link before this button. */
  readonly hybrid = input(false, { transform: booleanAttribute });

  constructor() {
    this.item.toggleButton.set(this);
  }
}

// ------------------------------------------------------------ drilldown extras

@Directive({
  selector: 'li[nfsDrilldownBack]',
  host: {
    '[attr.hidden]': 'item.mode() === "drilldown" ? null : ""',
    '(click)': 'item.close(true)',
  },
})
export class NfsDrilldownBack {
  readonly item = inject(NfsSubmenu).item;
}

@Directive({
  selector: '[nfsDrilldownWrapper]',
  host: {
    '[class.is-drilldown]': 'active()',
    '[style.min-height.px]': 'active() ? minHeight() : null',
  },
})
export class NfsDrilldownWrapper {
  readonly drilldown = signal<NfsDrilldown | null>(null);
  readonly active = computed(() => this.drilldown()?.active() ?? false);
  readonly minHeight = signal<number | null>(null);
}

// ------------------------------------------------------------- root behaviours

function rootProvider(mode: NfsMenuMode) {
  return { provide: nfsMenuModeToken, useFactory: () => new NfsMenuRootState(mode) };
}

@Directive({
  selector: 'ul[nfsAccordionMenu]',
  providers: [rootProvider('accordion')],
  host: { '[class.accordion-menu]': 'active()', '(keydown)': 'onKeydown($event)' },
})
export class NfsAccordionMenu {
  readonly root = inject(nfsMenuModeToken, { self: true });
  readonly active = computed(() => this.root.mode() === 'accordion');

  constructor() {
    this.root.element = inject(ElementRef).nativeElement;
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.active()) {
      return;
    }

    const ctx = keyContext(event, this.root.element);

    if (!ctx) {
      return;
    }

    const { item, onToggle, target } = ctx;
    let handled = true;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        moveFocus(visibleFocusables(this.root.element), target, event.key === 'ArrowDown' ? 1 : -1);
        break;
      }
      case 'ArrowRight': {
        if (onToggle && !item.expanded()) {
          item.open();
        } else {
          handled = false;
        }

        break;
      }
      case 'ArrowLeft':
      case 'Escape': {
        if (onToggle && item.expanded() && event.key === 'ArrowLeft') {
          item.close();
        } else if (item.parentSubmenu) {
          item.parentSubmenu.item.close(true);
        } else {
          handled = false;
        }

        break;
      }
      default: {
        handled = false;
      }
    }

    // State first, preventDefault last (building-blocks 1.5).
    if (handled) {
      event.preventDefault();
    }
  }
}

@Directive({
  selector: 'ul[nfsDrilldown]',
  providers: [rootProvider('drilldown')],
  host: {
    '[class.drilldown]': 'active()',
    '[class.invisible]': 'active() && rootHasOpenChild()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NfsDrilldown {
  readonly root = inject(nfsMenuModeToken, { self: true });
  readonly active = computed(() => this.root.mode() === 'drilldown');
  readonly rootHasOpenChild = computed(() => this.root.items().some((i) => i.expanded()));
  readonly #wrapper = inject(NfsDrilldownWrapper, { optional: true });
  readonly #element: HTMLUListElement = inject(ElementRef).nativeElement;

  constructor() {
    this.root.element = this.#element;
    this.#wrapper?.drilldown.set(this);

    // Wrapper min-height = tallest level (Foundation _getMaxDims), measured after render.
    const measure = () => {
      if (!this.active()) {
        return null;
      }

      const levels = [this.#element, ...Array.from(this.#element.querySelectorAll<HTMLElement>('ul'))];

      return Math.ceil(Math.max(...levels.map((ul) => ul.getBoundingClientRect().height)));
    };

    afterRenderEffect({
      earlyRead: () => measure(),
      write: (height) => this.#wrapper?.minHeight.set(height()),
    });

    let observer: ResizeObserver | undefined;
    afterNextRender(() => {
      observer = new ResizeObserver(() => this.#wrapper?.minHeight.set(measure()));
      observer.observe(this.#element);
      this.#element.querySelectorAll('ul').forEach((ul) => observer!.observe(ul));
    });
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.active()) {
      return;
    }

    const backLi = (event.target as HTMLElement).closest('.js-drilldown-back');

    if (backLi) {
      this.#onBackKeydown(event, backLi);

      return;
    }

    const ctx = keyContext(event, this.root.element);

    if (!ctx) {
      return;
    }

    const { item, onToggle, target } = ctx;
    let handled = true;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        moveFocus(visibleFocusables(this.root.element), target, event.key === 'ArrowDown' ? 1 : -1);
        break;
      }
      case 'ArrowRight': {
        if (onToggle) {
          item.open(true);
        } else {
          handled = false;
        }

        break;
      }
      case 'ArrowLeft':
      case 'Escape': {
        if (item.parentSubmenu) {
          item.parentSubmenu.item.close(true);
        } else {
          handled = false;
        }

        break;
      }
      default: {
        handled = false;
      }
    }

    if (handled) {
      event.preventDefault();
    }
  }

  #onBackKeydown(event: KeyboardEvent, backLi: Element): void {
    const owner = itemOf.get(backLi.parentElement!.closest('li')!);

    if (event.key === 'Escape' || event.key === 'ArrowLeft') {
      owner?.close(true);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      moveFocus(visibleFocusables(this.root.element), event.target as HTMLElement, event.key === 'ArrowDown' ? 1 : -1);
    } else {
      return;
    }

    event.preventDefault();
  }
}

@Directive({
  selector: 'ul[nfsDropdownMenu]',
  providers: [rootProvider('dropdown')],
  host: {
    '[class.dropdown]': 'active()',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusout($event)',
  },
})
export class NfsDropdownMenu {
  readonly root = inject(nfsMenuModeToken, { self: true });
  readonly active = computed(() => this.root.mode() === 'dropdown');
  readonly #dir = inject(Directionality);

  constructor() {
    this.root.element = inject(ElementRef).nativeElement;
  }

  /**
   * Disclosure navigation, overlaying variant: moving focus out closes (APG). Applied per
   * item, not only per menu: a submenu closes when focus leaves its own li, so an overlaying
   * submenu (opens-inner drops it over its later siblings) never covers the next focused
   * control (WCAG 2.4.11).
   */
  onFocusout(event: FocusEvent): void {
    if (!this.active()) {
      return;
    }

    const next = event.relatedTarget as Node | null;
    const closeOutside = (items: NfsMenuItem[]) => {
      for (const item of items) {
        if (!item.expanded()) {
          continue;
        }

        if (!next || !item.element.contains(next)) {
          item.close();
        } else {
          closeOutside(item.submenu()?.items() ?? []);
        }
      }
    };
    closeOutside(this.root.items());
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.active()) {
      return;
    }

    const ctx = keyContext(event, this.root.element);

    if (!ctx) {
      return;
    }

    const { item, onToggle, target } = ctx;
    const topLevel = item.parentSubmenu === null;
    const horizontal = getComputedStyle(this.root.element).flexDirection !== 'column';
    const rtl = this.#dir.valueSignal() === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const levelFocusables = () => visibleFocusables(item.element.parentElement as HTMLElement, true);
    let handled = true;

    if (event.key === 'Escape') {
      if (onToggle && item.expanded()) {
        item.close(true);
      } else if (item.parentSubmenu) {
        item.parentSubmenu.item.close(true);
      } else {
        handled = false;
      }
    } else if (topLevel && horizontal && (event.key === forward || event.key === back)) {
      moveFocus(levelFocusables(), target, event.key === forward ? 1 : -1);
    } else if (topLevel && horizontal && event.key === 'ArrowDown') {
      if (onToggle) {
        item.open(true);
      } else {
        handled = false;
      }
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      moveFocus(levelFocusables(), target, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === forward && onToggle) {
      item.open(true);
    } else if (event.key === back && item.parentSubmenu) {
      item.parentSubmenu.item.close(true);
    } else {
      handled = false;
    }

    if (handled) {
      event.preventDefault();
    }
  }
}

/**
 * ResponsiveMenu: the three root behaviours are host directives on the same ul;
 * this directive's provider wins over theirs, so all three read one mode signal.
 */
@Directive({
  selector: 'ul[nfsResponsiveMenu]',
  hostDirectives: [NfsAccordionMenu, NfsDrilldown, NfsDropdownMenu],
  providers: [rootProvider('accordion')],
})
export class NfsResponsiveMenu {
  readonly rules = input.required<string>({ alias: 'nfsResponsiveMenu' });
  /** PROTOTYPE switch: `false` disables the focus-continuity fixup to observe raw engine behaviour. */
  readonly focusFixup = input(true, { transform: booleanAttribute });
  readonly root = inject(nfsMenuModeToken, { self: true });
  readonly #bp = inject(BreakpointSim);
  readonly #document = inject(DOCUMENT);
  readonly mode = computed(() => resolveMode(parseRules(this.rules()), this.#bp.current()));

  constructor() {
    this.root.drive(this.mode);

    let previous: NfsMenuMode | undefined;
    effect(() => {
      const mode = this.mode();
      const before = previous;
      previous = mode;

      if (before === undefined || before === mode || !this.focusFixup()) {
        return;
      }

      untracked(() => this.#onModeSwap(mode));
    });
  }

  /**
   * Keep focus on the same control across a swap: the open path becomes the chain of
   * submenus that contains the focused control. Drilldown also closes the focused
   * toggle's own submenu, because an open submenu hides its toggle in drilldown mode.
   */
  #onModeSwap(mode: NfsMenuMode): void {
    if (mode === 'accordion') {
      return;
    }

    const rootEl = this.root.element;
    const focused = this.#document.activeElement;
    const focusInside = !!focused && rootEl.contains(focused);
    const all = Array.from(rootEl.querySelectorAll('li'))
      .map((li) => itemOf.get(li))
      .filter((i): i is NfsMenuItem => !!i);

    for (const item of all) {
      const sub = item.submenu();

      if (!sub || !item.expanded()) {
        continue;
      }

      let keep: boolean;

      if (focusInside) {
        const onPath = sub.element.contains(focused);
        const ownToggleFocused = item.toggleButton()?.element === focused;
        keep = onPath || (mode === 'dropdown' && ownToggleFocused);
      } else {
        // No focus inside: keep the first open submenu per level.
        keep = item.siblings().find((s) => s.expanded()) === item;
      }

      if (!keep) {
        item.expanded.set(false);
        sub.items().forEach((c) => c.expanded.set(false));
      }
    }
  }
}

// ------------------------------------------------------------------- helpers

function keyContext(event: KeyboardEvent, root: HTMLElement) {
  const target = event.target as HTMLElement;
  const li = target.closest('li');
  const item = li && root.contains(li) ? itemOf.get(li) : undefined;

  if (!item) {
    return null;
  }

  return { item, target, onToggle: item.toggleButton()?.element === target };
}

/** Focusable controls that are rendered, visible, and not inert (DOM order). */
export function visibleFocusables(container: HTMLElement, directOnly = false): HTMLElement[] {
  const all = Array.from(container.querySelectorAll<HTMLElement>('a[href], button'));

  return all.filter((el) => {
    if (el.closest('[inert], [hidden]') || el.getClientRects().length === 0) {
      return false;
    }

    if (getComputedStyle(el).visibility === 'hidden') {
      return false;
    }

    // directOnly: controls of this level, not of nested levels.
    return !directOnly || el.closest('ul') === container;
  });
}

function moveFocus(list: HTMLElement[], from: HTMLElement, step: 1 | -1): void {
  const index = list.indexOf(from);
  const next = list[index + step];
  next?.focus();
}

export const NESTED_MENU = [
  NfsMenuItem,
  NfsSubmenu,
  NfsSubmenuToggle,
  NfsDrilldownBack,
  NfsDrilldownWrapper,
  NfsAccordionMenu,
  NfsDrilldown,
  NfsDropdownMenu,
  NfsResponsiveMenu,
] as const;
