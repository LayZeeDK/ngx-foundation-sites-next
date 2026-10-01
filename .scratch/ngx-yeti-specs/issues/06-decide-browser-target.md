# 06. Decide: the browser target

Type: grilling
Status: open
Blocked by: 01
Labels: wayfinder:grilling
Map: ../map.md

## Question

Which browsers does the Angular package support? The options:

- Angular 22's baseline, Baseline widely available on 2026-05-07, where Yeti's unguarded newer features would fail;
- Yeti's Baseline 2025, which is narrower than Angular's;
- a stated combination.

And what does each spec say about a feature outside the chosen target?

The old map's browser rule was "a platform feature counts as available only if it was Baseline widely available on that date; anything newer needs a fallback or is not used". It was written for a framework built before those features existed. This ticket decides whether it carries over, is adapted, or is abandoned.

## User ruling, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 26. Browser baseline: For this project, accept Yeti's Baseline 2025 or the least common denominator browser set/baseline supporting browser/CSS features Yeti relies on.

So Angular 22's own baseline is not the package's target. The ticket still decides between the two options the user allows:

- Yeti's Baseline 2025, which implies Chrome and Edge 141, Firefox 145, and Safari 26.2 ([Research: Angular 22's browser baseline against what Yeti expects](01-research-browser-baseline-vs-yeti.md)).
- The least common denominator: the oldest browser versions that support every feature Yeti relies on without a guard. That is computed from the same research's feature table, and may be older than Yeti's set.

It also decides how a spec states the target, and what a spec says about a guarded feature, such as anchor positioning, which works with a fallback below that target.

## How to work it

AFK grilling (map, AFK override) against [Research: Angular 22's browser baseline against what Yeti expects](01-research-browser-baseline-vs-yeti.md) and the old map's Browser support note. Weigh three things:

- Angular 22's own support policy;
- Yeti's README and stability guide ("Browser support minimums, which track Baseline", not frozen);
- which unguarded features break which components.

Record the decision as an ADR in `adr/`. This is HIGH impact: every spec inherits it. Use the triage rule if confidence is not HIGH.
