# Prototype: Breakpoint handoff under hydration

Ticket: [Prototype: Breakpoint handoff under hydration](../../issues/60-prototype-breakpoint-handoff-hydration.md).

## Question

Graduated from [Spec: Breakpoint service (shared utility)](../../specs/breakpoint-service.md) /
[ADR 0014](../../adr/0014-breakpoint-service-first-render-handoff.md). Three things that ADR 0014
assumes from reading Angular source, checked here with running code:

1. A client-rendered application never paints a frame of the Server breakpoint's layout: the
   service keeps the Server breakpoint until its first `afterNextRender` `earlyRead` callback and
   switches to the live viewport within the same tick, before the browser paints.
2. Full hydration at 1300 px of a page the server rendered at the Server breakpoint (`small`)
   rebuilds a breakpoint-dependent `@if` branch with no NG05xx hydration error and
   `componentsSkippedHydration === 0`.
3. A `@defer (hydrate on viewport)` block that hydrates after the switch rebuilds its
   breakpoint-dependent branch without errors.

Plus what a per-request Server breakpoint (a `?bp=large` query parameter standing in for a client
hint) does to the same three cases through `TransferState`.

## What is here

The decisive files only (a full Angular CLI 22.2.0 `--ssr` application). The runnable workspace,
including `node_modules`, the build output, and the Playwright browser cache, stays at
`D:/tmp/nfs-proto-breakpoint-handoff-hydration/app` and is not committed.

- `src/app/media-query/nfs-breakpoints-token.ts` -- the minimal `nfsBreakpointsToken` (Foundation's
  default map, `serverBreakpoint` defaulting to `small`) and `nfsBreakpointForWidth`.
- `src/app/media-query/nfs-media-query.ts` -- the minimal `NfsMediaQuery`: CDK `MediaMatcher`, the
  `TransferState` round trip (read the transferred or token-default Server breakpoint, write it back
  symmetrically), and the constructor's `afterNextRender({earlyRead: () => this.#goLive()})` switch.
  Only `current` and `atLeast()` are implemented -- no `reducedMotion`, `is`/`upTo`/`only`/`resolve`,
  rule parsing, or the dev-mode drift check, none of which this question depends on.
- `src/app/render-probe.ts` -- records `(label, performance.now(), body.innerHTML?)` entries on
  `window.__nfsProbe`, read back by Playwright after the fact (see "How the timing case is proved"
  below).
- `src/app/breakpoint-page/breakpoint-page.ts` -- the page: `current`, a breakpoint-dependent `@if`
  (`atLeast('large')`), a 1600px spacer, and a `@defer (hydrate on viewport)` block with the same
  `@if` inside `DeferredBox`.
- `src/app/deferred-box/deferred-box.ts` -- its own component (not inlined) so the `@defer` block
  produces a real lazy chunk (the rendering-mode-test-seam prototype's finding: a component used both
  inside and outside `@defer` in one file is eager).
- `src/app/app.routes.ts` / `app.routes.server.ts` -- `/csr` is `RenderMode.Client`, `/ssr` is
  `RenderMode.Server`, `/prerendered` is `RenderMode.Prerender`; all three route the same
  `BreakpointPage`.
- `src/app/app.config.server.ts` -- the per-request Server breakpoint recipe: a `useFactory` provider
  reading `REQUEST` and a `?bp=` query parameter (the client-hint stand-in), falling back to `small`
  when absent or while prerendering (`REQUEST` is `null`).
- `e2e/breakpoint-handoff.spec.ts` + `e2e/helpers.ts` -- the Playwright tests (below).
- `playwright.config.ts` -- three projects (chromium, firefox, webkit), 1300 px viewport, no
  `webServer` (started by hand; see below).
- `package.json` -- exact dependency versions used (see "Versions").

## How to run

```
cd D:/tmp/nfs-proto-breakpoint-handoff-hydration/app
npx ng build --configuration development
PORT=4602 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs
# in another shell:
npx playwright test                       # all three engines
npx playwright test --project=chromium    # or firefox / webkit
```

