# 16. Research: binding Yeti's `yeti:*` events in Angular templates

Type: research
Status: claimed
Blocked by: 03
Labels: wayfinder:research
Map: ../map.md

## Question

Angular cannot bind `(yeti:close)` in a template. The compiler splits the name at the colon into a global target and an event (`packages/compiler/src/template_parser/binding_parser.ts:699`), and allows only `window`, `document`, and `body` as targets (`packages/compiler/src/template/pipeline/src/phases/reify.ts:328`). What are the ways to let a consumer bind Yeti's events (`yeti:close`, `yeti:open`, `yeti:select`, `yeti:slide`, `yeti:invalid`, `yeti:current`), and what does each cost?

## User instructions, 2026-10-01

The user's own messages to the orchestrator, verbatim:

> 20. Research custom event manager plugins and prior art in this space, including Angular's now deprectated/removed HammerModule for hammer.js and 3rd-party Angular packages/articles using an event manager plugin.
>
> 21. As an alternative, also consider for example a global platform-level service/initializer that re-emits `yeti:*` events as `yeti-*` events to enable Angular template event binding support.

## How to work it

Use a `/research` subagent, with a small probe in an Angular 22.2 workspace under `D:/tmp/` where a claim needs one. Cover, citing `file:line` in the local Angular clone (`22.2.x`) or a URL:

1. Event manager plugins: `EVENT_MANAGER_PLUGINS` and `EventManagerPlugin`, and how `supports()` and `addEventListener()` interact with the compiler's colon parsing. Can a plugin even receive `yeti:close`, or does the compiler reject the name first?
2. Prior art:
   - `HammerModule` and `HammerGesturesPlugin`: what they did, when they were deprecated and removed, and why.
   - Third-party packages, for example `@tinkoff/ng-event-plugins` / `@taiga-ui/event-plugins`.
   - Articles that build an event manager plugin.
3. The alternative the user named: a platform-level service or application initializer that listens for `yeti:*` and re-dispatches `yeti-*`, which a template can bind as `(yeti-close)`. Cover its cost per event, its interplay with SSR, hydration, and event replay, and whether a re-dispatched event keeps `detail`, `bubbles`, and `composed`.
4. The baseline: a directive on each Yeti element that listens with `addEventListener` and exposes an `output()`.

For each option, record:

- whether it works with zoneless change detection, SSR, and event replay;
- whether template type checking sees the event's `detail` type;
- what the consumer writes;
- what breaks when Yeti adds an event.

Write `research/yeti-events-in-angular-templates.md`, and append an `## Answer`. Decide nothing.
