# 164. Re-run: forgotten-import checks spec for the later milestone

Type: grilling
Status: open
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) keeps `specs/forgotten-import-checks.md` as the later milestone's spec for the four forgotten-import checks, and no other spec may name them. The spec's family rule has each family spec list its In-family checks, its `strictParents` rows, and its token descriptions (M7). What must the spec hold so that it is complete on its own?

## How to work it

Opus 5.5, AFK. From the extraction manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs as committed at that ticket: move into the spec, per family, every In-family line, `nfsDirectiveCheck` call, `strictParents` row, and token description the family specs give, verbatim, with the family spec named; rewrite the family rule so it describes what the later milestone adds to each family spec, not what the specs say now; apply items 1 to 4 of [Decide: family checks report a forgotten peer themselves](157-decide-family-checks-report-forgotten-peers.md) as that ticket's scope note says; move in the `strictDirectiveImports` and `strictParents` keys from the Breakpoint service spec's `NfsRuntimeChecks` and the `missing-imports` builder's workspace tooling from the Variant declaration tooling spec; state in the Problem Statement that the spec is planned and implemented in a later milestone and why. Amend [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) with a dated section.
