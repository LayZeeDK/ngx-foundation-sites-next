# Consistency review, group d

Ticket: [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), phase 2, group d, 2026-09-29. Specs: nested-menu, off-canvas, orbit, pagination, progress-bar, prototyping-utilities, responsive-accordion-tabs, responsive-embed, responsive-menu. Input: [consistency-review-decisions.md](consistency-review-decisions.md) (its per-spec index, CR-A to CR-D, the placeholders and findings), the Answers of the five family re-runs ([Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) to [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md)), `specs/forgotten-import-checks.md` (the family rule and its two bullets on DOM placement and registration checks), building-blocks, ADRs 0039, 0040, 0044, 0045, 0046, and the glossary. Every spec was read in full. Model: Opus 5.5. No measurement was needed: every new figure is one the decisions file measured.

Each spec's governing ticket (the one the map's Decisions so far cites last for it) carries a dated `### Amendment, 2026-09-29 (consistency review)`: [Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md), [Re-run: Off-canvas spec under the class rule](../issues/117-rerun-off-canvas-class-rule.md), [Re-run: Orbit spec under the class rule](../issues/125-rerun-orbit-class-rule.md), [Spec: Pagination](../issues/87-spec-pagination.md), [Spec: Progress Bar](../issues/95-spec-progress-bar.md), [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md), [Re-run: Responsive Accordion Tabs spec under the class rule](../issues/111-rerun-responsive-accordion-tabs-class-rule.md), [Spec: Responsive Embed](../issues/96-spec-responsive-embed.md), and [Re-run: Responsive Menu spec under the class rule](../issues/115-rerun-responsive-menu-class-rule.md). No shared document and no other group's spec was edited.

