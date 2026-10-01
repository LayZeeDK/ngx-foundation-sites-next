# Prototype: esbuild plugins on Angular CLI through community builders

Ticket: [Prototype: esbuild plugins on Angular CLI through community builders](../../issues/193-prototype-community-esbuild-builders.md).
Builds on [research/style-loading-consult.md](../../research/style-loading-consult.md) (proposal A, section 2.1), ticket 192's orchestrator note, and [prototypes/unload-after-leave/README.md](../unload-after-leave/README.md) (188's L1-L3).

PROTOTYPE, throwaway. The workspace is `D:/tmp/nfs-proto-193` and is not committed; this folder keeps the files that decide the result.

## Question

Can a plain Angular CLI workspace, without Nx's executor, run the library's esbuild plugin from proposal A through a community builder? Which builders exist, which extension point does each use (`buildApplication`'s `extensions`, which Angular marks as not supported, or something else), and do `ng build`, `ng serve`, SSR, and prerendering work?

## Builders researched

Versions from `registry.npmjs.org` on 2026-10-01. Packages were unpacked with `npm pack` under `D:/tmp/nfs-proto-193-pkgs`; `file:line` is in the published package. `BUILD/` is `@angular/build` 22.2.0 in `D:/tmp/nfs-proto-193/node_modules`.

What Angular says about the extension point: `buildApplication(options, context, extensions)` is `@experimental`, and "Usage of the `extensions` parameter is NOT supported and may cause unexpected build output or build failures" (`BUILD/src/builders/application/index.d.ts:16-30`). The dev server's `execute(options, context, extensions)` carries the same warning for `buildPlugins`, `middleware`, and `indexHtmlTransformer` (`BUILD/src/builders/dev-server/builder.d.ts:29-44`). Both functions are exported from `BUILD/src/index.d.ts:8-13`.

| Builder | Latest, status | Angular 22.2 | How it passes plugins | `ng build` | `ng serve` | SSR | Prerender |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `@angular-builders/custom-esbuild` | 22.0.1 (2026-06-23), `next` 22.0.2-beta.1 (2026-08-30). Repo `just-jeb/angular-builders`, last push 2026-09-19, not archived | yes: depends on `@angular/build ^22.0.0` and `@angular-devkit/architect >=0.2200.0 <0.2300.0`; **measured** on 22.2.0 | `buildApplication(options, context, { codePlugins, indexHtmlTransformer })` (`dist/application/index.js:44-55`), so the unsupported `extensions` parameter. Plugins come from `angular.json` `plugins: [path | { path, options }]`, loaded with jiti (`@angular-builders/common/dist/load-module.js:137-143`) and called as `factory(builderOptions, target)` or `factory(options, builderOptions, target)` (`dist/load-plugins.js:39-52`) | **measured: pass** | its `dev-server` passes the same plugins as `buildPlugins` to `executeDevServerBuilder` (`dist/dev-server/index.js:61-67`) and patches `context.getBuilderNameForTarget` and `getTargetOptions` so Angular takes the Vite path (`dist/dev-server/patch-builder-context.js:4-35`). **Measured: fails with default prebundling; works with `prebundle.exclude`; a settings edit is not picked up** (below) | **measured: pass**, the plugin runs in the server bundle too | **measured: pass** |
| `@analogjs/vite-plugin-angular` (with `@analogjs/platform`) | 2.7.5 (2026-09-25), beta 2.8.0-beta.16, alpha 3.0.0-alpha.90 | yes by its peer range (`@angular/build ^18.0.0 \|\| ... \|\| ^22.0.0`); not measured | Not an esbuild host. Its Angular CLI builders `:vite` and `:vite-dev-server` (`src/lib/tools/builders.json`) replace Angular's application builder with Vite: `createBuilder(buildConfig).buildApp()` reading `vite.config` (`src/lib/tools/src/builders/vite/vite-build.impl.js:3`, `:19-31`). From the Angular build target they read only `mode` and `sourcemap` (`:10-27`), so `styles`, `stylePreprocessorOptions`, budgets, and `outputMode` are not used. Plugins are Vite/Rolldown plugins in `vite.config` (public Vite API). The Angular compiler comes from `@angular/build/private` (`src/lib/utils/devkit.js:37`) | Vite build, not Angular's | Vite dev server | through `@analogjs/platform` and Nitro (`analogjs-platform/src/lib/options.d.ts:59-72`), not Angular's `outputMode: server` and `AngularNodeAppEngine` | through Nitro's `prerender` option (same file) |
| `@ngx-env/builder` | 22.0.0 (2026-08-13) | yes (`@angular/build ^22.0.0`) | same `buildApplication` `extensions` parameter, but only `indexHtmlTransformer`, plus `options.define` (`dist/builders/application/index.js:22-26`). No plugin option | n/a for plugins | n/a | n/a | n/a |
| `@angular-architects/native-federation` (found by search) | 22.2.1 (2026-09-25) | yes (`@angular/build ~22.2.0`) | `codePlugins` through `buildApplication` (`src/builders/build/builder.js:333-340`) and `buildPlugins` through `serveWithVite` from `@angular/build/private` (`:8`, `:324-331`). A `plugins?: Plugin[]` option exists only in the TypeScript type (`src/builders/build/schema.d.ts:29`), not in `schema.json`, so `angular.json` cannot set it. A module federation tool | not for plugins | | | |
| `ngx-build-plus` | 20.0.0 (2025-06-02) | no: peer `@angular-devkit/build-angular >=20`, webpack builders only (`builders.json`: `browser`, `dev-server`, `server`, `extract-i18n`, `karma`) | webpack config, no esbuild | | | | |
| `@nx/angular:application` (context, from 192) | 23.2.1 | yes | `buildApplication(..., { codePlugins: plugins })` (192's orchestrator note). `package.json` has `executors` and no `builders` field (`package.json:66`), so the Angular CLI cannot load it from `angular.json` without Nx | | | | |

So every builder that hosts esbuild plugins does it through `buildApplication`'s `extensions` (custom-esbuild, Nx) or through Angular's private build API (native federation's dev path). Analog avoids esbuild plugins by replacing the bundler with Vite, and depends on Angular's private compilation API instead. custom-esbuild is the only one with a `plugins` option in `angular.json` for a plain CLI workspace, so it was built.

## What was built

`D:/tmp/nfs-proto-193`: `ng new` from `@angular/cli` 22.2.0 with `--ssr --style=scss` (`@angular/build` 22.2.0, `@angular/core` 22.2.1, zoneless by default), `@angular-builders/custom-esbuild` 22.0.1, Sass 1.104.1, Foundation 6.9.0, Playwright 1.63.0, on Windows 11 arm64.

Unlike 192's probe, the library is a real package. `ng generate library nfs-lib` was built with ng-packagr, packed with `npm pack`, and installed from the tarball, so it sits in `node_modules/nfs-lib` as a copied directory, and the root `tsconfig.json` path mapping to `dist/` was removed. The package ships:

- `fesm2022/nfs-lib.mjs`, compiled from [workspace/projects/nfs-lib/src/lib/directives.ts](workspace/projects/nfs-lib/src/lib/directives.ts) and [family-styles.ts](workspace/projects/nfs-lib/src/lib/family-styles.ts). ng-packagr keeps `import calloutCss from "nfs-family-css:callout"` as an external import. Each directive passes its CSS in its constructor, with no module-level registration (192 registered at module evaluation). The runtime is 192's plugin path of `link-styles.ts`: an owned `<style data-nfs-family>` inserted in the same task as the first host, server adoption, server-held hosts, and 188's host timing.
- `esbuild/nfs-family-css.mjs` ([copy](workspace/projects/nfs-lib/esbuild/nfs-family-css.mjs)), 192's plugin, resolving `scss/` next to itself.
- `scss/*.scss`, 192's family files (`assets` in [ng-package.json](workspace/projects/nfs-lib/ng-package.json)).

The consumer writes the settings file and the `angular.json` changes in [tools/configure-angular-json.mjs](workspace/tools/configure-angular-json.mjs), with the result in [workspace/angular.json](workspace/angular.json). The build builder becomes `@angular-builders/custom-esbuild:application` with `plugins: [{ path: 'node_modules/nfs-lib/esbuild/nfs-family-css.mjs', options: { includePaths: ['src/foundation-settings'] } }]`. The library's `global.scss` goes first in `styles`, `stylePreprocessorOptions.includePaths` points at the settings directory, and the serve builder becomes `@angular-builders/custom-esbuild:dev-server`. There is no consumer TypeScript beyond the pages. The pages are 192's (`/ssr`, `/client-defer`, `/enter`, `/lifecycle`, `/hydrate-defer`) behind lazy routes, plus `/prerendered`, which is the `/ssr` page with `RenderMode.Prerender`. `src/server.ts` has 189's `nfs-delay-js` cookie delay for `chunk-*.js` ([copy](workspace/src/server.ts)).

## How to run

```
cd D:/tmp/nfs-proto-193
npx ng build nfs-lib && (cd dist/nfs-lib && npm pack --pack-destination ../..) && npm i ./nfs-lib-0.0.1.tgz
NFS_PLUGIN_LOG=1 npx ng build                       # production, SSR, one prerendered route
NG_ALLOWED_HOSTS=localhost,127.0.0.1 PORT=4731 node dist/nfs-proto-193/server/server.mjs &
BASE=http://localhost:4731 node measure/measure-193.mjs chromium   # also firefox, webkit; about 3 minutes each
node measure/summarize-193.mjs
NG_ALLOWED_HOSTS=localhost,127.0.0.1 npx ng serve --port 4732                          # default prebundling
BASE=http://localhost:4732 node measure/serve-check.mjs
NG_ALLOWED_HOSTS=localhost,127.0.0.1 npx ng serve --port 4733 -c development-exclude   # prebundle.exclude: ['nfs-lib']
BASE=http://localhost:4733 node measure/serve-check.mjs --edit
```

[measure/measure-193.mjs](measure/measure-193.mjs) combines 192's probe (SSR, client-only `@defer` local and with a 300 ms chunk delay, six enter cases), 189's settings read and `/hydrate-defer`, and 188's L1-L3 with two add/remove rechecks each. It also runs the SSR checks on the prerendered route. [measure/serve-check.mjs](measure/serve-check.mjs) loads `/ssr` and `/client-defer` from the dev server. With `--edit` it changes `$callout-sizes` default from 2.75rem to 3.5rem, polls for 30 s, and restores the file.

## Results

Raw output: [results/](results/) (`measure-193-<engine>.json`, `summary.txt`, the `serve-*` files, `build-plugin-compiles.txt`). "Styled" means the callout's `padding-top` is 44px, the consumer's setting; Foundation's default is 16px.

### Production SSR build, three engines

The three engines agreed on everything except one timing value.

| Scenario | Chromium / Firefox / WebKit |
| --- | --- |
| `/ssr` server HTML | one `<style data-nfs-family>` per family (button, menu, dropdown-menu, callout); all six consumer settings match 189's values |
| Full hydration | 0 unstyled frames of 50 / 50 / 45; 0 `<style>`/`<link>` mutations after `DOMContentLoaded`; one element per family |
| Incremental hydration (`hydrate on interaction` on `/ssr`; `on interaction` and `on viewport` on `/hydrate-defer`) | hydrated; 0 mutations; 0 unstyled frames of 157 / 159 / 146 on `/hydrate-defer` |
| After the last callout on `/ssr` | the callout `<style>` is removed; a new plain `div.callout` computes 0px |
| `/prerendered` (`RenderMode.Prerender`, served from `browser/prerendered/index.html`) | same as `/ssr`: four owned `<style>` elements in the file, 0 unstyled frames of 56 / 54 / 41, 0 mutations, unload works. Beasties' inlined `<style>` holds only the global layer, no family rule |
| Client-only `@defer`, chunk local | **0 unstyled frames** of 59 / 60 / 59; the first three frames read 44px |
| Client-only `@defer`, chunks delayed 300 ms | **0 unstyled frames** of 41 / 45 / 30 |
| Enter animations, 6 cases per engine (click and `@defer`; cold local, cold 300 ms, warm) | on time in 17 of 18, 0 unstyled frames in all 18. Firefox `@defer` warm started at 22 ms, past the harness's 20 ms threshold, so it reads "late". 192 measured the same case at 24 ms, and the cold cases here start at 0-16 ms, so this is timing noise, not a skip |
| L1, callout inside an element leaving for 600 ms | 0 unstyled frames of 39 / 43 / 48 during the 650 / 695 / 811 ms leave; `<style>` removed in the same frame the host left; rechecks `44px/0 44px/0` |
| L2, last callout destroyed while an unrelated leave runs | unloaded; rechecks pass |
| L3, an `(animate.leave)` listener element on the page | unloaded while the listener element is present and after it leaves; rechecks pass |

These match 192's numbers on Nx and 188's `own-style` row.

### Build facts

- The plugin compiled each family once per platform, browser and server: 8 compiles for 4 families ([results/build-plugin-compiles.txt](results/build-plugin-compiles.txt)). The production build took 13.9 s.
- **All four families' CSS land in one shared lazy chunk** (`chunk-xN1--8eh.js`, 21.6 kB raw, 3.6 kB estimated transfer), not one chunk per family. Any page or `@defer` block that uses any directive fetches it (`/client-defer` fetched `chunk-DExGr4fy.js` and this chunk). `main.js` holds no family rule. The same placement came out with Angular's Rolldown chunk optimizer turned off (`NG_BUILD_OPTIMIZE_CHUNKS=0`; the pass runs at 3 or more lazy chunks, `BUILD/src/builders/application/execute-build.js:171-182`), in the server bundle too. The package's one FESM file is a single module, and its four CSS imports travel with it. In 192 each directive was its own source module in the app, which gave per-family placement.
- A settings edit followed by `ng build` changed the CSS (3.5rem in the chunk) and the chunk's hashed name (`xN1--8eh` to `C634ePaO`), and the importers' names with it.
- The plugin's CSS bypasses Angular's stylesheet optimiser: the callout rule still reads `background-color:hsl(...)`, as 192 noted.

### `ng serve` (custom-esbuild `dev-server`, development configuration)

- **Default prebundling: fails.** The SSR render throws `Cannot find module 'nfs-family-css:button' imported from '.../.angular/cache/22.2.0/nfs-proto-193/vite/deps_ssr/nfs-lib.js'` ([results/serve-prebundle-error.txt](results/serve-prebundle-error.txt)). `/ssr` and `/client-defer` render nothing, with two 404s in the browser. The cause: Vite prebundles `node_modules` packages in its own Rolldown run, whose only plugin is Angular's (`BUILD/src/tools/vite/utils.js:33-64`), so the library's import never reaches the esbuild plugin. The custom-esbuild maintainer called this out of scope in [just-jeb/angular-builders#1974](https://github.com/just-jeb/angular-builders/issues/1974) (closed 2026-01-14), with `prebundle: false` as the workaround. 192's probe never saw it because its directives were app source.
- **`prebundle: { exclude: ['nfs-lib'] }`: works.** The server HTML has the four `<style>` elements, `/ssr` reads 44px and the consumer's button colour, `/client-defer` inserts the callout `<style>`, and there are no console errors ([results/serve-exclude.json](results/serve-exclude.json)).
- **A settings edit is not picked up.** Angular saw the change and rebuilt in 1.2 s, reporting "No output file changes", and the page still read 44px 65 s later ([results/serve-exclude-rebuild.txt](results/serve-exclude-rebuild.txt)). The plugin returns `watchFiles`, but Angular's bundler context invalidates the code bundle only for files in the esbuild metafile inputs and in its own load cache (`BUILD/src/tools/esbuild/bundler-context.js:207-229`, `:380-445`). The plugin's virtual module `nfs-family-css:<family>` is neither, so the settings file is watched only through the global stylesheet. A dev-server restart is needed (inferred; not run).
- From source, not measured: under `ng serve` a plugin factory gets the dev-server options as `builderOptions`, not the build options (`dist/dev-server/index.js:61`). So a plugin that read `stylePreprocessorOptions.includePaths` from its second argument would miss the consumer's settings in development. The plugin here takes `includePaths` in its own `options`, which costs the consumer a second copy of the path.

## Verdict

Yes, with costs. On a plain Angular CLI 22.2 workspace, `@angular-builders/custom-esbuild` 22.0.1 runs proposal A's plugin for `ng build`, SSR, full and incremental hydration, and prerendering. It reproduces 192's results in three engines: 0 unstyled frames on a client-only `@defer` at 300 ms, enter animations on time, and L1-L3 passing. It does not remove the risk in 192's orchestrator note; it moves it. custom-esbuild calls the same `buildApplication` `extensions` parameter that Angular marks NOT supported (and the dev server's equivalent), so the consumer depends on that parameter plus a third-party builder that patches the builder context. No researched builder offers a supported extension point. Analog's way round it is a different bundler built on Angular's private API. Two findings are new for proposal A as a shipped package and apply on Nx as well (inferred, same `buildApplication` path): `ng serve` needs the library excluded from prebundling, and a settings edit needs a restart. Separately, one FESM file puts every family's CSS into one shared lazy chunk. Nothing is decided; ticket 185 chooses.

## Open unknowns

- Per-family chunks from a package: whether one secondary entry point per family (`nfs-lib/callout`) restores 192's per-family placement. Smallest test: two entry points in ng-packagr, rebuild, and `rg` the chunks.
- A settings-edit fix under `ng serve`: whether a plugin can make Angular watch the Sass inputs (for example by resolving to a real file path), or whether only a restart works.
- `ng serve` with `prebundle: false` instead of `exclude`, and the cost in rebuild time.
- Nx: whether `@nx/angular:dev-server` hits the same prebundle failure for a library in `node_modules` (inferred yes, same Vite path).
- custom-esbuild's own tests cover no SSR application: its example `angular.json` has `plugins` and no `server` or `outputMode` (`examples/custom-esbuild/sanity-esbuild-app/angular.json`, read through the GitHub API). SSR worked here, but upstream does not check it (inferred).
- Analog was not built: porting the plugin to Vite's `resolveId`/`load` hooks, and whether Nitro SSR keeps the owned `<style>` adoption, were not tried.
- CSS optimiser parity (`esbuild.transform` with `minify` in the plugin), and the Sass compile cost at 35 families, as in 192.
