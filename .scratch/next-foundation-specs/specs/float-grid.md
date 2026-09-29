# Spec: Float Grid

Ticket: [Spec: Float Grid](../issues/100-spec-float-grid.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)). The nearest precedents are the [Spec: XY Grid](../issues/99-spec-xy-grid.md), whose shape this spec follows wherever the Float Grid's CSS allows, and the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), whose Source ordering hazard and check this spec carries over to push and pull.

## Problem Statement

A developer maintaining pages on Foundation for Sites' Float Grid, the grid Foundation shipped before the XY Grid, lays out content with a `.row` of floated `.column` elements, sized per breakpoint by classes generated from its column count (`.small-6`, `.large-4`), and moved by offset, push, pull, and centering classes. Foundation has marked it legacy since 6.4 and compiles it only on request, and the user ruled that it gets its spec anyway (ADR 0039). The Float Grid is a layout system: it ships Sass and classes and no Plugin, so the markup is the whole contract, and that contract leaves the hard parts to the author:

- Turning it on is easy to get wrong. On Foundation's default compile a page has no `.row` or `.column` rule at all, so every column stacks at full width and nothing reports it. The docs' instruction, "set both `$xy-grid` and `$global-flexbox` to `false`", does not give the Float Grid under `foundation-everything`: that mixin's `$flex` argument defaults to `true` and sets `$global-flexbox` back to `true`, so the compile gets the Flex Grid instead (measured: `.row` is `display: flex` and no `.small-push-2` exists). Foundation's own float build, `foundation-everything($flex: false)`, also switches Flexbox mode off in every component and leaves out the XY Grid and the Flexbox Utilities.
- Every size, offset, push, pull, and block-grid class is a name built from Sass settings (`$grid-column-count`, `$block-grid-max`, `$breakpoint-classes`), and the gutter classes exist only for the keys of `$grid-column-gutter`, and only while it is a map. A misspelt `medum-6`, a `small-13` or `large-push-12` on a 12-column grid, or a `gutter-large` renders nothing, and nothing reports it.
- The Float Grid's size, offset, and block-grid classes share their names with the XY Grid's. On a page that compiles both, the Float Grid's unscoped `.small-6 { width: 50% }` overrides the XY Grid's `.cell { width: 100% }` when it comes later, so a cell of a vertical XY grid becomes half as wide (measured in three engines), and when `$grid-columns` and `$grid-column-count` differ, whichever grid's offsets compile last move both grids' cells and columns.
- Push and pull reorder columns visually and only visually. Foundation's own Source Ordering example shows its second column first; with a button in each column, measured in Chromium, Firefox, and WebKit, Tab reaches the button shown second first. WCAG 2.2 success criteria 1.3.2 and 2.4.3 depend on that order, and axe has no rule for it. A push or pull without the partner that trades places with it moves a column out of its row or over its neighbour: at 320 CSS px a `small-push-6` beside a `small-6` scrolls the page 160 px sideways, and a `small-pull-3` covers its neighbour by 80 px (measured in three engines).
- `.collapse` and `.small-collapse` look alike and differ: a row nested in a `.collapse` row overhangs its column by half a gutter (10 px, measured), one nested in a `.small-collapse` row does not, and `.medium-uncollapse` cannot undo `.collapse`, whose selector is more specific.
- There is no `.centered` class, only `.small-centered` and its siblings; an incomplete row's last column floats to the right edge (a 200 px gap at 800 CSS px, measured) unless it carries `.end`; a list used as a row loses its indent to the row's own margins, so the first item's marker sits outside the viewport at a narrow width (measured).
- The grid is physical: Foundation compiles `left` and `right` into it, so a `dir="rtl"` region of a left-to-right compile still lays its columns out from the left (measured).
- Under the library's class rule the developer writes no Foundation class at all, so every one of these classes needs an Angular home.

A server-rendered application adds the usual second problem: the layout must already be right in the server HTML, must not change at hydration, and must hold inside dehydrated and `hydrate never` blocks, where no JavaScript runs.

## Solution

Two attribute directives in one entry point, one per class that names an element of the layout: `[nfsRow]` binds `.row` and `[nfsColumn]` binds `.column`, the same names the legacy Flex Grid's directives use for its classes of the same names. Every other Float Grid class is set by a typed Variant input of the directive whose element Foundation puts it on: the column's `size`, `offset`, `push`, and `pull` (a bare value for the Zero breakpoint, or Breakpoint rules such as `[size]="{medium: 6, large: 4}"`), `centered` (on or off per breakpoint), `end`, and `columnBlock`; the row's `expanded`, `collapse`, `gutter`, and `up` block grid. Counts, gutter names, and breakpoints are closed over the developer's own Sass through the Variant registries, so `size="13"` on a 12-column grid, `[push]="{large: 12}"`, `gutter="large"`, and `[size]="{meduim: 6}"` fail to compile ([ADR 0040](../adr/0040-variant-input-types.md)). A column that is also a row is `<div nfsRow nfsColumn>`, Foundation's `.column.row`.

The DOM order is the reading and focus order: the developer writes columns in the order they are read and uses push and pull only to rearrange the look. In development builds the directives report columns with focusable content shown out of DOM order, a push or pull that moves a column out of its row or over its neighbour, a page whose stylesheet has no Float Grid, copied Foundation classes, and a column outside a row. Every effect is a host binding on signal inputs, no directive declares a listener, and nothing is measured in production, so the grid is its server HTML in every rendering mode. The `nfs-float-grid` Library mixin adds no CSS; it writes the three Variant properties the Runtime checks and the Variant declaration file's generator read. The spec states the three ways to compile the Float Grid, and the include order and column counts a page that also compiles the XY Grid needs.

## User Stories

1. As an application developer on a legacy page, I want to write `nfsRow` on a `div` and `nfsColumn` on its children and get Foundation's Float Grid, so that I write no Foundation class.
2. As an application developer, I want the directives to work on any element (`div`, `section`, `article`, `ul` and `li`), so that my layout keeps the semantics of my content.
3. As an application developer, I want `size="6"` to give me Foundation's `small-6`, so that the common case is one attribute.
4. As an application developer, I want `[size]="{small: 2, large: 4}"` to give me `small-2 large-4`, so that responsive widths are one typed binding.
5. As an application developer with `$grid-column-count: 16`, I want `size="16"` to compile once my Variant declaration file says so, and `size="17"` to fail, so that my Sass stays the only column count.
6. As an application developer, I want `[size]="{meduim: 6}"` and `size="13"` to fail to compile, so that a typo never ships a full-width column.
7. As an application developer, I want a column with no `size` to be full width, as Foundation's bare `.column` is, so that stacked layouts need nothing.
8. As an application developer, I want `offset="2"` and `[offset]="{large: 1}"`, so that I push a column right by whole columns.
9. As an application developer, I want `[push]="{large: 3}"` and `[pull]="{large: 9}"`, so that I get Foundation's source ordering classes by typed values, with `0` as Foundation's reset.
10. As an application developer, I want a development warning when push or pull shows columns that hold links or buttons in another order than keyboard focus follows, so that I notice before release.
11. As an application developer, I want that warning to stay silent when the reordered columns hold text only, so that Foundation's own example is not reported.
12. As an application developer, I want a development warning when a push or pull moves a column out of its row or over its neighbour, so that a missing partner never ships a page that scrolls sideways or hides content.
13. As an application developer, I want `centered` to centre a column, and `[centered]="{small: true, large: false}"` to centre it only below `large`, so that I never need to know that `.centered` does not exist.
14. As an application developer, I want `end` on the last column of an incomplete row, so that it stays next to its siblings instead of floating to the right edge.
15. As an application developer, I want `expanded` on a row, so that it spans the full width as Foundation's `.expanded` does.
16. As an application developer, I want `collapse` on a row, and `[collapse]="{small: true, large: false}"` for gutters that come back from `large`, so that I remove gutters by name at every width or per breakpoint.
17. As an application developer, I want the spec to tell me how `collapse` and `{small: true}` differ for nested rows, so that I pick the form my layout needs.
18. As an application developer, I want `gutter="small"` on a row, so that one row keeps Foundation's small gutter at every width.
19. As an application developer with a single static `$grid-column-gutter`, I want `gutter` to accept no value once my declaration file says so, so that I cannot ask for a class my Sass does not generate.
20. As an application developer, I want `[up]="{small: 2, medium: 3, large: 4}"` on a row and `columnBlock` on its columns, so that I get Foundation's block grid with its bottom gutter.
21. As an application developer, I want `<div nfsRow nfsColumn>` for a single-column row, so that Foundation's combined `.column.row` needs no class.
22. As an application developer, I want nested rows inside columns to work as Foundation's do, so that nesting needs nothing extra.
23. As an application developer migrating Foundation markup, I want a copied `class="columns medium-6 large-push-2"` reported in development, naming the input to bind, so that I learn the directive form.
24. As an application developer, I want a development warning when a column's parent is not a row, and when a nested column-row carries a size, so that a size that cannot apply does not fail silently.
25. As an application developer, I want a development warning when my page's stylesheet has no Float Grid, including when it compiled the Flex Grid instead, so that a missing `foundation-grid` does not leave me with stacked columns and no clue.
26. As an application developer, I want a development report when a bound size, offset, push, pull, block-grid count, gutter, or breakpoint has no class in my compiled CSS, or when I forgot the `nfs-float-grid` include, so that drift between my Sass and my types surfaces early.
27. As an application developer, I want the spec to tell me the three ways to compile the Float Grid and what each switches off, so that I enable it on purpose.
28. As an application developer who keeps the XY Grid beside the Float Grid, I want the spec to tell me the include order and the column counts that keep both grids right, so that neither grid's cells change size.
29. As a keyboard user, I want focus to move through a float layout in the order I see it, so that I do not lose my place.
30. As a screen reader user, I want the reading order to be the order the content makes sense in, so that a visual rearrangement never changes the meaning.
31. As a user at 400 percent zoom, I want a float layout to reflow into a normally scrolling page, so that nothing scrolls sideways.
32. As an application developer, I want to write `nfsEqualizer`, a Visibility Classes directive, or `nfsCallout` inside a column, beside or inside the grid directives, so that no extra wrapper is needed.
33. As a developer of a server-rendered application, I want the server HTML to carry every grid class, so that the first paint is final and hydration changes nothing.
34. As a developer using `@defer (hydrate never)`, I want a float layout there to keep its layout, so that static regions need no JavaScript.
35. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
36. As an application developer, I want to import the directives from one entry point, so that a `@defer` block can split them.
37. As a library maintainer, I want every behaviour asserted through classes, geometry, focus order, and development reports in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

