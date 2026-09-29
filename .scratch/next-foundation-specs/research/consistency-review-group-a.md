# Consistency review, group a: report

Ticket: [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), phase 2, group a, 2026-09-29, AFK under the map's override. Model: Opus 5.5. Input: the decisions of phase 1 ([consistency-review-decisions.md](consistency-review-decisions.md)), its per-spec index and checks CR-A to CR-D, the Answers of the five family re-runs ([Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) to [Re-run: layout system and flex utility family specs, In-family check lines](../issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md)), and the brief's rule for development checks that find a peer by registration (the second of the two bullets after the family rule's item 5 in [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)).

Specs revised in place, each read in full: [abide](../specs/abide.md), [accordion-menu](../specs/accordion-menu.md), [accordion](../specs/accordion.md), [anchored-pane](../specs/anchored-pane.md), [badge](../specs/badge.md), [breadcrumbs](../specs/breadcrumbs.md), [breakpoint-service](../specs/breakpoint-service.md), [button-group](../specs/button-group.md), [button](../specs/button.md).

Each spec's governing ticket (the one the map's Decisions so far cites last for it) carries a dated `### Amendment, 2026-09-29 (consistency review)`: [Re-run: Abide spec under the class rule](../issues/123-rerun-abide-class-rule.md), [Re-run: Accordion Menu spec under the class rule](../issues/112-rerun-accordion-menu-class-rule.md), [Re-run: Accordion spec under the class rule](../issues/107-rerun-accordion-class-rule.md), [Re-run: Anchored pane (shared utility) spec under the class rule](../issues/131-rerun-anchored-pane-class-rule.md), [Spec: Badge](../issues/93-spec-badge.md), [Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md), [Re-run: Breakpoint service (shared utility) spec under the class rule](../issues/129-rerun-breakpoint-service-class-rule.md), [Spec: Button Group](../issues/82-spec-button-group.md), [Re-run: Button spec under the class rule](../issues/128-rerun-button-class-rule.md). The heading follows the brief's form, as the other groups' amendments do. The Abide amendment went to [Re-run: Abide spec under the class rule](../issues/123-rerun-abide-class-rule.md), not to [Spec: Abide](../issues/31-spec-abide.md) as R48's text says, because the brief's rule names the ticket the map cites last.

## Summary

| Spec | Decided items applied | Other fixes | Open |
| --- | --- | --- | --- |
| abide | R4, R8, R30, R48 | 2 | None |
| accordion-menu | R3, R56 | 1 | None |
| accordion | R4, R57 | 2 | None |
| anchored-pane | R42, R57 | 2 | None |
| badge | R28/R29, R59, R74 | 3 | One finding for the closing pass (`exportAs`), not applied |
| breadcrumbs | R24, R57 | 1 | None |
| breakpoint-service | R2, R52, R54, R59 | 0 | None |
| button-group | R4, R6, R17, R57, R59, CR-B | 1 | None |
| button | R4, R5, R6, R17, R29, R57, R59, CR-B | 1 | None |

