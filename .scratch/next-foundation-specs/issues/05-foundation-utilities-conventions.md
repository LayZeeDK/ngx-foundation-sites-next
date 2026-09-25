# 05. Foundation core conventions and shared utilities

Type: research
Status: open
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
