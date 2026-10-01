# Prototype: a paint gate, hashed `<link>` assets, and an unload grace period

Ticket: [Prototype: a paint gate, hashed `<link>` assets, and an unload grace period](../../issues/197-prototype-paint-gate-hashed-links-grace-period.md).
Builds on [Consult: new approaches to loading family styles](../../issues/192-consult-fable-style-loading.md) ([research/style-loading-consult.md](../../research/style-loading-consult.md), proposals D, E, and G), [prototypes/link-family-styles/README.md](../link-family-styles/README.md) (ticket 189, whose loader and measurements are reused), and [prototypes/unload-after-leave/README.md](../unload-after-leave/README.md) (ticket 188, whose host timing is reused).

## Question

Do the consult's three untested proposals work?

- **D, a paint gate.** `[data-nfs-pending] { visibility: hidden }` in the global layer, plus an `(animate.enter)` host listener that waits for the family sheet. Measured: invisible frames, layout shift, focus, and axe during the gap, on 189's `/client-defer` and `/enter` with the family CSS delayed 300 ms.
- **E, hashed `<link>` assets.** The plugin's `file` loader emits a hashed CSS asset URL, and the library inserts it as a `<link>`. Measured: `deployUrl`, `baseHref`, i18n, cache busting after a settings change, and whether hydration and leave scenarios still pass.
- **G, a grace period or `link.disabled`.** For a family that opens and closes often, keep its styles briefly instead of unloading and reloading them. Measured: a tight insert/remove loop, `<style>` and `<link>` churn, style recalculation time, and whether the grace period leaves a stale style after the last instance.

Families are 184's: Callout alone, Dropdown Menu over Menu, and Button. Every measurement here uses the callout.

## What was built

The workspace is `D:/tmp/nfs-proto-197`. It is a copy of 192's probe, made with robocopy `/E /XJ` and without `node_modules`, `.nx`, `.angular`, `dist`, `out`, and logs. Its `node_modules` is a directory junction to `D:/tmp/nfs-proto-189/node_modules`. Remove the junction with `rmdir` before deleting the folder; a traversing delete would empty 189's `node_modules`. Versions: Nx 23.2.1, Angular 22.2.0, Dart Sass 1.104.1, Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6, on Windows 11 arm64. axe-core 4.13.0 is read from `D:/tmp/nfs-proto-190/node_modules/axe-core/axe.min.js`. Nothing is committed there.

There are three build targets (`gen-project.mjs` writes `project.json`):

| Target | Port | What it is |
| --- | --- | --- |
| `build:production` (`@angular/build:application`) | 4791 | 189's `<link>` loader with per-family `inject: false` bundles, used for D and G |
| `build-plugin` (`@nx/angular:application`) | 4792 | 192's proposal A, an owned `<style>` from the directive's chunk, used for G |
| `build-file:<config>` (`@nx/angular:application`) | 4793-4797, 4801-4804 | proposal E: `production`, `subpath` (`baseHref: '/sub/'`), `cdn` (`deployUrl`), `i18n` (`localize`, `da` and `en-US`), `cachebust` (one callout setting changed), and the four attempt-2 builds (`*-prefix`) |

The changes to 192's code are listed here; paths are under `apps/fixture/src/` in the workspace and under `src/` here.

- **`lib/link-styles.ts`**, the library service, gained three browser-only query switches, so that one build serves both the baseline and the variant:
  - `?gate=1` (D). `acquire()` sets `data-nfs-pending` on a host when any of its families has not loaded. A loaded family is a `<link>` with a `sheet`, or one whose `load` or `error` event has fired; a `<style>` counts as loaded at once. The service clears the attribute on `load`. `whenStyled(host)` resolves once every family of the host has loaded. The server never sets the attribute, because server-rendered links are render-blocking.
  - `?grace=<ms>` (G). At count 0 the service starts one timer per family. When it fires, the service removes the element if the count is still 0. An `acquire` cancels the timer.
  - `?keep=disabled` and `?keep=sheet` (G). At count 0 the service sets `element.disabled = true` or `element.sheet.disabled = true` instead of removing the element. The next `acquire` turns it back on.
  - `protoSource === 'file'` (E). The href is the URL that the directive module's `nfs-family-css:<family>` import resolved to. With `protoFilePrefix` (attempt 2), a `./`-relative URL is resolved against the global `styles-*.css` link's directory, as 189's prefix is.
