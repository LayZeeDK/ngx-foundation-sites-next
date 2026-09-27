---
status: accepted
---

# Menus use disclosure navigation and one Nested menu directive family

Foundation's Nest utility stamps `role="menubar"` on every list and `role="menuitem"` on every link, with `aria-expanded` on `role="none"` items that user agents ignore (`research/foundation-inventory-menus.md` 0.2, 7). The APG warns three times that site navigation should not use the menu or tree roles because they promise keyboard behaviour navigation does not need, and the Angular Aria guide says the same about `ngMenu` (`research/aria-apg-patterns.md` AccordionMenu, DropdownMenu; `research/angular-aria-inventory.md` 6.4). We decided that all four menu plugins (AccordionMenu, Drilldown, DropdownMenu, ResponsiveMenu) implement the disclosure navigation pattern (native lists, `<button aria-expanded aria-controls>` parents or link-plus-button in the hybrid form, `aria-current="page"`, Escape and focus-out close for overlaying menus), that the roles are therefore identical in every mode, and that one shared directive family (`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`) emits Foundation's `is-<mode>-submenu*` classes from a mode signal so ResponsiveMenu switches behaviour without swapping directives.

## Considered options

- `@angular/aria/menu` (`ngMenuBar` + `ngMenu`) for DropdownMenu and `@angular/aria/tree` with `nav` for AccordionMenu: behaviourally close, but they apply the roles the APG rejects for navigation, the tree needs `ng-template` groups and `[parent]` inputs that break Foundation's nested `ul` markup, and Drilldown fits neither. Ruled out of scope for this effort (map, Out of scope); a future effort may add it as an opt-in variant.
- Three unrelated directive sets, one per plugin, with ResponsiveMenu re-instantiating them per breakpoint: rejected because Angular cannot swap directives on an element at runtime and the class vocabulary differs only by mode prefix.

## Consequences

- Foundation's `aria-label` copies on parent links, `role="none"` items, and `aria-multiselectable` on the root are dropped; parents that also navigate use the hybrid form (link plus toggle button).
- ResponsiveMenu's server render and breakpoint swap change classes and key handling, never roles, so no re-render is needed.
- 2026-09-27: a swap into or out of drilldown mode also adds or removes each submenu's `aria-labelledby`, the Drilldown level names ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)); roles still never change, so no re-render is needed.
- The [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) validates the family; the Nested menu utility gets its own spec.
- 2026-09-26 (consistency review): that prototype confirmed the family in Chromium, Firefox, and WebKit (no roles in any mode, axe clean in every mode, swaps change classes and keys only); the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) fixes the API, and [ADR 0033](0033-nested-menu-library-state-hooks.md) and [ADR 0035](0035-responsive-menu-swap-commit.md) refine it.
- 2026-09-27 ([Decide the `@angular/aria` fallback confirmation](../issues/75-evidence-aria-fallback-confirmation.md)): confirmed against `@angular/aria` 22.2 source. Corrections to the first considered option: the Angular Aria guide advises against `ngMenu` for site navigation but lists site navigation as a use for `ngTree`; `ng-template` groups are required by the tree only, and a menu needs `[submenu]` references; menubar submenu items are absent from server HTML only when placed in `ngMenuContent`. Added reasons: no menubar, menu, or tree item is a tab stop in server HTML; Aria's menu cancels Enter on a link item; tree child levels are never in server HTML and the tree forces multi-expansion. Aria's accordion is not used for the Accordion Menu either: every enabled trigger is a tab stop (not one roving stop), but its group listener handles keys from inside sections without checking the target, its arrows move among triggers only, and its Enter and Space toggle a section.
