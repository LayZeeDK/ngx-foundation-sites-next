# 63. Prototype: Sticky measurement refinements

Type: prototype
Status: resolved
Blocked by: 28
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Sticky](28-spec-sticky.md) answer. That spec departs from the [Prototype: CSS `position: sticky` with IntersectionObserver sentinels for Sticky](48-prototype-sticky-css.md) in four ways and assumes six things hold; only running code can confirm them, in Chromium, Firefox, and WebKit:

1. Absolutely positioned sentinels appended at the container's end leave layout unchanged, including in flex and grid containers and with container padding.
2. State computed from the host's own rectangle against the stick line matches the pinned geometry under real wheel and keyboard scrolling.
3. Using the nearest real scroll container as the IntersectionObserver root works inside `overflow: auto` and `overflow: hidden` wrappers, and `overflow: clip` on the wrapper works inside Foundation's OffCanvas wrapper.
4. The CSS `stickyOn` gate (a `breakpoint()`-built rule keyed on `data-nfs-sticky-on`) switches at exactly the widths `NfsMediaQuery.is()` does.
5. Consumer `scroll-padding` on the scroll container does not shift the sticky line.
6. Appending sentinels next to a not-yet-hydrated `@defer` sibling causes no NG05xx error.

The spec names a fallback for each; if a case fails, the orchestrator reopens the Sticky spec with that fallback, otherwise the verdict is appended to its decision log. Case 3 (the scroll-container root inside Foundation's OffCanvas wrapper) is the case that would have reopened both the Sticky and the Off-canvas specs; the rest refine their designs without reopening either.

Read first: `specs/sticky.md` (the measurement and rendering-modes subsections and the fallbacks), `adr/0019-sticky-native-range.md`, the Sticky prototype's answer and `prototypes/sticky-css/`, `specs/breakpoint-service.md` (the Breakpoint query grammar), and `research/angular-rendering-modes.md` section 7.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: copy the Sticky prototype's plain Angular CLI 22.2 `--ssr` application to `D:/tmp/nfs-proto-sticky-measurement/` (Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0) and change its directive to the spec's design. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test` in all three engines, with real wheel and keyboard scrolling and a prerendered route for case 6.

Capture it: copy the decisive files into `prototypes/sticky-measurement/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Sticky spec (per case: confirmed, or the named fallback), and anything left `OPEN FOR HUMAN`.

## Answer

Built as a plain Angular CLI 22.2.0 `--ssr` application at `D:/tmp/nfs-proto-sticky-measurement/app`
(copied from the Sticky prototype's workspace, `D:/tmp/nfs-proto-sticky-css/app`), with `nfsSticky`
rewritten to `specs/sticky.md`'s design: one pure state-derivation function
(`src/app/sticky/state.ts`) reading the host's own rectangle against a stick line built from the
scroll container's padding-box edge plus the inset; sentinels appended as the container's last
children purely to schedule re-measurement; a scroll-container walk that stops at the first
ancestor whose `overflow-x`/`overflow-y` is neither `visible` nor `clip`; and an independent JS
breakpoint gate (`src/app/sticky/breakpoints.ts`) mirroring Foundation's own `breakpoint()` math,
compared against the CSS `stickyOn` gate the SCSS `nfs-sticky` mixin builds with Foundation's real
`breakpoint()` mixin over `$breakpoints` (`src/styles.scss`). All six cases pass in Chromium,
Firefox, and WebKit: 147/147 Playwright tests green (49 tests x 3 engines). One real, non-obvious
correctness bug was found and fixed while building this: the scroll-container line must be measured
from the scroll container's padding box, not its border box, or a bordered `overflow: auto`/`hidden`
ancestor (a completely ordinary case: any panel with a visible border) throws the class contract off
by the border width. All six assumptions the Sticky spec asked this prototype to confirm hold; none
needs a fallback.

### Results

| Case | Result | Evidence |
| --- | --- | --- |
| 1. Sentinels are layout-neutral in flex, grid, and padded containers | Confirmed. Comparing JavaScript-disabled server HTML (no sentinels) against the hydrated client (2 sentinels appended) for all three container types: children count differs by exactly 2, computed width unchanged (< 0.5px), `scrollHeight` unchanged (bit-identical) | `e2e/case1-layout-neutral.spec.ts`, 3 cases x 3 engines, 9/9 green |
| 2. State from the host rectangle matches pinned geometry under real wheel and keyboard scrolling | Confirmed. `page.mouse.wheel` in 8 steps down and 8 back up, plus keyboard End (the single largest instantaneous jump, the exact case that broke IntersectionObserver-only sentinels in the prior prototype), Home, Page Down, and both arrow keys: the class contract matches the pinned geometry (stuck implies `top` within 14-18px, i.e. 1em +/- the 1px tolerance) after every step | `e2e/case2-real-scroll.spec.ts`, 2 tests x 3 engines, 6/6 green |
| 3. Nearest real scroll container as the observer root works inside `overflow: auto` and `overflow: hidden`, and `overflow: clip` on an OffCanvas-style wrapper works | Confirmed for all three. `auto`: scrolling the panel itself (not the window) pins the element. `hidden`: scrolling the outer page repeatedly never pins it (nothing scrolls the hidden wrapper's own `scrollTop`, matching the spec's documented incompatibility). `clip`: the wrapper is skipped by the scroll-container walk, so the window stays the root and the element still pins against it | `e2e/case3-overflow-wrappers.spec.ts`, 3 cases x 3 engines, 9/9 green |
| 4. CSS `stickyOn` gate switches at exactly the widths an independent JS computation does | Confirmed at all 8 tested boundary widths (639/640, 1023/1024, 1199/1200, 1439/1440) for `medium`, `large only`, and `medium down`: the CSS gate (Foundation's real `breakpoint()` mixin) and an independently built `matchMedia` query (mirroring `-zf-bp-to-em` and the `only`/`down` bound math by hand, not reusing the SCSS output) agree at every width | `e2e/case4-gate-vs-matchmedia.spec.ts`, 24 widths x 3 engines, 72/72 green |
| 5. Consumer `scroll-padding-top` on the scroll container does not shift the sticky line | Confirmed. The stuck inset (sticky element's top minus its own scroll container's top, inside the border) is identical with and without `scroll-padding-top: 3rem` on the container, within 0.5px | `e2e/case5-scroll-padding.spec.ts`, 1 test x 3 engines, 3/3 green |
| 6. Sentinels next to a not-yet-hydrated `@defer (hydrate on viewport)` sibling cause no NG05xx | Confirmed. Zero console/page errors matching `NG0[45]\d{2,3}` across scroll-to-stick, scroll-to-trigger-hydration, and post-hydration; the sticky element keeps reporting `is-stuck` correctly throughout. A supplementary one-off run against a `--configuration development` build (kept for `ngDevMode`, not part of the repeatable suite) read `ngDevMode` directly: `componentsSkippedHydration: 0`, `hydratedComponents: 1`, `hydratedNodes: 114`, `deferBlocksWithIncrementalHydration: 1`, no console errors | `e2e/case6-defer-hydration.spec.ts`, 1 test x 3 engines, 3/3 green; dev-build `ngDevMode` read (one-off, see README "ngDevMode stats") |

Plus `e2e/pure-state.spec.ts` (15 assertions, the required runnable check for the non-trivial state
and canonicalisation logic, run once per engine harmlessly = 45/45 green): table-driven cases for
`computeStickyState` (before/pinned/past the range, both `stickTo` values, the 1px tolerance edge,
the gate-closed short-circuit) and `canonicalizeStickyOn` (`''`, `'all'`, whitespace, `'... up'`,
`'... only'`, `'... down'`).

**No failures.** Every one of the six cases confirmed on the first fully-corrected run; no case needed
the spec's named fallback.

### Bugs found and fixed while building this (not asked for by the ticket)

1. **Scroll-container border**: the first implementation measured the scroll container's border-box
   (`getBoundingClientRect()` as-is), which put the stick line off by the container's border width.
   A completely ordinary case (any bordered `overflow: auto` panel, matching this prototype's own
   case 3 and case 5 fixtures) showed the element stuck 2px short of the true line. Fixed by
   subtracting `borderTopWidth`/adding back `borderBottomWidth` to get the padding-box edge, which is
   what CSS's own scrollport definition uses. See `nfs-sticky.ts`'s `scrollContainerRect` comment.
2. **Sticky-on-load coincidence** (test-fixture bug, not a directive bug): a sticky element that is
   the literal first child of its Sticky range, with no gap above it inside the scroll container,
   starts already pinned at load, because its natural (unstuck) position already sits above the
   stick line. This is correct native `position: sticky` behaviour, not a bug -- it just made the
   original case 3 and case 5 fixtures assert "not stuck initially" against a state that was
   trivially always stuck. Fixed by adding a small filler above the sticky element in those
   fixtures, matching how case 2's fixture already had a heading above its nav.

### What the prototype does not prove

- Real touch, trackpad-inertia, and OS-level fling scrolling: case 2 drives `page.mouse.wheel` (a
  real wheel event) and real keyboard events, but not a physical trackpad or touchscreen; the
  IntersectionObserver-plus-backstop design should be at least as robust against those (more
  intermediate frames, not fewer), matching the prior prototype's same caveat.
- The five development-mode warnings the spec design calls for (unpositioned parent, container no
  taller than the element, `overflow: hidden` ancestor, leftover anchor attributes, a focused
  element hidden behind a stuck bar): out of scope for this ticket's six measurement cases, and not
  implemented in this prototype's directive. The measurement mechanism they would sit on top of is
  what this prototype proves.
- RTL, CSS transforms on an ancestor, and `content-visibility`/`container` queries interacting with
  the scroll-container walk or the sentinel geometry: not modelled.
- Runtime changes to `stickTo`, the margins, or `stickyOn` after the directive's first measurement:
  this prototype's directive reads them once in its first render callback, matching the six cases
  asked for, but not the spec's broader requirement that changing them at runtime keeps working.
- Performance with many simultaneous `nfsSticky` instances on one page: not measured.

### Decision this hands to the Sticky spec

All six assumptions are **confirmed**; none needs a fallback.

1. Confirmed: layout-neutral sentinels, flex/grid/padded, D7 as written.
2. Confirmed: the pure state-derivation function plus the rAF scroll backstop reproduces the pinned
   geometry through real wheel and keyboard input, D6/D8 as written.
3. Confirmed: the scroll-container walk (D9) as written, with one refinement -- the spec's step 1/2
   ("How the class contract is measured") should read the scroll container's rectangle at its
   **padding box**, not its border box, when building the stick line. This is a small addition to an
   already-correct design, not a reversal: it affects only the exact line position in a container
   that has a border, which the spec did not previously call out.
4. Confirmed: the CSS gate (D4) switches in lockstep with an independently computed breakpoint
   check at every tested boundary.
5. Confirmed: `scroll-padding-top` does not move the stick line (native `position: sticky` behaviour;
   `scroll-padding` only steers `scrollIntoView()`/anchor-jump targets).
6. Confirmed: appending sentinels after a `@defer (hydrate on viewport)` sibling's placeholder causes
   no NG05xx and the sibling hydrates cleanly when scrolled into view.

### Triage of items considered for OPEN FOR HUMAN

Per the map's triage rule (rate impact and confidence; only HIGH impact with NOT-HIGH confidence
stays `OPEN FOR HUMAN`), every provisional item found during this prototype was reviewed:

| Item | Impact | Confidence | Disposition |
| --- | --- | --- | --- |
| Scroll-container rect: padding box vs border box | HIGH (a public correctness contract every consumer with a bordered scroll container depends on) | HIGH (directly derivable from CSS's own scrollport definition -- the padding box is, by definition, what `position: sticky` clamps against; measured and confirmed in 3 engines, not a guess) | Decided: apply the padding-box fix, recorded above as a spec refinement, not `OPEN FOR HUMAN` |
| Approximate IntersectionObserver `rootMargin` bands for element scroll-container roots (vs. exact per-pixel bands) | LOW (the rAF scroll backstop, not observer precision, is what guarantees correctness; imprecision only costs at most one extra frame of latency) | HIGH (verified: all cases pass regardless of band precision) | Decided: keep the approximate bands, no `OPEN FOR HUMAN` |
| Whether the five development-mode warnings are worth implementing before the six measurement cases are settled | LOW (a DX aid, not a correctness or public-API question; the spec already designs their text and trigger conditions) | HIGH (the spec's own design already answers this; nothing here is undecided) | Decided: out of this ticket's scope, listed under "what the prototype does not prove", no `OPEN FOR HUMAN` |
| Real touch/trackpad input not driven | LOW (case 2's mechanism -- observer plus rAF backstop -- degrades gracefully with MORE intermediate frames from real touch/trackpad input, not fewer; the failure mode this ticket cares about only appears under fewer/no intermediate frames) | HIGH (the direction of the effect is well understood from how IntersectionObserver and rAF sampling work, even without a physical device in the loop) | Decided: not `OPEN FOR HUMAN`, listed under "what the prototype does not prove" |

No item met the bar (HIGH impact and NOT-HIGH confidence) this run, so nothing is left
`OPEN FOR HUMAN`.
