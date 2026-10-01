# Prototype: what the candidates cost in development, under CSP, with several applications, and at unload

Ticket: [Prototype: what the candidates cost in development, under CSP, with several applications, and at unload](../../issues/198-prototype-candidate-costs-dev-hmr-csp.md).
Builds on [lazy-family-styles](../lazy-family-styles/README.md) (184), [unload-after-leave](../unload-after-leave/README.md) (188), [link-family-styles](../link-family-styles/README.md) (189), and [research/style-loading-consult.md](../../research/style-loading-consult.md) (192). This decides nothing; [185](../../issues/185-decide-lazy-family-styles.md) chooses.

## Question

What do the three leading candidates cost in the places no ticket has measured?

- **own**: 184's consumer carriers with 188's `own-style` (the library owns a `<style data-nfs-family>`, copies `CSP_NONCE`, and removes it with host timing).
- **link**: 189's `<link>` loader (non-injected `nfs-<family>.css` bundles, a counted library `<link>`, host timing, `data-beasties-skip`).
- **chunk**: 192's proposal A (each directive module statically imports its family's CSS through Nx's esbuild `plugins` option; the library owns a `<style>`).

The places: (1) the dev server and HMR; (2) a strict CSP with a nonce, and Trusted Types; (3) two Angular applications on one document; (4) the unload machinery itself (the `MutationObserver` on `document`, the hold scan for server-rendered instances, and the critical-CSS handling) with 1,000 and 5,000 hosts, against a baseline with no loader.

## What was built

Three copies, not committed: `D:/tmp/nfs-proto-198-188` (from 188), `D:/tmp/nfs-proto-198-189` (from 189), and `D:/tmp/nfs-proto-198-192` (from 192). They were copied with `robocopy /E /XJ` and no `node_modules`. Each `node_modules` is a directory junction: 188's copy points to `D:/tmp/nfs-proto-188/node_modules`, and 189's and 192's copies point to `D:/tmp/nfs-proto-189/node_modules`. Remove a junction with `rmdir` before deleting a copy. Versions: Nx 23.2.1, Angular 22.2.0, `@angular/build` and `@angular/ssr` 22.2.0, Dart Sass 1.104.1, Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6, on Windows 11 arm64.

The same additions went into every copy (files under `src/` here):

- `server.ts`: `?csp=self|nonce|tt` renders the page under a strict policy. index.html carries `ngCspNonce="NFS_NONCE"` on the root element. Angular copies that value to every element it gives a nonce, and the handler replaces it with a fresh random nonce per response.
- `main.ts`, `multi.ts`, `multi-providers.ts` (`multi-providers.188.ts` in the 188 copy): `/multi` (`RenderMode.Client`) bootstraps two applications, `nfs-multi-a` and `nfs-multi-b`, on one document. Each has signals that switch a callout, a button, and a menu on.
- `app/bench-page.ts`: `/bench?n=&keep=&ssr=` renders n hosts. They are plain `<div class="callout">` (the no-loader baseline) or `<div nfsCallout>`, each optionally inside an element with a 600 ms `animate.leave`. `#keeper`, one loader instance, keeps the family loaded when `keep=1`.
- Cost counters in the three services (`lib/family-styles.188.ts`, `lib/link-styles.189.ts`, `lib/link-styles.192.ts`, written by `tools/patch-198-link-styles.mjs` and the same edit in 188). They time `acquire()`, `release()`, the hold scan, the `MutationObserver` callback, and the one-frame check after release, into `globalThis.__nfsStats`. The 188 copy's default `?unload=` became `own-style`.
- `?nonce=copy` in the 189 and 192 services (`tools/patch-198-nonce.mjs`): copy `CSP_NONCE` onto the inserted element on the server and the client, as 188 does. These are the `+nonce` rows in point 2. They are not part of either candidate as built.
- Dev-server targets (`tools/patch-198-project.mjs`): `serve` in each copy (`@angular/build:dev-server` for own and link, `@nx/angular:dev-server` for chunk, so the esbuild plugin reaches the dev server), with a `development` configuration without output hashing (`outputHashing` turns HMR off, `BUILD/src/builders/dev-server/vite/index.js:136-141`). The baseline is `serve-baseline` in the 189 copy: every family in the injected global stylesheet (`all.scss`) and a loader that inserts nothing (`lib/switches.none.ts`).

