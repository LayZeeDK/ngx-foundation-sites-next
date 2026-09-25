# 38. Angular 22.2 @defer, SSR, prerendering, hydration, and event replay for DOM-touching directives

Type: research
Status: resolved
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

## Answer

Gist (the rules specs build on):

- 22.x change: `provideClientHydration()` turns incremental hydration on by default (`withIncrementalHydration()` is deprecated, `withNoIncrementalHydration()` opts out), and incremental hydration includes `withEventReplay()`. So event replay is on for every SSR consumer. This corrects the API survey.
- On the server, constructors, inputs, `computed`, `linkedSignal`, `effect` and every `host` binding run; `afterNextRender`, `afterEveryRender`, `afterRenderEffect`, `animate.enter`/`leave` and `@defer` triggers do not. There is no layout, no `IntersectionObserver`/`ResizeObserver`/`matchMedia`. First-paint state must come from host bindings on signal state; everything measured, focused, scrolled or timed goes in render callbacks, with timers outside the zone (hydration cleanup and event replay both wait for `whenStable()`).
- Hydration checks only node type and tag name. Class, attribute and style differences are rewritten silently at hydration (with a visible flash); structure differences (moved or inserted nodes, `innerHTML`) break it. `ngSkipHydration` is only valid on component hosts, so directives have no escape hatch. Shadow DOM encapsulation and uncovered i18n force a component to skip hydration, which also drops its event replay.
- Event replay covers only template and `host` listeners on elements, only the listed native types: `click`, `keydown`, `focusin`, `mouseover`, `pointer*` (not `pointerenter`/`pointerleave`), `input`, `change`, `submit`, plus capture `focus`, `blur`, `toggle`. No `mouseenter`/`mouseleave`, `scroll`, custom events, outputs, `Renderer2.listen` listeners, or `document:`/`window:`/`body:` targets. Replay happens after stability, with `eventPhase === 101`. Calling `preventDefault()` during replay throws, and the rest of that handler is skipped. Handlers must change state first and skip `preventDefault()` on replay.
- Incremental hydration: any replayable listener inside a dehydrated block hydrates that block and its ancestors, top-down, then replays. Until then no class inside it exists, so a parent outside cannot see its items. One widget (container plus items, trigger plus target) belongs in one hydration boundary. `hydrate on interaction`/`hover` take no parameters; `hydrate never` blocks never replay.
- `@defer` belongs in consumer templates, not library templates. It keeps parent DI working across the boundary, and `<ng-content>` inside it defers no code.

Surprises:

- Aria's `DeferredContent` (`ngAccordionContent`, `ngTabContent`) creates panel views in `afterRenderEffect`, so an open Aria panel is empty in server HTML.
- Foundation's `.accordion-content` has no CSS rule that shows it, so an accordion open at first paint needs a library binding.
- CDK `_IdGenerator` with `randomize` makes server and client IDs differ.
- Inside a dehydrated block, JSAction calls `preventDefault()` on anchor clicks before dispatch (from reading the source), so the native hash jump does not happen.

Open questions:

- Whether `animate.enter` replays on server-rendered nodes at hydration. The source has no guard and no test covers it, so it needs a prototype.
- OPEN FOR HUMAN: how handlers detect replay, given that `EventPhase` lives in an entry point documented as internal.
- Whether the new repo adds a prerendered SSR fixture app with Playwright as a fourth test seam. Storybook and TestBed are client-only, and it is unverified whether `renderApplication` runs under `@angular/build:unit-test`.
- Whether Aria-based Accordion and Tabs accept client-only panel content.

Findings: ../research/angular-rendering-modes.md
