# Prototype: unload after leave without private API

Ticket: [Prototype: unloading family styles after leave animations without private API](../../issues/188-prototype-unload-after-leave-without-private-api.md).
Builds on [prototypes/lazy-family-styles/README.md](../lazy-family-styles/README.md) (measurement 6) and [research/lazy-style-loading.md](../../research/lazy-style-loading.md) (3.3 item 1, M3', M4).

## Question

184 found that a family's styles unload reliably after leave animations only by waiting on Angular's private `ɵallLeavingAnimations`. How can the library unload a family's styles after the last instance and its leave animation are gone, using public API only, and what does each way cost? Candidates: (1) styles Angular's renderer does not own, (2) timing the unload on the host element, (3) a public hook that gets Angular's own removal to run, (4) upstream plans.

## Why Angular skips the removal

`NG/` is `d:/projects/github/angular/angular` at 22.2.x, commit `5db6fc4`. All facts here were read from source.

- `NoneEncapsulationDomRenderer.destroy()` calls `removeStyles` only when `allLeavingAnimations.size === 0`, with no retry (`NG/packages/platform-browser/src/dom/dom_renderer.ts:679-686`). The set is global (`NG/packages/core/src/animation/longest_animation.ts:171`).
- `ɵɵanimateLeaveListener` adds its view to the set when the template creates the element (`NG/packages/core/src/render3/instructions/animation.ts:416`). `runLeaveAnimations` adds it when a leave starts (`:288`), and so does the removal path (`NG/packages/core/src/render3/node_animations.ts:81`). It is deleted when the animations settle (`node_animations.ts:181`, `:186`, `:302`, `:357`).
- `REMOVE_STYLES_ON_COMPONENT_DESTROY` is read once, in the root `DomRendererFactory2` constructor (`dom_renderer.ts:174`). With `false`, `destroy()` returns before any removal (`:680-682`). It can only turn removal off, and it cannot be set per carrier.
- `createComponent` reads `RendererFactory2` from the injector chain it is given (`NG/packages/core/src/render3/component_ref.ts:141-148`). The component view's renderer comes from `rendererFactory.createRenderer(native, def)` (`NG/packages/core/src/render3/view/construction.ts:236-247`). `DomRendererFactory2.createRenderer(element, null)` returns the default renderer, which applies no styles (`dom_renderer.ts:193-195`). Renderers are cached per component id (`:221-222`, `:284`). So a `RendererFactory2` provided in a child `EnvironmentInjector` (public: `createEnvironmentInjector`, `RendererFactory2`, `RendererType2.styles`) sees the carrier's compiled CSS and decides whether Angular's `SharedStylesHost` gets it. Candidates 1 and 3 `retry` rely on this.

## What was built

The 184 workspace was copied to `D:/tmp/nfs-proto-188` (Nx 23.2.1, Angular 22.2.0, `@angular/build` and `@angular/ssr` 22.2.0, Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6, on Windows 11 arm64). It is not committed. Only `src/lib/family-styles.ts`, the lifecycle page, and `project.json` changed. The service still counts hosts per family, and still holds server-rendered instances (184's measurement 7). The prototype switch `?unload=<mode>` now also reaches the server, through `REQUEST`.

| Mode | Candidate | What it does |
| --- | --- | --- |
| `immediate` | 184 baseline | Destroys the carrier at count 0. This is Angular's own behaviour. |
| `animations` | 184 baseline | Waits until `document.getAnimations()` has no finite running animation, then destroys the carrier. |
| `private` | 184 baseline | Polls `ɵallLeavingAnimations.size === 0`, then destroys the carrier. Private API. |
| `repair` | 184 baseline | `animations`, then removes a leftover `<style>` that Angular owns with `element.remove()`. |
| `host` | 2 | Counts released hosts until they are disconnected, with one `MutationObserver` on the document and a check one frame after release. Then destroys the carrier. |
| `host-animations` | 2 | `host`, then the `animations` wait, then destroys the carrier. |
| `after-render` | 3 | Destroys the carrier in `afterNextRender`. |
| `retry` | 3 | A `RendererFactory2` in the carrier's child injector remembers the renderer Angular made. After destroy, if the family's `<style>` is still there, it calls that renderer's public `destroy()` again every 50 ms until Angular's guard lets `removeStyles` run. |
| `own-style` | 1 | The child-injector `RendererFactory2` captures `RendererType2.styles` and returns the default renderer, so Angular never inserts them. The library appends its own `<style data-nfs-family>` (with `CSP_NONCE`). On the server it does this in the server document. On the client it adopts the server element by attribute, with no carrier chunk. Host timing is as in `host`, then the element is removed. |
| `adopted` | 1 | As `own-style`, but the client uses a constructed `CSSStyleSheet` in `document.adoptedStyleSheets`. The server writes a `<style>`, because adopted sheets are not serialised. The client replaces that `<style>` with an adopted sheet at bootstrap. |
| `own-link` | 1 | Each family is a non-injected global bundle (`{input, bundleName: 'nfs-<family>', inject: false}` in `project.json`). The library inserts and removes `<link rel="stylesheet" href="nfs-<family>.css" data-nfs-family>` itself, as `NfsStyleLoader` does, on the server too, and adopts the server link. It needs no carrier chunk. Measured with the default build and with `optimization.styles.inlineCritical: false` (configuration `nocritical`). |

Measured per mode, on fresh pages: 184's L1, L2, and L3, each followed by two add/remove rechecks. Also measured: a client-only first render, full hydration of a server-rendered callout (`/lifecycle?n=1`), and incremental hydration (`/ssr`, `@defer (on interaction; hydrate on interaction)`). "Applied" means a fresh plain `div.callout` computes `padding-top: 44px` (the consumer's setting; 0px when no copy of the family's CSS applies). Every frame of L1 sampled the leaving callout's padding.

## What is here

- `src/lib/family-styles.ts`: the service with all eleven modes. `CarrierRendererFactory` is the public-API hook.
- `src/app/lifecycle-page.ts`: 184's page plus `?n=` (server-rendered callouts) and a probe element.
- `project.json`: the four `inject: false` family bundles, and the `nocritical` configuration.
- `measure/measure-188.mjs`: all scenarios for one engine. `measure/summarize-188.mjs` prints one line per mode. `measure/probe-188.mjs` records, per mode, the style mutations before `DOMContentLoaded`, the chunks fetched at hydration, and where the CSS lives.
- `results/`: raw JSON for the run reported here, `summary.txt`, and `probe-188.json`.

## How to run

```
cd D:/tmp/nfs-proto-188
npx nx run fixture:build:production --skip-nx-cache
npx nx run fixture:build:nocritical --skip-nx-cache
NG_ALLOWED_HOSTS=localhost,127.0.0.1 PORT=4621 node dist/apps/fixture/server/server.mjs &
NG_ALLOWED_HOSTS=localhost,127.0.0.1 PORT=4622 node dist/apps/fixture-nocritical/server/server.mjs &
node measure/measure-188.mjs chromium     # also firefox, webkit; about 6 minutes each
BASE=http://localhost:4622 TAG=-nocritical node measure/measure-188.mjs chromium own-link
node measure/summarize-188.mjs
node measure/probe-188.mjs
```

## Results

The three engines agreed on every pass and leak. Times are per engine, Chromium / Firefox / WebKit. The engines ran in parallel, so the times are rough.

### Leave scenarios

L1: a callout inside an element with `animate.leave` (600 ms) is removed. L2: the last callout is destroyed while an unrelated leave runs. L3: the last callout is destroyed while an element with an `(animate.leave)` listener is on the page, and that element later leaves. "Leak" means the CSS still applies after the scenario and after both rechecks.

| Mode | Public API only | L1 | L2 | L3 | Styled through the L1 leave |
| --- | --- | --- | --- | --- | --- |
| `immediate` | yes | leak | leak | leak | yes (it never unloads) |
| `animations` | yes | pass, 15-30 ms after the leave | pass, about 615-650 ms (waits for the unrelated leave) | **leak** | yes |
| `private` | **no** | pass | pass, about 620-640 ms | pass once the listener element leaves; held while it is present | yes |
| `repair` | yes, but it removes a `<style>` Angular owns | pass | pass | pass, while the listener is present too | yes |
| `host` | yes | pass, in the frame the host left | **leak** | **leak** | yes |
| `host-animations` | yes | pass, 31-32 ms | pass, about 620-645 ms | **leak** | yes |
| `after-render` | yes | **leak** | **leak** | **leak** | yes (it never unloads) |
| `retry` | yes | pass, 15-60 ms | pass, about 640-675 ms | pass once the listener element leaves (27-32 calls to `destroy()` in the 1.5 s it was present) | yes |
| `own-style` | yes | pass, in the frame the host left | pass, 57 / 66 / 127 ms | pass, while the listener is present too | yes |
| `adopted` | yes | pass, in the frame the host left | pass, 101 / 73 / 140 ms | pass, while the listener is present too | yes |
| `own-link` | yes | pass, in the frame the host left | pass, 58 / 69 / 133 ms | pass, while the listener is present too | yes |

The L1 leave lasted 650-750 ms. No mode left the leaving callout unstyled for a single frame (0 of 37-52 frames in every engine).

### SSR and hydration

| Mode | Server HTML | JS off | Full hydration | Incremental hydration | After the last instance |
| --- | --- | --- | --- | --- | --- |
| Angular carrier modes (`immediate` to `retry`) | one `<style ng-app-id>` | styled | 0 style mutations after `DOMContentLoaded`, 0 unstyled frames, 1 copy; fetches the carrier chunk | styled while dehydrated, 0 mutations at hydration | unloaded |
| `own-style` | one `<style data-nfs-family>` | styled | 0 mutations, 0 unstyled frames, 1 copy (the server element, adopted); **no carrier chunk fetched** | as above | unloaded |
| `adopted` | one `<style data-nfs-family>` | styled | the server `<style>` is removed at bootstrap, before `DOMContentLoaded` (`readyState` `interactive`), and replaced by 1 adopted sheet. 0 unstyled frames, no carrier chunk | as above | unloaded |
| `own-link`, default build | `<link media="print" data-beasties-media="all">` plus a `<noscript>` copy | styled | 0 mutations, 0 unstyled frames, **2 copies**: Beasties put the callout's critical rules into its own unmanaged first `<style>` | as above | **leak**: the Beasties copy still styles a new `div.callout` (44px), on `/lifecycle` and `/ssr` |
| `own-link`, `inlineCritical: false` | one plain `<link>` | styled | 0 mutations, 0 unstyled frames, 1 copy | as above | unloaded |

Client-only first render (the family is first used after hydration), unstyled frames: 0 in every engine and mode, except 1 in Firefox for `host`, `host-animations`, and `own-link` (default build). That is the local chunk or `.css` fetch. 184 saw the same single Firefox frame for lazy carriers, and a cold network was not tried.

### Verdict per candidate

1. **Styles Angular does not own: pass, all engines, all three scenarios.** This is the only public-API way that also unloads while an `(animate.leave)` listener stays on the page. In that case it does better than the private wait.
   - `own-style`: needs no build or consumer change beyond 184. Costs: about 40 lines for the `RendererFactory2` hook and 30 for the owned element. It relies on two behaviours Angular does not document, read from source: `createComponent` takes `RendererFactory2` from the given injector, and a `null` type yields a renderer with no styles. It also gives up what `SharedStylesHost` does for free: `ng-app-id` adoption (replaced by the library's attribute), text dedupe, the nonce (copied by the library), and shadow-root hosts. It saves the carrier chunk download at hydration.
   - `adopted`: costs the same, plus one style mutation at bootstrap. Constructed stylesheets are Baseline widely available on the map's date (research 5.4).
   - `own-link`: costs four `styles` entries in `project.json`, plus `inlineCritical: false`. Without that setting, the Beasties copy leaks. With it, the app loses critical-CSS inlining for its global stylesheet. A family first used on the client waits on a `.css` fetch. It needs no hook into the renderer.
2. **Host timing alone: fail.** Waiting until the host is disconnected fixes L1 only. Adding `document.getAnimations()` also fixes L2, as 184's `animations` did. Angular's guard still reads the global set, so L3 leaks whatever the library waits for. Its parts do help: the `MutationObserver` host timing is what candidate 1 uses, and it is why candidate 1 never unstyles a leaving host and removes in the same frame the host leaves.
3. **Getting Angular's own removal to run: `after-render` fails, `REMOVE_STYLES_ON_COMPONENT_DESTROY` cannot help (from source), and `retry` passes with costs.** `afterNextRender` runs while the leave is still in the set. `retry` calls the public `Renderer2.destroy()` again until Angular's guard passes. It matches `private` in every scenario. Its costs: it polls 20 times a second for as long as any `(animate.leave)` listener element exists, which can be the whole page life. Unload waits for that too. It also depends on `destroy()` being a no-op while the set is non-empty, and on the per-type renderer cache.
4. **Upstream: no change and no plan found.** angular/angular#66244 ("Angular never removes style tags on destroy if any component has (animate.leave) hook", open since 2025-12-24, labels `area: core` and `core: animations`) is this bug. On 2026-01-06 a maintainer called it complicated, because a parent's CSS must stay while a child animates away. No PR is linked. On `origin/main` (2026-09-25), `dom_renderer.ts:683` is unchanged. Nothing after `4924108630` touches the guard, and `CHANGELOG.md` has no entry for it. #66255 was a related memory leak in the set, fixed by `80b0fbba1f`, and the guard did not change. Read only; nothing filed.

## Open unknowns

- A host with its own `animate.leave` (not an ancestor's) was not measured separately. Its element also stays connected until the leave ends, so candidate 1 should behave as in L1 (inferred).
- A cold network for a family first used on the client, for `own-link` and lazy chunks.
- CSP: whether `style-src` nonces cover constructed stylesheets (`adopted`), and the nonce on an owned `<link>`. Not measured.
- Several Angular applications on one page (Storybook roots), where `SharedStylesHost` is per application and an owned element per document would need a platform-level count.
- Whether `retry` stays correct when the family is acquired again while a retry is pending. The loop stops on acquire, but the record count then runs one above the library's. 184 found the same for `repair`.
- Long runs, and later Angular versions changing `createComponent`'s injector lookup, `createRenderer(element, null)`, or the `destroy()` guard.
