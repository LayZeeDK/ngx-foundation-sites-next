# 161. Spec: misuse warnings (later milestone)

Type: grilling
Status: open
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) specifies misuse warnings: each directive's own development warnings about how the consumer used it, reading only its host, its inputs, its content, or the page, for a later milestone of the implementing repository. What is that spec?

## How to work it

Opus 5.5, AFK under the map's triage rule. Write `specs/misuse-warnings.md` in the map's spec shape and `/to-spec`'s sections, from the extraction manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs as committed at that ticket: its Problem Statement says it is planned and implemented in a later milestone and why (the ruling), and that the user wants the kinds weighed against each other in practice; it holds every check of its kind, per component, with its design as the specs gave it (its trigger, its message, its cost, its tests), so the later milestone loses nothing; its Testing Decisions keep the tests the checks had; and a closing section lists, per component spec, what the later milestone adds back to that spec when it lands. A check the manifests classify under another kind is left to that kind's spec; a boundary case is decided under the triage rule and recorded. The spec may name and link any component spec; no component spec links back to it.
