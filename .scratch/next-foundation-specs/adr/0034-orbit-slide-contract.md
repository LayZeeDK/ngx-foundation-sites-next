---
status: accepted
---

# Orbit slides bind their own tab panel contract instead of hosting Aria's `TabPanel`

[ADR 0025](0025-orbit-live-inert.md) decided that Orbit slides are `inert` only once the directives are live, and gave the mechanism as `NfsOrbitSlide` overriding the `inert` binding of the Aria `TabPanel` it hosts. The [Prototype: Orbit keyboard scrolling and hydration details](../issues/65-prototype-orbit-keyboard-hydration.md) measured that override losing in Chromium, Firefox, and WebKit: the server HTML kept Aria's `inert="true"` on every unselected slide, with a host-directive wrapper and with a plain template binding alike, while the same override pattern held for the bullets' `tabindex` over Aria's `Tab`. The Angular and Aria sources explain it: an attribute binding writes only when its own value changes, so a wrapper's binding, applied after its host directive's in each pass, holds only while Aria's value stays constant or equal to it; Aria's panel renders no `inert` in the first server pass, before the bullets register, and turns it on in a later pass in which the wrapper's value is unchanged, so only Aria's binding writes. We decided that `NfsOrbitSlide` hosts no Aria directive and binds the small tab panel contract itself: `role="tabpanel"`, `id`, `tabindex` (`0` on the selected slide, `-1` on the others), `aria-labelledby` to the bullet of equal `value`, and `inert` from the Orbit's own live and selected state, the only `inert` binding on the element. The bullets keep composing Aria's `Tabs`, `TabList`, and `Tab`. ADR 0025's decision stands; this replaces its mechanism.

## Considered options

- Keep hosting `TabPanel` and override its `inert` with a wrapper host binding or a template binding: rejected, measured failing in three engines, for the reason above.
- Keep hosting `TabPanel` and correct `inert` with a `Renderer2` write in a render callback: rejected, render callbacks never run on the server, so the server HTML still carries Aria's `inert`, and any later change of Aria's value overwrites the write.
- Keep hosting `TabPanel` but give it its `value` only once live, so Aria finds no tab and renders no `inert` before then: rejected, a host-directive wrapper cannot set Aria's input from code (the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md)), and before hydration the slide would lose `aria-labelledby` and its bullet `aria-controls`.
- Register the slides in Aria's panel collection: rejected, it is an underscore member, not a public API.
- Drop Aria for the bullets as well: rejected, the bullets' overriding bindings hold, and Aria gives them roving focus, the keys, `aria-selected`, and right-to-left arrows.

## Consequences

- Aria's `Tab` finds its panel only among registered `TabPanel`s, so it renders no `aria-controls`; `NfsOrbitBullet` binds `aria-controls` to its slide's id. That override holds because Aria's value is absent from the first pass on.
- In development builds each Aria `Tab` warns once that no `ngTabPanel` has its value, one `console.warn` per bullet, in place of the per-slide `ngTabContent` warning the hosted `TabPanel` gave; production builds are silent.
- ADR 0025's second consequence (the wrapper's `inert` must equal Aria's whenever both apply) no longer applies, because the slide has one `inert` binding; its first and third consequences stand, and server-render tests now also assert the slide and bullet id pairs.
- The slide's generated id takes the library prefix `nfs-orbit-slide-` instead of Aria's `ng-tabpanel-`.
- The rule behind the failure is general: a Foundation-classed wrapper can override an Aria host binding only when Aria's value never changes after the wrapper's last write, or equals the wrapper's whenever it changes (the Tabs and Orbit bullet `tabindex` overrides meet it). An override that must differ from an Aria value that can still change is not a binding; the element does without that Aria directive.
