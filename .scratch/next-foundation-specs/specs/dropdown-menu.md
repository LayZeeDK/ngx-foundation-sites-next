# Spec: Dropdown Menu

Ticket: [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA. Built on the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), whose API it uses as defined there.

## Problem Statement

A developer building an Angular application on Foundation for Sites wants Foundation's Dropdown Menu: a horizontal or vertical `ul.dropdown.menu` of site navigation whose nested lists open as overlaying submenus on hover or click, level after level, flipping to the other side near the edge of the page, often inside a Top Bar. Foundation does this with the DropdownMenu jQuery plugin over its Nest utility. That design leaves the developer with problems an Angular library must not copy:

- Nest stamps `role="menubar"` on the root and on every submenu, `role="menuitem"` on every link, and `role="none"` on every item, and gives parent links `aria-haspopup="true"` and a copied `aria-label`, but the plugin never sets `aria-expanded` anywhere. Screen reader users are promised menubar keyboard behaviour (one tab stop, roving focus, typeahead) that does not exist, and they cannot tell whether a submenu is open.
- A parent item is an `<a href="#">` that opens its submenu, so a parent that should also navigate cannot, and the `forceFollow` and `clickOpen` Options exist only to guess what a tap on such a link meant.
- On a desktop browser, clicking a parent does nothing unless `clickOpen` is on (Foundation's default is off): hover is the only pointer way to open a submenu. On any device with a touch screen, `disableHoverOnTouch` turns hover off for the whole device, even when the user holds a mouse.
- Submenus never close when focus moves on, so a submenu opened with the keyboard stays over the next control the user tabs to. Escape closes every submenu and throws focus to the first top-level link. Hover-opened submenus close after `closingTime` only because of a timer, and nothing closes them from the keyboard while focus is elsewhere.
- Outside clicks close submenus through a body handler plus the Touch utility's synthetic `tap`; the collision check measures a submenu after showing it invisibly; the `verticalClass` and `rightClass` Options exist only to name classes that are already Foundation's contract.
- In a right-aligned or right-to-left menu, the plugin reverses the arrow keys even along the top level, where the items still run left to right on screen.
- With Foundation's default `$dropdownmenu-min-width` of 200 px, a submenu opened from a narrow item near the middle of a 320 CSS px page fits neither side and scrolls the page sideways (WCAG 1.4.10), and inside Foundation's default Top Bar every link and parent is 3.76:1 against the bar (WCAG 1.4.3).

A server-rendered Angular application adds more: the classes, `aria-expanded`, and closed state visible at first paint must be in the server HTML; nothing may be measured before hydration; a click or key press before hydration must still work once the page hydrates; and a hover before hydration must never open a submenu late.

## Solution

One attribute directive, `nfsDropdownMenu`, on the `ul.dropdown.menu` the developer already writes, plus the Nested menu's item, submenu, and toggle directives on its `li`, nested `ul`, and parent buttons. The root provides the Nested menu root in Menu mode `dropdown`, binds Foundation's `.dropdown` class, forwards the menu's key presses and clicks to the Nested menu, and hands Foundation's seven behaviour Options to it: `alignment`, `disableHover`, `hoverDelay`, `closingTime`, `autoclose`, `closeOnClick`, and `closeOnClickInside`, with Foundation's names and defaults and an application-wide Defaults token. It re-emits every submenu's Completion outputs as its own `opened` and `closed`, carrying the item, and offers `collapseAll()`.

From there the Nested menu does the work: Foundation's `is-dropdown-submenu-parent`, `is-dropdown-submenu`, `is-submenu-item`, `first-sub`, `js-dropdown-active`, `is-active`, and `opens-left`/`opens-right`/`opens-inner` classes as host bindings in the server HTML; disclosure navigation (native lists, `<button aria-expanded aria-controls>` parents, a link plus a toggle for a Hybrid item, `aria-current="page"` on the current link, no menu roles); `inert` on closed submenus; hover opening through the Anchored pane utility's hover intent with the item as the Hover region and touch pointers ignored per event; Light dismiss per open submenu on Escape from anywhere, on focus leaving, and, with `closeOnClick`, on an outside press; the collision flip measured against Foundation's body box after a submenu opens; and Foundation's arrow keys as optional shortcuts beside Tab, Enter, and Space.

The Dropdown Menu has no animation, as Foundation has none: submenus appear and disappear through Foundation's `display` rule on `.js-dropdown-active`. Its Library mixin, `nfs-dropdown-menu`, styles the parent buttons with Foundation's own settings and arrow geometry, and checks at compile time the settings that WCAG 2.2 AA depends on: the arrow and toggle contrast and size, a submenu width that fits a 320 CSS px page, and the text contrast inside a Top Bar.

## User Stories

1. As an application developer, I want to add `nfsDropdownMenu` to Foundation's `ul.dropdown.menu` markup and the Nested menu directives to its items, so that my Foundation Dropdown Menu works without jQuery and looks exactly as Foundation's docs show.
2. As an application developer, I want horizontal and vertical Dropdown Menus, and Foundation's `.medium-horizontal`-style orientation classes, to keep working, so that one markup serves every layout.
3. As an application developer, I want as many levels of submenus as I nest, so that deep navigation keeps working.
4. As an application developer, I want a parent item to be a button that opens its submenu, so that it is announced and operated as a control.
5. As an application developer, I want a parent that both navigates and opens a submenu, as a link plus a separate toggle, so that section landing pages stay reachable without `forceFollow` guesswork.
6. As an application developer, I want `alignment`, `disableHover`, `hoverDelay`, `closingTime`, `autoclose`, `closeOnClick`, and `closeOnClickInside` with Foundation's names and defaults, so that my existing `data-*` values carry over as attributes.
7. As an application developer, I want application-wide defaults for those Options through a Defaults token, so that I set `hoverDelay` or `closeOnClick` once.
8. As an application developer, I want `opened` and `closed` outputs on the menu that tell me which item's submenu changed, so that I can react to any submenu without binding every item.
9. As an application developer, I want `collapseAll()` on the menu and `open()`, `close()`, `toggle()`, and a two-way `expanded` on each item, so that I can drive the menu from my own code.
10. As an application developer, I want Foundation's `align-right` class and `.top-bar-right` placement to make submenus open to the left, as Foundation's `alignment: 'auto'` does, so that a right-aligned menu keeps its submenus on screen.
11. As an application developer, I want a development warning when the menu sits in a `.top-bar-right` without a server-known alignment, so that my server HTML already carries the side the submenus open to.
12. As an application developer of a responsive menu, I want the same Options to work when the Dropdown Menu is one mode of a ResponsiveMenu, with `closeOnClick` keeping each mode's own default, so that one markup serves every breakpoint.
13. As a mouse user, I want a submenu to open after a short delay when I point at its parent and stay open while I move into it, so that the menu feels like Foundation's.
14. As a mouse user, I want a hover-opened submenu to close a moment after my pointer leaves it, unless I clicked it open or `autoclose` is off, so that menus get out of my way without flickering.
15. As a mouse user, I want a click on a parent that my hover already opened to keep it open, and a second click to close it, so that hovering then clicking does not close what I just saw.
16. As a mouse user of a menu with `disableHover`, I want submenus to open only on click, so that pointing never opens anything.
17. As a user on a laptop with a touch screen, I want hover opening with the mouse and tap-to-toggle with my finger, so that neither input breaks the other.
18. As a user on a touch device, I want scrolling the page with a finger never to close an open submenu, so that I can scroll while it is open.
19. As a user, I want a click or tap outside an open submenu to close it while `closeOnClick` is on, so that I can dismiss it without hunting for a control.
20. As a user, I want a click on a leaf link inside a submenu to close the menu while `closeOnClickInside` is on, so that the menu is out of the way once I pick a page.
21. As a user, I want opening one submenu to close its open sibling, so that only one Open path covers the page, as in Foundation.
22. As a user near the edge of the screen, I want a submenu that would overflow to open on the other side, or inside its parent, so that it stays on screen.
23. As a user at 320 CSS px width or 400 percent zoom, I want every submenu to fit the page, so that I never scroll sideways (WCAG 1.4.10).
24. As a keyboard user, I want every link and button of the open parts of the menu in the tab sequence, so that I can reach everything with Tab alone.
25. As a keyboard user, I want Enter and Space on a parent button to open and close its submenu, so that the menu works like any disclosure.
26. As a keyboard user, I want Foundation's arrow keys to move along the top level and to open and close submenus, so that I can move quickly without leaving the menu.
27. As a keyboard user in a menu whose submenus open to the left, I want the Left key to open a nested submenu and the Right key to close it, so that the keys point where the submenus appear.
28. As a keyboard user, I want Escape to close the submenu I am in and put focus on its button, so that I can back out one level at a time.
29. As a keyboard user, I want a submenu to close when I tab out of it, so that it never covers the control I move to (WCAG 2.4.11).
30. As a user who opened a submenu by hovering, I want Escape to close it without moving the pointer or focus, so that it stops covering content (WCAG 1.4.13).
31. As a user of a right-to-left page, I want submenus to open to the left and the arrow keys along the top level to follow the reading direction, so that the menu is natural.
32. As a screen reader user, I want native lists and buttons with `aria-expanded` and `aria-controls`, so that I hear the hierarchy and whether each submenu is open.
33. As a screen reader user, I want no menubar or menu roles, so that I am not promised keyboard behaviour the navigation does not have.
34. As a screen reader user, I want the current page's link marked with `aria-current="page"`, so that I know where I am.
35. As a screen reader user, I want closed submenus out of the accessibility tree, so that I only read what is shown.
36. As a low-vision user, I want every arrow to reach 3:1 and every text 4.5:1 against its background, in a Top Bar too, so that I can see the menu and its state.
37. As a user with limited dexterity, I want every parent and toggle at least 24 by 24 CSS px, so that I can hit it.
38. As a developer of a server-rendered application, I want the menu's classes, `aria-expanded`, `inert`, and submenu sides in the server HTML, so that the first paint is the real menu and hydration changes nothing.
39. As a developer of a server-rendered application, I want a click or key press on the menu before hydration to take effect once the page hydrates, and a hover before hydration to do nothing, so that early interaction is never lost or replayed stale.
40. As a developer using incremental hydration, I want to know how click and hover behave inside a dehydrated `@defer` block, so that I choose the right hydrate trigger.
41. As a developer of a zoneless application, I want the menu to need no zone and pointer movement never to run change detection, so that it is cheap.
42. As a developer who themes the menu, I want every library rule to reuse my Foundation settings, and the compile to stop or warn when my settings break WCAG 2.2 AA, so that I cannot ship an inaccessible menu by accident.
43. As a library maintainer, I want the root's Options, outputs, alignment rules, mixin rules, and rendering modes asserted in stories, browser-level tests, a server-render smoke test, and three-engine e2e tests, so that a regression shows at the layer that owns it.

## Implementation Decisions

### Foundation contract

Taken from `DropdownMenu.defaults` in Foundation 6.9's plugin source (12 Options, none of them on Foundation's docs page) and the menus inventory. The item, submenu, and toggle behaviour Foundation shares with AccordionMenu and Drilldown (Nest's classes, open state, keys, the collision flip) is the Nested menu's; this table maps each Foundation piece to where it lands.

| Foundation feature | What it does in 6.9 | Library counterpart |
| --- | --- | --- |
| `alignment` (`'auto'`) | `'auto'` becomes `'right'` when the root has `rightClass`, the document is RTL, or the root is inside `.top-bar-right`, else `'left'`; `'right'` gives every parent `opens-left`, `'left'` gives `opens-right` | `alignment` input, same values and default; the Nested menu root's base-side rule (`align-right` read from the static class, RTL from CDK `Directionality`, `.top-bar-right` after hydration) |
| `disableHover` (`false`) | Do not open on `mouseenter` | `disableHover` input: hover intent's `enabled` is dropdown mode and not `disableHover` |
| `disableHoverOnTouch` (`true`) | Force `disableHover` on any touch-capable browser | Dropped option: hover intent ignores `pointerType: 'touch'` per event |
| `autoclose` (`true`) | Close a hover-opened submenu `closingTime` after `mouseleave`, unless it was click-opened with `clickOpen` | `autoclose` input, same rule (a click-opened submenu never closes on leave, since clicking always opens) |
| `hoverDelay` (`50`) | Delay before hover opens | `hoverDelay` input, hover intent's `openDelay` |
| `clickOpen` (`false`) | Bind click and `touchstart` toggling (always on for touch browsers); without it a desktop click on a parent follows its `href` | Dropped option: a parent is a button, so a click always toggles |
| `closingTime` (`500`) | Delay before `mouseleave` closes | `closingTime` input, hover intent's `closeDelay` (floored at 100 ms by hover intent) |
| `closeOnClick` (`true`) | Body `click`/`tap` outside the menu closes everything; also gates a second click on an open parent closing it | `closeOnClick` input, Light dismiss's pointer rule per open submenu (both `pointerdown` and `pointerup` outside); a second click on a parent always closes it |
| `closeOnClickInside` (`true`) | A click on a leaf item closes every submenu | `closeOnClickInside` input, the Nested menu root's `handleClick` leaf rule through the root's `click` listener |
| `verticalClass` (`'vertical'`) | Class added to every submenu under a top-level item | Dropped option (class-name Option): consumer-written; Foundation's docs markup needs no class, because `.is-dropdown-submenu > li { width: 100% }` stacks the items |
| `rightClass` (`'align-right'`) | Class that makes `'auto'` resolve to `'right'` | Dropped option (class-name Option): Foundation's `align-right` is read; another class uses `alignment="right"` |
| `forceFollow` (`true`) | On touch, a second tap on an open parent link follows it | Dropped option: the Hybrid item's link navigates, its toggle toggles |
| `data-options` | Inline option string | Dropped option |
| `show.zf.dropdownMenu` `[$sub]` | Fired when a submenu is shown, collision already resolved | `opened` Completion output with the `NfsMenuItem` |
| `hide.zf.dropdownMenu` `[$toClose]` | Fired once when one or all submenus close | `closed` Completion output with the `NfsMenuItem`, once per closed submenu |
| `init.zf.dropdown-menu`, `destroyed.zf.dropdown-menu` | Lifecycle events | None (Angular lifecycle) |
| `destroy()` | Unbind, remove classes, `Nest.Burn` | Angular lifecycle; nothing to remove, the classes are bindings |
| `_show($sub)`, `_hide($elem)`, `_hide()` (private) | Open one submenu closing its siblings; close one; close all | Item `open()`, `close()` (Nested menu); root `collapseAll()` |
| Nest `Feather(menu, 'dropdown')` | Roles, `aria-haspopup`, copied `aria-label`, Nest classes | Nested menu host class bindings; no roles, no `aria-haspopup`, no `aria-label` copies |
| `first-sub`, `js-dropdown-active`, `is-active` on the open parent, `opens-*` flips via `Box.ImNotTouchingYou` | Classes and collision | Nested menu, dropdown mode: the same classes from state; collision through the Anchored pane utility's `nfsDocumentRect`, `nfsBodyBounds`, and horizontal `nfsOverlap` |
| `data-is-click` | Tells a click-opened submenu from a hover-opened one | Nested menu toggle rule: a pointer click on a hover-opened submenu keeps it open and marks it click-opened |
| `Keyboard.register('DropdownMenu', ...)` with `_isVertical()` and `_isRtl()` | Arrow keys per orientation and side; Enter and Space open and focus; Escape closes all | The Nested menu's dropdown key table, one root `keydown` listener (ARIA and keyboard, with this spec's one amendment) |
| `mouseenter`/`mouseleave` timers, `ignoreMousedisappear`, Touch `tap`, body handler | Hover and outside click | Hover intent (`pointerenter`/`pointerleave` added in code) and Light dismiss (document listeners while open) |

