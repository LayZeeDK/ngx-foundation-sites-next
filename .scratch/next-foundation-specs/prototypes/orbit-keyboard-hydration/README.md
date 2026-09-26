# Prototype: Orbit keyboard scrolling and hydration details

Ticket: [Prototype: Orbit keyboard scrolling and hydration details](../../issues/65-prototype-orbit-keyboard-hydration.md). Feeds: [Spec: Orbit](../../issues/33-spec-orbit.md).

## Question

Two things only running code can confirm about the Orbit spec's design (built on [Prototype: Orbit on CSS scroll snap](../orbit-scroll-snap/README.md) and ADR 0025):

1. Keyboard scrolling from a focused slide (arrow keys, Page Down, Page Up, End, Home) keeps focus inside the carousel, the inward focus ring is visible, and the scrollbar stays hidden in a headed run.
2. On the prerendered fixture: the `inert` gate's attribute change is clean at hydration, the bullet `tabindex` hands over to Aria, a bound non-first `selected` aligns instantly, a scroll made before hydration is adopted as the selection, and `@defer (hydrate on viewport)` starts rotation when it hydrates.

## Verdict

Case 1 passes in full, in all three engines, headless and headed. Case 2 passes four of its five sub-cases; the `inert` gate itself fails: Aria's own `TabPanel` `[attr.inert]` binding still appears in server HTML for unselected slides, even though a wrapping directive's own `[attr.inert]` binding computes the correct (absent) value and is provably applied to the DOM (confirmed with diagnostic attributes). Two different override techniques were tried (a host-directive wrapper, and a plain template binding on the same element) and neither wins over Aria's own binding during server rendering. Hydration itself stays clean regardless (no NG05xx, `componentsSkippedHydration === 0`), because Aria's own state is internally consistent server- and client-side; only the library's *override* silently loses. See the ticket's `## Answer` for the full results table, the decision this hands to the Orbit spec, and the triage.

## Workspace

`D:/tmp/nfs-proto-orbit-keyboard-hydration/orbit`. A plain Angular CLI 22.2.0 `--ssr` application (Angular 22.2.0, TypeScript 6.0.x, `@angular/aria` 22.2.0, `@angular/cdk` 22.2.0, `foundation-sites` 6.9.0, `@playwright/test` 1.63.0), copied from the read-only `D:/tmp/nfs-proto-orbit-scroll-snap/orbit` workspace and extended with the spec's keyboard and hydration mechanics. It stays under `D:/tmp/` and is not committed; only the decisive files are copied here.

## What is here

- `src/app/orbit.ts` -- one throwaway component standing in for the spec's directive family, plus two small host-directive wrappers: `SlideGate` (wraps Aria `TabPanel`, tries to override `[attr.inert]` per ADR 0025) and `BulletGate` (wraps Aria `Tab`, overrides `[attr.tabindex]` for the pre-hydration bullet tab stop). Adds the `live` gate signal, the mechanic-4 instant-alignment block, the mechanic-8 focus handoff (via a `pendingFocusHandoff` signal read in an `afterRenderEffect`, not a synchronous `.focus()` call -- see "What I had to fix" below), and rotation stopping only on `:focus-visible`.
- `src/app/orbit.html` -- Foundation's Orbit markup with the APG deltas, using `[slideGate]`/`[bulletGate]` instead of Aria's `[ngTabPanel]`/`[ngTab]` directly.
- `src/_nfs-orbit.scss` -- the prototype's custom CSS, extended with the hidden-scrollbar rule (`scrollbar-width: none` plus `::-webkit-scrollbar { display: none }`), the inward focus ring (`.orbit-slide:focus-visible { outline-offset: -0.25rem }`), and the 24 px bullet floor.
- `src/app/deferred-gallery.ts`, `src/app/app.routes.ts` -- the `/deferred` route: the whole carousel inside `@defer (hydrate on viewport)`, pushed below the fold by a filler.
- `e2e/helpers.ts`, `e2e/keyboard.spec.ts`, `e2e/scrollbar.spec.ts` -- case 1, run against the production build (port 4650): keyboard scrolling and focus containment, the finding that Page Down/Up/End/Home also scroll the page, the inward focus ring, and the headed-only scrollbar check (its own Playwright projects, `headless: false`).
- `e2e-hydration/helpers.ts`, `e2e-hydration/hydration.spec.ts`, `e2e-hydration/defer.spec.ts` -- case 2, run against the development build (port 4651, so `ngDevMode` stays a real object): the inert gate, the bullet tabindex handover, instant alignment, pre-hydration scroll adoption, and the `@defer (hydrate on viewport)` case.
- `playwright.config.ts` -- switches `testDir` and projects by `BASE_URL` (4650 vs 4651); the production config adds three headed-only projects (`chromium-headed`, `firefox-headed`, `webkit-headed`) scoped to `scrollbar.spec.ts` via `testMatch`.
- `results/*.jsonl` -- the numbers each test recorded, one line per case and project.

