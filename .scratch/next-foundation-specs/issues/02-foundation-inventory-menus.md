# 02. Foundation plugin inventory B: AccordionMenu, DrilldownMenu, DropdownMenu, ResponsiveMenu, ResponsiveToggle, OffCanvas

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

What exactly do Foundation's AccordionMenu, Drilldown, DropdownMenu, ResponsiveMenu, ResponsiveToggle, and OffCanvas plugins do? These all build on Foundation's Menu markup (`ul.menu`) and the Nest utility, and three of them are switched by breakpoint. Capture the nested-menu markup contract precisely, including `is-submenu`, `is-submenu-item`, `is-accordion-submenu`, `is-dropdown-submenu`, `is-drilldown-submenu`, and the `data-responsive-menu` and `data-responsive-toggle` syntax.

Sources: `d:/projects/github/foundation/foundation-sites/js/foundation.{accordionMenu,drilldown,dropdownMenu,responsiveMenu,responsiveToggle,offcanvas}.js`, `d:/projects/github/foundation/foundation-sites/js/foundation.util.nest.js`, and `d:/projects/github/foundation/foundation-sites/docs/pages/{accordion-menu,drilldown-menu,dropdown-menu,responsive-navigation,off-canvas,menu,top-bar}.md`. Online fallback: https://get.foundation/sites/docs/<name>.html.
## Deliverable

`research/foundation-inventory-menus.md` with one section per plugin containing:

1. **Purpose** in one or two sentences, in Foundation's own words.
2. **Markup contract**: the elements, CSS classes, and state classes (`is-active`, `is-open`, and so on) the plugin expects and toggles. Quote the docs example markup.
3. **Options**: every `data-*` option with its JS default, type, and meaning, from the plugin source (`js/foundation.<name>.js` under `d:/projects/github/foundation/foundation-sites`) cross-checked against `docs/pages/<name>.md`.
4. **Events**: every `*.zf.<plugin>` event the plugin fires or listens for, and what triggers it.
5. **Public methods** and what they do.
6. **Keyboard and ARIA behaviour** the plugin implements today (what it sets, what keys it handles, via `foundation.util.keyboard.js` registrations).
7. **Dependencies on utilities** (MediaQuery, Motion, Triggers, Keyboard, Nest, Box, Touch, Timer, ImageLoader) and on other plugins.
8. **Sass configuration** that shapes behaviour (breakpoint maps, animation settings) as opposed to pure theming.
9. **Behaviour that only jQuery makes easy** and might not carry over (for a later ticket to decide).

Cite the file path and, where practical, the line or function for each claim. Plain ASCII. Do not read this repo's `packages/ngx-foundation-sites/COMPONENT_BUILDING_BLOCKS.md` or the existing Angular implementations: the findings must come from Foundation's own sources.