Dropped options: `disableHoverOnTouch`, `clickOpen`, `verticalClass`, `rightClass`, `forceFollow`, `data-options`. Dropped behaviours: Nest's roles, `aria-haspopup="true"`, and `aria-label` copies; `<a href="#">` parents; the invisible pre-show measurement (`visibility: hidden` while measuring); `data-is-click` as an attribute; the Touch utility's `tap` event; the top-level arrow reversal under `align-right`; Escape closing every submenu and focusing the first top-level link; Enter and Space moving focus into the submenu.

### CSS class to Angular mapping

| Foundation markup or class | Angular | Rationale |
| --- | --- | --- |
| Root `ul.dropdown.menu[data-dropdown-menu]` | `NfsDropdownMenu`, selector `ul[nfsDropdownMenu]`, `exportAs: 'nfsDropdownMenu'` | Named after the plugin on `ul.dropdown.menu` (building-blocks 1.3: `.dropdown` alone is Button's Variant class); an attribute directive on the consumer's `ul` (ADR 0001) |
| `.dropdown` on the root | Host class binding on `NfsDropdownMenu`, true while the root's Menu mode is `dropdown` | Foundation's root class; a consumer may keep writing it on a standalone menu (a static class and a true binding agree), never on a ResponsiveMenu root |
| `.menu`, `.vertical`, `.<bp>-horizontal`, `.<bp>-vertical`, `.align-right` on the root | None; consumer-written | Structural and Variant classes of Foundation's Menu; the key table reads the resulting orientation from computed style, and `align-right` feeds `alignment: 'auto'` |
| Every `li` | `NfsMenuItem` (`li[nfsMenuItem]`), Nested menu | Carries `is-dropdown-submenu-parent`, `is-active` while open, `opens-*`, `has-submenu-toggle`, `is-submenu-item is-dropdown-submenu-item`, and `data-nfs-expanded` |
| Nested `ul.menu` | `NfsSubmenu` (`ul[nfsSubmenu]`), Nested menu | Carries `submenu is-dropdown-submenu`, `first-sub` on top-level submenus, `js-dropdown-active` while open, its id, `inert`, and `data-nfs-shown` |
| Parent `a[href="#"]` | `button[nfsSubmenuToggle]`, Nested menu | Disclosure button (building-blocks 1.10, ADR 0004) |
| A parent link that also navigates | `a[href]` followed by `button[nfsSubmenuToggle][hybrid]`, Nested menu; the toggle binds `.submenu-toggle`, the item `.has-submenu-toggle` | The Hybrid item, replacing `forceFollow` |
| `.submenu-toggle-text` | Consumer-written span inside the Hybrid item's toggle | Foundation's visually hidden name holder |
| `.is-active` on a leaf `li` | None; consumer-written | Foundation's current-link style; in dropdown mode `is-active` on a parent means "open", so the current page is marked with `aria-current="page"` on its link (Nested menu) |
| `.top-bar`, `.top-bar-left`, `.top-bar-right` | None; consumer-written | Foundation's Top Bar (CSS-only); `.top-bar-right` ancestry feeds `alignment: 'auto'` |

### Hierarchy and DI shape

```
ngx-foundation-sites/dropdown-menu   (secondary entry point)
  NfsDropdownMenu            ul[nfsDropdownMenu], exportAs 'nfsDropdownMenu'
    providers: nfsMenuRootProviders('dropdown')          -> nfsMenuModeToken = NfsMenuRoot
    injects: nfsMenuModeToken {self: true}, nfsDropdownMenuDefaultsToken {optional: true}
    constructor: root.configure('dropdown', {alignment, disableHover, hoverDelay, closingTime,
                 autoclose, closeOnClick, closeOnClickInside, opened, closed})
  nfsDropdownMenuDefaultsToken : InjectionToken<NfsDropdownMenuDefaults>
  NfsDropdownMenuDefaults      all seven Options, optional

ngx-foundation-sites/nested-menu     (the consumer imports these from here)
  li[nfsMenuItem]  ul[nfsSubmenu]  button[nfsSubmenuToggle]
  nfsMenuModeToken, nfsMenuRootProviders, NfsMenuRoot, nfsMenuBehaviourDefaults
  dropdown mode uses the Anchored pane utility: nfsLightDismiss, nfsHoverIntent,
  nfsDocumentRect, nfsBodyBounds, nfsOverlap

composed by (another spec):
  ul[nfsResponsiveMenu]  hostDirectives: NfsDropdownMenu (its seven inputs; outputs opened, closed), ...
```

- One directive, no component: the menu is consumer markup Foundation's CSS already styles (ADR 0001, ADR 0004).
- The root handle is the Nested menu's `NfsMenuRoot`, created by `nfsMenuRootProviders('dropdown')` in the root element's injector, which also re-provides `NfsSubmenu` as `null`, so a Dropdown Menu nested inside another menu's submenu starts its own tree. `inject(nfsMenuModeToken, {self: true})` reads it; under `nfsResponsiveMenu` the hosting directive's provider wins on the same element, so this root reads the shared root whose mode the responsive root drives.
- Nesting is discovered through DI, not content queries: each item injects the nearest `NfsSubmenu` and registers with it, or with the root when it is top-level, which survives `@for`, `@defer`, and projection (Nested menu; building-blocks 1.9). Submenu open state is each item's `expanded` model signal.
- No plugin token (`nfsDropdownMenuToken`): nothing injects the Dropdown Menu root; items read the Nested menu's token (the Dropdown spec's D2 reasoning).
- Not an Openable: the menu provides no `nfsOpenableToken`, so a bare `nfsClose` on a link in a Dropdown Menu inside an off-canvas panel closes the panel (Nested menu D22). Submenu toggles are not Triggers.
- `nfsDropdownMenuDefaultsToken`: Shape B, all-optional, injected `{optional: true}` to seed the seven input defaults (building-blocks 1.4); a missing key falls back to `nfsMenuBehaviourDefaults.dropdown`, Foundation's values.
- Under ResponsiveMenu: every input name is unique among the three roots except `closeOnClick`, which Drilldown also declares. A bound `closeOnClick` on the ResponsiveMenu reaches both roots, which is Foundation's own behaviour (every child plugin read the same `data-*`); an unbound one leaves each at its own default, `true` here from this plugin's Defaults token and `false` for Drilldown from its own. The outputs share the names `opened` and `closed` with the other two roots; only the live mode calls its completion functions, so a bound output emits once.
- The entry point exports only the root, its Defaults token, and its interface. The Nested menu directives are imported from their own entry point, as the Triggers are for the Dropdown pane, so every symbol has one owner.

### API

