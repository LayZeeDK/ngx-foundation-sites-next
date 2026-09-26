# 70. Re-run: Orbit spec, the slide's ARIA contract and the focus handoff

Type: grilling
Status: open
Blocked by: 65
Labels: wayfinder:grilling
Map: ../map.md

## Question

Created on 2026-09-26 because the [Prototype: Orbit keyboard scrolling and hydration details](65-prototype-orbit-keyboard-hydration.md) failed one case the [Spec: Orbit](33-spec-orbit.md) depends on, and found a second defect, so the spec must change:

1. **The live `inert` gate (ADR 0025) cannot be an attribute-binding override of Aria's `TabPanel`.** In all three engines the server HTML keeps `TabPanel`'s own `[attr.inert]` value even though the slide directive's override computes the right one; neither a host-directive wrapper nor a plain template binding wins, while the same pattern does win for the bullets' `tabindex` over Aria's `Tab`. The prototype hands the spec a decided fix: `NfsOrbitSlide` stops hosting `TabPanel` and implements the slide's small contract itself (`role="tabpanel"`, `id`, `tabindex` `0` on the selected slide and `-1` otherwise, `aria-labelledby` to the paired bullet, and `inert` from the Orbit's own `live` and `selected` signals), while the bullets keep composing Aria's `Tabs`, `TabList`, and `Tab`.
2. **Mechanic 8's focus handoff cannot call `focus()` synchronously in the IntersectionObserver callback**, because the target slide is still `inert` from the previous selection; the handoff target goes into a signal and `focus({preventScroll: true})` runs from an `afterRenderEffect` `write` phase after the render that lifts `inert`.
3. Page Down, Page Up, End, and Home also scroll the page; decided at the prototype's triage as documented platform behaviour.

Revise `specs/orbit.md` in place for all three: the hierarchy and DI shape, the API rows for `NfsOrbitSlide`, the implementation level (Aria for the bullets, custom for the slides, and why), the Material comparison where it names `TabPanel`, the ARIA and keyboard tables, the rendered HTML (server and hydrated), the render-hooks statement, the rendering-modes subsection, the WCAG 2.2 AA table (1.3.1, 2.1.1, 2.4.3), the design decisions table, and the test cases that assert the `inert` gate and the handoff. Decide whether ADR 0025 needs an amendment (its decision is kept; its mechanism changes) and, if so, write it as `adr/proposed-orbit-<short-name>.md`. Append the revision to the Orbit spec ticket's answer as a dated `### Re-run, 2026-09-26` section with new decision-log entries. Apply the triage rule to anything you would leave open.

Read first: the prototype's answer and `prototypes/orbit-keyboard-hydration/README.md` with its `src/app/orbit.ts` and `orbit.html`, `specs/orbit.md`, `adr/0025-orbit-live-inert.md`, the earlier [Prototype: Orbit on CSS scroll snap](46-prototype-orbit-scroll-snap.md) answer, `specs/tabs.md` (the Aria composition the bullets share), the Aria `TabPanel` source in the components clone, `building-blocks.md` 1.5 (render hooks, including the rendered-state rule) and 1.9, and `research/angular-rendering-modes.md` section 7.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over each change against the prototype's evidence and the Aria and Angular sources; edit the spec in place; never edit `map.md`, `CONTEXT.md`, `building-blocks.md`, existing ADRs, or other specs; never commit. Under `## Answer`: the changes as written into the spec, any proposed ADR, `### Proposed building-blocks changes` (the Table A and Table B Orbit cells that name `TabPanel`), `### Triage`, and anything left `OPEN FOR HUMAN`.
