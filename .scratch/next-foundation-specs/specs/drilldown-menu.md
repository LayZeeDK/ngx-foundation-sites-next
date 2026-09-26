# Spec: Drilldown Menu

Ticket: [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA. Built on the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), whose API this spec uses as defined there.

## Problem Statement

A developer building a mobile-first site on Foundation for Sites writes a deep navigation tree as Foundation's nested `ul.menu` markup and wants it to behave as a Drilldown: one list at a time fills a fixed box, a parent slides its submenu in over the list it came from, and a back control slides it out again. Foundation's Drilldown plugin does this in jQuery, and the result is a menu an Angular library must not copy:

- The markup the user sees is not the markup the server sends. The plugin wraps the root in a generated `div.is-drilldown`, prepends a generated `li.js-drilldown-back > a` "Back" item to every submenu from an HTML string, optionally clones every parent link into its own submenu, strips the `href` from every parent link, and measures every list to write an inline `min-height` and a frozen `max-width` on the wrapper.
- The accessibility contract is broken. Nest stamps `role="menubar"` and `role="menuitem"` without the menu keyboard behaviour those roles promise, `aria-expanded` lands on `li` elements where user agents ignore it, submenus are `role="group"` with `aria-hidden`, and the back control is an `<a>` without `href` made focusable with `tabindex="0"`. A parent that should also lead to a section landing page cannot, because its link no longer has an `href`.
- Focus only moves when the keyboard opened a level, and only after `transitionend` plus a `setTimeout`, so a mouse user who opens a level has focus on a control that just became invisible, and a theme with `$drilldown-transition: none` never fires the cleanup, the `closed` event, or the focus move at all.
- `closeOnClick` binds a body click handler per open that calls `preventDefault()` on the click, so the first click on any link outside the menu is swallowed. `scrollTop` animates `html, body` with jQuery. Re-measuring depends on a MutationObserver protocol (`data-mutate`) shared with other plugins.

A server-rendered Angular application adds more: the root level must be the first paint without JavaScript, nothing may be measured or created before hydration, a tap on a parent before hydration must still open its level once the page hydrates, and the same markup must also work as an accordion menu or a dropdown menu when a ResponsiveMenu switches the Menu mode by breakpoint.

## Solution

Three small directives from one secondary entry point, `ngx-foundation-sites/drilldown-menu`, on the markup the developer writes, over the Nested menu utility:

- `ul[nfsDrilldown]` is the menu root. It provides the Nested menu root handle in drilldown mode, binds Foundation's `drilldown` class and, while a level is open, `invisible` on the root list, forwards keys to the utility's drilldown key table, and adds Foundation's Options: `autoHeight`, `animateHeight`, `closeOnClick`, `scrollTop`, `scrollTopElement`, `scrollTopOffset`. It emits `opened` and `closed` with the item once a level has finished sliding, and offers `collapseAll()` and `openPath(item)`, the counterpart of Foundation's `_showMenu`.
- `[nfsDrilldownWrapper]` on a consumer-written element around the root replaces Foundation's generated wrapper: it binds `is-drilldown` (and `animate-height`) while the menu is in drilldown mode, and the measured `min-height` (tallest Drilldown level) or `height` (current Drilldown level, with `autoHeight`) from one ResizeObserver.
- `li[nfsDrilldownBack]` on a consumer-written `li.js-drilldown-back` holding a `<button type="button">` replaces the generated back item: a click closes the level it sits in, and focus returns to the button that opened it. It is `hidden` whenever the menu is not in drilldown mode, so one markup serves a ResponsiveMenu.

Every item uses the Nested menu utility's `li[nfsMenuItem]`, `ul[nfsSubmenu]`, and `button[nfsSubmenuToggle]`: a parent is a button with `aria-expanded` and `aria-controls`, a parent that also navigates is a Hybrid item (its link plus a separate toggle), closed submenus are `inert`, hidden ancestor levels use Foundation's `invisible`, and no menu or tree role is emitted. Opening a level moves focus to its first control, going back returns focus to the parent button, and once a slide ends the focused control is scrolled into view if it is outside the viewport. The level slide is Foundation's own `$drilldown-transition`, awaited through `transitionend`, and 1 ms under reduced motion. The server HTML is the root level with every class and ARIA attribute already in place; only the wrapper's height arrives after hydration.

## User Stories

1. As an application developer, I want to keep Foundation's nested `ul.menu` markup and add attribute directives to it, so that my drilldown looks exactly as Foundation's docs show.
2. As an application developer, I want to write the wrapper element myself with `nfsDrilldownWrapper`, so that the server HTML contains every element the user sees.
3. As an application developer, I want to write each back item myself as `li.js-drilldown-back` with a button, so that I choose its text and its position in the level without an HTML-string Option.
4. As an application developer, I want the back item first or last in a submenu, as Foundation's `backButtonPosition` allowed, so that the markup order is the switch.
5. As an application developer, I want a parent item to be a button that opens its level, so that it is announced and operated as a control.
6. As an application developer, I want a parent that also leads to a landing page to be a Hybrid item, a link plus a toggle, so that section landing pages stay reachable without Foundation's `href` stripping or `parentLink` clones.
7. As an application developer, I want the tallest Drilldown level to set the wrapper's height by default, so that the menu does not change height as the user moves between levels (Foundation's documented behaviour).
8. As an application developer, I want `autoHeight` to size the wrapper to the current Drilldown level instead, and `animateHeight` to animate that change with Foundation's own `animate-height` transition, so that short levels do not leave empty space.
9. As an application developer, I want the measured height to follow content changes, text zoom, and font loading, so that the menu never clips or leaves gaps after the first render.
10. As an application developer, I want `closeOnClick` to return the menu to its root level when the user presses outside it, without swallowing that press, so that a click on a link elsewhere on the page still works.
11. As an application developer, I want `scrollTop`, `scrollTopElement`, and `scrollTopOffset` to scroll the page to the menu's top on every level change, so that long menus start each level at its top.
12. As an application developer, I want `opened` and `closed` outputs carrying the item once its level has finished sliding, so that I can react after the change is visible.
13. As an application developer, I want each item's `expanded` model and `open()`, `close()`, and `toggle()`, from the Nested menu utility, so that I can drive single levels from code.
14. As an application developer, I want `openPath(item)` to show the level that holds any item, opening every ancestor on the way, so that I can reveal the current page's section from route data in one call.
15. As an application developer, I want `collapseAll()` to return the menu to the root level, so that I can reset it after navigation.
16. As an application developer, I want a static `is-active` on a submenu (and on each ancestor submenu) to open that level at first paint, as Foundation documents, so that the current section shows when the page loads.
17. As an application developer, I want application-wide defaults for the Options through a Defaults token, so that I set them once.
18. As an application developer, I want development-mode warnings for a missing wrapper, a submenu without a back item, a nameless back button, `animateHeight` without `autoHeight`, a `scrollTopElement` selector that matches nothing, and an item expanded under a closed level, so that I catch markup mistakes early.
19. As a keyboard user, I want Enter, Space, or Right on a parent button to open its level and put focus on the level's first item, so that I can continue at once.
20. As a keyboard user, I want Left, Escape, or the back button to close the level and put focus back on the parent button, so that I never lose my place.
21. As a keyboard user, I want Down and Up to move within the current level, so that I can move quickly without leaving the menu.
22. As a keyboard user, I want Tab to reach only the controls of the level I see, and to leave the menu after the last one, so that hidden levels never swallow focus.
23. As a mouse user, I want a click on a parent to slide its level in and a click on the back button to slide it out, so that the menu works without a keyboard.
24. As a mouse user who opens a level far down a long menu, I want the page to bring the new level's first item into view, so that I do not have to scroll up to find it.
25. As a touch user, I want a scroll gesture that starts outside the menu never to reset it, so that `closeOnClick` does not fight scrolling.
26. As a screen reader user, I want native lists and buttons with `aria-expanded` and `aria-controls`, so that I hear the hierarchy and whether each section is open.
27. As a screen reader user, I want hidden levels out of the accessibility tree, so that I only read the level on screen.
28. As a screen reader user, I want the back button named after the level it returns to, so that "Back" is not ambiguous in a deep menu.
29. As a screen reader user, I want the current page's link marked with `aria-current="page"`, so that I know where I am.
30. As a user who prefers reduced motion, I want levels and the height to change without animation, so that motion does not bother me.
31. As a low-vision user, I want every arrow, focus ring, and label to meet the WCAG 2.2 AA minimums with Foundation's defaults, and a compile error when a theme breaks the arrows' contrast or the target sizes, so that I can see and hit the menu's controls.
32. As a user of a 320 px wide screen or 400 percent zoom, I want the off-screen levels never to cause horizontal scrolling, so that the page reflows.
33. As a user of a responsive menu, I want the back items to disappear when the menu becomes an accordion or dropdown menu, and the wrapper to stop clipping, so that the other modes look as Foundation's do.
34. As a developer of a server-rendered application, I want the root level, its classes, `aria-expanded`, and `inert` in the server HTML, so that the first paint is the real menu and hydration changes nothing but the height.
35. As a developer of a server-rendered application, I want a tap on a parent or a back button before hydration to take effect once the page hydrates, so that early interaction is not lost.
36. As a developer using incremental hydration, I want to know that the wrapper, the root, and every level share one hydration boundary, so that I place `@defer` correctly.
37. As a developer using `@defer (hydrate never)` or serving users without JavaScript, I want to know that only the root level works, so that I give every section a reachable landing page through Hybrid items.
38. As a developer of a zoneless application, I want every state change to be a signal write, so that the menu needs no zone.
39. As a developer who themes the menu, I want every library rule to reuse my Foundation drilldown settings, so that my paddings, colours, arrows, and transition apply.
40. As a library maintainer, I want the classes, heights, keys, focus moves, server HTML, and replay asserted at the layer that owns each, under story ids `drilldown-menu--<story>`, so that a regression shows where it happens.

## Implementation Decisions

### Foundation contract

From Foundation 6.9's Drilldown plugin, its Sass, its docs page, and the Foundation plugin inventory B, section 2; the option list is Foundation's own `Drilldown.defaults`, not the ticket's wording.

Markup: `ul.vertical.menu.drilldown[data-drilldown]` with nested `ul.menu.vertical.nested` lists placed next to a parent `<a>`; the plugin wraps the root in `div.is-drilldown` unless the parent already has that class, and prepends a `li.js-drilldown-back > a` to every submenu that has none.

Options (`Drilldown.defaults`), each mapped or dropped:

