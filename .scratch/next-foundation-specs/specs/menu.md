# Spec: Menu

Ticket: [Spec: Menu](../issues/85-spec-menu.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA.

## Problem Statement

A developer building an Angular application on Foundation for Sites writes navigation as Foundation's Menu: a `ul.menu` of `li` elements holding links, turned vertical, expanded, simple, nested, aligned, or given icons by Variant classes (`.vertical`, `.medium-horizontal`, `.expanded`, `.simple`, `.nested`, `.align-right`, `.icons.icon-top`), with `.menu-text` for an item without a link and `.is-active` on the item of the current page. The Menu is a CSS-only component: it ships Sass and classes and no Plugin. The same `ul.menu` is also the root and every submenu of Foundation's menu Plugins (Accordion Menu, Drilldown, Dropdown Menu, Responsive Menu), of the Top Bar's menus, and of Magellan and Smooth Scroll containers.

Under the class rule the developer writes no Foundation or library class ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)), so every one of those classes needs a directive that binds it and typed inputs that set its Variants. Foundation's documented markup also leaves one accessibility gap the library must close: the current page is marked by `.is-active` on its `li`, a purely visual state that assistive technology never hears (WCAG 1.3.1), and a simple menu stacked vertically or wrapped onto a second row puts 16 px tall links against each other, under the 24 px target size (WCAG 2.5.8).

A server-rendered application adds the usual contract: every class must already be in the server HTML, nothing may change at hydration, and links must keep navigating natively before hydration and inside dehydrated or `hydrate never` blocks.

## Solution

Two attribute directives in one entry point. `nfsMenu` on the developer's `ul` binds `.menu` and sets every Menu Variant class from typed inputs: `orientation` (with Breakpoint rules for the responsive forms), `expanded` (with a Breakpoint query), `simple`, `nested`, `align`, and `iconPosition`. `nfsMenuText` on an `li` binds `.menu-text`. Both are host bindings only: no listener, no template, nothing measured, so the server HTML is the final DOM and every rendering mode keeps working as plain HTML.

The current page is marked the accessible way and only that way: `aria-current` on its link, written statically, bound, or set by the Router's `RouterLinkActive` with `ariaCurrentWhenActive="page"`. The library's `nfs-menu` Library mixin gives such a link Foundation's active menu look through Foundation's own `menu-state-active` mixin, so there is no `.is-active` for anyone to write and no way to show a current page that assistive technology does not announce. The same mixin gives simple-menu links a 24 px row and stops the compile when the consumer's settings make the current link or the rows fail WCAG 2.2 AA.

The menu Plugins relate to this directive by hosting it: the Accordion Menu, Drilldown, and Dropdown Menu roots and the Nested menu's submenu list `NfsMenu` in `hostDirectives`, so `.menu` and its Variant inputs have one owner everywhere, and a Responsive Menu, which hosts all three roots, still gets one `NfsMenu` because Angular 22 de-duplicates host directives (measured). Behaviours that may sit on any container, such as Smooth Scroll and Magellan, are written beside `nfsMenu` instead.

## User Stories

1. As an application developer, I want to put `nfsMenu` on a `ul` and get Foundation's `.menu` styling, so that I write no Foundation class.
2. As an application developer, I want a Menu to stay horizontal by default, so that Foundation's default look needs no input.
3. As an application developer, I want `orientation="vertical"`, so that a menu stacks its items as Foundation's `.vertical` does.
4. As an application developer, I want `[orientation]="{small: 'vertical', medium: 'horizontal'}"`, so that a menu stacks on phones and runs horizontally from `medium` up, as Foundation's `.vertical.medium-horizontal` does, without JavaScript.
5. As an application developer, I want a misspelt orientation or breakpoint name to fail to compile, so that I never ship a menu that silently keeps the wrong layout.
6. As an application developer whose Sass adds `xlarge` to `$breakpoint-classes`, I want `{xlarge: 'vertical'}` to compile once my Variant declaration file declares it, so that my Sass settings stay the list of breakpoints.
7. As an application developer, I want `expanded`, so that every item takes an equal share of the row, as Foundation's `.expanded` does.
8. As an application developer, I want `expanded="medium"`, so that items share the row only from `medium` up, as Foundation's `.medium-expanded` does.
9. As an application developer, I want `simple`, so that the menu drops its padding and looks like an inline list, as Foundation's `.simple` does.
10. As an application developer, I want `nested` on a menu inside a menu item, so that it gets Foundation's nested indentation.
11. As an application developer, I want `align="right"` and `align="center"`, so that items line up as Foundation's `.align-right` and `.align-center` do.
12. As an application developer, I want `iconPosition="top"` (or `left`, `right`, `bottom`), so that icons sit where Foundation's `.icons.icon-top` puts them without writing two classes.
13. As an application developer, I want `li[nfsMenuText]` for an item without a link, so that a site title lines up with the links as Foundation's `.menu-text` does.
14. As an application developer, I want to mark the current page with `aria-current="page"` on its link and get Foundation's active look, so that one attribute gives both the announcement and the style.
15. As an application developer using the Router, I want `routerLinkActive ariaCurrentWhenActive="page"` on each link to mark the current page, so that the menu follows navigation with no class name in my template.
16. As an application developer, I want the home link to be current only on the home page, so that the Router's `exact` match option keeps two items from both looking current.
17. As an application developer copying Foundation's markup, I want a development warning when I write a Foundation Menu class on `nfsMenu` or a Foundation `is-active` on a menu item, naming the input or attribute to use, so that I migrate quickly.
18. As an application developer, I want a copied Foundation Menu class on the host to have no effect, so that the inputs are the one source of the menu's look on the server and in the browser.
19. As an application developer, I want my own classes on the `ul` to stay, so that application styling still works.
20. As an application developer using a menu Plugin, I want the same `orientation`, `expanded`, `simple`, `align`, and `iconPosition` inputs on `nfsAccordionMenu`, `nfsDrilldown`, `nfsDropdownMenu`, and `nfsResponsiveMenu`, so that I learn one set of names for every menu.
21. As an application developer, I want writing `nfsMenu` beside a menu Plugin's root to be harmless, so that markup written either way works.
22. As an application developer, I want `nfsMenu` beside `nfsSmoothScroll` or `nfsMagellan` on one `ul`, so that an in-page navigation looks like Foundation's Menu.
23. As a screen reader user, I want the menu to stay a list of links inside a named navigation landmark, so that I hear how many items there are and where the navigation is.
24. As a screen reader user, I want the current page's link announced as current, so that I know where I am.
25. As a screen reader user, I want icons beside link text to be silent, so that I hear each link's name once.
26. As a keyboard user, I want every link in the tab order in reading order and the browser's own focus ring on it, so that I can reach and see every item.
27. As a low-vision user, I want the current link's text to reach 4.5:1 against its fill and the fill to differ from the page by 3:1, so that I can read it and tell it apart without relying on hue.
28. As a user with limited dexterity, I want every menu link at least 24 CSS px tall, simple and vertical menus included, so that I can hit it.
29. As a user on a narrow screen, I want a horizontal menu to wrap rather than scroll sideways, so that I can read it at 320 CSS px.
30. As a user of a right-to-left page, I want a horizontal menu to run in the reading direction, so that it reads naturally.
31. As a user who prefers reduced motion, I want the menu to stay free of animation, so that nothing moves.
32. As a developer of a server-rendered application, I want every Menu class and the current link's `aria-current` in the server HTML, so that the first paint is final and hydration changes nothing.
33. As a developer of a server-rendered application, I want links to navigate natively before hydration and inside dehydrated `@defer` blocks, so that the directive never swallows a navigation.
34. As a developer using `@defer (hydrate never)`, I want a menu inside the block to keep Foundation's look and working links, so that static regions need no JavaScript.
35. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
36. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
37. As a developer who themes the menu, I want the compile to fail, naming the setting, when my settings make the current link or a menu row fail WCAG 2.2 AA, so that I cannot ship an inaccessible menu by accident.
38. As an application developer, I want to import the Menu from its own entry point, so that a `@defer` block can split it with the rest of its content.
39. As a menu Plugin spec author, I want one directive that owns `.menu` and its Variants, so that the Plugin roots and the submenus host it instead of copying its inputs.
40. As a library maintainer, I want every class, value, and warning asserted in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Menu has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is the menu Sass partial and its docs page. Dropped options: none, because there are none.

