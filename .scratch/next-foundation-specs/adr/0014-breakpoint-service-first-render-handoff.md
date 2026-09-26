---
status: accepted
---

# Breakpoint service first-render handoff

ADR 0005 gives the server a Server breakpoint but leaves open what the client reports before it reads the viewport. Angular's hydration starts from the server's DOM, the rendering-modes contract forbids `matchMedia` outside render callbacks (ADR 0008), and a server may choose its Server breakpoint per request from client hints, which the client configuration cannot know. We decided that `NfsMediaQuery` reports the Server breakpoint on the client too until its first `afterNextRender` `earlyRead` callback, then switches to the live viewport there, where `ApplicationRef`'s synchronisation loop re-renders before the tick ends, so a client-rendered app never paints the Server breakpoint and a hydrating app starts from exactly the server's state. The server writes the Server breakpoint it used into `TransferState` (key `nfsServerBreakpoint`), and the client starts from that value, falling back to its own token when the page was not server-rendered.

## Considered options

- Read the viewport at construction on the client: rejected. It calls `matchMedia` during the hydration pass, against ADR 0008, and makes that pass render a state the server never sent, so every breakpoint-gated branch is rebuilt inside hydration itself.
- Gate each consuming directive separately until its own first render callback (a per-instance helper): rejected as a general helper. It adds a helper to every consumer for no visible gain, because the service-wide switch already happens before the first paint, and a block that hydrates later sees a rewrite either way. This rejection is for a general per-directive helper, not for a component whose swap removes focused nodes: ResponsiveAccordionTabs starts each instance from the Server breakpoint's mode and performs its own swap in its first `earlyRead`, the one exception, confirmed by the [Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md).
- Take the client's initial value from the client token only: rejected. A server that rendered `large` from client hints, or a server configuration that sets a desktop-first Server breakpoint the browser configuration lacks, would hydrate against a client assuming `small`.

## Consequences

- Every render callback in the `write`, `mixedReadWrite`, and `read` phases of the first pass, every later callback, and every replayed event sees live values; templates see them from the second pass of the first tick.
- A client-rendered app renders its breakpoint-gated views twice in its first tick; the first result is never painted.
- Server-rendered pages that use the service carry one extra `TransferState` entry, and so an `ng-state` script even when nothing else is transferred.
- Directives inside `@defer (hydrate on ...)` blocks hydrate with live values, so a block whose breakpoint differs from the Server breakpoint is rewritten or rebuilt at its own hydration; `hydrate never` blocks keep the Server breakpoint's state, which is why first-paint visibility stays in Foundation's CSS classes.
- ResponsiveAccordionTabs is the one exception: it starts each instance from the Server breakpoint's mode and swaps in its own first `earlyRead`, because its structural swap would otherwise drop focus or rebuild inside a deferred block's hydration.
- [ADR 0035](0035-responsive-menu-swap-commit.md) extends this exception to ResponsiveMenu: it too starts every instance from the Server breakpoint's mode, with the Nested menu root's own swap callback, not the component, committing the handoff.
