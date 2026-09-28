# 147. Re-run: Switch spec, out-of-scope survivors

Type: grilling
Status: open
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) upheld out-of-scope survivors for the [Spec: Switch](84-spec-switch.md). What does the spec become with them, under the class rule (ADR 0039), the architecture guide, and ADR 0045 (a changed default after the first release waits for an Angular major, so defaults are settled now)?

## How to work it

Revise `specs/switch.md` in place and append a dated `### Amendment, 2026-09-28 (out-of-scope survivors)` to the [Spec: Switch](84-spec-switch.md) ticket. The items, evidence, and every point this re-run must decide are in that triage ticket's Answer, section "Survivors: proposed re-run tickets", item 2; read it in full, with `research/out-of-scope-triage-2.md` and the three lens files it cites. It includes the switch-14 reason correction and the building-blocks Table D proposal the triage names. Measure what the triage marks as unmeasured before deciding it. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.
