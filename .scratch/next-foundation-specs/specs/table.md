# Spec: Table

Ticket: [Spec: Table](../issues/92-spec-table.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites who shows tabular data writes a plain HTML `<table>`, which Foundation styles by tag: padding, bold header and footer rows, a border, and stripes on every other body row. Foundation's Table docs then add four looks through classes: `.hover` on the table darkens the row under the pointer; `.unstriped` removes the stripes (or, when the developer's Sass sets `$table-is-striped: false`, `.striped` adds them); `.stack` turns each row into a block of stacked cells on small screens; and a `.table-scroll` wrapper, or `.scroll` on the table itself, lets a wide table scroll sideways. Table is a CSS-only component: it ships Sass and classes and no Plugin. The markup contract leaves the hard parts to the author:

- A wide table in Foundation's scroll wrapper, or with `.scroll`, takes no keyboard focus of its own in Safari or in the Browser target's Chrome 119, so a keyboard user there cannot scroll to the columns off screen. axe reports `scrollable-region-focusable` (WCAG 2.1.1) on both of Foundation's scroll forms in Chromium, Firefox, and WebKit.
- Making the wrapper focusable is not enough: a focusable element needs a role and a name, and axe does not check a region's name (measured: an unnamed focusable `role="region"` passes).
- Below Foundation's stack breakpoint (`medium down`, under 1024 CSS px and in print), a stacked table hides its whole `thead` and `tfoot` on Foundation's default settings. Every user loses the column headers and the footer's content: measured through Windows UI Automation in Chromium and Firefox, the stacked table has two rows and no column headers. axe reports nothing, because it checks only what is rendered.
- Links in a table fail WCAG 1.4.3 on Foundation's defaults on seven of the table's eight backgrounds: `$anchor-color` is 4.16:1 on a striped row, 3.97:1 on a hovered striped row, and 4.40:1 on the header (axe reports 4.14 on a striped row in three engines).
- Under the library's class rule the developer writes no Foundation class at all, so `.hover`, `.unstriped`, `.striped`, `.stack`, `.scroll`, and `.table-scroll` need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the table styled and scrollable by keyboard before hydration and inside dehydrated `@defer` blocks.

## Solution

Two attribute directives. `nfsTable` sits on a native `<table>`, which Foundation styles by tag, and sets its Variant classes from five boolean inputs: `hover`, `unstriped`, `striped`, `stack`, and `scroll`. A table with none of them needs no directive. `nfsTableScroll` sits on the `div` that wraps a wide table and binds Foundation's `.table-scroll`, together with `role="region"` and `tabindex="0"`, so the wrapper is a Scroll region: a keyboard user tabs to it and scrolls it with the arrow keys. The developer names it from the table's caption with `aria-labelledby`. `scroll` on the table does the same for Foundation's wrapper-free form: it binds `.scroll` and `tabindex="0"`, and the table keeps its own role and takes its name from its caption.

A stacked table keeps its column headers and its footer. The `nfs-table` Library mixin stops the compile until the developer sets Foundation's own `$show-header-for-stacked: true`, which lists the column headers above the stacked rows, and it keeps a stacked table's footer, which Foundation hides with no setting. The same mixin stops the compile when text or a link falls under 4.5:1 on any table background; on Foundation's defaults that asks for the darker `$anchor-color` the Callout already requires.

In development builds the directives warn when a table or scroll region has no accessible name, when a stacked table renders with its header or footer hidden, when both stripe inputs are set, and when a Foundation class was copied from Foundation's markup.

## User Stories