`--configuration development` is required, not just preferred: a production build defines
`ngDevMode` as `false`, so `window.ngDevMode.hydratedComponents` /
`componentsSkippedHydration` do not exist there (the resolved [Prototype: Rendering-mode test
seam](../../issues/59-prototype-rendering-mode-test-seam.md) hit the same requirement). `NG_ALLOWED_HOSTS`
is required: `@angular/ssr`'s request handler rejects the `Host` header otherwise, even for
`localhost` (the animate-enter-hydration prototype's finding, confirmed again here).

## Versions

Angular CLI 22.2.0, `@angular/core`/`cdk`/`ssr` `^22.2.0`, TypeScript `~6.0.2` (all as the generator
produced them; nothing needed pinning back), `@playwright/test` 1.63.0 (added; Chromium 1243, Firefox
1543, WebKit 2359 already present in the shared `ms-playwright` cache from earlier prototypes on this
machine).

## How the timing case (1) is proved

`NfsMediaQuery`'s constructor marks `mq-ctor`; its `#goLive()` marks `mq-live-before-set` and
`mq-live-after-set` around the signal write, all through `render-probe.ts` onto
`window.__nfsProbe`. The Playwright test reads that array plus
`performance.getEntriesByType('paint')` after the page settles, and asserts
`mq-live-after-set`'s timestamp is at or before the first Paint Timing entry's `startTime`. This
does not "watch" the paint happen (Playwright's navigation only resolves after the page has
settled, well after the synchronous switch); it uses the browser's own Paint Timing API, recorded
independently of the test's later read, to establish that the live breakpoint was already current
before the first pixel reached the screen -- so no earlier paint could have shown anything else.

## Results

| # | Case | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `/csr` (`RenderMode.Client`) at 1300 px: does a client-rendered app ever paint the Server breakpoint? | No. `mq-live-after-set` lands at or before the first Paint Timing entry in all three engines; final DOM shows only `branch-large` (`current` = `xlarge`), `branch-small` count is 0 | Chromium: switch 179ms, first-paint 192ms (13ms margin). Firefox: switch 466ms, first-contentful-paint 473ms (7ms). WebKit: switch 251ms, first-contentful-paint 256ms (5ms). `npx playwright test --project=<engine>` |
| 2 | `/ssr` (server breakpoint `small`) at 1300 px: does full hydration rebuild the `@if` branch cleanly? | Yes. Server HTML shows `branch-small`/`current="small"` (confirmed by `curl`); after hydration the page shows `branch-large`/`current="xlarge"`, `componentsSkippedHydration === 0`, `hydratedComponents === 2`, no NG05xx in the console | `hydratedComponents:2, componentsSkippedHydration:0` (Chromium); all 3 engines pass the Playwright assertions |
| 3 | `/prerendered` (`RenderMode.Prerender`, build-time SSR, `REQUEST` null) at 1300 px: same as case 2 for a prerendered route | Yes, identical outcome to case 2 | Same stats and assertions, `/prerendered` route |
| 4 | `/ssr?bp=large`: a per-request Server breakpoint chosen from a query parameter (client-hint stand-in), carried to the client through `TransferState` | Server renders `branch-large`/`current="large"` already (`nfsServerBreakpoint":"large"` in the `ng-state` script, confirmed by `curl`); hydration still succeeds (`componentsSkippedHydration === 0`, no NG05xx) and the printed name advances from `large` to the live `xlarge` with **no branch rebuild** this time, because `atLeast('large')` was already true | `curl` capture + Playwright assertions, all 3 engines |
| 5 | `/ssr` and `/prerendered`: does `@defer (hydrate on viewport)` scrolled into view after the switch rebuild its own `@if` branch? | Yes. Before scroll the block's server-rendered content is present (`hydrate on viewport` renders the main template on the server, not a placeholder); after `scrollIntoViewIfNeeded()` it hydrates and shows `defer-branch-large` / `defer-current="xlarge"`, no NG05xx | `npx playwright test`, both routes, all 3 engines |

All 18 tests (6 cases x 3 engines) pass: `18 passed (18.1s)` on this machine (Windows 11 arm64).

## Exact error text for failures

None in the final run. One transient failure while developing the test, not a product finding:
in WebKit, reading `window.__nfsProbe` immediately after the Playwright `load` event sometimes ran
before `NfsMediaQuery`'s `afterNextRender` callback had fired at all (`load` can resolve before
Angular's bootstrap reaches its first render callback), producing:

```
Error: probe: [{"label":"mq-ctor","at":191},{"label":"page-ctor","at":194,"bodyHtml":"..."}]
expect(received).toBeTruthy()
Received: undefined
```

Fixed by polling for the `mq-live-after-set` mark (`page.waitForFunction`) before reading the probe,
rather than reading it right after `load`. This changes only how long the test waits, not what the
timing assertion checks (the ordering of `mq-live-after-set` against the first Paint Timing entry).

## What this prototype does not prove

- Only a two-branch `@if` (`small` vs. `large and up`) and a single `atLeast()` predicate; not the
  full `NfsMediaQuery` surface (`is`/`upTo`/`only`/`resolve`, rule parsing, `reducedMotion`,
  `matches()`, the dev-mode drift check) -- none of those change the render-timing questions this
  ticket asks.
- Only one breakpoint-gated `@if` per page and one `@defer (hydrate on viewport)` block; not a
  composite widget with a trigger and target in separate hydration boundaries, and not any other
  `hydrate on ...` trigger (`interaction`, `hover`, `idle`, `timer`, `when`, `never`).
- The `?bp=` query parameter stands in for `Sec-CH-Viewport-Width`; the real header-based recipe in
  `specs/breakpoint-service.md` was not exercised, only that a per-request `useFactory` provider
  reading `REQUEST` and writing a different Server breakpoint round-trips correctly through
  `TransferState`.
- Zoneless only (the Angular CLI 22.2.0 `--ssr` default); no zone.js consumer was tried, though
  ADR 0014 and the rendering-modes research treat the render-callback ordering as zone-independent.
- Only Windows 11 arm64 with the shared Playwright browser cache (Chromium 1243, Firefox 1543,
  WebKit 2359 under x64 emulation). No Linux CI run and no native macOS WebKit.
- The Paint Timing API comparison is the strongest available proof without a video capture at very
  high frame rate; it is an inference from two independently-timestamped browser facts (the
  `performance.now()` mark and the Paint Timing entry), not a recording of the screen itself.

## Decision handed to the Breakpoint service spec, ResponsiveAccordionTabs, and ResponsiveMenu

All three of ADR 0014's assumptions hold, in Chromium, Firefox, and WebKit alike, so **no change is
needed** to ADR 0014, `specs/breakpoint-service.md`'s rendering-modes subsection, or the decision
[Spec: Breakpoint service (shared utility)](../../issues/53-spec-breakpoint-service.md) already
recorded:

1. **A client-rendered app never paints the Server breakpoint's layout.** The Breakpoint service
   spec's decision 9 ("Client before live: the Server breakpoint until the first `earlyRead`
   callback, then live in the same tick") is confirmed as written; ResponsiveAccordionTabs and
   ResponsiveMenu specs do not need a loading placeholder or a flash guard for the plain
   client-rendered case.
2. **Full hydration rebuilds a breakpoint-dependent `@if` branch cleanly**, matching
   `research/angular-rendering-modes.md` section 2's "a branch that differs between server and
   client is therefore not an error, only a re-render at that spot." ResponsiveAccordionTabs (which
   the rendering-modes checklist already flags as "expect a re-render at hydration on non-default
   breakpoints") can rely on that re-render being silent and side-effect-free; it still owns stating
   its own focus-preservation rule across that rebuild (not tested here -- this prototype's page has
   no focusable content in the swapped branches).
3. **`@defer (hydrate on viewport)` hydrates after the switch into the live branch**, confirming
   building-blocks 1.11 decision 6's "the block's classes are rewritten or its branch rebuilt during
   the block's hydration render" for the `viewport` trigger specifically (previously confirmed for
   `interaction` only, by the rendering-mode-test-seam prototype).
4. **A per-request Server breakpoint round-trips through `TransferState` without weakening any of
   the above**: hydration still succeeds and the client still ends up at the live breakpoint,
   whether or not the server's per-request choice matches the live viewport. When it already
   matches (as in the `bp=large` case at a 1300 px viewport, both `atLeast('large')`), only the
   printed breakpoint name changes at the switch, with no branch rebuild -- a smaller-scale
   confirmation of the same mechanism, not a new one.

No spec text needs to change. This README is the citable evidence for
`specs/breakpoint-service.md`'s decision log entry for this prototype.

## OPEN FOR HUMAN

None. Every point the ticket asked for was settled by running code in three engines. The items
under "What this prototype does not prove" are scope limits (a smaller prototype answering a
narrower question than the full service), not open questions this prototype could not settle.

Prototype files: this directory. Workspace: `D:/tmp/nfs-proto-breakpoint-handoff-hydration/app`.
