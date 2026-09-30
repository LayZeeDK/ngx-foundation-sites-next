# Consistency review of the later-milestone waves: group b, disclosure and overlays

Ticket: [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md), group b

Reviewer: Opus 5.5, 2026-09-30. Scope: the ten specs of group b and their amendment homes. Every change is recorded in the spec's amendment home under `### Amendment, 2026-09-30 (consistency review of the later-milestone waves)`.

## What was read

Read in full: the ten specs below; [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md); `map.md` lines 1 to 163; [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md); [Decide: an exportAs on every directive](../issues/156-decide-exportas-on-every-directive.md), [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md), [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), and [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md); [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md) and [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md); [ADR 0018](../adr/0018-browser-testing-stack.md); `building-blocks.md` Part 1 (1.1 to 1.14).

Read in part or searched: `building-blocks.md` Table B and Table C rows of the group's plugins and utilities; `CONTEXT.md` lines 335 to 424 and a search for every glossary term the group's specs use; `storybook-conventions.md` sections 3, 4, and 8 and the checklist; the titles and dated notes of ADRs 0002, 0003, 0007, 0008, 0013, 0016, 0022, 0023, 0024, 0028, 0030, 0032, 0039, 0040, and 0046; the `README.md` rows of the ten specs; and, for check 3, the owning specs outside the group (Button, Button Group, Close Button, Callout, Menu, Top Bar, Responsive Toggle, Nested menu, Dropdown Menu, Sticky, Thumbnail, Breakpoint service, Variant declaration tooling), searched for the names, inputs, `exportAs` values, decision numbers, and Story ids the group's specs take from them. No primary source (Foundation, Angular, APG clone) was needed: every finding is a disagreement between documents of the bundle.