1. As an application developer, I want a plain `<table>` to keep Foundation's look with no directive, so that simple tables stay simple.
2. As an application developer, I want to put `nfsTable` on a `<table>` and set `hover`, so that rows darken under the pointer without my writing `.hover`.
3. As an application developer, I want `unstriped` to remove Foundation's stripes from one table, so that a short table reads as one block.
4. As an application developer whose Sass sets `$table-is-striped: false`, I want `striped` to add stripes to one table, so that a long table is easier to follow.
5. As an application developer, I want `striped` and `unstriped` to give the look they name whatever `$table-is-striped` is, so that a change of that setting never inverts my tables.
6. As an application developer, I want `stack` to stack a table's rows below Foundation's stack breakpoint, so that a table with few columns fits a phone.
7. As an application developer, I want a wrapper directive for a wide table that makes it scroll sideways, so that the page never scrolls sideways.
8. As an application developer, I want `scroll` on the table itself for Foundation's wrapper-free form, so that I can migrate markup that used `.scroll`.
9. As an application developer, I want the spec to tell me which form suits which table, so that I pick between the wrapper, `scroll`, and `stack`.
10. As an application developer, I want the Variant inputs to accept only booleans and their static attribute forms, so that `stack="flase"` fails to compile.
11. As an application developer, I want no Variant input set to give me Foundation's Sass default look, so that my settings stay the source of the look.
12. As an application developer migrating Foundation markup, I want a copied `class="hover stack"` to be reported in development, naming the inputs to bind, so that I learn the class rule.
13. As an application developer, I want a development warning when I set both `striped` and `unstriped`, so that a contradiction does not ship silently.
14. As an application developer, I want a development warning when a table or scroll region has no accessible name, so that a focus stop is never announced without a name.
15. As an application developer, I want a development warning when a stacked table renders with its header or footer hidden, so that a forgotten setting or include surfaces before users lose the headers.
16. As an application developer, I want the library's Sass to stop my build until stacked tables keep their headers, so that no stacked table hides them.
17. As an application developer, I want the library's Sass to stop my build when text or a link falls under 4.5:1 on any table background, naming the setting and the ratio, so that a theme cannot fail silently.
18. As an application developer on Foundation's defaults, I want the spec to name the settings that pass, so that I fix the compile error in three lines I may already have for the Callout.
19. As a keyboard user, I want to tab to a wide table's scroll region and scroll it with the arrow keys, so that I can read every column.
20. As a keyboard user, I want to see where focus is when the scroll region takes it, so that I know the arrow keys will scroll it.
21. As a keyboard user, I want each scroll region to be one tab stop, so that tables do not trap or multiply my tab stops.
22. As a screen reader user, I want the scroll region announced with its table's caption, so that I know what I have moved to.
23. As a screen reader user, I want every data cell of a stacked table to keep its column header, so that "120cal" is announced as Calories.
24. As a screen reader user, I want a stacked table to stay a table, so that my table navigation commands keep working.
25. As a sighted user on a phone, I want a stacked table to show its column names, so that I know which value is which.
26. As a sighted user on a phone, I want a stacked table to keep its footer, so that I still see the totals.
27. As a sighted user on a phone, I want a wide table to scroll inside its region while the page stays put, so that I never scroll the whole page sideways.
28. As a user with low vision, I want text and links in every row, stripe, hover state, header, and footer to reach 4.5:1, so that I can read the whole table.
29. As a user who prints a page, I want a stacked table to print with its headers, so that the printout keeps its meaning.
30. As a developer of a server-rendered application, I want the server HTML to carry every class, `role`, and `tabindex`, so that the first paint is final and the scroll region is keyboard-reachable before hydration.
31. As a developer using `@defer (hydrate never)`, I want a table there to keep its look and its keyboard scrolling, so that static regions work without JavaScript.
32. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
33. As an application developer, I want to import the directives from their own entry point, so that a `@defer` block can split them.
34. As a library maintainer, I want every behaviour asserted through roles, names, classes, computed styles, geometry, and keyboard scrolling in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Table has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's table Sass (the `foundation-table` Export mixin, which includes the `table`, `table-stack`, `table-scroll`, and `table-hover` mixins), its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Table | `table` | `@mixin foundation-table`, `@mixin table` | Styled by tag: `border-collapse: collapse`, `width: 100%`, `$global-margin` below, `$table-padding` in cells, `$table-border` around `thead`, `tbody`, `tfoot`; `caption`, `thead`, and `tfoot` bold; header and footer cells aligned to `$global-left`. No class, so no Structural class |
| Header and footer | `thead`, `tfoot` | the same mixin | `$table-head-background` with `$table-head-font-color`; `$table-foot-background` with `$table-foot-font-color` |
| Stripes | none; `tbody tr:nth-child(even)` (or `odd`) | `$table-is-striped: true`, `$table-stripe: even` | `$table-striped-background` on every other body row. `$table-stripe` other than `even` or `odd` means no stripes |
| Unstriped | `.unstriped` | generated only while `$table-is-striped` is `true` | Closed Variant family of one class. Body rows get `$table-background` and a `$table-border` bottom border |
| Striped | `.striped` | generated only while `$table-is-striped` is `false` | Closed Variant family of one class. The stripes on one table when the setting removed them from all |
| Hover | `.hover` | `@mixin table-hover` | Closed. Rows under the pointer take `$table-row-hover`, `$table-row-stripe-hover`, `$table-head-row-hover`, or `$table-foot-row-hover` |
| Stacked | `.stack` | `@mixin table-stack`, inside `breakpoint($table-stack-breakpoint down)` | Closed. Below the breakpoint (Foundation's `medium down`: `print, screen and (max-width: 63.99875em)`) `tr`, `th`, and `td` become blocks; `thead` is hidden unless `$show-header-for-stacked` is `true`, which shows its `th` cells as blocks; `tfoot` is always hidden |
| Scrolling table | `.scroll` | `@mixin table-scroll` | Closed. `display: block; width: 100%; overflow-x: auto` on the table itself. The docs call it the form that needs no wrapper element |
| Scroll wrapper | `.table-scroll` | `@mixin foundation-table` | Structural class on the element around a table: `overflow-x: auto`. The docs' primary scrolling form since Foundation 6.2 |

Docs conventions kept or corrected: Foundation's element structure (kept); the stripes by default (kept, the developer's Sass decides); the scroll wrapper and the scrolling table (kept, now focusable and named Scroll regions); tables without a caption (corrected: every recipe and story names its table with a `<caption>`, the APG Table pattern's label); the stacked table's hidden headers and footer (corrected: `$show-header-for-stacked: true` is required and the footer is kept); the obsolete `width` attributes on header cells and the scrolling example's inline `display: block` cell (left out of the recipes: column widths are the developer's own CSS).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| none (`table` is styled by tag) | `NfsTable` (`table[nfsTable]`), no static class | - | - | none | - |
| `.table-scroll` | `NfsTableScroll` (`div[nfsTableScroll]`), static host class | - | - | `table-scroll` | - |
| `.hover` | `hover` Variant input of `NfsTable` | `boolean` through `nfsVariantBoolean` (parameter `NfsVariantBoolean`); closed | boolean | `.hover`; `false` sets none | none (closed) |
| `.unstriped` | `unstriped` Variant input of `NfsTable` | `boolean` through `nfsVariantBoolean`; closed; the class exists while `$table-is-striped` is `true` | boolean | `.unstriped`; under `$table-is-striped: false` the class has no rule and the table is unstriped anyway (D5) | none (D5) |
| `.striped` | `striped` Variant input of `NfsTable` | `boolean` through `nfsVariantBoolean`; closed; the class exists while `$table-is-striped` is `false` | boolean | `.striped`; under `$table-is-striped: true` the class has no rule and the table is striped anyway (D5) | none (D5) |
| `.stack` | `stack` Variant input of `NfsTable` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.stack` | none (closed) |
| `.scroll` | `scroll` Variant input of `NfsTable` | `boolean` through `nfsVariantBoolean`; closed | boolean | `.scroll`, and the host also binds `tabindex="0"` (D6) | none (closed) |

State classes: none. Foundation's Table has no State class (`:hover` is a pseudo-class). No Variant family is responsive: `$table-stack-breakpoint` is one compile-time breakpoint, and Foundation generates no per-breakpoint table class. No class is left for the consumer to write (ADR 0039).

### Hierarchy and DI shape

```
div[nfsTableScroll]    NfsTableScroll (standalone directive, no template, no parent, no children)
  table[nfsTable]      NfsTable (standalone directive, no template, no parent, no children); optional
    caption, thead, tbody, tfoot, tr, th, td   no directive: Foundation styles them by tag
```

- The two directives do not know each other: no token, no parent handle, no content query. A table inside a scroll wrapper and a table outside one behave the same, so neither needs the other (building-blocks 1.9 needs no DI link here). Only the wrapper's development In-family check names `NfsTable`, to probe an `nfsTable` inside it (below).
- No host directives, and no Defaults token: Table has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `ElementRef` for the development checks; in development builds only, `HostAttributeToken('class')` (optional) on `NfsTable` for the copied-class warning (D12). Neither directive requests a Variant check handle: no Table input reads a Variant property (D5, D11).
- Entry point: `ngx-foundation-sites/table` (one per Foundation docs page), so a consumer's `@defer` can split it. It exports `NfsTable` and `NfsTableScroll`; `NfsVariantBoolean` and `nfsVariantBoolean` live in the primary entry point `ngx-foundation-sites` and are used here.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsTableScroll` calls `nfsDirectiveCheck('NfsTableScroll', {children: ['NfsTable']})` and probes an `nfsTable` inside it, so a forgotten `NfsTable` in a wrapper is reported, as is an `nfsTable` on an element other than a `table`; a plain table carries no attribute and is never reported. `NfsTable` calls `nfsDirectiveCheck('NfsTable')` and probes nothing, because the caption, row groups, rows, and cells carry no directive. Neither has a parent check, because neither injects a parent and a table outside a wrapper is Foundation's usual form; neither has a peer linked by reference or value (a region's `aria-labelledby` names the consumer's caption, not a directive); `strictParents` changes nothing. The entry point imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` for this call alone; the call sits behind the inline `ngDevMode` guard, so a production build keeps nothing of it.

### API: `NfsTable`

