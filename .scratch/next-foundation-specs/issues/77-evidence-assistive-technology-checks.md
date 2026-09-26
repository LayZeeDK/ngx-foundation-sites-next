# 77. Resolve the assistive-technology checks

Type: grilling
Status: open
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The README open list names thirteen checks that were left for a person with a screen reader. The user has ruled that this pass resolves them autonomously (map, "Open-decision pass"). For each check, decide whether the spec's markup and behaviour are right, from evidence that does not need a person: what each engine exposes to assistive technology for the markup the spec produces (computed role, name, description, states, live-region properties, and what changes across the interaction), measured from the prototype captures or a minimal page under `D:/tmp/` with Playwright's ARIA snapshot, the Chromium CDP accessibility tree, and, on this Windows machine, the UI Automation tree that Narrator and NVDA consume (read-only inspection of the browser window); what published support data says about NVDA, JAWS, VoiceOver, and TalkBack for those roles and states (a11ysupport.io, PowerMapper screen reader reliability, the APG's own notes); and the WAI-ARIA and HTML-AAM mappings. Where the evidence shows the spec is wrong, the decision is the fix. Where it shows the spec is right, the check is resolved, and any manual confirmation still worth doing becomes a release-test step in the spec's Testing Decisions rather than an open decision.

## How to work it

Evidence agents (the thirteen checks may be split) write `research/assistive-technology-evidence.md`; an adversarial reviewer on Fable attacks each verdict; the orchestrator's judge writes the `## Answer` here with one line per check (verdict, evidence, spec change if any) and the exact spec edits. Do not install screen readers or other software system-wide.
