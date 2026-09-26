# 75. Evidence for the `@angular/aria` fallback confirmation

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

The README open list's confirmation item names nine places where a spec does not use an available `@angular/aria` building block, and the repository's `AGENTS.md` asks the user to confirm each fallback. The user decides; this ticket informs the decision. For each of the nine fallbacks: is the spec's stated reason true in `@angular/aria` 22.2 (cite the source file and line in the components clone), does anything in Aria's `main` branch or the latest 22.x or 23.0 prerelease change it (read the clone's newer branches or GitHub read-only), what would using the Aria building block instead cost (API, server HTML, WCAG 2.2 AA, Foundation markup), and what is the recommendation (confirm the fallback, overrule it, or confirm with a condition), with a confidence rating.

## How to work it

Research only, by a `/research` subagent; nothing is filed and no spec changes here. Write the findings to `research/aria-fallback-evidence.md` (one section per fallback, each with verified facts, cost of the alternative, recommendation, confidence) and the `## Answer` here with a one-line recommendation per fallback. The orchestrator carries the recommendations into the README's confirmation item, still for the user to confirm.
