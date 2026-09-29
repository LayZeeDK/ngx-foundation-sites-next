# Consistency review, group e: report

Ticket: [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), phase 2, group e, 2026-09-29, AFK under the map's override. Model: Opus 5.5. Input: the decisions of phase 1 ([consistency-review-decisions.md](consistency-review-decisions.md)), its per-spec index and checks CR-A to CR-D, the Answers of the five family re-runs (tickets 151 to 155), and the orchestrator's addendum on the registration rule of [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md).

Specs revised in place, each read in full: [responsive-toggle](../specs/responsive-toggle.md), [reveal](../specs/reveal.md), [slider](../specs/slider.md), [smooth-scroll](../specs/smooth-scroll.md), [sticky](../specs/sticky.md), [switch](../specs/switch.md), [table](../specs/table.md), [tabs](../specs/tabs.md), [thumbnail](../specs/thumbnail.md).

Each spec's governing ticket (the one the map's Decisions so far cites last for it) carries a dated `### Amendment, 2026-09-29 (consistency review)`: [Re-run: Responsive Toggle spec under the class rule](../issues/116-rerun-responsive-toggle-class-rule.md), [Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md), [Re-run: Slider spec under the class rule](../issues/124-rerun-slider-class-rule.md), [Re-run: Smooth Scroll spec under the class rule](../issues/121-rerun-smooth-scroll-class-rule.md), [Re-run: Sticky spec under the class rule](../issues/120-rerun-sticky-class-rule.md), [Re-run: Switch spec, out-of-scope survivors](../issues/147-rerun-switch-out-of-scope-survivors.md), [Spec: Table](../issues/92-spec-table.md), [Re-run: Tabs spec under the class rule](../issues/108-rerun-tabs-class-rule.md), [Spec: Thumbnail](../issues/97-spec-thumbnail.md). The heading follows the brief's form, which the other groups' amendments use too; the decisions file's "How the next phases use this file" writes `(class-rule consistency review)`.

## Summary

| Spec | Decided items applied | Other fixes | Open |
| --- | --- | --- | --- |
| responsive-toggle | R2, R52, R55, R57, CR-A | 3 | None |
| reveal | R4, R25, R52, R57 | 6 | None |
| slider | R15, R20 | 3 | None |
| smooth-scroll | R12 | 0 | None |
| sticky | R11, R32/R64, R41 | 2 | None |
| switch | R15, R20, R74 | 2 | None |
| table | R74 | 0 | None |
| tabs | R4, R45, R57 | 2 | None |
| thumbnail | R16, A7 | 2 | None |

Nothing is OPEN FOR HUMAN: every edit is impact LOW (wording, examples, development checks, Library mixin rules and checks before the first release under ADR 0045), confidence HIGH (the decisions file's ratings, or the spec's own text and records). No decided API or default was changed. CR-A was rerun on every spec after the edits (`rg -n 'class="|\[class|ngClass|routerLinkActive=|animate\.(enter|leave)='`): every hit is rendered output, a labelled check input, Foundation's labelled markup, library code, prose, or an Application class. CR-C was searched with the decisions file's pattern on every spec. A scan of the added lines found no non-ASCII character and no banned word.

## Per spec

### responsive-toggle

Decided items applied:

- R2: development check 4 in the Toggler's three-case shape, with this plugin's value in the first message (`animate="hinge-in-from-top spin-out" started no animation: ...`) and "The phase still completes at once. This is the Toggler's check 4 and the Reveal's check 3 in this plugin's words." kept; the browser-level Motion values case names the dot-form route; Out of Scope gains the Motion UI bullet.
- R52: "the Breakpoint service spec's consumer rule" (the focus rule's lead, the decisions file's line 219) becomes "consuming-directive rule 1", since the next bullet names rule 1; "consumer rule 1, third place" and "consumer rule 3" (Animation, reduced motion) become "consuming-directive rule 1" and "consuming-directive rule 3".
- R55: the story id `responsive-toggle--sticky-title-bar` in the Story ids sentence, its layer-1 bullet, the 2.4.11 row's test cell, and the e2e case, as decided.
- R57: "application class" to "Application class" (the class-record test case); "the developer's own (keyframe) classes" to "the consumer's own" in the Solution, Animation, D rows, the dot-form usage lead-in, and Sass (4); the `animate` API row names its dot-form tokens Application classes that are keyframe animations. "A bar or menu of the developer's own" (elements, not classes) stays, as R57 allows.
- CR-A: the copied-class comment on the `header` line of the developer's own bar, exactly as decided.

