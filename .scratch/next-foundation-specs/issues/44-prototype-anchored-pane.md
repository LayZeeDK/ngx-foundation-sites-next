# 44. Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay

Type: prototype
Status: open
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does an in-place positioner run from `afterRenderEffect` with `ResizeObserver` match Foundation's 12 placements (4 positions by 3 alignments), auto-position fallback order, the body-box bound, RTL, and scrolling ancestors for `.dropdown-pane` and `.tooltip`, without CDK Overlay? Where it fails, does CDK Overlay with a connected position strategy (inline popover location) cover the case while keeping Foundation's pane CSS? Measure both on the same fixtures.

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-positioned.md`, `research/angular-cdk-inventory.md`, `research/web-platform-features.md`, `research/angular-rendering-modes.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-anchored-pane/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/anchored-pane/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.
