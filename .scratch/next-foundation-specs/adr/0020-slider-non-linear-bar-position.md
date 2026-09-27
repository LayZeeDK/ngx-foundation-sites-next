---
status: accepted
---

# A non-linear Slider handle's native input carries the Bar position, not the value

Foundation's Slider maps values onto the track through `log` and `pow` scales (`positionValueFunction`, `nonLinearBase`), and the library builds every Slider on native `<input type="range">` handles (the [Prototype: Foundation-styled `<input type="range">` Slider](../issues/45-prototype-slider-range-input.md)). A native thumb moves linearly in its own value, so a native input cannot show a non-linear value at the right place. We decided that a non-linear handle's native input carries the Bar position (`min="0"`, `max="1000"`, `step="any"`), that the handle's `value` model holds the value mapped with Foundation's formulas, that `aria-valuetext` always carries the value, and that a keydown handler makes one key press one value step. Consequence a reader would not expect: the native `value`, `aria-valuenow`, and a native form submission carry the position (0..1000), not the value, so non-linear sliders are for forms Angular handles; a consumer who needs a native submission adds a hidden input bound to the value.

2026-09-27: assistive-technology increment and decrement actions step the native input by its `step`, which `any` makes 0 in WebKit (VoiceOver's swipe changes nothing) and which Chromium's increment replaces with one native unit (several actions per value step); the Slider spec documents it as a limitation (its D22), and a prototype weighs a numeric native step ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).

2026-09-27, second note ([Prototype: a non-linear Slider Handle that assistive-technology increments move](../issues/134-prototype-slider-nonlinear-at-increment.md)): the native input now carries integer native positions: `step="1"`, the value and the dependent bounds rounded to integers, over a native range of 1000, or the smallest 1000 times a power of ten (at most 100000) in which every value step spans two native units. An `input` rule turns an outside change that maps to the current value (every engine's assistive-technology increment moves the native value one unit or one `step`) into one value step in its direction, unless a pointer is pressed on the Handle. `step="any"` is withdrawn: with it WebKit's increment changes nothing, and with the rule its zero-step rewrite of the value's string moved decrements up. The first note's limitation is lifted, and the consequence above reads 0 to the native range.

## Considered options

- A custom `role="slider"` handle for non-linear scales only: exact ARIA values, but a second slider implementation owning pointer, keys, ARIA, and value maths, and the APG's touch caution, for one Option.
- Dropping non-linear scales: loses a documented Foundation feature that the native form supports at the cost above.
- `step="any"` with assistive-technology increments as a documented limitation (the first design, until the second note): exact positions, but VoiceOver's and Firefox for Android's increments change nothing and Chromium's needs several actions per value step.
