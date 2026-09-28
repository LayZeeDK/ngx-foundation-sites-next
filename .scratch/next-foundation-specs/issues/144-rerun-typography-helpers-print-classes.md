# 144. Re-run: Typography Helpers spec for the print helper classes

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The [Re-run: Visibility Classes spec for the print classes](143-rerun-visibility-classes-print.md) took `.show-for-print` and `.hide-for-print` into the Visibility Classes and left the other two classes of Foundation's `foundation-print-styles`, `.print-break-inside` and `.ir` (a class that mixin's print rule reads), out of that spec as `scope-boundary`, proposing them for the [Spec: Typography Helpers](106-spec-typography-helpers.md). How does the Typography Helpers spec take them under the class rule (ADR 0039: consumers write no Foundation or NFS class) and the Utility directive rule (ADR 0044), and what changes in its directives, types, checks, stories, and tests? If either class should stay out, say why with a category.

## How to work it

Revise `specs/typography-helpers.md` in place and append a dated `### Amendment, 2026-09-28 (print helper classes)` to the [Spec: Typography Helpers](106-spec-typography-helpers.md) ticket. Read first: the Answer of the Visibility Classes print re-run, the Typography Helpers spec and ticket, ADR 0039, ADR 0044, and Foundation's `scss/components/_visibility.scss` and `scss/typography/_print.scss`. Measure what the two classes do under print emulation in Chromium, Firefox, and WebKit. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.

## Answer

Resolved 2026-09-28 (Opus 5.5, AFK: both sides of the grilling played against the sources). Spec revised in place: [specs/typography-helpers.md](../specs/typography-helpers.md); the change is summarised in the dated amendment of the [Spec: Typography Helpers](106-spec-typography-helpers.md) ticket.

Sources read: the Answer of [Re-run: Visibility Classes spec for the print classes](143-rerun-visibility-classes-print.md) and that spec's print rows and Out of Scope; the Typography Helpers spec and ticket; ADR 0039, ADR 0044 (with its dated note of 2026-09-28), ADR 0040; building-blocks 1.3, 1.4, 1.10, 1.12, 1.13, 1.14, and Table D; the Prototyping Utilities spec's Utility directive rule (clauses 0 to 7); `architecture-guide.md` (P13, P17, P18, P22 to P24); `CONTEXT.md`; the map's AFK override and triage rule; `research/out-of-scope-exclusions.md` (categories and the `deprecated-upstream` precedents: Slider `invertVertical`, Sticky `both`, Tooltip `touchCloseText`, the Responsive Embed's `.flex-video`); Foundation 6.9.0's `scss/typography/_print.scss`, `_typography.scss`, `scss/components/_visibility.scss`, `scss/_global.scss` (`pre { overflow: auto }`), the Print Styles section of `docs/pages/typography-base.md`, a search of the whole clone for both classes (only `_print.scss` names them), and the history of `.print-break-inside` (commit 739fede6b, 2016-12-21, "Helper class for page breaks inside elements"); HTML5 Boilerplate's changelog (5.0.0, 2015-02-01: "Remove image replacement helper class `.ir`") and its `main.css` at v4.3.0 (the `.ir` screen rules and the `.ir a:after` print exemption) and v5.0.0 (neither), fetched raw from GitHub.

### Measurements made for this ticket

Throwaway scripts under `D:/tmp/nfs-wave-144/` (not committed; no server, no port, no junction; packages read from the existing `D:/tmp/nfs-ct-prototype` install). Foundation 6.9.0 Sass from the local clone compiled with Dart Sass 1.104.1 through `@include foundation-everything;` on default settings; Playwright 1.63 with Chromium 153, Firefox 155, WebKit 26.6, and the installed Edge 153; axe-core 4.13.0 with the six WCAG 2.2 AA tags.

- M1, computed styles (`computed.mjs`), four engines, identical results except the serialisation of `::after` strings:
  - Print (`emulateMedia`): computed `break-inside` and `page-break-inside` are `avoid` on `pre`, `blockquote`, `tr`, and `img`, and `auto` on each with `.print-break-inside`; `auto` with or without the class on a `div`, a `table`, and a `code.code-block`. Screen: `auto` everywhere, with or without the class.
  - Link suffixes in print: `a[href="/orders/42"]` prints " (/orders/42)"; `#x` and `javascript:` links print nothing; the current-path in-page link `/orders/42#x` prints " (/orders/42#x)"; links inside an `.ir` element, at any depth, print nothing; a link carrying `.ir` itself prints " (/orders/44)"; an `abbr` inside `.ir` still prints its title. Screen: no suffix anywhere; an `.ir` element computes like a plain `div` (display, overflow, text indent, background, border).
  - axe reports nothing about either class on screen or under print emulation (the only violation is `page-has-heading-one`, because the test page has no `h1`).
