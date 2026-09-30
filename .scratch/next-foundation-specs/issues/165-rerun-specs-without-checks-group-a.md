# 165. Re-run: specs without checks, group a

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) has every spec describe, and accept, a library with no checks. What do `specs/abide.md`, `specs/accordion-menu.md`, `specs/accordion.md`, `specs/anchored-pane.md`, `specs/badge.md`, `specs/breadcrumbs.md`, `specs/breakpoint-service.md`, `specs/button-group.md`, `specs/button.md` say without them?

## How to work it

Opus 5.5, AFK under the map's triage rule. For each spec, from its extraction manifest in [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and a full read: remove every check of the five kinds, its messages, its tests and stories, and every sentence that relies on one (a parent check, a probe, `strictParents`, `nfsDirectiveCheck`, a Runtime check, a Library mixin's `@error`); state each rule a check enforced as documented usage, in the spec's API text, usage section, and the JSDoc it asks for; give each injection token its plain name as its description; keep the Library mixins' CSS rules and Variant properties, the required injections, ARIA, typed inputs, and the library's own tests of its components. No spec names a deferred check or links to a deferred spec; a forgotten import, a part outside its parent, or a misuse simply gets no warning. The Breakpoint service spec keeps the service and loses the Runtime checks' configuration (the Runtime checks spec takes it). Each changed spec gets a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` in the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`.

## Answer

Done 2026-09-30 on Opus 5.5, AFK. The ticket's agent rewrote `specs/accordion.md` first to fix the conventions, then five forks of it rewrote the other eight specs in parallel, each on its own files and from the same conventions. The checklist was [research/checks-extraction-a.md](../research/checks-extraction-a.md), and each spec was read in full at 53144f3. All nine specs changed. Each governing ticket gained `### Amendment, 2026-09-29 (checks move to a later milestone)`, recording per check what left the spec: [Re-run: Abide spec under the class rule](123-rerun-abide-class-rule.md), [Re-run: Accordion Menu spec under the class rule](112-rerun-accordion-menu-class-rule.md), [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md), [Re-run: Anchored pane (shared utility) spec under the class rule](131-rerun-anchored-pane-class-rule.md), [Spec: Badge](93-spec-badge.md), [Spec: Breadcrumbs](88-spec-breadcrumbs.md), [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md), [Spec: Button Group](82-spec-button-group.md), and [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md).

| Spec | Lines at BASE | Lines now | Checks removed (manifest) |
| --- | --- | --- | --- |
| `specs/abide.md` | 774 | 766 | 8 |
| `specs/accordion-menu.md` | 653 | 651 | 6 |
| `specs/accordion.md` | 717 | 710 | 10 |
| `specs/anchored-pane.md` | 674 | 673 | 2 |
| `specs/badge.md` | 430 | 424 | 5 |
| `specs/breadcrumbs.md` | 505 | 491 | 10 |
| `specs/breakpoint-service.md` | 800 | 592 | 6 |
| `specs/button-group.md` | 470 | 468 | 6 |
| `specs/button.md` | 554 | 558 | 6 |

### Decisions

1. Conventions applied in all nine specs:
   - Each In-family bullet becomes an "Imports (documented usage)" bullet that says what a forgotten import of each part does, checked against the spec's own DI text. Where a binding or reference names the directive, the template fails to compile (NG8002, NG8003). Where the part is a required parent, the parts below it throw NG0201, which is Angular's report. Otherwise the element renders without its directive, with no error.
   - Each injection token's description is its plain name, for example `new InjectionToken<NfsAccordion>('nfsAccordionToken')`.
   - Each rule a check enforced is now documented usage, stated in the API text, the class sketch's JSDoc comments, the Behaviour or usage rules, and the WCAG rows.
   - The bindings that strip a copied class stay, and so do their behaviour tests, minus the warning.
   - Each Library mixin's `@error` or `@warn` becomes "Documented usage for the settings", with the ratios and sizes and the sentence "Nothing in Foundation's CSS stops a failing value from compiling".
   - Decision rows whose decision was a check are rewritten to what the spec now decides. User stories are rewritten in place, so numbering is unchanged.
   - Impact LOW, confidence HIGH.
