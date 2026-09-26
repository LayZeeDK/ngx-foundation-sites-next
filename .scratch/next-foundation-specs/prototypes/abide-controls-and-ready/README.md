# Prototype: Abide control kinds, value adoption, and the ready gate

Ticket: [Prototype: Abide control kinds, value adoption, and the ready gate](../../issues/66-prototype-abide-controls-and-ready.md).

## Question

Do the explicit label/error/alert directives (ADR 0026) work for a radio group, a checkbox
group with a minimum count, `select`, `textarea`, and a custom control implementing
`FormValueControl`? Does event-based pre-hydration value adoption work for every native input
type and for Reactive Forms? Does the `ready` gate (ADR 0027) hold end to end: a submit control
bound to `[disabled]="!abide.ready()"` blocks a pre-hydration click and Enter with no navigation
and no query string, on a server-rendered route, a prerendered route, and inside
`@defer (hydrate on interaction)`, then works after hydration?

## What is here

The decisive files of a plain Angular CLI 22.2.0 application, copied from the [Prototype: Signal
Forms on Abide markup](../../issues/49-prototype-signal-forms-abide.md) workspace and brought to
the spec's design. The runnable workspace (with `node_modules`, the build, and test results)
stays at `D:/tmp/nfs-proto-abide-controls-and-ready/app`.

- `src/app/abide/abide.ts` -- the five directives from `specs/abide.md`'s API section, not the
  DOM-lookup route prototype 49 used: `form[nfsAbide]` (policy inputs, `submitted`, `invalid`,
  `showAlert`, and `ready` -- false until the first `afterNextRender`), `[nfsAbideInput]`
  (`FORM_FIELD` self-injection then `NgControl`; `is-invalid-input`, `aria-invalid` skipped on
  `input[type=radio]`, `aria-describedby` from registered `NfsFormError`s; event-based
  pre-hydration value adoption with a `controlValue.set()` fallback knob; the `(keydown.enter)`
  flush only on `input` hosts), `label[nfsAbideLabel]` (DI token, `is-invalid-label`),
  `[nfsFormError]` (DI or typed reference, `formErrorOn`, `role`, registers with its field),
  `[nfsAbideAlert]` (`hidden`, `role` from `a11yErrorLevel`). The `[nfsAbideInput]` selector adds
  a bare `[nfsAbideInput]` attribute form so a custom control can carry it as a `hostDirective`.
- `src/app/abide/star-rating.ts` -- the custom `FormValueControl<number>` (a 1-5 star button
  group). It applies `NfsAbideInput` via `hostDirectives`, on the same host element `[formField]`
  binds to, so the directive's `self: true` injection of `FORM_FIELD` sees it.
