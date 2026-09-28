# Spec: Breadcrumbs

Ticket: [Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)), parallel to the [Spec: Pagination](../issues/87-spec-pagination.md), which shares its `nav > ul` shape.

## Problem Statement

A developer on Foundation for Sites who wants to show where a page sits in the site's hierarchy writes Foundation's Breadcrumbs: a `ul.breadcrumbs` of `li` elements holding links to the parent pages, the current page last as plain text with visually hidden "Current: " text, a step without a page of its own as text in an `li.disabled`, and the whole list in a `<nav aria-label="You are here:" role="navigation">`. Breadcrumbs is a CSS-only component: it ships Sass and classes and no Plugin. The documented markup leaves the developer several problems:

- Under the library's class rule the developer writes no Foundation or library class, so `.breadcrumbs` and `.disabled` need an Angular home.
- The WAI-ARIA Authoring Practices Breadcrumb pattern marks the current page with `aria-current="page"` on its link. Foundation styles the current page only as an `li`'s text colour, so a current page written as a link keeps the link colour (measured: `rgb(23, 121, 186)` in Chromium, Firefox, and WebKit) and looks like any other link.
- Foundation's disabled step is `$medium-gray` text, 1.6252:1 on the page, under the 4.5:1 of WCAG 2.2 success criterion 1.4.3. A step without a page is text, not an inactive control, so the criterion's exemption does not apply, and axe fails Foundation's own example (`color-contrast`, 1.62, in three engines).
- The separator between items is a CSS `::after` glyph, which is text in the accessibility tree (measured in Chromium: a static text node "/" after every link) and which some screen readers read aloud, as Foundation's docs warn.
- Breadcrumb links are 12 px tall (the "Home" link is 33.00 by 12.00 px at Foundation's 11 px item size) on rows 17.59 px apart. A trail that wraps at 320 CSS px, as WCAG 1.4.10 asks it to, puts undersized links above each other: axe reports a `target-size` violation (2.5.8) on 7 links of a ten-step trail in three engines.
- The trail must sit in a navigation landmark with a name, both for landmark navigation and because WebKit exposes a `list-style: none` list as a list only inside a navigation landmark; nothing tells the developer when the `nav` or its name is missing.
- In a right-to-left region of a left-to-right stylesheet, Foundation's items still float left, so the trail reads against the region's direction (measured in three engines).

A server-rendered application adds the usual contract: every class and the current page's `aria-current` must already be in the server HTML, nothing may change at hydration, and the links must keep navigating natively before hydration and inside dehydrated or `hydrate never` blocks.

## Solution

Two attribute directives in one entry point. `nfsBreadcrumbs` on the developer's `ul` or `ol` binds `.breadcrumbs`. `nfsBreadcrumbsItem` on an `li` binds Foundation's `.disabled` State class from its `disabled` input, for a step without a page, which the developer writes as text. Foundation's Breadcrumbs has no Variant class, so there is no Variant input. Neither directive has a listener or a template, so the server HTML is the final DOM and every rendering mode keeps working as plain HTML.

The current page is marked the way the Menu and the Pagination mark it ([ADR 0042](../adr/0042-menu-current-page-aria-current.md)): `aria-current="page"` on its link, written by the developer, bound from the trail's last step, or set by the Router's `RouterLinkActive` with exact matching. A current page written as text carries `aria-current="page"` on its `li`, which Foundation's item colour already styles. There is no `.current` class and no current-page input.

The `nfs-breadcrumbs` Library mixin gives the current page's link Foundation's current-item colour from its `aria-current`, draws Foundation's default separator as a slanted line that has no text for assistive technology (the technique of the APG's own breadcrumb example), gives every link a box of at least 24 by 24 CSS px on rows of one height, floats the items toward the start of the reading direction so the trail follows `dir`, and stops the compile when a link, the current page, or a disabled step falls under 4.5:1 on the page. On Foundation's defaults it asks the developer for one setting, a darker disabled colour.

In development builds `nfsBreadcrumbs` warns, with the Pagination's check and wording, when the list is outside a named `nav`; it also reports copied Foundation classes, `aria-current` in a place that gets no current look or on more than one step, a link without `href`, and a missing `nfs-breadcrumbs` include.

## User Stories

1. As an application developer, I want to put `nfsBreadcrumbs` on a `ul` and get Foundation's `.breadcrumbs` styling, so that I write no Foundation class.
2. As an application developer, I want `nfsBreadcrumbs` to work on an `ol` too, so that I can write the ordered list the APG's breadcrumb example uses.
3. As an application developer, I want to mark the current page with `aria-current="page"` on its link and get Foundation's current-item colour, so that one attribute gives the announcement and the look.
4. As an application developer, I want the current page's link to keep its `href`, so that it stays in the tab order and in a screen reader's links list, as the APG pattern shows.
5. As an application developer who writes the current page as text, as Foundation's docs do, I want `aria-current="page"` on its `li` to be the whole recipe, so that I need no visually hidden "Current: " text.
6. As an application developer, I want `li[nfsBreadcrumbsItem] disabled` for a step that has no page of its own, so that it gets Foundation's disabled look without my writing `.disabled`.
7. As an application developer, I want `[disabled]` bound from my trail data, so that the steps without pages come from the same data as the rest of the trail.
8. As an application developer copying Foundation's markup, I want a development warning for a copied `class="disabled"` on an item, naming the directive and input to use, so that I migrate quickly.
9. As an application developer, I want a copied `class="disabled"` on an `nfsBreadcrumbsItem` host to have no effect, so that the input is the one source of the step's look on the server and in the browser.
10. As an application developer, I want my own classes on the list and items to stay, so that application styling still works.
11. As an application developer, I want a development warning when the trail is outside a `nav` or the `nav` has no name, so that I never ship an unlabelled navigation landmark.
12. As an application developer, I want the same landmark warning as the Pagination's, so that I learn one rule for both components.
13. As an application developer using the Router, I want a warning when more than one step carries `aria-current`, naming the `exact` option, so that a `RouterLinkActive` that matches every ancestor is caught.
14. As an application developer, I want a warning when `aria-current` sits on an item that holds a link, so that the current page is announced and styled on the link.
15. As an application developer, I want a warning when a step's link has no `href`, so that I write a step without a page as a disabled step instead of an unfocusable link.
16. As an application developer, I want a warning when a disabled step holds a link, so that a step never looks disabled while it still navigates.
17. As an application developer, I want a development warning when I forgot `@include nfs-breadcrumbs;`, so that the missing target sizes and spoken separators do not reach production unnoticed.
18. As an application developer, I want the compile to fail, naming the setting and the ratio, when my settings put a link, the current page, or a disabled step under 4.5:1 on the page, so that I cannot ship unreadable steps.
19. As an application developer on Foundation's defaults, I want the spec to name the one setting that passes, so that I fix the compile error with one line.
20. As an application developer who turns separators off with `$breadcrumbs-item-separator: false`, I want the library to draw none, so that my setting stays the look.
21. As an application developer who sets another separator character, I want Foundation's glyph kept, so that my setting stays the look, and I want the spec to tell me that screen readers may read it.
22. As an application developer, I want to build the trail with `@for` over my route data and mark the last step current, so that the trail follows navigation with no class name in my template.
23. As an application developer, I want to import the directives from their own entry point, so that a `@defer` block can split them.
24. As a screen reader user, I want the trail in a navigation landmark named "Breadcrumb", so that I can find it from the landmarks list and know what it is.
25. As a screen reader user, I want the trail to be a list, so that I hear how many steps there are.
26. As a screen reader user, I want the current page announced as current, so that I know which step is the page I am on.
27. As a screen reader user, I want the separators to be silent, so that I hear each step's name without "slash" between them.
28. As a screen reader user, I want a step without a page to be plain text, so that I am never offered a link that goes nowhere.
29. As a keyboard user, I want every link of the trail in the tab order in reading order, with the browser's focus ring, so that I can reach and see each one.
30. As a user with limited dexterity, I want every breadcrumb link at least 24 by 24 CSS px, wrapped rows included, so that I can hit it.
31. As a user with low vision, I want every step's text, the disabled step included, at 4.5:1 on the page, so that I can read the whole path.
32. As a user on a narrow screen, I want a long trail to wrap rather than scroll sideways, so that I can read it at 320 CSS px.
33. As a user who enlarges text spacing, I want the trail to keep every step readable and every link at least 24 px tall, so that nothing overlaps.
34. As a user of a right-to-left page, I want the trail to run in my reading direction, so that the first step is where I start reading.
35. As a user of a Windows contrast theme, I want the separators to stay visible, so that I can still tell the steps apart.
36. As a developer of a server-rendered application, I want `.breadcrumbs`, `.disabled`, and the current page's `aria-current` in the server HTML, so that the first paint is final and hydration changes nothing.
37. As a developer using `@defer (hydrate never)`, I want a trail there to keep Foundation's look and working links, so that static regions need no JavaScript.
38. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
39. As a library maintainer, I want every class, state, warning, and box size asserted in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Breadcrumbs has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's breadcrumbs Sass partial and its docs page. Dropped options: none, because there are none.