- M2, pagination (`pdf.mjs`), Chromium and Edge `page.pdf()` (Letter, Foundation's `@page { margin: 0.5cm }`), identical: a 700 px filler, the element, then a 450 px trailing block. A 578 px `pre`, a 677 px `blockquote`, and a table with a 580 px row: 3 pages without the class (moved whole to page 2), 2 with it (split). A 1442 px `pre` with a 700 px trailing block: 4 pages without, 3 with (Foundation's rule still starts a listing longer than a page on a new page). A 560 px `img` with a 600 px trailing block: 3 pages either way (moved whole, never split). A 610 px `code.code-block`: 2 pages either way (Foundation does not keep it whole). Firefox and WebKit: Playwright offers no PDF output, so their pagination rests on M1's computed values.
- Not measured, and why: server HTML. The class is a host binding from one `computed` class list, the mechanism the Visibility re-run's P3 measured in Angular 22.2.0's `renderApplication` for its print classes, and M1 ran on static HTML with no script, which is what a pre-hydration print sees.

### Grilling record

Round 1 (nothing settled yet).

- Q1, does `.print-break-inside` get an attribute, and where. For an attribute: ADR 0039 leaves no class unmanaged, and the class has a measured effect (M1, M2). For `NfsPrintStyles` under clause 1: the export mixin is `foundation-print-styles`, and ADR 0044's dated note already splits it by shape and sends its stand-alone class to this spec. For putting it in `NfsTypographyHelpers`: one import fewer. Against: another export mixin, which a consumer can include without `foundation-print-styles`, and clause 1 is explicit. For a value of `nfsVisibility`: it is print-related. Against: it decides where a page breaks, not whether the element shows (the Visibility re-run's Q10). Settled: `NfsPrintStyles` (decision 1).
- Q2, which entry point. For `ngx-foundation-sites/print-styles`: one directive, one mixin. Against: one entry point per docs page, and the Print Styles section is on the Typography Base page, whose other classes this entry point already holds (D16). Settled: `ngx-foundation-sites/typography-helpers` (decision 1).
- Q3, the name. Clause 3 makes a class with no value a boolean named after the class: `nfsPrintBreakInside`. For `nfsBreakInside`: shorter. Against: it drops the medium, and CSS `break-inside` also applies to columns on screen, where the class does nothing. For `nfsPageBreakInside="auto"`: mirrors the declaration. Against: building-blocks 1.4 rule 4, a single class is a boolean. No HTML attribute has the name. Settled (decision 2).
- Q4, the type. A closed boolean through `nfsVariantBoolean`, default `false`; no responsive form, because Foundation prints the class only for print media and no `$breakpoint-classes` form exists; no Variant property and no Runtime check. Settled (decision 2).

Round 2 (Q1 to Q4 settled).

