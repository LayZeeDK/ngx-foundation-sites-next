# 49. Prototype: Signal Forms on Abide markup

Type: prototype
Status: resolved
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Can a directive that injects the Signal Forms field (`FORM_FIELD` self-injection) drive Foundation's error contract (`.is-invalid-input`, `.is-invalid-label`, `.form-error.is-visible`, `aria-invalid`, `aria-describedby`) under Abide's validate-on policy (change by default, `liveValidate`, `validateOnBlur`)? Whether the 17 named patterns compile and behave under the `v` regex flag is not part of this prototype; the [Spec: Abide](31-spec-abide.md) checks it with a Node script. Check the angular-developer skill's Signal Forms reference against the clone, since the API survey found disagreements.

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-forms-media.md`, `research/angular-22-api-survey.md`, `research/web-platform-features.md`, `research/aria-apg-patterns.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-signal-forms-abide/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/signal-forms-abide/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Resolved 2026-09-26. Prototype: [prototypes/signal-forms-abide/README.md](../prototypes/signal-forms-abide/README.md). Workspace: `D:/tmp/nfs-proto-signal-forms-abide/app`. The orchestrator's brief amended "How to work it": the prototype is a plain Angular CLI 22.2.0 application (`npx @angular/cli@22.2.0 new app --ssr --zoneless --style=scss`) plus `foundation-sites@6.9.0`, not an Nx workspace, and it is driven by `@playwright/test` 1.63.0 against the production SSR server (port 4491), not by playwright-cli. Versions: `@angular/*` 22.2.0, TypeScript 6.0.3. The generator's `vitest ^5.0.0` was pinned back to 4.1.11 and is unused. Styling is Foundation's Sass only (`foundation-forms`, `foundation-callout`, and so on). **No custom CSS was added**, and the form-level alert is hidden with the native `hidden` attribute.

### Verdict

Yes. An `[nfsAbideInput]` directive that reads the Signal Forms field with `inject(FORM_FIELD, {self: true, optional: true})` drives all of Foundation's error contract under one pure error-state policy that reproduces Abide's `validateOn: 'fieldChange'`, `liveValidate`, and `validateOnBlur`: `.is-invalid-input`, `aria-invalid`, and `aria-describedby` as host bindings on the input, `.is-invalid-label` on the label (found by `for`/`id`, else the closest label), `.form-error.is-visible` filtered by `data-form-error-on`, and the form's `[data-abide-error]` alert while invalid after submit. `equalTo` works as a cross-field `validate()` rule and re-validates when the other field changes. The same directive falls back to `NgControl` and gives the same classes under Reactive Forms. 42 of 42 tests pass in Chromium, Firefox, and WebKit on Windows arm64 (84 of 84 with `--repeat-each=2`). WebKit ran without errors. Server HTML is the pristine form. axe (WCAG 2.2 AA plus best practices) is clean on the invalid state except Foundation's default alert colour. `input`, `change`, and `blur`/`focusout` replay into field state after hydration.

Four behaviours needed a design change or are limits the spec inherits:

- (a) Abide's `fieldChange` needs the native `change` event, because field state has no "committed change" signal.
- (b) `submit()` validates a stale value when Enter is pressed in a field debounced with `debounce(path, 'blur')`. A `(keydown.enter)` flush fixes it.
- (c) Hydration overwrites values typed or checked before hydration, in Signal Forms and Reactive Forms alike. The directive can restore them with public API.
- (d) A submit before hydration is a native GET submission that reloads the page with every named field in the URL, the password included. Nothing can replay it.

### Results

