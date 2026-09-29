# 155. Re-run: layout system and flex utility family specs, In-family check lines

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) found that the specs written before ADR 0046 lack the In-family check lines, parent token descriptions, and `strictParents` effects that [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) requires of a multi-directive family. What does each spec of the layout system and flex utility family (`specs/xy-grid.md`, `specs/float-grid.md`, `specs/flex-grid.md`, `specs/flexbox-utilities.md`) state?

## How to work it

Revise each spec in place and append a dated `### Amendment, 2026-09-29 (in-family check lines)` to the ticket the map's Decisions so far cites last for that spec. The items, evidence, and what to decide are in the audit ticket's Answer, section "Re-run tickets", item R5, and the five points above it that every re-run decides; `specs/forgotten-import-checks.md` (its family rule, the `strictParents` table, and the token-description form) and the Accordion spec's worked example are the model. Run `/grill-with-docs` (self-grilling, both sides) where a point needs deciding, and keep every other part of each spec unchanged. Propose shared-document changes as quoted text in the Answer.

## Answer

Specs revised in place: [specs/xy-grid.md](../specs/xy-grid.md), [specs/float-grid.md](../specs/float-grid.md), [specs/flex-grid.md](../specs/flex-grid.md), and [specs/flexbox-utilities.md](../specs/flexbox-utilities.md), each with one In-family bullet under Hierarchy and DI shape and, for the audit's point 3, one development check revised. Each governing ticket carries a dated `### Amendment, 2026-09-29 (in-family check lines)`: [Spec: XY Grid](99-spec-xy-grid.md), [Spec: Float Grid](100-spec-float-grid.md), [Spec: Flex Grid](101-spec-flex-grid.md), [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md). No measurement was needed: every decision follows the shared spec's rule and its measured mechanism; the one fact outside the records, Foundation's container text and selector, was read from `foundation-sites` 6.9.0 in the workspace (`docs/pages/xy-grid.md:108`, `scss/xy-grid/_classes.scss:179-181`).

### Decisions

XY Grid

1. `NfsGridContainer` calls `nfsDirectiveCheck('NfsGridContainer', {children: ['NfsGridX', 'NfsGridY']})` and probes the grids it holds: Foundation's container exists to contain a grid ("To contain it horizontally use the `grid-container` class") and reaches its padding grid by a child selector (`.grid-container:not(.full) > .grid-padding-x`), as the Accordion's root probes its items.
2. `NfsGridX` and `NfsGridY` each call `nfsDirectiveCheck` with their class name and `{children: ['NfsCell']}`, and probe their cells.
3. `NfsCell` calls `nfsDirectiveCheck('NfsCell')` and probes nothing: a cell holds the consumer's content, and a grid nested in it is a grid of its own, as the Accordion's content probes no nested accordion.
4. No part has a parent check (none injects a parent), a peer linked by reference or value, or a parent token, and no part sits on `ng-template` or `ng-container`; `strictParents` changes nothing.
5. Check 2 (placement) counts a parent that carries `nfsGridX` or `nfsGridY` as a grid, class or no class. Such a parent is a grid whose import was forgotten, which the `strictDirectiveImports` Runtime check reports once on that element, as do the container's probe (when a container holds it) and the static check, so its cells no longer each warn, falsely, that they are outside a grid. An `offset` under a forgotten `nfsGridY` still warns, because it stays wrong once the import is fixed. Two layer-2 cases test it.

Float Grid