| Feature | Class or markup | Source in Foundation's Sass | Notes |
| --- | --- | --- | --- |
| Breadcrumbs | `ul.breadcrumbs` of `li` elements holding links | `foundation-breadcrumbs`, `breadcrumbs-container` | `margin: $breadcrumbs-margin`, `list-style: none`, a clearfix; items `float: $global-left` at `$breadcrumbs-item-font-size` (11 px), `color: $breadcrumbs-item-color-current`, `cursor: default`, uppercase under `$breadcrumbs-item-uppercase`; links `color: $breadcrumbs-item-color` (`$primary-color`), underlined on hover |
| Current page | The last `li`, as text, with `.show-for-sr` "Current: " before it | None of its own: the item's text colour, `$breadcrumbs-item-color-current` (`$black`) | Foundation has no `.current` class for breadcrumbs; a link inside the item keeps `$breadcrumbs-item-color` |
| Disabled step | `li.disabled`, as text | `.breadcrumbs .disabled`: `color: $breadcrumbs-item-color-disabled` (`$medium-gray`), `cursor: not-allowed` | "just use plain text instead of a link" (docs) |
| Separator | `li:not(:last-child)::after` | `content: $breadcrumbs-item-separator-item` (`'/'`), or `$breadcrumbs-item-separator-item-rtl` (`'\'`) when `$global-text-direction` is `rtl`; `margin: 0 $breadcrumbs-item-margin`; `color: $breadcrumbs-item-separator-color` (`$medium-gray`) | Off under `$breadcrumbs-item-separator: false` (or the legacy `$breadcrumbs-item-slash`), which puts `margin-#{$global-right}: $breadcrumbs-item-margin` on each item instead |
| Landmark | `<nav aria-label="You are here:" role="navigation">` around the list | Docs markup | The `role` repeats the `nav` element's own role |
| Structured data | Schema.org `BreadcrumbList` (docs callout) | None | The developer's markup or a JSON-LD script |

