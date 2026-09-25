# Prototype: CSS `position: sticky` plus IntersectionObserver sentinels for Sticky

Ticket: [48. Prototype: CSS `position: sticky` with IntersectionObserver sentinels for Sticky](../../issues/48-prototype-sticky-css.md) (building-blocks.md P7).

## Question

Which Foundation Sticky behaviours can CSS `position: sticky` plus IntersectionObserver sentinels
honour: anchor ranges outside the containing block (`topAnchor`, `btmAnchor`), `stickTo: 'bottom'`,
em-based `marginTop`/`marginBottom`, the `stickyOn` breakpoint gate, the
`is-stuck`/`is-at-top`/`is-at-bottom`/`is-anchored` class contract, and an `overflow: hidden`
off-canvas wrapper? Which become documented limits?

## What is here

The decisive files only (a plain Angular CLI 22.2.0 `--ssr` application, chosen over a synthetic Nx
workspace because the question is about one directive's runtime behaviour in a real browser, not
about Nx project graph or build-target configuration; Nx would have added workspace ceremony with no benefit
to the question). The runnable workspace, including `node_modules`, the build output, and the
Playwright browser cache, stays at `D:/tmp/nfs-proto-sticky-css/app` and is not committed.

- `src/sticky/nfs-sticky.ts` -- the `[nfsSticky]` directive: `position: sticky`/`static` and the
  `top`/`bottom` offset from host bindings, plus two 1px sentinel elements (inserted at the
  container's own bounds in `afterNextRender`) driving the `.is-stuck`/`.is-at-top`/`.is-at-bottom`/
  `.is-anchored` classes and the `stuck`/`unstuck` outputs.
- `src/sticky/nfs-sticky-container.ts` -- the `[nfsStickyContainer]` directive: a class marker only
  (native sticky needs no JS-managed container height, unlike Foundation's plugin).
- `src/app.html` -- seven test cases side by side on one long page (mirroring Foundation's own docs
  layout): basic top-stick, `stickTo: 'bottom'`, em margins, the `stickyOn` gate, an `overflow: hidden`
  ancestor, and two `topAnchor`/`btmAnchor` cases (container sized to match the anchors; anchors far
  outside the container).
- `src/styles.scss` -- `@use 'foundation-sites/scss/components/sticky'` plus
  `@include sticky.foundation-sticky;` (Foundation's own `.sticky`/`.sticky-container`/`.is-stuck`/
  `.is-at-top`/`.is-at-bottom`/`.is-anchored` rules, untouched) and the one custom rule listed below.
- `e2e/sticky.spec.ts` -- Playwright tests for all seven cases, empirically derived (every threshold
  was measured in the running browser via `getBoundingClientRect`, not hand-calculated on paper first).
- `playwright.config.ts` -- three projects (chromium, firefox, webkit) against a static file server.

## Custom CSS beyond Foundation's own

Per the standing instruction to reuse Foundation's SCSS and restyle nothing it already styles, this
prototype adds exactly two things, neither of which restyles a Foundation-owned rule:

1. **`.sticky { position: sticky; }`** in `styles.scss`. Foundation's own `_sticky.scss` has no
   `position: sticky` rule at all (`scss/components/_sticky.scss`, confirmed by reading the file: it
   only has `.sticky { position: relative; ... }` for the default state and the JS-driven
   `.is-stuck`/`.is-anchored` rules). This is the one documented custom rule the building-blocks map
   (row 217) already calls for.
2. **Inline styles on the two sentinel `<span>` elements** the directive creates (`display: block;
   height: 1px; margin: 0; padding: 0; pointer-events: none`), in `#createSentinel()` in
   `nfs-sticky.ts`. Foundation has no equivalent concept (its JS plugin uses scroll-position math, not
   sentinels), so there is no Foundation rule to reuse or conflict with. The styles are deliberately
   layout-neutral (1px tall, zero margin) so the sentinels never shift Foundation's own layout or
   visual output.

No Foundation class (`.sticky`, `.sticky-container`, `.is-stuck`, `.is-at-top`, `.is-at-bottom`,
`.is-anchored`) is redefined or overridden anywhere in this prototype.

## How to run

Versions used: Angular CLI 22.2.0, `@angular/core` `^22.2.0` (resolved 22.2.0), TypeScript `~6.0.2`
(resolved 6.0.3) -- matches the map's pins exactly; the generator did not pull anything else in.
`foundation-sites` 6.9.0 (exact). `@playwright/test` with Chromium, Firefox, and WebKit already
present in the shared `ms-playwright` cache.

```
cd D:/tmp/nfs-proto-sticky-css/app
npx ng build
npx http-server dist/app/browser -p 4480 -c-1 -s   # static server, CSR + SSG first paint
npx playwright test                                 # all 3 projects, all 7 cases

# a true dynamic SSR run (not just the prerendered route), to see hydration itself:
NG_ALLOWED_HOSTS="localhost:4483,localhost" PORT=4483 node dist/app/server/server.mjs
```

`NG_ALLOWED_HOSTS` is required for the dynamic SSR server: `@angular/ssr`'s request handler rejects the
plain `Host: localhost:4483` header otherwise ("Header \"host\" ... is not allowed" -- Angular's SSRF
guard, `adev/src/content/guide/security.md` "Preventing Server-Side Request Forgery").

`@playwright/test` was used directly (rather than `/playwright-cli`) because the question needs
precise, repeatable geometric assertions (`getBoundingClientRect`, `getComputedStyle`) at many exact
scroll positions across three engines -- exactly what the Playwright Test API is for; `playwright-cli`
is better suited to interactive/exploratory browsing than to this kind of programmatic assertion suite.

## Verdict

**CSS `position: sticky` plus IntersectionObserver sentinels correctly reproduces the full Foundation
Sticky class contract (`.is-stuck`/`.is-at-top`/`.is-at-bottom`/`.is-anchored`, `stuck`/`unstuck`
outputs) for the common case where the sticky range equals the containing block, for both
`stickTo: 'top'` and `stickTo: 'bottom'`, with correct em-based margins and a working breakpoint gate --
in Chromium, Firefox, and WebKit alike, and correctly on the server before hydration.** Two real
behaviours do **not** survive the move to native CSS and must become documented limits:
`topAnchor`/`btmAnchor` ranges that don't correspond to the containing block, and any `overflow:
hidden` ancestor between the sticky element and the window. A third finding, not asked for by the
ticket but found while building it, is a correctness gap in the sentinel technique itself for large
instantaneous scroll jumps, fixed here with a small rAF-throttled scroll-listener backstop -- meaning
the real spec should not rely on "IntersectionObserver sentinels" alone.

### Results

| Case | Result | Evidence |
| --- | --- | --- |
| Basic top stick (`stickTo: 'top'`, default `marginTop: 1em`) | Works. Full 3-state class contract (`is-anchored is-at-top` before the range, `is-stuck is-at-top` inside it, `is-anchored is-at-bottom` after it) matches the browser's own pinned/unpinned `getBoundingClientRect` transitions exactly, in all 3 engines. | `e2e/sticky.spec.ts` `case-basic-top`, all 3 projects green |
| `stickTo: 'bottom'` | Works, with the same 3-state contract. `is-at-bottom` pairs with `is-stuck` while pinned (`bottom: 1em` computed style, `rectTop` = `viewportHeight - offset - ownHeight` exactly); `is-at-top`/`is-at-bottom` (unstuck) match which end of the container's range the element rests against, independent of `stickTo`, matching Foundation's own `_setSticky`/`_removeSticky` semantics (`js/foundation.sticky.js:236-296`). | `e2e/sticky.spec.ts` `case-stick-bottom`, all 3 projects green |
| `marginTop`/`marginBottom` in em | Works exactly. `marginTop="3"` resolves to computed `top: 48px` at the body's 16px font size, matching Foundation's own `emCalc` (`js/foundation.sticky.js:508-510`) but done in pure CSS with no JS unit conversion needed. | `e2e/sticky.spec.ts` `case-margin-em`, all 3 projects green |
| `stickyOn` breakpoint gate | Works. `matchMedia('(min-width: 1024px)')` toggles `position: sticky` vs `static`; the class contract correctly reports `is-stuck` only when both the gate is open AND the scroll position is within range (a real bug caught by this prototype: the gate must be ANDed into the stuck computation, or the sentinels alone would report "stuck" even at a viewport width below the breakpoint). | `e2e/sticky.spec.ts` `case-stickyon-gate`, all 3 projects green |
| `is-stuck`/`is-at-top`/`is-at-bottom`/`is-anchored` class contract via IntersectionObserver sentinels | Works, for the common case (see the anchor-range and overflow:hidden rows below for where it breaks), but **not from IntersectionObserver alone** -- see "IntersectionObserver correctness gap" below. | All 7 `e2e/sticky.spec.ts` cases |
| `topAnchor`/`btmAnchor` sized to match the containing block | Works, but only as a recipe: the directive never reads `topAnchor`/`btmAnchor` at all (there is nothing to read them into -- CSS sticky has no concept of an arbitrary anchor id). The consumer must place `[data-sticky-container]` so its own top/bottom edges land exactly where the anchors point; when they do, the container's own top and bottom **are** the anchor range, matched to 0px in this prototype's `case-anchor-container-match`. | `e2e/sticky.spec.ts` `case-anchor-container-match`, all 3 projects green |
| `topAnchor`/`btmAnchor` outside the containing block (documented limit) | **Fails to honour the anchor, by design of the platform.** With a 150px container and a `btmAnchor` pointing at a marker 2000+px further down the page, the JS plugin would keep the element stuck all the way to that marker; CSS sticky un-sticks at ~150px (the container's own bottom) regardless of what `btmAnchor` names, because `position: sticky` has no mechanism to reference an arbitrary element by id. | `e2e/sticky.spec.ts` `case-anchor-outside`, all 3 projects green (asserting the un-stick happens early, not late) |
| `overflow: hidden` ancestor (Foundation's `.off-canvas-wrapper`) | **Fails, and the class contract can actively lie about it.** `getComputedStyle(...).position` still reports `'sticky'`, but the element's real screen position keeps drifting with the page instead of holding at the offset (measured `rectTop` delta > 100px between two scroll positions where the directive's own sentinels believe it is stuck) -- because the element's true nearest scroll container becomes the `overflow: hidden` ancestor (whose `scrollTop` never changes), not the window, exactly as `research/web-platform-features.md` section 8 predicted. Because this prototype's sentinels only ever measure window-relative geometry, `.is-stuck` can be present on the class list even though nothing is visually pinned. | `e2e/sticky.spec.ts` `case-overflow-hidden`, all 3 projects green (asserting the drift) |
| Server-rendered first paint | Works with no directive JS at all. `curl`'d SSR output (both the prerendered/SSG route and a live `node dist/app/server/server.mjs` SSR process) shows `class="sticky is-at-top is-anchored" style="...position: sticky; top: 1em;"` -- the CSS alone is already visually correct before any script runs, matching building-blocks.md's "the one plugin that is fully functional as dehydrated HTML." | Section "SSR and hydration" below |
| Hydration | Clean. Zero console/page errors (checked for `NG05xx` and any other error) across a full hydrate-then-scroll cycle on the SSR server; after hydration the element correctly gains `is-stuck` on scroll. | Section "SSR and hydration" below |

### IntersectionObserver correctness gap (found while building this, not asked for by the ticket)

IntersectionObserver only notifies when the observed target's `isIntersecting` boolean **changes
between two sampled frames**. A single instantaneous scroll jump larger than the sentinel's shrunk
detection band -- `window.scrollTo(0, farAwayY)` with no smooth behaviour, `scrollIntoView()`,
keyboard Home/End on a tall page, or a hash navigation -- can leave a sentinel on one side of the band
before the jump and the other side after, with **no sampled frame ever landing inside the band**. When
that happens the observer never fires, and the class contract goes stale (stuck at whatever it was
before the jump) until the user scrolls back across the same line from the correct direction.

Reproduced directly in this prototype: navigating to the page (scroll 0) and then doing one
`window.scrollTo(0, 9027)` (skipping straight into what should be the middle of a stuck range) left the
element at `is-anchored is-at-top` indefinitely -- confirmed by waiting up to 2 seconds, ruling out a
timing race. Scrolling there in small increments (or via repeated real scroll events) worked correctly
every time.

**Fix applied and verified**: a `passive`, `requestAnimationFrame`-throttled native `scroll` listener
that re-reads the same sentinel geometry directly (not relying on the IntersectionObserver's own
boolean) closes the gap -- functionally the same role as Foundation's own `checkEvery` scroll-driven
recompute (`js/foundation.sticky.js` options table, `checkEvery`). With the backstop in place, the same
single-jump repro immediately reports the correct state. All 7 cases, all 3 engines, pass with the
backstop in `nfs-sticky.ts`.

**This means the ticket's premise needs a small correction for the real spec**: "IntersectionObserver
sentinels" alone are not sufficient for correctness; the Sticky spec should call for IntersectionObserver
sentinels as the primary (cheap, no-op on most frames) mechanism, paired with a lightweight
rAF-throttled scroll-listener reconciliation as a backstop for large jumps, not for continuous
recomputation on every scroll event the way Foundation's own JS plugin does.

### SSR and hydration

Static prerendered (SSG) output (`dist/app/browser/index.html`), before any client JS:

```html
<div nfsstickycontainer="" ... class="sticky-container">
  <div nfssticky="" ... class="sticky is-at-top is-anchored"
       style="height: 60px; background: #cfe8ff; position: sticky; top: 1em;">
    case-basic-top: stickTo top, marginTop default (1em)
  </div>
  ...
</div>
```

A true dynamic SSR run (`node dist/app/server/server.mjs`, not the prerendered route) shows the same:
`class="sticky is-at-top is-anchored" style="...position: sticky; top: 1em;"`. `position: sticky` is a
CSS property value in the server-rendered `style` attribute, so it paints correctly with zero
JavaScript, before hydration -- matching building-blocks.md's claim that Sticky is "the one plugin that
is fully functional as dehydrated HTML."

Loading that SSR page in a full browser, waiting for hydration, and then scrolling: zero console or
page errors (checked broadly, not just `NG05xx`), and the element correctly gains `is-stuck is-at-top`
once scrolled into range -- proving the directive's `afterNextRender` setup (sentinels, observers,
breakpoint `matchMedia` listener, scroll backstop) runs cleanly after hydration with no mismatch.

### What this prototype does not prove

- **Real user input devices** (actual mouse wheel, trackpad, touch fling, keyboard scroll) were not
  driven through the OS/browser input pipeline -- all scrolling in the automated tests is
  `window.scrollTo` (proven exactly where it breaks, above) or Playwright's synthetic scroll. Real
  human scrolling produces many more intermediate frames than a script-driven jump, so it is expected
  to be even less likely to hit the IntersectionObserver gap than the worst case tested here, but this
  was not independently measured.
- **`anchor` (single-anchor) mode** (`data-anchor="foo"`, distinct from the `topAnchor`/`btmAnchor`
  pair) was not built as a separate case; its geometry is a special case of the arbitrary-anchor
  problem already proven to fail (case-anchor-outside) and does not need separate proof.
- **`dynamicHeight: false`** and **`checkEvery`** (Foundation options that change how often the JS
  plugin recalculates) have no CSS-sticky analogue and were not modelled; native sticky needs no
  container-height bookkeeping at all (see `nfs-sticky-container.ts`).
- Performance under many simultaneous sticky elements, or interaction with `content-visibility`,
  `@container` queries, or nested sticky elements, was not tested.

### Decision this hands to the blocked Sticky spec

- Build Sticky as `[nfsSticky]` on `.sticky` (documented custom CSS: `position: sticky` only) plus
  `[nfsStickyContainer]` on `[data-sticky-container]` (a class marker, no JS-managed height), exactly as
  building-blocks.md row 217 already states.
- `stickTo: 'bottom'`, em-based `marginTop`/`marginBottom`, and the `stickyOn` breakpoint gate are all
  fully supported; the spec can drop the "documented limit" framing for these three and treat them as
  ordinary supported inputs.
- `topAnchor`/`btmAnchor` become a **documented limit with a recipe**, not dropped options: keep them as
  inputs for API parity and dev-mode warning purposes (a consumer who sets them expecting Foundation's
  arbitrary-anchor behaviour should be told plainly that they're informational only), and document the
  supported pattern as "size `[data-sticky-container]` to span the range you want; `topAnchor`/
  `btmAnchor` are not read." The `anchor` (single) option becomes the same limit.
- `overflow: hidden` ancestors (the off-canvas-wrapper clash from `research/web-platform-features.md`
  section 8) become a **documented incompatibility**, not merely reduced fidelity: pair it with a
  dev-mode warning if feasible (e.g. checking `getComputedStyle` of ancestors up to the nearest actual
  scroll container and comparing it to `window` at setup time), since this prototype shows the failure
  is silent and the class contract can actively mislead a consumer who trusts it.
- The Sticky spec's Implementation Decisions must call for IntersectionObserver sentinels **plus** a
  rAF-throttled scroll-listener backstop, not sentinels alone, per the correctness gap found above.

### OPEN FOR HUMAN

- Whether the dev-mode warning for an `overflow: hidden` ancestor (suggested above) is worth the
  runtime cost of walking the ancestor chain on every Sticky instance, or whether documentation alone
  is the right level of investment for a rare authoring mistake. Sources do not settle a "how much
  guardrail is worth it" tradeoff; the spec ticket should decide.
- Whether `topAnchor`/`btmAnchor`/`anchor` should still be accepted as inputs at all (kept for API
  parity, informational/dev-warning only, per the decision above) or dropped entirely as "dropped
  options" the way `stickyClass`/`containerClass` already are (building-blocks.md 1.4). This prototype
  shows they cannot be honoured either way; the choice between "keep as documented no-ops" and "drop"
  is an API-shape call, not a technical one, and is left to the spec ticket.
