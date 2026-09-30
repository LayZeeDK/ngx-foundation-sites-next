# 176. Re-run: specs without the later-milestone families, group a

Type: grilling
Status: resolved
Blocked by: 174
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md) has every first-milestone spec stop assuming the eight later-milestone families. What do `specs/abide.md`, `specs/anchored-pane.md`, `specs/badge.md`, `specs/breadcrumbs.md`, `specs/breakpoint-service.md`, `specs/button.md`, `specs/button-group.md`, `specs/callout.md`, `specs/card.md`, `specs/drilldown-menu.md`, `specs/dropdown.md` say without them?

## How to work it

Opus, AFK. In each spec: every directive of the eight families (`nfsGridX`, `nfsCell`, `nfsRow`, `nfsColumn`, `nfsShowForSr`, `nfsHideFor`, `nfsTextAlign`, `nfsFlexContainer`, `nfsPrototype...`, and so on) in an example, story, test, or API text becomes the Foundation class it applies, written as a normal class (`class="grid-x"`, `class="show-for-sr"`), and each such example's `imports` drops the directive; no link to the eight specs or their tickets remains; a behaviour that relied on one of them is restated as the Foundation classes the consumer writes, with Foundation's global styles loaded; the Variant declaration tooling keeps only the first milestone's registries. Each changed spec's governing ticket gets a dated amendment.

## Answer

Done 2026-09-30 on Opus 5.5, AFK, by one agent with no forks. Each spec was searched at HEAD `d5a1eee` for the eight families' directives, entry points, registries, spec paths, and ticket links, and every hit was read in context. All eleven specs changed. Each governing ticket gained `### Amendment, 2026-09-30 (later-milestone families)`: [Re-run: Abide spec under the class rule](123-rerun-abide-class-rule.md), [Re-run: Anchored pane (shared utility) spec under the class rule](131-rerun-anchored-pane-class-rule.md), [Spec: Badge](93-spec-badge.md), [Spec: Breadcrumbs](88-spec-breadcrumbs.md), [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md), [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md), [Spec: Button Group](82-spec-button-group.md), [Spec: Callout](89-spec-callout.md), [Spec: Card](90-spec-card.md), [Re-run: Drilldown Menu spec under the class rule](114-rerun-drilldown-menu-class-rule.md), and [Re-run: Dropdown spec under the class rule](118-rerun-dropdown-class-rule.md). The Callout and Card changes also answer the orchestrator's addendum to this ticket, which relayed items 1 and 2 of the Finds of [Re-run: grid, typography, and utility specs for the later milestone](175-rerun-grid-typography-utility-specs-later-milestone.md).

| Spec | Lines at HEAD | Lines now | Families it assumed |
| --- | --- | --- | --- |
| `specs/abide.md` | 766 | 766 | Visibility Classes, XY Grid |
| `specs/anchored-pane.md` | 673 | 673 | Prototyping Utilities |
| `specs/badge.md` | 424 | 424 | Visibility Classes |
| `specs/breadcrumbs.md` | 491 | 491 | Visibility Classes |
| `specs/breakpoint-service.md` | 592 | 592 | Visibility Classes, XY Grid |
| `specs/button.md` | 558 | 558 | Visibility Classes |
| `specs/button-group.md` | 468 | 468 | Flexbox Utilities, Visibility Classes |
| `specs/callout.md` | 472 | 478 | Typography Helpers |
| `specs/card.md` | 401 | 407 | XY Grid, Flexbox Utilities, Typography Helpers, Prototyping Utilities |
| `specs/drilldown-menu.md` | 757 | 756 | Visibility Classes |
| `specs/dropdown.md` | 772 | 772 | Visibility Classes, XY Grid |

### Decisions

