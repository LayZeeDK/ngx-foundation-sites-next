# 65. Prototype: Orbit keyboard scrolling and hydration details

Type: prototype
Status: resolved
Blocked by: 33
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Orbit](33-spec-orbit.md) answer. The [Prototype: Orbit on CSS scroll snap](46-prototype-orbit-scroll-snap.md) proved the scroll-snap design; the spec adds an `inert` gate that applies only once the directives are live, a bullet `tabindex` handed over to Aria, a hidden scrollbar, an inward focus ring on the slide, and a 24 px bullet floor, and assumes two things only running code can confirm, in Chromium, Firefox, and WebKit:

1. Keyboard scrolling from a focused slide keeps focus inside the carousel, the inward focus ring is visible, and the scrollbar stays hidden in a headed run on Windows (`scrollbar-width: none` plus `::-webkit-scrollbar`).
2. On the prerendered fixture: the attribute change from the `inert` gate is clean at hydration (no NG05xx, nothing skipped), the bullet `tabindex` hands over to Aria, a bound non-first `selected` aligns instantly, a scroll made before hydration is adopted as the selection, and a `@defer (hydrate on viewport)` block starts rotation when it hydrates.

If a case fails, the orchestrator reopens the Orbit spec; otherwise the verdict is appended to its decision log.

Read first: `specs/orbit.md` (the API, the `inert` gate, the custom CSS list, the rendering-modes subsection), `adr/0025-orbit-live-inert.md`, the Orbit prototype's answer and `prototypes/orbit-scroll-snap/`, and `research/angular-rendering-modes.md` sections 4 and 7.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: copy the Orbit prototype's plain Angular CLI 22.2 `--ssr` application to `D:/tmp/nfs-proto-orbit-keyboard-hydration/` (Angular 22.2.0, TypeScript 6.0.x, `@angular/aria` 22.2.0, `foundation-sites` 6.9.0), bring its directives to the spec's design, and drive it with `@playwright/test` in all three engines (headed for the scrollbar check), delaying the main bundle with `page.route` for the pre-hydration cases. Never modify this repo's working tree outside the effort directory.