```ts
interface NfsDropdownMenuDefaults {
  alignment?: 'auto' | 'left' | 'right';   // Foundation default 'auto'
  disableHover?: boolean;                  // false
  hoverDelay?: number;                     // 50 (ms)
  closingTime?: number;                    // 500 (ms)
  autoclose?: boolean;                     // true
  closeOnClick?: boolean;                  // true
  closeOnClickInside?: boolean;            // true
}
const nfsDropdownMenuDefaultsToken: InjectionToken<NfsDropdownMenuDefaults>;

class NfsDropdownMenu {                    // ul[nfsDropdownMenu], exportAs 'nfsDropdownMenu'
  readonly alignment: InputSignal<'auto' | 'left' | 'right'>;
  readonly disableHover: InputSignalWithTransform<boolean, unknown>;
  readonly hoverDelay: InputSignalWithTransform<number, unknown>;
  readonly closingTime: InputSignalWithTransform<number, unknown>;
  readonly autoclose: InputSignalWithTransform<boolean, unknown>;
  readonly closeOnClick: InputSignalWithTransform<boolean, unknown>;
  readonly closeOnClickInside: InputSignalWithTransform<boolean, unknown>;
  readonly opened: OutputRef<NfsMenuItem>;
  readonly closed: OutputRef<NfsMenuItem>;
  collapseAll(): void;
}
```

Every default is Foundation's and can be changed application-wide through the Defaults token; the token's value, else `nfsMenuBehaviourDefaults.dropdown`, seeds each input.

