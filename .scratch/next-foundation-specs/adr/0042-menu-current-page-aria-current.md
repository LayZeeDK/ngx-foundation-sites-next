---
status: accepted
---

# A menu's current page is its link's `aria-current`, styled with Foundation's active look

Foundation marks the current page with `.is-active` on its `li`, a visual state assistive technology never hears, and the class rule forbids consumers to write it, even as an input value such as `routerLinkActive="is-active"` ([ADR 0039](0039-directives-manage-every-foundation-class.md)). We decided that every menu marks the current page with `aria-current` on its link, and that the `nfs-menu` Library mixin gives that link Foundation's active look through Foundation's own `menu-state-active` mixin at the specificity of Foundation's `.menu .is-active > a`, so one attribute gives the announcement and the look, and the Router writes it through `RouterLinkActive`'s `ariaCurrentWhenActive` ([Spec: Menu](../issues/85-spec-menu.md)).

## Considered options

- A `current` input on an item directive that binds `.is-active`: a second source beside `aria-current`, and a directive on every plain `li`.
- A link directive with Material's `activated` input, binding a class and `aria-current`: a directive on every link for a state the attribute already holds.

## Consequences

- `.is-active` stays a State class the Nested menu binds for open parents and submenus, so the current page and the Dropdown Menu's open parent, which Foundation marks alike, are told apart.
- Every menu Plugin's consumer includes `nfs-menu`.
- A copied `is-active` on a leaf item is reported in development builds.
