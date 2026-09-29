# Consistency review, group c

Ticket: [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), phase 2, group c, 2026-09-29, AFK under the map's override. Model: Opus 5.5. Input: the decisions of phase 1 ([consistency-review-decisions.md](consistency-review-decisions.md)), its per-spec index and checks CR-A to CR-D, the Answers of the five family re-runs ([Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) to [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md)), the phase-2 brief's rule on registration checks, and the proposals that the group e and group f reports ([consistency-review-group-e.md](consistency-review-group-e.md), [consistency-review-group-f.md](consistency-review-group-f.md)) make for this group's files.

Specs: [float-classes](../specs/float-classes.md), [float-grid](../specs/float-grid.md), [forgotten-import-checks](../specs/forgotten-import-checks.md), [forms](../specs/forms.md), [interchange](../specs/interchange.md), [label](../specs/label.md), [magellan](../specs/magellan.md), [media-object](../specs/media-object.md), [menu](../specs/menu.md). Each governing ticket, the one the map's Decisions so far cites last for the spec (the same choice the family re-runs made), carries a dated `### Amendment, 2026-09-29 (consistency review)`: [Spec: Float Classes](../issues/105-spec-float-classes.md), [Spec: Float Grid](../issues/100-spec-float-grid.md), [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), [Spec: Forms](../issues/98-spec-forms.md), [Re-run: Interchange spec under the class rule](../issues/127-rerun-interchange-class-rule.md), [Spec: Label](../issues/94-spec-label.md), [Re-run: Magellan spec under the class rule](../issues/122-rerun-magellan-class-rule.md), [Spec: Media Object](../issues/91-spec-media-object.md), [Spec: Menu](../issues/85-spec-menu.md).

Every spec was read in full and checked against CR-A to CR-D, building-blocks, ADRs 0039, 0040, 0044, 0045, and 0046, and the glossary. After the edits, the CR-A search of the brief finds, in added lines, only rendered output, labelled test cases, and prose; every file is ASCII with LF endings; every Markdown link resolves and every ticket link carries its ticket's exact title (a link checker with a positive control).

Nothing is OPEN FOR HUMAN. Every change is impact LOW (wording, examples, mapping rows, development-message rules, test placement) with confidence HIGH (the decided items, the shared spec's rules, and the owning specs' published names and selectors).

## Per spec

### Float Classes (4 fixes)

Decided items applied:

- R16: the Out of Scope `hidden` bullet takes the shared sentence (`.float-center` sets `display: block`; `@if`, a Toggler in Visibility mode, or `nfsVisibility` with a bare `hideFor`).
- R32/R64: the Float Center image's server line drops `src`.
- R36: the percentage box is `nfsWidth="50"` in the Rendered HTML (rendered `class="float-center width-50"`) and in `float-classes--float-center` (`NfsPrototypeSizing` in `moduleMetadata.imports`).
- CR-B: a table of the other families' classes (Callout, Button, XY Grid, the Forms' `.middle`, Prototyping Utilities).

Other fixes:

- The shared `hidden` sentence leaves this spec out of its own list of specs, as group f's proposal 3 asks, and adds the fact the class table gives: `.float-left`, `.float-right`, and `.clearfix` set no `display` on their host, so `hidden` hides them.
- The stories' scaffolding sentence lists `NfsPrototypeSizing` and `NfsPrototypeSpacing`, because `float-classes--float-center` now writes `nfsWidth` and `float-classes--composition` already wrote `nfsMarginLeft`.

Confirmed: R39, CR-A, CR-C, CR-D.

### Float Grid (4 fixes)

Decided items applied:

- R34/R35: the Reveal's `.reveal .column { min-width: 0 }` is named beside the scoped rules, and it changes nothing.
- R59: the handle names its argument, `nfsVariantCheck('nfsRow')` and `nfsVariantCheck('nfsColumn')`.

Other fixes:

- CR-B: a table of the other families' classes in the examples and on Foundation's Grid page (Callout, Thumbnail, the Visibility Classes' demo spans, Typography Helpers' `.no-bullet` and `.lead`). Docs-site classes with no Foundation Sass (`.display`, `.display-end`) stay under D16.
- CR-C: D1's rationale called the names "the placeholders the Spec: Equalizer wrote"; it now reads "the names the Spec: Equalizer already wrote".

Confirmed: R16 (the Notes line stays: `hidden` hides a row and a column), R59's `include()` calls and the one-file-per-case tests, check 2 as [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md) left it (a host that is also a row is exempt), the In-family line, CR-A, CR-D.

### forgotten-import checks (5 fixes)

Items routed by the re-runs, and other groups' proposals, applied:

