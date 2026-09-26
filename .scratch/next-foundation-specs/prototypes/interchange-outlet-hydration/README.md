# Prototype: Interchange template outlet under hydration

Ticket: [Prototype: Interchange template outlet under hydration](../../issues/61-prototype-interchange-outlet-hydration.md).

## Question

Graduated from [Spec: Interchange](../../specs/interchange.md) / [ADR
0015](../../adr/0015-interchange-no-image-or-partial-mode.md). The spec assumes an outlet directive
on `ng-container[nfsInterchange]`, which creates the matching rule's embedded view from a
`ViewContainerRef` inside an `effect()`, does three things correctly:

1. It renders the Server breakpoint's template into the server HTML.
2. That view is claimed at hydration with no NG05xx error and `componentsSkippedHydration === 0`.
3. It swaps to the live breakpoint's template in the same tick as the Breakpoint service's
   first-render handoff, in client-rendered, server-rendered, and `@defer (hydrate on viewport)`
   cases, and the `replaced` output fires after that render.

If any of the three fails, the spec's stated fallback applies (the swap moves to `ngDoCheck` with no
API change) and the orchestrator reopens the Interchange spec.

## What is here

The decisive files only (a full Angular CLI 22.2.0 `--ssr` application extending the [Prototype:
Breakpoint handoff under hydration](../../issues/60-prototype-breakpoint-handoff-hydration.md)'s
workspace). The runnable workspace, including `node_modules`, the build output, and the Playwright
browser cache, stays at `D:/tmp/nfs-proto-interchange-outlet-hydration/app` and is not committed.

- `src/app/media-query/nfs-breakpoints-token.ts`, `nfs-media-query.ts` -- unchanged from the
  breakpoint handoff prototype's minimal `NfsMediaQuery` (`current`, `atLeast()`, the
  `TransferState` round trip, the `afterNextRender({earlyRead})` handoff switch).
- `src/app/render-probe.ts` -- unchanged probe helper (`window.__nfsProbe`).
- `src/app/interchange/nfs-interchange-outlet.ts` -- the primary `NfsInterchangeOutlet`: an
  `effect()` compares the selected rule's `TemplateRef` with the one currently rendered and swaps
  the `ViewContainerRef`'s content when it differs (runs on the server too, per the spec); a
  separate `afterRenderEffect()` emits `replaced` (never runs on the server). Carries the
  `outlet-ctor`/`outlet-effect-run` diagnostic probe marks added while investigating the CSR
  double-construction finding below -- left in because they are the evidence for that finding, not
  because the design needs them.
- `src/app/interchange/nfs-interchange-outlet-docheck.ts` -- the spec's stated fallback:
  `NfsInterchangeOutletDoCheck`, identical public API (`nfsInterchangeDoCheck` alias, `replaced`),
  but the swap moves from `effect()` to `ngDoCheck()`; `replaced` still emits from
  `afterRenderEffect()`, unchanged (the spec's fallback note only moves the swap, not the emission).
- `src/app/interchange-page/interchange-page.ts` -- the main test page (reused at `/csr`, `/ssr`,
  `/prerendered`): the primary outlet with two rule templates (`small` = the Zero breakpoint,
  `large` = large-and-up), a `replaced` log, a synchronous DOM check in the `replaced` handler (see
  below), and a `@defer (hydrate on viewport)` block holding its own outlet instance.
- `src/app/interchange-deferred-box/interchange-deferred-box.ts` -- its own component (not inlined)
  so the `@defer` block produces a real lazy chunk, per the rendering-mode-test-seam prototype's
  finding.
- `src/app/interchange-page-fallback/interchange-page-fallback.ts` -- the same shape, using the
  `ngDoCheck` fallback directive, reused at `/csr-fallback`, `/ssr-fallback`, `/prerendered-fallback`.
- `src/app/app.routes.ts` / `app.routes.server.ts` -- six routes: the three `RenderMode`s
  (`Client`, `Server`, `Prerender`) x two directive implementations.
- `src/app/app.config.server.ts` -- unchanged from the breakpoint handoff prototype (the `?bp=`
  per-request Server breakpoint recipe is not exercised by this ticket's cases; left in place
  because removing it would touch a file this prototype otherwise reuses verbatim).
- `e2e/interchange-outlet.spec.ts` + `e2e/helpers.ts` -- the Playwright tests (below).
- `playwright.config.ts` -- three projects (chromium, firefox, webkit), 1300 px viewport, port 4631
  (inside the reserved 4630-4639 range), no `webServer` (started by hand).
- `package.json` -- exact dependency versions used (same as the breakpoint handoff prototype).

## How to run

```
cd D:/tmp/nfs-proto-interchange-outlet-hydration/app
npx ng build --configuration development
PORT=4631 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs
# in another shell:
npx playwright test                       # all three engines
npx playwright test --project=chromium    # or firefox / webkit
```

`--configuration development` and `NG_ALLOWED_HOSTS` are required for the same reasons the
breakpoint handoff prototype's README states (dev build for `ngDevMode` hydration stats;
`@angular/ssr`'s host check otherwise rejects `localhost`).

## Versions

Angular CLI 22.2.0, `@angular/core`/`cdk`/`ssr` `^22.2.0`, TypeScript `~6.0.2`, `@playwright/test`
`^1.63.0`. Dependencies were freshly `npm install`ed into the new workspace directory rather than
copied from the breakpoint handoff prototype's `node_modules` (avoids the reparse-point risk of
bulk-copying a Node tree); `npm rebuild esbuild @parcel/watcher lmdb msgpackr-extract` was needed
once to run the install scripts this machine's `allow-scripts` policy holds back by default.

