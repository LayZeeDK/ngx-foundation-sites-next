# 166. Re-run: specs without checks, group b

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) has every spec describe, and accept, a library with no checks. What do `specs/callout.md`, `specs/card.md`, `specs/close-button.md`, `specs/drilldown-menu.md`, `specs/dropdown-menu.md`, `specs/dropdown.md`, `specs/equalizer.md`, `specs/flex-grid.md`, `specs/flexbox-utilities.md` say without them?

## How to work it

Opus 5.5, AFK under the map's triage rule. For each spec, from its extraction manifest in [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and a full read: remove every check of the five kinds, its messages, its tests and stories, and every sentence that relies on one (a parent check, a probe, `strictParents`, `nfsDirectiveCheck`, a Runtime check, a Library mixin's `@error`); state each rule a check enforced as documented usage, in the spec's API text, usage section, and the JSDoc it asks for; give each injection token its plain name as its description; keep the Library mixins' CSS rules and Variant properties, the required injections, ARIA, typed inputs, and the library's own tests of its components. No spec names a deferred check or links to a deferred spec; a forgotten import, a part outside its parent, or a misuse simply gets no warning. Each changed spec gets a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` in the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`.

## Answer

Done 2026-09-30 on Opus 5.5, AFK, by the ticket's agent alone (no forks). The checklist was [research/checks-extraction-b.md](../research/checks-extraction-b.md); each spec was read in full at 53144f3, and the conventions of the finished re-runs ([Re-run: specs without checks, group a](165-rerun-specs-without-checks-group-a.md) and [Re-run: specs without checks, group e](169-rerun-specs-without-checks-group-e.md)) were applied. All nine specs changed, and each governing ticket gained a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` that records what left the spec, per check, and links [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md).

| Spec | Governing ticket | Lines at BASE | Lines now | Checks removed (manifest) |
| --- | --- | --- | --- | --- |
| `specs/callout.md` | [Spec: Callout](89-spec-callout.md) | 476 | 472 | 3 |
| `specs/card.md` | [Spec: Card](90-spec-card.md) | 407 | 401 | 2 |
| `specs/close-button.md` | [Spec: Close Button](83-spec-close-button.md) | 418 | 415 | 5 |
| `specs/drilldown-menu.md` | [Re-run: Drilldown Menu spec under the class rule](114-rerun-drilldown-menu-class-rule.md) | 763 | 757 | 11 |
| `specs/dropdown-menu.md` | [Re-run: Dropdown Menu spec under the class rule](113-rerun-dropdown-menu-class-rule.md) | 764 | 767 | 7 |
| `specs/dropdown.md` | [Re-run: Dropdown spec under the class rule](118-rerun-dropdown-class-rule.md) | 769 | 772 | 10 |
| `specs/equalizer.md` | [Re-run: Equalizer spec under the class rule](126-rerun-equalizer-class-rule.md) | 576 | 576 | 1 |
| `specs/flex-grid.md` | [Spec: Flex Grid](101-spec-flex-grid.md) | 568 | 567 | 7 |
| `specs/flexbox-utilities.md` | [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) | 528 | 523 | 7 |

### Decisions

1. Conventions applied in all nine specs, the same as the finished re-runs:
   - Each In-family bullet (Card, Drilldown Menu, Dropdown Menu, Equalizer, Flex Grid, Flexbox Utilities) becomes an "Imports (documented usage)" bullet: a forgotten import fails to compile where the template binds an input or references the directive (NG8002, NG8003); a forgotten `NfsMenuItem` leaves its submenu and toggle without their required item (NG0201); otherwise the element renders without its directive, with no error. The Callout, the Close Button, and the Dropdown pane had no In-family line and get no Imports bullet.
   - Each rule a check enforced is stated as documented usage: a "Documented usage" list or bullet in the API section (which the JSDoc states), the API rows the rule concerns, the WCAG rows, and the Sass subsection. A former compile stop becomes a required setting or a "Settings a theme keeps" statement in the Sass subsection and the WCAG rows, with its ratios and sizes.
   - The bindings that strip a copied class stay (the Drilldown's `invisible`, `animate-height`, and `is-hidden`, the Dropdown pane's `is-open`, the Nested menu's and the Menu's classes), and so do their behaviour tests, minus the warnings.
   - Decision rows whose decision was a check are rewritten to what the spec now decides; none is removed, so no number is reused or skipped. User stories are rewritten in place, so their numbering is unchanged.
   - Where a WCAG row's test was a Sass compile check, the row now names the layer that still tests it (axe in the stories, a play function, e2e), or "Not automated (axe has no 1.4.11 rule); Foundation's defaults pass", as the Accordion Menu's re-run has it.
   - LOW, HIGH.
