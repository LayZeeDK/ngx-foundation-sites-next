# Prototype: style loading options against Core Web Vitals, accessibility, and responsiveness

Ticket: [Prototype: Core Web Vitals, accessibility, and responsiveness of the style loading options](../../issues/190-prototype-loading-options-web-vitals-a11y.md).
Builds on [lazy-family-styles](../lazy-family-styles/README.md) (184), [unload-after-leave](../unload-after-leave/README.md) (188), [link-family-styles](../link-family-styles/README.md) (189), and [research/style-loading-consult.md](../../research/style-loading-consult.md) (192, proposal A).

## Question

When do family styles download, and how does each loading option affect Core Web Vitals, accessibility, and responsiveness? The user's four questions (ticket 190, verbatim):

1. Measure the unmeasured variant: download chunks at idle after hydration, as `injectAsync`'s `prefetch: onIdle` does. Verify whether it shrinks the flash window to "used before idle".
2. Which option would give the best Core Web Vitals score?
3. Which option is the most accessible?
4. Which option is the most *responsive*?

"Responsive" is read as responsiveness to input: INP, and the time from an interaction to a styled paint. Responsive design does not depend on the loading option, because each family's media queries travel with its CSS.

## The options

Every option uses 184's consumer-compiled families (`@layer nfs.<family>`, the consumer's settings), the same pages, and production SSR builds (`outputMode: server`, full hydration with event replay, gzip from the `compression` middleware). One family was added for this ticket: **Dropdown** (`.dropdown-pane`), whose first use comes from a click.

