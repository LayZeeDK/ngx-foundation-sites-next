# 163. Spec: build-time checks (later milestone)

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) specifies build-time checks: the Library mixins' `@error` and `@warn` checks (contrast, registry, and name checks, and presence markers read only by a check) and the Variant declaration tooling's check mode (the CI sync check and its messages), for a later milestone of the implementing repository. What is that spec?

## How to work it

Opus 5.5, AFK under the map's triage rule. Write `specs/build-time-checks.md` in the map's spec shape and `/to-spec`'s sections, from the extraction manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs as committed at that ticket: its Problem Statement says it is planned and implemented in a later milestone and why (the ruling), and that the user wants the kinds weighed against each other in practice; it holds every check of its kind, per component, with its design as the specs gave it (its trigger, its message, its cost, its tests), so the later milestone loses nothing; its Testing Decisions keep the tests the checks had; and a closing section lists, per component spec, what the later milestone adds back to that spec when it lands. A check the manifests classify under another kind is left to that kind's spec; a boundary case is decided under the triage rule and recorded. The spec may name and link any component spec; no component spec links back to it.

## Answer

Resolved 2026-09-30 by self-grilling (AFK, Opus 5.5), from the seven manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs at `53144f3`, plus the finds that the finished re-runs [Re-run: specs without checks, group a](165-rerun-specs-without-checks-group-a.md), [Re-run: specs without checks, group e](169-rerun-specs-without-checks-group-e.md), and [Re-run: specs without checks, group f](170-rerun-specs-without-checks-group-f.md) record for the deferred specs (read at HEAD). Spec: [specs/build-time-checks.md](../specs/build-time-checks.md).

### Decisions

1. One spec holds both halves of the kind, the Library mixin checks and the Variant declaration tooling's check mode, as the ruling's item 1 names one spec per kind (D1).
2. The checks are grouped per component spec, alphabetically, one id per manifest entry (`button/1`, `dropdown-menu/4`), with ten shared mechanisms said once and pointed to from each entry (S1 to S10): the exact ratio, where a check lives, error or warning, messages and cost, containers checking their own backgrounds, the focus border, the current link's fill, the menu arrows and sizes, widths at 320 CSS px, and Foundation's picked text colour (D2).
3. Each check keeps the severity, message shape, trigger, and tests its spec gave it; nothing is unified (D3). Each entry lists only its spec's check cases; the same test bullets' CSS-output assertions stay with the component spec.
4. The exact contrast helper stays in the first milestone, because three CSS rules use it (Badge D9, Label D9, Progress Bar D8), where only those specs name it; every other spec regains its mention with its checks (D4). This agrees with group a's decision 9 and reads group f's find 2 ("also live only there now") as true for group f's specs: the Top Bar's false-pass test of the helper returns in top-bar/1.
5. The checks-only mixins `nfs-abide`, `nfs-forms`, `nfs-title-bar`, `nfs-top-bar`, and `nfs-typography-base`, and `nfs-media-object`, whose only output is a presence marker, exist only in this milestone; a consumer adds their includes when it lands (D5). Groups a and f removed `nfs-abide`, `nfs-title-bar`, `nfs-top-bar`, and `nfs-typography-base` the same way.
6. ADR 0012's import-order guard is a build-time check, G1, with the message and fixtures that [Sass packaging for the new library](57-sass-packaging.md) measured: the library emits its CSS the same without it, because importing emits nothing and every mixin reads Foundation only when included (D6; the orchestrator's note).
7. Presence markers, P1 to P5, are written by this spec and read by the Runtime checks spec: the four flag-gated properties (`--nfs-button-responsive-expanded`, `--nfs-flexbox-responsive-breakpoints`, `--nfs-media-object-section`, the sixteen `--nfs-prototype-<flag>-breakpoints`) and, from group a's decision 5, the Breakpoint properties `--nfs-breakpoint-<name>` (D7). They are taken from their owner specs at `53144f3`, because the group manifests list them only as data a Runtime check reads or as kept.
8. The tooling's check mode takes the builder's `check` option and configuration, `nx sync:check` and the CI steps, the drift report, M2's check form, M3 (the ruling's "the one for a stylesheet with no Variant properties"), M4 to M7 on a hand-written file, and M13's CI line; generate mode keeps M1, M2's thrown form, M8 to M12, and the rest of M13, including the `declare global {}` hint that group f kept (D8; group f's find 3).
9. A migration adds the `check` configuration to `nfs-variants` targets the first milestone wrote, because the setup generator adds a target only when a project has none (D9).
10. Landing path (group f's find 1): the checks land as specified, each `@error` with an Angular major, when the first milestone has been published before this spec lands; `@warn`s, presence markers, checks in a checks-only mixin the consumer must newly include, and the check step are additive and may land in any release; the failures the check adds to write mode and the sync generator (M3, M4 to M7) and G1 count as compile stops. A `@warn` first and an opt-in flag were weighed and not taken (D10, Rollout).
11. A check one spec quotes and another owns is taken once from its owner: the Nested menu's 1.4.10 row is dropdown-menu/4, and the Accordion Menu's "the Nested menu's check" is accordion-menu/1 under the Nested menu's rule nested-menu/1 (D11). The closing section lists every quoting spec (Button Group, Magellan, Nested menu, Responsive Accordion Tabs, Responsive Menu, Responsive Toggle, Sticky) with the sentence the later milestone adds back.
12. The closing section lists, per component spec, the check ids, their tests, and the sections whose sentences name them, by section name at `53144f3`; the Source map lists all 77 `build-time` headings of the manifests (75 counted, and two that record a component with no check) with where each lands.
13. The later milestone restores the Tabs spec's D26 rule that every tab strip includes `nfs-tabs`, which group e dropped with the checks.

### Boundary cases

- The Variant typings check (manifest f): the library's own post-build gate; left out, it stays in the Variant declaration tooling spec (the orchestrator's note; the ruling's item 3).
- The "Declaration drift" glossary term (manifest shared): a term, not a check; generate mode rewrites on the same drift, so it stays in the glossary and this spec uses it.
- The one-writer rule of building-blocks 1.13 (manifest shared, one entry with the flag-gated markers): a rule on who writes a Variant property, which the first milestone keeps; left out, and every spec already names its writer.
- The Button Group entry (manifest shared): no check of its own; `button/1` covers it.
- The ADR 0040 superseded first draft (manifest shared): excluded by its manifest; recorded in the Source map, not a check.
- The Toggler's and the XY Grid's "not present" headings (manifest f): recorded, not counted.
- Presence markers: group a (decision 7) classifies the flag-gated properties as presence markers read only by a check, which the ruling puts under build-time checks; group f's find 4 sends them to the Runtime checks spec. This spec takes their Sass side; the Runtime checks spec should read them and not copy their writing. The Media Object and Flexbox Utilities manifests list them as kept; group b's and c's re-runs should remove them, as group a did for the Button.
- The Badge spec's Sass item 1(c) and WCAG row cite "D8" for the check, whose row is the live-role decision (group a's find); badge/1 cites D9 and D10 instead and names the stray label.
- The orchestrator's note on sweeps that left checks out: every build-time check quoted by another spec (Button Group, Magellan, Nested menu, Responsive Accordion Tabs, Responsive Menu, Responsive Toggle, Sticky, Off-canvas, Reveal, Accordion Menu) is in its owner's manifest; none had to be taken from an owner spec. Group e's two Tabs Sass cases (the compile stop on Foundation's defaults and at `$tab-content-background: $primary-color`) are in tabs/1.
- The map's Out of scope line on base element styles (group f's find 8) names `nfs-typography-base`; the map is the orchestrator's.