Checks run on all nine after the edits: `rg -n 'class="|\[class|ngClass|routerLinkActive=|animate\.(enter|leave)='` (every hit is rendered output, a labelled copied-class case, Foundation's labelled markup, or an Application class; CR-A holds), the CR-C search of the decisions file (no deferral left), every `@Component` example's `imports` against its template (CR-D), a banned-word search (none), and ASCII and CRLF on every edited file.

## Per spec

### nested-menu (governing [Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md))

Decided items applied:

- R26: rule 9 gains `overflow-wrap: break-word` beside `overflow: clip`, with the measured reason.
- R47: the 1.4.1 row's open-Hybrid sentence.
- R52: "consuming specs:" in the family diagram; "Consuming spec" as the header cell of "What each consuming spec maps".
- R57: "Application class" in the class-map test.
- CR-B: the four Nest and State rows of the class mapping point at the per-mode host tables under API (`NfsMenuItem`, `NfsSubmenu`), which stay the one copy.

Other fixes:

- `nfsMenuModeToken`'s development description dropped "a menu root:", so it reads in M7's form for a token several directives provide, as `nfsOpenableToken`'s does. Reason: [Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md) asked the review to check that the two multi-provider descriptions agree; M7 is "provided by <Directive> from '<entry point>', ... or <Directive> from '<entry point>', on an ancestor element ...".

Confirmed, unchanged: R3, R4 (the exact-formula sentences name the helper and both Foundation functions; 4.65:1, and Foundation's 4.59:1 kept as its labelled false pass), R66, R69/R70; the [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) lines (check 4 already silent for a forgotten toggle import; check 2 reads attributes). Open: none.

### off-canvas (governing [Re-run: Off-canvas spec under the class rule](../issues/117-rerun-off-canvas-class-rule.md))

Decided items applied:

- R25: the 1.4.3 row names Foundation's `$anchor-color` for its 4.65:1 and adds 6.01:1 with the Callout's required `$anchor-color` (the Storybook overrides); the 1.4.12 row after 1.4.10; the e2e text-spacing case on `off-canvas--default` that the row's test cell names.
- R26: rule (b) gains `overflow-wrap: break-word` with its measured reason and why not `anywhere`; the Solution paragraph, the Sass summary, D19, the 1.4.10 row, and Sass item 5 (missing include) follow.
- R52: "consuming-directive rule 1" in both citations.
- R57: "the consumer's own classes" in both places.

Other fixes:

- Registration rule (brief; the shared spec's second bullet after the family rule's item 5): development check 3's content half now says nothing for a panel inside an element that carries `nfsOffCanvasContent` without its class, a forgotten import that `strictDirectiveImports` reports once (M1); it keeps its message for a bare panel, the kept-optional case of item 2. The `NfsOffCanvas` In-family line (which said check 3 "is still true when a content written around a nested panel lost its import") and the browser-level case (a silent forgotten-content case and a warning bare case) follow. A sibling panel's `[content]` reference to a forgotten content fails to compile (NG8003), so only the nested case needed the rule.

Confirmed, unchanged: R4, R14, R22/R53, R50, R56, R59 (the call only while `revealOn` or `inCanvasOn` is bound; one test file per case), R65, R66, R68, R69/R70; CR-A (the copied-class block's lead-in labels it), CR-D (no component example). Open: none.

### orbit (governing [Re-run: Orbit spec under the class rule](../issues/125-rerun-orbit-class-rule.md))

Decided items applied:

- R15: rule 13, the rules' lead-in ("rules 0a, 0b, 9 to 14", merged with R26), Sass item 5, the 1.4.11 forced-colours row, the e2e forced-colours case, the compile test, D27, and the Foundation-behaviour bullet.
- R26: rule 14, the 1.4.12 row, the e2e text-spacing case, Sass item 5. The decision's 1.4.12 row has four cells; the Orbit's WCAG table has three, so the measured failure moved into the requirement cell.
- R32/R64: `[ngSrc]` with `[priority]="first"` in the Rendered HTML and the usage component, `NgOptimizedImage` in `imports`, the sentence after the usage block, the rendered `img` without `src`. By the image rule's point 3 the Rendered HTML lead-in now says `NgOptimizedImage`'s own attributes are left out, and the `@defer` bullet's "`loading="lazy"` on slide images after the first" became `NgOptimizedImage`'s lazy loading (point 2: no `loading` attribute).
- R61/R63: the hierarchy block's "(class only)" names the development-only optional `nfsOrbitToken` lookup "for its parent check". The decision quoted the Slider fill's line as "dev check 8"; [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md) has since reworded the Slider's line to "for its parent check", so the Orbit follows the current line (the decisions file's convention for moved text).

Other fixes:

- Registration rule: development checks 1 (no rotation control) and 3 (no bullets) now say nothing where the root holds an element carrying `nfsOrbitRotation`, `nfsOrbitBullets`, or `nfsOrbitBullet` that registered nothing, a forgotten import the root's child probe reports once (M2); they keep their messages for an Orbit with no such element. The root's In-family line ([Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md)'s "Dev checks 1 and 3 stay ... still true") and the browser-level case follow.
- The class-only parts' In-family line says why M4 and the `strictParents` throw hold for a projected class-only part: every Orbit part with behaviour must already be declared inside the `[nfsOrbit]` element in the same template (Rendering modes), so a projected Orbit needs the template-outlet pattern anyway, which serves the class-only parts too. [Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md) flagged this for the review; the shared spec's `strictParents` section now carries the general sentence.
- D27 was first inserted above D26 and then moved below it.

Confirmed, unchanged: R1 (`NfsShowForSr` in `imports`), R4 (3.68, 5.21, 2.94, 3.01 labelled), R62; CR-A, CR-C. Open: none.

### pagination (governing [Spec: Pagination](../issues/87-spec-pagination.md))

No decided item changes it; confirmed: R4 (every figure exact), R9/R23, R24 (the landmark check), R74 (attribute-only, no change).

Other fixes:

- R4's S1 added to the Sass checks paragraph. Reason: S1 goes into every checking mixin's Sass subsection unless it already names the exact formula, the helper, and both Foundation functions as unused; the checks paragraph named only the helper (the WCAG subsection named the rest).
- `app-invoice-pager`: `private readonly results = viewChild.required(...)` became `protected`. Reason: the repository's AGENTS.md (member visibility): no TypeScript `private`, and Angular signal queries take `protected`.
- The `NfsPagination` In-family line says that `nfsTextAlign` beside it belongs to the Typography Helpers and is not probed. Reason: [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md) asked the review to state cross-family neighbours the same way in each spec (the shared spec's rule that a part probes only its own family).

Open: none.

### progress-bar (governing [Spec: Progress Bar](../issues/95-spec-progress-bar.md))

Decided items applied: R5 (the palette-reach sentence after the overrides sentence), R15 (the WebKit reason), R30 (`progress-bar--right-to-left` names each bar and shows and asserts its Visible value), R59 (the handles `nfsVariantCheck('nfsProgress')` and `nfsVariantCheck('nfsProgressElement')`), R74 (check 1's `aria-labelledby` text and the progress element's `labels` text count an image's non-blank `alt` or a `role="img"` element's non-blank `aria-label`; the development-check cases gain the two silent image-only cases).

Other fixes:

- R4's S1 added to Sass rule (c), which named the helper but neither Foundation function as unused; the sentence it replaced said the same thing more briefly.

Confirmed, unchanged: R4 (every figure), R59's call on every run and its own-file case, [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md)'s In-family lines, CR-A, CR-C, CR-D (`app-upload`). Open: none.

### prototyping-utilities (governing [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md))

Decided items applied: R32/R64 (the rendered image-replacement `img` without `src`), R59 (`include()` names no `prototype-<flag>-breakpoints` flag property; the injection bullet names the handle with its argument).

Other fixes:

- The Testing Decisions line said "each story imports `nfsPrototypeClasses`", the import array D2 rejects under ADR 0046 (and the forgotten-import checks spec's "no import arrays"). It now says each story lists the directive of every family it uses in `moduleMetadata.imports`.
- CR-C: D4's rationale called `nfsTextAlign` and `nfsShowForSr` "the published placeholders"; it now states that the Typography Helpers and Visibility Classes specs published those names. The same Testing Decisions line pointed at "the Storybook conventions change the Answer proposes"; storybook-conventions section 5 carries it (the flags and the include), so the line points there.
- R4's S1 added to Sass rule (c).
- The usage example's hero image takes `priority` (building-blocks 1.2 image rule, point 2: the likely largest contentful paint).

Confirmed, unchanged: R39, R41/R42 (`nfsOverflow="hidden"`, `nfsPosition="relative"`), R43; CR-A, CR-D (`app-release-notes`). Open, not this review's: T9 of [Audit: the specs against the architecture guide](../issues/142-audit-specs-against-architecture-guide.md), one Library mixin for seventeen export mixins, OPEN FOR HUMAN since that audit; no edit here depends on it beyond the mixin's name, which a ruling for (b) or (c) would change throughout the spec in its own re-run.

### responsive-accordion-tabs (governing [Re-run: Responsive Accordion Tabs spec under the class rule](../issues/111-rerun-responsive-accordion-tabs-class-rule.md))

Decided items applied:

- R4: 6.01:1 on `$white` (the 1.4.3 row); Sass item (2) no longer lists `color-luminance()` as reused and says the `nfs-accordion` and `nfs-tabs` checks compare the exact unrounded ratio of the library's helper. The decision's quoted text left ", (the ..." after a list item; the parenthesis now follows the settings it qualifies.
- R45: line 30, the include comment, D20, and Sass item (5), as quoted. The same rule made five more sentences false, so they follow its intent: the 1.4.3 row (which said the tabs pair is left to the story gate), the Sass and custom CSS summary and the Sass subsection's lead ("required when either input is set", "a plain strip needs none of it"), item (1) (the checks run whether or not either input is set), and item (2)'s last sentence ("the Tabs pair is enforced by the story gate and a play function"). Each cites the Tabs spec's D26, which group f published.
- R46: the sentence after the equal-heights recipe.
- R52: "consuming-directive rule 4" in both places. R57: "Application class" in four places.

Other fixes:

- Hierarchy and DI shape gains an In-family line, in the form the architecture audit's X1 gave the Interchange: `NfsResponsiveAccordionTabs` has an element selector (NG8001 reports a forgotten import), `NfsResponsiveAccordionTabsPanel` sits on `ng-template` and calls nothing (the static check sees a forgotten one; dev check 3 then warns of no section), and the composed Accordion and Tabs directives follow their own specs' lines. Reason: the family rule asks every spec with more than one directive for the line, and building-blocks 1.9 asks each family spec to state it; [Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md) found nothing else to add.
- CR-D: `app-product`'s `imports` gains `ReviewList`, the application's `app-review-list`, which its template writes inside `@defer` (a deferred dependency must be in `imports`, and the template would not compile without it).

Confirmed, unchanged: CR-A (the host's `class="equal-heights"` is an Application class; every other hit is rendered output), CR-C. Open: none.

### responsive-embed (governing [Spec: Responsive Embed](../issues/96-spec-responsive-embed.md))

Decided items applied: R59 (the missing-property case in a test file of its own), R74 (check 1's `aria-labelledby` text counts an image's non-blank `alt` or a `role="img"` element's non-blank `aria-label`, citing building-blocks 1.10; one silent image-only case).

Other fixes:

- CR-C: the Notes line "the [Spec: Float Classes] can note it" reads "notes it too"; `specs/float-classes.md` already carries the note (its Notes, the Responsive Embed beside a float).

Confirmed, unchanged: R26 (the 1.4.12 row and D8), R31 (the fixture route with counted requests), CR-A, CR-D (`app-video-embed` writes no library directive in its template). Open: none.

### responsive-menu (governing [Re-run: Responsive Menu spec under the class rule](../issues/115-rerun-responsive-menu-class-rule.md))

Decided items applied: R26 (the 1.4.12 row), R47 (the Base side bullet), R52 ("consuming-directive rule 4" in both places), R57 ("Application class").

Other fixes:

- `app-site-nav`: `readonly #menu = viewChild.required(NfsResponsiveMenu)` became `protected readonly siteMenu`. Reason: AGENTS.md, member visibility: Angular signal queries take `protected`, because Angular needs compile-time access and an ES private field cannot carry a query. The new name keeps clear of the template reference `#menu`.

Confirmed, unchanged: R1, R3, R4, R65, R66, R69/R70, [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md)'s quoted In-family line (already applied), CR-A, CR-C, CR-D. Open: none.

## Registration-rule alignments (the brief's last section)

| Spec | Check | Before | After |
| --- | --- | --- | --- |
| Off-canvas | Development check 3, content half | Kept its message when a content written around a nested panel lost its import ([Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md), decision 2.1) | Says nothing where an ancestor carries `nfsOffCanvasContent` without its class (M1 reports it); keeps its message for a bare panel |
| Orbit | Development checks 1 and 3 | Kept their messages when the rotation control or the bullets were written with a forgotten import ([Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md), decision 5.7) | Say nothing where the root holds an element carrying `nfsOrbitRotation`, `nfsOrbitBullets`, or `nfsOrbitBullet` that registered nothing (the root's probe, M2); keep their messages for an Orbit with no such element |

The Triggers' check 1 and the Tabs are other groups' specs. The Off-canvas check 3's wrapper half already followed the DOM-placement bullet ([Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md), decision 2.6).

## Items left open

None from this group. Rated under the map's triage rule, every fix above is impact LOW (wording, development checks and their tests, example code, one documentation line per rule) with confidence HIGH (the decisions file's measured texts, the shared spec's rules, AGENTS.md). The one open point touching a group d spec is T9 of [Audit: the specs against the architecture guide](../issues/142-audit-specs-against-architecture-guide.md) (above), already OPEN FOR HUMAN and outside this review.

## Proposed shared-document changes

P1. `specs/forgotten-import-checks.md`, In-family checks, the bullet on checks that find a peer by registration: the Orbit's and the Off-canvas panel's checks now follow it, so its examples name them. Replace "(the Drilldown's checks 1 and 2, the Nested menu's check 4)" with:

> (the Drilldown's checks 1 and 2, the Nested menu's check 4, the Orbit's checks 1 and 3, the Off-canvas panel's check 3)

P2. `specs/forgotten-import-checks.md`, the family rule's item 2: its parenthesis "(the Triggers' check 1, the Off-canvas panel's check 3)" stays true for the bare case only; to keep it from reading as the forgotten-import case, replace "stays the report for the case that needs the parent (the Triggers' check 1, the Off-canvas panel's check 3)" with:

> stays the report for the case that needs the parent and has none, while an element that carries the parent's attribute without its directive is left to the bullet on checks that find a peer by registration, above (the Triggers' check 1, the Off-canvas panel's check 3)

No change is proposed to building-blocks, CONTEXT, README, the map, the ADRs, storybook-conventions, or the guide beyond the decisions file's own list; this group's edits cite R52's "consuming-directive rule 1" and "rule 4" labels, which the Breakpoint service spec (group a) takes under R52.

## Proposed changes to other groups' specs

None needed. The group d edits cite the Tabs spec's D26 (published by group f), the Breakpoint service's renamed rule labels (R52, group a), and the Float Classes spec's existing Responsive Embed note; each exists or is decided.
