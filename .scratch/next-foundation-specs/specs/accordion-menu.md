# Spec: Accordion Menu

Ticket: [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA. Built on the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), whose item, submenu, toggle, and toggle-text directives, root handle, key tables, completion timing, and class emission this spec uses as that spec defines them, and on the [Spec: Menu](../issues/85-spec-menu.md), whose Menu directive the root hosts.

## Problem Statement

A developer building an Angular application on Foundation for Sites writes a sidebar or off-canvas navigation as Foundation's vertical `ul.menu` with nested `ul.menu.nested` lists and wants Foundation's Accordion Menu: each section slides open in place under its parent, one or several at a time, with the current section open when the page loads. Foundation does this with a jQuery plugin over its Nest utility. That design leaves the developer with problems an Angular library must not copy:

- The markup is announced as an application menu it is not: Nest puts `role="menubar"` on the root, `role="menuitem"` on every link, and `role="none"` on every item; the plugin then puts `aria-expanded` and `aria-controls` on the `li`, where a `role="none"` item cannot carry them, gives each submenu `role="group"` with `aria-hidden`, and sets `aria-multiselectable` on a `menubar`, which does not support it. Screen reader users hear a menubar and are promised keys it does not have.
- A parent item is an `<a href="#">` whose click is cancelled to slide its submenu, so a section that has its own landing page cannot link to it. The fix, `submenuToggle`, inserts a button after every parent link, and every one of those buttons is named "Toggle menu", so a screen reader user hears the same name for every section.
- Opening and closing are jQuery `slideDown`/`slideUp` with inline `display` and `height`, clicks during a slide are ignored, the duration is a JavaScript Option, and a pre-open section (`.is-active` on its submenu) opens only after the script runs, so the server HTML is not the menu the user sees.
- The keyboard handler is on every `li`: Escape closes every section at once, Right moves focus into the section it opens, and the arrow keys walk links with `:visible` checks.
- Ids for `aria-controls` and `aria-labelledby` are random per page load.
- The markup itself is written with Foundation's classes: `vertical menu accordion-menu` on the root, `menu vertical nested` on every nested list, `is-active` on a submenu to open it at load and on an item to mark the current page, and a `submenu-toggle-text` span inside each toggle. Under the library's class rule the developer writes no Foundation or library class ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)), so each of those needs a directive, a typed input, a bound state, or an ARIA attribute instead, and a class copied from Foundation's docs must not open a section.

A server-rendered Angular application adds more: the open sections, `aria-expanded`, and the hidden state of closed sections must be in the server HTML, nothing may be measured before hydration, a click on a section button before hydration must still open it once the page hydrates, and a deferred block holding the menu must hydrate cleanly.

## Solution

