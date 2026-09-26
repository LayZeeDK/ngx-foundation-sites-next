# 68. Re-run: Slider spec, hydration adoption, non-linear bounds, and forced colours

Type: grilling
Status: resolved
Blocked by: 64
Labels: wayfinder:grilling
Map: ../map.md

## Question

Created on 2026-09-26 because the [Prototype: Slider before hydration, non-linear bounds, and RTL](64-prototype-slider-hydration-nonlinear.md) handed six decisions to the [Spec: Slider](32-spec-slider.md) that change what it says: (1) the hydration adoption design must not re-apply a non-linear key step (the prototype defers to the native `input` event's own idempotent replay instead of adopting from the write effect); (2) two-handle non-linear dependent bounds are documented in native bar-position units; (3) Home and End on a non-linear range handle go to the dependent bound, not the global start or end; (4) rule 12 is confirmed under a real RTL Foundation compile; (5) a new `@media (forced-colors: active)` rule (rule 13) is required because `appearance: none` opts the thumb and fill out of system colours; (6) Firefox does not advance a non-linear handle's model for a key pressed before hydration, a known limitation to document with its narrowed root cause.

Revise `specs/slider.md` in place for all six: the handle API and the adoption paragraph, the non-linear mapping, the keyboard table, the custom CSS list (rule 13 with its reason), the rendering-modes subsection (the Firefox limitation and what the e2e layer asserts), and the WCAG 2.2 AA table where forced colours and keyboard operation are affected. Append the revision to the Slider spec ticket's answer as a dated `### Re-run, 2026-09-26` section with new decision-log entries. Apply the triage rule to anything you would leave open.

Read first: the prototype's answer and `prototypes/slider-hydration-nonlinear/README.md` with `src/app/slider.ts` and `src/_nfs-slider.scss`, `specs/slider.md`, `adr/0020-slider-non-linear-bar-position.md`, the earlier [Prototype: Foundation-styled `<input type="range">` Slider](45-prototype-slider-range-input.md) answer for the adoption design being replaced, and `research/angular-rendering-modes.md` sections 4 and 7.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over each of the six decisions against the prototype's evidence and the Angular event-replay source; edit the spec in place; never edit `map.md`, `CONTEXT.md`, `building-blocks.md`, ADRs, or other specs; never commit. Under `## Answer`: the six decisions as written into the spec, any `### Proposed building-blocks changes` (the Table B Slider cells that mention adoption), `### Triage`, and anything left `OPEN FOR HUMAN`.

## Answer

Resolved 2026-09-26 (AFK, self-grilling both sides). [specs/slider.md](../specs/slider.md) is revised in place. The decision log is appended to the [Spec: Slider](32-spec-slider.md) answer as `### Re-run, 2026-09-26`, decisions 49 to 56. The grilling changed one of the six: decision 6 is a fix, not a documented Firefox limitation, because the replay source and the prototype's own numbers show the cause is replay order, not Firefox.

### The six decisions as written into the spec

1. Hydration adoption (API bullets, Rendering modes "Full hydration" and "Event replay", D7). The write phase's first pass adopts nothing: an enabled handle whose native value differs keeps it, and the replayed native `input` adopts it, because its listener reads the live native value and replaying it is idempotent. A disabled or readonly handle restores its value in that pass. Adopting from the write phase double-applies a non-linear key (the prototype's measurement). The design depends on event replay, which Angular 22 turns on by default through incremental hydration; the docs name the opt-out case.
2. Non-linear dependent bounds (host binding table, Range form bullet, ARIA table, Rendered HTML, D19). Native `min`/`max`, the `input` clamp, and the span are in Bar-position units (`fraction(siblingValue) * 1000`, span over 1000); the key handler clamps in value units. A two-handle `log` example is added (25 and 75: positions 123.84 and 585.93, spans 0.586 and 0.876, checked by script).
3. Home and End on a non-linear range handle (keyboard table, Non-linear bullet, D19). The dependent bound, as on a linear handle; the scale ends only on the free side.
4. Rule 12 (Sass table, D9). Confirmed under a real right-to-left compile, unchanged. The keyboard table now states the measured per-engine arrow direction: Chromium and Firefox reverse a linear range in right-to-left, WebKit does not. The non-linear handler reverses in every engine. On WebKit alone the two scale types differ, documented and not overridden.
5. Rule 13 (Sass table, WCAG table, D20). Inside `@media (forced-colors: active)`: thumb `CanvasText`, fill `Highlight`, focused-thumb outline `CanvasText`, disabled thumbs `GrayText`, a `CanvasText` outline on the track edge, and `forced-color-adjust: none` on the input and fill only. Three changes from the prototype's measured rule: `CanvasText` instead of `ButtonText` (CSS Color 4 guarantees `CanvasText` on `Canvas`), an outline instead of a border (the track-press geometry keeps its size), and no `forced-color-adjust` on the container (it is inherited and would keep the `$black` focus outline). The WCAG table gains a forced-colours 1.4.11 row and a 1.4.1 row, and 2.4.7 names the forced outline.
6. Pre-hydration non-linear key (API bullets, Rendering modes, Testing Decisions, D18). Narrowed root cause: the early contract replays its queue synchronously in arrival order (`eventcontract.ts` `ecrd`), so the `keydown` replays before the companion `input` of its native default action, and no `afterRenderEffect` runs between them. The prototype's handler left the native write for later, so that `input` read the engine's drift and overwrote the step. Firefox drifts by 1 (310.02 maps to 50); Chromium and WebKit drift by 10 (319.02 maps to 51, a coincidence at 50; at 5 the same drift is two steps). These match the measured numbers exactly, including Firefox's native value staying at 310.02. Fix: the non-linear key handler writes the live native value itself, so the companion `input` maps the directive's position back to the same value (round trip checked for every step on 0..100). Accepted edge case: a key and then a drag on the same non-linear handle before hydration keeps the key's step. The e2e layer asserts one step at 50 and at 5 in all three engines. If Firefox still fails there, the prototype's limitation text is the documented fallback, which changes no API.

