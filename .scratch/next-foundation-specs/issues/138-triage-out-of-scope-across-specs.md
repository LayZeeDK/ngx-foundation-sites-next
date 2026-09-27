# 138. Triage: out-of-scope items across the specs

Type: grilling
Status: open
Blocked by: 82, 84, 87, 88, 90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 104, 105, 106, 112, 113, 114, 115, 116, 117, 119, 120, 124, 125, 126, 127, 131, 136, 137
Labels: wayfinder:grilling
Map: ../map.md

## Question

The user asked on 2026-09-28 for every spec item currently deemed out of scope to be audited and triaged, in the context of the map, the tickets, the research, the references, the requirements, the precedence of the bundle's sources, the goals, and every other artifact under `.scratch/`. Which items that the 52 specs, the map, building-blocks, and the ADRs rule out of scope should come into scope, and what do they become? Every exclusion's reason is re-checked against its sources and against the rulings that postdate it: the CSS-only ruling and the class rule ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md), ADR 0039), the Variant typing decision ([Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md), ADR 0040), directive composition over subclassing, and the user's precedence note that the repository's API-design skill ranks below the bundle's decisions. Items whose reason still holds stay out with the reason restated; survivors come into scope and are resolved before the consistency review.

This ticket waits until every spec and re-run ticket of the class-rule wave has resolved, so that it reads settled Out of Scope sections and no survivor edits a spec another agent is writing.

## How to work it

1. Evidence (Sonnet 5, read-only, split across agents by spec group): list every out-of-scope item in the 52 specs (Out of Scope sections, Dropped options, rejected rows in Design decisions, Further Notes), the map's Out of scope, building-blocks, and the ADRs, each with its location, its stated reason, and a reason category, updating `research/out-of-scope-exclusions.md` into a new `research/out-of-scope-exclusions-2.md` that marks which rows are new since ticket 79 and which ticket 79 already re-checked.
2. Triage: lenses in the pattern of ticket 79 (an Angular-native API lens on Fable 5.1; an adversarial scope and Foundation-fidelity lens on Opus 5.5; an accessibility lens on Opus 5.5; Opus 5.5 takes any Fable seat if Fable credit runs out), then an Opus 5.5 judge who weighs the arguments, records dissent, rates each item under the map's triage quadrant, and writes `research/out-of-scope-triage-2.md`. Items the triage cannot settle from evidence, and every HIGH-impact item with NOT-HIGH confidence, go to the user with a recommendation.
3. Survivors: the orchestrator graduates each survivor, or each group of survivors in one spec, into a re-run ticket ("Re-run: <spec> spec, out-of-scope survivors") resolved by an Opus 5.5 agent, and adds them to the consistency review's `Blocked by`.
