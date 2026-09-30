# Spec: Flexbox Utilities

Ticket: [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

Milestone: later. This spec is planned and implemented in a later milestone of the implementing repository, not in the first ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md); Problem Statement). Revised for the later milestone by [Re-run: grid, typography, and utility specs for the later milestone](../issues/175-rerun-grid-typography-utility-specs-later-milestone.md).

## Problem Statement

A developer on Foundation for Sites lays out and aligns boxes with Foundation's Flexbox Utilities, a utility family of classes that "work with any flexbox-enabled component". Foundation's docs split them by the parent-child relationship of flexbox: a flex parent aligns its children horizontally (`.align-right`, `.align-center`, `.align-justify`, `.align-spaced`) and vertically (`.align-top`, `.align-middle`, `.align-bottom`, `.align-stretch`), or both at once (`.align-center-middle`); a flex child aligns itself (`.align-self-bottom`) and changes its place in the visual order (`.small-order-2`, `.medium-order-1`); and the "vanilla" helpers make any element a flex parent (`.flex-container`), turn it into a column (`.flex-dir-column`), and size its children (`.flex-child-auto`, `.flex-child-grow`, `.flex-child-shrink`), each helper also in a responsive form (`.large-flex-dir-row`). The flex parents are Foundation's XY Grid and legacy Flex Grid, the Button Group, the Media Object, the Card, the Menu, and any element made one by `.flex-container`. There is no Plugin and no class that names an element of a component. The markup contract leaves the hard parts to the author:

- The class names come from Sass loops and settings: the order classes from `$flex-source-ordering-count` (6 by default) for every Class breakpoint, the Zero breakpoint included (`.small-order-1` to `.large-order-6`); the responsive helpers for every Class breakpoint but the Zero breakpoint, and only while `$flexbox-responsive-breakpoints` is on (measured by compiling Foundation's defaults: 56 classes of the family, of which 16 disappear with the flag off). A misspelt `.medium-order-7`, a `.small-flex-container` that Foundation never generates, or a responsive helper while the flag is off renders nothing, and nothing reports it.
- Source ordering and the reverse directions change only the visual order. The DOM order stays the reading order for assistive technology and the order keyboard focus follows. Foundation's own Source Ordering example puts the second cell first below `medium`; with a link in each cell, measured at 400 CSS px in Chromium and Firefox, Tab reaches the link shown second first. WCAG 2.2 success criteria 1.3.2 and 2.4.3 depend on that order, and axe has no rule for it.
- `.align-center` with `.align-middle` and `.align-center-middle` look alike in the docs and differ in a wrapping flex parent: central alignment also centres the lines (`align-content: center`). Measured in a 300 px high XY grid of two lines in Chromium, Firefox, and WebKit, the first line starts 63 px down with the pair and 126 px down with `.align-center-middle`.
- The horizontal names are physical, compiled against `$global-text-direction`: inside a `dir="rtl"` region of a left-to-right compile, `.align-right` puts the items at the left edge (measured in three engines). The names also assume a row: in a column flex parent, the "horizontal" classes move children along the column and the "vertical" ones across it.
- `.flex-container` beats the `hidden` attribute: normalize's `[hidden] { display: none }` comes earlier than Foundation's `.flex-container { display: flex }`, so an element with both stays visible (measured in three engines, and the same for `.grid-x`).
- `.flex-container` does not wrap, so a row of items whose content cannot shrink scrolls the page sideways at 320 CSS px (1.4.10) unless the row stacks at the Zero breakpoint, as Foundation's responsive example does with `.flex-dir-column.large-flex-dir-row`.
- The Menu has its own `.align-left`, `.align-right`, and `.align-center` rules, under the same names, which the Menu directive already sets; a second owner of those names on a menu would fight it.
- Under the library's class rule the developer writes no Foundation class at all, so every class of this family needs an Angular home, on elements that other directives already host (`nfsGridX`, `nfsCell`, `nfsButtonGroup`, `nfsCallout`, `nfsCard`).

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the layout right before hydration and inside dehydrated `@defer` blocks.

This spec is planned and implemented in a later milestone of the implementing repository, not in the first. The user ruled on 2026-09-30 ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)) that the XY, Float, and Flex Grids, Typography Helpers, and the four Utilities specs (Prototyping Utilities, Flexbox Utilities, Visibility Classes, Float Classes) move to a later milestone, each a whole and separate spec, so that the first milestone is simpler and more minimal. Until then a consumer who needs a Flexbox Utility writes Foundation's own classes as normal classes (`class="flex-container"`, `class="align-center"`, `class="flex-child-grow"`) with Foundation's global styles loaded, beside the first-milestone directives of its flex parents (`nfsButtonGroup`, `nfsMediaObject`, `nfsCard`, `nfsMenu`); the library's own stories write the same classes, because the class rule exempts a family with no first-milestone spec (decision 3 of the ruling). No first-milestone spec assumes this spec, names its directives, or links to it. The design below is the later milestone's and stays whole; the closing section (Further Notes, What the later milestone changes, per spec) lists, per first-milestone spec, the Foundation classes that this spec's directives replace there.

## Solution

Three attribute directives in one entry point, `ngx-foundation-sites/flexbox-utilities`, one per role in Foundation's docs:

- `nfsFlexContainer` makes its element a Flex parent: it binds `.flex-container`, or `.medium-flex-container` when written `nfsFlexContainer="medium"`, and sets the direction classes from `direction`, a bare value (`direction="column"`) or a Breakpoint rules object (`[direction]="{small: 'column', large: 'row'}"`). It hosts `nfsFlexAlign`, so its alignment inputs are written on it directly.
- `nfsFlexAlign` sets the parent alignment classes on any Flex parent from `alignX` (`left`, `right`, `center`, `justify`, `spaced`), `alignY` (`top`, `middle`, `bottom`, `stretch`), and the boolean `alignCenterMiddle`. It is written beside the directive of Foundation's own flex parents (`<div nfsGridX nfsFlexAlign alignX="center">`, `<div nfsButtonGroup nfsFlexAlign alignX="spaced">`).
- `nfsFlexChild` makes its element a Flex child with a size from its own value (`nfsFlexChild="grow"`, or `[nfsFlexChild]="{small: 'shrink', large: 'auto'}"`), a self alignment from `alignSelf`, and a Source ordering from `order`, a number (`order="2"`) or a Breakpoint rules object of numbers (`[order]="{small: 2, medium: 1}"`).

Every input is typed and closed: a misspelt name, a breakpoint missing from the developer's `$breakpoint-classes`, or an order above `$flex-source-ordering-count` fails to compile, and the developer's Variant declaration file extends the breakpoints and the count from the developer's Sass. No input sets a class until it has a value. Everything the directives do is a host binding on signal state, with no listener, so the server HTML is the final DOM.

The DOM order is the reading and focus order. The developer writes content in the order it is read and uses `order` and the reverse directions only to rearrange items of which at most one holds focusable content, so keyboard focus follows what users see. The docs also say to bind the inputs instead of Foundation's classes, to put an alignment only on a Flex parent, to bind `alignCenterMiddle` alone, and to set the Menu's own alignment names on a menu through the Menu's `align`. A properties-only `nfs-flexbox-utilities` Library mixin writes the Variant property the Variant declaration file's generator reads.

## User Stories

