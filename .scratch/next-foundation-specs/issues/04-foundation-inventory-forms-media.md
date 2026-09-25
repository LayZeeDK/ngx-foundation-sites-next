# 04. Foundation plugin inventory D: Abide, Slider, Orbit, Equalizer, Interchange

Type: research
Status: open
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
