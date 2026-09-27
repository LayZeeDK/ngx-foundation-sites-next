# Spec: Nested menu (shared utility)

Ticket: [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA.

## Problem Statement

A developer building an Angular application on Foundation for Sites writes site navigation as Foundation's nested `ul.menu` markup and wants it to behave as one of Foundation's three menu patterns: an accordion menu that slides submenus open in place, a drilldown that slides each level in over the previous one, or a dropdown menu whose submenus overlay the page, and, through ResponsiveMenu, a different pattern per breakpoint. Foundation does this with three jQuery plugins over one shared utility, Nest, which "feathers" the markup at runtime with classes and roles. That design leaves the developer with problems an Angular library must not copy:

- Nest stamps `role="menubar"` on every list, `role="menuitem"` on every link, and `role="none"` on every item, and the plugins put `aria-expanded` on the `li`, where user agents ignore it. Screen reader users are promised menu keyboard behaviour that does not exist, DropdownMenu announces no expanded state at all, and the APG warns against these roles for site navigation.
- Parent items are `<a href="#">` links that open a submenu, so a parent that should also navigate cannot, and Drilldown removes the `href` from every parent link.
- The classes, roles, generated wrapper, back buttons, and toggle buttons are created by JavaScript after load, so server HTML is not the menu the user sees, and a ResponsiveMenu swap destroys one plugin and constructs another, leaving stale ARIA from the previous mode and closing everything under the user's focus.
- AccordionMenu animates with jQuery `slideDown`, Drilldown's `closeOnClick` and DropdownMenu's outside click are body handlers, DropdownMenu's hover opening depends on a device-wide touch check, and none of the three close an overlaying submenu when focus moves on.
- Foundation's default hybrid toggle is named "Toggle menu" on every item, and in drilldown and dropdown mode the toggle has no styles at all.

A server-rendered Angular application adds more: every class and ARIA state visible at first paint must be in the server HTML, nothing may be measured before hydration, a click or key press before hydration must still work once the page hydrates, and a breakpoint that differs between the server and the browser must change the mode without a hydration error.

## Solution

One shared directive family on the markup the developer already writes, used by the AccordionMenu, Drilldown, DropdownMenu, and ResponsiveMenu directives. The developer marks every `li` with `nfsMenuItem`, every nested `ul` with `nfsSubmenu`, and the button that opens a submenu with `nfsSubmenuToggle`; the plugin's root directive on the outer `ul` supplies the Menu mode. From that one mode signal the family emits Foundation's whole Nest vocabulary (`is-<mode>-submenu-parent`, `is-<mode>-submenu`, `is-<mode>-submenu-item`, `submenu`, `is-submenu-item`) and each mode's State classes as host bindings, so the server HTML is the finished menu and a mode swap is only a class change.

Every mode implements disclosure navigation: native lists, a `<button aria-expanded aria-controls>` for each parent, or a link followed by a toggle button when the parent also navigates (the Hybrid item), `aria-current="page"` on the current link, and no menu or tree roles. Only keyboard handling and layout differ per mode. Closed submenus are `inert`; hidden drilldown levels use Foundation's `invisible`. Dropdown-mode submenus close on Escape, on an outside press, and when focus leaves them, through the Anchored pane utility's Light dismiss registry, and open on hover through its hover-intent helper. When ResponsiveMenu changes the mode, the root commits the new mode together with pruning the open submenus to the ones that hold focus, in one render callback, so focus stays on the same control and no render shows the new mode over a submenu the swap closes.

The accordion height animation is the one piece of motion Foundation's Sass lacks; it is a grid on the parent `li` driven by a library attribute, in the AccordionMenu Library mixin. Drilldown keeps Foundation's transform slide.

## User Stories

1. As an application developer, I want to keep Foundation's nested `ul.menu` markup and add attribute directives to it, so that my menus look exactly as Foundation's docs show.
2. As an application developer, I want one set of item, submenu, and toggle directives for every menu plugin, so that the same markup works as an accordion menu, a drilldown, or a dropdown menu.
3. As an application developer, I want Foundation's `is-<mode>-submenu*`, `submenu`, and `is-submenu-item` classes in the server HTML, so that Foundation's CSS styles the menu before any script runs.
4. As an application developer, I want a parent item to be a button that opens its submenu, so that it is announced and operated as a control.
5. As an application developer, I want a parent item that both navigates and opens a submenu, as a link plus a separate toggle, so that section landing pages stay reachable.
6. As an application developer, I want Foundation's `.submenu-toggle` look on that toggle in every mode, so that it has a visible arrow and a 40 by 40 px target.
7. As an application developer, I want each item's open state as a two-way `expanded` model, so that I can open a section from my own code or route data.
8. As an application developer, I want `opened` and `closed` outputs on each item after its animation, so that I can react once a submenu is fully shown or hidden.
9. As an application developer, I want a static `is-active` on a submenu to open it at first paint, as Foundation documents, so that the current section is open when the page loads.
10. As an application developer, I want `open()`, `close()`, and `toggle()` on each item, and `expandAll()` and `collapseAll()` through the root, so that I can drive the menu programmatically.
11. As an application developer, I want only one submenu per level open in drilldown and dropdown mode and in an accordion menu with `multiOpen` off, so that Foundation's one-path behaviour is kept.
12. As a keyboard user, I want every link and button in an open part of the menu in the tab sequence, so that I can reach everything with Tab alone.
13. As a keyboard user, I want Enter and Space on a parent button to open and close its submenu, so that the menu works like any disclosure.
14. As a keyboard user, I want the arrow keys to move between items and open and close submenus as Foundation's plugins did, so that I can move quickly without leaving the menu.
15. As a keyboard user, I want Escape to close the submenu I am in and put focus on its button, so that I can back out one level.
16. As a keyboard user in a drilldown, I want focus to move to the first item of the level I opened, and back to the parent button when I go back, so that I never lose my place.
17. As a keyboard user in a dropdown menu, I want a submenu to close when I tab out of it, so that it never covers the control I move to.
18. As a mouse user of a dropdown menu, I want submenus to open on hover after a short delay and stay open while I move into them, so that the menu feels like Foundation's.
19. As a mouse user, I want a click on a hover-opened parent to keep its submenu open instead of closing it, so that hovering then clicking does not flicker.
20. As a user on a touch screen, I want a tap to toggle a submenu and never trigger hover opening, so that touch and mouse both work on the same device.
21. As a user, I want a click outside an open dropdown submenu to close it, and a click on a leaf link to close the menu, so that the menu gets out of my way.
22. As a user who opened a dropdown submenu by hovering, I want Escape to close it without moving the pointer or focus, so that it stops covering content (WCAG 1.4.13).
23. As a user near the edge of the screen, I want a dropdown submenu that would overflow to open on the other side, or inside, as Foundation does, so that it stays on screen.
24. As a user of a right-to-left page, I want dropdown submenus to open to the left and the arrow keys to follow the reading direction, so that the menu is natural.
25. As a screen reader user, I want native lists and buttons with `aria-expanded` and `aria-controls`, so that I hear the hierarchy and whether each section is open.
26. As a screen reader user, I want the current page's link marked with `aria-current="page"`, so that I know where I am.
27. As a screen reader user, I want closed submenus and hidden drilldown levels out of the accessibility tree, so that I only read what is shown.
28. As a screen reader user, I want the same roles in every mode, so that a responsive menu does not change what it claims to be.
29. As a keyboard user of a responsive menu, I want focus to stay on the same control when a breakpoint changes the mode, so that resizing never drops me on the page body.
30. As a user who prefers reduced motion, I want submenus to open and close without animation, so that motion does not bother me.
31. As a low-vision user, I want every arrow and focus ring to meet the WCAG 2.2 AA contrast minimums with Foundation's defaults, so that I can see the menu's state.
32. As a user with limited dexterity, I want every toggle at least 24 by 24 CSS px, so that I can hit it.
33. As a developer of a server-rendered application, I want the menu's classes, `aria-expanded`, and `inert` in the server HTML, so that the first paint is the real menu and hydration changes nothing.
34. As a developer of a server-rendered application, I want a click or key press on the menu before hydration to take effect once the page hydrates, so that early interaction is not lost.
35. As a developer of a server-rendered application, I want the Server breakpoint's mode in the server HTML and a class-only change after hydration on other breakpoints, so that there is no hydration error.
36. As a developer using incremental hydration, I want to know that the menu and all its items must share one hydration boundary, so that I place `@defer` correctly.
37. As a developer of a zoneless application, I want the menu to need no zone, so that it works with zoneless change detection.
38. As a developer who themes the menu, I want every library rule to reuse my Foundation settings, so that my arrow colours, paddings, and sizes apply.
39. As a developer who themes the menu, I want the compile to fail when my settings make an arrow fail 3:1 contrast or a toggle fall under 24 px, so that I cannot ship an inaccessible menu by accident.
40. As a plugin spec author, I want the classes, keys, focus rules, completion timing, and mode swap in one utility, so that the AccordionMenu, Drilldown, DropdownMenu, and ResponsiveMenu specs only add their root directive and Options.
41. As a plugin spec author, I want per-mode behaviour Options passed to the utility through one typed call, so that ResponsiveMenu can host all three roots on one `ul`.
42. As a library maintainer, I want the class emission and key tables asserted in stories, TestBed specs, a server-render smoke test, and three-engine e2e tests, so that a regression shows at the layer that owns it.

## Implementation Decisions

### Foundation contract

The utility replaces Foundation's Nest utility (`Nest.Feather` and `Nest.Burn`) and the parts of AccordionMenu, Drilldown, and DropdownMenu that all three share: the item and submenu classes, the open and close state, the per-plugin keyboard maps, and the ResponsiveMenu swap. Nest has no Options of its own.

| Foundation feature | What it does in 6.9 | Library counterpart |
| --- | --- | --- |
| `Nest.Feather(menu, type)` | Adds `role="menubar"` to the root and every submenu, `role="menuitem"` to every link, `role="none"` to every item; `is-<type>-submenu-parent` on parents; `submenu is-<type>-submenu` and `data-submenu` on nested lists; `is-submenu-item is-<type>-submenu-item` on their items; `aria-haspopup="true"` and a copied `aria-label` on parent links (not for accordions); `aria-expanded` on the `li` and `aria-hidden` on submenus (drilldown only) | Host class bindings on `nfsMenuItem` and `nfsSubmenu` from the Menu mode; no roles, no `aria-haspopup`, no `aria-label` copies, no `data-submenu`; `aria-expanded` on the toggle button; `inert` instead of `aria-hidden` |
| `Nest.Burn(menu, type)` | Removes the classes (not the roles) when a ResponsiveMenu swaps | The class maps recompute from the new mode; nothing is left behind |
| AccordionMenu `is-active` on the open submenu `ul`; `aria-expanded` on the parent `li` (or the injected toggle); `slideDown`/`slideUp`; `multiOpen` (`true`); `showAll()`/`hideAll()`; `down`/`up.zf.accordionMenu` | Open state, height animation, and events | `is-active` on the open submenu; `aria-expanded` on the toggle; the parent-`li` grid animation; `multiOpen` through the root's accordion behaviour; `expandAll()`/`collapseAll()`; item `opened`/`closed` |
| AccordionMenu `submenuToggle`, `submenuToggleText` | Inserts `<button class="submenu-toggle">` with a visually hidden "Toggle menu" span after every parent link | Consumer-written `button[nfsSubmenuToggle][hybrid]` with Foundation's `.submenu-toggle-text` span naming its item; the directive binds `.submenu-toggle` and the item `.has-submenu-toggle` |
| Drilldown `is-active`, `visible`, `invisible`, `is-closing`, `drilldown-submenu-cover-previous` on submenus; `invisible` on the parent level; `aria-expanded` on the `li`; `open`/`hide`/`close`/`closed.zf.drilldown` | Slide state and events | The same classes from state; `invisible` on every hidden ancestor level including the root; item `opened`/`closed` after the slide |
| DropdownMenu `is-active` on the open parent `li`, `js-dropdown-active` on the open submenu, `first-sub`, `opens-left`/`opens-right`/`opens-inner`, `verticalClass`; `show`/`hide.zf.dropdownMenu` | Open state, alignment, collision flip | The same classes from state; `vertical` is written by the consumer (`verticalClass` is a Dropped option); collision through the Anchored pane utility's pure functions |
| DropdownMenu `disableHover`, `hoverDelay` (50), `closingTime` (500), `autoclose` (`true`), `closeOnClick` (`true`), `closeOnClickInside` (`true`), `alignment` (`'auto'`) | Hover timers, body click, leaf click, side | The root's dropdown behaviour: `nfsHoverIntent`, Light dismiss `outsidePress`, a root click rule, and the alignment rule |
| Per-plugin `Keyboard.register` maps | Enter/Space/arrows/Escape per plugin | The per-mode key tables below, one root `keydown` listener |
| ResponsiveMenu `_checkMediaQueries` | Destroys the old plugin and constructs the new one on `changed.zf.mediaquery` | The root's `drive(mode)` plus the swap rule; no directive is created or destroyed |

What the four consuming specs keep for themselves (so the utility carries none of it): the root directives and their selectors, their Options, Defaults tokens, aggregate outputs, `exportAs` names; Drilldown's wrapper (`is-drilldown`, `min-height`, `animate-height`, `autoHeight` height), back button directive, `closeOnClick`, and `scrollTop` Options; ResponsiveMenu's `rules` input. The table "What each consuming spec maps" below lists them.

Dropped options and behaviours (utility level): `data-submenu`, `role` stamping, `aria-haspopup`, `aria-label` copies, `aria-multiselectable`, `parentLink` (building-blocks 1.4), `submenuToggle`/`submenuToggleText` as Options (markup instead), `slideSpeed` (CSS owns timing; the AccordionMenu mixin's `$duration`), DropdownMenu `clickOpen` (a parent is a button, so a click always toggles), `disableHoverOnTouch` (the hover helper ignores touch pointers per event), `forceFollow` (the Hybrid item's link navigates), `verticalClass` and `rightClass` (class-name Options), Drilldown's `href` removal, and Foundation's `data-is-click` bookkeeping.

### CSS class to Angular mapping

| Foundation markup or class | Angular | Rationale |
| --- | --- | --- |
| Every `li` of the menu | `NfsMenuItem`, selector `li[nfsMenuItem]`, `exportAs: 'nfsMenuItem'` | Carries the item and parent classes and the `expanded` state; on leaves too, because Foundation gives every item inside a submenu `is-submenu-item` |
| Nested `ul.menu` inside an item | `NfsSubmenu`, selector `ul[nfsSubmenu]`, `exportAs: 'nfsSubmenu'` | Carries the submenu classes, its id, `inert`, and the slide phases |
| Parent `a` that opened a submenu; AccordionMenu's generated `button.submenu-toggle` | `NfsSubmenuToggle`, selector `button[nfsSubmenuToggle]`, `exportAs: 'nfsSubmenuToggle'`; `hybrid` input for the toggle after a link | The disclosure button (building-blocks 1.10; ADR 0004); a native button needs no key handling for Enter and Space |
| Root `ul` with `data-accordion-menu`, `data-drilldown`, `data-dropdown-menu`, `data-responsive-menu` | The plugin specs' root directives, each providing `nfsMenuModeToken` | Out of this spec; they bind the root classes (`accordion-menu`, `drilldown`, `dropdown`) |
| `is-<mode>-submenu-parent`, `is-submenu-item`, `is-<mode>-submenu-item`, `has-submenu-toggle`, `is-active` (dropdown parent), `opens-left`, `opens-right`, `opens-inner` | Host class bindings on `NfsMenuItem` | State classes and Nest classes, never directives |
| `submenu`, `is-<mode>-submenu`, `is-active` (accordion, drilldown), `js-dropdown-active`, `first-sub`, `visible`, `invisible`, `is-closing`, `drilldown-submenu-cover-previous` | Host class bindings on `NfsSubmenu` | Same |
| `submenu-toggle` | Host class binding on `NfsSubmenuToggle` while `hybrid` | Foundation's only toggle styles, applied in every mode |
| `.submenu-toggle-text` span | Consumer-written inside the Hybrid item's toggle | Foundation's visually hidden name holder |
| (none) `data-nfs-expanded` on a parent `li`; `data-nfs-shown` on a submenu | Host attribute bindings | Library-owned hooks for the accordion grid rule, which Foundation's markup has no state for (Animation; ADR 0033) |

The class maps are `computed` records bound with `[class]`. They hold only the keys the utility owns in the current mode, so classes the consumer writes (`menu`, `nested`, `vertical`, the current-page `is-active` on an item that has no submenu) are never keys and are never removed. The one collision is Foundation's own: in dropdown mode `is-active` on a parent `li` means "open", as DropdownMenu's JavaScript used it, so the current section is marked with `aria-current` on its link, not with `is-active` on a dropdown parent.

### Hierarchy and DI shape

```
ngx-foundation-sites/nested-menu  (secondary entry point)
  nfsMenuModeToken : InjectionToken<NfsMenuRoot>        lightweight, type-only import
  nfsMenuRootProviders(mode) -> Provider[]              used by every root directive
    { provide: nfsMenuModeToken, useFactory: () => new NfsMenuRoot(mode) }
    { provide: NfsSubmenu, useValue: null }             cuts registration at a nested root
  NfsMenuRoot                                           created by the factory on the root ul
    mode, items, hasOpenItem, configure(), drive(), handleKeydown(), handleClick(),
    expandAll(), collapseAll(); owns the swap rule
  li[nfsMenuItem]        inject(nfsMenuModeToken, {optional}), inject(NfsSubmenu, {optional})
    ul[nfsSubmenu]       inject(NfsMenuItem)                 (its owner, required)
    button[nfsSubmenuToggle]  inject(NfsMenuItem)            (required)
  uses: Directionality, _IdGenerator, DOCUMENT, DestroyRef, HostAttributeToken,
        afterNextRender, afterRenderEffect; Anchored pane: nfsLightDismiss, nfsHoverIntent,
        nfsDocumentRect, nfsBodyBounds, nfsOverlap; Breakpoint service: none (reduced motion is the mixins' CSS)

consumers (other specs):
  ul[nfsAccordionMenu]   providers: nfsMenuRootProviders('accordion')
  ul[nfsDrilldown]       providers: nfsMenuRootProviders('drilldown')
  ul[nfsDropdownMenu]    providers: nfsMenuRootProviders('dropdown')
  ul[nfsResponsiveMenu]  providers: nfsMenuRootProviders('accordion'); hostDirectives: the three roots;
                         root.drive(mode from rules)
```

- The token carries the root handle, not a bare signal, because items need the root's mode, its per-mode behaviour Options, and a place to register; its name is kept from building-blocks and the prototype. Its value is a plain class created by a factory in the root element's injector, so its constructor can `inject()` `ElementRef` (the root `ul`), `Directionality`, `DOCUMENT`, `DestroyRef`, and `new HostAttributeToken('class')`, and create its own render callbacks.
- Three roots on one `ul`: ResponsiveMenu lists the three root directives in `hostDirectives` and provides the token itself; the providers of the class that declares `hostDirectives` win over its host directives' providers (the directive composition guide), so all three roots and every item read one `NfsMenuRoot` whose mode ResponsiveMenu drives. Each root binds its root class and forwards keys only while `root.mode()` is its own mode, so one root is live and two are idle. This is the prototype's shape, measured in three engines.
- Parent discovery: an item injects the nearest `NfsSubmenu` (`{optional: true}`); `null` means it is a top-level item of the root. Every root re-provides `NfsSubmenu` as `null` (the `CdkAccordionItem` pattern, building-blocks 1.9), so a root nested inside another menu's submenu starts a new tree. A submenu injects its owning item (required: a `ul[nfsSubmenu]` outside a `li[nfsMenuItem]` fails with Angular's missing-provider error, which is the right failure). A toggle injects its item.
- Registration: parent-owned. An item registers with its parent submenu, or with the root when it is top-level, at construction, and unregisters in `DestroyRef.onDestroy`; a submenu and a toggle register themselves on their item. Registration survives `@for`, `@defer`, and projection (building-blocks 1.9). No reader needs a reactive order: the readers that care about order (the arrow keys, and the swap rule's "first open submenu per level") run at event time or in a render callback and sort with `compareDocumentPosition` there, so no `MutationObserver` is kept. `contentChildren` is not used.
- An item with no root in its injector tree emits no classes, still toggles, and binds `hidden` and Foundation's `.is-hidden` as well as `inert` on its closed submenu (no mode CSS hides it, and a consumer's static `menu` class would give it Foundation's `.menu { display: flex }`, which beats normalize's `[hidden]`; building-blocks 1.10; amended 2026-09-26, audit 0005 L4); a development-mode warning names the missing root.
- No Defaults token and no provider function of its own: the utility has no Foundation Options; each plugin root keeps its Defaults token and passes values in through `configure()`. RTL comes from CDK `Directionality`, so a `[dir]` ancestor or the document decides.
- Not an Openable: an item does not provide `nfsOpenableToken`. A bare `nfsClose` on a link inside a menu inside an off-canvas panel must close the panel, not a submenu (Triggers spec, Out of scope: submenu toggles are not Triggers).

