# 143. Re-run: Visibility Classes spec for the print classes

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The [Spec: Typography Helpers](106-spec-typography-helpers.md) found that Foundation's `.show-for-print` and `.hide-for-print` have no owner in any published spec, and proposed them as a `print` condition of the `showFor` and `hideFor` inputs of the [Spec: Visibility Classes](104-spec-visibility-classes.md). How does the Visibility Classes spec take the print classes under the class rule (ADR 0039: consumers write no Foundation or NFS class), and what changes in its types, checks, stories, and tests?

## How to work it

Revise `specs/visibility-classes.md` in place and append a dated `### Amendment, 2026-09-28 (print classes)` to the [Spec: Visibility Classes](104-spec-visibility-classes.md) ticket. Read first: the Typography Helpers ticket's Answer (its print-class finding and proposal), the Visibility Classes spec and ticket, ADR 0039, ADR 0040, and building-blocks 1.4 and 1.7. Measure what `.show-for-print` and `.hide-for-print` do under print emulation in Chromium, Firefox, and WebKit, how they combine with the breakpoint and orientation classes the spec already binds, and what server HTML carries. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.

## Answer

Resolved 2026-09-28 (Opus 5.5, AFK: both sides of the grilling played against the sources). Spec revised in place: [specs/visibility-classes.md](../specs/visibility-classes.md); the change is summarised in the dated amendment of the [Spec: Visibility Classes](104-spec-visibility-classes.md) ticket.