`NG/` is `d:/projects/github/angular/angular` at 22.2.x, commit `5db6fc4`. `BUILD/` and `SSR/` are `@angular/build` and `@angular/ssr` 22.2.0 in `D:/tmp/nfs-proto-189/node_modules`.

## How to run

```
# production SSR builds
cd D:/tmp/nfs-proto-198-188 && npx nx run fixture:build:production --skip-nx-cache
cd D:/tmp/nfs-proto-198-189 && npx nx run fixture:build:production --skip-nx-cache
cd D:/tmp/nfs-proto-198-192 && npx nx run fixture:build-plugin --skip-nx-cache
bash D:/tmp/nfs-proto-198-189/serve-198.sh      # 4811 own, 4812 link, 4813 chunk; sets NG_ALLOWED_HOSTS
cd D:/tmp/nfs-proto-198-189
node measure-198/csp.mjs                        # point 2, three engines
node measure-198/multi.mjs                      # point 3, three engines
node measure-198/bench.mjs chromium 5           # point 4, one engine per run; then firefox, webkit
node measure-198/devserver.mjs own 5 5          # point 1; also link, chunk, baseline (ports 4821-4824)
node measure-198/hmr-unload.mjs link            # point 1: unload after the dev server applied an edit
node measure-198/debug-chunk-settings.mjs       # point 1: where chunk loses a settings edit
node measure-198/summarize.mjs csp|multi; node measure-198/summarize-bench.mjs; node measure-198/summarize-devserver.mjs
bash kill-198.sh                                # stops only this prototype's ports, by PID
```

The scripts here are copies of `D:/tmp/nfs-proto-198-189/measure-198/`. Raw output is in `results/`. Timing runs went one at a time, but the machine also served another prototype's four SSR servers (ports 4801-4804), so absolute times carry unknown background load. The spreads below show how much.

## Results

"C / F / W" is Chromium / Firefox / WebKit. Timings are the median (min-max) of 5 runs unless marked.

### Point 1: dev server and HMR

`nx serve`, cold start with no `.angular/cache` (5 runs) and warm start (3 runs), timed from process start to the first 200 response from `/ssr` with SSR. Edits ran against one running server, 5 of each kind in Chromium and 1 of each in Firefox and WebKit. A settings edit changes `$callout-sizes` default 2.75rem to 3.5rem and back (44px against 56px). A component edit changes a text node in the `/ssr` page template. "Reload" means the page lost a `window` sentinel.

| Candidate | Cold start, ms | Warm start, ms | First bundle, s | Settings edit | Settings: time to show, ms (C) | Component edit: time to show, ms (C) / rebuild, s | Firefox, WebKit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline (no loader) | 7,921 (7,184-8,739) | 7,364 (6,880-7,510) | 1.97 (1.63-2.06) | HMR, "Stylesheet update sent", 5 of 5 | 521 (493-521) | 340 (264-821) / 0.11 (0.08-0.60), HMR | same kinds; settings 495 / 515 ms, component 330 / 268 ms |
| own | 10,509 (10,132-11,768) | 8,682 (8,339-9,020) | 3.10 (2.81-3.50) | **full page reload**, "Page reload sent", 5 of 5 | 1,049 (988-1,747) | 363 (289-394) / 0.14 (0.12-0.17), HMR | same kinds; settings 1,018 / 1,184 ms (reload), component 346 / 373 ms |
| link | 7,765 (7,503-9,119) | 6,811 (6,756-7,103) | 1.87 (1.75-2.04) | HMR, "Stylesheet update sent", 5 of 5 | 469 (418-495) | 311 (261-952) / 0.11 (0.10-0.69), HMR | same kinds; settings 422 / 432 ms, component 339 / 341 ms |
| chunk | 10,949 (10,119-12,027) | 10,711 (9,473-11,856) | 4.06 (3.80-4.40) | **never shown**, 0 of 5 (rebuild 0.15 s, nothing sent, a manual reload still shows the old value) | - | **2,091 (2,060-2,650) / 1.87 (1.86-2.44)**, HMR | same; settings never shown, component 1,812 / 1,979 ms |

