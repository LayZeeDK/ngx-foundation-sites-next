# Spec: Top Bar

Ticket: [Spec: Top Bar](../issues/86-spec-top-bar.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)). Covers one Foundation docs page and its three parts: the Top Bar, the Title Bar, and the Menu icon.

## Problem Statement

A developer building site navigation on Foundation for Sites writes three CSS-only components that Foundation documents on one page. The Top Bar is a `.top-bar` with a `.top-bar-left` and a `.top-bar-right` section that stack on small screens (or up to a breakpoint, with `.stacked-for-medium` or `.stacked-for-large`), usually holding a Dropdown Menu, a site title, and a search field. The Title Bar is a dark `.title-bar` with `.title-bar-left`, `.title-bar-right`, and `.title-bar-title`, shown on small screens in place of the Top Bar through the Responsive Toggle Plugin, or beside an Off-canvas panel. The Menu icon is the `.menu-icon` button, three bars drawn in CSS, white by default and black with `.dark`. None of them has a Plugin; their whole contract is classes.

Under the class rule the developer writes none of those classes, so every one needs a directive that binds it and a typed input for each Variant. Foundation's documented markup also leaves gaps the library must close for WCAG 2.2 AA:

- The docs' menu icon, `<button class="menu-icon" type="button" data-toggle="..."></button>`, has no accessible name (WCAG 4.1.2), and axe's `button-name` rule fails it.
- The icon is 20 by 16 CSS px, under the 24 px target size of 2.5.8. Measured in Chromium, Firefox, and WebKit, two icons side by side outside a title bar fail axe's `target-size` rule, and a transparent pseudo-element hit area, the technique this bundle used so far, fails it too.
- On Foundation's default Top Bar background (`$light-gray`), links are 3.76:1 (1.4.3), a white menu icon 1.24:1 and the dark icon's hover colour 2.77:1 (1.4.11). A consumer who fixes the bar with `$topbar-background: $white` after importing Foundation's settings file still gets open submenus on `$light-gray`, because the settings file has already copied the old bar colour into `$topbar-submenu-background`; axe fails their links in all three engines.
- Foundation's own Dropdown Menu JavaScript decides the side its submenus open to from a `.top-bar-right` ancestor, which the published Dropdown Menu spec can read only after hydration, so the server HTML shows the wrong side.

A server-rendered application adds the usual contract: every class must be in the server HTML, nothing may change at hydration, and the bars must work as plain HTML before hydration and inside dehydrated or `hydrate never` blocks.

## Solution

Nine attribute directives in one entry point, one per Structural class: `nfsTopBar`, `nfsTopBarLeft`, `nfsTopBarRight`, and `nfsTopBarTitle` for the Top Bar; `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarRight`, and `nfsTitleBarTitle` for the Title Bar; and `button[nfsMenuIcon]` for the Menu icon. `nfsTopBar` sets the stacking Variant from a typed `stackedFor` input (`stackedFor="medium"`), and `nfsMenuIcon` sets `.dark` from a boolean `dark` input. Everything they do is a host binding, so the server HTML is the final DOM.

`nfsMenuIcon` owns what the docs' button lacks: a `type` input defaulting to `button`, development warnings for a missing or symbol-only name, and, through the `nfs-menu-icon` Library mixin, a 24 by 24 CSS px box around Foundation's unchanged 20 by 16 px drawing, which axe's `target-size` rule accepts wherever the icon sits. It opens nothing: a Trigger (`nfsToggle`, `nfsOpen`) sits beside it, as the Close Button's closing does.

`nfsTopBarRight` tells a menu inside it, through dependency injection, that it sits in the Top Bar's right-hand section, so the Dropdown Menu can open its submenus to the left in the server HTML instead of after hydration. A menu that a layout component projects into the section from another template, which dependency injection cannot see, is read from the DOM by the Nested menu root after hydration, with a development warning.

Three Library mixins, one after each of Foundation's three export mixins, check at compile time the colour pairs Foundation's defaults fail: `nfs-top-bar` (links and the current link's fill on the bar and its submenus), `nfs-title-bar` (title text and the icon's bars on the title bar), and `nfs-menu-icon` (the hit-area rule, and the dark icon on the page). Behaviours that may sit on any element, Responsive Toggle, Sticky, Magellan, and Smooth Scroll, are written beside these directives.

## User Stories

1. As an application developer, I want to put `nfsTopBar` on a `div`, `header`, or `nav` and get Foundation's Top Bar, so that I write no Foundation class.
2. As an application developer, I want `nfsTopBarLeft` and `nfsTopBarRight` on the two sections, so that they stack on small screens and sit side by side from `$topbar-unstack-breakpoint` up, as Foundation's do.
3. As an application developer, I want `stackedFor="medium"`, so that the sections stay stacked through the medium breakpoint, as Foundation's `.stacked-for-medium` does.
4. As an application developer, I want a misspelt `stackedFor` breakpoint to fail to compile, so that a typo never ships a bar that unstacks too early.
5. As an application developer whose Sass adds `xlarge` to `$breakpoint-classes`, I want `stackedFor="xlarge"` to compile once my Variant declaration file declares it, so that my Sass stays the list of breakpoints.
6. As an application developer, I want a development warning when I write `stackedFor` for the Zero breakpoint, so that I learn Foundation has no such class and that the bar already stacks below `$topbar-unstack-breakpoint`.
7. As an application developer, I want `nfsTopBarTitle` for a site title or logo outside a menu, so that it gets Foundation's Top Bar title spacing.
8. As an application developer, I want `li[nfsMenuText]` inside a Top Bar menu for a site title, as Foundation's docs example does, so that one Menu directive covers it.
9. As an application developer, I want `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarRight`, and `nfsTitleBarTitle`, so that a title bar for an Off-canvas panel or a Responsive Toggle is written without classes.
10. As an application developer, I want `button[nfsMenuIcon]` to draw Foundation's hamburger, so that I write no `.menu-icon` class.
11. As an application developer, I want the menu icon to default to `type="button"`, so that it never submits a surrounding form.
12. As an application developer, I want `dark` on the menu icon, so that it draws black bars on a light surface, as Foundation's `.dark` does.
13. As an application developer, I want the bare `nfsToggle` of the Responsive Toggle, or `[nfsOpen]` of an Off-canvas panel, beside `nfsMenuIcon`, so that the icon opens what it controls and the icon directive stays a look.
14. As an application developer, I want a development warning when my menu icon has no accessible name or only a symbol for one, so that Foundation's unnamed docs button does not reach production.
15. As an application developer, I want to name the menu icon from the visible title with `aria-labelledby`, from visually hidden text, or with `aria-label`, so that I can use whichever fits my bar.
16. As an application developer, I want a development warning when `nfsButton` or `nfsCloseButton` shares the menu icon's element, so that two class contracts never collide silently.
17. As an application developer, I want a development warning when a menu icon renders under 24 by 24 CSS px, so that a missing `@include nfs-menu-icon;` is caught early.
18. As an application developer, I want a copied Foundation class (`stacked-for-large` on a Top Bar, `dark` on a menu icon) to have no effect and to be reported in development, so that the inputs are the one source of the look.
19. As an application developer, I want my own classes on these elements to stay, so that application styling still works.
20. As an application developer, I want a development warning when a Top Bar or Title Bar section sits outside its bar, so that a misplaced section that Foundation's CSS does not lay out is caught early.
21. As an application developer, I want a Dropdown Menu in the Top Bar's right-hand section to open its submenus to the left in the server HTML, so that the page does not change at hydration.
22. As an application developer, I want `nfsResponsiveToggle` beside `nfsTitleBar` and `nfsResponsiveToggleMenu` beside `nfsTopBar`, so that Foundation's Advanced Layout works with each directive owning its own classes.
23. As an application developer, I want `nfsSticky` beside `nfsTopBar` or `nfsTitleBar`, so that a sticky navigation bar needs no extra element.
24. As a screen reader user, I want the menu icon announced as a button with a name that says what it opens and, through its Trigger, whether it is expanded, so that I know what it does.
25. As a screen reader user, I want the navigation in a Top Bar inside a named navigation landmark, so that I can find it.
26. As a keyboard user, I want the menu icon and every Top Bar link in the tab order with the browser's focus ring, so that I can reach and see them.
27. As a pointer or touch user, I want the menu icon to accept presses across at least 24 by 24 CSS px, next to other controls too, so that I can hit it.
28. As a low-vision user, I want the menu icon's bars at 3:1 against what they sit on, at rest and on hover, and Top Bar links at 4.5:1 against the bar and its submenus, so that I can see them.
29. As a user on a 320 CSS px wide screen, I want the Top Bar's sections stacked and nothing scrolling sideways, so that I can read it at 400 percent zoom.
30. As a user of a right-to-left page, I want the left-hand section to lead in the reading direction, so that the bar reads naturally.
31. As a user in a Windows contrast theme, I want the menu icon to show as a visible box, so that I can find the control whose bars the theme removes.
32. As an application developer who themes the bars, I want the compile to fail, naming the setting, when my settings make links, the current link's fill, the title, or the icon fail WCAG 2.2 AA, so that I cannot ship an inaccessible bar by accident.
33. As a developer of a server-rendered application, I want every class, `type`, and the Dropdown Menu's side in the server HTML, so that the first paint is final and hydration changes nothing.
34. As a developer using `@defer (hydrate never)`, I want a Top Bar there to keep Foundation's look and working links, so that static regions need no JavaScript.
35. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
36. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
37. As an application developer, I want to import all three parts from one entry point, so that a `@defer` block can split them with the rest of the header.
38. As a library maintainer, I want every class, value, warning, and size asserted in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Top Bar, Title Bar, and Menu icon have no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Their contract is Foundation's top-bar, title-bar, and menu-icon Sass partials, each with its own export mixin, and the Top Bar docs page. Dropped options: none, because there are none.

