---
status: accepted
---

# Four test layers, one stack each, and where Yeti's own checks sit

Adapted from [ADR 0018](../../next-foundation-specs/adr/0018-browser-testing-stack.md) of `.scratch/next-foundation-specs/`, by [Decide: which ADRs carry over](../issues/08-decide-inherited-adrs.md). That record bound nothing here. The four layers are this map's "Testing" note (the user's decision in the old bundle, adapted by [Decide: which standing preferences and user rulings carry over](../issues/07-decide-inherited-preferences-and-rulings.md)), which left three Yeti additions for this record to place.

The old record's question, whether Playwright component tests replace Vitest browser mode, was answered by a prototype on the same toolchain this map targets (Angular 22.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, Playwright 1.63): Playwright 1.63's `mount(storyId)` over the static Storybook build works with about 150 lines of project-owned gallery code, but from Node a Playwright test has no TestBed, no DI override, no `DeferBlockBehavior.Manual`, no dispatch of a replay-shaped event, no development-mode warning capture, and no coverage, and it costs a navigation and a Storybook boot per mount ([Prototype: Playwright component tests mounting CSF stories](../../next-foundation-specs/issues/40-playwright-component-testing-prototype.md)). None of that depended on Foundation.

We decided:

1. **Layer 1, story play functions** through `@storybook/addon-vitest` (`nx test-storybook`), the single home of interaction tests. Axe runs per story through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` on one rule set, `runOnly` tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice` (naming `wcag22aa` turns on axe-core's `target-size` rule). In CI this is the enforcing gate ([ADR 0015](0015-wcag-2-2-aa-enforcement-over-yeti.md)). Every story loads Yeti's always-loaded group globally and its item's part file as a consumer would.
2. **Layer 2, browser-level**: Vitest browser mode under the Angular unit-test builder (`nx test`), TestBed over a bare test host, no stories mounted, no axe. Its provider and engines are left to [Research: testing at the browser floor](../issues/27-research-testing-at-the-browser-floor.md), which weighs `@vitest/browser-webdriverio` against `@vitest/browser-playwright` on the user's instruction there; this record fixes the layer, not the provider.
3. **Layer 3, node-level**: the same `nx test` run, holding pure-logic specs and each item's `<name>.ssr.spec.ts` server-render smoke through one shared `renderServer()` helper ([ADR 0011](0011-rendering-modes-contract-for-yeti.md)). It also holds **the contract check**: a test that reads the built manifest of the pinned commit through `yeti-css/manifest` (the only Yeti file package code reads besides `yeti-css/tokens`, [ADR 0006](0006-yeti-pinned-develop-commit-vendored-and-gated.md) point 7) and asserts that every item's class, attribute, marker, value, and event that a spec maps has its directive input, union member, or output, and that no union holds a value the manifest lacks. This replaces the old map's class-rule review. It is a test of the package, not a check a consumer runs, so the Milestones note's deferral of checks does not reach it.
4. **Layer 4, Playwright e2e**, against two served targets: the static Storybook build, opened through `mount(storyId)` with `embed=true` so the play function does not run again, and a prerendered fixture application with one route per item, for real hydration, event replay with the main bundle held back, hydrate triggers, the JavaScript-disabled page, routing, and the History API. `@axe-core/playwright` with the same tags runs only on states no play function reaches and on the JavaScript-disabled page.
5. **Yeti's own `bin/validate.js` is not a layer.** `bin/build.js` runs it on every build (`bin/build.js:9`, `:34`, read at `f52d1e8b9`), so building Yeti at the pin, the Nx target [Prototype: building, consuming, and theming Yeti](../issues/22-prototype-building-and-consuming-yeti-with-nx.md) measured, already fails on what it rejects.
6. **Yeti's `bin/frozen.js` is not a layer either.** It compares the frozen surface between two git refs and exits 1 on a break (`bin/frozen.js:1-12`, read), so it belongs to the pin move, which [ADR 0006](0006-yeti-pinned-develop-commit-vendored-and-gated.md) point 4 already gates with it; running it again on every test run would compare the pin with itself. What its verdict does to the package's version is [ADR 0017](0017-release-policy-with-a-pinned-yeti.md)'s.
7. **Testing at the floor browsers** (Chrome and Edge 141, Firefox 145, Safari 26.2; [ADR 0002](0002-browser-target-baseline-2025.md)) is placed by [Research: testing at the browser floor](../issues/27-research-testing-at-the-browser-floor.md) and the decision that follows it, in layer 2, layer 4, or both.

## Considered options

- **Playwright component tests replace Vitest browser mode as layer 2.** Rejected, as in the old record: every TestBed-only case would need a story-level equivalent, and the run was about ten times slower per test.
- **A fifth component-test layer.** Rejected, as in the old record: its content would copy a play function or belong in e2e.
- **Opening stories by URL (`/iframe.html?id=<story-id>&viewMode=story`) instead of the gallery.** The fallback, as in the old record: one mechanical rewrite away if the gallery's dependence on Storybook preview internals breaks.
- **A jsdom default for `nx test`.** Rejected, as in the old record: the directives are DOM, focus, and ARIA behaviour.
- **Running `bin/validate.js` against the package's stories as a markup lint.** Not adopted: it validates Yeti's own source tree; the contract check in point 3 covers the package's side.

## Consequences

- Each spec's Testing Decisions names the four layers and what each asserts for its item; the contract check needs no per-spec code beyond the spec's contract mapping.
- The static Storybook build runs Angular in production mode, so layer 4 sees no development-mode output.
- The one file on Storybook preview internals, the Playwright gallery and its `previewHead` stub, is owned by the e2e project's tests; a Storybook change breaks that file, not the specs.
- Every Playwright browser on the development machine is an x64 binary under Windows-on-Arm emulation, so three-engine runs are for CI and `--project=chromium` is the local default (as in the old record). Safari runs only on a macOS runner (the user's acceptance in [ticket 27](../issues/27-research-testing-at-the-browser-floor.md)).