2. Reads and properties that served only a check go: the development-only `HostAttributeToken('class')` (Callout, Drilldown Menu, Dropdown pane, Flex Grid, Flexbox Utilities) and `HostAttributeToken('autoFocus')` (Dropdown pane); the `ElementRef` the Close Button, the Flex Grid, and the Flexbox Utilities injected only for their checks; the Flexbox Utilities' development use of CDK's `InteractivityChecker` and `NfsMediaQuery`; the Flex Grid's development `ResizeObserver`; the Drilldown back items' registration with the root and its `#backs` registry, which only checks 1 to 3 read. The Callout and the Close Button now inject nothing. LOW, HIGH.
3. `--nfs-flexbox-responsive-breakpoints` leaves `nfs-flexbox-utilities`: the spec itself called it "a flag-gated property, read only by the Runtime checks and not in the Variant manifest", so it takes the reading of group a's decision 7. The mixin writes only `--nfs-flex-source-ordering-count`; the flag's rule (bind a responsive helper value only while `$flexbox-responsive-breakpoints` is on) is documented usage 6; D14 and Sass items 1, 2, 5, and 6 say so, and the Sass compile test loses the empty-property case. LOW (additive to restore), HIGH.
4. The equalizer's `nfsEqualizerToken` takes its plain name as its description, `new InjectionToken<NfsEqualizer>('nfsEqualizerToken')` (ruling decision 4). LOW, HIGH.
5. The Dropdown Menu's projected right-hand section: the DOM walk after hydration stays (it is behaviour, the Nested menu root's), and the warning that named `alignment="right"` becomes documented usage: a menu projected into `nfsTopBarRight` from another template binds `alignment="right"`, so its server HTML already opens left (D9). The spec's Development-mode checks paragraph quoted the hosted Menu's and the Nested menu's checks; per the orchestrator's note it is replaced by a pointer to those specs' markup rules, not restated. LOW, HIGH.
6. The Flex Grid's overflow at 320 CSS px (check 4, D11) rested on a development measurement. Without it, 1.4.10 rests on documented usage 4 (stack a row below the breakpoint where its columns no longer fit), which every recipe and story follows and the e2e reflow case asserts. D11 is rewritten to that, keeping its measurements and its rejected library-CSS alternatives. LOW, HIGH.
7. The Flexbox Utilities' 2.4.3 hazard (check 5, D10) rested on a development prediction of the visual order. Without it, the rule is documented usage 5: `order` or a reverse `direction` rearranges only a set of items of which at most one holds focusable content, at every breakpoint. D9 loses its rejected alternative "documenting only" (it is now the decision), D10 is rewritten, and D15 loses the development CDK use. This is the case the ruling's "What was weighed" names: a consumer who ignores the rule fails WCAG on their own page, which the user accepts for the first milestone. LOW, HIGH.
8. The Card's rejected checks (an `alt` check, a landmark-divider check, a warning for a link written directly in the card) are no longer named: the two Out of Scope bullets go, D4's and D6's rejected alternatives lose them, and D10 decides "no injection and no parent token". The Close Button's glyph pair and the Callout's pairs keep their measured failing figures as documentation (`#aaaaaa` at 2.30:1; purple `#4b0082` at 4.02:1). LOW, HIGH.
9. Mentions of checks another spec owns are removed, not restated: the Positioner's negative-offset, same-axis, and `position: absolute` warnings in the Dropdown spec (the Anchored pane spec's); the Breakpoint service's unknown-name warning behind `equalizeOn`; the Menu's and the Nested menu's copied-class, toggle-name, placement, and `expandAll()` checks in the Drilldown and Dropdown Menu specs; the Typography Helpers' "checked on the page only" in the Callout and Card specs; the Sticky spec's development warning in a Flexbox Utilities note. LOW, HIGH.

### Triage

No item is HIGH impact: each decision follows the ruling, the manifest's classification, a finished re-run's convention, or the spec's own text, and each is additive to undo. Every item is LOW impact with HIGH confidence. Nothing is OPEN FOR HUMAN.