### API

Types:

```ts
type NfsMenuMode = 'accordion' | 'drilldown' | 'dropdown';

interface NfsAccordionMenuBehaviour { multiOpen?: () => boolean; }            // Foundation default true
interface NfsDrilldownBehaviour { autoHeight?: () => boolean; }                 // false
interface NfsDropdownMenuBehaviour {
  alignment?: () => 'auto' | 'left' | 'right';                                 // 'auto'
  disableHover?: () => boolean;                                                 // false
  hoverDelay?: () => number;                                                    // 50 ms
  closingTime?: () => number;                                                   // 500 ms
  autoclose?: () => boolean;                                                    // true
  closeOnClick?: () => boolean;                                                 // true: outside press closes
  closeOnClickInside?: () => boolean;                                           // true: leaf click closes all
}
interface NfsMenuCompletion {
  opened?: (item: NfsMenuItem) => void;                                         // for the root's aggregate output
  closed?: (item: NfsMenuItem) => void;
}
```

Missing behaviour functions fall back to Foundation's defaults, listed once in the exported frozen `nfsMenuBehaviourDefaults`, which the plugin specs also use to seed their inputs under their Defaults tokens.

#### `NfsMenuRoot` and `nfsMenuModeToken`

| Member | Type | Meaning |
| --- | --- | --- |
| `mode` | `Signal<NfsMenuMode>` | The Menu mode shown: the factory's mode, or, after `drive()`, the driven function's value on its first read; afterwards it changes only when the swap callback commits a swap (Mode swap, below) |
| `element` | `HTMLUListElement` | The root `ul` |
| `items` | `Signal<readonly NfsMenuItem[]>` | Top-level items, in registration order |
| `hasOpenItem` | `Signal<boolean>` | A top-level item is expanded; the Drilldown root binds `invisible` from it |
| `configure(mode, behaviour & NfsMenuCompletion)` | `void` | Called once by each root directive at construction with its inputs as functions; one slot per mode, so three roots on one `ul` never overwrite each other |
| `drive(mode: () => NfsMenuMode)` | `void` | Stores the driven mode (ResponsiveMenu's requested mode); the swap callback moves `mode` to it |
| `handleKeydown(event, mode)` | `void` | The per-mode key tables; does nothing unless `mode === this.mode()` |
| `handleClick(event, mode)` | `void` | Dropdown `closeOnClickInside`; does nothing outside dropdown mode |
| `expandAll()` | `void` | Opens every submenu, in accordion mode with `multiOpen` on; otherwise does nothing and warns in development |
| `collapseAll()` | `void` | Closes every submenu in any mode; focus inside a closing submenu moves to the top-level toggle that contained it |

`nfsMenuModeToken = new InjectionToken<NfsMenuRoot>('nfsMenuModeToken')` lives in a token file that imports `NfsMenuRoot` as a type only (building-blocks 1.9). `nfsMenuRootProviders(mode: NfsMenuMode): Provider[]` returns the two providers shown in the hierarchy.

The root decides the dropdown Base side (the side, left or right, toward which a dropdown-mode submenu opens before the collision check moves it) once per change of its inputs: `alignment` `'left'` gives `opens-right`, `'right'` gives `opens-left`, and `'auto'` gives `opens-left` when the root's static `class` (read through `HostAttributeToken`) contains Foundation's `align-right`, when `Directionality` is `rtl`, or when the root sits inside `.top-bar-right`, and `opens-right` otherwise. The first two are known at construction, so the server HTML carries them; the ancestry check runs in the first render callback's `earlyRead` phase and can change only the side classes of closed submenus.

Mode swap (ADR 0035). The root keeps the mode it displays (`mode`) separate from the mode it is driven to (the function passed to `drive()`), so a change of the driven mode never re-renders the class maps by itself. One `afterRenderEffect` of the root commits every swap:

1. `earlyRead`: when the driven mode differs from `mode`, read `document.activeElement` and the DOM order of the open submenus while the old mode's classes are still on the page, and plan. Entering accordion changes nothing. Entering drilldown or dropdown with focus inside the root keeps the submenus whose items contain the focused control and closes the rest; entering drilldown also closes the submenu whose own row holds focus, that is, its toggle or, for a Hybrid item, its link, which would otherwise put that row inside an `invisible` level. With focus outside the root, entering drilldown keeps the first open submenu per level (DOM order), and entering dropdown closes every submenu, because an overlay nobody is using must not cover the page and Foundation's DropdownMenu never opened a submenu from a static `is-active`. Focus inside a drilldown back item (`li.js-drilldown-back`) when leaving drilldown is recorded for step 3.
2. `write`: set `mode` and apply the plan in the same phase, so the next change-detection pass renders the new mode and the pruned Open path together. No render shows the new mode's classes over a submenu the swap closes, so the focused control never sits in a hidden subtree and no engine's blur timing is relied on.
3. Refocus: when focus was inside a drilldown back item, which the new mode hides, an `afterNextRender` registered by `write` (`earlyRead` picks the target, `write` focuses) moves it, after the render that applied the swap, to that level's first control that is not inside the back item; the level stays open because focus was inside it. In every other case focus stays on the same node, and nothing moves it when it was outside the menu.

The same callback handles a resize, a change of ResponsiveMenu's rules, and the first-render swap; because it commits the swap itself, it may read the live breakpoint in `earlyRead` (building-blocks 1.5, the second place focus may be recorded). The swap emits nothing of its own: each submenu the plan closes is an ordinary close, so its item's `expanded` model emits `false` and the new live mode emits `closed` with the item once the close completes. `drive()`'s signature is unchanged, and a standalone root is never driven and never swaps. The [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) confirmed the commit order in Chromium, Firefox, and WebKit: `mode` is implementable as a `linkedSignal` whose source is a signal holding the function passed to `drive()` and whose computation calls it inside `untracked` (amended 2026-09-26, audit 0005 L4: the source is the signal holding the function, never the function itself, whose value would track every breakpoint change), so it takes the driven value on its first read; `write` sets `mode` before the pruning; the back-item refocus is an `afterNextRender` registered from `write` with the root's injector, which runs in the batch after the pass that rendered the swap; and no recorded pass showed the new mode over a submenu the swap closes.

#### `NfsMenuItem` (`li[nfsMenuItem]`, `exportAs: 'nfsMenuItem'`)

| Member | Kind | Type | Notes |
| --- | --- | --- | --- |
| `expanded` | model | `boolean`, default `false` | Two-way open state (building-blocks 1.4); `expandedChange` fires when the state is requested. A static `is-active` on its submenu seeds `true` at construction; the submenu reads it after the item's listeners exist, so the seed emits `expandedChange(true)` once during construction (measured by the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md)). A one-way `[expanded]` binding still wins (the Accordion spec's seeding rule); a two-way `[(expanded)]` whose value starts `false` receives `true` from the seed during construction, so the submenu stays open and the consumer's state reads `true`: the static `is-active` wins over a two-way initial value, while a one-way `[expanded]="false"` wins over the class (asserted in the browser-level test; amended 2026-09-26, audit 0005 M5) |
| `opened`, `closed` | outputs | `void` | Completion outputs: after the mode's animation (Animation) |
| `open()`, `close()`, `toggle()` | methods | `void` | Material and building-blocks 1.3 vocabulary; `open()` closes open siblings unless the mode is accordion with `multiOpen` on, and does not open closed ancestors (Foundation's `down()` opened only its target; a consumer opens each item of the Open path); `close()` closes nested open submenus first |
| `isParent` | read-only | `Signal<boolean>` | The item has a submenu |
| `submenu`, `toggleButton` | read-only | `Signal<NfsSubmenu \| null>`, `Signal<NfsSubmenuToggle \| null>` | Registered children |
| `mode` | read-only | `Signal<NfsMenuMode \| null>` | From the root; `null` without one |

Host: `[class]` (the item map), `[attr.data-nfs-expanded]` (present while a parent item is expanded, in every mode), `(transitionend)` (accordion completion, filtered to the host and `grid-template-rows`). Per mode, as parent / in a submenu:

| Mode | Parent item | Item inside a submenu |
| --- | --- | --- |
| accordion | `is-accordion-submenu-parent`; `has-submenu-toggle` when its toggle is `hybrid` | `is-submenu-item is-accordion-submenu-item` |
| drilldown | `is-drilldown-submenu-parent`; `has-submenu-toggle` | `is-submenu-item is-drilldown-submenu-item` |
| dropdown | `is-dropdown-submenu-parent`; `has-submenu-toggle`; `is-active` while expanded; exactly one of `opens-right`, `opens-left`, `opens-inner` | `is-submenu-item is-dropdown-submenu-item` |

In dropdown mode each parent item also calls, in its injection context: `nfsLightDismiss({isOpen: dropdown && expanded, pane: submenu, triggers: [the li], group: null, outsidePress: closeOnClick, close})`, so the item's own row counts as inside and nesting follows DOM containment; and `nfsHoverIntent({triggers: [the li], pane: submenu, enabled: dropdown && !disableHover, isOpen: expanded, openDelay: hoverDelay, closeDelay: closingTime, open, close})`, as the Anchored pane spec requires (its timers clear when `expanded` changes by another path), where a hover-opened submenu closes on leave only while `autoclose` is on and it was not since clicked. The `open` callback does nothing while focus is inside an open submenu of a sibling item: opening would close that submenu under focus, and the focus-loss guard would then move focus to its toggle although the user pressed no key ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)). Sibling closing is the utility's own rule, so the Light dismiss group is `null`.

The collision check runs in one `afterRenderEffect` per parent item and acts only on rendered state (building-blocks 1.5): the item keeps its rendered mode, a signal written by an `effect()` beside its class-map binding, and `earlyRead` returns nothing unless the rendered mode equals `mode()`, the mode is dropdown, and the item is expanded, else measures the submenu with `nfsDocumentRect` against `nfsBodyBounds` and returns the horizontal `nfsOverlap`; `write` steps Base side to the opposite side to `opens-inner` while the overlap is above zero (each step re-renders and re-measures), and returns to the base side on close. Only left and right are checked, as Foundation's `Box.ImNotTouchingYou($sub, null, true)`. Under the Mode swap rule (ADR 0035, above), `mode` changes only in the root's swap callback's `write` phase, so the next change-detection pass renders the dropdown classes before this `earlyRead` runs again; the rendered-mode check keeps the measurement off a drilldown or accordion layout without relying on that hook order, including at the first-render handoff, where an open submenu that holds focus stays open into dropdown mode.

#### `NfsSubmenu` (`ul[nfsSubmenu]`, `exportAs: 'nfsSubmenu'`)

| Member | Kind | Type | Notes |
| --- | --- | --- | --- |
| `id` | input | `string \| undefined` | A consumer's `id` wins (the static attribute sets the input); otherwise `_IdGenerator.getId('nfs-submenu-', true)`; bound as `[id]` |
| `item` | read-only | `NfsMenuItem` | Its owner |
| `items` | read-only | `Signal<readonly NfsMenuItem[]>` | Its registered items |
| `element` | read-only | `HTMLUListElement` | The submenu's host, as `NfsMenuRoot.element` is the root's; the Drilldown wrapper observes each Drilldown level through it (amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decision 27) |

Host: `[id]`, `[class]` (the submenu map), `[attr.aria-labelledby]` (its item's toggle id while the live mode is `drilldown`, else absent), `[attr.inert]` while its item is closed, `[attr.hidden]` and `[class.is-hidden]` while closed and no root exists, `[attr.data-nfs-shown]` while open and settled, `(transitionend)` (drilldown completion, filtered to the host and `transform`). Per mode, always `submenu is-<mode>-submenu`, plus:

| Mode | Classes |
| --- | --- |
| accordion | `is-active` while its item is expanded |
| drilldown | `is-active` while shown (expanded, or closing); `visible` while shown and no child of it is open; `invisible` otherwise (closed, or hidden behind an open child); `is-closing` from close until the slide ends; `drilldown-submenu-cover-previous` unless the root's `autoHeight` is on |
| dropdown | `js-dropdown-active` while expanded; `first-sub` when its item is top-level |

A hidden drilldown ancestor level is never `inert`: the open level is its descendant, and `inert` cannot be undone inside a subtree (prototype row 9). Foundation's `visibility: hidden` takes it out of the tab order and the accessibility tree, and the open level's `visible` overrides it. `.visible` follows `.invisible` in Foundation's CSS, so the two are never bound together.

#### `NfsSubmenuToggle` (`button[nfsSubmenuToggle]`, `exportAs: 'nfsSubmenuToggle'`)

| Member | Kind | Type | Notes |
| --- | --- | --- | --- |
| `hybrid` | input | `boolean` (`booleanAttribute`), default `false` | The toggle follows a navigating link in the same item (APG hybrid disclosure navigation) |

Host: `type="button"` (static; a consumer's static `type` wins), `[attr.id]` (the consumer's static `id`, else `_IdGenerator.getId('nfs-submenu-toggle-', true)`, rewritten at hydration like the submenu ids), `[attr.aria-expanded]` from the item, `[attr.aria-controls]` from the submenu id, `[class.submenu-toggle]` from `hybrid`, and `(click)`. The click handler toggles the item, with one dropdown-mode exception taken from Foundation's `data-is-click` rule: a pointer click (`event.detail > 0`) on a submenu that hover opened keeps it open and marks it click-opened, so hover then click does not close it; a keyboard-generated click always toggles. The handler never calls `preventDefault()`. Development-mode checks in `afterNextRender`: a `hybrid` toggle with no text and no `aria-label` or `aria-labelledby` (the Hybrid item's toggle must name its item, for example "Products pages"); a parent item with a submenu but no toggle (Foundation's `<a href="#">` parent left unmigrated).

#### What each consuming spec maps

| Consumer | Root directive and providers | Root host bindings | `configure()` | Own pieces (its spec) |
| --- | --- | --- | --- | --- |
| AccordionMenu | `ul[nfsAccordionMenu]`, `nfsMenuRootProviders('accordion')` | `[class.accordion-menu]` while accordion; `(keydown)` to `handleKeydown(e, 'accordion')` | `multiOpen` input (default `true`); `opened`/`closed` aggregate outputs with the item | `nfsAccordionMenuDefaultsToken`; `expandAll()`/`collapseAll()` delegating; the `nfs-accordion-menu` mixin holding the rules below |
| Drilldown | `ul[nfsDrilldown]`, `nfsMenuRootProviders('drilldown')` | `[class.drilldown]` and `[class.invisible]` from `hasOpenItem()` while drilldown; `(keydown)` | `autoHeight`; outputs | `nfsDrilldownDefaultsToken`; wrapper (`is-drilldown`, `min-height`, `animate-height`, the `autoHeight` height); `li.js-drilldown-back` back directive, which calls `close()` on its submenu's item and is `hidden` outside drilldown mode; `closeOnClick` (calls `collapseAll()`), `scrollTop*`; `collapseAll()`; the `nfs-drilldown` mixin |
| DropdownMenu | `ul[nfsDropdownMenu]`, `nfsMenuRootProviders('dropdown')` | `[class.dropdown]` while dropdown; `(keydown)`; `(click)` to `handleClick(e, 'dropdown')` | `alignment`, `disableHover`, `hoverDelay`, `closingTime`, `autoclose`, `closeOnClick`, `closeOnClickInside`; outputs | `nfsDropdownMenuDefaultsToken`; `collapseAll()`; the `nfs-dropdown-menu` mixin |
| ResponsiveMenu | `ul[nfsResponsiveMenu]`, `nfsMenuRootProviders` (any initial mode, since `drive()` replaces it at construction); `hostDirectives` the three roots with their inputs and outputs listed | none of its own | none; calls `drive()` with its requested mode, which resolves at `mq.serverBreakpoint` until the directive's first render callback and at the live breakpoint after (`mq.resolve(parsed, mq.serverBreakpoint)`, then `mq.resolve(parsed)`) | `rules` input parsed with `parseNfsBreakpointRules(rules, ['dropdown', 'drilldown', 'accordion'], mq.breakpoints)`; must always yield a mode (a rule string with no Zero-breakpoint rule uses its smallest rule's mode below that breakpoint, with a development warning, instead of Foundation's no-plugin state; a rule set that names no valid mode gives `accordion`) |

Two host directives that expose an input of the same name on one `ul` both receive the binding, which is Foundation's own behaviour (every child plugin read the same `data-*` attributes): `closeOnClick` reaches Drilldown and DropdownMenu, each with its own default. Only the live mode calls its `opened`/`closed` completion functions, so an aggregate output bound on a ResponsiveMenu emits once.

### Implementation level and primitives

Implementation level: custom Angular directives (ADR 0004). Native first: nested `<details>` would give disclosure without script, but `<details name>` (exclusive groups) and `::details-content` (styling the revealed part) are outside the browser target, and a `<summary>` cannot be Foundation's parent button nor carry a separate link. `@angular/aria` has `ngMenuBar`/`ngMenu` and `ngTree`, which apply the `menu`, `menuitem`, and `tree` roles the APG rejects for site navigation; set no tab stop in server HTML (their first active item is chosen in a render callback), so before hydration the Tab key reaches no link; cancel Enter on a link item (Aria's menu maps Enter to its own activation); and, for the tree, put every child level in an `ng-template` group with `[parent]` and `[ownedBy]` inputs, absent from server HTML even when expanded, where a menu needs a `[submenu]` reference per parent and `role="none"` on every item; Drilldown matches neither. `@angular/cdk` has `CdkMenu` (the same roles) and nothing for disclosure navigation; the utility uses CDK only for `Directionality`, `_IdGenerator`, and `hasModifierKey`.

Primitives: host bindings on signals; `model()`, `input()`, `output()`, `computed()`; `HostAttributeToken`; `inert`; Foundation's `invisible`/`visible` classes; `transitionend`; `getComputedStyle` (transition durations in a render callback; the root's `flex-direction`, its first top-level item's `display`, and a control's `visibility` in key handlers, which only run on the client); `Node.compareDocumentPosition` and `contains`; `focus({preventScroll: true})`; `Directionality.valueSignal`; the Anchored pane utility's `nfsLightDismiss`, `nfsHoverIntent`, `nfsDocumentRect`, `nfsBodyBounds`, `nfsOverlap`; `NgZone.runOutsideAngular` for fallback timers. All are in the browser target; `overflow: clip` (Library mixin) is Baseline widely available (Chrome 90, Firefox 81, Safari 16).

