# Prototype: Reveal `'auto'` offsets in CSS

Ticket: [Prototype: Reveal `'auto'` offsets in CSS](../../issues/69-prototype-reveal-auto-offsets.md). Spec under test: [Spec: Reveal](../../issues/18-spec-reveal.md), `specs/reveal.md`, Sass rules 4 and 7.

Throwaway code. It answers one question and is not a design for the Reveal directive.

## Question

Does rule 7 of the `nfs-reveal` mixin (`.reveal[open]:not(.full) { top: var(--nfs-reveal-top, 25%); translate: 0 var(--nfs-reveal-shift, -25%); margin-left: var(--nfs-reveal-left, auto) }` at medium and up), together with rule 4 (`max-height: calc(100% - 2 * var(--nfs-reveal-top, min(100px, 10%)))`), place a top-layer `dialog.reveal` within 1 px of where Foundation 6.9's JavaScript (`Reveal._updatePosition`) places its modal? The ticket's six cases: (1) default, `.tiny`, `.small`, `.large`, `.without-overlay` at 640 x 800, 1024 x 800, 1440 x 900; (2) the same under `dir="rtl"`, on a scrolled page, and with nested modals; (3) numeric `vOffset`/`hOffset` through the custom properties; (4) text stays crisp at fractional offsets; (5) `nfs-*` keyframes that animate `transform` compose with the `translate` property; (6) `.full` and full screen below medium are unaffected. Added here: (7) content taller than rule 4's cap, where rules 4 and 7 act together, plus the two measured ports as fallbacks.

## What is here

