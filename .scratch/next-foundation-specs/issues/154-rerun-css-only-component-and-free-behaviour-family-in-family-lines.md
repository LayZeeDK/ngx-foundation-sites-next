# 154. Re-run: CSS-only component and free-behaviour family specs, In-family check lines

Type: grilling
Status: claimed
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) found that the specs written before ADR 0046 lack the In-family check lines, parent token descriptions, and `strictParents` effects that [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) requires of a multi-directive family. What does each spec of the CSS-only component and free-behaviour family (`specs/card.md`, `specs/media-object.md`, `specs/table.md`, `specs/sticky.md`, `specs/equalizer.md`) state?

## How to work it

Revise each spec in place and append a dated `### Amendment, 2026-09-29 (in-family check lines)` to the ticket the map's Decisions so far cites last for that spec. The items, evidence, and what to decide are in the audit ticket's Answer, section "Re-run tickets", item R4, and the five points above it that every re-run decides; `specs/forgotten-import-checks.md` (its family rule, the `strictParents` table, and the token-description form) and the Accordion spec's worked example are the model. Run `/grill-with-docs` (self-grilling, both sides) where a point needs deciding, and keep every other part of each spec unchanged. Propose shared-document changes as quoted text in the Answer.
