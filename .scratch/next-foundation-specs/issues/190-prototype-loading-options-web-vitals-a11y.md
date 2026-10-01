# 190. Prototype: Core Web Vitals, accessibility, and responsiveness of the style loading options

Type: prototype
Status: resolved
Blocked by: 184
Labels: wayfinder:prototype
Map: ../map.md

## Question

When do family styles download, and how does each choice affect Core Web Vitals, accessibility, and responsiveness? The options:

- A: always a separate chunk on first use;
- B: bundled in `main.js`;
- C: a chunk by default, with an `eager` opt-in per family;
- D: a chunk prefetched when the browser is idle after hydration, in the spirit of `injectAsync`'s `prefetch: onIdle`.

Does D shrink the flash window to families used before idle? And how does the `<link>` loader of [Prototype: a `<link>` family style loader with no consumer code](189-prototype-link-loader-no-consumer-code.md) compare, once that prototype resolves?

## User instruction, 2026-10-01

The user wrote, verbatim:

> 1. Measure the unmeasured variant: download chunks at idle after hydration, as `injectAsync`'s `prefetch: onIdle` does. Verify whether it shrinks the flash window to "used before idle".
> 2. Which option would give the best Core Web Vitals score?
> 3. Which option is the most accessible?
> 4. Which option is the most *responsive*?

The orchestrator reads "responsive" as responsiveness to input (INP, and the time from an interaction to a styled paint). Responsive design is not affected by the loading option, because each family's media queries travel with its CSS. The Answer says so and measures the first reading.

## How to work it

Work in a copy of the 184 workspace (`D:/tmp/nfs-proto-lazy-family-styles`) at `D:/tmp/nfs-proto-190`, against production SSR builds. Use the same families as 184, and add one whose first use comes from an interaction (a pane or submenu opened by a click), because that is where a late family hurts INP.

Scenarios:

1. A server-rendered landing page.
2. A client-side route navigation to a page with families the first page did not use.
3. A client-only `@defer` block (`on viewport`, `on interaction`).
4. A first interaction that inserts content of a new family.
5. A family used before idle and one used after.

Network and CPU profiles: unthrottled, Slow 4G with 4x CPU slowdown, and a 300 ms chunk delay as in 184.

Measure:

- Core Web Vitals and their parts: LCP, CLS, INP with `web-vitals` attribution, FCP, TBT, and the Lighthouse mobile performance score. Use Chromium for Lighthouse, and Firefox and WebKit where the metric exists.
- Unstyled frames, and the time from interaction to styled paint.
- Accessibility during the flash: snapshot the accessibility tree and run axe while the family CSS is missing. The point is whether content that Foundation's CSS hides, such as a closed submenu or a `.show-for-sr` neighbour, is exposed or announced, and whether focus indicators, target sizes, or layout positions differ. Also check `prefers-reduced-motion`.
- Download and parse cost per option.

Capture the decisive files and a README under `prototypes/style-loading-options/`. Append an `## Answer` with one table per question, the best option for each question, and where the options trade off. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.

## Answer

Resolved 2026-10-01 (Opus 5.5). Prototype: [prototypes/style-loading-options/README.md](../prototypes/style-loading-options/README.md).

The workspace is a copy of 184's at `D:/tmp/nfs-proto-190`: Nx 23.2.1 and Angular 22.2.0, production SSR builds with gzip, measured in Chromium 153, Firefox 155, and WebKit 26.6. It uses 184's families plus **Dropdown** (a pane opened by a click). Eight options were measured:

- A, B, C, and D from this ticket. C opts the Dropdown family in to `eager`. D imports every carrier chunk after `afterNextRender`, `whenStable()`, and `onIdle()`.
- E: 188's owned `<style>`.
- L: 189's `<link>` loader as built, with `data-beasties-skip`.
- LP: L plus 189's `index.html` preloads, both at the orchestrator's request.
- S: 192's proposal A, also at the orchestrator's request. Each directive module statically imports its family CSS through the esbuild plugin (Nx `plugins`), and routes are lazy as in 192's probe. It built on the first attempt.

The scenarios were run in three profiles:

- Scenarios: server-rendered landing; route navigation; client-only `@defer` on interaction and on viewport; a click that opens the pane; one family before idle and one after. Each was triggered right after hydration ("early") and after the network went quiet ("late").
- Profiles: unthrottled; 300 ms on every family style file (server-side); Slow 4G with 4x CPU (Chromium only, through CDP).
- 5 runs per cell, 2,800 web-vitals runs with no failure. Lighthouse 13.5.0 mobile ran 5 times per option and throttling method. The accessibility checks ran 3 times per engine with the family CSS held.

Firefox and WebKit have LCP, FCP, and INP but no CLS or long tasks; WebKit has no `requestIdleCallback` (Angular falls back to `setTimeout`). Nothing is decided here; [185](185-decide-lazy-family-styles.md) chooses.

**1. Does D shrink the flash window to "used before idle"?** Yes to "used before its prefetch is done", and that window is longer than "before idle".

| | Unthrottled | 300 ms | Slow 4G |
| --- | --- | --- | --- |
| D's window on `/` (hydrated to prefetch done) | 21-50 ms | 532-616 ms | 1,066 ms |
| Unstyled frames, first use inside the window (D / A) | none fell inside | S2 19 / 20, S4 19 / 19, S5 19 / 20 (Chromium; Firefox and WebKit alike) | S2 35 / 35, S4 37 / 36 |
| Unstyled frames, first use after it | 0 | 0 in every scenario and engine | 0 |

