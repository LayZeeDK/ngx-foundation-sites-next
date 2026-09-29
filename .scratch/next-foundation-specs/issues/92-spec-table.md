# 92. Spec: Table

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Table to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/table.md` and its Sass is `scss/components/_table.scss` in the 6.9.0 clone. Publish `specs/table.md`.

Known from the triage: Foundation styles the bare `table` element, so the class rule reaches its Variants (`.hover`, `.unstriped`, `.stack`) and the `.table-scroll` wrapper, which needs a focusable named region (axe `scrollable-region-focusable`); `.stack` hides `thead` by default, a header loss the spec settles (prototype if needed).

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/table.md](../specs/table.md).

### Measurements made for this ticket

The header-loss question and the scroll forms needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-92/`, not committed; no server, no port, no junction; modules read in place from the earlier `D:/tmp/nfs-ct-prototype/` install, nothing written there). Foundation 6.9.0 Sass from the local clone, compiled with Dart Sass 1.104.1; Playwright 1.63 with Chromium 153, Firefox 155, and WebKit 26.6; axe-core 4.13.0 with the six WCAG 2.2 AA tags; read-only Windows UI Automation from PowerShell 7. Every ratio uses the exact WCAG relative-luminance formula (`math.pow`), unrounded (building-blocks 1.10).

- E1, Sass and ratios (`e1-sass.mjs`, `ratios.scss`). Foundation's stack rules compile to `@media print, screen and (max-width: 63.99875em)`: `thead` and `tfoot` `display: none`, `tr`, `th`, `td` `display: block`; with `$show-header-for-stacked: true` the `thead` rule becomes `thead th { display: block }` and `tfoot` stays hidden; `.unstriped` exists only under `$table-is-striped: true` and `.striped` only under `false`. Text on every table background 16.78:1 to 19.63:1. `$anchor-color` `#1779ba`: table background 4.647, row hover 4.448, striped 4.161, striped hover 3.973, head 4.400, head hover 4.207, foot 4.161, foot hover 3.975; `$anchor-color-hover` 5.06 and up. With the Callout's `$anchor-color: scale-color($primary-color, $lightness: -15%)`: links 5.148 to 6.023, hover 6.381 to 7.464. Stripes and borders 1.117:1 against the page.
- E2, axe in three engines (`e2-axe.mjs`): Foundation's docs examples verbatim. `scrollable-region-focusable` on the `.table-scroll` wrapper and on `table.scroll` at 375 CSS px in all three; nothing on the default stacked table (whose headers are gone); `color-contrast` 4.14 on a link in a striped row on Foundation's defaults, none with the Callout's colour. Candidate markup: a wrapper with `tabindex="0"`, `role="region"`, and `aria-labelledby` at the caption has no violation; the same without a name has none either (axe checks no region name); `table.scroll` with `tabindex="0"` has none; two regions with one name give `landmark-unique` (best-practice). The only incomplete result is the caption inside a scrolled region ("partially obscured"). `document.documentElement.scrollWidth` is 375 at 375 CSS px in every case.
- E3, Chromium's accessibility tree through CDP (in `e2-axe.mjs`): the default stacked table is a `table` with 3 rows, 12 cells, and no `columnheader`; with the candidate settings it has 5 rows and 4 `columnheader`s and is named "Cookies"; the named wrapper is `region "Words for frameworks"`, focusable; `table.scroll` with `tabindex="0"` stays `table`, named by its caption, focusable.
- E4, Windows UI Automation (`uia-serve.mjs`, `uia.ps1`, `uia-dump.ps1`), headed windows at 375 CSS px: Chromium and Firefox both expose Foundation's default stacked table as a Table of 2 rows with no column headers, and with `$show-header-for-stacked: true` plus the footer rule as a Table of 4 rows with the column headers "Cookies, Taste, Calories, Overall" (Firefox named them on the second read, after its accessibility engine had started). `table.scroll` with `tabindex="0"` is a Table, keyboard focusable, 4 rows, 4 named headers, in both.
- E5, keyboard and focus (`e2b-incomplete.mjs`): in three engines one Tab focuses the named region (UA outline `auto`, 1 px in Chromium and Firefox, 3 px in WebKit) and one Right Arrow moves `scrollLeft` from 0 to 40, 35, and 40 px.
- E6, geometry (`e5-scroll-width.mjs`): a two-column table at 1280 CSS px under `table.scroll` has 64 px rows in a 1280 px table box in three engines; in the wrapper form its rows are 1279 px.
- E7, the candidate `nfs-table` mixin (`nfs-table.scss`, `e4-mixin.mjs`, `e6-pin.mjs`): over Foundation's defaults one `@error` naming `$show-header-for-stacked` and the seven link pairs; with the header setting alone the seven link pairs; with the required settings exactly `@media print, screen and (max-width: 63.99875em) { table.stack tfoot { display: table-footer-group; } }`; `$table-stack-breakpoint: small` gives `(max-width: 39.99875em)`; `$table-stripe: none` drops the striped pairs; `$table-head-background: #777777` fails the head text at 4.42 and the link colours at 1.36 and 1.68; `#1177dd` on `#0a0a0a` fails at 4.44 (the Top Bar's measured pair, 4.51 by Foundation's function). An override after Foundation's settings file leaves the derived `$table-head-row-hover` at the old colour.
- Sources read: Foundation's table docs page and Sass; the APG Table pattern ("not an interactive widget", "Keyboard Interaction: Not applicable", the label rule); WAI-ARIA `region` ("Authors MUST give each element with role region a brief label"; landmarks once named); axe-core 4.13.0's rule tags (`scrollable-region-focusable` `wcag2a`/`wcag211`; `td-has-header` and `table-fake-caption` experimental; `landmark-unique`, `table-duplicate-name`, `scope-attr-valid` best-practice); Angular Material 22.2's table docs (explicit roles; "Always provide an accessible label") and `CdkTable` source (host roles); current WebKit source (`AXTableHelpers.cpp`, read-only through `gh api`: a table's accessibility starts from the DOM `HTMLTableElement`); Adrian Roselli's "Tables, CSS Display Properties, and ARIA" and "It's Mid-2022 and Browsers (Mostly Safari) Still Break Accessibility via Display Properties" (updated 2026: table semantics under `display: block` rows and cells work in Chrome and Firefox and, from Safari 17, in Safari; WebKit bug 257458, resolved fixed), and "Under-Engineered Responsive Tables" (the `role="region"`, `aria-labelledby` at the caption, `tabindex="0"` wrapper; `role` on the table itself breaks it), all fetched through markdown.new.

