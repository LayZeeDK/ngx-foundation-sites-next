# Prototype: animate.enter/animate.leave with Motion UI transition classes

Ticket: [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../../issues/47-prototype-motion-ui-animate-enter.md) (building-blocks.md 1.6 rule 4).

Sources: P52 = the [Prototype: `animate.enter` at hydration](../animate-enter-hydration/README.md), also captured at `../../issues/52-prototype-animate-enter-hydration.md`.

## Question

Do the library's `nfs-*` keyframe classes animate under `animate.enter`/`animate.leave` (inserted
and removed elements) and under a bound State class (persistent elements, completion on
`animationend` plus a duration-plus-100ms fallback timer), with `prefers-reduced-motion: reduce`
shortening every animation to 1ms so completion events still fire, in Chromium, Firefox, and
WebKit? And does a consumer-supplied Motion UI transition class (`slide-in-down`) work under
`animate.enter`, or is it unsupported as `adr/0003-animation-mechanics.md` and building-blocks.md
1.6 rule 4 already state (`enter-and-leave.md:28`)?

## What is here

The decisive files only (a full Angular CLI 22.2.0 application, no SSR -- this question is about
client-side animation instructions, not rendering modes, so SSR was not built). The runnable
workspace, including `node_modules`, the
build output, and Playwright's browser cache, stays at
`D:/tmp/nfs-proto-motion-ui-animate-enter/app` and is not committed.

- `src/index.html`, `src/app/app.ts`, `src/app/app.html` -- the whole app: three insert/remove
  boxes (Case 1), two persistent State-class boxes (Case 2), two Motion-UI-class boxes (Case 4).
  `src/app/app.css`, `src/main.ts`, `src/app/app.config.ts` are unmodified CLI generator defaults
  and are not copied here.
- `src/styles.css` -- the six required `nfs-*` `@keyframes` and their classes (fade, slide, hinge,
  spin), the State-class rules, the `prefers-reduced-motion` rule, and the two Motion-UI-derived
  CSS blocks for Case 4 (see "CSS added" below).
- `e2e/animate-enter.spec.ts` -- the Playwright tests: 7 tests x 6 projects = 42 cases.
- `playwright.config.ts` -- six projects: chromium/firefox/webkit, each plain and with
  `reducedMotion: 'reduce'`.