One root directive, `nfsAccordionMenu`, on the outer `ul` the developer already writes. It is the accordion root of the Nested menu: it provides the Menu mode `accordion` to the Nested menu directives the developer puts on the same markup (`nfsMenuItem` on every `li`, `nfsSubmenu` on every nested `ul`, `nfsSubmenuToggle` on the button that opens a section, `nfsSubmenuToggleText` on the hidden name inside a Hybrid item's toggle), binds Foundation's `.accordion-menu`, forwards keys to the accordion key table, and carries the plugin's one behaviour Option, `multiOpen`, with Foundation's default `true`. The root is also a Menu, so it hosts the Menu directive, which binds `.menu` and sets the Menu's Variant classes from typed inputs: `orientation="vertical"` replaces Foundation's `.vertical` ([Spec: Menu](../issues/85-spec-menu.md)); every submenu gets `menu nested vertical` from `nfsSubmenu`. The developer writes no class. The root's `opened` and `closed` outputs report each section once its animation has finished, with the item; `expandAll()` and `collapseAll()` open and close every section.

Every section is Disclosure navigation: native nested lists, a `<button aria-expanded aria-controls>` for each parent, or, when the section has its own page, a Hybrid item (the link, then a toggle button named for that section by its `span[nfsSubmenuToggleText]`), `aria-current="page"` on the current page's link, which the Menu's `nfs-menu` mixin gives Foundation's active look, and no menu or tree roles and no class for the current page. Closed sections are `inert`. A section is open at first paint when its item's `expanded` is bound `true`, and the server HTML already shows it open; a Foundation class copied from Foundation's docs (a pre-open `is-active`, a `vertical` on the root) opens and sets nothing and is reported in development builds.

The slide is CSS: the `nfs-accordion-menu` Library mixin makes each parent `li` a two-row grid whose second row animates from `0fr` to `1fr` while the item carries the library attribute `data-nfs-expanded`, clipped only until the section has opened (`data-nfs-shown`). Its `$duration` parameter replaces `slideSpeed`; reduced motion makes it instant. Everything else the developer sees comes from Foundation's `foundation-accordion-menu` and `foundation-menu` Export mixins and the Menu's `nfs-menu`.

## User Stories

1. As an application developer, I want to put `nfsAccordionMenu` on Foundation's `ul` and the Nested menu directives on its items, so that my Foundation Accordion Menu works without jQuery and without a Foundation class in my template.
2. As an application developer, I want the directive to bind Foundation's `.accordion-menu` and, through the Menu directive it hosts, `.menu`, so that Foundation's accordion menu styles apply without my writing a class.
3. As an application developer, I want Foundation's `is-accordion-submenu-parent`, `submenu`, `is-accordion-submenu`, and `is-accordion-submenu-item` classes, and `menu nested vertical` on every submenu, in the server HTML, so that my CSS applies before any script runs.
4. As an application developer, I want a section's parent to be a button, so that it is announced and operated as a control.
5. As an application developer, I want a section that has its own landing page to keep its link and get a separate toggle, so that the page stays reachable (Foundation's `submenuToggle`).
6. As an application developer, I want each toggle to carry its own name, so that "More Guides pages" and "More Services pages" are told apart.
7. As an application developer, I want `multiOpen` with Foundation's default `true`, so that several sections can be open unless I say otherwise.
8. As an application developer, I want `[multiOpen]="false"` (or `multiOpen="false"`) to close the open sibling section when another one opens, so that only one section per level is open.
9. As an application developer, I want application-wide defaults for `multiOpen` through a Defaults token, so that I set it once.
10. As an application developer, I want `[expanded]="true"` on an item to open its section at first paint, where Foundation's docs add `.is-active` to the submenu, so that the current section is open when the page loads.
11. As an application developer, I want each section's open state as a two-way `expanded` model on its item, so that I can open a section from route data or my own state.
12. As an application developer, I want `opened` and `closed` outputs on the menu that carry the section's item, emitted after the slide, so that I can react to any section with one listener.
13. As an application developer, I want the per-item `opened` and `closed` outputs too, so that I can react to one section.
14. As an application developer, I want `expandAll()` and `collapseAll()` on the menu, so that I can offer "expand all" and "collapse all" buttons.
15. As an application developer, I want `open()`, `close()`, and `toggle()` on each item, so that I can drive one section from code.
16. As an application developer, I want the slide duration set once in Sass, so that timing lives with the rest of my styles.
17. As an application developer, I want a development warning when `multiOpen` is off and several sibling sections are bound open, so that I notice contradictory bindings.
18. As a keyboard user, I want every link and section button in the open parts of the menu in the tab sequence, so that I reach everything with Tab alone.
19. As a keyboard user, I want Enter and Space on a section button to open and close it, so that it works like any disclosure.
20. As a keyboard user, I want Down and Up to move to the next and previous visible link or button across levels, so that I can move quickly through a long menu.
21. As a keyboard user, I want Right to open a closed section and Left to close an open one or the section I am in, so that I can expand and collapse without Tab.
22. As a keyboard user, I want Escape to close the section I am in and put focus on its button, so that I back out one level at a time.
23. As a keyboard user of a menu inside an off-canvas panel, I want Escape to close the open section first and the panel on the next press, so that one key does not throw me out of the navigation.
24. As a keyboard user, I want focus to move to the section button when `collapseAll()` closes the section I am in, so that focus is never lost.
25. As a screen reader user, I want native lists and buttons with `aria-expanded` and `aria-controls`, so that I hear the hierarchy and which sections are open.
26. As a screen reader user, I want the current page's link marked `aria-current="page"`, so that I know where I am.
27. As a screen reader user, I want closed sections out of the accessibility tree, so that I read only what is shown.
28. As a screen reader user, I want no `menubar`, `menuitem`, `group`, or `tree` roles, so that I am not promised keys that do not exist.
29. As a mouse user, I want a click on a section button while it is still sliding to reverse the slide, so that the menu never ignores my click.
30. As a user who prefers reduced motion, I want sections to open and close without a slide, so that motion does not bother me.
31. As a low-vision user, I want the arrows and focus rings to meet the WCAG 2.2 AA contrast minimums with Foundation's defaults, so that I can see which sections are open and where focus is.
32. As a user of text-spacing overrides, I want an open section to grow with its text, so that nothing is clipped.
33. As a user with limited dexterity, I want every toggle and section button at least 24 by 24 CSS px, so that I can hit it.
34. As a user at 320 CSS px width, I want the menu to fit without sideways scrolling, so that I can read it at 400 percent zoom.
35. As a developer who themes the menu, I want the compile to fail when my settings make an arrow fail 3:1 contrast or a toggle or a row fall under 24 px, so that I cannot ship an inaccessible menu by accident.
36. As a developer of a server-rendered application, I want the menu's classes, `aria-expanded`, `inert`, and open sections in the server HTML, so that the first paint is the real menu and hydration changes nothing.
37. As a developer of a server-rendered application, I want a click on a section button before hydration to open it once the page hydrates, so that early clicks are not lost.
38. As a developer of a server-rendered application, I want links in the menu to navigate before hydration, so that navigation never waits for JavaScript.
39. As a developer using incremental hydration, I want to know that the whole menu must sit in one hydration boundary and how it behaves in `hydrate never`, so that I place `@defer` correctly.
40. As a developer of a zoneless application, I want the menu to need no zone, so that it works with zoneless change detection.
41. As a developer of a responsive menu, I want the same directive to be the accordion mode of `nfsResponsiveMenu`, so that one markup serves every breakpoint.
42. As a library maintainer, I want the root's bindings, Options, outputs, methods, server HTML, and Sass asserted at the layer that owns each, so that a regression shows where it happens.
43. As an application developer, I want `orientation`, `expanded`, `simple`, `align`, and `iconPosition` on `nfsAccordionMenu` under the same names and types as on `nfsMenu`, so that Foundation's `class="vertical menu"` becomes one typed attribute and I learn one set of Menu names.
44. As an application developer, I want `span[nfsSubmenuToggleText]` to hold a Hybrid toggle's hidden name, so that the toggle is named without Foundation's `.submenu-toggle-text` class in my template.
45. As an application developer copying Foundation's docs markup, I want a copied Foundation class to open nothing and set nothing, with a development warning naming what to bind instead, so that I migrate quickly.
46. As a low-vision user, I want the current page's link inside an open section to stand out from its neighbours by at least 3:1, so that I can tell where I am without relying on hue.
47. As a developer who themes the menu, I want the compile to fail when my `$accordionmenu-item-background` leaves the current link's fill under 3:1, so that the current page never blends into its neighbours.

## Implementation Decisions

### Foundation contract

Taken from `AccordionMenu.defaults` in Foundation 6.9's plugin source (five Options), the menus inventory, and the docs page. The item, submenu, toggle, key, and class behaviour shared with Drilldown and DropdownMenu is the Nested menu's; this table maps each Foundation feature to where it lives.

| Foundation feature | What it does in 6.9 | Library counterpart |
| --- | --- | --- |
| `data-accordion-menu` on the root `ul` (the docs write `ul.vertical.menu.accordion-menu`: "You probably also want it to be vertical, so add the class `.vertical` as well") | Constructs the plugin, runs `Nest.Feather(menu, 'accordion')` | `ul[nfsAccordionMenu]`, which provides the Nested menu root in Menu mode `accordion`, binds `.accordion-menu`, and hosts the Menu directive; `orientation="vertical"` sets Foundation's `.vertical` |
| `multiOpen` (`true`) | `false` closes every open submenu outside the target's branch on `down()`; mirrored to `aria-multiselectable` | `multiOpen` input, same default, passed to the Nested menu root; an item's `open()` closes its open siblings, which equals Foundation's branch rule while at most one section per level is open; no `aria-multiselectable` |
| `slideSpeed` (`250`) | jQuery slide duration in ms | Dropped option: the `nfs-accordion-menu($duration: 250ms)` mixin parameter (CSS owns timing, building-blocks 1.4) |
| `submenuToggle` (`false`) | Inserts `<button class="submenu-toggle">` after every parent link so the link navigates | Dropped option: the consumer writes the Hybrid item, a link followed by `button[nfsSubmenuToggle][hybrid]`, per section; the toggle binds `.submenu-toggle`; parents without a page are buttons |
| `submenuToggleText` (`'Toggle menu'`) | `title` and visually hidden text of every inserted toggle | Dropped option: the consumer writes `span[nfsSubmenuToggleText]` inside each toggle with a name for that section ("More Guides pages"), which binds Foundation's `.submenu-toggle-text`; no `title` |
| `parentLink` (`false`) | Clones the parent link as the first item of its submenu | Dropped option (building-blocks 1.4): a Hybrid item keeps the parent link where it is; a consumer who wants the link inside the section writes it there |
| `.is-active` on a submenu at load (the docs: "To have a sub-menu already open when the page loads, add the class `.is-active` to that sub-menu") | Opens it during `_init` | Dropped behaviour: the item's `expanded` bound open (`[expanded]="true"`), open in server HTML; no directive reads the class, and a copied one is stripped and reported (Nested menu; building-blocks 1.4) |
| `showAll()` | `down()` on every submenu, also when `multiOpen` is `false` | `expandAll()`: opens every submenu while `multiOpen` is on; otherwise does nothing and warns in development (Nested menu; CDK's `openAll()` and Aria's `expandAll()` have the same rule) |
| `hideAll()` | `up()` on every submenu | `collapseAll()` |
| `toggle($target)`, `down($target)`, `up($target)` | Per-submenu methods; `toggle` ignored while animating | `toggle()`, `open()`, `close()` on each `NfsMenuItem`; never ignored mid-slide: the grid transition reverses |
| `down.zf.accordionMenu` | After `slideDown` completes, with the submenu | `opened` Completion output on the root with the `NfsMenuItem`, and on the item |
| `up.zf.accordionMenu` | After `slideUp` completes, with the submenu | `closed` Completion output on the root with the `NfsMenuItem`, and on the item |
| `init.zf.accordion-menu`, `destroyed.zf.accordion-menu` | Lifecycle events | None (Angular lifecycle) |
| `destroy()` | Removes inline display, toggles, clones, Nest classes | Angular lifecycle; nothing was generated |
| Keyboard map on every `li` | ENTER/SPACE toggle a link parent, RIGHT open and focus the first child link, LEFT close, UP/DOWN move, ESCAPE `hideAll()` | The Nested menu accordion key table through one root `keydown` listener (ARIA and keyboard); Enter and Space are native button activation |
| ARIA | `menubar`, `menuitem`, `none` from Nest; `aria-expanded`, `aria-controls`, `id` on the `li`; `role="group"`, `aria-labelledby`, `aria-hidden` on submenus; `aria-multiselectable` on the root | Disclosure navigation (ADR 0004): no roles; `aria-expanded` and `aria-controls` on the toggle button; `inert` on closed submenus |
| Sass: `$accordionmenu-*` settings, `.is-accordion-submenu-parent[aria-expanded='true'] > a::after` rotation, `.submenu-toggle` rules | Styles links, arrows, and the inserted toggle | Reused unchanged through `foundation-accordion-menu`; button twins of the link and arrow rules in `nfs-accordion-menu`; the current link's look through the Menu's `nfs-menu` (Sass) |

Dropped options: `slideSpeed`, `submenuToggle`, `submenuToggleText`, `parentLink`, `data-options`. Dropped behaviours: the Nest roles, `aria-multiselectable`, `aria-labelledby` and `aria-hidden` on submenus, `aria-expanded` on the `li`, the generated toggle buttons and their shared "Toggle menu" name and `title`, the parent-link clones, random `GetYoDigits` ids, inline `display`/`height`, the `:animated` click guard, Escape closing every section, and reading a pre-open `.is-active` from the markup.

### CSS class to Angular mapping

Every class on the menu's elements, per building-blocks 1.14 item 2; the consumer writes none ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)). The Accordion Menu declares no Variant input, no Variant registry, and no Variant property of its own: the Menu's Variant inputs are the [Spec: Menu](../issues/85-spec-menu.md)'s, typed there (closed names, and breakpoint keys over `NfsBreakpointClassesOverrides` read back from `--nfs-breakpoint-classes`), and reach the root through `hostDirectives`.

| Foundation markup or class | Kind | Angular | Rationale |
| --- | --- | --- | --- |
| Root `ul[data-accordion-menu]` | Structural (plugin) | `NfsAccordionMenu`, selector `ul[nfsAccordionMenu]`, `exportAs: 'nfsAccordionMenu'` | Named after the Structural class `.accordion-menu` (building-blocks 1.3); an attribute directive on the consumer's `ul` (ADR 0001) |
| `.accordion-menu` | Structural (plugin) | Host class binding on `NfsAccordionMenu`, `true` while the root's Menu mode is `accordion` | Foundation's root class, which its docs write by hand; standalone, the binding is always `true`, so a copied one is redundant, merges, and is not reported (building-blocks 1.4); under a ResponsiveMenu it is stripped outside accordion mode ([Spec: Responsive Menu](../issues/23-spec-responsive-menu.md)) |
| `.menu` on the root | Structural (Menu) | The static host class of `NfsMenu`, hosted by `NfsAccordionMenu` ([ADR 0041](../adr/0041-menu-plugin-roots-host-menu-directive.md)) | A root is always a Menu; `nfsMenu` written beside the root is harmless and adds nothing |
| `.vertical`, `.horizontal`, `.<bp>-vertical`, `.<bp>-horizontal`, `.expanded`, `.<bp>-expanded`, `.simple`, `.align-left`, `.align-right`, `.align-center`, `.icons` with `.icon-*` on the root | Variant (Menu) | `orientation`, `expanded`, `simple`, `align`, `iconPosition`, exposed by `NfsAccordionMenu` from its hosted `NfsMenu` | The Menu spec's inputs, types, and runtime checks; `orientation="vertical"` is the docs' look (D20); `align` also moves Foundation's accordion arrows and nested margin (`.accordion-menu.align-right`) |
| Every `li` | No class of its own | `NfsMenuItem` (`li[nfsMenuItem]`), Nested menu | Carries the Nest and state classes below and `data-nfs-expanded` |
| `is-accordion-submenu-parent`, `is-submenu-item`, `is-accordion-submenu-item`, `has-submenu-toggle` | State (Nest) | Host class map on `NfsMenuItem` (Nested menu) | Nest's classes from the Menu mode; the map holds every class the family binds on an item, so a copied one is stripped |
| Nested `ul.menu` | Structural (Menu) | `NfsSubmenu` (`ul[nfsSubmenu]`), Nested menu, hosting `NfsMenu` (static `.menu`) | Carries its id, `inert`, and `data-nfs-shown`; a submenu is always a Menu |
| `.nested`, `.vertical` on a nested `ul` | Variant (Menu), constant here | Bound `true` by `NfsSubmenu` in every mode; no input | Foundation's docs write both on every accordion submenu; a submenu exposes only the Menu's `align` and `iconPosition` |
| `submenu`, `is-accordion-submenu`; `is-active` while open | State | Host class map on `NfsSubmenu` (Nested menu) | Nest's classes and the open state; a copied pre-open `is-active` is stripped and reported naming `[expanded]` |
| Parent `a[href="#"]` | No class | `button[nfsSubmenuToggle]`, Nested menu | Disclosure button (building-blocks 1.10) |
| `.submenu-toggle` (Foundation's generated toggle) | Structural | `button[nfsSubmenuToggle][hybrid]` binds it; the item binds `.has-submenu-toggle` (Nested menu) | The Hybrid item |
| `.submenu-toggle-text` span | Structural | `NfsSubmenuToggleText`, `span[nfsSubmenuToggleText]`, static host class (Nested menu) | Foundation's visually hidden name holder inside the Hybrid item's toggle (ADR 0039 names it) |
| `.is-active` on the current page's `li` | State, not bound | None: the current page is `aria-current` on its link, styled by `nfs-menu` with Foundation's `menu-state-active` ([ADR 0042](../adr/0042-menu-current-page-aria-current.md)) | `.is-active` is the open state in the Nested menu; a copied current-page `is-active` is stripped by the item's map and reported naming `aria-current` |
| `.menu-text` on a text item | Structural (Menu) | `li[nfsMenuText]` (the Menu spec), with or without `nfsMenuItem` | An item with no link |
| (none) `data-nfs-expanded` on a parent `li`; `data-nfs-shown` on a submenu | Attributes, not classes | Host attribute bindings of the Nested menu | The accordion grid's hooks (Animation; ADR 0033) |

### Hierarchy and DI shape

```
ngx-foundation-sites/accordion-menu   (secondary entry point)
  NfsAccordionMenu            ul[nfsAccordionMenu], exportAs 'nfsAccordionMenu'
    providers: nfsMenuRootProviders('accordion')         -> nfsMenuModeToken = NfsMenuRoot
    hostDirectives: {directive: NfsMenu,
                     inputs: ['orientation', 'expanded', 'simple', 'align', 'iconPosition']}
    injects: nfsMenuModeToken {self: true}, nfsAccordionMenuDefaultsToken {optional: true}
    constructor: root.configure('accordion', {multiOpen, opened, closed})
  nfsAccordionMenuDefaultsToken : InjectionToken<NfsAccordionMenuDefaults>
  NfsAccordionMenuDefaults    {multiOpen?: boolean}

ngx-foundation-sites/nested-menu      (the consumer imports these from here)
  li[nfsMenuItem]  ul[nfsSubmenu]  button[nfsSubmenuToggle]  span[nfsSubmenuToggleText]
  nfsMenuModeToken, nfsMenuRootProviders, NfsMenuRoot, nfsMenuBehaviourDefaults

ngx-foundation-sites/menu             (hosted; the consumer imports NfsMenuText only if it writes a text item)
  NfsMenu (hosted by the root and by every ul[nfsSubmenu]), li[nfsMenuText]

composed by (another spec):
  ul[nfsResponsiveMenu]  hostDirectives: NfsAccordionMenu (inputs: multiOpen; outputs: opened, closed), ...;
                         one NfsMenu for the element through its three roots
```

- One directive, no component: the menu is consumer markup that Foundation's CSS already styles (ADR 0001, ADR 0004).
- The root handle is the Nested menu's `NfsMenuRoot`, created by `nfsMenuRootProviders('accordion')` in the root element's injector, which also re-provides `NfsSubmenu` as `null` so an accordion menu nested in another menu starts its own tree. `inject(nfsMenuModeToken, {self: true})` reads it; under `nfsResponsiveMenu` the host's own provider wins on the same element, so the accordion root reads the shared root whose mode the responsive root drives.
- Hosting the Menu ([ADR 0041](../adr/0041-menu-plugin-roots-host-menu-directive.md); the Menu spec, D5): the root lists `NfsMenu` in `hostDirectives` and exposes its five Variant inputs under their own names, the same list as every menu Plugin root, so `.menu` and its Variants have one owner; the root binds no `.menu` itself. The Nested menu root handle's factory reads the hosted Menu with `inject(NfsMenu, {self: true})` (for the dropdown Base side; accordion mode reads nothing from it), so a root that hosted none would fail at construction. Under `nfsResponsiveMenu` one `NfsMenu` serves the element, with the input maps merged by Angular 22.0's host-directive de-duplication, and `nfsMenu` written beside the root is not an error; the Menu ticket measured both, and the [Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md) measured an accordion root hosting it in a server render.
- The root's `expanded` input (the Menu's `.expanded` Variant: items share the row) and an item's `expanded` model (its open state) are different inputs on different elements.
- No plugin token (`nfsAccordionMenuToken`): nothing injects the accordion root; items read the Nested menu's token (the Dropdown spec's D2 reasoning).
- Not an Openable: the menu provides no `nfsOpenableToken`, so a bare `nfsClose` on a link inside a menu inside an off-canvas panel closes the panel (Nested menu D22).
- `nfsAccordionMenuDefaultsToken`: Shape B, all-optional, injected `{optional: true}` to seed the `multiOpen` default (building-blocks 1.4); a missing value falls back to `nfsMenuBehaviourDefaults.accordion.multiOpen`, Foundation's `true`. It holds no Menu Variant (a Defaults token never holds a Variant input's default, building-blocks 1.4).
- The entry point exports only the accordion root, its Defaults token, and its interface. The Nested menu directives are imported from their own entry point, as the Triggers are for the Dropdown pane, and the Menu directive arrives hosted, so every symbol has one owner.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsAccordionMenu` calls `nfsDirectiveCheck('NfsAccordionMenu', {children: ['NfsMenuItem']})`, the probe the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) requires of every menu root, and its hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)); it has no parent check, because its injections are `self`, no peers, and `strictParents` changes nothing.

### API

```ts
interface NfsAccordionMenuDefaults {
  multiOpen?: boolean;                                   // Foundation default true
}
const nfsAccordionMenuDefaultsToken: InjectionToken<NfsAccordionMenuDefaults>;

