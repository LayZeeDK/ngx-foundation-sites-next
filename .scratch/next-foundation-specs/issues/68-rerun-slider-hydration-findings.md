# 68. Re-run: Slider spec, hydration adoption, non-linear bounds, and forced colours

Type: grilling
Status: open
Blocked by: 64
Labels: wayfinder:grilling
Map: ../map.md

## Question

Created on 2026-09-26 because the [Prototype: Slider before hydration, non-linear bounds, and RTL](64-prototype-slider-hydration-nonlinear.md) handed six decisions to the [Spec: Slider](32-spec-slider.md) that change what it says: (1) the hydration adoption design must not re-apply a non-linear key step (the prototype defers to the native `input` event's own idempotent replay instead of adopting from the write effect); (2) two-handle non-linear dependent bounds are documented in native bar-position units; (3) Home and End on a non-linear range handle go to the dependent bound, not the global start or end; (4) rule 12 is confirmed under a real RTL Foundation compile; (5) a new `@media (forced-colors: active)` rule (rule 13) is required because `appearance: none` opts the thumb and fill out of system colours; (6) Firefox does not advance a non-linear handle's model for a key pressed before hydration, a known limitation to document with its narrowed root cause.

Revise `specs/slider.md` in place for all six: the handle API and the adoption paragraph, the non-linear mapping, the keyboard table, the custom CSS list (rule 13 with its reason), the rendering-modes subsection (the Firefox limitation and what the e2e layer asserts), and the WCAG 2.2 AA table where forced colours and keyboard operation are affected. Append the revision to the Slider spec ticket's answer as a dated `### Re-run, 2026-09-26` section with new decision-log entries. Apply the triage rule to anything you would leave open.

Read first: the prototype's answer and `prototypes/slider-hydration-nonlinear/README.md` with `src/app/slider.ts` and `src/_nfs-slider.scss`, `specs/slider.md`, `adr/0020-slider-non-linear-bar-position.md`, the earlier [Prototype: Foundation-styled `<input type="range">` Slider](45-prototype-slider-range-input.md) answer for the adoption design being replaced, and `research/angular-rendering-modes.md` sections 4 and 7.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over each of the six decisions against the prototype's evidence and the Angular event-replay source; edit the spec in place; never edit `map.md`, `CONTEXT.md`, `building-blocks.md`, ADRs, or other specs; never commit. Under `## Answer`: the six decisions as written into the spec, any `### Proposed building-blocks changes` (the Table B Slider cells that mention adoption), `### Triage`, and anything left `OPEN FOR HUMAN`.