Sources read: the Typography Helpers ticket's Answer and its spec's print rows; the Visibility Classes spec and ticket; ADR 0039, ADR 0040, ADR 0044; building-blocks 1.3, 1.4, 1.7, 1.9, 1.10, 1.13, 1.14, and Table D; `CONTEXT.md`; the map's AFK override and triage rule; `research/out-of-scope-exclusions.md` (categories); `research/angular-rendering-modes.md` (`@defer` on the server); Foundation 6.9.0's `scss/typography/_print.scss`, `_typography.scss`, `scss/components/_visibility.scss`, `scss/util/_breakpoint.scss` (the `breakpoint()` mixin's `print` rule and its `screen`-only orientation queries), `foundation-everything`'s include order in `scss/foundation.scss`, and the Print Styles section of `docs/pages/typography-base.md`.

### Measurements made for this ticket

Throwaway scripts under `D:/tmp/nfs-wave-143/` (not committed; no server, no port, no junction; packages read from the existing `D:/tmp/nfs-ct-prototype` and `D:/tmp/nfs-proto-rendering-mode-test-seam` installs). Foundation 6.9.0 Sass from the local clone compiled with Dart Sass through `@include foundation-everything;` (default settings; also with `$breakpoint-classes: (small medium large xlarge)`, with `$print-breakpoint: medium`, and with `foundation-visibility-classes` included before `foundation-typography`); Playwright 1.63 in Chromium 153, Firefox 155, WebKit 26.6, and the installed Edge 153; axe-core 4.13.0 with the six WCAG 2.2 AA tags; Chromium's CDP accessibility tree; Angular 22.2.0's `renderApplication`.

- P1, computed display (`print.mjs`), four engines, identical displays; the engines differ only in how they serialise `::after` content strings, and in Firefox's `matchMedia('(prefers-color-scheme: dark)')`, which reports `false` under print emulation with a dark scheme and changes no display, because Foundation's dark query is `screen` only:
  - Screen (320 by 640, 900 by 600, 1100 by 800, 1300 by 800, and dark at 900 by 600): `.show-for-print` is `none` everywhere; `.hide-for-print` keeps the element's own display (`span` inline, `ul.menu` flex, `a.button` inline-block).
  - Print (`emulateMedia`, at 1100 by 800, 1300 by 800, 320 by 640, and 1100 by 800 under a dark colour scheme; all identical): `.show-for-print` is `block` on `p`, `span`, `li`, `ul.menu`, `a.button`, `img`, `.grid-x`, `caption`, and `tfoot`, and `table`, `table-header-group`, `table-row-group`, `table-row`, and `table-cell` on `table`, `thead`, `tbody`, `tr`, `th`, and `td`; `.hide-for-print` is `none`. Every `show-for` breakpoint class shows; every `hide-for` class up to `large` hides, and with `$print-breakpoint: medium` `hide-for-large` and `-large-only` show; `hide-for-xlarge` and `show-for-xlarge` show. `.show-for-landscape` and `.hide-for-portrait` show and `.hide-for-landscape` and `.show-for-portrait` hide at every page shape (the orientation queries are `screen` only); `.show-for-dark-mode` hides and `.hide-for-dark-mode` shows under either colour scheme (the dark query is `screen` only); `.hide` hides; stuck sticky classes behave as on screen.
  - Pairs beside `.show-for-print`, under `foundation-everything`'s order: `hide-for-medium`, `-large`, `-small-only`, `-medium-only`, `-large-only`, `.hide`, and `.hide-for-print`: never displayed, screen or print; `hide-for-xlarge`, `-xlarge-only`, `hide-for-dark-mode`, and a stuck `hide-for-sticky`: print as `.show-for-print` alone; `hide-for-landscape`: displayed on screen in portrait, hidden in print; `hide-for-portrait`: displayed on screen in landscape and in print.
  - Pairs beside `.hide-for-print`: every `show-for` breakpoint class, `show-for-xlarge`, `show-for-dark-mode`, and `show-for-sticky` (stuck and anchored): on screen as the other class alone, never printed; `show-for-portrait`: on screen in portrait, never printed (its own rule hides it in print); `show-for-landscape`: printed.
  - Reverse include order (Visibility classes before typography): every pair beside `.show-for-print` prints as `.show-for-print` alone, and `show-for-landscape` beside `.hide-for-print` is no longer printed; screen results are unchanged except that `hide-for-landscape` and `hide-for-portrait` beside `.show-for-print` no longer show it on screen.
  - `.show-for-sr` and the unfocused `.show-on-focus` link stay 1 by 1 px in print. Foundation's `a[href]:after` prints " (/orders/42#section)" after a link with a current-path `href` and nothing after `href="#x"`; the skip link gets the suffix inside its clipped box.
- P2, accessibility (`a11y.mjs`): a page with a heading, a print-only header paragraph, a toolbar with a Print button and a navigation under `.hide-for-print`, and a table whose `caption` is `.show-for-print`. axe reports nothing in Chromium, Firefox, and WebKit, on screen and under print emulation. Chromium's tree on screen holds the button and the navigation and neither the print-only paragraph nor any table name; under print emulation it holds the paragraph and "table: Items, as printed", and neither the button nor the navigation.
- P3, server HTML (`ssr.mjs`): a JIT stand-in for `NfsVisibility` (signal inputs, one `computed` class list in `host`) rendered by Angular 22.2.0's `renderApplication` with incremental hydration. The server HTML carries `class="lead show-for-print"` (a consumer static class merged), `class="hide-for-print"`, and `class="hide-for-print show-for-dark-mode"`; an `@defer (on viewport)` block rendered its `@placeholder`; `@defer (hydrate never)` and `@defer (on idle; hydrate on viewport)` rendered their content with `show-for-print`. P1 ran on static HTML with no script, which is what the server HTML is, so a page printed before hydration or with JavaScript off prints as P1 says.

### Grilling record

Round 1 (nothing settled yet).

- Q1, which spec owns the print classes. For the `print` condition: Foundation's words `show-for-print` and `hide-for-print` are the `<words>-for-<condition>` shape of the other conditions, the classes decide one effect (whether the element shows), which is the Visibility shape building-blocks 1.3 and ADR 0044's consequences give this family, and the Typography Helpers spec sent them here (its D16). For a directive of `foundation-print-styles` under ADR 0044's clause 1 (`NfsPrintStyles` with `nfsShowForPrint` and `nfsHideForPrint`): the mixin that prints them is not `foundation-visibility-classes`, and clause 1 counts export mixins. Against it: a second directive setting Visibility classes on one element, which the second-owner check would report beside `nfsVisibility`, and which could not see `showFor` for the combination check; and a spelling unlike every other `show-for-<condition>` class. Settled: the `print` condition (decision 1).
- Q2, value or booleans. For `showForPrint` and `hideForPrint` (building-blocks 1.4 rule 4 makes single classes booleans): they combine with a breakpoint value on one element. Against: D4 already makes the conditions values of Foundation's show and hide words, booleans would let print sit beside an orientation, which the CSS cannot give (P1), and one value per input loses little, because every `hideFor` breakpoint up to `$print-breakpoint` already hides in print and every `showFor` breakpoint already prints (P1); only `hideFor` above `$print-breakpoint`, `hideFor="dark-mode"`, or `hideFor="sticky"` together with print needs a wrapper. Settled (decision 1).
- Q3, the type and the Runtime check. `NfsVisibilityCondition` gains `'print'`; the family stays closed and the condition needs `[]`, so no `include()` request and no Variant property. Settled (decision 2).

Round 2 (Q1 to Q3 settled).

- Q4, the combinations (P1). Beside `showFor="print"` every `hideFor` value either hides the element everywhere, shows it on screen in one orientation, or does nothing. Beside `hideFor="print"`, every breakpoint `showFor`, `sticky`, `dark-mode`, and `portrait` value combines, and `landscape` prints. For a narrower check (warn beside `showFor="print"` only on the values that hide in print, reading `$print-breakpoint`): fewer warnings. Against: the other values do nothing, so the pair is still worth reporting, and the directive would have to know a Sass setting. For keeping check 2's existing "orientation or `showFor="dark-mode"` with any value" rule unchanged: simpler. Against: it would warn on two measured-correct pairs, `showFor="portrait" hideFor="print"` and `showFor="dark-mode" hideFor="print"`. Settled: check 2 gains a print rule and those two exemptions (decision 3).
- Q5, the include order. `foundation-everything` prints the typography before the Visibility classes, so an `!important` Visibility rule of equal specificity wins in print; the reverse order flips the pairs (P1). The directive cannot see the order; every warned pair is pointless or right only by source order in either order. Settled: the spec states the order its results assume; the check does not depend on it (decision 3).
- Q6, the forced display. `.show-for-print` prints `li`, `caption`, `tfoot`, inline elements, and flex or grid containers as `block` (P1). For a library rule restoring their displays: a print-only list item keeps its marker. Against: a library copy of Foundation's `!important` print rule for paper layout, not an accessibility failure, where a block wrapper avoids it (D13's reasoning for the orientation classes). For a development check by tag: the host's display on screen is `none`, so only its tag could tell, as D10's rejected inline check. Settled: documented, no CSS, no check (decision 4).

