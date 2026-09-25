# 12. Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest 5 browser mode

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

How do the latest Nx, Angular CLI, Storybook, and Vitest fit together for an Angular publishable library, so that every spec's Testing Decisions section names real seams and commands?

Answer: how `@nx/angular` 23.2 generates a publishable library and what test runner it configures by default; how `@angular/build:unit-test` runs Vitest 5 in browser mode with Playwright and what it cannot do; whether `@storybook/angular` 10.6 supports the Storybook Vitest addon (`@storybook/addon-vitest`) for Angular or still needs `@storybook/test-runner`; how play functions, `@storybook/addon-a11y`, and axe run in CI; how Nx runs Playwright e2e against a static Storybook build; TypeScript 7 support across Angular 22.2, Nx 23.2, and Vitest 5; and the state of `@analogjs/vitest-angular` versus the first-party builder.

Sources: npm registry metadata (`npm view <pkg> version peerDependencies`), the packages' own READMEs and docs in `node_modules` after `npm view` (or a throwaway `npm pack`), Nx docs via the `nx_docs` MCP tool, Angular docs in `d:/projects/github/angular/angular/adev/src/content/guide/testing/**`, Storybook docs at https://storybook.js.org/docs (markdown.new), Vitest docs at https://vitest.dev/guide/browser/. Do not install anything into this repo; use `D:/tmp/` for any throwaway workspace and delete it afterwards, or leave it and record its path.

## Deliverable

`research/tooling-baseline.md`: a version matrix with peer ranges, a recommended test pyramid (Storybook play functions, Vitest browser, Playwright e2e) with the command each runs under Nx, and a list of open incompatibilities. Cite URLs and paths. Plain ASCII.
