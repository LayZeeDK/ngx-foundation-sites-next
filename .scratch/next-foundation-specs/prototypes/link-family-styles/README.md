# Prototype: a `<link>` family style loader with no consumer code

Ticket: [Prototype: a `<link>` family style loader with no consumer code](../../issues/189-prototype-link-loader-no-consumer-code.md).
Builds on [prototypes/lazy-family-styles/README.md](../lazy-family-styles/README.md) (ticket 184, whose ten measurements are reused), [prototypes/unload-after-leave/README.md](../unload-after-leave/README.md) (ticket 188, whose host timing is reused), and [research/lazy-style-loading.md](../../research/lazy-style-loading.md) section 5.3 (M3').

## Question

Can family styles load and unload lazily, compiled with the consumer's Foundation Sass settings, with no code in the consumer's codebase beyond its settings and build configuration? The candidate is this repository's `NfsStyleLoader` approach (`packages/ngx-foundation-sites/src/lib/core/nfs-style-loader.service.ts`, `docs/accordion/phase-11-styles-architecture.md`): the library ships one `.scss` entry per family, the consumer's build compiles each as a non-injected global style bundle (`inject: false`, `bundleName`), and a library service inserts and removes a counted `<link>`.

The ticket's five points: (1) server HTML and hydration, (2) what is left in the consumer's project, (3) URLs, (4) cost, (5) unload after leave animations. The orchestrator added three more on 2026-10-01 (its words, not the user's): enter animations whose keyframes ship in the family CSS; `@defer (hydrate on viewport)` and `(hydrate on interaction)` with server-rendered content; and whether a public-API way keeps Beasties' critical-CSS copy from outliving the unload without turning inlining off for everything.

Families are 184's: **Callout** alone, **Dropdown Menu** over **Menu**, and **Button**.

## The mechanism

- **Library SCSS (`src/lib/scss/`), shipped as source.** `global.scss` writes the `@layer` order statement (`nfs.global, nfs.forms, nfs.button, nfs.callout, nfs.menu, nfs.dropdown-menu`) and Foundation's global styles and forms inside the first two layers. Each `<family>.scss` does `@import 'settings'; @import 'foundation-sites/scss/foundation';` and wraps `@include foundation-<family>` in `@layer nfs.<family>`. `_layer.scss` is a prototype switch for the unlayered build.
- **Consumer build configuration (`project.json`).** `global.scss` is the first injected `styles` entry. Each family is `{ "input": ".../<family>.scss", "bundleName": "nfs-<family>", "inject": false }`. `stylePreprocessorOptions.includePaths` holds the consumer's settings directory, so `@import 'settings'` in every library file reads the consumer's `_settings.scss`.
- **Library TypeScript (`src/lib/link-styles.ts`), no provider.** `NfsFamilyStyles` is `providedIn: 'root'`; each directive calls `useNfsFamilyStyles('menu', 'dropdown-menu')` from its constructor and sets `data-nfs-styles`. The service counts hosts per family.
  - On 0 to 1 it appends `<link rel="stylesheet" href="<prefix>nfs-<family>.css" data-nfs-family="<family>" data-beasties-skip>` to `document.head`. This runs in the constructor, not `afterNextRender`, so on the server it writes into the server document and the link is in the server HTML.
  - On the client, the service starts with the first directive. It adopts every `link[data-nfs-family]` the server rendered, and counts every server-rendered `[data-nfs-styles]` element until a directive claims it (184's measurement 7 fix, with no bootstrap initializer).
  - `<prefix>` is the directory of the global `styles-*.css` link in the document (`deployUrl` included), or empty, so the URL resolves against `<base href>`.
  - On 1 to 0 it removes the link. The default unload mode is 188's host timing: a released host counts until it is disconnected (one `MutationObserver`, plus a check one frame after release). `?unload=animations` (184's `document.getAnimations()` wait) and `?unload=immediate` are switches.
- **Prototype variants**, swapped with `fileReplacements` (`switches.*.ts`): `single` (one non-injected `nfs-families.css` for every family), `plugin` (an esbuild plugin through Nx's `@nx/angular:application` `plugins` option, see point 2), `noskip` (no `data-beasties-skip`), and `preload` (`index.preload.html` preloads every family bundle).

## What is here

Only the decisive files. The runnable workspace is `D:/tmp/nfs-proto-189`, a copy of 184's (Nx 23.2.1, Angular 22.2.0, `@angular/build`, `@angular/ssr` and `@angular/localize` 22.2.0, Dart Sass 1.104.1, `foundation-sites` 6.9.0, Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6, on Windows 11 arm64). It is not committed. Paths below are relative to `apps/fixture/` in the workspace unless they start with `tools/`, `measure/`, or a script name.

- `project.json` (written by `gen-project.mjs`): the `build` target (`@angular/build:application`, `outputMode: server`) with configurations `production`, `unlayered`, `cachebust` (one callout setting changed), `preload`, `single`, `subpath` (`baseHref: '/sub/'`), `cdn` (`deployUrl: 'http://127.0.0.1:4696/cdn/'`), `i18n` (`localize: true`, `en-US` and `da`), and `noskip`; and the `build-plugin` target (`@nx/angular:application` with `plugins`).
- `src/lib/link-styles.ts`, `src/lib/directives.ts`, `src/lib/switches.ts`, `src/lib/plugin-loaders.plugin.ts`, `src/lib/scss/` (`global.scss`, `callout.scss`, `dropdown-menu.scss`, `all.scss`, `_layer.scss`; `button.scss` and `menu.scss` have the callout shape). `callout.scss` also carries the prototype-only `.proto-enter` keyframes for the enter-animation measurement.
- `src/foundation-settings/_settings.scss` (the consumer's settings, six non-default values as in 184), `src/styles.scss` (the consumer's own global styles, no Foundation left), `src/index.preload.html`, `src/app/app.config.ts` (no library provider), `src/app/enter-page.ts`, `src/app/hydrate-defer-page.ts`. The other pages are 184's.
- `src/server.ts`: Angular's generated server plus two prototype additions: static files also under `/sub` and `/cdn` (with `Access-Control-Allow-Origin: *` for the cross-origin module scripts of the `cdn` build), and a cookie-driven delay for `nfs-*.css` and `chunk-*.js` (`nfs-delay-css=300`), so slow-network runs keep the browser's own cache and preloads.
- `tools/nfs-esbuild-plugin.mjs`: the plugin variant. It resolves `nfs-family-css:<family>` to a module whose default export is the family's CSS, compiled with Dart Sass from the library's `<family>.scss` and the `includePaths` in its options.
- `measure/measure.mjs` (all points, one engine per run; `ONLY=preload` runs the preload rerun), `measure/summarize.mjs`, `measure/measure-look.mjs` (184's measurement 9, pointed at port 4691).
- `results/`: raw JSON per engine, `results-preload-*.json`, `look.json`, and `summary.txt`.

## How to run

```
cd D:/tmp/nfs-proto-189
bash build-all.sh            # every configuration plus build-plugin, about 1 minute in all
./serve.sh                   # ports 4691 production, 4692 unlayered, 4693 preload, 4694 single,
                             # 4695 subpath (/sub/), 4696 cdn, 4697 i18n (/da/, /en-US/), 4698 plugin,
                             # 4699 noskip; sets NG_ALLOWED_HOSTS=localhost,127.0.0.1
node measure/measure.mjs chromium    # also firefox, webkit; about 4 minutes each
ONLY=preload node measure/measure.mjs chromium
node measure/summarize.mjs
node measure/measure-look.mjs
./kill-servers.sh            # stops only these ports, by PID
```

A single server: `NG_ALLOWED_HOSTS=localhost,127.0.0.1 PORT=4691 node dist/apps/fixture-production/server/server.mjs`. Pages: `/ssr`, `/lifecycle`, `/client-defer`, `/enter`, `/hydrate-defer`, `/order`, `/order-ssr-normal`, `/order-ssr-reversed`. Query switches (browser only): `?unload=immediate|animations` (default host timing) and `?hold=off`.

## Results

"All engines" means the same result in Chromium, Firefox, and WebKit. Raw values are in `results/`. Unstyled frames are counted by sampling `getComputedStyle` every `requestAnimationFrame`, as in 184.

| # | Measurement | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Consumer settings reach the CSS | **Pass**, all engines, every build | 184's six values (callout `padding-top` 44px, button `rgb(163, 0, 30)`, radius 8px, and so on) in `production`, `single`, `plugin`, `subpath`, `cdn`, `i18n` (both locales), and `noskip`. |
| 2 | Absent before the first instance, present while any exists, removed after the last | **Pass**, all engines | Callout link count over add, add, remove, remove, add, remove: `0 1 1 1 0 1 0`, one request for `nfs-callout.css`. The server HTML of `/lifecycle` has no family link. `single` and `plugin` give the same counts. |
| 3a | Point 1, SSR and full hydration | **Pass**, all engines | One `<link data-nfs-family>` per family in the server HTML, in the order `button > menu > dropdown-menu > callout`. With JavaScript off every setting applies and the submenu is `display: none`. With JavaScript on: 0 `<link>`/`<style>` mutations after `DOMContentLoaded`, 0 unstyled frames (about 30-57 sampled), one link per family after hydration. |
| 3b | Point 1, incremental hydration, `@defer (on interaction; hydrate on interaction)` on `/ssr` | **Pass**, all engines | Styled before hydration (44px, also with JavaScript off), 0 mutations when the block hydrates. With `?hold=off` the link is removed under the dehydrated callout (0px) and added again at hydration (2 mutations), so the hold is needed. |
| 3c | Added: `@defer (on viewport; hydrate on viewport)` and `(on interaction; hydrate on interaction)` with no other callout on the page (`/hydrate-defer`) | **Pass**, all engines | 0 unstyled frames out of about 136-160 through scrolling to and clicking both blocks, 0 style mutations, one callout link before and after. No family directive hydrates at bootstrap here, so the service starts only when the first block hydrates, and it adopts the server link then. |
| 3d | Point 1, client-only `@defer (on interaction)` (`/client-defer`) | **Fail on a slow network; pass with preloads** | Cold, local server: 0-1 unstyled frame in every engine. CSS delayed 300 ms on the server: 18-20 unstyled frames (283-307 ms) in every engine. **Fix attempt 1**, server-rendered `<link rel="preload">` from the service: no change, because the service only exists on a page where a family directive rendered on the server, and `/client-defer` has none. **Fix attempt 2**, `<link rel="preload" as="style">` for every family in `index.html` (`preload` build): 0 unstyled frames in every engine with the same 300 ms delay. Cost: every family's CSS is downloaded with the page, 17.9 kB raw for four families, like 184's eager carriers. |
| 4 | Same cascade in every load order | **Pass with `@layer`**, all engines | Submenu `none/absolute` with the menu sheet first, the dropdown-menu sheet first, a plain menu first, and both server orders. `unlayered` build, dropdown-menu sheet first: `flex/relative`, client and server. |
| 5 | Point 2, what the consumer writes | **Settings plus configuration; no TypeScript** (see below) | 0 new files, 0 TypeScript. In the one build configuration file: 1 `styles` line for `global.scss`, 5 lines per family entry (20 for four), and 3 lines of `includePaths`. The Foundation `@include`s leave the consumer's `styles.scss`. |
| 6 | Point 5, unload after leave animations | **Pass with host timing**, all engines | See the table below. |
| 7 | Server instances waiting for hydration are counted | **Pass with the hold**, all engines | As 3b and 3c. The hold is in the service constructor, so it needs no consumer provider. |
| 8 | Beasties and the unload | **Fail by default; pass with `data-beasties-skip`**, all engines | `noskip`: Beasties turns each family link into `media="print"` with a `<noscript>` copy, and copies the family's critical rules into its inline `<style>` (inside the right `@layer` blocks). After the last callout is destroyed, a new `div.callout` still gets 44px: the copy outlives the unload (as 188 measured). With the library setting `data-beasties-skip` on its own links (a documented Beasties attribute; `beasties/dist/runtime.mjs:729`), the links stay plain render-blocking stylesheets, the inline `<style>` holds no family rules, and the probe gets 0px. Critical-CSS inlining stays on for the global stylesheet (its link is still `media="print"` with the inline copy first, starting with the `@layer` statement). |
| 9 | Foundation's unlayered tag rules | **Same as 184**, all engines | The compile-only comparison gives 184's numbers (44 differences unlayered, 0 in the first layers). The running app against the reference differs only in `-webkit-locale` (`en` against `en-US`, from this workspace's `i18n.sourceLocale: en-US`) in Chromium and WebKit, and in Firefox's `font-family` serialisation, as in 184. |
| 10 | Point 4, cost | **One request per family; no JavaScript** | Cold `/ssr` load: 4 CSS requests (`nfs-button.css` 7,897 B, `nfs-callout.css` 688 B, `nfs-menu.css` 3,811 B, `nfs-dropdown-menu.css` 5,528 B; gzip 1,376 / 330 / 903 / 800 B). Nothing else is fetched at hydration. `single`: 1 request, 17,812 B (2,750 B gzip). 184's carrier chunks, for comparison (gzip): button 1,568 B, callout 458 B, menu 1,084 B, dropdown-menu 979 B, fetched as JavaScript at hydration on top of the CSS already inlined in the server HTML. |

### Point 3: URLs

| Deployment | Server-rendered links | Client-inserted link | All settings apply |
| --- | --- | --- | --- |
| `production` (`<base href="/">`) | `http://localhost:4691/nfs-*.css` | `http://localhost:4691/nfs-callout.css` | yes, all engines |
| `subpath` (`baseHref: '/sub/'`) | `/sub/nfs-*.css` | `/sub/nfs-callout.css` | yes, all engines |
| `cdn` (`deployUrl: 'http://127.0.0.1:4696/cdn/'`, page on `localhost`) | `http://127.0.0.1:4696/cdn/nfs-*.css` | the same | yes, all engines |
| `i18n` (`localize: true`) | `/da/nfs-*.css`, `/en-US/nfs-*.css` | the same per locale | yes, all engines |

- The builder writes every non-injected bundle into each locale's folder (`browser/da/nfs-callout.css`, `browser/en-US/nfs-callout.css`), so a root-absolute `/nfs-callout.css`, which today's `NfsStyleLoader` uses (`phase-11-styles-architecture.md` 11.2.4), would miss in the `i18n` build and ignore `baseHref` and `deployUrl`. The prefix read from the global `styles-*.css` link resolves all four. It depends on the consumer keeping a global stylesheet bundle named `styles`, which the injected `global.scss` entry ensures. If there is none, the URL falls back to the `<base href>`, which is wrong only with `deployUrl`.
- **Cache busting fails.** With `outputHashing: all`, the bundle names stay `nfs-<family>.css`. The `cachebust` build changes only `$callout-sizes`: `nfs-callout.css` changes (padding `2.75rem` to `3.5rem`), while `main-NUPDHQ26.js` and `styles-NWRFCIUC.css` keep their hashes, so nothing in the page changes to signal the update. Angular's generated `server.ts` serves every static file with `Cache-Control: public, max-age=31536000` (measured on `nfs-callout.css`), so a returning browser may keep the old family CSS for up to a year. The library has no hashed value that changes with the family CSS. A fix needs consumer code, such as a `setHeaders` exception for `nfs-*.css` in `server.ts` (not built), or a CDN rule.

### Point 5 (measurement 6): unload after leave

Scenarios on `/lifecycle`, each on a fresh load, from 184: **L1**, a callout inside an element with `animate.leave` (600 ms) is removed; **L2**, the last callout is destroyed while an unrelated element leaves; **L3**, the last callout is destroyed while an element with an `(animate.leave)` listener is on the page. Each is followed by two add/remove rechecks.

| Unload mode | L1 | Unstyled frames while L1's host leaves | Link removed after L1's host left | L2 | L3 |
| --- | --- | --- | --- | --- | --- |
| `immediate` | removed at once | 29-36 | about 600 ms before | pass | pass |
| `animations` (184's public wait) | pass | 0 | 15 / 15 / 45 ms (Chromium / Firefox / WebKit) | pass | pass |
| `host` (188's host timing, the default) | pass | 0 | 0 ms, the same frame | pass | pass |

The library owns the `<link>`, so Angular's `allLeavingAnimations` guard (184 measurement 6, 188) never applies, and L2 and L3 pass in every mode. The only failure is `immediate` unstyling a callout whose ancestor is still leaving.

### Added: enter animations whose keyframes ship in the family CSS (`/enter`)

`callout.scss` adds `.proto-enter { animation: proto-enter 500ms linear both }` with its keyframes, inside `@layer nfs.callout`. The callout uses `animate.enter="proto-enter"` and is inserted by a click (`@if`) or by a client-only `@defer (on interaction)`. "On time" means the animation ran from the first frame the element was styled; "skipped" means no frame showed the animation.

| Case | Chromium | Firefox | WebKit |
| --- | --- | --- | --- |
| Click-inserted, CSS cold, local server | skipped | skipped | on time |
| Click-inserted, CSS cold, 300 ms delay | skipped | skipped | skipped |
| Click-inserted, CSS in the HTTP cache | on time | on time | on time |
| Client-only `@defer`, CSS cold, local server | on time | skipped | on time |
| Client-only `@defer`, CSS cold, 300 ms delay | skipped | skipped | skipped |
| Client-only `@defer`, CSS in the HTTP cache | on time | on time | on time |
| Either, `index.html` preloads, cold or 300 ms delay | on time | on time | on time |
| Plugin variant (`<style>` from a lazy chunk), cold local or 300 ms delay | skipped (on time for cold-local `@defer`) | skipped | skipped |

The animation never plays late. Angular's `animate.enter` adds the class, and one `requestAnimationFrame` later removes it if no animation is computed on the element (read from source: `@angular/core` 22.2.0 `fesm2022/_debug_node-chunk.mjs:14385-14393`, `runEnterAnimation`). So the animation plays only when the family CSS has applied by that frame. When it is skipped, the element appears in its final state as soon as the CSS arrives, after 1-20 unstyled frames.

## Point 2 in detail: what is left in the consumer's project

| What | Where | Lines | TypeScript |
| --- | --- | --- | --- |
| The consumer's Foundation settings | their existing `_settings.scss` | 0 new | no |
| `global.scss` as the first `styles` entry | `angular.json` or `project.json` | 1 | no |
| One `{ input, bundleName: 'nfs-<family>', inject: false }` per family | the same file | 5 per family (20 for four) | no |
| The settings directory on `stylePreprocessorOptions.includePaths` | the same file | 3 (plus 2 if `stylePreprocessorOptions` is new) | no |
| Foundation's `@import`s and `@include`s | their `styles.scss` | removed (they move into the library's `global.scss`) | no |
| Optional: `silenceDeprecations` for Foundation's `@import` warnings | the build file | 7 | no |
| Optional, for client-only `@defer` and enter animations: one `<link rel="preload" as="style">` per family | `index.html` | 1 per family | no |
| Optional, for cache busting: a `Cache-Control` exception for `nfs-*.css` | `server.ts` | about 3 (not built) | yes |

No provider: `app.config.ts` has no library line. All of this is JSON, Sass, or HTML that an `ng add` schematic or an Nx generator could write and rerun when a family is added. The library needs about 270 lines in the prototype (`link-styles.ts`, switches included).

Tried to remove the per-family entries:

- **A single entry (`single`).** One `{ input: all.scss, bundleName: 'nfs-families', inject: false }` replaces the four. It works (measurements 1 and 2 pass), but the first family used loads every family (17,812 B), and the bundle unloads only when no family is in use, so families no longer load and unload on their own.
- **An esbuild plugin (`build-plugin`).** Nx's `@nx/angular:application` executor passes `plugins` to `@angular/build`'s `buildApplication` as `codePlugins` (`@nx/angular/dist/src/executors/application/application.impl.js:31`). Angular CLI's `@angular/build:application` has no `plugins` option (its `schema.json` lacks it), so this needs Nx's executor. The library's plugin resolves `nfs-family-css:<family>` imports in the library's own code to the compiled CSS. The consumer writes the global entry and about 8 lines of `plugins` (path plus `options.includePaths`, which repeats the settings directory because the plugin does not see `stylePreprocessorOptions`), and nothing per family. The CSS then arrives as a hashed lazy chunk (cache busting solved) and the library inserts an owned `<style>`, so it becomes 188's `own-style` with a build step, not a `<link>`. Measured: settings, lifecycle, SSR, hydration, `/hydrate-defer`, and the unload all pass in every engine; client-only `@defer` with a 300 ms chunk delay shows 17-20 unstyled frames, as 184's lazy carriers did. The plugin's Sass output skips Angular's CSS optimisation (callout chunk 1,011 B against 688 B for the bundle, and `hsl(0,0%,99.94%)` where the bundle has `#fff`).

## gsd-pi: how it meets the two conditions

Read only, in `D:/projects/github/LayZeeDK/ngx-foundation-sites-gsd-pi/packages/ngx-foundation-sites/`.

- **How it works.** `NfsButton` is a component, not a directive, with `styleUrl: './nfs-button.scss'` and `encapsulation: ViewEncapsulation.None` (`src/lib/nfs-button/nfs-button.ts:31-32`). The comment says this is to get Angular's ref-counted load and unload through `SharedStylesHost`, and that this is why it stays a component (`nfs-button.ts:22-26`; `README.md:77`, `:163`). The stylesheet does `@use 'button' as nfs-button;` and `@layer nfs-defaults { @include nfs-button.theme; }` (`nfs-button.scss:15`, `:24-25`). It is compiled when the library is built, with `lib.styleIncludePaths: ["src/scss"]` (`ng-package.json:14`).
- **Where the values come from.** The theme mixin reads a private defaults table of plain assignments that copy Foundation 6.9.0's defaults (`src/scss/internal/_settings.scss:1-12` comment, values from `:15`, palette at `:48`). `internal/_foundation-button.scss` seeds Foundation's globals from that table (`:30-49`) before it `@import`s Foundation's button Sass (`:51-53`).
- **Condition 1, no consumer code: met for the default look.** The component brings its CSS; the consumer writes nothing (`README.md:77`).
- **Condition 2, the consumer's own Foundation settings: not met.** The README says so: bare Foundation `$variables`, including a full `_settings.scss`, have no effect and compile byte-identically (`README.md:150`). Theming goes through four named mixin arguments, `$selector`, `$background`, `$palette`, and `$radius` (`src/scss/_button.scss:58-62`), which the consumer calls in its own global stylesheet (`README.md:84-87`). That themed copy is unlayered, global, eager, and never unloaded, so a themed app ships the button rules twice (`_button.scss:27-31`; `README.md:107`). This is ADR 0012's reason: library-compiled CSS cannot see the consumer's settings.
- **Inferred, not measured:** its load and unload go through Angular's count, so 184's two gaps (removal skipped while any leave animation or `(animate.leave)` listener exists, and dehydrated instances not counted) apply to it too. It also needs a component per family, which this repository's directive-first families cannot carry (research section 2).

## Comparison

"184 lazy" and "184 eager" are 184's consumer-compiled carrier components; "link" is this loader with host timing and `data-beasties-skip`; "link + preload" adds the `index.html` preloads; "plugin" is the esbuild-plugin variant; "gsd-pi" is read from source. Measured in all three engines unless marked.

| | 184 lazy carriers | 184 eager carriers | link | link + preload | plugin | gsd-pi |
| --- | --- | --- | --- | --- | --- | --- |
| Consumer's own Foundation settings | yes | yes | yes | yes | yes | **no** (four mixin arguments; `README.md:150`) |
| Consumer files and TypeScript | 9 new files, 63 lines, plus 11 lines in 3 files; **TypeScript** (carriers, map, provider) | the same, one carrier file | 0 new files; 24 lines of build JSON; **no TypeScript** | link plus 1 `index.html` line per family | 0 new files; global entry plus about 8 lines of `plugins`; no TypeScript; **needs Nx's executor** | none for the default look; theming is Sass mixin calls |
| Per further family | 2 files, 15 lines | 1 import line | 5 JSON lines | 6 lines | nothing | none |
| Server HTML styled, full and incremental hydration | yes, 0 mutations (with 184's hold) | yes | yes, 0 mutations | yes | yes, 0 mutations | yes (inferred; Angular's `SharedStylesHost`) |
| `hydrate on viewport` / `on interaction`, server content | yes (3b, interaction only) | yes | yes, 0 unstyled frames | yes | yes, 0 | not measured |
| Client-only `@defer`, 300 ms latency | 19-20 unstyled frames | 0 | 18-20 | **0** | 17-20 | not measured |
| Enter animation, cold | not measured (inferred: skipped when the chunk is late) | not measured (inferred: on time) | skipped | **on time** | skipped | not measured |
| Unload after leave, L1 / L2 / L3 | Angular's count leaks in all three; only private API or `repair` passes | the same | **pass / pass / pass** | the same | pass (188's `own-style` result; host timing here) | inherits Angular's leak (inferred) |
| Beasties copy after unload | none (carriers are `<style>`) | none | none with `data-beasties-skip`; **leaks without it** | the same | none | n/a |
| Load order | `@layer` | `@layer` | `@layer` | `@layer` | `@layer` | single family; `@layer nfs-defaults` against unlayered theming |
| Network | one JS chunk per family at hydration, plus CSS inlined in HTML | in `main.js` (+4.4 kB transfer for four) | one CSS request per family, render-blocking in server HTML, none at hydration | every family's CSS with the page | one JS chunk per family; CSS inlined in HTML | CSS in the library's JS |
| Cache busting | hashed | hashed | **fails** (unhashed names, 1-year `max-age`) | fails | hashed | hashed |
| `deployUrl`, `baseHref`, i18n | builder's chunk URLs (not measured) | in `main.js` | pass (prefix from the global stylesheet link) | `index.html` hrefs ignore `deployUrl` (inferred) | builder's chunk URLs (not measured) | n/a |
| Private Angular API | needed for a full leave fix | the same | none | none | none | none |

## Verdict

- **The two conditions hold.** Consumer-compiled, non-injected bundles carry the consumer's own settings in every engine and every deployment tried, and the consumer writes no TypeScript: its settings file, about 24 lines of build JSON, and the removal of Foundation's includes from `styles.scss` (points 2 and 3, measurements 1 and 5).
- **Point 1 holds with public API.** Inserting the `<link>` from the directive's constructor through `DOCUMENT` puts it in the server HTML; the client adopts it by attribute. Full hydration, incremental hydration, and `hydrate on viewport` / `on interaction` blocks show 0 unstyled frames and 0 style mutations. The service starts with the first directive and holds server instances from there, so no bootstrap code is needed.
- **Client-only first renders flash on a slow network and skip enter animations.** This loader does no better than 184's lazy carriers here: 18-20 unstyled frames at 300 ms, and the animation is skipped because Angular gives it one frame. Preloading every family in `index.html` fixes both in every engine, at the cost of downloading every family's CSS with the page (17.9 kB raw, about 3.4 kB gzip, for four), as 184's eager carriers did.
- **Owning the `<link>` removes the leave-animation leak.** Angular's guard never applies, and 188's host timing removes the link in the frame the last host leaves, in L1, L2, and L3.
- **Beasties needs `data-beasties-skip`.** Without it the family's critical rules outlive the unload. The attribute keeps inlining on for the global stylesheet, but makes each family link render-blocking in the server HTML (ticket 190 measures the cost).
- **Cache busting is the one failure without consumer code.** Unhashed bundle names under a one-year `max-age` need a server or CDN rule. The esbuild-plugin variant avoids it, and the per-family entries, but needs Nx's executor and becomes an owned `<style>`.
- **gsd-pi** meets "no consumer code" for its default look only. It does not apply the consumer's Foundation settings, by its own README.

## What this prototype does not prove

- CSP: the library's `<link>` and the plugin's `<style>` carry no nonce; `style-src` rules for them were not tried.
- A cold network beyond the server-side 300 ms delay, HTTP/2 against HTTP/1.1, and the render-blocking cost of one family link per family in the server HTML (ticket 190).
- Whether `rel="preload"` warnings ("preloaded but not used") appear for families a page never uses, and preloads under `deployUrl` (the `index.html` hrefs are not rewritten by the builder; inferred).
- Prerendering, client-side route navigation between pages that share families, zone.js applications, several applications on one page, and the Variant declaration generator reading `:root` properties from families that left the global stylesheet.
- The stale-cache effect itself: the header and the unchanged name were measured, a returning browser was not.
- gsd-pi was read, not run.
- A host with its own `animate.leave` under host timing (188 leaves it open too).
