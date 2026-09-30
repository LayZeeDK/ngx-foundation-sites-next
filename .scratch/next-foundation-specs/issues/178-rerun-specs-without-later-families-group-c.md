# 178. Re-run: specs without the later-milestone families, group c

Type: grilling
Status: resolved
Blocked by: 174
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md) has every first-milestone spec stop assuming the eight later-milestone families. What do `specs/responsive-toggle.md`, `specs/reveal.md`, `specs/slider.md`, `specs/sticky.md`, `specs/switch.md`, `specs/table.md`, `specs/tabs.md`, `specs/thumbnail.md`, `specs/toggler.md`, `specs/top-bar.md`, `specs/variant-declaration-tooling.md` say without them?

## How to work it

Opus, AFK. In each spec: every directive of the eight families (`nfsGridX`, `nfsCell`, `nfsRow`, `nfsColumn`, `nfsShowForSr`, `nfsHideFor`, `nfsTextAlign`, `nfsFlexContainer`, `nfsPrototype...`, and so on) in an example, story, test, or API text becomes the Foundation class it applies, written as a normal class (`class="grid-x"`, `class="show-for-sr"`), and each such example's `imports` drops the directive; no link to the eight specs or their tickets remains; a behaviour that relied on one of them is restated as the Foundation classes the consumer writes, with Foundation's global styles loaded; the Variant declaration tooling keeps only the first milestone's registries. Each changed spec's governing ticket gets a dated amendment.

## Answer

Worked by Opus 5.5, AFK, under [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md). All eleven specs changed; each governing ticket has an `### Amendment, 2026-09-30 (later-milestone families)` listing the edits.

| Spec | Governing ticket | What changed |
| --- | --- | --- |
| `specs/responsive-toggle.md` | [Re-run: Responsive Toggle spec under the class rule](116-rerun-responsive-toggle-class-rule.md) | Hamburger name: `span class="show-for-sr"`; the sticky-title-bar story's scroller writes `overflow-y-scroll`; the Solution says the Visibility classes the plugin binds are Foundation's global rules, which the consumer loads |
| `specs/reveal.md` | [Re-run: Reveal spec under the class rule](110-rerun-reveal-class-rule.md) | `p.lead` is Foundation's `.lead` as a normal class |
| `specs/slider.md` | [Re-run: Slider spec under the class rule](124-rerun-slider-class-rule.md) | The data binding example writes `grid-x grid-margin-x`, `cell small-10`, `cell small-2` |
| `specs/sticky.md` | [Re-run: Sticky spec under the class rule](120-rerun-sticky-class-rule.md) | Column examples, Rendered HTML, and stories write `grid-x` and `cell small-6`; `nfsStickyContainer` sits on the cell; the overflow story writes `overflow-hidden`; D18 and D19 rewritten |
| `specs/switch.md` | [Re-run: Switch spec, out-of-scope survivors](147-rerun-switch-out-of-scope-survivors.md) | `.show-for-sr` and side-by-side layouts are Foundation's normal classes |
| `specs/table.md` | [Spec: Table](92-spec-table.md) | "Scroll regions elsewhere" and D16: the XY Grid's cell blocks are a later milestone's; a first-milestone consumer writes the region attributes on a cell-block `div` itself |
| `specs/tabs.md` | [Re-run: Tabs spec under the class rule](108-rerun-tabs-class-rule.md) | Both vertical examples and `tabs--vertical` write `grid-x`, `cell medium-3`, `cell medium-9`; the Sass sentence names Foundation's global styles |
| `specs/thumbnail.md` | [Spec: Thumbnail](97-spec-thumbnail.md) | Hiding uses Foundation's `.hide`; the gallery writes `grid-x small-up-2 medium-up-3` and `cell` |
| `specs/toggler.md` | [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md) | The XY Grid mapping row: normal classes, no directive |
| `specs/top-bar.md` | [Re-run: Top Bar spec, out-of-scope survivors](148-rerun-top-bar-out-of-scope-survivors.md) | `.show-for-sr` is a normal class in the mapping, the naming rule, the ARIA row, and the example |
| `specs/variant-declaration-tooling.md` | [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md) | 10 first-milestone registries; the 16 later rows and the count kind move to a "Later milestone" subsection; the later families' `mixins` and `uses` entries are gone |

### Decisions

