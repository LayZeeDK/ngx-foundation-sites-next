# 66. Prototype: Abide control kinds, value adoption, and the ready gate

Type: prototype
Status: resolved
Blocked by: 31
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Abide](31-spec-abide.md) answer. The [Prototype: Signal Forms on Abide markup](49-prototype-signal-forms-abide.md) proved the `FORM_FIELD` binding for text and checkbox fields; the spec extends it and assumes three things only running code can confirm, in Chromium, Firefox, and WebKit:

1. The explicit label, error, and alert directives work for radio groups, checkbox groups with a minimum count, `select`, `textarea`, and a custom control implementing `FormValueControl`.
2. Event-based adoption of values entered before hydration works for every native input type and under Reactive Forms; the prototype's `controlValue.set()` in `afterNextRender` is the fallback.
3. The `ready` pattern holds end to end: a submit control bound to `[disabled]="!abide.ready()"` produces no navigation and no query string from a pre-hydration click or Enter, and behaves correctly inside `@defer (hydrate on interaction)`.

If a case fails, the orchestrator reopens the Abide spec with the named fallback; otherwise the verdict is appended to its decision log.

Read first: `specs/abide.md` (the directive set, the linking rule, value adoption, the `ready` pattern, the rendering-modes subsection), `adr/0026-abide-explicit-error-directives.md`, `adr/0027-abide-pre-hydration-submit.md`, the Signal Forms prototype's answer and `prototypes/signal-forms-abide/`, and `research/angular-rendering-modes.md` sections 4 and 7.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: copy the Signal Forms prototype's plain Angular CLI 22.2 `--ssr` application to `D:/tmp/nfs-proto-abide-controls-and-ready/` (Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0), bring its directives to the spec's design, add the control kinds, and drive it with `@playwright/test` in all three engines, delaying the main bundle with `page.route` for the pre-hydration cases and running axe with the WCAG 2.2 AA tags on the invalid states. Never modify this repo's working tree outside the effort directory.