| Feature | Class or markup | Source in Foundation's Sass | Notes |
| --- | --- | --- | --- |
| Top Bar | `.top-bar` | `foundation-top-bar`, `top-bar-container` | Flex row (`$global-flexbox`), `justify-content: space-between`, `padding: $topbar-padding`; the bar and every `ul` in it get `$topbar-background`, and `ul ul` gets `$topbar-submenu-background` when it differs; inputs capped at `$topbar-input-width` |
| Sections | `.top-bar-left`, `.top-bar-right` | `top-bar-stacked`, `top-bar-unstack` | Stacked (each `flex: 0 0 100%`) below `$topbar-unstack-breakpoint` (`medium`), side by side from it (left `flex: 1 1 auto`, right `flex: 0 1 auto`); physical `float` in float mode |
| Stacking | `.stacked-for-<bp>` | the `$breakpoint-classes` loop, the Zero breakpoint skipped | `breakpoint(<bp> down)` re-applies the stacked layout; it only adds stacking, it never removes the default |
| Top Bar title | `.top-bar-title` | `foundation-top-bar` | `flex: 0 0 auto; margin: $topbar-title-spacing`; not on the docs page; in float mode Foundation nudges a `.menu-icon` inside it |
| Title Bar | `.title-bar` | `foundation-title-bar` | `$titlebar-background` (`$black`), `$titlebar-color` (`$white`), `$titlebar-padding`; flex row, `align-items: center`; `.title-bar .menu-icon` gets `$titlebar-icon-spacing` on both sides |
| Title Bar sections | `.title-bar-left`, `.title-bar-right` | `foundation-title-bar` | `flex: 1 1 0px` each; `.title-bar-right` is `text-align: right` (physical) |
| Title Bar title | `.title-bar-title` | `foundation-title-bar` | `display: inline-block`, `$titlebar-text-font-weight` |
| Menu icon | `.menu-icon` | `foundation-menu-icon`, `hamburger()` | 20 by 16 px box, `position: relative`, bars drawn by `::after` (a 2 px bar plus two `box-shadow` bars); colours `$titlebar-icon-color` (`$white`) and, on `:hover`, `$titlebar-icon-color-hover` (`$medium-gray`); no size setting |
| Dark menu icon | `.menu-icon.dark` | `hamburger()` with its default arguments | `$black` bars, `$dark-gray` on hover |
| FOUC recipe | `.no-js .top-bar`, `.no-js .title-bar` | The Responsive Navigation docs, consumer CSS | Replaced by the Responsive Toggle's Visibility classes (its spec) |

Docs conventions the spec keeps or corrects: the Top Bar holding a Dropdown Menu with `li.menu-text` for the title (kept, with the Menu's `nfsMenuText`); the unnamed `button.menu-icon` (corrected: it is named, and a nameless one warns); `type="button"` on the icon (kept, now the default); `<input type="search" placeholder="Search">` with no label (corrected in every example: a `role="search"` form and an `aria-label`, since a placeholder disappears as the user types); `<a href="#">` menu parents (corrected by the menu Plugins' specs: buttons).

Measured for this spec (the ticket records the probes): Foundation's Top Bar docs example does not scroll sideways at 320 CSS px in Chromium, Firefox, or WebKit; its sections stack below 640 px and sit side by side from 640 px; `.stacked-for-medium` keeps them stacked at 640 px and releases them at 1024 px.

### CSS class to Angular mapping

Every class of the three partials, per building-blocks 1.14 item 2. `small` in the value column stands for the Zero breakpoint, the key of `nfsBreakpointsToken`'s map whose value is 0, and `medium` for any other Class breakpoint.

| Foundation class | Kind | Angular | Type; Sass setting and Variant registry | Value shape and the class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.top-bar` | Structural | `NfsTopBar`, `[nfsTopBar]`, static host class | n/a | Always | n/a |
| `.top-bar-left` | Structural | `NfsTopBarLeft`, `[nfsTopBarLeft]`, static host class | n/a | Always | n/a |
| `.top-bar-right` | Structural | `NfsTopBarRight`, `[nfsTopBarRight]`, static host class; provides `nfsTopBarRightToken` (D9) | n/a | Always | n/a |
| `.top-bar-title` | Structural | `NfsTopBarTitle`, `[nfsTopBarTitle]`, static host class | n/a | Always | n/a |
| `.stacked-for-<bp>` | Variant | `stackedFor` of `NfsTopBar` | `NfsClassBreakpoint`; `$breakpoint-classes`, `NfsBreakpointClassesOverrides` (Open Variant family) | A Class breakpoint name: `'medium'` sets `.stacked-for-medium`; the Zero breakpoint sets none and warns in development (Foundation generates no `.stacked-for-small`, and the bar already stacks below `$topbar-unstack-breakpoint`); no value sets none | `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties` |
| `.title-bar` | Structural | `NfsTitleBar`, `[nfsTitleBar]`, static host class | n/a | Always | n/a |
| `.title-bar-left` | Structural | `NfsTitleBarLeft`, `[nfsTitleBarLeft]`, static host class | n/a | Always | n/a |
| `.title-bar-right` | Structural | `NfsTitleBarRight`, `[nfsTitleBarRight]`, static host class | n/a | Always | n/a |
| `.title-bar-title` | Structural | `NfsTitleBarTitle`, `[nfsTitleBarTitle]`, static host class | n/a | Always | n/a |
| `.menu-icon` | Structural | `NfsMenuIcon`, `button[nfsMenuIcon]`, static host class | n/a | Always | n/a |
| `.dark` on `.menu-icon` | Variant | `dark` of `NfsMenuIcon` | `boolean` through `nfsVariantBoolean` (closed) | `true`, the bare attribute, or `'true'` sets `.dark` | None (closed) |

State classes: none. Foundation's three partials define no State class; the menu icon's hover is the `:hover` pseudo-class. The Responsive Toggle's `.hide-for-<bp>`, `.show-for-<bp>`, and `.is-open` on a Title Bar or Top Bar element are that directive's host bindings, written beside these ones (D10). No class is left for the consumer to write (ADR 0039).

Binding rule (building-blocks 1.4). `NfsTopBar` binds one computed class record holding `stacked-for-<bp>` for every breakpoint of `nfsBreakpointsToken`'s map above the Zero breakpoint, `true` for the one `stackedFor` names and `false` for the rest, so a copied `stacked-for-*` class is stripped on the server and in the browser, as the Menu spec measured for its record. `NfsMenuIcon` binds `[class.dark]` to a plain boolean, which strips a copied `dark`. Structural classes written redundantly merge with the static host class and are not reported; the consumer's own classes stay.

### Hierarchy and DI shape

```
ngx-foundation-sites/top-bar          (secondary entry point)
  [nfsTopBar]           NfsTopBar          exportAs 'nfsTopBar'; stackedFor
    [nfsTopBarLeft]     NfsTopBarLeft
    [nfsTopBarRight]    NfsTopBarRight     providers: {provide: nfsTopBarRightToken, useExisting: NfsTopBarRight}
    [nfsTopBarTitle]    NfsTopBarTitle
  [nfsTitleBar]         NfsTitleBar
    [nfsTitleBarLeft]   NfsTitleBarLeft
    [nfsTitleBarRight]  NfsTitleBarRight
    [nfsTitleBarTitle]  NfsTitleBarTitle
  button[nfsMenuIcon]   NfsMenuIcon        exportAs 'nfsMenuIcon'; type, dark
  nfsTopBarRightToken   InjectionToken<NfsTopBarRight>, in its own token file importing the class as a type only
  uses: nfsBreakpointsToken (ngx-foundation-sites/media-query) for the Zero breakpoint and the stacking keys;
        HostAttributeToken('class') and ElementRef in development builds only; the runtime checks of
        ngx-foundation-sites/media-query

read by (their specs):
  the Nested menu root (Accordion Menu, Drilldown, Dropdown Menu, Responsive Menu roots):
      inject(nfsTopBarRightToken, {optional: true}) at construction, for the dropdown Base side (D9)