- `static-server.mjs` -- a dependency-free static file server for the production build (used
  instead of `ng serve`, per this session's memory-sharing rule).
- `package.json` -- records the pinned/generated versions (see "Versions" below).

## How to run

```
cd D:/tmp/nfs-proto-motion-ui-animate-enter/app
npx ng build
node static-server.mjs 4472
# in another shell, from the same directory:
npx playwright test
```

The config binds to `http://localhost:4472` (inside this session's reserved 4470-4479 range).
Stop the static server (`taskkill /F /PID <pid>` on Windows, found via `netstat -ano`) when done;
Playwright closes its own browsers automatically at the end of the run.

### Versions

Angular CLI 22.2.0 (`npx @angular/cli@22.2.0 new app --style=css --ssr=false --routing=false`)
resolved `@angular/core` to `^22.2.0` and TypeScript to `~6.0.2` on its own, matching the map's
pins exactly. Vitest defaulted to `^5.0.0` (unused here, no unit tests were needed for this
question) and was pinned back to `^4.1.5` to match the map's target for the record; nothing else
needed pinning. `@playwright/test` 1.63.0 was added as the only other dev dependency, with
Chromium, Firefox, and WebKit already present in the shared `ms-playwright` cache from earlier
prototype sessions on this machine.

## Verdict

**The `nfs-*` keyframe classes animate correctly under every mechanic the map's specs will use, in
all three engines, with and without reduced motion. Motion UI's own transition classes do not
animate under `animate.enter`, for two distinct and compounding reasons, both confirming
`adr/0003-animation-mechanics.md` and building-blocks.md 1.6 rule 4 without qualification.**

`animate.enter`/`animate.leave` correctly play all six required `nfs-*` keyframes (fade, slide,
hinge, spin) on inserted and removed elements, in Chromium, Firefox, and WebKit alike (Case 1,
18/18 passing). A persistent element that changes state through a bound class (rule 1's mechanic)
completes reliably through `animationend` when the stylesheet has the animation, and through the
duration-plus-100ms fallback timer when it does not -- confirming the fallback exists for exactly
the reason ADR 0003 gives, a dropped stylesheet, not merely engine flakiness (Case 2, 12/12
passing). Under `prefers-reduced-motion: reduce`, the same `animationend` path completes in under
100ms instead of ~500ms, so completion events still fire and nothing needs a separate reduced-
motion code path (Case 3, folded into the Case 2 test matrix across the three `*-reduced-motion`
projects, 6/6 of those passing).

Motion UI's own `slide-in-down` transition class, applied verbatim through
`animate.enter="slide-in-down"`, never animates, and for a more specific reason than "transitions
need `@starting-style`": Motion UI's real CSS is a two-class protocol
(`.slide-in-down.mui-enter` for the "from" state, `.slide-in-down.mui-enter.mui-enter-active` for
the "to" state), and `animate.enter` only ever adds the one class name a consumer writes -- it
never adds Motion UI's own `mui-enter`/`mui-enter-active` companion classes, because those come
from Motion UI's `Motion.animateIn` runtime (`research/foundation-utilities-conventions.md` 4.1),
which is not present. The compound selector can never match, so `getComputedStyle` never reports a
transition on the element at all, and Angular's own animate.enter cleanup -- the same
`requestAnimationFrame`-based "no animation detected, strip the class" mechanism prototype 52 found
in `runEnterAnimation` -- removes the unmatched class before the next frame instead of leaving it
attached (Case 4a, 6/6 passing; confirmed by inspecting the settled class list, since the class is
gone too quickly for a Playwright assertion to catch it still present).

A second, independent test isolates the reason `enter-and-leave.md:28` gives directly, separate
from Motion UI's two-class detail: a single, self-contained class (`solo-slide-in-down`) declaring
its own `transition: transform 400ms` and its final `transform: translateY(0)` state, with no
companion class needed at all, still never animates when applied through `animate.enter`, and no
`transitionrun`/`transitionend` ever fires (Case 4b, 6/6 passing). Unlike Case 4a, Angular's
cleanup does *not* strip this class immediately, because `getComputedStyle` reports a genuine
`transition-property` on it (prototype 52's mechanism keeps a class attached whenever it detects an
animation is configured, even if none is observably running); the class instead stays on the
element, unanimated, for at least the 600ms this prototype waited. This is the general reason
transition classes cannot work under `animate.enter` on a newly inserted element: there is no prior
rendered frame for the browser to transition from, which is exactly what `@starting-style` exists
to supply, and `@starting-style` is outside the Angular 22 browser target (building-blocks.md 1.2).

### Results

| Case | Mechanism | Result | Evidence |
| --- | --- | --- | --- |
| 1. Insert (`animate.enter`) | `nfs-fade-in`, `nfs-slide-in-down`, `nfs-hinge-in-from-top` on a newly created `@if` element | Animates; `animationstart` and `animationend` both recorded | 9/9 passing (3 boxes x 3 non-reduced-motion engines); see `e2e\animate-enter.spec.ts:52` |
| 1. Remove (`animate.leave`) | `nfs-fade-out`, `nfs-slide-out-up`, `nfs-spin-out` on the same elements, removed after insertion | Class held until `animationend`; element stays attached, then detaches | Same 9/9; a second `animationstart`/`animationend` pair recorded, element becomes hidden only after |
| 1. Insert+remove under reduced motion | Same six keyframes, `reducedMotion: 'reduce'` context | Same result, faster (collapses to ~1ms) | 9/9 passing across the three `*-reduced-motion` projects |
| 2. Persistent element, State class, stylesheet intact | `.is-open` triggers `nfs-fade-in`; directive awaits `animationend` | Completes via `animationend` at ~500ms (normal) or <100ms (reduced motion) | 6/6 passing (3 engines x normal/reduced-motion split inside one test) |
| 2. Persistent element, State class, stylesheet dropped | `.no-anim.is-open` sets `animation: none !important` | `animationend` never fires; fallback timer (declared 500ms + 100ms buffer) completes it at ~600ms | 6/6 passing; `data-completion-via="fallback"` observed in every engine |
| 4a. Motion UI's own class | `animate.enter="slide-in-down"`, real two-class `.slide-in-down.mui-enter`/`.mui-enter-active` CSS present but `mui-enter` never added | Never animates; no `transitionrun`/`animationstart`; class itself is stripped by Angular before the next frame | 6/6 passing across the three engines |
| 4b. Single-class transition stand-in | `animate.enter="solo-slide-in-down"`, self-contained `transition` + final `transform` on one class | Never animates (no `transitionrun`); class stays attached, unlike 4a | 6/6 passing across the three engines |

Total: 42/42 passing in the reliable configuration (`workers: 2`, see "A note on flakiness" below).

Exact error text for the one flake encountered (resolved by reducing default Playwright
parallelism, not a change to the animation mechanism):

```
Error: expect(locator).toHaveAttribute(expected) failed
Locator:  getByTestId('broken-state-box')
Expected: "fallback"
Received: ""
Timeout:  2000ms
```

This occurred once, under the default full-parallelism run (6 projects, default worker count on
this shared machine), for the fallback-timer assertion, and did not reproduce when the same project
was rerun alone with `--workers=1`. The fallback timer still fired; it fired later than the
original 2000ms assertion timeout allowed for under CPU contention from other agents' prototypes
running concurrently on this machine. The fix applied was environmental (loosen the assertion
timeouts to 5000ms, and set `workers: 2` in `playwright.config.ts`), not a change to any production
code or CSS; the mechanism itself never failed to complete in any run.

### What this prototype does not prove

- The `(animate.enter)`/`(animate.leave)` function-callback form, only tested by prototype 52 as
  "not tested" too; this prototype also used only the class-list form, matching how the map's
  specs plan to use it (building-blocks.md 1.6 rules 2 and 4).
- Whether Angular's cleanup timing for an unmatched-selector class (Case 4a, stripped almost
  immediately) versus a matched-but-non-running-transition class (Case 4b, left attached
  indefinitely, or at least past 600ms) generalizes beyond what was directly observed here; the
  mechanism (prototype 52's `requestAnimationFrame`-based "no animation detected" check) is
  architectural, so it should generalize, but this prototype did not chase how long Case 4b's class
  eventually stays attached (whether `MAX_ANIMATION_TIMEOUT`'s 4-second default applies to
  `animate.enter` the way it explicitly does to `(animate.leave)`'s callback form is unconfirmed).
- Zoneless change detection specifically; the CLI's default app (this one) uses zone.js. Render-
  callback and animation-queue timing is documented as zone-independent (prototype 52), but this
  prototype did not verify that directly, matching prototype 52's own scope note.
- Any Motion UI class other than `slide-in-down`; the mechanism (two-class protocol, `animate.enter`
  never adding the companion classes) applies identically to every other Motion UI transition class
  listed in `research/foundation-utilities-conventions.md` 4.1, so this is not expected to
  generalize incorrectly, but only one was tested.
- Whether the same suppression/cleanup timing holds on a slower or faster machine than this one
  (Windows 11 on ARM64, shared with other agents); the one flake found here was resolved by
  reducing parallelism, which is itself evidence that timing assertions need headroom on a
  contended machine, not that the underlying mechanism is unreliable.

### Decision handed to the blocked spec tickets

Confirms `adr/0003-animation-mechanics.md` and building-blocks.md 1.6 without change:

- Rule 2 (elements the library inserts or removes use `animate.enter`/`animate.leave` with `nfs-*`
  keyframe class lists) is safe to use exactly as specced, in all three engines, with or without
  reduced motion.
- Rule 1 (persistent elements use a bound State class plus `animationend`/fallback timer) is
  confirmed end to end, including the fallback timer's actual purpose: it is not a defensive
  measure against a hypothetical failure, it is what completes the state change when a stylesheet
  genuinely drops the animation (tested directly with `animation: none !important`).
- Rule 4's claim that Motion UI transition classes are unsupported under `animate.enter` is
  confirmed for two independent, compounding reasons, not one: Motion UI's real two-class protocol
  (`mui-enter`/`mui-enter-active`) can never be satisfied because `animate.enter` only adds the one
  class name it is given, and even a hypothetical single-class transition fails separately because
  a newly inserted element has no prior frame to transition from without `@starting-style`, which
  is outside the Angular 22 browser target. Any spec offering an `animationIn`/`animationOut`-style
  input (Reveal, Toggler, ResponsiveToggle, Orbit's fallback) must document, in its own words, that
  only keyframe-animation class names are accepted, not Motion UI's transition class names, and
  point at this prototype as the reason.
- Rule 5 (`prefers-reduced-motion: reduce` collapses `animation-duration`/`transition-duration` to
  1ms) needs no extra completion-detection code path: the same `animationend` listener a spec
  already writes for the normal-duration case fires just as reliably at 1ms, only much sooner.
- The keyframe list the `nfs-motion` mixin must ship, confirmed working end to end: `nfs-fade-in`,
  `nfs-fade-out`, `nfs-slide-in-down`, `nfs-slide-out-up`, `nfs-hinge-in-from-top`, `nfs-spin-out`
  (the six the ticket names as "at least"). This prototype's durations (500ms for every keyframe,
  1ms under reduced motion) are prototype values only, not a spec decision; each spec picks its own
  duration per Foundation/Motion UI's documented defaults (`research/foundation-utilities-
  conventions.md` 4.1's table) and states it.
- The fallback timer's declared-duration-plus-100ms design (ADR 0003 rule 1, Material's mechanic)
  is confirmed as a fixed, directive-known value (not a value measured from `getComputedStyle`),
  because the directive must complete correctly even when the stylesheet that would have supplied
  a measurable duration is the very thing that is missing. This design-time rule applies to
  library-owned animations like the ones tested here; where the Motion class is consumer-chosen
  (Toggler's `animate`, building-blocks 1.6 rule 1), the duration is measured instead, because a
  dropped consumer stylesheet must still complete: a measured zero completes at once, refining
  rather than contradicting this design-time rule.

### CSS added

Everything added is either the library's own shipped `nfs-*` keyframe CSS (building-blocks.md 1.6
rule 4) or a verbatim copy of Motion UI's own published CSS kept only to test it, never to restyle
anything Foundation already styles:

- Six `@keyframes` (`nfs-fade-in`, `nfs-fade-out`, `nfs-slide-in-down`, `nfs-slide-out-up`,
  `nfs-hinge-in-from-top`, `nfs-spin-out`) and their six one-line `.nfs-*` animation-trigger classes.
- One `.state-box.is-open` rule (reuses `nfs-fade-in`) and one `.state-box.no-anim.is-open` override
  rule for the dropped-stylesheet test.
- One `@media (prefers-reduced-motion: reduce)` block collapsing all seven animation classes above
  to 1ms.
- Two rules copied verbatim from `node_modules/motion-ui/dist/motion-ui.css` lines 1-11 (this
  repo's `node_modules/motion-ui`, a devDependency of this repo, not of the shipped library or this
  prototype's own `package.json`): `.slide-in-down.mui-enter` and
  `.slide-in-down.mui-enter.mui-enter-active`, used only to test the real Motion UI class under
  `animate.enter`.
- One prototype-only `.solo-slide-in-down` rule (not from Motion UI; a stand-in engineered to
  isolate the `@starting-style` reason from the two-class-protocol reason).

Nothing here restyles anything Foundation for Sites already styles; this app has no
`foundation-sites` Sass dependency, because the question is about Angular's animation instruction
against generic CSS, not Foundation's visual contract (the same reasoning prototype 52 gave for the
same choice).

### OPEN FOR HUMAN

Settled: see the ticket's Triage. No run log was kept for this prototype in the effort directory; the results above are taken from the ticket's captured tables.

- Whether Case 4b's finding (a single-class transition with a genuine `transition-property` is left
  attached by Angular's cleanup, unlike Case 4a's unmatched-selector class, which is stripped almost
  immediately) belongs in `research/angular-rendering-modes.md` or a note beside prototype 52's own
  mechanism finding, since both prototypes now describe the same `runEnterAnimation` cleanup from
  different angles. Recommend the orchestrator cross-link this README and prototype 52's README
  rather than duplicating the mechanism description into a research file.
- Whether any spec's `animationIn`/`animationOut`-style input should validate at dev time that a
  consumer-supplied class name is a keyframe animation and reject (or warn on) a transition class
  name it recognizes from Motion UI's own catalogue (`research/foundation-utilities-conventions.md`
  4.1's thirteen names), versus silently doing nothing, which is what happens today. This is a
  developer-experience question the map has not decided, not a fact this prototype can settle.

Prototype capture: `prototypes/motion-ui-animate-enter/` (this directory).
Runnable workspace: `D:/tmp/nfs-proto-motion-ui-animate-enter/app` (kept; not committed).
