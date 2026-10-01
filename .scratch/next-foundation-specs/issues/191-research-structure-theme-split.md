# 191. Research: splitting Foundation's family CSS into structure and theme

Type: research
Status: claimed
Blocked by: 183
Labels: wayfinder:research
Map: ../map.md

## Question

Could each family's CSS be split into a structural part, which does not depend on the consumer's Foundation settings, and a theme part, which does? Angular Material splits its styles this way. Would the split make sense here, and is it possible? If the structural part needs no settings, the library could compile it and load it lazily with no consumer code (as Material's component `styleUrls` and the gsd-pi `NfsButton` do), leaving only the theme part to the consumer's build.

## User instruction, 2026-10-01

The user wrote, verbatim:

> Would it make sense and be possible to split Foundation for Sites' component styles between for example layout and theming similar to what Angular Material does?

## How to work it

Resolve with a `/research` subagent, reading the local clones (`d:/projects/github/angular/components` at `22.2.x`; `d:/projects/github/foundation/foundation-sites` 6.9.0) and compiling with Dart Sass 1.104.1 in the scratchpad or `D:/tmp/`. Cover:

1. How Material does it, with `file:line`: structural CSS in component `styleUrls` that reads `var(--mat-...)` custom properties, and theme mixins (`base`, `color`, `typography`, `density`, `overrides`; `src/material/button/_button-theme.scss`) that emit only token values into the consumer's stylesheet. Note what the split depends on, since Material wrote its component styles around tokens.
2. Measured for each first-milestone export mixin: how much of its output does not change under any Foundation setting? Compile with Foundation's defaults and under perturbed settings (every setting the mixin reads, changed one at a time and together), and diff declaration by declaration. Report the invariant share in rules and bytes per family.
3. Ways to split, each with what it costs against the bundle's records:
   - A Material-style token split, where the library rewrites rules to read `var(--nfs-...)` and the consumer's Sass writes the values. This touches building-blocks' Out of scope line on runtime theming through custom properties, and the rule never to re-implement a style Foundation has (ADR 0012, architecture guide P18).
   - A split by compile diffing, where the library ships the invariant declarations and the consumer compiles the rest. Can the consumer's compile emit only the setting-dependent declarations without re-implementing Foundation's mixins, for example through a build plugin that filters the compiled output?
   - Any other split the sources show.
4. What would load lazily, and what would stay global, under each split, and how the cascade order and the `@layer` order of [Prototype: a directive that loads and unloads its family's consumer-compiled styles](184-prototype-lazy-family-styles.md) would hold.

Write `research/structure-theme-split.md` with the options, the measurements, and the open unknowns. Append an `## Answer` to this ticket. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