Fallback: none needed; the prototype carried every mode on this level in three engines. The swap commit (Mode swap, ADR 0035) was confirmed by the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) in three engines, so the fallback the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md) named (recording the focused control from `focusin`/`focusout` on the root `ul` and restoring it in an `afterNextRender` after the swap) is not adopted; it could not have helped the one case the prototype found, a focused Hybrid link hidden by the new mode, which the keep rule now closes. The alternative shape not taken is one shared, selector-less root host directive that each root lists in `hostDirectives`, merged into one instance under ResponsiveMenu by Angular 22.1's host directive de-duplication; it would give one listener instead of three but was not exercised by the prototype.

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Classes, ARIA, `id`, `inert`, `hidden`, `data-nfs-*` | Host bindings from `computed` | First-paint state must be in server HTML (1.11 decision 1) |
| Registration, seeding from static `is-active`, base side from `alignment`, `HostAttributeToken` and `Directionality` | Constructor | Needed before the first render and before replay; reads no layout |
| Focus after an open or close (drilldown level handoff, Escape, Left, back, keyboard open in dropdown mode) | `afterNextRender` (`earlyRead` picks the target, `write` focuses) | `inert` is removed only by the render that follows the state change; a synchronous `focus()` is a no-op (prototype harness race) |
| Arrow-key moves between controls that are already visible | Synchronous `focus()` in the handler | No state change to wait for |
| Dropdown collision flip | `afterRenderEffect` (`earlyRead`, `write`) per parent item, acting only while the item's rendered mode equals `mode()` | Layout read then class write; idle while closed because it tracks only its own signals; the rendered-mode check makes it measure the dropdown layout, never the classes of the mode before (building-blocks 1.5) |
| Completion (`opened`/`closed`, `data-nfs-shown`, end of `is-closing`) | `afterRenderEffect` `read` phase reads the animated element's computed transition when a phase starts; `transitionend` host listener or fallback timer ends it | The Accordion spec's measured completion; durations are the consumer's settings |
| Mode swap: plan and commit | `afterRenderEffect`: `earlyRead` compares the driven mode with `mode` and on a difference reads `document.activeElement` and DOM order and plans; `write` sets `mode` and applies the plan in the same phase | Focus is read while the old mode's classes still apply, and the new mode and the pruned Open path land in one change-detection pass (ADR 0035); replaces the prototype's `effect`, which read the DOM and propagated state between signals (1.5). 1.5's warning that a callback running after change detection has removed the nodes is too late does not apply: a swap re-classes surviving nodes and removes none, and this `earlyRead` reads focus before the pass that applies the new classes |
| Refocus off a hidden back item after a swap | `afterNextRender` registered by the swap's `write` (`earlyRead` picks the target, `write` focuses) | Runs after the render that applied the swap, so it acts on rendered state (1.5) |
| `.top-bar-right` ancestry | `afterNextRender` `earlyRead`, once | A DOM walk, not allowed before hydration |
| Light dismiss and hover intent | Inside the Anchored pane helpers (`afterRenderEffect`) | Their spec |
| `effect` | One per parent item, beside its class-map binding, writing the rendered-mode signal the collision flip reads; nothing else | Building-blocks 1.5's one exception: it records that a render has happened, which a `computed` cannot express, and only a render callback reads it; nothing else here is a non-DOM side effect |
| `afterEveryRender` | Not used | It would run every item's DOM work after every change detection in the application |