- **What the window contains.** Stability waits for the server-rendered families' own chunks: +290 ms at 300 ms and +430 ms on Slow 4G. Then the idle callback (1-23 ms after stability), then one round trip.
- **When the flash is shorter.** Only when the prefetch request has already started: `@defer (on interaction)` early gave 15/13/8 frames against A's 18/19/21, and 0 on Slow 4G.
- **The cost.** Every family chunk is fetched on every load: 5 requests, 4.4 kB gzip here.

**2. Best Core Web Vitals: S, with B next to it.** Neither changes LCP or adds CLS from family loading in any scenario or profile, and neither affects INP. Only Lighthouse's simulated estimate (Lantern) puts B's FCP and LCP about 150 ms later; with throttling applied, and in the Playwright Slow 4G runs, B equals A. No Lighthouse score separates any two options. D equals S and B once its window has closed.

| Metric | B, S | D | A, C (non-opted), E, L | LP |
| --- | --- | --- | --- | --- |
| LCP, landing, 300 ms (Chromium / Firefox / WebKit) | 60-64 / 67-73 / 232-349 ms | 60 / 72 / 338 ms | A, C, E as B; **L 420 / 443 / 682 ms** | **428 / 452 / 654 ms** |
| LCP, landing, Slow 4G | 756-776 ms | 784 ms | A, C, E 768-800 ms; **L 1,340 ms** | **1,356 ms** |
| CLS from a late family (Chromium) | 0.000 everywhere | 0.000 after its window; as A before | `on viewport` 0.006-0.030; on Slow 4G also clicks and navigation, 0.020-0.178 | 0.000, except `on viewport` before the preload (0.006) |
| INP | no difference between options | | | |
| Lighthouse mobile score, simulate (median of 5; every pair of spreads overlaps, 83-98) | B 89, S 93 | 94 | A 91, C 90, E 93, L 93 | 91 |
| Lighthouse LCP, simulate / devtools | B 1,604 / 1,008 ms, S 1,458 / 1,035 ms | 1,443 / 1,023 ms | A 1,457 / 1,004 ms; L 1,621 / 1,569 ms | 1,656 / 1,563 ms |

- **CLS is hidden while the network is fast.** A shift within 500 ms of an input does not count, so click-driven flashes count towards CLS only when the CSS arrives later than that (Slow 4G). A scroll-triggered block always counts.
- **L and LP pay LCP.** `data-beasties-skip` makes their server-rendered family links render-blocking.
- **B pays in the initial JavaScript:** +4.9 kB gzip for five families, with a ceiling of 17.6 kB for all of Foundation.
- **S's lazy routes put its page and family chunks in front of hydration:** 3.2 s against 2.0-2.1 s on Slow 4G, and 431 against 105-113 ms at 300 ms. No vital counts that.

**3. Most accessible: the options that never flash.** These are B and S in every scenario; LP except a `@defer` block used before its preloads arrive (6-12 frames); C for opted-in families; and D after its window. With the family CSS missing (same in all three engines, 3 of 3 runs):

| Check | During the flash | Styled |
| --- | --- | --- |
| Content Foundation hides (closed submenu, closed pane) | in the accessibility tree: 3 items on `/menus`, 1 in the deferred menu | hidden |
| Tab order (Chromium, Firefox; WebKit's Tab skips links) | 3 extra stops on `/menus`, 1 in the deferred menu | none |
| axe-core 4.13.0 | 0 violations | 0 violations |
| Targets under 24 px | menu links and buttons 16-17 px tall (8 on `/menus`, 5 in the deferred block) | 1 and 0 |
| Focus indicator | browser default | browser default (unchanged) |
| Layout when the CSS arrives | moves 79-110 px | |
| `prefers-reduced-motion: reduce` | Foundation's 0.25 s button `background-color`/`color` transition still runs as the CSS arrives (the family CSS has no reduced-motion query) | no transition from loading |

axe-core finds none of this; the tree snapshot, the Tab walk, and geometry do.

**4. Most responsive (INP, and interaction to styled paint): B.** INP does not separate the options: 16-32 ms in Chromium at 300 ms, and 48-80 ms for clicks on Slow 4G. It ends at the next paint, which comes before a late family's CSS. The differences are in the time to a styled paint:

| Trigger to styled frame, Chromium | B | LP / D, after preload or prefetch | S | A, C (non-opted), E, L; D before its window |
| --- | --- | --- | --- | --- |
| Click inserting a pane, early, 300 ms / Slow 4G | 18 / 48 ms | 16 / 44 ms; 22 / 63 ms (late) | 16 / 43 ms | 329-332 / 639-661 ms (C is opted in here: 18 / 46 ms) |
| Route navigation to new families, early, 300 ms / Slow 4G | 21 / 108 ms | 20 / 99 ms; 19 / 114 ms (late) | 28 / 713 ms (lazy route chunk; no unstyled frame) | 330-348 / 692-727 ms |
| Client-only `@defer`, Slow 4G | 646-717 ms | 644-718 ms | 1,238-1,349 ms (two serial chunks, no unstyled frame) | 1,230-1,356 ms (block chunk, then the family) |

- **S's one INP difference.** S's navigation INP is lower (56 against 104-176 ms on Slow 4G), because the lazy route renders after the next paint.
- **Where the options trade off.** B leads everywhere, at the cost of initial JavaScript. LP and D match B only after their preload or prefetch arrives. S matches B within a page, but waits on a lazy route or a `@defer` block. Responsive design is not affected, because each family's media queries travel with its CSS.
