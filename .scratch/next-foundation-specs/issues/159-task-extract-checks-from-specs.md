# 159. Task: extract the checks from the specs

Type: task
Status: resolved
Blocked by: 158
Labels: wayfinder:task
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) moves five kinds of check out of the first milestone: forgotten-import checks, family checks, misuse warnings, Runtime checks, and build-time checks (the Library mixins' `@error` and `@warn` checks and the Variant declaration tooling's check mode). Before the deferred specs are written and the other specs are rewritten, where is every check, and what exactly does each say?

## How to work it

AFK, seven Sonnet 5 sweeps, read only except their manifests: one per spec group of [Re-run: specs without checks, group a](165-rerun-specs-without-checks-group-a.md) to [group f](170-rerun-specs-without-checks-group-f.md) (group c also covers `specs/forgotten-import-checks.md`), and one over the shared documents (`building-blocks.md`, `architecture-guide.md`, `CONTEXT.md`, `storybook-conventions.md`, and ADRs 0012, 0039, 0040, 0044, and 0046). Each reads its files as committed at this ticket's parent commit and writes `research/checks-extraction-<group>.md`: per file, every check, each with its kind (by the ruling's classification rule, exactly one kind), its location (section and line), its text verbatim, the tests and stories that exercise it, the Sass or TypeScript it needs, and the rule it enforces written as one documented-usage sentence the rewritten spec can state (or "none", where the check enforces nothing a consumer must do). The ticket resolves when the seven manifests are committed.

## Answer

Done 2026-09-29 by seven Sonnet 5 sweeps, each reading its files at `ba07780`, the commit of [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md), and writing one manifest:

| Manifest | Files | Checks |
| --- | --- | --- |
| [research/checks-extraction-a.md](../research/checks-extraction-a.md) | abide, accordion-menu, accordion, anchored-pane, badge, breadcrumbs, breakpoint-service, button-group, button | 59 |
| [research/checks-extraction-b.md](../research/checks-extraction-b.md) | callout, card, close-button, drilldown-menu, dropdown-menu, dropdown, equalizer, flex-grid, flexbox-utilities | 53 |
| [research/checks-extraction-c.md](../research/checks-extraction-c.md) | float-classes, float-grid, forgotten-import-checks (moves whole), forms, interchange, label, magellan, media-object, menu | 39 |
| [research/checks-extraction-d.md](../research/checks-extraction-d.md) | nested-menu, off-canvas, orbit, pagination, progress-bar, prototyping-utilities, responsive-accordion-tabs, responsive-embed, responsive-menu | 80 |
| [research/checks-extraction-e.md](../research/checks-extraction-e.md) | responsive-toggle, reveal, slider, smooth-scroll, sticky, switch, table, tabs, thumbnail | 61 |
| [research/checks-extraction-f.md](../research/checks-extraction-f.md) | toggler, tooltip, top-bar, triggers, typography-helpers, variant-declaration-tooling, visibility-classes, xy-grid | 57 |
| [research/checks-extraction-shared.md](../research/checks-extraction-shared.md) | building-blocks, the architecture guide, the glossary, the Storybook conventions, ADRs 0012, 0039, 0040, 0044, 0046 | 85 |

Per kind, in the 52 component specs (the forgotten-import checks spec moves as a whole): forgotten-import 40, family 47, misuse 190, Runtime 25, build-time 47; in the shared documents: 15, 7, 23, 11, and 29. Each entry holds its location, its text verbatim, its tests and stories, what it alone needs, the rule as one documented-usage sentence, and every other place that names it; each file ends with what it keeps because it is not a check.

Correction (2026-09-30, audit 0009): the figures are the manifests' headings per kind. The later-milestone specs count 43 family checks (47 headings: three quote the Nested menu's checks, one records that the Toggler has none), 24 Runtime checks (25 headings, one for the Toggler), and 46 build-time entries (47 headings, one for the Toggler).

The sweeps recorded their boundary calls in their manifests. The orchestrator's notes on them, for the spec authors and re-runs of this wave:

- A check that is only the library's own test, gate, or story check of its own components stays where it is (the ruling keeps the library's own tests), for example the Variant declaration tooling's internal typings check, which group f listed as build-time.
- A placement check between two directives of different families that sit together (the Top Bar's sections, the Visibility Classes' sticky placement, the XY Grid's cells) stays family; page-level reads (the Float Grid's check 3, two Magellan checks) stay misuse.
- A check one spec quotes but another owns (the Nested menu's table quoting the Dropdown Menu's reflow `@warn`; the Positioner's offset warnings named in the Dropdown and Tooltip specs; the Breakpoint service's unknown-name rule behind the Equalizer's `equalizeOn`) goes into its deferred spec once, from its owner, and the quoting spec's re-run removes the quote.
- The Orbit's test calling `provideNfsRuntimeChecks({strictParents: true})` sets a forgotten-import option and moves with those checks.
- ADR 0012's Sass import-order guard is an `@error` that stops the consumer's compile, so it is a build-time check and moves, unless the build-time spec finds the library cannot emit its CSS without it.
- ADRs outside the shared sweep's files also state checks (0004, 0005, 0011, 0019, 0028, 0034, 0037, 0038, 0042, 0043); [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md) gives each a dated note.

Triage: impact LOW (a read-only inventory; the deferred specs and re-runs decide), confidence HIGH (seven full reads with the ruling's classification rule and a term search with a positive control each). Nothing is OPEN FOR HUMAN.

### Gist for Decisions so far

- [Task: extract the checks from the specs](issues/159-task-extract-checks-from-specs.md) -- seven Sonnet sweeps listed every check verbatim, by kind, file, tests, and mentions, with the rule each enforces as one documented-usage sentence, in seven manifests: in the 52 component specs 40 forgotten-import, 47 family, 190 misuse, 25 Runtime, and 47 build-time entries (manifest headings; the later-milestone specs count 43 family checks, 24 Runtime checks, and 46 build-time entries, because a heading may record a component with no check or quote another spec's check), and 85 statements of checks in the shared documents; the forgotten-import checks spec moves as a whole.
