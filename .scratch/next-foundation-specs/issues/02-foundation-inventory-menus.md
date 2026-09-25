# 02. Foundation plugin inventory B: AccordionMenu, DrilldownMenu, DropdownMenu, ResponsiveMenu, ResponsiveToggle, OffCanvas

Type: research
Status: resolved
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

## Answer

Gist (Foundation 6.9.0, from `js/`, `scss/components/`, `docs/pages/` in the local clone):

- Nest.Feather is the shared nested-menu contract: root `ul[role=menubar]`, `li[role=none]`, `a[role=menuitem]`, parent `li.is-<type>-submenu-parent`, child `ul.submenu.is-<type>-submenu[data-submenu][role=menubar]`, nested `li.is-submenu-item.is-<type>-submenu-item`; `aria-haspopup`/`aria-label` on parent links except for accordions; drilldown also gets `aria-expanded` on the `li` and `aria-hidden` on the `ul`. Nest.Burn strips the classes but not the roles.
- AccordionMenu: options `parentLink=false`, `slideSpeed=250`, `submenuToggle=false`, `submenuToggleText='Toggle menu'`, `multiOpen=true`. State lives on the submenu `ul.is-active` plus `aria-hidden`; `aria-expanded`/`aria-controls`/`id` go on the parent `li` (role none) or the injected `button.submenu-toggle`; submenu `role=group`. Open/close is jQuery slideUp/slideDown. Events `down.zf.accordionMenu`, `up.zf.accordionMenu`. Keys: ENTER/SPACE toggle, RIGHT open, LEFT close, UP/DOWN traverse across open submenus, ESC hideAll. Public: hideAll, showAll, toggle, down, up.
- Drilldown: options `autoApplyClass=true`, `backButton` HTML, `backButtonPosition='top'`, `wrapper='<div></div>'`, `parentLink`, `closeOnClick`, `autoHeight`, `animateHeight`, `scrollTop` (+ `scrollTopElement`, `scrollTopOffset`, `animationDuration=500`, `animationEasing='swing'`). Wraps root in `div.is-drilldown` sized to the tallest menu; parent links lose `href` and get `tabindex=0`; submenus toggle `is-active`/`visible`/`invisible`/`is-closing` and `aria-hidden`, parent `li` `aria-expanded`; CSS transform transition drives every completion hook. Events `open`, `hide` (on the ul, bubbles), `close`, `closed`, `scrollme` `.zf.drilldown`. No public non-underscore methods except destroy. Keys: ENTER/SPACE open or back, RIGHT next, LEFT previous, UP/DOWN siblings, ESC close.
- DropdownMenu: options `disableHover=false`, `disableHoverOnTouch=true`, `autoclose=true`, `hoverDelay=50`, `clickOpen=false`, `closingTime=500`, `alignment='auto'`, `closeOnClick=true`, `closeOnClickInside=true`, `verticalClass='vertical'`, `rightClass='align-right'`, `forceFollow=true`. State: parent `li.is-active` + `data-is-click`, submenu `ul.js-dropdown-active`, side classes `opens-left/right/inner` chosen by Box collision against the viewport. Events `show.zf.dropdownMenu`, `hide.zf.dropdownMenu`. Adds no aria-expanded at all. Keyboard map is rebuilt per keydown from computed orientation and RTL.
- ResponsiveMenu: `data-responsive-menu="drilldown medium-dropdown"` = space-separated `<bp>-<plugin>` rules, bare plugin means `small`; keys `dropdown|drilldown|accordion` map to classes `dropdown|drilldown|accordion-menu`; the last matching rule wins; it destroys and re-creates the child plugin on `changed.zf.mediaquery`, passing `{}` (child still reads its own `data-*`). No options, no own events.
- ResponsiveToggle: `data-responsive-toggle="<id>"` on the bar, `[data-toggle]` descendants with that id or empty value are the togglers; options `hideFor='medium'`, `animate=false|"in out"`, read from the bar then the target. Pure jQuery show/hide by breakpoint; fires `toggled.zf.responsiveToggle` and `mutateme.zf.trigger`; no ARIA.
- OffCanvas: options `closeOnClick=true`, `contentOverlay=true`, `contentId=null`, `nested=null`, `contentScroll=true`, `transitionTime=null`, `transition='push'|'overlap'`, `forceTo=null`, `isRevealed=false`, `revealOn=null`, `inCanvasOn=null`, `autoFocus=true`, `revealClass='reveal-for-'`, `trapFocus=false`. Panel toggles `is-open`/`is-closed` + `aria-hidden`; content gets `is-open-<pos>` and `has-transition-<t> has-position-<p>`; overlay `js-off-canvas-overlay.is-visible.is-closable`; triggers get `aria-expanded`/`aria-controls`. Opened via the Triggers `open/close/toggle.zf.trigger` protocol. Events `opened` (fires at transition START), `openedEnd`, `close`, `closed` `.zf.offCanvas`; no `open` event. ESC closes and refocuses the trigger; no role/aria-modal.
- Sass that changes behaviour: `$drilldown-transition`, `$offcanvas-transition-length/timing` (JS waits on transitionend), `$offcanvas-sizes` maps (translate distance and push distance per breakpoint), `$*-arrows` flags, `$breakpoints` feeding MediaQuery via `meta.foundation-mq`.

Surprises:

- `aria-expanded` sits on `role="none"` `li`s (accordion, drilldown), not on the `menuitem`; DropdownMenu exposes no expanded state at all; no plugin does roving tabindex. None match the APG menubar pattern as-is.
- Doc bugs: Drilldown `backButtonPosition` JSDoc says `'left'` (code: `'top'|'bottom'`); OffCanvas `transition` JSDoc says `'detached'|'slide'` (code and docs: `'push'|'overlap'`); ResponsiveToggle error names `data-tab-bar`; ResponsiveMenu destroy unbinds `.zf.ResponsiveMenu` but bound `changed.zf.mediaquery` (leak); unknown `data-responsive-menu` plugin keys are not filtered and throw later.
- AccordionMenu `_destroy` leaves its ARIA attributes behind, so a ResponsiveMenu swap accordion -> dropdown keeps stale `aria-expanded`/`role=group`.
- Drilldown L91-96 sets attributes on `$link.children('[data-submenu]')`, an empty set (submenu is a sibling); the effective attrs come from L57 and Nest.

Open questions (not settled from sources, for the building-blocks / spec tickets):

- Whether the `role=menubar/menuitem` vocabulary is kept (Foundation's contract) or replaced by APG disclosure/tree/menubar patterns per plugin; the CSS only depends on classes and `aria-expanded`, so roles are free to change.
- Whether Drilldown's wrapper and generated back button become component-owned structure (the map prefers directives, but Drilldown creates DOM the consumer never writes).
- Whether OffCanvas maps to native `<dialog>`/`popover` + `inert` (covers ESC, focus return, scroll lock) with push kept as CSS on the content.

Findings: ../research/foundation-inventory-menus.md