## How to run

```
cd D:/tmp/nfs-proto-orbit-keyboard-hydration/orbit
npm ci
node make-slides.mjs
npx ng build                                              # production, dist/orbit
npx ng build --configuration development                  # dist/orbit-dev, for ngDevMode

NG_ALLOWED_HOSTS=localhost:4650 PORT=4650 node dist/orbit/server/server.mjs
BASE_URL=http://localhost:4650 npx playwright test e2e/keyboard.spec.ts --project=chromium --project=firefox --project=webkit
BASE_URL=http://localhost:4650 npx playwright test e2e/scrollbar.spec.ts --project=chromium-headed --project=firefox-headed --project=webkit-headed
# stop that server, then:
NG_ALLOWED_HOSTS=localhost:4651 PORT=4651 node dist/orbit-dev/server/server.mjs
BASE_URL=http://localhost:4651 npx playwright test --project=chromium --project=firefox --project=webkit
```

`NG_ALLOWED_HOSTS` is required or the built SSR server answers every request with HTTP 400 (a host-header guard against SSRF). One server at a time; stop it (find its PID with `netstat -ano | rg ":465<N> "`, then `taskkill //F //PID <pid>`) before starting the other.

Last full run: case 1, 12/12 passed (headless, three engines) plus 3/3 passed (headed, three engines). Case 2, 12/15 passed (three engines): the `inert` gate sub-case failed identically in all three; the other four sub-cases (bullet tabindex handover, instant alignment, pre-hydration scroll adoption, `@defer (hydrate on viewport)`) passed in all three.

## What I had to fix along the way (kept in the code, not just this README)

- **Mechanic 8's focus handoff cannot run synchronously.** The spec's mechanic 8 says the new slide receives focus "before the old one becomes inert." Doing that literally -- calling `.focus()` on the new slide synchronously inside the `IntersectionObserver` callback, right after `selected.set(i)` -- silently failed in every engine: at that point in the code, Angular has not yet re-rendered, so the new slide *itself* is still `inert` from the *previous* selection (only the previously-selected slide was not-inert), and `.focus()` on an `inert` element is a no-op. Measured with diagnostic instrumentation: `activeBefore: "DIV0"`, `focusWasInOldSlide: true`, then `activeAfterFocusCall: "DIV0"` (unchanged) -- confirmed the browser blurred to `<body>` about one frame *after* `inert` was actually applied by Angular's next render pass, not synchronously. The fix: store the pending target index in a signal and perform the actual `.focus()` call from an `afterRenderEffect({ write })`, which runs *after* the render pass that removed `inert` from the target slide. This is now how `orbit.ts` does it (`#pendingFocusHandoff`).
- **Page Down, Page Up, End, and Home also scroll the page.** `.orbit-container` has `overflow-x: auto` but no vertical overflow (Foundation's `overflow: hidden` stays for the y axis). Arrow keys stayed contained to the carousel in all three engines, but Page Down/Up/End/Home -- which are vertical-scroll keys -- have nothing to consume inside the container and bubble to the document (measured: `window.scrollY` moved to 700-1041 px in all three engines). Focus itself never left the carousel for any of these keys; only the page position moved. See `e2e/keyboard.spec.ts`'s "finding" test.

## What the prototype does not prove

- Why the `inert` override loses specifically for `TabPanel` while the structurally identical `tabindex` override wins for `Tab`. A minimal isolated reproduction (two directives, one wrapping a plain leaf directive, one wrapping a directive with its own nested host directive, mirroring `TabPanel` hosting `DeferredContentAware`) did **not** reproduce the failure -- both overrode correctly. The exact trigger inside Aria's `Tabs`/`TabPanel` implementation was not identified within this prototype's budget.
- Real touch devices, and touch scrolling from a focused slide (not tested here; the scroll-snap prototype already found headless Chromium skips the post-gesture snap for a CDP touch gesture, a harness limit).
- Screen reader output for the focus handoff or the inert gate.
- The zone-based build's replay behavior for these new mechanics (already proven for the base scroll-snap design in the earlier prototype; not re-run here to keep scope to the two cases this ticket names).
