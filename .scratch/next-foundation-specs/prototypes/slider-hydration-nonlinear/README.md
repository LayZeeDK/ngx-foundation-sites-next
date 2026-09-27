# Prototype: Slider before hydration, non-linear bounds, and RTL

Ticket: [Prototype: Slider before hydration, non-linear bounds, and RTL](../../issues/64-prototype-slider-hydration-nonlinear.md). Throwaway code; the verdict and the decisions it hands on are in the ticket's `## Answer`.

## Question

Extends the [Prototype: Foundation-styled `<input type="range">` Slider](../../issues/45-prototype-slider-range-input.md) (which only tested a single linear handle before hydration) to three cases only running code can confirm, in Chromium, Firefox, and WebKit:

1. Keys and drags made before hydration survive on two-handle and non-linear sliders, and a replayed non-linear key applies exactly one value step (not the native default action's step plus the directive's step).
2. A two-handle non-linear slider's bounds in bar-position units (ADR 0020) keep the thumbs from crossing and the fill correct.
3. Rule 12 (`specs/slider.md`) gives a correct right-to-left slider when Foundation is compiled with `$global-text-direction: rtl`, and the thumb and fill stay visible in `forced-colors: active`.

## Verdict

Mostly yes. Cases 1 and 2 pass in Chromium and WebKit; case 1's non-linear key case fails in Firefox, with a root cause that is narrowed but not fully confirmed (see the ticket's "What the prototype does not prove"). Case 2 passes in all three engines. Case 3 passes in all three engines for RTL correctness; forced-colors visibility needed one new CSS rule (not yet in the spec) and then passed in Chromium and Firefox (WebKit has no `forced-colors` emulation in Playwright, so it is unproven there, not failing). See the ticket's `## Answer` for the full results table and the decisions handed to the Slider spec.

## What is here

| Path | What it is |
| --- | --- |
| `src/app/slider.ts` | `NfsSlider` and `NfsSliderHandle`, extended from the range-input prototype: non-linear dependent bounds carried as bar positions (ADR 0020) on both handles, a sibling clamp in the non-linear key handler, Home/End going to the dependent bound for a range, and a changed hydration-adoption strategy (see "The double-step fix" below) |
| `src/_nfs-slider.scss` | The custom CSS, with rule 12 (RTL: `transform: none` cancelling Foundation's mirror) added, plus an experimental `forced-colors` rule group (not yet in `specs/slider.md`; see the ticket answer) |
| `src/app/rtl.scss` | A SECOND Foundation compile with `$global-text-direction: rtl`, scoped to one component only (Angular's emulated encapsulation keeps it from colliding with the default LTR compile in `src/styles.scss`) |
| `src/app/home.ts` | Default (LTR) fixtures: `double` (two-handle linear), `nl-log` (single-handle non-linear log), `nl-double` (two-handle non-linear log) |
| `src/app/rtl-demo.ts` | The `rtl-double` fixture under the real RTL compile |
| `src/app/app.ts`, `app.routes.ts`, `app.routes.server.ts` | Root shell (a `router-outlet`) and the two server-rendered routes (`/`, `/rtl`) |
| `e2e/slider.spec.ts` | The evidence: one `test.describe` per case |
| `e2e/probe-keydown-replay.spec.ts` | The root-cause probe for the Firefox finding: wraps `addEventListener` to log before/after a replayed `keydown` reaches `onKeydown()` |
| `e2e/probe-forced-colors.spec.ts` | The probe that measured the native default action's raw drift per engine, and the computed forced-colors palette before the CSS fix |
| `logs/final-run.log` | The full `npx playwright test e2e/slider.spec.ts` run (29 passed, 2 failed, 2 skipped) |
| `logs/probes-annotations.txt` | The probes' captured evidence (exact numbers, console output, stack traces) |

## The double-step fix

The range-input prototype's directive adopted a pre-hydration native value by calling `onInput()` directly from inside the `afterRenderEffect` write phase, on the first mismatch between the model and the live native value. That design double-applies a non-linear key: the native default action moves the raw bar position by some browser-chosen amount (not a value step), the write-effect's explicit adopt call converts that drift into the model, and then the replayed `keydown` event computes `value + one step` on top of the already-adopted value.

This prototype's `slider.ts` removes that explicit adopt call. On the first mismatch, the write effect now does nothing and defers entirely to the native `input` event that every native value change queues for replay; that event's own listener (`onInput()`) reads whatever the live native value is at replay time, which is idempotent no matter how many times it fires. A replayed `keydown` computes its one step from the untouched pre-hydration model value, because nothing wrote a synthetic adoption in front of it. Verified against the range-input prototype's own passing case (a plain drag on a single linear handle, no keys): still passes, because the drag's own `input` events replay and adopt exactly as before.

## How to run

Workspace: `D:/tmp/nfs-proto-slider-hydration-nonlinear/slider-proto/` (left in place; copied from `D:/tmp/nfs-proto-slider-range-input/slider-proto/`, read-only). Same versions as that prototype: Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0, `@playwright/test` 1.63.0. Reserved ports 4620-4629 (this suite uses 4623).

```sh
cd D:/tmp/nfs-proto-slider-hydration-nonlinear/slider-proto
npx ng build                      # production browser + server bundles
npx playwright test e2e/slider.spec.ts   # starts node dist/slider-proto/server/server.mjs on port 4623
PORT=4623 node dist/slider-proto/server/server.mjs   # to browse it by hand (/ and /rtl)
npx playwright test e2e/probe-keydown-replay.spec.ts e2e/probe-forced-colors.spec.ts   # the diagnostic probes
```

The 'OPEN FOR HUMAN 3' in the comment at `src/app/slider.ts:407` is building-blocks Part 4, Decided item 3 (the logged replay error is accepted); the captured code is left as it ran.
