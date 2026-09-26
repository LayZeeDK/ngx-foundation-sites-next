# 62. Prototype: Smooth Scroll under Router scroll restoration and replay

Type: prototype
Status: open
Blocked by: 29, 30
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Smooth Scroll](29-spec-smooth-scroll.md) answer. That spec reads from the Angular 22.2 Router source that a native in-page fragment jump fires `popstate`, which the Router answers with a navigation that scrolls to the stored position (`scrollPositionRestoration: 'enabled'`) or to the top (`'top'`), undoing the jump; and that inside a dehydrated block with a container host the replayed click's scroll lands after the Router's. Only running code can confirm both:

1. In a hydrated Router application with `scrollPositionRestoration` set to `'enabled'` and to `'top'`, where does a native in-page jump (a plain `href="#x"` with no directive) end, with and without the `nfs-smooth-scroll` mixin?
2. Inside a dehydrated `@defer (hydrate on interaction)` block with the directive on a container host, when the user clicks a link before hydration, which scroll lands last: the Router's or the replayed click's? Does the link-host form behave differently?

Measure final `scrollY` per case in Chromium, Firefox, and WebKit. If the spec's assumptions hold, its recommendation (put the directive on each link inside deferred regions of Router apps with restoration on) stands and the verdict is appended to its decision log; if they fail, the orchestrator reopens the Smooth Scroll spec.

Read first: `specs/smooth-scroll.md` (the click order and the rendering-modes subsection), `adr/0017-smooth-scroll-click-handling.md`, `building-blocks.md` 1.11 decision 5, `research/angular-rendering-modes.md` sections 4 and 7, the Router's `router_scroller.ts` and `ViewportScroller` in the angular clone, and the resolved [Prototype: Rendering-mode test seam](59-prototype-rendering-mode-test-seam.md) answer for the fixture-app recipe.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a plain Angular CLI 22.2 application with `@angular/ssr` and the Router under `D:/tmp/nfs-proto-smooth-scroll-router/` (Angular 22.2.0, TypeScript 6.0.x), two routes, long pages with in-page anchors, the directive as the spec defines it, and `withInMemoryScrolling` configured per case. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test`, delaying the main bundle with `page.route` for the pre-hydration cases.

Capture it: copy the decisive files into `prototypes/smooth-scroll-router/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence with final scroll positions per engine), exact error text for failures, what the prototype does not prove, the decision it hands to the Smooth Scroll and Magellan specs, and anything left `OPEN FOR HUMAN`.

## Added on 2026-09-26 from the Magellan spec

The [Spec: Magellan](30-spec-magellan.md) answer graduated a third question into this ticket, since it needs the same Router application:

3. In a Router application with `scrollPositionRestoration` set to `'enabled'`, `'top'`, and `'disabled'`, what happens on Back and Forward over Magellan's `deepLinking` entries (`replaceState`) and `updateHistory` entries (`pushState`), and does a `replaceState` entry survive a navigation away and back? The spec assumes `replaceState` is safe in every mode and that `updateHistory` restores wrong positions on Back while the Router's restoration is on, so it documents `updateHistory` for pages without restoration and keeps an e2e guard. Measure the final scroll positions per engine; if the assumption fails, the orchestrator reopens the Magellan spec.

Read also: `specs/magellan.md` (the deep-linking subsection) and `adr/0029-magellan-targets-from-links.md`.
