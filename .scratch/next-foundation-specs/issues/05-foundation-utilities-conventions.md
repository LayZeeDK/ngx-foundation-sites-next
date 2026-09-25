# 05. Foundation core conventions and shared utilities

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

What cross-cutting conventions do all Foundation plugins share, and what do the shared utilities provide, so a later ticket can decide which of them the Angular library must replace and which the platform or Angular already covers?

Cover:

1. **Plugin lifecycle and option parsing** in `js/foundation.core.js`, `js/foundation.core.plugin.js`, `js/foundation.core.utils.js`: how `data-*` options become settings, the `init.zf.<plugin>` event, `_destroy`, and the `data-options` attribute.
2. **Triggers** (`js/foundation.util.triggers.js`): `data-open`, `data-close`, `data-toggle`, `data-toggle-focus`, `data-closable`, `data-resize`, `data-scroll`, `data-mutate`, and the throttled `resizeme.zf.trigger` / `scrollme.zf.trigger` / `mutateme.zf.trigger` events. Which plugins listen to which.
3. **MediaQuery** (`js/foundation.util.mediaQuery.js`): the breakpoint names, how they are read from CSS (the `meta.foundation-mq` trick), `atLeast`, `upTo`, `only`, `is`, the `changed.zf.mediaquery` event, and the Sass source of truth in `scss/util/_breakpoint.scss`.
4. **Motion UI** (`js/foundation.util.motion.js`, `docs/pages/motion-ui.md`): `animateIn` / `animateOut`, the class protocol (`.mui-enter`, `.mui-leave`, `-active`), and which plugins accept `animationIn` / `animationOut` options.
5. **Keyboard** (`js/foundation.util.keyboard.js`): the key map, `register`, `handleKey`, `findFocusable`, `trapFocus`, `releaseFocus`, and the per-plugin key registrations.
6. **Nest** (`js/foundation.util.nest.js`): what classes it adds to nested menus.
7. **Box**, **Touch**, **Timer**, **ImageLoader**: purpose and consumers.
8. **Accessibility guidance** in `docs/pages/accessibility.md` and the JavaScript docs in `docs/pages/javascript.md` and `docs/pages/javascript-utilities.md`.

Sources under `d:/projects/github/foundation/foundation-sites`. Online fallback: https://get.foundation/sites/docs/javascript.html and https://get.foundation/sites/docs/javascript-utilities.html.

## Deliverable

`research/foundation-utilities-conventions.md` with one section per item above, a table of plugin-to-utility dependencies, and a closing section listing each utility's obvious modern counterpart candidates (for example MediaQuery to CSS media queries, container queries, or CDK BreakpointObserver) without deciding between them. Cite file paths. Plain ASCII.

## Answer

Gist (all citations in the findings file):

