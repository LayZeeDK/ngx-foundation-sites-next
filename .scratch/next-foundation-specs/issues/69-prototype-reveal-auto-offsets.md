# 69. Prototype: Reveal `'auto'` offsets in CSS

Type: prototype
Status: resolved
Blocked by: 18
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Reveal](18-spec-reveal.md) answer. That spec replaces Foundation's JavaScript placement of a Reveal (`top = (viewport height - outer height) / 4`, horizontal centring, and numeric `vOffset`/`hOffset` written as `top`/`left` with zero margin) with CSS: rule 7 of the `nfs-reveal` mixin, `.reveal[open]:not(.full) { top: var(--nfs-reveal-top, 25%); translate: 0 var(--nfs-reveal-shift, -25%); margin-left: var(--nfs-reveal-left, auto) }` at medium and up, with rule 4 as `max-height: calc(100% - 2 * var(--nfs-reveal-top, min(100px, 10%)))`. Only running code can confirm it, in Chromium, Firefox, and WebKit:

1. A top-layer `dialog.reveal` lands within 1 px of Foundation 6.9's JavaScript position for the default size, `.tiny`, `.small`, `.large`, and `.without-overlay`, at 640 x 800, 1024 x 800, and 1440 x 900.
2. The same holds under `dir="rtl"`, on a scrolled page, and with nested modals.
3. Numeric `vOffset` and `hOffset` through the custom properties land where Foundation's inline `top`/`left` would.
4. Text inside the dialog stays crisp at fractional offsets (screenshot against the same dialog with an integer `top`).
5. `nfs-*` keyframes that animate `transform` compose with the `translate` property without moving the rest position.
6. `.full` and full screen below medium stay unaffected.

The spec assumes the rule as written. Fallback if a case fails: the measured port of Foundation's `_updatePosition` in the open render callback, with inline `top`, a `ResizeObserver` on the dialog, and a `window` `resize` listener while open; that changes only the Sass subsection and one render-callback step. If a case fails, the orchestrator reopens the Reveal spec with that fallback, otherwise the verdict is appended to its decision log.

Read first: `specs/reveal.md` (the Sass subsection with rules 4 and 7, the offsets decisions, and the rendering-modes subsection), `adr/0007-reveal-native-dialog.md`, `adr/0031-reveal-dismissal.md`, the Reveal dialog prototype's answer and `prototypes/reveal-dialog/README.md`, which already records Foundation's geometry, and `research/foundation-inventory-disclosure.md` (Reveal `_updatePosition`).

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: extend the Reveal dialog prototype's plain Angular CLI 22.2 `--ssr` workspace at `D:/tmp/nfs-proto-reveal-dialog/app` (Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0) or copy it to `D:/tmp/nfs-proto-reveal-offsets/`, and add the spec's rules 4 and 7. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test` in all three engines, measuring against a reference dialog positioned by a port of Foundation's `_updatePosition` in the same page.

Capture it: copy the decisive files into `prototypes/reveal-auto-offsets/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, engine, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Reveal spec (per case: confirmed, or the named fallback), and anything left `OPEN FOR HUMAN`.

## Answer

Prototype: [prototypes/reveal-auto-offsets/README.md](../prototypes/reveal-auto-offsets/README.md). Workspace: `D:/tmp/nfs-proto-reveal-offsets/app`, a copy of the Reveal dialog prototype's plain Angular CLI 22.2.0 `--ssr` application. Versions: Angular 22.2.0, TypeScript 6.0.3, `foundation-sites` 6.9.0 Sass through Angular's Sass pipeline, `@playwright/test` 1.63.0. `npm ci` from the copied lockfile pulled nothing new, and `vitest` stays pinned at 4.1.11 as in that workspace. It was driven in Chromium, Firefox and WebKit against the production build served by the SSR server on port 4681. The page holds the `dialog.reveal` under test, placed only by the spec's rules 1 to 7, and Foundation's own DOM (`.reveal-overlay > .reveal`, or `.reveal.without-overlay`) as the reference. The reference is shown and placed by a line-by-line port of `Reveal._updatePosition` (`js/foundation.reveal.js:108-140`, `parseInt` truncation included) inside the port of `open()`. Bounding rectangles are compared with a 1 px tolerance. The final run passed 33 of 36 (12 tests times 3 engines), and the 3 failures are case 7 below. A re-run of case 4 with device pixel ratio 1.5 added passed 9 of 9.

### Verdict

