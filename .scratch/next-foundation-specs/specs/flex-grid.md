# Spec: Flex Grid

Ticket: [Spec: Flex Grid](../issues/101-spec-flex-grid.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)). The nearest precedent is the [Spec: XY Grid](../issues/99-spec-xy-grid.md); this spec follows its choices and says why wherever the Flex Grid's CSS forces a difference.

## Problem Statement

A developer maintaining a site built on Foundation for Sites' Flex Grid lays out pages with `.row` elements holding `.column` (or `.columns`) elements, sized per breakpoint and column count: `.small-6`, `.medium-expand`, `.shrink`, `.large-offset-2`, `.medium-up-3`, `.medium-unstack`, `.small-collapse`, `.medium-uncollapse`, `.expanded`, `.column-block`, `.is-collapse-child`. The Flex Grid is legacy since Foundation 6.4 and disabled by default: `foundation-everything` prints the XY Grid unless `$xy-grid` is false. It is a layout system with no Plugin, so the markup is the whole contract, and that contract leaves the hard parts to the author:

- Every size is a class name built from Sass settings (`$grid-column-count`, `$block-grid-max`, `$breakpoint-classes`). A misspelt `medum-6`, a `small-13` on a 12-column grid, or `large-up-9` renders a column that expands or no block grid, and nothing reports it.
- The class templates have gaps that look like classes: there is no `.small-expand`, no `.small-unstack`, and no responsive `.medium-shrink`. `.shrink` comes after every size rule in the compiled CSS, so `class="column shrink medium-6"` shrinks at every width (measured: 124 px wide at 1024 px in three engines); an expand from a larger breakpoint keeps the smaller breakpoint's `max-width` (`small-6 large-expand` alone in a row stays at 50 percent at 1280 px, measured).
- `.collapse` and the responsive `.<bp>-collapse` look alike and differ: `.collapse` also takes the negative margins off rows nested in its columns, while `.small-collapse` does not, and `.collapse` outranks `.medium-uncollapse`, so `class="row collapse medium-uncollapse"` stays collapsed at medium (measured).
- A column without a size expands and never wraps, so a row of several columns squeezes them at small widths. Foundation's own "Vertical Alignment of child columns" example at 320 CSS px overflows its last column by 27 px and scrolls the page sideways (scroll width 347 px, measured in three engines), a WCAG 1.4.10 failure that axe does not report; a nested row inside a `.small-collapse` row sticks out by half a gutter and scrolls the page 10 px sideways (measured).
- An element that is both `.row` and `.column` is a block, not a row: Foundation's `.column.row.row { display: block }` stacks any columns placed inside it (measured).
- The Flex Grid cannot share a stylesheet with the other grids: compiled beside the Float Grid, whose `.row` and `.column` rules apply to the same elements, a justified row leaves 178 px empty at its end; compiled beside the XY Grid, its unscoped `.small-6 { max-width: 50% }` halves the width of a vertical XY grid's cells (both measured in three engines).
- Under the library's class rule the developer writes no Foundation class at all, so every one of these classes needs an Angular home.

A server-rendered application adds the usual second problem: the layout must already be right in the server HTML, must not change at hydration, and must hold inside dehydrated and `hydrate never` blocks, where no JavaScript runs.

## Solution

Two attribute directives in one entry point, one per class that names an element of the layout: `[nfsRow]` binds `.row` and `[nfsColumn]` binds `.column`. They carry the same class names and selectors as the [Spec: Float Grid](../issues/100-spec-float-grid.md)'s directives, because the two legacy grids share Foundation's markup and one application compiles only one of them; each lives in its grid's own entry point. Every other Flex Grid class is set by a typed Variant input of the directive whose element Foundation puts it on: the column's `size` (a count or `expand` per breakpoint, bare for the Zero breakpoint or in Breakpoint rules, or `shrink` at every width), `offset`, and `columnBlock`; the row's `up` block grid, `collapse` (Foundation's `.collapse` from the bare attribute, or collapse and uncollapse per breakpoint from Breakpoint rules), `unstack` from a Class breakpoint, `expanded`, and `isCollapseChild`. Counts and breakpoints are closed over the developer's own Sass through the Variant registries, so `size="13"` on a 12-column grid, `[size]="{meduim: 6}"`, `up="9"`, and `[size]="{medium: 'shrink'}"` fail to compile ([ADR 0040](../adr/0040-variant-input-types.md)).

The directives add no role and no attribute but `class`; the grid's CSS never reorders, so reading and focus order follow the DOM. In development builds they report copied Foundation classes, a column outside a row or inside a column row, a size in an unstacking row, a row without the Flex Grid's CSS, and, measured at the current viewport, a column whose content is wider than the column (1.4.10) and a nested row that sticks out of a collapsed parent. Alignment, self-alignment, and source ordering come from the Flexbox Utilities' directives written beside `nfsRow` and `nfsColumn`. Every effect is a host binding on signal inputs, no directive declares a listener, and nothing is measured in production, so the grid is its server HTML in every rendering mode. The `nfs-flex-grid` Library mixin adds no CSS; it writes the two Variant properties the Runtime checks and the Variant declaration file's generator read. Enabling the grid is Sass configuration the spec states: `$xy-grid: false` before `foundation-everything`, or `foundation-flex-grid` by hand, never beside the XY Grid's or the Float Grid's export mixin.

## User Stories

1. As an application developer on the legacy Flex Grid, I want to write `nfsRow` on a `div` and `nfsColumn` on its children and get Foundation's Flex Grid, so that I write no Foundation class.
2. As an application developer, I want the directives to work on any element (`div`, `section`, `article`, `ul` and `li`), so that my layout keeps the semantics of my content.
3. As an application developer, I want `size="6"` to give me Foundation's `small-6`, so that the common case is one attribute.
4. As an application developer, I want `[size]="{medium: 6, large: 4}"` to give me `medium-6 large-4`, so that responsive widths are one typed binding.
5. As an application developer, I want a column without a size to expand into the space its row leaves, as Foundation's bare `.column` does, so that equal columns need nothing.
6. As an application developer, I want `[size]="{small: 12, large: 'expand'}"`, so that columns stack on small screens and share the row from large up, as Foundation's responsive example does.
7. As an application developer, I want `size="shrink"`, so that a column takes only the space its content needs.
8. As an application developer, I want `[size]="{medium: 'shrink'}"` and `[size]="{small: 'shrink', medium: 6}"` to fail to compile, so that I never write a shrink that Foundation's CSS cannot give me or that silently wins over my sizes.
9. As an application developer, I want `size="expand"` and `{small: 'expand'}` to set no class, so that the Zero breakpoint's expand is the column's own default and never a class that does not exist.
10. As an application developer with `$grid-column-count: 16`, I want `size="16"` to compile once my Variant declaration file says so, and `size="17"` to fail, so that my Sass stays the only column count.
11. As an application developer, I want `[size]="{meduim: 6}"` and `size="13"` to fail to compile, so that a typo never ships an expanding column.
12. As an application developer, I want `offset="2"` and `[offset]="{large: 2}"`, so that I can push a column right by whole columns.
13. As an application developer, I want `[up]="{small: 1, medium: 2, large: 3}"` on a row, so that its columns share each row equally, Foundation's block grid.
14. As an application developer, I want `columnBlock` on the columns of a block grid, so that wrapped rows of columns get Foundation's bottom gutter.
15. As an application developer, I want `unstack="medium"` on a row, so that its columns stack below medium and share the row from medium up without a size on each column.
16. As an application developer, I want the bare `collapse` attribute to remove every gutter of a row, including the nested rows' negative margins, as Foundation's `.collapse` does.
17. As an application developer, I want `[collapse]="{small: true, medium: false}"`, so that a row has no gutters on small screens and gets them back from medium, as Foundation's `small-collapse medium-uncollapse` example does.
18. As an application developer, I want `isCollapseChild` on a row nested in a responsively collapsed row, so that it does not stick out of its parent.
19. As an application developer, I want `expanded` on a row, so that it spans the full width, as Foundation's `.expanded` row does.
20. As an application developer, I want to write `nfsRow` and `nfsColumn` on one element for a centred, padded block of content, as Foundation's column row is.
21. As an application developer, I want alignment, self-alignment, and source ordering on rows and columns to come from the Flexbox Utilities' `nfsFlexAlign` and `nfsFlexChild` written beside `nfsRow` and `nfsColumn`, so that each family has one owner.
22. As an application developer, I want the directives to import from one entry point, `ngx-foundation-sites/flex-grid`, so that a `@defer` block can split them and the XY Grid's and Float Grid's entry points stay out of my bundle.
23. As an application developer moving from the Float Grid, I want the same directive names and the shared inputs under the same names, so that I change the import path and the compiler lists what else must change.
24. As an application developer, I want the spec to tell me exactly how to enable the Flex Grid in my Sass and which other grid it cannot sit beside, so that the classes exist and do not fight another grid's.
25. As an application developer, I want a development warning when a row has no Flex Grid CSS behind it, so that a grid I forgot to enable does not fail silently.
26. As an application developer migrating Foundation markup, I want a copied `class="columns small-6 large-offset-2"` or `class="row medium-unstack"` reported in development, naming the input to bind, so that I learn the directive form.
27. As an application developer, I want a development warning when a column's parent is not a row, or is a column row, so that a size that cannot apply does not fail silently.
28. As an application developer, I want a development warning when a column in an unstacking row has a size, so that I learn that the row's unstack overrides it and the size only caps the width.
29. As an application developer, I want a development warning when a column's content is wider than the column at my current viewport, so that I stack the row before a user at 400 percent zoom has to scroll sideways.
30. As an application developer, I want a development warning when a nested row sticks out of its collapsed parent, so that I bind `isCollapseChild` before the page scrolls sideways.
31. As an application developer, I want a development report when a bound size, offset, block-grid count, or breakpoint has no class in my compiled CSS, or when I forgot the `nfs-flex-grid` include, so that drift between my Sass and my types surfaces early.
32. As a user at 400 percent zoom, I want every row to stack or fit at 320 CSS px, so that I never scroll sideways to read a column.
33. As a user who enlarges text spacing, I want columns to grow with their text, so that nothing is clipped.
34. As a keyboard or screen reader user, I want the reading and focus order of columns to be their DOM order, so that the grid never reorders what I hear or tab through.
35. As a developer of a server-rendered application, I want the server HTML to carry every grid class, so that the first paint is final and hydration changes nothing.
36. As a developer using `@defer (hydrate never)` or incremental hydration, I want rows and columns to keep their layout and to work across Hydration boundaries, so that static regions need no JavaScript.
37. As a developer of a zoneless application, I want the directives to need no zone.
38. As a library maintainer, I want every behaviour asserted through classes, computed widths, page overflow at real viewports, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

