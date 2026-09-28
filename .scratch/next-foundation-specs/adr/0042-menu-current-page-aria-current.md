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
- 2026-09-28 ([Spec: Pagination](../issues/87-spec-pagination.md)): a pagination marks its current page the same way, with `aria-current` on the page's link (or a pager's button), which the `nfs-pagination` Library mixin styles with Foundation's `pagination-item-current`, so Foundation's `.current` is never bound; its disabled items follow suit, a placeholder link with `aria-disabled="true"` or a disabled button styled with Foundation's `pagination-item-disabled`, so `.disabled` is never bound either. Foundation's `$pagination-mobile-current-item`, which selects `li.current`, has no effect until `:has()` is in the Browser target.
- 2026-09-28 ([Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md)): a breadcrumb trail marks its current page the same way, with `aria-current="page"` on the page's link, which the `nfs-breadcrumbs` Library mixin colours `$breadcrumbs-item-color-current` (Foundation's colour for a current step's text), or on its `li` when the current page is written as text, which Foundation's item colour already styles; `RouterLinkActive` needs `{exact: true}` on every step, and a development check reports more than one current step. Unlike the Pagination's, a disabled step is text, not a control, so `li[nfsBreadcrumbsItem]` binds Foundation's `.disabled` from its `disabled` input.
