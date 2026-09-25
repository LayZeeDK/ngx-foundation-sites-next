# 04. Foundation plugin inventory D: Abide, Slider, Orbit, Equalizer, Interchange

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

What exactly do Foundation's Abide, Slider, Orbit, Equalizer, and Interchange plugins do? For Abide, capture the full validator set, the error markup (`.form-error`, `.is-invalid-input`, `.is-invalid-label`, `aria-invalid`, `aria-describedby`), and the live-validation timing. For Slider, capture single versus double handles, the hidden-input binding, and the ARIA attributes it sets. For Orbit, capture the slide markup, autoplay, animation classes, and the accessibility flag. For Interchange, capture the rule syntax and the named media query map.

Sources: `d:/projects/github/foundation/foundation-sites/js/foundation.{abide,slider,orbit,equalizer,interchange}.js`, `d:/projects/github/foundation/foundation-sites/js/foundation.util.{timer,touch,imageLoader}.js`, and `d:/projects/github/foundation/foundation-sites/docs/pages/{abide,slider,orbit,equalizer,interchange,forms}.md`. Online fallback: https://get.foundation/sites/docs/<name>.html.
## Deliverable

`research/foundation-inventory-forms-media.md` with one section per plugin containing:

1. **Purpose** in one or two sentences, in Foundation's own words.
2. **Markup contract**: the elements, CSS classes, and state classes (`is-active`, `is-open`, and so on) the plugin expects and toggles. Quote the docs example markup.
3. **Options**: every `data-*` option with its JS default, type, and meaning, from the plugin source (`js/foundation.<name>.js` under `d:/projects/github/foundation/foundation-sites`) cross-checked against `docs/pages/<name>.md`.
4. **Events**: every `*.zf.<plugin>` event the plugin fires or listens for, and what triggers it.
5. **Public methods** and what they do.
6. **Keyboard and ARIA behaviour** the plugin implements today (what it sets, what keys it handles, via `foundation.util.keyboard.js` registrations).
7. **Dependencies on utilities** (MediaQuery, Motion, Triggers, Keyboard, Nest, Box, Touch, Timer, ImageLoader) and on other plugins.
8. **Sass configuration** that shapes behaviour (breakpoint maps, animation settings) as opposed to pure theming.
9. **Behaviour that only jQuery makes easy** and might not carry over (for a later ticket to decide).

Cite the file path and, where practical, the line or function for each claim. Plain ASCII. Do not read this repo's `packages/ngx-foundation-sites/COMPONENT_BUILDING_BLOCKS.md` or the existing Angular implementations: the findings must come from Foundation's own sources.

## Answer

Gist (all from the 6.9.0 clone; line citations in the findings file):

- Abide validates on `change` by default (`validateOn: 'fieldChange'`), plus `input` when `liveValidate` and `blur` when `validateOnBlur`; the three flags are independent. Whole-form validation runs from a `submit.zf.abide` handler whose boolean return cancels submission. Error state is `.is-invalid-input` + `data-invalid` + `aria-invalid="true"` on the input, `.is-invalid-label` on the label, `.is-visible` on `.form-error`, and inline `display` on `[data-abide-error]`. With `a11yAttributes` it also adds `role="alert"` to errors, `aria-live` to the global error, and `aria-describedby` to the input pointing at the first *visible* error, but only if the input has no `aria-describedby` already (so a hint-described input never gets its error announced).
- Abide's validator set: 17 named patterns (`alpha` ... `color`, `website` as domain-or-url), one built-in validator `equalTo`, plus `data-validator` custom names called as `fn($el, required, $parent)`. `pattern` may be a name or a raw regex; `type` alone is looked up as a pattern name. Radio/checkbox groups are required if any member is; checkboxes honour `data-min-required`, which is skipped until the first submit.
- Slider: one or two `.slider-handle[data-slider-handle]` plus one hidden `<input>` per handle, or an external input bound through `aria-controls`. JS writes `role=slider`, `aria-controls`, `aria-valuemin/max/now`, `aria-orientation`, `tabindex=0` on handles and `id/min/max/step/value` on inputs. Keys: arrows +-step, Shift+arrows +-10 steps, Home/End; no PageUp/Down, no `aria-valuetext`/label. Events `moved.zf.slider` (after the 200 ms `Move` animation) and `changed.zf.slider` (500 ms debounce). `invertVertical` is declared but never read. The Sass `$slider-transition` (0.2 s) must match `moveTime`. `foundation-range-input` (native `<input type=range>`) exists but is opt-in, not in `foundation-everything`.
- Orbit: `.orbit > .orbit-wrapper > (.orbit-controls buttons, ul.orbit-container > li.orbit-slide.is-active)` plus `nav.orbit-bullets > button[data-slide]`. Autoplay is a pausable `Timer` (5000 ms), paused on hover and toggled by clicking a slide; never paused by focus. Animation is Motion UI classes (`slide-in-right` etc.) via `Motion.animateIn/Out`; `useMUI:false` (`data-use-m-u-i`) falls back to `.is-in` + show/hide. `accessible:true` only adds `tabindex=0` on `.orbit-container` and Left/Right arrow handling; ARIA added by JS is just `aria-live="polite"` on the active slide. Sass sets `.orbit-container { height: 0 }` until JS measures the tallest slide. `slidechange.zf.orbit` fires synchronously at animation start, not at its end.
- Equalizer: `[data-equalizer]` + `[data-equalizer-watch]`, inline `height` writes, options `equalizeOnStack`, `equalizeByRow`, `equalizeOn` (a `MediaQuery.is` expression). Re-runs on `resizeme`/`mutateme` from the Triggers util. No CSS, no ARIA.
- Interchange: `data-interchange="[path, query], ..."`, last matching rule wins, type auto-detected (`IMG` -> `src`, image extension -> `background-image`, else `$.get` HTML partial + `$(response).foundation()`). Named queries: `landscape`, `portrait`, `retina`, plus every Sass `$breakpoints` key (small 0em, medium 40em, large 64em, xlarge 75em, xxlarge 90em) read from the `.foundation-mq { font-family }` bridge as `only screen and (min-width: X)`.

Surprises: the Abide docs demo uses `aria-errormessage` pointing at ids that do not exist and the plugin never touches that attribute; Triggers snapshot `[data-resize]` nodes once at window load, so Equalizer/Orbit/Interchange instances created later never get resize events; Interchange's path parser joins path pieces with `''`, dropping any `, ` inside a path; the docs write `tabindex="1"` on slider handles but the JS overwrites it with `0`.

Open questions (not settled from sources, for the decision tickets): whether Equalizer has any reason to exist next to flex/grid stretch; whether Interchange image/background cases should just be `<picture>`/`srcset`; whether Abide's checkbox `data-min-required` first-submit gating and the `aria-describedby` no-overwrite rule are behaviours to keep or bugs to fix; how Orbit's autoplay should meet the APG carousel pattern (pause control, `aria-live` off while rotating, stop on focus), none of which Foundation does today.

Findings: ../research/foundation-inventory-forms-media.md