`injectAsync`: not applicable. Nothing is loaded only after a client interaction: a toggle click, a key, and a hover must act in the same pass (and a replayed click must find its handler at once), and the Anchored pane helpers used in dropdown mode are small, inert on the server, and imported with the plugin's entry point, which a consumer's `@defer` already splits.

### Comparison with Angular Material, CDK, and Aria

| Concern | Material `MatMenu` / CDK `CdkMenu` / Aria `ngMenu`, `ngTree` | Nested menu utility |
| --- | --- | --- |
| Pattern and roles | Menu and menubar (`role="menu"`, `menuitem`), or tree (`tree`, `treeitem`, `group`) | Disclosure navigation: native lists, buttons with `aria-expanded`/`aria-controls`, links, no roles |
| Focus | Roving `tabindex` or active descendant; one tab stop; typeahead; Home/End | Every visible control in the tab sequence; optional arrow keys per mode; no typeahead |
| Where submenus live | Overlay panes created from templates (Material, CDK); `ng-template` content (Aria) | The consumer's nested `ul`, in place, in server HTML |
| Nesting | `[matMenuTriggerFor]` on an item; Aria `[submenu]` input; CDK `cdkMenuTriggerFor` | DOM nesting, registered through DI |
| Hover | Material opens nested menus on hover; Aria `expansionDelay` (100 ms) | `nfsHoverIntent` with Foundation's `hoverDelay` (50) and `closingTime` (500), dropdown mode only |
| Close reasons | `MenuCloseReason = void \| 'click' \| 'keydown' \| 'tab'` | Light dismiss reasons (`'click' \| 'keydown' \| 'tab' \| 'sibling'`), used internally for focus return |
| Two-way state | `menuOpen` property; Aria `expanded` models on tree items | `expanded` model per item |
| Container methods | `closeMenu()`; Aria accordion `expandAll()`/`collapseAll()` | `expandAll()`/`collapseAll()` through the root |
| Events | `menuOpened`, `menuClosed`, `closed` | Item `opened`/`closed` (Completion outputs); root aggregates in the plugin specs |

Borrowed: Material's open/close vocabulary, the close-reason words (through Light dismiss), Aria's `expandAll`/`collapseAll` names and its register-plus-sort idea (without its reactive `MutationObserver` order). Not borrowed: roles, roving `tabindex`, typeahead, overlays, template-created panels, `aria-haspopup`.

### ARIA and keyboard

Pattern: Disclosure Navigation Menu (APG), the hybrid variant for Hybrid items, in every mode. The consumer wraps the menu in `nav` with `aria-label` or `aria-labelledby` naming the site's navigation (never "navigation"). WebKit also exposes a `list-style: none` list as a list only inside a navigation landmark, so VoiceOver announces the menu's lists only there (`AccessibilityNodeObject::determineListRoleWithCleanChildren`).

Constant across modes (the swap never changes these):

