# 177. Re-run: specs without the later-milestone families, group b

Type: grilling
Status: resolved
Blocked by: 174
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md) has every first-milestone spec stop assuming the eight later-milestone families. What do `specs/equalizer.md`, `specs/forms.md`, `specs/label.md`, `specs/magellan.md`, `specs/media-object.md`, `specs/menu.md`, `specs/off-canvas.md`, `specs/orbit.md`, `specs/pagination.md`, `specs/responsive-embed.md`, `specs/responsive-menu.md` say without them?

## How to work it

Opus, AFK. In each spec: every directive of the eight families (`nfsGridX`, `nfsCell`, `nfsRow`, `nfsColumn`, `nfsShowForSr`, `nfsHideFor`, `nfsTextAlign`, `nfsFlexContainer`, `nfsPrototype...`, and so on) in an example, story, test, or API text becomes the Foundation class it applies, written as a normal class (`class="grid-x"`, `class="show-for-sr"`), and each such example's `imports` drops the directive; no link to the eight specs or their tickets remains; a behaviour that relied on one of them is restated as the Foundation classes the consumer writes, with Foundation's global styles loaded; the Variant declaration tooling keeps only the first milestone's registries. Each changed spec's governing ticket gets a dated amendment.

## Answer

Done 2026-09-30 on Opus 5.5, AFK, by the ticket's agent alone (no forks). Each spec was read at d5a1eee (none of the eleven changed in f2e47fb) and searched for the eight families' directives, class names, entry points, spec links, and ticket links. All eleven specs changed, and each governing ticket gained a dated `### Amendment, 2026-09-30 (later-milestone families)` that records what changed and links [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md).

| Spec | Governing ticket | Lines at BASE | Lines now | Families it relied on |
| --- | --- | --- | --- | --- |
| `specs/equalizer.md` | [Re-run: Equalizer spec under the class rule](126-rerun-equalizer-class-rule.md) | 576 | 576 | XY Grid, Flexbox Utilities, Float Grid |
| `specs/forms.md` | [Spec: Forms](98-spec-forms.md) | 569 | 568 | XY Grid, Typography Helpers, Float Classes, Flexbox Utilities, Visibility Classes |
| `specs/label.md` | [Spec: Label](94-spec-label.md) | 465 | 465 | Visibility Classes |
| `specs/magellan.md` | [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md) | 696 | 696 | XY Grid, Visibility Classes |
| `specs/media-object.md` | [Spec: Media Object](91-spec-media-object.md) | 479 | 479 | Flexbox Utilities, XY Grid |
| `specs/menu.md` | [Spec: Menu](85-spec-menu.md) | 528 | 528 | Visibility Classes, Flexbox Utilities |
| `specs/off-canvas.md` | [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md) | 767 | 767 | Visibility Classes, XY Grid |
| `specs/orbit.md` | [Re-run: Orbit spec under the class rule](125-rerun-orbit-class-rule.md) | 705 | 705 | Visibility Classes |
| `specs/pagination.md` | [Spec: Pagination](87-spec-pagination.md) | 522 | 521 | Typography Helpers, Visibility Classes |
| `specs/responsive-embed.md` | [Spec: Responsive Embed](96-spec-responsive-embed.md) | 440 | 440 | XY Grid, Visibility Classes, Float Classes |
| `specs/responsive-menu.md` | [Re-run: Responsive Menu spec under the class rule](115-rerun-responsive-menu-class-rule.md) | 784 | 784 | Visibility Classes |

### Decisions

