# 60. Prototype: Breakpoint handoff under hydration

Type: prototype
Status: resolved
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

## Answer

**All three of ADR 0014's assumptions hold**, checked with a plain Angular CLI 22.2.0 `--ssr`
application carrying a minimal `NfsMediaQuery` (CDK `MediaMatcher`, `nfsBreakpointsToken`, the
`afterNextRender({earlyRead})` switch, the `TransferState` round trip) and driven with
`@playwright/test` 1.63.0 in Chromium, Firefox, and WebKit at a 1300 px viewport: a client-rendered
route (`RenderMode.Client`) never paints a frame of the Server breakpoint's layout (the live switch's
timestamp lands at or before the first Paint Timing entry in all three engines); full hydration of a
server-rendered route and of a prerendered route, both rendered at the Server breakpoint `small`,
rebuilds the breakpoint-dependent `@if` branch to the live `xlarge` state with `componentsSkippedHydration
=== 0` and no NG05xx console error; and a `@defer (hydrate on viewport)` block hydrates cleanly into
the live branch once scrolled into view after the switch. A per-request Server breakpoint (a `?bp=`
query parameter standing in for a client hint, carried through `TransferState`) does not weaken any
of this: hydration still succeeds and the client still ends at the live breakpoint, whether the
server's per-request choice already matched the live viewport (no branch rebuild, only the printed
name advances) or not (the default `small` case, which does rebuild the branch). 18 of 18 Playwright
tests (6 cases x 3 engines) pass. No change is needed to ADR 0014, to `specs/breakpoint-service.md`'s
rendering-modes subsection, or to the Breakpoint service spec's decision log entry beyond linking
this prototype as its citable evidence.

### Results

| # | Case | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `/csr` (`RenderMode.Client`) at 1300 px: does a client-rendered app ever paint the Server breakpoint? | No. `mq-live-after-set`'s timestamp lands at or before the first Paint Timing entry in all three engines; final DOM shows only `branch-large` (`current` = `xlarge`), `branch-small` count is 0 | Chromium: switch 179ms, first-paint 192ms (13ms margin). Firefox: switch 466ms, first-contentful-paint 473ms (7ms). WebKit: switch 251ms, first-contentful-paint 256ms (5ms) |
| 2 | `/ssr` (server breakpoint `small`) at 1300 px: does full hydration rebuild the `@if` branch cleanly? | Yes. Server HTML shows `branch-small`/`current="small"` (confirmed by `curl`); after hydration the page shows `branch-large`/`current="xlarge"`, `componentsSkippedHydration === 0`, `hydratedComponents === 2`, no NG05xx | Passes in Chromium, Firefox, WebKit |
| 3 | `/prerendered` (build-time SSR, `REQUEST` null) at 1300 px: same as case 2 for a prerendered route | Yes, identical outcome | Passes in all 3 engines |
| 4 | `/ssr?bp=large`: a per-request Server breakpoint from a query parameter, carried through `TransferState` | Server renders `branch-large`/`current="large"` already (`nfsServerBreakpoint":"large"` in `ng-state`, confirmed by `curl`); hydration still succeeds, no branch rebuild this time (only `current` advances `large` -> `xlarge`) | Passes in all 3 engines |
| 5 | `/ssr` and `/prerendered`: does `@defer (hydrate on viewport)` scrolled into view after the switch rebuild its `@if` branch? | Yes. Pre-scroll the block's server-rendered content is present (`hydrate on viewport` renders the main template on the server); post-scroll it hydrates to `defer-branch-large`/`defer-current="xlarge"`, no NG05xx | Passes in all 3 engines, both routes |

18 passed (18.1s) on this machine (Windows 11 arm64, shared Playwright cache: Chromium 1243, Firefox
1543, WebKit 2359).

### Exact error text for failures

None in the final run. One transient failure while developing the timing test, not a product
finding: reading `window.__nfsProbe` immediately after Playwright's `load` event, in WebKit, before
`NfsMediaQuery`'s `afterNextRender` callback had fired at all:

```
Error: probe: [{"label":"mq-ctor","at":191},{"label":"page-ctor","at":194,"bodyHtml":"..."}]
expect(received).toBeTruthy()
Received: undefined
```

Fixed by polling for the `mq-live-after-set` mark (`page.waitForFunction`) before reading the probe.
This changes only how long the test waits, not what the timing assertion checks.

### What the prototype does not prove

- Only `current` and `atLeast()`; not the full `NfsMediaQuery` surface (`is`/`upTo`/`only`/`resolve`,
  rule parsing, `reducedMotion`, `matches()`, the dev-mode drift check) -- none of those change the
  render-timing questions this ticket asks.
- Only one breakpoint-gated `@if` and one `@defer (hydrate on viewport)` block; not a composite
  widget with a trigger and target in separate hydration boundaries, and not any other `hydrate on
  ...` trigger (`interaction`, `hover`, `idle`, `timer`, `when`, `never`).
- The `?bp=` query parameter stands in for `Sec-CH-Viewport-Width`; the header-based recipe itself
  was not exercised, only that a per-request `useFactory` provider reading `REQUEST` and choosing a
  different Server breakpoint round-trips correctly through `TransferState`.
- Zoneless only (the Angular CLI 22.2.0 `--ssr` default); no zone.js consumer was tried.
- Windows 11 arm64 only, with x64 Playwright browsers under emulation; no Linux CI run, no native
  macOS WebKit.
- The Paint Timing API comparison is an inference from two independently-timestamped browser facts,
  not a recording of the screen itself; it is the strongest proof available without a
  high-frame-rate video capture.

### Decision handed to the Breakpoint service spec, ResponsiveAccordionTabs, and ResponsiveMenu

No spec text changes. ADR 0014, `specs/breakpoint-service.md`'s rendering-modes subsection, and the
[Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md) decision already recorded
stand confirmed by running code:

1. The Client-before-live rule (decision 9 of the spec's design decisions table) holds: a plain
   client-rendered app never shows the Server breakpoint's layout, so ResponsiveAccordionTabs and
   ResponsiveMenu need no loading placeholder or flash guard for that case.
2. Hydration rebuilding a differing `@if` branch is confirmed silent and error-free, matching
   `research/angular-rendering-modes.md` section 2. ResponsiveAccordionTabs (already flagged in the
   rendering-modes per-directive checklist as expecting "a re-render at hydration on non-default
   breakpoints") can rely on that rebuild being safe; it still owns stating its own
   focus-preservation rule across the swap, which this trivial fixture had no reason to exercise
   (its swapped branches hold no focusable content).
3. `@defer (hydrate on viewport)` hydrating into the live branch after the switch is now confirmed
   for the `viewport` trigger specifically (building-blocks 1.11 decision 6), complementing the
   rendering-mode-test-seam prototype's confirmation for `interaction`.
4. A per-request Server breakpoint carried through `TransferState` does not introduce any new failure
   mode in any of the above, whether or not the server's choice already matches the live viewport.

### OPEN FOR HUMAN

None. Every point the ticket asked for was settled by running code in three engines. The items under
"What the prototype does not prove" are scope limits of a small fixture answering a narrow question,
not open questions this prototype could not settle.

Prototype files: [prototypes/breakpoint-handoff-hydration/README.md](../prototypes/breakpoint-handoff-hydration/README.md).
Workspace: `D:/tmp/nfs-proto-breakpoint-handoff-hydration/app`.
