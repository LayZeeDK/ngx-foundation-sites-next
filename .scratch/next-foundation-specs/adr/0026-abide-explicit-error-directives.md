---
status: accepted
---

# Abide's label, Form errors, and Form alert are explicit directives, not Abide's DOM lookup

Foundation's Abide finds a field's label (`label[for]`, else the closest `label`) and its `.form-error` elements (siblings, else anything inside the parent, plus `[data-form-error-for]`) by walking the DOM, and the [Prototype: Signal Forms on Abide markup](../issues/49-prototype-signal-forms-abide.md) proved that the same lookup, run in `afterNextRender` with `Renderer2` class toggles, works with only `form[nfsAbide]` and `[nfsAbideInput]`. We decided instead that the label, each Form error, and the Form alert carry their own directives (`label[nfsAbideLabel]`, `[nfsFormError]`, `[nfsAbideAlert]`), linked to their field by the enclosing `nfsAbideLabel` through DI or by a typed template reference (`[nfsFormError]="pw"`), and that every class, id, role, and `hidden` value is a host binding. Why: the Form alert's `hidden` is first-paint state, which building-blocks 1.11 decision 1 requires to be a server-rendered binding (the DOM route makes the consumer write it); Abide's always-on `a11yAttributes` (`role="alert"` on errors, the alert's role) then render on the server too; building-blocks 1.5 limits `Renderer2` writes to values host bindings cannot express; typed references are compile-checked where Abide used id strings; and Abide's sibling rule makes every field in flat markup claim every sibling error (prototype result "Flat markup").

## Considered options

- The DOM lookup (the prototype's route): proven, two directives, Foundation markup verbatim. Rejected for the reasons above; kept as the named fallback.
- One field-group container directive that every field, label, and error sits in (Material's `mat-form-field` role): rejected because Foundation's `label[for]` markup has no such element and the wrapping-label markup already provides one.

## Consequences

- Consumers add one attribute per label, error, and alert, and a template reference where the label or error is not inside a wrapping label.
- Dev-mode warnings cover a label or error that resolves no field, and a field that shows an error with no visible Form error.
- 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the dev-mode warnings for a label or Form error that resolves no field, and for a field in error with no visible Form error, are planned for a later milestone ([Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md), Abide 1, 2, and 4). In the first milestone the Abide spec states each as documented usage: every label and Form error resolves a field, and every field that can show an error has a Form error.
