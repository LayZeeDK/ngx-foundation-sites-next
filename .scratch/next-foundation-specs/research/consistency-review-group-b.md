# Consistency review, group b: report

Ticket: [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), phase 2, group b, 2026-09-29, AFK under the map's override. Model: Opus 5.5. Input: the decisions of phase 1 ([consistency-review-decisions.md](consistency-review-decisions.md)), its per-spec index and checks CR-A to CR-D, the Answers of the five family re-runs ([Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) to [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md)), the orchestrator's rule on registration checks in [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), building-blocks, the ADRs, the glossary, and Foundation 6.9.0's docs pages for the nine components (the local `foundation-sites` clone, read only).

Specs revised in place, each read in full: [callout](../specs/callout.md), [card](../specs/card.md), [close-button](../specs/close-button.md), [drilldown-menu](../specs/drilldown-menu.md), [dropdown-menu](../specs/dropdown-menu.md), [dropdown](../specs/dropdown.md), [equalizer](../specs/equalizer.md), [flex-grid](../specs/flex-grid.md), [flexbox-utilities](../specs/flexbox-utilities.md).

Each spec's governing ticket (the one the map's Decisions so far cites last for it; the five family re-runs are cross-spec and did not treat themselves as governing) carries a dated `### Amendment, 2026-09-29 (consistency review)`: [Spec: Callout](../issues/89-spec-callout.md), [Spec: Card](../issues/90-spec-card.md), [Spec: Close Button](../issues/83-spec-close-button.md), [Re-run: Drilldown Menu spec under the class rule](../issues/114-rerun-drilldown-menu-class-rule.md), [Re-run: Dropdown Menu spec under the class rule](../issues/113-rerun-dropdown-menu-class-rule.md), [Re-run: Dropdown spec under the class rule](../issues/118-rerun-dropdown-class-rule.md), [Re-run: Equalizer spec under the class rule](../issues/126-rerun-equalizer-class-rule.md), [Spec: Flex Grid](../issues/101-spec-flex-grid.md), [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md).

## Summary

| Spec | Decided items applied | Other fixes | Left open (not OPEN FOR HUMAN) |
| --- | --- | --- | --- |
| callout | R2, R4, R25, R30, R59, CR-B | 2 | `exportAs: 'nfsCallout'` (a decided API; proposal 1) |
| card | R26, R32/R64, CR-B | 2 | None |
| close-button | R2, R4, R17, R25, R59, R74, A5, CR-B | 1 | None |
| drilldown-menu | R26, R57 | 1 | `exportAs` on the wrapper and the back item (a decided API; proposal 2) |
| dropdown-menu | R3 | 0 | None |
| dropdown | R2, R52, R54, R57, R59, CR-B | 4 | None |
| equalizer | R7, R32/R64, R57, R58 | 2 | None |
| flex-grid | R16, R59, CR-B, [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md)'s check 3 | 0 | None |
| flexbox-utilities | R16, R57, R59, A1, A2, CR-B, [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md)'s cross-family sentence | 3 | None |

