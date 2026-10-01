# 193. Prototype: esbuild plugins on Angular CLI through community builders

Type: prototype
Status: resolved
Blocked by: 192
Labels: wayfinder:prototype
Map: ../map.md

## Question

Can a plain Angular CLI workspace, without Nx's executor, run the library's esbuild plugin from proposal A of [Consult: new approaches to loading family styles](192-consult-fable-style-loading.md) through a community builder? Candidates: `@angular-builders/custom-esbuild`, `@analogjs/vite-plugin-angular`, and any other the research finds. And what extension point does each use: `buildApplication`'s `extensions`, which Angular marks as not supported, or something else?

## User question, 2026-10-01

> 9. Is there not a community plugin Angular CLI builder that supports ESBuild plugins, for example `@angular-builders/custom-esbuild` or `@analogjs/vite-plugin-angular`?

## How to work it

For each builder, record with sources:

- its version and maintenance status, and whether it supports Angular 22.2;
- how it passes plugins, with `file:line` in the installed package;
- `ng build`, `ng serve`, SSR, and prerendering support.

Then build proposal A with the strongest one in a fresh Angular CLI 22.2 workspace under `D:/tmp/nfs-proto-193`, and rerun 192's client-only `@defer` and 188's L1-L3 leave scenarios in Chromium, Firefox, and WebKit against a production SSR build. Capture the decisive files under `prototypes/community-esbuild-builders/`, and append an `## Answer`. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.

## Answer

Resolved 2026-10-01 (Opus 5.5). Prototype: [prototypes/community-esbuild-builders/README.md](../prototypes/community-esbuild-builders/README.md). The workspace is a fresh Angular CLI 22.2.0 SSR workspace at `D:/tmp/nfs-proto-193` (`@angular/build` 22.2.0), with the library built by ng-packagr and installed from a tarball into `node_modules`. It was measured against the production SSR build in Chromium, Firefox, and WebKit through Playwright 1.63.0. Nothing is decided here; 185 chooses.

- **Builders, from their packages.** `@angular-builders/custom-esbuild` 22.0.1 (accepts `@angular/build ^22.0.0`) is the only one with an `angular.json` `plugins` option for a plain CLI workspace. It calls `buildApplication(options, context, { codePlugins, indexHtmlTransformer })` (`dist/application/index.js:44-55`), and its `dev-server` calls `executeDevServerBuilder` with `buildPlugins` after patching the builder context (`dist/dev-server/index.js:61-67`, `patch-builder-context.js`). `@analogjs/vite-plugin-angular` 2.7.5 is not an esbuild host. Its CLI builders run Vite's own build from `vite.config` (`vite-build.impl.js:3`, `:19-31`), read only `mode` and `sourcemap` from the Angular target, use `@angular/build/private` for the compiler (`devkit.js:37`), and do SSR and prerendering through Nitro. `@ngx-env/builder` 22.0.0 uses the same `extensions` parameter for `indexHtmlTransformer` only. `@angular-architects/native-federation` 22.2.1 passes plugins through `buildApplication` and the private `serveWithVite`, with `plugins` only in its TypeScript type. `ngx-build-plus` 20.0.0 is webpack-only. `@nx/angular` has no `builders` field for the Angular CLI.
- **Extension point.** Every route that hosts esbuild plugins uses `buildApplication`'s `extensions` (or the dev server's equivalent), both marked NOT supported and `@experimental` (`@angular/build` `application/index.d.ts:16-30`, `dev-server/builder.d.ts:29-44`), or Angular's private build API. No supported extension point was found.
- **Measured with custom-esbuild, `ng build` with SSR and prerendering: pass in three engines.** Server and prerendered HTML carry one owned `<style>` per family, with the consumer's settings applied. Full and incremental hydration show 0 mutations and 0 unstyled frames. A client-only `@defer` shows 0 unstyled frames, local and with chunks delayed 300 ms. Enter animations were on time in 17 of 18 cases (Firefox, `@defer`, warm cache: 22 ms against a 20 ms threshold, as 192 saw). L1, L2, and L3 unload with 0 unstyled frames while leaving, and the style is removed in the frame the host leaves.
- **New: in a packaged library, all families' CSS share one lazy chunk.** The single FESM file puts all four families into `chunk-xN1--8eh.js` (21.6 kB raw, 3.6 kB transfer), fetched by any page using any directive, with or without Angular's chunk optimizer. `main.js` holds none. 192's per-family placement came from separate source modules.
- **New: `ng serve` fails with default prebundling.** `Cannot find module 'nfs-family-css:button'` comes from Vite's `deps_ssr/nfs-lib.js`, because prebundling runs without user plugins (`@angular/build` `tools/vite/utils.js:33-64`; just-jeb/angular-builders#1974 calls it out of scope). With `prebundle: { exclude: ['nfs-lib'] }` it works.
- **New: a settings edit under `ng serve` is not picked up.** Angular rebuilt with "No output file changes", and the page still read 44px after 65 s. Angular watches only metafile inputs and its own load cache (`bundler-context.js:207-229`), not plugin `watchFiles`. A production rebuild after the edit changes both the CSS and the hashed chunk name.
- **Open:** whether per-family secondary entry points restore per-family chunks; a watch fix for `ng serve`; Nx's dev server on the same prebundle path (inferred to fail the same way); Analog, which was not built; CSS optimiser parity.
