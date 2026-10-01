# 196. Research: extending Foundation 6.9's styles with runtime custom properties

Type: research
Status: claimed
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