Selector `table[nfsTable]`; standalone; no template; no `exportAs`. Named after Foundation's `table` mixin and docs page, as building-blocks 1.3 names a directive on an element Foundation styles by tag.

```ts
class NfsTable {
  readonly hover: InputSignalWithTransform<boolean, NfsVariantBoolean>;     // default false
  readonly unstriped: InputSignalWithTransform<boolean, NfsVariantBoolean>; // default false
  readonly striped: InputSignalWithTransform<boolean, NfsVariantBoolean>;   // default false
  readonly stack: InputSignalWithTransform<boolean, NfsVariantBoolean>;     // default false
  readonly scroll: InputSignalWithTransform<boolean, NfsVariantBoolean>;    // default false
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `hover` | `boolean`, `nfsVariantBoolean` | `false` | `table.hover` | New input |
| `unstriped` | `boolean`, `nfsVariantBoolean` | `false` | `table.unstriped` (while `$table-is-striped: true`) | New input. The JSDoc names the class and the setting |
| `striped` | `boolean`, `nfsVariantBoolean` | `false` | `table.striped` (while `$table-is-striped: false`) | New input. The JSDoc names the class and the setting |
| `stack` | `boolean`, `nfsVariantBoolean` | `false` | `table.stack` below `$table-stack-breakpoint` | New input. Needs `$show-header-for-stacked: true` and `@include nfs-table;` (D7, D8) |
| `scroll` | `boolean`, `nfsVariantBoolean` | `false` | `table.scroll` | New input. Also binds `tabindex="0"` (D6) |

- Each input declares its explicit type arguments; the write type is `NfsVariantBoolean` (`boolean | '' | 'true' | 'false' | null | undefined`), so `<table nfsTable stack>` compiles and `stack="flase"` does not. `booleanAttribute` is never used (building-blocks 1.4).
- Models, outputs, and methods: none.

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| `[class.hover]` | `hover()` |
| `[class.unstriped]` | `unstriped()` |
| `[class.striped]` | `striped()` |
| `[class.stack]` | `stack()` |
| `[class.scroll]` | `scroll()` |
| `[attr.tabindex]` | `0` while `scroll()`, otherwise `null` |

- Each class binding is `false` unless its input is set, so a Foundation class copied into the host's static `class` is stripped on server and client, and the consumer's own classes stay (building-blocks 1.4).
- Attribute ownership: the directive owns the five classes and `tabindex` on its host. The name (`<caption>`, `aria-labelledby`, `aria-label`) and `aria-describedby` stay the consumer's; the directive adds no `role`, because the native table role is the one to keep (D14).
- Development-mode checks, in one `afterRenderEffect` read phase created only when `ngDevMode` is on (never on the server, never in production), each warning once per instance:
  1. No accessible name (D9): the name from the text of the elements `aria-labelledby` references, then a non-blank `aria-label`, then the `<caption>`'s text, then a non-blank `title`, where text also counts the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` (building-blocks 1.10, Names), is empty: "nfsTable: this table has no accessible name; give it a <caption> (APG Table pattern). With scroll it is a focus stop, and a focus stop needs a name (WCAG 4.1.2)." Checked at the first render, because the name must be in server HTML.
  2. Hidden header or footer on a stacked table (D8): while `stack()` is set, its `tHead` or `tFoot` computes `display: none`: "nfsTable: this stacked table hides its <thead> (set $show-header-for-stacked: true) / its <tfoot> (add @include nfs-table; after foundation-table), so its column headers or footer are lost below $table-stack-breakpoint (WCAG 1.3.1, 1.4.10)." It can fire only in a render made while the page is below the stack breakpoint; the e2e layer covers the narrow viewport.
  3. Both stripe inputs (D5): `striped()` and `unstriped()` are both set: "nfsTable: striped and unstriped are both set; set the one that names the look you want."
  4. Copied classes (D12): a static class list that holds `hover`, `unstriped`, `striped`, `stack`, or `scroll` warns once, naming each class with its input, for example "class="hover stack" is set by nfsTable: bind hover and stack instead". Those classes are stripped (the bindings above), so the table loses the look until the input is bound. A copied `table-scroll` on a table is not one of `NfsTable`'s classes and is not reported.

### API: `NfsTableScroll`

Selector `div[nfsTableScroll]`; standalone; no template; no inputs, outputs, or methods. Restricted to `div`, the element Foundation's docs write, because `role="region"` would replace the role of a `table`, `figure`, or `section`.

| Binding | Value |
| --- | --- |
| static `class` | `table-scroll` |
| static `role` | `region` |
| static `tabindex` | `0` |