The summary script counts two chunk settings edits as "shown". Those edits went back to the value the page still had (5 ms).

Follow-ups (`hmr-unload.mjs`, `debug-chunk-settings.mjs`; all three engines unless noted):

- **link leaks after HMR.** Vite's stylesheet update replaces the library's `<link>` with a copy (`nfs-callout.css?t=...`) that keeps `data-nfs-family`. The library still tracks the old element. After the edit, removing the last callout leaves the copy in `<head>`. A probe `div.callout` stays styled (56px), also after a second add and remove, in all three engines. Before any edit, the unload works as in 189.
- **chunk drops settings edits.** After a settings edit the dev server logs "No output file changes". The callout CSS in the server HTML and in the browser chunk keeps `2.75rem`. Touching the callout directive's module rebuilds in 1.5 s with `3.5rem` and sends "Page reload sent". A fresh dev-server start also has `3.5rem`. The plugin returns the settings file in `watchFiles` (`P189/tools/nfs-esbuild-plugin.mjs:32`), and the rebuild runs, but the virtual module is not reloaded. Every component edit costs about 1.9 s of rebuild against 0.1 s elsewhere. Inferred, not measured: the plugin compiles each family's Sass again on every code rebuild.
- **own reloads, then unloads correctly.** The settings edit changes the carrier component's stylesheet. The dev server answers with a full page reload, after which load and unload work. With Angular's defaults, component styles are replaced as code (`BUILD/src/builders/dev-server/vite/index.js:143-147`, `BUILD/src/utils/environment-options.js:180`, `:184`), and the owned `<style>` holds CSS captured once from the carrier, so HMR has nothing to update in place (inferred).

### Point 2: strict CSP with a nonce, and Trusted Types

Policies (`src/server.ts`), each with `default-src 'self'; script-src 'nonce-N' 'strict-dynamic'; object-src 'none'; base-uri 'self'`:

- **self**: `style-src 'self' 'nonce-N'`, Angular's documented minimal policy (`NG/adev/src/content/guide/security.md:146`, `:190`).
- **nonce**: `style-src 'nonce-N'` only.
- **tt**: **self** plus `require-trusted-types-for 'script'; trusted-types angular angular#bundler` (`security.md:215`, `:249`).

Measured on `/ssr` with JavaScript off (server HTML only), after hydration, on `/lifecycle` after a client-side insert, and on `/client-defer` after a client-only `@defer`. "styled" means the callout computes 44px. **The three engines gave the same result in every cell.** `window.trustedTypes` exists in Chromium 153, Firefox 155, and WebKit 26.6, and no candidate caused a Trusted Types violation.

| Candidate | Family element in server HTML | none | self | nonce | tt | Violations from family styles |
| --- | --- | --- | --- | --- | --- | --- |
| own | `<style data-nfs-family nonce>` | styled everywhere | styled everywhere | styled everywhere | styled everywhere | none |
| link | `<link data-nfs-family>`, no nonce | styled everywhere | styled everywhere | **unstyled everywhere** (server, hydrated, client insert, `@defer`) | styled everywhere | nonce: one `style-src-elem` per family link (4 on `/ssr`, 1 per client insert) |
| link + nonce copy | `<link data-nfs-family nonce>` | styled everywhere | styled everywhere | styled everywhere | styled everywhere | none |
| chunk | `<style data-nfs-family>`, no nonce | styled everywhere | **unstyled everywhere** | **unstyled everywhere** | **unstyled everywhere** | `style-src-elem` inline: 4 on `/ssr`, 1 per client insert |
| chunk + nonce copy | `<style data-nfs-family nonce>` | styled everywhere | styled everywhere | styled everywhere | styled everywhere | none |

