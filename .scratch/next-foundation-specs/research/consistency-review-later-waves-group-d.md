# Consistency review of the later-milestone waves: group d

Ticket: [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md), group d

Group d is the CSS-only components and the Variant tooling: `specs/button.md`, `specs/button-group.md`, `specs/close-button.md`, `specs/badge.md`, `specs/label.md`, `specs/callout.md`, `specs/card.md`, and `specs/variant-declaration-tooling.md`. Reviewer: Opus 5.5, 2026-09-30.

## What was read

- In full: the eight specs; the ticket; `map.md` lines 1 to 163; [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md); the four rulings ([Decide: an exportAs on every directive](../issues/156-decide-exportas-on-every-directive.md), [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md), [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)); [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md) and [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md); building-blocks Part 1 (1.1 to 1.14); ADR 0018 (body and Consequences); the Variant tooling ticket's amendments from 2026-09-29 on.
- Read in part: building-blocks Table D's rows for the seven components and Table C's row for the tooling, Part 4's Decided list; the dated notes of ADRs 0011, 0012, 0022, 0039, 0040, and 0044; `storybook-conventions.md` sections 4, 5 (the preview includes and the settings overrides), and 8; the `CONTEXT.md` entries Close Button, Split button, Callout, Badge, Card, Card divider, Label, Variant registry, Variant declaration file, Variant manifest, Declaration drift, Library mixin, and Variant properties; the README rows of the eight specs; the tails of the amendment homes.
- Searched only (for check 3, read-only, each owner opened at the cited line): the Triggers spec (D8, D10, D13, D17, the `NfsToggle` and `NfsClose` classes, `nfsCloseResult`), the Toggler (selectors, `exportAs`, `animate`, `closed`, the `nfs-toggler-` id, D18), the Dropdown (`nfsDropdownPane`, `nfs-dropdown-pane`, `NfsDropdownSizesOverrides`), the Reveal (`nfsCloseButtonToken`, its close-button settings), the Off-canvas (`$offcanvas-background: $white`), the Tooltip (D23, the `skipSelf` bare `nfsClose`, interactive hosts), the Forms (`nfsInputGroup`, `nfsFormLabel` and `middle`), the Equalizer (`nfsEqualizerWatch`, the `.card-row > article` recipe), the Abide (`nfsAbideAlert`, `#bf3f2c`), the Thumbnail (`nfsThumbnail`), the Media Object (D2, `stackFor`), the Responsive Embed (`NfsResponsiveEmbedRatio` and its manifest row), the Breakpoint service (`ngx-foundation-sites/media-query`, `nfsBreakpointForWidth`), the Accordion's `-15%` title colour, ticket 128's decision 21, and the closing sections of the eight later-milestone family specs for their entries on these specs.

## Per spec

### specs/button.md

