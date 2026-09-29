# 87. Spec: Pagination

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Pagination to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/pagination.md` and its Sass is `scss/components/_pagination.scss` in the 6.9.0 clone. Publish `specs/pagination.md`.

Known from the triage: Current page and disabled items (`.current`, `.disabled`, `.ellipsis`) become inputs or bindings; `aria-current`, a named `nav`, and hidden ellipsis items.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Resolved 2026-09-28, AFK under the map's override: self-grilled on both sides against Foundation 6.9.0's pagination docs page and Sass (and its `_global.scss` button reset), the breadcrumbs docs page and Sass (for the parallel), the Angular Material 22.2.x paginator source, ADR 0039, ADR 0040, ADR 0042, ADR 0011, building-blocks 1.3, 1.4, 1.10, 1.13, and 1.14, the [Spec: Menu](85-spec-menu.md) and its ticket, the [Spec: Badge](93-spec-badge.md), and the triage and catalogue rows for Pagination, with five measured probes. Spec: [specs/pagination.md](../specs/pagination.md).

### Grilling record

Round 1 (prerequisites settled by ADR 0039, ADR 0040, and ADR 0042):
- Q1. Which Structural classes, and which directives bind them? `.pagination` (`ul[nfsPagination]`), `.pagination-previous` and `.pagination-next` (`li[nfsPaginationPrevious]`, `li[nfsPaginationNext]`), and `.ellipsis` (`li[nfsPaginationEllipsis]`). `.current` and `.disabled` are State classes; `.text-center` is a Typography Helpers class.
- Q2. Component or directives? Directives: Foundation generates nothing (ADR 0001). A component that renders the items from a page and a page count, and a page-window helper, are out of scope: the markup is the author's and the window is application logic.
- Q3. Implementation level? Native platform. Aria has no pagination pattern, and its toolbar's roving tab stop is not asked for in navigation (ADR 0004); CDK has nothing to do.
- Q4. How is the current page marked without a consumer-written `.current`? Options argued: (a) a `current` input on an item directive binding `.current` and `aria-current` on Foundation's text `li`; (b) a link directive with a `current` input; (c) `routerLinkActive` naming a class (forbidden by ADR 0039); (d) `aria-current` on the page's link or button, styled by `nfs-pagination` through Foundation's `pagination-item-current`. For (a): Foundation's markup, and `$pagination-mobile-current-item` keeps working. Against (a): a directive on every item, and the current page leaves the links, so a keyboard or links-list user never meets it. Settled: (d), ADR 0042's reasoning applied to Pagination; the one loss is `$pagination-mobile-current-item` (Q10).
- Q5. How is a disabled item marked without `.disabled`? Options: (a) a `disabled` input on the previous and next directives binding `.disabled` over Foundation's text item; (b) a link directive owning `role`, `aria-disabled`, and `tabindex`; (c) the placeholder link of ADR 0011 or a natively disabled button, styled by `nfs-pagination` through Foundation's `pagination-item-disabled`; (d) leaving the item out. Against (a): `aria-disabled` is deprecated on `listitem` in WAI-ARIA 1.2, so a text item has no disabled state to expose, and as text it is not an inactive control, so its `#cacaca` must reach 4.5:1 and reaches 1.6252:1 (axe fails it in three engines, Probe 2). Against (b): a directive with no Structural class for attributes each branch writes statically. Settled: (c), with (d) supported.
- Q6. Variant inputs? None: Foundation's Pagination has no Variant class. Centring is the Typography Helpers directive (placeholder `nfsTextAlign`, the Forms spec's).
- Q7. The ellipsis? `NfsPaginationEllipsis` binds `.ellipsis` and `aria-hidden="true"` (Foundation's first example; the page names already tell which pages are shown; Probe 3 counts 8 list items of 9). Named `NfsPaginationEllipsis`, not `NfsEllipsis`: the unprefixed class is styled only under `.pagination`, and a bare name reads as a text-truncation utility; building-blocks 1.3 gains the rule.

Round 2:
- Q8. How are the links named? Foundation's `aria-label`s ("Page 2", "Previous page", "Next page"). Visually hidden text was argued for (translation tools), but Foundation's arrows are generated content inside the links and join the name from content ("Next page" followed by U+00BB, Probe 3), and CSS alternative text is outside the Browser target; one form for every link. A development check for digit-only names was rejected: WCAG 2.4.4 accepts a bare number in the context of its list, as the Badge's D6 found.
- Q9. Buttons? Supported, since Foundation's Sass styles `a, button`: `aria-current` and native `disabled` take the same looks. Foundation's reset makes button items 20 px tall in three engines (Probe 2), which axe passes only through the spacing exception, so `nfs-pagination` sets a 24 px floor on links and buttons (building-blocks 1.10: met by size); links at Foundation's defaults are 27.80 by 28.39 px, so the floor changes nothing there. Foundation draws no previous and next arrows on buttons; restating its rule would copy it (ADR 0012), so none are added.
- Q10. `$pagination-mobile-current-item`? It selects `li.current`, which the current page's item no longer carries; reaching the item from its link needs `:has()`, outside the Browser target. Settled: no effect, a compile-time `@warn`, and `:has()` listed for the target move.
- Q11. The landmark? The consumer's `<nav aria-label="Pagination">`, checked in development (missing or unnamed); two paginations of the same results take distinct names, because axe's `landmark-unique` (in the gate's `best-practice` tag) reports identical ones.
- Q12. Compile-time checks? With the exact formula: item text on the page and on the hover background, current text on its fill, and the ellipsis at 4.5:1 (1.4.3); the current fill against the page and the disabled against the enabled text colour at 3:1 (1.4.1). No setting is required on Foundation's defaults (Probe 1).
- Q13. Development checks and their timing? Landmark, copied classes (`current`, `disabled`, and the Structural classes on items without their directive), `aria-current` on something that is not a link or button, the disabled-link contract (ADR 0011's two mistakes plus a missing `role="link"`), and the missing include; from a self-destroying `afterEveryRender` in development builds only, run at the first render at which the host holds an item, because pages usually arrive from data. The item directives warn outside a pagination.
- Q14. How is a missing `nfs-pagination` reported? No Runtime check can see it (no Variant property; ADR 0040's note does not adopt a presence property). A transparent computed background on the current link is conclusive, because Foundation gives resting links none and the mixin's 1.4.1 check rejects a transparent fill (Probe 2: `rgba(0, 0, 0, 0)` without the include in three engines).
- Q15. Focus after a page change? A full page load resets it. Where the pagination stays mounted (a routed query parameter, a button pager), the application moves focus to the new results, because a focused Next that the last page disables, or an item an `@if` replaces, otherwise drops it to the body (the problem Material's paginator comment names; Material keeps a focusable disabled button with `tabindex="-1"`, rejected here for a control with no action).

Round 3:
- Q16. Rendering modes? Static host bindings only; the current page is bound from state that the server and the first client render share (the route's page), or written by `RouterLinkActive` for path pages; no listeners, nothing replays; `hydrate never` keeps the look and working plain links.
- Q17. Tokens? None: the item directives look `NfsPagination` up by class in development builds only (the `NfsMenuText` shape).
- Q18. Tests? The four layers; e2e only for real-pointer hover, target size, the focus ring over the fill, reflow at 320 px, and the fixture app.
- Q19. ADR? No new record: extending ADR 0042 to Pagination and its disabled items is the same trade-off applied again, so it is a dated consequence on ADR 0042 (and one on ADR 0011), not a new decision.
- Q20. Breadcrumbs parallel? The shared parts are listed under "What other specs need".

The frontier is empty; nothing is left `OPEN FOR HUMAN`.

### Decisions

1. Four listener-free attribute directives in `ngx-foundation-sites/pagination`: `NfsPagination` (`ul[nfsPagination]`, `.pagination`), `NfsPaginationPrevious` (`li[nfsPaginationPrevious]`, `.pagination-previous`), `NfsPaginationNext` (`li[nfsPaginationNext]`, `.pagination-next`), and `NfsPaginationEllipsis` (`li[nfsPaginationEllipsis]`, `.ellipsis` and `aria-hidden="true"`). No inputs, models, outputs, methods, `exportAs`, tokens, providers, or Defaults token; no directive on page items, links, or buttons. Implementation level native platform.
2. No Variant input, registry, or Variant property: Pagination has no Variant class. `.text-center` is the Typography Helpers directive (`nfsTextAlign` placeholder).
3. The current page is `aria-current` on its link (or a pager's button), which keeps its `href`; `.current` is never bound. `nfs-pagination` styles `.pagination a[aria-current]:where(:not([aria-current='false']):not([aria-current='']))` and the `button` form with Foundation's `pagination-item-current`, at (0,2,1) after Foundation's rules, so the fill holds on hover (measured).
4. A disabled item is a placeholder link (no `href`, `role="link"`, `aria-disabled="true"`, ADR 0011) or a natively disabled button; `.disabled` is never bound. `nfs-pagination` styles `.pagination a[aria-disabled='true'], .pagination button:disabled` with Foundation's `pagination-item-disabled`. Leaving the item out is also supported.
5. Recipes name links through `aria-label` ("Page N", "Previous page", "Next page"), Foundation's docs form; no name check.
6. `nfs-pagination` also sets `min-width: 24px; min-height: 24px; text-align: center` on `.pagination a, .pagination button` (2.5.8), and stops the compile with one `@error` (exact formula, unrounded) when item text on the page or on the hover background, the current text on its fill, or the ellipsis on the page is under 4.5:1, or the current fill against the page or the disabled against the enabled text colour is under 3:1; it warns when `$pagination-mobile-current-item` is on while `$pagination-mobile-items` is off, a setting with no effect on the library's markup. No required setting on Foundation's defaults; no Storybook settings override.
7. Development checks (client, development builds only, once each, at the first render at which the host holds an item): an unnamed or missing navigation landmark; copied `current`, `disabled`, `ellipsis`, `pagination-previous`, or `pagination-next` classes on items; `aria-current` on anything but a link or button; a disabled link that keeps its `href`, one without `role="link"`, and a link with neither `href` nor `aria-disabled`; a current link with a transparent background (missing include). Each item directive warns outside `nfsPagination`. No Runtime check.
8. After an in-place page change the application moves focus to the new results; the spec states it and the button story asserts it.
9. Rendering modes: static host bindings; the server HTML is final; nothing replays; no Hydration boundary of its own; `hydrate never` keeps the look and working plain links; the current page's state must be the same on the server and at the first client render.
10. Out of scope, each with a category in the spec: a page-window component or helper, Material's page size, range label, and first and last buttons, `$pagination-mobile-current-item`'s effect, arrows on button items, a forced-colours current look, the focus move itself, the Typography Helpers and Visibility Classes directives, Breadcrumbs, and runtime theming.

### Measurements

Five probes ran under `D:/tmp/nfs-wave-87/` (not committed), over the Foundation 6.9.0 clone's `scss` with Dart Sass 1.104.1, Playwright 1.63, and axe-core 4.13.0 from `D:/tmp/nfs-ct-prototype`'s install, read in place (no junction). Nothing was left running.

- Probe 1, `compile.mjs`: a draft `nfs-pagination` after `foundation-pagination`. Defaults compile and emit the three rule groups; exact ratios: item text 19.6304:1, on hover 15.8630:1, current text and fill 4.6473:1, ellipsis 19.6304:1, disabled against enabled text 12.0791:1, disabled on the page 1.6252:1. Failing settings stop the compile naming the pair: `#8a8a8a` fill 3.422:1; `#f0f0f0` fill with `$black` text 1.129:1; `$pagination-item-color: #777777` 4.44, 3.588 (hover), and 2.732:1 (disabled); hover `#767676` 4.358:1; disabled `#555555` 2.655:1; ellipsis `#999999` 2.824:1. `$pagination-mobile-current-item: true` warns; with `$pagination-mobile-items: true` it does not.
- Probe 2, `measure.mjs`, Chromium, Firefox, and WebKit at 1024 px: Foundation's Basics example verbatim fails axe `color-contrast` on `.pagination-previous` at 1.62 in all three; the recipe (the DOM the directives render) with `nfs-pagination` has no axe violation beyond the harness page's missing `h1`; the current link is `rgb(23, 121, 186)` on `rgb(254, 254, 254)` text and keeps the fill under a real hover, the disabled link is `rgb(202, 202, 202)` with Foundation's arrow and stays transparent on hover, and another link hovers to `rgb(230, 230, 230)`; without the include the current link's background is `rgba(0, 0, 0, 0)`. One-digit links are 27.80 by 28.39 px (Firefox 27.78 by 28.40); button items are 20.00 px tall without the include and 24.00 px with it, and axe reports no `target-size` violation for the 20 px buttons (spacing exception). At 320 px only Previous and Next show and `scrollWidth` is 320.
- Probe 3, Chromium CDP accessibility tree: the docs example's current page is static text; the recipe's list has 8 list items (the ellipsis is out of the tree); the placeholder link is link "Previous page", disabled, and not focusable; without `aria-label` the Next link's name is "Next page" followed by U+00BB. CDP's property list has no `aria-current` entry, so tests assert it through the DOM and Playwright's role query.
- Probe 4, `foundation-ratio.mjs`: Foundation's `color-luminance()` against the exact formula: `$black` on `#1177dd` 4.5051 against 4.4373:1, `$white` on `#1b7ac2` 4.4693 against 4.5173:1; both are the Sass test's pinning cases.
- Probe 5, `pin.mjs`: the draft stops the compile for `$black` on a `#1177dd` fill (4.437:1) and compiles `#1b7ac2` (4.517:1).

### Triage

| Decision | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| 3, current page as `aria-current` on the link, styled through `pagination-item-current` | HIGH: consumer markup and the Breadcrumbs parallel inherit it | HIGH: ADR 0042; the Breadcrumb APG pattern; the rule measured in three engines, hover included; the one loss (`$pagination-mobile-current-item`, off by default) recorded with its upgrade path | Decided |
| 4, disabled items as the placeholder link or a disabled button | MEDIUM: consumer markup | HIGH: ADR 0011's contract; Foundation's form measured failing axe in three engines; the disabled link's exposure measured in Chromium | Decided |
| 1, four directives and the `NfsPaginationEllipsis` name | MEDIUM: public API names | HIGH: ADR 0039 one directive per Structural class; the naming exception has a stated rule | Decided |
| 5, `aria-label` names, no name check | LOW | HIGH: Foundation's docs form; the arrow in the name measured | Decided |
| 6, floor and checks | LOW: one mixin, reversible | HIGH: measured button height and compile cases | Decided |
| 7, 8, 9, 10 | LOW | HIGH | Decided |

Nothing is left `OPEN FOR HUMAN`, and no prototype ticket is needed: the questions that needed a measurement were measured here.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table D, the Pagination row: fill the empty cells with:

   > | Pagination | `docs/pages/pagination.md` | [Spec: Pagination](issues/87-spec-pagination.md) | `ul[nfsPagination]` (`.pagination`); `li[nfsPaginationPrevious]` (`.pagination-previous`), `li[nfsPaginationNext]` (`.pagination-next`), `li[nfsPaginationEllipsis]` (`.ellipsis` and `aria-hidden="true"`); no Variant input; the current page is `aria-current` on its link or button and a disabled item is a placeholder link or a disabled button, so `.current` and `.disabled` are never bound; centring is the Typography Helpers directive written beside `nfsPagination` | Directives, one per Structural class (ADR 0001, ADR 0039); nothing is generated | Native platform: HTML lists, links, and buttons, `aria-current`, and the placeholder link; Aria has no pagination pattern and its toolbar's roving tab stop is not asked for (ADR 0004); CDK has nothing to do | Static host classes and one static `aria-hidden`; development checks in a self-destroying `afterEveryRender` (named landmark, copied classes, `aria-current` placement, the disabled-link contract, the missing include from the current link's computed background) and a development-only lookup of `NfsPagination` by class in the item directives; the `nfs-pagination` Library mixin: the current and disabled looks from ARIA through Foundation's `pagination-item-current` and `pagination-item-disabled`, a 24 px floor on links and buttons, and compile-time checks for 1.4.3 and 1.4.1 | None of its own: a list of links in a named `nav`; the current page is `aria-current` on its link, as the Breadcrumb pattern marks it |

2. `building-blocks.md` 1.3 Naming, the "Class names" bullet: append:

   > A Structural class that Foundation writes without its component's prefix but styles only under the component's root class takes the component's name: `.pagination .ellipsis` is `NfsPaginationEllipsis` (`li[nfsPaginationEllipsis]`), because a bare `NfsEllipsis` would read as a text-truncation utility ([Spec: Pagination](issues/87-spec-pagination.md)).

3. `building-blocks.md` 1.10, replace the "Current page" bullet with:

   > - Current page (2026-09-27, [Spec: Menu](issues/85-spec-menu.md); 2026-09-28, [Spec: Pagination](issues/87-spec-pagination.md)): a menu, a Top Bar menu, every menu Plugin, and a pagination mark the current page with `aria-current` on its link (a pagination's button, in a pager that updates in place), written by the consumer or by the Router's `RouterLinkActive` with `ariaCurrentWhenActive="page"`, never with a class. The `nfs-menu` Library mixin gives such a link Foundation's active look through Foundation's `menu-state-active` mixin, at the specificity of Foundation's `.menu .is-active > a`, and `nfs-pagination` gives it Foundation's current look through `pagination-item-current`, so the look and the announcement have one source (1.3.1), as the Tabs nav bar does in `nfs-tabs`. Every menu Plugin's markup is a Menu, so its consumers include `nfs-menu`. `.is-active` stays a State class the Nested menu binds for open parents and submenus; Pagination's `.current` is never bound.

4. `building-blocks.md` 1.10, new bullet after the "Progress Bar" bullet:

   > - Pagination ([Spec: Pagination](issues/87-spec-pagination.md)): a disabled item is an inactive control, a placeholder link (no `href`, `role="link"`, `aria-disabled="true"`, the Button's disabled-link contract) or a natively disabled button, which 1.4.3 exempts and axe skips; Foundation's disabled text item is plain text at 1.6252:1 and fails axe `color-contrast` in three engines. `nfs-pagination` gives those items Foundation's disabled look through `pagination-item-disabled`, sets `min-width: 24px; min-height: 24px` on every pagination link and button (2.5.8: Foundation's `button` reset makes button items 20 px tall), and stops the compile when item text on the page or on the hover background, the current page's text on its fill, or the ellipsis is under 4.5:1, or the current fill against the page or the disabled against the enabled text colour is under 3:1. No setting is required on Foundation's defaults.

5. `CONTEXT.md`, Foundation side, new term after **Menu icon**:

   > **Pagination**:
   > Foundation's CSS-only navigation through the numbered pages of a set of results: a list of page links with previous and next items and an ellipsis where pages are skipped; distinct from Material's paginator, a control that pages a table in place.
   > _Avoid_: paginator, pager (for the component), page navigation

   Angular side, replace **Current link** with:

   > **Current link**:
   > The link a menu or a pagination marks as the page the reader is on (a pagination's button, in a pager that updates in place), with `aria-current` present and neither `false` nor empty; the library gives it Foundation's active menu look or current pagination look, so no class marks it.
   > _Avoid_: active item, is-active item, selected link, current item (for Foundation's `.current`)

   and add after it:

   > **Placeholder link**:
   > An `<a>` without `href`, which HTML treats as a placeholder that is neither focusable nor navigable; marked `role="link"` and `aria-disabled="true"`, it is the library's disabled link (a disabled `nfsButton` link, a pagination's disabled previous or next item).
   > _Avoid_: disabled anchor, dead link, `href="#"` link

6. `adr/0042-menu-current-page-aria-current.md`, Consequences, append:

   > - 2026-09-28 ([Spec: Pagination](../issues/87-spec-pagination.md)): a pagination marks its current page the same way, with `aria-current` on the page's link (or a pager's button), which the `nfs-pagination` Library mixin styles with Foundation's `pagination-item-current`, so Foundation's `.current` is never bound; its disabled items follow suit, a placeholder link with `aria-disabled="true"` or a disabled button styled with Foundation's `pagination-item-disabled`, so `.disabled` is never bound either. Foundation's `$pagination-mobile-current-item`, which selects `li.current`, has no effect until `:has()` is in the Browser target.

7. `adr/0011-button-listener-free-disabled-contract.md`, Consequences, append:

   > - 2026-09-28 ([Spec: Pagination](../issues/87-spec-pagination.md)): the placeholder link is also a pagination's disabled previous or next item, written by the consumer without `nfsButton` (`role="link"`, `aria-disabled="true"`, no `href`); `nfsPagination`'s development checks report a disabled link that keeps its `href` and a placeholder link that is not marked disabled, as `nfsButton`'s do.

8. `storybook-conventions.md` section 5, in the `preview.scss` block after the `@include nfs-menu;` line, add:

   > `@include nfs-pagination; // Pagination: the current and disabled looks from ARIA and the 24 px floor; every pagination--* story`

### What other specs need from this one

- [Spec: Breadcrumbs](88-spec-breadcrumbs.md), kept parallel: the same landmark development check and wording (check 1); the current page as `aria-current="page"` on its link, which keeps its `href`, styled by that spec's Library mixin with the same `:where(:not([aria-current='false']):not([aria-current='']))` exclusion (Foundation colours a current breadcrumb only as the `li`'s text colour, `$breadcrumbs-item-color-current`, so the rule would set the link's `color`); the copied `current` and `disabled` reports; the same Rendered HTML conventions. One difference to decide there: Breadcrumbs' `.disabled` marks a step without a page, not a control, so its `#cacaca` text (1.6252:1 on `#fefefe`) gets no inactive-control exemption from 1.4.3.
- [Spec: Menu](85-spec-menu.md) and ADR 0042: Pagination's check 5 (a transparent computed background on the current link means the include is missing) would also catch a missing `nfs-menu`, whose current look is a fill too; offered, not proposed as a change.
- [Spec: Typography Helpers](106-spec-typography-helpers.md): the Centered example writes its text-alignment directive (placeholder `nfsTextAlign="center"`) on `ul[nfsPagination]`; `NfsPagination` binds only `pagination`, so the two share no class key.
- [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md): the placeholder link and its development-check wording are shared (proposal 7).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no pagination example writes `current`, `disabled`, `ellipsis`, `pagination-previous`, `pagination-next`, or `text-center`, and replace the `nfsTextAlign` placeholder with the published name.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): every Out of Scope item and rejected alternative in the spec carries a reason and a category.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): Pagination declares no Variant registry and adds no manifest row.

### Gist for Decisions so far

- [Spec: Pagination](issues/87-spec-pagination.md) -- four listener-free class directives in one entry point (`ul[nfsPagination]`, `li[nfsPaginationPrevious]`, `li[nfsPaginationNext]`, and `li[nfsPaginationEllipsis]` with `aria-hidden`), no Variant input (Pagination has no Variant class; centring is the Typography Helpers directive); the current page is `aria-current` on its link or a pager's button and a disabled item is ADR 0011's placeholder link or a disabled button, which `nfs-pagination` styles through Foundation's own `pagination-item-current` and `pagination-item-disabled`, so `.current` and `.disabled` are never bound (Foundation's disabled text item fails axe at 1.62:1 in three engines; as an inactive control it is exempt); the mixin adds a 24 px floor (button items measure 20 px) and exact-formula checks for 1.4.3 and 1.4.1, and no setting is required on Foundation's defaults; `$pagination-mobile-current-item` loses its effect until `:has()`; development checks for the named `nav`, copied classes, `aria-current` placement, the disabled-link contract, and a missing include; impact HIGH, confidence HIGH; no new ADR, dated notes on ADR 0042 and ADR 0011 proposed. Spec: [specs/pagination.md](specs/pagination.md).

### Amendment, 2026-09-29 (in-family check lines)

From [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), building-blocks 1.9, and the family rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/pagination.md` was revised in place. The re-run's Answer holds the decisions and the triage.

- Hierarchy and DI shape gains the In-family lines: `NfsPagination` probes `NfsPaginationPrevious`, `NfsPaginationNext`, and `NfsPaginationEllipsis`; each of the three has a parent check over `NfsPagination`, through its development-only lookup by class, with the sentence "Foundation lays out and draws pagination items only inside a pagination.", and throws under `strictParents`.
- The items' outside-the-pagination warning becomes that parent check's report, so an item outside a pagination is reported once.
- No API, class, ARIA, rendering, or Sass change. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.
