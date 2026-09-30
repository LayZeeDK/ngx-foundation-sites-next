# 175. Re-run: grid, typography, and utility specs for the later milestone

Type: grilling
Status: resolved
Blocked by: 174
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md) keeps `specs/xy-grid.md`, `specs/float-grid.md`, `specs/flex-grid.md`, `specs/typography-helpers.md`, `specs/prototyping-utilities.md`, `specs/flexbox-utilities.md`, `specs/visibility-classes.md`, `specs/float-classes.md` as whole, separate specs for a later milestone. What must each say so it stands as a later-milestone spec?

## How to work it

Opus, AFK. In each of the eight: a Milestone line and a Problem Statement sentence saying it is planned and implemented in a later milestone and why (the ruling), and that until then a consumer writes Foundation's own classes for the family with Foundation's global styles loaded; every claim that a first-milestone spec, story, or example depends on it is removed or restated as what the later milestone adds; a closing section lists, per first-milestone spec, what the later milestone changes there (the Foundation classes that its directives replace). The design itself stays. Each spec's governing ticket gets a dated amendment.

## Answer

Worked AFK on Opus 5.5 under the map's triage rule, from a full read of `specs/xy-grid.md` and `specs/visibility-classes.md`, the Problem Statement and Solution of the other six, targeted searches of all eight for sentences that name a first-milestone spec's content, and a scan of every first-milestone spec at HEAD (d5a1eee) for the directives, entry points, and ticket links of the eight families. The eight specs were revised in place; each governing ticket has a dated `### Amendment, 2026-09-30 (later-milestone families)`: [Spec: XY Grid](99-spec-xy-grid.md), [Spec: Float Grid](100-spec-float-grid.md), [Spec: Flex Grid](101-spec-flex-grid.md), [Re-run: Typography Helpers spec, out-of-scope survivors](146-rerun-typography-helpers-out-of-scope-survivors.md), [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md), [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md), [Re-run: Visibility Classes spec for the print classes](143-rerun-visibility-classes-print.md), and [Spec: Float Classes](105-spec-float-classes.md).

### Decisions

1. Milestone line. Each spec has a line of its own under the Ticket line, starting `Milestone: later.`, that says the spec is planned and implemented in a later milestone of the implementing repository, links the ruling [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md), and names this re-run.
2. Problem Statement. Each spec's Problem Statement ends with a paragraph: the user's ruling of 2026-09-30 and its reason (a simpler, more minimal first milestone, each family a whole and separate spec); until then a consumer writes the family's Foundation classes as normal classes with Foundation's global styles loaded, with two examples of the family's classes, and the library's own stories do the same under the class rule's new exception (decision 3 of the ruling); no first-milestone spec assumes the spec, names its directives, or links to it; the design stays whole for the later milestone. Where the family's classes are not in Foundation's default compile, the paragraph says what the consumer compiles: the Float Grid one of its spec's three ways (D14), the Flex Grid with `$xy-grid: false` or `foundation-flex-grid`, and the Prototyping Utilities with Prototype mode (`foundation-prototype-classes`). The XY Grid's paragraph also says that a consumer who writes a cell block class gives it the tab stop, role, and name that `nfsCell` binds (D8), by hand. The Typography Helpers' says its required settings (D9) and `nfs-typography-helpers` (D8) are part of the later design; the Prototyping Utilities' that [Decide: the Prototyping Utilities' Library mixin](173-decide-prototyping-utilities-library-mixin.md) holds; the Visibility Classes' that the Plugin directives that bind a Visibility class for their own behaviour (D7) are first-milestone directives and keep binding it.
3. Claims restated. Only sentences that said a first-milestone spec writes, uses, or leaves something to the family were restated, each as what that spec gets back when the family lands:
   - XY Grid D1 ("the ones every earlier spec wrote");
   - Float Grid D1 and Flex Grid D1 (the Equalizer "already wrote" and "already writes" `nfsRow` and `nfsColumn`);
   - Typography Helpers: the Problem Statement's `.no-bullet` bullet (the Card among the specs that leave list markers to it) and D4 (the Forms and Pagination specs write `nfsTextAlign`);
   - Flexbox Utilities D6 and D8 (the Equalizer and the Button Group "already" write the directives);
   - Visibility Classes user story 33 ("every spec that uses `nfsShowForSr`") and D1 ("a dozen published specs already write `nfsShowForSr`").

   The Prototyping Utilities and Float Classes specs made no such claim.