- The three attributes are static host attributes, so the server HTML carries them and the wrapper is a focus stop before hydration and inside `@defer (hydrate never)`.
- The name is the consumer's: `aria-labelledby` pointing at the table's `<caption>` (the recipe), or `aria-label`. The directive declares no name input, because the consumer writes the wrapper and can write its name attributes on it, as on a progress bar ([Spec: Progress Bar](../issues/95-spec-progress-bar.md), D12). Each region's name is unique on the page (axe `landmark-unique`, best-practice, reports two regions with one name, measured); naming each region from its own table's caption meets it.
- The region is always a focus stop, not only while its content overflows (D10).
- Development-mode check (D9), in one `afterNextRender` that exists only when `ngDevMode` is on, once per instance: the name from `aria-labelledby` text (an image's non-blank `alt`, or the non-blank `aria-label` of an element with `role="img"`, counting as text), a non-blank `aria-label`, or a non-blank `title` is empty: "nfsTableScroll: this scroll region has no accessible name; point aria-labelledby at its table's <caption> or add aria-label (WCAG 4.1.2; WAI-ARIA: authors MUST give each element with role region a brief label). Its content does not name it." A `region` is named by its author only, and axe checks no region name (measured).

### Which form

| Need | Form | Why |
| --- | --- | --- |
| A table that fits its container | A plain `<table>` with a `<caption>`; `nfsTable` only for a Variant | Foundation styles it by tag; nothing to own |
| A wide table on a narrow screen, keeping its columns | `div[nfsTableScroll]` around the table, `aria-labelledby` at its caption | Foundation's primary form: the table keeps `display: table`, so its rows span the full width; WCAG 1.4.10 exempts data tables from reflow, so a region that scrolls sideways passes while the page does not scroll |
| The same without a wrapper, or migrated `.scroll` markup | `scroll` on `nfsTable` | The table itself is the focus stop, named by its caption, and keeps its table role (measured in Chromium and Firefox; WebKit builds tables from the DOM). Its rows shrink to their content, because `display: block` turns the table box into a block (measured: a two-column table at 1280 CSS px has 64 px rows in three engines, where the wrapper form's rows are 1279 px) |
| A table with few columns whose rows read as records | `stack` on `nfsTable`, a row header cell first in each row | Below the stack breakpoint the column headers are listed above the rows and each record starts with its bold row header; the footer is kept (D7) |

One form per table: a `scroll` table inside a scroll wrapper makes two focus stops for one scrolling box.

### Comparison with Angular Material (22.2)

| Concern | Material `MatTable` (on CDK's `CdkTable`) | This library |
| --- | --- | --- |
| Selector and kind | `mat-table` or `table[mat-table]`, a component that renders rows and cells from a data source through column and row definitions | `table[nfsTable]` on the consumer's own table markup, which `@for` fills; `div[nfsTableScroll]` on the consumer's wrapper |
| Roles | Sets an explicit `role="table"` on its host and `row`, `cell`, and `rowgroup` roles on the rendered parts, even on native elements | Native table semantics only; explicit roles are not needed in the Browser target (Out of Scope) |
| Name | Docs: "Always provide an accessible label for your tables via `aria-label` or `aria-labelledby`" | A `<caption>` in every recipe; a development name check on every `nfsTable` host and every scroll region |
| Scrolling | Left to the consumer's container; sticky rows and columns, virtual scrolling | A named, focusable Scroll region (`nfsTableScroll`, or `scroll`); no sticky or virtual scrolling (Out of Scope) |
| Looks | Material's theme | Foundation's `hover`, stripes, and `stack` Variants |
| Sorting, pagination | `MatSort`, `MatPaginator` | None; not Foundation features (Out of Scope) |
| Testing | `MatTableHarness` | DOM-first assertions; no harness |

Borrowed: the rule that every table is named. Not borrowed: a data-driven component (Foundation's markup carries every element, ADR 0001), the explicit roles, and the data-table features. CDK's `CdkTable` renders native table elements, which Foundation styles by tag, so a consumer who needs its data source can write `nfsTable` beside `cdk-table` on the same `<table>`; this ticket did not measure that composition.

### Implementation level and primitives

Implementation level: native platform. The native `<table>` carries its own semantics, CSS `overflow-x` from Foundation scrolls the wrapper or the table, `tabindex="0"` makes the scrolling box a focus stop, and the browser scrolls it with the arrow keys. `@angular/aria` has no table pattern (its grid is an interactive widget, and the APG says a table "is not an interactive widget"), and `@angular/cdk`'s `CdkTable` renders rows from data, which the consumer's own template does. The Angular layer is host bindings over five `input()` signals, three static host attributes, and development-only render callbacks. No `effect`, no listener, no timer, no observer.

Fallback: none needed. The keyboard scrolling, the names, the stacked table's platform semantics, and the contrast were measured in three engines by this spec's ticket, with axe.

### ARIA and keyboard

APG pattern: Table ("a static tabular structure ... it is not an interactive widget"; its cells are not focusable). The Scroll region is a named `region` landmark around it, the form WAI-ARIA and published responsive-table practice give a scrolling container that takes focus.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `table`, with or without `nfsTable` | Native `table`, named by its `<caption>`; `th` cells are column or row headers | HTML-AAM; APG Table pattern |
| A stacked table below the breakpoint, with the required setting and `nfs-table` | Still a `table`: header row, body rows, and footer row, with named column headers (measured through Windows UI Automation in Chromium and Firefox at 375 CSS px: 4 rows, headers "Cookies, Taste, Calories, Overall") | Table semantics under `display: block` rows and cells are kept in Chrome and Firefox, and in Safari from Safari 17 (published screen-reader testing; WebKit bug 257458, resolved fixed) |
| The same on Foundation's defaults | A `table` of 2 rows with no column headers: `thead` and `tfoot` are `display: none` (measured in Chromium and Firefox; Chromium's accessibility tree has no `columnheader` at all) | Corrected by D7 |
| `div[nfsTableScroll]` | `region`, focusable, named from `aria-labelledby` or `aria-label`; a landmark once named | WAI-ARIA `region` ("Authors MUST give each element with role region a brief label"); measured in Chromium's accessibility tree: `region "Words for frameworks"`, focusable |
| `table[nfsTable][scroll]` | `table`, focusable (`tabindex="0"`), named by its caption; `display: block` keeps the table role (measured through Windows UI Automation in Chromium and Firefox: Table, keyboard focusable, 4 rows, 4 named column headers) | Current WebKit source builds a table's accessibility from the DOM table element, whatever its renderer; the manual release test covers VoiceOver |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches each scroll region, and each `scroll` table, once, in document order, before the table's own links and controls | `tabindex="0"` from the directive; native order |
| Left Arrow, Right Arrow (focus on a scroll region or `scroll` table) | Scrolls it sideways (measured in three engines: one Right Arrow moved `scrollLeft` from 0 to 40, 35, and 40 px) | Native |

Focus: the directives move no focus. Focus lands on the region only through Tab or a click; the browser's own focus indicator shows it (measured: `outline-style: auto` in three engines, since nothing in Foundation's CSS removes it without Foundation's JavaScript).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios were computed by this spec's ticket with the exact WCAG relative-luminance formula (`math.pow`) from Foundation 6.9.0's default settings, unrounded, never Foundation's `color-luminance()` (building-blocks 1.10); axe computes from rendered 8-bit colours, so its figures differ in the second decimal. Geometry and keyboard were measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 2.1.1 Keyboard | A table whose content can scroll sideways sits in `div[nfsTableScroll]` or carries `scroll`; both bind `tabindex="0"`, so Tab reaches the scrolling box and the arrow keys scroll it | Neither the wrapper nor `.scroll` takes focus: axe `scrollable-region-focusable` (`wcag2a`, `wcag211`) on both in three engines; Safari, and Chrome at the Browser target's version 119, do not make a scrolling box focusable on their own | axe in `table--scroll` and `table--scroll-table`; e2e real key presses in three engines |
| 4.1.2 Name, Role, Value | The scroll region is a `region` with the consumer's name, and a `scroll` table a `table` named by its caption; both warn in development without a name (D9), because axe checks neither (measured: an unnamed focusable `role="region"` passes axe) | No role and no name on the wrapper | Browser-level tests of both name checks; play functions find `getByRole('region', {name})` and `getByRole('table', {name})` |
| 1.3.1 Info and Relationships | A stacked table keeps its column headers in the accessibility tree and on screen: `$show-header-for-stacked: true` is required at compile time, and `nfs-table` keeps the footer (D7); header cells are `th`, as Foundation's markup has them; every table carries a `<caption>` in the recipes | Below the breakpoint `thead` and `tfoot` are `display: none`: 2 rows and no column headers in the platform trees of Chromium and Firefox; axe reports nothing | Node-level Sass compile test; e2e at 375 CSS px (every header cell and the footer row visible); the manual release test |
| 1.4.10 Reflow | At 320 CSS px the page does not scroll sideways: a wide table scrolls inside its Scroll region, which the Understanding document allows for data tables ("parts of the content which require two-dimensional layout"); a stacked table keeps its headers and footer, so stacking loses no information | Foundation's scroll forms keep the page from scrolling (measured `scrollWidth` 375 at 375 CSS px) but take no focus in Safari or Chrome 119 (2.1.1 above); its stacked table loses the headers and footer | e2e at 320 by 640 px: `document.documentElement.scrollWidth` at most 320 in `table--scroll`, `table--scroll-table`, and `table--stacked` |
| 1.4.3 Contrast (Minimum) | Body text, header and footer text, and links at rest and on hover or focus reach 4.5:1 on every table background: `$table-background`, `$table-row-hover`, and, while rows are striped, `$table-striped-background` and `$table-row-stripe-hover`; `$table-head-background` and `$table-head-row-hover`; `$table-foot-background` and `$table-foot-row-hover`. `nfs-table` stops the compile with `@error` for every pair under 4.5:1 (D11). Required on Foundation's defaults: the Callout's `$anchor-color: scale-color($primary-color, $lightness: -15%);` (links then 5.15:1 to 6.02:1, hover 6.38:1 to 7.46:1) | Text passes everywhere (16.78:1 to 19.63:1). `$anchor-color` `#1779ba` passes only on `$table-background` (4.65:1) and fails on the other seven: row hover 4.45, striped 4.16, striped hover 3.97, header 4.40, header hover 4.21, footer 4.16, footer hover 3.97:1; axe reports 4.14 on a striped row in three engines. `$anchor-color-hover` passes (5.06:1 and up) | Node-level Sass compile test; axe `color-contrast` in `table--stripes` (links on striped rows) under the Storybook settings overrides |
| 2.4.7 Focus Visible | The browser's own focus indicator shows on the region and on a `scroll` table | Passes once focusable: `outline-style: auto` in three engines | e2e screenshot comparison before and after Tab in `table--scroll` in three engines |
| 1.4.11 Non-text Contrast | Nothing to meet: the stripes (1.12:1) and borders (1.12:1) are not graphical objects required to understand the data, which the header cells, the alignment, and the text carry; the focus indicator is the browser's unmodified one, which the Understanding document exempts ("must still be visible", 2.4.7 above) | As stated | None needed |
| 2.4.3 Focus Order | Each Scroll region's tab stop comes before its content's links and controls, in document order | Not applicable (no focus stop) | Play functions tab through `table--scroll` |
| 1.3.2 Meaningful Sequence | A stacked table reads in DOM order: headers, then each record, then the footer | Passes | Nothing beyond the e2e order check |
| 1.4.12 Text Spacing, 1.4.4 Resize Text | The library adds no height or width; cells grow with their text, and the Scroll region takes what does not fit | Passes | Nothing to test in the library |
| 1.4.13 Content on Hover or Focus | `hover` darkens a row and shows no content | Not applicable | None |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). Inside a Scroll region axe marks the caption's contrast incomplete ("partially obscured", because the caption spans the scrolled table); it is page text at 19.63:1 and not a violation.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directives declare no listener, so nothing adds `jsaction`. Class and attribute order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfstable=""`, `stack=""`), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Basics: a plain table, no directive -->
<table>
  <caption>Cookie ratings</caption>
  <thead><tr><th>Cookies</th><th>Taste</th><th>Calories</th><th>Overall</th></tr></thead>
  <tbody>
    <tr><td>Chocolate Chip</td><td>Tastey</td><td>120cal</td><td>7.5/10</td></tr>
    <tr><td>Snickerdoodle</td><td>Delicious</td><td>95cal</td><td>8/10</td></tr>
  </tbody>
</table>

<!-- Hover, unstriped -->
<table nfsTable hover unstriped>...</table>

<table class="hover unstriped">...</table>

<!-- Stacked: a row header first in each row, and a footer -->
<table nfsTable stack>
  <caption>Cookies</caption>
  <thead><tr><th scope="col">Cookies</th><th scope="col">Taste</th><th scope="col">Calories</th><th scope="col">Overall</th></tr></thead>
  <tbody>
    <tr><th scope="row">Chocolate Chip</th><td>Tastey</td><td>120cal</td><td>7.5/10</td></tr>
    <tr><th scope="row">Snickerdoodle</th><td>Delicious</td><td>95cal</td><td>8/10</td></tr>
  </tbody>
  <tfoot><tr><th scope="row">Total</th><td></td><td>215cal</td><td></td></tr></tfoot>
</table>

<table class="stack">...</table>

<!-- Scroll region: the wrapper named from the caption -->
<div nfsTableScroll aria-labelledby="words-caption">
  <table>
    <caption id="words-caption">Words for frameworks</caption>
    ...
  </table>
</div>

<div class="table-scroll" role="region" tabindex="0" aria-labelledby="words-caption">
  <table>
    <caption id="words-caption">Words for frameworks</caption>
    ...
  </table>
</div>

<!-- Scrolling table: Foundation's wrapper-free form -->
<table nfsTable scroll>
  <caption>Words for frameworks</caption>
  ...
</table>

<table class="scroll" tabindex="0">...</table>
```

Server and hydrated DOM are identical for every example: the classes and `tabindex` come from host bindings on input signals, and the wrapper's attributes are static. The caption's `id` is the consumer's, so it is the same on server and client and `aria-labelledby` resolves before hydration.

### Animation

None. Foundation's table Sass declares no transition, the hover colour changes at once, and the library adds none. No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every Variant class, the wrapper's `.table-scroll`, `role`, and `tabindex`, and a `scroll` table's `tabindex`, exactly as the hydrated DOM does, so the first paint is final and the Scroll region is a named focus stop before hydration. The stacked layout is Foundation's CSS and needs no script.
- Before hydration: the directives touch no DOM outside host bindings, measure nothing, and start no timer. The development checks run in render callbacks, which are no-ops on the server.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch. The two directives share no DI, so a table and its wrapper may sit in different Hydration boundaries.
- Event replay: no directive declares a listener or adds `jsaction`; there is nothing to replay. Keyboard scrolling is native and works before hydration.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block, and inside `@defer (hydrate never)`, a table is its server HTML: styled, stacked below the breakpoint, and scrollable by keyboard for good.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: roles, names, header cells, classes, computed backgrounds, which elements are visible and where they sit, focus, and the scroll position after a real key press. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Progress Bar](../issues/95-spec-progress-bar.md)'s and [Spec: Callout](../issues/89-spec-callout.md)'s tests, the nearest precedents.

Story ids follow `table--<story>`: `table--basics`, `table--hover`, `table--stripes`, `table--stacked`, `table--scroll`, `table--scroll-table`. `meta.component` is `NfsTable`; `hover`, `unstriped`, `striped`, `stack`, and `scroll` are args. Every Variant family is closed, so the library's Storybook program needs no Variant declaration file (ADR 0040). The Storybook settings overrides carry this spec's required setting and the Callout's `$anchor-color` lines (Sass subsection), and the preview includes `nfs-table`. Every story's table has a `<caption>`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `scrollable-region-focusable`, `color-contrast`, `landmark-unique`, `th-has-data-cells`, and `td-headers-attr`). No story element carries a Foundation class written in the story. The assertions hold at any viewport width: the stacked form keeps its headers and footer in both layouts.

- `table--basics`: Foundation's Basics example as a plain `<table>` with a caption. It is found by `getByRole('table', {name})`, has four `columnheader`s and three body rows, and carries no class; an even body row's computed background differs from an odd one's (the default stripes).
- `table--hover`: `hover` sets `.hover`; after `userEvent.hover()` over a body row its computed background differs from its resting one.
- `table--stripes`: a default striped table and an `unstriped` one, each with a link in an even row. The striped table's even and odd rows differ in computed background; the unstriped table's are equal and it carries `.unstriped`; axe passes `color-contrast` on both links under the Storybook settings overrides.
- `table--stacked`: the stacked recipe (row headers, a footer with a total). It carries `.stack`; its four `columnheader`s and the `rowheader` "Total" are accessible by role and name.
- `table--scroll`: a thirteen-column table in `div[nfsTableScroll]` named from its caption, with a link in its last column. `getByRole('region', {name: 'Words for frameworks'})` has `tabindex="0"`; the table inside is `getByRole('table', {name: 'Words for frameworks'})`; the first `userEvent.tab()` focuses the region and the second the link.
- `table--scroll-table`: the same table with `scroll`. `getByRole('table', {name})` carries `.scroll` and `tabindex="0"`, and `userEvent.tab()` focuses it.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data: each input set as a static attribute (`hover`), as `"true"`, and as a bound `true` sets exactly its class; `"false"` and a bound `false` set none; `scroll` sets `tabindex="0"`, and clearing it removes the attribute; a static `class="hover stack reports"` renders only `reports` until the inputs are bound; `NfsTableScroll` renders `class="table-scroll"`, `role="region"`, and `tabindex="0"`, and a redundant static `class="table-scroll"` is kept once.
- Development checks: `NfsTable` with a `<caption>`, `aria-labelledby` at text, or `aria-label` is silent, and so is a `<caption>` that holds only an `img` with a non-blank `alt`, and with none warns once; `NfsTableScroll` with `aria-labelledby` at the caption or `aria-label` is silent, and with none, `aria-label=""`, or `aria-labelledby` at a missing id warns once; `striped` with `unstriped` warns once; `class="hover stack"` warns once naming `hover` and `stack`, and the consumer's own classes are not reported; a `stack` table rendered in a test page whose stylesheet hides its `tfoot` warns once naming `@include nfs-table;`, and one that hides its `thead` warns naming `$show-header-for-stacked: true`; nothing is checked when `ngDevMode` is false.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.
- No Runtime check test: no Table input reads a Variant property (D11).

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with a plain table, a `hover unstriped` table, a `stack` table, a scroll region named by its caption, and a `scroll` table. `whenStable()` resolves; the server HTML carries `class="hover unstriped"`, `class="stack"`, `class="table-scroll" role="region" tabindex="0"` with the consumer's `aria-labelledby`, and `class="scroll" tabindex="0"`; no element carries `jsaction`; no development warning is made on the server.
- Sass compile, over Foundation 6.9.0's settings with `@import 'ngx-foundation-sites';` (measured by this ticket with a candidate mixin):
  - Foundation's defaults plus `@include nfs-table;` stop with one `@error` naming `$show-header-for-stacked` and seven `$anchor-color` pairs: row hover 4.45, striped 4.16, striped hover 3.97, header 4.40, header hover 4.21, footer 4.16, footer hover 3.97:1.
  - With the header setting alone, the seven link pairs remain.
  - With the required settings the include compiles and emits exactly `@media print, screen and (max-width: 63.99875em) { table.stack tfoot { display: table-footer-group; } }`, and no copy of a Foundation rule.
  - `$table-stack-breakpoint: small` moves that rule to `(max-width: 39.99875em)`.
  - `$table-stripe: none` drops the two striped pairs from the check; `$table-is-striped: false` still checks them, because `.striped` paints them.
  - `$table-head-background: #777777` stops the compile naming `$table-head-font-color` at 4.42:1 and both link colours on it.
  - `$table-head-font-color: #1177dd` on `$table-head-background: #0a0a0a`, 4.44:1 by the exact formula and 4.51:1 by Foundation's `color-luminance()` (building-blocks 1.10's measured pair), stops the compile naming 4.44:1, pinning the exact helper.
- Pure logic: none worth isolating; the name computation is covered through the DOM in layer 2.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in three engines:

- Stacked layout (1.3.1, 1.4.10): in `table--stacked` at 375 by 800 px, every header cell and the footer row have non-zero boxes, the four header cells sit one below another, and `document.documentElement.scrollWidth` is at most 375; at 1280 by 800 px the four header cells share one top edge.
- Keyboard scrolling (2.1.1): in `table--scroll` and `table--scroll-table` at 320 by 640 px, one Tab focuses the region or the table, one Right Arrow increases its `scrollLeft`, and `document.documentElement.scrollWidth` is at most 320.
- Focus visible (2.4.7): a screenshot of `table--scroll` after Tab differs from one before it around the region's edge.

Against the prerendered fixture app, on the Table route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; Tab focuses the scroll region and Right Arrow scrolls it before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

Manual release test (ADR 0022): with VoiceOver on Safari (macOS and iOS) at a width below the stack breakpoint, `table--stacked` announces each data cell with its column header and the table as a table; with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, focusing the region in `table--scroll` announces "Words for frameworks" and region, and focusing the `table--scroll-table` table announces its caption and table.

## Out of Scope

- Per-cell header labels in a stacked table (a `data-label` attribute shown through generated content): not a Foundation feature; where table semantics survive, screen readers would read each header twice, and alternative text for generated content is outside the Browser target (`scope-boundary`).
- Sorting (`aria-sort`), filtering, row selection, pagination, sticky header rows or columns, column resizing, virtual scrolling, and a data source: not Foundation features; CDK's `CdkTable` and the consumer's template own them (`scope-boundary`).
- A component that renders rows from data, in Material's `MatTable` shape: Foundation's markup carries every element (ADR 0001) (`scope-boundary`).
- Directives on `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th`, and `td`: Foundation gives them no class (ADR 0039's tag rule) (`scope-boundary`).
- Explicit ARIA table roles (`role="table"`, `row`, `cell`, `columnheader`) on the native elements, as `CdkTable` writes and older responsive-table recipes add: table semantics survive `display: block` rows, cells, and tables in the Browser target (measured in Chromium and Firefox; published for Safari 17), and the rows and cells carry no directive to hold them (`platform-or-a11y`).
- Inputs for `$table-is-striped`, `$table-stripe`, `$show-header-for-stacked`, or `$table-stack-breakpoint`, and a per-breakpoint `stack`: compile-time Sass settings that generate no class (AGENTS.md Design Philosophy 5) (`variant-as-class`).
- A Scroll region that is a focus stop only while its content overflows: the server HTML must be keyboard-reachable before hydration, measuring the overflow adds an observer and changes the tab order under the user's focus, and an extra tab stop fails no criterion (D10) (`other`).
- The Variant registries, the helper types, and the declaration-file tooling: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Table adds no registry (`scope-boundary`).
- Runtime theming through custom properties (building-blocks 1.13) (`scope-boundary`).

## Further Notes

### Design decisions

Each rejected alternative carries its reason category from the out-of-scope audit.

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Two attribute directives in `ngx-foundation-sites/table`: `table[nfsTable]` for the table's Variant classes, and `div[nfsTableScroll]`, which binds `.table-scroll` | ADR 0001 and ADR 0039: `.table-scroll` is a Structural class on a consumer-written wrapper, and native `<table>` takes Variant classes, so it gets a directive for them (ADR 0039, dated note), named after Foundation's `table` mixin (building-blocks 1.3); Foundation generates nothing | A table component rendering its own markup (Foundation's markup carries every element; `scope-boundary`); one directive on the table that also creates the wrapper (DOM creation before hydration, building-blocks 1.11; `jquery-or-dom-plumbing`) |
| D2 | Five boolean Variant inputs, `hover`, `unstriped`, `striped`, `stack`, `scroll`, through `nfsVariantBoolean`, each setting its class with a `[class.<name>]` binding; `false` sets none | Building-blocks 1.4 rule 4 and the [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md) answer, which names `unstriped` as a rule-4 boolean; every family is closed; the per-class bindings strip copied classes | `booleanAttribute` (accepts any string; `other`); one enum `stripes: 'striped' \| 'unstriped'` (the two classes never exist in one compile, so each is that compile's single on or off class, and Foundation names no dimension for them; `other`) |
| D3 | `nfsTable` is optional: a table with no Variant needs no directive | The directive exists for the Variant classes; Foundation styles `table` by tag; the other specs' plain tables stay correct | Requiring `nfsTable` on every table (a directive that binds nothing on most tables; `other`) |
| D4 | `div[nfsTableScroll]` binds static `class="table-scroll"`, `role="region"`, and `tabindex="0"`; the consumer names it with `aria-labelledby` at the caption or `aria-label` | axe `scrollable-region-focusable` on Foundation's wrapper in three engines (2.1.1); a focus stop needs a role and a name (4.1.2), and `region` is the landmark WAI-ARIA and published practice give it; static attributes are in server HTML; restricted to `div` because the role would replace a `table`'s or `figure`'s | `role` and `tabindex` on the table itself with no `display: block` (the table stops scrolling and stops being a table; `platform-or-a11y`); name inputs (the consumer writes the element and its attributes, the Progress Bar's D12 shape; `other`); a name derived from the caption by the directive (needs an id written after hydration, so the server HTML is unnamed; `jquery-or-dom-plumbing`) |
| D5 | The stripe pair has no Variant property and no Runtime check; setting both warns in development | Under each `$table-is-striped` value, the input whose class the compile lacks already has the look it asks for (the other state is the default), so a report would only name a redundant binding; building-blocks 1.13's flag-gated property exists for classes whose absence changes the look | A `--nfs-table-is-striped` property and a `strictVariantNames` report (a report for a binding that looks right; `other`) |
| D6 | `scroll` binds `.scroll` and `tabindex="0"`; the table keeps its native role and caption name | Foundation's wrapper-free form must be keyboard-reachable too (axe `scrollable-region-focusable` in three engines); measured through Windows UI Automation in Chromium and Firefox, the `display: block` table stays a Table with its headers and focus; current WebKit source builds tables from the DOM element | Dropping `scroll` for the wrapper (Foundation documents both, and the class rule leaves no class for the consumer; `other`); `role="region"` on the table (replaces the table role; `platform-or-a11y`) |
| D7 | `nfs-table` stops the compile unless `$show-header-for-stacked: true`, and emits `table.stack tfoot { display: table-footer-group; }` inside Foundation's stack media query | Measured in Chromium and Firefox platform trees: Foundation's default stacked table has 2 rows and no column headers; with the setting and the rule it keeps 4 rows and named headers, and the column names show above the rows; Foundation's own setting is the smallest fix for the header, and it has none for the footer (1.3.1, 1.4.10) | Dropping `stack` (the fix is one Foundation setting and one rule; `other`); a library rule that shows the header instead of the setting (re-implements Foundation's setting; `other`); a development warning only (a warning does not keep the footer; `other`); per-cell labels (Out of Scope; `scope-boundary`) |
| D8 | `nfsTable` warns in development when a stacked table renders with its `thead` or `tfoot` computing `display: none` | The only runtime signal of a missing `nfs-table` include, since no Variant property exists (D11); axe sees no hidden header | A `ResizeObserver` to re-check on resize (a development check that costs an observer; the e2e layer covers the narrow viewport; `other`) |
| D9 | Development name checks on every `nfsTable` host (caption, `aria-labelledby`, `aria-label`, `title`) and every scroll region (author sources only), once, at the first render | The APG Table pattern labels every table, and Material's docs require it; a focus stop needs a name (4.1.2); a `region` takes its name from its author only; axe checks no region name (measured); the name must be in server HTML | A required `aria-label` input (rules out `aria-labelledby` at the caption; `other`); a check only while `scroll` is set (leaves the APG label unchecked on every other table; `other`) |
| D10 | Every scroll region and `scroll` table is a focus stop whether or not its content overflows | Server HTML is keyboard-reachable before hydration and in `hydrate never`; no observer; an extra tab stop fails no criterion | A focus stop only while overflowing (an observer, and the tab order changes under focus; `other`) |
| D11 | `nfs-table` stops the compile with one `@error` listing every text or link pair under 4.5:1 on the table's backgrounds, by the exact formula; required on Foundation's defaults: the Callout's `$anchor-color` (and its hover line); no Variant property | Links fail on seven of eight backgrounds on Foundation's defaults (3.97 to 4.45:1; axe 4.14); the Callout already requires the same colour, which passes every table pair (5.15:1 and up); axe sees only the rows a story renders and never a hover state | Checking only the backgrounds on screen at rest (misses hover and footer; `other`); a table-scoped link colour rule (a second link colour on the site; `other`) |
| D12 | A development warning for Foundation's Variant classes copied onto the table, naming each input | Building-blocks 1.4 and the Button's D22; every Foundation example writes `class="hover"`, `class="stack"`, and the like | No check (a silent loss of the copied look; `other`) |
| D13 | No 1.4.11 check on stripes or borders; the browser's focus indicator | The stripes and borders are not graphical objects required to understand the data; the browser's unmodified indicator is exempt and visible (measured) | A 3:1 border or stripe requirement (Foundation's look would change for a criterion that does not apply; `platform-or-a11y`); a library focus style (the browser's already passes; `other`) |
| D14 | Native implementation level; no Aria, no CDK; listener-free; no explicit table roles | The native table is the APG Table pattern; Aria's grid is an interactive widget; `CdkTable` renders from data; table semantics survive display changes in the Browser target | Aria's grid (a composite widget with roving focus a static table does not have; `platform-or-a11y`); explicit roles (Out of Scope; `platform-or-a11y`) |
| D15 | Six stories; e2e for the stacked layout at two widths, keyboard scrolling, reflow, and focus visibility in three engines, and the fixture app's first paint, keyboard scrolling without JavaScript, and hydration; a manual screen-reader release test | Viewport widths and real key presses need real engines (building-blocks 1.12); WebKit's platform tree cannot be read on the test platform | An e2e for every story (play functions cover the rest; `other`) |
| D16 | Three glossary terms: **Table**, **Scroll region**, **Stacked table** | "Scroll region" is the contract the wrapper and `scroll` share, and the XY Grid's scrolling cells can follow it; "Stacked table" names the library's kept headers and footer | Keeping "scroll container" (any overflow box, focusable or not; `other`) |

### Usage examples

```html
<!-- A data table from a resource, with hover and a caption -->
@if (orders.hasValue()) {
  <table nfsTable hover>
    <caption>Open orders</caption>
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Total</th></tr></thead>
    <tbody>
      @for (order of orders.value(); track order.id) {
        <tr><th scope="row"><a [routerLink]="['/orders', order.id]">{{ order.id }}</a></th><td>{{ order.customer }}</td><td>{{ order.total | currency }}</td></tr>
      }
    </tbody>
  </table>
}

<!-- A wide table: the region is named from the caption -->
<div nfsTableScroll aria-labelledby="usage-caption">
  <table nfsTable unstriped>
    <caption id="usage-caption">Usage by month</caption>
    ...
  </table>
</div>

<!-- A short record list that stacks on phones -->
<table nfsTable stack>
  <caption>Plans</caption>
  <thead><tr><th scope="col">Plan</th><th scope="col">Storage</th><th scope="col">Price</th></tr></thead>
  <tbody>
    <tr><th scope="row">Basic</th><td>10 GB</td><td>Free</td></tr>
    <tr><th scope="row">Pro</th><td>1 TB</td><td>8 EUR a month</td></tr>
  </tbody>
</table>
```

```ts
@Component({
  selector: 'app-orders',
  imports: [CurrencyPipe, RouterLink, NfsTable],
  template: `...`,
})
export class Orders {
  protected readonly orders = httpResource<Order[]>(() => '/api/orders');
}
```

### Platform features to adopt when the browser target moves

- Firefox, and Chromium releases later than the Browser target's Chrome 119, make a scrolling box focusable without `tabindex` (published testing); Safari does not, so `tabindex="0"` stays until every engine in the Browser target does the same, and the role and name stay regardless.
- CSS alternative text for generated content (`content: "..." / ""`) would make per-cell stacked labels possible without double announcements; Out of Scope until it is in the Browser target.

### Foundation behaviour changed or dropped

- A stacked table keeps its column headers (the required `$show-header-for-stacked: true`) and its footer (the `nfs-table` rule) below the stack breakpoint and in print (D7).
- Foundation's scroll wrapper and scrolling table become focusable, named Scroll regions (D4, D6).
- On Foundation's defaults, `nfs-table` stops the compile until links pass on every table background, so `$anchor-color` becomes `#14679e` wherever the consumer sets it, the value the Callout already requires (D11).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-table` (part of `foundation-everything`). Its documented custom CSS is the `nfs-table` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-table`.

1. Rules. (a) `table.stack tfoot { display: table-footer-group; }` inside `@include breakpoint($table-stack-breakpoint down)`, the media query Foundation's `table-stack` rules use (`print, screen and (max-width: 63.99875em)` by default). Reason: WCAG 2.2 success criteria 1.3.1 and 1.4.10; Foundation's `table-stack` mixin hides `tfoot` below the breakpoint with no setting, so a footer's totals are lost for every user (D7). Same specificity as Foundation's `display: none`, later in source order. (b) Compile-time checks that emit no CSS: one `@error` that lists each failure, computed by the library's exact relative-luminance helper (`math.pow`), unrounded, which composites a translucent colour over `$body-background` first: `$show-header-for-stacked` is not `true` (D7); and every pair under 4.5:1 of `$body-font-color` on `$table-background` and `$table-row-hover` and, while `$table-stripe` is `even` or `odd`, on `$table-striped-background` and `$table-row-stripe-hover`; `$table-head-font-color` on `$table-head-background` and `$table-head-row-hover`; `$table-foot-font-color` on `$table-foot-background` and `$table-foot-row-hover`; and `$anchor-color` and `$anchor-color-hover` on each of those eight backgrounds (D11). Each failure names the settings and the ratio.
2. Reused, read from the consumer's compile: `$show-header-for-stacked`, `$table-stack-breakpoint`, `$table-stripe`, the eight table background settings, `$table-head-font-color`, `$table-foot-font-color`, `$body-font-color`, `$body-background`, `$anchor-color`, `$anchor-color-hover`, and Foundation's `breakpoint()` mixin. No Foundation value is copied; 4.5 is WCAG's number. The mixin takes no parameters.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: a stacked table hides its footer below the breakpoint, and neither check runs, so Foundation's header-hiding default and its failing links compile silently. `nfsTable`'s development check reports a hidden header or footer when a stacked table renders below the breakpoint (D8); no Runtime check reports it, because the Table has no Variant property.
6. Variant properties: none. Every Table family is closed, and the stripe pair's missing class never changes the look its input asks for (D5).

Required settings on Foundation's defaults, which the Storybook settings overrides mirror with the axe rule and the stories named in their comment (the last two lines are the Callout's, already there):

```scss
$show-header-for-stacked: true;
$anchor-color: scale-color($primary-color, $lightness: -15%);
$anchor-color-hover: scale-color($anchor-color, $lightness: -14%);
```

Foundation's settings file assigns `$show-header-for-stacked: false;` and computes each hover background from its resting background (`$table-head-row-hover` from `$table-head-background`, and so on), so an overrides file imported after it, as the Storybook preview's is, sets `$show-header-for-stacked` there and sets a hover setting again whenever it changes the matching background (measured: a changed `$table-head-background` alone left `$table-head-row-hover` at the old colour). A consumer who edits its own copy of the settings file changes the lines in place and gets the hover colours for free.

### Notes

- Print: Foundation's stack media query includes `print`, so a stacked table always prints stacked; with the required setting it prints its headers and footer.
- Right to left: Foundation aligns header and footer cells to `$global-left`, a compile-time setting; a Scroll region in a right-to-left context starts scrolled to the right, natively.
- Row headers: a `stack` table with a row header first in each row shows a bold start to each record, because the browser renders `th` bold and Foundation's stacked rules keep it.
- Scroll regions elsewhere: the XY Grid's cell blocks follow the same contract, a tab stop with `role="region"` on a `div` in the server HTML, named by the consumer ([Spec: XY Grid](../issues/99-spec-xy-grid.md), D8); they bind the attributes, because a cell can be a landmark of its own and is a cell block only at some breakpoints, where the Table's wrapper is always a scrolling `div`.
- Composition: `nfsTable` binds nothing another directive binds; a consumer's own directive beside it can add `aria-describedby` or classes of its own, and CDK's `cdk-table` can share the element (not measured).
