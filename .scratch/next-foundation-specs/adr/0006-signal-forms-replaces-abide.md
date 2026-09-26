---
status: accepted
---

# Abide is replaced by Signal Forms plus directives that bind Foundation's error markup to field state

Abide is a validation engine with 17 named patterns, custom validators, `equalTo`, and a class-plus-ARIA error contract (`research/foundation-inventory-forms-media.md` Abide). Angular 22 has a stable, signal-based form system (`form()`, `FormField`, validators, `debounce(path, 'blur')`, `FORM_FIELD` injectable from the same element; `research/angular-22-api-survey.md` Signal Forms) and Material's input reads it with `inject(FORM_FIELD, {self: true, optional: true})` (`research/di-and-composition-patterns.md` 2). We decided not to port Abide's engine: validation, patterns, and cross-field rules are Signal Forms schema helpers exported by the library (`nfsPatterns`, an `equalTo` validator), and the Abide directives only map field state (`invalid`, `touched`, `dirty`, `errors`) onto Foundation's `.is-invalid-input`, `.is-invalid-label`, `.form-error.is-visible`, `aria-invalid`, `aria-describedby`, and the `[data-abide-error]` live region under one injectable error-state policy (`validateOn`, `liveValidate`, `validateOnBlur`), Material's `ErrorStateMatcher` shape.

## Considered options

- Porting Abide's engine as a custom validation service that reads native controls and the Constraint Validation API: rejected as a second forms system next to Angular's; Signal Forms does not use constraint validation and the consumer would end up with both.
- Reactive Forms as the engine: rejected as primary because Signal Forms is stable in v22 and signal-shaped; `NgControl` is read as a courtesy by the same self-injection so the class bindings work under Reactive Forms too, but the exported validators target Signal Forms.

## Consequences

- No `valid.zf.abide`-style outputs; consumers read field state signals.
- The spec must state which Abide options map to the policy and which are dropped (`a11yAttributes` is always on, `patterns`/`validators` maps become schema helpers).
- The [Prototype: Signal Forms on Abide markup](../issues/49-prototype-signal-forms-abide.md) verifies the self-injection binding under the error-state policy; the [Spec: Abide](../issues/31-spec-abide.md) checks that the 17 patterns compile and behave under the `v` regex flag.
- 2026-09-26 (consistency review): both checks are done. The prototype drove Foundation's error contract through `FORM_FIELD` self-injection in three engines, and the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md) extended it to groups, `select`, `textarea`, and a custom control; the Abide spec found 7 of the 16 regexes needing escape-only rewrites under the `v` flag. [ADR 0026](0026-abide-explicit-error-directives.md) and [ADR 0027](0027-abide-pre-hydration-submit.md) record the decisions that followed.
