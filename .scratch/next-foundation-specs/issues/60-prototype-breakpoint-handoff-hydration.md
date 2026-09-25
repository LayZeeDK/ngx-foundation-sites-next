# 60. Prototype: Breakpoint handoff under hydration

Type: prototype
Status: open
Blocked by: 53
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md) answer. That spec assumes three things from reading the `ApplicationRef.synchronize` loop, the after-render phase order, and hydration's branch matching; only running code can confirm them:

1. A client-rendered application never paints a frame of the Server breakpoint's layout: the service keeps the Server breakpoint until its first `afterNextRender` `earlyRead` callback and switches to the live viewport within the same tick, before the browser paints.
2. Full hydration at 1300 px of a page the server rendered at the Server breakpoint (`small`) rebuilds a breakpoint-dependent `@if` branch with no NG05xx hydration error and `componentsSkippedHydration === 0`.
3. A `@defer (hydrate on viewport)` block that hydrates after the switch rebuilds its breakpoint-dependent branch without errors.

If any of the three fails, the spec's first-render handoff (ADR 0014) must change and the orchestrator reopens the Breakpoint service spec; if all three hold, the verdict is appended to that spec's decision log.

Read first: `building-blocks.md` 1.7 and 1.11, `adr/0005-breakpoint-source-of-truth.md`, `adr/0014-breakpoint-service-first-render-handoff.md`, `specs/breakpoint-service.md` (the rendering-modes subsection), `research/angular-rendering-modes.md` sections 0 to 7, and the resolved [Prototype: Rendering-mode test seam](59-prototype-rendering-mode-test-seam.md) answer for the fixture-app and hydration-assertion recipe.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a plain Angular CLI 22.2 application with `@angular/ssr` under `D:/tmp/nfs-proto-breakpoint-handoff-hydration/` (Angular 22.2.0, TypeScript 6.0.x) carrying a minimal `NfsMediaQuery` as the spec defines it (CDK `MediaMatcher`, the `nfsBreakpointsToken`, the Server breakpoint, the `afterNextRender` `earlyRead` handoff, `TransferState`). Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test` in Chromium at least (Firefox and WebKit where they run), with a prerendered route and a server-rendered route, asserting painted frames through screenshots taken before and after the first render callback, `ngDevMode` hydration statistics, and the console.

Capture it: copy the decisive files into `prototypes/breakpoint-handoff-hydration/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Breakpoint service spec and to the ResponsiveAccordionTabs and ResponsiveMenu specs, and anything left `OPEN FOR HUMAN`.
