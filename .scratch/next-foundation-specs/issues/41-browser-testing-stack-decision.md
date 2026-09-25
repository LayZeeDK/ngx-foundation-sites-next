# 41. Decide the browser testing stack: Playwright component tests, Vitest Browser, or both

Type: grilling
Status: open
Blocked by: 12, 39, 40
Labels: wayfinder:grilling
Map: ../map.md

## Question

Given the prototype results, does Playwright component testing replace Vitest Browser for browser-level tests in the next library, or do both stay, and what is the final test pyramid every spec's Testing Decisions must follow?

Decide, with `/grill-with-docs` self-grilling against `research/tooling-baseline.md`, `research/playwright-component-testing.md`, the prototype ticket's answer and `prototypes/playwright-ct/`, and `building-blocks.md`:

1. The layers: story play functions (Storybook with `@storybook/addon-vitest`), browser-level tests (Playwright CT, Vitest Browser, or both with a rule for which goes where), node-level Vitest for server-side rendering and pure logic, Playwright e2e for web-native APIs and the static Storybook build. Name the Nx target and command per layer.
2. CSF reuse rules: which stories are the single source for interaction tests, when a Playwright CT test may mount a story versus a bare host component, and what must never be duplicated between layers.
3. What each layer asserts (DOM and ARIA state, never instance fields), how axe runs in each, and how SSR, hydration, and event replay (ticket 38) are tested at which layer.
4. If no Playwright CT solution worked: record that, keep Vitest Browser, and state what would have to change upstream for the decision to be revisited.

Write the decision as an ADR under `adr/` (it is hard to reverse, surprising without context, and a real trade-off) and update the testing-seams section of `building-blocks.md` to match. The consistency review ticket then aligns every spec's Testing Decisions with this ticket. Mark anything unsettled as `OPEN FOR HUMAN`.
