# 40. Prototype: Playwright component tests mounting CSF stories from @storybook/angular-vite

Type: prototype
Status: open
Blocked by: 39
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does a working Playwright component test setup exist for an Angular 22.2 library on Nx 23.2, and can it mount the same CSF stories that `@storybook/angular-vite` 10.6 renders and that `@storybook/addon-vitest` runs as interaction tests? The user requires an identified working solution; only a running prototype can answer this.

Build a throwaway workspace under `D:/tmp/nfs-ct-prototype/` (never inside this repo): `npx create-nx-workspace@latest` with the Angular preset at the versions in map.md (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x), one publishable library with one small directive (a class-toggling disclosure directive with an `input()`, a `model()`, and an `output()`, styled by a plain CSS class), one CSF story file with a play function, `@storybook/angular-vite` with `@storybook/addon-vitest` and `@storybook/addon-a11y`.

Then, in the order the research ticket recommends, try each candidate: install it, mount the directive's host component directly, then mount the composed story (portable stories), run one interaction assertion and one axe check, and record for each candidate: install result, mount result, story reuse result, exact errors, and the files and commands used. Stop at the first candidate that fully works, but record at least the first two outcomes. Also run the same story through `nx test-storybook` (Vitest addon) and through a Vitest Browser unit test so the three paths can be compared on the same story.

Capture the prototype: leave the workspace in place, list its path and the working files in the answer, and copy the decisive files (Playwright CT config, the test that mounts the story, the adapter or hook code, the package manifest) into `prototypes/playwright-ct/` inside the effort directory so the decision ticket and the new repo can read them without the workspace.

## Answer format

Under `## Answer`: a results table (candidate, installs, mounts component, mounts story, interaction, axe, verdict), the winning setup step by step, the failures with their exact error text, timing per run, and an honest "what this does not prove" list. Mark anything you could not resolve as `OPEN FOR HUMAN`.
