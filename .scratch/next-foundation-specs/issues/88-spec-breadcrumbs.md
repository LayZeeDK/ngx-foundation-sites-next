# 88. Spec: Breadcrumbs

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Breadcrumbs to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/breadcrumbs.md` and its Sass is `scss/components/_breadcrumbs.scss` in the 6.9.0 clone. Publish `specs/breadcrumbs.md`.

Known from the triage: A named `nav`, `aria-current` on the current item, and the generated separators.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Resolved 2026-09-28, AFK under the map's override: self-grilled on both sides against Foundation 6.9.0's breadcrumbs docs page and Sass (and its typography base for list line heights), the APG Breadcrumb pattern and its example's notes and CSS, WCAG 2.2's Understanding document for 1.4.1 and failure F73, the Angular 22.2.x Router (`router_link_active.ts`) and hydration cleanup source, the Angular Material 22.2.x source, ADR 0039, ADR 0040, ADR 0042, building-blocks 1.2, 1.3, 1.4, 1.9, 1.10, 1.13, and 1.14, the [Spec: Menu](85-spec-menu.md) and its ticket, the [Spec: Pagination](87-spec-pagination.md) and its ticket (read once published, and aligned), the [Spec: Badge](93-spec-badge.md), and the triage and catalogue rows for Breadcrumbs, with seven measured probes. Spec: [specs/breadcrumbs.md](../specs/breadcrumbs.md).

### Grilling record

Round 1 (the frontier: prerequisites all settled by ADR 0039, ADR 0040, and ADR 0042):
- Q1. Which Structural classes, and which directives bind them? One, `.breadcrumbs`, on the list: `NfsBreadcrumbs`. The items have no Structural class.
- Q2. Which State and Variant classes? No Variant class (`$breadcrumbs-item-uppercase` and `$breadcrumbs-item-separator` are Sass booleans, compile-time). One State class, `.disabled` on an item. Foundation has no `.current` for breadcrumbs: the current page is the `li`'s text colour.
- Q3. Component or directive? Directives: nothing is generated (ADR 0001).
- Q4. Implementation level? Native platform: Aria has no breadcrumb pattern, the APG pattern has no keyboard interaction, and CDK has nothing to do.
- Q5. Host elements? `ul` (Foundation) and `ol` (the APG example's ordered list); Foundation's CSS styles the class alone, and its list base styles are the same for both, so both render alike.

Round 2:
- Q6. How is the current page marked? Options: (a) Foundation's text with hidden "Current: "; (b) a `current` input on an item directive binding `aria-current`; (c) `aria-current="page"` on the current page's link (APG, ADR 0042, the Pagination's D4), or on its `li` when it is text. Settled: (c). An item directive cannot reach its link through host bindings, (b) is a second source (ADR 0042's reason), and (a) would be read twice beside `aria-current`. Measured: Foundation gives a current link no current look (it keeps the link colour in three engines), so `nfs-breadcrumbs` colours it `$breadcrumbs-item-color-current` with the Menu's and Pagination's selector exclusion.
- Q7. How is `.disabled` bound, and what is a disabled step? Argued both ways. For the Pagination's model (a placeholder link with `role="link"` and `aria-disabled="true"`, styled from ARIA, `.disabled` never bound): a parallel API, the inactive-control exemption from 1.4.3, no item directive. Against it: a step without a page is a level of the hierarchy, not a control that will become available; exposing it as an unavailable link promises a link that never exists, and the exemption would leave the level's name, content the reader needs, at 1.6252:1. The Pagination's ticket records the same difference ("marks a step without a page, not a control"). `aria-disabled` on the `li` is not supported on `listitem` in WAI-ARIA 1.2, and `:has()` is out of the Browser target, so no CSS can key the look on the step itself. Settled: the step stays text, and `li[nfsBreadcrumbsItem]` binds `.disabled` from a `disabled` input (`booleanAttribute`, the Button's and Slider's State input), so Foundation's own rule styles it; 1.4.3 applies.
- Q8. Separators: document Foundation's glyph (the triage's reading) or change them? Measured: the glyph is a static text node "/" after every link in Chromium's accessibility tree. The APG's own breadcrumb example draws its separator as an empty pseudo-element with a slanted border "to prevent screen reader announcement of the visual separators". CSS alternative text (`content: '/' / ''`) is out of the Browser target (Safari 17.4, Firefox 128), and building-blocks 1.2 rules out a second path (the Accordion's D18). Settled: `nfs-breadcrumbs` draws Foundation's default glyph (`/`, `\` in a right-to-left compile) without text; another character keeps Foundation's glyph, because the library cannot draw an arbitrary character silently; `$breadcrumbs-item-separator: false` draws none. Measured in three engines: same place and colour, 2 px narrower, visible in forced colours, `content: ""`.
- Q9. The named `nav`: directive-owned or consumer-written? Consumer-written (the name is content and localised), checked in development with the Pagination's condition and wording.

Round 3:
- Q10. Which WCAG 2.2 AA gaps does the documented markup leave? 1.4.3 (the disabled step, 1.6252:1; axe `color-contrast` 1.62 in three engines on Foundation's own example); 2.5.8 (links 12 px tall on 17.59 px rows; a wrapped trail at 320 px fails axe `target-size` on 7 links in three engines); 1.3.2 in a region of the other direction (floats fixed at compile time); 1.3.1 for a current link (no look without a class). Link text 4.6473:1 and current text 19.6304:1 pass.
- Q11. 2.5.8 by size or by spacing? Building-blocks 1.10 says by size. Measured three candidates: row spacing alone passes axe only through the spacing exception; `inline-block` links on a `max(24px, list line height)` line fail under a user's 1.5 line height (16.5 px links); `inline-block` links with a 24 px `min-width` and `min-height` plus items with that line and a 24 px `min-height` give 24.00 px boxes and rows in three engines, with and without the text spacing, and no violation. Settled: the last.
- Q12. Should the trail follow `dir`? Yes: `float: inline-start` is in the Browser target and equals Foundation's float in the compile's own direction (measured: a `dir="rtl"` trail in a left-to-right compile now runs right to left in three engines). The separator's lean stays the compile's, because `:dir()` needs Chrome 120.
- Q13. 1.4.1: must a disabled step differ from a link by 3:1 in lightness, as the Pagination's disabled item must from an enabled one? No grey reaches both 4.5:1 on `#fefefe` and 3:1 from `#1779ba` (the darkest grey 3:1 from it is `#cfcfcf`, 1.5448:1 on the page); only a near-black step would, which is the current step's look. Settled: no pair check; the current page is also the last step, F73 accepts navigational links identified by design and context, and a disabled step is text, not a control's state. Recorded as the one 1.4.1 reading the spec relies on (Triage).
- Q14. Required setting? `$breadcrumbs-item-color-disabled: #737373;` (4.7015:1), the placeholder colour the Forms spec already requires.
- Q15. Development checks? Parallel to the Pagination's (landmark, copied classes, `aria-current` placement, links without `href`, missing include, in one self-destroying `afterEveryRender`), plus "more than one current step" for `RouterLinkActive` without exact matching, and the item's own three.
- Q16. Router recipes and hydration? `[attr.aria-current]` from the trail's last step inside a routed component, or `RouterLinkActive` with `{exact: true}` on every step; `RouterLinkActive`'s `update()` returns while `router.navigated` is false (read), so the server's attribute survives hydration; a trail read from the Router's state in the application shell is empty at the first client render, and Angular's hydration cleanup removes dehydrated views no client view claimed (read in `hydration/cleanup.ts`), so the recipes render the trail in a routed component.
- Q17. Tests? The four layers; e2e only for three-engine geometry, direction, the drawn separator, focus visible, and the fixture app; a manual screen-reader release test.