| Case | Result | Evidence |
| --- | --- | --- |
| `FORM_FIELD` self-injection on `input[formField]` | Works | `abide.ts` `inject(FORM_FIELD, {self: true, optional: true})`; every Signal Forms test in `e2e/abide.spec.ts` |
| `NgControl` courtesy (Reactive Forms) | Works; `FORM_FIELD` must be checked first because `FormField` also provides `NgControl` (its `InteropNgControl`, `form_field.ts` providers) | Test "Reactive Forms: same classes through the NgControl courtesy"; Reactive state is read through `control.events`, because `_status`/`_touched`/`_pristine` are `@internal` (`abstract_model.ts:625, 739`) |
| Pristine server HTML | No `is-invalid-*`, `is-visible`, or `aria-invalid`; alerts carry `hidden`; inputs carry `jsaction="change:;input:;blur:;"`, the form `jsaction="submit:;"` | `e2e/ssr.spec.ts` "server HTML is the pristine form"; server input: `<input type="email" nfsabideinput="" name="ng.form56.email" required="" value="" aria-describedby="change-email-hint" class="" jsaction="change:;input:;blur:;">` |
| Default policy, blur without change | No error | Test "pristine, blur-without-change, then change timing" |
| Default policy, typing then commit | No error while typing (even after an earlier unchanged blur); error at `change`; the second visit keeps the error until the next commit | Same test |
| `dirty && touched` as the fieldChange rule | Fails: the error shows while typing after an unchanged blur | Chromium: `expect(locator).not.toHaveClass(expected) failed ... Expected pattern: not /(^\|\s)is-invalid-input(\s\|$)/ Received string: "is-invalid-input"` after `pressSequentially('x')`; replaced by a `(change)`-driven `changed` signal |
| Checkbox under fieldChange | Error on click (change), no blur needed; WebKit does not focus a clicked checkbox | Test "checkbox validates on click" |
| `liveValidate` | Error and recovery while typing (`dirty`, no debounce) | Test "liveValidate validates while typing" |
| `validateOnBlur` | Error on blur without a change (`touched`) | Test "validateOnBlur validates on blur without a change" |
| `.is-invalid-label` by `label[for]` and by the closest label | Works | Tests "pristine...", "label[for] and data-form-error-for", "submit shows every error" |
| `data-form-error-on` (`required`, `equalTo`) and `data-form-error-for` | Works; the error kinds are Signal Forms `ValidationError.kind` | Tests "equalTo is a cross-field rule", "label[for] and data-form-error-for" |
| `aria-describedby` | Consumer ids (aliased `aria-describedby` input, Material `userAriaDescribedBy` shape) plus only the ids of errors being shown; generated error ids are written client-side | `toHaveAttribute('aria-describedby', 'change-email-hint nfs-abide-error-0')` and back to `change-email-hint` |
| Flat markup (several fields sharing one parent) | Every field picks up every sibling `.form-error`, exactly as Abide's `findFormError` would | First run: `Expected: "nfs-abide-error-3" Received: "nfs-abide-error-0 nfs-abide-error-1 nfs-abide-error-3 nfs-abide-error-4 nfs-abide-error-5"`; fixed by giving each field its own parent, as Abide's markup assumes |
| `equalTo` cross-field rule | Works; changing the password clears the confirm error | `nfsEqualTo()` with `valueOf(other)` |
| Submit | All invalid fields and the alert show; a valid form hides the alert and runs the `submission.action` | Test "submit shows every error..." |
| axe on the invalid state | No violations with `color-contrast` excluded; `color-contrast` fails on Foundation's default colour | `Element has insufficient color contrast of 4.49 (foreground color: #cc4b37, background color: #fefefe, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1` on `.is-invalid-label`, and the same at 9pt bold on `.form-error.is-visible` |
| Enter-key submit while a debounced field has focus, no flush | Stale value validated: the input shows `larsbrinknielsen@gmail.com`, the field is invalid, nothing submits | Test "Enter-key submit ... (flush false)"; cause: `field/node.ts` `markAsTouched` flushes only the root (`flushSync()`), children get `markAsTouchedInternal` |
| Same, with a flush in the form's `(submit)` listener | Works only when `NfsAbide` is imported before `FormRoot` (listener order follows import order) | With imports `[FormField, FormRoot, NfsAbide, ...]` the result stayed empty; with `[NfsAbide, NfsAbideInput, FormField, FormRoot]` it passed |
| Same, with `(keydown.enter)` calling `FieldState.markAsTouched()` | Works regardless of import order | Test "Enter-key submit ... (flush true)" |
| Replay of `input`, `change`, `blur`/`focusout` typed before hydration (4 s bundle delay) | Replayed: error classes, `aria-invalid`, and the visible error appear after hydration; no console errors | Test "input, change, blur/focusout before hydration replay (prototype fixes on)" |
| Values typed or checked before hydration, without the rescue | Lost: the field is empty and flagged invalid; the same happens under Reactive Forms | Test "without the rescue ..."; `FormField`'s first update pass calls `setNativeControlValue(input, controlValue)` (`control_native.ts`) on the reused node |
| Values typed or checked before hydration, with the rescue | Kept: `value`/`checked` read at construction, `controlValue.set()` in `afterNextRender` (runs before replay) | Same test file, "prototype fixes on" |
| Submit before hydration | Native GET submission: the page reloads with the fields in the URL, nothing replays, the new page is pristine | URL `http://localhost:4491/?ng.form84.email=x&ng.form84.password=hunter2&ng.form84.confirm=&ng.form84.zip=` |
| `(keydown.enter)` replay annotation | Not annotated (the key-events plugin registers it); harmless because Enter before hydration submits natively anyway | Server `jsaction="change:;input:;blur:;"` |
| Blur-driven layout shift | In Firefox and WebKit, clicking a checkbox while a text field with a visible error has focus can miss: the mousedown blur hides that error (`display: none`), the layout moves before mouseup | `locator.check: Clicking the checkbox did not change its state`; passes when the field is committed first; Foundation's `.form-error` CSS does the same under Abide |
| Skill vs clone: `when` on validators other than `required` | Skill is wrong: `BaseValidatorConfig.when` exists on every standard validator | `skill-check.ts` compiles `pattern(p, /x/, {when})`; `rules/validation/util.ts:22, 32` |
| Skill vs clone: validators returning `null` | Skill is wrong: `ValidationSuccess = null \| undefined \| void` | `types.ts:138`; `skill-check.ts` compiles |
| Skill vs clone: `submit(form, async () => ...)` | Skill is right; the API survey's "disagreement" is wrong: both the action-function overload and `{action}` exist | `structure.ts:455-466`; `skill-check.ts` compiles |
| Skill vs clone: `validateAsync` | Exists, `@publicApi 22.0` (the survey had not verified it) | `rules/validation/validate_async.ts:128` |
| Skill omissions | `FORM_FIELD`, `FormRoot`, `FieldState.controlValue`, `markAsTouched`, `provideSignalFormsConfig({classes})` are absent from the skill | `form_field.ts`, `form_root.ts`, `api/di.ts` |

