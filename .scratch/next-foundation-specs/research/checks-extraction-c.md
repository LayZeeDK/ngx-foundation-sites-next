# Checks extraction, group c

Group: c. Files: `specs/float-classes.md`, `specs/float-grid.md`, `specs/forgotten-import-checks.md`, `specs/forms.md`, `specs/interchange.md`, `specs/label.md`, `specs/magellan.md`, `specs/media-object.md`, `specs/menu.md`. Commit read: `ba07780` (branch `wayfinder`). Classification rule's source: ticket 158, [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), Decision item 1, applied per ticket 159's per-kind wording.

Kinds: `forgotten-import` (ADR 0046's four checks: In-family checks with their parent checks and child probes; `strictDirectiveImports`; `strictParents`; the static `missing-imports` builder; also `nfsDirectiveCheck` calls, the host record, the Selector manifest, the development-only token descriptions M7, and `nfsReportForgottenPeer`), `family` (a family's own development check reading another part of its family: registration checks, DOM-only placement checks, order checks, the outside-the-parent warnings of building-blocks 1.9), `misuse` (a directive's own development warning reading only its host, its inputs, its content, or the page), `runtime` (ADR 0040's Runtime checks), `build-time` (Library mixin `@error`/`@warn` checks and the Variant declaration tooling's check mode). A check fitting two kinds by wording goes to the kind of what it reads, forgotten-import first; boundary calls are recorded inline and summarized at the end.

A key distinction drawn while classifying: the shared `nfsDirectiveCheck` parent-check/child-probe mechanism (forgotten-import) is a different thing from a family's *own*, separately coded development check that also reads a peer element (family). Several specs say this explicitly (`specs/forgotten-import-checks.md` lines 197-199; `specs/menu.md` line 186, "reported once by its In-family parent check ... the directive runs no check of its own for it" -- forgotten-import; contrast `specs/media-object.md`'s check 3, D10, which is its own DOM read, left alone on purpose by the In-family paragraph -- family).

## specs/float-classes.md

### misuse: copied Foundation classes (D7)

Location: "API" subsection, check 1, line 145; design decision D7, line 335.

Text:

````
1. Copied classes (D7), at the first render: a static class list that holds `float-left`, `float-right`, `float-center`, or `clearfix` warns once, naming the attribute to write: "class="float-right" is set by nfsFloat: write nfsFloat="right" instead"; "class="clearfix" is set by nfsClearfix: write nfsClearfix instead". The consumer's own classes are not reported.
````

