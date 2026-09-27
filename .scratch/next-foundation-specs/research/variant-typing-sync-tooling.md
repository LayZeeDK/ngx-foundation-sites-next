# Variant typing: synchronisation and tooling

Ticket: [Research: further typing and synchronisation options for Variant inputs](../issues/135-research-further-variant-typing-options.md), item 1, for [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md). Model: Opus 5.5. The typing mechanisms themselves are the other half of the ticket ([variant-typing-alternatives.md](variant-typing-alternatives.md)); the options already researched (O1 to O10) are in [typed-variant-inputs.md](typed-variant-inputs.md) (cited as "D" with its section) and are not repeated.

This file decides nothing. It lists how a consumer's TypeScript declarations can be kept in step with its Sass settings, what each mechanism does when measured, what it costs a consumer on Nx and on the Angular CLI alone, how it fails, and what is still unknown.

Sources and path prefixes:

- `NX/` = `d:/projects/github/nrwl/nx` read at tag `23.2.1` with `git show 23.2.1:<path>` (the working tree is on another branch and was not checked out). 23.2.1 is the version the map targets (`map.md:26`).
- `NX22/` = this repository's `node_modules/nx`, version 22.3.1 (read only).
- `NG/` = `d:/projects/github/angular/angular`, branch 22.2.x.
- `BUILD/` = `@angular/build` 22.2.0 as installed in `EXP/node_modules/@angular/build`. The `angular/angular-cli` clone is on 22.0.x with no 22.2 branch fetched, so the published 22.2.0 files were read instead.
- `NGRX/` = `d:/projects/github/ngrx/platform` read at tag `22.0.1` (`@ngrx/store` 22.0.1 is the npm `latest` on 2026-09-27, `https://registry.npmjs.org/@ngrx/store`).
- `FDN/` = Foundation for Sites 6.9.0, `d:/projects/github/foundation/foundation-sites`.
- `EXP/` = `D:/tmp/nfs-research-135-sync`, a throwaway workspace (not committed; no junction, a fresh `npm install`): nx and @nx/devkit 23.2.1, @angular/build, cli, compiler-cli, core, common, platform-browser 22.2.0, TypeScript 6.0.3, sass 1.104.1, style-dictionary 5.5.5, esbuild 0.28.2 (the version `BUILD/package.json:34` pins), Node 24.18.0, npm 11.16.0, Windows 11 on arm64. Nx 23.2.1 installed cleanly; npm 11 skipped its `postinstall` (an `allow-scripts` warning) and every command still ran.

## 1. The probe

