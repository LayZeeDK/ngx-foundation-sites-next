# Spec: Nested menu (shared utility)

Ticket: [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA.

## Problem Statement

A developer building an Angular application on Foundation for Sites writes site navigation as Foundation's nested `ul.menu` markup and wants it to behave as one of Foundation's three menu patterns: an accordion menu that slides submenus open in place, a drilldown that slides each level in over the previous one, or a dropdown menu whose submenus overlay the page, and, through ResponsiveMenu, a different pattern per breakpoint. Foundation does this with three jQuery plugins over one shared utility, Nest, which "feathers" the markup at runtime with classes and roles. That design leaves the developer with problems an Angular library must not copy:

- Nest stamps `role="menubar"` on every list, `role="menuitem"` on every link, and `role="none"` on every item, and the plugins put `aria-expanded` on the `li`, where user agents ignore it. Screen reader users are promised menu keyboard behaviour that does not exist, DropdownMenu announces no expanded state at all, and the APG warns against these roles for site navigation.
- Parent items are `<a href="#">` links that open a submenu, so a parent that should also navigate cannot, and Drilldown removes the `href` from every parent link.
- The classes, roles, generated wrapper, back buttons, and toggle buttons are created by JavaScript after load, so server HTML is not the menu the user sees, and a ResponsiveMenu swap destroys one plugin and constructs another, leaving stale ARIA from the previous mode and closing everything under the user's focus.
- AccordionMenu animates with jQuery `slideDown`, Drilldown's `closeOnClick` and DropdownMenu's outside click are body handlers, DropdownMenu's hover opening depends on a device-wide touch check, and none of the three close an overlaying submenu when focus moves on.
- Foundation's default hybrid toggle is named "Toggle menu" on every item, and in drilldown and dropdown mode the toggle has no styles at all.
- The markup itself is written with Foundation's classes: `menu`, `vertical`, and `nested` on every list, `is-active` on a submenu to open it at load and on an item to mark the current page, `align-right` on a dropdown menu to turn its submenus, and a `submenu-toggle-text` span inside a toggle. Under the library's class rule the developer writes no Foundation or library class ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)), so each of those needs a directive, a typed input, a bound state, or an ARIA attribute instead, and a class copied from Foundation's docs must neither open a section nor survive a Mode swap.

A server-rendered Angular application adds more: every class and ARIA state visible at first paint must be in the server HTML, nothing may be measured before hydration, a click or key press before hydration must still work once the page hydrates, and a breakpoint that differs between the server and the browser must change the mode without a hydration error.

## Solution

One shared directive family on the markup the developer already writes, used by the AccordionMenu, Drilldown, DropdownMenu, and ResponsiveMenu directives. The developer marks every `li` with `nfsMenuItem`, every nested `ul` with `nfsSubmenu`, the button that opens a submenu with `nfsSubmenuToggle`, and the hidden name inside a Hybrid item's toggle with `nfsSubmenuToggleText`; the plugin's root directive on the outer `ul` supplies the Menu mode. The developer writes no class. Every root and every submenu is a Menu, so each hosts the Menu directive, which binds `.menu` and the Menu's Variant classes from typed inputs (`orientation`, `align`, and the rest, the [Spec: Menu](../issues/85-spec-menu.md)); the submenu binds Foundation's `nested` and `vertical` itself, in every mode. From the one mode signal the family emits Foundation's whole Nest vocabulary (`is-<mode>-submenu-parent`, `is-<mode>-submenu`, `is-<mode>-submenu-item`, `submenu`, `is-submenu-item`) and each mode's State classes as host bindings, so the server HTML is the finished menu and a mode swap is a class change plus, entering or leaving drilldown mode, the Drilldown level names. A section open at first paint is bound with the item's `expanded` model, never read from a class, and a Foundation class copied from Foundation's markup is stripped in every mode and reported in development builds.

Every mode implements disclosure navigation: native lists, a `<button aria-expanded aria-controls>` for each parent, or a link followed by a toggle button when the parent also navigates (the Hybrid item), `aria-current="page"` on the current link and never a class, and no menu or tree roles. Only keyboard handling, layout, and the Drilldown level names differ per mode. Closed submenus are `inert`; hidden drilldown levels use Foundation's `invisible`. Dropdown-mode submenus close on Escape, on an outside press, and when focus leaves them, through the Anchored pane utility's Light dismiss registry, and open on hover through its hover-intent helper. When ResponsiveMenu changes the mode, the root commits the new mode together with pruning the open submenus to the ones that hold focus, in one render callback, so focus stays on the same control and no render shows the new mode over a submenu the swap closes.

The accordion height animation is the one piece of motion Foundation's Sass lacks; it is a grid on the parent `li` driven by a library attribute, in the AccordionMenu Library mixin. Drilldown keeps Foundation's transform slide.

## User Stories

1. As an application developer, I want to keep the element structure of Foundation's nested menu markup and write attribute directives where its docs write classes, so that my menus look exactly as Foundation's docs show without a Foundation class in my template.
2. As an application developer, I want one set of item, submenu, and toggle directives for every menu plugin, so that the same markup works as an accordion menu, a drilldown, or a dropdown menu.
3. As an application developer, I want Foundation's `is-<mode>-submenu*`, `submenu`, and `is-submenu-item` classes in the server HTML, so that Foundation's CSS styles the menu before any script runs.
4. As an application developer, I want a parent item to be a button that opens its submenu, so that it is announced and operated as a control.
5. As an application developer, I want a parent item that both navigates and opens a submenu, as a link plus a separate toggle, so that section landing pages stay reachable.
6. As an application developer, I want Foundation's `.submenu-toggle` look on that toggle in every mode, so that it has a visible arrow and a 40 by 40 px target.
7. As an application developer, I want each item's open state as a two-way `expanded` model, so that I can open a section from my own code or route data.
8. As an application developer, I want `opened` and `closed` outputs on each item after its animation, so that I can react once a submenu is fully shown or hidden.
9. As an application developer, I want `[expanded]="true"` (or a two-way `[(expanded)]`) on an item to open its submenu at first paint, where Foundation's AccordionMenu docs add `is-active` to the submenu, so that the current section is open when the page loads.
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
43. As an application developer, I want every submenu to get `.menu`, `.nested`, and `.vertical` from `nfsSubmenu` in every mode, so that I write none of Foundation's classes on nested lists.
44. As an application developer, I want the same `orientation`, `expanded`, `simple`, `align`, and `iconPosition` inputs on every menu root as on a plain `nfsMenu`, and `align` and `iconPosition` on a submenu, so that I learn one set of Menu names.
45. As an application developer of a dropdown menu, I want `align="right"` on the root to open its submenus to the left, as Foundation's `align-right` class did, so that a right-aligned menu keeps its submenus on screen.
46. As an application developer, I want `span[nfsSubmenuToggleText]` inside a Hybrid item's toggle to hold its visually hidden name, so that the toggle is named without a Foundation class in my template.
47. As an application developer copying Foundation's markup, I want a copied Foundation class on an item, a submenu, or a toggle to have no effect in any mode and a development warning naming what to bind instead, so that I migrate quickly and a Mode swap never reveals a stale class.
48. As a low-vision user, I want the current page's link inside a submenu to stand out from its neighbours by at least 3:1, so that I can tell where I am without relying on hue.

## Implementation Decisions

### Foundation contract

The utility replaces Foundation's Nest utility (`Nest.Feather` and `Nest.Burn`) and the parts of AccordionMenu, Drilldown, and DropdownMenu that all three share: the item and submenu classes, the open and close state, the per-plugin keyboard maps, and the ResponsiveMenu swap. Nest has no Options of its own.

| Foundation feature | What it does in 6.9 | Library counterpart |
| --- | --- | --- |
| `Nest.Feather(menu, type)` | Adds `role="menubar"` to the root and every submenu, `role="menuitem"` to every link, `role="none"` to every item; `is-<type>-submenu-parent` on parents; `submenu is-<type>-submenu` and `data-submenu` on nested lists; `is-submenu-item is-<type>-submenu-item` on their items; `aria-haspopup="true"` and a copied `aria-label` on parent links (not for accordions); `aria-expanded` on the `li` and `aria-hidden` on submenus (drilldown only) | Host class bindings on `nfsMenuItem` and `nfsSubmenu` from the Menu mode; no roles, no `aria-haspopup`, no `aria-label` copies, no `data-submenu`; `aria-expanded` on the toggle button; `inert` instead of `aria-hidden` |
| `Nest.Burn(menu, type)` | Removes the classes (not the roles) when a ResponsiveMenu swaps | The class maps recompute from the new mode; nothing is left behind |
| AccordionMenu `is-active` on the open submenu `ul`; `aria-expanded` on the parent `li` (or the injected toggle); `slideDown`/`slideUp`; `multiOpen` (`true`); `showAll()`/`hideAll()`; `down`/`up.zf.accordionMenu` | Open state, height animation, and events | `is-active` on the open submenu; `aria-expanded` on the toggle; the parent-`li` grid animation; `multiOpen` through the root's accordion behaviour; `expandAll()`/`collapseAll()`; item `opened`/`closed` |
| `is-active` written on a submenu before load (the AccordionMenu docs: "To have a sub-menu already open when the page loads, add the class `.is-active`") | AccordionMenu opens that submenu during its `_init` | The item's `expanded` model bound open (`[expanded]="true"`); no directive reads the class, and a copied one is stripped and reported (building-blocks 1.4) |
| AccordionMenu `submenuToggle`, `submenuToggleText` | Inserts `<button class="submenu-toggle">` with a visually hidden "Toggle menu" span after every parent link | Consumer-written `button[nfsSubmenuToggle][hybrid]` holding a `span[nfsSubmenuToggleText]` that names its item; the toggle binds `.submenu-toggle`, the span `.submenu-toggle-text`, and the item `.has-submenu-toggle` |
| Drilldown `is-active`, `visible`, `invisible`, `is-closing`, `drilldown-submenu-cover-previous` on submenus; `invisible` on the parent level; `aria-expanded` on the `li`; `open`/`hide`/`close`/`closed.zf.drilldown` | Slide state and events | The same classes from state; `invisible` on every hidden ancestor level including the root; item `opened`/`closed` after the slide |
| DropdownMenu `is-active` on the open parent `li`, `js-dropdown-active` on the open submenu, `first-sub`, `opens-left`/`opens-right`/`opens-inner`, `verticalClass`; `show`/`hide.zf.dropdownMenu` | Open state, alignment, collision flip | The same classes from state; `vertical` bound by `NfsSubmenu` on every submenu, Foundation's `verticalClass` default (the Option is dropped); the root's `align-right` (`rightClass`) becomes the hosted Menu's `align` input; collision through the Anchored pane utility's pure functions |
| DropdownMenu `disableHover`, `hoverDelay` (50), `closingTime` (500), `autoclose` (`true`), `closeOnClick` (`true`), `closeOnClickInside` (`true`), `alignment` (`'auto'`) | Hover timers, body click, leaf click, side | The root's dropdown behaviour: `nfsHoverIntent`, Light dismiss `outsidePress`, a root click rule, and the alignment rule |
| Per-plugin `Keyboard.register` maps | Enter/Space/arrows/Escape per plugin | The per-mode key tables below, one root `keydown` listener |
| ResponsiveMenu `_checkMediaQueries` | Destroys the old plugin and constructs the new one on `changed.zf.mediaquery` | The root's `drive(mode)` plus the swap rule; no directive is created or destroyed |

What the four consuming specs keep for themselves (so the utility carries none of it): the root directives and their selectors, their Options, Defaults tokens, aggregate outputs, `exportAs` names; Drilldown's wrapper (`is-drilldown`, `min-height`, `animate-height`, `autoHeight` height), back button directive, `closeOnClick`, and `scrollTop` Options; ResponsiveMenu's `rules` input. The table "What each consuming spec maps" below lists them.

Dropped options and behaviours (utility level): `data-submenu`, `role` stamping, `aria-haspopup`, `aria-label` copies, `aria-multiselectable`, `parentLink` (building-blocks 1.4), `submenuToggle`/`submenuToggleText` as Options (markup instead), `slideSpeed` (CSS owns timing; the AccordionMenu mixin's `$duration`), DropdownMenu `clickOpen` (a parent is a button, so a click always toggles), `disableHoverOnTouch` (the hover helper ignores touch pointers per event), `forceFollow` (the Hybrid item's link navigates), `verticalClass` and `rightClass` (class-name Options), Drilldown's `href` removal, Foundation's `data-is-click` bookkeeping, and reading a static `is-active` as the initial open state (building-blocks 1.4).

### CSS class to Angular mapping

Every class on the menu's elements, per building-blocks 1.14 item 2; the consumer writes none ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)). The utility declares no Variant input, no Variant registry, and no Variant property: the Menu's Variant inputs are the [Spec: Menu](../issues/85-spec-menu.md)'s, typed there (its breakpoint keys over `NfsBreakpointClassesOverrides`, read back from `--nfs-breakpoint-classes`), and reach the root and the submenu through `hostDirectives`.

