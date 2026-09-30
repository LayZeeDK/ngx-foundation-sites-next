# 173. Decide: the Prototyping Utilities' Library mixin

Type: grilling
Status: resolved
Blocked by: 142, 158
Labels: wayfinder:grilling
Map: ../map.md

## Question

T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), OPEN FOR HUMAN since 2026-09-28: does the Prototyping Utilities page keep one Library mixin, `nfs-prototyping-utilities`, over Foundation's seventeen prototype export mixins and its umbrella, `foundation-prototype-classes`? Or, as ADR 0012's dated note reads, does it get one Library mixin per export mixin?

## User ruling, 2026-09-30

The orchestrator restated T9 with [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) applied. ADR 0012's main reason for one mixin per export mixin was "so each check runs only for a component the consumer compiles", and that reason moved to the later milestone. In the first milestone the choice decides only which responsive spacing rules and registry Variant properties a consumer's stylesheet emits.

The orchestrator added a fourth option:

> (a') New since the ruling: one mixin now, named `nfs-prototype-classes`, after Foundation's umbrella. The per-export mixins of (c) are added later. Adding mixins doesn't break anyone under ADR 0045, and the umbrella keeps its name, so (a') grows into (c) without a breaking change. The typed-name leak stays until then.

It recommended (a'). The user answered: "T9: Approve recommendation".

## Decision

1. The Prototyping Utilities page has one Library mixin in the first milestone: `nfs-prototype-classes`. It is named after Foundation's umbrella export mixin `foundation-prototype-classes`, and included after it. It replaces the name `nfs-prototyping-utilities`, and its content is unchanged: the responsive spacing rules and the registry Variant properties.
2. Accepted for the first milestone: a consumer who compiles only some prototype families still gets the Variant properties, and so the typed names, of every family.
3. The later milestone may add one Library mixin per export mixin (`nfs-prototype-spacing` after `foundation-prototype-spacing`, and so on), with `nfs-prototype-classes` including them all, which is option (c) of T9. Adding them breaks nothing under ADR 0045, because the umbrella keeps its name.
4. ADR 0012 gains a dated note: the per-export rule applies from the later milestone. Until then this family has its umbrella mixin only.

## Changes to apply

- In the live documents, rename `nfs-prototyping-utilities` to `nfs-prototype-classes`: `specs/prototyping-utilities.md`, `specs/runtime-checks.md`, `specs/build-time-checks.md`, `building-blocks.md`, `storybook-conventions.md`, `specs/variant-declaration-tooling.md`, and any line of `map.md` or `README.md` that states the current name.
  - In the Prototyping Utilities spec, the Sass subsection states decisions 1 to 3. The OPEN FOR HUMAN sentence audit 0008 added is replaced by a pointer to this ticket. The decision row for the mixin records the ruling.
  - The later-milestone specs keep their design. Where a check is keyed to the mixin, it now names `nfs-prototype-classes`, and each spec notes that per-export mixins may split it later.
- Leave records alone: tickets 102, 142 and 133, research files and audits keep the old name as history.
- Give ADR 0012 its dated note (decision 4).
- In T9 (ticket 142), add a dated line saying it was decided by this ticket, and remove "OPEN FOR HUMAN" from its heading.
- In the README, remove T9 from the Open list and say no item is OPEN FOR HUMAN. In building-blocks Part 4, say the same.
- In ticket 102 (the Prototyping Utilities spec's ticket), add a dated amendment.
- Resolve this ticket with an Answer and a `### Gist for Decisions so far` line, and add that line to the end of the map's Decisions so far.

## Answer

Applied the ruling to the live documents; records keep the old name.

- `specs/prototyping-utilities.md`: every mention of the mixin renamed to `nfs-prototype-classes` (13); the Sass subsection states decisions 1 to 3 and points here in place of audit 0008's OPEN FOR HUMAN sentence; new decision row D25 records the ruling.
- `specs/runtime-checks.md`: the mixin renamed (user story 29, the mapping row, D19's request and decision, the test line); a new decision bullet says per-export mixins may split it later, each directive's `include` then naming its own family's mixin.
- `specs/build-time-checks.md`: the mixin renamed (presence marker P4, the manifest row); the one-mixin-per-export bullet and D7 name `nfs-prototype-classes` and this ticket in place of "T9 stays OPEN FOR HUMAN"; the Prototyping Utilities entry notes that per-export mixins may split it, the arrow check then moving to `nfs-prototype-arrow`.
- `building-blocks.md`: Table D's row renamed; Part 4's OPEN FOR HUMAN subsection says none is left.
- `storybook-conventions.md` and `specs/variant-declaration-tooling.md`: the mixin renamed.
- `README.md`: the T9 bullet replaced by "No item is OPEN FOR HUMAN" with a pointer here. No README line stated the mixin's name.
- `adr/0012-sass-packaging.md`: a dated note of 2026-09-30 (decision 4).
- [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md): the heading "OPEN FOR HUMAN" becomes "T9, decided 2026-09-30", and a dated line says this ticket decided it.
- [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md): an amendment of 2026-09-30.
- `map.md`: the gist below added at the end of Decisions so far. The earlier gist of ticket 102 keeps the old name, as a record.

### Gist for Decisions so far

- [Decide: the Prototyping Utilities' Library mixin](issues/173-decide-prototyping-utilities-library-mixin.md) -- the user approved option (a') of T9: in the first milestone the Prototyping Utilities page has one Library mixin, `nfs-prototype-classes`, named after Foundation's umbrella `foundation-prototype-classes` and included after it, replacing `nfs-prototyping-utilities` with unchanged content (the responsive spacing rules and the registry Variant properties); a consumer who compiles some families still gets every family's typed names; the later milestone may add one mixin per export mixin under the umbrella, which breaks nothing under ADR 0045. ADR 0012 gets a dated note; no item is OPEN FOR HUMAN. Impact HIGH, confidence HIGH (a user ruling).