- The registration bullet gains the two cases that keep their messages: a check that looks for no element because its peer is linked only by a required reference whose forgotten import fails to compile (the Responsive Toggle's check 3; group e's proposal 3), and a check that is the report for a truly bare part (the brief's rule). [Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md)'s unadopted sentence stays out.
- A new bullet for a check that finds a peer of another family by its class: it reads the peer's attribute too where one directive owns the class, and otherwise keeps the class read and names the forgotten-import case (group f's proposal 1; [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md)'s routed item; the Top Bar's check 3, the Visibility Classes' check 3, and the Flexbox Utilities' check 2 already state it).
- `strictParents`: a paragraph after the table on class-only parts (the Slider fill, the Orbit's five), which report M4 and throw under the flag when projected from another template, with the template-outlet pattern as the fix ([Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md)'s routed item).
- M7: the quoted template ends after the token's parenthesis and the multi-provider rule follows as plain text (group f's proposal 4), and it admits "<Directive> or <Directive> from '<entry point>'", the form `nfsOpenableToken`'s published description uses for the Toggler's two directives ([Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md)'s routed check of the multi-provider wording).

Other fixes:

- CR-D: the template-outlet pattern's consumer comment named three imports for a template that writes only `nfsMenuItem`; it names `NfsMenuItem` alone.

Confirmed: CR-D (the `app-faq` example's labelled omission of `NfsAccordionTitle` stays), CR-A.

### Forms (5 fixes)

Decided items applied:

- R4: the WCAG opening sentence (S2), D11, the Sass checks (S1), and the required-settings sentence. Every figure stands.
- CR-B: rows for the other families' classes of the examples and Foundation's page (Button, Typography Helpers, Float Classes, XY Grid, the Flexbox Utilities' `.align-center` on the Label Positioning grid, the Visibility Classes' `.show-for-sr`, Slider).
- CR-D: `app-donate` drops `NfsFormLabel` from `imports` and from its import statement.
- R48: the amendment in [Spec: Forms](../issues/98-spec-forms.md) records that the NG0309 reason in that ticket's grilling question 5, decision 4, and the triage row "Validation State classes stay with Abide; sets side by side (4)" is superseded by building-blocks 1.9. The decisions file names "decision 3" there; in the ticket the reason sits in question 5 and decision 4, which the amendment cites. The spec's sentences were already corrected by [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md), so R48's spec edits are confirmed, not repeated.

Other fixes:

- CR-C: three places deferred to the Button re-run for whether `nfsButton` takes `label` hosts (the paragraph on other sections' classes, the Out of Scope bullet, D12). The published Button spec decides it (D11: `input[type=submit|button|reset]` hosts, no `label` host), and the three places now state it.

Confirmed: R9/R23, R17, R33, R73, the In-family lines, CR-A.

### Interchange (5 fixes)

Decided items applied:

- R13, CR-D: `app-product-table` gets `imports: [NfsTable]`, `<table nfsTable hover>`, a caption, and the sentence after it.
- R52: "consumer rule 1" becomes "consuming-directive rule 1".
- R57: "Application class `hero`".
- R62: the 1.4.3 row's overlay clause (composited over `#fff` and `#000`).

Other fixes:

- CR-B: two mapping rows, the Callout's `.callout` and the Table's `.hover`. "The developer's own stylesheet" and "the developer's own" Named queries stay: they name no class (R57's rule).

Confirmed: R32/R64 (the `<picture>` exception), CR-A, CR-C, the In-family line.

### Label (4 fixes)

Decided items applied:

- R59: `nfsVariantCheck('nfsLabel')`.
- R74: check 1 and D5 count an image's `alt` (or a `role="img"` element's `aria-label`) outside `aria-hidden` subtrees as text; the browser-level list gains a silent image-only case.

Other fixes:

- R4 (a confirm item turned into a small edit): Sass rule (c) named the exact helper but not Foundation's two functions as not used; it now does, which is S1's wording.
- CR-B and an orphan sentence: the Rendered HTML lead-in introduced `nfsShowForSr` although no example used it. The Rendered HTML gains the icon-only label with `nfsShowForSr` text (the recipe check 1's message asks for), `label--icons` names `NfsShowForSr` in its imports, and the mapping gains a table of the other families' classes (Visibility Classes, Button) and a sentence that icon-font classes are the consumer's own.

Confirmed: R1, R5, R6, R28/R29, R30, CR-A, CR-C, CR-D. Every figure near a threshold was recomputed with the coordinator's `ratio.mjs` in both modes and stands: 4.498, 4.364, 4.647, 4.504, 5.255, 4.569, 4.440 and 4.421, 4.424 and 4.437, 4.654 and 4.218, 4.951.

### Magellan (2 fixes)

Decided items applied:

- R48 item 1: `gridMarginX` in the guide example, its sentence, the mapping row, and the names sentence.

Other fixes:

- CR-B: Foundation's Magellan page writes `.top-bar-left` and `.menu-text` in its example, and the stories use `button[nfsButton]`; the mapping adds `NfsTopBarLeft` to the Top Bar row, a `.menu-text` row (`NfsMenuText`), and a `.button` row. `.sections`, a docs class with no Foundation Sass, stays as its Foundation-behaviour bullet says.

Confirmed: R40, R48 items 2 to 4, CR-A, CR-C, CR-D.

### Media Object (5 fixes)

Decided items applied:

- R10: the names sentence.
- R32/R64: `ngSrc` on every `img[nfsThumbnail]`, rendered lines without `src`, the lead-in, and the post list's comment.
- R57: "Application class" twice.
- R59: the missing-property case in a test file of its own.
- CR-B: a `.thumbnail` row.

Other fixes:

- The sentence after the Rendered HTML ("An `NgOptimizedImage` image (`ngSrc`) renders the same way") no longer fitted once every image uses it; it takes the Card's R32 form: "The images use `NgOptimizedImage` (building-blocks 1.2); no media-object directive sits on an image."
- Stories: the scaffolding imports `NgOptimizedImage` and every story image uses it (R32's rule 1 covers story templates).

Confirmed: R37, check 3 and the In-family line as [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](../issues/154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md) left them, CR-A, CR-C, CR-D.

### Menu (3 fixes)

Decided items applied:

- R4: S1 in the Sass checks (4.65:1, 4.484:1, and the labelled 4.59:1 stand).
- R57: "Application class" twice.
- R59: the handle and the conditional `include()` in the Runtime checks paragraph, and the missing-property case in a test file of its own.

Confirmed: R3, R10, R48, R69/R70, the In-family lines of [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) (kept as written), CR-A, CR-B (Foundation's Menu page uses no other family's class in its examples; its callouts are docs notices), CR-C, CR-D.

## The registration rule

No spec of this group has a registration check that [Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md) kept as the report for a forgotten import: the Orbit, Triggers, Off-canvas, and Tabs are in other groups. The group's own checks were read for the same question: the Forms checks read the DOM and native properties ([Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md)), the Media Object's check 3 and the Float Grid's check 2 already follow the placement bullet, `NfsMenuText`'s old check 3 is now its parent check, and the Float Classes, Label, Magellan, and Interchange checks look for no library peer. Nothing needed aligning.

## Proposed changes to shared documents and other groups' specs

1. `specs/nested-menu.md` (its group): the same change as group f's proposal 2, now that M7 reads "(provided by <Directive> from '<entry point>', ... or <Directive> from '<entry point>' ...)": in `nfsMenuModeToken`'s description replace

   > "nfsMenuModeToken (provided by a menu root: NfsAccordionMenu

   with

   > "nfsMenuModeToken (provided by NfsAccordionMenu

   At the time of writing, that group's working-tree copy already reads so; nothing further is needed if it lands.

2. `specs/accordion.md` (its group), Hierarchy and DI shape, the bullet that begins "- Forgotten imports (": replace "- Forgotten imports (" with "- In-family checks (", the shared spec's term, which the other family specs use ([Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md)'s routed note on the label). At the time of writing, that group's working-tree copy already reads so.

3. The closing pass: group e's proposal 3 and group f's proposals 1 and 4 are already applied to `specs/forgotten-import-checks.md` above, and group f's proposal 3 to `specs/float-classes.md`; they need no second application.

4. [consistency-review-decisions.md](consistency-review-decisions.md), R48, "Amendments (phase 2)": the Forms record is "grilling question 5, decision 4, and the triage row", not "decision 3", in [Spec: Forms](../issues/98-spec-forms.md) (the amendment there cites the right places). A correction for the record only; nothing else depends on it.

5. Ticket bodies outside this review's edit scope (only a dated amendment may be added there): three links written without `../adr/` do not resolve, `[ADR 0040](0040-variant-input-types.md)` in [Spec: Forms](../issues/98-spec-forms.md) (line 122) and `[ADR 0039](0039-directives-manage-every-foundation-class.md)` twice in [Spec: Menu](../issues/85-spec-menu.md) (lines 125 and 143); each becomes `../adr/<file>`. The "Gist for Decisions so far" lines of the tickets use `issues/...` and `specs/...` on purpose (they are written for the map) and are not errors.

No change is proposed to `building-blocks.md`, `CONTEXT.md`, `README.md`, the map, the ADRs, `storybook-conventions.md`, or the architecture guide beyond what the decisions file already routes to the closing pass (the Label's check 1 cites building-blocks 1.10's Names bullet, which R74's closing-pass change extends).

## Process notes

- Measurements: none new; Label and Menu figures were recomputed read-only with `D:/tmp/nfs-133/contrast/ratio.mjs`. The only experiment folder, a link-checker positive control under `D:/tmp/nfs-133-c/`, was removed. Helper scripts are in the session scratchpad.
- Against the brief's shell rules, three read-only commands early in the session started with `cd <path>;`, and one ran `git -C /dev/null status` with its output discarded; none wrote a file, and every later command used absolute paths.