2. Reads that served only a check go:
   - the development-only `HostAttributeToken('class')` in the Accordion item, the Abide parts, the Badge, the Breadcrumbs item, the Button, and the Button Group;
   - the Breadcrumbs item's development-only `inject(NfsBreadcrumbs, {optional: true})`;
   - the Button Group's `contentChildren(NfsButton, {descendants: true})` query, with its run-time import of `NfsButton`;
   - the Badge's and the Button's render callbacks, and the Badge's `ElementRef`.

   `HostAttributeToken('role')` stays in Abide, because the Form error's role binding needs it. LOW, HIGH.
3. The Abide spec has no Library mixin. `nfs-abide` emitted no CSS, wrote no Variant property, and held only four `@error` checks. ADR 0012's 2026-09-27 note gives a Library mixin only to an entry point with custom CSS or checks, and in the first milestone Abide has neither. D22 is rewritten; its rejected alternatives are "an `nfs-abide` include that emits nothing" and "an `nfs-abide` that includes the Forms spec's mixin". The invalid-state settings stay required as documented usage, and the `abide--invalid-state-contrast` story still asserts them from computed styles. MEDIUM (a public Sass include goes; adding it back later is additive), HIGH.
4. The Breakpoint service spec keeps the service and loses the whole Runtime checks surface, with every test, story clause, usage example, and mention:
   - `NfsRuntimeChecks`, `NfsRuntimeCheckReport`, and the two provider functions;
   - `nfsVariantCheck`, `NfsVariantCheck`, and `NfsVariantNeed`;
   - the three Runtime checks, `strictDirectiveImports`, and `strictParents`;
   - the checks table and the configuration and timing rules;
   - the `nfsDirectiveCheck` and `NfsFamilyPeers` exports from `ngx-foundation-sites/media-query`.

   The service is `@Service()` and needs no provider of its own, so none of the providers remains. D27 to D31 and D33 had nothing left to decide and are removed; their numbers are not reused. MEDIUM (the entry point's public API shrinks), HIGH.
5. `nfs-breakpoint-properties` stays, but writes only `--nfs-breakpoint-classes`, which the Variant declaration tooling's generate mode reads to type the Class breakpoints. At 53144f3 no spec reads the `--nfs-breakpoint-<name>` properties except the drift check, so they are presence markers read only by a check, and the ruling moves those with the build-time checks. D19, D20, and D26 say so, and the consumer keeps `nfsBreakpointsToken` in step with `$breakpoints` as documented usage. MEDIUM (a Library mixin's output shrinks; restoring it is additive), HIGH.
6. The Breakpoint service's own development diagnostics leave as misuse warnings, as the manifest classifies them:
   - the warnings for an unknown name or modifier, for invalid and repeated rule tokens, and for an unknown transferred Server breakpoint;
   - the development-only construction error for an invalid map or `serverBreakpoint`.

   The behaviour stays: an unknown name answers `false`, an invalid token is skipped, a repeated breakpoint keeps the last token, and an unknown transferred name falls back to the client token. The map rules are documented usage: finite, non-negative, unique values with exactly one `0`, and a `serverBreakpoint` that is a key. The service does not validate the token, and its answers for an invalid one are unspecified (D14, D21). Production builds never validated the map, so the spec works without the error. MEDIUM, HIGH.
