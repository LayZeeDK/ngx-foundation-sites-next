# Spec: Abide

Ticket: [Spec: Abide](../issues/31-spec-abide.md). Decision records: ADR 0006 (Signal Forms replaces Abide's engine), ADR 0008 (Rendering modes), ADR 0012 (Sass packaging), [ADR 0026](../adr/0026-abide-explicit-error-directives.md) (explicit error-markup directives), and [ADR 0027](../adr/0027-abide-pre-hydration-submit.md) (the pre-hydration submit stance). Prototype: [Prototype: Signal Forms on Abide markup](../issues/49-prototype-signal-forms-abide.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

Foundation for Sites ships Abide, a jQuery validation engine for forms: seventeen named patterns, custom validators, `data-equalto`, and a class-plus-ARIA error contract (`.is-invalid-input` on the field, `.is-invalid-label` on its label, `.form-error.is-visible` for the message, `aria-invalid`, `aria-describedby`, and a form-level `[data-abide-error]` box). An Angular developer who wants Foundation's form look today has two bad choices. Either they load Abide next to Angular's forms and get two validation systems that disagree about what the value is and when it is invalid, or they drop Abide and hand-write the class toggling, the error-to-field association, the timing rules (validate on change, while typing, or on blur), and the form-level alert on every form.

The developer also meets problems Abide never had to solve. Angular 22's Signal Forms own the value and the validity, so the error display has to follow field state, not the DOM. Server-rendered forms are pristine HTML until hydration: a value typed before hydration is overwritten when Angular takes over, and a submit before hydration is a native GET that puts every field, the password included, into the URL. Foundation's default error colours miss WCAG 2.2 AA contrast by a hair (4.49:1), and its per-field errors are invisible to a screen reader unless something makes them live.

## Solution

Five small attribute directives on the Foundation form markup the developer already writes, driven by Signal Forms field state, with Reactive Forms supported as a courtesy:

- `form[nfsAbide]` holds the Error-state policy (Foundation's `validateOn`, `liveValidate`, `validateOnBlur`) and knows whether the form has been submitted.
- `[nfsAbideInput]` on each `input`, `textarea`, or `select` reads the Signal Forms field bound on the same element and renders `.is-invalid-input`, `aria-invalid`, and `aria-describedby` from it.
- `label[nfsAbideLabel]` renders `.is-invalid-label`.
- `[nfsFormError]` on each Form error (`.form-error`) shows the message for the error kind it names and joins the field's `aria-describedby` only while shown.
- `[nfsAbideAlert]` on the Form alert (Foundation's `[data-abide-error]` box) shows it while a submitted form is invalid.

Validation itself is Signal Forms: `required()`, `pattern()`, `email()`, `validate()`. The library exports Foundation's seventeen patterns as `nfsPatterns` (checked and, where needed, rewritten to compile under the `v` regex flag) and Abide's `equalTo` as `nfsEqualTo()`. Every class and ARIA attribute is a host binding, so the server HTML is the pristine form; values typed before hydration are adopted, not lost; and the spec requires one Foundation Sass setting set (five variables) that makes the invalid state pass WCAG 2.2 AA.

## User Stories

1. As an application developer, I want to keep Foundation's form markup (`label`, `input`, `.form-error`, `.help-text`, `.callout.alert`), so that I reuse Foundation's docs and Sass without learning new structure.
2. As an application developer, I want validation to live in my Signal Forms schema, so that there is one source of truth for value and validity.
3. As an application developer, I want the invalid field to get Foundation's `.is-invalid-input`, so that Foundation's error border and tint appear.
4. As an application developer, I want the field's label to get `.is-invalid-label`, so that the label turns to the error colour as in Foundation.
5. As an application developer, I want a Form error to get `.is-visible` only while its field shows an error, so that Foundation's `display: none` rule hides it otherwise.
6. As an application developer, I want errors to appear after a committed change by default (Abide's `validateOn: 'fieldChange'`), so that users are not scolded while they type.
7. As an application developer, I want a `liveValidate` option, so that errors appear and clear on every keystroke when I want that.
8. As an application developer, I want a `validateOnBlur` option, so that leaving a required field empty shows its error even without a change.
9. As an application developer, I want a manual mode (`validateOn` set to `null`), so that errors show only after a submit.
10. As an application developer, I want every error to show after a submit, so that nothing invalid stays silent.
11. As an application developer, I want a form-level alert that appears while a submitted form is invalid and disappears when it is valid, so that users know the submit failed.
12. As an application developer, I want several messages per field, each shown only for its error kind (`required`, `pattern`, `equalTo`, my own), so that the message says exactly what to fix.
13. As an application developer, I want to place a Form error away from its field (input groups), so that Foundation's `data-form-error-for` layout still works.
14. As an application developer, I want the wrapping-label markup to link label and field with no references, and Form errors placed after the label to link by a typed template reference, so that an error never becomes part of the field's name.
15. As an application developer, I want the `label[for]` markup to link through typed template references, so that the compiler catches a wrong link.
16. As an application developer, I want Foundation's seventeen named patterns as exported regular expressions, so that I do not copy regexes by hand.
17. As an application developer, I want those patterns to be valid under the `v` flag, so that I can also reuse their source in an HTML `pattern` attribute.
18. As an application developer, I want an `equalTo` schema helper that re-validates when the other field changes, so that a password confirmation clears when the password is fixed.
19. As an application developer, I want my own validators to be ordinary `validate()` rules whose kind I can target from markup, so that Abide's `data-validator` has a direct replacement.
20. As an application developer, I want application-wide defaults for the policy, so that every form in my app validates the same way without repeating options.
21. As an application developer using Reactive Forms, I want the same classes and ARIA from the same directives, so that I can migrate forms one at a time.
22. As an application developer, I want pressing Enter in a field to submit the value I see, not a stale debounced one, so that implicit submission works with blur-committed fields.
23. As an application developer, I want a consumer `aria-describedby` (a hint) to survive, so that hints stay announced next to errors.
24. As an application developer rendering on the server, I want the server HTML to be the pristine form with the alert hidden, so that first paint is correct and nothing flashes.
25. As an application developer rendering on the server, I want values users typed or checked before hydration to survive hydration, so that nobody has to type them again.
26. As an application developer rendering on the server, I want a way to keep the form from submitting before hydration, so that passwords never reach the URL and entries are never lost.
27. As an application developer, I want the directives to be hydration-clean and replay-safe, so that `change` and `submit` made before hydration are handled.
28. As an application developer, I want a documented way to focus the first invalid field after a failed submit, so that long forms stay usable.
29. As a keyboard user, I want Tab, Enter, Space, and arrow keys to behave natively, so that nothing about the form surprises me.
30. As a screen reader user, I want an invalid field to be announced as invalid with its error text as its description, so that I know what is wrong (WCAG 3.3.1).
31. As a screen reader user, I want an error that appears while my focus is elsewhere to be announced, so that I learn about it without hunting (WCAG 4.1.3).
32. As a screen reader user, I want hidden errors never to be part of the description, so that I only hear current problems.
33. As a screen reader user, I want the form-level alert announced when a submit fails, so that I know the submit did not go through.
34. As a user with low vision, I want error text, invalid labels, placeholders, and field borders to meet WCAG 2.2 AA contrast, so that I can read and find them (1.4.3, 1.4.11).
35. As a colour-blind user, I want every error to have visible text, not only a red border, so that the error does not depend on colour (1.4.1).
36. As a user, I want my entries kept after a failed submit, so that I only fix what is wrong (3.3.7).
37. As a user signing in, I want to paste into password and confirmation fields, so that password managers work (3.3.8).
38. As a library maintainer, I want the error-state rule to be one pure function, so that it is tested as a truth table.
39. As a library maintainer, I want no library CSS for Abide, only compile-time contrast checks, so that Foundation's Sass stays the only styling and a consumer who keeps a failing setting hears about it in their own compile.
40. As a library maintainer, I want dev-mode warnings when a label or Form error cannot find its field, or when a field shows an error with no visible message, so that broken markup is caught early.
41. As a library maintainer, I want the story axe gate to fail when the consumer settings are missing, so that the contrast fix cannot regress silently.

## Implementation Decisions

### Foundation contract

Source: Foundation 6.9.0's `Abide.defaults` in the plugin source, the Abide docs page, Foundation's form error Sass, and the forms-and-media inventory research (Abide).

Options (`Abide.defaults`) and their fate:

| Option (`data-*`) | Default | Library counterpart |
| --- | --- | --- |
| `validateOn` (`data-validate-on`) | `'fieldChange'` | `NfsAbide.validateOn` input, `'fieldChange' \| null`; any other string means manual (`null`), as in Foundation |
| `liveValidate` | `false` | `NfsAbide.liveValidate` input |
| `validateOnBlur` | `false` | `NfsAbide.validateOnBlur` input |
| `a11yErrorLevel` | `'assertive'` | `NfsAbide.a11yErrorLevel` input, `'assertive' \| 'polite' \| 'off'`; decides the Form alert's role |
| `a11yAttributes` | `true` | Always on (building-blocks 1.4, `accessible` rule): `role="alert"` on Form errors, `aria-describedby` to shown errors, the Form alert's role |
| `labelErrorClass`, `inputErrorClass`, `formErrorClass` | `is-invalid-label`, `is-invalid-input`, `is-visible` | Dropped option: the classes are the contract (building-blocks 1.4 class-name options) |
| `formErrorSelector` | `'.form-error'` | Dropped option: Form errors are the elements carrying `nfsFormError`, which adds `.form-error` |
| `patterns` | 17 named regexes | `nfsPatterns` export (see Patterns) |
| `validators` | `{equalTo}` | `nfsEqualTo()` export; custom validators are `validate()` rules |

`validateOnFormChange` is not an Abide option (audit 0001, H6); it was never mapped.

Field attributes Abide reads, and their replacement:

| Abide attribute | Replacement |
| --- | --- |
| `required` | `required(path)`; Signal Forms mirrors the native `required` attribute |
| `pattern="<name or regex>"`, `data-pattern` | `pattern(path, nfsPatterns.<name>)` or `pattern(path, /.../v)` |
| implicit pattern from `type` (`type="email"` uses the `email` regex) | Dropped: the schema is explicit; `email(path)` or `pattern(path, nfsPatterns.email)` |
| `data-validator="a b"` | one `validate(path, ...)` rule per name, returning `{kind: 'a'}` |
| `data-equalto="<id>"` | `nfsEqualTo(path, otherPath)` |
| `data-min-required="<n>"` | a `validate()` rule on each checkbox path reading the group with `valueOf` (usage note); no helper |
| `data-abide-ignore`, `type="hidden"`, `disabled` | no rule on that path, or `disabled()`/`hidden()` rules, which Signal Forms skips during validation |
| `formnovalidate` on a submit control | Changed: `FormRoot` does not read it; a `type="button"` control calls `submit(form, {action, ignoreValidators: 'all'})` |

Error markup Abide reads: `.form-error` as sibling or inside the parent (replaced by explicit links, below), `[data-form-error-for]` (replaced by `[nfsFormError]="field"`), `[data-form-error-on]` (the `formErrorOn` input), `[data-abide-error]` (the element carrying `nfsAbideAlert`).

Events: `valid.zf.abide`, `invalid.zf.abide`, `formvalid.zf.abide`, `forminvalid.zf.abide`, `formreset.zf.abide` have no outputs (building-blocks 1.4; ADR 0006). Consumers read field state signals; a failed submit is Signal Forms' `onInvalid` submission callback.

Methods: none carried. `validateForm()` is a native submit (`requestSubmit()` or a submit button); `validateInput()` is unnecessary because Signal Forms validates continuously; `resetForm()` is `form().reset(value)`; `enableValidation()`/`disableValidation()` are `applyWhen()` or `ignoreValidators`; `requiredCheck`, `findFormError`, `findLabel`, `addErrorClasses`, `removeErrorClasses`, `matchValidation`, `_reflow` are internals of the jQuery engine.

### CSS class to Angular mapping

| Foundation class or attribute | Element | Angular | Notes |
| --- | --- | --- | --- |
| `form[data-abide]` | `form` | `form[nfsAbide]`, `NfsAbide` | Plugin element; no Structural class |
| `.is-invalid-input` | `input`, `textarea`, `select` | `[nfsAbideInput]`, `NfsAbideInput`, host class binding | State class |
| `.is-invalid-label` | `label` | `label[nfsAbideLabel]`, `NfsAbideLabel`, host class binding | State class on a label |
| `.form-error` | any element, usually `span` or `p` | `[nfsFormError]`, `NfsFormError`, adds `.form-error` | Structural class |
| `.form-error.is-visible` | same | `NfsFormError` host class binding | State class |
| `[data-abide-error]` (with `.alert.callout`) | `div` | `[nfsAbideAlert]`, `NfsAbideAlert`, `hidden` host binding | The consumer keeps `.callout.alert` as Variant classes |
| `.help-text` | `p` | none | Consumer id goes into `aria-describedby` |

### Hierarchy and DI shape

```
form[nfsAbide]                       provides nfsAbideToken; policy, submitted, ready
  [nfsAbideAlert]                    injects nfsAbideToken (required)
  label[nfsAbideLabel]               provides nfsAbideLabelToken; field = reference ?? registered input
    input[nfsAbideInput][formField]  self-injects FORM_FIELD, else NgControl; registers with the
                                     form (optional) and the enclosing label (optional)
    [nfsFormError]                   field = reference ?? enclosing label's field; registers with the field
  [nfsFormError]="emailField"        anywhere in the template (Foundation's data-form-error-for)
```

- `nfsAbideToken` (`InjectionToken<NfsAbide>`, lightweight, `import type`), provided by `NfsAbide` with `useExisting`. `NfsAbideInput` injects it `{optional: true}`: a field outside an `nfsAbide` form still works with the Defaults token policy and never counts as submitted. `NfsAbideAlert` injects it without `optional`: an alert outside a form is an error (NG0201).
- `nfsAbideLabelToken`, provided by `NfsAbideLabel`. An input inside the label registers itself (`inject(nfsAbideLabelToken, {optional: true, skipSelf: true})`); a bare `nfsFormError` inside the label resolves its field through it. That form is for custom `FormValueControl` hosts only; a native control's Form error goes after the label with a reference (the development check).
- Links that DI cannot express (a `label[for]` beside the input, an error away from the field) are typed template references: `[nfsAbideLabel]="pw"` and `[nfsFormError]="pw"` with `#pw="nfsAbideInput"`, the same target rule as Triggers (ADR 0013). The bare attribute (`nfsFormError` with no value) means "the field of the enclosing `nfsAbideLabel`".
- Custom controls: a component implementing `FormValueControl` applies `NfsAbideInput` through `hostDirectives` and links to its label and Form error through the wrapping label (DI): `<label nfsAbideLabel>Rate your interest <app-star-rating [formField]="f.rating" /><span nfsFormError>Pick at least one star.</span></label>`, where the component declares `hostDirectives: [{directive: NfsAbideInput, inputs: ['aria-describedby']}]` on the element `[formField]` binds. It cannot use a typed template reference: a reference such as `#rating="nfsAbideInput"` to a directive applied through `hostDirectives` crashes the Angular compiler with an internal error that names no file or line (`Error: Could not resolve [object Object] / [object Object]`, thrown at `Scope.resolve` from `TcbReferenceOp.execute`, while `ng build` reports only "Angular compilation diagnostics failed."), measured by the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md). Linking through the wrapping label compiles and behaves identically.
- Groups: a radio group (every radio bound to one path) or a checkbox group whose boxes share one `validate()` rule (the `data-min-required` recipe) has one Form error for the group, placed after the controls' labels (not inside a wrapping label, which the development check flags) and linked by a reference to any one control of the group, as for every native control: every control bound to the same path has identical field state, and the shared rule makes every box of the checkbox group invalid together (the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md), under both form APIs).
- Field state: `NfsAbideInput` injects `FORM_FIELD` from `@angular/forms/signals` with `{self: true, optional: true}` first, then `NgControl` `{self: true, optional: true}` only when there is no `FORM_FIELD` (on a `[formField]` element `NgControl` is Signal Forms' `InteropNgControl`, so the order matters; prototype result 2). Reactive state is read through `control.events` into a signal, because Reactive Forms has no public state signals.
- Registration: inputs register with the form (the form's `invalid` and the `submitted` reset read them) and Form errors register with their field (the field's `aria-describedby` reads them). A Form error or input found through DI registers at construction; a Form error linked by `[nfsFormError]="field"` registers from an `effect` whose cleanup unregisters, the reverse-link exception of building-blocks 1.5 and 1.9, because the reference arrives with the first update and can change. Both are undone on destroy, and both survive `@for` and `@if` (amended 2026-09-26, audit 0005 M4).
- `nfsAbideDefaultsToken` (`InjectionToken<NfsAbideDefaults>`, Shape B, all optional): `validateOn`, `liveValidate`, `validateOnBlur`, `a11yErrorLevel`. `NfsAbide` seeds its input defaults from it; `NfsAbideInput` outside a form reads it directly. Provided at bootstrap, route, or element level; the nearest wins.
- Ids: a consumer `id` on a Form error wins; otherwise CDK `_IdGenerator` with prefix `nfs-form-error-` (building-blocks 1.5). Generated ids are referenced only from the input's `aria-describedby` host binding, which hydration rewrites.

### API per directive

Short type-level signatures (prose is less precise here):

```ts
export type NfsAbideValidateOn = 'fieldChange' | null;
export type NfsAbideA11yErrorLevel = 'assertive' | 'polite' | 'off';

export interface NfsAbideDefaults {
  validateOn?: NfsAbideValidateOn;
  liveValidate?: boolean;
  validateOnBlur?: boolean;
  a11yErrorLevel?: NfsAbideA11yErrorLevel;
}
export const nfsAbideDefaultsToken: InjectionToken<NfsAbideDefaults>;
export const nfsAbideToken: InjectionToken<NfsAbide>;
export const nfsAbideLabelToken: InjectionToken<NfsAbideLabel>;

/** What the Error-state policy reads about one field. */
export interface NfsAbideFieldStatus {
  invalid: boolean;
  touched: boolean;
  dirty: boolean;
  changed: boolean;              // a native change has fired since the field was last pristine
  kinds: readonly string[];      // ValidationError.kind values, or Reactive error keys
}
export interface NfsAbidePolicy {
  validateOn: NfsAbideValidateOn;
  liveValidate: boolean;
  validateOnBlur: boolean;
}
/** The Error-state policy (from the prototype; Material ErrorStateMatcher shape). */
export function nfsAbideErrorState(s: NfsAbideFieldStatus, p: NfsAbidePolicy, submitted: boolean): boolean;
// = s.invalid && (submitted || (p.liveValidate && s.dirty) || (p.validateOnBlur && s.touched)
//                 || (p.validateOn === 'fieldChange' && s.changed))
```

`NfsAbide`, selector `form[nfsAbide]`, `exportAs: 'nfsAbide'`:

| Member | Kind | Type and default | Foundation | Notes |
| --- | --- | --- | --- | --- |
| `validateOn` | `input()` with transform | `NfsAbideValidateOn`, default `'fieldChange'` (Defaults token first) | `data-validate-on` | Any value other than `'fieldChange'` becomes `null` (manual) |
| `liveValidate` | `input()`, `booleanAttribute` | `false` | `data-live-validate` | Shows errors from the first keystroke (`dirty`) |
| `validateOnBlur` | `input()`, `booleanAttribute` | `false` | `data-validate-on-blur` | Shows errors after any blur (`touched`) |
| `a11yErrorLevel` | `input()` | `'assertive'` | `data-a11y-error-level` | `assertive` renders `role="alert"` on the Form alert, `polite` renders `role="status"`, `off` renders no role |
| `policy` | `Signal<NfsAbidePolicy>` | read-only | | The three policy inputs as one object |
| `submitted` | `Signal<boolean>` | read-only | | Set by the form's native `submit` event; back to `false` when every registered field is untouched again (a `linkedSignal` whose source is "all registered fields untouched"), which is what `form().reset()` and Reactive `reset()` produce |
| `invalid` | `Signal<boolean>` | read-only | | Any registered field invalid |
| `ready` | `Signal<boolean>` | read-only | | `false` on the server and until the first client render callback, then `true`; the consumer binds a submit control's `disabled` to `!ready()` (see Rendering modes) |

Host: `(submit)` sets `submitted` and calls no `preventDefault()` (`FormRoot` or `FormGroupDirective` owns submission). No outputs, no methods.

`NfsAbideInput`, selector `input[nfsAbideInput], textarea[nfsAbideInput], select[nfsAbideInput]`, `exportAs: 'nfsAbideInput'`:

| Member | Kind | Type and default | Notes |
| --- | --- | --- | --- |
| `userAriaDescribedBy` | `input()`, alias `aria-describedby` | `string \| null`, `null` | Consumer ids (hints), Material `MatInput` shape; a static `aria-describedby` attribute feeds it |
| `status` | `Signal<NfsAbideFieldStatus>` | read-only | From `FORM_FIELD` state or `NgControl` events plus the `changed` signal |
| `errorState` | `Signal<boolean>` | read-only | `nfsAbideErrorState(status, policy, submitted)`; Material's name |

Host bindings and listeners:

| Binding | Value |
| --- | --- |
| `[class.is-invalid-input]` | `errorState()` |
| `[attr.aria-invalid]` | `'true'` while `errorState()`, else `null`; never on `input[type=radio]` (WAI-ARIA supports `aria-invalid` on `radiogroup`, not `radio`, and ARIA 1.2 deprecates it as a global) |
| `[attr.aria-describedby]` | consumer ids, then the ids of this field's registered Form errors that are visible, space-separated; `null` when empty |
| `(change)` | sets `changed` (Abide's `fieldChange` trigger; replayable; no `preventDefault()`) |
| `(keydown.enter)` | on `input` hosts only: `FieldState.markAsTouched()` on the Signal Forms field, which flushes a `debounce(path, 'blur')` buffer before the implicit submission (prototype result "Enter-key submit"); nothing on `textarea` or `select`, nothing under Reactive Forms, whose `FormGroupDirective` already syncs pending values on submit |

`changed` is a `linkedSignal` whose source is the field's `dirty` state: it resets to `false` whenever `dirty` changes, so `form().reset()` clears it and the first keystroke after a reset does not count as a commit. The prototype showed `dirty && touched` cannot stand in for it (errors showed while typing after an unchanged blur).

Pre-hydration input adoption (the value rescue): at construction the directive saves the host's `value` (or `checked` for checkbox and radio hosts). In `afterNextRender`, which runs before event replay, it compares the saved value with what the element shows after the forms library's first write; when they differ and the saved value is not empty or unchecked, it writes the saved value back and dispatches `input` (text-like hosts, `textarea`, `select`) or `input` then `change` (checkbox, radio) on the host, so the bound control parses it through its own value path (Signal Forms `FormField`, a Reactive value accessor) and marks the field dirty like typing. In a client-rendered form the saved value is always empty or equal to the model, so nothing happens. `input[type=file]` and `select[multiple]` are skipped. Limit: a server-prefilled field the user cleared before hydration gets its prefill back. The prototype proved adoption with `FieldState.controlValue.set()` for text and checkbox fields; the event-based form for every native type and for Reactive Forms was confirmed in three engines by the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md), with `controlValue.set()` (string, boolean, or the radio's value) plus `control.setValue()` and `markAsDirty()` as the fallback.

`NfsAbideLabel`, selector `label[nfsAbideLabel]`:

| Member | Kind | Type and default | Notes |
| --- | --- | --- | --- |
| `field` | `input()`, alias `nfsAbideLabel`, transform `'' -> undefined` | `NfsAbideInput \| undefined` | Bare attribute: the input registered inside this label |

Host: `[class.is-invalid-label]` = the resolved field's `errorState()`. Dev mode: warns once in `afterNextRender` when no field resolves.

`NfsFormError`, selector `[nfsFormError]`:

| Member | Kind | Type and default | Foundation | Notes |
| --- | --- | --- | --- | --- |
| `field` | `input()`, alias `nfsFormError`, transform `'' -> undefined` | `NfsAbideInput \| undefined` | `data-form-error-for` | Bare attribute: the enclosing `nfsAbideLabel`'s field |
| `formErrorOn` | `input()` | `string \| readonly string[] \| null`, `null` | `data-form-error-on` | Error kinds this message is for; `null` shows it for any error. Kinds are Signal Forms `ValidationError.kind` (`required`, `pattern`, `email`, `min`, `max`, `minLength`, `maxLength`, `equalTo`, custom) or Reactive error keys |
| `id` | `input()` | `string`, default generated `nfs-form-error-<n>` | | Consumer `id` wins |
| `visible` | `Signal<boolean>` | read-only | | `field.errorState() && (formErrorOn is null or intersects field.status().kinds)` |

Host: static `class="form-error"` (merged with the consumer's classes), `[id]`, `[class.is-visible]` = `visible()`, `[attr.role]` = the static `role` attribute when the consumer wrote one (read through `HostAttributeToken('role')`), else `'alert'`. Dev mode: warns once when no field resolves, warns once when it is a descendant of a `label` and its field is a native control (Firefox then reads the error as part of the field's name and Chromium fires no alert event for it; place it after the label and link it by reference), and the field warns once when it enters its error state with no visible Form error (WCAG 3.3.1 and 1.4.1 need visible text).

`NfsAbideAlert`, selector `[nfsAbideAlert]`: no inputs. Host: `[hidden]` while not (`submitted() && invalid()`), `[attr.role]` from the form's `a11yErrorLevel` unless the consumer wrote a static `role`.

Schema helpers, exported from the same entry point:

```ts
export const nfsPatterns: {
  readonly alpha: RegExp; readonly alphaNumeric: RegExp; readonly integer: RegExp; readonly number: RegExp;
  readonly card: RegExp; readonly cvv: RegExp; readonly email: RegExp; readonly url: RegExp;
  readonly domain: RegExp; readonly datetime: RegExp; readonly date: RegExp; readonly time: RegExp;
  readonly dateISO: RegExp; readonly monthDayYear: RegExp; readonly dayMonthYear: RegExp;
  readonly color: RegExp; readonly website: RegExp;
};
export function nfsEqualTo<T>(path: SchemaPath<T>, other: SchemaPath<T>, config?: {message?: string}): void;
// validate(path, ({value, valueOf}) => value() === valueOf(other) ? null : {kind: 'equalTo', message})
```

Patterns (Foundation name, library key, `v`-flag result from the ticket's Node script):

| Foundation | Key | Compiles under `v` unchanged | Library source | `inputmode` to write |
| --- | --- | --- | --- | --- |
| `alpha` | `alpha` | yes | Foundation's | none (ASCII only, as Foundation; for other languages the docs show `/^\p{L}+$/v`) |
| `alpha_numeric` | `alphaNumeric` | yes | Foundation's | none |
| `integer` | `integer` | no: `[-+]` has an unescaped `-` | `^[\-+]?\d+$` | `numeric` only when no sign is expected |
| `number` | `number` | no: `\,` and unescaped `-` in a class (also invalid under `u`) | `^[\-+]?\d*(?:[.,]\d+)?$` | `decimal` when no sign is expected |
| `card` | `card` | yes | Foundation's source (includes the Mastercard 2221-2720 range the docs copy lacks) | `numeric`, with `autocomplete="cc-number"` |
| `cvv` | `cvv` | yes | Foundation's | `numeric`, with `autocomplete="cc-csc"` |
| `email` | `email` | no: `{|}` and trailing `-` unescaped in a class | escapes `` ` ``, `{`, `|`, `}`, `-` inside the classes | none (`type="email"` already picks the keyboard) |
| `url` | `url` | no: `(`, `)`, `{`, `}` unescaped in classes (also invalid under `u`) | escapes them inside the classes | none (`type="url"`) |
| `domain` | `domain` | yes | Foundation's | `url` |
| `datetime` | `datetime` | no: `\:` and `\-` outside a class are invalid escapes under `v` | `-` and `:` unescaped outside classes, `[\-+]` inside | none |
| `date` | `date` | yes | Foundation's, with a leading `^` added (Foundation's regex is unanchored and accepts `xx2026-09-26`; a source bug) | none |
| `time` | `time` | yes | Foundation's | none |
| `dateISO` | `dateISO` | yes | Foundation's | none |
| `month_day_year` | `monthDayYear` | no: leading `-` in `[- \/.]` | `[\- \/.]` | none |
| `day_month_year` | `dayMonthYear` | no: same | `[\- \/.]` | none |
| `color` | `color` | yes | Foundation's | none |
| `website` | `website` | n/a: Foundation's is an object with `test()` (domain or url) | one RegExp, `(?:<domain>)\|(?:<url>)` | `url` |

Script result: 9 of the 16 regexes compile under `v` unchanged; the 7 that do not (`integer`, `number`, `email`, `url`, `datetime`, `month_day_year`, `day_month_year`) were rewritten with escape-only changes, and each rewrite matched Foundation's original on every string of a seeded corpus of about 20,000 (Foundation examples, 40 mutations per example, random strings from an alphabet including syntax characters, a surrogate pair, and curly quotes), with 0 mismatches; the `website` union matched Foundation's object on 25,451 strings. Every rewritten source also compiles as an HTML `pattern` attribute body (`^(?:source)$` with `v`). All patterns carry exactly the `v` flag and never `g` or `y`, because Signal Forms' `pattern()` calls `test()` and a global regex keeps `lastIndex`. Because TypeScript rejects regex flags newer than the compile target, the library builds them with `new RegExp(source, 'v')` when its target is below ES2024. Empty values are valid, as in Foundation and Signal Forms' `pattern()`.

The patterns are used through Signal Forms: `pattern(p.zip, nfsPatterns.integer)` yields kind `pattern`, which `formErrorOn="pattern"` targets exactly as `data-form-error-on="pattern"` did. The library binds no native `pattern` attribute (Signal Forms deliberately does not mirror `pattern`, and its docs say not to rely on native validity); a consumer who wants native validation in a form that never hydrates may write `[pattern]="nfsPatterns.card.source"`, which HTML compiles with the `v` flag.

### Implementation level and primitives, with the fallback

Level: custom Angular on Signal Forms (ADR 0006; building-blocks Table A). The platform's Constraint Validation is not what Signal Forms uses, `@angular/aria` has no form-error pattern, and CDK contributes only `_IdGenerator`. Primitives: `FORM_FIELD`, `FieldState` (`invalid`, `touched`, `dirty`, `errors`, `markAsTouched()`), `NgControl` and `AbstractControl.events`, `linkedSignal`, `computed`, one `effect` per Form error linked by reference (the reverse-link registration of building-blocks 1.5; it writes only the field's registry signal and no DOM), host bindings, `HostAttributeToken`, `afterNextRender` (value adoption, `ready`, dev checks), `_IdGenerator`, the native `hidden` attribute, and the form's native `submit` event. Not used: `provideSignalFormsConfig({classes})` (it can add the input class but cannot reach the label, the errors, or ARIA; prototype decision 7), `setCustomValidity()`, a bound `pattern` attribute, and `:user-invalid` in library CSS. `injectAsync` not used: the plugin is its own entry point and a consumer `@defer` splits it; `afterEveryRender` not needed: `afterNextRender`'s one-time run already covers value adoption, `ready`, and the dev checks, and nothing here needs to re-run on every render.

Fallback: the prototype's DOM-lookup route (Abide's `findLabel`/`findFormError` rules resolved in `afterNextRender`, classes toggled with `Renderer2`) is proven and needs only `nfsAbide` and `nfsAbideInput`; it is the fallback if explicit linking fails in a case the prototypes did not cover (the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md) found none). The prototype's `controlValue.set()` is the fallback for event-based value adoption.

### Material comparison

| Concern | Material 22.2 (`MatFormField`, `MatInput`, `MatError`, `ErrorStateMatcher`) | Library |
| --- | --- | --- |
| Shape | `mat-form-field` component renders label, outline, subscript; `matInput` and `mat-error` are directives | Five directives on consumer-written Foundation markup; no component |
| Error policy | Injectable `ErrorStateMatcher`: `invalid && (touched \|\| submitted)`; Signal Forms variant `invalid && touched`; per-input `errorStateMatcher` input | Pure `nfsAbideErrorState` with Abide's three options on the form plus a Defaults token; no per-input override (Foundation has form-level options only) |
| Field state | `inject(FORM_FIELD, {self, optional})` and `inject(NgControl, {self, optional})` | Same injections, `FORM_FIELD` first |
| `aria-describedby` | Consumer ids (`userAriaDescribedBy`) plus hint and error ids pushed by the form field | Consumer ids (same alias) plus the ids of visible Form errors |
| `aria-invalid` | `errorState`, but `null` while empty and required | `true` whenever the error shows (Abide); the policy already hides errors on pristine fields, so Material's redundancy case does not arise; never on radios |
| Live announcement | Subscript container `aria-live="polite"`, `aria-atomic="true"` | `role="alert"` on each Form error (Abide's `a11yAttributes`), because Foundation markup has no persistent container; the Form alert per `a11yErrorLevel` |
| `required` | Derived from validators when not set | Signal Forms mirrors `required`; Reactive consumers write `required` |
| Error ids | `_IdGenerator` | `_IdGenerator`, consumer id wins |
| Hints hidden while errors show | Yes | No: Foundation shows `.help-text` always; both stay described |
| Testing | `MatFormFieldHarness`, `MatErrorHarness`, `MatInputHarness` | DOM-first assertions, no harness |

Borrowed: the self-injection of the field, the `aria-describedby` alias and id collection, an error-state function, `_IdGenerator` ids. Not borrowed: the form-field component, appearance and floating-label inputs, hint hiding, `aria-invalid` null on empty required, the per-input matcher.

### ARIA and keyboard

There is no APG pattern for form validation (the APG research, Abide); the contract is WAI-ARIA's names-and-descriptions practice, the WCAG 2.2 AA criteria below, and ARIA19 (role `alert` for errors).

| Element | ARIA and state | Source |
| --- | --- | --- |
| `form` | `novalidate` (rendered by `FormRoot`, or Angular's automatic `novalidate` under Reactive Forms); a name through the consumer's `aria-labelledby` when the page has several forms | HTML; Signal Forms validation guide |
| Field (`nfsAbideInput`) | Native label; native `required` (Signal Forms mirrors it); `aria-invalid="true"` while the error shows (not on radios); `aria-describedby` = hints plus visible Form errors | WAI-ARIA `aria-invalid` applicability (checkbox, combobox, listbox, radiogroup, slider, spinbutton, textbox); WCAG 3.3.1 |
| Form error (`nfsFormError`) | `id`; `role="alert"` unless the consumer set a role; hidden by Foundation's `display: none` until `.is-visible`, so never in the accessibility tree while hidden | Abide `a11yAttributes`; WCAG 4.1.3; ARIA19 |
| Label (`nfsAbideLabel`) | none (`.is-invalid-label` is visual) | |
| Form alert (`nfsAbideAlert`) | `role="alert"` (`assertive`), `role="status"` (`polite`), or none (`off`); `hidden` until a submit fails | Abide `a11yErrorLevel`; WCAG 4.1.3 |

WCAG 2.2 AA criteria addressed (requirements, each checked in Testing Decisions):

| Criterion | How |
| --- | --- |
| 1.3.5 Identify Input Purpose | Usage examples carry `autocomplete` tokens (`email`, `new-password`, `cc-number`, `cc-csc`) |
| 1.4.1 Use of Color | Every error state has visible text (Form error); dev-mode warning when a field shows an error with no visible Form error |
| 1.4.3 Contrast (Minimum) | Five Foundation settings (Sass subsection): error text and invalid label 5.25:1, invalid placeholder 4.55:1, resting placeholder 4.70:1; the `nfs-abide` mixin checks each pair at compile time with the unrounded ratio from Foundation's `color-luminance()` and the WCAG formula, because axe does not check placeholder text |
| 1.4.11 Non-text Contrast | Resting field border 3.42:1 with `$input-border`; invalid border 5.25:1 against the page, 4.55:1 against its tint; checked at compile time by `nfs-abide` the same way, because axe has no 1.4.11 rule |
| 2.5.8 Target Size | Native checkboxes and radios are user-agent controls (exception) and the examples wrap them in their label, which enlarges the target; the story gate runs axe `target-size` |
| 3.3.1 Error Identification | `aria-invalid` plus visible text referenced by `aria-describedby` |
| 3.3.2 Labels or Instructions | Native labels required in every example; required fields marked in the label text; hints through `aria-describedby` |
| 3.3.3 Error Suggestion | `formErrorOn` picks the message for the failed kind; the docs require messages that say how to fix |
| 3.3.4 Error Prevention (Legal, Financial, Data) | Out of the directives' reach; documented: a review or confirm step is the consumer's, and an invalid form never runs the submission action |
| 3.3.7 Redundant Entry | Entries survive an invalid submit; values typed before hydration are adopted; the `ready` pattern stops a pre-hydration submit from clearing the form; the confirmation field is the Understanding document's security exception |
| 3.3.8 Accessible Authentication (Minimum) | The library never blocks paste or autofill; `nfsEqualTo` compares values only |
| 4.1.3 Status Messages | `role="alert"` on Form errors and the Form alert |

Keyboard (all native; the library adds one listener):

| Key | Where | Result |
| --- | --- | --- |
| Tab, Shift+Tab | fields | Native focus; leaving a field marks it touched (Signal Forms), which shows its error under `validateOnBlur`; a committed edit fires `change`, which shows it under `fieldChange` |
| Enter | text-like `input` | The directive touches the field (flushing a blur-debounced value), then the browser's implicit submission fires `submit`; blocked natively while the default submit button is disabled |
| Enter | `textarea` | Newline; no flush |
| Space | checkbox | Toggles; `change` shows the error under `fieldChange` |
| Arrow keys | radio group | Native selection; `change` as above |
| Enter, Space | submit button | Native submission |

Focus: the library never moves focus. After a failed submit, the documented recipe focuses the first invalid field from Signal Forms' `onInvalid` callback with `errorSummary()[0]?.fieldTree().focusBoundControl()` (the Signal Forms field state guide's own example).

### Rendered HTML

Consumer markup (Signal Forms, wrapping label for email, `label[for]` for the password pair):

```html
<form [formRoot]="f" nfsAbide #abide="nfsAbide" aria-labelledby="signup-h">
  <h2 id="signup-h">Sign up</h2>
  <div nfsAbideAlert class="alert callout">
    <p>There are some errors in your form.</p>
  </div>

  <label nfsAbideLabel>
    Email (required)
    <input type="email" autocomplete="email" nfsAbideInput #email="nfsAbideInput" [formField]="f.email" aria-describedby="email-hint" />
  </label>
  <span [nfsFormError]="email" formErrorOn="required">Enter your email address.</span>
  <span [nfsFormError]="email" formErrorOn="email">Enter a complete email address, with an @ and a domain.</span>
  <p class="help-text" id="email-hint">We never share it.</p>

  <div>
    <label for="pw" [nfsAbideLabel]="pw">Password (required)</label>
    <input id="pw" type="password" autocomplete="new-password" nfsAbideInput #pw="nfsAbideInput" [formField]="f.password" />
    <span [nfsFormError]="pw">Choose a password.</span>
  </div>
  <div>
    <label for="pw2" [nfsAbideLabel]="pw2">Repeat password (required)</label>
    <input id="pw2" type="password" autocomplete="new-password" nfsAbideInput #pw2="nfsAbideInput" [formField]="f.confirm" />
    <span [nfsFormError]="pw2" formErrorOn="required">Repeat the password.</span>
    <span [nfsFormError]="pw2" formErrorOn="equalTo">The passwords do not match.</span>
  </div>

  <button nfsButton type="submit" class="success" [disabled]="!abide.ready()">Sign up</button>
</form>
```

Server HTML (pristine; SSR and prerendering; ids shown generated):

```html
<form nfsabide="" aria-labelledby="signup-h" novalidate="" jsaction="submit:;">
  <h2 id="signup-h">Sign up</h2>
  <div nfsabidealert="" class="alert callout" role="alert" hidden="">...</div>
  <label nfsabidelabel="">
    Email (required)
    <input type="email" autocomplete="email" nfsabideinput="" name="ng.form0.email" required=""
           aria-describedby="email-hint" jsaction="change:;input:;blur:;">
  </label>
  <span formerroron="required" class="form-error" id="nfs-form-error-a1b0" role="alert">Enter your email address.</span>
  <span formerroron="email" class="form-error" id="nfs-form-error-a1b1" role="alert">Enter a complete email address, with an @ and a domain.</span>
  ...
  <button type="submit" class="success button" disabled="">Sign up</button>
</form>
```

No `.is-invalid-*`, `.is-visible`, or `aria-invalid` exists in server HTML (validation runs only on interaction); the alert carries `hidden`; the submit control is disabled because `ready()` is `false` on the server. Field `name` values come from Signal Forms' process-wide counter unless the form is created with `form(model, schema, {name: 'signup'})`, which the docs recommend for any form whose server handles a native POST.

Hydrated, after the user left the email empty with a committed change and submitted:

```html
<div nfsabidealert="" class="alert callout" role="alert">...</div>
<label nfsabidelabel="" class="is-invalid-label">
  Email (required)
  <input type="email" ... class="is-invalid-input" aria-invalid="true"
         aria-describedby="email-hint nfs-form-error-b7c0">
</label>
<span ... class="form-error is-visible" id="nfs-form-error-b7c0" role="alert">Enter your email address.</span>
<span ... class="form-error" id="nfs-form-error-b7c1" role="alert">Enter a complete email address, with an @ and a domain.</span>
<button type="submit" class="success button">Sign up</button>
```

Hydration rewrites the generated ids (client ids differ, building-blocks 1.5) and removes `disabled` in the pass after `ready` turns `true`. Before the user interacts, the hydrated DOM equals the server DOM apart from ids and the enabled submit control.

### Animation

None. Foundation shows and hides `.form-error` with `display` and the Form alert with `hidden`; there is no transition to await, no Completion output, no Motion class, and no `animate.enter`/`animate.leave`. Reduced motion needs nothing. Foundation's `.is-invalid-input:not(:focus)` rule suppresses the error tint while the field has focus; that is Foundation CSS and is kept.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 (the Abide checklist row: no error state on the server, native constraint attributes rendered, form and fields in one boundary, handlers never relying on `preventDefault()` during replay):

- Server output and first paint: the pristine form. Every first-paint state is a host binding: the alert's `hidden` and role, each Form error's `.form-error`, `id`, and `role`, each field's consumer `aria-describedby`, and the consumer's `[disabled]="!abide.ready()"`. Signal Forms renders `name`, `required`, `min`, `max`, `minlength`, `maxlength`, and `FormRoot` renders `novalidate`.
- Before hydration: the directives touch no DOM outside host bindings. Reading the host's `value` at construction is the only DOM read before the first render callback; it writes nothing. `ready`, the value adoption, and the dev-mode checks run in `afterNextRender`.
- Values typed or checked before hydration: hydration's first forms pass writes the model into the reused nodes and would clear them (prototype result), in Signal Forms and Reactive Forms alike. `nfsAbideInput` adopts them (API section), before replay, so the replayed `input`, `change`, and `blur` then see the user's value.
- Submit before hydration: a dehydrated form submits natively (a GET to the same URL with every named field in the query string, passwords included; nothing replays because the page navigates away). The spec's default is that server-rendered forms keep their submit control natively disabled until `ready()`: the server renders `disabled`, the browser then performs neither a click submission nor Enter's implicit submission (HTML blocks implicit submission while the default button is disabled), and the control enables in the first client pass. Native `disabled` is required, not `nfsButton`'s `disabledInteractive`, because a `type="button"` swap leaves a one-field form with no default button, which submits implicitly (ADR 0011). A consumer whose server handles native submissions (progressive enhancement) uses `method="post"` instead and does not bind `ready`. Whether a form uses one or the other is the consumer's choice; the library makes the first one a single binding.
- Event replay: `(change)` on fields and `(submit)` on the form are host listeners, annotated with `jsaction` and replayed; neither calls `preventDefault()`. Signal Forms' own `input` and `blur` listeners replay into field state (prototype result). `(keydown.enter)` is registered by the key-events plugin and not annotated; before hydration Enter is blocked by the disabled submit control, so nothing is lost. `FormRoot` calls `preventDefault()` first in its submit handler, which would throw during replay, but a pre-hydration submit is either blocked (default) or has already navigated, so no submit is ever replayed.
- Hydration boundary: the form and all its fields, labels, Form errors, and alert share one boundary, because registration happens at construction (or, for a Form error linked by reference, in its `effect` during the first change-detection pass); a consumer `@defer` wraps the whole form, never part of it.
- Incremental hydration: `@defer (hydrate on interaction)` around a form hydrates on the first `click` or `keydown` inside it; the keystroke that hydrates it replays, and value adoption keeps the characters typed. `hydrate on viewport` or `idle` suits long pages. Limit, distinct from the pre-hydration rescue: typing on through the keystroke that hydrates a `hydrate on interaction` block can drop one character in some engines; the likely cause is that the first write races the value rescue while the block's code is still loading (the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md) measured it with scripted typing in 2 of 3 runs in Chromium, 3 of 3 in WebKit, and 0 of 3 in Firefox; the `ready` gate held in every run). For a block that holds text-entry fields, use `hydrate on viewport`, `on idle`, or `on immediate` rather than `hydrate on interaction`, as the Responsive Accordion Tabs spec recommends for its own pre-hydration loss.
- `hydrate never`: the form is its server HTML. Signal Forms never runs, so the model never receives values; with the `ready` pattern the submit control stays disabled. Abide forms therefore do not go in `hydrate never`; a consumer who wants a JavaScript-free form writes a plain `method="post"` form without these directives (the native `required`, `min`, `max`, `minlength`, `maxlength`, and a `pattern` from `nfsPatterns.<name>.source` then validate natively).
- `@defer` (client): library templates contain none; the directives work inside any deferred block that contains the whole form.
- Prerendering: identical to SSR; nothing reads request tokens (rule 11).
- Zoneless and OnPush: every state change is a signal write from a host listener, a forms signal, or `control.events`; no `markForCheck`, no timers.

### Sass and custom CSS

No library CSS: Foundation's `foundation-form-error` (inside `foundation-forms`) already styles `.is-invalid-input`, `.is-invalid-label`, and `.form-error.is-visible`, and `foundation-callout` styles the alert. The required consumer settings that make the invalid state pass WCAG 2.2 AA are in the Sass subsection under Further Notes. The `nfs-abide` Library mixin emits no CSS: it holds only the compile-time contrast checks that ADR 0022 and building-blocks 1.10 require where axe has no rule (placeholder text, borders), so a consumer on a failing setting gets an `@error` or `@warn` in their own compile, not only a failing story in the library's CI.

## Testing Decisions

A good test asserts what a user or assistive technology observes: classes, `aria-invalid`, the accessible description, visibility of messages and the alert, whether a submit happened, and computed contrast. No test reads directive fields. Prior art: the prototype's Playwright suite (45 cases in three engines, including the WCAG 2.2 AA audit), the Button spec's layer tables, and the rendering-mode test seam.

Story ids: `abide--default`, `abide--live-validate`, `abide--validate-on-blur`, `abide--manual`, `abide--label-for`, `abide--error-kinds`, `abide--checkbox`, `abide--patterns`, `abide--submit`, `abide--reset`, `abide--polite-alert`, `abide--reactive-forms`, `abide--invalid-state-contrast`. The Storybook preview's Sass settings file carries the five settings from the Sass subsection, each with its rule id or criterion in a comment.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` on the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`); no story silences a rule.

- `abide--default`: tab through an empty required field: no error; type without leaving: no error; commit (Tab): `.is-invalid-input`, `aria-invalid="true"`, `.is-invalid-label`, the `required` message visible and in the accessible description, the hint id first; fix and commit: all cleared and the description is the hint again.
- `abide--live-validate`: the error appears on the first keystroke that makes the value invalid and clears on the keystroke that fixes it.
- `abide--validate-on-blur`: focus and leave an empty required field with no change: the error shows.
- `abide--manual`: commits and blurs show nothing; submit shows every error.
- `abide--label-for`: `[nfsAbideLabel]="ref"` and `[nfsFormError]="ref"` link a sibling label and an error placed elsewhere in the form (Foundation's input-group layout).
- `abide--error-kinds`: an invalid email shows only the `email` message; an empty one only the `required` message; `nfsEqualTo`: a mismatch shows the `equalTo` message, and fixing the password clears it without touching the confirmation.
- `abide--checkbox`: clicking a required checkbox twice (checked, unchecked) shows its error at the second `change` with no blur.
- `abide--patterns`: one field per `nfsPatterns` key with a known-good and a known-bad value (the Node corpus's seeds); each shows its `pattern` message only for the bad value.
- `abide--submit`: submitting an invalid form shows every field's error and the alert (`role="alert"`, not `hidden`); fixing all fields hides the alert without a new submit; a valid submit runs the story's action spy once.
- `abide--reset`: after a failed submit, the story's reset button calls `form().reset(initial)`: every error, the alert, and `submitted` clear; typing again does not show errors before the next commit.
- `abide--polite-alert`: `a11yErrorLevel="polite"` renders `role="status"` on the alert.
- `abide--reactive-forms`: the same markup on `FormGroup`/`formControlName` with `updateOn: 'blur'` gives the same classes, ARIA, and alert.
- `abide--invalid-state-contrast`: submits a form with four fields in error and asserts from computed styles (axe checks neither placeholders nor borders), floored to two decimals: Form error text and invalid label at least 4.5:1, invalid placeholder on the invalid tint at least 4.5:1, resting placeholder at least 4.5:1, resting border at least 3:1 against the page, invalid border at least 3:1 against the page and the tint; plus `role="alert"` on every visible Form error (4.1.3) and `toHaveAccessibleDescription` per field (3.3.1).
- `abide--default`, `abide--submit`, `abide--checkbox`, and `abide--reactive-forms` assert that no visible Form error of a native control is a descendant of its `label`; `abide--checkbox` and `abide--reactive-forms` use the after-label markup.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Linking: bare `nfsFormError` inside `nfsAbideLabel` resolves the nested field; references resolve across the template; an unresolved label or error warns once in dev mode; a field in error with no visible Form error warns once; the in-label development warning fires once for a native control's Form error inside its label, and not for a custom `FormValueControl` or an after-label error.
- Control kinds (the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md) cases, under Signal Forms and Reactive Forms): a custom `FormValueControl` test component that applies `NfsAbideInput` through `hostDirectives`, inside a wrapping `nfsAbideLabel` with a bare `nfsFormError`, gets `.is-invalid-label` on the label, the error in its `aria-describedby`, and `.is-visible` on the error after an invalid submit, with no template reference in the fixture; a radio group's single Form error linked to one radio, and a checkbox group's single Form error linked to one box under a shared minimum-count rule, show after an invalid submit and hide once the group is valid; `select` and `textarea` hosts get the same classes and ARIA as text inputs.
- `aria-describedby` composition: static and bound consumer ids first, visible error ids after, hidden ones never, `null` when empty; a consumer `id` on a Form error is used as written.
- `aria-invalid` is never rendered on `input[type=radio]`, and is rendered on text, checkbox, and `select` hosts.
- `role` on Form errors and the alert: a static consumer role wins; `a11yErrorLevel` values `assertive`, `polite`, `off`.
- Policy inputs: `validateOn` transform (`'fieldChange'` kept, any other string and `null` become manual); Defaults token values reach `NfsAbide` and a form-less `NfsAbideInput`; the nearest provider wins.
- `changed` resets when `dirty` falls (Signal Forms `reset()`), and `submitted` resets when every registered field is untouched again (Signal Forms `reset()` and Reactive `reset()`).
- Enter flush: a field with `debounce(path, 'blur')` holding a typed value is valid and submitted after a `keydown.enter` followed by `requestSubmit()`, regardless of the order in which `FormRoot` and the Abide directives are imported; a `textarea` Enter does not touch the field.
- `NgControl` courtesy: state follows `control.events` for `formControlName`, `formControl`, and `ngModel`; on a `[formField]` host the `FORM_FIELD` path is used, never the interop `NgControl`.
- Replay-safe handlers: a `change` on a field and a `submit` on the form dispatched with `eventPhase` 101 and a throwing `preventDefault` change state and reach no `ErrorHandler`.
- `ready` is `false` in the first render and `true` after `whenStable()`; a bound submit control is `disabled` in the first render only.

### 3. Node-level Vitest

- Pure logic: `nfsAbideErrorState` as a full truth table over `invalid`, `touched`, `dirty`, `changed`, `submitted`, and the three policy options; `nfsPatterns` table-driven: each key carries exactly the `v` flag and no `g` or `y`, each Foundation example is accepted or rejected as Foundation does, `date` rejects an unanchored prefix, and each key agrees with Foundation 6.9.0's original regex (and `website` with Foundation's `test()` object) on the seeded corpus from the ticket's Node script; each source compiles as `^(?:source)$` with `v`; the value-adoption decision (saved value, current value, host type) as a small pure function.
- SSR smoke, runs under `npx nx test <lib>` in its `<name>.ssr.spec.ts` file through the shared `renderServer()` helper (`npx nx test-node <lib>` only if the server path depends on the DOM adapter): the Rendered HTML fixture resolves `whenStable()`; the server HTML has no `is-invalid-*`, `is-visible`, or `aria-invalid`; the alert has `hidden` and `role="alert"`; each Form error has `.form-error`, an `id`, and `role="alert"`; each field's `aria-describedby` holds only consumer ids; the submit control has `disabled`; the form has `novalidate` and `jsaction` containing `submit:`; each field's `jsaction` contains `change:`.

- Sass compile (the Sass packaging decision's node-level check): Foundation's default settings plus `@include nfs-abide;` stop with the `@error` naming `$input-error-color`, `$form-label-color-invalid`, and `$input-background-invalid`, and warn for `$input-placeholder-color` and `$input-border`; with the five required values the compile emits no CSS, no `@error`, and no `@warn`; a pair at 4.498:1 fails although Foundation's rounding `color-contrast()` would report 4.5.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, Chromium, Firefox, and WebKit with real input:

- `abide--default`: real Tab and typing give the commit timing in all three engines; a real Enter in a blur-debounced email field submits the typed value.
- `abide--checkbox`: a real click shows the error in WebKit, which does not focus a clicked checkbox.
- `abide--invalid-state-contrast`: the computed-style contrast checks repeated in Firefox and WebKit.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype), route `/abide`:

- JavaScript disabled: screenshot and axe (six tags) of the pristine form; the submit control is disabled and a click or Enter does not navigate.
- Hydration: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`.
- Pre-hydration typing with the main bundle held back: type into the email, password, and confirmation fields, check the checkbox, commit one field with Tab; release the bundle: every value and the checkbox survive, the committed invalid field shows its error after replay, the others do not, and the submit control becomes enabled.
- Pre-hydration submit: with the bundle held back, click the submit control and press Enter in a field: the URL is unchanged, it has no query string, and no navigation happened.
- `@defer (hydrate on interaction)` route variant: the first keystroke in a field hydrates the block, the character is kept, and later validation works. Typing a whole value on through the hydrating keystroke is the documented limit under Rendering modes and is not asserted, because the dropped character depends on the engine and did not occur in every run.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA and JAWS on Chrome and Firefox and VoiceOver on macOS and iOS, on `abide--submit`, `abide--validate-on-blur`, and `abide--checkbox`: a failed submit announces the Form alert and each Form error once, in DOM order, without an error cutting off the one before it (with NVDA on Chrome, each error once although Chromium reports it both as an alert and as a live-region insertion); leaving an empty required field announces its error and the next field, the error interrupting the field's announcement and the field then resuming; focusing an invalid field announces its label, invalid state, and error once, with no error text in the name (Firefox included); on VoiceOver, the error is read as the field's description.

## Out of Scope

- A form-field component (Material's `mat-form-field` shape), floating labels, and prefix or suffix slots.
- A validation engine of the library's own, `setCustomValidity()`, and native constraint validation as a mode (ADR 0006).
- Template-driven forms beyond what the `NgControl` courtesy gives for free (not separately designed).
- Radio groups, checkbox groups with a minimum count, `select`, `textarea`, and custom `FormValueControl` controls beyond what the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md) covered and this spec states.
- Async validation display (`pending`): errors appear when validators settle; no busy state is rendered.
- Moving focus on submit (a documented recipe instead).
- Server-side handling of native POST submissions (the consumer's server).
- Runtime theming of error colours (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Signal Forms owns validity; the directives only map state to Foundation's contract | ADR 0006; one source of truth | Porting Abide's engine |
| D2 | Five directives, label and Form error and alert explicit (ADR 0026) | Host bindings for every class and ARIA value (building-blocks 1.5); the alert's `hidden` is first-paint state and must be a server-rendered binding (1.11 decision 1); no flat-markup trap; typed links; `a11yAttributes` rendered on the server | The prototype's DOM lookup (proven, two directives, but consumer-written `hidden`, client-only roles, `Renderer2` writes on foreign elements, and Abide's sibling trap); it stays the fallback |
| D3 | Links by enclosing label (DI) or typed template reference | A wrapping label links its field with no reference; a native control's Form error goes after the label with a reference, because inside the label Firefox makes it part of the field's name and Chromium fires no alert event for it ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)); everything else is compile-checked (ADR 0013 shape); a custom `FormValueControl` links only through its wrapping label, because a typed reference to a directive applied through `hostDirectives` crashes the compiler | `data-form-error-for` id strings; a field-group container directive |
| D4 | One pure Error-state policy with a `changed` signal from native `change` | Prototype: `dirty && touched` misfires; Material's matcher shape; testable as a truth table | Per-input booleans; `dirty && touched` |
| D5 | Policy options on the form plus `nfsAbideDefaultsToken`; no per-input matcher | Foundation's options are form-level; building-blocks 1.4 defaults tokens | Material's `errorStateMatcher` input |
| D6 | `aria-invalid="true"` whenever the error shows; never on radios | Abide's contract; the policy already avoids the pristine case Material guards; WAI-ARIA applicability | Material's `null` while empty and required |
| D7 | `role="alert"` on Form errors, alert role from `a11yErrorLevel` | 4.1.3 and ARIA19; Abide's `a11yAttributes` default; Foundation markup has no persistent live container | Material's polite subscript container (needs a wrapper element Foundation lacks); screen-reader behaviour decided from the platform events and NVDA's source, confirmed by the release test |
| D8 | `(keydown.enter)` flush on `input` hosts | Prototype: `submit()` flushes only the root; a form-level flush depends on import order | Flush in the form's `(submit)` listener |
| D9 | Adopt values typed before hydration | 3.3.7; public API only; no-op in client rendering; consistent with Slider's adoption of a pre-hydration value | Documenting the loss |
| D10 | Submit disabled until `ready()` as the documented default for server-rendered forms (ADR 0027) | Stops the GET leak (passwords in URLs, CWE-598) and the 3.3.7 loss; natively enforced before hydration; the lost no-JS submission posts nowhere useful in a Signal Forms app | Library-bound `method="post"` (changes consumer semantics, fails on static hosts); accepting and documenting the leak; `disabledInteractive` (one-field implicit submission) |
| D11 | `nfsPatterns` with the `v` flag, camelCase keys, `date` anchored, `website` one RegExp | Node script: 7 of 16 rewritten with escape-only changes and 0 mismatches; building-blocks 1.4 camelCase; source bug fixed; `pattern()` takes a RegExp | Foundation's snake_case keys; porting without `v`; keeping the unanchored `date` |
| D12 | `nfsEqualTo()` helper; `data-validator` and `data-min-required` as `validate()` recipes | ADR 0006 names `equalTo`; a custom validator is already one Signal Forms call | A validator registry mirroring `Abide.defaults.validators` |
| D13 | No `pattern` attribute, no `setCustomValidity`, no `:user-invalid` rule | Signal Forms does not mirror `pattern` and says not to rely on native validity; `FormRoot` renders `novalidate` | Binding `pattern` from `FieldState.pattern()` (building-blocks Table B's first sketch) |
| D14 | `inputmode` documented per pattern, not bound | The directive cannot know which pattern a consumer means without matching RegExp identity; `inputmode` is markup like `type` | Binding `inputmode` from the field's patterns |
| D15 | No library CSS; five consumer Sass settings for WCAG 2.2 AA, checked at compile time by a checks-only `nfs-abide` mixin (added by the [Consistency review and bundle index](../issues/36-consistency-review.md)) | Foundation styles every class; axe checks neither placeholder text nor borders, so ADR 0022 and building-blocks 1.10 put a compile-time check in the Library mixin; the story gate enforces the settings in the library's own CI | A library colour override (would copy Foundation values); the settings enforced only by the play function (a consumer on Foundation's defaults would get no signal, against ADR 0022) |
| D16 | Form alert hides live when the form becomes valid | Field state is live; Abide re-checks only on submit | Waiting for the next submit |
| D17 | No outputs and no public methods | building-blocks 1.4; field state signals and `onInvalid` cover Abide's events | `valid`/`invalid`/`formValid` outputs |

### Usage examples

Signal Forms (primary):

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { debounce, email, form, FormField, FormRoot, pattern, required, submit } from '@angular/forms/signals';
import { NfsAbide, NfsAbideAlert, NfsAbideInput, NfsAbideLabel, NfsFormError, nfsEqualTo, nfsPatterns } from 'ngx-foundation-sites/abide';
import { NfsButton } from 'ngx-foundation-sites/button';

@Component({
  selector: 'app-signup',
  imports: [FormField, FormRoot, NfsAbide, NfsAbideAlert, NfsAbideInput, NfsAbideLabel, NfsFormError, NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- the Rendered HTML consumer markup, plus: -->
    <div>
      <label for="zip" [nfsAbideLabel]="zip">Postal code (4 digits, optional)</label>
      <input id="zip" type="text" inputmode="numeric" autocomplete="postal-code"
             nfsAbideInput #zip="nfsAbideInput" [formField]="f.zip" />
      <span [nfsFormError]="zip" formErrorOn="pattern">Use four digits, for example 2100.</span>
    </div>
    <label nfsAbideLabel>
      <input type="checkbox" nfsAbideInput #terms="nfsAbideInput" [formField]="f.terms" />
      I accept the terms (required)
    </label>
    <span [nfsFormError]="terms">Accept the terms to continue.</span>`,
})
export class Signup {
  protected readonly model = signal({ email: '', password: '', confirm: '', zip: '', terms: false });
  protected readonly f = form(
    this.model,
    (p) => {
      required(p.email);
      email(p.email);
      required(p.password);
      required(p.confirm);
      nfsEqualTo(p.confirm, p.password);
      pattern(p.zip, /^\d{4}$/v);
      required(p.terms);
      // Abide's fieldChange timing: commit text values on blur (omit when liveValidate is on)
      debounce(p.email, 'blur');
      debounce(p.password, 'blur');
      debounce(p.confirm, 'blur');
      debounce(p.zip, 'blur');
    },
    {
      name: 'signup',
      submission: {
        action: async (f) => {
          // send f().value()
        },
        onInvalid: (f) => f().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );
}
```

`nfsPatterns` in a schema, and Abide's `data-validator` as a rule whose kind the markup targets:

```ts
pattern(p.card, nfsPatterns.card);           // <input inputmode="numeric" autocomplete="cc-number">
pattern(p.cvv, nfsPatterns.cvv);             // <input inputmode="numeric" autocomplete="cc-csc">
validate(p.username, ({ value }) =>
  value().startsWith('admin') ? { kind: 'reserved' } : null);  // <span [nfsFormError]="user" formErrorOn="reserved">
// data-min-required="2" on a group of booleans: one rule per checkbox, so each is invalid together
for (const box of [p.topics.news, p.topics.offers, p.topics.events]) {
  validate(box, ({ valueOf }) =>
    Object.values(valueOf(p.topics)).filter(Boolean).length >= 2 ? null : { kind: 'minRequired' });
}
```

Application defaults:

```ts
providers: [{ provide: nfsAbideDefaultsToken, useValue: { validateOnBlur: true } }]
```

Reactive Forms (courtesy):

```ts
@Component({
  imports: [ReactiveFormsModule, NfsAbide, NfsAbideAlert, NfsAbideInput, NfsAbideLabel, NfsFormError],
  template: `
    <form [formGroup]="group" (ngSubmit)="save()" nfsAbide>
      <div nfsAbideAlert class="alert callout"><p>There are some errors in your form.</p></div>
      <label nfsAbideLabel>
        Email (required)
        <input type="email" autocomplete="email" required formControlName="email" nfsAbideInput #email="nfsAbideInput" />
      </label>
      <span [nfsFormError]="email" formErrorOn="required">Enter your email address.</span>
      <span [nfsFormError]="email" formErrorOn="email">Enter a complete email address, with an @ and a domain.</span>
      <button nfsButton type="submit">Save</button>
    </form>`,
})
export class Profile {
  protected readonly group = new FormGroup(
    { email: new FormControl('', [Validators.required, Validators.email]) },
    { updateOn: 'blur' },
  );
}
```

Angular's `Validators.email` error key is `email`; Reactive error keys are the kinds. Reactive consumers write `required` themselves (Signal Forms mirrors it).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-forms` (which includes `foundation-form-error`, the rules for `.is-invalid-input`, `.is-invalid-label`, and `.form-error.is-visible`) and `foundation-callout` (the Form alert's `.callout.alert`). No library CSS: the `nfs-abide` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-forms`, emits no rule and holds only compile-time contrast checks.

1. Rules the library emits: none. Checks: each ratio is computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded, never with Foundation's `color-contrast()`, which rounds to one decimal (building-blocks 1.10). `@error` for the pairs that show the invalid state: `$input-error-color` and `$form-label-color-invalid` against `$body-background` (4.5:1), and `$input-background-invalid` both against the invalid tint Foundation's `form-input-error` mixin paints, `mix($input-background-invalid, $white, 10%)` at that mixin's default (4.5:1, the placeholder text), and against `$body-background` (3:1, the invalid border). `@warn` for the resting pairs, which carry no state: `$input-placeholder-color` against `$input-background` (4.5:1) and the colour in the `$input-border` shorthand against `$body-background` (3:1). Each message names the setting to change. Reason: axe checks neither placeholder text nor borders, so without these checks a consumer on Foundation's defaults gets no signal (ADR 0022).
2. Foundation settings the consumer must set for WCAG 2.2 AA (declared before `@import 'foundation'`; Foundation's settings are `!default`). Measured by the prototype in three engines against Foundation's default `$body-background` and `$input-background` (`#fefefe`); the story preview's settings file carries the same five lines:

| Setting | Foundation default (measured) | Required value | After | Criterion |
| --- | --- | --- | --- | --- |
| `$input-error-color` | `get-color(alert)`, `#cc4b37`: 4.49:1 on `#fefefe` (axe `color-contrast`) | `#bf3f2c` | 5.25:1 | 1.4.3 |
| `$form-label-color-invalid` | `get-color(alert)`: 4.49:1 | `#bf3f2c` | 5.25:1 | 1.4.3 |
| `$input-background-invalid` | `#cc4b37`, which is also the invalid placeholder colour, on its own 10% tint `#f9ecea`: 3.93:1 | `#bf3f2c` | 4.55:1 placeholder on the tint; border 5.25:1 against the page, 4.55:1 against the tint | 1.4.3, 1.4.11 |
| `$input-placeholder-color` | `$medium-gray`, `#cacaca`: 1.63:1 | `#737373` | 4.70:1 | 1.4.3 |
| `$input-border` | `1px solid $medium-gray`: 1.63:1 against the page (the input background equals the page, so the border is the field's only boundary) | `1px solid $dark-gray` (`#8a8a8a`) | 3.42:1 | 1.4.11 |

A consumer with a different palette or background picks any colour with 4.5:1 on its `$body-background` and on its own 10% tint for the first three, 4.5:1 for the placeholder, and 3:1 for the border. The Form alert (`.callout.alert`, `$callout-font-color` on the faded alert colour) measures 16.2:1 and needs nothing. After the border change the focus border (`$input-border-focus`, also `$dark-gray`) equals the resting one; focus stays visible through the caret and Foundation's `$input-shadow-focus`, which WCAG 1.4.11's Understanding document accepts.

3. Custom properties written by the directives: none.
4. Motion classes: none; no transition or animation is added or awaited.
5. What breaks when the include is missing: nothing visible, because the mixin emits no CSS; the compile-time checks do not run, so a failing setting is caught only where axe or a play function sees it. Missing settings fail the `abide--invalid-state-contrast` story and axe `color-contrast` in every story that shows an error.

### Platform features to adopt when the browser target moves

- `:has()` (out of target): `.form-group:has(:user-invalid)`-style parent styling could replace `.is-invalid-label` for consumers who want CSS-only label state; the directive would still own the ARIA.
- `aria-errormessage`: kept out while assistive technology support trails `aria-describedby`; it would carry only the visible error, with `aria-invalid="true"`, if support becomes reliable.
- Signal Forms mirroring `pattern` or exposing a submitted state, or a public hydration-status signal in Angular, would let the library drop its `submitted` tracking or `ready`.
- `field-sizing` and similar form features have no bearing on this plugin.

### Foundation behaviour dropped or changed

- Programmatic `$element.submit()` after intercepting the submit button's click and keydown (and its documented caveat about a control named `submit`): the form submits natively and `FormRoot` handles it.
- `:visible` checks before attaching `aria-describedby`, and attaching it only when the input had none: the description always lists consumer ids and exactly the visible errors.
- jQuery pseudo-selectors, the deep `$.extend(true)` merge of `patterns` and `validators`, and validators receiving jQuery wrappers: replaced by exported RegExps and schema functions.
- `equalTo` looked up document-wide by id: now a schema path.
- Inline `display` toggling of `[data-abide-error]`: now the `hidden` attribute, rendered on the server.
- `data-invalid` on invalid inputs: dropped; `aria-invalid="true"` is the attribute hook.
- `for` added to `label.form-error` elements: dropped; a consumer who uses a `label` as a Form error writes `for`.
- The `formnovalidate` capture on the preceding click: `FormRoot` does not support it (Foundation contract table).
- Checkbox groups with `data-min-required` above 1 not validated before the first submit: dropped; the group's error follows the policy like any field.
- The alert staying visible until the next submit: it now hides as soon as the form is valid (D16).
- `aria-live` on the global error element from `a11yErrorLevel` (Foundation wrote `aria-live="assertive"`, `"polite"`, or `"off"` when the element had none): the Form alert gets a role instead, `role="alert"`, `role="status"`, or none, which carry the same live-region politeness (D7; added 2026-09-26, audit 0005 L7).
- The implicit pattern from the `type` attribute: dropped (Foundation contract table).
- `.form-error` inside the label, as Foundation's docs write it: for a native control the Form error goes after the label with `[nfsFormError]="ref"`, and the in-label form warns in development mode. This gives up user story 14's reference-free errors for native controls, a migration step for every docs-shaped form.
