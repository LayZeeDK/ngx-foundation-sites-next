# 64. Prototype: Slider before hydration, non-linear bounds, and RTL

Type: prototype
Status: resolved
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

## Answer

Resolved 2026-09-26 (AFK). Prototype files, evidence logs, and run instructions: [prototypes/slider-hydration-nonlinear/](../prototypes/slider-hydration-nonlinear/README.md). Workspace: `D:/tmp/nfs-proto-slider-hydration-nonlinear/slider-proto/` (copied from the Slider prototype's own workspace; Angular 22.2.0 SSR app, `foundation-sites` 6.9.0 Sass, `@playwright/test` 1.63.0).

### Verdict

Mostly yes, with one confirmed engine-specific gap and one design fix the spec must adopt. Case 1 (before hydration) passes for the two-handle linear drag and the two-handle non-linear key press in Chromium and WebKit once the directive's hydration-adoption logic is changed from an explicit synthetic adopt to deferring entirely to the native `input` event's own replay (see "Decision" item 1); the same case fails, reproducibly, in Firefox specifically for a non-linear handle's pre-hydration key press, whose root cause is narrowed but not fully confirmed. Case 2 (two-handle non-linear bar-position bounds per ADR 0020) passes in all three engines once the sibling bound is computed in native bar-position units on both handles (the range-input prototype's code only did this for the linear form). Case 3 (rule 12 under a real RTL Foundation compile) passes in all three engines for thumb positions, fill extent, and key directions, the last confirming the spec's own hedge that arrow-key reversal in RTL is engine-dependent (WebKit does not reverse; Chromium and Firefox do); forced-colors visibility needed one new Sass rule not yet in the spec, verified visible in Chromium and Firefox (Playwright has no `forced-colors` emulation for WebKit, so it is unproven, not failing, there).

### Results

Run: `npx playwright test e2e/slider.spec.ts` in Chromium 153 (Playwright build), Firefox 155, WebKit 26.6 (Windows arm64 port). 29 passed, 2 failed, 2 skipped. Full log: `prototypes/slider-hydration-nonlinear/logs/final-run.log`. Probe evidence: `prototypes/slider-hydration-nonlinear/logs/probes-annotations.txt`.