class NfsAccordionMenu {                                 // ul[nfsAccordionMenu], exportAs 'nfsAccordionMenu'
  readonly multiOpen: InputSignalWithTransform<boolean, unknown>; // true
  readonly opened: OutputRef<NfsMenuItem>;
  readonly closed: OutputRef<NfsMenuItem>;
  expandAll(): void;
  collapseAll(): void;
}
// hostDirectives: NfsMenu with inputs orientation, expanded, simple, align, iconPosition
```

| Member | Kind | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `multiOpen` | `input()`, `booleanAttribute` | `boolean` | `true` (Defaults token, else `nfsMenuBehaviourDefaults.accordion.multiOpen`) | `data-multi-open` | Passed to the Nested menu root as a function; a change applies to the next open and closes nothing already open (Foundation's timing); no `aria-multiselectable` |
| `orientation`, `expanded`, `simple`, `align`, `iconPosition` | Inputs of the hosted `NfsMenu`, exposed through `hostDirectives` | The Menu spec's aliases: `NfsMenuOrientationInput`, `NfsMenuExpandedInput`, `NfsVariantBoolean` (through `nfsVariantBoolean`), `NfsMenuAlign`, `NfsMenuIconPosition` | `undefined` or `false`: no class | `.vertical`, `.<bp>-horizontal`, `.expanded`, `.simple`, `.align-*`, `.icons` with `.icon-*` | Typed, transformed, and checked by the Menu spec; `orientation="vertical"` is Foundation's docs look; `align` also flips Foundation's arrow side and nested margin; the root has no read API for them: the hosted `NfsMenu` exposes them as its inputs (`align()`) |
| `opened` | `output()` | `NfsMenuItem` | | `down.zf.accordionMenu` | Completion output: after the item's grid transition ends (or at once without one), once per open, with the item instead of the submenu element; never for the first-paint state |
| `closed` | `output()` | `NfsMenuItem` | | `up.zf.accordionMenu` | Completion output after the close transition, once per close; nested sections closed along with their parent each emit their own `closed` |
| `expandAll()` | method | | | `showAll()` | Delegates to `NfsMenuRoot.expandAll()`: opens every submenu while `multiOpen` is on; with it off, does nothing and warns in development |
| `collapseAll()` | method | | | `hideAll()` | Delegates to `NfsMenuRoot.collapseAll()`; focus inside a closing section moves to the top-level toggle that contained it |

Host: `[class.accordion-menu]` bound to `root.mode() === 'accordion'` and `(keydown)` bound to `root.handleKeydown($event, 'accordion')`. Host directives: `NfsMenu` with the five inputs above. The root is `protected`, as a template-and-host member (AGENTS.md member visibility). The constructor calls `root.configure('accordion', {multiOpen: this.multiOpen, opened: (item) => this.opened.emit(item), closed: (item) => this.closed.emit(item)})`; the Nested menu root calls the completion functions only while `accordion` is the live mode, so under a ResponsiveMenu the outputs stay silent in the other modes.

Per-section API, used as the Nested menu defines it (not repeated here): `NfsMenuItem` with its `expanded` model, `opened`/`closed`, `open()`/`close()`/`toggle()`; `NfsSubmenu` with its `id` input and the hosted Menu's `align` and `iconPosition`; `NfsSubmenuToggle` with its `hybrid` input; `NfsSubmenuToggleText`, which has none. In accordion mode an item's `open()` closes its open siblings only while `multiOpen` is off, and `close()` closes the open sections inside it first. An item's `open()` does not open its closed ancestors (Foundation's `down()` did not either); a section deep in the tree is opened by opening each item on its Open path, outermost first, or by binding `expanded` on each.

Behaviour rules the root adds:

- Bound open sections and `multiOpen` off: Foundation's `_init` ran `down()` on every pre-open submenu in turn, so with `multiOpen` off only the last one stayed open. The library keeps every section bound open at first render open, because the server HTML must show the state the consumer bound and a close after hydration would move content under the reader; in development the root warns once when, at first render, `multiOpen` is off and a level holds more than one expanded item (the Accordion spec's rule for single mode, ADR 0028 consequences).
- Mode: in a standalone menu the mode is always `accordion`. Under `nfsResponsiveMenu` the root binds nothing and handles no key while another mode is live; its input stays bound and applies when accordion mode returns.

Development-mode checks, in one `afterNextRender` that exists only under `ngDevMode`, each warning once per instance: (1) `multiOpen` off with several expanded siblings, as above. The Nested menu's own checks also apply: a copied Foundation class on an item, a submenu, or a toggle, naming what to bind (a pre-open `is-active` names `[expanded]`, a current-page `is-active` names `aria-current`, `submenu-toggle` names `hybrid`), a Hybrid toggle whose name is missing or outside its `span[nfsSubmenuToggleText]`, a span outside a Hybrid toggle, a parent item without a toggle, `expandAll()` with `multiOpen` off, and an item without a root. So does the hosted Menu's check 1: a Menu class copied onto the root, such as Foundation's `vertical`, names `orientation`, while a redundant `menu` is not reported. The root reads no static class and adds no check for a copied `accordion-menu`, which is redundant in a standalone menu (D24).

### Implementation level and primitives

Implementation level: custom Angular directive over the Nested menu (ADR 0004), which is custom Angular. Native first: nested `<details>` would give disclosure without script, but `<details name>` (exclusive groups, `multiOpen` off) and `::details-content` (a selector for the revealed box, needed to animate it) are outside the Browser target, and a `<summary>` can be neither Foundation's parent button with its arrow nor carry a separate link for the Hybrid item. `@angular/aria`'s `ngTree` in `nav` mode is the APG Navigation Treeview: it applies `tree`, `treeitem`, and `group` roles with a roving tab stop, which the APG cautions against for typical site navigation, forces multi-expansion, has no separate toggle for a parent that navigates, and needs `ng-template` groups and `[parent]` inputs that break Foundation's nested `ul` markup; `ngMenu` and `ngMenuBar` apply the `menu` roles the Aria guide itself says to avoid for navigation. Aria's accordion (`ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel`), which the Accordion plugin hosts, is the APG Accordion pattern for page sections, not navigation: every panel becomes a `region` landmark, which the APG advises against when panels are many, as a site menu's sections are; every enabled trigger is a tab stop (as in disclosure navigation), but its group listener handles keys from inside open sections without checking the target: its arrow keys move between triggers only, and Enter and Space toggle a section and are cancelled, so a menu would have to guard Aria's keys off on every level and re-add Foundation's cross-link arrows beside them; the `region` landmark per panel is removable through the Accordion's `region` input, so it is a cost, not a blocker; and each trigger needs a required `[panel]` binding. ResponsiveMenu also needs one directive family across its modes (ADR 0004), so an Accordion Menu on Aria's accordion would be a second implementation of the plugin. `@angular/cdk` has `CdkTree` (the same tree roles, data-driven) and `CdkAccordion` (flat items, no nesting, no disclosure navigation); the Nested menu uses CDK only for `Directionality`, `_IdGenerator`, and `hasModifierKey`.

Primitives: `input()` with `booleanAttribute`, `output()`, host bindings on the root's `mode` signal, `hostDirectives` with the Menu directive, `inject()` with `{self: true}` and `{optional: true}`, one `afterNextRender` for the development check, and everything the Nested menu lists for accordion mode (`inert`, `transitionend`, `getComputedStyle` in a render callback, `focus({preventScroll: true})`, `compareDocumentPosition`, `HostAttributeToken` in development builds only, the grid rule in `nfs-accordion-menu`). `overflow: clip` is not needed here (the drilldown wrapper's rule). All are in the Browser target.

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| `.accordion-menu`, `jsaction` for `keydown` | Host bindings on `root.mode()` | First-paint state in server HTML (building-blocks 1.11 decision 1); a host listener replays |
| `.menu` and the Menu's Variant classes | The hosted `NfsMenu`'s static class and `computed` class record (the Menu spec) | First-paint state in server HTML; no listener |
| `configure()`, Defaults token read | Constructor | Needed before the first render and before replay; reads no DOM and no static class |
| Development check (several expanded siblings) | `afterNextRender`, only under `ngDevMode` | Runs once after every item has registered; reads signals only; never on the server |
| Item classes, `aria-expanded`, `inert`, `data-nfs-*`, focus moves, completion, the arrow keys, the copied-class checks | The Nested menu's host bindings, `afterNextRender`, and `afterRenderEffect` (`read` phase for the computed transition) | That spec's render hooks table |
| `effect` | Not used | The root has no non-DOM side effect |
| `afterRenderEffect` of its own | Not used | The root measures and writes nothing; the items own their completion |
| `afterEveryRender` | Not used | It would run after every change detection in the application for a one-time check |

`injectAsync`: not applicable. Nothing is loaded only after a client interaction: a toggle click and a key must act in the same pass (a Replayed event must find its handler at once), and the plugin is its own entry point, which a consumer's `@defer` already splits.

Fallback: none needed. The [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) ran the accordion mode, its keys, the Hybrid item, and the parent-`li` grid in Chromium, Firefox, and WebKit on this Implementation level; hosting the Menu on a plugin root was measured in Angular 22.2.0 by the Menu ticket and the Nested menu re-run.

### Comparison with Angular Material, CDK, and Aria

Material has no accordion menu. The nearest counterparts are `MatTree`/`CdkTree` (a nested, expandable list), `MatAccordion`/`CdkAccordion` (expandable sections with single or multi expansion), and Aria's `ngTree` with `nav`.

| Concern | `MatTree` / `CdkTree` | `MatAccordion` / `CdkAccordion` | Aria `ngTree` (`nav`) | Accordion Menu |
| --- | --- | --- | --- | --- |
| Pattern and roles | `tree`, `treeitem`, `group` | `role="button"` headers, `region` bodies | `tree`, `treeitem`, `group`, `aria-current` | Disclosure navigation: native lists, buttons with `aria-expanded`/`aria-controls`, links, no roles |
| Structure | Data-driven (`dataSource`, `childrenAccessor`), nodes stamped from templates | Flat panels, no nesting | Consumer markup with `ng-template` groups and `[parent]` inputs | The consumer's nested `ul`, in place, in server HTML |
| Focus | Roving `tabindex`, one tab stop, typeahead | Header key manager with Home/End | Roving or active descendant, typeahead | Every visible link and button in the tab sequence; Foundation's arrow keys as optional shortcuts |
| Multiple open | Any | `multi` (default `false`) | Forced multi in `nav` mode | `multiOpen` (default `true`, Foundation's) |
| Expand and collapse all | `expandAll()`, `collapseAll()` | `openAll()` (only with `multi`), `closeAll()` | Shift+`*` expands siblings | `expandAll()` (only with `multiOpen`), `collapseAll()` |
| Per-node state | `isExpanded` input plus `expandedChange` | `expanded` input plus `expandedChange`; `opened`/`closed`; `afterExpand`/`afterCollapse` | `expanded` model | `expanded` model; `opened`/`closed` after the slide (Nested menu) |
| Container events | None | None | `value` model | `opened`/`closed` with the item |
| A parent that also navigates | Not modelled | Not applicable | Not modelled | Hybrid item |
| Current page | Not modelled | Not applicable | `aria-current` on the current item | `aria-current` on the link, styled by `nfs-menu` |
| Defaults | None | `MAT_EXPANSION_PANEL_DEFAULT_OPTIONS` | None | `nfsAccordionMenuDefaultsToken` |

Borrowed: `expandAll()`/`collapseAll()` with the rule that expanding all needs multi expansion (CDK `openAll()`, Aria `AccordionGroup`), `opened`/`closed` naming, `expanded` as a model, a defaults token. Not borrowed: tree roles, roving `tabindex`, typeahead, data-driven or template-stamped nodes, `afterExpand`/`afterCollapse` as separate outputs (the Completion outputs already fire after the animation).

### ARIA and keyboard

Pattern: Disclosure Navigation Menu (APG), with the hybrid variant for Hybrid items (ADR 0004). The APG's Navigation Treeview example is the opt-in alternative the map ruled out of scope.

| Element | Semantics | Source |
| --- | --- | --- |
| Wrapper | `nav` with `aria-label` or `aria-labelledby` naming the navigation (for example "Docs"), never "navigation"; consumer-written | APG disclosure navigation |
| Root and submenu `ul`, every `li` | Native `list` and `listitem`; no `role`, no `aria-*` | Nested menu |
| Section button (`nfsSubmenuToggle`) | Native `button`, `type="button"`, `aria-expanded`, `aria-controls` = the submenu id; named by its text | Nested menu |
| Hybrid item | `a[href]` that navigates, then the toggle with `.submenu-toggle`, named by its `span[nfsSubmenuToggleText]` ("More Guides pages", the APG example's form) | Nested menu; APG hybrid example |
| Current page | `aria-current="page"` on its link, consumer-written, never a class; `nfs-menu` gives the link Foundation's active look ([ADR 0042](../adr/0042-menu-current-page-aria-current.md)). With the Router, `routerLinkActive` with `ariaCurrentWhenActive="page"` on the link, and `[routerLinkActiveOptions]="{exact: true}"` on a Hybrid item's link, because `RouterLinkActive`'s default subset match would also mark it current on every page of its section (D23). Router's `RouterLinkActive` keeps the server's attribute until the initial navigation has completed, then writes the same value | APG; Nested menu; the Menu spec |
| Closed section | `inert` on the submenu; zero-height grid row | Nested menu; `nfs-accordion-menu` |

Keys, as the Nested menu's accordion mode defines them. Every handler changes state first, then moves focus, then calls `stopPropagation()`, then `preventDefault()` last, and handles nothing with a modifier key held. A "control" is an `a[href]` or `button` inside the root that is not in an `inert` or `hidden` subtree.

| Key | Where | Behaviour |
| --- | --- | --- |
| Tab, Shift+Tab | Anywhere | Native, through every control of the open parts of the menu; closed sections are skipped (`inert`) |
| Enter, Space | Section button or Hybrid toggle | Native `click`: toggles the section; focus stays |
| Enter | Link | Native navigation |
| Down | Any control | Focus the next control in DOM order across levels, skipping closed sections |
| Up | Any control | Focus the previous control, skipping closed sections |
| Right | Toggle of a closed section | Open it; focus stays on the toggle. Otherwise not handled |
| Left | Toggle of an open section | Close it; focus stays |
| Left | Control inside an open section | Close that section; focus its toggle |
| Escape | Toggle of an open section | Close it; focus stays |
| Escape | Control inside an open section | Close the innermost section containing focus; focus its toggle |
| Escape | Elsewhere | Not handled, so it propagates (an enclosing off-canvas panel or Dropdown pane closes on it) |
| Home, End, typeahead | | Not offered (Foundation never had them; APG optional) |

Deltas from Foundation's keys: Right no longer moves focus into the opened section (the section button stays the focus, so Down reaches the first child); Escape closes one level instead of every section; Enter and Space toggle a button natively instead of a cancelled link click. Focus-loss guard (Nested menu): when a close hides the focused control, programmatic closes included, focus moves to the toggle of the section that closed, in the next render.

### WCAG 2.2 AA requirements

Requirements, not recommendations. The Accessibility gate runs axe with the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`; ADR 0018) on every story, closed and with sections open, after the slide has settled. Criteria axe cannot judge are asserted in play functions, the Sass compile test, and e2e. Every ratio below is the exact WCAG relative-luminance formula, computed by the library's internal Sass helper with `math.pow` after compositing a translucent colour over `$body-background`, and compared unrounded; never Foundation's `color-contrast()`, which rounds to one decimal, nor its `color-luminance()`, whose approximate power overstates some ratios (the [Spec: Top Bar](../issues/86-spec-top-bar.md) measured it).

