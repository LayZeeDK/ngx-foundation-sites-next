# Prototype: animate.enter at hydration

Ticket: [Prototype: `animate.enter` at hydration](../../issues/52-prototype-animate-enter-hydration.md).

## Question

When a server-rendered element carrying `animate.enter` (directly, inside a `@defer (hydrate on ...)`
block, or under a prerendered route) hydrates, does its enter animation play? And can a directive
suppress that animation without reading internal Angular flags?

## What is here

The decisive files only (a full Angular CLI 22.2.0 `--ssr` application). The runnable workspace,
including `node_modules`, the build output, and the Playwright browser cache, stays at
`D:/tmp/nfs-proto-animate-enter-hydration/app` and is not committed.

- `src/index.html` -- sets three `.nfs-hydrating*` gate classes on `<html>` before Angular boots.
- `src/styles.css` -- the CSS-gate rules (global, unencapsulated -- see the comment in
  `src/app/pages/full/full.css` for why this can't live in a component stylesheet).
- `src/app/app.ts` -- three variants of lifting the hydration gate (default `afterNextRender` phase,
  `read` phase, and a 700ms `setTimeout`).
- `src/app/pages/full/full.ts` (+`full.css`) -- the full-hydration route: a plain `animate.enter`
  element, a signal-suppressed element, three CSS-gate variants, and a client-created control.
- `src/app/pages/defer/defer.ts` + `deferred-box.ts` -- `@defer (hydrate on interaction)` and
  `@defer (hydrate on viewport)` blocks, each containing an `animate.enter` element.
- `src/app/pages/prerendered/prerendered.ts` -- the same static/suppressed/gated cases under a
  `RenderMode.Prerender` route.
- `src/app/app.routes.ts` / `app.routes.server.ts` -- `/full` and `/defer` are `RenderMode.Server`;
  `/prerendered` is `RenderMode.Prerender`.
- `e2e/animate-enter-hydration.spec.ts` -- Playwright tests. Each test installs a capture-phase
  `animationstart` listener via `page.addInitScript` before navigation, so it records every element
  whose enter keyframe actually started, then asserts/logs the observed set.
- `playwright.config.ts` -- three projects (chromium, firefox, webkit), no `webServer` (the server is
  started by hand; see below).

## How to run

Versions used: Angular CLi 22.2.0, `@angular/core` `^22.2.0`, TypeScript `~6.0.2` (matches the map's
pin exactly; the generator did not pull anything else in). `@playwright/test` 1.63.0 with Chromium,
Firefox, and WebKit already present in the shared `ms-playwright` cache.

```
cd D:/tmp/nfs-proto-animate-enter-hydration/app
npx ng build
PORT=4521 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs
# in another shell:
npx playwright test --project=chromium   # or firefox / webkit
```

`NG_ALLOWED_HOSTS` is required: `@angular/ssr`'s request handler rejects the `Host` header otherwise
("Header \"host\" ... is not allowed"), even for `localhost`.

## Verdict

**Yes, `animate.enter` plays its enter animation at hydration** for every server-rendered case tested
(full hydration, both `@defer (hydrate on ...)` triggers, and a prerendered route), in Chromium,
Firefox, and WebKit alike -- confirming `research/angular-rendering-modes.md` section 3's source
reading (no hydration guard in `animateEnter`/`runEnterAnimation`).

**A directive can suppress it, but only two of the three approaches tried actually work:**

1. **Signal-gated class list** (`[animate.enter]="neverTrueSignal()"`) -- works. The class list is
   empty at the point Angular's animation queue reads it, so nothing is ever added, checked, or
   played. This is a permanent, reliable suppression.
2. **CSS gate lifted in the same JS tick** (`afterNextRender` default phase, or the `read` phase) --
   does **not** suppress. Angular defers the actual class-adding for `animate.enter` into its own
   `afterNextRender`-scheduled queue (`packages/core/src/animation/queue.ts` `scheduleAnimationQueue`,
   `mixedReadWrite` phase). Any gate-lifting code registered in the same render pass -- whatever
   phase -- still runs before the browser's next paint/rAF, so by the time Angular (or the browser)
   would check whether an animation is running, the gate is already gone and the animation plays
   normally.
3. **CSS gate lifted later (`setTimeout`, 700ms)** -- works, and not merely by delaying the
   animation. Angular's own `runEnterAnimation` has a `requestAnimationFrame` check
   (`animation.ts` lines ~153-162: "In the case that the classes added have no animations, we need
   to remove the classes right away") that fires one frame after the enter classes are added. If the
   CSS gate is still active at that check (because the gate-lifting code has not run yet), Angular
   finds no running animation and strips the enter class immediately. The class is gone long before
   a later gate removal could matter, so the animation never starts -- this is permanent suppression,
   not postponement.

Practical rule for a suppression directive: **do not race Angular's own render-callback phases**
(`afterNextRender`, `afterRenderEffect`, any phase) -- they all resolve before the same browser frame
Angular's own cleanup check runs in. A CSS gate only works if its removal is deliberately deferred
past that first post-render animation frame (a `setTimeout`, or two nested `requestAnimationFrame`
calls). The signal-gated approach is simpler, does not depend on this timing race, and is what
`adr/0003-animation-mechanics.md` and `building-blocks.md` 1.6 rule 7 already chose for persistent
elements (State classes instead of `animate.enter`).

## Results

| Case | Route / mechanism | Result | Evidence |
| --- | --- | --- | --- |
| case1-static / case3-static | Full hydration / prerendered, plain `animate.enter="nfs-fade-in"` | Animation plays at hydration | `animationstart` recorded at ~130-370ms after navigation (varies by browser/machine load), same outcome in Chromium, Firefox, WebKit |
| case1-suppressed / case3-suppressed | `[animate.enter]="signal('')"`, never flipped | Suppressed (never animates) | No `animationstart` recorded in any browser |
| case1-cssgate / case3-cssgate | CSS gate lifted in the default (`mixedReadWrite`) `afterNextRender` phase | Not suppressed -- animation plays | `animationstart` recorded at the same time as case1-static |
| case1-cssgate-read | CSS gate lifted in the `read` phase (later in the same render pass) | Not suppressed -- animation plays | `animationstart` recorded at the same time as case1-static |
| case1-cssgate-delayed | CSS gate lifted via `setTimeout(..., 700)` | Suppressed (never animates) | No `animationstart`; direct inspection at 2s shows the element's class list never gained `nfs-fade-in-gated-delayed` (Angular's own cleanup removed it after finding no running animation) |
| case2-interaction | `@defer (hydrate on interaction)`, clicked | Animation plays once the block hydrates | `animationstart` recorded after the click |
| case2-viewport | `@defer (hydrate on viewport)`, scrolled into view | Animation plays once the block hydrates | `animationstart` recorded after scroll |
| case4-control | Created client-side ~50ms after hydration (never server-rendered) | Animation plays (expected control) | `animationstart` recorded ~60-70ms after creation |

Exact failures: none. All three Playwright projects (chromium, firefox, webkit) ran and produced
identical pass/fail and identical animated-test-id sets on this Windows arm64 machine; WebKit is not
unproven here.

## What this prototype does not prove

- Incremental hydration nesting beyond one level, or `hydrate on idle` / `hydrate on timer` /
  `hydrate when` / `hydrate never` triggers (only `interaction` and `viewport` were built).
- Whether the same suppression timing holds for `animate.leave`, or for the `(animate.enter)`
  function-callback form (only the class-list form was tested, matching how the map's specs plan to
  use it, building-blocks.md 1.6 rule 2 and rule 4).
- Behaviour under zoneless change detection specifically: zoneless is the Angular CLI 22.2 default
  (`zoneless.md:14`), and no zone.js consumer was tried here; the map's rendering-modes research
  treats render-callback timing as zone-independent, but this prototype did not verify that
  directly.
- Whether the `read`-phase and `setTimeout` results generalise to a slower or faster machine; the
  mechanism (Angular's own rAF-based animation-detection cleanup) is architectural, not timing-tuned,
  so it should generalise, but only one machine was used here.

## Decision handed to the blocked spec tickets

`animate.enter` **must not be placed on a persistent, server-rendered element** without an explicit
suppression mechanism, because it plays its enter animation at hydration in every rendering mode
tested. `adr/0003-animation-mechanics.md` and `building-blocks.md` 1.6 rule 7 / 1.11 decision 10
already chose State classes (rule 1) for persistent elements (Reveal, OffCanvas, dropdown panes,
Toggler targets) for this reason -- this prototype confirms that choice was necessary, not merely
cautious, and confirms the reasoning: no hydration guard exists in `animateEnter`.

For any spec that still wants `animate.enter` suppressed on a hydrating element rather than switching
to State classes, the working pattern is the signal-gated class list (case1-suppressed): bind the
class name(s) to a signal that starts empty and is set only from a render callback that the spec can
prove runs after the element is known to be genuinely new (never for an element that existed in
server HTML). A CSS gate is not a safe alternative for a directive author who does not want to reason
about `requestAnimationFrame` ordering against Angular's internal animation-queue scheduling.

CSS added for this prototype is minimal and follows the map's own naming rule
(building-blocks.md 1.6 rule 4: Motion classes ship under Foundation's Motion UI names prefixed
`nfs-`): one `@keyframes nfs-fade-in` and four one-line `.box`/`.nfs-fade-in*` rules in
`src/app/pages/full/full.css`, plus the three gate rules in `src/styles.css`. Nothing Foundation
already styles was touched or reimplemented; this prototype has no `foundation-sites` dependency
because it tests Angular's hydration/animation instruction behaviour, not Foundation's visual
contract.

## OPEN FOR HUMAN

Settled: see the ticket's Triage. No run log was kept for this prototype in the effort directory; the results above are taken from the ticket's captured tables.

- Whether the `read`-phase-loses-the-race finding changes the recommended mechanism in
  `research/angular-rendering-modes.md` section 3 and `adr/0003`/`adr/0008` (currently they only
  state the fact "no hydration guard exists"; this prototype adds the mechanism and the one working
  workaround). Recommend the orchestrator link this README from the documents that cite this
  prototype by name rather than duplicating the finding into them.
- Whether any spec should actually use the signal-gated or delayed-CSS-gate suppression pattern in
  production, given the map already chose State classes for every persistent animated element
  (Reveal, OffCanvas, dropdown panes, Toggler, Orbit fallback) -- this prototype only establishes that
  the option exists and how it works; it does not evaluate whether it is worth the complexity next to
  State classes for any specific plugin.