A stand-in library, `EXP/fake-nfs-src`, compiled with `ngc` in partial mode into `EXP/node_modules/fake-nfs` (a package folder inside the experiment's own `node_modules`), carries what the tooling needs:

- a directive `NfsButton` with `color = input<NfsButtonColor>()` (`EXP/fake-nfs-src/src/index.ts:24`), typed from a registry the consumer augments: `export interface NfsButtonColorOverrides {}` (`:11`) and `NfsButtonColor = TrueKeys<Overwrite<Record<NfsDefaultButtonColor, true>, NfsButtonColorOverrides>>` (`:17`), so `name: true` adds a name and `name: false` removes a default. This is option A's shape with the removal form MUI's `OverridableStringUnion` uses (D section 5); the registry's final shape belongs to the typing half;
- an `_index.scss` whose `nfs-button` mixin writes `--nfs-button-palette: #{map-keys($button-palette)}` on `:root`, imported after Foundation as ADR 0012 has it (`adr/0012-sass-packaging.md:7`);
- one shared implementation, `tooling/core.cjs`, that compiles an application's global stylesheet with the Sass JS API and the application's `includePaths` (`:30-36`), reads every `--nfs-<setting>` list from the CSS (`:39`), and renders `src/nfs-variants.d.ts` (`:20`), listing added names as `true` and removed defaults as `false` (`:66-69`) against the default names the library ships in the same version (`:11-18`);
- three thin entry points over it, declared in the package's own `package.json` (`generators`, `executors`, `builders`, `EXP/fake-nfs-src/package.json:15-17`): an Nx sync generator (`tooling/variants-sync.cjs`), an Nx executor with a check mode (`tooling/variants-executor.cjs`), and an Angular CLI Architect builder with a check mode (`tooling/variants-builder.cjs`).

The generated file, as written by `nx sync` for an application whose palette adds `purple` and drops `warning`:

```ts
// Generated from apps/app1/src/styles.scss by fake-nfs. Do not edit: run `nx sync` or `ng run <app>:nfs-variants`.
import 'fake-nfs';

declare module 'fake-nfs' {
  interface NfsButtonColorOverrides {
    purple: true;
    warning: false;
  }
}
```

Two workspaces consume it:

- `EXP/nx-ws`: an Nx 23.2.1 workspace (a scratch git repository) with `app1` (palette plus `purple`, later minus `warning`), `app2` (palette plus `teal`), and a library `ui` whose component uses `color="purple"` and which both applications import. Each application's `build` target runs `@angular/build:application` 22.2.0 directly through Nx, with `styles: ["apps/<app>/src/styles.scss"]` and `stylePreprocessorOptions.includePaths` pointing at Foundation's `scss/`.
- `EXP/cli-ws`: an Angular CLI workspace (`angular.json`, no Nx) with one application, `cli-app`, a `serve` target on port 4880 or 4881, and an `nfs-variants` target using the library's builder.

The strict template check reached the augmentation in every build below: after the sync removed `warning`, `nx build app1` failed with `TS2322: Type '"warning"' is not assignable to type 'NfsButtonColor | undefined'` at `<button nfsButton color="warning">`, and `purple` compiled.

## 2. Options at a glance

| # | Mechanism | Can a misspelt name fail to compile? | Runs by itself before a build | In CI | Measured |
| --- | --- | --- | --- | --- | --- |
| T1 | Hand-written declaration file, no tooling | yes, for the names in the file | n/a | only if a check runs | yes (section 1) |
| T2 | Nx task sync generator on `build`/`serve`/`test` | yes, the file it keeps in step types the input | yes, locally, with a prompt or `sync.applyChanges: true` | skipped by every task; `nx sync:check` must run | yes (section 4) |
| T3 | Nx global sync generator | yes, after `nx sync` | no | `nx sync:check` | source only (section 4.1) |
| T4 | Nx executor in the build's `dependsOn`, or as a check target | yes | yes, as a task, CI included | yes (a task), `--check` for drift | check mode yes (section 4.5) |
| T5 | Angular CLI Architect builder `ng run <app>:nfs-variants` plus npm `pre*` scripts | yes, once run | only under `npm run build`/`npm start`/`npm test`, never under a bare `ng build` | `ng run <app>:nfs-variants:check` | yes (section 5) |
| T6 | A watcher beside `ng serve` | rewrites the file, but the dev server did not re-check templates after its first rewrite | during serve | n/a | yes (section 5.4) |
| T7 | An esbuild plugin through `buildApplication` extensions or `@nx/angular:application` `plugins` | no path found: code plugins never see the Sass compile and their `onStart` runs concurrently with the compiler's | would | would | source only (section 5.3) |
| T8 | Reverse direction: TypeScript source, types derived with `keyof typeof`, Sass map generated | yes, and the TypeScript side cannot go stale | the Sass side needs a generator | a check on the generated `.scss` | yes (section 6.2) |
| T9 | Reverse direction: DTCG tokens file, Style Dictionary writes the Sass map and the declaration file | yes | needs a step | `git diff --exit-code` after regenerating | yes (section 6.1) |
| T10 | TypeScript language service plugin | no: editor only, never loaded by `tsc` | n/a | n/a | sources (section 7) |
| T11 | Development-mode runtime check, on by default with a per-check opt-out | no (browser warning) | n/a | through e2e or story tests only | stand-in (section 8) |
| T12 | Production-mode runtime check, opt-in | no (report at runtime) | n/a | n/a | bundle cost measured (section 8.3) |
| T13 | CI drift checks: `nx sync:check`, builder or executor `--check`, `git diff --exit-code`, a check of the built CSS | no by themselves; they fail CI when the file and the Sass disagree | n/a | yes | yes (sections 4, 5, 8.4) |

## 3. Reading the consumer's Sass settings

`@angular/build` 22.2.0 exposes no hook inside its own Sass compile. The application schema's `stylePreprocessorOptions` holds only `includePaths` and, under `sass`, `fatalDeprecations`, `silenceDeprecations`, and `futureDeprecations` (`BUILD/src/builders/application/schema.json:162-197`), and the schema has no `plugins` property (searched with `rg`). So every reader runs its own compile, or reads a file.

| Reader | How | Measured (`EXP/tools/read-methods.cjs`, warm, one process) | Needs |
| --- | --- | --- | --- |
| R1 | Compile the application's global stylesheet with the Sass JS API and the project's `includePaths`, then read the `--nfs-<setting>` lists from the CSS | 220 ms warm, 272 to 431 ms per application in the sync generator, builder, and watcher runs; 114 Sass files loaded (`loadedUrls`); `foundation-everything` takes about 1.5 s (D 4.3) | the build target's options only |
| R2 | A settings-only entry (`@import 'settings'; @import 'foundation';`) with `@debug meta.inspect(map-keys($button-palette))` captured by a JS `logger.debug` | 76 ms, 108 bytes of CSS (the banner) | which file holds the settings |
| R3 | The same entry calling a custom JS function (`functions` option) | 74 ms | the settings file; unquoted keys that are CSS colour names (`purple`, `teal`) arrive as `SassColor`, not strings: `assertString()` threw `purple is not a string` |
| R4 | The built CSS in `dist/` (`--nfs-button-palette: primary, secondary, success, warning, alert, purple` in `dist/apps/app1/browser/styles.css`) | exact by construction | a finished build; circular for anything that must run before the build |

R1 and R4 agreed where they were compared (`app1`'s production build after each sync; the list the generator's own compile read was the one in the built `styles.css`). Two details for any reader:

- Sass keeps colour-name keys as written. With keys `purple`, `yellow`, `white`, and `teal`, both `expanded` and `compressed` output gave `--nfs-button-palette: primary, purple, yellow, white, teal` and the selectors `.button.purple .button.yellow .button.white .button.teal` (`EXP/tools/color-keys.cjs`).
- An unoptimized development build prints the list over several lines (`--nfs-button-palette:` then `primary,` on the next line, seen in the dev server's `styles.css`), so a parser must accept newlines.

Resolution: the generator used a `node_modules` load path to find `fake-nfs/_index.scss` (`core.cjs:22-26`), while the application builder resolved the same bare `@import 'fake-nfs'` itself; both compiled. Whether every resolution rule of the application builder (package `exports` conditions, `pkg:` URLs) can be reproduced by a standalone compile was not tested beyond this case (section 11).

## 4. Nx sync generators (Nx 23.2.1)

### 4.1 Registration and signature

- A task sync generator is listed in a target's `syncGenerators`, in `project.json` or under the `nx` key of a project's `package.json` (`NX/astro-docs/src/content/docs/kb/create-sync-generator.mdoc:140-181`). "Task sync generators can be thought of like the `dependsOn` property, but for generators" (`NX/astro-docs/src/content/docs/concepts/sync-generators.mdoc:96`).
- Measured: `targetDefaults` keyed by executor registers it on every matching target without touching `project.json`. With `"targetDefaults": {"@angular/build:application": {"syncGenerators": ["fake-nfs:variants-sync"]}}` and the same for `@angular/build:dev-server`, `nx show project app2 --json` listed `["fake-nfs:variants-sync"]` on `build` and on `serve`.
- A library ships its generator in its own package: the `generators` field of `fake-nfs/package.json` made `fake-nfs:variants-sync` resolvable with no local plugin and no `@nx/plugin`.
- Global sync generators sit in `nx.json` `sync.globalGenerators` and run "only when the `nx sync` or `nx sync:check` command is explicitly run" (`sync-generators.mdoc:100-102`).
- Nx calls a sync generator with the tree alone: `SyncGenerator = (tree: Tree) => ...` (`NX/packages/nx/src/utils/sync-generators.ts:31-33`), invoked as `implementation(tree)` (`:154`). It receives no options, no project, and no task. `nx.json` declares `sync.generatorOptions` (`NX/packages/nx/src/config/nx-json.ts:757-759`), but the generator has to read it itself, as `@nx/js:typescript-sync` does (`NX/packages/js/src/generators/typescript-sync/typescript-sync.ts:202`). So one run covers the whole workspace: the probe's generator walks every project whose `build` executor is `@angular/build:application` (`EXP/fake-nfs-src/tooling/variants-sync.cjs:10-15`).
- The result's `outOfSyncMessage` and `outOfSyncDetails` (`NX/packages/nx/src/utils/sync-generators.ts:25-29`) are what Nx prints; `nx sync:check` prints the details (`NX/packages/nx/src/command-line/sync/sync.ts:81-107`).

### 4.2 When they run: measured

Setup: `EXP/nx-ws`, daemon off (`NX_DAEMON=false`) unless stated, the file committed in step, then `warning` removed from `app1/src/_settings.scss` while `app1`'s template still binds `color="warning"`.

| Command, environment | Result |
| --- | --- |
| `nx sync:check` (file missing, then stale) | exit 1, "The workspace is out of sync", the generator's message, and the detail line `apps/app1/src/nfs-variants.d.ts (app1, from apps/app1/src/styles.scss)`; 2.4 s cold |
| `nx sync` | wrote the file, "The workspace was synced successfully! Please make sure to commit the changes to your repository.", exit 0; a second `nx sync:check` exit 0 |
| `nx build app1`, non-TTY, `CI` unset (the agent shell; also a git hook or an IDE task) | exit 1 before the build: "The workspace is out of sync" and "To sync the workspace: Run `nx sync` ... Set `sync.applyChanges` to `true` ... in interactive environments" |
| `CI=true nx build app1` | the sync was skipped and the build passed against the stale file. The built `styles.css` has no `.button.warning` rule (`rg -c` exit 1) while `main.js` carries `"warning"`: a Variant that renders nothing, silently |
| simulated TTY (`node -r EXP/tools/fake-tty.cjs`, which sets only `process.stdout.isTTY`), `sync.applyChanges` unset | the prompt "Would you like to sync the identified changes to get your workspace up to date?" with "Yes, sync the changes and run the tasks" and "No, run the tasks without syncing the changes". With stdin closed the run ended without building; a real terminal was not available |
| simulated TTY, `sync.applyChanges: true` | "Proceeding to sync the identified changes automatically", "The workspace was synced successfully! Please make sure to commit the changes to your repository or this will error in CI.", then the build ran and exited 1; a rerun printed the `TS2322` on `"warning"` above: the right outcome |
| `CI=true nx sync:check` | exit 1 (the check itself is not skipped in CI) |

The source agrees with every row: `if (nxArgs.skipSync || isCI()) { return ... }` (`NX/packages/nx/src/tasks-runner/run-command.ts:687-689`); the non-TTY branch prints the out-of-sync error and calls `process.exit(1)` (`:720-750`); `applyChanges === false` warns and runs the tasks unsynced (`:768-795`); otherwise `applyChanges === true` or the prompt decides (`:810-812`, prompt at `:896-913`). `isCI()` is true for `CI` set to anything but `false` and for the usual CI variables, `GITHUB_ACTIONS`, `GITLAB_CI`, `JENKINS_URL`, `BUILD_ID`, `TF_BUILD` and others (`NX/packages/nx/src/utils/is-ci.ts:1-25`). The same early return is in the repository's Nx 22.3.1 (`NX22/src/tasks-runner/run-command.js:392`).

The Nx docs say otherwise for CI: "In CI, the sync generator is run in `--dry-run` mode and if files would be changed by the generator, the task fails with an error provided by the sync generator" (`sync-generators.mdoc:38`). In 23.2.1 no task runs a sync generator in CI; the docs' own advice, "add `nx sync:check` to the beginning of your CI scripts" (`:191-193`), is what catches drift there.

### 4.3 The daemon

- Every file change clears the daemon's cached generator results (`registerFileChangeListener(clearSyncGeneratorsCache)`, `NX/packages/nx/src/daemon/server/server.ts:787`), and every project graph recomputation schedules all registered sync generators to run again in the background (`:783`; `NX/packages/nx/src/daemon/server/sync-generators.ts:94-164`), with a wait that doubles from 100 ms up to 4 s (`:133-137`).
- Measured with the daemon on: after a warm `nx sync:check` (1.1 s, "returning cached result" in the daemon log), adding `teal` to the Sass and running `nx sync:check` at once reported the stale file (1.1 s); reverting it reported "up to date" (0.9 s). The log shows the background runs: "clearing sync generators cache due to file changes", "scheduling", "running scheduled generator fake-nfs:variants-sync", "changes: apps/app1/src/nfs-variants.d.ts" (`EXP/nx-ws/.nx/workspace-data/d/daemon.log`).
- So while a daemon runs, each batch of file changes anywhere in the workspace, not only Sass changes, costs one background Sass compile per application (0.2 to 0.4 s each here).
- The daemon never writes these results to disk by itself; files are written only when a command flushes them (`NX/packages/nx/src/daemon/server/sync-generators.ts:80-92`). Measured under `nx serve app1` with the daemon on and `serve` registered: a Sass edit made the dev server send a stylesheet update, the daemon ran the generator and logged the change, and the file's MD5 stayed the same. `nx serve` syncs once, at start.
- The daemon caches plugin code, so a changed generator needs a daemon restart (`create-sync-generator.mdoc:11-12`).

### 4.4 Several applications with different Sass settings

Measured in `EXP/nx-ws` with `app1` (plus `purple`, minus `warning`), `app2` (plus `teal`), and the shared `ui` component using `color="purple"`:

- One `nx sync` wrote both files (`app1` 351 ms, `app2` 272 ms of Sass). Each application's program saw only its own file: `nx build app1` passed, and `nx build app2` failed with `TS2322: Type '"purple"' is not assignable` at `libs/ui/src/index.ts:9`, a correct result, since `app2`'s CSS has no `.button.purple`.
- The library's own program sees no file: `ngc -p libs/ui/tsconfig.lib.json` failed with the same `TS2322` on `purple`. A shared library's type check, tests, lint with type information, and stories need a decision about which names they see.
- One program that includes both applications' files merges them: with `libs/ui/tsconfig.both-apps.json`, `purple` and `teal` both compiled and `warning` was rejected (`app1` removes it, `app2` keeps it). An editor project or a root `tsconfig.json` that includes every application sees that merged set.
- One broken application blocks every task that carries the generator. With `@include nfs-button` commented out in `app2`, both `nx sync:check` and `nx build app1` exited 1 with "The workspace is probably out of sync because a sync generator failed to run" and the generator's message; the fix hint offers `sync.disabledTaskSyncGenerators` (`run-command.ts:720-750`; `NX/packages/nx/src/utils/sync-generators.ts:293-332`). In a terminal, Nx asks whether to continue anyway (`run-command.ts:918-936`). A generator can limit this by catching each application's error and reporting it as an out-of-sync detail; the probe did not.

### 4.5 The executor alternative (T4)

`nx run app1:nfs-variants:check` (`executor: "fake-nfs:variants"`, configuration `check`) under `CI=true`: in step, exit 0 in 0.8 s; after adding `teal`, "apps/app1/src/nfs-variants.d.ts no longer matches apps/app1/src/styles.scss." and exit 1. An executor is an ordinary task, so it runs in CI, which sync generators do not (4.2). In rewrite mode inside a build's `dependsOn` it would regenerate before every build in CI too, which means CI builds against fresh types while the committed file may be stale; the check mode, or `nx sync:check`, is what reports drift.

## 5. Angular CLI without Nx

### 5.1 The builder

`ng run cli-app:nfs-variants` wrote the file (Sass 385 ms); `ng run cli-app:nfs-variants:check` exited 0 in step and 1 after adding `teal`, with "... no longer matches projects/cli-app/src/styles.scss. Run `ng run cli-app:nfs-variants`." Wall time of the check including CLI start: 1.5 to 1.6 s. The builder reads the build target's own options through `context.getTargetOptions({project, target: 'build'})` (`EXP/fake-nfs-src/tooling/variants-builder.cjs:12`), so it compiles with the application's `styles` and `includePaths`. The Angular CLI has no target dependencies; a builder can call `context.scheduleTarget()` or `context.scheduleBuilder()` (`NG/adev/src/content/tools/cli/cli-builder.md:24`, `:234-247`).

One trap found while building it: a builder schema whose `$schema` is `https://json-schema.org/schema` made `ng run` fail with "An unhandled exception occurred: Request failed. Status Code: 301" and exit 127, because the Angular devkit registry fetched the URL (`EXP/node_modules/@angular-devkit/core/src/json/schema/registry.js:145`); `http://json-schema.org/draft-07/schema` works. Nx accepted both.

### 5.2 npm lifecycle scripts

npm runs `pre<name>` and `post<name>` around `npm run <name>` (`https://github.com/npm/cli/blob/v11.16.0/docs/lib/content/using-npm/scripts.md`, "Pre & Post Scripts"). Measured in `EXP/cli-ws` with `"prebuild": "ng run cli-app:nfs-variants"`:

- `npm run build` ran the builder, wrote the file, then built: 3.9 s in all.
- `ng build cli-app` without the file failed with `TS2322` on `"purple"`, and with a stale file (after adding `teal`) it built without complaint: npm scripts do nothing for a bare `ng build`, an IDE's run button, or `ng serve`.
- When the `prebuild` step failed (the 301 above), npm stopped and the build did not run.

### 5.3 Extension points in `@angular/build` 22.2.0

- `buildApplication(options, context, extensions?)` is exported (`BUILD/src/index.d.ts:8-9`) and marked "@experimental Direct usage of this function is considered experimental", with "Usage of the `extensions` parameter is NOT supported and may cause unexpected build output or build failures" (`BUILD/src/builders/application/index.d.ts:17-30`). The extensions are `codePlugins` and `indexHtmlTransformer` (`BUILD/src/builders/application/options.d.ts:28-31`). The dev server's `execute(options, context, extensions?)` takes `buildPlugins`, `middleware`, and `indexHtmlTransformer`, under the same warning (`BUILD/src/builders/dev-server/builder.d.ts:14-31`), and passes the plugins on as `codePlugins` (`BUILD/src/builders/dev-server/builder.js:36`).
- Code plugins are added to the JavaScript bundles after the Angular compiler plugin (`BUILD/src/tools/esbuild/application-code-bundle.js:63-71`); the stylesheet bundles build their own plugin list without them (`BUILD/src/tools/esbuild/stylesheets/bundle-options.js:32-37`). No code plugin sees the Sass compile.
- The Angular compiler plugin creates and type-checks its compilation inside its own `onStart` callback (`BUILD/src/tools/esbuild/angular/compiler-plugin.js:126`, `:252`, `:323`), and esbuild runs "All on-start callbacks from all plugins ... concurrently, and then the build waits for all on-start callbacks to finish before proceeding" (`https://esbuild.github.io/plugins/#on-start`, read 2026-09-27; esbuild 0.28.2). A plugin that writes the declaration file in `onStart` races the compiler reading it.
- `@nx/angular:application` exposes the same thing as a `plugins` option, "A list of ESBuild plugins" (`NX/packages/angular/src/executors/application/schema.json:638-652`), passed to `buildApplication` as `codePlugins` (`NX/packages/angular/src/executors/application/application.impl.ts:55-57`).
- A wrapper builder that runs the generator and then schedules `@angular/build:application` would regenerate on each build; the typing decision already weighed and did not adopt it ([Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md), Provisional ruling). Not measured here.

Schematics and `ng add` run once (setup or migration), and `ng update` migrations run on a library upgrade; none runs on a Sass edit (not measured).

Reusing the Nx executor through `convertNxExecutor` puts `nx` on the Angular CLI consumer's install: the converter does `require("nx/src/devkit-internals")` (`EXP/node_modules/@nx/devkit/dist/src/utils/convert-nx-executor.js:6`), and `@nx/devkit` 23.2.1 declares `nx` as a peer dependency (`EXP/node_modules/@nx/devkit/package.json:73`). On win32-arm64 that is `nx` (20 MB) plus `@nx/nx-win32-arm64-msvc` (16 MB) (`du -sh`). The probe's builder is a plain `createBuilder` over the shared core and needs only `@angular-devkit/architect`, which the Angular CLI already installs (`variants-builder.cjs:7`).

### 5.4 `ng serve` and a stale file: measured

`EXP/cli-ws`, template `color="teal"`, the file in step:

1. Removing `teal` from the Sass during `ng serve`: "Changes detected. Rebuilding...", a styles-only rebuild, "Stylesheet update sent to client(s)", no error. The served `--nfs-button-palette` lost `teal`; the types did not.
2. Running `ng run cli-app:nfs-variants` in another process rewrote the file: the dev server rebuilt and reported `TS2322: Type '"teal"' is not assignable`.
3. With a watcher running beside the server (`EXP/tools/watch-variants.mjs`: `fs.watch` recursive on the source root, regenerating 100 ms after a `.scss` change, 277 to 431 ms per run), adding `teal` back made the watcher write the file 0.6 s after the edit, and the dev server rebuilt twice, still reporting the `TS2322` on `teal`. Touching the declaration file changed nothing; adding a newline to `app.ts` cleared it.
4. After that clean state, two more remove-and-add rounds through the watcher (four file changes) and four direct rewrites of only the declaration file: every rebuild after a declaration-file change reported "Application bundle generation complete", including those where the file lacked `teal` while the template bound it.
5. A fresh `ng serve` on port 4881: the first rewrite (without `teal`) reported the error; the three rewrites after it (with, without, with) all kept reporting it.

So in this setup the dev server applied only the first change to the declaration file after it started, and kept its template diagnostics for later changes to that file alone; an edit to the component re-checked it against the file as it then was. `nx serve` uses the same `@angular/build:dev-server` builder, so the same is expected there (not measured). Why the dev server behaves this way was not investigated (section 11).

## 6. The reverse direction: TypeScript or tokens as the source

Sass loads only `.scss`, `.sass`, and `.css` files ("`@use "variables"` will automatically load `variables.scss`, `variables.sass`, or `variables.css`", `https://sass-lang.com/documentation/at-rules/use/#finding-the-module`, read 2026-09-27), and custom importers exist only through the JS API or the embedded protocol (same page, "pkg: URLs"), which the application builder does not accept (section 3). So with a TypeScript, JSON, or tokens file as the source, the Sass map is a generated `.scss` partial that the consumer's settings `@import`.

### 6.1 DTCG tokens and Style Dictionary

The W3C Design Tokens Community Group's format is a "Final Community Group Report" dated 28 October 2025, version 2025.10, with tokens as `$value` and `$type` members and `.tokens` or `.tokens.json` as the recommended file extensions (`https://www.designtokens.org/tr/2025.10/format/`, read 2026-09-27). Style Dictionary 5.5.5 detects that syntax (`usesDtcg=true` in the run below) and has built-in `scss/map-deep`, `scss/map-flat`, `scss/variables`, `typescript/es6-declarations`, and `typescript/module-declarations` formats (`EXP/node_modules/style-dictionary/lib/enums/formats.js:39-49`). None writes an interface augmentation, so both outputs were custom formats of a few lines (`EXP/reverse/build-tokens.mjs`).

Measured: `EXP/reverse/tokens/button.tokens.json` (`button.palette` with `primary`, `secondary`, `success`, `alert`, `purple`) produced `_nfs-button-palette.scss` (`$button-palette: (primary: #1779ba, ..., purple: #bb00ff);`) and the same `nfs-variants.d.ts` as section 1 (`purple: true; warning: false;`), in 15 to 17 ms in process and 0.2 s as a Node process.

### 6.2 TypeScript as the source, types derived

With the palette in TypeScript, the types need no generated file: a declaration file written once derives the registry from the source (`EXP/reverse/ts-app/src/nfs-variants.d.ts`):

```ts
import type { NfsDefaultButtonColor } from 'fake-nfs';
import type { nfsButtonPalette } from './nfs-palette';

type AppButtonColor = keyof typeof nfsButtonPalette;

declare module 'fake-nfs' {
  interface NfsButtonColorOverrides
    extends Record<AppButtonColor, true>,
      Record<Exclude<NfsDefaultButtonColor, AppButtonColor>, false> {}
}
```

Measured with `ngc` 22.2.0 and strict templates over `nfsButtonPalette = {primary, secondary, success, alert, purple} as const`: `color="purple"` and `color="alert"` compiled; `color="warning"` gave `TS2322`; `color="primray"` gave `TS2820: ... Did you mean '"primary"'?`. Exactly those two diagnostics. A 12-line script that Node 24 runs directly from `.ts` wrote the Sass map in under 1 ms (0.16 s as a process), and compiling Foundation with it gave `--nfs-button-palette: primary, secondary, success, alert, purple`.

What changes against the Sass-first flow:

- The TypeScript side can never be stale: the types are the source. Staleness moves to the generated `.scss`, and it is silent at compile time (a stale partial compiles and simply lacks the new class), so the CI check compares the generated partial with a fresh generation, and the development-mode check reports a declared name the CSS lacks.
- The consumer keeps colour values in TypeScript or JSON rather than in Foundation's `_settings.scss`, and Foundation's documented `map-merge` form on the Button, Badge, and Label pages (D section 2) is replaced by editing the source file. Each palette that defaults to `$foundation-palette` (`$button-palette`, `$badge-palette`, `$label-palette`, D 2.1) becomes one exported map or one entry the generator writes.
- A JSON source can be imported by TypeScript with the same `keyof typeof` derivation (not measured).

## 7. Prior art for generating types from styles

| Tool (version) | What it generates | Keeping it in step | Check mode |
| --- | --- | --- | --- |
| typed-scss-modules 8.1.1 | a `.d.ts` beside each `.module.scss` | `--watch` (`-w`), `--ignoreInitial`, and writing only when the source is newer and the content differs, to avoid waking `tsc --watch` | `--listDifferent` (`-l`): "List any type definition files that are different than those that would be generated. If any are different, exit with a status code `1`." (`https://github.com/skovy/typed-scss-modules/blob/v8.1.1/README.md`, lines 59-71, 132-138, 242) |
| typescript-plugin-css-modules 5.2.0 | types for CSS modules inside the editor only | n/a | "TypeScript does not support plugins during compilation. This means that this plugin cannot: provide errors during compilation" (`https://github.com/mrmckeb/typescript-plugin-css-modules/blob/v5.2.0/README.md`, lines 34-40) |
| TypeScript language service plugins | editor features | n/a | "Plugins can't add new language features such as new syntax or different typechecking behavior, and plugins aren't loaded during normal commandline typechecking or emitting, (so are not loaded by `tsc`)" (`https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin`, read 2026-09-27) |
| Panda CSS 1.12.1 | a `styled-system/` folder in the consumer's project | `panda codegen` with `--watch`, `--poll`, `--clean`; `panda init` adds the output to `.gitignore` unless `--no-gitignore` | none in the CLI (`https://github.com/chakra-ui/panda/blob/%40pandacss/dev%401.12.1/packages/cli/src/cli-main.ts`, lines 53, 105-107, 122-165) |
| Chakra UI 3.37.0 `chakra typegen` | types written into the installed package | `postinstall` or `prepare` | none; writing into `node_modules` is vetoed for this library (D O9; ticket Question) |
| Style Dictionary 5.5.5 | Sass maps, TypeScript declarations, custom formats | a build step | none built in (section 6.1) |

## 8. Runtime checks and the CI check

### 8.1 How each check reads the consumer's names

| Check | Reads | Cost |
| --- | --- | --- |
| Development-mode Variant check | the `--nfs-<setting>` lists on `:root` through `getComputedStyle(document.documentElement)`, once per setting per realm after the first render (the channel the typing decision chose; read back exactly in three engines, D 4.4) | nothing in an optimized build (8.3) |
| Production opt-in | the same lists | the checker's code (8.3), one computed-style read per setting per realm, one report per distinct value; the lists already ship in production CSS, about 200 bytes (D O10) |
| A drift check between the declaration file and the CSS | a list shipped in JavaScript compared with the CSS lists, ADR 0005's token-against-properties shape (`adr/0005-breakpoint-source-of-truth.md:7`) | a declaration file has no runtime values, so option A would need a generated `.ts` beside it (not probed) |
| CI check | a fresh Sass compile with the project's options (R1), or the built CSS (R4), or the tokens or TypeScript source in the reverse direction | 1.5 to 2.8 s per run here (5.1, 8.4) |

Neither runtime check runs on the server, which has no computed style (`research/angular-rendering-modes.md:31`, `:51`).

### 8.2 NgRx `runtimeChecks` (22.0.1)

- Six checks in `RuntimeChecks`: `strictStateSerializability`, `strictActionSerializability`, `strictStateImmutability`, `strictActionImmutability`, `strictActionWithinNgZone`, and the optional `strictActionTypeUniqueness` (`NGRX/modules/store/src/models.ts:142-169`).
- Defaults in development: the two immutability checks on, the other four off (`NGRX/modules/store/src/runtime_checks.ts:21-31`; docs, "Default On" and "Default Off", `NGRX/projects/www/src/app/pages/guide/store/configuration/runtime-checks.md:5-14`). The user's object is spread over the defaults, so each check can be switched off or on (`runtime_checks.ts:29`).
- Production: none can run. When `isDevMode()` is false, `createActiveRuntimeChecks` returns every check `false` and ignores the user's object (`runtime_checks.ts:33-40`); the docs say "All checks will automatically be disabled in production builds" (`runtime-checks.md:16`). There is no production opt-in.
- Configuration: `provideStore(reducers, config)` (`NGRX/modules/store/src/provide_store.ts:206-214`) and `StoreModule.forRoot(reducers, config)` (`NGRX/modules/store/src/store_module.ts:83-91`) both call `_provideStore`, which adds `provideRuntimeChecks(config.runtimeChecks)` and `checkForActionTypeUniqueness()` (`provide_store.ts:168-169`). `RootStoreConfig` carries `runtimeChecks?: Partial<RuntimeChecks>` (`NGRX/modules/store/src/store_config.ts:21-24`).
- Mechanism: the user object becomes `USER_RUNTIME_CHECKS`, then `ACTIVE_RUNTIME_CHECKS` through `createActiveRuntimeChecks`, and three `META_REDUCERS` factories each return the reducer unchanged when their flags are off (`runtime_checks.ts:43-54`, `:87-124`). The uniqueness check throws an `Error` listing the duplicated types (`:143-159`).
- Stripping: the gate is the runtime call `isDevMode()`, which returns `typeof ngDevMode === 'undefined' || !!ngDevMode` (`NG/packages/core/src/util/is_dev_mode.ts:20-22`), and the checks' code is referenced from providers that `_provideStore` always includes. So, read from the source (not measured with an NgRx build), the checks ship in production bundles and are switched off at runtime.
- Angular's own dev-check configuration takes the other route: `provideCheckNoChangesConfig` returns its providers only when `typeof ngDevMode === 'undefined' || ngDevMode` and an empty list otherwise (`NG/packages/core/src/change_detection/provide_check_no_changes_config.ts:41-56`), so a production build drops them.

### 8.3 Measured: what a production opt-in costs in the bundle

The Angular CLI defines `ngDevMode` as `false` only when script optimization is on (`BUILD/src/tools/esbuild/application-code-bundle.js:461-470`). `EXP/runtime/measure.mjs` bundles a stand-in checker (`EXP/runtime/checker.ts`: one cached computed-style read per setting, a once-per-value set, a report callback, about 60 lines) with esbuild 0.28.2, with and without that define:

| Shape | Optimized (`ngDevMode: false`, minified) | Development |
| --- | --- | --- |
| No check | 45 B | 69 B |
| Check behind `ngDevMode` only (`directive-dev-only.ts`) | 14 B, checker removed | 1,476 B |
| Production switch the directive reads, checker imported by the directive (`directive-prod-optin.ts`), not switched on | 595 B (395 B gzip), checker kept | 1,528 B |
| Check function installed by the opt-in, directive falls back to the dev checker behind `ngDevMode` (`directive-prod-injected.ts`), not installed | 87 B, checker removed | 1,563 B |
| The same, installed | 895 B (527 B gzip), checker kept | 1,715 B |

So a production opt-in costs nothing in a consumer's production bundle when the directive never imports the checker and only the opt-in's provider does; it costs the checker's size once the consumer opts in (about 0.9 KB minified for the stand-in; the real one also parses Breakpoint queries and rules keys). NgRx's shape, a runtime flag read by code the providers always include, corresponds to the 595 B row: the code stays (an analogy from 8.2, not an NgRx measurement).

### 8.4 A shape in the direction of NgRx, for the user's defaults

The user's defaults ([Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md), "User input, 2026-09-27"): the development check on by default with a per-check opt-out, and the production check opt-in. Two shapes, neither decided:

Shape 1, NgRx's option object plus a separate production feature, following Angular's feature-function pattern (`provideRouter(routes, ...features)`, `NG/packages/router/src/provide_router.ts:107-122`):

```ts
export interface NfsRuntimeChecks {
  /** A Variant value the consumer's CSS has no class for (not in --nfs-<setting>). */
  strictVariantNames: boolean;
  /** A Library mixin's Variant properties are missing (the include was forgotten). */
  strictVariantProperties: boolean;
  /** The Breakpoint drift check (ADR 0005). */
  strictBreakpointSync: boolean;
}

// No provider at all: every check on in development, nothing in production.
bootstrapApplication(App, {
  providers: [
    provideNfs(
      withRuntimeChecks({ strictVariantProperties: false }), // development: per-check opt-out
      withProductionRuntimeChecks(
        { strictVariantNames: true }, // production: per-check opt-in, all off unless listed
        { report: (report) => telemetry.send(report) },
      ),
    ),
  ],
});
```

| Check | Development default | Development opt-out | Production default | Production opt-in |
| --- | --- | --- | --- | --- |
| `strictVariantNames` | on | `withRuntimeChecks({strictVariantNames: false})` | off | `withProductionRuntimeChecks({strictVariantNames: true})` |
| `strictVariantProperties` | on | same form | off | same form |
| `strictBreakpointSync` | on (ADR 0005) | same form | off | same form |

How it would work: a root injection token whose factory returns the development defaults, so the check runs with no provider; `withRuntimeChecks` overrides it and, like `provideCheckNoChangesConfig`, returns nothing when `ngDevMode` is false; `withProductionRuntimeChecks` is the only production code path that references the checker, which keeps the 87 B row for everyone who does not call it. The report callback defaults to `console.warn` in development; whether production also defaults to the console is open.

Shape 2, one object with a tri-state per check: `provideNfsRuntimeChecks({strictVariantNames: true | false | 'always'})`, where `true` is the development-only default and `'always'` adds production. Shorter to read, but the function then references the checker for every caller whatever the value, which is the 595 B row: a consumer who only opts out in development still ships the checker.

What a production opt-in adds besides the bytes: one `getComputedStyle` property read per setting per realm after the first render (D 4.4 timed a whole-stylesheet scan at 2 to 17 ms; the single property reads were not timed separately), one report per distinct value, and console output or telemetry in the consumer's production application. The provisional ruling of [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md) names the case it serves: Variant values from runtime data such as a CMS. The same ruling expects the checker's code to stay in the bundle under a production opt-in (not measured there); the rows above show it stays only for consumers who opt in, if the directive never imports the checker.

### 8.5 CI checks

- Nx: `nx sync:check` (exit 1 on drift, measured, also under `CI=true`; 2.6 to 2.8 s for two applications without the daemon), or the executor's `--check` (0.8 s for one application).
- Angular CLI: `ng run <app>:nfs-variants:check` (1.5 to 1.6 s).
- Either: regenerate, then `git diff --exit-code` on the file (the generated file is deterministic: sorted additions, then the removed defaults in library order, `core.cjs:66-69`).
- After a build: compare the built CSS lists (R4) with the declaration file. Exact, needs no second compile, runs only after the build.
- Reverse direction: regenerate the Sass partial and `git diff --exit-code`.
- The development check as a test: an e2e or story test that fails on the check's console warning (not measured).

## 9. Failure modes

1. A committed file gone stale. A name added in Sass fails to compile until the sync runs (loud; `TS2322`). A name removed in Sass keeps compiling, and CI with `CI=true` built and shipped a `color="warning"` whose class no longer exists (4.2). Caught by `nx sync:check`, a `--check` step, or the development check.
2. CI without the sync. No Nx task runs a sync generator when `isCI()` is true (4.2), though the docs say CI fails the task. Without `nx sync:check` in the pipeline, drift passes CI.
3. Non-interactive local runs without `CI` set (git hooks, agent shells, IDE task runners): `nx build` exits 1 when out of sync (measured with `sync.applyChanges` unset, 4.2), and `sync.applyChanges: true` does not change that, because the non-TTY exit comes before the `applyChanges` branch (`run-command.ts:720-750` against `:768-812`; the source's own comment at `:93-96`; not measured).
4. Several applications with different Sass settings: the generator runs once for the workspace and must handle every application (4.1); a shared library's own program sees no file, and a program that includes several files merges them (4.4); one application's generator error blocks the tasks of all of them (4.4).
5. The generator's compile differing from the build's: another `includePaths`, a configuration that overrides `styles` or `stylePreprocessorOptions` (the probe's builder reads the target's base options only), a second global stylesheet (the probe takes the first `.scss`, `core.cjs:97-103`), or a resolution rule the standalone compile lacks. Measured identical only for the probe's setup (3).
6. A declaration file outside the program: the Angular CLI's `tsconfig.app.json` includes `src/**/*.ts` (`EXP/node_modules/@schematics/angular/application/files/common-files/tsconfig.app.json.template:8-9`) and `tsconfig.spec.json` includes `src/**/*.d.ts` (`tsconfig.spec.json.template:10-11`), so `src/nfs-variants.d.ts` is in both. A file written elsewhere drops out silently and the default names apply (the provisional ruling of [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md) measured a tsconfig without the file rejecting the custom name).
7. The dev server keeping template diagnostics after the file changes (5.4): a watcher regenerates, but the errors shown may be those of an earlier file until the component changes or the server restarts.
8. The daemon: a background Sass compile per application after each batch of file changes (4.3), and a generator change that needs a daemon restart.
9. A missing Library mixin include: the probe's generator fails with "--nfs-button-palette is missing from apps/app2/src/styles.scss: include the Library mixin after its Foundation mixin." and Nx reports "The workspace is probably out of sync because a sync generator failed to run" (4.4).
10. A library upgrade that changes the default names or the list of Variant inputs: the generator's registry list comes from the installed version, so the next sync or check reports it; whether anything reruns on install was not measured (Nx restarts an outdated daemon when the lock file changes, `NX/packages/nx/src/daemon/server/server.ts:723`, `:774`, not measured).
11. Colour-name keys: a reader that takes map keys as strings through a custom function fails on `purple` or `teal` (3).

## 10. Costs per consumer

| | Nx workspace | Angular CLI only |
| --- | --- | --- |
| Setup | the library's package (the generator ships in it); `targetDefaults` entries for `@angular/build:application` and `@angular/build:dev-server` (measured) and the unit-test executor (not measured); `sync.applyChanges: true` to skip the prompt; one committed `src/nfs-variants.d.ts` per application | an `nfs-variants` target per application in `angular.json` (a setup schematic would add it; not measured); optional `prebuild`, `prestart`, `pretest` scripts; one committed file per application |
| Per task, locally | with the daemon, the result is usually precomputed (a check took 0.9 to 1.1 s in all); without it, one Sass compile per application per run (0.2 to 0.4 s here, about 1.5 s with `foundation-everything`, D 4.3) | only when run: `npm run build` or `ng run`; a bare `ng build` or `ng serve` runs nothing |
| CI | `nx sync:check` as its own step (required: tasks skip the sync) | `ng run <app>:nfs-variants:check` |
| Watch mode | synced once when `nx serve` starts; later Sass edits are not written (4.3) | an optional watcher, with the diagnostics limit in 5.4 |
| Extra dependencies | none | none with a plain Architect builder; `nx` and `@nx/devkit` (36 MB on win32-arm64) if the builder comes from `convertNxExecutor` (5.3) |

## 11. Open unknowns

1. Why the dev server keeps its template diagnostics after the declaration file changes (5.4), whether `nx serve` and the unit-test builder's watch mode behave the same, and whether a real editor's language service follows the file without a restart.
2. The Angular unit-test builder with Vitest and `@storybook/angular-vite` with the declaration file: not measured here (by construction the spec tsconfig includes it, 9.6).
3. How closely a standalone compile can reproduce the application builder's Sass resolution beyond `includePaths` and one bare package import (package `exports` conditions, `pkg:` URLs, per-configuration overrides, several global stylesheets).
4. Which names a shared library's own type check, tests, and stories should see in a workspace whose applications differ (4.4).
5. Nx 22 against Nx 23: only the CI early return was compared (present in both); the daemon's background runs and the prompt were not measured on 22.3.1.
6. The prompt in a real terminal: only a simulated TTY was available (4.2).
7. Nx Cloud and distributed agents: they set CI variables, so tasks there would skip the sync too (inferred from `is-ci.ts`, not measured).
8. Tree-shaking of the production opt-in under the real application builder with an `InjectionToken` and `makeEnvironmentProviders`, rather than the stand-in's module variable bundled with esbuild directly (8.3).
9. Whether option A needs a generated `.ts` list beside the `.d.ts` for a drift check in the ADR 0005 shape (8.1), and whether the development check should compare the declared names with the CSS lists at all, given that a declaration file carries no runtime values.
10. The reverse direction's fit for Foundation users: colour values in TypeScript or tokens instead of `_settings.scss`, and how the generator writes the palettes that default to `$foundation-palette` (6.2).
11. The registry's shape for a removed default (`name: false` here) belongs to the typing half; the generator's output follows whichever shape it records.