| Feature | Class or markup | Source in Foundation's Sass | Notes |
| --- | --- | --- | --- |
| Menu | `ul.menu` of `li` elements with links | `foundation-menu`, `menu-base` | Flex row that wraps (`$global-flexbox`), or inline-block items without flexbox; links get `$menu-items-padding` (`$global-menu-padding`, `0.7rem 1rem`) at `line-height: 1` |
| Orientation | `.horizontal` (the default look), `.vertical`; `.<bp>-horizontal`, `.<bp>-vertical` | `menu-direction`; the responsive forms loop over `$breakpoint-classes` without the Zero breakpoint | Mobile-first media queries; no class for the Zero breakpoint, where the bare class applies |
| Expanded | `.expanded`; `.<bp>-expanded` | `menu-expand` (`flex: 1 1 0px` on each item) | Min-width forms only: Foundation generates no `only` or `down` form |
| Simple | `.simple`; `.<bp>-simple` | `menu-simple` (no link padding, `$menu-simple-margin` between items) | The responsive `.<bp>-simple` classes include `menu-expand`, not `menu-simple`: a Foundation defect, so they render the expanded layout |
| Nested | `.nested` on a menu inside a menu item | `menu-nested` (`$menu-nested-margin` on the start side, the end side under `.align-right`) | The menu Plugins reset it per mode (`.nested.is-<mode>-submenu`) |
| Alignment | `.align-left`, `.align-right`, `.align-center` | `menu-align`, compiled against `$global-text-direction` | In flexbox mode a horizontal menu's items move only through the same class names in Foundation's flex classes (`foundation-flex-classes`); `foundation-menu` alone aligns each item's content |
| Active state | `.is-active` on an `li` | `menu-state-active` on `.is-active > a`: `$menu-item-background-active` with the colour `color-pick-contrast()` picks from `$menu-item-color-active` and `$menu-item-color-alt-active` | Visual only; the docs apply it "server-side to mark the active page, or dynamically with JavaScript" |
| Text item | `li.menu-text` | `menu-text` (Foundation's menu padding, bold, `color: inherit`) | For an item with no link |
| Icons | `.icons` plus `.icon-left`, `.icon-right`, `.icon-top`, `.icon-bottom`; the icon element before the text (after it for right and bottom) | `menu-icons`, `menu-icon-position`, `menu-icon-alignment`, `$menu-icon-spacing` | The docs' icons are Foundation Icon Fonts glyphs, a separate package |
| Back compatibility | `.active` (twin of `.is-active`), `.menu-centered > .menu`, `.icon-*` without `.icons` | `$menu-state-back-compat`, `$menu-centered-back-compat`, `$menu-icons-back-compat`, all `true` by default | Deprecated in Foundation's own settings text ("will be removed in upcoming versions"); not on the docs page |
| Responsive Menu FOUC rule | `.no-js [data-responsive-menu] ul { display: none }` | `foundation-menu` | Belongs to Responsive Menu; the library's attribute is `nfsResponsiveMenu`, so the rule never matches |
| Menu icon (hamburger) | `.menu-icon`, `.menu-icon.dark` | `foundation-menu-icon`, its own partial | Shown on the Top Bar docs page, not the Menu page: the [Spec: Top Bar](../issues/86-spec-top-bar.md) owns it |

Docs conventions the spec keeps or corrects: the `ul` of `li` elements with links (kept); `.is-active` on the current item (corrected: `aria-current` on the current link, D4); the placeholder `<a>` without `href` in the Active State example (corrected: the current page keeps its `href` and carries `aria-current`); icons as empty `<i>` glyphs (corrected: an icon beside text is `aria-hidden="true"` or an `<img alt="">`).

### CSS class to Angular mapping

Every Foundation Menu class, per building-blocks 1.14 item 2. The Variant property the runtime check reads is `--nfs-breakpoint-classes` for every breakpoint-keyed value; the closed names need none.

| Foundation class | Kind | Angular | Type alias; Sass setting and Variant registry | Value shape and the class each value sets |
| --- | --- | --- | --- | --- |
| `.menu` | Structural | `NfsMenu`, `ul[nfsMenu]`, static host class; also hosted by the menu Plugin roots and `NfsSubmenu` (D5) | n/a | Always |
| `.menu-text` | Structural | `NfsMenuText`, `li[nfsMenuText]`, static host class | n/a | Always |
| `.horizontal`, `.vertical`, `.<bp>-horizontal`, `.<bp>-vertical` | Variant | `orientation` | `NfsMenuOrientationInput` over `NfsMenuOrientation` (closed: `horizontal`, `vertical`); keys `NfsClassBreakpoint` (`$breakpoint-classes`, `NfsBreakpointClassesOverrides`) | A bare value is the Zero breakpoint: `'vertical'` sets `.vertical`. A rules object sets the bare class for its Zero-breakpoint key and `.<bp>-<value>` for every other key: `{small: 'vertical', medium: 'horizontal'}` sets `.vertical .medium-horizontal` |
| `.expanded`, `.<bp>-expanded` | Variant | `expanded` | `NfsMenuExpandedInput`: `NfsVariantBoolean \| NfsClassBreakpointQuery<'up'>`; breakpoints as above | `true`, the bare attribute, or `'true'` sets `.expanded`; a query for the Zero breakpoint (`'small'`, `'small up'`) sets `.expanded`; `'medium'` or `'medium up'` sets `.medium-expanded`; `only` and `down` do not compile, because Foundation generates no such class |
| `.simple` | Variant | `simple` | `NfsVariantBoolean` (closed) | `true` sets `.simple` |
| `.<bp>-simple` | Variant, not offered | none | n/a | Foundation's responsive simple classes render the expanded layout (the defect above); `expanded="<bp>"` gives that look by name. A copied one is stripped and reported (D3) |
| `.nested` | Variant | `nested` | `NfsVariantBoolean` (closed) | `true` sets `.nested` |
| `.align-left`, `.align-right`, `.align-center` | Variant | `align` | `NfsMenuAlign` (closed) | The name sets `.align-<name>` |
| `.icons` with `.icon-left`, `.icon-right`, `.icon-top`, `.icon-bottom` | Variant | `iconPosition` | `NfsMenuIconPosition` (closed) | The name sets `.icons` and `.icon-<name>`, the pair Foundation's docs ask for |
| `.is-active` on the current page's `li` | State | Not bound. The current page is `aria-current` on its link; `nfs-menu` styles it with Foundation's `menu-state-active` (D4) | n/a | A link whose `aria-current` is present and neither `false` nor empty |
| `.is-active` on a menu Plugin's items and submenus | State | Host bindings of the Nested menu utility (its spec) | n/a | Open state, per mode |
| `.active` | State, back compatibility | Not produced (D10) | n/a | n/a |
| `.menu-centered` wrapper | Structural, back compatibility | No directive; `align="center"` is the documented form (D10) | n/a | n/a |
| `.icon-*` without `.icons` | Variant, back compatibility | Not produced: `iconPosition` always binds both | n/a | n/a |
| `.menu-icon`, `.menu-icon.dark` | Structural and Variant | The [Spec: Top Bar](../issues/86-spec-top-bar.md) | n/a | n/a |

Binding rule (D3). `NfsMenu` binds one computed class record that holds every Menu Variant class it owns: the fixed classes (`horizontal`, `vertical`, `expanded`, `simple`, `nested`, `icons`, the four `icon-*`, the three `align-*`) and the responsive classes `<bp>-horizontal`, `<bp>-vertical`, `<bp>-expanded`, and `<bp>-simple` for every breakpoint of the Breakpoint map above the Zero breakpoint (from `nfsBreakpointsToken`). A key is `true` when an input's value sets that class and `false` otherwise. Because Angular's styling resolution uses a static class only when every binding for it is `undefined`, a Foundation Menu class copied onto the host is stripped on the server and in the browser, and the host's Menu classes are exactly those the inputs set; the consumer's own classes and a redundant `menu` stay (measured, see the ticket). Every Variant input still defaults to setting no class (building-blocks 1.4): `false` sets none.

### Hierarchy and DI shape

```
ngx-foundation-sites/menu      (secondary entry point)
  ul[nfsMenu]        NfsMenu       exportAs 'nfsMenu'; no providers, no token, no host directives
    li[nfsMenuText]  NfsMenuText   in development builds only: inject(NfsMenu, {optional: true}) for its parent check
  uses: nfsBreakpointsToken (ngx-foundation-sites/media-query) for the Zero breakpoint and the responsive keys;
        HostAttributeToken('class') and ElementRef in development builds only; the runtime checks of
        ngx-foundation-sites/media-query

hosted by (their specs):
  ul[nfsAccordionMenu], ul[nfsDrilldown], ul[nfsDropdownMenu]
      hostDirectives: {directive: NfsMenu, inputs: ['orientation', 'expanded', 'simple', 'align', 'iconPosition']}
  ul[nfsResponsiveMenu]   through its three roots: one NfsMenu, their input maps merged (Angular 22.0 de-duplication)
  ul[nfsSubmenu]          hostDirectives: {directive: NfsMenu, inputs: ['align', 'iconPosition']};
                          binds nested and vertical itself
written beside (their specs):
  ul[nfsMenu][nfsSmoothScroll], ul[nfsMenu][nfsMagellan]
```

- No Parent token. Nothing needs `NfsMenu` through DI except `NfsMenuText`'s development warning and the hosting roots, which inject it by class with `{self: true}` because they already import it for `hostDirectives`. A lightweight token pays when a child in another entry point must not keep its parent's class; `NfsMenuText` lives in the same entry point and looks its menu up only in development builds, so the lookup is removed from production bundles.
- No Defaults token. Defaults tokens replace a Plugin's `Foundation.X.defaults`, and Menu has none; a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Hosting (D5): Angular 22.0 creates a directive reached several times through host directives on one element once, with the exposed input maps merged, and discards host-directive matches of a directive the template also matches, so `nfsMenu` written beside a hosting root is not an NG0309 error. Measured with Angular 22.2.0 under strict templates and a server render: one `NfsMenu` instance on a Responsive-Menu-shaped host of two roots, a bound input reaching it through two levels of host directives, a misspelt value failing to compile through both levels, and a host's own class bindings winning over the hosted `NfsMenu`'s `false` keys.
- A hosting root reads the Menu's inputs through `inject(NfsMenu, {self: true})`; the Dropdown Menu's Base side reads `align()` there instead of Foundation's `align-right` in the root's static class, which the class rule removes.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsMenu`: `nfsDirectiveCheck('NfsMenu', {children: ['NfsMenuText']})`. No parent check: it injects no parent. It probes `NfsMenuText` on a plain `ul[nfsMenu]` and, hosted, on every menu Plugin root and every `ul[nfsSubmenu]`, because the shared spec's child probe also counts the host record, in which a hosted `NfsMenu` records its host element. No peers linked by reference or value. `strictParents` changes nothing.
  - `NfsMenuText`: `nfsDirectiveCheck('NfsMenuText', {parent})`, its development-only `inject(NfsMenu, {optional: true})` giving `found`. Parent check over `NfsMenu` and every directive that hosts it: `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, `NfsResponsiveMenu`, and `NfsSubmenu`, with the `alone` sentence "It is unstyled outside a menu." (Foundation scopes `.menu-text` under `.menu`), which replaces development check 3's warning, so an item outside a menu is reported once. No child probes: it is a leaf. No peers. `strictParents`: it throws the shared spec's error at construction when no menu is found.

### API: `NfsMenu`

Selector `ul[nfsMenu]`; `exportAs: 'nfsMenu'`; standalone; no template.

```ts
type NfsMenuOrientation = 'horizontal' | 'vertical';
type NfsMenuOrientationInput = NfsMenuOrientation | NfsClassBreakpointRules<NfsMenuOrientation>;
type NfsMenuExpanded = boolean | NfsClassBreakpointQuery<'up'>;
type NfsMenuExpandedInput = NfsVariantBoolean | NfsClassBreakpointQuery<'up'>;
type NfsMenuAlign = 'left' | 'right' | 'center';
type NfsMenuIconPosition = 'left' | 'right' | 'top' | 'bottom';

class NfsMenu {
  readonly orientation: InputSignal<NfsMenuOrientationInput | undefined>;              // default undefined
  readonly expanded: InputSignalWithTransform<NfsMenuExpanded, NfsMenuExpandedInput>;   // default false
  readonly simple: InputSignalWithTransform<boolean, NfsVariantBoolean>;                // default false
  readonly nested: InputSignalWithTransform<boolean, NfsVariantBoolean>;                // default false
  readonly align: InputSignal<NfsMenuAlign | undefined>;                                 // default undefined
  readonly iconPosition: InputSignal<NfsMenuIconPosition | undefined>;                   // default undefined
}
```

| Input | Transform | Default | Foundation equivalent (JSDoc) | Delta |
| --- | --- | --- | --- | --- |
| `orientation` | none | `undefined`: no class, Foundation's horizontal default | `.horizontal`, `.vertical`, `.<bp>-horizontal`, `.<bp>-vertical`; `$breakpoint-classes` | A rules object in place of several classes; an explicit `'horizontal'` sets `.horizontal` |
| `expanded` | a pure function of the entry point whose parameter is `NfsMenuExpandedInput`: `nfsVariantBoolean`'s result for `NfsVariantBoolean` values, the query string itself otherwise (the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) may hoist one shared transform for every on-or-off responsive family into the primary entry point) | `false` | `.expanded`, `.<bp>-expanded`; `$breakpoint-classes` | A Breakpoint query in place of the responsive class |
| `simple` | `nfsVariantBoolean` | `false` | `.simple` | `.<bp>-simple` not offered (D2) |
| `nested` | `nfsVariantBoolean` | `false` | `.nested` | None |
| `align` | none | `undefined` | `.align-left`, `.align-right`, `.align-center` | Named `align`, not `alignment`, because the Dropdown Menu's `alignment` Option sits on the same element (D12); kind `removed` (building-blocks 1.4): the host removes the static HTML `align` attribute (D15) |
| `iconPosition` | none | `undefined` | `.icons` with `.icon-<position>` | One input binds both classes |

- Every input declares explicit type arguments naming the exported aliases above, as building-blocks 1.4 requires, because `NfsClassBreakpointRules` and `NfsClassBreakpointQuery` are derived from a Variant registry; the library's build assertion covers `orientation` and `expanded`.
- Models, outputs, and methods: none. The Menu owns no state and emits nothing; the inputs are its public read API (`menu.align()`).
- Host: static `class="menu"`; `[class]` bound to the class record of the binding rule above; `'[attr.align]': 'null'`, so a static `align="..."` sets the input and leaves no `align` attribute on the `ul`, where Chromium and WebKit would map it to an inherited `text-align` (D15). No other attribute, no listener.
- Zero breakpoint: the key of `nfsBreakpointsToken`'s map whose value is 0 (the definition in the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)), not the name `small`.
- A value that maps to no class (reachable only through `$any()` or a cast) binds nothing and is reported (Runtime checks).

### API: `NfsMenuText`

Selector `li[nfsMenuText]`; standalone; no inputs, models, outputs, or methods; static host class `menu-text`.

### Development checks and runtime checks

Development checks, each warning once per instance through `console.warn`, run in the first client render callback and never on the server or in production:

1. A Foundation Menu class copied onto the `nfsMenu` host (read through `HostAttributeToken('class')` in development builds only): the warning names the class and the input to bind (`vertical` and `medium-horizontal` name `orientation`; `align-right` names `align`; `icons` and `icon-top` name `iconPosition`; `<bp>-simple` explains that it renders the expanded layout and names `expanded`). A redundant `menu` is not reported. This is building-blocks 1.4's rule for copied classes. A copied class that the host still carries after the first render although `NfsMenu`'s record sets it `false` is bound by the hosting directive and is not reported: the Nested menu's `NfsSubmenu` binds `nested` and `vertical`, so Foundation's `class="menu vertical nested"` copied onto a submenu is redundant, not stripped.
2. A copied current-page marker: a direct child `li` of the host with no nested list, carrying Foundation's `is-active` or `active`, whose link has no `aria-current` other than `false`. The warning names `aria-current="page"` on the link. The Nested menu's open parents carry a nested list, and Magellan sets `aria-current` with its `.is-active`, so neither is reported.
3. `NfsMenuText` with no `NfsMenu` above it in its injector tree: reported once by its In-family parent check (Hierarchy and DI shape), whose sentence says the item is unstyled outside a menu; the directive runs no check of its own for it.

Runtime checks (ADR 0040, configured by `provideNfsRuntimeChecks` and `provideNfsProductionRuntimeChecks` of `ngx-foundation-sites/media-query`, whose spec defines how a directive reports): under `strictVariantNames`, a breakpoint above the Zero breakpoint named by an `orientation` rules key or an `expanded` query that `--nfs-breakpoint-classes` does not list (drift between the Variant declaration file and the compiled Sass), and a value that maps to no class; under `strictVariantProperties`, a missing `--nfs-breakpoint-classes`, naming `@include nfs-breakpoint-properties;`. They run in the browser after the first render, never on the server.

### Comparison with Angular Material (`mat-nav-list`, `a[mat-list-item]`, `mat-tab-nav-bar`, 22.2)

| Concern | Material | `NfsMenu` |
| --- | --- | --- |
| Kind | `mat-nav-list` component; `a[mat-list-item]` components with templates | Directive on the consumer's `ul`; no template, no item directive |
| Landmark and list semantics | `mat-nav-list` sets `role="navigation"` on its host | The consumer's `nav` is the landmark; the `ul` keeps its list semantics |
| Current page | `activated` input on the list item (`active` on a tab link): a class plus `aria-current="page"` on an `<a>` host | `aria-current` on the link, from the consumer or `RouterLinkActive`; `nfs-menu` styles it; no input |
| Router recipe | `routerLinkActive #rla="routerLinkActive" [activated]="rla.isActive"` | `routerLinkActive ariaCurrentWhenActive="page"` |
| Orientation and layout | Vertical list (nav list), horizontal bar (tab nav bar) | `orientation` with Breakpoint rules, `expanded`, `simple`, `align` |
| Icons | Content slots (`matListItemIcon`) | `iconPosition` over the consumer's icon element |
| Testing | `MatNavListHarness`, `MatTabNavBarHarness` | DOM-first assertions; no harness |

Borrowed: `aria-current="page"` on the current link as the state assistive technology reads, and pairing it with `RouterLinkActive`. Not borrowed: `role="navigation"` on the list host (it hides the list and its count), item components, and an `activated` input, which here would need a directive on every link to carry a state the attribute already carries.

### Implementation level and primitives

Implementation level: native platform. A menu is an HTML list of links: the list semantics, the tab order, activation, and navigation are the browser's, and the current page is an ARIA state the Router can already write. `@angular/aria` is not used: `ngMenuBar`, `ngMenu`, and `ngToolbar` apply roles and roving focus that the APG rejects for site navigation ([ADR 0004](../adr/0004-menus-use-disclosure-navigation.md)), and a plain menu has no keyboard behaviour to add. `@angular/cdk` is not needed: nothing is measured, focused, or observed. The Angular layer is two directives of host bindings over `input()` signals and one `computed` record.

Primitives: `input()`, `computed()`, a static host class, a `[class]` host binding, `nfsBreakpointsToken`, and, in development builds only, `HostAttributeToken`, `ElementRef`, and `afterNextRender`. `injectAsync` is not used: every effect is a host binding that must be in the server HTML. `effect` and `afterEveryRender` are not used.

Fallback: none needed. The one behaviour this design depends on beyond host bindings, host-directive de-duplication for the hosting roots, was measured in Angular 22.2.0 (Hierarchy and DI shape).

### ARIA and keyboard

APG pattern: none of its own. A plain menu is a list of links in a navigation landmark; a menu with submenus is Disclosure Navigation through the Nested menu utility ([ADR 0004](../adr/0004-menus-use-disclosure-navigation.md)).

| Element or state | Rendered semantics | Owner |
| --- | --- | --- |
| `ul[nfsMenu]` | Native `list` with `listitem` children; no `role` attribute | Native |
| Landmark | `<nav aria-label="...">` (or `aria-labelledby`) around a navigation menu, with a distinct name when the page has several; WebKit exposes a list styled with `list-style: none` as a list only inside a navigation landmark, so the `nav` also keeps the item count in VoiceOver | Consumer |
| A menu outside a `nav` | Stays a list in Chromium and Firefox; WebKit drops its list role; a consumer who needs the count there adds `role="list"` (an ARIA attribute, not a class) | Consumer |
| Current page | `aria-current="page"` (or `step`, `location`, `date`, `time`, `true`) on the link; `false` or an empty value means not current. The link keeps its `href` | Consumer or `RouterLinkActive` |
| `li[nfsMenuText]` | Native `listitem` with text | Native |
| Icon beside text | `aria-hidden="true"` on the icon element, or an `<img alt="">` | Consumer |
| Icon-only link | Named by `aria-label` or visually hidden text (`nfsShowForSr` of the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)) | Consumer |
| Nested plain menu | Native nested `ul` inside the `li`, always shown | Native |

