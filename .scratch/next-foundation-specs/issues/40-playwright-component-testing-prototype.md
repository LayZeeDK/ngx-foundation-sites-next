# 40. Prototype: Playwright component tests mounting CSF stories from @storybook/angular-vite

Type: prototype
Status: resolved
Blocked by: 39
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does a working Playwright component test setup exist for an Angular 22.2 library on Nx 23.2, and can it mount the same CSF stories that `@storybook/angular-vite` 10.6 renders and that `@storybook/addon-vitest` runs as interaction tests? The user requires an identified working solution; only a running prototype can answer this.

Build a throwaway workspace under `D:/tmp/nfs-ct-prototype/` (never inside this repo): `npx create-nx-workspace@latest` with the Angular preset at the versions in map.md (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x), one publishable library with one small directive (a class-toggling disclosure directive with an `input()`, a `model()`, and an `output()`, styled by a plain CSS class), one CSF story file with a play function, `@storybook/angular-vite` with `@storybook/addon-vitest` and `@storybook/addon-a11y`.

Then, in the order the research ticket recommends, try each candidate: install it, mount the directive's host component directly, then mount the composed story (portable stories), run one interaction assertion and one axe check, and record for each candidate: install result, mount result, story reuse result, exact errors, and the files and commands used. Stop at the first candidate that fully works, but record at least the first two outcomes. Also run the same story through `nx test-storybook` (Vitest addon) and through a Vitest Browser unit test so the three paths can be compared on the same story.

Capture the prototype: leave the workspace in place, list its path and the working files in the answer, and copy the decisive files (Playwright CT config, the test that mounts the story, the adapter or hook code, the package manifest) into `prototypes/playwright-ct/` inside the effort directory so the decision ticket and the new repo can read them without the workspace.

## Answer format

Under `## Answer`: a results table (candidate, installs, mounts component, mounts story, interaction, axe, verdict), the winning setup step by step, the failures with their exact error text, timing per run, and an honest "what this does not prove" list. Mark anything you could not resolve as `OPEN FOR HUMAN`.

## Answer

Verdict: **a working Playwright component test solution exists, and it mounts the same CSF stories.** Playwright 1.63's built-in `mount(storyId, props)` fixture (plain `@playwright/test`, the framework-agnostic model from Playwright 1.62) uses the static `@storybook/angular-vite` 10.6 build as its gallery page. A project-owned file, `.storybook/playwright-gallery.ts` (147 lines with comments), answers `window.mount` / `window.unmount` by driving Storybook's own preview, so a story renders through exactly the code path that `nx test-storybook` and the e2e layer use. All 23 candidate-1 tests pass in Chromium, Firefox, and WebKit on Windows 11 arm64. None of the three community packages works next to `@playwright/test` 1.63.0.

Workspace: `D:/tmp/nfs-ct-prototype/` (left in place). Decisive files: [prototypes/playwright-ct/](../prototypes/playwright-ct/README.md), mirrored at their workspace paths.

### Results table

Order: the research's three candidates first ([Playwright component testing options for Angular 22.2](39-playwright-component-testing-research.md)), then the three packages it ranked as not candidates, which the map's Testing rule names.

