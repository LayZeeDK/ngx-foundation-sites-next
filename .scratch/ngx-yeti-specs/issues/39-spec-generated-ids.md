# 39. Spec: Generated ids (shared spec)

Type: task
Status: claimed
Blocked by: 35
Labels: wayfinder:task
Map: ../map.md

## Question

What is the API and behaviour of the shared generated-ids utility, and what does its spec say? It follows [ADR 0044](../adr/0044-generated-ids-count-per-application-and-are-adopted-at-hydration.md): `injectYetiId()`, the per-application counter, the `TransferState` seed, adopting a server-rendered id, `provideYetiAriaIds()`, and the consumer's `id` winning.

## How to work it

Write `specs/generated-ids.md` with the `/to-spec` template and the map's Spec shape note, from the records only: the map's Standing rulings and Inherited preferences, the ADRs, `building-blocks.md`, `architecture-guide.md`, `ledger.md`, `upstream-bugs.md`, and `CONTEXT.md`. The spec decides nothing a record has not decided. Anything it needs and no record settles goes under the ticket's `### Open` for the orchestrator. Append an `## Answer` that links the spec.