Docs conventions kept or corrected: the `ul` of `li` elements with links (kept; `ol` also accepted, D2); the current page as text with visually hidden "Current: " (corrected: `aria-current="page"` on the current page's link, or on its `li` when it is text, D4); the disabled step as text (kept, with `nfsBreadcrumbsItem disabled` in place of the class, D5); the `nav` named "You are here:" with `role="navigation"` (corrected: `<nav aria-label="Breadcrumb">`, the APG's name, without the repeated role); the separator glyph (kept for other characters, drawn without text for Foundation's default one, D6).

### CSS class to Angular mapping

Every Foundation Breadcrumbs class, per building-blocks 1.14 item 2. Breadcrumbs has no Variant class, so there is no Variant input, type alias, Variant registry, or Variant property.

| Foundation class | Kind | Angular | Value shape and the class each value sets |
| --- | --- | --- | --- |
| `.breadcrumbs` | Structural | `NfsBreadcrumbs`, `ul[nfsBreadcrumbs]` and `ol[nfsBreadcrumbs]`, static host class | Always |
| `.disabled` on an item | State | `NfsBreadcrumbsItem`, `li[nfsBreadcrumbsItem]`, host binding `[class.disabled]` from the `disabled` input (D5) | `true` sets `.disabled`; `false` sets none and strips a copied static one |
| Current page | No class | Not bound. `aria-current` on the current page's link, which `nfs-breadcrumbs` colours with `$breadcrumbs-item-color-current`, or on its `li` when it is text (D4) | A link whose `aria-current` is present and neither `false` nor empty |
| `.show-for-sr` | Utility (Visibility classes) | Not used by the recipes: `aria-current` replaces Foundation's "Current: " text (D4). Where visually hidden text is wanted, the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s `nfsShowForSr` | Not this entry point's |

No class is left for the consumer to write (ADR 0039). A `disabled` copied onto an `li` without `nfsBreadcrumbsItem` is not stripped, because no directive binds that element; it still draws Foundation's disabled look, and development check 2 reports it. A copied `current` or `is-active` draws nothing in Foundation's breadcrumbs CSS and says nothing to assistive technology; check 2 reports it too, as the Pagination reports its copied `current`.

### Hierarchy and DI shape

```
ngx-foundation-sites/breadcrumbs    (secondary entry point)
  ul[nfsBreadcrumbs], ol[nfsBreadcrumbs]   NfsBreadcrumbs       no inputs, providers, token, or host directives
    li                                    (no directive)       a step's link, or the current page as text
    li[nfsBreadcrumbsItem]                NfsBreadcrumbsItem   input disabled; in development builds only:
                                                               inject(NfsBreadcrumbs, {optional: true})
  uses: ElementRef and, in development builds only, HostAttributeToken('class'), afterEveryRender, and afterNextRender
```

- No Parent token. Nothing needs `NfsBreadcrumbs` through DI except the item's development warning, and the item lives in the same entry point, so it looks the list up by class, as `NfsMenuText` looks up `NfsMenu` and the Pagination's items look up `NfsPagination`; the lookup is removed from production bundles.
- No Defaults token: Breadcrumbs has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- `nfsBreadcrumbsItem` goes only on an item that has a state to set, a disabled step (D5); a step's link and the current page need no item directive, as the Menu's and the Pagination's items need none.
- DI follows the declaration site: an item projected into a `ul[nfsBreadcrumbs]` from another template does not find it and warns in development; the recipes declare the items in the trail's own template.

### API: `NfsBreadcrumbs`

Selector `ul[nfsBreadcrumbs], ol[nfsBreadcrumbs]`; standalone; no template; no `exportAs`, because it has no state to read.

```ts
class NfsBreadcrumbs {}
```

- Inputs, models, outputs, and methods: none. The trail owns no state: which page is current is the application's, and the current page's link carries it.
- Host: static `class="breadcrumbs"`. No attribute, no listener.

### API: `NfsBreadcrumbsItem`

Selector `li[nfsBreadcrumbsItem]`; standalone; no template; no `exportAs`.

```ts
class NfsBreadcrumbsItem {
  readonly disabled: InputSignalWithTransform<boolean, unknown>; // default false; booleanAttribute
}
```

| Input | Transform | Default | Foundation equivalent (JSDoc) | Delta |
| --- | --- | --- | --- | --- |
| `disabled` | `booleanAttribute` | `false` | `li.disabled` | New input for Foundation's class; the step stays text, with no ARIA state (D5) |

- `disabled` is a State input like the Button's and the Slider's `disabled`, so it takes `booleanAttribute`; the Variant rule against `booleanAttribute` (building-blocks 1.4) applies to Variant inputs only.
- Models, outputs, and methods: none.
- Host: `[class.disabled]` bound to `disabled()`, a plain boolean, so a `class="disabled"` copied from Foundation's markup is stripped on the server and in the browser while the input is `false`, because Angular's styling resolution consults a static class only when every binding for it is `undefined` (building-blocks 1.4). No attribute, no listener.

### Development checks

Each warns once per instance through `console.warn`, never on the server and never in production builds.

`NfsBreadcrumbs` registers, in development builds only, one `afterEveryRender` read callback that returns while its host holds no `li`, runs the checks below once, and destroys itself, as `NfsPagination` does; a trail whose steps arrive from data after the first render is therefore checked (D10).

1. Landmark, the Pagination's check 1 with this component's name: the host has no `nav` or `[role=navigation]` ancestor, or that ancestor has neither `aria-label` nor `aria-labelledby`: "nfsBreadcrumbs: wrap the breadcrumbs in a named navigation landmark, for example <nav aria-label="Breadcrumb">".
2. Copied Foundation classes on the items: `disabled` on an `li` without the `nfsBreadcrumbsItem` attribute: "class="disabled" is set by nfsBreadcrumbsItem: write <li nfsBreadcrumbsItem disabled>"; `current` or `is-active` on any `li`, in the Pagination's words: "class="current" has no ARIA state: remove it and put aria-current="page" on the page's link" (Foundation's breadcrumbs CSS has no rule for either class, so the copy draws nothing either). A redundant `breadcrumbs` on the host merges with its static class and is not reported.
3. Current page placement: `aria-current`, present and neither `false` nor empty, on an `li` that holds a link, or on an element inside the host that is neither an `a` nor an `li`: "put aria-current on the current page's link, or on its item when the current page is text".
4. One current page: more than one element inside the host carries `aria-current` other than `false` or empty: "N steps carry aria-current: mark only the current page (with RouterLinkActive, bind [routerLinkActiveOptions]="{exact: true}")". `RouterLinkActive` without exact matching marks every ancestor of the current URL, and every step of a trail is one.
5. Links: an `a` inside the host with no `href`: "a link without href is not focusable: add an href, or write the step as text with nfsBreadcrumbsItem disabled". A `[routerLink]` bound to `null` removes the `href` and is reported the same way.
6. Missing include: the first `a` inside the host has the computed `display` `inline`: "the links are under 24 px and the separators are read aloud: @include nfs-breadcrumbs; after foundation-breadcrumbs". Foundation's CSS leaves breadcrumb links inline and `nfs-breadcrumbs` makes them `inline-block` (measured in three engines), so an inline link means the include (or Foundation's breadcrumbs CSS) is missing.

`NfsBreadcrumbsItem`, in its first client render callback:

7. No `NfsBreadcrumbs` above it in the injector tree: "this item is outside nfsBreadcrumbs".
8. `disabled` with an `a` inside the item: "a disabled step is text: remove its link, or remove disabled". Foundation colours the link, not the item, so the step would look like a link and still navigate.
9. A static `class` holding `disabled`, read through `HostAttributeToken('class')` in development builds only: "class="disabled" is set by nfsBreadcrumbsItem: bind disabled instead". The class is stripped while `disabled` is `false` and redundant while it is `true`; it is reported either way (building-blocks 1.4).

Runtime checks ([ADR 0040](../adr/0040-variant-input-types.md)): none. Breadcrumbs has no Variant input and its mixin writes no Variant property, so there is nothing for `strictVariantNames` or `strictVariantProperties` to read; check 6 covers the missing include instead, as the Pagination's check 5 does.

### Comparison with Angular Material (22.2)

Material has no breadcrumb component (the 22.2 source has none). The nearest pieces mark a current item in navigation.

| Concern | Material (`mat-nav-list` with `a[mat-list-item]`, `nav[mat-tab-nav-bar]` with `a[mat-tab-link]`) | `NfsBreadcrumbs` |
| --- | --- | --- |
| Kind | Components with templates on the list and each link | Directives on the consumer's list and, for a disabled step only, its item; no template |
| Landmark | `mat-nav-list` sets `role="navigation"` on its host | The consumer's named `nav`, checked in development; the list keeps its list semantics |
| Current item | `activated` input on the list item, `active` on the tab link: a class plus `aria-current="page"` | `aria-current` on the link, from the consumer or the Router; `nfs-breadcrumbs` colours it; no input |
| Disabled | `disabled` input on the list item: a class plus `aria-disabled` | `disabled` on `nfsBreadcrumbsItem`: Foundation's class on a text step, with no ARIA state, because the step is not a control (D5) |
| Separators | None | Foundation's separator, drawn with no text for its default glyph (D6) |
| Testing | `MatNavListHarness`, `MatTabNavBarHarness` | DOM-first assertions; no harness |

Borrowed: `aria-current="page"` on the current link as the state assistive technology reads. Not borrowed: `role="navigation"` on the list host (it hides the list and its count), item components, an `activated` input, which would need a directive on every link to carry a state the attribute already carries (ADR 0042), and `aria-disabled` on an element that is not a control.

### Implementation level and primitives

Implementation level: native platform. A trail is an HTML list of links in a `nav`: the list semantics, the tab order, activation, and navigation are the browser's, and the current page is an ARIA state the Router can already write. `@angular/aria` has no breadcrumb pattern in 22.2, and a trail has no keyboard behaviour to add (the APG pattern: "Keyboard Interaction: Not applicable"). `@angular/cdk` is not needed: nothing is measured, focused, or observed. The Angular layer is two directives of host bindings, one `input()` signal, and development-only render callbacks.

Primitives: `input()` with `booleanAttribute`, a static host class, a `[class.disabled]` host binding, and, in development builds only, `ElementRef`, `HostAttributeToken`, `afterEveryRender`, and `afterNextRender`. `injectAsync`, `effect`, and `computed` are not used: every effect is a host binding that must be in the server HTML.

Fallback: none needed. The library CSS this design depends on, the drawn separator, `float: inline-start`, and the 24 px boxes, was measured in Chromium, Firefox, and WebKit by this spec's ticket, and `float: inline-start` is in the Browser target (Chrome and Edge 118, Firefox 55, Safari 15).

### ARIA and keyboard

APG pattern: Breadcrumb. "Breadcrumb trail is contained within a navigation landmark region. The landmark region is labelled via aria-label or aria-labelledby. The link to the current page has aria-current set to page. If the element representing the current page is not a link, aria-current is optional."