| Foundation markup or class | Kind | Angular | Rationale |
| --- | --- | --- | --- |
| Every `li` of the menu | No class of its own | `NfsMenuItem`, selector `li[nfsMenuItem]`, `exportAs: 'nfsMenuItem'` | Carries the item and parent classes and the `expanded` state; on leaves too, because Foundation gives every item inside a submenu `is-submenu-item` |
| Nested `ul.menu` inside an item | Structural (Menu) | `NfsSubmenu`, selector `ul[nfsSubmenu]`, `exportAs: 'nfsSubmenu'`, hosting `NfsMenu` (static `.menu`) through `hostDirectives` | Carries the submenu classes, its id, `inert`, and the slide phases; a submenu is always a Menu, so the Menu directive owns `.menu` there too (the Menu spec, D5) |
| `.nested`, `.vertical` on a nested `ul` | Variant (Menu), constant here | Bound `true` by `NfsSubmenu`'s own class map in every mode and without a root; no input | Foundation's docs write both on accordion and drilldown submenus and its DropdownMenu adds `vertical` (`verticalClass`) to every dropdown submenu; each mode's CSS resets the nested margin (`$dropdownmenu-nested-margin` and `$drilldown-nested-margin` are 0), and a dropdown submenu is `display: none` or `block`, so the two classes are right in every mode; the host's own map beats the hosted `NfsMenu`'s `false` keys (measured) |
| `.align-left`, `.align-right`, `.align-center`; `.icons` with `.icon-*` on a nested `ul` | Variant (Menu) | `align`, `iconPosition` exposed by `NfsSubmenu` from its hosted `NfsMenu` (closed: `NfsMenuAlign`, `NfsMenuIconPosition`) | The Menu spec's inputs and types; a submenu exposes no `orientation`, `expanded`, `simple`, or `nested` |
| `.menu` on the root `ul` | Structural (Menu) | The hosted `NfsMenu` of each plugin root (the plugin specs; the Menu spec, D5) | A root is always a Menu; ResponsiveMenu gets one `NfsMenu` through its three roots |
| `.horizontal`, `.vertical`, `.<bp>-horizontal`, `.<bp>-vertical`, `.expanded`, `.<bp>-expanded`, `.simple`, `.align-*`, `.icons` with `.icon-*` on the root | Variant (Menu) | `orientation`, `expanded`, `simple`, `align`, `iconPosition`, exposed by each plugin root from its hosted `NfsMenu` | The Menu spec's inputs, types, and runtime checks; the Base side reads `align()` (below) |
| Root `ul` with `data-accordion-menu`, `data-drilldown`, `data-dropdown-menu`, `data-responsive-menu` | Structural (plugin) | The plugin specs' root directives, each providing `nfsMenuModeToken` | Out of this spec; they bind the root classes (`accordion-menu`, `drilldown`, `dropdown`, and the Drilldown root's `invisible`) |
| `is-<mode>-submenu-parent`, `is-submenu-item`, `is-<mode>-submenu-item`, `has-submenu-toggle` | State (Nest) | Host class map on `NfsMenuItem`, per mode in the table under API, `NfsMenuItem` | Nest's classes, from the Menu mode |
| `is-active` (dropdown parent), `opens-left`, `opens-right`, `opens-inner` | State | Host class map on `NfsMenuItem`, per mode in the table under API, `NfsMenuItem` | Open state and the dropdown side |
| `submenu`, `is-<mode>-submenu` | State (Nest) | Host class map on `NfsSubmenu`, per mode in the table under API, `NfsSubmenu` | Nest's classes, from the Menu mode |
| `is-active` (accordion, drilldown), `js-dropdown-active`, `first-sub`, `visible`, `invisible`, `is-closing`, `drilldown-submenu-cover-previous`, `is-hidden` (no root, closed) | State | Host class map on `NfsSubmenu`, per mode in the table under API, `NfsSubmenu` | Open state and slide phases |
| Parent `a` that opened a submenu; AccordionMenu's generated `button.submenu-toggle` | Structural (`.submenu-toggle`, the generated toggle only) | `NfsSubmenuToggle`, selector `button[nfsSubmenuToggle]`, `exportAs: 'nfsSubmenuToggle'`; `[class.submenu-toggle]` while `hybrid` | The disclosure button (building-blocks 1.10; ADR 0004); a native button needs no key handling for Enter and Space; Foundation's parent link had no class, its generated toggle had `.submenu-toggle`, Foundation's only toggle styles, applied in every mode |
| `.submenu-toggle-text` span | Structural | `NfsSubmenuToggleText`, selector `span[nfsSubmenuToggleText]`, static host class | Foundation's visually hidden name holder inside the Hybrid item's toggle (ADR 0039 names it) |
| `.is-active` on the current page's `li` | State, not bound | None: the current page is `aria-current` on its link, styled by `nfs-menu` with Foundation's `menu-state-active` (the Menu spec, D4) | `.is-active` is the Nested menu's open state; no class marks the current page in any mode |
| `.menu-text` on a text item | Structural (Menu) | `li[nfsMenuText]` (the Menu spec), with or without `nfsMenuItem` | An item with no link |
| `.js-drilldown-back`; `.is-drilldown`, `.animate-height` | Structural, State (Drilldown) | `NfsDrilldownBack` (static host class), `NfsDrilldownWrapper` (the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md)) | The utility reads `li.js-drilldown-back` in its focus rules and binds neither |
| `.top-bar-right` ancestor | Structural (Top Bar) | `NfsTopBarRight`, which binds it and provides `nfsTopBarRightToken` (the [Spec: Top Bar](../issues/86-spec-top-bar.md)) | Read for the dropdown Base side through the token at construction, or, when no token was found, through a DOM walk after hydration; never bound here |
| (none) `data-nfs-expanded` on a parent `li`; `data-nfs-shown` on a submenu | Attributes, not classes | Host attribute bindings | Library-owned hooks for the accordion grid rule, which Foundation's markup has no state for (Animation; ADR 0033) |

Binding rule. The class maps are `computed` records bound with `[class]`, one per item, submenu, and toggle. Each holds as a key every class the family binds on that kind of element in any mode, `true` where it applies and `false` otherwise, so the key set never changes with the mode. Angular's styling resolution uses a static class only when every binding for it is `undefined` (building-blocks 1.4), so a Foundation class copied onto an item, a submenu, or a toggle (a submenu's pre-open `is-active`, a leaf's current-page `is-active`, another mode's Nest class) is stripped on the server and in the browser in every mode, and a Mode swap never reveals one; the development check below reports it. The submenu's own map binds `nested` and `vertical` as `true` and beats the hosted `NfsMenu`'s `false` keys for them, and a submenu's redundant `menu`, `nested`, and `vertical` merge and are not reported. The consumer's own classes are never keys and stay. The one collision is Foundation's own: in dropdown mode `is-active` on a parent `li` means "open", as DropdownMenu's JavaScript used it; the current page is `aria-current` on its link in every mode, never a class. Measured with Angular 22.2.0 in a server render ([Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md)): a copied `menu vertical nested is-active` on a dropdown-mode submenu rendered `menu nested vertical submenu is-dropdown-submenu`; a copied leaf `is-active` was stripped; a copied `is-dropdown-submenu-parent opens-left` on an accordion-mode item and `is-dropdown-submenu js-dropdown-active` on its submenu were stripped.

`expanded` on a root and `expanded` on an item are different inputs on different elements: on a root it is the Menu's Variant (`.expanded`, items share the row); on an item it is the open-state model. A submenu does not expose the Menu's `expanded`.

### Hierarchy and DI shape

```
ngx-foundation-sites/nested-menu  (secondary entry point)
  nfsMenuModeToken : InjectionToken<NfsMenuRoot>        lightweight, type-only import
  nfsMenuRootProviders(mode) -> Provider[]              used by every root directive
    { provide: nfsMenuModeToken, useFactory: () => new NfsMenuRoot(mode) }
    { provide: NfsSubmenu, useValue: null }             cuts registration at a nested root
  NfsMenuRoot                                           created by the factory on the root ul
    mode, items, hasOpenItem, configure(), drive(), handleKeydown(), handleClick(),
    expandAll(), collapseAll(); owns the swap rule; inject(NfsMenu, {self: true}) for align(); inject(nfsTopBarRightToken, {optional: true}) for the Top Bar's right-hand section
  li[nfsMenuItem]        inject(nfsMenuModeToken, {optional}), inject(NfsSubmenu, {optional})
    ul[nfsSubmenu]       inject(NfsMenuItem)                 (its owner, required)
                         hostDirectives: {directive: NfsMenu, inputs: ['align', 'iconPosition']};
                         binds nested and vertical itself
    button[nfsSubmenuToggle]  inject(NfsMenuItem)            (required)
      span[nfsSubmenuToggleText]  static class; in development builds only:
                                  inject(NfsSubmenuToggle, {optional}) for its warning
  uses: Directionality, _IdGenerator, DOCUMENT, DestroyRef, afterNextRender, afterRenderEffect;
        NfsMenu (ngx-foundation-sites/menu); nfsTopBarRightToken (ngx-foundation-sites/top-bar), optional; HostAttributeToken('class') in development builds only;
        Anchored pane: nfsLightDismiss, nfsHoverIntent, nfsDocumentRect, nfsBodyBounds, nfsOverlap;
        Breakpoint service: none (reduced motion is the mixins' CSS)

consuming specs:
  ul[nfsAccordionMenu]   providers: nfsMenuRootProviders('accordion')
  ul[nfsDrilldown]       providers: nfsMenuRootProviders('drilldown')
  ul[nfsDropdownMenu]    providers: nfsMenuRootProviders('dropdown')
      each: hostDirectives: {directive: NfsMenu,
                             inputs: ['orientation', 'expanded', 'simple', 'align', 'iconPosition']}
  ul[nfsResponsiveMenu]  providers: nfsMenuRootProviders('accordion'); hostDirectives: the three roots
                         (one NfsMenu for the element, their input maps merged); root.drive(mode from rules)
```