| Criterion | Requirement for the Accordion Menu | Foundation default and what makes it pass | Checked by |
| --- | --- | --- | --- |
| 1.3.1 Info and Relationships | The hierarchy, each section's control relationship, and the current page are programmatic | Native nested lists; `aria-controls` from the submenu id; no roles that contradict the lists; the current page is `aria-current` only, so a visual-only current state cannot be produced (ADR 0042), and a copied `is-active` is stripped and reported | Accessibility gate; SSR smoke |
| 1.3.2 Meaningful Sequence | Reading order matches the visual order | A Hybrid item's toggle follows its link in the DOM and sits at the row's end visually | Story play |
| 1.4.1 Use of Color | The current link inside an open section differs from its neighbours by its filled background, at least 3:1 against the background its neighbour links sit on | Passes with Foundation's defaults: `$menu-item-background-active` (`$primary-color`) is 4.65:1 on `$body-background`. `nfs-menu` stops the compile below 3:1 against `$body-background`; `nfs-accordion-menu` stops it, naming the setting, below 3:1 against `$accordionmenu-item-background` when that is not `null`, because Foundation's `.accordion-menu a` paints every link with it and the current link's rule (specificity 0,2,1) outranks that one (0,1,1), so the pair is the fill against the item background (the Nested menu's Sass checks) | Sass compile test; `accordion-menu--current-page` asserts 3:1 from computed styles |
| 1.4.3 Contrast (Minimum) | Section-button and link text reach 4.5:1 against the row background | Passes with Foundation's defaults: section buttons use `$anchor-color`, the colour Foundation gives menu links (4.65:1 on `$body-background`); a consumer's `$accordionmenu-item-background` applies to links and buttons alike, so both keep one pair; the current link's text against its fill is `nfs-menu`'s check (4.65:1) | Accessibility gate (`color-contrast`) |
| 1.4.10 Reflow | At 320 CSS px the menu needs no horizontal scrolling | Passes with Foundation's defaults: every `li` is `width: 100%`, links and buttons wrap, the Hybrid link keeps a toggle-width margin, each level indents by `$accordionmenu-nested-margin` | e2e at 320 px |
| 1.4.11 Non-text Contrast | Every arrow that shows a section's state reaches 3:1 against what it is drawn on | Passes with Foundation's defaults: `$accordionmenu-arrow-color` is `$primary-color`, 4.65:1 on `$body-background`. `nfs-accordion-menu` stops the compile with `@error` naming the setting when the ratio of `$accordionmenu-arrow-color` against its background is below 3: against `$accordionmenu-item-background` or else `$body-background` (the parent-button arrow, only while `$accordionmenu-arrows` is on) and against `$accordionmenu-submenu-toggle-background` when that is not `null` (the Hybrid toggle's arrow, which Foundation draws whatever `$accordionmenu-arrows` says) | Sass compile test (axe has no 1.4.11 rule) |
| 1.4.12 Text Spacing | Text inside an open section is never clipped with WCAG's spacing overrides | The grid row clips only while collapsed or sliding; once a section has opened (`data-nfs-shown`), `overflow: visible` lets the row grow with its text | e2e with the overrides applied |
| 1.4.13 Content on Hover or Focus | Nothing appears on hover or focus | Not applicable by design: sections open only on click, Enter, Space, the arrow keys, or code; nothing opens on pointer hover or focus | Story play (hover and focus change nothing) |
| 2.1.1 Keyboard | Every section opens and closes, and every link is reachable, with Tab, Enter, and Space alone | Native buttons and links; the arrow keys only add shortcuts | Story play |
| 2.1.2 No Keyboard Trap | Focus can always leave the menu | Nothing traps focus; Tab leaves after the last control | e2e Tab sweep |
| 2.4.3 Focus Order | Focus follows the visible order and never enters a closed section | DOM order; closed sections are `inert`; the focus-loss guard moves focus to the section's toggle when its section closes under focus | Story play; e2e |
| 2.4.6 Headings and Labels | Every toggle's name says which section it opens | Foundation's single "Toggle menu" is dropped; a Hybrid toggle is named by its own `span[nfsSubmenuToggleText]`, and a nameless one, or one whose name sits outside the span, warns in development (Nested menu) | Browser-level test; Accessibility gate (`button-name`) |
| 2.4.7 Focus Visible | Every control shows a visible focus indicator, also inside open sections | Passes with Foundation's defaults: the library removes no outline, and Foundation's `disable-mouse-outline` acts only under what-input's `[data-whatinput='mouse']`, which the library never sets; a collapsed or sliding section clips, but its controls are `inert` then; an open one does not clip | e2e screenshot |
| 2.4.11 Focus Not Obscured (Minimum) | The focused control is never hidden by the menu | Sections open in flow and push later items down; nothing overlays; a section closing under focus hands focus to its visible toggle | e2e hit test of the focused control's centre |
| 2.5.3 Label in Name | A section button's name contains its visible text | Named from its own text content; the library adds no `aria-label` (Foundation's copied `aria-label` is gone) | Story play (accessible name equals the text) |
| 2.5.8 Target Size (Minimum) | Every section button, link, and toggle is at least 24 by 24 CSS px | Passes with Foundation's defaults: rows are 38 px high with `$accordionmenu-padding` (`$global-menu-padding`) and span the menu; a Hybrid toggle is `$accordionmenu-submenu-toggle-width` by `-height`, 40 px. `nfs-accordion-menu` stops the compile with `@error` when either toggle setting is below 24 px, or when a row (`1rem` plus twice the first value of `$accordionmenu-padding` or `$accordionmenu-submenu-padding`, through Foundation's `rem-calc()`) is below 24 px, because row height is a consumer setting and a small padding gives stacked rows under 24 px, where the spacing exception does not apply | Accessibility gate (`target-size`, on through the `wcag22aa` tag); Sass compile test |
| 3.2.1 On Focus | Focus alone changes nothing | Focus never opens, closes, or navigates | Story play |
| 4.1.2 Name, Role, Value | Buttons expose their name, role, and expanded state from the first paint | Native buttons; `aria-expanded` and `aria-controls` are host bindings in server HTML; no `menuitem` or `none` roles, no `aria-expanded` on a `listitem` | Accessibility gate; SSR smoke |