A script (`analyze.mjs`, in the reviewer's scratchpad) listed each spec's headings, links, non-ASCII characters, banned words, table rows, later-family names, and check wording before the reading; a second (`tables.mjs`) found table rows followed by a line GitHub-flavoured Markdown would add to the table, and bullets run together on one line.

## Per spec

### specs/accordion.md (read in full)

1. Class rule: holds; the examples and stories write the four directives and `nfsButton`, no class.
2. Milestones: holds; no check named or relied on; Aria's own development messages are named as Aria's; no later-family directive.
3. Cross-spec names: hold (`nfsButton` and its `size`, the Toggler spec's measured completion, ADR 0028).
4. Shared documents: one stale citation, fixed (change A1).
5. Standing preferences: hold (versions, Implementation level `@angular/aria` with its reason, rendering modes, WCAG 2.2 AA table, animation through a State class, the four layers).
6. Shape and examples: hold; the `app-faq` example imports exactly the six directives its template writes.
7. Hygiene: holds.

Change A1. Animation, the Completion bullet. Before: "This measures, as the Toggler spec does, instead of using building-blocks 1.6 rule 1's "declared duration", because `$duration` is the consumer's." After: "This measures, as building-blocks 1.6 rule 1 (since 2026-09-28) and the Toggler spec do, because `$duration` is the consumer's." Reason: building-blocks 1.6 rule 1 measures the duration since its 2026-09-28 note and no longer holds the quoted phrase (check 4). Impact LOW, confidence HIGH.

### specs/tabs.md (read in full)

1. Class rule: the vertical layout writes the XY Grid's classes as normal classes, which the ruling allows, but two sentences still said no class is written and the mapping had no row for them; fixed (changes T2, T3).
2. Milestones: holds; `foundation-xy-grid-classes` and "XY Grid row" name Foundation's layout, not a directive; Aria's duplicate-value warning is named as Aria's.
3. Cross-spec names: hold (the Accordion's lazy marker, ADR 0023, ADR 0037).
4. Shared documents: one stale citation of building-blocks 1.9, fixed (change T1), with proposal P1.
5. Standing preferences: hold.
6. Shape and examples: hold; `app-product` imports the seven directives and two application components its template writes; the Router recipe imports the six it writes.
7. Hygiene: holds.

Change T1. Hierarchy and DI shape, the first-tab default bullet. Before: "This is the one non-validation content query, justified by the server render (building-blocks 1.9 keeps queries for validation otherwise)." After: "This content query is justified by the server render; building-blocks 1.9's other `contentChildren` use is the Responsive Accordion Tabs' rendering query." Reason: building-blocks 1.9's clause "`contentChildren` is used only for dev-mode validation" was replaced on 2026-09-29, when the checks left the first milestone ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)), and now names only the Responsive Accordion Tabs' sections. Impact LOW, confidence HIGH.

Change T2. CSS class to Angular mapping. Before: "No class is left for the consumer to write (ADR 0039)." After: "No class of a family with a first-milestone spec is left for the consumer to write (ADR 0039)." plus a new row, "`.grid-x`, `.cell`, `.medium-3`, `.medium-9` around a vertical strip and its content box (another family's: the XY Grid's, with no first-milestone spec) | None: normal classes the consumer writes, with Foundation's global styles loaded (Rendered HTML, vertical tabs) | The class rule's exception ...". Reason: decision 3 of [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md) and ADR 0039's note of 2026-09-30; the Rendered HTML and the vertical usage example write these classes, and the Dropdown and Toggler specs already map the XY Grid classes they write (one row per class, the class-rule review's CR-B). Impact LOW, confidence HIGH.

Change T3. Testing Decisions, lead paragraph. Before: "No story, test host, or fixture writes a Foundation or library class on any element (ADR 0039):" After: "No story, test host, or fixture writes a Foundation or library class of a family with a first-milestone spec on any element (ADR 0039; `tabs--vertical` writes the XY Grid's classes as normal classes):". Reason: the same ruling; `tabs--vertical` writes those classes (audit 0010's L1 narrowed only the Solution's sentence). Impact LOW, confidence HIGH.

### specs/responsive-accordion-tabs.md (read in full)

1. Class rule: holds; neither the consumer's markup nor the component's template writes a class.
2. Milestones: holds; the XY Grid is named as Foundation's layout the component does not own; Aria's development messages are Aria's.
3. Cross-spec names: hold (every Accordion and Tabs directive, input, and decision number; the Breakpoint service's `resolve(rules, breakpoint)`, `serverBreakpoint`, and consuming-directive rule 4; ADR 0032).
4. Shared documents: hold (building-blocks 1.1 case 1, 1.4, 1.5, 1.9's rendering query, 1.11).
5. Standing preferences: hold.
6. Shape and examples: hold; `app-product` imports the component, the panel directive, and the application's `ReviewList`.
7. Hygiene: holds.

No change.

### specs/toggler.md (read in full)

1. Class rule: holds; the XY Grid row names the one later-family layout, which the examples leave out.
2. Milestones: holds.
3. Cross-spec names: hold (`nfsMenu`'s `expanded`, `nfsThumbnail`, `nfsCallout`, the Reveal spec's Motion types).
4. Shared documents: two stale citations, fixed (changes G1, G2).
5. Standing preferences: hold (Implementation level native platform with thin custom directives, and its reason).
6. Shape and examples: hold; `app-page` imports exactly the ten classes its template writes.
7. Hygiene: holds.

Change G1. Hierarchy and DI shape. Before: "(building-blocks Table B named one; nothing injects it)". After: "(the building-blocks sketch named one, and Table B now records none; nothing injects it)". Reason: Table B's Toggler row reads "no `nfsTogglerToken`"; the Dropdown spec already words its own token this way. Impact LOW, confidence HIGH.

Change G2. Animation, the Completion bullet. Before: "This refines building-blocks 1.6 rule 1's "declared duration": the length". After: "Building-blocks 1.6 rule 1 measures the same way since 2026-09-28 (it first said "declared duration"): the length". Reason: as change A1. Impact LOW, confidence HIGH.

### specs/reveal.md (read in full)

1. Class rule: holds; the docs' `.lead` is named as a normal class the examples leave out.
2. Milestones: holds.
3. Cross-spec names: hold (`nfsCloseButton`, `nfsCloseButtonToken`, the Callout's D9 and D10, the Off-canvas spec's restore fallback, `nfsLightDismiss` with group `null`).
4. Shared documents: hold (building-blocks 1.4 kinds, 1.5 services, 1.6 rules 1, 4, and 5, 1.10, ADR 0007's and ADR 0031's current notes).
5. Standing preferences: hold.
6. Shape and examples: hold; `app-account` and `app-color-picker` import what their templates write.
7. Hygiene: one table-tail defect, fixed (change R1).

Change R1. Further Notes, Sass. Before: the "Required settings (WCAG 2.2 AA 1.4.11; ...)" paragraph followed the rule table's row 8 with no blank line, so GitHub-flavoured Markdown renders it as a ninth row. After: a blank line between them. Reason: check 7 (table rows). Impact LOW, confidence HIGH.

### specs/off-canvas.md (read in full)

1. Class rule: documented usage 6 and the stories write `hide-for-<bp>`, `grid-x`, and `cell` as normal classes, which the ruling allows; two sentences still said no class is written and the mapping had no row for them; fixed (changes O1, O2).
2. Milestones: holds.
3. Cross-spec names: hold (Close Button D9, Top Bar D6, D8, and D13, `top-bar--title-bar`, `nfs-responsive-toggle`'s required argument, `nfsSticky` and `nfsStickyContainer`, the Breakpoint service's consuming-directive rule 1).
4. Shared documents: hold (ADR 0030 and its notes, building-blocks 1.5, 1.9, 1.10, 1.13).
5. Standing preferences: hold.
6. Shape and examples: hold; the examples are markup, with no `@Component`.
7. Hygiene: holds.

Change O1. Problem Statement and Solution. Before: "without writing any Foundation or library class, correct in every rendering mode" and "never a Foundation or library class ([ADR 0039]". After: "... any Foundation or library class of a family with a first-milestone spec, correct ..." and "never a Foundation or library class of a family with a first-milestone spec ([ADR 0039]". Reason: decision 3 of [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md); audit 0010's L1 narrowed only the mapping's lead sentence. Impact LOW, confidence HIGH.

Change O2. CSS class to Angular mapping: a new row, "`.hide-for-<bp>` on a Trigger outside the panel; `.grid-x` and `.cell` around the stories' absolute panels | Classes of families with no first-milestone spec (the Visibility Classes', the XY Grid's) | None: normal classes the developer and the stories write, with Foundation's global styles loaded (Documented usage, 6) | - | - | -". Reason: the same ruling; one row per class the spec's markup uses, as the class-rule review's CR-B asked. Impact LOW, confidence HIGH.

### specs/dropdown.md (read in full)

1. Class rule: the mapping's closing sentence and the Story ids paragraph said no class is written, beside the `.show-for-sr` and XY Grid rows and the `dropdown-pane--default` story that write them; fixed (changes D2, D3).
2. Milestones: holds; "the Float Classes' utility classes" names a family, not a directive, in a sentence that says they are not read.
3. Cross-spec names: hold (`nfsButton`'s `dropdown` and `arrowOnly`, `nfsButtonGroup` with the consumer's `role="group"`, the Anchored pane's types and rules, `NfsDropdownSizesOverrides` in the Variant declaration tooling, the entry point and Story ids `dropdown-pane`).
4. Shared documents: hold (building-blocks 1.4, 1.6 rule 4, 1.13, Table B's Dropdown row).
5. Standing preferences: hold.
6. Shape and examples: hold; `app-header` imports exactly the five directives and the application component its template writes.
7. Hygiene: two bullets ran together on one line, fixed (change D1).

Change D1. Rendering modes. Before: the "Open at first paint (`[isOpen]="true"`)" bullet began on the same line as the first bullet, right after its last sentence ("... the CDK services are resolved only there."). After: the second bullet on its own line. Reason: check 7. Impact LOW, confidence HIGH.

Change D2. CSS class to Angular mapping, below the Variant table. Before: "No class is left for the consumer to write (ADR 0039)." After: "No class of a family with a first-milestone spec is left for the consumer to write (ADR 0039)." Reason: the ruling's decision 3; the wording audit 0010's L1 gave the same sentence in the Label, Pagination, and Responsive Embed specs. Impact LOW, confidence HIGH.

Change D3. Testing Decisions, the Story ids paragraph. Before: "Stories write Foundation's elements and the library's directives and no Foundation or library class (storybook-conventions, ADR 0039):". After: "... no Foundation or library class of a family with a first-milestone spec (storybook-conventions, ADR 0039; the form grid of `dropdown-pane--default` writes the XY Grid's classes as normal classes):". Reason: the same ruling; the story's own entry says so. Impact LOW, confidence HIGH.

### specs/tooltip.md (read in full)

1. Class rule: holds; no later-family class is written anywhere.
2. Milestones: holds.
3. Cross-spec names: hold (`nfsButton`'s `size`, `fill`, `disabled`, and `disabledInteractive`; the Anchored pane's mapping row, which matches every Tooltip input and default; `nfsTooltipDescription` and `nfsTooltipTip` as `exportAs`).
4. Shared documents: hold (building-blocks 1.1 case 3, 1.10's `hidden` rule, Storybook conventions section 4's 414 px viewport).
5. Standing preferences: hold.
6. Shape and examples: hold; the examples are markup and TypeScript fragments, with no `@Component`.
7. Hygiene: holds.

No change.

### specs/triggers.md (read in full)

1. Class rule: holds; the Visibility classes in the mapping are bound by the Responsive Toggle, not written.
2. Milestones: holds; the Typing bullet states the unchecked case as documented usage, which ADR 0013's note of 2026-09-29 agrees with.
3. Cross-spec names: hold (Button, Close Button, Top Bar, Callout, Menu, Responsive Toggle, Reveal, Off-canvas, Dropdown pane, Toggler, and Tooltip names; the Story id prefix `dropdown-pane--`, which the Dropdown spec's D24 cites).
4. Shared documents: hold (building-blocks 1.5, 1.8, 1.9; ADR 0013).
5. Standing preferences: hold.
6. Shape and examples: one stale conditional in Testing Decisions, fixed (change Tr1); `app-header` and `app-confirm` import what their templates write.
7. Hygiene: holds.

Change Tr1. Testing Decisions, lead paragraph. Before: "Tests that need an Openable before the plugin specs exist use a test Openable:". After: "The Triggers' own tests use a test Openable, so they depend on no plugin directive:". Reason: every Openable spec is published, and the stories keep the test Openable; the sentence read as waiting on unpublished specs (check 6). Impact LOW, confidence HIGH.

### specs/anchored-pane.md (read in full)

1. Class rule: holds; `position-relative` is a normal class from Foundation's Prototype mode (audit 0010's M1).
2. Milestones: holds.
3. Cross-spec names: hold (the Dropdown's inputs, D6, D22, and D26; the Tooltip's inputs and defaults; the Nested menu's `NfsSubmenu`, `NfsMenuItem`, and `nfsTopBarRightToken`; the Dropdown Menu's dropped `disableHoverOnTouch`; the Reveal's non-modal Light dismiss entry).
4. Shared documents: hold (ADR 0002, ADR 0024, building-blocks 1.5 and 1.9).
5. Standing preferences: hold.
6. Shape and examples: one stale conditional in Testing Decisions, fixed (change AP1); the `NfsTooltipTip` example writes no directive.
7. Hygiene: holds.

Change AP1. Testing Decisions, lead paragraph. Before: "Tests that need a consuming directive before the Dropdown and Tooltip specs exist use test consumers:". After: "The utility's own tests use test consumers, not the Dropdown pane and Tooltip directives (D24):". Reason: both specs are published, and D24 keeps the test consumers for good (check 6). Impact LOW, confidence HIGH.

## Proposals

P1. `building-blocks.md` 1.9, the Ordered children bullet.

- File: `building-blocks.md`
- Current text: "`contentChildren` is used only where a component renders its template from its content (Responsive Accordion Tabs' sections)."
- Replacement text: "`contentChildren` is used only where a component renders its template from its content (Responsive Accordion Tabs' sections) and where a directive must write a default during the server render, which a collection sorted after the first render cannot give (the Tabs' first-tab default, `contentChildren(NfsTab, {descendants: true})`, [Spec: Tabs](issues/16-spec-tabs.md))."
- Why: the Tabs spec's `NfsTabs` queries its tabs to write the first-tab default during the server render (its Hierarchy and DI shape, and D6), a use building-blocks 1.9 has not named since the 2026-09-29 edit that removed "`contentChildren` is used only for dev-mode validation". Without it, the record that governs the spec forbids a query the spec decided and the prototype measured. Impact LOW (a statement of an existing decision), confidence HIGH.

## Triage

Every item above is impact LOW and confidence HIGH: each edit brings a sentence, a mapping row, or a citation into line with a ruling, an ADR note, or a building-blocks rule as they stand, and changes no input, default, class binding, or test. Nothing is OPEN FOR HUMAN.

## Verification

A Node script (`verify.mjs`, in the reviewer's scratchpad) checked every file this reviewer touched: the eight changed specs, the eight amendment homes, and this report. It compares each file with its `HEAD` version and checks the added lines: no non-ASCII character, no banned word or banned pair, every relative link resolves from the file it sits in (a link inside a quoted replacement from its target document), and every link to a ticket carries the ticket's title as its text. Over the whole files it checks that line endings are unchanged and not mixed, that no table row has a cell count other than its header's, and that no table is followed by a line that would join it. It also asserts that each of the 16 intended edits is present with its replaced text gone, and that each of the eight amendment homes carries the heading once. A positive control appends one banned word, one non-ASCII character, one broken link, and one wrong link text to an in-memory copy of this report and expects all four to be reported. Result: the control found all four; the real run found no problem and exited 0.