- Q5, where it works (M1, M2). It changes pagination on `pre`, `blockquote`, and `tr`; on `img` Foundation's rule computes `avoid` but no engine splits an image, so the class changes nothing there; on any other element it resets the initial value. For a selector restriction to `pre`, `blockquote`, and `tr` (as `NfsNoBullet` names its elements): a misplaced attribute fails to compile. Against: Foundation does not qualify the class, its comment says "e.g.", clause 1's element clause is for element-qualified classes, and a consumer's own print rule that keeps an element whole at one class is relaxed by it too. For a development check by tag: cheap. Against: the directive cannot read print styles on screen, so a tag list would report elements the consumer's CSS keeps whole, where the class works. Settled: documented, no restriction, no check (decision 3).
- Q6, the cascade. One class against Foundation's one-element rules in the same media block: it wins (M1). A consumer print rule with more than one class's specificity beats it; an `!important` library rule would override the consumer's own CSS. Settled: no Library mixin (decision 4).
- Q7, accessibility. Nothing changes on screen (M1), axe reports nothing (M1), and no WCAG 2.2 criterion covers printed output (the Visibility re-run's note). A `pre` is `overflow: auto` in Foundation's global styles, so a `pre` with long lines is a scroller and carries the Scroll region recipe with or without this attribute. Settled: an ARIA row and a note after the WCAG table (decision 5).
- Q8, rendering modes. Server HTML carries the class; a pre-hydration or JavaScript-off print breaks as after hydration; a `@defer` block without a hydrate trigger prints its placeholder. Settled (decision 5).

Round 3 (Q5 to Q8 settled).

- Q9, `.ir`: an attribute or an exclusion. Facts: no Foundation rule styles it, no docs page names it, links inside it print no address and a link carrying it prints its own (M1); it is HTML5 Boilerplate's image-replacement helper, whose screen rules Foundation never shipped, and HTML5 Boilerplate removed the class and the print exemption in 5.0.0. For an attribute (`nfsIr`, or a boolean named for its effect): ADR 0039 leaves no class unmanaged; the effect is real and could keep addresses off a printed list of ADR 0038's current-path in-page links (the Visibility re-run's decision 8). Against: `nfsIr` says nothing, and says "image replacement", which Foundation never did; a name for the effect is library API for an undocumented selector; the effect reaches only descendant links, so on a link it is a trap; the bundle already has the choices (`hideFor="print"` for navigation that means nothing on paper, `$print-hrefs: false` site-wide), and the printed address of current-path links is the Smooth Scroll spec's to fix where it arises. Reversibility: an attribute added later breaks no one; one removed later does. Settled: dropped, `deprecated-upstream`, as the bundle drops `.flex-video` and `invertVertical` (decision 6).
- Q10, a report of a copied `ir`, as the Responsive Embed reports `.flex-video` and the Visibility Classes `.show-for-ie`. For: consistency. Against: those classes sit in Foundation's documented markup on the very host that reports them; Foundation's docs never write `ir`, so no migrated markup carries it onto an `NfsPrintStyles` host. Settled: no report (decision 6).
- Q11, Foundation's other print rules (link addresses, borders, whole-page keeping, `@page`) and `$print-transparent-backgrounds` and `$print-hrefs`. Base element styles with no class, and Sass booleans stay compile-time. Settled: Out of Scope, `scope-boundary`, as the Visibility spec records them (decision 7).

Round 4 (Q9 to Q11 settled).

- Q12, the tests. Play functions run on screen, so a ninth story, `typography-helpers--print-breaks`, gives the e2e layer a layout whose listing crosses a page boundary; the play function asserts the classes, the arg toggle, and that the listing is no scroller; e2e asserts computed `break-inside` in three engines under print emulation and, in the Chromium project, a page count that drops by one with the attribute (relative, because the story's layout decides the counts). For folding the case into `--code-and-citations`: one story fewer. Against: its block is a `code nfsCodeBlock`, which Foundation does not keep whole, and a page-filling layout would disturb its reflow case. Settled (decision 8).
- Q13, a forgotten import (P24). A static `nfsPrintBreakInside` without `NfsPrintStyles` sets nothing, and the loss shows only on paper. Settled: the usage example names the import, and the e2e case covers the library's stories; the import-array question stays with the architecture guide's provisional P24 (decision 8).
- Q14, vocabulary. The glossary's **Typography Helpers** lists the family's classes; `.print-break-inside` joins it. No new term: a class of Foundation's is not domain language (D19). Settled (decision 9).
- Q15, an ADR. Clause 1 and ADR 0044's dated note already decide the directive; dropping `.ir` is reversible and follows the bundle's `deprecated-upstream` precedents. No ADR; a dated note on ADR 0039, whose rule is that every class is managed, records why this one is dropped instead (proposal 3). Settled.

The frontier is empty.

### Decisions

1. `NfsPrintStyles` (`[nfsPrintBreakInside]`) is `foundation-print-styles`' directive under the Utility directive rule's clause 1, for its one stand-alone class, in `ngx-foundation-sites/typography-helpers`; the family now has five directives and ten Utility attributes (spec D3, D20).
2. `nfsPrintBreakInside` is a closed boolean through `nfsVariantBoolean`, default `false`, setting `.print-break-inside`; no responsive form, Variant property, or Runtime check (spec D20).
3. No selector restriction and no development check; the spec names where the attribute works (`pre`, `blockquote`, `tr`, and a consumer's own kept-whole element at one class) and where it changes nothing (`img`, `code nfsCodeBlock`, and anything Foundation does not keep whole) (spec D21, Notes, Out of Scope).
4. No Library mixin for `foundation-print-styles`: the class already wins over the rules it relaxes; a missing include loses nothing the attribute would give and is not reported (Sass).
5. Accessibility and rendering: the host's own role, nothing on screen, no WCAG criterion for print, a scrolling `pre` still takes the Scroll region recipe; the class is in the server HTML (ARIA table, WCAG note, Rendering modes).
6. `.ir` is dropped with no attribute and no copy report, category `deprecated-upstream` (spec D22, Out of Scope); the choices for links whose printed address means nothing are `hideFor="print"`, `$print-hrefs: false`, and the Smooth Scroll spec for ADR 0038's links.
7. Foundation's print rules for elements and their two settings are Out of Scope (`scope-boundary`); the print-classes item names the Visibility Classes' `print` condition (the Visibility re-run's proposal 5, applied here, so the orchestrator need not apply it).
8. Tests: the `typography-helpers--print-breaks` story; e2e print emulation in three engines and the relative page count in Chromium; the fixture app's JavaScript-off run under print emulation; browser-level host-binding and copied-class cases (spec D18).
9. Glossary: **Typography Helpers** gains `.print-break-inside` (proposal 2).
10. The spec's header, Problem Statement, Solution, 47 user stories (five new), Foundation contract, class mapping, the Utility directive rule applied, hierarchy, API, Material comparison, implementation level, ARIA and WCAG, Rendered HTML, Rendering modes, Testing Decisions, Out of Scope (three items added, one reworded), design decisions (D3, D4, D16 to D19 amended; D20 to D22 added), usage examples, Foundation behaviour changed, Sass, and Notes are revised.

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| `NfsPrintStyles` and `nfsPrintBreakInside`, its entry point and type (decisions 1, 2) | HIGH (a public directive and attribute name) | HIGH (clauses 1 and 3 give the names mechanically; ADR 0044's dated note routes the class here; measured in four engines and two PDF outputs; no ADR or research contradicts it) | Decided |
| No restriction, no check, no mixin (decisions 3, 4) | LOW (each is additive later) | HIGH (M1, M2; Foundation's unqualified selector and comment) | Decided |
| `.ir` dropped (decision 6) | LOW (an attribute can be added later without breaking anyone; nothing inherits the absence) | HIGH (Foundation's source and docs; HTML5 Boilerplate's changelog and CSS at 4.3.0 and 5.0.0; M1; the bundle's `deprecated-upstream` precedents) | Decided |
| Accessibility, rendering, and Out of Scope notes (decisions 5, 7) | MEDIUM (docs, no API) | HIGH (M1; the Visibility re-run's P3) | Decided |
| Tests and glossary (decisions 8, 9) | LOW | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: every question that needed a measurement was measured here, and Firefox's and WebKit's pagination, which Playwright cannot read, follows from their computed values. Dissent recorded: `nfsIr` or an effect-named boolean for `.ir`, against decision 6; a `pre`, `blockquote`, `tr` selector restriction or a tag check, against decision 3; `nfsPrintBreakInside` in `NfsTypographyHelpers`, against decision 1.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Typography Helpers row:
   - replace "Four directives, one per Foundation export mixin, set every class through nine Utility attributes" with "Five directives, one per Foundation export mixin, set every class through ten Utility attributes";
   - replace "and `NfsTypographyBase` (`nfsHeadingSize`, 1 to 6, for the Typescale's `.h1` to `.h6`)" with "`NfsTypographyBase` (`nfsHeadingSize`, 1 to 6, for the Typescale's `.h1` to `.h6`), and `NfsPrintStyles` (`nfsPrintBreakInside`, for the print styles' `.print-break-inside`; the undocumented `.ir` is dropped)";
   - replace "(Foundation's CSS on headings, paragraphs, lists, `code`, and `hgroup`)" with "(Foundation's CSS on headings, paragraphs, lists, `code`, and `hgroup`, and CSS fragmentation in print)".

2. `CONTEXT.md`, the **Typography Helpers** entry: replace "and the citation and code looks `.cite-block`, `.code-inline`, and `.code-block`." with "the citation and code looks `.cite-block`, `.code-inline`, and `.code-block`, and the print helper `.print-break-inside`, which lets an element the print styles keep on one page break across pages."

3. `adr/0039-directives-manage-every-foundation-class.md`, a dated note at the end of Consequences:

   "- 2026-09-28 ([Re-run: Typography Helpers spec for the print helper classes](../issues/144-rerun-typography-helpers-print-classes.md)): `foundation-print-styles` also prints `.print-break-inside`, which gets `nfsPrintBreakInside` on `NfsPrintStyles` in the Typography Helpers' entry point, and reads `.ir` in one print rule (`.ir a:after`). `.ir` gets no directive: no Foundation rule styles it and no docs page names it, and it is HTML5 Boilerplate's image-replacement helper, which HTML5 Boilerplate removed with that rule in 5.0.0 (2015). A class that Foundation's CSS only reads, copied from an upstream that has dropped it, is recorded as dropped (`deprecated-upstream`) rather than managed; no consumer writes it."

4. `specs/visibility-classes.md`:
   - Out of Scope, the `.print-break-inside` and `.ir` item: replace "(it lets a `pre`, `blockquote`, `tr`, or `img` break across pages)" with "(it lets a `pre`, `blockquote`, or `tr` break across pages; no engine breaks an image)", and replace "proposed for the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md), the owner of `foundation-typography`'s other classes. Category: `scope-boundary`." with "`.print-break-inside` is the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsPrintBreakInside`, and `.ir` is dropped there (`deprecated-upstream`) ([Re-run: Typography Helpers spec for the print helper classes](../issues/144-rerun-typography-helpers-print-classes.md)). Category: `scope-boundary`."
   - D20, rejected alternatives: after "One directive for `foundation-print-styles` under ADR 0044's clause 1 (`NfsPrintStyles` with `nfsShowForPrint` and `nfsHideForPrint`, in the Typography Helpers entry point)" insert " (the directive of that name exists and holds only `nfsPrintBreakInside`)".

5. `map.md`, Out of scope, the base-styles line: replace "and `.show-for-print` and `.hide-for-print` are Visibility classes." with "`.show-for-print` and `.hide-for-print` are Visibility classes, and the print styles' `.print-break-inside` is the Typography Helpers' `nfsPrintBreakInside` (their undocumented `.ir` is dropped there)."

6. `map.md`, Decisions so far: the gist below, after the [Re-run: Visibility Classes spec for the print classes](issues/143-rerun-visibility-classes-print.md) line.

### What other specs need from this one

- [Spec: Visibility Classes](104-spec-visibility-classes.md): proposal 4 (its Out of Scope item and a D20 parenthesis); nothing in its API changes.
- [Spec: Smooth Scroll](29-spec-smooth-scroll.md): `.ir` is not offered as a way to keep addresses off printed current-path in-page links; the choices the Visibility re-run passed on stand (`hideFor="print"` on such a navigation, `$print-hrefs: false`), or a rule of its own.
- [Spec: Table](92-spec-table.md): in print, Foundation keeps every `tr` on one page, so a row taller than the rest of a page moves whole to the next (measured); `tr nfsPrintBreakInside` lets it break. The Table spec may note it; nothing in its API changes.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): no spec writes `print-break-inside` or `ir` in consumer markup (a search of the effort found `print-break-inside` only in the Typography Helpers and Visibility specs, their tickets, ADR 0044, and the map, and no `class="... ir ..."` anywhere).
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): three Out of Scope items added (`.ir`, `deprecated-upstream`; Foundation's print rules for elements, `scope-boundary`; a check or narrower selector for `nfsPrintBreakInside`, `other`), the print-classes item reworded (still `scope-boundary`), and the rejected rows of D18 to D22, each with its category.
- [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md): D21 declines a development check for `nfsPrintBreakInside` on an element where it does nothing (P23), because the directive cannot see print styles on screen and a tag list would report correct uses; the Notes name the forgotten-import risk (P24).
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): nothing; the new attribute is a closed boolean, not in the Variant manifest.

### Gist for Decisions so far

- [Re-run: Typography Helpers spec for the print helper classes](issues/144-rerun-typography-helpers-print-classes.md) -- Foundation's `.print-break-inside` (from `foundation-print-styles`, named only in a Sass comment) gets `NfsPrintStyles` with the closed boolean `nfsPrintBreakInside` in `ngx-foundation-sites/typography-helpers` (clause 1; five directives, ten attributes); measured in four engines under print emulation and in Chromium's and Edge's PDF output: it lets a `pre`, `blockquote`, or `tr` that Foundation keeps on one page break (3 pages become 2), changes nothing on an `img` or a `code nfsCodeBlock`, and changes nothing on screen, so no selector restriction, check, or Library mixin; `.ir`, which Foundation's print rule reads but never styles or documents, is HTML5 Boilerplate's image-replacement helper removed upstream in 2015 and is dropped (`deprecated-upstream`), leaving `hideFor="print"` and `$print-hrefs: false` for links whose printed address means nothing; a ninth story and e2e print cases; impact HIGH, confidence HIGH; no ADR. Spec: [specs/typography-helpers.md](specs/typography-helpers.md).