### Terms kept

A search of the nine specs finds none of the brief's terms (`nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `In-family`, `Forgotten import`, `forgotten import`, `Selector manifest`, `nfsReportForgottenPeer`, `Runtime check`, `@error`, `@warn`, `dev check`, `development check`, `Dev-mode check`, `development warning`, `console.warn`, `sync:check`, `missing-imports`), no `provideNfsRuntimeChecks` or `nfsVariantCheck`, and no link to the five deferred specs or to tickets 150 and 160 to 164. Wording of other kinds kept, none of it a library diagnostic:

- axe's own reports ("axe reports 3.75", "reports only as incomplete");
- Angular's NG0201, NG8002, and NG8003 and `ngDevMode.componentsSkippedHydration`, which the e2e tests read;
- the Variant declaration tooling's typings check in the Callout's D2 and the Flexbox Utilities' Types line (the library's own post-build gate, per the orchestrator's note);
- the title of [Resolve the assistive-technology checks](77-evidence-assistive-technology-checks.md) in the Drilldown and Dropdown Menu release tests;
- "Checked by" as a WCAG table header, Foundation's "collision check" in the Dropdown Menu, measurements "checked in the compiled CSS" in the Flex Grid, and "Runtime theming" in Out of Scope.

### Checks and check-reliant text the manifest missed

The deferred specs should take these from 53144f3 where they are checks; the rest restate or rely on checks the manifest lists. Line numbers are at BASE.

- Checks owned by another spec, which the manifest left out of this group by design and whose owners' manifests should hold them:
  - `specs/dropdown.md` line 287, last sentence, and line 252: the Positioner's same-axis-alignment, negative-offset, and not-`position: absolute` warnings; line 734: "which the Positioner's development-mode `position` check reports". Owner: `specs/anchored-pane.md` (misuse warnings).
  - `specs/dropdown-menu.md` line 237: the hosted Menu's check 1 and the Nested menu's copied-class, Hybrid-toggle-name, toggle-text placement, parent-without-toggle, item-without-root, and `expandAll()` checks, and line 227's `expandAll()` warning. Owners: `specs/menu.md` and `specs/nested-menu.md` (misuse and family warnings). Line 350's 2.4.6 warning is the Nested menu's nameless Hybrid toggle, not a drilldown back button as the manifest's Kept list says.
  - `specs/drilldown-menu.md` lines 425 and 437: the Menu's check 1 and the Nested menu's copied-class check naming `[expanded]`. Owners as above.
  - `specs/equalizer.md` line 175: the Breakpoint service's unknown-name warning. Owner: `specs/breakpoint-service.md` (misuse warnings).
  - `specs/flexbox-utilities.md` line 527: the Sticky spec's warning for a container cell with a non-stretch `alignSelf`. Owner: `specs/sticky.md`.