7. `--nfs-button-responsive-expanded` leaves `nfs-button`'s output. The ticket's agent overrode its fork, which had kept it. The Variant declaration tooling spec says a flag-gated family's property is one "which only the runtime check reads", and the shared manifest classifies such properties as presence markers read only by a check (build-time). The generate mode does not read it, because the flag changes whether classes exist, not their names. The `expanded` Variant row, D19 (with a rejected alternative for a third property), and Sass items (2) and (6) say so, and the Sass compile test loses its two clauses. The same reading applies to every flag-gated family property in groups b to f (see "What other re-runs need"). LOW, HIGH.
8. The Breadcrumbs item's placement becomes documented usage. The item sits inside the trail's list, because Foundation scopes `.disabled` under `.breadcrumbs`. The rule is one of the DOM, so an item projected from another template gets the look too. Only the item's warning ever depended on the declaration-site DI lookup. LOW, HIGH.
9. The Badge's `badge--colors` play function now computes each badge's ratio from its computed colours and asserts at least 4.5:1. axe leaves one-character text incomplete, and the removed `@error` was the only thing that saw Foundation's own alert example fail. This is one of the library's own story tests, which the ruling keeps. The contrast helper stays only for the Badge's pick-correction CSS rule; the Accordion, Accordion Menu, Breadcrumbs, and Button specs drop it, because only their checks used it. LOW, HIGH.
10. Accordion Menu: the development-mode checks paragraph becomes a documented-usage paragraph. It covers:
    - one open item per level while `multiOpen` is off, and `expandAll()` only with `multiOpen`;
    - `[expanded]` instead of a copied `is-active`, and `aria-current` for the current page;
    - `hybrid` with the toggle-text span only inside a Hybrid toggle;
    - a toggle on every parent item, every item inside a root, and `orientation` instead of `vertical`.

    The restated Nested menu and Menu checks go, and the `@error` checks become settings with their ratios and 24 px minimums. Anchored pane: the Positioner's warnings become documented usage in `NfsPositionerOptions`. An alignment on the position's own axis resolves to `center`, `vOffset` and `hOffset` are 0 or more (2.4.11), and the placed element needs `position: absolute`. LOW, HIGH.
11. The Accordion's Entry point bullet keeps its [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) link, because it cites only the no-import-array ruling, which ticket 158 keeps standing on its own. No other group a spec links ADR 0046. LOW, HIGH.
12. One table row fixed outside the ruling. Abide's `email` pattern row had unescaped pipes inside code spans since before this ticket (`{|}`, `` `|` ``), which GitHub splits into extra cells. They are escaped as `\|`, and the row renders unchanged in five cells. LOW, HIGH.

### Triage

