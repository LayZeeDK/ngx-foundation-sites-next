# 99. Spec: XY Grid

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's XY Grid to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/xy-grid.md` and its Sass is `scss/xy-grid/` in the 6.9.0 clone. Publish `specs/xy-grid.md`.

Known from the triage: Grid containers, grids, cells, frames, and cell blocks; responsive sizes, offsets, gutters, and collapse as typed inputs; `.cell-block` scrolling cells need keyboard access (the Table spec's scroll region is a precedent); ordering must not break reading and focus order (1.3.2, 2.4.3).

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Worked AFK on Opus 5.5 (the map's AFK override: self-grilling, both sides, against Foundation 6.9.0's Sass and docs in the local clone, the bundle's ADRs and building-blocks rules, Angular Material 22.2's grid list, and measurements). Spec: [specs/xy-grid.md](../specs/xy-grid.md).

### Measurements

Throwaway scripts under `D:/tmp/nfs-wave-99/` (Playwright 1.63 and axe-core 4.13.0 read from the `nfs-ct-prototype` experiment, Dart Sass compiling Foundation 6.9.0 from the local clone on its default settings; nothing started stays running, no junction was made):

- Compiled class families: sizes and offsets and `up` exist for every Class breakpoint and the Zero breakpoint (offsets 0 to 11, `up` 1 to 8); `.auto` and `.shrink` exist unprefixed, `.<bp>-auto` and `.<bp>-shrink` only above the Zero breakpoint; `.small-auto` does not exist, and `.small-shrink` and every `.<bp>-full` appear only in a `flex-basis: auto` reset; `.grid-frame` and the cell block classes exist unprefixed and above the Zero breakpoint only; collapse classes exist for each name in `$breakpoint-classes`. With `$grid-columns: 16; $xy-block-grid-max: 4; $breakpoint-classes: (small medium large xlarge)` the ranges follow. The compiled CSS sets no `order`, no reversed direction, and no positioning. `.grid-container.full` follows `.fluid`'s media rule, so `full` wins when both are set.
- Foundation's Grid Frame example at 1280 by 800 px, three engines: axe `scrollable-region-focusable` fails on all three cell blocks; WebKit's Tab reaches none; with `tabindex="0"` (with or without `role="region"` and a name) axe passes and Tab reaches each in all three engines. ArrowDown, Page Down, End, Home, and ArrowRight scroll a focused cell block in all three engines.
- Focus ring inside the frame: Firefox and WebKit clip the ring on the one edge a cell block shares with the frame's `overflow: hidden`; the other three edges show it; Chromium also draws inside the edge.
- Reflow at 320 by 256 px: the example as `.grid-frame` clips 3229 px of content to 256 px in three engines; as `.medium-grid-frame` it is no frame there and nothing scrolls sideways.
- Text spacing: the example (medium-up frame, cell blocks) clips nothing at 1280 by 800, 1024 by 600, and 640 by 360 px, with or without the 1.4.12 overrides, in three engines.
- Full container: a margin grid in `.grid-container.full` scrolls the page 10 px sideways at 320 px (15 px at 1280) by wheel and ArrowRight in three engines; `body { overflow-x: hidden; }` makes that 0.
- Row gutters: `grid-x grid-margin-x grid-margin-y` puts a 30 px gap between wrapped rows at 800 px in three engines.
- A `ul.grid-x` keeps Foundation's 20 px list margin and its markers in three engines.
- `hidden` on `.grid-x`, `.grid-y`, and `.cell-block-container` leaves them `display: flex` in three engines; `.cell` and `.grid-container` are hidden.
- Chromium made scroll containers without focusable content keyboard-focusable only in Chrome 132 ([Keyboard focusable scrollers](https://developer.chrome.com/blog/keyboard-focusable-scrollers)); Safari does not.

### Grilling record

Round 1 (the frontier with no prerequisites):

- Q1. Which directives? One per class that names an element of the layout: `.grid-container`, `.grid-x`, `.grid-y`, `.cell` (ADR 0039's one directive per class, applied to the layout system's Utility classes). Against: one `nfsGrid` with a direction input. Rejected: the class rule wants one directive per class, and the X-only inputs would then type on a vertical grid.
- Q2. Component or directive? Directives: Foundation generates nothing (ADR 0001). Material's grid list is a component with JavaScript layout; not borrowed.
- Q3. Names? The placeholders every earlier spec wrote (`nfsGridX`, `nfsCell`, `size`, `up`) are building-blocks 1.3 and 1.4 applied mechanically; kept, plus `NfsGridContainer` and `NfsGridY` by the same rule.
- Q4. Do grids and cells need DI? No: Foundation's child selectors carry the grid to its cells, and every placement concern is a development report, which may read the DOM (building-blocks 1.9). So no Hydration boundary rule either.
- Q5. Any ARIA role? No: a layout grid is not the APG Grid composite; Aria's `ngGrid` is not used.

Round 2 (inputs, given Q1 to Q4):

- Q6. How is each family typed and named? By building-blocks 1.4: `size`, `offset`, `up` are counted families (rule 3), bare for the Zero breakpoint or in Breakpoint rules, over `NfsGridColumnsOverrides` and `NfsXyBlockGridMaxOverrides`; the gutters are booleans named after their classes (rule 4); collapse, frame, and the cell blocks are responsive on-or-off families named from the template with the breakpoint removed, over `NfsClassBreakpointQuery<'up'>`, because each applies from a breakpoint up. Against: a `gutters` enum per axis. Rejected: margin and padding gutters combine, the cross axis is real (measured row gutters), and the name is not Foundation's.
- Q7. The container's `.fluid` and `.full`: enum or booleans? Booleans (rule 4, Foundation's names), with a development warning when both are set. Against: a `width` enum, as Reveal's and Menu's mutually exclusive classes became enums. Rejected: those come from a sizing concept Foundation names; `width` would be invented, and the Prototyping Utilities' sizing family (`.width-*`) is likely to take `width`, which would collide on one element.
- Q8. Zero-breakpoint gaps? Filled from `nfsBreakpointsToken`, as the Button's `expanded` does: `auto` and `shrink` there bind the unprefixed classes, and so do `true` and the Zero breakpoint for the frame and cell blocks; `.<bp>-full` is not offered.
- Q9. Which inputs are X-only? `up`, `marginCollapse`, `paddingCollapse` exist only on `NfsGridX`; `offset` stays on the cell, which cannot know its grid without DI, and warns in a vertical grid in development.
- Q10. Strip copied classes? No, report them: the class set depends on the consumer's counts and Class breakpoints, which the directive does not know at runtime (the Button's and Callout's rule, not the Menu's record).

Round 3 (accessibility, given Q6 to Q10):

- Q11. How does a cell block get keyboard access? `tabindex="0"` bound while `cellBlock` or `cellBlockY` is set, in the server HTML; `role="region"` on a `div` host without a static role; the consumer names it with `aria-labelledby` or `aria-label`; a development check reports a `div` or `section` block without a name. Against: `tabindex` only while the block overflows, or only while its breakpoint applies. Rejected: both need JavaScript, so the server HTML and `hydrate never` would leave WebKit keyboard users unable to scroll, and the cost of the static form is one extra tab stop below the breakpoint. Against: `role="region"` on every host. Rejected: it would replace `main`, `aside`, and `nav` landmarks.
- Q12. Does the frame's `overflow: hidden` break 2.4.7? No: measured, three sides of the ring stay visible; no library rule.
- Q13. Frame clipping (1.4.10, 1.4.12)? A requirement (frames from a Class breakpoint above the Zero breakpoint, or every outgrowing cell a cell block) plus a development `ResizeObserver` check that reports clipping at the current viewport; axe does not see it. Against: a compile-time `@error` on Zero-breakpoint frames. Rejected: a frame whose cells all scroll is valid.
- Q14. Reading and focus order (1.3.2, 2.4.3)? Met by construction: the XY Grid's CSS never reorders, and no directive here offers ordering; the Flexbox Utilities spec owns `order` and its hazard.
- Q15. The full container's sideways scroll and the frame's `body` rules? Consumer CSS in every recipe, scoped to the frame's breakpoint; not a WCAG failure (the scroll reveals empty gutter), and a library `body` rule would reach pages without a frame.

Round 4 (Sass, checks, rendering modes):

- Q16. Library mixin? `nfs-xy-grid`, properties-only: `--nfs-grid-columns` and `--nfs-xy-block-grid-max`, since nothing in the XY Grid needs custom CSS (ADR 0012's properties-only case).
- Q17. Can the checks see parts switched off in `foundation-xy-grid-classes(...)`? No; documented. Against: mirroring the eight arguments with gated properties. Rejected: a second list to keep in step for a rare configuration; add it if consumers report the gap.
- Q18. Runtime check calls? `include()` only while a counted or breakpoint-naming value is bound, because `nfs-xy-grid` carries no rule the grid needs; needs from the class mapping, with the Zero-breakpoint collapse needing `breakpoint-classes` because Foundation loops those classes over `$breakpoint-classes` alone. `NfsGridContainer` makes no call (closed families).
- Q19. Rendering modes? Host bindings only, the same on server and client; no listener, no `jsaction`; grids work across Hydration boundaries and in `hydrate never`, cell blocks keyboard-scrollable there too.

- Q20 (raised when the [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) resolved mid-ticket). Write `nfsFlexAlign` and `nfsFlexChild` beside the grid directives, or host them under their input names? Beside (decision 14). Against: hosting gives `<div nfsGridX alignX="center">`, closest to Foundation's `grid-x align-center`. Rejected for now: a static host directive and a runtime import on every grid and cell for classes most never use; additive later.

Nothing was left unsettled; the frontier is empty.

### Decisions

1. Four attribute directives in `ngx-foundation-sites/xy-grid`, each a static host class on any element: `[nfsGridContainer]` (`.grid-container`), `[nfsGridX]` (`.grid-x`), `[nfsGridY]` (`.grid-y`), `[nfsCell]` (`.cell`); no template, token, provider, host directive, Defaults token, model, output, method, or `exportAs`.
2. `NfsCell`: `size` (`NfsCellSizeInput`: a column count 1 to `$grid-columns`, `'auto'`, or `'shrink'`, bare for the Zero breakpoint or in Breakpoint rules), `offset` (`NfsCellOffsetInput`: 0 to `$grid-columns` minus 1), and `cellBlock`, `cellBlockY`, `cellBlockContainer` (`NfsVariantBoolean | NfsGridQuery`).
3. `NfsGridX`: the four gutter booleans `gridMarginX`, `gridPaddingX`, `gridMarginY`, `gridPaddingY`; `up` (`NfsGridUpInput`, 1 to `$xy-block-grid-max`); `marginCollapse`, `paddingCollapse`, and `gridFrame` (`NfsVariantBoolean | NfsGridQuery`). `NfsGridY`: the four gutters and `gridFrame` only (Foundation's "X Grid only" features stay on `NfsGridX`).
4. `NfsGridContainer`: booleans `fluid` and `full`; both set warns in development, and `.full` wins (measured source order).
5. Zero-breakpoint gaps filled from `nfsBreakpointsToken`: `auto` and `shrink` at the Zero breakpoint bind `.auto` and `.shrink`; `true` and the Zero breakpoint bind the unprefixed `.grid-frame` and cell block classes; sizes, offsets, `up`, and collapse keep Foundation's prefixed Zero-breakpoint class. `.<bp>-full` is not offered.
6. Exported aliases `NfsGridColumn`, `NfsCellSize`, `NfsCellSizeInput`, `NfsCellOffset`, `NfsCellOffsetInput`, `NfsGridUp`, `NfsGridUpInput`, `NfsGridQuery` (= `NfsClassBreakpointQuery<'up'>`), named in every input's type arguments; the registries are the Variant declaration tooling spec's (`NfsGridColumnsOverrides`, `NfsXyBlockGridMaxOverrides`, `NfsBreakpointClassesOverrides`).
7. One `computed` class list per directive through `[class]`; copied Foundation classes are reported in development, not stripped.
8. A cell block gets `tabindex="0"` and, on a `div` without a static `role`, `role="region"`, at every width and in the server HTML; static `tabindex` and `role` are echoed; the consumer names it with `aria-labelledby` or `aria-label`.
9. Development checks: copied classes (all four directives, patterns built from the Breakpoint map); a cell whose parent is not a grid; an offset in a vertical grid; an unnamed `div` or `section` cell block, or a dangling `aria-labelledby`; `fluid` with `full`; a frame that clips content at the current viewport (a `ResizeObserver` on the frame and its cells, development only).
10. Runtime check: `NfsCell`, `NfsGridX`, and `NfsGridY` report through `nfsVariantCheck`, calling `include('nfs-xy-grid', ...)` and `include('nfs-breakpoint-properties', ['breakpoint-classes'])` only while a value that reads them is bound; `NfsGridContainer` makes no call.
11. `nfs-xy-grid` is a properties-only Library mixin writing `--nfs-grid-columns` and `--nfs-xy-block-grid-max`; no library CSS. Foundation's `body { overflow-x: hidden; }` (full container with a margin grid) and `body { overflow: hidden; }` (margin-gutter frame, scoped to the frame's breakpoint) stay consumer CSS in the recipes.
12. The checks cannot see parts switched off in `foundation-xy-grid-classes(...)`; documented.
13. No ARIA role on grids and cells; `@angular/aria`'s Grid is not used. Reading and focus order follow the DOM by construction; ordering is the Flexbox Utilities spec's.
14. Other families' directives are written beside the grid directives, never hosted; a directive with a same-named input (`size`: Callout, Button, Close Button, Dropdown pane) never shares an element with `nfsCell`. This follows the [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md)'s one-owner contract (its decision 8), choosing its beside form: `nfsFlexAlign` (`alignX`, `alignY`, `alignCenterMiddle`) beside `nfsGridX` or `nfsGridY`, `nfsFlexChild` (`alignSelf`, `order`) beside `nfsCell`, and no grid input for those classes. Hosting was rejected for now: a host directive is static, so every cell of every grid would carry an `NfsFlexChild` with its development visual-order check and the XY Grid entry point would import the Flexbox Utilities at runtime, for classes most grids never use; hosting stays additive later, since Angular 22 de-duplicates a directive written and hosted on one element. The copied-class check also reports `.align-*`, `.align-center-middle`, `.align-self-*`, and `.<bp>-order-<n>` on grid and cell hosts, naming the Flexbox directive and input, as the Button Group's does. The two XY Grid notes of that spec are in this one: `hidden` does not hide `.grid-x`, `.grid-y`, or `.cell-block-container` (measured here too), and on `nfsGridY` `alignX` moves cells vertically.
15. Implementation level: native platform (Foundation's flexbox CSS, native scroll containers and keys); Aria's Grid is the wrong pattern and CDK adds nothing.
16. Story ids `xy-grid--basics`, `xy-grid--gutters`, `xy-grid--container`, `xy-grid--auto-sizing`, `xy-grid--collapse`, `xy-grid--offsets`, `xy-grid--block-grid`, `xy-grid--vertical`, `xy-grid--frame`, `xy-grid--cell-blocks`; e2e only for viewports, real keys, the focus ring, reflow, text spacing, and the fixture app's JavaScript-disabled first paint.

### Triage

- Overall: impact HIGH (the four directive names and the `size`, `offset`, and `up` types are a public API that 13 published specs already name, and the count typings freeze a contract); confidence HIGH (the names are building-blocks 1.3 and 1.4 applied mechanically and match every placeholder; the typing is ADR 0040's; every accessibility claim was measured in three engines). Decided with the applied defaults; nothing is OPEN FOR HUMAN.
- `fluid` and `full` as booleans rather than an enum (decision 4): impact MEDIUM (public API), confidence HIGH (rule 4 literally; the enum's name would be invented and likely collide with the Prototyping Utilities).
- The cell block's static tab stop and role (decision 8): impact MEDIUM (shared with the Table's `.table-scroll` contract), confidence HIGH (measured failure without it, measured pass with it, and the triage's Table row gives the same contract).
- Report-only copied classes (decision 7): impact LOW, confidence HIGH (the Button and Callout precedent).
- The frame clipping check (decision 9) and the unmirrored mixin arguments (decision 12): impact LOW, confidence HIGH.
- No prototype is needed: every open point was measured by this ticket.

### Placeholders in published specs

Every placeholder keeps its name; only the hedges that wait for this spec change.

| Placeholder | Specs that use it | Final name |
| --- | --- | --- |
| `nfsGridX` / `NfsGridX` | Abide, Card, Equalizer, Forms, Magellan, Off-canvas, Slider, Sticky, Tabs (and the Dropdown, Interchange, and Switch specs by description) | `nfsGridX` / `NfsGridX`, unchanged |
| `nfsCell` / `NfsCell` | the same | `nfsCell` / `NfsCell`, unchanged |
| `size` on `nfsCell` (bare `size="6"`, rules `[size]="{large: 3}"`) | Abide, Card, Equalizer, Forms, Magellan, Slider, Sticky, Tabs | `size`, unchanged; the bare value is the Zero breakpoint, as those specs assumed |
| `up` on `nfsGridX` (`[up]="{small: 1, medium: 2, large: 4}"`) | Card, Equalizer | `up`, unchanged |
| The gutter input "until the XY Grid spec names it" | Card, Equalizer, Slider | `gridMarginX` and `gridPaddingX` (and `gridMarginY` for row gutters) |
| The Library mixin "the XY Grid spec names" | Variant declaration tooling | `nfs-xy-grid` |

Needs the API does not meet: none. One need the usage shows beyond this spec: the Card spec's `<ul nfsGridX>` list grid keeps Foundation's 20 px list margin and markers (measured), so it needs the Typography Helpers' `.no-bullet` directive beside `nfsGridX`.

### Proposed shared-file changes

1. `building-blocks.md` Table D, the XY Grid row: replace the empty cells with

   > | XY Grid | `docs/pages/xy-grid.md` | [Spec: XY Grid](issues/99-spec-xy-grid.md) | `[nfsGridContainer]` (`.grid-container`; boolean Variant inputs `fluid`, `full`); `[nfsGridX]` (`.grid-x`; gutter booleans `gridMarginX`, `gridPaddingX`, `gridMarginY`, `gridPaddingY`; `up` over `NfsXyBlockGridMaxOverrides`; `marginCollapse`, `paddingCollapse`, `gridFrame` from a Class breakpoint up); `[nfsGridY]` (`.grid-y`; the gutters and `gridFrame`); `[nfsCell]` (`.cell`; `size` and `offset` over `NfsGridColumnsOverrides`, bare for the Zero breakpoint or Breakpoint rules; `cellBlock`, `cellBlockY`, `cellBlockContainer`; a cell block is a tab stop, a `region` on a `div`, named by the consumer); the Flexbox Utilities, Visibility Classes, Sticky, Equalizer, Tabs, and Card directives are written beside them | Directives, one per class that names an element of the layout (ADR 0001, ADR 0039); nothing is generated | Native platform: Foundation's flexbox CSS and native scroll containers; Aria's Grid is the APG Grid composite, not a layout, and CDK adds nothing | A static host class and one `computed` class list per directive (copied classes reported, not stripped); `nfsBreakpointsToken` for the Zero-breakpoint gaps; `HostAttributeToken` echoes of `tabindex` and `role` on cells; development checks in render callbacks (copied classes, placement, cell block names, `fluid` with `full`) and a development `ResizeObserver` for frames that clip; the Runtime checks; `nfs-xy-grid`, properties-only (`--nfs-grid-columns`, `--nfs-xy-block-grid-max`) | None for grids and cells; a scrolling cell block is a named `region` landmark with a tab stop |

2. `building-blocks.md` 1.10, a new bullet after the Progress Bar bullet (to be reconciled with the [Spec: Table](92-spec-table.md)'s wording for `.table-scroll`):

   > - Scroll regions (2026-09-28, [Spec: XY Grid](issues/99-spec-xy-grid.md)): a scroll container whose class a library directive binds (the XY Grid's cell blocks, the Table's `.table-scroll`) is a tab stop in the server HTML: the directive binds `tabindex="0"` while the element is a scroll container at any breakpoint, echoing a static `tabindex`, and `role="region"` on a `div` without a static `role`, leaving a host's own landmark role alone; the consumer names it with `aria-labelledby` or `aria-label`, and a development check reports an unnamed `div` or `section`. Measured on Foundation's Grid Frame example: without the tab stop axe reports `scrollable-region-focusable` in Chromium, Firefox, and WebKit, and WebKit's Tab never reaches the cells; Chromium made such containers focusable on its own only in Chrome 132, after the Browser target's Chrome 119, and Safari does not.

3. `building-blocks.md` 1.9, append to the "Hosting a class directive" bullet:

   > Two library directives written on one element must not declare an input of the same name with different types: Angular sets a template binding on every directive that declares the input, so `<div nfsCell nfsCallout size="small">` fails to compile against the cell's column count. Where two families share an input name (`size` on cells, callouts, buttons, close buttons, and dropdown panes), the elements nest, as Foundation's markup does ([Spec: XY Grid](issues/99-spec-xy-grid.md), D15).

4. `building-blocks.md` 1.3, append to the class-name bullet after "the specs of the layout systems and utility families name theirs ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md))":

   > ; a layout system's directives are named after the classes that name elements of its layout (`.grid-x` -> `NfsGridX`, `.cell` -> `NfsCell`, [Spec: XY Grid](issues/99-spec-xy-grid.md))

5. `CONTEXT.md`, under Foundation side, after **Utility class**:

   > **Cell**:
   > An element of an XY Grid, marked by `.cell`, whose size and offset per breakpoint are set on it; distinct from a table cell and from the ARIA `gridcell` role, which no layout uses.
   > _Avoid_: column (the legacy grids' word), tile, grid item
   >
   > **Block grid**:
   > A grid whose cells share each row equally from a per-breakpoint count set on the grid (Foundation's `.<bp>-up-<n>`), rather than from each cell's own size.
   > _Avoid_: card grid, equal grid, up grid
   >
   > **Grid frame**:
   > An XY Grid sized to the viewport that clips whatever does not fit, so that its cell blocks scroll on their own (Foundation's `.grid-frame`).
   > _Avoid_: app shell, full-height grid, viewport grid
   >
   > **Cell block**:
   > A cell that scrolls its own overflow inside a Grid frame (Foundation's `.cell-block`, `.cell-block-y`), which the library makes a named region with a tab stop.
   > _Avoid_: scroll cell, scroll pane, scroller

6. `CONTEXT.md`, **Variant input**: replace "A directive input that sets one family of Variant classes from a typed name" with

   > A directive input that sets one family of Variant classes, or of a layout system's or utility family's Utility classes, from a typed name

7. [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): in the "Known `mixins` today" bullet, replace "The grid, flexbox, Prototyping, and Button Group specs name theirs." with "`nfs-xy-grid` writes `--nfs-grid-columns` and `--nfs-xy-block-grid-max`. The flexbox, Prototyping, legacy grid, and Button Group specs name theirs."; in the example stylesheet, replace `@include nfs-xy-grid; // the XY Grid spec names its mixin` with `@include nfs-xy-grid;`. Manifest `uses` entries, all with entry point `ngx-foundation-sites/xy-grid`: `NfsGridColumnsOverrides` <- `NfsCell.size` (`NfsCellSizeInput`, `count`) and `NfsCell.offset` (`NfsCellOffsetInput`, `count`); `NfsXyBlockGridMaxOverrides` <- `NfsGridX.up` (`NfsGridUpInput`, `count`); `NfsBreakpointClassesOverrides` <- `NfsCell.size`, `NfsCell.offset`, `NfsGridX.up` (`rules`), and `NfsCell.cellBlock`, `NfsCell.cellBlockY`, `NfsCell.cellBlockContainer`, `NfsGridX.marginCollapse`, `NfsGridX.paddingCollapse`, `NfsGridX.gridFrame`, `NfsGridY.gridFrame` (`NfsGridQuery`, `query`).

8. Hedge replacements in published specs (names unchanged; the hedges go):
   - [Spec: Slider](32-spec-slider.md), Usage examples: replace "The data binding example's row and cells use the XY Grid spec's directives, named here as building-blocks 1.3 and 1.4 name them (`nfsGridX`, `nfsCell` with a `size` count for Foundation's `small-10` and `small-2`) until the [Spec: XY Grid](../issues/99-spec-xy-grid.md) names them; Foundation's `.grid-margin-x` gutter is left out until that spec names its input." with "The data binding example's row and cells use the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s directives (`nfsGridX` with `gridMarginX` for Foundation's `.grid-margin-x`, `nfsCell` with `size="10"` and `size="2"` for `small-10` and `small-2`)." and add `gridMarginX` to that example's `nfsGridX`.
   - [Spec: Equalizer](34-spec-equalizer.md): the gutter row of its class mapping becomes "`.grid-margin-x`, `.grid-padding-x` (the gutters in Foundation's examples) | Utility classes of the XY Grid | The grid | `NfsGridX`'s `gridMarginX` and `gridPaddingX` | [Spec: XY Grid](../issues/99-spec-xy-grid.md). Gutters change spacing, not equalization"; in its names paragraph replace "`NfsGridX`, `NfsCell`, `size`, and `up` are the names building-blocks 1.3 and 1.4 give, as the Forms, Tabs, Abide, Magellan, and Slider specs write them;" with "`NfsGridX`, `NfsCell`, `size`, `up`, and `gridMarginX` are the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s;"; in its Rendered HTML note drop "and Foundation's gutter classes are left out until the XY Grid spec names its input" and "The grid, flex, and card directive names are placeholders" becomes "The flex and card directive names are placeholders".
   - [Spec: Card](90-spec-card.md): in Testing Decisions replace "written `nfsGridX`, `nfsCell`, and `up` as the [Spec: Equalizer](../issues/34-spec-equalizer.md) writes them until the [Spec: XY Grid](../issues/99-spec-xy-grid.md) names them" with "the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s `nfsGridX`, `nfsCell`, and `up`"; in the usage note replace "The XY Grid's `nfsGridX`, `nfsCell`, and `up`, and the Flexbox Utilities' `nfsFlexContainer`, are the names the [Spec: Equalizer](../issues/34-spec-equalizer.md) uses until the [Spec: XY Grid](../issues/99-spec-xy-grid.md) and the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md) name their directives; Foundation's gutter classes are left out until the XY Grid spec names its input." with "`nfsGridX`, `nfsCell`, `up`, and `gridMarginX` are the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s; `nfsFlexContainer` is the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s." Its `<ul nfsGridX>` example also needs the Typography Helpers' `.no-bullet` directive (measured: the list keeps a 20 px margin and markers otherwise).
   - [Spec: Magellan](30-spec-magellan.md) names paragraph, [Spec: Sticky](28-spec-sticky.md) class mapping row and D19, [Spec: Forms](98-spec-forms.md) Rendered HTML note, [Spec: Abide](31-spec-abide.md) usage lead-in, [Spec: Tabs](16-spec-tabs.md) vertical tabs lead-in, and [Spec: Off-canvas](25-spec-off-canvas.md) story note: drop "until the [Spec: XY Grid](../issues/99-spec-xy-grid.md) names them" (or "is published", "that spec fixes the names", "open: ... aligned by the class-rule consistency review") and cite the XY Grid spec as the owner of `nfsGridX`, `nfsCell`, and `size`.
   - [Spec: Dropdown](26-spec-dropdown.md), `dropdown-pane--default`: optional; the docs example's XY Grid scaffolding can now be written with `nfsGridX` and `nfsCell`.

9. Map, Decisions so far:

   > - [Spec: XY Grid](issues/99-spec-xy-grid.md) -- four listener-free directives in `xy-grid`, one per class that names an element of the layout (`nfsGridContainer` with booleans `fluid` and `full`; `nfsGridX` with the four gutter booleans, `up`, `marginCollapse`, `paddingCollapse`, and `gridFrame`; `nfsGridY` with the gutters and `gridFrame`; `nfsCell` with `size`, `offset`, `cellBlock`, `cellBlockY`, `cellBlockContainer`), counts closed over `$grid-columns` and `$xy-block-grid-max`, a bare value for the Zero breakpoint or Breakpoint rules, and Foundation's Zero-breakpoint gaps filled (`size="shrink"` binds `.shrink`, since `.small-shrink` sizes nothing); a cell block is a tab stop and a `region` on a `div`, named by the consumer, in the server HTML (measured: Foundation's frame fails axe `scrollable-region-focusable` in three engines and WebKit's Tab never reaches it); a development `ResizeObserver` reports a frame that clips (measured: 3229 px clipped to 256 at 320 by 256 CSS px when the frame applies at every width); no DI, no ARIA role, no library CSS (`nfs-xy-grid` writes two Variant properties); impact HIGH, confidence HIGH; no ADR. Spec: [specs/xy-grid.md](specs/xy-grid.md).

No ADR: the decisions follow ADR 0039, ADR 0040, and building-blocks rules, and none is both hard to reverse and a real trade-off beyond them.

### For other specs

- [Spec: Table](92-spec-table.md): the cell block contract (proposed change 2) should read the same as `.table-scroll`'s; the consistency review aligns whichever differs.
- [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md): aligned with its decision 8 in the beside form (decision 14); its `nfsFlexAlign`, `nfsFlexChild`, and `nfsFlexContainer` and their inputs share no name with this spec's; it owns source ordering and its 1.3.2 and 2.4.3 hazard through its visual-order check, which covers cells. For the consistency review's beside-or-hosted alignment: the XY Grid chose beside, with the reason above.
- [Spec: Typography Helpers](106-spec-typography-helpers.md): a `ul` or `ol` grid needs its `.no-bullet` directive, and whether a marker-less list keeps its list role is that spec's to settle.
- [Spec: Visibility Classes](104-spec-visibility-classes.md): `hidden` does not hide `.grid-x`, `.grid-y`, or `.cell-block-container` (measured), so its directive, a Toggler, or `@if` hides a grid.
- [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md): if its sizing family takes an input named `width`, it can still sit beside `nfsGridContainer` (which has none).
- [Spec: Float Grid](100-spec-float-grid.md) and [Spec: Flex Grid](101-spec-flex-grid.md): their count families can reuse this spec's alias pattern over `NfsGridColumnCountOverrides` and `NfsBlockGridMaxOverrides`.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check same-element input names across specs (proposed change 3).
