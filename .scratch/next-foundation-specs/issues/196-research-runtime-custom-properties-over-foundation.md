# 196. Research: extending Foundation 6.9's styles with runtime custom properties

Type: research
Status: resolved
Blocked by: 191
Labels: wayfinder:research
Map: ../map.md

## Question

Could the library extend Foundation 6.9's Sass so that a theme value reaches the CSS as a custom property at runtime instead of a Sass variable at compile time? For example, the library would compile Foundation once, with a property reference where a setting is used. What would that cost against this bundle's records, and how does Yeti's own token model compare ([Research: Yeti, Foundation's version 7](194-research-yeti-foundation-7.md))?

## User question, 2026-10-01

> 13. Could we make a mix between SCSS and CSS Custom Properties so that we extend Foundation for Sites styles to support CSS Custom Properties at runtime instead of SCSS variables at compile time?

The orchestrator notes two records this question touches. The map's Out of scope line rules out "Runtime theming through custom properties as a component contract". And the user's earlier clarification on [Research: splitting Foundation's family CSS into structure and theme](191-research-structure-theme-split.md) avoided custom properties for that split. Both are recorded here as inputs; whether to reopen them is the user's call.

## How to work it

Resolve with a `/research` subagent, compiling with Dart Sass 1.104.1 under `D:/tmp/`. Cover:

1. Which Foundation 6.9 settings can become a property reference without breaking Foundation's Sass. A setting fed to `scale-color`, `color-pick-contrast`, `rem-calc`, or arithmetic fails or computes the wrong value at compile time. Measure it: substitute `var(--nfs-<setting>)` for each setting the first-milestone mixins read, compile, and classify each as passes, compile error, or wrong value. 191's perturbation fixtures under `D:/tmp` may help.
2. What fails: settings that change selectors, media queries, or which rules exist, which 191 found to be 60% of the setting-dependent declarations. Then what CSS functions in the map's browser target could replace the Sass math (`color-mix()`, relative colour syntax, `calc()`), against Baseline widely available on 2026-05-07.
3. What it would make possible for lazy family styles: one library-compiled stylesheet per family, with no consumer build step.
4. What it costs against ADR 0012 and P18 (never re-implement Foundation), the Out of scope line, and the Variant declaration tooling (ADR 0040).

Write `research/runtime-custom-properties.md`, and append an `## Answer`. Decide nothing.

## Answer

Resolved 2026-10-01 (Opus 5.5). Findings: [research/runtime-custom-properties.md](../research/runtime-custom-properties.md). Measured with Dart Sass 1.104.1 against Foundation 6.9.0 under `D:/tmp/nfs-research-196`; the Out of scope line and the user's clarification on 191 are recorded as inputs, not reopened. Nothing is decided.

- **Share that survives.** Of the 354 settings the 35 first-milestone export mixins read, 237 (67%) can become `var(--nfs-<setting>)` and still reproduce Foundation's output, at the default and at one or two further values; 74 (21%) fail to compile and 43 (12%) give a wrong value. 144 of the 180 list and map elements pass as per-element properties. Compiled together, they leave 357 of 1,714 declarations (21%) reading a property.
- **What fails.** Every palette colour, `$black`, `$white`, `$global-font-size`, the breakpoints, and the arithmetic inputs: Foundation feeds them to `scale-color`, `color-pick-contrast`, `smart-scale`, `rem-calc` and `strip-unit`, arithmetic, comparisons, and selector interpolation, 93 of 104 failures inside its mixin code. Booleans, `null` defaults, keywords, `nth()` lookups, and `has-value()` give wrong values.
- **Selectors and media queries stay compile-time.** Of 191's 1,091 setting-dependent declarations, 102 follow properties fully, 81 for their value only, 336 depend on a setting only through selector, media query, or presence (`var()` is valid only in property values), and 572 depend on a setting that cannot be a property.
- **CSS in the target.** `calc()`, `min()`/`max()`, `color-mix()`, and trigonometric functions are Baseline widely available on 2026-05-07; relative colour, `contrast-color()`, `light-dark()`, `@property`, `if()`, and container style queries are not. Measured in Chromium, `color-mix()` reproduces `mix()` and `rgba()` exactly and `scale-color` in 12 of 17 Foundation cases (off by up to 13.3 of 255 otherwise); `color-pick-contrast` has no replacement.
- **Lazy family styles.** One library-compiled sheet for the 35 mixins compiles, is 12% larger (80,035 bytes) plus 253 `:root` defaults (9,271 bytes), computes the same as Foundation in Chromium, and eight properties changed at runtime matched Foundation compiled with the same setting. A directive could load it with no consumer build, but a consumer who changes a failing setting still needs the consumer's compile.
- **Cost against the records.** The library would compile Foundation and ship its CSS (ADR 0012), 253 public properties are the runtime theming API P18, the Out of scope line, and building-blocks rule out, extending past the passing set means rewriting Foundation's mixin math (P18), and `--nfs-<setting>` is already the Variant properties' namespace (14 name collisions; ADR 0040's generator would see Foundation's default names only).
- **Yeti.** Yeti's 297 runtime tokens derive values with `pow()`, `oklch()`, `light-dark()`, and relative colour, outside the map's target; laid over Foundation 6.9, the same model reaches the values Foundation prints directly but not the ones it computes, the palette included.
