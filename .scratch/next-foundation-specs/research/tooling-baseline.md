# Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest browser mode

Ticket: `../issues/12-tooling-baseline.md`
Researched: 2026-09-25 against the npm registry (`npm view`), the packages' own
tarballs (`npm pack` into the session scratchpad, nothing installed into this
repo), the local Angular clones, and the Storybook, Vitest and Nx docs fetched
through markdown.new. The Nx docs MCP tool answered HTTP 500 for every query
during this session, so Nx facts come from the `@nx/*` 23.2.1 tarballs
(generator schemas, plugin source, pinned versions) and nx.dev pages fetched
directly.

Headline: the map's target row cannot ship as written. TypeScript 7.0.2 is
rejected by Angular 22.2's peer range and has no JS compiler API, and Vitest
5.0.2 is rejected by both `@nx/vitest` 23.2.1 and `@storybook/addon-vitest`
10.6.0. The versions that fit together today are TypeScript 6.0.x, Vitest
4.1.x, Angular 22.2.0, Nx 23.2.1, Storybook 10.6.0 with the new
`@storybook/angular-vite` framework, Playwright 1.63.0.

## Version matrix

Latest published versions on 2026-09-25 (`npm view <pkg> version`), with the
peer ranges that matter for this stack (`npm view <pkg> peerDependencies`).

| Package | Latest | Relevant peer ranges (from the published package.json) |
| --- | --- | --- |
| `nx` | 23.2.1 | `@swc/core ^1.15.8` (optional), `@swc-node/register ^1.11.1` (optional). No TypeScript or Angular peer. `next` tag: 23.3.0-beta.5 |
| `@nx/angular` | 23.2.1 | `@angular/build >=20 <23`, `@angular-devkit/build-angular >=20 <23`, `ng-packagr >=20 <23`, `@schematics/angular >=20 <23`, `@nx/playwright 23.2.1`, `rxjs ^6.5.3 \|\| ^7.5.0`. Fresh-install pins in `dist/src/utils/versions.js`: `@angular/* ~22.1.0`, `ng-packagr ~22.1.0`, `zone.js ~0.16.2`, `vitest ^4.0.8`, `jsdom ^27.1.0` |
| `@nx/vite` | 23.2.1 | `vite ^5 \|\| ^6 \|\| ^7 \|\| ^8` |
| `@nx/vitest` | 23.2.1 | `vitest ^3.0.0 \|\| ^4.0.0` (optional), `vite ^5..^8`. Pins `vitest ~4.1.0`, `vite ^8.0.0`, `jsdom ^27.1.0`, `@analogjs/vitest-angular ~2.6.0` |
| `@nx/storybook` | 23.2.1 | `storybook >=8.0.0 <11.0.0`, `@nx/web 23.2.1` (optional). Pins `storybook ^10.5.0`, `@storybook/test-runner ^0.24.0` |
| `@nx/playwright` | 23.2.1 | `@playwright/test ^1.36.0` (optional). Pins `@playwright/test ^1.37.0` |
| `@angular/core` | 22.2.0 | `zone.js ~0.15.0 \|\| ~0.16.0` (optional), `rxjs ^6.5.3 \|\| ^7.4.0` |
| `@angular/cdk` | 22.2.0 | `@angular/core ^22 \|\| ^23`, `@angular/forms`, `@angular/common`, `@angular/platform-browser` same |
| `@angular/aria` | 22.2.0 | `@angular/cdk 22.2.0` (exact), `@angular/core ^22 \|\| ^23` |
| `@angular/compiler-cli` | 22.2.0 | `typescript >=6.0 <6.1` |
| `@angular/build` | 22.2.0 | `typescript >=6.0 <6.1`, `vitest ^4.0.8 \|\| ^5.0.0` (optional), `ng-packagr ^22.0.0` (optional), `karma ^6.4.0` (optional), `@angular/core ^22.0.0` |
| `@angular/cli` | 22.2.0 | (no peers listed) |
| `storybook` | 10.6.0 | `prettier ^2 \|\| ^3` (optional). `next` tag: 11.0.0-alpha.1 |
| `@storybook/angular` (Webpack 5) | 10.6.0 | `@angular/* >=18 <23`, `@angular-devkit/build-angular >=18 <23`, `storybook ^10.6.0`, `typescript ^4.9 \|\| ^5 \|\| ^6`, `zone.js >=0.14.0` (optional) |
| `@storybook/angular-vite` (Vite, preview) | 10.6.0 | `@angular/* >=21 <23`, `@angular/build >=21 <23`, `vite >=8.0.0`, `@analogjs/vite-plugin-angular >=2.0.0`, `typescript >= 5.9.x`, `storybook ^10.6.0`, `sass` / `sass-embedded ^1`, `zone.js >=0.14.0`. Depends on `@storybook/builder-vite 10.6.0` |
| `@storybook/addon-vitest` | 10.6.0 | `vitest ^3 \|\| ^4`, `@vitest/browser ^3 \|\| ^4`, `@vitest/browser-playwright ^4.0.0`, `storybook ^10.6.0`. (11.0.0-alpha.1 widens all three to `\|\| ^5`) |
| `@storybook/addon-a11y` | 10.6.0 | `storybook ^10.6.0` |
| `@storybook/test-runner` | 0.24.5 | `storybook ^10.x \|\| ^11.0.0-0` |
| `vitest` | 5.0.2 | `vite ^6.4.0 \|\| ^7 \|\| ^8` (required), `@vitest/browser-playwright 5.0.2`, `jsdom *`, `happy-dom *`. Other dist-tags: `V4` 4.1.11, `V3` 3.2.7 |
| `@vitest/browser-playwright` | 5.0.2 | `vitest 5.0.2` (exact), `playwright *` |
| `@analogjs/vitest-angular` | 2.7.5 | `vitest ^1.3.1 .. ^5.0.0`, `@angular-devkit/architect >=0.1700.0 <0.2300.0`, `@analogjs/vite-plugin-angular *` |
| `@analogjs/vite-plugin-angular` | 2.7.5 | `vite ^6 \|\| ^7 \|\| ^8`, `@angular/build ^18..^22` |
| `vite` | 8.3.1 | |
| `typescript` | 7.0.2 | dist-tags: `latest` 7.0.2, `beta` 6.0.0-beta, `next` 7.1.0-dev. 6.0.3 is what the Angular 22.2 clones develop against |
| `@playwright/test` / `playwright` | 1.63.0 | |
| `jsdom` | 30.1.1 | `canvas ^3.2.3` (optional) |