The Float Grid has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its contract is Foundation's Float Grid Sass partials, its Grid docs page, and the classes its export mixin `foundation-grid` generates. Dropped options: none, because there are none. Every class below was confirmed by compiling Foundation 6.9.0's defaults with Dart Sass 1.104.1.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Row | `.row` | `grid-row` | `max-width: $grid-row-width` (`$global-width`, 75rem), centred with auto side margins, and a clearfix (`::before` and `::after` with `content: " "` and `display: table`) |
| Nested row | `.row .row` | `grid-row-nest` | Negative side margins of half the column gutter per breakpoint, so a nested row's columns line up with its parent's; `max-width: none` inside a row that is not expanded |
| Expanded row | `.expanded` on `.row` | fixed name | `max-width: none`; nested rows get auto margins |
| Column | `.column` (alias `.columns`) | `grid-column` | `float: left` (`$global-left`), `width: 100%`, padding of half the column gutter (0.625rem, 0.9375rem from medium). `.columns` is `$grid-column-alias`, an `@extend` of `.column` with no rule of its own, absent while the alias is `false` |
| Column row | `.column.row` | literal rules | `float: none` on the combined element; inside another row it loses its padding and margins. The docs: sizes only on a top-level column row. `foundation-grid` declares a `$column-row` parameter but generates no `.column-row` class (checked) |
| Last column | `.column:last-child:not(:first-child)` | `$grid-column-align-edge` (`true`) | Floats to the right edge to hide rounding differences, so an incomplete row shows a gap before its last column (200 px at 800 CSS px for three `medium-3` columns, measured) |
| End | `.end` on `.column` | `$grid-column-align-edge` | Floats the last column left again; generated only while `$grid-column-align-edge` is `true`, which is also the only time it is needed |
| Sizes | `.<bp>-<n>`, `n` from 1 to `$grid-column-count` (12) | `$grid-column-count`, `$breakpoint-classes` | `width` as a percentage; unscoped (not `.row > .small-6`) |
| Offsets | `.<bp>-offset-<n>`, `n` from 0 to `$grid-column-count` minus 1 | `grid-column-offset` | `margin-left` (`$global-left`); unscoped |
| Push and pull | `.<bp>-push-<n>`, `.<bp>-pull-<n>`, `n` from 1 to `$grid-column-count` minus 1; `.<bp>-push-0` and `.<bp>-pull-0` | `grid-column-position` | `position: relative` with `left` (`$global-left`) plus or minus `n` columns. The `-0` forms and `.<bp>-uncentered` share Foundation's reset: `position: static`, both side margins `0`, and the float restored, so a reset also clears an offset and a centring from that breakpoint up |
| Centering | `.<bp>-centered`, `.<bp>-uncentered` | `grid-column-position(center)` | Auto side margins, `float: none`, `clear: both`. No unprefixed `.centered` exists (checked) |
| Collapse | `.collapse` on `.row`; `.<bp>-collapse`, `.<bp>-uncollapse` | fixed name; `-zf-each-breakpoint` | `.row.collapse > .column` removes the column padding at every width and `.row .row.collapse` removes a nested collapsed row's own margins; `.<bp>-collapse` removes the padding from `bp` up and the margins of the rows nested inside it; `.<bp>-uncollapse` restores the padding from `bp` up but cannot undo `.collapse` (specificity 0,2,0 against 0,3,0) |
| Static gutters | `.gutter-<key>` on `.row` | the keys of `$grid-column-gutter` (`small`, `medium`) | Generated only while `$grid-column-gutter` is a map (none with `$grid-column-gutter: 30px`, checked); a row's columns keep that key's gutter at every width |
| Block grid | `.<bp>-up-<n>` on `.row`, `n` from 1 to `$block-grid-max` (8) | `grid-layout` | `> .column` floats at `1 / n` of the width and clears every `n`th with `:nth-of-type`, so a block grid's columns share one element type |
| Column block | `.column-block` | `grid-column-margin` | A bottom margin equal to the gutter; its last child's bottom margin removed |
| Export mixin | `foundation-grid($row, $column, $column-row, $gutter, $push, $pull, $center, $uncenter, $collapse, $uncollapse, $offset, $end, $expanded, $block)` | class-name parameters, each defaulting to Foundation's name | Included by `foundation-everything` only while its `$flex` argument is `false`; Foundation's SassDoc marks it private, but it is the only export of these classes and `foundation-everything` calls it |
| Semantic mixins | `grid-row`, `grid-column`, `grid-column-row`, `grid-column-size`, `grid-column-position`, `grid-column-offset`, `grid-column-gutter`, `grid-column-collapse`, `grid-layout`, `grid-layout-center-last`, `grid-context`, and their `grid-col-*` shorthands | Foundation's docs, "Building Semantically" | For the consumer's own classes in the consumer's own Sass (Out of Scope) |

Every family loops over `$breakpoint-classes` with the Zero breakpoint always added, so `.small-6`, `.small-collapse`, `.small-centered`, and `.small-up-2` exist even with `$breakpoint-classes: (medium large)` (checked). With `$grid-column-count: 16; $block-grid-max: 4; $breakpoint-classes: (small medium large xlarge)` the ranges follow: `.small-16`, `.small-offset-15`, `.small-push-15`, `.small-up-4`, and the `xlarge-` forms exist, `.small-17`, `.small-push-16`, and `.small-up-5` do not.

Settings: `$grid-row-width`, `$grid-column-count` (count, 12), `$grid-column-gutter` (map or length), `$grid-column-align-edge` (flag, `true`), `$grid-column-alias` (`'columns'`), `$block-grid-max` (count, 8); `$breakpoint-classes` and `$global-text-direction` are global. `$grid-column-count` and `$block-grid-max` are also the legacy Flex Grid's settings.

Reading order: the Float Grid paints columns in DOM order, line by line, except where push and pull move a column sideways with relative positioning, which changes only the visual order within its line; offsets and centring add space and move nothing past a sibling. Right to left: the compile's `$global-text-direction` decides the float side; a `dir="rtl"` region inside a left-to-right compile keeps the first DOM column at the left, and a right-to-left compile puts it at the right (measured).

