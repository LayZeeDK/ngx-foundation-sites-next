# Spec: Equalizer

Ticket: [Spec: Equalizer](../issues/34-spec-equalizer.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Decided upstream in ADR 0001 (Directive-first), ADR 0005 and ADR 0014 (Breakpoint service), ADR 0008 (Rendering-modes contract), ADR 0012 (Sass packaging), ADR 0021 (`min-height`), and ADR 0039 and ADR 0040 (the class rule and Variant input types); the decision log with sources is in the ticket answer, and the class-rule revision of 2026-09-28 is in its amendment and in [Re-run: Equalizer spec under the class rule](../issues/126-rerun-equalizer-class-rule.md).

## Problem Statement

A developer building on Foundation for Sites wants a row of boxes (callouts, cards, panels) to share one height, so their borders and backgrounds line up. Foundation's Equalizer Plugin does it with jQuery: it marks a container with `data-equalizer`, marks the boxes with `data-equalizer-watch`, reads every box's `offsetHeight`, and writes the tallest value back as an inline `height`, again on every debounced window resize, on every child-list or `style` mutation inside the container, and once after the images inside it load.

That design has four problems in an Angular library that must render on the server:

- It is JavaScript for a layout job. The Plugin predates flexbox and CSS grid; Foundation's own XY grid is a flex row whose cells already stretch to one height (`align-items: stretch`), and CSS grid with `grid-auto-rows: 1fr` or `subgrid` covers the cases flexbox cannot. CSS equalizes before the first paint, on the server-rendered HTML, with JavaScript off, inside `@defer (hydrate never)` blocks, and whenever content changes, with no measurement at all.
- A fixed inline `height` clips or overflows content that grows afterwards: text enlarged by the user (WCAG 1.4.4, 1.4.12), a web font that loads late, an image that loads after the pass. Foundation hides the problem behind a 250 ms resize debounce and a MutationObserver that catches only DOM and `style` changes.
- Nothing measured exists on the server. Every JavaScript height is written after hydration, so the page shifts at hydration.
- Its coordination is jQuery-shaped: string names to separate nested groups (`data-equalizer="foo"` and `data-equalizer-watch="foo"`), bubbled `postequalized` events so an outer group re-measures after an inner one, and `data-resize`/`data-mutate` attributes that feed a global Triggers listener.

What remains after CSS is a small residue: boxes that are not items of one flex line or grid and whose markup the developer cannot restructure (Foundation's legacy float grid, inline-block lists, content from a CMS, boxes at unrelated depths), and the wish to keep Foundation's flex-based XY grid while making every wrapped row the same height.

## Solution

The spec answers in two parts, CSS first. Under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) neither part has the developer write a Foundation or library class: Equalizer has no class of its own, and the classes of the grids and the boxes are set by the directives of their own specs, written beside the Equalizer's.

1. CSS guidance, with no Equalizer directive: for boxes inside XY grid cells, Foundation's own CSS does it. The cell is a column flex container and the box a growing flex child, classes that the Flexbox Utilities directives set beside the XY Grid's `nfsCell`, and each wrapped row equalizes separately, which is Foundation's `equalizeByRow`. For one height across every row, or across a stacked column, the developer's own CSS grid rule on the developer's own class uses `grid-auto-rows: 1fr`; for aligning parts of cards across a row, `grid-template-rows: subgrid`. Every feature is in the Browser target, and the directives that set the classes bind them on their hosts, so the server-rendered HTML carries them and is equal at first paint, with no library code measuring anything. The usage examples start here, and the stories test it.
2. An optional pair of directives for the residue: `nfsEqualizer` on the container and `nfsEqualizerWatch` on each box. Each `nfsEqualizerWatch` registers its watched element with the nearest equalizer through DI (no names). The container observes the boxes and itself with one `ResizeObserver`, and on each signal runs one pass in an `afterRenderEffect`: clear the inline `min-height` it wrote, measure, then give every box except the tallest of its row `min-height` equal to that tallest height. The tallest box keeps its natural height, so any growth or shrinkage anywhere changes an observed size and triggers the next pass; images that load, fonts that swap, text that is enlarged, and panels that open are all caught without an image loader or a MutationObserver. `equalizeOn`, `equalizeOnStack`, and `equalizeByRow` keep Foundation's meaning; `equalizeOn` goes through the Breakpoint service. One output, `equalized`, reports the row heights applied.

What earns the directive its place, stated plainly: not Foundation parity. A developer on the XY grid should not use it; the stories and the docs say so. It exists because Foundation 6.9 still ships markup that CSS cannot equalize without restructuring (the float grid, non-grid lists) and because a drop-in counterpart of `data-equalizer` lets such pages move to Angular without a layout rewrite. Whether that residue justifies shipping the directive in the first release was decided at triage on 2026-09-26: ship it, small and optional (impact HIGH, because a shipped directive is public API; confidence HIGH, because the map's Destination asks for a directive or component per plugin and the residue is real).

## User Stories

1. As an application developer, I want the docs to tell me first how to equalize boxes with Foundation's own layout CSS, set by the XY Grid and Flexbox Utilities directives, so that no JavaScript measures anything for a layout job.
2. As an application developer, I want callouts inside XY grid cells to share one height with the Flexbox Utilities' column flex container on the cell and their grow child on the callout, so that only Foundation's own styles do the work and I write none of its classes.
3. As an application developer, I want each wrapped row of a block grid (`nfsGridX` with `[up]="{small: 1, medium: 2, large: 4}"`) to equalize on its own with CSS, so that I get Foundation's `equalizeByRow` without an Equalizer directive.
4. As an application developer, I want every row of a wrapping gallery to share one height through `grid-auto-rows: 1fr`, so that the non-by-row case also needs no JavaScript.
5. As an application developer, I want card dividers and sections to line up across a row of cards through `subgrid`, so that nested equalization needs no nested Plugin.
6. As an application developer, I want the CSS answer to stack naturally below my breakpoint because the XY grid cells go full width, so that I get `equalizeOn="medium"` for free.
7. As a user on a slow connection, I want equal heights in the server-rendered HTML, so that the page does not jump when JavaScript arrives.
8. As a user with JavaScript disabled, I want equal heights anyway, so that the layout is right without scripts.
9. As an application developer maintaining pages on Foundation's float grid, I want `nfsEqualizer` and `nfsEqualizerWatch` as a drop-in for `data-equalizer` and `data-equalizer-watch` beside the Float Grid directives, so that I can move to Angular without restructuring the layout.
10. As an application developer, I want watched elements to find their equalizer through DI, so that I never invent group names.
11. As an application developer, I want an inner `nfsEqualizer` to take its own watched elements away from the outer one automatically, so that nested groups need no `foo`/`bar` names.
12. As an application developer, I want one element to be both a watched element of the outer group and the container of an inner group, as in Foundation's nesting example, so that Foundation's docs markup keeps working.
13. As an application developer, I want the outer group to re-equalize after an inner group changes its boxes, without events between them, so that nesting just works.
14. As an application developer, I want `equalizeOn` to accept Foundation's Breakpoint queries (`medium`, `medium up`, `large only`, `medium down`), so that the directive switches itself on and off like Foundation's.
15. As an application developer, I want the directive to clear the heights it wrote when `equalizeOn` stops matching, so that stacked layouts show natural heights.
16. As an application developer, I want heights cleared when every box sits on its own row, unless I set `equalizeOnStack`, so that stacked mobile layouts are not padded.
17. As an application developer, I want `equalizeOnStack` to keep boxes equal even when stacked, so that I can have Foundation's "equalize on stack" panels.
18. As an application developer, I want `equalizeByRow` to equalize each visual row separately, so that a wrapping gallery does not take the height of its single tallest item.
19. As an application developer, I want rows detected by position rather than by DOM order, so that reordered or projected items are grouped correctly.
20. As a user who enlarges text, I want boxes to grow with their content instead of clipping it, so that no text overlaps or disappears.
21. As an application developer, I want images that load after the first pass to re-equalize the group, so that I need no image loader.
22. As an application developer, I want content that grows or shrinks after load (async data, an opened accordion, a swapped font) to re-equalize the group, so that the heights never go stale.
23. As an application developer, I want a group inside a hidden tab or toggled panel to equalize when it is shown, so that I do not have to notify it.
24. As an application developer, I want watched elements added or removed by `@for`, `@if`, or a nested `@defer` block to join or leave the group, so that dynamic lists work.
25. As an application developer, I want an `equalized` output with the row heights, so that I can react to the final layout and tell an applied state from a cleared one.
26. As an application developer, I want `equalize()` on the directive reference, so that I can force a pass after a layout change the observers cannot see (reordering items of equal size).
27. As an application developer, I want application-wide defaults for the three Options through a Defaults token, so that I set them once like `Foundation.Equalizer.defaults`.
28. As an application developer, I want `hostDirectives: [NfsEqualizerWatch]` to work on my own card component, with `NfsCallout` hosted beside it when the component is a callout, so that the component is a watched element wherever it is used and its host metadata names no Foundation class.
29. As an application developer, I want a development-mode warning when an `nfsEqualizerWatch` has no equalizer, so that I notice one declared outside the equalizer's template.
30. As an application developer, I want the directive to write no styles on the server and nothing before hydration, so that hydration never reports a mismatch.
31. As an application developer, I want no event listeners from the directive, so that it adds no `jsaction` and nothing to replay.
32. As an application developer, I want no `ResizeObserver loop` errors in my console or in my ErrorHandler, so that the directive does not raise noise in monitored applications.
33. As an application developer, I want one measurement layout per pass, so that the directive costs less than Foundation's interleaved reads and writes.
34. As an application developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
35. As an application developer, I want the directive in its own entry point, so that a `@defer` block can split it.
36. As a screen reader user, I want the reading order untouched, so that equalizing never changes what I hear.
37. As a user who prefers reduced motion, I want height changes applied instantly without animation, so that nothing moves on its own.
38. As a library maintainer, I want the CSS recipes tested in stories next to the directive, so that the recommended path cannot regress unnoticed.
39. As a library maintainer, I want the row-planning logic as a pure function, so that it is tested in node without a browser.
40. As a library maintainer, I want viewport and hydration behaviour asserted in Playwright, so that breakpoint switching and the hydration shift are tested where they happen.
41. As a user who zooms to 400 percent, I want equalized boxes to reflow into one column at 320 CSS px without sideways scrolling or clipped text, so that the page meets WCAG 2.2 AA 1.4.10.
42. As a user who applies my own text-spacing styles, I want every box to keep all its text visible, so that the page meets WCAG 2.2 AA 1.4.12.
43. As an application developer, I want the CSS answer's grid, flex, callout, and card classes set by their own directives, so that I write no Foundation class and the server HTML still carries every class for the first paint.
44. As an application developer, I want the spec's CSS recipes to select only my own classes and elements, so that my stylesheet names no Foundation or library class.

## Implementation Decisions

### Foundation contract

From the Plugin source, `Equalizer.defaults`, its docs page, and the forms-and-media inventory (Equalizer section). Equalizer has no Sass partial and no CSS class of its own.

| Foundation | Behaviour | Library counterpart |
| --- | --- | --- |
| `data-equalizer[="name"]` on the container | Marks the group; the value names it for nesting | `nfsEqualizer`; the name is Dropped (`jquery-or-dom-plumbing`): DI scopes groups |
| `data-equalizer-watch[="name"]` on descendants | Watched elements: those with the matching value, or every `[data-equalizer-watch]` descendant if none match | `nfsEqualizerWatch`; registers with the nearest equalizer; the value is Dropped (`jquery-or-dom-plumbing`) |
| `equalizeOnStack` (boolean, default `false`) | When the first two watched elements have different `getBoundingClientRect().top`, heights go back to `auto` | `equalizeOnStack` input, same default; "stacked" means every row holds one watched element (order-independent; see Deltas) |
| `equalizeByRow` (boolean, default `false`) | Groups by `offset().top` (consecutive runs in DOM order) and equalizes per row; one-element rows get `auto` | `equalizeByRow` input, same default; rows grouped by rounded top, in any DOM order |
| `equalizeOn` (string, default `''`) | `MediaQuery.is(equalizeOn)`; below it listeners are unbound and heights reset | `equalizeOn` input, same default, through `NfsMediaQuery.is()`, which answers `true` for `''` |
| Inline `height: <max>px` on watched elements | Tallest `offsetHeight` written to every watched element | Inline `min-height` on every watched element except the tallest of its row (see Deltas) |
| `data-resize`, `data-mutate` on the container | Hooks for the Triggers utility's global resize and mutation listeners | Dropped (`jquery-or-dom-plumbing`): one `ResizeObserver` |
| `resizeme.zf.trigger` (window resize, 250 ms debounce) | Re-equalize | Replaced (`superseded`): `ResizeObserver` on the watched elements and the container |
| `mutateme.zf.trigger` (child-list or `style` mutation in the subtree; also fired by Tabs, Toggler, ResponsiveToggle after showing content) | Re-equalize | Replaced (`superseded`): `ResizeObserver`; a mutation that changes no observed size needs no pass, and showing hidden content changes sizes |
| `onImagesLoaded` before the first pass | Waits for images | Dropped (`superseded`): an image that changes a box's size triggers the observer |
| `changed.zf.mediaquery` | Re-checks `equalizeOn` | Reactive read of `NfsMediaQuery.is()` inside the render effect |
| `preequalized.zf.equalizer`, `postequalized.zf.equalizer` | Around every pass | `equalized` output with the row heights, emitted when they change; the "pre" event is Dropped (`superseded`: building-blocks 1.4 has no start events) |
| `preequalizedrow.zf.equalizer`, `postequalizedrow.zf.equalizer` | Around each row in by-row mode | Dropped (`superseded`): the row heights are the `equalized` payload |
| `postequalized` bubbled from a nested group | Outer group re-measures after the inner one | Replaced (`superseded`): the inner group's writes change an outer watched element's size |
| `getHeights`, `getHeightsByRow`, `applyHeight`, `applyHeightByRow` (public) | Measure and apply | Dropped (`superseded`): the pass measures and applies; `equalize()` requests a pass |
| `_destroy()` | Unbinds and resets heights to `auto` | Dropped (`superseded`): the observer disconnects on destroy, and a directive's element is destroyed with it, so nothing needs resetting |
| `init.zf.equalizer`, `destroyed.zf.equalizer` | Lifecycle | Dropped (`superseded`): Angular lifecycle |
| `Equalizer.defaults.x = ...` | Global defaults | `nfsEqualizerDefaultsToken` |

Dropped options: the `data-equalizer` and `data-equalizer-watch` values (group names; `jquery-or-dom-plumbing`) and `data-options` (`jquery-or-dom-plumbing`). Nothing else: all three `defaults` keys map.

Deltas from Foundation, each deliberate:

- `min-height`, not `height`, and the tallest box untouched. A fixed `height` clips or overflows content that grows after the pass and hides that growth from a `ResizeObserver`, because the box size no longer changes; `min-height` lets content grow, and leaving the row's tallest element at its natural height lets its shrinkage show up too. Cost: a percentage `height` inside a watched element no longer resolves (a `min-height` does not make the height definite); a flex column inside the box (the Flexbox Utilities' column container with a grow child) replaces it.
- "Stacked" means every row holds exactly one watched element. Foundation compares only the first two in DOM order, so a wide first item on its own row switched off a whole gallery; registration order is not DOM order under `@for` reorders and projection, and this definition needs no order.
- Rows are grouped by `getBoundingClientRect().top` rounded to whole CSS pixels, in any order. Foundation starts a new row whenever the next element in DOM order has a different top, so an item placed out of DOM order split a row, and a sub-pixel difference at browser zoom did too.
- Heights are measured with `offsetHeight` (Foundation's measure: layout box, ignores transforms, integer px) after one batched reset, not with one interleaved write and read per element. Like Foundation, the written value assumes `box-sizing: border-box`, which Foundation's global styles set on every element.

### CSS class to Angular mapping

Equalizer has no Structural class, no Variant class, and no State class: Foundation ships no Equalizer Sass, and its Plugin writes only an inline `height`. `NfsEqualizer` and `NfsEqualizerWatch` therefore bind no class on their hosts, have no Variant input, declare no Variant registry, and write no Variant property; per building-blocks 1.3 they are named after the Plugin. Under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) the classes on the elements they sit on, and on every element of the CSS answer, are set by the directives of their own specs, written beside them, never by the developer:

| Foundation class | Kind | Element | Set by | Owner and rationale |
| --- | --- | --- | --- | --- |
| (none of Equalizer's own) | -- | The container carrying `nfsEqualizer`; each watched element carrying `nfsEqualizerWatch` | Neither directive binds a class or attribute | This spec. `data-equalizer` and `data-equalizer-watch` are attributes, not classes; the directives' only DOM write is the inline `min-height` of the pass |
| `.grid-x`, `.cell`, and the cell sizes (`.small-4`, `.medium-4`) | Utility classes of the XY Grid | The grid and its cells (the CSS answer, `equalizer--docs-markup`) | `NfsGridX` (`[nfsGridX]`) and `NfsCell` (`[nfsCell]`) with its `size` Variant input (`size="4"`, `[size]="{medium: 4}"`) | [Spec: XY Grid](../issues/99-spec-xy-grid.md). The cells of one line already share one height (`flex-flow: row wrap`, stretch by default) |
| `.small-up-1`, `.medium-up-2`, `.large-up-4` (block grid) | Utility classes of the XY Grid | The grid | `NfsGridX`'s `up` Variant input (`[up]="{small: 1, medium: 2, large: 4}"`) | [Spec: XY Grid](../issues/99-spec-xy-grid.md). Wrapped lines stretch separately: the by-row case |
| `.grid-margin-x`, `.grid-padding-x` (the gutters in Foundation's examples) | Utility classes of the XY Grid | The grid | `NfsGridX`'s `gridMarginX` and `gridPaddingX` | [Spec: XY Grid](../issues/99-spec-xy-grid.md). Gutters change spacing, not equalization |
| `.flex-container`, `.flex-dir-column` | Utility classes of the Flexbox Utilities | A cell of the CSS answer | `NfsFlexContainer` (`nfsFlexContainer`) with `direction="column"` | [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md). Makes the stretched cell a column its box can fill |
| `.flex-child-grow` | Utility class of the Flexbox Utilities | The box in such a cell | `NfsFlexChild` (`nfsFlexChild="grow"`) | [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md). `flex: 1 0 auto`: the box takes the cell's remaining height |
| `.callout` and its Variant classes | Structural class of the Callout | The boxes in the examples and stories | `NfsCallout` (`[nfsCallout]`) with its `color` and `size` Variant inputs, beside `nfsEqualizerWatch` or the flex child directive | [Spec: Callout](../issues/89-spec-callout.md) |
| `.card`, `.card-divider`, `.card-section` | Structural classes of the Card | The cards of the CSS answer and of the subgrid recipe | `NfsCard` (`[nfsCard]`), `NfsCardDivider` (`[nfsCardDivider]`), `NfsCardSection` (`[nfsCardSection]`) | [Spec: Card](../issues/90-spec-card.md). `.card` is a column flex container with `flex-grow: 1` under `$global-flexbox`, so a card fills a flex cell with the container directive alone |
| `.row`, `.column`, and the column sizes (legacy float grid, `foundation-grid`) | Utility classes of the Float Grid | The container and columns of the residue | `NfsRow` (`[nfsRow]`) and `NfsColumn` (`[nfsColumn]`) with a `size` Variant input (`[size]="{medium: 6}"`) | [Spec: Float Grid](../issues/100-spec-float-grid.md). The residue: floats never stretch, so these boxes need the directive |
| `.is-hidden` | State class of the Toggler | The container of `equalizer--hidden-then-shown` | `NfsToggler`'s host binding (Visibility mode) | [Spec: Toggler](../issues/17-spec-toggler.md) |
| `.button` | Structural class of the Button | Story controls | `NfsButton` (`button[nfsButton]`) | [Spec: Button](../issues/37-spec-button.md) |

`NfsCallout`, `color`, and `size` are the Callout spec's names, `NfsToggler` the Toggler spec's, and `NfsButton` the Button spec's. `NfsGridX`, `NfsCell`, `size`, `up`, and `gridMarginX` are the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s; `nfsFlexContainer` with `direction` and `nfsFlexChild` are the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s names; `NfsRow` and `NfsColumn`, with the column's `size`, are the [Spec: Float Grid](../issues/100-spec-float-grid.md)'s; `NfsCard`, `NfsCardDivider`, and `NfsCardSection` are the out-of-scope triage's. The XY Grid, Flexbox Utilities, Float Grid, and Card specs own those names, and the class-rule consistency review aligns this spec's examples if their final names differ.

The three Options are not Variant inputs: they set no class. `equalizeOnStack` and `equalizeByRow` keep `booleanAttribute`, and `equalizeOn` keeps the Breakpoint service's open query string (building-blocks 1.4 and 1.7), so no Variant registry, Variant property, or Runtime check is involved, and no directive of this entry point calls `nfsVariantCheck`.

### Hierarchy and DI shape

```
[nfsEqualizer]                         NfsEqualizer: provides nfsEqualizerToken (useExisting)
  |-- [nfsEqualizerWatch]              NfsEqualizerWatch: inject(nfsEqualizerToken, {optional, skipSelf})
  |-- [nfsEqualizerWatch][nfsEqualizer] one element: a watched element of the outer group and the inner container
  |     |-- [nfsEqualizerWatch]        registers with the inner group (nearest provider)
  |     '-- [nfsEqualizerWatch]
  '-- [nfsEqualizerWatch]
```

- Parent handle: `nfsEqualizerToken = new InjectionToken<NfsEqualizer>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsEqualizerToken (provided by NfsEqualizer from 'ngx-foundation-sites/equalizer' on an ancestor element declared in the same template)" : '')`, its description in development builds only, declared with a type-only import of the class (building-blocks 1.9). `NfsEqualizer` provides it with `useExisting`.
- `NfsEqualizerWatch` injects it with `{optional: true, skipSelf: true}` and registers its host element at construction (no inputs to wait for), unregistering through `DestroyRef`. `skipSelf` starts at the parent element injector, so a watched element that also carries an inner `nfsEqualizer` joins the outer group, which is Foundation's nesting example.
- Nested groups: an inner `nfsEqualizer` provides the token itself, and that provider is what keeps its watched elements out of the outer group. Nothing re-provides the token as `undefined`. The `CdkAccordionItem` pattern that building-blocks 1.9 names solves a different problem (an item that is not itself a container), and here an `undefined` provider on the watch directive would collide with the inner equalizer's provider on the element both share.
- An `nfsEqualizerWatch` with no equalizer does nothing, and its In-family parent check (below) reports it once in development builds: as out of reach when an `nfsEqualizer` ancestor is declared in another template, and otherwise as standing outside any equalizer, with the family's sentence. DI follows the declaration site: an equalizer inside a child component's own template does not see watched elements projected into it; the equalizer goes on an element of the template that declares them, or on the projecting component's host, or the component renders them inside the equalizer's element through a template outlet with that element's injector (the shared spec's template-outlet pattern).
- Registration: parent-owned, into a signal holding the registered elements. The set is unordered, because nothing in the algorithm depends on order; no DOM-order sort and no MutationObserver are needed (building-blocks 1.9's sorted-collection rule applies to ordered children only).
- Class directives beside the pair (ADR 0039): `nfsCallout`, the grid, column, and cell directives, and the card directives sit on the same elements as `nfsEqualizer` and `nfsEqualizerWatch`, placed beside them and never hosted, so each class keeps one owner. None of them provides `nfsEqualizerToken`, so registration and nesting work as above, and neither Equalizer directive reads a class from its host.
- `hostDirectives: [NfsEqualizerWatch]` on a consumer component makes its host a watched element; the directive has no inputs to expose. A component that is also a callout hosts `NfsCallout` beside it (`hostDirectives: [NfsCallout, NfsEqualizerWatch]`) instead of writing `class` in its host metadata. Angular runs the content queries of every directive on a node, host directives included, so the callout's close-button query works there too. The component gives its host `display: block`: a custom element is inline, where `min-height` has no effect and `offsetHeight` measures line boxes.
- Defaults token: `nfsEqualizerDefaultsToken`, `InjectionToken<NfsEqualizerDefaults>` with an all-optional `{equalizeOn?, equalizeOnStack?, equalizeByRow?}`, read with `inject(..., {optional: true})` to seed the input defaults (building-blocks 1.4, Material shape B). Nearest provider wins.
- Service: `NfsMediaQuery` for `is(equalizeOn)`, exactly as the Breakpoint service spec defines it.
- Entry point: `ngx-foundation-sites/equalizer`, importing the Breakpoint service's entry point and no grid, flex, callout, or card entry point.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsEqualizer` calls `nfsDirectiveCheck('NfsEqualizer', {children: ['NfsEqualizerWatch']})` and probes the `nfsEqualizerWatch` elements whose nearest `nfsEqualizer` ancestor is its host, so an inner group keeps its own, and the shared element of Foundation's nesting example, whose own `nfsEqualizer` is not its ancestor, belongs to the outer group, as its `skipSelf` registration does; it has no parent check. `NfsEqualizerWatch` calls `nfsDirectiveCheck('NfsEqualizerWatch', {parent: {directives: ['NfsEqualizer'], found: this.#equalizer !== null, alone: 'It belongs to no group, so no equalizer sets its min-height.'}})` and probes nothing; no library directive hosts `NfsEqualizer`, so it is the one parent directive, and the parent check replaces the spec's earlier "found no nfsEqualizer" warning, so the part reports once. Neither has a peer linked by reference or value (`register` and `unregister` go through the token). `strictParents` makes `NfsEqualizerWatch` throw the shared spec's `strictParents` error at construction, on the server as in the browser, when it found no equalizer, instead of warning and doing nothing; it changes nothing for `NfsEqualizer`. The token carries the development description every parent token has (the shared spec's D17), although this optional injection never throws NG0201.

### API

#### `NfsEqualizer`

Selector `[nfsEqualizer]`; `exportAs: 'nfsEqualizer'`; standalone; no template.

```ts
class NfsEqualizer {
  readonly equalizeOn: InputSignal<string>;                               // default '' (always on)
  readonly equalizeOnStack: InputSignalWithTransform<boolean, unknown>;   // default false
  readonly equalizeByRow: InputSignalWithTransform<boolean, unknown>;     // default false
  readonly equalized: OutputRef<readonly number[]>;
  equalize(): void;
  register(element: HTMLElement): void;   // called by NfsEqualizerWatch
  unregister(element: HTMLElement): void; // called by NfsEqualizerWatch
}
```

| Input | Type and transform | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `equalizeOn` | `string`, a Breakpoint query (`'medium'`, `'medium up'`, `'large only'`, `'medium down'`, `''`) | `''`, or the Defaults token's value | `data-equalize-on` | None in meaning; an unknown name warns in development and answers `false` (the Breakpoint service's rule) instead of throwing |
| `equalizeOnStack` | `boolean`, `booleanAttribute` | `false` | `data-equalize-on-stack` | "Stacked" is every row holding one watched element, not "the first two differ" |
| `equalizeByRow` | `boolean`, `booleanAttribute` | `false` | `data-equalize-by-row` | Rows grouped by rounded top in any order |

- The three are Options, not Variant inputs (CSS class mapping): they set no class, so their types and transforms follow building-blocks 1.4's Option rule, and a Defaults token holds their defaults.
- Models: none. The directive owns no two-way state; the heights are a result of layout.
- Output `equalized: readonly number[]`: the equal height of each equalized row in px, top to bottom; one entry when `equalizeByRow` is off; an empty array when the directive holds no heights (gate off, stacked, fewer than two watched elements, nothing taller than 0). Emitted after a pass whose result differs from the previous one, never on a pass that changes nothing. It is a Completion output in the glossary's sense: the heights are written when it fires. Replaces `preequalized` and `postequalized`.
- `equalize()`: requests a pass (the pass runs in the next render, not synchronously). For layout changes that change no observed size: reordering watched elements of equal size in by-row mode, or moving the container between two parents of the same width.
- `register`/`unregister`: public because `NfsEqualizerWatch` calls them through the token; documented as internal to the pair. Consumers use `nfsEqualizerWatch` or `hostDirectives`.
- No host bindings, no host listeners, no classes, no attributes.

#### `NfsEqualizerWatch`

Selector `[nfsEqualizerWatch]`; no inputs, outputs, methods, or host bindings; no `exportAs`. It registers its host element with the nearest `NfsEqualizer` and unregisters on destroy.

#### Style ownership

The equalizer owns the inline `min-height` of every registered element: each pass removes the value it wrote before measuring. A consumer who wants a minimum height sets it in a stylesheet (the pass measures after it, so the equal height is never below it); an inline `min-height` binding on a watched element is not supported and the docs say so.

#### The pass

One `afterRenderEffect` on the container, `mixedReadWrite` phase, client only. It tracks a private version signal, the registered elements, the three inputs, and `mq.is(equalizeOn())`.

1. Sync observations: while the gate is on, the `ResizeObserver` (created on the first pass) observes the container and every registered element with `{box: 'border-box'}`; while it is off, it observes nothing.
2. Gate off, or fewer than two registered elements: remove every `min-height` the directive wrote, record the empty result, stop. No layout read.
3. Container last observed with a zero size (it or an ancestor is `display: none`): stop and keep the current heights. Showing the container changes its size, which runs the next pass.
4. Reset: remove the directive's `min-height` from every registered element.
5. Measure, one forced layout: each element's `offsetHeight` and its `getBoundingClientRect().top` rounded to whole pixels.
6. Plan (a pure function over `{top, height}` boxes and the two booleans): group boxes into rows by rounded top. By row: every row with two or more elements gets its maximum as target; the first element at that maximum gets no value, the others get the target. Otherwise: if `equalizeOnStack` is off and every row has one element, nothing is written; else the global maximum is the target for every element but the first tallest. A target of 0 writes nothing.
7. Apply with `Renderer2.setStyle(el, 'min-height', '<n>px')`.
8. If the row targets differ from the last result, emit `equalized` inside `untracked()`, so a consumer handler's signal reads never become dependencies of the effect.

The `ResizeObserver` callback writes nothing to the DOM: it records whether the container's entry reports a zero size and increments the version signal. The signal write schedules a render (an `afterRenderEffect` dependency notifies Angular's scheduler in zoneless and zone-based applications alike), and the pass runs there.

Why the writes are deferred: a `ResizeObserver` callback that resizes observed elements at or above the shallowest depth it was just told about makes the browser fire "ResizeObserver loop completed with undelivered notifications" as an `ErrorEvent` on `window`, and `provideBrowserGlobalErrorListeners()`, which Angular's application template includes, forwards window errors to the `ErrorHandler`. The cost is that a content change after load is painted unequal for at most one frame before the pass runs; Foundation's debounce showed it for 250 ms.

Convergence: a pass that changes heights makes the observer report once more, and the next pass measures the same natural heights, writes the same values, and emits nothing; the one after that does not happen, because no observed size changed. The first pass runs right after the first render, before the observer's initial report, so a client-rendered page is equal at its first paint; the initial report then runs one confirming pass. Nested groups converge the same way: an inner group's writes change an outer watched element's size, which runs the outer pass.

Why `mixedReadWrite`: the algorithm must write (reset), read (measure), and write (apply) in one pass. Splitting it across the `write` and `read` phases would need a second render to apply the result, and the page would paint the reset heights in between. One forced layout per pass is the price; Foundation forced one per watched element.

### Implementation level and primitives

Level, for the recommended path: native platform, CSS only. Flexbox stretch (Baseline widely available since 2018), CSS grid (since 2020), and `subgrid` (widely available since 2026-03-15; Chrome, Edge 117, Firefox 71, Safari 16, all at or below the Browser target) are in target without a fallback. The flex helpers and XY grid are Foundation's own classes, compiled from the consumer's settings and set by the XY Grid and Flexbox Utilities directives as static host classes or host bindings, so the server HTML carries them (building-blocks 1.11 decision 1); no Equalizer code runs.

Level, for the directive: native platform plus a thin custom Angular layer. `ResizeObserver` (widely available since 2023-01-28) replaces the Triggers utility's resize and mutation listeners and the image loader. `@angular/aria` has no layout pattern. `@angular/cdk` has nothing public that fits: `ContentObserver` and `cdkObserveContent` are a MutationObserver, which reports DOM changes that change no size and misses size changes that come from CSS, fonts, and images; the CDK's `SharedResizeObserver` lives in the private `@angular/cdk/observers/private` entry point and is not public API. The Breakpoint service (`NfsMediaQuery` over CDK `MediaMatcher`) is the only library dependency.

Primitives: `afterRenderEffect` (`mixedReadWrite`), `ResizeObserver` created on the effect's first run (a render callback, so never on the server), `Renderer2.setStyle`/`removeStyle` for the one value a host binding cannot express (building-blocks 1.5), `untracked`, `DestroyRef` (disconnect), `NfsMediaQuery.is()`, `inject` with `skipSelf` and `optional`.

Render hooks and lazy loading (building-blocks 1.5 and 1.9): the pass's `afterRenderEffect` is the only render hook. The rendered-state rule of building-blocks 1.5 needs no rendered-state signal here: the directive renders nothing that depends on the breakpoint, the layout it measures follows the viewport through CSS media queries that the browser applies before any render callback, and it reads `is(equalizeOn)` in the `mixedReadWrite` phase, after the Breakpoint service goes live in its `earlyRead` callback (ADR 0014). When consumer content inside the container swaps on a breakpoint in change detection after the pass, the swap changes an observed size and the next pass re-equalizes (Convergence, above). `afterEveryRender` is not used: the pass must run only when the version signal, the registered elements, an input, or the gate changes, and running it after every change detection in the application would force one layout per render for nothing. `injectAsync` is not used: the directive has no service to load after an interaction (its passes follow observed sizes, not a client interaction), and the pass must run right after the first render so a client-rendered page is equal at its first paint; the entry point is its own, so a consumer's `@defer` splits it.

Fallback: none needed. If a target browser misbehaved with element observation, the documented answer is the CSS path, which this spec already recommends first; the directive would not grow a second code path.

### Comparison with Angular Material

None. Angular Material has no equal-height component or directive, and the Material reference research has no entry for one. Material's own card grids rely on CSS layout, which is this spec's first recommendation. The only CDK-adjacent piece is the private shared resize observer used by Material's form field, not borrowed (above).

### ARIA and keyboard

No APG pattern, role, state, property, key handling, focus management, or live region: Equalizer is layout only. Keyboard table: none.

Both the CSS answer and the directive must comply with WCAG 2.2 AA. These criteria apply and are requirements, each with the mechanism that meets it and the test that proves it:

| Criterion (WCAG 2.2 AA) | Requirement | CSS answer | Directive | Test |
| --- | --- | --- | --- | --- |
| 1.4.4 Resize Text | At 200 percent text size or zoom no content is clipped or overlapped | No height is ever fixed: flex stretch, `grid-auto-rows: 1fr`, and `subgrid` size tracks from content, so rows grow with enlarged text | `min-height`, never `height`: a box always grows past the equal height; the growth changes an observed size and the next pass re-equalizes | Playwright: root font size 200 percent and browser zoom 200 percent, no watched box overflows (`scrollHeight <= clientHeight + 1`) |
| 1.4.10 Reflow | At 320 CSS px width (400 percent zoom of 1280 px) no two-dimensional scrolling and no clipped content | XY grid cells go full width below `medium` and stack at natural height; the grid recipes are single-column at the Zero breakpoint and add columns only inside `breakpoint(medium)` and up (a fixed multi-column grid at every width would fail) | Below its `equalizeOn` breakpoint, or when every box sits on its own row with `equalizeOnStack` off, it writes nothing; with `equalizeOnStack` on it writes only `min-height`, which cannot clip and cannot cause horizontal scrolling | Playwright at a 320 px viewport: no horizontal scroll on the document, no overflowing box, in every story |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2, letter spacing 0.12, word spacing 0.16 no content is lost | Same as 1.4.4: content-sized tracks | Same as 1.4.4: `min-height` plus a re-equalizing pass | Playwright injects the text-spacing stylesheet and asserts no overflow |
| 1.3.2 Meaningful Sequence | Reading order equals the visual order that carries meaning | The recipes rely on source-order auto placement; the docs forbid ordering (CSS `order` and the Flexbox Utilities' order input), `grid-auto-flow: dense`, and explicit placement that reorders cards | Never reorders or moves nodes; writes one inline style | Story play functions assert the DOM order of the watched boxes is unchanged after each pass |
| 2.4.3 Focus Order | Focus order follows the meaningful sequence | Follows from 1.3.2 | Follows from 1.3.2; no `tabindex` | Covered by the 1.3.2 check |

Foundation's own Equalizer fails 1.4.4 and 1.4.12 by construction (a fixed inline `height` clips content that grows after the pass until the next debounced resize or mutation) and that is the reason for D5. Foundation's Sass defaults pass as used here: the XY grid stacks below `medium`, and callouts and cards have no fixed heights; Equalizer needs no setting and no custom rule. The callouts and cards of the examples are the Callout and Card specs' directives, and any Library mixin and required settings they carry are stated there (the Callout spec's `nfs-callout`). The story gate is axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `runOnly` set to the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`); axe cannot detect clipping or reflow, so 1.4.4, 1.4.10, and 1.4.12 are proved by the Playwright cases above.

### Rendered HTML

Consumer markup writes directive attributes and no class. Every class in the server HTML comes from a directive: `.grid-x`, `.cell`, the sizes, `.row`, `.column`, the flex helpers, and `.callout` are static host classes or host bindings of the XY Grid, Flexbox Utilities, Float Grid, and Callout directives (names in the CSS class mapping), which render on the server (building-blocks 1.11 decision 1). Neither Equalizer directive adds an attribute, class, or listener; the hydrated DOM differs from the server HTML only by inline `min-height`. Below, the directive attributes and static Option attributes (`nfsequalizer=""`, `equalizeon="medium"`, and so on) are left out of the rendered output, and class order is not significant.

```html
<!-- CSS answer (no Equalizer directive): consumer markup, no class written -->
<div nfsGridX>
  <div nfsCell [size]="{medium: 4}" nfsFlexContainer direction="column">
    <div nfsCallout nfsFlexChild="grow">...</div>
  </div>
  <div nfsCell [size]="{medium: 4}" nfsFlexContainer direction="column">
    <div nfsCallout nfsFlexChild="grow">...</div>
  </div>
</div>

<!-- Its server HTML and hydrated DOM: identical, and already equal -->
<div class="grid-x">
  <div class="cell medium-4 flex-container flex-dir-column">
    <div class="callout flex-child-grow">...</div>
  </div>
  <div class="cell medium-4 flex-container flex-dir-column">
    <div class="callout flex-child-grow">...</div>
  </div>
</div>

<!-- Directive on the legacy float grid: consumer markup -->
<div nfsRow nfsEqualizer equalizeOn="medium">
  <div nfsColumn [size]="{medium: 6}"><div nfsCallout nfsEqualizerWatch>short</div></div>
  <div nfsColumn [size]="{medium: 6}"><div nfsCallout nfsEqualizerWatch>long ...</div></div>
</div>

<!-- Server HTML (and hydrated DOM below medium or while stacked): natural heights -->
<div class="row">
  <div class="column medium-6"><div class="callout">short</div></div>
  <div class="column medium-6"><div class="callout">long ...</div></div>
</div>

<!-- Hydrated DOM at medium and up: the tallest keeps its natural height -->
<div class="row">
  <div class="column medium-6"><div class="callout" style="min-height: 212px;">short</div></div>
  <div class="column medium-6"><div class="callout">long ...</div></div>
</div>
```

No `jsaction` appears on either Equalizer element, because neither directive declares a listener. No `data-resize` or `data-mutate` attribute is written.

### Animation

None. Height changes are applied instantly: no State class, no Motion class, no `animate.enter`/`animate.leave`, no transition awaited, so ADR 0003 has nothing to govern and `prefers-reduced-motion` needs no rule. A consumer transition on `min-height` is not supported, because the pass measures after an instant reset.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the directives render nothing on the server; watched elements register into an in-memory set, the render effect never runs, and no inline style reaches the server HTML (rule 3). The CSS answer is equal at first paint, because its classes are host classes of the XY Grid, Flexbox Utilities, Callout, and Card directives and are in the server HTML; the directive's boxes are at natural heights.
- Before hydration: no `ResizeObserver`, no measurement, no style write; the observer and every DOM access live in the render effect (rules 3 to 5). No timer is started.
- Full hydration: hydration claims the consumer's nodes unchanged, because the Equalizer directives bind nothing and the class directives beside them bind the same classes on both platforms; the first render effect pass then writes `min-height`, which is a layout shift at hydration wherever the boxes differ. The docs state it and point at the CSS answer, which has no shift. The pass reads `NfsMediaQuery.is(equalizeOn)` in the `mixedReadWrite` phase of the first pass, after the service went live in its `earlyRead` callback, so it sees the live breakpoint (ADR 0014); the Server breakpoint never reaches a height decision.
- Incremental hydration: the container and its watched elements belong to one Hydration boundary (1.11 decision 6); while that boundary is dehydrated the boxes keep natural heights. A watched element inside a nested `@defer` block within the container joins the group when its block renders or hydrates, because registration runs at construction and triggers a pass, so a partial boundary degrades to "equalized a little later", never to an error.
- `hydrate never`: the directive never runs; boxes keep natural heights forever. The CSS answer works there, because its classes are already in the server HTML, which is one more reason it comes first (1.11 decision 7 names natural heights as Equalizer's residue).
- Plain `@defer`: client-created content; the first pass runs before its first paint.
- Event replay: no template or host listeners, so no `jsaction`, nothing queued, nothing replayed; the building-blocks rule for replayed events (decided at triage on 2026-09-26) does not affect Equalizer.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: every update is a signal write or a render callback; no `NgZone`.

### Sass and custom CSS

No library CSS, no `nfs-equalizer` mixin. The directive writes only inline `min-height`; the CSS answer uses only Foundation classes, set by their own directives, plus the developer's own grid rules on the developer's own classes. The Sass subsection under Further Notes gives the details.

## Testing Decisions

A good test asserts what a user sees: rendered box heights (`getBoundingClientRect().height` equal within 1 px), which element carries an inline `min-height`, the server HTML, the `equalized` payloads, and the console, never the directives' private fields. No story, test host, or fixture writes a `class` attribute. There is no prior art in the new repository; the patterns are the building-blocks testing rule, Angular's `renderApplication`-based SSR tests, the rendering-mode test seam prototype, and the Angular Components universal-app e2e.

Story ids follow `equalizer--<story>`. CSS answer, no Equalizer directive: `equalizer--css-flex-cells`, `equalizer--css-block-grid-rows`, `equalizer--css-grid-equal-rows`, `equalizer--css-subgrid-card-sections`. Directive: `equalizer--docs-markup`, `equalizer--float-grid`, `equalizer--by-row`, `equalizer--on-stack`, `equalizer--nested`, `equalizer--dynamic-content`, `equalizer--hidden-then-shown`. Stories use breakpoint-independent layouts (`size="4"` cells, `up="2"` grids, `size="6"` float columns, which set Foundation's Zero-breakpoint classes), never a breakpoint-dependent layout, because the Storybook test runner's viewport is narrow; breakpoint behaviour is Playwright's.

Story markup follows the class rule (Storybook conventions, section 8; ADR 0039): no story element carries a Foundation or library class written in the template. Scaffolding is each spec's directive, imported from its own entry point beside `NfsEqualizer` and `NfsEqualizerWatch` in the stories file's `moduleMetadata.imports`: `nfsGridX` and `nfsCell` (the XY Grid spec fixes the names), the Flexbox Utilities' container and child directives, `nfsCallout`, the Card directives, the Float Grid's `nfsRow` and `nfsColumn`, `nfsToggler` with a `button[nfsButton]` Trigger, and `button[nfsButton]` controls. The two CSS grid stories put the recipe's declarations in inline `style` attributes, values Foundation has no class for. The Storybook stylesheet includes `foundation-grid` before `foundation-everything` for the Float Grid's stories and `equalizer--float-grid`; the two grids share their size, offset, and block-grid class names, which that order and Foundation's equal default column counts keep harmless ([Spec: Float Grid](../issues/100-spec-float-grid.md)).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

Every story runs axe with `parameters.a11y.test = 'error'` and `runOnly` set to the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`), and every directive story asserts that the DOM order of its watched boxes is unchanged after each pass (WCAG 1.3.2).

- `equalizer--css-flex-cells`, `equalizer--css-block-grid-rows`: no Equalizer directive in the story; the grid, flex, and callout directives set every class; the callouts of each line are equal; in the block grid, lines have different heights; appending text to one callout keeps its line equal after the next frame.
- `equalizer--css-grid-equal-rows`: every item of every row equal; `equalizer--css-subgrid-card-sections`: each card's section tops align across the row.
- `equalizer--docs-markup` (Foundation's docs example, ported to `nfsGridX`, `nfsCell`, and `nfsCallout`, `equalizeOn` empty): the watched callouts are equal; exactly one has no inline `min-height`; the story's docs text points at the CSS alternative.
- `equalizer--float-grid`: equal heights on the Float Grid directives' `.row` and `.column` markup, where the CSS answer does not apply.
- `equalizer--by-row`: rows equal within themselves and different from each other; a one-item row has no inline `min-height`; the story shows the last `equalized` payload with one entry per multi-item row.
- `equalizer--on-stack`: a single-column stack with `equalizeOnStack` has equal boxes; toggling the input off clears every inline `min-height` and shows `[]`.
- `equalizer--nested`: Foundation's nesting markup with one `nfsCallout` element carrying both directives; the inner callouts are equal, the outer panels are equal, and the outer panel containing the inner group is the one that decides the outer height when its inner boxes grow.
- `equalizer--dynamic-content`: `button[nfsButton]` controls that append and remove text in the tallest box (heights follow up and down), add and remove a watched box through `@for`, and load an image from a data URI after the first pass; heights are equal after each action.
- `equalizer--hidden-then-shown`: the group sits in an `nfsToggler` target in Visibility mode, opened by a `button[nfsButton]` with `[nfsToggle]`; showing it yields equal heights without any notification.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Pass results: fixtures with known box heights assert the inline `min-height` of each element, the untouched tallest, and the `equalized` payload, in both modes, including ties, a zero-height group, and a single watched element.
- Stacked rule: a column layout clears heights with `equalizeOnStack` off and equalizes with it on; a wide first item alone on its row followed by a row of three still equalizes (the order-independent delta).
- Rows out of DOM order: a CSS `order` that moves the last item to the first row groups it with that row (a planner fixture only; the docs forbid reordering, WCAG 1.3.2).
- Gate: a fake `MediaMatcher` (the Breakpoint service's test seam) switching across `medium` clears and restores heights, and the observer observes nothing while the gate is off.
- Emission: a pass that changes nothing emits nothing; clearing emits `[]` once; a consumer handler that reads a signal does not make the effect re-run when that signal changes.
- Registration: watched elements from `@for`, `@if`, and a nested `@defer` block join and leave; removing the tallest re-equalizes to the next one; `hostDirectives: [NfsEqualizerWatch]` on a test component whose host is `display: block` registers it, and with `NfsCallout` hosted beside it the host also carries `.callout`.
- Nesting and DI: a watched element that is also an inner container joins the outer group; inner watched elements join only the inner group; an `nfsEqualizerWatch` outside any equalizer warns once, with the family's sentence, and one declared in another template inside an equalizer's element warns once as out of reach; with `provideNfsRuntimeChecks({strictParents: true})` the first throws at construction, and watched elements rendered inside the equalizer's element through a template outlet with its injector register.
- Class rule: over test hosts that write no `class` attribute, neither directive adds a class, attribute, or listener to its host; with `nfsCallout` beside `nfsEqualizerWatch`, the host carries `.callout` from the Callout and, after a pass, an inline `min-height`, and nothing else from the pair.
- Observer hygiene: over a sequence of content changes and container resizes, no `error` event reaches `window` and nothing reaches `ErrorHandler`; each change settles within two passes; destroying the equalizer disconnects the observer (later size changes run nothing).
- Hidden container: with the container `display: none`, passes keep the current heights; showing it re-equalizes.
- `equalize()`: after swapping two equal-size items between rows in by-row mode, heights are stale until `equalize()` and correct after the next render.
- Defaults token: a provided `nfsEqualizerDefaultsToken` seeds all three inputs; an explicit input wins.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke, under `npx nx test <lib>` in `equalizer.ssr.spec.ts` through the shared `renderServer()` helper (`npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not): a fixture with no `class` attribute anywhere, holding an equalizer on `nfsRow` with three `nfsCallout` watched elements in `nfsColumn` columns, a nested group on a shared `nfsCallout` element, and a CSS-answer grid (`nfsGridX`, `nfsCell` with the flex container directive, `nfsCallout` with the grow child). Assert `whenStable()` resolves; the server HTML carries `grid-x`, `cell`, `flex-container`, `flex-dir-column`, `flex-child-grow`, `callout`, `row`, and `column` from their directives, which is what makes the CSS answer equal at first paint; no element carries a `style` attribute with `min-height`; neither Equalizer directive's host carries `jsaction`; no `data-resize` or `data-mutate` attribute exists.
- Pure logic: the planner (boxes of `{top, height}` plus `equalizeByRow` and `equalizeOnStack` to per-box `min-height` or none, plus row targets) is table-tested: one row, several rows, single-item rows, ties, zeros, sub-pixel tops, stacked columns, out-of-order input.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Viewport breakpoints on a story variant with `equalizeOn="medium"` and `[size]="{medium: 4}"` cells: at 400 px no inline `min-height`; resizing to 800 px equalizes; back to 400 px clears. The same resize on `equalizer--css-flex-cells` keeps CSS heights equal at 800 px with no Equalizer directive.
- By-row regrouping: `equalizer--by-row` resized across `[up]="{medium: 2, large: 4}"` layouts regroups rows and keeps each equal.
- WCAG 1.4.4: on every directive story and every CSS story, at root font size 200 percent and again at a 640 px viewport (how a 1280 px window lays out at 200 percent zoom), no box has content overflowing it (`scrollHeight <= clientHeight + 1`), and the directive's boxes are equal again after the next pass.
- WCAG 1.4.10: every story at a 320 px viewport: `document.documentElement.scrollWidth <= 320`, no overflowing box, and the directive with `equalizeOn="medium"` writes no `min-height`.
- WCAG 1.4.12: the text-spacing stylesheet (line height 1.5, paragraph spacing 2 em, letter spacing 0.12 em, word spacing 0.16 em) injected into every story leaves no overflowing box.
- Console: no `ResizeObserver loop` message during any of the above.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype):

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` on the six tags); the CSS-answer grid is equal; the directive's boxes are natural.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; after hydration the directive's boxes are equal.
- Dehydrated block: an equalizer inside `@defer (hydrate when hydrateNow())` with the signal held `false` keeps natural heights; releasing the signal equalizes them.
- `@defer (hydrate never)`: the directive's boxes stay natural and the CSS-answer grid inside the same block is equal.

## Out of Scope

Each item carries its reason and one category of the out-of-scope exclusions research.

- Library CSS for equal heights (an `nfs-equalizer` mixin, utility classes): Foundation has no class or rule for one height across wrapped rows or for aligned card parts, so a library class would add a class family Foundation lacks, and a CSS grid copy of the block grid would re-implement Foundation's grid layout (map, Standing preferences); Foundation's own feature, one height across every row, is `nfsEqualizer` with `equalizeByRow` off, and the recipes without JavaScript are the developer's own rules on the developer's own classes (D14). Category: `scope-boundary`.
- Equalizing widths, or any dimension other than height in the horizontal writing mode: not a Foundation feature. Category: `scope-boundary`.
- Content-box watched elements: the written value assumes Foundation's global `box-sizing: border-box`, as Foundation's own written `height` does. Category: `scope-boundary`.
- Transitions on the equalized height: Foundation's writes are instant, and the pass measures after an instant reset (Animation). Category: `scope-boundary`.
- Group names and a reference input on `nfsEqualizerWatch` for a watched element that should skip its nearest equalizer: DI scoping replaces the names, and no Foundation example needs the skip (it can follow the Triggers pattern of a typed reference if one appears). Category: `superseded`.
- Masonry layouts: a different problem (items packed without rows), and not a Foundation feature. Category: `scope-boundary`.
- A development check for Foundation classes copied onto either directive's host: neither directive owns a class, so a copied `callout`, `row`, or `grid-x` is the concern of the directive that binds it, as the Triggers spec rules for its hosts. Category: `scope-boundary`.
- The dropped Options, events, and methods (`jquery-or-dom-plumbing` or `superseded`), each with its reason in the Foundation contract table.
- Runtime theming through custom properties (building-blocks 1.13). Category: `other` (design choice).

## Further Notes

### Design decisions

Each rejected alternative carries its reason and one category of the out-of-scope exclusions research.

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | CSS guidance first: XY grid cells with the Flexbox Utilities' column container and grow child, `grid-auto-rows: 1fr`, `subgrid`; no Equalizer directive | Equal at first paint, on the server, without JavaScript, in `hydrate never`, and on every content change, because the classes are host classes of their directives and CSS does the rest; all in the Browser target; uses Foundation's classes | The Equalizer directive as the primary answer (Foundation parity): server HTML and `hydrate never` blocks stay unequal, hydration shifts the layout, and a measurement loop does a layout job (`platform-or-a11y`) |
| D2 | Keep an optional directive pair for the residue | Float grid and non-grid markup cannot be equalized by CSS without restructuring; a drop-in `data-equalizer` counterpart lets such pages move over | CSS guidance only, no directive: leaves Foundation's Equalizer Plugin without an Angular counterpart for markup Foundation 6.9 still ships, against the map's Destination (`scope-boundary`); rejected at triage on 2026-09-26, see the ticket |
| D3 | `[nfsEqualizer]` on the container, `[nfsEqualizerWatch]` on each box, parent-owned registration through `nfsEqualizerToken` with `skipSelf` | Directive-first (ADR 0001); DI replaces names; `skipSelf` makes Foundation's shared-element nesting work | `contentChildren` queries: miss watched elements projected from another template or rendered in a nested `@defer` block (`other`, Angular query scope); a single directive that queries `[nfsEqualizerWatch]` in the DOM: not declaration-scoped, a DOM lookup of the markup (`jquery-or-dom-plumbing`) |
| D4 | No token re-provided as `undefined` | The inner equalizer's own provider already shadows the outer one; an `undefined` provider on the watch directive would collide with it on the shared element | The `CdkAccordionItem` pattern named in building-blocks 1.9: the inner equalizer's provider already does its work (`superseded`) |
| D5 | Inline `min-height`, tallest element of each row untouched | Content can grow at 200 percent zoom, under user text spacing, and at 320 px reflow (WCAG 2.2 AA 1.4.4, 1.4.12, 1.4.10 as requirements); growth and shrinkage both change an observed size, so one `ResizeObserver` catches images, fonts, text, and panels | Foundation's `height`: clips content, hides growth from the observer, and needs a MutationObserver and an image loader (`platform-or-a11y`); `min-height` on the tallest too: its shrinkage changes no observed size, so the group stays too tall (`other`, correctness) |
| D6 | One `ResizeObserver` on the watched elements and the container; no MutationObserver, no image loader | Size changes are what matter; the container catches re-wrapping of fixed-width items | Porting `resizeme`, `mutateme`, and `onImagesLoaded` (`jquery-or-dom-plumbing`); CDK `ContentObserver`: a MutationObserver, which misses size changes from CSS, fonts, and images (`other`, the wrong signal) |
| D7 | Observer callback only bumps a signal; the pass runs in `afterRenderEffect` `mixedReadWrite` | Writing inside the callback raises the loop `ErrorEvent`, which Angular forwards to `ErrorHandler`; one forced layout per pass; no painted reset | Writes in the callback: the loop `ErrorEvent` (`platform-or-a11y`); `write` then `read` across two renders: paints the reset (`other`, a painted intermediate state) |
| D8 | "Stacked" is every row holding one element; rows grouped by rounded top in any order | Order-independent, so no DOM-order sort; matches Foundation on every layout its docs show | Foundation's first-two check and consecutive grouping: wrong under reorders, projection, and sub-pixel tops (`other`, correctness) |
| D9 | `equalizeOn` through `NfsMediaQuery.is()`, viewport semantics | Foundation documents breakpoint names as viewport breakpoints (ADR 0005; audit 0002 L4) | Container queries for the gate: not Foundation's semantics (`scope-boundary`) |
| D10 | `equalized: readonly number[]`, emitted on change | Tells applied from cleared and gives the per-row heights; no noise from confirming passes | The `preequalized`/`postequalized` pair and per-row events: building-blocks 1.4 has Completion outputs and no start events (`superseded`); a `void` output: cannot tell applied from cleared (`other`, less information) |
| D11 | `equalize()` as the only method | Covers the one change no observer sees (equal-size reorders) | Foundation's four public measuring methods: the pass owns measuring and applying (`superseded`) |
| D12 | Defaults token `nfsEqualizerDefaultsToken` | Building-blocks 1.4: one per Plugin with `defaults` | No token: `Equalizer.defaults` is part of Foundation's Plugin (`scope-boundary`) |
| D13 | No listeners, no host bindings, no styles on the server | Hydration-clean by construction; nothing to replay | Host `[style.min-height]` bindings from the container: a binding cannot be reset and measured inside one pass (`other`, mechanism) |
| D14 | No library CSS | Foundation's classes, set by their own directives, and the developer's own grid rules cover the CSS answer; the directive writes one inline value | An `nfs-equalizer` mixin shipping equal-rows utilities: a class family Foundation lacks, and a CSS grid copy of the block grid would re-implement Foundation's layout (`scope-boundary`) |
| D15 | The classes of the CSS answer and of the residue's grid are set by the XY Grid, Flexbox Utilities, Float Grid, Callout, and Card directives beside the pair; the developer writes none, and the recipes select only the developer's own classes and elements (`.card-row > article`). Decided 2026-09-28 under the class rule | ADR 0039 and building-blocks 1.1; those directives bind host classes, which render on the server, so D1's first-paint reason holds; each class keeps one owner; the element selector outranks Foundation's `.card` rule whatever the stylesheet order | Foundation's classes written in the markup (this spec before 2026-09-28): the class rule rules them out (`superseded`); an Equalizer mode that binds the flex helpers on its container's cells: a second owner of the Flexbox Utilities' classes, written on elements it does not host (`scope-boundary`); a recipe selector on `.card`: a Foundation class in the developer's stylesheet (`superseded`) |
| D16 | Neither directive has a class, a Variant input, or a copied-class check; `equalizeOn`, `equalizeOnStack`, and `equalizeByRow` stay Options (`string`, `booleanAttribute`). Decided 2026-09-28 under the class rule | Equalizer has no Foundation class; the three Options set none, so ADR 0040's closed types and `nfsVariantBoolean` do not apply, and `equalizeOn` keeps the Breakpoint service's open query (building-blocks 1.7) | `nfsVariantBoolean` for the two booleans: they set no class, and building-blocks 1.4 keeps that transform for Variant inputs (`other`, not a Variant); a copied-class check in the pair: the class belongs to the directive that binds it, as the Triggers spec rules (`scope-boundary`) |

### Usage examples

CSS first. Boxes inside XY grid cells, equal per line, natural when stacked below `medium` (Foundation's `equalizeOn="medium"` with `equalizeOnStack` off), using only Foundation's classes, set by their directives:

```html
<div nfsGridX>
  <div nfsCell [size]="{medium: 4}" nfsFlexContainer direction="column">
    <div nfsCallout nfsFlexChild="grow"><img src="square.jpg" alt="..." width="400" height="400"></div>
  </div>
  <div nfsCell [size]="{medium: 4}" nfsFlexContainer direction="column">
    <div nfsCallout nfsFlexChild="grow"><p>Pellentesque habitant morbi tristique senectus.</p></div>
  </div>
  <div nfsCell [size]="{medium: 4}" nfsFlexContainer direction="column">
    <div nfsCallout nfsFlexChild="grow"><img src="rectangle.jpg" alt="..." width="400" height="250"></div>
  </div>
</div>

<!-- Cards need only the flex container: a card already grows in a flex container -->
<div nfsGridX [up]="{small: 1, medium: 2, large: 4}">
  <div nfsCell nfsFlexContainer><div nfsCard>...</div></div>
  <div nfsCell nfsFlexContainer><div nfsCard>...</div></div>
</div>
```

No class is written: `nfsGridX` and `nfsCell` with `size` and `up` render `.grid-x`, `.cell`, `.medium-4`, and `.small-up-1.medium-up-2.large-up-4`; the Flexbox Utilities' directives render `.flex-container`, `.flex-dir-column`, and `.flex-child-grow`; `nfsCallout` and `nfsCard` render `.callout` and `.card`.

The block grid above is Foundation's by-row case: each wrapped line stretches on its own. One height for every row, or for a stacked column (`equalizeOnStack`), is the developer's own CSS grid rule on the developer's own class, written with Foundation's `breakpoint()` mixin; so is aligning card parts across a row:

```html
<div class="equal-rows">
  <div nfsCallout>...</div>
  <div nfsCallout>...</div>
  <div nfsCallout>...</div>
</div>

<div class="card-row">
  <article nfsCard>
    <div nfsCardDivider>...</div>
    <div nfsCardSection>...</div>
    <div nfsCardSection>...</div>
  </article>
  <article nfsCard>...</article>
  <article nfsCard>...</article>
</div>
```

```scss
.equal-rows {
  display: grid;
  gap: map-get($grid-margin-gutters, small);
  grid-auto-rows: 1fr;

  @include breakpoint(medium) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include breakpoint(large) {
    grid-template-columns: repeat(4, 1fr);
  }
}

// Card parts aligned across a row (Foundation's nested equalizer example).
// Single column at the Zero breakpoint so 320 px reflow never scrolls sideways (WCAG 1.4.10).
.card-row {
  display: grid;
  gap: map-get($grid-margin-gutters, small);

  @include breakpoint(medium) {
    grid-template-columns: repeat(3, 1fr);

    > article {
      display: grid; // replaces Foundation's flex column on the card
      grid-row: span 3;
      grid-template-rows: subgrid;
    }
  }
}
```

Both recipes select only the developer's own classes and elements, never a Foundation or library class (building-blocks 1.1); `.card-row > article` outranks Foundation's `.card` rule whatever the stylesheet order. Both keep source-order auto placement: no ordering (CSS `order` or the Flexbox Utilities' order input), no `grid-auto-flow: dense`, no explicit placement that reorders cards (WCAG 1.3.2).

The directive, for markup CSS cannot reach. Foundation's float grid, gated at `medium`:

```ts
@Component({
  selector: 'app-legacy-panels',
  imports: [NfsEqualizer, NfsEqualizerWatch, NfsRow, NfsColumn, NfsCallout],
  template: `
    <div nfsRow nfsEqualizer equalizeOn="medium" (equalized)="heights.set($event)">
      @for (panel of panels(); track panel.id) {
        <div nfsColumn [size]="{medium: 4}">
          <div nfsCallout nfsEqualizerWatch>{{ panel.body }}</div>
        </div>
      }
    </div>
  `,
})
export class LegacyPanels {
  readonly panels = input.required<readonly Panel[]>();
  protected readonly heights = signal<readonly number[]>([]);
}
```

Foundation's nesting example, with DI instead of names; the callout in the first column is a watched element of the outer group and the container of the inner one:

```html
<div nfsRow nfsEqualizer equalizeOn="medium">
  <div nfsColumn [size]="{medium: 4}">
    <div nfsCallout nfsEqualizerWatch nfsEqualizer equalizeOnStack>
      <h3>Parent panel</h3>
      <div nfsCallout nfsEqualizerWatch>...</div>
      <div nfsCallout nfsEqualizerWatch>...</div>
    </div>
  </div>
  <div nfsColumn [size]="{medium: 4}"><div nfsCallout nfsEqualizerWatch>...</div></div>
  <div nfsColumn [size]="{medium: 4}"><div nfsCallout nfsEqualizerWatch>...</div></div>
</div>
```

A component that is always a callout and a watched element, and application-wide defaults:

```ts
@Component({
  selector: 'app-product-tile',
  hostDirectives: [NfsCallout, NfsEqualizerWatch],
  template: `<ng-content />`,
  // A custom element is inline, where min-height has no effect and offsetHeight measures line boxes.
  styles: `:host { display: block; }`,
})
export class ProductTile {}

export const appConfig: ApplicationConfig = {
  providers: [{ provide: nfsEqualizerDefaultsToken, useValue: { equalizeOn: 'medium' } }],
};
```

`NfsCallout` binds `.callout` on the host, so the host metadata names no class; its `color` and `size` inputs can be exposed through the `hostDirectives` entry's `inputs`.

### Sass

The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The directive relies on no Foundation export mixin. The CSS answer relies on Foundation's `foundation-xy-grid-classes` (cells, block grid), `foundation-flex-classes` (`.flex-container`, `.flex-dir-column`, `.flex-child-grow`), and the components being equalized (`foundation-callout`, `foundation-card`), whose classes their own directives set; the float-grid residue relies on `foundation-grid`. No library CSS; there is no `nfs-equalizer` mixin. (1) Rules emitted: none. (2) Settings reused: none by the library; the developer's grid recipes use Foundation's `breakpoint()` mixin and `$grid-margin-gutters`. (3) Custom properties: none; the directive writes inline `min-height`, not a `--nfs-equalizer-*` property. (4) Motion classes: none, and no reduced-motion override is needed. (5) What breaks without an include: nothing library-side; without `foundation-flex-classes` the CSS answer's helper classes do nothing and the boxes keep natural heights. (6) Variant properties: none; Equalizer has no Variant class, and the callouts, cards, and grids of the examples take their own specs' Library mixins and settings. `equalizeOn` reads `nfsBreakpointsToken`, whose CSS mirror is `nfs-breakpoint-properties`.

### Platform features to adopt when the browser target moves

- None is needed: flexbox stretch, CSS grid, `subgrid`, and `ResizeObserver` are already in target. The upgrade path is subtraction: once a consumer's markup is on the XY grid or CSS grid, the directive is removed from it.
- `Element.checkVisibility()` (Safari 17.4, out of target) could replace the zero-size container check; the check reads the observer's entry today and costs nothing, so there is no reason to switch.

### Foundation behaviour changed or dropped (jQuery-only)

- Group names on `data-equalizer` and `data-equalizer-watch`: replaced by DI scoping (D3, D4).
- `data-resize`, `data-mutate`, the 250 ms debounced window resize, and the `mutateme` MutationObserver on `childList` and `style`: replaced by one `ResizeObserver` (D6). Tabs, Toggler, and ResponsiveToggle no longer need to fire `mutateme` after showing content.
- `onImagesLoaded` before the first pass: dropped; image loads change sizes (D5, D6).
- Inline `height`: now `min-height`, with the tallest element untouched (D5).
- Nested coordination through bubbled `postequalized` events: automatic through observed sizes.
- Row grouping by consecutive `offset().top` in DOM order and the first-two stacked check: grouping by rounded top and the every-row-single rule (D8).
- `preequalized`, `preequalizedrow`, `postequalizedrow`: dropped; `postequalized` becomes `equalized` with the row heights (D10).
- `getHeights`, `getHeightsByRow`, `applyHeight`, `applyHeightByRow`: dropped; `equalize()` remains (D11).
- `_destroy()` resetting heights to `auto`: unnecessary, because a directive's element is destroyed with it.
- The `.foundation-mq` handshake behind `equalizeOn`: replaced by the Breakpoint service (ADR 0005).
