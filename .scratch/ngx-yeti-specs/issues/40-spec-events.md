# 40. Spec: Events (shared spec)

Type: task
Status: claimed
Blocked by: 25, 26
Labels: wayfinder:task
Map: ../map.md

## Question

How does the package expose Yeti's `yeti:*` events (`close`, `open`, `select`, `slide`, `invalid`, `current`) as Angular outputs, and what does the shared `events` spec say? Templates cannot bind `(yeti:close)` (`binding_parser.ts:699`), and the package replaces Yeti's modules ([ADR 0040](../adr/0040-package-replaces-yetis-optional-modules.md)).

## How to work it

Write `specs/events.md` with the `/to-spec` template and the map's Spec shape note, from the records only: the map's Standing rulings and Inherited preferences, the ADRs, `building-blocks.md`, `architecture-guide.md`, `ledger.md`, `upstream-bugs.md`, and `CONTEXT.md`. The spec decides nothing a record has not decided. Anything it needs and no record settles goes under the ticket's `### Open` for the orchestrator. Append an `## Answer` that links the spec.
