# 71. Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback

Type: prototype
Status: resolved
Blocked by: 23
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Responsive Menu](23-spec-responsive-menu.md) answer. That spec depends on an amendment to the [Spec: Nested menu shared utility](56-spec-nested-menu.md) recorded in [ADR 0035](../adr/0035-responsive-menu-swap-commit.md): the root keeps the mode it displays separate from the mode it is driven to, its `earlyRead` render callback reads the driven mode, `document.activeElement`, and DOM order, and its `write` callback sets the displayed mode and prunes the Open path, so a swap never renders the new mode over a submenu the swap closes; and every ResponsiveMenu instance starts from the Server breakpoint's mode. With the real Breakpoint service and the amended root hosting the three menu roots under `nfsResponsiveMenu="drilldown medium-dropdown large-accordion"`, in Chromium, Firefox, and WebKit, zoneless, on CSR, SSR, and prerendered routes:

1. Does every Mode swap (a resize across each threshold in both directions, a `rules` change, and the first-render handoff) render the new mode and the pruned Open path in the same change-detection pass, with no pass that shows the new root class over a submenu the swap closes (a `MutationObserver` record per pass)? Does focus stay on the same control in the [Prototype: Nested menu directive family with breakpoint mode switching](50-prototype-nested-menu.md) cases F1 to F4, land on the level's first control when a back button held it and the swap leaves drilldown, and stay on a toggle focused before hydration at a 1280 px viewport while the main bundle is held back? This is the case that decides a reopen.
2. Does the root's swap callback commit in the same tick when the service going live and the directive's first-render flag dirty it, so a client-rendered route paints no frame of the Server breakpoint's mode (per-frame recorder), and does a menu inside `@defer (hydrate on viewport)` hydrate as sent (`componentsSkippedHydration === 0`, the Server breakpoint's classes in the hydration frame) before it swaps?
3. Does a swap into dropdown with focus outside the menu close a submenu opened by a static `is-active`, emitting `closed` once and writing `false` back to a two-way `[(expanded)]`?

The spec assumes yes to all three. Fallbacks it names: if question 1 fails, the root records the focused control from `focusin`/`focusout` and restores it in an `afterNextRender` after the swap; if question 2 fails, each instance starts from the Breakpoint service's `current` (ADR 0014), and the spec states the deferred and client-created cases that then skip the swap rule. A failed case reopens the Responsive Menu spec (and the Nested menu amendment) with that fallback; otherwise the verdict is appended to both decision logs.

Read first: `specs/responsive-menu.md` (API, the swap, rendering modes, the fallbacks), `specs/nested-menu.md` (the root, `drive()`, the mode-swap rule, and the amendment the Responsive Menu answer proposes), `adr/0035-responsive-menu-swap-commit.md`, `adr/0014-breakpoint-service-first-render-handoff.md`, `adr/0032-responsive-accordion-tabs-instance-first-render.md`, `specs/breakpoint-service.md` (the handoff and consumer rule 1), `building-blocks.md` 1.5 (the rendered-state rule), the nested-menu prototype's answer and `prototypes/nested-menu/README.md`, and the [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](67-rerun-interchange-replaced-timing.md) answer on render-hook ordering.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: copy the nested-menu prototype's plain Angular CLI 22.2 `--ssr` workspace to `D:/tmp/nfs-proto-responsive-menu-swap/` (Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0), amend its root as ADR 0035 describes, and add a minimal Breakpoint service with the handoff the Breakpoint service spec defines. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test` in all three engines, with real viewport resizes, a held-back main bundle for the pre-hydration case, and a prerendered route.

Capture it: copy the decisive files into `prototypes/responsive-menu-swap/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, engine, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Responsive Menu and Nested menu specs (per question: confirmed, or the named fallback), `### Triage`, and anything left `OPEN FOR HUMAN`.

## Answer

Resolved 2026-09-26 by an AFK agent. Prototype files and how to run them: [prototypes/responsive-menu-swap/README.md](../prototypes/responsive-menu-swap/README.md). Workspace: `D:/tmp/nfs-proto-responsive-menu-swap/app`.