````
| D7 | One computed class list; copied Foundation classes reported in development, not stripped (clause 5) | Clause 5 as written, and one behaviour across the utility families (the Prototyping Utilities, Flexbox Utilities, and Visibility Classes all report copies); the list sets no class to `false`, so it never outranks another binding of the same class | A class record of the four classes that strips copies (building-blocks 1.4's shape for a component's own classes, the Menu's; cheap here, but it departs from clause 5 and from the other utility families, and its `false` entries would outrank a future owner's binding, as the Visibility Classes' D8 found) (`other`); no copy check (a silent second spelling) (`other`) |
````

Tests and stories: layer 2 (Browser-level test), line 290: "Copied classes (check 1): each of the four classes written statically beside the directive warns once, naming the attribute, and keeps styling (not stripped); a consumer class is silent."

Needs: `HostAttributeToken('class')` (optional), read only in development builds (Hierarchy and DI shape, line 118).

Rule as documented usage: none (the check enforces nothing a consumer must do beyond writing `nfsFloat`/`nfsClearfix` instead of the class, which the spec already states as the API).

Mentions: user story 12, line 39; Solution paragraph, line 24 ("a copied Foundation class"); Foundation behaviour changed or dropped, line 394.

### family: reversed reading-order (D8)

Location: "API" subsection, check 2, line 146; design decision D8, line 336; WCAG table row 1.3.2/2.4.3, line 190.

Text:

````
2. Reversed order (D8), on every run while `nfsFloat` is `left` or `right`: when the parent element's computed `display` is not a flex or grid value, the host's computed `float` is `left` or `right`, its previous element sibling's computed `display` is not `none` and its computed `float` is the end side of the parent's computed `direction` (`right` for `ltr`, `left` for `rtl`), and the host or that sibling is or contains focusable content (`a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` other than `-1`, `[contenteditable]`, none disabled): "nfsFloat="right": this element follows a sibling floated right, so on a shared line it is drawn before that sibling in the reading direction while Tab and assistive technology reach it after (WCAG 1.3.2, 2.4.3). Float one element that holds both in reading order, or lay them out with the Flexbox Utilities." The side and direction in the message are the ones read.
````

````
| D8 | A development check for a float that follows a sibling floated toward the end of the reading direction when either holds focusable content | Measured in three engines: two right-floated buttons are drawn in reverse and reached by Tab right to left, and a right float before a left one reverses the pair; ADR 0039 passes the ordering hazard (1.3.2, 2.4.3) to the utility specs; computed `float` and `direction` answer it the same at every width, and the focusable-content condition keeps it to what 2.4.3 measures, as the Flexbox Utilities' order check does; the computed `direction`, not `Directionality`, decides where a float goes | No check, only documentation (the one ordering hazard of this family would ship silently) (`other`); a geometric check comparing the boxes at the first render (floats that wrap at a narrow width would pass and fail at a wide one) (`other`); warning on every reversed pair, focusable or not (a row of decorative images would warn for no criterion) (`other`) |
````

Boundary call: classified `family`, not `misuse`, because it is an order check between two peer elements each carrying (or eligible to carry) `nfsFloat`, explicitly tied by its own rationale to "the Flexbox Utilities' order check" -- the canonical family-kind order check cited in `specs/forgotten-import-checks.md` line 199.

Tests and stories: WCAG table, line 190, test column: "Play function of `float-classes--reading-order` walks Tab through the group and asserts each focused box starts to the right of the previous one; e2e does the same with real key presses in three engines; browser-level tests of check 2, right-to-left included." Layer 2, line 291: "Reversed order (check 2): with two buttons in a block parent: right then right warns once, naming the side and direction; right then left warns; left then right, and left then left, are silent; right then right with two images and no focusable content is silent; in a `dir="rtl"` parent, left then left warns and right then left is silent; a right float whose previous sibling is not floated is silent."

Needs: none beyond computed style reads (`float`, `display`, `direction`) and the CDK-free focusable-content test listed inline in the check text; no Sass or TypeScript state of its own.

Rule as documented usage: "A float must not follow a sibling floated toward the end of the reading direction when either holds focusable content; float one element that holds a whole group in reading order instead."

Mentions: user story 13, line 40; user story 14, line 41; user story 19, line 46; Solution paragraph, line 24; usage example comment, line 383 ("the pair never reverses and development check 2 stays silent"); Foundation behaviour changed or dropped, line 394.

### misuse: no effect on a flex or grid item / clearfix on a flex or grid container (D9)

Location: "API" subsection, check 3, line 147; design decision D9, line 337.

Text:

````
3. No effect (D9), on every run: `nfsFloat` `left` or `right` whose parent element's computed `display` is `flex`, `inline-flex`, `grid`, or `inline-grid`: "nfsFloat="right" does nothing on a flex or grid item; align it with the Flexbox Utilities (alignX on the parent, alignSelf on the item) instead". `nfsClearfix` on a host whose own computed `display` is one of those: "nfsClearfix on a flex or grid container contains no floats, because its children cannot float, and its two pseudo-elements become items that shift justify-content spacing; remove it". `nfsFloat="center"` is not reported there: automatic margins centre a flex item on the main axis (CSS Flexbox, section 8.1).
````

````
| D9 | A development check for a float on a flex or grid item and a clearfix on a flex or grid container | Measured in three engines: the float does nothing (and WebKit even reports `float: none`, so the check reads the parent's `display`), and the clearfix's pseudo-elements take part in `justify-content` (267 px lost in a 600 px row); Foundation's flex parents make both easy to write; the Flexbox Utilities and Media Object report their own no-effect cases the same way | No check (a silent no-op, and a silent layout shift) (`other`); stripping the clearfix's pseudo-elements with library CSS on flex containers (a rule over a consumer mistake, and `:has()` is not used in library CSS) (`other`) |
````

Boundary call: classified `misuse`, not `family`, because it reads generic CSS layout state (the host's own or its parent's computed `display`) to decide whether the directive's own effect (a float, a clearfix) computes to anything -- not the presence of a specific related directive/class on a family member. Unlike `specs/media-object.md`'s check 3 (D10, family), this check does not ask "is my ancestor a member of my family"; it asks "does my own CSS property do anything given whatever layout mode surrounds me", which reads only the host and the page's computed style (misuse's own catch-all).

Tests and stories: layer 2, line 292: "No effect (check 3): `nfsFloat="right"` in a `display: flex` parent and in a `display: grid` parent warns once; `nfsFloat="center"` there is silent; `nfsClearfix` on a `display: flex` host warns once, and on a block host is silent."

Needs: computed `display` reads on the host and, for the float form, on the parent element; no Sass or TypeScript state.

Rule as documented usage: "`nfsFloat="left"`/`"right"` does nothing on a flex or grid item; use the Flexbox Utilities' `alignX`/`alignSelf` there instead. `nfsClearfix` does nothing on a flex or grid container; remove it."

Mentions: user stories 15 and 16, lines 42-43; Solution paragraph, line 24.

### Kept (not a check)

- `nfsFloat`'s closed union type (`'left' | 'right' | 'center'`) and its compile error for a misspelt or copied-class value (D4); `nfsClearfix`'s typed boolean through `nfsVariantBoolean` and its compile error for `"flase"` (D5) -- typed inputs, kept.
- ARIA and keyboard table (lines 168-182): native role, name, state; no APG pattern; Tab/Shift+Tab follow DOM order -- kept.
- "Runtime checks: none" (line 148) and D10 (line 338, no Library mixin, Variant property, or Runtime check call) -- there is no build-time or runtime check to extract; stated as an absence.
- Story play functions, browser-level tests, SSR smoke, and e2e (Testing Decisions, lines 274-311) -- the library's own tests, kept.

## specs/float-grid.md

### misuse: copied Foundation Float Grid classes (D7)

Location: "API" subsection, development-mode checks item 1, lines 244; design decision D7, line 483; binding rule, line 154.

Text:

````
1. Copied classes, on both directives, once per instance at the first render: a static class list holding a Float Grid class the directive sets warns once, naming each class with its input, for example "class="columns medium-6 large-push-2" is set by nfsColumn: bind [size]="{medium: 6}" and [push]="{large: 2}" instead, and drop columns, the alias of the column class nfsColumn binds". The patterns are built from the Breakpoint map's names (`nfsBreakpointsToken`): the size, offset, push, pull, centring, `up`, and collapse templates, `gutter-<word>`, `collapse`, `expanded`, `end`, `column-block`, `columns`, and the other directive's static class (`row` copied onto `nfsColumn` names `nfsRow`, for a column row). A copied class is not stripped (D7); a redundant copy of the host's own static class is not reported; the consumer's own classes are not reported.
````

````
| D7 | One `computed` class list per directive through `[class]`; copied Foundation classes are reported in development, not stripped | The Button's, Callout's, and XY Grid's rule for open families | A record of every owned class set `false`, the Menu's form (the class set depends on the consumer's settings) (`other`) |
````

Tests and stories: layer 2, line 428: "Development checks: `class="columns medium-6 large-push-2 small-centered"` on `nfsColumn` warns once, naming `size`, `push`, `centered`, and the `columns` alias, and the copied classes remain; a redundant `column` does not warn; `row` copied onto `nfsColumn` names `nfsRow`; `class="collapse gutter-small small-up-2"` on `nfsRow` names `collapse`, `gutter`, and `up`."

Needs: `nfsBreakpointsToken` (for the breakpoint-name patterns), `HostAttributeToken('class')` (optional), development builds only (line 169).

Rule as documented usage: none (the check enforces nothing beyond the API's typed inputs).

Mentions: user story 23, line 50; binding rule paragraph, line 154; Design decisions D7 row.

### family: column placement (D11)

Location: "API" subsection, development-mode checks item 2, line 245; design decision D11, line 487.

Text:

````
2. Placement, on `NfsColumn`, read from the DOM at the first render, where an element is a row when it carries `row` or the `nfsRow` attribute: a host that is not also a row, whose parent element is not a row, warns once "nfsColumn: this column is not a direct child of nfsRow, so its row's block grid, collapse, and gutter do not apply"; a column row (a host that is a row) inside another row with `size` bound warns once "nfsColumn: a column row takes sizes only at the top level, not inside another row (Foundation's Combined Column/Row note)". An element that carries `nfsRow` without `row` is a row whose import was forgotten, which the `strictDirectiveImports` Runtime check reports once on that element and the static check in CI, so its columns, and a column row whose own `NfsRow` is forgotten, give no placement warning.
````

````
| D11 | Development placement checks: a column outside a row, and a sized column row inside another row | Silent failures in Foundation's markup that neither the types nor axe report; they read the DOM only in development (building-blocks 1.9) | A row token through DI (nothing in production needs it) (`other`) |
````

This is one of the checks `specs/forgotten-import-checks.md` names explicitly as family-kind, separate from the In-family mechanism: "A family's own development check that reports placement from the DOM alone (building-blocks 1.9; the Media Object's check 3, the Sticky's warning 1, the XY Grid's check 2, the Float Grid's check 2, the Flex Grid's check 3) says nothing for a parent element that carries a parent directive's attribute without its host class" (`forgotten-import-checks.md` lines 197, quoted in full under that file's section below).

Tests and stories: layer 2, line 428: "a column whose parent has no `row` class warns once, a column row outside a row does not, a column whose parent carries `nfsRow` with `NfsRow` left out of the test host's imports does not, and a column row with `size` inside another row warns once."

Needs: none beyond DOM reads of the parent element's static class/attribute; no Sass or TypeScript state.

Rule as documented usage: "A column must be a direct child of a row (or a row itself); a column row (`nfsRow nfsColumn` on one element) takes a `size` only at the top level, never nested inside another row."

Mentions: user story 24, line 51; In-family checks paragraph, line 172 ("a column outside a row is check 2's, read from the DOM").

### misuse: no Float Grid in the stylesheet (D10)

Location: "API" subsection, development-mode checks item 3, line 246; design decision D10, line 486.

Text:

````
3. No Float Grid in the stylesheet (D10), on `NfsRow`, once per realm at the first render of any row: when the host's computed `::after` `content` is `none`, it warns "nfsRow: this page's stylesheet has no Float Grid (.row has no clearfix), so columns stack at full width. Include foundation-grid, or foundation-everything($flex: false), and then nfs-float-grid; a stylesheet that compiles the Flex Grid needs the Flex Grid's directives from ngx-foundation-sites/flex-grid". Measured in three engines: a float row's `::after` `content` is `" "` on the float build and beside the XY Grid, and `none` on the Flex Grid compile and on Foundation's default compile.
````

````
| D10 | A development check, once per realm, that the page's stylesheet has a Float Grid, read from the row's clearfix (`::after` `content`) | A page on Foundation's default compile, or on the Flex Grid compile the docs' sentence produces, has no float rows and nothing reports it; the clearfix is present only under `foundation-grid` (measured in three engines on four compiles); once per realm, because the cause is one stylesheet | Reading the column's computed `float` (a centred column and a column row are `float: none` by design) (`other`); a `strictVariantProperties` report (the Variant properties can be present from the Flex Grid's mixin, D12, and prove nothing about `foundation-grid`) (`other`) |
````

Boundary call: classified `misuse` (reads only its own host's computed `::after` content) rather than `runtime` or `build-time`. It is deliberately not folded into the ADR 0040 Runtime checks (D10's own rejected-alternative column: "A `strictVariantProperties` report ... prove[s] nothing about `foundation-grid`"), and it is not a Sass `@error`/`@warn` (it runs client-side, from a render callback, against computed CSS, not at compile time).

Tests and stories: layer 2, line 428: "with no Float Grid CSS in the document, the first row warns once for the whole realm naming `foundation-grid` and the Flex Grid's entry point, and a second row does not warn again (a test file of its own); with the CSS, nothing is warned."

Needs: computed `::after` `content` read on the host; no Sass or TypeScript state of its own (distinct from the Runtime check's `--nfs-grid-column-count`/`--nfs-block-grid-max`/`--nfs-grid-column-gutter` properties, which are `runtime`-kind, below).

Rule as documented usage: none (the check enforces nothing a consumer must do beyond the "three ways to compile the Float Grid" already documented under "What enabling it needs").

Mentions: user story 25, line 52; "What enabling it needs" subsection generally (lines 100-119).

### family: visual order of pushed and pulled columns (D9)

Location: "API" subsection, development-mode checks item 4, line 247; design decision D9, line 485; WCAG table rows 2.4.3 and 2.4.11, lines 293 and 296.

Text:

````
4. Visual order (D9), on `NfsColumn`, on every run and again whenever `NfsMediaQuery.current()` changes, while `push` or `pull` holds a value above 0 in any form: it reads its parent row's element children that carry `column` and whose computed `display` is not `none`, groups them into lines by the top edge of their border box (within 1 px), and orders each line by its left edge, or by its right edge from the right when the row's computed `direction` is `rtl`. Among the columns that are or contain an element CDK's `InteractivityChecker` reports focusable and tabbable, a visual sequence that differs from the DOM sequence warns once per row and distinct sequence, naming the breakpoint and both sequences: "nfsColumn: at the large breakpoint the columns of <div class="row"> that hold focusable content appear in the order 2, 1, but keyboard focus follows the DOM order 1, 2 (WCAG 2.4.3). Write the columns in the order they are read and shown, or push and pull only columns without focusable content." One focusable column, or none, never warns. In the same pass, a column whose border box leaves its row's content box, or intersects another column's box in its line, by more than 1 px warns once per row and breakpoint: "nfsColumn: at the small breakpoint push and pull move a column of <div class="row"> out of its row or over its neighbour, which scrolls the page sideways (WCAG 1.4.10) or covers content; pair each push with the pull of the column it trades places with". Several pushed columns of one row share one report of each kind.
````

````
| D9 | The DOM order is the reading and focus order, and every push is paired with the pull it trades places with: requirements, shown in every recipe and asserted by every story; a development check reports, from the columns' box geometry and again at each breakpoint change, columns with focusable content that push and pull show out of DOM order, and a column they move out of its row or over its neighbour | WCAG 1.3.2, 2.4.3, 1.4.10, and 2.4.11; measured in three engines: the columns show B, A while Tab reaches A, B; an unpaired push scrolls the page 160 px sideways at 320 CSS px and an unpaired pull covers its neighbour by 80 px; axe has no rule for either; push and pull move boxes only sideways within a line, so line grouping by the top edge and ordering by the start edge give the visual order exactly; the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s D9 and D10 for order classes | Documenting only (a hazard needs a signal, the Flexbox Utilities' D9) (`platform-or-a11y`); checking every row, not only those with push or pull (pays for rows the grid did not reorder) (`other`) |
````

Tests and stories: WCAG table, line 293: "Browser-level tests of the check; node-level tests of its sequence logic; `float-grid--source-ordering` asserts that nothing is warned." Line 296: "`float-grid--source-ordering` asserts that no two columns' boxes overlap; browser-level tests of the check." Layer 2, line 428: "two columns holding a button each, reversed by `size="10" push="2"` and `size="2" pull="10"`, warn once, naming the breakpoint and both sequences; the same after a re-render does not warn again; the same columns with text only, or with a button in one of them only, stay silent; a resize of the test frame to a width where a `large` push no longer applies stays silent and back again does not repeat the report; a `dir="rtl"` row whose pulled column holds the first button is read from the right; `size="6"` beside `size="6" push="6"` warns once that a column leaves its row, and `size="6"` beside `size="6" pull="3"` once that a column covers its neighbour, while Foundation's paired examples stay silent."

Needs: CDK `InteractivityChecker` and `NfsMediaQuery` (Hierarchy and DI shape, line 169, development builds only); no Sass or TypeScript state of its own.

Rule as documented usage: "The DOM order of columns is the reading and focus order; use `push`/`pull` only to rearrange the look, and pair every push with the pull of the column it trades places with, at the same breakpoints."

Mentions: user stories 10, 11, 12, lines 37-39; ARIA table row, line 278; WCAG table rows 2.4.3/1.4.10/2.4.11, lines 293/294/296; Notes section reference to "the Flexbox Utilities' order check" pattern.

### forgotten-import: In-family checks (`nfsDirectiveCheck` for `NfsRow`/`NfsColumn`) and shared names with the Flex Grid

Location: "Hierarchy and DI shape", lines 171-172.

Text:

````
- Names shared with the legacy Flex Grid (D1): Foundation gives the Flex Grid the same `.row`, `.column`, size, offset, block-grid, `.expanded`, `.collapse`, `.<bp>-collapse`, `.<bp>-uncollapse`, and `.column-block` classes, and compiles one legacy grid or the other (`foundation-everything` chooses by its `$flex` argument), so its directives take the same selectors, class names, and input names, with the same value shapes, for those classes in their own entry point, `ngx-foundation-sites/flex-grid` ([Spec: Flex Grid](../issues/101-spec-flex-grid.md)): `size`, `offset`, `up`, `expanded`, `columnBlock`, and `collapse`. Both bind `.column` and never `.columns`, and both share the registries `NfsGridColumnCountOverrides` and `NfsBlockGridMaxOverrides`. The Float Grid alone has `push`, `pull`, `centered`, `end`, and `gutter`; the Flex Grid alone has `unstack`, `isCollapseChild`, and the `'expand'` and `'shrink'` sizes. A page moves between the two legacy grids by changing its imports and its Sass, and the compiler lists the inputs that do not carry over; the development check of D10 reports a Float Grid directive on a Flex Grid compile, and the Flex Grid's own check the reverse.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in development builds only: `NfsRow` calls `nfsDirectiveCheck('NfsRow', {children: ['NfsColumn']})` and probes its columns, a column row inside it included; `NfsColumn` calls `nfsDirectiveCheck('NfsColumn')` and probes nothing, because a column holds the consumer's content and a row nested in it is a row of its own. Neither part has a parent check, because neither injects a parent (a column outside a row is check 2's, read from the DOM), and neither has a peer linked by reference or value; the probe reads the DOM in development only, so production keeps no link (D15); `strictParents` changes nothing. The Flex Grid's `NfsRow` and `NfsColumn` make the same two calls, so the two pairs agree as the Selector manifest's rule 2 requires of two directives with one class name (one selector and one host class): the host record keys a row or a column by that name whichever grid the component imports, and a report of a forgotten one names both entry points, `'ngx-foundation-sites/float-grid'` or `'ngx-foundation-sites/flex-grid'`, as NFS9001 does.
````

Tests and stories: none dedicated in this file beyond the general `nfs-imports`/`strictDirectiveImports` machinery, which is `specs/forgotten-import-checks.md`'s own test surface.

Needs: the shared `nfsDirectiveCheck(class, {children})` utility, the host record, and the Selector manifest (all from `specs/forgotten-import-checks.md`, out of this file); this file's own contribution is the two calls and the note on the Selector manifest's rule 2 (two same-named directives sharing one selector/host class).

Rule as documented usage: none (this content is the forgotten-import mechanism itself, which moves as a whole with `specs/forgotten-import-checks.md`).

Mentions: Design decision D10, line 486 ("the development check of D10 reports a Float Grid directive on a Flex Grid compile"); check 2 text, line 245 ("An element that carries `nfsRow` without `row` is a row whose import was forgotten, which the `strictDirectiveImports` Runtime check reports").

### runtime: `strictVariantNames`/`strictVariantProperties` for `size`, `offset`, `push`, `pull`, `up`, `gutter`, breakpoint keys

Location: "API" subsection, "Runtime check" paragraph, line 248.

Text:

````
- Runtime check, in the same read phase: each directive calls `include()` only while a value that reads a property is bound, because `nfs-float-grid` carries no rule the grid needs (the Breakpoint service spec's rule for such directives): `NfsColumn` calls `include('nfs-float-grid', ['grid-column-count'])` while `size`, `offset`, `push`, or `pull` holds a count; `NfsRow` calls `include('nfs-float-grid', ['block-grid-max'])` while `up` or `gutter` is bound, naming the count because `--nfs-grid-column-gutter` is legitimately empty under a static gutter; each calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])` while a rules key above the Zero breakpoint is bound. Then `value(input, value, needs)` for each bound input, with the needs from the same mapping that sets its classes: a size `n` needs `{setting: 'grid-column-count', name: n}`; an offset, push, or pull `n` needs `{setting: 'grid-column-count', name: n + 1}`; an `up` count `n` needs `{setting: 'block-grid-max', name: n}`; a gutter key needs `{setting: 'grid-column-gutter', name: key}`; every rules key above the Zero breakpoint needs `{setting: 'breakpoint-classes', name: bp}`. The Zero breakpoint needs no `breakpoint-classes` name, because every Float Grid family adds it to `$breakpoint-classes` (measured). `.collapse`, `expanded`, `end`, and `columnBlock` need nothing. A value that maps to no class passes `null`. The report shape and configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)). One writer: `nfs-float-grid` alone writes `--nfs-grid-column-gutter`; `--nfs-grid-column-count` and `--nfs-block-grid-max` belong to settings the Flex Grid loops over too, so its Library mixin writes them as well (D12), and a missing `nfs-float-grid` is reported only while the Flex Grid's mixin is missing too, as a missing `nfs-progress-bar` is only while `nfs-callout` is missing ([Spec: Progress Bar](../issues/95-spec-progress-bar.md)).
````

Tests and stories: layer 2, line 429: "with a style block writing `--nfs-grid-column-count: 12; --nfs-block-grid-max: 8; --nfs-grid-column-gutter: small medium; --nfs-breakpoint-classes: small medium large;`, bound values within range are silent; `size` 13, `push` 12, and `up` 9 through a cast report `strictVariantNames` once each, naming `$grid-column-count` and `$block-grid-max`; `gutter="large"` through a cast reports naming `$grid-column-gutter`; with `--nfs-grid-column-gutter` empty, `gutter="small"` reports the name and no missing include; an `xlarge` rules key through a cast reports naming `$breakpoint-classes`; with no properties, a column with `size="6"` reports `strictVariantProperties` once naming `@include nfs-float-grid;`, and a row with only `collapse` or `expanded` asks for nothing."

Needs: `nfsVariantCheck('nfsRow')`/`nfsVariantCheck('nfsColumn')` handles (Hierarchy and DI shape, line 169); the Variant properties `--nfs-grid-column-count`, `--nfs-block-grid-max`, `--nfs-grid-column-gutter`, and `--nfs-breakpoint-classes` (written by `nfs-float-grid`/`nfs-flex-grid`/`nfs-breakpoint-properties`, themselves not checks -- kept).

Rule as documented usage: none (the check enforces nothing beyond the already-documented column-count, block-grid, gutter-key, and breakpoint-name settings).

Mentions: user story 26, line 53; design decision D12, line 488 (one-writer exception).

### Kept (not a check)

- Typed inputs (`size`, `offset`, `push`, `pull`, `up`, `centered`, `collapse`, `gutter`, `expanded`, `end`, `columnBlock`) and their compile errors over the closed count/gutter/breakpoint registries (D6, lines 217-231) -- kept.
- `nfs-float-grid` Library mixin's CSS (none) and the Variant properties it writes (D12; Sass subsection item 6) -- kept (property-writing, not a check).
- ARIA and keyboard table (lines 271-284); D15 (no ARIA role) -- kept.
- D13 (a page compiling both grids keeps `$grid-column-count` equal to `$grid-columns`; "documented, not checked") -- explicitly not a check; kept.
- Story play functions, browser-level tests, SSR smoke, Sass compile test, and e2e (Testing Decisions, lines 404-452) -- the library's own tests, kept.

## specs/forgotten-import-checks.md

This whole file is the deferred forgotten-import spec (per ticket 158 item 1, it keeps its filename and content as the later-milestone home for ADR 0046's four checks). Its own content is forgotten-import kind throughout and is not itemised here, since it moves as a whole: `nfsDirectiveCheck` and the In-family checks (parent checks, out-of-reach report M4, child probes), the runtime manifest check `strictDirectiveImports`, `strictParents`, the static `ngx-foundation-sites:missing-imports` builder/generator, the Selector manifest, the host record, the development-only parent-token descriptions (M7), and every message id (M1-M10, NFS9001-NFS9004).

Searched for content that belongs to another kind (family, misuse, Runtime, or build-time) stated *by this file itself*, as opposed to cross-references naming other specs' own checks by example. None found: every generic "Runtime check" reference in this file is to `strictDirectiveImports` itself, which the ruling's classification list names explicitly under forgotten-import ("`strictDirectiveImports`" is one of ADR 0046's four checks). The file's cross-references to other specs' family checks (lines 197-199, quoted below) describe *those specs'* checks in order to state the boundary rule between the In-family mechanism and a family's own DOM-read checks; they do not themselves define or restate those checks' text, tests, or needs, so they are not extracted as separate entries here -- each named family's own manifest (this group's `media-object.md`/`float-grid.md` sections above, and other groups' Sticky/XY Grid/Flex Grid/Drilldown/Nested menu/Orbit/Off-canvas/Triggers/Abide/Top Bar/Visibility Classes/Close Button/Dropdown pane/Flexbox Utilities sections) carries the full extraction:

````
- A family's own development check that reports placement from the DOM alone (building-blocks 1.9; the Media Object's check 3, the Sticky's warning 1, the XY Grid's check 2, the Float Grid's check 2, the Flex Grid's check 3) says nothing for a parent element that carries a parent directive's attribute without its host class: that element is a forgotten import, which `strictDirectiveImports` reports once with the import to add, and the static check in CI, so the placement message never names the wrong fix and the defect is reported once. A warning about a separate misuse that stays wrong once the import is added reads such an element as the parent and still fires (an `offset` under a forgotten `nfsGridY`, a sized column row under a forgotten outer `nfsRow`).
- A family's own development check that finds a peer by registration (the Drilldown's checks 1 and 2, the Nested menu's check 4, the Orbit's checks 1 and 3, the Off-canvas panel's check 3, the Triggers' check 1, the Abide label's and Form error's "no field resolves" warnings and its field's warning for an error state with no visible Form error) likewise says nothing where the element it looks for carries the peer directive's attribute: a forgotten child is its parent's child probe report (M2), and a forgotten parent that has no parent check, because its injection stays optional (the Drilldown wrapper), is `strictDirectiveImports`'s report (M1), so the defect is reported once and the family message never names the wrong fix. A registration check that looks for no element, because its peer is linked only by a required reference whose forgotten import fails to compile, keeps its message (the Responsive Toggle's check 3: the bar reaches its menu through `[nfsResponsiveToggle]="menu"`, NG8002 or NG8003 when either import is forgotten), and so does a check that is the report for a truly bare part, with no element carrying the peer's attribute at all (the kept-optional case of the family rule's item 2).
- A family's own development check that finds a peer of another family by that peer's class reads the peer directive's attribute too where one directive owns the class, so a forgotten import of that directive neither hides a misuse that stays once the import is added nor draws a message that names the wrong fix (the Top Bar's check 3 with `nfsButton` and `nfsCloseButton` beside `nfsMenuIcon`, the Visibility Classes' check 3 with an enclosing `nfsSticky`, the Close Button's check 3 with `nfsButton` on its element, the Dropdown pane's check 8 with an enclosing `nfsButtonGroup`); where any family's directive can be the peer, the check keeps its class read and its message names the forgotten-import case (the Flexbox Utilities' check 2).
````

(lines 197-199)

## specs/forms.md

### misuse: `NfsFormLabel`'s `for` check

Location: "API per directive" table, `NfsFormLabel` row, line 186.

Text:

````
| `NfsFormLabel` | `label[nfsFormLabel]` | `[class.middle]`: `middle()` | `middle`: `boolean` through `nfsVariantBoolean` (parameter `boolean | '' | 'true' | 'false' | null | undefined`), default `false` | A label with a `for` whose `control` is `null` (the id names no labelable element) warns once: "label for=<id> names no form control, so no field gets this label (WCAG 1.3.1, 3.3.2, 4.1.2)" |
````

Tests and stories: layer 2, line 410: "`NfsFormLabel` check: a `for` naming a missing id warns once; a `for` naming a `div` warns once; a correct `for` and a wrapping label do not warn; a label with neither does not warn (a custom control's wrapper)."

Needs: `ElementRef` (development builds only, read only inside the check; Hierarchy and DI shape, line 140); one `afterNextRender` read callback (API section, line 197), reading `for` and the native `control` property.

Rule as documented usage: "A `label[nfsFormLabel]`'s `for` must name a real labelable control (wrapping the control, or a correct `for`/`id` pair)."

Mentions: user story 12, line 47; Problem Statement, line 13 ("A mistyped id leaves the field unlabelled with no signal"); WCAG table row 1.3.1, line 243.

### misuse: `NfsHelpText`'s id/pairing/placement check

Location: "API per directive" table, `NfsHelpText` row, line 187.

Text:

````
| `NfsHelpText` | `[nfsHelpText]` | static `class`: `help-text` | none | Warns once, the first that applies: no `id` ("help text needs an id listed in its field's aria-describedby"); no element in the host's root node lists the id in `aria-describedby` ("no field lists help text <id> in aria-describedby, so screen readers do not read it with the field (WCAG 1.3.1)"); a `label` ancestor ("help text inside a label becomes part of the field's name; place it after the label") |
````

Tests and stories: layer 2, line 411: "`NfsHelpText` check: no id warns; an id no element lists warns; an id listed by a plain field's static `aria-describedby` does not warn; an id composed into `aria-describedby` by `NfsAbideInput` does not warn; help text inside a `label` warns; each warning fires once per instance."

Needs: `ElementRef`, one `afterNextRender` read callback that performs "one `querySelector` on the host's root node for `[aria-describedby~="<id>"]` (the id passed through `CSS.escape`)" (API section, line 197); `closest('label')`.

Rule as documented usage: "Every `nfsHelpText` needs an `id`, that id listed in its field's `aria-describedby`, and must not sit inside the field's `label`."

Mentions: user stories 8 and 9, lines 43-44; D5, line 455; Problem Statement, line 12; WCAG table row 1.3.1, line 243.

### misuse: `NfsInputGroupField`'s no-label-source check

Location: "API per directive" table, `NfsInputGroupField` row, line 191.

Text:

````
| `NfsInputGroupField` | `input[nfsInputGroupField], select[nfsInputGroupField], textarea[nfsInputGroupField]` | static `class`: `input-group-field` | none | Warns once when the field has no name source: no associated label (`labels` is empty), no `aria-labelledby` that resolves to an element in the root node, and no non-empty `aria-label`. A placeholder, a `title`, and the group's prefix text do not count ("input group field has no label: add a label with for, aria-labelledby to visible text, or aria-label; a placeholder or the group's prefix is not a label (WCAG 1.3.1, 3.3.2, 4.1.2)") |
````

Tests and stories: layer 2, line 409: "`NfsInputGroupField` check: warns once for a field with no name source, and also for one named only by a placeholder, a `title`, or the prefix text; does not warn for a wrapping label, a `label for`, an `aria-labelledby` that resolves, or a non-empty `aria-label`; an `aria-labelledby` that names a missing id warns."

Needs: `ElementRef`, one `afterNextRender` read callback (API section, line 197), reading `labels`, `aria-labelledby`, `aria-label`.

Rule as documented usage: "An `nfsInputGroupField` must have a real accessible name: a wrapping or `for` label, an `aria-labelledby` that resolves, or a non-empty `aria-label`; a placeholder or the group's prefix text does not count."

Mentions: user stories 15 and 16, lines 50-51; D6, line 456; Problem Statement, line 11; WCAG table rows 1.3.1 and 3.3.2, lines 243/251.

### forgotten-import: In-family checks (`nfsDirectiveCheck` for the seven Forms directives)

Location: "Hierarchy and DI shape", lines 143-149.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsInputGroup` calls `nfsDirectiveCheck('NfsInputGroup', {children: ['NfsInputGroupLabel', 'NfsInputGroupField', 'NfsInputGroupButton']})`: no parent check; it probes its three parts; no peers; `strictParents` changes nothing.
  - `NfsInputGroupLabel`, `NfsInputGroupField`, and `NfsInputGroupButton` each call `nfsDirectiveCheck` with their class name: no parent check (they inject no parent: a part outside a group only looks unjoined), no child probes (the `nfsButton` inside `nfsInputGroupButton` is the Button family's), and no peers; `strictParents` changes nothing.
  - `NfsFormLabel` calls `nfsDirectiveCheck('NfsFormLabel')`: no parent check, no child probes; peers: the control its `for` names by id, which its development check reads; `strictParents` changes nothing.
  - `NfsHelpText` calls `nfsDirectiveCheck('NfsHelpText')`: no parent check, no child probes; peers: the field whose `aria-describedby` lists its id, which its development check reads; `strictParents` changes nothing.
  - `NfsFieldset` calls `nfsDirectiveCheck('NfsFieldset')`, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
  - Beside the Abide directives (decided with the [Spec: Abide](../issues/31-spec-abide.md)): neither set probes the other's directives, and the shared verdict decides each attribute on an element on its own, from the directives that list that attribute, so a forgotten `NfsFormLabel` beside a working `NfsAbideLabel`, or a forgotten `NfsInputGroupField` beside a working `NfsAbideInput`, is still reported (the second by `NfsInputGroup`'s probe as well). The three development checks read the DOM and native properties only (`labels`, `control`, `aria-describedby`, `closest('label')`), and none of them looks for a library directive, so their messages hold when a neighbouring directive's import is forgotten: a consumer's static `aria-describedby` stays on a field whose `NfsAbideInput` is missing. No Forms directive sits on `ng-template` or `ng-container`.
````

Tests and stories: none dedicated beyond `specs/forgotten-import-checks.md`'s own test surface.

Needs: the shared `nfsDirectiveCheck(class, {children})` utility; this file's own contribution is the seven calls quoted above.

Rule as documented usage: none (mechanism content, moves with `specs/forgotten-import-checks.md`).

Mentions: "Beside the Abide directives" subsection, lines 151-164 (restates the same cross-family independence).

### build-time: `nfs-forms` Library mixin's five `@error` checks (D11)

Location: "Sass" subsection, item 1, lines 530-537; design decision D11, line 461.

Text:

````
1. Rules the library emits: none. Checks, each an `@error` that names the setting to change; every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10), never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal; border colours are read from the shorthands with Foundation's `get-border-value()`:
   - `$input-placeholder-color` on `$input-background`, at least 4.5:1 (1.4.3);
   - the `$input-border` colour on `$body-background`, or `$input-background` on `$body-background`, at least 3:1 (1.4.11, the boundary of an empty field);
   - the `$input-border-focus` colour on `$body-background` and on `$input-background-focus`, at least 3:1 each (1.4.11 and 2.4.7, the focus indicator of a select menu or colour input);
   - the `$input-border-focus` colour against the `$input-border` colour, at least 3:1 (1.4.1, the focused state is not a hue change alone);
   - `$select-triangle-color` on `$select-background`, at least 3:1, unless it is `transparent` (1.4.11).

   Reason: axe checks neither placeholder text nor borders, so without these checks a consumer on Foundation's defaults gets no signal (ADR 0022).
````

````
| D11 | A checks-only `nfs-forms` Library mixin with five `@error` checks and three required settings (`$input-placeholder-color: #737373`, `$input-border: 1px solid $dark-gray`, `$input-border-focus: 1px solid $black`) | ADR 0022 and building-blocks 1.10 (a compile-time check where axe has no rule, with the exact unrounded ratio); the resting look of every field belongs to this page, validated or not; a select menu has no caret, so its focus border is its indicator; Foundation has settings for every case, so no library rule is needed (ADR 0012) | `@warn` for the resting pairs (the `nfs-abide` choice, which a consumer can scroll past on defaults that fail by a wide margin); a library `select:focus` outline rule (Foundation already has the setting); leaving select focus to Foundation's 1.63:1 glow |
````

Tests and stories: Node-level Vitest, line 418: "Sass compile: Foundation's default settings plus `@include nfs-forms;` stop with an `@error` that names `$input-placeholder-color`, `$input-border`, and `$input-border-focus`; the Abide spec's settings without the focus border stop with the error naming `$input-border-focus` (1:1 from the resting border); the three required settings compile and emit no CSS; a `$select-triangle-color` under 3:1 fails, and `transparent` is accepted; a light `$input-border` with an `$input-background` that reaches 3:1 against the page passes (the background is the boundary); a pair at 4.49:1 fails although Foundation's rounding `color-contrast()` would report 4.5." Also the story `forms--field-contrast` (Story ids list, line 383) and WCAG rows for 1.4.1, 1.4.3, and 1.4.11 (lines 245-249).

Needs: `$input-placeholder-color`, `$input-border`, `$input-border-focus`, `$input-background`, `$input-background-focus`, `$select-triangle-color`, `$select-background`, `$body-background` (Sass reused-settings item 2, line 546); the library's internal contrast helper.

Rule as documented usage: "The consumer must set `$input-placeholder-color: #737373`, `$input-border: 1px solid $dark-gray`, and `$input-border-focus: 1px solid $black` (or an equivalent reaching the same ratios) for WCAG 2.2 AA on Foundation's default backgrounds."

Mentions: user story 26, line 61; WCAG table rows 1.4.1, 1.4.3, 1.4.11, lines 245-249; Sass subsection item 2 required-settings table, lines 540-546.

### Kept (not a check)

- `middle`'s typed boolean through `nfsVariantBoolean` and its compile error for `"flase"` (line 195) -- kept.
- ARIA and keyboard table (lines 219-235); no APG pattern -- kept.
- `nfs-forms` mixin's absence of CSS rules ("Rules: none", Sass item 1) -- the mixin emits no styling, only checks (already extracted above); kept as a note that there is no separate rules-kind entry.
- Required parent/label associations that are native HTML behaviour, not a directive check (`for`/`id`, `aria-describedby` composition by `NfsAbideInput`, out of this spec's own checks) -- kept.
- Story play functions, browser-level tests, SSR smoke, Sass compile test, e2e (Testing Decisions, lines 383-432) -- kept.

## specs/interchange.md

### misuse: `NfsInterchange` on an `<img>` host

Location: "API" subsection, "Development-mode checks" paragraph, line 199.

Text:

````
Development-mode checks (stripped from production builds): `NfsInterchange` on an `<img>` host throws "nfsInterchange does not support <img>: use <picture> with <source media> for art direction, or NgOptimizedImage (ngSrc with sizes) for resolution switching" (a construction-time read of the host's `nodeName`, which is also safe on the server); ...
````

Tests and stories: layer 2 (Browser-level test), line 390: "Development checks: `nfsInterchange` on `<img>` throws the documented error; ..."

Needs: a construction-time read of the host's `nodeName`; no Sass or TypeScript state.

Rule as documented usage: "`nfsInterchange` must not be written on an `<img>`; use `<picture>` with `<source media>` for art direction, or `NgOptimizedImage` for resolution switching."

Mentions: user story 6, line 36; Solution paragraph, line 22; design decision 1, line 439.

### misuse: rule-string and query-token validation warnings

Location: "API" subsection, "Development-mode checks" paragraph, line 199; Query resolution list, item 4, line 193.

Text:

````
... an unparseable segment of a rule string warns and is skipped; an unknown bare name warns once; a `namedQueries` key equal to a breakpoint name warns once that the breakpoint wins.
````

````
4. Otherwise: a development warning once per distinct string ("unknown Interchange query 'meduim'; use a breakpoint name, a named query, or a media query") and no match.
````

Tests and stories: layer 2, line 380: "Resolution order: ... an unknown bare word warns once per distinct string and never matches; a `namedQueries` key equal to a breakpoint name warns once and the breakpoint wins." Layer 2, line 390: "a malformed rule-string segment warns and the other rules still apply." Node-level Vitest, line 396: "the query classifier (breakpoint name, named key, raw query, unknown word)."

Needs: `parseNfsInterchangeRules` (the pure rule parser, exported); the Query resolution helper's four-step order (line 188-193); `nfsInterchangeDefaultsToken`'s `namedQueries` map.

Rule as documented usage: "An Interchange query must be a breakpoint name, a Named query key, or a raw media query (recognised by whitespace or `(`); any other bare word never matches. A rule-string segment must be `[path, query]`."

Mentions: user story 19, line 49; user story 20, line 50; Deltas from Foundation, line 106 ("A custom named query cannot shadow a breakpoint name ... and the shadowing key warns once in development").

### forgotten-import: In-family checks (`nfsDirectiveCheck` for `NfsInterchange`)

Location: "Hierarchy and DI shape", line 146.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsInterchange` calls `nfsDirectiveCheck('NfsInterchange')`, with no parent check, no child probes, and no peers, and `strictParents` changes nothing; `NfsInterchangeOutlet` sits on `ng-container` and calls nothing, so only the static check sees a forgotten outlet.
````

Tests and stories: none dedicated in this file.

Needs: the shared `nfsDirectiveCheck` utility.

Rule as documented usage: none (mechanism content).

Mentions: none beyond the quoted line.

### Kept (not a check)

- `rules`' typed union (`string | readonly NfsInterchangeRule<string>[]`) and the compiler's normal type errors for a malformed literal -- kept (not a runtime/dev check; a TypeScript compile error).
- No Variant class, no `nfsVariantCheck` report, no Runtime check reads Interchange (line 27, line 117) -- explicit absence, kept.
- No Library mixin/CSS (`No library CSS and no nfs-interchange mixin`) -- kept.
- The focus-move rule on a template swap (ARIA table, "Swap while focused") -- documented behaviour, not a check.
- ARIA/keyboard tables and WCAG requirements table (lines 231-256) -- kept.
- Story play functions, browser-level tests, SSR smoke, e2e (Testing Decisions, lines 352-416) -- kept.

## specs/label.md

### misuse: no text for screen readers (D5)

Location: "API" subsection, development-mode checks item 1, line 144; design decision D5, line 344.

Text:

````
1. No text (D5). The host's text, from its text nodes outside any element with `aria-hidden="true"` (visually hidden text counts), or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` outside such an element (building-blocks 1.10, Names), is blank, the host is not itself `aria-hidden="true"`, and it is not `role="img"` with a non-blank `aria-label` or `aria-labelledby`: "nfsLabel: this label has no text for screen readers; add visually hidden text that says what it shows, and aria-hidden="true" on its icon (WCAG 1.1.1). aria-label is not allowed on a label without a role (axe aria-prohibited-attr)". The last sentence is added only when the host carries `aria-label`.
````

````
| D5 | A development warning, once at the first render, for a label with no text outside `aria-hidden` subtrees, an image's `alt` counting as text, unless the host is `aria-hidden` or `role="img"` with a name; icon recipes hide the icon | An icon-only label says nothing to a screen reader, and axe reports nothing for it; an unhidden icon font glyph is a Private Use Area character in the label's text (measured in Chromium); a bare `aria-label` on a `span` is prohibited (axe `aria-prohibited-attr`, measured), so it does not count; the Badge's D5 check, word for word | An `aria-label` input (prohibited on a generic label, and it would hide the visible text from assistive technology) (`platform-or-a11y`); a check for an unhidden icon font glyph in a pseudo-element's `content` (a heuristic over icon libraries; the recipes and the docs cover it; additive later) (`other`); re-checking on every render (a MutationObserver for a development check costs more than it finds) (`other`) |
````

Tests and stories: layer 2, line 283: "Development text check: a label with text, with only visually hidden text, with an `aria-hidden` icon beside text, and with only an `img` whose `alt` is non-blank is silent; an icon-only label warns once; a label whose only text is inside `aria-hidden="true"` warns; `aria-label` on a label without a role warns with the `aria-prohibited-attr` sentence; `role="img"` with `aria-label` or `aria-labelledby` is silent; a host with `aria-hidden="true"` is silent; the check runs once, so text that arrives after the first render is not re-checked (documented)."

Needs: `ElementRef`, `afterRenderEffect` read phase (line 143); no Sass/TypeScript state.

Rule as documented usage: "Every `nfsLabel` must have text for screen readers: a visible or visually hidden text alternative, or a non-blank `alt`/`aria-label`/`aria-labelledby` when the host is `role="img"`."

Mentions: user story 15, line 45; WCAG table row 1.1.1, line 198.

### misuse: copied Foundation classes (D7)

Location: "API" subsection, development-mode checks item 2, line 145; design decision D7, line 346.

Text:

````
2. Copied classes (D7): a static class list that holds Foundation's default palette names warns, naming each class with its input, for example "class="alert" is set by nfsLabel: bind color="alert" instead". A copied Variant class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `label` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared names are left to the Variant check (the Button spec's D22 rule).
````

````
| D7 | A development warning for Foundation's default palette names copied onto the host | Building-blocks 1.4 and the Button's D22; every Foundation label example writes `class="label <color>"` | No check (a silent second spelling) (`other`) |
````

Tests and stories: layer 2, line 284: "Copied classes: `class="label alert"` warns once naming `color`; a redundant `class="label"` and the consumer's own class do not warn."

Needs: `HostAttributeToken('class')` (optional, development builds only; line 113).

Rule as documented usage: none (enforces nothing beyond binding `color`, already documented in the API).

Mentions: user story 17, line 47.

### misuse: on a link (D12)

Location: "API" subsection, development-mode checks item 3, line 146; design decision D12, line 351.

Text:

````
3. On a link (D12): the host is an `a` element: "nfsLabel: a label is not a link's look; on a link, Foundation's link hover and focus colour replaces an uncoloured label's text colour (1.27:1 on Foundation's defaults, WCAG 1.4.3), which axe does not test, and the cursor stays the default arrow. Put the label inside the link instead: <a href="..."><span nfsLabel>...</span></a>". It warns whatever `color` is, because a coloured label on a link fails as soon as its bound `color` becomes `undefined`.
````

````
| D12 | A label is never a control: a link or button carries the tag, with the label inside it or beside it; the directive warns in development when its host is an `a` element | Measured in three engines: on a link, Foundation's `a:hover, a:focus` rule (a type selector and a pseudo-class) outranks `.label` (one class), so the uncoloured label's text turns `$anchor-color-hover` on hover and focus, 1.27:1, in a state axe does not test, and `.label`'s `cursor: default` hides the link; a label inside the link keeps its colours in every state; a label is 23.45 px tall, under 2.5.8's 24 px; Material documents its static chip as not interactive | Documented only, as the Badge's D12 (a measured 1.4.3 failure no gate sees) (`platform-or-a11y`); a library rule restoring `$label-color` on `a.label:hover, a.label:focus` (makes a tag look like a control with no hover cue and keeps the arrow cursor) (`other`); warning on `button` hosts too (nothing fails there: `.label` outranks Foundation's button reset, measured) (`other`) |
````

Tests and stories: layer 2, line 285: "Link check: `nfsLabel` on an `a` host, with or without `href` and with or without `color`, warns once; a label inside a link and a label on a `button` are silent."

Needs: `ElementRef`, `afterRenderEffect` read phase (host tag-name read).

Rule as documented usage: "`nfsLabel` must not be written on a link; put the label inside the link instead."

Mentions: user story 13, line 43; WCAG table row 1.4.3, line 196.

### runtime: `include('nfs-label', ...)`/`value('color', ...)` (D11)

Location: "API" subsection, "Runtime check" paragraph, line 147; design decision D11, line 350.

Text:

````
- Runtime check: in the same read phase, on every run, `NfsLabel` calls `include('nfs-label', ['label-palette'])` whether or not `color` is bound, then `value('color', color, needs)` with the need `{setting: 'label-palette', name: color}` for a one-token value and `null` otherwise (D11). `strictVariantNames` compares a bound `color` with `--nfs-label-palette` and reports a value that is not one class token; `strictVariantProperties` reports a missing `@include nfs-label;` when that property reads empty. Only `nfs-label` writes it, so the one-writer rule holds. The report shape, the per-realm read, and the configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).
````

Tests and stories: layer 2, line 287: "Runtime check: with `--nfs-label-palette: primary secondary success warning alert` on the test document, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$label-palette`; in a test file of its own, with the property absent, a label with no `color` reports `strictVariantProperties` once, naming `@include nfs-label;`."

Needs: `nfsVariantCheck('nfsLabel')` handle (line 113); the Variant property `--nfs-label-palette` (written by `nfs-label`, kept below).

Rule as documented usage: none (enforces nothing beyond the already-documented `color` Variant input and `@include nfs-label;`).

Mentions: user story 18, line 48.

### build-time: `nfs-label` Library mixin's contrast `@error` check (D9)

Location: "Sass" subsection, item 1(c), line 434; design decision D9, line 348.

Text:

````
(c) Compile-time checks that emit no CSS, D9: one `@error` listing every failing pair, each with the setting, the palette name, the colour, and both ratios, computed by the library's exact relative-luminance helper (`math.pow`, a translucent colour composited over `$body-background` first), unrounded, never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal (building-blocks 1.10): `$label-color` on `$label-background` under 4.5:1, and every `$label-palette` entry whose better candidate is under 4.5:1.
````

````
| D9 | `nfs-label` stops the compile with one `@error` listing every pair under 4.5:1 by the exact formula (`$label-color` on `$label-background`; each `$label-palette` entry with the better of `$label-color` and `$label-color-alt`), each with both ratios; and emits `.label.<name> { color: <the better one>; }` only where Foundation's `color-pick-contrast()` picked the other | ADR 0022 and building-blocks 1.10: axe sees only the pairs a story renders; Foundation's pick uses the same function and candidates as the Badge's, measured to pick the failing candidate while the other passes (`#e10f69`, `#c30fe1`, `#d20fb4`, `#e10f87`: `$black` picked at 4.21 to 4.36:1 where `$white` reaches 4.51 to 4.66:1; 148 colours of an RGB grid in steps of 5), and to ignore alpha; a passing brand colour should not stop the compile for Foundation's arithmetic; the Badge's D9 and the Progress Bar's D8 pick by the exact ratio; on Foundation's defaults, and with the required setting, it emits no text rule | Check only, naming both ratios (the Button's current approach; a passing colour would be refused) (`other`); raising `$global-color-pick-contrast-tolerance` (changes every component's pick) (`other`); a text rule on every entry (copies what Foundation already emits correctly) (`other`); `@warn` (a consumer on Foundation's defaults would ship failing text) (`platform-or-a11y`) |
````

Tests and stories: Node-level Vitest, line 294-301 (Sass compile subsection): the full table-driven contrast test list (Foundation's defaults stop the compile naming `$label-palette` alert; the required setting compiles; corrected custom-colour forms compile; `pink: #e10f69` picks `$white`; an `rgba` entry composites over `$body-background`; `#777777` and `#1177dd` pin the exact helper against Foundation's `color-luminance()`; `$label-background: #ffae00` with default `$label-color` stops the compile; `$label-palette: ()` writes an empty property).

Needs: `$label-color`, `$label-color-alt`, `$label-background`, `$label-palette`, `$body-background`, Foundation's `color-pick-contrast()` (Sass item 2, line 435); the library's internal contrast helper.

Rule as documented usage: "The consumer must keep `$label-palette` (and the uncoloured `$label-color`/`$label-background` pair) at 4.5:1 or above; on Foundation's defaults, set `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));`."

Mentions: user stories 19-23, lines 49-53; WCAG table row 1.4.3, line 196; D10, line 349.

### Kept (not a check)

- `color`'s typed `NfsLabelColor` union and its compile error for a misspelt/removed name -- kept.
- `nfs-label`'s emitted CSS rule, `.label.<name> { color: <the better one>; }` (the D9 correction itself, distinct from the `@error` check quoted above) -- a CSS rule, kept, not a check.
- ARIA and keyboard tables (lines 169-188); no APG pattern -- kept.
- Story play functions, browser-level tests, SSR smoke, Sass compile test, e2e, manual assistive-technology release test (Testing Decisions, lines 262-319) -- kept.

## specs/magellan.md

### misuse: no in-page links warning

Location: "API: `NfsMagellan`" subsection, "Development-mode checks" paragraph, line 233.

Text:

````
Development-mode checks (only with `ngDevMode`, never on the server): in the first render callback, a host with no in-page links (including a host whose links are all `#`-only hrefs that `<base href>` resolves to another document; the composed Smooth Scroll check names each such link); ...
````

Tests and stories: WCAG table row 2.4.1, line 298 ("the dev check ... catch[es] it," referring to the landmark case below; the no-links case is asserted through the composed Smooth Scroll's own check, named in the text above).

Needs: a query of the host's in-page `a[href]` descendants (Smooth Scroll's in-page rule, reused).

Rule as documented usage: none (enforces nothing new; documents that a Magellan container needs in-page links to do anything).

Mentions: user story 42, line 75.

### misuse: not inside/is not a `nav` landmark warning

Location: "API: `NfsMagellan`" subsection, "Development-mode checks" paragraph, line 233; ARIA table, line 273; WCAG table row 2.4.1, line 298.

Text:

````
... a host that is neither inside nor itself a `nav` element or `role="navigation"` element; ...
````

````
| Navigation | The consumer's `nav` (implicit `navigation` landmark) with `aria-label` (for example "On this page") whenever the page has another `nav`; Magellan warns in development mode when it is not inside one; ...
````

````
| 2.4.1 Bypass Blocks (A) | The labelled `nav` landmark lets assistive technology skip or reach the navigation | A second unlabelled `nav`; the dev check and axe `landmark-unique` catch it |
````

Tests and stories: none of this group's dedicated layer-2/e2e bullets name this case by number, but it is covered under "Development-mode checks: each warning fires once for its case and not for correct markup" (layer 2, line 435).

Needs: `ElementRef`, `Renderer2`-free DOM ancestor read; `DOCUMENT`.

Rule as documented usage: "An `nfsMagellan` container must sit inside (or be) a `nav` (or `role="navigation"`) landmark."

Mentions: user story 42, line 75; ARIA table row "Navigation", line 273.

### misuse: `updateHistory` without `deepLinking`

Location: "API: `NfsMagellan`" subsection, "Development-mode checks" paragraph, line 233.

Text:

````
... `updateHistory` without `deepLinking`.
````

Tests and stories: layer 2, line 431: "`updateHistory` alone warns."

Needs: reads only its own two inputs.

Rule as documented usage: "`updateHistory` has no effect unless `deepLinking` is also on."

Mentions: input table row `updateHistory`, line 184.

### misuse: targets in different scroll containers

Location: "API: `NfsMagellan`" subsection, "Development-mode checks" paragraph, line 233; Tracking bullet, line 214.

Text:

````
... When the target set changes, targets in different scroll containers. ...
````

````
- Scroll container: in the first render callback, the nearest ancestor of the first target (in document order) whose computed `overflow-y` is `auto`, `scroll`, or `overlay`; otherwise the document. A development-mode warning names any target in a different scroll container. Recomputed when the target set changes.
````

Boundary call: read as `misuse` rather than `family`, because Magellan's targets carry no directive at all (D2: "No target directive"), so there is no family member being checked for -- only a generic DOM/CSS fact (which scroll container each target's computed style resolves to) that is part of "the page" a directive's own check may read.

Tests and stories: layer 2, line 430: "targets in two scroll containers warn once."

Needs: computed `overflow-y` per target; the target map (kept, functional state, not itself a check).

Rule as documented usage: "Every tracked section must scroll inside the same scroll container as the others."

Mentions: user story 42, line 75.

### misuse: unknown id written to `active`

Location: "API: `NfsMagellan`" subsection, "Development-mode checks" paragraph, line 233; Model bullet, line 192.

Text:

````
... On a consumer write, an unknown id.
````

````
- ... A write of an id that is not tracked marks no link and scrolls nowhere, with a development-mode warning; the next tracking update replaces it.
````

Tests and stories: layer 2, line 428: "an unknown id warns in development mode and marks nothing."

Needs: the target map (kept, functional).

Rule as documented usage: "A write to `active` must name a tracked section's id."

Mentions: user story 42, line 75.

### misuse: copied current-page marker onto a tracked link or its `li` (D18)

Location: "API: `NfsMagellan`" subsection, "Development-mode checks" paragraph, line 233; design decision D18, line 500.

Text:

````
When Magellan first sees a tracked link (in the first render callback's `earlyRead` phase, and in the read phase that picks up links added later, both before the marker write that would remove it), a `class="is-active"` on the link or its parent `li`, or an `aria-current` on the link, written in the markup: one warning per instance naming the element and saying that Magellan marks the Current section itself and that `[(active)]` sets it (D18).
````

````
| D18 | Magellan owns the marker on the tracked links and their list items: each marker write removes `.is-active` and `aria-current` from every tracked link and item outside the Current section, so a class copied from Foundation's markup is gone after the first client render; a development-mode check reports it once, read before that write. Decided 2026-09-27 under the class rule | Building-blocks 1.4: initial state is bound, never read from a class, and a copied class is stripped and reported; a host binding would strip it on server and client, but the marker is not a host binding (D11), so the write strips it on the client and the check names it; Magellan reads nothing from the markup, so the Current section's first value is the scroll position, a bound `active`, or the deep link | Removing only the links Magellan itself marked (a copied class stays forever, and two items look current); reading a copied `is-active` as the initial Current section (Foundation's markup never did, and tracking would overwrite it at once); stripping it in the server render (nothing Magellan does runs on the server; the server cannot know the Current section) |
````

Tests and stories: layer 2, line 429: "Copied marker (D18), the one case where a test host writes a Foundation class, on purpose: a host whose template writes `class="is-active"` on one tracked link and on a second tracked link's `li`, neither of them current, renders with no `.is-active` on either after the first render, reports once in development mode, and leaves an untracked link's own classes and attributes alone; the container is `ul[nfsMenu]`, whose `.menu` Magellan never touches."

Needs: the marker-write `afterRenderEffect` (keyed on `active()`, tracked links, `ariaCurrentWhenActive()`; itself not a check -- functional state).

Rule as documented usage: "The consumer must not write `.is-active`/`aria-current` on a tracked link or its list item; Magellan marks the Current section itself, or bind `[(active)]` to set it."

Mentions: user story 45, line 78; Rendered HTML comment, line 316.

### Kept (not a check)

- Typed inputs (`threshold` `numberAttribute`, `deepLinking`/`updateHistory` `booleanAttribute`, `ariaCurrentWhenActive`) -- kept (no closed-union compile error, these are Options, not Variant classes).
- `hostDirectives: [NfsSmoothScroll]` composition -- kept, not a check.
- ARIA and keyboard tables (lines 267-306); the focus rule (Smooth Scroll's, reused) -- kept.
- "No library CSS; there is no `nfs-magellan` mixin" (Sass subsection, line 393/658-666) -- kept, explicit absence.
- Story play functions, browser-level tests, SSR smoke, e2e, manual release test (Testing Decisions, lines 397-462) -- kept.

## specs/media-object.md

### misuse: copied Foundation Variant classes (check 1)

Location: "Development checks and runtime checks" subsection, item 1, line 165.

Text:

````
1. Copied classes, at the first render, read through `HostAttributeToken('class')`: on `NfsMediaObject`, `stack-for-<zero>` names `stackFor="<zero>"`, and a Flexbox Utilities parent alignment class (`align-top`, `align-middle`, `align-bottom`, `align-stretch`, `align-left`, `align-right`, `align-center`, `align-justify`, `align-spaced`, `align-center-middle`) names `nfsFlexAlign`; on `NfsMediaObjectSection`, `middle` and `bottom` name `alignment`, `main-section` names `mainSection`, and `align-self-<y>` names `nfsFlexChild alignSelf`. For example: "class="middle main-section" is set by nfsMediaObjectSection: bind alignment="middle" and mainSection instead". The binding rule has already stripped the classes this spec binds; the Flexbox Utilities classes keep styling until removed.
````

Tests and stories: layer 2, line 342: "Development checks: each of checks 1 to 3 warns once for its case and not for correct markup (a copied `stack-for-small`, `middle`, `bottom`, `main-section`, `align-self-middle`, and `align-center` each named with its input or directive; a redundant Structural class and an Application class not reported; ...)."

Needs: `HostAttributeToken('class')` (optional, development builds only, line 116).

Rule as documented usage: none (enforces nothing beyond the already-documented typed inputs).

Mentions: user story 15, line 42; binding rule paragraph, line 98.

### misuse: `stackFor` naming a non-Zero breakpoint (check 2)

Location: "Development checks and runtime checks" subsection, item 2, line 166.

Text:

````
2. `NfsMediaObject` with `stackFor` naming a breakpoint other than the Zero breakpoint, on every run while bound, once per value: "nfsMediaObject: Foundation generates only stack-for-<zero>, so stackFor="medium" sets no class; the sections stack only at the Zero breakpoint (<zero>)".
````

Tests and stories: layer 2, line 339: "`stackFor="medium"` warns once and `'small'` does not."

Needs: `nfsBreakpointsToken` for the Zero breakpoint's name (already injected for the class mapping; not check-only).

Rule as documented usage: "`stackFor` only sets a class at the Zero breakpoint; any other breakpoint name sets nothing."

Mentions: user story 6, line 33.

### family: section not a direct child of a media object (check 3, D10)

Location: "Development checks and runtime checks" subsection, item 3, line 167; design decision D10, line 392; In-family checks paragraph, line 118.

Text:

````
3. `NfsMediaObjectSection` whose parent element carries neither `.media-object` nor the `nfsMediaObject` attribute, read from the DOM at the first render: "nfsMediaObjectSection: this section is not a direct child of an nfsMediaObject element, so Foundation's CSS does not lay it out as a section; when a component renders it, put NfsMediaObjectSection in that component's hostDirectives" (D10). A parent that carries the attribute without the class is a forgotten `NfsMediaObject` import, not a misplaced section, and this message would name the wrong fix, so check 3 says nothing there: the `strictDirectiveImports` Runtime check reports the parent once with the import to add, and the static check reports it in CI.
````

````
| D10 | A section that is not a direct child of a media object warns in development, read from the DOM; a parent that carries `nfsMediaObject` without its host class is a forgotten import, left to the `strictDirectiveImports` report | A section is laid out only as a flex item or table cell of `.media-object`; a component that renders the section inside its own host makes the host the item, and projection hides DI, so the DOM is the only source; the fix is `hostDirectives` | A parent token with a warning (content projection keeps the declaration site's DI) (`other`); no check (the layout breaks without a message, since `mainSection` and alignment act on the wrong element) (`other`) |
````

This is one of `specs/forgotten-import-checks.md`'s own named examples of a family-kind placement check ("the Media Object's check 3", line 197, quoted in full under this group's `forgotten-import-checks.md` section above), explicitly distinguished there from the In-family mechanism.

Tests and stories: layer 2, line 342: "a section inside a wrapper `div` warns, and neither a direct child nor a direct child of an element that carries `nfsMediaObject` without the directive does."

Needs: `ElementRef`; a DOM read of the parent element's static class/attribute (not the In-family host record).

Rule as documented usage: "An `nfsMediaObjectSection` must be a direct child of an `nfsMediaObject` element (or, for a component rendering it inside its own host, that component must put `NfsMediaObjectSection` in `hostDirectives`)."

Mentions: user story 17, line 44; usage example, line 442; In-family checks paragraph, line 118 ("a section's placement is development check 3's DOM read (D10), which leaves a parent that carries nfsMediaObject without .media-object, a forgotten NfsMediaObject import, to the strictDirectiveImports check").

### misuse: overflow at 320 CSS px (check 4, D8)

Location: "Development checks and runtime checks" subsection, item 4, line 168; design decision D8, line 390.

Text:

````
4. Overflow (1.4.10, D8): `NfsMediaObject` creates a `ResizeObserver` on its host in `afterNextRender` and, in each callback, compares the host's `scrollWidth` with its `clientWidth`. The first time the content is more than 1 px wider than the box it warns and disconnects: "nfsMediaObject: its content is 335 px wide in a 320 px box, so the page scrolls sideways at this width (WCAG 1.4.10 Reflow); bind stackFor="small" to stack the sections at the Zero breakpoint, or narrow the side sections' content". While `stackFor` names the Zero breakpoint, the message gives only the second remedy. The observer is disconnected on destroy. Measured with the docs' content in three engines, the host's own `scrollWidth` shows every failing case at 320 px (335, 345, and 566 px) and none that fits; for a thread, the outer object reports, because the inner one's content forces the outer section wider.
````

````
| D8 | In development, `NfsMediaObject` observes its host with a `ResizeObserver` and warns once when its content is wider than its box, with both widths | axe has no reflow rule, and the docs' own overflow at 320 px is 15 to 25 px, easy to miss in a narrow window; the host's own `scrollWidth` showed every failing case and no passing one in three engines; resizing is how a developer reaches a narrow width, so a first-render reading alone would miss it; production pays nothing | No check (a silent 1.4.10 failure in Foundation's own examples) (`platform-or-a11y`); one reading at the first render (misses a window narrowed afterwards) (`other`); a check through the Breakpoint service at the Zero breakpoint only (overflow is a layout fault at any width, and the measurement needs no breakpoint) (`other`) |
````

Tests and stories: layer 2, line 342: "Check 4: a 485 px image beside text in a 320 px wide test container warns once with both widths and never again, and the same markup with `stackFor="small"` is silent at the 414 px test viewport; a container that narrows from 800 to 300 px warns once after the resize; destroying the host disconnects the observer."

Needs: `ResizeObserver` on the host (`afterNextRender`); reads only the host's own `scrollWidth`/`clientWidth`.

Rule as documented usage: "A media object whose sections do not fit side by side at 320 CSS px must bind `stackFor` to the Zero breakpoint."

Mentions: user story 19, line 46; WCAG table row 1.4.10, line 216.

### forgotten-import: In-family checks (`nfsDirectiveCheck` for `NfsMediaObject`/`NfsMediaObjectSection`)

Location: "Hierarchy and DI shape", line 118.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsMediaObject` calls `nfsDirectiveCheck('NfsMediaObject', {children: ['NfsMediaObjectSection']})` and probes its sections, a nested media object keeping its own; `NfsMediaObjectSection` calls `nfsDirectiveCheck('NfsMediaObjectSection')` and probes nothing. Neither has a parent check, because neither injects a parent: a section's placement is development check 3's DOM read (D10), which leaves a parent that carries `nfsMediaObject` without `.media-object`, a forgotten `NfsMediaObject`, to the `strictDirectiveImports` check and the static check. No peer is linked by reference or value; the Flexbox Utilities' and Thumbnail's directives written beside or inside belong to their own families and are not probed; `strictParents` changes nothing.
````

Tests and stories: none dedicated in this file.

Needs: the shared `nfsDirectiveCheck` utility.

Rule as documented usage: none (mechanism content).

Mentions: none beyond the quoted line.

### runtime: `include('nfs-media-object', ...)`/`value('alignment'/'mainSection', ...)`

Location: "Development checks and runtime checks" subsection, "Runtime checks" paragraph, line 170.

Text:

````
Runtime checks ([ADR 0040](../adr/0040-variant-input-types.md), configured by `provideNfsRuntimeChecks` and `provideNfsProductionRuntimeChecks` of `ngx-foundation-sites/media-query`, whose spec defines how a directive reports): `NfsMediaObjectSection` calls `nfsVariantCheck('nfsMediaObjectSection')` at construction and, in a render callback it creates only when the handle is not `null`, while `alignment` has a value or `mainSection` is true, calls `include('nfs-media-object', ['media-object-section'])`, then `value('alignment', value, needs)` and `value('mainSection', true, needs)`. The needs are `[{setting: 'media-object-section', name: 'middle'}]`, `'bottom'`, or `'main-section'`, and `null` for a value that is not one of the names. `strictVariantNames` then reports an `alignment` bound in a flexbox build (the property lists `main-section`) and a `mainSection` bound in a table build (it lists `middle bottom`), for example "ngx-foundation-sites [strictVariantNames]: nfsMediaObjectSection alignment "middle" has no class in the compiled CSS: $media-object-section generates main-section"; `strictVariantProperties` reports a missing `@include nfs-media-object;` once. An application that binds neither is not asked for the include (the Off-canvas and Top Bar rule of the Runtime checks). `NfsMediaObject` reads no Variant property and makes no call: `stackFor`'s class exists in every compile of `foundation-media-object`, and a drifted Zero breakpoint name is `strictBreakpointSync`'s report. They run in the browser after the first render, never on the server.
````

Tests and stories: layer 2, line 343: "Runtime checks: with `--nfs-media-object-section: main-section` on the test document, `mainSection` is silent and `alignment="middle"` reports once under `strictVariantNames`, naming `nfsMediaObjectSection`, `alignment`, `middle`, and `$media-object-section`; with `middle bottom`, `alignment` is silent and `mainSection` reports once; in a test file of its own, with the property absent and `alignment` bound, `strictVariantProperties` reports once, naming `nfs-media-object`, and no name is reported; with neither input bound, nothing is requested; `provideNfsRuntimeChecks({strictVariantNames: false})` silences the name reports."

Needs: `nfsVariantCheck('nfsMediaObjectSection')` handle; the Variant property `--nfs-media-object-section` (written by `nfs-media-object`, kept below, D6).

Rule as documented usage: none (enforces nothing beyond the documented `alignment`/`mainSection` inputs and `@include nfs-media-object;`).

Mentions: user stories 12, 24-26, lines 34-40.

### Kept (not a check)

- Typed inputs (`stackFor` over `NfsClassBreakpoint`, `alignment` closed `'middle' | 'bottom'`, `mainSection` boolean) and their compile errors -- kept.
- `nfs-media-object`'s single Variant property, `--nfs-media-object-section` (D6; properties-only mixin, no `@error`/`@warn`) -- kept.
- ARIA and keyboard tables (lines 192-208); no APG pattern -- kept.
- Story play functions, browser-level tests, SSR smoke, Sass compile test, e2e (Testing Decisions, lines 320-363) -- kept.

## specs/menu.md

### misuse: copied Foundation Menu class (check 1)

Location: "Development checks and runtime checks" subsection, item 1, line 184.

Text:

````
1. A Foundation Menu class copied onto the `nfsMenu` host (read through `HostAttributeToken('class')` in development builds only): the warning names the class and the input to bind (`vertical` and `medium-horizontal` name `orientation`; `align-right` names `align`; `icons` and `icon-top` name `iconPosition`; `<bp>-simple` explains that it renders the expanded layout and names `expanded`). A redundant `menu` is not reported. This is building-blocks 1.4's rule for copied classes. A copied class that the host still carries after the first render although `NfsMenu`'s record sets it `false` is bound by the hosting directive and is not reported: the Nested menu's `NfsSubmenu` binds `nested` and `vertical`, so Foundation's `class="menu vertical nested"` copied onto a submenu is redundant, not stripped.
````

Tests and stories: layer 2, line 373: "Binding rule: a static `class="vertical medium-vertical align-right icons"` is stripped with no input and with a conflicting input; a static `menu` and an Application class stay; ..." and line 375: "Development checks: the copied host class warns once naming the input; ..."

Needs: `HostAttributeToken('class')` (optional, development builds only); the binding rule's class record (functional, not itself a check).

Rule as documented usage: none (enforces nothing beyond the documented typed inputs).

Mentions: user story 17, line 39; Foundation behaviour changed or dropped, line 504.

### misuse: copied current-page marker without `aria-current` (check 2)

Location: "Development checks and runtime checks" subsection, item 2, line 185.

Text:

````
2. A copied current-page marker: a direct child `li` of the host with no nested list, carrying Foundation's `is-active` or `active`, whose link has no `aria-current` other than `false`. The warning names `aria-current="page"` on the link. The Nested menu's open parents carry a nested list, and Magellan sets `aria-current` with its `.is-active`, so neither is reported.
````

Tests and stories: layer 2, line 375: "a copied leaf `li.is-active` without `aria-current` warns once naming `aria-current`; a leaf with both, and a parent `li.is-active` with a nested list, do not warn."

Needs: `ElementRef`; a DOM read of direct-child `li` elements and their links' `aria-current`.

Rule as documented usage: "The current page must be marked with `aria-current` on its link (statically, bound, or through `RouterLinkActive`), not with Foundation's `is-active`/`active` class."

Mentions: user story 14, line 36; D4, line 422; Foundation behaviour changed or dropped, line 503.

### forgotten-import: In-family checks (`nfsDirectiveCheck` for `NfsMenu`/`NfsMenuText`, including `NfsMenuText`'s parent check = check 3)

Location: "Hierarchy and DI shape", lines 135-137; check 3, line 186.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsMenu`: `nfsDirectiveCheck('NfsMenu', {children: ['NfsMenuText']})`. No parent check: it injects no parent. It probes `NfsMenuText` on a plain `ul[nfsMenu]` and, hosted, on every menu Plugin root and every `ul[nfsSubmenu]`, because the shared spec's child probe also counts the host record, in which a hosted `NfsMenu` records its host element. No peers linked by reference or value. `strictParents` changes nothing.
  - `NfsMenuText`: `nfsDirectiveCheck('NfsMenuText', {parent})`, its development-only `inject(NfsMenu, {optional: true})` giving `found`. Parent check over `NfsMenu` and every directive that hosts it: `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, `NfsResponsiveMenu`, and `NfsSubmenu`, with the `alone` sentence "It is unstyled outside a menu." (Foundation scopes `.menu-text` under `.menu`), which replaces development check 3's warning, so an item outside a menu is reported once. No child probes: it is a leaf. No peers. `strictParents`: it throws the shared spec's error at construction when no menu is found.
````

````
3. `NfsMenuText` with no `NfsMenu` above it in its injector tree: reported once by its In-family parent check (Hierarchy and DI shape), whose sentence says the item is unstyled outside a menu; the directive runs no check of its own for it.
````

Boundary call: check 3, unlike Media Object's check 3 (family), IS the shared `nfsDirectiveCheck` parent-check mechanism itself ("the directive runs no check of its own for it"), so it is classified `forgotten-import`, grouped with the In-family checks paragraph, not as a separate `family`-kind entry.

Tests and stories: layer 2, line 375: "`li[nfsMenuText]` outside a menu warns once."

Needs: the shared `nfsDirectiveCheck(class, {parent})` utility, `inject(NfsMenu, {optional: true})` (development builds only).

Rule as documented usage: none (mechanism content).

Mentions: user story 13, line 35; D9, line 427.

### runtime: `include('nfs-breakpoint-properties', ...)`/`value()` for `orientation`/`expanded` breakpoint keys

Location: "Development checks and runtime checks" subsection, "Runtime checks" paragraph, line 188.

Text:

````
Runtime checks (ADR 0040, configured by `provideNfsRuntimeChecks` and `provideNfsProductionRuntimeChecks` of `ngx-foundation-sites/media-query`, whose spec defines how a directive reports): `NfsMenu` creates the handle `nfsVariantCheck('nfsMenu')` and, only while an `orientation` rules key or an `expanded` query names a Class breakpoint above the Zero breakpoint, calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value()` for those values, because `nfs-breakpoint-properties` holds nothing else the Menu needs (the Top Bar's rule); under `strictVariantNames`, a breakpoint above the Zero breakpoint named by an `orientation` rules key or an `expanded` query that `--nfs-breakpoint-classes` does not list (drift between the Variant declaration file and the compiled Sass), and a value that maps to no class; under `strictVariantProperties`, a missing `--nfs-breakpoint-classes`, naming `@include nfs-breakpoint-properties;`. They run in the browser after the first render, never on the server.
````

Tests and stories: layer 2, line 377: "Runtime checks: a listed breakpoint is silent; an `orientation` rules key or `expanded` query for a breakpoint missing from a test `--nfs-breakpoint-classes` on the document root reports once under `strictVariantNames`; a cast value binds no class and reports once; in a test file of its own, with the property absent and an `orientation` rules key above the Zero breakpoint bound, `strictVariantProperties` reports once, naming `nfs-breakpoint-properties`; a menu with no responsive value requests nothing."

Needs: `nfsVariantCheck('nfsMenu')` handle; the Variant property `--nfs-breakpoint-classes` (written by `nfs-breakpoint-properties`, out of this spec).

Rule as documented usage: none (enforces nothing beyond the documented `orientation`/`expanded` responsive forms and `@include nfs-breakpoint-properties;`).

Mentions: user story 5, line 27; user story 6, line 28.

### build-time: `nfs-menu` Library mixin's contrast and target-size `@error` checks

Location: "Sass" subsection, "Checks" paragraph, line 522; WCAG table rows 1.4.1, 1.4.3, 2.5.8, lines 236-243.

Text:

````
Checks (no CSS output), each `@error` naming the setting. Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal. The checks: the current link's text (the colour `color-pick-contrast()` picks) against `$menu-item-background-active` below 4.5:1 (1.4.3); `$menu-item-background-active` against `$body-background` below 3:1 (1.4.1); `1rem` plus twice the first value of `$menu-items-padding` (through `rem-calc()`) below `rem-calc(24)` (2.5.8). Over Foundation 6.9.0's defaults: 4.65:1, 4.65:1, and 38.4 px (Foundation's `color-luminance()` gives 4.59:1).
````

Tests and stories: Node-level Vitest, line 383: "Sass compile (the library's node-level Sass test): `@include nfs-menu;` after `foundation-menu` over Foundation's defaults compiles and emits exactly the two rules of the Sass subsection; `$menu-item-background-active: #787878` stops the compile naming the 1.4.3 check (4.484:1); `#f0f0f0` stops it naming the 1.4.1 check (1.13:1); `$menu-items-padding: 0.2rem 1rem` stops it naming the 2.5.8 check (22.4 px); a `$menu-item-background-active` of `#8a8a8a`, for which Foundation picks the dark text (5.73:1, fill 3.42:1), compiles."

Needs: `$menu-item-background-active`, `$menu-item-color-active`, `$menu-item-color-alt-active`, `$menu-items-padding`, `$body-background`, `menu-state-active`, `color-pick-contrast`, `rem-calc` (Sass item 2, line 524); the library's internal contrast helper.

Rule as documented usage: "The consumer must keep `$menu-item-background-active` at 3:1 against `$body-background` (1.4.1) and its picked text colour at 4.5:1 against it (1.4.3), and `1rem` plus twice the first value of `$menu-items-padding` at 24 px or more (2.5.8); Foundation's defaults already pass."

Mentions: user story 37, line 59; WCAG table rows 1.4.1, 1.4.3, 2.5.8, lines 236, 237, 243.

### Kept (not a check)

- Typed inputs (`orientation`, `expanded`, `simple`, `nested`, `align`, `iconPosition`) and their compile errors over the closed unions/Breakpoint rules -- kept.
- `nfs-menu`'s two emitted CSS rules (the `aria-current` active-state rule and the simple-menu 24 px padding rule, Sass item 1's rules 1-2) -- CSS rules, kept, distinct from the `@error` checks above.
- ARIA and keyboard tables (lines 212-227); host-directive de-duplication for the menu Plugin roots (D5) -- kept, not a check.
- Story play functions, browser-level tests, SSR smoke, Sass compile test, e2e (Testing Decisions, lines 345-399) -- kept.

## Counts

### Per kind

- `forgotten-import`: 5 itemised entries (`float-grid.md`, `forms.md`, `interchange.md`, `media-object.md`, `menu.md`), plus `forgotten-import-checks.md` as a whole file deferred entirely (not counted as a discrete "check" here, since it moves as one unit per the ruling).
- `family`: 4 (`float-classes.md` D8; `float-grid.md` check 2/D11 and check 4/D9; `media-object.md` check 3/D10).
- `misuse`: 23 (`float-classes.md` 2; `float-grid.md` 2; `forms.md` 3; `interchange.md` 2; `label.md` 3; `magellan.md` 6; `media-object.md` 3; `menu.md` 2).
- `runtime`: 4 (`float-grid.md`; `label.md`; `media-object.md`; `menu.md`).
- `build-time`: 3 (`forms.md`; `label.md`; `menu.md`).

Total individually classified checks: 39, plus the one whole-file forgotten-import deferral.

### Per file

- `float-classes.md`: 3 checks (2 misuse, 1 family).
- `float-grid.md`: 6 checks (2 misuse, 2 family, 1 forgotten-import, 1 runtime).
- `forgotten-import-checks.md`: 1 whole-file forgotten-import deferral; no other-kind content found.
- `forms.md`: 5 checks (3 misuse, 1 forgotten-import, 1 build-time).
- `interchange.md`: 3 checks (2 misuse, 1 forgotten-import).
- `label.md`: 5 checks (3 misuse, 1 runtime, 1 build-time).
- `magellan.md`: 6 checks (6 misuse).
- `media-object.md`: 6 checks (3 misuse, 1 family, 1 forgotten-import, 1 runtime).
- `menu.md`: 5 checks (2 misuse, 1 forgotten-import, 1 runtime, 1 build-time).

### Boundary calls

1. `float-classes.md`, D9 (no effect on a flex/grid item; clearfix on a flex/grid container) -- could read as `family` (parent-layout awareness) vs `misuse`; resolved `misuse`, because it checks generic computed CSS (`display`), not the presence of a specific family member.
2. `float-grid.md`, check 3/D10 (no Float Grid in the stylesheet) -- could read as adjacent to `build-time` (a missing Sass include) or `runtime` (Variant-property-shaped); resolved `misuse`, because it is a client-side render-callback read of the host's own computed `::after` content, explicitly kept apart from the Runtime checks by D10's own rejected alternative ("a `strictVariantProperties` report ... prove[s] nothing about `foundation-grid`").
3. `magellan.md`, "targets in different scroll containers" -- could read as `family` (reads other tracked elements); resolved `misuse`, because Magellan's targets carry no directive (D2), so there is no family member to check for, only a generic scroll-container fact.
4. `menu.md`, check 3 (`NfsMenuText`'s missing-parent warning) vs `media-object.md`/`float-grid.md`'s DOM-only placement checks -- both "read a parent for family membership", but Menu's is explicitly the shared `nfsDirectiveCheck` parent-check mechanism itself ("the directive runs no check of its own for it"), so it is `forgotten-import`, while Media Object's and Float Grid's are separate, custom DOM reads explicitly named as `family`-kind examples in `specs/forgotten-import-checks.md` lines 197-199.

## Unsure

None outstanding; the four boundary calls above were resolved with a stated rationale. The one open question worth flagging to the re-run: `float-grid.md`'s check 3 (no Float Grid in the stylesheet) and `magellan.md`'s "not inside a `nav` landmark" / "no in-page links" checks read page-level structural facts (a stylesheet's compiled rules; a landmark ancestor) rather than the host's own attributes -- they fit `misuse`'s "or the page" clause literally, but if the later grilling tickets want a narrower reading of `misuse` (host/inputs/content only, with "the page" meaning only content the host itself is responsible for), these three may need to move to a sixth, unnamed bucket the ruling does not provide for. I kept them in `misuse` because the ruling's own wording includes "the page" as one of `misuse`'s four read-sources without narrowing it.
