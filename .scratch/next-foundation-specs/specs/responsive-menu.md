# Spec: Responsive Menu

Ticket: [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA, every criterion a requirement. Built on the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), whose API this spec uses as that spec defines it, and composing the roots of the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), and the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), with the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md) resolving its Breakpoint rule. Two rules of the Nested menu spec, recorded in [ADR 0035](../adr/0035-responsive-menu-swap-commit.md) and confirmed in three engines by the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md), carry this spec: the Nested menu root commits every Mode swap in its own render callback, and entering dropdown mode with focus outside the menu closes every submenu.

## Problem Statement

A developer building an Angular application on Foundation for Sites writes one site navigation as Foundation's nested `ul.menu` markup and wants it to change pattern with the viewport: a drilldown or an accordion menu on a phone, a dropdown menu on a desktop, as Foundation's `data-responsive-menu="drilldown medium-dropdown"` does. Foundation's ResponsiveMenu plugin does this in jQuery, and the way it does it cannot be carried into Angular:

- Every breakpoint change destroys the live menu plugin and constructs another one on the same `ul`. Everything the user had open closes, focus drops to the page body when the focused control is hidden by the new pattern, and attributes the outgoing plugin's cleanup forgets (AccordionMenu leaves `aria-expanded`, `aria-controls`, `aria-hidden`, and `role="group"` behind) stay on elements the new plugin never updates, so a screen reader hears state that is no longer true.
- The rule string is parsed with quirks: the last matching rule in written order wins, so the order of the tokens changes behaviour; a breakpoint name with a hyphen breaks the parser; a mistyped mode is stored as `undefined` and throws later, when that breakpoint matches; and when no rule matches the current breakpoint, no plugin runs at all, leaving parent items that open nothing.
- Breakpoints come from a `<meta class="foundation-mq">` read through computed style, which a server does not have, and the window listener that drives the swap is never removed when the plugin is destroyed.
- Every problem of the three menu plugins comes along: menu roles that promise keys that do not exist, `<a href="#">` parents that cannot also navigate, generated wrappers, back items, and toggle buttons, and body click handlers.

A server-rendered Angular application adds more: the server cannot know the viewport, so it must render one pattern deterministically; a desktop client must switch patterns before its first paint after hydration without a hydration error; a control focused before hydration must keep focus through that switch; a click before hydration must not be lost; a menu inside a deferred block must hydrate as the server sent it; and a desktop page must not open with a dropdown submenu covering the content because the current section was marked open for the phone layout.

## Solution

One attribute directive, `nfsResponsiveMenu`, on the outer `ul` the developer already writes, taking Foundation's rule string as its value: `<ul class="vertical medium-horizontal menu" nfsResponsiveMenu="drilldown medium-dropdown">`. The developer puts the Nested menu directives on the same markup (`nfsMenuItem` on every `li`, `nfsSubmenu` on every nested `ul`, `nfsSubmenuToggle` on the button that opens a submenu) and, when the rules name drilldown, the Drilldown Menu's wrapper and back items. The directive:

- hosts the Accordion Menu, Drilldown, and Dropdown Menu roots on the same `ul`, of which exactly one is live at a time: the one whose Menu mode the rules give for the current breakpoint. The live root binds Foundation's root class (`accordion-menu`, `drilldown`, or `dropdown`), handles the keys, and emits its Completion outputs; the other two stay idle;
- passes every Option of the three roots through under Foundation's names (`multiOpen`, `autoHeight`, `closeOnClick`, `hoverDelay`, and the rest), as Foundation's child plugins read every `data-*` attribute of the same `ul`; `closeOnClick` reaches Drilldown and Dropdown Menu at once, each with its own default;
- re-emits the live root's `opened` and `closed` with the item, exposes the displayed Menu mode as a read-only `mode` signal, and offers `collapseAll()`.

