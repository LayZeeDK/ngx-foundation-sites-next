---
status: accepted
---

# ResponsiveAccordionTabs starts every instance from the Server breakpoint's mode

ADR 0014 has the Breakpoint service report the Server breakpoint until its first render callback and then the live viewport, and it rejects gating each consuming directive until its own first render callback as a helper with no visible gain. For ResponsiveAccordionTabs the gain is visible: a Mode swap removes the nodes that hold focus, and an instance first rendered after the service went live (a `@defer (hydrate on ...)` block, a plain `@defer` block, a route change) would otherwise render the live mode at its first render, so a deferred block's server HTML is rebuilt during its own hydration and a title focused before that hydration loses focus to `body` ([Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md), cases 19 to 21). We decided that the component starts every instance from the mode its rules give at the Server breakpoint and swaps to the viewport's mode in its own first `afterRenderEffect` `earlyRead`, the same callback that handles resizes and captures focus. The Breakpoint service therefore exposes the breakpoint it started from (a read-only `serverBreakpoint`) and accepts an optional breakpoint argument in `resolve(rules, breakpoint?)`.

## Considered options

- Start from the service's `current` (ADR 0014 as written): rejected for this component; measured in three engines, it rebuilds deferred blocks at hydration (4 components hydrated instead of 7) and drops focus.
- A general per-consumer gating helper in the service: still rejected, as ADR 0014 says; other consumers change classes on the same nodes, so their focus survives a first-render change.

## Consequences

- A client-created instance renders twice in its first tick; the first result is never painted (prototype case 4).
- ADR 0014's second considered option gains a note that its rejection covers a general helper, not a component whose first-render swap removes focused nodes.
- The Breakpoint service spec's consumer rule "a swap at the first render never moves focus" is replaced by "the first-render swap moves focus like any other swap", because server-rendered controls can hold focus before hydration (prototype case 15).