- The token carries the root handle, not a bare signal, because items need the root's mode, its per-mode behaviour Options, and a place to register; its name is kept from building-blocks and the prototype. Its value is a plain class created by a factory in the root element's injector, so its constructor can `inject()` `ElementRef` (the root `ul`), `Directionality`, `DOCUMENT`, `DestroyRef`, the root's hosted `NfsMenu` with `{self: true}`, and `nfsTopBarRightToken` with `{optional: true}`, and create its own render callbacks. The factory runs in the root element's context whichever directive first asks for the token (Angular's node injector enters DI at the node that declares the provider, `getNodeInjectable`), so the `self` lookup finds the `NfsMenu` that every root hosts; a root that hosts none fails at construction with Angular's missing-provider error, which is the right failure. Measured with Angular 22.2.0 under a server render ([Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md)): a dropdown root's factory read `align()` from its hosted `NfsMenu`, and so did the factory ResponsiveMenu's own provider supplies over the merged `NfsMenu` of its roots.
- Hosting the Menu (the Menu spec, D5): each plugin root and `NfsSubmenu` list `NfsMenu` in `hostDirectives`, so `.menu` and its Variant classes have one owner on every list of the menu. Since Angular 22.0 a directive reached several times through host directives on one element is created once with its exposed input maps merged, and a template match of the same directive discards its host-directive matches, so a ResponsiveMenu has one `NfsMenu` and a consumer's `nfsMenu` written beside a root is harmless; a host's own class bindings beat its hosted `NfsMenu`'s. The Menu ticket measured all three with Angular 22.2.0, including a Menu input bound on a ResponsiveMenu-shaped host that reaches `NfsMenu` through two levels of host directives without being listed again.
- Three roots on one `ul`: ResponsiveMenu lists the three root directives in `hostDirectives` and provides the token itself; the providers of the class that declares `hostDirectives` win over its host directives' providers (the directive composition guide), so all three roots and every item read one `NfsMenuRoot` whose mode ResponsiveMenu drives. Each root binds its root class and forwards keys only while `root.mode()` is its own mode, so one root is live and two are idle. This is the prototype's shape, measured in three engines.
- Parent discovery: an item injects the nearest `NfsSubmenu` (`{optional: true}`); `null` means it is a top-level item of the root. Every root re-provides `NfsSubmenu` as `null` (the `CdkAccordionItem` pattern, building-blocks 1.9), so a root nested inside another menu's submenu starts a new tree. A submenu injects its owning item (required: a `ul[nfsSubmenu]` outside a `li[nfsMenuItem]` fails with Angular's missing-provider error, which is the right failure). A toggle injects its item.
- Registration: parent-owned. An item registers with its parent submenu, or with the root when it is top-level, at construction, and unregisters in `DestroyRef.onDestroy`; a submenu and a toggle register themselves on their item. Registration survives `@for`, `@defer`, and projection (building-blocks 1.9). No reader needs a reactive order: the readers that care about order (the arrow keys, and the swap rule's "first open submenu per level") run at event time or in a render callback and sort with `compareDocumentPosition` there, so no `MutationObserver` is kept. `contentChildren` is not used.
- An item with no root in its injector tree binds none of the Nest or mode classes (its map holds them all `false`), still toggles, and binds `hidden` and Foundation's `.is-hidden` as well as `inert` on its closed submenu (no mode CSS hides it, and the submenu's hosted Menu binds `.menu`, whose Foundation rule `.menu { display: flex }` beats normalize's `[hidden]`; building-blocks 1.10; amended 2026-09-26, audit 0005 L4); the submenu keeps `.menu`, `.nested`, and `.vertical`, so it looks like a plain nested Menu when open; a development-mode warning names the missing root.
- No Defaults token and no provider function of its own: the utility has no Foundation Options; each plugin root keeps its Defaults token and passes values in through `configure()`. RTL comes from CDK `Directionality`, so a `[dir]` ancestor or the document decides.
- Not an Openable: an item does not provide `nfsOpenableToken`. A bare `nfsClose` on a link inside a menu inside an off-canvas panel must close the panel, not a submenu (Triggers spec, Out of scope: submenu toggles are not Triggers).
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part; a hosted part probes from its host's element, because the shared spec's child probe also counts the host record, and `nfsMenuModeToken`'s development-only description is under `NfsMenuRoot` and `nfsMenuModeToken` (API):
  - Each plugin root, `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, and `NfsResponsiveMenu` (the call is its spec's; this utility's consumer contract requires it): `nfsDirectiveCheck('<Root>', {children: ['NfsMenuItem']})`, probing every `NfsMenuItem` of its tree (the Drilldown also probes `NfsDrilldownBack`, its spec). No parent check: `nfsMenuModeToken` and the hosted `NfsMenu` are `self` injections of its own element, and the root handle's `nfsTopBarRightToken` is context, not a parent, and stays optional ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)). A root hosted by `NfsResponsiveMenu` probes from the responsive `ul`, so `NfsResponsiveMenu` calls `nfsDirectiveCheck('NfsResponsiveMenu')` with its name only; the hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)). No peers. `strictParents` changes nothing.
  - `NfsMenuItem`: `nfsDirectiveCheck('NfsMenuItem', {parent, children: ['NfsSubmenu', 'NfsSubmenuToggle']})`, the shared spec's usage example. Parent check over `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, and `NfsResponsiveMenu`, `found` from `nfsMenuModeToken`, with the `alone` sentence "It binds no Nest or mode classes; its submenu shows as a plain nested Menu.", which replaces development check 5's item warning, so an item without a root is reported once. Its `NfsSubmenu` injection has no parent check, because `null` means the root's level, which every root provides on purpose. It probes `NfsSubmenu` and `NfsSubmenuToggle`. No peers. `strictParents`: it throws at construction when no root is found.
  - `NfsSubmenu`: no parent check, because `inject(NfsMenuItem)` is required and NG0201 is the report (a lookup by class, which the development build names `_NfsMenuItem` and no token description reaches). It probes `NfsMenuItem`, its items; its hosted `NfsMenu` probes `NfsMenuText`. No peers. `strictParents` changes nothing.
  - `NfsSubmenuToggle`: no parent check, for the submenu's reason (a required `inject(NfsMenuItem)`). It probes `NfsSubmenuToggleText`. No peers: `aria-controls` comes from the registered submenu. `strictParents` changes nothing.
  - `NfsSubmenuToggleText`: parent check over `NfsSubmenuToggle`, its development-only `inject(NfsSubmenuToggle, {optional: true})` giving `found`, with the `alone` sentence "Its visually hidden text names nothing outside a hybrid toggle.", which replaces the outside-any-toggle half of development check 3. No child probes. No peers. `strictParents`: it throws at construction when no toggle is found.

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

`nfsMenuModeToken = new InjectionToken<NfsMenuRoot>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsMenuModeToken (provided by NfsAccordionMenu from 'ngx-foundation-sites/accordion-menu', NfsDrilldown from 'ngx-foundation-sites/drilldown-menu', NfsDropdownMenu from 'ngx-foundation-sites/dropdown-menu', or NfsResponsiveMenu from 'ngx-foundation-sites/responsive-menu', on an ancestor element declared in the same template)" : '')`, its description in development builds only and naming all four roots, because each provides the token through `nfsMenuRootProviders` from its own entry point (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), in its form for a token several directives provide, as `nfsOpenableToken`'s), lives in a token file that imports `NfsMenuRoot` as a type only (building-blocks 1.9). `nfsMenuRootProviders(mode: NfsMenuMode): Provider[]` returns the two providers shown in the hierarchy.

The root decides the dropdown Base side (the side, left or right, toward which a dropdown-mode submenu opens before the collision check moves it) in a `computed` over its inputs: `alignment` `'left'` gives `opens-right`, `'right'` gives `opens-left`, and `'auto'` gives `opens-left` when the hosted Menu's `align()` is `'right'` (the input that sets Foundation's `.align-right`, which Foundation's `rightClass` read), when `Directionality` is `rtl`, or when the root sits in a Top Bar's right-hand section, and `opens-right` otherwise. The root learns the last through `inject(nfsTopBarRightToken, {optional: true})` in its factory, which finds an `NfsTopBarRight` on the root or on any element the root is declared inside, through embedded views and child components' templates ([Spec: Top Bar](../issues/86-spec-top-bar.md)). All three are known at construction, so the server HTML carries the side; a later change of `alignment`, `align`, or the direction re-sides closed submenus only. When the factory found no token, a root with a dropdown slot walks the DOM once in its first render callback (`earlyRead`: `closest('.top-bar-right')` from the root; `write`: set the signal the Base side reads), because declaration-site DI misses a menu that a layout component projects into the section from another template; the walk can only add the section and changes only the side classes of closed submenus, and it never runs when the token was found, so a template declared in the section and rendered elsewhere keeps the token's answer. Measured with Angular 22.2.0 in a server render and under hydration in three engines ([Re-run: Dropdown Menu spec under the class rule](../issues/113-rerun-dropdown-menu-class-rule.md)). No directive of the family reads the root's static `class`.

Mode swap (ADR 0035). The root keeps the mode it displays (`mode`) separate from the mode it is driven to (the function passed to `drive()`), so a change of the driven mode never re-renders the class maps by itself. One `afterRenderEffect` of the root commits every swap:

1. `earlyRead`: when the driven mode differs from `mode`, read `document.activeElement` and the DOM order of the open submenus while the old mode's classes are still on the page, and plan. Entering accordion changes nothing. Entering drilldown or dropdown with focus inside the root keeps the submenus whose items contain the focused control and closes the rest; entering drilldown also closes the submenu whose own row holds focus, that is, its toggle or, for a Hybrid item, its link, which would otherwise put that row inside an `invisible` level. With focus outside the root, entering drilldown keeps the first open submenu per level (DOM order), and entering dropdown closes every submenu, because an overlay nobody is using must not cover the page and Foundation's DropdownMenu never opened a submenu at load. Focus inside a drilldown back item (`li.js-drilldown-back`) when leaving drilldown is recorded for step 3.
2. `write`: set `mode` and apply the plan in the same phase, so the next change-detection pass renders the new mode and the pruned Open path together. No render shows the new mode's classes over a submenu the swap closes, so the focused control never sits in a hidden subtree and no engine's blur timing is relied on.
3. Refocus: when focus was inside a drilldown back item, which the new mode hides, an `afterNextRender` registered by `write` (`earlyRead` picks the target, `write` focuses) moves it, after the render that applied the swap, to that level's first control that is not inside the back item; the level stays open because focus was inside it. In every other case focus stays on the same node, and nothing moves it when it was outside the menu.

The same callback handles a resize, a change of ResponsiveMenu's rules, and the first-render swap; because it commits the swap itself, it may read the live breakpoint in `earlyRead` (building-blocks 1.5, the second place focus may be recorded). The swap emits nothing of its own: each submenu the plan closes is an ordinary close, so its item's `expanded` model emits `false` and the new live mode emits `closed` with the item once the close completes. `drive()`'s signature is unchanged, and a standalone root is never driven and never swaps. The [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) confirmed the commit order in Chromium, Firefox, and WebKit: `mode` is implementable as a `linkedSignal` whose source is a signal holding the function passed to `drive()` and whose computation calls it inside `untracked` (amended 2026-09-26, audit 0005 L4: the source is the signal holding the function, never the function itself, whose value would track every breakpoint change), so it takes the driven value on its first read; `write` sets `mode` before the pruning; the back-item refocus is an `afterNextRender` registered from `write` with the root's injector, which runs in the batch after the pass that rendered the swap; and no recorded pass showed the new mode over a submenu the swap closes.

#### `NfsMenuItem` (`li[nfsMenuItem]`, `exportAs: 'nfsMenuItem'`)

| Member | Kind | Type | Notes |
| --- | --- | --- | --- |
| `expanded` | model | `boolean`, default `false` | Two-way open state (building-blocks 1.4); `expandedChange` fires when the state is requested. The initial state is bound, never read from a class (building-blocks 1.4): `[expanded]="true"` or a two-way `[(expanded)]` whose value starts `true` renders the submenu open at first paint, on the server and in the browser, with no `expandedChange` and no Completion output, and the user can still close it because a one-way binding re-applies only when its value changes. A bare static `expanded` attribute does not compile under strict templates (a model takes no transform). A static `is-active` copied onto the submenu opens nothing: the submenu's map strips it and the development check names `[expanded]` (revised 2026-09-28 under the class rule, [Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md); the static seed and its two-way interplay, measured by the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md), are gone) |
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

Host directives: `NfsMenu` with `inputs: ['align', 'iconPosition']`, so a submenu takes the Menu's `align` and `iconPosition` (the Menu spec's closed types) and gets `.menu` from the Menu's static host class.

Host: `[id]`, `[class]` (the submenu map: `nested` and `vertical` always `true`, and the State and Nest classes below, including `is-hidden` while closed with no root), `[attr.aria-labelledby]` (its item's toggle id while the live mode is `drilldown`, else absent), `[attr.inert]` while its item is closed, `[attr.hidden]` while closed and no root exists, `[attr.data-nfs-shown]` while open and settled, `(transitionend)` (drilldown completion, filtered to the host and `transform`). Per mode, always `menu nested vertical submenu is-<mode>-submenu`, plus:

| Mode | Classes |
| --- | --- |
| accordion | `is-active` while its item is expanded |
| drilldown | `is-active` while shown (expanded, or closing); `visible` while shown and no child of it is open; `invisible` otherwise (closed, or hidden behind an open child); `is-closing` from close until the slide ends; `drilldown-submenu-cover-previous` unless the root's `autoHeight` is on |
| dropdown | `js-dropdown-active` while expanded; `first-sub` when its item is top-level |

A hidden drilldown ancestor level is never `inert`: the open level is its descendant, and `inert` cannot be undone inside a subtree (prototype row 9). Foundation's `visibility: hidden` takes it out of the tab order and the accessibility tree, and the open level's `visible` overrides it. `.visible` follows `.invisible` in Foundation's CSS, so the two are never bound together.

#### `NfsSubmenuToggle` (`button[nfsSubmenuToggle]`, `exportAs: 'nfsSubmenuToggle'`)

| Member | Kind | Type | Notes |
| --- | --- | --- | --- |
| `hybrid` | input | `boolean` (`booleanAttribute`), default `false` | The toggle follows a navigating link in the same item (APG hybrid disclosure navigation): the button is Foundation's generated `.submenu-toggle`, not its parent link. Not a Variant input: it chooses which Foundation element the button stands for and switches behaviour (the item's `has-submenu-toggle`, the drilldown keep rule for a focused Hybrid link, the name check), so it keeps the Option transform of building-blocks 1.4 |

Host: `type="button"` (static; a consumer's static `type` wins), `[attr.id]` (the consumer's static `id`, else `_IdGenerator.getId('nfs-submenu-toggle-', true)`, rewritten at hydration like the submenu ids), `[attr.aria-expanded]` from the item, `[attr.aria-controls]` from the submenu id, `[class.submenu-toggle]` from `hybrid` (`false` strips a copied one), and `(click)`. The click handler toggles the item, with one dropdown-mode exception taken from Foundation's `data-is-click` rule: a pointer click (`event.detail > 0`) on a submenu that hover opened keeps it open and marks it click-opened, so hover then click does not close it; a keyboard-generated click always toggles. The handler never calls `preventDefault()`.

#### `NfsSubmenuToggleText` (`span[nfsSubmenuToggleText]`)

No inputs, models, outputs, or methods, and no `exportAs`. Host: static `class="submenu-toggle-text"`, Foundation's visually hidden name holder (`element-invisible`, from `foundation-accordion-menu`), so the Hybrid item's toggle is named by text in the accessibility tree while only its arrow shows. It sits inside a `hybrid` toggle; in development builds only it injects `NfsSubmenuToggle` (`{optional: true}`) for its warning.

#### Development checks

Each warns once per instance through `console.warn`, in the first client render callback, never on the server or in production:

1. Copied Foundation classes (building-blocks 1.4): `NfsMenuItem`, `NfsSubmenu`, and `NfsSubmenuToggle` read their host's static `class` through `HostAttributeToken('class')` in a field initialiser that runs only under `ngDevMode` (after render the stripped token no longer shows), and report each Foundation class their map owns: `is-active` on a submenu, or on an item with a submenu, names `[expanded]` on the item; `is-active` on an item without a submenu names `aria-current` on its link; `submenu-toggle` names `hybrid`; any other Nest or State class says the family binds it from the Menu mode and state. A submenu's redundant `menu`, `nested`, and `vertical`, and a span's redundant `submenu-toggle-text`, merge and are not reported. Foundation's back-compatibility `active` on a leaf is the Menu directive's check 2.
2. A `hybrid` toggle with no `aria-label` or `aria-labelledby` whose name is not inside a `span[nfsSubmenuToggleText]`: no name, or a visible name inside the 40 px toggle (the Hybrid item's toggle must name its item, for example "Products pages").
3. A `span[nfsSubmenuToggleText]` inside an `NfsSubmenuToggle` that is not `hybrid`: it hides the only visible label of a parent button. A span outside any toggle is reported once, by its In-family parent check (Hierarchy and DI shape).
4. A parent item with a submenu but no toggle (Foundation's `<a href="#">` parent left unmigrated). An item holding an element that carries `nfsSubmenuToggle` is not reported here: that toggle's import is forgotten, which the item's child probe reports once.
5. `expandAll()` outside accordion mode or with `multiOpen` off. An item with no root (above) is reported once, by its In-family parent check.
6. A root with a dropdown slot whose Base side the DOM walk changed: it sits in a `.top-bar-right` that dependency injection could not see (a menu projected into a Top Bar's right-hand section from another template, or a section written without `nfsTopBarRight`), so its submenus' side changed at hydration. The warning names `alignment="right"`, which puts the side in the server HTML. It fires only when the walk changes the result (`alignment` `'auto'`, `align()` not `'right'`, direction `ltr`).

#### What each consuming spec maps

| Consuming spec | Root directive and providers | Root host bindings | `configure()` | Own pieces (its spec) |
| --- | --- | --- | --- | --- |
| AccordionMenu | `ul[nfsAccordionMenu]`, `nfsMenuRootProviders('accordion')`; `hostDirectives` `NfsMenu` exposing `orientation`, `expanded`, `simple`, `align`, `iconPosition` (the same for every root) | `[class.accordion-menu]` while accordion; `(keydown)` to `handleKeydown(e, 'accordion')` | `multiOpen` input (default `true`); `opened`/`closed` aggregate outputs with the item | `nfsAccordionMenuDefaultsToken`; `expandAll()`/`collapseAll()` delegating; the `nfs-accordion-menu` mixin holding the rules below |
| Drilldown | `ul[nfsDrilldown]`, `nfsMenuRootProviders('drilldown')`; hosts `NfsMenu` | `[class.drilldown]` and `[class.invisible]` from `hasOpenItem()` while drilldown; `(keydown)` | `autoHeight`; outputs | `nfsDrilldownDefaultsToken`; wrapper (`is-drilldown`, `min-height`, `animate-height`, the `autoHeight` height); `li[nfsDrilldownBack]` back directive, which binds `js-drilldown-back`, calls `close()` on its submenu's item, and is `hidden` outside drilldown mode; `closeOnClick` (calls `collapseAll()`), `scrollTop*`; `collapseAll()`; the `nfs-drilldown` mixin |
| DropdownMenu | `ul[nfsDropdownMenu]`, `nfsMenuRootProviders('dropdown')`; hosts `NfsMenu` | `[class.dropdown]` while dropdown; `(keydown)`; `(click)` to `handleClick(e, 'dropdown')` | `alignment`, `disableHover`, `hoverDelay`, `closingTime`, `autoclose`, `closeOnClick`, `closeOnClickInside`; outputs | `nfsDropdownMenuDefaultsToken`; `collapseAll()`; the `nfs-dropdown-menu` mixin |
| ResponsiveMenu | `ul[nfsResponsiveMenu]`, `nfsMenuRootProviders` (any initial mode, since `drive()` replaces it at construction); `hostDirectives` the three roots with their inputs and outputs listed; one `NfsMenu` arrives through the roots, and its five inputs bind on the `ul` without being listed again (measured) | none of its own | none; calls `drive()` with its requested mode, which resolves at `mq.serverBreakpoint` until the directive's first render callback and at the live breakpoint after (`mq.resolve(parsed, mq.serverBreakpoint)`, then `mq.resolve(parsed)`) | `rules` input parsed with `parseNfsBreakpointRules(rules, ['dropdown', 'drilldown', 'accordion'], mq.breakpoints)`; must always yield a mode (a rule string with no Zero-breakpoint rule uses its smallest rule's mode below that breakpoint, with a development warning, instead of Foundation's no-plugin state; a rule set that names no valid mode gives `accordion`) |

Two host directives that expose an input of the same name on one `ul` both receive the binding, which is Foundation's own behaviour (every child plugin read the same `data-*` attributes): `closeOnClick` reaches Drilldown and DropdownMenu, each with its own default. Only the live mode calls its `opened`/`closed` completion functions, so an aggregate output bound on a ResponsiveMenu emits once.

### Implementation level and primitives

Implementation level: custom Angular directives (ADR 0004). Native first: nested `<details>` would give disclosure without script, but `<details name>` (exclusive groups) and `::details-content` (styling the revealed part) are outside the browser target, and a `<summary>` cannot be Foundation's parent button nor carry a separate link. `@angular/aria` has `ngMenuBar`/`ngMenu` and `ngTree`, which apply the `menu`, `menuitem`, and `tree` roles the APG rejects for site navigation; set no tab stop in server HTML (their first active item is chosen in a render callback), so before hydration the Tab key reaches no link; cancel Enter on a link item (Aria's menu maps Enter to its own activation); and, for the tree, put every child level in an `ng-template` group with `[parent]` and `[ownedBy]` inputs, absent from server HTML even when expanded, where a menu needs a `[submenu]` reference per parent and `role="none"` on every item; Drilldown matches neither. `@angular/cdk` has `CdkMenu` (the same roles) and nothing for disclosure navigation; the utility uses CDK only for `Directionality`, `_IdGenerator`, and `hasModifierKey`.

Primitives: host bindings on signals; `model()`, `input()`, `output()`, `computed()`; `hostDirectives` with the Menu directive, and `inject(NfsMenu, {self: true})` in the root's factory, and `inject(nfsTopBarRightToken, {optional: true})` there; `Element.closest` in a render callback for a projected menu's section; `HostAttributeToken` in development builds only; `inert`; Foundation's `invisible`/`visible` classes; `transitionend`; `getComputedStyle` (transition durations in a render callback; the root's `flex-direction`, its first top-level item's `display`, and a control's `visibility` in key handlers, which only run on the client); `Node.compareDocumentPosition` and `contains`; `focus({preventScroll: true})`; `Directionality.valueSignal`; the Anchored pane utility's `nfsLightDismiss`, `nfsHoverIntent`, `nfsDocumentRect`, `nfsBodyBounds`, `nfsOverlap`; `NgZone.runOutsideAngular` for fallback timers. All are in the browser target; `overflow: clip` (Library mixin) is Baseline widely available (Chrome 90, Firefox 81, Safari 16).

Fallback: none needed; the prototype carried every mode on this level in three engines. The swap commit (Mode swap, ADR 0035) was confirmed by the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) in three engines, so the fallback the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md) named (recording the focused control from `focusin`/`focusout` on the root `ul` and restoring it in an `afterNextRender` after the swap) is not adopted; it could not have helped the one case the prototype found, a focused Hybrid link hidden by the new mode, which the keep rule now closes. The alternative shape not taken is one shared, selector-less root host directive that each root lists in `hostDirectives`, merged into one instance under ResponsiveMenu by Angular's host directive de-duplication (in every release from 22.0.0, commit `9c55fcb3e6`, as the [Spec: Menu](../issues/85-spec-menu.md) ticket read; this spec said 22.1 until 2026-09-28); it would give one listener instead of three. The family now depends on that merging for the hosted `NfsMenu`, measured there and in this spec's re-run, but the three-listener root shape stays: it is the prototype's measured shape, and each idle root's listener already does nothing outside its mode.

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Classes, ARIA, `id`, `inert`, `hidden`, `data-nfs-*` | Host bindings from `computed` | First-paint state must be in server HTML (1.11 decision 1) |
| Registration, `Directionality`, the hosted `NfsMenu`, the optional `nfsTopBarRightToken`, the Base side `computed` over `alignment`, `align()`, direction, and the token; in development builds, the static `class` read of the copied-class check | Constructor | Needed before the first render and before replay; reads no layout; no static class seeds any state (building-blocks 1.4) |
| Development checks | `afterNextRender`, only under `ngDevMode` | Warnings are client-only and read the rendered tree once |
| Focus after an open or close (drilldown level handoff, Escape, Left, back, keyboard open in dropdown mode) | `afterNextRender` (`earlyRead` picks the target, `write` focuses) | `inert` is removed only by the render that follows the state change; a synchronous `focus()` is a no-op (prototype harness race) |
| Arrow-key moves between controls that are already visible | Synchronous `focus()` in the handler | No state change to wait for |
| Dropdown collision flip | `afterRenderEffect` (`earlyRead`, `write`) per parent item, acting only while the item's rendered mode equals `mode()` | Layout read then class write; idle while closed because it tracks only its own signals; the rendered-mode check makes it measure the dropdown layout, never the classes of the mode before (building-blocks 1.5) |
| Completion (`opened`/`closed`, `data-nfs-shown`, end of `is-closing`) | `afterRenderEffect` `read` phase reads the animated element's computed transition when a phase starts; `transitionend` host listener or fallback timer ends it | The Accordion spec's measured completion; durations are the consumer's settings |
| Mode swap: plan and commit | `afterRenderEffect`: `earlyRead` compares the driven mode with `mode` and on a difference reads `document.activeElement` and DOM order and plans; `write` sets `mode` and applies the plan in the same phase | Focus is read while the old mode's classes still apply, and the new mode and the pruned Open path land in one change-detection pass (ADR 0035); replaces the prototype's `effect`, which read the DOM and propagated state between signals (1.5). 1.5's warning that a callback running after change detection has removed the nodes is too late does not apply: a swap re-classes surviving nodes and removes none, and this `earlyRead` reads focus before the pass that applies the new classes |
| Refocus off a hidden back item after a swap | `afterNextRender` registered by the swap's `write` (`earlyRead` picks the target, `write` focuses) | Runs after the render that applied the swap, so it acts on rendered state (1.5) |
| `.top-bar-right` ancestry, only when `nfsTopBarRightToken` was not found (a projected menu) | `afterNextRender` (`earlyRead` walks, `write` sets the signal), once, with development check 6 | A DOM walk, not allowed before hydration; a menu declared in the section has the token and skips it |
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

Constant across modes, except the Drilldown level names that drilldown mode adds (a swap adds or removes those and changes nothing else here):

