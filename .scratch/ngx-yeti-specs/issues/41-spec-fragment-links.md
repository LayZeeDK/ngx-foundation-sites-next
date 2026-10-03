# 41. Spec: Fragment links (shared spec)

Type: task
Status: claimed
Blocked by: 25
Labels: wayfinder:task
Map: ../map.md

## Question

What is the API and behaviour of the shared fragment-links utility (`provideYetiFragmentLinks()`), and what does its spec say? It follows [ADR 0023](../adr/0023-fragment-links-are-same-document-links.md), building-blocks 1.15, and the deployment-URL ruling (only `baseHref`).

## How to work it

Write `specs/fragment-links.md` with the `/to-spec` template and the map's Spec shape note, from the records only: the map's Standing rulings and Inherited preferences, the ADRs, `building-blocks.md`, `architecture-guide.md`, `ledger.md`, `upstream-bugs.md`, and `CONTEXT.md`. The spec decides nothing a record has not decided. Anything it needs and no record settles goes under the ticket's `### Open` for the orchestrator. Append an `## Answer` that links the spec.