## Results

Viewport is 1300 px (`playwright.config.ts`), which resolves to `atLeast('large')` (>= 64em / 1024px)
in the default Breakpoint map, so the outlet's `large` rule template is the live-viewport answer
everywhere, and `small` (the Zero breakpoint) is the Server breakpoint's answer. 42 of 42 Playwright
tests pass (14 tests x 3 engines).

| # | Case | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `/ssr`, `/prerendered`: server HTML carries the small rule's template, not the large one's; the `replaced` output never fires on the server | Yes, both routes, both directive mechanisms (primary and `ngDoCheck` fallback) | Server HTML (`curl`/`request.get`) contains `data-testid="interchange-small"`, not `interchange-large`; `replaced-log` is empty (`<!--ngetn-->`, Angular's empty-text-node marker) |
| 2 | `/ssr`, `/prerendered`: hydration claims the view with no NG05xx, `componentsSkippedHydration === 0`, then swaps to the large template | Yes, both routes, both mechanisms | `ngDevMode.componentsSkippedHydration === 0`, `hydratedComponents > 0`, no NG0[5-9]xx console error, final DOM shows only `interchange-large` |
| 3a | `/csr`: the swap to `large` lands at or before first paint (Paint Timing probe, same method as the breakpoint handoff prototype) | Yes, in all 3 engines | Chromium, Firefox, WebKit: the first `outlet-swap:large` mark's timestamp is at or before the first Paint Timing entry (2ms slack); final DOM shows only `interchange-large` |
| 3b | `/ssr`, `/prerendered`: `@defer (hydrate on viewport)` block hydrates into the live (`large`) template after scrolling into view, no NG05xx | Yes, both routes, all 3 engines | `defer-interchange-large` visible after `scrollIntoViewIfNeeded()`, `defer-interchange-small` count 0, `defer-replaced-log` ends `large` |
| 3c | `/csr`, `/ssr`, `/prerendered`: `replaced` fires and its log ends with `large` | Yes, all routes, all 3 engines | `replaced-log` text ends `/large$/` |
| -- | **Finding**: does `replaced` fire strictly *after* the DOM shows the rule it reports, for the swap driven by the Breakpoint service's own first-render handoff? | **No**, in both the primary and the `ngDoCheck` fallback mechanisms, in all 3 engines | See "What went wrong" below |

## What went wrong

The three numbered assumptions hold with one specific exception inside assumption 3: **on the swap
driven by the Breakpoint service's own first-render handoff (ADR 0014), `replaced` can fire a few
milliseconds *before* the DOM actually shows the rule it reports**, not after. This is not a timing
fluke; it reproduces on every run, in every engine, and in *both* the primary directive (`effect()`
swap) and the spec's own documented fallback (`ngDoCheck()` swap) -- the fallback does not fix it,
because the fallback only changes which mechanism performs the swap, and the actual cause is
independent of that choice.

Direct evidence (not just timestamp comparison, which could be argued as measurement noise at the
1-3ms scale involved): each page's `(replaced)` handler synchronously queries
`document.querySelector('[data-testid=interchange-<rule>]')` for the rule `replaced` just reported,
at the exact moment the handler runs, and records `replaced-dom-check:<rule>:shown|NOT-SHOWN`. On
`/csr` and `/csr-fallback`, in all 3 engines, this is always `replaced-dom-check:large:NOT-SHOWN` --
the handler is told "large" is now shown while `document.querySelector` proves it is not yet in the
DOM.

Root cause, read from a raw probe capture (Chromium, primary directive, `/csr`; timestamps in ms):