| Option | Type | Foundation default | Library |
| --- | --- | --- | --- |
| `autoApplyClass` | boolean | `true` | Dropped option: `NfsDrilldown` always binds `drilldown` while the menu is in drilldown mode, because Foundation's drilldown CSS needs it and a ResponsiveMenu must remove it in the other modes |
| `backButton` | string (HTML) | `'<li class="js-drilldown-back"><a tabindex="0">Back</a></li>'` | Dropped option (HTML string, building-blocks 1.4): the consumer writes `li.js-drilldown-back[nfsDrilldownBack] > button` |
| `backButtonPosition` | `'top'` or `'bottom'` | `'top'` | Dropped option: the back item's place in the markup is the switch (first child is `'top'`, last child is `'bottom'`); the focus rule skips it in either place |
| `wrapper` | string (HTML) | `'<div></div>'` | Dropped option (HTML string): the consumer writes the element and puts `nfsDrilldownWrapper` on it |
| `parentLink` | boolean | `false` | Dropped option (building-blocks 1.4): a Hybrid item keeps the parent's link beside its toggle; a consumer who wants the link inside the level writes it there as an ordinary item |
| `closeOnClick` | boolean | `false` | `closeOnClick` input, same default: a pointer press outside the wrapper returns to the root level; the press is never cancelled |
| `autoHeight` | boolean | `false` | `autoHeight` input, same default: passed to the utility's drilldown slot (no `drilldown-submenu-cover-previous`) and makes the wrapper's height follow the current Drilldown level |
| `animateHeight` | boolean | `false` | `animateHeight` input, same default: binds Foundation's `animate-height` on the wrapper, whose `transition: height 0.5s` animates the `autoHeight` height |
| `scrollTop` | boolean | `false` | `scrollTop` input, same default: scrolls the document on every level change |
| `scrollTopElement` | string (jQuery selector) | `''` | `scrollTopElement` input, `Element \| string \| null`, default `null`: an element reference or a CSS selector; `null` or `''` means the root list |
| `scrollTopOffset` | number | `0` | `scrollTopOffset` input, same default and formula |
| `animationDuration` | number (ms) | `500` | Dropped option: the duration of `scrollTop`'s jQuery scroll animation (not of the level slide); the browser's smooth scrolling owns it (building-blocks 1.4 timing options) |
| `animationEasing` | `'swing'` or `'linear'` | `'swing'` | Dropped option: the easing of the same scroll animation; the browser owns it |

Events: `open.zf.drilldown` (on the root with the parent `li`, synchronously when a level starts opening), `hide.zf.drilldown` (on the submenu, bubbling, when a level starts closing), `close.zf.drilldown` and `closed.zf.drilldown` (on the root, at the start and the end of `_hideAll()`), `scrollme.zf.drilldown` (after the `scrollTop` animation), `init`/`destroyed` from the base class. Mapping (building-blocks 1.4): `open` becomes the aggregate `opened` output with the item, emitted after the slide; `hide`, `close`, and `closed` become the aggregate `closed` output with the item, once per level that closed, after its slide; the item's own `expandedChange` covers request time; `scrollme` has no counterpart (no library scroll timing, and `scrollend` is outside the Browser target); `init`/`destroyed` have none (Angular lifecycle).

Methods: only `destroy()` is public; the docs and tests use `_show($li)`, `_hide($ul)`, `_hideAll()`, `_showMenu($ul, autoFocus)`, `_back($ul)`, `_resize()`, `_getMaxDims()`. The library keeps `open()`/`close()`/`toggle()` on each item (utility), `collapseAll()` for `_hideAll()`, and `openPath(item, {focus})` for `_showMenu()`; `_back` is the back directive, `_resize`/`_getMaxDims` are the wrapper's ResizeObserver; `destroy()` is Angular's.

Keyboard: `Keyboard.register('Drilldown', ...)` maps Enter and Space to `open`, Right to `next`, Left to `previous`, Up and Down to sibling moves, Escape to `close`, bound on every link and back link; the utility's drilldown key table replaces it.

Dropped behaviours, each with its reason under Further Notes: the generated wrapper and back items, `href` removal and `tabindex="0"` on parent links, `parentLink` clones, `aria-multiselectable`, `role="group"`, `aria-hidden`, `aria-expanded` on the `li`, the inline `max-width` freeze, the `data-mutate` re-measure protocol, `preventDefault()` on outside clicks, the jQuery scroll animation, the `transitionend` plus `setTimeout` focus sequencing, and `_menuLinkEvents` (dead code in 6.9: never called).

### CSS class to Angular mapping

| Foundation markup or class | Angular | Rationale |
| --- | --- | --- |
| Root `ul` with `data-drilldown` | `NfsDrilldown`, selector `ul[nfsDrilldown]`, `exportAs: 'nfsDrilldown'` | The plugin's root; class named after the Plugin (`Drilldown`), not the docs title "Drilldown Menu" (building-blocks 1.3) |
| `drilldown` on the root | Host class binding on `NfsDrilldown` while in drilldown mode | Foundation's drilldown CSS keys on it; replaces `autoApplyClass` |
| `invisible` on the root | Host class binding while a top-level item is expanded in drilldown mode (`hasOpenItem`) | Foundation's hidden ancestor level (utility, D9) |
| Generated `div.is-drilldown` | `NfsDrilldownWrapper`, selector `[nfsDrilldownWrapper]`, `exportAs: 'nfsDrilldownWrapper'`, on the consumer's element (usually a `div`, or the `nav` itself) | One plain consumer-written element with a directive (ADR 0001); named after Foundation's `wrapper` Option because `is-drilldown` reads as a State class |
| `is-drilldown`, `animate-height` on the wrapper | Host class bindings while in drilldown mode | Foundation's classes: `position: relative; overflow: hidden` and `transition: height 0.5s` |
| Inline `min-height` / `height` on the wrapper | Host style bindings from the measured Drilldown level heights | Foundation's own inline mechanism; no custom property |
| Generated `li.js-drilldown-back > a` | `NfsDrilldownBack`, selector `li[nfsDrilldownBack]`, `exportAs: 'nfsDrilldownBack'`, on the consumer's `li` holding a `<button type="button">` | One consumer-written element with a directive (ADR 0001); a native button (building-blocks 1.10) |
| `js-drilldown-back` | Static host class on `NfsDrilldownBack` | Foundation's required class for the back item's styles; the utility's focus rule skips controls inside it |
| Every `li`, nested `ul`, parent control | The Nested menu utility's `li[nfsMenuItem]`, `ul[nfsSubmenu]`, `button[nfsSubmenuToggle]` (with `hybrid` for a Hybrid item) | Shared utility; it emits `is-drilldown-submenu-parent`, `is-submenu-item`, `is-drilldown-submenu-item`, `has-submenu-toggle`, `submenu`, `is-drilldown-submenu`, `is-active`, `visible`, `invisible`, `is-closing`, `drilldown-submenu-cover-previous`, `data-nfs-expanded`, `data-nfs-shown` |
| `is-submenu-parent-item` (on `parentLink` clones) | None | No clones; Foundation's Sass has no rule for it |

### Hierarchy and DI shape

```
ngx-foundation-sites/drilldown-menu  (secondary entry point)
  nfsDrilldownDefaultsToken : InjectionToken<NfsDrilldownDefaults>    Shape B, optional
  [nfsDrilldownWrapper]  NfsDrilldownWrapper       consumer's element, parent of the root
    ul[nfsDrilldown]     NfsDrilldown
        providers: nfsMenuRootProviders('drilldown')                   (Nested menu utility)
        inject(nfsMenuModeToken, {self: true})                          the NfsMenuRoot
        inject(NfsDrilldownWrapper, {optional: true, skipSelf: true})   registers with it
      li[nfsMenuItem] > button[nfsSubmenuToggle] + ul[nfsSubmenu]      (utility)
        li[nfsDrilldownBack] > button   inject(NfsDrilldown, {optional: true}),
                                        inject(NfsSubmenu, {optional: true}); registers with the root
        li[nfsMenuItem] > a[href]
  uses: nfsMenuModeToken, nfsMenuRootProviders, nfsMenuBehaviourDefaults, NfsMenuItem, NfsSubmenu
        (Nested menu); NfsMediaQuery.reducedMotion (Breakpoint service); nfsAnimationsToken
        (the wrapper's animate-height); DOCUMENT, NgZone,
        Renderer2, DestroyRef, afterNextRender, afterRenderEffect

consumer (other spec):
  ul[nfsResponsiveMenu]  hostDirectives include NfsDrilldown; drives the Menu mode
```

- `NfsDrilldown` follows the Nested menu spec's consumer table exactly: `providers: [nfsMenuRootProviders('drilldown')]`, `root.configure('drilldown', {autoHeight, opened, closed})` in its constructor, `[class.drilldown]` and `[class.invisible]` from `root.mode()` and `root.hasOpenItem()`, and `(keydown)` forwarded to `root.handleKeydown($event, 'drilldown')`. Under a ResponsiveMenu it is a host directive whose provider loses to ResponsiveMenu's, so it reads the shared `NfsMenuRoot` and idles whenever `root.mode()` is not `'drilldown'`.
- Wrapper to root: the root registers itself with the nearest `NfsDrilldownWrapper` at construction (`skipSelf`, optional); the wrapper accepts only a root whose element is its own child element (Foundation's rule: the wrapper is the root's parent), and warns in development mode otherwise, which also stops a nested root without its own wrapper from taking the outer one. Registration at construction, before host bindings run, puts `is-drilldown` in the server HTML.
- Back to root and level: `NfsDrilldownBack` injects the nearest `NfsSubmenu` (its level; `null` at the root level, because every root re-provides it as `null`) and the nearest `NfsDrilldown` (present on a ResponsiveMenu root too, as a host directive), both optional, and registers with the root, which uses the registry only for development checks.
- Tokens: `nfsDrilldownDefaultsToken = new InjectionToken<NfsDrilldownDefaults>('nfsDrilldownDefaultsToken')`, read with `inject(token, {optional: true})` to seed input defaults, nearest provider wins (building-blocks 1.4). No parent token of its own: the wrapper and the back item inject the classes of the same entry point, and nothing outside it needs a lightweight handle. The Nested menu token carries the root handle.
- Not an Openable: neither the root nor an item provides `nfsOpenableToken` (Nested menu D22), so a bare `nfsClose` on a link inside a drilldown inside an off-canvas panel closes the panel.

### API

Types:

```ts
interface NfsDrilldownDefaults {
  autoHeight?: boolean;       // Foundation false
  animateHeight?: boolean;    // Foundation false
  closeOnClick?: boolean;     // Foundation false
  scrollTop?: boolean;        // Foundation false
  scrollTopOffset?: number;   // Foundation 0
}

interface NfsDrilldownOpenPathOptions {
  focus?: boolean;            // Foundation's autoFocus argument; default false
}
```