Round 3 (Q4 to Q6 settled).

- Q7, the accessibility of print-only content (P2). On every screen `showFor="print"` is `display: none`, so the content is hidden from everyone, assistive technology included, and a print-only `caption` leaves its table unnamed, which axe does not report. No WCAG 2.2 criterion covers printed output. For a development check on `caption`, `label`, and `legend` hosts: it catches the case measured. Against: any `showFor` or `hideFor` value on those elements loses the same name at some width, which D14's content rule already covers, and a check for one value would suggest the others are safe. Settled: D14's content rule widened to print (decision 5).
- Q8, the rendering modes (P3). The classes are in the server HTML, so a pre-hydration or JavaScript-off print is right; a `@defer` block without a hydrate trigger is its placeholder on the server and until its trigger fires, so its print-only content does not print. Settled (decision 6).
- Q9, a missing `foundation-print-styles`. For a development check (a `showFor="print"` host displayed on screen means the print styles are missing): cheap and reliable. Against: print-only text on screen reveals it at once, as a missing `foundation-visibility-classes` does, and no Variant property marks the include. Settled: Sass item 5 documents it (decision 4).
- Q10, the rest of `foundation-print-styles`. `.print-break-inside` (page breaks inside `pre`, `blockquote`, `tr`, `img`) is a stand-alone Utility class that decides nothing about showing, and `.ir` is a class Foundation's print rule reads (`.ir a:after`) that no Foundation rule styles and no docs page names. Neither is a Visibility class; ADR 0039 leaves no class unowned. Settled: Out of Scope here, a ticket proposed for the Typography Helpers (decision 7).
- Q11, the printed address after current-path links (P1). ADR 0038's current-path `href` values lose Foundation's `a[href^='#']` exemption, so in-page links print their address. Settled: not this spec's rule; passed to the Smooth Scroll spec, with `hideFor="print"` on a navigation of such links as the recipe (decision 8).

