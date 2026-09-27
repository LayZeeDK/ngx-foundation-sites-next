# 135. Research: further typing and synchronisation options for Variant inputs

Type: research
Status: claimed
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
