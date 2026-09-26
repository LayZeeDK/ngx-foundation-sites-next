# 75. Decide the `@angular/aria` fallback confirmation

Type: grilling
Status: open
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The README open list's confirmation item names nine places where a spec does not use an available `@angular/aria` building block; the repository's `AGENTS.md` asks for confirmation before such a fallback, and the user has ruled that this pass resolves it autonomously (map, "Open-decision pass"). For each of the nine fallbacks, decide: confirm the fallback, overrule it (the spec adopts the Aria building block), or confirm it with a condition. Each decision rests on whether the spec's stated reason is true in `@angular/aria` 22.2 (source file and line in the components clone), whether anything on Aria's `main` branch or in a newer prerelease changes it, and what using the Aria building block would cost (API, server HTML, WCAG 2.2 AA, Foundation markup).

## How to work it

The orchestrator runs it: an evidence dossier at `research/aria-fallback-evidence.md` (one section per fallback, facts only, cited), then two adversarial reviewers (one on Opus arguing to overrule each fallback, one on Fable attacking the Aria alternative), then a judge who decides each fallback and writes the `## Answer` here with one decision per fallback, its evidence, and the dissent. Any overruled fallback lists the exact spec changes.
