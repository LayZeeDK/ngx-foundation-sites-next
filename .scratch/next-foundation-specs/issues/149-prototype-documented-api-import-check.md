# 149. Prototype: a static import check on documented APIs only

Type: prototype
Status: open
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