1. A family's directive becomes the Foundation class it applied, written in the element's `class` attribute beside any first-milestone directive on that element (`<div nfsCallout class="flex-child-grow">`, `<button nfsButton class="hide-for-large">`, `<span class="show-for-sr">`), and each example's `imports` drops the directive (Equalizer: `NfsRow`, `NfsColumn`; Magellan: `NfsGridX`, `NfsCell`; Orbit and Responsive Menu: the visibility directive). A Variant value becomes its class name: `[size]="{medium: 4}"` is `medium-4`, `[up]="{small: 1, medium: 2, large: 4}"` is `small-up-1 medium-up-2 large-up-4`, `gridMarginX` is `grid-margin-x`, `alignSelf="middle"` is `align-self-middle`, `alignY="middle"` is `align-middle`, `nfsTextAlign="center"` is `text-center`, `hideFor="large"` is `hide-for-large`. LOW, HIGH.
2. Each sentence that said the consumer or a story writes no class is narrowed to the classes a first-milestone directive binds, with the ruling's exception named (ADR 0039's exception for a family with no first-milestone spec): the story-markup paragraphs of Equalizer, Magellan, Off-canvas, and Media Object, the Problem Statement lines of Label and Pagination, Orbit's Solution, user story 1, and Rendered HTML note, and Responsive Menu's Rendered HTML lead, SSR fixture, and class-rule Note. LOW, HIGH.
3. Behaviour that relied on a family is restated as the classes the consumer writes: Equalizer's CSS answer (grid and flex classes) and its float-grid residue; the Media Object's flexbox-build alignment (`align-self-<y>`, `align-<y>`), which the records never strip, so the documented path is now the class itself, with its browser-level composition case asserting that a static flex class stays beside the records; Off-canvas's Trigger hidden at the reveal breakpoint (`hide-for-<bp>`); Magellan's select-versus-navigation note (`hide-for-large`, `show-for-large`); Pagination's centring (`text-center`); the icon-only and back-button hidden text in Label, Menu, Orbit, and Responsive Menu (`show-for-sr`). LOW, HIGH.
4. Decision rows whose reason was a family's ownership are rewritten in place, and no row is removed, so no number moves: Equalizer D1, D14, D15; Forms D15; Media Object D4, D9; Orbit D26; Pagination D7, D10; Responsive Menu D23 (its rejected "consumer-written `show-for-sr` class (forbidden by ADR 0039)" is now the decision). A rejected alternative that had read "a second owner of a Visibility class" now reads as an owner of another family's class. User stories are rewritten in place. LOW, HIGH.
5. Menu D12 keeps its rejected `alignX` and the collision [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md) measured, and names the Flexbox Utilities' alignment directive as one that a later milestone adds. The measurement still decides `align` for when that milestone lands, so dropping it would lose a reason; it is the one sentence in the eleven specs that names a later-milestone directive, as the brief allows. LOW (additive text), HIGH.
6. Two "Foundation behaviour changed or dropped" bullets go (Forms' `.text-right`, `.float-*`, and grid classes; Pagination's `.text-center`), because the classes are now written exactly as Foundation writes them, so nothing changed. LOW, HIGH.
7. The Variant declaration tooling: none of the eleven specs names a registry or Variant property of the eight families. The registries they name are the Label's `NfsLabelPaletteOverrides`, the shared `NfsFoundationPaletteOverrides`, the Responsive Embed's `NfsResponsiveEmbedRatiosOverrides`, and the Breakpoint service's `NfsBreakpointClassesOverrides`, all first-milestone, so nothing changed there. LOW, HIGH.
8. Kept: the Equalizer's Storybook stylesheet order (`foundation-grid` before `foundation-everything` for `equalizer--float-grid`) without its Float Grid link, Orbit's and Off-canvas's reliance on Foundation's typography base, and the Drilldown's `invisible` binding in Responsive Menu's Sass note; these are Foundation's global styles, not the later specs. Foundation's docs-page names ("the Flexbox Utilities" beside `foundation-flex-classes` in the Media Object's contract table; "the Visibility Classes have no first-milestone spec" in dated decision rows) stay, because they name no directive and link nothing. LOW, HIGH.

### Triage

No item is HIGH impact: each decision follows the ruling's decisions 2, 3, and 5, changes no API, default, or rule of a first-milestone directive, and is undone by restoring text. Every item is LOW impact with HIGH confidence. Nothing is OPEN FOR HUMAN.

### Verified and inferred

- Verified by reading: each rewritten class exists in Foundation 6.9's Sass (`.#{$size}-order-#{$i}` in `components/_flex.scss`, `.align-self-#{$vdir}` and `.align-#{$vdir}` there, `.show-for-#{$size}` and `.hide-for-#{$size}` in `components/_visibility.scss`, `.#{$-zf-size}-up-#{$i}` in `xy-grid/_classes.scss`, `.text-#{$align}` in `typography/_alignment.scss`); that `NfsMenu`'s class record holds only its three `align-*` classes (Menu binding rule) and that the Media Object records hold only `stack-for-<zero>`, `middle`, `bottom`, and `main-section`.
- Inferred, not measured here: that a static `class` attribute written beside `nfsCallout`, `nfsButton`, `nfsMediaObjectSection`, or `nfsStickyContainer` survives their host class bindings. It rests on the specs' own measured statement (the Menu spec's record: "the consumer's own classes stay") and Angular's styling resolution as the Media Object's binding rule states it.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone families](179-task-shared-documents-later-milestone-families.md). Each quote is written relative to its target file, and each follows from this group's rewrites.