| Element | Semantics |
| --- | --- |
| Root and submenu `ul`, every `li` | Native `list` and `listitem`; no `role`, and no `aria-*` except, in drilldown mode, `aria-labelledby` on each submenu naming its Drilldown level after its parent toggle (a Hybrid item's level by its toggle, named by its `span[nfsSubmenuToggleText]`) |
| Parent button (`nfsSubmenuToggle`) | Native `button`, `type="button"`, `aria-expanded`, `aria-controls` = the submenu id; name from its text |
| Hybrid item | `a[href]` (navigates) followed by the toggle, named by its `span[nfsSubmenuToggleText]` |
| Current page | `aria-current="page"` on the link, written by the consumer (with the Router: `routerLinkActive` plus `ariaCurrentWhenActive="page"` on the link), in every mode and never a class; `nfs-menu` gives the link Foundation's active menu look (the Menu spec, D4) |
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
| 1.3.1 Info and Relationships | Native nested lists convey the hierarchy; the toggle's `aria-controls` names its submenu; in drilldown mode each submenu's `aria-labelledby` names its Drilldown level after its parent toggle, in server HTML too; the current page is `aria-current` on its link in every mode, the only source of its look (the Menu spec, D4), and a copied current-page `is-active` is stripped and reported | Story axe gate; SSR smoke |
| 1.4.1 Use of Color | The current link inside the menu differs from its neighbours by its filled background (`nfs-menu`, Foundation's `menu-state-active`), which must reach 3:1 against the background those neighbours sit on. `nfs-menu` checks `$menu-item-background-active` against `$body-background` (the Menu spec); each mode's mixin also stops the compile with `@error` naming the setting when it is under 3:1, unrounded, against its mode's backgrounds that are not `null`: accordion `$accordionmenu-item-background`; drilldown `$drilldown-background` and `$drilldown-submenu-background`; dropdown `$dropdownmenu-submenu-background`. On the dropdown top level, `nfs-dropdown-menu`'s rule 14 keeps the fill over Foundation's `.dropdown.menu > li > a` background, and its check covers a set `$dropdownmenu-background` (the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), D21). An open nested Hybrid item's link in dropdown mode takes the same fill, Foundation's `.menu .is-active > a` highlight for an open nested parent, which the Dropdown Menu spec keeps (its D15); on that level the fill marks either the current link or the open parent, as in Foundation, and the open parent also shows its state through its toggle's `aria-expanded` and the visible submenu ([ADR 0042](../adr/0042-menu-current-page-aria-current.md), dated note). With defaults every pair is 4.65:1, computed exactly (Foundation's `color-luminance()` gives 4.59:1) | Node-level Sass compile test |
| 1.4.3 Contrast (Minimum) | Parent buttons use `$anchor-color`, the colour Foundation gives menu links (4.65:1 on `$body-background` with defaults); the dropdown open-parent twin uses `$dropdown-menu-item-color-active`; no library rule introduces a new text colour pair. Inside Foundation's default Top Bar both are 3.76:1 against `$topbar-background`, so a dropdown-mode menu in a Top Bar needs the bar and submenu backgrounds the [Spec: Top Bar](../issues/86-spec-top-bar.md) requires (`$topbar-background: $white;` and, after Foundation's settings file, `$topbar-submenu-background: $topbar-background;`); `nfs-top-bar` stops the compile for `$anchor-color`, and `nfs-dropdown-menu` warns for `$dropdown-menu-item-color-active` | Story axe gate (`color-contrast`) |
| 1.4.10 Reflow | Dropdown mode: at 320 CSS px no submenu makes the page scroll sideways. Foundation's default `$dropdownmenu-min-width: 200px` fails, because a submenu from a narrow item between about 120 and 200 px from the left fits neither side and `opens-inner` keeps its left edge; the consumer must set `$dropdownmenu-min-width: min(200px, 45vw);`, and `nfs-dropdown-menu` warns at compile time when the setting is a fixed length over 160 px ([Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), decision 24) | e2e at 320 px (Dropdown Menu spec); Sass compile test |
| 1.4.11 Non-text Contrast | Every arrow (Foundation's and the button twins) must reach 3:1 against its background; with defaults `$primary-color` on white is 4.65:1. Each mode's mixin fails the compile with `@error` naming the setting when the ratio of `$<mode>-arrow-color` against its background, computed with the exact WCAG formula by the library's exact-luminance helper and compared unrounded, is below 3 (Foundation's `color-luminance()` overstates some ratios, and its `color-contrast()` rounds to one decimal and would pass 2.95:1; building-blocks 1.10): accordion against `$accordionmenu-item-background` or else `$body-background`; drilldown against `$drilldown-background` and `$drilldown-submenu-background`; dropdown against `$dropdownmenu-background` or else `$body-background`, and `$dropdownmenu-submenu-background`. The dropdown mixin also checks the Hybrid toggle's `$accordionmenu-arrow-color` against those dropdown backgrounds when `$accordionmenu-submenu-toggle-background` is `null`, because the arrow then sits on the row's background; the drilldown mixin also checks `$dropdownmenu-arrow-color`, which Foundation uses for the `.align-left`/`.align-right` twins, against the drilldown backgrounds, and the Hybrid toggle's `$accordionmenu-arrow-color` against `$body-background` and `$drilldown-submenu-background` when `$accordionmenu-submenu-toggle-background` is `null` (Sass checks) | Node-level Sass compile test (axe has no 1.4.11 rule) |
| 1.4.12 Text Spacing | An open accordion submenu stops clipping once its opening transition ends (`data-nfs-shown`), so enlarged spacing is not cut off | Browser-level test; e2e |
| 1.4.13 Content on Hover or Focus | Hover-opened dropdown submenus are dismissible (Escape from anywhere, through Light dismiss), hoverable (the Hover region is the item, which contains its submenu), and persistent (no auto-hide; closing after `closingTime` only once the pointer leaves the item); nothing opens on focus | Story play; e2e with a real mouse |
| 2.1.1 Keyboard | Every open, close, and link is reachable with Tab, Enter, and Space alone; arrow keys only add shortcuts; hover opening always has the click equivalent | Story play |
| 2.1.2 No Keyboard Trap | Nothing traps focus; Tab always leaves the menu | e2e |
| 2.4.3 Focus Order | DOM order; closed submenus and hidden drilldown levels are out of the tab order (`inert`, `visibility: hidden`) | e2e Tab sweeps |
| 2.4.7 Focus Visible | The user agent's focus ring on every control: the library removes no outline, and Foundation's `disable-mouse-outline` acts only under what-input's `[data-whatinput='mouse']`, which the library never sets. A collapsed or animating accordion submenu clips, but its controls are `inert` then; an open one does not clip. The drilldown wrapper must clip (the slide needs it), so the `nfs-drilldown` mixin draws focus rings inside the control box (`outline-offset: -2px` on `:focus-visible` links and buttons inside `.is-drilldown`), and no edge of a ring is clipped, `autoHeight` included (rule 13; amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decision 38) | e2e screenshot per mode |
| 2.4.11 Focus Not Obscured (Minimum) | Overlaying dropdown submenus close when focus leaves them, per submenu, so an `opens-inner` submenu dropped over later siblings closes before Tab reaches them (prototype row 25); accordion submenus are in flow and drilldown levels replace each other; a hover-opened submenu over the focused element is dismissible with Escape without moving focus | e2e hit test of the focused control's centre |
| 2.5.8 Target Size (Minimum) | Parent buttons and links fill their row (38 px high with `$menu-items-padding` defaults); the Hybrid item's toggle is `$accordionmenu-submenu-toggle-width` by `-height` (40 px), in every mode because the directive binds `.submenu-toggle`. The mixins fail the compile with `@error` when either toggle setting is below 24 px, and each also when a row of its mode (`1rem` plus twice the first value of the mode's item or submenu item padding, through `rem-calc()`) is below 24 px, because row height is a consumer setting the story gate never sees (Sass checks; amended 2026-09-26, audit 0005 M1) | Story axe gate (`target-size`, turned on by the `wcag22aa` tag); Sass compile test |
| 3.2.1 On Focus | Focus never opens, closes, or navigates | Story play |
| 4.1.2 Name, Role, Value | Buttons with their visible text or the `span[nfsSubmenuToggleText]` name, `aria-expanded` from state, no invalid or empty roles; a development warning for a hybrid toggle whose name is missing or visible | Story axe gate; browser-level test |

The story axe gate runs with the six tags of ADR 0018 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) in every mode, closed and open, after the animations settle. No Foundation default fails a criterion in accordion or drilldown mode. In dropdown mode two do, as the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md) found: the submenu width at 320 CSS px (1.4.10) and, for a menu inside a Top Bar, the text contrast against the bar (1.4.3). The library's Storybook therefore compiles Foundation with the Dropdown Menu spec's settings overrides, `$dropdownmenu-min-width: min(200px, 45vw);`, and the Top Bar spec's `$topbar-background: $white;` with `$topbar-submenu-background: $topbar-background;`.

### Rendered HTML

Consumer markup (one markup for every mode; a ResponsiveMenu root shown). It carries no class: the root's Menu classes come from `orientation` on its hosted `NfsMenu`, each submenu's `menu nested vertical` from `NfsSubmenu`, the back item's `js-drilldown-back` from `NfsDrilldownBack`, and the toggle text's class from `NfsSubmenuToggleText`:

```html
<nav aria-label="Main">
  <div nfsDrilldownWrapper>
    <ul nfsResponsiveMenu="drilldown medium-dropdown" [orientation]="{small: 'vertical', medium: 'horizontal'}">
      <li nfsMenuItem>
        <button nfsSubmenuToggle>Products</button>
        <ul nfsSubmenu>
          <li nfsDrilldownBack><button type="button">Back</button></li>
          <li nfsMenuItem><a href="/products/boards">Boards</a></li>
          <li nfsMenuItem><a href="/products/wheels">Wheels</a></li>
        </ul>
      </li>
      <li nfsMenuItem>
        <a href="/services">Services</a>
        <button nfsSubmenuToggle hybrid><span nfsSubmenuToggleText>Services pages</span></button>
        <ul nfsSubmenu>
          <li nfsDrilldownBack><button type="button">Back</button></li>
          <li nfsMenuItem><a href="/services/repairs" aria-current="page">Repairs</a></li>
        </ul>
      </li>
      <li nfsMenuItem><a href="/about">About</a></li>
    </ul>
  </div>
</nav>
```

Server HTML at the Server breakpoint `small` (drilldown), abbreviated: directive attributes and static input attributes left out, ids generated, the back and wrapper directives belong to the Drilldown spec; class order is not significant:

```html
<ul class="vertical medium-horizontal menu drilldown" jsaction="keydown:;click:;">
  <li class="is-drilldown-submenu-parent">
    <button type="button" id="nfs-submenu-toggle-x1-0" aria-expanded="false" aria-controls="nfs-submenu-x1-0" jsaction="click:;">Products</button>
    <ul id="nfs-submenu-x1-0" aria-labelledby="nfs-submenu-toggle-x1-0" inert=""
        class="menu vertical nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">
      <li class="js-drilldown-back">...</li>
      <li class="is-submenu-item is-drilldown-submenu-item"><a href="/products/boards">Boards</a></li>
      ...
    </ul>
  </li>
  <li class="is-drilldown-submenu-parent has-submenu-toggle">
    <a href="/services">Services</a>
    <button type="button" id="nfs-submenu-toggle-x1-1" class="submenu-toggle" aria-expanded="false" aria-controls="nfs-submenu-x1-1" jsaction="click:;">
      <span class="submenu-toggle-text">Services pages</span></button>
    <ul id="nfs-submenu-x1-1" aria-labelledby="nfs-submenu-toggle-x1-1" inert="" class="menu vertical nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">...</ul>
  </li>
  <li><a href="/about">About</a></li>
</ul>
```

Drilldown, hydrated, after opening Products: the root gains `invisible`; the Products `li` gains `data-nfs-expanded`; its button `aria-expanded="true"`; its submenu drops `inert` and `invisible` and gains `is-active visible`, then `data-nfs-shown` after the slide; focus is on Boards. After Back: the submenu gains `is-closing` (still `is-active visible`, now `inert`) until the slide ends, then `invisible`; the root drops `invisible`; focus is on the Products button.

Accordion mode, Products open (a root in accordion mode with `orientation="vertical"`, same items, Products bound `[expanded]="true"` or opened by the user):

```html
<ul class="vertical menu accordion-menu">
  <li class="is-accordion-submenu-parent" data-nfs-expanded="">
    <button type="button" id="nfs-submenu-toggle-x1-0" aria-expanded="true" aria-controls="nfs-submenu-x1-0">Products</button>
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
    <button type="button" id="nfs-submenu-toggle-x1-0" aria-expanded="true" aria-controls="nfs-submenu-x1-0">Products</button>
    <ul id="nfs-submenu-x1-0" data-nfs-shown="" class="menu vertical nested submenu is-dropdown-submenu js-dropdown-active first-sub">...</ul>
  </li>
  <li class="is-dropdown-submenu-parent has-submenu-toggle opens-right">...</li>
</ul>
```