1. Each directive of the eight families in an example, story, fixture, or API text becomes the Foundation class it applied, written as a normal class: `nfsShowForSr` becomes `class="show-for-sr"` (Abide, Badge, Button, Button Group, Drilldown Menu, Dropdown); `nfsGridX`, `nfsCell`, and `nfsGridContainer` become `grid-x`, `grid-margin-x`, `<bp>-up-<n>`, `cell`, `small-3`, `medium-6`, and `grid-container` (Abide, Card, Dropdown); `nfsFlexAlign alignX="center"` becomes `class="align-center"` (Button Group); `nfsFlexContainer` becomes `flex-container` and `nfsNoBullet` becomes `no-bullet` (Card); `nfsPosition="relative"` becomes `class="position-relative"` (Anchored pane stories); `nfsVisibility showFor="large"` becomes `class="show-for-large"` (Breakpoint service). Every `imports` array that listed `NfsShowForSr` drops it (Badge, Button Group, Drilldown Menu, Dropdown), and no link to the eight specs or their tickets remains.
2. Mapping tables, "set by" columns, docs-convention notes, Rendered HTML notes, user stories, and Out of Scope bullets that named a later-milestone directive now say that the class is Foundation's, the consumer writes it, and Foundation's global styles are loaded. The class rule's exception for a family with no first-milestone spec is cited where a sentence said the consumer writes no class. Where an Out of Scope bullet stood for the later-milestone directive, it now says a later milestone adds it.
3. Story and fixture sentences that said no story writes a Foundation class now name the exception they need: `show-for-sr` (Badge, Button, Button Group, Drilldown Menu), the grid scaffolding (Card, Dropdown's `dropdown-pane--default`), `align-*` (Button Group), and `position-relative` (Anchored pane, user story 46 and D24). The library's Storybook preview already compiles `foundation-everything($prototype: true)`, so `position-relative` is printed there.
4. Decisions that named a later-milestone directive are rewritten, each dated: Button Group D7 and D9 (a Flexbox alignment is Foundation's `align-*` class written beside `nfsButtonGroup`, which the group's `[class]` list keeps); Drilldown Menu D29 (the back suffix is a `span` with `show-for-sr`); Anchored pane D24; Breakpoint service design decision 24.
5. Behaviour that relied on a later-milestone spec is restated as what the consumer writes:
   - Card, list of cards: `ul.no-bullet` sets `margin-left: 0` at one class and one element, which outranks `.grid-margin-x` (measured for the Typography Helpers spec, its D8), and the correction that restored the margin is that spec's later-milestone Library mixin. The first-milestone recipe writes `grid-x grid-padding-x small-up-1 medium-up-3 no-bullet`, so the markers and the list indent go and the gutter stays, as padding. A consumer who needs margin gutters there writes its own Application class restoring the negative left margin (-10 px, then -15 px from medium, on Foundation's defaults). The equal-height recipe, a `div` grid, keeps margin gutters.
   - Callout D17 and Card D14 (new): a heading `small`, a `blockquote`, and a `cite` are base element styles that a first-milestone callout or card shows, and a `.subheader` is a class the consumer may now write, so each spec requires `$header-small-font-color`, `$blockquote-color`, `$cite-color`, and `$subheader-color` at `#666666` on Foundation's defaults. The requirement is in the Solution, the 1.4.3 row, the Sass subsection's required settings, and the Foundation-behaviour list. `#666666` reaches at least 4.686:1 on every callout tint, 4.601:1 on the card divider, 5.742:1 on white, and 5.693:1 on the page. The defaults fail even on the page (`$dark-gray` 3.423:1, `$medium-gray` 1.625:1).
   - Breakpoint service: anything that looks different per breakpoint and must be right before hydration now uses a directive's host binding or a visibility class the consumer writes. Either way the class is in the server HTML.
6. The Breakpoint service keeps the Class breakpoint types, their registry `NfsBreakpointClassesOverrides`, and `--nfs-breakpoint-classes`. The first milestone needs them for Button `expanded`, Menu `orientation`, Button Group and Top Bar `stackedFor`, and Off-canvas `revealOn`. Only `NfsVisibility` and the grid cells leave its list of consumers. None of the eleven specs declared a registry or Variant property of the eight families, so nothing else leaves.
7. Unchanged: Foundation classes that a first-milestone directive binds for its own behaviour, even when Foundation prints them in a later-milestone family's partial. The Nested menu's `invisible` and `visible` on Drilldown levels are one case. Legacy `.float-left` and `.float-right` on a Trigger are read by no directive (Anchored pane, Dropdown), and they are unchanged too. Neither case needs a later-milestone spec.

### Triage

- Decision 5, the Card's padding-gutter list: impact LOW (one usage example, which a later milestone can switch back), confidence HIGH. It uses measured facts recorded in the Typography Helpers spec (D8, and its compile test: "a plain `.grid-x` list and a padding grid list lose the 20 px list indent").
- Decision 5, Callout D17 and Card D14: impact MEDIUM (two required site-wide settings, the same values the Storybook overrides already carry), confidence HIGH. They follow ADR 0022 and building-blocks 1.10: a container's spec states the pairs on its own backgrounds. The ratios are the Typography Helpers spec's exact-formula measurements, and the orchestrator's addendum asked for them.
- Decisions 1 to 4, 6, and 7: impact LOW, confidence HIGH. Each follows the ruling's decisions 2, 3, and 4 directly.
- Inferred, not verified: that `<bp>-up-<n>` sizes cells in a padding grid as it does in a margin grid (Foundation's block grid classes; not rendered here), and that the Top Bar spec writes `show-for-sr` as a normal class after its group's re-run, which D29 cites.

Nothing is OPEN FOR HUMAN.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone families](179-task-shared-documents-later-milestone-families.md). Each quote is relative to its target file, with line numbers at HEAD `d5a1eee`.

