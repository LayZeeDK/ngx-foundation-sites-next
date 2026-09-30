# 167. Re-run: specs without checks, group c

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) has every spec describe, and accept, a library with no checks. What do `specs/float-classes.md`, `specs/float-grid.md`, `specs/forms.md`, `specs/interchange.md`, `specs/label.md`, `specs/magellan.md`, `specs/media-object.md`, `specs/menu.md` say without them?

## How to work it

Opus 5.5, AFK under the map's triage rule. For each spec, from its extraction manifest in [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and a full read: remove every check of the five kinds, its messages, its tests and stories, and every sentence that relies on one (a parent check, a probe, `strictParents`, `nfsDirectiveCheck`, a Runtime check, a Library mixin's `@error`); state each rule a check enforced as documented usage, in the spec's API text, usage section, and the JSDoc it asks for; give each injection token its plain name as its description; keep the Library mixins' CSS rules and Variant properties, the required injections, ARIA, typed inputs, and the library's own tests of its components. No spec names a deferred check or links to a deferred spec; a forgotten import, a part outside its parent, or a misuse simply gets no warning. `specs/forgotten-import-checks.md` is not in this group: its re-run is [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md). Each changed spec gets a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` in the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`.

## Answer

Done 2026-09-30 on Opus 5.5, AFK, by one agent with no forks. The checklist was [research/checks-extraction-c.md](../research/checks-extraction-c.md), each spec was read in full at 53144f3, and the conventions of the finished group a and group e re-runs were followed ([Re-run: specs without checks, group a](165-rerun-specs-without-checks-group-a.md) and [Re-run: specs without checks, group e](169-rerun-specs-without-checks-group-e.md)). All eight specs changed. Each governing ticket gained `### Amendment, 2026-09-29 (checks move to a later milestone)`, recording per check what left the spec: [Spec: Float Classes](105-spec-float-classes.md), [Spec: Float Grid](100-spec-float-grid.md), [Spec: Forms](98-spec-forms.md), [Re-run: Interchange spec under the class rule](127-rerun-interchange-class-rule.md), [Spec: Label](94-spec-label.md), [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md), [Spec: Media Object](91-spec-media-object.md), and [Spec: Menu](85-spec-menu.md).

| Spec | Lines at BASE | Lines now | Checks removed (manifest) |
| --- | --- | --- | --- |
| `specs/float-classes.md` | 420 | 418 | 3 |
| `specs/float-grid.md` | 598 | 607 | 6 |
| `specs/forms.md` | 564 | 569 | 5 |
| `specs/interchange.md` | 604 | 608 | 3 |
| `specs/label.md` | 466 | 465 | 5 |
| `specs/magellan.md` | 690 | 696 | 6 |
| `specs/media-object.md` | 473 | 479 | 6 |
| `specs/menu.md` | 537 | 528 | 5 |

`specs/forgotten-import-checks.md`, which the manifest also covers, is not this ticket's: it is [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md).

### Decisions

1. Conventions, the same as groups a and e:
   - Each In-family bullet becomes an "Imports (documented usage)" bullet that says what a forgotten import does: NG8002 where a template binds an input, NG8003 where it references the `exportAs`, and otherwise an element rendered without its directive, with no error. No part in this group injects a required parent, so none reports NG0201. Float Classes and Label, which had no In-family bullet, gain one in the same form, as the Badge did.
   - Each rule a check enforced is documented usage, stated in the API section (a "Usage rules" list or section), the JSDoc in the class sketch, the Solution, and the WCAG rows.
   - Bindings that strip a copied class stay, with their tests, minus the warning (Media Object, Menu); where the class list does not strip (Float Classes, Float Grid, Label), a host-bindings test asserts that the copy stays.
   - Each Library mixin's `@error` becomes a "Documented usage for the settings" paragraph (or, in Forms, Sass item 2) with the ratios and sizes and the sentence "Nothing in Foundation's CSS stops a failing value from compiling".
   - Decision rows whose decision was a check are rewritten to what the spec now decides, keeping their numbers; user stories are rewritten in place, so numbering is unchanged.
   - Impact LOW, confidence HIGH.