1. `building-blocks.md`, the Equalizer row (line 295): replace "(neither binds a class; the grid, flex, callout, and card classes on and around them are set by those components' own directives, placed beside them, [ADR 0039](adr/0039-directives-manage-every-foundation-class.md))" with:

   > (neither binds a class; the callout and card classes on and around them are set by those components' own directives, placed beside them, and the grid and flex classes are Foundation's normal classes, [ADR 0039](adr/0039-directives-manage-every-foundation-class.md))

   and replace "its classes set by the XY Grid, Flexbox Utilities, Callout, and Card directives" with:

   > its grid and flex classes written as Foundation's normal classes and its callout and card classes set by the Callout and Card directives

2. `building-blocks.md`, the Media Object row (line 356): replace "flexbox alignment is `nfsFlexChild alignSelf` and `nfsFlexAlign` written beside" with:

   > flexbox alignment is Foundation's `align-self-<y>` and `align-<y>` classes, written as normal classes

3. `storybook-conventions.md` section 8, the demo-scaffolding item (line 320): replace "takes its look from Foundation's CSS through the library's directives, never through a class written in the story (ADR 0039); each directive is imported from its entry point and listed in `moduleMetadata.imports`:" with:

   > takes its look from Foundation's CSS through the first milestone's directives, each imported from its entry point and listed in `moduleMetadata.imports`, and, for a family with no first-milestone spec, through Foundation's own classes written as normal classes (ADR 0039's exception):

   and replace its layout, flex layout, text and lists, visibility, and floats bullets (lines 322 to 326) with:

   > - layout, flex layout, text and lists, visibility, and floats: Foundation's classes written as normal classes (`grid-x`, `cell`, `medium-4`, `flex-container`, `align-self-middle`, `text-center`, `no-bullet`, `show-for-sr`, `hide-for-large`, `float-right`); the float grid's `row` and `column` only in the stories that show that grid (`equalizer--float-grid`); scaffolding never writes an order class or a reverse direction class, which change only the visual order (building-blocks 1.10);

4. `storybook-conventions.md`, the checklist item (line 362): replace "Demo scaffolding uses the directives of the CSS-only components and utility families, the Prototyping Utilities' attributes among them (section 8);" with:

   > Demo scaffolding uses the directives of the CSS-only components, and Foundation's own classes, written as normal classes, for the families with no first-milestone spec (section 8);

### Gist for Decisions so far

- [Re-run: specs without the later-milestone families, group b](issues/177-rerun-specs-without-later-families-group-b.md) -- the Equalizer, Forms, Label, Magellan, Media Object, Menu, Off-canvas, Orbit, Pagination, Responsive Embed, and Responsive Menu specs write the grid, flex, text-alignment, float, and visibility classes as Foundation's normal classes (`class="grid-x"`, `class="cell medium-4"`, `class="align-self-middle"`, `class="text-center"`, `class="hide-for-large"`, `<span class="show-for-sr">`) beside their own directives, drop those families' directives from every example's `imports`, and link none of the eight later-milestone specs; the Media Object's flexbox alignment and the Equalizer's CSS answer are now Foundation's classes as written; Menu D12 keeps its measured `alignX` collision against the directive a later milestone adds.