### Grilling record

Round 1 (nothing settled yet).

- Q1, which elements get directives, and any component. The table takes Variant classes, so it gets a directive for them (ADR 0039, dated note); `.table-scroll` is a Structural class; `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th`, and `td` have no class. A component would re-render markup the consumer writes (ADR 0001). Settled: `table[nfsTable]` and `div[nfsTableScroll]`, restricted to `div` because `role="region"` would replace a `table`'s or `figure`'s role (decision 1).
- Q2, the Variant types. Every family is closed. The stripe pair could be one enum (building-blocks 1.4 rule 3: mutually exclusive names from one setting) or two booleans (rule 4). [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md)'s answer lists `unstriped` among the rule-4 booleans, and the two classes never exist in one compile, so each is that compile's single on or off class; an enum would also need a dimension name Foundation does not use. Settled: five booleans through `nfsVariantBoolean`, `[class.<name>]` bindings that strip copied classes (decision 2).
- Q3, is `nfsTable` required on every table? It exists for the Variant classes; Foundation styles `table` by tag. Settled: optional; the plain tables in the Breakpoint service and Interchange specs stay correct (decision 3).
- Q4, the wrapper's ARIA. axe's `scrollable-region-focusable` (measured, E2) needs focus; a focus stop needs a role and a name (4.1.2); `region` is the form WAI-ARIA and published practice give it. Name options: inputs; a name the directive derives from the caption (needs an id written after hydration, so the server HTML is unnamed); the consumer's `aria-labelledby` at the caption with a development check. Settled: static `role` and `tabindex`, the consumer's name, a development check, because axe checks none (measured) (decisions 4, 9).

