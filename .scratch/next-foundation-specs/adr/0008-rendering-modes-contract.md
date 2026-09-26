---
status: accepted
---

# Rendering-modes contract for every directive

Context: the user requires every directive and component to support `@defer` with hydrate triggers, server-side rendering, prerendering, full and incremental hydration, and event replay, and in Angular 22.2 a plain `provideClientHydration()` already turns on incremental hydration and event replay. The facts behind this decision (what hydration compares, which events replay, where `preventDefault()` throws, what `ngSkipHydration` and Aria's `DeferredContent` do, why generated ids differ) are in `research/angular-rendering-modes.md`, from the [Angular 22.2 @defer, SSR, prerendering, hydration, and event replay for DOM-touching directives](../issues/38-angular-rendering-modes.md) ticket.

Decision: first-paint state is always a host binding on signal state (open panels included, since Foundation's CSS never shows `.accordion-content`); panel content is projected rather than placed in Aria's `ng-template` directives by default; every browser-only read, write, observer, timer, and focus call lives in `afterNextRender`/`afterRenderEffect`, with timers started outside the Angular zone; primary activation is a `click`/`keydown` host listener whose handler changes state before any `preventDefault()`; hover opening uses non-replayed `pointerenter`; a composite widget and a trigger with its target share one hydration boundary; deep links need consumer ids; library templates contain no `@defer` while each plugin is its own entry point so consumers can defer per plugin; and the library never uses `ngSkipHydration` or Shadow DOM encapsulation.

Why: a directive has no escape hatch (`ngSkipHydration` works only on component hosts), so it must be hydration-clean by construction; server HTML is the consumer's markup plus host bindings, which keeps crawlers, no-JS users, and dehydrated blocks correct; and replay reaches only template and `host` listeners on native events, so activation must live there.

## Considered options

- Generating structure at construction (overlays, tips, back buttons) as Foundation does: rejected, it is the mismatch the hydration guide names; replaced by platform features, consumer-written elements, or browser-only creation on first show (Tooltip tip).
- Aria's `ngAccordionContent`/`ngTabContent` as the default content mechanism: rejected because an open-by-default panel would be empty for crawlers and no-JS users and pop in after hydration; kept as an opt-in lazy mode.
- Detecting replay with the internal `eventPhase === 101` constant to skip `preventDefault()`: not adopted as the default because the constant is not public; decided under the triage rule: not adopted; state first, `preventDefault()` last.
- One entry point for the whole library: rejected because a consumer's `@defer` block could not split per plugin.

## Consequences

- Each spec carries a Rendering modes subsection (server output, pre-hydration rules, replay readiness, hydration boundary, behaviour inside `@defer` and `hydrate never`) and an SSR smoke test in the node-level layer.
- Breakpoint-gated plugins render `serverBreakpoint` and state their post-hydration change; the one accepted structural re-render is ResponsiveAccordionTabs on a non-default breakpoint. A breakpoint-gated hidden or inert state that Foundation's CSS shows at a larger breakpoint is expressed in Foundation's visibility and breakpoint classes (or, only where they cannot express it, a documented rule built with Foundation's breakpoint mixins), never as a server-bound `hidden` or `inert`.
- Persistent elements animate through State classes only, because `animate.enter` plays at hydration in every rendering mode (the [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)).
