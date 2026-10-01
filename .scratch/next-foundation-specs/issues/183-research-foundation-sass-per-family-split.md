# 183. Research: splitting Foundation 6.9's CSS per family

Type: research
Status: open
Blocked by:
Labels: wayfinder:research
Map: ../map.md

## Question

Can Foundation 6.9's CSS be compiled one first-milestone family at a time, with the consumer's settings, so that each family's styles can load on their own? Which families cannot be split, because they style elements by tag, depend on another family's rules, or depend on source order?

## How to work it

Resolve with a `/research` subagent against `d:/projects/github/foundation/foundation-sites` (6.9.0) and Dart Sass 1.104.1 (the version `@angular/build` 22.2.0 pins), compiling fixtures under the session scratchpad. For each Foundation export mixin used by a first-milestone spec (`specs/*.md` without `Milestone: later`; their Sass subsections name the mixins), with `file:line`:

1. Compile `settings + foundation (util only) + @include foundation-<x>` alone. Does it compile, what does it emit, and how large is it, minified and gzipped?
2. Which rules of other families it needs or overrides (for example `.button-group .button` over `.button`, the menu-based families, `.dropdown.menu`), and which of its selectors depend on being emitted after another family's selectors to win at equal specificity.
3. Whether it emits element or attribute selectors that apply without a library directive (Forms' `[type='text']`, `select`, `label`; `foundation-global-styles`; `foundation-typography-base`). Rules like these cannot follow a directive's lifecycle.
4. What `foundation-everything` emits once and that per-family compiles would emit again (resets, `foundation-mq` meta rules, keyframes, Motion UI classes), and what the duplication costs.
5. Whether the library's own Library mixins (ADR 0012; each spec's Sass subsection) can be compiled the same way, beside their export mixin.

Write `research/foundation-sass-per-family.md` with a table, one row per export mixin, plus the evidence and the open unknowns. Decide nothing.
