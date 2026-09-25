# 09. Angular Material 22.2 counterparts as API-design reference

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

How does Angular Material 22.2 design the public API of the components that correspond to Foundation plugins, and which CDK or Aria primitives does each sit on? Material is a reference for API shape, not for styling.

Map: Accordion to `expansion`; Tabs to `tabs`; Reveal to `dialog` (and `bottom-sheet`); Tooltip to `tooltip`; Dropdown and DropdownMenu to `menu` and `select`'s panel; OffCanvas to `sidenav`; Slider to `slider`; Abide to `form-field` errors and `input`; Sticky and Magellan to `toolbar` and `sort` (where relevant); Orbit has no counterpart (say so); ResponsiveMenu and ResponsiveToggle to whatever Material does with BreakpointObserver.

For each: the public inputs and outputs and their naming, two-way bindings via `model()`, whether it is a directive or component and why, how it handles animation after the `@angular/animations` deprecation, how it handles SSR and zoneless, the ARIA it emits, and how it is tested (harnesses, unit tests, e2e).

Sources: `d:/projects/github/angular/components/src/material/<name>/**` including `*.md` docs and `testing/` harnesses; the Material docs site https://material.angular.dev/components/<name>/overview via markdown.new when the clone is unclear.

## Deliverable

`research/angular-material-reference.md`: one section per mapped component with an "API patterns worth borrowing" list and an "API patterns that do not fit a CSS-contract library" list. Cite paths. Plain ASCII.
