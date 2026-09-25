# 38. Angular 22.2 @defer, SSR, prerendering, hydration, and event replay for DOM-touching directives

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

What do Angular 22.2's rendering modes require of a directive or component library whose directives toggle classes, measure layout, position panels, trap focus, and listen to pointer and keyboard events, so that every spec can state precisely how its directive behaves under `@defer`, server-side rendering, prerendering, full hydration, incremental hydration, and event replay? The user has ruled that all of these must be supported by every directive and component.

Cover, with the exact rules and the source that owns each:

1. **SSR and prerendering** (`d:/projects/github/angular/angular/adev/src/content/guide/ssr.md`, `prerendering.md` if present, and `packages/platform-server/**`): what runs on the server, what does not (no `window`, `document` only through DI, no layout), how `afterNextRender` and `afterRenderEffect` behave on the server, `PendingTasks` and stability, render modes per route (`RenderMode.Server`, `Prerender`, `Client`), `provideServerRendering` and `withRoutes`, `provideClientHydration` options, and what a library must do to stay SSR-safe (platform checks via DI, `isPlatformBrowser` replacements, `DOCUMENT` from `@angular/core`).
2. **Hydration** (`hydration.md`): DOM structure preservation rules, what breaks hydration (direct DOM manipulation before hydration, mismatched structure, `ngSkipHydration`), constraints on i18n, `@if`/`@for` and content projection under hydration, the `ngSkipHydration` attribute as a per-component escape hatch, and how a directive should defer DOM writes until after hydration.
3. **Incremental hydration** (`incremental-hydration.md`): `@defer (hydrate on ...)` triggers (`idle`, `viewport`, `interaction`, `hover`, `immediate`, `timer`, `when`, `never`), how a dehydrated block behaves before hydration, nested hydrate blocks, the interaction with `@placeholder`, and what a directive inside a hydrate block may assume.
4. **Event replay** (`withEventReplay()` in `hydration.md` and `packages/core/src/hydration/event_replay.ts`, `packages/core/primitives/event-dispatch/**`): which events are captured, what happens to a click on a not-yet-hydrated Reveal trigger or Dropdown button, how `(click)` listeners on host elements replay, whether custom events, keyboard events, and pointer events replay, and what a directive must do so that the replayed event lands correctly (for example not relying on state set up in an effect that runs after replay).
5. **`@defer`** (`templates/defer.md`): triggers, prefetch, `@placeholder`, `@loading`, `@error`, minimum durations, what happens to content queries and DI when a directive lives in a deferred block, how the library's own lazy content (accordion panels, tabs panels, Orbit slides, Reveal content) should use `@defer` versus `ng-template`, and testing deferred blocks with `DeferBlockBehavior` and `fixture.getDeferBlocks()`.
6. **Testing** (`testing/**`): how to unit-test SSR safety (`renderApplication`, platform-server tests), hydration mismatches, and event replay; what Storybook and Vitest browser mode can and cannot exercise here, so the Testing Decisions sections know which seam covers what.
7. **Library implications**: a checklist a spec author can apply per directive: server render output, first-paint state (for example a Reveal that must be closed and a Dropdown pane that must be hidden without JavaScript), what may be measured and when, focus and scroll side effects, `afterRenderEffect` phases, `ngSkipHydration` use, and event replay readiness.

Sources: the local Angular clone at `d:/projects/github/angular/angular` (branch 22.2.x, version 22.2.0), notably `adev/src/content/guide/{ssr,hydration,incremental-hydration}.md`, `adev/src/content/guide/templates/defer.md`, `adev/src/content/guide/testing/**`, `packages/core/src/hydration/**`, `packages/core/src/defer/**`, `packages/platform-server/**`, and the `angular-developer` skill references (`rendering-strategies.md`, `loading-strategies.md`) under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`. Also read `research/angular-22-api-survey.md` in this effort for what is already recorded and extend rather than repeat it. How Material and CDK handle SSR is in `research/angular-cdk-inventory.md` and `research/angular-material-reference.md`; cross-reference, do not redo.

## Deliverable

`research/angular-rendering-modes.md`: one section per item above with exact API names and rules, each cited to a file path or URL, and the per-directive checklist from item 7 as a table the spec tickets can copy. Plain ASCII.