Nothing is OPEN FOR HUMAN. Every edit is impact LOW (wording, figures, example markup, development checks and their tests, class-mapping rows; no API before the first release changes except R17's decided `exportAs` removal, rated there), confidence HIGH (the decisions file's ratings, the shared spec's text, or the spec's own records). No decided API or default was changed by this review beyond what the decisions file decided. CR-A was rerun on every spec after the edits (`rg -n 'class="|\[class|ngClass|routerLinkActive=|animate\.(enter|leave)='`): every hit is rendered output, a labelled copied-class case, Foundation's labelled markup, library code, prose, or an Application class. CR-C was searched with the decisions file's pattern on every spec (hits: abide R8, accordion-menu R56; the Anchored pane's "to be replaced ... where they fit" deferral, which the pattern misses, was found by reading). CR-D: every `@Component` example imports exactly the library directives its template writes (application components such as `app-order-history` are not library directives). A scan of the added lines found no non-ASCII character and no banned word. Figures were rechecked with the coordinator's `D:/tmp/nfs-133/contrast/ratio.mjs` and `batch.mjs` in both modes.

## Per spec

### abide

Decided items applied:

- R4: the stale clauses by the rule: the 1.4.3 row, D21 ("computed with the exact WCAG formula"), the Sass checks (S1's sentence replaces the `color-luminance()` clause), and the settings paragraph ("re-measured with Foundation 6.9.0's `color-luminance()` by the re-run" reads "recomputed with the exact WCAG relative-luminance formula by the" review, which is what happened). Figures: 2.31:1 to 2.12:1 (the compile test and D21), 1.53:1 to 1.54:1 (the compile test, D21, the required-settings table), the unlabelled 4.49:1 to 4.498:1 (the Problem Statement and the `$form-label-color-invalid` row); the axe figure of the `$input-error-color` row stays. 5.25, 3.74, 1.31, 3.93, 4.55, 4.70, 3.42, 19.63, 5.73 stand.
- R8: the Callout sentence after the Rendered HTML and the usage example's import comment.
- R30: the Form alert's 16.2:1 reads 16.159:1 on Foundation's defaults and 15.809:1 in the stories.
- R48: X10 ([Audit: the specs against the architecture guide](../issues/142-audit-specs-against-architecture-guide.md)) had already removed the NG0309 reason from the Neighbouring directives bullet, D18, and D19, so the decision's intent was applied to the current sentences: the bullet gains R48's note (one instance, not an error, building-blocks 1.9), and D18's and D19's rejected cells take R48's fuller remaining reasons ("the callout look forced on every Form alert"; "and Abide would import Forms"). The amendment states that the NG0309 reason in [Spec: Forms](../issues/98-spec-forms.md) (decision 3) and [Re-run: Abide spec under the class rule](../issues/123-rerun-abide-class-rule.md) (decision 7) is superseded, and that the records are not rewritten.
- Confirmed: R1, R33.

Other fixes:

1. CR-B: the class mapping lacked rows for two other families the usage examples write: the Visibility Classes' `.show-for-sr` on a visually hidden Form alert, and the XY Grid's classes around the validated input group. Both rows added.
2. The registration rule (the brief's last section). [Re-run: form and value-control family specs, In-family check lines](../issues/153-rerun-form-and-value-control-family-in-family-lines.md) (decision 3) kept `NfsAbideLabel`'s "no field resolves" warning beside the label's probe of a forgotten `NfsAbideInput`, the same split the brief names for [Re-run: disclosure and carousel family specs, In-family check lines](../issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md); the shared spec's bullet for checks that find a peer by registration now governs. Aligned: the label's warning says nothing while the label holds an element carrying `nfsAbideInput` without its directive (the label's probe reports it, M2); `NfsFormError`'s warning says nothing for a bare Form error inside a label that carries `nfsAbideLabel` without its directive (the kept-optional lookup has no parent check, so `strictDirectiveImports` reports it, M1, as the Drilldown's check 1 does for its wrapper), and keeps its message for a truly bare Form error outside any label (the kept-optional case of the family rule's item 2); the field's no-visible-Form-error warning, which finds its Form errors by registration, says nothing while its wrapping label holds an element carrying `nfsFormError` without its directive (the label's probe reports it). The In-family lines, the two API paragraphs, and the browser-level Linking case state it.

### accordion-menu

Decided items applied: R3 (D24 names the Responsive Menu's D22), R56 (the Off-canvas paragraph names the published `position` input, the Off-canvas spec's D6). R57 has nothing to change: the spec writes no "application class" and no "developer's own class".

Other fixes:

1. CR-B: rows for the Off-canvas panel's `.off-canvas` and `.position-left` (the usage example and `accordion-menu--off-canvas`) and the Button's `.button` on the controls outside the menu.

Confirmed: the In-family line [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) quoted is present word for word; R4 (the WCAG subsection and the Sass checks already name the exact formula, the helper, and both Foundation functions), R65, R66, CR-A, CR-D.

### accordion

Decided items applied:

- R4: the 1.4.3 row's clause, D19's clause, the Sass checks (S1's sentence), and `color-luminance()` out of the reused-functions list; figures 4.69:1 on white to 4.65:1 on `$accordion-background` (`$white` `#fefefe`), 6.0:1 to 6.01:1 on `$white`, the glyph's 4.69:1 to 4.65:1, the border's 1.25:1 to 1.24:1 (1.237). 3.76:1 (3.755) and 4.86:1 (4.858) stand.
- R57: "application class" to "Application class" (the `deepLinkSmudgeOffset` row and D27).
- Confirmed: X1 (D19's `@warn` stands).

Other fixes:

1. The one-sentence "Forgotten imports" bullet becomes "In-family checks" with one nested line per part, the family rule's form (the shared spec: "one line per part"), which [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) left to this review ("the review may align the label and the form across the re-runs"). Content unchanged; the Tokens bullet now quotes both tokens' development-only descriptions in M7's form, which the old sentence named without stating. The shared spec's own worked example (the Accordion item's call) matches the new line.
2. CR-B: a row for the Button's `.button` (and `size`) on the method-calling controls (D26).

### anchored-pane

Decided items applied: R42 (`anchored-pane--fixture`'s `relative` and `scroll` containing blocks take `nfsPosition="relative"`), R57 ("application class" capitalised throughout; "a developer's own application class" and "a developer's application class" read "an Application class"; "a developer's own anchored element" stays, as R57 allows). Confirmed: R51, R52, R65.

Other fixes:

1. CR-C: the Testing Decisions lead deferred the scaffolding to "the directives of the [Spec: Prototyping Utilities] where they fit", a spec since published. It now says a positioned containing block takes `nfsPosition="relative"` (`NfsPrototypePosition`, imported by those stories) and scaffolding Foundation has no class for stays inline (Storybook conventions, section 8); D24 says the same with a dated note. This is R42's rule stated where the spec states its scaffolding rule.
2. CR-B: rows for the Button's `.button` on the Triggers and the Prototyping Utilities' `.position-relative` on the stories' containing blocks.

### badge

Decided items applied:

- R28/R29: development check 3 (the link host) with R28's message and the Label's "whatever `color` is" sentence, because the Label's check 3 carries it and the same reason holds (a bound `color` can become `undefined`); D12's decision cell as decided, its rationale with the measured reason, and its rejected cell updated (a warning on a `button` or another focusable host stays rejected; "documented only" becomes the rejected alternative for links); the Out of Scope bullet; the browser-level case; the Solution's list of warnings and the 1.4.3 row say so, as the Label's 1.4.3 row does. The Custom Colors paragraph in the Sass subsection as decided.
- R59: `nfsVariantCheck('nfsBadge')` in the Injection bullet.
- R74: check 1's text source, D5's decision cell, and one silent case with an image-only badge.
- Confirmed: R1, R5, R6, R30; R4's figures stand in both modes.

Other fixes:

1. R4 (confirm item): Sass rule (c) named the exact helper but not both Foundation functions as not used, so it was not S1's equivalent; the clause is added.
2. CR-B: a table of the other families' classes the markup writes (`.show-for-sr`, `.button`).
3. The `exportAs` bullet cited "as `nfsButton`, `nfsCallout`, and `nfsCloseButton` do", and D1 "parity with `nfsButton` and `nfsCallout`"; R17 removes the `exportAs` of `nfsButton` (here) and `nfsCloseButton` (group b, whose working copy already carries it), so both now cite `nfsCallout` and `nfsLabel`. The API is unchanged; see the finding below.

Finding for the closing pass (not applied, because it would change a decided API): R17's premise that `NfsButton` and `NfsCloseButton` were "the outliers" among directives whose members are only inputs is not quite so. `NfsBadge` (D1), `NfsLabel` (D1, group c), and `NfsCallout` (D4, group b) also carry `exportAs` with no state or method to read (their only members are the consumer's `color` or `color` and `size` inputs), and each justifies it by parity with `nfsButton` and `nfsCloseButton`, a reason R17 has now removed. `NfsProgress` keeps a real reason (its read-only `percentage` computed, which the Visible value recipe prints through a template reference). Building-blocks 1.3 says "a directive with no state or method to read has none". Rating: impact LOW (a template-reference name removed before the first release costs no deprecation under ADR 0045, and restoring it is additive), confidence HIGH (building-blocks 1.3, architecture guide P13, and R17's own reasoning). Under the triage rule that is decided, not OPEN FOR HUMAN; recommendation: extend R17 to the three directives (quoted text below, proposal P1). If the closing pass keeps them instead, the parity sentences need the corrected lists (proposal P1, option B).

### breadcrumbs

Decided items applied: R24 (the Router example and its output in `<nav aria-label="Breadcrumb">`), R57 (the SSR smoke's "Application class"). Confirmed: R4's figures, R73, R74 (the landmark check reads attributes only).

Other fixes:

1. R4 (confirm item): the Sass checks named the exact helper but not both Foundation functions as not used; the clause is added, completing S1's wording.

The In-family lines of [Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md) are kept as they are; the item's check 2 reads attributes, so the registration rule does not reach it ([Re-run: navigation family specs, In-family check lines](../issues/151-rerun-navigation-family-in-family-lines.md), Q8).

### breakpoint-service

Decided items applied:

- R2: `animate` (`NfsMotionPair`) in the ResponsiveToggle and Dropdown pane rows.
- R52: the heading, the table lead and header, the WCAG table's two headers, every "consumer rule N" (rows 262, 272, 321, 325 of the decisions file's count, plus the 2.4.3 row's "consumer rule 1 above"), rule 1's recorder, the 1.4.10, 1.4.4, 2.4.3, and 1.3.4 rows ("the requirement on consumers", "no consumer makes", "the consumer's stories", "the consumer's mode", "any consumer's swap callback"), and D23's two cells. By the decision's rule for sentences that hold for any code injecting the service: the `changed.zf.mediaquery` row, `resolve`'s second argument, "Consumers memoise", the Material comparison's RxJS cell, the 2.2.2 row's "so a consumer can stop", the Testing lead, and the Out of Scope `toObservable` bullet say "a directive or application". "Consumer" stays for the application: its Sass, token provider, Variant declaration file, unit tests, report callback, the client-hint recipe, "a consumer's own `@if` branches", "a consumer's own animation", and the 1.3.4 row's "consumer branch".
- R54: rule 3's exception and the ResponsiveToggle row.
- R59: the last consumer table row.

Other fixes: none. The service has no directive, so no In-family line applies.

### button-group

Decided items applied: R4 (line 174 as decided), R6 (Sass item (2)), R17 (D12's rejected cell), R57, R59 (the Variant check bullet and the test-file placement), CR-B (a table of the other families' classes: the Flexbox Utilities' alignment classes, a grouped button's own Button classes, `.show-for-sr`, and the Dropdown pane placed after the group; the former one-sentence note is its first row). Confirmed: R1, R17's size check, R18, R19, R65.

Other fixes:

1. R4's figures recur outside line 174: the Problem Statement's "1.15:1 on an alert fill" and the 1.4.11 row's "1.00:1 and 1.15:1" take the recomputed 1.13:1 (`#1779ba` on `#bf3f2c`, 1.131 in both modes, the group being measured under the Button's required palette).

The group is a single directive whose content query reads another family's `NfsButton`; by the family rule (a part probes only its own family's directives) it adds no In-family line.

### button

Decided items applied: R4 (S2 as the WCAG subsection's opening, keeping the rounding sentence after it; S1 in Sass item (2); the figures as decided), R5 and R29 (the two sentences, see the fix below), R6 (the 1.4.3 row's sentence and new D23, after D22), R17 (the API line, the bullet, the Material row), R57, R59 (the Variant check bullet and the test-file placement), CR-B (rows for `.show-for-sr` and for the Button Group and Dropdown pane beside a button). Confirmed: R14, R60, R65, R66.

Other fixes:

1. R5 and R29 say to add their sentences "in the Sass subsection, after the required `$button-palette` setting", but the Sass subsection did not state the setting (only the 1.4.3 row and D17 did). The subsection gains the required line as a code block, the form the Badge, Label, and Breadcrumbs Sass subsections use, and the two sentences follow it.

Note on R4's figures: the decision's 3.32:1 (solid primary, enabled against disabled) and "3.62 to 4.08:1" are the helper's unrounded-channel values (3.324 and 3.620); the 8-bit values are 3.328 and 3.613. The ratio rule's step 1 lets either mode stand, and the row's other figures (3.31, 3.19, 4.08) agree in both, so the row is consistent; applied as decided.

## Proposed shared-document and other-group changes

P1. `exportAs` on the input-only directives (the finding under badge). Recommended, option A, extending R17:

- `specs/badge.md` (this group; for the closing pass to rule on, since it changes a decided API): the API line "Selector `[nfsBadge]`; `exportAs: 'nfsBadge'`; standalone; no template." becomes

  > Selector `[nfsBadge]`; no `exportAs`; standalone; no template.

  the bullet "`exportAs: 'nfsBadge'` exposes the input signal to template references, as `nfsCallout` and `nfsLabel` do." becomes

  > - No `exportAs`: the directive owns no state or method a template could read, only the consumer's `color` input (building-blocks 1.3); adding one later is additive.

  and D1's decision cell drops "; `exportAs: 'nfsBadge'`" and its rationale drops "; parity with `nfsCallout` and `nfsLabel` at no code cost".
- `specs/label.md` (group c), the same three edits with `nfsLabel` (its line 118, the bullet at line 133, D1 at line 341).
- `specs/callout.md` (group b): the API line (line 110) to "no `exportAs`"; the bullet at line 128 to

  > - No `exportAs`: the directive owns no state or method a template could read, only the consumer's `color` and `size` inputs (building-blocks 1.3); adding one later is additive.

  and D4 (line 340) drops "; `exportAs: 'nfsCallout'`" from its decision cell and "parity with `nfsButton` and `nfsCloseButton` at no code cost" from its rationale.

Option B, if the closing pass keeps the three: `specs/label.md` line 133 "as `nfsBadge`, `nfsButton`, `nfsCallout`, and `nfsCloseButton` do." becomes

> as `nfsBadge` and `nfsCallout` do.

and `specs/callout.md` line 128 "as `nfsButton` and `nfsCloseButton` do." becomes

> as `nfsBadge` and `nfsLabel` do.

with D4's rationale "parity with `nfsBadge` and `nfsLabel` at no code cost". Either way the parity sentences are stale today: after R17 neither `nfsButton` nor `nfsCloseButton` has an `exportAs`.

P2. `specs/forgotten-import-checks.md`, In-family checks, the bullet for checks that find a peer by registration: replace "(the Drilldown's checks 1 and 2, the Nested menu's check 4)" with

> (the Drilldown's checks 1 and 2, the Nested menu's check 4, the Abide label's and Form error's "no field resolves" warnings and its field's warning for an error state with no visible Form error)

so the bullet lists the third family that now follows it, as S2's list names the grids' checks.

P3. `building-blocks.md`: nothing beyond the decisions file's closing-pass list; R29's Badge bullet append (item 11) now matches `specs/badge.md`'s check 3.

No change is proposed to `CONTEXT.md`, `README.md`, the map, the ADRs, `storybook-conventions.md`, or the architecture guide.
