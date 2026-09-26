# Prototype: Rendering-mode test seam

Ticket: [Prototype: Rendering-mode test seam](../../issues/59-prototype-rendering-mode-test-seam.md).

## Question

1. Does `renderApplication` run inside the node-level Vitest layer of an Nx 23.2 Angular 22.2 library, with `ngServerMode` isolated per test file, so each spec can have a server-render smoke test? This decides the verdict.
2. What does the prerendered SSR fixture app for Playwright look like, with the event-dispatch contract inlined and the main bundle delayed so pre-hydration clicks and event replay can be asserted?

This is a tooling feasibility prototype. Neither branch of the prototype skill (logic demo or UI variants) fits the question, so the prototype is a runnable Nx workspace, as the map's AFK override allows.

## Verdict

**Yes.** `renderApplication` runs under the library's generated `test` target (`@nx/angular:unit-test` over `@angular/build`'s unit-test builder, Vitest 4.1.11), in jsdom and in Vitest browser mode (Chromium). `ngServerMode` stays isolated per file when the helper (`packages/ui/src/test-utils/render-server.ts`) builds `provideServerRendering()` inside the bootstrap callback, because the server platform then owns the flag and resets it. A module-scope `provideServerRendering()` leaks it (`src/leak-demo/`). The server HTML shows the expected classes, `jsaction` on elements expected to replay, the replay script, and `ngb` inside `@defer (hydrate on interaction)`.

Limits: the builder cannot run Vitest's plain `node` environment (`ReferenceError: document is not defined`), and inside it the server render uses `BrowserDomAdapter` rather than `DominoAdapter`. The separate node project (`test-node`) runs the same SSR specs in plain `node` with `DominoAdapter` and is the fallback.

The prerendered fixture app (development build, `outputMode: 'static'`, CLI-inlined contract) passes 15 of 15 Playwright tests across Chromium, Firefox, and WebKit. The tests cover JavaScript-disabled first paint, a click made before hydration with `main.js` held back and then replayed, `hydrate on interaction`, and two negative controls. The full results table, the exact errors, and the decision for the specs are in the ticket's `## Answer`.

## What is here

The decisive files only, at their paths inside the workspace. The runnable workspace (with `node_modules` and build output) stays at `D:/tmp/nfs-proto-rendering-mode-test-seam/` and is not committed.

- `package.json`, `nx.json` -- pins: Angular 22.2.0, Nx 23.2.1, TypeScript 6.0.3, Vitest 4.1.11, Vite 8.3.1, `@playwright/test` 1.63.0, `@analogjs/vite-plugin-angular` 2.7.5.
- `tools/pin.mjs` -- bumps the preset's `~22.1.0` Angular pins to 22.2.0 before a lockfile-free reinstall.
- `tools/run-all.sh` -- runs every layer and writes the ASCII logs under `logs/`.
- `packages/ui/src/lib/toggle/toggle.ts` -- the directive: host `click` flips a `model()`, host class `is-active`, `data-ready` set in `afterNextRender`, which shows whether code ran in server mode.
- `packages/ui/src/test-utils/render-server.ts` -- the SSR smoke helper (`renderServer`, `readServerMode`).
- `packages/ui/src/lib/toggle/toggle.ssr.spec.ts`, `toggle-defer.ssr.spec.ts` -- the two SSR spec files (plain and `@defer (hydrate on interaction)`).
- `packages/ui/src/lib/toggle/toggle.spec.ts` -- the client (TestBed) spec that must not see `ngServerMode`.
- `packages/ui/src/lib/toggle/dom-adapter.spec.ts` / `dom-adapter.node.spec.ts` -- the DOM adapter under the builder and under the node project.
- `packages/ui/src/leak-demo/module-scope-providers.spec.ts` -- the negative control for a module-scope `provideServerRendering()`.
- `packages/ui/project.json` -- `test` (with `leak-demo` and `single-worker` configurations) and `test-node`.
- `packages/ui/vitest.single-worker.mts`, `vitest.node-env.mts` (the failing plain-`node` probe), `vitest.node.config.mts` and `src/test-setup-node.ts` (the separate node project).
- `apps/fixture/**` -- the prerendered fixture app (`toggle-page.ts`, `deferred-panel.ts`, `app.routes.server.ts`, `project.json` with `outputMode: 'static'` and `serve-static` on port 4590).
- `apps/fixture-e2e/playwright.config.mts`, `src/rendering-modes.spec.ts` -- the Playwright suite (Chromium, Firefox, WebKit).
- `logs/` -- the last run of every layer plus `prerendered-index.html`, the server HTML the e2e loads.

## How to run

Windows 11 arm64, Node 24.18.0, npm 11.16.0. From `D:/tmp/nfs-proto-rendering-mode-test-seam`:

```
npx nx test ui                                   # SSR smoke + TestBed spec, jsdom
npx nx test ui -c single-worker                  # every spec file in one worker
npx nx test ui --browsers=chromiumHeadless       # same specs in Vitest browser mode
npx nx test ui -c leak-demo                      # negative control (module-scope providers)
npx nx test ui --runnerConfig=packages/ui/vitest.node-env.mts   # plain node probe: fails
npx nx test-node ui                              # separate Vitest node project (DominoAdapter)
npx nx e2e fixture-e2e                           # builds, prerenders, serves on 4590, runs 3 engines
npx nx e2e fixture-e2e -- --project=chromium
bash tools/run-all.sh                            # all of the above, logs to logs/
```

To rebuild the workspace from nothing:

1. `env -u CLAUDECODE -u CLAUDE_CODE npx -y create-nx-workspace@23.2.1 nfs-proto-rendering-mode-test-seam --preset=angular-monorepo --appName=fixture --style=css --bundler=esbuild --e2eTestRunner=playwright --unitTestRunner=vitest --ssr=true --zoneless=true --prefix=nfs --linter=none --formatter=prettier --aiAgents=none --nxCloud=skip --skipGit --interactive=false --packageManager=npm --workspaces=false` (with the agent variables set, the preset is replaced by a demo template; see the [Playwright component testing prototype](../../issues/40-playwright-component-testing-prototype.md)).
2. `node tools/pin.mjs`, delete `node_modules` and `package-lock.json`, `npm install`.
3. `npx nx g @nx/angular:library packages/ui --name=ui --publishable --importPath=@nfs/ui --prefix=nfs --style=css --unitTestRunner=vitest-angular --linter=none`.
4. `npm i -D -E @analogjs/vite-plugin-angular@2.7.5 vite@8.3.1 @nx/vitest@23.2.1` (only for `test-node`).
5. Copy the files listed above over the generated ones.