`tsc --noEmit -p tsconfig.app.json` checks `skill-check.ts`. The positive control, an appended type error, failed as expected with `error TS2322`.

### Exact error text for failures

- `fieldChange` as `dirty && touched`: `Error: expect(locator).not.toHaveClass(expected) failed ... Received string: "is-invalid-input"` (Chromium, line "Typing does not validate").
- Enter-key submit without the flush: the output stayed empty (`Expected substring: "\"email\":\"larsbrinknielsen@gmail.com\"" Received string: ""` when the flush sat in the form's `(submit)` listener behind `FormRoot`).
- Pre-hydration text without the rescue: `Expected: "x" Received: ""` on `toHaveValue`, with the input rendered as `class="is-invalid-input" aria-invalid="true"`.
- Checkbox after a blur-driven layout shift (Firefox, WebKit): `Error: locator.check: Clicking the checkbox did not change its state`.
- axe: `color-contrast` `Element has insufficient color contrast of 4.49 (foreground color: #cc4b37, background color: #fefefe ...). Expected contrast ratio of 4.5:1`.

### What the prototype does not prove

- Radio groups, checkbox groups with `data-min-required`, `select`, `textarea`, and custom `FormValueControl` controls (only text, email, password, and a single checkbox were tested).
- `validateOn` set to manual (`null`): the policy function covers it, but no test does.
- Form reset (`formreset.zf.abide`, resetting `submitted`), disabled or hidden fields, `data-abide-ignore`, and `formnovalidate`.
- Async validators (`pending`) and error display while pending.
- `@defer (hydrate on ...)` blocks and prerendered routes (only full hydration of a `RenderMode.Server` route was tested), and a non-zoneless app.
- Screen-reader output: axe checks structure only; whether `role="alert"` on the form alert, the error text inside a wrapping label (which becomes part of the input's name once visible), and `aria-describedby` announce well was not heard.
- Template-driven forms (`NgModel`); the `NgControl` path was tested with Reactive Forms only.
- Material's `aria-invalid` null while empty-and-required was not adopted; the prototype follows Abide (`aria-invalid="true"` whenever the error shows).

### Decision handed to the [Spec: Abide](31-spec-abide.md)

1. `nfsAbideInput` injects `FORM_FIELD` `{self: true, optional: true}` first and only then `NgControl` `{self: true, optional: true}`. Reactive state is read through `control.events` into a signal, because Reactive Forms has no public state signals.
2. The error-state policy is one pure function: `invalid && (submitted || (liveValidate && dirty) || (validateOnBlur && touched) || (validateOn === 'fieldChange' && changed))`. `changed` comes from a `(change)` host listener, `submitted` from a `(submit)` host listener on the form. Neither calls `preventDefault()`, so both are replay-safe. The value's commit timing is the consumer's schema: `debounce(path, 'blur')` on text paths when `liveValidate` is off, or `updateOn: 'blur'` for Reactive Forms. The directive cannot set it, so the spec documents it, and it could export a schema helper that applies it.
3. The input directive flushes on `(keydown.enter)` through `FieldState.markAsTouched()`. The spec must not place the flush in the form's `(submit)` listener, which depends on import order.
4. The spec states the pre-hydration value loss and the rescue decision (see OPEN FOR HUMAN), and states that a pre-hydration submit is native and cannot be replayed.
5. `aria-describedby` = consumer ids (an aliased `aria-describedby` input) plus the ids of the errors being shown, never hidden ones. Error ids are generated client-side (CDK `_IdGenerator` in the library) and referenced only from the host binding.
6. Label and error discovery: the prototype used Abide's DOM rules (`label[for]` else the closest label; sibling `.form-error`s else inside the parent; `[data-form-error-for]`; `data-form-error-on` matched to `ValidationError.kind`) and Renderer2 class toggles in `afterRenderEffect`. It keeps the consumer's markup verbatim and is hydration-clean, because nothing is written before the first client render. It also inherits Abide's flat-markup trap. The alternative in `building-blocks.md` Table A is explicit `label[nfsAbideLabel]`, `[nfsFormError]`, and `[nfsAbideAlert]` directives with host bindings, which avoid the trap and let the alert's `hidden` come from a server-rendered binding instead of a consumer-written attribute. The spec picks one. The prototype shows the DOM route works and costs no extra directives.
7. `provideSignalFormsConfig({classes: {'is-invalid-input': ...}})` exists and could add the input class, but it cannot reach the label, the errors, or ARIA, so it does not replace the directive.
8. Server `name` attributes (`ng.formN.<key>`) come from a process-wide counter and differ per request and from the client. This is harmless for hydration (attributes are not compared), but it matters for pre-hydration native submissions.
9. The 17 patterns are not ported here. The Abide spec's Node script owns that.

### OPEN FOR HUMAN

1. **Pre-hydration submit.** A dehydrated Signal Forms form submits natively as a GET to the same URL, with every field in the query string, passwords included. Sources and the prototype cannot choose the library's stance: document `method="post"` plus a server action for forms rendered on the server, keep the submit control inert or disabled until hydration (which breaks no-JS use), or accept the behaviour and document it. It may also warrant an upstream Angular issue (`FormField` rendering `name`, `FormRoot` rendering `novalidate`). Filing it is a human decision.
2. **Pre-hydration value rescue.** Hydration overwrites typed and checked values for every `[formField]` (and Reactive) control, not only Abide's. Should `nfsAbideInput` ship the `controlValue.set()` rescue (public API, proven here), or should the library document the loss and report it upstream instead?
3. **Upstream report for `submit()` not flushing debounced children.** The source reading (`field/node.ts`) and the failing test are enough for an Angular issue. Filing requires the user's confirmation.
4. **Foundation's default alert colour fails WCAG AA contrast** (`#cc4b37` on `#fefefe`, 4.49:1) on `.is-invalid-label` and `.form-error`. The library adds no CSS (standing rule), so the fix is the consumer's `$alert-color` or `$foundation-palette` alert setting, or `$form-label-color-invalid` and `$input-error-color`. Should the spec recommend a settings override in its docs, or does the library accept a documented exception to the axe gate for Foundation's defaults?

Orchestrator, 2026-09-26: item 4 is settled by the user's restated rule that every directive and component complies with WCAG 2.2 AA: the [Spec: Abide](31-spec-abide.md) states the Foundation Sass settings (`$input-error-color` and the alert palette) that reach 4.5:1, and the story axe gate enforces it; a documented exception is not allowed. Items 1 to 3 stay OPEN FOR HUMAN (upstream issues need the user's confirmation), with the Abide spec choosing the library's default behaviour for each from sources.
