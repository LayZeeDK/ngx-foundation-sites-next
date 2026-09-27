# 112. Re-run: Accordion Menu spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81, 132
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Accordion Menu](20-spec-accordion-menu.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/accordion-menu.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Accordion Menu](20-spec-accordion-menu.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Resolved 2026-09-28, AFK under the map's override: self-grilled on both sides with `/grill-with-docs` (the `/grilling` rounds plus `/domain-modeling` for vocabulary), then the spec revised in place in the `/to-spec` shape. Contract: the "What other tickets need from this one" section of the [Re-run: Nested menu (shared utility) spec under the class rule](132-rerun-nested-menu-class-rule.md), applied, not reopened. Sources: ADR 0039, ADR 0040, ADR 0041, ADR 0042, building-blocks 1.3, 1.4, 1.9, 1.10, 1.13, and 1.14, the revised `specs/nested-menu.md` and `specs/menu.md` as they stand, the answers of [Spec: Menu](85-spec-menu.md) and [Spec: Top Bar](86-spec-top-bar.md) (its exact-luminance finding, relayed by the orchestrator), `research/out-of-scope-triage.md` (the `.submenu-toggle-text` row), `research/out-of-scope-exclusions.md` (AM1 to AM6), the Foundation 6.9.0 clone (`docs/pages/accordion-menu.md`, `scss/components/_accordion-menu.scss`, `_menu.scss`, `_drilldown.scss`, `_dropdown-menu.scss`, `js/foundation.offcanvas.js`), and the Angular 22.2.x clone (`packages/router/src/directives/router_link_active.ts`, `packages/router/src/url_tree.ts`). Spec: [specs/accordion-menu.md](../specs/accordion-menu.md), revised in place; the dated amendment is in [Spec: Accordion Menu](20-spec-accordion-menu.md) under `### Amendment, 2026-09-28 (class rule)`.

Gist: the consumer's markup keeps Foundation's element structure and carries no class. `ul[nfsAccordionMenu]` hosts `NfsMenu` with the five Menu inputs, so `orientation="vertical"` replaces `class="vertical menu"`; submenus are bare `ul[nfsSubmenu]`; a section open at first paint is `[expanded]="true"`; the current page is `aria-current` only, styled by `nfs-menu`, with a new 1.4.1 check of the fill against `$accordionmenu-item-background`; the Hybrid name sits in `span[nfsSubmenuToggleText]`; every ratio uses the exact WCAG formula. Behaviour, ARIA, keyboard, animation, rendering modes, and Story ids are otherwise unchanged. Nothing is `OPEN FOR HUMAN`; no prototype is needed.

### Grilling record

Round 1 (the frontier: the Nested menu re-run's contract, ADR 0041, ADR 0042, and building-blocks 1.4 settle every prerequisite):
- Q1. Which classes did the published spec leave to the consumer? `vertical menu` on the root (Rendered HTML, usage and off-canvas examples); `menu vertical nested` on every submenu; `is-active` on a submenu as the pre-open seed (user story 10, the contract row, Rendered HTML, `accordion-menu--initially-open`, the SSR fixture, the fixture e2e, the Router note, Out of Scope, the "pre-open marker" example); `is-active` on a leaf `li` as the current page (`routerLinkActive="is-active"`, `accordion-menu--current-page`); the `.submenu-toggle-text` span; `.accordion-menu` ("a consumer may still write it"); `off-canvas position-left` on the panel in the off-canvas example. Source: the spec before this revision.
- Q2. Who binds `.menu` and the Menu Variants on the root? The hosted `NfsMenu`, exposing `orientation`, `expanded`, `simple`, `align`, and `iconPosition`; the root binds no `.menu`. Applied: ADR 0041 and contract item 1; an accordion root hosting it was measured in the Nested menu re-run's server render.
- Q3. Should the root default `orientation` to vertical, or bind `.vertical` itself in accordion mode? For: Foundation's docs always show `.vertical`. Against: the docs make it optional ("You probably also want it to be vertical, so add the class `.vertical` as well"); `_accordion-menu.scss` gives every `.accordion-menu li` `width: 100%`, so rows stack in either orientation; building-blocks 1.4 sets no class by default; a host binding would beat an explicit `orientation="horizontal"` and fight a ResponsiveMenu's rules object on the one shared `NfsMenu`. Settled: no default and no check; every example and story writes `orientation="vertical"` (D20).
- Q4. Submenus? `<ul nfsSubmenu>` with no class; `menu nested vertical` from `NfsSubmenu` in every mode. Applied: contract item 2.
- Q5. Initial state? `[expanded]="true"` (or `[(expanded)]` starting `true`) on the item; Foundation's pre-open `.is-active` becomes a Dropped behaviour, stripped and reported by the Nested menu naming `[expanded]`. Applied: contract item 3 and building-blocks 1.4 (D21). The root's own check (several siblings open with `multiOpen` off) now fires on bound values; D8 stands on its reason.
- Q6. Current page? `aria-current` on the link only; `routerLinkActive="is-active"` on a leaf `li` goes (a Foundation class as an input value, ADR 0039). Applied: contract item 4 and ADR 0042 (D22).
- Q7. The toggle name? `span[nfsSubmenuToggleText]`. Applied: contract item 5.

Round 2:
- Q8. Which background does the current link's fill sit against inside an accordion menu, and does the fill win? Foundation's `.accordion-menu a` sets `background: $accordionmenu-item-background` when set, specificity (0,1,1); `nfs-menu`'s `.menu a[aria-current]:where(...)` is (0,2,1), so the fill wins and the neighbour pair is the fill against the item background. Settled: the Nested menu's accordion 1.4.1 check applies as listed (contract item 6), with a WCAG row and a compile case (read from `_accordion-menu.scss` and `_menu.scss`; no probe needed for a specificity comparison).
- Q9. Is a copied `accordion-menu` reported? No. Standalone, the root's binding is always `true`, so the copy merges like a redundant Structural class (building-blocks 1.4); under a ResponsiveMenu it is stripped outside accordion mode, and whether that root reports copied root classes is the Responsive Menu re-run's call (D24; contract item 7).
- Q10. Router recipe for a Hybrid item's link? `RouterLinkActive` defaults to `{exact: false}`, a subset match (`router_link_active.ts:139`), so `routerLinkActive ariaCurrentWhenActive="page"` on `/guides` also marks it current on `/guides/theming`: two links with `aria-current="page"`. Settled: Hybrid links take `[routerLinkActiveOptions]="{exact: true}"` in every Router example (D23); the section's own open state keeps `isActive()`'s subset match (`url_tree.ts`, `paths: 'subset'` by default), because the section should be open on every page below it. Found while working it: the Nested menu's usage example has the same double mark (change 3a below).
- Q11. Which development checks does the page list? The root's own check; the Nested menu's copied-class, name, and span checks; the hosted Menu's check 1 on the root (a copied `vertical` names `orientation`). A copied leaf `is-active` is reported once, by the Nested menu's check: the item's map strips it before the Menu's check 2 reads the rendered list.
- Q12. How does the API table show the hosted inputs, and the `expanded` name collision? One row for the five host-directive inputs with the Menu spec's aliases; the root's `expanded` (the Menu's `.expanded`) and an item's `expanded` (open state) are named apart in the hierarchy bullets.
- Q13. Expose all five Menu inputs, though `expanded`, `simple`, and `iconPosition` do little on an accordion menu? Yes: contract item 1 and the consistency review's check want one list on every root, and under a ResponsiveMenu the element's one `NfsMenu` receives them anyway. `align` matters here: Foundation's `.accordion-menu.align-right` moves the arrows and the nested margin, and `nfs-accordion-menu` rule 2's button twins follow it.

Round 3:
- Q14. Tests and stories? Fixtures write no class; new browser-level cases for hosting and for Foundation's docs markup copied with its classes (the one case that writes them, and says so); `accordion-menu--initially-open` binds `[expanded]`; `accordion-menu--current-page` asserts the fill at 3:1 and no `is-active`; `accordion-menu--rtl` adds the `align="right"` arrow twin; controls are `button[nfsButton]`; the SSR smoke asserts `menu vertical accordion-menu` and `menu nested vertical`; Story ids unchanged.
- Q15. Rendering modes? The hosted Menu is host bindings with no listener, so the server HTML carries `.menu` and its Variants, `jsaction` stays `keydown` on the root, and no class is read before hydration except the development-only copied-class reads, whose warnings wait for the client.
- Q16. The off-canvas example? The panel's markup is the Off-canvas spec's; its position is not an Option (Foundation reads `.position-*`, `foundation.offcanvas.js:106`), so its re-run will name a Variant input. The example writes `position="left"`, the name building-blocks 1.4 rule 3 gives (the dimension Foundation's Sass uses, `off-canvas-position`), marked as pending that re-run.
- Q17. Does the new 1.4.1 compile case name its check? On Foundation's defaults `$menu-item-background-active` and `$accordionmenu-arrow-color` are both `$primary-color`, so a `$primary-color` item background fails the arrow check on the same pair. Settled: the accordion case sets `$accordionmenu-arrows: false`, which leaves only the 1.4.1 check (the Hybrid toggle's arrow is checked against the item background only through the toggle background, `null` here). The Nested menu's three 1.4.1 cases have the same ambiguity (change 3b below).
- Q18. Which luminance function (the orchestrator's relay of the Top Bar finding)? The exact WCAG formula through the library's internal `math.pow` helper for every ratio, including the new fill check; Foundation's `color-luminance()` leaves the reused functions. A compile case with the Top Bar's measured false pass (`#116666` on `#0a0a0a`) proves the mixin calls the helper.
- Q19. Glossary or ADR? No new term: **Current link**, **Hybrid item**, **Open path**, and **Menu** already cover the vocabulary. No new ADR: hosting is ADR 0041, the current page ADR 0042, the initial state building-blocks 1.4, the exact formula the Top Bar's proposed ADR 0022 note; D20, D23, and D24 are reversible defaults.

The frontier is empty.

### Decisions

1. `NfsAccordionMenu` hosts `NfsMenu` with `inputs: ['orientation', 'expanded', 'simple', 'align', 'iconPosition']` and binds no `.menu` itself; `orientation="vertical"` replaces `class="vertical menu"` (D19).
2. No default orientation and no orientation check (D20).
3. Submenus are `<ul nfsSubmenu>` with no class; the class mapping table has a Kind column and rows for the hosted Menu, the Nest and State classes, `.submenu-toggle`, `span[nfsSubmenuToggleText]`, `.menu-text`, and the `data-nfs-*` attributes.
4. A section open at first paint is its item's bound `expanded`; Foundation's pre-open `.is-active` is a Dropped behaviour, stripped and reported (D21); several siblings bound open with `multiOpen` off stay open and warn (D8, reworded).
5. The current page is `aria-current` on its link only, styled by `nfs-menu`; `nfs-accordion-menu` stops the compile when `$menu-item-background-active` is under 3:1 against a non-`null` `$accordionmenu-item-background` (D22).
6. A Hybrid item's link uses `[routerLinkActiveOptions]="{exact: true}"` in every Router example (D23).
7. The Hybrid toggle's name is `span[nfsSubmenuToggleText]` (D5 reworded).
8. A copied `accordion-menu` is not reported by this root (D24).
9. Development checks: the root's own check plus the Nested menu's and the hosted Menu's, listed; the root adds none.
10. Every ratio is the exact WCAG formula through the library's internal `math.pow` helper, compared unrounded; no quoted ratio moves (4.65:1 was already exact); new compile cases for the helper and the 1.4.1 check.
11. Stories, fixtures, and examples write no class; controls are `button[nfsButton]`; the off-canvas example writes `position="left"` pending the Off-canvas re-run.

### Measurements

No Angular probe: every mechanism is the Nested menu re-run's, measured there on an accordion root. One computation, `D:/tmp/nfs-wave-112/ratios.mjs` (not committed; the exact WCAG formula in Node): `#1779ba` on `#fefefe` 4.6473:1 (so the spec's 4.65:1 for `$anchor-color`, `$accordionmenu-arrow-color`, and `$menu-item-background-active` on `$body-background` is exact, where the Menu and Nested menu specs quote Foundation's 4.59:1); `#fefefe` on `#1779ba` 4.6473:1 and `#0a0a0a` on `#1779ba` 4.2240:1 (the current text `color-pick-contrast()` picks); `#116666` on `#0a0a0a` 2.9379:1 (the Top Bar's measured false pass, 3.006:1 through Foundation's function); for the Menu spec's grey test cases, `#0a0a0a` on `#787878` 4.4842:1, on `#8a8a8a` 5.7349:1, `#fefefe` on `#8a8a8a` 3.4230:1, and `#f0f0f0` on `#fefefe` 1.1300:1, all unchanged from the figures that spec quotes. Nothing was left running.

### Triage

| Decision | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| 1: the root hosts `NfsMenu`; `orientation="vertical"` | HIGH: consumer markup of every Accordion Menu | HIGH: ADR 0041; the Nested menu re-run's contract and server-render probe on an accordion root | Decided |
| 2: no default orientation, no check | LOW: a default can be added later without breaking markup | HIGH: Foundation's docs make `.vertical` optional; `.accordion-menu li { width: 100% }` read in the Sass; building-blocks 1.4 | Decided |
| 3: bare submenus; Kind column | MEDIUM: consumer markup | HIGH: contract items 2 and 7 | Decided |
| 4: `[expanded]` replaces the pre-open class | HIGH: the initial-state contract | HIGH: building-blocks 1.4; the Nested menu's D29 | Decided |
| 5: `aria-current` only; the 1.4.1 fill check | MEDIUM: a new compile stop for a set item background | HIGH: ADR 0042; the specificity read from Foundation's Sass; Foundation's defaults pass (the check is skipped while the setting is `null`) | Decided |
| 6: `exact` on Hybrid links | LOW: documentation | HIGH: `RouterLinkActive`'s default read in the Angular 22.2 source | Decided |
| 7: `span[nfsSubmenuToggleText]` | MEDIUM: consumer markup | HIGH: contract item 5; ADR 0039 | Decided |
| 8: no report for a copied `accordion-menu` | LOW | HIGH: building-blocks 1.4's redundant-class rule | Decided |
| 9, 11: checks listed; examples and tests | LOW | HIGH | Decided |
| 10: exact luminance | LOW here: no quoted ratio moves | HIGH: the Top Bar's measured false passes; recomputed here | Decided |

No item is HIGH impact with NOT-HIGH confidence, so nothing is `OPEN FOR HUMAN`, and no prototype is needed: the only new facts (a CSS specificity comparison, the Router's default match, and four ratios) were read or computed here.

### Proposed shared-file changes (for the orchestrator)

Paths are relative to the effort root; links inside each quoted text are relative to the file it goes into.

1. `building-blocks.md` Table A, the AccordionMenu row: replace the row with

   > | AccordionMenu | `ul[nfsAccordionMenu]` (menu root, mode `accordion`; hosts `NfsMenu` exposing `orientation`, `expanded`, `simple`, `align`, `iconPosition`); Nested menu set: `li[nfsMenuItem]`, `ul[nfsSubmenu]`, `button[nfsSubmenuToggle]` (hybrid form, replaces `submenuToggle`), `span[nfsSubmenuToggleText]` | Directives on Foundation's nested menu markup, one per Structural class (1.1, [ADR 0039](adr/0039-directives-manage-every-foundation-class.md)) | Custom Angular (ADR 0004): disclosure navigation has no Aria directive; `ngTree` needs `ng-template` groups and `[parent]` inputs that break the nested-`ul` markup (`R:aria` 8) | Foundation's `foundation-accordion-menu` Sass for layout; `hostDirectives` with `NfsMenu` for `.menu` and its Variants ([ADR 0041](adr/0041-menu-plugin-roots-host-menu-directive.md)); documented custom CSS only for the height animation Foundation's Sass lacks: grid-row auto-height on the parent `li` (`nfsMenuItem`, rows `auto 0fr` to `auto 1fr`) keyed on the library attribute `data-nfs-expanded`, the clip released by `data-nfs-shown` once open, the submenu `ul` clipped (1.6 rule 3); `inert` on collapsed submenus, `_IdGenerator`, `Directionality` for the optional arrow keys; the current link's look from `aria-current` through `nfs-menu` ([ADR 0042](adr/0042-menu-current-page-aria-current.md)) | Disclosure Navigation Menu (hybrid variant when the parent is also a link) |

2. `building-blocks.md` Table B, the AccordionMenu row: in the DI cell, append "; the root hosts `NfsMenu`, which the Nested menu root reads with `{self: true}`"; in the Rendering-mode cell, replace "Nest classes as host classes (no runtime Feather)" with

   > Nest classes as host classes (no runtime Feather), the hosted Menu's `.menu` and Variant classes, and sections open at first paint from a bound `expanded` (no class is read)

3. `specs/nested-menu.md` (for the [Spec: Nested menu (shared utility)](56-spec-nested-menu.md); an amendment line in that ticket):

   a. Usage examples, the AccordionMenu consumer markup: replace `<a routerLink="/guides" routerLinkActive ariaCurrentWhenActive="page">Guides</a>` with

   > `<a routerLink="/guides" routerLinkActive [routerLinkActiveOptions]="{exact: true}" ariaCurrentWhenActive="page">Guides</a>`

   and add after that code block the sentence "A Hybrid item's link matches exactly, because `RouterLinkActive`'s default subset match would also mark it current on every page of its section." Without it, `/guides/theming` carries two links with `aria-current="page"`.

   b. Testing Decisions, the Sass compile bullet: after "stops its mixin naming the 1.4.1 check, and `null` backgrounds are skipped", insert

   > ; each mixin runs its 1.4.1 check before its arrow checks, because on Foundation's defaults `$menu-item-background-active` and every arrow colour are `$primary-color` (`$dropdownmenu-arrow-color` is `$anchor-color`), so a `$primary-color` background fails both and the case must still name the 1.4.1 check

   c. Exact luminance (the [Spec: Top Bar](86-spec-top-bar.md)'s correction, which does not list this spec): in the 1.4.1 row, replace "With defaults every pair is 4.59:1" with "With defaults every pair is 4.65:1"; in the 1.4.11 row, replace "computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded, is below 3 (Foundation's `color-contrast()` rounds to one decimal and would pass 2.95:1; building-blocks 1.10)" with "computed with the exact WCAG formula by the library's internal `math.pow` helper and compared unrounded, is below 3 (Foundation's `color-contrast()` rounds to one decimal, and its `color-luminance()` overstates some ratios; building-blocks 1.10)"; in the Sass Checks paragraph, replace "Ratios are computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded, as the Button spec does, because Foundation's `color-contrast()` rounds to one decimal and lets 2.95:1 pass a 3:1 threshold." with

   > Ratios are the exact WCAG relative-luminance formula, computed by the library's internal `math.pow` helper after compositing a translucent colour over `$body-background`, and compared unrounded, because Foundation's `color-contrast()` rounds to one decimal and lets 2.95:1 pass a 3:1 threshold and its `color-luminance()` passes pairs the exact formula fails ([Spec: Top Bar](../issues/86-spec-top-bar.md)).

   and in (2) Reused settings, remove `color-luminance` from the list.

4. `specs/menu.md` (for the [Spec: Menu](85-spec-menu.md), which the Top Bar's correction lists; the recomputed figures): in the WCAG preamble, replace "Contrast ratios are computed with Foundation 6.9.0's own `color-luminance()` from its default settings" with "Contrast ratios are computed with the exact WCAG formula (the library's internal `math.pow` helper) from Foundation 6.9.0's default settings", and "because Foundation's `color-contrast()` rounds to one decimal" with "because Foundation's `color-contrast()` rounds to one decimal and its `color-luminance()` overstates some ratios"; replace "Passes: 4.59:1" (1.4.1) with "Passes: 4.65:1", "Passes: 4.59:1 for the current link; `$anchor-color` on `$body-background` 4.59:1" (1.4.3) with "Passes: 4.65:1 for the current link; `$anchor-color` on `$body-background` 4.65:1", and, in the Sass Checks paragraph, "with ratios from Foundation's `color-luminance()` and the WCAG formula, compared unrounded" with "with ratios from the exact WCAG formula, compared unrounded" and "Measured over Foundation 6.9.0's defaults: 4.59:1, 4.59:1, and 38.4 px." with "Over Foundation 6.9.0's defaults: 4.65:1, 4.65:1, and 38.4 px (Foundation's `color-luminance()` gives 4.59:1)."; remove `color-luminance` from (2). The grey test figures (`#787878` 4.484:1, `#f0f0f0` 1.13:1, `#8a8a8a` 5.73:1 and 3.42:1) are unchanged under the exact formula (Measurements).

5. `map.md`, Decisions so far: the gist line below.

No change to `CONTEXT.md`, the ADRs, `README.md`, or `storybook-conventions.md`: the terms, ADRs 0041 and 0042, the README row, and the `nfs-menu` preview line (with the Nested menu re-run's change 11) already cover this spec.

### What other specs need from this one

- [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md): the Accordion Menu's off-canvas example and its `accordion-menu--off-canvas` story write the panel as `<div nfsOffCanvas #nav="nfsOffCanvas" position="left">`, assuming a `position` Variant input for Foundation's `.position-*` classes (building-blocks 1.4 rule 3; Foundation's Sass mixin `off-canvas-position`); if the re-run names it otherwise, the example follows (an orchestrator edit of one line); menus inside its panels are `ul[nfsAccordionMenu] orientation="vertical"` or `ul[nfsMenu] orientation="vertical"`.
- [Re-run: Responsive Menu spec under the class rule](115-rerun-responsive-menu-class-rule.md): whether a copied root class (`accordion-menu`, `drilldown`, `dropdown`) on a ResponsiveMenu root is reported is that spec's call (this spec's D24); its `hostDirectives` entry for `NfsAccordionMenu` keeps `inputs: ['multiOpen']` and lists no Menu input.
- [Re-run: Dropdown Menu spec under the class rule](113-rerun-dropdown-menu-class-rule.md) and [Re-run: Drilldown Menu spec under the class rule](114-rerun-drilldown-menu-class-rule.md): Hybrid links in Router examples take `{exact: true}` (D23), and their 1.4.1 compile cases must name the check they expect (change 3b), since their arrow colours equal the current fill on Foundation's defaults.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no menu spec's Router example leaves a Hybrid link on the default subset match; that every 1.4.1 compile case isolates its check; that the menu specs quote 4.65:1, not 4.59:1, for `$primary-color` on `$body-background`; and the contract checks of the Nested menu re-run (no example writes `menu`, `vertical`, `nested`, `is-active`, `align-*`, or `submenu-toggle-text`; every root exposes the five Menu inputs).
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the Accordion Menu declares no Variant input, registry, or property; the Menu spec's `uses` rows cover the root's five inputs.

### Gist for Decisions so far

- [Re-run: Accordion Menu spec under the class rule](issues/112-rerun-accordion-menu-class-rule.md) -- `ul[nfsAccordionMenu]` hosts `NfsMenu` with the five Menu inputs, so `orientation="vertical"` replaces `class="vertical menu"` (no default orientation: `.accordion-menu li { width: 100% }` stacks rows either way) and submenus are bare `ul[nfsSubmenu]`; a section open at first paint is `[expanded]="true"`, Foundation's pre-open `.is-active` a Dropped behaviour stripped and reported; the current page is `aria-current` only, styled by `nfs-menu`, whose fill `nfs-accordion-menu` checks against `$accordionmenu-item-background` (the fill's rule outranks Foundation's link background); Hybrid links match the Router exactly, so a section's link is not a second current page; the name sits in `span[nfsSubmenuToggleText]`; every ratio uses the exact WCAG formula, and none moves; impact HIGH, confidence HIGH. Spec: [specs/accordion-menu.md](specs/accordion-menu.md).