| Candidate | Installs | Mounts component | Mounts story | Interaction | Axe | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 1. Built-in `mount` + Storybook iframe as gallery (Playwright framework-agnostic CT) | Yes. No adapter package; `@axe-core/playwright` 4.13.0 only for the second axe check | Yes, as a `component:` story (`NfsDisclosureHost` from args). No story-free mount | Yes. `disclosure--default` and `disclosure--on-button` rendered by Storybook itself; play functions reusable (no `embed=true`) | Yes: click, `aria-expanded`, `is-active`, panel visible; `update(props)` keeps Angular state; function props reach Node | Yes, two ways: addon-a11y's own run through `storyFinished` (a violation rejects `mount()`), and `@axe-core/playwright` after the click | **Works. Winner.** 23/23 in Chromium, Firefox, WebKit |
| 2. Built-in `mount` + Angular-native Vite gallery (`*.story.ts`) | Yes (Vite and the Analog plugin are already in the tree) | Yes: `createComponent`, `setInput`, output subscription, `update()` keeps state | No (stories written twice by design) | Yes | Yes, `@axe-core/playwright` only | Works; no CSF reuse. 4/4 |
| 3. Built-in `mount` + portable-stories Vite gallery (`composeStory`) | Yes | Yes (component story) | Yes, but `update()` re-bootstraps (state lost: `aria-expanded` back to `false`) | Yes; play functions reusable (`?play`) | Yes: addon-a11y report from `composed.reporting` plus `@axe-core/playwright` | Works with three workarounds (failures 7 and 8, plus the `STORYBOOK_ANGULAR_OPTIONS` define). 7/7 |
| 4. `@sand4rt/experimental-ct-angular` 1.61.1 | No: ERESOLVE (peer Angular `^20.3.11`). With `--legacy-peer-deps`: yes, brings Playwright 1.61.1, ct-core 1.61.1, Vite 6.4.3 | Yes on its own Playwright 1.61.1: class mount, signal input, `model()`, output, `update()` keeps state, zoneless | No (class mount only; the play function cannot run from the Node test body) | Yes | Yes (`@axe-core/playwright` on playwright-core 1.61.1) | Works only in isolation on an old Playwright; next to `@playwright/test` 1.63.0 no test loads. Not viable |
| 5. `@jscutlery/playwright-ct-angular` 0.10.10 | No: ERESOLVE (peer Angular `<22.0.0`). With `--legacy-peer-deps`: yes (Playwright 1.47.1, Vite 5.4.21); `"type": "module"` breaks config loading | No: NG0950 on every `input.required` under its SWC compile path | No | n/a | n/a | Fails |
| 6. `@playwright-labs/selectors-angular` 1.1.1 | No: ERESOLVE (exact peer `@playwright/test` 1.57.0). With `--legacy-peer-deps`: yes | Not a mount; used on top of candidate 1's `mount` | n/a | `$ng('nfs-disclosure-host').signal('expanded')` and `.input('label')` work in Storybook dev; the `angular=` selector engine throws; nothing works on the static build (no `ng.getComponent`) | n/a | Not a component testing solution; partial debugging aid in development builds only |

### The same stories through the three paths

