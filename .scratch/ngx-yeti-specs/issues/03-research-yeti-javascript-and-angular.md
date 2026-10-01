# 03. Research: Yeti's JavaScript modules and what Angular adds

Type: research
Status: claimed
Blocked by:
Labels: wayfinder:research
Map: ../map.md

## Question

How much of Yeti is JavaScript, what does each module do, and what would Angular add beyond replacing it? The stability guide names the optional modules: `alert.js`, `tabs.js`, `dialog.js`, `hover.js`, `carousel.js`, `demo.js`, `range.js`, `validate.js`, `toc.js`, `enter.js`. It also names the `yeti:*` events: `yeti:close`, `yeti:open`, `yeti:select`, `yeti:slide`, `yeti:invalid`, `yeti:current`.

## How to work it

Use a `/research` subagent against `d:/projects/github/foundation/yeti`, citing `file:line`. For each module, record:

- its size;
- the behaviour it adds;
- its ARIA, keyboard, and focus handling, compared with the matching WAI-ARIA APG pattern in `d:/projects/github/w3c/aria-practices`;
- the platform features it relies on, such as `popover`, `dialog`, `invoker` commands, and scroll snap;
- its events;
- what happens with no JavaScript.

Then, for each module and each component without one, say what an Angular wrapper would add, with sources from the Angular 22.2 clones:

- typed inputs and outputs in place of attributes and events;
- signal state and two-way binding;
- `@angular/aria` and `@angular/cdk` building blocks;
- forms integration (`validate.js`, `range.js`);
- SSR, hydration, `@defer`, and event replay;
- `animate.enter` and `animate.leave`;
- DI between parts.

Also list what the platform already does with no JavaScript, where a wrapper would add nothing but types.

Write `research/yeti-javascript-and-angular.md`, and append an `## Answer`. Decide nothing.
