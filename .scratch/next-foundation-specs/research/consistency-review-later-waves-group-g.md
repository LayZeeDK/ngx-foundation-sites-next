# Consistency review of the later-milestone waves, group g: the five later-milestone check specs

Ticket: [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md), group g

Reviewer: Opus 5.5 (the group's coordinator), 2026-09-30, with six read-only helpers (Opus 5.5) for the name and "adds back" cross-checks: one each for the forgotten-import, family, Runtime, and build-time checks specs, and two for the misuse warnings spec (Abide to Media Object, Menu to XY Grid). Each helper compared the check spec with the component specs as they stand and with `git show 53144f3` where the check spec quotes that commit. The coordinator spot-checked a sample of each helper's evidence in the files (a dozen claims across the six reports, all held) before applying its findings, and applied every finding that was a fix in a check spec.

Read in full by the coordinator: the ticket, `map.md` lines 1-163, the precedent [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), the rulings [Decide: an exportAs on every directive](../issues/156-decide-exportas-on-every-directive.md), [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md), [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), and [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md), [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md), [Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md), and all five specs. Searched rather than read: `building-blocks.md` (1.4, 1.5, 1.6, 1.9, 1.10), `architecture-guide.md` (P4, P17, P22 to P24), ADRs 0018 and 0039, and the component specs, which the coordinator and the helpers read by section; the extraction manifests by heading (the helpers diffed every heading of each kind against each spec's trace table).

Ratings follow the map's triage rule. Every change below is impact LOW (text of a later-milestone spec, no API, default, or rule of the first milestone changes) and confidence HIGH (the record it follows is quoted), unless a line says otherwise. Nothing is OPEN FOR HUMAN.

## specs/forgotten-import-checks.md

Read in full. Amendment home: [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md).

Checks: 1, class rule, holds (the examples are library code and a labelled forgotten-import case). 2, milestones, holds (the Milestone clause is in the Ticket line, as ticket 175's decision 1 records; the closing section is present). 3, cross-spec names: every directive, selector, token, `exportAs`, and quoted Family entry holds against the specs and `53144f3` (the helper checked every quote by script); five fixes below. 4, shared documents: two fixes (building-blocks 1.9, P23). 5, standing preferences: all six versions, the Implementation level with its reason, rendering modes, WCAG 2.2 AA, and the four layers in ADR 0018's wording hold; no animation applies, as nothing renders. 6, shape: the seven sections, the Material comparison under Implementation Decisions and the design decisions under Further Notes; every `@Component` example imports what its template writes (the forgotten title is the labelled case). 7, hygiene: see Verification.

Changes:

- In-family checks, the parent check: "the development warning building-blocks 1.9 already requires for an optional parent" -> "required for an optional parent before the checks moved; the later milestone restores that rule". Building-blocks 1.9's Parent handle bullet now reads "`{optional: true}` when the child may stand alone ..., where it degrades as its spec documents".
- Solution, the `nfsReportForgottenPeer` API bullet, the family-check bullet, and the closing lead-in: "four checks of" / "the four registration checks" -> "five"; "the Off-canvas panel's check 3 (part a), and the Triggers' check 1" -> "check 3 (part a) and check 4, and". `specs/misuse-warnings.md` S12 counts five; audit 0009's L5 added check 4 to this spec's registration bullet but not to these four places.
- Family entries lead-in: adds that the glossary's In-family check term is the shared manifest's `family:` entry handed to this kind (`research/checks-extraction-shared.md`; the family checks spec's trace table).
- The family rule's lead-in: "each spec states the imports its directives need as documented usage" gains "(in an Imports bullet, or through its usage examples, which import every directive they write; the architecture guide's P24)". Six multi-directive specs (Responsive Toggle, Slider, Sticky, Switch, Table, Tabs) have no Imports bullet, and P24 asks only that usage examples import what they use; the smaller fix is here, not six new bullets.
- Messages, M9: "The Variant tooling's M9:" -> "The Variant tooling's M9 in this tool's form:"; the tooling spec's M9 reads "the <generator, schematic, or builder> needs <package>. Install it: npm install --save-dev <packages>".
- Testing Decisions, layer 4: "(P23)" -> "(ADR 0018)". P23 no longer says that the static Storybook build runs in production mode; ADR 0018's consequence does. Audit 0009's L3 made the same fix in the Runtime checks spec.
- Closing section, lead-in: a sentence that a quoted line naming a directive of a family ticket 174 moved (`nfsShowForSr` in the Orbit's, `nfsTextAlign` in the Pagination's, the Visibility Classes' in the Abide's, the Flexbox Utilities' in the Media Object's, the XY Grid's cell in the Sticky's) comes back naming Foundation's class while the spec writes it as a normal class (174, decision 2).
- Closing section, Breadcrumbs and Pagination: "the declaration-site note's "and warns in development" (115)" -> "the declaration-site note (115), which the first milestone dropped, restored after the Placement bullet ..."; the same for Pagination (120). Neither current spec has the note.

## specs/family-checks.md

Read in full. Amendment home: [Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md).

Checks: 1 holds (the one example is library code). 2: no Milestone line in the header; fixed. 3: every quote is verbatim against `53144f3` (checked by script); fixes below. 4: building-blocks 1.9 and P23 citations fixed. 5: Nx 23.2 missing; fixed; the rest holds. 6 holds (the example is a `@Directive` whose imports match its code). 7: see Verification.

Changes:

- Header: "Targets Angular 22.2, Storybook 10.6" -> "Milestone: later. Planned and implemented in a later milestone ..., by the user's ruling in [Decide: checks move to a later milestone]. Targets Angular 22.2, Nx 23.2, Storybook 10.6" (the ticket's checks 2 and 5).
- Solution, The kind and its boundary, F3, F4: "building-blocks 1.9's rule" -> "at `53144f3`"; "(building-blocks 1.9 allows `contentChildren` for development validation only)" -> "at `53144f3` allowed"; "(building-blocks 1.9, "A check that only reports placement reads the DOM alone"" -> "at `53144f3`". Building-blocks 1.9 now says none of the three (its Ordered children bullet: "`contentChildren` is used only where a component renders its template from its content").
- The kind and its boundary: after "The 43 checks below come from 24 component specs." a sentence naming the ten checks of families ticket 174 moved, which land with or after those families.
- Hierarchy block and F3: the Flexbox Utilities' development-only `ElementRef`, `InteractivityChecker`, and `NfsMediaQuery` (the Flexbox Utilities spec at `53144f3`, line 133 and D15), which the current spec no longer has.
- F5: "the Off-canvas panel's check 3 (both parts)" -> "(part b here; part a, a misuse warning, by the same rule in its spec)", as this spec's Off-canvas entry says.
- Responsive Toggle, documented usage: the unquoted fragment "reference a menu declared in the same template" -> the Responsive Toggle spec's usage rule 3, quoted as it stands.
- Testing Decisions, layer 4: "(P23)" -> "(ADR 0018)", as above.
- Adding the checks back: Abide "WCAG table row 3.3.1" -> "1.4.1" (the 1.4.1 row named check 4 at `53144f3`); rows gain the stories, WCAG rows, and decisions that named a check at `53144f3` (Drilldown story 18; Dropdown rows 2.1.1 and 2.4.3/1.3.2; Flex Grid stories 27 to 30, D9, D10; Flexbox Utilities D15; Nested menu D30; Off-canvas row 1.4.10; Orbit story 42; Responsive Menu story 19; Slider story 41; Sticky story 23, D12; Switch D15; Top Bar story 20; Visibility Classes story 19, D10; XY Grid story 31, D16), and the Flex Grid's story 18 and the Switch's stories 4 and 21, which never named a check, go; the In-family fragments in six rows are marked as coming back with the forgotten-import checks' In-family line, so no sentence is restored by two specs.
- Kept: F9's quote of P23 is dated at `53144f3` by the sentence it sits in, so it stands.

## specs/misuse-warnings.md

Read in full (a CRLF file; its line endings are kept). Amendment home: [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md).

Checks: 1: the usage example's `class="is-active"` is the labelled copied-class case; holds. 2: no Milestone clause; fixed. 3: names hold against the component specs; the ruling-174 conflicts and the adds-back entries are fixed below. 4: four citations fixed. 5: Nx 23.2 and TypeScript 6.0.x missing; fixed. 6 holds (the examples are HTML with no `@Component`). 7: see Verification.

Changes:

- Header: adds "`@angular/cdk` 22.2, Nx 23.2, TypeScript 6.0.x" and "Milestone: later.".
- S1: "a Foundation class copied from Foundation's markup is reported in development, naming what to bind" -> "is named by a usage rule with what to bind; this check reports such a copy in development" (building-blocks 1.4 now states a usage rule). S2: "Where the host can take focus when it is inserted" gains "(a usage rule of building-blocks 1.4 in the first milestone)". S7: "among the misuses a directive reports" -> "among the misuses the compiler cannot see, which the first milestone states as usage rules" (P23: "the library reports none of them"). S9: "and the deep-linking inputs warn in development" -> "which each deep-linking input's spec states as a usage rule; the deep-linking inputs warn" (building-blocks 1.5).
- S1, Not reported; Button Group 5; Media Object 1; Testing Decisions layer 1: a class of a family ticket 174 moved is a normal class until that family's spec lands, so the clauses that report one (Button Group 5's `align-*`, Media Object 1's `align-*` and `align-self-<y>`, the Flexbox classes in Flex Grid 1 and XY Grid 1) land no earlier than it; "The stories write no Foundation or library class and no misuse" -> "no misuse, and no Foundation or library class but the normal classes of a family with no first-milestone spec". Evidence: the Button Group's D9 ("Flexbox alignment is Foundation's `align-*` class, written by the consumer as a normal class") and the Media Object's D4 now have the consumer write these classes (174, decision 3). Impact MEDIUM (without it the later milestone would warn on documented usage), confidence HIGH. Decided.
- Off-canvas check 6: "hide it at that breakpoint with `nfsVisibility` of the Visibility Classes spec" -> "with Foundation's `hide-for-<bp>` class as the Off-canvas spec's documented usage 6 writes it, or with `nfsVisibility` once the later-milestone Visibility Classes spec has landed".
- Drilldown 7: "`js-drilldown-back` on a back item, are redundant in drilldown mode, stripped in the other modes" -> "`js-drilldown-back`, the back item's static host class, merges in every mode". The Drilldown spec's mapping row and D7 make it a static host class, which no binding strips; its usage 7 and D28 say otherwise (P1).
- Common contract 6: the list of entries that share the read phase gains the Button, Button Group, and Off-canvas (the Runtime checks spec's entries for all three).
- WCAG 2.2 AA table, 4.1.2: gains "Forms (`NfsFormLabel`, `NfsInputGroupField`)", whose messages name 4.1.2.
- Orbit's unknown `selected`: "(unnumbered, in the Behaviour rules)" -> "(unnumbered, in the API bullet on `next()` and `selected`; now Documented usage 9)"; the Orbit spec has no Behaviour rules section, then or now.
- Out of Scope, rejected checks: adds the Typography Helpers' (D7, D8, D11, D12, D21, D22), Visibility Classes' (D10, D13, D14), and Toggler's (D17) rejected checks, which the re-runs removed from their decision rows.
- What the later milestone adds back: the Abide heading is "Foundation behaviour dropped or changed"; 22 entries (Menu to XY Grid) now name the stories and decisions that named a warning at `53144f3` and drop those that never did (for example the Smooth Scroll's "user story 51", which does not exist: the spec has 37).

## specs/runtime-checks.md

Read in full. Amendment home: [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md).

Checks: 1 holds. 2: no Milestone line; fixed. 3: every handle, input, mixin, property, and message holds; fixes below. 4 holds. 5 holds (all six versions). 6 holds (the `NfsCallout` example is library code; the `appConfig` example imports its providers). 7: see Verification.

Changes:

- Header: "Milestone: later." before "Planned and implemented".
- Milestone and what this spec needs, the registry bullet: adds that the registries and Variant properties of the eight families ticket 174 moved go with those families (its decision 4), and their entries land no earlier. The Flexbox Utilities entry: "`--nfs-flex-source-ordering-count` is the first milestone's registry property" -> "the Flexbox Utilities spec's registry property". Rendered output: "the registry Variant properties and `--nfs-breakpoint-classes` of the first milestone" -> "(the first milestone's, and the eight later families' with their own specs)". Out of Scope: "are first-milestone Sass" gains "apart from the eight later families' registries". D4 gains that those families' requests land no earlier than their specs. The Variant declaration tooling spec's Later milestone section lists these registries. Ticket 162's decision 6 says the same of the first milestone; it is a record of its day and is left as written.
- Milestone and what this spec needs, and D4: "Whichever of the two specs ... brings the configuration of this spec" -> this spec brings the whole configuration, the forgotten-import checks spec only its two keys, `provideNfsRuntimeChecks`, and the checker token, as that spec's The two `NfsRuntimeChecks` keys says.
- User Stories: story 36, the Typography Helpers' story 5 at `53144f3` ("a development report when a rules key names a Class breakpoint my compiled CSS lacks"), which the manifest missed; the Typography Helpers entry and its adds-back row name it.
- Testing Decisions, the Button Group case: "naming `NfsButtonGroup`" -> "naming `nfsButtonGroup`", the handle's name (`directive` is the selector name).
- Adds back, the menu-roots row: the Responsive Menu's two sentences, in CSS class to Angular mapping and in API (the API sentence reads "declared, typed, and reported to the runtime checks by the [Spec: Menu]").
- Design decisions, closing list: adds the Flex Grid's D12 and the Float Grid's D10 and D12, which the entries cite.

## specs/build-time-checks.md

Read in full. Amendment home: [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md).

Checks: 1 holds. 2: no Milestone line; fixed. 3: every mixin, setting (checked against Foundation 6.9's `scss/`), and tooling name holds; the fixes below are statements and adds-back lists. 4 holds (ADR 0039's body names "compile-time check its documented markup lacks" with a dated note; P17 names the exact formula). 5: Storybook 10.6 missing; fixed. 6 holds (SCSS and CLI examples only). 7: see Verification.

Changes:

- Header: "Milestone: later."; "Storybook 10.6 with `@storybook/angular-vite`" among the targets.
- What the later milestone adds, and what the first milestone keeps: a paragraph saying that, for the families ticket 174 moved (here the Prototyping Utilities and the Typography Helpers, and markers P2 and P4), what this spec says the first milestone keeps is that family's own later spec's. This covers the two entries' "First milestone:" lines and line 600's "The other mixins keep their registry Variant properties in the first milestone".
- Top Bar, Decisions: drops "; the Prototyping Utilities keep one umbrella mixin, ..., as [Decide: the Prototyping Utilities' Library mixin] ruled" from D7; neither the Top Bar's D7 at `53144f3` nor now says it, and S2 already states it.
- menu/1 gains "Decisions: D13 (...)" (the Menu's D13 at `53144f3`); nested-menu gains D21 ("Compile-time `@error` for arrow contrast and toggle size" at `53144f3`); table/1's Tests gain the three cases the Table spec gave at `53144f3`, one of them an exact-helper pin that S1 says stays; the Pagination's first-milestone sentence follows the Pagination spec's D9 ("has no effect on the library's markup"); the P1 row cites "Sass items 2 and 6" (item 6 writes the property); the Top Bar's quoting list adds Magellan.
- Presence markers: the pointer to the tooling spec's "Settings that are deliberately not registries" says its flags bullet reads nothing for them. Check mode: a sentence after the drift table that the counts row, M7's count clause, and the non-literal-count case apply once the tooling spec's Later milestone item 3 exists; M3's sentence cites that spec's core step 3 and D8.
- Source map: the shared row keeps its manifest heading `nfs-prototyping-utilities` with a note on the new name; manifest f's "not present for Triggers" heading is listed and the count says three such headings.
- What the later milestone adds back: 31 entries name the sentences, stories, and decisions that named a check at `53144f3` and drop the stories that never did (for example the Abide's story 41, the story gate, unchanged since).

## Checks each spec still has exactly one home

The helpers diffed every `### <kind>:` heading of the seven manifests against each spec's trace table: forgotten-import 55 entries quoted, family 54 headings, misuse 213 entries, Runtime 35 headings, build-time a 6, b 12, c 3, d 15, e 6, f 4 plus three "not present" headings, shared 29. No check is held by two of the five specs: the fourteen misuse-classified boundary cases stay in the misuse warnings spec (the family checks spec's D12), the Off-canvas check 3 is split by part as both specs record, and M5 (a part outside its parent) is the forgotten-import checks' report with the family checks spec's F9 as its rule. The only near hit, misuse Table 2 (a stacked table's computed `display: none`), is a DOM check, not table/1's Sass `@error`.

## Proposals

P1. `specs/drilldown-menu.md`, documented usage 7 and D28 (another group's spec).
- Current text, usage 7: "a copied `drilldown`, `is-drilldown`, or `js-drilldown-back` is redundant in drilldown mode and stripped in the other modes"; D28: "a copied `drilldown`, `is-drilldown`, or `js-drilldown-back` is redundant in drilldown mode and stripped elsewhere".
- Replacement, usage 7: "a copied `drilldown` or `is-drilldown` is redundant in drilldown mode and stripped in the other modes, and a copied `js-drilldown-back` merges with the back item's static host class"; D28: "a copied `drilldown` or `is-drilldown` is redundant in drilldown mode and stripped elsewhere, and a copied `js-drilldown-back` merges with the back item's static host class".
- Why: the same spec's mapping row gives `js-drilldown-back` as the "Static host class on `NfsDrilldownBack` ... a copied one merges", its Host line binds `class="js-drilldown-back"` statically, and D7 says "binding `js-drilldown-back` statically"; building-blocks 1.4: "Structural classes written redundantly merge with the directive's static `host` class". The spec had the same split at `53144f3`. Impact LOW (documentation of a redundant class), confidence HIGH.

Not proposed, noted for the closing pass: manifest a's Abide family entry names WCAG row 3.3.1 where 1.4.1 named the check, and ticket 162's decision 6 calls the eight families' registries first-milestone Sass; both are records of their day and the specs now say the right thing.

## Verification

`verify.mjs` in the group's scratchpad folder (`review180/g/`) runs over every file group g touched: the five specs, the five amendment homes, and this report. It checks the lines each file gained in `git diff` (this report in full): no non-ASCII character; no banned word in any inflection and no banned pair; every relative link resolves from its file; every expected edit is present (a list of fixed strings per file) and every replaced string is gone; CRLF files (`specs/misuse-warnings.md`, `issues/161-...`) keep CRLF on every line and LF files have none. A positive control plants a non-ASCII character, a banned word, the banned pair, and a dead link in synthetic input first; the run fails unless all four are found. Result: the positive control found all four planted defects; over the 11 files, 316 added or whole lines and 166 links were scanned, 68 expected edits and 14 removed strings were confirmed, and the run exited 0. An earlier run failed on one wrong expectation of the script's own (a string that was never meant to be in the build-time spec), which was corrected before the passing run.
