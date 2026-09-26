// PROTOTYPE (throwaway) -- Nested menu directive family, copied from
// "Prototype: Nested menu directive family with breakpoint mode switching" and amended as
// ADR 0035 describes, answering "Prototype: ResponsiveMenu swap committed in the Nested
// menu root's render callback". Changes from the copied prototype:
// - NfsMenuRoot keeps the displayed mode apart from the driven one; one afterRenderEffect
//   plans a swap in earlyRead (driven mode, document.activeElement, DOM order) and commits
//   it in write (displayed mode plus pruning), with the back-item refocus in an
//   afterNextRender registered by write. `?commit=old` switches to the Nested menu spec as
//   written (mode follows the driven function; pruning in a later afterRenderEffect).
// - Completion outputs (opened/closed) on items and roots, emitted by the live root only.
// - A static `is-active` on a submenu seeds its item's `expanded`.
// - Dropdown mode closes on a document `focusin` outside (Light dismiss), not root focusout.
// - NfsResponsiveMenu starts from the Server breakpoint's mode until its first render
//   callback (`?start=current` switches to the Breakpoint service's handoff).
// Not library code: no dev-mode warnings, no defaults tokens, no hover, no Light dismiss
// registry, no transitionend-based completion (fallback timers only).
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  HostAttributeToken,
  inject,
  InjectionToken,
  Injector,
  input,
  linkedSignal,
  model,
  NgZone,
  output,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { NfsMediaQuery, parseNfsBreakpointRules } from '../media-query';
import { describe, menuSnapshot, nfsLog, protoSwitches } from '../instrument';

export type NfsMenuMode = 'accordion' | 'drilldown' | 'dropdown';

interface NfsMenuCompletion {
  opened?: (item: NfsMenuItem) => void;
  closed?: (item: NfsMenuItem) => void;
}

interface SwapPlan {
  from: NfsMenuMode;
  to: NfsMenuMode;
  close: NfsMenuItem[];
  focusBefore: string;
  focusInside: boolean;
  /** The drilldown level whose back item held focus when leaving drilldown. */
  backLevel: HTMLElement | null;
}

