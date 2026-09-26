# 61. Prototype: Interchange template outlet under hydration

Type: prototype
Status: resolved
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

## Answer

**Two of the three assumptions hold without qualification; the third holds on timing but fails on
ordering, and the spec's own `ngDoCheck` fallback does not fix it.** Checked with a plain Angular CLI
22.2.0 `--ssr` application extending the breakpoint handoff prototype's workspace, carrying a minimal
`NfsInterchangeOutlet` (breakpoint-name queries only, resolved through the reused minimal
`NfsMediaQuery`) and its `ngDoCheck` fallback side by side, driven by `@playwright/test` 1.63.0 in
Chromium, Firefox, and WebKit at a 1300 px viewport: (1) server HTML for `/ssr` and `/prerendered`
carries the Server breakpoint's (`small`) rule template, never the live (`large`) one, in both
mechanisms; (2) hydration claims that view with `componentsSkippedHydration === 0`, no NG05xx, and
swaps cleanly to `large`, in both mechanisms; (3) the swap itself lands at or before first paint on
`/csr` (Paint Timing probe, all 3 engines) and the `@defer (hydrate on viewport)` block hydrates into
`large` after scrolling with no NG05xx -- but the `replaced` output does **not** reliably fire
strictly after the DOM shows the rule it reports, specifically for the swap driven by the Breakpoint
service's own first-render handoff. A direct, per-emission DOM check (`document.querySelector` for
the reported rule's element, read synchronously inside the `(replaced)` handler at the exact moment
it fires) shows `NOT-SHOWN` on every run, in every engine, in both the primary (`effect()`-driven
swap) and the fallback (`ngDoCheck()`-driven swap) directive, because the root cause is the emission
mechanism (`afterRenderEffect`) racing ahead of any change-detection-driven swap when the
triggering signal write itself originates inside another render callback -- exactly what ADR 0014's
handoff is. 42 of 42 Playwright tests (14 cases x 3 engines) pass; the "finding" tests assert this
actual, surprising ordering so a future change is caught, not the desired behaviour. Per the ticket's
own stated consequence, this hands the Interchange spec back to the orchestrator to reopen, scoped to
decision 12 (`replaced` timing) and the focus rule that depends on it -- the swap mechanism itself
(assumptions 1 and 2, and the "no wrong frame painted" half of 3) needs no change.

### Results

| # | Case | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `/ssr`, `/prerendered`: server HTML carries the small rule's template, not the large one's; `replaced` never fires server-side | Yes, both routes, both mechanisms | Server HTML contains `data-testid="interchange-small"`, not `interchange-large`; `replaced-log` is empty (`<!--ngetn-->`) |
| 2 | `/ssr`, `/prerendered`: hydration claims the view with no NG05xx, `componentsSkippedHydration === 0`, swaps to `large` | Yes, both routes, both mechanisms | `hydratedComponents > 0`, `componentsSkippedHydration === 0`, no NG0[5-9]xx, final DOM shows only `interchange-large` |
| 3a | `/csr`: the swap to `large` lands at or before first paint | Yes, all 3 engines | First `outlet-swap:large` mark at or before the first Paint Timing entry (2ms slack); final DOM shows only `interchange-large` |
| 3b | `/ssr`, `/prerendered`: `@defer (hydrate on viewport)` hydrates into `large` after scrolling, no NG05xx | Yes, both routes, all 3 engines | `defer-interchange-large` visible post-scroll, `defer-interchange-small` count 0 |
| 3c | `replaced`'s log ends with `large` on `/csr`, `/ssr`, `/prerendered` | Yes, all routes, all 3 engines | `replaced-log` text ends `/large$/` |
| 3d (finding) | Does `replaced` fire strictly after the DOM shows the rule it reports, for the handoff-driven swap? | **No**, in both mechanisms, all 3 engines; the spec's `ngDoCheck` fallback does not fix it | `replaced-dom-check:large:NOT-SHOWN` on `/csr` and `/csr-fallback`, every run, every engine (see README.md "What went wrong" for the probe trace and root cause) |

18 of 18 primary-directive-plus-fallback route/case combinations that matter for the three numbered
assumptions pass; the total suite is 42 (14 tests x 3 engines), all green, on this machine (Windows 11
arm64, shared Playwright cache: Chromium, Firefox, WebKit).

### Exact error text for failures

None -- every Playwright assertion in the final run passes. An earlier draft of case 3a asserted
against the *last* `outlet-swap:large` probe mark rather than the first, which failed in Firefox
once a second, unrelated finding (CSR double-construction, below) was discovered:

```
Error: last swap at 269ms (outlet-swap:large), first paint at 211ms
expect(received).toBeLessThanOrEqual(expected)
Expected: <= 213
Received:    269
```

Fixed by asserting against the *first* `large` swap (what the assumption is actually about), not the
last of possibly several redundant, same-content re-renders. This is a test-methodology fix, not a
product finding for assumption 3a itself, which holds.

### What the prototype does not prove

- Only breakpoint-name queries (`atLeast()`); not named queries, raw media queries, the unknown-name
  development warning, or the focus-on-swap rule (CDK `InteractivityChecker`) -- none of those are
  among this ticket's three numbered questions.
- Whether the `replaced`-before-swap ordering issue also affects a later, ordinary breakpoint change
  (a resize after the app has settled, not tied to the first-render handoff): the reused minimal
  `NfsMediaQuery` only implements the one-time handoff and never re-evaluates afterward (confirmed:
  a `page.setViewportSize` resize after settling produced zero new probe marks), so this case could
  not be exercised. The root-cause analysis suggests it is specific to a signal write originating
  inside a render callback (the handoff is; an ordinary `MediaQueryList` `change` listener is not),
  so a later resize likely orders correctly -- inference, not a measurement.
- The CSR double-construction artifact's actual cause (a second, redundant construction of the whole
  outlet directive on `/csr` only, never on `/ssr`/`/prerendered`, always re-selecting the same
  correct content) was not chased down; recorded as a low-impact scope limit, not a correctness bug.
- Zoneless only; no zone.js consumer was tried. Windows 11 arm64 only, x64 Playwright browsers under
  emulation; no Linux CI, no native macOS WebKit.

### Decision handed to the Interchange spec

1. Assumptions 1 and 2 hold without qualification, in both the primary directive and the `ngDoCheck`
   fallback, in all 3 engines.
2. Assumption 3's timing half holds (proven via Paint Timing on `/csr`, all 3 engines); its
   `replaced`-ordering half does not, in either the primary directive or its documented fallback.
   Trying the fallback does not resolve this, because the fallback only relocates the swap and the
   actual cause is the emission mechanism itself.
3. This hands the Interchange spec's decision 12 (`replaced` timing and payload) and its ARIA focus
   rule (which presumes `replaced` fires after the render) back to the orchestrator to reopen. A
   concrete next step is offered in README.md "Decision handed to the Interchange spec" (unifying the
   swap and the emission inside one client-side `afterRenderEffect`) but was not built or measured
   here -- a design option, not a verified fix.
4. This generalizes beyond Interchange: any future spec that emits an output from `afterRenderEffect`
   in reaction to `NfsMediaQuery.current()` should assume the same race is possible on the
   first-render handoff.

### Triage

- **Item**: which mechanism fixes the `replaced`-ordering finding.
  **Impact: HIGH** -- affects the Interchange spec's decision 12 and ARIA focus rule directly, and by
  construction every future spec (ResponsiveAccordionTabs, ResponsiveMenu, Toggler) that pairs a
  Breakpoint-driven swap with a render-callback-based output or focus move; an API-level choice here
  is hard to reverse once those specs are written against it.
  **Confidence: NOT HIGH** -- the one candidate fix sketched (unify swap and emission in one
  client-side `afterRenderEffect`) is a plausible design, not code that was run; recommending it as
  the applied default would carry an untested value forward.
  **Decision: `OPEN FOR HUMAN`**, routed through the ticket's own stated consequence (reopen
  [Spec: Interchange](35-spec-interchange.md)) rather than a fresh ad hoc question. What is settled,
  high confidence: the finding itself (both mechanisms exhibit the race), by running code in 3
  engines.
- **Item**: the CSR double-construction artifact's root cause.
  **Impact: LOW** -- no visible-content bug (the redundant instance always re-selects the same,
  correct content); only affected test-methodology strictness, already worked around.
  **Decision**: documented as a scope limit, not routed to a human (low impact does not warrant
  reopening anything).

### OPEN FOR HUMAN

One item, per the Triage above: the mechanism that fixes the `replaced`-ordering finding (HIGH
impact, NOT-HIGH confidence in any specific fix). Routed through reopening
[Spec: Interchange](35-spec-interchange.md), scoped to decision 12 and the ARIA focus rule.

Prototype files: [prototypes/interchange-outlet-hydration/README.md](../prototypes/interchange-outlet-hydration/README.md).
Workspace: `D:/tmp/nfs-proto-interchange-outlet-hydration/app`.