A DropdownMenu root with `align="right"` (Foundation's `class="dropdown menu align-right"`), in server HTML: the hosted Menu binds `align-right`, and the Base side read from `align()` puts `opens-left` on every parent before hydration. Foundation's pre-open `is-active`, copied onto the submenu, would render exactly the same (stripped, and reported in development builds):

```html
<ul nfsDropdownMenu align="right">
  <li nfsMenuItem>
    <button nfsSubmenuToggle>Account</button>
    <ul nfsSubmenu><li nfsMenuItem><a href="/account/orders">Orders</a></li></ul>
  </li>
</ul>

<ul class="menu align-right dropdown" jsaction="keydown:;click:;">
  <li class="is-dropdown-submenu-parent opens-left">
    <button type="button" id="nfs-submenu-toggle-x2-0" aria-expanded="false" aria-controls="nfs-submenu-x2-0" jsaction="click:;">Account</button>
    <ul id="nfs-submenu-x2-0" inert="" class="menu nested vertical submenu is-dropdown-submenu first-sub">
      <li class="is-submenu-item is-dropdown-submenu-item"><a href="/account/orders">Orders</a></li>
    </ul>
  </li>
</ul>
```

`jsaction` lists the root's replayable listeners (`keydown`; `click` from DropdownMenu, present whenever the DropdownMenu root is on the element) and each toggle's `click`; Angular removes it after hydration. `transitionend` is not a replayable type and adds none. Generated ids differ between server and client and are rewritten at hydration, which is safe because `aria-controls` and `aria-labelledby` are themselves host bindings (building-blocks 1.5).

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

- Server-side rendering and first paint: the mode's classes, the hosted Menu's classes, `aria-expanded`, `aria-controls`, `inert`, and `data-nfs-*` are host bindings on signals the directives have by the first update pass, so the server HTML is the menu (rule 1), and a copied Foundation class is already stripped there. Closed submenus are hidden by Foundation's CSS (drilldown, dropdown) or by the accordion grid rule; open-at-first-paint submenus (a bound `expanded`) render open with `data-nfs-shown`. The dropdown Base side from `alignment`, `align`, direction, and `nfsTopBarRightToken` is in the server HTML; only a menu projected into a Top Bar's right-hand section changes side at hydration (development check 6). Nothing is measured on the server: collision classes fall back to the base side, and the Drilldown wrapper's `min-height` comes after hydration (Drilldown spec).
- ResponsiveMenu: the server renders the Server breakpoint's mode (rule 9; ADR 0014), and every instance starts from that mode (ADR 0035; the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md)): its driven mode resolves at the Server breakpoint until its first render callback, so server HTML and deferred blocks hydrate as sent. On a client at another breakpoint the Breakpoint service goes live and ResponsiveMenu's first-render flag flips in the first render callbacks; the root's swap callback, dirtied after its own `earlyRead` already ran, runs again in the same tick, reads focus under the old classes, and commits the new mode with the pruning, which the next pass renders before paint; hydration sees the server's values first, so there is no mismatch (prototype row 17; [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md)). The layout of the Server breakpoint's mode is visible until the app hydrates (prototype row 18), which is the documented cost of server rendering a breakpoint-gated mode.
- Before hydration: construction injects and registers only (plus, in development builds, the static `class` read of the copied-class check, whose warning waits for the client); focus, layout, observers, timers, document listeners, and the `.top-bar-right` walk run only in render callbacks and handlers (rules 3 to 5). No DOM structure is created: back buttons, toggles, and the wrapper are consumer-written (rule 4).
- Event replay: a toggle's `click` replays and toggles; the handler calls no `preventDefault()`. A root `keydown` replays: state changes, focus moves in the following render, and the trailing `preventDefault()` throws, so Angular's `ErrorHandler` logs one error per replayed handled key, the accepted default of building-blocks Part 4 item 3; `stopPropagation()` runs before it, so an enclosing widget does not handle the key again. A link inside the menu navigates natively before hydration (the root, not the link, carries `jsaction`). Hover uses code-added `pointerenter`/`pointerleave`, which are never replayed, so a stale hover never opens a submenu; Light dismiss listeners are document-level and exist only while a submenu is open, which is never before hydration.
- Hydration boundary: the root and every item and submenu of the menu share one boundary (rule 7); a consumer's `@defer` wraps the whole `nav`, never a submenu, because items register when constructed and a dehydrated branch would be missing from its parent.
- `@defer`: library templates contain no `@defer`; the entry point is separate so a consumer can defer the menu. Inside a dehydrated block the menu is its server HTML; a click on a toggle hydrates the block and replays. Inside `hydrate never` the links work and the toggles do nothing; closed submenus stay closed. Plain `@defer` renders on the client: a standalone root has no swap, and a ResponsiveMenu root renders the Server breakpoint's mode and swaps in the same tick, never painted.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; the fallback timers and the helpers' listeners run outside the zone and reach Angular only by writing signals.

### Sass and custom CSS

The utility has no mixin of its own. Its rules are emitted by the three plugin Library mixins, each keyed on its root class so that only the live mode's rules match a ResponsiveMenu: `nfs-accordion-menu`, `nfs-drilldown`, `nfs-dropdown-menu`. The rules, their reasons, and the settings they reuse are listed once in the Sass subsection under Further Notes; the plugin specs refer to it. Every root and submenu is a Menu, so a consumer of any menu Plugin also includes the Menu's `nfs-menu`, which gives the current link its look (the Menu spec).

## Testing Decisions

A good test asserts what a user or assistive technology observes: which classes and ARIA each element carries in each mode, whether a submenu is `inert`, where focus is after each key, what the server HTML contains, and which outputs fired. No test reads a directive's private fields. Tests that need a root before the plugin specs exist use a test root: a directive on `ul` that calls `nfsMenuRootProviders` with a mode input, hosts `NfsMenu` with the five inputs the plugin roots expose, binds the three root classes, forwards `keydown` and `click`, calls `configure()` from its inputs, and can `drive()` the mode from a signal; it lives with the tests and stories, not in the public API. No story, test host, or fixture writes a Foundation or library class, except the copied-class cases, which say so. Prior art: the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) suite (classes, roles, keys, grid samples, collision, focus continuity F1 to F4, server HTML, axe per mode), the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) suite (the per-pass recorder of the swap commit and the Hybrid-link case; its static `is-active` seed case is replaced by the bound initial state), the host-directive probe recorded in the [Spec: Menu](../issues/85-spec-menu.md) ticket and this spec's re-run probe, and the Anchored pane spec's test consumers.

Story ids follow `nested-menu--<story>`: `nested-menu--accordion`, `nested-menu--accordion-single`, `nested-menu--hybrid`, `nested-menu--drilldown`, `nested-menu--dropdown`, `nested-menu--dropdown-vertical`, `nested-menu--dropdown-hover`, `nested-menu--dropdown-edge`, `nested-menu--rtl`, `nested-menu--mode-swap` (mode driven by a story arg), and `nested-menu--fixture` (args-driven mode, direction, viewport position, and open items for e2e).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` on the six WCAG 2.2 AA tags (ADR 0018), closed and after opening, waiting for running animations to finish.

- `nested-menu--accordion`: the Nest classes per the item table, and `menu nested vertical` on every submenu from the directives alone; the section bound `[expanded]="true"` is open at first render with no `opened`; the current link, marked `aria-current="page"`, is found by `getByRole('link', {current: 'page'})` and has the Menu's active fill; Enter and Space toggle `aria-expanded`, `is-active`, and `inert`; two sections open together (`multiOpen` default); Down and Up skip a closed section; Right opens, Left closes, Escape closes and focuses the toggle; `opened` and `closed` appear once each.
- `nested-menu--accordion-single`: with `multiOpen` off, opening a section closes its open sibling.
- `nested-menu--hybrid`: the link navigates (href unchanged), the toggle carries `submenu-toggle`, its item `has-submenu-toggle`, and its `span[nfsSubmenuToggleText]` `submenu-toggle-text`, in all three modes (arg); its accessible name is the span text while the span's box is Foundation's visually hidden 1 px clip.
- `nested-menu--drilldown`: opening moves focus to the first non-back control of the level; the root gains `invisible`, the level `is-active visible`; Left, Escape, and Back return and refocus; Tab never reaches a hidden level.
- `nested-menu--dropdown`: `first-sub`, `opens-right`, `js-dropdown-active`, `is-active`; Right and Left move along the top level, Down opens and focuses; opening a sibling closes the other; Tab out of a submenu closes it; a leaf click closes all; an outside click closes.
- `nested-menu--dropdown-vertical`: Down and Up move along the top level and Right opens.
- `nested-menu--dropdown-hover`: hover opens after the delay; moving into the submenu keeps it open; leaving closes after `closingTime`; hover then click keeps it open and a second click closes; Escape with focus outside closes.
- `nested-menu--dropdown-edge`: near the right edge the nested submenu carries `opens-left`; with no room either side, `opens-inner`; closing restores the base side.
- `nested-menu--rtl`: under `dir="rtl"`, `opens-left` by default, Left moves forward along the top level, and Left opens a nested submenu and Right closes it (Base side `opens-left`); in LTR with `align="right"` on the root (which binds `align-right`), every parent carries `opens-left` at first render, and Left opens and Right closes inside submenus while Right still moves forward along the top level.
- `nested-menu--mode-swap`: with focus inside an open submenu, a swap from dropdown to drilldown keeps focus there and the submenu open; with focus on an open submenu's toggle, entering drilldown closes that submenu and keeps focus on the toggle; with focus on the link of a Hybrid item whose submenu is open, entering drilldown closes that submenu and keeps focus on the link; accordion with two open sections to dropdown keeps only the focused one; with focus on a story control outside the menu (an `nfsButton`), entering dropdown closes every submenu (each item emits `expandedChange(false)` and `closed` fires once per closed item) and entering drilldown keeps the first open submenu per level; entering accordion closes nothing; with focus on a back button inside an open drilldown level, leaving drilldown puts focus on that level's first control that is not inside the back item; after every swap `mode` matches the root class.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Class maps, data-driven: every mode, parent and leaf, top-level and nested, open, closing, and closed, against the tables in API, over a fixture that writes no class; every submenu carries `menu nested vertical` in every mode; each map's key set is the same in every mode; a copied Foundation class (a submenu's `is-active`, a leaf's `is-active`, another mode's Nest class, `submenu-toggle` on a non-hybrid toggle) is absent in every mode and after each swap; an Application class on an item stays.
- Hosting: the test root hosts `NfsMenu`, so `orientation` and `align` bound on it set the Menu classes; a driving test root that hosts three test roots has one `NfsMenu` and its bound Menu inputs reach it; `align` and `iconPosition` bound on a submenu set its classes, and the submenu's `nested` and `vertical` hold against the hosted `NfsMenu`'s `false` keys; a root that hosts no `NfsMenu` fails at construction.
- DI: a nested root starts a new tree (its items register with it, not the outer submenu); an item without a root warns, emits no mode classes, and binds `hidden` and `.is-hidden` on its closed submenu, which stays hidden although the hosted Menu binds `.menu`; three roots under a driving test root share one `NfsMenuRoot` and only the live one's key handler acts.
- Registration under `@for` add, remove, and reorder, and inside `DeferBlockBehavior.Manual` blocks; the swap rule's "first open per level" follows DOM order after a reorder.
- Swap commit under a driving test root: a `MutationObserver` on the root subtree, drained after each change-detection pass, never records a state in which the root carries the new mode class while a submenu the swap closes is still open; in the prototype's F3 case and the Hybrid-link case no record shows the row that holds focus inside an `invisible` level; `mode` changes only in the pass that applies the pruning; `document.activeElement` is the same element before and after each swap for F1 to F4 and the Hybrid-link case; the observer is drained from an `afterEveryRender({earlyRead})` registered with the root environment injector (no view), which runs first in every after-render batch, so each drain covers the passes since the last batch (the recipe of the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md)); a back item holding focus hands it to the level's first non-back control after one `whenStable()`, never to `body`.
- Initial state: `[expanded]="true"` renders the submenu open at the first `whenStable()` with `data-nfs-shown`, no `expandedChange`, and no `opened`, and a later click closes it; a two-way `[(expanded)]` starting `true` behaves the same; a copied `is-active` on a submenu opens nothing, emits nothing, and warns once naming `[expanded]`.
- `configure()`: defaults from `nfsMenuBehaviourDefaults` when a slot is missing; ResponsiveMenu-style duplicate slots do not overwrite each other; only the live mode's completion functions are called.
- Completion with a fake timer and dispatched `transitionend`: the matching property and target completes; a nested submenu's event does not; zero duration and `nfsAnimationsToken.disabled` complete at once; the fallback fires at total plus 100 ms; `data-nfs-shown` timing.
- Focus-loss guard and `afterNextRender` ordering: a focus move after `expanded.set(true)` lands once `inert` is gone; `preventScroll` is passed in drilldown.
- Hover and keyboard focus in dropdown mode: with focus on a link inside Item 2's open submenu, hovering Item 1 past `hoverDelay` opens nothing, Item 2 stays open, and focus stays on the link; with focus outside the menu, the same hover opens Item 1 and closes Item 2.
- Drilldown level names: in drilldown mode each submenu's `aria-labelledby` equals its parent toggle's `id`, the Hybrid level's included (the toggle, not the link); in accordion and dropdown mode no submenu carries it; a mode swap adds or removes it with the mode.
- Alignment: `alignment`, the root's `align` input (read through the hosted `NfsMenu`), a `Directionality` test double backed by a signal (or CDK's `[dir]` wrapper), and an `NfsTopBarRight` ancestor (through the token, also through an embedded view, a child component's template, and on the root itself) each give the documented side; a root projected into a section through a test layout component has `opens-right` until the first render callback and `opens-left` after it, and a template declared in the section and rendered outside it keeps `opens-left`; `alignment="left"` wins over `align="right"`; a later `align` change re-sides closed submenus only; a copied `align-right` on the root changes nothing; the dropdown Open and Close keys follow that Base side, while Next and Previous along a horizontal top level follow `Directionality`.
- Vertical detection: a root whose computed `flex-direction` is `column`, and a root whose first top-level item computes `display: block` (a `$global-flexbox: false` build), each use the vertical top-level row of the dropdown key table.
- Replay-safe handlers: a `keydown` whose `eventPhase` reads 101 and whose `preventDefault` throws changes state, moves focus, stops propagation (an outer spy sees nothing), and reaches `ErrorHandler` once; a replay-shaped toggle `click` toggles with no error.
- Dev-mode warnings, one case per check of Development checks: each copied class with its message (`is-active` on a submenu and on a parent item name `[expanded]`, on a leaf `aria-current`, `submenu-toggle` names `hybrid`), and none for a submenu's redundant `menu nested vertical`; a hybrid toggle with no name, and one whose text sits outside `span[nfsSubmenuToggleText]`; a `span[nfsSubmenuToggleText]` in a non-hybrid toggle and outside any toggle; a parent without a toggle, and no check 4 warning for a parent whose `button[nfsSubmenuToggle]` directive is not imported (the item's child probe reports it once); `expandAll()` outside accordion or with `multiOpen` off; a projected right-hand root (check 6), and none for a root declared in the section; none for correct markup; none during a server render.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.

- SSR smoke: `renderApplication` over a fixture that writes no class attribute, with a test root in each mode, a Hybrid item with its `span[nfsSubmenuToggleText]`, a submenu open at first paint from `[expanded]="true"`, a dropdown-mode root with `align="right"`, a dropdown-mode root declared inside `nfsTopBarRight` (asserting `opens-left`), a dropdown-mode root a layout component projects into its right-hand section (asserting `opens-right`), a driven root at the Server breakpoint with `[orientation]="{small: 'vertical', medium: 'horizontal'}"`, and a menu inside `@defer (hydrate on interaction)`. Assert `whenStable()` resolves (no pending timers); the HTML matches the Rendered HTML section: `menu` and the orientation classes on each root, `menu nested vertical` on every submenu, `submenu-toggle-text` on the span, `opens-left` on every parent of the `align="right"` root, classes per mode, `aria-expanded`, `aria-controls` resolving to an element, an `id` on every toggle, `aria-labelledby` on each submenu only under the drilldown-mode root, resolving to its parent toggle's `id`, `inert` on closed submenus, `data-nfs-expanded` and `data-nfs-shown` on the open one, no `role` attribute anywhere, no inline style; `jsaction` on the root (`keydown`, and `click` for dropdown) and on each toggle (`click`); `ngb` and `click:;keydown:;` on the deferred block's root.
- Pure logic, table-driven: the class-map functions per mode and state, each returning the same key set in every mode, the copied-class token test and its message per class, the dropdown Base side rule over `alignment`, `align`, and direction, the key-to-action table per mode, direction, and Base side, and the swap pruning plan from a description of the open tree, the focused control (inside, outside, or on a back item), and the mode entered.
- Sass compile (the library's node-level Sass test): each mixin compiles after Foundation with defaults; a failing arrow colour, a 20 px toggle setting, and a mode's item padding of `0.2rem 1rem` (a 22.4 px row) each stop the compile with the named setting, in each of the three mixins; with `$accordionmenu-submenu-toggle-background: null`, an `$accordionmenu-arrow-color` below 3:1 against the dropdown backgrounds stops `nfs-dropdown-menu`; a `$drilldown-submenu-background`, a `$dropdownmenu-submenu-background`, or a set `$accordionmenu-item-background` of `$primary-color` (1:1 against Foundation's default `$menu-item-background-active`, which is `$primary-color`) stops its mixin naming the 1.4.1 check, and `null` backgrounds are skipped; each mixin runs its 1.4.1 check before its arrow checks, because on Foundation's defaults `$menu-item-background-active` and every arrow colour are `$primary-color` (`$dropdownmenu-arrow-color` is `$anchor-color`), so a `$primary-color` background fails both and the case must still name the 1.4.1 check; `nfs-drilldown` emits rule 13 and names `.is-drilldown.animate-height` in its reduced-motion block.

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
- Submenu open at first paint (`[expanded]="true"`) near the right edge, prerendered at `small`, hydrated at 1280 px: with focus on one of its links before hydration (main bundle held back), the swap keeps it open and its item ends with the `opens-*` class a fresh open at that position gives, never one measured from the drilldown layout; with focus outside the menu, the swap closes it and its item carries the Base side class.
- Pre-hydration click on a toggle with the main bundle held back: the submenu opens exactly once after hydration; a pre-hydration ArrowDown on a focused toggle replays with the one accepted error log.
- `@defer (hydrate on interaction)` around the `nav`: a toggle click hydrates and opens; `hydrate never`: links navigate, toggles do nothing, no error.

## Out of Scope

- The root directives, their Options, Defaults tokens, aggregate outputs, and `exportAs` names: the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), and [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md).
- Drilldown's wrapper, measurement, back button directive, `closeOnClick`, `animateHeight`, `autoHeight` height, and `scrollTop`: the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md).
- The Menu directive (`NfsMenu`, `NfsMenuText`), its Variant inputs, their types and runtime checks, its development checks, and `nfs-menu`: the [Spec: Menu](../issues/85-spec-menu.md). This spec hosts it on every submenu and requires the roots to host it.
- The Top Bar's sections and their classes (the [Spec: Top Bar](../issues/86-spec-top-bar.md)); the utility reads `nfsTopBarRightToken`, and a `.top-bar-right` ancestor when no token was found, for the dropdown Base side.
- The dropdown top level's current-link look and its contrast pair (the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md)).
- Opt-in `role="menu"` or `role="tree"` variants (map, Out of scope).
- Typeahead, Home and End (APG optional keys Foundation never had), and roving `tabindex`.
- `parentLink` clones and any generated DOM.
- Mega menus and arbitrary content inside submenus beyond links and nested lists: not a Foundation feature; Foundation's menus nest lists of links, and no docs page puts other content in a submenu.
- Runtime theming; native `popover` and anchor positioning (Further Notes).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Directives on the consumer's `li`, `ul`, `button`, and toggle-text `span`, plus a root handle behind `nfsMenuModeToken` | ADR 0001 and ADR 0004; the prototype carried all modes this way; ADR 0039 adds the span's directive | A menu component that renders the tree (breaks Foundation's markup) |
| D2 | The token's value is `NfsMenuRoot`, created by `nfsMenuRootProviders(mode)` in the root's injector | Items need mode, behaviour Options, and a registry; a factory can inject the root element and create render callbacks | A bare `Signal<NfsMenuMode>` token (items would need a second token for everything else) |
| D3 | Three roots on one `ul`, ResponsiveMenu's provider wins, each root forwards keys only in its mode | The prototype's measured shape; the composition guide's provider rule | One merged root host directive through Angular 22.0's host-directive de-duplication (measured for the hosted `NfsMenu`, not for a root; the three-listener shape is the measured one) |
| D4 | Per-mode behaviour slots through `configure(mode, ...)` | Three roots on one element never overwrite each other; plugin specs stay thin | Behaviour inputs on the items; one shared Options object |
| D5 | `nfsMenuItem` on every `li`, leaves included | Foundation gives every submenu item `is-submenu-item`; the registry and the focus-loss guard need them | Directives on parents only (loses Foundation's classes) |
| D6 | Parent-owned registration, sorted at event time, no `MutationObserver` | No reader needs a reactive order | Aria's `SortedCollection` observer per submenu |
| D7 | Each class map holds every class the family binds on that kind of element in any mode, `true` or `false` (revised 2026-09-28 under the class rule) | Building-blocks 1.4: a copied Foundation class is stripped on server and client and reported, so the directives are the one source; a constant key set means a Mode swap never reveals a copied class; the old reason, keeping a consumer's current-page `is-active`, is gone, because the current page is `aria-current` (the Menu spec, D4); measured in this spec's re-run | Keys only for the current mode (the published D7: a copied class of another mode survives and can show after a swap) |
| D8 | Disclosure roles in every mode; `aria-expanded` on the button; `inert` on closed submenus | ADR 0004; APG; building-blocks 1.10 | Nest's roles; `aria-expanded` on the `li` (invalid on `listitem`) |
| D9 | Hidden drilldown ancestor levels use Foundation's `invisible`, never `inert` | `inert` on an ancestor blocks the open level (prototype row 9) | building-blocks' "`inert` on the hidden parent level" |
| D10 | Hybrid toggles carry `.submenu-toggle` in every mode | Foundation's only toggle styles; without them axe `target-size` failed (prototype row 20) | Accordion-only toggle styling |
| D11 | Accordion grid keyed on `data-nfs-expanded` on the `li`, clip released by `data-nfs-shown` on the submenu | Foundation keys this state on an attribute of the `li` (`[aria-expanded]`) that the library cannot use; a `data-nfs-*` attribute keeps the State class vocabulary Foundation's, as the Sticky spec's `data-nfs-sticky-on`; releasing the clip is the Accordion spec's rule | A library `is-expanded` class (contradicts the glossary's State class); `is-active` on the `li` (Foundation's `.menu .is-active > a` active-link style on the Hybrid link; its second reason, stripping a consumer's `is-active`, fell away with the class rule); an inline style binding (consumers need `!important`); `aria-expanded` on the `li` |
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
| D24 | Hover guard: in dropdown mode the hover-intent `open` callback does nothing while focus is inside an open submenu of a sibling item | Opening would close that submenu under focus, and the focus-loss guard would then move keyboard focus to its toggle although the user pressed no key, which the screen reader speaks; so hover never moves keyboard focus (2.4.3; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md), check 8) | Opening on every hover, as Foundation's `_show` does by hiding the open siblings (a pointer resting over the menu takes keyboard focus away) |
| D25 | Drilldown level names: in drilldown mode each submenu binds `aria-labelledby` to its item's toggle `id`, a Hybrid level's to its toggle; every toggle binds an `id` in every mode (the consumer's static one, else generated) | Opening a Drilldown level fires only a focus event, because the render that opens the level hides its toggle, so the level's name is the one cue of which level the user entered (the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), D23; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md), check 9); the binding sits on `NfsSubmenu`, so every root and every Mode swap get it; with the toggle `id` bound in every mode, a swap adds or removes only the submenu's reference | Unnamed levels; naming submenus in accordion and dropdown mode too (there the toggle stays visible and its `aria-expanded` change reaches the focused control, measured by check 8); naming a Hybrid level by its link (a second naming rule) |
| D26 | Every plugin root and `NfsSubmenu` host `NfsMenu`; the roots expose `orientation`, `expanded`, `simple`, `align`, and `iconPosition`, the submenu `align` and `iconPosition` | The class rule gives `.menu` and its Variants one owner, and every list of a menu is a Menu (the Menu spec, D5, measured with Angular 22.2.0); ResponsiveMenu gets one `NfsMenu` through its roots | Each root and the submenu binding `.menu` and copying the Menu's inputs (five copies of one input set); the consumer writing `nfsMenu` beside each root and submenu (two attributes per list, and a forgotten one leaves it unstyled; still harmless) |
| D27 | `NfsSubmenu` binds `nested` and `vertical` itself, `true` in every mode and without a root; no input for either | Foundation's docs write both on accordion and drilldown submenus, its DropdownMenu adds `vertical` to every dropdown submenu, and each mode's CSS makes them right there (`$dropdownmenu-nested-margin` and `$drilldown-nested-margin` are 0; a dropdown submenu is `display: none` or `block`); the host's own map beats the hosted `false` keys (measured) | Exposing the Menu's `nested` and `orientation` on the submenu (settings no Foundation example varies, and a horizontal submenu breaks every mode's layout and key table); binding them per mode |
| D28 | The dropdown Base side reads the hosted Menu's `align()` through `inject(NfsMenu, {self: true})` in the root's factory | The class rule removes the static `align-right` the root read; `align` is the input that sets it; the factory runs at the root element (source), and a server render read it for a dropdown root and a ResponsiveMenu root (measured) | Passing `align` through the Dropdown root's `configure()` slot (a Menu Variant is not a DropdownMenu Option, and the root handle already sits on the element that hosts the Menu, so the slot would carry a second copy of one signal); reading the root's static class (forbidden, building-blocks 1.4) |
| D29 | The initial open state is the item's `expanded` model, bound; the static `is-active` seed is removed; a copied `is-active` is stripped and reported | Building-blocks 1.4; ADR 0039; the Accordion re-run's `[expanded]="true"` precedent; a bound value renders identically on server and client and emits nothing | Keeping the seed (a class-based second spelling of the state); an `open` input on the submenu (two writable copies of one state) |
| D30 | `span[nfsSubmenuToggleText]` binds `.submenu-toggle-text`, with a development check for a span outside a `hybrid` toggle and a hybrid name outside the span | ADR 0039 names the class; Foundation's element is a `span` inside the toggle; the name stays visible text in the accessibility tree | A `label` input on the toggle rendering the span (a template on a consumer-written button); the Visibility Classes' screen-reader-only directive (Foundation's own class for this element is `.submenu-toggle-text`) |
| D31 | `hybrid` keeps `booleanAttribute` | Not a Variant input: it chooses which Foundation element the button stands for (the parent link or the generated `.submenu-toggle`) and switches behaviour, so building-blocks 1.4's Option rule applies; changing the transform later breaks only typo'd templates | `nfsVariantBoolean` (strict, but for a behaviour input no other spec types that way); two directives for parent and Hybrid toggles (a new API for four specs) |
| D32 | The current link's fill is checked at compile time against each mode's non-`null` backgrounds (1.4.1) | The library now owns the current look through `nfs-menu`, whose own check compares only `$body-background`; the Menu spec's 3:1 rule applied to the backgrounds a menu Plugin paints | No check (a consumer's dark submenu background silently loses the current look); a runtime check (the pair is compile-time settings) |
| D33 | The Top Bar's right-hand section reaches the dropdown Base side through `nfsTopBarRightToken` at construction; a DOM walk after hydration runs only when no token was found (revised 2026-09-28 by the [Re-run: Dropdown Menu spec under the class rule](../issues/113-rerun-dropdown-menu-class-rule.md)) | The token resolves on the server, so a menu declared in the section carries its side in the server HTML (building-blocks 1.11 decision 1); declaration-site DI misses a menu projected into the section from another template, which the walk still finds after hydration, with development check 6; the walk can only add a section DI missed, so the two never disagree (measured in three engines) | The walk alone (this row before the revision: the side flips at hydration in every Top Bar layout); the token alone (a projected menu keeps the wrong preferred side in production) |

### Usage examples

The DropdownMenu root, abbreviated (the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md) owns its inputs):

```ts
@Directive({
  selector: 'ul[nfsDropdownMenu]',
  exportAs: 'nfsDropdownMenu',
  providers: [nfsMenuRootProviders('dropdown')],
  // .menu and the Menu's Variant classes; the root's factory reads align() from this NfsMenu
  hostDirectives: [{directive: NfsMenu, inputs: ['orientation', 'expanded', 'simple', 'align', 'iconPosition']}],
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

The AccordionMenu and Drilldown roots host `NfsMenu` the same way; the AccordionMenu root adds `multiOpen` and `expandAll()`; the Drilldown root binds `[class.invisible]="root.mode() === 'drilldown' && root.hasOpenItem()"`. ResponsiveMenu lists no Menu input: one `NfsMenu` arrives through its three roots, and a Menu input bound on the `ul` reaches it (measured in the Menu ticket):

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

Consumer markup for an AccordionMenu with an item open at first paint, a Hybrid item, and the Router marking the current page. No class is written: `orientation="vertical"` replaces Foundation's `class="vertical menu"`, `[expanded]="true"` its pre-open `is-active`, and `routerLinkActive ariaCurrentWhenActive="page"` its current-page `is-active`:

```html
<nav aria-label="Docs">
  <ul nfsAccordionMenu orientation="vertical" [multiOpen]="false">
    <li nfsMenuItem [expanded]="true">
      <button nfsSubmenuToggle>Getting started</button>
      <ul nfsSubmenu>
        <li nfsMenuItem>
          <a routerLink="/install" routerLinkActive ariaCurrentWhenActive="page">Install</a>
        </li>
      </ul>
    </li>
    <li nfsMenuItem #guides="nfsMenuItem" [(expanded)]="guidesOpen">
      <a routerLink="/guides" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Guides</a>
      <button nfsSubmenuToggle hybrid><span nfsSubmenuToggleText>Guides pages</span></button>
      <ul nfsSubmenu>
        <li nfsMenuItem><a routerLink="/guides/theming" routerLinkActive ariaCurrentWhenActive="page">Theming</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

A Hybrid item's link matches exactly, because `RouterLinkActive`'s default subset match would also mark it current on every page of its section. Without it, `/guides/theming` carries two links with `aria-current="page"`.

A DropdownMenu in a right-aligned position, Foundation's `class="dropdown menu align-right"`:

```html
<nav aria-label="Account">
  <ul nfsDropdownMenu align="right">
    <li nfsMenuItem>
      <a href="/account">Account</a>
      <button nfsSubmenuToggle hybrid><span nfsSubmenuToggleText>Account pages</span></button>
      <ul nfsSubmenu>
        <li nfsMenuItem><a href="/account/orders" aria-current="page">Orders</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The Nested menu relies on Foundation's export mixins `foundation-menu`, `foundation-accordion-menu`, `foundation-drilldown-menu`, `foundation-dropdown-menu`, and `foundation-visibility-classes` (`invisible`, `visible`). A Hybrid item in any mode also needs `foundation-accordion-menu`, which holds Foundation's only `.submenu-toggle`, `.has-submenu-toggle`, and `.submenu-toggle-text` rules. Every root and submenu is a Menu, so the consumer also includes the Menu's `@include nfs-menu;` after `foundation-menu`, which gives the current link (`aria-current`) Foundation's active look through `menu-state-active` (the [Spec: Menu](../issues/85-spec-menu.md)). Its documented custom CSS is emitted by the three plugin Library mixins of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), each included after its Foundation export mixin: `@include nfs-accordion-menu;` after `foundation-accordion-menu`, `@include nfs-drilldown;` after `foundation-drilldown-menu`, `@include nfs-dropdown-menu;` after `foundation-dropdown-menu`. A ResponsiveMenu consumer includes the ones for the modes in its rules. There is no `nfs-nested-menu` mixin.

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
| 9 | `nfs-drilldown` | `.is-drilldown` | `overflow: clip; overflow-wrap: break-word` | Overrides Foundation's `overflow: hidden`, which a focus during the slide can scroll sideways (prototype rows 11 and 12); `overflow-wrap: break-word` because the clip cuts off a label word wider than the wrapper (measured: a 27-letter word in a 250 px panel loses 31.3 px with the 1.4.12 spacing in three engines), and the ResizeObserver height takes the extra line |
| 10 | `nfs-dropdown-menu`, gated on `$dropdownmenu-arrows` | `.dropdown.menu > li.is-dropdown-submenu-parent > button:not(.submenu-toggle)` (position, `padding-inline-end: $dropdownmenu-arrow-padding`, down `::after`); the `.vertical` root and nested `.is-dropdown-submenu .is-dropdown-submenu-parent.opens-left`/`.opens-right > button::after` side arrows, and the same `.<bp>-vertical` and `.<bp>-horizontal` variants inside `breakpoint()` for each of `$breakpoint-classes` (the Dropdown Menu spec's rule (c)) | Foundation's `dropdown-menu-direction` and `zf-dropdown-left-right-arrows` geometry with `$dropdownmenu-arrow-size` and `$dropdownmenu-arrow-color` | Foundation draws every arrow on `> a` |
| 11 | `nfs-dropdown-menu` | `.dropdown.menu > li.is-active > button` | `background: $dropdown-menu-item-background-active; color: $dropdown-menu-item-color-active` | Foundation paints the open top-level parent on `> a` |
| 12 | `nfs-accordion-menu`, `nfs-drilldown` | inside `@media (prefers-reduced-motion: reduce)`: rule 3's selector; `.drilldown .is-drilldown-submenu`, `.is-drilldown.animate-height` | `transition-duration: 1ms` | Reduced motion for the transitions the library adds or awaits, and for the height transition the Drilldown spec's `animateHeight` turns on (building-blocks 1.6 rule 5; `.is-drilldown.animate-height` amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decision 28) |
| 13 | `nfs-drilldown` | `.is-drilldown a:focus-visible`, `.is-drilldown button:focus-visible` | `outline-offset: -2px` | The wrapper must clip, so rings drawn outside a control lose their edges at the wrapper's sides (and, with `autoHeight`, top and bottom); an inset ring keeps every edge visible (2.4.7; amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decision 38) |
| 14 | `nfs-dropdown-menu` | `.dropdown.menu > li > a[aria-current]:where(:not([aria-current='false']):not([aria-current='']))` | `@include menu-state-active;` | The current link's look is `nfs-menu`'s rule at (0,2,1), which Foundation's `.dropdown.menu > li > a` (0,2,2, whenever `$dropdownmenu-background` is set) and `.dropdown.menu > li.is-active > a` (0,3,2, a Hybrid item's link while its section is open) outrank on the top level; at (0,3,2) after `foundation-dropdown-menu` this rule wins both (measured in three engines, the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), D21) |

Checks (no CSS output): each mixin stops the compile with `@error` naming the setting when its arrow colour is below 3:1 against its backgrounds (1.4.11) or when `$accordionmenu-submenu-toggle-width` or `-height` is below 24 px (2.5.8). Every mixin that checks the toggle size also stops the compile when `$accordionmenu-submenu-toggle-background` is not `null` and the arrow colour is below 3:1 against it, whatever the mode's arrow boolean, because Foundation draws the Hybrid item's arrow unconditionally (amended 2026-09-26 from the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), decision 37). When `$accordionmenu-submenu-toggle-background` is `null`, the Hybrid item's arrow sits on the row's background, so `nfs-dropdown-menu` also stops the compile when `$accordionmenu-arrow-color` is below 3:1 against `$dropdownmenu-background` or else `$body-background`, and against `$dropdownmenu-submenu-background` (amended 2026-09-26 from the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), decision 25). `nfs-drilldown` likewise stops the compile, when `$accordionmenu-submenu-toggle-background` is `null`, if `$accordionmenu-arrow-color` is below 3:1 against `$body-background` and `$drilldown-submenu-background` (1.4.11), and when a row, `1rem` plus twice the first value of `$drilldown-padding` or `$drilldown-submenu-padding` converted with `rem-calc()`, is below `rem-calc(24)` (2.5.8, rows at line height 1) (amended 2026-09-26 from the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), decisions 34 and 40). `nfs-drilldown` also stops the compile when `$dropdownmenu-arrow-color`, which Foundation uses for the `.align-left`/`.align-right` twins, is below 3:1 against `$drilldown-background` or `$drilldown-submenu-background` while `$drilldown-arrows` is on (1.4.11). `nfs-dropdown-menu` also warns (`@warn`, no CSS) when `$dropdownmenu-min-width` is a fixed length over 160 px (1.4.10) and when `$dropdown-menu-item-color-active` is under 4.5:1, or `$dropdownmenu-arrow-color` or, while `$accordionmenu-submenu-toggle-background` is `null`, `$accordionmenu-arrow-color` under 3:1, against `$topbar-background` or a differing `$topbar-submenu-background` (1.4.3, 1.4.11), as the Dropdown Menu spec states (amended 2026-09-26, audit 0005 L4; `$anchor-color` against the bar moved to `nfs-top-bar`'s `@error` on 2026-09-28, the [Spec: Top Bar](../issues/86-spec-top-bar.md)). `nfs-accordion-menu` and `nfs-dropdown-menu` stop the compile on `nfs-drilldown`'s row condition, over `$accordionmenu-padding` or `$accordionmenu-submenu-padding` and over `$dropdownmenu-padding` or `$dropdownmenu-submenu-padding` (2.5.8; amended 2026-09-26, audit 0005 M1, recorded in the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md) and the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md)). Each mixin also stops the compile when `$menu-item-background-active`, the current link's fill, is below 3:1 against a background of its mode that is not `null`: `nfs-accordion-menu` against `$accordionmenu-item-background`, `nfs-drilldown` against `$drilldown-background` and `$drilldown-submenu-background`, `nfs-dropdown-menu` against `$dropdownmenu-submenu-background` and, where it is not `null`, `$dropdownmenu-background`, on which rule 14 keeps the fill (1.4.1; `nfs-menu` checks `$body-background`; added 2026-09-28 under the class rule, the top-level pair from the Dropdown Menu spec's D21). Ratios are computed with the exact WCAG relative-luminance formula by the library's exact-luminance helper and compared unrounded (building-blocks 1.10, as amended from the [Spec: Top Bar](../issues/86-spec-top-bar.md)), because Foundation's `color-luminance()` overstates some ratios and its `color-contrast()` rounds to one decimal and lets 2.95:1 pass a 3:1 threshold.