written beside (their specs):
  [nfsTitleBar][nfsResponsiveToggle], [nfsTopBar][nfsResponsiveToggleMenu], [nfsTopBar][nfsSticky],
  [nfsTitleBar][nfsSticky], button[nfsMenuIcon][nfsToggle], button[nfsMenuIcon][nfsOpen]
```

- No Parent token for the bars. Nothing needs `NfsTopBar` or `NfsTitleBar` through DI: Foundation's CSS styles the sections by DOM ancestry, and the sections' placement check reads the DOM in a development render callback (D13), because a section projected through the consumer's own layout component has no DI path to the bar it sits in.
- `nfsTopBarRightToken` is the one token. It is a lightweight token (building-blocks 1.9): a menu root imports the token, not the directive class. A menu that reaches the right-hand section only through content projection finds no token; the Nested menu root then reads the section from the DOM after hydration and, in development builds, warns naming `alignment="right"`, which puts the side in the server HTML (D9). (The removed advice has no good value to offer: the token's value is the directive instance, and a second `nfsTopBarRight` inside the section binds `.top-bar-right` twice.)
- No Defaults token: none of the three has Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- No host directives. The directives bind different classes and attributes from everything written beside them, so neither side imports the other; `nfsMenu`, `nfsDropdownMenu`, and `nfsButton` inside the bars are their own specs' directives.
- Entry point: `ngx-foundation-sites/top-bar` holds all nine directives and the token, one entry point for the one docs page (building-blocks 1.3). `NfsClassBreakpoint` and `nfsVariantBoolean` come from the primary entry point `ngx-foundation-sites`, as types and a pure function.

### API: `NfsTopBar`

Selector `[nfsTopBar]`; `exportAs: 'nfsTopBar'`; standalone; no template.

```ts
class NfsTopBar {
  readonly stackedFor: InputSignal<NfsClassBreakpoint | undefined>; // default undefined: no class
}
```

| Input | Transform | Default | Foundation equivalent (JSDoc) | Delta |
| --- | --- | --- | --- | --- |
| `stackedFor` | none | `undefined`: no class, Foundation's stacking below `$topbar-unstack-breakpoint` | `.stacked-for-<bp>`; `$breakpoint-classes`; the stacked layout at `<bp>` and below | New input. A Class breakpoint name; no `up`, `only`, or `down`, because Foundation's class means `<bp> down` and has no other form |

- The input declares its explicit type argument, `NfsClassBreakpoint | undefined`, an exported alias whose write type the library's build assertion checks ([ADR 0040](../adr/0040-variant-input-types.md)).
- Host: static `class="top-bar"`; `[class]` bound to the record of the binding rule. No attribute, no listener, no role.
- `$topbar-unstack-breakpoint` is a compile-time Sass setting, never an input (AGENTS.md Design Philosophy 5).

### API: the section and title directives

`NfsTopBarLeft` (`[nfsTopBarLeft]`), `NfsTopBarRight` (`[nfsTopBarRight]`), `NfsTopBarTitle` (`[nfsTopBarTitle]`), `NfsTitleBar` (`[nfsTitleBar]`), `NfsTitleBarLeft` (`[nfsTitleBarLeft]`), `NfsTitleBarRight` (`[nfsTitleBarRight]`), and `NfsTitleBarTitle` (`[nfsTitleBarTitle]`): standalone, no template, no inputs, models, outputs, or methods, and no `exportAs`; each binds its Structural class as a static host class. `NfsTopBarRight` also provides `nfsTopBarRightToken`. `NfsTitleBarTitle` binds only its class: the consumer writes a static `id` when the menu icon is named from it, because a generated id would differ between server and client and a static one is hydration-safe (RT6 of the out-of-scope triage). Any element may host them: Foundation's docs use `div` and `span`, and a `nav` or `header` gives a landmark (ARIA and keyboard).

### API: `NfsMenuIcon`

Selector `button[nfsMenuIcon]`; `exportAs: 'nfsMenuIcon'`; standalone; no template.

```ts
class NfsMenuIcon {
  readonly type: InputSignal<'button' | 'submit' | 'reset'>;             // default 'button'
  readonly dark: InputSignalWithTransform<boolean, NfsVariantBoolean>;   // default false
}
```

| Input | Type and transform | Default | Foundation equivalent (JSDoc) | Delta |
| --- | --- | --- | --- | --- |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Docs: `type="button"` on every menu icon | New default, the [Spec: Close Button](../issues/83-spec-close-button.md)'s: HTML's missing-value default for `<button type>` is the Auto state, which submits a form |
| `dark` | `boolean`, `nfsVariantBoolean` | `false` | `.menu-icon.dark` | New input |

- Host: static `class="menu-icon"`; `[class.dark]` bound to `dark()`; `[attr.type]` bound to `type()`. A static `type` attribute or a `[type]` binding feeds the input; a consumer `[attr.type]` loses to the host binding and is never shown.
- Models, outputs, and methods: none. The native `click` is the API, and the Trigger beside it handles it. The directive declares no listener.
- Opening: never built in. The Responsive Toggle's bare `nfsToggle`, a `[nfsOpen]` or `[nfsToggle]` Trigger, or the consumer's `(click)` sits beside `nfsMenuIcon` on the same element; `nfsMenuIcon` never hosts a Trigger, because host directives are static and a hosted Trigger could not be left off an icon with the consumer's own handler (the Close Button's D2 reasoning).
- The drawing stays Foundation's: the icon's content box is `hamburger()`'s 20 by 16 px, and the consumer writes no content inside the button beyond visually hidden text when that is its name.

### Development checks and runtime checks

Development checks run in the first client render callback, only when `ngDevMode` is on (never on the server, never in production), each warning once per instance through `console.warn`:

1. `NfsMenuIcon`, no accessible name. The name, taken in accessible-name order from the text of the elements `aria-labelledby` references, then a non-blank `aria-label`, then text inside the button (visually hidden text included, `aria-hidden="true"` subtrees excluded), then `title`, is empty: "nfsMenuIcon: this menu icon has no accessible name; point aria-labelledby at the title bar's title, or add aria-label, for example aria-label="Menu"". The [Spec: Close Button](../issues/83-spec-close-button.md)'s check 1, with the menu icon's wording.
2. `NfsMenuIcon`, a name with no letter or digit (a pasted "U+2630" trigram, a dash): "nfsMenuIcon: this menu icon's name is only a symbol; name what it opens". The Close Button's check 2.
3. `NfsMenuIcon` whose host also carries `.button` or `.close-button` (`nfsButton` or `nfsCloseButton` on the same element): "nfsMenuIcon and nfsButton on one element: .menu-icon and .button are separate class contracts; remove nfsButton" (or `nfsCloseButton`).
4. `NfsMenuIcon` whose rendered box, read in the read phase when the button is rendered (a non-zero box), is under 24 by 24 CSS px: "nfsMenuIcon: the menu icon is <w> by <h> px, under the 24 by 24 px target size (WCAG 2.5.8); include @include nfs-menu-icon; after foundation-menu-icon". A hidden icon (a Title Bar hidden by the Responsive Toggle at a wide viewport) is not measured.
5. A copied Foundation class, read through `HostAttributeToken('class')` in development builds only: `dark` on the menu icon names `dark`; `stacked-for-<bp>` on the Top Bar names `stackedFor="<bp>"`. This is building-blocks 1.4's rule for copied classes; the binding rule has already stripped them.
6. `NfsTopBar` with `stackedFor` naming the Zero breakpoint: "Foundation generates no stacked-for-<zero>; the Top Bar stacks below $topbar-unstack-breakpoint".
7. `NfsTopBarLeft` or `NfsTopBarRight` with no `.top-bar` ancestor, and `NfsTitleBarLeft` or `NfsTitleBarRight` with no `.title-bar` ancestor, read by DOM ancestry (D13): the warning says the section is laid out only inside its bar. The title directives are not checked, because Foundation styles their classes anywhere.

Runtime checks ([ADR 0040](../adr/0040-variant-input-types.md), configured by `provideNfsRuntimeChecks` and `provideNfsProductionRuntimeChecks` of `ngx-foundation-sites/media-query`, whose spec defines how a directive reports): while `stackedFor` is bound, `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list (drift between the Variant declaration file and the compiled Sass) and a value that is not one class token, and `strictVariantProperties` reports a missing `--nfs-breakpoint-classes`, naming `@include nfs-breakpoint-properties;`. `dark` is closed and needs none. They run in the browser after the first render, never on the server.

### Comparison with Angular Material (`mat-toolbar` and the navigation schematic's toggle, 22.2)

