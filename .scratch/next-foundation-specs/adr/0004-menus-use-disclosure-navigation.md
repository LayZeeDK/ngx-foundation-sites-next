---
status: accepted
---

# AccordionMenu, Drilldown, DropdownMenu and ResponsiveMenu use the APG disclosure navigation pattern, not ARIA menu, menubar, or tree roles, and share one Nested menu directive family

Foundation's Nest utility stamps `role="menubar"` on every list and `role="menuitem"` on every link, with `aria-expanded` on `role="none"` items that user agents ignore (`research/foundation-inventory-menus.md` 0.2, 7). The APG warns three times that site navigation should not use the menu or tree roles because they promise keyboard behaviour navigation does not need, and the Angular Aria guide says the same about `ngMenu` (`research/aria-apg-patterns.md` AccordionMenu, DropdownMenu; `research/angular-aria-inventory.md` 6.4). We decided that all four menu plugins implement the disclosure navigation pattern (native lists, `<button aria-expanded aria-controls>` parents or link-plus-button in the hybrid form, `aria-current="page"`, Escape and focus-out close for overlaying menus), that the roles are therefore identical in every mode, and that one shared directive family (`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`) emits Foundation's `is-<mode>-submenu*` classes from a mode signal so ResponsiveMenu switches behaviour without swapping directives.

## Considered options

- `@angular/aria/menu` (`ngMenuBar` + `ngMenu`) for DropdownMenu and `@angular/aria/tree` with `nav` for AccordionMenu: behaviourally close, but they apply the roles the APG rejects for navigation, the tree needs `ng-template` groups and `[parent]` inputs that break Foundation's nested `ul` markup, and Drilldown fits neither. Kept as an opt-in "command menu" variant ticket, outside the 22 specs.
- Three unrelated directive sets, one per plugin, with ResponsiveMenu re-instantiating them per breakpoint: rejected because Angular cannot swap directives on an element at runtime and the class vocabulary differs only by mode prefix.

## Consequences

- Foundation's `aria-label` copies on parent links, `role="none"` items, and `aria-multiselectable` on the root are dropped; parents that also navigate use the hybrid form (link plus toggle button).
- ResponsiveMenu's server render and breakpoint swap change classes and key handling, never roles, so no re-render is needed.
- Prototype P9 validates the family; the Nested menu utility gets its own spec.
