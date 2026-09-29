# 100. Spec: Float Grid

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Float Grid to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/grid.md` and its Sass is `scss/grid/` in the 6.9.0 clone. Publish `specs/float-grid.md`.

Known from the triage: Legacy since Foundation 6.4 and disabled by default (`grid.md:20-22`): the user ruled that it gets its spec anyway; state what enabling it needs.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Worked AFK on Opus 5.5 (the map's AFK override: self-grilling, both sides, against Foundation 6.9.0's Sass and docs in the local clone, the bundle's ADRs and building-blocks rules, the [Spec: XY Grid](99-spec-xy-grid.md) and [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) as the binding precedents, the [Spec: Flex Grid](101-spec-flex-grid.md) once it resolved mid-ticket, Angular Material 22.2's grid list, and measurements). Spec: [specs/float-grid.md](../specs/float-grid.md).

### Measurements

Throwaway scripts under `D:/tmp/nfs-wave-100/` (Dart Sass 1.104.1 compiling Foundation 6.9.0 from the local clone; Playwright 1.63.0 read from the `nfs-ct-prototype` experiment; nothing started stays running, no junction was made):

- Compiled class families on the defaults: sizes 1 to 12, offsets 0 to 11, push and pull 0 to 11 (0 is the reset), and `up` 1 to 8 for `small`, `medium`, `large`; `.collapse`, `.<bp>-collapse`, `.<bp>-uncollapse`; `.<bp>-centered` and `.<bp>-uncentered` with no unprefixed `.centered`; `.gutter-small` and `.gutter-medium`; `.end`, `.expanded`, `.column-block`, `.columns`; no `.column-row` although `foundation-grid` declares a `$column-row` parameter. `$grid-column-gutter: 30px` generates no `.gutter-*`; a third gutter key adds `.gutter-xlarge`; `$grid-column-align-edge: false` removes `.end`; `$grid-column-alias: false` removes `.columns`; with `$grid-column-count: 16; $block-grid-max: 4; $breakpoint-classes: (small medium large xlarge)` the ranges follow; with `$breakpoint-classes: (medium large)` the `small-` classes still exist (every family adds the Zero breakpoint).
- The docs' enabling sentence taken literally (`$xy-grid: false; $global-flexbox: false;` with `@include foundation-everything;`) compiles the Flex Grid (`.row { display: flex }`, no `.small-push-2`). Foundation's float build (`foundation-everything($flex: false)`) has no `.grid-x` and no `.flex-container`. `foundation-grid` under Flexbox mode on and off differs only in `flex-basis: 0; order: 1` on the clearfix pseudo-elements.
- Classes the Float Grid shares with `foundation-everything`: every size, offset, and `up` class (the XY Grid's), `.collapse` (the Reveal's `.reveal.collapse`), `.column` (the Reveal's `.reveal .column`), `.expanded` (Button, Button Group, Menu, all scoped).
- Three engines (Chromium, Firefox, WebKit), float build: the Basics widths match Foundation's at 400, 800, and 1100 px; three `medium-3` columns leave a 200 px gap before the last at 800 px (275 at 1100) and 0 with `.end`; Foundation's first push and pull row shows B, A while Tab reaches A, then B, at all three widths; at 320 by 640 px Foundation's nesting, collapse, expanded, and block grid examples keep `documentElement.scrollWidth` at 320; a row nested in a `.collapse` row overhangs its column by 10 px, in a `.small-collapse` row by 0; an unpaired `small-push-6` beside a `small-6` makes the page 480 px wide at 320 px, and an unpaired `small-pull-3` covers its neighbour by 80 px.
- Clearfix probe: a row's computed `::after` `content` is `" "` on the float build and beside the XY Grid, `none` on the Flex Grid compile and on Foundation's default compile; a column row's is `" "` too.
- Both grids in one compile, default counts, a 300 px wide container: with `foundation-grid` after `foundation-everything`, a `.grid-y > .cell.small-6` is 150 px wide; with `foundation-grid` first, 300 px; horizontal XY cells are 150 px in both orders. With `$grid-columns: 16`, `small-offset-2` is 50 px on an XY cell when the Float Grid comes last (37.5 expected) and 37.5 px on a float column when the XY Grid comes last (50 expected).
- A `dir="rtl"` region inside a left-to-right compile keeps the first DOM column at the left; a right-to-left compile puts it at the right. `hidden` gives a row and a column `display: none`. A `ul.row` keeps `list-style: disc` and loses its indent (margin-left 0), so at 400 px the first item's marker is outside the viewport and the second's shows (screenshot).
- The compiled Float Grid sets no `height`, `max-height`, `overflow`, or absolute or fixed position.

### Grilling record

Round 1 (the frontier with no prerequisites):

- Q1. Which directives? One per class that names an element of the layout, `.row` and `.column` (ADR 0039, the XY Grid's rule for layout systems). Against: a component pair, Material's grid list shape. Rejected: Foundation's markup carries the elements (ADR 0001).
- Q2. Same names as the Flex Grid's, or grid-prefixed? Same: `NfsRow` (`[nfsRow]`) and `NfsColumn` (`[nfsColumn]`), each in its grid's entry point. For prefixing: two exported classes of one name in one package, and a component that imports both matches both on one element. Against prefixing: building-blocks 1.3 names a directive after its class; Foundation's markup for the two grids is identical and one stylesheet holds one of them (Foundation's docs: they "don't play nice together"; measured by the Flex Grid ticket); the Equalizer already writes these names. The Flex Grid spec, resolved mid-ticket, decided the same; its alias prefix (`NfsFlexGrid...`) is adopted here as `NfsFloatGrid...` (Q26).
- Q3. `.column` or `.columns`? `.column`: Foundation always generates it; `.columns` is an `@extend` alias for grammar that `$grid-column-alias` may remove. A copied `columns` is reported.
- Q4. DI between rows and columns? None: Foundation's selectors carry the row's settings to its columns, and placement concerns are development reports that may read the DOM (building-blocks 1.9).
- Q5. ARIA role? None: a layout is not the APG Grid composite.
- Q6. What does enabling need? `foundation-grid` in the stylesheet and `nfs-float-grid` after it. Three ways, measured: Foundation's float build, per-component includes, or beside the XY Grid with `foundation-grid` first and equal column counts; the docs' sentence under `foundation-everything` yields the Flex Grid; never beside the Flex Grid.

Round 2 (inputs, given Q1 to Q4):

- Q7. Names and types per family? By building-blocks 1.4: `size`, `offset`, `push`, `pull`, `up` (rule 3, counts), `gutter` (rule 3, the gutter map's keys), `expanded`, `end`, `columnBlock` (rule 4), `collapse` and `centered` (families with an on and an off class per breakpoint). The shared ones match the XY Grid's and the Flex Grid's names.
- Q8. `collapse`'s shape? `true` sets `.collapse`; Breakpoint rules of booleans set `.<bp>-collapse` or `.<bp>-uncollapse`; never both. Against: the XY Grid's query form. Rejected: a query cannot say "collapsed below large". Against: `true` meaning `.small-collapse`. Rejected: `.collapse` is Foundation's documented class and differs for nested rows (measured 10 px against 0), so both must stay reachable; `.<bp>-uncollapse` cannot undo `.collapse` (specificity), so one shape per row prevents the combination that silently fails. The Flex Grid decided the same shape.
- Q9. `centered`? The same shape as `collapse`; `true` fills the Zero-breakpoint gap with `.small-centered`, from `nfsBreakpointsToken`.
- Q10. Offer push and pull? Yes (ADR 0039 gives every class an input and passes the ordering hazard to the grid specs), over the offset range with `0` as Foundation's reset, carrying the Flexbox Utilities' requirement and a check (Q14). Against: one signed `shift` input. Rejected: not Foundation's vocabulary.
- Q11. `gutter`'s type? A new registry, `NfsGridColumnGutterOverrides`, over `$grid-column-gutter`'s keys (`small`, `medium`), because those keys are their own list, not `$breakpoint-classes`; a static gutter writes an empty property and the generated file accepts no name.
- Q12. `end`, `expanded`, `columnBlock`? Booleans after their classes; `end` exists only while `$grid-column-align-edge` is on, which is the only time it is needed.
- Q13. Strip copied classes? No, report them (the Button's, Callout's, and XY Grid's rule): the class set depends on the consumer's settings.

Round 3 (accessibility and checks, given Q7 to Q13):

- Q14. Reading and focus order? A requirement plus a development check, as the Flexbox Utilities decided for order classes. Push and pull move boxes sideways within a line, so the visual order is the columns' geometry: lines by top edge, then by start edge (from the right under `direction: rtl`). Measured: shown B, A, focused A, B in three engines.
- Q15. Can push or pull break 1.4.10 or cover content? Yes when unpaired (measured: page 480 px wide at 320, 80 px covered). Decided: pairing is a requirement, and the same geometry pass reports a column that leaves its row or overlaps a neighbour.
- Q16. How to catch a stylesheet without the Float Grid? The row's clearfix (`::after` `content`), once per realm. Against: the column's `float`. Rejected: a centred column and a column row are `float: none` by design. Against: the Runtime check. Rejected: the counts can come from the Flex Grid's mixin and prove nothing about `foundation-grid`.
- Q17. Placement checks? A column outside a row; a sized column row inside another row (Foundation's own callout).
- Q18. A page with both the XY Grid and the Float Grid? A requirement (`foundation-grid` first, equal counts), no check: neither mixin knows whether the other grid's classes compiled, since `$xy-grid` stays `true` in the settings even on the float build. The Storybook preview line moves before `foundation-everything` (proposed change 6).
- Q19. Flexbox Utilities on float rows? Not applicable: a float row is not a Flex parent; the Flexbox Utilities' own check reports `nfsFlexAlign` there.
- Q20. Right to left? Physical per compile; a `dir="rtl"` region inside a left-to-right compile is out of scope, documented with the right-to-left compile as the answer.

Round 4 (Sass, Runtime check, rendering modes, stories):

- Q21. Library mixin? `nfs-float-grid`, properties-only: `--nfs-grid-column-count`, `--nfs-block-grid-max` (also written by `nfs-flex-grid`, the exception for a setting no entry point owns), and `--nfs-grid-column-gutter` (only here, empty under a static gutter).
- Q22. Runtime check calls? `include()` only while a value that reads a property is bound, naming the never-empty counts; `gutter` asks for `block-grid-max` to prove the include and reports its key through `value()`; Zero-breakpoint values need no `breakpoint-classes` name. A missing `nfs-float-grid` is reported only while the Flex Grid's mixin is missing too (the Progress Bar's case).
- Q23. Foundation's class-name parameters? Unsupported (Out of Scope, `other`): the mixin cannot read another mixin's arguments, and the renames served hand-written markup.
- Q24. Rendering modes? Host bindings only, the same on server and client; no listener, no `jsaction`; any Hydration boundary; `hydrate never` keeps the layout.
- Q25. Which stylesheet do the stories use? The main Storybook preview, with `foundation-grid` first and Foundation's equal counts (the "beside the XY Grid" way); `foundation-grid`'s layout rules are the same on the float build (compiled and compared), and the Sass compile test covers the float build. The Flex Grid's stories run in their own configuration (its D16).
- Q26 (raised when the [Spec: Flex Grid](101-spec-flex-grid.md) resolved mid-ticket). Alias names? `NfsFloatGrid...` with `Value` read aliases, the Flex Grid's pattern, because the directive names are shared and the value sets are not.

Nothing was left unsettled; the frontier is empty.

### Decisions

1. Two attribute directives in `ngx-foundation-sites/float-grid`, each a static host class on any element: `[nfsRow]` (`.row`) and `[nfsColumn]` (`.column`, never `.columns`); a column row is both on one element; no template, token, provider, host directive, Defaults token, model, output, method, or `exportAs`. The class names and selectors are the Flex Grid's too, each grid in its own entry point.
2. `NfsColumn`: `size` (`NfsFloatGridColumnSizeInput`, 1 to `$grid-column-count`), `offset`, `push`, `pull` (`NfsFloatGridOffsetInput`, 0 to `$grid-column-count` minus 1; 0 resets push and pull), each bare for the Zero breakpoint or in Breakpoint rules; `centered` (`NfsFloatGridCenteredInput`: `true` sets `.small-centered`, rules of booleans set `.<bp>-centered` and `.<bp>-uncentered`); booleans `end` and `columnBlock`.
3. `NfsRow`: `expanded` (boolean); `collapse` (`NfsFloatGridCollapseInput`: `true` sets `.collapse`, rules of booleans set `.<bp>-collapse` and `.<bp>-uncollapse`); `gutter` (`NfsFloatGridGutter` over the new `NfsGridColumnGutterOverrides`); `up` (`NfsFloatGridUpInput`, 1 to `$block-grid-max`).
4. Exported aliases `NfsFloatGridColumnSize`, `...ColumnSizeValue`, `...ColumnSizeInput`, `NfsFloatGridOffset`, `...OffsetValue`, `...OffsetInput`, `NfsFloatGridUp`, `...UpValue`, `...UpInput`, `NfsFloatGridCollapse`, `...CollapseInput`, `NfsFloatGridCentered`, `...CenteredInput`, `NfsFloatGridGutter`, named in every input's type arguments; registries `NfsGridColumnCountOverrides` and `NfsBlockGridMaxOverrides` (shared with the Flex Grid), `NfsGridColumnGutterOverrides` (new), `NfsBreakpointClassesOverrides`.
5. One `computed` class list per directive through `[class]`; copied Foundation classes reported in development, not stripped.
6. The DOM order is the reading and focus order, and every push is paired with the pull it trades places with: requirements in every recipe and story, plus a development check from the columns' geometry, re-run at each breakpoint change, reporting focusable columns shown out of DOM order and a column moved out of its row or over its neighbour.
7. Development checks also report copied classes (both directives, patterns from the Breakpoint map), a column outside a row, a sized column row inside another row, and, once per realm, a page whose rows have no Float Grid clearfix (no `foundation-grid`, or a Flex Grid compile).
8. Runtime check: both directives report through `nfsVariantCheck`, calling `include('nfs-float-grid', ...)` with the never-empty count properties and `include('nfs-breakpoint-properties', ['breakpoint-classes'])` only while a value that reads them is bound; Zero-breakpoint values need no `breakpoint-classes` name.
9. `nfs-float-grid` is a properties-only Library mixin writing `--nfs-grid-column-count`, `--nfs-block-grid-max`, and `--nfs-grid-column-gutter`; the first two are also written by `nfs-flex-grid` with the same values (the exception for a setting no entry point owns); no library CSS.
10. Enabling, stated in the spec: the float build (`$global-flexbox: false` and `foundation-everything($flex: false)`), per-component includes with `foundation-grid`, or beside the XY Grid with `foundation-grid` before `foundation-everything` and `$grid-column-count` equal to `$grid-columns`; never beside the Flex Grid; the docs' literal sentence compiles the Flex Grid.
11. A page with both the XY and the Float Grid: the size, offset, and block-grid classes share names; measured, the include order and equal counts keep both right, and the spec requires them; no check.
12. No ARIA role; no DI; other directives beside or inside; same-named inputs (`size`, `collapse`, `expanded`) avoided by nesting; the Flexbox Utilities do not apply to float rows.
13. Implementation level: native platform (CSS floats and relative positioning); Aria has no layout pattern; CDK's `InteractivityChecker` and the Breakpoint service only in development builds.
14. Unsupported: Foundation's class-name parameters of `foundation-grid(...)`; a `dir="rtl"` region inside a left-to-right compile.
15. Story ids `float-grid--basics`, `--nesting`, `--column-row`, `--expanded`, `--offsets`, `--incomplete-rows`, `--centered`, `--gutters`, `--collapse`, `--source-ordering`, `--block-grid`, in the main Storybook configuration; e2e only for breakpoint geometry, reflow at 320 CSS px, and the fixture app's JavaScript-disabled first paint.

### Triage

- Overall: impact HIGH (the `NfsRow` and `NfsColumn` names and the shared inputs are public API that the Equalizer spec already writes and the Flex Grid shares, and the count typings freeze a contract); confidence HIGH (building-blocks 1.3 and 1.4 applied mechanically and aligned with the Flex Grid's resolved decisions; ADR 0040's typing; every CSS and focus claim measured in three engines). Decided with the applied defaults; nothing is OPEN FOR HUMAN.
- Shared class names across two entry points (decision 1): impact HIGH (two specs' public API), confidence HIGH (the class-name rule, identical markup, measured mutual exclusion; the Flex Grid decided the same); the consistency review confirms the pair.
- `collapse` and `centered` shapes (decisions 2 and 3): impact MEDIUM, confidence HIGH (measured nesting difference and specificity; the Flex Grid's same `collapse` shape).
- Push and pull with the geometry check (decision 6): impact MEDIUM, confidence HIGH (ADR 0039; the Flexbox Utilities' D9 and D10; measured focus order, overflow, and overlap).
- The include order for pages with both XY and Float Grid, and the Storybook preview line (decision 11, proposed change 6): impact MEDIUM (a convention every grid story depends on), confidence HIGH (measured in three engines).
- Shared Variant property writers (decision 9): impact MEDIUM (the one-writer rule), confidence HIGH (the Progress Bar precedent; the Flex Grid proposes the same).
- The new `NfsGridColumnGutterOverrides` registry: impact LOW, confidence HIGH (the mechanical registry rule; measured key-driven classes).
- The missing-stylesheet check (decision 7): impact LOW, confidence HIGH (measured on four compiles in three engines).
- No prototype is needed: every open point was measured by this ticket.

### Placeholders in published specs

| Placeholder | Specs that use it | Final name |
| --- | --- | --- |
| `NfsRow` / `[nfsRow]` | [Spec: Equalizer](34-spec-equalizer.md) (class mapping, names paragraph, Rendered HTML, stories, SSR smoke, usage) | `NfsRow` / `[nfsRow]`, unchanged |
| `NfsColumn` / `[nfsColumn]` | the same | `NfsColumn` / `[nfsColumn]`, unchanged |
| `size` on `nfsColumn` (bare `size="6"`, rules `[size]="{medium: 4}"`) | the same | `size`, unchanged; the bare value is the Zero breakpoint (`.small-6`), as the Equalizer assumed |
| "the Float Grid directives' `.row` and `.column` markup" and the `foundation-grid` Storybook line | [Spec: Equalizer](34-spec-equalizer.md), Storybook conventions section 5 | `nfsRow` and `nfsColumn`; the line moves before `foundation-everything` (proposed change 6) |

Needs the API does not meet: none. One claim in those places is wrong and needs the text of proposed changes 6 and 7: both say sharing the size class names with the XY Grid is harmless because the XY Grid's size rules are scoped to `.grid-x >`; measured, it is harmless for horizontal grids only, and with `foundation-grid` after the XY Grid a vertical grid's `small-6` cell is half as wide.

### Shared-name decisions for the consistency review (with the [Spec: Flex Grid](101-spec-flex-grid.md))

Aligned with the Flex Grid's resolved list in every point:

- Directive classes and selectors `NfsRow` (`[nfsRow]`) and `NfsColumn` (`[nfsColumn]`) in both legacy grids, each in its entry point (`ngx-foundation-sites/float-grid`, `ngx-foundation-sites/flex-grid`).
- `.column` bound, `.columns` never.
- Shared inputs with the same names and shapes: `size` (counts per breakpoint; the Flex Grid adds `'expand'` and the bare `'shrink'`), `offset` (0 to `$grid-column-count` minus 1), `up`, `expanded`, `columnBlock`, `collapse` (`true` for `.collapse`, Breakpoint rules of booleans for the responsive pair).
- Aliases carry the grid's name, with the same `Value` and `Input` pattern (`NfsFloatGridColumnSizeInput` beside `NfsFlexGridColumnSizeInput`).
- Registries `NfsGridColumnCountOverrides` and `NfsBlockGridMaxOverrides` shared; both mixins write `--nfs-grid-column-count` and `--nfs-block-grid-max`.
- Float-Grid-only inputs: `push`, `pull`, `centered`, `end`, `gutter`; Flex-Grid-only: `unstack`, `isCollapseChild`.
- Where the Float Grid differs, and why: (a) its own `NfsFloatGridCentered` pair, `centered` using the same boolean-or-rules shape as `collapse`, because Foundation generates `.<bp>-centered` and `.<bp>-uncentered` for every Class breakpoint, and its bare `true` fills the Zero-breakpoint gap with `.small-centered`; (b) one more registry, `NfsGridColumnGutterOverrides`, and one more property, `--nfs-grid-column-gutter`, which only the Float Grid writes; (c) its missing-stylesheet check reads the row's clearfix, while the Flex Grid's reads its own CSS; each names the other grid's entry point in its message; (d) its stories stay in the main Storybook configuration, with `foundation-grid` moved before `foundation-everything` (the Flex Grid's second configuration leaves that line out, as its proposal says).
- Same-element input names (the XY Grid's proposed building-blocks 1.9 rule): `size` on columns, `collapse` on rows (the Reveal's too), and `expanded` on rows (the Button's, Button Group's, and Menu's too); those components nest inside a column.

### Proposed shared-file changes

1. `building-blocks.md` Table D, the Float Grid row: replace the empty cells with

   > | Float Grid (legacy) | `docs/pages/grid.md` | [Spec: Float Grid](issues/100-spec-float-grid.md) | `[nfsRow]` (`.row`; `expanded`; `collapse`, `true` for `.collapse` or Breakpoint rules of booleans for `.<bp>-collapse` and `.<bp>-uncollapse`; `gutter` over `NfsGridColumnGutterOverrides`; `up` over `NfsBlockGridMaxOverrides`); `[nfsColumn]` (`.column`, never `.columns`; `size`, `offset`, `push`, `pull` over `NfsGridColumnCountOverrides`, bare for the Zero breakpoint or Breakpoint rules; `centered`, `true` for `.small-centered` or rules of booleans; `end`; `columnBlock`); a column row is both on one element; the same class names and selectors as the Flex Grid's, in its own entry point | Directives, one per class that names an element of the layout (ADR 0001, ADR 0039); nothing is generated | Native platform: Foundation's float CSS and relative positioning; Aria has no layout pattern, and CDK adds nothing in production | A static host class and one `computed` class list per directive (copied classes reported, not stripped); `nfsBreakpointsToken` for the Zero breakpoint; development checks in render callbacks (copied classes, placement, a stylesheet without the Float Grid's clearfix, and push and pull geometry: focusable columns out of DOM order, a column out of its row or over its neighbour, with `InteractivityChecker` and the Breakpoint service); the Runtime checks; `nfs-float-grid`, properties-only (`--nfs-grid-column-count`, `--nfs-block-grid-max`, both shared with `nfs-flex-grid`, and `--nfs-grid-column-gutter`) | None |

2. `building-blocks.md` 1.3: in the clause the [Spec: Flex Grid](101-spec-flex-grid.md) proposes (its change 2), replace "while their type aliases carry the grid's name (`NfsFlexGridColumnSize`), because their families differ ([Spec: Flex Grid](issues/101-spec-flex-grid.md), D1, D7)" with

   > while their type aliases carry the grid's name (`NfsFloatGridColumnSize`, `NfsFlexGridColumnSize`), because their families differ ([Spec: Float Grid](issues/100-spec-float-grid.md), D1; [Spec: Flex Grid](issues/101-spec-flex-grid.md), D1, D7)

3. `building-blocks.md` 1.13 and ADR 0040: adopt the Flex Grid's change 3 (its sentence and its ADR 0040 dated note already name the Float Grid's mixin), and append to its inserted sentence:

   > Neither legacy grid's mixin writes a property of its own that it never leaves empty (the Float Grid's `--nfs-grid-column-gutter` is empty under a static `$grid-column-gutter`), so each reports its own missing mixin only while the other's is missing too, as the Progress Bar does ([Spec: Float Grid](issues/100-spec-float-grid.md), D12).

4. `building-blocks.md` 1.9, in the same-named-inputs sentence the [Spec: XY Grid](99-spec-xy-grid.md) proposes (its change 3), replace "(`size` on cells, callouts, buttons, close buttons, and dropdown panes)" with

   > (`size` on cells, columns, callouts, buttons, close buttons, and dropdown panes; `collapse` on rows and reveals; `expanded` on rows, buttons, button groups, and menus)

5. `CONTEXT.md`, under Foundation side:
   - Adopt the Flex Grid's **Row**, **Column**, and **Column row** (its change 4), with **Column**'s definition read as

     > An element of a legacy grid's Row, marked by `.column`, whose size and offset per breakpoint are set on it, and in the Float Grid also its push, pull, and centring; in the Flex Grid a Column without a size expands into the space its Row leaves.

   - In the Flexbox Utilities' proposed **Source ordering**, replace the definition and the _Avoid_ line with

     > Foundation's per-breakpoint change of the visual order of a layout's items, through the Flexbox Utilities' order classes or the Float Grid's push and pull classes, which leaves the DOM order, the reading and focus order, as written.
     > _Avoid_: reordering (bare), sort order

   - Add, after **Export mixin**:

     > **Float build**:
     > Foundation's CSS compiled with Flexbox mode off (`foundation-everything($flex: false)`, what Foundation ships as its float CSS), the one `foundation-everything` compile that prints the Float Grid, and one without the XY Grid, the Flex Grid, and the Flexbox Utilities.
     > _Avoid_: float mode, legacy build, IE build

6. `storybook-conventions.md` section 5: in the `preview.scss` listing, delete the line `// @include foundation-grid; // Equalizer: equalizer--float-grid (its size classes share names with the XY grid's, harmlessly: the XY grid's size rules are scoped to .grid-x > and outrank them)` and insert before `@include foundation-everything($prototype: true); // (3) every Export mixin plus the Prototype utilities`:

   > `@include foundation-grid; // Float Grid: every float-grid--* story, and Equalizer: equalizer--float-grid. Before (3): its unscoped size classes would otherwise halve the width of the XY Grid's vertical cells (measured), and its offsets agree with the XY Grid's because both counts stay 12`

   and add `@include nfs-float-grid; // Float Grid: the three Variant properties; every float-grid--* story` among the Library mixins. In the bullet on `foundation-everything`, replace "a spec that needs an Export mixin outside it (`foundation-grid`) adds one line, and the spec states that the new classes do not overlap existing ones." with

   > a spec that needs an Export mixin outside it adds one line after it, and the spec states that the new classes do not overlap existing ones; `foundation-grid`, whose size, offset, and block-grid classes have the XY Grid's names, comes before it, and the stories keep `$grid-column-count` equal to `$grid-columns` ([Spec: Float Grid](issues/100-spec-float-grid.md)).

   This fits the Flex Grid's proposed second configuration, which drops the `foundation-grid` line from its copy.

