# Spec: XY Grid

Ticket: [Spec: XY Grid](../issues/99-spec-xy-grid.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites lays out pages with the XY Grid, Foundation's default grid since 6.4: a `.grid-container` that centres and pads the page, a `.grid-x` row or a `.grid-y` column of `.cell` elements, and a set of classes generated per breakpoint and column count for sizes, offsets, gutters, block grids, collapsed gutters, full-viewport frames, and independently scrolling cells. The XY Grid is a layout system: it ships Sass and classes and no Plugin, so the markup is the whole contract, and that contract leaves the hard parts to the author:

- Every size is a class name built from Sass settings (`$grid-columns`, `$xy-block-grid-max`, `$breakpoint-classes`). A misspelt `medum-6`, a `small-13` on a 12-column grid, or `large-up-9` renders a full-width cell or no block grid, and nothing reports it.
- The class templates have gaps at the Zero breakpoint that look like classes: Foundation generates no `.small-auto` and no `.small-grid-frame`, and its `.small-shrink` only resets `flex-basis`, so `class="cell small-shrink"` still takes the full width (checked in the compiled CSS).
- Offsets, collapsed gutters, and block grids work only on a horizontal grid ("X Grid only" in the docs); on a `.grid-y` they do nothing, silently.
- A cell block (`.cell-block`, `.cell-block-y`) is a scroll container, and Foundation's docs markup gives it no keyboard access: measured with axe-core 4.13.0, the docs' Grid Frame example fails `scrollable-region-focusable` (WCAG 2.1.1) on all three of its cell blocks in Chromium, Firefox, and WebKit, and in WebKit the Tab key never reaches them. Chromium made such scroll containers keyboard-focusable on its own only in Chrome 132 ([Keyboard focusable scrollers](https://developer.chrome.com/blog/keyboard-focusable-scrollers)), after the Browser target's Chrome 119; Safari does not.
- A grid frame is `overflow: hidden` at the viewport's height. Applied at every width, Foundation's own frame example clips 3229 px of content to 256 px at 320 by 256 CSS px, the 400 percent zoom case of WCAG 1.4.10, in three engines (measured); applied from `medium`, as the docs do, it is not a frame at that size and nothing is lost.
- A margin grid in a `.grid-container.full` makes the page scroll sideways by half a gutter (10 px at 320 CSS px, 15 px at 1280, measured in three engines); the docs' fix, `body { overflow-x: hidden; }`, is a callout that is easy to miss.
- Under the library's class rule the developer writes no Foundation class at all, so every one of these classes needs an Angular home.

A server-rendered application adds the usual second problem: the layout must already be right in the server HTML, must not change at hydration, and must hold inside dehydrated and `hydrate never` blocks, where no JavaScript runs.

## Solution

Four attribute directives in one entry point, one per class that names an element of the layout: `[nfsGridContainer]` binds `.grid-container`, `[nfsGridX]` binds `.grid-x`, `[nfsGridY]` binds `.grid-y`, and `[nfsCell]` binds `.cell`. Every other XY Grid class is set by a typed Variant input of the directive whose element Foundation puts it on: the cell's `size` and `offset` (a bare value for the Zero breakpoint, or Breakpoint rules such as `[size]="{medium: 6, large: 4}"`), the grid's `up` block grid, the four gutter booleans, the collapse, frame, and cell block inputs, and the container's `fluid` and `full`. Counts and breakpoints are closed over the developer's own Sass through the Variant registries, so `size="13"` on a 12-column grid, `[size]="{meduim: 6}"`, and `up="9"` fail to compile ([ADR 0040](../adr/0040-variant-input-types.md)). The directives fill Foundation's Zero-breakpoint gaps, so `size="shrink"` and `gridFrame="small"` set the classes that exist. The X-only inputs exist only on `nfsGridX`.

A cell block is a keyboard-scrollable, named region: `nfsCell` gives it `tabindex="0"` and, on a `div`, `role="region"`, in the server HTML, and the developer names it from a visible heading with `aria-labelledby`. The documentation states what the types cannot: every class is set through the inputs, never copied; a cell is a direct child of a grid; an offset belongs in a horizontal grid; a cell block has a name; and a frame at every width makes each cell that can outgrow its share a cell block. Every effect is a host binding on signal inputs, no directive declares a listener, and nothing is measured or registered, so the grid is its server HTML in every rendering mode. The `nfs-xy-grid` Library mixin adds no CSS; it writes the two Variant properties the Variant declaration file's generator reads.

## User Stories

1. As an application developer, I want to write `nfsGridX` on a `div` and `nfsCell` on its children and get Foundation's XY Grid, so that I write no Foundation class.
2. As an application developer, I want the directives to work on any element (`div`, `section`, `article`, `main`, `aside`, `ul` and `li`), so that my layout keeps the semantics of my content.
3. As an application developer, I want `size="6"` to give me Foundation's `small-6`, so that the common case is one attribute.
4. As an application developer, I want `[size]="{medium: 6, large: 4}"` to give me `medium-6 large-4`, so that responsive widths are one typed binding, not a class per breakpoint.
5. As an application developer with `$grid-columns: 16`, I want `size="16"` to compile once my Variant declaration file says so, and `size="17"` to fail, so that my Sass stays the only column count.
6. As an application developer, I want `[size]="{meduim: 6}"` and `size="13"` to fail to compile, so that a typo never ships a full-width cell.
7. As an application developer, I want `size="auto"` and `size="shrink"`, and their responsive forms `{large: 'auto'}`, so that cells take the remaining space or only what they need.
8. As an application developer, I want `size="shrink"` and `{small: 'auto'}` to set the classes Foundation really generates for the Zero breakpoint, so that the gaps in Foundation's class templates never reach me.
9. As an application developer, I want a cell with no `size` to be full width, as Foundation's bare `.cell` is, so that stacked layouts need nothing.
10. As an application developer, I want `offset="2"` and `[offset]="{large: 2}"`, so that I can push a cell right by whole columns.
11. As an application developer, I want `gridMarginX` and `gridPaddingX` on a grid, so that I choose Foundation's margin or padding gutters by name.
12. As an application developer, I want `gridMarginY` beside `gridMarginX` on a horizontal grid, so that wrapped rows of cards get Foundation's vertical gutter too.
13. As an application developer, I want `marginCollapse="medium"` and `paddingCollapse="medium"`, so that gutters disappear from a breakpoint up without a class name.
14. As an application developer, I want `[up]="{small: 2, medium: 4, large: 6}"` on a grid, so that its cells share each row equally, Foundation's block grid.
15. As an application developer, I want `up`, offsets, and collapsed gutters to exist only where Foundation's CSS supports them, so that I cannot write a block grid on a vertical grid.
16. As an application developer, I want `nfsGridY` for a vertical grid with the same `size` input on its cells, so that heights split the same way widths do.
17. As an application developer, I want `nfsGridContainer` with `fluid` or `full`, so that I contain, stretch, or bleed the page's content by Foundation's names.
18. As an application developer, I want `gridFrame="medium"` on a grid, so that the page becomes a full-viewport frame from medium up, as Foundation's docs show.
19. As an application developer, I want `cellBlockY="medium"` and `cellBlock="medium"` on cells and `cellBlockContainer="medium"` on the cells that hold them, so that a sidebar and a body scroll on their own inside the frame.
20. As a keyboard user, I want Tab to reach every independently scrolling cell and the arrow, Page Up, Page Down, Home, and End keys to scroll it, in every browser, so that I can read content that does not fit.
21. As a screen reader user, I want each scrolling cell to announce itself as a named region when it takes focus, so that I know where I am.
22. As an application developer, I want the documentation to say that a scrolling cell needs a name, so that I add `aria-labelledby` before release.
23. As an application developer, I want the documentation to say how a grid frame avoids clipping content (start it at a larger breakpoint, or make the cell that can overflow a cell block), so that I avoid a 1.4.10 failure that axe does not report.
24. As an application developer, I want the docs to tell me when a frame or a full container needs Foundation's `body` overflow rules, and to scope them to the frame's breakpoint, so that I never hide page content at small sizes.
25. As a user at 400 percent zoom, I want a page laid out with a medium-up frame to reflow into a normally scrolling page, so that nothing is clipped.
26. As a user who enlarges text spacing, I want a frame's scrolling cells to absorb the extra height, so that nothing is clipped.
27. As a user, I want the visual order of cells to match their reading and focus order, so that a grid never reorders what I hear or tab through.
28. As an application developer, I want alignment, source ordering, and visibility on grids and cells to come from the Flexbox Utilities and Visibility Classes directives written beside `nfsGridX` and `nfsCell`, so that each family has one owner.
29. As an application developer, I want to write `nfsStickyContainer`, `nfsTabsGroup`, `nfsInterchange`, `nfsCard`, or an Equalizer directive beside the grid directives on the same element, so that no extra wrapper is needed.
30. As an application developer migrating Foundation markup, I want the mapping table to name the input that replaces each class (`class="cell medium-6"` becomes `nfsCell [size]="{medium: 6}"`), so that I learn the directive form.
31. As an application developer, I want the documentation to say that a cell is a direct child of a grid and that an offset works only in a horizontal grid, so that I never write a size that cannot apply.
32. As an application developer, I want the Variant declaration tooling to keep my count and breakpoint types in step with my Sass once I include `nfs-xy-grid`, so that I bind only sizes, offsets, block-grid counts, and breakpoints my compiled CSS has classes for.
33. As a developer of a server-rendered application, I want the server HTML to carry every grid class and the cell blocks' `tabindex` and `role`, so that the first paint is final and hydration changes nothing.
34. As a developer using `@defer (hydrate never)`, I want a grid there to keep its layout and its keyboard-scrollable cell blocks, so that static regions need no JavaScript.
35. As a developer using incremental hydration, I want grids and cells to work across hydration boundaries, so that a deferred cell never breaks its grid.
36. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
37. As an application developer, I want to import the directives from one entry point, so that a `@defer` block can split them.
38. As a library maintainer, I want every behaviour asserted through classes, roles, names, focus, scroll positions, and geometry in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

The XY Grid has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its contract is Foundation's XY Grid Sass partials, its XY Grid docs page, and the classes its export mixin generates. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Grid container | `.grid-container` | `xy-grid-container` | `max-width: $grid-container` (`$global-width`, 75rem), centred, padding of half `$grid-container-padding` (0.625rem, 0.9375rem from medium) |
| Fluid, full container | `.fluid`, `.full` on `.grid-container` | fixed classes | `.fluid`: `max-width: 100%` with the padding; `.full`: `max-width: 100%` and no padding. Written together, `.full` wins, because its rule comes last (checked in the compiled CSS). Docs: a margin grid in a full container needs `body { overflow-x: hidden; }` |
| Grids | `.grid-x`, `.grid-y` | `xy-grid` | `.grid-x`: `display: flex; flex-flow: row wrap`; `.grid-y`: `flex-flow: column nowrap`, needs a height |
| Cell | `.cell` | `xy-cell(full)` | `flex: 0 0 auto; min-height: 0; min-width: 0; width: 100%` |
| Sizes | `.<bp>-<n>` for every Class breakpoint and the Zero breakpoint, `n` from 1 to `$grid-columns` (12) | `$grid-columns`, `$breakpoint-classes` | Widths in a `.grid-x`, heights in a `.grid-y` (`.grid-x > .small-6`) |
| Auto and shrink | `.auto`, `.shrink`; `.<bp>-auto`, `.<bp>-shrink` for Class breakpoints above the Zero breakpoint | fixed names | No `.small-auto` exists; `.small-shrink` and every `.<bp>-full` appear only in a `flex-basis: auto` reset, so they do not size a cell |
| Gutters | `.grid-margin-x`, `.grid-padding-x`, `.grid-margin-y`, `.grid-padding-y` | `$grid-margin-gutters`, `$grid-padding-gutters` (small 20px, medium 30px) | Margin grid: negative margins on the grid, `calc()` sizes and margins on cells; padding grid: padding on cells. A cross-axis gutter works too: measured, `grid-x grid-margin-x grid-margin-y` puts a 30 px gap between wrapped rows at 800 px in three engines, through Foundation's `.grid-margin-y:not(.grid-y) > .cell { height: auto }` |
| Collapse | `.<bp>-margin-collapse`, `.<bp>-padding-collapse` for each name in `$breakpoint-classes` | `xy-grid-collapse` | From that breakpoint up; left and right only ("X Grid only") |
| Offsets | `.<bp>-offset-<n>` for every Class breakpoint and the Zero breakpoint, `n` from 0 to `$grid-columns` minus 1 | `xy-cell-offset` | `margin-left` (`$global-left`), plus half a gutter in a margin grid ("X Grid only") |
| Block grid | `.<bp>-up-<n>` on `.grid-x`, for every Class breakpoint and the Zero breakpoint, `n` from 1 to `$xy-block-grid-max` (8) | `xy-grid-layout` | "Block Grids are not available for the vertical grids" |
| Frame | `.grid-frame`; `.<bp>-grid-frame` for Class breakpoints above the Zero breakpoint | `xy-grid-frame` | `overflow: hidden; position: relative; flex-wrap: nowrap; align-items: stretch`, `100vw` wide (or `100vh` tall on `.grid-y`). Docs: with margin gutters it needs `body { overflow: hidden; }`, "take care not to unintentionally hide overflow body content on small screens when using `.medium-grid-frame`" |
| Cell block | `.cell-block`, `.cell-block-y`, `.cell-block-container`; `.<bp>-` forms above the Zero breakpoint | `xy-cell-block`, `xy-cell-block-container` | `.cell-block`: `overflow-x: auto; max-width: 100%`; `.cell-block-y`: `overflow-y: auto; max-height: 100%; min-height: 100%`; `.cell-block-container`: `display: flex; flex-direction: column; max-height: 100%`, its child `.grid-x` `nowrap`. No `tabindex`, role, or name in the docs markup |
| Export mixin | `foundation-xy-grid-classes($base-grid, $margin-grid, $padding-grid, $block-grid, $collapse, $offset, $vertical-grid, $frame-grid)` | every argument `true` by default | Included by `foundation-everything` while `$xy-grid` is true |
| Semantic mixins | `xy-grid-container`, `xy-grid`, `xy-cell`, `xy-cell-size`, `xy-gutters`, `xy-grid-layout`, `xy-cell-offset`, `xy-grid-frame`, `xy-cell-block`, `xy-cell-block-container`, `xy-grid-collapse` | Foundation's docs, "Building Semantically" | For the consumer's own classes in the consumer's own Sass (Out of Scope) |

Reading order: the compiled XY Grid CSS sets no `order`, no reversed flex direction, and no positioning (checked), so cells always paint in DOM order, row by row or top to bottom; offsets add space and move nothing past a sibling. Push and pull do not exist in the XY Grid: its docs send them to source ordering, a Flexbox Utilities class family.

Docs conventions kept or corrected: the element structure (kept); the docs' demo classes `.header` and `.footer` on frame cells (replaced by the consumer's `header` and `footer` elements, which the class rule leaves free of any class); `style="height: 500px"` on a vertical grid (kept: a vertical grid needs a height, and an arbitrary value is the consumer's own style); `body { overflow-x: hidden; }` for a margin grid in a full container and `body { overflow: hidden; }` for a margin-gutter frame (kept, as consumer CSS scoped to the frame's breakpoint, D11); cell blocks without keyboard access or a name (corrected, D8).

### CSS class to directive mapping

`small` in the value columns stands for the Zero breakpoint, the key of `nfsBreakpointsToken`'s map whose value is 0, and `medium` for any other Class breakpoint. `NfsGridQuery` is `NfsClassBreakpointQuery<'up'>`, a Class breakpoint alone or with ` up`, because every responsive on-or-off family of the XY Grid applies from a breakpoint up.

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.grid-container` | `NfsGridContainer` (`[nfsGridContainer]`), static host class | - | - | `grid-container` | - |
| `.fluid` | `fluid` of `NfsGridContainer` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.fluid` | none (closed) |
| `.full` | `full` of `NfsGridContainer` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.full` | none (closed) |
| `.grid-x` | `NfsGridX` (`[nfsGridX]`), static host class | - | - | `grid-x` | - |
| `.grid-y` | `NfsGridY` (`[nfsGridY]`), static host class | - | - | `grid-y` | - |
| `.grid-margin-x`, `.grid-padding-x`, `.grid-margin-y`, `.grid-padding-y` | `gridMarginX`, `gridPaddingX`, `gridMarginY`, `gridPaddingY` of `NfsGridX` and `NfsGridY` | `boolean` through `nfsVariantBoolean`; closed | boolean | the input's class | none (closed) |
| `.<bp>-up-<n>` | `up` of `NfsGridX` | `NfsGridUpInput` over `NfsGridUp`, `NfsOverridableCount<8, NfsXyBlockGridMaxOverrides>`; `$xy-block-grid-max` (`NfsXyBlockGridMaxOverrides`) and `$breakpoint-classes` (`NfsBreakpointClassesOverrides`) | count, bare (the Zero breakpoint) or in Breakpoint rules | `up="2"` sets `.small-up-2`; `[up]="{small: 2, medium: 4}"` sets `.small-up-2 .medium-up-4` | `--nfs-xy-block-grid-max`; `--nfs-breakpoint-classes` |
| `.<bp>-margin-collapse`, `.<bp>-padding-collapse` | `marginCollapse`, `paddingCollapse` of `NfsGridX` | `NfsVariantBoolean \| NfsGridQuery`; `$breakpoint-classes` | `true` (or the bare attribute) or a Breakpoint query | `true`, `'small'`, and `'small up'` set `.small-margin-collapse`; `'medium'` and `'medium up'` set `.medium-margin-collapse`; `false` and no value set none | `--nfs-breakpoint-classes` |
| `.grid-frame`, `.<bp>-grid-frame` | `gridFrame` of `NfsGridX` and `NfsGridY` | `NfsVariantBoolean \| NfsGridQuery`; `$breakpoint-classes` | `true` or a Breakpoint query | `true`, `'small'`, and `'small up'` set `.grid-frame` (Zero-breakpoint gap: Foundation generates no `.small-grid-frame`); `'medium'` sets `.medium-grid-frame` | `--nfs-breakpoint-classes` |
| `.cell` | `NfsCell` (`[nfsCell]`), static host class | - | - | `cell` | - |
| `.<bp>-<n>`, `.auto`, `.shrink`, `.<bp>-auto`, `.<bp>-shrink` | `size` of `NfsCell` | `NfsCellSizeInput` over `NfsCellSize`: `NfsGridColumn` (`NfsOverridableCount<12, NfsGridColumnsOverrides>`), `'auto'`, or `'shrink'`; `$grid-columns` (`NfsGridColumnsOverrides`) and `$breakpoint-classes` | a count or keyword, bare (the Zero breakpoint) or in Breakpoint rules | `size="6"` sets `.small-6`; `[size]="{medium: 6, large: 'auto'}"` sets `.medium-6 .large-auto`. Zero-breakpoint gaps: `'auto'` and `'shrink'` at the Zero breakpoint set `.auto` and `.shrink`, because Foundation generates no `.small-auto` and its `.small-shrink` only resets `flex-basis`. No value sets none, so the cell is full width | `--nfs-grid-columns`; `--nfs-breakpoint-classes` |
| `.<bp>-offset-<n>` | `offset` of `NfsCell` | `NfsCellOffsetInput` over `NfsCellOffset`, 0 to `$grid-columns` minus 1 (`Exclude<NfsOverridableCount<12, NfsGridColumnsOverrides, 0>, NfsOverridableCountValue<12, NfsGridColumnsOverrides>>`); `$grid-columns` and `$breakpoint-classes` | a count, bare or in Breakpoint rules | `offset="2"` sets `.small-offset-2`; `[offset]="{large: 2}"` sets `.large-offset-2`; `{large: 0}` sets `.large-offset-0`, Foundation's reset | `--nfs-grid-columns`; `--nfs-breakpoint-classes` |
| `.cell-block`, `.cell-block-y`, `.cell-block-container`, and their `.<bp>-` forms | `cellBlock`, `cellBlockY`, `cellBlockContainer` of `NfsCell` | `NfsVariantBoolean \| NfsGridQuery`; `$breakpoint-classes` | `true` or a Breakpoint query | `true`, `'small'`, and `'small up'` set the unprefixed class (Zero-breakpoint gap: no `.small-cell-block` exists); `'medium'` sets `.medium-cell-block`, `.medium-cell-block-y`, or `.medium-cell-block-container` | `--nfs-breakpoint-classes` |
| `.<bp>-full` | Not offered | - | - | Foundation lists it only in a `flex-basis` reset and gives it no width; a cell with no `size`, or `size` set to the column count, is full width | - |
| `.flex-container`, `.align-*`, `.align-self-*`, `.<bp>-order-<n>` (another family's: the Flexbox Utilities') | `NfsFlexContainer`, `NfsFlexAlign` (`alignX`, `alignY`, `alignCenterMiddle`), and `NfsFlexChild` (`alignSelf`, `order`), written beside the grid directives (D15) | The [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s types and settings | - | - | - |
| `.card` (another family's: the Card's) | `NfsCard` (`[nfsCard]`) inside a cell | The [Spec: Card](../issues/90-spec-card.md)'s | - | `card` | - |

State classes: none; the XY Grid has no runtime state. The cell block's `tabindex` and `role` are attributes, not classes (ARIA and keyboard). No class is left for the consumer to write (ADR 0039).

Binding rule (D7): each directive binds one `computed` class list through `[class]` beside its static host class. The list holds only the classes its inputs set, so a Foundation class copied from Foundation's markup is not stripped: Angular keeps a static class that no binding names. The documented usage sets every class through the inputs. A record of every owned class set `false` would strip it, as the Menu's does, but the XY Grid's class set depends on the consumer's `$grid-columns`, `$xy-block-grid-max`, and `$breakpoint-classes`, which the running directive does not know, and it would hold about 90 keys per cell. Redundant copies of the static host classes (`cell` on `nfsCell`) merge with them.

### Hierarchy and DI shape

```
[nfsGridContainer]              NfsGridContainer   (optional; .grid-container)
  [nfsGridX] | [nfsGridY]       NfsGridX, NfsGridY (.grid-x, .grid-y)
    [nfsCell]                   NfsCell            (.cell; a direct child of a grid)
      [nfsGridX] | [nfsGridY]   a nested grid, inside the cell or on the cell's own element
```

- Four standalone directives with no template, no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a grid or a cell through DI: Foundation's child selectors (`.grid-x > .small-6`, `.grid-margin-x > .cell`) carry the grid's settings to its cells, and a cell's place as a direct child of a grid is documented usage (API). Grids and cells therefore work across any Hydration boundary and through content projection.
- A cell may also be a grid (`<div nfsCell nfsGridX>`), and a container may also be a grid: the directives declare no input names in common.
- Composition by placement (building-blocks 1.9): the Flexbox Utilities, Visibility Classes, Sticky (`nfsStickyContainer`), Equalizer, Tabs (`nfsTabsGroup`), Interchange, and Card directives are written beside the grid directives on one element, and none hosts or is hosted by them. The Flexbox Utilities own every alignment and source-ordering class on grids and cells (the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), D8): `nfsFlexAlign` (`alignX`, `alignY`, `alignCenterMiddle`) beside `nfsGridX` or `nfsGridY`, and `nfsFlexChild` (`alignSelf`, `order`) beside `nfsCell`; the grid directives declare no input for those classes and host neither (D15). Two directives on one element must not both declare an input of the same name: a static `size="small"` would reach the Callout's `size` and the cell's `size` alike and fail against the cell's count, so a callout goes inside its cell, as Foundation's markup nests them.
- No Defaults token: the XY Grid has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `nfsBreakpointsToken` of `ngx-foundation-sites/media-query` (the Zero breakpoint, D4) in `NfsGridX`, `NfsGridY`, and `NfsCell`; in `NfsCell`, `HostAttributeToken('tabindex')` and `HostAttributeToken('role')` (optional; echoed, D8) and `ElementRef` (the host tag, once, at construction). `NfsGridContainer` injects nothing, because its families are closed.
- Entry point: `ngx-foundation-sites/xy-grid` (one per Foundation docs page), exporting the four directives and the aliases `NfsGridColumn`, `NfsCellSize`, `NfsCellSizeInput`, `NfsCellOffset`, `NfsCellOffsetInput`, `NfsGridUp`, `NfsGridUpInput`, and `NfsGridQuery`. `NfsGridColumnsOverrides`, `NfsXyBlockGridMaxOverrides`, `NfsBreakpointClassesOverrides`, the count helpers, the Class breakpoint types, and `nfsVariantBoolean` live in the primary entry point `ngx-foundation-sites` and are used here as types only, apart from the one pure `nfsVariantBoolean` function.
- Imports (documented usage): a component imports each of the four directives whose attribute its template writes. A forgotten one fails to compile where the template binds one of its inputs (`[size]`, `[offset]`, `[up]`, `[gridFrame]`, NG8002); with static attributes only, its element renders without its classes and with no error, so a grid whose `NfsGridX` is forgotten lays out its cells as plain blocks. No part injects a parent, so none fails with NG0201 (D14).

### API

```ts
// ngx-foundation-sites/xy-grid
/** A column count from 1 to $grid-columns (12 by default). */
type NfsGridColumn = NfsOverridableCount<12, NfsGridColumnsOverrides>;
/** One breakpoint's cell size: .<bp>-<n>, .auto or .<bp>-auto, .shrink or .<bp>-shrink. */
type NfsCellSize = NfsGridColumn | 'auto' | 'shrink';
type NfsCellSizeInput = NfsCellSize | `${NfsGridColumn}` | NfsClassBreakpointRules<NfsCellSize>;
/** .<bp>-offset-<n>: 0 to $grid-columns minus 1. */
type NfsCellOffset = Exclude<NfsOverridableCount<12, NfsGridColumnsOverrides, 0>, NfsOverridableCountValue<12, NfsGridColumnsOverrides>>;
type NfsCellOffsetInput = NfsCellOffset | `${NfsCellOffset}` | NfsClassBreakpointRules<NfsCellOffset>;
/** .<bp>-up-<n>: 1 to $xy-block-grid-max (8 by default). */
type NfsGridUp = NfsOverridableCount<8, NfsXyBlockGridMaxOverrides>;
type NfsGridUpInput = NfsGridUp | `${NfsGridUp}` | NfsClassBreakpointRules<NfsGridUp>;
/** A Class breakpoint from which a frame, cell block, or collapse applies: 'medium' or 'medium up'. */
type NfsGridQuery = NfsClassBreakpointQuery<'up'>;

class NfsGridContainer {                     // [nfsGridContainer]
  readonly fluid: InputSignalWithTransform<boolean, NfsVariantBoolean>;      // default false
  readonly full: InputSignalWithTransform<boolean, NfsVariantBoolean>;       // default false
}

class NfsGridX {                             // [nfsGridX]
  readonly gridMarginX: InputSignalWithTransform<boolean, NfsVariantBoolean>;  // default false
  readonly gridPaddingX: InputSignalWithTransform<boolean, NfsVariantBoolean>; // default false
  readonly gridMarginY: InputSignalWithTransform<boolean, NfsVariantBoolean>;  // default false
  readonly gridPaddingY: InputSignalWithTransform<boolean, NfsVariantBoolean>; // default false
  readonly up: InputSignalWithTransform<NfsGridUp | NfsClassBreakpointRules<NfsGridUp> | undefined, NfsGridUpInput | undefined>; // default undefined
  readonly marginCollapse: InputSignalWithTransform<boolean | NfsGridQuery, NfsVariantBoolean | NfsGridQuery>;  // default false
  readonly paddingCollapse: InputSignalWithTransform<boolean | NfsGridQuery, NfsVariantBoolean | NfsGridQuery>; // default false
  readonly gridFrame: InputSignalWithTransform<boolean | NfsGridQuery, NfsVariantBoolean | NfsGridQuery>;       // default false
}

class NfsGridY {                             // [nfsGridY]
  // gridMarginX, gridPaddingX, gridMarginY, gridPaddingY, gridFrame: as on NfsGridX
}

class NfsCell {                              // [nfsCell]
  readonly size: InputSignalWithTransform<NfsCellSize | NfsClassBreakpointRules<NfsCellSize> | undefined, NfsCellSizeInput | undefined>;       // default undefined
  readonly offset: InputSignalWithTransform<NfsCellOffset | NfsClassBreakpointRules<NfsCellOffset> | undefined, NfsCellOffsetInput | undefined>; // default undefined
  readonly cellBlock: InputSignalWithTransform<boolean | NfsGridQuery, NfsVariantBoolean | NfsGridQuery>;          // default false
  readonly cellBlockY: InputSignalWithTransform<boolean | NfsGridQuery, NfsVariantBoolean | NfsGridQuery>;         // default false
  readonly cellBlockContainer: InputSignalWithTransform<boolean | NfsGridQuery, NfsVariantBoolean | NfsGridQuery>; // default false
}
```

| Input | Directive | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `fluid`, `full` | `NfsGridContainer` | `false` | `.grid-container.fluid`, `.grid-container.full` | New. Set one: both set renders `.full`, and `fluid` has no effect (D3) |
| `gridMarginX`, `gridPaddingX`, `gridMarginY`, `gridPaddingY` | `NfsGridX`, `NfsGridY` | `false` | `.grid-margin-x` and the other gutter classes | New. Both axes on both grids: the main axis spaces cells, the cross axis spaces wrapped rows or columns |
| `up` | `NfsGridX` | `undefined` | `.<bp>-up-<n>` | New. Horizontal grids only, as Foundation's docs say |
| `marginCollapse`, `paddingCollapse` | `NfsGridX` | `false` | `.<bp>-margin-collapse`, `.<bp>-padding-collapse` | New. Horizontal grids only; from the breakpoint up |
| `gridFrame` | `NfsGridX`, `NfsGridY` | `false` | `.grid-frame`, `.<bp>-grid-frame` | New. Zero-breakpoint gap filled; a frame at every width makes each cell that can outgrow its share a cell block (D10) |
| `size` | `NfsCell` | `undefined` | `.<bp>-<n>`, `.auto`, `.shrink`, `.<bp>-auto`, `.<bp>-shrink` | New. One input for every breakpoint; Zero-breakpoint gaps filled |
| `offset` | `NfsCell` | `undefined` | `.<bp>-offset-<n>` | New. Horizontal grids only: in a vertical grid it moves nothing (D16) |
| `cellBlock`, `cellBlockY`, `cellBlockContainer` | `NfsCell` | `false` | `.cell-block`, `.cell-block-y`, `.cell-block-container` and their breakpoint forms | New. `cellBlock` and `cellBlockY` also make the cell a keyboard-scrollable region (D8) |

- Every input's JSDoc names Foundation's class template and the Sass setting (AGENTS.md Design Philosophy 5). Every input declares explicit type arguments that name the exported aliases (or `NfsVariantBoolean`), and the library build's typings assertion covers all of them ([ADR 0040](../adr/0040-variant-input-types.md)); the count inputs are the case the assertion exists for.
- The count transforms turn a static attribute's string (`size="6"`) into its number and pass keywords and Breakpoint rules through; the on-or-off transform maps `NfsVariantBoolean` through `nfsVariantBoolean` and passes a Breakpoint query through. None uses `numberAttribute` or `booleanAttribute`. The transforms are internal.
- Models, outputs, and methods: none. `exportAs`: `nfsGridContainer`, `nfsGridX`, `nfsGridY`, `nfsCell`, each the class name with a lowercase first letter.

Host bindings, all on signal state:

| Directive | Static `class` | `[class]` | Other |
| --- | --- | --- | --- |
| `NfsGridContainer` | `grid-container` | `fluid`, `full` while set | - |
| `NfsGridX` | `grid-x` | the gutter classes, the `up` classes, the collapse classes, the frame class | - |
| `NfsGridY` | `grid-y` | the gutter classes, the frame class | - |
| `NfsCell` | `cell` | the `size` and `offset` classes, the cell block classes | `[attr.tabindex]`: `0` while `cellBlock` or `cellBlockY` is set, unless the host has a static `tabindex`, which is echoed; `[attr.role]`: `region` while `cellBlock` or `cellBlockY` is set on a `div` host without a static `role`, otherwise the static `role` echoed |

- The mapping from a value to its classes is one pure function per directive of the input values and the Zero breakpoint, the same on server and client. It binds nothing for a value that is not one class token or a query it cannot parse; under the closed types only a cast or `$any()` reaches that guard.
- The `tabindex` and `role` bindings apply at every width, not only where the breakpoint makes the cell scroll (D8).
- Attribute ownership: `NfsCell` owns `tabindex` and `role` only while the cell is a cell block, and echoes the consumer's static values otherwise, so a `role` or `tabindex` written on a plain cell stays. It never writes `aria-*` or `id`: the name is the consumer's `aria-labelledby` or `aria-label`. A consumer `[attr.tabindex]` binding on a cell block loses to the host binding (Angular's collision rule), and the examples never use it. The consumer's own classes are untouched.
- Documented usage, stated in the directives' JSDoc:
  1. Classes (D7): every XY Grid class is set through the inputs, never written in `class`: `class="medium-6 large-offset-2"` on a cell is `[size]="{medium: 6}"` and `[offset]="{large: 2}"`, and `grid-x` is `nfsGridX`. The Flexbox Utilities' classes that Foundation's grid examples carry (`.align-*` and `.align-center-middle` on a grid, `.align-self-*` and `.<bp>-order-<n>` on a cell) are `nfsFlexAlign` and `nfsFlexChild` with their inputs, written beside the grid directives (D15). A copied class is not stripped (D7).
  2. Placement: an `nfsCell` is a direct child of an `nfsGridX` or `nfsGridY` element, because Foundation's child selectors apply its size, offset, and gutters only there; `offset` works only in `nfsGridX` ("X Grid only" in Foundation's docs, D16).
  3. Cell block name (4.1.2): a `div` or `section` cell block (`cellBlock` or `cellBlockY` set) is named by `aria-labelledby` pointing at its heading, or by `aria-label`; a host with a role of its own (`main`, `aside`, `nav`, `article`, `form`, a static `role`) needs no added name.
  4. Container width (D3): set one of `fluid` and `full`; beside `full`, `fluid` has no effect.
  5. Frames (1.4.10, D10): a `gridFrame` applies from a Class breakpoint above the Zero breakpoint (`gridFrame="medium"`), or, where it applies at every width, every cell whose content can outgrow its share is a cell block (`cellBlockY`), so the frame never clips content.
- `nfs-xy-grid` alone writes `--nfs-grid-columns` and `--nfs-xy-block-grid-max`, from which the Variant declaration tooling types the counts; `NfsGridContainer`'s families are closed.

### Comparison with Angular Material (22.2)

Material has no CSS layout grid; the nearest component is `MatGridList`, a tile list that positions its tiles from TypeScript.

| Concern | Material `mat-grid-list` and `mat-grid-tile` | XY Grid directives |
| --- | --- | --- |
| Kind | Components with templates, `MAT_GRID_LIST` parent token, `exportAs: 'matGridList'` | Attribute directives on the consumer's elements; no template or token |
| Layout | Computed in `ngAfterContentChecked` and written as inline styles on each tile; `cols`, `rowHeight` (fixed, ratio, or `fit`), `gutterSize` | Foundation's compiled CSS; the classes are host bindings in server HTML |
| Item size | `colspan`, `rowspan` inputs on the tile | `size` and `offset` on the cell, per breakpoint through Breakpoint rules |
| Responsive | None built in (the consumer changes `cols` from a `BreakpointObserver`) | CSS media queries through Foundation's breakpoint classes; no JavaScript |
| Semantics | None | None on grids and cells; scrolling cell blocks are named regions with a tab stop |
| Testing | `MatGridListHarness`, `MatGridTileHarness` | DOM-first assertions; no harness |

Borrowed: per-item size inputs on the item and gutters as a setting of the grid. Not borrowed: templates and a parent token (Foundation's markup carries the elements, ADR 0001), JavaScript layout and inline styles (Foundation's CSS already lays out, on the server too), and `rowHeight`'s modes (Foundation has no row height; a vertical grid sizes its cells).

### Implementation level and primitives

Implementation level: native platform. The layout is CSS flexbox from Foundation's compiled classes, responsive through CSS media queries; a cell block is a native scroll container made a tab stop with `tabindex`, scrolled by the browser's own keys, and named with native ARIA attributes. `@angular/aria` has a Grid pattern (`ngGrid`), but it is the APG Grid composite, an interactive widget with two-dimensional arrow-key navigation between cells, which a layout grid is not (D13). `@angular/cdk` has nothing to add: `BreakpointObserver` would repeat what the CSS media queries do, and no focus or scroll service is needed. The Angular layer is static host classes, one `computed` class list per directive, two echoed attributes on the cell, and `nfsBreakpointsToken` for the Zero breakpoint. No render callback, no observer, no `effect`, no listener, no timer.

Fallback: none needed. The risks this spec owns (keyboard access to cell blocks, their focus indicator inside a frame, frame clipping at 400 percent zoom and with text spacing, the full container's sideways scroll, and the Zero-breakpoint gaps) were measured by this spec's ticket in Chromium, Firefox, and WebKit through Playwright 1.63 with axe-core 4.13.0, over Foundation 6.9.0 compiled with Dart Sass.

### ARIA and keyboard

APG pattern: none. A layout grid is not the ARIA `grid` role, and a role is a promise (building-blocks 1.10). A scrolling cell block is a landmark region with a tab stop (WAI-ARIA `region`; axe `scrollable-region-focusable`).

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsGridContainer]`, `[nfsGridX]`, `[nfsGridY]`, `[nfsCell]` | The host element's own role; the directives add no role, name, or state. A `ul` grid of `li` cells stays a list | WHATWG HTML; HTML-AAM |
| Cell block (`cellBlock` or `cellBlockY` set) on a `div` | `tabindex="0"`, `role="region"`, named by the consumer's `aria-labelledby` (a visible heading inside) or `aria-label` | Measured: the docs' frame fails axe `scrollable-region-focusable` on its three cell blocks in three engines, and passes with `tabindex="0"`; WebKit's Tab reaches them only then. A name is allowed only with a role, so a `div` takes `region` |
| Cell block on `section` | `tabindex="0"`; a named `section` is a region by itself | HTML-AAM |
| Cell block on `main`, `aside`, `nav`, `article`, or with a static `role` | `tabindex="0"`; the host keeps its own role, and a name is optional | HTML-AAM; building-blocks 1.10 |
| Cell block container (`cellBlockContainer`), frame (`gridFrame`) | Nothing: neither scrolls | Foundation's CSS |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches each cell block in DOM order, and the controls inside it | Native (`tabindex="0"`) |
| ArrowUp, ArrowDown, Page Up, Page Down, Home, End, Space | Scroll a focused vertical cell block (measured in three engines, one press each: ArrowDown to a `scrollTop` of 40 to 51 px, Page Down on to 200 to 231 px, End to the bottom, Home back to 0) | Native |
| ArrowLeft, ArrowRight | Scroll a focused horizontal cell block (measured: 35 to 40 px per press) | Native |

Focus: the directives move no focus. A cell block below its breakpoint does not scroll but keeps its tab stop and its region (D8).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Geometry and axe results were measured by this spec's ticket in Chromium, Firefox, and WebKit through Playwright 1.63 with axe-core 4.13.0, over Foundation 6.9.0 on its default settings. The XY Grid draws no colour, so no contrast criterion applies to it.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 2.1.1 Keyboard | Every cell block is a tab stop, so its content scrolls with the keyboard in every engine of the Browser target: `NfsCell` binds `tabindex="0"` while `cellBlock` or `cellBlockY` is set, in the server HTML (D8) | Fails: the docs' frame has three cell blocks without `tabindex`; axe reports `scrollable-region-focusable` on all three in three engines, WebKit's Tab never reaches them, and the Browser target's Chrome 119 predates Chromium's keyboard-focusable scrollers (Chrome 132). With `tabindex="0"` axe passes and Tab reaches each in three engines | axe in every story; `xy-grid--cell-blocks` play function tabs to each region; e2e real key presses scroll each cell block in three engines; fixture app with JavaScript disabled |
| 4.1.2 Name, Role, Value | A cell block is a focusable element with a role and a name: `region` on a `div` host, or the host's own role, and the consumer's `aria-labelledby` or `aria-label`, which a `div` or `section` cell block always has (documented usage) | No role or name | `getByRole('region', {name})` in the frame and cell block stories |
| 2.4.7 Focus Visible | A focused cell block shows the browser's own focus ring; the library adds and removes no outline. Measured: the frame's `overflow: hidden` clips the ring on the one side a cell block shares with the frame (the sidebar's left edge, the body's right edge) in Firefox and WebKit, and three sides stay visible; Chromium draws the ring inside the edge as well | Not reachable without `tabindex` | e2e screenshot comparison before and after Tab in `xy-grid--frame` at 1280 by 800 px in three engines: the ring shows on at least three sides |
| 2.4.3 Focus Order; 1.3.2 Meaningful Sequence | Cells paint in DOM order: the XY Grid's CSS sets no `order`, reversed direction, or positioning, and no directive offers one; offsets add space only. Source ordering is the Flexbox Utilities' family and its spec's hazard | Passes | `xy-grid--offsets` and `xy-grid--block-grid` play functions assert that the reading order of the cells' text is their visual order |
| 1.4.10 Reflow | A grid frame clips what does not fit. Requirement: a frame applies from a Class breakpoint above the Zero breakpoint (`gridFrame="medium"`, the docs' form), or, where it applies at every width, every cell whose content can outgrow its share is a cell block (D10). A horizontal cell block at the Zero breakpoint holds only content that needs two-dimensional layout (a data table), 1.4.10's exception; other horizontal cell blocks start from `medium`. A margin grid in a `full` container scrolls the page sideways into empty gutter space only, which no content needs; Foundation's `body { overflow-x: hidden; }` removes that scroll (measured) and every `full` recipe carries it | Measured at 320 by 256 CSS px: Foundation's frame example as `.grid-frame` clips 3229 px of content to 256 px in three engines; as `.medium-grid-frame` it is no frame there, and nothing is clipped or scrolls sideways. A full container's margin grid scrolls 10 px sideways at 320 px by wheel and by ArrowRight in three engines, and 0 px with the `body` rule | e2e in three engines: `xy-grid--frame` at 320 by 256 px has `documentElement.scrollWidth` at most 320 and no clipped frame; `xy-grid--container` at 320 px does not scroll sideways by wheel or ArrowRight |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, a frame's shrink cells grow and its auto cell and cell blocks absorb the difference, so nothing is clipped | Measured: Foundation's frame example with medium-up cell blocks clips nothing at 1280 by 800, 1024 by 600, and 640 by 360 px, with or without the text spacing, in three engines (the header grows from 117 to 160 px at 1280 by 800, the scrolling cells shrink from 632 to 586 px) | e2e in three engines at 1280 by 800 and 640 by 360 px with the text-spacing stylesheet: the frame of `xy-grid--frame` has `scrollHeight` at most `clientHeight` plus 1 |
| 2.4.11 Focus Not Obscured (Minimum) | Nothing in the XY Grid covers content: it positions nothing. A focused control inside a cell block is scrolled into view within the block by the browser | Passes | Covered by the frame e2e cases |
| 1.3.1 Info and Relationships | The grid adds no meaning; the consumer's elements carry it (headings, lists, landmarks). A list grid stays a list | Passes | axe in every story |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018); `scrollable-region-focusable` checks a cell block only while it actually scrolls, which is why `xy-grid--cell-blocks` scrolls at the story viewport.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: every value comes from inputs, static attributes, and `nfsBreakpointsToken`, the same on both platforms, and no directive declares a listener. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfsgridx=""`, `size="6"`), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Basics: full-width cells, halves, and 12/6/4 cells -->
<div nfsGridX>
  <div nfsCell size="6">6 cells</div>
  <div nfsCell size="6">6 cells</div>
</div>
<div nfsGridX gridMarginX>
  <div nfsCell [size]="{medium: 6, large: 4}">12/6/4 cells</div>
  <div nfsCell [size]="{medium: 6, large: 8}">12/6/8 cells</div>
</div>

<div class="grid-x">
  <div class="cell small-6">6 cells</div>
  <div class="cell small-6">6 cells</div>
</div>
<div class="grid-x grid-margin-x">
  <div class="cell medium-6 large-4">12/6/4 cells</div>
  <div class="cell medium-6 large-8">12/6/8 cells</div>
</div>

<!-- Auto and shrink, with the Zero-breakpoint gap filled -->
<div nfsGridX gridMarginX>
  <div nfsCell size="shrink">Shrink!</div>
  <div nfsCell size="auto">Expand!</div>
  <div nfsCell [size]="{small: 12, large: 'auto'}">Stacks, then shares</div>
</div>

<div class="grid-x grid-margin-x">
  <div class="cell shrink">Shrink!</div>
  <div class="cell auto">Expand!</div>
  <div class="cell small-12 large-auto">Stacks, then shares</div>
</div>

<!-- Container, collapse, offset, and a block grid with row gutters -->
<div nfsGridContainer fluid>
  <div nfsGridX gridMarginX marginCollapse="medium">
    <div nfsCell size="4" [offset]="{large: 2}">Offset 2 on large</div>
    <div nfsCell size="4">4 cells</div>
  </div>
  <ul nfsGridX gridMarginX gridMarginY [up]="{small: 1, medium: 3}">
    <li nfsCell>One</li>
    <li nfsCell>Two</li>
    <li nfsCell>Three</li>
  </ul>
</div>

<div class="grid-container fluid">
  <div class="grid-x grid-margin-x medium-margin-collapse">
    <div class="cell small-4 large-offset-2">Offset 2 on large</div>
    <div class="cell small-4">4 cells</div>
  </div>
  <ul class="grid-x grid-margin-x grid-margin-y small-up-1 medium-up-3">
    <li class="cell">One</li>
    <li class="cell">Two</li>
    <li class="cell">Three</li>
  </ul>
</div>

<!-- A frame from medium up, with two named scrolling cells -->
<div nfsGridY gridFrame="medium">
  <header nfsCell size="shrink"><h1>Mail</h1></header>
  <div nfsCell [size]="{medium: 'auto'}" cellBlockContainer="medium">
    <div nfsGridX gridPaddingX>
      <div nfsCell [size]="{medium: 4}" cellBlockY="medium" aria-labelledby="folders-title">
        <h2 id="folders-title">Folders</h2>
        ...
      </div>
      <main nfsCell [size]="{medium: 8}" cellBlockY="medium" aria-labelledby="message-title">
        <h2 id="message-title">Quarterly report</h2>
        ...
      </main>
    </div>
  </div>
  <footer nfsCell size="shrink">...</footer>
</div>

<div class="grid-y medium-grid-frame">
  <header class="cell shrink"><h1>Mail</h1></header>
  <div class="cell medium-auto medium-cell-block-container">
    <div class="grid-x grid-padding-x">
      <div class="cell medium-4 medium-cell-block-y" tabindex="0" role="region" aria-labelledby="folders-title">
        <h2 id="folders-title">Folders</h2>
        ...
      </div>
      <main class="cell medium-8 medium-cell-block-y" tabindex="0" aria-labelledby="message-title">
        <h2 id="message-title">Quarterly report</h2>
        ...
      </main>
    </div>
  </div>
  <footer class="cell shrink">...</footer>
</div>
```

The list grid's `ul` keeps Foundation's list margin (20 px) and markers (measured in three engines), because `.grid-x` resets neither; a list grid without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`, whose margin reset that spec's `nfs-typography-helpers` keeps off a margin grid's own gutters (measured in three engines), and `role="list"` where its item count matters, because WebKit exposes a list without markers outside a `nav` as a group; the example shows the list grid with its markers. The frame's `body { overflow: hidden; }` needs are in the usage examples.

### Animation

None. The XY Grid's CSS declares no transition, and the directives add none. A cell inserted or removed with `@if` or `@for` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every grid class, and a cell block's `tabindex` and `role`, exactly as the hydrated DOM does, so the first paint is the final layout and a keyboard user can scroll a cell block before any script runs. The responsive classes are chosen from the input values, not from the viewport, so the Server breakpoint never matters here.
- Before hydration: the directives touch no DOM outside host bindings, read no `window`, measure nothing, and start no observer.
- Full and incremental hydration: host binding values equal the server's, so hydration changes no attribute and no class, and there is no structure to mismatch. Grids and cells register with nothing, so a cell may sit in a different Hydration boundary from its grid, as Magellan's sections may (building-blocks 1.11 decision 6); a Trigger or widget inside a cell keeps its own boundary rules.
- Event replay: no directive declares a listener, so none adds `jsaction`; replay of the consumer's own listeners inside cells is unaffected.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a grid is its server HTML and lays out fully. Inside `@defer (hydrate never)` it keeps its layout and its keyboard-scrollable cell blocks for good.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, computed widths and heights at real viewports, roles, names, where Tab lands, scroll positions after real key presses, clipping, and the server HTML. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Button](../issues/37-spec-button.md)'s and [Spec: Label](../issues/94-spec-label.md)'s tests, the nearest precedents; the scroll region cases follow the triage's contract for the Table's `.table-scroll`.

Story ids follow `xy-grid--<story>`: `xy-grid--basics`, `xy-grid--gutters`, `xy-grid--container`, `xy-grid--auto-sizing`, `xy-grid--collapse`, `xy-grid--offsets`, `xy-grid--block-grid`, `xy-grid--vertical`, `xy-grid--frame`, `xy-grid--cell-blocks`. `meta.component` is `NfsCell`; `size` and `offset` are args where a story shows one cell's input. Stories use Foundation's default counts and Class breakpoints only, so the library's Storybook program needs no Variant declaration file (ADR 0040). The preview includes `nfs-xy-grid` after Foundation's export mixin. No story element carries a Foundation class written in the story; cell text says what the cell's size is, as Foundation's examples do.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags. At the story viewport only the Zero breakpoint's classes apply, so play functions assert classes for every breakpoint and computed geometry for the Zero breakpoint; wider viewports are e2e cases.

- `xy-grid--basics`: Foundation's Basics. The grids carry `.grid-x`, the cells `.cell` and exactly their size classes (`small-6`; `medium-6 large-4`); the `size="6"` cells are each half the grid's width, and the cells with only medium and large sizes are full width.
- `xy-grid--gutters`: a margin grid, a padding grid, and a `gridMarginX gridMarginY` grid of four `size="6"` cells: the classes are set; the margin grid's cells have computed left and right margins and the padding grid's cells padding; the second row of the two-axis grid starts one vertical gutter below the first.
- `xy-grid--container`: a default, a `fluid`, and a `full` container holding a margin grid, the last inside a wrapper with `overflow-x: hidden` inline (the story's stand-in for the recipe's `body` rule): the classes are set; the default container's computed `max-width` is Foundation's 75rem, `fluid`'s 100% with padding, `full`'s 100% without.
- `xy-grid--auto-sizing`: Foundation's auto, two-auto, and shrink examples, and `[size]="{large: 'auto'}"` cells: `size="auto"` sets `.auto` and the cell fills the remaining width; two auto cells share it equally; `size="shrink"` sets `.shrink` (never `.small-shrink`) and the cell is as wide as its text.
- `xy-grid--collapse`: `gridMarginX marginCollapse="medium"`: the grid carries `.medium-margin-collapse`; at the story viewport the cells keep their margins.
- `xy-grid--offsets`: in a `gridMarginX` grid, `size="4" [offset]="{large: 2}"` and `size="4" offset="2"`: the classes are set; the second cell's left edge is two columns plus half a gutter from the grid's; the text read in DOM order is the visual order.
- `xy-grid--block-grid`: `gridPaddingX [up]="{small: 2, medium: 4, large: 6}"` with six cells: the grid carries the three `up` classes; at the story viewport each cell is half the grid's width; the reading order matches the visual order.
- `xy-grid--vertical`: `nfsGridY` with an inline `height: 500px` and cells `[size]="{small: 6, medium: 8, large: 2}"`: each cell is 250 px tall at the story viewport.
- `xy-grid--frame`: Foundation's Grid Frame example ported (D17): `gridFrame="medium"`, a header and footer, and two cell blocks from medium named by their headings. The cell blocks carry `tabindex="0"`, the `div` one `role="region"` and the `main` one no role; `getByRole('region', {name: 'Folders'})` and `getByRole('main', {name: 'Quarterly report'})` find them; at the story viewport the frame is not a frame (computed `overflow` is `visible`).
- `xy-grid--cell-blocks`: a padding grid with a `cellBlockY` cell of inline `height: 200px` holding long text, and a `cellBlock` cell holding a wide data `<table>` (tag-styled, two-dimensional content), each named by a heading: both scroll at the story viewport; `userEvent.tab()` reaches the first region and then the second; axe passes `scrollable-region-focusable`.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here. A style block standing in for Foundation's frame rules is added where a case needs computed styles.

- Class mapping, driven by data: every value of every input sets exactly the classes of the mapping table, including the Zero-breakpoint gaps (`size="shrink"`, `{small: 'auto'}`, `gridFrame` `true` and `'small'`, the cell blocks at the Zero breakpoint) and the static-attribute strings (`size="6"`, `offset="0"`, `up="3"`), with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose Zero breakpoint is `xs` and whose map adds `xlarge` (values the library's closed types reject are bound through a typed cast, since the library's test program declares no Class breakpoints); no value and `false` set none; a cast value that is not one class token, and a query that cannot be parsed, set none; changing a value swaps its classes and leaves the static class and the consumer's own classes alone.
- Cell block attributes: `cellBlock` or `cellBlockY` on a `div` adds `tabindex="0"` and `role="region"` and removes both when unset; `cellBlockContainer` adds neither; a `main`, `aside`, or `section` host gets `tabindex` and no role; a static `role="note"` and a static `tabindex="-1"` are echoed with and without a cell block; `cellBlockY="medium"` binds both at the story width, where the class does not apply.
- Copied classes: `class="cell medium-6"` on `nfsCell size="4"` keeps `medium-6` beside `small-4`, and a redundant `cell` merges with the static host class.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with a container, a margin grid with responsive sizes and offsets, a block grid on a `ul`, a vertical grid, and the frame of the Rendered HTML section. `whenStable()` resolves; the server HTML carries every class of the Rendered HTML section and the cell blocks' `tabindex="0"` and `role="region"`; no element carries `jsaction` from the directives.
- Sass compile, over Foundation 6.9.0's settings file with `@import 'ngx-foundation-sites';` after Foundation: `@include foundation-xy-grid-classes; @include nfs-xy-grid;` emits exactly `:root { --nfs-grid-columns: 12; --nfs-xy-block-grid-max: 8; }` and no other rule; `$grid-columns: 16; $xy-block-grid-max: 4;` writes 16 and 4.
- Pure logic: the value-to-class mapping is covered through the DOM in layer 2; nothing else to isolate.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Breakpoints: at 640 and 1024 px wide, the `xy-grid--basics` cells' widths are Foundation's (`medium-6` half the grid at 640, `large-4` a third at 1024); the `xy-grid--block-grid` cells are a quarter at 640 and a sixth at 1024; `xy-grid--auto-sizing`'s `{large: 'auto'}` cells share the row at 1024; `xy-grid--collapse`'s cells have no side margins at 640; `xy-grid--offsets`' first cell is offset only at 1024.
- Keyboard scrolling (2.1.1) in `xy-grid--frame` at 1280 by 800 px and in `xy-grid--cell-blocks`: real Tab presses reach each cell block in DOM order; ArrowDown, Page Down, End, and Home change a vertical block's `scrollTop` and ArrowRight a horizontal block's `scrollLeft`.
- Focus visible (2.4.7) in `xy-grid--frame` at 1280 by 800 px: screenshots before and after Tab to each cell block differ in the band around at least three of its four edges.
- Reflow (1.4.10): `xy-grid--frame` at 320 by 256 px has `documentElement.scrollWidth` at most 320 and its frame's computed `overflow` is `visible`; `xy-grid--container` at 320 px does not move sideways on a horizontal wheel or ArrowRight.
- Text spacing (1.4.12): `xy-grid--frame` at 1280 by 800 and 640 by 360 px with the text-spacing stylesheet: the frame's `scrollHeight` is at most its `clientHeight` plus 1.

Against the prerendered fixture app, on the XY Grid route (the frame of the Rendered HTML section and a block grid):

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML at 1280 by 800 px; real Tab presses reach both cell blocks in WebKit before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

Manual release test (ADR 0022): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, Tab into `xy-grid--frame` at 1280 by 800 px announces "Folders, region" and the main landmark "Quarterly report", and the screen reader's reading keys read each cell block's content.

## Out of Scope

- Source ordering (`.<bp>-order-<n>`), flex alignment (`.align-*`, `.align-self-*`, `.align-center-middle`), and the flex container helpers on grids and cells: the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), whose `nfsFlexAlign` and `nfsFlexChild` are written beside `nfsGridX`, `nfsGridY`, and `nfsCell`, and whose spec owns the 1.3.2 and 2.4.3 hazard of reordering, cells included. Category: `scope-boundary`.
- Showing and hiding cells by breakpoint (`.hide-for-*`, `.show-for-*`): the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). Category: `scope-boundary`.
- Removing a list grid's markers and margin (`.no-bullet`): the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`. Category: `scope-boundary`.
- Foundation's semantic grid mixins (`xy-grid`, `xy-cell`, `xy-gutters`, `xy-grid-layout`, and the rest) in the consumer's own Sass for the consumer's own classes: the class rule governs Foundation's and the library's classes, and the directives set only the classes Foundation generates. Category: `scope-boundary`.
- `.<bp>-full`: Foundation gives it no width, only a `flex-basis` reset, so it would not do what its name says; a cell with no `size`, or `size` at the column count, is full width. Category: `other`.
- Push and pull classes: not part of the XY Grid, whose docs replace them with source ordering. Category: `superseded`.
- The legacy Float Grid and Flex Grid (`.row`, `.column`, `$grid-column-count`, `$block-grid-max`): the [Spec: Float Grid](../issues/100-spec-float-grid.md) and the [Spec: Flex Grid](../issues/101-spec-flex-grid.md). Category: `scope-boundary`.
- An ARIA `grid`, `row`, or `gridcell` role on grids and cells, or `@angular/aria`'s Grid (D13): a CSS layout grid is not the APG Grid composite, whose two-dimensional arrow keys a layout does not have. Category: `platform-or-a11y`.
- A library `body` rule for full containers and margin-gutter frames (D11): it would change every page that includes the mixin, and the frame's `body { overflow: hidden; }` must apply only from the frame's breakpoint, which only the consumer knows. Category: `other`.
- Following which parts the consumer switched off in `foundation-xy-grid-classes(...)` (D12): the library's mixin cannot read another mixin's arguments. Category: `other`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); `nfs-breakpoint-properties`: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Four attribute directives, one per class that names an element of the layout (`[nfsGridContainer]`, `[nfsGridX]`, `[nfsGridY]`, `[nfsCell]`), each a static host class on any element; entry point `ngx-foundation-sites/xy-grid` | ADR 0001 and ADR 0039: the XY Grid is classes on consumer-written elements, and Foundation generates nothing; the names follow the classes (building-blocks 1.3) and are the ones every earlier spec wrote | A `nfs-grid` and `nfs-cell` component pair, Material's grid list shape (Foundation's markup carries the elements; ADR 0001) (`scope-boundary`); one `nfsGrid` with a `direction` input choosing `.grid-x` or `.grid-y` (one directive per class, and the X-only inputs would type on a vertical grid) (`other`) |
| D2 | Input names by building-blocks 1.4: `size`, `offset`, and `up` for the counted families; booleans `gridMarginX`, `gridPaddingX`, `gridMarginY`, `gridPaddingY`; responsive on-or-off `marginCollapse`, `paddingCollapse`, `gridFrame`, `cellBlock`, `cellBlockY`, `cellBlockContainer`, named from the class template once the breakpoint is removed | The decided naming rule, applied mechanically: rule 3 for families from one loop (1.4 names `size`, `offset`, `up` for the grids), rule 4 for single classes, the responsive rule for `.<bp>-` templates | A `gutters` enum per axis (Foundation allows margin and padding gutters on one grid and on the cross axis, and the name is not Foundation's) (`other`); one input per responsive class (`mediumAuto`, building-blocks 1.4) (`other`); a class-name string such as `size="medium-6"` (ADR 0039) (`variant-as-class`) |
| D3 | `NfsGridContainer` has two booleans, `fluid` and `full`; the documented usage sets one, and with both set `.full` wins | Rule 4: each is a single on-or-off class with Foundation's own name, so `<div nfsGridContainer fluid>` mirrors Foundation's markup; `.full`'s rule follows `.fluid`'s media rule in the compiled CSS, so the pair renders as `full` | A `width` enum (`'fluid' \| 'full'`) (an invented name for two classes that come from no setting or loop) (`other`) |
| D4 | The Zero-breakpoint gaps are filled from `nfsBreakpointsToken`: `auto` and `shrink` there set `.auto` and `.shrink`; `true` and the Zero breakpoint set the unprefixed `.grid-frame` and cell block classes; sizes, offsets, `up`, and collapse keep the prefixed Zero-breakpoint class Foundation generates | Foundation generates no `.small-auto`, `.small-grid-frame`, or `.small-cell-block`, and its `.small-shrink` only resets `flex-basis` (checked in the compiled CSS), so a literal mapping would bind classes that do nothing; the token is the same on server and client (the Button's D20) | Hard-coding `small` (a consumer may rename the Zero breakpoint) (`other`); binding the literal `.small-auto` and `.small-shrink` (they size nothing) (`other`) |
| D5 | `.<bp>-full` is not offered | Foundation lists it only in a `flex-basis` reset | A `'full'` keyword in `size` (a class that does not make the cell full width) (`other`) |
| D6 | Counts are closed ranges over `NfsGridColumnsOverrides` and `NfsXyBlockGridMaxOverrides`, responsive values Breakpoint rules over Class breakpoints, with a bare value meaning the Zero breakpoint; the aliases are exported and named in every input's type arguments | ADR 0040 and building-blocks 1.4; the registries are the Variant declaration tooling spec's; the probe of [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md) measured `size="16"` compiling and `size="17"` failing against a declared 16 across a real package | `numberAttribute` (accepts any value) (`superseded`); Foundation's defaults plus `(string & {})` (a typo compiles; ADR 0040) (`superseded`) |
| D7 | One `computed` class list per directive through `[class]`; copied Foundation classes are not stripped, and the documented usage sets every class through the inputs | The Button's and Callout's rule for open families: the full class set depends on the consumer's counts and Class breakpoints, which the running directive does not know | A record of every owned class set `false`, the Menu's form (about 90 keys per cell, and still blind to the consumer's own counts) (`other`) |
| D8 | A cell block (`cellBlock` or `cellBlockY` set, at any breakpoint) gets `tabindex="0"` and, on a `div` without a static `role`, `role="region"`, as host bindings in the server HTML; the consumer names it with `aria-labelledby` or `aria-label`; static values are echoed | Measured: without a tab stop the docs' cell blocks fail axe `scrollable-region-focusable` in three engines and WebKit's Tab never reaches them; with it, axe passes and every engine scrolls them with the keyboard. A focusable element needs a role and a name, and a name is allowed on a `div` only with a role; [Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md) gave the Table's `.table-scroll` the same contract. Binding at every width keeps the server HTML final and the grid usable before hydration and in `hydrate never`; below the breakpoint the region costs one extra tab stop and scrolls nothing | `tabindex` only while the block overflows, measured by an observer (absent from server HTML, so WebKit users could not scroll before hydration or in `hydrate never`) (`platform-or-a11y`); only while the breakpoint applies, through the Breakpoint service (the Server breakpoint leaves a wide first paint without a tab stop until hydration) (`platform-or-a11y`); `role="region"` on every host (it would replace a `main`, `aside`, or `nav` landmark) (`platform-or-a11y`); a `label` input (the native attributes already do it) (`other`) |
| D9 | Documented usage for copied classes, a cell's place in a grid, an offset in a vertical grid, a cell block's name, `fluid` with `full`, and frames that could clip | Each is a silent failure in Foundation's markup that neither the types nor axe report, so the JSDoc and the usage section state the rule | A grid token through DI that cells require (a cell projected into a grid through a layout component would fail, and nothing else needs the link) (`other`) |
| D10 | Frames: the documented usage starts a frame at a Class breakpoint above the Zero breakpoint, or makes every cell that can outgrow its share a cell block where the frame applies at every width | Measured: a frame at every width clips Foundation's own example from 3229 to 256 px at 320 by 256 CSS px, which axe does not report; a frame whose cells all scroll is valid at every width | Ruling out a frame at the Zero breakpoint (a frame whose cells all scroll is valid) (`other`); a library rule giving frames `overflow: auto` (it changes Foundation's frame, whose cells scroll by design) (`other`) |
| D11 | No library CSS: `nfs-xy-grid` writes only `--nfs-grid-columns` and `--nfs-xy-block-grid-max`; Foundation's `body` overflow rules stay consumer CSS in every recipe, scoped to the frame's breakpoint | Measured: the focus ring stays visible on three sides of a cell block inside a frame (2.4.7 holds), the full container's sideways scroll is into empty gutter space and the documented `body` rule removes it, and the XY Grid draws no colour; ADR 0012 gives an entry point with an Open Variant family a properties-only mixin | A focus-ring offset rule for cell blocks (nothing fails) (`platform-or-a11y`); a library `body` rule (it would apply to pages without a frame, and at every width) (`other`) |
| D12 | The library cannot see which parts `foundation-xy-grid-classes(...)` switched off; the docs say that a consumer who turns a part off binds none of its inputs | The library's mixin cannot read another mixin's arguments; the parts are all on by default and in `foundation-everything` | `nfs-xy-grid` mirroring Foundation's eight arguments with one gated Variant property per part (a second list the consumer keeps in step, for a rare configuration; add it if consumers report the gap) (`other`) |
| D13 | No ARIA role on grids and cells; `@angular/aria`'s Grid is not used | A layout grid is not the APG Grid composite, and a role is a promise (building-blocks 1.10) | `role="grid"`, `row`, and `gridcell` (they promise arrow-key navigation between cells) (`platform-or-a11y`) |
| D14 | No tokens, providers, or host directives; grids and cells work across Hydration boundaries and projection | Foundation's child selectors carry the grid's settings to its cells, so nothing needs a link in production | A parent token that cells register with (it would tie a cell to its grid's Hydration boundary for nothing) (`other`) |
| D15 | Other families' directives are written beside the grid directives on one element: `nfsFlexAlign` beside a grid, `nfsFlexChild` beside a cell, and no grid input for an alignment or order class; same-named inputs on one element are avoided by nesting | The Flexbox Utilities spec's one owner for its classes (its D8), which leaves beside or hosted to each grid spec; beside, because alignment and ordering are optional on a grid while a host directive is static, so hosting would create an `NfsFlexChild` on every cell of every grid, and would make the XY Grid entry point import the Flexbox Utilities at runtime; building-blocks 1.9 places a behaviour that may sit on any Flex parent beside. Angular sets a template binding on every directive that declares the input, so `size` on a cell and on a callout would collide | Hosting `NfsFlexAlign` on the grids and `NfsFlexChild` on the cells under their own input names, which the Flexbox Utilities spec allows (a directive instance and a runtime import on every grid and cell for classes most never use; additive later, since Angular de-duplicates a directive written and hosted on one element) (`other`); alignment and order inputs of the grid's own (two owners of one family, against the Flexbox Utilities' D8) (`other`) |
| D16 | `up`, `marginCollapse`, and `paddingCollapse` exist only on `NfsGridX`; `offset` stays on every cell, documented as working only in a horizontal grid | Foundation's "X Grid only" features; the grid directive is known where the input is declared, while a cell learns its grid only from the DOM | Typing offsets off by grid through DI (a required production link to the grid for one input) (`other`) |
| D17 | Examples and stories write no class; Foundation's frame example is ported with `header`, `main`, and `footer` elements in place of its demo classes `.header` and `.footer`, and names its cell blocks from their headings | ADR 0039 and the Storybook conventions; the demo classes are the docs site's own styling | Keeping the docs' demo classes (they are no library's and style nothing without the docs site) (`other`) |

### Usage examples

```ts
@Component({
  selector: 'app-mail',
  imports: [NfsGridX, NfsGridY, NfsCell],
  template: `
    <div nfsGridY gridFrame="medium">
      <header nfsCell size="shrink"><h1>Mail</h1></header>
      <div nfsCell [size]="{medium: 'auto'}" cellBlockContainer="medium">
        <div nfsGridX gridPaddingX>
          <nav nfsCell [size]="{medium: 4}" cellBlockY="medium" aria-labelledby="folders-title">
            <h2 id="folders-title">Folders</h2>
            <!-- folder links -->
          </nav>
          <main nfsCell [size]="{medium: 8}" cellBlockY="medium" aria-labelledby="message-title">
            <h2 id="message-title">{{ subject() }}</h2>
            <!-- message -->
          </main>
        </div>
      </div>
      <footer nfsCell size="shrink"><p>{{ status() }}</p></footer>
    </div>
  `,
})
export class Mail {
  protected readonly subject = signal('Quarterly report');
  protected readonly status = signal('Synced');
}
```

```scss
// The consumer's global stylesheet, for an application whose page is this frame. Foundation asks for it when a
// frame has margin gutters; it stops the page scrolling only from medium up, where the frame applies, and below
// medium the frame is an ordinary column and the page scrolls.
@include breakpoint(medium) {
  body { overflow: hidden; }
}
```

The recipe selects `body` and names no Foundation or library class.

```html
<!-- Card grid: one card per row on small screens, three from medium, with gutters both ways -->
<div nfsGridX gridMarginX gridMarginY [up]="{small: 1, medium: 3}">
  @for (product of products(); track product.id) {
    <div nfsCell nfsFlexContainer><article nfsCard>...</article></div>
  }
</div>

<!-- Centred cells: alignment is the Flexbox Utilities' directive, written beside the grid's -->
<div nfsGridX nfsFlexAlign alignX="center">
  <div nfsCell size="4">Centred</div>
</div>

<!-- A full-bleed band: the page must not scroll sideways by half a gutter -->
<div nfsGridContainer full>
  <div nfsGridX gridMarginX>
    <div nfsCell [size]="{medium: 4}">...</div>
    <div nfsCell [size]="{medium: 4}">...</div>
    <div nfsCell [size]="{medium: 4}">...</div>
  </div>
</div>
```

```scss
body { overflow-x: hidden; } // Foundation's documented rule for a margin grid in a full container
```

`nfsFlexContainer` and `nfsFlexAlign` are the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s directives and `nfsCard` the [Spec: Card](../issues/90-spec-card.md)'s, written beside the grid directives or inside a cell.

A 16-column grid, as the library's tooling generates the Variant declaration file from `$grid-columns: 16;`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsGridColumnsOverrides {
    count: 16;
  }
}
```

With it, `size="16"` and `[offset]="{large: 15}"` compile and `size="17"` fails; in a program that leaves the file out, `size="16"` fails (ADR 0040).

### Platform features to adopt when the browser target moves

- Keyboard-focusable scroll containers: Chromium since Chrome 132 and Firefox make a scroll container without focusable content a tab stop; Safari does not. Once every engine of the Browser target does, the explicit `tabindex` could go for such blocks, but the role and name stay, and a block with focusable content still needs its own tab stop for the text between controls.
- CSS subgrid and container queries do not change the XY Grid: Foundation's classes are the contract, and breakpoint-named inputs keep viewport semantics (building-blocks 1.7).

### Foundation behaviour changed or dropped

- Cell blocks gain a tab stop, a `region` role on `div` hosts, and a required name (D8); Foundation's docs markup has none.
- Zero-breakpoint gaps: `auto` and `shrink` at the Zero breakpoint map to `.auto` and `.shrink`, the frame and cell blocks to their unprefixed classes (D4); Foundation's `.small-shrink` and `.<bp>-full`, which size nothing, are never bound (D5).
- The docs' `.header` and `.footer` demo classes are the consumer's elements (D17).
- Foundation's `body` overflow callouts stay consumer CSS, scoped to the frame's breakpoint (D11).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The directives rely on Foundation's export mixin `foundation-xy-grid-classes` (included by `foundation-everything` while `$xy-grid` is true), configured through `$grid-container`, `$grid-columns`, `$grid-margin-gutters`, `$grid-padding-gutters`, `$grid-container-padding`, and `$xy-block-grid-max`; every class the directives bind is already styled by it. The entry point's Library mixin is `nfs-xy-grid` (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-xy-grid-classes`. (1) Rules: none. The XY Grid meets every criterion this spec names with Foundation's CSS and the directives' attributes (measured, D11). (2) Reused settings: `$grid-columns` and `$xy-block-grid-max`, read from the consumer's compile. (3) Custom properties the directives write: none. (4) Motion classes: none, and no `prefers-reduced-motion` override. (5) What breaks when the include is missing: no layout (Foundation's CSS does it all); the Variant properties are absent, so the declaration-file generator finds no column or block-grid count, and a count the consumer's Sass changed fails to compile against the defaults. (6) Variant properties, on `:root`: `--nfs-grid-columns` from `$grid-columns` (12 by default) and `--nfs-xy-block-grid-max` from `$xy-block-grid-max` (8 by default), both counts; the Class breakpoints the responsive inputs read are `nfs-breakpoint-properties`' `--nfs-breakpoint-classes`. The consumer who calls `foundation-xy-grid-classes` with a part switched off binds none of that part's inputs, because the mixin cannot see Foundation's arguments (D12).