Other fixes:

1. The same block's server-HTML half had no label (CR-A (a) asks rendered output to be labelled): it gains `<!-- Server HTML: the copied class is gone -->`, and "the application's `site-header`" in the sentence after it reads "the Application class `site-header`".
2. The new story's `nfsOverflowY` names its directive and entry point (`NfsPrototypeOverflow`, from `ngx-foundation-sites/prototyping-utilities`), because the Story ids paragraph lists only the Top Bar directives as the stories' scaffolding and R41 names the same directive this way for the Sticky story.
3. The registration-rule alignment (below).

Confirmed, unchanged: R4, R22/R53, R39, R54, R65; CR-C (no placeholder); CR-D (no component example).

### reveal

Decided items applied:

- R4: the stale clauses of the 1.4.11 row, D19, and the Sass checks row by the rule; `color-luminance()` leaves Sass (2); S1 after the rules table. Figures stand.
- R25: the host binding (`[attr.data-nfs-close-button]` from `contentChild(nfsCloseButtonToken, {descendants: true})`, placed after the class bindings of the API section, and a `queries` line in the hierarchy block); the 1.4.12 row after the 1.4.10 row (the Reveal's WCAG table has three columns, so the decided "Fails for Foundation's own example" cell joins the requirement cell); the "adds one WCAG rule" sentence; rule 8 in the Sass rules table; Sass (2) and (5) additions; D29 after D28; tests (`reveal--basic` asserts the hook and the 48 px padding, the SSR smoke asserts the attribute, a browser-level hook case asserts it absent on a dialog without a close button). An e2e text-spacing case is added too, because the new 1.4.12 row names e2e as its test.
- R52: "consumer rule 3" (Animation, reduced motion).
- R57: the `animationIn` row; "the developer's own keyframe classes" in the Solution.

Other fixes, each a consequence of R25 or an existing mismatch:

1. The Solution, the Sass summary, and the compile test said the mixin prints seven rules; they read eight, and D2's decision cell notes that the eighth is D29.
2. The summary list under Sass and custom CSS gains item 8.
3. The server and hydrated HTML of the docs example show `data-nfs-close-button=""` on the dialog, which holds a close button, and the lead-in says where it comes from.
4. The entry-point bullet said the Reveal does not import the close-button entry point; it imports `nfsCloseButtonToken` from it now, the Callout's lightweight-token pattern (the Callout spec's D10).
5. Foundation behaviour changed or dropped gains the reserved room.
6. The browser-level development-check case said "each of the eight warnings"; the spec has nine since check 9 was added on 2026-09-28, so it reads nine.

Confirmed, unchanged: R2, R14, R27, R34/R35, R49, R50, R54, R65, R69/R70; CR-A; CR-C; CR-D (both component examples import exactly what their templates write; `nfsCloseResult` is an input of `NfsClose`).

### slider

Decided items applied:

- R15: the forced-colours row's WebKit reason, with the review linked by its exact title.
- R20: rule 6's declarations and reason; rule 0a's check (worded into the one `@error` cell) and its reason; Sass (2); the 2.4.7 row and its test cell; the compile test; D26. The decision's "confirm the offset wording matches the 2.4.7 row" found two e2e bullets ("Focus visible" and the forced-colours bullet) that still read "the pixel just outside the focused thumb"; both take the row's "at the outline offset plus half the outline width", because a 1 px ring 2 px out leaves the pixel just outside the thumb unpainted.

Other fixes:

1. `$black` left Sass (2) (rule 6 no longer uses it) and rule 13's reason ("would keep rule 6's `$black` outline" becomes "rule 6's author outline colour"); the literal list names only the 2 px offset, with its reason.
2. The consumer-settings paragraph under Sass and custom CSS names the ring requirement and its check.
3. The default ring's figure: the decisions file quotes 3.422:1, the Switch's floored figure; `ratio.mjs` gives 3.4230 in both modes, so under R4's ratio rule the Slider, which does not floor, writes 3.42:1.

Confirmed, unchanged: R4, R60, R61/R63, R66, R69/R70; the class-only-part note of ticket 152 (the fill's In-family line already says why M4's template-outlet fix is the one its Handles need); CR-A, CR-C, CR-D (`app-filters` imports exactly its directives and `FormField`).

### smooth-scroll

Decided items applied: R12, the names sentence, as decided.

