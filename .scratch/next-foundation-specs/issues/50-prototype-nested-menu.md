# 50. Prototype: Nested menu directive family with breakpoint mode switching

Type: prototype
Status: open
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Three sub-questions, worked in this order:

1. Can one item and submenu directive family emit the `is-<mode>-submenu*` classes from a mode signal, with the accordion, drilldown, and dropdown root behaviours coexisting as host directives on one `ul` and only one active, constant disclosure navigation roles, and per-mode keyboard handling? This sub-question decides the verdict. Include the accordion-mode height animation, which is documented custom CSS because Foundation's `foundation-accordion-menu` Sass has no height rule (its JavaScript used `slideDown`): a grid on the parent `li` (`nfsMenuItem`, rows `auto 0fr` to `auto 1fr`) with the submenu `ul` as the clipped row (`min-height: 0; overflow: hidden`), since a grid on the multi-child `ul.menu.nested` would size only its first row (`building-blocks.md` 1.6 rule 3).
2. What must the Drilldown mode render (wrapper, back button) and measure, and what does the server render for each mode?
3. Does focus stay on the equivalent control when a breakpoint swaps the mode?

A session that runs out of room records the unanswered sub-questions under "what the prototype does not prove" rather than guessing.

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-menus.md`, `research/aria-apg-patterns.md`, `research/di-and-composition-patterns.md`, `research/angular-rendering-modes.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-nested-menu/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/nested-menu/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.