Capture it: copy the decisive files into `prototypes/orbit-keyboard-hydration/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Orbit spec, and anything left `OPEN FOR HUMAN` after the triage rule.

## Answer

Resolved 2026-09-26. Prototype, run instructions, and raw numbers: [prototypes/orbit-keyboard-hydration/README.md](../prototypes/orbit-keyboard-hydration/README.md). Workspace: `D:/tmp/nfs-proto-orbit-keyboard-hydration/orbit`, copied from the read-only `D:/tmp/nfs-proto-orbit-scroll-snap/orbit` (Angular 22.2.0, `@angular/aria` and `@angular/cdk` 22.2.0, `foundation-sites` 6.9.0, TypeScript 6.0.x, `@playwright/test` 1.63.0). Chromium, Firefox, and WebKit all ran on this Windows arm64 machine, headed and headless.

### Verdict

Case 1 passes in full: in Chromium, Firefox, and WebKit, headless and headed, keyboard scrolling from a focused slide (arrow keys, Page Down, Page Up, End, Home) never drops focus to `<body>` or `<html>`, the focused slide shows a UA focus ring drawn inward (`outline-offset: -0.25rem`, matching `:focus-visible`), and the container paints no horizontal scrollbar (`offsetHeight - clientHeight === 0` in every engine, headed included). Getting there needed a real fix: the spec's mechanic 8 (focus handoff before the old slide becomes `inert`) cannot run synchronously in the `IntersectionObserver` callback, because at that point the *new* slide is still `inert` from the *previous* selection (Angular has not re-rendered yet) and `.focus()` on an `inert` element is a silent no-op -- confirmed with diagnostic instrumentation showing focus still on the old slide immediately after the `.focus()` call. The fix, now in the code: defer the actual `.focus()` to an `afterRenderEffect({ write })`, which runs after the render pass that lifts `inert` from the target slide. A genuine finding, not a failure: Page Down, Page Up, End, and Home also scroll the *page*, engine-dependently (`window.scrollY` moved as far as 1041 px in Chromium, 766 px in Firefox, and 640 px in WebKit) because the container has no vertical overflow to consume them; focus itself stays contained for all of them.

Case 2 passes four of its five sub-cases. It fails on the `inert` gate specifically: Aria's own `TabPanel` `[attr.inert]` binding still appears in server HTML for unselected slides (`beforeInert: [false, true, true, true]`), even though the wrapping directive's own `[attr.inert]` binding demonstrably computes the correct (absent) value at that exact point (confirmed with temporary diagnostic attributes: `data-diag-override="null"` sits right next to `inert="true"` in the same server-rendered tag). Two override techniques were tried -- a host-directive wrapper binding (the documented approach, matching how the sibling `tabindex` override for bullets *does* win) and a plain template-level attribute binding on the same element -- and neither suppressed Aria's own binding. Hydration itself stays clean regardless: no NG05xx in any engine, `ngDevMode.componentsSkippedHydration === 0` in all three, because Aria's own inert state is internally consistent between server and client; only the library's override silently loses, so there is no hydration mismatch to detect, just a design promise (ADR 0025) that the chosen mechanism does not keep. The other four sub-cases hold cleanly in all three engines: the bullet's pre-hydration `tabindex="0"` correctly hands over to Aria's own roving value the first time a user moves it with the keyboard; a bound non-first `selected` aligns the container instantly (only the start and end `scrollLeft` values were ever observed, no positions between); a scroll made before hydration (with the main bundle delayed via `page.route`) is adopted as the selection once hydration settles; and `@defer (hydrate on viewport)` keeps the carousel silent while off-screen and starts its rotation once scrolled into view and hydrated.

### Results

Viewport 1000x800; container 968 px wide (production build) / 968 px (development build, case 2). Numbers are identical across Chromium, Firefox, and WebKit unless a row says otherwise.

| Case | Result | Evidence |
| --- | --- | --- |
| Keyboard scrolling from a focused slide (ArrowRight x2, PageDown, PageUp, End, Home) keeps focus inside the carousel | PASS x3 | Focus sequence `slide0 -> slide1 -> slide2 -> slide2 -> slide2 -> slide2 -> slide2` (Page Down/Up/End/Home do not move the container: it has no vertical overflow); never `BODY`/`HTML` |
| Finding: Page Down, Page Up, End, and Home also scroll the page | FINDING (not a spec failure) | `window.scrollY`, engine-dependent (`results/*.jsonl`): Chromium PageDown 700, PageUp 700 (unchanged), End 1041, Home 1041 (unchanged); Firefox PageDown 766, PageUp 0, End 1040, Home 0; WebKit PageDown 640, PageUp 0, End 1039, Home 0; arrows never move `window.scrollY` in any engine |
| Inward focus ring on the focused slide | PASS x3 | Computed `outline-style: auto` (not `none`), `outline-offset: -4px` (negative, drawn inward); `matches(':focus-visible')` true; screenshot per engine |
| No horizontal scrollbar (headless) | PASS x3 | `clientHeight === offsetHeight === 484`; `scrollbar-width: none` |
| No horizontal scrollbar (headed, Windows classic scrollbar risk) | PASS x3 | `clientHeight === offsetHeight` (477-484 depending on engine chrome); screenshot per engine; `chromium-headed`/`firefox-headed`/`webkit-headed` Playwright projects |
| Inert gate: no slide `inert` in server HTML | FAIL x3 | `beforeInert: [false, true, true, true]` (identical in all three engines); see exact error text below |
| Inert gate: hydration is clean despite the above | PASS x3 | `errors: []` (no NG05xx or any console error); `ngDevMode.componentsSkippedHydration: 0` in all three |
| Inert gate: unselected slides are `inert` once live | PASS x3 | `afterInert: "0111"` in all three |
| Bullet tabindex hands over to Aria | PASS x3 | Before any interaction: `tabindexes: ["0","-1","-1","-1"]` (the override); after ArrowRight moves Aria's roving item: `["-1","0","-1","-1"]` (Aria's own value, matching the accepted roving-tab-stop drift from the scroll-snap prototype) |
| Bound non-first `selected` aligns instantly | PASS x3 | Sampled every animation frame from navigation to settled: only `0` and `968` (the final target) ever appear; `active: 2` reported with `selected=2` bound (slide index differs from the sampled scrollLeft example because the sampling test used `selected=2`, one slide width) |
| A scroll made before hydration is adopted | PASS x3 | Main bundle delayed 2000 ms; container scrolled to slide 2 before the bundle loaded; after hydration, `active: 2`, `scrollLeft` equals `2 * container width`, log contains a `{i:2, cause:'scroll'}` entry, no console errors |
| `@defer (hydrate on viewport)` starts rotation once hydrated | PASS x3 | 0 logged autoplay ticks while off-screen for ~900 ms (several `timerDelay` periods); more than 0 once scrolled into view and given ~1.6 s; `aria-live="off"` confirms rotation is live, not just present |

Exact error text for the one failing case (identical across Chromium, Firefox, and WebKit):

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

  34 |   record(info, { beforeInert, beforeTabindex, afterInert: s.inert, afterTabindex: s.tabindexes, devMode, errors });
  35 |
> 36 |   expect(beforeInert.every((v) => v === false)).toBe(true); // no slide inert in server HTML
     |                                                 ^
    at hydration.spec.ts:36:49
```

with the recorded data `beforeInert: [false, true, true, true]`, `beforeTabindex: ["0","-1","-1","-1"]` (the sibling override, unaffected), `afterInert: "0111"`, `devMode: {"componentsSkippedHydration": 0}`, `errors: []`.

### What the prototype does not prove

- **Why** the `inert` override loses specifically for `TabPanel` while the structurally identical `tabindex` override wins for `Tab`. A minimal isolated reproduction (a directive wrapping a plain leaf directive versus a directive wrapping one with its own nested host directive, mirroring `TabPanel` hosting `DeferredContentAware`) did not reproduce the failure -- both cases overrode correctly there. The trigger inside Aria's actual `Tabs`/`TabPanel` implementation was not identified within this prototype's budget; Angular's own documentation states host-directive bindings should be overridable by the hosting directive (`adev/.../directive-composition-api.md`, "Directive execution order"), which held for `Tab`/`tabindex` but not for `TabPanel`/`inert` here.
- Real touch devices, and touch scrolling from a focused slide specifically (not run here; the scroll-snap prototype already found headless Chromium skips the post-gesture snap for a CDP touch gesture, a harness limit, not a design failure).
- Screen reader output for the focus handoff or the inert gate.
- The zone-based build's replay behavior for these specific new mechanics (already proven for the base scroll-snap design by the earlier prototype; not re-run here to keep scope to the two cases this ticket names).

### Decision handed to [Spec: Orbit](33-spec-orbit.md)

1. **The `inert` gate cannot be implemented as an attribute-binding override of Aria `TabPanel`.** `NfsOrbitSlide` must not rely on overriding `TabPanel`'s own `[attr.inert]` binding (via `hostDirectives` or any other attribute binding on the same host) -- it measurably does not win. The spec should have `NfsOrbitSlide` compose Aria's `Tabs`/`TabList`/`Tab` for the bullets exactly as designed (that override *does* work, proven here and in the scroll-snap prototype), but implement the slide's own small ARIA contract by hand instead of hosting `TabPanel`: `role="tabpanel"`, `id`, `tabindex` (`0` for the selected slide, `-1` otherwise -- no roving-tabindex complexity needed here, unlike the bullets), `aria-labelledby` (the paired bullet's id), and `[attr.inert]` from the Orbit's own `live`/`selected` signals, with no competing binding to lose to. This keeps every other mechanic (the scroll-snap layout, the IntersectionObserver, the bullets' Aria composition) unchanged.
2. **Mechanic 8's focus handoff needs a render-callback indirection, not a synchronous `.focus()` call.** Record the pending handoff target in a signal from the `IntersectionObserver` callback, and perform the actual `.focus({preventScroll: true})` call from an `afterRenderEffect({ write })` that runs after the render pass which lifts `inert` from the target slide. A synchronous call fails silently in every engine (the target is still `inert` from the previous selection at that point).
3. **Page Down, Page Up, End, and Home also scroll the page**, not just the carousel, because the container has no vertical overflow. Triaged below: accepted as a documented, unremarkable platform interaction, not a design defect -- the APG carousel pattern names only the arrow keys, and focus itself never leaves the carousel.
4. The scrollbar-hiding CSS (`scrollbar-width: none` plus `::-webkit-scrollbar { display: none }`), the inward focus ring (`outline-offset: -0.25rem`), and the 24 px bullet floor all work as specified; no change needed there.
5. The bullet `tabindex` handover, the instant alignment for a bound non-first `selected`, the pre-hydration scroll adoption, and `@defer (hydrate on viewport)` all work as specified; no change needed there either.

### Triage (auto-trap quadrant), 2026-09-26

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

1. **The `inert` override losing to Aria `TabPanel`.**
   - Impact: HIGH. This is ADR 0025's entire mechanism, a WCAG 1.3.1 guarantee (no visible-but-unreachable content) the spec promises for every Orbit instance; shipping it broken, or re-deriving the fix later, means re-touching every consumer's server-rendered output and the ADR itself.
   - Confidence: NOT HIGH on the *root cause* (unresolved after an isolated repro attempt) but HIGH on the *fix*: decision 1 above (hand-roll the slide's small ARIA contract instead of hosting `TabPanel`) is a direct, mechanical consequence of the measured fact that the override does not win, needs no further judgement call, and costs nothing else in the design (the bullets keep composing Aria normally).
   - Outcome: DECIDED, not left open. The Orbit spec applies decision 1. What stays human-only by kind: filing an upstream question with the Angular team about `hostDirectives` attribute-binding override precedence (an outward-facing action under the user's identity) is deferred to an interactive session, never self-filed.
2. **Page Down/Up/End/Home scrolling the page.**
   - Impact: NOT HIGH. No public API or contract is frozen either way; a future spec revision can add a `keydown` handler to intercept these keys without breaking any consumer, and the APG carousel pattern does not mandate behavior for them.
   - Confidence: HIGH. The measurement is consistent and engine-independent, and "accept the platform default, document it" is the effort's own standing default for undocumented platform interactions that do not fail an accessibility criterion (focus stayed contained in every case).
   - Outcome: DECIDED. Documented in decision 3 above.

### OPEN FOR HUMAN

- Filing an upstream question or issue with the Angular team about why a host-directive (and a plain template) attribute-binding override does not win over `TabPanel`'s own `[attr.inert]` binding, when the identical pattern does win for `Tab`'s `[attr.tabindex]` and Angular's own documentation says host-directive bindings should be overridable. Human-only by kind (outward-facing action under the user's identity); the workaround (decision 1) does not depend on an answer.

### Amendment, 2026-09-27 (audit 0006)

The upstream item is closed as not filed, by the user's ruling ([Upstream filings](76-evidence-upstream-filing-readiness.md)); no workaround here depends on it.
