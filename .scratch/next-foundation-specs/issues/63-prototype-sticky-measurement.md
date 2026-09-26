# 63. Prototype: Sticky measurement refinements

Type: prototype
Status: open
Blocked by: 28
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Sticky](28-spec-sticky.md) answer. That spec departs from the [Prototype: CSS `position: sticky` plus sentinels for Sticky](48-prototype-sticky-css.md) in four ways and assumes six things hold; only running code can confirm them, in Chromium, Firefox, and WebKit:

1. Absolutely positioned sentinels appended at the container's end leave layout unchanged, including in flex and grid containers and with container padding.
2. State computed from the host's own rectangle against the stick line matches the pinned geometry under real wheel and keyboard scrolling.
3. Using the nearest real scroll container as the IntersectionObserver root works inside `overflow: auto` and `overflow: hidden` wrappers, and `overflow: clip` on the wrapper works inside Foundation's OffCanvas wrapper.
4. The CSS `stickyOn` gate (a `breakpoint()`-built rule keyed on `data-nfs-sticky-on`) switches at exactly the widths `NfsMediaQuery.is()` does.
5. Consumer `scroll-padding` on the scroll container does not shift the sticky line.
6. Appending sentinels next to a not-yet-hydrated `@defer` sibling causes no NG05xx error.

The spec names a fallback for each; if a case fails, the orchestrator reopens the Sticky spec with that fallback, otherwise the verdict is appended to its decision log.

Read first: `specs/sticky.md` (the measurement and rendering-modes subsections and the fallbacks), `adr/0019-sticky-native-range.md`, the Sticky prototype's answer and `prototypes/sticky-css/`, `specs/breakpoint-service.md` (the Breakpoint query grammar), and `research/angular-rendering-modes.md` section 7.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: copy the Sticky prototype's plain Angular CLI 22.2 `--ssr` application to `D:/tmp/nfs-proto-sticky-measurement/` (Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0) and change its directive to the spec's design. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test` in all three engines, with real wheel and keyboard scrolling and a prerendered route for case 6.

Capture it: copy the decisive files into `prototypes/sticky-measurement/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Sticky spec (per case: confirmed, or the named fallback), and anything left `OPEN FOR HUMAN`.
