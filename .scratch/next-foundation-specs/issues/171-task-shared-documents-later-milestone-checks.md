# 171. Task: shared documents for the later-milestone checks

Type: task
Status: resolved
Blocked by: 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170
Labels: wayfinder:task
Map: ../map.md

## Question

After the deferred specs exist and the other specs are rewritten, what must the shared documents say?

## How to work it

AFK, Sonnet 5 fixer. Apply the proposals of tickets 160 to 170 and the ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md): building-blocks (1.9's development warnings, every rule and row that relies on a check, Part 3's utilities), the architecture guide (every principle that states a check), the glossary (each check term marked as a later-milestone term), `storybook-conventions.md`, dated notes on ADRs 0012, 0040, 0044, and 0046 and on T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), the README (a later-milestone section listing the five deferred specs, and every count), and the map's gists. Then the wave audit follows (map, Audits).

## Inputs gathered by the orchestrator (2026-09-30)

The proposals to apply are the quoted shared-document changes in the Answers of tickets 160 to 170; where two conflict, the later ticket's Answer says which it replaces (ticket 162 replaces group a's items 9 and 10). Beside them:

1. `specs/variant-declaration-tooling.md` still names `$flexbox-responsive-breakpoints` (near line 128), a property the group b re-run removed.
2. The map's Out of scope line on base element styles still says `nfs-typography-base` checks those colours; that mixin left the first milestone.
3. ADRs outside the shared sweep's files also state checks and need a dated note each: 0004, 0005, 0011, 0013, 0019, 0022, 0028, 0034, 0037, 0038, 0039, 0042, 0043, beside 0012, 0040, 0044, and 0046.
4. [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) counted 25 Runtime and 190 misuse checks in the component specs; the Runtime checks spec counts 24 (group d's count table holds 5 entries, not 6). Correct the figure where the README or map repeats it.
5. The README's wave section, spec count (57 with the four new specs), and every ticket status in it; the map's gists for 160 to 170 are already in.
6. Boundary questions for the wave audit, not for this task: the "stands alone" report (M5) described in both the forgotten-import and family checks specs; the fourteen family-reading checks kept in the misuse warnings spec; the contrast pairs (Slider, Reveal, Table) that lost their only automated test.

## Answer

The shared documents now describe a first milestone with no check. Every rule a check enforced in building-blocks, the architecture guide, and the Storybook conventions is stated as documented usage, a usage rule, or a required setting, and none of those three documents names a deferred check or links a deferred spec, apart from the guide's dated P23 line, which links only [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md). The glossary keeps each check term and marks it as a later-milestone term. The README lists the five deferred specs in a section of their own. Seventeen ADRs each get one dated note, and T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) gets the note that decision 5 of the ruling asks for.

### What was applied, per document

- `building-blocks.md`:
  - 1.4: the `insertion` kind (161 item 1 and group e, merged), the initial-state bullet (161 item 2, group a item 3, and group e, merged), and the Runtime-check sentence of the Defaults and binding bullet (162 item 1).
  - 1.5 Ids (161 item 3 and group e, merged).
  - 1.6 rule 4 (group e's wording, which contains 161 item 4's).
  - 1.7: the source-of-truth bullet (group a item 1) and the Service bullet (162 item 2).
  - 1.8 (161 item 5).
  - 1.9: the parent handle (160 item 1), the projection ancestry (160 item 2), and the Imports bullet (164 item 1, merged with group e's token wording). The ordered-children sentence takes group d's wording, in place of 160 item 3 and group a item 2. The Defaults tokens sentence is dropped (162 item 3).
  - 1.10:
    - WCAG: 163 item 1, which covers group e's wording.
    - Names: 161 item 6 and group e.
    - Target size and non-text contrast: group a item 4, with 163 item 2's last clause.
    - Forms: group c item 1. Abide: group a item 5, which covers group c item 2.
    - Close Button: group b item 1, in place of group e's wording. Card: group b item 3. Flexbox Utilities: group b item 2, with 160 item 4's clause.
    - Progress Bar, Responsive Embed, and Prototyping Utilities: group d, which covers 161 item 7 for them. Top Bar and Typography Helpers: group f. Thumbnail and Table: group e. Float Classes: 160 item 5. Label, Badge, Sticky, Visibility Classes, and the `.code-block` line: 161 item 7.
  - 1.13: the Variant properties bullet (163 item 4, group a items 6 and 7, and group c item 3, merged), the declaration file bullet (163 item 5), the Runtime checks bullet removed (162 item 4), and the Tabs paragraph (163 item 6).
  - Table A: the Dropdown pane (group b item 4, which covers 161 and 162), Interchange (group c item 4), Slider (group e), and Orbit (164 item 2).
  - Table B: DropdownMenu (group b item 5), OffCanvas (162 item 7 and group d), Orbit (164 item 2 and group d), Reveal (group e), and Tooltip (161 item 8).
  - Table D:
    - Close Button, Callout, Card, Flex Grid, and Flexbox Utilities: group b items 6 to 10.
    - Menu, Media Object, Label, Forms, Float Grid, and Float Classes: group c item 5.
    - Table and Thumbnail: group e.
    - Pagination and Breadcrumbs: 164 item 2.
    - Every other row's family, misuse, Runtime, and build-time clauses: 160 item 6, 161 item 8, 162 item 8, and 163 item 7.
  - Part 3: five utilities, item 6 and Table C's forgotten-import row removed (164 item 2), and Table C's Breakpoint service row trimmed (162 items 5 and 6). Part 4, Decided item 2: 161 item 8.
- `architecture-guide.md`:
  - The building-block table (162 item 9, group c item 7).
  - Decision question 5 and P4 (160 item 7, with group d's clause).
  - P17 (161 item 9 and 163, merged) and P18 (162 item 10, group a item 8).
  - P22 (162 item 11).
  - P23, rewritten as "Every misuse a type cannot catch is stated as documented usage", with 161 item 9's dated line. This merges 160 items 7 and 8, 162 item 12, and 164 item 3's P23 clauses.
  - P24, as 164 item 3 gives it.
  - Conflicts item 3 (160 item 8).
- `CONTEXT.md`:
  - Family check (160 item 9), Misuse warning (161 item 12), and Usage rule (group e) are new terms.
  - Runtime check (162 item 13) and Breakpoint properties (162 item 14, in place of group a item 9's first half and 163's sentence) are changed. The Variant properties change is group a item 9's second half, as 162 item 15 says.
  - Forgotten import, Selector manifest, and In-family check (164 item 4) are changed. Variant declaration file and Declaration drift take group f's wording, which replaces 163's.
- `storybook-conventions.md`:
  - The preview includes: 163, group b items 11 and 12, group c item 6, group d, group e, and group f, merged.
  - The settings-override comments: 163, group e, and group f.
  - The required-setting sentence: 163.
  - Section 8's imports bullet and section 11's checklist item: 164 item 5.
  - Section 9's layer list: 161 item 13 and group e.
- ADRs: one dated bullet each, `2026-09-29 (Decide: checks move to a later milestone)`, at the end of Consequences:
  - 0005: 162 item 18, which replaces group a item 10.
  - 0011, 0013, 0038, 0042, and 0043: 161 item 11. For 0043, the misuse warnings spec holds the Nested menu root's check 6 (its D2), which settles 160's boundary case 1.
  - 0012: group a item 11, group c item 8, group f, 162 item 19, and 163, merged.
  - 0019: 160 item 11 and 161, merged.
  - 0022: 163, group a item 12, group c item 9, and group e, merged.
  - 0028: 160 item 11 and group a item 13, merged.
  - 0037: 160 item 11.
  - 0039: 161 item 10 and 163, merged.
  - 0040: 162 item 17, 163, 164 item 7, and group a item 14, merged.
  - 0044: 162 item 20.
  - 0046: 164 item 6.
  - 0004 and 0034: notes written here, because no proposal gave one. 0004's family checks and misuse warnings move. 0034's warnings are Aria's own.
- `README.md`:
  - Counts: 57 specs, five first-milestone shared utilities, and 66 research files, with the seven manifests listed.
  - A new "Later-milestone checks" section with the five deferred specs. It holds the forgotten-import row (moved, 164 item 8) and the rows of 160 item 12, 161 item 14, 162 item 21, and 163.
  - The Variant declaration tooling row's consumers (162 item 22).
  - The Forgotten imports list's item 3 (164 item 8).
  - The Open list line, and the wave section with every ticket resolved (input 5).
- `map.md`:
  - The Out of scope line on base element styles (input 2).
  - Ticket 159's gist line: the Runtime count is now 24 (input 4). That gist is the only place the README or the map repeats the figure.
  - The gist below, added to Decisions so far.
- [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md): T9's dated note (ticket 158's decision 5).

### Edits beyond the proposals

Each follows the ruling's rule: a check stated as a rule now states the documented usage.

- `building-blocks.md`:
  - 1.4: the "not reported" clauses, and the Tooltip's dropped `templateClasses` report.
  - 1.5 RTL: the Float Classes' and Float Grid's geometry checks.
  - The 1.10 bullets no proposal named: Button, Button Group, Callout, Pagination, Breadcrumbs, Switch, Badge, the Label's pick sentence, the Scroll regions bullet's two warnings, and Tabs.
  - 1.12 layer 2's "dev-mode warnings".
  - 1.13's heading line and 1.14 item 2's "runtime check".
  - Table A's Abide, Orbit, Responsive Toggle, Tooltip, and Button rows; Table B's Slider and Tooltip rows.
  - Table D's Button Group, Switch, Top Bar, Badge, Progress Bar, Responsive Embed, XY Grid, Prototyping Utilities, Visibility Classes, and Typography Helpers rows, and the "CDK in development" level cells.
  - Part 3 item 5's "check it in CI", and Table C's Nested menu row.
- `architecture-guide.md`: the Library mixin row's description, P18's Why and Preferred (the top-bar entry point now has only `nfs-menu-icon`), P21's exception, P9's `insertion` clause, and the not-a-conflict note on `ngDevMode`.
- `storybook-conventions.md`: the Orbit, Off-canvas, Progress Bar, Breadcrumbs, and Badge override comments.

### Declined, and why

- Input 1: `specs/variant-declaration-tooling.md` line 128 is already right, so nothing changed. The line names the Sass flag `$flexbox-responsive-breakpoints`, not the removed property `--nfs-flexbox-responsive-breakpoints`. The flag still exists in Foundation, the tooling reads nothing for it, and `specs/flexbox-utilities.md` (its Sass subsection) says the same. Group f's re-run had already rewritten the passage.
- 162 item 12's closing link from P23 to the Runtime checks spec's ticket: the guide may not link a deferred spec, so the dated line links the ruling instead.
- The 2026-09-30 date of 162's and 163's ADR notes: this task's instruction gives every note the ruling's date, 2026-09-29, and one note per ADR, so each merged proposal is in that one note.
- 161's ADR notes link `specs/misuse-warnings.md`. The notes link the spec's ticket instead, [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md), as the other deferred kinds' notes do. The glossary keeps 161's spec link.
- 161's and group e's Reveal usage-rule citation in 1.5 Ids: kept only the Tabs spec's usage rule 4, which was read in the spec. The Reveal's number was not confirmed.
- Group f's README summary for the Variant declaration tooling: no summary names the CI check. Part 3's item 5 did, and it no longer does.
- 160 item 10, group a item 15, group b's and group c's last items: no change proposed.

### Left for the wave audit

- Input 6's boundary questions:
  - the "stands alone" report (M5) that both the forgotten-import and family checks specs describe;
  - the fourteen family-reading checks kept in the misuse warnings spec;
  - the Slider, Reveal, and Table contrast pairs that lost their only automated test.
- The map's Notes line "Forgotten imports (user ruling, 2026-09-28)" still says a forgotten import "is caught by" the checks. This task's instruction limited map edits to the Out of scope line and to Notes lines the proposals name, and none names it.
- The counts do not agree: ticket 159 counted 47 family checks, and the family checks spec holds 46. 164's note for the orchestrator, that the family checks spec's entries for 157's checks should point at the forgotten-import spec's rule, is unchecked.
- The README says every spec has the seven `/to-spec` sections. That was not verified for the four new specs.

### Verification

`verify.mjs` in this task's scratchpad scanned the 25 touched files and passes. It checks for:

- non-ASCII characters;
- the banned words;
- relative links that do not resolve (proposal sections and gist lines excluded);
- table rows whose cell count differs from the header;
- line endings changed against HEAD (every touched file is LF and stays LF);
- any mention of `nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `provideNfsRuntimeChecks`, `@error`, or a link to a deferred spec or its ticket in building-blocks, the guide, or the Storybook conventions, except a dated record line;
- a glossary term that names one without the later-milestone marker;
- an ADR without the dated note.

Each scan has a positive control.

### Gist for Decisions so far

- [Task: shared documents for the later-milestone checks](issues/171-task-shared-documents-later-milestone-checks.md) -- the proposals of tickets 160 to 170 applied or declined with reasons, merged where two touched one passage. Building-blocks, the architecture guide (P23 now states each misuse as documented usage, with a dated line; P24 as 164 gave it), and the Storybook conventions name no check and state each rule as documented usage, a usage rule, or a required setting. The glossary marks each check term as a later-milestone term and adds Family check, Misuse warning, and Usage rule. The README counts 57 specs and five first-milestone shared utilities and lists the five deferred specs in a section of their own. Seventeen ADRs and T9 of the architecture audit get dated notes. The Runtime figure in 159's gist is corrected to 24. The wave audit follows.