6. `NfsRow` calls `nfsDirectiveCheck('NfsRow', {children: ['NfsColumn']})` and probes its columns, a column row inside it included (the column row's nearest `nfsRow` ancestor is the outer row).
7. `NfsColumn` calls `nfsDirectiveCheck('NfsColumn')` and probes nothing, for decision 3's reason.
8. No parent check, peer, or parent token; `strictParents` changes nothing.
9. Check 2 counts an element that carries `nfsRow` as a row, class or no class, for the host and for its parent, so a forgotten row import is reported once by the import checks, and a column row whose own `NfsRow` is forgotten is not told it is outside a row. One layer-2 case.

Flex Grid

10. The Float Grid's lines: `NfsRow` probes `NfsColumn`, `NfsColumn` probes nothing, no parent check, peer, or parent token, and `strictParents` changes nothing. Both pairs make the same calls, as the Selector manifest's rule 2 requires of two directives with one class name (`specs/forgotten-import-checks.md:143`), so the host record keys them alike whichever grid is imported; a report of a forgotten one names both entry points (proposal 1 for M1 and M2; NFS9001 names both already).
11. Check 3 counts an element that carries `nfsRow` as a row and one that carries `nfsColumn` as a column, class or no class, as the Float Grid's check 2 does. One layer-2 case.

Flexbox Utilities

12. `NfsFlexContainer`, `NfsFlexAlign`, and `NfsFlexChild` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers: any family's directive, or the consumer's CSS, makes an element a Flex parent, so no directive of this family is another's parent part. `strictParents` changes nothing.
13. `NfsFlexAlign` makes its call in its own constructor also where `NfsFlexContainer` hosts it (`specs/forgotten-import-checks.md:175`), so the host record shows it on that element and an `nfsFlexAlign` attribute written beside `nfsFlexContainer` is reported by no check; the static check reads the same from the Selector manifest's `hosts`.
14. Check 2 (not a Flex parent) stays a check of the computed `display`. It cannot tell a forgotten parent import from a missing directive, because its parent may be any family's element, and the Float Grid's `nfsRow`, which makes no Flex parent, shares its attribute with the Flex Grid's. Its message adds that a Flex parent directive's attribute already on the element means that directive's import is missing, which `strictDirectiveImports` reports once there.

The audit's five points, per spec:

| Point | XY Grid | Float Grid | Flex Grid | Flexbox Utilities |
| --- | --- | --- | --- | --- |
| 1. Call, parent check, probes, peers, `strictParents` | Decisions 1 to 4 | 6 to 8 | 10 | 12, 13 |
| 2. A warning that becomes the `alone` sentence | None: no optional parent injection | None | None | None |
| 3. A DOM placement check under a forgotten parent | 5 | 9 | 11 | 14 |
| 4. Parent token descriptions | No parent token | No parent token | No parent token | No parent token |
| 5. Parts on `ng-template` or `ng-container` | None | None | None | None |

### Grilling record

Self-grilled against the shared spec, the Accordion's line, ADR 0046, building-blocks 1.9, P23 and P24, the four specs, and Foundation 6.9.0's docs and Sass. `/grill-with-docs` is not installed in this workspace, so each question is recorded here with both sides.

1. Should `NfsGridContainer` probe the grids? For: the XY Grid's hierarchy puts the grids in the container; Foundation's docs define the container as what contains a grid, and its CSS reaches the grid by a child selector; the probe reports a forgotten `NfsGridX` inside a working container even when the consumer has switched `strictDirectiveImports` off, because the In-family checks have no switch (the shared spec's D12). Against: a grid needs no container, so the probe covers only grids that sit in one, and the runtime and static checks report the same element. Settled: probe; it costs one development callback per container, and the shared report function keeps it to one report.
2. Should a cell or a column probe the grid or row nested in it? For: a forgotten nested grid inside a working cell is a forgotten member. Against: the cell holds content and the nested grid is a grid of its own; the Accordion's content probes no nested accordion; a probe would add a render callback to every cell, the family's most numerous part, for a case the container's probe, the runtime check, and the static check already reach. Settled: no probe.
3. The probe's scope, "whose nearest ancestor carrying one of this part's own attributes is this host" (`specs/forgotten-import-checks.md:192`), lets an `nfsGridX` also probe the cells of an `nfsGridY` nested in one of its cells. Harmful? No: present cells get no report, and a forgotten cell is reported once, by whichever grid runs first. Settled: the shared rule as written; no change asked.
4. Does a placement check keep its message when the parent's own import is forgotten (the XY Grid's check 2, the Float Grid's check 2, the Flex Grid's check 3)? Keeping it: the message says the cell is not a direct child of `nfsGridX`, false for a cell inside the `nfsGridX` element, and it repeats for every cell. A message naming the import: true, but one warning per cell for one defect, outside the shared report function's once-per-subject rule (the shared spec's user story 5). Silence where the parent carries the family's own attribute: the import checks report the one defect once, and the placement check keeps its own job. Settled: silence, by counting the attribute as the parent; an offset under a forgotten `nfsGridY` and a sized column row under a forgotten outer `nfsRow` still warn, because they stay wrong once the import is fixed. This is S2 of [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md), which the orchestrator asked these checks to follow, and which that ticket applied to the Media Object's check 3 and the Sticky's warning 1: decisions 5, 9, and 11 are S2's rule, reached on the same grounds. They go one step further on one point, which proposal 2 adds to S2's text: a warning about a separate misuse that stays wrong once the import is added reads the element as the parent and still fires.
5. Should a cell use the shared parent check (`parent: {directives: ['NfsGridX', 'NfsGridY'], found: ...}`) instead? No: `found` is the result of an optional injection (`specs/forgotten-import-checks.md:164`), and the grids provide no token (XY Grid D14), so every cell of a working grid would get the out-of-reach report M4; the parent check also walks `closest()`, while a cell must be a direct child. Settled: no parent check; the DOM check stays (building-blocks 1.9).
6. Must the Float and Flex Grids' `NfsRow` and `NfsColumn` lines agree, and what does a report name? The Selector manifest's rule 2 requires one selector and one host class, and the host record keys by class name, so the calls must be the same. Neither `nfsDirectiveCheck('NfsColumn')` nor the `nfsColumn` attribute says which grid is meant, so M1 and M2 cannot name one entry point; NFS9001 already names both. Settled: the same calls, and proposal 1.
7. Does `NfsFlexChild` get a parent check, or `NfsFlexContainer` a probe of `NfsFlexChild`? A parent check needs parent directives to name and an optional injection; a Flex child's parent may be a grid, a row, a Button Group, a Media Object, a Card, a `.flex-container`, or the consumer's own flex CSS, and `NfsFlexChild` injects nothing. A container probe would cover one kind of Flex parent out of many. Settled: neither; the family takes the form of the audit's fixer lines X1 to X5 for families whose parts do not nest.
8. The Flexbox Utilities' check 2 under a forgotten grid import (`<div nfsGridX nfsFlexAlign>` without `NfsGridX`): silence, as in question 4, would need a list of every family's Flex parent attributes, a second list beside the Selector manifest (the shared spec's D4), and the Float Grid's `nfsRow` makes no Flex parent while the Flex Grid's does. Settled: the check stays, and its message names the case, so its warning and the runtime check's report on the same element read together. S2 does not reach this check: S2 covers a family's own check of its own parent directive, while a Flex parent belongs to any family.
9. Does `strictParents` change any part? The table (`specs/forgotten-import-checks.md:232-242`) lists none of these families, and none has an optional parent injection. Settled: nothing.

### Triage

| Item | Impact | Confidence | Verdict |
| --- | --- | --- | --- |
| The In-family lines (decisions 1 to 4, 6 to 8, 10, 12, 13) | LOW: development-only checks; `nfsDirectiveCheck`'s arguments are library-internal, and no public API, class, or input changes | HIGH: the shared spec's rule and mechanism, the Accordion's worked example, ADR 0046, building-blocks 1.9 | Decided |
| The placement checks under a forgotten parent (decisions 5, 9, 11, 14) | LOW: the conditions and text of development warnings | HIGH: the shared report function's once-per-subject rule; S2 of the Media Object's re-run is the same rule, reached on its own | Decided |
| Proposal 1, M1 and M2 naming both entry points | LOW: development message text | HIGH: NFS9001's form; the class name carries no grid | Decided |
| Proposal 2, two additions to S2 | LOW: the conditions of development warnings | HIGH: the misuse stays wrong after the import is added, so its warning is no second report of the forgotten import | Decided |

No `OPEN FOR HUMAN`, no ADR, no prototype.

### Proposed shared-file changes (the orchestrator applies)

1. `specs/forgotten-import-checks.md`, Messages: after "Placeholders in angle brackets; `<attr>` is the manifest's spelling." append:

   > Where two manifest directives share a class name (the Float Grid's and the Flex Grid's `NfsRow` and `NfsColumn`), M1 and M2 name both entry points, "<Directive> from '<entry point>' or '<entry point>'", as NFS9001 does, because neither the attribute nor the class name a part passes to `nfsDirectiveCheck` says which grid the component meant.

2. S2 of [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md) (`specs/forgotten-import-checks.md`, In-family checks, a bullet after "- What they cannot see (PEER 7)") is this ticket's rule too, so this ticket proposes no rule of its own in `building-blocks.md` and asks two additions to S2's text: the grids' checks in its list of examples, and the separate-misuse clause (grilling 4). S2 as it would then read:

   > - A family's own development check that reports placement from the DOM alone (building-blocks 1.9; the Media Object's check 3, the Sticky's warning 1, the XY Grid's check 2, the Float Grid's check 2, the Flex Grid's check 3) says nothing for a parent element that carries a parent directive's attribute without its host class: that element is a forgotten import, which `strictDirectiveImports` reports once with the import to add, and the static check in CI, so the placement message never names the wrong fix and the defect is reported once. A warning about a separate misuse that stays wrong once the import is added reads such an element as the parent and still fires (an `offset` under a forgotten `nfsGridY`, a sized column row under a forgotten outer `nfsRow`).

   S1 of the same ticket (the parent check and the child probe also count the host record) serves these families too: a consumer component with `hostDirectives: [NfsGridX]` or `[NfsRow]` carries no attribute, so without S1 its hosted grid or row probes nothing in its template. No line of this ticket depends on S1.