| Member | Kind | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `alignment` | `input()` | `'auto' \| 'left' \| 'right'` | `'auto'` | `data-alignment` | `'auto'` resolves through the Nested menu root's base-side rule: `opens-left` when the root's static `class` has `align-right`, when `Directionality` is `rtl`, or when the root is inside `.top-bar-right` (checked in the first render callback), else `opens-right`; `rightClass` is not read |
| `disableHover` | `input()`, `booleanAttribute` | `boolean` | `false` | `data-disable-hover` | Touch never hover-opens whatever its value (per-event filter replacing `disableHoverOnTouch`) |
| `hoverDelay` | `input()`, `numberAttribute` | `number` (ms) | `50` | `data-hover-delay` | None |
| `closingTime` | `input()`, `numberAttribute` | `number` (ms) | `500` | `data-closing-time` | Values below 100 act as 100 (hover intent's floor, which lets the pointer cross into a submenu) |
| `autoclose` | `input()`, `booleanAttribute` | `boolean` | `true` | `data-autoclose` | A click-opened submenu never closes on leave, because every click opens (Foundation needed `clickOpen` for that) |
| `closeOnClick` | `input()`, `booleanAttribute` | `boolean` | `true` | `data-close-on-click` | Switches only Light dismiss's pointer rule; Escape and focus leaving close regardless; a second click on an open parent always closes it |
| `closeOnClickInside` | `input()`, `booleanAttribute` | `boolean` | `true` | `data-close-on-click-inside` | A click inside a leaf item (an item without a submenu) closes every open submenu; a Hybrid item's link is inside a parent item and closes nothing, as in Foundation |
| `opened` | `output()` | `NfsMenuItem` | | `show.zf.dropdownMenu` | Completion output, emitted in the render callback after a submenu opens (after its collision flip), with the item whose submenu opened; never for the first-paint state |
| `closed` | `output()` | `NfsMenuItem` | | `hide.zf.dropdownMenu` | Completion output in the render callback after a submenu closes, once per closed submenu (a nested submenu closed with its parent emits its own) instead of Foundation's one event for a group |
| `collapseAll()` | method | | | `_hide()` with no argument (private) | Delegates to `NfsMenuRoot.collapseAll()`; focus inside a closing submenu moves to the top-level toggle that contained it |

Host: `[class.dropdown]` bound to `root.mode() === 'dropdown'`, `(keydown)` bound to `root.handleKeydown($event, 'dropdown')`, and `(click)` bound to `root.handleClick($event, 'dropdown')`. The root is `protected`, a template-and-host member (AGENTS.md member visibility). The constructor calls `root.configure('dropdown', {...})` with the seven inputs as functions and `opened: (item) => this.opened.emit(item)`, `closed: (item) => this.closed.emit(item)`; input changes apply to the next open, hover, or press, and close nothing already open.

Per-item API, used as the Nested menu defines it (not repeated here): `NfsMenuItem` with its `expanded` model, `opened`/`closed`, `open()`/`close()`/`toggle()`; `NfsSubmenu` with its `id` input; `NfsSubmenuToggle` with its `hybrid` input. In dropdown mode an item's `open()` closes its open siblings and does not open its closed ancestors (a consumer opens each item of the Open path, outermost first), and `close()` closes the open submenus inside it first. `expandAll()` is not offered: dropdown mode keeps one open submenu per level, and the Nested menu root warns in development if it is called outside accordion mode.

Behaviour rules the root adds or pins down:

- Mode: in a standalone menu the mode is always `dropdown`. Under `nfsResponsiveMenu` the root binds no class and handles no key or click while another mode is live; its inputs stay bound and apply when dropdown mode returns.
- Hover: with hover enabled, pointing at a parent item opens its submenu after `hoverDelay`; the item, which contains its submenu, is the Hover region, so moving into the submenu keeps it open; leaving the item closes a hover-opened submenu after `closingTime` while `autoclose` is on and it was not since clicked; `autoclose` off keeps it open until Escape, a sibling opening, focus leaving, or an outside press. Opening a sibling by hover closes the open one (the Nested menu's sibling rule).
- Outside press and focus: with `closeOnClick` off, a press on plain page content leaves submenus open, but a press that moves focus to a control outside the submenu still closes it through the focus rule (Light dismiss rule 4), in engines that focus buttons on click; Safari does not, so there a press on an outside button leaves the submenu open (the Dropdown spec's D11 consequence, same mechanism).
- Leaf click: with `closeOnClickInside` on, a click inside a leaf item closes every open submenu in the same pass; when the clicked link or button is inside a closing submenu and keeps focus (a Router link, a leaf button), the Nested menu's focus-loss guard moves focus to the top-level toggle of the closed Open path in the next render.

Development-mode checks, in one `afterNextRender` that exists only under `ngDevMode`, each warning once per instance: (1) the root is inside `.top-bar-right`, `alignment` is `'auto'`, and its static `class` has no `align-right`: the side is known only after hydration, so a vertical menu's side arrows flip at hydration; the warning tells the developer to set `alignment` to `'right'` or add `align-right`, so the server HTML carries the side. The Nested menu's own checks (a nameless Hybrid toggle, a parent item without a toggle, `expandAll()` outside accordion mode, an item without a root) also apply.

### Implementation level and primitives

Implementation level: custom Angular directive over the Nested menu (ADR 0004), which is custom Angular.

- Native platform: nested `popover="auto"` would give light dismiss, stacking by invoker, and the top layer, and CSS anchor positioning with `position-try-fallbacks: flip-inline` would replace the collision flip, but `popover` (Baseline 2024, Firefox 125, full iOS support at 18.3) and anchor positioning (Baseline 2026) are outside the Browser target. `<details>` cannot be the base: a `<summary>` cannot carry a separate navigating link beside its toggle, `<details name>` (one open per level) is out of target, and hover opening needs script anyway.
- `@angular/aria`: `ngMenuBar` with `ngMenuItem[submenu]` and `ngMenu` is the behavioural match (hover opening with `expansionDelay`, arrow keys, Escape, typeahead) and the semantic misfit. It applies `menubar`, `menu`, and `menuitem` roles and a roving tab stop, which the APG cautions against for site navigation ("it does not use the WAI-ARIA menu role ... because it does not provide the complex functionality that assistive technologies expect") and which the Angular Aria guide says to avoid ("Avoid menus when: Building site navigation"); its menubar orientation is fixed horizontal, so a `.vertical` Dropdown Menu has no counterpart; submenus are separate `ngMenu` elements linked by `[submenu]` references and rendered from `ng-template` content, which breaks Foundation's nested `ul` markup and leaves open submenus out of server HTML; and it opens on hover only after a first keyboard or click interaction, where Foundation opens on the first hover. Ruled out for this effort (map, Out of scope: opt-in `role="menu"` variants).
- `@angular/cdk`: `CdkMenuBar`, `CdkMenu`, and `cdkMenuTriggerFor` apply the same roles and render submenus in overlays created from templates; CDK Overlay is not used (ADR 0002). From CDK the Nested menu uses `Directionality`, `_IdGenerator`, and `hasModifierKey`.

Primitives: `input()` with `booleanAttribute` and `numberAttribute`, `output()`, host bindings on the root's `mode` signal, `inject()` with `{self: true}` and `{optional: true}`, `HostAttributeToken` and `Element.closest` for the development check, and everything the Nested menu lists for dropdown mode (`inert`, Pointer Events and `pointerType`, `focusin`, `keydown` with `event.key`, `getComputedStyle` in key handlers, `getBoundingClientRect` through `nfsDocumentRect` in a render callback, `Node.contains`, `compareDocumentPosition`, `focus()`, `Directionality.valueSignal`, `NgZone.runOutsideAngular` for timers). CSS `min()` in the required width setting is Baseline widely available (Chrome 79, Firefox 75, Safari 11.1). All are in the Browser target.

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| `.dropdown`, `jsaction` for `keydown` and `click` | Host bindings on `root.mode()` and host listeners | First-paint state in server HTML (building-blocks 1.11 decision 1); host listeners replay |
| `configure()`, Defaults token read, base side from `alignment`, `align-right`, and `Directionality` | Constructor (the root's and the Nested menu root's) | Needed before the first render and before replay; reads no layout, so the server HTML carries the side |
| Development check (`.top-bar-right` without a server-known side) | `afterNextRender`, only under `ngDevMode` | A DOM walk, never on the server; once |
| `.top-bar-right` ancestry for the base side | The Nested menu root's `afterNextRender` `earlyRead`, once | A DOM walk, not allowed before hydration |
| Item and submenu classes, `aria-expanded`, `inert`, `data-nfs-*` | The Nested menu's host bindings | That spec's render hooks table |
| Collision flip | The Nested menu's `afterRenderEffect` per parent item (`earlyRead` measures against the body box, `write` flips) | Layout read then class write; idle while closed |
| Light dismiss and hover intent | Inside the Anchored pane helpers (`afterRenderEffect`), called by each parent item | Listeners exist only while open, or while hover is enabled, and only on the client |
| Focus after a keyboard open or close | The Nested menu's `afterNextRender` (`earlyRead` picks the target, `write` focuses) | `inert` is removed only by the render that follows the state change |
| `opened`/`closed` | The Nested menu's completion `afterRenderEffect`; dropdown mode has no transition, so it completes in the render callback after the change | The DOM shows the final state, collision class included, when handlers run |
| `effect` | Not used | The root has no non-DOM side effect |
| `afterRenderEffect` of its own | Not used | The root measures and writes nothing |
| `afterEveryRender` | Not used | It would run after every change detection in the application |

`injectAsync`: not applicable. Nothing is loaded only after a client interaction: a toggle click, a key, and a hover must act in the same pass (a Replayed event must find its handler at once), the Anchored pane helpers the items use in dropdown mode are small, inert on the server, and decided eager by the Anchored pane spec, and the plugin is its own entry point, which a consumer's `@defer` already splits.

Fallback: none needed. The [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) ran dropdown mode's classes, keys, collision classes, per-submenu focus-out close, and axe in Chromium, Firefox, and WebKit on this Implementation level; hover intent, Light dismiss, and the body-box measurement are the Anchored pane utility's, confirmed by the [Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay](../issues/44-prototype-anchored-pane.md).

### Comparison with Angular Material, CDK, and Aria

Material has no menubar; its counterpart for nested overlay menus is `MatMenu` with `[matMenuTriggerFor]` on items. CDK has `CdkMenuBar`/`CdkMenu`, and Aria has `ngMenuBar`/`ngMenu`.

| Concern | `MatMenu` / `CdkMenu` / Aria `ngMenuBar` | Dropdown Menu |
| --- | --- | --- |
| Pattern and roles | Menu and menubar: `menubar`, `menu`, `menuitem`, `aria-haspopup="menu"` | Disclosure navigation: native lists, buttons with `aria-expanded`/`aria-controls`, links, no roles |
| Focus | One tab stop, roving `tabindex` or active descendant, typeahead, Home/End | Every visible control in the tab sequence; Foundation's arrow keys as optional shortcuts; no typeahead |
| Where submenus live | Overlay panes from templates (Material, CDK); `ng-template` content referenced by `[submenu]` (Aria) | The consumer's nested `ul`, in place, in server HTML |
| Nesting | `[matMenuTriggerFor]` on an item; `cdkMenuTriggerFor`; Aria `[submenu]` | DOM nesting, registered through DI |
| Orientation | Material menus vertical; Aria menubar horizontal only | Horizontal, vertical, and per-breakpoint through Foundation's classes, read from computed style |
| Hover | Material opens nested menus on hover; Aria `expansionDelay` (100 ms) after first interaction | `hoverDelay` (50) and `closingTime` (500) from the first hover, `disableHover`, `autoclose`; touch filtered per event |
| Placement | `xPosition`/`yPosition`, `overlapTrigger`, viewport-bound overlay positions | `alignment` picks the base side; Foundation's CSS places submenus; a body-box check flips to the other side or inside |
| Outside click | Transparent backdrop (`hasBackdrop`) | `closeOnClick`, Light dismiss pointer rule, no backdrop element |
| Close reason | `closed: MenuCloseReason` (`void \| 'click' \| 'keydown' \| 'tab'`) | Light dismiss reasons stay internal (they decide focus return); `closed` carries the item, as a container aggregate (building-blocks 1.4) |
| Events | `menuOpened`/`menuClosed` on the trigger, `closed` on the panel; Aria `itemSelected` | `opened`/`closed` on the root with the item; per-item `opened`/`closed` and `expandedChange` |
| Container methods | `closeMenu()` on the trigger | `collapseAll()` |
| Defaults | `MAT_MENU_DEFAULT_OPTIONS` | `nfsDropdownMenuDefaultsToken` |

Borrowed: Material's open and close vocabulary, a container-level close-everything method, a defaults token, the hover delay idea (Aria's `expansionDelay`, here Foundation's `hoverDelay`). Not borrowed: menu roles, roving `tabindex`, typeahead, overlays and backdrops, `aria-haspopup`, `xPosition`/`yPosition`, template-created submenus, the reason on `closed`.

### ARIA and keyboard

Pattern: Disclosure Navigation Menu (APG), its overlaying form (the APG's `disclosure-navigation` example, where Escape closes and focus leaving closes are required), with the hybrid variant for Hybrid items (ADR 0004). The APG Menubar pattern is the opt-in alternative the map ruled out of scope.

| Element | Semantics | Source |
| --- | --- | --- |
| Wrapper | `nav` with `aria-label` or `aria-labelledby` naming the navigation (for example "Main"), never "navigation"; consumer-written | APG disclosure navigation |
| Root and submenu `ul`, every `li` | Native `list` and `listitem`; no `role`, no `aria-*` | Nested menu |
| Parent button (`nfsSubmenuToggle`) | Native `button`, `type="button"`, `aria-expanded`, `aria-controls` = the submenu id; named by its text | Nested menu |
| Hybrid item | `a[href]` that navigates, then the toggle with `.submenu-toggle`, named by its `.submenu-toggle-text` span ("Products pages") | Nested menu; APG hybrid example |
| Current page | `aria-current="page"` on its link, consumer-written; with the Router, `routerLinkActive` plus `ariaCurrentWhenActive="page"` | APG; Nested menu |
| Closed submenu | `inert`, and Foundation's `display: none` on `.is-dropdown-submenu` without `.js-dropdown-active` | Nested menu; Foundation CSS |

Keys, as the Nested menu's dropdown mode defines them, including this spec's amendment there (the open and close keys follow the Base side), which the Nested menu spec carries. Every handler changes state first, then moves focus, then calls `stopPropagation()`, then `preventDefault()` last, and handles nothing with a modifier key held. A "control" is an `a[href]` or `button` inside the root that is not in an `inert` or `hidden` subtree and is not `visibility: hidden`; "next" and "previous" follow DOM order. The root is vertical when its computed `flex-direction` is `column` or, for Foundation's `$global-flexbox: false` build, its first top-level item's computed `display` is `block` (Foundation's `_isVertical()`; the second test is part of the same amendment, which the Nested menu spec carries). Submenus are always vertical.

Two key pairs name directions:

- Next and Previous along a horizontal top level follow the reading direction: Right and Left in LTR, Left and Right in RTL (`Directionality`).
- Open and Close follow the Base side: Right and Left while the root's Base side is `opens-right`, Left and Right while it is `opens-left`. In LTR with `alignment: 'auto'` and no `align-right` or `.top-bar-right`, and in RTL likewise, this equals the reading direction; it differs only for a right-aligned menu in LTR or a left-aligned one in RTL, where Foundation's `_isRtl()` also turned the keys.

| Context | Down | Up | Open key | Close key | Next / Previous |
| --- | --- | --- | --- | --- | --- |
| Top level, horizontal | On a toggle: open, focus its first control; otherwise not handled | Previous top-level control | (used as Next or Previous) | (used as Next or Previous) | Next or previous top-level control |
| Top level, vertical | Next top-level control | Previous top-level control | On a toggle: open, focus its first control | Not handled | (use Down and Up) |
| Inside a submenu | Next control in the submenu | Previous control in the submenu | On a toggle: open the nested submenu, focus its first control | Close the submenu, focus its toggle | (use Down and Up) |

| Key | Behaviour |
| --- | --- |
| Tab, Shift+Tab | Native, through every control of the open parts of the menu; focus moving outside an open submenu closes it and its descendants, and nothing above it (Light dismiss focus rule) |
| Enter, Space on a toggle | Native `click`: toggles; focus stays |
| Enter on a link | Native navigation; with `closeOnClickInside`, the click on a leaf link closes every submenu |
| Escape, focus on a toggle whose submenu is open | Closes it; focus stays |
| Escape, focus inside an open submenu | Closes the innermost submenu containing focus; focus moves to its toggle |
| Escape, focus outside the menu | Closes the topmost open submenu (a hover-opened one), without moving focus (Light dismiss) |
| Escape, no submenu open | Not handled, so it propagates (an enclosing Dropdown pane, off-canvas panel, or Reveal closes on it) |
| Home, End, typeahead | Not offered (Foundation never had them; APG optional) |

A collision flip does not change the keys: a nested submenu that flipped to `opens-left` under an `opens-right` Base side still opens with Right, as in Foundation, because a closed submenu always shows the Base side and the flip is known only after it opens.

Deltas from Foundation's keys: Enter and Space toggle a button natively and keep focus on it (Foundation opened and moved focus into the submenu); Escape closes one level and focuses its button (Foundation closed everything and focused the first top-level link); Up on a horizontal top level moves back (Foundation closed everything); along a horizontal top level the keys follow the reading direction even under `align-right` (Foundation reversed them); Tab out of a submenu closes it (Foundation had no focus rule). Pointer and focus: nothing opens on focus; a pointer click on a hover-opened parent keeps its submenu open, a keyboard-generated click always toggles.

### WCAG 2.2 AA requirements

Requirements, not recommendations. The Accessibility gate runs axe with the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`; ADR 0018) on every story, closed and with submenus open. Criteria axe cannot judge are asserted in play functions, the Sass compile test, and e2e.

| Criterion | Requirement for the Dropdown Menu | Foundation default and what makes it pass | Checked by |
| --- | --- | --- | --- |
| 1.3.1 Info and Relationships | The hierarchy and each toggle's controlled submenu are programmatic | Native nested lists; `aria-controls` from the submenu id; no roles that contradict the lists | Accessibility gate; SSR smoke |
| 1.3.2 Meaningful Sequence | Reading and focus order match the visual order | Each submenu follows its parent button in the DOM and appears beside or below it; a Hybrid toggle follows its link | Story play |
| 1.4.3 Contrast (Minimum) | Parent-button and link text reach 4.5:1 against the background they are drawn on, the open top-level parent included, and inside a Top Bar | Passes on the page with Foundation's defaults: parent buttons use `$anchor-color`, as Foundation's menu links do (4.65:1 on `$body-background`); the open top-level parent uses `$dropdown-menu-item-color-active` on `$dropdown-menu-item-background-active` (transparent), 4.65:1. Fails inside Foundation's default Top Bar: `$topbar-background` (`$light-gray`) gives 3.76:1 for both. Required when the menu sits in a `.top-bar`: a bar background (`$topbar-background`, and `$topbar-submenu-background` where set) on which `$anchor-color` and `$dropdown-menu-item-color-active` reach 4.5:1, for example `$topbar-background: $white;`, or a darker `$anchor-color`. `nfs-dropdown-menu` warns at compile time (`@warn`, since the mixin cannot know whether a Top Bar is used) naming the settings when either pair is below 4.5 | Accessibility gate (`color-contrast`, on `dropdown-menu--top-bar` with the Storybook setting); Sass compile test |
| 1.4.10 Reflow | At 320 CSS px no submenu makes the page scroll sideways, from any item position and at any depth | Fails with Foundation's default `$dropdownmenu-min-width: 200px`: a submenu from a narrow item between about 120 and 200 px from the left fits neither side, and `opens-inner` keeps its left edge. A submenu no wider than half the page always fits: from an item starting in the left half it fits opening rightwards, from one ending in the right half it fits opening leftwards, and a nested submenu that fits neither side fits `opens-inner` under its parent. Required consumer setting: `$dropdownmenu-min-width: min(200px, 45vw);` (45vw leaves room for a desktop scrollbar; `min()` is in target). `nfs-dropdown-menu` warns at compile time when the setting is a fixed length over 160 px | e2e at 320 px; Sass compile test |
| 1.4.11 Non-text Contrast | Every arrow reaches 3:1 against what it is drawn on | Passes with Foundation's defaults: `$dropdownmenu-arrow-color` (`$anchor-color`) and the Hybrid toggle's `$accordionmenu-arrow-color` (`$primary-color`) are 4.65:1 on white and 3.76:1 on the default Top Bar. `nfs-dropdown-menu` stops the compile with `@error` naming the setting when the unrounded WCAG ratio (computed from Foundation's `color-luminance()`, because its `color-contrast()` rounds to one decimal and lets 2.95:1 pass) of `$dropdownmenu-arrow-color` is below 3 against `$dropdownmenu-background` or else `$body-background`, and against `$dropdownmenu-submenu-background` (only while `$dropdownmenu-arrows` is on), and when `$accordionmenu-arrow-color` is below 3 against `$accordionmenu-submenu-toggle-background` where set, or else those same backgrounds (the Hybrid toggle's arrow, which Foundation draws whatever `$dropdownmenu-arrows` says); the Top Bar pair is part of the 1.4.3 warning | Sass compile test (axe has no 1.4.11 rule) |
| 1.4.12 Text Spacing | Text in an open submenu is never clipped with WCAG's spacing overrides | Passes: `.is-dropdown-submenu` has a `min-width` and no fixed height or `overflow`; items wrap and the submenu grows | e2e with the overrides applied |
| 1.4.13 Content on Hover or Focus | A hover-opened submenu is dismissible, hoverable, and persistent | Dismissible: Escape closes the topmost open submenu from anywhere without moving pointer or focus (Light dismiss), and hover does not reopen it until the pointer leaves and re-enters. Hoverable: the Hover region is the item, which contains its submenu, so the pointer can move onto the submenu. Persistent: no timer hides it while the pointer is over it; it closes `closingTime` (at least 100 ms) after the pointer leaves the item, never while `autoclose` is off, and never after a click opened it. Nothing opens on focus | Story play; e2e with a real mouse |
| 2.1.1 Keyboard | Every open, close, and link is reachable with Tab, Enter, and Space alone | Native buttons and links; hover opening always has the click equivalent; the arrow keys only add shortcuts | Story play |
| 2.1.2 No Keyboard Trap | Focus can always leave the menu | Nothing traps focus; Tab leaves after the last control and closes what it leaves | e2e Tab sweep |
| 2.4.3 Focus Order | Focus follows the visible order and never enters a closed submenu | DOM order; closed submenus are `inert` and `display: none`; the focus-loss guard moves focus to the toggle of a submenu that closes under it | Story play; e2e |
| 2.4.6 Headings and Labels | Every toggle's name says which submenu it opens | Parent buttons are named by their text; a Hybrid toggle by its own `.submenu-toggle-text`; a nameless one warns in development (Nested menu) | Browser-level test; Accessibility gate (`button-name`) |
| 2.4.7 Focus Visible | Every control shows a visible focus indicator | Passes with Foundation's defaults: the library removes no outline, and Foundation's `disable-mouse-outline` on `.dropdown.menu a` acts only under what-input's `[data-whatinput='mouse']`, which the library never sets; `.is-dropdown-submenu` does not clip | e2e screenshot |
| 2.4.11 Focus Not Obscured (Minimum) | An open submenu never stays over the focused control | Focus moving outside an open submenu closes it, per submenu, so an `opens-inner` submenu dropped over later siblings closes before Tab reaches them (prototype row 25); a hover-opened submenu over a focused control elsewhere is dismissed with Escape without moving focus | e2e hit test of the focused control's centre |
| 2.5.2 Pointer Cancellation | No action fires on the down event | Toggles act on `click`; Light dismiss needs both `pointerdown` and `pointerup` outside, so a press that starts on the menu and ends outside closes nothing | Story play |
| 2.5.3 Label in Name | A parent button's name contains its visible text | Named from its own text; Foundation's copied `aria-label` is gone | Story play |
| 2.5.8 Target Size (Minimum) | Every parent, link, and toggle is at least 24 by 24 CSS px | Passes with Foundation's defaults: top-level and submenu rows are 38 px high with `$dropdownmenu-padding` and `$dropdownmenu-submenu-padding`; a Hybrid toggle is `$accordionmenu-submenu-toggle-width` by `-height`, 40 px, in every mode. `nfs-dropdown-menu` stops the compile with `@error` when either toggle setting is below 24 px | Accessibility gate (`target-size`, on through the `wcag22aa` tag); Sass compile test |
| 3.2.1 On Focus | Focus alone changes nothing | Focus never opens, closes, or navigates | Story play |
| 4.1.2 Name, Role, Value | Parents expose name, role, and expanded state from the first paint | Native buttons; `aria-expanded` and `aria-controls` are host bindings in server HTML; no `menubar`, `menuitem`, or `none` roles and no `aria-haspopup` | Accessibility gate; SSR smoke |

The library's Storybook compiles Foundation with the two required settings in its settings overrides, each commented with its criterion: `$dropdownmenu-min-width: min(200px, 45vw);` (1.4.10, `dropdown-menu--fixture` at 320 px) and `$topbar-background: $white;` (1.4.3 `color-contrast`, `dropdown-menu--top-bar`).

### Rendered HTML

Consumer markup, Foundation's horizontal docs example with its parents as buttons, a Hybrid item, and the current page marked:

```html
<nav aria-label="Main">
  <ul class="dropdown menu" nfsDropdownMenu (opened)="onOpened($event)">
    <li nfsMenuItem>
      <button nfsSubmenuToggle>Item 1</button>
      <ul class="menu" nfsSubmenu>
        <li nfsMenuItem><a href="/1a">Item 1A</a></li>
        <li nfsMenuItem>
          <button nfsSubmenuToggle>Item 1B</button>
          <ul class="menu" nfsSubmenu>
            <li nfsMenuItem><a href="/1b/i" aria-current="page">Item 1B i</a></li>
          </ul>
        </li>
      </ul>
    </li>
    <li nfsMenuItem>
      <a href="/products">Products</a>
      <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Products pages</span></button>
      <ul class="menu" nfsSubmenu>
        <li nfsMenuItem><a href="/products/boards">Boards</a></li>
      </ul>
    </li>
    <li nfsMenuItem><a href="/about">About</a></li>
  </ul>
</nav>
```

Server HTML, and the same after hydration before any interaction (directive attributes omitted; `_IdGenerator` ids differ between server and client and are rewritten at hydration because `id` and `aria-controls` are both host bindings):

```html
<nav aria-label="Main">
  <ul class="dropdown menu" jsaction="keydown:;click:;">
    <li class="is-dropdown-submenu-parent opens-right">
      <button type="button" aria-expanded="false" aria-controls="nfs-submenu-x1-0" jsaction="click:;">Item 1</button>
      <ul id="nfs-submenu-x1-0" inert="" class="menu submenu is-dropdown-submenu first-sub">
        <li class="is-submenu-item is-dropdown-submenu-item"><a href="/1a">Item 1A</a></li>
        <li class="is-submenu-item is-dropdown-submenu-item is-dropdown-submenu-parent opens-right">
          <button type="button" aria-expanded="false" aria-controls="nfs-submenu-x1-1" jsaction="click:;">Item 1B</button>
          <ul id="nfs-submenu-x1-1" inert="" class="menu submenu is-dropdown-submenu">
            <li class="is-submenu-item is-dropdown-submenu-item"><a href="/1b/i" aria-current="page">Item 1B i</a></li>
          </ul>
        </li>
      </ul>
    </li>
    <li class="is-dropdown-submenu-parent has-submenu-toggle opens-right">
      <a href="/products">Products</a>
      <button type="button" class="submenu-toggle" aria-expanded="false" aria-controls="nfs-submenu-x1-2" jsaction="click:;">
        <span class="submenu-toggle-text">Products pages</span></button>
      <ul id="nfs-submenu-x1-2" inert="" class="menu submenu is-dropdown-submenu first-sub">...</ul>
    </li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

- `jsaction` lists the root's `keydown` and `click` and each toggle's `click`; Angular removes it after hydration. Links carry none, so a link click before hydration navigates natively. No `role`, no `aria-haspopup`, no `aria-hidden`, no inline `style` anywhere. The closed submenus are hidden by Foundation's `.is-dropdown-submenu { display: none }`.
- Every parent carries its Base side from construction (`opens-right` here). With `class="dropdown menu align-right"`, `alignment="right"`, or an RTL `Directionality`, the server HTML carries `opens-left`; inside `.top-bar-right` with none of those, the server renders `opens-right` and the first render callback after hydration switches the closed submenus' parents to `opens-left` (development check 1).

Hydrated, after the pointer rests on "Item 1" for 50 ms (or a click on it): the first `li` gains `is-active` and `data-nfs-expanded`; its button reads `aria-expanded="true"`; its submenu drops `inert` and gains `js-dropdown-active`, which shows it; in the render callback the collision check measures it and, as it fits, leaves `opens-right`; the submenu gains `data-nfs-shown` and the root emits `opened` with the Item 1 `NfsMenuItem`. Focus stays where it was.

```html
<li class="is-dropdown-submenu-parent opens-right is-active" data-nfs-expanded="">
  <button type="button" aria-expanded="true" aria-controls="nfs-submenu-y2-0">Item 1</button>
  <ul id="nfs-submenu-y2-0" class="menu submenu is-dropdown-submenu first-sub js-dropdown-active" data-nfs-shown="">...</ul>
</li>
```

Opening "Item 1B" near the right edge of the page: its submenu opens, measures past the body box, and its item moves to `opens-left` (or `opens-inner` when neither side fits) in the same tick, before paint; `opened` fires once with the Item 1B item. After Escape with focus on "Item 1B i": Item 1B's submenu loses `js-dropdown-active` and `data-nfs-shown` and gains `inert`, its item loses `is-active` and `data-nfs-expanded` and returns to `opens-right`, focus moves to the Item 1B button in the next render, and `closed` fires with the Item 1B item; Item 1 stays open. After Tab from the last control of Item 1's submenu to "Products": both submenus close, `closed` fires for Item 1B and for Item 1.

### Animation

None, as in Foundation: Foundation's DropdownMenu has no transition, and its CSS shows a submenu by `display` through `.js-dropdown-active` (building-blocks 1.6 rule 1: an element that stays in the DOM changes through a State class).

- Completion: the Nested menu's dropdown mode completes in the render callback after the change, so `opened` and `closed` fire once the DOM shows the final state, collision class included.
- No `animate` input and no Motion class: Foundation has no DropdownMenu animation Option, and an exit animation would need a leaving phase that keeps `.js-dropdown-active` bound, which the Nested menu's dropdown mode does not have; a hover menu that opens after 50 ms gains little from motion. A consumer who wants an entrance may put a keyframe `animation` on `.is-dropdown-submenu.js-dropdown-active` in their own stylesheet, which runs whenever the submenu changes from `display: none`, with their own `prefers-reduced-motion` rule; the library ships none.
- Reduced motion: nothing to shorten; `nfs-dropdown-menu` emits no reduced-motion rule.
- Disabled animations: `nfsAnimationsToken` `{disabled: true}` changes nothing in dropdown mode; the Nested menu binds `transition: none` only on the elements it animates (the accordion `li`, the drilldown submenu), and completion is already immediate here.
- Nothing animates at hydration: host binding values equal the server's.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: `.dropdown`, the Nest classes, `first-sub`, `opens-left`/`opens-right` from the Base side, `aria-expanded`, `aria-controls`, and `inert` are host bindings on signals that exist at construction (rule 1), so the server HTML is the menu. Closed submenus are hidden by Foundation's CSS (rule 2). A submenu with a static `.is-active` renders open (`js-dropdown-active`, `data-nfs-shown`) at its Base side, unmeasured, and is registered with Light dismiss and measured in the first render callback after hydration; an overlaying submenu open at first paint is unusual and not recommended. Nothing is measured on the server.
- Before hydration: construction injects, configures, registers, seeds, and reads `HostAttributeToken` only; hover listeners, Light dismiss listeners, timers, focus, the collision measurement, and the `.top-bar-right` walk run only in render callbacks and handlers (rules 3 to 5). No DOM structure is created: toggles are consumer-written (rule 4).
- Event replay: a toggle's `click` replays through the Nested menu toggle's host listener and toggles; it calls no `preventDefault()`, and since nothing is hover-opened before hydration, the toggle rule's hover exception never applies to it, so a replayed click opens a closed submenu. A root `keydown` replays: state changes, focus moves in the following render, `stopPropagation()` runs, and the trailing `preventDefault()` throws, so Angular's `ErrorHandler` logs one error per replayed handled key, the accepted default (building-blocks Part 4, Decided item 3). A root `click` replays into `handleClick`, which closes nothing because nothing is open before hydration. Links carry no `jsaction`: the root does, and the JSAction dispatcher cancels only clicks whose action element is an `<a>`, so a plain link navigates natively before hydration and inside a dehydrated block; a `routerLink` carries its own `click` listener and navigates through the Router on replay. Hover uses code-added `pointerenter`/`pointerleave`, which are never replayed, so a hover before hydration never opens a submenu late.
- Hydration boundary: the root and every item, submenu, and toggle share one boundary (rule 7); items register with their parent when constructed, so a consumer's `@defer` wraps the whole `nav`, never one submenu.
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/dropdown-menu` and `ngx-foundation-sites/nested-menu` are entry points a consumer's `@defer` splits. Inside a dehydrated block the menu is its server HTML; a click on a toggle hydrates the block (`hydrate on interaction`) and replays, opening the submenu. With `hydrate on hover`, the first hover only hydrates the block (its `mouseover` trigger fires, but the `pointerenter` that would open has passed), so a submenu opens on the next pointer entry or on a click; `hydrate on viewport` or `on idle` avoid that. Inside `hydrate never` the links navigate, the toggles and hover do nothing, and closed submenus stay closed; a menu whose submenus must be reachable does not belong in `hydrate never`. Plain `@defer` renders the menu on the client like any client render.
- Breakpoints: a standalone Dropdown Menu is not breakpoint-gated. Foundation's `.<bp>-horizontal` and `.<bp>-vertical` classes change its orientation in CSS, and the key table reads the orientation from computed style at key time, so it follows with nothing to hand off. As a ResponsiveMenu mode, the Server breakpoint's mode is rendered and a client at another breakpoint re-classes in the first render callback (the Nested menu and Responsive Menu specs).
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; hover and Light dismiss listeners and timers run outside the zone and reach Angular only by writing signals, so pointer movement never runs change detection.

### Sass and custom CSS

The rules come from the Nested menu spec, which assigns them to this plugin's Library mixin, `nfs-dropdown-menu`, each scoped to `.dropdown.menu` so a ResponsiveMenu matches them only in dropdown mode; this spec adds two compile-time warnings (1.4.10, 1.4.3 in a Top Bar) and one contrast pair (the Hybrid toggle's arrow). They are listed with their reasons in the Sass subsection under Further Notes.

## Testing Decisions

A good test asserts what a user or assistive technology observes: which classes and ARIA each element carries, whether a submenu is shown and `inert`, which side it opened to, where focus is after each key, what the server HTML contains, and which outputs fired with which item. No test reads a directive's private fields. The Nested menu's own suite owns its dropdown key table, class maps, hover intent mapping, Light dismiss rules, collision flip, and focus rules on its test root (`nested-menu--dropdown`, `nested-menu--dropdown-vertical`, `nested-menu--dropdown-hover`, `nested-menu--dropdown-edge`, `nested-menu--rtl`, `nested-menu--hybrid`); this suite asserts what the Dropdown Menu root adds (the root class, the seven Options and their Defaults token, the aggregate outputs, `collapseAll()`, the alignment sources including `.top-bar-right`, the Base-side keys of this spec's amendment to the Nested menu, the development check), Foundation's docs markup under the real root, the `nfs-dropdown-menu` rules and checks, and the Rendering modes of a standalone dropdown root. Nothing is written twice. Prior art: the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) suite (dropdown classes, keys, collision, per-submenu focus-out, axe) and the harness of the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).

Story ids follow `dropdown-menu--<story>`: `dropdown-menu--default` (Foundation's horizontal docs example, three levels, parents as buttons), `dropdown-menu--vertical` (the vertical docs example), `dropdown-menu--hybrid` (Hybrid items at the top level and inside a submenu), `dropdown-menu--hover` (args `hoverDelay`, `closingTime`, `autoclose`), `dropdown-menu--disable-hover`, `dropdown-menu--close-on-click` (args `closeOnClick`, `closeOnClickInside`), `dropdown-menu--alignment` (args `alignment` and an `align-right` class), `dropdown-menu--top-bar` (Foundation's Top Bar docs example with a second menu in `.top-bar-right`), `dropdown-menu--rtl`, `dropdown-menu--programmatic` (`[(expanded)]` on an item, `collapseAll()`, the outputs listed), and `dropdown-menu--fixture` (args: orientation, alignment, direction, the menu's horizontal offset, open items, Hybrid items; `!autodocs`, for e2e). Layer 1 runs at a 414 px viewport, so play functions assert "exactly one of `opens-left`, `opens-right`, `opens-inner`" except where a story pins the geometry.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Stack: `@storybook/angular-vite` 10.6 with `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless; inferred `test-storybook`: `npx nx test-storybook <lib>`. Axe: `@storybook/addon-a11y`, `parameters.a11y.test = 'error'`, `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` in the Storybook preview configuration, the enforcing gate; every story runs it with its submenus closed and open. CSR only; the single home of interaction tests. Hover steps wait for the root's `opened` or `closed` spy with `waitFor`, never a fixed timeout.

- `dropdown-menu--default`: the root carries `dropdown`; no element has a `role` or `aria-haspopup`; every parent `li` carries `is-dropdown-submenu-parent` and one side class, top-level submenus `first-sub`; a click on "Item 1" sets `aria-expanded="true"`, adds `is-active` to its item and `js-dropdown-active` to its submenu, removes `inert`, and `opened` fires once with that item; opening "Item 1B" keeps Item 1 open; opening "Item 2" closes Item 1 and Item 1B and `closed` fires for each; a click on a leaf link closes everything; Enter and Space toggle through `userEvent.keyboard` with focus staying.
- `dropdown-menu--vertical`: on the `.vertical` root, Down and Up move along the top level and the Open key opens and focuses the first control of the submenu (the root forwards keys; the full table is the Nested menu's story).
- `dropdown-menu--hybrid`: each Hybrid link keeps its `href` and has no `aria-expanded`; its toggle carries `submenu-toggle`, its item `has-submenu-toggle`, and the toggle's accessible name is its span text; a click on the toggle opens the submenu; a click on the Hybrid link does not close an open submenu (the item is a parent); only one arrow is drawn per Hybrid item (the link's `::after` has `content: none`).
- `dropdown-menu--hover`: hovering a parent opens it after `hoverDelay` without moving focus; moving into the submenu keeps it open; leaving closes it after `closingTime`; hover then click keeps it open and a second click closes it; with `autoclose` off, leaving keeps it open and Escape (focus outside the menu) closes it; with the pointer still on the item after Escape, it does not reopen until the pointer leaves and re-enters.
- `dropdown-menu--disable-hover`: hovering opens nothing; a click opens.
- `dropdown-menu--close-on-click`: with the defaults, a press on plain text outside closes every open submenu and moves no focus; with `closeOnClick` off it stays open; a press that starts on the menu and ends outside keeps it open; with `closeOnClickInside` off, a leaf-link click leaves the submenu open.
- `dropdown-menu--alignment`: `alignment="right"` gives every parent `opens-left` and `"left"` gives `opens-right`; with `alignment` `'auto'` and the root's static `align-right`, `opens-left`; with Base side `opens-left` in LTR, the Left key opens a nested submenu and Right closes it, while Right and Left along the top level still move to the next and previous items (the Nested menu's Base-side rule).
- `dropdown-menu--top-bar`: the menu in `.top-bar-right` has `opens-left` on its parents after the first render; the menu in `.top-bar-left` has `opens-right`; axe passes with the Storybook Top Bar setting.
- `dropdown-menu--rtl`: under `dir="rtl"` on a wrapper with CDK's `Dir`, parents carry `opens-left`, Left moves to the next top-level item, and Left opens a nested submenu.
- `dropdown-menu--programmatic`: `[(expanded)]` on one item shown in the story; a checkbox bound to it opens and closes the submenu and `opened`/`closed` fire with that item; a "Close all" button calls `collapseAll()` with focus inside a nested submenu, everything closes, and focus lands on the top-level toggle that contained it.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- DI: `nfsMenuModeToken` resolves, from an item, to a root in mode `dropdown`; `#m="nfsDropdownMenu"` resolves; a Dropdown Menu nested inside another menu's submenu starts its own tree; no `nfsOpenableToken` is provided.
- Options and Defaults token, driven by data: each of the seven inputs defaults to Foundation's value; `nfsDropdownMenuDefaultsToken` changes each default; a static attribute or binding overrides the token; `closeOnClick="false"` and `hoverDelay="200"` coerce.
- Option mapping with fake timers: `hoverDelay` and `closingTime` reach hover intent (open after the delay, close after the closing time, a `closingTime` of 20 closes after 100); `disableHover` turns hover off; a `pointerenter` with `pointerType: 'touch'` opens nothing; `autoclose` false keeps a hover-opened submenu open on leave; a click-opened submenu never closes on leave.
- Light dismiss mapping: `closeOnClick` on and off with dispatched `pointerdown`/`pointerup` pairs outside; Escape with focus outside closes the topmost submenu; a `focusin` outside an open submenu closes it and not its open parent's submenu when focus stays in the parent.
- Leaf rule: a click inside a leaf item closes all with `closeOnClickInside` on and nothing with it off; a click on a Hybrid link closes nothing.
- Aggregate outputs: `opened` and `closed` emit the item once each, in the render callback after the change; closing a parent with an open nested submenu emits `closed` for both; the first-paint state from a static `.is-active` emits nothing; under a driving test root with another mode live, a completion emits nothing.
- Alignment: `alignment`, the static `align-right` class, a `Directionality` test double backed by a signal (or CDK's `[dir]` wrapper), and a `.top-bar-right` ancestor each give the documented Base side; a later `alignment` change re-sides closed submenus only.
- Keys through the root, with data for Base side and direction: the Open and Close keys inside submenus follow the Base side; Next and Previous along a horizontal top level follow `Directionality`; a replay-shaped keydown (`eventPhase` 101, a throwing `preventDefault`) changes state, stops propagation (an outer spy sees nothing), and reaches `ErrorHandler` once; a replay-shaped root `click` reaches no `ErrorHandler`.
- Development check: warns once for a root in `.top-bar-right` with `alignment` `'auto'` and no `align-right`; not with `alignment="right"`, not with `align-right`, not outside a Top Bar.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which none here does.

- SSR smoke: `renderApplication` over a fixture with the Rendered HTML markup, a `.vertical` root with `class="... align-right"`, a root inside `.top-bar-right`, a root with a static `.is-active` submenu, and a menu inside `@defer (hydrate on interaction)`. Assert `whenStable()` resolves (no pending timers); the HTML matches the Rendered HTML section: `dropdown` on the root, the Nest classes per level, `first-sub` on top-level submenus only, `opens-right` on every parent of the plain root and `opens-left` on the `align-right` root, `opens-right` on the `.top-bar-right` root (the walk has not run), `aria-expanded` and `aria-controls` resolving to an element, `inert` on every closed submenu, `js-dropdown-active` and `data-nfs-shown` only on the statically open one, no `role`, `aria-haspopup`, or `aria-hidden` anywhere, no inline `style`; `jsaction="keydown:;click:;"` on the root, `click:;` on each toggle, none on `li` or links; `ngb` and `click:;keydown:;` on the deferred block's root; no document listener was added (spy on the server document).
- Sass compile test: `nfs-dropdown-menu` compiles after `foundation-dropdown-menu` and `foundation-accordion-menu` with Foundation's defaults and emits the button, arrow, active-parent, and Hybrid arrow-suppression rules; `$dropdownmenu-arrows: false` drops the button-arrow rules and keeps the toggle checks; a `$dropdownmenu-arrow-color` below 3:1 on `$body-background` or on `$dropdownmenu-submenu-background`, an `$accordionmenu-arrow-color` below 3:1 on a set `$accordionmenu-submenu-toggle-background`, and a 20 px `$accordionmenu-submenu-toggle-width` each stop the compile with an `@error` naming the setting; the default `$dropdownmenu-min-width: 200px` warns and `min(200px, 45vw)` and `160px` do not; the default `$topbar-background` warns (3.76:1) and `$white` does not.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `dropdown-menu--fixture` through `mount(storyId, props)`, in Chromium, Firefox, and WebKit:

- Reflow (1.4.10): at a 320 x 640 viewport with the Storybook width setting, for a horizontal root at offsets that put a narrow item at 0, 120, 150, 200, and 260 px, and for a vertical root, opening each top-level submenu and a second and third level keeps `document.documentElement.scrollWidth` equal to the viewport width; every open submenu's box lies inside the viewport.
- Real mouse (1.4.13): a mouse path from a parent diagonally into its submenu keeps it open; leaving closes it after `closingTime`; Escape with the pointer resting on the submenu closes it and moves no focus; touch emulation (`hasTouch`) taps toggle and never hover-open, and a touch scroll that starts outside an open submenu leaves it open.
- 2.4.11: at 400 px with a nested submenu at `opens-inner`, tabbing on from its last control lands on an uncovered control (centre hit test), and no open submenu covers the focused control after each Tab.
- Real keys in three engines: the Base-side Open and Close keys on the `align-right` and RTL variants; Tab sweeps assert buttons only in WebKit (its default Tab skips links).
- Text spacing (1.4.12): with WCAG's overrides injected and two levels open, no control is cut off and every control's box lies inside its submenu's box.
- Focus ring (2.4.7): a screenshot of a focused control in a second-level submenu shows the engine's focus ring unclipped.

Against the prerendered fixture app, one route `/dropdown-menu` with the Rendered HTML markup, a copy inside `.top-bar-right` without an alignment, a `@defer (hydrate on interaction)` copy, a `@defer (hydrate on hover)` copy, and a `@defer (hydrate never)` copy, prerendered at a 1280 px viewport:

- JavaScript disabled: screenshot plus `@axe-core/playwright` on the six tags; closed submenus hidden and not reachable by Tab; links navigate.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; after hydration the `.top-bar-right` copy's parents carry `opens-left`; the other roots' classes are unchanged.
- Pre-hydration input with the main bundle held back: a toggle clicked before hydration opens its submenu exactly once after hydration and `opened` fires once; a pre-hydration ArrowDown on a focused top-level toggle replays and opens it, with the one accepted `ErrorHandler` log; a hover before hydration opens nothing, and the next pointer entry after hydration opens after `hoverDelay`; an outside click and an Escape before hydration do nothing.
- `@defer (hydrate on interaction)`: a toggle click hydrates the block and opens the submenu.
- `@defer (hydrate on hover)`: the first hover hydrates without opening; leaving and re-entering opens.
- `@defer (hydrate never)`: links navigate, toggles and hover do nothing, and no error is logged.

## Out of Scope

- The item, submenu, and toggle directives, the root handle, the key tables themselves, class emission, completion timing, the collision flip, Light dismiss, hover intent, and the focus-loss guard: the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) and the [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md). This spec's amendment to the Nested menu's dropdown key table (the Base-side keys and the `display: block` vertical test) is carried in that spec.
- The Menu mode swap and breakpoint rules: the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md), which composes this root.
- The Top Bar and title bar around a menu: Foundation CSS-only components; the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md) for the toggled bar.
- An opt-in APG Menubar variant (`role="menubar"`, roving `tabindex`, typeahead) for application command menus (map, Out of scope; ADR 0004).
- Mega menus and arbitrary content inside submenus beyond links, buttons, and nested lists.
- A close reason on `closed`, a submenu animation Option, and runtime theming through custom properties.
- Native `popover`, CSS anchor positioning, interest invokers, `:has()`, and `CloseWatcher` (out of target; Further Notes).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive `ul[nfsDropdownMenu]` providing the Nested menu root in mode `dropdown`, `exportAs: 'nfsDropdownMenu'`, binding `.dropdown` from the mode | ADR 0001, ADR 0004; the Nested menu's consumer table; building-blocks 1.3 names it after the plugin on `ul.dropdown.menu` | A component rendering the tree (breaks Foundation's markup); `NfsDropdown` (Button's Variant class, the Dropdown pane) |
| D2 | Disclosure navigation, no menubar | The APG's own caution on the menubar navigation example; the Angular Aria guide's "avoid menus when building site navigation"; a role is a promise (building-blocks 1.10); links stay in the tab sequence | Aria `ngMenuBar` (roles, horizontal only, template submenus, hover after first interaction); Foundation's Nest roles |
| D3 | Nesting through the Nested menu's DI registration; open state as each item's `expanded` model | Survives `@for`, `@defer`, projection; one mechanism for all menu plugins | `contentChildren` queries on the root |
| D4 | Seven Options kept with Foundation's names and defaults; `disableHoverOnTouch`, `clickOpen`, `verticalClass`, `rightClass`, `forceFollow` dropped | Building-blocks 1.4; per-event touch filtering, button parents, the Hybrid item, and class-name contracts make the dropped ones meaningless | Keeping `clickOpen` (a parent button that ignores clicks fails 2.1.1 for pointer users who cannot hover) |
| D5 | `closeOnClick` default `true` here and `false` on Drilldown, one binding reaching both under ResponsiveMenu | Foundation's per-plugin defaults and its shared `data-*` reading; the Nested menu author's compatibility note | Renaming one of them (breaks the naming rule); one shared default |
| D6 | `closingTime` keeps Foundation's name and default; below 100 ms acts as 100 | Hover intent's floor lets the pointer cross into the submenu (1.4.13 hoverable) | Honouring 0 (a submenu that closes before the pointer reaches it) |
| D7 | `opened`/`closed` carry the `NfsMenuItem`, once per submenu, after the change renders | Building-blocks 1.4 container aggregates carry the item; the Nested menu's completion functions pass it | Foundation's one `hide` for a group; a `{item, reason}` payload (the reason is Light dismiss's internal focus rule, not in the utility's API) |
| D8 | `collapseAll()` only; no `expandAll()` | Dropdown mode keeps one open submenu per level | Exposing `expandAll()` that always warns |
| D9 | `alignment` `'auto'` reads `align-right`, `Directionality`, and `.top-bar-right`; the first two in the server HTML, the last after hydration, with a development warning | Foundation's rule; `rightClass` is a class-name Option; a DOM walk is not allowed before hydration | Reading ancestry at construction (no DOM before hydration); dropping `.top-bar-right` (breaks Foundation's Top Bar docs layout) |
| D10 | Open and Close keys follow the Base side; Next and Previous along a horizontal top level follow the reading direction (amended into the Nested menu spec) | The keys point where submenus appear; Foundation's `_isRtl()` counted `align-right` for opening, and its top-level reversal was wrong for flex menus, whose items keep DOM order on screen | `Directionality` only (Right opens a submenu that appears on the left under `align-right`); Foundation's `_isRtl()` everywhere (reverses the top level) |
| D11 | Vertical detection also treats a first top-level item with computed `display: block` as vertical (amended into the Nested menu spec) | Foundation's `_isVertical()`; covers `$global-flexbox: false` builds, where `.vertical` sets `li { display: block }` and no `flex-direction` | `flex-direction` only |
| D12 | No animation, no `animate` input | Foundation has none; no leaving phase in dropdown mode; a consumer can add an entrance keyframe on `.js-dropdown-active` | Building-blocks Table B's "optional keyframes via `animate` input" |
| D13 | `$dropdownmenu-min-width: min(200px, 45vw)` required for 1.4.10, with a compile-time `@warn` | A submenu at most half the page wide always fits one of Foundation's three sides; settings over library rules (ADR 0022); the Dropdown pane's precedent | A library `max-width` rule; leaving 1.4.10 as advice |
| D14 | A compile-time `@warn` for text contrast inside a Top Bar, and a Storybook `$topbar-background: $white` | Foundation's default Top Bar gives 3.76:1 for menu text and the library's parent buttons; the mixin cannot know whether a Top Bar is used, so it warns rather than stops | `@error` (breaks consumers without a Top Bar); ignoring Foundation's documented Top Bar placement |
| D15 | No button twin for Foundation's `.menu .is-active > a` highlight on open nested parents | That rule is Menu's current-link style reused for "open"; its default pair would put the side arrow (`$primary-color`) on a `$primary-color` background, 1:1, failing 1.4.11 for the twin; the open state shows through the visible submenu and `aria-expanded`; the top-level twin stays because Foundation has dedicated settings for it | A twin with `menu-state-active` (arrow fails 1.4.11); changing Foundation's arrow colour |
| D16 | A click inside a leaf item closes all with `closeOnClickInside`; a Hybrid link does not | Foundation's leaf test (`hasSub`) | Any link click closes all (a behaviour Foundation never had) |
| D17 | Not an Openable; no plugin token | A bare `nfsClose` in a menu inside an off-canvas must close the off-canvas; nothing injects the root | `nfsDropdownMenuToken` from building-blocks Table B |
| D18 | No `injectAsync`, no `effect`, no `afterEveryRender`, no `afterRenderEffect` of its own | Nothing loads after interaction; nothing non-DOM to sync; the root measures nothing | Lazy Anchored pane helpers on first hover |

### Usage examples

```ts
@Component({
  selector: 'app-site-nav',
  imports: [NfsDropdownMenu, NfsMenuItem, NfsSubmenu, NfsSubmenuToggle, RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Main">
      <ul class="dropdown menu" nfsDropdownMenu #menu="nfsDropdownMenu"
          hoverDelay="100" (opened)="log('opened', $event)">
        <li nfsMenuItem>
          <button nfsSubmenuToggle>Products</button>
          <ul class="menu" nfsSubmenu>
            <li nfsMenuItem>
              <a routerLink="/products/boards" routerLinkActive ariaCurrentWhenActive="page">Boards</a>
            </li>
            <li nfsMenuItem>
              <button nfsSubmenuToggle>Wheels</button>
              <ul class="menu" nfsSubmenu>
                <li nfsMenuItem><a routerLink="/products/wheels/street">Street</a></li>
              </ul>
            </li>
          </ul>
        </li>
        <!-- Hybrid item: the link navigates, the toggle opens -->
        <li nfsMenuItem #services="nfsMenuItem" [(expanded)]="servicesOpen">
          <a routerLink="/services">Services</a>
          <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Services pages</span></button>
          <ul class="menu" nfsSubmenu>
            <li nfsMenuItem><a routerLink="/services/repairs">Repairs</a></li>
          </ul>
        </li>
        <li nfsMenuItem><a routerLink="/about">About</a></li>
      </ul>
    </nav>
    <button type="button" (click)="menu.collapseAll()">Close menus</button>
  `,
})
export class AppSiteNav {
  protected readonly servicesOpen = signal(false);