Round 2 (Q1 to Q4 settled).

- Q5, a Variant property for the stripe pair. Building-blocks 1.13 gives a flag-gated family its own property so the Runtime check reports a class the compile lacks. Here the class the compile lacks names the look the table already has (E1: each setting generates exactly one of the two), so a report would only flag a redundant binding. Settled: no property, no Runtime check, a development warning when both are set, and an exception proposed for building-blocks 1.13 (decision 5).
- Q6, `.scroll` on the table. Options: drop it for the wrapper; keep it with `tabindex`; keep it with `role="region"` on the table. Measured (E3, E4): `display: block` on the table keeps the Table role, headers, and focus in Chromium and Firefox; current WebKit source builds tables from the DOM element; `role="region"` on a table replaces its role (Roselli). The rows shrink to their content (E6). Settled: keep, bind `tabindex="0"`, name from the caption, recommend the wrapper (decision 6).
- Q7, the stacked table's header loss. Measured (E3, E4): on Foundation's defaults the stacked table is two rows with no column headers in two platform trees, and axe reports nothing (E2). Options: (a) require Foundation's `$show-header-for-stacked: true`; (b) a library rule that shows the header; (c) per-cell labels through generated content; (d) drop `stack`; (e) a development warning only. For (d): the header list pairs values with headers by position only. Against (d): Foundation's own setting keeps every header in the tree and on screen, and table semantics survive `display: block` in the Browser target, so no information is lost (1.3.1, 1.4.10). Against (b): it re-implements Foundation's setting. Against (c): not a Foundation feature, read twice by screen readers where semantics survive, and CSS alternative text is outside the Browser target. Against (e): a warning keeps no footer. The footer has no setting: Foundation always hides it (and a hidden row group is the case of WebKit bug 275366, which Roselli filed in 2024). Settled: (a) at compile time plus one rule that keeps the footer, and a recipe with a row header first in each row (decision 7).
- Q8, a focus stop only while overflowing. It needs an observer, changes the tab order under focus, and the server HTML could not know; an extra tab stop fails no criterion. Settled: always (decision 10).

Round 3 (Q5 to Q8 settled).

- Q9, contrast. Measured (E1, E2): text passes everywhere; links fail on seven of eight backgrounds; axe sees only rendered rows, never a hover state. Options: a table-scoped link colour rule (a second link colour on the site); the Callout's required `$anchor-color`, which passes every table pair. Settled: one `@error` over text and links on every rendered background, stripes only while `$table-stripe` is `even` or `odd`, and the Callout's colour as the required setting (decision 11).
- Q10, 1.4.11. The stripes and borders are 1.12:1, but the header cells, the alignment, and the text carry the data; the focus indicator is the browser's unmodified one (measured visible, E5). Settled: no graphic check, no library focus style (decision 13).
- Q11, how a missing `nfs-table` include surfaces, since no Variant property exists. Settled: a development check that a `stack` table's `thead` or `tfoot` computes `display: none`, which fires only in a render below the breakpoint; the e2e layer covers the narrow viewport (decision 8).
- Q12, the name check's reach. The APG Table pattern labels every table and Material's docs require it; a `scroll` table is a focus stop (4.1.2). Settled: every `nfsTable` host and every scroll region, at the first render (decision 9).
- Q13, copied classes. Settled: the Button's D22 warning, naming the inputs; the copied classes are stripped by the bindings (decision 12).

Round 4 (Q9 to Q13 settled).