- Angular's own pieces worked under every policy in every engine. The application ran (the toggle removed the hydrated callout). Beasties' critical `<style>` and its `media` swap script carried the nonce (`SSR/fesm2022/node.mjs:60-64`). So did the event-replay script (`NG/packages/platform-server/src/utils.ts:117`, `:179`) and the module scripts. Client-inserted Angular styles get the nonce in `SharedStylesHost.addElement` (`NG/packages/platform-browser/src/dom/shared_styles_host.ts:130`, `:240-243`). The client reads it from `[ngCspNonce]` in `document.body` (`NG/packages/core/src/application/application_tokens.ts:120`, `:142`).
- Under **nonce**, Angular's own global `styles-*.css` link is blocked for every candidate. The build adds a nonce to `<style>` and `<script>` tags only, never to `<link>` (`BUILD/src/utils/index-file/nonce.js:22-36`). The page still showed the global critical rules through Beasties' nonced inline copy. So a nonce-only `style-src` breaks link-based global styles without any family loader involved.
- A `img-src` violation for a `data:` URI appears under every strict policy. It comes from Foundation's forms CSS (the `select` arrow), not from any loader.
- The `+nonce` rows add one `inject(CSP_NONCE)` and one `setAttribute('nonce', ...)` per inserted element, on the server and the client (`tools/patch-198-nonce.mjs`). This is what 188's `own-style` already does.

### Point 3: two applications on one document

`/multi`, client-rendered. Probes outside both applications (`div.callout`, `a.button`, `ul.menu`) show whether a family's CSS applies to the document. **The three engines gave the same result at every step.**

| Step | own | link | chunk |
| --- | --- | --- | --- |
| A shows a callout | 1 family element, A styled | the same | the same |
| B shows a callout (shared family) | still 1 element; B adopted A's | the same | the same |
| A hides its callout, B's stays | **element removed, B's callout unstyled (0px)** | the same | the same |
| A shows it again | 1 element, both styled | the same | the same |
| `appRef.destroy()` on A, B's callout stays | **element removed, B unstyled** | the same | the same |
| B hides and shows its callout | 1 element, B styled; removed when B leaves | the same | the same |
| Not shared: A a button, B a menu | 2 elements (button, menu), both styled | the same | the same |
| A destroyed | button removed, menu stays styled | the same | the same |
| B then shows a button | **styled** (B creates its own `<style>`) | **unstyled**: B adopted A's button `<link>` when its service started and still tracks the removed element | **unstyled**, same cause |
| B removes everything, B destroyed | 0 elements, `document.styleSheets` back to 2 | the same | the same |

- Every candidate keeps one counting service per application (`providedIn: 'root'`), and every service adopts any `[data-nfs-family]` element already in `<head>`. So the second application never inserts a shared family. The first application removes the family when its own count reaches 0, whatever the other application still shows. In 189 and 192 the adoption runs once, in the service constructor, over every family. A family the first application later removes stays "loaded" in the second service's map. In 188 it runs per load (`#serverOwned`), which is why own recovers in the "B then shows a button" row. All of this was read from the prototype services in `src/lib/` and matches the measured steps.
- Engine state agreed everywhere: `document.styleSheets` went 2, 3, 4 and back to 2, and `adoptedStyleSheets` stayed empty.
- Angular's own `SharedStylesHost` is provided per application (`NG/packages/platform-browser/src/browser.ts:276`), so Angular-owned styles would be counted per application and inserted once each (read from source, not measured here).

### Point 4: what the unload machinery costs

`/bench`, each run on a fresh browser context. Modes:

- **none**: n plain `<div class="callout">` with the family kept loaded by `#keeper`. This is the no-loader baseline.
- **warm**: n `nfsCallout` hosts, family already loaded.
- **cold**: n hosts, which load the family and unload it on removal.
- **leave-none** and **leave**: as none and cold, but the hosts sit inside an element with a 600 ms `animate.leave`, and an element outside the application changes its text every frame while they leave. That page churn makes the host-timing `MutationObserver` fire.

"Insert" and "remove" are timed from the signal write to the second `requestAnimationFrame`. "Longest frame" is the largest gap between frames, which shows long tasks in every engine.

#### 5,000 hosts, ms, C / F / W

| Candidate | Mode | Insert | Styled after | Remove | Hosts left / family unloaded | Longest frame on remove |
| --- | --- | --- | --- | --- | --- | --- |
| own | none | 123 / 174 / 285 | same | 38 / 53 / 89 | - | 33 / 38 / 73 |
| own | warm | 171 / 280 / 412 | same | 69 / 169 / 325 | - | 50 / 113 / 224 |
| own | cold | 178 / 298 / 716 | **377** / 311 / 717 | 75 / 178 / 397 | unloaded at 75 / 178 / 397 | 50 / 120 / 231 |
| own | leave-none | 123 / 220 / 348 | same | 40 / 29 / 219 | left 658 / 635 / 758 | 33 / 22 / 113 |
| own | leave | 172 / 259 / 833 | 361 / 272 / 835 | **1,546 / 1,445 / 1,144** | unloaded 1,661 / 1,445 / 1,144 | **1,050 / 867 / 772** |
| link | none | 116 / 199 / 281 | same | 35 / 54 / 90 | - | 17 / 40 / 74 |
| link | warm | 168 / 255 / 348 | same | 70 / 170 / 295 | - | 50 / 104 / 204 |
| link | cold | 179 / 315 / 333 | 180 / 346 / 334 | 76 / 224 / 278 | unloaded at 76 / 224 / 278 | 50 / 135 / 188 |
| link | leave-none | 129 / 182 / 252 | same | 42 / 35 / 139 | left 669 / 634 / 727 | 33 / 36 / 83 |
| link | leave | 189 / 245 / 332 | same | **2,655 / 2,268 / 1,035** | unloaded 2,677 / 2,268 / 1,035 | **2,083 / 1,678 / 731** |
| chunk | none | 120 / 145 / 326 | same | 38 / 47 / 87 | - | 33 / 35 / 72 |
| chunk | warm | 172 / 209 / 454 | same | 71 / 154 / 428 | - | 50 / 89 / 314 |
| chunk | cold | 189 / 207 / 481 | same | 81 / 146 / 498 | unloaded at 81 / 146 / 498 | 67 / 88 / 346 |
| chunk | leave-none | 125 / 173 / 361 | same | 39 / 33 / 202 | left 661 / 634 / 766 | 33 / 32 / 115 |
| chunk | leave | 199 / 224 / 401 | same | **2,747 / 1,879 / 1,114** | unloaded 3,260 / 1,879 / 1,127 | **2,617 / 1,395 / 797** |

At 1,000 hosts the same pattern is smaller. The loader adds 29-72 ms to the insert and 10-96 ms to the remove across candidates and engines. **leave** removes in 111-231 ms against 18-68 ms for **leave-none**. Every table, with ranges, is in `results/bench-summary.md`.

#### The library's own work during the remove, 5,000 hosts, ms, C / F / W