#### `NfsDrilldown` (`ul[nfsDrilldown]`, `exportAs: 'nfsDrilldown'`)

| Member | Kind | Type and default | Foundation | Behaviour and deltas |
| --- | --- | --- | --- | --- |
| `autoHeight` | input | `boolean` (`booleanAttribute`), default from the Defaults token, else `nfsMenuBehaviourDefaults.drilldown.autoHeight` (`false`) | `data-auto-height`, `false` | Passed to the utility's drilldown slot (submenus drop `drilldown-submenu-cover-previous`); the wrapper binds `height` to the current Drilldown level instead of `min-height` to the tallest |
| `animateHeight` | input | `boolean`, default `false` | `data-animate-height`, `false` | Binds `animate-height` on the wrapper; Foundation's CSS animates `height`, so it has an effect only with `autoHeight` (development warning otherwise, as in Foundation) |
| `closeOnClick` | input | `boolean`, default `false` | `data-close-on-click`, `false` | While a level is open, a pointer press whose `pointerdown` and `pointerup` both land outside the wrapper (or the root, when no wrapper is registered) calls `collapseAll()`; no `preventDefault()`. Under a ResponsiveMenu the same binding also reaches DropdownMenu, each with its own default (Nested menu spec) |
| `scrollTop` | input | `boolean`, default `false` | `data-scroll-top`, `false` | On every change of `currentLevel` after the first render, scrolls the document to the target's document top plus `scrollTopOffset` (Foundation's formula), so with an offset of 0 the target's top lands at the viewport's top: `behavior: 'smooth'`, or `'instant'` while `NfsMediaQuery.reducedMotion()` is `true`. It records the current level anew whenever drilldown mode becomes live and acts only while drilldown is the live mode, so a change of `currentLevel` that comes from a Menu mode swap, into drilldown with a level open or out of it, records the new value and does not scroll the page (Foundation's Drilldown scrolled on level changes, never on init) |
| `scrollTopElement` | input | `Element \| string \| null`, default `null` | `data-scroll-top-element`, `''` | The element whose top is the scroll target: an element reference, or a CSS selector resolved from `DOCUMENT` at scroll time; `null` or `''` means the root list. A selector that matches nothing falls back to the root and warns in development mode |
| `scrollTopOffset` | input | `number` (`numberAttribute`), default `0` | `data-scroll-top-offset`, `0` | Added to the target's document top, as in Foundation (a negative value leaves room for a fixed header) |
| `opened` | output | `NfsMenuItem` | `open.zf.drilldown` | Aggregate Completion output: the item whose level finished sliding in; only while in drilldown mode (the utility calls the live mode's completion function only) |
| `closed` | output | `NfsMenuItem` | `hide`, `close`, `closed.zf.drilldown` | Aggregate Completion output: the item whose level finished sliding out, once per level, `collapseAll()` included |
| `currentLevel` | read-only | `Signal<NfsSubmenu \| null>` | `$currentMenu` | The innermost open submenu of the Open path; `null` for the root level or outside drilldown mode |
| `openPath(item, options?)` | method | `(item: NfsMenuItem \| null, options?: NfsDrilldownOpenPathOptions) => void` | `_showMenu($ul, autoFocus)` | Shows the Drilldown level that holds `item`: a parent item's own submenu, or, for a leaf, the level it sits in. The utility's `open()` does not open closed ancestors, so this method finds the Open path from the root to `item` through `items()` and `submenu()`, calls `open()` on each item of it from the root down (which closes open siblings), then closes any open child of the target level. `null` is `collapseAll()`. With `focus: true`, focus moves to the target level's first control that is not inside the back item, in the next render. Only in drilldown mode; otherwise, or for an item of another root, nothing happens and a development warning fires |
| `collapseAll()` | method | `() => void` | `_hideAll()` | `root.collapseAll()`: every level closes; focus inside a closing level moves to the top-level toggle that contained it (utility) |

The item-level API (`expanded` model, `opened`/`closed` void outputs, `open()`, `close()`, `toggle()`) is the Nested menu utility's `NfsMenuItem`, unchanged.

Host: `[class.drilldown]`, `[class.invisible]`, `(keydown)` as in the hierarchy. The root emits no `role`, `aria-*`, `data-mutate`, or inline style.

State model, all signals:

- `#live`: `computed`, `root.mode() === 'drilldown'`.
- `currentLevel`: `computed`: `null` unless `#live`; else it walks from `root.items()` to the expanded item that has a submenu, then that submenu's `items()`, and so on, and returns the last submenu found. A closing level is no longer expanded, so `currentLevel` is already its parent while it slides out, which is when Foundation moved the `autoHeight` height.
- `#backs`: the registered back items with their levels, for development checks only.
- No `effect` propagates state; the Options are read where they act.

Completion functions passed to `configure()`: `opened(item)` emits `opened` and runs the reveal step; `closed(item)` emits `closed` and runs the reveal step. The reveal step runs in these client-only callbacks, after the slide has ended (the utility's `transitionend` or fallback timer): when `document.activeElement` is inside the root, it calls `activeElement.scrollIntoView({block: 'nearest', inline: 'nearest', behavior})` with the same `behavior` rule as `scrollTop`. `scrollIntoView` with `nearest` does nothing when the control is already in view (it honours the scroller's `scroll-padding`), and it cannot scroll the wrapper, because `overflow: clip` makes the wrapper no scroll container (Sass rule 5); the level has finished moving, so nothing horizontal is left to reveal. This covers the control the utility focused with `preventScroll: true`.

#### `NfsDrilldownWrapper` (`[nfsDrilldownWrapper]`, `exportAs: 'nfsDrilldownWrapper'`)

No inputs, outputs, or public methods. Registration from its root is internal to the entry point.

Host, all from signals and all `null` or `false` until a root is registered and while the root's mode is not `'drilldown'`:

| Binding | Value |
| --- | --- |
| `[class.is-drilldown]` | The root is in drilldown mode |
| `[class.animate-height]` | In drilldown mode, the root's `animateHeight()`, and `nfsAnimationsToken.disabled` not set |
| `[style.min-height.px]` | In drilldown mode without `autoHeight`: the largest measured block size among the root list and every submenu (Foundation's `_getMaxDims`) |
| `[style.height.px]` | In drilldown mode with `autoHeight`: the measured block size of `currentLevel`'s element, or of the root list when it is `null` |

Measurement: one `ResizeObserver`, created lazily and outside the Angular zone in the first run of an `afterRenderEffect` whose `write` phase tracks the root's mode and its set of Drilldown levels (the root list plus every submenu reached through `items()` and `submenu()`), observes new levels and unobserves removed ones, and disconnects outside drilldown mode and on destroy. Its callback stores each level's `borderBoxSize` block size in a `#heights` signal; the host style bindings read it, so the zoneless (or hybrid) scheduler applies the new height in the next render. `ResizeObserver` delivers a first observation for every observed element, so no separate first measurement exists; it reports a level's layout size, which `transform` does not change, so a sliding level measures correctly; and the wrapper it writes is never observed, so no resize loop can form. It replaces Foundation's `data-mutate` MutationObserver protocol: content changes, text zoom, text-spacing overrides, and web-font loading all change a level's size and re-measure. The inline `max-width` Foundation froze is not written: it pinned the wrapper to the root's width at initialisation and broke fluid layouts, and `overflow: clip` already confines the off-screen levels.

The submenu elements come from `NfsSubmenu.element`, the Nested menu utility's read-only member for the submenu's host.

#### `NfsDrilldownBack` (`li[nfsDrilldownBack]`, `exportAs: 'nfsDrilldownBack'`)

No inputs, outputs, or public methods.

Host: static `class="js-drilldown-back"`; `[attr.hidden]` and `[class.is-hidden]` while there is no `NfsDrilldown` or its mode is not `'drilldown'` (Foundation's `.is-hidden` because later `.menu li` display rules beat normalize's `[hidden]`, building-blocks 1.10); `(click)`: in drilldown mode, calls `close()` on its level's owning item (`submenu.item`). The handler never calls `preventDefault()`. Focus then moves to that item's toggle through the utility's focus-loss guard, because focus was on a control inside the closing level; a keyboard press on the button is a native `click`, so this is the key table's "Back button: same as Left".

The consumer writes the button inside: `<button type="button">Back<span class="show-for-sr"> to Products</span></button>`, visible text "Back" as Foundation, plus a visually hidden suffix naming the level it returns to (Foundation's `show-for-sr`), so the name starts with the visible label (2.5.3) and describes its purpose (2.4.6). No `aria-expanded` or `aria-controls`: the back button closes a level, it is not a disclosure; the parent toggle carries the state.

Development-mode checks (all directives, once per instance, in `afterNextRender` or a `read`-phase `afterRenderEffect` that exists only when `ngDevMode` is on and never on the server):

1. A drilldown root without a registered wrapper, or a wrapper that is not the root's parent element.
2. A submenu in drilldown mode without a back item. Foundation generated one in every submenu; without it a pointer user cannot leave the level, because the parent toggle is hidden.
3. A back item without a `button` child, with a button that has no accessible name, outside any submenu, or outside a drilldown root.
4. `animateHeight` without `autoHeight`.
5. A `scrollTopElement` selector that matches nothing (at scroll time).
6. In drilldown mode, an item that is expanded while an ancestor item is not (a level shown under a closed level); the warning names `openPath()`.

Checks 1 to 3 run from the first render in which drilldown is the live mode, so a responsive root that has not reached a drilldown width, or whose rules do not name drilldown, does not warn about a wrapper or back items it does not use.

### Implementation level and primitives

Implementation level: custom Angular directives over the Nested menu utility (ADR 0004), on native platform mechanisms. The native part does most of the work: Foundation's drilldown CSS (the `.is-drilldown-submenu` transform transition, `invisible`/`visible`, `animate-height`), `inert`, `transitionend`, `ResizeObserver`, `overflow: clip`, `window.scrollTo` and `scrollIntoView` with `behavior`, and Pointer Events. `@angular/aria` has no pattern for stacked levels: `ngTree` and `ngMenu` apply the `tree` and `menu` roles the APG rejects for site navigation, and need `ng-template` groups and `[parent]` inputs that break Foundation's nested `ul` markup (ADR 0004). `@angular/cdk` has `CdkMenu` (the same roles) and nothing for disclosure navigation; the drilldown pieces use no CDK directly (the utility uses `Directionality`, `_IdGenerator`, `hasModifierKey`). View Transitions, `CloseWatcher`, and `:has()` are outside the Browser target and appear only under Further Notes.

Primitives: host bindings on signals; `input()`, `output()`, `computed()`; `ResizeObserver` with `borderBoxSize`; document `pointerdown`/`pointerup`/`pointercancel` listeners through `Renderer2.listen`; `getBoundingClientRect` and `window.scrollY` for the `scrollTop` target; `window.scrollTo(ScrollToOptions)`; `Element.scrollIntoView(ScrollIntoViewOptions)`; `NgZone.runOutsideAngular`; `NfsMediaQuery.reducedMotion()`. All are Baseline widely available on 2026-05-07 (`ResizeObserver` since 2023-01-28; `overflow: clip` Chrome 90, Firefox 81, Safari 16; `scrollIntoView` and `scroll-behavior` options since 2024-09-14; `inert` in Chrome 102, Firefox 112, Safari 15.5, inside the core browser set).

Fallback: none needed. The [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) carried the drilldown mode, its wrapper `min-height` (afterRenderEffect plus ResizeObserver), its back item, and its focus handoff in three engines; the Options it did not run (`autoHeight`, `animateHeight`, `scrollTop`, `closeOnClick`, a bottom back item) are Foundation CSS or single platform calls with e2e cases below.

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Root, wrapper, and back classes; `hidden`; wrapper `min-height`/`height` | Host bindings from `computed` and signals | First-paint state in server HTML (1.11 decision 1); the heights are `null` on the server |
| `configure()`, wrapper registration, back registration, input seeding from the Defaults token | Constructor | Needed before the first render and before replay; reads no DOM |
| Level heights | `ResizeObserver` created in the first run of an `afterRenderEffect` (`write` observes and unobserves as levels appear, disappear, or the mode changes) | Measurement only after render; the observer's callback writes a signal |
| `closeOnClick` listeners | `afterRenderEffect` (`write`) adding the three document listeners outside the zone while drilldown mode, `closeOnClick()`, and `hasOpenItem()` are all true; its cleanup removes them | Exist only while a level is open; not replayed, which is correct (1.11 decision 5) |
| `scrollTop` | `afterRenderEffect` keyed on `currentLevel` that records its first value, records it anew whenever drilldown mode becomes live, and acts only on later changes while drilldown is live: `earlyRead` measures the target's document top, `write` calls `window.scrollTo` | Layout read then scroll; never on the server, at the first render, or at a swap into or out of drilldown |
| Reveal step after a slide | The utility's completion callback (`transitionend` handler or fallback timer), a client-only event | Runs after the level stopped moving; reads `document.activeElement` and scrolls |
| `openPath(..., {focus: true})` focus | `afterNextRender` with the root's injector (`earlyRead` picks the first control of `currentLevel`, `write` focuses with `preventScroll: true`) | `inert` leaves the level only in the render after the state change (prototype harness race) |
| Level focus handoff, back and Escape refocus, focus-loss guard, completion, `is-closing` | The Nested menu utility (`afterNextRender`, `afterRenderEffect`) | Its spec |
| Development checks | `afterNextRender` and a `read`-phase `afterRenderEffect`, only when `ngDevMode`; checks 1 to 3 wait for the first render in which drilldown is the live mode | Read the DOM and computed style |
| `effect` | Not used | No non-DOM side effect exists |
| `afterEveryRender` | Not used | Every piece reacts to its own signals; per-render work would run on every change detection in the application |

`injectAsync`: not applicable. Nothing is loaded only after a client interaction: a replayed toggle or back click must find its handler at once, the observer is a platform object, and the whole plugin is already its own entry point, which a consumer's `@defer` splits.

### Comparison with Angular Material, CDK, and Aria

Material has no drilldown. The nearest counterparts are `MatMenu` with nested `[matMenuTriggerFor]` (cascading overlay panes shown side by side), `MatTree` and Aria's `ngTree` (levels expanded in place), and CDK's `CdkMenu`.

| Concern | `MatMenu` / `CdkMenu` / `ngMenu` | `MatTree` / `ngTree` | Drilldown |
| --- | --- | --- | --- |
| Pattern and roles | Menu (`menu`, `menuitem`) | Tree (`tree`, `treeitem`, `group`) | Disclosure navigation per level: native lists, buttons with `aria-expanded`/`aria-controls`, links, no roles |
| Where a level lives | An overlay pane beside its parent; parents stay visible | In place, under its parent; ancestors stay visible | In place, sliding over its parent level, which becomes `invisible` |
| Focus | Roving `tabindex`, typeahead, one tab stop | Roving `tabindex` or active descendant, typeahead, Home/End | Every visible control in the tab sequence; focus moves into a level on open and back to its toggle on close |
| Going back | Left or Escape closes the submenu | Left moves to the parent node | A back button, Left, or Escape |
| Container methods | `closeMenu()` | `expandAll()`/`collapseAll()` | `collapseAll()`, `openPath(item)` |
| Events | `menuOpened`, `menuClosed` | `expandedChange` per node | Item `expandedChange`; aggregate `opened`/`closed` Completion outputs with the item |
| Height | Each pane sizes itself | Grows with expanded nodes | The wrapper holds the tallest level (`min-height`) or follows the current level (`autoHeight`) |

Borrowed: the `opened`/`closed` Completion output names and the `exportAs` shape (building-blocks 1.3, 1.4); Aria's `collapseAll()` name. Not borrowed: roles, roving `tabindex`, typeahead, overlays, template-created levels. Why the tree pattern does not fit even with its roles set aside: a tree keeps every ancestor on screen and moves focus among visible nodes of all levels, while a drilldown hides the ancestor levels, so the tree's Left (to parent), Home/End, and typeahead would all target nodes the user cannot see; and the APG warns that the `tree` role for navigation promises functionality typical site navigation does not need.

### ARIA and keyboard

Pattern: the APG Disclosure Navigation Menu, applied per Drilldown level inside one navigation landmark, with a back control and a focus handoff on open and back (research: APG patterns, Drilldown option 1, corrected so hidden ancestor levels use Foundation's `invisible` rather than `hidden`, because the open level is their descendant). The APG has no drilldown pattern; the menu-and-menubar alternative is out of scope (map). The consumer wraps the menu in `nav` with `aria-label` or `aria-labelledby` naming the site's navigation (never "navigation").

| Element | Semantics | Rendered by |
| --- | --- | --- |
| `nav` | `navigation` landmark, named | Consumer |
| Wrapper | Generic element, no role | Consumer element; `NfsDrilldownWrapper` adds classes and height only |
| Root and submenu `ul`, every `li` (back item included) | Native `list` and `listitem`; no `role`, no `aria-*` | Consumer markup; utility adds no roles |
| Parent toggle | Native `button`, `type="button"`, `aria-expanded`, `aria-controls` = the submenu id, name from its text | Utility |
| Hybrid item | `a[href]` (navigates) followed by the toggle named by its `.submenu-toggle-text` span | Consumer markup, utility toggle |
| Back button | Native `button`, `type="button"`, name "Back" plus a visually hidden suffix naming the level it returns to; no `aria-expanded` | Consumer markup, `NfsDrilldownBack` behaviour |
| Current page | `aria-current="page"` on the link (Router: `routerLinkActive` plus `ariaCurrentWhenActive="page"`) | Consumer |
| Closed submenu | `inert` plus Foundation's `invisible` | Utility |
| Hidden ancestor level (root included) | Foundation's `invisible` (`visibility: hidden`: out of the tab order and the accessibility tree); never `inert` | Utility and `NfsDrilldown` |

Keyboard (the utility's drilldown table, with the back button; handlers change state, move focus, stop propagation, and call `preventDefault()` last; modifier keys are not handled):

| Key or action | Behaviour |
| --- | --- |
| Tab, Shift+Tab | Native, through the controls of the current Drilldown level; hidden levels are skipped, and Tab after the level's last control leaves the menu |
| Enter, Space, or a click on a parent toggle | Opens its level; focus moves to the level's first control that is not inside the back item, with `preventScroll` |
| Right on a parent toggle | Same as activating it |
| Enter, Space, or a click on the back button | Closes the level; focus moves to the toggle that opened it |
| Left, or Escape, inside a level below the root | Same as the back button |
| Escape on the root level | Not handled, so it propagates to an enclosing widget |
| Down, Up | Next or previous control in the current level |
| Enter on a link | Native navigation |
| Home, End, typeahead | Not handled (Foundation never had them; APG optional) |

Focus rules beyond the table: a programmatic open or close never takes focus from outside the menu (utility); `openPath(..., {focus: true})` focuses the target level's first control; `collapseAll()` moves focus only if it was inside a closing level; a `closeOnClick` reset moves nothing (focus is already outside); after every slide the focused control inside the root is scrolled into view (reveal step).

### WCAG 2.2 AA

| Criterion | Requirement and how it is met | Checked by |
| --- | --- | --- |
| 1.3.1 Info and Relationships | Native nested lists convey the hierarchy; each toggle's `aria-controls` names its level | Story Accessibility gate; SSR smoke |
| 1.3.2 Meaningful Sequence | DOM order is visual order within a level; hidden levels are out of the reading order (`invisible`, `inert`) | Story play; e2e Tab sweep |
| 1.4.3 Contrast (Minimum) | Links and parent and back buttons use `$anchor-color` on `$drilldown-background` (4.65:1 with Foundation's defaults, `$primary-color` on `$white`); no library rule adds a new text colour pair | Story Accessibility gate (`color-contrast`) |
| 1.4.4 Resize Text, 1.4.12 Text Spacing | The wrapper's `min-height` or `height` is re-measured by the ResizeObserver whenever a level's size changes, so enlarged text or spacing is never clipped by a stale height | Browser-level test; e2e with a text-spacing override |
| 1.4.10 Reflow | At 320 CSS px the vertical menu fills its width; off-screen levels sit inside the clipping wrapper (`overflow: clip`) and add no scrollable overflow, so the page never scrolls horizontally | e2e at 320 px |
| 1.4.11 Non-text Contrast | Every drilldown arrow (parent, back, and the `.align-left`/`.align-right` twins) and the Hybrid item's toggle arrow must reach 3:1 against the background it sits on; with defaults `$primary-color` on white is 4.65:1. The `nfs-drilldown` mixin stops the compile with `@error` naming the setting when the unrounded WCAG ratio (from Foundation's `color-luminance()`; its `color-contrast()` rounds to one decimal and would pass 2.95:1) of `$drilldown-arrow-color` against `$drilldown-background` or `$drilldown-submenu-background` is below 3, likewise for `$dropdownmenu-arrow-color`, which Foundation uses for the aligned twins, and for `$accordionmenu-arrow-color`, the Hybrid toggle's arrow, against `$accordionmenu-submenu-toggle-background` when that is not `null`, else against `$body-background` and `$drilldown-submenu-background` | Node-level Sass compile test (axe has no 1.4.11 rule) |
| 1.4.13 Content on Hover or Focus | Not applicable: nothing appears on hover or focus; levels open only on activation | Story play asserts hover and focus change nothing |
| 2.1.1 Keyboard | Every level opens with Enter or Space on its toggle and closes with the back button, Left, or Escape; every link is reachable with Tab alone | Story play |
| 2.1.2 No Keyboard Trap | Tab always leaves the menu after the current level's last control | e2e |
| 2.4.3 Focus Order | Focus moves into a level when it opens and back to its toggle when it closes; hidden levels are out of the tab order | Story play; e2e |
| 2.4.6 Headings and Labels | Every back button's name describes where it goes ("Back to Products") through Foundation's `show-for-sr` suffix; a nameless back button warns in development mode | Browser-level test (warning); story Accessibility gate (`button-name`) |
| 2.4.7 Focus Visible | The user agent's ring on every control: the library removes no outline, and Foundation's `disable-mouse-outline` acts only under what-input's `[data-whatinput='mouse']`, which the library never sets. The wrapper must clip (the slide needs it), so the `nfs-drilldown` mixin draws focus rings inside the control box (`outline-offset: -2px` on `:focus-visible` links and buttons inside `.is-drilldown`), and no edge of a ring is clipped, `autoHeight` included | e2e screenshot of the first and last control of a level, with and without `autoHeight` |
| 2.4.11 Focus Not Obscured (Minimum) | Levels replace each other in place and overlay nothing outside the wrapper; after every slide the focused control is scrolled into view with `block: 'nearest'`, which honours the consumer's `scroll-padding` for sticky headers (the Sticky spec's convention); `scrollTopOffset` leaves room for a fixed header when `scrollTop` is on | e2e: in a scrolled long page, opening a level from far down leaves the focused control in the viewport (centre hit test) |
| 2.5.3 Label in Name | A back button's accessible name starts with its visible text "Back" | Story play (name assertion) |
| 2.5.8 Target Size (Minimum) | Links, parent buttons, and back buttons fill their row: 38 px high with Foundation's `$drilldown-padding` (`$global-menu-padding`); the Hybrid item's toggle is 40 by 40 px. The mixin stops the compile when `$accordionmenu-submenu-toggle-width` or `-height` is below 24 px, or when a row (`1rem` plus twice the vertical padding of `$drilldown-padding` or `$drilldown-submenu-padding`, through Foundation's `rem-calc()`) is below 24 px | Story Accessibility gate (`target-size`, turned on by the `wcag22aa` tag); Sass compile test |
| 3.2.1 On Focus | Focus never opens, closes, or navigates | Story play |
| 4.1.2 Name, Role, Value | Buttons with names from content, `aria-expanded` from state, no invalid or empty roles, no `aria-hidden` | Story Accessibility gate; browser-level test |

The story Accessibility gate runs with the six tags of ADR 0018 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) on every story, closed and with levels open, after the slides settle. No Foundation default fails a criterion here, so no Storybook settings override is needed.

### Rendered HTML

Consumer markup (standalone Drilldown; the `drilldown` class may also be written statically, as in Foundation's docs):

```html
<nav aria-label="Shop">
  <div nfsDrilldownWrapper>
    <ul class="vertical menu" nfsDrilldown #shop="nfsDrilldown">
      <li nfsMenuItem>
        <button nfsSubmenuToggle>Products</button>
        <ul class="menu vertical nested" nfsSubmenu>
          <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to Shop</span></button></li>
          <li nfsMenuItem><a href="/products/boards">Boards</a></li>
          <li nfsMenuItem>
            <button nfsSubmenuToggle>Wheels</button>
            <ul class="menu vertical nested" nfsSubmenu>
              <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to Products</span></button></li>
              <li nfsMenuItem><a href="/products/wheels/street">Street</a></li>
              <li nfsMenuItem><a href="/products/wheels/park">Park</a></li>
            </ul>
          </li>
        </ul>
      </li>
      <li nfsMenuItem>
        <a href="/services">Services</a>
        <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Services pages</span></button>
        <ul class="menu vertical nested" nfsSubmenu>
          <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to Shop</span></button></li>
          <li nfsMenuItem><a href="/services/repairs" aria-current="page">Repairs</a></li>
        </ul>
      </li>
      <li nfsMenuItem><a href="/about">About</a></li>
    </ul>
  </div>
</nav>
```

Server HTML (and prerendered HTML), abbreviated: directive attributes omitted, ids generated by the utility:

```html
<nav aria-label="Shop">
  <div class="is-drilldown">
    <ul class="vertical menu drilldown" jsaction="keydown:;">
      <li class="is-drilldown-submenu-parent">
        <button type="button" aria-expanded="false" aria-controls="nfs-submenu-a1-0" jsaction="click:;">Products</button>
        <ul id="nfs-submenu-a1-0" inert=""
            class="menu vertical nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">
          <li class="js-drilldown-back" jsaction="click:;"><button type="button">Back<span class="show-for-sr"> to Shop</span></button></li>
          <li class="is-submenu-item is-drilldown-submenu-item"><a href="/products/boards">Boards</a></li>
          <li class="is-submenu-item is-drilldown-submenu-item is-drilldown-submenu-parent">
            <button type="button" aria-expanded="false" aria-controls="nfs-submenu-a1-1" jsaction="click:;">Wheels</button>
            <ul id="nfs-submenu-a1-1" inert="" class="menu vertical nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">...</ul>
          </li>
        </ul>
      </li>
      <li class="is-drilldown-submenu-parent has-submenu-toggle">
        <a href="/services">Services</a>
        <button type="button" class="submenu-toggle" aria-expanded="false" aria-controls="nfs-submenu-a1-2" jsaction="click:;">
          <span class="submenu-toggle-text">Services pages</span></button>
        <ul id="nfs-submenu-a1-2" inert="" class="menu vertical nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">...</ul>
      </li>
      <li><a href="/about">About</a></li>
    </ul>
  </div>
</nav>
```

No inline style: the wrapper's `min-height` is measured after hydration, so on a first paint the wrapper is as tall as the root level (the closed levels are absolutely positioned and clipped). `jsaction` lists the root's `keydown`, every toggle's `click`, and every back item's `click`; Angular removes it after hydration.

Hydrated, after the first measurement: the wrapper gains `style="min-height: 231px"` (the tallest level; the prototype's figures). Nothing else changes, so hydration sees the server's values.

After a click on Products: the root gains `invisible`; the Products `li` gains `data-nfs-expanded`; its button `aria-expanded="true"`; its submenu drops `inert` and `invisible` and gains `is-active visible`, then `data-nfs-shown` once the slide ends, when `opened` emits the Products item; focus is on Boards (the first control not inside the back item).

After Back: the Products submenu gains `is-closing` and `inert` (still `is-active visible`) until its `transform` transition ends, then drops `is-active visible is-closing` and gains `invisible`; the root drops `invisible` at once; focus is on the Products button; `closed` emits the Products item.

With `autoHeight` and `animateHeight`, at the root level: `<div class="is-drilldown animate-height" style="height: 117px">`, and the submenus carry no `drilldown-submenu-cover-previous`; opening Products changes it to `height: 230px`, animated by Foundation's `transition: height 0.5s`.

Open at first paint (a static `is-active` on the Products submenu): the server HTML already has the root `invisible`, the Products `li` `data-nfs-expanded`, its button `aria-expanded="true"`, and its submenu `is-active visible` with `data-nfs-shown` and no `inert`; no output fires for it.

Inside a ResponsiveMenu in dropdown mode (`drilldown medium-dropdown` at `medium`): the wrapper is a bare `<div>` with no class and no style; each back item is `<li class="js-drilldown-back is-hidden" hidden="">`; the root and items carry the dropdown classes (Nested menu spec).

### Animation

Per ADR 0003 and building-blocks 1.6 rule 1 (elements stay in the DOM; a State class plus CSS; completion after `transitionend`):

| What moves | How | Completion |
| --- | --- | --- |
| A Drilldown level sliding in or out | Foundation's own `$drilldown-transition` (`transform 0.15s linear`) on `.is-drilldown-submenu`, driven by the utility's `is-active` (slide in) and `is-closing` (slide out) | The utility: `transitionend` for `transform` on the submenu, or a fallback of the measured duration plus delay plus 100 ms; a measured zero completes at once, which fixes Foundation's hang when the setting is `none` |
| The wrapper's height with `autoHeight` and `animateHeight` | Foundation's `.is-drilldown.animate-height { transition: height 0.5s }` between two measured pixel heights | None awaited: no output or DOM step depends on it, as in Foundation |
| `scrollTop` and the reveal step | The browser's smooth scrolling (`behavior: 'smooth'`) | None awaited; `scrollend` is outside the Browser target, so `scrollme.zf.drilldown` has no counterpart |

- Reduced motion: the `nfs-drilldown` mixin sets `transition-duration: 1ms` on Foundation's level slide and on `.is-drilldown.animate-height` under `@media (prefers-reduced-motion: reduce)`, so completion still fires and heights change at once; scrolling uses `behavior: 'instant'` while `NfsMediaQuery.reducedMotion()` is `true`.
- Disabled animations (`nfsAnimationsToken.disabled`, what tests provide): the utility binds `transition: none` on the submenu and completes at once (the Nested menu spec's Animation subsection), and the wrapper does not bind `animate-height`, so no height transition runs either.
- No Motion class, no `animate.enter`/`animate.leave` (nothing is inserted or removed), no JavaScript-timed animation. Foundation's `animationDuration` and `animationEasing` timed the jQuery scroll, not the slide, and are Dropped options.
- At first render nothing animates: an open-at-first-paint level is already settled, and the first height measurement has no previous value to transition from except with `animateHeight`, where the wrapper's first `height` binding replaces the natural height (a 0.5 s settle after hydration that equals the first level's natural height, so nothing visibly moves at the root level).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the root level, every class, `aria-expanded`, `aria-controls`, `inert`, `invisible`, the wrapper's `is-drilldown` and `animate-height`, and the back items are host bindings or consumer markup, so the server HTML is the root level exactly as it paints (rule 1). Closed levels are hidden by Foundation's CSS. A level open at first paint renders open. Nothing is measured on the server (rule 3): the wrapper's `min-height` and `height` are `null` there and arrive after hydration, a small layout settle below the menu the first time a taller level exists, accepted and stated (building-blocks Table B). A consumer who knows the tallest level's height may give the wrapper a CSS `min-height`; the measured inline value then overrides it without moving anything.
- Before hydration: construction injects, registers, configures, and seeds inputs only; the observer, the document listeners, scrolling, and focus exist only in render callbacks and handlers (rules 3 to 5). No DOM structure is created (rule 4): the wrapper and the back items are consumer-written.
- ResponsiveMenu: the server renders the Server breakpoint's mode (ADR 0014). When that is drilldown and the client is at another breakpoint, the utility re-classes in the first render callback; the wrapper's and back items' bindings follow `root.mode()` in the same tick, so the drilldown classes, the `hidden` back items, and the (never written) heights change with no hydration mismatch. When the server mode is not drilldown and the client's is, the back items lose `hidden` and the wrapper gains `is-drilldown` and, one observation later, its `min-height`.
- Event replay: a toggle's `click` replays and opens the level; the focus handoff follows in the next render (utility); no `preventDefault()`. A back item's `click` replays (only possible when a level was open at first paint) and closes its level. A root `keydown` replays: state changes, focus moves in the following render, and the trailing `preventDefault()` throws, so Angular's `ErrorHandler` logs one error per replayed handled key, the accepted default of building-blocks Part 4, Decided item 3. Links navigate natively before hydration; no link carries `jsaction`. The `closeOnClick` listeners are document-level and exist only after hydration, so an outside press before hydration is not replayed, which matters only for a level open at first paint and is accepted.
- Hydration boundary: the wrapper, the root, every item, submenu, and back item share one boundary (rule 7); a consumer's `@defer` wraps the whole `nav`, never a level, because items and back items register when constructed.
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/drilldown-menu` is its own entry point, so a consumer can defer the menu. Inside a dehydrated block the menu is its server HTML; a click on a toggle hydrates the block and replays. Inside `hydrate never`, and without JavaScript, only the root level works: its links navigate, toggles do nothing, deeper levels stay closed. Consumers who need every section reachable there make each parent a Hybrid item, whose link leads to the section's landing page. Plain `@defer` renders on the client, where the first measurement happens in the block's first render.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; the observer's callback and the document listeners run outside the zone and reach Angular only by writing signals or calling `collapseAll()`, which writes signals.

### Sass and custom CSS

The documented custom CSS is the `nfs-drilldown` Library mixin, which the Nested menu spec assigns to this plugin and keys on the drilldown root and wrapper classes, so only the live mode's rules match a ResponsiveMenu. The rules, their reasons, and the settings they reuse are in the Sass subsection under Further Notes.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes and ARIA each element carries, whether a level is `inert` or `invisible`, the wrapper's classes and inline height, where focus is after each action, what the server HTML contains, how far the page scrolled, and which outputs fired with which item. No test reads a directive's private fields. The utility's own class maps, key tables, completion, and swap rule are tested in the Nested menu spec; these tests cover what this spec adds and one end-to-end pass of the drilldown mode through the real root. Prior art: the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) drilldown cases (class emission, wrapper `min-height`, the `inert` counter-test, Tab order, focus handoff with `preventScroll`, Tab during the slide, server HTML) and the Off-canvas spec's layers.

Story ids follow `drilldown-menu--<story>`, `drilldown-menu` being the entry point folder: `drilldown-menu--default` (three levels, Foundation's docs shape), `drilldown-menu--hybrid` (Hybrid items with landing-page links), `drilldown-menu--back-bottom` (back items as the last child), `drilldown-menu--auto-height` (`autoHeight` and `animateHeight`, levels of different heights), `drilldown-menu--close-on-click`, `drilldown-menu--scroll-top` (a long menu in a tall page, `scrollTop` with an offset), `drilldown-menu--open-path` (a static `is-active` path at first paint, plus buttons calling `openPath()` and `collapseAll()`), and `drilldown-menu--fixture` (args-driven levels, Options, back position, page length, open path, and viewport for e2e).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` on the six WCAG 2.2 AA tags (ADR 0018), at the root level and with a level open, after the slides settle.

- `drilldown-menu--default`: the wrapper carries `is-drilldown`; the root `drilldown`; clicking Products opens its level (`aria-expanded`, `is-active visible`, no `inert`), the root gains `invisible`, and focus lands on the first non-back control; Right on a toggle opens one level deeper; the back button, Left, and Escape each close one level and refocus its toggle; Escape at the root level changes nothing; Down and Up stay within the level; `opened` and `closed` fire once each with the item (a story `fn()`); hovering and focusing a toggle change nothing; every back button's accessible name starts with "Back".
- `drilldown-menu--hybrid`: the link keeps its `href` and navigates (a story router spy); the toggle carries `submenu-toggle`, its item `has-submenu-toggle`; the toggle's name is its span text.
- `drilldown-menu--back-bottom`: opening a level focuses its first item, not the back button at the end; the back button still closes the level.
- `drilldown-menu--auto-height`: the wrapper carries `animate-height` and an inline `height`, no `min-height`; submenus carry no `drilldown-submenu-cover-previous`; the `height` changes when a level of another height opens and returns when it closes.
- `drilldown-menu--close-on-click`: with a level open, a press outside the menu returns it to the root level and the outside button still receives its click; a press inside a level keeps it open.
- `drilldown-menu--scroll-top`: opening a level from far down scrolls the page to the menu's document top plus the offset (the play function asserts the final position once the scroll settles, polling `scrollY`).
- `drilldown-menu--open-path`: the static `is-active` path is open at first render with focus untouched; `openPath(Street)` shows the Wheels level; `openPath(Boards)` shows the Products level; `openPath(null)` and `collapseAll()` return to the root level; `openPath(item, {focus: true})` focuses the level's first control.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- DI and registration: the root registers with its parent wrapper; a wrapper that is not the root's parent, a second root, and a missing wrapper each warn; a nested drilldown with its own wrapper leaves the outer wrapper alone; a back item finds its level and root, and warns outside a submenu or outside a drilldown; the Defaults token seeds every input and a bound value wins.
- Mode gating under a driving test root (the Nested menu spec's test root, driving the mode from a signal with `NfsDrilldown` as a host directive): outside drilldown mode the wrapper has no class and no style, back items carry `hidden` and `is-hidden`, the root has no `drilldown` or `invisible`, no document listener exists, the observer is disconnected, and development checks 1 to 3 do not warn; entering drilldown mode restores all of them and runs those checks once.
- Heights: with levels of known heights, `min-height` equals the tallest after the first observation; adding an item to the tallest level raises it; with `autoHeight` the `height` follows `currentLevel` on open, on back (already the parent's height while the level is `is-closing`), and on `collapseAll()`; `currentLevel` derivation for zero, one, and two open levels; with `nfsAnimationsToken.disabled` the wrapper carries no `animate-height` even when `animateHeight` is on.
- `openPath`: parent item, leaf item, `null`, an item of another root (warning, nothing changes), outside drilldown mode (warning); siblings off the path close; open children of the target close; with `focus: true` focus lands after `inert` is gone.
- `closeOnClick`: listeners exist only while a level is open and the input is on; `pointerdown` and `pointerup` outside collapse, and the `click` that follows is not `defaultPrevented`; down inside and up outside, down outside and up inside, and `pointerdown` followed by `pointercancel` do not collapse.
- `scrollTop`: with a `window.scrollTo` spy, no call at the first render, for an open-at-first-paint path, or for a swap into or out of drilldown mode with a level open under a driving test root; one call per level change with Foundation's top plus offset formula; an element reference and a selector as `scrollTopElement`; a selector that matches nothing uses the root and warns; `behavior` follows a fake `NfsMediaQuery.reducedMotion`.
- Reveal step: with a `scrollIntoView` spy, called with `{block: 'nearest', inline: 'nearest'}` on the focused control after an open and after a back completion (dispatched `transitionend` or the fallback with a fake timer), and not called when focus is outside the root.
- Replay-safe handlers: a replay-shaped back `click` (`eventPhase` 101, throwing `preventDefault`) closes its level with nothing reaching `ErrorHandler`.
- Development warnings: a submenu without a back item, a nameless back button, a back item without a button, `animateHeight` without `autoHeight`, an item expanded under a closed level; none for correct markup.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.

- SSR smoke: `renderApplication` over a fixture with a standalone drilldown (a Hybrid item, three levels, back items top and bottom), one with a static `is-active` path, one with `autoHeight` and `animateHeight`, one under a driving test root at a non-drilldown Server breakpoint, and one inside `@defer (hydrate on interaction)`. Assert `whenStable()` resolves; the HTML matches the Rendered HTML section: `is-drilldown` (and `animate-height`) on the wrapper and no inline style anywhere; `drilldown` on the root, `invisible` on it only for the open path; `inert` on closed submenus; `data-nfs-shown` on the open-at-first-paint level; no `role` or `aria-hidden` attribute; back items without `hidden` in drilldown mode and with `hidden` plus `is-hidden` under the non-drilldown root, whose wrapper has no class; `jsaction` on the root (`keydown`), each toggle (`click`), and each back item (`click`), none on links; `ngb` and `click:;keydown:;` on the deferred block's root.
- Pure logic, table-driven: the `currentLevel` walk, the `openPath` plan (which items open and close for a target), the pointer decision (inside or outside for a press start and end), and the `scrollTop` target formula.
- Sass compile (the library's node-level Sass test, ADR 0012): `@include nfs-drilldown;` compiles after Foundation with defaults and emits the rules listed under Further Notes; a `$drilldown-arrow-color` below 3:1 on white, one at 2.95:1 (which Foundation's rounding `color-contrast()` would pass), a `$dropdownmenu-arrow-color` below 3:1, an `$accordionmenu-arrow-color` below 3:1 with `$drilldown-arrows: false`, a 20 px `$accordionmenu-submenu-toggle-width`, and a `$drilldown-padding` of `0.2rem 1rem` each stop the compile naming the setting; the reduced-motion block names both the level slide and `.is-drilldown.animate-height`.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `drilldown-menu--fixture` through `mount(storyId, props)`, in Chromium, Firefox, and WebKit:

- Real key presses for the drilldown table; Tab sweeps never reach a control of a hidden level (WebKit's default Tab skips links, as the prototype recorded, so its sweep asserts buttons only).
- The slide animates (intermediate `transform` values) and completes at once under `emulateMedia({reducedMotion: 'reduce'})`; with `autoHeight` and `animateHeight` the wrapper's height passes through intermediate values, and jumps under reduced motion.
- Geometry: `min-height` equals the tallest level's rendered height; after a font-size or text-spacing override (1.4.12), the measured height grows and no level text is clipped.
- 2.4.7: a screenshot of the focus ring on the first and last control of a level, with and without `autoHeight`, shows all four edges.
- 2.4.11: in a tall page scrolled so the menu's top is above the viewport, opening a level from a toggle near the bottom leaves the focused control in the viewport (its centre hit-tests to itself), with and without `scrollTop`; back returns focus to a visible toggle.
- A Tab pressed during the slide never scrolls the wrapper (`scrollLeft` stays 0, `overflow: clip`).
- 1.4.10: at 320 CSS px wide, with a level open, the document has no horizontal scrolling.
- `closeOnClick` with a real mouse: an outside click resets the menu and still activates the outside link; with touch emulation (`hasTouch`), a swipe that starts outside does not reset it.
- `scrollTop`: the document scroll position ends at the menu's document top plus the offset; smooth without reduced motion, instant with it.
- Mode swap on the fixture's ResponsiveMenu-shaped root (`drilldown medium-dropdown`): resizing across `medium` hides the back items, strips the wrapper's class and inline height, and keeps focus on the same control (the Nested menu spec's F1 to F4 cases run there; here only the Drilldown pieces are asserted).

Against the prerendered fixture app, one route with a standalone drilldown and one with a ResponsiveMenu-shaped root (`drilldown medium-dropdown`), prerendered at `small`:

- JavaScript disabled: screenshot plus axe; the root level only, closed levels hidden, links navigable.
- Hydration: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`; after hydration the wrapper gains `min-height` and nothing else changes; at 1280 px the ResponsiveMenu route ends with the dropdown classes, bare wrapper, and hidden back items.
- Pre-hydration click on a toggle with the main bundle held back: after hydration the level opens exactly once and focus is in it; a pre-hydration ArrowRight on a focused toggle replays with the one accepted error log; on a route with a level open at first paint, a pre-hydration click on its back button closes it once.
- `@defer (hydrate on interaction)` around the `nav`: a toggle click hydrates and opens; `hydrate never`: root links navigate, toggles do nothing, no error.

## Out of Scope

- The Nested menu utility itself: item, submenu, and toggle directives, class maps, key tables, completion, the focus-loss guard, and the Menu mode swap rule ([Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md)).
- ResponsiveMenu's `rules` input and which Drilldown inputs and outputs its host directive list exposes ([Spec: Responsive Menu](../issues/23-spec-responsive-menu.md)); this spec asks it to expose `autoHeight`, `animateHeight`, `closeOnClick`, `scrollTop`, `scrollTopElement`, `scrollTopOffset`, `opened`, and `closed`.
- The opt-in menu-and-menubar variant (a vertical `role="menu"` drilldown) and the tree variant (map, Out of scope; ADR 0004).
- `parentLink` clones, generated back items, and any generated DOM.
- A slide direction that follows a runtime `dir` attribute: Foundation's drilldown slide and arrows follow the compile-time `$global-text-direction`, and the library's rules reuse `$global-left`/`$global-right`, so an RTL site compiles Foundation for RTL, as Foundation documents.
- A scroll Completion output (`scrollme.zf.drilldown`) until `scrollend` is in the Browser target.
- Mega menus and arbitrary content inside levels beyond links, back items, and nested lists.
- Runtime theming; native View Transitions and `CloseWatcher` (Further Notes).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Three directives: `ul[nfsDrilldown]`, `[nfsDrilldownWrapper]`, `li[nfsDrilldownBack]`, over the Nested menu utility | ADR 0001 and ADR 0004; the wrapper and the back item are one plain consumer-written element each | A component that renders the wrapper and back items (breaks server HTML equality and Foundation's markup) |
| D2 | Entry point `ngx-foundation-sites/drilldown-menu` and story ids `drilldown-menu--<story>`; class `NfsDrilldown` | The sibling entry points `accordion-menu`, `dropdown-menu`, `responsive-menu` and the spec slug; building-blocks 1.3 fixes only the class name | `ngx-foundation-sites/drilldown` (Foundation's hyphenated plugin name; breaks the menu family's folder pattern) |
| D3 | The wrapper is required, consumer-written, and a directive; it binds `is-drilldown` only in drilldown mode | Foundation needs it for clipping; a ResponsiveMenu must drop it in other modes, which a static class cannot | A static `class="is-drilldown"` (wrong in other modes, no height); the root writing styles on its parent (a directive must not write a host it does not own) |
| D4 | Heights through host style bindings from a ResizeObserver-fed signal; no `max-width` | Declarative, `null` on the server, testable; the observer replaces `data-mutate` and re-measures on any size change; Foundation's `max-width` froze fluid layouts | `Renderer2.setStyle` in the observer callback (building-blocks 1.5's example; one frame sooner, imperative); a `--nfs-drilldown-*` custom property (custom CSS for what Foundation writes inline) |
| D5 | `autoHeight` height = `currentLevel`'s measured height, `currentLevel` = innermost expanded submenu | Foundation moved the height at the start of open and close; a closing level is no longer expanded | Waiting for the slide to end (the height would lag the slide) |
| D6 | `animateHeight` maps to Foundation's `animate-height` class | Foundation's own transition; no library rule | A library height transition |
| D7 | Back item: `li[nfsDrilldownBack]` with a native button, `hidden` plus `is-hidden` outside drilldown mode, `close()` on its level's item | One markup for ResponsiveMenu (prototype); native button (1.10); focus return from the utility's focus-loss guard | A directive on the button (cannot hide the `li`); `<a tabindex="0">` (Foundation's non-link link) |
| D8 | Back button named "Back" plus a `show-for-sr` suffix naming the level it returns to; no `aria-expanded` | 2.4.6 and 2.5.3; it closes a level, it is not a disclosure | Plain "Back" in every level; an `aria-label` replacing the visible text |
| D9 | `backButtonPosition` dropped: the markup order is the switch | The consumer writes the item; the focus rule skips it anywhere | An input that moves consumer DOM (DOM changes outside templates, rule 4) |
| D10 | Disclosure navigation per level; no tree or menu roles | ADR 0004; the APG cautions; a tree keeps ancestors visible and navigates across them, a drilldown hides them | `ngTree`, `ngMenu` (roles, templates, `[parent]` inputs) |
| D11 | Hidden ancestor levels use `invisible`, never `inert` or `hidden` | The open level is their descendant (prototype row 9; Nested menu D9) | The APG research's `hidden`; building-blocks' former `inert` |
| D12 | `closeOnClick` is the popover pointer rule (down and up both outside) through its own document listeners, no `preventDefault()`, not the Light dismiss registry | Foundation's option is only the pointer; the registry's Escape and focus rules exist for overlays (1.4.13, 2.4.11) and would reset an in-flow drilldown whenever focus leaves it; Foundation's `preventDefault()` swallowed outside clicks | `nfsLightDismiss` (adds Escape and focus-out resets); a document `click` listener (a drag that ends outside would reset) |
| D13 | `scrollTop` via `window.scrollTo` with Foundation's formula, `'smooth'` or `'instant'` by reduced motion; `animationDuration`/`animationEasing` dropped | They timed the jQuery scroll; the browser owns smooth scrolling (the Smooth Scroll spec's rule) | `scrollIntoView` (building-blocks Table A: cannot add `scrollTopOffset`, and scrolls every ancestor) |
| D14 | Reveal step: after each slide, `scrollIntoView({block: 'nearest', inline: 'nearest'})` on the focused control inside the root | The utility focuses with `preventScroll`, so a long scrolled page could leave focus off-screen (2.4.11); after the slide nothing horizontal is left, and `overflow: clip` keeps the wrapper still | Dropping `preventScroll` (the utility's decision, prototype row 11); nothing (focus off-screen) |
| D15 | `openPath(item, {focus})` keeps `_showMenu()`; `collapseAll()` keeps `_hideAll()` | The utility's `open()` opens only its target (Foundation's `down()` did the same), so showing a deep level from code needs the whole Open path opened in order; the "Open path" vocabulary and Material/Aria verbs | Only per-item `open()` on each ancestor, left to every consumer (easy to get the order or the siblings wrong; a deep item under closed levels shows nothing) |
| D16 | Aggregate `opened`/`closed` carry `NfsMenuItem`, emitted after the slide, one `closed` per level on `collapseAll()` | Building-blocks 1.4; the Nested menu consumer table | Foundation's four events with mixed timing; a separate `collapsed` output |
| D17 | Every submenu needs a back item (development warning) | Without it a pointer user cannot leave a level | Generating one (DOM creation, rule 4) |
| D18 | `nfs-drilldown` adds an inset focus ring inside `.is-drilldown` | The wrapper must clip, which cut ring edges (worse with `autoHeight`); 2.4.7 | Accepting clipped edges (the Nested menu spec's first text); `overflow-clip-margin` (not in the Browser target) |
| D19 | Reduced motion covers `.is-drilldown.animate-height` as well as the slide | ADR 0003: every animation the library turns on honours the preference | Only the slide (the Nested menu spec's rule 12) |
| D20 | A row-height compile check beside the arrow and toggle checks | 2.5.8 is guaranteed by the Library mixin where settings can fail it (building-blocks 1.10) | Relying on the story gate (it sees only the library's settings) |
| D21 | `autoApplyClass` dropped; `drilldown` bound from the mode | Required by Foundation's CSS and by ResponsiveMenu | An input that could leave the menu unstyled |
| D22 | No `effect`, no `afterEveryRender`, no `injectAsync` | No non-DOM side effect; nothing loads after interaction | A lazily loaded measurement helper |
| D23 | No ADR | Every decision here is local to the plugin and reversible, or follows an existing ADR | - |

### Usage examples

A standalone drilldown with Hybrid items, `autoHeight`, and `scrollTop` under a sticky header:

```html
<nav aria-label="Shop">
  <div nfsDrilldownWrapper>
    <ul class="vertical menu" nfsDrilldown autoHeight animateHeight scrollTop [scrollTopOffset]="-64">
      <li nfsMenuItem>
        <a routerLink="/products">Products</a>
        <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Products pages</span></button>
        <ul class="menu vertical nested" nfsSubmenu>
          <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to Shop</span></button></li>
          <li nfsMenuItem>
            <a routerLink="/products/boards" routerLinkActive ariaCurrentWhenActive="page">Boards</a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</nav>
```

Showing the current page's level from route data, and resetting after navigation:

```ts
@Component({
  selector: 'app-shop-nav',
  imports: [NfsDrilldown, NfsDrilldownWrapper, NfsDrilldownBack, NfsMenuItem, NfsSubmenu, NfsSubmenuToggle, RouterLink],
  templateUrl: './shop-nav.html',
})
export class ShopNav {
  protected readonly drilldown = viewChild.required(NfsDrilldown);
  protected readonly street = viewChild.required('street', {read: NfsMenuItem});

  showCurrent(): void {
    this.drilldown().openPath(this.street());
  }

  reset(): void {
    this.drilldown().collapseAll();
  }
}
```

A server-rendered alternative needs no code: a static `is-active` on each submenu of the path (Foundation's documented marker) opens it at first paint.

Application-wide defaults:

```ts
providers: [{provide: nfsDrilldownDefaultsToken, useValue: {autoHeight: true, animateHeight: true} satisfies NfsDrilldownDefaults}]
```

Inside a ResponsiveMenu (one markup for every mode; the back items hide outside drilldown mode):

```html
<nav aria-label="Main">
  <div nfsDrilldownWrapper>
    <ul class="vertical medium-horizontal menu" nfsResponsiveMenu="drilldown medium-dropdown" (opened)="track($event)">
      <li nfsMenuItem>
        <button nfsSubmenuToggle>Products</button>
        <ul class="menu vertical nested" nfsSubmenu>
          <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
          <li nfsMenuItem><a routerLink="/products/boards">Boards</a></li>
        </ul>
      </li>
    </ul>
  </div>
</nav>
```

The root, as the Nested menu spec's consumer table shapes it:

```ts
@Directive({
  selector: 'ul[nfsDrilldown]',
  exportAs: 'nfsDrilldown',
  providers: [nfsMenuRootProviders('drilldown')],
  host: {
    '[class.drilldown]': 'live()',
    '[class.invisible]': 'live() && root.hasOpenItem()',
    '(keydown)': 'root.handleKeydown($event, "drilldown")',
  },
})
export class NfsDrilldown {
  protected readonly root = inject(nfsMenuModeToken, {self: true});
  readonly #defaults = inject(nfsDrilldownDefaultsToken, {optional: true});
  readonly autoHeight = input(this.#defaults?.autoHeight ?? nfsMenuBehaviourDefaults.drilldown.autoHeight, {transform: booleanAttribute});
  // ... animateHeight, closeOnClick, scrollTop, scrollTopElement, scrollTopOffset, seeded the same way
  readonly opened = output<NfsMenuItem>();
  readonly closed = output<NfsMenuItem>();
  protected readonly live = computed(() => this.root.mode() === 'drilldown');

  constructor() {
    inject(NfsDrilldownWrapper, {optional: true, skipSelf: true})?.register(this);
    this.root.configure('drilldown', {
      autoHeight: this.autoHeight,
      opened: (item) => this.#complete(item, this.opened),
      closed: (item) => this.#complete(item, this.closed),
    });
  }
  // currentLevel, openPath(), collapseAll(), the closeOnClick and scrollTop render callbacks, #complete (emit, then the reveal step)
}
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-menu`, `foundation-drilldown-menu`, `foundation-visibility-classes` (`invisible`, `visible`, `show-for-sr`), and `foundation-global-styles` (`is-hidden`); a Hybrid item also needs `foundation-accordion-menu`, which holds Foundation's only `.submenu-toggle` and `.has-submenu-toggle` rules. Its documented custom CSS is the `nfs-drilldown` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-drilldown-menu`: `@include nfs-drilldown;`. A ResponsiveMenu consumer includes it when its rules name drilldown.

(1) Rules, each scoped to `.drilldown` or `.is-drilldown` so they match only in drilldown mode (numbers in brackets are the Nested menu spec's rule numbers):

| # | Selector | Declarations | Reason |
| --- | --- | --- | --- |
| 1 [1] | `.drilldown li > button:not(.submenu-toggle)`; `.drilldown .is-drilldown-submenu li > button:not(.submenu-toggle)` | `display: block; width: 100%; line-height: 1; text-align: start; color: $anchor-color; cursor: pointer; padding: $drilldown-padding`, and `background: $drilldown-background` when not `null`; submenu buttons `padding: $drilldown-submenu-padding` | Parents and back items are buttons (ADR 0004, 1.10); Foundation's drilldown rules style only `a`, and its button reset leaves a `<button>` inline and unpadded |
| 2 [6] | `.drilldown .is-drilldown-submenu-parent > button:not(.submenu-toggle)` and its `::after`; `.drilldown .js-drilldown-back > button::before`; the `.align-left`/`.align-right` twins; gated on `$drilldown-arrows` | Foundation's geometry: `css-triangle($drilldown-arrow-size, $drilldown-arrow-color, $global-right)` at Foundation's position, the back arrow toward `$global-left` with Foundation's `margin-#{$global-right}: 0.75rem`; the twins with `$dropdownmenu-arrow-size` and `$dropdownmenu-arrow-color`, as Foundation's own twins | Foundation draws every drilldown arrow on `> a` |
| 3 [7] | `.drilldown .is-drilldown-submenu-parent.has-submenu-toggle`, its `> a`, its `> .submenu-toggle` | `display: flex`; `flex: 1 1 auto; margin-inline-end: 0`; `position: static; flex: none` | Foundation's toggle is absolutely positioned against a positioned `li`; a drilldown `li` must stay unpositioned because levels are placed against the root list |
| 4 [8] | `.drilldown .has-submenu-toggle > a::after` | `content: none` | Foundation's drilldown link arrow has no `.has-submenu-toggle` exclusion, so a Hybrid item would draw two arrows |
| 5 [9] | `.is-drilldown` | `overflow: clip` | Overrides Foundation's `overflow: hidden`, which a focus during the slide could scroll sideways (prototype rows 11, 12); a clipping box is no scroll container, which the reveal step relies on |
| 6 [12, extended] | inside `@media (prefers-reduced-motion: reduce)`: `.drilldown .is-drilldown-submenu`, `.is-drilldown.animate-height` | `transition-duration: 1ms` | Reduced motion for the slide the utility awaits and the height transition `animateHeight` turns on (building-blocks 1.6 rule 5) |
| 7 (new) | `.is-drilldown a:focus-visible`, `.is-drilldown button:focus-visible` | `outline-offset: -2px` | The wrapper must clip, so rings drawn outside a control lose their edges at the wrapper's sides (and, with `autoHeight`, top and bottom); an inset ring keeps every edge visible (2.4.7) |

Checks (no CSS output), each with Foundation's own functions and the consumer's values. Contrast ratios are computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded (the Nested menu spec's rule, as the Button spec does), because Foundation's `color-contrast()` rounds to one decimal and lets 2.95:1 pass. `@error` naming the setting when the ratio of `$drilldown-arrow-color` against `$drilldown-background` or `$drilldown-submenu-background` is below 3, and the same for `$dropdownmenu-arrow-color` (both only while `$drilldown-arrows`; 1.4.11); when the ratio of `$accordionmenu-arrow-color` against `$accordionmenu-submenu-toggle-background` (when not `null`), else against `$body-background` and `$drilldown-submenu-background`, is below 3, whatever `$drilldown-arrows` says, because Foundation draws the Hybrid toggle's arrow unconditionally (1.4.11); when `$accordionmenu-submenu-toggle-width` or `$accordionmenu-submenu-toggle-height` is below 24 px (2.5.8, the Hybrid item's toggle); when `1rem` plus twice the first value of `$drilldown-padding` or `$drilldown-submenu-padding`, converted with `rem-calc()`, is below `rem-calc(24)` (2.5.8, rows at line height 1).

(2) Reused settings, mixins, and functions: `$anchor-color`, `$drilldown-padding`, `$drilldown-submenu-padding`, `$drilldown-background`, `$drilldown-submenu-background`, `$drilldown-arrows`, `$drilldown-arrow-size`, `$drilldown-arrow-color`, `$dropdownmenu-arrow-size`, `$dropdownmenu-arrow-color`, `$accordionmenu-arrow-color`, `$accordionmenu-submenu-toggle-background`, `$accordionmenu-submenu-toggle-width`, `$accordionmenu-submenu-toggle-height`, `$body-background`, `$global-left`, `$global-right`, `css-triangle`, `color-luminance`, `rem-calc`, all read from the consumer's compile. `$drilldown-transition` is Foundation's and awaited, not restyled. No mixin parameter: every value has a Foundation setting.

(3) Custom properties: none. The wrapper's `min-height` and `height` are inline styles bound from measurements, Foundation's own mechanism, which no rule reads.

(4) Motion classes: none from `nfs-motion`. Reduced-motion override: rule 6.

(5) What breaks without the include: parent and back buttons render as inline, unpadded text with no arrows; a Hybrid item's toggle overlaps its link and draws a second arrow; the wrapper can scroll sideways during a slide, emptying the menu; reduced motion is ignored; focus rings lose their edges at the wrapper's sides.

### Platform features to adopt when the browser target moves

- View Transitions (same-document `startViewTransition`) for the level slide, keeping Foundation's transform as the fallback until then.
- `CloseWatcher` so the Android back gesture closes the current Drilldown level, as the back button does.
- `scrollend` for a scroll Completion output (Foundation's `scrollme.zf.drilldown`).
- `overflow-clip-margin` to keep focus rings outside the control box while the wrapper clips, replacing rule 7's inset ring.
- `interpolate-size: allow-keywords` or `calc-size()`: an `autoHeight` wrapper whose height transitions without Foundation's `animate-height` pixel values once levels stop being absolutely positioned.
- `:has()`: `.is-drilldown:has(> .drilldown .is-active)` could replace nothing the directive binds today, but a consumer theme could style the wrapper by open level without a class.

### Foundation behaviour changed or dropped

- The wrapper, the back items, and any parent-link clone are consumer-written; nothing is generated, and `backButton`, `backButtonPosition`, `wrapper`, `parentLink`, and `autoApplyClass` are Dropped options.
- Parent links keep their `href` (a Hybrid item) or become buttons; Foundation stripped `href` and added `tabindex="0"`.
- No `menubar`, `menuitem`, `none`, or `group` roles, no `aria-haspopup`, no copied `aria-label`, no `aria-multiselectable`, no `aria-hidden`; `aria-expanded` moves from the `li` to the toggle button.
- Focus moves into a level on every open, mouse included, in the render after the change rather than after `transitionend` plus `setTimeout`; back returns focus on every path; the focused control is scrolled into view after each slide.
- `closeOnClick` no longer calls `preventDefault()` on the outside click and ignores presses that start or end inside the menu and touch scrolls.
- `scrollTop` uses the browser's smooth scrolling once per level change (Foundation scrolled on up to four events per change) and is instant under reduced motion; `animationDuration` and `animationEasing` are dropped.
- The wrapper's height follows every size change through a ResizeObserver instead of the `data-mutate` protocol, and its `max-width` is no longer frozen at initialisation.
- The menu completes a slide when `$drilldown-transition` is `none` (Foundation hung).
- `_menuLinkEvents`, dead in 6.9, is not ported: a leaf click does not reset the menu.