Setup: a copy of the nested-menu prototype's plain Angular CLI 22.2 `--ssr` workspace, installed with `npm ci` from its lockfile (no generator ran, nothing re-pinned): `@angular/*` 22.2.0, TypeScript 6.0.3, `foundation-sites` 6.9.0 Sass through Angular's pipeline, `@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0. The lockfile's unused `vitest` 5.0.2 (the map pins 4.1.x) was left as the nested-menu prototype left it. The copied Nested menu root was amended as [ADR 0035](../adr/0035-responsive-menu-swap-commit.md) describes. The displayed mode is a `linkedSignal` over the driven function, so it takes the driven value on its first read and afterwards changes only when the swap `afterRenderEffect` sets it. That effect plans in `earlyRead` (driven mode, `document.activeElement`, DOM order) and commits in `write` (displayed mode, then the pruning). A back-item refocus runs in an `afterNextRender` registered by `write`. The prototype adds a minimal `NfsMediaQuery` with the handoff of [ADR 0014](../adr/0014-breakpoint-service-first-render-handoff.md) and `nfsResponsiveMenu="drilldown medium-dropdown large-accordion"`, which resolves at `serverBreakpoint` until its own `afterNextRender` write flips a first-render flag. It also adds completion outputs emitted by the live root only, seeding from a static `is-active`, and dropdown Light dismiss through a document `focusin` (the Anchored pane spec's focus rule).

Instrumentation, per pass:
- A `MutationObserver` on the document is drained by the first `earlyRead` callback of every after-render batch. That callback is registered from the root environment injector, so it runs before every view-bound callback. Each drain is timestamped and snapshots what the preceding change-detection pass left: the root's mode class and the submenus that are not `inert`.
- A `requestAnimationFrame` recorder logs the root's mode class for each frame.
- `document.activeElement` is logged when the swap is planned, after the render that applied it, and at the end of each case.

Routes: `/csr` (Client), `/ssr` (Server), `/prerendered` (Prerender), `/deferred` and `/deferred-prerendered` (`@defer (hydrate on viewport)` below a spacer, with the service live above it), and `/late` (a client-created instance behind a button), each with a `/current` variant carrying Foundation's static `is-active` on the Products submenu and `[(expanded)]` on its item.

Runs: 49 cases in Chromium 153.0.8010.12, Firefox 155.0, and WebKit (revision 2359), all on Windows 11 arm64. The production build passed 147 of 147. The development build passed 147 of 147 with `componentsSkippedHydration` asserted (`evidence/playwright-prod.log`, `evidence/playwright-dev.log`).

### Verdict

Confirmed for all three questions, with one correction to the keep rule that the ticket's cases did not exercise.
- Question 1: the new mode and the pruned Open path always rendered in the same pass. In every swap and every engine (resizes across 640 px and 1024 px both ways, two-threshold jumps, rules changes, and first-render handoffs on client-rendered, server-rendered, prerendered, deferred, and client-created instances), the pass that first shows the new root class already has the closed submenus `inert`, and no pass shows the new class over a submenu the swap closes. Focus stayed on the same control in F1 to F4 and through rules changes. From a back button it moved to the level's first control after the swap render, on a runtime swap and on the first-render swap alike. A toggle focused before hydration kept focus at 1280 px and at 800 px with the main bundle held back.
- Question 2: the service went live, the flag flipped, and the swap was planned, committed, and rendered in one task. No animation frame ran between the service's construction and the swap render on any route in any engine. A client-rendered route showed no frame of the menu before the swap. A `@defer (hydrate on viewport)` block hydrated as sent: `componentsSkippedHydration` 0, the hydration pass still showing `drilldown`, and the swap following with no frame in between.
- Question 3: the static `is-active` section closed on every swap into dropdown with focus outside, at first render and at runtime. `closed` fired once from the dropdown root, `expandedChange(false)` fired once, and the two-way state read `false`.
- The failure: when focus is on a Hybrid item's link and that item's submenu is open, the published keep rule keeps the submenu open because the item holds focus. Entering drilldown then puts the link inside the `invisible` root level, and focus falls to `body` in all three engines. Closing the submenu whose own row holds focus (its toggle or its Hybrid link) passes in all three engines. This is a correction of the rule's text, not a failure of the commit: the named fallback for question 1 (record focus, restore it after the swap) cannot help, because the control it would restore is hidden.

The controls add two facts. First, the Nested menu spec as written renders one pass with `drilldown` over the still-open submenu in F3, and the recorder catches it in all three engines; focus nevertheless survived there, even with a style-forcing `earlyRead` first, so the amendment's benefit measured here is the pass itself, not a focus loss the old design would have caused in these engines. Second, the ADR 0014 fallback (`start=current`) re-classes a deferred block during its own hydration and leaves the static `is-active` section open as a dropdown overlay at 800 px in deferred and client-created instances, which is the reason the spec starts every instance from the Server breakpoint's mode.

### Results

Engines: C = Chromium, F = Firefox, W = WebKit. "Prod" and "dev" are `evidence/playwright-prod.log` and `evidence/playwright-dev.log` in the prototype directory; case names are the test titles in `e2e/swap.spec.ts`. "Bad passes" counts passes that show the swap's new root class while a submenu it closes is still open.

| # | Case | Engine | Result | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Server HTML of `/ssr/current` at the Server breakpoint (`small`) | server | Pass: root `drilldown invisible`, Products submenu `is-active visible` with no `inert`, its toggle `aria-expanded="true"`, the other submenus `inert`, no `role`, `jsaction="keydown:;"` on the root and `click:;` on toggles and back items; `ng-state` carries `"nfsServerBreakpoint":"small"` | `evidence/ssr-current-nav.html` |
| 2 | F1: dropdown to drilldown (800 to 500 px), focus on Item 1A inside open Item 1 | C F W | Pass: 1 pass, 0 bad; Item 1 stays open; focus on Item 1A; no output | prod "F1" |
| 3 | F2: drilldown to dropdown (500 to 800 px), focus on Item 1A in the open level | C F W | Pass: 0 bad; Item 1 open; focus on Item 1A | prod "F2" |
| 4 | F3: dropdown to drilldown (800 to 500 px), focus on the open Item 1 toggle | C F W | Pass: the pass that first shows `drilldown` already has Item 1 `inert` (0 bad); focus stays on the Item 1 toggle, `aria-expanded="false"`; `closed` once for Item 1 from the drilldown root | prod "F3" |
| 5 | F4: accordion to dropdown (1280 to 800 px), Item 1 and Products open, focus on Boards | C F W | Pass: Item 1 closes in the same pass, Products stays open, focus on Boards, `closed` once for Item 1 | prod "F4" |
| 6 | Dropdown to accordion (800 to 1280 px), focus inside open Item 1 | C F W | Pass: nothing closes, focus stays, no output | prod "dropdown->accordion" |
| 7 | Accordion to drilldown (1280 to 500 px), two open, focus on Boards | C F W | Pass: Item 1 closes, Products stays, focus on Boards | prod "accordion->drilldown focus inside" |
| 8 | Accordion to drilldown (1280 to 500 px), two open, focus outside | C F W | Pass: the first open submenu per level (Item 1) stays, Products closes, `closed` once | prod "accordion->drilldown focus outside" |
| 9 | Accordion to dropdown (1280 to 800 px), Item 1 and Item 1A open, focus outside | C F W | Pass: both close in one pass, `closed` once each, focus stays outside | prod "accordion->dropdown focus outside" |
| 10 | Back button, drilldown to dropdown (500 to 800 px) | C F W | Pass: focus moves to Item 1A in the `afterNextRender` after the swap render; Item 1 stays open | prod "back->dropdown" |
| 11 | Back button, drilldown to accordion (500 to 1280 px, two thresholds) | C F W | Pass: same as row 10 | prod "back->accordion" |
| 12 | Rules change, F3 (`drilldown` at 800 px, focus not moved) | C F W | Pass: as row 4 | prod "rules F3" |
| 13 | Rules round trip `accordion` then `drilldown` at 500 px, focus on Item 1A | C F W | Pass: two swaps, 0 bad, nothing closes, focus stays | prod "rules round trip" |
| 14 | Hybrid link, published keep rule: dropdown to drilldown (800 to 500 px), Products open, focus on the Products link | C F W | Fail: the plan keeps Products open (its item holds focus); the swap renders the root `invisible`; focus is still on the link in the render callback after the swap and on `body` at the end | prod "hybrid-link spec rule" |
| 15 | Hybrid link, row rule (`?rule=row`) | C F W | Pass: Products closes in the same pass as `drilldown` appears, focus stays on the link, `closed` once | prod "hybrid-link row rule" |
| 16 | axe (WCAG 2.2 AA tags plus best-practice) after swaps to dropdown, accordion, drilldown with a submenu open | C F W | Pass: no violations | prod "axe after swap to ..." |
| 17 | Toggle focused before hydration, main bundle held: `/ssr` and `/prerendered` at 1280 px (accordion), `/ssr` at 800 px (dropdown) | C F W | Pass: focus on the Item 1 toggle before and after; 1 swap, 0 bad | prod "pre-hydration /ssr 1280" and siblings |
| 18 | Boards (inside the open Products level) focused before hydration, `/ssr/current` at 800 px | C F W | Pass: Products stays open in dropdown, focus on Boards, no output, two-way state still `true` | prod "pre-hydration current, focus Boards" |
| 19 | Products back button focused before hydration, `/ssr/current` at 800 and 1280 px | C F W | Pass: focus moves to Boards after the swap render; Products stays open | prod "pre-hydration back 800", "... 1280" |
| 20 | First-render handoff, `/csr` at 1280 and 800 px | C F W | Pass: one swap from `drilldown`; 0 frames between the service's construction and the swap render; 0 frames showing the menu before the swap render; 0 `drilldown` frames (timings below) | prod "/csr 1280", "/csr 800" |
| 21 | First-render handoff, `/ssr` and `/prerendered` at 1280 and 800 px | C F W | Pass: 0 frames between the service's construction and the swap render; 0 `drilldown` frames after the service went live (the 1 to 4 frames before hydration are the server HTML, the documented cost); `hydratedComponents` 3, `componentsSkippedHydration` 0 | prod and dev "/ssr ...", "/prerendered ..." |
| 22 | `/ssr` at 500 px | C F W | Pass: no swap entry at all | prod "/ssr at 500" |
| 23 | Client-created instance (`/late`, button at 800 px, service already live) | C F W | Pass: planned `drilldown` to `dropdown` in the creating tick; 0 frames showing the menu before the swap render | prod "/late 800" |
| 24 | `@defer (hydrate on viewport)`, `/deferred` and `/deferred-prerendered` at 1280 and 800 px | C F W | Pass: before the scroll the block is server HTML (`ngb="d0"`); the plan saw `drilldown` on the page (the hydration pass left the server's classes), the passes before the plan all show `drilldown`, 0 frames between the hydration pass and the swap render; `hydratedComponents` 2 then 4, `componentsSkippedHydration` 0 | prod and dev "/deferred ...", `evidence/deferred-markers.txt` |
| 25 | Toggle in the deferred block focused before the block hydrates (the focus scroll triggers hydration), 1280 px | C F W | Pass: focus stays on the Item 1 toggle through hydration and the swap | prod "deferred focus before block hydration" |
| 26 | Question 3 at first render, 800 px: `/csr/current`, `/ssr/current`, `/prerendered/current`, `/deferred/current`, `/late/current` | C F W | Pass: the plan closes Products (focus outside), the pass that first shows `dropdown` has Products `inert`; `expandedChange(false)` once, `closed` once from the dropdown root, status `productsOpen=false`, toggle `aria-expanded="false"` | prod "Q3 /csr/current" and siblings |
| 27 | Question 3 counter-case: `/ssr/current` at 1280 px (entering accordion) | C F W | Pass: Products stays open, no output | prod "Q3 accordion keeps" |
| 28 | Question 3 at runtime: drilldown to dropdown (500 to 800 px), accordion to dropdown (1280 to 800 px), rules change to `dropdown`, focus outside | C F W | Pass: as row 26 in each | prod "Q3 runtime drilldown", "Q3 runtime accordion", "Q3 rules" |
| 29 | CONTROL `?commit=old` (Nested menu spec as written), F3 | C F W | The recorder catches one bad pass (`drilldown` on the root, Item 1 not `inert`, focus on the Item 1 toggle); the later prune closes Item 1 and focus survives | prod "CONTROL commit=old F3" |
| 30 | CONTROL `?force=1` (the first `earlyRead` forces style and layout), F3, old and amended | C F W | Old: 1 bad pass, focus still on the toggle after the forced update and at the end. Amended: 0 bad passes, focus on the toggle | prod "CONTROL force=1 ..." |
| 31 | CONTROL `?start=current` (ADR 0014 fallback) on `/deferred` and `/deferred/current` at 800 px | C F W | No swap; the first pass after the block hydrates already shows `dropdown` (re-classed during hydration, `componentsSkippedHydration` 0); in `/deferred/current` Products stays open as a dropdown submenu | prod and dev "CONTROL start=current /deferred..." |
| 32 | CONTROL `?start=current` on `/late/current` at 800 px, focus outside | C F W | No swap; Products stays open as a dropdown submenu on a desktop page | prod "CONTROL start=current /late/current" |

First-render timings, production build, ms since navigation. Paint is the browser's first `paint` entry: in Chromium it is the page shell, painted before the router created the menu (the service's constructor ran at 118.5 and 104.3 ms). In Firefox and WebKit the swap render precedes the first contentful paint.

| Route | Engine | Service live | Swap rendered | First paint |
| --- | --- | --- | --- | --- |
| `/csr` 1280 | C / F / W | 138.9 / 162 / 191 | 151.5 / 175 / 210 | 40.0 / 178 / 226 |
| `/csr` 800 | C / F / W | 124.7 / 160 / 206 | 138.0 / 174 / 227 | 32.0 / 177 / 232 |
| `/ssr` 1280 | C / F / W | 140.2 / 173 / 273 | 148.9 / 184 / 290 | server HTML |
| `/prerendered` 800 | C / F / W | 145.1 / 174 / 203 | 156.6 / 186 / 218 | server HTML |

In every first-render case the log order is the same: the service goes live (`earlyRead`), the flag flips (`write`), the swap is planned in the next batch's `earlyRead` and committed in its `write`, and the render callback after the next pass sees the new mode. That is ADR 0035's "dirtied after its own `earlyRead` already ran, runs again in the same tick", measured.

### Failures and exact error text

- Row 14 (Hybrid link, published rule) throws no error. The recorded state in each engine: `plan dropdown->drilldown close=[] focus=a "Products"; commit drilldown; rendered drilldown focus=a "Products" open=[Products pages] | bad passes=0 | focus=body open=[Products pages]`. The engines move focus off the hidden link after the task, so the render callback still sees the link focused.
- Harness errors fixed during development, not product findings:
  - The prerender step failed with `ERROR I [Error]: NG0950 at e.r [as rules]` when a status line in the parent view read `mode` through `viewChild` across the `@if` that holds the menu. That read ran before the branch's update pass had set the required `rules` input, and the displayed mode's first read evaluates it. The readout moved next to the menu (`#m="nfsResponsiveMenu"`).
  - The CSR paint assertion failed in Chromium (`Expected: <= 56` / `Received: 213.4`) because its first paint is the page shell. It was replaced by the frame checks in row 20.
  - The question 3 assertion `Expected [false]` / `Received [true, false]` failed because the prototype seeds `expanded` from the submenu constructor, after the item's listeners exist (see Decisions, Nested menu 4). The assertion now requires exactly one `false`, and it must be the last value.
  - The first version of row 32 focused the outside link after creating the menu, and dropdown Light dismiss closed Products. That step was removed, and both runs were repeated on the final code.