- Q14, implementation level. Aria's grid is a composite widget the APG reserves for interactive tabular widgets; `CdkTable` renders from data and writes explicit roles, which the Browser target does not need (E3, E4, published). Settled: native, listener-free, no explicit roles (decision 14).
- Q15, rendering modes, stories, and seams. Everything is a host binding or a static attribute in server HTML, so the Scroll region is keyboard-reachable before hydration and in `hydrate never`; viewport widths and real key presses need e2e; WebKit's platform tree cannot be read on the test platform. Settled: six stories, e2e in three engines, the fixture app with JavaScript disabled, and a manual VoiceOver release test (decision 15).
- Q16, vocabulary. Settled: **Table**, **Stacked table**, **Scroll region** (decision 16).
- Q17, placeholders in published specs (the brief). Searched `specs/` for `nfsTable`, `NfsTable`, `table-scroll`, `nfs-table`, and the ticket's title and path: no placeholder exists. Two specs write a plain `<table>` (the Breakpoint service's demo tables and the Interchange spec's `httpResource` example); both stay correct under decision 3.

The frontier is empty.

### Decisions

1. Two attribute directives in the entry point `ngx-foundation-sites/table`: `NfsTable` (`table[nfsTable]`, no Structural class, named after Foundation's `table` mixin) and `NfsTableScroll` (`div[nfsTableScroll]`, binds `.table-scroll`). No component, no token, no host directives, no Defaults token; the two directives share no DI.
2. `NfsTable`'s five boolean Variant inputs `hover`, `unstriped`, `striped`, `stack`, and `scroll`, each `InputSignalWithTransform<boolean, NfsVariantBoolean>` through `nfsVariantBoolean`, default `false`, setting its class through a `[class.<name>]` host binding, so a copied class is stripped.
3. `nfsTable` is optional on a table with no Variant; a plain `<table>` is Foundation's Table.
4. `NfsTableScroll` binds static `class="table-scroll"`, `role="region"`, and `tabindex="0"`; the consumer names it with `aria-labelledby` at the table's caption or `aria-label`; no name input. It is the same Scroll region contract as the XY Grid's cell blocks ([Spec: XY Grid](99-spec-xy-grid.md), D8), with static attributes because the wrapper is always a scrolling `div` with no role of its own.
5. The stripe pair has no Variant property and no Runtime check: under either `$table-is-striped` value the missing class names the look the table already has. Both set warns in development.
6. `scroll` also binds `tabindex="0"` (else `null`); the table keeps its native role and its caption name. The docs recommend the wrapper, whose rows keep the full width.
7. `nfs-table` stops the compile unless `$show-header-for-stacked: true` and emits `table.stack tfoot { display: table-footer-group; }` inside `breakpoint($table-stack-breakpoint down)`. The stacked recipe puts a row header first in each row.
8. `NfsTable` warns in development when a `stack` table's `thead` or `tfoot` computes `display: none`, naming the setting or the include.
9. Development name checks, once, at the first render: `NfsTable` from `aria-labelledby`, `aria-label`, the caption, or `title`; `NfsTableScroll` from `aria-labelledby`, `aria-label`, or `title`.
10. Every Scroll region is a focus stop whether or not its content overflows.
11. `nfs-table` stops the compile with one `@error` listing every pair under 4.5:1 of body text, header and footer text, `$anchor-color`, and `$anchor-color-hover` on the eight table backgrounds (the striped two only while `$table-stripe` is `even` or `odd`), by the exact helper. Required on Foundation's defaults: `$show-header-for-stacked: true;` and the Callout's `$anchor-color` and `$anchor-color-hover` lines. `nfs-table` writes no Variant property.
12. A development warning for `hover`, `unstriped`, `striped`, `stack`, or `scroll` copied into the table's static class list, naming each input.
13. No 1.4.11 check on stripes or borders, and no library focus style.
14. Native implementation level: no Aria, no CDK, no listener, no explicit table roles.
15. Story ids `table--basics`, `--hover`, `--stripes`, `--stacked`, `--scroll`, `--scroll-table`; e2e in three engines for the stacked layout at 375 and 1280 CSS px, keyboard scrolling, reflow at 320 CSS px, and focus visibility; the fixture app's first paint with JavaScript disabled (keyboard scrolling included) and hydration; a manual screen-reader release test with VoiceOver on Safari for the stacked headers.
16. Three glossary terms: **Table**, **Stacked table**, **Scroll region** (below).

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| The directive set, selectors, and input names (decisions 1 to 4, 6) | MEDIUM (public names; the XY Grid's scrolling cells may follow the Scroll region) | HIGH (mechanical under ADR 0001, ADR 0039, ADR 0040, building-blocks 1.3 and 1.4; axe and the platform trees measured in E2 to E5) | Decided |
| The stacked table's required setting and footer rule (decision 7) | MEDIUM (one required consumer setting; dropping the requirement or adding labels later touches no consumer markup) | HIGH (measured in two platform trees; Foundation's own setting; published Safari 17 data). Residual: the listed headers pair with values by position only, which the row-header recipe eases | Decided; dissent recorded |
| No Variant property for the stripe pair (decision 5) | LOW (a development report that would name only a redundant binding) | HIGH (E1: each setting generates exactly one of the classes) | Decided; routed to building-blocks 1.13 |
| `scroll` in WebKit (decision 6) | LOW (the wrapper is the recommended form; the input is additive) | HIGH for Chromium and Firefox (measured); WebKit from its current source, with `display: block` on the table element unmeasured in Safari 17 itself, covered by the manual release test | Decided |
| Contrast check and required link colour (decision 11) | MEDIUM (a site-wide link colour, already required by the Callout) | HIGH (exact formula; axe confirms 4.14) | Decided |
| Always-on focus stop, name checks, copied classes, header/footer check, no 1.4.11 check, implementation level, stories, vocabulary (decisions 8 to 10, 12 to 16) | LOW | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here. The screen-reader announcements are a manual release test, as ADR 0022's dated consequence has it.

Dissent recorded: dropping `stack` because the listed headers pair with values only by position (decision 7); per-cell labels through generated content (Out of Scope); one enum input for the stripe pair (decision 2); dropping `scroll` for the wrapper (decision 6); a focus stop only while the content overflows (decision 10); name inputs on the wrapper (decision 4).

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Table row: fill the empty cells.

   "| Table | `docs/pages/table.md` | [Spec: Table](issues/92-spec-table.md) | `table[nfsTable]` (`NfsTable`: no Structural class, since Foundation styles `table` by tag; boolean Variant inputs `hover`, `unstriped`, `striped`, `stack`, and `scroll`, which also binds `tabindex="0"`; optional on a table with no Variant); `div[nfsTableScroll]` (`NfsTableScroll`: binds `.table-scroll`, `role="region"`, and `tabindex="0"`, named by the consumer's `aria-labelledby` at the caption or `aria-label`) | Directives: `.table-scroll` is a Structural class on a consumer-written wrapper, native `<table>` takes Variant classes ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md), dated note), and Foundation generates nothing | Native platform: the HTML table's own semantics, CSS overflow, `tabindex`, and an ARIA `region`; Aria's grid is an interactive widget a static table is not, and CDK's `CdkTable` renders rows from data, which the consumer's template does | Five `[class.<name>]` bindings over `nfsVariantBoolean` inputs; static host attributes; development checks in render callbacks (a missing table or region name, a stacked table whose header or footer computes `display: none`, both stripe inputs, copied classes); `nfs-table` (a stacked table keeps its footer; compile-time checks: `$show-header-for-stacked: true` required, text and links at 4.5:1 on every table background); no Variant property | Table (APG; not interactive); a named `region` around a table that scrolls |"

2. `building-blocks.md` 1.10, two new bullets after the Label bullet (the last component bullet today). The first is one text for the XY Grid's and the Table's scroll containers, and replaces the "Scroll regions" bullet the [Spec: XY Grid](99-spec-xy-grid.md) Answer proposes (its proposal 2, which asks to be reconciled with this spec); the second is the Table's own.

   (a) "- Scroll regions (2026-09-28, [Spec: XY Grid](issues/99-spec-xy-grid.md), [Spec: Table](issues/92-spec-table.md)): a component's scroll container (the XY Grid's cell blocks, the Table's `.table-scroll` wrapper and `scroll` table) is a Scroll region, a tab stop with a role and the consumer's name in the server HTML, whether or not its content overflows, so it works before hydration and in `hydrate never`. Measured: without the tab stop axe reports `scrollable-region-focusable` (2.1.1) on Foundation's Grid Frame cell blocks, on its `.table-scroll` wrapper, and on its `.scroll` table in Chromium, Firefox, and WebKit, WebKit's Tab never reaches the cells, and axe checks no region name. A `div` becomes a `region`: the XY Grid's cell blocks bind `tabindex="0"` while the cell is a cell block at any breakpoint, echoing a static `tabindex`, and `role="region"` on a `div` without a static `role`, leaving a host's own landmark role alone; `div[nfsTableScroll]`, always a scrolling `div` with no role of its own, carries `role="region"` and `tabindex="0"` as static host attributes. A table that scrolls itself (`nfsTable`'s `scroll`) takes `tabindex="0"` and keeps its native table role and its caption's name, because `role="region"` would replace the table's role (measured through Windows UI Automation in Chromium and Firefox: the `display: block` table stays a Table with its headers). The consumer names a `region` with `aria-labelledby`, at the table's caption or a heading, or with `aria-label`, and a development check reports an unnamed Scroll region. Chromium focuses a scroller without one only in releases after the Browser target's Chrome 119, and Safari does not. The Prototyping Utilities' overflow directives, which may sit on any element, an Aria-hosted one with its own `tabindex` included, bind none and warn instead ([Spec: Prototyping Utilities](issues/102-spec-prototyping-utilities.md), D13)."

   (b) "- Table ([Spec: Table](issues/92-spec-table.md)): Foundation's stacked table hides its `thead` and `tfoot` below `$table-stack-breakpoint` (measured through Windows UI Automation in Chromium and Firefox: two rows and no column headers, which axe does not report), so `nfs-table` stops the compile unless `$show-header-for-stacked: true` and keeps the footer with one rule (`table.stack tfoot { display: table-footer-group; }` in Foundation's stack media query). It also stops the compile when text or a link is under 4.5:1 on any table background: Foundation's links reach only 3.97:1 to 4.45:1 on seven of the eight, so the consumer sets the Callout's `$anchor-color`."

   Where the Table differs from the XY Grid, and why: the wrapper uses static host attributes rather than bindings, because `div[nfsTableScroll]` is always a `div` and always scrolls, so there is no role to leave alone and no breakpoint at which it stops scrolling; and the `scroll` table keeps its table role. The two specs cite different Chromium versions for focusing scrollers on its own (Chrome 132 in the XY Grid's text, "before 130" in the [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md)); the merged text names none, since only "after Chrome 119" matters to the Browser target, and the consistency review can settle the number.

3. `building-blocks.md` 1.10, the Names bullet, append (a wording fix the consistency review should check against the Reveal, Orbit, and Tabs specs):

   "On an element the consumer writes, the name is the consumer's own `aria-labelledby` or `aria-label` attribute, checked in development, and the directive declares no name input ([Spec: Progress Bar](issues/95-spec-progress-bar.md), D12; [Spec: Table](issues/92-spec-table.md), D4); a name input exists where the consumer cannot reach the named element (Responsive Accordion Tabs' `label` and `labelledBy`)."

4. `building-blocks.md` 1.13, the Variant properties bullet: replace "A family that a Sass flag gates gets a Variant property of its own, written as the empty list (whitespace only) while the flag is off and read only by the runtime checks, and `nfs-breakpoint-properties` also writes `--nfs-breakpoint-classes`." with:

   "A family that a Sass flag gates gets a Variant property of its own, written as the empty list (whitespace only) while the flag is off and read only by the runtime checks; a flag that only chooses which of two opposite classes exists, where the absent class's look is already the default, needs none (the Table's `striped` and `unstriped` under `$table-is-striped`, [Spec: Table](issues/92-spec-table.md), D5). `nfs-breakpoint-properties` also writes `--nfs-breakpoint-classes`."

5. `CONTEXT.md`, Foundation side, after **Progress meter**:

   ```markdown
   **Table**:
   Foundation's CSS-only component for tabular data: the native `table` element, which Foundation styles by tag, with Variant classes for row hover, stripes, stacking, and scrolling, and a scroll wrapper marked by the `.table-scroll` Structural class; a static structure, distinct from an ARIA grid, which is an interactive widget.
   _Avoid_: data table (for the component), grid, datagrid

   **Stacked table**:
   A Table shown with one block per row below Foundation's stack breakpoint, with its column headers listed above the rows and its footer kept; distinct from a table in a Scroll region, which keeps its columns.
   _Avoid_: responsive table, mobile table, card table
   ```

6. `CONTEXT.md`, Angular side, after **Visible value**:

   ```markdown
   **Scroll region**:
   An element whose content scrolls inside it and that the keyboard can focus, with a role and an accessible name, such as a Table's scroll wrapper, a table that scrolls itself, or an XY Grid Cell block; distinct from a scroll container in general, which the keyboard may not reach.
   _Avoid_: scroll container (bare), scroller, overflow wrapper
   ```

   If the XY Grid's **Cell block** term lands, its last clause "which the library makes a named region with a tab stop" can read "which the library makes a Scroll region".

7. `README.md`, the table of CSS-only components, after the Progress Bar row:

   "| Table (CSS-only component) | [specs/table.md](specs/table.md) | Native platform (the HTML table, CSS overflow, `tabindex`, an ARIA `region`); two listener-free directives | No inventory: Foundation's Table docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Table row) | None needed; keyboard scrolling, the stacked table's platform semantics, and contrast measured in [Spec: Table](issues/92-spec-table.md) |"

8. `storybook-conventions.md`, section 5:
   - The `_settings-overrides.scss` block, after the Progress Bar's lines:

     ```scss
     // 1.3.1 and 1.4.10 (no axe rule): Foundation's stacked table hides its column headers below
     // $table-stack-breakpoint (two rows and no column headers in the Chromium and Firefox platform trees),
     // and nfs-table stops the compile. Spec: Table, table--stacked.
     $show-header-for-stacked: true;
     ```

   - The Callout's comment above `$anchor-color`, which now ends "...and Spec: Card, card--divider, whose divider link is 3.755:1 on $light-gray without it.": replace that last "." with "; and Spec: Table, table--stripes, whose links are 3.97:1 to 4.45:1 on seven table backgrounds (axe reports 4.14 on a striped row)."
   - The `preview.scss` block: after `@include nfs-progress-bar; ...` add `@include nfs-table; // Table: the stacked footer and the table contrast checks; every table--* story`.

9. `map.md`, Decisions so far: the gist at the end of this Answer.

No new ADR: every decision here is reversible without touching shipped consumer markup (the required setting can be lifted, labels or a conditional focus stop added), and the one departure from a shared rule, the stripe pair without a Variant property, is recorded in building-blocks 1.13 (proposal 4).

### What other specs need from this one

- [Spec: XY Grid](99-spec-xy-grid.md) (resolved in this wave): its D8 cell blocks already follow the same contract (a tab stop and, on a `div` without a role, `role="region"` in the server HTML at every width, named by the consumer, with a development name check), so nothing in it changes; proposal 2 (a) is the one "Scroll regions" bullet for both, in place of its own proposal 2, and proposal 6 lets its **Cell block** term point at **Scroll region**. If both specs want one implementation of the name check, it can become a library-internal helper; neither spec requires it.
- [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md) (resolved in this wave): its overflow utilities bind no `tabindex` and warn instead (its D13), because a utility can sit on an Aria-hosted element with a `tabindex` of its own; the Table's directives bind it, because their hosts are always a scrolling `div` or a scrolling `table` no other library directive hosts. No change; the merged 1.10 bullet names that difference in its last sentence.
- [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md) and [Spec: Interchange](35-spec-interchange.md): their plain `<table>` examples stay correct (decision 3); no change. Their tables would meet the APG label rule with a `<caption>`, which the consistency review may add.
- [Spec: Callout](89-spec-callout.md): nothing to change; `nfs-table` checks the same `$anchor-color` the Callout requires, and proposal 8 extends its Storybook comment.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): nothing; the Table declares no registry and adds no manifest entry. Its typings check sees five `NfsVariantBoolean` write types on `NfsTable`.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec writes `.hover`, `.unstriped`, `.striped`, `.stack`, `.scroll`, or `.table-scroll`; that the building-blocks 1.10 Names wording (proposal 3) matches every spec; that the 1.13 exception (proposal 4) is worded the same wherever the flag-gated rule is restated; and that the Storybook overrides carry `$show-header-for-stacked: true`.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): nine Out of Scope items and the rejected alternatives in D1 to D16, each with a category (`scope-boundary`, `platform-or-a11y`, `variant-as-class`, `jquery-or-dom-plumbing`, `other`).

