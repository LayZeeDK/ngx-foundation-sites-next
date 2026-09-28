# 146. Re-run: Typography Helpers spec, out-of-scope survivors

Type: grilling
Status: open
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) upheld out-of-scope survivors for the [Spec: Typography Helpers](106-spec-typography-helpers.md). What does the spec become with them, under the class rule (ADR 0039), the architecture guide, and ADR 0045 (a changed default after the first release waits for an Angular major, so defaults are settled now)?

## How to work it

Revise `specs/typography-helpers.md` in place and append a dated `### Amendment, 2026-09-28 (out-of-scope survivors)` to the [Spec: Typography Helpers](106-spec-typography-helpers.md) ticket. The items, evidence, and every point this re-run must decide are in that triage ticket's Answer, section "Survivors: proposed re-run tickets", item 1; read it in full, with `research/out-of-scope-triage-2.md` and the three lens files it cites. It also edits the one bullet each named there in `specs/callout.md` and `specs/card.md`, and confirms or amends the triage's shared-file proposals for the blockquote check (the map's base-styles line, building-blocks, and the Storybook override) with quoted text. Measure what the triage marks as unmeasured before deciding it. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.
