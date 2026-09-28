# Prototype: a static import check on documented APIs only

Ticket: [Prototype: a static import check on documented APIs only](../../../issues/149-prototype-documented-api-import-check.md). Findings, results table, costs, the Angular rules it reimplements, and the recommendation: [research/missing-directive-import-documented.md](../../../research/missing-directive-import-documented.md). Everything here is throwaway prototype code.

## What it is

`check/check.mjs` reports an element that carries a library directive's selector when the component's scope does not bring that directive in, using only:

- TypeScript's compiler API (`typescript` 6.0.3: `readConfigFile`, `parseJsonConfigFileContent`, `createProgram`, the type checker's `getSymbolAtLocation`, `getAliasedSymbol`, and `getExportsOfModule`, `resolveModuleName`, `getDecorators`) for the scope: each identifier in a standalone component's `imports` resolved to its class through renamed imports, path aliases, re-exports, and namespace imports; a workspace NgModule's `exports`; host directives of workspace directives, transitively, from object entries, and from base classes.
- Prettier's `angular-html-parser` 10.13.0 (`parse(input, { tokenizeAngularBlocks: true, tokenizeAngularLetDeclaration: true })`) for inline `template` and `templateUrl` templates.
- Its own selector parser and matcher over the library's manifest (`nfs-selectors.json`, the static prototype's format).

It imports nothing from `@angular/compiler` or `@angular/compiler-cli` and no private Angular symbol. A component whose scope it cannot resolve (a call, a spread, an array, `standalone: false`, a non-literal template) is skipped with an NFS9002 notice. `check/builder.mjs` runs it as an Architect builder with the static prototype's options (`buildTarget`, `tsConfig`); it fails on a finding and when no component was checked.

Beside the static prototype's library, cases, and generated workspace, it adds three stand-in directives (`lib/`: `NfsTooltip`, `NfsToggler` with a model input, the structural `NfsShowFor`) and fourteen in-scope cases (`tools/gen-scope-cases.mjs`): bound, `bind-`, two-way, structural, event, and interpolated attribute names, `@switch`, `ng-container`, `ng-template`, classes through a path alias (renamed too), a namespace import, a workspace NgModule, host directives through a chain, an object entry, and a base class, and a template-syntax case. `tools/classes-only.mjs` rewrites the generated workspace to classes only, the one import style ADR 0046 leaves.

## How to run

Scratch root `D:/tmp/nfs-149/` (not committed); copy this folder there. It reuses the static prototype's experiment `D:/tmp/nfs-145-static/` read-only: its `ngc` builds the stand-in library, and its compiler check (`ngtsc-check/check.mjs`) is the comparison. Node 24.18.0, npm 11.16.0, Windows 11 on arm64.

1. `npm install` (TypeScript 6.0.3, angular-html-parser 10.13.0, `@angular/core` and `@angular/common` 22.2.0 for the consumer workspace's types, Architect 0.2202.0 for the builder). Install first: npm prunes the hand-built packages below as extraneous.
2. From the static prototype: copy `lib/button`, `lib/accordion`, `lib/callout` into `lib/`; `tools/gen-cases.mjs`, `tools/gen-workspace.mjs`, `tools/run-builder.mjs` into `tools/`; `ws/tsconfig.json` into `ws/`.
3. `node tools/build-lib.mjs` -- ngc in partial mode into `node_modules/ngx-foundation-sites` (six entry points), then the manifest.
4. `node tools/gen-cases.mjs`, then `node tools/gen-scope-cases.mjs` (it adds class re-exports to `ws/src/libs/ui`).
5. `node tools/run-all.mjs` -- both checks on 240 and 1000 generated components, each in the static prototype's mixed import styles and in classes only; scores in `results/score-*.txt` (`tools/score.mjs`).
6. `node tools/gen-workspace.mjs 240 && node tools/classes-only.mjs`, then:
   - `node check/check.mjs ws/tsconfig.json --timing` (one run; `--json <file>` writes the results).
   - `node tools/bench.mjs 5` -- fresh-process medians of `tsc`, `ngc`, the compiler check, and this check.
   - Differential test: both checks with `--manifest tools/synthetic-manifest.json` (36 selectors no class implements, so every match is reported), then `node tools/diff-findings.mjs <documented.json> <ngtsc.json>`.
   - `node tools/run-builder.mjs` -- `shop:nfs-imports` from `ws/angular.json` through Architect's Node API, as `ng run` would.

No server was started; no port was used.

## What it showed

- On every in-scope case and on both generated workspaces, its findings equal the compiler check's element by element (file, line, column, directive) but one: 171 against 172 findings on 277 checked components, 507 against 508 on 1037; 106 of 106 and 442 of 442 expected reports in the generated components, none extra. It skipped, with a notice, the ten out-of-scope case components (arrays, `as const`, a function call, spreads in an NgModule's `exports`, `standalone: false`), and in the mixed-style workspaces the 144 and 600 generated components that import an array.
- The one difference: a `<button nfsButton>` inside `ngNonBindable`, which the compiler check reports and this check does not. Angular's runtime resolves no directive while bindings are disabled, so the compiler check's report is the false one there. The synthetic differential (11966 matched elements) added one more: `*ngIf="...; else other"` gives the template an `ngIfElse` attribute this check does not derive.
- Fresh-process medians at 287 and 1047 components: this check 798 and 1092 ms; the compiler check 1559 and 2948 ms; `ngc` 2058 and 3915 ms; `tsc` 660 and 1145 ms (`results/bench-*.txt`).
- `check/check.mjs` has 543 lines, 404 without blank and comment lines: selectors 59, template reading 92, scope 118, and imports, program, components, and output 135.

## Files

- `check/` -- `check.mjs` (CLI and `checkMissingImports()`), `builder.mjs`, `builders.json`, `schema.json`, `package.json`.
- `lib/` -- the three added stand-in directives and the six-entry-point `tsconfig.json`.
- `tools/` -- `build-lib.mjs`, `gen-scope-cases.mjs`, `classes-only.mjs`, `run-all.mjs`, `score.mjs`, `diff-findings.mjs`, `bench.mjs`, `synthetic-manifest.json`.
- `ws/angular.json` -- the consumer workspace, its `nfs-imports` target pointing at `../check:missing-imports`.
- `results/` -- scores for the four workspaces, benchmarks at 240 and 1000, the synthetic differential, and the builder run.