No Foundation default fails a criterion here, so the library's Storybook needs no settings override for this plugin.

### Rendered HTML

Consumer markup, Foundation's docs example with its parents as buttons, a Hybrid item, a section open at first paint, and the current page marked. It carries no class: the root's `menu vertical` come from the hosted Menu and `orientation`, each submenu's `menu nested vertical` from `nfsSubmenu`, and the toggle text's class from `nfsSubmenuToggleText`:

```html
<nav aria-label="Docs">
  <ul nfsAccordionMenu orientation="vertical" (opened)="onOpened($event)">
    <li nfsMenuItem>
      <button nfsSubmenuToggle>Item 1</button>
      <ul nfsSubmenu>
        <li nfsMenuItem>
          <button nfsSubmenuToggle>Item 1A</button>
          <ul nfsSubmenu>
            <li nfsMenuItem><a href="/1a/i">Item 1Ai</a></li>
          </ul>
        </li>
        <li nfsMenuItem><a href="/1b">Item 1B</a></li>
      </ul>
    </li>
    <li nfsMenuItem [expanded]="true">
      <a href="/guides">Guides</a>
      <button nfsSubmenuToggle hybrid><span nfsSubmenuToggleText>More Guides pages</span></button>
      <ul nfsSubmenu>
        <li nfsMenuItem><a href="/guides/theming" aria-current="page">Theming</a></li>
      </ul>
    </li>
    <li nfsMenuItem><a href="/about">About</a></li>
  </ul>
</nav>
```

Server HTML, and the same after hydration before any interaction (directive attributes and static input attributes omitted; class order is not significant; `_IdGenerator` ids differ between server and client and are rewritten at hydration because `id` and `aria-controls` are both host bindings; each toggle carries the `id` the Nested menu binds in every mode):

```html
<nav aria-label="Docs">
  <ul class="menu vertical accordion-menu" jsaction="keydown:;">
    <li class="is-accordion-submenu-parent">
      <button type="button" id="nfs-submenu-toggle-x1-0" aria-expanded="false" aria-controls="nfs-submenu-x1-0" jsaction="click:;">Item 1</button>
      <ul id="nfs-submenu-x1-0" inert="" class="menu nested vertical submenu is-accordion-submenu">
        <li class="is-submenu-item is-accordion-submenu-item is-accordion-submenu-parent">
          <button type="button" id="nfs-submenu-toggle-x1-1" aria-expanded="false" aria-controls="nfs-submenu-x1-1" jsaction="click:;">Item 1A</button>
          <ul id="nfs-submenu-x1-1" inert="" class="menu nested vertical submenu is-accordion-submenu">
            <li class="is-submenu-item is-accordion-submenu-item"><a href="/1a/i">Item 1Ai</a></li>
          </ul>
        </li>
        <li class="is-submenu-item is-accordion-submenu-item"><a href="/1b">Item 1B</a></li>
      </ul>
    </li>
    <li class="is-accordion-submenu-parent has-submenu-toggle" data-nfs-expanded="">
      <a href="/guides">Guides</a>
      <button type="button" id="nfs-submenu-toggle-x1-2" class="submenu-toggle" aria-expanded="true" aria-controls="nfs-submenu-x1-2" jsaction="click:;">
        <span class="submenu-toggle-text">More Guides pages</span></button>
      <ul id="nfs-submenu-x1-2" data-nfs-shown="" class="menu nested vertical submenu is-accordion-submenu is-active">
        <li class="is-submenu-item is-accordion-submenu-item"><a href="/guides/theming" aria-current="page">Theming</a></li>
      </ul>
    </li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

- `jsaction` lists the root's `keydown` (the accordion root has no `click` listener, and the Menu directive declares none) and each toggle's `click`; Angular removes it after hydration. The items' `transitionend` listener is not a replayable type and adds none. No `role`, no `aria-hidden`, no inline `style` anywhere.
- The Guides section is open at first paint from `[expanded]="true"` on its item: the item carries `data-nfs-expanded`, its submenu `is-active` and `data-nfs-shown` (already settled), no `inert`, and no `expandedChange` or `opened` is emitted for it.
- The current page is `aria-current` alone; no `li` carries `is-active`. Foundation's docs markup copied with its classes renders the same, except that the root's copied `vertical` is stripped (bind `orientation`) and a copied pre-open `is-active` opens nothing; development builds report both.

Hydrated, after a click on "Item 1": the first `li` gains `data-nfs-expanded`; its button `aria-expanded="true"`; its submenu drops `inert` and gains `is-active`; the grid row slides open; on `transitionend` for `grid-template-rows` on that `li` the submenu gains `data-nfs-shown` and the root emits `opened` with the Item 1 `NfsMenuItem`. Focus stays on the button.

```html
<li class="is-accordion-submenu-parent" data-nfs-expanded="">
  <button type="button" id="nfs-submenu-toggle-y2-0" aria-expanded="true" aria-controls="nfs-submenu-y2-0">Item 1</button>
  <ul id="nfs-submenu-y2-0" class="menu nested vertical submenu is-accordion-submenu is-active" data-nfs-shown="">...</ul>
</li>
```

After Escape with focus on "Item 1B": the submenu loses `data-nfs-shown` at once (clipping resumes), then `is-active`, and gains `inert`; the `li` loses `data-nfs-expanded`, so the row slides shut; focus moves to the Item 1 button in the next render; `closed` fires with the item after the transition. With `[multiOpen]="false"`, opening Item 1 closes the Guides section the same way, and `closed` (Guides) and `opened` (Item 1) each fire once.

### Animation

Per ADR 0003 and building-blocks 1.6 rule 3, the Nested menu's accordion-mode mechanism, restated for this plugin:

- What moves: the section's height. The `nfs-accordion-menu` mixin makes every `.accordion-menu .is-accordion-submenu-parent` a grid with `grid-template-rows: auto 0fr` and `transition: grid-template-rows $duration ease-in-out`; `[data-nfs-expanded]` sets `auto 1fr`. The first row is the button or the Hybrid link (an absolutely positioned Hybrid toggle takes no grid track), the second is the submenu, which has `min-height: 0; overflow: hidden` until `[data-nfs-shown]` sets `overflow: visible`. This replaces `slideDown`/`slideUp`; `ease-in-out` stands in for jQuery's `swing`.
- Timing: `$duration`, the mixin parameter, default `250ms` (Foundation's `slideSpeed` default), because Foundation's timing was a JavaScript Option with no Sass setting. A consumer who wants another duration for one menu sets `transition-duration` on it in their own CSS, selecting their own class or the root element; completion measures the computed value, so it follows.
- Completion (Nested menu): when a phase starts, the item's `read` phase takes the `li`'s computed `transition-duration` plus `transition-delay` for `grid-template-rows` (or `all`); zero, a missing entry, or `nfsAnimationsToken` `{disabled: true}` completes at once; otherwise the `li`'s own `transitionend` for `grid-template-rows` (a nested section's transition bubbles and is ignored) or a fallback timer of the total plus 100 ms, started outside the Angular zone, completes it. `transitioncancel` is ignored: a click mid-slide reverses the transition, and the reversed one ends with its own `transitionend`.
- On completion of an open, the submenu gains `data-nfs-shown` and `opened` fires on the item and on the root; on a close, `data-nfs-shown` was already removed when the close started, and `closed` fires. At first render an open section is already settled and emits nothing.
- Nested sections: an open section's row is `1fr`, which follows its content, so a nested section sliding open inside it grows it smoothly without a transition of its own. Closing a section closes its open nested sections at the same time; each emits its own `closed`.
- Reduced motion: the mixin sets `transition-duration: 1ms` on the grid under `@media (prefers-reduced-motion: reduce)`, so the change is effectively instant and `transitionend` still fires.
- Disabled animations: with `nfsAnimationsToken` `{disabled: true}` (tests) the item binds `transition: none` on the `li` as the Accordion spec's content wrapper does, so the row snaps while completion reports at once; the Nested menu spec carries this rule (its amendment from this spec's ticket).
- No Motion class and no `animate.enter`/`animate.leave`: nothing is inserted or removed. No `@supports not (grid-template-rows: 0fr)` guard: it tests parsing, never matches in the Browser target, and a browser that parses but does not interpolate simply snaps, which is the correct fallback (Accordion spec D11).
- Nothing animates at hydration: host binding values equal the server's, so no grid value changes when the page hydrates.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: `.accordion-menu`, the hosted Menu's `.menu` and Variant classes, the submenus' `menu nested vertical`, the Nest classes, `aria-expanded`, `aria-controls`, `inert`, `is-active`, `data-nfs-expanded`, and `data-nfs-shown` are host bindings on signals that exist at construction (rule 1), so the server HTML is the menu, and a copied Foundation class is already stripped there. Closed sections are hidden by the grid rule (zero-height row, clipped) and `inert`; Foundation's CSS never hid them (its JavaScript wrote inline `display`), so without the `nfs-accordion-menu` include every section shows (Sass, item 5). Sections open at first paint (`[expanded]="true"`, or a two-way `[(expanded)]` whose value starts `true`) render open and settled. Nothing is measured on the server.
- Open path from the Router: a section bound to Router state must have the same value on the server and in the first client render. Router's `isActive(url, router)` signal (public since 21.1) reads the last successful navigation, which under the default non-blocking initial navigation does not exist yet when the application shell first renders on the client; a shell menu bound to it would close its section at hydration and reopen it after the navigation, sliding twice. Place such a menu in a routed layout component, which is created after the navigation, or bind from route data there (building-blocks 1.11 decision 9). A constant `[expanded]="true"` in a template has no such gap, since its value is the same on both platforms.
- Before hydration: construction injects, configures, and registers only; no directive reads a static class to seed state (building-blocks 1.4), apart from the development-only reads of the copied-class checks, whose warnings wait for the client; focus, `getComputedStyle`, timers, and document access run only in render callbacks and handlers (rules 3 to 5). No DOM structure is created: toggles and their name spans are consumer-written (rule 4), unlike Foundation's inserted buttons.
- Event replay: a section button's `click` replays through the Nested menu toggle's host listener and toggles; it calls no `preventDefault()`. A root `keydown` replays: state changes, focus moves in the following render, `stopPropagation()` runs, and the trailing `preventDefault()` throws, so Angular's `ErrorHandler` logs one error per replayed handled key, the accepted default (building-blocks Part 4, Decided item 3). Links carry no `jsaction` (the root does, for `keydown` only), so a link click before hydration navigates natively. Pointer hover and focus open nothing, so nothing depends on non-replayed events.
- Hydration boundary: the root and every item, submenu, and toggle share one boundary (rule 7); items register with their parent when constructed, so a consumer's `@defer` wraps the whole `nav`, never one section.
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/accordion-menu` and `ngx-foundation-sites/nested-menu` are entry points a consumer's `@defer` splits. Inside a dehydrated block the menu is its server HTML; a click on a section button hydrates the block (`hydrate on interaction`) and replays, opening the section. Inside `hydrate never` the links navigate, sections bound open at first render stay open, closed sections stay closed and `inert`, and the buttons do nothing; a menu whose sections must be reachable without JavaScript does not belong in `hydrate never`. Plain `@defer` renders the menu on the client like any client render.
- ResponsiveMenu: when this root is a host directive of `nfsResponsiveMenu`, the server renders the Server breakpoint's mode and a client at another breakpoint re-classes in the first render callback (the Nested menu and Responsive Menu specs); nothing in this spec changes for it.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; the completion fallback timer runs outside the zone and reaches Angular only by writing signals.