| Concern | Material | This spec |
| --- | --- | --- |
| Kind | `mat-toolbar`, a component with a template of two `ng-content` slots; `mat-toolbar-row` directives | Attribute directives on the consumer's elements; no template |
| Layout variants | `mat-toolbar-single-row` or `mat-toolbar-multiple-rows` from the rows found by a content query; an error when rows and loose content mix | `stackedFor` and Foundation's `$topbar-unstack-breakpoint`; sections by directive; no content query |
| Colour | `color` input (M2 themes only) | Foundation's `$topbar-*` and `$titlebar-*` settings, checked at compile time; `dark` on the icon |
| Roles | None on the toolbar | None; landmarks are the consumer's elements |
| Menu toggle | The schematic's `button[matIconButton]` with `type="button"`, `aria-label="Toggle sidenav"`, and a 48 px touch target inside the button | `button[nfsMenuIcon]` with a `type` input defaulting to `button`, a development name check, and a 24 px box from the Library mixin |
| Opening | The consumer's `(click)="drawer.toggle()"` | A Trigger or the consumer's handler beside the icon |
| Testing | `MatToolbarHarness` | DOM-first assertions; no harness |

Borrowed: no role on the bar, and the icon button's explicit `type="button"` and required name. Not borrowed: a component with a template (Foundation generates nothing), content queries for layout (CSS does it), a colour input (Sass settings are the theme), and a touch-target element inside the button (the box itself is enlarged, D6).

### Implementation level and primitives

Implementation level: native platform. The bars are elements the consumer writes, laid out by Foundation's CSS; the menu icon is a native `<button>`, whose role, focus, Enter and Space activation, and `type` contract are the browser's. `@angular/aria` is not used: its `ngToolbar` is a composite of controls with one roving tab stop, which the APG does not use for site navigation, and a navigation bar keeps every link in the tab order ([ADR 0004](../adr/0004-menus-use-disclosure-navigation.md)). `@angular/cdk` is not needed: nothing is measured outside a development check, focused, or observed. The Angular layer is static host classes, one `computed` class record, two host bindings on the icon, and one provider.

Primitives: `input()`, `computed()`, static host classes, `[class]`, `[class.dark]`, and `[attr.type]` host bindings, one `useExisting` provider, `nfsBreakpointsToken`, `nfsVariantBoolean`, and, in development builds only, `HostAttributeToken('class')`, `ElementRef`, and one `afterNextRender` read callback per directive that checks something. `injectAsync`, `effect`, and `afterEveryRender` are not used.

Fallback: none needed. The two behaviours this spec depends on beyond host bindings were measured: the 24 px box around an unchanged drawing in three engines (D6), and the class record's stripping, which the Menu spec measured under a server render with Angular 22.2.0.

### ARIA and keyboard

APG pattern: none of their own. A Top Bar holds site navigation (a list of links, or Disclosure Navigation once a menu Plugin root is present, [ADR 0004](../adr/0004-menus-use-disclosure-navigation.md)); the menu icon is a Button whose ARIA state comes from its Trigger's role.

| Element or state | Rendered semantics | Owner |
| --- | --- | --- |
| `[nfsTopBar]` | The consumer's element: a `header` (a `banner` landmark when it is the page's top-level header), a `nav`, or a `div`; no `role` attribute | Consumer |
| Navigation in the bar | A `nav` with `aria-label` or `aria-labelledby` around each menu, or on a section element (`<nav nfsTopBarLeft aria-label="Main">`); a distinct name per landmark | Consumer |
| Search in the bar | A `form` with `role="search"` and a label on its field (`aria-label` or a visually hidden `label`); the button is `nfsButton type="submit"` | Consumer ([Spec: Forms](../issues/98-spec-forms.md), [Spec: Button](../issues/37-spec-button.md)) |
| Sections and titles | Generic elements; a title may be a heading or a link the consumer writes | Consumer |
| `button[nfsMenuIcon]` | Native `button`, `type="button"` unless the consumer sets another | `nfsMenuIcon` |
| Menu icon name | `aria-labelledby` pointing at the `nfsTitleBarTitle` element's static `id` (visible text beats `aria-label`), visually hidden text inside the button (`nfsShowForSr` of the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)), or `aria-label`; checked in development | Consumer |
| Menu icon state | `aria-expanded` and `aria-controls` from a disclosure Trigger (Responsive Toggle, an Off-canvas panel); `aria-haspopup="dialog"` and `aria-controls` without `aria-expanded` from the Trigger of an Off-canvas panel in Modal mode; nothing from `nfsMenuIcon` | [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) |
| Current page in a Top Bar menu | `aria-current` on the link, styled by `nfs-menu` | [Spec: Menu](../issues/85-spec-menu.md) |

Keyboard: native only. Tab and Shift+Tab reach the menu icon and the links in DOM order; Enter and Space activate the icon; the directives add no key handling and change no tab order. A menu Plugin inside the bar keeps its own keyboard table.

Focus: the directives move no focus. The Openable that the icon's Trigger opens owns focus on open and close (the Responsive Toggle keeps focus on the icon; an Off-canvas panel moves it into the panel and returns it).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA ([ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md)). Ratios are computed from Foundation 6.9.0's default settings with the exact WCAG formula and compared unrounded (D8); sizes were measured by this spec's ticket on Foundation's compiled CSS in Chromium, Firefox, and WebKit (Playwright 1.63, axe-core 4.13.0), which agree to the pixel.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 2.5.8 Target Size (Minimum) | Every menu icon's box is at least 24 by 24 CSS px, by size and not by the spacing exception. `nfs-menu-icon` gives every `.menu-icon` a transparent border on a content box, 4 px above and below and 2 px left and right of `hamburger()`'s 20 by 16 px, so the border box is 24 by 24 while the padding box, the bars' containing block, keeps its size: the drawing is pixel-identical to Foundation's in three engines. A transparent pseudo-element hit area takes the same pointer hits, but axe measures only the element's box, and two icons side by side fail its `target-size` rule with Foundation's box and with the pseudo-element, and pass with the border, in all three engines (D6) | Fails the size test: 20 by 16 px, no size setting. Inside a title bar Foundation's `$titlebar-icon-spacing` keeps axe's spacing exception passing; next to another target outside one, axe reports a violation | Every play function asserts each menu icon's box is at least 24 by 24; axe `target-size` in every story; e2e: the box in three engines, and `elementFromPoint` 1.5 px outside the drawing's left and right edges and 3.5 px outside its top and bottom returns the button; development check 4; node-level Sass test of the rule |
| 1.4.11 Non-text Contrast | The bars reach 3:1 against the surface they sit on, at rest and on hover. The light icon's `$titlebar-icon-color` and `$titlebar-icon-color-hover` against `$titlebar-background`: `nfs-title-bar` stops the compile with `@error`. The dark icon's `$black` and `$dark-gray` against `$body-background`: `nfs-menu-icon` warns (`@warn`), because a dark-page application may use only the light icon. A menu icon on the Top Bar: `nfs-top-bar` warns when neither icon reaches 3:1 at rest and on hover against `$topbar-background`, because an icon there is a placement Foundation's Sass allows (`.top-bar-title .menu-icon`) but its docs never show. axe has no 1.4.11 rule | Light icon on the title bar: 19.63:1, hover 12.08:1. Dark icon on the page: 19.63:1, hover 3.42:1. On the default Top Bar (`$light-gray`): light icon 1.24:1; dark icon 15.86:1 but its hover 2.77:1, so neither passes | Node-level Sass compile tests (a `$titlebar-icon-color-hover: #333` stops the compile at 1.57:1); `top-bar--menu-icon` computes each icon's bar colour against its surface from computed styles and asserts at least 3:1 |
| 1.4.3 Contrast (Minimum) | Links reach 4.5:1 against the Top Bar and its submenus: `nfs-top-bar` stops the compile with `@error` naming the setting when `$anchor-color` is under 4.5:1 against `$topbar-background`, or against `$topbar-submenu-background` where that differs; a translucent bar is composited over `$body-background` first, and a translucent submenu background warns, because text over page content has no known contrast. The title text reaches 4.5:1 on the title bar: `nfs-title-bar` stops the compile when `$titlebar-color` is under 4.5:1 against `$titlebar-background`. Required setting: a bar background on which `$anchor-color` reaches 4.5:1, for example `$topbar-background: $white;`, and, when that override is written after Foundation's settings file is imported, `$topbar-submenu-background: $topbar-background;` too, because the settings file assigns the submenu background from the bar's value at import time. A Top Bar or Title Bar made sticky ([Spec: Sticky](../issues/28-spec-sticky.md)) that overlaps content while stuck needs an opaque bar background: a transparent `$topbar-background` passes this check against `$body-background`, not against the content a stuck bar covers. | Fails: `$anchor-color` (`#1779ba`) on `$light-gray` (`#e6e6e6`) is 3.76:1 on the bar and in its submenus. With `$topbar-background: $white` alone set after the settings file, open submenus keep `#e6e6e6` and axe fails their links in three engines; with both lines they pass. Title text 19.63:1 | Node-level Sass compile tests; axe `color-contrast` in every story, `top-bar--basic` with a submenu open, under the Storybook settings overrides |
| 1.4.1 Use of Color | The current link's fill (`nfs-menu`'s `aria-current` look) differs from the bar by at least 3:1: `nfs-top-bar` stops the compile when `$menu-item-background-active` is under 3:1 against `$topbar-background` (and the submenu background where it differs), the pair the Menu spec leaves to this spec because `nfs-menu` compares with `$body-background` only | Passes: 3.76:1 on `$light-gray`, 4.65:1 on `$white` | Node-level Sass compile test; `top-bar--current-page` computes the ratio between the current link's background and the bar's |
| 1.4.10 Reflow | At 320 CSS px the sections are stacked (below `$topbar-unstack-breakpoint`) and the page does not scroll sideways; menus in the bar wrap. `nfs-top-bar` warns when `$topbar-unstack-breakpoint` is the Zero breakpoint, since the sections would then never stack | Passes: Foundation's docs example measures `scrollWidth` 320 at 320 px in three engines | e2e at 320 by 640 px on `top-bar--basic` and `top-bar--responsive`: `scrollWidth <= 320` |
| 2.4.7 Focus Visible | The browser's focus ring on the menu icon, drawn around its 24 px box, and on every link; the library removes no outline, and Foundation's `disable-mouse-outline` never matches because the library never loads what-input | Passes | e2e: a screenshot comparison before and after Tab to the menu icon in three engines |
| 2.4.11 Focus Not Obscured (Minimum) | A sticky or fixed Top Bar or Title Bar must not hide the focused element: the [Spec: Sticky](../issues/28-spec-sticky.md)'s required `scroll-padding-top` applies | Passes in Foundation's in-flow layout | The Sticky spec's e2e case |
| 4.1.2 Name, Role, Value | The menu icon is a native button with a name (development checks 1 and 2) and the state its Trigger renders | Fails: the docs' icon has no name (axe `button-name` violation, measured) | axe `button-name` in every story; browser-level tests of the checks; SSR smoke |
| 2.5.3 Label in Name | A menu icon named from the title bar's visible title has that title as its name | Passes where named that way | Play functions find the icon by `getByRole('button', {name})` |
| 1.3.1 Info and Relationships | Navigation sits in named `nav` landmarks, lists stay lists, the search field is labelled; the bars add no role | Foundation's docs example has no landmark, and its search field is named only by a placeholder | axe in every story; play functions find `getByRole('navigation', {name})` and `getByRole('searchbox', {name})` |

