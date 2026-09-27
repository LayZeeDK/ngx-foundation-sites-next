# 137. Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces

Type: prototype
Status: open
Blocked by: 136
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-27 from [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md) (its "Prototype needed"). Build the shared core, the setup generator and schematic, the sync generator, and the Architect builder as [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md) describes, over a stand-in package with the spec's primary-entry-point types, a few registries, their Library mixins, and one directive per shape; pack it; and measure in scratch workspaces (Nx 23.2.1 with `@nx/angular` 23.2.1, and Angular CLI 22.2.0):

1. SYNC unknown 1: after the declaration file changes during `ng serve` and `nx serve`, which rewrites the dev server re-checks, why only the first, and whether a `/// <reference path>` from the application's entry file, a `files` entry, or anything else makes every rewrite reach the template diagnostics. Verdict: the spec's restart note stands, or the setup generator adds the fix.
2. SYNC unknown 2: whether `@angular/build:unit-test` and `@nx/angular:unit-test` (Vitest, browser mode and jsdom) and `@storybook/angular-vite` (`storybook dev`, `storybook build`, the `@storybook/addon-vitest` run, and the docgen controls of a Variant input) see the declaration file: a declared name compiles or appears, and a program without the file fails closed.
3. SYNC unknown 3: whether the core's compile reproduces the application builder's for `@import 'ngx-foundation-sites'` through the package's `sass` export condition, `pkg:` URLs, a `~` prefix, `includePaths`, several global stylesheets, an `inject: false` entry, and a configuration that overrides `styles`, comparing the properties the core reads with those in the built `styles.css` in each case.
4. The e2e the typing decision's residual risk (b) asks for: commit an in-step file, remove `warning` from the Sass, show `CI=true nx build` passing against the stale file, `nx sync:check` exiting 1 with the spec's detail line, `nx sync` rewriting the file, and the next build failing with TS2322 on `color="warning"`.
5. That per-project `"syncGenerators": ["...", "ngx-foundation-sites:variant-types-sync"]` keeps a workspace's `targetDefaults.build` (`dependsOn: ['^build']`) and an executor-keyed `targetDefaults` entry, while an executor-keyed entry added for the sync generator would drop the name-keyed defaults (`nx show project --json`).
6. That `convertNxGenerator` runs the setup generator in a plain Angular CLI workspace (targets in `angular.json`, the file, the npm scripts), that `ng run <app>:nfs-variants:check` runs without `nx` installed, and that Nx runs the same builder as an Angular-compatible builder (`nx run <app>:nfs-variants:check`).

## How to work it

Run AFK under the map's AFK override with `/mattpocock-skills:prototype` on Opus 5.5 (question 1 needs a root cause, not only a measurement), in scratch workspaces under `D:/tmp/`, never writing into any `node_modules` the prototype did not create. Captured under `prototypes/variant-declaration-tooling/` with a README (question, how to run, verdict). A failed case graduates a re-run of this spec, or a text correction the prototype's triage decides. The [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) waits on this ticket.