2. Reads that served only a check go: `HostAttributeToken('class')` and `ElementRef` wherever a check used them (Float Classes, Float Grid, Forms, Label, Media Object, Menu; Magellan's reads serve tracking, and Interchange's `<img>` error read only the host's `nodeName`); the Float Grid column's CDK `InteractivityChecker` and `NfsMediaQuery`; the Media Object's `ResizeObserver`; `NfsMenuText`'s development-only `inject(NfsMenu, {optional: true})`; every render callback that only ran checks (Float Classes, Float Grid, Forms, Label, Media Object, Menu). LOW, HIGH.
3. Forms has no Library mixin. `nfs-forms` emitted no rule, wrote no Variant property, and held only five `@error` checks, so it goes as `nfs-abide` did (group a, decision 3). The three required settings and the five ratios stay as documented usage in Sass item 2, and `forms--field-contrast` and the e2e focus test still assert them. D11 and D13 say so. MEDIUM (a public Sass include goes; adding it back later is additive), HIGH.
4. Media Object has no Library mixin. `--nfs-media-object-section` is a flag-gated list that is not in the Variant manifest, so only the Runtime check read it: a presence marker read only by a check, which group a's decision 7 and the shared manifest move with the build-time checks. `nfs-media-object` wrote nothing else, so it goes, with its Sass compile test and the Storybook preview's include. Which build styles `alignment` (`$global-flexbox: false`) and `mainSection` (`true`) is now in each input's JSDoc. D6 says so. MEDIUM (a public Sass include goes; additive to restore), HIGH.
5. `nfs-label` keeps its pick-correction rule and `--nfs-label-palette`, and with them the library's contrast helper; `nfs-menu` keeps its two rules (the `aria-current` look and the simple-menu rows); `nfs-float-grid` keeps its three Variant properties. The one-writer wording in the Float Grid's D12 no longer rests on a missing-include report: the Flex Grid's mixin writes the two shared counts because no entry point owns their settings. LOW, HIGH.
6. Float Grid's Source ordering rule is stated as the check measured it, not as its message's shortcut: at every breakpoint the columns that hold focusable content appear in their DOM order, and one such column, or none, may move freely. The spec's own usage example pushes an article that holds a link past a text-only sidebar, which the stricter reading ("push and pull only columns without focusable content") would forbid. The stories still keep focusable content out of pushed columns. LOW, HIGH.
7. `nfsInterchange` on an `<img>` stays matched by the directive's selector; the JSDoc and the Solution send an image to `<picture>` and `NgOptimizedImage`. Narrowing the selector to `:not(img)` would make a bound `[nfsInterchange]` on an image fail to compile (NG8002), but it changes a published selector for a misuse the ruling accepts silently, so this ticket does not make it; the later milestone's misuse warning restores the construction-time error. Decision 1 drops its rejected alternative ("silently ignoring `<img>`"), whose reason now applies to the chosen design as well. LOW, HIGH.
8. Magellan keeps every behaviour the checks guarded: an unknown `active` id marks nothing and scrolls nowhere, `updateHistory` alone writes nothing, and the marker write still removes a copied `.is-active` or `aria-current` (D18). Its six rules are one list in the API section. LOW, HIGH.
9. Rejected or hypothetical checks named only as alternatives are rewritten or removed so no spec names a check: Float Classes' Out of Scope width check and missing-include detection, Float Grid's equal-column-count check and D12's presence property, Label's D5, D6, and D13 alternatives, Media Object's D8, D12, and D13 alternatives, and Menu's D13 and D15 alternatives. None was ever specified as a check, so no deferred spec needs them. LOW, HIGH.

### Triage

No item is HIGH impact. Decisions 3 and 4 are MEDIUM impact with HIGH confidence: each follows ADR 0012's 2026-09-27 note (a Library mixin only for custom CSS or checks), the ruling's classification of presence markers, and group a's precedent for `nfs-abide`, and each is additive to undo. Every other item is LOW, HIGH. Nothing is OPEN FOR HUMAN.

### Terms kept

A case-insensitive search of the eight specs finds none of the brief's terms (`nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `In-family`, `Forgotten import`, `Selector manifest`, `nfsReportForgottenPeer`, `Runtime check`, `@error`, `@warn`, `dev check`, `development check`, `Dev-mode check`, `development warning`, `console.warn`, `sync:check`, `missing-imports`), none of `provideNfsRuntimeChecks`, `nfsVariantCheck`, or the three `strict*` Runtime check names, and no link to the five deferred specs or to tickets 150 and 160 to 164. Wording of other kinds is kept, none of it a library diagnostic: axe's own reports; Angular's NG8002, NG8003, and `ngDevMode.componentsSkippedHydration`, which the e2e tests read; Foundation's docs' "warning" that its float classes are physical; "Nothing reports the mismatch" and "nothing reports it" in the Media Object's and Float Grid's Problem Statements, which describe Foundation; the library build's typings assertion of the Variant inputs (the library's own test, per the orchestrator's note); the title of [Resolve the assistive-technology checks](77-evidence-assistive-technology-checks.md); and "Runtime theming" in the Out of Scope sections.

### Checks and check-reliant text the manifest missed

The deferred specs should take these from 53144f3. Line numbers are at BASE.

- Checks owned by another spec, quoted here:
  - `specs/forms.md` line 546 quotes `nfs-abide`'s check of the focus border against the invalid state and `nfs-switch`'s focus-ring check against the page. The build-time checks spec takes both from their owners (`specs/abide.md`, `specs/switch.md`).
  - `specs/magellan.md` line 233, misuse, owned by `specs/smooth-scroll.md`: "the composed Smooth Scroll check names each such link" (a `#`-only href that `<base href>` resolves to another document). Line 296 quotes `nfs-menu`'s 3:1 compile stop, which is in this manifest under `specs/menu.md`.
  - `specs/float-grid.md` line 167, misuse, owned by `specs/flexbox-utilities.md`: `nfsFlexAlign`'s not-a-Flex-parent check beside `nfsRow`; line 171, owned by `specs/flex-grid.md`: "the Flex Grid's own check the reverse" (a Flex Grid directive on a Float Grid compile).
  - `specs/media-object.md` D4 (line 386) and the Notes (line 469) name `nfsFlexChild`'s placement check, and line 208 the Flexbox Utilities' order check; both are `specs/flexbox-utilities.md`'s.
  - `specs/label.md` line 145: "Consumer-declared names are left to the Variant check (the Button spec's D22 rule)", a runtime-kind handoff inside misuse check 2; line 439 names the Callout consumer's `strictVariantProperties` opt-out.
- Build-time and runtime text beyond the manifest's entries:
  - `specs/media-object.md`: `--nfs-media-object-section` and the properties-only `nfs-media-object` (lines 22, 170, 324, 349, 388, and 456 to 463). The manifest listed the property as kept; by the ruling it is a presence marker read only by a check (decision 4). The build-time checks spec takes the property and the mixin; the Runtime checks spec takes the `include()` pairing from the Runtime check entry.
  - `specs/forms.md` line 239: ratios "as the library's contrast helper computes them", and line 164, the paragraph on how the Forms and Abide checks complement each other.
  - `specs/interchange.md`: the statements that no Runtime check reads an Interchange query (lines 27, 117, 143, 457) and that only `strictBreakpointSync` depends on `nfs-breakpoint-properties` (line 587). They define no check; the Runtime checks spec may record that Interchange is outside it.
  - `specs/menu.md` line 174: an unmapped value "is reported (Runtime checks)"; line 131, `NfsMenuText`'s development-only lookup that served the In-family parent check.
  - `specs/float-grid.md`: line 119, "each directive's copied-class check recognises `.medium-6`"; line 452, the manual-test sentence naming the check's premise; D12's rejected presence property (line 488).
- Rejected checks, never specified, removed only so no spec names a check (decision 9): Float Classes lines 319 and 320, Float Grid line 459, and the alternatives listed there.

### What other re-runs need

- [Re-run: specs without checks, group b](166-rerun-specs-without-checks-group-b.md): `specs/flexbox-utilities.md` owns the not-a-Flex-parent and order checks that the Float Grid and Media Object no longer quote; `specs/flex-grid.md` owns its stylesheet check for the other legacy grid and shares `nfsRow` and `nfsColumn` with the Float Grid, whose Imports bullet now says that a Float Grid input bound on a Flex Grid directive fails with NG8002, so the two Imports bullets should agree.
- The deferred-spec authors: `specs/smooth-scroll.md` (the `#`-only link check Magellan quoted) and `specs/switch.md` (the focus-ring check the Forms spec quoted) are group e's, already rewritten; take both checks from their owners at 53144f3.
- Every spec whose Storybook preview or usage names `nfs-forms` or `nfs-media-object`: neither mixin exists in the first milestone.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md). Each quote is written relative to its target file. They add to group a's proposals (its items 5, 6, 11, and 12 touch the same paragraphs).