| Element | Semantics |
| --- | --- |
| Root and submenu `ul`, every `li` | Native `list` and `listitem`; no `role`, and no `aria-*` except, in drilldown mode, `aria-labelledby` on each submenu naming its Drilldown level after its parent toggle (a Hybrid item's level by its toggle, named by its `.submenu-toggle-text`) |
| Parent button (`nfsSubmenuToggle`) | Native `button`, `type="button"`, `aria-expanded`, `aria-controls` = the submenu id; name from its text |
| Hybrid item | `a[href]` (navigates) followed by the toggle, named by its `.submenu-toggle-text` span |
| Current page | `aria-current="page"` on the link, written by the consumer (with the Router: `routerLinkActive` plus `ariaCurrentWhenActive="page"` on the link) |
| Closed submenu | `inert` (out of the tab order and the accessibility tree), hidden by Foundation's mode CSS or the accordion grid |
| Hidden drilldown level | Foundation's `invisible` (`visibility: hidden`) |

Every key handler changes state first, then moves focus, then calls `stopPropagation()`, then `preventDefault()` last, and handles nothing with a modifier key held (`hasModifierKey`). `stopPropagation()` makes a handled key stop at the innermost widget, so Escape inside an open submenu in a Dropdown pane or a Reveal closes only the submenu, and a second Escape reaches the pane. A "control" is an `a[href]` or `button` inside the root that is not in an `inert` or `hidden` subtree and is not `visibility: hidden`; "next" and "previous" follow DOM order.

Every mode:

| Key | Behaviour |
| --- | --- |
| Tab, Shift+Tab | Native, through every control of the open parts of the menu |
| Enter, Space on a toggle | Native `click`: toggle (drilldown: open and hand focus over, below) |
| Enter on a link | Native navigation |
| Escape | On a toggle whose submenu is open: close it, focus stays. Inside an open submenu: close the innermost one containing focus and focus its toggle. Otherwise not handled, so it propagates |

Accordion mode (arrow keys are APG optional keys, Foundation's set):

| Key | Behaviour |
| --- | --- |
| Down, Up | Next or previous control across levels, skipping closed submenus |
| Right | On a collapsed toggle: open, focus stays; otherwise not handled |
| Left | On an expanded toggle: close it; inside a submenu: close that submenu and focus its toggle; otherwise not handled |

Drilldown mode:

| Key or action | Behaviour |
| --- | --- |
| Activating a toggle (click, Enter, Space) or Right on a toggle | Open the level; focus moves to the level's first control that is not inside the back item, with `preventScroll` |
| Left, Escape inside a level below the root | Close the level; focus moves to the toggle that opened it |
| Back button (Drilldown spec) | Same as Left |
| Down, Up | Next or previous control in the current level |

"The back button" is any control inside `li.js-drilldown-back` (Foundation's class, bound statically by the Drilldown spec's `NfsDrilldownBack`), so the first-control rule skips a back item at the top or the bottom of a level (amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decision 14).

Dropdown mode. Along a horizontal top level, forward is Right and back is Left in LTR, swapped in RTL. The keys that open and close submenus, Forward and Back on a vertical top level and inside submenus, follow the Base side: Right opens while the root's Base side is `opens-right`, Left while it is `opens-left`; a collision flip does not change them, as in Foundation. A root whose computed `flex-direction` is `column`, or whose first top-level item's computed `display` is `block` (Foundation's `$global-flexbox: false` build), is vertical; submenus are always vertical (amended 2026-09-26 from the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), decisions 19 and 20):

| Context | Down | Up | Forward | Back |
| --- | --- | --- | --- | --- |
| Top level, horizontal | On a toggle: open, focus its first control | Previous top-level control | Next top-level control | Previous top-level control |
| Top level, vertical | Next top-level control | Previous top-level control | On a toggle: open, focus its first control | Not handled |
| Inside a submenu | Next control in the submenu | Previous control in the submenu | On a toggle: open the nested submenu, focus its first control | Close the submenu, focus its toggle |

Dropdown mode also closes through Light dismiss: focus moving outside an open submenu (Tab or a click elsewhere) closes that submenu and its descendants and nothing above it; Escape with focus outside the menu closes the topmost open submenu (a hover-opened one); an outside press closes while `closeOnClick` is on. Focus returns to the toggle only when a submenu closes by key with focus inside it.

Focus-loss guard (every mode): after any open or close, programmatic ones included, when focus was on a control that the change hides, it moves to the nearest visible equivalent in the next render: into a drilldown level just opened from its toggle, or to the toggle of a submenu just closed. A programmatic open never takes focus from outside the menu.

### WCAG 2.2 AA

| Criterion | Requirement and how it is met | Checked by |
| --- | --- | --- |
| 1.3.1 Info and Relationships | Native nested lists convey the hierarchy; the toggle's `aria-controls` names its submenu | Story axe gate; SSR smoke |
| 1.4.3 Contrast (Minimum) | Parent buttons use `$anchor-color`, the colour Foundation gives menu links (4.65:1 on `$body-background` with defaults); the dropdown open-parent twin uses `$dropdown-menu-item-color-active`; no library rule introduces a new text colour pair. Inside Foundation's default Top Bar both are 3.76:1 against `$topbar-background`, so a dropdown-mode menu in a `.top-bar` needs the bar background the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md) requires (for example `$topbar-background: $white;`), which `nfs-dropdown-menu` warns about at compile time | Story axe gate (`color-contrast`) |
| 1.4.10 Reflow | Dropdown mode: at 320 CSS px no submenu makes the page scroll sideways. Foundation's default `$dropdownmenu-min-width: 200px` fails, because a submenu from a narrow item between about 120 and 200 px from the left fits neither side and `opens-inner` keeps its left edge; the consumer must set `$dropdownmenu-min-width: min(200px, 45vw);`, and `nfs-dropdown-menu` warns at compile time when the setting is a fixed length over 160 px ([Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), decision 24) | e2e at 320 px (Dropdown Menu spec); Sass compile test |
| 1.4.11 Non-text Contrast | Every arrow (Foundation's and the button twins) must reach 3:1 against its background; with defaults `$primary-color` on white is 4.65:1. Each mode's mixin fails the compile with `@error` naming the setting when the ratio of `$<mode>-arrow-color` against its background, computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded, is below 3 (Foundation's `color-contrast()` rounds to one decimal and would pass 2.95:1; building-blocks 1.10): accordion against `$accordionmenu-item-background` or else `$body-background`; drilldown against `$drilldown-background` and `$drilldown-submenu-background`; dropdown against `$dropdownmenu-background` or else `$body-background`, and `$dropdownmenu-submenu-background`. The dropdown mixin also checks the Hybrid toggle's `$accordionmenu-arrow-color` against those dropdown backgrounds when `$accordionmenu-submenu-toggle-background` is `null`, because the arrow then sits on the row's background; the drilldown mixin also checks `$dropdownmenu-arrow-color`, which Foundation uses for the `.align-left`/`.align-right` twins, against the drilldown backgrounds, and the Hybrid toggle's `$accordionmenu-arrow-color` against `$body-background` and `$drilldown-submenu-background` when `$accordionmenu-submenu-toggle-background` is `null` (Sass checks) | Node-level Sass compile test (axe has no 1.4.11 rule) |
| 1.4.12 Text Spacing | An open accordion submenu stops clipping once its opening transition ends (`data-nfs-shown`), so enlarged spacing is not cut off | Browser-level test; e2e |
| 1.4.13 Content on Hover or Focus | Hover-opened dropdown submenus are dismissible (Escape from anywhere, through Light dismiss), hoverable (the Hover region is the item, which contains its submenu), and persistent (no auto-hide; closing after `closingTime` only once the pointer leaves the item); nothing opens on focus | Story play; e2e with a real mouse |
| 2.1.1 Keyboard | Every open, close, and link is reachable with Tab, Enter, and Space alone; arrow keys only add shortcuts; hover opening always has the click equivalent | Story play |
| 2.1.2 No Keyboard Trap | Nothing traps focus; Tab always leaves the menu | e2e |
| 2.4.3 Focus Order | DOM order; closed submenus and hidden drilldown levels are out of the tab order (`inert`, `visibility: hidden`) | e2e Tab sweeps |
| 2.4.7 Focus Visible | The user agent's focus ring on every control: the library removes no outline, and Foundation's `disable-mouse-outline` acts only under what-input's `[data-whatinput='mouse']`, which the library never sets. A collapsed or animating accordion submenu clips, but its controls are `inert` then; an open one does not clip. The drilldown wrapper must clip (the slide needs it), so the `nfs-drilldown` mixin draws focus rings inside the control box (`outline-offset: -2px` on `:focus-visible` links and buttons inside `.is-drilldown`), and no edge of a ring is clipped, `autoHeight` included (rule 13; amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decision 38) | e2e screenshot per mode |
| 2.4.11 Focus Not Obscured (Minimum) | Overlaying dropdown submenus close when focus leaves them, per submenu, so an `opens-inner` submenu dropped over later siblings closes before Tab reaches them (prototype row 25); accordion submenus are in flow and drilldown levels replace each other; a hover-opened submenu over the focused element is dismissible with Escape without moving focus | e2e hit test of the focused control's centre |
| 2.5.8 Target Size (Minimum) | Parent buttons and links fill their row (38 px high with `$menu-items-padding` defaults); the Hybrid item's toggle is `$accordionmenu-submenu-toggle-width` by `-height` (40 px), in every mode because the directive binds `.submenu-toggle`. The mixins fail the compile with `@error` when either toggle setting is below 24 px, and each also when a row of its mode (`1rem` plus twice the first value of the mode's item or submenu item padding, through `rem-calc()`) is below 24 px, because row height is a consumer setting the story gate never sees (Sass checks; amended 2026-09-26, audit 0005 M1) | Story axe gate (`target-size`, turned on by the `wcag22aa` tag); Sass compile test |
| 3.2.1 On Focus | Focus never opens, closes, or navigates | Story play |
| 4.1.2 Name, Role, Value | Buttons with their visible text or the `.submenu-toggle-text` name, `aria-expanded` from state, no invalid or empty roles; a development warning for a nameless hybrid toggle | Story axe gate; browser-level test |

The story axe gate runs with the six tags of ADR 0018 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) in every mode, closed and open, after the animations settle. No Foundation default fails a criterion in accordion or drilldown mode. In dropdown mode two do, as the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md) found: the submenu width at 320 CSS px (1.4.10) and, for a menu inside a Top Bar, the text contrast against the bar (1.4.3). The library's Storybook therefore compiles Foundation with the Dropdown Menu spec's two settings overrides, `$dropdownmenu-min-width: min(200px, 45vw);` and `$topbar-background: $white;`.

### Rendered HTML

Consumer markup (one markup for every mode; a ResponsiveMenu root shown):

```html
<nav aria-label="Main">
  <div nfsDrilldownWrapper>
    <ul class="vertical medium-horizontal menu" nfsResponsiveMenu="drilldown medium-dropdown">
      <li nfsMenuItem>
        <button nfsSubmenuToggle>Products</button>
        <ul class="menu vertical nested" nfsSubmenu>
          <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back</button></li>
          <li nfsMenuItem><a href="/products/boards">Boards</a></li>
          <li nfsMenuItem><a href="/products/wheels">Wheels</a></li>
        </ul>
      </li>
      <li nfsMenuItem>
        <a href="/services">Services</a>
        <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Services pages</span></button>
        <ul class="menu vertical nested" nfsSubmenu>
          <li class="js-drilldown-back" nfsDrilldownBack><button type="button">Back</button></li>
          <li nfsMenuItem><a href="/services/repairs" aria-current="page">Repairs</a></li>
        </ul>
      </li>
      <li nfsMenuItem><a href="/about">About</a></li>
    </ul>
  </div>
</nav>
```

Server HTML at the Server breakpoint `small` (drilldown), abbreviated: directive attributes kept, ids generated, the back and wrapper directives belong to the Drilldown spec:

```html
<ul class="vertical medium-horizontal menu drilldown" jsaction="keydown:;click:;">
  <li class="is-drilldown-submenu-parent">
    <button type="button" aria-expanded="false" aria-controls="nfs-submenu-x1-0" jsaction="click:;">Products</button>
    <ul id="nfs-submenu-x1-0" inert=""
        class="menu vertical nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">
      <li class="js-drilldown-back">...</li>
      <li class="is-submenu-item is-drilldown-submenu-item"><a href="/products/boards">Boards</a></li>
      ...
    </ul>
  </li>
  <li class="is-drilldown-submenu-parent has-submenu-toggle">
    <a href="/services">Services</a>
    <button type="button" class="submenu-toggle" aria-expanded="false" aria-controls="nfs-submenu-x1-1" jsaction="click:;">
      <span class="submenu-toggle-text">Services pages</span></button>
    <ul id="nfs-submenu-x1-1" inert="" class="menu vertical nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">...</ul>
  </li>
  <li><a href="/about">About</a></li>
</ul>
```

Drilldown, hydrated, after opening Products: the root gains `invisible`; the Products `li` gains `data-nfs-expanded`; its button `aria-expanded="true"`; its submenu drops `inert` and `invisible` and gains `is-active visible`, then `data-nfs-shown` after the slide; focus is on Boards. After Back: the submenu gains `is-closing` (still `is-active visible`, now `inert`) until the slide ends, then `invisible`; the root drops `invisible`; focus is on the Products button.

Accordion mode, Products open (a root in accordion mode, same items):

```html
<ul class="vertical menu accordion-menu">
  <li class="is-accordion-submenu-parent" data-nfs-expanded="">
    <button type="button" aria-expanded="true" aria-controls="nfs-submenu-x1-0">Products</button>
    <ul id="nfs-submenu-x1-0" data-nfs-shown="" class="menu vertical nested submenu is-accordion-submenu is-active">
      <li class="is-submenu-item is-accordion-submenu-item"><a href="/products/boards">Boards</a></li>
    </ul>
  </li>
</ul>
```

Dropdown mode after the swap at `medium`, Products open at the right edge (root in LTR, `alignment: 'auto'`):

```html
<ul class="vertical medium-horizontal menu dropdown">
  <li class="is-dropdown-submenu-parent is-active opens-left" data-nfs-expanded="">
    <button type="button" aria-expanded="true" aria-controls="nfs-submenu-x1-0">Products</button>
    <ul id="nfs-submenu-x1-0" data-nfs-shown="" class="menu vertical nested submenu is-dropdown-submenu js-dropdown-active first-sub">...</ul>
  </li>
  <li class="is-dropdown-submenu-parent has-submenu-toggle opens-right">...</li>
</ul>
```

`jsaction` lists the root's replayable listeners (`keydown`; `click` from DropdownMenu, present whenever the DropdownMenu root is on the element) and each toggle's `click`; Angular removes it after hydration. `transitionend` is not a replayable type and adds none. Generated ids differ between server and client and are rewritten at hydration, which is safe because `aria-controls` is itself a host binding (building-blocks 1.5).

### Animation

Per ADR 0003 and building-blocks 1.6 rule 1 (elements stay in the DOM; a State class plus CSS; completion after `transitionend`):

| Mode | What moves | How | Completion |
| --- | --- | --- | --- |
| accordion | The submenu's height | The `nfs-accordion-menu` mixin makes the parent `li` a two-row grid, `grid-template-rows: auto 0fr` to `auto 1fr` while `[data-nfs-expanded]`, `transition: grid-template-rows $duration ease-in-out` (default 250 ms, Foundation's `slideSpeed`; `ease-in-out` stands in for jQuery's `swing`), with the submenu as the clipped second row (`min-height: 0; overflow: hidden` until `[data-nfs-shown]`). An absolutely positioned hybrid toggle takes no grid track (prototype row 7). Replaces `slideDown`/`slideUp` | `transitionend` for `grid-template-rows` on the `li` |
| drilldown | The level | Foundation's own `$drilldown-transition` transform on `.is-drilldown-submenu`, driven by `is-active` and `is-closing` | `transitionend` for `transform` on the submenu |
| dropdown | Nothing | Foundation toggles `display` through `js-dropdown-active` | The render callback after the change |

- Completion follows the Accordion spec: when a phase starts, a `read` phase takes the animated element's computed `transition-duration` plus `transition-delay` for the property (or `all`); zero, a missing entry, or `nfsAnimationsToken.disabled` completes at once; otherwise the matching `transitionend` (target equal to the element, so a nested submenu's transition is ignored) or a fallback timer of the total plus 100 ms, started outside the Angular zone, completes it. `transitioncancel` is ignored; a reversed transition ends with its own `transitionend`. This also fixes Foundation's Drilldown, whose cleanup never ran when `$drilldown-transition` was `none`.
- On completion of an open: `data-nfs-shown` is bound and `opened` fires; of a close: `is-closing` is removed and `closed` fires. `data-nfs-shown` is removed at once when a close starts, so clipping resumes before the row shrinks. At first render an expanded item is already settled: `data-nfs-shown` is in the server HTML and no output fires.
- Disabled animations: while `nfsAnimationsToken.disabled` is set, the item binds `transition: none` on the animated element (the parent `li` in accordion mode, the submenu in drilldown mode), as the Accordion spec's content wrapper does; otherwise `data-nfs-shown` would release the clip while the row is still growing (amended 2026-09-26 from the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), decision 35).
- Reduced motion: each mixin sets `transition-duration: 1ms` on the transitions it adds or awaits under `@media (prefers-reduced-motion: reduce)` (the accordion grid and Foundation's drilldown slide), so completion still fires; `nfs-drilldown` also sets it on Foundation's `.is-drilldown.animate-height` height transition, which the Drilldown spec's `animateHeight` turns on.
- No Motion class, no `animate.enter`/`animate.leave` (nothing is inserted or removed), no `@supports not (grid-template-rows: 0fr)` guard (it tests parsing, never matches in target, and a browser that snaps is the correct fallback; the Accordion spec's reasoning).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the mode's classes, `aria-expanded`, `aria-controls`, `inert`, and `data-nfs-*` are host bindings on signals the directives have at construction, so the server HTML is the menu (rule 1). Closed submenus are hidden by Foundation's CSS (drilldown, dropdown) or by the accordion grid rule; open-at-first-paint submenus (a static `is-active` or a bound `expanded`) render open with `data-nfs-shown`. Nothing is measured on the server: collision classes fall back to the base side, and the Drilldown wrapper's `min-height` comes after hydration (Drilldown spec).
- ResponsiveMenu: the server renders the Server breakpoint's mode (rule 9; ADR 0014), and every instance starts from that mode (ADR 0035; the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md)): its driven mode resolves at the Server breakpoint until its first render callback, so server HTML and deferred blocks hydrate as sent. On a client at another breakpoint the Breakpoint service goes live and ResponsiveMenu's first-render flag flips in the first render callbacks; the root's swap callback, dirtied after its own `earlyRead` already ran, runs again in the same tick, reads focus under the old classes, and commits the new mode with the pruning, which the next pass renders before paint; hydration sees the server's values first, so there is no mismatch (prototype row 17; [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md)). The layout of the Server breakpoint's mode is visible until the app hydrates (prototype row 18), which is the documented cost of server rendering a breakpoint-gated mode.
- Before hydration: construction injects, registers, seeds, and reads `HostAttributeToken` only; focus, layout, observers, timers, document listeners, and the `.top-bar-right` walk run only in render callbacks and handlers (rules 3 to 5). No DOM structure is created: back buttons, toggles, and the wrapper are consumer-written (rule 4).
- Event replay: a toggle's `click` replays and toggles; the handler calls no `preventDefault()`. A root `keydown` replays: state changes, focus moves in the following render, and the trailing `preventDefault()` throws, so Angular's `ErrorHandler` logs one error per replayed handled key, the accepted default of building-blocks Part 4 item 3; `stopPropagation()` runs before it, so an enclosing widget does not handle the key again. A link inside the menu navigates natively before hydration (the root, not the link, carries `jsaction`). Hover uses code-added `pointerenter`/`pointerleave`, which are never replayed, so a stale hover never opens a submenu; Light dismiss listeners are document-level and exist only while a submenu is open, which is never before hydration.
- Hydration boundary: the root and every item and submenu of the menu share one boundary (rule 7); a consumer's `@defer` wraps the whole `nav`, never a submenu, because items register when constructed and a dehydrated branch would be missing from its parent.
- `@defer`: library templates contain no `@defer`; the entry point is separate so a consumer can defer the menu. Inside a dehydrated block the menu is its server HTML; a click on a toggle hydrates the block and replays. Inside `hydrate never` the links work and the toggles do nothing; closed submenus stay closed. Plain `@defer` renders on the client: a standalone root has no swap, and a ResponsiveMenu root renders the Server breakpoint's mode and swaps in the same tick, never painted.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; the fallback timers and the helpers' listeners run outside the zone and reach Angular only by writing signals.

### Sass and custom CSS

The utility has no mixin of its own. Its rules are emitted by the three plugin Library mixins, each keyed on its root class so that only the live mode's rules match a ResponsiveMenu: `nfs-accordion-menu`, `nfs-drilldown`, `nfs-dropdown-menu`. The rules, their reasons, and the settings they reuse are listed once in the Sass subsection under Further Notes; the plugin specs refer to it.

## Testing Decisions

A good test asserts what a user or assistive technology observes: which classes and ARIA each element carries in each mode, whether a submenu is `inert`, where focus is after each key, what the server HTML contains, and which outputs fired. No test reads a directive's private fields. Tests that need a root before the plugin specs exist use a test root: a directive on `ul` that calls `nfsMenuRootProviders` with a mode input, binds the three root classes, forwards `keydown` and `click`, calls `configure()` from its inputs, and can `drive()` the mode from a signal; it lives with the tests and stories, not in the public API. Prior art: the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) suite (classes, roles, keys, grid samples, collision, focus continuity F1 to F4, server HTML, axe per mode), the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) suite (the per-pass recorder of the swap commit, the Hybrid-link case, the static `is-active` seed), and the Anchored pane spec's test consumers.

Story ids follow `nested-menu--<story>`: `nested-menu--accordion`, `nested-menu--accordion-single`, `nested-menu--hybrid`, `nested-menu--drilldown`, `nested-menu--dropdown`, `nested-menu--dropdown-vertical`, `nested-menu--dropdown-hover`, `nested-menu--dropdown-edge`, `nested-menu--rtl`, `nested-menu--mode-swap` (mode driven by a story arg), and `nested-menu--fixture` (args-driven mode, direction, viewport position, and open items for e2e).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` on the six WCAG 2.2 AA tags (ADR 0018), closed and after opening, waiting for running animations to finish.

- `nested-menu--accordion`: the Nest classes per the item table; Enter and Space toggle `aria-expanded`, `is-active`, and `inert`; two sections open together (`multiOpen` default); Down and Up skip a closed section; Right opens, Left closes, Escape closes and focuses the toggle; `opened` and `closed` appear once each.
- `nested-menu--accordion-single`: with `multiOpen` off, opening a section closes its open sibling.
- `nested-menu--hybrid`: the link navigates (href unchanged), the toggle carries `submenu-toggle`, its item `has-submenu-toggle`, in all three modes (arg); its name is the span text.
- `nested-menu--drilldown`: opening moves focus to the first non-back control of the level; the root gains `invisible`, the level `is-active visible`; Left, Escape, and Back return and refocus; Tab never reaches a hidden level.
- `nested-menu--dropdown`: `first-sub`, `opens-right`, `js-dropdown-active`, `is-active`; Right and Left move along the top level, Down opens and focuses; opening a sibling closes the other; Tab out of a submenu closes it; a leaf click closes all; an outside click closes.
- `nested-menu--dropdown-vertical`: Down and Up move along the top level and Right opens.
- `nested-menu--dropdown-hover`: hover opens after the delay; moving into the submenu keeps it open; leaving closes after `closingTime`; hover then click keeps it open and a second click closes; Escape with focus outside closes.
- `nested-menu--dropdown-edge`: near the right edge the nested submenu carries `opens-left`; with no room either side, `opens-inner`; closing restores the base side.
- `nested-menu--rtl`: under `dir="rtl"`, `opens-left` by default, Left moves forward along the top level, and Left opens a nested submenu and Right closes it (Base side `opens-left`); in LTR with the root's static `align-right`, Left opens and Right closes inside submenus while Right still moves forward along the top level.
- `nested-menu--mode-swap`: with focus inside an open submenu, a swap from dropdown to drilldown keeps focus there and the submenu open; with focus on an open submenu's toggle, entering drilldown closes that submenu and keeps focus on the toggle; with focus on the link of a Hybrid item whose submenu is open, entering drilldown closes that submenu and keeps focus on the link; accordion with two open sections to dropdown keeps only the focused one; with focus on a story control outside the menu, entering dropdown closes every submenu (each item emits `expandedChange(false)` and `closed` fires once per closed item) and entering drilldown keeps the first open submenu per level; entering accordion closes nothing; with focus on a back button inside an open drilldown level, leaving drilldown puts focus on that level's first control that is not inside the back item; after every swap `mode` matches the root class.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Class maps, data-driven: every mode, parent and leaf, top-level and nested, open, closing, and closed, against the tables in API; a consumer's static `menu nested vertical` and a leaf's static `is-active` survive every mode change.
- DI: a nested root starts a new tree (its items register with it, not the outer submenu); an item without a root warns, emits no mode classes, and binds `hidden` and `.is-hidden` on its closed submenu, which stays hidden under a static `menu` class; three roots under a driving test root share one `NfsMenuRoot` and only the live one's key handler acts.
- Registration under `@for` add, remove, and reorder, and inside `DeferBlockBehavior.Manual` blocks; the swap rule's "first open per level" follows DOM order after a reorder.
- Swap commit under a driving test root: a `MutationObserver` on the root subtree, drained after each change-detection pass, never records a state in which the root carries the new mode class while a submenu the swap closes is still open; in the prototype's F3 case and the Hybrid-link case no record shows the row that holds focus inside an `invisible` level; `mode` changes only in the pass that applies the pruning; `document.activeElement` is the same element before and after each swap for F1 to F4 and the Hybrid-link case; the observer is drained from an `afterEveryRender({earlyRead})` registered with the root environment injector (no view), which runs first in every after-render batch, so each drain covers the passes since the last batch (the recipe of the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md)); a back item holding focus hands it to the level's first non-back control after one `whenStable()`, never to `body`.
- Seeding: a static `is-active` on a submenu opens it and emits `expandedChange(true)` once during construction; a one-way `[expanded]="false"` wins; a two-way `[(expanded)]` whose initial value is `false` next to a static `is-active` receives the seed's emission first: after the first `whenStable()` the submenu is open, the host's bound state reads `true`, and `expandedChange` fired once with `true` (the result the API table states).
- `configure()`: defaults from `nfsMenuBehaviourDefaults` when a slot is missing; ResponsiveMenu-style duplicate slots do not overwrite each other; only the live mode's completion functions are called.
- Completion with a fake timer and dispatched `transitionend`: the matching property and target completes; a nested submenu's event does not; zero duration and `nfsAnimationsToken.disabled` complete at once; the fallback fires at total plus 100 ms; `data-nfs-shown` timing.
- Focus-loss guard and `afterNextRender` ordering: a focus move after `expanded.set(true)` lands once `inert` is gone; `preventScroll` is passed in drilldown.
- Hover and keyboard focus in dropdown mode: with focus on a link inside Item 2's open submenu, hovering Item 1 past `hoverDelay` opens nothing, Item 2 stays open, and focus stays on the link; with focus outside the menu, the same hover opens Item 1 and closes Item 2.
- Drilldown level names: in drilldown mode each submenu's `aria-labelledby` equals its parent toggle's `id`, the Hybrid level's included (the toggle, not the link); in accordion and dropdown mode no submenu carries it; a mode swap adds or removes it with the mode.
- Alignment: `alignment`, the static `align-right` class, a `Directionality` test double backed by a signal (or CDK's `[dir]` wrapper), and a `.top-bar-right` ancestor each give the documented side; the dropdown Open and Close keys follow that Base side, while Next and Previous along a horizontal top level follow `Directionality`.
- Vertical detection: a root whose computed `flex-direction` is `column`, and a root whose first top-level item computes `display: block` (a `$global-flexbox: false` build), each use the vertical top-level row of the dropdown key table.
- Replay-safe handlers: a `keydown` whose `eventPhase` reads 101 and whose `preventDefault` throws changes state, moves focus, stops propagation (an outer spy sees nothing), and reaches `ErrorHandler` once; a replay-shaped toggle `click` toggles with no error.
- Dev-mode warnings: a nameless hybrid toggle, a parent without a toggle, `expandAll()` outside accordion or with `multiOpen` off; none for correct markup.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.

- SSR smoke: `renderApplication` over a fixture with a test root in each mode, a Hybrid item, an open-at-first-paint submenu from a static `is-active`, a driven root at the Server breakpoint, and a menu inside `@defer (hydrate on interaction)`. Assert `whenStable()` resolves (no pending timers); the HTML matches the Rendered HTML section: classes per mode, `aria-expanded`, `aria-controls` resolving to an element, `inert` on closed submenus, `data-nfs-expanded` and `data-nfs-shown` on the open one, no `role` attribute anywhere, no inline style; `jsaction` on the root (`keydown`, and `click` for dropdown) and on each toggle (`click`); `ngb` and `click:;keydown:;` on the deferred block's root.
- Pure logic, table-driven: the class-map functions per mode and state, the dropdown Base side rule, the key-to-action table per mode, direction, and Base side, and the swap pruning plan from a description of the open tree, the focused control (inside, outside, or on a back item), and the mode entered.
- Sass compile (the library's node-level Sass test): each mixin compiles after Foundation with defaults; a failing arrow colour, a 20 px toggle setting, and a mode's item padding of `0.2rem 1rem` (a 22.4 px row) each stop the compile with the named setting, in each of the three mixins; with `$accordionmenu-submenu-toggle-background: null`, an `$accordionmenu-arrow-color` below 3:1 against the dropdown backgrounds stops `nfs-dropdown-menu`; `nfs-drilldown` emits rule 13 and names `.is-drilldown.animate-height` in its reduced-motion block.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `nested-menu--fixture` through `mount(storyId, props)`, in Chromium, Firefox, and WebKit:

- Real key presses for each mode's table, including RTL; Tab sweeps (WebKit's default Tab skips links, as the prototype recorded, so its sweep asserts buttons only).
- The accordion grid animates (intermediate heights) and snaps under `emulateMedia({reducedMotion: 'reduce'})`; a focus ring inside an open submenu is not clipped.
- Drilldown: after opening, the focused control is on screen and the wrapper's `scrollLeft` is 0; a Tab pressed during the slide never scrolls the wrapper (`overflow: clip`).
- 2.4.11: at 400 px with `opens-inner`, tabbing on from the nested submenu's last item lands on an uncovered control (centre hit test).
- Collision flips near the right edge and at 400 px, measured against the viewport result.
- Hover with a real mouse path from the item into the submenu; touch emulation (`hasTouch`) taps toggle and never hover-open.
- Mode swaps by resizing the viewport across a breakpoint, cases F1 to F4 of the prototype: focus stays on the same control and is never `body`.
- Focus ring visible in each mode (screenshot comparison).

Against the prerendered fixture app, one route with a ResponsiveMenu-shaped test root (`drilldown medium-dropdown`), prerendered at `small`:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; the drilldown layout, closed levels hidden.
- Hydration at 1280 px: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`; after hydration the root carries `dropdown` only.
- Statically open submenu (a static `is-active`) near the right edge, prerendered at `small`, hydrated at 1280 px: with focus on one of its links before hydration (main bundle held back), the swap keeps it open and its item ends with the `opens-*` class a fresh open at that position gives, never one measured from the drilldown layout; with focus outside the menu, the swap closes it and its item carries the Base side class.
- Pre-hydration click on a toggle with the main bundle held back: the submenu opens exactly once after hydration; a pre-hydration ArrowDown on a focused toggle replays with the one accepted error log.
- `@defer (hydrate on interaction)` around the `nav`: a toggle click hydrates and opens; `hydrate never`: links navigate, toggles do nothing, no error.

## Out of Scope

- The root directives, their Options, Defaults tokens, aggregate outputs, and `exportAs` names: the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), and [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md).
- Drilldown's wrapper, measurement, back button directive, `closeOnClick`, `animateHeight`, `autoHeight` height, and `scrollTop`.
- Opt-in `role="menu"` or `role="tree"` variants (map, Out of scope).
- Typeahead, Home and End (APG optional keys Foundation never had), and roving `tabindex`.
- `parentLink` clones and any generated DOM.
- Mega menus and arbitrary content inside submenus beyond links and nested lists.
- Runtime theming; native `popover` and anchor positioning (Further Notes).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Three directives on the consumer's `li`, `ul`, and `button`, plus a root handle behind `nfsMenuModeToken` | ADR 0001 and ADR 0004; the prototype carried all modes this way | A menu component that renders the tree (breaks Foundation's markup) |
| D2 | The token's value is `NfsMenuRoot`, created by `nfsMenuRootProviders(mode)` in the root's injector | Items need mode, behaviour Options, and a registry; a factory can inject the root element and create render callbacks | A bare `Signal<NfsMenuMode>` token (items would need a second token for everything else) |
| D3 | Three roots on one `ul`, ResponsiveMenu's provider wins, each root forwards keys only in its mode | The prototype's measured shape; the composition guide's provider rule | One merged root host directive through 22.1 de-duplication (unproven here) |
| D4 | Per-mode behaviour slots through `configure(mode, ...)` | Three roots on one element never overwrite each other; plugin specs stay thin | Behaviour inputs on the items; one shared Options object |
| D5 | `nfsMenuItem` on every `li`, leaves included | Foundation gives every submenu item `is-submenu-item`; the registry and the focus-loss guard need them | Directives on parents only (loses Foundation's classes) |
| D6 | Parent-owned registration, sorted at event time, no `MutationObserver` | No reader needs a reactive order | Aria's `SortedCollection` observer per submenu |
| D7 | Class maps hold only keys the utility owns in the current mode | Consumer-written classes survive every swap | One map with every class set to `false` (strips a leaf's current-page `is-active`) |
| D8 | Disclosure roles in every mode; `aria-expanded` on the button; `inert` on closed submenus | ADR 0004; APG; building-blocks 1.10 | Nest's roles; `aria-expanded` on the `li` (invalid on `listitem`) |
| D9 | Hidden drilldown ancestor levels use Foundation's `invisible`, never `inert` | `inert` on an ancestor blocks the open level (prototype row 9) | building-blocks' "`inert` on the hidden parent level" |
| D10 | Hybrid toggles carry `.submenu-toggle` in every mode | Foundation's only toggle styles; without them axe `target-size` failed (prototype row 20) | Accordion-only toggle styling |
| D11 | Accordion grid keyed on `data-nfs-expanded` on the `li`, clip released by `data-nfs-shown` on the submenu | Foundation keys this state on an attribute of the `li` (`[aria-expanded]`) that the library cannot use; a `data-nfs-*` attribute keeps the State class vocabulary Foundation's, as the Sticky spec's `data-nfs-sticky-on`; releasing the clip is the Accordion spec's rule | A library `is-expanded` class (contradicts the glossary's State class); `is-active` on the `li` (Foundation's active-link style on the Hybrid link, and strips a consumer's `is-active`); an inline style binding (consumers need `!important`); `aria-expanded` on the `li` |
| D12 | Dropdown close through Light dismiss per submenu (focus, Escape, outside press) | ADR 0024 covers submenus; per-submenu scope meets 2.4.11 under `opens-inner` (prototype row 25) | The prototype's root `focusout` (a second mechanism beside the registry) |
| D13 | Hover through `nfsHoverIntent` with the item as the Hover region | 1.4.13 hoverable; touch filtered per event | Foundation's `mouseenter` timers and device-wide `disableHoverOnTouch` |
| D14 | A pointer click on a hover-opened submenu keeps it open | Foundation's `data-is-click` behaviour; hover then click must not flicker | Plain toggle on every click |
| D15 | Collision through the Anchored pane's `nfsDocumentRect`, `nfsBodyBounds`, horizontal `nfsOverlap` | Foundation's body-box rule, one implementation | The prototype's viewport-width check |
| D16 | Key handlers: state, focus, `stopPropagation()`, `preventDefault()` last | Replay safety (building-blocks 1.5); innermost widget handles Escape first | `preventDefault()` first; no `stopPropagation()` |
| D17 | Focus moves after state changes in `afterNextRender`; drilldown with `preventScroll` | `inert` lands on the next render; the wrapper scrolled sideways without it (prototype rows 11 and F4) | Synchronous `focus()` |
| D18 | The root displays `mode` apart from the driven mode and commits every swap in its own `afterRenderEffect` (ADR 0035): `earlyRead` reads focus and DOM order under the old classes, `write` sets `mode` and prunes; keep the submenus holding focus, close the submenu whose own row, toggle or Hybrid link, holds focus when entering drilldown; with focus outside, the first open per level in drilldown and none in dropdown; entering accordion changes nothing; focus leaves a hidden back item for its level's first control | Prototype F1 to F4; in F3 a render of the new mode before the pruning puts the focused toggle inside an `invisible` level, and without pruning focus fell to `body` in three engines; building-blocks 1.5 forbids the prototype's `effect` and names the render callback that commits the swap as a place to record focus; the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) confirmed the commit in three engines and found that a kept Hybrid submenu whose link holds focus drops focus to `body` on entering drilldown, hence the row rule | `mode` following the driven function in change detection with the pruning in a later callback (one pass shows the new mode over submenus about to close); closing everything (Foundation's destroy), or no pruning (focus lost to `body`) |
| D19 | Completion measured from computed transitions, fallback total plus 100 ms | The Accordion spec's method; fixes Foundation's `transition: none` hang | Declared constant durations |
| D20 | Rules in the three plugin mixins, keyed on the root class | ADR 0012's one mixin per plugin; ResponsiveMenu consumers include the modes they use | An `nfs-nested-menu` mixin (a mixin with no Foundation export mixin to follow) |
| D21 | Compile-time `@error` for arrow contrast and toggle size | ADR 0022; axe has no 1.4.11 rule | Runtime checks; recommendations |
| D22 | Not an Openable | A bare `nfsClose` in a menu inside an off-canvas must close the off-canvas | Items providing `nfsOpenableToken` |
| D23 | No `injectAsync`, no `afterEveryRender`, and no `effect` except the rendered-mode signal beside each parent item's class map | Nothing loads after interaction; the one `effect` is building-blocks 1.5's rendered-state exception, read only by the collision flip; per-render work would scale with every item | Lazy Anchored pane helpers on first hover; the collision flip keyed on `mode()` alone (it could measure the layout of the mode before) |

### Usage examples

The DropdownMenu root, abbreviated (the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md) owns its inputs):

```ts
@Directive({
  selector: 'ul[nfsDropdownMenu]',
  exportAs: 'nfsDropdownMenu',
  providers: [nfsMenuRootProviders('dropdown')],
  host: {
    '[class.dropdown]': 'root.mode() === "dropdown"',
    '(keydown)': 'root.handleKeydown($event, "dropdown")',
    '(click)': 'root.handleClick($event, "dropdown")',
  },
})
export class NfsDropdownMenu {
  protected readonly root = inject(nfsMenuModeToken, {self: true});
  readonly hoverDelay = input(nfsMenuBehaviourDefaults.dropdown.hoverDelay, {transform: numberAttribute});
  readonly closingTime = input(nfsMenuBehaviourDefaults.dropdown.closingTime, {transform: numberAttribute});
  // ... alignment, disableHover, autoclose, closeOnClick, closeOnClickInside, seeded from its Defaults token
  readonly opened = output<NfsMenuItem>();
  readonly closed = output<NfsMenuItem>();

  constructor() {
    this.root.configure('dropdown', {
      hoverDelay: this.hoverDelay,
      closingTime: this.closingTime,
      opened: (item) => this.opened.emit(item),
      closed: (item) => this.closed.emit(item),
    });
  }

  collapseAll(): void {
    this.root.collapseAll();
  }
}
```

The AccordionMenu root adds `multiOpen` and `expandAll()`; the Drilldown root binds `[class.invisible]="root.mode() === 'drilldown' && root.hasOpenItem()"`. ResponsiveMenu:

```ts
const menuModes = ['dropdown', 'drilldown', 'accordion'] as const;

@Directive({
  selector: 'ul[nfsResponsiveMenu]',
  providers: [nfsMenuRootProviders('accordion')],
  hostDirectives: [
    {directive: NfsAccordionMenu, inputs: ['multiOpen'], outputs: ['opened', 'closed']},
    {
      directive: NfsDrilldown,
      inputs: ['autoHeight', 'animateHeight', 'closeOnClick', 'scrollTop', 'scrollTopElement', 'scrollTopOffset'],
      outputs: ['opened', 'closed'],
    },
    {
      directive: NfsDropdownMenu,
      inputs: ['alignment', 'disableHover', 'hoverDelay', 'closingTime', 'autoclose', 'closeOnClick', 'closeOnClickInside'],
      outputs: ['opened', 'closed'],
    },
  ],
})
export class NfsResponsiveMenu {
  readonly #mq = inject(NfsMediaQuery);
  readonly rules = input.required<string | NfsBreakpointRules<(typeof menuModes)[number]>>({alias: 'nfsResponsiveMenu'});
  readonly #parsed = computed(() => parseNfsBreakpointRules(this.rules(), menuModes, this.#mq.breakpoints));
  readonly #rendered = signal(false); // the first-render flag
  // the Server breakpoint's mode until the first render callback, then the live breakpoint's; below the smallest
  // rule breakpoint that rule's mode, and 'accordion' when no rule is valid (the ResponsiveMenu spec's fallback)
  readonly #requested = computed(() => {
    const parsed = this.#parsed();
    const mode = this.#rendered() ? this.#mq.resolve(parsed) : this.#mq.resolve(parsed, this.#mq.serverBreakpoint);

    return mode ?? smallestMode(parsed) ?? 'accordion';
  });

  constructor() {
    // the root shows this mode on its first read and moves to later values only in its swap callback
    inject(nfsMenuModeToken, {self: true}).drive(this.#requested);
    afterNextRender({write: () => this.#rendered.set(true)});
  }
}
```

Consumer markup for an AccordionMenu with an item open at first paint, a Hybrid item, and the Router marking the current page:

```html
<nav aria-label="Docs">
  <ul class="vertical menu" nfsAccordionMenu [multiOpen]="false">
    <li nfsMenuItem>
      <button nfsSubmenuToggle>Getting started</button>
      <ul class="menu vertical nested is-active" nfsSubmenu>
        <li nfsMenuItem>
          <a routerLink="/install" routerLinkActive ariaCurrentWhenActive="page">Install</a>
        </li>
      </ul>
    </li>
    <li nfsMenuItem #guides="nfsMenuItem" [(expanded)]="guidesOpen">
      <a routerLink="/guides">Guides</a>
      <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Guides pages</span></button>
      <ul class="menu vertical nested" nfsSubmenu>
        <li nfsMenuItem><a routerLink="/guides/theming">Theming</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The Nested menu relies on Foundation's export mixins `foundation-menu`, `foundation-accordion-menu`, `foundation-drilldown-menu`, `foundation-dropdown-menu`, and `foundation-visibility-classes` (`invisible`, `visible`). A Hybrid item in any mode also needs `foundation-accordion-menu`, which holds Foundation's only `.submenu-toggle` and `.has-submenu-toggle` rules. Its documented custom CSS is emitted by the three plugin Library mixins of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), each included after its Foundation export mixin: `@include nfs-accordion-menu;` after `foundation-accordion-menu`, `@include nfs-drilldown;` after `foundation-drilldown-menu`, `@include nfs-dropdown-menu;` after `foundation-dropdown-menu`. A ResponsiveMenu consumer includes the ones for the modes in its rules. There is no `nfs-nested-menu` mixin.

(1) Rules, each scoped to its mode's root class:

| # | Mixin | Selector | Declarations | Reason |
| --- | --- | --- | --- | --- |
| 1 | all three | `.<root> li > button:not(.submenu-toggle)` (`.accordion-menu`, `.drilldown`, `.dropdown.menu`) | `display: block; width: 100%; line-height: 1; text-align: start; color: $anchor-color; cursor: pointer`, plus the mode's item padding and, where the setting is not `null`, background: accordion `$accordionmenu-padding`/`$accordionmenu-item-background`, submenu items `$accordionmenu-submenu-padding`; drilldown `$drilldown-padding`/`$drilldown-background`, submenu items `$drilldown-submenu-padding`; dropdown top level `$dropdownmenu-padding`/`$dropdownmenu-background`, submenu items `$dropdownmenu-submenu-padding` | Parents are buttons (ADR 0004); Foundation's `menu-base` and mode rules style only `a` and `.button`, and its button reset leaves a `<button>` inline and unpadded |
| 2 | `nfs-accordion-menu`, gated on `$accordionmenu-arrows` | `.accordion-menu .is-accordion-submenu-parent:not(.has-submenu-toggle) > button` and its `::after`, `[aria-expanded='true']::after`, and the `.align-left`/`.align-right` twins | Foundation's arrow geometry through `css-triangle($accordionmenu-arrow-size, $accordionmenu-arrow-color, down)`; rotation keyed on the button's own `aria-expanded` | Foundation draws the arrow on `> a::after` and reads `aria-expanded` from the `li` |
| 3 | `nfs-accordion-menu($duration: 250ms)` | `.accordion-menu .is-accordion-submenu-parent` | `display: grid; grid-template-rows: auto 0fr; transition: grid-template-rows $duration ease-in-out` | Replaces `slideDown`/`slideUp`; Foundation's Sass has no height rule. `$duration` is a parameter because Foundation's timing was a JavaScript Option (`slideSpeed`) with no Sass setting |
| 4 | `nfs-accordion-menu` | `.accordion-menu .is-accordion-submenu-parent[data-nfs-expanded]` | `grid-template-rows: auto 1fr` | The open row (Animation) |
| 5 | `nfs-accordion-menu` | `.accordion-menu .is-accordion-submenu-parent > .is-accordion-submenu` and `...[data-nfs-shown]` | `min-height: 0; overflow: hidden`; then `overflow: visible` | Clip only while collapsed or animating (focus rings, 1.4.12) |
| 6 | `nfs-drilldown`, gated on `$drilldown-arrows` | `.drilldown .is-drilldown-submenu-parent > button:not(.submenu-toggle)` with `::after`; `.drilldown .js-drilldown-back > button::before`; the `.align-left`/`.align-right` twins | `css-triangle($drilldown-arrow-size, $drilldown-arrow-color, $global-right)` and the back arrow toward `$global-left`, Foundation's positions; the twins with `$dropdownmenu-arrow-size` and `$dropdownmenu-arrow-color`, as Foundation's own twins (the Drilldown Menu spec's rule 2) | Foundation draws both arrows on `a` |
| 7 | `nfs-drilldown` | `.drilldown .is-drilldown-submenu-parent.has-submenu-toggle`, its `> a`, its `> .submenu-toggle` | `display: flex`; `flex: 1 1 auto; margin-inline-end: 0`; `position: static; flex: none` | Foundation's toggle is absolutely positioned against a positioned `li`; a drilldown `li` must stay unpositioned because the level slides against the root |
| 8 | `nfs-drilldown`, `nfs-dropdown-menu` | `.drilldown .has-submenu-toggle > a::after`, `.dropdown.menu li.has-submenu-toggle > a::after` | `content: none` | These modes' link arrows lack AccordionMenu's `.has-submenu-toggle` exclusion, so a Hybrid item would draw two arrows |
| 9 | `nfs-drilldown` | `.is-drilldown` | `overflow: clip` | Overrides Foundation's `overflow: hidden`, which a focus during the slide can scroll sideways (prototype rows 11 and 12) |
| 10 | `nfs-dropdown-menu`, gated on `$dropdownmenu-arrows` | `.dropdown.menu > li.is-dropdown-submenu-parent > button:not(.submenu-toggle)` (position, `padding-inline-end: $dropdownmenu-arrow-padding`, down `::after`); the `.vertical` root and nested `.is-dropdown-submenu .is-dropdown-submenu-parent.opens-left`/`.opens-right > button::after` side arrows, and the same `.<bp>-vertical` and `.<bp>-horizontal` variants inside `breakpoint()` for each of `$breakpoint-classes` (the Dropdown Menu spec's rule (c)) | Foundation's `dropdown-menu-direction` and `zf-dropdown-left-right-arrows` geometry with `$dropdownmenu-arrow-size` and `$dropdownmenu-arrow-color` | Foundation draws every arrow on `> a` |
| 11 | `nfs-dropdown-menu` | `.dropdown.menu > li.is-active > button` | `background: $dropdown-menu-item-background-active; color: $dropdown-menu-item-color-active` | Foundation paints the open top-level parent on `> a` |
| 12 | `nfs-accordion-menu`, `nfs-drilldown` | inside `@media (prefers-reduced-motion: reduce)`: rule 3's selector; `.drilldown .is-drilldown-submenu`, `.is-drilldown.animate-height` | `transition-duration: 1ms` | Reduced motion for the transitions the library adds or awaits, and for the height transition the Drilldown spec's `animateHeight` turns on (building-blocks 1.6 rule 5; `.is-drilldown.animate-height` amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decision 28) |
| 13 | `nfs-drilldown` | `.is-drilldown a:focus-visible`, `.is-drilldown button:focus-visible` | `outline-offset: -2px` | The wrapper must clip, so rings drawn outside a control lose their edges at the wrapper's sides (and, with `autoHeight`, top and bottom); an inset ring keeps every edge visible (2.4.7; amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decision 38) |

Checks (no CSS output): each mixin stops the compile with `@error` naming the setting when its arrow colour is below 3:1 against its backgrounds (1.4.11) or when `$accordionmenu-submenu-toggle-width` or `-height` is below 24 px (2.5.8). Every mixin that checks the toggle size also stops the compile when `$accordionmenu-submenu-toggle-background` is not `null` and the arrow colour is below 3:1 against it, whatever the mode's arrow boolean, because Foundation draws the Hybrid item's arrow unconditionally (amended 2026-09-26 from the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), decision 37). When `$accordionmenu-submenu-toggle-background` is `null`, the Hybrid item's arrow sits on the row's background, so `nfs-dropdown-menu` also stops the compile when `$accordionmenu-arrow-color` is below 3:1 against `$dropdownmenu-background` or else `$body-background`, and against `$dropdownmenu-submenu-background` (amended 2026-09-26 from the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), decision 25). `nfs-drilldown` likewise stops the compile, when `$accordionmenu-submenu-toggle-background` is `null`, if `$accordionmenu-arrow-color` is below 3:1 against `$body-background` and `$drilldown-submenu-background` (1.4.11), and when a row, `1rem` plus twice the first value of `$drilldown-padding` or `$drilldown-submenu-padding` converted with `rem-calc()`, is below `rem-calc(24)` (2.5.8, rows at line height 1) (amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decisions 34 and 40). `nfs-drilldown` also stops the compile when `$dropdownmenu-arrow-color`, which Foundation uses for the `.align-left`/`.align-right` twins, is below 3:1 against `$drilldown-background` or `$drilldown-submenu-background` while `$drilldown-arrows` is on (1.4.11). `nfs-dropdown-menu` also warns (`@warn`, no CSS) when `$dropdownmenu-min-width` is a fixed length over 160 px (1.4.10) and when `$anchor-color`, `$dropdown-menu-item-color-active`, or `$dropdownmenu-arrow-color` fails against `$topbar-background` or `$topbar-submenu-background` (1.4.3, 1.4.11), as the Dropdown Menu spec states (amended 2026-09-26, audit 0005 L4). `nfs-accordion-menu` and `nfs-dropdown-menu` stop the compile on `nfs-drilldown`'s row condition, over `$accordionmenu-padding` or `$accordionmenu-submenu-padding` and over `$dropdownmenu-padding` or `$dropdownmenu-submenu-padding` (2.5.8; amended 2026-09-26, audit 0005 M1, recorded in the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md) and the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md)). Ratios are computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded, as the Button spec does, because Foundation's `color-contrast()` rounds to one decimal and lets 2.95:1 pass a 3:1 threshold.

(2) Reused settings, mixins, and functions: `$anchor-color`, `$accordionmenu-*`, `$drilldown-*`, `$dropdownmenu-*`, `$dropdown-menu-item-*-active`, `$topbar-background`, `$topbar-submenu-background`, `$breakpoint-classes`, `$global-left`, `$global-right`, `$body-background`, `css-triangle`, `breakpoint`, `color-luminance`, `rem-calc`, all read from the consumer's compile. The one parameter Foundation has no setting for is `nfs-accordion-menu`'s `$duration` (default 250 ms, Foundation's `slideSpeed` default).

(3) Custom properties: none. The accordion grid is keyed on `data-nfs-expanded` and `data-nfs-shown`, attributes the directives bind (building-blocks 1.13 implementation channel, not theming).

(4) Motion classes: none from `nfs-motion`. Reduced-motion overrides: rule 12.

(5) What breaks without the include: parent buttons render as inline, unpadded text with no arrows; a Hybrid item draws two arrows in drilldown and dropdown mode; in accordion mode closed submenus are visible (no grid rule hides them, and Foundation's inline `display: none` no longer exists) while `inert`; the drilldown wrapper can scroll sideways during a slide, and focus rings lose their edges at its sides.

### Platform features to adopt when the browser target moves

- `:has()`: the accordion grid could key on `li:has(> [aria-expanded='true'])` and drop `data-nfs-expanded`; parent highlighting in dropdown mode could follow the button.
- `interpolate-size: allow-keywords` or `calc-size()`: the accordion submenu could animate `height` itself, dropping the parent-`li` grid; `transition-behavior: allow-discrete` could switch `overflow` with the transition and drop `data-nfs-shown`.
- `<details name>` and `::details-content`: nested disclosure without script for accordion mode, once a `<summary>` can host Foundation's parent styling and the Hybrid item's link can sit outside it.
- `popover="auto"` for dropdown submenus plus CSS anchor positioning with `position-try-fallbacks: flip-inline` for `opens-*`: replaces Light dismiss and the collision check (the Anchored pane spec's note).
- View Transitions for the drilldown slide; `CloseWatcher` for the Android back gesture closing a level or submenu.

### Foundation behaviour changed or dropped

- No `menubar`, `menuitem`, `none`, or `group` roles, no `aria-haspopup`, no copied `aria-label`s, no `aria-multiselectable`; `aria-expanded` moves to a button.
- Parents are buttons; a parent that navigates is a Hybrid item; Drilldown no longer strips `href`s.
- A ResponsiveMenu swap keeps the open path that holds focus instead of destroying and closing everything, and leaves no stale ARIA.
- Dropdown submenus close when focus leaves them and on Escape from anywhere; hover opening follows each pointer, not the device; a click always toggles (`clickOpen` is always on).
- In dropdown mode the open and close keys follow the Base side and the horizontal top level follows the reading direction; Foundation's `_isRtl()` counted `align-right` and turned the keys, but also reversed the top level, whose items keep DOM order on screen.
- Accordion Right opens without moving focus (Foundation also focused the first child link); Escape closes the submenu containing focus rather than every submenu.
- The generated drilldown back buttons, wrapper, and AccordionMenu toggle buttons are consumer-written; `parentLink` clones are gone.
- The collision search uses Foundation's body-box formula once per open; `verticalClass` is written by the consumer.
- Drilldown completes when `$drilldown-transition` is `none` (Foundation hung).