### Sass and custom CSS

The rules come from the Nested menu spec, which assigns them to this plugin's Library mixin, `nfs-accordion-menu($duration: 250ms)`, each scoped to `.accordion-menu` so a ResponsiveMenu matches them only in accordion mode. They are listed with their reasons in the Sass subsection under Further Notes. Every root and submenu is a Menu, so the consumer also includes the Menu's `nfs-menu`, which gives the current link its look (the Menu spec).

## Testing Decisions

A good test asserts what a user or assistive technology observes: which classes and ARIA each element carries, whether a section is `inert`, whether its row is open, where focus is after each key, what the server HTML contains, and which outputs fired with which item. No test reads a directive's private fields. The Nested menu's own suite owns its key tables, class maps, copied-class checks, completion timing, registration, and focus rules on its test root (`nested-menu--accordion`, `nested-menu--accordion-single`, `nested-menu--hybrid`); this suite asserts what the accordion root adds (the root class, the hosted Menu and its five inputs, `multiOpen` and its Defaults token, the aggregate outputs, `expandAll()`/`collapseAll()`, the development check), Foundation's docs markup under the real root, the `nfs-accordion-menu` rules, and the Rendering modes in accordion mode, which the Nested menu's Fixture app route (a drilldown and dropdown root) does not cover. Nothing is written twice. No story, test host, or fixture writes a Foundation or library class, except the copied-markup case of the browser-level test, which says so; controls outside the menu are `button[nfsButton]` at its default size. Prior art: the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) suite (accordion classes, keys, grid height samples, reduced motion, axe per mode), the harness of the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md), and the host-directive probes recorded in the [Spec: Menu](../issues/85-spec-menu.md) ticket and the [Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md).

Story ids follow `accordion-menu--<story>`: `accordion-menu--default` (Foundation's first docs example, parents as buttons), `accordion-menu--nested` (the three-level docs example), `accordion-menu--submenu-toggle` (the docs "Submenu Toggle" example as Hybrid items), `accordion-menu--initially-open` (a nested section bound `[expanded]="true"`), `accordion-menu--single-open` (`multiOpen` off), `accordion-menu--expand-collapse-all`, `accordion-menu--two-way-binding`, `accordion-menu--current-page` (an `aria-current="page"` link inside a section bound open), `accordion-menu--rtl`, `accordion-menu--off-canvas` (the menu inside an open Off-canvas panel), and `accordion-menu--fixture` (args: open items, Hybrid items, depth, `multiOpen`; `!autodocs`, for e2e). Every menu root in a story writes `orientation="vertical"`, as Foundation's docs write `.vertical`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Stack: `@storybook/angular-vite` 10.6 with `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless; inferred `test-storybook`: `npx nx test-storybook <lib>`. Axe: `@storybook/addon-a11y`, `parameters.a11y.test = 'error'`, `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` in the Storybook preview configuration, the enforcing gate; every story runs it with its sections closed and open. CSR only; the single home of interaction tests. Stories that open a section wait for the root's `opened` output, never a timeout.

- `accordion-menu--default`: the root carries `menu`, `vertical`, and `accordion-menu`, and every submenu `menu nested vertical`, from the directives alone; no element has a `role` attribute; a click on "Item 1" sets `aria-expanded="true"`, removes `inert`, adds `is-active` to its submenu and `data-nfs-expanded` to its item, and `opened` fires once with that item; a second click closes it and `closed` fires once; hovering and focusing a section button change nothing (1.4.13, 3.2.1).
- `accordion-menu--nested`: opening Item 1 then Item 1A keeps both open (`multiOpen` default); Right on a closed section button opens it with focus staying (the root forwards keys; the full key table is the Nested menu's story); closing Item 1 with Item 1A open closes both and `closed` fires for each.
- `accordion-menu--submenu-toggle`: each Hybrid item's link keeps its `href` and has no `aria-expanded`; its toggle carries `submenu-toggle`, its item `has-submenu-toggle`, its `span[nfsSubmenuToggleText]` `submenu-toggle-text`, and the toggle's accessible name is its span text, different for each section; a click on the toggle opens the section, a click on the link does not toggle it.
- `accordion-menu--initially-open`: the nested section whose item is bound `[expanded]="true"` is open at first render with `data-nfs-shown`, no `inert`, and its toggle `aria-expanded="true"`; no `expandedChange` or `opened` was emitted; its parent section, not bound, is closed, as Foundation left a pre-open nested submenu under a closed parent.
- `accordion-menu--single-open`: with `multiOpen="false"` (a static string, coerced), opening a second top-level section closes the first, `closed` (first) and `opened` (second) fire once each; switching the arg back to `true` then opening a third leaves the second open.
- `accordion-menu--expand-collapse-all`: an "Expand all" `button[nfsButton]` calls `expandAll()` and every section opens; "Collapse all" with focus inside a nested section closes everything and focus lands on the top-level section button that contained it; with `multiOpen` off, "Expand all" changes nothing.
- `accordion-menu--two-way-binding`: `[(expanded)]` on one item shown in the story; clicks update the bound value; a checkbox bound to it opens and closes the section.
- `accordion-menu--current-page`: `getByRole('link', {current: 'page'})` finds exactly one link, inside a section bound open at first render; its computed background equals `$menu-item-background-active` and differs from a neighbour link's background by at least 3:1, and its text from its background by at least 4.5:1, computed from computed styles; no `li` carries `is-active`, through opening and closing sibling sections.
- `accordion-menu--rtl`: under `dir="rtl"` on a wrapper with CDK's `Dir`, the arrows sit on the left (Foundation's `$global-right`), the Hybrid toggle sits at the row's start, and Right still opens a closed section; in LTR with `align="right"` on the root, which binds `align-right`, the parent-button arrows sit on the left (Foundation's `.align-right` twin, rule 2).
- `accordion-menu--off-canvas`: inside an open Off-canvas panel, written as the [Spec: Off-canvas](../issues/25-spec-off-canvas.md)'s class-free markup, Escape with focus on a link in an open section closes the section and focuses its button, the panel stays open; a second Escape closes the panel; a bare `nfsClose` link in the menu closes the panel, not a section.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- DI: `nfsMenuModeToken` resolves, from an item, to a root in mode `accordion`; `#m="nfsAccordionMenu"` resolves; an accordion menu nested inside another accordion menu's submenu starts its own tree (its items take its classes and do not register with the outer submenu); no `nfsOpenableToken` is provided.
- Hosting: `orientation="vertical"` and `align="right"` bound on `ul[nfsAccordionMenu]` set `vertical` and `align-right` beside one `menu`, and `[orientation]="{small: 'vertical', medium: 'horizontal'}"` sets `vertical medium-horizontal`; each of the five Menu inputs binds under its Menu name (their types and misspelt values are the Menu spec's and the Variant typings check's); `nfsMenu` written beside the root raises no error and yields the same classes; the root's `expanded` input sets the Menu's `expanded` class and opens no section.
- Foundation's docs markup (the one case that writes classes, and says so): Foundation's docs markup with its classes copied (`class="vertical menu accordion-menu"` on the root, `class="menu vertical nested"` on each submenu, `is-active` on one of them, a plain `span` with `class="submenu-toggle-text"` in a Hybrid toggle, `is-active` on a leaf `li`), the library's directives added: the root renders `menu accordion-menu` without `vertical` and warns once naming `orientation`; the submenus render exactly as in the class-free markup, with no warning for their redundant `menu vertical nested`; the `is-active` submenu is closed and `inert` and warns once naming `[expanded]`; the leaf's `is-active` is stripped and warns once naming `aria-current`; the Hybrid toggle warns once naming `span[nfsSubmenuToggleText]`; no warning is emitted during a server render.
- Options: `multiOpen` defaults to `true`; `nfsAccordionMenuDefaultsToken` `{multiOpen: false}` changes the default; a bound or static attribute overrides the token; `multiOpen="false"` coerces; a change from `true` to `false` closes nothing already open and applies to the next open.
- Aggregate outputs with dispatched `transitionend` on the `li` (property `grid-template-rows`, target the `li`): `opened` and `closed` emit the item once each, in order; a nested item's completion emits the nested item; the first-paint state emits nothing; an interrupted open emits only the final state's output.
- Methods: `expandAll()` opens every submenu with `multiOpen` on and does nothing plus one warning with it off; `collapseAll()` closes all and moves focus from a closing section to its top-level toggle in the next render.
- Development check: with `multiOpen` off and two siblings bound `[expanded]="true"`, one warning at first render and both stay open; none with `multiOpen` on, none for one open section per level, none under a driving test root while another mode is live.
- Key forwarding: a Right keydown on a closed section's button opens it through the root's listener; a replay-shaped keydown (`eventPhase` 101, a throwing `preventDefault`) changes state, stops propagation (an outer spy sees nothing), and reaches `ErrorHandler` once.
- Animations disabled: with `nfsAnimationsToken` `{disabled: true}`, the item's `li` carries `transition: none` and `opened` fires in the render callback after the change (the Nested menu's rule).
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which none here does.