  protected log(kind: string, item: NfsMenuItem): void {
    // item.submenu()?.id() names the submenu that changed
  }
}
```

A vertical menu that opens on click only, and a right-aligned menu in a Top Bar with its side known on the server:

```html
<nav aria-label="Sections">
  <ul class="vertical dropdown menu" nfsDropdownMenu disableHover [closeOnClickInside]="false">
    <li nfsMenuItem>
      <button nfsSubmenuToggle>Item 1</button>
      <ul class="vertical menu nested" nfsSubmenu>
        <li nfsMenuItem><a href="/1a">Item 1A</a></li>
      </ul>
    </li>
  </ul>
</nav>

<div class="top-bar">
  <div class="top-bar-left">...</div>
  <nav class="top-bar-right" aria-label="Account">
    <ul class="dropdown menu" nfsDropdownMenu alignment="right">
      <li nfsMenuItem>
        <button nfsSubmenuToggle>Account</button>
        <ul class="menu" nfsSubmenu>
          <li nfsMenuItem><a href="/settings">Settings</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</div>
```

Application-wide defaults:

```ts
bootstrapApplication(App, {
  providers: [{provide: nfsDropdownMenuDefaultsToken, useValue: {hoverDelay: 150, closingTime: 300}}],
});
```

The same menu as one mode of a ResponsiveMenu (the ResponsiveMenu markup is a sketch owned by its spec): `<ul class="vertical medium-horizontal menu" nfsResponsiveMenu="drilldown medium-dropdown" hoverDelay="100">`. A bound `closeOnClick` there reaches both the Drilldown and Dropdown Menu roots; left unbound, each keeps its own default.

A consumer entrance animation, in the consumer's own stylesheet (no library support needed):

```scss
.dropdown.menu .is-dropdown-submenu.js-dropdown-active {
  animation: nfs-fade-in 150ms ease-out; // from nfs-motion, which keeps its reduced-motion override
}
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-menu` and `foundation-dropdown-menu`, plus `foundation-accordion-menu` when a Hybrid item is used (it holds Foundation's only `.submenu-toggle` and `.has-submenu-toggle` rules) and `foundation-top-bar` when the menu sits in a Top Bar. Its documented custom CSS is the `nfs-dropdown-menu` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-dropdown-menu` (and after `foundation-accordion-menu` when that is included). The rules are the ones the Nested menu spec assigns to this mixin, restated here with their reasons, plus this spec's checks:

1. Rules, each scoped to `.dropdown.menu`:
   (a) `.dropdown.menu li > button:not(.submenu-toggle)`: `display: block; width: 100%; line-height: 1; text-align: start; color: $anchor-color; cursor: pointer`, with `padding: $dropdownmenu-padding` and, where it is not `null`, `background: $dropdownmenu-background` on top-level buttons (`.dropdown.menu > li > button:not(.submenu-toggle)`), and `padding: $dropdownmenu-submenu-padding` on buttons inside `.is-dropdown-submenu`. Reason: parents are buttons (ADR 0004); Foundation's `menu-base` and `foundation-dropdown-menu` style only `a` and `.button`, and its button reset leaves a `<button>` inline and unpadded. (Nested menu rule 1.)
   (b) `.dropdown.menu li.has-submenu-toggle > a::after { content: none; }`. Reason: Foundation's dropdown link arrows lack AccordionMenu's `.has-submenu-toggle` exclusion, so a Hybrid item would draw the link's arrow and the toggle's. (Nested menu rule 8.)
   (c) Gated on `$dropdownmenu-arrows`: `.dropdown.menu > li.is-dropdown-submenu-parent > button:not(.submenu-toggle)` gets `position: relative; padding-inline-end: $dropdownmenu-arrow-padding` and a down `::after` through `css-triangle($dropdownmenu-arrow-size, $dropdownmenu-arrow-color, down)` at Foundation's offsets; on a `.vertical` root and inside `.is-dropdown-submenu`, `.is-dropdown-submenu-parent.opens-left > button:not(.submenu-toggle)::after` and `.opens-right > ...::after` get the left and right triangles with Foundation's `zf-dropdown-left-right-arrows` geometry, and the same `.<bp>-vertical` and `.<bp>-horizontal` variants inside `breakpoint()`. Reason: Foundation draws every dropdown arrow on `> a::after`. (Nested menu rule 10.)
   (d) `.dropdown.menu > li.is-active > button:not(.submenu-toggle)`: `background: $dropdown-menu-item-background-active; color: $dropdown-menu-item-color-active`. Reason: Foundation paints the open top-level parent on `> a`. (Nested menu rule 11.) No twin for nested open parents (D15).
   (e) Compile-time checks that emit no CSS: `@error` when the ratio of `$dropdownmenu-arrow-color` to `$dropdownmenu-background` (or else `$body-background`) or to `$dropdownmenu-submenu-background` is below 3 while `$dropdownmenu-arrows` is on, and when `$accordionmenu-arrow-color` is below 3 against `$accordionmenu-submenu-toggle-background` where set, or else against those backgrounds (1.4.11; axe has no rule), naming the settings; `@error` when `$accordionmenu-submenu-toggle-width` or `-height` is below 24 px (2.5.8), as the Nested menu specifies for every mode; `@warn` when `$dropdownmenu-min-width` is a fixed `px` or `rem` length above 160 px (`rem-calc()` above 10rem), naming the setting and the `min(<width>, 45vw)` form (1.4.10; calculations such as `min()` are skipped as deliberate); `@warn` when `$anchor-color` or `$dropdown-menu-item-color-active` is below 4.5:1 against `$topbar-background` or `$topbar-submenu-background`, or `$dropdownmenu-arrow-color` below 3:1 against them, naming the settings and saying it applies to menus inside a `.top-bar` (1.4.3, 1.4.11). Every ratio is the WCAG formula over Foundation's `color-luminance()`, compared unrounded, as the Nested menu and Button specs do, because Foundation's `color-contrast()` rounds to one decimal.