4. Kept as they are: sentences in which a family directive composes with a first-milestone directive (`nfsStickyContainer` beside `nfsCell`, `nfsFlexAlign` beside `nfsButtonGroup`, `nfsShowForSr` inside an icon-only button), and links from the eight to first-milestone specs. They describe the later milestone's design, which may depend on the first milestone. Links among the eight stay, because all eight land in the same later milestone.
5. Closing section. Each spec ends with `### What the later milestone changes, per spec`, the last subsection of Further Notes. For each first-milestone spec it lists the family classes that spec writes in the first milestone and the directive and inputs that replace them, with the stories, examples, and decisions concerned. It also lists the sentences each spec gets back, including the Variant declaration tooling's registries, Variant properties, Library mixin includes, and manifest rows (ruling decision 4). The list is read from the directives, entry points, and links each spec had at HEAD. The class forms each spec writes now are held by [Re-run: specs without the later-milestone families, group a](176-rerun-specs-without-later-families-group-a.md), [Re-run: specs without the later-milestone families, group b](177-rerun-specs-without-later-families-group-b.md), and [Re-run: specs without the later-milestone families, group c](178-rerun-specs-without-later-families-group-c.md), which the section links. The Flex Grid section says that no first-milestone component spec writes a Flex Grid class, because the Equalizer's residue case is on the Float Grid. Its only entry is the Variant declaration tooling.
6. Unchanged: every directive, input, type, class mapping, ARIA and keyboard row, WCAG row, rendering-mode rule, story, test, and Sass subsection of the eight specs, and every decision number.

### Triage

- Decision 1 (a separate `Milestone: later.` line, not a clause inside the Ticket line as `specs/forgotten-import-checks.md` has it). Impact LOW: it is placement in a planning document, and the ticket's extra check asks for a Milestone line. Confidence HIGH. Decided.
- Decision 4 (composition sentences kept). Impact LOW: they are the later design's, and the ruling forbids first-milestone specs from assuming the eight, not the reverse. Confidence HIGH: ruling decision 2 speaks only of first-milestone specs. Decided.
- Decision 5 (the closing lists are read from HEAD, not from the group a to c results, which were in progress). Impact LOW: the lists are a planning aid for the later milestone, and the sibling re-runs hold the exact first-milestone lines. Confidence HIGH on what the specs wrote at HEAD. The class each directive maps to is read from the family specs' own mapping tables, which is inference, not a read of the new text. Decided.
- Decision 2, the XY Grid sentence on hand-written cell block attributes. Impact LOW: it restates D8's contract for a consumer who has no `nfsCell` yet. Confidence HIGH: it adds no rule D8 does not state. Decided.
- Nothing is OPEN FOR HUMAN. No change touched a decided API, default, or rule.

### Finds for the sibling re-runs and the shared-documents task

