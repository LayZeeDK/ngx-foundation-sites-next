# 67. Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule

Type: grilling
Status: resolved
Blocked by: 61
Labels: wayfinder:grilling
Map: ../map.md

## Question

Created on 2026-09-26 because the [Prototype: Interchange template outlet under hydration](61-prototype-interchange-outlet-hydration.md) failed one assumption of the [Spec: Interchange](35-spec-interchange.md): when the Breakpoint service's first-render handoff drives the swap, the `replaced` output fires a few milliseconds before the DOM shows the rule it reports, in Chromium, Firefox, and WebKit, in both the `effect()`-driven outlet and the spec's `ngDoCheck` fallback, because an emission from a render callback runs ahead of a change-detection-driven swap whose triggering signal write comes from another render callback. The prototype sketched one candidate fix (perform the swap and the emission in the same client-side `afterRenderEffect`, keeping `effect()` or `ngDoCheck` only for the server-reaching first pass) but did not verify it.

Revise the spec's decision 12 (`replaced` timing and payload) and the outlet's ARIA focus rule (the default focus move after a template swap) so the output and the focus move happen only after the swap is painted, and state the mechanism with its render hook and phase per `building-blocks.md` 1.5. The candidate fix may be verified in a copy of the prototype's workspace (`D:/tmp/nfs-proto-interchange-outlet-hydration/app`) before it is written into the spec; record the result. The finding generalises to any directive that pairs a breakpoint-driven swap with a render-callback output or focus move (ResponsiveAccordionTabs, ResponsiveMenu, Toggler): state the rule those specs inherit under `### Proposed building-blocks changes` (a 1.5 or 1.11 bullet) so the orchestrator carries it into the map, and note whether the published `specs/responsive-accordion-tabs.md` or `specs/toggler.md` need the same correction.

Read first: the prototype's answer and `prototypes/interchange-outlet-hydration/README.md` with its source, `specs/interchange.md` (decision 12, the outlet API, the ARIA section, the rendering-modes subsection), `specs/breakpoint-service.md` (the first-render handoff), `adr/0014-breakpoint-service-first-render-handoff.md`, `adr/0015-interchange-no-image-or-partial-mode.md`, `building-blocks.md` 1.5 and 1.11, and `research/angular-22-api-survey.md` on `afterRenderEffect` phases.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the mechanism; edit `specs/interchange.md` in place (the decision and its consequences, the API paragraph for `replaced`, the ARIA focus rule, the rendering-modes subsection, and the Testing Decisions case that asserts ordering); append the revision to the Interchange spec ticket's answer as a dated `### Re-run, 2026-09-26` section with new decision-log entries; apply the triage rule to anything you would leave open. Never edit `map.md`, `CONTEXT.md`, `building-blocks.md`, ADRs, or other specs; never commit.

Under `## Answer`: the mechanism chosen with its evidence, the rule other specs inherit, the changes made to the spec, and anything left `OPEN FOR HUMAN` after triage.

## Answer

Resolved 2026-09-26. Mechanism chosen: the rendered-rule handoff, verified in code in three engines. The prototype's candidate (swap and emit in one render callback) was built beside it and rejected on measurement. The `ngDoCheck` fallback is dropped: it never swaps in a zoneless app once `replaced` stops firing early. The spec was edited in place; the decision log is the `### Re-run, 2026-09-26` section of the [Spec: Interchange](35-spec-interchange.md) answer (entries 35 to 42).

### Why the published design failed (source reading)

- `AfterRenderManager.execute()` runs all registered render callbacks phase by phase (`earlyRead`, `write`, `mixedReadWrite`, `read`) in one batch (NG `packages/core/src/render3/after_render/manager.ts`, `AFTER_RENDER_PHASES`).
- A phase node marked dirty while hooks execute, whose phase has not run yet in its sequence, does not notify the scheduler: "this node will be reached naturally" (NG `packages/core/src/render3/reactivity/after_render_effect.ts`, `consumerMarkedDirty`). So the Breakpoint service's `earlyRead` write reaches a later-phase `afterRenderEffect` that reads `selected` in the same batch.
- The swap (a view `effect()` or `ngDoCheck`) runs only in change detection, which `ApplicationRef.synchronize()` performs in its next loop iteration; `synchronizeOnce()` runs render hooks only after a pass that leaves no view or root effect dirty (NG `packages/core/src/application/application_ref.ts`).
- Within one view refresh, `runEffectsInView` runs before `detectChangesInEmbeddedViews` (NG `packages/core/src/render3/instructions/change_detection.ts`), so a view created by a view effect gets its first update pass in the same change-detection pass.

