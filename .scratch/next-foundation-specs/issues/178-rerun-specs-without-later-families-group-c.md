# 178. Re-run: specs without the later-milestone families, group c

Type: grilling
Status: open
Blocked by: 174
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md) has every first-milestone spec stop assuming the eight later-milestone families. What do `specs/responsive-toggle.md`, `specs/reveal.md`, `specs/slider.md`, `specs/sticky.md`, `specs/switch.md`, `specs/table.md`, `specs/tabs.md`, `specs/thumbnail.md`, `specs/toggler.md`, `specs/top-bar.md`, `specs/variant-declaration-tooling.md` say without them?

## How to work it

Opus, AFK. In each spec: every directive of the eight families (`nfsGridX`, `nfsCell`, `nfsRow`, `nfsColumn`, `nfsShowForSr`, `nfsHideFor`, `nfsTextAlign`, `nfsFlexContainer`, `nfsPrototype...`, and so on) in an example, story, test, or API text becomes the Foundation class it applies, written as a normal class (`class="grid-x"`, `class="show-for-sr"`), and each such example's `imports` drops the directive; no link to the eight specs or their tickets remains; a behaviour that relied on one of them is restated as the Foundation classes the consumer writes, with Foundation's global styles loaded; the Variant declaration tooling keeps only the first milestone's registries. Each changed spec's governing ticket gets a dated amendment.
