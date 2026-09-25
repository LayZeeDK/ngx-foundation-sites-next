---
status: accepted
---

# Animation through State classes, `animate.enter`/`animate.leave`, and keyframe-only Motion classes

The user ruled out `@angular/animations` and JavaScript-timed animation. Foundation animates four ways (jQuery `slideDown`, Motion UI's two-frame class protocol, CSS transitions awaited with `transitionend`, and jQuery fades; `research/foundation-utilities-conventions.md` 4), and `@starting-style`, `transition-behavior: allow-discrete`, and `interpolate-size` are all outside the browser target (`research/web-platform-features.md` 5 and 6). We decided: elements that stay in the DOM animate through a bound State class plus CSS, with the directive awaiting `transitionend`/`animationend` (plus a duration-plus-100 ms fallback timer, Material's mechanic) before emitting completion outputs or taking dependent DOM steps such as `dialog.close()`; elements the library inserts or removes use `animate.enter`/`animate.leave` host bindings; Foundation's own transitions are reused where its Sass has them (`.drilldown`, `.off-canvas`, `.tabs-content`), and where its JavaScript animated height with `slideDown` and its Sass has no rule, auto-height is the smallest documented custom rule: `grid-template-rows: 0fr -> 1fr` on a wrapper component (for AccordionMenu, which has no wrapper, on the parent `li` with rows `auto 0fr -> auto 1fr` and the submenu `ul` clipped), with `@supports` disabling the transition where unsupported; and Motion class inputs pass class names straight through, with the library shipping `nfs-*` `@keyframes` classes under Foundation's Motion UI names, because Motion UI's own transition classes need a two-frame protocol `animate.enter` does not perform and `animate.enter` with transitions needs `@starting-style` (`adev/src/content/guide/animations/enter-and-leave.md:28`), so Motion UI transition classes are not supported.

## Considered options

- Web Animations API (`element.animate`) driven from `(animate.enter)` callbacks: rejected: it is JavaScript-timed animation, which the user ruled out; if a prototype finds no other way to honour a consumer-supplied Motion UI transition class, that class is unsupported and the case is recorded OPEN FOR HUMAN.
- `max-height` to a measured value for auto-height: rejected because it needs a JavaScript measurement per open and jumps on content change; the grid trick is CSS-only and in target.
- Removing collapsed content from the DOM (`@if`) so `animate.leave` covers everything: rejected because collapsed panels must stay in server HTML with `inert` (Aria's contract) for SEO and hydration.

## Consequences

- `.accordion-content` is a wrapper component; `.tabs-panel` is one only if Aria's tab panel needs it (ADR 0001).
- Every spec names its State classes, keyframes, and completion event; `prefers-reduced-motion` shortens every library animation to 1 ms so completion events still fire, and `nfsAnimationsToken` disables them for tests.
- Reveal's exit animation runs before `close()`; Orbit's default is scroll snap (no Motion classes) pending the [Prototype: Orbit on CSS scroll snap](../issues/46-prototype-orbit-scroll-snap.md).
- The [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md) confirms the keyframe path in Chromium, Firefox, and WebKit.