Capture it: copy the decisive files into `prototypes/abide-controls-and-ready/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Abide spec, and anything left `OPEN FOR HUMAN` after the triage rule.

## Answer

Resolved 2026-09-26. Prototype: [prototypes/abide-controls-and-ready/README.md](../prototypes/abide-controls-and-ready/README.md). Workspace: `D:/tmp/nfs-proto-abide-controls-and-ready/app`.

### Verdict

Yes to all three questions, with one design decision the DI-based linking forced and one race condition discovered outside this ticket's pass/fail bar. All three cases pass in Chromium, Firefox, and WebKit (27 of 27 tests: 9 cases times three engines). Explicit `label[nfsAbideLabel]`, `[nfsFormError]`, and `[nfsAbideAlert]` directives (ADR 0026) drive the right classes, `aria-invalid` (never on `input[type=radio]`), `aria-describedby`, and `role="alert"` for radio groups, checkbox groups with a `data-min-required`-style rule, `select`, `textarea`, and a custom `FormValueControl` (a 1-5 star rating control that applies `[nfsAbideInput]` through `hostDirectives`), in both Signal Forms and Reactive Forms, with no axe violations under the five WCAG 2.2 AA tag sets on invalid and valid states. Event-based pre-hydration value adoption (dispatching `input`, or `input` then `change` for checkbox/radio, after restoring the saved value) survives a 4-second bundle delay for every native input type tested (text, checkbox, radio, `select`, `textarea`) and for Reactive Forms; the `controlValue.set()` fallback also works but was never needed in practice. The `ready` gate (ADR 0027) blocks both a pre-hydration click and a pre-hydration Enter with no navigation and no query string on a server-rendered route, a prerendered route, and inside `@defer (hydrate on interaction)`, and the submit control enables and works after hydration in all three. Two things needed a design decision the spec does not yet make: (a) the custom control can only link to its label and error through the wrapping label (DI), because a typed template reference on a `hostDirectives`-applied directive crashes the Angular compiler; (b) a radio group or checkbox group's shared `NfsFormError` links to any one control in the group, since every control bound to the same path shares identical field state. A related, lower-confidence finding: typing a full value through the `@defer (hydrate on interaction)` transition itself (not before it, which case 2 already covers) can drop one character, engine-dependently (Chromium 2 of 3 runs, WebKit 3 of 3, Firefox 0 of 3) -- this does not affect the `ready` gate's actual guarantee, which held in every run.

### Results

| Case | Result | Evidence |
| --- | --- | --- |
| Radio group: classes, `aria-invalid` never set, shared `NfsFormError` | Works | `e2e/controls.spec.ts` "invalid submit"; `abide.ts` `#isRadio` guard |
| Checkbox group with a minimum count (`validate()` per box) | Works, Signal Forms and Reactive Forms | Same test; `reactive-abide-form.ts` `minCountValidator` |
| `select` | Works | Same test |
| `textarea` (`required`, `minLength`) | Works | Same test |
| Custom `FormValueControl` via `hostDirectives` | Works once linked by DI (wrapping label); a typed reference crashes the compiler | See "Exact error text" |
| Invalid-state axe (5 WCAG 2.2 AA tag sets) | Clean, all engines | `controls.spec.ts` "invalid submit" |
| Valid-state axe and class clearing | Clean, all engines | `controls.spec.ts` "valid submit" |
| Reactive Forms twin (text, checkbox group, radio, select, textarea) | Works, same directives | `controls.spec.ts` "Reactive Forms twin" |
| Event-based adoption: text, checkbox, radio, select, textarea | Survives 4 s hydration delay, all engines | `e2e/adoption.spec.ts` "event-based adoption" |
| Event-based adoption: Reactive Forms (text, select, radio) | Survives, all engines | Same test |
| `controlValue.set()` fallback | Also works; not needed in practice | `adoption.spec.ts` "controlValue.set() fallback" |
| Ready gate: server-rendered route (`/ready`) | No navigation, no query string, pre-hydration; submit works after | `e2e/ready.spec.ts` "RenderMode.Server" |
| Ready gate: prerendered route (`/prerender`) | Same | Same file, "RenderMode.Prerender" |
| Ready gate: `@defer (hydrate on interaction)` | Same; the triggering keystroke is blocked correctly | Same file, "@defer" test |
| `@defer` mid-typing race (informational, not a case 3 gate) | Chromium 2/3 dropped a char, WebKit 3/3, Firefox 0/3 | Same file, last test; console output in the prototype README |

### Exact error text for failures

- Custom control, typed template reference on a `hostDirectives`-applied directive (`<app-star-rating nfsAbideInput #rating="nfsAbideInput" [formField]="f.rating" />`):
  ```
  Error: Could not resolve [object Object] / [object Object]
      at Scope.resolve (.../@angular/compiler/fesm2022/compiler.mjs:33351:13)
      at TcbReferenceOp.execute (.../compiler.mjs:32916:138)
      ...
  ```
  No file, no line number; `ng build` reports only "Angular compilation diagnostics failed." Removing the reference and linking through the wrapping label instead compiles cleanly and the control works identically in every test.
- Bare-attribute directive inputs (`<label nfsAbideLabel>`, `<span nfsFormError>`) with a `transform` typed as `NfsAbideInput | '' | undefined`: `TS2322: Type 'string' is not assignable to type 'NfsAbideInput'`, because Angular types a static attribute as `string`, not the `''` literal, and `input()`'s overload resolution silently drops to `TransformT = unknown` when only one type argument is given. Fixed by widening the transform parameter to accept any `string` and supplying both `input<T, TransformT>` type arguments explicitly.
- `native.type` comparisons after casting the host to an intersection of `HTMLInputElement`, `HTMLSelectElement`, and `HTMLTextAreaElement`: `TS2367: This comparison appears to be unintentional because the types '"select-one" | "select-multiple"' and '"checkbox"' have no overlap`. Fixed with separate casts per branch instead of one intersection type.

### What the prototype does not prove

