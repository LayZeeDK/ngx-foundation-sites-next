# 66. Prototype: Abide control kinds, value adoption, and the ready gate

Type: prototype
Status: open
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
