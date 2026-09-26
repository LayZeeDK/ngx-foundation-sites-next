# 62. Prototype: Smooth Scroll under Router scroll restoration and replay

Type: prototype
Status: resolved
Blocked by: 29, 30
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Smooth Scroll](29-spec-smooth-scroll.md) answer. That spec reads from the Angular 22.2 Router source that a native in-page fragment jump fires `popstate`, which the Router answers with a navigation that scrolls to the stored position (`scrollPositionRestoration: 'enabled'`) or to the top (`'top'`), undoing the jump; and that inside a dehydrated block with a container host the replayed click's scroll lands after the Router's. Only running code can confirm both:

1. In a hydrated Router application with `scrollPositionRestoration` set to `'enabled'` and to `'top'`, where does a native in-page jump (a plain `href="#x"` with no directive) end, with and without the `nfs-smooth-scroll` mixin?
2. Inside a dehydrated `@defer (hydrate on interaction)` block with the directive on a container host, when the user clicks a link before hydration, which scroll lands last: the Router's or the replayed click's? Does the link-host form behave differently?

Measure final `scrollY` per case in Chromium, Firefox, and WebKit. If the spec's assumptions hold, its recommendation (put the directive on each link inside deferred regions of Router apps with restoration on) stands and the verdict is appended to its decision log; if they fail, the orchestrator reopens the Smooth Scroll spec. Question 1 decides a reopen of the Smooth Scroll spec, question 3 of the Magellan spec; question 2 refines only.

Read first: `specs/smooth-scroll.md` (the click order and the rendering-modes subsection), `adr/0017-smooth-scroll-click-handling.md`, `building-blocks.md` 1.11 decision 5, `research/angular-rendering-modes.md` sections 4 and 7, the Router's `router_scroller.ts` and `ViewportScroller` in the angular clone, and the resolved [Prototype: Rendering-mode test seam](59-prototype-rendering-mode-test-seam.md) answer for the fixture-app recipe.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a plain Angular CLI 22.2 application with `@angular/ssr` and the Router under `D:/tmp/nfs-proto-smooth-scroll-router/` (Angular 22.2.0, TypeScript 6.0.x), two routes, long pages with in-page anchors, the directive as the spec defines it, and `withInMemoryScrolling` configured per case. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test`, delaying the main bundle with `page.route` for the pre-hydration cases.