Confirmed, unchanged: R48 (D13); CR-A, CR-C, CR-D (all three component examples). Ticket 153 asked the review to check that cross-family neighbours are stated the same way, naming Smooth Scroll beside Menu: this spec is a single directive with no parent, child, or peer, so the family rule gives it no In-family line (forgotten-import checks, "A spec with a single directive and no parent, child, or peer adds no line"), and D13 already states the Menu written beside it; nothing to align.

### sticky

Decided items applied:

- R11: D19's rationale.
- R32/R64: the Rendered HTML consumer line and the usage example take `ngSrc` with `width="600" height="400"`; the two rendered lines replace `src="..."` with the size; the Rendered HTML lead-in says `NgOptimizedImage`'s own attributes are left out (this spec shows static attributes, so the lead-in names `ngsrc` too).
- R41: `sticky--overflow-hidden-ancestor`, its imports, D19's three cells, and the story-markup sentence that said the story sets two overflow values inline.

Other fixes:

1. Two usage examples, "Reading the state" (`<div nfsStickyContainer><nav nfsSticky ...></nav></div>`) and "Deferred", held only the sticky element in their container. Under ADR 0019 the Sticky range is the parent, so neither could stick, and the spec's own development warning 2 would fire, the defect R40 found in the Visibility Classes (X4). Each gains the content the element scrolls past, with R40's comment on the first.
2. The story markup and the usage lead-in name `NgOptimizedImage` (the image rule of building-blocks 1.2 asks component examples to import it; these examples are HTML fragments, so the lead-in says where it comes from).

Confirmed, unchanged: R40; CR-A, CR-C, CR-D.

### switch

Decided items applied:

