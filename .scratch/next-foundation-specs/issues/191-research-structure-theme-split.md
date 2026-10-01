# 191. Research: splitting Foundation's family CSS into structure and theme

Type: research
Status: resolved
Blocked by: 183
Labels: wayfinder:research
Map: ../map.md

## Question

Could each family's CSS be split into a structural part, which does not depend on the consumer's Foundation settings, and a theme part, which does? Angular Material splits its styles this way. Would the split make sense here, and is it possible? If the structural part needs no settings, the library could compile it and load it lazily with no consumer code (as Material's component `styleUrls` and the gsd-pi `NfsButton` do), leaving only the theme part to the consumer's build.

## User instruction, 2026-10-01

The user wrote, verbatim:

> Would it make sense and be possible to split Foundation for Sites' component styles between for example layout and theming similar to what Angular Material does?

The user then clarified, verbatim:

> #6 I meant a SCSS split between structure and theme inspired by for example Angular Material's split, not using their exact mechanism or implementation, meaning in a way that avoids CSS Custom Properties.

So the split is in Sass, and no option may carry theme values through CSS custom properties. A Material-style token option is recorded only as the inspiration and why it is out.

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

## Answer

Resolved 2026-10-01 (Opus 5.5). Findings: [research/structure-theme-split.md](../research/structure-theme-split.md). Per the user's clarification, only Sass-level splits are weighed; Material's token mechanism is the inspiration only, because it carries theme values through custom properties. Nothing is decided; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.

- **Invariant share.** Across the 35 first-milestone export mixins, 623 of 1,714 declarations (36%) and 163 of 677 rules (24%) stayed the same under 1,956 single-setting perturbed compiles of all 487 settings (`$global-flexbox` and `$xy-grid` kept `true`) and one compile with all 487 changed together. As a stylesheet the invariant part is 18,216 of 71,547 bytes minified (25%) and 8,226 of 17,741 gzipped. Per mixin it runs from 100% of declarations (`foundation-sticky`) and 75% (`foundation-tooltip`) to 11% (`foundation-button-group`, `foundation-callout`). Under two settings files from earlier tickets, none of the 623 changed.
- **Why the theme part is large.** 105 rules mix invariant and dependent declarations, and 60% of the 1,091 dependent declarations depend on a setting through their selector, media query, or presence (palette loops, `$breakpoints`, `$breakpoint-classes`, boolean switches), not only through their value.
- **Structure and theme mixins written in Sass from Foundation's mixins: possible only by re-implementing Foundation.** Foundation's export mixins write declarations in their own bodies, and their sub-mixins put both kinds in one rule (`button-base`). A library pair would copy each export mixin's selectors and choose its declarations by hand, against ADR 0012 and P18. gsd-pi's `nfs-button.theme` has this shape.
- **Split by compile diffing: possible without re-implementing Foundation, at a build-setup cost.** The library would ship Foundation's own default compile, filtered to the invariant declarations. Sass cannot filter what a mixin emits, so for the consumer's compile to drop those declarations takes a PostCSS plugin, which `@angular/build` 22.2.0 loads from `postcss.config.json`. Measured: the filter cut the consumer's output to 81% and 79% of its size, and changed no computed style. Costs: the library compiles Foundation and ships `styles` (against ADR 0012's text), the consumer adds a configuration file (which turns off automatic Tailwind setup), the invariant list has to be measured again for each Foundation release, and the plugin needs a way to tell family sheets from the consumer's own. Without the filter, the invariant 25% reaches the page twice.
- **What loads lazily.** Under every Sass-level split, a directive can load only the invariant part with no consumer code. The setting-dependent part, about 79% of family bytes, stays with the consumer's build and needs 184's consumer carriers or the global stylesheet.
- **Cascade and `@layer`.** Inside a family, the theme sheet first and the structure sheet second (or `@layer nfs.<family>.theme, nfs.<family>.structure;` in 184's order statement) gave 0 computed-style differences from Foundation's single compile in Chromium for 56 button and 30 dropdown-menu elements. The reverse order gave 30 differences, and all 28 order candidates found by a static scan point the same way.
- **Open unknowns.** The perturbation covers all settings but cannot rule out a threshold it never crossed. The cascade is measured for two families in Chromium only. The filter has not run in a real Angular build. The `nfs-*` Library mixins have no code yet. Each Foundation release may change the invariant list. The page cost of two sheets per family (19% more gzip in one batch) is left to ticket 190.