/** The menu root's shared state (the spec's NfsMenuRoot), created by a factory on the root ul. */
export class NfsMenuRoot {
  readonly element: HTMLUListElement = inject(ElementRef).nativeElement;
  readonly items = signal<NfsMenuItem[]>([]);
  readonly #document = inject(DOCUMENT);
  readonly #injector = inject(Injector);
  readonly #switches = inject(protoSwitches);
  readonly #slots: Partial<Record<NfsMenuMode, NfsMenuCompletion>> = {};
  /** The driven mode: the factory's mode, or the function passed to drive(). */
  readonly #driven = signal<() => NfsMenuMode>(() => 'accordion');
  /**
   * The displayed mode (ADR 0035): takes the driven function's value on its first read
   * and afterwards changes only in the swap callback's write phase.
   */
  readonly #displayed = linkedSignal<() => NfsMenuMode, NfsMenuMode>({
    source: this.#driven,
    computation: (fn) => untracked(fn),
  });
  readonly mode: Signal<NfsMenuMode>;

  constructor(initial: NfsMenuMode) {
    this.#driven.set(() => initial);

    if (this.#switches.commit === 'old') {
      this.mode = computed(() => this.#driven()());
      this.#oldSwapRule();
    } else {
      this.mode = this.#displayed.asReadonly();
      this.#swapCallback();
    }
  }

  drive(mode: () => NfsMenuMode): void {
    this.#driven.set(mode);
  }

  configure(mode: NfsMenuMode, completion: NfsMenuCompletion): void {
    this.#slots[mode] = completion;
  }

  /** Only the live mode's root emits (one slot per mode). */
  complete(kind: 'opened' | 'closed', item: NfsMenuItem): void {
    this.#slots[this.mode()]?.[kind]?.(item);
  }

  /** ADR 0035: plan under the old classes in earlyRead, commit mode and pruning together in write. */
  #swapCallback(): void {
    afterRenderEffect({
      earlyRead: () => {
        const requested = this.#driven()();
        const shown = this.#displayed();

        if (requested === shown) {
          return null;
        }

        return untracked(() => this.#plan(shown, requested));
      },
      write: (plan) => {
        const p = plan();

        if (p) {
          untracked(() => this.#apply(p, true));
        }
      },
    });
  }

  /** CONTROL: the Nested menu spec as written; the mode already rendered, prune in a later callback. */
  #oldSwapRule(): void {
    let last: NfsMenuMode | undefined;
    afterRenderEffect({
      earlyRead: () => {
        const m = this.mode();

        if (last === undefined || m === last) {
          last = m;

          return null;
        }

        const from = last;
        last = m;

        return untracked(() => this.#plan(from, m));
      },
      write: (plan) => {
        const p = plan();

        if (p) {
          untracked(() => this.#apply(p, false));
        }
      },
    });
  }

  #plan(from: NfsMenuMode, to: NfsMenuMode): SwapPlan {
    const active = this.#document.activeElement;
    const focusInside = !!active && active !== this.#document.body && this.element.contains(active);
    // DOM order: querySelectorAll returns document order.
    const open = Array.from(this.element.querySelectorAll('li'))
      .map((li) => itemOf.get(li))
      .filter((i): i is NfsMenuItem => !!i && i.expanded() && i.submenu() !== null);
    const close = new Set<NfsMenuItem>();

    if (to !== 'accordion') {
      if (focusInside) {
        for (const item of open) {
          const onPath = item.element.contains(active);
          const ownToggle = item.toggleButton()?.element === active;
          // 'row' variant: any control of the item's own row (toggle or hybrid link).
          const ownRow = onPath && !item.submenu()!.element.contains(active);
          const hiddenByLevel = to === 'drilldown' && (this.#switches.rule === 'row' ? ownRow : ownToggle);

          if (!onPath || hiddenByLevel) {
            close.add(item);
          }
        }
      } else if (to === 'drilldown') {
        for (const item of open) {
          const first = item
            .siblings()
            .filter((s) => s.expanded())
            .sort(domOrder)[0];

          if (first !== item) {
            close.add(item);
          }
        }
      } else {
        open.forEach((i) => close.add(i));
      }
    }

    // Closing an item closes the open submenus inside it.
    for (const item of [...close]) {
      open.filter((o) => item.submenu()!.element.contains(o.element)).forEach((o) => close.add(o));
    }

    const back = focusInside && from === 'drilldown' && to !== 'drilldown' ? active!.closest('.js-drilldown-back') : null;
    const plan: SwapPlan = {
      from,
      to,
      close: [...close],
      focusBefore: describe(active),
      focusInside,
      backLevel: back ? (back.closest('ul[nfssubmenu]') as HTMLElement | null) : null,
    };
    nfsLog({
      kind: 'swap-plan',
      from,
      to,
      closing: plan.close.map((i) => i.label()),
      focusBefore: plan.focusBefore,
      shown: menuSnapshot(this.element),
    });

    return plan;
  }

  #apply(p: SwapPlan, setDisplayed: boolean): void {
    if (setDisplayed) {
      this.#displayed.set(p.to);
    }

    for (const item of p.close) {
      item.expanded.set(false);
    }

    nfsLog({ kind: 'swap-commit', from: p.from, to: p.to, closing: p.close.map((i) => i.label()) });

    if (p.backLevel) {
      const level = p.backLevel;
      afterNextRender(
        {
          earlyRead: () => visibleFocusables(level, true).find((el) => !el.closest('.js-drilldown-back')) ?? null,
          write: (target) => {
            target?.focus({ preventScroll: true });
            nfsLog({ kind: 'refocus', to: describe(target), focus: describe(this.#document.activeElement) });
          },
        },
        { injector: this.#injector },
      );
    }

    afterNextRender(
      {
        read: () =>
          nfsLog({
            kind: 'swap-rendered',
            to: p.to,
            focusAfter: describe(this.#document.activeElement),
            shown: menuSnapshot(this.element),
          }),
      },
      { injector: this.#injector },
    );
  }
}

export const nfsMenuModeToken = new InjectionToken<NfsMenuRoot>('nfsMenuModeToken');

// ponytail: element -> directive lookup for DOM-first key handling and the swap plan; the
// spec uses parent-owned registration (building-blocks 1.9) instead.
const itemOf = new WeakMap<Element, NfsMenuItem>();

function domOrder(a: NfsMenuItem, b: NfsMenuItem): number {
  return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/** Longest transition (duration plus delay) on `prop` or `all`, in ms. */
function transitionMs(el: Element, prop: string): number {
  const s = getComputedStyle(el);
  const toMs = (d: string) => parseFloat(d) * (d.trim().endsWith('ms') ? 1 : 1000);
  const props = s.transitionProperty.split(',').map((p) => p.trim());
  const durations = s.transitionDuration.split(',').map(toMs);
  const delays = s.transitionDelay.split(',').map(toMs);

  return Math.max(
    0,
    ...props.map((p, i) =>
      p === prop || p === 'all' ? durations[i % durations.length] + delays[i % delays.length] : 0,
    ),
  );
}

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
  readonly opened = output<void>();
  readonly closed = output<void>();
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
      'has-submenu-toggle': isParent && this.hybrid(),
      // Custom state class for the li-level grid (copied prototype; see _nested-menu.scss).
      'is-expanded': m === 'accordion' && isParent && this.expanded(),
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

    // Collision check after open: measure in earlyRead, flip in write.
    afterRenderEffect({
      earlyRead: () => {
        const sub = this.submenu();
        this.collision();

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

        this.collision.set(current === null ? 'flipped' : 'inner');
      },
    });

    // Completion: opened/closed once per change of `expanded`, in the mode live at the time,
    // never for the first-paint state. Dropdown completes in this render callback; accordion
    // and drilldown after their measured transition.
    let last: boolean | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const zone = inject(NgZone);
    afterRenderEffect({
      read: () => {
        const open = this.expanded();
        const m = this.mode();

        if (!this.submenu() || m === null) {
          return;
        }

        if (last === undefined || open === last) {
          last = open;

          return;
        }

        last = open;
        untracked(() => {
          clearTimeout(timer);
          const kind = open ? 'opened' : 'closed';
          const done = () => {
            nfsLog({ kind: 'completion', output: kind, item: this.label(), mode: this.mode() });
            (open ? this.opened : this.closed).emit();
            this.root?.complete(kind, this);
          };
          const ms =
            m === 'accordion'
              ? transitionMs(this.element, 'grid-template-rows')
              : m === 'drilldown'
                ? transitionMs(this.submenu()!.element, 'transform')
                : 0;

          if (ms === 0) {
            done();
          } else {
            // ponytail: fallback timer only (duration + 100 ms); the spec also listens for transitionend.
            timer = zone.runOutsideAngular(() => setTimeout(done, ms + 100));
          }
        });
      },
    });
  }

  label(): string {
    return (this.toggleButton()?.element.textContent ?? this.element.textContent ?? '').trim().replace(/\s+/g, ' ');
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

    if (this.mode() !== 'accordion') {
      this.siblings()
        .filter((s) => s !== this && s.expanded())
        .forEach((s) => s.close());
    }

    this.expanded.set(true);

    if (focusFirst) {
      const sub = this.submenu()!;
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
      'is-active': (m === 'accordion' && open) || (m === 'drilldown' && shown),
      'is-closing': m === 'drilldown' && this.closing(),
      visible: m === 'drilldown' && shown && !this.hasOpenChild(),
      invisible: m === 'drilldown' && (!shown || this.hasOpenChild()),
      'drilldown-submenu-cover-previous': m === 'drilldown',
      'js-dropdown-active': m === 'dropdown' && open,
      'first-sub': m === 'dropdown' && topLevel,
    };
  });

  constructor() {
    this.item.submenu.set(this);
    // Foundation's pre-open marker seeds the item (Nested menu spec, `expanded` row).
    const staticClass = inject(new HostAttributeToken('class'), { optional: true });

    if (staticClass?.split(/\s+/).includes('is-active')) {
      this.item.expanded.set(true);
    }
  }

  startClosing(): void {
    this.closing.set(true);
    clearTimeout(this.#fallback);
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
  return { provide: nfsMenuModeToken, useFactory: () => new NfsMenuRoot(mode) };
}

@Directive({
  selector: 'ul[nfsAccordionMenu]',
  exportAs: 'nfsAccordionMenu',
  providers: [rootProvider('accordion')],
  host: { '[class.accordion-menu]': 'active()', '(keydown)': 'onKeydown($event)' },
})
export class NfsAccordionMenu {
  readonly root = inject(nfsMenuModeToken, { self: true });
  readonly active = computed(() => this.root.mode() === 'accordion');
  readonly opened = output<NfsMenuItem>();
  readonly closed = output<NfsMenuItem>();

  constructor() {
    this.root.configure('accordion', { opened: (i) => this.opened.emit(i), closed: (i) => this.closed.emit(i) });
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

    if (handled) {
      event.preventDefault();
    }
  }
}

@Directive({
  selector: 'ul[nfsDrilldown]',
  exportAs: 'nfsDrilldown',
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
  readonly opened = output<NfsMenuItem>();
  readonly closed = output<NfsMenuItem>();
  readonly #wrapper = inject(NfsDrilldownWrapper, { optional: true });
  readonly #element: HTMLUListElement = inject(ElementRef).nativeElement;

  constructor() {
    this.root.configure('drilldown', { opened: (i) => this.opened.emit(i), closed: (i) => this.closed.emit(i) });
    this.#wrapper?.drilldown.set(this);

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
      const owner = itemOf.get(backLi.parentElement!.closest('li')!);

      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        owner?.close(true);
        event.preventDefault();
      }

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
}

@Directive({
  selector: 'ul[nfsDropdownMenu]',
  exportAs: 'nfsDropdownMenu',
  providers: [rootProvider('dropdown')],
  host: {
    '[class.dropdown]': 'active()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NfsDropdownMenu {
  readonly root = inject(nfsMenuModeToken, { self: true });
  readonly active = computed(() => this.root.mode() === 'dropdown');
  readonly opened = output<NfsMenuItem>();
  readonly closed = output<NfsMenuItem>();
  readonly #dir = inject(Directionality);

  constructor() {
    this.root.configure('dropdown', { opened: (i) => this.opened.emit(i), closed: (i) => this.closed.emit(i) });
    // Light dismiss focus rule (Anchored pane spec, registry rule 4): a document focusin
    // outside an open submenu closes it and its descendants, nothing above it.
    // ponytail: always attached on the client and gated on the live mode; the spec's
    // registry attaches its listener only while an entry is open.
    const doc = inject(DOCUMENT);
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onFocusin = (event: FocusEvent) => {
        if (!this.active() || event.target !== doc.activeElement) {
          return;
        }

        const next = event.target as Node;
        const closeOutside = (items: NfsMenuItem[]) => {
          for (const item of items) {
            if (!item.expanded()) {
              continue;
            }

            if (!item.element.contains(next)) {
              item.close();
            } else {
              closeOutside(item.submenu()?.items() ?? []);
            }
          }
        };
        closeOutside(this.root.items());
      };
      zone.runOutsideAngular(() => doc.addEventListener('focusin', onFocusin));
      destroyRef.onDestroy(() => doc.removeEventListener('focusin', onFocusin));
    });
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

const MODES = ['dropdown', 'drilldown', 'accordion'] as const;

/**
 * ResponsiveMenu: the three root behaviours are host directives on the same ul; this
 * directive's provider wins, so all three and every item read one NfsMenuRoot.
 */
@Directive({
  selector: 'ul[nfsResponsiveMenu]',
  exportAs: 'nfsResponsiveMenu',
  hostDirectives: [
    { directive: NfsAccordionMenu, outputs: ['opened', 'closed'] },
    { directive: NfsDrilldown, outputs: ['opened', 'closed'] },
    { directive: NfsDropdownMenu, outputs: ['opened', 'closed'] },
  ],
  providers: [rootProvider('accordion')],
})
export class NfsResponsiveMenu {
  readonly rules = input.required<string>({ alias: 'nfsResponsiveMenu' });
  readonly #root = inject(nfsMenuModeToken, { self: true });
  readonly #mq = inject(NfsMediaQuery);
  readonly #start = inject(protoSwitches).start;
  /** First-render flag: set in this instance's first render callback, client only. */
  readonly #rendered = signal(false);
  readonly #parsed = computed(() => parseNfsBreakpointRules(this.rules(), MODES, this.#mq.breakpoints));
  /** Requested mode: at the Server breakpoint until the first render callback, then at the live one. */
  readonly requested = computed<NfsMenuMode>(() => {
    const parsed = this.#parsed();
    const live = this.#rendered() || this.#start === 'current';
    const mode = live ? this.#mq.resolve(parsed) : this.#mq.resolve(parsed, this.#mq.serverBreakpoint);

    return mode ?? this.#mq.breakpoints.map((bp) => parsed[bp]).find((m) => m !== undefined) ?? 'accordion';
  });
  /** The displayed Menu mode. */
  readonly mode = this.#root.mode;

  constructor() {
    this.#root.drive(() => this.requested());
    afterNextRender({
      write: () => {
        this.#rendered.set(true);
        nfsLog({ kind: 'flag', requested: untracked(this.requested), shown: untracked(this.mode) });
      },
    });
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

    return !directOnly || el.closest('ul') === container;
  });
}

function moveFocus(list: HTMLElement[], from: HTMLElement, step: 1 | -1): void {
  const index = list.indexOf(from);
  list[index + step]?.focus();
}

export const NESTED_MENU = [
  NfsMenuItem,
  NfsSubmenu,
  NfsSubmenuToggle,
  NfsDrilldownBack,
  NfsDrilldownWrapper,
  NfsResponsiveMenu,
] as const;
