# 179. Task: shared documents for the later-milestone families

Type: task
Status: resolved
Blocked by: 175, 176, 177, 178
Labels: wayfinder:task
Map: ../map.md

## Question

After the eight specs are marked and the other specs are rewritten, what must the shared documents say?

## How to work it

Opus at low effort, AFK: apply the proposals of tickets 175 to 178 and the ruling [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md): building-blocks (Tables A and D, Part 3, the class rule's exception), ADR 0039 and 0044 dated notes (and any other ADR that assumes the eight), the architecture guide, the glossary, `storybook-conventions.md` (stories may write Foundation's classes for the eight families), the README (a later-milestone section with the eight specs, counts), and the map (a Milestones rule line and the gists). The wave audit follows (map, Audits).

## Answer

Done 2026-09-30 on Opus 5.5 at low effort, AFK, by one agent with no subagents. The edits were made by a script that required each quoted old text to match exactly once and kept each file's line endings. Files changed: `building-blocks.md`, `architecture-guide.md`, `CONTEXT.md`, `storybook-conventions.md`, `README.md`, `map.md`, ADRs 0012, 0039, 0040, and 0044, and the closing sections of six of the eight later-milestone specs (item 1).

### Proposals applied

From [Re-run: grid, typography, and utility specs for the later milestone](175-rerun-grid-typography-utility-specs-later-milestone.md):
1. building-blocks Table D: the dated note at its top, dated `2026-09-30 (later-milestone families, ...)`. Each of the eight rows' Entry cell also gains "(later milestone)".
2. building-blocks 1.10: the Flexbox Utilities, Prototyping Utilities, Typography Helpers, Float Classes, and Visibility Classes bullets gain "later milestone" after the spec link. The Scroll regions bullet gains the sentence on a hand-written XY Grid cell block, and its Prototyping Utilities overflow directives are marked later milestone.
3. ADR 0039: the exception note, applied as quoted. One clause was added from ticket 176 decision 7 and ticket 178's triage: a class that a first-milestone directive binds for its own behaviour stays bound (the Responsive Toggle's Visibility classes, the Nested menu's `invisible` and `visible`).
4. storybook-conventions section 8: the single scaffolding item (merged, below). The lead-in exception and the preview changes are applied: `nfs-float-grid`, `nfs-flexbox-utilities`, `nfs-prototype-classes`, and `nfs-typography-helpers` are commented out as later milestone. The `float-grid--*` part of the `foundation-grid` comment is marked later milestone. `foundation-grid` and `foundation-everything($prototype: true)` stay.
5. README: the "Later-milestone families" section, after "Later-milestone checks". The eight rows moved out of the Plugins table into it.
6. CONTEXT.md: applied to **Utility family** and **Utility attribute**, the two entries whose definitions name a directive of the eight families.

From [Re-run: specs without the later-milestone families, group a](176-rerun-specs-without-later-families-group-a.md):
1. storybook-conventions, the settings-overrides comment on the four greys: it now names the Callout's D17 and the Card's D14 as the owners, and the Typography Helpers' stories as later milestone.
2. The scaffolding bullets (merged, below).
3. building-blocks 1.10, the Visibility Classes bullet: "Visually hidden text (Foundation's `.show-for-sr`, written as a normal class in the first milestone)".
4. map.md, the Out of scope base-styles line (orchestrator item 3; the line is at 353, not 349).

From [Re-run: specs without the later-milestone families, group b](177-rerun-specs-without-later-families-group-b.md):
1. building-blocks, the Equalizer row: both replacements, as quoted.
2. building-blocks, the Media Object row: as quoted.
3. storybook-conventions section 8: the lead-in, as quoted; the bullets merged, below.
4. storybook-conventions checklist item: as quoted.

From [Re-run: specs without the later-milestone families, group c](178-rerun-specs-without-later-families-group-c.md):
1. building-blocks Table C, the Variant declaration tooling row: as quoted.
2. building-blocks 1.3: `NfsCellSize` becomes `NfsLabelColor`. In 1.4 the count bullet gains the note, placed after "A count" so the sentence reads.
3. ADR 0040: the dated note, as quoted.
4. CONTEXT.md: the same as orchestrator item 2, applied.
5. storybook-conventions: covered by the merged scaffolding item.

### Merged

- storybook-conventions section 8. Tickets 175, 176 (item 2), 177 (item 3), and 178 (item 5) all rewrite the scaffolding bullets. The result is one item: 175's list of families and its Float Grid and `foundation-everything($prototype: true)` clauses, with examples drawn from 175, 176, 177, and 178 (`grid-x grid-margin-x`, `cell medium-4`, `flex-container`, `align-self-middle`, `text-center`, `no-bullet`, `show-for-sr`, `hide-for-large`, `float-right`, `position-relative`, `overflow-hidden`), 177's rule on order and reverse direction classes, and a closing sentence that the later milestone turns these into the families' directives. The lead-in is 177's wording, which contains 175's "except the classes of the families above" in substance. 176's three separate bullets are declined in favour of the single item, which covers the same classes.
- building-blocks 1.10, the Visibility Classes bullet: 175 (the "later milestone" marker) and 176 (the `.show-for-sr` wording) are both applied to the one bullet. The bullet also says the same rules hold for Foundation's Visibility classes written as normal classes.

### Orchestrator items