1. `building-blocks.md` 1.10 (line 170), the Forms bullet: replace "; the checks-only `nfs-forms` mixin stops the compile on each with the exact unrounded ratio." with:

   > ; the Forms spec states each as documented usage with its exact, unrounded ratio, and Forms has no Library mixin.

   In the same bullet, replace "and each mixin stops the compile when its colour is under 3:1 against `$body-background`" with "and each spec requires that colour at 3:1 against `$body-background`".
2. `building-blocks.md` 1.10 (line 171), the Abide bullet: group a's item 5 already drops "The resting field's checks are `nfs-forms`'s, and an Abide form includes both mixins."; keep that deletion.
3. `building-blocks.md` 1.13 (line 248): with group a's item 6, which removes the flag-gated sentence and so the `nfs-media-object` example, also delete the sentence that begins "Neither legacy grid's mixin writes a property of its own that it never leaves empty" and the sentence after it that begins "A directive then decides its own mixin's absence", and replace "The legacy grids' shared settings are the second case:" through "an application compiles one of them ([Spec: Flex Grid](issues/101-spec-flex-grid.md), D12)." with:

   > The legacy grids' shared settings are the second case: the Float Grid's and the Flex Grid's Library mixins both write `--nfs-grid-column-count` and `--nfs-block-grid-max` with the same values, because `$grid-column-count` and `$block-grid-max` belong to neither grid alone and an application compiles one of them ([Spec: Flex Grid](issues/101-spec-flex-grid.md), D12).