1. Every later-family directive in an example, story, test, or API text of the eleven specs is now the Foundation class it applied, written as a normal class, and no example or story imports it: `show-for-sr`, `lead`, `grid-x`, `grid-margin-x`, `cell` with its sizes, `small-up-2 medium-up-3`, `hide`, `overflow-hidden`, and `overflow-y-scroll`. Each class-rule sentence that said "no Foundation class" now names that exception. The Storybook preview already compiles `foundation-everything($prototype: true)` (Storybook conventions), so the stories' classes have their CSS.
2. No link to the eight specs or their tickets remains in the eleven specs. Mentions of the later families by name are kept only where a sentence says a later milestone adds them (Table, Thumbnail's Out of Scope, the tooling's Later milestone subsection) or where the text names Foundation's own classes, mixins, or layout (the XY Grid classes, `foundation-visibility-classes`, `foundation-xy-grid-classes`).
3. Behaviour that relied on a later family, restated as the classes the consumer writes: Thumbnail's hiding rule (Foundation's `.hide`, not the Visibility directive); Sticky's grid-cell container (`nfsStickyContainer` on a `class="cell"` element); the Table's Scroll region elsewhere (the consumer writes `tabindex`, `role`, and the name on a cell-block `div`); the Responsive Toggle's breakpoint switch (the plugin keeps binding Foundation's Visibility classes; the spec now says they come from Foundation's global styles).
4. The Variant declaration tooling keeps the 10 first-milestone registries. The 16 registries of the Prototyping Utilities, the three grids, and the Flexbox Utilities, and every count piece (manifest kind and shape, property format production, declaration member, drift row, M10, the count helpers, typings-check clauses, tests), sit in a "Later milestone" subsection that says the later milestone adds them. Examples that used `$grid-columns: 16` or a prototype size now use a `huge` button size and a `'21by9'` embed ratio. The later families' Known `mixins` and `uses` entries were removed; they are in the spec as committed before this ticket (the manifest bullets from "Known `mixins` today" to "Known `uses` under `NfsXyBlockGridMaxOverrides`"), for the later specs to carry.

### Triage

- The Responsive Toggle's visibility classes (the ruling's decision 5 names them). Applied: the plugin keeps its `hideFor` host bindings of `.hide-for-<bp>` and `.show-for-<bp>`; the spec states that these are Foundation's global rules, which the consumer loads. The alternative, the consumer writing those classes, would change the decided `hideFor` Option and the server-HTML and hydration design, which the ruling does not address. Impact LOW (no API change), confidence HIGH (the ruling assumes Foundation's global styles are loaded, and the class-rule exception allows, but does not require, a consumer-written class).
- The count kind of the tooling. Applied: it moves with the count registries to the later milestone. Impact LOW (the manifest is internal; the helper exports and the `count` kind come back additively, ADR 0045), confidence HIGH (decision 4 keeps only what the first milestone needs, and no first-milestone spec reads a count registry or a count helper, searched across `specs/`).
- Sticky's D19 now chooses what it rejected before ("Foundation's `.overflow-hidden` class in the story"). Impact LOW, confidence HIGH (decision 3 lets stories write the classes of a family with no first-milestone spec).
- Thumbnail's `.hide`: that it beats `.thumbnail`'s `display: inline-block` is read from Foundation's `_visibility.scss` (`display: none !important`), not measured as `.is-hidden` was. Impact LOW, confidence HIGH.

Nothing is OPEN FOR HUMAN.

### Proposals for the shared documents

For [Task: shared documents for the later-milestone families](179-task-shared-documents-later-milestone-families.md):

1. `building-blocks.md`, Table C, the Variant declaration tooling row:

   > Types in the primary entry point (the first milestone's 10 Variant registries, `NfsOverridableStringUnion`, the Class breakpoint types, `NfsFoundationPaletteColor`, `NfsVariantBoolean` and `nfsVariantBoolean`; the later milestone adds its families' 16 registries and the count helpers `NfsOverridableCount`, `NfsOverridableCountValue`, and `NfsRange`)

2. `building-blocks.md` 1.3 and 1.4: the alias example `NfsCellSize` (1.3) becomes `NfsLabelColor`, and the 1.4 bullet "A count is `NfsOverridableCount`, ..." gains "(the later milestone's count families; no first-milestone family is a count)".
3. ADR 0040, a dated note:

   > 2026-09-30 ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)): the first milestone ships the 10 registries of its families, all names registries. The 16 registries of the later families and the count kind (the manifest's `count`, the count helpers, M10) arrive with those families; the 2026-09-28 note on `$grid-column-count` and `$block-grid-max` applies then.

4. `CONTEXT.md`: the Open Variant family, Variant manifest, Declaration drift, and Variant property entries mention a count; each gains "(a count arrives with the later milestone's families)", or the orchestrator keeps them as written for the whole library.
5. `storybook-conventions.md`: no change for these eleven specs beyond the rule 179 already lists; the preview's `foundation-everything($prototype: true)` already emits the grid, visibility, and prototype classes their stories now write. The scaffolding list (spacing, sizing, display, overflow as Utility attributes) becomes Foundation's classes.

### Gist for Decisions so far

- [Re-run: specs without the later-milestone families, group c](issues/178-rerun-specs-without-later-families-group-c.md) -- the Responsive Toggle, Reveal, Slider, Sticky, Switch, Table, Tabs, Thumbnail, Toggler, Top Bar, and Variant declaration tooling specs no longer name or link the eight later families: examples and stories write Foundation's own classes (`show-for-sr`, `grid-x`, `cell small-6`, `hide`, `overflow-hidden`) with Foundation's global styles loaded, and each class-rule sentence names that exception. Behaviour is restated the same way: Thumbnail hides with `.hide`, Sticky's container sits on a `class="cell"` element, and the Responsive Toggle keeps binding Foundation's Visibility classes from the global styles. The Variant declaration tooling ships 10 names registries; the 16 later registries and the whole count kind move to a Later milestone subsection. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.