```
mq-live-before-set:  182.2
mq-live-after-set:   182.4
replaced:large:      182.7   <- replaced fires here
replaced-dom-check:  183.1   <- and confirms: DOM does NOT show 'large' yet
outlet-effect-run:2: 183.8   <- the swap's own effect only reruns here
outlet-swap:large:   184.8   <- ...and only NOW does the DOM actually show 'large'
```

The Breakpoint service's `current.set(live)` write happens *inside* a render callback
(`afterNextRender({earlyRead})`, per ADR 0014). The outlet's `afterRenderEffect()` (which emits
`replaced`) is *also* a render callback, registered to react to the same signal; when both fall into
the same after-render hook batch (`ApplicationRef.synchronize()`'s "run hooks, loop while dirty"
cycle, per `specs/breakpoint-service.md`'s own description of that loop), the `afterRenderEffect`
can observe the just-written signal and fire within that same batch. The swap itself -- whether a
plain `effect()` or `ngDoCheck()` -- needs a full change-detection pass to actually run, which the
loop only performs in its *next* iteration, after the current hook batch finishes. So the
render-callback-based emission "wins the race" against the change-detection-based swap whenever the
triggering signal write itself originates inside a render callback -- which is exactly what the
Breakpoint service's first-render handoff is. This is a mechanism-independent finding: it would
affect any directive that emits an output from `afterRenderEffect` in reaction to
`NfsMediaQuery.current()`, not only Interchange's outlet, though this prototype only measured
Interchange's outlet.

What this does *not* affect: the timing assertion for "no wrong frame is ever painted" still holds
(case 3a passes in all 3 engines) -- the *swap itself* always lands before first paint, so a user
never sees the small template when the viewport is large. Only the *ordering guarantee for
`replaced`* ("fires after the render," spec decision 12; the ARIA focus rule's "before `replaced` is
emitted" wording, which presumes the render already happened) is what fails.

### A second, unrelated finding: CSR double-construction

Investigating the above surfaced a second thing, independent of Interchange's design: on `/csr`
(`RenderMode.Client`) only -- never on `/ssr` or `/prerendered` -- the whole `NfsInterchangeOutlet`
directive instance is constructed a second time a few tens of milliseconds after the first pass
settles (`outlet-ctor:1` then `outlet-ctor:2` in the probe, with the parent `InterchangePage`
component itself constructed only once). The second instance immediately re-selects `large` (since
`NfsMediaQuery` is a singleton already live by then), so nothing incorrect is ever shown on screen --
it is a redundant extra render, not a correctness bug, but it did make a naive "the LAST swap must
land before first paint" test assertion fail in Firefox (the second, redundant swap landed at 269 ms
against a 211 ms first paint). The tests here assert against the *first* `large` swap instead, which
is what the assumption is actually about. The cause was not chased further (out of this ticket's
three numbered questions; most likely an `@angular/ssr` CSR-shell-plus-Router interaction, since the
served `index.csr.html` for a `RenderMode.Client` route carries no route-specific content at all)
-- recorded as a scope limit below, not resolved here.

## Exact error text for failures

None -- every Playwright assertion in the final run passes (42/42); the "finding" tests assert the
actual (surprising) `NOT-SHOWN` outcome so a future change to either mechanism would be caught, not
a desired outcome.

## What this prototype does not prove

- Only a two-rule outlet (`small` vs. `large`) with breakpoint-name queries resolved through
  `atLeast()`; not named queries, raw media queries, the unknown-name development warning, or the
  focus-on-swap rule (CDK `InteractivityChecker`) that `specs/interchange.md`'s ARIA table also
  assigns to the outlet -- none of those are among this ticket's three numbered questions.
- Whether the `replaced`-before-swap ordering issue also affects a *later* breakpoint change (an
  ordinary resize after the app has settled, not tied to the Breakpoint service's first-render
  handoff): the minimal `NfsMediaQuery` reused from the breakpoint handoff prototype only implements
  the one-time `afterNextRender` handoff and never re-evaluates afterward (confirmed empirically: a
  `page.setViewportSize` resize after settling produced zero new probe marks), so this prototype
  cannot exercise that case. The root-cause analysis above suggests the ordering bug is specific to
  a signal write that originates *inside* a render callback (which the first-render handoff is, and
  an ordinary `MediaQueryList` `change` listener is not), so a later resize likely orders correctly
  -- but this is inference, not a measurement.
- The CSR double-construction finding's actual cause (router/CSR-shell interaction, a generic
  `@angular/ssr` behavior, or something else) was not chased down.
- Zoneless only (the Angular CLI 22.2.0 `--ssr` default); no zone.js consumer was tried.
- Windows 11 arm64 only, with the shared Playwright browser cache under x64 emulation; no Linux CI,
  no native macOS WebKit.
- The focus rule's own interaction with the `replaced`-ordering finding (does a focus-move driven by
  `replaced`'s handler also act on stale DOM?) was not built or tested; the focus rule itself is out
  of this prototype's scope.