| Path | Command | Result | Wall time (Nx cache off) |
| --- | --- | --- | --- |
| addon-vitest | `npx nx test-storybook ui` | 2 passed (play function plus addon-a11y gate per story) | 9.7 s (Vitest 3.6 s) |
| Vitest Browser, Angular unit-test builder, portable stories | `npx nx test ui --browsers=chromiumHeadless` | 3 passed (both stories' play functions plus addon-a11y report, plus an axe control) | 6.8 s (Vitest 2.8 s) |
| Playwright CT, candidate 1, Chromium | `npx nx e2e ui-ct -- --project=components --project=stories-play` | 9 passed | 28.8 s, of which `build-storybook` 4.5 s, Playwright 5.6 s |
| Playwright CT, candidate 1, all browsers | `npx nx e2e ui-ct` | 23 passed | 2 min 29 s; Firefox and WebKit tests take 3 to 21 s each against 0.5 to 2 s in Chromium, 6 workers |
| Playwright CT, candidates 2 and 3 | `npx nx e2e ui-ct-gallery` | 11 passed | 18.2 s (Vite dev server start included) |
| sand4rt spike | `npx playwright test -c playwright-ct.config.mts` | 3 passed | 12.2 s first run (Vite build), 4.9 s warm |

Positive controls, each run once and reverted: an unnamed-button story fails `nx test-storybook` with `Buttons must have discernible text (button-name)`; a story whose play function looks for the wrong name fails the Vitest Browser spec (`TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "Details"`) and rejects candidate 1's `mount()` (`Story "disclosure--play-control" failed: playFunctionThrewException {"name":"TestingLibraryElementError",...}`).

### Winning setup, step by step

1. Workspace (run with the agent marker unset, see failure 1): `env -u CLAUDECODE -u CLAUDE_CODE npx -y create-nx-workspace@23.2.1 nfs-ct-prototype --preset=angular-monorepo --appName=demo --style=css --bundler=esbuild --e2eTestRunner=none --unitTestRunner=vitest --ssr=false --zoneless=true --prefix=nfs --linter=none --formatter=prettier --aiAgents=none --nxCloud=skip --skipGit --interactive=false --packageManager=npm --workspaces=false`.
2. The preset pins `@angular/*` `~22.1.0`. Set every `@angular/*`, `@angular-devkit/*`, `@schematics/angular` and `ng-packagr` to `22.2.0` in `package.json`, delete `package-lock.json` and `node_modules`, `npm install` (an in-place bump fails, see failure 2).
3. `npx nx g @nx/angular:library packages/ui --name=ui --publishable --importPath=@nfs/ui --prefix=nfs --style=css --unitTestRunner=vitest-angular --linter=none`.
4. `npm i -D -E storybook@10.6.0 @storybook/angular-vite@10.6.0 @storybook/addon-vitest@10.6.0 @storybook/addon-a11y@10.6.0 @analogjs/vite-plugin-angular@2.7.5 vite@8.3.1 vitest@4.1.11 @vitest/browser@4.1.11 @vitest/browser-playwright@4.1.11 playwright@1.63.0 @playwright/test@1.63.0 @nx/storybook@23.2.1 @nx/playwright@23.2.1 @nx/vite@23.2.1 @angular/animations@22.2.0 @angular-devkit/architect@0.2202.0 @axe-core/playwright@4.13.0`. (`@angular/animations` and `@angular-devkit/architect` are non-optional peers of `@storybook/angular-vite`, pinned so npm does not pick versions.)
5. `npx nx g @nx/storybook:init` and `npx nx g @nx/playwright:init`; hand-write `packages/ui/.storybook/main.ts` (framework `@storybook/angular-vite`, addon a11y) and `preview.ts` (`parameters.a11y.test: 'error'`, the CSS import); then `npx storybook add @storybook/addon-vitest --config-dir packages/ui/.storybook --yes` writes `packages/ui/vitest.config.ts` and adds the addon to `main.ts`. Nx now infers `storybook`, `build-storybook`, `static-storybook`, `test-storybook`.
6. The adapter: `packages/ui/.storybook/playwright-gallery.ts`, installed by calling `installPlaywrightGallery()` from `preview.ts` (not a bare side-effect import, see failure 5), plus a `previewHead` stub in `main.ts` that defines `window.mount` / `window.unmount` before Storybook loads `preview.ts` (failure 4). `window.mount({ story, props })` waits for `__STORYBOOK_PREVIEW__.storeInitializationPromise`, wraps `#storybook-root` in a `<div id="root">` (the fixture locates `#root`; story DOM is untouched), emits `setCurrentStory`, settles on `storyFinished` for that id, then, if props were given, emits `updateStoryArgs` and settles on `storyArgsUpdated`. It rejects on `storyMissing`, `storyErrored`, `storyThrewException`, `playFunctionThrewException`, and on `storyFinished` with status `error`, which is how a failed addon-a11y report (it runs in the story's `afterEach`, in the browser too) surfaces.
7. `packages/ui/project.json`: `"static-storybook": { "options": { "port": 4410 } }`.
8. A separate Nx project `packages/ui-ct` (`project.json` with `implicitDependencies: ["ui"]`), then `npx nx g @nx/playwright:configuration --project=ui-ct --directory=src --webServerCommand="npx nx run ui:static-storybook" --webServerAddress="http://localhost:4410"`; edit `playwright.config.mts` to projects `components` (`baseURL: .../iframe.html?embed=true`, which turns off play-function autoplay) and `stories-play` (`baseURL: .../iframe.html`).
9. Specs import `test` and `expect` from `@playwright/test` and call `mount('disclosure--default', props?)`. `npx nx e2e ui-ct` runs `ui:build-storybook`, `ui:static-storybook` and `e2e--wait-for-webserver` as inferred dependencies, and `e2e-ci--<file>` targets are inferred per spec file.

Facts the prototype settled (open questions of the research ticket):

- `updateStoryArgs` in a manager-less iframe re-renders; `storyArgsUpdated` is emitted after the re-render completes; the Angular renderer keeps component state (`aria-expanded` stayed `true` after `update({ label })`).
- The first `mount(id, props)` renders with the story's args, then applies props through `updateStoryArgs`.
- `build-storybook` output runs Angular in production mode: `window.ng` holds a single key, Angular's private JIT compiler facade (named `compilerFacade` with the U+0275 private-API prefix), and no `getComponent`.
- `@axe-core/playwright` 4.13.0 peers `playwright-core >= 1.0.0` and works on 1.63.0 and 1.61.1.
- Story ids are Storybook ids (`disclosure--default`). The typed `Stories` registry was not generated.
- Portable stories do work under `@storybook/angular-vite` 10.6 in the Angular unit-test builder, which [the tooling baseline](12-tooling-baseline.md) left unverified, with three workarounds: define `globalThis.STORYBOOK_ANGULAR_OPTIONS`, declare `*.css` modules for TypeScript 6, and cast the core `composeStory` types.
- Correction to the research: `@playwright/experimental-ct-core` 1.61.1 depends on `vite ^6.4.1` (installed 6.4.3), not `^8.1.0`.

### Failures with exact error text

1. `create-nx-workspace@23.2.1` run from an agent shell (`CLAUDECODE` set) ignores the preset: `{"stage":"starting","message":"Mapping legacy preset 'angular-monorepo' to template 'nrwl/angular-template'"}`. The template is a shop demo on Nx 23.2.0 and Angular 22.1.4 (`dist/bin/create-nx-workspace.js`, `legacyPresetToTemplateMap`). Fix: unset `CLAUDECODE` and `CLAUDE_CODE`.
2. Bumping Angular in place: `npm error ERESOLVE could not resolve ... Found: @angular/common@22.1.8 ... Conflicting peer dependency: @angular/core@22.2.0`. Fix: reinstall without the lockfile.
3. `npx storybook add @storybook/addon-vitest`: `Failed while running the addon-a11y-addon-test automigration. Command failed with exit code 3221225477: npx.cmd storybook automigrate addon-a11y-addon-test --loglevel silent --yes --skip-doctor --package-manager npm --config-dir packages/ui/.storybook` and `SB_CLI_INIT_0005 (AddonVitestPostinstallError): The Vitest addon setup failed.` Exit code 3221225477 is 0xC0000005, an access violation in the child process. A rerun of the automigration reported "No migrations were applicable to your project"; the Vitest config had been written. Not reproduced.
4. Candidate 1, first run: `Error: page.evaluate: Error: The gallery page does not define window.mount().` The fixture calls `window.mount` right after `page.goto` resolves on the load event; Storybook imports `preview.ts` later. Fix: the `previewHead` stub.
5. Candidate 1, second run: every `mount()` timed out (`Test timeout of 30000ms exceeded`). The static build contained no gallery code: `packages/ui/package.json` (written by the Nx publishable-library generator) says `"sideEffects": false`, and the bundler dropped `import './playwright-gallery'` from `.storybook/preview.ts` (the CSS import survived). Fix: export a function and call it.
6. Candidate 1 `unmount()`: `expect(locator).toHaveCount(expected) failed ... Expected: 0 Received: 1`. `PreviewWeb.teardownRender` does not clear the canvas and the Angular renderer only destroys its `ApplicationRef` on the next render. Fix: also empty `#storybook-root`; `unmount()` is DOM-only (DestroyRef callbacks do not run).
7. Candidate 3 with the Analog plugin in its default AOT mode: `TypeError: Cannot read properties of undefined (reading 'selector') at computesTemplateFromComponent`. The Storybook Angular renderer reads `@Component` decorator metadata at runtime. Fix: `angular({ jit: true })`, as `@storybook/angular-vite` does.
8. Candidate 3 on a cold Vite cache: `[vite] (client) dependency optimized: tslib` / `optimized dependencies changed. reloading`, then `Error: page.evaluate: Execution context was destroyed, most likely because of a navigation.` and `Story "disclosure--default" reports failed: [{"type":"a11y"}]` for the tests in flight. Fix: `optimizeDeps.include: ['@angular/compiler', 'tslib']`; confirmed on a second cold run.
9. Vitest Browser path: `ReferenceError: STORYBOOK_ANGULAR_OPTIONS is not defined` (the framework's `viteFinal` defines it; the Angular builder does not); `TS2882: Cannot find module or type declarations for side-effect import of '../src/lib/disclosure/disclosure.css'` (TypeScript 6 checks side-effect imports); `TS2345: Argument of type 'Story' is not assignable to parameter of type 'LegacyStoryAnnotationsOrFn$1<AngularRenderer>'` (`@storybook/angular-vite` exports no typed `composeStory`).
10. sand4rt: `npm error peer @angular/compiler@"^20.3.11" from @sand4rt/experimental-ct-angular@1.61.1`; then `browserType.launch: Executable doesn't exist at C:\Users\...\ms-playwright\chromium_headless_shell-1228\...` until `npx playwright install --only-shell chromium` fetched the 1.61.1 browser; next to `@playwright/test` 1.63.0: `Error: Playwright Test did not expect test() to be called here. ... You have two different versions of @playwright/test.` / `Error: No tests found`.
11. jscutlery: `npm error peer @angular/compiler@">=16.0.0 <22.0.0" from @jscutlery/playwright-ct-angular@0.10.10`; with `"type": "module"` in the spike's `package.json`: `SyntaxError: Invalid or unexpected token` / `Error: No tests found`; after removing it: `RuntimeError: NG0950: Input "nfsDisclosure" is required but no value is available yet.` for both the class mount and the template mount, and `NG0950: Input is required but no value is available yet.` with an unaliased `input.required`. The SWC compile path (`@jscutlery/swc-angular` 0.22.0) is the recommended setup; the Analog plugin needs Vite 6 or later, and ct-core 1.47.1 brings Vite 5.
12. selectors-angular: `npm error peer @playwright/test@"1.57.0" from @playwright-labs/selectors-angular@1.1.1`; in Storybook dev: `locator.evaluate: ReferenceError: parseAttributeSelector is not defined` for any `angular=` selector (`toBeNgComponent()` and `$ng` with a CSS selector pass); on the static build: `Expected element to be an Angular component host, but window.ng.getComponent returned null`.

Environment notes: every Playwright browser build in use (Chromium 1243, Firefox 1543, WebKit 2359, and the spikes' Chromium 1228) is an x86-64 binary running under Windows-on-Arm emulation; WebKit runs. npm 11.16's allow-scripts gate skipped the install scripts of `esbuild`, `nx`, `lmdb`, `msgpackr-extract` and `@parcel/watcher`; nothing in the prototype broke because of it.

### What this does not prove

- One trivial directive. No CDK overlay, no content projection, no DI providers or `applicationConfig` in a story, no router, no `animate.enter`, no SSR or hydration.
- Only Windows 11 arm64 with emulated x64 browsers. No Linux CI run (for example the `mcr.microsoft.com/playwright:v1.63.0-noble` image) and no real Safari on macOS.
- `toHaveScreenshot`, the trace viewer, sharding, and the inferred `e2e-ci` atomized targets were not exercised.
- The gallery depends on Storybook preview internals that are not public API: `window.__STORYBOOK_PREVIEW__`, `storeInitializationPromise`, `teardownRender`, `currentRender`, and the channel event names and payloads (`setCurrentStory`, `updateStoryArgs`, `storyFinished`, `storyArgsUpdated`, `storyMissing`, `playFunctionThrewException`). Storybook 11 (the release that is to make `@storybook/angular-vite` stable) may change any of them.
- `unmount()` in candidate 1 removes DOM only; destroy-time behaviour cannot be tested through it.
- The static Storybook build runs Angular in production mode, so candidate 1 does not get Angular's development-mode checks; addon-vitest and the Vitest Browser path run in development mode.
- Function props through `exposeFunctions` passed `Channel.emit`'s local handler; how Storybook's postMessage transport serialises such args was not examined.
- Scale: each `mount()` is a navigation plus a Storybook boot (about 0.5 to 1 s in Chromium here); hundreds of stories were not tried.
- Whether Playwright component tests should replace Vitest Browser is for [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](41-browser-testing-stack-decision.md); this prototype only supplies the facts.

### OPEN FOR HUMAN

1. Whether the new repo may depend on the Storybook preview internals listed above, or should instead ask Storybook for a public "render story by id and report the outcome" API. Filing that request, or bug reports against `@playwright-labs/selectors-angular` (the `parseAttributeSelector` error) and `@jscutlery/playwright-ct-angular` (NG0950 under SWC), is an outward action in third-party repositories that needs your confirmation.
2. Linux CI and macOS WebKit behaviour of candidate 1 could not be tested on this machine.

Inputs for other tickets (no new ticket needed): for [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](41-browser-testing-stack-decision.md), all three paths now run the same CSF stories, with the timings above, and both the Vitest Browser spec and Playwright can reuse the play function and the addon-a11y result; for [Storybook conventions for the new library](58-storybook-conventions.md), `embed=true` is the switch between "Playwright owns the interaction" and "the story's play function runs", `parameters.a11y.test: 'error'` also gates Playwright through `storyFinished`, and the library `package.json`'s `"sideEffects": false` also applies to files under `.storybook/`.

### Triage (auto-trap quadrant), 2026-09-26

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items". Only HIGH impact with NOT-HIGH confidence stays OPEN FOR HUMAN; upstream filings and assistive-technology checks stay human-only by kind.

1. Dependence on Storybook preview internals in the gallery: carried into [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](41-browser-testing-stack-decision.md) (its OPEN FOR HUMAN 1) and triaged there, once: DECIDED, the gallery is adopted; asking Storybook for a public API stays HUMAN-ONLY BY KIND there.
   - Bug reports against `@playwright-labs/selectors-angular` (the `parseAttributeSelector` error) and `@jscutlery/playwright-ct-angular` (NG0950 under SWC). Outcome: HUMAN-ONLY BY KIND: upstream filing in third-party repositories under the user's identity. Nothing in the effort depends on them; the chosen solution uses none of the three community packages.
2. Linux CI and macOS WebKit behaviour: carried into the same ticket (its OPEN FOR HUMAN 2) and triaged there: DECIDED, verified by the new repository's first CI run; no spec depends on it.
