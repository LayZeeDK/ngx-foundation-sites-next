# 48. Prototype: CSS `position: sticky` with IntersectionObserver sentinels for Sticky

Type: prototype
Status: resolved
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Which Foundation Sticky behaviours can CSS `position: sticky` plus IntersectionObserver sentinels honour: anchor ranges outside the containing block (`topAnchor`, `btmAnchor`), `stickTo: 'bottom'`, em-based `marginTop` and `marginBottom`, the `stickyOn` breakpoint gate, the `is-stuck`/`is-anchored` class contract, and an `overflow: hidden` off-canvas wrapper? Which become documented limits?

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-positioned.md`, `research/web-platform-features.md`, `research/angular-rendering-modes.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-sticky-css/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/sticky-css/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Built as a plain Angular CLI 22.2.0 `--ssr` application under `D:/tmp/nfs-proto-sticky-css/app`
(chosen over a synthetic Nx workspace: the question is about one directive's runtime behaviour in a
real browser, not about Nx project graph or build targets), with `foundation-sites` 6.9.0's Sass
`sticky` partial reused untouched (`@use 'foundation-sites/scss/components/sticky'; @include
sticky.foundation-sticky;`) plus the one documented custom rule the building-blocks map already calls
for (`.sticky { position: sticky; }` -- Foundation's own `_sticky.scss` has no such rule). Decisive
files and a full README (question, how to run, verdict, results table, custom-CSS list, the
IntersectionObserver correctness gap found while building it, and the SSR/hydration evidence) are
captured at [prototypes/sticky-css/](../prototypes/sticky-css/README.md); the runnable workspace stays
at `D:/tmp/nfs-proto-sticky-css/app`.

**Verdict**: CSS `position: sticky` plus IntersectionObserver sentinels correctly reproduces the full
Foundation Sticky class contract (`.is-stuck`/`.is-at-top`/`.is-at-bottom`/`.is-anchored`,
`stuck`/`unstuck` outputs) for the common case where the sticky range equals the containing block, for
both `stickTo: 'top'` and `stickTo: 'bottom'`, with correct em-based margins and a working `stickyOn`
breakpoint gate -- verified in Chromium, Firefox, and WebKit alike (21/21 Playwright tests green across
all three engines), and correct on the server before hydration with a clean, error-free hydrate. Two
things Foundation's JS plugin does become documented limits: `topAnchor`/`btmAnchor` ranges that don't
correspond to the containing block, and any `overflow: hidden` ancestor between the sticky element and
the window. A third, unasked-for finding: IntersectionObserver sentinels alone have a real correctness
gap for large instantaneous scroll jumps, closed here with a small scroll-listener backstop -- so the
spec should not rely on sentinels alone.

### Results

| Case | Result | Evidence |
| --- | --- | --- |
| Basic top stick, default `marginTop: 1em` | Works; full 3-state class contract matches the browser's own pinned/unpinned geometry exactly, all 3 engines | `e2e/sticky.spec.ts` `case-basic-top` |
| `stickTo: 'bottom'` | Works, same 3-state contract, pinned at `viewportHeight - offset - ownHeight` | `e2e/sticky.spec.ts` `case-stick-bottom` |
| `marginTop`/`marginBottom` in em | Works exactly (`marginTop="3"` -> computed `top: 48px` at 16px base font) | `e2e/sticky.spec.ts` `case-margin-em` |
| `stickyOn` breakpoint gate | Works; `matchMedia` toggles `position: sticky`/`static`, gate correctly ANDed into the stuck computation | `e2e/sticky.spec.ts` `case-stickyon-gate` |
| `topAnchor`/`btmAnchor` sized to match the container | Works as a recipe only -- the directive never reads the inputs; the consumer places the container to span the desired range | `e2e/sticky.spec.ts` `case-anchor-container-match` |
| `topAnchor`/`btmAnchor` outside the container (**documented limit**) | Fails to honour the anchor by platform design: un-sticks at the container's own ~150px bound, not the 2000px-away anchor id | `e2e/sticky.spec.ts` `case-anchor-outside` |
| `overflow: hidden` ancestor (**documented limit**) | Fails, and can actively mislead: CSS still reports `position: sticky`, but the element drifts with the page instead of pinning, because its true scroll container becomes the `overflow: hidden` ancestor, not the window | `e2e/sticky.spec.ts` `case-overflow-hidden` |
| Server-rendered first paint | Works with zero JS: SSR/SSG output already carries `class="sticky is-at-top is-anchored" style="...position: sticky; top: 1em;"` | curl'd `dist/app/browser/index.html` and a live `node dist/app/server/server.mjs` response, see README |
| Hydration | Clean: zero console/page errors across hydrate-then-scroll; `.is-stuck` engages correctly post-hydration | Playwright console/pageerror capture against the SSR server, see README |

**Exact error text encountered** (environment issue, not a Sticky-specific failure): a live SSR run via
`node dist/app/server/server.mjs` (as opposed to the prerendered/SSG route) rejects a plain `curl`
request with `ERROR: Bad Request ("http://localhost:4483/"). Header "host" with value
"localhost:4483" is not allowed.` -- Angular 22's SSRF guard (`adev/src/content/guide/security.md`
"Preventing Server-Side Request Forgery"). Fixed by setting `NG_ALLOWED_HOSTS="localhost:4483,localhost"`
before starting the server; the same gotcha was independently hit by the [P11 `animate.enter` at
hydration prototype](../prototypes/animate-enter-hydration/README.md).

