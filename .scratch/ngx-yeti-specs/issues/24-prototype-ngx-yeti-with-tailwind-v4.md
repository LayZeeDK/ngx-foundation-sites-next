# 24. Prototype: the package beside Tailwind v4 in one Angular application

Type: prototype
Status: open
Blocked by: 04, 23
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does an Angular application that uses both the package (Yeti's layered CSS, loaded and unloaded per component) and Tailwind v4 render both correctly? How do Yeti's layers and Tailwind's layers (`theme`, `base`, `components`, `utilities`) and preflight cascade against each other? And what layer order, if any, should the package document or set?

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 34. We must verify that ngx-yeti works with Tailwind v4 and design how their styles and layers would overlap/cascade properly when using both in a consuming Angular application project.

## How to work it

Build an Angular 22.2 application under `D:/tmp/` with Yeti at `f52d1e8b9`, the strongest lazy-loading candidate from [Research: Yeti's cascade layers and stylesheet order, for lazy loading](23-research-yeti-layers-and-import-order.md), and Tailwind v4 set up with `ng add tailwindcss`. The old map's PostCSS prototype found that this merges `@tailwindcss/postcss` into `postcss.config.json`, and that Angular's own automatic setup covers only v3.

Measure in Chromium, Firefox, and WebKit:

- Tailwind's preflight against Yeti's base;
- a utility on a Yeti component (spacing, colour, display);
- a Tailwind utility whose name matches a Yeti class or attribute;
- Yeti's tokens and `light-dark()` beside Tailwind's theme variables;
- each candidate order: Tailwind first, Yeti first, or one shared `@layer` statement;
- a lazily loaded Yeti part arriving after Tailwind;
- an unload of that part.

Report computed-style differences against each library alone. Capture under `prototypes/yeti-tailwind/`, and append an `## Answer` with the recommended order and what a consumer writes. Decide nothing.