- Every plugin is `class X extends Plugin` with `_setup(element, options)` doing `this.options = $.extend({}, X.defaults, this.$element.data(), options)`, so precedence is defaults < `data-*` attributes (jQuery-coerced, camelCased) < JS options. `data-options="k: v; ..."` is parsed by `Foundation.reflow` (`parseValue`: true/false/number/string) and passed as the JS options argument, so it beats individual `data-*`. Abide deep-merges; ResponsiveMenu/ResponsiveAccordionTabs have empty defaults and read a rule string instead.
- Lifecycle events are `init.zf.<kebab-name>` / `destroyed.zf.<kebab-name>` (from `hyphenate(className)`: `init.zf.off-canvas`), while plugin state events use camelCase namespaces (`closed.zf.offCanvas`). Two naming conventions coexist; the output-naming rule in the building-blocks ticket should pick one.
- Triggers: `data-open|close|toggle="id id2"` are document-delegated clicks that fire `open/close/toggle.zf.trigger` on each `#id` (non-bubbling for open/toggle, bubbling for close); valueless `data-close`/`data-toggle` bubble to an ancestor; `data-closable[=mui-class]` animates out or `fadeOut`s and fires `closed.zf`; `data-toggle-focus` fires toggle on focus and blur. Consumers of open/close/toggle: Dropdown, OffCanvas, Reveal, Toggler, Tooltip (close only). `closeme.zf.<dropdown|tooltip|reveal>` closes sibling panes keyed on `data-yeti-box`.
- `data-resize`/`data-scroll`/`data-mutate` work through a `data-events` attribute flip observed by one MutationObserver per element, created once at window load, producing `resizeme`/`scrollme`/`mutateme.zf.trigger`. Window resize is debounced 250 ms, scroll 10 ms. Elements added after load never get an observer.
- MediaQuery reads breakpoints from `.foundation-mq { font-family: 'small=0em&medium=40em&...' }` emitted by `foundation-global-styles` from `$breakpoints` (small 0, medium 640px, large 1024px, xlarge 1200px, xxlarge 1440px). API: `atLeast`, `upTo`, `only`, `is('medium down')`, `get`, `next`, `current`, `queries`; `changed.zf.mediaquery` on window with `[newSize, oldSize]`, driven by raw window resize. Ten plugins depend on it.
- Motion: `animateIn/Out` add `<class>` + `mui-enter|mui-leave`, then next frame `mui-enter-active|mui-leave-active`, and clean up on `transitionend`; no event, callback only. Options: Reveal `animationIn/Out`, Toggler and ResponsiveToggle `animate="in out"`, Orbit `animInFromRight/Left`, `animOutToRight/Left` + `useMUI` (the docs' "Orbit: data-animate" is wrong). `Move` is a rAF loop used only by Slider.
- Keyboard: keyCode map (TAB, ENTER, ESCAPE, SPACE, END, HOME, ARROW_*), `parseKey` adds `SHIFT_`/`CTRL_`/`ALT_`; `register(name, {KEY: 'command'} | {ltr, rtl})`, `handleKey` with `handled`/`unhandled` hooks and `event.zfIsKeyHandled` to stop nested plugins; `findFocusable` selector list; `trapFocus` is a static-list Tab wrap. Ten plugins register; Reveal always traps, Dropdown and OffCanvas trap behind `trapFocus: false`.
- Nest adds `role=menubar` (root and every submenu), `role=menuitem` on links, `role=none` on `li`, classes `is-<type>-submenu-parent`, `submenu is-<type>-submenu`, `is-submenu-item is-<type>-submenu-item`, `data-submenu`, plus `aria-haspopup` / `aria-label`, and for drilldown `aria-expanded` / `aria-hidden`. Types: accordion, dropdown, drilldown. The Sass for those three menus styles these classes.
- Box/Positionable: manual anchored positioning with a position-and-alignment fallback cycle (Dropdown, Tooltip); DropdownMenu uses `ImNotTouchingYou` to flip `opens-left/right/inner`. Touch: `swipeleft/right`, `tap`, `addTouch` mouse synthesis (Orbit, Slider, plus tap-to-close in Dropdown, DropdownMenu, Reveal, Tooltip). Timer: Orbit only. ImageLoader: Equalizer, Orbit, Tabs.
- `Foundation.util.throttle` has zero consumers. Accessibility docs: 4.5:1 / 3:1 contrast, every JS plugin has arrow-key support, ARIA attributes are added at runtime, focus outlines depend on the `what-input` library via `[data-whatinput='mouse']`.

Surprises: the hyphenated-vs-camelCase event namespace split; Nest putting `role=menubar` on nested submenus (not APG); `trapFocus` snapshotting the focusable list; the Motion UI docs mislabeling Orbit's option; Tooltip `showOn` defaults to `'small'` and treats the string `'all'` as a bypass of the MediaQuery check (`tooltip.js:133`, `:366`).

Open questions for later tickets (not settled from sources): which of the counterpart candidates in section 10 wins per utility, whether `popovertarget`/`commandfor` support at the Angular 22 / browser baseline is wide enough to replace the Triggers bus, and whether the breakpoint map is published to JS as a generated constant or as CSS custom properties.

Findings: ../research/foundation-utilities-conventions.md