- **`lib/scss/global.scss`** adds `[data-nfs-pending] { visibility: hidden; }` inside `@layer nfs.global`.
- **`lib/directives/enter.ts`** (D) is `nfsEnter="<class>"`. It binds `host: { '(animate.enter)': 'onEnter($event)' }` and waits for `whenStyled(host)`. Then it adds the class, removes it on `animationend`, and calls `event.animationComplete()`. If no animation is computed one frame after it adds the class, it removes the class.
- **`lib/css/<family>.ts`** exports `''` in the `<link>` build. In both plugin builds, `fileReplacements` swaps in `<family>.plugin.ts` (`export { default } from 'nfs-family-css:<family>'`). The directive modules import `../css/<family>`, so the same directive code serves all three targets.
- **`tools/nfs-esbuild-plugin.mjs`** gained `mode: 'file'`. `onLoad` then returns `{ contents: css, loader: 'file' }`, and the resolved path is `nfs-<family>.css`, so the asset gets a `.css` extension and a `text/css` type.
- **Pages.** `/client-defer` gained a focusable `#c-inner` inside the callout and a `#after` paragraph below the block. `/enter?gate=1` uses `nfsEnter="proto-enter"` in place of `animate.enter="proto-enter"`. `/churn` is new: one toggled callout above 3,000 `<p>` rows.

## What is here