The Flex Grid has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its contract is Foundation's flex grid Sass partial (the `foundation-flex-grid` export mixin and the `flex-grid-*` semantic mixins), the grid settings it shares with the Float Grid, and the Flex Grid docs page. Dropped options: none, because there are none. Every class below was confirmed by compiling Foundation 6.9.0 with Dart Sass, on its defaults and with `$grid-column-count: 16; $block-grid-max: 4; $breakpoint-classes: (small medium large xlarge);`.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Row | `.row` | `flex-grid-row` | `max-width: $grid-row-width` (75rem), centred with auto margins, `display: flex; flex-flow: row wrap`. A nested row (`.row .row`) takes negative margins of half the gutter, and no `max-width` inside a row that is not expanded |
| Expanded row | `.expanded` on `.row` | fixed class | `max-width: none`; its nested rows get auto margins |
| Column | `.column`; `.columns` is an `@extend` alias of it, printed unconditionally | `flex-grid-column` | `flex: 1 1 0px; min-width: 0`, padding of half `$grid-column-gutter` (10 px, 15 px from medium): a column without a size expands into the leftover space and never wraps |
| Column row | `.column` and `.row` on one element | `.column.row.row` | `float: none; display: block`, so it is a centred, padded block, not a flex row; a column row inside a row loses its own margin and padding. Not on the Flex Grid docs page; the Float Grid docs page describes the pattern |
| Sizes | `.<bp>-<n>` for every Class breakpoint and the Zero breakpoint, `n` from 1 to `$grid-column-count` (12) | `$grid-column-count`, `$breakpoint-classes` | `flex: 0 0 <n/12>; max-width: <n/12>` |
| Expand | `.<bp>-expand` for Class breakpoints above the Zero breakpoint | fixed name | `flex: 1 1 0px` inside the breakpoint's media query; it sets no `max-width`, so a smaller breakpoint's size keeps capping the column (measured) |
| Shrink | `.shrink` only, no responsive form | fixed name | `flex: 0 0 auto; max-width: 100%`, printed after every size and expand rule, so it wins over all of them at every width (measured) |
| Offsets | `.<bp>-offset-<n>` for every Class breakpoint and the Zero breakpoint, `n` from 0 to `$grid-column-count` minus 1 | `grid-column-offset` | `margin-left` (`$global-left`) |
| Block grid | `.<bp>-up-<n>` on `.row`, every Class breakpoint and the Zero breakpoint, `n` from 1 to `$block-grid-max` (8) | `flex-grid-layout` | `.small-up-2 > .column { flex: 0 0 50%; max-width: 50% }`, which outranks the column's own size; columns in one line stretch to equal height (measured) |
| Block grid column | `.column-block` | `grid-column-margin` | `margin-bottom` of the gutter (20 px, 30 px from medium); its last child's bottom margin is 0 |
| Unstack | `.row.<bp>-unstack` for Class breakpoints above the Zero breakpoint | fixed name | `> .column { flex: 0 0 100% }` below the breakpoint and `flex: 1 1 0px` from it, at specificity (0,3,0), so it overrides column sizes; a size's `max-width` still applies (measured: a `small-6` column is 50 percent wide below medium in a `medium-unstack` row) |
| Collapse | `.collapse` on `.row` | fixed name | Column padding 0 at every width; nested rows directly in its columns and a nested `.row.collapse` lose their negative margins |
| Responsive collapse | `.<bp>-collapse`, `.<bp>-uncollapse` for every Class breakpoint and the Zero breakpoint | `grid-col-collapse`, `grid-col-gutter` | From the breakpoint up, on `> .column` only: nested rows keep their negative margins. `.row.collapse > .column` outranks `.<bp>-uncollapse > .column`, so `.collapse` cannot be uncollapsed (measured) |
| Collapse child | `.is-collapse-child` on a nested `.row` | fixed name | `margin-right: 0; margin-left: 0` at every width. Written by the author, not by Foundation's JavaScript |
| Export mixin | `foundation-flex-grid` | no arguments | Printed by `foundation-everything` only while `$xy-grid` is false (with its default `$flex: true`); measured: the default compile prints no `.row` rule, and `$xy-grid: false` prints the Flex Grid and no `.grid-x` |
| Semantic mixins | `flex-grid-row`, `flex-grid-column`, `flex-grid-layout`, `flex-grid-size`, `grid-column-gutter`, `grid-column-offset` | Foundation's Sass | For the consumer's own classes in the consumer's own Sass (Out of Scope) |

Every responsive family is printed by Foundation's breakpoint iterator with the Zero breakpoint always added: with `$breakpoint-classes: (medium large)` the `small-` sizes, offsets, block grids, and collapse classes still exist (measured). Expand and unstack skip the Zero breakpoint.

Reading order: the compiled Flex Grid CSS sets no `order`, no `flex-direction`, and no positioning (checked in the compiled CSS), so columns always paint in DOM order, line by line; offsets add space and move nothing past a sibling. Source ordering and alignment are the Flexbox Utilities' classes, which the docs page shows on rows and columns.

