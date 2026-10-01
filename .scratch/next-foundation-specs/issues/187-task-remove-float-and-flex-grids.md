# 187. Task: remove the Float Grid and Flex Grid from the bundle

Type: task
Status: resolved
Blocked by:
Labels: wayfinder:task
Map: ../map.md

## Question

The user ruled the Float Grid and Flex Grid out of scope. What has to change so that no current document of the bundle specifies, depends on, or counts them, and the XY Grid stays the only grid?

## User ruling, 2026-10-01

The user wrote, verbatim:

> Exclude Float Grid and Flex Grid support because they have been deprecated since Foundation 6.4 (released June 2017) according to their documentation pages. Only support XY Grid which is their documented replacement.

Checked against the 6.9.0 clone: "From Foundation v6.4, the Float Grid is disabled by default, replaced by the new XY Grid" (`docs/pages/grid.md:21`; the source links "XY Grid" to `xy-grid.html`), and the same sentence for the Flex Grid (`docs/pages/flex-grid.md:34`).

The user then added, verbatim (the ruling's `#1` is the `$global-flexbox` ruling recorded in [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md), and `#2` is the ruling above):

> #1, #2 On that note, we also assume that the `$xy-grid` and `$flex` options listed at https://get.foundation/sites/docs/xy-grid.html are not set to `false`.

`$xy-grid: false` is what selects the Flex Grid, and `$flex: false` the Float Grid (`docs/pages/xy-grid.md:29-30`; `scss/foundation.scss:99-110`), so with both assumed true no supported setting brings either grid back.

## How to work it

The work is done, not decided. The two specs, `specs/float-grid.md` and `specs/flex-grid.md`, stay in place, because about twenty history files link them; each gets a banner at its top saying it is out of scope since 2026-10-01 and linking here, and no count, index, or current document names it. Their tickets, [Spec: Float Grid](100-spec-float-grid.md) and [Spec: Flex Grid](101-spec-flex-grid.md), stay resolved as history and get a dated note pointing here. Every current document that names either grid is brought in line: the later-milestone check specs (family checks, runtime checks, misuse warnings, forgotten-import checks), the Equalizer, Flexbox Utilities, Variant declaration tooling, Typography Helpers, XY Grid, Float Classes, Visibility Classes, and Prototyping Utilities specs, building-blocks, the glossary, the architecture guide, ADRs 0012, 0021, 0039, and 0040 (dated notes, as for every earlier ruling), the Storybook conventions, the README, and the map. Resolved tickets, research files, audits, and prototypes are history and stay as they are. Where a document used a Float or Flex Grid class as an example of a later-milestone class a consumer writes, it uses an XY Grid class instead.

## Answer

Resolved 2026-10-01. The orchestrator edited the map, the README, the two spec banners, and tickets 100, 101, and 186. Two agents edited the rest in parallel: the four later-milestone check specs on Opus 5.5 at medium effort, because removing checks needs judgement about numbering and counts, and the other specs and shared documents on Opus 5.5 at low effort, as mechanical edits.

- The Float Grid and Flex Grid specs stay under `specs/` with an out-of-scope banner, so the history files that link them still resolve. Tickets 100 and 101 stay resolved, with a dated note. The map gives them an Out of scope line, a Destination sentence (51 specs in the destination; 55 current specs under `specs/`), and a note in the Later-milestone families bullet (six families remain). Its new Notes bullet records the three settings the user assumes at their defaults.
- Check specs. Family checks: 43 checks over 24 specs become 38 over 22, and F7 is retired because only Flex Grid checks used it. Runtime checks: 20 reporting specs become 18. Misuse warnings: 190 checks over 48 specs become 186 over 46. Forgotten-import checks: the shared-class-name rule and the `NFS9001` "or" form are removed, and Selector manifest rule 2 now reads "No two exported directives share a class name". User stories in the family and runtime check specs are renumbered, which is safe because nothing outside those files cites them.
- Other specs. The Equalizer's leftover case is now non-grid markup only. Its Float Grid examples are a consumer's inline-block list, and the story `equalizer--float-grid` is renamed `equalizer--inline-block-list`. Typography Helpers loses the `ul.row` rule of D8, and its size now reads "at most 683 bytes", because the old figure was measured with that rule. The Variant declaration tooling loses three registry rows. The XY Grid's out-of-scope line now states the exclusion.
- Shared documents. Building-blocks loses the two Table D rows and gains a dated line (six families, 13 registries). The glossary loses Row, Column, and Column row. The architecture guide and the Storybook conventions lose the `foundation-grid` and `nfs-float-grid` lines and the Flex Grid's own Storybook configuration. ADRs 0012, 0021, 0039, and 0040 each get one dated note. The README's counts, tables, and Open list follow.
- Checks: in every current document, the grid names now appear only in dated notes, exclusion statements, and ADR text written before today. No current document links either grid spec except the map's gists, which are history. Every relative link in the changed files resolves, except seven root-relative links inside quoted blocks of `specs/forgotten-import-checks.md`, which were already broken at HEAD and stay in the form of the document they quote, as in [Task: repair the broken relative links](181-task-repair-broken-relative-links.md).
- Impact MEDIUM (counts and check numbering in four later-milestone specs change); confidence HIGH (a user ruling applied); nothing OPEN FOR HUMAN.
