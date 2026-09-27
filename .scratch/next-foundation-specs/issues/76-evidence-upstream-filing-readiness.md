# 76. Upstream filings

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

The README open list named ten upstream filings (angular/components Aria, angular/angular Signal Forms, compiler, and documentation, Storybook, two Playwright community packages, and WebKit) that needed the user's confirmation. Should any be filed?

## Answer

Resolved 2026-09-26 by the user's ruling: no upstream filings. None of the ten is filed, and no readiness research is done. Every spec already carries a workaround that does not depend on an upstream change, so nothing in the bundle waits on them:

- Aria's development warning for projected panels, its logged replay error, and the accordion group's `keydown` target check: accepted and guarded as the Accordion, Tabs, and Responsive Accordion Tabs specs state (the content key guard and the replay guard).
- Aria's roving tab stop after an outside selection change: accepted and documented as a known deviation in Orbit, Tabs, and Responsive Accordion Tabs.
- Signal Forms `submit()`, hydration overwriting pre-hydration values, and native submits before hydration: handled by the Abide spec's value adoption and ready gate (ADR 0027).
- The compiler crash on a typed reference to a host directive: avoided by linking custom controls through their wrapping label (the Abide spec).
- The directive composition guide's wording: the bundle states the binding rule itself (building-blocks 1.9, ADR 0037, which superseded ADR 0034).
- Storybook's missing public render API: the Playwright gallery on preview internals is adopted (ADR 0018).
- The two Playwright community packages: nothing depends on them.
- WebKit's empty `pseudoElement` on the backdrop's `animationend`: the Reveal spec matches on the keyframe name.

The README open list drops the upstream filings and records this ruling.