4. `building-blocks.md` Table A (line 297), the Interchange row: replace "(no directive, development error on `img[nfsInterchange]`)" with "(no directive; `nfsInterchange` is documented as never going on an `<img>`)".
5. `building-blocks.md` Table D rows, the fourth column:
   - Menu (line 351): replace ", and compile-time checks for 1.4.3, 1.4.1, and 2.5.8" with "; its settings for 1.4.3, 1.4.1, and 2.5.8 are documented usage".
   - Media Object (line 357): replace from "; development checks in render callbacks" through "a properties-only `nfs-media-object`" with "; no Library mixin; stacking at 320 CSS px, placement, and which build styles `alignment` and `mainSection` are documented usage".
   - Label (line 360): replace "development text, copied-class, and link-host checks in one render callback; the `strictVariantNames` and `strictVariantProperties` Runtime checks; `nfs-label` (`--nfs-label-palette`, the better text colour where Foundation's pick is the worse, one `@error` over label text contrast)" with "text for screen readers and no link host as documented usage; `nfs-label` (`--nfs-label-palette` and the better text colour where Foundation's pick is the worse; label text contrast is documented usage)".
   - Forms (line 364): replace "development checks in `afterNextRender` (`labels`, `control`, an `aria-describedby` lookup); a checks-only `nfs-forms` Library mixin (placeholder 4.5:1, field boundary 3:1, focus border 3:1 against the page and focus background and 3:1 from the resting border, select arrow 3:1) with three required settings" with "no Library mixin; three required settings and five ratios as documented usage (placeholder 4.5:1, field boundary 3:1, focus border 3:1 against the page and focus background and 3:1 from the resting border, select arrow 3:1); the label, help text, and input group field rules as documented usage".
   - Float Grid (line 366): replace "(copied classes reported, not stripped)" with "(copied classes not stripped)" and replace from "; development checks in render callbacks" through "the Runtime checks;" with "; the Source ordering, placement, and stylesheet rules as documented usage;".
   - Float Classes (line 371): replace "development checks in one `afterRenderEffect` (copied classes, a float after a sibling floated toward the end of the reading direction when either holds focusable content, a float on a flex or grid item, a clearfix on a flex or grid container); no Runtime check call and no Library mixin" with "the reading-order rule and the two no-effect cases as documented usage; no Library mixin".
