# 172. Re-run: family checks and misuse warnings specs, spec-shape subsections

Type: grilling
Status: open
Blocked by: 160, 161
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md) (M6) found that `specs/family-checks.md` and `specs/misuse-warnings.md` lack the spec-shape subsections the map's Spec shape note and building-blocks 1.14 ask for, which the 55 other specs carry. What do the two specs say in those subsections?

## How to work it

Opus 5.5, AFK. Add to each spec, inside Implementation Decisions and Further Notes as the Spec shape note places them:

- A Foundation contract: what Foundation 6.9's plugins report for the misuses and placements these checks cover, read from Foundation's JavaScript at `d:/projects/github/foundation/foundation-sites` (v6.9.0).
- A Hierarchy and package shape subsection: no directive and no entry point of their own; where each check's code lives; the helpers that are library-internal (`specs/misuse-warnings.md`, its helpers passage).
- A comparison table: Angular Aria's development warnings, Material's removed sanity checks (angular/components commit `54875a3`), and the CDK's `InteractivityChecker` as the one primitive reused.
- For the family checks spec only, one usage example: a check's call site with its inline guard and the F5 helper branch.

The audit's fixers did not touch those sections. Amend [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md) and [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md) with a dated section each, and resolve this ticket with an Answer and a gist.
