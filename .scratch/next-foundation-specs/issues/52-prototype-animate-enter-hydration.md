# 52. Prototype: `animate.enter` at hydration

Type: prototype
Status: resolved
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

When a server-rendered element carrying `animate.enter` (directly, or inside a `@defer (hydrate on ...)` block) hydrates, does its enter animation play, and can a directive suppress it without internal Angular flags? The rendering-modes research found no guard in the source and no test covering it.

Read first: `building-blocks.md` (1.6 rules 2 and 7, 1.11 decision 10, and the Table B cells that cite this prototype; it has no matrix row of its own), `adr/*.md`, `research/angular-rendering-modes.md`, `research/angular-22-api-survey.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-animate-enter-hydration/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/animate-enter-hydration/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Built as a plain Angular CLI 22.2.0 application with `@angular/ssr` (`npx @angular/cli@22.2.0 new app --ssr`)
rather than the Nx workspace this ticket's "How to work it" describes: the working session that assigned
this ticket overrode that with the CLI shape, on the reasoning that a bare `@angular/ssr` app is the smallest
runnable thing that exercises SSR, hydration, prerendering, and `@defer` hydrate triggers, and it avoids Nx
scaffolding the question does not need. The generator resolved `@angular/core` to `^22.2.0` and TypeScript to
`~6.0.2` on its own, matching the map's pin exactly; nothing needed to be pinned back. Cross-browser coverage
used `@playwright/test` projects (chromium, firefox, webkit) rather than `/playwright-cli`, per the same
override, since the question needed an automated multi-browser matrix rather than interactive driving.

**Verdict:** `animate.enter` plays its enter animation at hydration for every server-rendered case tested --
full hydration, both `@defer (hydrate on interaction)` and `@defer (hydrate on viewport)`, and a prerendered
route -- in Chromium, Firefox, and WebKit alike, confirming the source reading in
`research/angular-rendering-modes.md` section 3 (no hydration guard in `animateEnter`/`runEnterAnimation`).
A directive *can* suppress it, but only two of three suppression approaches tried actually work, and the
reason they diverge is a specific, checkable mechanism, not an unpredictable race: Angular defers the actual
class-adding for `animate.enter` into its own `afterNextRender`-scheduled animation queue
(`packages/core/src/animation/queue.ts` `scheduleAnimationQueue`, `mixedReadWrite` phase), and that same
instruction has a `requestAnimationFrame` check that strips the enter class immediately if no animation is
actually running at that point (`animation.ts` runEnterAnimation, "In the case that the classes added have no
animations, we need to remove the classes right away"). A CSS gate that stays active through that check
permanently suppresses the animation; a CSS gate lifted any time before that check (any `afterNextRender`
phase in the same render pass, since all of them resolve before the browser's next paint) does not.

### Results

| Case | Route / mechanism | Result | Evidence |
| --- | --- | --- | --- |
| case1-static / case3-static | Full hydration / prerendered, plain `animate.enter="nfs-fade-in"` | Animation plays at hydration | `animationstart` recorded ~130-370ms after navigation depending on browser/machine load; same outcome in Chromium, Firefox, WebKit |
| case1-suppressed / case3-suppressed | `[animate.enter]="signal('')"`, never flipped true | Suppressed permanently | No `animationstart` recorded in any browser |
| case1-cssgate / case3-cssgate | CSS gate lifted in the default (`mixedReadWrite`) `afterNextRender` phase | Not suppressed; animation plays | `animationstart` recorded at the same time as case1-static |
| case1-cssgate-read | CSS gate lifted in the `read` phase (later in the same render pass) | Not suppressed; animation plays | `animationstart` recorded at the same time as case1-static |
| case1-cssgate-delayed | CSS gate lifted via `setTimeout(..., 700)` | Suppressed permanently | No `animationstart`; direct inspection at 2s shows the element's class list never gained the gated class -- Angular's own cleanup removed it after finding no running animation |
| case2-interaction | `@defer (hydrate on interaction)`, clicked | Animation plays once the block hydrates | `animationstart` recorded after the click |
| case2-viewport | `@defer (hydrate on viewport)`, scrolled into view | Animation plays once the block hydrates | `animationstart` recorded after scroll |
| case4-control | Created client-side ~50ms after hydration (never server-rendered) | Animation plays (control) | `animationstart` recorded ~60-70ms after creation |

No failures and no errors to record: all three Playwright projects (chromium, firefox, webkit) ran to
completion with identical animated-test-id sets on this Windows arm64 machine. WebKit is not left unproven
here; both the install (`npx playwright install webkit`, already cached from other sessions) and the test run
succeeded without incident.

### What this prototype does not prove

- Incremental hydration nesting beyond one level, or `hydrate on idle` / `hydrate on timer` / `hydrate when`
  / `hydrate never` triggers (only `interaction` and `viewport` were built).
- Whether the same suppression timing holds for `animate.leave`, or for the `(animate.enter)`
  function-callback form (only the class-list form was tested, matching building-blocks.md 1.6 rules 2 and 4).
- Behaviour specifically under zoneless change detection (the app used zone.js, the CLI default for `--ssr` at
  22.2.0; render-callback timing is documented as zone-independent, but this prototype did not verify that
  directly).
- Whether the `read`-phase and `setTimeout` results generalise beyond this one machine's timing; the mechanism
  (Angular's own rAF-based animation-detection cleanup) is architectural rather than timing-tuned, so it
  should generalise, but only one machine was used here.

### Decision handed to the blocked spec tickets

`animate.enter` must not sit on a persistent, server-rendered element without an explicit suppression
mechanism, because it plays its enter animation at hydration in every rendering mode tested. This confirms
that `adr/0003-animation-mechanics.md` and `building-blocks.md` 1.6 rule 7 / 1.11 decision 10 were right to
choose State classes (rule 1) for persistent elements (Reveal, OffCanvas, dropdown panes, Toggler targets):
that choice was necessary, not merely cautious. Any spec that still wants `animate.enter` suppressed on a
hydrating element rather than switching to State classes should use the signal-gated class list (bind the
class name to a signal that starts empty and is set only from a render callback that can be proven to run
after the element is known to be genuinely new), not a CSS gate: a CSS gate only works if its removal is
deliberately deferred past the first post-render animation frame, which makes it a harder pattern to get
right and to review than the signal form, for no benefit over it.

CSS added for this prototype is minimal and follows the map's own naming rule (building-blocks.md 1.6 rule 4:
Motion classes ship under Foundation's Motion UI names prefixed `nfs-`): one `@keyframes nfs-fade-in` and four
one-line `.box`/`.nfs-fade-in*` rules, plus three one-line gate rules. Nothing Foundation already styles was
touched or reimplemented, and the prototype has no `foundation-sites` dependency: it tests Angular's
hydration/animation instruction behaviour, not Foundation's visual contract, so there was nothing of
Foundation's to reuse here.

### OPEN FOR HUMAN

- Whether the mechanism this prototype adds (Angular's rAF-based "no animation detected, strip the class"
  cleanup, and the resulting same-tick-vs-later-tick suppression split) should be folded into
  `research/angular-rendering-modes.md` section 3 and the `adr/0003`/`adr/0008` prose, or left as a pointer to
  this README. Recommend the orchestrator link this prototype's README from those documents' "prototype P11"
  references rather than duplicating the finding.
- Whether any spec should actually adopt the signal-gated or delayed-CSS-gate suppression pattern in
  production, given the map already chose State classes for every persistent animated element (Reveal,
  OffCanvas, dropdown panes, Toggler, Orbit fallback). This prototype only establishes that the option exists
  and how it works; it does not evaluate whether it is worth the added complexity for any specific plugin.

Prototype capture: [prototypes/animate-enter-hydration/](../prototypes/animate-enter-hydration/README.md).
Runnable workspace: `D:/tmp/nfs-proto-animate-enter-hydration/app` (kept; not committed).

Orchestrator, 2026-09-26: both items above are settled by decisions the map already holds, so they are closed here rather than left for the human. (1) The finding stays in this prototype; the documents that cited the prototype now link this ticket by name, and the rendering-modes research keeps its source reading with this prototype as its verification. (2) No spec adopts the suppression pattern: ADR 0003 and building-blocks 1.6 rule 7 keep State classes for every persistent animated element, and this prototype's verdict is the reason they must.
