# 59. Prototype: Rendering-mode test seam

Type: prototype
Status: open
Blocked by: 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Two sub-questions, worked in this order, both proved with one class-toggling directive:

1. Does `renderApplication` run inside the node-level Vitest layer of an Nx 23.2 Angular 22.2 library (with `ngServerMode` isolated per test file), so each spec can have a server-render smoke test? This sub-question decides the verdict.
2. What does the prerendered SSR fixture app for Playwright look like (an Nx Angular app with `@angular/ssr` prerendering, the event-dispatch contract inlined, and the main bundle delayed so pre-hydration clicks and event replay can be asserted)?

A session that runs out of room after the first sub-question records the second under "what the prototype does not prove" rather than guessing.

Read first: `building-blocks.md` (1.12 and 1.11 decision 5; this prototype has no matrix row of its own), `adr/*.md`, `research/angular-rendering-modes.md`, `research/tooling-baseline.md`, `research/playwright-component-testing.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-rendering-mode-test-seam/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/rendering-mode-test-seam/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.