Docs conventions kept or corrected: the element structure (kept); `.columns` in most examples (corrected: the directive binds `.column`, of which `.columns` is an alias); the alignment examples' `.text-center` demo wrapper (dropped: it only centres demo text); the "Vertical Alignment of child columns" example (corrected: its row unstacks from medium, because four columns of that text do not fit 320 CSS px, D17); the collapse example's `.callout secondary` boxes and `.show-for-*` paragraphs (kept, as the Callout's and Visibility Classes' directives); the Browser support section and its Firefox 43 image warning (dropped: measured in the Browser target's engines, a 1600 px image stays inside an expanding column under Foundation's global `img { max-width: 100% }`); the IE 10 reason for choosing the Flex Grid (outside the Browser target; the XY Grid is Foundation's recommendation).

### CSS class to directive mapping

`small` in the value columns stands for the Zero breakpoint, the key of `nfsBreakpointsToken`'s map whose value is 0, and `medium` for any other Class breakpoint.

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.row` | `NfsRow` (`[nfsRow]`), static host class | - | - | `row` | - |
| `.expanded` | `expanded` of `NfsRow` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.expanded` | none (closed) |
| `.<bp>-up-<n>` | `up` of `NfsRow` | `NfsFlexGridUpInput` over `NfsFlexGridUp`, `NfsOverridableCount<8, NfsBlockGridMaxOverrides>`; `$block-grid-max` (`NfsBlockGridMaxOverrides`) and `$breakpoint-classes` (`NfsBreakpointClassesOverrides`) | count, bare (the Zero breakpoint) or in Breakpoint rules | `up="2"` sets `.small-up-2`; `[up]="{small: 1, medium: 3}"` sets `.small-up-1 .medium-up-3` | `--nfs-block-grid-max`; `--nfs-breakpoint-classes` |
| `.collapse`, `.<bp>-collapse`, `.<bp>-uncollapse` | `collapse` of `NfsRow` | `NfsFlexGridCollapseInput`: `NfsVariantBoolean` or `NfsClassBreakpointRules<boolean>`; `$breakpoint-classes` | `true` (or the bare attribute), or Breakpoint rules of booleans | `true` sets `.collapse`; `false` and no value set none; in rules, `true` sets `.<bp>-collapse` and `false` sets `.<bp>-uncollapse`, the Zero breakpoint included: `{small: true, medium: false}` sets `.small-collapse .medium-uncollapse` (D4) | `--nfs-breakpoint-classes`, for rules keys above the Zero breakpoint |
| `.row.<bp>-unstack` | `unstack` of `NfsRow` | `NfsFlexGridQuery` (`NfsClassBreakpointQuery<'up'>`); `$breakpoint-classes` | a Breakpoint query; no boolean | `'medium'` and `'medium up'` set `.medium-unstack`; the Zero breakpoint sets none (Zero-breakpoint gap: Foundation prints no `.small-unstack`, and columns without a size already share the row at every width, D5) | `--nfs-breakpoint-classes` |
| `.is-collapse-child` | `isCollapseChild` of `NfsRow` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.is-collapse-child` | none (closed) |
| `.column` (and its alias `.columns`) | `NfsColumn` (`[nfsColumn]`), static host class | - | - | `column`; `.columns` is never bound (D1) | - |
| `.<bp>-<n>`, `.<bp>-expand`, `.shrink` | `size` of `NfsColumn` | `NfsFlexGridColumnSizeInput` over `NfsFlexGridColumnSize`: `NfsFlexGridColumn` (`NfsOverridableCount<12, NfsGridColumnCountOverrides>`) or `'expand'` per breakpoint, and `'shrink'` as a bare value only; `$grid-column-count` (`NfsGridColumnCountOverrides`) and `$breakpoint-classes` | a count or `'expand'`, bare (the Zero breakpoint) or in Breakpoint rules; or the bare `'shrink'` | `size="6"` sets `.small-6`; `[size]="{small: 12, large: 'expand'}"` sets `.small-12 .large-expand`; `size="shrink"` sets `.shrink`. Zero-breakpoint gap: `'expand'` at the Zero breakpoint sets none, because the bare column is Foundation's expand. No value sets none, so the column expands (D3) | `--nfs-grid-column-count`; `--nfs-breakpoint-classes` |
| `.<bp>-offset-<n>` | `offset` of `NfsColumn` | `NfsFlexGridOffsetInput` over `NfsFlexGridOffset`, 0 to `$grid-column-count` minus 1 (`Exclude<NfsOverridableCount<12, NfsGridColumnCountOverrides, 0>, NfsOverridableCountValue<12, NfsGridColumnCountOverrides>>`); `$grid-column-count` and `$breakpoint-classes` | a count, bare or in Breakpoint rules | `offset="2"` sets `.small-offset-2`; `[offset]="{large: 2}"` sets `.large-offset-2`; `{large: 0}` sets `.large-offset-0`, Foundation's reset | `--nfs-grid-column-count`; `--nfs-breakpoint-classes` |
| `.column-block` | `columnBlock` of `NfsColumn` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.column-block` | none (closed) |

State classes: none; the Flex Grid has no runtime state (`.is-collapse-child` is a Variant class the author chooses, set by `isCollapseChild`). The Flexbox Utilities' classes that the docs page puts on rows and columns (`.align-*`, `.align-self-*`, `.<bp>-order-<n>`) are set by `nfsFlexAlign` and `nfsFlexChild` beside these directives (D15). No class is left for the consumer to write (ADR 0039).

Binding rule (D8): each directive binds one `computed` class list through `[class]` beside its static host class. The list holds only the classes its inputs set, so a Foundation class copied from Foundation's markup is not stripped (Angular keeps a static class that no binding names); it is reported in development instead. Redundant copies of the static host class (`row` on `nfsRow`) merge and are not reported.

### Hierarchy and DI shape

```
[nfsRow]                 NfsRow     (.row)
  [nfsColumn]            NfsColumn  (.column; a direct child of a row)
    [nfsRow]             a nested row, inside the column
[nfsRow][nfsColumn]      a column row: a centred, padded block for content, not a row of columns
```

- Two standalone directives with no template, no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a row or a column through DI: Foundation's child selectors (`.small-up-2 > .column`, `.row.collapse > .column`) carry the row's settings to its columns, and every placement check only reports, so it reads the DOM in a development render callback (building-blocks 1.9, Ancestry that projection can hide). Rows and columns therefore work across any Hydration boundary and through content projection.
- A column row is `nfsRow` and `nfsColumn` on one element; the two directives declare no input names in common.
- Composition by placement (building-blocks 1.9), as the XY Grid does (its D15): the Flexbox Utilities own every alignment, self-alignment, and source-ordering class on rows and columns ([Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), D8): `nfsFlexAlign` (`alignX`, `alignY`, `alignCenterMiddle`) beside `nfsRow`, `nfsFlexChild` (`alignSelf`, `order`) beside `nfsColumn`; the grid directives declare no input for those classes and host neither. The Visibility Classes, Equalizer, Sticky, Card, and Callout directives are written beside or inside the grid's directives the same way. Two directives on one element must not both declare an input of the same name: `size` is also the Callout's, Button's, Close Button's, and Dropdown pane's, and `expanded` also the Button's, Button Group's, and Menu's, so none of those shares an element with `nfsColumn` or `nfsRow`; they nest, as Foundation's markup nests them.
- No Defaults token: the Flex Grid has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `nfsBreakpointsToken` and `nfsBreakpointForWidth` of `ngx-foundation-sites/media-query` (the Zero breakpoint, D3 to D5) in both directives; the Runtime checks' `nfsVariantCheck()` handle in both; in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning and `ElementRef` for the placement and overflow checks.
- Entry point: `ngx-foundation-sites/flex-grid` (one per Foundation docs page), exporting the two directives and the aliases `NfsFlexGridColumn`, `NfsFlexGridColumnSize`, `NfsFlexGridColumnSizeValue`, `NfsFlexGridColumnSizeInput`, `NfsFlexGridOffset`, `NfsFlexGridOffsetValue`, `NfsFlexGridOffsetInput`, `NfsFlexGridUp`, `NfsFlexGridUpValue`, `NfsFlexGridUpInput`, `NfsFlexGridCollapse`, `NfsFlexGridCollapseInput`, and `NfsFlexGridQuery`. `NfsGridColumnCountOverrides`, `NfsBlockGridMaxOverrides`, `NfsBreakpointClassesOverrides`, the count helpers, the Class breakpoint types, and `nfsVariantBoolean` live in the primary entry point `ngx-foundation-sites` and are used here as types only, apart from the one pure `nfsVariantBoolean` function. The directive classes share their names with the Float Grid's (D1); the aliases carry the grid's name because the two grids' families differ (D7).

### API

```ts
// ngx-foundation-sites/flex-grid
/** A column count from 1 to $grid-column-count (12 by default). */
type NfsFlexGridColumn = NfsOverridableCount<12, NfsGridColumnCountOverrides>;
/** One breakpoint's column size: .<bp>-<n>, or .<bp>-expand ('expand' sets none at the Zero breakpoint). */
type NfsFlexGridColumnSize = NfsFlexGridColumn | 'expand';
/** 'shrink' is .shrink, which Foundation prints once, for every width, after every size: a bare value only. */
type NfsFlexGridColumnSizeValue = NfsFlexGridColumnSize | 'shrink' | NfsClassBreakpointRules<NfsFlexGridColumnSize>;
type NfsFlexGridColumnSizeInput = NfsFlexGridColumnSizeValue | `${NfsFlexGridColumn}`;
/** .<bp>-offset-<n>: 0 to $grid-column-count minus 1. */
type NfsFlexGridOffset = Exclude<NfsOverridableCount<12, NfsGridColumnCountOverrides, 0>, NfsOverridableCountValue<12, NfsGridColumnCountOverrides>>;
type NfsFlexGridOffsetValue = NfsFlexGridOffset | NfsClassBreakpointRules<NfsFlexGridOffset>;
type NfsFlexGridOffsetInput = NfsFlexGridOffsetValue | `${NfsFlexGridOffset}`;
/** .<bp>-up-<n>: 1 to $block-grid-max (8 by default). */
type NfsFlexGridUp = NfsOverridableCount<8, NfsBlockGridMaxOverrides>;
type NfsFlexGridUpValue = NfsFlexGridUp | NfsClassBreakpointRules<NfsFlexGridUp>;
type NfsFlexGridUpInput = NfsFlexGridUpValue | `${NfsFlexGridUp}`;
/** true: .collapse; rules: .<bp>-collapse (true) and .<bp>-uncollapse (false). */
type NfsFlexGridCollapse = boolean | NfsClassBreakpointRules<boolean>;
type NfsFlexGridCollapseInput = NfsVariantBoolean | NfsClassBreakpointRules<boolean>;
/** A Class breakpoint from which the columns of a row stop stacking: 'medium' or 'medium up'. */
type NfsFlexGridQuery = NfsClassBreakpointQuery<'up'>;

class NfsRow {                               // [nfsRow]
  readonly expanded: InputSignalWithTransform<boolean, NfsVariantBoolean>;                                // default false
  readonly up: InputSignalWithTransform<NfsFlexGridUpValue | undefined, NfsFlexGridUpInput | undefined>;  // default undefined
  readonly collapse: InputSignalWithTransform<NfsFlexGridCollapse, NfsFlexGridCollapseInput>;             // default false
  readonly unstack: InputSignal<NfsFlexGridQuery | undefined>;                                            // default undefined
  readonly isCollapseChild: InputSignalWithTransform<boolean, NfsVariantBoolean>;                         // default false
}

class NfsColumn {                            // [nfsColumn]
  readonly size: InputSignalWithTransform<NfsFlexGridColumnSizeValue | undefined, NfsFlexGridColumnSizeInput | undefined>; // default undefined
  readonly offset: InputSignalWithTransform<NfsFlexGridOffsetValue | undefined, NfsFlexGridOffsetInput | undefined>;       // default undefined
  readonly columnBlock: InputSignalWithTransform<boolean, NfsVariantBoolean>;                                             // default false
}
```

| Input | Directive | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `expanded` | `NfsRow` | `false` | `.row.expanded` | New |
| `up` | `NfsRow` | `undefined` | `.<bp>-up-<n>` | New |
| `collapse` | `NfsRow` | `false` | `.collapse`, `.<bp>-collapse`, `.<bp>-uncollapse` | New. One input for the static and the responsive family; the bare form is `.collapse` (D4) |
| `unstack` | `NfsRow` | `undefined` | `.<bp>-unstack` | New. A query only; the Zero breakpoint sets none (D5) |
| `isCollapseChild` | `NfsRow` | `false` | `.is-collapse-child` | New. The nested-row check reports when it is missing (D6) |
| `size` | `NfsColumn` | `undefined` | `.<bp>-<n>`, `.<bp>-expand`, `.shrink` | New. One input for every breakpoint; `shrink` bare only; the Zero-breakpoint expand sets none (D3) |
| `offset` | `NfsColumn` | `undefined` | `.<bp>-offset-<n>` | New |
| `columnBlock` | `NfsColumn` | `false` | `.column-block` | New. Not on the Flex Grid docs page; printed by `foundation-flex-grid` |

- Every input's JSDoc names Foundation's class template and the Sass setting (AGENTS.md Design Philosophy 5). Every input declares explicit type arguments that name the exported aliases (or `NfsVariantBoolean`), and the library build's typings assertion covers all of them ([ADR 0040](../adr/0040-variant-input-types.md)).
- The count transforms turn a static attribute's string (`size="6"`) into its number and pass keywords and Breakpoint rules through; the on-or-off transforms map `NfsVariantBoolean` through `nfsVariantBoolean` and pass Breakpoint rules through. None uses `numberAttribute` or `booleanAttribute`. The transforms are internal. `unstack` has no transform: a query is a string as written.
- Models, outputs, and methods: none. The grid has no state; `exportAs`: none, because there is nothing to expose.

Host bindings, all on signal state:

| Directive | Static `class` | `[class]` | Other |
| --- | --- | --- | --- |
| `NfsRow` | `row` | `expanded`, the `up` classes, the collapse classes, the unstack class, `is-collapse-child` | - |
| `NfsColumn` | `column` | the `size` and `offset` classes, `column-block` | - |

- The mapping from a value to its classes is one pure function per directive of the input values and the Zero breakpoint (`nfsBreakpointForWidth(map, 0)`), the same on server and client. It binds nothing for a value that is not one class token or a query it cannot parse; under the closed types only a cast or `$any()` reaches that guard, and the Variant check reports it.
- The directives write no attribute but `class`, never `role`, `aria-*`, `id`, or `tabindex`. The consumer's own classes are untouched.
- Development-mode checks, in each directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or its Variant check handle is not `null` (never on the server, and in production only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on, each once per instance:
  1. Copied classes, on both directives: a static class list holding a Flex Grid class the directive sets warns once, naming each class with its input, for example "class="columns small-6 large-offset-2" is set by nfsColumn: bind size="6" and [offset]="{large: 2}" instead; .columns is Foundation's alias of the .column that nfsColumn binds". The patterns are built from the Breakpoint map's names: the size, expand, offset, `up`, collapse, uncollapse, and unstack templates, `shrink`, `expanded`, `collapse`, `is-collapse-child`, `column-block`, `columns`, and the other directive's static class (`column` copied onto `nfsRow` names `nfsColumn`, because a column row is both directives). The Flexbox Utilities' classes that Foundation's examples carry (`.align-*` on a row, `.align-self-*` and `.<bp>-order-<n>` on a column) are reported the same way, naming `nfsFlexAlign` or `nfsFlexChild` and the input to bind. A copied class is not stripped (D8).
  2. Row without the Flex Grid's CSS, on `NfsRow`, at the first render: a host that is not a column row and whose computed `display` is neither `flex` nor `none` warns "nfsRow: this row is not a flex row, so the Flex Grid's CSS is not in this page: set $xy-grid: false before foundation-everything, or include foundation-flex-grid, and not foundation-grid". A row hidden with `display: none` is not reported.
  3. Placement, on `NfsColumn`, read from the DOM at the first render: a parent element without `row` warns "nfsColumn: this column is not a direct child of nfsRow, so its size, offset, and gutters do not apply"; a parent that carries both `row` and `column` warns "nfsColumn: the parent is a column row, which Foundation lays out as a block, so columns inside it stack: nest an nfsRow inside it"; a bound `size` whose parent carries a `<bp>-unstack` class warns "nfsColumn: unstack="medium" on the row sizes its columns, so this size only caps the column's width: remove it or remove the row's unstack".
  4. Overflow at the current viewport, on `NfsRow` (D11): a `ResizeObserver` on the host, created in the read phase at the first render when the host is a flex row and disconnected on destroy, checks the host's column children: a column whose `scrollWidth` exceeds its `clientWidth` by more than 1 px warns once: "nfsRow: a column's content is wider than the column at this viewport (WCAG 1.4.10): stack the columns below a breakpoint with unstack="medium" on the row or [size]="{small: 12, medium: ...}" on the columns".
  5. Nested row that sticks out, on `NfsRow`, in the same observer callback: a host whose parent element carries `column`, whose computed `margin-left` is negative, and whose parent's computed `padding-left` is 0 warns once: "nfsRow: this nested row sticks out of its collapsed parent by half a gutter: bind isCollapseChild on it, or collapse the parent row at every width with the bare collapse attribute".
- Runtime check, in the same read phase: each directive calls `include()` only while a value that reads a property is bound, because `nfs-flex-grid` carries no rule the grid needs (the XY Grid's rule): `NfsColumn` calls `include('nfs-flex-grid', ['grid-column-count'])` while `size` or `offset` holds a count, `NfsRow` calls `include('nfs-flex-grid', ['block-grid-max'])` while `up` is bound, and each calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])` while a bound value names a Class breakpoint above the Zero breakpoint. Then `value(input, value, needs)` for each bound input, with the needs from the same mapping that sets its classes: a size `n` needs `{setting: 'grid-column-count', name: n}`, an offset `n` needs `{setting: 'grid-column-count', name: n + 1}`, an `up` count `n` needs `{setting: 'block-grid-max', name: n}`, every breakpoint above the Zero breakpoint needs `{setting: 'breakpoint-classes', name: bp}`, and the Zero breakpoint needs nothing, because Foundation's iterator always adds it. `'shrink'`, whose class always exists, and a value that intentionally sets no class (`'expand'` or `unstack` at the Zero breakpoint) pass `[]`; a value that maps to no class passes `null`. `expanded`, `isCollapseChild`, `columnBlock`, and the bare `collapse` are closed and make no call. The report shape and configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).

### Comparison with Angular Material (22.2)

Material has no CSS layout grid; the nearest component is `MatGridList`, a tile list that positions its tiles from TypeScript.

| Concern | Material `mat-grid-list` and `mat-grid-tile` | Flex Grid directives |
| --- | --- | --- |
| Kind | Components with templates, `MAT_GRID_LIST` parent token, `exportAs: 'matGridList'` | Attribute directives on the consumer's elements; no template, token, or `exportAs` |
| Layout | Computed in `ngAfterContentChecked` and written as inline styles on each tile | Foundation's compiled CSS; the classes are host bindings in the server HTML |
| Item size | `colspan`, `rowspan` inputs on the tile | `size` and `offset` on the column, per breakpoint; `expand` and `shrink` sizes from flexbox |
| Responsive | None built in (the consumer changes `cols` from a `BreakpointObserver`) | CSS media queries through Foundation's breakpoint classes; no JavaScript |
| Semantics | None | None; the consumer's elements carry them |
| Testing | `MatGridListHarness`, `MatGridTileHarness` | DOM-first assertions; no harness |

Borrowed: per-item size inputs on the item. Not borrowed: templates and a parent token (Foundation's markup carries the elements, ADR 0001), JavaScript layout and inline styles (Foundation's CSS already lays out, on the server too).

### Implementation level and primitives

Implementation level: native platform. The layout is CSS flexbox from Foundation's compiled classes, responsive through CSS media queries. `@angular/aria` has a Grid pattern, but it is the APG Grid composite, an interactive widget with two-dimensional arrow-key navigation, which a layout is not (D13). `@angular/cdk` has nothing to add: `BreakpointObserver` would repeat what the CSS media queries do. The Angular layer is two static host classes, one `computed` class list per directive, `nfsBreakpointsToken` for the Zero breakpoint, and, in development builds only, one render callback per directive and a `ResizeObserver` per row. No `effect`, no listener, no timer.

Fallback: none needed. The facts the design rests on (the class set, the source order of `.shrink` and the collapse rules, the column row's block layout, the overflow of bare columns and nested rows at 320 CSS px, list rows, the `hidden` attribute, and the collisions with the other grids) were measured by this spec's ticket in Chromium, Firefox, and WebKit through Playwright 1.63 with axe-core 4.13.0, over Foundation 6.9.0 compiled with Dart Sass.

### ARIA and keyboard

APG pattern: none. A layout grid is not the ARIA `grid` role, and a role is a promise (building-blocks 1.10).

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsRow]`, `[nfsColumn]` | The host element's own role; the directives add no role, name, or state. A `ul` row of `li` columns stays a list | WHATWG HTML; HTML-AAM |
| A row reordered by the Flexbox Utilities | The accessibility tree and focus follow the DOM order | CSS Flexbox Level 1, section 5; the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)' visual-order check |

Keys: none. The grid holds no scroll container and no control of its own, so Tab and the reading keys move through the consumer's content in DOM order. Focus: the directives move no focus.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Geometry and axe results were measured by this spec's ticket in Chromium, Firefox, and WebKit through Playwright 1.63 with axe-core 4.13.0, over Foundation 6.9.0 compiled with `$xy-grid: false` through `foundation-everything` on its default settings. The Flex Grid draws no colour, so no contrast criterion applies to it.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.10 Reflow | At 320 CSS px no row scrolls the page sideways and no column's content overflows it. A column without a size expands and never wraps, so a row whose columns cannot all fit 320 CSS px stacks at the Zero breakpoint: `unstack` from a larger breakpoint, or `size` with a Zero-breakpoint count (`[size]="{small: 12, large: 'expand'}"`). A row nested in a responsively collapsed row takes `isCollapseChild`. The docs require both, every recipe and story follows them, and the development checks 4 and 5 report a column that overflows and a nested row that sticks out, at the current viewport (D11) | Measured at 320 CSS px: the docs' "Vertical Alignment of child columns" example overflows its last column by 27 px and scrolls the page to 347 px; with `medium-unstack` on its row, 320 px and no overflow. Four bare columns of single long words overflow by up to 64 px (scroll width 358 px). A nested row in a `small-collapse` row scrolls the page to 330 px; with `is-collapse-child`, 320 px. Every other docs example fits | e2e in three engines at 320 by 640 px: `document.documentElement.scrollWidth` is at most 320 in every story; browser-level tests of checks 4 and 5 |
| 1.4.12 Text Spacing | The Flex Grid sets no height and no overflow (checked in the compiled CSS), so with the text-spacing overrides columns grow with their text; check 4 reports a column whose widened words no longer fit | Passes | e2e in three engines at 320 by 640 px with the text-spacing stylesheet: `flex-grid--basics` and `flex-grid--responsive` keep `scrollWidth` at most 320 |
| 2.4.3 Focus Order; 1.3.2 Meaningful Sequence | Columns paint in DOM order: the Flex Grid's CSS sets no `order`, direction, or positioning, and no directive here offers one; offsets add space only. Source ordering is the Flexbox Utilities' family and its spec's hazard | Passes | `flex-grid--offsets` and `flex-grid--block-grid` play functions assert that the reading order of the columns' text is their visual order |
| 1.3.1 Info and Relationships | The grid adds no meaning; the consumer's elements carry it. A list row stays a list, with its markers (the Typography Helpers' `nfsNoBullet` removes them; `role="list"` where the count matters) | Passes | axe in every story |
| 4.1.2 Name, Role, Value | The directives add no role, name, or state | Passes (measured: the docs examples are axe-clean at 320 and 1280 px in three engines) | axe in every story |

2.1.1, 2.4.7, and 2.4.11 are not affected: the grid holds no control, scroll container, or positioned element. The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018); axe has no rule for content that overflows its column, which is why check 4 exists.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: every value comes from inputs, static attributes, and `nfsBreakpointsToken`, the same on both platforms, and no directive declares a listener. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfsrow=""`, `size="6"`), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Basics and advanced sizing -->
<div nfsRow>
  <div nfsColumn size="6">6 columns</div>
  <div nfsColumn size="6">6 columns</div>
</div>
<div nfsRow>
  <div nfsColumn [size]="{medium: 6, large: 4}">12/6/4 columns</div>
  <div nfsColumn [size]="{medium: 6, large: 8}">12/6/8 columns</div>
</div>
<div nfsRow>
  <div nfsColumn size="4">4 columns</div>
  <div nfsColumn>Whatever's left!</div>
</div>
<div nfsRow>
  <div nfsColumn size="shrink">Shrink!</div>
  <div nfsColumn>Expand!</div>
</div>

<div class="row">
  <div class="column small-6">6 columns</div>
  <div class="column small-6">6 columns</div>
</div>
<div class="row">
  <div class="column medium-6 large-4">12/6/4 columns</div>
  <div class="column medium-6 large-8">12/6/8 columns</div>
</div>
<div class="row">
  <div class="column small-4">4 columns</div>
  <div class="column">Whatever's left!</div>
</div>
<div class="row">
  <div class="column shrink">Shrink!</div>
  <div class="column">Expand!</div>
</div>

<!-- Responsive adjustments and automatic stacking -->
<div nfsRow>
  <div nfsColumn [size]="{small: 12, large: 'expand'}">One</div>
  <div nfsColumn [size]="{small: 12, large: 'expand'}">Two</div>
</div>
<div nfsRow unstack="medium">
  <div nfsColumn>One</div>
  <div nfsColumn>Two</div>
</div>

<div class="row">
  <div class="column small-12 large-expand">One</div>
  <div class="column small-12 large-expand">Two</div>
</div>
<div class="row medium-unstack">
  <div class="column">One</div>
  <div class="column">Two</div>
</div>

<!-- Collapse, a nested row, an offset, and a block grid -->
<div nfsRow [collapse]="{small: true, medium: false}">
  <div nfsColumn size="6">
    <div nfsRow isCollapseChild>
      <div nfsColumn size="6">Nested</div>
      <div nfsColumn size="6">Nested</div>
    </div>
  </div>
  <div nfsColumn size="4" [offset]="{large: 2}">Offset 2 on large</div>
</div>
<ul nfsRow [up]="{small: 1, medium: 2, large: 3}">
  <li nfsColumn columnBlock>One</li>
  <li nfsColumn columnBlock>Two</li>
  <li nfsColumn columnBlock>Three</li>
</ul>

<div class="row small-collapse medium-uncollapse">
  <div class="column small-6">
    <div class="row is-collapse-child">
      <div class="column small-6">Nested</div>
      <div class="column small-6">Nested</div>
    </div>
  </div>
  <div class="column small-4 large-offset-2">Offset 2 on large</div>
</div>
<ul class="row small-up-1 medium-up-2 large-up-3">
  <li class="column column-block">One</li>
  <li class="column column-block">Two</li>
  <li class="column column-block">Three</li>
</ul>

<!-- A full-width row, a collapsed row, and a column row -->
<div nfsRow expanded collapse>
  <div nfsColumn>Edge to edge</div>
</div>
<article nfsRow nfsColumn>
  <h2>A centred, padded block of content</h2>
</article>

<div class="row expanded collapse">
  <div class="column">Edge to edge</div>
</div>
<article class="row column">
  <h2>A centred, padded block of content</h2>
</article>
```

The list row's `li` columns keep `display: list-item` and their disc markers, painted outside the column, and the `ul`'s own margin gives way to the row's auto margins (measured in three engines); a list row without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`, whose margin reset that spec's `nfs-typography-helpers` keeps off the row's `auto` margins (measured in three engines), and `role="list"` where its item count matters (WebKit).

### Animation

None. The Flex Grid's CSS declares no transition, and the directives add none. A column inserted or removed with `@if` or `@for` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every grid class exactly as the hydrated DOM does, so the first paint is the final layout. The responsive classes are chosen from the input values, not from the viewport, so the Server breakpoint never matters here.
- Before hydration: the directives touch no DOM outside host bindings, read no `window`, measure nothing, and start no observer; the development checks and the Runtime check requests run in render callbacks, which never run on the server.
- Full and incremental hydration: host binding values equal the server's, so hydration changes no attribute and no class, and there is no structure to mismatch. Rows and columns register with nothing, so a column may sit in a different Hydration boundary from its row; a widget inside a column keeps its own boundary rules.
- Event replay: no directive declares a listener, so none adds `jsaction`; replay of the consumer's own listeners inside columns is unaffected.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block, and inside `@defer (hydrate never)` for good, a grid is its server HTML and lays out fully; only the development checks never run.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or the browser observes: the classes, computed widths at real viewports, page overflow, the development reports, and the server HTML. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s tests, the nearest precedent.

The Flex Grid's stories run in a Storybook configuration of their own in the library project (D16): its preview stylesheet is the shared one (Storybook conventions, section 5) with `foundation-everything($prototype: true, $xy-grid: false)` in place of the default call, without the Float Grid's `foundation-grid`, and with `@include nfs-flex-grid;`, because the Flex Grid cannot share one compile with the XY Grid or the Float Grid (measured, Problem Statement). Its `preview.ts` is the shared one. It has its own `test-storybook` run, its own static build on a port of its own, and its own e2e project, all through the same conventions. Story ids follow `flex-grid--<story>`: `flex-grid--basics`, `flex-grid--advanced-sizing`, `flex-grid--responsive`, `flex-grid--automatic-stacking`, `flex-grid--alignment`, `flex-grid--collapse`, `flex-grid--nesting`, `flex-grid--offsets`, `flex-grid--block-grid`, `flex-grid--expanded`. The stories file sets `id: 'flex-grid'`, `title: 'Layout systems/Flex Grid'`, and `component: NfsColumn`; `size` and `offset` are args where a story shows one column's input. Stories use Foundation's default counts and Class breakpoints only, so the program needs no Variant declaration file (ADR 0040). No story element carries a Foundation class written in the story; column text says what the column's size is, as Foundation's examples do.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by the Flex Grid configuration's `test-storybook` target. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags. At the story viewport only the Zero breakpoint's classes apply, so play functions assert classes for every breakpoint and computed geometry for the Zero breakpoint; wider viewports are e2e cases.

- `flex-grid--basics`: Foundation's Basics. The rows carry `.row`, the columns `.column` and exactly their size classes (`small-6`; `medium-6 large-4`), never `.columns`; the `size="6"` columns are each half the row's width, and the columns with only medium and large sizes share the row equally.
- `flex-grid--advanced-sizing`: Foundation's expand and shrink examples: the `size="4"` column is a third of the row and the bare column takes the rest; two bare columns share the rest equally; `size="shrink"` sets `.shrink` and the column is as wide as its text.
- `flex-grid--responsive`: six `[size]="{small: 12, large: 'expand'}"` columns carry `.small-12 .large-expand` and are each the row's full width at the story viewport.
- `flex-grid--automatic-stacking`: `unstack="medium"` with six bare columns: the row carries `.medium-unstack`; each column is the row's full width at the story viewport.
- `flex-grid--alignment`: `nfsFlexAlign` beside `nfsRow` for `alignX` right, center, justify, spaced and `alignY` middle and top; `nfsFlexChild alignSelf` beside `nfsColumn` in a row with `unstack="medium"` (the docs example, which overflows at 320 CSS px without it, D17): the classes are the Flexbox Utilities' and each row's computed `justify-content` or `align-items` matches.
- `flex-grid--collapse`: a bare `collapse` row and a `[collapse]="{small: true, medium: false}"` row: the classes are `.collapse` and `.small-collapse .medium-uncollapse`; the columns' computed side padding is 0 at the story viewport in both.
- `flex-grid--nesting`: a nested row in a plain row, a nested row in a `collapse` row, a nested row with `isCollapseChild` in a rules-collapsed row, and a column row with a heading: the nested rows' outer edges stay within their parent columns; the column row's computed `display` is `block`; a `console.warn` spy records nothing.
- `flex-grid--offsets`: `size="4" [offset]="{large: 2}"` and `size="4" offset="2"`: the classes are set; the second column's left edge is two columns from the row's; the text read in DOM order is the visual order.
- `flex-grid--block-grid`: `[up]="{small: 1, medium: 2, large: 3}"` on a `ul` with six `columnBlock` columns: the row carries the three `up` classes, the columns `.column-block`; each column is the row's full width at the story viewport with Foundation's bottom gutter; the reading order matches the visual order.
- `flex-grid--expanded`: an `expanded` row and a default row: the expanded row's computed `max-width` is `none`, the default row's is Foundation's 75rem.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here. A style block of Foundation's compiled Flex Grid CSS is added where a case needs computed styles.

- Class mapping, driven by data: every value of every input sets exactly the classes of the mapping table, including the Zero-breakpoint gaps (`size="expand"` and `{small: 'expand'}` set none, `unstack="small"` sets none, `{small: true}` in `collapse` sets `.small-collapse`) and the static-attribute strings (`size="6"`, `offset="0"`, `up="3"`), with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose Zero breakpoint is `xs` and whose map adds `xlarge` (values the library's closed types reject are bound through a typed cast); the bare `collapse` attribute sets `.collapse` and `collapse="false"` none; no value and `false` set none; a cast value that is not one class token, and a query that cannot be parsed, set none; changing a value swaps its classes and leaves the static class and the consumer's own classes alone; the directives add no attribute but `class`.
- Development checks: `class="columns small-6 large-offset-2 align-self-bottom"` on `nfsColumn` warns once, naming `size`, `offset`, `columns` as the alias, and `nfsFlexChild`'s `alignSelf`, and the copied classes remain; a redundant `row` on `nfsRow` does not warn; `column` copied onto `nfsRow` names `nfsColumn`; `class="medium-unstack align-center"` on `nfsRow` names `unstack` and `nfsFlexAlign` with `alignX`; without the Flex Grid style block, a row warns that the Flex Grid's CSS is missing, and a column row and a `display: none` row do not; a column whose parent has no `row` warns once; a column inside a column row warns; a sized column in an `unstack` row warns, an unsized one does not; a row of four bare columns of long words in a 320 px wide host warns once from the overflow check and stays silent after later resizes; the same row with `size="12"` on its columns does not warn; a nested row in a `[collapse]="{small: true}"` row warns once, with `isCollapseChild` or in a bare `collapse` row it does not; nothing warns when `ngDevMode` is false.
- Runtime check: with a style block writing `--nfs-grid-column-count: 12; --nfs-block-grid-max: 8; --nfs-breakpoint-classes: small medium large;`, bound values within range are silent; `size` 13 and `up` 9 through a cast report `strictVariantNames` once each, naming `$grid-column-count` and `$block-grid-max`; an `xlarge` key through a cast reports naming `$breakpoint-classes`; in a test file of its own, with no properties, a column with `size="6"` reports `strictVariantProperties` once naming `@include nfs-flex-grid;`, and a column with `size="shrink"` and a row with only `collapse` ask for nothing.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with every Rendered HTML example. `whenStable()` resolves; the server HTML carries every class of the Rendered HTML section on the right elements and no `columns`; no element carries `jsaction` from the directives; no development warning or Runtime check report is made on the server.
- Sass compile, over Foundation 6.9.0's settings file with `@import 'ngx-foundation-sites';` after Foundation: `@include foundation-flex-grid; @include nfs-flex-grid;` emits exactly `:root { --nfs-grid-column-count: 12; --nfs-block-grid-max: 8; }` and no other rule; `$grid-column-count: 16; $block-grid-max: 4;` writes 16 and 4.
- Pure logic: the value-to-class mapping is covered through the DOM in layer 2; nothing else to isolate.

### 4. Playwright e2e (the Flex Grid e2e project against the Flex Grid configuration's static Storybook build)

In Chromium, Firefox, and WebKit:

- Breakpoints: at 640 and 1024 px wide, `flex-grid--basics` columns are Foundation's widths (`medium-6` half the row at 640, `large-4` a third at 1024); `flex-grid--responsive` columns share the row at 1024; `flex-grid--automatic-stacking` columns share the row at 640; `flex-grid--collapse`'s rules row has 15 px column padding at 640 and the bare `collapse` row none; `flex-grid--offsets`' first column is offset only at 1024; `flex-grid--block-grid` columns are half the row at 640 and a third at 1024, and columns on one line are of equal height.
- Reflow (1.4.10): at 320 by 640 px, `document.documentElement.scrollWidth` is at most 320 in every story.
- Text spacing (1.4.12): at 320 by 640 px with the text-spacing stylesheet, `flex-grid--basics` and `flex-grid--responsive` keep `scrollWidth` at most 320.

No fixture-app route: the Flex Grid has no control, listener, or first-paint state, the SSR smoke asserts its server HTML, and the prerendered fixture app compiles the XY Grid, which the Flex Grid cannot share a stylesheet with (D16). No manual assistive-technology test: the directives expose nothing to assistive technology.

## Out of Scope

- Source ordering (`.<bp>-order-<n>`), flex alignment (`.align-*`, `.align-self-*`, `.align-center-middle`), and the flex container helpers on rows and columns: the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), whose `nfsFlexAlign` and `nfsFlexChild` are written beside `nfsRow` and `nfsColumn`, and whose visual-order check owns the 1.3.2 and 2.4.3 hazard of reordering. Category: `scope-boundary`.
- Showing and hiding rows and columns by breakpoint (`.hide-for-*`, `.show-for-*`): the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). Category: `scope-boundary`.
- Removing a list row's markers (`.no-bullet`): the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`. Category: `scope-boundary`.
- The Float Grid's own classes (`.<bp>-push-<n>`, `.<bp>-pull-<n>`, `.<bp>-centered`, `.<bp>-uncentered`, `.end`, `.gutter-<bp>`) and the XY Grid: the [Spec: Float Grid](../issues/100-spec-float-grid.md) and the [Spec: XY Grid](../issues/99-spec-xy-grid.md); the Flex Grid's CSS prints none of the Float Grid's. Category: `scope-boundary`.
- Foundation's semantic flex grid mixins (`flex-grid-row`, `flex-grid-column`, `flex-grid-layout`, `flex-grid-size`, and the shared gutter and offset mixins) in the consumer's own Sass for the consumer's own classes, which is also Foundation's advice for a page that needs two grids: the class rule governs Foundation's and the library's classes, and the directives set only the classes Foundation generates. Category: `scope-boundary`.
- A responsive shrink (`.<bp>-shrink`), an unprefixed `.expand`, and a `.small-unstack`: Foundation's flex grid prints none of them, and the library adds no class Foundation lacks (AGENTS.md Styling Guidelines); the Zero breakpoint's expand and unstack are the row's default (D3, D5). Category: `other`.
- Compiling the Flex Grid beside the Float Grid or the XY Grid in one stylesheet: measured, the Float Grid's `.row` and `.column` rules break the Flex Grid's alignment (a justified row leaves 178 px empty) and the Flex Grid's unscoped sizes halve vertical XY cells; Foundation's docs say the legacy grids "don't play nice together". Category: `other`.
- An ARIA `grid`, `row`, or `gridcell` role on rows and columns, or `@angular/aria`'s Grid (D13): a CSS layout is not the APG Grid composite. Category: `platform-or-a11y`.
- The docs' Browser support section and its Firefox 43 image workaround (a defined width on images in flex columns): measured in the Browser target's engines, Foundation's global `img { max-width: 100% }` keeps a 1600 px image inside an expanding column. Category: `superseded`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Two attribute directives, one per class that names an element of the layout: `[nfsRow]` (`.row`) and `[nfsColumn]` (`.column`), each a static host class on any element; entry point `ngx-foundation-sites/flex-grid`; no `exportAs`. The class names and selectors are the Float Grid's too, in its own entry point. `.columns` is never bound | ADR 0001 and ADR 0039; building-blocks 1.3 names a directive after the class it binds, and both legacy grids bind `.row` and `.column` on markup Foundation calls identical ("The structure of the flex grid is identical to that of the float grid"); one application compiles only one legacy grid (measured collisions), so the two never meet in one program, and a move from one to the other changes the import path while the compiler lists the inputs that differ; the [Spec: Equalizer](../issues/34-spec-equalizer.md) already writes `nfsRow` and `nfsColumn`. `.columns` is an `@extend` alias of `.column` in the flex grid, so binding `.column` covers every rule | Grid-prefixed names (`nfsFlexGridRow`, `nfsFlexGridColumn`), the Dropdown pane's disambiguation (every template changes when a site moves between the legacy grids, for a collision that one compile never has) (`other`); binding `.columns` as Foundation's examples write it (an alias; the Float Grid can rename or drop it through `$grid-column-alias`) (`other`) |
| D2 | Input names by building-blocks 1.4: `size`, `offset`, and `up` for the counted families (rule 3); booleans `expanded`, `isCollapseChild`, `columnBlock` (rule 4); responsive `collapse` and `unstack`, named from the class template once the breakpoint is removed | The decided naming rule, applied mechanically, as the XY Grid does; the names shared with the Float Grid's families (`size`, `offset`, `up`, `expanded`, `collapse`, `columnBlock`) mean the same there | One input per responsive class (`mediumUnstack`) (`other`); class-name strings such as `size="medium-6"` (ADR 0039) (`variant-as-class`); `collapse` values `'collapse'` and `'uncollapse'` (Foundation class names as values, ADR 0039) (`variant-as-class`) |
| D3 | `size` takes a count or `'expand'` per breakpoint, bare or in Breakpoint rules, and `'shrink'` only as a bare value; `'expand'` at the Zero breakpoint sets none; no value is Foundation's expanding column | Measured: `.shrink` is printed after every size and expand rule and wins over all of them at every width, and Foundation prints no responsive shrink, so shrink combines with nothing; Foundation prints no `.small-expand` because the bare column already expands, so the Zero-breakpoint expand is the column's own default (building-blocks 1.4, Zero-breakpoint gaps) | `'shrink'` inside rules at the Zero breakpoint only (a rules key that forbids every other key, which a mapped type cannot say) (`other`); a `'full'` or `'auto'` keyword (the Flex Grid has no such class) (`other`) |
| D4 | `collapse`: `true` sets Foundation's `.collapse`; Breakpoint rules of booleans set `.<bp>-collapse` for `true` and `.<bp>-uncollapse` for `false`, the Zero breakpoint as `.small-collapse` | `.collapse` is the class with that meaning at every width and also takes the negative margins off rows nested in its columns (measured), so the bare attribute reads as Foundation's markup; `.collapse` outranks every uncollapse class (measured: `collapse medium-uncollapse` keeps 0 padding at 1024 px), so a rules object must start from `.small-collapse`; each rules key maps to exactly one class, and the rules shape needs no knowledge of which Class breakpoint follows which, which the runtime does not have | A Breakpoint query with `only` and `down` synthesised from collapse and uncollapse pairs (`'small only'` needs the next Class breakpoint's name, which the running directive cannot know from the Breakpoint map) (`other`); two inputs, `collapse` for `.collapse` and another for the responsive pair (two names for one family, and the responsive one would need an invented name) (`other`) |
| D5 | `unstack` takes a Breakpoint query with `up` and no boolean; the Zero breakpoint sets none | Foundation prints `.row.<bp>-unstack` only above the Zero breakpoint and no unprefixed form; "unstacked from the smallest width up" is the row's own default, so the Zero breakpoint needs no class; a bare `unstack` names no breakpoint and would say nothing, so the type rejects it | Accepting `true` as the XY Grid's `gridFrame` does (there the unprefixed class exists) (`other`) |
| D6 | `isCollapseChild` is an input of the nested row, not bound automatically; development check 5 reports when it is missing | Measured: a nested row in a `small-collapse` row sticks out by half a gutter and scrolls the page 10 px sideways at 320 CSS px; `.is-collapse-child` removes its margins at every width, which under `{small: true, medium: false}` also adds a second gutter inside the uncollapsed parent (measured: 15 px more inset at 1280 px), a trade-off only the consumer can choose; knowing the parent's collapse needs DI or a DOM read that the server HTML cannot carry | Binding it from a parent row token (a production link and a Hydration-boundary tie for a development-grade concern, and wrong under responsive collapse) (`other`) |
| D7 | Counts are closed ranges over `NfsGridColumnCountOverrides` and `NfsBlockGridMaxOverrides`, responsive values Breakpoint rules over Class breakpoints with a bare value for the Zero breakpoint; the aliases are exported under the `NfsFlexGrid` prefix and named in every input's type arguments | ADR 0040 and building-blocks 1.4; the registries are the Variant declaration tooling spec's, shared with the Float Grid; the grid prefix, unlike the directive names, keeps apart two aliases whose value sets differ (the Flex Grid's sizes have `expand` and `shrink`) | `NfsColumnSize`, after the directive (one name for two different unions in two entry points) (`other`); `numberAttribute` (accepts any value) (`superseded`) |
| D8 | One `computed` class list per directive through `[class]`; copied Foundation classes are reported in development, not stripped | The XY Grid's, Button's, and Callout's rule for open families: the full class set depends on the consumer's counts and Class breakpoints, which the running directive does not know | A record of every owned class set `false`, the Menu's form (about 80 keys per column, still blind to the consumer's counts) (`other`) |
| D9 | A column row is `nfsRow` and `nfsColumn` on one element; development check 3 reports columns placed inside it | Foundation's `.column.row.row` makes a centred, padded block (`display: block`, measured), so it holds content; columns inside it stack (measured) | Forbidding the combination (the pattern is Foundation's, and a padded content block is its use) (`other`) |
| D10 | Development checks for copied classes, a row without the Flex Grid's CSS, a column outside a row or inside a column row, a size in an unstacking row, a column that overflows, and a nested row that sticks out | Each is a silent failure of Foundation's markup that neither the types nor axe report; the Flex Grid is disabled by default, so a missing compile is the likeliest failure; the checks read the static attributes, computed style, and the DOM only in development | No checks (`platform-or-a11y`); a row token through DI for the placement checks (nothing in production needs it; building-blocks 1.9 lets a reporting check read the DOM) (`other`) |
| D11 | The overflow check measures in development with one `ResizeObserver` per row, warning when a column's content is wider than the column | Measured: Foundation's own align-self example overflows by 27 px and scrolls the page at 320 CSS px in three engines, and axe does not report it; overflow depends on content and viewport, so only a measurement in the running page sees it, as the XY Grid's frame check does | Library CSS on `.column`, `overflow-wrap: break-word` or `min-width: auto` (the first breaks words into fragments inside a layout that does not fit and leaves images and tables overflowing; the second changes every expanding column that Foundation gave `min-width: 0` on purpose) (`other`); a compile-time rule (the overflow depends on the content) (`other`) |
| D12 | No library CSS: `nfs-flex-grid` writes only `--nfs-grid-column-count` and `--nfs-block-grid-max`, the same two properties with the same values as the Float Grid's mixin | ADR 0012's properties-only case for an entry point with an Open Variant family; nothing in the Flex Grid fails WCAG 2.2 AA through its CSS; `$grid-column-count` and `$block-grid-max` belong to neither legacy grid alone, which is the one-writer exception of building-blocks 1.13 (`nfs-callout` and `nfs-progress-bar` write `--nfs-foundation-palette`) | Reading the Float Grid's mixin (a Flex Grid application would include a mixin named after a grid it does not compile) (`other`); a shared `nfs-grid-properties` mixin (a fourth include for two properties) (`other`) |
| D13 | No ARIA role on rows and columns; `@angular/aria`'s Grid is not used | A layout grid is not the APG Grid composite, and a role is a promise (building-blocks 1.10) | `role="grid"`, `row`, and `gridcell` (they promise arrow-key navigation) (`platform-or-a11y`) |
| D14 | No tokens, providers, or host directives; rows and columns work across Hydration boundaries and projection | Foundation's child selectors carry the row's settings to its columns | A parent token that columns register with (it would tie a column to its row's Hydration boundary for nothing) (`other`) |
| D15 | The Flexbox Utilities' directives are written beside the grid's: `nfsFlexAlign` beside a row, `nfsFlexChild` beside a column, and no grid input for an alignment or order class; same-named inputs on one element are avoided by nesting | The XY Grid's D15 for the same reason: alignment and ordering are optional, a host directive is static, and hosting would make the entry point import the Flexbox Utilities at runtime and create an `NfsFlexChild`, with its visual-order check, on every column | Hosting `NfsFlexAlign` and `NfsFlexChild` under their own input names (additive later, since Angular de-duplicates a directive written and hosted on one element) (`other`) |
| D16 | The Flex Grid's stories run in a Storybook configuration of their own, with a preview stylesheet that compiles the Flex Grid in place of the XY Grid and without the Float Grid; no fixture-app route | Measured: beside the Float Grid a justified row leaves 178 px empty, and beside the XY Grid a vertical grid's `small-6` cell is 400 of 800 px wide, so one stylesheet cannot hold the Flex Grid and the stories of the other grids; the SSR smoke covers the server HTML of a grid with no control or listener | Scoping the Flex Grid's rules under a story wrapper class in the shared stylesheet (changes specificity against the Flexbox Utilities and other classes, and Foundation's `@extend` of `.columns` reaches every `.column` rule of the stylesheet) (`other`); testing only at the browser level (the stories are the docs, AGENTS.md) (`other`) |
| D17 | Examples and stories write no class; the align-self example is ported with `unstack="medium"` on its row; the docs' `.text-center` wrapper is dropped | ADR 0039 and the Storybook conventions; the example fails 1.4.10 at 320 CSS px as written (measured) and passes with the row unstacked | Keeping the example as written (a story that fails the reflow e2e case) (`platform-or-a11y`) |