### What resolves cleanly

- Angular 22.2.0 with Nx 23.2.1: inside every `@nx/angular` peer range
  (`>=20 <23`). Nx's fresh-install pin is `~22.1.0`, so bump `@angular/*`,
  `ng-packagr` and `@angular/build` to `22.2.0` after `nx g @nx/angular:init`.
- Storybook 10.6.0 with Nx 23.2.1: inside `@nx/storybook`'s `>=8 <11`.
- `@storybook/angular-vite` 10.6.0 with Angular 22.2.0 and vite 8.3.1: inside
  its `>=21 <23` and `vite >=8` ranges.
- Playwright 1.63.0 with `@nx/playwright` (`^1.36.0`) and
  `@vitest/browser-playwright` (`*`).
- `@angular/aria` 22.2.0 pins `@angular/cdk` to exactly 22.2.0; keep the two in
  lockstep.

### Recommended pin set for the new repo

| Package | Pin | Why |
| --- | --- | --- |
| `typescript` | `~6.0.3` | Angular 22.2 peer `>=6.0 <6.1`; see TypeScript 7 below |
| `vitest`, `@vitest/browser-playwright`, `@vitest/coverage-v8` | `~4.1.11` | Only major inside every range: `@angular/build` (`^4.0.8 \|\| ^5`), `@nx/vitest` (`^3 \|\| ^4`), `@storybook/addon-vitest` (`^3 \|\| ^4`, browser-playwright `^4`) |
| `vite` | `^8.3.1` | `@storybook/angular-vite` needs `>=8`; Vitest 4.1 accepts `^8` |
| `@angular/*`, `@angular/build`, `ng-packagr` | `22.2.0` | Map target; inside Nx and Storybook ranges |
| `storybook`, `@storybook/angular-vite`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs` | `10.6.0` | Storybook keeps all its packages on one version |
| `@analogjs/vite-plugin-angular` | `^2.7.5` | Required peer of `@storybook/angular-vite` |
| `@playwright/test`, `playwright` | `1.63.0` | Single Playwright version shared by Vitest browser mode, Storybook and e2e |
| `jsdom` | `^27.1.0` (Nx pin) or `^30.1.1` | Only used when `browsers` is unset on the unit-test builder |

## Nx library generation

Source: `@nx/angular@23.2.1` tarball, `dist/src/generators/library/schema.json`
and `dist/src/generators/utils/add-vitest.js`; nx.dev
`docs/technologies/angular/introduction` ("Unit tests use Vitest on Angular 21
and later. Earlier versions use Jest.").

Generator: `@nx/angular:library`. The command for a publishable component
library with this repo's conventions:

```
npx nx g @nx/angular:library packages/ngx-foundation-sites \
  --name=ngx-foundation-sites \
  --publishable --importPath=ngx-foundation-sites \
  --prefix=nfs --style=scss \
  --unitTestRunner=vitest-angular \
  --linter=eslint --changeDetection=OnPush
