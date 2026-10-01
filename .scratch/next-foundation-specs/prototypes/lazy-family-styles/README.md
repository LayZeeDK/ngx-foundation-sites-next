# Prototype: lazy family styles

Ticket: [Prototype: a directive that loads and unloads its family's consumer-compiled styles](../../issues/184-prototype-lazy-family-styles.md).
Builds on [research/lazy-style-loading.md](../../research/lazy-style-loading.md) (M1 and M1') and [research/foundation-sass-per-family.md](../../research/foundation-sass-per-family.md).

## Question

Can a directive load its Foundation family's CSS, compiled by the consumer's build with the consumer's settings, when the first instance renders, and remove it when the last instance is destroyed? It must hold under SSR, full and incremental hydration, client-only `@defer`, and `animate.leave`. The CSS must cascade the same in any load order. The ticket's ten measurements are below.

Families: **Callout** stands alone. **Dropdown Menu** depends on **Menu**, and with plain sheets their load order changes the computed style. **Button** is there for measurement 9 (`<button class="button">` against Foundation's `button` reset).

## The mechanism

This is the research's M1' with the library counting instances itself: one hidden carrier component per family, not one per instance.

- **Consumer files (a generator could write them).** For each family, `nfs-families/<family>.scss` does `@import 'settings'; @import 'foundation-sites/scss/foundation';` and wraps `@include foundation-<family>` in `@layer nfs.<family> { ... }`. Next to it, `nfs-families/<family>.ts` is a `ViewEncapsulation.None` component with an empty template and `styleUrl` pointing at that file. `carriers.ts` maps each family name to `() => import('./<family>')`. The consumer's build compiles these files, so the settings on `includePaths` apply.
- **Library code (`src/lib/family-styles.ts`).** `provideNfsFamilyStyles(carriers)` provides a root `NfsFamilyStyles` service. Each directive calls `useNfsFamilyStyles('menu', 'dropdown-menu')` from its constructor. The service counts host elements per family. On 0 to 1 it loads the carrier (through `PendingTasks`, so the server waits) and creates it with `createComponent`, and Angular's `SharedStylesHost` inserts the `<style>`. On 1 to 0 it waits (see measurement 6) and then destroys the carrier. Every directive also sets a host attribute, `data-nfs-styles="<families>"`. At client bootstrap, `holdServerInstances()` counts every server-rendered element that carries it until a directive claims it (measurement 7).
- **Cascade.** The consumer's `styles.scss` starts with `@layer nfs.global, nfs.forms, nfs.button, nfs.callout, nfs.menu, nfs.dropdown-menu;` (Foundation's source order). It keeps `foundation-global-styles` and `foundation-forms` global, inside the first two layers.

## What is here

Only the decisive files. The runnable workspace is `D:/tmp/nfs-proto-lazy-family-styles` (Nx 23.2.1, Angular 22.2.0, `@angular/build` and `@angular/ssr` 22.2.0, Dart Sass 1.104.1, `foundation-sites` 6.9.0, TypeScript 6.0.3, Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6, on Windows 11 arm64). It is not committed.

- `project.json`: the `fixture` app. It uses `@angular/build:application` with `outputMode: server`, the settings directory on `stylePreprocessorOptions.includePaths`, and three production configurations: `production` (lazy carriers, layered), `eager` (`fileReplacements` swaps in `carriers.eager.ts`, so the carriers ship in `main.js`, research M1), and `unlayered` (a settings file that turns the `@layer` wrappers off).
- `src/foundation-settings/_settings.scss`: the consumer's settings. Six values differ from Foundation's defaults. It also defines the prototype-only `$nfs-layers` switch and the `nfs-proto-layer` mixin, which writes `@layer nfs.<name> { ... }` or nothing.
- `src/styles.scss`: the order statement, plus global styles and forms in the first two layers.
- `src/nfs-families/`: `callout.scss`, `callout.ts`, `dropdown-menu.scss` (the other carriers have the same shape), `carriers.ts`, and `carriers.eager.ts`.
- `src/lib/family-styles.ts`: the service, the provider, `useNfsFamilyStyles`, and the research M1 per-instance variant used for measurement 10.
- `src/lib/directives.ts`: `nfsButton`, `nfsCallout`, `nfsMenu`, `nfsDropdownMenu`, the test-only `nfsDropdownMenuReversed` (dropdown-menu sheet first), and `nfsCalloutPerInstance`.
- `src/app/`: one route per measurement group: `/lifecycle`, `/ssr`, `/client-defer`, `/order`, `/order-ssr-normal`, `/order-ssr-reversed`, and `/bench?n=`. All routes use `RenderMode.Server`, and `provideClientHydration()` is the 22.2 default with incremental hydration and event replay.
- `measure/measure.mjs`: measurements 1-4, 6-8, and 10 in all three engines. `measure-look.mjs` is measurement 9, `summarize.mjs` prints one line per result, and `probe-7b.mjs` is the dehydrated-block removal probe.
- `results/results.json` and `results/look.json`: the raw output of the run reported here.

## How to run

```
cd D:/tmp/nfs-proto-lazy-family-styles
bash build-all.sh          # npx nx run fixture:build:{production,eager,unlayered}
./serve.sh                 # ports 4611 lazy, 4612 eager, 4613 unlayered; sets NG_ALLOWED_HOSTS
node measure/measure.mjs   # about 5 minutes for the three engines; writes out/results.json
node measure/summarize.mjs
node measure/measure-look.mjs
```

Prototype switches (query string, browser only): `?unload=immediate|animations|private|repair` (measurement 6; the default is `animations`) and `?hold=off` (measurement 7 baseline).

## Results

"All engines" means the same result in Chromium, Firefox, and WebKit. Raw values are in `results/`.

| # | Measurement | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Consumer settings reach the CSS | **Pass**, all engines | Callout `padding-top` 44px (default 16px); `.button` background `rgb(163, 0, 30)` (default `rgb(23, 121, 186)`), radius 8px, `padding-left` 31.68px (default 14.4px); menu link `padding-top` 19.2px (default 11.2px); submenu background `rgb(253, 243, 208)`. Firefox and WebKit report sub-pixel values (31.6938px, 19.200001px). |
| 2 | Absent before the first instance, present while any exists, removed after the last | **Pass**, all engines | `<style>` count over add, add, remove, remove, add, remove: `0 1 1 1 0 1 0`. The server HTML of `/lifecycle` has no callout rule, and the lazy build's `main.js` has none. After a leave animation, see 6. |
| 3a | SSR, full hydration | **Pass**, all engines | One `<style ng-app-id>` per family in the server HTML. With JavaScript off, the callout is 44px and the submenu `display: none`. With JavaScript on, there are 0 `<style>`/`<link>` mutations after `DOMContentLoaded`, 0 unstyled frames out of about 59 sampled by `requestAnimationFrame`, and still one element per family after hydration. |
| 3b | Incremental hydration, `@defer (on interaction; hydrate on interaction)` | **Pass with the 7 fix**, all engines | Styled before hydration (44px, also with JavaScript off). 0 style mutations when the block hydrates. Without the fix (`?hold=off`), the style is removed and re-added (2 mutations). |
| 3c | Client-only `@defer (on interaction)` | **Fail with lazy carriers; pass with eager carriers** | Lazy carrier, local server: unstyled first frames in Chromium 0, Firefox 1, WebKit 0 (1 in an earlier run). Lazy carrier with the chunk delayed 300 ms: 19-20 unstyled frames in all engines. **Fix tried: eager carriers** (`eager` build): 0 unstyled frames in all engines. Cost: initial bundle 297.79 kB raw / 81.56 kB transfer against 280.75 / 77.13 kB, for the four families. |
| 4 | Same cascade in every load order | **Pass with `@layer`**, all engines | Submenu `display: none; position: absolute` with the menu sheet first, the dropdown-menu sheet first, a plain menu first, and both server orders, from the first frame. The `unlayered` build, dropdown-menu sheet first: `flex; relative` (client and server), so the layers are what fixes the order. The server inserted carriers as `button > menu > dropdown-menu > callout`, not in DOM order. |
| 5 | What the consumer writes | **Counted** (see below) | 9 new files and 63 lines for four families, plus 11 lines in 3 existing files. |
| 6 | Unload after `animate.leave` without a leak | **Angular's own count fails; the private-API fix passes; the public fixes pass with limits** | See the table below. |
| 7 | Instances waiting for incremental hydration are counted | **Fail without the fix; pass with it**, all engines | Baseline (`?hold=off`): after the last hydrated callout is destroyed, the dehydrated callout is still on the page with `padding-top` 0px. **Fix:** the host attribute and the bootstrap scan in `holdServerInstances()`. The style stays (44px), and it is removed after the hydrated block's callout is destroyed. Side finding: turning off the `@if` around a still-dehydrated `@defer` block left its server DOM on the page (attributes `jsaction` and `ngb` stripped) in all engines, so the hold keeps styling an element that is still visible. |
| 8 | Beasties and a leading `@layer` statement | **Pass**, all engines | `@angular/ssr`'s critical-CSS step puts its inline `<style>` first in `<head>`, before the `styles-*.css` link (`media="print"`) and before every carrier `<style>`, and its text starts with the full `@layer` order statement. The only family names in it are the ones in that statement, so it never copies family rules. Each carrier `<style>` equals the carrier's compiled CSS (not pruned). After the last unload, a probe `div.callout` has `padding-top` 0px, so nothing outlives it. |
| 9 | Foundation's unlayered tag and attribute rules | **Fail unlayered; pass in the first layers**, all engines | Families layered, global styles and forms unlayered: 44 computed-property differences from Foundation's own unlayered cascade, all on `<button class="button">` (transparent background, 0 padding, 16px font: the `button` reset wins). Global styles and forms in `nfs.global` and `nfs.forms`: 0 differences in all engines. The running app (SSR plus hydration, lazy carriers) against the reference: 0 differences in Chromium and WebKit. Firefox shows 23, all `font-family` serialisation (`"Helvetica Neue"` against `Helvetica Neue`, from the build's CSS minifier). |
| 10 | One carrier per instance against one per family | **Measured** | Chromium heap after GC with 1,000 callouts: 3,226 KB per instance against 1,442 KB per family. With 5,000: 12,469 against 3,572 KB, about 1.8 KB more per instance. Render time (median of 5, two `requestAnimationFrame`): 1,000 per instance against per family, Chromium 43 / 28 ms, Firefox 31 / 30, WebKit 76 / 61. 5,000: Chromium 227 / 189, Firefox 128 / 79, WebKit 483 / 451. An earlier run had per instance faster at 5,000 in Chromium (202 / 218) and WebKit (560 / 572), so the time gap is in the noise there. Destroy time is similar. Both keep one `<style>`. |

### Measurement 6 in detail

Scenarios on `/lifecycle`, each on a fresh load: **L1**, a callout inside an element with `animate.leave="proto-fade-out"` (600 ms) is removed; **L2**, the last callout is destroyed while an unrelated element runs its leave animation; **L3**, the last callout is destroyed while an element with an `(animate.leave)="fn($event)"` listener is on the page (it calls `animationComplete()` at once). After each scenario the script adds and removes a callout twice. A "leak" means the `<style>` stays with no instance, for good.

| Unload mode | L1 | L2 | L3 | Private API |
| --- | --- | --- | --- | --- |
| `immediate` (destroy at 0, Angular's behaviour) | leak | leak | leak | no |
| `animations`: two frames, then wait until `document.getAnimations()` has no running animation with a finite end, then a task | pass | pass | leak | no |
| `private`: poll `ɵallLeavingAnimations.size === 0` every 16 ms | pass | pass | pass (removal waits until the listener element has left) | **yes**, `ɵallLeavingAnimations` from `@angular/core` |
| `repair`: `animations`, then, if Angular left the family's `<style>`, remove it with `element.remove()` and append it again on the next load | pass | pass | pass | no, but it changes nodes Angular owns |

`NG/` below is `d:/projects/github/angular/angular` at 22.2.x, commit `5db6fc4`, as in the research.

Same results in all engines. During L1 the leaving callout stays styled (44px) until its parent has left, in every mode.

- Why L3 defeats the public wait: `ɵɵanimateLeaveListener` adds its view to `allLeavingAnimations` when the template creates the element, not when it leaves (read from source, `NG/packages/core/src/render3/instructions/animation.ts:416`). So `NoneEncapsulationDomRenderer.destroy()` skips `removeStyles` (`NG/packages/platform-browser/src/dom/dom_renderer.ts:683`) for as long as such an element exists, and the DOM shows no animation to wait for. Measured: under `private`, the count stayed at 1 while the listener element was present and dropped to 0 once it left.
- `repair` relies on how `SharedStylesHost` behaves internally: after a skipped `removeStyles`, its record keeps a count of 1 and a reference to the element, so the next carrier only increments the count and inserts nothing. Angular's count then stays one above the library's for each skipped removal. The prototype measured two add/remove cycles after each scenario, styled each time (44px) and removed each time. It did not measure longer runs, or a later Angular release that changes the record.

### Measurement 5: what the consumer writes

Counted as non-blank lines without comments and without the prototype-only `$nfs-layers` switch, for four families:

| File | New or edited | Lines |
| --- | --- | --- |
| `nfs-families/<family>.scss` (per family) | new | 5 (`@import 'settings';`, `@import 'foundation-sites/scss/foundation';`, `@layer nfs.<family> {`, `@include foundation-<family>;`, `}`) |
| `nfs-families/<family>.ts` (per family) | new | 9 (one hidden `None` component with a `styleUrl`) |
| `nfs-families/carriers.ts` | new | 3 + one per family |
| `styles.scss` | edited | +1 order statement, +4 to wrap global styles and forms in their layers; each family's `@include` leaves the global stylesheet |
| `app.config.ts` | edited | +3 (two imports, `provideNfsFamilyStyles(carriers)`) |
| `project.json` | edited | +3 (`stylePreprocessorOptions.includePaths` for the settings directory) |

Total: 9 new files and 63 lines, plus 11 lines in 3 existing files. Each further family adds 2 files and 15 lines. Lazy chunks need one module per family. The eager variant can put every carrier in one file but needs one `import` line per family in the map.

## Verdict

- Consumer-compiled per-family carriers, counted per family by the library, carry the consumer's settings and load and unload with their directives. In every engine, under SSR and full or incremental hydration, they show no flash, no duplicate, and no style mutation at hydration (measurements 1, 2, 3a, 3b, 7).
- Angular's own count has both gaps the research found, and the prototype reproduced them in all three engines: removal skipped during any leave animation, and dehydrated instances not counted. A library-side count fixes the dehydrated gap with public API only. The leave-animation gap is closed fully only by waiting on the private `ɵallLeavingAnimations`, or by the `repair` mode, which changes Angular-owned `<style>` nodes. The public animation wait leaves one case, an `(animate.leave)` listener anywhere on the page (measurement 6).
- One `@layer` order statement at the top of the global stylesheet keeps Foundation's order whatever the insertion order. It survives `@angular/ssr`'s critical-CSS inlining in first position. Foundation's global styles and forms must sit in the first layers, and there they match Foundation's own cascade with 0 differences (measurements 4, 8, 9).
- Lazy carriers flash on a client-only first render while their chunk loads (1 frame locally in Firefox, about 19 frames at 300 ms latency). Eager carriers do not, at a cost of about 4.4 kB transfer for four families (measurement 3c).
- Per-family carriers use about 1.8 KB less heap per instance than per-instance carriers in Chromium. The time difference is small and not consistent (measurement 10).

## What this prototype does not prove

- Families beyond Button, Callout, Menu, and Dropdown Menu, and markup beyond the `/ssr` page (button, callout, menu, dropdown menu, text input, select, label) for measurement 9. Typography and the later-milestone families were not tried.
- A server-held instance whose element leaves the DOM without hydrating is pruned only at the next release of its family. No `MutationObserver` was added, and no case was found where Angular removes dehydrated DOM: the measured `@if` case left it in place.
- Cold network for eager carriers (they ride in `main.js`), mixed eager and lazy maps, and prefetching a lazy carrier before a `@defer` block renders.
- Prerendering (`RenderMode.Prerender`), client-side route navigation between pages that share families, zone.js applications, CSP nonces on the carrier `<style>` elements, and the Variant declaration generator reading `:root` properties from families that left the global stylesheet.
- Whether `repair` stays correct over many cycles, or under a later Angular version.
- The `animations` wait treats any finite running animation in the document as a possible leave animation, so a page that always runs finite animations delays every unload. It never leaked in the measured cases. Infinite animations are ignored.
