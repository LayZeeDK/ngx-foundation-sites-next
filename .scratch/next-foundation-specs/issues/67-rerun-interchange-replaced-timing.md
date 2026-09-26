# 67. Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule

Type: grilling
Status: open
Blocked by: 61
Labels: wayfinder:grilling
Map: ../map.md

## Question

Created on 2026-09-26 because the [Prototype: Interchange template outlet under hydration](61-prototype-interchange-outlet-hydration.md) failed one assumption of the [Spec: Interchange](35-spec-interchange.md): when the Breakpoint service's first-render handoff drives the swap, the `replaced` output fires a few milliseconds before the DOM shows the rule it reports, in Chromium, Firefox, and WebKit, in both the `effect()`-driven outlet and the spec's `ngDoCheck` fallback, because an emission from a render callback runs ahead of a change-detection-driven swap whose triggering signal write comes from another render callback. The prototype sketched one candidate fix (perform the swap and the emission in the same client-side `afterRenderEffect`, keeping `effect()` or `ngDoCheck` only for the server-reaching first pass) but did not verify it.

Revise the spec's decision 12 (`replaced` timing and payload) and the outlet's ARIA focus rule (the default focus move after a template swap) so the output and the focus move happen only after the swap is painted, and state the mechanism with its render hook and phase per `building-blocks.md` 1.5. The candidate fix may be verified in a copy of the prototype's workspace (`D:/tmp/nfs-proto-interchange-outlet-hydration/app`) before it is written into the spec; record the result. The finding generalises to any directive that pairs a breakpoint-driven swap with a render-callback output or focus move (ResponsiveAccordionTabs, ResponsiveMenu, Toggler): state the rule those specs inherit under `### Proposed building-blocks changes` (a 1.5 or 1.11 bullet) so the orchestrator carries it into the map, and note whether the published `specs/responsive-accordion-tabs.md` or `specs/toggler.md` need the same correction.

Read first: the prototype's answer and `prototypes/interchange-outlet-hydration/README.md` with its source, `specs/interchange.md` (decision 12, the outlet API, the ARIA section, the rendering-modes subsection), `specs/breakpoint-service.md` (the first-render handoff), `adr/0014-breakpoint-service-first-render-handoff.md`, `adr/0015-interchange-no-image-or-partial-mode.md`, `building-blocks.md` 1.5 and 1.11, and `research/angular-22-api-survey.md` on `afterRenderEffect` phases.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the mechanism; edit `specs/interchange.md` in place (the decision and its consequences, the API paragraph for `replaced`, the ARIA focus rule, the rendering-modes subsection, and the Testing Decisions case that asserts ordering); append the revision to the Interchange spec ticket's answer as a dated `### Re-run, 2026-09-26` section with new decision-log entries; apply the triage rule to anything you would leave open. Never edit `map.md`, `CONTEXT.md`, `building-blocks.md`, ADRs, or other specs; never commit.

Under `## Answer`: the mechanism chosen with its evidence, the rule other specs inherit, the changes made to the spec, and anything left `OPEN FOR HUMAN` after triage.