| Element or state | Rendered semantics | Owner |
| --- | --- | --- |
| Landmark | `<nav aria-label="Breadcrumb">` (or `aria-labelledby`) around the list, with a distinct name when the page has several navigation landmarks; no `role` attribute, because the `nav` element carries it | Consumer; checked in development (check 1) |
| `ul[nfsBreadcrumbs]`, `ol[nfsBreadcrumbs]` | Native `list` with `listitem` children; no `role` attribute. WebKit exposes a list styled with `list-style: none` as a list only inside a navigation landmark, so the named `nav` also keeps the step count in VoiceOver | Native |
| A step | `listitem` holding a native link named from its text | Native |
| Current page, as a link | `aria-current="page"` on the link, which keeps its `href` | Consumer or the Router |
| Current page, as text | `aria-current="page"` on its `li` (the APG makes it optional; Core-AAM maps it on every element) | Consumer |
| Disabled step | `listitem` with text; no role, state, or name added, because it is not a control | Native |
| Separator | Nothing: the drawn separator has no text (measured in Chromium: an empty generic node where Foundation's glyph put the text "/"). A consumer's own separator character is text in the item | `nfs-breadcrumbs` |

Keyboard: native only. Tab and Shift+Tab move through the step links in DOM order, the current page's link included; Enter follows a link. Text steps, disabled or current, are not focusable. The directives add no key handling and change no tab order.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (ADR 0022). Contrast ratios are computed with the exact WCAG relative-luminance formula (the library's internal `math.pow` helper) from Foundation 6.9.0's default settings (`$breadcrumbs-item-color` `$primary-color` `#1779ba`, `$breadcrumbs-item-color-current` `$black` `#0a0a0a`, `$breadcrumbs-item-color-disabled` and `$breadcrumbs-item-separator-color` `$medium-gray` `#cacaca`, `$body-background` `#fefefe`) and compared unrounded, never with Foundation's `color-luminance()` or `color-contrast()` (building-blocks 1.10). Geometry and axe results were measured in Chromium, Firefox, and WebKit through Playwright 1.63 at a 16 px root font size, with axe-core 4.13.0.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.3.1 Info and Relationships | The trail is a list inside a named landmark; the current page is programmatic, because the only way to give a current link the current look is its `aria-current` (D4); a disabled step is text, which is what it is (D5). Copied `disabled`, `current`, and `is-active` classes are reported in development | The current page is marked only by hidden text; a current link has no current look | axe in every story; `breadcrumbs--basic` finds the current page with `getByRole('link', {current: 'page'})`; SSR smoke |
| 1.3.2 Meaningful Sequence | DOM order is the visual order in the reading direction: `nfs-breadcrumbs` floats items to `inline-start`, so a `dir="rtl"` region runs right to left in a left-to-right stylesheet, and the reverse (measured in three engines) | Items float to `$global-left` of the compile, against the direction of a region of the other direction | `breadcrumbs--rtl`; e2e in three engines |
| 1.4.1 Use of Color | The current page is the last step, so its colour is not the only cue; a disabled step and a link differ in colour only, which F73 accepts for navigational links ("some links may be visually evident from page design and context, such as navigational links"), and a disabled step is not a control whose state needs a second cue (D9). With the required setting a disabled step differs from a link by hue alone (1.0116:1 in lightness), which D9 accepts on that reading | Current link 4.2240:1 from other links, disabled 2.8596:1 from links | Play functions assert the current page is the last step |
| 1.4.3 Contrast (Minimum) | Link, current, and disabled text reach 4.5:1 on the page (11 px uppercase is never large text); `nfs-breadcrumbs` stops the compile with `@error` naming the setting. A disabled step is text, not an inactive control, so the exemption does not apply. Required consumer setting on Foundation's defaults: `$breadcrumbs-item-color-disabled: #737373;` (4.7015:1), the colour the [Spec: Forms](../issues/98-spec-forms.md) requires for placeholders | Fails: disabled `#cacaca` 1.6252:1 (axe `color-contrast` 1.62 in three engines on Foundation's own example); passes: links 4.6473:1, current 19.6304:1 | Node-level Sass compile test; axe `color-contrast` in every story under the Storybook settings overrides |
| 1.4.10 Reflow | The floated items wrap; at 320 CSS px a ten-step trail takes four rows and nothing scrolls sideways | Passes (measured: `scrollWidth` 320 in three engines) | e2e at 320 px on `breadcrumbs--wrapped` |
| 1.4.11 Non-text Contrast | The separator is decoration: the list and the landmark's name carry the trail (the APG's example notes say so), and Foundation itself offers trails with no separator (`$breadcrumbs-item-separator: false`), so no ratio applies to `$breadcrumbs-item-separator-color` | `$medium-gray` separators at 1.6252:1, not required to understand the trail | None beyond the story look |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, every step stays readable and every link stays at least 24 by 24 px on 24 px rows (measured in three engines) | Rows follow the override; links 12 px tall | e2e in three engines with the text-spacing stylesheet on `breadcrumbs--wrapped` |
| 2.1.1 Keyboard | Native links in the tab order; no key handling added | Passes | Story play (`userEvent.tab()`) |
| 2.4.3 Focus Order | DOM order, which is the trail's order | Passes | Story play |
| 2.4.4 Link Purpose (In Context) | Each step's link text is its page's name; the recipes show it, and the directives do not check wording | Passes in Foundation's example | Every play function finds links by name |
| 2.4.7 Focus Visible | The browser's own focus ring on every link, now drawn around its 24 px box; Foundation sets no outline rule on breadcrumbs | Passes | e2e screenshot of a focused link in three engines |
| 2.5.3 Label in Name | Names come from the links' visible text (Chromium exposes the uppercased text, "HOME", measured, which is also what is visible) | Passes | Play functions find links by visible text |
| 2.5.8 Target Size (Minimum) | Met by size (building-blocks 1.10): `nfs-breadcrumbs` makes every link `inline-block` with `min-width: 24px; min-height: 24px` and centred text, and gives every item the same line, at least 24 px, so rows of links are 24 px apart and floats of mixed content never catch on each other. Measured: every link 24.00 by 24.00 px or more and every item 24.00 px tall in three engines, with and without the text spacing, and no `target-size` violation on a wrapped trail | Fails once the trail wraps: links 12.00 px tall (a one-letter link 7.33 by 12.00 px) on rows 17.59 px apart (WebKit 17.00), axe `target-size` on 7 links of a ten-step trail at 320 px in three engines; a single row passes only through the spacing exception | axe `target-size` in every story (`breadcrumbs--wrapped` wraps); e2e measures every link box in three engines |
| 4.1.2 Name, Role, Value | Native roles; `aria-current` is the current state; every link has a name | Passes | axe (`link-name`, `aria-allowed-attr`) in every story |

The story gate runs axe with the six tags of ADR 0018 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) and `parameters.a11y.test = 'error'`, every trail inside a named `nav`. The one required setting is mirrored in the Storybook settings overrides (Sass subsection).

### Rendered HTML