### What the prototype does not prove

- Hover opening, hover intent, touch, the Light dismiss registry (a document `focusin` listener stands in), outside presses, and `closeOnClick`.
- A swap during an accordion row or drilldown slide still in motion; completion by `transitionend` (fallback timers only).
- Event replay: pre-hydration clicks and keys, `hydrate on interaction`, `hydrate on hover`, `hydrate never`.
- The client-hint Server breakpoint, RTL, vertical dropdown roots, the Drilldown wrapper's heights and `scrollTop` across swaps, the rules object form, `collapseAll()`, the hosted roots' `exportAs` members, and the development checks.
- Parent-owned registration and DOM order after an `@for` reorder: the prototype finds items through a `WeakMap` and `querySelectorAll`.
- One menu per page; zone.js applications; Linux CI and native macOS WebKit; 1.4.4, 1.4.10, and 1.4.12 checks.
- What a screen reader announces across a swap (human-only, the Responsive Menu spec's existing OPEN FOR HUMAN item).
- The Nested menu spec as written losing focus: it did not happen in these engines, even with a forced style update, so nothing here shows a focus loss the amendment prevents. What is shown is the intermediate pass.
- A static `is-active` combined with a two-way binding whose initial value is `false`. The seed's emission would write `true` into the consumer's state before the binding applies (the prototype's consumer starts at `true`). Not measured.

### Decisions handed to the specs

To the [Spec: Responsive Menu](23-spec-responsive-menu.md):

1. Question 1 confirmed: the swap is committed in the Nested menu root's render callback, and the focus rules hold as written for toggles, links inside open submenus, back buttons, focus outside, and focus before hydration. One correction, decided under Triage 1 and verified in three engines (rows 14 and 15). In Behaviour rules step 1, "entering drilldown also closes the focused toggle's own submenu (the open level would put the toggle inside an `invisible` level)" becomes "entering drilldown also closes the submenu whose own row holds focus, that is, its toggle or, for a Hybrid item, its link (the open level would put that row inside an `invisible` level)". In the Focus rules list, "Focus on a toggle whose submenu is open" becomes "Focus on a toggle whose submenu is open, or on the link of that Hybrid item", and "Focus on a top-level control" becomes "Focus on a top-level control of an item whose submenu is closed". The latter also removes the list's contradiction for a focused open toggle entering dropdown. Design decision D9's rationale and the `responsive-menu--mode-swap` and e2e focus cases gain the Hybrid-link case. The named fallback is not adopted.
2. Question 2 confirmed: every instance starts from the Server breakpoint's mode, and the handoff tick commits the swap before the first frame. Deferred and client-created instances hydrate or render as the server would send them and then pass the swap rule. The ADR 0014 fallback is not adopted; its measured defects are rows 31 and 32.
3. Question 3 confirmed: entering dropdown with focus outside closes every submenu, a static `is-active` section included, with `expandedChange(false)` once and the live mode's `closed` once, and no pass shows the dropdown class over the open section.
4. Testing Decisions, browser-level "Swap atomicity": a working recipe is a `MutationObserver` drained by an `afterEveryRender({earlyRead})` registered from the root environment injector (no view), which runs first in every after-render batch, so each drain covers the change-detection passes since the last batch and its snapshot is what they rendered.
5. API, `mode` row: the first read evaluates the requested mode and therefore the required `rules` input, so reading `mode` before the directive's first update pass (a parent template reading it through a view query across an `@if`) throws NG0950, like any required input. The spec's usage example (reading it after the `ul` in the same template) is safe. Decided under Triage 5: document it.

To the [Spec: Nested menu shared utility](56-spec-nested-menu.md):

1. The amendment confirmed (questions 1 and 2): `mode` is the displayed mode. It is implementable as a `linkedSignal` whose source is the driven function and whose computation reads that function untracked, so it takes the driven value on its first read. The swap `afterRenderEffect` plans in `earlyRead` and sets `mode` before the pruning in `write`. The back-item refocus is an `afterNextRender` registered from `write` with the root's injector (view-bound, so it runs in the batch after the pass that rendered the swap). `drive()`'s signature is unchanged.
2. The same keep-rule correction as Responsive Menu 1, in the amendment's plan text and in D18 ("close a focused toggle's own submenu when entering drilldown" becomes "close the submenu whose own row, toggle or Hybrid link, holds focus when entering drilldown").
3. Question 3 confirmed for the shared rule: entering dropdown with focus outside closes every submenu; entering drilldown with focus outside keeps the first open submenu per level in DOM order (row 8); entering accordion changes nothing (rows 6 and 27).
4. Seeding: a static `is-active` read by the submenu seeds the item after the item's listeners exist, so `expandedChange(true)` reaches subscribers during construction (measured), contrary to the `expanded` row's "before subscribers". Decided under Triage 4: the spec states that the seed emits once during construction. The seeding rule's claim that a bound `[expanded]` wins holds only for a one-way binding, because the emission reaches a two-way binding first (not measured; for the Nested menu spec's browser-level test).

To [ADR 0035](../adr/0035-responsive-menu-swap-commit.md), for the orchestrator: the decision stands. Its first considered option can record that the prototype measured the intermediate pass the option produces (row 29), and that focus survived it in Chromium, Firefox, and WebKit even behind a style-forcing `earlyRead` (row 30). The option is still rejected on the ADR's own ground: the library should not depend on when an engine moves focus.

Question verdicts for the decision logs: question 1 confirmed (with the keep-rule text correction), question 2 confirmed, question 3 confirmed. No question failed, so no named fallback applies and nothing reopens. The verdict is appended to both decision logs, together with the keep-rule correction as a proposed change to both specs.

### Triage

Rule (map, Orchestration rules): impact HIGH when hard to reverse; confidence NOT HIGH when the default is bare, carried from a prototype without deliberation, or against the research or ADRs. Only HIGH impact with NOT-HIGH confidence stays open.

| # | Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- | --- |
| 1 | Keep rule: entering drilldown closes the submenu whose own row (toggle or Hybrid link) holds focus | HIGH: the shared swap rule of the Nested menu root, which four menu specs inherit | HIGH: measured in three engines (rows 14 and 15); it matches the rule's own stated reason (the open level hides that row) and the Responsive Menu spec's focus goal; the named fallback cannot fix it | Decided; proposed text in Decisions |
| 2 | The swap commit in the root's render callback (ADR 0035), no question 1 fallback | HIGH | HIGH: 0 bad passes in every swap in three engines; the control proves the recorder detects the pass it removes | Decided: confirmed |
| 3 | Every instance starts from the Server breakpoint's mode, no question 2 fallback | Medium (internal to ResponsiveMenu) | HIGH: rows 20 to 26 in three engines; the fallback's defects measured (rows 31 and 32) | Decided: confirmed |
| 4 | The static `is-active` seed emits `expandedChange(true)` during construction | Low: one output at construction that matches the page | HIGH: measured in every `/current` case | Decided: the Nested menu spec documents it; the two-way `false` case goes to that spec's browser-level test |
| 5 | Reading `mode` before the first update pass throws NG0950 | Low: a reading-order constraint shared by every required input | HIGH: reproduced in the prerender step | Decided: document it in the `mode` row |
| 6 | The old design kept focus in these engines | Low: evidence for ADR 0035's considered options, no change to the decision | HIGH: rows 29 and 30 | Decided: the ADR stands; the evidence goes to its record |

### OPEN FOR HUMAN

None new. The Responsive Menu spec's existing item (a screen-reader pass over a swap with a submenu open) is human-only by kind and is not settled here.