The decisive files only. The runnable workspace, with `node_modules` and build output, is `D:/tmp/nfs-proto-reveal-offsets/app` (a copy of the Reveal dialog prototype's workspace, `D:/tmp/nfs-proto-reveal-dialog/app`, which was not modified).

- `package.json` -- the plain Angular CLI 22.2.0 `--ssr` application of the Reveal dialog prototype, unchanged: Angular 22.2.0, TypeScript 6.0.3, `@angular/cdk` 22.2.0, `foundation-sites` 6.9.0, `@playwright/test` 1.63.0; `vitest` pinned back to 4.1.11 there (never run). Installed with `npm ci`, nothing new pulled in.
- `src/_nfs-reveal.scss` -- rules 1 to 7 of the spec's `nfs-reveal` mixin, verbatim, plus four transform keyframe classes for case 5 (`nfs-slide-in-down`, `nfs-spin-in`, `nfs-hinge-in-from-top`, `nfs-scale-in-up`, Motion UI's start and end transforms, fill mode `both`).
- `src/styles.scss` -- Foundation 6.9 Sass through Angular's Sass pipeline (`foundation-global-styles`, `foundation-close-button`, `foundation-reveal`), then `nfs-reveal`; below the "Fixture only" comment, test scaffolding.
- `src/app/offsets.ts` -- one server-rendered page configured by query parameters (`size`, `content`, `v`, `h`, `overlay`, `nested`, `long`):
  - `#css` (and `#css2` for nested): the `dialog.reveal` under test, opened with `showModal()` (or `show()` for `overlay=0`), numeric offsets bound by a throwaway `nfsRevealOffsets` directive as the spec's three custom properties;
  - `#ref` (and `#ref2`): Foundation's own DOM (`.reveal-overlay > .reveal`, or `.reveal.without-overlay` when there is no overlay or the size is `.full`), shown and placed by a line-by-line port of `_updatePosition` (`js/foundation.reveal.js:108-140`, `parseInt` truncation included) inside the port of `open()` (measure first, then `_disableScroll` and `_addGlobalClasses`);
  - `window.__nfs`: `open({mode, dir, scrollY})`, `measure()`, `refResize()` (Foundation's `resizeme`), `addContent(px)`, `setIntegerTop(px)`, `motion(cls)`. `mode` selects rule 7 (`css`), the spec's named fallback as written (`port-offset`: `offsetHeight`, inline `top`, no translate), or a port that reads the natural height (`port-natural`: `scrollHeight` plus borders, written as `--nfs-reveal-top` and `--nfs-reveal-shift: 0px`).
- `src/app/app.routes.ts`, `src/app/app.config.ts` -- one route, `withComponentInputBinding()`, `provideClientHydration()`; every route is `RenderMode.Server`.
- `e2e/offsets.spec.ts` -- 14 Playwright tests per engine (case 4 runs at device pixel ratios 1, 1.5 and 2). Each logs one line per measurement and asserts with `expect.soft`, so a run records every number.
- `playwright.config.ts` -- chromium, firefox, webkit projects against the SSR server on port 4681.
- `results.log` -- the per-case summary and the observation lines of the final run.
- `captures/` -- case 4 crops (400 x 110 CSS px of the dialog's heading and lead) at y = 137.5, for each engine and device pixel ratio 1, 1.5 and 2: `*-rule7.png` (rule 7, fractional offset) and `*-integer-top-137.png` (same dialog, inline `top: 137px`, no translate).

## How to run

```
cd D:/tmp/nfs-proto-reveal-offsets/app
npx ng build
PORT=4681 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs
# second shell:
npx playwright test               # or --project=chromium / firefox / webkit, or -g "case 4"
```

`D:/tmp/nfs-proto-reveal-offsets/restart.sh` rebuilds and restarts the server; `summarize.mjs` there turns a run log into the summary at the top of `results.log`. WebKit runs on this Windows arm64 machine through Playwright 1.63's own build.

## Verdict

Rule 7 is confirmed for all six cases in Chromium, Firefox and WebKit. The CSS dialog lands on Foundation's JavaScript position in all 102 geometry comparisons per engine (306 in all): default, `.tiny`, `.small`, `.large` and `.without-overlay` at the three viewports, the same in RTL, on a page scrolled to 1000 px, nested modals (also RTL and scrolled), numeric offsets, and `.full` and full screen below medium. `x`, width and height match exactly. `y` is at most 0.78 px off, and that difference is Foundation's own `parseInt` truncation of `(vh - h) / 4`. Text at fractional offsets is as crisp as at an integer `top` at device pixel ratios 1, 1.5 and 2: every text row of the rule-7 crop equals a row of the integer-top crop shifted by whole device pixels, and a 0.5 px blur control is caught. Transform keyframes compose with `translate`: the end frame, the rest position and a plain open are the same box, and `translate` keeps rule 7's value throughout. The browser also re-places the dialog on resize (matching Foundation's `resizeme`) and on content change (Foundation does not).

Rule 4's stated intent does not hold, though. The spec says a tall dialog keeps Foundation's tall-modal offset at the top. Combined with rule 7, a dialog whose natural height is above rule 4's cap (`vh - 2m`, with `m = min(100px, 10vh)`) is capped to `vh - 2m` and then placed by the same quarter rule. It sits at `m / 2` from the top (40 px at 800, 45 px at 900) with `1.5 m` below. Foundation puts it at `(vh - h) / 4` while it fits the viewport, or at `m` when it is taller. The error is up to 38 px at 1024 x 800 (natural height 790), and `-40` / `-45` px for anything taller than the viewport, identical in all three engines. The spec's named fallback as written (read `offsetHeight`, write inline `top`) measures the capped box and gives exactly the same numbers, so it is not a fix. Only a port that reads the natural height and writes `--nfs-reveal-top` / `--nfs-reveal-shift` matches Foundation's top in every case (0 px in all three engines); its box then equals Foundation's whenever the natural height fits the viewport, and is capped at `m .. vh - m` above that. Under the triage rule the decision is to keep rules 4 and 7 and correct the spec's text (details in the ticket answer).

## Results (Chromium / Firefox / WebKit, identical unless noted)

| Case | Result | Evidence (`results.log`) |
| --- | --- | --- |
| 1. Sizes and `.without-overlay` at 640x800, 1024x800, 1440x900 | Pass, 15/15 per engine | e.g. 1024 default `css=212,148.78,600,204.88 ref=212,148,600,204.88`; max `|dy|` 0.78 (WebKit 0.75), every other delta 0 |
| 2. RTL | Pass, 15/15 | same numbers as LTR |
| 2. Scrolled page (1000 px) | Pass, 15/15; `html` gets `is-reveal-open zf-has-scroll`, `top: -1000px` | `case2-scrolled` lines |
| 2. Nested (outer default, inner `.tiny`), LTR, and RTL on a scrolled page | Pass, 12/12 (outer and inner) | `case2-nested` lines |
| 3. Numeric `vOffset`/`hOffset` (50/auto, auto/20, 50/20, 0/0, 120/300) on default, `.tiny`, `.without-overlay` at 1024 and 1440 | Pass, 30/30 | `d` 0 except Foundation's truncation of the `auto` axis |
| 3. RTL with a numeric `hOffset` | Rule gives `x = hOffset` in both directions (as the spec says); Foundation's overlay case gives `vw - w + hOffset` (444 at 1024 with 20), because it writes `left` on a `position: relative` box; `.without-overlay` agrees (x = 20) | `case3-rtl` lines |
| 4. Text crispness, y = n.25, n.5, n.75, device pixel ratio 1, 1.5, 2 | Crisp in all 27 checks: every text row of the rule-7 crop equals a row of the integer-top crop shifted 0 to 2 device pixels; anti-aliasing pixel counts identical; the blur control matches 0 rows | `case4` lines, `captures/` |
| 5. `nfs-slide-in-down`, `nfs-spin-in`, `nfs-hinge-in-from-top`, `nfs-scale-in-up` | Pass: `animationend` fires, end frame = rest = plain open = reference within 1 px; `translate` stays `0px -25%` from the first frame; slide-in-down's first frame is rest minus the dialog's height | `case5` lines |
| 6. `.full` at medium and up, and every size below medium (320, 639) | Pass: `0,0,vw,vh` equal to Foundation, rule 4's `max-height` loses to Foundation's `min-height: 100%` | `case6` lines |
| 6. Numeric offsets below medium and on `.full` | The spec keeps the box full screen (`0,0,320,800`); Foundation's JavaScript still writes `top: 50px; left: 20px` there (`20,50,320,800`), a documented delta | `case6-numeric` lines |
| 7. Natural height 400, 600 (both viewports), 700 (1440x900) | Pass: same box | `case7` lines |
| 7. Natural height 700 and 790 at 1024x800, 790 at 1440x900 (above the cap, inside the viewport) | Fail: capped to 640 / 720 at `y = 40` / `45`; Foundation `y = 25`, `2`, `27` with the full box (`dy` 15, 38, 18) | `case7 ... mode=css ... position=FAIL` |
| 7. Natural height 1000 and 1600 (taller than the viewport) | Fail: `y = 40` / `45`; Foundation `y = 80` / `90` (`dy` -40, -45) | same |
| 7. `port-offset` (the spec's fallback as written) | Same numbers as rule 7 in every row | `mode=port-offset` lines |
| 7. `port-natural` | `dy = 0` in every row; box equal to Foundation's up to the viewport height, capped at `m .. vh - m` above | `mode=port-natural` lines |
| Resize 1024x800 to 1440x900 while open | Pass against Foundation's `resizeme` re-run | `extra-resize` |
| Content +120 px while open | Rule 7 re-places at `(vh - h) / 4` (143.78); Foundation stays at 173 | `extra-content` |
| Server HTML | `style="--nfs-reveal-top: 50px; --nfs-reveal-shift: 0px; --nfs-reveal-left: 20px;"` for `v=50&h=20`; no `style` for `auto` | `extra-ssr` |

Exact error text of the failing assertion (case 7, rule 7, Chromium; Firefox and WebKit have the same values up to 0.02 px):

```
Error: css natural=790 {"dx":0,"dy":38,"dw":0,"dh":-149.98}
expect(received).toBe(expected) // Object.is equality
Expected: true
Received: false
```

Failures during development, all fixture problems and fixed: the router binds `undefined` for a missing query parameter (`class="reveal undefined"` on the server) until the inputs got a fallback transform; Playwright's WebKit build has no `OffscreenCanvas` (`ReferenceError: Can't find variable: OffscreenCanvas`), so the pixel comparison uses a canvas element; the first crispness metric (exact equality with the floor or ceiling render) reported false differences because each text line snaps to the pixel grid on its own, so it was replaced by the row-shift check with a blur control.

Workspace: `D:/tmp/nfs-proto-reveal-offsets/app`, with `restart.sh`, `summarize.mjs`, `run*.log` and `captures/` one level up.