2. Reused settings, mixins, and functions, all from the consumer's compile: `$anchor-color`, `$dropdownmenu-padding`, `$dropdownmenu-submenu-padding`, `$dropdownmenu-background`, `$dropdownmenu-submenu-background`, `$dropdownmenu-arrows`, `$dropdownmenu-arrow-size`, `$dropdownmenu-arrow-color`, `$dropdownmenu-arrow-padding`, `$dropdownmenu-min-width`, `$dropdown-menu-item-color-active`, `$dropdown-menu-item-background-active`, `$accordionmenu-arrow-color`, `$accordionmenu-submenu-toggle-background`, `$accordionmenu-submenu-toggle-width`, `$accordionmenu-submenu-toggle-height`, `$topbar-background`, `$topbar-submenu-background`, `$body-background`, `$global-left`, `$global-right`, `$breakpoint-classes`, `css-triangle()`, `breakpoint()`, `color-luminance()`, `rem-calc()`. No parameter: the 160 px limit is half of WCAG's 320 CSS px, not a Foundation value.
3. Custom properties: none. `data-nfs-expanded` and `data-nfs-shown` are bound in dropdown mode too, but no dropdown rule reads them.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates (Animation).
5. What breaks without the include: parent buttons render as inline, unpadded text in `$body-font-color` with no arrows; the open top-level parent is not highlighted; a Hybrid item draws two arrows; the compile no longer warns about submenu width at 320 px or Top Bar contrast. Missing `foundation-dropdown-menu` shows every closed submenu in the page flow.