1. As an application developer, I want to put `nfsFlexContainer` on a `div` and get Foundation's `.flex-container`, so that I write no Foundation class.
2. As an application developer, I want `direction="column"` on a flex container, so that its children stack as Foundation's `.flex-dir-column` stacks them.
3. As an application developer, I want `[direction]="{small: 'column', large: 'row'}"`, so that the container stacks on small screens and becomes a row from `large` up, with Foundation's responsive classes and no JavaScript.
4. As an application developer, I want `nfsFlexContainer="medium"` to give me Foundation's `.medium-flex-container`, so that an element becomes a flex parent only from `medium` up.
5. As an application developer, I want `alignX` and `alignY` on `nfsFlexContainer` itself, so that a container and its alignment are one element with one attribute set.
6. As an application developer, I want to align the cells of an XY grid with `nfsFlexAlign` beside `nfsGridX`, so that Foundation's alignment examples work on the grid without a class.
7. As an application developer, I want the same `nfsFlexAlign` beside `nfsButtonGroup`, the legacy Flex Grid's row, and the Media Object, so that I learn one alignment API for every Foundation flex parent.
8. As an application developer, I want `alignX` to take `left`, `right`, `center`, `justify`, and `spaced`, so that I get every horizontal alignment Foundation's Sass generates.
9. As an application developer, I want `alignY` to take `top`, `middle`, `bottom`, and `stretch`, so that I get every vertical alignment Foundation's Sass generates.
10. As an application developer, I want `alignCenterMiddle` for Foundation's central alignment, so that a wrapping parent centres its lines as well as its items.
11. As an application developer, I want the docs to say that `alignCenterMiddle` overrides `alignX` and `alignY`, so that I bind one or the other.
12. As an application developer, I want `alignSelf="bottom"` on one grid cell, so that one child aligns itself as Foundation's `.align-self-bottom` does.
13. As an application developer, I want `nfsFlexChild="grow"` on a callout inside a column flex container, so that the box fills the remaining height as Foundation's `.flex-child-grow` does.
14. As an application developer, I want `[nfsFlexChild]="{small: 'shrink', large: 'auto'}"`, so that a child's sizing changes at a breakpoint as Foundation's `.flex-child-shrink.large-flex-child-auto` does.
15. As an application developer, I want the bare `nfsFlexChild` attribute to mark a flex child without a size, so that I can give a child only `alignSelf` or `order`.
16. As an application developer, I want `[order]="{small: 2, medium: 1}"` on a cell, so that I get Foundation's source ordering per breakpoint without writing `.small-order-2 .medium-order-1`.
17. As an application developer, I want `order="2"` to mean the Zero breakpoint's order class, so that a bare value applies from the smallest screen up, as every bare responsive value does.
18. As an application developer who sets `$flex-source-ordering-count: 12`, I want `order="12"` to compile once my Variant declaration file says so, so that my Sass stays the only list.
19. As an application developer, I want `order="7"` to fail to compile on Foundation's defaults, so that I never ask for a class my CSS lacks.
20. As an application developer who adds `xlarge` to `$breakpoint-classes`, I want `{xlarge: 'row'}` rules to compile once declared, so that my own breakpoints are typed like Foundation's.
21. As an application developer, I want a misspelt name or a Foundation class name such as `alignX="align-right"` to fail to compile, so that a typo never ships a layout that does nothing.
22. As an application developer, I want no input value to set no class, so that an element looks as Foundation's CSS makes it without the family.
23. As an application developer, I want to bind every input from component state, so that the layout can change with the application and the binding is type-checked.
24. As an application developer, I want the docs to say that the responsive helpers exist only while `$flexbox-responsive-breakpoints` is on, so that I never bind a class my CSS lacks.
25. As an application developer, I want the `nfs-flexbox-utilities` include stated as required, so that the Variant declaration file's generator can read my ordering count.
26. As an application developer, I want the docs to require that the items a flex parent shows out of DOM order hold no links or buttons, so that keyboard focus follows what users see.
27. As an application developer, I want the docs to allow reordering where only one item, or none, holds focusable content, so that Foundation's own text-only ordering example stays valid.
28. As an application developer, I want the docs to say that the rule holds at every breakpoint, so that an order that diverges only below `medium` follows it too.
29. As an application developer, I want the docs to say that `nfsFlexAlign` goes on a Flex parent and `nfsFlexChild` inside one, so that an alignment always has an effect.
30. As an application developer, I want the docs to name the Menu's `align` input for `left`, `right`, and `center` on a menu, so that I use the input that knows the menu's rules.
31. As an application developer migrating Foundation markup, I want the docs to name the input that replaces each class of a copied `class="align-center small-order-2"`, so that I learn the directive's API.
32. As an application developer, I want the spec to tell me that the `hidden` attribute does not hide a flex container, and what does, so that hidden content stays hidden.
33. As an application developer, I want the spec to tell me how Foundation's physical names behave in right-to-left regions and column containers, so that I pick the right name.
34. As an application developer, I want `nfsFlexContainer`, `nfsFlexAlign`, and `nfsFlexChild` together on one grid cell beside `nfsCell`, so that a cell can be both a flex child of its grid and a flex parent of its content.
35. As a keyboard user, I want focus to move through a layout in the order I see it, so that I do not lose my place.
36. As a screen reader user, I want the reading order to be the order the content makes sense in, so that a visual rearrangement never changes the meaning.
37. As a user at a 320 CSS px viewport, I want flex rows to stack or fit, so that the page reflows at 400 percent zoom without sideways scrolling.
38. As a developer of a server-rendered application, I want the server HTML to carry every class of this family, so that the first paint is the final layout and hydration changes nothing.
39. As a developer using `@defer (hydrate never)`, I want layouts there to stay laid out, so that static regions look right without JavaScript.
40. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
41. As an application developer, I want to import the directives from their own entry point, so that a `@defer` block can split them.
42. As a library maintainer, I want every behaviour asserted through classes, computed styles, and geometry at the layer that owns it, so that regressions surface early.

## Implementation Decisions

### Foundation contract

Flexbox Utilities has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its contract is Foundation's flex Sass partial (the `foundation-flex-classes` export mixin, which includes the vanilla helpers), Foundation's flex utility mixins and maps, and the docs page. Dropped options: none, because there are none. Every class below was confirmed by compiling Foundation 6.9.0's defaults.

| Feature | Classes | Source of the names | Notes |
| --- | --- | --- | --- |
| Horizontal alignment (flex parent) | `.align-left`, `.align-right`, `.align-center`, `.align-justify`, `.align-spaced` | The keys of Foundation's private justify map, built from `$global-text-direction` (`left` and `right` swap to `flex-end` and `flex-start` in a right-to-left compile) | `justify-content`: `flex-start`, `flex-end`, `center`, `space-between`, `space-around`. The docs list four and call left the default; the Sass also generates `.align-left`. Closed: the map is private, not a setting |
| Vertical alignment (flex parent) | `.align-top`, `.align-middle`, `.align-bottom`, `.align-stretch` | Foundation's private align map | `align-items`: `flex-start`, `center`, `flex-end`, `stretch`. Closed. "middle" and not "center", because the two axes share one class prefix (the docs' note) |
| Central alignment (flex parent) | `.align-center-middle` | A literal rule | `justify-content: center; align-items: center; align-content: center`; emitted after the axis classes, so it wins over them at equal specificity. It differs from `.align-center.align-middle` in a wrapping parent (measured, Problem Statement) |
| Vertical menu alignment | `.align-left.vertical.menu > li > a` and the same for `right` and `center` | Foundation's flex partial, the justify map without `justify` and `spaced` | Aligns a vertical menu's links; set through the Menu's `align` and `orientation` ([Spec: Menu](../issues/85-spec-menu.md)), not by this family |
| Self alignment (flex child) | `.align-self-top`, `.align-self-middle`, `.align-self-bottom`, `.align-self-stretch` | The same align map | `align-self`. Closed |
| Source ordering (flex child) | `.<bp>-order-<n>`, from `1` to `$flex-source-ordering-count` | Foundation's breakpoint iterator over `$breakpoint-classes`, the Zero breakpoint included (`.small-order-1`), each above it in its `breakpoint()` media query | `order: <n>`. Open Variant family: a count and Class breakpoints. There is no unprefixed `.order-<n>` and no `order: 0` class |
| Flex container (vanilla helper) | `.flex-container`; `.<bp>-flex-container` | A literal rule; the responsive form loops over `$breakpoint-classes` without the Zero breakpoint, behind `$flexbox-responsive-breakpoints` | `display: flex`, no `flex-wrap` |
| Direction (vanilla helper) | `.flex-dir-row`, `.flex-dir-row-reverse`, `.flex-dir-column`, `.flex-dir-column-reverse`; `.<bp>-flex-dir-<dir>` | Foundation's private direction map; responsive form as above | `flex-direction`. Closed names; responsive form over Class breakpoints behind the flag |
| Flex child size (vanilla helper) | `.flex-child-auto`, `.flex-child-grow`, `.flex-child-shrink`; `.<bp>-flex-child-<size>` | Literal rules; responsive form as above | `flex: 1 1 auto`, `1 0 auto`, `0 1 auto` |
| Helper mixins | `flex`, `flex-align($x, $y)`, `flex-align-self($y)`, `flex-order($order)`, `flex-direction($direction)` | Foundation's flex utility mixins | For the consumer's own classes in the consumer's own Sass; not classes, so no directive (Out of Scope) |

Settings: `$flex-source-ordering-count` (count, 6) and `$flexbox-responsive-breakpoints` (flag, `true`); `$breakpoint-classes` and `$global-text-direction` are global. The partial is compiled by `foundation-everything` only while its `$flex` argument is true (the default), or by `@include foundation-flex-classes`.

