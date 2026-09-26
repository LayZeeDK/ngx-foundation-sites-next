# 59. Prototype: Rendering-mode test seam

Type: prototype
Status: resolved
Blocked by: 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Two sub-questions, worked in this order, both proved with one class-toggling directive:

1. Does `renderApplication` run inside the node-level Vitest layer of an Nx 23.2 Angular 22.2 library (with `ngServerMode` isolated per test file), so each spec can have a server-render smoke test? This sub-question decides the verdict.
2. What does the prerendered SSR fixture app for Playwright look like (an Nx Angular app with `@angular/ssr` prerendering, the event-dispatch contract inlined, and the main bundle delayed so pre-hydration clicks and event replay can be asserted)?

A session that runs out of room after the first sub-question records the second under "what the prototype does not prove" rather than guessing.

Read first: `building-blocks.md` (1.12 and 1.11 decision 5; this prototype has no matrix row of its own), `adr/*.md`, `research/angular-rendering-modes.md`, `research/tooling-baseline.md`, `research/playwright-component-testing.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-rendering-mode-test-seam/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/rendering-mode-test-seam/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

### Verdict

**Yes.** `renderApplication` from `@angular/platform-server` runs inside the library's generated `test` target (`@nx/angular:unit-test`, which wraps `@angular/build`'s unit-test builder on Vitest 4.1.11). It runs in the builder's default jsdom environment and in Vitest browser mode (Chromium), with no second Vitest project. `ngServerMode` stays isolated per test file when the smoke-test helper builds `provideServerRendering()` inside the bootstrap callback: in 22.2 the server platform that `renderApplication` creates sets `ngServerMode` itself and clears it when the platform is destroyed (`packages/platform-server/src/server.ts:130-146`). Two SSR spec files and a TestBed spec pass in one run, including a forced single-worker run in which every file shares one global realm. The same helper asserts the server HTML: `is-active` from a host class binding, `jsaction="click:;"` on hosts with a `click` host listener, the `__jsaction_bootstrap` replay script, `ngh` annotations, and inside `@defer (hydrate on interaction)` the `ngb` block marker and `jsaction="click:;keydown:;"` on the block root. Plain `provideClientHydration()` is enough; event replay needs no extra feature.

Two limits come with the builder route. It cannot run Vitest's plain `node` environment: the error is `ReferenceError: document is not defined`. And inside the builder the server render uses the `BrowserDomAdapter` that TestBed init installed, not `DominoAdapter`. A separate Vitest node project (`test-node`: the Analog Vite plugin plus `vitest run`) runs the same SSR specs in plain `node` with `DominoAdapter` and serves as the fallback.

Sub-question 2 is also proved. The fixture is an Nx Angular app, prerendered with `outputMode: 'static'` from a development build and served by the `serve-static` file server. The Angular CLI build inlines the event-dispatch contract itself. Its Playwright suite passes in Chromium, Firefox, and WebKit on this machine (15 of 15). The suite covers JavaScript-disabled first paint; a click made before hydration while `main.js` is held back by `page.route`, then replayed; one `@defer (hydrate on interaction)` block; and two negative controls showing the checks can fail.

### Results

| # | Case | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `renderApplication` under the generated `@nx/angular:unit-test` target, jsdom (builder default) | Pass: 4 files, 9 tests | `npx nx test ui`; `logs/1-test-jsdom.log` |
| 2 | Same specs with every file in one worker (`maxWorkers: 1`, builder default `isolate: false`) | Pass: 9 tests. A temporary diagnostic (since removed) showed one process ID and a global counter reaching 5 across the three files, so the files share one global realm and isolation comes from the helper, not the runner | `npx nx test ui -c single-worker`; `logs/2-test-jsdom-single-worker.log` |
| 3 | Same specs in Vitest browser mode | Pass: 9 tests in Chromium. Each file got a fresh realm (the counter restarted per file) | `npx nx test ui --browsers=chromiumHeadless`; `logs/3-test-chromium.log` |
| 4 | `ngServerMode` per file: files A and B assert `undefined` before and after their render; the TestBed spec asserts `undefined` and that `afterNextRender` ran (`data-ready` present) | Pass in cases 1 to 3 | `toggle.ssr.spec.ts`, `toggle-defer.ssr.spec.ts`, `toggle.spec.ts` |
| 5 | Negative control: `provideServerRendering()` evaluated at module scope (the shape of the generated `app.config.server.ts`) | `ngServerMode` is `true` when the module loads, stays `true` after the render, and a later TestBed render in the same module graph never runs `afterNextRender` | `npx nx test ui -c leak-demo`; `logs/4-test-leak-demo.log` |
| 6 | Server HTML assertions | `class="is-active"` only on the `[active]="true"` host; `jsaction="click:;"` on both hosts; replay script `window.__jsaction_bootstrap(document.body,"ng",["click"],[])`; `ngh` on the root; no `data-ready`. Deferred block: main template rendered (no placeholder), block root `jsaction="click:;keydown:;"`, `ngb="d0"` | `toggle.ssr.spec.ts`, `toggle-defer.ssr.spec.ts` |
| 7 | Builder with `test.environment: 'node'` (plain node, through `runnerConfig`) | Fail: 4 of 9 tests. Every render, server or TestBed, needs a global `document` | `logs/5-test-node-env-probe.log` |
| 8 | DOM adapter during a server render under the builder | `BrowserDomAdapter` (`getUserAgent()` returns the jsdom or Chromium user agent), not `DominoAdapter` | `dom-adapter.spec.ts` |
| 9 | Separate Vitest node project (`environment: 'node'`, `@analogjs/vite-plugin-angular` 2.7.5 in JIT mode, Vite 8.3.1) | Pass: 3 files, 7 tests; `DominoAdapter` is current (`getUserAgent()` returns `Fake user agent`) | `npx nx test-node ui`; `logs/6-test-node-project.log` |
| 10 | Fixture app: prerendered route mounting the directive, contract inlined | The CLI build inlines `<script id="ng-event-dispatch-contract">`; platform-server adds `window.__jsaction_bootstrap(document.body,"ng",["click","keydown"],[])` | `logs/prerendered-index.html` |
| 11 | (a) JavaScript disabled | Pass in all 3 engines: classes, `jsaction`, `ngb`, contract script, no placeholder; a click changes nothing | `rendering-modes.spec.ts`; `logs/7-e2e-all-browsers.log` |
| 12 | (b) `main.js` held back with `page.route`, click before hydration, then the bundle released | Pass in all 3 engines. Before release: no `ngDevMode`, class unchanged. After release: class flipped by the replayed click, `data-ready` set, `jsaction` removed, `hydratedComponents > 0`, `componentsSkippedHydration === 0`, no console errors | same |
| 13 | (c) `@defer (hydrate on interaction)` | Pass in all 3 engines. After page hydration the block keeps `ngb` and has no `data-ready`; a click loads exactly one lazy chunk, hydrates the block, and replays the click; `componentsSkippedHydration === 0`; no errors | same |
| 14 | Negative control: server HTML altered (the `<h1>` removed) | NG0500 logged in all 3 engines, so the error check can fail | same |
| 15 | Negative control: replay bootstrap script removed | The click made before hydration is lost (class unchanged after hydration), so the replay check can fail | same |
| 16 | Firefox and WebKit projects | Both run: 5 of 5 each. WebKit build 2359 runs (an x64 binary under Windows-on-Arm emulation); no error. Firefox tests take 2 to 6 s each against about 0.5 s in Chromium | same |

Timings on this machine (Nx task time, cache skipped): `nx test ui` 7.1 s, `--browsers=chromiumHeadless` 8.1 s, `nx test-node ui` 4.1 s, `nx e2e fixture-e2e` (all three engines, 3 workers) 33 s, of which Playwright 15.7 s.

Facts the prototype settled beyond the question:

- The unit-test builder compiles spec and library source with the esbuild define `ngServerMode: false` (`@angular/build/src/tools/esbuild/application-code-bundle.js:468`). `@angular/*` stays external (`externalPackages: true`), so Angular's own code reads the real global. A bare `ngServerMode` in library or spec code is therefore always `false` under the builder. Tests read `globalThis['ngServerMode']`. This is another reason for ADR 0008's rule that the library never reads it.
- `setRootDomAdapter()` is `_DOM ??= adapter` (`packages/common/src/dom_adapter.ts:15-17`): the first adapter in a realm wins. The builder's TestBed init installs `BrowserDomAdapter` before any spec runs, which explains cases 7 and 8.
- Correction for `research/angular-rendering-modes.md` section 6: `provideServerRendering()` leaves `ngServerMode` set only when it is evaluated before `renderApplication` creates the platform (module scope, case 5). Built inside the bootstrap callback, the platform owns the flag and resets it. The same section's open point ("whether `renderApplication` runs inside `@angular/build:unit-test` ... is not verified") is now answered: it runs under jsdom and browser mode, not under plain `node`.
- The Nx 23.2.1 `angular-monorepo` preset with `--ssr=true` writes `provideClientHydration(withEventReplay())`, which is redundant in 22.2. It also writes `outputMode: 'server'` with an Express `server.ts`, a `**` Prerender server route, and a `<app>-e2e` Playwright project with Chromium, Firefox, and WebKit projects.
- Hydration stats need a development build: a production build defines `ngDevMode` as `false`, so `window.ngDevMode.hydratedComponents` does not exist there.
- In Firefox, `console.error('ERROR', error)` arrives in Playwright as the text `ERROR Error`. Reading NG05xx codes therefore needs the Error argument's `message` (`message.args()`), not `message.text()`.
- Module scripts delay both `DOMContentLoaded` and `load`, so the held-back-bundle test navigates with `waitUntil: 'commit'`.
- A component used both inside and outside a `@defer` block in one file is eager; the deferred content had to be its own component to produce a lazy chunk.
- Angular Components' SSR e2e (`src/universal-app`) does not inline the event-dispatch contract: its `index-source.html` has no contract script, so its prerendered page has no replay script and its e2e cannot exercise replay. The CLI build that the fixture app uses inlines the contract, so the fixture app needs no manual inlining.
- `@nx/vitest:test` prints `The @nx/vitest:test executor is deprecated and will be removed in Nx v24. Run nx g @nx/vitest:convert-to-inferred to migrate to the @nx/vitest/plugin inferred targets.`, so `test-node` uses `nx:run-commands` (`vitest run -c packages/ui/vitest.node.config.mts`).
- Source reading, not asserted: destroying the server platform also clears the global platform injector (`packages/core/src/platform/platform.ts:106`), so `getPlatform()` returns `null` after an SSR render in a shared realm. TestBed keeps its own reference and is unaffected (the TestBed spec passed after file A in the single-worker run).

### Exact error text for failures

- Case 7 (builder, plain `node` environment): `ERROR ReferenceError: document is not defined`. In a server render it is thrown from `getBaseElementHref` (`packages/platform-browser/src/browser/browser_adapter.ts:89`), reached through `BrowserDomAdapter.getBaseHref`, `new NoneEncapsulationDomRenderer` (the dev-mode CSS source-map base href) and `DomRendererFactory2.createRenderer`. In the TestBed spec it is thrown from `BrowserDomAdapter.getDefaultDocument` in `DynamicDOMTestComponentRenderer.removeAllRootElements` (`angular:test-bed-init`).
- Firefox, first run of case 14 (fixed in the test code): `Received string: "ERROR Error"` / `Timeout 5000ms exceeded while waiting on the predicate`.
- Case 14, the expected failure the control provokes: `ERROR NG0500: During hydration Angular expected <h1> but found <button>.`

### What the prototype does not prove

- One trivial directive: no Aria or CDK host directives, no content projection, no composite widget across a hydration boundary, no `animate.enter`, no Foundation Sass. `foundation-sites` was not installed because nothing in the question depends on Foundation CSS.
- Replay of `keydown` and replay-safe `preventDefault()` (the `eventPhase` 101 case) were not exercised. Only `click` replay was.
- Only `hydrate on interaction`. `viewport`, `hover`, `idle`, `timer`, `when`, and `never` were not run.
- Only `RenderMode.Prerender` with `outputMode: 'static'`. Request-time SSR (`RenderMode.Server` through the Express `server.ts`) and a `RenderMode.Client` route were not run.
- No screenshot and no axe run on the JavaScript-disabled page (`@axe-core/playwright` was not installed here; the CT prototype shows it works on Playwright 1.63).
- Zoneless only; no Zone.js consumer.
- The builder's `isolate: true` option was not tried; isolation here rests on the helper.
- The SSR specs ran in Vitest browser mode in Chromium only, not in Firefox or WebKit.
- The Storybook static build as the e2e target (the other half of layer 4) belongs to the [Prototype: Playwright component tests mounting CSF stories from @storybook/angular-vite](40-playwright-component-testing-prototype.md), not to this workspace.
- Only Windows 11 arm64 with x64 Playwright browsers (Chromium 1243, Firefox 1543, WebKit 2359) under emulation. No Linux CI run and no Safari on macOS.
- The prototype drove browsers through `@playwright/test` rather than `/playwright-cli`. Every question it answers is asserted in those tests, so no manual session was needed.

### Decision handed on

To the [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](41-browser-testing-stack-decision.md) ticket and to every spec's Testing Decisions:

1. **Node-level layer (layer 3): the library's existing `test` target.** SSR smoke specs are named `<name>.ssr.spec.ts` and sit next to the directive. They run with `npx nx test <lib>` (`@nx/angular:unit-test`) and need no second Vitest project, no Analog plugin, and no extra config. They pass whether the target defaults to jsdom or to `browsers: ["chromiumHeadless"]`, so the choice of the target's default environment stays with the browser testing stack decision.
2. **One shared test helper, not part of the public API** (the prototype's `renderServer()`). It builds `provideServerRendering()` and `provideClientHydration()` inside the bootstrap callback. Its document carries a `<script id="ng-event-dispatch-contract">` element, whose presence is all platform-server needs to emit the replay script. It returns a parsed `Document`. Specs never import an application's `app.config.server.ts`, because a module-scope `provideServerRendering()` leaks `ngServerMode` into every later spec in the worker (case 5). Tests read the flag, if at all, through `globalThis['ngServerMode']`.
3. **What each SSR smoke asserts:** the first-paint host bindings (Foundation classes, State classes, ARIA, `hidden`, `inert`, open-panel content); `jsaction` on every element whose activation must replay (`click:;` for a host `click` listener, with `keydown` added where declared); for a spec that documents `@defer` behaviour, `ngb` on elements in the block and `click:;keydown:;` on a `hydrate on interaction` root; and the absence of state that only render callbacks set.
4. **Fidelity limit, stated once in the testing conventions:** under the builder the server render runs with `BrowserDomAdapter`. For HTML assertions this makes no difference (cases 1 to 3 match case 9). A spec whose server path depends on the DOM adapter (global `window:`/`document:` event targets, `getUserAgent()`, cookies, base href) adds its SSR spec to the fallback `test-node` project, which is `nx:run-commands` running `vitest run -c <lib>/vitest.node.config.mts`: Vitest `environment: 'node'`, `@analogjs/vite-plugin-angular` 2.7.5, a setup file importing `@angular/compiler`.
5. **Playwright e2e (layer 4), rendering-mode half:** an Nx Angular fixture app next to the library with one route per plugin (the prototype has one). It is built with `@angular/build:application` in the development configuration (needed for `ngDevMode` hydration stats), with `outputMode: 'static'` and `RenderMode.Prerender`, and served by `@nx/web:file-server` (`serve-static`) on a fixed port. Its `<app>-e2e` project uses `webServer.command: 'npx nx run <app>:serve-static'` with `reuseExistingServer: true`, so `nx e2e <app>-e2e` builds, serves, waits, and tests. Per plugin: a JavaScript-disabled first-paint test; a held-back-`main.js` replay test (`page.route('**/main.js')`, `waitUntil: 'commit'`) that asserts the replayed state change, `componentsSkippedHydration === 0`, and no console errors (NG05xx codes read from the Error argument); and a `hydrate on interaction` test when the spec documents deferred behaviour. The two negative controls (altered HTML logs NG0500; a missing replay script loses the click) run once per suite, not per plugin. Chromium, Firefox, and WebKit projects all run.
6. **Commands per layer**, as run in the prototype:

| Layer | Nx target (executor) | Command |
| --- | --- | --- |
| Node-level SSR smoke, default | `ui:test` (`@nx/angular:unit-test`, jsdom) | `npx nx test ui` |
| Same specs in the browser | `ui:test` with `browsers` | `npx nx test ui --browsers=chromiumHeadless` |
| Node-level, plain `node` fallback | `ui:test-node` (`nx:run-commands`) | `npx nx test-node ui` (= `vitest run -c packages/ui/vitest.node.config.mts`) |
| Rendering-mode e2e | `fixture-e2e:e2e` (inferred by `@nx/playwright/plugin`; depends on `fixture:serve-static`, which builds `fixture:build:development`) | `npx nx e2e fixture-e2e`, or `npx nx e2e fixture-e2e -- --project=chromium` |

Building-blocks 1.12 can now fill its layer 3 and layer 4 "Stack" cells from points 1, 4, and 5.

### OPEN FOR HUMAN

None. Every point above was settled by the prototype or by source. Linux CI and macOS WebKit behaviour is listed under what the prototype does not prove because this machine cannot test it.

Prototype files: [prototypes/rendering-mode-test-seam/README.md](../prototypes/rendering-mode-test-seam/README.md). Workspace: `D:/tmp/nfs-proto-rendering-mode-test-seam/`.