6. `storybook-conventions.md`:
   - line 114: replace "text contrast check, the text colour where Foundation's pick is the worse, and --nfs-label-palette" with "the text colour where Foundation's pick is the worse, and --nfs-label-palette".
   - line 121: delete the `@include nfs-media-object;` line.
   - line 236: replace "nfs-label stops the compile on Foundation's alert label, whose $white text is 4.498:1" with "Foundation's alert label fails: its $white text is 4.498:1".
7. `architecture-guide.md` line 28, the examples cell: replace "`nfs-accordion`, `nfs-menu`, `nfs-button`, checks-only `nfs-forms`, properties-only `nfs-xy-grid`" with "`nfs-accordion`, `nfs-menu`, `nfs-button`, properties-only `nfs-xy-grid`", because no checks-only mixin is left in the first milestone.
8. ADR 0012, add to group a's item 11: "the checks-only `nfs-forms` and the properties-only `nfs-media-object`, whose one property only the Runtime check read, are gone too; Forms and Media Object have no Library mixin".
9. ADR 0022, add to group a's item 12: "and the same holds for `nfs-forms`: the Forms spec states its three settings and five ratios, and `forms--field-contrast` asserts them. The compile-time checks this ADR names for the other Library mixins (`nfs-label`, `nfs-menu`) are specified with the build-time checks; their specs state the settings as documented usage." ADR 0022 is not among the ADRs the orchestrator's note lists for ticket 171, but its decision paragraph and first consequence promise compile-time checks.
10. `CONTEXT.md` and the README need nothing specific to this group beyond ticket 171's own changes.

### Verification

`wave158/167/verify.mjs` in the session scratchpad scans the 17 files this ticket touched. Its scans: non-ASCII characters; the banned words; CR line endings (every file is LF, as at BASE); relative links that do not resolve (quoted proposals and gist lines are exempt); table rows whose cell count differs from the header; the check terms above in the eight specs; links to the deferred specs or their tickets; exactly one new amendment heading per governing ticket, linking ticket 158; and this ticket's resolution fields. Every scan has a positive control, and a scan that throws counts as failed. It passes.

### Gist for Decisions so far

- [Re-run: specs without checks, group c](issues/167-rerun-specs-without-checks-group-c.md) -- the Float Classes, Float Grid, Forms, Interchange, Label, Magellan, Media Object, and Menu specs describe and accept a library with no checks: every check the manifest lists (39) and every sentence that relied on one leaves; each rule becomes documented usage in the API text, JSDoc, WCAG rows, and Sass subsections, with its ratios; each In-family bullet becomes an Imports bullet (NG8002, NG8003, or no error); reads that served only a check go; Forms loses its checks-only `nfs-forms` and Media Object its properties-only `nfs-media-object`, whose one property only the Runtime check read, so neither has a Library mixin; `nfs-label`, `nfs-menu`, and `nfs-float-grid` keep their rules and Variant properties; the Float Grid's Source ordering rule keeps the check's exact scope; each governing ticket records what left, per check; impact MEDIUM at most, confidence HIGH; nothing OPEN FOR HUMAN.
