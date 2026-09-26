---
status: accepted
---

# Orbit slides are `inert` only once the directives are live

Aria's `TabPanel` renders `inert` on every unselected panel, server HTML included, and building-blocks 1.10 hides content that stays in the DOM with `inert`. Orbit's slides are not hidden, though: they sit side by side in a native scroll-snap container, so before hydration, without JavaScript, or inside `@defer (hydrate never)` a user can scroll to any of them, and a slide that is visible but `inert` shows sighted users content that assistive technology and the pointer cannot reach (WCAG 1.3.1), with links that do nothing. We decided that `NfsOrbitSlide` overrides Aria's `inert` binding and applies `inert` to unselected slides only from the Orbit's first render callback on, so the server HTML hides no slide and the Dehydrated state is a usable scroll-snap gallery; once live, the IntersectionObserver keeps whatever slide the user scrolls to selected and not `inert`, which gives the APG's "hidden, not off-screen" rule for every slide out of view.

## Considered options

- Keep Aria's server-rendered `inert` (the scroll-snap prototype's state): rejected, because the no-JavaScript and `hydrate never` residue then has visible slides that are unreachable for assistive technology and unclickable.
- Stop native scrolling before hydration (a live class switching `overflow-x`), so only the first slide is reachable until the directives run: rejected, because it takes every other slide away from no-JavaScript users and adds a class that differs between server and client for no gain over this option.

## Consequences

- Between first paint and hydration, assistive technology can reach slides that are out of view; the attribute change at hydration moves nothing on screen, so there is no flash.
- The wrapper's `inert` binding must equal Aria's whenever both apply (after the first render callback), because two attribute bindings on one element are not merged; the spec defines it that way.
- Server-render tests assert that no slide carries `inert`; browser-level tests assert that unselected slides do after the first render callback.
- 2026-09-26: the second consequence above (the wrapper's `inert` binding equalling Aria's) was measured not to hold: the [Prototype: Orbit keyboard scrolling and hydration details](../issues/65-prototype-orbit-keyboard-hydration.md) found Aria `TabPanel`'s own `[attr.inert]` binding wins in server HTML, because two attribute bindings on one element are not merged and Aria's runs too. Mechanism amended by [ADR 0034](0034-orbit-slide-contract.md): the slide binds its own tab panel contract instead of hosting Aria's `TabPanel`, so the second consequence no longer applies; the decision (slides `inert` only once live) stands.