- `project.json`, `gen-project.mjs`, `build-all.sh` (every target, about 10 minutes, with one retry because Nx's plugin workers sometimes time out on this machine), `serve.sh`, and `kill-servers.sh` (stops only these ports, by PID).
- `src/lib/link-styles.ts`, `src/lib/directives/enter.ts`, `src/lib/directives/callout.ts`, `src/lib/css/callout.ts`, `src/lib/css/callout.plugin.ts`, `src/lib/switches*.ts`, `src/lib/scss/global.scss`, `src/app/{client-defer,enter,churn}-page.ts`, `src/app/app.routes.ts`, and `tools/nfs-esbuild-plugin.mjs`. The other files are 192's and 189's.
- `measure/probe-d.mjs` (D), `measure/probe-d-hydration.mjs` (the gate on server-rendered pages), `measure/probe-e.mjs` (E), `measure/probe-g.mjs` (G), `measure/lib-189.mjs` (189's measurement functions, extracted from its `measure.mjs`, with `m6Leave` taking a base URL), and `measure/summarize.mjs`.
- `results/sequential/` holds D and G with one engine at a time, the primary numbers. `results/parallel/` holds the first run, with the three engines at once; E is there too, because E has no timing. `results/probe-d-hydration.json`, `results/summary-sequential.txt`, and `results/summary-parallel.txt` complete the set.

## How to run

```
cd D:/tmp/nfs-proto-197
bash build-all.sh
./serve.sh &                 # 4791-4797 and 4801-4804; sets NG_ALLOWED_HOSTS=localhost,127.0.0.1
OUT=out/seq node measure/probe-d.mjs chromium 5     # also firefox, webkit; about 4 minutes each
OUT=out/seq node measure/probe-g.mjs chromium 5     # about 6 minutes each
node measure/probe-e.mjs chromium                   # starts its own server on 4798-4800 for the swap
node measure/probe-d-hydration.mjs
OUT=out/seq node measure/summarize.mjs
./kill-servers.sh
```

A single server looks like this: `NG_ALLOWED_HOSTS=localhost,127.0.0.1 PORT=4791 node dist/apps/fixture-production/server/server.mjs`. Slow-network runs set the cookie `nfs-delay-css=300`, which `server.ts` (189's) honours for `nfs-*.css`. The E assets are named `media/nfs-<family>-<hash>.css`, so the cookie applies to them too.

## Results

Unstyled frames are counted as in 184 and 189: `getComputedStyle` is sampled every `requestAnimationFrame`, and a frame is unstyled when the callout's `padding-top` is not the consumer's 44px. Timings are a median with the range in brackets, over 5 runs per engine. The engine order is Chromium / Firefox / WebKit.

### D: the paint gate (`results/sequential/probe-d-*.json`)

Client-only `@defer (on interaction)`, family CSS delayed 300 ms, 189's `<link>` build (4791). The E build (4793) gave the same picture.

| | Without the gate | With `?gate=1` |
| --- | --- | --- |
| Visible unstyled frames | 19 [19-20] / 19 [19-20] / 19 [19-20] | **0 in every run, every engine** |
| Invisible frames (`visibility: hidden`) | 0 | 20 [19-20] / 18 [13-20] / 20 [19-20] |
| ms from the element's first frame to its first styled, visible frame | 315 [309-333] / 320 [316-333] / 328 [305-329] | 324 [310-333] / 322 [300-330] / 328 [313-360] |
| `#after` (content below) | moves once, 40px to 130px, when the sheet applies | the same: moves once, 40px to 130px |
| Chromium `layout-shift` entries | 0.0064 per run, all with `hadRecentInput` | 0.0047 per run, all with `hadRecentInput` |
| `focus()` on `#c-inner` in the insertion task | lands on `#c-inner` | **fails**: `document.activeElement` is `BODY`, and still `BODY` after the sheet loads |
| Accessibility tree during the gap (5 s delay) | callout text and `button "inner action"` exposed, unstyled | **neither exposed**; only the paragraph below |
| axe during the gap | 3 page-level violations of the fixture (`landmark-one-main`, `page-has-heading-one`, `region`) | the same 3; the same 3 after the load in both modes |

- **The gate converts the unstyled frames into invisible frames one for one.** The gap is not shorter: the first styled frame comes at the same time with or without it.
- **Layout shift is not removed.** The content below moves by the same 90px when the sheet applies, in every engine. In Chromium the shift score drops from 0.0064 to 0.0047, because the hidden callout's own content is not counted as shifting. At 300 ms the shift lands 411-485 ms after the click, inside the 500 ms input exclusion, so CLS counts 0. In the parallel run, two ungated shifts landed at 785 and 833 ms and counted towards CLS (0.0064 each). A slower fetch, or an insertion with no input (`on timer`, `on idle`, `on viewport`), would count (inferred from the API's `hadRecentInput` rule).
- **Focus fails during the gap and is not retried.** `visibility: hidden` makes the button unfocusable. A directive that moves focus into new content (a Reveal, an off-canvas pane) would have to wait for `whenStyled()` itself; this prototype did not build that.
- **axe finds nothing new in either mode.** It does not flag unstyled content, and hidden content is excluded. The difference is in the tree: with the gate, a screen reader would not meet the content until it is styled. Without the gate, it meets content that Foundation might hide once styled; for this callout, nothing is hidden.
- **Enter animations: the listener form plays in every case.** `/enter` was run with a click-inserted `@if` and a client-only `@defer`, in both builds, 5 runs each:
  - The class form (`animate.enter`, no gate) was skipped in 5 of 5 runs, in every case and every engine, as 189 measured.
  - The listener form (`nfsEnter`, gate) played in 5 of 5 runs. It started on the element's first visible frame, 314-321 ms after the element appeared (median per case; range 299-339 ms, plus two WebKit E runs at 528 and 612 ms where the fetch itself was late).
  - No frame showed the styled final state before the animation started.
  - The full 500 ms ran: 30-33 frames sampled, and 17-19 in Firefox on the E build, at a lower frame rate. The parallel run agrees, except one WebKit `@defer` run where the animation started 28 ms after the first styled frame, under three-engine load.
- **Hydration is untouched.** With `?gate=1`, `/ssr` (full and incremental hydration) and `/hydrate-defer` (`hydrate on viewport` and `on interaction`) showed 0 frames with any `data-nfs-pending` element, and no console errors, in both builds and all three engines (`results/probe-d-hydration.json`). Adopted server links already have a `sheet`.
- **Cost:** the gate is about 75 lines in the service (the loaded set, the waiters, attribute set and clear, `whenStyled`), 1 global rule, and a 34-line `nfsEnter` directive.

### E: the `file` loader, hashed assets as `<link>` (`results/parallel/probe-e-*.json`)

| Check | Result, all three engines |
| --- | --- |
| Emitted files | `browser/media/nfs-<family>-<hash>.css`, plus an identical second copy under `server/media/` |
| The import's value | `./media/nfs-callout-SKWDWX34.css` in both the browser and server bundles, relative, with no `deployUrl` applied |
| Consumer settings | **pass** in every build (44px callout and 189's other five values) |
| `baseHref: '/sub/'` | **pass**: server and client hrefs are `/sub/media/*.css` (the relative URL resolves against `<base href>`) |
| i18n (`localize`, `/da/`, `/en-US/`) | **pass**: the builder writes `media/` into each locale folder, and hrefs are `/da/media/*.css` and `/en-US/media/*.css` |
| `deployUrl: 'http://127.0.0.1:4795/cdn/'` | **fail, attempt 1**: scripts and the global stylesheet come from the CDN URL, but the family hrefs resolve to the page origin (`http://localhost:4795/media/*.css`). They loaded only because this server also serves the browser folder at `/`; a CDN-only deployment would 404 (inferred). |
| `deployUrl`, attempt 2 (`protoFilePrefix`) | **pass**: the URL resolved against the global stylesheet's directory gives `http://127.0.0.1:4803/cdn/media/*.css`, and `baseHref` and i18n still pass with the prefix |
| Cache busting | **pass**: one callout setting changes only `nfs-callout-SKWDWX34.css` to `nfs-callout-A74BGC2W.css`; the other families keep their names. In one browser context, the page swapped servers and reloaded, and the callout went from 44px to 56px. |
| Lifecycle `0 1 1 1 0 1 0` | **pass**, as the `<link>` build |
| Server HTML, JavaScript off, full and incremental hydration | **pass**: four family links in the server HTML, styled with JavaScript off, 0 style mutations after `DOMContentLoaded`, 0 unstyled frames, hold through the dehydrated instance, probe 0px after the last instance |
| `hydrate on viewport` / `on interaction` | **pass**: 0 unstyled frames out of 149-165, 0 mutations |
| Leave L1, L2, L3 with host timing | **pass**: link removed in the frame the host left, 0 unstyled frames while leaving, rechecks `44px/0` |
| Beasties | no family rules in the inlined critical `<style>`, with the library's `data-beasties-skip` |
| Client-only `@defer` at 300 ms | 19 [19-20] / 12 [11-13] / 20 [19-20] unstyled frames, as 189's `<link>`; 0 with the gate (D) |

- **Bytes.** The callout asset is 981 B against the 688 B that Angular's stylesheet pipeline writes for the same Sass. The plugin's compressed Sass output skips Angular's CSS optimiser, as 189 and 192 found for the string variant.
- **Angular's own manifest.** `server/angular-app-manifest.mjs` lists the assets in `criticalCssPlans` with a Windows backslash join (`/media\\nfs-callout-*.css`, and `http://127.0.0.1:4795/cdn/media\\...` in the `cdn` build). Nothing in the rendered HTML used those entries, because the family links carry `data-beasties-skip`. What reads `criticalCssPlans`, and whether the backslash matters on a POSIX build, was not examined.
- **Consumer setup is A's.** The consumer adds no per-family `styles` entries, but needs Nx's `plugins` option (or a library builder, untested), as 192 found for A.

### G: churn (`results/sequential/probe-g-*.json`)

On `/churn`, one callout over 3,000 rows is toggled 20 times: 100 ms shown, then 100 ms hidden, with the toggle button clicked from page script. "Forced flush" is the time `document.body.offsetHeight` takes in a `MutationObserver` callback after each DOM change, and in a capture-phase `load` listener for links. It works in every engine as a measure of the style and layout work those changes cause. Chromium also reports `RecalcStyleDuration` and `LayoutDuration` through CDP `Performance.getMetrics`.

| Source, mode | `<head>` inserts / removes | Sheet `load` events | Chromium recalc ms | Chromium layout ms | Forced flush ms, Chromium / Firefox / WebKit |
| --- | --- | --- | --- | --- | --- |
| `<link>`, remove at 0 (baseline) | 20 / 20 | 20 | 75 [73-94] | 415 [411-540] | 490 / 1025 / 1695 |
| `<link>`, grace 1000 ms | **1 / 0** | **1** | **8.2 [7.9-9.2]** | **113 [105-131]** | **119 / 1072 / 34** |
| `<link>`, `link.disabled` | 1 / 0, plus 59 `disabled` writes | 20 | 97 [96-98] | 551 [511-569] | 646 / 831 / 1465 |
| `<link>`, `sheet.disabled` | 1 / 0 | 1 | 88 [80-94] | 456 [435-524] | 541 / 909 / 1463 |
| `<style>` (A), remove at 0 | 20 / 20 | n/a | 89 [83-96] | 496 [442-553] | 586 / 777 / 1536 |
| `<style>` (A), grace 1000 ms | **1 / 0** | n/a | **7.2 [6.8-7.3]** | **92 [84-95]** | **101 / 849 / 62** |
| `<style>` (A), `style.disabled` | 1 / 0 | n/a | 80 [77-82] | 433 [420-457] | 515 / 681 / 1652 |
| `<style>` (A), `sheet.disabled` | 1 / 0 | n/a | 98 [88-102] | 505 [473-569] | 606 / 737 / 1675 |

The forced-flush ranges are in `results/summary-sequential.txt`. Every mode made exactly 1 network request for `nfs-callout.css` per run; repeats came from the memory cache.

- **The grace period removes the churn.** One insert and no removal across the loop. In Chromium, style recalc fell from 75 to 8 ms (`<link>`) and from 89 to 7 ms (`<style>`), about 9-12 times less, and layout from about 415-500 ms to about 92-113 ms. In WebKit, forced flushing fell from 1,695 to 34 ms (`<link>`) and from 1,536 to 62 ms (`<style>`). **In Firefox it made no measurable difference**: 1,025 against 1,072 ms (`<link>`) and 777 against 849 ms (`<style>`). Firefox's cost here follows the callout element's own insertion into the 3,000-row page, not the sheet (inferred: the totals are the same whether or not a sheet changes).
- **`disabled` does not help.** `link.disabled = true` drops the sheet (`link.sheet` is `null`), and turning it back on reparses it: 20 `load` events, the same as removal. `sheet.disabled` keeps the parsed sheet (1 `load` event), but toggling it costs as much style and layout work as removing and inserting the element, in every engine and for both sources.
- **The grace period leaves a stale style for up to the grace time, and no longer.** Just after the last instance left, a fresh `div.callout` probe computed 44px with the element still in `<head>`. 1.5 s later the element was gone and the probe computed 0px, in every run and engine. Re-acquiring after that loaded and styled the family again (44px).
- **`disabled` leaves no stale style, but never unloads.** The probe computed 0px at once, and the element stayed in `<head>`: disabled, or with a disabled sheet, for the life of the page.
- **Unstyled frames during the loop.** `<style>`: 0 in every run. `<link>`: 0-1 per run, and 1-2 in Firefox, in every mode including grace, at the first insertion of each run, when the link loads.
- **Parallel runs** (`results/parallel/`) give the same direction, with larger absolute numbers. Chromium recalc was 100 against 9.3 ms for `<link>` and 96 against 9.2 ms for `<style>`; WebKit forced flushing was 2,506 against 42 ms and 3,058 against 100 ms; Firefox again showed no gain.

## Verdict

- **D works for what it claims, and no more.** The 19-20 visible unstyled frames at 300 ms became 0 visible unstyled frames and 18-20 invisible frames. The `(animate.enter)` listener turned "skipped" into "plays on the first visible frame" in every case and engine. Server-rendered and hydrated content is never gated. Four things stay open:
  - the gap is just as long, about 315-330 ms;
  - the content below still moves by the same 90px;
  - focus into the content fails during the gap and is lost;
  - the content is absent from the accessibility tree until the fetch ends.
- **E works, given a library-side URL prefix.** Hashed per-family assets give cache busting with no server or CDN code, and they pass `baseHref`, i18n, hydration, `hydrate on viewport` and `on interaction`, L1-L3, and the lifecycle. The raw `file`-loader URL ignores `deployUrl`. Resolving it against the global stylesheet's directory, as 189 does, fixes that (attempt 2). E keeps the `<link>` loader's fetch-on-construct gap (19-20 frames at 300 ms), so it needs D or a preload for client-only first use. It shares A's build requirement: Nx's `plugins` option or a library builder.
- **G works as a grace period, not as `disabled`.**
  - A 1000 ms grace cut head churn from 20 inserts and 20 removes to 1 and 0. Recalc time fell about 9-12 times in Chromium and forced style and layout time about 25-50 times in WebKit. Firefox showed no measurable difference.
  - The cost is a family's rules applying to an unclaimed `.callout` for up to the grace time after the last instance.
  - `link.disabled` re-parses on every return. `sheet.disabled` costs as much recalculation as removal. Both keep the element forever.

Nothing is decided here; [Decide: how first-milestone directives load and unload their family styles](../../issues/185-decide-lazy-family-styles.md) chooses.

## What this prototype does not prove

- D with focus deferred until `whenStyled()`, or `inert` instead of `visibility: hidden`; D with a Reveal or off-canvas pane, whose focus move and `dialog` semantics differ from a callout's button.
- CLS with an insertion that has no recent input (`@defer (on timer)`, `on idle`, `on viewport` with client-only content). The `hadRecentInput` rule says it would count; it was not measured.
- E's server-side copy under `server/media/`: whether anything reads it, and what reads `criticalCssPlans` with its Windows backslash join. E under Angular CLI without Nx (the library builder from 192, untested), `ng serve`, and HMR. E with Beasties inlining on (`data-beasties-skip` off) and 192's proposal C.
- G's grace length. Only 1000 ms was tried, against a 100 ms toggle. Under host timing, a family whose instances leave with animations longer than the grace still unloads correctly, because the count holds while the host is connected (inferred). Not measured: route navigation, memory held by a disabled sheet, and Firefox's per-flush cost split between the element and the sheet.
- Frame sampling under three-engine load. The parallel run dropped frames in WebKit and Firefox, which changed animated-frame counts but no verdict; the sequential run is the reference.
- CSP, prerendering, zone.js, and several applications per page, for every proposal.
