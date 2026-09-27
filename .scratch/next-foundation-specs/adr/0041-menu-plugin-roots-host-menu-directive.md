---
status: accepted
---

# Menu Plugin roots and submenus host the Menu directive

Every menu Plugin's root and submenu is Foundation's `ul.menu`, and the class rule gives `.menu` and its Variant classes to one directive ([ADR 0039](0039-directives-manage-every-foundation-class.md)). We decided that the Accordion Menu, Drilldown, and Dropdown Menu roots and `NfsSubmenu` host `NfsMenu` through `hostDirectives`, exposing its Variant inputs under their own names (a submenu only `align` and `iconPosition`, binding `nested` and `vertical` itself), and that Responsive Menu gets one `NfsMenu` through its three roots, because Angular 22.0 creates a directive reached several times through host directives once, with the input maps merged, and lets a template match win over host-directive matches, as measured with Angular 22.2.0 in [Spec: Menu](../issues/85-spec-menu.md).

## Considered options

- Each root binding `.menu` and declaring the Variant inputs itself: five copies of one input set.
- The consumer writing `nfsMenu` beside every root: two attributes for one element, and a forgotten one leaves the menu unstyled. Still allowed, and harmless.
- Hosting in behaviours that may sit on any element (Smooth Scroll, Magellan): rejected in their specs, because their containers need not be menus.

## Consequences

- A root reads the Menu's inputs through `inject(NfsMenu, {self: true})`; the Dropdown Menu's Base side reads `align()` instead of a static `align-right`.
- Every root exposes the Menu's inputs under their own names, because one input exposed under two names on one element is a compile-time and runtime error.
- Reopened if Angular drops host-directive de-duplication.
