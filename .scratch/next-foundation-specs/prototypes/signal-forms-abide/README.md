# Prototype: Signal Forms on Abide markup

Ticket: [Prototype: Signal Forms on Abide markup](../../issues/49-prototype-signal-forms-abide.md) (ADR 0006).

## Question

Can a directive that injects the Signal Forms field (`inject(FORM_FIELD, {self: true, optional: true})`) drive Foundation's error contract (`.is-invalid-input`, `.is-invalid-label`, `.form-error.is-visible`, `aria-invalid`, `aria-describedby`, the `[data-abide-error]` alert) under Abide's validate-on policy (`validateOn: 'fieldChange'`, `liveValidate`, `validateOnBlur`), with `equalTo` as a cross-field schema rule, `NgControl` as a courtesy for Reactive Forms, and a server-rendered run with event replay?

## What is here

The decisive files of a plain Angular CLI 22.2.0 application created with `npx @angular/cli@22.2.0 new app --ssr --zoneless --style=scss` plus `foundation-sites@6.9.0`. The runnable workspace (with `node_modules`, the build, and test results) stays at `D:/tmp/nfs-proto-signal-forms-abide/app`.

- `src/app/abide/abide.ts` -- the two directives and the policy. `form[nfsAbide]` (inputs `validateOn`, `liveValidate`, `validateOnBlur`; `nfsAbideToken`; a `submitted` signal set by a `(submit)` host listener that never calls `preventDefault()`; drives `[data-abide-error]` through the native `hidden` attribute). `[nfsAbideInput]` (self-injects `FORM_FIELD`, else `NgControl`; host-binds `.is-invalid-input`, `aria-invalid`, `aria-describedby`; finds the label and errors the way Abide's `findLabel`/`findFormError` do and toggles `.is-invalid-label` and `.is-visible` on them in `afterRenderEffect`). `nfsAbideErrorState()` is the pure policy function (Material `ErrorStateMatcher` shape). `nfsEqualTo()` is Abide's `equalTo` as a `validate()` rule. Two throwaway knobs (`flushOnSubmit`, `restorePreHydrationValue`) exist only to reproduce the failures the fixes address.
- `src/app/signal-abide-form.ts` -- Foundation's Abide docs markup on a Signal Forms model: wrapping label, `label[for]`, `data-form-error-on` per error kind, `data-form-error-for`, a checkbox, `[formRoot]` submission; `debounce(path, 'blur')` on text paths unless `liveValidate` (through `applyWhen`).
- `src/app/reactive-abide-form.ts` -- the same directives under Reactive Forms (`updateOn: 'blur'`).
- `src/app/app.ts` -- four Signal Forms instances (default policy, `liveValidate`, `validateOnBlur`, default with the prototype fixes off) and the Reactive fixture.
- `src/app/skill-check.ts` -- compile-only checks of the angular-developer skill's Signal Forms claims against 22.2.0.
- `src/styles.scss` -- Foundation's Sass only (`foundation-global-styles`, `-typography`, `-forms`, `-button`, `-callout`). Five Foundation settings are declared before the import to reach WCAG 2.2 AA contrast: `$input-error-color`, `$form-label-color-invalid`, `$input-background-invalid` (all `#bf3f2c`), `$input-placeholder-color: #737373`, `$input-border: 1px solid #8a8a8a`. **No custom CSS was added.**
- `e2e/abide.spec.ts`, `e2e/ssr.spec.ts`, `playwright.config.ts` -- the tests (Chromium, Firefox, WebKit).
- `src/app/app.routes.server.ts` -- `RenderMode.Server` for every route; `package.json` -- the exact dependency set.

## How to run

Versions: `@angular/*` 22.2.0, `@angular/cli` 22.2.0, TypeScript 6.0.3, `foundation-sites` 6.9.0, `@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0, Node 24.18.0, npm 11.16.0. The generator added `vitest ^5.0.0`; it was pinned back to 4.1.11 (the map's 4.1.x) and is unused. In `angular.json`: `security.allowedHosts` `["localhost", "127.0.0.1"]`, Sass deprecation silencing for Foundation's `@import` code, budgets removed.

```
cd D:/tmp/nfs-proto-signal-forms-abide/app
npx ng build
PORT=4491 node dist/app/server/server.mjs      # restart after every build
npx playwright test                            # other shell; chromium, firefox, webkit
npx tsc --noEmit -p tsconfig.app.json          # includes skill-check.ts
```

## Verdict

**Yes.** `[nfsAbideInput]` reading `FORM_FIELD` by same-element self-injection drives every part of Foundation's error contract from Signal Forms field state, and the same directive reads `NgControl` as a courtesy so the classes also work under Reactive Forms. 45 of 45 tests pass in Chromium, Firefox, and WebKit (and 90 of 90 with `--repeat-each=2`). Server HTML is the pristine form with no error classes. `input`, `change`, and `blur` (with `focusout`) replay after hydration.

**WCAG 2.2 AA** on the invalid state: axe with the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` (nothing disabled) finds no violations, and a dedicated test asserts 3.3.1, 3.3.3, 3.3.7, 4.1.3, 1.4.3, and 1.4.11. That result depends on these fixes:

- **Contrast.** Foundation's defaults fail 1.4.3: `.form-error` and `.is-invalid-label` at 4.49:1, the invalid placeholder at 3.93:1, and the placeholder at 1.63:1. They also fail 1.4.11: the input border is 1.63:1. The five settings above raise these to 5.25, 5.25, 4.55, 4.70, and 3.42:1. The invalid border already passes 1.4.11 at the defaults.
- **Status messages (4.1.3).** Field errors appear without taking focus, so the directive adds `role="alert"` to each `.form-error` that has none. Abide's `a11yAttributes` does the same.
- **Redundant entry (3.3.7).** It fails for input entered before hydration unless the rescue below is on, and it fails for a submit before hydration. That second case was OPEN FOR HUMAN and is decided by [ADR 0027](../../adr/0027-abide-pre-hydration-submit.md): the submit control stays disabled until the form is ready.

The full table is in the ticket's `## Answer`.

Four things the brief did not anticipate:

1. **`fieldChange` cannot be expressed with field state alone.** `dirty` flips on the first keystroke and `touched` on any blur. With `dirty && touched` the error showed while typing after an earlier unchanged blur (Chromium: `expect(locator).not.toHaveClass(expected) failed ... Received string: "is-invalid-input"` right after `pressSequentially('x')`). The policy uses a `changed` signal set by a replayable `(change)` host listener, which is Abide's own trigger. `liveValidate` maps to `dirty` and `validateOnBlur` to `touched`. Commit timing belongs to the schema (`debounce(path, 'blur')` on text paths, or `updateOn: 'blur'` in Reactive Forms). The directive cannot set it.
2. **`submit()` validates a focused, debounced field's stale value.** `submit()` touches the whole tree but flushes only the root's pending sync (`field/node.ts` `markAsTouched` calls `flushSync()` on the root only; children get `markAsTouchedInternal`). If the user presses Enter in a debounced field, the input shows `larsbrinknielsen@gmail.com` while the field is flagged invalid and nothing submits. Flushing in the form's `(submit)` listener works only when `NfsAbide` is imported before `FormRoot`, because listener order follows import order. The fix that does not depend on order is `(keydown.enter)` on the input, which calls the public `FieldState.markAsTouched()` before the implicit submission.
3. **Hydration overwrites what the user typed or checked before hydration.** `FormField`'s first update pass writes the model (`''`/`false`) into the reused server node. The replayed `input`/`change` then read that overwritten control, so the field ends up empty *and* flagged invalid. Reactive Forms does the same. The directive rescues the value with public API: it reads `value`/`checked` at construction, while the node still holds the user's input, and calls `controlValue.set()` in `afterNextRender`, which runs before replay.
4. **A submit before hydration is a native GET submission.** `FormRoot` renders `novalidate` and `FormField` renders `name="ng.formN.<key>"` on the server, so the dehydrated form reloads the page with every field in the query string, the password included (`?ng.form84.email=x&ng.form84.password=hunter2&...`). Nothing replays. The server-side `N` also grows with every request because the counter is process-wide.

Details, exact error text, and what is not proven: the ticket's `## Answer`.