Round 4 (Q7 to Q11 settled).

- Q12, the tests. Play functions run on screen at 414 px, so `visibility--conditions` gains a print pair asserted on screen (the toolbar's button by role, the print-only paragraph not displayed and not in the tree); the print sweep in three engines gets the measured rows; the fixture app's JavaScript-off run adds print emulation; the browser-level check cases cover every warned and silent pair. No new story. Settled (decision 9).
- Q13, vocabulary. The glossary's **Visibility class** lists the conditions; print joins them. No new term: `'print'` is a condition like the others. Settled (decision 10).
- Q14, an ADR. Adding a value to a closed union is additive and follows ADR 0039, ADR 0040, and ADR 0044 as written; the only surprise is that one Foundation mixin's classes go to two specs, which a dated note on ADR 0044 records. No new ADR. Settled.

The frontier is empty.

### Decisions

1. `'print'` is a fifth condition of `showFor` and `hideFor`, setting `.show-for-print` and `.hide-for-print` from Foundation's `foundation-print-styles` (inside `foundation-typography`); one value per input; the spec's D20.
2. `NfsVisibilityCondition = 'landscape' | 'portrait' | 'dark-mode' | 'sticky' | 'print'`, closed; the Runtime check needs `[]` for it and makes no `include()` request; no Variant property; the Variant manifest is unchanged.
3. Development check 2 (the spec's D21): `showFor="print"` with any `hideFor` value warns ("shows this element only in print, where <class> either hides it as well or has no effect"); the orientation rule covers `hideFor="print"` beside `showFor="landscape"` and `hideFor="landscape"` or `"portrait"` beside `showFor="print"`, and exempts `showFor="portrait"` with `hideFor="print"`; the dark-mode rule exempts `hideFor="print"`; the check does not depend on the include order, and the spec states that its print results assume `foundation-everything`'s order.
4. No library CSS and no check for the forced `display: block` of `.show-for-print` in print (a print-only `li`, `caption`, `tfoot`, inline element, or flex or grid container prints as a block) or for a missing `foundation-print-styles`; documented in D13 and Sass item 5.
5. D14's content rule widened: `showFor="print"` holds only what a printout adds, never information screen users need and never the caption, label, or legend of something on screen; `hideFor="print"` only what means nothing on paper; stated after the WCAG table, since no criterion covers print.
6. Rendering modes: the print classes are in the server HTML, so an early or JavaScript-off print is right; print-only content goes outside a `@defer` block without a hydrate trigger.
7. `.print-break-inside` and `.ir` are not Visibility classes: Out of Scope here (`scope-boundary`), proposed for the Typography Helpers (proposal 7).
8. The printed address after current-path in-page links is the Smooth Scroll spec's (Out of Scope, `scope-boundary`); `hideFor="print"` on such a navigation is the recipe.
9. Tests: the print pair in `visibility--conditions`; the print rows of the e2e sweep (print at 1100, at 320 by 640, and under a dark colour scheme, identical); the fixture app's JavaScript-off run under print emulation; the check cases; no new story; D18 amended.
10. Glossary: **Visibility class** gains the print medium (proposal 2).
11. The spec's Problem Statement, Solution, 47 user stories (six new), Foundation contract (a Print row, and the orientation and dark-mode rows' print behaviour), class mapping, types, inputs, JSDoc, ARIA table (two rows), WCAG note, Rendered HTML (a print example and the measured server HTML), Rendering modes, Testing Decisions, Out of Scope (four items), design decisions (D4, D10, D13, D14, D18, D19 amended; D20 and D21 added), usage examples, Foundation behaviour changed, Sass, and Notes (include order) are revised.

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| The `print` condition, its placement, and its type (decisions 1, 2) | MEDIUM (a value added to a public closed union; additive, and no later spec inherits it beyond the name) | HIGH (Foundation's words in the shape D4 and ADR 0044's consequences give this family; the Typography Helpers spec's proposal; measured in four engines) | Decided |
| The combination rules (decision 3) | LOW (development only) | HIGH (P1 in four engines, both include orders) | Decided |
| No CSS and no checks for the forced block and the missing include (decision 4) | LOW (additive later) | HIGH (P1; D13's precedent) | Decided |
| The content rule and the rendering-mode notes (decisions 5, 6) | MEDIUM (docs, no API) | HIGH (P2 in Chromium's tree and axe in three engines; P3 with Angular 22.2.0) | Decided |
| `.print-break-inside` and `.ir` routed to the Typography Helpers; the printed address routed to the Smooth Scroll (decisions 7, 8) | MEDIUM (scope placement) | HIGH (neither decides whether an element shows; the print rule is Foundation's base style; ADR 0038's links) | Decided here; the owner is the proposed ticket's question |
| Tests, glossary (decisions 9, 10) | LOW | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: every question that needed a measurement was measured here. Dissent recorded: `NfsPrintStyles` with `nfsShowForPrint` and `nfsHideForPrint` under ADR 0044's clause 1, against decision 1; `showForPrint` and `hideForPrint` booleans, against decision 1; a check narrowed by `$print-breakpoint`, against decision 3; library CSS restoring print-only displays, against decision 4; a caption, label, and legend check, against decision 5.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Visibility Classes row: replace "or a condition (`'landscape' \| 'portrait' \| 'dark-mode' \| 'sticky'`)" with "or a condition (`'landscape' \| 'portrait' \| 'dark-mode' \| 'sticky' \| 'print'`, the print pair from `foundation-print-styles`)", and replace "combinations Foundation's CSS cannot give" with "combinations Foundation's CSS cannot give (a print pair among them)".

2. `CONTEXT.md`, the **Visibility class** entry: replace "an orientation, the dark colour scheme, or a stuck Sticky element;" with "an orientation, the dark colour scheme, a stuck Sticky element, or printing (`.show-for-print`, `.hide-for-print`, from Foundation's print styles);".

3. `building-blocks.md` 1.10, the Visibility Classes bullet: after "(1.4.10 at 320 CSS px; 1.3.4 for the orientation conditions), a requirement every story asserts." insert:

   "Print-only content (`showFor="print"`) is hidden on every screen too, so it only adds to the screen page and never holds the caption, label, or legend of something shown there (measured: a print-only `caption` leaves its table unnamed in Chromium's tree, and axe reports nothing; [Re-run: Visibility Classes spec for the print classes](issues/143-rerun-visibility-classes-print.md))."

4. `README.md`, the Visibility Classes row, last cell: replace "and the IE queries measured in [Spec: Visibility Classes](issues/104-spec-visibility-classes.md)" with "and the IE queries measured in [Spec: Visibility Classes](issues/104-spec-visibility-classes.md); the print classes, alone and beside every other value, in both include orders, and the server HTML they need, measured in [Re-run: Visibility Classes spec for the print classes](issues/143-rerun-visibility-classes-print.md)".

5. `specs/typography-helpers.md`, the placeholder wording now that the condition exists:
   - Foundation contract, the Print row, last cell: replace "Visibility by medium, not a typography helper: Out of Scope, proposed for the Visibility Classes" with "Visibility by medium, not a typography helper: Out of Scope, the `print` condition of the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s `showFor` and `hideFor`".
   - Out of Scope, the print item: replace "proposed as a `print` condition of that spec's `showFor` and `hideFor`." with "they are the `print` condition of that spec's `showFor` and `hideFor` ([Re-run: Visibility Classes spec for the print classes](../issues/143-rerun-visibility-classes-print.md))."

6. `adr/0044-utility-directive-rule.md`, a dated note at the end of Consequences:

   "- 2026-09-28 ([Re-run: Visibility Classes spec for the print classes](../issues/143-rerun-visibility-classes-print.md)): a Foundation mixin whose classes take two shapes is split by shape. `foundation-print-styles` prints `.show-for-print` and `.hide-for-print`, which decide whether an element shows, so they are the `print` condition of `nfsVisibility`'s `showFor` and `hideFor`, not a directive of their own; its stand-alone `.print-break-inside` follows clause 1 with the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s directives."

7. A new ticket (the orchestrator numbers it):

   > # NNN. Re-run: Typography Helpers spec for `.print-break-inside` and `.ir`
   >
   > Type: grilling
   > Status: open
   > Blocked by: none
   > Labels: wayfinder:grilling
   > Map: ../map.md
   >
   > ## Question
   >
   > Foundation's `foundation-print-styles`, which `foundation-typography` includes, prints one more class, `.print-break-inside` (`page-break-inside: auto` in print, re-allowing breaks inside the `pre`, `blockquote`, `tr`, and `img` its rules keep whole), and reads `.ir` in `.ir a:after { content: '' }`, a class no Foundation rule styles and no docs page names. No spec owns either ([Re-run: Visibility Classes spec for the print classes](143-rerun-visibility-classes-print.md), Out of Scope: neither decides whether an element shows). Under ADR 0039 and ADR 0044's clause 1, does the [Spec: Typography Helpers](106-spec-typography-helpers.md) give `.print-break-inside` a Utility attribute (for example a boolean `nfsPrintBreakInside` on a `foundation-print-styles` directive in its entry point), and is `.ir` given one or recorded as an exclusion with a category?
   >
   > ## How to work it
   >
   > Revise `specs/typography-helpers.md` in place and append a dated amendment to the [Spec: Typography Helpers](106-spec-typography-helpers.md) ticket. Read Foundation 6.9.0's `scss/typography/_print.scss`, ADR 0039, ADR 0044, and building-blocks 1.3 and 1.4. Measure `.print-break-inside` under print emulation in Chromium (`page.pdf()` page count) where the engines allow it. Every Out of Scope item carries a reason and a category from `research/out-of-scope-exclusions.md`.

8. `map.md`, Decisions so far: the gist below, after the [Spec: Visibility Classes](issues/104-spec-visibility-classes.md) line.

### What other specs need from this one

- [Spec: Typography Helpers](106-spec-typography-helpers.md): the print classes are now owned (proposal 5); `.print-break-inside` and `.ir` are not, and the ticket in proposal 7 asks the question.
- [Spec: Smooth Scroll](29-spec-smooth-scroll.md), and any spec whose recipes write ADR 0038's current-path links: Foundation's print styles print the address after every link whose `href` does not start with `#`, so current-path in-page links print " (/page#section)" (measured in four engines). The Smooth Scroll spec may note it, with `hideFor="print"` on a navigation of such links and `$print-hrefs: false` as the consumer's choices; nothing here changes its API.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): nothing; the condition part is closed and not in the manifest.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): no spec writes `show-for-print` or `hide-for-print` outside rendered output and copied-class cases (a search of the effort found them only in the Typography Helpers spec and ticket, as proposals).
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): four Out of Scope items added (print-only display rule, `other`; Foundation's other print rules, `scope-boundary`; `.print-break-inside` and `.ir`, `scope-boundary`; the printed address, `scope-boundary`) and the rejected rows of D13, D14, D20, and D21, each with its category.

### Gist for Decisions so far

- [Re-run: Visibility Classes spec for the print classes](issues/143-rerun-visibility-classes-print.md) -- Foundation's `.show-for-print` and `.hide-for-print` (from `foundation-print-styles`, documented on the Typography Base page) become a fifth condition, `showFor="print"` and `hideFor="print"`, of `nfsVisibility`, closed and needing no Runtime-check include; measured in four engines: in print the orientation classes print as fixed answers and the dark-mode classes as in light mode, `.show-for-print` prints a list item, caption, table footer, inline element, or flex menu as a block (documented, no CSS), beside any `hideFor` it hides the element everywhere or does nothing, so check 2 warns, and `hideFor="print"` combines with every breakpoint `showFor`, `sticky`, `dark-mode`, and `portrait` but not `landscape`; the classes are in the server HTML (Angular 22.2.0), so an early print is right; print-only content only adds to the screen page; `.print-break-inside` and `.ir` go to a proposed Typography Helpers ticket; impact MEDIUM, confidence HIGH; no ADR. Spec: [specs/visibility-classes.md](specs/visibility-classes.md).

### Note, 2026-09-29 (architecture audit)

- 2026-09-29: the fixer items of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) are applied to the spec.