## Decision handed to the Interchange spec

1. **Assumptions 1 and 2 hold without qualification**, in both the primary directive and the
   `ngDoCheck` fallback, in all 3 engines: server HTML carries the Server breakpoint's template
   (background mode's server-HTML case is analogous and was not re-tested, since it uses the same
   `NfsMediaQuery.atLeast()` resolution and a host binding rather than a `ViewContainerRef`, a
   simpler case than the outlet); hydration claims it cleanly with no NG05xx and
   `componentsSkippedHydration === 0`.
2. **Assumption 3's timing half holds** ("swaps to the live breakpoint's template in the same tick as
   the handoff," proven via Paint Timing in all 3 engines on `/csr`) but **its `replaced`-ordering
   half does not**: `replaced` can fire before the DOM shows the rule it reports, specifically for
   the swap driven by the Breakpoint service's first-render handoff. Trying the spec's stated
   `ngDoCheck` fallback (decision table row 11) does **not** fix this, because the fallback only
   relocates the swap, and the actual cause is the emission mechanism (`afterRenderEffect`) racing
   ahead of *any* change-detection-driven swap when the triggering write originates inside another
   render callback.
3. Per the ticket's own stated consequence, this hands the Interchange spec (and specifically
   decision 12, "`replaced` timing and payload," and the ARIA focus rule that depends on `replaced`
   firing after the render) back to the orchestrator to reopen. A concrete next step for that
   reopening, offered here rather than decided (implementing and validating it is more design work
   than this prototype's three questions call for): perform the swap *and* the emission inside the
   *same* `afterRenderEffect` on the client (so the two statements execute in one synchronous
   function body, which cannot race with itself), while keeping a plain `effect()` (or `ngDoCheck`)
   doing the swap alone for the very first pass that must reach server HTML (since `afterRenderEffect`
   never runs on the server). This was not built or measured here; it is a design option, not a
   verified fix.
4. This also generalizes beyond Interchange: any future spec (Toggler, ResponsiveAccordionTabs,
   ResponsiveMenu) that emits an output from `afterRenderEffect` in reaction to
   `NfsMediaQuery.current()` should assume the same race is possible on the first-render handoff,
   not just assume "render callbacks run after change detection" settles the ordering.

### Triage

- **Item**: whether the `replaced`-ordering fix (unify swap+emit in one `afterRenderEffect`, versus
  some other mechanism) is decided now or left for a follow-up design pass.
  **Impact: HIGH** (the outcome is a shared building-block pattern: it affects the Interchange
  spec's decision 12 and ARIA focus rule directly, and by extension every future spec that pairs a
  Breakpoint-driven swap with a render-callback-based output/focus-move -- ResponsiveAccordionTabs
  and ResponsiveMenu inherit whichever pattern gets picked, and an API-level choice here is hard to
  reverse once those specs are written against it).
  **Confidence: NOT HIGH on any specific fix** -- the "unify swap+emit in one `afterRenderEffect`"
  option above is a plausible design sketch, not code I ran, so recommending it as the applied
  default here would be carrying an untested value forward, exactly what the triage rule flags.
  **Decision: left `OPEN FOR HUMAN`** (via the ticket's own stated consequence -- "the orchestrator
  reopens the Interchange spec" -- which already routes this to the map's normal grilling/to-spec
  process rather than a bare default). What is NOT open: the finding itself (that the current design
  and its documented fallback both exhibit the race) is settled by running code in 3 engines, high
  confidence; only the *fix* is undecided.
- **Item**: the CSR double-construction artifact's root cause.
  **Impact: LOW** (no visible-content bug -- the second instance always re-selects the same, correct
  content; it only affects test-methodology strictness, already worked around here by asserting on
  the *first* correct swap rather than the last). **Confidence: N/A, not decided** -- recorded as a
  scope limit ("What this prototype does not prove"), not routed to a human, per the triage rule's
  "every other item is decided" (here, "decided" = documented and not chased further, since low
  impact does not warrant the reopened-spec treatment).

## OPEN FOR HUMAN

Settled: see the [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../../issues/67-rerun-interchange-replaced-timing.md), which decided the mechanism (the rendered-rule handoff), verified in code in three engines. As this ticket left it: none beyond the single HIGH-impact/NOT-HIGH-confidence item under Triage above (the `replaced`-ordering
fix's mechanism), which the ticket's own stated consequence already routes to reopening
[Spec: Interchange](../../issues/35-spec-interchange.md), not to a fresh ad hoc human question.

Prototype files: this directory. Workspace: `D:/tmp/nfs-proto-interchange-outlet-hydration/app`.