- A presence marker read only by a check: `specs/flexbox-utilities.md` Sass items 1, 2, and 6 and D14, `--nfs-flexbox-responsive-breakpoints` (build-time, decision 3), with its Sass compile case at line 366.
- A development-only token description: `specs/equalizer.md` line 143 (forgotten-import, M7).
- Check-reliant text, per spec:
  - `specs/callout.md`: line 137 ("and the Variant check reports it"); line 197 ("the close button's name is the Close Button's check"); line 321 ("name check"); line 326 ("checked on the page only"); line 432 ("The `nfs-callout` check then also covers ..."); line 445 ("stops the compile until"); line 453 (settings read only for the check); D15 ("No mixin parameter that skips a check").
  - `specs/card.md`: lines 288 and 289 (rejected `alt` and landmark-divider checks); D4's and D6's rejected development checks; line 375 ("stops the compile until"); line 403 ("the rule and the checks are the same").
  - `specs/close-button.md`: line 19 (the Solution's three warnings); line 78 (docs conventions "checked in development", "warns"); line 101 (`ElementRef`, read only by the checks); line 150 (Material comparison "development-mode name checks"); line 279 ("the name checks are covered through the DOM"); line 395 ("The name is checked in development").
  - `specs/drilldown-menu.md`: lines 25, 114 to 129, 337, and 763 (every "and reported" beside a stripped class); line 109 ("typed and checked"); line 165 and line 217 (the back registry used only for the checks); line 206 and the `openPath` and `scrollTop` tests (development warnings); line 544 (the Menu's runtime and development checks); D28 and D30.
  - `specs/dropdown-menu.md`: lines 111, 122, 124, 129, 130, 134, and 339 ("and reported"); lines 26, 451, 482, 552, 680 (the right-hand section's warning); line 453; line 481 ("development-only copied-class reads"); line 496 (the Nested menu's and the Menu's checks in the Testing intro); line 535 ("no development warning was logged"); lines 562, 563, 565 (Out of Scope); line 717 ("which checks the bar's colours"); D8 ("that always warns"), D22; user story 44.
  - `specs/dropdown.md`: the hierarchy block's `nfsVariantCheck` and `HostAttributeToken` lines (158 to 161); line 174 (the Runtime-check API import); every "(dev check N)" in the Foundation contract, class mapping, API, ARIA, WCAG, Animation, and Rendered HTML text; line 463 and 465 (rendering modes); line 529 (SSR smoke); line 530 (the copied-class matcher); D6 ("No check" and its rejected development check), D13, D20, D23, D29.
  - `specs/equalizer.md`: line 130 ("no Runtime check is involved"); line 389 (the copied-class "development check" out of scope); D16.
  - `specs/flex-grid.md`: line 23 (Solution); line 120 (binding rule); line 131 ("every placement check only reports"); line 135 (`ElementRef` for the checks); line 185 (`isCollapseChild` row); line 201; line 239 (the Flexbox Utilities' visual-order check); lines 249 and 250; lines 374 and 377; line 382; line 396 (`console.warn` spy); D8, D9, D10, D15; Sass (1) and (5); Notes lines 564 and 568.
  - `specs/flexbox-utilities.md`: line 30 (Solution); line 131; line 209 (Material comparison); line 215 (development CDK use); line 217 ("the visual-order prediction"); line 233; line 243 ("No check"); line 342 (`console.warn` spy); lines 385 and 388 (Out of Scope); D7's rejected DI check, D9's rejected "documenting only", D15, D17; line 459 (usage comment); line 499 (Platform features); line 504; line 528.

### What other re-runs need

- The owners of the checks listed first above (the Anchored pane, Menu, Nested menu, Breakpoint service, and Sticky specs): confirm each is in their manifest and their deferred spec, as the orchestrator's note asks.
- [Re-run: specs without checks, group f](170-rerun-specs-without-checks-group-f.md): `specs/variant-declaration-tooling.md` line 128 names `$flexbox-responsive-breakpoints` among the flag-gated families whose property only the runtime check reads; decision 3 removes that property.
- The Float Grid's spec: the Flex Grid's In-family line said "The two grids' pairs make the same calls, as the Selector manifest's rule 2 requires"; the Float Grid's matching line leaves with its own re-run, and the two Imports bullets now agree that the entry point imported decides which grid's pair matches.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md). Each quote is written relative to its target file, and each follows from this group's rewrites.

1. `building-blocks.md` 1.10, the Close Button bullet (line 172): replace "It stops the compile with `@error` when `$closebutton-color` or `$closebutton-color-hover` is under 3:1 against `$body-background`, and every spec whose container paints its own background under a close button checks the same two settings against that background (Reveal, Off-canvas, Callout), because axe marks the glyph's contrast incomplete." with:

   > `$closebutton-color` and `$closebutton-color-hover` reach 3:1 against `$body-background`, and every spec whose container paints its own background under a close button states the settings that pass on it (Reveal, Off-canvas, Callout), because axe marks the glyph's contrast incomplete.

2. `building-blocks.md` 1.10, the Flexbox Utilities bullet (line 177): replace "; in development builds `NfsFlexChild` and `NfsFlexContainer` report a Flex parent whose items holding focusable content are shown in another sequence than the DOM's at the current breakpoint (2.4.3), predicted from computed `order` and `flex-direction` (measured to match the rendered order in three engines), because axe has no rule for it." with:

   > ; `order` and a reverse `direction` rearrange only a set of items of which at most one holds focusable content, at every breakpoint (2.4.3), a documented rule, because axe has no rule for it.

3. `building-blocks.md` 1.10, the Card bullet (line 183): replace "It stops the compile when `$card-font-color`, `$anchor-color`, or `$anchor-color-hover` is under 4.5:1 on `$card-background` or `$card-divider-background`;" with:

   > `$card-font-color`, `$anchor-color`, and `$anchor-color-hover` reach 4.5:1 on `$card-background` and `$card-divider-background`;

4. `building-blocks.md` Table A, the Dropdown (pane) row (line 294): replace "CDK `FocusTrap` whenever `trapFocus` is on (only valid with `role="dialog"`, else a development warning), both resolved from the `Injector` on first need; `nfsVariantCheck()` for `size`; `HostAttributeToken('class')` in development builds only, for the copied-class warning" with:

   > CDK `FocusTrap` whenever `trapFocus` is on (documented only with `role="dialog"`), both resolved from the `Injector` on first need

5. `building-blocks.md` Table B, the DropdownMenu row (line 324): replace "is read from the DOM after hydration with a development warning" with:

   > is read from the DOM after hydration, and the docs bind `alignment="right"` on such a menu

6. `building-blocks.md` Table D, the Close Button row (line 349), its primitives cell: replace it with:

   > Host bindings; `nfs-close-button` (a 24 px box floor on every `.close-button`, and `--nfs-closebutton-size`)

7. `building-blocks.md` Table D, the Callout row (line 355), its primitives cell: replace it with:

   > Host bindings; a signal content query for the lightweight `nfsCloseButtonToken`; `nfs-callout` (room for a close button for 1.4.12, and `--nfs-foundation-palette` and `--nfs-callout-sizes`)

8. `building-blocks.md` Table D, the Card row (line 356): replace ", and one `@error` over card text and link contrast on the card and divider backgrounds)" with ")".

9. `building-blocks.md` Table D, the Flex Grid row (line 367), its primitives cell: replace it with:

   > A static host class and one `computed` class list per directive (copied classes not stripped); `nfsBreakpointsToken` for the Zero-breakpoint gaps; `nfs-flex-grid`, properties-only (`--nfs-grid-column-count`, `--nfs-block-grid-max`, also written by the Float Grid's mixin)

10. `building-blocks.md` Table D, the Flexbox Utilities row (line 369): replace "and CDK adds nothing outside development builds" with "and CDK adds nothing", and its primitives cell with:

    > Host bindings over `input()` signals and one `computed` class list per directive; `nfsBreakpointsToken` for the Zero breakpoint; `nfsVariantBoolean`; the properties-only `nfs-flexbox-utilities` Library mixin (`--nfs-flex-source-ordering-count`)

11. `storybook-conventions.md`, the preview block (line 118): replace the `nfs-card` line with:

    > `@include nfs-card; // Card: overflow-wrap for words the card would cut off (1.4.10, 1.4.12); every card--* story`

12. `storybook-conventions.md`, the preview block (line 123): replace the `nfs-flexbox-utilities` line with:

    > `@include nfs-flexbox-utilities; // Flexbox Utilities: --nfs-flex-source-ordering-count for the Variant declaration file's generator; every flexbox-utilities--* story`

No change is proposed for the glossary, the architecture guide, the ADRs, or the README beyond the shared manifest's entries: this group's glossary terms (Callout, Card, Card divider, Close Button, Flex parent, Flex child, Source ordering, Base side) name no check.

### Verification

`wave158/166/verify.mjs` in the session scratchpad scans the 19 files this ticket touched: non-ASCII characters; the banned words; relative links that do not resolve (quoted proposals and gist lines are exempt, and in the governing tickets only the appended amendment is scanned, because their older sections quote proposals written relative to other files); CR line endings (every file is LF, as at BASE); table rows whose cell count differs from the header; the brief's check terms and the five deferred spec names in the nine specs; exactly one amendment heading per governing ticket, linking ticket 158; and this ticket's resolution fields. Every scan has a positive control, and a scan that throws counts as failed. It passes.

### Gist for Decisions so far

- [Re-run: specs without checks, group b](issues/166-rerun-specs-without-checks-group-b.md) -- the Callout, Card, Close Button, Drilldown Menu, Dropdown Menu, Dropdown, Equalizer, Flex Grid, and Flexbox Utilities specs describe and accept a library with no checks: every check the manifest lists (53) and every sentence that relied on one leaves; each rule becomes documented usage in the API text, JSDoc, WCAG rows, and Sass subsections, with its ratios and sizes; each In-family bullet becomes an Imports bullet; reads and properties that served only a check go, `--nfs-flexbox-responsive-breakpoints` included; the Flex Grid's reflow and the Flexbox Utilities' focus order now rest on documented usage; nothing is OPEN FOR HUMAN.