7. [Spec: Equalizer](34-spec-equalizer.md): in the names paragraph replace "`nfsFlexContainer` with `direction`, `nfsFlexChild`, `NfsRow`, and `NfsColumn` are placeholders built by the same rules;" with "`NfsRow` and `NfsColumn`, with the column's `size`, are the [Spec: Float Grid](../issues/100-spec-float-grid.md)'s; `nfsFlexContainer` with `direction` and `nfsFlexChild` are placeholders built by the same rules;" (or the Flexbox Utilities' final wording if its placeholder change lands first); in Testing Decisions replace "The Storybook stylesheet includes `foundation-grid` for `equalizer--float-grid` next to the XY grid; the two share their size class names (`.medium-6`), which is harmless, because the XY grid's size rules are scoped to `.grid-x >` and outrank the float grid's." with

   > The Storybook stylesheet includes `foundation-grid` before `foundation-everything` for the Float Grid's stories and `equalizer--float-grid`; the two grids share their size, offset, and block-grid class names, which that order and Foundation's equal default column counts keep harmless ([Spec: Float Grid](../issues/100-spec-float-grid.md)).

8. [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md):
   - Settings table, a new row after `$block-grid-max`:

     > | `$grid-column-gutter` (its keys, while a map) | `NfsGridColumnGutterOverrides` | `--nfs-grid-column-gutter` | names | `small medium` | none | Float Grid |

     and a sentence after the table: "A single-length `$grid-column-gutter` generates no `.gutter-*` class, so `nfs-float-grid` writes `--nfs-grid-column-gutter` as the empty list and the generated file declares `small: false` and `medium: false`."
   - Class-name renames bullet: replace "the Float Grid spec decides its own;" with "the Float Grid spec leaves them unsupported, because the directives bind Foundation's default names and the library's mixin cannot read `foundation-grid(...)`'s arguments, and `$grid-column-alias` needs nothing, because no directive binds the alias;".
   - "Known `mixins` today": after the XY Grid's and the Flex Grid's proposed sentences, add "`nfs-float-grid` writes `--nfs-grid-column-count` and `--nfs-block-grid-max`, as `nfs-flex-grid` does, and `--nfs-grid-column-gutter` alone."; the `mixins` of the `$grid-column-count` and `$block-grid-max` rows hold both legacy grid mixins (the Flex Grid's proposal), and the new row's holds `nfs-float-grid`.
   - Manifest `uses` entries, all with entry point `ngx-foundation-sites/float-grid`: `NfsGridColumnCountOverrides` <- `NfsColumn.size` (`NfsFloatGridColumnSizeInput`, `count`), `NfsColumn.offset`, `NfsColumn.push`, `NfsColumn.pull` (`NfsFloatGridOffsetInput`, `count`); `NfsBlockGridMaxOverrides` <- `NfsRow.up` (`NfsFloatGridUpInput`, `count`); `NfsGridColumnGutterOverrides` <- `NfsRow.gutter` (`NfsFloatGridGutter`, `name`); `NfsBreakpointClassesOverrides` <- `NfsColumn.size`, `NfsColumn.offset`, `NfsColumn.push`, `NfsColumn.pull`, `NfsRow.up` (`rules`), and `NfsColumn.centered` (`NfsFloatGridCenteredInput`, `rules`), `NfsRow.collapse` (`NfsFloatGridCollapseInput`, `rules`).

9. [Spec: XY Grid](99-spec-xy-grid.md), Notes: add

   > - Beside the Float Grid ([Spec: Float Grid](../issues/100-spec-float-grid.md)): a page that also compiles `foundation-grid` includes it before `foundation-xy-grid-classes` and keeps `$grid-column-count` equal to `$grid-columns`. Measured in three engines: in the other order the Float Grid's unscoped `.small-6 { width: 50% }` makes a vertical grid's `size="6"` cell half as wide as its grid, and with unequal counts the grid compiled last sets both grids' offsets.

10. Map, Decisions so far:

    > - [Spec: Float Grid](issues/100-spec-float-grid.md) -- two listener-free directives in `float-grid`, `nfsRow` (`.row`; `expanded`, `collapse` as the bare `.collapse` or Breakpoint rules of booleans for `.<bp>-collapse` and `.<bp>-uncollapse`, `gutter` over a new `$grid-column-gutter` registry, `up`) and `nfsColumn` (`.column`, never `.columns`; `size`, `offset`, `push`, `pull`, `centered` with `.small-centered` for the Zero breakpoint, `end`, `columnBlock`), sharing their class names, selectors, and shared inputs with the Flex Grid's in their own entry point; counts closed over `$grid-column-count` and `$block-grid-max`; push and pull carry the reading-order requirement and a development geometry check (measured: shown B, A while Tab reaches A, B; an unpaired push scrolls a 320 px page to 480 px); enabling needs `foundation-grid` (the docs' own sentence compiles the Flex Grid, measured), and beside the XY Grid it comes first with equal counts (measured: otherwise vertical XY cells halve); a development check reports a stylesheet without the Float Grid's clearfix; no DI, no ARIA role, no library CSS (`nfs-float-grid` writes three Variant properties, two shared with `nfs-flex-grid`); impact HIGH, confidence HIGH; no ADR. Spec: [specs/float-grid.md](specs/float-grid.md).

No ADR: the decisions follow ADR 0039, ADR 0040, building-blocks rules, and the Flex Grid's resolved names; the include-order requirement is a measured fact, not a trade-off between live options.

### For other specs

- [Spec: Flex Grid](101-spec-flex-grid.md): the shared-name list above matches its own; the Float Grid adds `NfsGridColumnGutterOverrides` and `--nfs-grid-column-gutter`, which the Flex Grid neither reads nor writes; the two missing-stylesheet checks name each other's entry point.
- [Spec: Equalizer](34-spec-equalizer.md): its placeholders are final (table above); proposed change 7 corrects its "harmless" sentence.
- [Spec: XY Grid](99-spec-xy-grid.md): proposed change 9; its copied-class check and this spec's both recognise `.medium-6`, each naming its own directive.
- [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md): float rows are not Flex parents, and its D13 warning covers `nfsFlexAlign` beside `nfsRow`; the Source ordering term widens to push and pull (proposed change 5).
- [Spec: Typography Helpers](106-spec-typography-helpers.md): a `ul` row needs its `.no-bullet` directive (measured: the first marker sits outside the viewport at 400 px, the others show).
- [Spec: Visibility Classes](104-spec-visibility-classes.md): `hidden` does hide float rows and columns (measured), unlike the XY Grid's `.grid-x`.
- [Spec: Reveal](18-spec-reveal.md): its `.reveal.collapse` and `.reveal .column` rules share names with the Float Grid's classes and are scoped, so they never interact; its `collapse` input and the row's never share an element.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): the shared-name decisions above; the Storybook preview order (proposed change 6); same-element input names (proposed change 4).
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): this spec's Out of Scope items each carry a reason and a category; none rests on being CSS-only.