1. Card ([Re-run: specs without the later-milestone families, group a](176-rerun-specs-without-later-families-group-a.md)): the list of cards written with classes is `ul class="grid-x grid-margin-x small-up-1 medium-up-3 no-bullet"`. Without `nfs-typography-helpers`, which is later-milestone, `.no-bullet`'s `margin-left: 0` replaces the margin grid's negative gutter, and the grid shifts half a gutter to the right (Typography Helpers D8, measured in three engines). The Card's first-milestone recipe should say how it keeps the gutter, or keep the markers.
2. Callout and Card (group a): their Out of Scope lines lean on the Typography Helpers' required greys (D9) for a heading `small`, a subheader, a `cite`, and a `blockquote` on their tints. A heading `small`, a `cite`, and a `blockquote` are base styles that need no helper class, so a first-milestone callout or card shows them with Foundation's failing defaults unless a first-milestone document requires those settings. Group a, or [Task: shared documents for the later-milestone families](179-task-shared-documents-later-milestone-families.md) in building-blocks 1.10, should decide where that requirement lives.
3. Storybook ([Task: shared documents for the later-milestone families](179-task-shared-documents-later-milestone-families.md)): first-milestone stories write Prototyping Utility classes (the Anchored pane's `position-relative`, the Sticky's `overflow-hidden`, and the Responsive Toggle's `overflow-y-scroll`), so the library Storybook keeps `foundation-everything($prototype: true)`. `equalizer--float-grid` writes Float Grid classes, so it keeps `foundation-grid`.
4. The Responsive Toggle is not affected. Its bar and menu bind Foundation's Visibility classes as its own host bindings (Visibility Classes D7), and they need only `foundation-visibility-classes`, which Foundation's global styles include.

### Proposed shared-document changes (for [Task: shared documents for the later-milestone families](179-task-shared-documents-later-milestone-families.md))

building-blocks.md, a dated note at the top of Table D:

> Dated note (2026-09-30, [Decide: grids, typography, and utilities move to a later milestone](issues/174-decide-grids-typography-utilities-later-milestone.md)): the XY Grid, Float Grid (legacy), Flex Grid (legacy), Prototyping Utilities, Flexbox Utilities, Visibility Classes, Float Classes, and Typography Helpers rows are planned and implemented in a later milestone, each a whole spec marked `Milestone: later`. In the first milestone a consumer and the library's own stories write those families' Foundation classes as normal classes, with Foundation's global styles loaded, and no first-milestone row or spec names their directives. Each of the eight specs lists, in its closing section, the classes its directives replace in the first-milestone specs.

building-blocks.md 1.10: the Flexbox Utilities, Prototyping Utilities, Typography Helpers, Float Classes, and Visibility Classes bullets each gain "(later milestone)" after the spec's link. The Scroll regions bullet keeps the Table's `.table-scroll` as its first-milestone case and adds:

> An XY Grid cell block written as Foundation's classes in the first milestone takes the same `tabindex="0"`, `role="region"` on a `div`, and name by hand; the XY Grid's `nfsCell` binds them in the later milestone.

ADR 0039, a dated note:

> - 2026-09-30 ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)): exception. A Foundation class of a family with no first-milestone spec (the XY, Float, and Flex Grids, Typography Helpers, Prototyping Utilities, Flexbox Utilities, Visibility Classes, and Float Classes) is a normal class in the first milestone, which the consumer and the library's own stories write with Foundation's global styles loaded. The eight specs keep their directives for a later milestone. For every family with a first-milestone spec, the rule holds as before.

storybook-conventions.md, section 8: the "layout", "flex layout", "text and lists", "visibility", "floats", and "spacing, sizing, display, overflow, position, borders, and text" items become one item:

> - layout, flex layout, text and lists, visibility, floats, spacing, sizing, display, overflow, position, borders, and text: Foundation's own classes of the XY, Float, and Flex Grids, the Flexbox Utilities, the Typography Helpers, the Visibility Classes, the Float Classes, and the Prototyping Utilities, written as normal classes (`class="grid-x grid-margin-x"`, `class="cell medium-6"`, `class="show-for-sr"`, `class="position-relative"`), because those families have no first-milestone spec ([Decide: grids, typography, and utilities move to a later milestone](issues/174-decide-grids-typography-utilities-later-milestone.md)); the Float Grid's classes only in `equalizer--float-grid`, and the Prototyping Utilities' compiled by `foundation-everything($prototype: true)` from Foundation's default lists. Scaffolding never writes an order class or a reverse direction class, which change only the visual order (building-blocks 1.10).