Required settings for WCAG 2.2 AA (consumer's settings file, and the library's Storybook settings overrides):

```scss
// 1.4.10: a submenu at most half the page wide fits one side at 320 CSS px.
$dropdownmenu-min-width: min(200px, 45vw);
// 1.4.3, only for menus inside a .top-bar: $anchor-color is 3.76:1 on the default $light-gray bar.
$topbar-background: $white;
```

### Platform features to adopt when the browser target moves

- `popover="auto"` on each submenu with its toggle as invoker (`popovertarget` or `commandfor`): replaces Light dismiss with the same model (ADR 0024), nesting by invoker, one open per level, and the top layer, which ends clipping by `overflow` ancestors; the browser would set `aria-expanded` on the toggle.
- CSS anchor positioning with `position-try-fallbacks: flip-inline` and an `@position-try` for Foundation's `opens-inner`: replaces the collision flip; the body-box bound has no CSS counterpart.
- Interest invokers (`interestfor`): declarative hover and focus opening with platform delays, replacing hover intent.
- `:has()`: Foundation's open-parent highlight could follow the button (`li:has(> button[aria-expanded='true'])`) and drop the `is-active` collision.
- `CloseWatcher`: the Android back gesture closes the topmost submenu.

### Foundation behaviour changed or dropped

- No `menubar`, `menuitem`, or `none` roles, no `aria-haspopup`, no copied `aria-label`s; `aria-expanded` and `aria-controls` on parent buttons, which Foundation never set.
- Parents are buttons, so a click always toggles (`clickOpen` is always on); a parent that navigates is a Hybrid item (`forceFollow` gone).
- Hover opening follows each pointer's type, not the device (`disableHoverOnTouch` gone); `closingTime` has a 100 ms floor.
- Submenus close when focus leaves them, and on Escape from anywhere; Escape closes one level and refocuses its button instead of closing everything and focusing the first top-level link; Enter and Space no longer move focus into the submenu.
- Outside presses close only when both `pointerdown` and `pointerup` land outside, never on a touch scroll; a press inside the menu but outside an open Open path closes it too (Light dismiss); a second click on an open parent closes it whatever `closeOnClick` says.
- The arrow keys along a horizontal top level follow the reading direction even under `align-right`; the open and close keys follow the Base side, including under `alignment="right"`, which Foundation's key mapping ignored.
- `opened`/`closed` fire once per submenu with its item; Foundation's `hide` fired once per group with the elements.
- The collision check runs after the submenu is shown and before paint, with Foundation's body-box formula; the invisible pre-show measurement is gone.
- `verticalClass` and `rightClass` are gone (class names are the contract); `.top-bar-right` is read after hydration.
- Open nested parents are no longer painted with Menu's current-link highlight (D15); the open top-level parent keeps Foundation's dropdown highlight.
- Foundation's 200 px submenu width must be capped by the consumer for WCAG 1.4.10, and the default Top Bar background changed for 1.4.3 when a menu sits in it.
