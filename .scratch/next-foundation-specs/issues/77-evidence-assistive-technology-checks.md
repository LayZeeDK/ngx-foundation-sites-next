# 77. Evidence for the assistive-technology checks

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

The README open list names thirteen checks that need assistive technology. A person with a screen reader decides them; this ticket narrows each to what can be known without one. For each check: what the three engines' accessibility trees expose for the markup the spec produces (computed role, name, description, states, live-region properties, and what changes across the interaction), measured from the prototype captures or a minimal page under `D:/tmp/` with Playwright's ARIA snapshot and the Chromium CDP accessibility tree; what published support data says about NVDA, JAWS, VoiceOver, and TalkBack for those roles and states (a11ysupport.io, PowerMapper screen reader reliability, the APG's own notes); which part of the check that evidence settles, which part is still a human judgement, and an exact listening checklist (screen reader, browser, steps, expected announcement, pass condition) so the remaining check takes minutes. Flag any check where the evidence shows the spec's markup is wrong, with the fix.

## How to work it

Research only, by `/research` subagents (two may split the thirteen checks). Do not install screen readers or other software system-wide. Write the findings to `research/assistive-technology-evidence.md` and the `## Answer` here with one line per check (settled by evidence, narrowed, or unchanged, and any spec defect found). The orchestrator carries the results into the README's open list and into the owning specs where a defect is found.