1. Class rule: holds. Consumer markup writes only `show-for-sr` (a Visibility class, ADR 0039's 2026-09-30 exception); every other `class=` is rendered output or a labelled copied-class case (D22).
2. Milestones: holds. No check is named or relied on; the copied-class and disabled-link rules are documented usage 1 to 6; the Sass compile test is the library's own test.
3. Cross-spec names: hold (Triggers D13, Button Group D2 and D5, `NfsDropdownPane`, Abide's `#bf3f2c`, the Label's D17, `nfsBreakpointsToken` and `nfsBreakpointForWidth` from `ngx-foundation-sites/media-query`, every Variant helper and registry name the tooling declares).
4. Shared documents: hold (building-blocks 1.4, 1.10 Button bullet, 1.13, Part 4 Decided item 3; ADRs 0011, 0012's note on flag-gated properties, 0040).
5. Standing preferences: hold (versions, native platform with its reason, rendering modes, WCAG 2.2 AA, Animation, ADR 0018's four layers).
6. Shape and examples: hold; `app-invoice-actions` imports `FormsModule`, `NfsButton`, and `RouterLink`, which its template uses.
7. Hygiene: holds (script).

No change.

### specs/button-group.md

1. Class rule: holds (`show-for-sr` and the four `align-*` classes are families with no first-milestone spec, D7, D9).
2. Milestones: holds; the Flexbox alignment row says Foundation's classes are written as normal classes, and Out of Scope says a later milestone adds their directives.
3. Cross-spec names: hold (Tooltip D23, ticket 128's decision 21, `[nfsInputGroup]`, `NfsToggle`, `#saveMenu="nfsDropdownPane"`; the Flexbox Utilities' and Visibility Classes' closing entries for this spec match what it writes).
4. to 7.: hold; the example imports `NfsButtonGroup`, `NfsButton`, `NfsToggle`, and `NfsDropdownPane`, the four its template writes.

No change.

### specs/close-button.md

1. to 7.: hold. The Toggler (`nfsToggler` without `toggler` is visibility mode; `animate` takes a leaving Motion name alone, D18; `closed`), the Triggers (D8, D17, `nfsCloseResult`), the Callout's content query for `nfsCloseButtonToken` and its `data-nfs-close-button` hook, the Reveal's and Off-canvas's container settings, and the Tooltip's `skipSelf` rule match their owners. The one `@Component` example imports `NfsCallout` and `NfsCloseButton`, which its template writes.

No change.

### specs/badge.md

1. to 7.: hold. Out of Scope's screen-reader-only bullet is the "a later milestone adds the directive" form; the Manual release test follows ADR 0022's 2026-09-27 note, as the Label, Breadcrumbs, and Pagination specs do. The example imports `NfsBadge` and `NfsButton`.

No change.

### specs/label.md

1. to 7.: hold. Audit 0010's M4 and L1 fixes are in place (`label--icons`' `show-for-sr`, the qualified class sentence). `label[nfsFormLabel]` and its `middle` input match the Forms spec; the Tooltip rule matches its spec. The example imports `NfsButton` and `NfsLabel`.

No change.

### specs/callout.md

1. Class rule: holds; no story writes a Foundation class.
2. Milestones: holds; D17 and Out of Scope name the later-milestone Typography Helpers spec only as where the requirement came from (audit 0010 dropped the same candidate).
3. Cross-spec names: hold (`nfsAbideAlert`, `nfsEqualizerWatch`, `nfsToggler`, the Triggers' D10 and D17, ADR 0033, the Accordion's `-15%` title colour, the Typography Helpers' closing entry for this spec).
4. Shared documents: hold (building-blocks 1.10's Callout bullet, 1.13's shared `--nfs-foundation-palette` writer, the Storybook overrides for `$anchor-color`, `$closebutton-color`, the four greys, and the Progress Bar's alert merge).
5. Standing preferences: hold.
6. Shape and examples: hold; `app-invoice-status` imports `NfsButton`, `NfsCallout`, and `NfsCloseButton`.
7. Hygiene: holds.

Change (1):

- User Stories, story 21. Before: "so that my callouts pass with two lines." After: "so that my callouts pass with the lines the Sass subsection lists." Reason: D17 (2026-09-30, later-milestone families) added the four greys, so the Sass subsection now lists seven lines; audit 0010's L2 fixed the same count in the Storybook sentence and in the Card's user story 12, not here. Impact LOW, confidence HIGH. Amendment in [Spec: Callout](../issues/89-spec-callout.md).

### specs/card.md

1. Class rule: holds (the grid, `flex-container`, and `no-bullet` classes are families with no first-milestone spec; the stories' grid scaffolding says so).
2. Milestones: holds; Out of Scope and the usage notes name the later milestone only as adding directives or the list-margin correction, which the Typography Helpers spec does (its D8).
3. Cross-spec names: hold (`nfsEqualizerWatch`, the Equalizer's `.card-row > article` recipe, `nfsThumbnail`, the Responsive Embed's measurements). Two later-milestone closing entries do not match what this spec writes now (P1, P2).
4. to 7.: hold; the `app-product-card` example imports `NgOptimizedImage` and `NfsCardSection` and hosts `NfsCard`.

No change.

### specs/variant-declaration-tooling.md

1. Class rule: holds (no markup).
2. Milestones: one leftover. The check mode left for the later milestone (this spec's ticket, amendment of 2026-09-29), but D22's rejected alternative still read "(two implementations of the check)". The Later milestone subsection holds the later families' registries under their own heading, which audit 0010 accepted.
3. Cross-spec names: hold (the ten registries and their properties against the Button, Button Group, Badge, Label, Callout, Close Button, Dropdown, and Responsive Embed specs; the Media Object's `stackFor`; the Off-canvas `revealOn` and `inCanvasOn` uses; `nfs-dropdown-pane`, `nfs-responsive-embed`, `nfs-progress-bar`; the later specs' closing entries for this spec).
4. Shared documents: hold (building-blocks 1.3, 1.4, 1.13 and Table C; ADR 0040's 2026-09-30 note, "the 10 registries of its families").
5. Standing preferences: the Implementation level was not stated as a level with its reason; the section said only that the browser target does not apply.
6. Shape: the Animation subsection of building-blocks 1.14 item 9 was missing (the Sass subsection's item 4 already says nothing animates).
7. Hygiene: holds.

Changes (3), each impact LOW, confidence HIGH; amendment in [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md):

- D22. Before: "an Nx executor beside the builder (two implementations of the check)". After: "... (two implementations of the same rewrite)". Reason: the map's Milestones note (a first-milestone spec names no check); the builder has no check mode since [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md).
- Implementation level and primitives. Before: "The browser target does not apply; the tooling runs in Node ...". After: the section opens with "Implementation level: not an Implementation level choice, as building-blocks Table C records for this utility: the order of native platform, `@angular/aria`, `@angular/cdk`, and custom Angular ranks the primitives a directive or component is built on, and nothing here is one or runs in a browser. The types are declaration merging, and the tooling is Node code." and keeps the rest. Reason: the map's Standing preferences ("Each spec must say which Implementation level it stopped at and why"); Table C's "Level and reason" cell.
- New `### Animation` between Rendered output and Rendering modes: "None: nothing here renders, so there is no State class, Motion class, or reduced-motion rule (Sass, item 4)." Reason: building-blocks 1.14 item 9 and the review's check 5 (the animation rule).

## Proposals

Links inside quoted text are written relative to the target document.

### P1. The XY Grid's closing entry for the Card names the wrong gutter for the list of cards and misses `card--long-words`

- File: `specs/xy-grid.md`, line 606 (closing section, "What the later milestone changes, per spec").
- Current text: "- [Spec: Card](../issues/90-spec-card.md): the card grids of the list-of-cards and equal-height recipes and of `card--sizing`, `class="grid-x grid-margin-x"` with the `small-up-<n>` and `medium-up-<n>` classes and `class="cell"`, become `nfsGridX gridMarginX` with `[up]` and `nfsCell`."
- Replacement: "- [Spec: Card](../issues/90-spec-card.md): the card grids of the equal-height recipe, `card--sizing`, and `card--long-words`, `class="grid-x grid-margin-x"`, and of the list-of-cards recipe, `class="grid-x grid-padding-x"`, each with its `small-up-<n>` and `medium-up-<n>` classes and `class="cell"`, become `nfsGridX` with `gridMarginX` or `gridPaddingX`, `[up]`, and `nfsCell`."
- Why: the Card spec's list of cards is a padding grid (`specs/card.md:317`, and its usage notes give the reason: `ul.no-bullet` would move a margin grid), and `card--long-words` writes a margin grid too (`specs/card.md:248`); check 3 (the owning first-milestone spec as it stands). Impact LOW, confidence HIGH.

### P2. The Typography Helpers' closing entry for the Card calls the list of cards a margin grid

- File: `specs/typography-helpers.md`, line 601.
- Current text: "- [Spec: Card](../issues/90-spec-card.md): the list of cards' `class="no-bullet"` becomes `nfsNoBullet`, and `nfs-typography-helpers` gives that margin grid its gutter back (D8); the Out of Scope line on typography colours points again at this spec's greys on the card divider (D9)."
- Replacement: "- [Spec: Card](../issues/90-spec-card.md): the list of cards' `class="no-bullet"` becomes `nfsNoBullet`, and, because `nfs-typography-helpers` gives a margin grid its gutter back (D8), the list may use margin gutters again in place of the padding gutters and the Application class that the Card's usage notes describe for the first milestone; the Out of Scope line on typography colours points again at this spec's greys on the card divider (D9)."
- Why: in the first milestone the list is a padding grid (`specs/card.md:317`, `:361`), so "that margin grid" names a grid the Card does not write; check 3. Impact LOW, confidence HIGH.

### P3. The glossary's Variant registry entry offers a count with no later-milestone marker

- File: `CONTEXT.md`, line 484 (**Variant registry**).
- Current text: "adding names (`purple: true`), removing defaults (`warning: false`), or setting a count, so the Variant inputs"
- Replacement: "adding names (`purple: true`), removing defaults (`warning: false`), or setting a count (a count arrives with the later milestone's families), so the Variant inputs"
- Why: [ADR 0040](../adr/0040-variant-input-types.md)'s 2026-09-30 note ("the first milestone ships the 10 registries of its families, all names registries"); the tooling spec's Later milestone subsection; the glossary's own Variant manifest, Declaration drift, and Variant properties entries already carry this marker. Impact LOW, confidence HIGH.

## Verification

A Node script, `verify.mjs` in the review's scratchpad folder `review180/d/`, checked every file this group touched: the eight specs and this report in full, and the two amendment homes from the new amendment heading on (ASCII, the banned words and the banned pair) and in full for links and table rows. It checks non-ASCII characters, the banned words, every relative link resolving from its file (inside the Proposals section, also from the target document's folder), each ticket link's text against its ticket's H1, the cell count of every table row against its header, mixed line endings, and the presence of each edit and the absence of each replaced phrase. The positive control, a scratch file holding one banned word, one non-ASCII character, one unresolved link, and one row with an extra cell, made it report all four and exit 1. The run over the group's files exited 0. Process note: the script's expected-edits list (`expect.json`) and the control file were written with a shell heredoc and `printf`, not with the Write tool the brief asks for; both are data files in the scratchpad, and nothing in the repository was written that way.
