# Playwright component testing for Angular 22.2

Ticket: `../issues/39-playwright-component-testing-research.md`
Researched: 2026-09-25 against the npm registry (`npm view <pkg> version
dist-tags time peerDependencies dependencies maintainers`), published tarballs
unpacked with `npm pack` into the session scratchpad (nothing installed into
this repo), shallow clones made for this ticket, GitHub issue data through
`gh api`, and the local Angular 22.2.x clone. Extends `tooling-baseline.md`
(version pins, Vitest browser layers, Storybook 10.6 frameworks, e2e setup);
facts already recorded there are referenced, not repeated.

Clones read:

| Clone | Head |
| --- | --- |
| `d:/projects/github/microsoft/playwright` (new, shallow) | `afa6836a5` 2026-09-25, version `1.64.0-next` |
| `d:/projects/github/sand4rt/playwright-ct-angular` (new, shallow) | `d9c5dc0a8` 2026-07-15 |
| `d:/projects/github/jscutlery/devkit` (new, shallow) | `4c3d25d70` 2026-05-26 |
| `d:/projects/github/angular/angular` | branch `22.2.x`, tag `vsix-22.2.0` |
| `d:/projects/github/storybookjs/storybook` | branch `next` (Storybook 11 line) but the working tree is empty (`git ls-files` lists nothing), so Storybook facts come from the `storybook@10.6.0`, `@storybook/angular-vite@10.6.0` and `@storybook/addon-vitest@10.6.0` tarballs |

## Headline

1. **Playwright changed its component testing model under this ticket's
   feet.** Playwright 1.62 (2026-07-24) introduced a built-in, stable
   `mount(storyId, props?)` fixture in plain `@playwright/test` that drives a
   **gallery page you own and serve** (the "stories and galleries" model).
   PR microsoft/playwright#42168 (merged 2026-08-07, "chore: remove
   experimental component testing") deleted `@playwright/experimental-ct-core`
   and the `'@playwright/test': { babelPlugins }` hook from Playwright 1.63.
   `@playwright/experimental-ct-core` stops at **1.62.1** (2026-07-30) while
   `@playwright/test` is at **1.63.0** (2026-09-04).
2. **Both community Angular adapters are built on the removed machinery** and
   cannot run on Playwright 1.63. Neither accepts Angular 22 in its peer range.
3. **The new model is framework-agnostic by design, so an Angular gallery is
   a small amount of project-owned code**, and the gallery can be the
   Storybook iframe itself. That gives CSF reuse without any adapter package:
   the `mount` fixture calls a `window.mount` that selects a story through
   Storybook's own preview channel. This is the first candidate for the
   prototype.
4. `@playwright-labs/selectors-angular` is a selector engine and matcher set,
   not a mounting solution, and its exact `@playwright/test 1.57.0` peer
   conflicts with the 1.63.0 pin.
5. `@storybook/angular-vite` 10.6.0 exports `setProjectAnnotations` but **not**
   `composeStory` / `composeStories`; the generic ones in
   `storybook/preview-api` work with it, and that is exactly how
   `@storybook/addon-vitest` runs stories.

## 1. `@sand4rt/experimental-ct-angular`

Registry (`npm view @sand4rt/experimental-ct-angular ...`):

| Field | Value |
| --- | --- |
| Latest | `1.61.1`, published 2026-07-06 (prior: 1.59.0 on 2026-07-04, 1.58.2 on 2026-02-24); 52 versions since 2023-02-28 |
| Maintainer | `sand4rt` (single maintainer) |
| dependencies | `@playwright/experimental-ct-core 1.61.1` (exact), which itself depends on `playwright 1.61.1` and `vite ^8.1.0` |
| peerDependencies | `@angular/compiler ^20.3.11`, `@angular/core ^20.3.11`, `@angular/platform-browser-dynamic ^20.3.11`, `typescript >=6.0.3` |
| Playwright peer | none; Playwright arrives as an exact transitive dependency (1.61.1) |
| Vite peer | none; ct-core brings `vite ^8.1.0` |

Repository state (`gh api repos/sand4rt/playwright-ct-angular`): 62 stars,
19 open issues and PRs, not archived. Open PR #169 (Renovate,
`@playwright/experimental-ct-core` 1.61.1 to 1.62.1) is `blocked`. Issue #147
(open, 2026-07-04): "The package is not installing on a project with Angular
19. It just installs the vanilla Playwright". The unpublished repo manifest
(`playwright-ct-angular/package.json`) has already moved its TypeScript peer to
`>=7.0.2`, which Angular 22.2 cannot use (`tooling-baseline.md`, TypeScript 7).
The example app `ct-angular/package.json` is still on Angular 17.3.8 and
`@analogjs/vite-plugin-angular 1.17.0`.

How mounting works (`playwright-ct-angular/index.js`, `transform.js`,
`registerSource.mjs`):

- `defineConfig` wraps ct-core's and sets
  `'@playwright/experimental-ct-core': { registerSourceFile }` plus
  `originalConfig['@playwright/test'].babelPlugins = [transform]`. The Babel
  transform rewrites every identifier passed to `mount(...)` into an
  `{ __pw_type: 'importRef', id }` object and calls
  `require('playwright/lib/common').transform.setTransformData(...)`; ct-core
  then bundles those imports with its own Vite (`ctViteConfig`, where the
  example registers `@analogjs/vite-plugin-angular`).
- In the browser, `registerSourceFile` calls
  `getTestBed().initTestEnvironment(BrowserDynamicTestingModule,
  platformBrowserDynamicTesting())`, then per mount
  `TestBed.configureTestingModule({ imports: [component.type] })`,
  `TestBed.createComponent`, sets `fixture.nativeElement.id = 'root'`,
  `componentRef.setInput(name, value)` for each prop,
  `componentInstance[name].subscribe(listener)` for each `on` handler, and
  `fixture.autoDetectChanges()`.