(2) Reused settings, mixins, and functions: `$anchor-color`, `$accordionmenu-*`, `$drilldown-*`, `$dropdownmenu-*`, `$dropdown-menu-item-*-active`, `$menu-item-background-active`, `$topbar-background`, `$topbar-submenu-background`, `$breakpoint-classes`, `$global-left`, `$global-right`, `$body-background`, `css-triangle`, `menu-state-active`, `breakpoint`, `rem-calc`, all read from the consumer's compile, and the library's exact-luminance helper. The one parameter Foundation has no setting for is `nfs-accordion-menu`'s `$duration` (default 250 ms, Foundation's `slideSpeed` default).

(3) Custom properties: none. The accordion grid is keyed on `data-nfs-expanded` and `data-nfs-shown`, attributes the directives bind (building-blocks 1.13 implementation channel, not theming).

(4) Motion classes: none from `nfs-motion`. Reduced-motion overrides: rule 12.

(5) What breaks without the include: parent buttons render as inline, unpadded text with no arrows; a Hybrid item draws two arrows in drilldown and dropdown mode; in accordion mode closed submenus are visible (no grid rule hides them, and Foundation's inline `display: none` no longer exists) while `inert`; the drilldown wrapper can scroll sideways during a slide, and focus rings lose their edges at its sides. Without `nfs-menu` the current link has no look at all, since no class marks it; without `foundation-accordion-menu` a Hybrid toggle's `span[nfsSubmenuToggleText]` shows as visible text and the toggle has no box or arrow.

(6) Variant properties: none. The utility has no Open Variant family of its own; the Menu's breakpoint keys on a root's `orientation` and `expanded` are read back from `--nfs-breakpoint-classes`, which `nfs-breakpoint-properties` writes (the Menu spec).

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
- In dropdown mode the open and close keys follow the Base side and the horizontal top level follows the reading direction; Foundation's `_isRtl()` counted `align-right` (now the root's `align="right"`) and turned the keys, but also reversed the top level, whose items keep DOM order on screen.
- Accordion Right opens without moving focus (Foundation also focused the first child link); Escape closes the submenu containing focus rather than every submenu.
- The generated drilldown back buttons, wrapper, and AccordionMenu toggle buttons are consumer-written; `parentLink` clones are gone.
- The collision search uses Foundation's body-box formula once per open; `NfsSubmenu` binds `vertical` on every submenu in every mode (Foundation's JavaScript added `verticalClass` to dropdown submenus only; its docs write it, with `nested`, on accordion and drilldown submenus).
- Drilldown completes when `$drilldown-transition` is `none` (Foundation hung).
- The consumer writes no class (ADR 0039): the Menu directive hosted on every root and submenu binds `.menu` and the Menu's Variants; a section open at load is `[expanded]`, never a static `is-active`, which AccordionMenu read at `_init`; the current page is `aria-current` on its link, never `is-active` on its item; `align="right"` replaces the root's `align-right` class, which Foundation read for `alignment: 'auto'` and for `_isRtl()`; a Foundation class copied from Foundation's markup is stripped in every mode and reported in development builds.