Consumer markup and the resulting DOM, with the Pagination's conventions. Server HTML and hydrated DOM are identical in every example: every class is a static host class or a host binding on an input, and the current page is the consumer's attribute. The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfsbreadcrumbs=""`, `nfsbreadcrumbsitem=""`, `disabled=""`). Class order is not significant.

```html
<!-- Foundation's example: a disabled step and the current page as a link -->
<nav aria-label="Breadcrumb">
  <ul nfsBreadcrumbs>
    <li><a href="/">Home</a></li>
    <li><a href="/features">Features</a></li>
    <li nfsBreadcrumbsItem disabled>Gene Splicing</li>
    <li><a href="/features/cloning" aria-current="page">Cloning</a></li>
  </ul>
</nav>
<nav aria-label="Breadcrumb">
  <ul class="breadcrumbs">
    <li><a href="/">Home</a></li>
    <li><a href="/features">Features</a></li>
    <li class="disabled">Gene Splicing</li>
    <li><a href="/features/cloning" aria-current="page">Cloning</a></li><!-- nfs-breadcrumbs: the current colour -->
  </ul>
</nav>

<!-- The current page as text, in the APG's ordered list -->
<nav aria-label="Breadcrumb">
  <ol nfsBreadcrumbs>
    <li><a href="/">Home</a></li>
    <li aria-current="page">Cloning</li>
  </ol>
</nav>
<nav aria-label="Breadcrumb">
  <ol class="breadcrumbs">
    <li><a href="/">Home</a></li>
    <li aria-current="page">Cloning</li>
  </ol>
</nav>

<!-- The Router marks the current page (server HTML rendered at /features/cloning) -->
<ol nfsBreadcrumbs>
  <li><a routerLink="/" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Home</a></li>
  <li><a routerLink="/features" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Features</a></li>
  <li><a routerLink="/features/cloning" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Cloning</a></li>
</ol>
<ol class="breadcrumbs">
  <li><a href="/">Home</a></li>
  <li><a href="/features">Features</a></li>
  <li><a href="/features/cloning" aria-current="page">Cloning</a></li>
</ol>

<!-- A copied class is stripped from an item directive's host (and reported in development builds) -->
<li nfsBreadcrumbsItem class="disabled step">Gene Splicing</li>
<li class="step">Gene Splicing</li>
```

Neither directive causes a `jsaction` attribute: they declare no listeners. `RouterLink` declares its own on links; that is the Router's, as for any routed link.

### Animation

None. Foundation's breadcrumbs partial declares no transition, and neither directive inserts, removes, or animates anything, so ADR 0003's mechanics have nothing to govern, no `animate.enter`/`animate.leave` is used, and there is no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.breadcrumbs`, every `.disabled`, and the consumer's `aria-current` exactly as the hydrated DOM does (rule 1). Foundation's CSS and the `nfs-breadcrumbs` rules style the first paint.
- Before hydration: construction reads inputs only and touches no DOM outside host bindings (rules 3 to 5). The development checks run in render callbacks, which never run on the server.
- Full hydration: host values equal the server's, so hydration changes nothing; there is no structure of the library's to mismatch and no `ngSkipHydration` (rule 10). The trail's steps and its current page must have the same values at the first client render as on the server: a trail rendered inside a routed component, from route data or from `ActivatedRoute`, does; a trail read from the Router's state in the application shell has no steps at the first client render under the default non-blocking initial navigation, so hydration would discard the server's steps (Angular's hydration cleanup removes dehydrated views no client view claimed) until the navigation completes. The recipes render the trail inside a routed component.
- Router: `RouterLinkActive` writes `aria-current` on the server once the navigation has run and does nothing on the client until the initial navigation has completed (its `update()` returns while `router.navigated` is false), so the server's attribute survives hydration (the [Spec: Menu](../issues/85-spec-menu.md)'s reading of the Router's source, rechecked for this spec). Every step of a trail is an ancestor of the current URL, so the recipe binds `{exact: true}` on every step, and development check 4 reports its absence.
- Incremental hydration: the directives register nothing, so a trail needs no hydration boundary of its own.
- Event replay: the directives declare no listeners, so they add nothing to queue or replay, and they never cause Angular's dispatcher to cancel a plain link's native navigation inside a dehydrated block. A `hydrate on interaction` block whose root node is a link would be cancelled; the trail's root is its `nav`, never a link.
- `@defer`: library templates contain no `@defer`. The entry point is separate, so a consumer can defer the trail. Inside a dehydrated block it is its server HTML and its plain links navigate; routed links hydrate the block and replay through `RouterLink`. Inside `@defer (hydrate never)` it keeps Foundation's look and its links navigate.
- Prerendering: identical to server rendering; nothing reads a request token (rule 11).
- Zoneless: no zone is used; all state is inputs.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes on the list and items, the roles, the names, which step is current, the computed colours and their contrast, whether a separator has text, box sizes and item order, and what the server HTML contains. No test reads a directive's fields. Prior art: the [Spec: Pagination](../issues/87-spec-pagination.md)'s layers (a listener-free class directive in a named `nav`, the current page from `aria-current` styled by a Library mixin, the self-destroying development check), the [Spec: Menu](../issues/85-spec-menu.md)'s Router cases, and the [Spec: Badge](../issues/93-spec-badge.md)'s Sass compile test.

Story ids follow `breadcrumbs--<story>`, `meta.id: 'breadcrumbs'`, title `CSS-only components/Breadcrumbs`: `breadcrumbs--basic`, `breadcrumbs--current-text`, `breadcrumbs--router`, `breadcrumbs--wrapped`, and `breadcrumbs--rtl`. Every trail in a story sits in a named `nav`. The Storybook settings overrides carry this spec's required setting, and the preview includes `nfs-breadcrumbs`. No Anti-pattern story.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six WCAG 2.2 AA tags (ADR 0018), under the Storybook preview stylesheet with `@include nfs-breadcrumbs;` after `foundation-everything`. No story element carries a Foundation class written in the story.

- `breadcrumbs--basic`: Foundation's example as the recipe (Home, Features, a disabled Gene Splicing, the current Cloning as a link). The list is found by `getByRole('list')` inside `getByRole('navigation', {name: 'Breadcrumb'})` and has `.breadcrumbs`; `getAllByRole('listitem')` counts 4; `getByRole('link', {current: 'page'})` is "Cloning", the last step, and its computed colour is `$breadcrumbs-item-color-current`; Gene Splicing is not a link, carries `.disabled`, and its computed colour on the page is at least 4.5:1 from computed styles; the `::after` of every item but the last has the computed `content` `""`; Tab visits Home, Features, and Cloning in order.
- `breadcrumbs--current-text`: an `ol` trail whose current page is text with `aria-current="page"` on its `li`; the item is not a link, its computed colour is `$breadcrumbs-item-color-current`, and no link is current.
- `breadcrumbs--router`: `applicationConfig` with `provideRouter` and three routes; the story navigates to the deepest route; exactly one link carries `aria-current="page"`, the last one.
- `breadcrumbs--wrapped`: a ten-step trail, one step a single letter, in a 288 px wide container, so it wraps onto several rows; every link's box is at least 24 by 24 px; axe `target-size` passes under the gate.
- `breadcrumbs--rtl`: the basic trail under `dir="rtl"` in the left-to-right preview stylesheet; the first step is the rightmost; no class changes with direction.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs in `<name>.spec.ts` next to each directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM state; no story is mounted and no axe runs here.