- `src/app/signal-abide-form.ts` -- one Signal Forms fixture with every control kind: wrapping
  label (email), `label[for]` with typed references (password, confirm, `equalTo`), a radio
  group (`plan`), a checkbox group with a `data-min-required`-style `validate()` rule per box
  (`topics`), `select` (`country`), `textarea` (`bio`, `minLength`), the custom control
  (`rating`), and a plain checkbox (`terms`). An `adoption` input switches case 2's strategy
  between `'event'` (the spec's design) and `'controlValue'` (the documented fallback).
- `src/app/reactive-abide-form.ts` -- the Reactive Forms twin: text, a checkbox group (a
  parent-aware `minCountValidator` re-validated on every sibling change, because
  `NfsAbideInput` reads `NgControl.control`, a leaf, not the group), a radio group, `select`,
  `textarea`.
- `src/app/pages/home-page.ts` -- hosts four `SignalAbideForm` instances (default policy,
  `liveValidate`, `validateOnBlur`, the `controlValue.set()` fallback) plus the Reactive twin;
  case 1 and case 2 run here.
- `src/app/pages/ready-gate-form.ts` -- the minimal ready-gated form for case 3 (one field, a
  submit control bound to `[disabled]="!abide.ready()"`, a `submission.action` that writes to an
  `<output>` so a post-hydration submit is observable).
- `src/app/pages/ready-page.ts`, `prerender-page.ts`, `defer-page.ts` -- case 3's three
  boundaries: `RenderMode.Server` (`/ready`), `RenderMode.Prerender` (`/prerender`, declared in
  `app.routes.server.ts`), and `@defer (hydrate on interaction)` (`/defer`).
- `src/app/app.config.ts` -- adds `withEventReplay()` and `withIncrementalHydration()` to
  `provideClientHydration()` (prototype 49's app had neither; `@defer (hydrate on interaction)`
  needs the second one).
- `e2e/controls.spec.ts` -- case 1. `e2e/adoption.spec.ts` -- case 2. `e2e/ready.spec.ts` --
  case 3. `playwright.config.ts` -- port 4661 (this effort's assigned range).

## How to run

Versions: `@angular/*` 22.2.0, TypeScript 6.0.3, `foundation-sites` 6.9.0,
`@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0.

```
cd D:/tmp/nfs-proto-abide-controls-and-ready/app
npx ng build
PORT=4661 NG_ALLOWED_HOSTS=localhost,127.0.0.1 node dist/app/server/server.mjs   # restart after every build
npx playwright test                                                            # other shell; chromium, firefox, webkit
```

## Verdict

**Yes to all three questions**, with one design change the DI-based linking forced and one race
condition discovered outside the ticket's pass/fail bar. 27 of 27 tests pass (9 cases times
three engines): Chromium, Firefox, and WebKit.

**Case 1 (control kinds).** Every control kind gets the right classes, `aria-invalid` (never on
`input[type=radio]`), `aria-describedby`, and `role="alert"` for its errors, in both invalid and
valid states, in Signal Forms and Reactive Forms, with no axe violations under the five required
WCAG 2.2 AA tag sets. The custom `FormValueControl` (a non-native host element) needed a design
decision the spec does not yet make: a typed template reference variable
(`#rating="nfsAbideInput"`) on a `hostDirectives`-applied directive **crashed the Angular
compiler** (`Error: Could not resolve [object Object] / [object Object]`, no line number, no
diagnostic) rather than reporting a clean type error. The fix used here links the custom control
by its wrapping label (DI), the same pattern already used for the plain checkbox, and needs no
reference at all. Radio groups and checkbox groups also needed a decision the spec does not
state: which control in the group carries the shared `NfsFormError` link (here, the first
control in the group, by typed reference, since the field state -- and so `errorState()` -- is
identical across every control bound to the same path).

**Case 2 (value adoption).** Event-based adoption -- dispatching `input` (text, `select`,
`textarea`) or `input` then `change` (checkbox, radio) after restoring the saved value --
survived hydration for every native input type tested (text, checkbox, radio, `select`,
`textarea`) and for Reactive Forms, with the main bundle delayed 4 seconds. The
`controlValue.set()` fallback was also tested end to end (a parallel fixture) and works
identically; **the fallback was never needed** -- the event-based route the spec favors carries
every control kind this prototype covers. `number` and `date` input types were not in the
fixture (out of the ticket's named list beyond "native input types"; see below).

**Case 3 (the ready gate).** `[disabled]="!abide.ready()"` blocks both a pre-hydration click
(force-dispatched; a real disabled button never fires a click at all) and a pre-hydration Enter
on a server-rendered route, a prerendered route, and inside `@defer (hydrate on interaction)`:
no navigation, no query string, in all three engines. After hydration the control enables and a
submit runs the client action. Inside the `@defer` block, the interaction that hydrates it (a
short keystroke plus Enter) is exactly the same pre-hydration attempt case 3 asks about, and it
is correctly blocked.

A related but distinct finding, outside case 3's pass/fail bar: typing a **full** value through
the `@defer (hydrate on interaction)` transition (the first keystroke both types a character and
triggers hydration) can drop one character, because `FormField`'s first write races the
event-based adoption rescue while the deferred chunk is still being imported. Measured 3 runs
per engine: Chromium 2 of 3 dropped a character, WebKit 3 of 3, Firefox 0 of 3. This is not the
same mechanism the spec's pre-hydration rescue already covers (typing before hydration begins,
case 2's scenario); it is specific to a trigger event that starts hydration mid-keystroke-stream.

## Results

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
| `@defer` mid-typing race (informational, not a case 3 gate) | Chromium 2/3 dropped a char, WebKit 3/3, Firefox 0/3 | Same file, last test; console output captured below |

Mid-typing race console output (three runs per engine, typing `larsbrinknielsen@gmail.com`):

```
[defer mid-typing race] chromium: got "lrsbrinknielsen@gmail.com"
[defer mid-typing race] chromium: got "larsbinknielsen@gmail.com"
[defer mid-typing race] chromium: got "larsbrinknielsen@gmail.com"
[defer mid-typing race] firefox: got "larsbrinknielsen@gmail.com"
[defer mid-typing race] firefox: got "larsbrinknielsen@gmail.com"
[defer mid-typing race] firefox: got "larsbrinknielsen@gmail.com"
[defer mid-typing race] webkit: got "lrsbrinknielsen@gmail.com"
[defer mid-typing race] webkit: got "lrsbrinknielsen@gmail.com"
[defer mid-typing race] webkit: got "lsbrinknielsen@gmail.com"
```

## Exact error text for failures

- Custom control, typed template reference on a `hostDirectives`-applied directive
  (`<app-star-rating nfsAbideInput #rating="nfsAbideInput" [formField]="f.rating" />`):
  ```
  Error: Could not resolve [object Object] / [object Object]
      at Scope.resolve (.../@angular/compiler/fesm2022/compiler.mjs:33351:13)
      at TcbReferenceOp.execute (.../compiler.mjs:32916:138)
      ...
  ```
  No file, no line number; `ng build` reports only "Angular compilation diagnostics failed."
  Removing the reference and linking through the wrapping label instead compiles cleanly and
  the control works identically in every test. Not filed upstream (OPEN FOR HUMAN; see the
  ticket's `## Answer`).
- Bare-attribute directive inputs (`<label nfsAbideLabel>`, `<span nfsFormError>`) with a
  `transform` typed as `NfsAbideInput | '' | undefined`: `TS2322: Type 'string' is not
  assignable to type 'NfsAbideInput'`, because Angular types a static attribute as `string`, not
  the `''` literal, and `input()`'s overload resolution silently drops to `TransformT = unknown`
  when only one type argument is given. Fixed by widening the transform parameter to accept any
  `string` and supplying both `input<T, TransformT>` type arguments explicitly.
- `native.type` comparisons after casting the host to `HTMLInputElement & HTMLSelectElement &
  HTMLTextAreaElement`: `TS2367: This comparison appears to be unintentional because the types
  '"select-one" | "select-multiple"' and '"checkbox"' have no overlap` (the intersection type's
  `.type` union came from `HTMLSelectElement`). Fixed with separate `as HTMLInputElement` /
  `as HTMLSelectElement` casts per branch instead of one intersection type.

## What the prototype does not prove

- `number` and `date` native input types (the ticket names them as "if the spec covers them";
  the spec's Patterns table documents `inputmode` for them but the fixture did not include
  either). Event-based adoption is not expected to differ (same `value` property path), but it
  was not measured.
- `input[type=file]` and `select[multiple]` adoption: the directive explicitly skips both (per
  spec); neither was exercised in a test, only read from the source.
- Screen-reader output for any control kind (axe checks structure, not what is spoken); the
  custom control's `role="radiogroup"` / `role="radio"` pattern has no roving `tabindex` (every
  star button is focusable), a simplification not covered by an assistive-technology check.
  `aria-invalid` on that `role="radiogroup"` container was asserted present, not that it is
  announced correctly.
- Whether the `hostDirectives` + typed-reference compiler crash is specific to this Angular
  22.2.0 build or reproduces on a minimal repro outside this app; no minimal repro was built and
  no upstream issue was filed (OPEN FOR HUMAN).
- The mid-typing `@defer` race's root cause beyond "the first write races the rescue while the
  chunk import is in flight" -- no source-level fix was attempted, and it was measured only with
  Playwright's `pressSequentially`, not a real human typing cadence.
- Whether the same typed-reference crash affects `label[for]`/`nfsFormError` typed references on
  *native* elements under other conditions; only the custom-control case was hit, and the
  existing native-element typed references (password, confirm, country, bio) all compiled and
  passed.

## Decision handed to the Abide spec

1. Event-based pre-hydration value adoption is the design to keep for every native control kind
   tested; the `controlValue.set()` fallback is unnecessary in practice but costs little to keep
   documented as the fallback (matches the spec's existing text).
2. A custom `FormValueControl` links to `nfsAbideInput` through `hostDirectives`, and must link
   to its label and Form error through the wrapping label (DI), not a typed template reference:
   the reference crashes the compiler. The spec should either state this restriction explicitly
   for custom controls, or the crash should be filed upstream first and the restriction lifted
   if Angular fixes it (OPEN FOR HUMAN).
3. For a radio group or a checkbox group with a shared `validate()` rule, the group's single
   `NfsFormError` links to any one control in the group (its field state is identical to every
   sibling bound to the same path); the spec should say this explicitly, since "the field" is
   ambiguous for a group.
4. The `@defer (hydrate on interaction)` mid-typing race is a new finding, not previously known
   to the spec: a consumer form inside such a block that expects a fast typist to keep typing
   through the triggering keystroke can lose a character, engine-dependently. This does not
   block the `ready` gate decision (case 3's actual question), but the spec's rendering-modes
   subsection should note it as a limit of `@defer (hydrate on interaction)` for text fields,
   distinct from the pre-hydration rescue.

### Triage

1. **Custom-control typed-reference compiler crash.**
   - Impact: not HIGH. A documented workaround (DI linking through a wrapping label) exists and
     was proven to work identically in every test; no consumer-facing behavior is lost, only one
     linking style is unavailable for custom controls.
   - Confidence: HIGH. Reproduced consistently by isolation (removing only the reference fixed
     the build; every other change held constant).
   - Outcome: DECIDED. The spec documents that a custom `FormValueControl` links through its
     wrapping label, not a typed reference. Filing the crash upstream is HUMAN-ONLY BY KIND
     (upstream filing) and stays OPEN FOR HUMAN.
2. **`@defer (hydrate on interaction)` mid-typing race.**
   - Impact: not HIGH. It only affects a form living inside a block whose hydration trigger is
     the same keystroke stream the user is typing into; the ready-gate protection (case 3's
     actual subject) is unaffected, and the value-adoption guarantee (case 2) holds once
     hydration is not itself mid-flight.
   - Confidence: NOT HIGH. Only 9 samples across 3 engines were measured (3 per engine); the
     exact race window and whether it is deterministic per engine version is unknown.
   - Outcome: STAYS OPEN FOR HUMAN. The spec's rendering-modes subsection should note the
     limitation; whether it needs a code fix (for example, hydrating on the first `pointerdown`
     instead of `keydown` for text-entry blocks) is a design call beyond this prototype.

### OPEN FOR HUMAN

1. File the custom-control typed-reference compiler crash upstream (angular/angular): a
   `#ref="exportAs"` template reference on a directive applied through `hostDirectives` produces
   an unlocated internal error (`Could not resolve [object Object] / [object Object]`) instead of
   a diagnostic. Filing needs the user's confirmation (repo rule: never file in a third-party
   repo without it).
2. The `@defer (hydrate on interaction)` mid-typing character-drop race: whether it warrants a
   spec-level mitigation (a different default trigger for text-entry blocks) or just a
   documented limitation.

## Workspace

`D:/tmp/nfs-proto-abide-controls-and-ready/app`. Kept as instructed; all servers used for
testing were stopped and ports 4660-4669 are free.