```

Options that matter (schema text):

- `unitTestRunner`: enum `vitest-angular | vitest-analog | jest | none`.
  "`vitest-angular` uses the `@nx/angular:unit-test` executor (requires Angular
  v21+ and a buildable/publishable library). `vitest-analog` uses
  AnalogJS-based setup with `@nx/vitest`. It defaults to `vitest-angular` for
  buildable/publishable libraries on Angular >= 21.0.0, `vitest-analog` for
  non-buildable libraries on Angular >= 21.0.0, otherwise `jest`."
- `publishable` sets the build executor to `@nx/angular:package` (ng-packagr);
  `buildable` alone uses `@nx/angular:ng-packagr-lite`
  (`dist/src/generators/library/lib/add-project.js`).
- `compilationMode` defaults to `partial` for publishable libraries; `full` is
  refused for publishable.
- `changeDetection` defaults to `OnPush` on Angular >= 22 (`Eager` is 22+
  only).
- `linter` enum now includes `oxlint`. `enableTypedLinting` replaces
  `setParserOptionsProject` (removed in Nx 24).

What `vitest-angular` writes (`add-vitest.js`, `addVitestAngular`):

- `targets.test = { executor: '@nx/angular:unit-test', options: { watch: false } }`
  because the library generator passes `useNxUnitTestRunnerExecutor: true`
  (`library.js` line 98). `@nx/angular:unit-test` is a thin wrapper: it calls
  `executeUnitTestBuilder` from `@angular/build` and patches the builder
  context so the CLI builder accepts `@nx/angular:package` /
  `@nx/angular:ng-packagr-lite` in place of `@angular/build:ng-packagr`
  (`dist/src/executors/unit-test/unit-test.impl.js`). Its schema is the CLI
  schema plus `plugins` and `indexHtmlTransformer`, with `headless` gated to
  Angular >= 21.2 and `isolate` / `quiet` to Angular >= 22.
- A `targetDefaults` entry for that executor with `cache: true` and inputs
  `['default', '^production']`.
- `tsconfig.spec.json` with `types: ['vitest/globals']`, plus a
  `__screenshots__/` gitignore line (Vitest browser-mode screenshots).
- devDependencies `@angular/build`, `jsdom ^27.1.0`, `vitest ^4.0.8`.
- `validateVitestVersion` throws when an installed or declared `vitest` does
  not satisfy `^4.0.8`. A workspace that already has Vitest 5 fails this
  generator with "The installed vitest version "5.0.2" is not compatible with
  the version range Angular requires: "^4.0.8"". That message is Nx's pin, not
  Angular's; `@angular/build` 22.2.0 itself accepts `^5.0.0`.

The `vitest-analog` path instead runs `@nx/vitest:configuration
--uiFramework=angular --testEnvironment=jsdom --coverageProvider=v8` and adds
`@oxc-project/runtime` (needed by analog's downleveling of `@angular/*`
fesm2022 for Zone.js `fakeAsync`). It yields a `vite.config.mts` plus
`src/test-setup.ts` and the `@nx/vitest:test` executor. Nx docs list the
equivalent direct command: `nx g @nx/vitest:configuration
--project=my-angular-lib --uiFramework=angular`.

Target inference: `@nx/angular/plugin` reads `angular.json` (not
`project.json`) and recognises `@angular/build:unit-test` as a test target
(`dist/src/plugins/plugin.js`), adding `vitest` to external inputs and
`{ coverage: true }` to the help example. In a project.json workspace the
executor is written explicitly as above; there is no `vitest.config.ts` for
this path.

Other `@nx/angular` generators the specs will name: `directive`, `component`,
`library-secondary-entry-point`, `stories`, `component-story`,
`storybook-configuration`.

## Angular unit-test builder with Vitest browser mode

Sources: `d:/projects/github/angular/angular/adev/src/content/guide/testing/overview.md`
and `migrating-to-vitest.md` (release branch 22.2.x, version 22.2.0);
`d:/projects/github/angular/angular-cli/packages/angular/build/src/builders/unit-test/`
(`schema.json`, `runners/vitest/browser-provider.ts`,
`runners/dependency-checker.ts`; that clone is at 22.0.x, the npm 22.2.0
package carries the same option set).

Builder: `@angular/build:unit-test`, `runner` defaults to `vitest`
(`karma` is the other value). Options from `schema.json`:

- `buildTarget` (default `::development`), `tsConfig` (default
  `tsconfig.spec.json`), `include` (default `**/*.spec.ts`, `**/*.test.ts`),
  `exclude`, `filter` (regex on test names), `watch` (TTY default), `debug`,
  `ui`, `isolate` (default false "to align with the Karma/Jasmine
  experience"), `quiet`, `listTests`.
- `browsers: string[]`, `browserViewport: "WxH"`, `headless`. Browser names
  ending in `Headless` run headless; `CI=1` forces headless
  (`applyHeadlessConfiguration`). The provider is discovered by resolving
  `@vitest/browser-playwright`, then `-webdriverio`, then `-preview`
  (`findBrowserProvider`); with none installed the builder errors "The
  "browsers" option requires either "playwright" or "webdriverio" to be
  installed within the project". With Playwright, `CHROME_BIN` sets the
  Chromium executable, and `colorScheme: null` is passed so
  `prefers-color-scheme` follows the real browser.
- `providersFile` (default-exported provider array injected into TestBed),
  `setupFiles` (run after polyfills and TestBed init), `runnerConfig`
  (path, or `true` to search for `vitest-base.config.*`; `ng generate config
  vitest` writes one).
- `coverage`, `coverageInclude/Exclude`, `coverageReporters`,
  `coverageThresholds` (builder fails the run itself, since Vitest does not),
  `coverageWatermarks`, `reporters`, `outputFile`.

Commands (Nx wraps the same options):

```
npx nx test ngx-foundation-sites                          # jsdom, single run (watch:false)
npx nx test ngx-foundation-sites --browsers=chromiumHeadless
npx nx test ngx-foundation-sites --browsers=chromium --ui  # headed, Vitest UI
npx nx test ngx-foundation-sites --coverage
```

Put `"browsers": ["chromiumHeadless"]` in the target options so browser mode
is the default for this library; the whole point of the components is DOM,
focus and ARIA behaviour that jsdom does not implement. Install
`@vitest/browser-playwright` and `playwright` (peer of the provider), and run
`npx playwright install chromium --with-deps` in CI.

What the builder cannot do (from the docs and source):

- No test-specific build options on the test target. `polyfills`, `styles`,
  `assets` come from `buildTarget`; create a dedicated build configuration if
  tests need different ones (`migrating-to-vitest.md`, step 2).
- The CLI "will also override certain properties (`test.projects`,
  `test.include`) to ensure proper integration" of a `runnerConfig`
  (`overview.md`, Advanced Vitest configuration). So a Storybook `storybook`
  Vitest project cannot live in the same Vitest run as the builder's tests;
  Storybook's addon must run from its own `vitest.config.ts` (next section).
- Only `jsdom` and `happy-dom` are supported DOM emulators (happy-dom wins if
  both are installed).
- Zone.js helpers (`fakeAsync`, `flush`, `waitForAsync`) need
  `zone.js/plugins/vitest-patch` in the build target polyfills; the docs
  recommend native `async` plus Vitest fake timers instead. Angular 22 is
  zoneless by default, which is the map's preference anyway.
- The Angular team supports the builder options, not the contents of a custom
  `runnerConfig` or third-party Vite plugins loaded through it.
- Migration of Jasmine specs is a separate, experimental schematic
  (`ng g @schematics/angular:refactor-jasmine-vitest`); not relevant for a
  from-scratch repo.

## Storybook 10.6 for Angular: two frameworks

Sources: storybook.js.org `docs/get-started/frameworks/angular` (titled
"Angular (Webpack)") and `docs/get-started/frameworks/angular-vite`;
`@storybook/angular-vite@10.6.0` tarball (`package.json` exports,
`dist/node/vitest.d.ts`); `@storybook/addon-vitest@10.6.0` tarball
(`dist/postinstall.js`).

- `@storybook/angular` is the Webpack 5 framework. Its docs page now opens
  with: "If you are on Angular >= 21 and want faster builds and the Vitest
  addon, consider using `@storybook/angular-vite` instead." It has no
  `@storybook/addon-vitest` support, because the addon "requires a Vite-based
  Storybook framework" (vitest-addon page, "How it works"). Its test story
  for CI is `@storybook/test-runner`, whose docs page is titled "Test runner
  (Webpack)" and states "The test runner has been superseded by the Vitest
  addon".
- `@storybook/angular-vite` 10.6.0 is the Vite framework: "currently in
  preview and is planned to be marked stable in Storybook 11"; requirements
  "Angular >= 21, Vite >= 8"; "Full support for the Vitest addon and
  in-browser component testing"; "The Vite transform pipeline is powered by
  the AnalogJS Vite plugin". Authoring surface (`moduleMetadata`,
  `applicationConfig`, decorators, CSF 3) is identical, and "Existing stories
  migrate without changes". Docgen comes from the TypeScript sources on the
  server (`experimentalDocgenServer`, on by default); Compodoc is a
  deprecated-in-11 fallback. Known limitations: code snippets do not follow
  controls; an input typed `T | undefined` gets an object control (use `?`).
  Builders: `@storybook/angular-vite:start-storybook` and
  `:build-storybook`, which "do not take a `browserTarget`"; the plain
  Storybook CLI (`storybook dev` / `storybook build`) is the equal path.
- Vitest bridge: `@storybook/angular-vite/vitest` exports
  `storybookAngularVitest(options)` (`dist/node/vitest.d.ts`) which forwards
  Angular build options (`zoneless`, `styles`, `stylePreprocessorOptions`,
  `assets`, `tsConfig`, ...) through `STORYBOOK_ANGULAR_BUILDER_OPTIONS_JSON`
  so a standalone `vitest` run compiles stories the same way `storybook dev`
  does. `@storybook/addon-vitest`'s postinstall knows
  `SupportedFramework.ANGULAR_VITE` and injects
  `storybookAngularVitest({})` next to `storybookTest()` into the generated
  `vitest.config.ts`.

Decision for the specs: the new repo uses `@storybook/angular-vite`. It is the
only Angular framework that runs play functions, `addon-a11y` and coverage in
CI through Vitest, and it is what Storybook itself steers Angular 21+ projects
to. Its "preview" status is the one risk; the fallback is `@storybook/angular`
plus `@storybook/test-runner` 0.24.5, which still peers on Storybook 10.

Nx and `@storybook/angular-vite` (from the `@nx/storybook@23.2.1` and
`@nx/angular@23.2.1` tarballs):

- `@nx/angular:storybook-configuration` hard-codes `@storybook/angular`
  (`generate-storybook-configuration.js`), and `@nx/storybook:configuration`'s
  `uiFramework` enum lists `@storybook/angular` but not `@storybook/angular-vite`
  (`dist/src/generators/configuration/schema.json`). No Nx 23.2.1 generator
  writes an angular-vite `.storybook/main.ts`.
- `@nx/storybook/plugin` does recognise it: `VITE_BUILDER_FRAMEWORKS` includes
  `@storybook/angular-vite` (`dist/src/plugins/plugin.js` line 24). Because
  `frameworkIsAngular` is only true for `@storybook/angular`, the inferred
  targets for an angular-vite project are the generic ones: `storybook`
  (`storybook dev`, continuous), `build-storybook` (`storybook build`, cached,
  output `{projectRoot}/storybook-static`), `static-storybook`
  (`@nx/web:file-server` serving `storybook-static`, `dependsOn:
  build-storybook`, continuous), and `test-storybook`.
- `test-storybook` is inferred as `vitest run --project=storybook
  --passWithNoTests` (cwd = project root) when the framework is Vite-based,
  `@storybook/addon-vitest` resolves, and the project's `main.ts` registers
  the addon; otherwise as `test-storybook` (the test-runner) when
  `@storybook/test-runner` is installed.
- nx.dev `docs/technologies/test-tools/storybook/guides/storybook-interaction-tests`:
  "Storybook recommends `@storybook/addon-vitest` for Vite-powered frameworks.
  Nx doesn't configure it for you. Use Storybook 10 or later." and the exact
  command: `npx storybook add @storybook/addon-vitest --config-dir
  <project-root>/.storybook` run from the workspace root.

Setup sequence for the new repo:

```
npx nx g @nx/storybook:init                      # adds @nx/storybook/plugin to nx.json
# hand-write packages/ngx-foundation-sites/.storybook/main.ts with
#   framework: '@storybook/angular-vite', addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest']
npx storybook add @storybook/addon-a11y   --config-dir packages/ngx-foundation-sites/.storybook
npx storybook add @storybook/addon-vitest --config-dir packages/ngx-foundation-sites/.storybook
npx playwright install chromium --with-deps
```

The addon writes `packages/ngx-foundation-sites/vitest.config.ts` with a
`storybook` project: `plugins: [storybookAngularVitest({}), storybookTest({
configDir })]`, `test.browser: { enabled: true, headless: true, provider:
playwright({}), instances: [{ browser: 'chromium' }] }`, and
`setupFiles: ['.storybook/vitest.setup.ts']`. Pass `zoneless: true` and the
Foundation `styles` / `stylePreprocessorOptions` to `storybookAngularVitest`
so standalone runs match `storybook dev`.

Storybook 10 test API (`docs/writing-tests/interaction-testing`): `play:
async ({ canvas, userEvent, args, step }) => ...`; `expect` and `fn` come from
`storybook/test`; `canvas` and `userEvent` are play-function parameters, so the
`within(canvasElement)` form from Storybook 8 is no longer needed.

## Accessibility checks in CI

Source: storybook.js.org `docs/writing-tests/accessibility-testing`.

- `@storybook/addon-a11y` runs axe-core with WCAG 2.0/2.1 A+AA and
  best-practice rules by default; the `region` rule is disabled for stories.
- `parameters.a11y.test` decides CI behaviour: `'error'` fails the Vitest test
  (or test-runner) on violations, `'todo'` reports without failing, `'off'`
  skips. Set `a11y: { test: 'error' }` in `preview.ts` `parameters` so every
  story is axe-clean by default, and override per story only for documented
  anti-pattern demos (`globals.a11y.manual = true` disables automatic runs).
- "In CI, accessibility tests are run automatically for stories with
  `parameters.a11y.test = 'error'` when you run the Vitest tests", so
  `nx test-storybook` is the axe gate; there is no separate command.
- `parameters.a11y.context` / `config` / `options` map to axe's `context`,
  `axe.configure`, and `axe.run` options; `runOnly` can widen to WCAG 2.2 AA.
- The Angular unit-test builder has no axe integration; keep axe in the
  Storybook layer.

## Recommended test pyramid and Nx commands

| Layer | What it covers | Runner | Nx target and command | CI needs |
| --- | --- | --- | --- | --- |
| 1. Story play functions (primary) | Rendering under Foundation CSS, keyboard and pointer interaction, ARIA state, axe per story | `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless, via `@storybook/angular-vite` | inferred `test-storybook`: `npx nx test-storybook ngx-foundation-sites` (= `vitest run --project=storybook --passWithNoTests`); `--coverage` for story coverage | `CI=1`, Playwright Chromium installed (`mcr.microsoft.com/playwright:v1.63.0-noble` image or `npx playwright install chromium --with-deps`) |
| 2. Directive and service specs | Logic that stories do not reach: signal derivations, DI tokens, host bindings, MediaQuery and Timer style services, edge cases | `@angular/build:unit-test` (through `@nx/angular:unit-test`) on Vitest 4.1 browser mode, Playwright Chromium headless; jsdom only for pure functions | explicit `test` target: `npx nx test ngx-foundation-sites` with `"browsers": ["chromiumHeadless"]` in options; `--coverage --coverageThresholds` for gates | same Playwright install; `@vitest/browser-playwright` + `playwright` in devDependencies |
| 3. Playwright e2e | Web-native APIs Storybook's iframe cannot assert: History and hash (Magellan, deep links), `localStorage`, viewport breakpoints (ResponsiveMenu, Interchange), page reload, focus return across navigations | `@playwright/test` 1.63 against the static Storybook build | `npx nx e2e ngx-foundation-sites-e2e` (full suite) / `npx nx e2e-ci ngx-foundation-sites-e2e` (atomized, one task per spec) | `static-storybook` runs as a task dependency; browsers from `npx playwright install --with-deps` |

Story ids are the shared seam: layer 1 runs the story, layer 3 opens
`/iframe.html?id=<story-id>&viewMode=story` on the served build. Every spec's
Testing Decisions section should name the story ids it relies on so both
layers point at one artifact.

Playwright e2e setup (from `@nx/playwright@23.2.1`
`dist/src/generators/configuration/schema.json` and
`files/playwright.config.mts.template`, and nx.dev
`docs/technologies/test-tools/playwright/introduction`):

```
npx nx g @nx/playwright:configuration \
  --project=ngx-foundation-sites-e2e \
  --webServerCommand="npx nx run ngx-foundation-sites:static-storybook" \
  --webServerAddress="http://localhost:4400"
```

- The generator writes `playwright.config.mts` (ESM on purpose) using
  `nxE2EPreset(import.meta.dirname, { testDir: './e2e' })`, `baseURL` from
  `BASE_URL` or the given address, and a `webServer` block with
  `reuseExistingServer: true` and `cwd: workspaceRoot`.
- Nx docs: when `webServer.command` is `nx run <project>:<target>` (optionally
  prefixed by `npx`) with no extra arguments and `reuseExistingServer` is
  `true`, Nx runs that target as a dependency of `e2e` and `e2e-ci` and infers
  `e2e--wait-for-webserver` from the `url`/`port`. "Set it to `true` instead
  [of `!process.env.CI`], since Nx already runs the web server as a task
  dependency."
- `static-storybook` is `@nx/web:file-server` with `buildTarget:
  build-storybook` and `staticFilePath: <projectRoot>/storybook-static`, so
  `nx e2e` builds Storybook, serves the static output, waits for the port,
  then runs Playwright. Pass `port: 4400` in the target options (or set the
  address to the file-server's default) so the config and target agree.
- Locators: `page.getByRole(...)` and `getByTestId(...)` as this repo's
  AGENTS.md already prescribes; Angular Aria adds `role` and `aria-*` at
  runtime, so inspect the rendered DOM before choosing them.

Optional layer 0: `vitest` in Node (`browsers` unset, jsdom) for pure helpers
such as option parsing or class-name mapping. Same `nx test` target; put
Node-only specs behind a second build configuration only if their setup
diverges.

## TypeScript 7

- `typescript@7.0.2` on npm depends only on `@typescript/typescript-<platform>`
  native binaries, exposes `bin/tsc`, and its `exports` map is `"."`:
  `./lib/version.cjs` plus `./unstable/{fs,ast,sync,async,proto,...}`. There
  is no stable `typescript` JS compiler API in the package.
- `@angular/compiler-cli@22.2.0` and `@angular/build@22.2.0` peer on
  `typescript >=6.0 <6.1`; the 22.2.x clones develop against `typescript
  6.0.3` (`d:/projects/github/angular/angular/packages/compiler-cli/package.json`
  lines 43 and 48). Angular's compiler is a TypeScript-API program, so the
  peer range is a hard limit, not a warning.
- `adev/src/content/reference/roadmap.md` (22.2.x): "Angular has perhaps one
  of the deepest integrations with the TypeScript compiler, which will require
  bigger architectural changes to support new tsgo-based workflows ... We're in
  the process of prototyping and exploring what this support would look like".
  No Angular release, including `@angular/compiler-cli@next` (22.2.0-rc.0,
  same `>=6.0 <6.1` range), supports TypeScript 7.
- `@storybook/angular` peers on `typescript ^4.9 || ^5 || ^6`;
  `@storybook/angular-vite` says `>= 5.9.x`, which is moot without Angular.
- Nx 23.2.1 declares no TypeScript peer. Vitest compiles TS through Vite's
  transformer and does not need the TypeScript package at test time.

Verdict: the new repo pins `typescript ~6.0.3` and revisits TS 7 when
`@angular/compiler-cli` widens its peer range. The map's "typescript 7.0.2"
target row should be corrected.

## Vitest 5

- `vitest@5.0.2` is `latest` (V4 line: 4.1.11). `@angular/build@22.2.0` peers
  `vitest ^4.0.8 || ^5.0.0`, so the CLI builder itself is Vitest 5 ready.
- `@nx/vitest@23.2.1` peers `vitest ^3.0.0 || ^4.0.0` and pins `~4.1.0`;
  `@nx/angular@23.2.1` pins `^4.0.8` and its `vitest-angular` generator throws
  on an installed 5.x (`validateVitestVersion`). Nx `next` is 23.3.0-beta.5;
  its ranges were not checked.
- `@storybook/addon-vitest@10.6.0` peers `vitest ^3 || ^4` and
  `@vitest/browser-playwright ^4.0.0`; `@vitest/browser-playwright@5.0.2`
  peers `vitest 5.0.2` exactly. `@storybook/addon-vitest@11.0.0-alpha.1` is
  the first to add `|| ^5.0.0`.
- `@analogjs/vitest-angular@2.7.5` and `@analogjs/vite-plugin-angular@2.7.5`
  already accept Vitest 5 and Vite 8.

Verdict: Vitest 4.1.x until Storybook 11 ships and Nx widens `@nx/vitest`.
The specs' Testing Decisions should say "Vitest browser mode" without a major,
and this document carries the pin.

## `@analogjs/vitest-angular` versus the first-party builder

Sources: `@analogjs/vitest-angular@2.7.5` tarball (`README.md`,
`builders.json`), `@nx/angular` `add-vitest.js`.

- Analog ships two builders, `@analogjs/vitest-angular:test` (Vite plugin
  pipeline through `@analogjs/vite-plugin-angular`) and `:build-test` (bundles
  with the Application builder first), plus a `setup` schematic with
  `--browserMode` that installs Playwright and configures browser mode. Its
  `setupTestBed({ zoneless: true, providers, teardown, errorOnUnknownElements,
  errorOnUnknownProperties })` gives per-workspace TestBed defaults, and it
  ships snapshot serializers.
- It needs a real `vite.config.mts` and `src/test-setup.ts`, supports
  `globals: true` for Zone.js `fakeAsync`, and pulls `@oxc-project/runtime`
  when used through Nx (`add-vitest.js` comment: analog downlevels
  `@angular/*` fesm2022 to es2016 so Zone.js can intercept async/await).
- Nx 23.2.1 picks it only for non-buildable libraries (`vitest-analog`) and
  pins `~2.6.0`. The first-party builder is the Nx default for
  buildable/publishable libraries on Angular >= 21, has the Angular team behind
  its option surface, needs no Vite config, and reuses the library's real
  ng-packagr build options.
- `@storybook/angular-vite` depends on `@analogjs/vite-plugin-angular` for its
  own Vite pipeline, so the Analog plugin is in the tree regardless; only the
  test builder choice is open.

Verdict: `@angular/build:unit-test` (via `@nx/angular:unit-test`) for the
library's own specs; Analog's builder is the fallback if a spec needs a Vite
plugin the CLI builder's `runnerConfig` cannot load.

## Open incompatibilities and gaps

1. TypeScript 7.0.2 is unusable with Angular 22.2 (peer `>=6.0 <6.1`; no JS
   API in the package). Pin `~6.0.3`. Source: registry `peerDependencies`,
   `typescript@7.0.2` `exports`, Angular roadmap.
2. Vitest 5.0.2 is refused by `@nx/vitest` 23.2.1 (`^3 || ^4`), by
   `@nx/angular`'s generator (`^4.0.8` check), and by `@storybook/addon-vitest`
   10.6.0 (`^3 || ^4`, browser-playwright `^4`). Pin `~4.1.11`. Unblocks with
   Storybook 11 (`addon-vitest@11.0.0-alpha.1` accepts `^5`) and a later Nx.
3. `@storybook/angular-vite` is preview until Storybook 11; no Nx 23.2.1
   generator scaffolds it (both `storybook-configuration` generators emit
   `@storybook/angular`), though `@nx/storybook/plugin` infers targets for it.
   Hand-write `main.ts` and use `npx storybook add`.
4. The Angular unit-test builder overrides `test.projects` and `test.include`,
   so the Storybook Vitest project and the library specs are two separate
   Vitest invocations (`nx test-storybook`, `nx test`). They share Playwright
   Chromium and story ids, not a config file. Whether portable stories
   (`composeStories`) work under `@storybook/angular-vite` so a builder spec
   could import a story was not verified; leave it out of the specs until
   tested.
5. Nx's fresh-install Angular pin is `~22.1.0`; bump to 22.2.0 by hand after
   `nx g @nx/angular:init` (peer ranges allow it).
6. `@angular/aria` requires `@angular/cdk` at the exact same version.
7. `jsdom` is only used when `browsers` is unset; Nx pins `^27.1.0`, npm
   latest is 30.1.1. Either works with Vitest (`jsdom *`).
8. The `@storybook/test-runner` path (Webpack framework) still works on
   Storybook 10 (`0.24.5` peers `^10`), requires a served Storybook
   (`http-server storybook-static --port 6006` + `wait-on`, or `--url`), and
   has no axe unless `axe-playwright` is added in `test-runner.ts`. Keep as
   fallback only.
9. Nx docs MCP was unavailable (HTTP 500) throughout; everything Nx here is
   from the published tarballs and nx.dev pages, both cited inline.

## Paths and URLs consulted

- Registry: `npm view <pkg> version peerDependencies peerDependenciesMeta`
  for every package in the matrix; `npm view <pkg> dist-tags` for nx,
  storybook, vitest, typescript, `@angular/compiler-cli`.
- Tarballs unpacked under the session scratchpad
  (`.../scratchpad/pkgs/`): `@nx/angular@23.2.1`, `@nx/vitest@23.2.1`,
  `@nx/storybook@23.2.1`, `@nx/playwright@23.2.1`,
  `@storybook/angular@10.6.0`, `@storybook/angular-vite@10.6.0`,
  `@storybook/addon-vitest@10.6.0`, `@storybook/test-runner@0.24.5`,
  `@analogjs/vitest-angular@2.7.5`. No throwaway workspace under `D:/tmp/`
  was needed.
- `d:/projects/github/angular/angular/adev/src/content/guide/testing/overview.md`,
  `migrating-to-vitest.md`; `adev/src/content/reference/roadmap.md`;
  `packages/compiler-cli/package.json`.
- `d:/projects/github/angular/angular-cli/packages/angular/build/src/builders/unit-test/schema.json`,
  `runners/vitest/browser-provider.ts`, `runners/vitest/executor.ts`,
  `runners/dependency-checker.ts` (clone at 22.0.x).
- https://storybook.js.org/docs/get-started/frameworks/angular
- https://storybook.js.org/docs/get-started/frameworks/angular-vite
- https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
- https://storybook.js.org/docs/writing-tests/integrations/test-runner
- https://storybook.js.org/docs/writing-tests/accessibility-testing
- https://storybook.js.org/docs/writing-tests/interaction-testing
- https://storybook.js.org/docs/writing-tests/in-ci
- https://vitest.dev/guide/browser/
- https://nx.dev/docs/technologies/angular/introduction
- https://nx.dev/docs/technologies/test-tools/vitest/introduction
- https://nx.dev/docs/technologies/test-tools/storybook/introduction
- https://nx.dev/docs/technologies/test-tools/storybook/guides/storybook-interaction-tests
- https://nx.dev/docs/technologies/test-tools/playwright/introduction