The section's lead-in ("takes its look from Foundation's CSS through the library's directives, never through a class written in the story") gains "except the classes of the families above". In the preview, the includes `nfs-float-grid`, `nfs-flexbox-utilities`, `nfs-prototype-classes`, and `nfs-typography-helpers`, and the `float-grid--*` comment on `foundation-grid`, go to the later milestone. `foundation-grid` and `foundation-everything($prototype: true)` stay (Finds, item 3).

README.md, a section after "Later-milestone checks":

> ## Later-milestone families
>
> Eight specs hold the layout and utility families that [Decide: grids, typography, and utilities move to a later milestone](issues/174-decide-grids-typography-utilities-later-milestone.md) moved to a later milestone of the implementing repository: [specs/xy-grid.md](specs/xy-grid.md), [specs/float-grid.md](specs/float-grid.md), [specs/flex-grid.md](specs/flex-grid.md), [specs/typography-helpers.md](specs/typography-helpers.md), [specs/prototyping-utilities.md](specs/prototyping-utilities.md), [specs/flexbox-utilities.md](specs/flexbox-utilities.md), [specs/visibility-classes.md](specs/visibility-classes.md), and [specs/float-classes.md](specs/float-classes.md). Each is specified in full and marked `Milestone: later`. In the first milestone a consumer writes those families' Foundation classes as normal classes with Foundation's global styles loaded, and no first-milestone spec depends on them. Each spec's closing section lists the classes its directives replace in the first-milestone specs.

The README's counts move the eight rows out of the first-milestone table, wherever the table lists them.

CONTEXT.md: in **Visibility class**, **Visually hidden**, **Skip link**, **Clearfix**, **Utility directive**, and **Utility attribute**, each definition that names a directive of the eight families adds "(later milestone; in the first milestone the Foundation class itself)".

The map: the Later-milestone families line in Standing preferences stands; the gist below goes under Decisions so far.

### Verification

`C:/Users/LARSGY~1/AppData/Local/Temp/claude/D--projects-github-LayZeeDK-ngx-foundation-sites-next/d10de68f-6f54-4b6c-801b-6d070a8ba322/scratchpad/wave174/175/check.mjs` scans the seventeen touched files for: non-ASCII characters and banned words in lines not present at HEAD; relative links that do not resolve (quoted proposals, gist lines, and the older tickets' "Proposed" sections skipped, whose links are map-rooted); table rows whose cell count differs from the header; line endings against each file's style before the edit, with no mixed endings; and the extra checks. The extra checks are a `Milestone: later.` line naming the ruling ticket in each of the eight specs, the closing section as the last `###` of each, the dated amendment as the last `###` of each governing ticket, and this ticket's `Status: resolved`, `## Answer`, and gist heading. Each scan has a positive control. Result: all eight controls fire, and all seventeen files pass.

### Gist for Decisions so far

- [Re-run: grid, typography, and utility specs for the later milestone](issues/175-rerun-grid-typography-utility-specs-later-milestone.md) -- the XY, Float, and Flex Grid, Typography Helpers, Prototyping Utilities, Flexbox Utilities, Visibility Classes, and Float Classes specs are marked `Milestone: later` with the ruling's reason. Until they land, a consumer and the library's stories write each family's Foundation classes as normal classes with Foundation's global styles loaded, and no first-milestone spec assumes them. Sentences that said a first-milestone spec writes a family's directives now say what that spec gets back. Each spec closes with what the later milestone changes in each first-milestone spec (the classes its directives replace, and the Variant declaration tooling's registries, Library mixins, and manifest rows). The designs are unchanged. Impact LOW, confidence HIGH, nothing OPEN FOR HUMAN.