- Host bindings: `ul[nfsBreadcrumbs]` and `ol[nfsBreadcrumbs]` carry `.breadcrumbs`; `disabled` driven by data (`true`, `false`, the bare attribute, `'true'`, `'false'`, and a bound value changing both ways) sets and removes `.disabled`; a static `class="disabled step"` with `disabled` `false` renders `class="step"`, and with `disabled` `true` renders both; the consumer's classes and attributes stay; neither directive adds an attribute.
- Development checks, each once and only with `ngDevMode` on: a trail outside a `nav`, inside an unnamed `nav`, and inside a `div role="navigation"` with no name warn with check 1's text, and a `nav` with `aria-label` or `aria-labelledby` is silent; steps rendered by `@for` from a signal set after the first render are checked once they exist; a copied `disabled` on a plain `li`, and a copied `current` or `is-active`, warn with check 2's texts; `aria-current` on an `li` holding a link and on a `span` warn (check 3), on a link or a text `li` are silent; two `aria-current` steps warn (check 4); an `a` without `href`, and `[routerLink]="null"`, warn (check 5); with a test stylesheet that makes breadcrumb links `inline-block` the trail is silent, and without it check 6 warns; `nfsBreadcrumbsItem` outside a trail warns (check 7), `disabled` over a link warns (check 8), and a static `class="disabled"` warns (check 9); correct markup warns nothing; nothing is warned during a server render or with `ngDevMode` off.
- Router: with `provideRouter` and `RouterTestingHarness`, a routed component holding the recipe trail at `/features/cloning` has `aria-current="page"` on the Cloning link only; without `{exact: true}` all three links carry it and check 4 warns once.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper in `<name>.ssr.spec.ts`, under `npx nx test <lib>`, with `provideRouter` and the URL `/features/cloning`, over a fixture with each Rendered HTML example. `whenStable()` resolves; the HTML matches the Rendered HTML section, the copied `disabled` absent from the item directive's host and the application class present; `aria-current="page"` on the Cloning link only; no `jsaction` on the list, an item, or a plain link; no development warning is logged. `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not.
- Sass compile, over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';`:
  - Foundation's defaults plus `@include nfs-breadcrumbs;` stop with one `@error` naming `$breadcrumbs-item-color-disabled` `#cacaca` on `$body-background` `#fefefe` at 1.625:1.
  - With the required setting the include compiles and emits exactly the four rules of the Sass subsection, the separator rotated `15deg`.
  - `$breadcrumbs-item-separator: false`, the legacy `$breadcrumbs-item-slash: false`, and `$breadcrumbs-item-separator-item: '>'` each emit no separator rule and keep the other three.
  - `$global-text-direction: rtl` emits the separator rotated `-15deg`.
  - `$breadcrumbs-item-color: #1177dd` stops the compile at 4.423:1 (4.357:1 by Foundation's `color-luminance()`); `$breadcrumbs-item-color-current: $dark-gray` stops it at 3.422:1; a translucent `$breadcrumbs-item-color-disabled: rgba(#0a0a0a, 0.5)` is composited over `$body-background` first and stops it at 3.708:1.
- Pure logic: none worth isolating; the checks are DOM reads covered in layer 2.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Only what needs a real engine or the fixture app. Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Target size (2.5.8): every link box in `breadcrumbs--wrapped` is at least 24 by 24 px and every item 24 px tall, with and without a stylesheet that sets line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em on every element (1.4.12).
- Reflow (1.4.10): at a 320 px viewport, `breadcrumbs--wrapped` causes no horizontal scroll.
- Direction (1.3.2): in `breadcrumbs--rtl` the first step is the rightmost.
- Separators: every item's `::after` but the last has the computed `content` `""` and a right border in the separator colour; a screenshot comparison of `breadcrumbs--basic` pins the drawn slash.
- Focus visible (2.4.7): a screenshot comparison before and after Tab to the first link shows a focus indicator around its 24 px box.

Against the prerendered fixture app, one route with the recipe trail inside a routed component, a Router-marked trail, and a trail inside `@defer (hydrate never)`:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; the current link carries `aria-current` and the current colour.
- Hydration: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`; the trail's `aria-current` is on the same link in the server HTML, after hydration, and after the initial navigation.
- `hydrate never`: the block's links navigate and keep Foundation's look.

Manual release test (ADR 0022): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, on `breadcrumbs--basic` and `breadcrumbs--current-text`: the landmarks list offers "Breadcrumb"; reading the trail says no "slash"; the current page is announced as current in both forms; the disabled step is read as text.

## Out of Scope

- Rendering the trail from the Router's configuration (a breadcrumb service, a route-data key, or a component that builds the steps): Foundation's markup is the consumer's, and which routes are steps and what they are called is application data; the recipes show `@for` over the consumer's own trail. Category: `scope-boundary`.
- Schema.org `BreadcrumbList` structured data (Foundation's docs callout): microdata attributes on the consumer's list, items, and links compose with the directives, and JSON-LD is page metadata. Category: `scope-boundary`.
- A `current` input on the list or an item directive: `aria-current` on the link is the one source of the announcement and the look (ADR 0042), and an item directive cannot reach its link through host bindings (D4). Category: `platform-or-a11y`.
- A disabled step as a placeholder link with `aria-disabled="true"` (the Pagination's disabled item): a step without a page is not a control, and the inactive-control exemption from 1.4.3 would leave a level's name at 1.6252:1 (D5). Category: `platform-or-a11y`.
- Silent separators for a consumer's own character: CSS in the Browser target cannot remove a text glyph from the accessibility tree, and CSS generated-content alternative text (`content: '>' / ''`) needs Safari 17.4 and Firefox 128 (the [Spec: Accordion](../issues/15-spec-accordion.md)'s D18); such a consumer keeps Foundation's glyph (D6). Category: `platform-or-a11y`.
- Collapsing a long trail into an overflow control: Foundation has no such form, and the trail wraps at 320 px (1.4.10). Category: `scope-boundary`.
- The separator's lean following a `dir` region of the other direction: its `/` or `\` follows `$global-text-direction` as Foundation's glyph does, and `:dir()` needs Chrome 120 (D8). Category: `platform-or-a11y`.
- The screen-reader-only directive for `.show-for-sr`: the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Two attribute directives in `ngx-foundation-sites/breadcrumbs`: `NfsBreadcrumbs` binds `.breadcrumbs`; `NfsBreadcrumbsItem` binds `.disabled` from `disabled`; no component, no `exportAs` | One directive per Structural class and every State class a host binding (ADR 0039); nothing is generated (ADR 0001); the item has no Structural class, so it is named after Foundation's term for it (the `$breadcrumbs-item-*` settings, building-blocks 1.3) | A breadcrumbs component rendering steps from an input (Foundation's markup is the consumer's; ADR 0001) (`scope-boundary`); an item directive required on every `li` (only a disabled step has a state) (`other`) |
| D2 | Hosts `ul` and `ol` | Foundation's docs use `ul` and its CSS styles the class alone, so an `ol` renders the same; the APG's example uses an ordered list because a trail is an order | `ul` only, as the Menu and Pagination (a trail's order is its meaning) (`other`) |
| D3 | No Variant input | Foundation's Breadcrumbs has no Variant class; `$breadcrumbs-item-uppercase` and `$breadcrumbs-item-separator` are Sass booleans, which stay compile-time configuration and never become inputs (the library's input-naming rule) | Inputs for the Sass booleans (they select no class) (`other`) |
| D4 | The current page is `aria-current="page"` on its link, which keeps its `href`; `nfs-breadcrumbs` colours it `$breadcrumbs-item-color-current` with the Menu's and the Pagination's selector exclusion; a current page written as text carries `aria-current` on its `li`; Foundation's hidden "Current: " is dropped | The APG pattern; ADR 0042 and the [Spec: Pagination](../issues/87-spec-pagination.md)'s D4; one source for the announcement and the look (1.3.1); Foundation colours a current breadcrumb only as its `li`'s text, so a current link otherwise keeps the link colour (measured in three engines); the hidden text would be read beside `aria-current` | A `current` input (a second source, and an item directive cannot reach its link) (`platform-or-a11y`); keeping the hidden "Current: " (read twice where `aria-current` is announced) (`platform-or-a11y`) |
| D5 | A disabled step is text in `li[nfsBreadcrumbsItem] disabled`, styled by Foundation's own `.disabled` rule; no ARIA state; 1.4.3 applies, so on Foundation's defaults the consumer sets `$breadcrumbs-item-color-disabled: #737373;` | A step without a page is a level of the hierarchy whose name the reader needs, not a control; the inactive-control exemption does not apply, and axe fails Foundation's example (1.62 in three engines); the class is Foundation's, so binding it reuses Foundation's rule; `#737373` (4.7015:1) is the placeholder colour the Forms spec already requires. Here the spec departs from the Pagination on purpose: the Pagination's disabled item is a control, this one is text | The Pagination's placeholder link with `aria-disabled="true"` (promises a link that never exists, and its exemption would leave the level's name at 1.6252:1) (`platform-or-a11y`); `aria-disabled` on the `li` (not supported on `listitem` in WAI-ARIA 1.2) (`platform-or-a11y`); a library rule recolouring `.disabled` (re-implements a Foundation style the setting controls) (`other`) |
| D6 | `nfs-breadcrumbs` draws Foundation's default separator (`/`, or `\` in a right-to-left compile) as an empty `inline-block` with a slanted end border in the separator colour; another character keeps Foundation's glyph; with separators off it draws none | CSS generated text is in the accessibility tree (measured: "/" after every link in Chromium) and read aloud by some screen readers (Foundation's docs); the APG's breadcrumb example draws its separator the same way "to prevent screen reader announcement of the visual separators"; measured in three engines, the drawn slash matches the glyph's place and colour, is 2 px narrower (items 58.00 against 60.06 px), and stays visible in forced colours | Keeping the glyph everywhere, documented (the triage's first reading; every screen reader user hears the separators) (`platform-or-a11y`); CSS alternative text `content: '/' / ''` (Safari 17.4, Firefox 128; building-blocks 1.2's one-path rule) (`platform-or-a11y`); `aria-hidden` separator elements in the consumer's markup (markup Foundation does not write, and they would count as list items) (`other`) |
| D7 | 2.5.8 by size: links `inline-block` with `min-width: 24px; min-height: 24px` and centred text; items `line-height: max(24px, <the list line height>)` and `min-height: 24px` | Building-blocks 1.10 meets 2.5.8 by size, not spacing; one line height for every item keeps the floats in rows (floats of mixed heights catch on each other); the `min-height` pair holds the size under a user's line-height override; measured in three engines: 24.00 px boxes and rows, no `target-size` violation, with and without the text spacing | Row spacing alone, `min-height` on the items (passes axe through the spacing exception, which 1.10 does not rely on) (`platform-or-a11y`); `line-height` alone (a user's line-height override shrinks the links to 16.5 px, measured) (`platform-or-a11y`) |
| D8 | Items float to `inline-start` | 1.3.2 in a region whose direction differs from the stylesheet's: Foundation's `float: $global-left` is fixed at compile time (measured: a `dir="rtl"` trail in a left-to-right compile runs left to right in three engines); `float: inline-start` is in the Browser target and equals Foundation's float in the compile's own direction; the separator's lean stays the compile's, as Foundation's glyph choice does | Leaving the float to the compile (the Pagination's and Menu's items follow `dir` natively, the trail would not) (`other`); flipping the separator with `:dir()` (Chrome 120) (`platform-or-a11y`) |
| D9 | Compile-time checks: link, current, and disabled text at 4.5:1 on `$body-background`; no 1.4.1 pair check | 1.4.3 for every text colour Foundation sets; for 1.4.1, the current page is also the last step, and F73 accepts navigational links identified by design and context; a disabled step is text, not a control whose state needs a second cue; no grey both reaches 4.5:1 on the page and differs 3:1 from Foundation's link colour (the disabled colour would have to be near black, the current step's look) | The Pagination's 1.4.1 check of the disabled against the enabled colour (its disabled item is a control's state) (`other`); a check of the separator colour (the separator is decoration) (`platform-or-a11y`) |
| D10 | Development checks 1 to 9, `NfsBreadcrumbs`'s in one self-destroying `afterEveryRender`, with the Pagination's landmark condition and wording | Parallel to the Pagination for the shared parts (landmark, copied classes, `aria-current` placement, links without `href`, missing include); check 4 is the trail's own, because `RouterLinkActive` without exact matching marks every step; data-driven trails are checked once their steps exist | Checking once in `afterNextRender` (misses a trail whose steps arrive later) (`other`); a `MutationObserver` (costs more than a development check finds) (`other`) |
| D11 | No listeners, no Parent token, no Defaults token, no models, outputs, or methods, no Runtime checks | Nothing to handle, emit, or type; building-blocks 1.4 and 1.9; the Menu's and Pagination's shape | An `nfsBreadcrumbsToken` for the item (the same entry point, a development-only lookup) (`other`); a presence property for the missing include (not adopted by ADR 0040's dated note; check 6 reads the link's display instead) (`other`) |
| D12 | Router recipes: `[attr.aria-current]` from the trail's last step inside a routed component, or `RouterLinkActive` with `{exact: true}` and `ariaCurrentWhenActive="page"` on every step | A routed component has its route at the first client render, so the trail and its current page hydrate unchanged; every step of a trail is an ancestor of the current URL | `RouterLinkActive` without `exact` (marks every step) (`platform-or-a11y`); a trail read from the Router's state in the application shell (empty at the first client render) (`platform-or-a11y`) |
| D13 | Five stories; e2e only for geometry, direction, the drawn separator, focus visible, and the fixture app; a manual screen-reader release test | Geometry and three engines need real browsers; Storybook's layer runs in Chromium; announcements need assistive technology | A forced-colours e2e (measured once in Chromium: the separators take the text colour) (`platform-or-a11y`) |
| D14 | Glossary terms **Breadcrumbs** and **Disabled step**, and **Current link** widened | Foundation's name for the component, and the state the spec distinguishes from a disabled control | A term for the drawn separator (an implementation rule, not domain language) (`other`) |

