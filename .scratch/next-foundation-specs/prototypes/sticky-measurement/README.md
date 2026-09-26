# Prototype: Sticky measurement refinements

Ticket: [63. Prototype: Sticky measurement refinements](../../issues/63-prototype-sticky-measurement.md).

## Question

Does `specs/sticky.md`'s design for `nfsSticky` hold up in Chromium, Firefox, and WebKit on six
points where it departs from, or adds detail to, the earlier
[Prototype: CSS `position: sticky` plus sentinels for Sticky](../sticky-css/README.md)?

1. Absolutely positioned sentinels appended at the container's end leave layout unchanged, in flex
   and grid containers and with container padding.
2. State computed from the host's own rectangle against the stick line matches the pinned geometry
   under real wheel and keyboard scrolling.
3. The nearest real scroll container as the IntersectionObserver root works inside `overflow: auto`
   and `overflow: hidden` wrappers, and `overflow: clip` on an OffCanvas-style wrapper works.
4. The CSS `stickyOn` gate (Foundation's `breakpoint()`, keyed on `data-nfs-sticky-on`) switches at
   exactly the widths an independent JS breakpoint computation does.
5. Consumer `scroll-padding-top` on the scroll container does not shift the sticky line.
6. Appending sentinels next to a not-yet-hydrated `@defer (hydrate on viewport)` sibling causes no
   NG05xx error.

## What is here

The decisive files only (the workspace, including `node_modules` and build output, stays at
`D:/tmp/nfs-proto-sticky-measurement/app` and is not committed):

- `sticky/state.ts` -- the pure state-derivation function (`computeStickyState`) and the
  `stickyOn` canonicalisation rule, table-tested with no browser.
- `sticky/breakpoints.ts` -- an independent stand-in for `NfsMediaQuery`, mirroring Foundation's
  `breakpoint()` math (case 4's comparison target).
- `sticky/nfs-sticky.ts` -- the `[nfsSticky]` directive per `specs/sticky.md`'s design: host
  bindings for the class contract and the canonical gate attribute, the scroll-container walk,
  layout-neutral sentinels appended at the container's end, IntersectionObserver plus a
  rAF-throttled scroll backstop, and a `ResizeObserver`.
- `sticky/nfs-sticky-container.ts` -- unchanged from the sticky-css prototype: a class marker.
- `app.html`, `app.ts` -- one page with a fixture section per case, plus a test hook
  (`window.nfsGateMatches`) exposing the same breakpoint module the directive uses.
- `styles.scss` -- Foundation's `foundation-sticky` reused untouched, plus the `stickyOn` gate
  rules built with Foundation's own `breakpoint()` mixin over `$breakpoints` (using `@import` for
  Foundation's util layer, since foundation-sites 6.9 has not migrated that layer to `@use`/
  `@forward`; ADR 0012 already leaves Dart Sass's eventual `@import` removal `OPEN FOR HUMAN` for
  the real library).
- `e2e/*.spec.ts` -- one Playwright spec file per case, plus `pure-state.spec.ts` for the
  non-browser logic.
- `playwright.config.ts`, `serve-static.mjs` -- three-engine config against a tiny built-in static
  server (no `http-server` dependency; ports 4610-4619 per the map's port range).

## How to run

Workspace: `D:/tmp/nfs-proto-sticky-measurement/app` (Angular CLI 22.2.0, TypeScript ~6.0.2,
`foundation-sites` 6.9.0, `@playwright/test` ^1.63.0 -- matches the map's pins).

```
cd D:/tmp/nfs-proto-sticky-measurement/app
npm install
npx ng build              # prerenders the one route to dist/app/browser
npx playwright test       # starts serve-static.mjs on :4611, runs all specs in 3 engines
```

For the supplementary `ngDevMode` hydration-stats read (case 6, not part of the repeatable suite):

```
npx ng build --configuration development --output-path dist-dev
node serve-static.mjs dist-dev/browser 4612
# then, in a script or the browser console after scrolling the deferred block into view:
#   ngDevMode.componentsSkippedHydration, .hydratedComponents, .hydratedNodes,
#   .deferBlocksWithIncrementalHydration
```

## Verdict

All six assumptions the Sticky spec asked this prototype to confirm hold, in Chromium, Firefox, and
WebKit: 147/147 Playwright tests green (49 tests x 3 engines: case 1 x3, case 2 x2, case 3 x3, case
4 x24, case 5 x1, case 6 x1, plus 15 non-browser `pure-state` assertions run redundantly per engine).
No case needs the spec's named fallback. One real correctness bug was found and fixed while building
this: the scroll-container line must be measured from the scroll container's padding box, not its
border box, or a bordered `overflow: auto`/`hidden` ancestor throws the class contract off by the
border width -- an ordinary case (any panel with a visible border), not an edge case. This is handed
to the spec as a small refinement to its "How the class contract is measured" subsection, not a
reversal of any decision. The full results table, the bugs found, what the prototype does not prove,
the per-case decision, and the `OPEN FOR HUMAN` triage are in the ticket's `## Answer`:
[63. Prototype: Sticky measurement refinements](../../issues/63-prototype-sticky-measurement.md).

Workspace path: `D:/tmp/nfs-proto-sticky-measurement/app` (kept; not committed).
