# 47. Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes

Type: prototype
Status: open
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Confirm that the library's `nfs-*` keyframe classes animate under `animate.enter` and `animate.leave` (inserted elements) and under a bound State class (persistent elements, completion on `animationend`/`transitionend` plus the duration-plus-100 ms fallback timer), with `prefers-reduced-motion` shortening them to 1 ms, in Chromium, Firefox, and WebKit. Motion UI transition classes are out (`enter-and-leave.md:28`); any route that sequences classes from script is recorded OPEN FOR HUMAN, not adopted.

Read first: `building-blocks.md` (1.6 rules 1, 4, and 5, and ADR 0003; this prototype has no matrix row of its own), `adr/*.md`, `research/foundation-utilities-conventions.md`, `research/angular-22-api-survey.md`, `research/angular-material-reference.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-motion-ui-animate-enter/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/motion-ui-animate-enter/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.
