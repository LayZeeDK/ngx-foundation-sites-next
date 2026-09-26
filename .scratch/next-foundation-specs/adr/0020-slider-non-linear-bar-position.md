---
status: accepted
---

# A non-linear Slider handle's native input carries the Bar position, not the value

Foundation's Slider maps values onto the track through `log` and `pow` scales (`positionValueFunction`, `nonLinearBase`), and the library builds every Slider on native `<input type="range">` handles (the [Prototype: Foundation-styled `<input type="range">` Slider](../issues/45-prototype-slider-range-input.md)). A native thumb moves linearly in its own value, so a native input cannot show a non-linear value at the right place. We decided that a non-linear handle's native input carries the Bar position (`min="0"`, `max="1000"`, `step="any"`), that the handle's `value` model holds the value mapped with Foundation's formulas, that `aria-valuetext` always carries the value, and that a keydown handler makes one key press one value step. Consequence a reader would not expect: the native `value`, `aria-valuenow`, and a native form submission carry the position (0..1000), not the value, so non-linear sliders are for forms Angular handles; a consumer who needs a native submission adds a hidden input bound to the value.

## Considered options

- A custom `role="slider"` handle for non-linear scales only: exact ARIA values, but a second slider implementation owning pointer, keys, ARIA, and value maths, and the APG's touch caution, for one Option.
- Dropping non-linear scales: loses a documented Foundation feature that the native form supports at the cost above.