Capture it: copy the decisive files into `prototypes/smooth-scroll-router/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence with final scroll positions per engine), exact error text for failures, what the prototype does not prove, the decision it hands to the Smooth Scroll and Magellan specs, and anything left `OPEN FOR HUMAN`.

## Added on 2026-09-26 from the Magellan spec

The [Spec: Magellan](30-spec-magellan.md) answer graduated a third question into this ticket, since it needs the same Router application:

3. In a Router application with `scrollPositionRestoration` set to `'enabled'`, `'top'`, and `'disabled'`, what happens on Back and Forward over Magellan's `deepLinking` entries (`replaceState`) and `updateHistory` entries (`pushState`), and does a `replaceState` entry survive a navigation away and back? The spec assumes `replaceState` is safe in every mode and that `updateHistory` restores wrong positions on Back while the Router's restoration is on, so it documents `updateHistory` for pages without restoration and keeps an e2e guard. Measure the final scroll positions per engine; if the assumption fails, the orchestrator reopens the Magellan spec.

Read also: `specs/magellan.md` (the deep-linking subsection) and `adr/0029-magellan-targets-from-links.md`.

## Answer

### Verdict

All three of the spec's assumptions hold, with one nuance each on questions 2 and 3. A native in-page jump with no directive, in a fully hydrated Router application with `scrollPositionRestoration: 'enabled'` or `'top'`, always ends undone: the click's own `popstate` reaches the Router, which schedules a `Scroll` event and scrolls to `[0, 0]` (there is no stored position for this ad hoc navigation, so `'enabled'` and `'top'` land at the same place here, and the `nfs-smooth-scroll` mixin changes only the path there, not the final rest position), confirming the Smooth Scroll spec's assumption and its recommendation. Inside a `@defer (hydrate on interaction)` block, the native jump before hydration happens immediately in **both** host forms (the early jsaction contract never calls `preventDefault()` before the whole app hydrates, regardless of host); the nuance is that the spec's "the dispatcher has already cancelled the native jump" text describes what the Dispatcher does to the replayed event's `defaultPrevented` flag (unconditionally true for an anchor action element) at *replay* time, not a cancellation of the live pre-hydration click -- the practical, spec-relevant outcome (no error for link host, a logged `preventDefault` error for container host, and the **replayed click's scroll landing last**, after the app's own initial-navigation Scroll event has already resolved to `[0, 0]`) is exactly as the spec assumed. For Magellan, `replaceState` (`deepLinking`) survived every navigation away and back, in all three restoration modes and all three engines. `pushState` (`updateHistory`) restores the **wrong** position under `restoration: 'enabled'` -- consistently the position the reader was at when they pressed Back/Forward, not the target entry's own position, traced to every pushed entry sharing the same `history.state.navigationId` (Magellan passes `history.state` through unchanged, so the Router's per-navigation-id scroll store never has more than one slot). Under `'top'` it is always the page top; under `'disabled'` the browser's own native per-entry scroll restoration gets it right (or very close). This confirms the Magellan spec's assumption exactly and its documented mitigation stands.

A related, empirically confirmed finding not asked for by name but required for the fixture to test the right thing at all: the Smooth Scroll spec's `<base href>` hazard is real (a bare `href="#id"` on a non-root route is a full cross-document reload to `/`), and on a Router app that also carries a query string (as this prototype's `?restoration=` does), a same-path href that omits the query is *also* not same-document and *also* reloads -- the fix in both cases is the spec's own base-href-safe recipe (`pathname + search + '#id'`).

### Results

| # | Case | Result | Evidence (per engine, final scrollY unless noted) |
| --- | --- | --- | --- |
| 1a | Native jump, no directive, `restoration=enabled`, no mixin | Undone: lands at `scrollY=0`, not the target (`~2542px`) | Chromium 0, Firefox 0, WebKit 0 (target `~2542-2544px` in all three) |
| 1b | Same, with `nfs-smooth-scroll` mixin | Same final position (`scrollY=0`); only the path is animated | Chromium 0, Firefox 0, WebKit 0 |
| 1c | Native jump, no directive, `restoration=top`, no/with mixin | Same as 1a/1b: `scrollY=0` in every combination | Chromium 0, Firefox 0, WebKit 0 |
| 1d | Bare `href="#id"` on the non-root route | Cross-document reload to `/`, then a client redirect to `/page-a`, losing the query string | Confirmed in Chromium, Firefox, and WebKit (`document.baseURI` resolves the href to the root, not `/page-a`) |
| 2a | `@defer (hydrate on interaction)`, container host, click before hydration | Native jump happens immediately, pre-hydration; replay re-scrolls (no visible change) then throws on its own `preventDefault()` (logged); **the replayed click's scroll is what is left standing** after the app's own initial Scroll event already resolved to `[0,0]` earlier | Chromium/Firefox/WebKit all land on the target (`~6259-6261px`), all three log the replay error |
| 2b | Same, link host | Native jump also happens immediately (same early-contract behaviour, independent of host form); replay sees `defaultPrevented=true` already set by the Dispatcher and skips its own `preventDefault()`, no error | Chromium/Firefox/WebKit all land on the target (`~9976-9978px`), no error in any engine |
| 3a | `replaceState` (`deepLinking`), Back/Forward, all 3 restoration modes | Only one entry ever exists (each click replaces it): Chromium/WebKit's Back leaves the run entirely (empty fragment); Firefox's Back does not move (nothing before this entry in its fresh-tab history), staying at `#m-s3`. Forward returns to `#m-s3` at `scrollY=0` in Chromium and WebKit (`enabled`/`top`) or the real position (`disabled`); in Firefox, Forward also stays at `#m-s3`, at `scrollY=15000` in every restoration mode | See `prototypes/smooth-scroll-router/logs/3-e2e-annotations.log` lines 44, 48, 52 (chromium), 62, 66, 70 (firefox), 80, 84, 88 (webkit) |
| 3b | `pushState` (`updateHistory`), Back/Forward, `restoration=enabled` | Wrong position every time: both Back presses and the Forward press all land at the section-3 position (`~14994-15000px`), not each entry's own section | log lines 46 (chromium), 64 (firefox), 82 (webkit) |
| 3c | Same, `restoration=top` | Always `scrollY=0` on every Back/Forward, unconditionally, in all 3 engines | log lines 50 (chromium), 68 (firefox), 86 (webkit) |
| 3d | Same, `restoration=disabled` | Engine-dependent: Chromium restores `#m-s2` exactly and `#m-s1` 403 px short; Firefox and WebKit land near 12130 to 12149 px for both entries, about 1600 px from section 2 | log lines 54 (chromium), 72 (firefox), 90 (webkit) |
| 3e | `replaceState` entry survives navigating to Page B and back | Fragment (`#m-s2`) intact on return, in all 3 restoration modes, all 3 engines | log lines 56-60 (chromium), 74-78 (firefox), 92-96 (webkit) |