### Usage examples

```ts
@Component({
  selector: 'app-feature-trail',
  imports: [NfsBreadcrumbs, NfsBreadcrumbsItem, RouterLink],
  template: `
    <nav aria-label="Breadcrumb">
      <ol nfsBreadcrumbs>
        @for (step of trail(); track step.label) {
          @if (step.url === null) {
            <li nfsBreadcrumbsItem disabled>{{ step.label }}</li>
          } @else {
            <li>
              <a [routerLink]="step.url" [attr.aria-current]="$last ? 'page' : null">{{ step.label }}</a>
            </li>
          }
        }
      </ol>
    </nav>
  `,
})
export class FeatureTrail {
  // Built by the routed component that renders this trail, from its route data.
  readonly trail = input.required<readonly {label: string; url: string | null}[]>();
}
```

```html
<!-- A static trail with RouterLinkActive: exact matching on every step -->
<nav aria-label="Breadcrumb">
  <ol nfsBreadcrumbs>
    <li><a routerLink="/" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Home</a></li>
    <li><a routerLink="/docs" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Docs</a></li>
    <li><a routerLink="/docs/install" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Install</a></li>
  </ol>
</nav>

<!-- Foundation's docs markup and its library form -->
<nav aria-label="You are here:" role="navigation">
  <ul class="breadcrumbs">
    <li><a href="#">Home</a></li>
    <li class="disabled">Gene Splicing</li>
    <li><span class="show-for-sr">Current: </span> Cloning</li>
  </ul>
</nav>
<nav aria-label="Breadcrumb">
  <ul nfsBreadcrumbs>
    <li><a href="/">Home</a></li>
    <li nfsBreadcrumbsItem disabled>Gene Splicing</li>
    <li aria-current="page">Cloning</li>
  </ul>
</nav>
```

