# 51. Prototype: ResponsiveAccordionTabs as one component

Type: prototype
Status: open
Blocked by: 14, 38, 43
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does a component that renders either the accordion or the tabs directive set from the same projected panels keep the selected panel and focus across a breakpoint swap, and hydrate cleanly when the server rendered the other mode than the client resolves? Build on the Aria Accordion and Tabs prototype's verdict.

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-disclosure.md`, `research/angular-rendering-modes.md`, `research/angular-aria-inventory.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-responsive-accordion-tabs/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/responsive-accordion-tabs/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.
