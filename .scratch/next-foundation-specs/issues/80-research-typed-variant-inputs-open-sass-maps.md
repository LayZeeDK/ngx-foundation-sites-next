# 80. Research: typed Variant inputs over open Sass maps

Type: research
Status: open
Blocked by: 79
Labels: wayfinder:research
Map: ../map.md

## Question

Under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010), which ways exist to type an Angular input whose values come from an open Sass map that the consumer extends (`$foundation-palette` colours, `$button-sizes`, `$breakpoints`, and every other Foundation setting whose keys become class names), and what does each cost? The user vetoed consumer-side TypeScript `namespace` or `module` augmentation (declaration merging with `declare module` or `declare namespace`): research it only to record why it is out, never as a candidate.

## How to work it

Resolve with a `/research` subagent (Opus 5.5). Inventory every Foundation Sass map and setting whose keys become Variant class names (with `file:line` in the 6.9.0 clone) and which of them a consumer can extend or shrink. Then survey typing approaches without declaration merging, with sources and measured facts where cheap to measure: a closed union of Foundation's defaults plus a `string` escape; a generic or branded string type; a typed provider or injection token the consumer calls with its names (`provideNfs...`) and what type inference it can give templates; generating a TypeScript file from the consumer's Sass settings (a Sass function, a build step, or an Angular builder) and the cost to the consumer's build; reading class availability at runtime (for example from CSS custom properties or computed styles) for a development-mode check; and how Angular Material, the CDK, `@angular/aria`, and other design-system libraries (Bootstrap and Bulma wrappers for Angular, MUI, Chakra, Radix Themes, Tailwind variant libraries) type theme-extensible props, noting which rely on declaration merging. For each: template type checking in strict mode, editor completion, SSR and hydration, bundle cost, what happens when TypeScript and Sass disagree, and the development-mode check it allows. Write `research/typed-variant-inputs.md` with the options, the evidence, and open unknowns; decide nothing.