A Mode swap changes classes, key handling, and the Drilldown level names on the same nodes, never roles: every mode is disclosure navigation. The open submenus that hold focus stay open, so focus stays on the same control; a swap into drilldown also closes the submenu whose own row holds focus (its toggle, or a Hybrid item's link), because the open level would hide that row; a swap into dropdown with focus outside the menu closes every submenu, so no overlay is left covering the page. The swap is decided and applied in one render callback, while the old mode's classes are still on the page, so no render ever shows the new mode over submenus the swap is about to close.

The server renders the Server breakpoint's mode. Every instance, deferred and client-created ones included, starts from that mode and follows the viewport from its first render callback on, so server HTML hydrates exactly as sent and a client-rendered page never paints the wrong mode. The directive adds no CSS of its own: each mode's Library mixin styles its mode, keyed on its root class.

## User Stories

1. As an application developer, I want to write `nfsResponsiveMenu="drilldown medium-dropdown"` on Foundation's `ul.menu`, so that Foundation's documented rule string carries over unchanged.
2. As an application developer, I want the rules as an object such as `{small: 'drilldown', medium: 'dropdown'}`, so that I can build them in TypeScript with type checking.
3. As an application developer, I want the rules to resolve in breakpoint order whatever order I write them in, so that `medium-dropdown drilldown` means the same as `drilldown medium-dropdown`.
4. As an application developer with a breakpoint named `x-large`, I want `x-large-accordion` to work, so that my breakpoint names are not limited by the parser.
5. As an application developer, I want a development warning that quotes a mistyped mode such as `tabs`, so that a copy-paste from Responsive Accordion Tabs does not silently disable a mode.
6. As an application developer, I want a defined mode below my smallest rule breakpoint, with a warning, so that a rule string without a bare mode still gives a working menu.
7. As an application developer, I want to change the rules at runtime, so that a setting in my application can force one pattern.
8. As an application developer, I want one markup for every mode, so that I never write the menu twice.
9. As an application developer, I want the Drilldown wrapper and back items to disappear from the layout in the other modes, so that the accordion and dropdown modes look as Foundation's do.
10. As an application developer, I want every Option of the Accordion Menu, Drilldown, and Dropdown Menu available on the same element under Foundation's names, so that my existing `data-*` values carry over.
11. As an application developer, I want a bound `closeOnClick` to reach both Drilldown and Dropdown Menu, and each to keep its own default when I bind nothing, so that the Option behaves as it did in Foundation.
12. As an application developer, I want each mode's Defaults token to apply inside a responsive menu, so that application-wide defaults are set once per mode.
13. As an application developer, I want `opened` and `closed` outputs carrying the item, emitted once by the live mode, so that one listener works in every mode.
14. As an application developer, I want the displayed mode as a signal through `#menu="nfsResponsiveMenu"`, so that surrounding layout can react to it.
15. As an application developer, I want `collapseAll()` on the responsive menu in every mode, so that I can reset the menu after a navigation.
16. As an application developer, I want the mode-specific members (`openPath()`, `expandAll()`) through the hosted roots' own `exportAs` names on the same element, so that I do not need a second API for them.
17. As an application developer, I want each item's `expanded` model to stay in sync with what a swap closed, so that my two-way bindings never disagree with the page.
18. As an application developer, I want Foundation's `is-active` marker on the current section to open it in drilldown and accordion mode, and not to open an overlay in dropdown mode, so that the current section shows on a phone without covering a desktop page.
19. As an application developer, I want development warnings for a Zero-breakpoint dropdown on a horizontal menu, a hand-written mode class on the root, and a second menu root directive on the same element, so that mistakes surface early.
20. As a keyboard user, I want focus to stay on the same control when a resize or rotation changes the mode, so that I never lose my place.
21. As a keyboard user inside an open submenu, I want that submenu to stay open across a mode change, so that I can keep reading where I was.
22. As a keyboard user on a drilldown back button, I want focus to land on the first item of the same level when the drilldown becomes another mode, so that focus is not lost when the back button disappears.
23. As a keyboard user, I want the keys of the mode I see to work at once after a change, so that the menu is never between two patterns.
24. As a keyboard user, I want Tab, Enter, and Space to work the same in every mode, so that the arrow keys are only a shortcut.
25. As a screen reader user, I want the same roles in every mode, and `aria-expanded` always true to what is open, so that a responsive menu never claims what it is not.
26. As a screen reader user, I want the current page's link marked with `aria-current="page"` in every mode, so that I know where I am.
27. As a user zooming to 400 percent, I want the menu to switch to its small-screen mode and fit the page without sideways scrolling, so that I can read it.
28. As a user who enlarged the default font size, I want the mode to switch at the same point as Foundation's CSS, so that behaviour and layout agree.
29. As a user rotating a phone, I want the same links and controls in both orientations, so that nothing depends on how I hold the device.
30. As a desktop user, I want no dropdown submenu open when the page loads or when the menu changes to dropdown mode while I am elsewhere on the page, so that nothing covers the content.
31. As a user who prefers reduced motion, I want mode changes and submenus to move without animation, so that motion does not bother me.
32. As a low-vision user, I want every arrow, focus ring, and label to meet the WCAG 2.2 AA minimums in every mode, so that I can see the menu's state.
33. As a user with limited dexterity, I want every toggle and item at least 24 by 24 CSS px in every mode, so that I can hit it.
34. As a developer of a server-rendered application, I want the server to render the Server breakpoint's mode with every class, `aria-expanded`, and `inert`, so that the first paint is the real menu.
35. As a developer of a server-rendered application, I want a desktop client to switch to its mode in the first tick after hydration with no hydration error, so that the switch is the only visible change.
36. As a developer of a server-rendered application, I want a toggle focused before hydration to keep focus through that switch, and a toggle clicked before hydration to open once afterwards, so that early interaction is not lost.
37. As a developer using client hints, I want a server that renders dropdown mode for a desktop visitor to hydrate unchanged, so that those visitors see no switch.
38. As a developer using incremental hydration, I want a menu inside `@defer (hydrate on viewport)` to hydrate as sent and then switch, keeping focus, so that deferred menus behave like eager ones.
39. As a developer of a client-rendered application, and of routed layouts created after navigation, I want no frame of the wrong mode painted, so that client rendering looks as if the menu knew the viewport from the start.
40. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
41. As a developer of a zoneless application, I want the menu to need no zone, so that it works with zoneless change detection.
42. As a developer who themes the menu, I want each mode styled by its own Library mixin and my Foundation settings, and the compile to stop when my settings break WCAG 2.2 AA in a mode I use, so that I cannot ship an inaccessible mode by accident.
43. As a library maintainer, I want the resolution, the swap, focus, the forwarded Options, the server HTML, and real resizes asserted at the four test layers under story ids `responsive-menu--<story>`, so that a regression shows at the layer that owns it.

## Implementation Decisions

### Foundation contract

From Foundation 6.9's ResponsiveMenu plugin source, its docs page (Responsive Navigation), and the menus inventory, section 4. The option, event, and method list is Foundation's own, not the ticket's wording: `ResponsiveMenu.defaults = {}`, so the plugin has no Options of its own; the rule string is read from `data-responsive-menu` at setup; it fires no event of its own; its only public method is `destroy()`. Foundation has no `-tabs` alias or any other alias for a mode: its `MenuPlugins` table knows exactly `dropdown`, `drilldown`, and `accordion` (whose root class is `accordion-menu`); `tabs` is a mode of Responsive Accordion Tabs, not of this plugin.

| Foundation feature | What it does in 6.9 | Library counterpart |
| --- | --- | --- |
| `data-responsive-menu="drilldown medium-dropdown"` | Space-separated tokens `<breakpoint>-<mode>` or a bare `<mode>` meaning `small`, split with `split('-')` and indexed `[0]`, `[1]` | `rules` input under the directive's own attribute, `nfsResponsiveMenu="..."`, or the object form; parsed by the Breakpoint service's shared parser against the three modes: a bare mode applies from the Zero breakpoint, a token splits at its last hyphen, an unknown mode or breakpoint is skipped with a development warning |
| `MenuPlugins`: `dropdown` -> `.dropdown` + DropdownMenu, `drilldown` -> `.drilldown` + Drilldown, `accordion` -> `.accordion-menu` + AccordionMenu | Mode names and the root class each adds | `NfsMenuMode` (`'accordion' \| 'drilldown' \| 'dropdown'`, the Nested menu's type); each hosted root binds its class only while its mode is live |
| Unknown mode token (`MenuPlugins[rulePlugin] !== null` is true for `undefined`) | Stored as `undefined`; throws when that breakpoint matches | Skipped at parse time with a development warning quoting the token (`tabs`, `accordion-menu`, a typo) |
| `_checkMediaQueries()` on `changed.zf.mediaquery` | The last rule in written order whose breakpoint `atLeast` matches wins; no match returns early with no plugin; a different match removes the three root classes, destroys the child, constructs the new one with `{}` | Resolution by Breakpoint map order (`resolve()`); below the smallest rule breakpoint the smallest rule's mode applies, with a development warning; a change is a Mode swap on the same nodes, committed with its pruning in the Nested menu root's render callback (Behaviour rules); nothing is destroyed or constructed |
| `new plugin($element, {})`, child reads `$element.data()` | Per-plugin `data-*` Options on the same `ul` still apply | The three roots' inputs are exposed on this directive under their names; one binding reaches every root that declares the input |
| `data-mutate="<id>"` on the root | Opts the element into Triggers' MutationObserver re-measure protocol | Dropped: the Drilldown wrapper re-measures with its own `ResizeObserver` |
| `init.zf.responsive-menu`, `destroyed.zf.responsive-menu`; the child's `init`/`destroyed` at every swap | Lifecycle events | None (Angular lifecycle) |
| The live child's events (`down`/`up.zf.accordionMenu`, `open`/`hide`/`close`/`closed.zf.drilldown`, `show`/`hide.zf.dropdownMenu`) | Mode-specific events | `opened` and `closed` Completion outputs with the `NfsMenuItem`, from the live root only |
| `destroy()` | Destroys the child; unbinds `.zf.ResponsiveMenu`, which does not match the `changed.zf.mediaquery` binding, so the window listener leaks | Angular lifecycle; the directive adds no listener of its own and the Breakpoint service owns the media query listeners |
| Breakpoints from `meta.foundation-mq` | Read through computed style | `NfsMediaQuery` from `nfsBreakpointsToken` (ADR 0005) |
| Roles and ARIA | Delegated to the live child; stale attributes after a swap | Disclosure navigation in every mode (ADR 0004); every attribute is a host binding that recomputes, so nothing is left behind |

Dropped options: `data-mutate` (a protocol attribute, not an Option) and `data-options` (nothing to parse). Dropped behaviours: destroying and constructing plugins on a breakpoint change, closing everything at a swap, rule order deciding the winner, the first-hyphen split, storing unknown modes, the no-plugin state below the first rule, the leaked window listener, and the stale attributes after a swap.

### CSS class to Angular mapping

| Foundation markup or class | Angular | Rationale |
| --- | --- | --- |
| Root `ul[data-responsive-menu]` | `NfsResponsiveMenu`, selector `ul[nfsResponsiveMenu]`, `exportAs: 'nfsResponsiveMenu'` | ResponsiveMenu has no Structural class of its own, so the class is named after the Plugin (building-blocks 1.3); an attribute directive on the consumer's `ul` (ADR 0001), because all three modes are directives on the same `ul` |
| `.accordion-menu`, `.drilldown`, `.dropdown` on the root | Host class bindings of the hosted `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`; only the live root's is true | Foundation's `MenuPlugins` classes; never written by the consumer on a responsive root (a static one would apply in every mode; development warning) |
| `.menu`, `.vertical`, `.<bp>-horizontal`, `.<bp>-vertical`, `.align-right` on the root | None; consumer-written | Foundation's Menu classes; the consumer pairs the orientation classes with the rules, as Foundation's docs show (`vertical medium-horizontal` with `drilldown medium-dropdown`) |
| Every `li`, nested `ul`, and parent control | The Nested menu's `li[nfsMenuItem]`, `ul[nfsSubmenu]`, `button[nfsSubmenuToggle]` (with `hybrid` for a Hybrid item) | One family emits every mode's classes from the Menu mode (ADR 0004) |
| Generated `div.is-drilldown` wrapper | The Drilldown Menu's `[nfsDrilldownWrapper]` on the consumer's element around the root (a `div` or the `nav`), when the rules name drilldown | Binds `is-drilldown` and the measured height only in drilldown mode |
| Generated `li.js-drilldown-back` | The Drilldown Menu's `li[nfsDrilldownBack]` holding a `<button type="button">`, in every submenu, when the rules name drilldown | `hidden` plus `.is-hidden` outside drilldown mode |
| `.submenu-toggle-text` | Consumer-written span inside a Hybrid item's toggle | Foundation's visually hidden name holder |
| `.is-active` on a submenu | Consumer-written pre-open marker; seeds the item's `expanded` (Nested menu) | Foundation's documented marker; a swap into dropdown with focus outside closes it (Behaviour rules) |

### Hierarchy and DI shape

```
ngx-foundation-sites/responsive-menu   (secondary entry point)
  NfsResponsiveMenu     ul[nfsResponsiveMenu], exportAs 'nfsResponsiveMenu'
    providers: nfsMenuRootProviders('accordion')     -> nfsMenuModeToken = NfsMenuRoot, shared by the three roots
    hostDirectives:
      NfsAccordionMenu   inputs: multiOpen                                   outputs: opened, closed
      NfsDrilldown       inputs: autoHeight, animateHeight, closeOnClick,
                                 scrollTop, scrollTopElement, scrollTopOffset outputs: opened, closed
      NfsDropdownMenu    inputs: alignment, disableHover, hoverDelay, closingTime,
                                 autoclose, closeOnClick, closeOnClickInside  outputs: opened, closed
    injects: nfsMenuModeToken {self: true}, NfsMediaQuery; (development only) HostAttributeToken('class')
    constructor: root.drive(() => requested mode)

consumer markup (other entry points):
  [nfsDrilldownWrapper]                                   ngx-foundation-sites/drilldown-menu, when the rules name drilldown
    ul[nfsResponsiveMenu]
      li[nfsMenuItem] > button[nfsSubmenuToggle] + ul[nfsSubmenu]   ngx-foundation-sites/nested-menu
        li[nfsDrilldownBack] > button                     ngx-foundation-sites/drilldown-menu
uses: NfsMediaQuery (resolve, serverBreakpoint, breakpoints) and parseNfsBreakpointRules
      from ngx-foundation-sites/media-query
```

- One element carries three modes through `hostDirectives`, the shape the Nested menu spec fixes and the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) measured in three engines (row 5). Host directives are applied statically at compile time and cannot be added or removed at runtime (Angular's directive composition guide), so the three roots always exist; which one acts is decided by the shared root's `mode`, not by creating or destroying directives. A directive created per mode at runtime has no Angular mechanism on an existing element, and a structural `@switch` over three copies of the `ul` would re-render the consumer's markup, drop focus at every swap, and rebuild at hydration.
- The token's providers: the class that declares `hostDirectives` wins over its host directives' providers on the same token (the composition guide), so `nfsMenuRootProviders('accordion')` on `NfsResponsiveMenu` creates the one `NfsMenuRoot` that all three roots read through `inject(nfsMenuModeToken, {self: true})` and every item reads through the Nested menu's optional injection. The factory's mode is irrelevant: `drive()` replaces it before the first render.
- Host directives run their constructors before the hosting class, so each root has called `configure(mode, ...)` with its inputs before `NfsResponsiveMenu` calls `drive()`.
- Inputs and outputs: the host directive entries list every input of each root and both outputs. `closeOnClick` is exposed by two host directives under the same name, so one binding sets both, each keeping its own default when unbound (Dropdown Menu spec decision 13; Drilldown Menu spec decision 18). The three `opened` outputs and the three `closed` outputs share their names; a consumer's `(opened)` subscribes to all three, and only the live mode's root calls its completion function, so it fires once.
- Defaults tokens: each hosted root reads its own (`nfsAccordionMenuDefaultsToken`, `nfsDrilldownDefaultsToken`, `nfsDropdownMenuDefaultsToken`), so application-wide defaults per mode apply under a responsive menu. A consumer who wants a different `closeOnClick` per mode leaves the input unbound and sets it in the two Defaults tokens. `NfsResponsiveMenu` has no Options of its own and therefore no Defaults token.
- `exportAs`: the hosted roots keep theirs, and Angular resolves a host directive's `exportAs` on the host element (Angular's acceptance test "should be able to reference exported host directives"), so `#d="nfsDrilldown"` on a responsive `ul` reaches `openPath()` and `currentLevel`, and `#a="nfsAccordionMenu"` reaches `expandAll()`.
- A root directive attribute written next to `nfsResponsiveMenu` (`<ul nfsResponsiveMenu nfsDrilldown>`) is not supported: Angular keeps the selector match of that directive and drops its host directive match, and its own `nfsMenuRootProviders` then competes with this directive's provider on the same element. A development warning names it.
- No plugin token (`nfsResponsiveMenuToken`): nothing injects the responsive root. Not an Openable: the directive provides no `nfsOpenableToken`, so a bare `nfsClose` on a link in a responsive menu inside an off-canvas panel closes the panel (Nested menu D22).
- The entry point exports only `NfsResponsiveMenu`. The Nested menu directives, the Drilldown wrapper and back directives, and the three roots are imported from their own entry points (the menu specs' one-owner rule); the responsive entry point depends on them and on `ngx-foundation-sites/media-query`.

### API

```ts
// from ngx-foundation-sites/nested-menu and ngx-foundation-sites/media-query
type NfsMenuMode = 'accordion' | 'drilldown' | 'dropdown';
type NfsBreakpointRules<M extends string> = Readonly<Partial<Record<NfsBreakpointName, M>>>;

class NfsResponsiveMenu {        // ul[nfsResponsiveMenu], exportAs 'nfsResponsiveMenu'
  readonly rules: InputSignal<string | NfsBreakpointRules<NfsMenuMode>>;   // required, alias 'nfsResponsiveMenu'
  readonly mode: Signal<NfsMenuMode>;                                       // the displayed Menu mode
  collapseAll(): void;
  // exposed from the hosted roots, declared by their specs:
  // inputs multiOpen; autoHeight, animateHeight, closeOnClick, scrollTop, scrollTopElement, scrollTopOffset;
  //        alignment, disableHover, hoverDelay, closingTime, autoclose, closeOnClickInside
  // outputs opened, closed: OutputRef<NfsMenuItem>
}
```

| Member | Kind | Type | Default | Foundation equivalent | Delta and notes |
| --- | --- | --- | --- | --- | --- |
| `rules` | `input.required`, alias `nfsResponsiveMenu` | `string \| NfsBreakpointRules<NfsMenuMode>` | | `data-responsive-menu` | Parsed with `parseNfsBreakpointRules(rules, ['dropdown', 'drilldown', 'accordion'], mq.breakpoints)`; resolved by map order; a runtime change swaps like a resize, through the same render callback |
| `mode` | read-only signal | `Signal<NfsMenuMode>` | the Server breakpoint's mode | none | The Nested menu root's displayed mode: what the page shows. It changes only when a swap is committed, so a template reading it never runs ahead of the classes. Its first read evaluates the requested mode and therefore the required `rules` input, so reading `mode` before the directive's first update pass (a parent template reading it through a view query across the `@if` that holds the menu) throws NG0950, like any required input; reading it after the `ul` in the same template, through `#menu="nfsResponsiveMenu"`, is safe |
| `collapseAll()` | method | `() => void` | | none (each child had its own) | Delegates to `NfsMenuRoot.collapseAll()`: closes every submenu in any mode; focus inside a closing submenu moves to the top-level toggle that contained it |
| `opened`, `closed` | outputs of the hosted roots | `NfsMenuItem` | | the live child's open and close events | Completion outputs of the live mode, after its animation (accordion grid, drilldown slide) or in the render callback after the change (dropdown); never for the first-paint state; never for a swap itself (Behaviour rules) |

Inputs exposed from the hosted roots (every Option of the three plugins; each spec owns its behaviour and development checks):

| Input | Hosted root | Type | Foundation default | Foundation attribute |
| --- | --- | --- | --- | --- |
| `multiOpen` | `NfsAccordionMenu` | `boolean` | `true` | `data-multi-open` |
| `autoHeight` | `NfsDrilldown` | `boolean` | `false` | `data-auto-height` |
| `animateHeight` | `NfsDrilldown` | `boolean` | `false` | `data-animate-height` |
| `scrollTop` | `NfsDrilldown` | `boolean` | `false` | `data-scroll-top` |
| `scrollTopElement` | `NfsDrilldown` | `Element \| string \| null` | `null` (Foundation `''`) | `data-scroll-top-element` |
| `scrollTopOffset` | `NfsDrilldown` | `number` | `0` | `data-scroll-top-offset` |
| `closeOnClick` | `NfsDrilldown` and `NfsDropdownMenu` | `boolean` | `false` for Drilldown, `true` for Dropdown Menu | `data-close-on-click` |
| `alignment` | `NfsDropdownMenu` | `'auto' \| 'left' \| 'right'` | `'auto'` | `data-alignment` |
| `disableHover` | `NfsDropdownMenu` | `boolean` | `false` | `data-disable-hover` |
| `hoverDelay` | `NfsDropdownMenu` | `number` (ms) | `50` | `data-hover-delay` |
| `closingTime` | `NfsDropdownMenu` | `number` (ms) | `500` | `data-closing-time` |
| `autoclose` | `NfsDropdownMenu` | `boolean` | `true` | `data-autoclose` |
| `closeOnClickInside` | `NfsDropdownMenu` | `boolean` | `true` | `data-close-on-click-inside` |

Every default comes from the hosted root's Defaults token, else that root's own default (Foundation's value, in `nfsMenuBehaviourDefaults` for the Nested menu's slots and in the root spec's API table for the rest). An input bound while its mode is not live stays bound and applies when the mode returns. The directive declares no `model()`: the open state is each item's `expanded` model (Nested menu), and the displayed mode follows the viewport, so it is read-only.

Per-item and mode-specific API, used as the Nested menu and the three root specs define it: `NfsMenuItem` with its `expanded` model, `opened`/`closed`, `open()`/`close()`/`toggle()`; `NfsSubmenu` with its `id`; `NfsSubmenuToggle` with `hybrid`; `openPath()` and `currentLevel` through `#d="nfsDrilldown"` (drilldown mode only: `openPath()` warns outside drilldown mode; `currentLevel` reads `null` there, as that spec says); `expandAll()` through `#a="nfsAccordionMenu"` (accordion mode with `multiOpen` on).

Behaviour rules:

- Requested mode (the mode the rules give now): `computed` over `rules`, the parsed rules, and the Breakpoint service. Until the directive's first render callback it resolves at the Server breakpoint, `mq.resolve(parsed, mq.serverBreakpoint)`; from then on at the live breakpoint, `mq.resolve(parsed)`. When no rule applies at that breakpoint, the smallest rule's mode (by Breakpoint map order) applies; when the rules name no valid mode at all (an empty string, or only invalid tokens), `accordion` applies. The directive hands `() => requested mode` to `root.drive()` in its constructor.
- Displayed mode (the root's `mode`, what the page shows): taken from the requested mode on its first read, during the first render, and afterwards changed only by the swap callback, as the Nested menu spec defines it (ADR 0035); the root spec's `drive()` signature is unchanged.
- Mode swap, committed in one `afterRenderEffect` of the Nested menu root (ADR 0035):
  1. `earlyRead`: when the requested mode differs from the displayed one, read `document.activeElement` and the DOM order of the open submenus while the old mode's classes are still on the page, and plan. Entering accordion changes nothing (accordion sections are in flow and may be open together). Entering drilldown or dropdown with focus inside the root: the open submenus whose items contain the focused control stay open and the others close; entering drilldown also closes the submenu whose own row holds focus, that is, its toggle or, for a Hybrid item, its link (the open level would put that row inside an `invisible` level). Entering drilldown with focus outside the root keeps the first open submenu per level (a drilldown shows one level, and a pre-opened current section is the drilldown's way of showing it). Entering dropdown with focus outside the root closes every submenu (an overlay nobody is using must not cover the page; Foundation's DropdownMenu never opened a submenu from a static `is-active`). Focus inside a drilldown back item when leaving drilldown is recorded for the refocus below.
  2. `write`: set the displayed mode and apply the plan in the same phase, so the next change-detection pass renders the new mode and the pruned Open path together. No render ever shows the new mode's classes over submenus that are about to close, so the focused control never sits in a hidden subtree and no engine-specific blur timing is relied on.
  The same callback handles a resize, a `rules` change, and the first-render swap. It commits the swap itself, so reading the live breakpoint in `earlyRead` is allowed (building-blocks 1.5, the second place focus may be recorded).
- Refocus after a swap: focus stays on the same node in every case but one. When focus was inside a drilldown back item and the new mode hides back items, an `afterNextRender` registered by the swap's `write` phase moves focus, after the render that applied the swap, to the first control of that level that is not inside the back item (the control a drilldown focuses when it opens a level); the level itself stays open because focus was inside it. Nothing moves focus when it was outside the menu.
- Outputs at a swap: the swap emits nothing of its own. Each submenu the plan closes is a close like any other: its item's `expanded` model emits `false` (so a consumer's two-way binding agrees with the page) and the new live mode emits `closed` with the item once its close completes.
- A swap during an animation (an accordion row or a drilldown level still moving): the interrupted phase completes through the Nested menu's fallback timer, or at once when the new mode has no transition, so every output still fires once.
- Standalone and responsive roots differ only in who drives the mode; a responsive menu's Options and per-item API are the roots' own.

Development-mode checks (one `afterNextRender` that exists only under `ngDevMode`, each warning once per instance):

1. The rules give no mode at the Zero breakpoint: "`<mode>` (the smallest rule's) applies below `<breakpoint>`; add a bare mode for the Zero breakpoint".
2. The rules name no valid mode: "`accordion` applies"; the shared parser has already warned about each invalid token.
3. The Zero-breakpoint mode is `dropdown` and the root's static `class` has neither `vertical` nor `<zero breakpoint>-vertical`: a horizontal dropdown bar at 320 CSS px can scroll the page sideways (WCAG 1.4.10).
4. The root's static `class` contains `accordion-menu`, `drilldown`, or `dropdown`: the hosted roots bind these per mode.
5. A static `nfsAccordionMenu`, `nfsDrilldown`, or `nfsDropdownMenu` attribute on the same element.

The Nested menu's checks and the three roots' checks also apply; the Drilldown checks for a missing wrapper or back item run from the first render in which drilldown is the live mode (the Drilldown Menu spec's rule).

### Implementation level and primitives

Implementation level: custom Angular directive over the Nested menu (ADR 0004), which is custom Angular.

- Native platform: Foundation's Menu classes already change orientation per breakpoint in CSS (`.vertical.medium-horizontal`, `.<bp>-vertical`), and they keep doing that here with no script. Container size queries are in the Browser target (Chromium 105, Gecko 110, WebKit 16), but they change styles only: a Mode swap also changes the key table, hover opening, Light dismiss, and the focus handoff, which only script can switch, and Foundation documents its rules as viewport breakpoints (ADR 0005), so container queries are not used as the switch; consumers may use them inside their own content. `:has()` is outside the Browser target.
- `@angular/aria`: no responsive pattern, and its menu and tree patterns apply roles the APG rejects for site navigation (ADR 0004).
- `@angular/cdk`: `MediaMatcher`, through the Breakpoint service only; `Directionality`, `_IdGenerator`, and `hasModifierKey` through the Nested menu.

Primitives: `hostDirectives` with exposed inputs and outputs, `input.required` with an alias, `computed()`, `signal()` for the first-render flag, `inject()` with `{self: true}`, `HostAttributeToken` for the development checks, `afterNextRender` with phases, `NfsMediaQuery.resolve()` with its optional breakpoint argument, `NfsMediaQuery.serverBreakpoint`, `parseNfsBreakpointRules`, and everything the Nested menu and the three roots list for their modes. All are in the Browser target.

Render hooks and effects (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Parsed rules and requested mode | `computed` | Derived read-only state |
| `drive()` hand-off | Constructor | Before the first render, so the server HTML carries the Server breakpoint's mode |
| First-render flag (the requested mode starts following the live breakpoint) | `afterNextRender` with a `write` phase, once | Flips after the first render on the client only; never on the server, so server output stays the Server breakpoint's mode |
| Swap: plan and commit | The Nested menu root's `afterRenderEffect`: `earlyRead` (requested mode, displayed mode, `document.activeElement`, DOM order) and `write` (displayed mode plus pruning) | Focus is read while the old mode's classes still apply, and the new mode and the pruned Open path land in one change-detection pass; not `effect` (runs before render and on the server, and would propagate state between signals), not `afterEveryRender` (would run after every change detection in the application) |
| Refocus off a hidden back item | `afterNextRender` registered by the swap's `write` phase (`earlyRead` picks the target, `write` focuses) | Runs after the render that applied the swap, so it acts on rendered state (building-blocks 1.5); a synchronous `focus()` would target a control the page does not show yet |
| Development checks | `afterNextRender`, only under `ngDevMode` | Once, after the first render, never on the server |
| Classes, ARIA, `inert`, `hidden`, heights, Light dismiss, hover intent, completion | The Nested menu's and the three roots' hooks | Their specs |
| `effect` | Not used | No non-DOM side effect |
| `afterEveryRender` | Not used | Nothing here needs to run after every render |

`injectAsync`: not applicable. Host directives are compiled into the directive, so all three roots' code ships in the entry point whether or not a mode ever goes live; a mode cannot be attached later, so there is nothing to load on demand. The live mode must be known in the first render callback to swap before the first paint of a client-rendered page, a Replayed event must find its handler at once, and the Anchored pane helpers dropdown mode uses are decided eager by their spec. A consumer's `@defer` already splits the whole menu by entry point.

Fallback: none needed. The nested menu prototype carried the shape (three roots, one live) in three engines, and the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) confirmed the swap commit and the first-render strategy in Chromium, Firefox, and WebKit on client-rendered, server-rendered, prerendered, deferred, and client-created instances: no recorded pass showed the new mode over a submenu the swap closes, focus held, and the handoff swap landed in one task with no painted frame. Neither named fallback is adopted: recording the focused control from `focusin`/`focusout` and restoring it after the swap cannot help a control the swap hides, and the Breakpoint service's handoff (ADR 0014), where each instance starts from the service's `current`, re-classed a deferred block during its own hydration and left a static `is-active` section open as a dropdown overlay on a desktop page (that prototype's rows 31 and 32).

### Comparison with Angular Material

Material has no responsive menu and no disclosure navigation menu. Its nearest pieces are `MatMenu` (overlay menus with menu roles) and the navigation schematic, which switches a sidenav's `mode` from `BreakpointObserver` through `toSignal` in consumer code.

| Concern | Material (nearest) | Responsive Menu |
| --- | --- | --- |
| Responsive switch | Consumer code: `toSignal(breakpointObserver.observe(Breakpoints.Handset))`, then bindings on the target | One directive with Foundation's `rules`, resolved from the Breakpoint map through `NfsMediaQuery` |
| Patterns | `MatMenu` only: overlay panes, `menu`/`menuitem` roles, roving `tabindex` | Accordion, drilldown, and dropdown modes of disclosure navigation on one markup, same roles in every mode |
| State across a switch | Whatever the consumer keeps | The Open path holding focus stays open; focus stays on the same control |
| Server | `BreakpointObserver` answers `false` on the server; the consumer's bindings change at hydration | The Server breakpoint's mode, hydrated as sent, swapped in the first render callback |
| Configuration | `MAT_MENU_DEFAULT_OPTIONS` | Each mode's Defaults token |
| Events | `menuOpened`, `menuClosed`, `closed` with a reason | `opened`/`closed` from the live mode with the item |
| Container methods | `closeMenu()` | `collapseAll()`; mode-specific members through the hosted roots' `exportAs` |

Borrowed: the signal-plus-bindings shape of a responsive switch (the schematic), a close-everything method, per-component defaults tokens. Not borrowed: `BreakpointObserver`, `Breakpoints`, overlays, menu roles, roving `tabindex`, typeahead.

### ARIA and keyboard

Pattern: Disclosure Navigation Menu (APG) in every mode, with the hybrid variant for Hybrid items (ADR 0004); the APG's ResponsiveMenu note applies: the `nav` landmark stays constant and focus persists across a swap. The role set never changes, so a swap changes classes, keys, and, in drilldown mode, the Drilldown level names only.

| Element | Semantics | Source |
| --- | --- | --- |
| Wrapper | `nav` with `aria-label` or `aria-labelledby` naming the navigation (never "navigation"); consumer-written; it may carry `nfsDrilldownWrapper` | APG disclosure navigation |
| Root and submenu `ul`, every `li` | Native `list` and `listitem`; no `role`, and no `aria-*` except, in drilldown mode, `aria-labelledby` on each submenu naming its Drilldown level after its parent toggle (Nested menu) | Nested menu |
| Parent toggle | Native `button`, `type="button"`, an `id` in every mode (the consumer's static one, else generated), `aria-expanded`, `aria-controls` = the submenu id, named by its text | Nested menu |
| Hybrid item | `a[href]` that navigates, then the toggle with `.submenu-toggle`, named by its `.submenu-toggle-text` span | Nested menu |
| Drilldown back item | Native `button`, name "Back" plus a visually hidden suffix; `hidden` outside drilldown mode | Drilldown Menu |
| Current page | `aria-current="page"` on its link, consumer-written (Router: `routerLinkActive` plus `ariaCurrentWhenActive="page"`) | APG; Nested menu |
| Closed submenu | `inert`; hidden by the live mode's CSS | Nested menu |
| Hidden drilldown level | Foundation's `invisible`, never `inert` | Nested menu |

Keys: the live mode's table from the Nested menu spec, forwarded by the live root's `keydown` listener; the idle roots handle nothing. Every handler changes state, moves focus, stops propagation, and calls `preventDefault()` last; modifier keys are not handled.

| Key | Accordion mode | Drilldown mode | Dropdown mode |
| --- | --- | --- | --- |
| Tab, Shift+Tab | Native through the open parts | Native through the current level | Native; leaving an open submenu closes it |
| Enter, Space on a toggle | Toggle; focus stays | Open the level; focus to its first control | Toggle; focus stays |
| Escape | Close the innermost section holding focus, focus its toggle; else propagate | Close the level, focus its toggle; at the root level propagate | Close the innermost submenu holding focus, focus its toggle; with focus outside close the topmost; else propagate |
| Down, Up | Next or previous control across levels | Next or previous control in the level | Per orientation and level (Nested menu table) |
| Right, Left | Open or close a section | Right opens a level; Left goes back | Next and previous along a horizontal top level (reading direction); open and close along the Base side |
| Home, End, typeahead | Not offered | Not offered | Not offered |

Focus rules across a swap:

- Focus outside the menu is never moved.
- Focus on a control inside open submenus: those submenus stay open, focus stays on the same node.
- Focus on a toggle whose submenu is open, or on the link of that Hybrid item: entering drilldown closes that submenu (its level would hide the row that holds focus), focus stays; entering dropdown or accordion keeps it open.
- Focus on a top-level control of an item whose submenu is closed: every open submenu closes when entering drilldown or dropdown; focus stays.
- Focus inside a drilldown back item, leaving drilldown: focus moves to the first control of that level that is not inside the back item, in the render after the swap.
- The first-render swap follows the same rules, because server-rendered controls can hold focus before hydration.
- A swap is not announced through a live region (Breakpoint service consumer rule 4): it changes layout, not content.

### WCAG 2.2 AA

Requirements, not recommendations. The Accessibility gate runs axe with the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`; ADR 0018) on every story, in each mode the story shows, closed and open, after animations settle. Each mode's own criteria are met as its spec states; this table adds what the responsive switch touches.

| Criterion | Requirement for the Responsive Menu | Foundation default and what makes it pass | Checked by |
| --- | --- | --- | --- |
| 1.3.1 Info and Relationships | The hierarchy and each toggle's controlled submenu are programmatic in every mode | Native nested lists and `aria-controls`; in drilldown mode each submenu's `aria-labelledby` names its Drilldown level after its parent toggle, and a swap adds or removes it with the mode; the role set is identical in every mode, so no mode leaves roles or states another mode set | Accessibility gate per mode; SSR smoke |
| 1.3.4 Orientation | Content and functions do not depend on orientation | A rotation that crosses a breakpoint swaps the mode, but every mode has the same links, toggles, and Open path | e2e at 640 x 360 and 360 x 640 |
| 1.4.3 Contrast (Minimum) | Link and parent text reach 4.5:1 in every mode | Passes on the page with Foundation's defaults in every mode. Fails for dropdown mode inside Foundation's default Top Bar (3.76:1): a menu whose rules name dropdown and that sits in a `.top-bar` needs a bar background on which `$anchor-color` reaches 4.5:1, for example `$topbar-background: $white;`, which `nfs-dropdown-menu` warns about at compile time (Dropdown Menu spec) | Accessibility gate (`color-contrast`); Sass compile test of that mixin |
| 1.4.4 Resize Text | The Mode swap happens at the width where Foundation's CSS changes the layout, with the user's text size | The Breakpoint service's queries are Foundation's em strings, so a 20 px default font moves `medium` to 800 CSS px for both | e2e in Firefox with the font-size preference at 20 |
| 1.4.10 Reflow | At 320 CSS px (a 1280 px window at 400 percent zoom) no mode makes the page scroll sideways | Zoom reduces the CSS viewport, so the Breakpoint service reports the Zero breakpoint and the menu takes its Zero-breakpoint mode. Required: that mode fits 320 CSS px: drilldown or accordion (both pass with Foundation's defaults), or dropdown only on a vertical root (development check 3). Dropdown mode at any width needs the Dropdown Menu spec's `$dropdownmenu-min-width: min(200px, 45vw);`, which `nfs-dropdown-menu` warns about | e2e at 320 x 640 with every level open; development check |
| 1.4.11 Non-text Contrast | Every arrow reaches 3:1 in every mode the rules name | Passes with Foundation's defaults; each mode's Library mixin stops the compile below 3:1 (unrounded ratio from `color-luminance()`), so every mode the consumer includes is checked | Sass compile tests of the three mixins |
| 1.4.12 Text Spacing | No text is clipped with WCAG's spacing overrides, before or after a swap | Each mode's rule (the accordion clip released once open, the drilldown wrapper re-measured, dropdown submenus unclipped); a swap leaves open submenus settled | e2e with the overrides applied, across a swap |
| 1.4.13 Content on Hover or Focus | Hover-opened content is dismissible, hoverable, and persistent; nothing opens on focus | Dropdown mode's hover intent and Light dismiss (Dropdown Menu spec); hover opens nothing in the other modes; a swap into dropdown with focus outside closes every submenu, so no overlay appears without the user | Story play; e2e with a real mouse |
| 2.1.1 Keyboard | Everything is operable with Tab, Enter, and Space in every mode, before and after a swap | Native buttons and links; the arrow keys are shortcuts of the live mode | Story play |
| 2.1.2 No Keyboard Trap | Focus can always leave the menu | No mode traps focus | e2e Tab sweep |
| 2.4.3 Focus Order | Focus follows DOM order in every mode, and a swap never drops focus to `body` | DOM order is the same in every mode; the swap keeps the focused path open and moves focus only off a back item the new mode hides. Foundation's swap drops focus when the focused control is hidden | Browser-level test; e2e on real resizes; fixture e2e with focus before hydration |
| 2.4.6 Headings and Labels | Every toggle and back button names what it opens or where it goes | The Nested menu's and Drilldown Menu's naming rules, with development warnings | Accessibility gate (`button-name`); browser-level test |
| 2.4.7 Focus Visible | A visible focus indicator in every mode | Each mode's rule (drilldown's inset ring inside the clipping wrapper); the library removes no outline | e2e screenshot per mode |
| 2.4.11 Focus Not Obscured (Minimum) | No open submenu covers the focused control, also right after a swap | Dropdown submenus close when focus leaves them; a swap into dropdown keeps only the submenu focus is in, or none when focus is outside; drilldown levels and accordion sections are in flow | e2e centre hit test after swaps and Tab sweeps |
| 2.5.3 Label in Name | Names contain the visible text | Named from content; no copied `aria-label` | Story play |
| 2.5.8 Target Size (Minimum) | Every toggle, item, and back button at least 24 by 24 CSS px in every mode | Rows are 38 px high and Hybrid toggles 40 px with Foundation's defaults; each mode's mixin stops the compile when a Hybrid toggle setting or a row of its mode is below 24 px | Accessibility gate (`target-size`, on through the `wcag22aa` tag); Sass compile tests |
| 3.2.1 On Focus | Focus alone changes nothing | A swap follows the viewport, never focus | Story play |
| 4.1.2 Name, Role, Value | Names, roles, and `aria-expanded` are right in server HTML and after every swap | Host bindings recompute; a submenu the swap closes reports `aria-expanded="false"` in the same pass; Foundation's leftover attributes cannot occur | Accessibility gate after each swap; SSR smoke |

No Foundation default fails a criterion in accordion or drilldown mode. Dropdown mode brings the two settings of the Dropdown Menu spec, which the library's Storybook already compiles (`$dropdownmenu-min-width: min(200px, 45vw);`, `$topbar-background: $white;`).

### Rendered HTML

Consumer markup, Foundation's docs example with parents as buttons, the `nav` as the Drilldown wrapper, back items, a Hybrid item, and the current page marked:

```html
<nav nfsDrilldownWrapper aria-label="Main">
  <ul class="vertical medium-horizontal menu" nfsResponsiveMenu="drilldown medium-dropdown" (opened)="onOpened($event)">
    <li nfsMenuItem>
      <button nfsSubmenuToggle>Item 1</button>
      <ul class="vertical menu nested" nfsSubmenu>
        <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
        <li nfsMenuItem>
          <button nfsSubmenuToggle>Item 1A</button>
          <ul class="vertical menu nested" nfsSubmenu>
            <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to Item 1</span></button></li>
            <li nfsMenuItem><a href="/1a/i">Item 1A i</a></li>
          </ul>
        </li>
        <li nfsMenuItem><a href="/1b">Item 1B</a></li>
      </ul>
    </li>
    <li nfsMenuItem>
      <a href="/products">Products</a>
      <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Products pages</span></button>
      <ul class="vertical menu nested" nfsSubmenu>
        <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
        <li nfsMenuItem><a href="/products/boards" aria-current="page">Boards</a></li>
      </ul>
    </li>
    <li nfsMenuItem><a href="/about">About</a></li>
  </ul>
</nav>
```

Server HTML at the default Server breakpoint (`small`, drilldown), abbreviated: directive attributes omitted, ids generated and rewritten at hydration because `id`, `aria-controls`, and `aria-labelledby` are all host bindings:

```html
<nav aria-label="Main" class="is-drilldown">
  <ul class="vertical medium-horizontal menu drilldown" jsaction="keydown:;click:;">
    <li class="is-drilldown-submenu-parent">
      <button type="button" id="nfs-submenu-toggle-a1-0" aria-expanded="false" aria-controls="nfs-submenu-a1-0" jsaction="click:;">Item 1</button>
      <ul id="nfs-submenu-a1-0" aria-labelledby="nfs-submenu-toggle-a1-0" inert=""
          class="vertical menu nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">
        <li class="js-drilldown-back" jsaction="click:;"><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
        <li class="is-submenu-item is-drilldown-submenu-item is-drilldown-submenu-parent">
          <button type="button" id="nfs-submenu-toggle-a1-1" aria-expanded="false" aria-controls="nfs-submenu-a1-1" jsaction="click:;">Item 1A</button>
          <ul id="nfs-submenu-a1-1" aria-labelledby="nfs-submenu-toggle-a1-1" inert="" class="vertical menu nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">...</ul>
        </li>
        <li class="is-submenu-item is-drilldown-submenu-item"><a href="/1b">Item 1B</a></li>
      </ul>
    </li>
    <li class="is-drilldown-submenu-parent has-submenu-toggle">
      <a href="/products">Products</a>
      <button type="button" id="nfs-submenu-toggle-a1-2" class="submenu-toggle" aria-expanded="false" aria-controls="nfs-submenu-a1-2" jsaction="click:;">
        <span class="submenu-toggle-text">Products pages</span></button>
      <ul id="nfs-submenu-a1-2" aria-labelledby="nfs-submenu-toggle-a1-2" inert="" class="vertical menu nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">...</ul>
    </li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

- Exactly one mode class on the root. `jsaction` on the root lists `keydown` (the three roots' listeners merge) and `click` (Dropdown Menu's leaf rule, present in every mode), and each toggle and back item carries `click`; links carry none, so a link click before hydration navigates natively. Every toggle carries its `id`, and in drilldown mode every submenu carries `aria-labelledby` resolving to its parent toggle's `id` (its Drilldown level name). No `role`, `aria-hidden`, or inline `style` anywhere; the wrapper's `min-height` arrives after hydration, and only in drilldown mode.

The same page hydrated at 1280 px: hydration claims the drilldown markup as sent; the first render callbacks make the service live and flip the first-render flag; the root's swap callback reads focus (on `body` here), plans nothing to close, and commits `dropdown`; the next pass, in the same tick and before the next paint, renders (every toggle still carries an `id`; no submenu carries `aria-labelledby` outside drilldown mode):

```html
<nav aria-label="Main">
  <ul class="vertical medium-horizontal menu dropdown">
    <li class="is-dropdown-submenu-parent opens-right">
      <button type="button" id="nfs-submenu-toggle-b2-0" aria-expanded="false" aria-controls="nfs-submenu-b2-0">Item 1</button>
      <ul id="nfs-submenu-b2-0" inert="" class="vertical menu nested submenu is-dropdown-submenu first-sub">
        <li class="js-drilldown-back is-hidden" hidden=""><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
        <li class="is-submenu-item is-dropdown-submenu-item is-dropdown-submenu-parent opens-right">...</li>
        <li class="is-submenu-item is-dropdown-submenu-item"><a href="/1b">Item 1B</a></li>
      </ul>
    </li>
    <li class="is-dropdown-submenu-parent has-submenu-toggle opens-right">...</li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

A swap with focus inside: at 1280 px the user opens Item 1 and Item 1A and focuses "Item 1A i", then narrows the window below 640 px. The swap keeps both submenus open and commits `drilldown` in one pass: the wrapper gains `is-drilldown`, the root `drilldown invisible`, Item 1's submenu `is-drilldown-submenu is-active invisible` (a level hidden behind its open child), Item 1A's submenu `is-drilldown-submenu is-active visible`, every submenu gains `aria-labelledby` naming its level after its toggle, the back items lose `hidden`; `aria-expanded="true"` stays on both toggles; focus stays on "Item 1A i"; one observation later the wrapper gets its `min-height`. No output fires.

The current section marked for the phone layout (`class="vertical menu nested is-active"` on the Products submenu): the server HTML at `small` shows the Products level open (the root `invisible`, the submenu `is-active visible` with `data-nfs-shown`, its toggle `aria-expanded="true"`); a desktop client's first-render swap into dropdown with focus outside closes it in the same tick, the toggle reads `aria-expanded="false"`, and `closed` fires once with the Products item.

With `accordion medium-dropdown`, the server HTML at `small` carries `accordion-menu` on the root, `is-accordion-submenu-parent` on parents, and the accordion grid state (`data-nfs-expanded` and `data-nfs-shown` only on open sections); no submenu carries `aria-labelledby`, and no wrapper or back items are needed.

### Animation

Per ADR 0003 and building-blocks 1.6: the directive adds no animation and awaits none; each mode keeps its own mechanism unchanged (the accordion grid on the parent `li`, Foundation's drilldown transform slide, no animation in dropdown mode), with each mixin's reduced-motion override.

- A swap applies classes; a CSS transition runs only where a transitioned property changes on an element that stays rendered. Entering accordion mode gives an open section's `li` a grid whose rows go from `none` to `auto 1fr`, which does not interpolate, so nothing slides. Leaving drilldown removes the element's transition along with its classes. Entering drilldown with a level open moves that level from its dropdown position to Foundation's `.is-drilldown-submenu.is-active` transform with Foundation's `$drilldown-transition` in effect, so the open level slides in once (150 ms with Foundation's settings, 1 ms under reduced motion, none with `nfsAnimationsToken` disabled). That short slide is accepted: suppressing it would need a library attribute and a custom rule for a cosmetic case, and the level is where the user already was.
- No Completion output belongs to a swap. Submenus the swap closes complete in the new mode (Behaviour rules).
- No Motion class, no `animate.enter`/`animate.leave`: nothing is inserted or removed. Nothing animates at hydration, because the hydration render uses the server's classes and the swap comes after it.

### Rendering modes

Per ADR 0008, ADR 0014, ADR 0035, and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the requested mode resolves at the Server breakpoint, so the server HTML carries that mode's root class, every item and submenu class, `aria-expanded`, `aria-controls`, `inert`, the `data-nfs-*` hooks of open submenus, and the Drilldown wrapper and back items in their mode's state, all host bindings on signals that exist at construction (rules 1 and 2). Nothing is measured on the server.
- Every instance starts from the Server breakpoint's mode: the requested mode resolves at the Server breakpoint until the directive's first render callback, then at the live breakpoint, and the Nested menu root's swap callback commits the change. For a full-hydration page this equals the Breakpoint service's handoff. It differs for an instance first rendered after the service went live (a `@defer (hydrate on ...)` block, a plain `@defer` block, a routed layout created after a navigation, an `@if`): such an instance hydrates exactly as the server sent it, or, when client-created, renders the Server breakpoint's mode and swaps in the same tick, never painted. Every change of mode, the first included, therefore goes through the one swap rule: the focused path stays open, the row that holds focus stays visible, and a desktop page never starts with a dropdown submenu open. The cost is a second render in the first tick for client-created instances.
- The first tick on the client: the Breakpoint service goes live in its first `earlyRead`, the first-render flag flips, and the root's swap callback, dirtied after its own `earlyRead` already ran, runs again in the same tick (the synchronisation loop re-runs render hooks while views or hooks are dirty), commits, and the swap renders before the tick ends. A server-rendered page shows the Server breakpoint's layout until the application hydrates, the accepted cost of rendering a breakpoint-gated mode on the server; the Breakpoint service's client-hint recipe removes it for Chromium visitors.
- Before hydration: construction injects, parses nothing yet (the required input arrives with the first update), and hands the requested-mode function to the root; the roots configure; the items register and seed. No `matchMedia`, no DOM read, no focus, no listener outside host metadata (rules 3 to 5). No DOM structure is created: the wrapper, the back items, and the toggles are consumer-written (rule 4).
- Event replay: toggle `click`, back item `click`, and the root's `keydown` replay. Angular replays queued events after `whenStable()`, which is after the first-render swap, and the swap keeps every node, so a toggle clicked before hydration opens its submenu once, in the live mode; a key pressed before hydration is handled by the live mode's key table, which may differ from the layout the user saw (an ArrowDown pressed on a drilldown toggle opens a dropdown submenu when the page hydrated at desktop width), and its trailing `preventDefault()` logs the one accepted error (building-blocks Part 4, Decided item 3). This differs from Responsive Accordion Tabs, whose swap removes the clicked control. Hover (`pointerenter`/`pointerleave` added in code), Light dismiss, and Drilldown's `closeOnClick` document listeners never replay, which is correct because nothing is open by interaction before hydration.
- Hydration boundary: the wrapper, the root, and every item, submenu, toggle, and back item share one boundary (rule 7); a consumer's `@defer` wraps the whole `nav`, never a submenu, because items register with their parent when constructed.
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/responsive-menu` is its own entry point. Inside `@defer (hydrate on viewport)`, `on idle`, `on timer`, or `on immediate`, the menu hydrates as sent and swaps in its first render callback, keeping focus. `hydrate on interaction`: the click that hydrates the block replays onto a toggle that survives the swap, so it opens the submenu in the live mode. `hydrate on hover` in dropdown mode: the first hover only hydrates (its `mouseover` trigger fires, but the `pointerenter` that would open has passed), as the Dropdown Menu spec states. Inside `hydrate never` the menu keeps the Server breakpoint's mode forever: links navigate, toggles do nothing, closed submenus stay closed, so consumers who need every section reachable without JavaScript use Hybrid items. Plain `@defer` renders on the client, starts from the Server breakpoint's mode, and swaps in the same tick.
- Deep links and Router state: nothing here reads the URL. A section open at first paint comes from Foundation's `is-active` marker or a bound `expanded`; bound Router state follows the Accordion Menu spec's rule (bind it in a routed layout, where the value is the same on the server and in the first client render).
- Prerendering: identical to server rendering at the default Server breakpoint; nothing reads a request token (rule 11).
- Zoneless: all state is signals; the fallback timers, hover, and Light dismiss run outside the zone and reach Angular only by writing signals.

### Sass and custom CSS

No library CSS: there is no `nfs-responsive-menu` mixin and the directive declares no `styles`. Each mode's documented custom CSS is its own Library mixin (`nfs-accordion-menu`, `nfs-drilldown`, `nfs-dropdown-menu`), every rule keyed on that mode's root class, so only the live mode's rules match; the consumer includes the mixin of every mode its rules name, after the matching Foundation export mixin. The Sass subsection under Further Notes gives the content ADR 0012 prescribes.

## Testing Decisions

A good test asserts what a user or assistive technology observes: which mode class the root carries, each element's classes and ARIA in that mode, which submenus are open and `inert`, where focus is before and after a swap, what the server HTML contains, how the page looks when it hydrates, and which outputs fired with which item. No test reads a directive's private fields. The Nested menu suite owns its class maps, key tables, completion, and the swap rule on its test root (`nested-menu--mode-swap`); the three root suites own their Options; this suite asserts what the responsive directive adds (resolution, the first-render strategy, the committed swap and its focus rules, the forwarded inputs and outputs, `mode`, `collapseAll()`, the development checks) through the real directive, and Foundation's documented rule combinations. Prior art: the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) suite (three roots as host directives, swaps F1 to F4, server HTML), the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) suite (the per-pass recorder, the per-frame recorder, focus before hydration, deferred and client-created instances, the Hybrid-link case), the [Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md) suite (per-frame mode recorder, focus before hydration with the main bundle held back, incremental hydration), and the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md) harness.

Story ids follow `responsive-menu--<story>`: `responsive-menu--default` (Foundation's docs example, `drilldown medium-dropdown`, with the wrapper on the `nav` and back items), `responsive-menu--accordion-dropdown` (docs `accordion medium-dropdown`), `responsive-menu--drilldown-accordion` (docs `drilldown medium-accordion`), `responsive-menu--mode-swap` (a `rules` control with bare `drilldown`, `dropdown`, and `accordion`), `responsive-menu--rules-object`, `responsive-menu--hybrid`, `responsive-menu--options` (forwarded inputs, `closeOnClick` shared), `responsive-menu--current-section` (a static `is-active` on the current section and an `aria-current` link), `responsive-menu--programmatic` (`mode` printed, `collapseAll()`, `openPath()` and `expandAll()` through the hosted roots, `[(expanded)]`), `responsive-menu--rtl`, and `responsive-menu--fixture` (args: rules, markup variant, open items, direction, alignment; `!autodocs`, for e2e). Layer 1 runs at a 414 px viewport (below `medium`), so play functions choose the mode through bare rules rather than the viewport; viewport sweeps are layer 4's. The library's Storybook compiles Foundation with the Dropdown Menu spec's two settings, which it already carries.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Stack: `@storybook/angular-vite` 10.6 with `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless; inferred `test-storybook`: `npx nx test-storybook <lib>`. Axe: `@storybook/addon-a11y`, `parameters.a11y.test = 'error'`, `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` in the Storybook preview configuration, the enforcing gate; every story runs it closed and open, after animations settle, and again after each mode flip. CSR only; the single home of interaction tests. Steps wait on the root's `opened`/`closed` spies, never on time.

- `responsive-menu--default`: at 414 px the root carries `drilldown` and neither `dropdown` nor `accordion-menu`; the `nav` carries `is-drilldown`; back items are visible; no element has a `role` attribute; clicking Item 1 opens its level (the root gains `invisible`, focus on "Item 1A"), Back returns and refocuses the Item 1 button; `opened` and `closed` each fire once with the item; hovering a toggle opens nothing.
- `responsive-menu--accordion-dropdown`: the root carries `accordion-menu`; two sections open together (`multiOpen` default); Right opens a section with focus staying; no wrapper or back item exists.
- `responsive-menu--drilldown-accordion`: the root carries `drilldown`; the docs markup passes the gate.
- `responsive-menu--mode-swap`: flipping `rules` between `drilldown`, `dropdown`, and `accordion`: with focus on "Item 1A i" inside open Item 1 and Item 1A, every flip keeps both open and focus on the same link (F1, F2); with focus on the open Item 1 toggle, flipping to `drilldown` closes Item 1's submenu and focus stays on the toggle (F3); with the Products submenu open and focus on the Hybrid Products link, flipping from `dropdown` to `drilldown` closes the Products submenu and focus stays on the link; from `accordion` with two sections open and focus in the second, flipping to `dropdown` keeps only the focused one (F4); with focus on the story's own control outside the menu, flipping to `dropdown` closes every submenu and flipping to `drilldown` keeps the first open per level; with focus on a back button, flipping to `dropdown` puts focus on the level's first item; after every flip the root carries exactly one mode class, every toggle's `aria-expanded` matches its submenu, every submenu carries `aria-labelledby` naming its parent toggle in `drilldown` and none in the other modes, the printed `mode` matches the class, closed submenus are `inert`, and a flip that closes nothing emits no output while each closed submenu emits `closed` once.
- `responsive-menu--rules-object`: `{small: 'drilldown', medium: 'dropdown'}`, `drilldown medium-dropdown`, and `medium-dropdown drilldown` all render drilldown at 414 px; `medium-dropdown large-accordion` renders dropdown (the smallest rule's mode) on its vertical root.
- `responsive-menu--hybrid`: in each mode (flipped through `rules`) the Hybrid link keeps its `href` and has no `aria-expanded`, its toggle carries `submenu-toggle` and is named by its span, its item `has-submenu-toggle`, and only one arrow is drawn.
- `responsive-menu--options`: unbound `closeOnClick`: in `dropdown` an outside press closes the open submenu, in `drilldown` it leaves the level open; bound `closeOnClick="true"`: in `drilldown` an outside press returns to the root level; `hoverDelay="200"` opens after the delay in `dropdown`; `multiOpen="false"` in `accordion` closes the open sibling.
- `responsive-menu--current-section`: in `drilldown` the Products level is open at first render with `data-nfs-shown` and its link `aria-current="page"`, and no `opened` fired; flipping to `accordion` keeps it open; flipping to `dropdown` with focus outside the menu closes it, its toggle reads `aria-expanded="false"`, and `closed` fires once.
- `responsive-menu--programmatic`: "Collapse all" calls `collapseAll()` and closes everything in each mode, focus inside a closing submenu landing on its top-level toggle; in `drilldown` a button calling `openPath()` on `#d="nfsDrilldown"` shows the Item 1A level; in `accordion` a button calling `expandAll()` on `#a="nfsAccordionMenu"` opens every section; a checkbox bound with `[(expanded)]` to Item 1 unchecks when a flip closes Item 1.
- `responsive-menu--rtl`: under `dir="rtl"` on a wrapper with CDK's `Dir`, dropdown mode's parents carry `opens-left` and Left opens a nested submenu; accordion mode's Right still opens a section.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Resolution with a fake `MediaMatcher` (the Breakpoint service's seam): each breakpoint against `drilldown medium-dropdown large-accordion`, the same rules written in other orders, the object form, rules with no Zero-breakpoint mode (the smallest rule's mode below it, one warning), an empty rule string (`accordion`, one warning), and `tabs` and `accordion-menu` tokens (the parser's warnings, skipped); a `setInput` of new rules swaps.
- First-render strategy: with `TransferState` seeded `nfsServerBreakpoint: 'small'` and a wide fake viewport, the first render carries `drilldown` and after one `whenStable()` `dropdown`, with no intermediate state left; seeded `large`, the first render carries `dropdown` and nothing swaps; an instance added through `@if` after the service went live renders the Server breakpoint's mode first and the live mode after the same stable.
- Swap atomicity: a `MutationObserver` on the root subtree, drained after each change-detection pass, never records a state in which the root carries the new mode class while a submenu the swap closes is still open; in the F3 case and the Hybrid-link case no record shows the row that holds focus inside an `invisible` level; `document.activeElement` is the same element before and after each swap for F1 to F4 and the Hybrid-link case. Recipe (from the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md)): drain the observer from an `afterEveryRender({earlyRead})` registered with the root environment injector (no view), which runs first in every after-render batch, so each drain covers the change-detection passes since the last batch and its snapshot is what they rendered.
- Swap rule: entering dropdown with focus outside closes all; entering drilldown with focus outside keeps the first open per level in DOM order after an `@for` reorder; entering accordion keeps all; a back item holding focus hands it to the level's first non-back control after one `whenStable()`, never to `body`.
- Outputs: a swap that closes nothing emits nothing; each closed submenu emits `expandedChange(false)` and one `closed` from the new live mode; a consumer's `(opened)` on the responsive `ul` fires once per completion, not once per hosted root.
- A swap during an accordion row transition, with fake timers: the interrupted phase completes through the fallback timer and its output fires once.
- Forwarded inputs, asserted through their effects: `autoHeight` gives the wrapper an inline `height` in drilldown mode; `hoverDelay` reaches hover intent in dropdown mode; `multiOpen` reaches the accordion slot; a bound `closeOnClick` reaches both roots; each root's Defaults token seeds its defaults under a responsive root, and a binding wins.
- Template references: `#m="nfsResponsiveMenu"`, `#d="nfsDrilldown"`, `#a="nfsAccordionMenu"`, and `#dd="nfsDropdownMenu"` resolve on a responsive `ul` under strict templates; `mode` follows the committed swap; `collapseAll()` closes in each mode.
- DI: every item reads one `NfsMenuRoot`; only the live root's key handler acts; no `nfsOpenableToken` is provided; a responsive menu nested in another menu's submenu starts its own tree.
- Drilldown pieces under swaps: the wrapper's classes and heights and the back items' `hidden` follow the displayed mode; with `scrollTop` on, a swap into drilldown with a level open does not scroll the page (a `window.scrollTo` spy).
- Replay-safe handling: a root `keydown` whose `eventPhase` reads 101 and whose `preventDefault` throws changes state, stops propagation (an outer spy sees nothing), and reaches `ErrorHandler` once; a replay-shaped toggle `click` toggles with no error.
- Development warnings: each of checks 1 to 5 fires once for its case and none for correct markup.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which none here does.

- SSR smoke: `renderApplication` over fixtures with the Rendered HTML markup (`drilldown medium-dropdown`, a Hybrid item, back items, a static `is-active` section), `accordion medium-dropdown`, `medium-dropdown large-accordion` on a vertical root, a server provider `{map, serverBreakpoint: 'large'}` for the first fixture, and one inside `@defer (hydrate on interaction)`. Assert `whenStable()` resolves (no pending timers); the HTML matches the Rendered HTML section: exactly one mode class on each root (`drilldown`, `accordion-menu`, `dropdown`, and `dropdown` for the `large` provider), the mode's item and submenu classes, `aria-expanded` and `aria-controls` resolving to an element, an `id` on every toggle, `aria-labelledby` on each submenu only in drilldown mode, resolving to its parent toggle's `id`, `inert` on closed submenus, the static `is-active` section open with `data-nfs-shown` in drilldown mode, the wrapper `is-drilldown` only in drilldown mode, back items `hidden` with `is-hidden` outside drilldown mode, no `role` or `aria-hidden` anywhere, no inline `style`; `jsaction="keydown:;click:;"` on the root, `click:;` on each toggle and back item, none on links; `ngb` and `click:;keydown:;` on the deferred block's root; the `ng-state` script carries `nfsServerBreakpoint`.
- Pure logic, table-driven over the module's mode-resolution function (not public API): rules by breakpoint, before and after the first render callback, with the smallest-rule and empty-rules fallbacks; and the development check 3 predicate (Zero-breakpoint mode and static class).
- Sass compile: `nfs-accordion-menu`, `nfs-drilldown`, and `nfs-dropdown-menu` included together after their Foundation export mixins, with Foundation's defaults plus the Dropdown Menu spec's settings, compile, and every rule they emit has a selector scoped to its own mode's root class (`.accordion-menu`, `.drilldown` or `.is-drilldown`, `.dropdown.menu`), so no rule matches a root that carries another mode's class.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `responsive-menu--fixture` through `mount(storyId, props)`, in Chromium, Firefox, and WebKit:

- Viewport sweeps with `drilldown medium-dropdown large-accordion` at 639, 640, 1023, and 1024 px in both directions: the root's mode class changes exactly at the thresholds; `@axe-core/playwright` with the six tags after every swap.
- Focus on real resizes: F1 to F4, the Hybrid-link case (focus on an open Hybrid item's link, resized from dropdown to drilldown), a back button, and focus outside the menu, each resized across `medium` both ways: focus stays on the same control (or lands on the level's first item for the back button) and is never `body`; after the swap the new mode's keys work at once (Right opens a level in drilldown, moves along the top level in dropdown).
- Reflow (1.4.10): at 320 x 640 in the Zero-breakpoint mode with every level or section opened, `document.documentElement.scrollWidth` equals the viewport width.
- Resize text (1.4.4), Firefox only, with the `font.size.variable.x-western` preference at 20: the swap to dropdown happens at 800 px, not 640 px.
- Orientation (1.3.4): at 640 x 360 and 360 x 640 the same links and toggles are present.
- 2.4.11: after a swap into dropdown with focus inside an open submenu, tabbing onward closes it and every focused control's centre hit-tests to itself; after a swap into dropdown with focus outside, no submenu is shown.
- Reduced motion: under `emulateMedia({reducedMotion: 'reduce'})` a swap into drilldown with a level open shows no intermediate `transform`; without it, once the slide settles, the focused control is on screen and unclipped.
- Text spacing (1.4.12): with WCAG's overrides injected, a swap between drilldown and dropdown with a level open leaves no control cut off.

Against the prerendered fixture app, route `/responsive-menu` with the Rendered HTML markup, a copy with the static `is-active` section, a `@defer (hydrate on viewport)` copy below a spacer, a `@defer (hydrate on interaction)` copy, a `@defer (hydrate never)` copy, and a client-hint route whose server provider renders `large`, prerendered at the default Server breakpoint:

- JavaScript disabled at 1280 px: the drilldown layout is painted (screenshot plus `@axe-core/playwright` on the six tags), closed levels hidden, root links navigate.
- Hydration at 1280 px: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; a per-frame recorder shows exactly one change of the root's mode class and no frame with `drilldown` after the Breakpoint service goes live.
- Hydration at 500 px: no swap, and no difference between the screenshots before and after hydration.
- Focus before hydration with the main bundle held back by `page.route`: focus the Item 1 toggle at 1280 px, release the bundle: focus is still on that toggle and the root carries `dropdown`.
- Pre-hydration click at 1280 px on the Item 1 toggle: after hydration its dropdown submenu opens exactly once and `opened` fires once. A pre-hydration ArrowDown on the focused Item 1 toggle replays through the dropdown key table (opens, focuses Item 1A) with the one accepted `ErrorHandler` log.
- The static `is-active` copy at 1280 px: the server HTML shows the Products level open; after hydration the root carries `dropdown`, every submenu is closed, and `closed` fired once.
- `@defer (hydrate on viewport)`: scrolled into view at 1280 px, the block hydrates as sent (every component hydrated, 0 skipped, `drilldown` still on the root in the hydration frame), then swaps to `dropdown`; a toggle focused before the block hydrated keeps focus.
- `@defer (hydrate on interaction)`: a toggle click hydrates the block and opens the submenu in the live mode.
- `@defer (hydrate never)`: the root keeps `drilldown`, links navigate, toggles do nothing, and no error is logged.
- Client-hint route: at 1280 px the server HTML carries `dropdown` and hydration swaps nothing; at 500 px it swaps to `drilldown`.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA on Firefox and on Chrome, JAWS on Chrome, and VoiceOver on Safari, open Products in `responsive-menu--mode-swap` at the Zero breakpoint, move focus to Boards, cross the medium breakpoint both ways, and confirm focus stays on Boards (NVDA with Firefox may re-read 'Boards, link', and on entering drilldown the level's name 'Products'), that nothing else is announced, that with JAWS the next Down Arrow reads the item after Boards, and that with focus on the open Products toggle entering drilldown announces 'collapsed'.

## Out of Scope

- The item, submenu, and toggle directives, the class maps, key tables, completion, the swap rule's mechanics, and the focus-loss guard: the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), which carries the swap commit this spec relies on (ADR 0035).
- Each mode's Options, outputs, Defaults token, Library mixin, and mode-specific methods: the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), and the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md).
- The title bar that shows and hides a mobile menu: the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md) (Usage examples show both together).
- Container queries as the switch, and rules keyed on a container's width instead of the viewport (ADR 0005).
- A swap animation or a live-region announcement of a swap.
- Loading a mode's code only when its breakpoint first matches (`injectAsync`): host directives are static.
- Opt-in `role="menu"` or `role="tree"` variants (map, Out of scope; ADR 0004).
- Foundation's no-plugin state below the first rule, `data-mutate`, and any generated DOM.
- Mega menus and arbitrary content inside submenus beyond links, back items, and nested lists.
- Runtime theming through custom properties.
- Automated screen-reader output: the manual release test under Testing Decisions covers it ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive `ul[nfsResponsiveMenu]`, `exportAs: 'nfsResponsiveMenu'`, named after the Plugin | ADR 0001; all three modes are directives on the same `ul`; building-blocks 1.3 names plugins without a Structural class after the Plugin | A component rendering the tree per mode (breaks Foundation's markup, rebuilds at every swap and at hydration) |
| D2 | The three roots as host directives, one live through the shared root's `mode` | Host directives are static (the composition guide); the Nested menu spec's D3 and the nested menu prototype's row 5 | Creating directives per mode at runtime (no Angular mechanism on an existing element); an `@switch` over three copies of the `ul` (loses focus, re-renders consumer markup); one merged root host directive (the Nested menu spec's alternative, unproven) |
| D3 | `rules` input under the directive attribute, string or object, parsed by the shared parser, resolved by map order | Building-blocks 1.7 option syntax; Foundation's docs markup carries over as `nfsResponsiveMenu="..."`; typed object form | Foundation's written-order winner and first-hyphen split |
| D4 | No aliases; `tabs` and `accordion-menu` tokens are unknown modes with a warning | Foundation's `MenuPlugins` has exactly three keys; `tabs` is Responsive Accordion Tabs' mode | Accepting the class name `accordion-menu` or `tabs` as aliases (neither exists in Foundation) |
| D5 | Below the smallest rule breakpoint the smallest rule's mode applies, with a warning; no valid rule gives `accordion` | The mode is one the consumer named, so its Library mixin is included; the Nested menu spec's default | Foundation's no-plugin state (parents that open nothing); a fixed `accordion` as in Responsive Accordion Tabs (its closed sections are hidden only by `nfs-accordion-menu`, which a consumer whose rules do not name accordion has not included) |
| D6 | Every input of the three roots exposed under its name; `closeOnClick` shared, each root keeping its default | Foundation's child plugins read every `data-*` on the `ul`; the Dropdown Menu and Drilldown Menu specs' decisions | Only a subset (the Nested menu sketch listed three of Dropdown Menu's seven); renaming one `closeOnClick` |
| D7 | No Defaults token and no plugin token of its own; the three roots' tokens apply | `ResponsiveMenu.defaults = {}`; nothing injects the responsive root | `nfsResponsiveMenuDefaultsToken` holding a default rule string (no Foundation counterpart) |
| D8 | `mode` and `collapseAll()` on the directive; `openPath()`, `currentLevel`, `expandAll()` through the hosted roots' `exportAs` | A mode-agnostic member belongs on the responsive root; mode-specific members keep one owner, and Angular resolves host directive `exportAs` names | Re-declaring every root method on the responsive root |
| D9 | The Nested menu root commits a swap in one render callback: `earlyRead` reads the requested mode, focus, and DOM order under the old classes, `write` sets the displayed mode and prunes together (ADR 0035); entering drilldown closes the submenu whose own row holds focus, its toggle or a Hybrid item's link | Building-blocks 1.5 (the callback that commits the swap records focus); no render shows the new mode over an unpruned Open path, so the row that holds focus (a toggle, or a Hybrid item's link) is never inside an `invisible` level and no engine's blur timing matters; the [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../issues/67-rerun-interchange-replaced-timing.md) asks this spec to take one of its two patterns; confirmed in three engines by the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md), which also found that keeping an open Hybrid item's submenu because its item holds focus puts the focused link inside an `invisible` level and drops focus to `body` | The Nested menu spec's earlier text (the mode followed the breakpoint in change detection and the swap rule pruned in a later callback, after the page already rendered the new mode; the prototype recorded that intermediate pass in every engine); focus recording from `focusin`/`focusout` alone (the named fallback, which cannot restore a control the swap hides) |
| D10 | Entering dropdown with focus outside the menu closes every submenu; entering drilldown keeps the first open per level; entering accordion changes nothing | An overlay nobody is using must not cover the page (1.4.13, 2.4.11); Foundation's DropdownMenu never opened a submenu from a static `is-active`, while a drilldown or accordion shows the pre-opened current section | The Nested menu's "first open per level" for dropdown too (a desktop page loads with a submenu covering content) |
| D11 | Focus inside a drilldown back item moves, after the swap renders, to the level's first non-back control | The back item becomes `hidden`; that control is where a drilldown puts focus when the level opens, and the level stays open because focus was inside it | The level's toggle (moves the user out of the section they were in); no rule (focus lost to `body`) |
| D12 | Every instance starts from the Server breakpoint's mode and follows the viewport from its first render callback (ADR 0035) | Deferred blocks hydrate as sent, client-created instances never paint the wrong mode, and every change, the first included, goes through the swap rule (D10's closed desktop overlays, F3 focus); confirmed in three engines by the swap prototype (D9), whose control on the service's handoff re-classed a deferred block during its hydration and left a static `is-active` section open as a dropdown overlay | The Breakpoint service's handoff, which ADR 0032 expected for class-swapping consumers: client-created and deferred instances would skip the swap rule and could open a dropdown overlay from a static `is-active` or a bound `expanded` |
| D13 | A swap emits nothing of its own; submenus it closes emit `expandedChange` and the live mode's `closed` | Two-way bindings stay true to the page; a close is a close; Foundation's swap emitted child lifecycle events only | A `modeChange` output (the `mode` signal covers it); silent closes (bindings would disagree with the page) |
| D14 | The drilldown slide at a swap into drilldown is accepted | 150 ms of Foundation's own transition, 1 ms under reduced motion; suppression needs a library attribute and rule | A `data-nfs-*` swap hook with `transition: none` |
| D15 | A Replayed event is handled by the live mode after the first-render swap | Replay runs after `whenStable()` and the swap keeps every node, so no click is lost | Delaying the swap until after replay (the page would show the wrong mode longer) |
| D16 | No library CSS; each mode's mixin keyed on its root class | ADR 0012; the Nested menu spec's D20; only the live mode's rules match | An `nfs-responsive-menu` mixin (nothing Foundation cannot express) |
| D17 | Container queries not used as the switch | They change styles only and Foundation's rules are viewport breakpoints (ADR 0005); the orientation part is already Foundation's CSS classes | A `ResizeObserver` on a container driving the mode |
| D18 | No `effect`, no `afterEveryRender`, no `injectAsync` | No non-DOM side effect; host directives are static; the live mode is needed in the first render callback | Lazy mode code on first match |

### Usage examples

```ts
@Component({
  selector: 'app-site-nav',
  imports: [
    NfsResponsiveMenu,
    NfsMenuItem, NfsSubmenu, NfsSubmenuToggle,
    NfsDrilldownWrapper, NfsDrilldownBack,
    RouterLink, RouterLinkActive,
  ],
  template: `
    <nav nfsDrilldownWrapper aria-label="Main">
      <ul class="vertical medium-horizontal menu"
          nfsResponsiveMenu="drilldown medium-dropdown" #menu="nfsResponsiveMenu"
          hoverDelay="100" autoHeight animateHeight
          (opened)="lastOpened.set($event)">
        <li nfsMenuItem>
          <button nfsSubmenuToggle>Products</button>
          <ul class="vertical menu nested" nfsSubmenu>
            <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
            <li nfsMenuItem>
              <a routerLink="/products/boards" routerLinkActive ariaCurrentWhenActive="page">Boards</a>
            </li>
          </ul>
        </li>
        <!-- A Hybrid item: the link navigates, the toggle opens -->
        <li nfsMenuItem>
          <a routerLink="/services">Services</a>
          <button nfsSubmenuToggle hybrid><span class="submenu-toggle-text">Services pages</span></button>
          <ul class="vertical menu nested" nfsSubmenu>
            <li nfsDrilldownBack><button type="button">Back<span class="show-for-sr"> to main menu</span></button></li>
            <li nfsMenuItem><a routerLink="/services/repairs">Repairs</a></li>
          </ul>
        </li>
        <li nfsMenuItem><a routerLink="/about">About</a></li>
      </ul>
    </nav>
    <p class="show-for-sr">Menu shown as {{ menu.mode() }}.</p>
  `,
})
export class AppSiteNav {
  protected readonly lastOpened = signal<NfsMenuItem | null>(null);
  readonly #menu = viewChild.required(NfsResponsiveMenu);

  constructor() {
    // Close whatever is open after each navigation, in any mode.
    inject(Router).events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.#menu().collapseAll());
  }
}
```

An accordion on phones and a dropdown from `medium`, with no Drilldown pieces:

```html
<nav aria-label="Docs">
  <ul class="vertical medium-horizontal menu" nfsResponsiveMenu="accordion medium-dropdown" [multiOpen]="false">
    <li nfsMenuItem>
      <button nfsSubmenuToggle>Guides</button>
      <ul class="vertical menu nested is-active" nfsSubmenu>
        <li nfsMenuItem><a href="/guides/theming" aria-current="page">Theming</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

The Guides section is open on a phone (Foundation's `is-active` marker) and closed on a desktop, where the first-render swap into dropdown closes it.

With Foundation's title bar (markup owned by the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md)):

```html
<div class="title-bar" [nfsResponsiveToggle]="siteMenu" hideFor="medium">
  <button class="menu-icon" type="button" nfsToggle aria-labelledby="menu-title"></button>
  <div class="title-bar-title" id="menu-title">Menu</div>
</div>
<nav class="top-bar" nfsResponsiveToggleMenu #siteMenu="nfsResponsiveToggleMenu" aria-label="Main">
  <div class="top-bar-left" nfsDrilldownWrapper>
    <ul class="vertical medium-horizontal menu" nfsResponsiveMenu="drilldown medium-dropdown">...</ul>
  </div>
</nav>
```

The object form, per-mode defaults, and a different `closeOnClick` per mode:

```ts
readonly rules: NfsBreakpointRules<NfsMenuMode> = {small: 'drilldown', medium: 'accordion', large: 'dropdown'};

bootstrapApplication(App, {
  providers: [
    {provide: nfsDrilldownDefaultsToken, useValue: {closeOnClick: true, autoHeight: true}},
    {provide: nfsDropdownMenuDefaultsToken, useValue: {closeOnClick: false, hoverDelay: 150}},
  ],
});
```

Mode-specific members through the hosted roots on the same element:

```html
<ul class="vertical medium-horizontal menu" nfsResponsiveMenu="drilldown medium-dropdown"
    #menu="nfsResponsiveMenu" #drill="nfsDrilldown">...</ul>
@if (menu.mode() === 'drilldown') {
  <button type="button" (click)="drill.openPath(currentItem())">Show current section</button>
}
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-menu` (`.menu`, `.vertical`, the `.<bp>-horizontal` and `.<bp>-vertical` orientation classes that pair with the rules) and, for each mode its rules name, `foundation-accordion-menu`, `foundation-drilldown-menu`, or `foundation-dropdown-menu`, plus `foundation-visibility-classes` (`invisible`, `visible`, `show-for-sr`) and `foundation-global-styles` (`is-hidden`); a Hybrid item in any mode also needs `foundation-accordion-menu`, which holds Foundation's only `.submenu-toggle` rules, and a menu in a Top Bar needs `foundation-top-bar`. No library CSS; there is no `nfs-responsive-menu` mixin. The documented custom CSS of each mode is that mode's Library mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after its Foundation export mixin: `@include nfs-accordion-menu;` after `foundation-accordion-menu`, `@include nfs-drilldown;` after `foundation-drilldown-menu`, `@include nfs-dropdown-menu;` after `foundation-dropdown-menu`, one for every mode the rules name.

(1) Rules the directive adds: none. The rules it depends on are the Nested menu spec's thirteen, each emitted by its mode's mixin and scoped to that mode's root class (`.accordion-menu`, `.drilldown` or `.is-drilldown`, `.dropdown.menu`), so on a responsive `ul` only the live mode's rules match; they are listed with their reasons in that spec and in the three root specs.

(2) Reused settings, mixins, and functions: through those mixins, the consumer's `$accordionmenu-*`, `$drilldown-*`, `$dropdownmenu-*`, `$dropdown-menu-item-*-active`, `$anchor-color`, `$body-background`, `$global-left`, `$global-right`, `css-triangle()`, `breakpoint()`, `color-luminance()`, and `rem-calc()`. No mixin parameter of its own. Required settings for WCAG 2.2 AA when the rules name dropdown, set by the consumer before Foundation's import and already present in the library's Storybook settings overrides:

```scss
// 1.4.10: a dropdown submenu at most half the page wide fits one side at 320 CSS px.
$dropdownmenu-min-width: min(200px, 45vw);
// 1.4.3, only for menus inside a .top-bar: $anchor-color is 3.76:1 on the default $light-gray bar.
$topbar-background: $white;
```

(3) Custom properties: none. The directive writes none; the Drilldown wrapper's heights are inline styles bound from measurements, and the accordion grid keys on `data-nfs-expanded` and `data-nfs-shown`.

(4) Motion classes: none from `nfs-motion`. Reduced-motion overrides: each mode's mixin shortens the transitions it adds or awaits (the accordion grid, Foundation's drilldown slide, `.is-drilldown.animate-height`), which also covers the drilldown slide at a swap.

(5) What visibly breaks when an include is missing: in a mode whose mixin is missing, that mode's failures appear while it is live and only then (accordion: closed sections show while `inert`; drilldown: unstyled parent buttons and a wrapper that can scroll sideways; dropdown: unstyled parent buttons without arrows and no compile warnings for the width at 320 px and Top Bar contrast), and the compile-time contrast and size checks for that mode are lost. Missing `foundation-menu` loses the orientation classes that pair with the rules.

### Platform features to adopt when the browser target moves

- View Transitions (same-document `startViewTransition`): an animated Mode swap, keyed on the committed `mode` change.
- `:has()`: consumer themes could style the `nav` by live mode (`nav:has(> .dropdown)`) without reading `mode`.
- Everything each mode adopts, from its spec: `popover="auto"` and anchor positioning for dropdown submenus, `<details name>` and `::details-content` for accordion sections, `CloseWatcher` for the drilldown back gesture.
- Container queries stay out as the switch (viewport semantics, ADR 0005).

### Foundation behaviour changed or dropped

- A breakpoint change swaps classes, keys, and, in drilldown mode, the Drilldown level names on the same nodes instead of destroying one plugin and constructing another; the Open path holding focus stays open and focus stays on the same control, where Foundation closed everything and dropped focus to `body` when the focused control was hidden.
- No attribute is left behind by a swap; Foundation's AccordionMenu cleanup left `aria-expanded`, `aria-controls`, `aria-hidden`, and `role="group"` on elements the next plugin never updated.
- Rules resolve by breakpoint order, a bare mode applies from the Zero breakpoint, tokens split at the last hyphen, unknown modes warn and are skipped, and below the first rule the smallest rule's mode applies instead of no plugin.
- A swap into dropdown with focus outside the menu closes every submenu; Foundation's DropdownMenu ignored the `is-active` marker a phone layout used to open the current section, and the library matches that on every entry into dropdown mode.
- Every instance starts from the Server breakpoint's mode, so server HTML and deferred blocks hydrate as sent; the swap happens in the first render callback.
- Per-mode Options are exposed inputs with typed values instead of attributes every child re-read; each mode keeps its own Defaults token.
- The live child's events become `opened` and `closed` with the item from the live mode; `init`, `destroyed`, and the child lifecycle events at every swap disappear.
- `data-mutate` is dropped; the leaked `changed.zf.mediaquery` window listener cannot occur (the Breakpoint service owns its listeners).
- Behaviour that only jQuery makes easy, dropped: destroying and re-initialising a different plugin against the same `ul` at runtime, reading every child Option through `.data()` on each construction, and the `meta.foundation-mq` handshake.