- `number` and `date` native input types (named as "if the spec covers them" in the brief; not in the fixture). Event-based adoption is not expected to differ (same `value` property path) but was not measured.
- `input[type=file]` and `select[multiple]` adoption: the directive skips both per spec; neither was exercised in a test, only read from the source.
- Screen-reader output for any control kind (axe checks structure, not what is spoken); the custom control's `role="radiogroup"`/`role="radio"` buttons have no roving `tabindex` (every star button is focusable), a simplification not covered by an assistive-technology check.
- Whether the `hostDirectives` + typed-reference compiler crash reproduces on a minimal repro outside this app; none was built and nothing was filed upstream.
- The mid-typing `@defer` race's root cause beyond "the first write races the rescue while the chunk import is in flight"; measured only with Playwright's `pressSequentially`, not a real typing cadence, 3 runs per engine.

### Decision handed to the [Spec: Abide](31-spec-abide.md)

1. Event-based pre-hydration value adoption is the design to keep for every native control kind tested; the `controlValue.set()` fallback is unnecessary in practice but costs little to keep documented as the fallback (matches the spec's existing text).
2. A custom `FormValueControl` links to `nfsAbideInput` through `hostDirectives`, and must link to its label and Form error through the wrapping label (DI), not a typed template reference: the reference crashes the compiler. The spec should state this restriction explicitly for custom controls.
3. For a radio group or a checkbox group with a shared `validate()` rule, the group's single `NfsFormError` links to any one control in the group (its field state is identical to every sibling bound to the same path); the spec should say this explicitly, since "the field" is ambiguous for a group.
4. The `@defer (hydrate on interaction)` mid-typing race is a new finding: a form inside such a block whose hydration trigger is a keystroke, expecting a fast typist to keep typing through that keystroke, can lose a character, engine-dependently. This does not affect the `ready` gate decision (case 3's actual question); the spec's rendering-modes subsection should note it as a limit distinct from the pre-hydration rescue.

### Triage

1. **Custom-control typed-reference compiler crash.**
   - Impact: not HIGH. A documented workaround (DI linking through a wrapping label) exists and was proven to work identically in every test; no consumer-facing behavior is lost, only one linking style is unavailable for custom controls.
   - Confidence: HIGH. Reproduced consistently by isolation (removing only the reference fixed the build; every other change held constant).
   - Outcome: DECIDED. The spec documents that a custom `FormValueControl` links through its wrapping label, not a typed reference. Filing the crash upstream is HUMAN-ONLY BY KIND (upstream filing) and stays OPEN FOR HUMAN.
2. **`@defer (hydrate on interaction)` mid-typing race.**
   - Impact: not HIGH. It only affects a form living inside a block whose hydration trigger is the same keystroke stream the user is typing into; the ready-gate protection (case 3's actual subject) is unaffected, and the value-adoption guarantee (case 2) holds once hydration is not itself mid-flight.
   - Confidence: NOT HIGH. Only 9 samples across 3 engines were measured (3 per engine); the exact race window and whether it is deterministic per engine version is unknown.
   - Outcome: DECIDED by the orchestrator on 2026-09-26 under the triage rule (impact not HIGH means the default applies, whatever the confidence): the Abide spec's rendering-modes subsection documents the limit and recommends `hydrate on viewport`, `on idle`, or `on immediate` over `hydrate on interaction` for a block that holds text-entry fields, as the [Spec: Responsive Accordion Tabs](19-spec-responsive-accordion-tabs.md) already does for its own pre-hydration loss. The recommendation is documentation only and changes no API, so it is easy to reverse if a later measurement shows the race is gone.

### OPEN FOR HUMAN

1. File the custom-control typed-reference compiler crash upstream (angular/angular): a `#ref="exportAs"` template reference on a directive applied through `hostDirectives` produces an unlocated internal error (`Could not resolve [object Object] / [object Object]`) instead of a diagnostic. Filing needs the user's confirmation (repo rule: never file in a third-party repo without it).
The `@defer (hydrate on interaction)` mid-typing race first listed here was decided under the triage rule (Triage item 2), so only the upstream filing stays open.