No item is HIGH impact. Decisions 3 to 6 are MEDIUM impact with HIGH confidence: each follows the ruling's classification or the manifest's, or a record at 53144f3 (ADR 0012's note, a `git grep` for readers of the properties), and each is additive to undo. Every other item is LOW, HIGH. Nothing is OPEN FOR HUMAN.

### Terms kept

A search of the nine specs finds none of the brief's terms and no link to the five deferred specs or to tickets 150 and 160 to 164. The search covered `nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `In-family`, `Forgotten import`, `Selector manifest`, `nfsReportForgottenPeer`, `Runtime check`, `@error`, `@warn`, `dev check`, `development check`, `Dev-mode check`, `development warning`, `console.warn`, `sync:check`, `missing-imports`, `provideNfsRuntimeChecks`, `nfsVariantCheck`, the three `strict*` Runtime check names, and `M7`, case-insensitive. The verification script's positive controls confirm the search works.

Wording of other kinds kept, none of it a library diagnostic:
- axe's own reports ("axe reports 4.49", "axe `target-size` reports ...");
- Angular's NG0201, NG8002, and NG8003 and `ngDevMode.componentsSkippedHydration`, which the e2e tests read;
- Aria's own development messages in the Accordion, reworded without `console.warn`;
- Foundation's `breakpoint()` "warns at compile time", its docs' "warn", and its jQuery `:visible` checks;
- the Variant declaration tooling's internal typings gate in the Accordion Menu's tests (the library's own test, per the orchestrator's note);
- the title of [Resolve the assistive-technology checks](77-evidence-assistive-technology-checks.md);
- "Runtime theming" in the Out of Scope sections.

### Checks and check-reliant text the manifest missed

The deferred specs should take these from 53144f3. Line numbers are at BASE. Only two are checks in their own right, and both are owned by another spec; the rest restate or rely on checks the manifest already lists.

- Checks owned by another spec:
  - `specs/accordion-menu.md` line 199, misuse, owned by `specs/menu.md`: "So does the hosted Menu's check 1: a Menu class copied onto the root, such as Foundation's `vertical`, names `orientation`, while a redundant `menu` is not reported." It is tested at line 437. The misuse warnings spec takes it from `specs/menu.md`.
  - `specs/button.md` line 193, misuse: a quote of the Triggers spec's warning for a typeless `<button>` in a form. It is already in [research/checks-extraction-f.md](../research/checks-extraction-f.md).
- Build-time checks quoted in `specs/accordion-menu.md`:
  - lines 283 and 284 quote `nfs-menu`'s current-fill and current-text checks (owned by `specs/menu.md`);
  - line 623 calls the current-fill `@error` "the Nested menu's check". The build-time checks spec should take it once, from its owner.
- Confirmed for the orchestrator's note on checks another spec owns:
  - the Positioner's negative-offset warnings are in manifest a (anchored-pane, "misuse: Positioner dev-mode warnings");
  - the Breakpoint service's unknown-name rule behind the Equalizer's `equalizeOn` is in manifest a (breakpoint-service, "misuse: NfsMediaQuery's own API-misuse warnings").
- `specs/accordion.md`:
  - line 260, the primitives list: "`afterNextRender` and `afterRenderEffect` for the dev checks" and "`HostAttributeToken` for dev check 7 only, in development builds";
  - line 494, the class-rule test: "fires no warning";
  - line 570, D21: "go unreported";
  - line 685, Sass (2): "`$accordion-background`, `$accordion-content-color`, `$accordion-content-background` for the checks, whose contrast helper is the library's own";
  - line 693: "the Runtime checks have nothing to read for it".
- `specs/abide.md`:
  - misuse, D20: line 11 ("a State class copied from the docs must not fail silently"), line 23 ("reported in development builds"), and lines 113, 124, and 126 ("stripped by the binding and reported");
  - line 137: "reports nothing to the Runtime checks";
  - family, in-label placement: lines 158 and 161 ("the development check");
  - line 313, the primitives: "`'class'` in development builds only, for the copied State class check" and "dev checks";
  - line 454, build-time, D21: "whose difference from the invalid border `nfs-abide` checks";
  - line 461, the Rendering modes' development reads;
  - line 478, the testing intro ("to prove they are reported");
  - line 480: the preview stylesheet includes `nfs-forms` and `nfs-abide`;
  - line 554, Out of Scope, owned by `specs/forms.md`: "help text and its pairing check, input groups and their labelled-field check, and the resting field's contrast settings and `nfs-forms` checks";
  - line 583, D22: "so each check runs once".
- `specs/accordion-menu.md`:
  - the Nested menu's copied-class check: line 22 ("is reported in development builds"), lines 90, 118, and 122 ("stripped and reported"), line 281, line 365 ("development builds report both"), line 398, and lines 648 and 653;
  - line 292, the toggle-name check;
  - the family check: line 205 ("one `afterNextRender` for the development check"), line 214 (the render-hook row), and line 508 (D17);
  - the Menu's Runtime checks: lines 113, 184, and 475.
- `specs/anchored-pane.md`: line 86 ("and report a copied one in development"), line 479 (Out of Scope), and line 674 (Foundation behaviour changed or dropped).
- `specs/badge.md`:
  - rejected alternatives: D5 (re-checking on every render), D6 (a check for digit-only text), D9 ("Check only, naming both ratios"), and D10 (a `@warn`);
  - line 307, Out of Scope: "A development warning for a badge on a button";
  - line 412: "opts `strictVariantProperties` out";
  - mentions at lines 21, 25, 133, 156, 198, 239, 275, 312, 388, and 401;
  - the 1.4.3 row and Sass 1(c) cite D8 for the `@error`, but D8 is the live-role decision; the build-time checks spec should not copy that citation.
- `specs/breadcrumbs.md`:
  - rejected alternatives: D11 (a presence property for the missing include) and D9 (the Pagination's 1.4.1 check; a check of the separator colour);
  - D10 and D11 (lines 391 and 392): "Checking once in `afterNextRender`" and the `MutationObserver` cost;
  - mentions at lines 14, 27, 109, 177, 189, 199, 215, 285, 301, 312, 337, 344, and 493, and user story 39.
- `specs/breakpoint-service.md`. The Runtime checks spec should copy the whole Runtime checks section from 53144f3 (lines 347 to 460), not the manifest's summary. The manifest also left out:
  - the Problem Statement (lines 14, 17, and 19);
  - the CSS mapping rows (139 and 140);
  - the type table's "Checked by" cells and bullets (201 to 205);
  - line 174 ("two rather than one umbrella `provideNfs()`");
  - the consumer table (263 and 274);
  - the going-live sync run (282);
  - WCAG (325), Rendered output (331 to 345), and Rendering modes (469 and 471);
  - the `nfsVariantCheck` usage rules (432 to 439): the directive name, the Prototyping Utilities exception, `include()` on every run or only while bound, the never-empty properties with their exceptions, and the `null` and `[]` needs;
  - the configuration details (395 to 407): the `console.warn` prefix, the environment initializer, the measured sizes (62 bytes; 3,976 bytes), the replaced-stylesheet limit, and the `report` callback reaching `ErrorHandler`;
  - the drift check's limits (454 to 456);
  - D20, D26, D29, and D30;
  - Out of Scope (556 and 559 to 562), the usage examples (718 to 769), the `@property` platform item (791), the Storybook note (481), the custom-map story's style block (492), and the testing intro (479);
  - the `--nfs-breakpoint-<name>` output (Sass items 1 to 3 and 5, lines 781 to 785), which moves with the drift check under decision 5.

  For the forgotten-import checks spec: line 165 (`nfsDirectiveCheck(directive, family?)` in the Hierarchy) and line 176 (the `nfsDirectiveCheck` and `NfsFamilyPeers` exports from `ngx-foundation-sites/media-query`); that spec needs an entry point of its own for them. Misuse: ARIA rule 2 (line 309, "and reported by that directive's development check") and D33 (line 603).
- `specs/button.md`:
  - D19's rationale and rejected alternatives about the missing-include report and the gated property (runtime);
  - Out of Scope: "the Runtime checks' configuration, which belongs to the [Spec: Breakpoint service ...]" and "and its CI checks";
  - D18's rejected alternative: "an `@error` whenever `$button-fill` is `hollow`";
  - D23: "names the better candidate in its error ... a failing wrong pick already stops the compile".
- `specs/button-group.md`:
  - Rendering modes: "The content query is read, and the checks run, only in the browser's `afterRenderEffect`" and "the development checks and the Variant check do not run there";
  - the D4 rejected alternative ("a development check for an unnamed group") and Out of Scope ("a naming check"). These are rejected checks, so no deferred spec needs them.

### What other re-runs need

- [Re-run: specs without checks, group c](167-rerun-specs-without-checks-group-c.md): Abide now has no Library mixin, and it names the Forms spec's settings without naming `nfs-forms`. `specs/forms.md`'s `nfs-forms` holds only checks too (D11 at BASE), so decision 3's reading applies to it, and the two specs should agree. `specs/menu.md` owns the copied-root-class check and the `nfs-menu` checks that the Accordion Menu no longer quotes.
- [Re-run: specs without checks, group f](170-rerun-specs-without-checks-group-f.md): `specs/variant-declaration-tooling.md` line 128 gives a flag-gated family "a Variant property of its own ... which only the runtime check reads". Under decision 7 that rule goes with the Runtime checks. The tooling's manifest also loses `--nfs-button-responsive-expanded`, and `--nfs-breakpoint-<name>` if it lists those properties (decision 5).
- Groups b to f: every flag-gated family property read only by the Runtime checks takes decision 7's reading, for example the `$prototype-*-breakpoints` families, `$flexbox-responsive-breakpoints`, and `--nfs-media-object-section`. Every spec that imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` loses the import, because the Breakpoint service entry point no longer exports it.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md). Each quote is written relative to its target file. These add to the shared manifest's entries, and each one follows from this group's rewrites.

1. `building-blocks.md` 1.9 (line 125 at BASE), the source-of-truth bullet: replace from "A consumer with a customised Sass `$breakpoints` provides the same values here;" through "which waits on it." with:

   > A consumer with a customised Sass `$breakpoints` provides the same values here, in px, as documented usage: the service reads no CSS. `@include nfs-breakpoint-properties;` writes only `--nfs-breakpoint-classes`, which the Variant declaration tooling reads. The emission belongs to [Sass packaging for the new library](issues/57-sass-packaging.md); the token shape belongs to the [Spec: Breakpoint service (shared utility)](issues/53-spec-breakpoint-service.md).

2. `building-blocks.md` 1.9 (line 146), delete the sentence "`contentChildren` is used only for dev-mode validation." No first-milestone directive queries its children with it (the Button Group's query served only its checks).
3. `building-blocks.md` 1.4 (line 88), replace the clause from "each such directive reads its host's static `class`" through "dev check 7)" with:

   > each such directive's documented usage names the input to bind instead ([Spec: Accordion](issues/15-spec-accordion.md), D25).

4. `building-blocks.md` 1.10 (line 168), replace the target size and non-text contrast bullet with:

   > - Target size and non-text contrast (WCAG 2.2 AA 2.5.8, 1.4.11): the Library mixin's CSS guarantees them where one rule can (a `max(24px, <setting>)` floor); otherwise the spec states the settings and their minimum sizes and ratios (each ratio from the exact, unrounded WCAG formula) as documented usage in its WCAG table and Sass subsection. axe-core 4.13.0, the version the Storybook conventions pin, has no 1.4.11 rule, so the story gate does not cover it.

5. `building-blocks.md` 1.10 (line 171), replace the Abide bullet with:

   > - Abide ([Spec: Abide](issues/31-spec-abide.md)): the consumer sets `$input-error-color` and `$form-label-color-invalid` at 4.5:1 on the page, `$input-background-invalid` at 4.5:1 on its 10% tint and 3:1 on the page, and the `$input-border-focus` colour at 3:1 from `$input-background-invalid`, because Foundation's `form-input-error` applies only while the field is not focused, so a focused invalid select shows the focus border in place of the invalid one (3.74:1 with the required `$input-border-focus: 1px solid $black`, 1.31:1 on Foundation's defaults). Abide has no Library mixin; the resting field's settings are the [Spec: Forms](issues/98-spec-forms.md)'s.

6. `building-blocks.md` 1.13 (line 248), in the Variant properties bullet:
   - Replace "because an empty property reads like a missing one, so a second writer would keep a property present while the first include is missing and hide it from `strictVariantProperties`" with "so the Variant declaration tooling reads each list from one mixin".
   - Replace the sentence that begins "A family that a Sass flag gates gets a Variant property of its own" with:

     > A family that a Sass flag gates writes no Variant property: the flag changes whether its classes exist, not their names, so the declaration file does not change with it, and the owning spec states the flag as documented usage ([Spec: Button](issues/37-spec-button.md), D19).

7. `building-blocks.md` 1.13 (line 252), replace "Like the Breakpoint properties, the Variant properties are a verification channel, not theming." with:

   > The Variant properties are read by the Variant declaration tooling's generator; they are not a theming channel.

8. `architecture-guide.md` line 266: replace "`nfs-breakpoint-properties` writing `--nfs-breakpoint-medium`" with "`nfs-breakpoint-properties` writing `--nfs-breakpoint-classes`".
9. `CONTEXT.md`, the "Breakpoint properties" entry (line 583): after its definition, add:

   > A later-milestone term: the Breakpoint properties are specified with the Runtime checks ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)); in the first milestone `nfs-breakpoint-properties` writes only `--nfs-breakpoint-classes`.

   In the "Variant properties" entry, replace "read by the library's generator and by the Runtime checks" with "read by the library's generator (and, in a later milestone, by the Runtime checks)".