### Amendment, 2026-09-29 (in-family check lines)

By [Re-run: layout system and flex utility family specs, In-family check lines](155-rerun-layout-system-and-flex-utility-family-in-family-lines.md), which holds the grilling record and the triage. [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) found that this spec, written before [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), lacks the In-family check lines that [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) requires of a family with more than one directive. [specs/float-grid.md](../specs/float-grid.md) is revised in place, with lines that the [Spec: Flex Grid](101-spec-flex-grid.md)'s repeat.

What changed, against the decisions above:

- Decision 12 (no DI) gains the In-family lines, development-only reads of the DOM: `NfsRow` probes `NfsColumn`, a column row inside it included; `NfsColumn` probes nothing, because a column holds content and a row nested in it is a row of its own; neither has a parent check, a peer, or a parent token; `strictParents` changes nothing. The Flex Grid's `NfsRow` and `NfsColumn` make the same two calls, as the Selector manifest's rule 2 requires of two directives with one class name, and a report of a forgotten one names both entry points (the re-run's proposal 1 for the development messages; NFS9001 names both already). Rejected: a column probe of nested rows (`other`, as the XY Grid's cell).
- Decision 7 (development checks): the placement check counts an element that carries `nfsRow` as a row, class or no class, for the host and for its parent, so a forgotten row import is reported once by the import checks and not as a placement warning per column, and a column row whose own `NfsRow` is forgotten is not told it is outside a row. Rejected: keeping the message (false for a column inside the row's element; `other`); a message per column naming the import (one warning per column for one defect; `other`).
- Tests: one browser-level case for a parent row whose directive is left out.
- Spec sections revised: Hierarchy and DI shape (one bullet added), the development checks (check 2), and Testing Decisions (layer 2).

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group c, under the decisions of phase 1 ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)); the review's record for this spec is [research/consistency-review-group-c.md](../research/consistency-review-group-c.md). `specs/float-grid.md` was revised in place. Items applied: R34/R35, R59, CR-B, CR-C. Changed:

- A page that enables both grids: the sentence on the Reveal's, Button's, Button Group's, and Menu's scoped rules now names the one descendant rule that reaches a column, the Reveal's `.reveal .column { min-width: 0 }`, which changes nothing, because a float column's `min-width` already resolves to 0 (R35).
- Hierarchy and DI shape, Injection: the Runtime checks' handle names its argument, `nfsVariantCheck('nfsRow')` and `nfsVariantCheck('nfsColumn')` (R59).
- CSS class to directive mapping gains a table of the other families' classes in the examples and on Foundation's Grid page (Callout, Thumbnail, Visibility Classes, Typography Helpers), each with its directive and owning spec (CR-B).
- D1's rationale states a fact in place of a deferral word: the names "are the names the Spec: Equalizer already wrote" (CR-C).

Unchanged: the API, types, defaults, development checks, the In-family line of [Re-run: layout system and flex utility family specs, In-family check lines](155-rerun-layout-system-and-flex-utility-family-in-family-lines.md), ARIA, the WCAG rows, the rendering modes, and the Story ids. Confirmed: R16 (the Notes' `hidden` line stays: `hidden` hides a row and a column), R59's `include()` calls and the one-file-per-case Runtime check tests, CR-A, CR-D (`app-legacy-article`). Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (exportAs on every directive)

From [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `specs/float-grid.md`'s `NfsRow` and `NfsColumn` gain `exportAs: 'nfsRow'` and `exportAs: 'nfsColumn'` (the class sketch comments, the Models/outputs/methods bullet, the Material comparison table, and D1), the same names as the Flex Grid's directives for the same classes.
