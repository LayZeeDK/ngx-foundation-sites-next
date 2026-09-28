# 137. Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces

Type: prototype
Status: resolved
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

## Answer

Model: Opus 5.5. Worked AFK under the map's override with `/mattpocock-skills:prototype` as a technical spike (the map's override replaces the single-file logic demo). Capture: [prototypes/variant-declaration-tooling/](../prototypes/variant-declaration-tooling/README.md) (the stand-in package with its tooling, the workspace fixtures, the measurement scripts, and ASCII results with no personal paths).

Setup, all under `D:/tmp/nfs-proto-137/` (not committed), Node 24.18.0 on Windows 11 arm64:

- The stand-in `ngx-foundation-sites@0.0.0-proto.137`, built with ng-packagr 22.2.0 and packed with `npm pack`: the spec's helper types, five registries (`NfsFoundationPaletteOverrides`, `NfsButtonPaletteOverrides` based on it, `NfsBreakpointClassesOverrides`, `NfsPrototypeSizesOverrides`, `NfsGridColumnsOverrides`), the Class breakpoint types, `nfsVariantBoolean`; `ngx-foundation-sites/button` (`NfsButton.color`, name shape; `NfsButton.expanded`, query shape), `ngx-foundation-sites/xy-grid` (`NfsCell.size`, count and rules shapes), `ngx-foundation-sites/callout`; `_index.scss` under the `sass` export condition with the Library mixins in the Variant property format; and the CommonJS tooling beside them: the shared core, the setup generator (`generators`) and its `convertNxGenerator` schematic (`schematics`, one collection file), the hidden sync generator, and one Architect builder (`builders`, no `executors` field).
- `nx-ws`: `create-nx-workspace@23.2.1 --preset=angular-monorepo` (run with `CLAUDECODE` unset), pinned to `@angular/*` 22.2.0 and ng-packagr 22.2.0; applications `shop` (adds `purple` to `$button-palette`, `xlarge` to `$breakpoint-classes`, `$grid-columns: 16`) and `admin` (adds `teal` to `$foundation-palette`), and a buildable library `ui` whose template binds `color="purple"`, set up from `shop:build`. TypeScript 6.0.3, `sass-embedded` 1.104.1, esbuild 0.28.2, Vitest 4.1.11, jsdom 27.4.0, Storybook 10.6.0 with `@storybook/angular-vite`, Playwright 1.63.0 (Chromium 153).
- `cli-ws`: `@angular/cli@22.2.0 new` (it installs Vitest 5.0.2 and jsdom 30.1.1; the map pins Vitest 4.1.x, left as generated), one application with `purple` added.
- Every Nx command ran with `NX_DAEMON=false`; the daemon was confirmed stopped and no server on ports 5080 to 5089 was left running. Writes into `node_modules` were limited to the scratch workspaces' own installs (the tooling copied in during iteration, and the Question 1 instrumentation of `@angular/build`, removed afterwards). No junction was created.

### 1. The dev server and the declaration file

Verdict: the spec's restart note does not stand; a fix exists, and it belongs in the generated file's format (so every writer carries it: the setup generator, the sync generator, and the builder), not in the setup generator alone.

Root cause, traced in `@angular/build` 22.2.0 (`src/tools/angular/compilation/aot-compilation.js`) with logging added to the scratch workspaces' own copy:

- `collectDiagnostics` asks the Angular compiler for template diagnostics only for files in `affectedFiles` and serves every other component's diagnostics from `diagnosticCache`. `findAffectedFiles` builds that set from TypeScript's `getSemanticDiagnosticsOfNextAffectedFile`, adding a component when its type-check shim (`<file>.ngtypecheck.ts`) is affected.
- A change to the declaration file makes ngtsc start a fresh compilation (Angular 22.2.x `packages/compiler-cli/src/ngtsc/incremental/src/incremental.ts`: "Bail out if a .d.ts file changes"), but that does not reach the diagnostics gate: TypeScript's builder (6.0.3, `getFilesAffectedByUpdatedShapeWhenModuleEmit`) treats a changed module as affecting only itself under `isolatedModules` (both workspace templates set it), and only the files that import it otherwise. Nothing imports a module augmentation. So the only affected file is the declaration file, a declaration file gets no template diagnostics, and every component keeps its cached ones.
- Why the first rewrite works: in the dev server's first incremental rebuild the builder program's type-check shim for each component changes from the 46-character placeholder of the initial build to the full 498-character type-check block (traced: `oldLen=46`, then `len=498` with an unchanged hash on every later rebuild). That change marks every component affected once, whatever triggered the rebuild. Control run: with the first incremental rebuild spent on a component edit, even the first rewrite of the declaration file stayed stale (all five rewrites served from the cache; the TS2322 never appeared).

