# 61. Prototype: Interchange template outlet under hydration

Type: prototype
Status: open
Blocked by: 35, 60
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Interchange](35-spec-interchange.md) answer. That spec assumes that an outlet directive on `ng-container[nfsInterchange]`, which creates the matching rule's embedded view from a `ViewContainerRef` inside an `effect()`, does three things correctly; only running code can confirm them:

1. It renders the Server breakpoint's template into the server HTML.
2. That view is claimed at hydration with no NG05xx error and `componentsSkippedHydration === 0`.
3. It swaps to the live breakpoint's template in the same tick as the Breakpoint service's first-render handoff, in client-rendered, server-rendered, and `@defer (hydrate on viewport)` cases, and the `replaced` output fires after that render.

If any of the three fails, the spec's stated fallback applies (the swap moves to `ngDoCheck` with no API change) and the orchestrator reopens the Interchange spec; if all three hold, the verdict is appended to that spec's decision log.

Read first: `specs/interchange.md` (the outlet's API and rendering-modes subsection), `specs/breakpoint-service.md` (the first-render handoff), `building-blocks.md` 1.7 and 1.11, `adr/0014-breakpoint-service-first-render-handoff.md`, `adr/0015-interchange-no-image-or-partial-mode.md`, `research/angular-rendering-modes.md` sections 2, 4, 5, and 7, and the resolved [Prototype: Breakpoint handoff under hydration](60-prototype-breakpoint-handoff-hydration.md) answer, whose workspace and minimal `NfsMediaQuery` this prototype reuses.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: extend the breakpoint handoff prototype's plain Angular CLI 22.2 `--ssr` application (copy it to `D:/tmp/nfs-proto-interchange-outlet-hydration/`; Angular 22.2.0, TypeScript 6.0.x) with the outlet directive as the Interchange spec defines it and two rule templates. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test` in Chromium at least (Firefox and WebKit where they run), with a prerendered route and a server-rendered route, asserting the server HTML, `ngDevMode` hydration statistics, the console, the DOM after the handoff, and the `replaced` emissions.

Capture it: copy the decisive files into `prototypes/interchange-outlet-hydration/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Interchange spec, and anything left `OPEN FOR HUMAN`.
