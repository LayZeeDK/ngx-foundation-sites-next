# 58. Storybook conventions for the new library

Type: grilling
Status: open
Blocked by: 41
Labels: wayfinder:grilling
Map: ../map.md

## Question

What conventions do the new library's stories follow, so the 26 specs' story play functions are consistent and reusable by the browser-level and e2e layers? Decide the story id scheme, story file layout per directive, `parameters.a11y.test = 'error'` with the WCAG 2.2 AA rule set, Foundation Prototype utility classes in demos, the animations-disabled token in `preview.ts`, how composed stories are shared with the browser-level layer (per the browser testing stack decision), and how e2e tests address stories in the static build.

Read first: `research/tooling-baseline.md`, `research/playwright-component-testing.md`, the answers of the Playwright component testing prototype and the browser testing stack decision, `building-blocks.md` (testing seams), and this repo's `AGENTS.md` Storybook sections as prior art (conventions only, not code).

Run `/grill-with-docs` (self-grilling, both sides). Write the result to `storybook-conventions.md` in the effort directory, record the decision log under `## Answer`, and add an ADR only if the domain-modeling bar is met.