### Mechanism chosen: the rendered-rule handoff

- Swap: stays in change detection on both platforms. The outlet's `effect()` compares `selected()`'s template with the rendered one; when it differs it records whether the live `document.activeElement` is inside the view it is about to remove, clears the container, and calls `createEmbeddedView`. In every run it writes `selected()` into a private rendered-rule signal. Background mode: an `effect()` writes the same signal; it runs in the same change-detection pass as the host style binding.
- Emission and focus: one `afterRenderEffect` with only a `mixedReadWrite` phase, depending on the rendered-rule signal and `selected`. It acts only when the two are equal and the rule differs from the last one reported: it moves focus to the first tabbable element of the new view (only when the swap removed the focused element and focus is still on `<body>`), then emits `replaced`.
- Why it orders correctly: in the handoff batch the callback sees the rendered rule disagree with `selected` and does nothing. The swap effect's write to the rendered rule schedules the callback again, and hooks run only after a pass that leaves no view dirty. So the new view's bindings, control flow, and child inputs are in the DOM when the focus rule and `replaced` run.
- The server-reaching first pass is not a separate path: the same `effect()` renders the Server breakpoint's view on the server and in the hydration pass. Render callbacks never run on the server, and the rendered-rule write there has no reader.
- Render hook per building-blocks 1.5: `afterRenderEffect({mixedReadWrite})`. The focus rule reads and then writes, and a `replaced` handler may do both (the documented place for a consumer's own focus move), so the emission cannot sit in `read`. `earlyRead` is excluded because it shares the phase with the service's handoff write, ordered by registration. ADR 0014 guarantees live values from `write` on.

### Evidence (verified in code)

Workspace: `D:/tmp/nfs-proto-interchange-replaced-timing/app`, a copy of the prototype workspace, not committed. Built with `npx ng build --configuration development`, served with `PORT=4671 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs`, tested with `npx playwright test` (base URL port 4671). Decisive files:

- `src/app/interchange/nfs-interchange-outlet.ts`: the chosen outlet, with the focus rule.
- `nfs-interchange-background.ts`: background mode, the handoff form and the published "naive" form side by side.
- `nfs-interchange-outlet-candidate.ts`: the prototype's candidate, optionally with `detectChanges()`.
- `nfs-interchange-outlet-docheck.ts`: the `ngDoCheck` form with the same handoff.
- `src/app/replaced-checks.ts`: the synchronous checks run inside each `replaced` handler. Each rule template has a static wrapper, plus an `@if` link with a bound attribute that exists only after the update pass. The checks also record `document.activeElement`.
- `e2e/rerun-67.spec.ts`: the re-run cases.
- `e2e/interchange-outlet.spec.ts`: the prototype's cases.
- `NfsMediaQuery` gained a `window.__nfsSetBreakpoint(name, fromRenderCallback)` test hook for later changes. It writes `current` either inside `afterNextRender({earlyRead})` or directly.

Runs: 84 of 84 (28 tests x 3 engines), then 252 of 252 (`--repeat-each=3`), then 186 of 186 with the background cases added (31 tests x 3 engines, `--repeat-each=2`). Chromium, Firefox, and WebKit, Windows 11 arm64, zoneless. No failure in any run.

| Case | Published design (prototype) | Rendered-rule handoff | Candidate (swap and emit in one render callback) | Candidate plus `detectChanges()` |
| --- | --- | --- | --- | --- |
| Handoff, `/csr`: DOM shows the rule at `replaced` | `NOT-SHOWN` every run | `shown` every run | `shown` (static wrapper) | `shown` |
| Handoff: the new view's `@if` link and bound attribute at `replaced` | not measured | `shown` every run, `/csr`, `/ssr`, `/prerendered` | `NOT-SHOWN` every run (`/csr`, `/ssr`) | `shown` |
| Handoff: number of `replaced` emissions at 1300 px | 1 (`large`), before the swap | exactly 1 (`large`); the Server breakpoint's rule is never reported | 1 | 1 |
| `@defer (hydrate on viewport)` block, `/ssr`, `/prerendered` | log ends `large` (order not checked) | `shown`, `@if` link `shown` | not built | not built |
| Background mode, handoff, `/csr`, `/ssr`, `/prerendered` | `NOT-SHOWN` every run (newly measured: the race is not outlet-only) | `shown` every run | n/a | n/a |
| Later swap written inside a render callback, focus on the old view's link, `/csr` and `/ssr` | not measured | `replaced` once, view and `@if` link `shown`, focus already on the new view's link at emission and after | view `shown`, `@if` link `NOT-SHOWN`, focus left on `<body>` | all `shown`, focus on the new link |
| Later swap by a plain signal write, same checks, `/csr` | not measured | as above | not run | not run |
| `ngDoCheck` form with the handoff, `/csr-fallback`, `/ssr-fallback`, `/prerendered-fallback` | appeared to swap | never swaps; the Server breakpoint's view stays; nothing emitted | n/a | n/a |

Timeline on the first-render handoff (ms since navigation, two runs per engine, `/csr`): Chromium handoff write 186/221, swap 189/224, `replaced` 192/226, first paint 204/240. Firefox 507/743, 508/744, 510/745, first contentful paint 516/752. WebKit 255/235, 258/237, 259/239, first contentful paint 265/243. The swap lands 1 to 3 ms after the handoff write and `replaced` 1 to 3 ms after the swap, both before the first paint. On `/ssr` and `/prerendered` the same gaps hold after hydration (the server HTML is the first paint there). The prototype's paint-timing case (swap at or before first paint) still passes in all three engines.

The prototype's finding tests: on `/csr` the handoff case now asserts `replaced-dom-check:large:shown`, plus the stronger `@if` check, on every run in all three engines. On `/csr-fallback` there is nothing to assert `shown` against, because the `ngDoCheck` form never emits once it no longer emits early. That case now asserts the new finding: the view stays small and nothing is emitted. The prototype's case 1/2 fallback test was changed to assert this too.

Side finding (low impact): the prototype's unexplained "CSR double-construction" is the `@defer (hydrate on viewport)` block's own outlet. A client-rendered route creates the block on the client tens of milliseconds after the first render, consistent with Angular's default `on idle` trigger; the probe shows its `replaced` checks carrying the block's `defer-` test ids. It is not a second instance of the main outlet.

What this does not prove: zone.js consumers (zoneless only; the ordering comes from `ApplicationRef.synchronize`, which zone-based apps also use, so no difference is expected). The pre-hydration focus case at the handoff (focus on a server-rendered link before hydration) was not run; it uses the same code path as the verified later swaps, and the spec carries it as a fixture e2e case. The unknown-name warning, Named queries, and raw media queries (unchanged by this re-run). Linux CI and native macOS WebKit.

### The rule other specs inherit

Any directive that pairs a breakpoint-driven swap with a render-callback output, focus move, or measurement must not let that render callback depend on the breakpoint-derived state that requests the swap. The failure needs only that the triggering write comes from another render callback, which the Breakpoint service's first-render handoff always does. The render callback depends on rendered state instead: a signal that the code performing the swap writes during change detection, recording what is now on the page. It acts only when rendered and requested state agree. The same applies to "focus was inside": it is recorded where the old nodes still exist, never in a render callback after a runtime swap. There, the browser has already moved focus to `<body>`.

### Proposed building-blocks changes

1. 1.5, new bullet after the `afterRenderEffect` bullet: "Render callbacks that report or act on a breakpoint-driven render (a Completion output such as Interchange's `replaced`, a focus move after a mode swap, a measurement of the new mode) depend on rendered state, never directly on `NfsMediaQuery` reads or state derived from them. Rendered state is state that changes only when change detection has rendered the swap: a signal written by the swap `effect()` (Interchange outlet), a signal written by an `effect()` beside the host binding that applies it (Interchange background mode), or a signal view query of the new branch's elements (a template `@if` swap, as ResponsiveAccordionTabs does). The callback acts only when rendered and requested state agree. Reason: the Breakpoint service writes `current` in an `earlyRead` callback (ADR 0014); a later-phase render callback that reads it runs in the same batch of render hooks, before the change-detection pass that renders the swap. This was measured in the [Prototype: Interchange template outlet under hydration](issues/61-prototype-interchange-outlet-hydration.md) and fixed in the [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](issues/67-rerun-interchange-replaced-timing.md) in three engines. The same holds for any state written inside a render callback, not only breakpoints. 'Focus was inside the removed content' is recorded while the old nodes still exist, in one of three places: in the change-detection code that removes them (Interchange's swap effect); in the render callback that itself commits the swap, when the displayed mode changes only there (ResponsiveAccordionTabs' `earlyRead`); or continuously from `focusin`/`focusout` host listeners on a host that survives the swap. A render callback that runs after change detection has already removed the nodes is too late, because the browser has already moved focus to `<body>`. Library render callbacks use `afterRenderEffect` phases after `earlyRead` for anything that must see live breakpoint values, unless the callback itself commits the swap."
2. 1.5, `effect` bullet ("`effect` only for side effects that are not DOM ... never to propagate state between signals"): add "except the rendered-state signal of the bullet above, which records that a render side effect has happened (a `computed` cannot express it) and is read only by render callbacks, never by templates or `computed`s".
3. 1.11, decision 8, append: "Outputs and focus moves that follow such a re-render obey the rendered-state rule of 1.5."
4. Outside building-blocks, for the orchestrator: the Breakpoint service spec's consumer rule 1 has the consumer read `document.activeElement` "in its `earlyRead` callback before the swap". That holds when the consumer's displayed mode changes only inside that same `earlyRead` callback (the ResponsiveAccordionTabs shape). It does not hold when the swap is driven straight from `NfsMediaQuery` reads in change detection (a template `@if (mq.atLeast(...))`, the Interchange outlet's effect): for a runtime `MediaQueryList` change, change detection swaps before any render callback runs. Amend it to "record whether focus is inside the widget while the old nodes still exist (in the render callback that commits the swap, in the change-detection code that removes them, or from `focusin`/`focusout` on a surviving host), and move focus in a render callback keyed on rendered state (building-blocks 1.5)".

Named specs:

- `specs/responsive-accordion-tabs.md` (being written under [Spec: Responsive Accordion Tabs](19-spec-responsive-accordion-tabs.md); read as it stood on 2026-09-26) needs no correction; it already follows the rule by the second pattern. Its displayed `mode` changes only in its own `afterRenderEffect` `earlyRead`, which reads `document.activeElement` first, while the old branch exists, for the handoff and for runtime changes alike. Its refocus runs in the `write` phase keyed on the view query of the displayed mode's controls, which changes only once change detection has rendered the new branch. No output fires for a Mode swap (`selectionChange` excludes it). One optional sentence would make the same-batch case explicit: in the `write` phase, a queried control counts only if it belongs to the displayed mode (in the batch where `mode` was just set, the query still holds the old mode's controls). The ResponsiveMenu spec, when written ([Spec: Responsive Menu](23-spec-responsive-menu.md)), should take one of the two patterns.
- `specs/toggler.md` needs no behaviour correction: nothing in it depends on a breakpoint, and `isOpen` changes come from Trigger clicks, keyboard handlers, and model bindings, none of them render callbacks. Its sentence "Without an animation they fire in the render callback after the pass that showed or hid the element" is true for those sources. It would fail only if a consumer wrote `isOpen` inside an earlier-phase render callback, because the completion callback reads the committed state directly. Suggested one-line qualification for the orchestrator (low impact, not required): "... for state changes made outside render callbacks; the completion callback depends on the committed state that change detection rendered (building-blocks 1.5)".
- `specs/responsive-toggle.md` (not named in the ticket, checked because it reads `atLeast(hideFor)` in a render callback) is likely unaffected: its breakpoint switch is Foundation's `.hide-for-<bp>` CSS, applied by the browser's media evaluation rather than by an Angular re-render. Its author may confirm.

### Changes made to `specs/interchange.md`

- Solution: the `replaced` bullet says it fires after the pass that rendered the rule.
- Foundation contract row for `replaced.zf.interchange`: now points at decision 12.
- Hierarchy: the internal list names the rendered-rule signal.
- API: both `replaced` rows are rewritten (after the change-detection pass that wrote the style or created and updated the view, after the focus rule, once with the live rule at the first client render). A new "Emission timing (decision 12)" paragraph states the mechanism and its evidence.
- Implementation level: the background bullet adds the recording `effect()`; the template bullet adds the focus record before `clear()` and the rendered-rule write, and cites the prototype as confirmed.
- New "Render hooks (building-blocks 1.5)" bullet: `mixedReadWrite` only, with reasons.
- The `ngDoCheck` fallback bullet is replaced by "No `ngDoCheck` fallback", with the measurement. A new bullet explains why the swap does not move into the render callback.
- ARIA table: the "Swap while focused" row is rewritten (two steps: record in the swap effect, move in the render callback before `replaced`, only if focus is on `<body>`; applies at the handoff on server-rendered pages). This replaces the incorrect "never at the first-render switch, because nothing can be focused".
- WCAG table: the 2.4.3/2.4.11 and 3.2.1/3.2.2 rows state the order and when focus may move.
- Rendering modes: "Before hydration" covers the `activeElement` read and the server-side rendered-rule write. A new "Client rendering" bullet gives the order with the measured timings. "Full hydration" gives the emission order and the pre-hydration focus case. "Incremental hydration", "`hydrate never`", "Plain `@defer`" (including the observation that a client-rendered route creates hydrate-only blocks on idle), and "Zoneless" are updated.
- Testing Decisions: a browser-level "Ordering (decision 12)" case covers three write paths (handoff, write inside `afterNextRender({earlyRead})`, plain listener write), with handler-time DOM checks including `@if` content and the background style. The outlet focus case adds a target inside `@if`, focus visible to the handler, and both later write paths. The fixture e2e adds handler-time ordering checks on hydration and client rendering, a pre-hydration focus case, and ordering checks for the `hydrate on viewport` block.
- Design decisions: row 11 (no fallback; rejected alternatives with reasons), row 12 (the mechanism; revision noted), and row 14 (where focus is recorded and moved) are rewritten.

### Triage

Rule: the map's triage of human-only items. Only HIGH impact with NOT-HIGH confidence stays open.

1. The `replaced` ordering mechanism (the item the prototype left open).
   - Impact: HIGH (shared pattern; ResponsiveAccordionTabs and ResponsiveMenu inherit it).
   - Confidence: HIGH (running code in three engines, six runs of each outlet case, both modes, three write paths; the alternatives were measured and fail or cost more).
   - Outcome: DECIDED, the rendered-rule handoff.
2. An `effect()` writing a signal, against the wording of building-blocks 1.5.
   - Impact: medium (a shared rule's text).
   - Confidence: HIGH (the signal records a completed render side effect that no `computed` can express, and only render callbacks read it; Angular's guidance targets derived state).
   - Outcome: DECIDED; the exception is proposed above.
3. Reading `document.activeElement` inside the swap effect (a DOM read in change detection, also on the server).
   - Impact: low (no write, no layout, missing value counts as "not inside").
   - Confidence: HIGH (it is the only point where the old view still exists; verified).
   - Outcome: DECIDED.
4. Focus at the handoff on a server-rendered page (not measured).
   - Impact: medium (WCAG 2.4.3).
   - Confidence: HIGH (same code path as the verified later swaps, and hydration keeps the server nodes as the old view's root nodes).
   - Outcome: DECIDED; carried as a fixture e2e case.
5. `mixedReadWrite` versus split phases.
   - Impact: low (one callback per swap).
   - Outcome: DECIDED.
6. Zone.js consumers (untested).
   - Impact: low.
   - Confidence: HIGH (the same `ApplicationRef.synchronize` loop).
   - Outcome: DECIDED, same mechanism.
7. Applying the rule in ResponsiveMenu and the Breakpoint service spec's consumer rule 1 (ResponsiveAccordionTabs already complies): routed to the orchestrator through the proposed changes above, not a human decision.

### OPEN FOR HUMAN

None.
