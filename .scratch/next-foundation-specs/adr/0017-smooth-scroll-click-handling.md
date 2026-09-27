---
status: accepted
---

# Smooth Scroll handles in-page link clicks with a host listener, and leaves the offset to CSS

Building-blocks 1.11 decision 5 and ADR 0011 say a directive on `<a>` elements declares no host `click` listener when it can be avoided, because Angular's dispatcher cancels the native navigation of an anchor carrying `jsaction` inside a dehydrated block. For Smooth Scroll the native path (same-document `href`s, `scroll-behavior: smooth` under a reduced-motion gate, `scroll-padding-top`) covers smoothness, offset, and reduced motion without script, but it cannot avoid three things: every native fragment jump fires `popstate`, which the Router 22.2 answers with a navigation whose scroll event restores a stored position or the top when `scrollPositionRestoration` is on (`packages/router/src/router_scroller.ts`, `statemanager/state_manager.ts`); it only focuses targets that are already focusable; and it gives Magellan no shared programmatic scroll. We decided that `NfsSmoothScroll` has one `click` host listener that scrolls with `scrollIntoView` (instant under `reducedMotion`), moves focus to the target, leaves the URL unchanged, and calls `preventDefault()` last and only when the click is not already cancelled; on a container host it yields to clicks a link-level listener (such as `RouterLink`) already cancelled, and on a link host it owns the click. The container placement keeps the `jsaction` off the `<a>`, so in a dehydrated block the native jump still happens at once; a link host inside a dehydrated block is cancelled by the dispatcher and scrolls when the block hydrates. The stopping point stays in CSS (`scroll-padding-top`, `scroll-margin-top`), not in `offset`/`threshold` inputs, so native and directive jumps land in the same place in every rendering mode.

## Considered options

- Listener-free: documentation plus the `nfs-smooth-scroll` mixin and a Router configuration. Kept as the documented recipe; rejected as the design because of the three gaps above.
- Foundation's JavaScript offset (`offset().top - threshold / 2 - offset`) as inputs: rejected; it exists only after hydration, reaches only the viewport, and diverges from native jumps.
- Writing the fragment with `replaceState` or `pushState`: rejected for now (Foundation never changed the URL, and a history write without the Router's `history.state` confuses its restoration); decided at triage: the URL stays unchanged; Magellan owns URL writing through `deepLinking`.

## Consequences

- Before hydration a click jumps natively and its replay calls `preventDefault()` during replay, which Angular logs; decided under the triage rule (building-blocks Part 4, Decided item 3): state first, `preventDefault()` last, accept the logged error.
- In-page links a Router application leaves outside the directive (or places in `hydrate never`) still reach the Router as `popstate` navigations; the spec documents the rule for applications that use both.
- Magellan composes `NfsSmoothScroll` through `hostDirectives` and reuses its click handling and `scrollTo`.
- 2026-09-27: which links count as in-page is decided in [ADR 0038](0038-smooth-scroll-same-document-links.md): only links the browser treats as same-document. "A link host inside a dehydrated block is cancelled by the dispatcher and scrolls when the block hydrates" holds for those links; a link host whose `href` is not in-page is cancelled the same way and its replayed click does nothing.