### Notes

- RTL: Foundation compiles direction into the CSS (offsets use `$global-left`); the directives are direction-agnostic, and a cell's visual order follows the reading direction.
- Static input attributes stay in the DOM, as Angular leaves every static attribute (`<div nfsCell size="6">` keeps `size="6"`). They mean nothing on the hosts the XY Grid uses; a consumer who wants none binds the input instead (`[size]="6"`).
- Same-named inputs (D15): `size` is the cell's column count and also the Callout's, Button's, Close Button's, and Dropdown pane's size name, so none of those directives shares an element with `nfsCell`; Foundation's own markup nests them.
- Nested grids: a cell may hold a grid, or be one (`<div nfsCell nfsGridX>`); a nested padding grid gets Foundation's negative margins from its parent's `.grid-padding-x` by itself.
- A vertical grid needs a height from the consumer (an inline style, a frame, or the consumer's own CSS), as Foundation's docs say.
- Alignment on a vertical grid follows the flex axes: `nfsFlexAlign`'s `alignX` sets `justify-content`, which runs along the column, so on `nfsGridY` it moves cells vertically, and `alignY` moves them across (the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)).
- The `hidden` attribute alone does not hide a grid or a cell block container: Foundation's `.grid-x`, `.grid-y`, and `.cell-block-container` set `display` after normalize's `[hidden] { display: none }` at equal specificity (measured in Chromium, Firefox, and WebKit), as building-blocks 1.10 records. Remove it with `@if`, or hide it with a Toggler in Visibility mode, which binds Foundation's `.is-hidden` ([Spec: Toggler](../issues/17-spec-toggler.md), D3), or with `nfsVisibility` and a bare `hideFor` ([Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)); the Thumbnail, Float Classes, Flexbox Utilities, and Flex Grid specs state the same rule for their classes. A plain `.cell` and `.grid-container` set no `display`, so `hidden` hides them (measured in the same engines).
- Beside the Float Grid ([Spec: Float Grid](../issues/100-spec-float-grid.md)): a page that also compiles `foundation-grid` includes it before `foundation-xy-grid-classes` and keeps `$grid-column-count` equal to `$grid-columns`. Measured in three engines: in the other order the Float Grid's unscoped `.small-6 { width: 50% }` makes a vertical grid's `size="6"` cell half as wide as its grid, and with unequal counts the grid compiled last sets both grids' offsets.