### Triage

- Decisions 1 to 3, 11 to 13 and every boundary case: impact LOW (a spec's layout and sources; nothing ships from it before the later milestone), confidence HIGH (the ruling, the manifests, the specs at `53144f3`).
- Decisions 4, 5, 7, 8, 9: impact LOW to MEDIUM (what the first milestone's Sass and tooling output; restoring any of it later is additive), confidence HIGH (the ruling's items 3 and 4, the specs' own words: "read only by the Runtime checks and not in the Variant manifest", "Rules: none", "emits no CSS").
- Decision 6: impact LOW (a message at import for an order the docs forbid), confidence HIGH (the ruling; the orchestrator's note; the measured fixtures).
- Decision 10: impact MEDIUM (when consumers see the checks), confidence HIGH (ADR 0045 and the Typography Helpers spec's D9 at `53144f3`). The later milestone's planning may revisit the landing path; it is not OPEN FOR HUMAN.

Nothing is OPEN FOR HUMAN. T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) stays OPEN FOR HUMAN; S2 follows the one-mixin-per-export-mixin rule as recorded and says so.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md). Each quote is written relative to its target file. They add to the shared manifest's entries.

`building-blocks.md`:

1. 1.10, first bullet: replace "where axe has no rule, the mixin checks at compile time with the exact WCAG relative-luminance formula, computed by one library-internal Sass helper with `math.pow` that composites a translucent colour over `$body-background` first;" with:

   > where axe has no rule, the spec states the Sass settings that make the pair pass, and a Library mixin rule that needs a contrast ratio (the Badge's and the Label's text-colour correction, the Progress Bar's meter text) computes it with the exact WCAG relative-luminance formula, by one library-internal Sass helper with `math.pow` that composites a translucent colour over `$body-background` first;

   and replace "or only checks it, as `nfs-button` does for buttons and button groups, whose error then names the other candidate's ratio." with:

   > or states the required setting, as the Button spec does for buttons and button groups.

2. 1.10, the Target size and non-text contrast bullet: replace from "a `max(24px, <setting>)` floor or a compile-time `@error` on sizes" through "(Abide's `nfs-abide`, added by the [Consistency review and bundle index](issues/36-consistency-review.md))." with:

   > a `max(24px, <setting>)` floor, and, for sizes and colour pairs a consumer setting can fail, the required settings each spec states; axe-core 4.13.0, the version the Storybook conventions pin, has no 1.4.11 rule, so the story gate does not cover it, and each such story asserts the ratio in its play function where it can.

3. 1.10, the per-component bullets (Button, Forms, Abide, Close Button, Top Bar, Button Group, Callout, Progress Bar, Pagination, Breadcrumbs, Switch, Badge, Card, Label, Prototyping Utilities, Typography Helpers, Table, and the Tabs bullet near the end) and the last-but-two bullet ("specs enforce those through Library mixin floors, compile-time contrast checks with the exact unrounded ratio, and e2e geometry"): drop each clause that says a mixin stops the compile, warns, or checks, and each "checks-only" mixin; keep every CSS rule and every required setting. The last-but-two bullet's clause reads "specs enforce those through Library mixin floors, required settings, and e2e geometry".
4. 1.13, the Variant properties bullet: remove the sentence from "A family that a Sass flag gates gets a Variant property of its own" through "([Spec: Table](issues/92-spec-table.md), D5)."; keep the one-writer rule without its reason clause "because an empty property reads like a missing one, so a second writer would keep a property present while the first include is missing and hide it from `strictVariantProperties` ([Spec: Button Group](issues/82-spec-button-group.md), D11)", which the Runtime checks spec owns.
5. 1.13, the Variant declaration file bullet: replace "It is kept in step by an Nx task sync generator registered on each covered project's own targets, with `nx sync:check` as a required CI step, or on the Angular CLI by the Architect builder behind each project's `nfs-variants` target, whose `check` configuration runs in CI." with:

   > It is kept in step by an Nx task sync generator registered on each covered project's own targets, or on the Angular CLI by the Architect builder behind each project's `nfs-variants` target.

6. 1.13, the Tabs paragraph: replace ", and compile-time contrast checks of every strip's text and selected look and of the `primary` bar's pairs, so every application with a tab strip includes it;" with:

   > , which an application that uses `simple` or `primary` includes;

7. Tables A and D: in the Abide, Responsive Toggle, Close Button, Switch, Menu, Top Bar, Pagination, Breadcrumbs, Callout, Card, Table, Badge, Label, Progress Bar, Forms, Prototyping Utilities, and Typography Helpers rows, drop the check clause (`@error`, `@warn`, "compile-time checks", "checks-only") and the checks-only mixins; the Top Bar row keeps "one Library mixin, `nfs-menu-icon`", the Typography Helpers row keeps `nfs-typography-helpers` with its grid margin rule, and the Media Object row drops `nfs-media-object`.

`architecture-guide.md`, P17: replace "the spec states the Sass settings or the smallest Library mixin rule that makes it pass, with a compile-time check where axe has no rule, computed with the exact WCAG formula of ADR 0022's dated note, never Foundation's `color-luminance()` or `color-contrast()`;" with:

> the spec states the Sass settings or the smallest Library mixin rule that makes it pass, and quotes each ratio by the exact WCAG formula of ADR 0022's dated note, never Foundation's `color-luminance()` or `color-contrast()`;

and in Preferred, replace "`nfs-switch` stopping the compile on a 1.6:1 track with the exact formula" with "the Switch spec requiring `$switch-background: #767676` for a 1.6:1 default track".

`CONTEXT.md`:

- **Variant declaration file**: replace "kept in step by a sync step and checked for Declaration drift in CI." with "kept in step by a sync step."
- **Library mixin**: unchanged (it names no check).
- **Breakpoint properties**: add at the end: "Written in a later milestone of the implementing repository; the first milestone's `nfs-breakpoint-properties` writes only `--nfs-breakpoint-classes`."
- **Declaration drift**: unchanged (boundary case above).

`storybook-conventions.md`, section 5:

- `preview.scss`: remove the lines `@include nfs-title-bar; // Top Bar: title-bar contrast checks`, `@include nfs-top-bar; // Top Bar: Top Bar contrast checks`, `@include nfs-typography-base; // ...`, and `@include nfs-media-object; // ...`; in the comments of the `nfs-table`, `nfs-switch`, `nfs-badge`, `nfs-label`, `nfs-card`, `nfs-off-canvas`, and `nfs-typography-helpers` lines, drop "contrast checks", "the table contrast checks", "contrast and height checks", and "text contrast check"; in the `nfs-flexbox-utilities` comment, replace "--nfs-flex-source-ordering-count and --nfs-flexbox-responsive-breakpoints for the Runtime checks" with "--nfs-flex-source-ordering-count".
- `_settings-overrides.scss` comments: drop each clause "and nfs-<mixin> stops the compile" (Tabs, Top Bar, Breadcrumbs, Switch, Orbit, Slider, Off-canvas, Progress Bar, Table, Badge, Label, Typography Helpers); each override keeps its criterion, spec, and story.
- Replace "A Library mixin that refuses to compile with a Foundation default (the Slider's fill contrast check) is satisfied through `_settings-overrides.scss`, never by skipping its include." with:

  > A required setting is set in `_settings-overrides.scss`, never by skipping a Library mixin's include.

ADRs, each a dated note (after the last one):

- [ADR 0012](../adr/0012-sass-packaging.md):

  > 2026-09-30 ([Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md), under [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): in the first milestone the guard that fails the compile when Foundation was not imported first, every Library mixin's compile-time checks, the checks-only mixins (`nfs-abide`, `nfs-forms`, `nfs-title-bar`, `nfs-top-bar`, `nfs-typography-base`), the flag-gated Variant properties, and the `--nfs-breakpoint-<name>` Breakpoint properties with their use of `-zf-bp-to-em` are specified by the build-time checks spec and planned for a later milestone; importing Foundation first is documented usage, a component that needs only checks has no Library mixin, and `nfs-breakpoint-properties` writes `--nfs-breakpoint-classes` only.

- [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md) (outside the shared sweep's scope, and it states the compile-time checks):

  > 2026-09-30 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): in the first milestone a failing Foundation default is a required setting that the spec's Sass subsection and WCAG row state, and the story gate with its play functions is the enforcing check; the compile-time checks, the "compile error or warning" of the first consequence, and the checks-only `nfs-abide` mixin are specified by the [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md) and planned for a later milestone. The exact formula stays the one every spec quotes ratios with, and the library's helper for it ships for the CSS rules that pick a text colour.

- [ADR 0039](../adr/0039-directives-manage-every-foundation-class.md):

  > 2026-09-30 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the "compile-time check that its documented markup lacks" of the decision and the Library mixin consequence's "or compile-time checks" are planned for a later milestone by the [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md); in the first milestone each such rule is a required setting its spec states.

- [ADR 0040](../adr/0040-variant-input-types.md):

  > 2026-09-30 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the check half of "Keeping it in step", `nx sync:check` as a CI step and the Architect builder's `check` configuration, with the drift report and the checks of a hand-written file, is specified by the [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md) and planned for a later milestone; the sync generator and the builder's write mode keep the file in step in the first milestone.

`README.md`: in the Shared utilities table, a row after the forgotten-import checks row:

> | Build-time checks, later milestone (the Library mixins' `@error` and `@warn` checks, the checks-only mixins, the import-order guard, the presence markers, the Variant declaration tooling's check mode) | [specs/build-time-checks.md](specs/build-time-checks.md) | Sass `@error` and `@warn` over the exact-contrast helper, and Node workspace tooling ([ADR 0022](adr/0022-wcag-2-2-aa-enforcement.md), [ADR 0012](adr/0012-sass-packaging.md), [ADR 0040](adr/0040-variant-input-types.md)) | The seven [checks extraction manifests](research/checks-extraction-shared.md) | None needed | Every spec with a Library mixin; the Variant declaration tooling |

and the wave list's item 2 marks [Spec: build-time checks (later milestone)](issues/163-spec-build-time-checks-later-milestone.md) resolved.

### Gist for Decisions so far

- [Spec: build-time checks (later milestone)](issues/163-spec-build-time-checks-later-milestone.md) -- every build-time check of the seven manifests, per component spec with its trigger, message, cost, and tests and ten shared mechanisms said once, is specified for a later milestone: the Library mixins' `@error` and `@warn` checks over the exact-contrast helper (which stays in the first milestone for the Badge, Label, and Progress Bar rules), the checks-only mixins `nfs-abide`, `nfs-forms`, `nfs-title-bar`, `nfs-top-bar`, and `nfs-typography-base`, ADR 0012's import-order guard, five presence markers (the flag-gated properties and the Breakpoint properties), and the Variant declaration tooling's check mode (the `check` option, `nx sync:check`, M2's check form, M3 to M7); a new compile stop after the first published release lands with an Angular major (ADR 0045); a closing section lists what each component spec adds back; impact LOW to MEDIUM, confidence HIGH, nothing OPEN FOR HUMAN. Spec: [specs/build-time-checks.md](specs/build-time-checks.md).