1. Applied from `git show d5a1eee:.scratch/next-foundation-specs/specs/variant-declaration-tooling.md`, lines 166 to 174. Each family's parts of the "Known `mixins` today" bullet and of the shared `uses` bullets (`NfsBreakpointClassesOverrides`, `NfsGridColumnCountOverrides`, `NfsBlockGridMaxOverrides`), plus its own `uses` bullets, are copied verbatim as sub-items of a new last bullet in "What the later milestone changes, per spec". The bullet follows each spec's existing Variant declaration tooling bullet. Families covered: XY Grid, Float Grid, Flex Grid, Prototyping Utilities (its mixin only; it had no `uses` entry there), Flexbox Utilities, and Visibility Classes (its `uses` only; it has no mixin). The Typography Helpers and Float Classes had no entry in that manifest, so their specs are unchanged.
2. CONTEXT.md: **Open Variant family**, **Variant manifest**, **Declaration drift**, and **Variant properties** each gain "(a count arrives with the later milestone's families)". In **Variant properties** it is joined into the existing parenthesis. The Open Variant family's "a Prototyping list" also gains "(later milestone)".
3. map.md: applied (Proposals, 176 item 4).

### Further edits the brief's files needed

The check forbids any shared document naming a family directive as a first-milestone one, so these lines were changed too:
- building-blocks: 1.3 (the layout-system names, Utility families, `NfsGridColumnsOverrides`); 1.4 (the grid and flex naming step, Utility attributes); 1.7 (content shown or hidden is Foundation's Visibility classes); 1.10 on `hidden` (Foundation's `.hide` as a normal class); the Pagination row (centring is Foundation's `text-center`, as ticket 177 rewrote the Pagination spec), which no proposal named; 1.13 (`--nfs-grid-columns: 12;` is the later XY Grid's); the Sticky row (`nfsStickyContainer` beside a `class="cell"` element, as ticket 178 rewrote Sticky); the Card row.
- architecture-guide: the kind table's layout and utility row, P9's Preferred and Avoided examples, the naming rule's family cases, and the `NfsPrototypeSpacing` example are marked later milestone.
- storybook-conventions: the title groups, the Flex Grid configuration, the prototype feature switches comment, and the checklist's class item are marked later milestone or name the exception.
- ADR 0044 and ADR 0012 get dated notes: the utility directive rule applies from the later milestone, and the grids', prototype, flexbox, and typography Library mixins arrive with their specs.
- README: the opening paragraph, the Destination count (the 25 docs-page specs are 17 plus the eight), the specs count (44 of 57 in the first milestone), and the wave section's statuses.
- map.md: this ticket's gist, after group a's.

### Declined

- 175's CONTEXT.md marker on **Visibility class**, **Visually hidden**, **Skip link**, and **Clearfix**: their definitions name Foundation classes and mixins, not a directive, so there is nothing to mark. There is no **Utility directive** entry.
- 176 item 2's three separate bullets: replaced by the merged item.
- The map's "Milestones rule line", which the How to work section of this ticket names: the Later-milestone families line already stands in Standing preferences, as 175 noted. No change.

No proposal changed a decided API or default.

### Verified and inferred

- Verified by reading: every quoted old text matched exactly once; the d5a1eee manifest lines; that only the Callout and Card specs, among the first-milestone component specs, require `#666666`; the README row count (57 = 44 + 8 + 5, from the Destination paragraph's own breakdown).
- Inferred: the placement of the "(later milestone)" markers beside rules that describe only the later families. They restate the ruling and change no rule.

### Left for the wave audit

- The Table spec's rows. Storybook's greys comment used to cite "table rows" for the 4.5:1 inside containers; 176 left the Table spec to another group, and no Table decision requires the greys. Whether the Table spec should require them for a `cite` or `small` in a row is open.
- `research/` files and closed tickets still name the eight families' directives as first-milestone design. They are records, not shared documents, and were not scanned.
- ADR 0046's consequence on the Prototyping Utilities' import arrays is historical and was left as written.

### Verification

`wave174/179/check.mjs` in the session scratchpad scans the 17 touched files for:
- non-ASCII characters and the banned words in lines not present at HEAD;
- relative links that do not resolve (quoted proposals and gist lines skipped);
- table rows whose cell count differs from the header;
- line endings against HEAD.

It also scans the shared documents (building-blocks, the architecture guide, the glossary, the Storybook conventions, the README, and every ADR) for a directive or directive class of the eight families on a line that does not say "later milestone", outside the README's Later-milestone families section and outside ADRs that carry this wave's dated note, whose note qualifies the whole record. The line-ending scan compares against each file's endings before the edit: HEAD's, except `specs/xy-grid.md`, `specs/prototyping-utilities.md`, and `specs/visibility-classes.md`, which were CRLF in the working copy before the edit (read before editing) though LF at HEAD. Each scan has a positive control. It passes.

### Gist for Decisions so far

- [Task: shared documents for the later-milestone families](issues/179-task-shared-documents-later-milestone-families.md) -- the shared documents say that the XY, Float, and Flex Grids, Typography Helpers, Prototyping Utilities, Flexbox Utilities, Visibility Classes, and Float Classes are a later milestone's. Building-blocks marks their Table D rows and 1.10 bullets, and restates the Equalizer, Sticky, Card, and Media Object rows and the Visibility and scroll-region rules as Foundation's normal classes. ADR 0039 gains the class rule's exception, and ADRs 0012, 0040, and 0044 get dated notes. The Storybook conventions let stories write those families' classes and move their Library mixin includes to the later milestone. The glossary's count entries say a count arrives with those families. The README lists the eight in a Later-milestone families section (44 first-milestone specs of 57). The map's base-styles line gives the four greys to the Callout and Card. Each later spec's closing section carries its former Variant declaration tooling manifest entries. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.