| Case | Result | Evidence |
| --- | --- | --- |
| 1a. Drag on a two-handle linear slider before hydration survives | Pass, all 3 engines | `slider.spec.ts` "a drag on the two-handle linear slider before hydration survives" |
| 1b. Keys on a two-handle non-linear slider before hydration survive | Pass in Chromium, WebKit. FAIL in Firefox: model stays at the pre-hydration value | Same-named test; exact failure text below |
| 1c. A replayed non-linear key applies exactly one value step | Pass in Chromium, WebKit (50 -> 51, matching `fraction(51)*1000` = 318.09 native position, despite Chromium/WebKit's own native default action having already drifted the raw position by +10 to 319.02 before hydration -- proof the fix does not double-apply even where the drift is largest). FAIL in Firefox: value stays 50 | `slider.spec.ts` "a replayed non-linear key applies exactly one value step"; `logs/probes-annotations.txt` ("native default action" probe) |
| 2a. Dependent bounds are bar positions, not values | Pass, all 3 engines: `nl-double-min` native `max` and `nl-double-max` native `min` equal the sibling's bar position within 1 native unit | `slider.spec.ts` "dependent bounds are bar positions, not values" |
| 2b. Thumbs cannot cross | Pass, all 3 engines: dragging the minimum handle past the maximum stops it exactly at the maximum's value | `slider.spec.ts` "thumbs cannot cross: dragging past the sibling stops at it" |
| 2c. Fill spans the low thumb to the high thumb | Pass, all 3 engines, within 1.5 px | `slider.spec.ts` "fill spans the low thumb to the high thumb" |
| 2d. Keys respect the dependent bound, one value step per key | Pass, all 3 engines: ArrowRight moves 25 -> 26; End on the minimum handle stops at the maximum's value (75), not the slider's global end (100) | `slider.spec.ts` "keys respect the dependent bound and move one value step" |
| 3a. Thumb positions and fill match a right-to-left slider (real RTL Foundation compile) | Pass, all 3 engines | `slider.spec.ts` "thumb positions and fill match a right-to-left slider" |
| 3b. Key directions match a right-to-left slider | Pass, all 3 engines, once the expectation is written per engine: Chromium and Firefox reverse Right/Left under `dir="rtl"`; WebKit does not (Right still increases). Confirms the spec's own hedge ("as each engine implements the native control") with real numbers instead of leaving it assumed | `slider.spec.ts` "key directions match a right-to-left slider" |
| 3c. Thumb and fill stay visible under forced-colors | Pass in Chromium and Firefox, on both the LTR and the RTL fixture, after adding an experimental `@media (forced-colors: active)` rule group (not yet in `specs/slider.md`). Skipped in WebKit: Playwright has no `forced-colors` emulation for that engine (not a failure) | `slider.spec.ts` "thumb and fill stay visible under forced-colors (double)" / "(rtl-double)"; `logs/probes-annotations.txt` ("forced-colors" probe, before/after the CSS fix) |

### Exact error text of the failures

Both are the same underlying Firefox finding (case 1b and 1c):

```
1) [firefox] -> case 1: before hydration -> keys on a two-handle non-linear slider before hydration survive
   Error: model after hydration
   expect(received).not.toBe(expected)
   Expected: not "lo=25 hi=75"
   (received "lo=25 hi=75" -- the model never changed from its pre-hydration value)

2) [firefox] -> case 1: before hydration -> a replayed non-linear key applies exactly one value step
   Error: expect(received).toBe(expected)
   Expected: "value=51"
   Received: "value=50"
```

Root-cause probe (`probe-keydown-replay.spec.ts`, wraps `addEventListener` around the directive's own `(keydown)` host listener): in all three engines the wrapped listener logs "returned normally" (no exception reaches the wrapper), and a SEPARATE, later `console.error` reports `` `preventDefault` called during event replay. `` with a `jsaction`/`dispatchDelegate` stack (Chromium, WebKit) or a bare `Error` with no captured message text (Firefox) -- confirming Angular's own error handler, not the directive's code, both throws and catches this, matching the rendering-modes research's documented behaviour. The `probe-forced-colors.spec.ts` "native default action" probe shows the mechanism candidate: Chromium and WebKit's native default action for `ArrowRight` on a `step="any"` range moves the raw position by +10 (309.02 -> 319.02); Firefox's moves it by only +1 (309.02 -> 310.02). After hydration, Chromium/WebKit settle on 318.09 (value 51, correct); Firefox settles on exactly 310.02 -- unchanged from its own native default action, as if the replayed `keydown`'s `value.set(51)` never reached the DOM, or reached it and was then overwritten by a same-tick replay of the companion `input` event reading the pre-write native value. Which of those two happens was not isolated further (see "does not prove").

### What the prototype does not prove

- The root cause of the Firefox finding above at the Angular-internals level (event replay ordering between a `keydown` and its companion native `input` event, relative to `afterRenderEffect`'s write scheduling). The behaviour is reproduced twice and the numbers are exact; the mechanism is a strong candidate, not a confirmed trace.
- Real Safari's or Firefox for a real OS's forced-colors (Windows High Contrast) rendering: only Playwright's Windows-hosted WebKit and the Chromium/Firefox builds under test ran, and WebKit has no `forced-colors` emulation in Playwright at all, so the new CSS rule is unverified there.
- Touch and mobile pre-hydration input, and `@defer (hydrate on interaction)` with a non-linear or two-handle slider (out of this ticket's three numbered cases; the existing rendering-modes research already flags event replay of `pointerdown`/`click` as adopted-not-reset, which this prototype did not re-test).
- A two-handle non-linear `pow` fixture (only `log` was built for the two-handle form here; `pow` shares the exact same `toNative`/`nativeMin`/`nativeMax` code path and was already proven correct for a single handle in the range-input prototype, so this is a code-reuse argument, not a new measurement).
- Vertical RTL, or RTL combined with a non-linear scale (rule 12 is explicitly scoped to `.slider:not(.vertical)`; this ticket's case 3 only asked for the plain RTL form).
- Screen-reader announcement of anything (inherited open point from the range-input prototype; `aria-valuetext` announcement was not re-tested here either).

### Decision handed to the Slider spec

For [Spec: Slider](../issues/32-spec-slider.md):

1. Change the "Full hydration" paragraph's adoption description: the directive must NOT call an explicit adopt (a synthetic `onInput()`-equivalent) from inside the `afterRenderEffect` write phase on the first mismatch. It must do nothing there besides marking that the first pass happened, and rely entirely on the native `input` event that any native value change (drag or a native default key action) already queues for replay; that event's own `(input)` listener is idempotent no matter how many times or in what order it fires. This is what keeps a replayed non-linear key to exactly one value step; the naive "explicit adopt" design double-applies the step on top of whatever the browser's own native default action already did. Verified: still correct for a plain pre-hydration drag on a linear handle (the range-input prototype's own passing case).
2. Add the two-handle non-linear form's dependent bounds to the spec: the sibling bound on a non-linear handle's native `min`/`max` must be the sibling's bar position (`fraction(siblingValue) * 1000`), not the sibling's value -- the current spec text and the range-input prototype's code only did this conversion for the linear form. Add a two-handle non-linear example to "Rendered HTML" alongside the existing single-handle one.
3. Home and End on a non-linear range handle must go to the dependent bound (the sibling's value), the same as the linear form and the APG multi-thumb pattern, not to the slider's global `start()`/`end()`. Make this explicit in the keyboard table for non-linear handles specifically.
4. Rule 12 is confirmed correct under an actual RTL Foundation compile (thumb positions, fill extent, and per-engine key directions all match); no change needed to rule 12 itself. Note for the audit trail: the range-input prototype's own "rtl" fixture used `dir="rtl"` under the default (LTR) Foundation compile, so it never actually exercised rule 12 (Foundation's `scale(-1, 1)` mirror is only emitted when `$global-text-direction: rtl` is set at compile time); this prototype is the first real test of it.
5. Add a rule 13 to the `nfs-slider` mixin's Sass table: a `@media (forced-colors: active)` rule group, because `foundation-range-input`'s `appearance: none` (needed for the custom thumb) also opts the thumb out of the browser's forced-colors system-colour treatment, so the thumb and the fill both resolve to the page's `Canvas` colour and disappear. `forced-color-adjust: none` plus `ButtonText` (thumb), `Highlight` (fill), and `CanvasText` (a container border) restore visibility; verified with pixel comparisons and computed-style probes in Chromium and Firefox. This is a new WCAG-adjacent requirement the spec's current Sass rule list (0-12) does not cover; the spec's WCAG 2.2 AA table (1.4.11 row) should reference it.
6. Document a known Firefox-specific limitation in the rendering-modes subsection, next to the existing OPEN FOR HUMAN 3 (`preventDefault` during replay): a non-linear handle's pre-hydration key press is not guaranteed to survive hydration as exactly one value step in Firefox (Chromium and WebKit do); only the tiny native default-action drift, if any, is what a Firefox user sees. This does not block the spec (see Triage): it is an internal implementation detail, not a public API or contract change, and a fix path exists (further tracing of the replay/write-effect race, or filing it against Angular's jsaction/event-dispatch primitive once root-caused).

### Triage

Applying the map's rating rule (impact x confidence; only HIGH impact with NOT-HIGH confidence stays `OPEN FOR HUMAN`):

- **Firefox non-linear pre-hydration key gap** (decision 6 above). Impact: MEDIUM, not HIGH -- it is narrow (one engine, one interaction: a key press, on a non-linear handle, in the brief pre-hydration window), it does not freeze any public API or contract (the `value` model, `FormValueControl` shape, and ADR 0020's bar-position design are all unaffected), and a fix path exists entirely inside the directive's internals. Confidence on the empirical behaviour itself is HIGH (reproduced twice with exact matching numbers across two independent test files); confidence on the root cause is NOT HIGH (the replay-ordering race is a strong candidate, not a confirmed trace). Since impact is not HIGH, this is decided with an applied default (document it as a known limitation, decision 6) rather than left `OPEN FOR HUMAN`.
- **Forced-colors system colours** (decision 5 above: `ButtonText`/`Highlight`/`CanvasText`). Impact: LOW -- purely additive CSS, easily changed later, no API surface. Confidence: HIGH (these are the canonical CSS Forced Colors Module keywords for exactly this purpose, and the fix was verified visually and by computed style in two engines). Decided with the applied default (add rule 13 as measured); not `OPEN FOR HUMAN`.
- No item from this ticket rates HIGH impact with NOT-HIGH confidence, so nothing is left `OPEN FOR HUMAN` here. WebKit's un-run forced-colors coverage and the unconfirmed Firefox root cause are recorded under "What the prototype does not prove" instead, since they are proof gaps (more testing or tracing would close them), not decisions that need a human's judgment or taste.
- Inherited open points from the range-input prototype (vertical orientation reported as horizontal in Chromium, `aria-valuetext` announcement, Foundation's default thumb size) are unchanged by this ticket and are not re-listed here; they remain tracked on the [Prototype: Foundation-styled `<input type="range">` Slider](45-prototype-slider-range-input.md) ticket.

### Amendment, 2026-09-27 (audit 0007)

The 'OPEN FOR HUMAN 3' named in decision 6 is building-blocks Part 4, Decided item 3 (state first, `preventDefault()` last, the logged replay error accepted), and its upstream request is not filed, by the user's ruling ([Upstream filings](76-evidence-upstream-filing-readiness.md)). The inherited open points are decided: vertical orientation by [Decide: Slider vertical orientation](73-decide-slider-vertical-orientation.md), the `aria-valuetext` announcement by [Resolve the assistive-technology checks](77-evidence-assistive-technology-checks.md), check 11, and the thumb size by the range-input prototype's triage (a 24 px minimum).