Keyboard: native only. Tab and Shift+Tab move through the links in DOM order; Enter follows a link. The directives add no key handling and change no tab order.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (ADR 0022). Contrast ratios are computed with the exact WCAG formula (the library's internal `math.pow` helper) from Foundation 6.9.0's default settings (`$menu-item-background-active` `#1779ba`, `$menu-item-color-active` `$white` `#fefefe`, `$menu-item-color-alt-active` `$black` `#0a0a0a`, `$body-background` `#fefefe`) and compared unrounded, as the Button spec does, because Foundation's `color-contrast()` rounds to one decimal and its `color-luminance()` overstates some ratios.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.3.1 Info and Relationships | Lists stay lists; a nested menu is a nested list. The current page is programmatic: the only way to get the current look is `aria-current` on the link (D4), so a visual-only current state cannot be produced. A copied `is-active` item is reported in development builds | Fails: Foundation's `.is-active` is visual only | axe in every story; `menu--current-page` finds the link with `getByRole('link', {current: 'page'})`; SSR smoke |
| 1.4.1 Use of Color | The current link differs from its neighbours by a filled background, a lightness difference of at least 3:1 against `$body-background`; `nfs-menu` stops the compile with `@error` naming `$menu-item-background-active` below 3:1. The state is also exposed as `aria-current` | Passes: 4.65:1 | Node-level Sass compile test (`#f0f0f0` gives 1.13:1 and fails); `menu--current-page` asserts at least 3:1 between the current link's computed background and the page background |
| 1.4.3 Contrast (Minimum) | The current link's text, the colour Foundation's `color-pick-contrast()` picks, reaches 4.5:1 against `$menu-item-background-active`; `nfs-menu` stops the compile with `@error` otherwise. Other links are `$anchor-color` on the page, a pair the library does not introduce | Passes: 4.65:1 for the current link; `$anchor-color` on `$body-background` 4.65:1 | Node-level Sass compile test (`#787878` gives 4.484:1, which `color-contrast()` would round to 4.5, and fails); axe `color-contrast` in every story |
| 1.4.10 Reflow | Horizontal menus wrap (`flex-wrap: wrap`); an `expanded` menu keeps one row, so a menu with more items than fit at 320 CSS px uses the responsive form (`expanded="medium"`) | Passes for Foundation's docs examples | e2e at a 320 px viewport on `menu--expanded` and `menu--basic`: no horizontal scroll |
| 1.4.11 Non-text Contrast | The library draws no graphic and no component boundary in a menu; an icon-only link's icon is the consumer's content | Not applicable to library output | None beyond the consumer's own tests |
| 2.1.1 Keyboard | Native links in the tab order; no key handling added | Passes | Story play (`userEvent.tab()`) |
| 2.4.3 Focus Order | DOM order; no class reorders items (the icon classes need the icon after the text for right and bottom, as Foundation's docs say, and never reorder) | Passes | Story play |
| 2.4.7 Focus Visible | The browser's own focus ring on every link, the filled current link included; Foundation's `disable-mouse-outline` acts only under what-input's `[data-whatinput='mouse']`, which the library never sets | Passes | e2e screenshot of the focused current link in three engines |
| 2.5.8 Target Size (Minimum) | Every link is at least 24 CSS px tall. Default rows are 38.4 px (`1rem` plus twice `0.7rem`); `nfs-menu` stops the compile when `1rem` plus twice the first value of `$menu-items-padding` is below 24 px. A simple menu's links have no padding, 16 px rows that fail once items stack (`orientation="vertical"`) or wrap, so `nfs-menu` adds block padding up to a 24 px row to `.menu.simple a`. Width: a link wider than 24 px, or the 1 rem gap Foundation puts between simple items, meets the spacing exception | Fails for stacked or wrapped simple menus (16 px rows touching); passes otherwise | axe `target-size` in every story (`menu--simple` includes a vertical simple menu); e2e measures every link's border box in `menu--simple` at 24 px tall or more in three engines; node-level Sass compile test (`0.2rem 1rem` gives 22.4 px and fails) |
| 2.5.3 Label in Name | Names come from the links' content | Passes | Every play function finds links by visible text |
| 4.1.2 Name, Role, Value | Native roles; `aria-current` is the current state; an icon-only link has a name | Passes where links have text; icon-only links need a name (axe `link-name`) | axe in every story |

The story gate runs axe with the six tags of ADR 0018 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) and `parameters.a11y.test = 'error'`, every menu inside a named `nav`. No Foundation default needs a Storybook settings override for the Menu.

### Rendered HTML

Consumer markup and the resulting DOM. Server HTML and hydrated DOM are identical in every example: every value comes from inputs, and the breakpoint keys come from `nfsBreakpointsToken`, which the application provides alike on both platforms. The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfsmenu=""`), except `align`, which `NfsMenu` removes on every host that carries the input, the menu Plugin roots and submenus included (D15). Class order is not significant.

```html
<!-- Basic menu with the current page -->
<nav aria-label="Main">
  <ul nfsMenu>
    <li><a href="/">Home</a></li>
    <li><a href="/about" aria-current="page">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
<nav aria-label="Main">
  <ul class="menu">
    <li><a href="/">Home</a></li>
    <li><a href="/about" aria-current="page">About</a></li><!-- styled by nfs-menu with menu-state-active -->
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<!-- Stacked on phones, horizontal and expanded from medium up, aligned right -->
<ul nfsMenu [orientation]="{small: 'vertical', medium: 'horizontal'}" expanded="medium" align="right">...</ul>
<ul class="menu vertical medium-horizontal medium-expanded align-right">...</ul>

<!-- Simple menu with a text item -->
<ul nfsMenu simple>
  <li nfsMenuText>Site Title</li>
  <li><a href="/one">One</a></li>
</ul>
<ul class="menu simple">
  <li class="menu-text">Site Title</li>
  <li><a href="/one">One</a></li>
</ul>

<!-- Nested plain menu -->
<ul nfsMenu orientation="vertical">
  <li>
    <a href="/guides">Guides</a>
    <ul nfsMenu nested orientation="vertical">
      <li><a href="/guides/theming">Theming</a></li>
    </ul>
  </li>
</ul>
<ul class="menu vertical">
  <li>
    <a href="/guides">Guides</a>
    <ul class="menu nested vertical"><li><a href="/guides/theming">Theming</a></li></ul>
  </li>
</ul>

<!-- Icons above the text -->
<ul nfsMenu iconPosition="top">
  <li><a href="/list"><svg aria-hidden="true" focusable="false" width="16" height="16">...</svg> <span>List</span></a></li>
</ul>
<ul class="menu icons icon-top">...</ul>

<!-- The Router marks the current page (server HTML rendered at /docs) -->
<ul nfsMenu>
  <li><a routerLink="/" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Home</a></li>
  <li><a routerLink="/docs" routerLinkActive ariaCurrentWhenActive="page">Docs</a></li>
</ul>
<ul class="menu">
  <li><a href="/">Home</a></li>
  <li><a href="/docs" aria-current="page">Docs</a></li>
</ul>

<!-- A copied Foundation class is stripped (and reported in development builds) -->
<ul nfsMenu class="vertical site-nav">...</ul>
<ul class="menu site-nav">...</ul>

<!-- A menu Plugin root hosting NfsMenu (the root's own classes per its spec) -->
<ul nfsDropdownMenu align="right">...</ul>
<ul class="menu align-right dropdown">...</ul>
```

Neither directive causes a `jsaction` attribute: they declare no listeners. `RouterLink` declares its own on links; that is the Router's, as for any routed link.

### Animation

None. Foundation's Menu has no transition or animation, and neither directive inserts, removes, or animates anything, so ADR 0003's mechanics have nothing to govern, no `animate.enter`/`animate.leave` is used, and there is no `prefers-reduced-motion` override. A menu Plugin's animations belong to the Nested menu utility.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.menu`, every Variant class, `.menu-text`, and the current link's `aria-current` exactly as the hydrated DOM does (rule 1). Foundation's CSS and the `nfs-menu` rule style the first paint.
- Before hydration: construction reads inputs and `nfsBreakpointsToken` only; nothing touches the DOM outside host bindings, reads `window`, measures, or starts a timer (rules 3 to 5). The development checks run in `afterNextRender`, which never runs on the server.
- Full hydration: class values equal the server's, so hydration changes no class; there is no structure to mismatch and no `ngSkipHydration` (rule 10). A static `align` is absent from the server HTML; hydration's creation pass writes it back onto the server node, in the same pass that resets `class` to the static classes, and the first update pass removes it and restores the classes, before any rendering update (D15; building-blocks 1.11).
- Router: `RouterLinkActive` writes `aria-current` on the server once the navigation has run; on the client it does nothing until the initial navigation has completed, so the server's attribute stays through hydration and is then written with the same value. A current state bound from the Router's `isActive()` signal reads the last successful navigation, which does not exist yet when an application shell first renders on the client under the default non-blocking initial navigation; such a binding would remove `aria-current` at hydration and restore it after the navigation. Menus in the application shell therefore use `RouterLinkActive`; `isActive()` is for menus inside routed components.
- Incremental hydration: a plain menu registers nothing, so it needs no hydration boundary of its own and a nested plain menu may sit in another block. A hosted `NfsMenu` follows its Plugin's boundary rule.
- Event replay: the directives declare no listeners, so they add nothing to queue or replay, and they never cause Angular's dispatcher to cancel a link's native navigation inside a dehydrated block.
- `@defer`: library templates contain no `@defer` (there is no template). The entry point is separate, so a consumer can defer the menu. Inside a dehydrated block the menu is its server HTML and fully works as links. Inside `@defer (hydrate never)` it keeps Foundation's look and its links navigate.
- Prerendering: identical to server rendering; nothing reads a request token (rule 11).
- Zoneless: no zone is used; all state is inputs.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes on the list, the roles, the link names, which link is current, where each link lands, and what the server HTML contains. No test reads a directive's fields. Prior art: the [Spec: Button](../issues/37-spec-button.md) layers (a listener-free directive), the [Spec: Tabs](../issues/16-spec-tabs.md) nav-bar play function that asserts a state's contrast from computed styles, and the host-directive probe recorded in the [Spec: Menu](../issues/85-spec-menu.md) ticket.

Story ids follow `menu--<story>`, `meta.id: 'menu'`, title `CSS-only components/Menu`: `menu--basic`, `menu--alignment`, `menu--expanded`, `menu--vertical`, `menu--responsive-orientation`, `menu--simple`, `menu--nested`, `menu--current-page`, `menu--text`, `menu--icons`, `menu--icons-nested`, `menu--rtl`, and `menu--fixture` (args for every input, `!autodocs`, for e2e). Every menu in a story sits in a named `nav`. No Anti-pattern story.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six WCAG 2.2 AA tags (ADR 0018), under the Storybook preview stylesheet with `@include nfs-menu;` after `foundation-everything`.

- `menu--basic`: the list has `.menu` and no other Menu class; it is found by `getByRole('list')` inside `getByRole('navigation', {name})`; its items are links by name; Tab visits them in order.
- `menu--alignment` (arg `align`): each value sets its one `align-*` class; with `right` the last link's right edge equals the list's content-box right edge, with `center` the items are centred (computed geometry under Foundation's flex classes).
- `menu--expanded`: `.expanded` gives every item the same computed width; the `expanded="medium"` variant sets only `.medium-expanded`.
- `menu--vertical`: `.vertical` gives `flex-direction: column`; with `align="right"` the links' text is right-aligned.
- `menu--responsive-orientation`: `{small: 'vertical', medium: 'horizontal'}` sets `.vertical` and `.medium-horizontal` and no bare `horizontal`.
- `menu--simple`: `.simple` removes the inline padding; the vertical simple menu's every link box is at least 24 px tall.
- `menu--nested`: the inner list has `.nested` and `.vertical` and is indented by Foundation's nested margin.
- `menu--current-page`: `getByRole('link', {current: 'page'})` finds exactly one link; its computed background equals `$menu-item-background-active` and its colour the one Foundation picks; the ratio between its background and the page background is at least 3:1, and between its text and its background at least 4.5:1, computed from computed styles; a link with `aria-current="false"` has no fill.
- `menu--text`: the text item has `.menu-text` and is not a link.
- `menu--icons` (arg `iconPosition`): `.icons` plus the one `icon-*` class; each link's accessible name is its text only (the icon is `aria-hidden`).
- `menu--icons-nested`: the nested list's own `iconPosition` sets its own classes.
- `menu--rtl`: under `dir="rtl"` the first link is the rightmost; no class changes with direction; a vertical menu written `align="left"` in the same region keeps its link text at the start (right) edge, and its list carries no `align` attribute (D15).

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM state; no story is mounted and no axe runs here.

- Class table, data-driven: every input and value against the mapping table, including the bare attribute and `'true'`/`'false'` for `simple`, `nested`, and `expanded`, the Zero-breakpoint key and query, and transitions in both directions (a class set by one value disappears when the value changes); a static `align="right"` sets `.align-right`, `align()` reads `'right'`, and the host carries no `align` attribute.
- Binding rule: a static `class="vertical medium-vertical align-right icons"` is stripped with no input and with a conflicting input; a static `menu` and an application class stay; with a test `nfsBreakpointsToken` whose Zero breakpoint is `xs` and whose map adds `xlarge`, `{xs: 'vertical'}` sets `.vertical` and a copied `xlarge-vertical` is stripped.
- Hosting: a test root directive hosting `NfsMenu` with the five inputs exposes them and reads `align()` through `inject(NfsMenu, {self: true})`; a test directive hosting two such roots (Responsive Menu's shape) creates one `NfsMenu` for the element and the bound inputs reach it; `nfsMenu` written beside the test root raises no error; a submenu-shaped test directive hosting `NfsMenu` and binding `nested` and `vertical` itself keeps both classes and a copied `class="menu vertical nested"` on it raises no warning. A static `align="right"` leaves no `align` attribute on `nfsMenu`, on the test root, on the two-root host, and on the submenu-shaped host, while `align()` reads `'right'` and `.align-right` is set.
- Development checks: the copied host class warns once naming the input; a copied leaf `li.is-active` without `aria-current` warns once naming `aria-current`; a leaf with both, and a parent `li.is-active` with a nested list, do not warn; `li[nfsMenuText]` outside a menu warns once; correct markup warns nothing; no warning is emitted during a server render.
- Router: with `provideRouter` and `RouterTestingHarness`, navigating sets `aria-current="page"` on the matching link and removes it from the previous one; with `{exact: true}` the root link is current only at `/`; the list's classes do not change with navigation.
- Runtime checks: a listed breakpoint is silent; an `orientation` rules key or `expanded` query for a breakpoint missing from a test `--nfs-breakpoint-classes` on the document root reports once under `strictVariantNames`; a cast value binds no class and reports once; a missing `--nfs-breakpoint-classes` reports once under `strictVariantProperties`, naming `nfs-breakpoint-properties`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture with each Rendered HTML example, run through the shared `renderServer()` helper in `<name>.ssr.spec.ts` under `npx nx test <lib>`, with `provideRouter` and the URL `/docs`. Assert `whenStable()` resolves; the HTML matches the Rendered HTML section, the copied classes absent and the application class present; `aria-current="page"` on the Docs link and not on Home; no `jsaction` on any list, item, or plain link; no `role` attribute, no `align` attribute (the Rendered HTML examples write a static `align="right"` on a plain menu and on a Dropdown Menu root), and no inline `style` from the directives; no development warning logged. `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not.
- Pure logic: the value-to-class function, table-driven over every value shape and a renamed Zero breakpoint.
- Sass compile (the library's node-level Sass test): `@include nfs-menu;` after `foundation-menu` over Foundation's defaults compiles and emits exactly the two rules of the Sass subsection; `$menu-item-background-active: #787878` stops the compile naming the 1.4.3 check (4.484:1); `#f0f0f0` stops it naming the 1.4.1 check (1.13:1); `$menu-items-padding: 0.2rem 1rem` stops it naming the 2.5.8 check (22.4 px); a `$menu-item-background-active` of `#8a8a8a`, for which Foundation picks the dark text (5.73:1, fill 3.42:1), compiles.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Only what needs a real engine or the fixture app. Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Target size (2.5.8): every link's border box in `menu--simple`, the vertical simple menu included, is at least 24 px tall.
- Focus visible (2.4.7): a screenshot comparison before and after Tab to the current link in `menu--current-page` shows a focus indicator over the fill.
- Reflow (1.4.10): at a 320 px viewport, `menu--basic` and `menu--expanded` cause no horizontal scroll.
- Right-to-left alignment: in `menu--rtl`, the vertical menu written `align="left"` inside `dir="rtl"` keeps its link text at the start (right) edge in Chromium, Firefox, and WebKit, and its list carries no `align` attribute (the attribute would move the text to the left edge in Chromium and WebKit; D15).

Against the prerendered fixture app, one route with a plain menu, a Router-marked menu in the application shell, and a menu inside `@defer (hydrate never)`:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; the current link is filled and carries `aria-current`.
- Hydration: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`; the shell menu's `aria-current` is present in the server HTML and still on the same link after hydration and after the initial navigation; the plain menu, written with a static `align="right"`, carries no `align` attribute in the server HTML or after hydration.
- `hydrate never`: the block's links navigate and keep Foundation's look.

## Out of Scope

- The menu Plugins' behaviour, their roots, submenus, toggles, and keyboard tables: the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), and the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md). This spec gives them `NfsMenu` to host (D5).
- The menu icon (`.menu-icon`, `.menu-icon.dark`), Title Bar, and Top Bar: the [Spec: Top Bar](../issues/86-spec-top-bar.md).
- Sticky navigation: the [Spec: Sticky](../issues/28-spec-sticky.md).
- A current-page input on an item directive, a link directive with an `activated` input, and `routerLinkActive` with a class name (D4).
- Foundation's back-compatibility forms `.active`, `.menu-centered`, and `.icon-*` without `.icons` (D10), and the responsive `.<bp>-simple` classes (D2).
- The flex utilities' `.align-justify` and `.align-spaced` on a menu: they are the classes of the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), not the Menu's documented alignment.
- `ol` hosts: no menu on Foundation's docs pages is an `ol`. `role="list"` restoration outside a `nav`: a consumer attribute (D14).
- Icon libraries: the icon element and its classes are the consumer's.
- Opt-in `role="menu"` or `role="menubar"` variants (map, Out of scope; ADR 0004).
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Two attribute directives, `ul[nfsMenu]` and `li[nfsMenuText]`, in the entry point `ngx-foundation-sites/menu`; no component, no item directive | One directive per Structural class (ADR 0039); nothing is generated (ADR 0001); a plain item has no Structural class and no state to own | A menu component rendering items (breaks Foundation's markup and the list the consumer writes); an item directive on every `li` |
| D2 | Variant inputs `orientation` (rules), `expanded` (query, `up` only), `simple`, `nested`, `align`, `iconPosition`; `.<bp>-simple` not offered | Building-blocks 1.4's naming order and types; Foundation generates only min-width forms for the Menu; its responsive simple classes render the expanded layout, which `expanded` already names | One input per breakpoint; a class-name or rule string; offering `.<bp>-simple` with its defect, or re-implementing `menu-simple` inside breakpoints |
| D3 | One class record holding every owned Menu class, `true` when set and `false` otherwise, with the responsive keys for every breakpoint above the Zero breakpoint | Building-blocks 1.4: copied classes are stripped and reported; the inputs are the one source; measured in a server render with Angular 22.2.0 | A record of set keys only (a copied `vertical` would override `orientation="horizontal"`, since `.vertical` comes later in Foundation's CSS); reading the static class to seed the input (forbidden by 1.4) |
| D4 | The current page is `aria-current` on its link; `nfs-menu` styles it with Foundation's `menu-state-active` at the specificity of Foundation's `.menu .is-active > a`; `.is-active` is never bound for it | One source for the announcement and the look (WCAG 1.3.1 by construction); AGENTS.md lists bridging an ARIA attribute to Foundation's class-based styling as a valid reason for custom CSS; the Tabs spec's nav bar does the same (its D18); the Router writes the attribute with `ariaCurrentWhenActive`; separates the current page from the Dropdown Menu's open parent, which Foundation marks with the same `.is-active` | A `current` input on an item directive binding `.is-active` (a second source beside `aria-current`, and a directive on plain `li`s); a link directive with Material's `activated` input (a directive on every link for a state the attribute holds); `routerLinkActive="is-active"` (a Foundation class name in consumer code, ADR 0039) |
| D5 | The Accordion Menu, Drilldown, and Dropdown Menu roots host `NfsMenu` exposing `orientation`, `expanded`, `simple`, `align`, and `iconPosition`; Responsive Menu gets one merged `NfsMenu` through its roots; `NfsSubmenu` hosts it exposing `align` and `iconPosition` and binds `nested` and `vertical` itself | A menu root and a submenu are always a `.menu`, so `.menu` and its Variants get one owner and one input set; Angular 22.0 de-duplicates host directives and lets a template match win (measured); the host's own class bindings override the hosted `false` keys (measured) | Each root binding `.menu` and copying the Variant inputs (five copies); the consumer writing `nfsMenu` beside every root (two attributes for one element, and a forgotten one leaves the menu unstyled) |
| D6 | Behaviours that may sit on any container (Smooth Scroll, Magellan) are written beside `nfsMenu` | The reasons of the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md) (its D13): a container need not be a menu, and a menu need not scroll | Hosting `NfsMenu` in them (puts `.menu` on containers that are not menus) |
| D7 | `nested` is an explicit boolean, not derived from an enclosing menu | Foundation writes `.nested` explicitly; a menu inside a pane inside a menu item would pick up the indentation from DI | Binding `.nested` whenever an ancestor `NfsMenu` exists |
| D8 | `iconPosition` binds `.icons` with the position class | Foundation's docs ask for both, and `.icon-*` alone works only under a back-compatibility setting marked for removal | Separate `icons` and `iconPosition` inputs |
| D9 | No listeners, no Parent token, no Defaults token, no models, outputs, or methods | Nothing to handle or emit; building-blocks 1.4 and 1.9; the Button precedent | A `nfsMenuToken` for `NfsMenuText` (the same entry point, a development-only lookup) |
| D10 | Back-compatibility forms (`.active`, `.menu-centered`, `.icon-*` alone) are not produced | Deprecated in Foundation's own settings and absent from the docs page; `align="center"` and `iconPosition` cover them | A `.menu-centered` wrapper directive |
| D11 | The Zero breakpoint comes from `nfsBreakpointsToken` | A consumer can rename it; the Breakpoint service defines it as the key whose value is 0 | The literal `small` |
| D12 | `align` rather than `alignment` | The Dropdown Menu's `alignment` Option sits on the same `ul`; one binding would reach both inputs and `'auto'` would not type-check against the Menu's; `align-*` is the class template; the rendered HTML attribute is removed (D15) | `alignment`; `alignX` (the Flexbox Utilities' `nfsFlexAlign` may sit on the same `ul`: `alignX="justify"` fails to compile against the Menu's type and `alignX="right"` reaches both, measured by [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)); a name Foundation does not use (`itemAlignment`, which drops the class stem) |
| D13 | `nfs-menu` adds block padding up to a 24 px row to `.menu.simple a` and checks rows, the current text, and the current fill at compile time | ADR 0022; a stacked or wrapped simple menu fails 2.5.8 at Foundation's defaults; the padding centres the text, so simple links stay aligned with plain text items | `min-height: 24px` (text sits at the top of the box, 4 px off plain items); a development warning for vertical simple menus only (misses wrapped rows) |
| D14 | Navigation landmark and list roles are the consumer's markup; no `role` is added | Keeps list semantics everywhere and the Nested menu's no-role rule; a `nav` restores WebKit's list role | `role="list"` on every menu; `role="navigation"` on the list (Material's nav list) |
| D15 | `NfsMenu` binds `'[attr.align]': 'null'`: a static `align` sets the input and never stays in the DOM, on a plain menu and on every menu Plugin root and submenu that hosts the directive (building-blocks 1.4, kind `removed`) | A static input attribute stays on the element, and Blink and WebKit map `align` on every HTML element to `text-align`: a static `align="right"` on a `ul` gives every item and submenu link an inherited `text-align: right`, and beside `.align-left` in a `dir="rtl"` region of an LTR compile it moves a vertical menu's text from the start edge to the left edge (241 px to 16 px in a 300 px item) in Chromium and WebKit; Firefox ignores it. The binding keeps the attribute out of the server HTML and the first paint; hydration and client rendering carry it only until the first update pass, which also restores the bound classes, and no rendering update drew it; the input still receives the value and the Base side still reads `align()`; one binding covers every root and `NfsSubmenu`, because they host this directive (measured with Angular 22.2 in three engines, [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)). Angular Material's `MatHint`, `MatDrawer`, and `MatSidenav` bind the same | Renaming the input: `alignment` and `alignX` collide on the same `ul` (D12, measured), and a name Foundation does not use (`itemAlignment`, from the docs' heading) leaves the class stem the migration maps from (`other`); documenting only the bound form `[align]`: the static form still compiles and keeps the hint, and a development warning never reaches production (`platform-or-a11y`) |

### Usage examples

```ts
@Component({
  selector: 'app-site-nav',
  imports: [NfsMenu, NfsMenuText, RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Main">
      <ul nfsMenu [orientation]="{small: 'vertical', medium: 'horizontal'}" expanded="medium">
        <li nfsMenuText>Acme</li>
        <li>
          <a routerLink="/" routerLinkActive [routerLinkActiveOptions]="{exact: true}"
             ariaCurrentWhenActive="page">Home</a>
        </li>
        <li><a routerLink="/docs" routerLinkActive ariaCurrentWhenActive="page">Docs</a></li>
        <li><a routerLink="/blog" routerLinkActive ariaCurrentWhenActive="page">Blog</a></li>
      </ul>
    </nav>
  `,
})
export class SiteNav {}
```

Inside a routed component, where the navigation has completed before the component renders, the Router's `isActive()` signal can drive the attribute instead:

```ts
@Component({
  selector: 'app-docs-sidebar',
  imports: [NfsMenu, RouterLink],
  template: `
    <nav aria-label="Docs">
      <ul nfsMenu orientation="vertical">
        <li><a routerLink="/docs/install" [attr.aria-current]="onInstall() ? 'page' : null">Install</a></li>
      </ul>
    </nav>
  `,
})
export class DocsSidebar {
  protected readonly onInstall = isActive('/docs/install', inject(Router));
}
```

```html
<!-- Foundation's docs markup and its library form -->
<ul class="vertical menu align-right"> ... </ul>
<ul nfsMenu orientation="vertical" align="right"> ... </ul>

<ul class="menu">
  <li class="is-active"><a>Home</a></li>
</ul>
<ul nfsMenu>
  <li><a href="/" aria-current="page">Home</a></li>
</ul>

<!-- In-page navigation: the Menu written beside Smooth Scroll -->
<nav aria-label="On this page">
  <ul nfsMenu orientation="vertical" nfsSmoothScroll>
    <li><a href="#install">Install</a></li>
  </ul>
</nav>
```

### Platform features to adopt when the browser target moves

- Nothing in the platform research changes the Menu. `:has()` would let a consumer style the current item's `li` from its link (`li:has(> a[aria-current])`); the library's rule styles the link, as Foundation's does.

### Foundation behaviour changed or dropped

- Current page: Foundation's `.is-active` on the `li` becomes `aria-current` on the link, styled with Foundation's own `menu-state-active` (D4); Foundation's placeholder `<a>` without `href` for the current item keeps its `href`.
- Copied Foundation Menu classes on the host are stripped and reported in development builds (D3).
- The responsive `.<bp>-simple` classes are not offered: Foundation's rule includes `menu-expand`, so they render the expanded layout (D2).
- `.active`, `.menu-centered`, and `.icon-*` without `.icons` are not produced (D10).
- Simple-menu links get block padding up to a 24 px row (D13).
- `disable-mouse-outline` on menu items relies on the what-input library, which the library never loads, so the browser's `:focus-visible` heuristic decides when the ring shows.
- The `.no-js [data-responsive-menu] ul` rule never matches the library's markup; Responsive Menu's first paint is its spec's.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The Menu relies on Foundation's export mixin `foundation-menu`, and on `foundation-flex-classes` for `align` on a horizontal menu in flexbox mode (both are in `foundation-everything`). Its documented custom CSS is the `nfs-menu` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-menu`. Every menu Plugin's markup is a Menu, so a consumer of the Accordion Menu, Drilldown, Dropdown Menu, or Responsive Menu includes `nfs-menu` too.

(1) Rules:

| # | Selector | Declarations | Reason |
| --- | --- | --- | --- |
| 1 | `.menu a[aria-current]:where(:not([aria-current='false']):not([aria-current='']))` | `@include menu-state-active;` (`background: $menu-item-background-active`; the colour `color-pick-contrast()` picks from `$menu-item-color-active` and `$menu-item-color-alt-active`) | Foundation keys the active look on `.is-active > a`, a class the consumer no longer writes and that says nothing to assistive technology; the rule gives the current link the same look from its ARIA state, at the same specificity as Foundation's rule (0,2,1), after it in source order |
| 2 | `.menu.simple a` | `padding-block: max(0px, (24px - 1em) / 2)` | WCAG 2.2 2.5.8: Foundation's `menu-simple` removes all link padding, leaving 16 px rows that fail once items stack or wrap; the padding makes a 24 px row and keeps the text centred; Foundation has no setting for it |

Checks (no CSS output), each `@error` naming the setting, with ratios from the exact WCAG formula, compared unrounded: the current link's text (the colour `color-pick-contrast()` picks) against `$menu-item-background-active` below 4.5:1 (1.4.3); `$menu-item-background-active` against `$body-background` below 3:1 (1.4.1); `1rem` plus twice the first value of `$menu-items-padding` (through `rem-calc()`) below `rem-calc(24)` (2.5.8). Over Foundation 6.9.0's defaults: 4.65:1, 4.65:1, and 38.4 px (Foundation's `color-luminance()` gives 4.59:1).

(2) Reused settings, mixins, and functions: `$menu-item-background-active`, `$menu-item-color-active`, `$menu-item-color-alt-active`, `$menu-items-padding`, `$body-background`, `menu-state-active`, `color-pick-contrast`, and `rem-calc`, all read from the consumer's compile; no mixin parameter.

(3) Custom properties: none.

(4) Motion classes: none, and no `prefers-reduced-motion` override; the Menu adds and awaits no animation.

(5) What breaks when the include is missing: the current link has no look at all (Foundation styles only `.is-active`), simple menus that stack or wrap fall under 24 px rows, and the compile-time checks do not run.

(6) Variant properties: none of its own. The Menu's only open family is its breakpoint keys, which loop over `$breakpoint-classes`; their property, `--nfs-breakpoint-classes`, is written by `@include nfs-breakpoint-properties;`, which every application that uses the Breakpoint service already includes.

### Notes

- RTL: Foundation compiles alignment against `$global-text-direction`. In an RTL compile `.align-right` still means the right edge; inside a `dir="rtl"` region of an LTR compile, `align="left"` gives `flex-start`, the region's right edge. This holds for a vertical menu as well only because `NfsMenu` removes the static `align` attribute (D15): with the attribute beside `.align-left`, a vertical menu, Accordion Menu, or Drilldown in such a region draws its text at the left edge in Chromium and WebKit. The directives have nothing direction-dependent.
- A consumer who wants a plain menu's items to change the page's layout, not the menu's (source ordering, visibility by breakpoint), uses the directives of the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md) and `nfsVisibility` of the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md) on the elements concerned.