- R15: Sass 1 (b)'s selectors, the order note, and the reason; D12; the e2e forced-colours bullet.
- R20: D9's rejected cell (with the review linked by its exact title).
- R74: checks 1, 2, and 5 (the clause is written once per check, after its text sources, so it covers the text of `aria-labelledby` references too, as building-blocks 1.10's appended sentence reads); the Notes bullet; the Measured groups sentence; the browser-level cases (an image-only label silent, an image with alt text in the paddle reported, an image-only legend silent).

Other fixes, consequences of R74:

1. D16's rationale said the condition matches Chromium's tree on 23 of 24 patterns, "the miss being an image-only legend", and its last rejected alternative was the reading R74 adopts; the rationale now reads all 24, and the rejected alternative is the text-only reading, with the reason.
2. The checks' lead-in lists "an image's `alt`" among what they read.

Confirmed, unchanged: R4, R21; CR-A, CR-C, CR-D.

### table

Decided items applied: R74, on `NfsTable`'s check 1 and, by R74's rule for any other text-reading check, on `NfsTableScroll`'s name check (it reads the text `aria-labelledby` references); one silent browser-level case.

Confirmed, unchanged: R4, R13, R27, R73; CR-A, CR-C, CR-D.

### tabs

Decided items applied:

- R4: the 1.4.11 row and the Sass paragraph's two clauses; `color-luminance()` leaves Sass (2); S1 in the Sass paragraph.
- R45: Sass (1), (2), and (5); the 1.4.3 and 1.4.11 rows; the compile test; D26; D17. Sass (2)'s list merges R4's removal and R45's additions in one edit.
- R57: "an application class".

Other fixes:

1. R45's consequence in two summaries the decision did not list: the Solution ("stops the compile when a tab colour fails, so every application with a tab strip includes it") and Sass and custom CSS ("checks of every strip's text and selected look and of the `primary` bar's pairs"), so no sentence still says only the bar pair is checked.
2. CR-D: `app-product`'s template writes `app-review-list` (inside `@defer`) and `app-stats-chart`, which its `imports` did not list; they are added (`AppReviewList`, `AppStatsChart`), so the example's imports match its template.
3. The DOM-placement alignment (below).

Confirmed, unchanged: R27, R44, R46, R69/R70; CR-A (the nav-bar and equal-heights classes are Application classes); CR-C.

### thumbnail

Decided items applied: R16 (the Solution's hiding rule, D9's decision cell, and the shared sentence as a new Notes bullet, since no note carried the rule before; the list of other specs leaves the Thumbnail itself out, as the XY Grid's note leaves itself out); A7.

Other fixes (CR-C, beyond A7): the story sentence and the usage note both called `nfsGridX`, `nfsCell`, and `up` the names the Card writes "until the [Spec: XY Grid] names them"; the XY Grid spec is published, so both name its directives.

Confirmed, unchanged: R10, R11, R28/R29, R32/R64, R65, R74; CR-A, CR-D (`app-avatar` imports `NgOptimizedImage` and hosts `NfsThumbnail`).

## The registration rule (the orchestrator's addendum)

The shared spec now says a family check that reports placement from the DOM alone, and one that finds a peer by registration, say nothing where the element they look for carries the peer directive's attribute. In this group:

- Tabs: its one such check is DOM-placement, the tab's warning for a parent that is not an `li[nfsTabsTitle]`, which ticket 152 already made read the element and the attribute. Its In-family sentence ended "and the warning's message holds for the case it reports", ticket 152's wording; it now names the shared rule it follows (an `li` carrying `nfsTabsTitle` without `.tabs-title` is a forgotten import, reported once by the strip's probe). No behaviour change. The Tabs has no registration check (its panel and tab-list registries feed no warning).
- Responsive Toggle: development check 3 (no registered title bar, or a second one) reads a registration, and ticket 152 kept it. It keeps its message under the shared rule too, because it looks for no element: the bar reaches the menu only through the required reference `[nfsResponsiveToggle]="menu"`, whose forgotten import on either side fails to compile (NG8002, NG8003). The In-family sentence now says this in the shared rule's terms (proposal 3 below would put the case in the shared spec).
- Switch: check 6 already accepts the input's attribute (ticket 153, D19); aligned. Sticky: warning 1 already follows the DOM-placement rule (ticket 154). Slider, Reveal, Table, Thumbnail, Smooth Scroll: no such check.

## Items the family re-runs routed to this review, for this group

- Ticket 152, "registration checks keep their messages and DOM checks match the attribute": decided by the addendum above.
- Ticket 152, class-only parts under `strictParents` (the Slider fill): the Slider's fill line already explains it; no sentence added.
- Ticket 153, cross-family neighbours stated the same way (Smooth Scroll beside Menu): nothing to align (see smooth-scroll).
- Ticket 153, a check that finds a peer by its class (the Switch's check 6): already takes the attribute.
- Ticket 154, the Top Bar, XY Grid, and Flex Grid placement checks against S2, and ticket 155's Flex Grid check 3: not in this group.
- Ticket 151, the In-family label and form: the group's In-family bullets are kept as they are, as the brief asks.

## Proposed shared-document and other-group changes

These are proposals only; this reviewer edited none of the documents they name.

1. `storybook-conventions.md`, section 5, the Tabs override's comment, because R45 makes `nfs-tabs` stop the compile on Foundation's defaults (the Storybook compile holds only because this override is there). Replace

   > // color-contrast (1.4.3): Foundation's selected tab is about 3.76:1 (axe reports 3.75). Spec: Tabs, tabs--default;
   > // also Responsive Accordion Tabs in tabs mode.

   with

   > // color-contrast (1.4.3) and non-text contrast (1.4.11): Foundation's selected tab is about 3.76:1 (axe reports 3.75)
   > // and its selected look 1.24:1, and nfs-tabs stops the compile on both. Spec: Tabs, tabs--default;
   > // also Responsive Accordion Tabs in tabs mode.

2. `building-blocks.md`, Table B, the Reveal row's server-output cell, because R25 adds a host attribute to the Reveal's server HTML: after "Server output: `<dialog class="reveal">` with its content" insert

   > , and `data-nfs-close-button` while it holds a close button (the close-button room of 1.4.12, [Spec: Reveal](issues/18-spec-reveal.md), D29)

3. `specs/forgotten-import-checks.md` (another group's file), In-family checks, the bullet that begins "- A family's own development check that finds a peer by registration": append

   > A registration check that looks for no element, because its peer is linked only by a required reference whose forgotten import fails to compile, keeps its message (the Responsive Toggle's check 3: the bar reaches its menu through `[nfsResponsiveToggle]="menu"`, NG8002 or NG8003 when either import is forgotten).

No other shared change is needed for this group beyond the closing-pass list of the decisions file (building-blocks 1.10's Forms, Callout, forced-colours, colour-alone, and Names bullets; 1.13's Tabs paragraph).

## Process notes

- Measurements: none new; the ratio of Foundation's default `$input-border-focus` colour on `#fefefe` was recomputed with the coordinator's `ratio.mjs` (3.4230 in both modes), read-only.
- Against the brief's shell rules, several read-only commands early in the session were prefixed with `cd <path>;` (two with `cd <path> &&`), and one ran `git -C <path> log`; none of them wrote a file, and every later command used absolute paths.