Rule 7 is confirmed for all six cases in all three engines. In 102 geometry comparisons per engine (306 in all), the CSS-placed dialog has Foundation's `x`, width and height exactly, and its `y` is at most 0.78 px off, which is Foundation's own `parseInt` truncation of `(vh - h) / 4`. The comparisons cover the default size, `.tiny`, `.small`, `.large` and `.without-overlay` at 640 x 800, 1024 x 800 and 1440 x 900; the same under RTL; on a page scrolled to 1000 px; nested modals; numeric `vOffset`/`hOffset`; and `.full` plus full screen below medium. Text at fractional offsets is exactly as crisp as at an integer `top` at device pixel ratios 1, 1.5 and 2. Transform keyframes compose with the `translate` property without moving the rest position. Rule 4 is a different matter: combined with rule 7, it does not give tall dialogs the placement the spec describes. A dialog whose natural height exceeds rule 4's cap, `vh - 2m` with `m = min(100px, 10vh)`, is capped and then placed by the same quarter rule. It lands at `m / 2` from the top (40 px at 800 px high, 45 px at 900) with `1.5 m` below. Foundation places it at `(vh - h) / 4` while it fits the viewport (up to 38 px higher in the measured rows) and at `m` when it is taller (40 or 45 px lower). The spec's named fallback as written (read `offsetHeight`, write inline `top`) measures the capped box and reproduces exactly those numbers, so it is no remedy. Only a port that reads the natural height (`scrollHeight` plus borders) and writes `--nfs-reveal-top` with a zero `--nfs-reveal-shift` matches Foundation's top in every measured row. Triage decides to keep rules 4 and 7 unchanged and to correct the spec's text for tall dialogs and for the fallback.

### Results

| Case | Engine | Result | Evidence (`prototypes/reveal-auto-offsets/results.log`) |
| --- | --- | --- | --- |
| 1. Default, `.tiny`, `.small`, `.large`, `.without-overlay` at 640x800, 1024x800, 1440x900 | Chromium, Firefox, WebKit | Pass, 15/15 each | 1024 default: `css=212,148.78,600,204.88 ref=212,148,600,204.88`; max `|dy|` 0.78 (WebKit 0.75), all other deltas 0 |
| 2. The same under `dir="rtl"` | all three | Pass, 15/15 each | identical numbers to LTR |
| 2. The same on a page scrolled to 1000 px | all three | Pass, 15/15 each | `html` carries `zf-has-scroll is-reveal-open` and `top: -1000px`; same boxes |
| 2. Nested modals (outer default, inner `.tiny`), LTR and RTL-scrolled, at the three viewports | all three | Pass, 12/12 each (outer and inner) | `case2-nested` lines |
| 3. Numeric offsets (`v`/`h` = 50/auto, auto/20, 50/20, 0/0, 120/300) on default, `.tiny`, `.without-overlay` at 1024x800 and 1440x900 | all three | Pass, 30/30 each | numeric axes exact; the `auto` axis differs only by Foundation's truncation |
| 3. RTL with a numeric `hOffset` (20) | all three | The rule puts the box 20 px from the left in both directions, as the spec says; Foundation's overlay case gives `x = 444` (`vw - w + hOffset`, because it writes `left` on a `position: relative` box in RTL); Foundation's `.without-overlay` agrees with the rule (`x = 20`) | `case3-rtl` lines |
| 4. Text at `y` = n.25, n.5, n.75, device pixel ratio 1, 1.5, 2 | all three | Crisp, 27/27: every text row of the rule-7 crop equals a row of the integer-`top` crop shifted by 0 to 2 whole device pixels, with identical anti-aliasing pixel counts; the 0.5 px blur control matches 0 rows in every run. A fractional inline `top` without translate snaps the same way | `case4` lines; `captures/case4-*-y137_5-rule7.png` against `*-integer-top-137.png` |
| 5. `nfs-slide-in-down`, `nfs-spin-in`, `nfs-hinge-in-from-top`, `nfs-scale-in-up` at 1024x800 and 1440x900 | all three | Pass, 8/8 each: `animationend` fires; end frame, rest after the class is removed, and a plain open are the same box, equal to Foundation's; computed `translate` stays `0px -25%` in the first and middle frames; slide-in-down's first frame is the rest position minus the dialog's height (the two translations add) | `case5` lines |
| 6. `.full` at 640, 1024, 1440, and every size plus `.full` below medium (320x800, 639x800) | all three | Pass, 15/15 each: `0,0,vw,vh` like Foundation; rule 4's `max-height` loses to Foundation's `min-height: 100%` | `case6` lines |
| 6. Numeric `v=50 h=20` below medium and on `.full` | all three | The spec keeps full screen (`0,0,320,800`); Foundation's JavaScript still writes the inline `top`/`left` there (`20,50,320,800`), the delta the spec already lists | `case6-numeric` lines |
| 7 (added). Natural height 400, 600, and 700 at 1440x900 (under the cap) | all three | Pass: same box | `case7 ... mode=css ... box=SAME` |
| 7. Natural height above the cap but inside the viewport (700 and 790 at 1024x800, 790 at 1440x900) | all three | Fail: rule 7 gives `y = 40` / `45` with the box capped to 640 / 720; Foundation `y = 25`, `2`, `27` with the whole box (`dy` 15, 38, 18) | `case7 ... mode=css ... position=FAIL` |
| 7. Natural height taller than the viewport (1000, 1600) | all three | Fail: rule 7 `y = 40` / `45`; Foundation `y = 80` / `90` (`dy` -40, -45) | same |
| 7. The spec's fallback as written (`port-offset`) | all three | Same numbers as rule 7 in every row | `mode=port-offset` lines |
| 7. Natural-height port (`port-natural`) | all three | `dy = 0` in every row; box equal to Foundation's while the content fits the viewport, capped at `m .. vh - m` above | `mode=port-natural` lines |
| Resize 1024x800 to 1440x900 while open | all three | Pass against a re-run of Foundation's `resizeme` | `extra-resize` |
| Content grows by 120 px while open | all three | Rule 7 re-places at `(vh - h) / 4` (y 173.78 to 143.78); Foundation does not re-place (173) | `extra-content` |
| Server HTML | all three | `v=50&h=20` renders `style="--nfs-reveal-top: 50px; --nfs-reveal-shift: 0px; --nfs-reveal-left: 20px;"`; `auto` renders no `style` | `extra-ssr` |

