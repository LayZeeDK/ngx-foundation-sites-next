# Prototype: Smooth Scroll under Router scroll restoration and replay

Ticket: [Prototype: Smooth Scroll under Router scroll restoration and replay](../../issues/62-prototype-smooth-scroll-router-restoration.md).

## Question

1. In a hydrated Router application with `scrollPositionRestoration` set to `'enabled'` and to `'top'`, where does a native in-page jump (a plain `href="#x"` with no directive) end, with and without the `nfs-smooth-scroll` mixin?
2. Inside a dehydrated `@defer (hydrate on interaction)` block with the directive on a container host, when the user clicks a link before hydration, which scroll lands last: the Router's or the replayed click's? Does the link-host form behave differently?
3. In a Router application with `scrollPositionRestoration` set to `'enabled'`, `'top'`, and `'disabled'`, what happens on Back and Forward over Magellan's `deepLinking` entries (`replaceState`) and `updateHistory` entries (`pushState`), and does a `replaceState` entry survive a navigation away and back?

This is a technical spike (the map's AFK override), a runnable Angular CLI application under `D:/tmp/nfs-proto-smooth-scroll-router/` (the actual on-disk name is `smooth-scroll-router`; the path the ticket names is used for the workspace root), driven by `@playwright/test` in Chromium, Firefox, and WebKit.

## Verdict

**All three of the spec's assumptions hold, with one nuance on question 2 and one on question 3.**

1. A native in-page jump with no directive, in a fully hydrated Router application with `scrollPositionRestoration: 'enabled'` or `'top'`, always ends undone: the click's own `popstate` reaches the Router, which schedules a `Scroll` event and calls `viewportScroller.scrollToPosition([0, 0])` (there is no stored position for this ad hoc navigation, so `'enabled'` and `'top'` land at the same place here). The `nfs-smooth-scroll` mixin changes nothing about the *final* resting position, only how the page gets there. This confirms the Smooth Scroll spec's assumption and its recommendation (put the directive on in-page links in Router apps with restoration on) stands.
2. Inside a `@defer (hydrate on interaction)` block, clicking a link before hydration produces a native jump immediately in **both** host forms -- the early jsaction contract never calls `preventDefault()` before the whole app hydrates, regardless of whether the action element is the container or the link itself. The nuance: the Smooth Scroll spec's text ("the dispatcher has already cancelled the native jump ... before the replayed click reaches the handler") describes the *replay* dispatch, not the live pre-hydration click. What actually happens is: the Dispatcher, when it later replays the queued click to the real listener, unconditionally sets `defaultPrevented = true` on it first when the action element is an `<a>` (link host) -- a bookkeeping step, not a cancellation of the jump that already happened -- so the link host's own `preventDefault()` guard skips silently (no error), while the container host's guard fires fresh and throws (`preventDefault called during event replay`, logged), matching ADR 0017's accepted consequence. In both forms the **replayed click's scroll lands last** and sticks (the app's own initial-navigation `Scroll` event, which also targets `[0, 0]` under `'enabled'`, is scheduled and resolved *before* `whenStable()`, and event replay happens only after it).
3. `replaceState` (`deepLinking`) survived every navigation away to Page B and back, in all three restoration modes, in all three engines: the fragment was intact on return. `pushState` (`updateHistory`) entries, under `scrollPositionRestoration: 'enabled'`, restore the **wrong** position on Back and Forward -- consistently the position the reader was at when they pressed Back/Forward, not the target entry's position -- because every pushed entry carries the *same* `history.state.navigationId` (Magellan passes `history.state` through unchanged), so the Router's per-navigation-id store never has more than one slot to give back. Under `'top'` it is always the top (by design, unconditionally). Under `'disabled'` the browser's own native per-entry scroll restoration takes over and gets it right (or very close). This confirms the Magellan spec's assumption exactly and its documented mitigation (use `updateHistory` only on pages without Router scroll restoration).

Also confirmed empirically and folded into the case 1 and case 2 fixtures: the Smooth Scroll spec's stated `<base href>` hazard is real. A bare `href="#id"` on a non-root route (`<base href="/">`) resolves against the base, not the current document, and is a full cross-document reload back to `/` (which then client-redirects to `/page-a`, losing any query string). The base-href-safe recipe from the spec's own usage example (`pathname + search + '#id'`, read from `Location.path()`) avoids it -- and matters here for a second reason the spec text does not call out: on any Router app with a query string (as this prototype uses to select `scrollPositionRestoration` per page), a same-path href that omits the *query* also fails to be same-document (the query differs), and also reloads. Both are recorded findings, not open questions -- the fix is the same href recipe either way.