### Gist for Decisions so far

- [Spec: Table](issues/92-spec-table.md) -- two listener-free directives in `table`: `table[nfsTable]` sets the Variant classes from five `nfsVariantBoolean` inputs (`hover`, `unstriped`, `striped`, `stack`, `scroll`; optional on a plain table), and `div[nfsTableScroll]` binds `.table-scroll` with `role="region"` and `tabindex="0"`, named by the consumer's `aria-labelledby` at the caption; `scroll` also binds `tabindex="0"`, and the table keeps its role and caption name (measured through Windows UI Automation in Chromium and Firefox); axe reports `scrollable-region-focusable` on both of Foundation's scroll forms in three engines and checks no region name, so both directives check names in development; Foundation's stacked table drops its column headers and footer for everyone (two rows, no headers, unreported by axe), so `nfs-table` requires `$show-header-for-stacked: true`, keeps the footer with one rule, and checks text and links at 4.5:1 on every table background, which on Foundation's defaults asks for the Callout's `$anchor-color` (links 3.97 to 4.45:1 on seven of eight); the stripe pair needs no Variant property, because a missing class never changes the look; impact MEDIUM, confidence HIGH; no ADR. Spec: [specs/table.md](specs/table.md).

### Amendment, 2026-09-29 (in-family check lines)

[Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md), from item R4 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), adds the Table's In-family checks under Hierarchy and DI shape by the rule of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) ([ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md)): `NfsTableScroll` calls `nfsDirectiveCheck('NfsTableScroll', {children: ['NfsTable']})` and probes an `nfsTable` inside it, so a forgotten `NfsTable` in a wrapper is reported; `NfsTable` calls `nfsDirectiveCheck('NfsTable')` and probes nothing; neither has a parent check or a peer; `strictParents` changes nothing. The entry point imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` for the call alone, and the DI bullet notes that only the wrapper's development check names `NfsTable`. The two directives still share no DI; no other decision changes.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group e, applying [its decisions](../research/consistency-review-decisions.md) and the review's checks CR-A to CR-D; `specs/table.md` was revised in place, and [the group's report](../research/consistency-review-group-e.md) lists every edit.

- R74: `NfsTable`'s development check 1 and `NfsTableScroll`'s name check count an image's non-blank `alt`, or the non-blank `aria-label` of an element with `role="img"`, as text (building-blocks 1.10, Names); the browser-level cases gain a caption that holds only an image with alt text, which is silent.
- Unchanged (confirmed): R4 (the exact helper; figures stand), R13, R27, R73 (the spec quotes no grey); CR-A, CR-C, and CR-D hold.

Triage: impact LOW (development checks only), confidence HIGH. Nothing is OPEN FOR HUMAN.
