# 64. Prototype: Slider before hydration, non-linear bounds, and RTL

Type: prototype
Status: open
Blocked by: 32
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Slider](32-spec-slider.md) answer. The [Prototype: Foundation-styled `<input type="range">` Slider](45-prototype-slider-range-input.md) proved single sliders before hydration; the spec extends the design to cases only running code can confirm, in Chromium, Firefox, and WebKit:

1. Keys and drags made before hydration survive on two-handle and non-linear sliders (the pre-hydration value kept, the live value written in `afterRenderEffect`), and a replayed non-linear key does not apply a second step.
2. A two-handle non-linear slider works with its bounds in bar-position units (thumbs in the right place, no crossing, the fill correct) as ADR 0020 describes.
3. The spec's rule 12 gives a correct right-to-left slider when Foundation is compiled with `$global-text-direction: rtl`, and the thumb and fill stay visible in forced-colors mode.

If a case fails, the orchestrator reopens the Slider spec; otherwise the verdict is appended to its decision log.

Read first: `specs/slider.md` (the handle API, the non-linear mapping, the custom CSS list, and the rendering-modes subsection), `adr/0020-slider-non-linear-bar-position.md`, the Slider prototype's answer and `prototypes/slider-range-input/`, and `research/angular-rendering-modes.md` sections 4 and 7.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: copy the Slider prototype's plain Angular CLI 22.2 `--ssr` application to `D:/tmp/nfs-proto-slider-hydration-nonlinear/` (Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0), add the two-handle non-linear form and an RTL build of Foundation's Sass, and drive it with `@playwright/test` in all three engines, delaying the main bundle with `page.route` for the pre-hydration cases and emulating `forced-colors: active` for case 3. Never modify this repo's working tree outside the effort directory.

Capture it: copy the decisive files into `prototypes/slider-hydration-nonlinear/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Slider spec, and anything left `OPEN FOR HUMAN`.