### Usage examples

```ts
@Component({
  selector: 'app-product-list',
  imports: [NfsRow, NfsColumn, NfsFlexAlign],
  template: `
    <h2>Products</h2>
    <!-- One product per line on phones, two from medium, three from large; equal heights come from the row -->
    <ul nfsRow [up]="{small: 1, medium: 2, large: 3}">
      @for (product of products(); track product.id) {
        <li nfsColumn columnBlock>
          <h3>{{ product.name }}</h3>
          <p>{{ product.summary }}</p>
        </li>
      }
    </ul>

    <!-- A filter bar: the label shrinks to its text, the search field takes the rest -->
    <div nfsRow nfsFlexAlign alignY="middle">
      <div nfsColumn size="shrink"><label for="q">Search</label></div>
      <div nfsColumn><input id="q" type="search" /></div>
    </div>
  `,
})
export class ProductList {
  protected readonly products = signal<readonly Product[]>([]);
}
```

```html
<!-- Columns that stack below medium and share the row from medium up, without a size on each -->
<div nfsRow unstack="medium">
  <section nfsColumn aria-labelledby="plans-h"><h3 id="plans-h">Plans</h3>...</section>
  <section nfsColumn aria-labelledby="support-h"><h3 id="support-h">Support</h3>...</section>
  <section nfsColumn aria-labelledby="docs-h"><h3 id="docs-h">Docs</h3>...</section>
</div>

<!-- Gutters only from medium up, and a nested row that stays inside its parent on small screens -->
<div nfsRow [collapse]="{small: true, medium: false}">
  <div nfsColumn [size]="{small: 12, medium: 8}">
    <div nfsRow isCollapseChild>
      <div nfsColumn size="6">...</div>
      <div nfsColumn size="6">...</div>
    </div>
  </div>
  <aside nfsColumn [size]="{small: 12, medium: 4}">...</aside>
</div>
```