- Public API (`index.d.ts`): `mount(Component, { props, on, hooksConfig })`
  returning a `Locator` with `update({ props, on })` and `unmount()`;
  `hooks.d.ts`: `beforeMount(({ hooksConfig, TestBed }) => ...)` and
  `afterMount`.

Supports: standalone components only (`'Only standalone components are
supported'`), inputs including signal inputs (through `setInput`), outputs
(anything with `.subscribe`, so `output()` and `EventEmitter`), providers only
through `beforeMount` + `TestBed.configureTestingModule` in
`playwright/index.ts`. No content projection, no template mount (JSX mount
throws `'JSX mount notation is not supported'`), no directive-on-a-host mount;
a directive needs a wrapper test component. Zoneless works when `zone.js` is
not imported (sand4rt's comment on microsoft/playwright#37385).

Angular ceiling: peer `^20.3.11`. It uses
`@angular/platform-browser-dynamic/testing`, whose `platformBrowserDynamicTesting`
and `BrowserDynamicTestingModule` are `@deprecated` in 22.2 in favour of
`platformBrowserTesting` / `BrowserTestingModule` from
`@angular/platform-browser/testing`
(`d:/projects/github/angular/angular/packages/platform-browser-dynamic/testing/src/testing.ts`
lines 14 and 23).

Known breakages:

- **Cannot run on Playwright 1.63.** The `babelPlugins` config key it writes
  exists in `playwright@1.62.1` (`lib/common/index.js` lines 971, 1102, 1340)
  and is gone from `playwright@1.63.0` (`rg babelPlugins lib` finds nothing),
  per PR #42168: "Remove the `'@playwright/test': { babelPlugins }` hook that
  injected `tsxTransform`, plus the `setTransformData`/`getUserData` cache side
  channel". `transform.js` also imports `playwright/lib/common` and
  `playwright/lib/transform/babelBundle` internals.
- The last ct-core it could move to is 1.62.1; there will be no 1.63 ct-core.
- microsoft/playwright#29544 (closed 2026-05-04 for inactivity): Angular
  components in `.ts` files are not recognised by ct-core's transform, the
  reason for the adapter's own `collectClassMountUsages`.

Verdict: end of life with the experimental packages. Usable only by pinning a
second, older Playwright (1.61.1 or 1.62.1) next to the workspace's 1.63.0
and forcing Angular 22 past its peer range. Not a candidate beyond a fallback
spike.

## 2. `@jscutlery/playwright-ct-angular`

Registry:

| Field | Value |
| --- | --- |
| Latest | `0.10.10`, published 2026-02-12 (0.10.8 and 0.10.9 the same day, 0.10.5 on 2025-05-31); 51 versions since 2022-12-07 |
| Maintainers | `yjaaidi` (Younes Jaaidi), `koalaa` (Edouard Bozon) |
| dependencies | `@playwright/experimental-ct-core 1.47.1`, `@playwright/test 1.47.1` (both exact, from September 2024), `@babel/core 7.23.9` |
| peerDependencies | `@angular/compiler`, `@angular/core`, `@angular/platform-browser`, `@angular/platform-browser-dynamic` all `>=16.0.0 <22.0.0`; `rxjs ^7.0.0`; `zone.js *` |
| Vite peer | none; the setup asks for `@jscutlery/swc-angular` + `unplugin-swc` in `ctViteConfig` instead of the Angular compiler |

Repository (`d:/projects/github/jscutlery/devkit`, 268 stars, 87 open issues
and PRs): `packages/playwright-ct-angular/package.json` is at 0.10.15; the
CHANGELOG says 0.10.9 to 0.10.15 were "a version bump only ... no code
changes", and npm's latest is still 0.10.10. The workspace itself develops
against `@playwright/experimental-ct-core 1.50.1`, `@angular/core 21.1.4`,
`vite 7.3.3`. Renovate PR #833 (ct-core 1.50.1 to 1.62.1) has been open since
2025-04-21. Issue #860 "Angular 19 support?" (open) collects "v20 support" and
"v22 support too, please" (2026-06-09) with no maintainer answer.

It uses `@playwright/experimental-ct-core`, not its own runner
(`src/index.ts`: `playwrightCtCore.defineConfig(...)` plus the same
`'@playwright/test'.babelPlugins` injection of `transform-angular`).

Mount API (`src/index.ts`, `src/register-source.mjs`, README):

- `mount(Component, { props, on, providers, hooksConfig })` and
  `mount(templateString, { imports, props, on, providers })`. The template
  form builds a `pw-template-component` standalone component at runtime, so
  content projection and directives on a host element **are** expressible
  (`mount('<div nfsDirective>...</div>', { imports: [NfsDirective] })`).
- Typed inputs unwrap `InputSignal`; typed outputs accept anything with
  `subscribe`.
- `providers` must be serialisable or importable (README "Known
  Limitations": `provideAnimations()` result does not work, a class declared in
  the test file does not work). The recommended pattern is a "test container
  component" in a separate file.
- A custom `TestComponentRenderer` inserts TestBed's root into Playwright's
  root; `fixture.autoDetectChanges()` then `await fixture.whenStable()`.
  Zoneless requires `provideExperimentalZonelessChangeDetection()` in a
  `beforeMount` hook (README section 4), an API renamed to
  `provideZonelessChangeDetection` since Angular 20.
- Same limitations as every experimental adapter: the component type cannot be
  held in a variable, used elsewhere in the file, or declared in the test file.

Status relative to sand4rt: older Playwright pin (1.47.1 versus 1.61.1),
wider Angular floor but lower ceiling (`<22`), richer API (templates,
providers), less recent release activity. Same fate on Playwright 1.63.

Verdict: not a candidate. Angular 22 is outside the peer range, Playwright
1.47.1 is 16 minors behind, the compile path is SWC rather than the Angular
compiler, and the hook it depends on no longer exists.

## 3. `@playwright-labs/selectors-angular`

Registry: `1.1.1` (2026-04-14; 1.0.0 on 2026-04-01), maintainer `vitalicset`
(Vitali Haradkou), repository `vitalics/playwright-labs` (20 stars, 5 open
issues, pushed 2026-09-13; the package.json carries no `repository` field).
dependencies `@playwright-labs/selectors-core 1.0.0`; **peerDependencies
`@playwright/test 1.57.0` exact** (the README's requirements table says
`^1.57.0`, the manifest does not). npm will refuse it next to
`@playwright/test@1.63.0` without `overrides` or `--legacy-peer-deps`.

What it is (tarball `README.md`, `dist/index.d.ts`): a custom Playwright
selector engine plus matchers and a fixture. It does not mount anything.

- `selectors.register('angular', AngularEngine)` enables
  `page.locator('angular=app-button[label="Submit"]')`, attribute operators
  (`=`, `*=`, `^=`, `$=`, `|=`, `~=`, regex, `i`/`s` flags) over component
  instance properties, including dotted paths.
- `expect` extensions: `toBeNgComponent`, `toHaveNgInput`, `toHaveNgOutput`,
  `toBeNgInput`, `toBeNgOutput`, `toHaveNgSignal`, `toBeNgSignal`,
  `toBeNgRouterOutlet`, `toBeNgIf`, `toBeNgFor`, `toMatchNgSnapshot`.
- `test` export with a `$ng(selector)` fixture returning `NgHtmlElement`
  (`input()`, `signal()`, `inputs()`, `outputs()`, `signals()`,
  `directives()`, `detectChanges()`).
- It reads `window.ng` (`ng.getComponent` 17 uses, `ng.getDirectives` 6,
  `ng.applyChanges`, `ng.getHostElement`, `ng.getOwningComponent` in
  `dist/index.mjs`). Angular publishes those only under `ngDevMode`
  (`packages/core/src/application/application_ref.ts` line 67:
  `ngDevMode && _publishDefaultGlobalUtils()`).
- The README's production-build workaround is wrong for Angular 22.2:
  `enableDebugTools` only exports `ng.profiler`
  (`packages/platform-browser/src/browser/tools/tools.ts` lines 15 and 31),
  not `ng.getComponent`.

How it complements a CT route or e2e: it adds implementation-level assertions
(input and signal values, which directives sit on a host) on top of any page
Playwright can open, including the Storybook iframe, but only in a development
build. The static `build-storybook` output that the e2e layer serves is a
production build, so `window.ng` is absent there unless Storybook is built in
development mode; that was not verified. The map's accessibility-first test
style (roles, ARIA state, Foundation state classes) does not need it, and
Playwright's own docs call instance access "neither recommended nor supported"
(`docs/src/test-components-js.md`, FAQ). Verdict: optional debugging aid, not
part of the stack.

## 4. Playwright's framework-agnostic component testing (1.62+)

### Timeline (registry `time`, release notes, PRs)

| Date | Event | Source |
| --- | --- | --- |
| 2026-02-06 | `@playwright/experimental-ct-svelte` last published at 1.58.2; a later release note says "Removed `@playwright/experimental-ct-svelte` package" | `docs/src/release-notes-js.md` line 709 |
| 2026-07-21 | `feat(skills): add component-testing agent skill` (#41738) | `gh api .../commits?path=packages/playwright-ct-core` |
| 2026-07-24 | Playwright 1.62.0: "New component testing model ... stories and galleries" | release notes, Version 1.62 |
| 2026-07-30 | `@playwright/experimental-ct-core` 1.62.1, the last release | registry |
| 2026-07-31 | #41996 "out-of-the-box Playwright gallery" closed; pavelfeldman: "This is exactly our recommendation, have a coding agent implement the harness for you" | `gh api repos/microsoft/playwright/issues/41996/comments` |
| 2026-08-07 | #42168 removes ct-core, ct-react, ct-react17, ct-vue, the CT CI workflow and the `babelPlugins` hook | `gh api repos/microsoft/playwright/pulls/42168` |
| 2026-09-04 | Playwright 1.63.0; announcement: the ct-react, ct-react17 and ct-vue packages "will no longer be updated"; "Story ids passed to `mount` can now be typed through the generated `Stories` registry" | release notes, Version 1.63 |

Angular in the Playwright tracker: #39010 "Component testing for Angular"
closed 2026-01-28 with "Not planned." (pavelfeldman); #37385 "Angular zoneless
component testing" closed for inactivity 2026-04-28; #20076 "Absorb
@sand4rt/playwright-ct-web" closed 2025-09-09. No Angular gallery example
exists in the repo: the skill ships `references/react.md`, `references/vue.md`
and `templates/react`, `templates/vue` only
(`packages/playwright-core/src/tools/skills/playwright-component-testing/`).

### The model

From `docs/src/test-components-js.md` (main and `release-1.63` carry the same
text; `release-1.62` said "This guide replaces the experimental ...
packages"):

- "A component test is a regular Playwright end-to-end test that runs against
  a small **story gallery** page served by your own dev server. There is no
  dedicated component-testing runtime, no bundler integration and no extra npm
  packages".
- A **story** is "a tiny wrapper component that embeds the component under
  test in one specific scenario: hard-coded props, mock data, providers,
  recorded callbacks." Convention: `*.story.tsx` next to the component, one
  named export per scenario, id = path under `src/` without the extension plus
  the export name (`components/Button/Primary`); any unique suffix resolves.
- The **gallery** is "a single page, served by your dev server, that exposes
  `window.mount(params)` and `window.unmount()` functions rendering a story ...
  into a `#root` element. It is framework-specific and yours to own."
- Setup is agent-driven: `npx playwright init-skills`, then ask the agent to
  "Set up component testing using the playwright-component-testing skill". The
  skill is in the published `playwright-core@1.63.0` under
  `lib/tools/skills/playwright-component-testing/`.
- Recommended config: a `components` project with
  `baseURL: '<dev server>/playwright/gallery/index.html'`,
  `serviceWorkers: 'block'`, `reuseContext: true`, and a `webServer` block.

The fixture, as published in `playwright@1.63.0` (`lib/index.js` line 460 and
following; same code in the clone at `packages/playwright/src/index.ts` lines
507-533):

```ts
mount: async ({ page, baseURL }, use) => {
  const callMount = params => page.evaluate(async p => {
    if (typeof window.mount !== 'function')
      throw new Error('The gallery page does not define window.mount().');
    await window.mount(p);
  }, params, { exposeFunctions: true });
  await use(async (storyId, props) => {
    if (!baseURL) throw new Error('mount() requires `baseURL` ...');
    await page.goto(baseURL);
    await callMount({ story: storyId, props });
    return Object.assign(page.locator('#root'), {
      update: newProps => callMount({ story: storyId, props: newProps }),
      unmount: () => page.evaluate(async () => { await window.unmount?.(); }),
    });
  });
},
```

Consequences for an Angular project:

- **The only contract is `window.mount({ story, props })`, `window.unmount()`
  and an element with `id="root"`.** Playwright does not know or load
  Angular. Every `mount` call does `page.goto(baseURL)`, so tests are isolated
  per mount; `update()` re-calls `window.mount` without navigating.
- `exposeFunctions: true` (1.62: "`Page.evaluate` ... now accept functions as
  evaluate arguments") means function-valued props become browser-callable
  functions that dispatch back to Node. The docs still steer callbacks into
  the story ("record state into a hidden form", assert with `toHaveValue`).
- `mount` is an ordinary fixture, so a project may override it with
  `test.extend({ mount: ... })`, for example to return a different root
  locator. There is no `beforeMount` / `afterMount` or `hooksConfig` any more;
  the migration table maps them to "The body of the gallery's `window.mount`
  (global), or story decorators (per-story)".
- Typing (`references/typing.md`, `types/test.d.ts` line 7977
  `export interface Stories {}` and line 8121 `mount: <Story = never, Id
  extends StoryId = StoryId>(storyId: Id, props?: MountProps<Story, Id>) =>
  Promise<Locator & { update(...), unmount() }>`): either
  `mount<typeof Story>(id, props)` or a generated `stories.d.ts` augmenting
  `Stories` via a small Vite plugin.
- Everything else is plain Playwright 1.63: `toHaveScreenshot` on the
  returned locator, trace viewer (1.63 adds aria and screen snapshots in
  traces), `page.route`, sharding, projects per browser, `lock` for shared
  resources, `reducedMotion` / `forcedColors` / `contrast` test options (new
  in 1.63, relevant to the map's `prefers-reduced-motion` rule).
- The gallery can be served by any server. It does not have to be a Vite
  page under `playwright/gallery/`; that is only the skill's default for Vite
  apps.

Answer to the ticket's sub-question "does a `mount` hook registration let a
project write its own Angular adapter": yes, and in 1.62+ it is the only
supported way. The adapter is the gallery page (plus, optionally, an
overridden `mount` fixture), not a package that plugs into Playwright's
bundler.

## 5. Portable stories and `@storybook/angular-vite` 10.6

Tarball facts:

- `@storybook/angular-vite@10.6.0` `package.json` exports: `.`, `./client`,
  `./client/config`, `./client/docs/config`, `./client/preview-prod`,
  `./node`, `./preset`, `./vitest`, builders, `./internal/docgen-worker`.
- `dist/index.js` exports `setProjectAnnotations`, `definePreview`
  (`__definePreview`), `applicationConfig`, `moduleMetadata`,
  `componentWrapperDecorator`, `argsToTemplate`. **No `composeStory` and no
  `composeStories`** (only mentioned in the JSDoc of `setProjectAnnotations`,
  `dist/index.d.ts` line 106).
- Its `setProjectAnnotations` (`dist/_browser-chunks/chunk-THQDNKQS.js`,
  `src/client/portable-stories.ts`) is
  `setDefaultProjectAnnotations(render_exports)` followed by core
  `setProjectAnnotations(...)`: it registers the Angular `render` and
  `renderToCanvas` (`./client/config` re-exports them) as the default
  project annotations.
- `storybook@10.6.0` `storybook/preview-api` exports `composeStory` and
  `composeStories` (`dist/_browser-chunks/chunk-M6YZR3ZW.js` line 1085).
  `composeStory(story, meta, project?, defaultConfig?, exportName?)` uses
  `defaultConfig ?? globalThis.globalProjectAnnotations`, so after the
  Angular `setProjectAnnotations` it renders through the Angular renderer. The
  composed story exposes `run(extraContext)` (loaders, `beforeEach`,
  `mount`, play function, `afterEach`, into `extraContext.canvasElement` or a
  fresh `div` appended to `body`), `play`, `load`, `args`, `parameters`,
  `tags`. Its `renderToCanvas` call always passes `forceRemount: true`.
  Note: core `composeStories` calls `composeStory(..., {}, exportName)`, and
  that `{}` default config bypasses `globalProjectAnnotations`; call
  `composeStory` per export (as addon-vitest does) rather than core
  `composeStories`.
- `@storybook/addon-vitest@10.6.0` runs stories the same way
  (`dist/vitest-plugin/test-utils.js` lines 75-121): `composeStory(story,
  meta, { initialGlobals }, annotations.preview ??
  globalThis.globalProjectAnnotations, exportName)`, `setViewport(...)`, then
  `await composedStory.run(undefined)`. Project annotations come from
  `setup-file-with-project-annotations.js`:
  `setProjectAnnotations(getProjectAnnotations())` with
  `getProjectAnnotations` imported from
  `virtual:/@storybook/builder-vite/project-annotations.js` (the framework
  preset, addons such as a11y, and `.storybook/preview.ts`).
- `storybookAngularVitest()` (`dist/node/vitest.js`) only serialises Angular
  build options into `STORYBOOK_ANGULAR_BUILDER_OPTIONS_JSON`, adds
  `setupFiles: ['@angular/compiler']` (story templates are JIT-compiled), and
  widens `server.fs.allow` to every ancestor with `node_modules`. It "Does NOT
  register `@analogjs/vite-plugin-angular`; the framework's own `viteFinal`
  still injects analog."

The Storybook preview runtime (`storybook@10.6.0` `dist/preview/runtime.js`)
gives a second, adapter-free way to render a CSF story on demand, inside the
real Storybook iframe:

- `globalThis.__STORYBOOK_ADDONS_CHANNEL__` holds the channel (line 12881),
  and `Channel.emit` sends to transports and then calls `this.handleEvent`
  locally (lines 11272-11281), so a script in the iframe can drive the
  preview without a manager.
- `PreviewWeb` listens to `setCurrentStory` (line 36872); `onSetCurrentStory`
  sets the selection and calls `renderSelection()` (line 36937). Other
  listeners include `updateStoryArgs` (`onUpdateArgs`, line 36947) and
  `forceRemount`.
- Outcome events: `storyRendered` (emitted in the `completed` phase, line
  35672), `storyMissing` (line 37075), `storyThrewException` and
  `storyErrored` (lines 37080-37086).
- The play function only runs when `renderOptions.autoplay` is true (line
  35648), and `shouldAutoplay` is `!shouldEmbed`, where embed is the
  `embed=true` query parameter (line 36017). So
  **`iframe.html?embed=true` renders stories without running their play
  functions**, which is what a Playwright test that owns the interactions
  wants. Embed mode also injects an embed style block for
  `#storybook-root` children (line 36734); visual baselines must be taken in
  the same mode.
- The canvas is `document.getElementById('storybook-root')`, looked up per
  story (line 37908).

Can a Playwright `mount` take a composed story? Not as an object: the fixture
only sends a story id string and serialisable props across the Node/browser
boundary, which is the design point of 1.62. A gallery resolves the id to a
CSF export and renders it, either with `composeStory(...).run({ canvasElement
})` on a page of its own, or by asking the Storybook preview to render it. The
second path reuses Storybook's own rendering, decorators, `applicationConfig`
providers, global styles and addon annotations with no second pipeline.

## 6. Vitest Browser versus Playwright CT for this library

| Capability | Vitest browser mode (Angular builder specs and addon-vitest stories) | Playwright 1.63 `mount` + gallery |
| --- | --- | --- |
| Real browser | Yes, Playwright-driven Chromium, Firefox, WebKit through `@vitest/browser-playwright` 4.1.11 (peer `vitest 4.1.11`, `playwright *`) | Yes, same engines, driven directly |
| Where the test code runs | In the browser, next to the component | In Node; only the gallery runs in the browser |
| Angular TestBed, DI access, `inject()` in tests | Yes (`@angular/build:unit-test`, `providersFile`, `setupFiles`; tooling baseline) | No. DI setup lives in the story or gallery (`applicationConfig`, providers); tests see only the page |
| Component instance, signals, `ComponentRef.setInput` from the test | Yes | No; props through `mount(id, props)` and `update(props)` only |
| CDK component harnesses | Yes, `TestbedHarnessEnvironment` (`d:/projects/github/angular/components/src/cdk/testing/testbed/`) | No Playwright harness environment exists in CDK 22.2 (`src/cdk/testing/` has `testbed`, `selenium-webdriver`, `protractor` only) |
| Axe | Through `@storybook/addon-a11y` in the addon-vitest run (`parameters.a11y.test: 'error'`); none in the builder | Needs `@axe-core/playwright` (not researched here) or relies on the Storybook run |
| Screenshots | Vitest 4 `toMatchScreenshot` (`vitest@4.1.11` `dist/chunks/reporters.d.*.d.ts`) | `toHaveScreenshot` on the root locator, WebP baselines since 1.62 |
| Trace viewer | `browser.trace` option, "Generate traces that can be viewed on https://trace.playwright.dev/" (`vitest@4.1.11` typings line 1674) | Native, with 1.63 aria and screen snapshots and step params |
| Real input events | Vitest `userEvent` goes through the provider (CDP / Playwright) | Native Playwright actions with auto-waiting and actionability checks |
| Multi-page, history, storage, viewport, reduced motion, forced colors | Limited to the test iframe | Full browser context per test (`reducedMotion`, `forcedColors`, `contrast` options new in 1.63) |
| CI parallelism | Vitest workers, one browser; tooling baseline notes two separate Vitest invocations (`nx test`, `nx test-storybook`) | Workers, sharding, `fullyParallel`, `lock`, `retryStrategy: 'isolated'` |
| Nx integration | `@nx/angular:unit-test` executor; inferred `test-storybook` from `@nx/storybook/plugin` | `@nx/playwright/plugin` infers `e2e` and atomized `e2e-ci` from any `**/playwright.config.{js,ts,cjs,cts,mjs,mts}` (`@nx/playwright@23.2.1` `dist/src/plugins/plugin.js` line 17); a web-server target runs as a dependency |
| Coverage | `--coverage` on both Vitest layers | Not provided by the fixture |
| Known limitations | Builder overrides `test.projects` / `test.include`; Vitest 5 refused by Nx 23.2.1 and addon-vitest 10.6 (tooling baseline) | Gallery code is project-owned; story ids are strings (rename breaks at runtime unless `Stories` is generated); no instance access; each `mount` is a navigation |

What tooling-baseline.md already fixed: layer 1 is play functions through
addon-vitest, layer 2 is directive and service specs through the Angular
builder in Vitest browser mode, layer 3 is Playwright e2e against the static
Storybook build using `/iframe.html?id=<story-id>&viewMode=story`. A Playwright
`mount` over the Storybook iframe is the layer-3 setup with a nicer entry
point (`mount(id, props)`, `update`, `unmount`) plus args control, so it can
absorb story-level browser tests without adding a build. It cannot replace
layer 2, because TestBed, DI overrides, harnesses and direct signal access
have no equivalent from Node. The
[Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](../issues/41-browser-testing-stack-decision.md)
ticket decides; these are the facts it will weigh.

## 7. Local examples

Search: `rg -l --glob package.json --glob '!**/node_modules/**' -e
experimental-ct-angular -e playwright-ct-angular -e selectors-angular -e
experimental-ct-core` over `d:/projects/github` (exit 0), and a second pass for
`composeStor(y|ies)`, `playwright/gallery`, `ctViteConfig` in
`*.{ts,mts,js,mjs}` excluding `microsoft/` and `storybookjs/`.

| Repository | What it shows |
| --- | --- |
| `sand4rt/playwright-ct-angular/ct-angular` | `playwright.config.mts` with `defineConfig` from the adapter, `ctViteConfig.plugins: [angular({ tsconfig: resolve('./tsconfig.spec.json') }) as any]` ("TODO: remove any and resolve various installed conflicting Vite versions"), `@` alias, chromium/firefox/webkit projects. `playwright/index.ts` imports `zone.js` and global CSS and registers `beforeMount` for router and token overrides. Angular 17.3.8. Tests: `render`, `events`, `update`, `unmount`, `hooks`, `angular-router`, `unsupported.spec.tsx` |
| `jscutlery/devkit/tests/playwright-ct-angular-demo`, `-wide` | `playwright-ct.config.ts` with `testMatch: /pw\.tsx?/`, `testIdAttribute: 'data-role'`, `ctPort: 3100`, `ctViteConfig: { plugins: [swc.vite(swcAngularUnpluginOptions())], resolve: { conditions: ['style'] } }` |
| `nrwl/nx/packages/vite/src/utils/test-utils.ts` | Mentions `composeStories` in Nx test utilities; not an Angular CT setup |

No local repository under `LayZeeDK/`, `ngworker/` or elsewhere uses any of
the four packages, a 1.62-style gallery, or Angular portable stories.

## Comparison table

| Package or approach | Version (date) | Angular ceiling | Playwright peer | Mounting model | CSF reuse path | Maintenance | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `@sand4rt/experimental-ct-angular` | 1.61.1 (2026-07-06) | peer `^20.3.11`; uses deprecated `platform-browser-dynamic/testing` | none; exact dep on ct-core 1.61.1 (brings `playwright 1.61.1`) | ct-core: Babel import-ref transform, ct-core's own Vite, `TestBed.createComponent`, `setInput`, output `subscribe` | None (class mount only; stories not importable into mount) | Single maintainer, active Renovate; ct-core 1.62.1 bump PR blocked; foundation removed upstream | Dead end on Playwright >= 1.63; fallback spike only |
| `@jscutlery/playwright-ct-angular` | 0.10.10 (2026-02-12) | peer `<22.0.0` | exact deps `@playwright/test 1.47.1`, ct-core 1.47.1 | ct-core + SWC compile; class or template mount, providers | None | Two maintainers, no code change since 2026-01; Angular 20/22 requests unanswered | Not viable |
| `@playwright-labs/selectors-angular` | 1.1.1 (2026-04-14) | "Angular 9+" via `window.ng` (dev builds only) | exact `@playwright/test 1.57.0` | None; selector engine, matchers, `$ng` fixture | Works on any page, including the Storybook iframe in a dev build | Single maintainer, young (4 releases in two weeks) | Optional complement; not part of the stack |
| Playwright `mount` + Storybook iframe as gallery | `@playwright/test` 1.63.0 (2026-09-04); fixture since 1.62 | Whatever Storybook renders: `@storybook/angular-vite` 10.6 accepts `>=21 <23` | Built in | Built-in fixture calls `window.mount` defined in `.storybook/preview.ts`, which emits `setCurrentStory` / `updateStoryArgs` on the preview channel and waits for `storyRendered` | Direct: the CSF files and the Storybook build that addon-vitest and e2e already use | Microsoft, stable documented fixture | Candidate 1 |
| Playwright `mount` + Angular-native gallery (no CSF) | same | Angular 22.2 directly | Built in | Own Vite page (`@analogjs/vite-plugin-angular`), `*.story.ts` Angular components, `createApplication` + `createComponent` into `#root`, `setInput` on `update()` | None; stories are separate files | Project-owned | Candidate 2 |
| Playwright `mount` + portable-stories gallery | same; `storybook` 10.6.0 | `@storybook/angular-vite` `>=21 <23` | Built in | Own Vite page: `setProjectAnnotations` from `@storybook/angular-vite`, `composeStory` from `storybook/preview-api`, `run({ canvasElement })` | Direct import of `*.stories.ts` | Project-owned glue over Storybook internals-adjacent API | Candidate 3 |
| Vitest browser (reference) | `vitest` 4.1.11 | Angular 22.2 | `@vitest/browser-playwright` peer `playwright *` | TestBed in the browser | addon-vitest runs every CSF story | Vitest, Angular, Storybook teams | Already the layer 1 and 2 stack |

## Prototype candidates, in order of likelihood to work

All three share the pin set from `tooling-baseline.md` (Angular 22.2.0,
TypeScript ~6.0.3, Vite ^8.3.1, Storybook 10.6.0 with
`@storybook/angular-vite`, Vitest ~4.1.11, `@playwright/test` 1.63.0) and a
synthetic Nx 23.2.1 workspace under `D:/tmp/pw-ct-angular/` (map AFK
override), with one Foundation-styled component (for example a disclosure
button with `aria-expanded`) and a CSF file `button.stories.ts` holding
`Primary`, `Disabled`, and `Stateful` (records clicks into a hidden
`<input data-testid="click-count">`).

Common setup:

```
npx create-nx-workspace@23.2.1 pw-ct-angular --preset=apps --nxCloud=skip --packageManager=npm
cd pw-ct-angular
npx nx add @nx/angular@23.2.1
npx nx g @nx/angular:library libs/ui --name=ui --publishable --importPath=@pw/ui --prefix=nfs --style=scss --unitTestRunner=vitest-angular --linter=eslint
npm i -D @angular/core@22.2.0 @angular/common@22.2.0 @angular/compiler@22.2.0 @angular/compiler-cli@22.2.0 @angular/platform-browser@22.2.0 @angular/build@22.2.0 ng-packagr@22.2.0 typescript@~6.0.3
npm i -D storybook@10.6.0 @storybook/angular-vite@10.6.0 @storybook/addon-vitest@10.6.0 @storybook/addon-a11y@10.6.0 @analogjs/vite-plugin-angular@^2.7.5 vite@^8.3.1 vitest@~4.1.11 @vitest/browser-playwright@~4.1.11
npm i -D @playwright/test@1.63.0 @nx/playwright@23.2.1 foundation-sites@6.9.0
npx playwright install chromium
```

### Candidate 1: built-in `mount`, Storybook iframe as the gallery

Why first: no second build pipeline, no adapter package, and the story is
rendered by the exact code path that addon-vitest and the e2e layer already
exercise. The only new code is about 40 lines of `window.mount`.

Files:

- `libs/ui/.storybook/main.ts`: `framework: '@storybook/angular-vite'`,
  addons a11y and vitest (as in tooling-baseline).
- `libs/ui/.storybook/playwright-gallery.ts` (imported for its side effect
  from `.storybook/preview.ts`): defines

  ```ts
  const channel = (globalThis as any).__STORYBOOK_ADDONS_CHANNEL__;
  let current: string | undefined;
  function once(storyId: string) {
    return new Promise<void>((resolve, reject) => {
      const done = () => { off(); resolve(); };
      const fail = (e: unknown) => { off(); reject(new Error(`Story ${storyId} failed: ${JSON.stringify(e)}`)); };
      const off = () => {
        channel.off('storyRendered', done);
        channel.off('storyMissing', fail);
        channel.off('storyErrored', fail);
        channel.off('storyThrewException', fail);
      };
      channel.on('storyRendered', done);
      channel.on('storyMissing', fail);
      channel.on('storyErrored', fail);
      channel.on('storyThrewException', fail);
    });
  }
  (window as any).mount = async ({ story, props }: { story: string; props?: Record<string, unknown> }) => {
    if (story !== current) {
      const rendered = once(story);
      current = story;
      channel.emit('setCurrentStory', { storyId: story, viewMode: 'story' });
      await rendered;
    }
    if (props) {
      // first mount with props and every update(): args change on the live story
      const rerendered = once(story);
      channel.emit('updateStoryArgs', { storyId: story, updatedArgs: props });
      await rerendered;
    }
  };
  (window as any).unmount = async () => { current = undefined; channel.emit('forceRemount', {}); };
  ```

  The prototype settles the details marked as open below (whether
  `updateStoryArgs` emits `storyRendered` again, how to apply props on the
  first mount, what `unmount` should do).
- Root element, two options to try: (a) a global decorator in
  `preview.ts`: `componentWrapperDecorator((story) => \`<div id="root">${story}</div>\`)`,
  or (b) keep the DOM untouched and override the fixture in
  `libs/ui-ct/src/fixtures.ts`:
  `export const test = base.extend({ mount: async ({ page, baseURL }, use) => ... page.locator('#storybook-root') })`.
  Option (b) avoids changing story DOM for axe and Storybook screenshots.
- `libs/ui-ct/playwright.config.mts` (separate Nx project so
  `@nx/playwright/plugin` infers `e2e` / `e2e-ci`):

  ```ts
  import { defineConfig, devices } from '@playwright/test';
  export default defineConfig({
    testDir: './src',
    projects: [{ name: 'components', use: { ...devices['Desktop Chrome'],
      baseURL: 'http://localhost:4400/iframe.html?embed=true',
      reuseContext: true, serviceWorkers: 'block' } }],
    webServer: { command: 'npx nx run ui:static-storybook', url: 'http://localhost:4400/iframe.html',
      reuseExistingServer: true },
  });
  ```

  `embed=true` stops play functions from auto-running (Storybook
  `shouldAutoplay`), so the Playwright test owns the interaction.
- `libs/ui-ct/src/button.spec.ts`:

  ```ts
  import { test, expect } from '@playwright/test';
  test('toggles', async ({ mount }) => {
    const c = await mount('components-button--stateful');
    await c.getByRole('button').click();
    await expect(c.getByTestId('click-count')).toHaveValue('1');
  });
  test('args update keeps state', async ({ mount }) => {
    const c = await mount('components-button--primary', { label: 'One' });
    await c.update({ label: 'Two' });
    await expect(c.getByRole('button')).toHaveText('Two');
  });
  ```

Commands:

```
npx nx run ui:build-storybook
npx nx e2e ui-ct            # or: npx playwright test -c libs/ui-ct/playwright.config.mts --project=components
npx nx test-storybook ui    # confirm the same stories still pass under addon-vitest
```

Pass criteria: mount by Storybook story id; `update(props)` changes args
without a navigation; a render error or unknown id rejects `mount`; the same
CSF file passes `nx test-storybook`; `toHaveScreenshot` on the root is
stable; trace viewer shows the steps.

### Candidate 2: built-in `mount`, Angular-native gallery (no CSF reuse)

Why second: the least Storybook coupling and the most direct Angular 22 path
(no JIT story templates), so the highest chance of working mechanically, but
stories are written twice (CSF for Storybook, `*.story.ts` for Playwright).
It is the fallback if candidate 1's channel approach fails.

Files:

- `libs/ui/playwright/vite.config.mts`: `defineConfig({ root: __dirname +
  '/..', plugins: [angular({ tsconfig: 'libs/ui/tsconfig.lib.json' })],
  server: { port: 3100 } })` with `angular` from
  `@analogjs/vite-plugin-angular`.
- `libs/ui/playwright/gallery/index.html`: `<div id="root"></div><script
  type="module" src="./main.ts"></script>`.
- `libs/ui/playwright/gallery/main.ts`: `import.meta.glob('../../src/**/*.story.ts')`,
  id derivation per the gallery spec, `createApplication({ providers:
  [provideZonelessChangeDetection()] })` once, then
  `createComponent(StoryType, { environmentInjector, hostElement })` into
  `#root`, `componentRef.setInput(k, v)` for each prop, `appRef.attachView`,
  and on `update` with the same story only `setInput` (state preserved);
  `window.unmount` destroys the ref. Import the Foundation CSS build here.
- `libs/ui/src/lib/button/button.story.ts`: standalone wrapper components per
  scenario (`Primary`, `Disabled`, `Stateful` with the hidden input).
- `libs/ui-ct2/playwright.config.mts`: as candidate 1 with
  `baseURL: 'http://localhost:3100/playwright/gallery/index.html'` and
  `webServer.command: 'npx vite --config libs/ui/playwright/vite.config.mts'`.

Commands: `npx playwright test -c libs/ui-ct2/playwright.config.mts`.

### Candidate 3: built-in `mount`, portable-stories gallery

Why third: reuses CSF like candidate 1, but runs the Angular renderer outside
the Storybook server, so it must reproduce what the framework's `viteFinal`
does (Analog plugin options, `@angular/compiler` for JIT templates, Angular
builder options, zoneless) and it gets no addon-a11y. `composeStory` passes
`forceRemount: true` to `renderToCanvas`, so `update()` is expected to
re-bootstrap and lose component state.

Files:

- `libs/ui/playwright/vite.config.mts`: Analog plugin as in candidate 2, plus
  `optimizeDeps.include: ['@angular/compiler']`.
- `libs/ui/playwright/gallery/main.ts`:

  ```ts
  import '@angular/compiler';
  import { setProjectAnnotations } from '@storybook/angular-vite';
  import { composeStory } from 'storybook/preview-api';
  import * as preview from '../../.storybook/preview';
  setProjectAnnotations([preview]);
  const files = import.meta.glob('../../src/**/*.stories.ts');
  (window as any).mount = async ({ story, props }) => {
    const [file, name] = resolve(story);                  // gallery-owned id grammar
    const mod: any = await files[file]();
    const { play, ...annotations } = mod[name];           // Playwright owns interactions
    const composed = composeStory(annotations, mod.default, undefined, undefined, name);
    await composed.run({ canvasElement: document.getElementById('root')!, args: { ...composed.args, ...props } });
  };
  ```
- `libs/ui-ct3/playwright.config.mts`: as candidate 2.

Commands: `npx playwright test -c libs/ui-ct3/playwright.config.mts`.

### Not candidates

- `@sand4rt/experimental-ct-angular` only as a time-boxed spike if all three
  fail: separate `package.json` in `D:/tmp/pw-ct-sand4rt/` with
  `@sand4rt/experimental-ct-angular@1.61.1`, npm `overrides` for the Angular
  peers, and its own `playwright-ct.config.mts` on the bundled Playwright
  1.61.1. Any result would be unmaintainable on 1.63.
- `@jscutlery/playwright-ct-angular`: Playwright 1.47.1, Angular `<22`.
- `@playwright-labs/selectors-angular`: not a mount; may be added to any
  candidate for inspection in a development Storybook.

## Open questions

1. Candidate 1: does `updateStoryArgs` in a manager-less iframe re-render and
   emit `storyRendered` (so `update()` can await it), and does the Angular
   renderer keep component state across an args change? The runtime shows the
   listener; the Angular renderer's args path was not traced.
2. Candidate 1: the first `mount(id, props)` must merge props into args. The
   cleanest route (emit `updateStoryArgs` after `storyRendered`, or pass
   `args` in the URL, which the fixture's fixed `baseURL` prevents) is for the
   prototype to settle.
3. Whether `window.ng` exists in `build-storybook` output (production mode),
   which decides whether `@playwright-labs/selectors-angular` works on the
   static build.
4. Axe in the Playwright layer (`@axe-core/playwright` versions and peers)
   was not researched; the addon-a11y gate stays in the Storybook Vitest run.
5. Whether Storybook ids or Playwright-style path ids should be the gallery
   grammar, and whether to generate the `Stories` registry from the Storybook
   index (`index.json`) for type-checked ids.