### For other specs

- [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md): the Top Bar's section check 7 reads its bar's class alone (`specs/top-bar.md:200`); under S2 an ancestor that carries `nfsTopBar` or `nfsTitleBar` without its class draws no section warning.
- [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md): proposal 2 asks two additions to its S2; its Media Object and Sticky checks need no change.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), found and not changed, because it lies outside this ticket's items: the Flex Grid's check 3 has no exception for a column row, so the `nfsColumn` of a top-level `<article nfsRow nfsColumn>`, the spec's own Rendered HTML example, warns that it is not a direct child of `nfsRow`, while the Float Grid's check 2 skips a host that is also a row. Proposed fix in `specs/flex-grid.md`, check 3: replace "a parent element that is not a row warns" with "a host that is not also a row, whose parent element is not a row, warns", and in layer 2 after "a column whose parent has no `row` warns once;" add " a column row outside a row does not;".

### Gist for Decisions so far

- [Re-run: layout system and flex utility family specs, In-family check lines](issues/155-rerun-layout-system-and-flex-utility-family-in-family-lines.md) -- the XY, Float, and Flex Grids and the Flexbox Utilities gain their In-family lines: the grid container probes its grids, each grid its cells, and each row its columns, while cells and columns probe nothing; no part of the four families has a parent check, a peer, a parent token, or a `strictParents` effect; the Float and Flex Grids' `NfsRow` and `NfsColumn` make the same calls, and a report of a forgotten one names both entry points (proposed for M1 and M2); `NfsFlexAlign` records itself under `NfsFlexContainer`; the grids' placement checks count an element carrying the parent's attribute as the parent, so a forgotten grid or row import is reported once by the import checks (S2 of [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](issues/154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md), with two additions proposed), and the Flexbox Utilities' not-a-Flex-parent message names that cause; impact LOW, confidence HIGH; no ADR.
