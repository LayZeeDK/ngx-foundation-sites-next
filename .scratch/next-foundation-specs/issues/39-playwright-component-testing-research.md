# 39. Playwright component testing options for Angular 22.2

Type: research
Status: claimed
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which Playwright component testing solutions exist for Angular 22.2 as of September 2026, what state is each in, and how could each mount and reuse CSF stories written for `@storybook/angular-vite`? The user requires the map to identify a working solution and to consider whether it replaces Vitest Browser for browser-level tests.

Cover, each with version, release date, maintenance signal (last publish, open issues, maintainer), peer ranges for `@playwright/test`, `@playwright/experimental-ct-core`, Angular, and Vite, and how mounting works:

1. **`@sand4rt/experimental-ct-angular`**: the community Angular adapter for Playwright CT. Mount API, what it supports (inputs, outputs, content projection, providers, standalone components, directives on a host), Angular version ceiling, and known breakages.
2. **`@jscutlery/playwright-ct-angular`**: the jscutlery adapter. Same questions; note whether it uses `@playwright/experimental-ct-core` or its own runner, and its status relative to sand4rt.
3. **`@playwright-labs/selectors-angular`**: what it actually is (selector engine, not a mounting solution?), and how it complements a CT adapter or e2e tests.
4. **Playwright's framework-agnostic component testing** (https://playwright.dev/docs/test-components and the Playwright repository at https://github.com/microsoft/playwright, `packages/playwright-ct-core`, plus release notes): the current recommended approach, whether a `mount` hook registration (`test.use({ ... })`, `beforeMount` hooks) lets a project write its own Angular adapter, and any Angular example or discussion in the Playwright repo and issues.
5. **Portable stories**: whether `@storybook/angular-vite` 10.6 exposes `composeStories` / `composeStory` (check `d:/projects/github/storybookjs/storybook` if a clone exists under `d:/projects/github/storybookjs/`, otherwise the published package via `npm pack` into the scratchpad, and https://storybook.js.org/docs/api/portable-stories), how a composed story renders an Angular component, and whether a Playwright CT `mount` could take a composed story. Also how `@storybook/addon-vitest` runs the same stories, so the two paths can be compared.
6. **Vitest Browser versus Playwright CT** for an Angular component library: what each can do (real browser, Angular TestBed availability, DI, harnesses, axe, screenshots, trace viewer, CI parallelism, Nx integration), known limitations, and what the tooling research at `research/tooling-baseline.md` already established.
7. **Local examples**: search `d:/projects/github/` for repositories that already use any of these packages (for example under `d:/projects/github/jscutlery/`, `d:/projects/github/sand4rt/`, `d:/projects/github/LayZeeDK/`, `d:/projects/github/ngworker/`) and record what their setups look like. Clone `https://github.com/jscutlery/devkit` into `d:/projects/github/jscutlery/devkit` (shallow) and `https://github.com/sand4rt/playwright-ct-angular` into `d:/projects/github/sand4rt/playwright-ct-angular` (shallow) if they are missing, and read their READMEs, package manifests, and examples.

Sources: npm registry metadata (`npm view <pkg> version time peerDependencies`), the package repositories, Playwright docs and repository, Storybook docs and package, and the local clones above. Fetch fallback chain per map.md.

## Deliverable

`research/playwright-component-testing.md`: one section per item with cited facts, a comparison table (package, version, Angular ceiling, Playwright peer, mounting model, CSF reuse path, maintenance, verdict), and a recommended list of candidates for the prototype ticket in order of likelihood to work, each with the exact commands and files the prototype should create. Plain ASCII.
