# 42. Spec: Navigation close (shared spec)

Type: task
Status: claimed
Blocked by: 25, 33
Labels: wayfinder:task
Map: ../map.md

## Question

What is the API and behaviour of the shared navigation-close utility, and what does its spec say? It follows [ADR 0041](../adr/0041-closing-on-navigation-is-a-per-instance-subscription.md), with its 2026-10-03 note: whether the first `NavigationStart` closes a panel the user opened before hydration is measured and handled.

## How to work it

Write `specs/navigation-close.md` with the `/to-spec` template and the map's Spec shape note, from the records only: the map's Standing rulings and Inherited preferences, the ADRs, `building-blocks.md`, `architecture-guide.md`, `ledger.md`, `upstream-bugs.md`, and `CONTEXT.md`. The spec decides nothing a record has not decided. Anything it needs and no record settles goes under the ticket's `### Open` for the orchestrator. Append an `## Answer` that links the spec.
