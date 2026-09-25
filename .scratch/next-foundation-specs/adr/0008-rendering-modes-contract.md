---
status: accepted
---

# Every directive paints its first state from host bindings, touches no DOM before hydration, activates on replayable host listeners, keeps each widget inside one hydration boundary, and never uses `ngSkipHydration`

The user requires every directive and component to support `@defer` with hydrate triggers, server-side rendering, prerendering, full and incremental hydration, and event replay. Ticket 38 (`research/angular-rendering-modes.md`) established that in Angular 22.2 a plain `provideClientHydration()` turns on incremental hydration and event replay; hydration matches nodes by type and tag name only, so attribute and class differences flash rather than fail while structural differences fail; `ngSkipHydration` works only on component hosts, so a directive has no escape hatch; event replay covers only template and `host` listeners on elements for listed native events (no `mouseenter`/`pointerenter`, `scroll`, custom events, outputs, code-added listeners, or `document:`/`window:` targets) and `preventDefault()` throws during replay; render callbacks and `animate.enter` never run on the server; Aria's `DeferredContent` renders panel content only in `afterRenderEffect`; and server and client generated ids differ. We decided that first-paint state is always a host binding on signal state (open panels included, since Foundation's CSS never shows `.accordion-content`), that panel content is projected rather than placed in Aria's `ng-template` directives by default, that every browser-only read, write, observer, timer, and focus call lives in `afterNextRender`/`afterRenderEffect`, that primary activation is a `click`/`keydown` host listener whose handler changes state before any `preventDefault()`, that hover opening uses non-replayed `pointerenter`, that a composite widget and a trigger with its target share one hydration boundary, that deep links need consumer ids, that library templates contain no `@defer` while each plugin is its own entry point so consumers can defer per plugin, and that the library never uses `ngSkipHydration` or Shadow DOM encapsulation.

## Considered options

- Generating structure at construction (overlays, tips, back buttons) as Foundation does: rejected, it is the mismatch the hydration guide names; replaced by platform features, consumer-written elements, or browser-only creation on first show (Tooltip tip).
- Aria's `ngAccordionContent`/`ngTabContent` as the default content mechanism: rejected because an open-by-default panel would be empty for crawlers and no-JS users and pop in after hydration; kept as an opt-in lazy mode.
- Detecting replay with the internal `eventPhase === 101` constant to skip `preventDefault()`: not adopted as the default because the constant is not public; left OPEN FOR HUMAN.
- One entry point for the whole library: rejected because a consumer's `@defer` block could not split per plugin.

## Consequences

- Each spec carries a Rendering modes subsection (server output, pre-hydration rules, replay readiness, hydration boundary, behaviour inside `@defer` and `hydrate never`) and an SSR smoke test in the node-level layer.
- Breakpoint-gated plugins render `serverBreakpoint` and state their post-hydration change; the one accepted structural re-render is ResponsiveAccordionTabs on a non-default breakpoint.
- Persistent elements animate through State classes until prototype P11 shows whether `animate.enter` replays at hydration.