### Proposed building-blocks changes

(paths relative to the effort root)

1. Table B, Slider row, "Rendering-mode constraints and risks" cell: replace "so the live `value` property is written in `afterRenderEffect` and a value the user changed before hydration is adopted rather than reset" with "so the live `value` property is written in `afterRenderEffect`, whose first pass leaves a pre-hydration native value alone; the replayed native `input` adopts it (idempotent), and a non-linear key handler writes the native value itself so its replayed companion `input` counts the key once. Needs event replay, on by default through incremental hydration". Reason: decisions 49 to 51.
2. Table B, Slider row, "Open risks; prototype question" cell: append "; before hydration, non-linear bar-position bounds, real right-to-left compile, and forced colours: [Prototype: Slider before hydration, non-linear bounds, and RTL](issues/64-prototype-slider-hydration-nonlinear.md), with rule 13 for forced colours". Reason: decisions 52 to 55.
3. Outside building-blocks, for the orchestrator: `research/angular-rendering-modes.md` section 7's Slider row says "`input`/`change` replay" only. A note that a replayed `keydown` runs before the companion `input` of its native default action, in the same synchronous pass, would help every spec whose key handler computes state the native control also changes.

### Triage

Rule: the map's triage of human-only items; only HIGH impact with NOT-HIGH confidence stays OPEN FOR HUMAN.

- Replay-order fix (decision 6). Impact: MEDIUM. Internal to the handle, no API change, one interaction in the pre-hydration window. Confidence: HIGH on the cause (source reading plus exact agreement with the prototype's numbers in both engines); NOT HIGH that the fix passes until it runs, which the e2e case settles. DECIDED: the fix, with the limitation text as the fallback.
- Key then drag before hydration on one non-linear handle ends at the key's step. Impact: LOW (rare, and the result is a value the user chose). Confidence: HIGH (follows from the replay order). DECIDED: accepted and documented.
- Event replay opted out. Impact: MEDIUM (a consumer configuration that is off the default). Confidence: HIGH (source). DECIDED: documented; no detection of internal attributes.
- Rule 13 colours changed from the measured `ButtonText` to `CanvasText`, and the track border changed to an outline. Impact: LOW (CSS only). Confidence: HIGH on the colour pair (CSS Color 4), measured by the e2e case. DECIDED.
- WebKit forced colours not run. Not a gap: Safari has no forced-colours mode. Visual checks under each real Windows contrast theme are a proof gap, not a decision. DECIDED: out of scope, stated in the spec.
- WebKit right-to-left linear arrows not reversed while non-linear ones are. Impact: LOW (direction, not reachability; 2.1.1 holds). Confidence: HIGH (measured). DECIDED: documented, not overridden.

### OPEN FOR HUMAN

None new. The Slider spec's OPEN FOR HUMAN 1 (Chromium announces a vertical native range as horizontal) and 2 (screen-reader announcement of `aria-valuetext`) are unchanged.