1. `storybook-conventions.md`, the settings overrides comment at lines 246 to 251: the four greys (lines 252 to 255) stay in the first milestone and are now required by the Callout (D17) and the Card (D14). Replace the sentence "which the Typography Helpers spec's required settings fix" and the "Spec: Typography Helpers" story list with a comment naming the first-milestone owners (another group may add the Table spec for its rows):

   > // The Callout's D17 and the Card's D14 require these four greys on Foundation's defaults: #666666 reaches 4.5:1 on the page, on every callout tint, and on the card divider, where #737373 does not.

2. `storybook-conventions.md`, the scaffolding bullets at lines 320 to 327: the stories of this group write these classes as normal classes: `show-for-sr`; `grid-container`, `grid-x`, `grid-margin-x`, `grid-padding-x`, `<bp>-up-<n>`, `cell`, and cell sizes; `flex-container` and `align-*`; `no-bullet`; and `position-relative`, which `foundation-everything($prototype: true)` prints. The layout, flex layout, text and lists, visibility, and spacing bullets can each become:

   > - layout: Foundation's XY Grid classes, written as normal classes (`grid-container`, `grid-x`, `grid-margin-x`, `grid-padding-x`, `<bp>-up-<n>`, `cell`, and the cell sizes); the family has no first-milestone spec.
   > - visibility: Foundation's `show-for-sr` and the other visibility classes, written as normal classes.
   > - position: Foundation's `position-relative`, written as a normal class and printed by `foundation-everything($prototype: true)`.

3. `building-blocks.md` 1.10, the Visibility Classes bullet at line 193: "Visually hidden text (`nfsShowForSr`) never holds a tab stop" becomes:

   > Visually hidden text (Foundation's `.show-for-sr`, written as a normal class in the first milestone) never holds a tab stop

   The Button, Button Group, Dropdown, Abide, and Drilldown Menu specs now write that class.

4. `map.md`, the Out of scope base-styles line (line 349, the orchestrator's file): "the Typography Helpers spec for `$header-small-font-color` and `$blockquote-color`" becomes:

   > the Callout and Card specs for `$header-small-font-color`, `$blockquote-color`, and `$cite-color` on their backgrounds in the first milestone (their D17 and D14), and the later-milestone Typography Helpers spec on the page

### Verification

`wave174/176/check.mjs` in the session scratchpad scans the 23 files this ticket touched. Its scans:
- non-ASCII characters;
- the banned words;
- line endings against HEAD (every file is LF, as at HEAD);
- relative links that do not resolve (quoted proposals and gist lines are exempt);
- table rows whose cell count differs from the header;
- in the eleven specs, a directive or entry point of the eight families, or a link to their specs or tickets, unless the line says a later milestone adds it;
- one amendment heading per governing ticket;
- this ticket's resolution fields.

Every scan has a positive control, and a scan that throws counts as failed. It passes.

### Gist for Decisions so far

- [Re-run: specs without the later-milestone families, group a](issues/176-rerun-specs-without-later-families-group-a.md) -- the Abide, Anchored pane, Badge, Breadcrumbs, Breakpoint service, Button, Button Group, Callout, Card, Drilldown Menu, and Dropdown specs assume none of the eight later-milestone families. Every `nfsShowForSr`, grid, flex, `nfsNoBullet`, and `nfsPosition` use becomes Foundation's class, written as a normal class; `imports` drop `NfsShowForSr`; no link to the eight specs remains. Button Group D9 and Drilldown D29 now decide the written class. The Card's list of cards uses padding gutters, because `ul.no-bullet` zeroes a margin grid's gutter without the later-milestone correction. The Callout (D17) and the Card (D14) require the four typography greys at `#666666` themselves. The Breakpoint service keeps `NfsBreakpointClassesOverrides` for the first milestone's responsive inputs. Impact MEDIUM at most, confidence HIGH; nothing OPEN FOR HUMAN.
