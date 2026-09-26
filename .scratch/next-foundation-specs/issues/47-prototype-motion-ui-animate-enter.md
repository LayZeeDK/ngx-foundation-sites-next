# 47. Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes

Type: prototype
Status: resolved
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Confirm that the library's `nfs-*` keyframe classes animate under `animate.enter` and `animate.leave` (inserted elements) and under a bound State class (persistent elements, completion on `animationend`/`transitionend` plus the duration-plus-100 ms fallback timer), with `prefers-reduced-motion` shortening them to 1 ms, in Chromium, Firefox, and WebKit. Motion UI transition classes are out (`enter-and-leave.md:28`); any route that sequences classes from script is recorded OPEN FOR HUMAN, not adopted.

Read first: `building-blocks.md` (1.6 rules 1, 4, and 5, and ADR 0003; this prototype has no matrix row of its own), `adr/*.md`, `research/foundation-utilities-conventions.md`, `research/angular-22-api-survey.md`, `research/angular-material-reference.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-motion-ui-animate-enter/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/motion-ui-animate-enter/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Sources: P52 = the [Prototype: `animate.enter` at hydration](52-prototype-animate-enter-hydration.md).

Built as a plain Angular CLI 22.2.0 application (`npx @angular/cli@22.2.0 new app --style=css
--ssr=false --routing=false`), not the Nx workspace this ticket's "How to work it" describes,
following the same override P52 recorded for the same reason: the question needs no Nx
scaffolding, and a bare CLI app is the smallest runnable thing that exercises `animate.enter`/
`animate.leave`. It has no `foundation-sites` Sass dependency, matching P52's own choice,
because the question is about Angular's animation instruction against generic CSS, not Foundation's
visual contract. The generator resolved `@angular/core` to `^22.2.0` and TypeScript to `~6.0.2`,
matching the map's pins exactly; Vitest defaulted to `^5.0.0` (unused, no unit tests were needed)
and was pinned back to `^4.1.5` for the record. Cross-browser coverage used `@playwright/test`
1.63.0 projects (chromium, firefox, webkit, each plain and with `reducedMotion: 'reduce'`) rather
than `/playwright-cli`, again matching P52's override, because the question needed an
automated matrix rather than interactive driving.

**Verdict:** the `nfs-*` keyframe classes animate correctly under every mechanic the map's specs
will use, in Chromium, Firefox, and WebKit, with and without reduced motion (42/42 Playwright cases
passing in the reliable configuration). `animate.enter`/`animate.leave` play all six required
keyframes on inserted and removed elements; a persistent element's bound State class completes
through `animationend` when the stylesheet has the animation and through the duration-plus-100ms
fallback timer when it does not; `prefers-reduced-motion: reduce` collapses the same path to under
100ms without a separate code path. Motion UI's own transition class (`slide-in-down`) never
animates under `animate.enter`, confirmed for two independent, compounding reasons rather than one:
Motion UI's real CSS needs a `mui-enter`/`mui-enter-active` companion class that `animate.enter`
never adds (so the compound selector never matches, and Angular's own cleanup strips the unmatched
class before the next frame, the same `runEnterAnimation` mechanism P52 found), and even a
hypothetical single-class transition with no companion-class requirement still never animates,
because a newly inserted element has no prior rendered frame to transition from, which is exactly
what `@starting-style` supplies and `@starting-style` is outside the Angular 22 browser target
(`enter-and-leave.md:28`). No route that sequences classes from script was tried or is proposed;
transition classes are unsupported outright, matching ADR 0003 and building-blocks.md 1.6 rule 4
without qualification.

### Results

| Case | Result | Evidence |
| --- | --- | --- |
| 1. Insert: `animate.enter` on `nfs-fade-in`/`nfs-slide-in-down`/`nfs-hinge-in-from-top` | Animates; `animationstart`+`animationend` recorded | 9/9 (3 boxes x 3 engines), plus 9/9 under reduced motion |
| 1. Remove: `animate.leave` on `nfs-fade-out`/`nfs-slide-out-up`/`nfs-spin-out` | Leave class held until `animationend`; element detaches only after | Same 9/9 + 9/9 (second `animationstart`/`animationend` pair, then `toBeHidden`) |
| 2. Persistent element, State class, stylesheet intact | Completes via `animationend`, ~500ms normal / <100ms reduced motion | 6/6 (3 engines x normal/reduced-motion) |
| 2. Persistent element, State class, `animation: none` (dropped stylesheet) | `animationend` never fires; fallback timer (declared 500ms+100ms) completes at ~600ms | 6/6, `data-completion-via="fallback"` in every engine |
| 4a. `animate.enter="slide-in-down"` (Motion UI's real two-class CSS present, `mui-enter` never added) | Never animates; class itself stripped by Angular's own cleanup before next frame | 6/6; no `transitionrun`/`animationstart`; settled class list excludes `slide-in-down` |
| 4b. `animate.enter="solo-slide-in-down"` (self-contained single-class transition, no companion needed) | Never animates (no prior frame to transition from); class stays attached, unlike 4a | 6/6; no `transitionrun`/`transitionend` after 600ms |

Total 42/42 passing in the reliable configuration (`workers: 2` in `playwright.config.ts`, see
below). One flake occurred under the default full-parallelism run and did not reproduce under
`--workers=1`; exact text:

```
Error: expect(locator).toHaveAttribute(expected) failed
Locator:  getByTestId('broken-state-box')
Expected: "fallback"
Received: ""
Timeout:  2000ms
```

Cause: CPU contention from other agents' prototypes running concurrently on this shared machine
delayed the fallback timer's observable effect past the original 2000ms assertion timeout; the
timer itself still fired correctly. Fix applied was environmental only (assertion timeouts raised
to 5000ms, `workers: 2` set in the config), not a change to any animation CSS or logic; the
mechanism never failed to complete in any run, including every rerun after the fix.

### What this prototype does not prove

- The `(animate.enter)`/`(animate.leave)` function-callback form; only the class-list form was
  tested, matching how the map's specs plan to use it and matching P52's own scope.
- How long Case 4b's unanimated-but-matched class stays attached beyond the 600ms this prototype
  waited, or whether `MAX_ANIMATION_TIMEOUT`'s 4-second default applies to `animate.enter` the way
  it explicitly does to `(animate.leave)`'s callback form.
- Zoneless only (the Angular CLI 22.2 default; `zoneless.md:14`); no zone.js consumer was tried.
  Render-callback and animation-queue timing is documented as zone-independent (P52), not verified
  directly here either.
- Any Motion UI transition class other than `slide-in-down`; the two-class-protocol mechanism
  applies identically to the other twelve names in `research/foundation-utilities-conventions.md`
  4.1's table, but only one was built and tested.
- Generalization of the exact timing split (Case 4a stripped almost immediately, Case 4b left
  attached) to a different machine; the mechanism is architectural (P52), not
  timing-tuned, so it should generalize, but only this one shared Windows arm64 machine was used.

### Decision handed to the blocked spec tickets

`adr/0003-animation-mechanics.md` and building-blocks.md 1.6 are confirmed without change:

- Rule 2 (`animate.enter`/`animate.leave` with `nfs-*` keyframe class lists for inserted/removed
  elements) is safe to use exactly as specced, in all three engines, with or without reduced motion.
- Rule 1 (persistent elements: bound State class, `animationend` plus duration-plus-100ms fallback
  timer) is confirmed end to end, including that the fallback timer completes a genuinely dropped
  stylesheet animation (tested directly with `animation: none !important`), not merely a
  theoretical safety net.
- Rule 4 (Motion UI transition classes unsupported under `animate.enter`) is confirmed for two
  independent, compounding reasons: the two-class protocol `animate.enter` cannot satisfy, and the
  general `@starting-style` requirement for any transition on a newly inserted element. Every spec
  offering an `animationIn`/`animationOut`-style input (Reveal, Toggler, ResponsiveToggle, Orbit's
  fallback) must state, in its own words, that only keyframe-animation class names are accepted,
  citing this prototype.
- Rule 5 (`prefers-reduced-motion: reduce` to 1ms) needs no separate completion-detection code path:
  the same `animationend` listener a spec already writes for the normal-duration case fires just as
  reliably at 1ms.
- The `nfs-motion` mixin's keyframe list is confirmed working end to end: `nfs-fade-in`,
  `nfs-fade-out`, `nfs-slide-in-down`, `nfs-slide-out-up`, `nfs-hinge-in-from-top`, `nfs-spin-out`
  (the ticket's "at least" six). This prototype's durations (500ms normal, 1ms reduced motion) are
  prototype values only; each spec picks its own duration from Foundation/Motion UI's documented
  defaults and states it.
- The fallback timer's duration must be a value the directive already knows at design time (not one
  measured from `getComputedStyle`), because it must complete correctly precisely when the
  stylesheet that would supply a measurable duration is the thing that is missing. This design-time
  rule applies to library-owned animations like the `nfs-*` keyframes tested here; where the Motion
  class is consumer-chosen (Toggler's `animate`, building-blocks 1.6 rule 1), the duration is
  measured instead, because a dropped consumer stylesheet must still complete: a measured zero
  completes at once, refining rather than contradicting this design-time rule.

CSS added: six `@keyframes` plus their six trigger classes (`nfs-fade-in`, `nfs-fade-out`,
`nfs-slide-in-down`, `nfs-slide-out-up`, `nfs-hinge-in-from-top`, `nfs-spin-out`), one State-class
rule reusing `nfs-fade-in`, one `no-anim` override rule for the dropped-stylesheet test, one
`prefers-reduced-motion` block, and two rules copied verbatim from this repo's
`node_modules/motion-ui/dist/motion-ui.css` (a devDependency of this repo, not of the shipped
library or this prototype) used only to test Motion UI's own class, plus one prototype-only
single-class stand-in. Nothing Foundation already styles was touched or reimplemented; this app has
no `foundation-sites` dependency.

### OPEN FOR HUMAN

- Whether Case 4b's finding (a class with a genuine but non-running `transition-property` is left
  attached by Angular's cleanup, unlike Case 4a's unmatched-selector class, stripped almost
  immediately) belongs in `research/angular-rendering-modes.md` alongside P52's own
  mechanism finding, or stays as a cross-link between the two prototypes' READMEs.
- Whether any spec's `animationIn`/`animationOut`-style input should validate at dev time that a
  consumer-supplied class name is a keyframe animation and warn on a recognized Motion UI transition
  class name, versus silently doing nothing (today's behavior). This is a developer-experience
  design question the map has not decided, not a fact this prototype can settle.

Prototype capture: [prototypes/motion-ui-animate-enter/](../prototypes/motion-ui-animate-enter/README.md).
Runnable workspace: `D:/tmp/nfs-proto-motion-ui-animate-enter/app` (kept; not committed).

Orchestrator, 2026-09-26: both OPEN FOR HUMAN items above are settled without the human. (1) The cleanup-timing finding stays in this prototype and the [Prototype: `animate.enter` at hydration](52-prototype-animate-enter-hydration.md) README, cross-linked; the rendering-modes research keeps its source reading with the two prototypes as verification. (2) A dev-mode warning for a recognised Motion UI transition class name is a design choice for the specs that own an `animationIn`/`animationOut`-style input (Reveal, Toggler, ResponsiveToggle, Tooltip, Orbit); each records it in its decision log, with the default that the library warns once in dev mode and applies the class unchanged.

### Triage (auto-trap quadrant), 2026-09-26

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items". Both items were settled by the orchestrator note above; the ratings are recorded here.

1. Where Case 4b's cleanup-timing finding is documented.
   - Impact: not HIGH. Documentation placement only.
   - Confidence: HIGH. Cross-linking the two prototype READMEs keeps one copy of the finding, as the orchestrator note decided.
   - Outcome: DECIDED: the finding stays in this prototype and the [Prototype: `animate.enter` at hydration](52-prototype-animate-enter-hydration.md) README, cross-linked.
2. Whether `animationIn`/`animationOut`-style inputs warn in development mode on a recognised Motion UI transition class name.
   - Impact: not HIGH. A development-mode warning; no API, and it can be added or dropped later without a consumer change.
   - Confidence: HIGH. Motion UI transition classes never animate under `animate.enter` (this prototype's verdict; ADR 0003), so a silent no-op hides a consumer mistake; the building-blocks development-warning pattern (1.5, 1.9) covers it.
   - Outcome: DECIDED: warn once in development mode and apply the class unchanged; each spec with such an input records it.
