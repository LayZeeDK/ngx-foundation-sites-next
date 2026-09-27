# Prototype: a non-linear Slider Handle that assistive-technology increments move

Ticket: [Prototype: a non-linear Slider Handle that assistive-technology increments move](../../issues/134-prototype-slider-nonlinear-at-increment.md). Throwaway code; the verdict, the triage, and the changes it hands to the Slider spec, ADR 0020, and the Slider re-run are in the ticket's `## Answer`.

## Question

A non-linear Slider Handle carries the Bar position natively (ADR 0020, `min="0"`, `max="1000"`, `step="any"`). WebKit steps a range's increment and decrement by the `step` attribute, which `any` makes 0, and Chromium's increment adds one native unit, which maps back to the same value. Can a numeric native `step` and an `input` rule make assistive-technology increments move the Handle one value step, without breaking the dependent bounds, the pre-hydration replay cases of the Slider spec, drags, and values set from outside?

## Verdict

Holds with conditions. With `step="1"`, every native value and bound rounded to an integer, a native range large enough that every value step spans at least two native units, and the rule guarded by the Handle's own pointer events, every increment and decrement arithmetic moved exactly one value step, in the right direction, in Chromium 153, Firefox 155, and WebKit 26.6, including at the dependent bounds, after a drag that ended between steps, and through the real UI Automation `SetValue` path in Chromium and Firefox. The rule with `step="any"`, with unrounded positions, with the fixed 0..1000 range on a dense scale, or without the pointer guard each fails in a measured way (table below).

## What is here

| Path | What it is |
| --- | --- |
| `src/app/slider.ts` | `NfsSlider` and `NfsSliderHandle` from the [Prototype: Slider before hydration, non-linear bounds, and RTL](../../issues/64-prototype-slider-hydration-nonlinear.md), plus: the key handler's native write and event dispatch (Slider spec D18), the prototype knobs `nativeStepMode` (`any`, `raw`, `grid`), `resolution` (`fixed`, `auto`), `atRule`, and `pressGuard`, the Handle's `pointerdown`/`pointerup`/`pointercancel`/`change` listeners, and the rule in `onInput()` |
| `src/app/home.ts` | Eleven fixtures, `log` or `pow` base 5 unless named: `nl-any` (the spec today), `nl`, `nl5` (value 5), `nl-raw`, `nld`, `nld-raw`, `nld-any` (two Handles, 25 and 75), `pow`, `dense` and `dense-auto` (0..1000 step 1, 1000 value steps), `lin` (linear, two Handles), `nl-noguard` |
| `e2e/at-increment.spec.ts` | The three-engine evidence, groups A to E (attributes, single-Handle increments, two-Handle increments, before hydration, after hydration) |
| `uia/uia-agent.ps1`, `uia/uia-run.mjs` | UI Automation `RangeValuePattern` reads and `SetValue` calls on the Handles in headed Chromium and Firefox |
| `uia/cdp-tree.mjs` | Chromium CDP accessibility nodes before and after a one-unit set |
| `tools/summarize.mjs` | Turns the Playwright JSON report into `logs/e2e-run.txt` |
| `logs/e2e-run.txt` | The final run: 122 passed, 0 failed, 4 skipped (the Chromium-only CDP touch cases in Firefox and WebKit), every trace |
| `logs/uia-chromium.txt`, `logs/uia-firefox.txt`, `logs/cdp-chromium.txt` | The platform captures |

The Sass, server, and app shell are the earlier prototype's, unchanged (see its capture folder).

## How the increment actions were exercised

Only a device runs VoiceOver's or TalkBack's action. The prototype reproduces each engine's arithmetic and number-to-string conversion from source, because the conversion decides whether a zero step still changes the value, and it runs the real platform path where Windows exposes one.

