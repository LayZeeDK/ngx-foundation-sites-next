# 20. Prototype: Yeti's modules in a single-page Angular app

Type: prototype
Status: open
Blocked by: 03
Labels: wayfinder:prototype
Map: ../map.md

## Question

[Research: Yeti's JavaScript modules and what Angular adds](03-research-yeti-javascript-and-angular.md) inferred, without running a browser, that Yeti's modules break in a single-page app:

- three modules scan the page only at load;
- `#id` links resolve against `<base href>`;
- a popover stays open across a `routerLink` navigation.

Is that true in a running app? And how could the package resolve each failure?

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim, replying to that finding:

> 25. Verify in a prototype then consider how this could be resolved by ngx-yeti.

## How to work it

Build an Angular 22.2 app with the router under `D:/tmp/`, with Yeti at `f52d1e8b9` and its modules loaded as Yeti documents. Set `<base href>` to a subpath, because the user ruled that only `baseHref` is supported, not `deployUrl` (map, Standing rulings). Measure each inferred failure in Chromium, Firefox, and WebKit, plus any others found:

- elements added after load, by a route change, `@if`, or `@defer`;
- fragment links;
- open popovers and dialogs across navigation;
- listeners left behind after a route is destroyed.

For each failure, try the package's candidate resolutions, such as:

- a directive that owns the behaviour in place of the module;
- re-running the module's setup on the element;
- router-aware cleanup;
- fragment-link handling through the router.

Capture under `prototypes/yeti-spa/`, and append an `## Answer` with a verdict per failure and per resolution. Decide nothing.