Docs conventions kept or corrected: the element structure and every example (kept, with directives in place of classes); the docs' demo class `.display` on rows (a docs-site style, left out); the `.hide-for-large` and `.show-for-large` spans that label the demo columns (left out; the stories label each column with text that is true at every width); the block grid's placeholder images with `.thumbnail` (replaced by text in the stories; a thumbnail is the [Spec: Thumbnail](../issues/97-spec-thumbnail.md)'s); the source ordering example (kept, with the reading-and-focus requirement and its check, D9).

### What enabling it needs

Foundation compiles the Float Grid only through `foundation-grid`. The directives need that mixin's output in the page's stylesheet and `@include nfs-float-grid;` after it; they need no Flexbox mode setting, because `foundation-grid` emits the same rules in both modes apart from `flex-basis: 0; order: 1` on the row's clearfix pseudo-elements, which a float row never uses (compiled and compared). Three ways to get it, each with what it switches off:

| Way | Stylesheet | What else changes |
| --- | --- | --- |
| Foundation's float build | `$global-flexbox: false;` before Foundation, then `@include foundation-everything($flex: false);` (what Foundation's own float CSS build does) | Flexbox mode is off in every component (Foundation's float and table layouts of the Button Group, Media Object, Top Bar, Menu, and the rest); the XY Grid, Flex Grid, and Flexbox Utilities classes are not compiled (measured: no `.grid-x`, no `.flex-container`), so their directives set classes without rules |
| Per-component includes | `@include foundation-grid;` among the consumer's own list of Export mixins, in place of `foundation-xy-grid-classes` | Only what the consumer leaves out; `$global-flexbox` stays the consumer's choice |
| Beside the XY Grid | `@include foundation-grid;` before `@include foundation-everything;` (or before `foundation-xy-grid-classes`), with `$grid-column-count` equal to `$grid-columns` | Nothing is switched off; the two grids share class names (below) |

Not a way: setting `$xy-grid: false` and `$global-flexbox: false` and keeping `@include foundation-everything;`, the docs' sentence taken literally, compiles the Flex Grid, because `foundation-everything`'s `$flex` argument defaults to `true` and sets `$global-flexbox` back to `true` (measured). Nor beside the Flex Grid: the two legacy grids style the same `.row` and `.column` elements, and compiled together a justified flex row of two `small-4` columns leaves 178 px empty at its end (measured by the [Spec: Flex Grid](../issues/101-spec-flex-grid.md)'s ticket); Foundation's docs say the legacy grids do not work together. The docs of this entry point say both beside the table.

A page that enables both grids. The Float Grid's size (`.<bp>-<n>`), offset (`.<bp>-offset-<n>`), and block grid (`.<bp>-up-<n>`) classes have the XY Grid's names; its `.collapse`, `.column`, and `.expanded` also appear in the Reveal's, Button's, Button Group's, and Menu's rules, always scoped under those components' own classes, which no row or column carries. Measured in Chromium, Firefox, and WebKit on Foundation's defaults:

- XY horizontal cells keep their sizes in either order: `.grid-x > .small-6` outranks the Float Grid's `.small-6`.
- XY vertical cells: with `foundation-grid` after `foundation-everything`, a `.cell.small-6` in a 300 px wide `.grid-y` is 150 px wide, because the Float Grid's `.small-6 { width: 50% }` follows the XY Grid's `.cell { width: 100% }` at equal specificity; with `foundation-grid` first, it is 300 px. Heights are the XY Grid's in both orders.
- Offsets: both grids generate unscoped `.<bp>-offset-<n>` rules on `margin-left`. With equal column counts they agree. With `$grid-columns: 16` and `$grid-column-count: 12`, the grid compiled last sets both grids' offsets: `small-offset-2` in a 300 px row is 50 px for an XY cell when the Float Grid is last (37.5 px expected) and 37.5 px for a float column when the XY Grid is last (50 px expected).
- Block grids target different children (`> .cell` and `> .column`) and do not interact.

So such a page includes `foundation-grid` before the XY Grid's classes and keeps `$grid-column-count` equal to `$grid-columns`, which is Foundation's default. The library adds no check for the counts: neither Library mixin knows whether the other grid's classes were compiled (Out of Scope). On the Angular side the two grids share nothing: separate directives, separate registries (`NfsGridColumnsOverrides` against `NfsGridColumnCountOverrides`), and separate Variant properties; each directive's copied-class check recognises `.medium-6` and names its own directive. `nfsCell` and `nfsColumn` never share an element: both declare `size` (building-blocks 1.9, same-named inputs), and a cell lives in a grid and a column in a row.

### CSS class to directive mapping

`small` in the value columns stands for the Zero breakpoint, the key of `nfsBreakpointsToken`'s map whose value is 0, and `medium` for any other Class breakpoint.

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.row` | `NfsRow` (`[nfsRow]`), static host class | - | - | `row` | - |
| `.expanded` | `expanded` of `NfsRow` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.expanded` | none (closed) |
| `.collapse`, `.<bp>-collapse`, `.<bp>-uncollapse` | `collapse` of `NfsRow` | `NfsFloatGridCollapseInput`: `NfsVariantBoolean \| NfsClassBreakpointRules<boolean>`; rules keys over `$breakpoint-classes` (`NfsBreakpointClassesOverrides`) | a boolean, or Breakpoint rules of booleans | `true` (or the bare attribute) sets `.collapse`; `{small: true, large: false}` sets `.small-collapse .large-uncollapse`; `false` and no value set none | `--nfs-breakpoint-classes`, for keys above the Zero breakpoint |
| `.gutter-<key>` | `gutter` of `NfsRow` | `NfsFloatGridGutter` over `NfsGridColumnGutterOverrides` (`$grid-column-gutter`'s keys; `small`, `medium` by default) | a name | `gutter="small"` sets `.gutter-small`; no value sets none | `--nfs-grid-column-gutter` |
| `.<bp>-up-<n>` | `up` of `NfsRow` | `NfsFloatGridUpInput` over `NfsFloatGridUp`, `NfsOverridableCount<8, NfsBlockGridMaxOverrides>`; `$block-grid-max` and `$breakpoint-classes` | a count, bare (the Zero breakpoint) or in Breakpoint rules | `up="2"` sets `.small-up-2`; `[up]="{small: 2, medium: 3}"` sets `.small-up-2 .medium-up-3` | `--nfs-block-grid-max`; `--nfs-breakpoint-classes` |
| `.column` | `NfsColumn` (`[nfsColumn]`), static host class | - | - | `column` | - |
| `.columns` | Not bound | - | - | `$grid-column-alias` extends `.column` and adds nothing; `NfsColumn` binds `.column`, which exists whatever the alias is | - |
| `.<bp>-<n>` | `size` of `NfsColumn` | `NfsFloatGridColumnSizeInput` over `NfsFloatGridColumnSize`, `NfsOverridableCount<12, NfsGridColumnCountOverrides>`; `$grid-column-count` and `$breakpoint-classes` | a count, bare or in Breakpoint rules | `size="6"` sets `.small-6`; `[size]="{small: 2, large: 4}"` sets `.small-2 .large-4`; no value sets none, so the column is full width | `--nfs-grid-column-count`; `--nfs-breakpoint-classes` |
| `.<bp>-offset-<n>` | `offset` of `NfsColumn` | `NfsFloatGridOffsetInput` over `NfsFloatGridOffset`, 0 to `$grid-column-count` minus 1 | a count, bare or in Breakpoint rules | `offset="2"` sets `.small-offset-2`; `{large: 0}` sets `.large-offset-0` | as `size` |
| `.<bp>-push-<n>` | `push` of `NfsColumn` | `NfsFloatGridOffsetInput` (the same range; `0` is Foundation's reset) | a count, bare or in Breakpoint rules | `[push]="{large: 3}"` sets `.large-push-3`; `{large: 0}` sets `.large-push-0` | as `size` |
| `.<bp>-pull-<n>` | `pull` of `NfsColumn` | `NfsFloatGridOffsetInput` | a count, bare or in Breakpoint rules | `[pull]="{large: 9}"` sets `.large-pull-9` | as `size` |
| `.<bp>-centered`, `.<bp>-uncentered` | `centered` of `NfsColumn` | `NfsFloatGridCenteredInput`: `NfsVariantBoolean \| NfsClassBreakpointRules<boolean>`; `$breakpoint-classes` | a boolean, or Breakpoint rules of booleans | `true` (or the bare attribute) sets `.small-centered` (Zero-breakpoint gap: no `.centered` exists); `{small: true, large: false}` sets `.small-centered .large-uncentered`; `false` and no value set none | `--nfs-breakpoint-classes`, for keys above the Zero breakpoint |
| `.end` | `end` of `NfsColumn` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.end` | none (closed) |
| `.column-block` | `columnBlock` of `NfsColumn` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.column-block` | none (closed) |
| `.column.row` | `nfsRow` and `nfsColumn` on one element | - | - | `row column` | - |

State classes: none; the Float Grid has no runtime state. No class is left for the consumer to write (ADR 0039).

Binding rule (D7): each directive binds one `computed` class list through `[class]` beside its static host class. The list holds only the classes its inputs set, so a Foundation class copied from Foundation's markup is not stripped: Angular keeps a static class that no binding names. It is reported in development instead. The class set depends on the consumer's `$grid-column-count`, `$block-grid-max`, `$grid-column-gutter`, and `$breakpoint-classes`, which the running directive does not know, so a record of every owned class set `false` is not possible. Redundant copies of the static host classes (`column` on `nfsColumn`) merge and are not reported.

### Hierarchy and DI shape

```
[nfsRow]                   NfsRow      (.row)
  [nfsColumn]              NfsColumn   (.column; a direct child of a row)
    [nfsRow]               a nested row, inside the column
[nfsRow][nfsColumn]        a column row: one element that is both (Foundation's .column.row)
```

- Two standalone directives with no template, no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a row or a column through DI: Foundation's selectors carry the row's settings to its columns (`.small-up-2 > .column`, `.row.collapse > .column`, `.row.gutter-small > .column`), and every placement check only reports, so it reads the DOM in a development render callback (building-blocks 1.9, Ancestry that projection can hide). Rows and columns therefore work across any Hydration boundary and through content projection.
- The column row is two directives on one element. Their input names are disjoint (`expanded`, `collapse`, `gutter`, `up` against `size`, `offset`, `push`, `pull`, `centered`, `end`, `columnBlock`).
- Composition by placement (building-blocks 1.9): the Equalizer (`<div nfsRow nfsEqualizer>`), the Visibility Classes' directives, and any component directive inside a column are written beside or inside the grid directives, and none hosts or is hosted by them. The Flexbox Utilities do not apply: a float row is not a Flex parent and a float column not a Flex child, so their alignment and order classes do nothing here; `nfsFlexAlign` beside `nfsRow` is reported by its own not-a-Flex-parent check. Centering is the column's `centered`, and Source ordering is push and pull. Two directives on one element must not both declare an input of the same name (building-blocks 1.9): `size` is the column's count and the Callout's, Button's, Close Button's, and Dropdown pane's size name, `collapse` is also the Reveal's, and `expanded` also the Button's, Button Group's, and Menu's, so those components go inside a column, as Foundation's markup nests them.
- No Defaults token: the Float Grid has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `nfsBreakpointsToken` of `ngx-foundation-sites/media-query` (the Zero breakpoint for bare values, D4) in both directives; the Runtime checks' `nfsVariantCheck()` handle in both; in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning and `ElementRef` in both, and in `NfsColumn` CDK's `InteractivityChecker` and `NfsMediaQuery` for the visual-order check (D9).
- Entry point: `ngx-foundation-sites/float-grid` (one per Foundation docs page), exporting the two directives and the aliases `NfsFloatGridColumnSize`, `NfsFloatGridColumnSizeValue`, `NfsFloatGridColumnSizeInput`, `NfsFloatGridOffset`, `NfsFloatGridOffsetValue`, `NfsFloatGridOffsetInput`, `NfsFloatGridUp`, `NfsFloatGridUpValue`, `NfsFloatGridUpInput`, `NfsFloatGridCollapse`, `NfsFloatGridCollapseInput`, `NfsFloatGridCentered`, `NfsFloatGridCenteredInput`, and `NfsFloatGridGutter`, named as the Flex Grid names its own (`NfsFlexGrid...`): the directive names are shared, the value sets are not. `NfsGridColumnCountOverrides`, `NfsBlockGridMaxOverrides`, `NfsGridColumnGutterOverrides`, `NfsBreakpointClassesOverrides`, the count and string-union helpers, the Class breakpoint types, and `nfsVariantBoolean` live in the primary entry point `ngx-foundation-sites` and are used here as types only, apart from the one pure `nfsVariantBoolean` function.
- Names shared with the legacy Flex Grid (D1): Foundation gives the Flex Grid the same `.row`, `.column`, size, offset, block-grid, `.expanded`, `.collapse`, `.<bp>-collapse`, `.<bp>-uncollapse`, and `.column-block` classes, and compiles one legacy grid or the other (`foundation-everything` chooses by its `$flex` argument), so its directives take the same selectors, class names, and input names, with the same value shapes, for those classes in their own entry point, `ngx-foundation-sites/flex-grid` ([Spec: Flex Grid](../issues/101-spec-flex-grid.md)): `size`, `offset`, `up`, `expanded`, `columnBlock`, and `collapse`. Both bind `.column` and never `.columns`, and both share the registries `NfsGridColumnCountOverrides` and `NfsBlockGridMaxOverrides`. The Float Grid alone has `push`, `pull`, `centered`, `end`, and `gutter`; the Flex Grid alone has `unstack`, `isCollapseChild`, and the `'expand'` and `'shrink'` sizes. A page moves between the two legacy grids by changing its imports and its Sass, and the compiler lists the inputs that do not carry over; the development check of D10 reports a Float Grid directive on a Flex Grid compile, and the Flex Grid's own check the reverse.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in development builds only: `NfsRow` calls `nfsDirectiveCheck('NfsRow', {children: ['NfsColumn']})` and probes its columns, a column row inside it included; `NfsColumn` calls `nfsDirectiveCheck('NfsColumn')` and probes nothing, because a column holds the consumer's content and a row nested in it is a row of its own. Neither part has a parent check, because neither injects a parent (a column outside a row is check 2's, read from the DOM), and neither has a peer linked by reference or value; the probe reads the DOM in development only, so production keeps no link (D15); `strictParents` changes nothing. The Flex Grid's `NfsRow` and `NfsColumn` make the same two calls, so the two pairs agree as the Selector manifest's rule 2 requires of two directives with one class name (one selector and one host class): the host record keys a row or a column by that name whichever grid the component imports, and a report of a forgotten one names both entry points, `'ngx-foundation-sites/float-grid'` or `'ngx-foundation-sites/flex-grid'`, as NFS9001 does.

### API

```ts
// ngx-foundation-sites/float-grid
/** A column count from 1 to $grid-column-count (12 by default): .<bp>-<n>. */
type NfsFloatGridColumnSize = NfsOverridableCount<12, NfsGridColumnCountOverrides>;
type NfsFloatGridColumnSizeValue = NfsFloatGridColumnSize | NfsClassBreakpointRules<NfsFloatGridColumnSize>;
type NfsFloatGridColumnSizeInput = NfsFloatGridColumnSizeValue | `${NfsFloatGridColumnSize}`;
/** 0 to $grid-column-count minus 1: .<bp>-offset-<n>, .<bp>-push-<n>, .<bp>-pull-<n> (0 resets push and pull). */
type NfsFloatGridOffset = Exclude<NfsOverridableCount<12, NfsGridColumnCountOverrides, 0>, NfsOverridableCountValue<12, NfsGridColumnCountOverrides>>;
type NfsFloatGridOffsetValue = NfsFloatGridOffset | NfsClassBreakpointRules<NfsFloatGridOffset>;
type NfsFloatGridOffsetInput = NfsFloatGridOffsetValue | `${NfsFloatGridOffset}`;
/** .<bp>-up-<n>: 1 to $block-grid-max (8 by default). */
type NfsFloatGridUp = NfsOverridableCount<8, NfsBlockGridMaxOverrides>;
type NfsFloatGridUpValue = NfsFloatGridUp | NfsClassBreakpointRules<NfsFloatGridUp>;
type NfsFloatGridUpInput = NfsFloatGridUpValue | `${NfsFloatGridUp}`;
/** .collapse (true), or per breakpoint .<bp>-collapse (true) and .<bp>-uncollapse (false). */
type NfsFloatGridCollapse = boolean | NfsClassBreakpointRules<boolean>;
type NfsFloatGridCollapseInput = NfsVariantBoolean | NfsClassBreakpointRules<boolean>;
/** .<bp>-centered (true) and .<bp>-uncentered (false); a bare true is the Zero breakpoint. */
type NfsFloatGridCentered = boolean | NfsClassBreakpointRules<boolean>;
type NfsFloatGridCenteredInput = NfsVariantBoolean | NfsClassBreakpointRules<boolean>;
/** .gutter-<key>: a key of $grid-column-gutter while it is a map (small, medium by default). */
type NfsFloatGridGutter = NfsOverridableStringUnion<'small' | 'medium', NfsGridColumnGutterOverrides>;

class NfsRow {                               // [nfsRow]
  readonly expanded: InputSignalWithTransform<boolean, NfsVariantBoolean>;                                    // default false
  readonly up: InputSignalWithTransform<NfsFloatGridUpValue | undefined, NfsFloatGridUpInput | undefined>;    // default undefined
  readonly collapse: InputSignalWithTransform<NfsFloatGridCollapse, NfsFloatGridCollapseInput>;               // default false
  readonly gutter: InputSignal<NfsFloatGridGutter | undefined>;                                               // default undefined
}

class NfsColumn {                            // [nfsColumn]
  readonly size: InputSignalWithTransform<NfsFloatGridColumnSizeValue | undefined, NfsFloatGridColumnSizeInput | undefined>; // default undefined
  readonly offset: InputSignalWithTransform<NfsFloatGridOffsetValue | undefined, NfsFloatGridOffsetInput | undefined>;       // default undefined
  readonly push: InputSignalWithTransform<NfsFloatGridOffsetValue | undefined, NfsFloatGridOffsetInput | undefined>;         // default undefined
  readonly pull: InputSignalWithTransform<NfsFloatGridOffsetValue | undefined, NfsFloatGridOffsetInput | undefined>;         // default undefined
  readonly centered: InputSignalWithTransform<NfsFloatGridCentered, NfsFloatGridCenteredInput>;                              // default false
  readonly end: InputSignalWithTransform<boolean, NfsVariantBoolean>;                                                       // default false
  readonly columnBlock: InputSignalWithTransform<boolean, NfsVariantBoolean>;                                               // default false
}
```

| Input | Directive | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `expanded` | `NfsRow` | `false` | `.row.expanded` | New |
| `collapse` | `NfsRow` | `false` | `.collapse`, `.<bp>-collapse`, `.<bp>-uncollapse` | New. A boolean or rules, never both, because `.<bp>-uncollapse` cannot undo `.collapse` (D3) |
| `gutter` | `NfsRow` | `undefined` | `.row.gutter-<key>` | New. Accepts no name once the declaration file records a static `$grid-column-gutter` |
| `up` | `NfsRow` | `undefined` | `.<bp>-up-<n>` | New |
| `size` | `NfsColumn` | `undefined` | `.<bp>-<n>` | New. One input for every breakpoint |
| `offset` | `NfsColumn` | `undefined` | `.<bp>-offset-<n>` | New |
| `push`, `pull` | `NfsColumn` | `undefined` | `.<bp>-push-<n>`, `.<bp>-pull-<n>` | New. The visual-order check (D9) |
| `centered` | `NfsColumn` | `false` | `.<bp>-centered`, `.<bp>-uncentered` | New. The bare form fills the Zero-breakpoint gap (D4) |
| `end` | `NfsColumn` | `false` | `.column.end` | New |
| `columnBlock` | `NfsColumn` | `false` | `.column-block` | New |

- Every input's JSDoc names Foundation's class template and the Sass setting (AGENTS.md Design Philosophy 5), and `collapse`'s names the difference between `.collapse` and `.<bp>-collapse` for nested rows. Every input declares explicit type arguments that name the exported aliases (or `NfsVariantBoolean`), and the library build's typings assertion covers all of them ([ADR 0040](../adr/0040-variant-input-types.md)).
- The count transforms turn a static attribute's string (`size="6"`, `push="0"`) into its number and pass Breakpoint rules through; the on-or-off transforms map `NfsVariantBoolean` through `nfsVariantBoolean` and pass a rules object through. None uses `numberAttribute` or `booleanAttribute`. The transforms are internal.
- Models, outputs, and methods: none. The grid has no state; `exportAs`: none, because there is nothing to expose.

Host bindings, all on signal state:

| Directive | Static `class` | `[class]` | Other |
| --- | --- | --- | --- |
| `NfsRow` | `row` | `expanded`, the collapse classes, `gutter-<key>`, the `up` classes | - |
| `NfsColumn` | `column` | the `size`, `offset`, `push`, `pull`, and centring classes, `end`, `column-block` | - |

- The mapping from a value to its classes is one pure function per directive of the input values and the Zero breakpoint, the same on server and client. It binds nothing for a value that is not one class token or a rules key it cannot parse; under the closed types only a cast or `$any()` reaches that guard, and the Variant check reports it.
- The directives write no attribute but `class`. The consumer's own classes are untouched.
- Development-mode checks, in each directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or its Variant check handle is not `null` (never on the server, and in production only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on:
  1. Copied classes, on both directives, once per instance at the first render: a static class list holding a Float Grid class the directive sets warns once, naming each class with its input, for example "class="columns medium-6 large-push-2" is set by nfsColumn: bind [size]="{medium: 6}" and [push]="{large: 2}" instead, and drop columns, the alias of the column class nfsColumn binds". The patterns are built from the Breakpoint map's names (`nfsBreakpointsToken`): the size, offset, push, pull, centring, `up`, and collapse templates, `gutter-<word>`, `collapse`, `expanded`, `end`, `column-block`, `columns`, and the other directive's static class (`row` copied onto `nfsColumn` names `nfsRow`, for a column row). A copied class is not stripped (D7); a redundant copy of the host's own static class is not reported; the consumer's own classes are not reported.
  2. Placement, on `NfsColumn`, read from the DOM at the first render, where an element is a row when it carries `row` or the `nfsRow` attribute: a host that is not also a row, whose parent element is not a row, warns once "nfsColumn: this column is not a direct child of nfsRow, so its row's block grid, collapse, and gutter do not apply"; a column row (a host that is a row) inside another row with `size` bound warns once "nfsColumn: a column row takes sizes only at the top level, not inside another row (Foundation's Combined Column/Row note)". An element that carries `nfsRow` without `row` is a row whose import was forgotten, which the `strictDirectiveImports` Runtime check reports once on that element and the static check in CI, so its columns, and a column row whose own `NfsRow` is forgotten, give no placement warning.
  3. No Float Grid in the stylesheet (D10), on `NfsRow`, once per realm at the first render of any row: when the host's computed `::after` `content` is `none`, it warns "nfsRow: this page's stylesheet has no Float Grid (.row has no clearfix), so columns stack at full width. Include foundation-grid, or foundation-everything($flex: false), and then nfs-float-grid; a stylesheet that compiles the Flex Grid needs the Flex Grid's directives from ngx-foundation-sites/flex-grid". Measured in three engines: a float row's `::after` `content` is `" "` on the float build and beside the XY Grid, and `none` on the Flex Grid compile and on Foundation's default compile.
  4. Visual order (D9), on `NfsColumn`, on every run and again whenever `NfsMediaQuery.current()` changes, while `push` or `pull` holds a value above 0 in any form: it reads its parent row's element children that carry `column` and whose computed `display` is not `none`, groups them into lines by the top edge of their border box (within 1 px), and orders each line by its left edge, or by its right edge from the right when the row's computed `direction` is `rtl`. Among the columns that are or contain an element CDK's `InteractivityChecker` reports focusable and tabbable, a visual sequence that differs from the DOM sequence warns once per row and distinct sequence, naming the breakpoint and both sequences: "nfsColumn: at the large breakpoint the columns of <div class="row"> that hold focusable content appear in the order 2, 1, but keyboard focus follows the DOM order 1, 2 (WCAG 2.4.3). Write the columns in the order they are read and shown, or push and pull only columns without focusable content." One focusable column, or none, never warns. In the same pass, a column whose border box leaves its row's content box, or intersects another column's box in its line, by more than 1 px warns once per row and breakpoint: "nfsColumn: at the small breakpoint push and pull move a column of <div class="row"> out of its row or over its neighbour, which scrolls the page sideways (WCAG 1.4.10) or covers content; pair each push with the pull of the column it trades places with". Several pushed columns of one row share one report of each kind.
- Runtime check, in the same read phase: each directive calls `include()` only while a value that reads a property is bound, because `nfs-float-grid` carries no rule the grid needs (the Breakpoint service spec's rule for such directives): `NfsColumn` calls `include('nfs-float-grid', ['grid-column-count'])` while `size`, `offset`, `push`, or `pull` holds a count; `NfsRow` calls `include('nfs-float-grid', ['block-grid-max'])` while `up` or `gutter` is bound, naming the count because `--nfs-grid-column-gutter` is legitimately empty under a static gutter; each calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])` while a rules key above the Zero breakpoint is bound. Then `value(input, value, needs)` for each bound input, with the needs from the same mapping that sets its classes: a size `n` needs `{setting: 'grid-column-count', name: n}`; an offset, push, or pull `n` needs `{setting: 'grid-column-count', name: n + 1}`; an `up` count `n` needs `{setting: 'block-grid-max', name: n}`; a gutter key needs `{setting: 'grid-column-gutter', name: key}`; every rules key above the Zero breakpoint needs `{setting: 'breakpoint-classes', name: bp}`. The Zero breakpoint needs no `breakpoint-classes` name, because every Float Grid family adds it to `$breakpoint-classes` (measured). `.collapse`, `expanded`, `end`, and `columnBlock` need nothing. A value that maps to no class passes `null`. The report shape and configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)). One writer: `nfs-float-grid` alone writes `--nfs-grid-column-gutter`; `--nfs-grid-column-count` and `--nfs-block-grid-max` belong to settings the Flex Grid loops over too, so its Library mixin writes them as well (D12), and a missing `nfs-float-grid` is reported only while the Flex Grid's mixin is missing too, as a missing `nfs-progress-bar` is only while `nfs-callout` is missing ([Spec: Progress Bar](../issues/95-spec-progress-bar.md)).

### Comparison with Angular Material (22.2)

Material has no CSS layout grid; the nearest component is `MatGridList`, a tile list that positions its tiles from TypeScript.

| Concern | Material `mat-grid-list` and `mat-grid-tile` | Float Grid directives |
| --- | --- | --- |
| Kind | Components with templates, `MAT_GRID_LIST` parent token, `exportAs: 'matGridList'` | Attribute directives on the consumer's elements; no template, token, or `exportAs` |
| Layout | Computed in `ngAfterContentChecked` and written as inline styles on each tile; `cols`, `rowHeight`, `gutterSize` | Foundation's compiled CSS (floats); the classes are host bindings in server HTML |
| Item size | `colspan`, `rowspan` inputs on the tile | `size`, `offset`, `push`, `pull`, `centered` on the column, per breakpoint through Breakpoint rules |
| Responsive | None built in | CSS media queries through Foundation's breakpoint classes; no JavaScript |
| Semantics | None | None; a list row stays a list |
| Testing | `MatGridListHarness`, `MatGridTileHarness` | DOM-first assertions; no harness |

Borrowed: per-item size inputs on the item and gutters as a setting of the container. Not borrowed: templates and a parent token (Foundation's markup carries the elements, ADR 0001), JavaScript layout and inline styles (Foundation's CSS already lays out, on the server too), and row heights (floats size to their content).

### Implementation level and primitives

Implementation level: native platform. The layout is CSS floats from Foundation's compiled classes, responsive through CSS media queries; push and pull are relative positioning. `@angular/aria` has no layout pattern, and its Grid is the APG Grid composite, which a layout grid is not. `@angular/cdk` has nothing to add in production; in development builds the visual-order check uses CDK's `InteractivityChecker` (building-blocks 1.2 names it among the CDK pieces the library uses) and the Breakpoint service's `current` signal to re-run at a breakpoint change. The Angular layer is two static host classes, one `computed` class list per directive, `nfsBreakpointsToken` for the Zero breakpoint, and, in development builds only, one render callback per directive. No `effect`, no listener, no timer, no observer.

Fallback: none needed. The facts the design rests on (the generated class set in each configuration, the docs' enabling sentence, the Flexbox-mode difference, push and pull against the focus order, the collapse forms, the clearfix probe, the two grids on one page, right to left, `hidden`, and the list row) were measured by this spec's ticket in Chromium, Firefox, and WebKit through Playwright 1.63, over Foundation 6.9.0 compiled with Dart Sass.

### ARIA and keyboard

APG pattern: none. A layout grid is not the ARIA `grid` role, and a role is a promise (building-blocks 1.10).

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsRow]`, `[nfsColumn]` | The host element's own role; the directives add no role, name, or state. A `ul` row of `li` columns stays a list | WHATWG HTML; HTML-AAM |
| A column moved by push or pull | The accessibility tree, the reading order, and the focus order follow the DOM order, not the visual order | CSS 2 relative positioning moves only the box; measured: Tab follows the DOM in three engines |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Moves through focusable content in DOM order, whatever push and pull show (measured in Chromium, Firefox, and WebKit) | Native |

Focus: the directives move no focus. Where push or pull shows columns holding focusable content in another order, focus and the visual order part company, which the development check reports (D9).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Geometry and focus order were measured by this spec's ticket in Chromium, Firefox, and WebKit through Playwright 1.63, over Foundation 6.9.0 on its default settings. The Float Grid draws no colour, so no contrast criterion applies to it.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.3.2 Meaningful Sequence | The DOM order is the reading order. The developer writes columns in the order they make sense in and uses push and pull only to rearrange the look of columns whose visual sequence does not change the meaning (technique C27), as the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md) requires for order classes. The directives cannot judge meaning; the docs require it, every recipe shows it, and every story's play function asserts that the DOM order of its columns is the order their text reads in (ADR 0022, dated note) | Foundation's Source Ordering example reorders text columns; its DOM order reads correctly | Play function of `float-grid--source-ordering` |
| 2.4.3 Focus Order | Focus order follows the DOM order, and the visual order matches it wherever columns hold focusable content. `NfsColumn` reports in development every row whose focusable columns push and pull show in another sequence, at the breakpoint the page is at (D9); the stories keep focusable content out of pushed and pulled columns | With a button in each column of Foundation's first push and pull row, the columns show B, A and Tab reaches A, then B, at 400, 800, and 1100 CSS px in three engines | Browser-level tests of the check; node-level tests of its sequence logic; `float-grid--source-ordering` asserts that nothing is warned |
| 1.4.10 Reflow | At 320 CSS px no float layout scrolls the page sideways: rows are fluid below their 75rem maximum and nested rows stay inside their columns. A column whose content cannot fit a narrow share takes its size only from `medium` up, leaving it full width at the Zero breakpoint, as Foundation's Basics example does; the docs require it and every row story follows it. Every push is paired with the pull of the column it trades places with at the same breakpoints, as in all of Foundation's examples; `NfsColumn` reports in development a column that push or pull moves out of its row (D9). The half-gutter overhang of a row nested in a `.collapse` row is empty gutter inside the grid, not page overflow | Measured at 320 by 640 CSS px on Foundation's nesting, collapse, expanded, and block grid examples: `documentElement.scrollWidth` is 320 in three engines. An unpaired `small-push-6` beside a `small-6` makes it 480 | e2e in three engines: `float-grid--basics`, `--nesting`, `--collapse`, and `--source-ordering` at 320 by 640 px have `documentElement.scrollWidth` at most 320; browser-level tests of the check |
| 1.4.12 Text Spacing | No Float Grid class sets a height, a maximum height, or an overflow (checked in the compiled CSS), so text spacing grows columns and rows and clips nothing | Passes | axe in every story |
| 2.4.11 Focus Not Obscured (Minimum) | No column covers another: push and pull move columns sideways within their line, and paired, they trade places without overlap; `NfsColumn` reports in development a column that push or pull moves over its neighbour (D9), where a focused control could be covered | Passes in Foundation's examples; an unpaired `small-pull-3` covers its neighbour by 80 px at 320 CSS px (measured in three engines) | `float-grid--source-ordering` asserts that no two columns' boxes overlap; browser-level tests of the check |
| 1.3.1 Info and Relationships | The grid adds no meaning; the consumer's elements carry it. A list row stays a list | Passes | axe in every story |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018); axe has no rule for the visual order, which is why the development check exists.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: every value comes from inputs, static attributes, and `nfsBreakpointsToken`, the same on both platforms, and no directive declares a listener. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfsrow=""`, `size="6"`), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Basics, and a single-column row -->
<div nfsRow>
  <div nfsColumn [size]="{small: 2, large: 4}">2 on small, 4 on large</div>
  <div nfsColumn [size]="{small: 4, large: 4}">4 on small and large</div>
  <div nfsColumn [size]="{small: 6, large: 4}">6 on small, 4 on large</div>
</div>
<div nfsRow nfsColumn>Row column</div>

<div class="row">
  <div class="column small-2 large-4">2 on small, 4 on large</div>
  <div class="column small-4 large-4">4 on small and large</div>
  <div class="column small-6 large-4">6 on small, 4 on large</div>
</div>
<div class="row column">Row column</div>

<!-- Offsets, an incomplete row, centring, and an expanded row with small gutters -->
<div nfsRow>
  <div nfsColumn [size]="{large: 1}">1</div>
  <div nfsColumn [size]="{large: 10}" [offset]="{large: 1}">10, offset 1</div>
</div>
<div nfsRow>
  <div nfsColumn [size]="{medium: 3}">3</div>
  <div nfsColumn [size]="{medium: 3}" end>3, end</div>
</div>
<div nfsRow>
  <div nfsColumn size="9" [centered]="{small: true, large: false}">9, centred below large</div>
</div>
<div nfsRow expanded gutter="small">
  <div nfsColumn [size]="{medium: 6}">...</div>
  <div nfsColumn [size]="{medium: 6}">...</div>
</div>

<div class="row">
  <div class="column large-1">1</div>
  <div class="column large-10 large-offset-1">10, offset 1</div>
</div>
<div class="row">
  <div class="column medium-3">3</div>
  <div class="column medium-3 end">3, end</div>
</div>
<div class="row">
  <div class="column small-9 small-centered large-uncentered">9, centred below large</div>
</div>
<div class="row expanded gutter-small">
  <div class="column medium-6">...</div>
  <div class="column medium-6">...</div>
</div>

<!-- Gutters back from large, source ordering of text columns, and a block grid -->
<div nfsRow [collapse]="{small: true, large: false}">
  <div nfsColumn size="6">No gutters below large</div>
  <div nfsColumn size="6">No gutters below large</div>
</div>
<div nfsRow>
  <div nfsColumn [size]="{large: 9}" [push]="{large: 3}">Read first, shown second from large up</div>
  <div nfsColumn [size]="{large: 3}" [pull]="{large: 9}">Read second, shown first from large up</div>
</div>
<div nfsRow [up]="{small: 2, medium: 3, large: 4}">
  @for (item of items(); track item.id) {
    <div nfsColumn columnBlock>{{ item.label }}</div>
  }
</div>

<div class="row small-collapse large-uncollapse">
  <div class="column small-6">No gutters below large</div>
  <div class="column small-6">No gutters below large</div>
</div>
<div class="row">
  <div class="column large-9 large-push-3">Read first, shown second from large up</div>
  <div class="column large-3 large-pull-9">Read second, shown first from large up</div>
</div>
<div class="row small-up-2 medium-up-3 large-up-4">
  <div class="column column-block">...</div>
  <!-- one per item -->
</div>
```

A list used as a row (`<ul nfsRow>` with `<li nfsColumn>`) keeps its list role and markers, and loses its indent to the row's own side margins, so at a narrow width the first item's marker sits outside the viewport while the others show (measured in three engines). A list row without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`, whose margin reset that spec's `nfs-typography-helpers` keeps off a top-level row's `auto` margins (measured in three engines), and `role="list"` where its item count matters (WebKit); the examples show the rows with their markers.

### Animation

None. The Float Grid's CSS declares no transition, and the directives add none. A column inserted or removed with `@if` or `@for` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every grid class exactly as the hydrated DOM does, so the first paint is the final layout. The responsive classes are chosen from the input values, not from the viewport, so the Server breakpoint never matters here.
- Before hydration: the directives touch no DOM outside host bindings, read no `window`, and measure nothing; the development checks and the Runtime check requests run in render callbacks, which never run on the server.
- Full and incremental hydration: host binding values equal the server's, so hydration changes no attribute and no class, and there is no structure to mismatch. Rows and columns register with nothing, so a column may sit in a different Hydration boundary from its row; a Trigger or widget inside a column keeps its own boundary rules.
- Event replay: no directive declares a listener, so none adds `jsaction`; replay of the consumer's own listeners inside columns is unaffected.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a float layout is its server HTML and lays out fully. Inside `@defer (hydrate never)` it keeps its layout for good; only the development checks never run.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or the browser observes: the classes, computed widths, margins, and padding at real viewports, the DOM order against the visual order, where Tab lands, the development reports, and the server HTML. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s and [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s tests, the nearest precedents.

Story ids follow `float-grid--<story>`: `float-grid--basics`, `--nesting`, `--column-row`, `--expanded`, `--offsets`, `--incomplete-rows`, `--centered`, `--gutters`, `--collapse`, `--source-ordering`, `--block-grid`. The stories file sets `id: 'float-grid'` and `component: NfsColumn`; `size`, `offset`, `push`, `pull`, and `centered` are args where a story shows one column's input. Stories use Foundation's default counts, gutter keys, and Class breakpoints only, so the library's Storybook program needs no Variant declaration file (ADR 0040). The preview stylesheet includes `foundation-grid` before `foundation-everything`, the "beside the XY Grid" way with Foundation's equal default counts, and `nfs-float-grid` after it; `foundation-grid` emits the same layout rules under the float build (compiled and compared), so the stories cover it. No story element carries a Foundation class written in the story; column text says what the column's size is at every width, and no pushed or pulled column holds focusable content.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags. At the story viewport (414 px) only the Zero breakpoint's classes apply, so play functions assert classes for every breakpoint and computed geometry for the Zero breakpoint; wider viewports are e2e cases.

- `float-grid--basics`: Foundation's Basics rows. The rows carry `.row`, the columns `.column` and exactly their size classes (`small-2 large-4`); a `small-2` column is a sixth of its row's width, and the columns with only `large` sizes are full width; the text read in DOM order is the visual order.
- `float-grid--nesting`: Foundation's nesting example: each nested row's computed side margins are minus half the small gutter (-10 px), so its columns' content lines up with its parent column's content.
- `float-grid--column-row`: `nfsRow nfsColumn`: the element carries `row` and `column`, its computed `float` is `none`, and its width equals its container's.
- `float-grid--expanded`: a default and an `expanded` row: computed `max-width` is 75rem (1200 px) and `none`.
- `float-grid--offsets`: `size="4" offset="2"` and Foundation's `[offset]="{large: n}"` rows: the classes are set; the first column's left edge is two columns plus its padding from the row's.
- `float-grid--incomplete-rows`: two rows of three `size="3"` columns, the second with `end` on its last column: without `end` the last column's right edge meets the row's and leaves a gap; with it the gap is 0.
- `float-grid--centered`: `size="3" centered` and `size="9" [centered]="{small: true, large: false}"`: the classes are `.small-centered` and `.small-centered .large-uncentered`; each column's left and right gaps to its row are equal.
- `float-grid--gutters`: rows with `gutter="small"` and `gutter="medium"`: the classes are set and the columns' computed side padding is 10 px and 15 px at the story viewport.
- `float-grid--collapse`: a `collapse` row and a `[collapse]="{small: true, large: false}"` row, each with a nested row: the classes are `.collapse` and `.small-collapse .large-uncollapse`; the columns have no side padding; the nested row of the rules form sits flush in its column (overhang 0) and the nested row of the `collapse` form overhangs its column by 10 px, which the story's text explains.
- `float-grid--source-ordering`: Foundation's Source Ordering rows with their text: the classes are set; at the story viewport the first row's second DOM column is shown first; the DOM order is unchanged and reads correctly; no two columns' boxes overlap; no pushed or pulled column holds a focusable element; a `console.warn` spy records nothing.
- `float-grid--block-grid`: `[up]="{small: 2, medium: 3, large: 4}"` with six `columnBlock` columns: the row carries the three `up` classes and each column `.column-block`; at the story viewport each column is half the row's width and its bottom margin is 20 px; the reading order matches the visual order.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here. Foundation's Float Grid CSS, compiled on its defaults, is added to the test document where a case needs computed styles.

- Class mapping, driven by data: every value of every input sets exactly the classes of the mapping table, including the Zero-breakpoint gap (`centered` bare and `true` set `.small-centered`), `.collapse` for a bare `collapse`, `uncollapse` and `uncentered` for `false` rules values, and the static-attribute strings (`size="6"`, `offset="0"`, `push="0"`, `up="3"`), with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose Zero breakpoint is `xs` and whose map adds `xlarge` (values the library's closed types reject are bound through a typed cast); no value and `false` set none; a cast value that is not one class token, and a rules key that cannot be parsed, set none; changing a value swaps its classes and leaves the static class and the consumer's own classes alone; the directives add no attribute but `class`.
- Composition: `nfsRow nfsColumn` on one element carries both static classes and both inputs' classes; `nfsRow` beside a test directive binding its own class keeps both.
- Development checks: `class="columns medium-6 large-push-2 small-centered"` on `nfsColumn` warns once, naming `size`, `push`, `centered`, and the `columns` alias, and the copied classes remain; a redundant `column` does not warn; `row` copied onto `nfsColumn` names `nfsRow`; `class="collapse gutter-small small-up-2"` on `nfsRow` names `collapse`, `gutter`, and `up`; a column whose parent has no `row` class warns once, a column row outside a row does not, a column whose parent carries `nfsRow` with `NfsRow` left out of the test host's imports does not, and a column row with `size` inside another row warns once; with no Float Grid CSS in the document, the first row warns once for the whole realm naming `foundation-grid` and the Flex Grid's entry point, and a second row does not warn again (a test file of its own); with the CSS, nothing is warned; two columns holding a button each, reversed by `size="10" push="2"` and `size="2" pull="10"`, warn once, naming the breakpoint and both sequences; the same after a re-render does not warn again; the same columns with text only, or with a button in one of them only, stay silent; a resize of the test frame to a width where a `large` push no longer applies stays silent and back again does not repeat the report; a `dir="rtl"` row whose pulled column holds the first button is read from the right; `size="6"` beside `size="6" push="6"` warns once that a column leaves its row, and `size="6"` beside `size="6" pull="3"` once that a column covers its neighbour, while Foundation's paired examples stay silent; nothing is checked or warned when `ngDevMode` is false.
- Runtime check, one test file per case because reads and reports are once per realm: with a style block writing `--nfs-grid-column-count: 12; --nfs-block-grid-max: 8; --nfs-grid-column-gutter: small medium; --nfs-breakpoint-classes: small medium large;`, bound values within range are silent; `size` 13, `push` 12, and `up` 9 through a cast report `strictVariantNames` once each, naming `$grid-column-count` and `$block-grid-max`; `gutter="large"` through a cast reports naming `$grid-column-gutter`; with `--nfs-grid-column-gutter` empty, `gutter="small"` reports the name and no missing include; an `xlarge` rules key through a cast reports naming `$breakpoint-classes`; with no properties, a column with `size="6"` reports `strictVariantProperties` once naming `@include nfs-float-grid;`, and a row with only `collapse` or `expanded` asks for nothing.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with every Rendered HTML example, a column row, a nested row, and a copied `class="columns"` on an `nfsColumn` host. `whenStable()` resolves; the server HTML carries every class of the Rendered HTML section on the right elements, the copied class unchanged, and the consumer's own attributes; no element carries `jsaction` from the directives; no development warning or Runtime check report is made on the server.
- Pure logic, the two mappings the directives use: the value-to-classes mapping for each input over a Breakpoint map (the Zero-breakpoint gap of `centered`, `.collapse` against the rules form, `false` rules values, guards against values that are not one class token), and the visual-order sequence over columns given as `{top, left, right, focusable}` with a direction (line grouping within 1 px, right-to-left ordering, fewer than two focusable columns), with the out-of-row and overlap tests over the same boxes and the row's content box (1 px tolerance).
- Sass compile, over Foundation 6.9.0's settings file with `@import 'ngx-foundation-sites';` after Foundation and `@include nfs-float-grid;` after `foundation-grid`:
  - Foundation's float build (`$global-flexbox: false;` and `foundation-everything($flex: false)`) and the beside-the-XY-Grid form (`foundation-grid` before `foundation-everything`) both compile, and the mixin emits exactly `:root { --nfs-grid-column-count: 12; --nfs-block-grid-max: 8; --nfs-grid-column-gutter: small medium; }` and no other rule.
  - `$grid-column-count: 16; $block-grid-max: 4;` writes 16 and 4; `$grid-column-gutter: (small: 20px, medium: 30px, xlarge: 40px)` writes `small medium xlarge`; `$grid-column-gutter: 30px` writes an empty `--nfs-grid-column-gutter` and keeps the counts.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Breakpoints: at 800 and 1100 px wide, the `float-grid--basics` columns' widths are Foundation's (`large-4` a third of the row at 1100 px); `float-grid--offsets`' offset columns start where their offsets put them only at 1100 px; `float-grid--centered`'s second column is centred at 800 px and not at 1100 px; `float-grid--collapse`'s rules-form row has column padding again at 1100 px; `float-grid--source-ordering`'s `large` pair swaps places at 1100 px only; `float-grid--block-grid` shows three columns per line at 800 px and four at 1100 px; `float-grid--incomplete-rows` shows the gap and its removal at 800 px.
- Reflow (1.4.10): at 320 by 640 px, `documentElement.scrollWidth` is at most 320 in `float-grid--basics`, `--nesting`, and `--collapse`.

Against the prerendered fixture app, on the Float Grid route (the Rendered HTML examples):

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML at 400 and 1100 px; the layout carries its classes and renders its breakpoint forms before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

No manual assistive-technology test: the directives expose nothing to assistive technology, and the focus-order premise of the check was measured once as platform behaviour.

## Out of Scope

- Foundation's class-name parameters of `foundation-grid(...)` (`$row`, `$column`, `$push`, `$pull`, `$center`, `$uncenter`, `$collapse`, `$uncollapse`, `$offset`, `$end`, `$expanded`, `$block`, `$gutter`) set to other names: the directives bind Foundation's default names, the library's mixin cannot read another mixin's arguments (the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s D12), and the renames served hand-written markup, which the class rule removes. `$grid-column-alias` needs nothing: the directives never bind the alias. Category: `other`.
- The `.columns` alias as a bound class: it extends `.column` and has no rule of its own, so binding it adds nothing; a copied one is reported. Category: `other`.
- Foundation's semantic grid mixins (`grid-row`, `grid-column`, `grid-layout`, `grid-context`, `grid-column-position`, `grid-layout-center-last`, and the rest) in the consumer's own Sass for the consumer's own classes: the class rule governs Foundation's and the library's classes, and the directives set only the classes Foundation generates. Category: `scope-boundary`.
- A compile-time or runtime check that `$grid-column-count` equals `$grid-columns` on a page that compiles both grids: neither Library mixin can tell whether the other grid's classes were compiled, because `$xy-grid` stays `true` in Foundation's settings even in the float build, so a check would warn pages that use one grid; the spec states the requirement instead. Category: `other`.
- Flex alignment and order on float rows and columns: a float row is not a Flex parent, so the Flexbox Utilities' classes do nothing there; centring is `centered`, and Source ordering is `push` and `pull`. Flex rows are the [Spec: Flex Grid](../issues/101-spec-flex-grid.md)'s. Category: `scope-boundary`.
- The legacy Flex Grid (`.row` and `.column` as flex containers and items, `.shrink`, `.<bp>-expand`, `.<bp>-unstack`, `.is-collapse-child`): the [Spec: Flex Grid](../issues/101-spec-flex-grid.md), which shares this spec's directive and input names for the classes both grids generate. Category: `scope-boundary`.
- Compiling the Float Grid beside the Flex Grid in one stylesheet: both style the same `.row` and `.column` elements, and measured by the Flex Grid's ticket, a justified flex row leaves 178 px empty beside the Float Grid's rules; Foundation's docs say the two "don't play nice together". Category: `other`.
- Showing and hiding columns by breakpoint (`.hide-for-*`, `.show-for-*`): the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). Category: `scope-boundary`.
- Removing a list row's markers (`.no-bullet`): the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`. Category: `scope-boundary`.
- A `dir="rtl"` region inside a left-to-right compile: Foundation compiles the float side, offsets, and push and pull against `$global-text-direction`, and mirroring them per region would need library CSS for every family of the grid; a right-to-left page compiles Foundation with `$global-text-direction: rtl` (measured: the first DOM column is then at the right). Category: `other`.
- The float build's effect on other components (`$global-flexbox: false`, Foundation's Flexbox mode): compile-time configuration of those components, never an input (building-blocks 1.13), which their own specs describe. Category: `scope-boundary`.
- An ARIA `grid`, `row`, or `gridcell` role on rows and columns: a CSS layout is not the APG Grid composite, whose two-dimensional arrow keys a layout does not have. Category: `platform-or-a11y`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Two attribute directives, one per class that names an element of the layout (`[nfsRow]`, `[nfsColumn]`), each a static host class on any element; entry point `ngx-foundation-sites/float-grid`; no `exportAs`. The Flex Grid's directives for the same classes take the same selectors, class names, and input names in `ngx-foundation-sites/flex-grid`, while each grid's type aliases carry its name (`NfsFloatGrid...`, `NfsFlexGrid...`) | ADR 0001 and ADR 0039; the names follow the classes (building-blocks 1.3, the XY Grid's rule for layout systems) and are the placeholders the [Spec: Equalizer](../issues/34-spec-equalizer.md) wrote; Foundation names the two legacy grids' classes the same and one stylesheet holds only one of them, so one set of names lets a page change grids by its imports; the alias prefix keeps apart two unions of different values, as the [Spec: Flex Grid](../issues/101-spec-flex-grid.md)'s D7 decided | One shared directive pair for both legacy grids (it would type inputs whose classes the other grid lacks: push, pull, centring, `end`, and gutters are float-only, `shrink`, `expand`, and `unstack` flex-only) (`other`); prefixed names such as `nfsFloatRow` (not Foundation's class names, against building-blocks 1.3) (`other`); a `nfs-row` component (Foundation's markup carries the elements; ADR 0001) (`scope-boundary`) |
| D2 | Input names by building-blocks 1.4: `size`, `offset`, `push`, `pull`, and `up` for the counted families and `gutter` for the gutter keys (rule 3); booleans `expanded`, `end`, `columnBlock` (rule 4); `collapse` and `centered` for the families with an on and an off class per breakpoint | The decided naming rule, applied mechanically; `size`, `offset`, and `up` match the XY Grid's, so the three grids read alike | Separate `uncollapse` and `uncentered` inputs (one family split in two, and two inputs that could contradict each other at one breakpoint) (`other`); a class-name string such as `size="medium-6"` (ADR 0039) (`variant-as-class`) |
| D3 | `collapse` takes a boolean or Breakpoint rules of booleans: `true` sets `.collapse`; a rules key sets `.<bp>-collapse` for `true` and `.<bp>-uncollapse` for `false`; never both | Foundation generates both an unprefixed `.collapse` and `.<bp>-collapse`, and they differ for nested rows (measured: 10 px overhang against 0); `.<bp>-uncollapse` cannot undo `.collapse` (0,2,0 against 0,3,0), so one value shape per row keeps every combination that works reachable and none that silently fails; a family with an on and an off class per breakpoint is a valued responsive family (building-blocks 1.4), as the Tabs' `orientation` rules are | A Breakpoint query, the XY Grid's `marginCollapse="medium"` shape (it cannot say "collapsed below large", which needs `.large-uncollapse`) (`other`); mapping `true` to `.small-collapse` and never binding `.collapse` (leaves a documented Foundation class without a home, ADR 0039) (`other`) |
| D4 | `centered` takes a boolean or rules of booleans; `true` fills the Zero-breakpoint gap with `.small-centered`, read from `nfsBreakpointsToken`; bare `size`, `offset`, `push`, `pull`, and `up` values set the Zero breakpoint's prefixed class | Foundation generates no `.centered` (checked); every other family has a prefixed Zero-breakpoint class; the token is the same on server and client (the Button's D20) | Hard-coding `small` (a consumer may rename the Zero breakpoint) (`other`) |
| D5 | `push` and `pull` are offered, over the offset range with `0` as Foundation's reset, and carry the Source ordering requirement and check (D9) | ADR 0039 gives every class a typed input and passes the ordering hazard to the grid specs; Foundation's docs name `0` as the reset | Leaving push and pull out (every Foundation class gets a typed input, ADR 0039) (`superseded`); one signed `shift` input (not Foundation's vocabulary, and `push` and `pull` are separate class templates) (`other`) |
| D6 | Counts are closed ranges over `NfsGridColumnCountOverrides` and `NfsBlockGridMaxOverrides`, gutter keys over a new `NfsGridColumnGutterOverrides`, responsive values Breakpoint rules over Class breakpoints with a bare value meaning the Zero breakpoint; the aliases are exported and named in every input's type arguments | ADR 0040 and building-blocks 1.4; the count registries are the Variant declaration tooling spec's; `$grid-column-gutter`'s keys generate the `.gutter-<key>` names, so they need a registry of their own | `numberAttribute` (accepts any value) (`superseded`); typing `gutter` over Class breakpoints (the gutter map's keys are its own list, not `$breakpoint-classes`) (`other`) |
| D7 | One `computed` class list per directive through `[class]`; copied Foundation classes are reported in development, not stripped | The Button's, Callout's, and XY Grid's rule for open families | A record of every owned class set `false`, the Menu's form (the class set depends on the consumer's settings) (`other`) |
| D8 | `NfsColumn` binds `.column`, never the `.columns` alias | Foundation always generates `.column`; `.columns` is an `@extend` alias for grammar that `$grid-column-alias` may remove | Binding `.columns` as Foundation's docs examples write it (it disappears with the alias off) (`other`) |
| D9 | The DOM order is the reading and focus order, and every push is paired with the pull it trades places with: requirements, shown in every recipe and asserted by every story; a development check reports, from the columns' box geometry and again at each breakpoint change, columns with focusable content that push and pull show out of DOM order, and a column they move out of its row or over its neighbour | WCAG 1.3.2, 2.4.3, 1.4.10, and 2.4.11; measured in three engines: the columns show B, A while Tab reaches A, B; an unpaired push scrolls the page 160 px sideways at 320 CSS px and an unpaired pull covers its neighbour by 80 px; axe has no rule for either; push and pull move boxes only sideways within a line, so line grouping by the top edge and ordering by the start edge give the visual order exactly; the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s D9 and D10 for order classes | Documenting only (a hazard needs a signal, the Flexbox Utilities' D9) (`platform-or-a11y`); checking every row, not only those with push or pull (pays for rows the grid did not reorder) (`other`) |
| D10 | A development check, once per realm, that the page's stylesheet has a Float Grid, read from the row's clearfix (`::after` `content`) | A page on Foundation's default compile, or on the Flex Grid compile the docs' sentence produces, has no float rows and nothing reports it; the clearfix is present only under `foundation-grid` (measured in three engines on four compiles); once per realm, because the cause is one stylesheet | Reading the column's computed `float` (a centred column and a column row are `float: none` by design) (`other`); a `strictVariantProperties` report (the Variant properties can be present from the Flex Grid's mixin, D12, and prove nothing about `foundation-grid`) (`other`) |
| D11 | Development placement checks: a column outside a row, and a sized column row inside another row | Silent failures in Foundation's markup that neither the types nor axe report; they read the DOM only in development (building-blocks 1.9) | A row token through DI (nothing in production needs it) (`other`) |
| D12 | `nfs-float-grid` is a properties-only Library mixin writing `--nfs-grid-column-count`, `--nfs-block-grid-max`, and `--nfs-grid-column-gutter`; the first two are also written by the Flex Grid's mixin, under the one-writer rule's exception for a setting no entry point owns | ADR 0012 gives an entry point with an Open Variant family a properties-only mixin when nothing needs custom CSS; `$grid-column-count` and `$block-grid-max` serve both legacy grids and an application includes either mixin alone, the case the Progress Bar spec recorded for `$foundation-palette` | `nfs-float-grid` as the only writer, with the Flex Grid reading it (a Flex Grid page would include a Float Grid mixin) (`other`); a presence property that is not a Variant property (the Progress Bar spec's rejected option) (`other`) |
| D13 | A page that compiles both grids includes `foundation-grid` before the XY Grid's classes and keeps `$grid-column-count` equal to `$grid-columns`; documented, not checked | Measured in three engines: the other order halves vertical XY cells' width, and unequal counts make the last-compiled grid's offsets apply to both | A library rule scoping the Float Grid's sizes to `.row >` (it would copy and override Foundation's rules, against the Styling Guidelines) (`other`); a count check (Out of Scope) (`other`) |
| D14 | The spec states three ways to compile the Float Grid and corrects the docs' sentence | Measured: the docs' sentence under `foundation-everything` compiles the Flex Grid; the float build switches Flexbox mode off everywhere; `foundation-grid`'s rules are the same in both Flexbox modes but for the clearfix's `flex-basis` and `order` | Requiring Foundation's float build (it switches off the XY Grid and the Flexbox Utilities for the whole application) (`other`) |
| D15 | No ARIA role, no tokens, providers, or host directives; other directives are written beside or inside; same-named inputs are avoided by nesting | A layout grid is not the APG Grid composite; Foundation's selectors carry the row's settings to its columns; building-blocks 1.9 | `role="grid"`, `row`, and `gridcell` (they promise arrow-key navigation) (`platform-or-a11y`) |
| D16 | Examples and stories write no class; the docs' `.display` demo class and the demo spans' visibility classes are left out; the block grid's images become text | ADR 0039 and the Storybook conventions; the demo classes are the docs site's own styling | Keeping the demo classes (they style nothing without the docs site) (`other`) |

### Usage examples

```ts
@Component({
  selector: 'app-legacy-article',
  imports: [NfsRow, NfsColumn],
  template: `
    <div nfsRow>
      <!-- The article comes first in the DOM, the order it is read in; the sidebar is shown on the left from
           large up. Only the article holds links, so focus still follows what is shown, and no warning. -->
      <article nfsColumn [size]="{large: 9}" [push]="{large: 3}">
        <h1>{{ title() }}</h1>
        <p>{{ body() }} <a href="/archive">Archive</a></p>
      </article>
      <aside nfsColumn [size]="{large: 3}" [pull]="{large: 9}" aria-label="About the author">
        <p>{{ author() }}</p>
      </aside>
    </div>
  `,
})
export class LegacyArticle {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  readonly author = input.required<string>();
}
```

```scss
// The consumer's global stylesheet, the "beside the XY Grid" way, after Foundation's settings, Foundation,
// and the library's Sass are imported: the Float Grid first, so the XY Grid's cell width wins over the
// Float Grid's size classes in vertical grids, and equal column counts, so both grids' offsets agree.
@include foundation-grid;
@include foundation-everything;
@include nfs-breakpoint-properties;
@include nfs-xy-grid;
@include nfs-float-grid;
```

```scss
// Or Foundation's float build, for an application on the Float Grid alone: $global-flexbox: false; set
// between Foundation's settings and Foundation itself, then these includes. It also turns Flexbox mode off
// in every component and leaves out the XY Grid and the Flexbox Utilities.
@include foundation-everything($flex: false);
@include nfs-breakpoint-properties;
@include nfs-float-grid;
```

The recipes select no Foundation or library class.

```html
<!-- Equal-height panels on the float grid, the Equalizer spec's residue case -->
<div nfsRow nfsEqualizer equalizeOn="medium">
  <div nfsColumn [size]="{medium: 4}"><div nfsCallout nfsEqualizerWatch>...</div></div>
  <div nfsColumn [size]="{medium: 4}"><div nfsCallout nfsEqualizerWatch>...</div></div>
  <div nfsColumn [size]="{medium: 4}"><div nfsCallout nfsEqualizerWatch>...</div></div>
</div>

<!-- Gutters that stop below large, and an expanded band with small gutters at every width -->
<div nfsRow [collapse]="{small: true, large: false}">...</div>
<div nfsRow expanded gutter="small">...</div>
```

`nfsEqualizer` and `nfsEqualizerWatch` are the [Spec: Equalizer](../issues/34-spec-equalizer.md)'s and `nfsCallout` the [Spec: Callout](../issues/89-spec-callout.md)'s; the callout sits inside the column, because both declare `size`.

A 16-column float grid with an extra gutter key, as the library's tooling generates the Variant declaration file from `$grid-column-count: 16;` and `$grid-column-gutter: (small: 20px, medium: 30px, xlarge: 40px);`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsGridColumnCountOverrides {
    count: 16;
  }
  interface NfsGridColumnGutterOverrides {
    xlarge: true;
  }
}
```

With it, `size="16"`, `[push]="{large: 15}"`, and `gutter="xlarge"` compile and `size="17"` fails; in a program that leaves the file out, `size="16"` fails (ADR 0040). A consumer with `$grid-column-gutter: 30px` gets `small: false` and `medium: false`, so `gutter` accepts no name.

### Platform features to adopt when the browser target moves

- CSS `reading-flow` does not apply: it reorders focus and reading for flex and grid containers, and push and pull are relative positioning of floats. The upgrade path for a float layout is the XY Grid.

### Foundation behaviour changed or dropped

- Every class is set by a directive input; the consumer writes none (ADR 0039).
- The docs' source ordering example gains a requirement: the DOM order is the reading and focus order, and the directives report focusable content that push and pull show out of it (D9).
- The Zero-breakpoint gap of centring is filled: `centered` binds `.small-centered` (D4).
- The docs' sentence on enabling the Float Grid is corrected: under `foundation-everything` it needs `$flex: false` (D14).
- The docs' `.display` demo class and demo spans are left out (D16).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The directives rely on Foundation's export mixin `foundation-grid` (included by `foundation-everything` only while its `$flex` argument is `false`), configured through `$grid-row-width`, `$grid-column-count`, `$grid-column-gutter`, `$grid-column-align-edge`, `$grid-column-alias`, and `$block-grid-max`; every class the directives bind is already styled by it. The entry point's Library mixin is `nfs-float-grid` (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-grid`. (1) Rules: none. The Float Grid meets every criterion this spec names with Foundation's CSS and the directives' classes (measured). (2) Reused settings: `$grid-column-count`, `$block-grid-max`, and `$grid-column-gutter`, read from the consumer's compile. (3) Custom properties the directives write: none. (4) Motion classes: none, and no `prefers-reduced-motion` override. (5) What breaks when the include is missing: no layout (Foundation's CSS does it all); the Variant properties are absent, so the declaration-file generator finds no column count, block-grid count, or gutter keys, and the development Runtime check reports the missing include once a count is bound, unless the Flex Grid's mixin writes the counts (D12). (6) Variant properties, on `:root`: `--nfs-grid-column-count` from `$grid-column-count` (12 by default) and `--nfs-block-grid-max` from `$block-grid-max` (8 by default), both counts, also written by the Flex Grid's mixin with the same values; `--nfs-grid-column-gutter`, the keys of `$grid-column-gutter` space-separated (`small medium` by default), written as the empty list while the setting is a single length, and written only by `nfs-float-grid`. The Class breakpoints the responsive inputs read are `nfs-breakpoint-properties`' `--nfs-breakpoint-classes`. A consumer who renames a class through `foundation-grid(...)`'s parameters cannot use the directives, because the mixin cannot see Foundation's arguments (Out of Scope). No required setting: Foundation's defaults pass.

### Notes

- The `hidden` attribute hides a row and a column (measured: computed `display: none` in three engines), because the Float Grid sets no `display` on them, unlike the XY Grid's `.grid-x`; the Visibility Classes' directives or `@if` hide them by breakpoint.
- A reset (`push` or `pull` 0, `centered` `false` in rules) also clears the column's offset and centring from that breakpoint up, because Foundation's reset sets both side margins to 0; bind the offset again at that breakpoint where it should stay.
- A block grid clears every `n`th column with `:nth-of-type`, so all its columns are one element type (all `div`, or all `li`).
- Static input attributes stay in the DOM, as Angular leaves every static attribute (`<div nfsColumn size="6">` keeps `size="6"`). They mean nothing on the hosts the Float Grid uses; a consumer who wants none binds the input instead (`[size]="6"`).
- Nested rows: a column may hold rows; Foundation's `.row .row` pulls each nested row out by half a gutter, and `[collapse]="{small: true}"` on the outer row removes those margins, while `collapse` removes only a collapsed nested row's own.
- Right to left: the Float Grid follows the compile's `$global-text-direction`, not the element's `dir`; the visual-order check reads the row's computed `direction` only to order a line from the right, as a right-to-left reader reads it.
