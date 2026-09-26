# 73. Decide: Slider vertical orientation

Type: grilling
Status: open
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

How should the vertical Slider (`.slider.vertical`) be built? The [Spec: Slider](32-spec-slider.md) uses one native `<input type="range">` per thumb, rotated inside Foundation's flipped `.slider.vertical` with `aria-orientation="vertical"` (its decision 29, from the [Prototype: Foundation-styled `<input type="range">` Slider](45-prototype-slider-range-input.md)), and left the vertical form OPEN FOR HUMAN in the trap quadrant because Chromium announces the rotated input as horizontal until vertical form controls reach the Browser target. The alternatives include: the same native input with CSS `writing-mode: vertical-lr` (or `direction`) where supported, falling back to rotation elsewhere; a custom `role="slider"` handle for the vertical form only; or dropping the vertical form until the platform catches up.

Decide it with the panel the map's "Open-decision pass" note prescribes: an evidence dossier, four panelists (Opus and Fable, two adversarial), and a judge. The decision must say exactly what the Slider spec, the `nfs-slider` mixin rules, building-blocks, and the README open list change to, and whether a prototype is needed first.

## How to work it

The orchestrator runs the panel. The evidence dossier goes to `research/decision-slider-vertical.md`: Baseline status and support dates for vertical form controls (`writing-mode` on `<input type="range">`) in the Browser target and in current engines (web-features, MDN browser-compat-data, caniuse); what each engine's accessibility tree exposes for a rotated input, a `writing-mode` input, and `aria-orientation` on a native range input (measured in Chromium, Firefox, and WebKit with Playwright's accessibility snapshot or the Chromium CDP accessibility tree, in a throwaway page under `D:/tmp/`); ARIA in HTML on `aria-orientation` for `input type=range`; the APG slider examples, including the vertical one; how Foundation 6.9's JavaScript Slider does vertical; how Angular Material's slider handles orientation; WCAG 2.2 AA implications (1.3.1, 4.1.2, 2.5.8); and the Slider spec's non-linear, two-handle, forced-colours, RTL, and hydration constraints any alternative must keep. The judge writes the `## Answer` here.