48/48 Playwright tests passed (Chromium, Firefox, WebKit); full run in `prototypes/smooth-scroll-router/logs/2-e2e-run.log`.

### Exact error text for failures

No test failed in the final run. The one console error the suite is built to surface (case 2a, container host) reads, in Chromium and WebKit in full:

```
`preventDefault` called during event replay. Because event replay occurs after browser dispatch, `preventDefault` would have no effect. You can check whether an event is being replayed by accessing the event phase: `event.eventPhase === EventPhase.REPLAY`.
```

Firefox logs the same condition with a shorter console message (`ERROR Error`, no expanded text). No other case in the 48-test suite logged a console error. (One transient timing flake was found and fixed during development, not a product failure: `waitForScrollSettled`'s original poll window occasionally read a mid-animation plateau as settled when the mixin made a native jump CSS-smooth; the helper's stability window was widened and the retest was clean.)

### What the prototype does not prove

- Only this machine's engines under Playwright automation for scroll timing; real user-timed clicks were not exercised.
- `reducedMotion` is out of scope here (the real spec already settles it); the prototype directive always requests `'smooth'`.
- Only one Router app shape (one non-root route, one query-string-selected restoration mode, one `@defer (hydrate on interaction)` block per host form, one Magellan-lite container). Nested outlets, guards, and resolvers were not exercised.
- Whether a `pushState` recipe exists that gives each entry a distinct `navigationId` (and so restores the correct position under `restoration: 'enabled'`) was not searched for: Magellan's own contract requires passing `history.state` through unchanged, so this is not an available fix within the directive as specified; the "wrong position" is inherent to composing raw `pushState` with the Router's restoration, not a bug in this prototype's `NfsMagellanLite`.
- Why the Page B round trip (case 3e) always measured `scrollY=0` on return, in every engine and every restoration mode, rather than the browser's native restoration recalling the pre-departure position (as it did for the plain `pushState` entries in case 3d), was not run to ground; the most likely explanation is that returning to `/page-a` recreates the `PageA` component from scratch (a real route match, not just a fragment change), which starts unscrolled. Nothing in Magellan's `deepLinking` contract depends on the scroll position surviving that round trip, only the URL fragment, which did survive in every case.
- Windows 11 ARM64 only, Playwright's bundled x64 browsers under emulation. No Linux CI, no native ARM64 browser builds, no macOS Safari.

### Decision handed to the specs

- **Smooth Scroll spec** (`specs/smooth-scroll.md`, `adr/0017-smooth-scroll-click-handling.md`): the assumption holds as written; its Comparison rule 3 and the ADR's documented consequence (a replayed click's `preventDefault()` logs an error for the container host) are both confirmed. Correction to record against the spec text: "the dispatcher has already cancelled the native jump ... before the replayed click reaches the handler" describes the Dispatcher's own bookkeeping on the replayed event's `defaultPrevented` flag for an anchor action element, not a cancellation of the native jump the first time it happens (that native jump always proceeds live, in both host forms, before the whole app hydrates). The outcome the spec's design decisions actually depend on (no error for link host, error accepted for container host, replayed scroll wins) is unchanged and confirmed; no spec text needs to change, only this footnote for future readers.
- **Magellan spec** (`specs/magellan.md`, `adr/0029-magellan-targets-from-links.md`): the assumption holds exactly as stated. `replaceState` is safe in every restoration mode (confirmed via the Page B round trip). `updateHistory` restores the wrong position under Router scroll restoration (confirmed, with the mechanism traced to the shared `navigationId`), so the spec's existing rule -- document `updateHistory` for pages without restoration, keep an e2e guard -- stands unchanged.

### Triage

Nothing from this prototype needs an `OPEN FOR HUMAN` entry. Impact/confidence per the two loose threads under "what the prototype does not prove": (1) the exact `pushState`/`navigationId` mechanism -- impact not HIGH (it changes no recommendation; Magellan already tells consumers not to combine `updateHistory` with restoration) and confidence HIGH (the mechanism is traced to specific, cited Router source, not a bare default); (2) the Page B round-trip's `scrollY=0` -- impact not HIGH (scroll position on that round trip is outside Magellan's `deepLinking` contract, which promises the URL, not the scroll position) and confidence not HIGH (the explanation is plausible, not verified against source). Both stay recorded as unresolved observations rather than carried forward as settled, per the map's rule that only HIGH-impact-with-NOT-HIGH-confidence items stay `OPEN FOR HUMAN`; neither qualifies since neither is HIGH impact.

### OPEN FOR HUMAN

None.

Prototype files: [prototypes/smooth-scroll-router/README.md](../prototypes/smooth-scroll-router/README.md). Workspace: `D:/tmp/nfs-proto-smooth-scroll-router/`.
