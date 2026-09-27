# 135. Research: further typing and synchronisation options for Variant inputs

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

For [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md): which options has [Research: typed Variant inputs over open Sass maps](80-research-typed-variant-inputs-open-sass-maps.md) not considered for making a misspelt palette or size name fail to compile (the user's ideal), and for keeping the consumer's TypeScript declarations in step with its Sass settings? The user's current proposal is option A, consumer-side declaration merging of library-declared registry interfaces, with the consumer's `.d.ts` hand-written or generated from its Sass by an Nx generator (wrapped and exposed as an Angular CLI schematic) and kept in step by an Nx sync generator.

Constraints from the user (2026-09-27): a tsconfig `paths` remapping of a library type module is vetoed; anything that writes into or overwrites files in `node_modules` is vetoed under all circumstances; the library prefers directive composition over subclassing and never asks a consumer to extend a library class; no Foundation or NFS class name appears in consumer code, even as an input value (ADR 0039).

## How to work it

Two `/research` subagents in parallel, each writing one file and deciding nothing:

1. Synchronisation and tooling (`research/variant-typing-sync-tooling.md`, Opus 5.5): how Nx sync generators work in Nx 22 and 23 (registration, when they run, `nx sync` and `nx sync:check`, task-level `syncGenerators`, behaviour in CI, the daemon, and in a workspace with several applications), what an Angular CLI project without Nx can use instead (schematics, builders, `ng add`, npm lifecycle scripts, and whether `@angular/build` 22.2 offers any plugin or pre-build hook), how the Sass settings can be read reliably (the Sass JS API, custom functions, `sass:meta`, a compile that emits no CSS), and prior art for generating TypeScript from styles or tokens (typed CSS module generators, TypeScript language service plugins, Style Dictionary and the W3C design tokens format, Panda CSS codegen), including the reverse direction where a TypeScript or tokens file is the source and the Sass map is generated.
2. Typing alternatives (`research/variant-typing-alternatives.md`, Fable 5.1): Angular template type-checking mechanisms not yet weighed (generic directives whose type parameter is inferred from another input or from a composed host directive, input transforms with generic or overloaded types, `ngAcceptInputType`-style declarations, what `hostDirectives` does to input types), lint-time checks (an angular-eslint template rule that validates Variant values against a generated palette list) and Angular extended diagnostics, TypeScript 6.0 features that bear on it, and how other ecosystems type theme-extensible component props without the vetoed mechanisms (web components' element maps, Vue, Svelte, Lit, Stencil, Qwik, Solid, and Angular libraries); for each, measure with `ngc` 22.2 and strict templates where cheap, and compare it with option A plus the generator and sync generator.

Resolved when both files exist; the answer here summarises them for the judge of the decision.

## Answer

Resolved 2026-09-27; both files decide nothing.

- [research/variant-typing-alternatives.md](../research/variant-typing-alternatives.md) (Fable 5.1): ten typing options measured with `ngc` 22.2 strict templates. No provider affects a template type, wherever it is registered (`ApplicationConfig.providers`, a `StaticProvider` through `BootstrapContext.platformRef`); the compiler's template type check reads no injector. One consumer constant (`defineNfsTheme({...} as const)`) can drive both `provideNfsVariants(theme)` and the declaration-merging augmentation: typos fail with TS2820 and a suggestion, custom names complete, removal works through `false` members; without `as const` every name compiles silently, and an augmentation file that is not a module replaces the library's types. A consumer directive hosting the library directive through `hostDirectives` also fails typos, at the cost of one consumer directive per library directive. An angular-eslint rule or a stand-alone type-checker check fails literal values only; the user judged an ESLint plugin not worth its API surface and upkeep. Option A needs closed library defaults, explicit fallback annotations, a module augmentation file, and the file in every program.
- [research/variant-typing-sync-tooling.md](../research/variant-typing-sync-tooling.md) (Opus 5.5): an Nx task sync generator keeps the declaration file in step locally, but returns early in CI (measured: a stale file built with `CI=true`), so `nx sync:check` must be its own CI step; an executor with `--check` runs in CI; on the Angular CLI alone an Architect builder runs through npm `pre*` scripts but not under a bare `ng build` or `ng serve`, and the dev server picked up only the first change to a declaration file; esbuild code plugins cannot see the Sass compile; the reverse direction (TypeScript or design tokens as the source, the Sass map generated) works and moves staleness to the Sass side. NgRx 22.0.1's `runtimeChecks` force every check off in production, so a production opt-in is this library's own design: feature functions in the `provideRouter` pattern (`provideNfs(withRuntimeChecks(...), withProductionRuntimeChecks(...))`) keep the checker out of bundles that do not opt in (measured 87 B).