| Key | Option | Build | How the family CSS arrives |
| --- | --- | --- | --- |
| A | Separate chunk on first use | `production` | 184's lazy carrier: the directive's constructor `import()`s a carrier chunk and Angular inserts its `<style>` |
| B | Bundled in `main.js` | `eager` | 184's eager carriers, all in the initial JavaScript |
| C | Chunk by default, `eager` opt-in per family | `mixed` | as A, but the consumer's map imports the Dropdown carrier eagerly (`carriers.mixed.ts`); the other four stay lazy |
| D | Chunk prefetched at idle after hydration | `idle` | as A, and after the first render, `ApplicationRef.whenStable()` and `onIdle()` (the `PrefetchTrigger` that `injectAsync` takes), every carrier chunk not yet loaded is imported and kept, so a later first use creates the carrier in the same task |
| E | 188's owned `<style>` | `own` | as A on the client, but the library owns the `<style>` (188's `own-style`): `family-styles.own.ts` is 188's `family-styles.ts` with three changes (the default mode is `own-style`, `provideNfsFamilyStyles` takes a second, ignored argument, and the header comment) |
| L | 189's `<link>` loader | `link` | `link-styles.ts`: 189's loader trimmed to its default: a counted `<link data-nfs-family data-beasties-skip>` to an `inject: false` bundle per family, server-rendered, with 188's host timing |
| LP | `<link>` loader plus preloads | `link-preload` | as L, with 189's `index.html` `<link rel="preload" as="style">` for every family (`index.preload.html`) |
| S | 192's proposal A: the CSS in the directive's chunk | `build-static` | each directive module statically imports `nfs-family-css:<family>`, which the esbuild plugin (`tools/nfs-esbuild-plugin.mjs`, through Nx's `@nx/angular:application` `plugins`) compiles with the consumer's settings; the library inserts its own `<style>` in the same task; routes are lazy (`app.routes.static.ts`), as in 192's probe, so a page's families land in the page's chunk graph |

Two conditions of S differ from the other options, and both are part of its design as 192 probed it. Its routes are lazy, so the landing page's own chunk and its family chunks load before hydration, where the other options have eager routes. And its 300 ms profile delays the page and `@defer` code that carries the CSS, not only a style file (see the profiles).

### What Angular does (read from source)

`NG/` is `d:/projects/github/angular/angular` at 22.2.x, commit `5db6fc4`.

- `injectAsync(loader, { prefetch })` calls `options.prefetch().then(() => load())` when `injectAsync` itself is called (`NG/packages/core/src/di/inject_async.ts:76-81`). `load` keeps the first loader promise (`:68-74`), so a use during the prefetch awaits the same import.
- `onIdle()` resolves through `IDLE_SERVICE.requestOnIdle` (`inject_async.ts:135-145`). The default service is `requestIdleCallback`, or `setTimeout` where it is missing (`NG/packages/core/src/defer/idle_service.ts:23-27`, `:54-56`, `:83-94`). It has no timeout unless one is passed. It does not wait for hydration or stability by itself; option D adds `afterNextRender` and `whenStable()` in front of it.
- `@defer (prefetch on idle)` (`NG/packages/core/src/defer/instructions.ts:386-398`) schedules `triggerPrefetching` in the browser only (`NG/packages/core/src/defer/triggering.ts:106-126`, `:109`; `shouldAttachTrigger`, `:612-620`). That calls `triggerResourceLoading` (`:159-161`), which loads the block's dependencies through `tDetails.dependencyResolverFn` (`:169-193`). So a defer prefetch fetches the directive's code, never a carrier chunk that the directive requests from its constructor (A, C, D, E) or a `<link>` it inserts (L). For S the CSS is inside that code, so `prefetch on idle` on a block would prefetch its family CSS too (inferred, not measured).

## How it was measured

Workspace: `D:/tmp/nfs-proto-190`, a copy of 184's (Nx 23.2.1, Angular 22.2.0, `@angular/build` and `@angular/ssr` 22.2.0, Dart Sass 1.104.1, `foundation-sites` 6.9.0, Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6, on Windows 11 arm64). Added: `web-vitals` 6.2.2 (attribution build), `lighthouse` 13.5.0, `axe-core` 4.13.0, `compression` 1.8.2. It is not committed. Viewport 412 x 823.

**Pages.** `/` (scenarios 1, 2, 4, 5): a server-rendered callout and buttons; a click opens a dropdown pane (`@if`), another shows a dropdown menu with a closed submenu (`@if`), and a link navigates to `/menus`. `/menus` (scenario 2's target): a menu, a dropdown menu with a closed submenu, and a closed dropdown pane, none of which `/` renders. `/defer` (scenario 3): no family on the server; a client-only `@defer (on interaction)` callout, and after a 3,000 px spacer a client-only `@defer (on viewport)` block with a button and a dropdown menu.

**Scenarios.**

1. S1: the server-rendered landing page, loaded and left to settle.
2. S2: a client-side navigation from `/` to `/menus` (new families: menu, dropdown-menu, dropdown).
3. S3: `@defer (on interaction)` (callout) and `@defer (on viewport)` (button, menu, dropdown-menu), triggered by a click and by a scroll.
4. S4: a first click inserts a dropdown pane (new family: dropdown).
5. S5: on one page load, the pane before idle and the dropdown menu after idle.

S2, S3, and S4 each run **early** (triggered as soon as the routed page has rendered after hydration, recorded by `afterNextRender` in the page) and **late** (500 ms without network, then 1 s more, so D's prefetch has finished).

**Profiles.** **unthrottled** (local server). **slow4g4x**: Lighthouse's mobile values as DevTools applies them (562.5 ms latency, 1,474.56 kbit/s down, 675 kbit/s up) and 4x CPU slowdown, through CDP, so Chromium only. **delay300**: the server delays every family style file by 300 ms (`server.ts`, a cookie): the lazy JavaScript chunks holding `@layer nfs.` that the page does not load initially (carriers for A, C, D, E; directive and page chunks for S) and the `nfs-*.css` bundles (L, LP). The delay is on the server so the browser's cache and preloads stay in play, as in 189. Firefox and WebKit have no CDP network or CPU throttling in Playwright, so they run unthrottled and delay300 only.

**Probes.**

- Unstyled painted frames. A `ResizeObserver` callback runs after `requestAnimationFrame` callbacks, style, and layout, just before paint, so what it sees is what the frame paints. A 1 px off-screen sentinel changes width every frame so the callback runs every frame. The probe counts frames in which the scenario's element is in the DOM and its family's rules do not apply: the pane is not `position: absolute`; the closed submenu is not `display: none` or its bar is not a flex row; the callout `padding-top` is not 44px; the deferred button's radius is not 8px. 184 and 189 sampled in `requestAnimationFrame`, which misses an element inserted after the callbacks of the frame that paints it. Here 1 frame in the unthrottled runs is that case.
- Trigger to styled frame: from the trigger's `pointerdown` `timeStamp` (or the scroll call) to the first painted frame with the family's rules applied.
- web-vitals 6.2.2 with attribution and `reportAllChanges` (INP with `durationThreshold: 16`), plus raw `layout-shift` and `longtask` entries. LCP, FCP, and INP exist in all three engines (Firefox 155 and WebKit 26.6 list `largest-contentful-paint`, `event`, and `paint`); CLS (`layout-shift`) and long tasks exist in Chromium only.
- Lighthouse 13.5.0, mobile, on `/`, in Chromium 153 (headless, `--disable-gpu`), with three throttling methods: `simulate` (the standard mobile score), `devtools` (the Slow 4G and 4x CPU above, applied), and `provided` (unthrottled).
- Accessibility during the flash (`measure/a11y.mjs`): the family style files are held by a Playwright route from the trigger until the page has been measured, then released. Measured in that state and again once styled: Playwright's accessibility snapshot of `main`, axe-core 4.13.0 (WCAG 2.0-2.2 A and AA and best practices), a Tab walk from the heading (each stop's text and focus outline), the size of every link and button, layout positions, and the CSS transitions started when the CSS arrives, with `prefers-reduced-motion` set to `no-preference` and to `reduce`. Run on A and L (the flash state is the same DOM without the family CSS whichever option produced it), 3 runs per engine.

**Runs.** 5 runs per cell for web-vitals and frames, each in a fresh browser context, with the options interleaved within each run; one discarded warm-up load per option per browser launch. Cells read "median [min-max]". Lighthouse: 5 runs per option and method. S was built after the Chromium runs of the other options, so its Chromium runs were made later on their own (`-S` result files); everything else ran in one sequence. One WebKit sequence stalled on a page that stopped answering; it was stopped and rerun with a 120 s guard per run, which no run reached. Lighthouse retried an audit after a tab crash (9 of 120 audits).

## Results

All 2,800 web-vitals runs completed with no failed run and with every probe styled in the end (5 runs x 10 scenarios x 8 options x 7 engine-profile pairs, S's Chromium runs included). Full per-cell tables with every spread, CLS, and layout-shift totals are in `results/summary-190.md`; the compact tables below come from `measure/readme-tables.mjs`. Other agents ran browser probes on the same machine during part of the Firefox and WebKit runs, and WebKit's unthrottled times have wide spreads (some maxima above 1 s), so read WebKit's unthrottled milliseconds as noisy. The frame counts at 300 ms do not depend on that noise, because the delay sets them.

### When family styles download

| Option | Server-rendered landing page | First client-side use of a new family |
| --- | --- | --- |
| A | CSS inline in the server HTML (Angular's `<style ng-app-id>`); 2 carrier chunks fetched at hydration, not render-blocking, and the app is not stable until they arrive | one chunk at first use |
| B | inline in the server HTML; nothing more | nothing (in `main.js`) |
| C | as A | nothing for opted-in families (Dropdown here); as A for the rest |
| D | as A, then every other carrier chunk after hydration, stability, and an idle callback (5 requests in all) | nothing after the prefetch is done; as A before it |
| E | inline (library-owned `<style>`); nothing at hydration | one chunk at first use |
| L | one render-blocking `<link>` per server-rendered family (`data-beasties-skip`) | one CSS request at first use |
| LP | as L, plus a preload of every family's CSS with the page (5 requests) | nothing once the preload has arrived; the remainder of the preload before |
| S | inline (library-owned `<style>`); the landing page's lazy route chunk and the 4 chunks carrying its directives and their CSS load before hydration | with the code that uses it: a lazy route's chunk, a `@defer` block's chunk |

#### Unstyled painted frames, unthrottled (Chromium/Firefox/WebKit, median of 5)

| Scenario | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S2 navigation, early | 1/1/0 | 0/0/0 | 1/1/1 | 0/0/0 | 2/2/1 | 1/1/1 | 0/0/0 | 0/0/0 |
| S2 navigation, late | 1/2/0 | 0/0/0 | 1/1/0 | 0/0/0 | 2/1/0 | 1/1/0 | 0/0/0 | 0/0/0 |
| S3 `on interaction`, early | 0/1/1 | 0/0/0 | 0/1/1 | 0/0/0 | 0/0/1 | 0/0/1 | 0/0/0 | 0/0/0 |
| S3 `on interaction`, late | 0/1/1 | 0/0/0 | 0/1/1 | 0/0/0 | 0/1/1 | 0/1/1 | 0/0/0 | 0/0/0 |
| S3 `on viewport`, early | 1/1/1 | 0/0/0 | 1/0/1 | 0/0/0 | 1/1/1 | 0/1/1 | 0/0/0 | 0/0/0 |
| S3 `on viewport`, late | 1/1/0 | 0/0/0 | 1/1/0 | 0/0/0 | 1/1/0 | 0/0/0 | 0/0/0 | 0/0/0 |
| S4 pane click, early | 1/0/1 | 0/0/0 | 0/0/0 | 0/0/0 | 1/0/1 | 1/1/1 | 0/0/0 | 0/0/0 |
| S4 pane click, late | 1/0/1 | 0/0/0 | 0/0/0 | 0/0/0 | 1/0/1 | 1/2/1 | 0/0/0 | 0/0/0 |
| S5 pane, before idle | 1/0/1 | 0/0/0 | 0/0/0 | 0/0/0 | 1/0/1 | 1/1/1 | 0/0/0 | 0/0/0 |
| S5 menu, after idle | 1/0/1 | 0/0/0 | 1/1/1 | 0/0/0 | 1/0/0 | 1/0/1 | 0/0/0 | 0/0/0 |

#### Unstyled painted frames, delay300 (Chromium/Firefox/WebKit, median of 5)

| Scenario | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S2 navigation, early | 20/20/19 | 0/0/0 | 20/20/19 | 19/20/16 | 20/20/19 | 19/20/18 | 0/0/0 | 0/0/0 |
| S2 navigation, late | 20/20/19 | 0/0/0 | 19/19/18 | 0/0/0 | 20/20/18 | 19/19/19 | 0/0/0 | 0/0/0 |
| S3 `on interaction`, early | 18/19/21 | 0/0/0 | 18/20/21 | 15/13/8 | 19/19/21 | 18/20/20 | 9/6/0 | 0/0/0 |
| S3 `on interaction`, late | 19/19/21 | 0/0/0 | 19/19/20 | 0/0/0 | 19/19/21 | 19/19/20 | 0/0/0 | 0/0/0 |
| S3 `on viewport`, early | 19/19/19 | 0/0/0 | 19/19/21 | 18/17/19 | 19/19/20 | 19/19/20 | 12/11/0 | 0/0/0 |
| S3 `on viewport`, late | 19/20/20 | 0/0/0 | 19/19/20 | 0/0/0 | 19/19/19 | 19/19/20 | 0/0/0 | 0/0/0 |
| S4 pane click, early | 19/20/21 | 0/0/0 | 0/0/0 | 19/20/20 | 19/19/21 | 19/19/20 | 0/0/0 | 0/0/0 |
| S4 pane click, late | 19/20/20 | 0/0/0 | 0/0/0 | 0/0/0 | 20/20/20 | 20/19/20 | 0/0/0 | 0/0/0 |
| S5 pane, before idle | 20/19/21 | 0/0/0 | 0/0/0 | 19/19/20 | 20/20/20 | 19/19/20 | 0/0/0 | 0/0/0 |
| S5 menu, after idle | 19/19/20 | 0/0/0 | 20/19/20 | 0/0/0 | 20/19/20 | 19/19/20 | 0/0/0 | 0/0/0 |

#### Unstyled painted frames; trigger to styled frame, slow4g4x (Chromium, medians of 5)

| Scenario | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S2 navigation, early | 35; 692 ms | 0; 108 ms | 35; 722 ms | 35; 712 ms | 34; 727 ms | 33; 695 ms | 0; 99 ms | 0; 713 ms |
| S2 navigation, late | 34; 713 ms | 0; 126 ms | 33; 741 ms | 0; 114 ms | 33; 744 ms | 32; 717 ms | 0; 144 ms | 0; 719 ms |
| S3 `on interaction`, early | 36; 1244 ms | 0; 646 ms | 36; 1247 ms | 0; 651 ms | 37; 1236 ms | 37; 1230 ms | 0; 655 ms | 0; 1238 ms |
| S3 `on interaction`, late | 36; 1268 ms | 0; 666 ms | 36; 1269 ms | 0; 644 ms | 36; 1272 ms | 36; 1248 ms | 0; 646 ms | 0; 1249 ms |
| S3 `on viewport`, early | 36; 1308 ms | 0; 666 ms | 37; 1303 ms | 0; 691 ms | 37; 1295 ms | 35; 1273 ms | 0; 671 ms | 0; 1289 ms |
| S3 `on viewport`, late | 36; 1356 ms | 0; 717 ms | 36; 1344 ms | 0; 718 ms | 36; 1332 ms | 35; 1310 ms | 0; 714 ms | 0; 1349 ms |
| S4 pane click, early | 36; 647 ms | 0; 48 ms | 0; 46 ms | 37; 661 ms | 36; 660 ms | 36; 639 ms | 0; 44 ms | 0; 43 ms |
| S4 pane click, late | 35; 661 ms | 0; 55 ms | 0; 51 ms | 0; 63 ms | 35; 667 ms | 35; 646 ms | 0; 50 ms | 0; 45 ms |
| S5 pane, before idle | 36; 669 ms | 0; 55 ms | 0; 54 ms | 36; 661 ms | 36; 659 ms | 36; 638 ms | 0; 47 ms | 0; 47 ms |
| S5 menu, after idle | 36; 649 ms | 0; 61 ms | 36; 650 ms | 0; 45 ms | 36; 649 ms | 36; 641 ms | 0; 39 ms | 0; 46 ms |

### Question 1: does D shrink the flash window to families used before idle?

#### Option D's window: page hydrated, app stable, prefetch done (landing page, ms, median [min-max] of 5)

| Engine, profile | hydrated | stable | idle callback | prefetch done | window (done - hydrated) |
| --- | --- | --- | --- | --- | --- |
| chromium, unthrottled | 109 [101-117] | 116 [108-125] | 128 [112-139] | 135 [119-146] | 21 [15-29] |
| chromium, delay300 | 111 [106-122] | 402 [389-408] | 411 [399-417] | 732 [719-739] | 616 [607-630] |
| firefox, unthrottled | 147 [133-192] | 155 [142-204] | 170 [165-210] | 181 [174-241] | 41 [25-49] |
| firefox, delay300 | 147 [128-156] | 445 [427-450] | 446 [428-451] | 762 [742-779] | 615 [604-623] |
| webkit, unthrottled | 315 [223-442] | 317 [234-446] | 338 [248-486] | 365 [266-522] | 50 [35-80] |
| webkit, delay300 | 321 [260-427] | 502 [475-554] | 525 [487-569] | 853 [818-896] | 532 [469-558] |
| chromium, slow4g4x | 2033 [2005-2057] | 2466 [2439-2476] | 2481 [2447-2486] | 3086 [3055-3102] | 1066 [998-1075] |

- **After its prefetch, yes: 0 unstyled frames in every scenario, engine, and profile** (the "late" rows and "S5 menu, after idle" for D in the frame tables).
- **Before it, D flashes as A does.** At 300 ms: S2 19/20/16 frames (Chromium/Firefox/WebKit), S4 19/20/20, S5's pane 19/19/20, against A's 20/20/19, 19/20/21, and 20/19/21. On Slow 4G: S2 35 and S4 37 frames against A's 35 and 36.
- **The flash is shorter only when the prefetch request has already started** when the family is first used. On `/defer`, which renders no family on the server, the app is stable at once and the idle callback comes 14-35 ms after hydration (109 ms on Slow 4G). `@defer (on interaction)` early then shows 15/13/8 frames at 300 ms, against A's 18/19/21. On Slow 4G it shows 0 against 36, because the block's own dependency fetch outlasts the prefetch.
- **The window is not "until idle".** It runs from hydration through `whenStable()`, the idle callback, and one chunk round trip. The idle callback itself fires 1-23 ms after stability in every engine. WebKit 26.6 has no `requestIdleCallback` (`typeof` is `undefined`), so there Angular's `IDLE_SERVICE` falls back to `setTimeout` (`idle_service.ts:23-27`). The window is 21-50 ms unthrottled, about 530-620 ms at 300 ms, and about 1.07 s on Slow 4G.
  - On a server-rendered page with families, stability waits for those families' own carrier chunks (A's hydration fetch): +290 ms at 300 ms and +430 ms on Slow 4G (`stable - hydrated`).
  - E's hydration fetches no chunk (stable 106 ms against A's 396 ms at 300 ms, Chromium), so D built on E would start its prefetch about 300 ms sooner (inferred, not built).
- **Unthrottled, D's window closed before every first use in all three engines** (0 of 5 early uses fell inside it, in every scenario).
- **Costs:** D downloads every family's chunk on every page load, whether the page uses it or not (5 requests and 4.4 kB gzip here). While its prefetch runs, D did not raise INP (see question 4).

### Question 2: which option gives the best Core Web Vitals?

#### S1 landing page: LCP, ms, median [min-max] of 5 (equal to FCP in Chromium and Firefox, where the callout text is the LCP element)

| Engine, profile | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| chromium, unthrottled | 56 [48-64] | 64 [64-68] | 56 [52-72] | 52 [52-60] | 60 [48-68] | 64 [48-68] | 124 [64-140] | 60 [52-76] |
| chromium, delay300 | 60 [48-68] | 60 [48-64] | 60 [56-80] | 60 [52-64] | 56 [48-64] | 420 [368-432] | 428 [380-436] | 64 [60-92] |
| firefox, unthrottled | 67 [51-114] | 72 [56-85] | 71 [57-79] | 72 [69-81] | 66 [56-82] | 107 [89-135] | 103 [100-150] | 70 [58-103] |
| firefox, delay300 | 61 [50-74] | 73 [69-88] | 78 [60-85] | 72 [54-87] | 71 [59-78] | 443 [436-481] | 452 [420-458] | 67 [57-72] |
| webkit, unthrottled | 268 [255-679] | 256 [219-1494] | 248 [233-2096] | 336 [224-483] | 311 [242-953] | 273 [192-1444] | 501 [192-630] | 368 [81-454] |
| webkit, delay300 | 257 [217-619] | 349 [223-495] | 357 [226-385] | 338 [262-429] | 326 [252-377] | 682 [567-715] | 654 [519-675] | 232 [190-318] |
| chromium, slow4g4x | 800 [756-808] | 776 [776-848] | 768 [752-820] | 784 [752-800] | 776 [756-788] | 1340 [1324-1360] | 1356 [1352-1412] | 756 [732-808] |

#### CLS by scenario (Chromium, web-vitals, median of 5; shifts within 500 ms of an input do not count)

| Scenario, delay300 | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S2 navigation, early | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| S3 `on interaction`, early | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| S3 `on viewport`, early | 0.006 | 0.000 | 0.006 | 0.006 | 0.006 | 0.006 | 0.006 | 0.000 |
| S3 `on viewport`, late | 0.006 | 0.000 | 0.006 | 0.000 | 0.006 | 0.006 | 0.000 | 0.000 |
| S4 pane click, early | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| S5 pane, before idle | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |

| Scenario, slow4g4x | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S2 navigation, early | 0.039 | 0.000 | 0.143 | 0.178 | 0.170 | 0.170 | 0.000 | 0.000 |
| S3 `on interaction`, early | 0.092 | 0.090 | 0.092 | 0.090 | 0.092 | 0.092 | 0.090 | 0.090 |
| S3 `on viewport`, early | 0.017 | 0.000 | 0.017 | 0.000 | 0.017 | 0.030 | 0.000 | 0.000 |
| S3 `on viewport`, late | 0.017 | 0.000 | 0.017 | 0.000 | 0.017 | 0.017 | 0.000 | 0.000 |
| S4 pane click, early | 0.020 | 0.000 | 0.000 | 0.020 | 0.020 | 0.020 | 0.000 | 0.000 |
| S5 pane, before idle | 0.023 | 0.000 | 0.023 | 0.020 | 0.023 | 0.023 | 0.000 | 0.000 |

#### Lighthouse 13.5.0 mobile, landing page (median [min-max] of 5)

| Metric | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Performance score, simulate | 91 [86-95] | 89 [83-92] | 90 [87-95] | 94 [88-94] | 93 [91-95] | 93 [91-98] | 91 [87-94] | 93 [87-95] |
| FCP ms, simulate | 1307 [1292-1327] | 1457 [1446-1493] | 1303 [1287-1728] | 1293 [1284-1332] | 1300 [1297-1335] | 1606 [1596-1643] | 1618 [1602-1649] | 1308 [1294-1341] |
| LCP ms, simulate | 1457 [1442-1477] | 1604 [1541-1643] | 1453 [1437-2178] | 1443 [1434-1482] | 1450 [1447-1485] | 1621 [1596-1970] | 1656 [1655-1789] | 1458 [1444-1491] |
| TBT ms, simulate | 355 [252-545] | 404 [327-659] | 315 [111-450] | 290 [279-491] | 308 [249-388] | 292 [107-326] | 351 [262-483] | 319 [262-518] |
| CLS, simulate | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| Performance score, devtools | 81 [80-97] | 81 [77-83] | 82 [77-83] | 78 [76-81] | 81 [78-82] | 76 [76-83] | 78 [77-83] | 80 [74-87] |
| LCP ms, devtools | 1004 [797-1031] | 1008 [919-1141] | 965 [900-1076] | 1023 [990-1058] | 952 [864-1039] | 1569 [1381-1622] | 1563 [1490-1836] | 1035 [926-1172] |
| TBT ms, devtools | 776 [185-871] | 833 [704-1107] | 718 [678-1150] | 1038 [778-1230] | 810 [740-1030] | 1071 [661-1206] | 861 [656-1004] | 887 [539-1570] |
| Performance score, provided | 100 | 100 [99-100] | 100 [99-100] | 100 [99-100] | 100 | 100 | 100 [99-100] | 100 |
| LCP ms, provided | 116 [95-127] | 105 [99-162] | 102 [83-116] | 97 [84-123] | 101 [83-132] | 113 [105-261] | 129 [101-246] | 108 [96-126] |
| Accessibility score | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| Transfer, bytes | 106300 | 109105 | 106564 | 110105 | 104105 | 106612 | 109821 | 105184 |
| Script transfer, bytes | 95654 | 98428 | 95919 | 99459 | 93449 | 94691 | 94691 | 94199 |
| Requests | 6 | 5 | 6 | 9 | 4 | 7 | 10 | 12 |
| Script parse and compile, ms, devtools | 21 [14-27] | 18 [15-26] | 20 [8-20] | 22 [18-32] | 21 [13-28] | 17 [10-24] | 19 [17-23] | 20 [13-29] |
| Main-thread work, ms, devtools | 1553 [1199-1856] | 1732 [1460-2413] | 1636 [1581-2274] | 2015 [1681-2333] | 1719 [1568-2793] | 1840 [1481-2033] | 1733 [1479-1867] | 1898 [1376-2856] |

- **LCP and FCP: equal for A, B, C, D, E, and S; worse for L and LP.** 189's `data-beasties-skip` makes each server-rendered family `<link>` render-blocking.
  - At 300 ms, L's LCP is 420/443/682 ms against 56-64/61-78/232-357 ms for the carrier options (Chromium/Firefox/WebKit).
  - On Slow 4G, it is 1,340 ms against 756-800 ms.
  - LP is the same as L, since the preloads do not shorten the blocking request.
- **CLS: only the options that flash pay, and only where the browser counts the shift.**
  - A late family moves layout: the unstyled closed submenu and closed pane push the page down 107-110 px on `/menus`; the unstyled pane sits in the flow and pushes the next paragraph down 80 px.
  - A shift within 500 ms of a click or key press does not count towards CLS (`hadRecentInput`). Unthrottled and at 300 ms, only the scroll-triggered `@defer (on viewport)` block counted (0.006-0.008 for A, C, E, L, and D or LP before their windows close).
  - On Slow 4G the CSS arrives more than 500 ms after the click, and the click-driven flashes count as well: S2 0.039-0.178, S4 0.020, S5 0.023 for A, C (non-opted families), E, L, and D before its window.
  - B, S, and LP had 0.000 in every scenario except S3 `on interaction`. There the placeholder button is replaced by the callout, a shift of about 0.09 in every option. Unthrottled and at 300 ms it falls within 500 ms of the click and does not count; on Slow 4G the block arrives later and it counts for every option alike, so it comes from the `@defer` placeholder, not from the loading option.
- **INP: no option made it worse** (question 4). Long-task blocking time on the landing page under Slow 4G was 190-234 ms for every option, with overlapping spreads.
- **Lighthouse does not separate the options.** Mobile scores (simulate) were 89-94 at the median, with spreads of 83-98 that overlap for every pair; devtools-throttled scores were 76-82; unthrottled, every option scored 99-100, and accessibility was 100 for all (the landing page is server-rendered and styled in every option).
  - Lighthouse's simulation (Lantern) put B's FCP and LCP about 150 ms after the others (1,457 and 1,604 ms against 1,293-1,308 and 1,443-1,458 ms). With throttling applied (devtools) and in the Playwright Slow 4G runs, B's LCP equalled A's (1,008 against 1,004 ms; 776 against 800 ms). Why Lantern differs was not traced.
  - L and LP are later wherever Lighthouse throttles (render-blocking family links), the same finding as above: FCP +300 ms and LCP +160-200 ms (simulate), LCP +560 ms (devtools); unthrottled they are within the spread.
- **Where the options trade off:**
  - S has no measured penalty on any vital: LCP as A in every method, CLS 0, INP equal or lower.
  - B ties S on CLS and, with real or applied throttling, on LCP; only Lantern's estimate puts it about 150 ms later. It pays in the initial JavaScript: +4.9 kB gzip for five families. Foundation's whole CSS is 17.6 kB gzip (`foundation.min.css`), so that is the ceiling for every family.
  - S pays elsewhere: its lazy routes move the landing page's code and family chunks in front of hydration, which ends at 3.2 s on Slow 4G against 2.0-2.1 s for the others (431 against 105-113 ms at 300 ms). No vital counts that, but it delays interactivity.
  - D matches B once its window has closed, and A inside it.
  - LP matches B on CLS and pays L's LCP.

### Question 3: which option is the most accessible?

Measured in the flash state (family CSS held) against the styled state, 3 runs per engine, the same in every run unless noted. A and L gave identical results, since the DOM is the same.

| Check | S2: `/menus` after navigation | S3: `@defer (on viewport)` | S4: pane opened by a click |
| --- | --- | --- | --- |
| Content Foundation hides, in the accessibility tree | **exposed**: both closed submenu links and the closed pane's link appear (3 items); 0 once styled | **exposed**: the closed submenu link (1 item); 0 once styled | nothing hidden (the pane is open) |
| Keyboard | **3 extra Tab stops** into the closed submenu and closed pane (Chromium, Firefox); WebKit's Tab skips links by default, so 0 there | **1 extra Tab stop** (Chromium, Firefox) | same stops |
| axe-core 4.13.0 (WCAG 2.0-2.2 A/AA, best practice) | 0 violations in both states | 0 in both | 0 in both |
| Targets under 24 x 24 px | 8 links are 17 px tall (unstyled menu links, the two hidden ones included); 1 once styled (a text link) | 5 controls 16-17 px tall; 0 once styled | 3 text links in both states |
| Focus indicator | the browser's default ring in both states (Chromium `auto 1px`, Firefox `dotted 1px`/`auto 1px`, WebKit `auto 3px`); the families here set no focus style | same | same |
| Layout when the CSS arrives | content after the menus moves up 107 px (Firefox 110) | the next paragraph moves 79-80 px | the pane leaves the flow and the next paragraph moves up 80 px; the pane goes from full width (412 x 64) to 300 x 114 |
| `prefers-reduced-motion: reduce` | no transition | **the deferred button's `background-color` and `color` transitions (0.25 s) start when the CSS arrives, with `reduce` too**: the flash becomes a fade from the browser's default button colour | no family transition |

- axe-core does not report the flash. The exposed and focusable hidden content, the shrunken targets, and the moving layout are found only by the tree snapshot, the Tab walk, and geometry.
- Foundation 6.9's compiled family CSS has no `prefers-reduced-motion` query (0 matches in any build here), so no loading option changes the transition itself. Only the options that flash make it run as an arrival effect.
- A `.show-for-sr` neighbour was not measured: it comes from Foundation's visibility classes, which no family here carries. Clipped, visually hidden content stays in the accessibility tree whether or not its CSS has loaded (inferred).

**Which options enter the flash state** (from the frame tables): B and S never; LP only for a `@defer` block used before its preloads arrive (6-12 frames at 300 ms in Chromium and Firefox, 0 in WebKit); C never for opted-in families; D only before its window closes; A, E, and L at every client-side first use.

### Question 4: which option is the most responsive?

#### Trigger to styled frame, ms, delay300 (Chromium/Firefox/WebKit, median of 5)

| Scenario | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S2 navigation, early | 345/363/384 | 21/37/87 | 348/365/395 | 336/374/370 | 347/364/418 | 330/364/383 | 20/38/75 | 28/50/101 |
| S2 navigation, late | 345/365/388 | 21/42/73 | 329/350/400 | 19/36/68 | 346/365/387 | 330/358/376 | 20/37/83 | 34/51/122 |
| S3 `on interaction`, early | 331/348/367 | 30/32/31 | 330/349/353 | 280/240/165 | 345/349/370 | 330/365/363 | 179/132/30 | 332/349/356 |
| S3 `on interaction`, late | 346/357/368 | 29/46/40 | 347/366/352 | 28/44/51 | 346/350/381 | 345/349/374 | 28/42/39 | 345/349/359 |
| S3 `on viewport`, early | 344/345/373 | 25/27/47 | 342/348/393 | 329/315/349 | 341/350/372 | 341/347/355 | 235/213/125 | 347/342/386 |
| S3 `on viewport`, late | 349/373/400 | 33/46/63 | 352/364/382 | 30/36/70 | 344/362/387 | 346/364/378 | 35/47/63 | 352/363/391 |
| S4 pane click, early | 332/348/369 | 18/31/29 | 18/20/31 | 331/348/357 | 331/348/353 | 329/347/348 | 16/31/29 | 16/20/29 |
| S4 pane click, late | 330/348/350 | 22/19/32 | 21/18/31 | 22/20/27 | 346/348/353 | 345/349/354 | 20/32/29 | 20/45/25 |
| S5 pane, before idle | 342/349/360 | 19/20/32 | 17/21/29 | 331/335/357 | 346/348/351 | 330/340/350 | 16/22/28 | 16/18/27 |
| S5 menu, after idle | 332/337/359 | 19/16/24 | 347/338/357 | 17/16/32 | 346/333/356 | 334/333/341 | 18/16/36 | 19/16/35 |

#### INP, ms, the page after its interactions (Chromium/Firefox/WebKit at delay300; Chromium at slow4g4x; median of 5)

| Scenario | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S2 navigation, early | 24/24/72; 128 | 24/32/88; 112 | 24/24/88; 136 | 24/24/80; 136 | 32/24/80; 152 | 24/40/88; 136 | 24/24/72; 104 | 16/16/40; 56 |
| S2 navigation, late | 24/32/80; 136 | 24/32/72; 136 | 24/40/80; 176 | 24/32/72; 120 | 24/24/88; 168 | 24/40/72; 176 | 24/32/88; 152 | 16/16/88; 56 |
| S3 `on interaction`, early | 16/16/32; 16 | 16/16/32; 24 | 16/16/24; 24 | 16/16/32; 24 | 16/16/16; 24 | 16/16/24; 24 | 16/16/32; 24 | 16/16/24; 24 |
| S3 `on interaction`, late | 16/16/24; 24 | 16/32/32; 24 | 16/16/32; 40 | 16/16/32; 32 | 16/24/16; 32 | 16/16/24; 24 | 16/16/32; 32 | 16/16/24; 24 |
| S4 pane click, early | 24/24/32; 56 | 24/16/32; 56 | 24/16/32; 56 | 24/24/48; 48 | 24/24/24; 64 | 24/24/32; 56 | 16/16/32; 56 | 16/16/32; 48 |
| S4 pane click, late | 24/24/32; 64 | 24/24/32; 64 | 24/16/32; 64 | 24/24/32; 72 | 24/24/24; 72 | 24/32/40; 56 | 24/24/32; 56 | 24/32/24; 56 |
| S5 (both clicks) | 24/32/40; 80 | 24/24/32; 80 | 24/24/32; 72 | 24/24/32; 56 | 24/16/32; 72 | 24/16/40; 64 | 24/24/40; 56 | 24/16/40; 56 |

- **INP does not separate the options.** Medians at 300 ms are 16-32 ms in Chromium, 16-40 ms in Firefox, and 16-88 ms in WebKit, with overlapping spreads. Under Slow 4G they are 48-80 ms for the clicks that insert content.
  - INP ends at the next paint after the interaction, and that paint comes before a late family's CSS. So a late family adds no INP; it adds unstyled frames after the paint.
  - The one difference is S's route navigation: 16/16/40 ms at 300 ms and 56 ms on Slow 4G, against 104-176 ms for the others. The lazy route's chunk moves the render of `/menus` past the next paint (processing 41 against about 110 ms on Slow 4G). The cost appears after that paint instead (navigation to styled frame 713 ms).
- **Time from interaction to a styled paint is where the options differ.**
  - Clicks and navigations that insert a new family: B and LP take one to three frames (16-42 ms at 300 ms in Chromium and Firefox; 39-144 ms on Slow 4G), and so does S for in-page clicks (16-45 ms; 43-47 ms on Slow 4G). C (for its opted-in family) and D after its window do the same. S's navigation to a lazy route with a new family waits for the route chunk (713-719 ms on Slow 4G), with no unstyled frame.
  - A, E, L, C (non-opted families), and D before its window wait for one family request: 329-418 ms at 300 ms, and 638-744 ms on Slow 4G.
  - For `@defer` blocks, B, D (after the prefetch), and LP (after the preload) wait for the block's own code only: 646-718 ms on Slow 4G.
  - A, C, E, and L add a second, serial request for the family (1,230-1,356 ms on Slow 4G). So does S, because its block chunk imports the shared directive chunk (1,238-1,349 ms). S shows no unstyled frame there: the block appears late, styled.
- **Most responsive, measured:**
  - B in every scenario and profile.
  - LP and D once their preload or prefetch has arrived.
  - S for in-page interactions and for routes whose families the current page already loaded. It is slower on a lazy route with new families and on `@defer` blocks, which wait for two serial chunks.
- **Responsive design is not affected.** Each family's media queries travel with its CSS, so they apply from the frame the CSS applies, whatever the option (from the build, not measured per breakpoint).

### Download and parse cost

| | A | B | C | D | E | L | LP | S |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Initial JavaScript, raw / gzip, kB | 290.4 / 90.3 | 307.8 / 95.2 | 291.0 / 90.5 | 290.4 / 90.3 | 293.2 / 91.1 | 287.3 / 91.7 | 287.3 / 91.7 | 254.0 / 81.1 |
| Server HTML of `/`, gzip, kB | 3.2 (CSS inline) | 3.3 | 3.2 | 3.2 | 3.2 | 1.9 (links) | 2.0 | 3.6 |
| Family files, count and gzip total, kB | 5 chunks, 4.4 | none | 4 chunks, 4.0 | 5 chunks, 4.4 | 5 chunks, 4.4 | 5 CSS, 3.5 | 5 CSS, 3.5 | 4 chunks with code, 4.5 |
| Family requests on the landing page | 2 at hydration | 0 | 2 | 2 + 3 at idle | 0 | 2, render-blocking | 5 (2 render-blocking) | 4 before hydration, plus the route chunk |

Lighthouse (devtools throttling) put script parse and compile at 17-22 ms for every option and main-thread work at 1.55-2.02 s with overlapping spreads, so at five families the loading option does not show as parse cost. Total transfer for the landing page was 104-110 kB in every option.

The CSS text is in both the server HTML and a JavaScript chunk for A, C, D, E, and S (as 184 noted for the carriers); L and LP send it once, as CSS, and B sends it in `main.js` and the HTML.

## Verdict

Nothing is decided here; [185](../../issues/185-decide-lazy-family-styles.md) chooses.

1. **D shrinks the flash window to families first used before its prefetch finishes, and to nothing after.** That window is longer than "until idle": hydration, then stability (which waits for the server-rendered families' own chunks), then the idle callback, then one round trip. It measured 21-50 ms unthrottled, about 0.6 s at 300 ms, and about 1.07 s on Slow 4G. A family first used inside it flashes as long as under A unless the prefetch request is already in flight.
2. **Core Web Vitals: S, with B next to it.** Both keep LCP unchanged and add 0 CLS from family loading in every scenario and profile, with no INP effect; only Lighthouse's simulated estimate puts B's LCP about 150 ms later, and no Lighthouse score separates any two options. D equals them after its window. A, C (non-opted), E, and L add CLS where the browser counts the shift: scroll-triggered blocks always, clicks and navigations on Slow 4G. L and LP add 330-560 ms of LCP from render-blocking family links. S's lazy routes delay hydration (3.2 s against 2.0 s on Slow 4G), which no vital counts.
3. **Accessibility: the options that never flash** (B and S; LP except an early `@defer`; C for opted-in families; D after its window). During a flash, content Foundation hides is in the accessibility tree and in the Tab order, targets shrink to 16-17 px, layout moves by 80-110 px, and Foundation's button transition plays as the CSS arrives even under `prefers-reduced-motion: reduce`. axe-core reports none of it.
4. **Responsiveness: B** (one to three frames from a click or navigation to a styled paint, and a `@defer` block waits only for its own code). LP and D match it after their preload or prefetch, and S matches it within a page and on routes whose families are loaded. INP does not separate the options, because a late family's cost comes after the next paint.

## What this prototype does not prove

- Families beyond Button, Callout, Dropdown, Menu, and Dropdown Menu. B's cost grows with the number of families, up to Foundation's 17.6 kB gzip for everything; at what count it starts to show in LCP or TBT on Slow 4G was not measured.
- S with eager routes. Its families would then ride with the eagerly routed pages in `main.js`, close to B; not built. S with `@defer (prefetch on idle)` (inferred above to prefetch the CSS with the code).
- D built on E's hydration (no chunk at hydration) or with `onIdle({ timeout })`; D with routes and blocks that use `prefetch on idle` themselves.
- Real devices and real networks. Slow 4G is DevTools throttling on a desktop arm64 machine; Firefox and WebKit had no CPU or bandwidth throttling. Lighthouse ran with `--disable-gpu` because Chromium's tab crashed without it on this machine, and 9 of its 120 audits were retried after `TARGET_CRASHED` (every audit then completed).
- Screen readers. The accessibility tree was read through Playwright, not announced by NVDA, JAWS, or VoiceOver.
- Field data (the Chrome UX Report) and soft-navigation INP. Chromium lists `soft-navigation` entries, which were not used.
- 192's proposal A under Angular CLI without Nx (it needs Nx's executor here) and the orchestrator's note on `buildApplication`'s unsupported `extensions` parameter, which this prototype does not change.

## What is here

The runnable workspace is `D:/tmp/nfs-proto-190`; only the decisive files are copied here. Paths are relative to the workspace's `apps/fixture/` unless they start with `tools/` or `measure/`.

- `project.json`: the configurations `production` (A), `eager` (B), `mixed` (C), `idle` (D), `own` (E), `link` (L), `link-preload` (LP), and the `build-static` target (S, `@nx/angular:application` with `plugins`).
- `src/lib/family-styles.ts` (A-D: 184's service plus D's `prefetch: 'idle'`), `src/lib/link-styles.ts` (L, LP), `src/lib/static-styles.ts` (S), `src/lib/directives.ts` (184's directives plus `nfsDropdownPane`), `src/lib/directives/*.static.ts` (S's per-family directive modules), `src/lib/virtual.d.ts`. E's `family-styles.own.ts` is 188's file with the three changes listed above and is not copied.
- `src/nfs-families/`: `carriers.ts`, `carriers.eager.ts`, `carriers.mixed.ts`, `carriers.none.ts`, `prefetch.ts`, `prefetch.idle.ts`, and the new `dropdown.scss` and `dropdown.ts`.
- `src/app/`: `landing-page.ts`, `menus-page.ts`, `defer-page.ts`, `mark-hydrated.ts`, `app.ts`, `app.config.ts`, `app.routes.ts`, `app.routes.static.ts`. S's `*.static.ts` pages are generated by `tools/gen-static-pages.mjs`.
- `src/server.ts` (gzip, and the cookie-driven 300 ms delay), `src/index.preload.html` (LP), `src/styles.scss` (the order statement now includes `nfs.dropdown`).
- `tools/nfs-esbuild-plugin.mjs` (S's plugin, from 189 and 192, pointed at the fixture's family `.scss` files), `tools/gen-static-pages.mjs`.
- `measure/`: `vitals.mjs`, `a11y.mjs`, `a11y-summary.mjs`, `lh.mjs`, `sizes.mjs`, `common.mjs`, `summarize-190.mjs`, `readme-tables.mjs`, `run-chromium.sh`, `run-rest.sh`.
- `results/`: `summary-190.md` (every table), `readme-tables.md`, `sizes.json`, `lighthouse.json`, `a11y-*.json`, and the web-vitals raw files `vitals-<engine>-<profile>[-S].json`.

## How to run

```
cd D:/tmp/nfs-proto-190
bash build-all.sh                        # 8 builds, about 3 minutes
./serve.sh                               # ports 4711 A, 4712 B, 4713 C, 4714 D, 4715 E, 4716 L,
                                         # 4717 LP, 4718 S; sets NG_ALLOWED_HOSTS=localhost,127.0.0.1
bash measure/run-chromium.sh             # about 50 minutes (5 runs per cell)
bash measure/run-rest.sh 2               # S in Chromium, then Firefox; about 45 minutes
bash measure/run-rest.sh 3               # WebKit, Lighthouse, accessibility; about 70 minutes
node measure/sizes.mjs
node measure/summarize-190.mjs && node measure/readme-tables.mjs
./kill-servers.sh                        # stops only these ports, by PID
```

One option or scenario: `OPTS=A,D node measure/vitals.mjs chromium delay300 5 s4-pane-early`.

## Raw data

The seven raw web-vitals result files (`vitals-<engine>-<profile>.json`, about 4 MB) are kept outside the repository, in `D:/tmp/nfs-proto-190/results-raw/`, because the tables above summarise them. Moved there by the orchestrator on 2026-10-01.