10. ADR 0005, dated note:

    > 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the drift check moves to a later milestone. In the first milestone the consumer keeps `nfsBreakpointsToken` in step with `$breakpoints` as documented usage, and `nfs-breakpoint-properties` writes only `--nfs-breakpoint-classes`, which the Variant declaration tooling reads; the `--nfs-breakpoint-<name>` properties are specified with the drift check.

11. ADR 0012, dated note:

    > 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): in the first milestone a Library mixin exists for custom CSS or Variant properties only, so the checks-only `nfs-abide` is gone and Abide has no Library mixin; `nfs-breakpoint-properties` writes only `--nfs-breakpoint-classes`; and a flag-gated family writes no Variant property of its own (`--nfs-button-responsive-expanded` is gone), because nothing but the Runtime checks read one.

12. ADR 0022, dated note under its 2026-09-26 consequence:

    > 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the checks-only `nfs-abide` mixin is not in the first milestone; the Abide spec states its settings as documented usage, and its `abide--invalid-state-contrast` story asserts them.

13. ADR 0028, dated note:

    > 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the development warning for several items bound open in single mode moves to a later milestone. In the first milestone the Accordion and Accordion Menu specs state it as documented usage: while single mode is on, bind at most one item open per level; every item bound open renders open.

14. ADR 0040, added to its pointer to ticket 158:

    > In the first milestone `ngx-foundation-sites/media-query` exports no Runtime check API (`nfsVariantCheck`, the two provider functions, `NfsRuntimeChecks`), and a flag-gated Variant family writes no property of its own.

