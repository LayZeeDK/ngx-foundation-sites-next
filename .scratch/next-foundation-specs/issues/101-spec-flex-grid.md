# 101. Spec: Flex Grid

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Flex Grid to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/flex-grid.md` and its Sass is `scss/grid/_flex-grid.scss` in the 6.9.0 clone. Publish `specs/flex-grid.md`.

Known from the triage: Legacy since Foundation 6.4 and disabled by default (`flex-grid.md:33-34`): the user ruled that it gets its spec anyway; state what enabling it needs.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Worked AFK on Opus 5.5 (the map's AFK override: self-grilling, both sides, against Foundation 6.9.0's Sass and docs in the local clone, the bundle's ADRs and building-blocks rules, the [Spec: XY Grid](99-spec-xy-grid.md) and [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) as binding precedents, and measurements). Spec: [specs/flex-grid.md](../specs/flex-grid.md).

### Measurements

Throwaway scripts under `D:/tmp/nfs-wave-101/` (Playwright 1.63 and axe-core 4.13.0 and Dart Sass 1.104.1 read from the `nfs-ct-prototype` experiment, compiling Foundation 6.9.0 from the local clone; nothing started stays running, no junction was made):

- Enabling: the default `foundation-everything` prints no `.row` rule; with `$xy-grid: false` after the settings file it prints the Flex Grid, the flex utilities, and no `.grid-x`.
- Class families on the defaults: sizes 1 to 12, offsets 0 to 11, and `up` 1 to 8 for `small`, `medium`, `large`; `.medium-expand`, `.large-expand`, `.row.medium-unstack`, `.row.large-unstack` only above the Zero breakpoint; `.collapse`, and `.<bp>-collapse` and `.<bp>-uncollapse` for all three; `.shrink` only, unprefixed; `.expanded`, `.column-block`, `.is-collapse-child`; `.columns` through `@extend`. With `$grid-column-count: 16; $block-grid-max: 4; $breakpoint-classes: (small medium large xlarge)` the ranges follow and `xlarge` forms appear; with `$breakpoint-classes: (medium large)` the `small-` sizes and collapse classes still exist (the iterator always adds the Zero breakpoint). The Flex Grid's rules set no `order`, direction, position, overflow, or height.
- Source order and specificity, confirmed in three engines: `.shrink` comes after every size and expand rule, so `shrink medium-6` is 124 px wide at 1024 px; `small-6 large-expand` alone is 50 percent at 1280 px (expand sets no `max-width`); `.collapse medium-uncollapse` keeps 0 column padding at 1024 px, `.small-collapse medium-uncollapse` gets 15 px; `.row.medium-unstack > .small-6` is 50 percent below medium and a third at 1024 px.
- Column row: `.row.column` computes `display: block`, and two `small-6` columns inside it stack.
- Reflow at 320 CSS px: every Flex Grid docs example fits except "Vertical Alignment of child columns", whose last column overflows by 27 px and scrolls the page to 347 px (320 px once the row carries `medium-unstack`); four bare columns of single long words overflow by 17 to 64 px (page 358 px); a nested row in a `small-collapse` row sticks out 10 px each side (page 330 px), and `is-collapse-child` removes it; under `small-collapse medium-uncollapse` the same `is-collapse-child` row is inset 15 px more at 1280 px.
- The docs examples are axe-clean (WCAG 2.2 AA tags plus best-practice) at 320 and 1280 px in three engines.
- Nested rows in a plain or a `collapse` row stay flush with their parent column.
- `ul.row`: its `li` columns keep `display: list-item` and disc markers painted outside the column; the `ul` margin gives way to the row's auto margins.
- `hidden` on `.row` leaves `display: flex`; on `.column` it hides.
- `.column-block`: 20 px bottom margin, 30 px from medium; its last child's margin 0. Block-grid columns on one line are of equal height.
- A 1600 px image in an expanding column stays 370 px wide in its 400 px column (Foundation's `img { max-width: 100% }`), in three engines: the docs' Firefox 43 warning is obsolete.
- Collisions: compiled beside the XY Grid, a `.grid-y > .cell.small-6` is 400 of 800 px wide (the Flex Grid's unscoped `max-width: 50%`); compiled beside the Float Grid, a `.row.align-justify` of two `small-4` columns leaves 178 px empty at its end instead of 0.

### Grilling record

Round 1 (the frontier with no prerequisites):

- Q1. Which directives? One per class that names an element of the layout, `.row` and `.column`, as the XY Grid does. Against: a third for `.columns`. Rejected: it is an `@extend` alias of `.column`, so binding `.column` covers every rule.
- Q2. Same names as the Float Grid's (`NfsRow`, `NfsColumn`), or grid-prefixed (`NfsFlexGridRow`)? Same names, each in its grid's entry point. For prefixing: two exported classes with one name in one package, and a component that imported both would match both on one element. Against prefixing: building-blocks 1.3 names a directive after its class; Foundation calls the two grids' markup identical; one application compiles one legacy grid (measured collisions), so the names never meet in a program; a move between the legacy grids then changes only the import path while the compiler lists what differs; the Equalizer already writes `nfsRow` and `nfsColumn`. Decided for the same names; listed for the consistency review.
- Q3. Component or directive? Directives: Foundation generates nothing (ADR 0001).
- Q4. DI between rows and columns? None, as in the XY Grid: Foundation's child selectors carry the row's settings, and placement concerns are development reports that may read the DOM.
- Q5. ARIA role? None: a layout grid is not the APG Grid composite.

Round 2 (inputs, given Q1 to Q4):

- Q6. What does `size` take, given the Flex Grid's CSS? A count or `'expand'` per breakpoint, bare or in rules, and `'shrink'` only bare. Against: `'shrink'` per breakpoint, as the XY Grid's `size` has it. Rejected: Foundation prints no responsive shrink, and the one `.shrink` wins over every size (measured), so any combination is a lie the type should refuse. The Zero-breakpoint expand sets none: the bare column is the expand.
- Q7. How is collapse shaped? One `collapse` input: `true` sets `.collapse`, and Breakpoint rules of booleans set `.<bp>-collapse` (`true`) or `.<bp>-uncollapse` (`false`). Against: the XY Grid's `NfsVariantBoolean | NfsGridQuery`. Rejected: Foundation's collapse is on and off per breakpoint in both directions (its own example is `small-collapse medium-uncollapse`), and a query cannot say "until medium" without knowing the next Class breakpoint, which the running directive does not know. Against: `true` meaning `.small-collapse`, so that the bare value equals the Zero-breakpoint key as elsewhere. Rejected: `.collapse` is Foundation's class for that meaning and also handles nested rows (measured), and it cannot be uncollapsed (measured), so rules must start from `.small-collapse` anyway.
- Q8. `unstack`: boolean or query? A query only: there is no unprefixed class, and "unstacked at every width" is the row's default; the Zero breakpoint sets none.
- Q9. `.is-collapse-child`: automatic or an input? An input, `isCollapseChild`, plus a development check. Against: binding it from a parent token. Rejected: DI for a development-grade concern, a Hydration-boundary tie, and wrong under responsive collapse, where it adds a second gutter at the uncollapsed breakpoints (measured).
- Q10. `.column-block` is not on the Flex Grid docs page: include it? Yes, `columnBlock`: `foundation-flex-grid` prints it, and ADR 0039 leaves no Foundation class unhomed.
- Q11. The column row (`.row.column`)? Allowed as both directives on one element; its block layout (measured) is reported when columns are placed inside it.
- Q12. Type alias names? `NfsFlexGrid...`: the directive names are shared with the Float Grid, but the families differ (`expand`, `shrink`, `unstack`, `isCollapseChild` are the Flex Grid's), so one alias name for two unions would mislead.
- Q13. Strip or report copied classes? Report, as the XY Grid does: the class set depends on the consumer's counts and Class breakpoints.

Round 3 (accessibility, given Q6 to Q12):

- Q14. Bare columns never wrap, and Foundation's own align-self example fails 1.4.10 at 320 CSS px (measured). How is 1.4.10 met? A requirement (rows that cannot fit stack at the Zero breakpoint through `unstack` or a Zero-breakpoint `size`), every recipe and story following it, and a development `ResizeObserver` per row that reports a column whose content is wider than the column at the current viewport. Against: library CSS on `.column` (`overflow-wrap: break-word`, or `min-width: auto`). Rejected: the first breaks words into fragments inside a layout that does not fit and leaves images and tables overflowing; the second overrides Foundation's deliberate `min-width: 0` on every expanding column.
- Q15. The nested row that sticks out of a responsively collapsed parent (measured 10 px of page scroll)? `isCollapseChild` in the recipes and a development check in the same observer.
- Q16. Reading and focus order? Met by construction: no ordering rule in the Flex Grid's CSS (checked); `order` is the Flexbox Utilities' and so is its hazard.
- Q17. List rows? They keep list semantics and markers (measured); the Typography Helpers' `.no-bullet` directive removes the markers.

Round 4 (Sass, stories, rendering modes):

- Q18. What does enabling need, and what does the mixin do? `$xy-grid: false` before `foundation-everything`, or `foundation-flex-grid` by hand, never beside `foundation-grid` or `foundation-xy-grid-classes` (measured collisions). `nfs-flex-grid` is properties-only (`--nfs-grid-column-count`, `--nfs-block-grid-max`); the Float Grid's mixin writes the same two with the same values, under the exception for a setting no entry point owns.
- Q19. Can the library tell that the grid is not enabled? At runtime, yes, cheaply: a row whose computed `display` is neither `flex` nor `none` warns in development. At compile time, no: `nfs-flex-grid` cannot see which export mixins ran.
- Q20. Can the stories share the one preview stylesheet? No (measured collisions with both other grids). A second Storybook configuration with the Flex Grid compiled in place of the XY Grid. Against: scoping the Flex Grid's rules under a story wrapper class. Rejected: it changes specificity against the Flexbox Utilities' and other classes, and Foundation's `@extend` of `.columns` reaches every `.column` rule of the stylesheet, so the stories would no longer show a consumer's compile.
- Q21. A fixture-app route for the JavaScript-disabled first paint? No: nothing interactive, the SSR smoke asserts the server HTML, and the fixture app compiles the XY Grid.
- Q22. Rendering modes? Host bindings only, identical on server and client; no listener, no `jsaction`; rows and columns cross Hydration boundaries and stay laid out in `hydrate never`.
- Q23. `nfsFlexAlign` and `nfsFlexChild` beside or hosted? Beside, for the XY Grid's reason (its D15).

Nothing was left unsettled; the frontier is empty.

### Decisions

1. Two attribute directives in `ngx-foundation-sites/flex-grid`, each a static host class on any element: `[nfsRow]` (`.row`) and `[nfsColumn]` (`.column`); `.columns` is never bound; no template, token, provider, host directive, Defaults token, model, output, method, or `exportAs`. The class names and selectors are the Float Grid's too, each grid in its own entry point.
2. `NfsColumn`: `size` (`NfsFlexGridColumnSizeInput`: a count 1 to `$grid-column-count` or `'expand'`, bare for the Zero breakpoint or in Breakpoint rules, or the bare `'shrink'`), `offset` (`NfsFlexGridOffsetInput`, 0 to `$grid-column-count` minus 1), `columnBlock` (boolean). No `size` is Foundation's expanding column; `'expand'` at the Zero breakpoint sets none.
3. `NfsRow`: `expanded` (boolean); `up` (`NfsFlexGridUpInput`, 1 to `$block-grid-max`); `collapse` (`true` sets `.collapse`; Breakpoint rules of booleans set `.<bp>-collapse` and `.<bp>-uncollapse`); `unstack` (`NfsFlexGridQuery`, a Breakpoint query with `up` and no boolean; the Zero breakpoint sets none); `isCollapseChild` (boolean).
4. Exported aliases `NfsFlexGridColumn`, `NfsFlexGridColumnSize`, `NfsFlexGridColumnSizeValue`, `NfsFlexGridColumnSizeInput`, `NfsFlexGridOffset`, `NfsFlexGridOffsetValue`, `NfsFlexGridOffsetInput`, `NfsFlexGridUp`, `NfsFlexGridUpValue`, `NfsFlexGridUpInput`, `NfsFlexGridCollapse`, `NfsFlexGridCollapseInput`, `NfsFlexGridQuery`, named in every input's type arguments; the registries are `NfsGridColumnCountOverrides`, `NfsBlockGridMaxOverrides`, and `NfsBreakpointClassesOverrides`, shared with the Float Grid.
5. One `computed` class list per directive through `[class]`; copied Foundation classes are reported in development, not stripped.
6. A column row is `nfsRow` and `nfsColumn` on one element (Foundation's `display: block` content block).
7. Development checks: copied classes on both directives (the Flexbox Utilities' classes named with their directive); a row with no Flex Grid CSS; a column outside a row or inside a column row; a size in an unstacking row; and, from one development `ResizeObserver` per row, a column whose content overflows it at the current viewport (1.4.10) and a nested row that sticks out of a collapsed parent.
8. Runtime check: `NfsColumn` and `NfsRow` report through `nfsVariantCheck`, calling `include('nfs-flex-grid', ...)` and `include('nfs-breakpoint-properties', ['breakpoint-classes'])` only while a value that reads them is bound; the Zero breakpoint needs no `breakpoint-classes` name, because Foundation's iterator always adds it.
9. `nfs-flex-grid` is a properties-only Library mixin writing `--nfs-grid-column-count` and `--nfs-block-grid-max`, the same properties with the same values as the Float Grid's mixin; no library CSS. Enabling is `$xy-grid: false` before `foundation-everything` or `foundation-flex-grid` by hand, never beside the Float Grid's or the XY Grid's export mixin.
10. No ARIA role; reading and focus order follow the DOM by construction; ordering and alignment are the Flexbox Utilities' `nfsFlexAlign` and `nfsFlexChild`, written beside, never hosted.
11. Implementation level: native platform (Foundation's flexbox CSS); Aria's Grid is the wrong pattern and CDK adds nothing.
12. Stories run in a Storybook configuration of their own whose preview stylesheet compiles the Flex Grid in place of the XY Grid and without the Float Grid; story ids `flex-grid--basics`, `--advanced-sizing`, `--responsive`, `--automatic-stacking`, `--alignment`, `--collapse`, `--nesting`, `--offsets`, `--block-grid`, `--expanded`; e2e only for breakpoint geometry, reflow at 320 CSS px in every story, and text spacing; no fixture-app route.

### Triage

- Overall: impact HIGH (the `NfsRow` and `NfsColumn` names and the inputs shared with the Float Grid are public API that the Equalizer spec already writes, and the count typings freeze a contract); confidence HIGH (building-blocks 1.3 and 1.4 applied mechanically, ADR 0040's typing, and every CSS claim measured in three engines). Decided with the applied defaults; nothing is OPEN FOR HUMAN.
- The shared class names across two entry points (decision 1): impact HIGH (two specs' public API), confidence HIGH (the class-name rule, identical markup, measured mutual exclusion of the two grids' CSS); the consistency review confirms it against the Float Grid spec, which is written in the same wave.
- The collapse shape (decision 3): impact MEDIUM, confidence HIGH (measured specificity; each rules key maps to one class).
- The second Storybook configuration (decision 12): impact MEDIUM (test infrastructure built once in the new repository), confidence HIGH (measured collisions with both other grids; the alternative changes what the stories measure).
- The overflow and nested-row checks (decision 7): impact LOW, confidence HIGH (measured failures in Foundation's own example).
- No prototype is needed: every open point was measured by this ticket.

### Placeholders in published specs

| Placeholder | Specs that use it | Final name | Need met? |
| --- | --- | --- | --- |
| `NfsRow` (`[nfsRow]`) and `NfsColumn` (`[nfsColumn]`) with `size` rules (`[size]="{medium: 6}"`) | [Spec: Equalizer](../specs/equalizer.md) (class mapping, names paragraph, Rendered HTML, stories, SSR smoke, usage), as the Float Grid's placeholders | The Flex Grid uses the same `NfsRow`, `NfsColumn`, and `size` in its own entry point; the Equalizer's float-grid residue stays the [Spec: Float Grid](100-spec-float-grid.md)'s to name | Yes for the Flex Grid; nothing to change in the Equalizer from this spec |
| "the legacy Flex Grid's row" beside `nfsFlexAlign` (user story 7) and "the Flex Grid's row or column" as a possible host of `NfsFlexAlign` or `NfsFlexChild` (Hierarchy) | [Spec: Flexbox Utilities](../specs/flexbox-utilities.md) | `nfsRow` and `nfsColumn`, with `nfsFlexAlign` and `nfsFlexChild` written beside them (not hosted) | Yes: the beside form its D8 allows |

No other published spec names a Flex Grid directive. Needs the API does not meet: none.

### Proposed shared-file changes

1. `building-blocks.md` Table D, the Flex Grid row: replace the empty cells with

   > | Flex Grid (legacy) | `docs/pages/flex-grid.md` | [Spec: Flex Grid](issues/101-spec-flex-grid.md) | `[nfsRow]` (`.row`; `expanded`; `up` over `NfsBlockGridMaxOverrides`; `collapse`, `true` for `.collapse` or Breakpoint rules of booleans for `.<bp>-collapse` and `.<bp>-uncollapse`; `unstack` from a Class breakpoint; `isCollapseChild`); `[nfsColumn]` (`.column`, never `.columns`; `size` over `NfsGridColumnCountOverrides`, a count or `'expand'` per breakpoint or the bare `'shrink'`; `offset`; `columnBlock`); a column row is both on one element; the same class names and selectors as the Float Grid's, in `ngx-foundation-sites/flex-grid`; the Flexbox Utilities, Visibility Classes, and Equalizer directives are written beside them | Directives, one per class that names an element of the layout (ADR 0001, ADR 0039); nothing is generated | Native platform: Foundation's flexbox CSS; Aria's Grid is the APG Grid composite, not a layout, and CDK adds nothing | A static host class and one `computed` class list per directive (copied classes reported, not stripped); `nfsBreakpointsToken` for the Zero-breakpoint gaps; development checks in render callbacks (copied classes, a row without the Flex Grid's CSS, placement, a size in an unstacking row) and a development `ResizeObserver` per row (a column that overflows at the current viewport, a nested row that sticks out of a collapsed parent); the Runtime checks; `nfs-flex-grid`, properties-only (`--nfs-grid-column-count`, `--nfs-block-grid-max`, also written by the Float Grid's mixin) | None; the consumer's elements carry the meaning |

2. `building-blocks.md` 1.3, after the XY Grid's proposed layout-system clause ("a layout system's directives are named after the classes that name elements of its layout ..."), append:

   > ; the two legacy grids bind the same classes on the same markup, so the Float Grid's and the Flex Grid's directives share the names `NfsRow` (`[nfsRow]`) and `NfsColumn` (`[nfsColumn]`), each in its grid's entry point, while their type aliases carry the grid's name (`NfsFlexGridColumnSize`), because their families differ ([Spec: Flex Grid](issues/101-spec-flex-grid.md), D1, D7)

3. `building-blocks.md` 1.13, the Variant properties bullet: replace "A setting that no entry point owns is the one exception:" with "A setting that no entry point owns is the exception:" and after "so both write `--nfs-foundation-palette` with the same value." insert:

   > The legacy grids' shared settings are the second case: the Float Grid's and the Flex Grid's Library mixins both write `--nfs-grid-column-count` and `--nfs-block-grid-max`, because `$grid-column-count` and `$block-grid-max` belong to neither grid alone and an application compiles one of them ([Spec: Flex Grid](issues/101-spec-flex-grid.md), D12).

   And a dated note on [ADR 0040](../adr/0040-variant-input-types.md):

   > - 2026-09-28 ([Spec: Flex Grid](../issues/101-spec-flex-grid.md)): the exception for a setting no entry point owns also covers `$grid-column-count` and `$block-grid-max`, which the Float Grid's and the Flex Grid's mixins both write with the same values; one application compiles only one legacy grid, because their classes collide (measured).

4. `CONTEXT.md`, under Foundation side, after the XY Grid's proposed **Cell** and **Block grid** entries:

   > **Row**:
   > An element of a legacy grid (the Float Grid or the Flex Grid), marked by `.row`, that holds Columns and carries the settings they share, such as a block grid count or collapsed gutters.
   > _Avoid_: grid (bare), line, container
   >
   > **Column**:
   > An element of a legacy grid's Row, marked by `.column`, whose size and offset per breakpoint are set on it; in the Flex Grid a Column without a size expands into the space its Row leaves.
   > _Avoid_: cell (the XY Grid's word), col, grid item
   >
   > **Column row**:
   > An element that is both a Row and a Column, which Foundation draws as a centred, padded block for content rather than a Row of Columns.
   > _Avoid_: single-column row, row column

   And in the XY Grid's proposed **Block grid** entry, replace "A grid whose cells share each row equally from a per-breakpoint count set on the grid (Foundation's `.<bp>-up-<n>`), rather than from each cell's own size." with "A grid whose Cells or Columns share each row equally from a per-breakpoint count set on the grid or Row (Foundation's `.<bp>-up-<n>`), rather than from each one's own size."

5. [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): in the "Known `mixins` today" bullet, after the XY Grid's proposed sentence, add "`nfs-flex-grid` writes `--nfs-grid-column-count` and `--nfs-block-grid-max`, as the Float Grid's mixin does (the shared-setting exception)."; the `mixins` of the `$grid-column-count` and `$block-grid-max` manifest rows hold both legacy grid mixins. Manifest `uses` entries, all with entry point `ngx-foundation-sites/flex-grid`: `NfsGridColumnCountOverrides` <- `NfsColumn.size` (`NfsFlexGridColumnSizeInput`, `count`) and `NfsColumn.offset` (`NfsFlexGridOffsetInput`, `count`); `NfsBlockGridMaxOverrides` <- `NfsRow.up` (`NfsFlexGridUpInput`, `count`); `NfsBreakpointClassesOverrides` <- `NfsColumn.size`, `NfsColumn.offset`, `NfsRow.up`, `NfsRow.collapse` (`NfsFlexGridCollapseInput`, `rules`), and `NfsRow.unstack` (`NfsFlexGridQuery`, `query`). The entries' `entryPoint` keeps them apart from the Float Grid's `NfsColumn` and `NfsRow`.

6. `storybook-conventions.md`:
   - Section 3, Title: add a group for layout systems, `Layout systems/<Foundation docs name>` (`Layout systems/XY Grid`, `Layout systems/Flex Grid`), aligned by the consistency review with the Flexbox Utilities' `Utilities/` group.
   - Section 5, after the paragraph under the `preview.scss` listing, add:

     > - One exception to one stylesheet (2026-09-28, [Spec: Flex Grid](issues/101-spec-flex-grid.md)): the legacy Flex Grid cannot share a compile with the XY Grid or the Float Grid (measured: beside the Float Grid a justified row leaves 178 px empty at its end; beside the XY Grid a vertical grid's `small-6` cell is half as wide as its grid). Its stories run in a second Storybook configuration of the library, `<lib>/.storybook-flex-grid/`, whose `preview.scss` is this one with `@include foundation-everything($prototype: true, $xy-grid: false);` in place of line (3), without the `foundation-grid` line, and with `@include nfs-flex-grid;` among the Library mixins; its `preview.ts` re-exports the shared preview configuration; its `stories` glob holds only the Flex Grid's stories, which the main configuration's glob excludes; it has its own `storybookTest` project in the Vitest configuration, its own static build on port 4411, and its own e2e project whose `baseURL` points there.

7. Map, Decisions so far:

   > - [Spec: Flex Grid](issues/101-spec-flex-grid.md) -- two listener-free directives in `flex-grid`, `nfsRow` (`.row`; `expanded`, `up`, `collapse` as the bare `.collapse` or Breakpoint rules of booleans for `.<bp>-collapse` and `.<bp>-uncollapse`, `unstack` from a Class breakpoint, `isCollapseChild`) and `nfsColumn` (`.column`, never `.columns`; `size` as a count or `expand` per breakpoint or the bare `shrink`, `offset`, `columnBlock`), sharing their class names and selectors with the Float Grid's in their own entry point; counts closed over `$grid-column-count` and `$block-grid-max`; enabling is `$xy-grid: false` before `foundation-everything`, never beside the other grids (measured: beside the Float Grid a justified row leaves 178 px empty, beside the XY Grid vertical cells halve), so its stories get a Storybook configuration of their own; development checks report copied classes, a row without the grid's CSS, misplaced columns, and, from a `ResizeObserver` per row, a column that overflows at the current viewport (measured: Foundation's own align-self example scrolls the page to 347 px at 320 CSS px) and a nested row that sticks out of a collapsed parent; no DI, no ARIA role, no library CSS (`nfs-flex-grid` writes two Variant properties); impact HIGH, confidence HIGH; no ADR. Spec: [specs/flex-grid.md](specs/flex-grid.md).

No ADR: the decisions follow ADR 0039, ADR 0040, and building-blocks rules; the shared names are building-blocks 1.3 applied, and the second Storybook configuration is a convention change forced by a measured collision, not a trade-off between live options.

### Shared-name decisions for the consistency review (with the [Spec: Float Grid](100-spec-float-grid.md))

- Directive classes and selectors: `NfsRow` (`[nfsRow]`) and `NfsColumn` (`[nfsColumn]`) in both legacy grids, each in its grid's entry point (`ngx-foundation-sites/float-grid`, `ngx-foundation-sites/flex-grid`). If the Float Grid spec chose other names, the review picks one pair for both; the Flex Grid follows.
- `.column` is bound and `.columns` never, in both grids (the Float Grid's alias can even be renamed or removed through `$grid-column-alias`).
- Inputs whose families the two grids share, with the same names and shapes: `size` (counts per breakpoint; the Flex Grid adds `'expand'` and the bare `'shrink'`), `offset` (0 to `$grid-column-count` minus 1), `up` (1 to `$block-grid-max`), `expanded`, `columnBlock`, and `collapse` (the Float Grid's `.collapse`, `.<bp>-collapse`, and `.<bp>-uncollapse` have the same specificity relation, so the same shape fits: `true` for `.collapse`, Breakpoint rules of booleans for the responsive pair).
- Flex-Grid-only inputs: `unstack`, `isCollapseChild`; Float-Grid-only families (push, pull, centering, `.end`, `.gutter-<bp>`) are not in the Flex Grid's CSS.
- Type aliases carry the grid's name (`NfsFlexGrid...` here), because the families' value sets differ.
- Registries shared: `NfsGridColumnCountOverrides` and `NfsBlockGridMaxOverrides`; both mixins write `--nfs-grid-column-count` and `--nfs-block-grid-max` (proposal 3).
- Glossary: **Row**, **Column**, **Column row** (proposal 4) serve both grids.
- Same-element input names (the XY Grid's proposed building-blocks 1.9 rule): `NfsRow` and `NfsColumn` declare no input in common, so a column row compiles; `size` and `expanded` collide with the Callout, Button, Close Button, Dropdown pane, Button Group, and Menu, so those nest.

### For other specs

- [Spec: Float Grid](100-spec-float-grid.md): the shared-name list above; its preview stylesheet line stays in the main Storybook configuration, and the Flex Grid's stories leave it.
- [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md): nothing new; `nfsFlexAlign` beside `nfsRow` and `nfsFlexChild` beside `nfsColumn`, not hosted; its not-a-Flex-parent check rightly reports `nfsFlexAlign` on a column row (`display: block`).
- [Spec: Typography Helpers](106-spec-typography-helpers.md): a `ul` row needs its `.no-bullet` directive beside `nfsRow` (measured: markers stay).
- [Spec: Visibility Classes](104-spec-visibility-classes.md): `hidden` does not hide a `.row` (measured), so its directive, a Toggler, or `@if` hides one.
- [Spec: Equalizer](34-spec-equalizer.md): nothing asked; Flex Grid columns in one line stretch to equal height (measured), so its CSS answer covers them.
- [Storybook conventions for the new library](58-storybook-conventions.md): proposal 6.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): the shared-name decisions above; the title group for layout systems; the second Storybook configuration.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): eleven Out of Scope items and the rejected alternatives of D1 to D17, each with a category; none is excluded for being CSS-only, and no Foundation class is left for the consumer.

### Gist for Decisions so far

Proposal 7 above.
