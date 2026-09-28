# Spec: Pagination

Ticket: [Spec: Pagination](../issues/87-spec-pagination.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites who splits search results, products, or articles over several pages writes Foundation's Pagination: a `ul.pagination` of `li` elements holding links, inside a `nav` named "Pagination", with `.pagination-previous` and `.pagination-next` on the first and last items, `.current` on the item of the current page, `.disabled` on an item that cannot be followed, and an empty `li.ellipsis` where pages are skipped. Pagination is a CSS-only component: it ships Sass and classes and no Plugin. Its markup contract leaves the hard parts to the author:

- The current page is `.current` on an `li` holding plain text and visually hidden "You're on page" text. The class is a look assistive technology never hears (WCAG 1.3.1): measured in Chromium, the current item is static text "1", not a link and not marked current.
- The disabled Previous item is `.disabled` on an `li` holding plain text in `$pagination-item-color-disabled` (`$medium-gray`, `#cacaca`): as text it is not an inactive control, so it must reach 4.5:1, and it reaches 1.6252:1. axe reports it (`color-contrast`, 1.62) on Foundation's own example in Chromium, Firefox, and WebKit.
- Foundation styles `<button>` items too, but its reset gives buttons `line-height: 1`, so a button item is 20 CSS px tall (measured in three engines), under WCAG 2.5.8's 24 px; axe passes it only through the spacing exception, which the library does not rely on (building-blocks 1.10).
- Foundation draws the previous and next arrows as generated content inside the links, and generated content joins a link's name: without an `aria-label` the Next link is named "Next page" followed by the arrow character (U+00BB) (measured in Chromium).
- Under the library's class rule the developer writes no Foundation class at all, so `.pagination`, `.pagination-previous`, `.pagination-next`, `.ellipsis`, `.current`, and `.disabled` need an Angular home, and the two state classes need a source that assistive technology can read.

A server-rendered application adds the usual contract: every class and state must already be in the server HTML, nothing may change at hydration, and links must keep navigating natively before hydration and inside dehydrated or `hydrate never` blocks.

## Solution

Four attribute directives in one entry point, one per Structural class: `nfsPagination` on the developer's `ul` binds `.pagination`; `nfsPaginationPrevious` and `nfsPaginationNext` on the first and last `li` bind `.pagination-previous` and `.pagination-next`; `nfsPaginationEllipsis` on an empty `li` binds `.ellipsis` and hides the item from assistive technology. None has an input, a listener, or a template, so the server HTML is the final DOM and every rendering mode keeps working as plain HTML. Foundation's Pagination has no Variant class; centring is the Typography Helpers' text alignment.

The two states are ARIA on the item's link or button, never a class, as the Menu's current page is ([ADR 0042](../adr/0042-menu-current-page-aria-current.md)): the current page is `aria-current` on its link (or button), and a disabled item is a placeholder link (no `href`, `role="link"`, `aria-disabled="true"`, the Button's disabled-link contract, [ADR 0011](../adr/0011-button-listener-free-disabled-contract.md)) or a natively disabled button. The `nfs-pagination` Library mixin gives them Foundation's current and disabled looks through Foundation's own `pagination-item-current` and `pagination-item-disabled` mixins, so there is no `.current` or `.disabled` for anyone to write, no way to show a current page assistive technology does not announce, and a disabled item that is an inactive control, which WCAG 1.4.3 exempts and axe skips. The same mixin gives every link and button a 24 px floor and stops the compile when the consumer's settings make the items, the current page, the ellipsis, or the disabled look fail WCAG 2.2 AA.

In development builds `nfsPagination` warns when the list is outside a named `nav`, when Foundation's classes were copied onto the items, when `aria-current` sits on something other than a link or button, when a disabled link still navigates or a placeholder link is not marked disabled, and when the current page has no look because `nfs-pagination` is not included.

## User Stories

1. As an application developer, I want to put `nfsPagination` on a `ul` and get Foundation's `.pagination` styling, so that I write no Foundation class.
2. As an application developer, I want `nfsPaginationPrevious` and `nfsPaginationNext` on the first and last items, so that they get Foundation's previous and next arrows without a class.
3. As an application developer, I want `nfsPaginationEllipsis` on an empty item, so that skipped pages show Foundation's ellipsis and screen readers skip it.
4. As an application developer, I want to mark the current page with `aria-current="page"` on its link and get Foundation's current look, so that one attribute gives both the announcement and the style.
5. As an application developer, I want the current page to stay a link, so that it keeps its place in the tab order and in a screen reader's list of links.
6. As an application developer, I want to bind `[attr.aria-current]` from my page state, so that the pagination follows the page the route shows with no class in my template.
7. As an application developer whose pages are paths (`/results/3`), I want `routerLinkActive ariaCurrentWhenActive="page"` to mark the current page, so that the Router writes the state.
8. As an application developer, I want a disabled Previous on the first page to be a placeholder link with `role="link"` and `aria-disabled="true"`, so that it looks disabled, is announced as an unavailable link, and never navigates.
9. As an application developer paging a table without changing the URL, I want button items with `aria-current` and native `disabled`, so that Foundation's button styling gets the same current and disabled looks.
10. As an application developer, I want to leave the disabled Previous out on the first page instead, so that I can follow a design that shows no disabled item.
11. As an application developer, I want to centre the pagination with the Typography Helpers' text alignment, so that Foundation's "Centered" example needs no class.
12. As an application developer, I want a development warning when the pagination is not inside a named `nav`, so that screen reader users can find it and WebKit keeps its list semantics.
13. As an application developer copying Foundation's markup, I want a development warning for a copied `current`, `disabled`, `ellipsis`, `pagination-previous`, or `pagination-next` class, naming the attribute or directive to use, so that I migrate quickly.
14. As an application developer, I want a development warning when `aria-current` sits on an `li` or a `span`, so that I move it to the link that gets the look.
15. As an application developer, I want a development warning when a disabled link still has an `href`, or a link without `href` is not marked disabled, so that no disabled item navigates and no placeholder link is silently dead.
16. As an application developer, I want a development warning when the current page has no look, so that a missing `@include nfs-pagination;` does not leave sighted users without a current page.
17. As an application developer, I want those checks to run once my pages have rendered, even when they arrive from data after the first render, so that asynchronous pagination is checked too.
18. As an application developer, I want the library's Sass to stop my build when my settings make item text, the current page, the ellipsis, or the disabled look fail WCAG 2.2 AA, naming the setting and the ratio, so that a theme cannot fail silently where axe cannot look.
19. As an application developer, I want a compile warning when I set `$pagination-mobile-current-item`, which cannot act on the library's markup, so that I know why the current page is hidden on small screens.
20. As an application developer, I want my own classes and attributes on the `ul` and the items to stay, so that application styling still works.
21. As an application developer, I want to import the Pagination from its own entry point, so that a `@defer` block can split it with the rest of its content.
22. As a screen reader user, I want the pagination to be a list of links inside a navigation landmark named "Pagination", so that I can find it and hear how many items it has.
23. As a screen reader user, I want the current page's link announced as "Page 3, current page", so that I know where I am.
24. As a screen reader user, I want a disabled Previous announced as an unavailable link, so that I know I am on the first page.
25. As a screen reader user, I want the Previous and Next links named "Previous page" and "Next page" without the arrow characters, so that I hear their purpose once.
26. As a screen reader user, I want the ellipsis skipped, so that I hear only pages I can follow.
27. As a keyboard user, I want every enabled link in the tab order in reading order with the browser's own focus ring, and disabled items skipped, so that I reach and see every page I can open.
28. As a keyboard user of a pager that updates in place, I want focus to land on the new results after a page change, so that I do not lose my place when the item I pressed becomes disabled.
29. As a low-vision user, I want the current page's text to reach 4.5:1 on its fill and the fill to differ from the page by 3:1, so that I can read it and tell it apart without relying on hue.
30. As a low-vision user, I want item text, hovered item text, and the ellipsis at 4.5:1, so that I can read every page number.
31. As a user with limited dexterity, I want every page link and button at least 24 by 24 CSS px, so that I can hit it even when the items wrap.
32. As a user on a narrow screen, I want the pagination to show Previous and Next without scrolling sideways at 320 CSS px, as Foundation's small-screen default does, so that I can page through results.
33. As a user of a right-to-left page, I want the items to run in the reading direction, so that the pagination reads naturally.
34. As a user who prefers reduced motion, I want the pagination to stay free of animation, so that nothing moves.
35. As a developer of a server-rendered application, I want every Pagination class, `aria-hidden` on the ellipsis, and the current link's `aria-current` in the server HTML, so that the first paint is final and hydration changes nothing.
36. As a developer using `@defer (hydrate never)`, I want a pagination there to keep Foundation's look and working links, so that static result pages need no JavaScript.
37. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
38. As a library maintainer, I want every class, state, check, and warning asserted in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Pagination has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's pagination Sass partial and its docs page. Dropped options: none, because there are none.

| Feature | Class or markup | Source in Foundation's Sass | Notes |
| --- | --- | --- | --- |
| Pagination | `ul.pagination` of `li` elements with links (`a`) or buttons | `foundation-pagination`, `pagination-container` | `margin-left: 0`, `$pagination-margin-bottom`, clearfix; items `display: inline-block` with `$pagination-item-spacing` on the end side, `$pagination-radius`, `$pagination-font-size` (`rem-calc(14)`); `a, button` `display: block`, `$pagination-item-padding` (`rem-calc(3 10)`), `$pagination-item-color`, hover `$pagination-item-background-hover` |
| Small screens | Items other than the first and last hidden below `medium` | `pagination-container`, `$pagination-mobile-items: false`, `$pagination-mobile-current-item: false` | Compile-time settings; the second shows `li.current` too (see D9) |
| Previous and next | `li.pagination-previous`, `li.pagination-next` | `foundation-pagination` under `$pagination-arrows: true`: `.pagination-previous a::before, .pagination-previous.disabled::before` (and the next mirror), `$pagination-arrow-previous` (`\00AB`), `$pagination-arrow-next` (`\00BB`), a literal `0.5rem` margin | Arrows only on links and on a disabled text item, never on buttons |
| Current page | `.current` on an `li` holding text | `pagination-item-current`: `$pagination-item-padding`, `$pagination-item-background-current` (`$primary-color`), `$pagination-item-color-current` (`$white`), `cursor: default` | The docs add `.show-for-sr` "You're on page" text |
| Disabled item | `.disabled` on an `li` holding text | `pagination-item-disabled`: `$pagination-item-padding`, `$pagination-item-color-disabled` (`$medium-gray`), `cursor: not-allowed`, transparent on hover | "to add disabled styles to a link", the docs say; the example has no link |
| Ellipsis | Empty `li.ellipsis`, `aria-hidden="true"` in the first example | `pagination-ellipsis` on `.ellipsis::after`: `content: '\2026'`, `$pagination-ellipsis-color`, the item padding | Scoped under `.pagination` |
| Landmark | `<nav aria-label="Pagination">` around the list | Docs text | "This explains the purpose of the component to assistive technologies" |
| Names | `aria-label="Page 2"`, `aria-label="Next page"`, `.show-for-sr` "page" | Docs text | The labels also keep the generated arrows out of the names |
| Centring | `.text-center` on the `ul` | `foundation-text-alignment` | A Typography Helpers class, not Pagination's |

Docs conventions the spec keeps or corrects: the `nav` named "Pagination" (kept, and checked in development); `aria-label` names on page, previous, and next links (kept); the current page as `li.current` text (corrected: a link, or a button, with `aria-current`, D4); the disabled Previous as `li.disabled` text (corrected: a placeholder link or a disabled button, D5); `aria-hidden="true"` on the ellipsis (kept, bound by the directive, D6); `.text-center` (the Typography Helpers directive, D10).

### CSS class to Angular mapping

Every Foundation Pagination class, per building-blocks 1.14 item 2. Pagination has no Variant class, so there is no Variant input, type alias, Variant registry, or Variant property.

| Foundation class | Kind | Angular | Value shape and the class each value sets |
| --- | --- | --- | --- |
| `.pagination` | Structural | `NfsPagination`, `ul[nfsPagination]`, static host class | Always |
| `.pagination-previous` | Structural | `NfsPaginationPrevious`, `li[nfsPaginationPrevious]`, static host class | Always |
| `.pagination-next` | Structural | `NfsPaginationNext`, `li[nfsPaginationNext]`, static host class | Always |
| `.ellipsis` | Structural | `NfsPaginationEllipsis`, `li[nfsPaginationEllipsis]`, static host class plus `aria-hidden="true"` | Always |
| `.current` | State | Not bound. The current page is `aria-current` on its link or button; `nfs-pagination` styles it with Foundation's `pagination-item-current` (D4) | A link or button whose `aria-current` is present and neither `false` nor empty |
| `.disabled` | State | Not bound. A disabled item is a placeholder link with `role="link"` and `aria-disabled="true"`, or a natively disabled button; `nfs-pagination` styles it with Foundation's `pagination-item-disabled` (D5) | `a[aria-disabled='true']`, `button:disabled` |
| `.text-center` | Utility (Typography Helpers) | The [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsTextAlign="center"` (`NfsTextAlignment`), written beside `nfsPagination` (D10) | Not this entry point's |
| `.show-for-sr` | Utility (Visibility classes) | Not used by the recipes: `aria-label` names the links, as Foundation's docs do (D7). Where visually hidden text is wanted, the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive (`nfsShowForSr`) | Not this entry point's |

No class is left for the consumer to write (ADR 0039). `.current` and `.disabled` are never bound, so a copied one is not stripped; it is reported in development builds (Development checks, 2), because it would draw a current or disabled look that no ARIA state backs.

Naming: building-blocks 1.3 names a class directive `Nfs` plus the PascalCase of its Structural class, which would make `.ellipsis` `NfsEllipsis`. Foundation writes the class without its component's prefix but styles it only under `.pagination` (`.pagination .ellipsis::after`), and a bare `nfsEllipsis` would read as a text-truncation utility (Foundation's Prototyping text utilities use the word for `text-overflow`), so the directive takes its component's name: `NfsPaginationEllipsis` (D2).

### Hierarchy and DI shape

```
ngx-foundation-sites/pagination     (secondary entry point)
  ul[nfsPagination]                NfsPagination           no inputs, providers, token, or host directives
    li[nfsPaginationPrevious]      NfsPaginationPrevious   in development builds only: inject(NfsPagination, {optional: true})
    li                             (no directive)          <a href> or <button type="button">, carrying aria-current or the disabled form
    li[nfsPaginationEllipsis]      NfsPaginationEllipsis   aria-hidden="true"; same development-only lookup
    li[nfsPaginationNext]          NfsPaginationNext       same development-only lookup
  uses: ElementRef and, in development builds only, afterEveryRender and afterNextRender
```

- No Parent token. Nothing needs `NfsPagination` through DI except its children's development warning, and they live in the same entry point, so they look it up by class, as `NfsMenuText` looks up `NfsMenu`; the lookup is removed from production bundles.
- No Defaults token: Pagination has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- No directive on page items, links, or buttons (D3): a page item has no Structural class, and its state is an ARIA attribute the consumer (or the Router) already writes.
- DI follows the declaration site: items projected into a `ul[nfsPagination]` from another template do not find it and warn in development; the recipes declare the items in the pagination's own template.

### API: `NfsPagination`

Selector `ul[nfsPagination]`; standalone; no template; no `exportAs`, because it has no state to read.

```ts
class NfsPagination {}
```

- Inputs, models, outputs, and methods: none. The pagination owns no state: which page is current is the application's, and each item's link carries it.
- Host: static `class="pagination"`. No attribute, no listener.

### API: `NfsPaginationPrevious`, `NfsPaginationNext`, `NfsPaginationEllipsis`

| Directive | Selector | Host | Notes |
| --- | --- | --- | --- |
| `NfsPaginationPrevious` | `li[nfsPaginationPrevious]` | static `class="pagination-previous"` | Holds the Previous link or button; Foundation's arrow comes from its CSS on the link |
| `NfsPaginationNext` | `li[nfsPaginationNext]` | static `class="pagination-next"` | Holds the Next link or button |
| `NfsPaginationEllipsis` | `li[nfsPaginationEllipsis]` | static `class="ellipsis"` and `aria-hidden="true"` | Empty: Foundation's CSS draws the glyph |

No inputs, models, outputs, or methods on any of them. On Foundation's default small-screen setting only the first and last items show, so `nfsPaginationPrevious` goes on the first item and `nfsPaginationNext` on the last, as in Foundation's docs.

### Development checks

Each warns once per instance through `console.warn`, never on the server and never in production builds.

`NfsPagination` registers, in development builds only, one `afterEveryRender` read callback that returns while its host holds no `li`, runs the checks below once, and destroys itself; pages that arrive from data after the first render are therefore checked (D11).

1. Landmark: the host has no `nav` or `[role=navigation]` ancestor, or that ancestor has neither `aria-label` nor `aria-labelledby`: "nfsPagination: wrap the pagination in a named navigation landmark, for example <nav aria-label="Pagination">".
2. Copied Foundation classes on the items: `current` or `disabled` on any `li` (no directive binds them, so they still draw a look with no ARIA state behind it): "class="current" has no ARIA state: remove it and put aria-current="page" on the page's link"; "class="disabled" disables nothing: remove it and write the item as a placeholder link (no href, role="link", aria-disabled="true") or a disabled button". `ellipsis`, `pagination-previous`, or `pagination-next` on an `li` without the matching directive attribute: names the directive (an ellipsis copied without it is read aloud, because it lacks `aria-hidden`). Redundant classes on a directive's own host merge with its static class and are not reported.
3. Current page placement: `aria-current`, present and neither `false` nor empty, on an element inside the host that is not an `a` or a `button`: "aria-current here gets no current-page look: put it on the page's link or button".
4. Disabled contract (ADR 0011's placeholder link, the Button spec's checks for its own hosts): an `a` with `aria-disabled="true"` and an `href`: "a disabled link still navigates: bind its href or routerLink to null"; an `a` with `aria-disabled="true"` and no `role="link"`: "a placeholder link with aria-disabled needs role="link" to be announced as an unavailable link"; an `a` with neither `href` nor `aria-disabled="true"`: "a link without href is not focusable: add an href, or mark it disabled with role="link" and aria-disabled="true"".
5. Missing include: the first link or button with `aria-current` has a fully transparent computed `background-color`: "the current page has no look: @include nfs-pagination; after foundation-pagination". Foundation's CSS gives a resting link no background, and `nfs-pagination` stops the compile for a current fill under 3:1 against the page, so a transparent one means the include (or Foundation's pagination CSS) is missing (measured: without the include the current link's background is `rgba(0, 0, 0, 0)` in three engines).

`NfsPaginationPrevious`, `NfsPaginationNext`, and `NfsPaginationEllipsis` each warn, in their first client render callback, when no `NfsPagination` is above them in the injector tree: "this item is outside nfsPagination".

Runtime checks ([ADR 0040](../adr/0040-variant-input-types.md)): none. Pagination has no Variant input and its mixin writes no Variant property, so there is nothing for `strictVariantNames` or `strictVariantProperties` to read; check 5 covers the missing include instead.

### Comparison with Angular Material (`MatPaginator`, 22.2)

| Concern | Material | `NfsPagination` |
| --- | --- | --- |
| Kind | `mat-paginator` component with its own template: a page size select, a range label, and first, previous, next, and last icon buttons | Directives on the consumer's `ul` and its first, last, and ellipsis items; no template; the consumer writes the items |
| Purpose | A control for paging a data table in place | Navigation between pages of content, Foundation's "type of navigation", in a `nav` landmark |
| Page numbers | None | The consumer's links (or buttons), one per shown page |
| Current page | Shown only in the range label (`role="status"`, "1 - 10 of 100") | `aria-current` on the current page's link or button, styled by `nfs-pagination` |
| Disabled previous and next | `disabled` with `disabledInteractive`, and `tabindex="-1"` while disabled, so a focused button keeps focus when it becomes disabled | A placeholder link with `role="link"` and `aria-disabled="true"`, or a natively disabled button; the application moves focus to the new results after a page change (D12) |
| Labels | `MatPaginatorIntl` ("Previous page", "Next page") | The consumer's `aria-label`s, in the consumer's language |
| State and events | `pageIndex`, `pageSize`, `length` inputs; `page` output | None: links navigate, and buttons run the consumer's handlers |
| Testing | `MatPaginatorHarness` | DOM-first assertions; no harness |

Borrowed: the "Previous page" and "Next page" names, and the problem Material's comment names, that a focused control which becomes disabled drops focus to the page body (answered here by moving focus to the results, D12). Not borrowed: the component, the page size select, the range label, first and last buttons, the intl service, `disabledInteractive` on buttons whose only action is unavailable, and the `page` output.

### Implementation level and primitives

Implementation level: native platform. A pagination is an HTML list of links (or buttons) in a navigation landmark: the list semantics, the tab order, activation, navigation, the current page (`aria-current`), and the disabled state (a placeholder link, or `disabled`) are the platform's. `@angular/aria` has no pagination pattern in 22.2 (its patterns are accordion, combobox, grid, listbox, menu, tabs, toolbar, and tree), and its toolbar would give a navigation list a roving tab stop the APG does not ask for (ADR 0004). `@angular/cdk` is not needed: nothing is measured, focused, or observed.

Primitives: static host classes, one static host attribute (`aria-hidden`), and, in development builds only, `ElementRef`, `afterEveryRender`, `afterNextRender`, `getComputedStyle`, and an optional `inject` by class. No `input()`, `computed`, `effect`, listener, timer, or observer; `injectAsync` is not used, because every effect is a host binding that must be in the server HTML.

Fallback: none needed. The risks this design carries were measured by this spec's ticket: the looks and hover behaviour of the ARIA-keyed rules, the button height and the floor, and axe on Foundation's example and on the recipes, in three engines.

### ARIA and keyboard

APG pattern: none of its own. A pagination is a list of links in a named navigation landmark (the APG's Landmarks practice, navigation role); its closest APG cousin is the Breadcrumb pattern, which marks the current page with `aria-current="page"` on its link and has no keyboard interaction.

| Element or state | Rendered semantics | Owner |
| --- | --- | --- |
| Landmark | `<nav aria-label="Pagination">` (or `aria-labelledby`); a second pagination of the same results on one page takes its own name ("Pagination, bottom"), because axe's `landmark-unique` (the gate's `best-practice` tag) reports two identical ones; WebKit exposes a list without list markers as a list only inside a navigation landmark | Consumer; checked in development (1) |
| `ul[nfsPagination]` | Native `list` with `listitem` children; no `role` attribute | Native |
| Page link | `<a href>` named "Page 3" through `aria-label` (Foundation's docs) or visually hidden text; visible text "3" | Consumer |
| Current page | `aria-current="page"` on the page's link (or button), which keeps its `href` and is announced as the current page with its name ("Page 1"); `false` or an empty value means not current | Consumer or `RouterLinkActive` |
| Disabled Previous or Next | A placeholder link: no `href`, `role="link"`, `aria-disabled="true"`: exposed as a disabled link and not focusable (measured in Chromium: link "Previous page", disabled); or `<button type="button" disabled>` | Consumer; checked in development (4) |
| Previous and Next names | `aria-label="Previous page"` and `aria-label="Next page"`, which replace the name from content: without them Foundation's generated arrow joins the name ("Next page" followed by the arrow character (U+00BB), measured in Chromium) | Consumer |
| `li[nfsPaginationEllipsis]` | `aria-hidden="true"`: not in the accessibility tree, so the list counts only followable items (8 of 9 in Foundation's example, measured) | `NfsPaginationEllipsis` |
| Button pager | `<button type="button">` items with the same names, `aria-current`, and `disabled`; the buttons run the consumer's handlers | Consumer |

Keyboard: native only. Tab and Shift+Tab move through the enabled links and buttons in DOM order, the current page's link included; disabled items are skipped; Enter follows a link, Enter and Space press a button. The directives add no key handling and change no tab order.

Focus (D12): a link that navigates to a new document resets focus with the page. In an application where the pagination stays mounted across a page change (a routed query parameter, a button pager), the application moves focus to the start of the new results, such as their heading with `tabindex="-1"`, after the change: the library cannot know where the results are, and the move keeps a focused Next that the last page disables, or an item an `@if` replaces, from dropping focus to the page body.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (ADR 0022). Contrast ratios are computed with the exact WCAG relative-luminance formula (the library's internal `math.pow` helper) from Foundation 6.9.0's default settings (`$pagination-item-color` `$black` `#0a0a0a`, `$pagination-item-background-hover` `$light-gray` `#e6e6e6`, `$pagination-item-background-current` `$primary-color` `#1779ba`, `$pagination-item-color-current` `$white` `#fefefe`, `$pagination-item-color-disabled` `$medium-gray` `#cacaca`, `$pagination-ellipsis-color` `$black`, `$body-background` `#fefefe`) and compared unrounded, never with Foundation's `color-luminance()` or `color-contrast()` (building-blocks 1.10). Geometry was measured in Chromium, Firefox, and WebKit through Playwright 1.63 at a 16 px root font size, with axe-core 4.13.0.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.3.1 Info and Relationships | The list stays a list inside a named landmark. The current page and the disabled state are programmatic: the only ways to get their looks are `aria-current` on a link or button and the disabled placeholder link or disabled button (D4, D5), so neither state can be shown visually alone. Copied `current` and `disabled` classes are reported in development | Fails: `.current` and `.disabled` are visual only; the current page is static text | axe in every story; `pagination--basic` finds the current page with `getByRole('link', {current: 'page'})`; SSR smoke |
| 1.4.1 Use of Color | The current page differs from its neighbours by a filled background at least 3:1 against `$body-background`, and the disabled look differs from an enabled item by at least 3:1 in its text; `nfs-pagination` stops the compile with `@error` otherwise. Both states are also exposed programmatically | Passes: current fill 4.6473:1; disabled against enabled text 12.0791:1 | Node-level Sass compile test (`#f0f0f0` fill 1.129:1; `$pagination-item-color-disabled: #555555` 2.655:1); `pagination--basic` asserts the fill against the page from computed styles |
| 1.4.3 Contrast (Minimum) | Item text reaches 4.5:1 on the page and on the hover background, the current page's text 4.5:1 on its fill, and the ellipsis 4.5:1 on the page (no pagination text is large text at 14 px); `nfs-pagination` stops the compile with `@error` naming the setting. A disabled item is an inactive control, which 1.4.3 exempts and axe skips (`aria-disabled="true"`, `disabled`) | Passes the checked pairs: item text 19.6304:1, on hover 15.8630:1, current text 4.6473:1, ellipsis 19.6304:1. Fails for Foundation's disabled text item: `#cacaca` text, not a control, at 1.6252:1 (axe `color-contrast` 1.62 in three engines) | Node-level Sass compile test (`#8a8a8a` fill with `$white` text 3.422:1; `$pagination-item-background-hover: #767676` 4.358:1; `$pagination-ellipsis-color: #999999` 2.824:1; `$black` on a `#1177dd` fill 4.437:1, which Foundation's `color-luminance()` passes at 4.505:1); axe `color-contrast` in every story; hover pairs in the compile test only, because axe tests the rendered state |
| 1.4.10 Reflow | On Foundation's default `$pagination-mobile-items: false`, only Previous and Next show below `medium`; with it `true`, the inline-block items wrap | Passes: at 320 CSS px Previous and Next show and `scrollWidth` is 320 (three engines) | e2e at 320 px on `pagination--basic` |
| 1.4.11 Non-text Contrast | The library draws no graphic and no component boundary: items are text; the current fill is covered by 1.4.1's check | Not applicable to library output | None beyond 1.4.1 |
| 2.1.1 Keyboard | Native links and buttons; no key handling | Passes | Story play (`userEvent.tab()`) |
| 2.4.3 Focus Order | DOM order; disabled items leave the tab order; after an in-place page change the application moves focus to the new results (D12) | Passes for Foundation's example | Play function of `pagination--buttons` asserts focus on the results heading after a change |
| 2.4.4 Link Purpose (In Context) | Page links are named "Page 3", Previous and Next "Previous page" and "Next page" (Foundation's docs); the recipe shows it and every story asserts it; the directives do not check wording (D7) | Passes in Foundation's example | Every play function finds links by name |
| 2.4.7 Focus Visible | The browser's own focus ring on every link and button, the filled current page included | Passes | e2e screenshot of the focused current link in three engines |
| 2.5.3 Label in Name | "Page 3" contains the visible "3"; "Next page" starts with the visible "Next" | Passes | Play functions find links by their full names |
| 2.5.8 Target Size (Minimum) | Every link and button is at least 24 by 24 CSS px: `nfs-pagination` sets `min-width: 24px; min-height: 24px` on `.pagination a, .pagination button` (building-blocks 1.10: met by size) | Links pass (27.80 by 28.39 px for one digit, measured); button items fail by size: Foundation's reset sets `line-height: 1`, so they are 20.00 px tall in three engines, which axe passes only through the spacing exception (no `target-size` violation, measured), an exception building-blocks 1.10 does not rely on | axe `target-size` in every story; e2e measures every link and button box at 24 px or more in `pagination--basic` and `pagination--buttons` in three engines (24.00 px measured with the floor) |
| 4.1.2 Name, Role, Value | Native roles; `aria-current` is the current state; the disabled link is `role="link"` with `aria-disabled="true"` and the disabled button native `disabled`; every control has a name | Fails for the disabled item (text, no state) and the current page (text, no state) | axe (`aria-allowed-attr`, `link-name`, `button-name`) in every story; play functions assert role, name, and state |

The story gate runs axe with the six tags of ADR 0018 (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) and `parameters.a11y.test = 'error'`, every pagination inside a named `nav`. No Foundation default needs a Storybook settings override for Pagination.

### Rendered HTML

Consumer markup and the resulting DOM. Server HTML and hydrated DOM are identical in every example: every class and attribute is static, and the states are the consumer's attributes. The blocks leave out the directives' selector attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfspagination=""`). Class order is not significant. `nfsTextAlign` is the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s text-alignment attribute (`NfsTextAlignment`, from `ngx-foundation-sites/typography-helpers`); its class belongs to that spec and is shown only to place it.

```html
<!-- Foundation's Basics: page 1 of 13 -->
<nav aria-label="Pagination">
  <ul nfsPagination>
    <li nfsPaginationPrevious><a role="link" aria-disabled="true" aria-label="Previous page">Previous</a></li>
    <li><a href="/results?page=1" aria-current="page" aria-label="Page 1">1</a></li>
    <li><a href="/results?page=2" aria-label="Page 2">2</a></li>
    <li><a href="/results?page=3" aria-label="Page 3">3</a></li>
    <li><a href="/results?page=4" aria-label="Page 4">4</a></li>
    <li nfsPaginationEllipsis></li>
    <li><a href="/results?page=12" aria-label="Page 12">12</a></li>
    <li><a href="/results?page=13" aria-label="Page 13">13</a></li>
    <li nfsPaginationNext><a href="/results?page=2" aria-label="Next page">Next</a></li>
  </ul>
</nav>

<nav aria-label="Pagination">
  <ul class="pagination">
    <li class="pagination-previous"><a role="link" aria-disabled="true" aria-label="Previous page">Previous</a></li><!-- disabled look from nfs-pagination -->
    <li><a href="/results?page=1" aria-current="page" aria-label="Page 1">1</a></li><!-- current look from nfs-pagination -->
    <li><a href="/results?page=2" aria-label="Page 2">2</a></li>
    <li><a href="/results?page=3" aria-label="Page 3">3</a></li>
    <li><a href="/results?page=4" aria-label="Page 4">4</a></li>
    <li class="ellipsis" aria-hidden="true"></li>
    <li><a href="/results?page=12" aria-label="Page 12">12</a></li>
    <li><a href="/results?page=13" aria-label="Page 13">13</a></li>
    <li class="pagination-next"><a href="/results?page=2" aria-label="Next page">Next</a></li>
  </ul>
</nav>

<!-- Centered -->
<ul nfsPagination nfsTextAlign="center">...</ul>
<ul class="pagination text-center">...</ul>

<!-- A button pager on page 2 of 3 -->
<nav aria-label="Results pages">
  <ul nfsPagination>
    <li nfsPaginationPrevious><button type="button" aria-label="Previous page">Previous</button></li>
    <li><button type="button" aria-label="Page 1">1</button></li>
    <li><button type="button" aria-current="page" aria-label="Page 2">2</button></li>
    <li><button type="button" aria-label="Page 3">3</button></li>
    <li nfsPaginationNext><button type="button" aria-label="Next page">Next</button></li>
  </ul>
</nav>
<nav aria-label="Results pages">
  <ul class="pagination">
    <li class="pagination-previous"><button type="button" aria-label="Previous page">Previous</button></li>
    ...
    <li class="pagination-next"><button type="button" aria-label="Next page">Next</button></li>
  </ul>
</nav>

<!-- Copied Foundation markup: not stripped (no directive binds these classes), reported in development builds -->
<li class="current">1</li>
<li class="pagination-previous disabled">Previous</li>
```

Neither directive causes a `jsaction` attribute: they declare no listeners. `RouterLink` declares its own on routed links, and a button pager's `(click)` handlers are the consumer's.

### Animation

None. Foundation's pagination partial declares no transition or animation, and the directives insert, remove, or animate nothing, so ADR 0003's mechanics have nothing to govern, no `animate.enter` or `animate.leave` is used, and there is no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every Pagination class, the ellipsis's `aria-hidden`, and the consumer's `aria-current`, `aria-disabled`, `role`, and `disabled` exactly as the hydrated DOM does (rule 1). Foundation's CSS and the `nfs-pagination` rules style the first paint.
- Before hydration: construction reads nothing and touches no DOM outside static host bindings (rules 3 to 5). The development checks run in render callbacks, which never run on the server.
- Full hydration: host values equal the server's, so hydration changes nothing; there is no structure of the library's to mismatch and no `ngSkipHydration` (rule 10). A current page bound from state must have the same value at the first client render as on the server: the page number from the route's query parameter or path in a routed component does; a value that only arrives after the first client render (a response the server did not have) would move `aria-current` at hydration.
- Router: `RouterLinkActive` writes `aria-current` on the server once the navigation has run and does nothing on the client until the initial navigation has completed, so the server's attribute survives hydration (the [Spec: Menu](../issues/85-spec-menu.md)'s reading of the Router's source). It matches paths; for pages in a query parameter the recipe binds `[attr.aria-current]` from the page state instead, because `routerLinkActiveOptions` would have to match every other query parameter too.
- Incremental hydration: the directives register nothing, so a pagination needs no hydration boundary of its own. A button pager's buttons and the results they change belong to one Hydration boundary (building-blocks 1.11 decision 6).
- Event replay: the directives declare no listeners, so they add nothing to queue or replay, and they never cause Angular's dispatcher to cancel a plain link's native navigation inside a dehydrated block. A `hydrate on interaction` block whose root node is a link would be cancelled; the pagination's root is its `nav`, never a link.
- `@defer`: library templates contain no `@defer`. The entry point is separate, so a consumer can defer the pagination. Inside a dehydrated block it is its server HTML and its plain links navigate; routed links hydrate the block and replay through `RouterLink`. Inside `@defer (hydrate never)` it keeps Foundation's look and its plain links navigate; a button pager does nothing there.
- Prerendering: identical to server rendering; nothing reads a request token (rule 11). A prerendered page of results carries its current page like any server render.
- Zoneless: no zone is used; there is no state.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes on the list and items, the roles, the names, which link is current and which is disabled, the computed looks and their contrast, focus after a page change, box sizes, and what the server HTML contains. No test reads a directive's fields. Prior art: the [Spec: Menu](../issues/85-spec-menu.md) layers (a listener-free class directive, the current page from `aria-current` styled by a Library mixin), the [Spec: Button](../issues/37-spec-button.md)'s disabled-link cases, and the [Spec: Badge](../issues/93-spec-badge.md)'s Sass compile cases.

Story ids follow `pagination--<story>`, `meta.id: 'pagination'`, title `CSS-only components/Pagination`: `pagination--basic`, `pagination--last-page`, `pagination--centered`, `pagination--buttons`, and `pagination--rtl`. Every pagination in a story sits in a named `nav`. The stories use Foundation's default settings; the preview includes `nfs-pagination`. No Anti-pattern story.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six WCAG 2.2 AA tags (ADR 0018), under the Storybook preview stylesheet with `@include nfs-pagination;` after `foundation-everything`. No story element carries a Foundation class written in the story.

- `pagination--basic`: Foundation's Basics as the recipe (page 1 of 13, a disabled Previous, an ellipsis). The list is found by `getByRole('list')` inside `getByRole('navigation', {name: 'Pagination'})` and has `.pagination`; `getAllByRole('listitem')` counts 8 (the ellipsis is hidden); `getByRole('link', {current: 'page'})` is "Page 1", its computed background equals `$pagination-item-background-current` and its colour `$pagination-item-color-current`, and the ratios computed from computed styles are at least 4.5:1 (text on fill) and 3:1 (fill against the page); `getByRole('link', {name: 'Previous page'})` has `aria-disabled="true"`, no `href`, and the computed colour `$pagination-item-color-disabled`; the first Tab lands on "Page 1" and the last on "Next page"; the ellipsis item has `.ellipsis` and `aria-hidden="true"`; the Previous and Next items have their classes.
- `pagination--last-page`: page 13 current; "Next page" is the disabled placeholder link and "Previous page" an enabled link; Tab skips Next.
- `pagination--centered`: Foundation's Centered example with the Typography Helpers' `nfsTextAlign="center"` on the list; the items are centred (computed geometry: equal space on both sides within the list's content box).
- `pagination--buttons`: a button pager over a signal (page 1 of 3) with a results heading. Clicking "Page 2" moves `aria-current` to it and removes it from "Page 1"; focus moves to the results heading (`tabindex="-1"`); on page 3 "Next page" is `disabled` and its computed colour is the disabled one; every button box is at least 24 by 24 px.
- `pagination--rtl`: under `dir="rtl"` the first item is the rightmost; no class changes with direction.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs in `<name>.spec.ts` next to the directives, over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings: each directive's class; `aria-hidden="true"` on the ellipsis; no other attribute on any host; the consumer's own classes and attributes stay.
- Development checks, one case each: a pagination outside any `nav`, and inside an unnamed `nav`, warns once; inside `nav aria-label` and `nav aria-labelledby` it is silent; `li.current` and `li.disabled` warn naming `aria-current` and the placeholder link; `li.ellipsis` without the directive warns naming `nfsPaginationEllipsis`, and `li[nfsPaginationEllipsis] class="ellipsis"` does not warn; `aria-current="page"` on an `li` or `span` warns and on an `a` or `button` does not, and `aria-current="false"` warns nowhere; an `a` with `aria-disabled="true"` and `href` warns, one without `role="link"` warns, one with neither `href` nor `aria-disabled` warns, and a correct placeholder link does not; a current link with a transparent background (no `nfs-pagination` in the test stylesheet) warns once naming the include, and with the include's rule in the test stylesheet does not; items rendered after the first render (a signal set after `whenStable()`) are checked once they exist; an item directive outside `nfsPagination` warns once; correct markup warns nothing; nothing is warned when `ngDevMode` is false.
- Router: with `provideRouter` and `RouterTestingHarness`, navigating to `/results?page=3` renders the recipe's component with "Page 3" current and "Previous page" enabled; navigating to `?page=1` moves `aria-current` to "Page 1" and makes Previous the placeholder link.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture with each Rendered HTML example, through the shared `renderServer()` helper in `<name>.ssr.spec.ts` under `npx nx test <lib>`, with `provideRouter` and the URL `/results?page=1`. Assert `whenStable()` resolves; the HTML matches the Rendered HTML section: `pagination`, `pagination-previous`, `pagination-next`, and `ellipsis` with `aria-hidden="true"`; `aria-current="page"` on "Page 1" only; the placeholder link with `role="link"` and `aria-disabled="true"` and no `href`; no `jsaction` on any list, item, or plain link; no `role` attribute on the list; no development warning logged.
- Sass compile (the library's node-level Sass test), over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';`:
  - Foundation's defaults plus `@include nfs-pagination;` after `foundation-pagination` compile and emit exactly the rules of the Sass subsection.
  - Each of these stops the compile with one `@error` naming the setting, the pair, and the ratio: `$pagination-item-background-current: #8a8a8a` (text 3.422:1); `$pagination-item-background-current: #f0f0f0; $pagination-item-color-current: $black` (fill 1.129:1); `$pagination-item-color: #777777` (4.44:1 on the page, 3.588:1 on hover, and 2.732:1 from the disabled colour, all three in one message); `$pagination-item-background-hover: #767676` (4.358:1); `$pagination-item-color-disabled: #555555` (2.655:1); `$pagination-ellipsis-color: #999999` (2.824:1); `$pagination-item-background-current: #1177dd; $pagination-item-color-current: $black` (4.437:1, where Foundation's `color-luminance()` gives 4.505:1).
  - `$pagination-item-background-current: #1b7ac2` compiles (4.517:1 exactly, where Foundation's `color-luminance()` gives 4.469:1); with the case above it pins the exact helper in both directions.
  - `$pagination-mobile-current-item: true` compiles with one `@warn` naming the setting; with `$pagination-mobile-items: true` as well there is no warning.
- Pure logic: none worth isolating.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Only what needs a real engine, a real pointer, or the fixture app. Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Target size (2.5.8): every link and button border box in `pagination--basic` and `pagination--buttons` is at least 24 by 24 px.
- Hover (a real pointer, which CSS `:hover` needs): over the current link its background stays `$pagination-item-background-current`; over the disabled link it stays transparent; over another link it is `$pagination-item-background-hover`.
- Focus visible (2.4.7): a screenshot comparison before and after Tab to the current link in `pagination--basic` shows a focus indicator over the fill.
- Reflow (1.4.10): at a 320 px viewport, `pagination--basic` shows only Previous and Next and causes no horizontal scroll.

Against the prerendered fixture app, one route with the recipe's routed pagination and one pagination inside `@defer (hydrate never)`:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; the current link is filled and carries `aria-current`, and the disabled Previous has the disabled look.
- Hydration: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`; `aria-current` is on the same link in the server HTML, after hydration, and after the initial navigation.
- `hydrate never`: the block's links navigate and keep Foundation's look.

Manual release test (ADR 0022): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, `pagination--basic` announces the landmark "Pagination", "Page 1" as the current page, and "Previous page" as an unavailable (dimmed) link, and skips the ellipsis. Chromium's CDP accessibility tree does not list `aria-current` among its properties, so the automated layers assert it through the DOM and Playwright's role query.

## Out of Scope

- A component or helper that renders the items from a current page and a page count, or computes which pages to show around the ellipsis: Foundation's Pagination is markup the author writes and generates nothing (ADR 0001), and the page window is application logic; a pure helper is additive later. Category: `scope-boundary`.
- Material's page size select, range label, and first and last buttons: not part of Foundation's Pagination; a consumer adds first and last items as links. Category: `scope-boundary`.
- Honouring `$pagination-mobile-current-item`: its rule selects `li.current`, and the current page's item carries no class; reaching the item from its link's `aria-current` needs `:has()`, outside the Browser target (D9). Category: `platform-or-a11y`.
- Previous and next arrows on `<button>` items: Foundation draws them on links and on its disabled text item only; restating its arrow rule for buttons would copy a Foundation rule and its literal margin into the library (ADR 0012), and a button pager reads the same without them. Category: `other`.
- A forced-colours look for the current page: Foundation's fill disappears under forced colours, as the Menu's does; the state stays exposed as `aria-current`, and WCAG 2.2 AA does not require a forced-colours look. Additive later. Category: `platform-or-a11y`.
- Moving focus to the new results after an in-place page change: the application owns the results and their heading; the spec states the requirement and the recipes show it (D12). Category: `scope-boundary`.
- The text-alignment directive for `.text-center` and the screen-reader-only directive for `.show-for-sr`: the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md) and the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). Category: `scope-boundary`.
- The Breadcrumbs component, which shares the `nav > ul` shape: the [Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Four listener-free attribute directives in `ngx-foundation-sites/pagination`: `ul[nfsPagination]`, `li[nfsPaginationPrevious]`, `li[nfsPaginationNext]`, `li[nfsPaginationEllipsis]`; no component; no inputs, models, outputs, methods, tokens, or Defaults token | One directive per Structural class (ADR 0039); Foundation generates nothing (ADR 0001); Pagination has no Options and no Variant class; the Menu and Badge precedents | A pagination component rendering items from `page` and `pageCount` inputs (generated structure Foundation does not have, and the markup the consumer writes is the contract) (`scope-boundary`); one directive on the `ul` that finds and classes its first, last, and empty items (a `Renderer2` write per item after hydration, absent from server HTML, building-blocks 1.5) (`jquery-or-dom-plumbing`) |
| D2 | `.ellipsis` is bound by `NfsPaginationEllipsis`, not `NfsEllipsis` | Foundation styles the unprefixed class only under `.pagination`, and a bare `nfsEllipsis` reads as a text-truncation utility; the directive takes its component's name, and building-blocks 1.3 gains the rule | `NfsEllipsis` by the letter of building-blocks 1.3 (a utility-sounding name for a Pagination-only element) (`other`) |
| D3 | No directive on page items, links, or buttons | A page item has no Structural class; its states are ARIA attributes the consumer or the Router already writes (ADR 0042's reasoning) | An item or link directive with `current` and `disabled` inputs binding the classes and ARIA (a directive on every item for states the attributes already hold; `aria-disabled` is deprecated on `listitem` in WAI-ARIA 1.2, so an item directive could not expose the disabled state at all) (`platform-or-a11y`); a `type`-defaulting directive on page buttons (a directive with no Structural class for one attribute the recipe writes) (`other`) |
| D4 | The current page is `aria-current` on its link or button, which keeps its `href`; `nfs-pagination` styles it with Foundation's `pagination-item-current` at `.pagination a[aria-current]` specificity (0,2,1), after Foundation's rules; `.current` is never bound | One source for the announcement and the look (1.3.1 by construction), as ADR 0042 decided for menus and the Breadcrumb APG pattern does; the current page keeps its place among the links for Tab and for a screen reader's links list; the Router writes it for path pages; measured in three engines: the rule draws Foundation's current look and keeps it on hover, since it follows Foundation's `.pagination a:hover` at equal specificity | Foundation's `li.current` text with `aria-current` on the `li` (a `current` input on an item directive: a directive on every item, and the current page leaves the links, so a keyboard or links-list user never meets it) (`platform-or-a11y`); `li.current` bound from an input and the link left unmarked (a visual-only state, 1.3.1) (`platform-or-a11y`) |
| D5 | A disabled item is a placeholder link (no `href`, `role="link"`, `aria-disabled="true"`), ADR 0011's disabled link, or a natively disabled button; `nfs-pagination` styles `a[aria-disabled='true']` and `button:disabled` with Foundation's `pagination-item-disabled`; `.disabled` is never bound; leaving the item out is also supported | Foundation's disabled text item is plain text at 1.6252:1, which 1.4.3 does not exempt and axe fails (1.62, three engines); as an inactive control the text is exempt and axe skips it; Chromium exposes it as a disabled link, not focusable (measured); Foundation's arrow still draws, from its `a::before` rule | Foundation's `li.disabled` text, bound from a `disabled` input on `NfsPaginationPrevious` and `NfsPaginationNext` (plain text with no state: `aria-disabled` is deprecated on `listitem`, and the 1.6252:1 text would need a required setting of 4.5:1, a disabled look barely lighter than enabled text) (`platform-or-a11y`); Material's `disabledInteractive` with `tabindex="-1"` (a focusable control whose only action is unavailable; D12 keeps focus instead) (`platform-or-a11y`) |
| D6 | `NfsPaginationEllipsis` binds `aria-hidden="true"` | Foundation's first example hides it; the page links' names already tell which pages are shown; the generated glyph otherwise reads as punctuation; measured, the list then counts only followable items | Announcing the gap with hidden text ("pages 5 to 11") (the names already imply it, and the text would need the consumer's numbers) (`other`) |
| D7 | Recipes name page links "Page N" and Previous and Next "Previous page" and "Next page" through `aria-label`, Foundation's docs form; not checked | Foundation's arrows are generated content inside the links and join the name from content ("Next page" followed by the arrow character (U+00BB), measured in Chromium), so the label is the one form that names Previous and Next cleanly within the Browser target (CSS alternative text is not in it); the same form for page links keeps one recipe; WCAG 2.4.4 accepts a bare number in the context of the list, so a check would warn on passing markup, as the Badge's D6 found | Visually hidden text through the Visibility Classes directive (leaves the arrow in the Previous and Next names) (`platform-or-a11y`); a development check for digit-only names (warns on markup that passes 2.4.4) (`other`) |
| D8 | `nfs-pagination`: the current and disabled rules (D4, D5), a 24 px floor on `.pagination a, .pagination button` with centred text, and compile-time `@error` checks (item text on the page and on hover, current text on its fill, the ellipsis at 4.5:1; the current fill against the page and the disabled against the enabled text colour at 3:1), all with the exact formula | ADR 0022 and building-blocks 1.10; button items are 20 px tall (Foundation's `line-height: 1` reset, three engines) and pass axe only through the spacing exception; the floor meets 2.5.8 by size and changes nothing for links at Foundation's defaults (27.80 by 28.39 px); axe cannot see hover states or the state pairs | A compile-time `@error` on link height (misses buttons, whose height comes from Foundation's reset) (`other`); `@warn` for the pairs (a consumer on changed settings would ship failing text axe cannot see) (`platform-or-a11y`) |
| D9 | `$pagination-mobile-current-item` has no effect on the library's markup; `nfs-pagination` warns at compile time when it is `true` while `$pagination-mobile-items` is `false` | Foundation's rule selects `li.current`, which the current page's item no longer carries; reaching the item from its link needs `:has()`, outside the Browser target; the setting is off by default | Binding `.current` on the current page's item for this setting (a directive on every item, and Foundation's `.pagination .current` would also paint the item under the link) (`platform-or-a11y`); a `:has()` rule (building-blocks 1.2) (`platform-or-a11y`) |
| D10 | Centring is the Typography Helpers' text-alignment directive on the `ul`; Pagination has no alignment input | Foundation's "Centered" example uses the generic `.text-center`; Pagination has no alignment class of its own | An `align` Variant input on `NfsPagination` (a second owner of a Typography Helpers class, which ADR 0039 gives that family's directive) (`other`) |
| D11 | The development checks run once, at the first render at which the host holds an item, from a self-destroying `afterEveryRender` in development builds only | Pages commonly arrive from data after the first render; one read of the host's items then costs nothing further, and production bundles carry none of it | A check at the first render only (misses asynchronous pages, the common case) (`other`); a `MutationObserver` (re-checks every change for a development warning) (`other`) |
| D12 | After an in-place page change the application moves focus to the start of the new results; the library states it, and the button story asserts it | A focused Next that the last page disables, or an item an `@if` replaces, otherwise drops focus to the page body (the problem Material's paginator comment names); only the application knows where the results are; a full page load resets focus by itself | A focusable disabled item (`tabindex="-1"` with `aria-disabled`, Material's shape) (keeps focus on a control with no action, and a link cannot be both a placeholder and focusable without another attribute to manage) (`platform-or-a11y`) |
| D13 | Development checks for the landmark, copied classes, `aria-current` placement, the disabled contract, and the missing include, and an outside-the-pagination check on each item directive | ADR 0039 has each directive own the checks its documented markup lacks; the landmark is Foundation's own requirement and WebKit's list semantics depend on it; copied `current` and `disabled` classes draw states no ARIA backs; a missing include leaves the current page invisible, which no Runtime check can see because Pagination has no Variant property (a computed transparent background is conclusive, measured) | A presence property for `strictVariantProperties` (ADR 0040's dated note does not adopt one) (`other`); no include check, as the Menu has none (the current page would be invisible to sighted users with nothing reported) (`platform-or-a11y`) |
| D14 | Native implementation level; no Aria, no CDK; listener-free | Lists, links, buttons, `aria-current`, and the placeholder link cover everything; host bindings render on the server; Aria has no pagination pattern and its toolbar's roving tab stop is not asked for in navigation (ADR 0004) | Aria's toolbar (one tab stop for the whole pagination) (`platform-or-a11y`) |

### Usage examples

```ts
@Component({
  selector: 'app-results-pagination',
  imports: [NfsPagination, NfsPaginationPrevious, NfsPaginationNext, NfsPaginationEllipsis, RouterLink],
  template: `
    <nav aria-label="Pagination">
      <ul nfsPagination>
        <li nfsPaginationPrevious>
          @if (page() > 1) {
            <a [routerLink]="[]" [queryParams]="{page: page() - 1}" queryParamsHandling="merge" aria-label="Previous page">Previous</a>
          } @else {
            <a role="link" aria-disabled="true" aria-label="Previous page">Previous</a>
          }
        </li>
        @for (item of items(); track $index) {
          @if (item === 'gap') {
            <li nfsPaginationEllipsis></li>
          } @else {
            <li>
              <a [routerLink]="[]" [queryParams]="{page: item}" queryParamsHandling="merge"
                 [attr.aria-current]="item === page() ? 'page' : null" [attr.aria-label]="'Page ' + item">{{ item }}</a>
            </li>
          }
        }
        <li nfsPaginationNext>
          @if (page() < pageCount()) {
            <a [routerLink]="[]" [queryParams]="{page: page() + 1}" queryParamsHandling="merge" aria-label="Next page">Next</a>
          } @else {
            <a role="link" aria-disabled="true" aria-label="Next page">Next</a>
          }
        </li>
      </ul>
    </nav>
  `,
})
export class ResultsPagination {
  // Bound by the routed results page from its `page` query parameter, so the server and the first client
  // render agree on the current page.
  readonly page = input.required<number>();
  readonly pageCount = input.required<number>();
  // The application's own page window, for example [1, 2, 3, 4, 'gap', 12, 13].
  protected readonly items = computed(() => pageWindow(this.page(), this.pageCount()));
}
```

A button pager that updates in place moves focus to its results (D12):

```ts
@Component({
  selector: 'app-invoice-pager',
  imports: [NfsPagination, NfsPaginationPrevious, NfsPaginationNext],
  template: `
    <h2 #results tabindex="-1">Invoices, page {{ page() }} of {{ pageCount }}</h2>
    <!-- the invoice rows of page() -->
    <nav aria-label="Invoice pages">
      <ul nfsPagination>
        <li nfsPaginationPrevious>
          <button type="button" aria-label="Previous page" [disabled]="page() === 1" (click)="go(page() - 1)">Previous</button>
        </li>
        @for (n of pages; track n) {
          <li>
            <button type="button" [attr.aria-current]="n === page() ? 'page' : null" [attr.aria-label]="'Page ' + n" (click)="go(n)">{{ n }}</button>
          </li>
        }
        <li nfsPaginationNext>
          <button type="button" aria-label="Next page" [disabled]="page() === pageCount" (click)="go(page() + 1)">Next</button>
        </li>
      </ul>
    </nav>
  `,
})
export class InvoicePager {
  protected readonly pageCount = 3;
  protected readonly pages = [1, 2, 3];
  protected readonly page = signal(1);
  private readonly results = viewChild.required<ElementRef<HTMLElement>>('results');

  protected go(n: number): void {
    this.page.set(n);
    this.results().nativeElement.focus();
  }
}
```

```html
<!-- Foundation's docs markup and its library form -->
<li class="current"><span class="show-for-sr">You're on page</span> 1</li>
<li><a href="/results?page=1" aria-current="page" aria-label="Page 1">1</a></li>

<li class="pagination-previous disabled">Previous <span class="show-for-sr">page</span></li>
<li nfsPaginationPrevious><a role="link" aria-disabled="true" aria-label="Previous page">Previous</a></li>

<li class="ellipsis" aria-hidden="true"></li>
<li nfsPaginationEllipsis></li>
```

Where each page is a path, the Router marks the current page: `<a routerLink="/results/3" routerLinkActive ariaCurrentWhenActive="page" aria-label="Page 3">3</a>`.

### Platform features to adopt when the browser target moves

- `:has()`: `nfs-pagination` could honour `$pagination-mobile-current-item` with `.pagination li:has(> [aria-current])` (D9).
- CSS alternative text for generated content (`content: '\00AB' / ''`): Foundation's arrows would leave the names, so Previous and Next could be named by their visible text and visually hidden text, without `aria-label` (D7).

### Foundation behaviour changed or dropped

- Current page: Foundation's `li.current` text becomes a link (or button) with `aria-current`, styled with Foundation's own `pagination-item-current` (D4); the "You're on page" hidden text goes, because `aria-current` is announced.
- Disabled item: Foundation's `li.disabled` text becomes a placeholder link with `role="link"` and `aria-disabled="true"`, or a disabled button, styled with Foundation's own `pagination-item-disabled` (D5).
- Copied `current` and `disabled` classes are not stripped (no directive binds them) and are reported in development builds (D13).
- `$pagination-mobile-current-item` has no effect, with a compile-time warning (D9).
- Links and buttons get a 24 px floor; button items grow from 20 px to 24 px tall (D8).
- `.text-center` is the Typography Helpers directive's (D10).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. Pagination relies on Foundation's export mixin `foundation-pagination` (in `foundation-everything`). Its documented custom CSS is the `nfs-pagination` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-pagination`.

(1) Rules:

| # | Selector | Declarations | Reason |
| --- | --- | --- | --- |
| 1 | `.pagination a[aria-current]:where(:not([aria-current='false']):not([aria-current=''])), .pagination button[aria-current]:where(:not([aria-current='false']):not([aria-current='']))` | `@include pagination-item-current;` (`padding: $pagination-item-padding`, `background: $pagination-item-background-current`, `color: $pagination-item-color-current`, `cursor: default`) | Foundation keys the current look on `.current`, a class the consumer no longer writes and that says nothing to assistive technology; the rule gives the current link or button that look from its ARIA state, at specificity (0,2,1), after Foundation's `.pagination a` and `.pagination a:hover`, so it also keeps the fill on hover (measured in three engines) |
| 2 | `.pagination a[aria-disabled='true'], .pagination button:disabled` | `@include pagination-item-disabled;` (`padding`, `color: $pagination-item-color-disabled`, `cursor: not-allowed`, and `background: transparent` on hover) | Foundation keys the disabled look on `.disabled` text, which is not an inactive control (1.4.3 applies and axe fails it); the rule gives the disabled link or button that look, and the mixin's `:hover` rule at (0,3,1) keeps it transparent over Foundation's hover background (measured) |
| 3 | `.pagination a, .pagination button` | `min-width: 24px; min-height: 24px; text-align: center` | WCAG 2.2 2.5.8 by size: Foundation's `button` reset sets `line-height: 1`, so button items are 20 px tall, and a consumer's smaller `$pagination-item-padding` or `$pagination-font-size` can shrink links; the centring keeps a floored one-digit item's number in the middle; Foundation has no minimum-size setting |

Checks (no CSS output), one `@error` listing every failing pair with its setting, its criterion, and its exact unrounded ratio from the library's helper (a translucent colour composited over `$body-background` first): `$pagination-item-color` on `$body-background` and on `$pagination-item-background-hover`, `$pagination-item-color-current` on `$pagination-item-background-current`, and `$pagination-ellipsis-color` on `$body-background` under 4.5:1 (1.4.3); `$pagination-item-background-current` against `$body-background`, and `$pagination-item-color-disabled` against `$pagination-item-color`, under 3:1 (1.4.1). Over Foundation 6.9.0's defaults: 19.6304, 15.8630, 4.6473, and 19.6304:1; 4.6473 and 12.0791:1. One `@warn` when `$pagination-mobile-current-item` is `true` and `$pagination-mobile-items` is `false` (D9).

(2) Reused settings, mixins, and functions: `$pagination-item-color`, `$pagination-item-background-hover`, `$pagination-item-background-current`, `$pagination-item-color-current`, `$pagination-item-color-disabled`, `$pagination-ellipsis-color`, `$pagination-mobile-items`, `$pagination-mobile-current-item`, `$body-background`, `pagination-item-current`, and `pagination-item-disabled`, all read from the consumer's compile; no mixin parameter. 24 px, 4.5, and 3 are WCAG's numbers.

(3) Custom properties: none.

(4) Motion classes: none, and no `prefers-reduced-motion` override; Pagination adds and awaits no animation.

(5) What breaks when the include is missing: the current page has no look at all (Foundation styles only `.current`), a disabled item looks enabled, button items stay 20 px tall, and the compile-time checks do not run; development check 5 reports the first.

(6) Variant properties: none. Pagination has no Variant class.

### Notes

- RTL: Foundation compiles the item spacing and arrow margins against `$global-right` and `$global-left`; its arrow characters do not mirror. The directives have nothing direction-dependent.
- Small screens: on Foundation's default `$pagination-mobile-items: false`, only the first and last items show below `medium`, which is why `nfsPaginationPrevious` and `nfsPaginationNext` go on those items; a pagination without a Previous item on the first page shows its first page link there instead.
- Two paginations of the same results (above and below a list) are two landmarks; each takes its own name.
- Measured facts in this spec come from this spec's ticket; the probe files stayed outside the repository.
