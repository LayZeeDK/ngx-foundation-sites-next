# 43. Prototype: `@angular/aria` Accordion and Tabs under Foundation markup

Type: prototype
Status: open
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Can host-directive wrappers satisfy Aria's required link inputs while panel content is projected (not Aria's `ng-template` content directives, which render empty in server HTML), keeping `.accordion-title` as a button inside a heading, `.tabs-title > a[aria-selected]`, `.is-active` on the list items, and the grid `0fr -> 1fr` height animation? What does a replayed arrow key do, given Aria calls `preventDefault()` after its handler and `preventDefault()` throws during event replay? If Aria does not fit, is the fallback custom ARIA and keys over CDK accordion state, and what does it cost?

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/angular-aria-inventory.md`, `research/foundation-inventory-disclosure.md`, `research/aria-apg-patterns.md`, `research/angular-rendering-modes.md`, `research/di-and-composition-patterns.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-aria-accordion-tabs/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/aria-accordion-tabs/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.
