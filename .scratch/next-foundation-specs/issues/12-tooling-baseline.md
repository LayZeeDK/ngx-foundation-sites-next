# 12. Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest 5 browser mode

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

How do the latest Nx, Angular CLI, Storybook, and Vitest fit together for an Angular publishable library, so that every spec's Testing Decisions section names real seams and commands?

Answer: how `@nx/angular` 23.2 generates a publishable library and what test runner it configures by default; how `@angular/build:unit-test` runs Vitest 5 in browser mode with Playwright and what it cannot do; whether `@storybook/angular` 10.6 supports the Storybook Vitest addon (`@storybook/addon-vitest`) for Angular or still needs `@storybook/test-runner`; how play functions, `@storybook/addon-a11y`, and axe run in CI; how Nx runs Playwright e2e against a static Storybook build; TypeScript 7 support across Angular 22.2, Nx 23.2, and Vitest 5; and the state of `@analogjs/vitest-angular` versus the first-party builder.

Sources: npm registry metadata (`npm view <pkg> version peerDependencies`), the packages' own READMEs and docs in `node_modules` after `npm view` (or a throwaway `npm pack`), Nx docs via the `nx_docs` MCP tool, Angular docs in `d:/projects/github/angular/angular/adev/src/content/guide/testing/**`, Storybook docs at https://storybook.js.org/docs (markdown.new), Vitest docs at https://vitest.dev/guide/browser/. Do not install anything into this repo; use `D:/tmp/` for any throwaway workspace and delete it afterwards, or leave it and record its path.

## Deliverable

`research/tooling-baseline.md`: a version matrix with peer ranges, a recommended test pyramid (Storybook play functions, Vitest browser, Playwright e2e) with the command each runs under Nx, and a list of open incompatibilities. Cite URLs and paths. Plain ASCII.

## Answer

- The map's target row does not resolve: TypeScript 7.0.2 and Vitest 5.0.2 both fall outside peer ranges. Working set today: Angular 22.2.0, Nx 23.2.1, Storybook 10.6.0, Vitest 4.1.x, TypeScript 6.0.x, vite 8.3.1, Playwright 1.63.0.
- TypeScript 7: `@angular/compiler-cli` and `@angular/build` 22.2.0 peer on `typescript >=6.0 <6.1`; the `typescript@7.0.2` package ships native binaries and only `unstable/*` exports, no JS compiler API; Angular's roadmap says tsgo support is still being prototyped. Pin `~6.0.3`.
- Vitest 5: accepted by `@angular/build` (`^4.0.8 || ^5`) and Analog, refused by `@nx/vitest` (`^3 || ^4`), by `@nx/angular:library --unitTestRunner=vitest-angular` (throws on installed 5.x against its `^4.0.8` pin), and by `@storybook/addon-vitest` 10.6.0 (`^3 || ^4`, browser-playwright `^4`). Storybook 11.0.0-alpha.1 is the first to accept `^5`. Pin `~4.1.11`.
- `@nx/angular:library --publishable` on Angular >= 21 defaults to `unitTestRunner=vitest-angular`: `test` target = `@nx/angular:unit-test`, a thin wrapper over `@angular/build:unit-test` that maps `@nx/angular:package` to `@angular/build:ng-packagr`. No vite config file; options live on the target.
- `@angular/build:unit-test`: `browsers: ["chromiumHeadless"]` plus installed `@vitest/browser-playwright` + `playwright` gives real-browser Vitest; `CI=1` forces headless; `providersFile`, `setupFiles`, `runnerConfig`, coverage thresholds. Cannot: take test-only build options (use a build configuration), keep `test.projects`/`test.include` from a custom config, or host the Storybook Vitest project in the same run.
- Storybook 10.6 has two Angular frameworks. `@storybook/angular` (Webpack) has no addon-vitest support and its CI story is the superseded `@storybook/test-runner` 0.24.5. `@storybook/angular-vite` (preview, stable planned for 11; Angular >= 21, vite >= 8, Analog plugin) fully supports `@storybook/addon-vitest`, `addon-a11y` in CI, and exports `storybookAngularVitest()` from `@storybook/angular-vite/vitest` for standalone `vitest` runs. Recommendation: `@storybook/angular-vite`.
- Nx 23.2.1 generators only scaffold `@storybook/angular`, but `@nx/storybook/plugin` lists `@storybook/angular-vite` as a Vite framework and infers `storybook`, `build-storybook`, `static-storybook` (`@nx/web:file-server`, dependsOn build-storybook) and `test-storybook` = `vitest run --project=storybook --passWithNoTests` once the addon is registered. Setup: hand-write `main.ts`, then `npx storybook add @storybook/addon-vitest --config-dir <project-root>/.storybook` (the command nx.dev gives).
- axe in CI: `parameters.a11y.test: 'error'` in preview.ts; violations fail `nx test-storybook`. No axe in the Angular unit-test builder.
- Playwright e2e against the static build: `nx g @nx/playwright:configuration --project=<e2e> --webServerCommand="npx nx run <lib>:static-storybook" --webServerAddress=http://localhost:4400`; with `reuseExistingServer: true` and an `nx run` command Nx runs `static-storybook` as a task dependency and infers `e2e--wait-for-webserver`. Tests open `/iframe.html?id=<story-id>&viewMode=story`. Commands: `nx e2e`, `nx e2e-ci` (atomized).
- Pyramid: (1) `nx test-storybook` play functions + axe, (2) `nx test` browser-mode specs for logic stories cannot reach, (3) `nx e2e` for History, storage, viewport. Story ids are the shared seam between 1 and 3.
- Analog: `@analogjs/vitest-angular` 2.7.5 (builders `:test`, `:build-test`, `setup --browserMode`) already accepts Vitest 5 and Vite 8; Nx uses it only for non-buildable libs (`vitest-analog`). First-party builder wins for a publishable lib; Analog's Vite plugin is in the tree anyway as `@storybook/angular-vite`'s dependency.
- Surprises: `@storybook/angular-vite` exists and is the Storybook-recommended path for Angular 21+; Nx's `vitest-angular` generator hard-fails on Vitest 5; `@angular/aria` pins `@angular/cdk` exactly; Nx fresh-install pins Angular `~22.1.0`, bump to 22.2.0 by hand.
- Open: whether portable stories (`composeStories`) work under `@storybook/angular-vite` so builder specs could import stories (untested); Nx 23.3 beta peer ranges not checked; Nx docs MCP returned HTTP 500 all session, so Nx facts come from the 23.2.1 tarballs and nx.dev pages.

Findings: ../research/tooling-baseline.md