Exact error text of the failing assertion (Chromium; Firefox and WebKit report the same values within 0.02 px), one of seven soft failures per engine:

```
Error: css natural=790 {"dx":0,"dy":38,"dw":0,"dh":-149.98}
expect(received).toBe(expected) // Object.is equality
Expected: true
Received: false
```

Fixture failures during development, all fixed: the router binds `undefined` for an absent query parameter (the server rendered `class="reveal undefined"`) until the inputs got a fallback transform; Playwright's WebKit build lacks `OffscreenCanvas` (`ReferenceError: Can't find variable: OffscreenCanvas`); the first crispness metric (exact equality with the floor or ceiling render) reported differences that were only text lines snapping to different whole pixels, so it was replaced by the row-shift check with a blur control.

### What the prototype does not prove

- The reference is a port of `_updatePosition` and `open()`, not Foundation's jQuery code running. jQuery's `outerWidth()`/`outerHeight()` are taken as the border-box size and `$(window).width()`/`height()` as `documentElement.clientWidth`/`clientHeight`, which is what jQuery 3 returns for these elements.
- Scrollbars: headless reports `clientWidth` equal to `innerWidth` in every engine, even with `zf-has-scroll`, so a page scrollbar and the Foundation overlay's own scrollbar (which shifts Foundation's centring for tall content) are not measured.
- Crispness was judged on headless grayscale anti-aliasing at device pixel ratios 1, 1.5 and 2. LCD subpixel text in headed browsers, real Safari on macOS or iOS, and other fractional ratios (1.25) were not run.
- Mobile dynamic viewports (`100%` against a collapsing URL bar) and browser zoom beyond the tested device pixel ratios.
- Numeric `vOffset` with tall content: by the rules, the box runs from `vOffset` to `vh - vOffset` with Foundation's top, but no row measured it.
- The natural-height port was measured once after opening. Its update path was not built: a `ResizeObserver` on a capped host does not fire when content grows inside it. That is expected from the observer's definition and was not measured.
- The directive is a throwaway that only binds the three custom properties. Nothing here tests the real `NfsReveal`.

### Decision handed to the Reveal spec

- **Case 1:** confirmed. Rule 7 reproduces Foundation's `'auto'` placement for every size and `.without-overlay` at medium and up.
- **Case 2:** confirmed for RTL, a scrolled page with the Scroll lock, and nested modals.
- **Case 3:** confirmed. Numeric offsets through `--nfs-reveal-top`, `--nfs-reveal-shift: 0px` and `--nfs-reveal-left` land where Foundation's inline `top`/`left` would. Under RTL a numeric `hOffset` is measured from the left edge, as the spec already says. Foundation's overlay case differs there (`vw - width + hOffset`); add it to "Foundation behaviour changed or dropped".
- **Case 4:** confirmed. No crispness mitigation is needed.
- **Case 5:** confirmed. `nfs-*` keyframes may animate `transform` freely. They must not animate the `translate` property, which rule 7 owns. The set in building-blocks 1.6 rule 4 follows Motion UI, whose keyframes animate `transform`, so it complies.
- **Case 6:** confirmed. `:not(.full)` and the medium breakpoint leave full screen untouched. Numeric offsets are ignored there, where Foundation shifted the full-screen box, which is the delta the spec already documents.
- **Case 7 (rules 4 and 7 together):** keep both rules as written and correct the text. The orchestrator applies these changes (or a re-run does):
  - Rule 4's reason (Sass subsection and Further Notes table): the cap leaves twice Foundation's tall-modal offset (or twice a numeric `vOffset`). With `'auto'`, rule 7 places a capped dialog by the same quarter rule, `min(50px, 5vh)` from the top and three times that below it. Foundation used `min(100px, 10vh)` and let its overlay scroll, and placed a dialog between the cap and the viewport height at `(vh - h) / 4` without capping it.
  - Rule 7's reason and D10: "exactly that" holds while the dialog's natural height is at most `vh - 2 * min(100px, 10vh)`.
  - The Fallback paragraph under Implementation level: a measured port must read the natural height (`scrollHeight` plus the block borders), not `offsetHeight`, and write `--nfs-reveal-top` and `--nfs-reveal-shift: 0px` rather than inline `top`, so that rule 4 mirrors it. It must also observe the content, not only the host. Reading `offsetHeight` reproduces rule 7's capped placement exactly (measured).
  - Testing Decisions, Playwright geometry: a tall-content row expecting `y = min(50px, 5vh)` and height `vh - 2 * min(100px, 10vh)`, beside the `(vh - h) / 4` rows.
  - "Foundation behaviour changed or dropped": a dialog taller than the cap is capped and sits at half Foundation's tall-modal offset, and an `'auto'` dialog is re-placed when its content changes (Foundation re-placed only on resize).
- The named fallback is not triggered: none of the six cases failed.

### Triage

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Rule 7 for the six cases | HIGH (the default placement of every Reveal) | HIGH (306 comparisons, 27 crispness checks, 24 motion checks, three engines) | Decided: confirmed; no fallback |
| Tall dialogs: keep rules 4 and 7 (capped box at `m / 2`) or adopt the natural-height port (Foundation's top exactly) | MEDIUM (visible only for dialogs taller than `vh - 2m`, which already scroll themselves instead of Foundation's overlay; no public API changes; swapping one CSS rule for one render-callback step later touches no consumer code; no other spec inherits it) | MEDIUM (both options measured; the choice weighs Foundation fidelity for tall dialogs against the standing native-first preference and D10, which rejected layout reads for what CSS computes; CSS cannot reproduce Foundation's jump at `h = vh` without a step function that is outside the browser target) | Decided: keep rules 4 and 7; correct the spec text as listed; the natural-height port is recorded as the fallback if exact tall placement is ever required |
| The named fallback's height read | LOW (fallback text only) | HIGH (measured identical to rule 7 in every row) | Decided: the fallback reads the natural height and writes the custom properties |
| RTL numeric `hOffset` from the left edge | LOW (numeric `hOffset` under RTL only) | HIGH (measured; matches the spec text and Foundation's own `.without-overlay` result) | Decided: keep the spec's rule; list the delta |
| Numeric offsets ignored below medium and on `.full` | LOW | HIGH (measured; already a documented delta) | Decided: confirmed |
| Crispness on LCD subpixel text and real Safari | MEDIUM (blurry text would be visible; the fix would be the port, no API change) | MEDIUM (headless grayscale only, but all three engines snap text per line at every ratio tried, including 1.5) | Decided: no mitigation; a headed check is optional follow-up, not a gate |

### OPEN FOR HUMAN

None. No item is both HIGH impact and below HIGH confidence. The ticket has no upstream filing and no assistive-technology check, since it measures geometry only.

New ticket suggestion for the orchestrator: none is required. If spec edits have to go through a re-run ticket, a "Re-run: Reveal spec, tall-dialog placement and the fallback's height read" would carry the Case 7 text changes above.