Docs conventions kept or corrected: every example (kept, with directives in place of classes, D1 to D6); the XY Grid as the example parent (kept); `.align-center-middle` as "central alignment" (kept, with its difference from the pair stated, D4); the Source Ordering example (kept, with the reading-and-focus requirement, D9, D10); the `.text-center` demo class (as the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsTextAlign="center"`) and inline `height` (kept as story scaffolding under the Storybook conventions); the Helper Mixins section (kept as Sass guidance, Out of Scope).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.flex-container`, `.<bp>-flex-container` | `nfsFlexContainer`, the selector-named input of `NfsFlexContainer` | `NfsFlexContainerInput` over `NfsFlexContainerQuery` (`NfsClassBreakpointQuery<'up'>`). `.flex-container`: closed. The responsive form: `$breakpoint-classes` (`NfsBreakpointClassesOverrides`), generated only while `$flexbox-responsive-breakpoints` is on | boolean (the bare attribute is `true`) or a Breakpoint query with `up` | `true`, `''`, `'true'`, and the Zero breakpoint (`'small'`, `'small up'`) set `.flex-container`; `'medium'` and `'medium up'` set `.medium-flex-container`; `false` sets none | `--nfs-breakpoint-classes`, for a query above the Zero breakpoint only |
| `.flex-dir-<dir>`, `.<bp>-flex-dir-<dir>` | `direction` of `NfsFlexContainer` | `NfsFlexDirectionInput` over `NfsFlexDirection` (closed: `row`, `row-reverse`, `column`, `column-reverse`); rules keys `NfsClassBreakpoint` (`NfsBreakpointClassesOverrides`); responsive form behind the flag | a bare value, which is the Zero breakpoint, or a Breakpoint rules object | `'column'` sets `.flex-dir-column`; `{small: 'column', large: 'row'}` sets `.flex-dir-column` and `.large-flex-dir-row` (the Zero-breakpoint key sets the unprefixed class, Foundation's gap); no value sets none | `--nfs-breakpoint-classes`, for rules keys above the Zero breakpoint |
| `.align-left`, `.align-right`, `.align-center`, `.align-justify`, `.align-spaced` | `alignX` of `NfsFlexAlign` | `NfsFlexAlignX`, closed | a name | `.align-<name>`; no value sets none | none (closed) |
| `.align-top`, `.align-middle`, `.align-bottom`, `.align-stretch` | `alignY` of `NfsFlexAlign` | `NfsFlexAlignY`, closed | a name | `.align-<name>`; no value sets none | none (closed) |
| `.align-center-middle` | `alignCenterMiddle` of `NfsFlexAlign` | `boolean` through `nfsVariantBoolean`, closed | boolean | `true` sets `.align-center-middle`; `false` sets none | none (closed) |
| `.flex-child-<size>`, `.<bp>-flex-child-<size>` | `nfsFlexChild`, the selector-named input of `NfsFlexChild` | `NfsFlexChildInput` over `NfsFlexChildSize` (closed: `auto`, `grow`, `shrink`); rules keys `NfsClassBreakpoint`; responsive form behind the flag | `''` (the bare attribute), a bare value (the Zero breakpoint), or a Breakpoint rules object | `''` sets none; `'grow'` sets `.flex-child-grow`; `{small: 'shrink', large: 'auto'}` sets `.flex-child-shrink` and `.large-flex-child-auto` | `--nfs-breakpoint-classes`, for rules keys above the Zero breakpoint |
| `.align-self-top`, `.align-self-middle`, `.align-self-bottom`, `.align-self-stretch` | `alignSelf` of `NfsFlexChild` | `NfsFlexAlignY`, closed (the same map as `alignY`) | a name | `.align-self-<name>`; no value sets none | none (closed) |
| `.<bp>-order-<n>` | `order` of `NfsFlexChild` | `NfsFlexOrderInput` over `NfsFlexOrder`, `NfsOverridableCount<6, NfsFlexSourceOrderingCountOverrides>` (`$flex-source-ordering-count`, Open Variant family), and rules keys `NfsClassBreakpoint` (`$breakpoint-classes`, `NfsBreakpointClassesOverrides`) | a count (the Zero breakpoint; the static attribute strings `'1'` to `'6'` too) or a Breakpoint rules object of counts | `2` and `'2'` set `.small-order-2` (Foundation prefixes the Zero breakpoint in this family, so there is no gap); `{small: 2, medium: 1}` sets `.small-order-2` and `.medium-order-1`; no value sets none | `--nfs-flex-source-ordering-count` and `--nfs-breakpoint-classes` |
| `.grid-x`, `.grid-padding-x`, `.cell`, `.small-<n>` (another family's: the XY Grid's) | `NfsGridX` with its `gridPaddingX` Variant input and `NfsCell` with its `size`, the Flex parents and children of Foundation's examples | The [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s | - | - | - |
| `.callout` and its colour class (another family's: the Callout's) | `NfsCallout` (`[nfsCallout]`) with its `color` Variant input, the boxes of the examples | The [Spec: Callout](../issues/89-spec-callout.md)'s | - | `callout` | - |
| `.button-group` (another family's: the Button Group's) | `NfsButtonGroup` (`[nfsButtonGroup]`), beside `nfsFlexAlign` | The [Spec: Button Group](../issues/82-spec-button-group.md)'s | - | `button-group` | - |
| `.button` (another family's: the Button's) | `NfsButton` (`button[nfsButton]`) with its Variant inputs, the buttons of the examples | The [Spec: Button](../issues/37-spec-button.md)'s | - | `button` | - |
| `.media-object`, `.media-object-section` (another family's: the Media Object's) | `NfsMediaObject` and `NfsMediaObjectSection`, beside `nfsFlexChild` | The [Spec: Media Object](../issues/91-spec-media-object.md)'s | - | - | - |
| `.menu` with `.align-left`, `.align-right`, `.align-center` (another family's: the Menu's) | `NfsMenu` (`ul[nfsMenu]`) with its `align` Variant input, not `nfsFlexAlign` (D7) | The [Spec: Menu](../issues/85-spec-menu.md)'s | - | - | - |
| `.text-center` (another family's: the Typography Helpers') | `NfsTextAlignment` (`nfsTextAlign="center"`), the docs' demo class in story scaffolding | The [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s | - | `text-center` | - |

State classes: none. Foundation's Flexbox Utilities have no State class, and the directives bind no library hook. No class of this family is left for the consumer to write (ADR 0039). The class of each value is derived from the Zero breakpoint of `nfsBreakpointsToken` (`nfsBreakpointForWidth(map, 0)`, `small` by default), the same on server and client (building-blocks 1.4).

### Hierarchy and DI shape

```
[nfsFlexContainer]   NfsFlexContainer (standalone directive, no template)
                       hostDirectives: NfsFlexAlign, inputs alignX, alignY, alignCenterMiddle
[nfsFlexAlign]       NfsFlexAlign (standalone; beside the directive of any Flex parent)
[nfsFlexChild]       NfsFlexChild (standalone; beside the directive of any Flex child)
```

- No token, no providers, no parent discovery through DI, and no Defaults token: no directive of this family needs another's state, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Composition (building-blocks 1.9): the three directives are written beside the class directives of the elements they sit on (`<div nfsGridX nfsFlexAlign alignY="middle">`, `<div nfsCell size="6" nfsFlexChild [order]="{small: 2, medium: 1}">`, `<div nfsCallout nfsFlexChild="grow">`) and beside each other: a grid cell can carry `nfsCell`, `nfsFlexChild`, and `nfsFlexContainer`, because their input names are disjoint (`nfsFlexContainer`, `direction`, `alignX`, `alignY`, `alignCenterMiddle`, `nfsFlexChild`, `alignSelf`, `order`) and none binds a class another binds. `NfsFlexContainer` hosts `NfsFlexAlign` because a `.flex-container` is always a Flex parent; a developer who also writes `nfsFlexAlign` on it gets one `NfsFlexAlign`, because a template match of a directive discards its host-directive matches (measured with Angular 22.2.0 by the [Spec: Menu](../issues/85-spec-menu.md) ticket). A directive whose element is always a Flex parent or a Flex child (the XY Grid's grid or cell, the Flex Grid's row or column, the Media Object and its sections) may host `NfsFlexAlign` or `NfsFlexChild` the same way, exposing `alignX`, `alignY`, `alignCenterMiddle`, `alignSelf`, and `order` under those names, and never declares inputs of its own for these classes (D8).
- Injection: `nfsBreakpointsToken` and `nfsBreakpointForWidth` (`NfsFlexContainer`, `NfsFlexChild`), from `ngx-foundation-sites/media-query`. Nothing else.
- Entry point: `ngx-foundation-sites/flexbox-utilities` (one per Foundation docs page), so a consumer's `@defer` can split it. The aliases below are exported beside the directives; `NfsFlexSourceOrderingCountOverrides`, `NfsBreakpointClassesOverrides`, `NfsOverridableCount`, `NfsClassBreakpointQuery`, `NfsClassBreakpointRules`, and `NfsVariantBoolean` live in the primary entry point `ngx-foundation-sites` and are used here as types only; `nfsVariantBoolean` is its one runtime import.
- Imports (documented usage): a component imports each of `NfsFlexContainer`, `NfsFlexAlign`, and `NfsFlexChild` whose attribute its template writes; `NfsFlexContainer` hosts `NfsFlexAlign`, so an alignment on a container needs no second import. A forgotten one fails to compile where the template binds or references it (`[direction]`, `[order]`, `[alignX]`, `#c="nfsFlexChild"`: NG8002, NG8003); otherwise the element renders without its classes, with no error, and a static input attribute such as `alignX="center"` stays an attribute that means nothing. The Flex parents' and Flex children's own directives written beside these (`nfsGridX`, `nfsCell`, `nfsButtonGroup`, `nfsMediaObjectSection`) are imported from their own entry points.

### API

Types, declared with explicit type arguments that name these aliases (building-blocks 1.4, the typings check of the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md)):

```ts
type NfsFlexContainerQuery = NfsClassBreakpointQuery<'up'>;
type NfsFlexContainerValue = boolean | NfsFlexContainerQuery;
type NfsFlexContainerInput = NfsVariantBoolean | NfsFlexContainerQuery;

type NfsFlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type NfsFlexDirectionInput = NfsFlexDirection | NfsClassBreakpointRules<NfsFlexDirection>;

type NfsFlexAlignX = 'left' | 'right' | 'center' | 'justify' | 'spaced';
type NfsFlexAlignY = 'top' | 'middle' | 'bottom' | 'stretch';

type NfsFlexChildSize = 'auto' | 'grow' | 'shrink';
type NfsFlexChildInput = '' | NfsFlexChildSize | NfsClassBreakpointRules<NfsFlexChildSize>;

type NfsFlexOrder = NfsOverridableCount<6, NfsFlexSourceOrderingCountOverrides>; // 1 to 6 by default
type NfsFlexOrderValue = NfsFlexOrder | NfsClassBreakpointRules<NfsFlexOrder>;
type NfsFlexOrderInput = NfsFlexOrderValue | `${NfsFlexOrder}`;

class NfsFlexContainer {
  readonly nfsFlexContainer: InputSignalWithTransform<NfsFlexContainerValue, NfsFlexContainerInput>; // default false; the bare attribute is true
  readonly direction: InputSignal<NfsFlexDirectionInput | undefined>; // default undefined
  // alignX, alignY, alignCenterMiddle: NfsFlexAlign's, through hostDirectives
}

class NfsFlexAlign {
  readonly alignX: InputSignal<NfsFlexAlignX | undefined>; // default undefined
  readonly alignY: InputSignal<NfsFlexAlignY | undefined>; // default undefined
  readonly alignCenterMiddle: InputSignalWithTransform<boolean, NfsVariantBoolean>; // default false
}

class NfsFlexChild {
  readonly nfsFlexChild: InputSignal<NfsFlexChildInput | undefined>; // default undefined; the bare attribute is '' and sets none
  readonly alignSelf: InputSignal<NfsFlexAlignY | undefined>; // default undefined
  readonly order: InputSignalWithTransform<NfsFlexOrderValue | undefined, NfsFlexOrderInput | undefined>; // default undefined
}
```

| Directive and input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `NfsFlexContainer.nfsFlexContainer` | `NfsFlexContainerInput`; the transform maps `NfsVariantBoolean` through `nfsVariantBoolean` and passes a query through, the shape of the Menu's `expanded` | `false`; the bare attribute gives `''`, which is `true` | `.flex-container`, `.<bp>-flex-container` | New. The JSDoc names both class templates and `$flexbox-responsive-breakpoints` |
| `NfsFlexContainer.direction` | `NfsFlexDirectionInput`, no transform | `undefined` | `.flex-dir-<dir>`, `.<bp>-flex-dir-<dir>` | New. Named for Foundation's `flex-direction($direction)` mixin and its docs' "flex direction" (building-blocks 1.4 rule 3) |
| `NfsFlexAlign.alignX` | `NfsFlexAlignX` | `undefined` | `.align-<x>`; `flex-align($x: ...)` | New. Named for the `$x` of Foundation's `flex-align($x, $y)` |
| `NfsFlexAlign.alignY` | `NfsFlexAlignY` | `undefined` | `.align-<y>`; `flex-align($y: ...)` | New. Named for the `$y` of `flex-align($x, $y)` |
| `NfsFlexAlign.alignCenterMiddle` | `boolean` through `nfsVariantBoolean` | `false` | `.align-center-middle` | New. A single class, so a boolean named after it (building-blocks 1.4 rule 4) |
| `NfsFlexChild.nfsFlexChild` | `NfsFlexChildInput`, no transform | `undefined` | `.flex-child-<size>`, `.<bp>-flex-child-<size>` | New |
| `NfsFlexChild.alignSelf` | `NfsFlexAlignY` | `undefined` | `.align-self-<y>`; `flex-align-self($y)` | New. Named after the class template `align-self-` |
| `NfsFlexChild.order` | `NfsFlexOrderInput`; the transform turns a numeric static-attribute string into its number and passes numbers and rules objects through | `undefined` | `.<bp>-order-<n>`; `flex-order($order)` | New. The name building-blocks 1.4 rule 3 gives the flex family's ordering |

- Models, outputs, and methods: none. The families hold no state; the inputs are the public read API. `exportAs`: `nfsFlexContainer` on `NfsFlexContainer`, `nfsFlexAlign` on `NfsFlexAlign`, `nfsFlexChild` on `NfsFlexChild`.
- Host bindings, all on signal state: each directive has one `[class]` binding to one `computed` list of the classes its inputs set. The consumer's own static classes and bindings stay, because Angular combines static classes and class bindings. The list binds nothing for a value that is not one class token (a name that is not a word of letters, digits, and hyphens, a rules key that is not one, a count that is not a whole number from 1); under the closed types only a cast or `$any()` reaches that guard. A copied Foundation class is not stripped (the list sets only its own classes), so it keeps styling until removed (D12).
- Documented usage, which the docs and each input's JSDoc state:
  1. The consumer binds `nfsFlexContainer`, `direction`, `alignX`, `alignY`, `alignCenterMiddle`, `nfsFlexChild`, `alignSelf`, and `order` instead of writing Foundation's class names on the host (D12).
  2. `nfsFlexAlign` sits on an element that is a Flex parent (`display: flex` or `inline-flex`, from `nfsFlexContainer`, including its responsive form from its breakpoint up, or from another family's directive such as `nfsGridX` or a Flex Grid `nfsRow`), and `nfsFlexChild` inside a Flex or grid parent, where `order` and `align-self` apply; elsewhere their classes do nothing (D13).
  3. `alignCenterMiddle` is bound alone: `.align-center-middle` overrides `alignX` and `alignY` (D4).
  4. On a menu, the Menu's own `align` sets `left`, `right`, and `center`; `nfsFlexAlign` there takes `justify`, `spaced`, `alignY`, and `alignCenterMiddle` (D7).
  5. Content is written in the order it is read (WCAG 1.3.2), and `order` or a reverse `direction` rearranges only items that hold no focusable content, or leaves the items that hold focusable content in their DOM sequence, at every breakpoint the page can be at (a set in which at most one item holds focusable content always qualifies), so keyboard focus follows the visual order (WCAG 2.4.3; D9, D10).
  6. A responsive helper value (a `nfsFlexContainer` query, or a `direction` or `nfsFlexChild` rules key, above the Zero breakpoint) is bound only while `$flexbox-responsive-breakpoints` is on, because Foundation generates those classes only then; an `order` stays within `$flex-source-ordering-count`, which the consumer's Variant declaration file carries into the type.
- Include: `@include nfs-flexbox-utilities;` is part of the documented setup: it writes `--nfs-flex-source-ordering-count`, which the Variant declaration file's generator reads (D14).

### Comparison with Angular Material (22.2) and `@angular/flex-layout`

Angular Material and the CDK have no layout utilities; CDK's layout module is the breakpoint observer, which the library does not use (building-blocks 1.7). The Angular team's own layout directives were `@angular/flex-layout`, whose last release, 15.0.0-beta.42, the registry marks deprecated ("This package has been deprecated. Please see https://blog.angular.io/modern-css-in-angular-layouts-4a259dca9127"); its directive set is the nearest Angular prior art.

| Concern | `@angular/flex-layout` 15.0.0-beta.42 | This spec |
| --- | --- | --- |
| Directives | Parent: `fxLayout` (direction and wrap), `fxLayoutAlign` (main and cross axis in one string, `"center center"`), `fxLayoutGap`. Child: `fxFlex`, `fxFlexOrder`, `fxFlexOffset`, `fxFlexAlign` | Parent: `nfsFlexContainer` with `direction`, `nfsFlexAlign` with `alignX`, `alignY`, `alignCenterMiddle`. Child: `nfsFlexChild` with its size, `alignSelf`, `order` |
| Responsive form | One input per breakpoint and range (`fxLayout.xs`, `fxLayout.gt-sm`, `fxLayout.lt-md`) | One input taking a Breakpoint rules object or query over Class breakpoints (ADR 0040) |
| Mechanism | Inline styles written from a JavaScript media observer, with a server module for SSR | Foundation's classes and media queries, set by host bindings that render on the server; no breakpoint logic in JavaScript (building-blocks 1.7, CSS first) |
| Values | Any CSS value | Foundation's generated names only, typed and closed |
| Reading and focus order | Not addressed | A requirement (D9, D10) |

Borrowed: the parent-and-child split, the child's order and self alignment on the child directive, and a value under the selector's own name. Not borrowed: inline styles and a JavaScript observer; per-breakpoint inputs; the two-axis string (Foundation's own mixin takes `$x` and `$y` separately, and its two vertical names differ from the horizontal ones only by accident of wording); gap and offset, which Foundation's flex partial does not have (the grids' offsets are theirs).

### Implementation level and primitives

Implementation level: native platform. The layout is CSS flexbox through Foundation's classes, in every engine of the Browser target; the directives are one `computed` class list each over `input()` signals. `@angular/aria` has no layout pattern, and `@angular/cdk` has nothing to add. No `effect`, no listener, no timer, no observer.

Fallback: none needed. The facts the design rests on (the generated class set, central alignment against the pair, the physical names in a right-to-left region, the `hidden` attribute) were measured by this spec's ticket.

### ARIA and keyboard

APG pattern: none. The families are layout and add no role, name, or state.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| Any host of the three directives | The host element's own role and content; the directives add no attribute but `class` | WHATWG HTML; HTML-AAM |
| A reordered or reversed Flex parent | The accessibility tree and the reading order follow the DOM order, not the visual order | CSS Flexbox Level 1, section 5: "The reordering capabilities of flex layout intentionally affect only the visual rendering, leaving speech order and navigation based on the source order", and "Authors must not use order or the *-reverse values of flex-flow/flex-direction as a substitute for correct source ordering, as that can ruin the accessibility of the document" |
| A list made a Flex parent (`<ul nfsFlexContainer>`) | Still a list: `display: flex` does not remove list semantics; Foundation's helper sets no `list-style` | CSS; the Menu keeps its lists the same way |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Moves through focusable content in DOM order, whatever `order` and `direction` show (measured in Chromium and Firefox) | Native |

Focus: the directives move no focus. Where a reordered layout holds focusable content in more than one item, focus and the visual order part company, which documented usage 5 rules out (D10).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Geometry was measured in Chromium, Firefox, and WebKit through Playwright 1.63, from Foundation 6.9.0's defaults compiled with Dart Sass.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.3.2 Meaningful Sequence | The DOM order is the reading order. The developer writes content in the order it makes sense in and uses `order` and the reverse `direction` values only to rearrange the look of items whose visual sequence does not change the meaning (technique C27). The directives cannot judge meaning; the docs require it, every recipe shows it, and every story's play function asserts that the DOM order of its items is the order their text reads in, as the Callout's and the Label's content requirements are stated (ADR 0022, dated note) | Foundation's Source Ordering example reorders two text cells; its DOM order reads correctly | Play functions of `flexbox-utilities--source-ordering`, `--responsive`, and `--flex-container` |
| 2.4.3 Focus Order | Focus order follows the DOM order, and so does the reading order; the visual order matches it wherever items hold focusable content. The docs require that items shown in another sequence than the DOM's be a set of which at most one holds focusable content, at every breakpoint (documented usage 5, D10); the stories keep focusable content out of reordered items | Foundation's example has no focusable content; with a link in each cell, focus reaches the link shown second first below `medium` (measured) | `flexbox-utilities--source-ordering` asserts that no reordered item holds a focusable element |
| 1.4.10 Reflow | At 320 CSS px no Flex parent of this family scrolls the page sideways. `.flex-container` does not wrap, so a row whose items cannot shrink to the width stacks at the Zero breakpoint (`[direction]="{small: 'column', medium: 'row'}"`), as Foundation's responsive example does; the docs require it, and every row story follows it. | Foundation's examples stack or fit | e2e at 320 by 640 px in three engines: `document.documentElement.scrollWidth` is at most 320 in `flexbox-utilities--horizontal-alignment`, `--flex-container`, and `--responsive` |
| 1.3.1 Info and Relationships | The directives change no semantics; a list or a table-free layout keeps its structure | Passes | axe in every story |
| 1.4.12 Text Spacing | No class of this family fixes a height or a width; with the text-spacing overrides content grows its boxes | Passes | axe in every story; the grids' and components' own specs test their boxes |
| 4.1.2 Name, Role, Value | The directives add no role, name, or state | Passes | axe in every story; play functions find content by role and name |

1.4.3, 1.4.11, and 2.5.8 do not apply: the family draws no colour and no control. The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018); axe has no rule for the visual order, which is why documented usage 5 states the rule.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: no directive declares a listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfsflexcontainer=""`, `direction="column"`), which the resulting DOM below leaves out, as the other specs do. `nfsGridX`, `nfsCell`, `size`, and `gridPaddingX`, the gutter every grid of Foundation's examples carries, are the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s; `nfsCallout` and `color` are the [Spec: Callout](../issues/89-spec-callout.md)'s, and `nfsButtonGroup` the [Spec: Button Group](../issues/82-spec-button-group.md)'s.

```html
<!-- Horizontal alignment on the XY grid -->
<div nfsGridX gridPaddingX nfsFlexAlign alignX="right">
  <div nfsCell size="4">Aligned to</div>
  <div nfsCell size="4">the right</div>
</div>

<div class="grid-x grid-padding-x align-right">
  <div class="cell small-4">Aligned to</div>
  <div class="cell small-4">the right</div>
</div>

<!-- A cell aligning itself, and central alignment -->
<div nfsGridX gridPaddingX>
  <div nfsCell size="3" nfsFlexChild alignSelf="bottom">Align bottom</div>
</div>
<div nfsGridX gridPaddingX nfsFlexAlign alignCenterMiddle>...</div>

<div class="grid-x grid-padding-x">
  <div class="cell small-3 align-self-bottom">Align bottom</div>
</div>
<div class="grid-x grid-padding-x align-center-middle">...</div>

<!-- The vanilla helpers, responsive -->
<div nfsGridX gridPaddingX>
  <div nfsCell size="12" nfsFlexContainer [direction]="{small: 'column', large: 'row'}">
    <div nfsCallout color="primary" nfsFlexChild="auto">Auto</div>
    <div nfsCallout color="primary" [nfsFlexChild]="{small: 'shrink', large: 'auto'}">Auto on large</div>
  </div>
</div>

<div class="grid-x grid-padding-x">
  <div class="cell small-12 flex-container flex-dir-column large-flex-dir-row">
    <div class="callout primary flex-child-auto">Auto</div>
    <div class="callout primary flex-child-shrink large-flex-child-auto">Auto on large</div>
  </div>
</div>

<!-- Source ordering: text only, DOM order is the reading order -->
<div nfsGridX gridPaddingX>
  <div nfsCell size="6" nfsFlexChild [order]="{small: 2, medium: 1}">This column will come second on small, and first on medium and larger.</div>
  <div nfsCell size="6" nfsFlexChild [order]="{small: 1, medium: 2}">This column will come first on small, and second on medium and larger.</div>
</div>

<div class="grid-x grid-padding-x">
  <div class="cell small-6 small-order-2 medium-order-1">This column will come second on small, and first on medium and larger.</div>
  <div class="cell small-6 small-order-1 medium-order-2">This column will come first on small, and second on medium and larger.</div>
</div>

<!-- Alignment on a Button Group, beside its own directive -->
<div nfsButtonGroup nfsFlexAlign alignX="spaced">...</div>

<div class="button-group align-spaced">...</div>
```

Server and hydrated DOM are identical for every example: the classes are host bindings on signal state, and the breakpoint-dependent ones are Foundation's media queries, which the browser applies from the first paint.

### Animation

None. Foundation's flex partial declares no transition, and a change of order, direction, or alignment at a breakpoint is instant; the library adds none. No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every class of this family exactly as the hydrated DOM does, with the Zero breakpoint taken from `nfsBreakpointsToken` on both sides, so the first paint is the final layout at every viewport; the breakpoint-dependent classes are CSS media queries, not JavaScript state (building-blocks 1.7, CSS first).
- Before hydration: the directives touch no DOM outside host bindings, measure nothing, and start no timer.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own. A layout and the widgets inside it may sit in different boundaries.
- Event replay: no directive declares a listener or adds `jsaction`; the content's own listeners replay as their specs say.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block, and inside `@defer (hydrate never)` for good, a layout is its server HTML and stays laid out.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or the browser observes: the classes, the computed `justify-content`, `align-items`, `align-self`, `order`, `flex`, and `flex-direction`, the geometry of the items, and the DOM order against the visual order. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Menu](../issues/85-spec-menu.md)'s and [Spec: Button Group](../issues/82-spec-button-group.md)'s tests, the nearest precedents.

Story ids follow `flexbox-utilities--<story>`: `flexbox-utilities--horizontal-alignment`, `--vertical-alignment`, `--align-self`, `--central-alignment`, `--flex-container`, `--responsive`, `--source-ordering`, `--button-group`, and `--fixture` (args for every input, `!autodocs`, for e2e). The stories file sets `id: 'flexbox-utilities'`, `title: 'Utilities/Flexbox Utilities'`, and `component: NfsFlexContainer`. Stories use Foundation's default names, count, and Class breakpoints only, so the library's Storybook program needs no Variant declaration file (ADR 0040); the preview includes `nfs-flexbox-utilities`. Boxes are `nfsCallout` hosts and grids the XY Grid's directives, imported as scaffolding, a grid ported from Foundation's examples with their `gridPaddingX` gutter; no story element carries a Foundation or library class written in the template, and no reordered item holds focusable content.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags.

- `flexbox-utilities--horizontal-alignment` (arg `alignX`): one `nfsFlexContainer` per value, each with two boxes; each container carries `.flex-container` and its `.align-<x>` class, and its computed `justify-content` is `flex-start`, `flex-end`, `center`, `space-between`, or `space-around`; under `right` the last box's right edge equals the container's content-box right edge.
- `flexbox-utilities--vertical-alignment` (arg `alignY`): one container per value with a tall box and a short one; the computed `align-items` matches, and the short box's top, centre, or bottom lines up with the container's, or its height equals the tall box's under `stretch`.
- `flexbox-utilities--align-self` (arg `alignSelf`): Foundation's self-alignment example on four cells; each cell's computed `align-self` matches its value.
- `flexbox-utilities--central-alignment`: two 300 px high wrapping grids of four third-width cells, one with `alignCenterMiddle` and one with `alignX="center" alignY="middle"`; the first carries only `.align-center-middle` and its computed `align-content` is `center`; the first line starts lower in it than in the second.
- `flexbox-utilities--flex-container` (arg `direction`): Foundation's vanilla example, a column container of two `auto` boxes and one `shrink` box; computed `flex-direction` is `column` and the boxes' computed `flex` is `1 1 auto` and `0 1 auto`; the DOM order of the boxes is their reading order.
- `flexbox-utilities--responsive`: Foundation's responsive example; the container carries `.flex-dir-column` and `.large-flex-dir-row`, the third box `.flex-child-shrink` and `.large-flex-child-auto`; the computed values are those of the breakpoint the story frame is at.
- `flexbox-utilities--source-ordering`: Foundation's Source Ordering example with its text; the cells carry `.small-order-2 .medium-order-1` and `.small-order-1 .medium-order-2`; the DOM order is unchanged and reads correctly; no reordered cell holds a focusable element.
- `flexbox-utilities--button-group`: Foundation's Flexbox Button Group example, `nfsFlexAlign` beside `nfsButtonGroup` for `center`, `right`, `spaced`, and `justify`; each group's computed `justify-content` matches, and each group's buttons are found by role and name.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data, for every input: every value sets exactly its class; no value sets none; `nfsFlexContainer` bare, `"true"`, `"small"`, and `"small up"` set `.flex-container`, `"medium"` and `"medium up"` set `.medium-flex-container`, `"false"` sets none; `direction` and `nfsFlexChild` rules set the unprefixed class for the Zero breakpoint and the prefixed ones above it; `order="2"` sets `.small-order-2` and `[order]="{small: 2, medium: 1}"` both classes; with a test `nfsBreakpointsToken` whose Zero breakpoint is `xs`, `order="2"` sets `.xs-order-2` and `{xs: 'column'}` sets `.flex-dir-column`; a value reached through `$any()` that holds a space, a rules key that is not a word, or an order of `0` or `1.5` sets none; changing a value swaps its class and leaves the consumer's own static class and `[class]` binding alone; the directives add no attribute but `class`.
- Composition: `nfsFlexContainer` with `alignX` sets both its classes through the hosted `NfsFlexAlign`; `nfsFlexContainer` and `nfsFlexAlign` written together create one `NfsFlexAlign` and raise no error; `nfsFlexContainer`, `nfsFlexChild`, and a test cell directive binding its own class on one element keep all their classes.
- Copied classes: a static `class="flex-container flex-dir-column"` or `class="align-center align-middle"` stays beside the classes the inputs bind, and the consumer's own class stays (D12).
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with every Rendered HTML example and a copied `class="align-center"` on an `nfsFlexAlign` host. `whenStable()` resolves; the server HTML carries every class of the examples on the right elements, the copied class unchanged, and the consumer's own attributes; no element carries `jsaction` from these directives.
- Pure logic, the mapping the directives use: the value-to-classes mapping for each input over a Breakpoint map (the Zero-breakpoint gaps of the vanilla helpers, the prefixed Zero breakpoint of `order`, guards against values that are not one class token).
- Sass compile, over Foundation 6.9.0's settings file with `@import 'ngx-foundation-sites';` after Foundation and `@include nfs-flexbox-utilities;` after `foundation-flex-classes`:
  - Foundation's defaults emit exactly `:root { --nfs-flex-source-ordering-count: 6; }` and no other rule.
  - `$flex-source-ordering-count: 12` writes 12; `$flexbox-responsive-breakpoints: false` changes nothing the mixin writes.
  - `$flex-source-ordering-count: 12` writes `12`; `$breakpoint-classes: (small medium large xlarge)` writes `medium large xlarge`; `$breakpoint-classes: (medium large)` writes `medium large`.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in three engines:

- Breakpoints: `flexbox-utilities--responsive` at 400, 800, and 1100 px wide: the container is a column below `large` and a row from `large` up, and the third box shrinks below `large` and grows from `large` up (box geometry); `flexbox-utilities--source-ordering` at 400 and 800 px: the second DOM cell is shown first at 400 px and second at 800 px, while the DOM order is unchanged.
- Reflow (1.4.10): at 320 by 640 px, `document.documentElement.scrollWidth` is at most 320 in `flexbox-utilities--horizontal-alignment`, `--flex-container`, and `--responsive`.

Against the prerendered fixture app, on the Flexbox Utilities route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML at 400 and 1100 px; the layouts carry their classes and render their breakpoint forms before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

No manual assistive-technology test: the directives expose nothing to assistive technology.

## Out of Scope

- The Menu's `.align-left`, `.align-right`, and `.align-center` on a `ul[nfsMenu]`, and Foundation's vertical-menu link alignment built on them: the Menu's own `align` input sets them, because Foundation's Menu partial has its own rules for those names ([Spec: Menu](../issues/85-spec-menu.md)); the docs name the Menu's `align` for them (D7). Category: `scope-boundary`.
- Foundation's helper mixins (`flex`, `flex-align`, `flex-align-self`, `flex-order`, `flex-direction`) for the consumer's own classes: they are Sass for the developer's own stylesheet, not classes, so there is nothing to bind; the docs point to them for a component of the developer's own. Category: `scope-boundary`.
- An `order` of 0, an unprefixed `.order-<n>`, gap, wrap, and offset classes: Foundation's flex partial generates none of them, and the library adds no class Foundation lacks (AGENTS.md Styling Guidelines). To return an item to its source position at a larger breakpoint, every sibling takes an order there, as Foundation's own example does. Category: `other`.
- Foundation's Flexbox Mode switch (`$global-flexbox`, `foundation-everything`'s `$flex` argument): compile-time configuration, never an input (building-blocks 1.13); without the flex partial the classes have no CSS, and an alignment on an element that is not a Flex parent does nothing. Category: `scope-boundary`.
- The grids, the Button Group, the Media Object, the Card, and the Callout, whose directives the examples use: their own specs ([Spec: XY Grid](../issues/99-spec-xy-grid.md), [Spec: Flex Grid](../issues/101-spec-flex-grid.md), [Spec: Button Group](../issues/82-spec-button-group.md), [Spec: Media Object](../issues/91-spec-media-object.md), [Spec: Card](../issues/90-spec-card.md), [Spec: Callout](../issues/89-spec-callout.md)). Category: `scope-boundary`.
- Hiding a Flex parent: `@if`, a Toggler in Visibility mode (which also binds `.is-hidden`), or `nfsVisibility` with a bare `hideFor` ([Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)); the `hidden` attribute alone does not hide an element whose Foundation class sets `display` (Notes). Category: `scope-boundary`.
- Focus and reading that follow the visual order in a reordered flex container (CSS `reading-flow`): not Baseline widely available on 2026-05-07, so out of the Browser target (Platform features). Category: `platform-or-a11y`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Three attribute directives by the docs' roles, on any element: `[nfsFlexContainer]` (the vanilla container and its direction), `exportAs: 'nfsFlexContainer'`; `[nfsFlexAlign]` (a Flex parent's alignment), `exportAs: 'nfsFlexAlign'`; `[nfsFlexChild]` (a Flex child's size, self alignment, and order), `exportAs: 'nfsFlexChild'`; entry point `ngx-foundation-sites/flexbox-utilities` | ADR 0039: a utility family gets directives that set its Utility classes; Foundation's docs model is the flex parent and the flex child, and alignment works on flex parents that are not `.flex-container` (the grids, Button Group, Media Object, Card), so parent alignment is a directive of its own; names from Foundation's `.flex-container`, `flex-align` mixin, and `.flex-child-*` (building-blocks 1.3) | One directive with every input (a child's inputs on every parent and the reverse) (`other`); one directive per class family, seven attributes (`other`); `NfsFlexParent` with a `container` boolean (a second word for `.flex-container`) (`other`) |
| D2 | `alignX` and `alignY`, closed unions over Foundation's names, `left` included | Building-blocks 1.4 rule 3, named for the `$x` and `$y` of Foundation's `flex-align($x, $y)`, its docs' horizontal and vertical alignment; the Sass generates `.align-left` though the docs list four; two sets of names that do not exclude each other are two inputs | `align` for the horizontal names, as the Menu has it, with `alignY` (an asymmetric pair; the Menu's `align` is its own three-name family) (`other`); `justify` and `alignItems` (CSS names, not Foundation's) (`other`); one two-axis string, `@angular/flex-layout`'s `fxLayoutAlign` shape (two exclusive sets in one value) (`other`) |
| D3 | `alignSelf` on `NfsFlexChild`, over `NfsFlexAlignY` | The class template `align-self-` and Foundation's `flex-align-self($y)`; the same map as `alignY`, so one alias | An `alignSelf` on the grids' cell directives (a second owner of `.align-self-*`) (`other`) |
| D4 | `alignCenterMiddle`, a boolean, bound alone and never with `alignX` or `alignY` (documented usage 3) | Building-blocks 1.4 rule 4; measured, `.align-center-middle` and `.align-center.align-middle` differ in a wrapping parent (first line at 126 against 63 px in three engines), so they are two Variants; the central rule comes last in Foundation's CSS and overrides both axis classes | Mapping `alignX="center" alignY="middle"` to `.align-center-middle` (changes the look of wrapping parents) (`other`); a third `alignX` or `alignY` value (it sets both axes) (`other`) |
| D5 | `nfsFlexContainer` as the selector-named input: the bare attribute is `true`, a Breakpoint query with `up` selects the responsive form; `direction` a bare value or rules | ADR 0040: an on or off responsive family takes `true` or a query whose modifiers Foundation generates (only min-width forms); the Menu's `expanded` shape; a valued responsive family takes a bare value or rules; the Zero-breakpoint gap (Foundation generates no `.small-flex-container`) is filled | A `container` input beside a bare marker (a second attribute for the directive's own class) (`other`); one input per breakpoint (ADR 0040) (`superseded`) |
| D6 | `nfsFlexChild` as the selector-named input over the three sizes, bare or rules; the bare attribute sets none | The docs' vanilla helpers and their responsive example map one to one (`[nfsFlexChild]="{small: 'shrink', large: 'auto'}"`); the bare attribute marks a flex child that takes only `alignSelf` or `order`; the [Spec: Equalizer](../issues/34-spec-equalizer.md)'s CSS answer gets `nfsFlexChild="grow"` in place of Foundation's `.flex-child-grow` when this spec lands (What the later milestone changes, per spec) | A `flex` or `size` input (`size` is the grids' column count) (`other`) |
| D7 | `nfsFlexAlign` on a menu offers `justify`, `spaced`, `alignY`, and `alignCenterMiddle`; the docs name the Menu's `align` for `left`, `right`, and `center` (documented usage 4) | The Menu's partial has its own rules for those three names and `NfsMenu` sets them through `align` (its record binds them `true` or `false`), so a second binding on the same element would fight it; the other names are plain flex classes on a flex `ul`, which the Menu spec leaves to this spec | Forbidding `nfsFlexAlign` on menus altogether (leaves `.align-justify` and `.align-spaced` without a home) (`other`) |
| D8 | One owner: these directives set every class of the family on every element; other specs write them beside their directives or host them through `hostDirectives` exposing the same input names, and declare no inputs for these classes | ADR 0039's one owner per class; the [Spec: Button Group](../issues/82-spec-button-group.md) and the [Spec: Equalizer](../issues/34-spec-equalizer.md) compose these directives beside theirs once this spec lands (What the later milestone changes, per spec); building-blocks 1.9 allows hosting with inputs under their own names, and Angular 22 de-duplicates a directive written and hosted on one element (measured by the Menu ticket) | Alignment and order inputs on each grid and component (one family, five owners) (`other`) |
| D9 | The DOM order is the reading and focus order: a requirement, shown in every recipe and asserted by every story, never advice | WCAG 1.3.2 and 2.4.3; the directives cannot judge whether a rearrangement changes the meaning; the triage's hazard passes to this spec (ADR 0039, third considered option), stated the way ADR 0022's dated note states content requirements | Refusing `order` and the reverse directions (every Foundation class gets a typed input, ADR 0039) (`superseded`) |
| D10 | The docs state the part of the hazard a consumer keeps: focusable items are never shown out of DOM order, at any breakpoint; items that hold no focusable content may be reordered, and so may any set whose focusable items keep their DOM sequence, a set with at most one of them included (documented usage 5) | Measured: Tab follows the DOM (Chromium, Firefox), whatever `order` and `direction` show; axe has no rule; one focusable item cannot be out of order with itself, so Foundation's text-only example stays valid | Leaving 2.4.3 to the stories alone (a consumer's own reordered layouts would have no stated rule) (`other`) |
| D11 | `order` and the responsive keys are typed from the consumer's Variant declaration file, which the generator writes from `--nfs-flex-source-ordering-count` and the Breakpoint properties; `NfsFlexAlign` has only closed families | ADR 0040: the closed types reject an order above the count and a breakpoint the Sass lacks at compile time; the alignment families read no property; the responsive helpers' flag changes whether classes exist, not their names, so it is documented usage 6 | Typing the responsive helpers' keys from the flag (the generator reads no flag) (`other`) |
| D12 | One `computed` `[class]` list per directive; copied classes not stripped, and the docs name the input for each (documented usage 1) | The Button, Label, and Callout rule for class lists; a record holding every owned class as `false` would fight `NfsMenu`'s record for `align-*` on a menu, and the order and responsive families depend on the consumer's count and Class breakpoints, which a record cannot list at compile time | A class record that strips copied classes (the Menu's shape) (`other`) |
| D13 | `nfsFlexAlign` goes on a Flex parent and `nfsFlexChild` inside a Flex or grid parent (documented usage 2) | An alignment on a block element or a flex child in a block parent does nothing, silently; a host with a responsive container class is a Flex parent from its breakpoint up; a grid parent takes `order` and `align-self` | Requiring a Flex parent at every breakpoint (a layout may be a Flex parent only from a breakpoint up by design) (`other`) |
| D14 | The `nfs-flexbox-utilities` Library mixin, one property only: `--nfs-flex-source-ordering-count` | ADR 0012 and ADR 0040: an entry point with an Open Variant family always has a Library mixin; one writer per property; `$flexbox-responsive-breakpoints` is a flag, which the generator does not read, because it changes whether classes exist, not their names (documented usage 6) | `nfs-flex-classes`, named after the export mixin (the Top Bar rule applies to a page with several export mixins) (`other`); a property for the flag (nothing reads it) (`other`) |
| D15 | Native implementation level; no Aria, no CDK; listener-free | CSS flexbox is the mechanism; nothing to announce, no key to handle; host bindings render on the server | `@angular/flex-layout`'s JavaScript media observer and inline styles (deprecated upstream; the classes and media queries already render on the server) (`deprecated-upstream`) |
| D16 | Physical names stay physical: no `Directionality` mapping of `left` and `right` | Foundation compiles them against `$global-text-direction` and the docs name them so; measured, `.align-right` in a `dir="rtl"` region of a left-to-right compile puts items at the left edge, the Menu's documented behaviour; mapping them in JavaScript would fight a right-to-left compile | Swapping `left` and `right` by `Directionality` (`other`) |
| D17 | Nine stories, e2e only for breakpoint geometry, reflow, and the fixture app | Breakpoints need real viewports; the play functions cover classes and computed styles in Chromium; that focus follows the DOM was measured once and is platform behaviour | An e2e Tab sweep in three engines (WebKit does not move focus to links by default) (`other`) |
| D18 | Three glossary terms: **Flex parent**, **Flex child**, **Source ordering** | Foundation's own words for the roles and the feature, which the Card, Equalizer, Button Group, and grid specs also use; **Flex parent** is distinct from the `.flex-container` class, one way to make one | "Flex container" and "flex item" as the terms (CSS's words, and "flex container" is also Foundation's class) (`other`) |

### Usage examples

```html
<!-- Two actions that stack on phones and form a row from medium up; alignX moves them along the row,
     and along the column below medium, where the column is only as tall as its buttons -->
<div nfsFlexContainer [direction]="{small: 'column', medium: 'row'}" alignX="right">
  <button nfsButton>Save draft</button>
  <button nfsButton color="primary">Publish</button>
</div>

<!-- Equal-height callouts inside grid cells (the Equalizer spec's CSS answer) -->
<div nfsGridX gridMarginX>
  <div nfsCell [size]="{medium: 4}" nfsFlexContainer direction="column">
    <div nfsCallout nfsFlexChild="grow">...</div>
  </div>
  <div nfsCell [size]="{medium: 4}" nfsFlexContainer direction="column">
    <div nfsCallout nfsFlexChild="grow">...</div>
  </div>
</div>

<!-- A cell that is a flex child of its grid and a flex parent of its content -->
<div nfsGridX>
  <div nfsCell size="6" nfsFlexChild alignSelf="top" nfsFlexContainer alignY="middle">...</div>
</div>

<!-- Media object sections aligned one by one (NfsMediaObject and NfsMediaObjectSection, from ngx-foundation-sites/media-object) -->
<div nfsMediaObject>
  <div nfsMediaObjectSection nfsFlexChild alignSelf="middle">...</div>
  <div nfsMediaObjectSection>...</div>
</div>
```

```ts
@Component({
  selector: 'app-product-summary',
  imports: [NgOptimizedImage, NfsButton, NfsFlexChild, NfsGridX, NfsCell],
  template: `
    <div nfsGridX>
      <!-- The text comes first in the DOM, the order it is read in; the photo is shown first from large up.
           Only the text cell holds focusable content, so focus still follows what is shown. -->
      <div nfsCell [size]="{small: 12, large: 6}" nfsFlexChild [order]="{large: 2}">
        <h2>{{ product().name }}</h2>
        <p>{{ product().summary }}</p>
        <button nfsButton (click)="addToCart()">Add to cart</button>
      </div>
      <div nfsCell [size]="{small: 12, large: 6}" nfsFlexChild [order]="{large: 1}">
        <img [ngSrc]="product().image" alt="" width="600" height="400" />
      </div>
    </div>
  `,
})
export class ProductSummary {
  readonly product = input.required<Product>();

  protected addToCart(): void {
    // ...
  }
}
```

The consumer's Variant declaration file, as the library's tooling generates it from `$flex-source-ordering-count: 12;` and `$breakpoint-classes: (small medium large xlarge);`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsFlexSourceOrderingCountOverrides {
    count: 12;
  }
  interface NfsBreakpointClassesOverrides {
    xlarge: true;
  }
}
```

With it, `[order]="{xlarge: 12}"` compiles; `order="13"` fails to compile (ADR 0040). `NfsButton`, `NfsGridX`, `NfsCell`, `NfsCallout`, `NfsMediaObject`, and `NfsMediaObjectSection` are shown only to place them; `NfsGridX` and `NfsCell` are the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s, and `NfsMediaObject` and `NfsMediaObjectSection` the [Spec: Media Object](../issues/91-spec-media-object.md)'s.

### Platform features to adopt when the browser target moves

- CSS `reading-flow` (`flex-visual`) makes focus and reading follow a flex container's visual order. It was not Baseline widely available on 2026-05-07; once it is, the spec can add it to reordered containers and relax documented usage 5 there.

### Foundation behaviour changed or dropped

- Every class is set by a directive input; the consumer writes none (ADR 0039).
- The docs' ordering example gains a requirement: DOM order is the reading and focus order, and focusable content is never shown out of it (D9, D10).
- `.align-left` is offered though the docs omit it, because the Sass generates it (D2).
- `.align-left`, `.align-right`, and `.align-center` on a menu belong to the Menu's `align` (D7).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This family relies on Foundation's export mixin `foundation-flex-classes` (part of `foundation-everything` while its `$flex` argument is true), configured through `$flex-source-ordering-count`, `$flexbox-responsive-breakpoints`, `$breakpoint-classes`, and `$global-text-direction`. Its documented custom CSS is the `nfs-flexbox-utilities` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-flex-classes`.

1. Rules: `:root { --nfs-flex-source-ordering-count: <count>; }`, the Variant property in (6), and nothing else. Reason: the Variant declaration file's generator must read the count, and Foundation writes none. No layout rule: Foundation's classes do the layout, and nothing in this family fails WCAG 2.2 AA through its CSS.
2. Reused, read from the consumer's compile: `$flex-source-ordering-count`. The mixin takes no parameters.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: no layout changes; the Variant property is absent, so the Variant declaration file's generator cannot read a changed `$flex-source-ordering-count`; the include is part of the documented setup (D14).
6. Variant properties: `--nfs-flex-source-ordering-count`, the count (6 by default), never empty. Only `nfs-flexbox-utilities` writes it.

No required setting: Foundation's defaults pass.

### Notes

- The `hidden` attribute alone does not hide a Flex parent: Foundation's `.flex-container` and `.grid-x` set `display` after normalize's `[hidden] { display: none }` at equal specificity (measured in Chromium, Firefox, and WebKit), as building-blocks 1.10 records. Remove it with `@if`, or hide it with a Toggler in Visibility mode, which binds Foundation's `.is-hidden` ([Spec: Toggler](../issues/17-spec-toggler.md), D3), or with `nfsVisibility` and a bare `hideFor` ([Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)); the Thumbnail, Float Classes, XY Grid, and Flex Grid specs state the same rule for their classes. Both classes set `display: flex` there.
- Column parents: Foundation's names assume a row. In a column container (`direction="column"`, the XY Grid's vertical grid), `alignX` moves children along the column and `alignY` across it.
- Right to left: Foundation compiles `left` and `right` against `$global-text-direction`. In a right-to-left compile `.align-right` still means the right edge; inside a `dir="rtl"` region of a left-to-right compile, `alignX="right"` gives `flex-end`, the region's left edge (D16). `justify`, `spaced`, and `center` read the same in both.
- On an XY grid cell, the grid's own `auto` and `shrink` cell sizes are the grid's sizing; `nfsFlexChild`'s sizes are the vanilla helpers' (`flex: 1 1 auto` and `0 1 auto`, against the grid's `1 1 0` and `0 0 auto`) and belong on boxes inside a Flex parent.
- A Sticky container cell ([Spec: Sticky](../issues/28-spec-sticky.md)) with an `alignSelf` other than `stretch` no longer stretches to its row, so it is only as tall as its sticky element; the Sticky spec documents it.
- `wrap-reverse` also changes the visual order; no Foundation class sets it, so it is the consumer's own CSS, under the same rule as documented usage 5.

### What the later milestone changes, per spec

In the first milestone no spec names this spec's directives or links to it. Where a first-milestone spec needs a Flexbox Utility class, its examples, stories, and tests write Foundation's own class as a normal class, with Foundation's global styles loaded ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md), decisions 2 and 5). When this spec lands, the later milestone replaces those classes with this spec's directives and gives each spec back the sentences that name them. The list is read from the directives each spec wrote before the ruling; [Re-run: specs without the later-milestone families, group a](../issues/176-rerun-specs-without-later-families-group-a.md), [Re-run: specs without the later-milestone families, group b](../issues/177-rerun-specs-without-later-families-group-b.md), and [Re-run: specs without the later-milestone families, group c](../issues/178-rerun-specs-without-later-families-group-c.md) hold the class forms each spec writes now.

- [Spec: Button Group](../issues/82-spec-button-group.md): the group's alignment classes, `align-center`, `align-right`, `align-spaced`, and `align-justify`, become `nfsFlexAlign` with `alignX` beside `nfsButtonGroup`.
- [Spec: Card](../issues/90-spec-card.md): the equal-height recipe's cells, `class="cell flex-container"`, get `nfsFlexContainer`.
- [Spec: Equalizer](../issues/34-spec-equalizer.md): the CSS answer's cells, `class="flex-container flex-dir-column"`, and boxes, `class="flex-child-grow"`, become `nfsFlexContainer direction="column"` and `nfsFlexChild="grow"`, and the block grid's cells `nfsFlexContainer`, in the examples, the stories, and the SSR smoke.
- [Spec: Forms](../issues/98-spec-forms.md): the Label Positioning grid's `align-center` becomes `nfsFlexAlign alignX="center"` beside the grid.
- [Spec: Media Object](../issues/91-spec-media-object.md): flexbox-build alignment, `align-self-<y>` on a section and `align-<x>` or `align-<y>` on the media object, becomes `nfsFlexChild alignSelf` beside `nfsMediaObjectSection` and `nfsFlexAlign` beside `nfsMediaObject`, in that spec's user stories, the `alignment` JSDoc, its composition decision, the examples, and `media-object--section-alignment`.
- [Spec: Menu](../issues/85-spec-menu.md): `align-justify` and `align-spaced` on a plain menu, and source ordering on its items, become `nfsFlexAlign` and `nfsFlexChild`.
- [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md): the registry `NfsFlexSourceOrderingCountOverrides` with `--nfs-flex-source-ordering-count`, `nfs-flexbox-utilities` among the Library mixins, and the manifest rows of the three directives come back.