Nothing is OPEN FOR HUMAN. Every edit is impact LOW (wording, figures, examples, stories, development checks and their tests, documentation rows, one Library mixin declaration inside an existing rule, before the first release under ADR 0045), confidence HIGH (the decisions file's ratings, the owning specs' published names, Foundation's docs markup read in the clone). No decided API or default was changed by this reviewer beyond R17's own decision; the two `exportAs` items that would change a decided API are proposals below, rated impact LOW and confidence HIGH under the triage rule (R17's rating for the same change), so they are decided in substance and only their application is the coordinator's.

CR-A was rerun on every spec after the edits (`rg -n 'class="|\[class|ngClass|routerLinkActive=|animate\.(enter|leave)='`): every hit is rendered output under a label, a labelled copied-class check input or test case, Foundation's labelled markup, library host metadata, prose that names a class, or an Application class (`equal-rows`, `card-row`, `account-box`, `site-nav`, `story-bound`). CR-C was rerun with the decisions file's pattern; the hits left are other things (`publish` in button text, "stands for" as a notation note in the Flex Grid, "the published D9" as history). The added text is ASCII, uses none of the banned words, and every file keeps its LF line endings.

## Per spec

### callout

Decided items applied:

- R2: the sentence after the Rendered HTML block and the Animation paragraph take the decided text (the Toggler's `animate` with `slide-out-right`, and the `@if` recipe's three options, the Triggers spec's D17); the Out of Scope Closing bullet reads "and the `@if` recipe's animation belong to"; `callout--closable` closes its second callout with `animate="slide-out-right"`.
- R4: the WCAG lead reads "Ratios are the exact WCAG 2.2 relative-luminance ratio of Foundation 6.9.0's default settings, unrounded"; Sass (1)(c) takes S1; `color-luminance()` leaves the reused list; the figures at the Problem Statement (3.83:1 to 4.26:1), the 1.4.3 row (primary 3.85, secondary 3.90, success 4.25, warning 4.26, alert 3.83:1; default 4.69:1; hover at least 4.87:1; with the required setting at least 4.95:1, hover 6.18:1, page 6.01:1), and D8 (4.10:1 at 90 percent, 4.95:1, 6.01:1); the purple compile test takes `#4b0082` (4.02:1; `#5b2a86` passes at 4.51:1).
- R25: `callout--closable` names "the Callout docs page's Making Closable pair".
- R30: the story intro carries the Progress Bar's alert merge and its figures.
- R59: the Runtime check bullet and the own-file case, as decided.
- CR-B: rows for `.close-button` (the Close Button's) and `.is-hidden` (the Toggler's State class) in the mapping, in the XY Grid's form of an other-family row.

Other fixes:

1. The WCAG lead's parenthesis said axe's figures "are a few hundredths higher"; with the exact figures axe's 3.82 to 4.25 are a hundredth lower, so it now says they "differ in the second decimal" (the Card's wording).
2. D12 said the presence request comes "at the first render"; R59 makes it every run from the first render on, so D12 reads "from the first render on".

Left open (a decided API, not changed): proposal 1.

Confirmed unchanged: R5 (the Notes line on the Progress Bar's alert), R14 (the 2.5.8 row points to the floor), R26 (the `$light-gray` figures), R28/R29 (nothing for the Callout), R65 (no class on Trigger hosts), R73 (`#666666`); CR-C, CR-D (`app-invoice-status` imports what its template writes). A single directive with no in-family parent, child, or peer: no In-family line (the content query finds another family's token).

### card

Decided items applied:

- R26: `card--sizing` and `card--long-words` as decided; the two grid recipes carry `gridMarginX`.
- R32/R64: `ngSrc` in the Rendered HTML (two images) and the list recipe; the rendered lines drop `src`; the lead-in names `NgOptimizedImage`'s own attributes; the sentence after the block as decided.
- CR-B: rows for the XY Grid's (`.grid-x`, `.grid-margin-x`, `.<bp>-up-<n>`, `.cell`), the Flexbox Utilities' (`.flex-container`), and the Typography Helpers' (`.no-bullet`) classes, which the prose named only.

Other fixes:

1. Sass (1)(b) described the helper as "`math.pow` on 8-bit channels" and did not name Foundation's two functions as unused, so it met neither R4's S1 nor its equivalence clause; 8-bit channels are how the ticket computed its figures (the painted colours), not how the helper computes (unrounded, R4's ratio rule). It now names the helper and both functions as never used. Every figure stands.
2. The story paragraph's scaffolding list names `gridMarginX`, because the stories now use it.

Confirmed unchanged: R4 figures (4.858:1, 6.012:1, 3.755:1, and the rest), R31 (the Responsive Embed note), R34/R35, R73 (4.601:1); the In-family line of [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](../issues/154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md); CR-A, CR-C, CR-D (`app-product-card` imports `NgOptimizedImage` and `NfsCardSection` and hosts `NfsCard`).

### close-button

Decided items applied:

- R17: "no `exportAs`" in the API line and the replacement bullet; no design-decision or Material row restated it.
- R2: the Animation parenthesis and `close-button--closable`, as decided.
- R4: the WCAG lead, Sass (1)(c) with S1, and item (2), as decided; every figure stands.
- R25: `close-button--closable` and the story intro, as decided.
- R59: the Runtime check bullet and the own-file case.
- R74: check 1 gains the image clause after the text clause, check 2 reads "the name, read as check 1 reads it", and layer 2 gains a silent image-only close button.
- A5: the Rendered HTML note, as decided.
- CR-B: rows for the Callout's (`.callout` and its colour), the Toggler's (`.is-hidden`), and the Reveal's (`.reveal`) classes the examples carry.
- R57: no "developer's own class" occurs (the one "developer's own" names a `(click)` handler); nothing to change.

Other fix:

1. D10 said "at its first render"; it now says "from its first render on", as R59's bullet does.

Confirmed unchanged: R14, R50 (`<dialog nfsReveal>` with no class), R65; CR-A, CR-C, CR-D (`app-cookie-notice`). A single directive: no In-family line.

### drilldown-menu

Decided items applied:

- R26: rule 5's declarations and reason, and the 1.4.4 and 1.4.12 row, as decided.
- R57: "application class" (twice, the copied-class test case) reads "Application class".

Other fix:

1. R74's clause for any other spec: development check 3 reported "a button that has no accessible name" without saying how the name is read; it now reads it as accessible-name computation does (text outside `aria-hidden="true"` subtrees, the visually hidden suffix included, or an image's non-blank `alt` or a `role="img"` element's `aria-label`), and the development-warning cases gain a silent image-only back button.

Left open (a decided API, not changed): proposal 2.

Confirmed unchanged: R1 (`nfsShowForSr` cited plainly; `app-shop-nav` imports `NfsShowForSr`), R3 (D28 needs no change), R4 (the 1.4.11 row and the Sass checks name the helper and both functions), R39, R66; the In-family lines of [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md), whose checks 1 and 2 already follow the registration bullet; CR-A (the copied-class prose and test fixture say so), CR-C, CR-D (the `templateUrl` example's imports cover the markup it cites).

### dropdown-menu

Decided item applied:

- R3: the `.dropdown` row, as decided.

Confirmed unchanged: R4 (exact, the helper named with both functions), R22/R53 (`$topbar-submenu-background: $topbar-background;` wherever the Top Bar line is required), R47 (D9 and D15), R66; the In-family line applied from [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) (the note in [Re-run: Dropdown Menu spec under the class rule](../issues/113-rerun-dropdown-menu-class-rule.md)); CR-A, CR-B (the Top Bar row exists), CR-C, CR-D (`app-site-nav`).

### dropdown

Decided items applied:

- R2: check 5's third case and the Out of Scope Motion bullet, as decided.
- R52 and R54: the Animation parenthesis reads "the exception the Breakpoint service spec's consuming-directive rule 3 names for directives that bind no Motion class under reduced motion"; D21 cites "consuming-directive rule 3".
- R57: the `parentClass` row ("It names an Application class"), the `animate` row ("an Application class that is a keyframe animation, with a leading dot", the Toggler row's form), and three lowercase "application class" in the Positioner rule and D6.
- R59: the own-file case.
- CR-B: the `.is-opening` row as decided, and rows for the Button's, Button Group's, Visibility Classes', XY Grid's, and Reveal's classes the examples carry.

Other fixes:

1. R2's point 2 (a value that does not split maps to no class in either direction) was stated in check 5 but not in the Motion names rule that describes the mapping; the rule gains the clause, naming `nfsMotionPairClasses`.
2. CR-C: the API paragraph said the Toggler re-run "confirms or renames" `NfsMotionPair`; the re-run resolved and the [Spec: Toggler](../issues/17-spec-toggler.md) takes it (D18), so the sentence says so.
3. CR-C: the stories paragraph left out "demo scaffolding whose Foundation classes have no directive yet", and `dropdown-pane--default` left out the docs example's form grid "whose directives the XY Grid spec names"; every scaffolding class has a directive now, so the paragraph points at storybook-conventions section 8, and the story ports the grid (`nfsGridContainer`, `nfsGridX` with `gridMarginX`, `nfsCell` with `[size]="{medium: 6}"`, Foundation's markup read in `docs/pages/dropdown.md`).
4. CR-D, the rule's intent: `app-header` renders `<app-heavy-details />` in a `@defer` block but did not import its component, which fails to compile (NG8001); `imports` gains `HeavyDetails`, and the lead-in names it as the application's own component.

Confirmed unchanged: R17 (the `size="small"` button sits after the group), R50, R51 (every `class="dropdown-pane"` is output or a labelled check input), R65, R68 (the static `autoFocus` report stays), R69/R70; CR-A. A single directive: no In-family line ([Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md) found nothing for it).

### equalizer

Decided items applied:

- R7: the names paragraph; `gridMarginX` on the CSS answer's grid (Rendered HTML consumer and server HTML, the usage example's first grid) and `gridPaddingX` on the block grid; the sentence after the usage block; `equalizer--docs-markup` and `equalizer--css-flex-cells` with `gridMarginX`, `equalizer--css-block-grid-rows` with `gridPaddingX`.
- R32/R64: the usage example's two images write `ngSrc`.
- R57: six "the developer's own class(es)" read "the consumer's own class(es)"; where the same phrase paired it with "the developer's own (CSS grid) rule(s)", that noun changed with it, so a phrase names one party. D14's "the developer's own grid rules", which names no class, stays, as R57 allows.
- R58: `equalizer--reflow` in the Story id list and the play-function list with the decided assertion; the e2e case and the 1.4.10 row's test cell name it.

Other fixes:

1. R58 adds a breakpoint-aware story, which the stories paragraph forbade ("never a breakpoint-dependent layout"); the paragraph now states `equalizer--reflow` as the one exception and why.
2. CR-C: the stories paragraph's "`nfsGridX` and `nfsCell` (the XY Grid spec fixes the names)" cites the [Spec: XY Grid](../issues/99-spec-xy-grid.md) and says which stories carry a gutter.

Confirmed unchanged: R34/R35; the In-family lines of [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](../issues/154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md); CR-A, CR-B (the mapping has one row per other family already), CR-D (`app-legacy-panels`; `app-product-tile` hosts its directives).

### flex-grid

Decided items applied:

- R16: the Notes line takes the shared sentence for `.row` (pointing at the four other specs, as the committed reviewers wrote it), then the measured detail.
- R59: the Injection bullet names `nfsVariantCheck('nfsRow')` and `nfsVariantCheck('nfsColumn')`.
- CR-B: rows for the Flexbox Utilities' (`.align-*`, `.align-self-*`, `.<bp>-order-<n>`), Callout's, Visibility Classes', and Typography Helpers' classes on Foundation's docs page and in the spec's markup (the docs page's own chrome classes are left out).
- [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md)'s routed fix: check 3's condition "a host that is not also a row, whose parent element is not a row, warns", and layer 2's "a column row outside a row does not".

Confirmed unchanged: R34/R35, R37 (D15); the In-family lines of [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md); check 3 counts the parent's attribute as a row (the shared DOM-placement bullet); check 5 reads the parent's `column` class and is silent where the parent's `NfsColumn` import was forgotten, which the runtime check reports; CR-A, CR-C, CR-D (`app-product-list`).

### flexbox-utilities

Decided items applied:

- R16: the Notes line takes the shared sentence for `.flex-container` and `.grid-x`.
- R57: the helper mixins row and the Out of Scope bullet ("the consumer's own classes"); "the developer's own stylesheet" stays, as R57 allows.
- R59: the Injection bullet names the two handles and that `NfsFlexAlign` makes no call.
- A1 and A2, as decided.
- CR-B: rows for the XY Grid's, Callout's, Button Group's, Button's, Media Object's, Menu's, and Typography Helpers' classes (Foundation's docs examples use `.grid-x.grid-padding-x`, `.cell.small-<n>`, `.callout.primary`, and `.text-center`; the spec's markup adds the others).
- [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md)'s routed item: the In-family line states the cross-family neighbours the shared spec's way.

Other fixes:

1. CR-C, a deferral the sweep had not listed: the Rendered HTML lead-in called `nfsGridX`, `nfsCell`, and `size` the Equalizer's and Card's names "until the [Spec: XY Grid] names its directives" and left the gutter classes out "until it names that input"; it now cites the XY Grid spec, and every grid ported from Foundation's examples carries `gridPaddingX` (consumer markup) and `grid-padding-x` (server HTML), as every grid of Foundation's flexbox docs page does (15 of 15, read in the clone); the stories paragraph says so.
2. The Out of Scope hiding bullet still named "the hide directive of the Visibility Classes"; it names `nfsVisibility` with a bare `hideFor`, R16's third means.
3. The usage example quoting the Equalizer's CSS answer takes `gridMarginX`, as R7 made the Equalizer spec write it.

Confirmed unchanged: R10, R37 (D8), R38, R39; check 2's message already names a forgotten Flex parent import ([Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md)); CR-A, CR-D (`app-product-summary`).

## The registration rule (the brief's addendum)

The shared spec's two bullets (DOM-placement checks and registration checks say nothing where the element they look for carries the peer's attribute) were checked against every development check of the group that finds a part:

- Drilldown checks 1 and 2 (registration): already aligned by [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md); check 3's "outside any submenu" stays, because `NfsSubmenu` stays optional and a back item outside any submenu is a bare part.
- Dropdown pane check 3 (Triggers found by registration): no change. A bound Trigger (`[nfsToggle]="pane"`) whose import is forgotten fails to compile (NG8002), and a bare Trigger reaches the pane only from inside it, where it cannot open a closed pane, so no forgotten import can reach the check.
- Flex Grid check 3 and the Flexbox Utilities' check 2 (DOM placement): already follow the rule ([Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md)).
- Close Button check 3 (`nfsButton` seen as the host's `.button`) and Dropdown pane check 8 (`closest('.button-group')`): they find another family's directive by its class, so a forgotten `NfsButton` or `NfsButtonGroup` import leaves them silent while the runtime check reports it, and the message holds once the import is added ([Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md)'s question); no change.

None of the checks the addendum names (the Orbit's, the Triggers', the Off-canvas', the Tabs') is in this group.

## Items the family re-runs routed to this review, for this group

- [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md): the Dropdown Menu's line (applied by the orchestrator on 2026-09-29, confirmed); the Drilldown's lines kept as they are. The Accordion's label and form are another group's.
- [Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md): nothing for this group.
- [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md): the Flexbox Utilities' cross-family sentence (added); the checks that find a peer by its class (the section above).
- [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](../issues/154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md): the Flex Grid's placement check agrees with S2 (confirmed).
- [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md): the Flex Grid's check 3 column-row case (applied).

## Proposed changes to shared documents, this group's decided APIs, and other groups' specs

These are proposals only; this reviewer made none of them.

1. The Callout's `exportAs` (this group; a decided API, so left to the coordinator). R17 decided building-blocks 1.3's rule, "a directive with no state or method to read has none", for `NfsButton` and `NfsCloseButton`, and called them the two outliers; `NfsCallout` is a third, with two inputs and nothing else, and its only stated reasons are parity with those two (API bullet, D4), which R17 removed. No spec writes `#x="nfsCallout"` (searched). Rating: impact LOW (a name removed before the first release; restoring it is additive, ADR 0045), confidence HIGH (R17's reasoning, the rule's text). In `specs/callout.md`, replace

   > Selector `[nfsCallout]`; `exportAs: 'nfsCallout'`; standalone; no template.

   with

   > Selector `[nfsCallout]`; no `exportAs`; standalone; no template.

   replace

   > - `exportAs: 'nfsCallout'` exposes the two input signals to template references, as `nfsButton` and `nfsCloseButton` do.

   with

   > - No `exportAs`: the directive owns no state or method a template could read (building-blocks 1.3), as `nfsButton` and `nfsCloseButton` have none; adding one later is additive.

   and in D4 replace "Defaults token, or providers; `exportAs: 'nfsCallout'`" with "Defaults token, providers, or `exportAs`", and "Foundation's callout has no state; parity with `nfsButton` and `nfsCloseButton` at no code cost" with "Foundation's callout has no state, and a directive with no state or method to read has no `exportAs` (building-blocks 1.3), as `nfsButton` and `nfsCloseButton` have none". [Spec: Callout](../issues/89-spec-callout.md)'s amendment then gains a bullet: "R17's rule applied to `NfsCallout`: no `exportAs`."

2. The Drilldown wrapper's and back item's `exportAs` (this group; a decided API). `NfsDrilldownWrapper` and `NfsDrilldownBack` have "No inputs, outputs, or public methods" (their API headings), yet export `nfsDrilldownWrapper` and `nfsDrilldownBack`; no spec writes either reference (searched). Same rating and reasoning as proposal 1; the root's `exportAs: 'nfsDrilldown'` stays (it has `openPath()`, `collapseAll()`, and `currentLevel`). In `specs/drilldown-menu.md`: in the mapping rows, remove "`, `exportAs: 'nfsDrilldownWrapper'`" and "`, `exportAs: 'nfsDrilldownBack'`"; the headings become "#### `NfsDrilldownWrapper` (`[nfsDrilldownWrapper]`, no `exportAs`)" and "#### `NfsDrilldownBack` (`li[nfsDrilldownBack]`, no `exportAs`)"; and each "No inputs, outputs, or public methods." becomes "No inputs, outputs, public methods, or `exportAs` (building-blocks 1.3: nothing to read)."

3. Other groups' specs, the same outliers: `specs/badge.md`, `specs/label.md`, and `specs/responsive-embed.md` each export an input-only directive (`nfsBadge`, `nfsLabel`, `nfsResponsiveEmbed`) and justify it by parity with directives that no longer export anything: badge.md "as `nfsCallout` and `nfsLabel` do", label.md "as `nfsBadge`, `nfsButton`, `nfsCallout`, and `nfsCloseButton` do", responsive-embed.md "as `nfsCallout` and `nfsBadge` do". At the least those comparisons are false after R17 (the Button and Close Button); with proposal 1 they all go. Proposed, in each spec's API bullet, the form of proposal 1 ("No `exportAs`: the directive owns no state or method a template could read (building-blocks 1.3); adding one later is additive."), the API line's "no `exportAs`", and the D1 cell's "`exportAs: '<name>'`" removed; and in `building-blocks.md` Table D, the Badge, Label, and Responsive Embed rows drop "; `exportAs: 'nfsBadge'`", "; `exportAs: 'nfsLabel'`", and "; `exportAs: 'nfsResponsiveEmbed'`". Rating: impact LOW, confidence HIGH, for the group that owns those specs to apply or the coordinator to route.

4. `building-blocks.md` 1.10, the Clipping containers bullet that R26 adds (closing pass item 14): it names `nfs-drilldown` on `.is-drilldown`, which is the Drilldown's rule 5 as now written; no change to R26's text is needed.

No other shared-document change is needed for this group beyond the closing-pass list of the decisions file (R4's Callout figures in building-blocks 1.10 and storybook-conventions section 5, R16's hidden bullet, R26's bullet, R36's section 8, R52 and R54 in 1.6 rule 5, R59 in 1.4).

## Process notes

- Measurements: none new. Foundation 6.9.0's docs pages (`callout`, `card`, `close-button`, `dropdown`, `dropdown-menu`, `drilldown-menu`, `equalizer`, `flex-grid`, `flexbox-utilities`) were read in the local clone for the CR-B rows and the restored gutters; the coordinator's `ratio.mjs` was not needed, because every figure this group changed is a figure the decisions file gives.
- Two scratch scripts under the session scratchpad applied mechanical edits (the Flexbox Utilities' five ported grids, and appending the nine amendments, each once); no file outside the effort's specs, the nine governing tickets, and this report was written.
- Against the brief's shell rules, several read-only commands were written as `cd <path>; <command>`, and one as `cd <path> && rg ...` over the Foundation clone; none wrote a file, and no `git -C` was used.
- The work was interrupted three times by the session's usage limit; each resumed from the files' current state, re-read before the next edit. No other group's commit touched this group's nine specs or nine tickets.