15. The README and `storybook-conventions.md` need nothing specific to this group beyond ticket 171's counts and later-milestone section. The Breakpoint service row of the README names no check.

### Verification

`wave158/165/verify.mjs` in the session scratchpad scans the 19 files this ticket touched. Its scans:
- non-ASCII characters;
- the banned words;
- CR line endings (every file is LF, as at BASE);
- relative links that do not resolve (quoted proposals and gist lines are exempt);
- table rows whose cell count differs from the header;
- the check terms above, in the nine specs;
- exactly one amendment heading per governing ticket, linking ticket 158;
- this ticket's resolution fields.

Every scan has a positive control, and a scan that throws counts as failed. It passes.

### Gist for Decisions so far

- [Re-run: specs without checks, group a](issues/165-rerun-specs-without-checks-group-a.md) -- the Abide, Accordion Menu, Accordion, Anchored pane, Badge, Breadcrumbs, Breakpoint service, Button Group, and Button specs describe and accept a library with no checks: every check the manifest lists (59) and every sentence that relied on one leaves; each rule becomes documented usage in the API text, JSDoc, and Sass subsections, with its ratios; each In-family bullet becomes an Imports bullet saying what a forgotten import does (NG8002, NG8003, NG0201, or no error); tokens are described by their plain names; reads that served only a check go (`HostAttributeToken('class')`, the Breadcrumbs item's lookup, the Button Group's `contentChildren`); Abide loses its checks-only `nfs-abide` mixin; the Breakpoint service loses the whole Runtime checks surface and the service's own development diagnostics, and `nfs-breakpoint-properties` writes only `--nfs-breakpoint-classes`; `--nfs-button-responsive-expanded`, read only by a check, goes; each governing ticket records what left, per check; impact MEDIUM at most, confidence HIGH; nothing OPEN FOR HUMAN.
