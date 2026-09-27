# 134. Prototype: a non-linear Slider Handle that assistive-technology increments move

Type: prototype
Status: open
Blocked by: none
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-27 from the re-judgement of [Resolve the assistive-technology checks](77-evidence-assistive-technology-checks.md) (its "Prototype needed"). A non-linear Slider Handle uses `step="any"`, which WebKit counts as 0, so VoiceOver's increment and decrement change nothing, and Chromium's increment adds one native unit of a thousand, which maps back to the same value; keys, drags, and track presses are unaffected. The [Spec: Slider](32-spec-slider.md) records it as a documented limitation (D22). Can a numeric `step` and an `input` rule make assistive-technology increments move the Handle one value step?

## How to work it

A non-linear Slider Handle operable by assistive-technology increment and decrement: on the Slider's non-linear stories, give the native input a numeric `step` (for example `1`, one thousandth of the track) instead of `any`, and add an `input` rule: a native value change with no pointer pressed and no key handled by the directive, whose mapped value equals the current value, moves one value step in the direction of the change and writes the native value. Measure in Chromium, Firefox, and WebKit: the dependent bounds in position units (a bound such as `585.93` off the step grid), the pre-hydration key and drag replay cases of the Slider spec, drags that end between steps, and a value set from outside (UIA `RangeValue.SetValue` in Chromium and Firefox; the increment actions themselves only on real devices, through the Slider's release test). If it holds, the limitation text and D22 below give way to the rule and ADR 0020 gains a second dated note; if not, the limitation stands.

Run AFK under the map's AFK override with `/mattpocock-skills:prototype` on Opus 5.5; capture the decisive files under `prototypes/`. The [Re-run: Slider spec under the class rule](124-rerun-slider-class-rule.md) waits on this ticket.