Measured, five alternating rewrites (`purple` removed, back, removed, back, removed) against a template that binds `color="purple"`, counting a rewrite correct when TS2322 on `purple` is present exactly when the file lacks it:

| Setup | `ng serve` (cli-ws) | `nx serve shop` |
| --- | --- | --- |
| Baseline (the spec's file format) | 3 of 5 correct: rewrite 1 re-checked, then the cached error stays (the "correct" ones are the removals, whose error was already showing) | same: rewrite 1 re-checked, then cached |
| Baseline with the first rebuild spent on a component edit (control) | 2 of 5, every rewrite from cache (no error ever appears) | not run |
| `/// <reference path="./nfs-variants.d.ts" />` in `main.ts` | same as baseline | not run |
| `files: ["src/nfs-variants.d.ts"]` in `tsconfig.app.json` | same as baseline | not run |
| The file ends with an empty `declare global {}` | 5 of 5; every rewrite marks all files affected and recomputes the templates' diagnostics | 5 of 5 |
| Real flow with the line: a Sass edit, then `ng run cli-ws:nfs-variants` (or `nx sync`) rewrites the file | 5 of 5 | 5 of 5 |
| Upgrade: the server starts on a file without the line, the first rebuild is spent on a component edit, then the real flow writes the new format | 5 of 5 (the first rewrite already carries the line, and TypeScript judges the new file) | not run |

Why the line works: `isFileAffectingGlobalScope` returns true for a file with a global augmentation (`containsGlobalScopeAugmentation`), and `getFilesAffectedByUpdatedShapeWhenModuleEmit` checks that before its `isolatedModules` shortcut, so a changed file with `declare global {}` affects every file, every shim among them. Cost: each rewrite of the file re-runs the semantic check of the whole program (0.05 s rebuilds here; a large application pays a full type check, only when the file changes). The line is valid in the file because the file is a module (its `import`); Prettier keeps it; the reader skips it, so it changes no model and no check.

Triage: impact MEDIUM (the generated-file format consumers commit, reversible inside the tooling); confidence HIGH (root cause read in source, confirmed by instrumentation, a control run, both dev servers, the real flow, and the upgrade path). Outcome: text correction of the spec (changes S1 to S7 below).

### 2. Unit tests and Storybook

Verdict: the unit-test builders pass: they see the file and fail closed without it. Storybook type-checks no template and no story, so the file changes nothing there and a missing file fails nothing; only a type check of the Storybook TypeScript configuration sees it. A side finding changes setup step 4 for library builds.

| Command | With the file | Without the file |
| --- | --- | --- |
| `ng test` (`@angular/build:unit-test`, Vitest 5.0.2, jsdom 30.1.1) | 1 passed | exit 1, TS2322 on `"purple"` |
| `ng test --browsers=ChromiumHeadless` (`@vitest/browser-playwright` 5.0.2, HeadlessChrome 153) | 1 passed | exit 1, TS2322 |
| `nx test shop` (`@angular/build:unit-test`, Vitest 4.1.11, jsdom 27.4.0) | 1 passed (the shared `ui` template compiles against `shop`'s file) | exit 1, TS2322 on `"purple"` (twice: `shop` and `ui`), TS2820 on `"xlarge down"`, TS2322 on `"16"` |
| `nx test shop --browsers=ChromiumHeadless` | 1 passed | exit 1, same diagnostics |
| `nx test ui` (`@nx/angular:unit-test`, jsdom) | 1 passed | exit 1, TS2322 |
| `nx test ui --browsers=ChromiumHeadless` | 1 passed | exit 1, TS2322 |
| `nx build-storybook ui` (`storybook build`, default `jit: true`) | completed | completed (no diagnostic) |
| the same with `framework.options.jit: false` | completed | completed (no diagnostic) |
| `nx test-storybook ui` (`@storybook/addon-vitest`, Chromium) | 2 passed (the play functions find `.purple`) | 2 passed |
| `storybook dev` (Controls panel of `Ui.color`) | a JSON editor holding `"purple"` | the same |
| `tsc --noEmit -p libs/ui/.storybook/tsconfig.json` | exit 0 | exit 2, TS2322 on the story's `args: { color: 'purple' }` when the setup's `include` edit is removed |

The environments were confirmed by a failing assertion on `navigator.userAgent` (`jsdom/30.1.1`, `jsdom/27.4.0`, `HeadlessChrome/153.0.8010.12`).

Docgen (the `experimentalDocgenServer` feature, on by default in `@storybook/angular-vite` 10.6; payloads read from `storybook-static/services/core/docgen/*.json` and the dev Controls panel):

- `Ui.color = input<NfsButtonColor>('primary')`, the alias imported from the installed package: `{ name: 'other', value: 'empty-enum' }`, shown as a JSON editor, with or without the file. Cause: the docgen worker's `addDeclaration` skips any type alias declared in a declaration file (`dist/docgen/docgen-worker.js`), so the package alias is never expanded; a local alias of it (`type UiColor = NfsButtonColor`) did no better.
- A registry-built alias declared in source (`NfsOverridableStringUnion<'primary' | 'secondary', LocalPaletteOverrides>`, chained or not): an enum of its names; a source `.d.ts` augmenting that registry added `tertiary` to the options, so docgen's program includes the project's declaration files. In this library's own Storybook the aliases are source files, so its stories get select controls of Foundation's defaults without `argTypes`.
- `NfsButton` imported from the package as `meta.component`: `AngularComponentMetaNotFound` (no docgen for a directive from an FESM bundle).

Setup finding (library builds): `nx build ui` (`@nx/angular:ng-packagr-lite`) failed with TS2322 on `color="purple"` although `libs/ui/tsconfig.lib.json` includes `src/**/*.ts`: ng-packagr 22.2.0 sets the program's root names to the entry file (`src/lib/ts/tsconfig.js`, `tsConfig.rootNames = [entryPoint.entryFilePath]`), so `include` and `files` never reach it. Adding `"./src/nfs-variants.d.ts"` to that configuration's `compilerOptions.types` made the build pass, and the emitted typings in `dist/libs/ui` do not reference the file. The prototype's setup generator does that edit for ng-packagr targets. The per-project `syncGenerators` entries also merged onto the inferred `storybook`, `build-storybook`, and `test-storybook` targets of `@nx/storybook/plugin` (their `command` and `cache` kept, per `nx show project ui --json`).

Triage: unit tests LOW impact, HIGH confidence (a confirmation). Storybook's missing type check: MEDIUM impact (the spec's problem statement, step 4's reason, and the shared-library rule assume Storybook's program checks names), HIGH confidence (dev, both build modes, the addon-vitest run, and the `tsc` counter-test). Library builds and `types`: MEDIUM impact (as written, step 4 leaves a shared library's build failing), HIGH confidence. Docgen: LOW impact (a consumer story's control), HIGH confidence. Outcome: text corrections S8 to S10; ADR 0040's reopening condition is answered without reopening it (proposed note A1).

### 3. The core's Sass compile against the application builder's

Verdict: the core reads exactly the builder's Variant properties in every case the builder supports, after three rule corrections that the spec's text needs: the Sass compiler, the resolver, and `~`.

Method: `measure/q3-resolution.cjs` rewrites `angular.json` per case, runs the core's resolve and compile, then `ng build` (production, plus development for case 8), and compares the `--nfs-*` properties with the built CSS.

| Case | Core | Built `styles.css` | Result |
| --- | --- | --- | --- |
| 1. `@import 'ngx-foundation-sites'` (the `sass` export condition) with `includePaths` | button palette plus `purple`, the defaults elsewhere | the same | equal |
| 2. `pkg:foundation-sites/scss/foundation` and `pkg:ngx-foundation-sites` | breakpoint classes and button palette | the same | equal |
| 3. `@import '~foundation-sites/scss/foundation'` | "Can't find stylesheet to import" at that line | build failed with the same error at the same line | equal (both reject `~`) |
| 4. No `includePaths`, package specifiers only | fails at Foundation's `settings/_settings.scss:64` (`@import 'util/util'`) | fails at the same line | equal (Foundation 6.9's settings need the load path) |
| 5. Two global stylesheets printing different registries | grid columns 16 from the second, the rest from the first | the same | equal |
| 6. Two global stylesheets that disagree on `--nfs-button-palette` | M12 naming both stylesheets | prints both lists; the later one wins in the cascade | M12 as designed |
| 7. An `inject: false` theme with its own palette | ignores the theme | `styles.css` as case 1; `theme-teal.css` separate | equal |
| 8. The production configuration overrides `styles` | follows `production` (the default configuration), warning M11 | production equal; development (the dev server's) differs | M11 as designed |

The three corrections, each measured:

- The compiler: `@angular/build` 22.2.0 compiles with `sass-embedded` (its dependency) unless `NG_BUILD_SASS_EMBEDDED` is `0` or `false` (`src/utils/environment-options.js`); the spec names `sass`. Timing of one `foundation-everything` compile on this machine: pure-JS `sass` `compileAsync` 8.5 to 9.5 s (its synchronous `compile` 1.6 s), `sass-embedded` 0.6 to 0.8 s. The core needs the asynchronous API because the resolver is asynchronous, so it loads `sass-embedded` through `initAsyncCompiler()`. With it, `nx sync:check` over three projects took 5.9 s wall (daemon off) and `ng run cli-ws:nfs-variants:check` 2.4 s wall.
- The resolver: the builder resolves every bare specifier, and every `pkg:` URL with `pkg:` removed, through esbuild's `build.resolve` with its stylesheet options (`conditions: ['style', 'sass', 'less', 'production' or 'development']`, `mainFields: ['style', 'sass']`, `resolveExtensions: []`, `src/tools/esbuild/stylesheets/bundle-options.js`), then falls back to the package root plus the deep path (`sass-language.js`). The core calls the same esbuild (the one `@angular/build` depends on) through a context whose plugin exposes `build.resolve`, which works outside a build. Probe with a package that has both a `style` and a `sass` field and no `exports`: the builder and the core took `style`; Sass's `NodePackageImporter`, which the spec names for `pkg:` URLs, took `sass`.
- `~`: the builder strips no `~` from Sass imports (its only `~` handling is for `url()` rebasing), so the spec's "a leading `~` stripped as the application builder strips it" would make the core accept what the build rejects.

Triage: impact MEDIUM (fixable in a patch release; wrong rules would make the file follow a different compile than the build), confidence HIGH (eight cases, the field probe, the error spans, and the builder's source). Outcome: text corrections S11 to S15.

### 4. The `CI=true` e2e (the typing decision's residual risk (b))

Verdict: passes as the spec says. From a committed, in-step file in `nx-ws` (`measure/q4-e2e.sh`, final run on the packed tarball):

1. `nx sync:check`: exit 0.
2. `warning` removed from `shop`'s `$button-palette`; `CI=true nx build shop`: exit 0. The built `styles.css` has no `.button.warning` rule (`--nfs-button-palette: primary secondary success alert purple`) while `main.js` carries `"warning"`: the Variant ships with no class.
3. `nx sync:check`: exit 1 (also under `CI=true`), printing `[ngx-foundation-sites:variant-types-sync]: ngx-foundation-sites: the Variant declaration files no longer match the Sass they are generated from.` and the M1 detail lines `apps/shop/src/nfs-variants.d.ts (shop, from apps/shop/src/styles.scss): NfsButtonPaletteOverrides: add warning: false (warning is not in --nfs-button-palette)` and the same for `libs/ui/src/nfs-variants.d.ts (ui, from apps/shop/src/styles.scss)`, since the shared library follows `shop:build`.
4. `nx sync`: exit 0, "The workspace was synced successfully!"; the diff adds `warning: false` to both files.
5. `nx build shop`: exit 1, `TS2322: Type '"warning"' is not assignable to type 'NfsButtonColor | undefined'` at `apps/shop/src/app/app.html:3:18`.

Also measured along the way: the setup generator is idempotent (a second run writes nothing), a library set up with `--buildTarget=shop:build` builds and tests against `shop`'s names, and `nx build ui` fails closed without its file.

Triage: impact HIGH (the reason `nx sync:check` is a required CI step), confidence HIGH (measured end to end). Outcome: no change.

### 5. Per-project registration and `targetDefaults`

Verdict: passes as the spec says. `measure/q5-target-defaults.cjs` rewrote `nx.json` and `apps/shop/project.json` per variant and read `nx show project shop --json` (marker inputs tell which key applied):

| Variant | `build` | `serve` | `test` |
| --- | --- | --- | --- |
| A. The preset's executor-keyed `@angular/build:application` entry (Nx 23.2.1's `angular-monorepo` preset writes one) + per-project spread | cache, `dependsOn: ["^build"]`, the executor key's inputs, our generator | our generator | our generator |
| B. Name-keyed `build`, `serve`, `test` defaults + per-project spread | cache, `dependsOn`, the name key's inputs, our generator | `dependsOn`, our generator | cache, inputs, our generator |
| C. Name-keyed defaults + executor-keyed entries adding the sync generator (no per-project entries) | cache only through a deprecated fallback; `dependsOn` and inputs gone | `dependsOn` gone | inputs gone |
| D. The preset's executor entry with the sync generator merged into it | all kept (that key already wins) | our generator | our generator |
| E. Name-keyed and executor-keyed together + per-project spread | the executor key's defaults | the name key's | the name key's |
| F. Another tool's executor-keyed `syncGenerators` (`@nx/js:typescript-sync`) + per-project spread | both generators | ours | ours |
| G. The same without the spread | ours only: the other tool's generator dropped | ours | ours |

Nx 23.2.1 warned only in C: "Target defaults resolve to a single key rather than merging, so an executor key hides the target name key entirely" and "reading it from the target name key is deprecated and will be removed in Nx 24". D shows that merging into an existing executor entry would also work for `build`, but it would edit a workspace-wide setting for one library's needs; per-project registration stays the rule.

Triage: impact MEDIUM, confidence HIGH (measured). Outcome: no change needed; S19 adds the measured facts.

### 6. The schematic, the check builder without `nx`, and Nx running the builder

Verdict: passes, with two text corrections for the generator and one simplification for the builder.

- `ng g ngx-foundation-sites:variant-types --npm-scripts` (`nx` and `@nx/devkit` 23.2.1 installed): exit 0; `angular.json` gained the `nfs-variants` target with `builder`, the file was written, and `prebuild`, `prestart`, `pretest` run `ng run cli-ws:nfs-variants`; the Angular CLI then formatted the edited `angular.json` with the workspace's Prettier (`@angular/cli` 22.2.0 `src/utilities/prettier.js`).
- `@nx/devkit`'s `getProjects` and `readProjectConfiguration` read the `angular.json` project, but `updateProjectConfiguration` on it wrote the project into the root `package.json`'s `nx` field (measured on an in-memory tree over `cli-ws`), so the generator edits `angular.json` with `updateJson` itself.
- `ng run cli-ws:nfs-variants:check`: exit 0 in step; after adding `teal` to the Sass, exit 1 with the M2 text (`src/nfs-variants.d.ts no longer matches src/styles.scss:`, `NfsButtonPaletteOverrides: add teal: true (teal is in --nfs-button-palette)`, "Run `ng run cli-ws:nfs-variants` to update it."); `npm run build` ran the builder first, which wrote `teal: true`, then built.
- After `npm uninstall nx @nx/devkit`: the check still exited 0 (2.4 s wall, 0.73 s of it the Sass compile); the schematic ended with M9: "ngx-foundation-sites: the schematic needs nx and @nx/devkit. Install them: npm install --save-dev nx @nx/devkit".
- `nx run shop:nfs-variants:check` (the package has `builders` and no `executors`): exit 0 in step (3.8 s wall); after adding `teal`, `CI=true` exit 1 with M2 and "Run `nx sync` or `nx run shop:nfs-variants` to update it."; write mode rewrote the file.
- Under Nx the setup generator's JSON edits came out unformatted until it called `formatFiles(tree)`.
- `context.getTargetOptions` already applies the target's `defaultConfiguration` when the `buildTarget` string names none (Architect 0.2202.0 `node-modules-architect-host.js` `getOptionsForTarget`), so the builder needs no metadata read for it.

Triage: impact MEDIUM (the Angular CLI setup path), confidence HIGH. Outcome: text corrections S16 to S18.

### Triage

| Item | Impact | Confidence | Outcome |
| --- | --- | --- | --- |
| 1. Dev-server re-check: `declare global {}` in the generated format | MEDIUM | HIGH | text correction S1 to S7 |
| 2a. Unit-test builders see the file and fail closed | LOW | HIGH | confirmed |
| 2b. Storybook checks no types; `tsc` over its configuration does | MEDIUM | HIGH | text correction S8, S10 |
| 2c. ng-packagr ignores `include`: `compilerOptions.types` for library builds | MEDIUM | HIGH | text correction S9 |
| 2d. Docgen skips aliases from declaration files | LOW | HIGH | text correction S10 |
| 3. Sass compiler, resolver, and `~` | MEDIUM | HIGH | text correction S11 to S15 |
| 4. `CI=true` e2e | HIGH | HIGH | confirmed |
| 5. Per-project spread against `targetDefaults` | MEDIUM | HIGH | confirmed; S19 |
| 6. Schematic, builder without `nx`, Nx running the builder | MEDIUM | HIGH | text corrections S16 to S18 |

No case needs a re-run of the spec: every failure is a rule the spec states in one place, corrected in place under the map's rule for a text correction the prototype's triage decides. Nothing is HIGH impact with NOT-HIGH confidence, so nothing is OPEN FOR HUMAN.

### Proposed changes to shared files

Paths are relative to the effort root; links inside each quoted text are relative to the file it goes into. "The prototype" in quoted texts is this ticket, linked by its title where a link is shown.

`specs/variant-declaration-tooling.md`:

- S1. User story 33, replace with: "33. As a developer running `ng serve` or `nx serve`, I want the dev server to re-check my templates after the Variant declaration file is rewritten, so that stale template errors in the terminal do not mislead me."
- S2. In both generated-file examples (API: the Variant declaration file, and Usage examples), append after the closing `}` of the `declare module` block a blank line, then `// Makes a running dev server re-check templates after every change to this file.` and `declare global {}`.
- S3. Format rules, insert after the bullet that begins "- A name is written as an identifier": "- Then a blank line, the comment `// Makes a running dev server re-check templates after every change to this file.`, and `declare global {}`. An empty global augmentation makes TypeScript's builder treat each change to the file as affecting every file (`isFileAffectingGlobalScope`, checked before its `isolatedModules` shortcut), and `@angular/build`'s dev server computes template diagnostics only for affected files, so every rewrite reaches the templates' diagnostics under `ng serve` and `nx serve` (measured by [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](../issues/137-prototype-variant-declaration-tooling.md), question 1; without it only the dev server's first incremental rebuild re-checks templates). The line is part of the rendered format, not of the compared model: a generated file without it is not rewritten for it alone, and the next rewrite adds it."
- S4. Ownership and reading, in the bullet that begins "- Anything the reader cannot model", replace "Comments and blank lines are ignored." with "Comments, blank lines, and an empty `declare global {}` are ignored."
- S5. Messages, M13 row, replace `"After the file changes while a dev server runs, restart the server."` with: `and, for each hand-written file it kept that has no global augmentation, "Add declare global {} to <file>, or restart the dev server after the file changes."`
- S6. Testing Decisions, workspace e2e, replace the bullet that begins "- Dev server:" with: "- Dev server: under `ng serve` and `nx serve`, five alternating rewrites of the generated file (a Sass edit, then `ng run <app>:nfs-variants` or `nx sync`) each change the template diagnostics (TS2322 appears and disappears), also after a component edit spent the first incremental rebuild; a file without `declare global {}` keeps its cached diagnostics in that case (the control)."
- S7. Design decisions, replace row D28 with: "| D28 | Dev server | The generated file ends with `declare global {}`, so every rewrite reaches the dev server's template diagnostics (measured by the prototype) | A restart note (the dev server re-checks templates after a rewrite only in its first incremental rebuild, when the placeholder type-check shims are replaced); a shipped watcher; a `/// <reference path>` from the entry file or a `files` entry (measured: neither changes which files are affected) |"
- S8. Problem Statement, replace the bullet that begins "- A shared library in an Nx workspace is compiled, tested, and shown in Storybook" with: "- A shared library in an Nx workspace is compiled, tested, and type-checked in programs that see no application's declaration file, so its own checks reject the names its applications use. Storybook's own compile checks neither templates nor story arguments, so only a type check of its TypeScript configuration sees a declaration file there."
- S9. Setup generator, replace step 4 with: "4. Make every TypeScript configuration of the project that type-checks it see the file: the `tsConfig` of each target the sync generator is registered on (below) and the project's Storybook TypeScript configuration when it has one. A configuration whose `include` or `files` already matches the file is left alone; the generator adds the file to `include` of any other and reports each edit. A library build target (`@nx/angular:package`, `@nx/angular:ng-packagr-lite`) is the exception: ng-packagr sets the program's root names to the entry file (ng-packagr 22.2.0 `src/lib/ts/tsconfig.js`), so `include` and `files` never reach it; the generator adds the file's path relative to that `tsConfig` (`./src/nfs-variants.d.ts`) to its `compilerOptions.types`, and only reports the edit when the configuration lists no `types`, since adding the option there would switch off automatic `@types` inclusion (measured by the prototype: the library build failed with TS2322 on a declared name while its `include` matched the file, and passed with the `types` entry, which the emitted typings do not reference). The Angular CLI and Nx application templates already include the file (`src/**/*.ts` in the application program, `src/**/*.d.ts` in the test program; verified by the typing decision and by the prototype's unit-test runs)."
- S10. Shared libraries (the shared-library rule), add after the bullet that begins "- Each application's own build stays the authority": "- Storybook: `@storybook/angular-vite` 10.6 compiles stories in JIT mode by default and reported no template diagnostics with `jit: false` either, so `storybook dev`, `storybook build`, and the `@storybook/addon-vitest` run neither check a Variant name nor fail without the file; a story's `args` are checked only by a type check of the Storybook TypeScript configuration (a `typecheck` target running `tsc -p .storybook/tsconfig.json`; measured: TS2322 on `color: 'purple'` without the setup's `include` edit, clean with it). Its docgen skips type aliases declared in declaration files, so a Variant input typed with an alias from the installed package gets no select control (a JSON editor), with or without the file; such a story lists `argTypes.<input>.options` itself. An alias declared in the project's own source gets an enum of its names, including names that a declaration file in the source tree adds (all measured by the prototype)."
- S11. The shared core, replace step 2 with: "2. Compile each source with the Sass compiler the application builder itself loads, resolved from `@angular/build`: `sass-embedded`, its dependency, or its pure-JS `sass` dependency when `NG_BUILD_SASS_EMBEDDED` is `0` or `false` (`@angular/build` 22.2.0 `src/utils/environment-options.js`), through `initAsyncCompiler()`, because the importer is asynchronous. Options: `style: 'expanded'`, the load paths, Sass warnings silenced (Foundation's `@import` and global-function deprecations), and the application builder's importer (`src/tools/esbuild/stylesheets/sass-language.js`): relative imports as Sass does them; every bare specifier, and every `pkg:` URL with `pkg:` removed, resolved from the importing file's directory by esbuild's resolver (the esbuild `@angular/build` depends on, called through a context whose plugin exposes `build.resolve`) with the builder's stylesheet options, `conditions: ['style', 'sass', 'less']` plus `production` or `development` by the build's style optimization, `mainFields: ['style', 'sass']`, and `resolveExtensions: []` (`src/tools/esbuild/stylesheets/bundle-options.js`), which is how `@import 'ngx-foundation-sites';` reaches the library's `_index.scss` through the `sass` export condition (ADR 0012); then the builder's deep-import fallback (the package root found through `<name>/package.json`, plus the rest of the path); then the load paths. There is no `~` handling and no Sass `NodePackageImporter`: the builder strips no `~` from Sass imports, and `NodePackageImporter` prefers a package's `sass` field where the builder takes `style` (both measured by the prototype, which found the core's properties equal to the built `styles.css` in eight cases)."
- S12. Implementation level and primitives, replace "the Sass JavaScript API (`compile`, importers, `NodePackageImporter`)" with "the Sass JavaScript API (`initAsyncCompiler`, `compileAsync`, a file importer), esbuild's `build.resolve` from the esbuild `@angular/build` depends on".
- S13. Design decisions, replace row D20 with: "| D20 | Sass resolution | The application builder's importer re-implemented over its own esbuild resolver and stylesheet options, compiled with the Sass compiler it loads (`sass-embedded`), confirmed by the prototype in eight cases | `@angular/build`'s private Sass service (not public API); Node resolution with Sass's `NodePackageImporter` and `~` stripping (both differ from the builder, measured) |"
- S14. Workspace configuration, in the Dependencies bullet, replace "`sass` and `typescript` (in every Angular workspace)" with "`sass-embedded` (or `sass`) and `esbuild`, both dependencies of `@angular/build`, and `typescript` (in every Angular workspace)".
- S15. The Nx task sync generator, in the bullet that begins "- What Nx does around it", replace "(0.2 to 0.4 s each, about 1.5 s with `foundation-everything`)" with "(0.6 to 0.8 s each with `foundation-everything` and `sass-embedded` on win32-arm64, measured by the prototype; the pure-JS `sass` asynchronous compiler took 8.5 to 9.5 s for the same compile)".
- S16. Setup generator step 2, append after "with `stylesheets` and `includePaths` in place of `buildTarget` when given.": " On the Angular CLI the generator edits `angular.json` itself: `@nx/devkit`'s `getProjects` and `readProjectConfiguration` read an `angular.json` project (with `builder` renamed to `executor`), but `updateProjectConfiguration` writes a project without a `project.json` into the root `package.json`'s `nx` field (measured by the prototype)."
- S17. Setup generator step 8, prepend: "Under Nx, format the edited files with `formatFiles` (Nx writes JSON unformatted; the Angular CLI formats a schematic's output with the workspace's Prettier itself, `@angular/cli` 22.2.0 `src/utilities/prettier.js`). Then print the summary (M13)" in place of "Print the summary (M13)".
- S18. The Architect builder, replace "(`context.getTargetOptions` with the configuration resolved from the target's metadata)" with "(`context.getTargetOptions`, which applies the configuration the `buildTarget` string names, else the target's `defaultConfiguration`: Architect 0.2202.0 `getOptionsForTarget`)".
- S19. Setup generator, at the end of the paragraph that begins "Why per-project registration and not `targetDefaults` keyed by executor", append: " Measured by the prototype with `nx show project --json`: per-project entries with the spread kept name-keyed defaults (`dependsOn`, `cache`, `inputs`), the executor-keyed `@angular/build:application` entry that Nx 23.2.1's `angular-monorepo` preset writes, another tool's executor-keyed `syncGenerators`, and the inferred Storybook targets; executor-keyed entries added for the sync generator dropped the name-keyed `dependsOn` and `inputs`, and Nx 23.2.1 warned that 'an executor key hides the target name key entirely'."

`adr/0040-variant-input-types.md`, Consequences, append:

- A1. "- 2026-09-28 ([Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](../issues/137-prototype-variant-declaration-tooling.md)): the dev server kept its template diagnostics after the declaration file changed because `@angular/build` recomputes template diagnostics only for files TypeScript's builder reports as affected, and a module augmentation that nothing imports affects only itself; its first rewrite was re-checked only because the first incremental rebuild replaces the placeholder type-check shims. The generated file therefore ends with an empty `declare global {}`, which makes every rewrite reach the template diagnostics under `ng serve` and `nx serve`; the restart advice applies only to a hand-written file without it. On the reopening condition: Vitest under `@angular/build:unit-test` and `@nx/angular:unit-test`, in jsdom and in browser mode, sees the file and fails closed without it; `@storybook/angular-vite` checks no template or story types in any mode, so Storybook neither sees nor needs the file, and a type check of its TypeScript configuration does. Neither reopens this decision."

`issues/136-spec-variant-declaration-tooling.md`, append after its Answer (the map's rule: the verdict of a failed case is appended to the spec ticket):

- A2. "### Prototype verdict, 2026-09-28

  [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](137-prototype-variant-declaration-tooling.md) passed questions 4 and 5 as specified. Questions 1, 2, 3, and 6 found rules the spec states wrongly, each corrected in place as a text correction by the prototype's triage: the generated file ends with `declare global {}` instead of a restart note (D28); Storybook type-checks nothing, and a library build needs the file in `compilerOptions.types` because ng-packagr ignores `include`; the core compiles with `sass-embedded` and resolves through the application builder's own esbuild options, without `~` stripping or `NodePackageImporter` (D20); the generator edits `angular.json` itself, formats its output under Nx, and the builder relies on Architect's default configuration. No re-run is needed."

`storybook-conventions.md`, in the bullet that begins "- `args` hold only the public API", append:

- A3. " Measured by [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](issues/137-prototype-variant-declaration-tooling.md): a Variant input typed with a registry-built alias declared in source (`NfsOverridableStringUnion<...>`, chained or not) gets an enum control of Foundation's default names from the docgen server, so this library's stories need no `argTypes` for it; the docgen server skips aliases declared in declaration files, so a consumer's story over an alias from the installed package gets no options."

`map.md`, Decisions so far, add:

- A4. "- [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](issues/137-prototype-variant-declaration-tooling.md) -- a stand-in package with the spec's tooling, packed and measured in Nx 23.2.1 and Angular CLI 22.2.0 workspaces: the `CI=true` hazard and its `nx sync:check` catch, and per-project `syncGenerators` with the spread against `targetDefaults`, measured as specified; the dev server re-checks templates after a rewrite only in its first incremental rebuild (template diagnostics follow TypeScript's affected files, and a module augmentation affects only itself), fixed by an empty `declare global {}` in the generated file; unit-test builders see the file and fail closed, Storybook type-checks nothing; ng-packagr needs the file in `compilerOptions.types`; the core compiles with `sass-embedded` through the builder's own esbuild resolver, without `~` or `NodePackageImporter`; the generator edits `angular.json` itself; text corrections to the spec, no re-run, nothing OPEN FOR HUMAN. Capture: [prototypes/variant-declaration-tooling/](prototypes/variant-declaration-tooling/README.md)."

### Files written

- This ticket (status and this Answer).
- [prototypes/variant-declaration-tooling/](../prototypes/variant-declaration-tooling/README.md): `README.md`, `package/` (the stand-in package and its tooling), `fixtures/` (the workspace files and the generated declaration files), `measure/` (the scripts), `results/` (the measured results).
