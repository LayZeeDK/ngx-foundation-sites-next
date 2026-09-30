# Consistency review of the later-milestone waves: group c (forms, value controls, and behaviour plugins)

Ticket: [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md), group c

Reviewer: group c's reviewer (Opus 5.5), with two lanes (Opus 5.5, high effort): one for the Sticky and Breakpoint service specs, whose part is folded in below and marked, and one that read the Slider and Orbit a second time in its own worktree (its one Slider finding was checked and applied in this checkout by the group's reviewer; its worktree copy is not used). Worked 2026-09-30. Read-only on every file outside the group's nine specs, their amendment homes, and this report.

## What was read

In full, by the group's reviewer: the ticket, `map.md` lines 1 to 163, [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), the four rulings ([Decide: an exportAs on every directive](../issues/156-decide-exportas-on-every-directive.md), [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md), [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)), [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md), `building-blocks.md` Part 1 (1.1 to 1.14) and Tables A and B and Table D up to its Prototyping Utilities row, and the specs `abide.md`, `forms.md`, `switch.md`, `slider.md`, `orbit.md`, `interchange.md`, and `equalizer.md`.

Searched, not read in full (each search named in the spec's check 3 or 4 line): `adr/0018` and `adr/0022` (body and dated notes), `architecture-guide.md` (the P20 to P26 headings), `CONTEXT.md` (the Switch terms), `storybook-conventions.md` (section 8 heading), and the owning specs of borrowed names: `button.md`, `callout.md`, `nested-menu.md`, `progress-bar.md`, `responsive-accordion-tabs.md`, `tooltip.md`, `variant-declaration-tooling.md`, and `breakpoint-service.md` (its consuming-directive rules and type table, read at those lines).

A mechanical sweep over the seven specs: every `class="..."` value (each one is rendered output, a labelled copied-class case, a class of a family with no first-milestone spec, or an Application class), the check vocabulary (only Angular's own `ngDevMode` hydration stats and Aria's own development log match), every directive name of the eight later-milestone families (none), and every link to the eight later-milestone specs or tickets 99 to 106 and 160 to 164 (none). Positive control for the searches: `nfsCallout` in `abide.md`, 18 lines.

The seven checks are the ticket's: 1 class rule, 2 milestones, 3 cross-spec names, 4 shared documents, 5 standing preferences, 6 shape and examples, 7 hygiene.

## Abide (`specs/abide.md`)

Read in full.

1. Class rule: holds. The consumer writes Foundation's `show-for-sr`, `grid-x`, `cell`, and cell sizes as normal classes only, each labelled; every other class in the file is rendered output or the labelled copied State class case.
2. Milestones: holds. No check is named; ADR 0026's dated note is met (every label and Form error resolves a field, every field that can show an error has a Form error: API, `NfsAbideLabel` and `NfsFormError` documented usage); the Visibility and grid classes are marked as families a later milestone adds directives for.
3. Cross-spec names: holds. `nfsCallout` with `color`, entry point `ngx-foundation-sites/callout` ([Spec: Callout](../issues/89-spec-callout.md)); `nfsButton`, `color`, `disabledInteractive` ([Spec: Button](../issues/37-spec-button.md)); `nfsHelpText`, `nfsFormLabel` with `middle`, the four input group directives, and `forms--field-contrast` ([Spec: Forms](../issues/98-spec-forms.md)); the Responsive Accordion Tabs' `hydrate on interaction` advice.
4. Shared documents: holds. Building-blocks 1.10's Abide bullet (the three settings and the 3:1 focus-border rule with 3.74:1 and 1.31:1), 1.4's `accessible` rule, 1.5's reverse-link exception, 1.9's Imports rule, Table A's Abide row.
5. Standing preferences: holds (targets, Implementation level with its reason, rendering modes, WCAG 2.2 AA, animation, the four layers in ADR 0018's wording).
6. Shape and examples: holds. The seven sections in order, the Material comparison under Implementation Decisions and the design decisions under Further Notes; `app-signup` and the Reactive Forms example import exactly the library directives their templates write.
7. Hygiene: holds.

No change.

## Forms (`specs/forms.md`)

Read in full.

1. Class rule: holds (the text-alignment, float, XY grid, and flex alignment classes are written as normal classes, each in its own mapping row).
2. Milestones: holds.
3. Cross-spec names: one fix. The Abide names hold; `NfsSlider`, `NfsSliderFill`, `NfsSliderHandle`, Button D11, Switch D12, and the tooling's `nfsVariantBoolean` hold.
4. Shared documents: holds; D11's "ADR 0022: a failing Foundation default is met by the Sass settings the spec states" is ADR 0022's 2026-09-29 note.
5. Standing preferences: holds.
6. Shape and examples: holds; `app-donate` imports exactly the seven directives it writes.
7. Hygiene: holds.

Change:

- Problem Statement, the focus-border bullet: "(the Abide spec's required `$dark-gray`)" becomes "(the `$dark-gray` this spec requires, Sass item 2)". Since the class-rule wave the resting field border is this spec's required setting, and the Abide spec says so itself (its D15 and D22: "the resting field's settings are the Forms spec's"). Impact LOW, confidence HIGH. Amendment in [Spec: Forms](../issues/98-spec-forms.md).

## Switch (`specs/switch.md`)

Read in full.

1. Class rule: one fix. The examples write no Foundation class; the Notes write the XY Grid's classes as normal classes.
2. Milestones: holds; D16's "(P23)" is the guide's "Every misuse a type cannot catch is stated as documented usage", not a check.
3. Cross-spec names: holds (the Forms' `nfsFormLabel` and `nfsHelpText`, the Abide directives, the Slider's rule 13 and D20, the Off-canvas' reduced-motion rule, the Callout's `$closebutton-color: #767676`, the Progress Bar's computed-contrast story).
4. Shared documents: holds (building-blocks 1.10's Switch and Forced colours bullets; the glossary's Switch, Switch paddle, and Inner label, D18).
5. Standing preferences: holds.
6. Shape and examples: holds; `app-caption-settings` imports what it writes.
7. Hygiene: holds.

Change:

- Problem Statement, the class-rule bullet: "the developer writes no Foundation class at all" becomes "the developer writes no Foundation class of a family with a first-milestone spec", the wording audit 0010's L1 gave the same sentence in thirteen specs; the spec's Notes write `class="grid-x"` and `class="cell"` under ADR 0039's exception (decision 3 of the families ruling). Impact LOW, confidence HIGH. Amendment in [Re-run: Switch spec, out-of-scope survivors](../issues/147-rerun-switch-out-of-scope-survivors.md).

## Slider (`specs/slider.md`)

Read in full.

1. Class rule: one fix (the data binding example writes the XY Grid's classes as normal classes and says so; the stories write none; the mapping's lead sentence did not name the exception).
2. Milestones: holds; audit 0009's L9 ("Not automated (axe has no 1.4.11 rule)") is in place; the Sass compile tests are the library's own tests.
3. Cross-spec names: holds (the Switch's D9 ring, the Button's `disabledInteractive`, the Nested menu's `span[nfsSubmenuToggleText]` shape, the Top Bar's measured `color-luminance()` pairs).
4. Shared documents: holds (building-blocks 1.4's Variant rules and initial-state rule, 1.5's direction exception, 1.10's Forms and Forced colours bullets, Storybook conventions section 8).
5. Standing preferences: holds.
6. Shape and examples: holds; the Material comparison is "Comparison with Angular Material (`MatSlider`, 22.2)" under Implementation Decisions; `app-filters` imports the three directives and `FormField` it writes.
7. Hygiene: holds.

Change (a second, independent read of the Slider in a worktree found it; the group's reviewer checked it and applied it here):

- CSS class to Angular mapping, the lead sentence: "No Foundation or library class is left for the consumer to write" becomes "No Foundation or library class of a family with a first-milestone spec is left for the consumer to write". The data binding example writes `grid-x grid-margin-x` and `cell small-*`; decision 1 of [Re-run: specs without the later-milestone families, group c](../issues/178-rerun-specs-without-later-families-group-c.md) names the exception in each class-rule sentence, and audit 0010's L1 narrowed the Orbit's matching sentence the same way. Impact LOW, confidence HIGH. Amendment in [Re-run: Slider spec under the class rule](../issues/124-rerun-slider-class-rule.md).

## Orbit (`specs/orbit.md`)

Read in full.

1. Class rule: holds (`show-for-sr` is the one written class, labelled in the mapping, the Rendered HTML, and D26).
2. Milestones: holds; the only "development" wording is Aria's own log.
3. Cross-spec names: holds (the Button's `size` and `fill="hollow"`, the Progress Bar's D16, the Switch's D12, the Slider fill's shape, the Breakpoint service's user story 11).
4. Shared documents: one fix, against building-blocks 1.9's Imports rule and the fact audit 0009 measured.
5. Standing preferences: holds.
6. Shape and examples: holds; `app-gallery` imports the thirteen Orbit directives, `NfsButton`, and `NgOptimizedImage`, all of which its template writes.
7. Hygiene: holds.

Change:

- Hierarchy and DI shape, the Imports bullet: "(`[value]`, `[timerDelay]`, `[(selected)]`) fails to compile with NG8002" becomes "(`[value]` on a slide, `[timerDelay]`, `[(selected)]`) fails to compile with NG8002 ...; a bound `[value]` on a bullet's `button` still compiles and sets the button's native `value`". The DOM schema checker reports an unclaimed property only where the element has no such property, and `value` is a native property of `button`, as audit 0009 measured for `[type]` on a `button` (its question 1 and M4); the slide is a `div`, which has none. Impact LOW (a documented-usage sentence), confidence HIGH. Amendment in [Re-run: Orbit spec under the class rule](../issues/125-rerun-orbit-class-rule.md).

## Interchange (`specs/interchange.md`)

Read in full.

1. Class rule: holds (audit 0010's H1 is in place in all six places).
2. Milestones: holds.
3. Cross-spec names: one fix. `nfsDefaultNamedQueries`, `atLeast`, `matches`, `get`, decision 16, and consuming-directive rule 1 hold against the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md); `nfsCallout` and `nfsTable hover` with its caption hold.
4. Shared documents: holds (building-blocks 1.2's image rule, 1.5's rendered-state rule, 1.9's hosting rule, 1.11 decisions 1 and 7).
5. Standing preferences: holds.
6. Shape and examples: holds; `app-product-table` imports `NfsTable`, the one library directive it writes.
7. Hygiene: holds.

Change:

- ARIA and keyboard, the "Swap while focused" and "Announcements" rows: "Breakpoint service spec, ARIA rule 1" and "Breakpoint service spec, ARIA rule 4" become "consuming-directive rule 1" and "consuming-directive rule 4". The owning spec numbers these rules under "ARIA requirements imposed on consuming directives" and calls them consuming-directive rules throughout, as this same table's row already does and as R52 of the class-rule review settled. Impact LOW, confidence HIGH. Amendment in [Re-run: Interchange spec under the class rule](../issues/127-rerun-interchange-class-rule.md).

## Equalizer (`specs/equalizer.md`)

Read in full.

1. Class rule: holds (the grid, flex helper, and float grid classes are written as normal classes, each in its own mapping row; the Callout, Card, Toggler, and Button classes come from their directives).
2. Milestones: holds; audit 0009's L6 and M4 are in place.
3. Cross-spec names: holds for the Callout, Card, Toggler, and Button names and for the Breakpoint service's `is()` (`''` answers `true`). One type disagreement between records and three specs is Proposal P1 (not edited here).
4. Shared documents: holds (building-blocks 1.5, 1.7, 1.9, 1.11 decisions 6 and 7).
5. Standing preferences: holds.
6. Shape and examples: holds; `app-legacy-panels` imports `NfsEqualizer`, `NfsEqualizerWatch`, and `NfsCallout`, which it writes; `app-product-tile` writes no directive in its template and hosts two.
7. Hygiene: holds.

No change.

## Sticky (`specs/sticky.md`) (lane)

Read in full by the lane, with the owning specs searched at each borrowed name (Top Bar, Callout, Thumbnail, Button, Off-canvas, Smooth Scroll, Responsive Toggle) and building-blocks 1.1, 1.4, 1.5, 1.9, and 1.11 and Storybook conventions section 5 read at source. The group's reviewer checked both edits in the diff.

1. Class rule: holds (only the XY Grid's and the Prototyping Utilities' classes are written, under the exception, with Prototype mode named as audit 0010's M1 asked).
2. Milestones: holds.
3. Cross-spec names: one fix (S1).
4. Shared documents: one fix (S2).
5. Standing preferences: holds.
6. Shape and examples: holds (no `@Component` example).
7. Hygiene: holds.

Changes:

- S1, the WCAG table's 1.4.3 row: "The Top Bar spec's required `$topbar-background: $white` is opaque;" becomes "The Top Bar spec's example of its required bar background, `$topbar-background: $white`, is opaque;". The [Spec: Top Bar](../issues/86-spec-top-bar.md) requires a bar background on which `$anchor-color` reaches 4.5:1 and gives `$white` as its example. Impact LOW, confidence HIGH.
- S2, Testing Decisions, the Story ids paragraph: the preview stylesheet "includes `foundation-sticky`, `nfs-sticky`, and `nfs-breakpoint-properties` (and, for the title bar of `sticky--navigation`, the Top Bar spec's title-bar lines it already has)" becomes "includes `foundation-sticky` and the title-bar rules of `sticky--navigation` through `foundation-everything`, then `nfs-breakpoint-properties` and `nfs-sticky` (Storybook conventions, section 5)". The conventions' `preview.scss` prints both export mixins through `foundation-everything`, and it holds no "title-bar lines". Impact LOW, confidence HIGH.
- Amendment in [Re-run: Sticky spec under the class rule](../issues/120-rerun-sticky-class-rule.md).

## Breakpoint service (`specs/breakpoint-service.md`) (lane)

Read in full by the lane, with the owning specs searched at each borrowed name (Top Bar, Button Group, Menu, Responsive Menu, Responsive Toggle, Tooltip, Equalizer, Interchange, Accordion, Tabs, Drilldown Menu, Orbit, Dropdown, Variant declaration tooling) and building-blocks 1.3, 1.4, 1.7, 1.9, 1.11, and Table C read at source. The group's reviewer checked all four edits in the diff and B3 against the three specs it names.

1. Class rule: one fix (B1, B2).
2. Milestones: one fix (B4); D24's "a later milestone adds directives for those classes" is the allowed form.
3. Cross-spec names: one fix (B3).
4. Shared documents: holds apart from B1 and B2.
5. Standing preferences: holds.
6. Shape and examples: holds; `ProductList` writes no library directive; the design decisions jump from 26 to 32 on purpose (ticket 129 records the removed numbers are not reused).
7. Hygiene: holds.

Changes:

- B1, Problem Statement, the class-rule bullet: `.show-for-medium` leaves the list of classes "set by directives from typed inputs", because it is a Visibility class the consumer writes in the first milestone (map, Later-milestone families; ADR 0039's note of 2026-09-30). Impact LOW, confidence HIGH.
- B2, Solution, the paragraph on looks that change per breakpoint: the owners gain "the Responsive Toggle's `hideFor`", and "except the visibility classes" becomes "except the visibility classes on its own elements", because a first-milestone directive that binds a Visibility class for its own behaviour keeps binding it (building-blocks 1.7; ADR 0039's note). Impact LOW, confidence HIGH.
- B3, the two-type table, the `NfsBreakpointName` row: Tooltip `showOn`, Sticky `stickyOn`, and Equalizer `equalizeOn` move to "the name part of ... Breakpoint queries typed `string`", as the three specs declare them (`tooltip.md`, `showOn?: string`; `sticky.md`, `stickyOn` as `string`; `equalizer.md`, `InputSignal<string>`). Found by the group's reviewer, applied by the lane. Impact LOW, confidence HIGH.
- B4, the WCAG table's 1.4.4 row: "Foundation's `.show-for-medium` (set by a Visibility Classes directive from `showFor="medium"`)" becomes "(a Visibility class the fixture writes as a normal class, with Foundation's global styles loaded)", because a first-milestone spec named a later-milestone directive and its input (the families ruling, decision 2). Impact LOW, confidence HIGH.
- Amendment in [Re-run: Breakpoint service (shared utility) spec under the class rule](../issues/129-rerun-breakpoint-service-class-rule.md).

## Proposals

Links in quoted replacement text are written for the target document.

P1. The type of the Breakpoint query Options.

- File: `building-blocks.md` 1.3, the Variant types bullet (its last sentence).
- Current text: "`NfsBreakpointName` stays the type of behaviour Options (Tooltip `showOn`, Sticky `stickyOn`)."
- Replacement: "`NfsBreakpointName` stays the type of the breakpoint names in behaviour Options (Responsive Toggle `hideFor`, the Breakpoint rules keys, and the name part of Tooltip `showOn`, Sticky `stickyOn`, and Equalizer `equalizeOn`, which take a whole Breakpoint query such as `'medium up'`, `'all'`, or `''` and are typed `string`)."
- Why: the three specs declare `string` (`specs/tooltip.md`, `showOn?: string`; `specs/sticky.md`, `stickyOn?: string` in `NfsStickyDefaults`; `specs/equalizer.md`, `equalizeOn: InputSignal<string>`), and each takes a Breakpoint query, not a name. `NfsBreakpointName` is open (`string & {}`), so both types accept the same values and no consumer code changes; the record and the specs should still say the same thing. This now matches the Breakpoint service spec's table row (B3 above). The lane proposed the same change (its L2); this is the merged text, to apply once.
- Rating: impact LOW, confidence HIGH.

P2. The Breakpoint service decision that building-blocks 1.7 cites (from the lane).

- File: `building-blocks.md` 1.7, the Service bullet.
- Current text: "(Breakpoint service spec decision 14)"
- Replacement: "(Breakpoint service spec decision 5; its ticket's decision log, question 14)"
- Why: the spec's design decision 14 is "Invalid input"; the model the bullet cites (only `current` and `reducedMotion` are signals, the rest reactive reads) is its decision 5, "State model", taken from question 14 of the spec ticket's decision log. Checked by the group's reviewer in `specs/breakpoint-service.md`, the rows of decisions 5 and 14.
- Rating: impact LOW, confidence HIGH.

P3. A later-milestone input as the general example (from the lane).

- File: `building-blocks.md` 1.7, the CSS-first bullet.
- Current text: "A responsive Variant input takes a Breakpoint query for an on or off class (`showFor="large only"`, `expanded="medium down"`)"
- Replacement: "A responsive Variant input takes a Breakpoint query for an on or off class (the Menu's `expanded="large"`, the Button's `expanded="medium down"`)"
- Why: `showFor` is the input of `nfsVisibility`, a later-milestone family's directive; the rule's example should use a first-milestone input. The Menu's `expanded` is `NfsVariantBoolean | NfsClassBreakpointQuery<'up'>` (`specs/menu.md`, its `.expanded` mapping row, checked by the group's reviewer), so `"large"` is a valid value.
- Rating: impact LOW, confidence HIGH.

P4. The Slider's rule 13 as the Progress Bar's rejected alternative (from the worktree lane).

- File: `specs/progress-bar.md`, D16, the Rejected alternative (outside group c).
- Current text: "A `forced-colors: active` rule painting the meter in `Highlight` with a `CanvasText` track outline, as the Slider's rule 13 does for its thumb (additive later)"
- Replacement: "A `forced-colors: active` rule painting the meter in `Highlight` with a `CanvasText` track outline, as the Slider's rule 13 does for its fill and track (additive later)"
- Why: the Slider's rule 13 paints the fill `Highlight` and the track edge a `CanvasText` outline; its thumb is `CanvasText` (`specs/slider.md`, rule 13 and D20). Checked by the group's reviewer.
- Rating: impact LOW, confidence HIGH.

## Verification

A Node script, `verify.mjs` with its file list `verify-files.json` in the group's scratchpad folder (`review180/c/`), ran over the fifteen files group c touched (the seven changed specs, the seven amendment homes, and this report). For each file it takes the lines added since `HEAD` (every line of this new report) and checks: no non-ASCII character; no banned word and no banned pair on one line; every relative link resolves from the file's own folder (inside this report's Proposals section, where quoted text is written for its target document, links are not resolved, and the quoted targets were checked by hand: `issues/...` from `building-blocks.md` and `../issues/...` from `specs/`); the file's stored line ending is kept (a CRLF file has no bare LF, an LF file no CR); and every edit listed for it is present and the text it replaced is gone. Positive control: a synthetic input with one banned word, one non-ASCII character, one broken link, and one line holding the banned pair must give exactly four findings, and does. Result: exit 0. The lane's own script over its four files also exited 0 with its positive control. Nothing was committed or staged.
