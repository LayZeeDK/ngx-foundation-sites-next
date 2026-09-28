# 149. Prototype: a static import check on documented APIs only

Type: prototype
Status: resolved
Blocked by: none
Labels: wayfinder:prototype
Map: ../map.md

## Question

The user chose on 2026-09-28 ([Prototype: detecting a forgotten attribute directive import](145-prototype-missing-directive-import-checks.md), its user ruling) to ship a static check for forgotten attribute directive imports built on documented APIs only, and to prototype it first. Can TypeScript's compiler API (scope), Prettier's `angular-html-parser` (templates), and the library's selector manifest match the compiler-based prototype's results on the same cases, within the scope the user set?

## How to work it

One Opus 5.5 agent. Build it under `prototypes/missing-directive-imports/documented/` and write `research/missing-directive-import-documented.md`. Reuse the static prototype's generated workspace, stand-in library, manifest, cases, and scoring (`prototypes/missing-directive-imports/static/`), and score both on the same inputs.

- In scope: identifiers written directly in a standalone component's `imports` literal, resolved to their classes through renamed imports, path aliases, and re-exports; inline `template` and `templateUrl` (also in another folder); markup in `@defer`, `@if`, `@for`, `@switch`, `ng-template`, `ng-container`, and projected content; static and bound attribute names (`[x]`, `bind-x`, `[(x)]`) and structural `*x`; the workspace's own directives that host a library directive through `hostDirectives`.
- Out of scope, by the user's ruling: `imports` built by a function call, `as const` arrays, NgModule-declared components, and third-party packaged directives that host a library directive. A component whose `imports` holds anything the check cannot resolve to a class is skipped with a one-line notice (the orchestrator's default, flagged to the user).
- Measure: detection and false positives against the compiler prototype on every in-scope case and the 240- and 1000-component workspaces; run time; lines of code; and every place the check reimplements an Angular rule (selector matching, template syntax, scope), with the source that defines each rule.
- Ship shape: an Architect builder and Nx target in the Variant tooling's collection (`specs/variant-declaration-tooling.md`), opt-in, run in CI. Say what the setup generator would add.

## Answer

One Opus 5.5 agent built and measured it on 2026-09-28: code in `prototypes/missing-directive-imports/documented/`, findings in [research/missing-directive-import-documented.md](../research/missing-directive-import-documented.md). The check uses TypeScript 6.0.3's public API for scope, `angular-html-parser` 10.13.0's documented `parse()` for templates, and its own selector matcher over the manifest; it imports nothing from `@angular/compiler` or `@angular/compiler-cli`. Both checks ran on the static prototype's library, cases, and workspaces, plus three stand-in directives, 14 more in-scope cases (bound, two-way, structural, event, and interpolated names, `@switch`, `ng-container`, aliased and namespace imports, a workspace NgModule, host directive chains and base classes, template syntax), and a classes-only form of each workspace.

- Detection: in scope, the same findings as the compiler check element by element (file, line, column, directive), 106 of 106 and 442 of 442 in the generated components with none extra, and every in-scope case exact. The one difference is a library attribute inside `ngNonBindable` content, which the compiler check reports and Angular's runtime never matches, so the documented check is the right one there. A differential run with 36 synthetic selectors over 11966 matched elements found one more divergence: the check does not derive secondary microsyntax keys such as `ngIfElse`.
- Out of scope: ten case components are skipped with a one-line NFS9002 notice, three of them holding a forgotten import the compiler check reports. In the mixed-style workspaces the notice also covers the 144 of 240 and 600 of 1000 components that import an array, so a consumer's own import arrays go unchecked.
- Cost: 798 and 1092 ms per fresh run at 287 and 1047 components, against 1559 and 2948 ms for the compiler check and 660 and 1145 ms for `tsc`; 404 lines against 129, copying twelve Angular rules, each listed with its Angular source; a new consumer dependency (`angular-html-parser`, MIT, 204 kB, no dependencies).
- Ship shape: the `ngx-foundation-sites:missing-imports` builder and an `nfs-imports` target per application, added by an opt-in setup generator in the same collection, which also adds `angular-html-parser` to `devDependencies`, a `spec` configuration for test components, and Nx caching inputs; no sync generator. The library's CI keeps the compiler check as an oracle, never shipped, to catch a copied rule that drifts.
- Recommendation: ship it as ADR 0046's static check. Open for the spec, and flagged to the user: whether to follow plain consumer `const` arrays (a few lines; the ruling excludes only `as const` arrays and calls, and the orchestrator's default skips every array), an ignore option, a manifest rule against secondary microsyntax keys in library selectors, and an attribute index if the manifest grows.

### Gist for the map

- [Prototype: a static import check on documented APIs only](issues/149-prototype-documented-api-import-check.md) -- TypeScript's compiler API, `angular-html-parser`, and a selector matcher of its own over the manifest give the compiler-based check's findings element by element on every in-scope case and on 240 and 1000 components (106 of 106, 442 of 442, none extra), in half or less of its run time (798 against 1559 ms, 1092 against 2948 ms), with no Angular API; the one difference, `ngNonBindable` content, is the compiler check's false report. Its costs are 404 lines copying twelve Angular rules, a new dependency, and skipped components with a notice for every array, a consumer's own included; the compiler check stays in the library's CI as the oracle for drift. Findings: [research/missing-directive-import-documented.md](research/missing-directive-import-documented.md).

### User ruling, 2026-09-28 (arrays)

Asked whether the check should follow array constants the consumer declares in its own workspace (the prototype skipped 144 of 240 and 600 of 1000 components in the mixed-style workspaces for importing one), the user chose no arrays: a component whose `imports` holds an array of any form, plain `const` included, is skipped with the NFS9002 notice. [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) records it.
