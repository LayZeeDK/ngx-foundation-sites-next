# Interchange `replaced` timing: the rendered-rule handoff

Decisive files from the code check behind the [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../../issues/67-rerun-interchange-replaced-timing.md). The full question, the evidence table, and the decisions are in that ticket's answer; this directory only keeps the source so the verdict can be checked later.

## Question

Why did the [Prototype: Interchange template outlet under hydration](../../issues/61-prototype-interchange-outlet-hydration.md) see `replaced` fire before the swapped view was in the DOM, and which outlet design makes `replaced` fire once, after the swap, with focus moved when the swap removed the focused element?

## Verdict

The Breakpoint service writes `current` in an `earlyRead` render callback, and any later-phase `afterRenderEffect` that reads breakpoint-derived state runs in the same batch of render hooks, before the change-detection pass that swaps the view. The fix is the rendered-rule handoff: the outlet's `effect()` swaps the view in change detection and writes the rule it rendered into a private signal (recording first whether focus was inside the old view), and one `mixedReadWrite` `afterRenderEffect` acts only when that signal and `selected` agree, moving focus and then emitting `replaced`. Background mode had the same race and takes the same fix. The single-render-callback candidate and the `ngDoCheck` fallback were rejected (see the ticket).

## Files

- `src/app/interchange/nfs-interchange-outlet.ts` -- the chosen outlet with the focus rule.
- `src/app/interchange/nfs-interchange-background.ts` -- background mode, the handoff form and the published form side by side.
- `src/app/interchange/nfs-interchange-outlet-candidate.ts` -- the prototype's candidate, optionally with `detectChanges()`.
- `src/app/interchange/nfs-interchange-outlet-docheck.ts` -- the `ngDoCheck` form with the same handoff.
- `src/app/replaced-checks.ts` -- the synchronous checks run inside each `replaced` handler.
- `src/app/media-query/nfs-media-query.ts` -- the prototype's service with the `window.__nfsSetBreakpoint` test hook.
- `e2e/rerun-67.spec.ts`, `e2e/helpers.ts` -- the re-run cases.
- `e2e/interchange-outlet.spec.ts` -- the prototype's own cases, modified for this re-run (the input this re-run's decision log describes as not yet in the capture).

## How to run

The workspace is `D:/tmp/nfs-proto-interchange-replaced-timing/app`, a copy of the Interchange outlet prototype's workspace (Angular 22.2.0, `foundation-sites` 6.9.0). Build with `npx ng build --configuration development`, serve with `PORT=4671 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs`, and run `npx playwright test` (Chromium, Firefox, WebKit). Runs recorded in the ticket: 84 of 84 (`logs/1-run-84.log`), 252 of 252 with three repeats (`logs/2-run-252.log`), and 186 of 186 with the background cases (`logs/3-run-186.log`); all three ASCII-sanitized (Playwright's own check marks and angle-quote characters replaced with `[OK]`/`>`).