## Results

Case, result, evidence (final scroll positions and other observations per engine). Numbers vary by 1-6px across engines from font-metric differences; the qualitative result is identical in Chromium, Firefox, and WebKit for every row unless stated otherwise.

| # | Case | Result | Evidence |
| --- | --- | --- | --- |
| 1a | Native jump, no directive, `restoration=enabled`, no mixin | Undone: lands at `scrollY=0` (top), not the target (`~2542px`) | `logs/3-e2e-annotations.log` lines 1-2 (chromium), 11-12 (firefox), 21-22 (webkit) |
| 1b | Same, with `nfs-smooth-scroll` mixin | Same final position (`scrollY=0`); only the path there is animated | lines 3-4, 13-14, 23-24 |
| 1c | Native jump, no directive, `restoration=top`, no/with mixin | Same as 1a/1b: `scrollY=0` in every combination | lines 5-8, 15-18, 25-28 |
| 1d | Bare `href="#id"` on the non-root route | Cross-document reload to `/` then client redirect to `/page-a`, losing the query string; `document.baseURI` resolves the href to `http://.../#id` (no `/page-a`) | lines 9-10, 19-20, 29-30 |
| 2a | `@defer (hydrate on interaction)`, container host, click before hydration | Native jump happens immediately (pre-hydration); replay re-scrolls (no visible change) then throws on its own `preventDefault()` (`defaultPrevented` was `false` at replay entry); final position is the target, **the replayed click's scroll (a no-op re-assertion) is what is left standing after the app's own initial-navigation Scroll event already resolved to `[0,0]` earlier** | lines 31-32 (chromium: exact stack trace), 35-36 (firefox), 39-40 (webkit) |
| 2b | Same, link host | Native jump also happens immediately (same early-contract behaviour, independent of host form); replay sees `defaultPrevented=true` already (Dispatcher's own anchor bookkeeping) and skips its `preventDefault()`, no error; final position is the target | lines 33-34, 37-38, 41-42 |
| 3a | `replaceState` (`deepLinking`, default), Back/Forward, all 3 restoration modes | Only one entry ever existed (each click replaces it); Back leaves the whole run (empty fragment) in Chromium/WebKit, and does not move at all in Firefox (its fresh-tab session history has nothing before this entry); Forward returns to `#m-s3` at `scrollY=0` (`enabled`/`top`) or the real position (`disabled`) | lines 43-52 (chromium), 61-70 (firefox), 79-88 (webkit) |
| 3b | `pushState` (`updateHistory`), Back/Forward, `restoration=enabled` | **Wrong** position every time: both Back presses and the Forward press all land at the section-3 position (`~14994px`), not each entry's own section -- because `history.state.navigationId` never changes across the pushed entries | lines 45, 49 (chromium: `back1ScrollY=14994`, `back2ScrollY=14994`), 63 (firefox), 81 (webkit) |
| 3c | Same, `restoration=top` | Always `scrollY=0` on every Back/Forward, unconditionally | lines 49, 67, 85 |
| 3d | Same, `restoration=disabled` | Close to correct: the browser's own native per-entry scroll restoration lands within a few hundred px of each section's real position | lines 53 (`back1ScrollY=13761` for `#m-s2`, exact; `back2ScrollY=12125` for `#m-s1`, target `12528`), 71, 89 |
| 3e | `replaceState` entry survives navigating to Page B and back | Fragment (`#m-s2`) intact on return, in all 3 restoration modes, all 3 engines | lines 55-60, 73-78, 91-96 |

Exact error text (case 2a, container host, Chromium): `` `preventDefault` called during event replay. Because event replay occurs after browser dispatch, `preventDefault` would have no effect. You can check whether an event is being replayed by accessing the event phase: `event.eventPhase === EventPhase.REPLAY`. `` (Firefox and WebKit log the same condition; Firefox's console message text is shorter, `ERROR Error`, WebKit's matches Chromium's in full -- see `logs/3-e2e-annotations.log`). No other case in the suite (48 tests, 3 engines) logged a console error.

## What the prototype does not prove

- Only `scrollIntoView`/CSS `scroll-behavior` timing on this machine's engines under Playwright automation; real user-timed clicks were not exercised.
- The `nfs-smooth-scroll` mixin's effect on the *path* to the final position (smooth vs. instant) was observed visually during development but not asserted frame-by-frame; the final resting position (the only thing this ticket asks about) is asserted.
- `reducedMotion` is out of scope here (the real spec already settles it); the prototype's `NfsSmoothScroll` always requests `'smooth'` and relies on the mixin/CSS for the pre-hydration path, matching only the parts of the spec this ticket needed.
- Only one Router app shape (one non-root route with a query-string-selected restoration mode, one `@defer (hydrate on interaction)` block per host form, one Magellan-lite container). Nested Router outlets, guards, and resolvers were not exercised.
- The `updateHistory`/`enabled` "wrong position" finding was traced to the shared `navigationId` mechanically (Router source reading, matching the observed numbers exactly), but no attempt was made to find a pushState recipe that gives each entry a distinct `navigationId` (Magellan's own contract requires passing `history.state` through unchanged, so this is not an available fix within the directive; it is inherent to composing raw `pushState` with the Router's restoration).
- Why `backOnPageAScrollY` was `0` in every engine and mode for the Page B round trip (case 3e), rather than the browser natively restoring the pre-departure position under `restoration=disabled` the way it did for the plain pushState entries in case 3d, was not run to ground: the most likely explanation is that returning to `/page-a` recreates the `PageA` component from scratch (a real route match, not just a fragment change), which starts unscrolled, and nothing in this prototype's scope depends on it (Magellan's `deepLinking` contract is about the URL, not the scroll position, on that round trip).
- Windows 11 ARM64 only, Playwright's bundled x64 browsers under emulation (Chromium 1243, Firefox 1543, WebKit 2359). No Linux CI, no native ARM64 browser builds, no macOS Safari.

## Decision handed to the specs

- **Smooth Scroll spec** (`specs/smooth-scroll.md`): its assumption holds as written. Its Comparison rule 3 and ADR 0017's documented consequence (a replayed click calling `preventDefault()` logs an error) are both confirmed, with the correction that the "dispatcher already cancelled the native jump" phrasing describes what the Dispatcher does to the event's `defaultPrevented` flag at *replay* time for an anchor action element, not a cancellation of the native jump when the very first click happens before the whole app has hydrated at all -- that native jump always proceeds, in both host forms, exactly as the spec's own container-host paragraph describes for the container case. The spec's text for the link-host case ("Why the link host skips step 2 ... inside a dehydrated block Angular's dispatcher has already cancelled the native jump") should be read as holding for the *replay*, not for whether the browser's default action ran live; the practical outcome the spec cares about (no error is logged for the link host) is unchanged and confirmed.
- **Magellan spec** (`specs/magellan.md`): its assumption holds exactly. `replaceState` is safe in every mode (confirmed: it survives a round trip through another route in all three restoration modes). `updateHistory` restores the wrong position under Router scroll restoration (confirmed, with the mechanism traced to the shared `navigationId`), so its rule (document `updateHistory` for pages without restoration, keep an e2e guard) stands unchanged.

### Triage

Nothing from this prototype needs an `### OPEN FOR HUMAN` entry: every question the ticket asked was settled by running code, and the two things left unresolved above (the Page B round-trip's exact scroll value, and whether a distinct-`navigationId` pushState recipe exists) are both low impact -- neither changes a recommendation either spec makes, and neither freezes a public contract. Per the map's triage rule they are recorded under "what the prototype does not prove" rather than carried forward as open.

### OPEN FOR HUMAN

None.

## What is here

The decisive files only, at their paths inside the workspace. The runnable workspace (with `node_modules`, `dist/`, and Playwright's browser cache) stays at `D:/tmp/nfs-proto-smooth-scroll-router/` and is not committed.

- `package.json`, `angular.json`, `tsconfig.json` -- pins: Angular 22.2.0 (`ng new` pulled `^22.2.0`), TypeScript 6.0.2 (matches the target's 6.0.x), `@playwright/test` 1.63.0 added by hand. Nothing needed pinning back: the generator's defaults already matched the map's target versions (`outputMode: "server"` was left as generated; the app is served through its own Express server, not a static file server, since prerendering plus `RenderMode.Prerender` for `'**'` already produces per-route static HTML either way).
- `src/index.html` -- the one hand-written piece of non-Angular markup: a synchronous inline script that adds the `nfs-smooth-scroll-mixin` class to `<html>` when `?mixin=1` is present, before body parsing (so a pre-hydration native jump still sees it).
- `src/styles.scss` -- `html.nfs-smooth-scroll-mixin { scroll-behavior: smooth; }`, the prototype's stand-in for the real `nfs-smooth-scroll` Sass mixin.
- `src/app/smooth-scroll.ts` -- `NfsSmoothScroll`: one `[nfsSmoothScroll]` directive, host tag decides container vs. link host, one `click` listener following the spec's click order (state first, `preventDefault()` last, guarded by `defaultPrevented`). Carries a `window.__nfsClicks` instrumentation array (ponytail: kept in the file, not stripped after use, so the capture matches what actually ran) that the case 2 tests read to see the exact replay sequence instead of inferring it from side effects.
- `src/app/magellan-lite.ts` -- `NfsMagellanLite`: composes `NfsSmoothScroll` via `hostDirectives`, then its own `click` listener writes `history.replaceState`/`pushState` with `history.state` passed through, per the Magellan spec's deep-linking subsection. No section tracking, no `.is-active`/`aria-current` marker -- out of scope for this ticket's case 3 (the real Magellan spec already settles that shape).
- `src/app/in-page-link.ts` -- the shared in-page-fragment resolver both directives use (bare `#frag`, or same-path-and-query href with a fragment), factored out once it became clear both directives needed the same base-href-safe check.
- `src/app/pages/page-a.ts`, `page-a.html`, `page-a.scss` -- the fixture page: case 1's two link forms (safe and bare), two `@defer (hydrate on interaction)` blocks for case 2 (container host, link host), and a Magellan-lite nav with three sections for case 3. `path = inject(Location).path()` is the base-href-safe href source for every functional link.
- `src/app/pages/page-b.ts` -- a minimal second route, used only as the "navigate away" leg of case 3e.
- `src/app/app.config.ts` -- `scrollRestorationFromQuery()`: reads `?restoration=enabled|top|disabled` from `location.search` once, at the point the client bundle evaluates `withInMemoryScrolling(...)`; a static file server ignores query strings when resolving a file, so one prerendered build serves all three modes.
- `playwright.config.ts` -- 3 projects (chromium, firefox, webkit), `webServer` starts `node dist/smooth-scroll-router/server/server.mjs` with `NG_ALLOWED_HOSTS=localhost` (an Angular 22 SSR server 400s on every request without this; see the user's own recorded gotcha).
- `e2e/helpers.ts` -- `waitForScrollSettled` (polls `window.scrollY` until stable; widened after one observed flake where a CSS-smooth native jump plus a delayed Router correction together needed more than the original poll window), `collectConsoleErrors`, `targetOffsetTop`.
- `e2e/case1-native-jump.spec.ts`, `case2-defer-replay.spec.ts`, `case3-magellan-history.spec.ts` -- the three cases, each recording its findings as Playwright test annotations (not assertions alone) so the full picture survives into `logs/3-e2e-annotations.log`.
- `e2e/diag-popstate.spec.ts`, `diag-section-offsets.spec.ts` -- the two diagnostics that uncovered and then confirmed the fix for the `<base href>`/query-string reload hazard, and that measured the exact section offsets case 3's "wrong position" finding is checked against.
- `e2e/print-annotations.mjs` -- reads Playwright's `--reporter=json` output and prints each test's annotations; this is how `logs/3-e2e-annotations.log` was produced.
- `logs/1-build.log`, `2-e2e-run.log`, `3-e2e-annotations.log` -- the last clean run of `ng build --configuration development` and the full 48-test, 3-engine Playwright run, plus its annotation printout (ASCII-sanitized: Playwright's own check marks and angle-quote characters are replaced with `[OK]`/`>`).

## How to run

Windows 11 ARM64, Node 24.18.0, npm 11.16.0. From `D:/tmp/nfs-proto-smooth-scroll-router` (ports 4640-4649 only; never 4400; stop any server bound to these ports first):

```
npx ng build --configuration development
npx playwright test e2e/case1-native-jump.spec.ts e2e/case2-defer-replay.spec.ts e2e/case3-magellan-history.spec.ts
node e2e/print-annotations.mjs        # human-readable results from e2e-results.json
```

Single-engine, single-case runs: `npx playwright test --project=chromium e2e/case2-defer-replay.spec.ts`.

To rebuild the workspace from nothing:

1. From `D:/tmp/`: `npx @angular/cli@22.2.0 new smooth-scroll-router --ssr --routing --style=scss --skip-git --package-manager=npm` (the generator names the folder after the project; the npm package name stays `smooth-scroll-router` -- Angular's build output path, `dist/smooth-scroll-router/...`, is keyed off this name, not the containing folder), then rename the generated folder to `nfs-proto-smooth-scroll-router`.
2. `npm install -D @playwright/test@1.63.0` (Playwright's Chromium/Firefox/WebKit browsers were already cached on this machine from earlier prototypes; `npx playwright install chromium firefox webkit` otherwise)
3. Copy the files listed above over the generated ones (`src/app/app.routes.ts` gets the `page-a`/`page-b` routes; `src/app/app.ts`/`app.html` are trimmed to a bare `<router-outlet />`).
4. `npx ng build --configuration development`
