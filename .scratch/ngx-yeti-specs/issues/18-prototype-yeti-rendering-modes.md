# 18. Prototype: Yeti under SSR, hydration, `@defer`, event replay, and `animate.enter` and `animate.leave`

Type: prototype
Status: claimed
Blocked by: 03
Labels: wayfinder:prototype
Map: ../map.md

## Question

How do Yeti's markup, CSS, and optional modules behave in an Angular 22.2 application under each of these, and where does the package have to step in?

- server-side rendering and prerendering;
- full and incremental hydration;
- event replay;
- `@defer` with its triggers;
- `animate.enter` and `animate.leave`;
- zoneless change detection.

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 23. We should also evaluate Yeti compatibility with SSR, hydration, animate.leave/enter, @defer, and so on.

## How to work it

Build an Nx 23.2 / Angular 22.2 SSR workspace under `D:/tmp/` with Yeti at `f52d1e8b9`. Render one item of each kind:

- a stateless component (card);
- a native-platform interactive one (dialog with invoker commands, dropdown with `popover`, accordion with `<details>`);
- a module-driven one (tabs, carousel);
- a layout.

Measure in Chromium, Firefox, and WebKit against a production SSR build:

- server HTML with JavaScript off;
- hydration mismatches and mutations;
- what a user can do before hydration, and which events replay;
- each `@defer` trigger, including `hydrate never`;
- whether `animate.enter` and `animate.leave` play with Yeti's own transitions, and Yeti's enter utility;
- the leave-animation style guard (angular/angular#66244) with Yeti's CSS.

Capture under `prototypes/yeti-rendering-modes/`, and append an `## Answer` with a verdict per mode and item. Decide nothing.