**IntersectionObserver correctness gap** (found while building this, not asked by the ticket): a single
instantaneous scroll jump larger than a sentinel's shrunk detection band (`window.scrollTo` with no
smooth behaviour, `scrollIntoView()`, Home/End on a tall page, a hash navigation) can leave a sentinel
on one side of the band before the jump and the other side after, with no sampled frame ever landing
inside it -- IntersectionObserver then never fires and the class contract goes stale (no thrown error;
it silently keeps reporting the pre-jump state) until the user scrolls back across the same line from
the correct direction. Reproduced directly: one `window.scrollTo(0, 9027)` from page load left the
element at `is-anchored is-at-top` indefinitely (confirmed by waiting up to 2 seconds, ruling out a
timing race), while reaching the identical scroll position through small increments worked every time.
Fixed with a `passive`, `requestAnimationFrame`-throttled native `scroll` listener that re-reads the
same sentinel geometry directly, functionally the same role as Foundation's own `checkEvery`
scroll-driven recompute (`js/foundation.sticky.js` options table). With the backstop in place, all 7
cases pass in all 3 engines.

### What the prototype does not prove

- Real mouse-wheel/trackpad/touch/keyboard scrolling was not driven through the OS input pipeline (all
  scrolling here is `window.scrollTo` or Playwright's synthetic scroll); real user scrolling should be
  even less likely to hit the IntersectionObserver gap than the worst case tested, but this was not
  independently measured.
- `data-anchor` (single-anchor) mode was not built as a separate case; it is a special case of the
  already-proven-failing arbitrary-anchor problem.
- `dynamicHeight: false` and `checkEvery` have no CSS-sticky analogue and were not modelled.
- Performance with many simultaneous sticky elements, or interaction with `content-visibility`,
  `@container` queries, or nested sticky elements, was not tested.

### Decision this hands to the Sticky spec

- Build Sticky as `[nfsSticky]` on `.sticky` (documented custom CSS: `position: sticky` only) plus
  `[nfsStickyContainer]` on `[data-sticky-container]` (a class marker, no JS-managed height), as
  building-blocks.md row 217 already states.
- `stickTo: 'bottom'`, em-based `marginTop`/`marginBottom`, and the `stickyOn` gate are fully supported;
  drop the "documented limit" framing for these three.
- `topAnchor`/`btmAnchor`/`anchor` become a documented limit **with a recipe** (size
  `[data-sticky-container]` to span the desired range), not silently dropped options.
- The `overflow: hidden` ancestor clash becomes a documented incompatibility, flagged as capable of
  silently misleading a consumer who trusts the class contract.
- The Implementation Decisions must call for IntersectionObserver sentinels **plus** a rAF-throttled
  scroll-listener backstop, not sentinels alone.

### OPEN FOR HUMAN

- Whether a dev-mode warning for an `overflow: hidden` ancestor (walking the ancestor chain at setup to
  compare the nearest real scroll container against `window`) is worth its runtime cost, or whether
  documentation alone is the right level of investment for what is likely a rare authoring mistake.
- Whether `topAnchor`/`btmAnchor`/`anchor` should stay as accepted (informational-only, dev-warned)
  inputs for Foundation API parity, or be dropped entirely the way `stickyClass`/`containerClass`
  already are (building-blocks.md 1.4). This prototype shows they cannot be honoured either way; the
  choice is an API-shape call for the spec ticket, not a technical one this prototype can settle.

Orchestrator, 2026-09-26: the two OPEN FOR HUMAN items above are API-shape questions the [Spec: Sticky](28-spec-sticky.md) can settle from the building-blocks rules (1.4 keeps Foundation options that describe behaviour and drops jQuery-only ones; dev-mode warnings follow the pattern in 1.5 and 1.9). They pass to that spec's decision log rather than to the human; the spec records them as OPEN FOR HUMAN only if its sources cannot settle them.

### Triage (auto-trap quadrant), 2026-09-26

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items". Both items passed to [Spec: Sticky](28-spec-sticky.md), which settled them from the building-blocks rules and left nothing open; the ratings are recorded here.

1. Development-mode warning for an `overflow: hidden` ancestor, or documentation only.
   - Impact: not HIGH. Development-only code; no API.
   - Confidence: HIGH. The scroll-container walk is needed for correct classes anyway and runs once per instance; the warning suggests `overflow: clip`, which is in the browser target ([Spec: Sticky](28-spec-sticky.md) decision 17).
   - Outcome: DECIDED: the walk plus a development-mode warning.
2. `anchor`, `topAnchor`, `btmAnchor`: no-op inputs or dropped options.
   - Impact: HIGH. It decides the public input list.
   - Confidence: HIGH. Building-blocks 1.4 turns an option into an input only when the library carries its behaviour, and this prototype showed anchors outside the containing block cannot be honoured by `position: sticky` ([Spec: Sticky](28-spec-sticky.md) decision 8; ADR 0019).
   - Outcome: DECIDED: dropped options, with a development warning for leftover `data-*anchor` attributes.