- SSR smoke: `renderApplication` over a fixture that writes no class attribute, with the Rendered HTML markup (a three-level menu, a Hybrid item with its `span[nfsSubmenuToggleText]`, a nested section bound open with `[expanded]="true"`, an `aria-current` link), a second menu with `[multiOpen]="false"`, and a menu inside `@defer (hydrate on interaction)`. Assert `whenStable()` resolves (no pending timers); the HTML matches the Rendered HTML section: `menu`, `vertical`, and `accordion-menu` on the root, `menu nested vertical` and the Nest classes on every submenu, `submenu-toggle-text` on the span, `aria-expanded` and `aria-controls` resolving to an element, an `id` on every toggle and no `aria-labelledby` on any submenu (the Drilldown level names belong to drilldown mode), `inert` on every closed submenu and not on the open one, `data-nfs-expanded` and `data-nfs-shown` only on the open section, `is-active` on its submenu and on no `li`, `aria-current` on the current link, no `role` and no `aria-hidden` anywhere, no inline `style`; `jsaction="keydown:;"` on the root (no `click`), `click:;` on each toggle, none on `li` or links; `ngb` and `click:;keydown:;` on the deferred block's root.
- Pure logic, table-driven: the development check's rule (a description of levels and expanded flags, with `multiOpen`, gives warn or not).
- Sass compile test: `nfs-accordion-menu` compiles after `foundation-accordion-menu` with Foundation's defaults and emits the grid, clip, and button rules; `$duration: 400ms` appears in the transition; `$accordionmenu-arrows: false` drops the parent-button arrow rules and keeps the toggle checks; a `$accordionmenu-arrow-color` below 3:1 on `$body-background`, a `$accordionmenu-submenu-toggle-background` below 3:1 with the arrow colour, a 20 px `$accordionmenu-submenu-toggle-width`, and a `$accordionmenu-padding` of `0.2rem 1rem` each stop the compile with an `@error` naming the setting; `$accordionmenu-arrow-color: #116666` on `$accordionmenu-item-background: #0a0a0a` stops the compile (2.94:1 exactly, 3.01:1 through Foundation's `color-luminance()`), which proves the exact helper is used; `$accordionmenu-item-background: $primary-color` with `$accordionmenu-arrows: false` stops the compile naming the 1.4.1 check (`$menu-item-background-active` at 1:1; with the arrows on, the arrow check fails on the same pair, because Foundation's defaults give the arrow and the current fill one colour), and the default `null` item background skips that check.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `accordion-menu--fixture` through `mount(storyId, props)`, in Chromium, Firefox, and WebKit:

- Text spacing (1.4.12): with WCAG's overrides injected (line height 1.5, paragraph spacing 2em, letter spacing 0.12em, word spacing 0.16em) and a three-level section open, every control's box lies inside its submenu's box and no control is cut off (`scrollHeight` not above `clientHeight` on the open submenus).
- Reflow (1.4.10): at a 320 x 640 viewport with three levels and Hybrid items open, `document.documentElement.scrollWidth` equals the viewport width.
- 2.4.11: at 320 px, tabbing through a fully open menu, every focused control's centre hit-tests to itself.
- Real keys through the plugin root: Right opens and Escape from inside a section refocuses its button in all three engines (WebKit's default Tab skips links, so Tab sweeps assert buttons only there).
- Focus ring (2.4.7): a screenshot of a focused link two levels deep shows the engine's focus ring unclipped.

Against the prerendered fixture app, one route with the Rendered HTML markup (no class written) plus a `@defer (hydrate on interaction)` copy and a `@defer (hydrate never)` copy:

- JavaScript disabled: screenshot plus `@axe-core/playwright` on the six tags; top-level items and the section bound open visible, the current link filled, closed sections at zero height and not reachable by Tab.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; no `transitionrun` fires on any `li` during hydration.
- Pre-hydration click with the main bundle held back: a section button clicked before hydration opens its section exactly once after hydration and `opened` fires once; a pre-hydration ArrowRight on a focused section button replays and opens it, with the one accepted `ErrorHandler` log; a link clicked before hydration navigates.
- `@defer (hydrate on interaction)`: a section-button click hydrates the block and opens the section.
- `@defer (hydrate never)`: links navigate, section buttons do nothing, the section bound open stays open, and no error is logged.

## Out of Scope

- The item, submenu, toggle, and toggle-text directives, the root handle, the key tables, completion timing, class emission, the copied-class checks, and the focus-loss guard: the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md).
- The Menu directive (`NfsMenu`, `NfsMenuText`), its Variant inputs, their types and runtime checks, its development checks, and `nfs-menu`: the [Spec: Menu](../issues/85-spec-menu.md). This root hosts it.
- The Menu mode swap and breakpoint rules: the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md), which composes this root.
- The Off-canvas panel, Triggers, and title bar around a mobile menu: their own specs.
- An opt-in Navigation Treeview variant (`role="tree"`, roving `tabindex`, typeahead) for sidebar page trees (map, Out of scope; ADR 0004).
- Opening the Open path to the current page automatically: Foundation has no such Option and the APG disclosure navigation pattern does not require it; the consumer binds `expanded` on each item of the Open path (Usage examples).
- `parentLink` clones, generated toggles, and any generated DOM: the consumer writes every item, the Hybrid item's toggle included, in markup (building-blocks 1.4; ADR 0001).
- Home, End, and typeahead keys: APG optional keys that Foundation's AccordionMenu never had, as the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) rules.
- Arbitrary content in a parent row or a section beyond links, section buttons, and nested lists (mega menus): not a Foundation feature; Foundation's menus nest lists of links, and no docs page puts other content in a submenu.
- Runtime theming through custom properties (building-blocks 1.13); the slide duration is a Sass mixin parameter.
- Native `<details name>`, `::details-content`, `:has()`, and `interpolate-size` (out of target; Further Notes).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One root directive `ul[nfsAccordionMenu]`, `exportAs: 'nfsAccordionMenu'`, over the Nested menu directives | ADR 0001, ADR 0004; the Nested menu spec's consumer table; named after the Structural class | A component that renders the tree from data (breaks Foundation's markup and server HTML); an Aria `ngTree` wrapper (tree roles for site navigation) |
| D2 | Disclosure navigation with the hybrid variant; no roles; `aria-expanded` on buttons | APG disclosure navigation and its treeview caution; ADR 0004; Foundation's `menubar`/`none`/`group` set is invalid | APG Navigation Treeview (roving tab stop and tree roles the APG says typical navigation does not need); Foundation's roles |
| D3 | `multiOpen` input with Foundation's `true` default, passed through `configure()` | building-blocks 1.4 keeps Foundation defaults; the Nested menu's behaviour slot | Material's single default (`multi: false`); an input on every item |
| D4 | `slideSpeed` becomes the `nfs-accordion-menu($duration: 250ms)` parameter | CSS owns timing (building-blocks 1.4); Foundation has no Sass setting for it; completion measures the computed value | A `slideSpeed` input writing an inline duration (JavaScript-set timing, overridable only with `!important`) |
| D5 | `submenuToggle` and `submenuToggleText` become consumer markup: a Hybrid item per section, named per section in its `span[nfsSubmenuToggleText]` | No generated DOM before hydration (ADR 0008); one "Toggle menu" name on every toggle does not say which section each opens (2.4.6); the span directive binds Foundation's `.submenu-toggle-text` (ADR 0039) | A boolean that inserts toggles (DOM creation, hydration mismatch); a global text input (the same name everywhere) |
| D6 | Aggregate `opened`/`closed` on the root carry the `NfsMenuItem` | building-blocks 1.4 container outputs carry the item; Foundation's events carried the submenu | Emitting the submenu element; a `{item, expanded}` change event (the item's `expandedChange` already exists) |
| D7 | `expandAll()`/`collapseAll()`; expanding needs `multiOpen` | building-blocks 1.3 names; CDK and Aria rule; Nested menu | Foundation's `showAll()` opening everything with `multiOpen` off (leaves a single-open menu fully open) |
| D8 | Several siblings bound open with `multiOpen` off stay open and warn (revised 2026-09-28: bound, no longer seeded from a class) | Server HTML must show the consumer's state; a close after hydration moves content; ADR 0028's warning precedent | Foundation's "last one wins" at init (a visible close after hydration) |
| D9 | Right opens without moving focus; Escape closes one level | The Nested menu's accordion table; the APG disclosure keys keep focus on the button | Foundation's focus-first-child and close-all |
| D10 | A click mid-slide reverses the slide | The grid transition reverses natively and completion follows `transitionend` | Foundation's `:animated` guard (drops the click) |
| D11 | Grid on the parent `li` keyed on `data-nfs-expanded`, clip released by `data-nfs-shown` | ADR 0033; building-blocks 1.6 rule 3; measured in three engines by the nested menu prototype | A class such as `is-expanded`; a height measured in script |
| D12 | Compile-time `@error` for the arrow against the Hybrid toggle's own background when set, not gated on `$accordionmenu-arrows` | Foundation draws the toggle arrow unconditionally on `$accordionmenu-submenu-toggle-background`; axe has no 1.4.11 rule | Checking only the item background (misses the toggle) |
| D13 | Under `nfsAnimationsToken` the `li` binds `transition: none` | The Accordion spec's rule; otherwise the clip is released while the row still grows | Completing at once while CSS still animates |
| D14 | No plugin token, not an Openable | Nothing injects the root; a bare `nfsClose` in the menu must reach the enclosing panel | `nfsAccordionMenuToken` (unused); providing `nfsOpenableToken` |
| D15 | The entry point exports only the root and its Defaults token | One owner per symbol, as the Triggers for the Dropdown pane | Re-exporting the Nested menu directives |
| D16 | No automatic opening of the current page's section | Not a Foundation Option; not an APG requirement; server-correct state belongs to the consumer's route data or a bound `expanded` | An `openToCurrent` input reading Router state (Router state is late in a shell, sliding at hydration) |
| D17 | No `effect`, no `afterRenderEffect` of its own, no `afterEveryRender`, no `injectAsync` | The root only configures and forwards; its one check runs once after first render | An `effect` for the development check (runs on the server, re-runs on every change) |
| D18 | A row-height compile check beside the arrow and toggle checks (amended 2026-09-26, audit 0005 M1) | 2.5.8 is guaranteed by the Library mixin where settings can fail it (building-blocks 1.10); row height is a consumer setting, and the story gate compiles only the library's own settings (ADR 0022), as the Drilldown Menu spec's D20 found | Relying on the story gate's `target-size` rule (the ticket's decision 38 before this amendment) |
| D19 | The root hosts `NfsMenu` exposing `orientation`, `expanded`, `simple`, `align`, and `iconPosition`; `orientation="vertical"` replaces Foundation's `.vertical` (added 2026-09-28, class rule) | [ADR 0041](../adr/0041-menu-plugin-roots-host-menu-directive.md) and the Menu spec's D5: `.menu` and its Variants get one owner on every list of the menu; the same five inputs as every menu Plugin root; the Nested menu root's factory requires the hosted Menu | The root binding `.menu` and copying the Menu's inputs (five copies of one input set); the consumer writing `nfsMenu` beside the root (still harmless) |
| D20 | No default orientation and no orientation check (added 2026-09-28) | Foundation's docs make `.vertical` optional ("You probably also want it to be vertical"); `.accordion-menu li { width: 100% }` stacks the rows either way; a Variant input sets no class by default (building-blocks 1.4), and under a ResponsiveMenu the Menu's `orientation` belongs to the element, not to one mode | The root binding `.vertical` in accordion mode (a second source of a Menu class, fighting an explicit `orientation` and a ResponsiveMenu's rules object); a development warning without `orientation="vertical"` (a warning for markup that renders correctly) |
| D21 | A section open at first paint is its item's bound `expanded`; Foundation's pre-open `.is-active` is a Dropped behaviour, stripped and reported (added 2026-09-28) | building-blocks 1.4; ADR 0039; the Nested menu's D29; a bound value renders the same on server and client and emits nothing | Keeping the static seed (a class-based second spelling of the state) |
| D22 | The current page is `aria-current` only; `nfs-menu` gives its look; `nfs-accordion-menu` checks the fill against `$accordionmenu-item-background` (1.4.1) (added 2026-09-28) | [ADR 0042](../adr/0042-menu-current-page-aria-current.md); the Nested menu's D32; the current link's rule outranks Foundation's `.accordion-menu a` background, so that is the neighbour pair | `routerLinkActive="is-active"` on a leaf `li` (the published recipe: a Foundation class as an input value, ADR 0039) |
| D23 | A Hybrid item's link uses `[routerLinkActiveOptions]="{exact: true}"` in every Router example (added 2026-09-28) | `RouterLinkActive` defaults to a subset match, so a section's link would carry `aria-current="page"` on every page of its section beside the real current link | The default match (two current links on one page) |
| D24 | No report for a copied `accordion-menu` (added 2026-09-28) | Standalone, the binding is always `true`, so the copy merges like a redundant Structural class (building-blocks 1.4); under a ResponsiveMenu the copy is stripped outside accordion mode, and that spec decides whether its root reports it | A root check through `HostAttributeToken` (a warning for markup that renders correctly) |

### Usage examples

```ts
@Component({
  selector: 'app-docs-nav',
  imports: [
    NfsAccordionMenu, NfsMenuItem, NfsSubmenu, NfsSubmenuToggle, NfsSubmenuToggleText, NfsButton,
    RouterLink, RouterLinkActive,
  ],
  template: `
    <nav aria-label="Docs">
      <ul nfsAccordionMenu orientation="vertical" #menu="nfsAccordionMenu"
          [multiOpen]="false" (opened)="lastOpened.set($event)">
        <!-- A section without a page of its own: the parent is a button -->
        <li nfsMenuItem>
          <button nfsSubmenuToggle>Getting started</button>
          <ul nfsSubmenu>
            <li nfsMenuItem>
              <a routerLink="/install" routerLinkActive ariaCurrentWhenActive="page">Install</a>
            </li>
          </ul>
        </li>

        <!-- A Hybrid item: the link navigates, the toggle opens the section; open when the route is under /guides -->
        <li nfsMenuItem [(expanded)]="guidesOpen">
          <a routerLink="/guides" routerLinkActive [routerLinkActiveOptions]="{exact: true}"
             ariaCurrentWhenActive="page">Guides</a>
          <button nfsSubmenuToggle hybrid><span nfsSubmenuToggleText>More Guides pages</span></button>
          <ul nfsSubmenu>
            <li nfsMenuItem>
              <a routerLink="/guides/theming" routerLinkActive ariaCurrentWhenActive="page">Theming</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <button nfsButton (click)="menu.collapseAll()">Collapse all</button>
  `,
})
export class DocsNav {
  // This component is a routed layout, created after the initial navigation, so the value is the
  // same on the server and in the first client render (Rendering modes).
  readonly #guidesActive = isActive('/guides', inject(Router));
  protected readonly guidesOpen = linkedSignal(() => this.#guidesActive());
  protected readonly lastOpened = signal<NfsMenuItem | null>(null);
}
```

No class is written: `orientation="vertical"` replaces Foundation's `class="vertical menu"`, the Nested menu directives give every submenu `menu nested vertical`, and `ariaCurrentWhenActive="page"` marks the current page, which `nfs-menu` gives Foundation's active look. The Guides link matches exactly, because `RouterLinkActive`'s default subset match would also mark it current on `/guides/theming`, giving the page two current links; `isActive()` keeps its subset match, because the section should be open on every page below it.

A section open at first paint, where Foundation's docs add `is-active` to the submenu:

```html
<ul nfsAccordionMenu orientation="vertical">
  <li nfsMenuItem [expanded]="true">
    <button nfsSubmenuToggle>Item 1</button>
    <ul nfsSubmenu>
      <li nfsMenuItem><a href="/1a">Item 1A</a></li>
    </ul>
  </li>
</ul>
```

A one-way `[expanded]="true"` renders the section open on the server and in the browser and emits nothing; the user can still close it, because the binding re-applies only when its value changes.

Application-wide defaults:

```ts
bootstrapApplication(App, {
  providers: [{provide: nfsAccordionMenuDefaultsToken, useValue: {multiOpen: false}}],
});
```

Inside an Off-canvas panel (markup owned by that spec; `position="left"` stands for Foundation's `.position-left`, whose input the [Re-run: Off-canvas spec under the class rule](../issues/117-rerun-off-canvas-class-rule.md) names): Escape closes the open section first and the panel on the next press; a bare `nfsClose` on a link closes the panel.

```html
<div nfsOffCanvas #nav="nfsOffCanvas" position="left" id="offCanvasNav">
  <nav aria-label="Main">
    <ul nfsAccordionMenu orientation="vertical">
      <li nfsMenuItem>
        <button nfsSubmenuToggle>Products</button>
        <ul nfsSubmenu>
          <li nfsMenuItem><a routerLink="/products/boards" nfsClose>Boards</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</div>
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-menu` (`.menu`, `.vertical`, `.nested`) and `foundation-accordion-menu` (`.accordion-menu` padding and borders, the link arrows and their `.align-left`/`.align-right` twins, and the only `.submenu-toggle`, `.has-submenu-toggle`, and `.submenu-toggle-text` rules, which the Hybrid item uses). Every root and submenu is a Menu, so the consumer also includes the Menu's `@include nfs-menu;` after `foundation-menu`, which gives the current link (`aria-current`) Foundation's active look through `menu-state-active`, the look Foundation's CSS keys on an `.is-active` no consumer writes (the [Spec: Menu](../issues/85-spec-menu.md)). Its documented custom CSS is the `nfs-accordion-menu` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-accordion-menu`: `@include nfs-accordion-menu;` or `@include nfs-accordion-menu($duration: 200ms);`. The rules are those the Nested menu spec assigns to this mixin (its rules 1 to 5 and 12, accordion parts), each scoped to `.accordion-menu`.

(1) Rules:

| # | Selector | Declarations | Reason |
| --- | --- | --- | --- |
| 1 | `.accordion-menu li > button:not(.submenu-toggle)`, and inside `.is-accordion-submenu` | `display: block; width: 100%; line-height: 1; text-align: start; color: $anchor-color; cursor: pointer; padding: $accordionmenu-padding`, background `$accordionmenu-item-background` when not `null`; `padding: $accordionmenu-submenu-padding` for buttons inside a submenu | Section parents are buttons (ADR 0004); Foundation's `menu-base` and `.accordion-menu a` rules style only links, and its button reset leaves a `<button>` inline and unpadded |
| 2 | Gated on `$accordionmenu-arrows`: `.accordion-menu .is-accordion-submenu-parent:not(.has-submenu-toggle) > button` (`position: relative`) and its `::after`; `[aria-expanded='true']::after`; the `.align-left`/`.align-right` twins | `css-triangle($accordionmenu-arrow-size, $accordionmenu-arrow-color, down)` at Foundation's position (`top: 50%`, `margin-top` of half the size, `$global-right: 1rem`); `transform: rotate(180deg); transform-origin: 50% 50%` when expanded | Foundation draws the arrow on `> a::after` and keys the rotation on the `li`'s `aria-expanded`, which the library moves to the button; the twins follow the root's `align`, which sets `.align-left` or `.align-right` |
| 3 | `.accordion-menu .is-accordion-submenu-parent` | `display: grid; grid-template-rows: auto 0fr; transition: grid-template-rows $duration ease-in-out` | Replaces `slideDown`/`slideUp`; Foundation's Sass has no height rule and its JavaScript wrote inline `display` |
| 4 | `.accordion-menu .is-accordion-submenu-parent[data-nfs-expanded]` | `grid-template-rows: auto 1fr` | The open row (ADR 0033: Foundation has no class for this state on the `li`) |
| 5 | `.accordion-menu .is-accordion-submenu-parent > .is-accordion-submenu`, then `...[data-nfs-shown]` | `min-height: 0; overflow: hidden`; then `overflow: visible` | Clips only while collapsed or sliding, so focus rings (2.4.7) and text spacing (1.4.12) inside an open section are not cut off |
| 6 | Inside `@media (prefers-reduced-motion: reduce)`: rule 3's selector | `transition-duration: 1ms` | Reduced motion for the one transition this mixin adds and the items await (building-blocks 1.6 rule 5); `transitionend` still fires |

Checks (no CSS output): `@error` naming the setting when the ratio of `$accordionmenu-arrow-color` against `$accordionmenu-item-background`, or else `$body-background`, is below 3 while `$accordionmenu-arrows` is on; when `$accordionmenu-submenu-toggle-background` is not `null` and the ratio of `$accordionmenu-arrow-color` against it is below 3, whatever `$accordionmenu-arrows` says (1.4.11); when `$accordionmenu-submenu-toggle-width` or `$accordionmenu-submenu-toggle-height` is below 24 px (2.5.8); when `1rem` plus twice the first value of `$accordionmenu-padding` or `$accordionmenu-submenu-padding`, converted with `rem-calc()`, is below `rem-calc(24)` (2.5.8, rows at line height 1; amended 2026-09-26, audit 0005 M1); and when `$menu-item-background-active`, the current link's fill, is below 3:1 against `$accordionmenu-item-background` while that is not `null` (1.4.1; the Nested menu's check, added 2026-09-28 under the class rule; `nfs-menu` checks the fill against `$body-background`). Each ratio is the exact WCAG relative-luminance formula, computed by the library's internal helper with `math.pow` after compositing a translucent colour over `$body-background`, and compared unrounded, from the consumer's values; never Foundation's `color-contrast()`, which rounds to one decimal and lets 2.95:1 pass, nor its `color-luminance()`, whose approximate power passes pairs the exact formula fails (revised 2026-09-28 after the [Spec: Top Bar](../issues/86-spec-top-bar.md) measured it).

(2) Reused settings, mixins, and functions: `$anchor-color`, `$accordionmenu-padding`, `$accordionmenu-submenu-padding`, `$accordionmenu-item-background`, `$accordionmenu-arrows`, `$accordionmenu-arrow-size`, `$accordionmenu-arrow-color`, `$accordionmenu-submenu-toggle-background`, `$accordionmenu-submenu-toggle-width`, `$accordionmenu-submenu-toggle-height`, `$menu-item-background-active`, `$body-background`, `$global-right`, `css-triangle()`, `rem-calc()`, all read from the consumer's compile; the contrast helper is the library's own. One parameter for a value Foundation has no setting for: `$duration`, default `250ms` (Foundation's `slideSpeed` default).

(3) Custom properties: none. The grid keys on `data-nfs-expanded` and `data-nfs-shown`, attributes the Nested menu directives bind (an implementation channel, building-blocks 1.13, and ADR 0033), not a theming API; a consumer who themes the open state targets `[data-nfs-expanded]`.

(4) Motion classes: none from `nfs-motion`. Reduced-motion override: rule 6.

(5) What breaks without the include: every section shows open while its toggle says collapsed and its content is `inert` (Foundation's CSS never hid submenus; its JavaScript wrote inline `display`); section buttons render as inline, unpadded text without arrows; nothing slides; the compile-time contrast and size checks are lost. Without `nfs-menu` the current link has no look at all, since no class marks it; without `foundation-accordion-menu` a Hybrid toggle's `span[nfsSubmenuToggleText]` shows as visible text and the toggle has no box or arrow.

(6) Variant properties: none of its own. The hosted Menu's breakpoint keys on `orientation` and `expanded` are read back from `--nfs-breakpoint-classes`, which `nfs-breakpoint-properties` writes (the Menu spec).

Required settings for WCAG 2.2 AA: none. Foundation's defaults pass every criterion in the WCAG subsection, so neither consumers nor the library's Storybook override a setting for this plugin.

### Platform features to adopt when the browser target moves

- `:has()`: the grid could key on `.is-accordion-submenu-parent:has(> [aria-expanded='true'])` and drop `data-nfs-expanded` without a visible change (ADR 0033 consequences).
- `interpolate-size: allow-keywords` or `calc-size()`: the submenu could animate its own `height` from `0` to `auto`, dropping the parent-`li` grid; `transition-behavior: allow-discrete` could switch `overflow` at the end of the transition and drop `data-nfs-shown`.
- `<details name>` and `::details-content`: nested disclosure without script, and exclusive groups for `multiOpen` off, once a `<summary>` can carry Foundation's parent styling and a Hybrid item's link can sit outside it; it would also make the menu work in `hydrate never`.

### Foundation behaviour changed or dropped

- No `menubar`, `menuitem`, `none`, or `group` roles, no `aria-multiselectable`, no `aria-labelledby` or `aria-hidden` on submenus; `aria-expanded` and `aria-controls` move from the `li` to a button.
- Parents are buttons; a parent with its own page is a Hybrid item; the generated "Toggle menu" buttons and their `title` are replaced by consumer-written toggles named per section; `parentLink` clones are gone.
- Sections slide with a CSS grid transition timed in Sass instead of jQuery `slideDown`/`slideUp` timed by `slideSpeed`; a click mid-slide reverses it instead of being ignored; reduced motion makes it instant.
- A pre-open section is its item's bound `expanded`, open in the server HTML, instead of Foundation's `.is-active` on the submenu read at `_init`; a copied `.is-active` opens nothing and is reported; with `multiOpen` off, several sections bound open on one level stay open with a development warning instead of the last one winning.
- `expandAll()` does nothing while `multiOpen` is off (Foundation's `showAll()` opened everything).
- Right opens without moving focus; Escape closes one level instead of every section; the arrow keys follow visible controls instead of `:visible` jQuery walks.
- `down`/`up.zf.accordionMenu` become `opened`/`closed` carrying the item.
- Ids come from `_IdGenerator` and are rewritten at hydration; consumer ids on submenus win.
- The consumer writes no class ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)): the Menu directive hosted on the root binds `.menu` and the Menu's Variants (`orientation="vertical"` for `.vertical`), `nfsSubmenu` binds `menu nested vertical`, `nfsSubmenuToggleText` binds `.submenu-toggle-text`, and the current page is `aria-current` on its link, never `.is-active` on its item; a Foundation class copied from Foundation's markup is stripped and reported in development builds, except redundant copies (`menu` on any list, `nested` and `vertical` on a submenu, `accordion-menu` on a standalone root), which merge with the directives' own classes.