The frontier is empty; nothing is left `OPEN FOR HUMAN`.

### Decisions

1. `NfsBreadcrumbs` (`ul[nfsBreadcrumbs], ol[nfsBreadcrumbs]`) binds `.breadcrumbs`; `NfsBreadcrumbsItem` (`li[nfsBreadcrumbsItem]`) binds `.disabled` from its `disabled` input (`booleanAttribute`, default `false`, a plain boolean that strips a copied static class); both in the secondary entry point `ngx-foundation-sites/breadcrumbs`. Directives only; implementation level native platform; no listeners, no template, no Parent or Defaults token, no models, outputs, methods, or `exportAs`; the item looks the list up by class in development builds only.
2. No Variant input, registry, or Variant property: Foundation's Breadcrumbs has no Variant class.
3. The current page is `aria-current="page"` on its link, which keeps its `href`, or on its `li` when it is text; no `current` input; Foundation's hidden "Current: " is dropped. `nfs-breadcrumbs` emits `.breadcrumbs a[aria-current]:where(:not([aria-current='false']):not([aria-current=''])) { color: $breadcrumbs-item-color-current; }`. Router: `routerLinkActive` with `[routerLinkActiveOptions]="{exact: true}"` and `ariaCurrentWhenActive="page"` on every step, or `[attr.aria-current]` from the trail's last step inside a routed component.
4. A disabled step is text in `li[nfsBreadcrumbsItem] disabled`, styled by Foundation's own `.disabled` rule, with no ARIA state; it is not a control, so 1.4.3 applies. This departs from the Pagination's disabled item on purpose.
5. `nfs-breadcrumbs` rules: the current link's colour; Foundation's default separator drawn without text (`content: ''; display: inline-block; height: 0.8em; border-inline-end: 0.1em solid; transform: rotate(15deg)`, `-15deg` in a right-to-left compile), only while separators are on and the character is Foundation's default; `.breadcrumbs li { float: inline-start; line-height: max(24px, <$list-lineheight as em>); min-height: 24px; }`; `.breadcrumbs a { display: inline-block; min-width: 24px; min-height: 24px; text-align: center; }`.
6. `nfs-breadcrumbs` checks: one `@error` when `$breadcrumbs-item-color`, `$breadcrumbs-item-color-current`, or `$breadcrumbs-item-color-disabled` is under 4.5:1 on `$body-background`, by the exact helper; required setting on Foundation's defaults: `$breadcrumbs-item-color-disabled: #737373;`. No 1.4.1 pair check, no separator check (decoration), no Variant properties, no mixin parameter.
7. Development checks (client, once each): landmark (the Pagination's condition and wording), copied `disabled` on a plain `li` and copied `current` or `is-active`, `aria-current` placement, more than one current step, a link without `href`, the missing include (a link whose computed `display` is `inline`); on the item: outside a trail, `disabled` over a link, a copied static `disabled`. `NfsBreadcrumbs` runs its checks in one self-destroying `afterEveryRender` once its host holds an `li`. No Runtime checks.
8. Rendering modes: host bindings only; the server HTML is final; nothing replays; no hydration boundary of its own; `hydrate never` keeps the look and working links.
9. Stories `breadcrumbs--basic`, `--current-text`, `--router`, `--wrapped`, `--rtl`; e2e for geometry with and without the text spacing, reflow, direction, the drawn separator, focus visible, and the fixture app; a manual screen-reader release test.

### Measurements

All probes ran under `D:/tmp/nfs-wave-88/` (not committed), with read-only use of `D:/tmp/nfs-ct-prototype`'s installed packages (Dart Sass 1.104.1, Playwright 1.63.0 with Chromium, Firefox, and WebKit, axe-core 4.13.0) over the Foundation 6.9.0 clone's `scss`; no junction was created, and nothing was left running.

- E1, ratios (exact formula, unrounded, against `#fefefe`): links `#1779ba` 4.6473 (Foundation's `color-luminance()` 4.5865), current `#0a0a0a` 19.6304, disabled and separator `#cacaca` 1.6252; candidates `#8a8a8a` 3.4230, `#767676` 4.5037, `#737373` 4.7015; `#1779ba` against `#0a0a0a` 4.2240, against `#737373` 1.0116, against `#cacaca` 2.8596; the darkest grey 3:1 from `#1779ba` is `#cfcfcf` (3.0085, 1.5448 on the page).
- E2, axe and the accessibility tree: Foundation's docs example verbatim fails `color-contrast` on `.disabled` at 1.62 in Chromium, Firefox, and WebKit and passes with the required setting; the library forms (a current link, and an `ol` with a text current step) pass in three engines (the bare test page's page-level `page-has-heading-one` aside). Chromium's CDP tree: Foundation's glyph is a `StaticText "/"` after every link; the drawn separator an empty `generic` with no text; computed `::after` `content` `"/"` against `""` in all three engines. A current link without `nfs-breadcrumbs` keeps `rgb(23, 121, 186)`, with it `rgb(10, 10, 10)`, in three engines. Chromium names the links in their uppercased text ("HOME").
- E3, geometry at a 16 px root font size: Foundation's links 33.00 by 12.00 px ("Home"), a one-letter link 7.33 by 12.00, items 17.59 px tall (Firefox 17.60); a ten-step trail at 320 px wraps onto four rows 17.59 px apart (WebKit 17.00) and fails axe `target-size` on 7 links in three engines, also under the text spacing. With the adopted rules: every link at least 24.00 by 24.00 px, every item 24.00 px, rows 24.00 px apart, no violation, `scrollWidth` 320, in three engines; line height alone gave 16.50 px links under the text spacing and 9 violations, which the `min-height` pair fixed.
- E4, screenshots at 3x in three engines: the drawn slash sits where Foundation's glyph does, in its colour; the right-to-left compile draws the mirrored lean; forced colours (Chromium) show the separators in the text colour.
- E5, Sass compile of the candidate `nfs-breadcrumbs` after `foundation-breadcrumbs`: Foundation's defaults stop with `$breadcrumbs-item-color-disabled #cacaca on $body-background #fefefe: 1.625:1`; the required setting emits exactly the four rules; separators off, the legacy `$breadcrumbs-item-slash: false`, and `'>'` emit no separator rule; the RTL compile rotates `-15deg`; `#1177dd` links stop at 4.423 (Foundation 4.357), `$dark-gray` current text at 3.422, a translucent `rgba(#0a0a0a, 0.5)` disabled colour at 3.708 after compositing.
- E6, the CDP tree does not report `aria-current` as a property on links or items; the platform mapping (IA2 `current:`, UIA `AriaProperties`) was measured for links in [Resolve the assistive-technology checks](77-evidence-assistive-technology-checks.md)'s evidence, and Core-AAM maps it on every element, so the text form rests on the APG and Core-AAM, with the manual release test.
- E7, direction: Foundation's trail under `dir="rtl"` in a left-to-right compile runs left to right in three engines; with `float: inline-start` it runs right to left, and an RTL compile under `dir="ltr"` runs left to right.

### Triage

| Decision | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| 3, current page as `aria-current` on its link, styled by `nfs-breadcrumbs` | HIGH: consumer markup, and the parallel with the Menu and Pagination | HIGH: the APG pattern; ADR 0042; the Pagination's D4; measured in three engines | Decided |
| 4, a disabled step is text with `nfsBreadcrumbsItem disabled`; 1.4.3 applies | MEDIUM: one directive and one required setting; differs from the Pagination | HIGH: WCAG 1.4.3's exemption covers inactive user interface components, which a text step is not; axe fails Foundation's example in three engines; WAI-ARIA 1.2 does not support `aria-disabled` on `listitem`; the Pagination's ticket records the same difference | Decided |
| 5, drawn separator for Foundation's default glyph | MEDIUM: a visible rendering choice, reversible in one rule | HIGH: the APG example's technique and note; measured in three engines; the one loss (a consumer's own character stays spoken) recorded with its upgrade path | Decided |
| 5, 24 px boxes and rows, `float: inline-start` | LOW: one mixin, reversible | HIGH: building-blocks 1.10's by-size rule; measured in three engines, text spacing included | Decided |
| 6, no 1.4.1 pair check for a disabled step | MEDIUM: tightening it later would stop consumers' compiles | HIGH: F73's navigational-links clause, the current step's position, and the arithmetic that no readable grey can reach 3:1 from Foundation's link colour; recorded in the spec's WCAG table and D9 so a reviewer can overturn it | Decided |
| 1, 2, 7, 8, 9 | LOW | HIGH | Decided |

Nothing is left `OPEN FOR HUMAN`, and no prototype ticket is needed: every design question that needed a measurement was measured here.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table D, the Breadcrumbs row: fill the empty cells with:

   > | Breadcrumbs | `docs/pages/breadcrumbs.md` | [Spec: Breadcrumbs](issues/88-spec-breadcrumbs.md) | `ul[nfsBreadcrumbs]`, `ol[nfsBreadcrumbs]` (`.breadcrumbs`); `li[nfsBreadcrumbsItem]` (`.disabled` from its `disabled` input, for a step without a page, written as text); no Variant input; the current page is `aria-current` on its link, or on its `li` when it is text, so there is no current class | Directives (ADR 0001, ADR 0039); nothing is generated | Native platform: HTML lists and links in a named `nav`, and `aria-current`; Aria has no breadcrumb pattern and the APG's has no keyboard interaction; CDK has nothing to do | A static host class and one `[class.disabled]` binding over an `input()` signal; development checks in a self-destroying `afterEveryRender` (the Pagination's named-landmark check, copied classes, `aria-current` placement and count, links without `href`, the missing include from a link's computed `display`) and the item's development-only lookup of `NfsBreadcrumbs` by class; the `nfs-breadcrumbs` Library mixin: the current link's colour from `aria-current`, Foundation's default separator drawn without text, 24 px link boxes and rows, items floated to `inline-start`, and compile-time checks for 1.4.3 | Breadcrumb: a list of links in a named navigation landmark, with `aria-current="page"` on the current page |

2. `building-blocks.md` 1.10, the "Current page" bullet (after the Pagination ticket's proposal 3, if applied): replace with:

   > - Current page (2026-09-27, [Spec: Menu](issues/85-spec-menu.md); 2026-09-28, [Spec: Pagination](issues/87-spec-pagination.md) and [Spec: Breadcrumbs](issues/88-spec-breadcrumbs.md)): a menu, a Top Bar menu, every menu Plugin, a pagination, and a breadcrumb trail mark the current page with `aria-current` on its link (a pagination's button, in a pager that updates in place; a breadcrumb's `li`, when the current page is written as text), written by the consumer or by the Router's `RouterLinkActive` with `ariaCurrentWhenActive="page"` (on a trail, with `{exact: true}`, because every step is an ancestor of the current URL), never with a class. The `nfs-menu` Library mixin gives such a link Foundation's active look through Foundation's `menu-state-active` mixin, at the specificity of Foundation's `.menu .is-active > a`, `nfs-pagination` gives it Foundation's current look through `pagination-item-current`, and `nfs-breadcrumbs` gives it `$breadcrumbs-item-color-current`, the colour Foundation gives a current step's text, so the look and the announcement have one source (1.3.1), as the Tabs nav bar does in `nfs-tabs`. Every menu Plugin's markup is a Menu, so its consumers include `nfs-menu`. `.is-active` stays a State class the Nested menu binds for open parents and submenus; Pagination's `.current` is never bound, and Breadcrumbs has no current class.

3. `building-blocks.md` 1.10, new bullet after the Pagination bullet (or after the "Progress Bar" bullet if that one is not applied yet):

   > - Breadcrumbs ([Spec: Breadcrumbs](issues/88-spec-breadcrumbs.md)): a disabled step is a level without a page, written as text, not a control, so 1.4.3 applies to it: the consumer must set `$breadcrumbs-item-color-disabled: #737373;` (Foundation's `$medium-gray` is 1.6252:1, and axe fails Foundation's own example in three engines), mirrored in the Storybook settings overrides, and `nfs-breadcrumbs` stops the compile when link, current, or disabled text is under 4.5:1 on the page. `nfs-breadcrumbs` also draws Foundation's default separator as an empty box with a slanted border, because CSS generated text is in the accessibility tree and the alternative-text syntax is out of the Browser target (the APG's breadcrumb example draws it the same way); gives every link an `inline-block` box of at least 24 by 24 px and every item one line of at least 24 px (2.5.8 by size; a wrapped trail fails axe `target-size` on Foundation's 12 px links, measured in three engines); and floats the items to `inline-start`, so the trail follows `dir` (1.3.2).

4. `building-blocks.md` 1.10, the "Target size" bullet: after "which leaves the padding box, and so the drawing, unchanged; `nfs-menu-icon` applies it to every `.menu-icon`, so the Responsive Toggle's and Off-canvas's title bars get it from that include ([Spec: Top Bar](issues/86-spec-top-bar.md))." insert:

   > Where the target is an inline text link in a floated row (a breadcrumb step), the link becomes `inline-block` with the `min-width` and `min-height` floor and every item of the row gets one line of at least 24 px, so the rows stay aligned and 24 px apart; line height alone is not used, because a user's line-height override shrinks the links again (measured in three engines, [Spec: Breadcrumbs](issues/88-spec-breadcrumbs.md)).

5. `CONTEXT.md`, Foundation side, new terms after **Pagination** (or after **Menu icon** if the Pagination term is not applied yet):

   > **Breadcrumbs**:
   > Foundation's CSS-only trail of links to the parent pages of the current page, in hierarchy order, marked by the `.breadcrumbs` Structural class inside a named navigation landmark; distinct from an Open path, a menu's chain of open submenus.
   > _Avoid_: breadcrumb bar, trail (bare), path, crumbs

   > **Disabled step**:
   > A Breadcrumbs item for a level of the hierarchy that has no page of its own, written as text with Foundation's disabled look; not a control, so it has no disabled state for assistive technology and its text meets the text contrast minimum.
   > _Avoid_: disabled link, inactive crumb, unavailable item

   Angular side, replace **Current link** (the Pagination ticket's replacement, if applied, extended) with:

   > **Current link**:
   > The link a menu, a pagination, or a Breadcrumbs trail marks as the page the reader is on (a pagination's button, in a pager that updates in place), with `aria-current` present and neither `false` nor empty; the library gives it Foundation's active menu look, current pagination look, or current breadcrumb colour, so no class marks it.
   > _Avoid_: active item, is-active item, selected link, current item (for Foundation's `.current`)

6. `adr/0042-menu-current-page-aria-current.md`, Consequences, append:

   > - 2026-09-28 ([Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md)): a breadcrumb trail marks its current page the same way, with `aria-current="page"` on the page's link, which the `nfs-breadcrumbs` Library mixin colours `$breadcrumbs-item-color-current` (Foundation's colour for a current step's text), or on its `li` when the current page is written as text, which Foundation's item colour already styles; `RouterLinkActive` needs `{exact: true}` on every step, and a development check reports more than one current step. Unlike the Pagination's, a disabled step is text, not a control, so `li[nfsBreadcrumbsItem]` binds Foundation's `.disabled` from its `disabled` input.

7. `storybook-conventions.md` section 5, in the `preview.scss` block after the `@include nfs-menu;` line (or after `@include nfs-pagination;` if applied), add:

   > `@include nfs-breadcrumbs; // Breadcrumbs: the current link's colour, silent separators, 24 px targets, and the direction; every breadcrumbs--* story`

   and in the `_settings-overrides.scss` block, after the Forms block, add:

   > ```scss
   > // color-contrast (1.4.3): Foundation's disabled breadcrumb is 1.63:1 (axe reports 1.62), and nfs-breadcrumbs
   > // stops the compile. Spec: Breadcrumbs, breadcrumbs--basic.
   > $breadcrumbs-item-color-disabled: #737373;
   > ```

8. `README.md`, the CSS-only rows of the spec index, add:

   > | Breadcrumbs (CSS-only component) | [specs/breadcrumbs.md](specs/breadcrumbs.md) | Native platform (a list of links in a named `nav`, `aria-current`); two listener-free directives, one for the list and one for a disabled step | No inventory: Foundation's breadcrumbs docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Pagination, Breadcrumbs row) | None needed; contrast, the accessibility tree, target size, the drawn separator, forced colours, and direction measured in [Spec: Breadcrumbs](issues/88-spec-breadcrumbs.md) |

   and update the published-spec count.

### What other specs need from this one

- [Spec: Pagination](87-spec-pagination.md): aligned on the landmark check and its wording, the `aria-current` selector exclusion, the copied `current` report wording, the self-destroying `afterEveryRender` for the checks, the missing-include check (here from a link's computed `display`), and the Rendered HTML conventions. Recorded differences: a disabled step is text bound by `li[nfsBreadcrumbsItem]` (its ticket's "one difference to decide there"); `ol` hosts are accepted; the trail floats to `inline-start` (its items follow `dir` natively); no 1.4.1 pair check for the disabled look (D9); and a check for more than one current step. No change to the Pagination spec is needed.
- [Spec: Visibility Classes](104-spec-visibility-classes.md): the breadcrumb recipes no longer use `.show-for-sr` ("Current: " is replaced by `aria-current`); its screen-reader-only directive stays available for other visually hidden text.
- [Spec: Menu](85-spec-menu.md) and ADR 0042: the dated consequence above; nothing changes in the Menu.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): Breadcrumbs declares no Variant registry and adds no manifest row.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no breadcrumbs example writes `breadcrumbs`, `disabled`, `current`, or `show-for-sr`, that every trail sits in a named `nav`, and that the landmark check's condition and wording match the Pagination's.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): every Out of Scope item and rejected alternative in the spec carries a reason and a category; the triage row's "`.current`/`.disabled` consumer-written, as DM19" and "generated separators documented" are superseded here (`.disabled` is bound, there is no `.current`, and the default separator is drawn without text).

### Gist for Decisions so far

- [Spec: Breadcrumbs](issues/88-spec-breadcrumbs.md) -- `ul[nfsBreadcrumbs]` or `ol[nfsBreadcrumbs]` binds `.breadcrumbs` and `li[nfsBreadcrumbsItem]` binds `.disabled` from its `disabled` input for a step without a page, written as text (not a control, unlike the Pagination's disabled item, so 1.4.3 applies and the consumer sets `$breadcrumbs-item-color-disabled: #737373;`; Foundation's example fails axe at 1.62 in three engines); no Variant input; the current page is `aria-current` on its link (ADR 0042), which `nfs-breadcrumbs` colours `$breadcrumbs-item-color-current`, or on its `li` when it is text; the mixin also draws Foundation's default separator without text (the APG example's technique; the glyph is text in the accessibility tree, measured), gives links 24 px boxes on 24 px rows (a wrapped trail failed `target-size` in three engines), and floats items to `inline-start` so the trail follows `dir`; development checks parallel to the Pagination's, plus one for more than one current step; impact HIGH, confidence HIGH; no ADR. Spec: [specs/breadcrumbs.md](specs/breadcrumbs.md).

### Amendment, 2026-09-29 (in-family check lines)

From [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), building-blocks 1.9, and the family rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/breadcrumbs.md` was revised in place. The re-run's Answer holds the decisions and the triage.

- Hierarchy and DI shape gains the In-family lines: `NfsBreadcrumbs` probes `NfsBreadcrumbsItem`; `NfsBreadcrumbsItem` has a parent check over `NfsBreadcrumbs`, through its development-only lookup by class, with the sentence "Foundation's disabled look applies only inside the trail.", and throws under `strictParents`.
- Development check 7 becomes that parent check's report, so an item outside a trail is reported once.
- No API, class, ARIA, rendering, or Sass change. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group a, under the decisions of phase 1 ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)); the review's record for this spec is [research/consistency-review-group-a.md](../research/consistency-review-group-a.md). `specs/breadcrumbs.md` was revised in place. Items applied: R24, R57, R4 (S1's wording completed). Changed:

- R24: in Rendered HTML the Router example and its output sit in `<nav aria-label="Breadcrumb">`, as every other trail does, so development check 1 would not report the spec's own example.
- R57: "the application class" in the SSR smoke reads "the Application class".
- R4: the Sass checks name both Foundation functions as not used (`color-luminance()`, `color-contrast()`), completing S1's wording.

Unchanged: the two directives, their inputs, the development checks, the In-family lines of [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md), the Library mixin's rules and required setting, ARIA, the rendering modes, and the Story ids. Confirmed: R73 (`#737373`, 4.7015:1), R74 (the landmark check reads attributes only), R4's figures (4.6473, 19.6304, 1.6252:1), CR-A (every class is rendered output, the labelled copied-class case, or Foundation's labelled markup), CR-B, CR-C, CR-D (`app-feature-trail` imports exactly the directives its template writes). Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (exportAs on every directive)

From [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `specs/breadcrumbs.md`'s `NfsBreadcrumbs` and `NfsBreadcrumbsItem` gain `exportAs: 'nfsBreadcrumbs'` and `exportAs: 'nfsBreadcrumbsItem'` (the API lines and D1).

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md), applied by [Re-run: specs without checks, group a](165-rerun-specs-without-checks-group-a.md): `specs/breadcrumbs.md` describes and accepts a library with no checks. What left the spec, per check:

- Forgotten-import checks: the In-family checks bullet (both parts' `nfsDirectiveCheck` calls, the trail's probe, the item's parent check with its `alone` sentence, and its `strictParents` throw), with the item's development-only `inject(NfsBreadcrumbs, {optional: true})`, which served only that check and development check 7, and the "DI follows the declaration site" bullet, which described that lookup.
- Misuse warnings: development checks 1 to 6 (landmark, copied classes, `aria-current` placement, one current page, links without `href`, the missing include) with `NfsBreadcrumbs`'s self-destroying `afterEveryRender`, and checks 8 and 9 (a disabled step holding a link, a static `disabled` class) with the item's render callback and `HostAttributeToken('class')` read; check 7 was the parent check above. Their browser-level case, the Router case's warning clause, and the SSR smoke's no-warning clause go; the "Runtime checks: none" paragraph goes with them.
- Build-time checks: the `nfs-breadcrumbs` `@error` contrast checks, with the Sass compile cases that asserted only them (the defaults' stop, `#1177dd`, `$dark-gray`, the translucent disabled colour) and the three settings the mixin read only for them.

Each rule is stated as documented usage: the "Development checks" section becomes "Usage rules", nine rules in the old order, stated in the directives' JSDoc (the named `nav`, no copied classes, `aria-current` placement, one current page with `{exact: true}` on every step, an `href` on every step link, the include, the item inside the trail, no link in a disabled step, no static `disabled` class); a Placement bullet and an Imports bullet under Hierarchy and DI shape (a forgotten import leaves a plain list or step; a bound `[disabled]` fails to compile, NG8002); the 1.3.1 and 1.4.3 rows; and the Sass subsection's settings paragraph with its ratios. With no injection left, an item projected into the trail's list from another template now gets the disabled look, which Foundation's CSS gives it by DOM. D9, D10, and D11 are rewritten to what the spec now decides; user stories 8, 11 to 19, and 39 state documentation, not warnings. Unchanged: the two directives, their inputs, the host bindings (a copied `disabled` is still stripped), ARIA, the rendering modes, the four Sass rules, the required setting, and the Story ids.

### Amendment, 2026-09-30 (later-milestone families)

From [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md), applied by [Re-run: specs without the later-milestone families, group a](176-rerun-specs-without-later-families-group-a.md): `specs/breadcrumbs.md` no longer names the Visibility Classes directive. The `.show-for-sr` mapping row says that where visually hidden text is wanted the consumer writes `class="show-for-sr"`, a normal class from Foundation's global styles, and the Out of Scope bullet says a later milestone adds the directive; no link to that spec remains. Unchanged: the two directives, `aria-current` in place of Foundation's "Current: " text, the separators, the Sass, and the Story ids.

### Amendment, 2026-09-30 (consistency review of the later-milestone waves)

From [Consistency review: the later-milestone waves](180-consistency-review-later-milestone-waves.md), group e; `specs/breadcrumbs.md` was revised in place:

- The Problem Statement's class-rule bullet ("writes no Foundation or library class") and the class mapping's closing sentence ("No class is left for the consumer to write") now name the families with a first-milestone spec, because the `.show-for-sr` row lets the consumer write that Visibility class as a normal class ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)'s note of 2026-09-30; audit 0010's L1 form). Impact LOW, confidence HIGH.
