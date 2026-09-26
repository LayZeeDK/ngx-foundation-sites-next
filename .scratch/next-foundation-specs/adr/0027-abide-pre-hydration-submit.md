---
status: accepted
---

# Server-rendered Abide forms keep their submit control disabled until the form is ready

Before hydration a Signal Forms form is plain HTML with `novalidate` and generated `name` attributes, so a submit is a native GET to the same URL that puts every field, passwords included, into the query string, reloads the page, and clears the form; nothing can replay it ([Prototype: Signal Forms on Abide markup](../issues/49-prototype-signal-forms-abide.md)). That leaks secrets into URLs, history, and server logs (CWE-598) and fails WCAG 2.2 3.3.7 Redundant Entry. We decided that `NfsAbide` exposes a read-only `ready` signal (false on the server and until the first client render callback) and that the spec's documented default for a server-rendered form is a natively disabled submit control, `[disabled]="!abide.ready()"`: HTML then performs neither a click submission nor Enter's implicit submission, the rule holds before any script runs, and the control enables in the first client pass. Why this over the alternatives: in a Signal Forms application the no-JavaScript submission it gives up posts to a route nothing handles, while the risk it removes is concrete.

## Considered options

- The library binds `method="post"` when the consumer wrote no method: rejected; it changes the meaning of the consumer's form, a static prerender host answers POST with an error, and the page still reloads without the values.
- Accept the native GET and document it: rejected; it leaves the leak and the 3.3.7 failure as the default.
- `nfsButton`'s `disabledInteractive` as the disabled mode: rejected; its `type="button"` swap leaves a one-field form without a default button, which HTML then submits implicitly (ADR 0011).
- `nfsButton` disabling submit buttons inside an Abide form by itself: rejected; it couples Button to Abide and silently breaks forms whose server handles native POSTs.

## Consequences

- Consumers whose server handles native submissions (progressive enhancement) use `method="post"` and do not bind `ready`; the docs recommend `form(model, schema, {name})` so field names are predictable.
- An Abide form inside `@defer (hydrate never)` never enables its submit control; Abide forms do not go in `hydrate never`.
- The Playwright fixture app proves that a pre-hydration click or Enter neither navigates nor adds a query string.