The consumer's global stylesheet, enabling the Flex Grid through `foundation-everything`:

```scss
@import 'settings';
$xy-grid: false; // print the Flex Grid in place of the XY Grid
@import 'foundation';
@import 'ngx-foundation-sites';

@include foundation-everything; // never together with foundation-grid or foundation-xy-grid-classes
@include nfs-breakpoint-properties;
@include nfs-flex-grid;
```

The same, by hand: `@include foundation-flex-classes; @include foundation-flex-grid;` in place of `foundation-everything`, followed by `@include nfs-flex-grid;`. `foundation-flex-classes` is what gives the `nfsFlexAlign` and `nfsFlexChild` values their CSS.

A 16-column grid, as the library's tooling generates the Variant declaration file from `$grid-column-count: 16;`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsGridColumnCountOverrides {
    count: 16;
  }
}
```

With it, `size="16"` and `[offset]="{large: 15}"` compile and `size="17"` fails; in a program that leaves the file out, `size="16"` fails (ADR 0040). `NfsFlexAlign` is the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s.

### Platform features to adopt when the browser target moves

- CSS `reading-flow` does not concern the Flex Grid itself, which never reorders; it is the Flexbox Utilities' note.
- Nothing else: the Flex Grid is legacy, and Foundation's own direction is the XY Grid ([Spec: XY Grid](../issues/99-spec-xy-grid.md)).

### Foundation behaviour changed or dropped

- Every class is set by a directive input; the consumer writes none (ADR 0039); `.columns` is never bound, `.column` is.
- `shrink` is typed as a bare value only, and the Zero breakpoint's `expand` and `unstack` set no class (D3, D5), because Foundation's CSS has no class that would do otherwise.
- The bare `collapse` is `.collapse`, and responsive collapse starts from `.small-collapse`, so an uncollapse always takes effect (D4).
- The align-self example unstacks from medium; the Browser support section and the `.text-center` demo wrapper are dropped (D17).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The directives rely on Foundation's export mixin `foundation-flex-grid`, printed by `foundation-everything` only while `$xy-grid` is false (with its default `$flex: true`, which also prints `foundation-flex-classes` for the Flexbox Utilities), or included by hand; it must not share a stylesheet with `foundation-grid` or `foundation-xy-grid-classes` (measured, Problem Statement). It is configured through `$grid-row-width`, `$grid-column-count`, `$grid-column-gutter`, `$block-grid-max`, `$breakpoint-classes`, and `$global-left`; `$grid-column-align-edge` and `$grid-column-alias` are the Float Grid's and do not change the Flex Grid (its `.columns` alias is fixed). The entry point's Library mixin is `nfs-flex-grid` (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-flex-grid`. (1) Rules: none. The Flex Grid meets every criterion this spec names with Foundation's CSS, the documented layouts, and the development checks (D11). (2) Reused settings: `$grid-column-count` and `$block-grid-max`, read from the consumer's compile. (3) Custom properties the directives write: none. (4) Motion classes: none, and no `prefers-reduced-motion` override. (5) What breaks when the include is missing: no layout (Foundation's CSS does it all); the Variant properties are absent, so the declaration-file generator finds no column or block-grid count and the development Runtime check reports the missing include once a count is bound. (6) Variant properties, on `:root`: `--nfs-grid-column-count` from `$grid-column-count` (12 by default) and `--nfs-block-grid-max` from `$block-grid-max` (8 by default), both counts, written with the same values by the Float Grid's mixin (D12); the Class breakpoints the responsive inputs read are `nfs-breakpoint-properties`' `--nfs-breakpoint-classes`. No required setting: Foundation's defaults pass.

### Notes

- RTL: Foundation compiles direction into the CSS (offsets use `$global-left`); the directives are direction-agnostic, and a column's visual order follows the reading direction.
- Static input attributes stay in the DOM, as Angular leaves every static attribute (`<div nfsColumn size="6">` keeps `size="6"`). They mean nothing on the hosts the Flex Grid uses; a consumer who wants none binds the input instead (`[size]="6"`).
- An expand from a larger breakpoint keeps the `max-width` of the count a smaller breakpoint set, because `.<bp>-expand` sets only `flex` (measured: `small-6 large-expand` alone in a row is 50 percent wide at 1280 px). `{small: 12, large: 'expand'}`, Foundation's own example, is not affected.
- Columns in a block grid take their width from the row's `up`, which outranks their own `size`; columns in an unstacking row take their flex from the row, and their `size` only caps them (check 3).
- On a Flex Grid column, `size="shrink"` is the grid's shrink (`flex: 0 0 auto; max-width: 100%`); the Flexbox Utilities' `nfsFlexChild="shrink"` is the vanilla helper (`flex: 0 1 auto`) and belongs on boxes inside a Flex parent.
- Equal heights: columns in one line of a row stretch to the tallest (measured in the block grid), so the Flex Grid needs no Equalizer for them ([Spec: Equalizer](../issues/34-spec-equalizer.md), the CSS answer).
- The `hidden` attribute does not hide a row: measured in three engines, `.row` keeps `display: flex` under `hidden`, because Foundation's rule comes after normalize's `[hidden] { display: none }`, while a plain `.column` is hidden. A row that comes and goes is removed with `@if`, or hidden by the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive or a Toggler in Visibility mode, which binds `.is-hidden` (building-blocks 1.10).
- Same-named inputs (building-blocks 1.9): `size` on `nfsColumn` and `expanded` on `nfsRow` share names with the Callout, Button, Close Button, Dropdown pane, Button Group, and Menu, so none of those shares an element with the grid's directives. The Float Grid's `NfsRow` and `NfsColumn` share selectors with these; a component that imported both would match both on one element, which the Flex Grid's missing-CSS check reports in a Float Grid page.
