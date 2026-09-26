# 65. Prototype: Orbit keyboard scrolling and hydration details

Type: prototype
Status: open
Blocked by: 33
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Orbit](33-spec-orbit.md) answer. The [Prototype: Scroll-snap Orbit](46-prototype-orbit-scroll-snap.md) proved the scroll-snap design; the spec adds an `inert` gate that applies only once the directives are live, a bullet `tabindex` handed over to Aria, a hidden scrollbar, an inward focus ring on the slide, and a 24 px bullet floor, and assumes two things only running code can confirm, in Chromium, Firefox, and WebKit:

1. Keyboard scrolling from a focused slide keeps focus inside the carousel, the inward focus ring is visible, and the scrollbar stays hidden in a headed run on Windows (`scrollbar-width: none` plus `::-webkit-scrollbar`).
2. On the prerendered fixture: the attribute change from the `inert` gate is clean at hydration (no NG05xx, nothing skipped), the bullet `tabindex` hands over to Aria, a bound non-first `selected` aligns instantly, a scroll made before hydration is adopted as the selection, and a `@defer (hydrate on viewport)` block starts rotation when it hydrates.

If a case fails, the orchestrator reopens the Orbit spec; otherwise the verdict is appended to its decision log.

Read first: `specs/orbit.md` (the API, the `inert` gate, the custom CSS list, the rendering-modes subsection), `adr/0025-orbit-live-inert.md`, the Orbit prototype's answer and `prototypes/orbit-scroll-snap/`, and `research/angular-rendering-modes.md` sections 4 and 7.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: copy the Orbit prototype's plain Angular CLI 22.2 `--ssr` application to `D:/tmp/nfs-proto-orbit-keyboard-hydration/` (Angular 22.2.0, TypeScript 6.0.x, `@angular/aria` 22.2.0, `foundation-sites` 6.9.0), bring its directives to the spec's design, and drive it with `@playwright/test` in all three engines (headed for the scrollbar check), delaying the main bundle with `page.route` for the pre-hydration cases. Never modify this repo's working tree outside the effort directory.

Capture it: copy the decisive files into `prototypes/orbit-keyboard-hydration/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Orbit spec, and anything left `OPEN FOR HUMAN` after the triage rule.
