# 45. Prototype: Foundation-styled `<input type="range">` Slider

Type: prototype
Status: resolved
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Can the `foundation-range-input` mixin plus a fill gradient, and two overlapped range inputs for the double-handle case, deliver single, double, vertical, disabled, stepped, and non-linear sliders that pass axe and honour the APG slider and multi-thumb slider patterns within the browser target? Or do the double and vertical cases need a custom `role=slider` implementation, and what does that cost?

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-forms-media.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/angular-material-reference.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-slider-range-input/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/slider-range-input/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Resolved 2026-09-26 (AFK). Prototype files and run instructions: [prototypes/slider-range-input/](../prototypes/slider-range-input/README.md). Workspace: `D:/tmp/nfs-proto-slider-range-input/` (plain Angular CLI 22.2.0 SSR app, `foundation-sites` 6.9.0 Sass through Angular's Sass pipeline; Nx was not used because nothing in the question depends on it).

### Verdict

Yes. Native `<input type="range">` elements, one per thumb, deliver all six forms (single, double, vertical, disabled, stepped, non-linear) plus RTL. The thumbs are styled by `foundation-range-input`, Foundation's `.slider` container is the track, and Foundation's own `.slider-fill` span is the fill. All 17 test cases pass, axe WCAG 2.2 AA included, in Chromium 153, Firefox 155 and WebKit 26.6, and again in Chromium 120, Firefox 119 and WebKit 17.4 (the Playwright 1.40 builds nearest the Chrome 119 / Firefox 119 / Safari 17 target). The keyboard is native for linear sliders. Dependent bounds for the double form go on the native `min`/`max`, which is what the APG multi-thumb pattern asks for and what ARIA in HTML requires (authors SHOULD NOT put `aria-valuemin`/`aria-valuemax` on `input type=range`). Server HTML carries `min`, `max`, `step`, `value` and the fill. The building-blocks decision stands, and the custom `role=slider` fallback for double and vertical is not needed. Three details of the Slider row need correcting (see "Decision"): the fill is Foundation's `.slider-fill` span rather than a gradient; hydration overwrites a `[value]` host binding, so "replay is irrelevant" is not the whole story; and on a rotated vertical input Chromium reports horizontal orientation whatever `aria-orientation` says. Two points stay open: whether screen readers read `aria-valuetext` on these inputs (the non-linear form depends on it), and Foundation's default 22.4 px thumb.

### Results

Engine sets: "current" = Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 (Playwright 1.63.0); "target" = Chromium 120.0.6099.28, Firefox 119.0, WebKit 17.4 (Playwright 1.40.0). Both sets ran the same spec: 50 passed, 4 skipped (two Chromium-only tests) each. Evidence: the `e2e/slider.spec.ts` test named in the row; logs under `prototypes/slider-range-input/logs/`.

| Case | Result | Evidence |
| --- | --- | --- |
| Server HTML | Pass. Every input carries `min`/`max`/`step`/`value` (dependent bounds already applied: `double-min` max 75, `double-max` min 25), `aria-orientation`, `aria-disabled` or `disabled`, `aria-valuetext`; the container carries `--nfs-slider-lo`/`--nfs-slider-hi` | "server HTML carries min, max, step, value and the fill"; `logs/ssr-range-inputs.html.txt` |
| Dehydrated (`hydrate never` residue; app bundle blocked) | Pass, both engine sets: axe-clean, thumbs painted at the server value, arrow keys move the native value. The fill does not follow until hydration | "server HTML with the app bundle blocked ..." |
| Keys pressed before hydration | First run FAILED in all engines (native value and model reset to 50 after hydration). Passes once the live `value` property is written in `afterRenderEffect` and a pre-hydration value is adopted | "keys pressed before hydration survive hydration" |
| Hydration | Pass: no console errors or NG0xxx messages | "hydrated page: no console errors and axe-clean" |
| axe WCAG 2.2 AA (hydrated) | First run FAILED `target-size` on the double inputs; passes after rules 5 and 10 below (24 px input box; fill `pointer-events: none`) | same test; exact text below |
| Thumb position | Pass, 12 sliders in every engine: the pixel at the computed thumb centre is `$slider-handle-background` and the pixel just outside is not | "every thumb is painted where the value says" |
| Fill | Pass: `.slider-fill` runs from the low thumb to the high thumb within 1.5 px, horizontal, RTL and vertical, and follows value changes | "fill runs from the low thumb to the high thumb" |
| Single, APG keys | Pass natively: Right/Up +1, Left/Down -1, Home min, End max; PageDown moves 10 % of the range in every engine (200 -> 180) | "APG slider keys on a single slider"; annotations in `logs/chromium-ax-sliders.log` |
| Double, APG multi-thumb | Pass: min thumb End stops at the max value, the sibling's native bound follows (Chromium AX tree: Minimum 0..75, Maximum 25..100), tab order constant | "APG multi-thumb ..."; `logs/chromium-ax-sliders.log` |
| Vertical keys | Pass: Up and Right increase, Down and Left decrease | "vertical: ..." |
| Vertical orientation for assistive tech | PARTIAL: Chromium reports `orientation: horizontal` for a native range with `aria-orientation="vertical"`; the control `div[role=slider]` reports vertical, so CDP does expose orientation. Firefox and WebKit not measurable here | `e2e/probe-valuetext.mjs`, `logs/probe-valuetext.log` |
| Pointer drag | Pass, every thumb (single, both double thumbs, vertical, vertical double, RTL, stepped snaps to 5, log and pow map the bar midpoint to 68 and 31 as Foundation's formulas do); dragging one thumb past the other stops at it | "pointer drag moves every thumb along its axis", "long fast drag ..." |
| Meeting thumbs | Pass: at 100/100 the minimum thumb drags left, at 0/0 the maximum drags right (z-index swap) | "meeting thumbs stay separable at both ends" |
| Same-frame cross-thumb input | Pass after clamping in the input handler (the native bounds are host bindings refreshed on the next change detection) | "cross-thumb keys in the same frame never invert the range" |
| clickSelect (track press, range form) | Pass on `click`; the first version on `pointerdown` FAILED (focus lost) | "clickSelect on the range track ..." |
| Disabled | Pass: soft (default) is focusable, `aria-disabled="true"`, keys and drags change nothing; native `disabled` leaves the tab order. The first run FAILED (soft slider dragged to 90) | "disabled: ..." |
| Stepped and non-linear keys | Pass: step 5 moves 50 -> 55 with `aria-valuetext="55 percent"`; the log slider moves one value step per key (50 -> 51, PageUp +10, End 100 with native position 1000, Home 0) | "stepped and non-linear ..." |
| Focus visible | Pass only with a custom rule: `foundation-range-input` sets `:focus { outline: 0 }` and nothing else | "keyboard focus is visible on the thumb" |
| Firefox thumb | Gap in Foundation's mixin: Gecko's default thumb border and rounded corners are not reset when `$slider-radius` is 0; custom rule added | screenshots in the workspace `notes/` |
| WebKit on Windows arm64 | Ran with no error in both Playwright versions. WebKit does not focus a range input on press (the single slider too), unlike Chromium and Firefox | `logs/probe-drag.log` |

### Exact error text of the failures (all fixed in the captured files)

- axe, before the fixes: `target-size #double-min` / `Fix any of the following:` / `Target has insufficient size (365.6px by 8px, should be at least 24px by 24px)` / `Target has insufficient space to its closest neighbors. Safe clickable space has a diameter of 0px instead of at least 24px.` (same for `#double-max`, `#vd-min`, `#vd-max`, `#rtl-min`, `#rtl-max`). Cause: Foundation leaves the input box at the track height (0.5rem = 8 px), and the fill span overlapped the thumbs.
- Pre-hydration keys with a `[value]` host binding: `Error: native value after hydration` / `Expected: "55"` / `Received: "50"` and `Error: model after hydration` / `Expected: "value=55"` / `Received: "value=50"` (Chromium, Firefox, WebKit).
- Soft disabled, first version: `Expected: "value=40"` / `Received: "value=90"`. Cause: one selector list mixing `::-webkit-slider-thumb` and `::-moz-range-thumb` is invalid in every engine and was dropped whole, so the thumb kept `pointer-events: auto`.
- clickSelect on `pointerdown`: `Error: expect(locator).toBeFocused() failed` / `Expected: focused` / `Received: inactive`. Cause: the browser moves focus on mousedown after the handler's `focus()`.
- Early WebKit drag failures (`Error: double: lo=77 hi=90` and similar) were a test bug (state read before WebKit delivered the drag's last `input` events); polling fixed them, and `logs/probe-webkit-drag-bare.log` shows a plain range input drags correctly in WebKit.
- SSR server before `allowedHosts` was set: `Header "host" with value "localhost:4450" is not allowed.`

### Custom CSS the Slider needed on top of Foundation

Foundation supplies the thumb (`foundation-range-input`: size, colour, radius, `-webkit-`/`-moz-` pseudo-elements), the track (`.slider`: height, background, margins, `touch-action`), the fill (`.slider-fill`: position, height, colour), `.disabled` (opacity, cursor) and `.vertical` (0.5rem x 12.5rem, `scale(1, -1)`). `foundation-everything` does not include `foundation-range-input`; the consumer must include it. Everything below is in `src/_nfs-slider.scss`, each rule with its reason in a comment:

1. Input over the track: `position: absolute; top: 50%; inset-inline-start: 0; margin: 0; transform: translateY(-50%)`. Foundation styles a native range as a standalone block and has no rule for an input inside `.slider`.
2. `background: transparent` on the input and on `::-webkit-slider-runnable-track` / `::-moz-range-track`. The UA paints a white input box that hides the track and cuts through the sibling's thumb, and the mixin's own track would cover the fill. The container stays the one visible track.
3. `width: calc((L - T) * var(--nfs-slider-span, 1) + T)`, plus `inset-inline-end: 0` on the second input (`input ~ input`). This sizes each input of the range form to the span its dependent `min`/`max` allows, so its native thumb lands on the same pixel as on the full track. `L` is `--nfs-slider-length` (100%, or `100cqh` for vertical) and `T` is `--nfs-slider-thumb` (`$slider-handle-width`). Foundation has no double form for the native input.
4. `pointer-events: auto` on the thumb pseudo-elements, with `pointer-events: none` on the inputs of the range form (a directive style binding) and `z-index: 1` so the inputs sit above the fill. Two overlapped inputs otherwise steal each other's thumbs.
5. `height: 24px` on the input box. axe measures the input box, not the thumb, and Foundation leaves it at 8 px.
6. `:focus-visible` outline on the thumb pseudo-elements (2px `$black`, offset 2px). The mixin removes the outline and adds nothing (WCAG 2.4.7).
7. `&[disabled] { opacity: 1 }`. `.slider.disabled` and `input[disabled]` would otherwise fade twice (0.25 x 0.25).
8. Soft disabled: `[aria-disabled='true']` sets `pointer-events: none` on the input and, in separate rules, on each thumb pseudo-element.
9. `::-moz-range-thumb { border: 0; border-radius: $slider-radius }`. The mixin does not reset Gecko's default border and rounded corners when `$slider-radius` is 0.
10. `.slider-fill` extent from `--nfs-slider-lo`/`--nfs-slider-hi` (`inset-inline-start`, `width`), plus `inset-inline-end: auto` to cancel Foundation's `left: 0` in RTL, `transition: none` (Foundation's `$slider-transition` would lag behind a native thumb, which never animates) and `pointer-events: none` (a press on the fill is a track press, and axe must not count the fill as covering a thumb). Foundation's JavaScript wrote these values inline; there is no CSS equivalent.
11. Vertical: `container-type: size` and `--nfs-slider-length: 100cqh` on `.slider.vertical`. Each input is rotated a quarter turn about its anchored end inside Foundation's flipped container (`transform-origin` plus `translateY(-50%) rotate(90deg)`) with `direction: ltr` (an RTL range would put the minimum at the top). The fill is positioned with `top`/`height`. `writing-mode` vertical controls are out of target (Chrome 124, Firefox 120, Safari 17.4).

Variant A (bare input, mixin only, fill as a `linear-gradient` on the track with the stop at `T/2 + (100% - T) * fraction`) also works in all engines, but only for a lone input. It is not the recommendation, because the range form needs the container anyway and `.slider-fill` reuses Foundation's class.

### What the prototype does not prove

- Real Safari (macOS, iOS) and Safari 17.0 exactly: only Playwright's Windows WebKit port ran (17.4 and 26.6). Chrome 119 exactly: 120 ran.
- Touch and mobile: no Chrome for Android, Firefox for Android or iOS run; the APG touch caution and the `pointer-events` thumb technique under touch are untested.
- Screen-reader output. CDP's accessibility tree does not report `aria-valuetext` even for a `div[role=slider]` control (`logs/probe-valuetext.log`), so the `valuetext` values in `logs/chromium-ax-sliders.log` are the native value and prove nothing either way. The DOM attribute is asserted; its announcement is not.
- Orientation exposure in Firefox and WebKit; forced-colors (Windows High Contrast) rendering of an `appearance: none` thumb; zoom and text spacing.
- Pre-hydration pointer drags, and the double and non-linear forms before hydration (only linear single-slider keys were tested); `@defer` hydrate triggers.
- Non-square thumbs (`$slider-handle-width` different from `$slider-handle-height`; Foundation swaps them for vertical handles), vertical RTL, and a non-linear double slider.
- Signal Forms or `ControlValueAccessor` integration, the `Directionality` service (the prototype reads computed `direction`), sorting handles by DOM order, and the defaults token.
- The custom `role=slider` fallback was not built, since nothing called for it. Cost estimated from sources: the APG multi-thumb example is 394 lines of JavaScript (`slider-multithumb.js`), the APG vertical example 256 (`slider-temperature.js`), Foundation's `foundation.slider.js` 718, and Material's `slider.ts` plus `slider-input.ts` 1,807. A custom slider would own pointer capture, keyboard, value maths, ARIA state and RTL, and would take on the APG touch caution. The native prototype needed 374 lines of TypeScript including comments and the 11 CSS rule groups above.

### Decision handed to the Slider spec

For [Spec: Slider](32-spec-slider.md):

1. Level: native `<input type="range">` for every form. No custom `role=slider`, no Aria, no CDK primitive beyond `Directionality`.
2. Markup: `<div class="slider" nfsSlider>` containing one or two `input[type=range][nfsSliderHandle]` and a `span.slider-fill`. This is Foundation's docs markup with the handle spans and the hidden input replaced by native inputs. Consumer Sass: `foundation-slider`, `foundation-range-input` (not part of `foundation-everything`) and the library's `_nfs-slider.scss` with the rules above. The orchestrator may add `foundation-range-input` to the list of mixins a consumer must include in [Sass packaging for the new library](57-sass-packaging.md).
3. Double form: the native `min`/`max` carry the dependent bounds (APG multi-thumb; never `aria-valuemin`/`aria-valuemax`). Each input's width comes from `--nfs-slider-span`. Inputs get `pointer-events: none` and thumbs `auto`; when the two thumbs meet, the one that can still move goes on top. clickSelect is a `click` host listener on the container that ignores presses that began on a thumb. The input handler also clamps against the sibling.
4. Vertical: rotate each input inside Foundation's flipped `.slider.vertical`, sized with `cqh`, with `direction: ltr`; bind `aria-orientation="vertical"` even though Chromium ignores it (OPEN FOR HUMAN 1). Adopt `writing-mode` when the browser target reaches Chrome 124 / Firefox 120 / Safari 17.4.
5. Disabled: soft by default (`aria-disabled="true"`, a keydown guard for arrows, Home, End and Page keys, `pointer-events: none`), matching building-blocks 1.10; native `disabled` as the opt-in.
6. Non-linear (`positionValueFunction` `pow`/`log`, `nonLinearBase`): the native input carries the bar position (0..1000, `step="any"`) and the model value is mapped with Foundation's formulas. A keydown handler makes one key press one value step (PageUp/PageDown 10 steps, Home/End the ends), and `aria-valuetext` must carry the value because `aria-valuenow` is the position.
7. Value channel: `value` is a `model()`. Bind `[attr.value]` for server HTML, and write the live `value` property in `afterRenderEffect` only when it differs. On the first client render, adopt a native value the user changed before hydration. A `[value]` host binding loses that input. Replay itself needs nothing special: the `input` event is replayable and state is set before any `preventDefault()`.
8. Fill: `--nfs-slider-lo`/`--nfs-slider-hi` style bindings on the container (fractions of the bar, computed on the server too) position `.slider-fill` from the low thumb's outer edge to the high thumb's outer edge. No track gradient.
9. Keys: every APG key is native for linear sliders; PageUp/PageDown move 10 % of the range in all engines. Foundation's `Shift+Arrow` fast step is dropped as a Foundation-only extra and listed under dropped behaviour.
10. Corrections for the building-blocks Slider row (for the orchestrator): "fill gradient" becomes `.slider-fill` positioned by `--nfs-slider-lo`/`--nfs-slider-hi`; "replay is irrelevant" needs the hydration note from decision 7; the Slider prototype question is answered in favour of native inputs for all forms.

### OPEN FOR HUMAN

1. Vertical orientation: on a native range, Chromium exposes `horizontal` whatever `aria-orientation` says, and the only fix inside the browser target is a custom `role=slider`. Is announcing a vertical slider as horizontal acceptable until `writing-mode` is in target? The keys behave identically in both orientations, which is why the prototype does not count it as a failure; sources cannot settle how much it matters to AT users.
2. `aria-valuetext` on native range inputs needs a screen-reader check (NVDA with Chrome and Firefox, VoiceOver with Safari on macOS and iOS, TalkBack with Chrome). The non-linear form announces its value only through it, and `displayWith` relies on it too. No local oracle can decide this (CDP does not report it).
3. Thumb size and WCAG 2.5.8: Foundation's default `$slider-handle-width`/`height` is 1.4rem (22.4 px), under 24 px, so two thumbs within 24 px of each other fail the spacing exception. axe passes only because it measures the 24 px input box. Should the library document `$slider-handle-*: 1.5rem` for the range form, or accept Foundation's default?
4. Colour contrast of Foundation's defaults: fill `$medium-gray` #cacaca against track `$light-gray` #e6e6e6 is about 1.3:1, and the track against white about 1.25:1; the thumb (`$primary-color` #1779ba) against white is about 4.7:1. Material's slider docs ask for 3:1 between the active and inactive track. These are consumer Sass settings: should the Slider spec require a 3:1 fill or only recommend it?

No new prototype ticket is needed. Items 1 to 3 each need a person with assistive technology or a design call; the orchestrator can track them wherever it collects HITL follow-ups.

### Triage (auto-trap quadrant), 2026-09-26

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items". Items 1 and 2 were carried into [Spec: Slider](32-spec-slider.md) (its OPEN FOR HUMAN 1 and 2) and are triaged there, once: item 1 (vertical orientation) STAYS OPEN FOR HUMAN as a trap-quadrant item, and item 2 (`aria-valuetext` announcement) is HUMAN-ONLY BY KIND (assistive-technology check). Item 1 was decided on 2026-09-27 by [Decide: Slider vertical orientation](73-decide-slider-vertical-orientation.md).

3. Thumb size and WCAG 2.5.8.
   - Impact: not HIGH. A Sass rule in the `nfs-slider` Library mixin; no API.
   - Confidence: HIGH. WCAG 2.2 AA is a user requirement for every directive (map Notes), so a docs recommendation was never an option; the spec's decision 43 sizes each thumb `max(24px, $slider-handle-width)` by `max(24px, $slider-handle-height)`.
   - Outcome: DECIDED: a 24 by 24 CSS px minimum thumb in the Library mixin (already closed by [Spec: Slider](32-spec-slider.md) decision 43).
4. Contrast of Foundation's default fill.
   - Impact: not HIGH. Consumer Sass settings plus a compile-time check; no API.
   - Confidence: HIGH. Same user requirement (WCAG 2.2 AA 1.4.11); the ratios are computed with Foundation's own `color-contrast()` (FS `scss/util/_color.scss`).
   - Outcome: DECIDED: 3:1 fill and thumb colours required, checked at compile time with `@error` (already closed by [Spec: Slider](32-spec-slider.md) decisions 44 and 45).

### Amendment, 2026-09-26 (consistency review)

Recorded by the [Consistency review and bundle index](36-consistency-review.md); the answer above is not rewritten.

- Triage item 4 says the fill ratios "are computed with Foundation's own `color-contrast()`". Superseded: the [Spec: Slider](32-spec-slider.md) (D17) computes both ratios unrounded from Foundation's `color-luminance()` with the WCAG formula and never uses `color-contrast()`, which rounds to one decimal and can pass a failing pair (building-blocks 1.10; [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md)). The item's outcome stands.