The story gate runs axe with the six tags of ADR 0018 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) and `parameters.a11y.test = 'error'`.

Forced colours (not a WCAG 2.2 AA criterion; measured under Chromium's forced-colours emulation): Foundation's bars are a `::after` background and `box-shadow`s, which forced colours remove, so Foundation's menu icon disappears; with `nfs-menu-icon` the transparent border is drawn in the system colour, so the icon shows as a 24 px outlined box the user can find and press. Drawing the bars themselves would mean restating `hamburger()`'s offsets, a copy of Foundation's values, and is not done.

### Rendered HTML

Consumer markup and the resulting DOM. Server HTML and hydrated DOM are identical in every example: every value comes from inputs and `nfsBreakpointsToken`. The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM (serialised in lowercase). Class order is not significant. Menu, Dropdown Menu, Button, and Responsive Toggle markup belongs to those specs.

```html
<!-- Foundation's Top Bar docs example: a Dropdown Menu on the left, a search on the right -->
<header nfsTopBar>
  <nav nfsTopBarLeft aria-label="Main">
    <ul nfsDropdownMenu>
      <li nfsMenuText>Site Title</li>
      <li nfsMenuItem>
        <button nfsSubmenuToggle type="button">One</button>
        <ul nfsSubmenu>
          <li nfsMenuItem><a href="/one/first">First</a></li>
        </ul>
      </li>
      <li nfsMenuItem><a href="/two" aria-current="page">Two</a></li>
    </ul>
  </nav>
  <div nfsTopBarRight>
    <form role="search" aria-label="Site">
      <ul nfsMenu>
        <li><input type="search" aria-label="Search the site" placeholder="Search"></li>
        <li><button nfsButton type="submit">Search</button></li>
      </ul>
    </form>
  </div>
</header>
<header class="top-bar">
  <nav class="top-bar-left" aria-label="Main">
    <ul class="menu dropdown">...</ul>
  </nav>
  <div class="top-bar-right">
    <form role="search" aria-label="Site">
      <ul class="menu">
        <li><input type="search" aria-label="Search the site" placeholder="Search"></li>
        <li><button class="button" type="submit">Search</button></li>
      </ul>
    </form>
  </div>
</header>

<!-- Stacked through the medium breakpoint -->
<div nfsTopBar stackedFor="medium">...</div>
<div class="top-bar stacked-for-medium">...</div>

<!-- A title in the bar, and a right-hand Dropdown Menu that opens to the left (its classes per its spec) -->
<div nfsTopBar>
  <div nfsTopBarTitle><a href="/">Acme</a></div>
  <nav nfsTopBarRight aria-label="Account">
    <ul nfsDropdownMenu>...</ul>
  </nav>
</div>
<div class="top-bar">
  <div class="top-bar-title"><a href="/">Acme</a></div>
  <nav class="top-bar-right" aria-label="Account">
    <ul class="menu dropdown">
      <li class="is-dropdown-submenu-parent opens-left">...</li>
    </ul>
  </nav>
</div>

<!-- Foundation's Advanced Layout: the Responsive Toggle written beside the Title Bar and the Top Bar -->
<div nfsTitleBar [nfsResponsiveToggle]="menu" hideFor="medium">
  <button nfsMenuIcon nfsToggle aria-labelledby="site-menu-title"></button>
  <div nfsTitleBarTitle id="site-menu-title">Menu</div>
</div>
<nav nfsTopBar nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" id="site-menu" aria-label="Main">
  <div nfsTopBarLeft>...</div>
</nav>
<div class="title-bar hide-for-medium">
  <button class="menu-icon" type="button" aria-labelledby="site-menu-title"
          aria-expanded="false" aria-controls="site-menu" jsaction="click:;"></button>
  <div class="title-bar-title" id="site-menu-title">Menu</div>
</div>
<nav class="top-bar show-for-medium" id="site-menu" aria-label="Main">
  <div class="top-bar-left">...</div>
</nav>

<!-- An Off-canvas title bar: two named menu icons opening two panels -->
<div nfsTitleBar>
  <div nfsTitleBarLeft>
    <button nfsMenuIcon [nfsOpen]="left" aria-label="Open navigation"></button>
    <span nfsTitleBarTitle>Foundation</span>
  </div>
  <div nfsTitleBarRight>
    <button nfsMenuIcon [nfsOpen]="right" aria-label="Open account panel"></button>
  </div>
</div>
<div class="title-bar">
  <div class="title-bar-left">
    <button class="menu-icon" type="button" aria-label="Open navigation"
            aria-expanded="false" aria-controls="offcanvas-left" jsaction="click:;"></button>
    <span class="title-bar-title">Foundation</span>
  </div>
  <div class="title-bar-right">...</div>
</div>

<!-- A dark menu icon on a light header, named by visually hidden text -->
<button nfsMenuIcon dark nfsToggle><span nfsShowForSr>Menu</span></button>
<button class="menu-icon dark" type="button" aria-expanded="false" aria-controls="..." jsaction="click:;">
  <span class="show-for-sr">Menu</span>
</button>

<!-- Copied Foundation classes are stripped (and reported in development builds) -->
<div nfsTopBar class="stacked-for-large site-header">...</div>
<div class="top-bar site-header">...</div>
```

The Trigger attributes (`aria-expanded`, `aria-haspopup`, `aria-controls`, `jsaction`) and the Responsive Toggle's `.hide-for-medium` and `.show-for-medium` belong to those specs; the Dropdown Menu's `opens-left` in the server HTML follows D9 once the Nested menu root reads `nfsTopBarRightToken`. `nfsShowForSr` is the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive for `.show-for-sr`, imported as `NfsShowForSr` from `ngx-foundation-sites/visibility`. None of the nine directives causes a `jsaction` attribute: they declare no listeners.

### Animation

None. Foundation's three partials declare no transition or animation, and no directive inserts, removes, or animates anything, so ADR 0003's mechanics have nothing to govern and no `prefers-reduced-motion` override is needed. A title-bar menu that animates in belongs to the Responsive Toggle, and the menu icon's hover colour change is instant.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every Structural class, `.stacked-for-<bp>`, `.dark`, and `type` exactly as the hydrated DOM does (rule 1). Foundation's CSS and the `nfs-menu-icon` rule style the first paint, and the stacking is Foundation's media queries, correct at every width without knowing the viewport.
- The Base side: `nfsTopBarRightToken` is resolved when the menu root is constructed, on the server as in the browser, so a Dropdown Menu in the right-hand section carries `opens-left` in the server HTML and nothing changes at hydration (D9). A DOM walk would have to wait for a render callback. A menu projected into the section from another template has no token; its closed submenus change side once in the first render callback after hydration, which the Nested menu root reports in development.
- Before hydration: construction reads inputs, DI, and `nfsBreakpointsToken` only; nothing touches the DOM outside host bindings, reads `window`, measures, or starts a timer (rules 3 to 5). The development checks run in `afterNextRender`, which never runs on the server.
- Full hydration: class and attribute values equal the server's; there is no structure to mismatch and no `ngSkipHydration` (rule 10).
- Incremental hydration: the bars register nothing, so they need no hydration boundary of their own. A menu icon and the Openable its Trigger opens follow the Triggers utility's rule (one boundary), and a menu root that reads the token needs only to be declared inside the right-hand section, in any block.
- Event replay: the directives declare no listeners, so they add nothing to queue or replay. A pre-hydration press on a menu icon replays through the Trigger beside it (the Triggers spec).
- `@defer`: library templates contain no `@defer`; the entry point is its own, so a consumer can defer a header. Inside a dehydrated block the bars are their server HTML and their links navigate natively. Inside `@defer (hydrate never)` they keep Foundation's look and working links; a menu icon there is a styled native button that opens nothing, because its Trigger never runs, which the Responsive Toggle and Off-canvas specs state for their bars.
- Prerendering: identical to server rendering; nothing reads a request token (rule 11).
- Zoneless: no zone is used; all state is inputs.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes on each element, the menu icon's role, name, `type`, and box, whether the sections are stacked at a width, which side a right-hand menu opens to, and what the server HTML contains. No test reads a directive's fields. Prior art: the [Spec: Menu](../issues/85-spec-menu.md) layers (class record, copied-class warnings, a listener-free directive), the [Spec: Close Button](../issues/83-spec-close-button.md) name checks and box assertions, and this ticket's three-engine probe.

Story ids follow `top-bar--<story>`, `meta.id: 'top-bar'`, title `CSS-only components/Top Bar`: `top-bar--basic` (Foundation's docs example with a submenu open), `top-bar--stacked-for` (arg `stackedFor`), `top-bar--current-page`, `top-bar--title-bar` (the Off-canvas docs' title bar with two named icons and `[nfsOpen]` Triggers on story panels), `top-bar--menu-icon` (the light icon in a title bar, the dark icon on the page and on the Top Bar, each named another way), `top-bar--responsive` (the Advanced Layout with `nfsResponsiveToggle`), `top-bar--rtl`, and `top-bar--fixture` (args for every input, `!autodocs`, for e2e). Menus, buttons, and Triggers in the stories are their specs' directives, imported as scaffolding; no story writes a Foundation or library class. No Anti-pattern story.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six WCAG 2.2 AA tags (ADR 0018), under the Storybook preview stylesheet with `nfs-menu-icon`, `nfs-title-bar`, and `nfs-top-bar` included and the settings overrides of the Sass subsection; every play function asserts that each menu icon's box is at least 24 by 24 px.

- `top-bar--basic`: the bar, both sections, and the menus carry their classes; at the story viewport (below `medium`) the right section's top is at or below the left section's bottom; the navigation is found by `getByRole('navigation', {name: 'Main'})` and the field by `getByRole('searchbox', {name: 'Search the site'})`; with a submenu opened by its toggle, axe still passes, which the submenu settings line makes true.
- `top-bar--stacked-for` (arg `stackedFor`): each value sets exactly its `stacked-for-*` class; no value sets none.
- `top-bar--current-page`: `getByRole('link', {current: 'page'})` finds one link; the ratio between its computed background and the bar's computed background is at least 3:1.
- `top-bar--title-bar`: both icons are found by name, carry `.menu-icon` and `type="button"`, and open their panels on click; the title carries `.title-bar-title`.
- `top-bar--menu-icon`: the dark icons carry `.dark`; for each icon, the ratio between its `::after` computed background colour, at rest and after `userEvent.hover`, and the computed background of the surface behind it is at least 3:1; the icon named by `aria-labelledby` has the title's text as its name.
- `top-bar--responsive`: the menu icon's name is the title's text; a click toggles the Responsive Toggle's `aria-expanded` and classes (that spec's assertions), while the Top Bar and Title Bar classes stay unchanged.
- `top-bar--rtl`: under `dir="rtl"` the left-hand section's box is right of the right-hand section's once unstacked (e2e) and no class changes with direction.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directives, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM state; no story is mounted and no axe runs here.

