# Prototype: a static check for a forgotten attribute directive import

Ticket: [Prototype: detecting a forgotten attribute directive import](../../../issues/145-prototype-missing-directive-import-checks.md), the static half. Findings, results table, costs, and recommendation: [research/missing-directive-import-static.md](../../../research/missing-directive-import-static.md). Everything here is throwaway prototype code.

## What it is

Two checks over a consumer's templates that report an element carrying a library directive's attribute when the component's scope does not bring that directive in, both fed the same selector manifest (`nfs-selectors.json`, generated from the library source):

- (a) `eslint-plugin/` -- an ESLint rule on `@angular-eslint/template-parser`. It finds the owning component itself (the inline-template processor's virtual file name, or the `.ts` file beside an external template) and resolves the component's `imports` with TypeScript's parser alone.
- (b) `ngtsc-check/` -- a Node check over the Angular compiler's own program and `TemplateTypeChecker` (`getTemplate`, `getDirectivesOfNode`), with Angular's `SelectorMatcher`; `builder.mjs` runs it as an Architect builder whose `buildTarget` option supplies the `tsConfig`.

Stand-ins: `lib/` is a partial-compiled `ngx-foundation-sites` with `NfsButton` (`button[nfsButton], a[nfsButton]`), the Accordion family of four with `NFS_ACCORDION`, and `NfsCallout` with a `color` input.

## How to run

Scratch root `D:/tmp/nfs-145-static/` (not committed); copy this folder there. Node 24.18.0, npm 11.16.0, Windows 11 on arm64.

1. `npm install` (Angular 22.2.0, TypeScript 6.0.3, ESLint 10.11.0, angular-eslint 22.5.0, typescript-eslint 8.70.1, Architect 0.2202.0). Install first: npm prunes the two hand-built packages below as extraneous.
2. `node tools/build-lib.mjs` -- `ngc` in partial mode into `node_modules/ngx-foundation-sites`, then `tools/gen-manifest.mjs` writes `nfs-selectors.json` there.
3. `node tools/gen-cases.mjs` -- the ticket's cases into `ws/src/app/cases/` (each inline and external, plus seven harder cases in `hard/`, a path-aliased library `ws/src/libs/ui`, and a design-system package `node_modules/@acme/design-system`) with `expected.json`.
4. `node tools/gen-workspace.mjs 240` (or `1000`) -- generated components in `ws/src/app/generated/` with injected forgotten imports and their ground truth.
5. Checks: `node ngtsc-check/check.mjs ws/tsconfig.json --timing --json results-ngtsc.json`; `node eslint-plugin/run.mjs ws --json results-eslint.json`; `node tools/score.mjs results-ngtsc.json results-eslint.json`.
6. Costs: `node tools/bench.mjs 5`; `node eslint-plugin/single-file.mjs ws <file> ...` (editor-like, one ESLint instance); `node eslint-plugin/cache-staleness.mjs ws`; `NFS_UNRESOLVED=1 node eslint-plugin/run.mjs ws` (what the rule skips).
7. Builder: `node tools/run-builder.mjs` runs `shop:nfs-imports` from `ws/angular.json` through Architect's Node API, as `ng run` would.

No server was started; no port was used.

## What it showed

- Both checks report every forgotten member, whole family, and single directive, inline and external, inside `@defer`, `@if`, `@for`, an `ng-template` rendered by `NgTemplateOutlet`, and projected content, and nothing for the correctly imported cases or the consumer's own `nfs`-looking attributes: 141 of 141 expected reports with no extra one in the 273-component workspace, 477 of 477 in the 1033-component one (`results-240.txt`).
- On the seven harder cases (b) matched Angular in all seven; (a) matched in two, missed two (an `imports` built by a function call, a template in another folder) and reported four false positives (a component declared in an NgModule, a consumer directive that hosts `NfsButton`, and two from a design-system package that re-exports the directives).
- Median wall times, 273 and 1033 components: `ngc` type check 2228 and 5124 ms; (b) 1790 and 3655 ms; ESLint with parsers and processor only 1406 and 2736 ms, with the rule 1665 and 3426 ms. A warm single-file lint took 6 to 28 ms.
- ESLint's `--cache` kept a template's result after its component dropped `NfsButton` (0 reports cached, 1 uncached).
- An `as const` import array does not compile in an NgModule's `imports` or `exports` (TS2322, readonly tuple against `any[]`); a module must spread it.

## Files

- `lib/` -- stand-in library source and its `tsconfig.json`.
- `tools/` -- `build-lib.mjs`, `gen-manifest.mjs`, `gen-cases.mjs`, `gen-workspace.mjs`, `score.mjs`, `bench.mjs`, `run-builder.mjs`.
- `eslint-plugin/` -- `index.cjs`, `missing-directive-import.cjs` (the rule), `run.mjs`, `single-file.mjs`, `cache-staleness.mjs`.
- `ngtsc-check/` -- `check.mjs` (CLI and `checkMissingImports()`), `builder.mjs`, `builders.json`, `schema.json`, `package.json`.
- `ws/` -- the consumer workspace's `tsconfig.json`, `eslint.config.mjs`, and `angular.json` (the `build` target exists only for its `tsConfig`).
- `results-240.txt` -- the scorer's output for the 273-component run.
