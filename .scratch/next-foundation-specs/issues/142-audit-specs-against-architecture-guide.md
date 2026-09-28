# 142. Audit: the specs against the architecture guide

Type: grilling
Status: open
Blocked by: 100, 101, 105, 106, 138, 139, 141, 143, 144, 145, 146, 147, 148, 149, 150
Labels: wayfinder:grilling
Map: ../map.md

## Question

Where does each published spec fall short of the guide that [Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md) adopts, and which of those findings survive deduplication and triage?

## How to work it

It runs after every wave spec is published and after [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) and [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md), including the re-run tickets they create, are resolved, so the auditors read final spec text and no resolution collides with another. The orchestrator adds those re-run tickets to Blocked by when they are created.

1. Auditors (Sonnet 5 evidence sweeps), one per group of about nine specs, check every spec against every principle of `architecture-guide.md` and write findings to `research/architecture-audit-<group>.md`: spec, section, principle, what the spec says (quoted), why it falls short, and the smallest change that meets the principle.
2. A judge (Opus 5.5) deduplicates the findings across groups (one finding for one cause, listing every spec it reaches), verifies each against the spec text, drops false positives with the reason, and rates each survivor under the map's triage rule. A HIGH impact survivor without HIGH confidence goes to the user as OPEN FOR HUMAN.
3. Answer: the deduplicated finding table with verdicts, and for the survivors one re-run ticket per affected spec (or one ticket for a cross-cutting change), each blocking [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md).
