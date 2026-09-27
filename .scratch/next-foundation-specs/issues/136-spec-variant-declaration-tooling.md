# 136. Spec: Variant declaration tooling

Type: grilling
Status: open
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

Graduated on 2026-09-27 from [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) and ADR 0040: what does the library ship so that a consumer's Variant declaration file is written from its Sass and kept in step with it, and so that the library's own Variant types stay extendable? Publish `specs/variant-declaration-tooling.md`, a shared-utility spec like the [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md). It owns:

- everything the primary entry point `ngx-foundation-sites` holds for Variant typing: the registries, `NfsOverridableStringUnion`, `NfsOverridableCount`, `NfsVariantBoolean` with `nfsVariantBoolean`, the Class breakpoint types, and the manifest of registries with their default names;
- the shared core, the setup generator exposed as a schematic, the Nx task sync generator, and the Architect builder, with their commands, options, and messages;
- the output format and its determinism;
- the `targetDefaults` and `angular.json` setup;
- the CI steps;
- the shared-library rule;
- the build assertion on the emitted typings.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides), then publish with `/to-spec` in the map's spec shape. Read first: the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) and ADR 0040; `research/typed-variant-inputs.md`, `research/variant-typing-alternatives.md`, and `research/variant-typing-sync-tooling.md`; ADR 0039; ADR 0005 and the Breakpoint service spec; `map.md` Notes (the user's rule that code generation ships as an Nx generator wrapped and exposed as an Angular CLI schematic, the veto on anything that writes into `node_modules`, and directive composition over subclassing). Its prototype questions are SYNC's unknowns 1 to 3 and 8: the dev server's stale diagnostics, Vitest and Storybook with the declaration file, the standalone compile against complex build configurations, and a measured e2e in which `CI=true nx build` against a stale file is caught by `nx sync:check`. It adds one spec to the map's Destination (52) unless the orchestrator carries it as part of an existing shared-utility spec; the judge recommends a separate spec, because no existing spec owns workspace tooling. Graduate a prototype ticket for them if the spec needs measured answers. Model: Opus 5.5.
