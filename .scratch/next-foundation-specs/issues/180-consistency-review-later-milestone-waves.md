# 180. Consistency review: the later-milestone waves

Type: grilling
Status: claimed
Blocked by: 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179
Labels: wayfinder:grilling
Map: ../map.md

## Question

After the waves that followed [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) (an `exportAs` on every directive, family checks that report a forgotten peer, every check moved to a later milestone, and the grids, typography, and utilities moved to a later milestone), do the 57 specs, building-blocks, the ADRs, the glossary, the architecture guide, `storybook-conventions.md`, and the bundle index (`README.md`) still agree with each other, with the map's Standing preferences (the Milestones and Later-milestone families rulings included), and with the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md))? Audits 0009 and 0010 checked each wave's own rules against its diff; this ticket reads every spec in full, across waves.

## How to work it

As [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) did, without its decisions phase, since neither wave routed items here: group reviewers read every spec in their group in full, check it against the shared documents and against the specs it names, fix what is wrong in place with a dated amendment, `### Amendment, 2026-09-30 (consistency review of the later-milestone waves)`, at the end of the spec's amendment home (the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`, or, for the four later-milestone check specs, its own spec ticket), and report anything outside their group as a proposal. A closing pass rules on the proposals, applies them once each, brings the shared documents and `README.md` up to date, and writes this Answer. An audit of the wave follows it (map Notes, Audits). Model: Opus 5.5.

The review's checks, for every spec:

1. The class rule: no consumer-written Foundation or NFS class, except Foundation's own classes for the eight later-milestone families in first-milestone specs (map, Later-milestone families).
2. Milestones: a first-milestone spec names no check, relies on none, and links no deferred spec; each rule a check enforced reads as documented usage. A first-milestone spec names no directive of the eight later families except in a sentence saying the later milestone adds it. Each later-milestone spec carries its Milestone line and its closing section.
3. Cross-spec names: every directive, selector, input, output, token, `exportAs`, Library mixin, setting, and Story id a spec takes from another spec matches the owning spec as it stands.
4. Shared documents: every rule a spec cites from building-blocks, an ADR, the glossary, the guide, or the Storybook conventions says what the spec says it does.
5. Standing preferences: the target versions (Angular 22.2, Nx 23.2, Storybook 10.6, Vitest 4.1, TypeScript 6.0, Foundation 6.9), the Implementation level with its reason, the rendering modes, WCAG 2.2 AA, the animation rule, and Testing Decisions naming the four layers in ADR 0018's wording.
6. Shape and examples: the seven `/to-spec` sections with building-blocks 1.14's placement; every `@Component` example imports exactly the library directives its template writes; no placeholder name or deferral to an unpublished spec.
7. Hygiene: ASCII, the banned words, links that resolve from the file they sit in (a quoted proposal resolves from its target document), table rows.
