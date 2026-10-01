# 08. Decide: which ADRs carry over

Type: grilling
Status: claimed
Blocked by: 06, 07
Labels: wayfinder:grilling
Map: ../map.md

## Question

For each of the old map's ADRs, `.scratch/next-foundation-specs/adr/0001` to `0046` with their dated notes, decide whether it is carried over, adapted, or abandoned for Yeti, with the reason. Examples:

- rendering modes (0008);
- the browser testing stack (0018);
- WCAG 2.2 AA enforcement (0022);
- the release policy (0045);
- Sass packaging (0012);
- the class rule (0039);
- Variant input types (0040);
- each plugin-specific record.

## How to work it

AFK grilling against the research tickets and the decisions of [Decide: which standing preferences and user rulings carry over](07-decide-inherited-preferences-and-rulings.md) and [Decide: the browser target](06-decide-browser-target.md). Each carried-over ADR is copied into `adr/` here with a new number and an `Inherited from` line. Each adapted one is rewritten with what changed. Each abandoned one gets one line in this ticket's Answer. Plugin-specific records (Reveal, Orbit, Tabs, menus) are only adapted when [Decide: the spec list](11-decide-spec-list.md) keeps a Yeti counterpart; until then they are marked pending.