| Candidate | Mode | `release()`, all calls | One-frame checks (5,000 calls) | `MutationObserver` callbacks |
| --- | --- | --- | --- | --- |
| own | warm / cold | 14 / 70 / 19, 14 / 73 / 29 | 6 / 10 / 14, 6 / 9 / 17 | 0 calls (warm); 1 call, at most 0.3 ms (cold: the library's own `<style>` removal) |
| own | leave | **510 / 585 / 191** | **972 / 798 / 347** | 2 calls (2-38), 2-4 ms in all |
| link | warm / cold | 17 / 75 / 21, 18 / 92 / 20 | 6 / 17 / 23, 8 / 21 / 23 | as own |
| link | leave | **537 / 522 / 143** | **2,042 / 1,578 / 475** | 2 calls, 2-4 ms |
| chunk | warm / cold | 16 / 62 / 31, 20 / 63 / 37 | 7 / 13 / 46, 9 / 14 / 62 | as own |
| chunk | leave | **562 / 448 / 161** | **2,094 / 1,326 / 503** | 2 calls (2-39), 2-5 ms |

- The cost is not the `MutationObserver`. Angular detaches a removed view's nodes before its destroy hooks run, so in **warm** and **cold** every released host is already disconnected. The observer then fires only for the library's own element removal. Under page churn its callbacks totalled 2-31 ms.
- The cost is quadratic when released hosts stay connected (inside a leaving ancestor). Each `release()` prunes the whole "leaving" set, and each schedules its own one-frame check that prunes it again: 5,000 × 5,000 `isConnected` reads. Chromium blocks for 1.0-2.6 s in one frame. The 1,000-host **leave** run costs 20-46 ms in `release()` and 24-101 ms in frame checks. A single coalesced check was not tried. All three candidates share this code (188's host timing, reused by 189 and 192).
- `acquire()` for 5,000 hosts totals 7-17 ms in every candidate and engine.

#### Chromium only (CDP), 5,000 hosts

| Candidate | Mode | Style recalc, insert / remove, ms | Heap with hosts, KB over the empty page | Heap after remove, KB over the empty page | Longest long task, insert / remove, ms |
| --- | --- | --- | --- | --- | --- |
| own / link / chunk | none | 10.1 / 9.8 / 10.0, remove 0.2 | 1,601 / 1,606 / 1,608 | 418 / 422 / 424 | 67 / 60 / 63, none |
| own / link / chunk | warm | 10.3 / 10.1 / 10.3, remove 0.2 | 3,022 / 3,030 / 3,033 | 581 / 594 / 596 | 116 / 114 / 116, 51 / 51 / 53 |
| own / link / chunk | cold | **199.5** / 11.7 / 13.0, remove 0.4-0.5 | 3,033 / 3,035 / 3,033 | 581 / 594 / 592 | **226** / 120 / 126, 54 / 55 / 60 |
| own / link / chunk | leave-none | about 10, remove 237-254 (the fade) | 1,616-1,622 | 478-483 | 65-72, none |
| own / link / chunk | leave | 186 / 10.5 / 11.0, remove 17-19 (frames blocked) | 3,042-3,052 | 647-654 | 212 / 125 / 131, **1,000 / 2,082 / 2,138** |

- Directive hosts cost about 1.4 MB more heap than plain elements at 5,000 (about 290 B per host). After removal, about 160-180 KB more stays than in the baseline. That is Angular's and the loader's together, not split.
- **own cold** recalculates twice. The 5,000 hosts render unstyled, then the carrier chunk arrives and the `<style>` restyles them all (199.5 ms of recalc against 11.7-13.0 ms for link and chunk). link has the same unstyled window only on a slow network (its `<link>` fetch, 189). chunk has none, because the CSS is in the chunk that carries the directive.

#### Hold scan and server HTML

The server renders n hosts (`?ssr=loader`) or n plain elements (`?ssr=plain`), and the client hydrates them.

| Candidate | Hold scan at hydration, 1,000 hosts, ms (C / F / W) | 5,000 hosts | TTFB, 5,000, loader / plain, ms (C) | HTML per host |
| --- | --- | --- | --- | --- |
| own | 1.9 / 5 / 7 | 8.0 / 10 / 22 | 58 / 39 | +40 B: `data-nfs-styles="callout"` (26 B) and the selector attribute |
| link | 1.1 / 3 / 3 | 9.6 / 11 / 7 | 55 / 44 | the same |
| chunk | 1.3 / 3 / 5 | 7.8 / 8 / 7 | 55 / 43 | the same |

Firefox and WebKit report whole milliseconds. The plain page scans 1 host, the keeper, in 0-1 ms. Critical-CSS handling has no runtime part to time. own and chunk put the family in a `<style>`, which Beasties leaves alone. link sets `data-beasties-skip` on its links (189 measurement 8). The TTFB difference covers rendering the directive and Beasties over a larger document, and was not split.

## Verdict (no decision)

- **own** (184 carriers + 188 `own-style`):
  - Passes every CSP policy in every engine, because it already copies `CSP_NONCE`.
  - In development it costs the slowest settings loop: a full page reload of about 1.0 s. Cold start is about 2.6 s over the baseline, since one lazy carrier chunk per family has to be built.
  - At unload it shares the quadratic leave cost.
  - On a cold first client use, the carrier chunk arrives after the hosts render, so 5,000 hosts are styled twice (377 ms against 180-189 ms).
  - With two applications, it fails like the others for a shared family. It recovers a family the first application removed.
- **link** (189):
  - Has the fastest dev loop: stylesheet HMR in about 470 ms, and a cold start no slower than the baseline.
  - But after that HMR the family never unloads, in every engine, because Vite replaces the tracked `<link>`.
  - Passes Angular's documented `'self' 'nonce'` policy and Trusted Types, and fails a nonce-only `style-src` unless the library copies the nonce.
  - Shares the quadratic leave cost (2.7 s in Chromium at 5,000 hosts, as chunk; own 1.5 s).
  - With two applications it also loses a family the first application removed.
- **chunk** (192's A):
  - Does not apply a Foundation settings edit in the dev server at all until a code file changes or the server restarts.
  - Every component edit takes about 2.1 s to show against about 0.3-0.4 s for the others.
  - Its `<style>` is blocked by every strict policy until the library copies the nonce; with the copy it passes everywhere.
  - Its cold first use costs no more than warm, because the CSS is already in memory.
  - Shares the quadratic leave cost and link's two-application failure.
- **All three:**
  - The `MutationObserver` and the hold scan are cheap: at most 31 ms of callbacks, and 8-22 ms to scan 5,000 server hosts.
  - Removing hosts inside a leaving ancestor is not cheap: 1-2.7 s of blocked main thread at 5,000 hosts in every candidate. Each `release()` prunes the whole set, and each schedules its own frame check.
  - A shared family breaks across two applications on one document, because each application's service adopts and then removes the other's element.

## Unknowns

- Background load from another prototype's servers on the same machine during the timing runs. The medians and ranges absorb part of it.
- The dev server was run through Nx only. chunk on plain Angular CLI needs 192's untested library builder. Whether a plugin-side `watchFiles` fix or Angular's builder can reload the virtual module on a settings edit was not tried. The cause of chunk's 1.9 s component rebuild (Sass compiled again per rebuild) is inferred.
- A fix for link's HMR leak, such as tracking by attribute instead of by element, was not tried. own was not measured with `NG_HMR_CSTYLES=1` (external runtime styles).
- CSP: `autoCsp` (hash-based) and the `CSP_NONCE` token route were not tried, only `ngCspNonce` on the root (`security.md:153-155`). The guide says the token route cannot be used with critical-CSS inlining (`:183`). Trusted Types was tested with Angular's policy names only.
- Several applications: only client-rendered ones with the default `APP_ID`. Two hydrating server-rendered applications, Storybook roots, and a platform-level count were not tried.
- The quadratic leave cost: a coalesced single frame check and a single prune per frame were not tried.
- Style recalc, heap, and long tasks are Chromium only (CDP). Firefox and WebKit timings are whole milliseconds.
- The first dev-server run's unload probe (`devserver.mjs`, last step) was confounded by the dehydrated `@defer` block on `/ssr` staying in the DOM (184's measurement 7 side finding). `hmr-unload.mjs` on `/lifecycle` replaced it.