`RouterLink` and `RouterLinkActive` are shown only to place them; the trail's data is the application's.

### Platform features to adopt when the browser target moves

- CSS generated-content alternative text (`content: $breadcrumbs-item-separator-item / ''`; Chrome 77, Safari 17.4, Firefox 128): keeps any separator character silent with Foundation's own glyph, replacing the drawn separator (D6) and serving consumers with their own character.
- `:dir()` (Chrome 120): lets the drawn separator lean with the region's direction in a stylesheet of the other direction (D8).

### Foundation behaviour changed or dropped

- The current page is `aria-current="page"` on its link, which `nfs-breadcrumbs` gives Foundation's current-item colour, or on its `li` when it is text; Foundation's visually hidden "Current: " is dropped (D4).
- The disabled step's colour must reach 4.5:1: on Foundation's defaults `$breadcrumbs-item-color-disabled` becomes `#737373` (D5).
- Foundation's default separator is drawn without text; another character keeps Foundation's glyph (D6).
- Links become `inline-block` boxes of at least 24 by 24 px, and every item sits on a line of at least 24 px, so a single-row trail is 24 px tall where Foundation's was 17.59 px (D7).
- Items float to `inline-start`, so the trail follows `dir` (D8).
- The landmark is named "Breadcrumb", the APG's name, without Foundation's repeated `role="navigation"`.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. Breadcrumbs relies on Foundation's export mixin `foundation-breadcrumbs` (in `foundation-everything`), configured through the `$breadcrumbs-*` settings. Its documented custom CSS is the `nfs-breadcrumbs` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-breadcrumbs`.

(1) Rules:

| # | Selector | Declarations | Reason |
| --- | --- | --- | --- |
| 1 | `.breadcrumbs a[aria-current]:where(:not([aria-current='false']):not([aria-current='']))` | `color: $breadcrumbs-item-color-current` | Foundation colours a current breadcrumb only as its `li`'s text; the rule gives a current link the same colour from its ARIA state (ADR 0042), at specificity (0,2,1), over Foundation's `.breadcrumbs a` (0,1,1); the link keeps Foundation's hover underline |
| 2 | `.breadcrumbs li:not(:last-child)::after`, emitted only while `$breadcrumbs-item-separator` is `true` and the separator for the compile's direction is Foundation's default (`/`, or `\` when `$global-text-direction` is `rtl`) | `content: ''; display: inline-block; height: 0.8em; border-inline-end: 0.1em solid; transform: rotate(15deg)` (`-15deg` in a right-to-left compile) | Foundation's glyph is text in the accessibility tree; the empty box keeps Foundation's `margin` and `color` (`$breadcrumbs-item-separator-color`, which the border takes as `currentColor`) and draws the slash with no text, as the APG's example does; the same selector as Foundation's, after it in source order |
| 3 | `.breadcrumbs li` | `float: inline-start; line-height: max(24px, <$list-lineheight as em>); min-height: 24px` | 1.3.2: the trail follows `dir` (Foundation's float is fixed at compile time); 2.5.8: one line of at least 24 px for every item keeps the rows 24 px apart and the floats aligned; `$list-lineheight` is the line height Foundation gives lists |
| 4 | `.breadcrumbs a` | `display: inline-block; min-width: 24px; min-height: 24px; text-align: center` | 2.5.8 by size: an inline link's box is its 12 px text; the box grows to 24 by 24 px around Foundation's unchanged text, whose line it centres; Foundation has no setting for it |

Checks (no CSS output), one `@error` listing every failing colour with its setting and its exact unrounded ratio from the library's helper (a translucent colour composited over `$body-background` first): `$breadcrumbs-item-color`, `$breadcrumbs-item-color-current`, and `$breadcrumbs-item-color-disabled` on `$body-background` under 4.5:1 (1.4.3). Over Foundation 6.9.0's defaults: 4.6473, 19.6304, and 1.6252:1, so the compile stops on the disabled colour until the required setting is made.

(2) Reused settings, mixins, and functions: `$breadcrumbs-item-color`, `$breadcrumbs-item-color-current`, `$breadcrumbs-item-color-disabled`, `$breadcrumbs-item-separator` (after Foundation's own mapping of the legacy `$breadcrumbs-item-slash`), `$breadcrumbs-item-separator-item`, `$breadcrumbs-item-separator-item-rtl`, `$global-text-direction`, `$list-lineheight`, and `$body-background`, all read from the consumer's compile; no mixin parameter. 24 px and 4.5 are WCAG's numbers; the separator's `0.8em`, `0.1em`, and `15deg` draw the glyph's shape (the APG example's values, measured to match Foundation's glyph).

(3) Custom properties: none.

(4) Motion classes: none, and no `prefers-reduced-motion` override; Breadcrumbs adds and awaits no animation.

(5) What breaks when the include is missing: a current link keeps the link colour, the separators are read aloud, links stay 12 px tall and a wrapped trail fails 2.5.8, the trail ignores `dir`, and the compile-time checks do not run, so Foundation's 1.6252:1 disabled step compiles silently; development check 6 reports the missing include.

(6) Variant properties: none. Breadcrumbs has no Variant class.

Required setting on Foundation's defaults, which the Storybook settings overrides mirror with the comment "color-contrast (1.4.3): Foundation's disabled breadcrumb is 1.63:1 (axe reports 1.62), and nfs-breadcrumbs stops the compile. Spec: Breadcrumbs, breadcrumbs--basic.":

```scss
$breadcrumbs-item-color-disabled: #737373;
```

### Notes

- RTL: in a right-to-left compile Foundation uses `\` and the drawn separator leans the same way; items float to `inline-start`, so the trail follows `dir` in either compile. With separators off, Foundation's item margin stays on `$global-right`.
- Uppercase: Foundation's `$breadcrumbs-item-uppercase` transforms the text, and Chromium exposes the transformed text as the link's name ("HOME", measured); the visible text and the name match.
- Two trails on one page (rare) are two landmarks; each takes its own name.
- A step without a page may also be written as plain text without `disabled`; it then takes the current step's colour, so the disabled form is the one that looks like Foundation's.
- Measured facts in this spec come from this spec's ticket; the probe files stayed outside the repository.