| Kind | Engine code copied (read at the commits named in the ticket's Answer) | Arithmetic |
| --- | --- | --- |
| `blink` | Chromium `AXNodeObject::AlterSliderOrSpinButtonValue` (synthesized keys off by default), `StepValueForRange` (no step for `any` or for 40 or more stops, so the default `StepRange` step 1), `AXSlider::OnNativeSetValueAction` (returns when the string equals the live value; else sets it with `input` and `change`), `String::Number(float)` printing `%.6g` | float value plus or minus 1 |
| `webkit` | WebKit `alterRangeValue` -> `changeValueByStep` (`step` attribute `toFloat()`, so `any` is 0) -> `AccessibilitySlider::setValue` (sets with `input` and `change` when the string differs), `String::number(float)` printing the shortest float | float value plus or minus the `step` attribute |
| `gecko` | Firefox for Android `SessionAccessibility::ChangeValueBySteps` (`CurValue() + Step()`, `any` is 0) -> `HTMLRangeAccessible::SetCurValue` (`AppendFloat`, 15 significant digits, then `SetUserInput`) | double value plus or minus the `step` attribute |
| UIA `SetValue` | Real: Chromium's UIA provider reaches the same `AXSlider::OnNativeSetValueAction` as the increment; Firefox's reaches the same `SetCurValue` as Firefox for Android's increment | `Value + 1`, `Value - 1`, `Value + SmallChange`, a near set, a far set, and the same value again |

## Results

| Case | Chromium 153 | Firefox 155 | WebKit 26.6 |
| --- | --- | --- | --- |
| Grid (`step="1"`, integers): `blink`, `webkit`, `gecko` increments, + + - - - from 50, from 5, `pow` at 50, 1000-step scale with the derived range | 51, 52, 51, 50, 49 (and 6, 7, 6, 5, 4) in every kind | same | same |
| Grid, two Handles 25/75: + on the minimum, End, + at the bound, - and + on the maximum, + on the minimum | 26/75, 75/75, 75/75, 75/76, 76/76 in every kind | same | same |
| `step="any"` with the rule | `blink`: one step each way; `webkit`: 51, 52, 53, 54, 55 (decrements go up: the shortest-float string differs from the stored one by about 5e-6); `gecko`: no change | same | same |
| `step="any"`, two Handles, `webkit` | the minimum at its bound moves down (75 to 74) on an increment | same | same |
| Raw (`step="1"`, unrounded positions) | one step each way, but the browser rounds every value to a grid that starts at the input's `min` (the minimum's `value="123.84"` is stored as 124, the maximum's `value="585.93"` as 585.84 on a grid starting at its dependent `min` 123.84), and End on the minimum stops at 585 while the maximum sits at 585.93; on the grid both are 586 | same | same |
| Fixed 0..1000 on a 1000-step scale | increments 7, 10, 7, 5, 2 from 5; a pre-hydration ArrowRight at 5 is lost (stays 5) | same | same |
| Before hydration (grid): ArrowRight at 50 and at 5, three ArrowRights, End on the range minimum, `pow`, derived range | 51 (native 318), 6 (native 25), 53, 75/75, 51, 6; `rule=0` | same | same |
| Before hydration: drags on linear and non-linear Handles, a 1 px drag inside one value step | kept; the short drag stays at 50 with the guard, becomes 51 without it | same | same |
| After a drag that ended between steps (native 500, value 68): +, -, - | 69, 68, 67 | same | same (the drag ended at 497) |
| Slow mouse drag in 0.5 px moves | `rule=0`; without the guard 15 rule steps and the thumb fights the pointer | same (15) | same (14) |
| CDP touch drag (Chromium only) | `rule=0`; without the guard 13 rule steps | not run | not run |
| Keys, a range track press, a write from code | one value step per key, `rule=0` | same | same |
| UIA `SetValue` (real) | `SmallChange` 1 for `any` and `1`; `Value + 1`/`- 1` one step each way on every grid fixture; a near set inside the step moves one step; a far set moves there; the same value again dispatches nothing; with `any`, re-setting the reported float moved a step (89 to 88) | `SmallChange` 0 for `any`, 1 for `1`; same results on grid; `input` fires without `change`; the same value again fires `input` and the rule ignores it | no UIA |
| Native keys before hydration (no directive) | ArrowRight +1 unit with `1` (+10 with `any`), Page Up +100, End, Home | +1 in both, Page Up +100 | as Chromium |

## How to run

Workspace outside the repository: `D:/tmp/nfs-proto-slider-at-increment/slider-proto/` (a copy of the earlier prototype's workspace; its `node_modules` was a junction, removed after the runs, so restore it with `npm ci` or a new junction). Ports 4861 (e2e), 4862 (UIA), 4863 (CDP).

```sh
npx ng build
npx playwright test e2e/at-increment.spec.ts
node uia/uia-run.mjs chromium firefox   # headed; Windows only
node uia/cdp-tree.mjs
```