- Classes: each directive binds its Structural class; `stackedFor` sets `stacked-for-<bp>` for every non-zero breakpoint and none for the Zero breakpoint, with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose Zero breakpoint is `xs` and whose map adds `xlarge`; changing the value moves the class; `dark` follows `true`, the bare attribute, `'true'`, and `'false'`.
- Binding rule: a static `class="stacked-for-large site-header"` on `nfsTopBar` is stripped with no input and with `stackedFor="medium"`, and the application class stays; a static `dark` on `nfsMenuIcon` is stripped while `dark` is false; a redundant `top-bar` or `menu-icon` merges and is not reported.
- `type`: `button` by default, a static `type="submit"` and a changing `[type]` binding win.
- Token: a test directive standing for a menu root injects `nfsTopBarRightToken` with `{optional: true}` at construction; it receives the `NfsTopBarRight` inside a right-hand section, through an embedded view and a child component's template, and nothing inside a left-hand section or outside the bar; a test menu root projected into the section through a test layout component receives no token.
- Development checks: each of checks 1 to 7 warns once for its case and not for correct markup (every name source, `aria-label=""`, an `aria-labelledby` to a missing id, a symbol-only name, `nfsButton` and `nfsCloseButton` on the icon, a box under 24 px with the mixin's rule absent from the test document, a hidden icon not measured, copied classes, a Zero-breakpoint `stackedFor`, sections inside and outside their bars, a section projected into a bar through a test layout component not reported); nothing is checked when `ngDevMode` is false or during a server render.
- Runtime checks: with `--nfs-breakpoint-classes: small medium large` on the test document, `stackedFor="medium"` is silent and `'xlarge'` through `$any()` reports once under `strictVariantNames`; with the property absent and `stackedFor` bound, `strictVariantProperties` reports once, naming `nfs-breakpoint-properties`; an unbound `stackedFor` requests nothing.
- Composition: with a test Openable, a bare `nfsToggle` beside `nfsMenuIcon` toggles it and renders `aria-expanded`; `nfsMenuIcon` adds no ARIA of its own.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture with each Rendered HTML example, through the shared `renderServer()` helper in `<name>.ssr.spec.ts` under `npx nx test <lib>`. Assert `whenStable()` resolves; the HTML matches the Rendered HTML section (every Structural class, `stacked-for-medium`, `dark`, `type="button"`, the copied classes absent and the application class present); a test menu root inside the right-hand section reports that it found the token during the server render; no `jsaction` from these directives; no `role` attribute and no inline `style` from them; no development warning logged. `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not.
- Pure logic: the `stackedFor`-to-class function, table-driven over every Class breakpoint and a renamed Zero breakpoint.
- Sass compile (the library's node-level Sass test), over Foundation's defaults plus the required settings unless a case says otherwise:
  - `nfs-menu-icon` after `foundation-menu-icon` emits exactly `.menu-icon { box-sizing: content-box; border: solid transparent; border-width: 4px 2px; }`; the compiled `foundation-menu-icon` still declares `width: 20px` and `height: 16px` for `.menu-icon` (the guard on the drawing size the rule assumes, as ADR 0012 guards `-zf-bp-to-em`); `$body-background: #202020` warns for the dark icon.
  - `nfs-title-bar` emits no CSS; `$titlebar-color: #555` stops the compile (2.66:1), and so does `$titlebar-icon-color-hover: #333` (1.57:1).
  - `nfs-top-bar` emits no CSS; Foundation's defaults stop the compile naming `$anchor-color` on `$topbar-background` (3.76:1); `$topbar-background: $white` set after the settings file without the submenu line stops it naming `$topbar-submenu-background` (3.76:1); both lines compile; `$topbar-background: transparent` with `$topbar-submenu-background: $white` compiles (the bar composited over the page); a translucent `$topbar-submenu-background` warns; a darker `$anchor-color` on the default bar compiles and warns that no menu icon reaches 3:1 on the bar; `$topbar-unstack-breakpoint: small` warns.
  - The exact-formula helper returns 2.94:1 for `#116666` on `#0a0a0a` and 4.44:1 for `#1177dd` on `#0a0a0a`, the two false passes of Foundation's `color-luminance()` below 3:1 and 4.5:1 that the ticket measured.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Only what needs a real engine or the fixture app. Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Target size (2.5.8): every menu icon in `top-bar--title-bar`, `top-bar--menu-icon`, and `top-bar--responsive` has a 24 by 24 px box, and `elementFromPoint` 1.5 px outside its drawing's left and right edges and 3.5 px outside its top and bottom edges returns the button.
- Stacking on `top-bar--fixture`: the sections are stacked at 639 px and side by side at 640 px; with `stackedFor="medium"` stacked at 640 and 1023 px and side by side at 1024 px.
- Reflow (1.4.10): at 320 by 640 px, `top-bar--basic` and `top-bar--responsive` with the menu open have `scrollWidth <= 320`.
- Focus visible (2.4.7): a screenshot comparison before and after Tab to the menu icon in `top-bar--title-bar` shows a focus indicator.
- RTL: on `top-bar--rtl` at 1024 px the left-hand section sits right of the right-hand section.
- Forced colours, Chromium and Firefox (`page.emulateMedia({forcedColors: 'active'})`): the menu icon's 24 px border box has non-background pixels, so the control stays visible.

Against the prerendered fixture app, one route with a Top Bar holding a Dropdown Menu in each section, the Advanced Layout, and a Top Bar inside `@defer (hydrate never)`:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; the right-hand Dropdown Menu's parents carry `opens-left`.
- Hydration: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`; the class attributes of every bar, section, icon, and menu parent are identical before and after hydration.
- `hydrate never`: the block's links navigate and keep Foundation's look.

## Out of Scope

- The Responsive Toggle's behaviour on a Title Bar and a Top Bar (its Visibility classes, `isOpen`, animation, and focus rule): the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md), whose directives are written beside these.
- The menus inside the bars and their Base side rule: the [Spec: Menu](../issues/85-spec-menu.md), the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), and the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), which read `nfsTopBarRightToken` (D9).
- The Triggers that make a menu icon open something: the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md).
- Sticky bars: the [Spec: Sticky](../issues/28-spec-sticky.md), written beside `nfsTopBar` or `nfsTitleBar`.
- A default or localised menu-icon name, an `aria-label` input, a generated title id, and a `for` link from the title to the icon (D5, D11).
- A menu icon on `<a>` or other hosts, and a menu icon of the library's own drawing, sizes, or bar count (Foundation's `hamburger()` arguments are not settings).
- The bars drawn under forced colours (restating `hamburger()`'s offsets would copy Foundation's values).
- A `role` on any bar, and an Aria `ngToolbar` (D14).
- The `.no-js` FOUC recipe, which the Responsive Toggle replaces with Visibility classes.
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Nine attribute directives, one per Structural class, in the entry point `ngx-foundation-sites/top-bar`: `nfsTopBar`, `nfsTopBarLeft`, `nfsTopBarRight`, `nfsTopBarTitle`, `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarRight`, `nfsTitleBarTitle`, `button[nfsMenuIcon]` | ADR 0039 and ADR 0001: every Structural class is bound by its directive, and Foundation generates nothing; one entry point per docs page (the user's packaging decision). `nfsTopBarTitle` joins the triage's eight: Foundation's Sass styles `.top-bar-title` though its docs page does not show it | A Top Bar component with slots (Material's toolbar shape; it would re-render the consumer's markup); one `side` input on a single section directive (two Structural classes); three entry points (three imports for one docs page) |
| D2 | `stackedFor` on `NfsTopBar`: a bare Class breakpoint name, `.stacked-for-<name>`; the Zero breakpoint sets none and warns; one class record strips copied classes | Building-blocks 1.4: a `<words>-for-<bp>` class keeps Foundation's words; Foundation's class means `<bp> down` and has no `up` or `only` form, so a query type would offer values with no class | `NfsClassBreakpointQuery<'down'>` (`'medium down'` only restates the class's meaning); a rules object (the family is one breakpoint, not a value per breakpoint); a boolean `stacked` (Foundation has no bare `.stacked` for the Top Bar) |
| D3 | `dark` boolean on `NfsMenuIcon` through `nfsVariantBoolean` | Building-blocks 1.4 naming rule 4 and the closed-family type | `color` or `theme` enums (one on or off class) |
| D4 | `button[nfsMenuIcon]` binds `.menu-icon`, `type` defaults to `button`, and it opens nothing: a Trigger or the consumer's handler sits beside it, never hosted | The [Spec: Close Button](../issues/83-spec-close-button.md)'s D2 and D3: Foundation's icon is a look, host directives are static, and `type` prevents an accidental submit | Hosting `nfsToggle` (every icon would carry `jsaction`, and a consumer handler could not replace it); any element as host (a button's role, focus, and keys come free) |
| D5 | Development name checks (none, symbol only); no default name | Foundation's docs icon is unnamed; only the consumer knows what the icon opens; the Close Button's shape | `aria-label="Menu"` by default (an English library string that names nothing specific); a required `aria-label` input (rules out `aria-labelledby` to the visible title, the best name) |
| D6 | 2.5.8 by a transparent border on a content box: `box-sizing: content-box; border: solid transparent; border-width: 4px 2px` on every `.menu-icon`, in `nfs-menu-icon` | Measured in three engines: the border box is 24 by 24, the drawing on the padding box is pixel-identical to Foundation's, the title bar keeps its 40 px height (its title moves 4 px), and axe's `target-size` passes two adjacent icons that it fails with Foundation's box and with a pseudo-element; the floor-first rule of building-blocks 1.10 then covers the hamburger too, since only the box grows. The 4 px and 2 px come from `hamburger()`'s 20 by 16 px default size, which `foundation-menu-icon` exposes no setting for; a node-level compile test guards it | The transparent `::before` hit area of the published Responsive Toggle spec (pointer hits land, but axe cannot see it, so the gate cannot prove 2.5.8 next to another target); `min-width`/`min-height` or padding (the `::after` bars would stretch to the new box); scoping the rule to `.title-bar .menu-icon` (leaves icons elsewhere without it) |
| D7 | Three Library mixins, one per Foundation export mixin: `nfs-menu-icon` (the rule and the dark icon's check), `nfs-title-bar` (checks only), `nfs-top-bar` (checks only) | ADR 0012's consequence, one `nfs-` include after each matching `foundation-` include; each check runs only for a component the consumer compiles, so an Off-canvas application with a title bar and no Top Bar is not stopped by the Top Bar's link check | One `nfs-top-bar` for the whole entry point (a title-bar-only application would have to set `$topbar-background` for a bar it never shows, or lose the hit area); keeping the hit area in `nfs-responsive-toggle` (an Off-canvas title bar would include another Plugin's mixin, the triage's objection) |
| D8 | Contrast checks with the exact WCAG formula through a library helper (`math.pow`), unrounded; `@error` for pairs the component always draws, `@warn` for pairs that exist only in a placement the consumer may not use | ADR 0022 and building-blocks 1.10 ask for the unrounded ratio. Foundation's `color-luminance()` raises to the power 2.4 through its `pow()` and `nth-root()` approximation and overstates some ratios: in a 16-step colour grid against `#fefefe` and `#0a0a0a` it passes 26 pairs the exact formula fails (`#116666` on `#0a0a0a`: 3.01 against 2.94; `#1177dd` on `#0a0a0a`: 4.51 against 4.44), and the Title Bar's background is `#0a0a0a`. The Dropdown Menu spec's D14 precedent for `@warn` | Foundation's `color-luminance()` (false passes); `@error` everywhere (would stop an application that never uses the dark icon or an icon on the Top Bar) |
| D9 | `NfsTopBarRight` provides `nfsTopBarRightToken`; the Nested menu root injects it optionally at construction for the dropdown Base side, and walks the DOM after hydration only when it found none (settled 2026-09-28 by the [Re-run: Dropdown Menu spec under the class rule](../issues/113-rerun-dropdown-menu-class-rule.md)) | The class rule makes `.top-bar-right` a directive, so DI now has one source, and it resolves on the server: the right-hand menu's `opens-left` is in the server HTML and hydration changes nothing. A lightweight token keeps the directive class out of menu bundles. The projection case, where DI misses the section, is reported in development by the menu root and fixed with `alignment="right"` or a provided token. The walk finds a menu projected into the section, which DI cannot; it runs only when DI found nothing and can only add the section, so it never overrides DI (measured under hydration in three engines) | The Dropdown Menu spec's DOM walk alone (the side flips at hydration in every such layout, with a development warning); the token alone (a projected menu keeps the wrong preferred side in production, with only a development warning) |
| D10 | Responsive Toggle, Sticky, Magellan, and Smooth Scroll are written beside these directives | They may sit on any element, as the Menu spec's D6 decided for Smooth Scroll and Magellan; the Responsive Toggle works on a custom bar too | `nfsResponsiveToggle` hosting `NfsTitleBar` (forces `.title-bar` on custom bars) |
| D11 | `nfsTitleBarTitle` binds its class only; the consumer's static `id` names the icon | RT6 of the out-of-scope triage: the directive returns, a generated id and an `aria-label` input stay out, because visible text wins and static ids survive hydration | A generated id and an automatic `aria-labelledby` from the icon (differs between server and client) |
| D12 | No listeners, models, outputs, methods, Defaults token, or Parent token for the bars; `exportAs` on `nfsTopBar` and `nfsMenuIcon` only | Nothing to handle or emit; the Menu and Close Button precedent; the directives with inputs expose them | Parent tokens for the sections (D13) |
| D13 | Section placement is checked by DOM ancestry in development | Foundation's CSS styles by DOM ancestry, and a section projected through a layout component has no DI path to its bar, so a DI check would warn falsely | A required Parent token (breaks projection) |
| D14 | No `role` on any bar; no Aria `ngToolbar` | The consumer's `header` and `nav` give the landmarks; a toolbar's roving tab stop does not suit site navigation (ADR 0004) | `role="navigation"` on the bar (hides its sections' own landmarks); `role="toolbar"` |
| D15 | The Storybook settings overrides add `$topbar-submenu-background: $topbar-background;` beside `$topbar-background: $white;` | Measured in three engines: with the bar line alone, set after Foundation's settings file, open submenus keep `$light-gray` and axe fails their links; `nfs-top-bar` now stops that compile | Relying on the bar line (the published Dropdown Menu, Nested menu, and Responsive Toggle stories would fail axe with a submenu open) |

### Usage examples

```ts
@Component({
  selector: 'app-site-header',
  imports: [NfsTopBar, NfsTopBarLeft, NfsTopBarRight, NfsTitleBar, NfsTitleBarTitle, NfsMenuIcon,
            NfsResponsiveToggle, NfsResponsiveToggleMenu, NfsToggle, NfsMenu, RouterLink, RouterLinkActive],
  template: `
    <div nfsTitleBar [nfsResponsiveToggle]="menu" hideFor="medium">
      <button nfsMenuIcon nfsToggle aria-labelledby="site-menu-title"></button>
      <div nfsTitleBarTitle id="site-menu-title">Menu</div>
    </div>
    <header nfsTopBar nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" id="site-menu">
      <nav nfsTopBarLeft aria-label="Main">
        <ul nfsMenu [orientation]="{small: 'vertical', medium: 'horizontal'}">
          <li><a routerLink="/docs" routerLinkActive ariaCurrentWhenActive="page">Docs</a></li>
        </ul>
      </nav>
      <nav nfsTopBarRight aria-label="Account">
        <ul nfsMenu><li><a routerLink="/account">Account</a></li></ul>
      </nav>
    </header>
  `,
})
export class SiteHeader {}
```

```html
<!-- Foundation's markup and its library form -->
<div class="top-bar stacked-for-medium"><div class="top-bar-left">...</div></div>
<div nfsTopBar stackedFor="medium"><div nfsTopBarLeft>...</div></div>

<button class="menu-icon dark" type="button" data-toggle="nav"></button>
<button nfsMenuIcon dark [nfsToggle]="nav" aria-label="Open navigation"></button>

<!-- A sticky Top Bar: Sticky written beside the bar. The container spans the page,
     because the Sticky range is the sticky element's parent (ADR 0019). -->
<div nfsStickyContainer>
  <div nfsTopBar nfsSticky stickyOn="all">...</div>
  <main>...</main>
</div>
```

```scss
// The consumer's stylesheet: one nfs- include after each matching Foundation include.
@import 'settings';
@import 'foundation';
@include foundation-menu-icon;
@include foundation-title-bar;
@include foundation-top-bar;
@import 'ngx-foundation-sites';
@include nfs-menu-icon;
@include nfs-title-bar;
@include nfs-top-bar;
```

### Platform features to adopt when the browser target moves

- Nothing in the platform research changes the bars. `:has()` would let Foundation's CSS style a section from the menu it holds; the directives need none of it.

### Foundation behaviour changed or dropped

- The menu icon's box grows from 20 by 16 to 24 by 24 px around the same drawing (D6); a title beside it moves 4 px, and under forced colours the icon shows as an outlined box.
- The menu icon defaults to `type="button"` and warns without a name.
- Copied Foundation classes on the Top Bar and the menu icon are stripped and reported in development builds.
- A menu in the right-hand section learns its side through DI at construction, and from the DOM after hydration only when it is projected into the section from another template (D9).
- `disable-mouse-outline` never matches, because the library never loads what-input; the browser's `:focus-visible` heuristic decides when the ring shows.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This entry point relies on Foundation's export mixins `foundation-top-bar`, `foundation-title-bar`, and `foundation-menu-icon` (all three in `foundation-everything`), plus `foundation-menu` and whichever menu Plugin sits in the bar. Its documented custom CSS and checks are three mixins of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), one included after each export mixin: `nfs-menu-icon` after `foundation-menu-icon`, `nfs-title-bar` after `foundation-title-bar`, and `nfs-top-bar` after `foundation-top-bar`. A consumer includes the ones whose Foundation component it uses; an Off-canvas or Responsive Toggle title bar needs `nfs-menu-icon` and `nfs-title-bar`.

Every ratio below is computed by a library-internal helper with the exact WCAG formula (`math.pow`), unrounded, after compositing a translucent colour over `$body-background`; Foundation's `color-contrast()` rounds to one decimal and its `color-luminance()` overstates some ratios (D8), so neither is used.

`nfs-menu-icon`:

1. Rules: `.menu-icon { box-sizing: content-box; border: solid transparent; border-width: 4px 2px; }`. Reason: WCAG 2.2 success criterion 2.5.8; Foundation's `hamburger()` draws on a fixed 20 by 16 px box with no size setting, its bars are laid out on the padding box, and axe's `target-size` rule measures the element's box (D6). The widths are written as `(24px - 16px) / 2` and `(24px - 20px) / 2`: 24 px is WCAG's number, and 20 by 16 px is `hamburger()`'s default size, which the compile test guards. Checks that emit no CSS: `@warn` when `$black` or `$dark-gray`, the dark icon's colours, is under 3:1 against `$body-background` (1.4.11).
2. Reused: `$black`, `$dark-gray`, `$body-background`; no parameter.
3. Custom properties: none.
4. Motion classes: none, and no `prefers-reduced-motion` override.
5. Missing include: the icon falls back to Foundation's 20 by 16 px box, which axe fails next to another target; development check 4 reports it in development, naming the include.
6. Variant properties: none (`dark` is closed).

`nfs-title-bar`:

1. Rules: none. Checks that emit no CSS: `@error` when `$titlebar-color` is under 4.5:1 against `$titlebar-background` (1.4.3), or `$titlebar-icon-color` or `$titlebar-icon-color-hover` is under 3:1 against it (1.4.11).
2. Reused: `$titlebar-background`, `$titlebar-color`, `$titlebar-icon-color`, `$titlebar-icon-color-hover`, `$body-background`.
3. Custom properties: none.
4. Motion classes: none.
5. Missing include: nothing visible changes; the checks do not run.
6. Variant properties: none.

`nfs-top-bar`:

1. Rules: none. Checks that emit no CSS, against `$topbar-background` and, where it differs, `$topbar-submenu-background`: `@error` when `$anchor-color` is under 4.5:1 (1.4.3) or `$menu-item-background-active` is under 3:1 (1.4.1, the current link's fill that `nfs-menu` draws); `@warn` when `$topbar-submenu-background` is translucent (1.4.3); `@warn` when neither the light icon (`$titlebar-icon-color`, `$titlebar-icon-color-hover`) nor the dark icon (`$black`, `$dark-gray`) reaches 3:1 at rest and on hover against `$topbar-background` (1.4.11); `@warn` when `$topbar-unstack-breakpoint` is the Zero breakpoint (1.4.10).
2. Reused: `$topbar-background`, `$topbar-submenu-background`, `$topbar-unstack-breakpoint`, `$breakpoints`, `$anchor-color`, `$menu-item-background-active`, `$titlebar-icon-color`, `$titlebar-icon-color-hover`, `$black`, `$dark-gray`, `$body-background`.
3. Custom properties: none.
4. Motion classes: none.
5. Missing include: nothing visible changes; the checks do not run, so the default Top Bar's 3.76:1 links go unreported until the story gate or an axe run meets them.
6. Variant properties: none of its own. `stackedFor` loops over `$breakpoint-classes`, whose property, `--nfs-breakpoint-classes`, `nfs-breakpoint-properties` writes.

Required settings on Foundation's defaults, set by the consumer and by the library's Storybook settings overrides, each with its criterion:

```scss
// 1.4.3: Foundation's default Top Bar puts $anchor-color links at 3.76:1. Spec: Top Bar, every top-bar--* story;
// also the Dropdown Menu, Nested menu, Magellan, Responsive Menu, and Responsive Toggle stories that show a Top Bar.
$topbar-background: $white;
// The settings file set the submenu background from the old bar colour when it was imported.
$topbar-submenu-background: $topbar-background;
```

A consumer who edits its own copy of Foundation's settings file changes the `$topbar-background` line there, and the file's next line follows it.

### Notes

- RTL: in flexbox mode the sections follow the reading direction, so in a right-to-left region the left-hand section comes first, on the right; in float mode Foundation's floats are physical. `.title-bar-right`'s `text-align: right` is physical. The directives change nothing with direction, and the border of D6 is symmetric.
- Foundation's float mode (`$global-flexbox: false`) nudges a menu icon inside `.top-bar-title` 2 px down; the border keeps working there, since the icon stays an inline block.
- The Top Bar gives every `ul` inside it the bar's background, so menus in the bar are drawn on `$topbar-background`, which is why `nfs-top-bar` checks the Menu's link and current-link colours against it.
