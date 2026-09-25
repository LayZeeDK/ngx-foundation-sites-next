# Foundation plugin inventory B: menus and off-canvas

Ticket: `../issues/02-foundation-inventory-menus.md`
Foundation version inspected: 6.9.0 (`FS/package.json` `"version": "6.9.0"`).

`FS` below means `d:/projects/github/foundation/foundation-sites`. Line numbers are from the
files as read on 2026-09-25. Everything here comes from Foundation's plugin sources, Sass, and
`docs/pages`; nothing from this repo's Angular code.

Plugins covered: AccordionMenu, Drilldown, DropdownMenu, ResponsiveMenu, ResponsiveToggle,
OffCanvas. The first three share the Menu markup and the Nest utility, so the shared contract is
written once in section 0 and each plugin section only adds what it changes.

---

## 0. Shared contract: Menu markup, Nest, option parsing, Plugin lifecycle

### 0.1 Menu markup (CSS only, no plugin)

`FS/docs/pages/menu.md`:

- L26: "All versions of the menu are a `<ul>` filled with `<li>` elements containing links. By
  default, a Menu is horizontally oriented."
- L125: `.vertical` switches orientation. L204: "Add a new menu inside the `<li>` of a Menu and
  add the class `.nested` to create a nested menu." L235: "Add the class `.is-active` to any
  `<li>` to create an active state." L257: `.menu-text` for link-less items.
- Responsive orientation classes `.[bp]-horizontal` / `.[bp]-vertical` / `.[bp]-expanded` /
  `.[bp]-simple` for every breakpoint except the zero breakpoint:
  `FS/scss/components/_menu.scss` L407-428 (`-zf-each-breakpoint($small: false)`).
- `.menu.nested` gets `margin-left: $menu-nested-margin` (`_menu.scss` L432-434, mixin
  `menu-nested` L221-234). `.menu.align-right .nested` flips the margin (L495-500).
- `.menu .is-active > a` is the active style (`_menu.scss` L477-479); the legacy `.active > a`
  alias is kept while `$menu-state-back-compat: true` (L482-486).

Docs example (`menu.md` L215-228):

```html
<ul class="vertical menu">
  <li>
    <a href="#">One</a>
    <ul class="nested vertical menu">
      <li><a href="#">One</a></li>
      <li><a href="#">Two</a></li>
    </ul>
  </li>
  <li><a href="#">Two</a></li>
</ul>
```

### 0.2 Nest utility: what `Nest.Feather(menu, type)` adds at runtime

`FS/js/foundation.util.nest.js` L4-50. Called by AccordionMenu (`type = 'accordion'`),
Drilldown (`'drilldown'`), DropdownMenu (`'dropdown'`).

| Target | Attribute / class added | Line | Notes |
| --- | --- | --- | --- |
| root `ul` | `role="menubar"` | L5 | every type |
| every `a` inside | `role="menuitem"` | L6 | every type |
| every `li` inside | `role="none"` | L8 | every type |
| `li` that has a child `ul` | class `is-<type>-submenu-parent` | L19 | `is-accordion-submenu-parent`, `is-drilldown-submenu-parent`, `is-dropdown-submenu-parent` |
| first `a` of such `li` | `aria-haspopup="true"`, `aria-label` (existing or link text) | L21-25 | only when `type !== 'accordion'` (L12, "Accordions handle their own ARIA attributes") |
| such `li` | `aria-expanded="false"` | L29-31 | drilldown only |
| child `ul` | classes `submenu is-<type>-submenu`, `data-submenu=""`, `role="menubar"` | L33-38 | every type; the `role="menubar"` is later overwritten to `group` by AccordionMenu and Drilldown, kept by DropdownMenu |
| child `ul` | `aria-hidden="true"` | L39-41 | drilldown only |
| `li` whose parent `ul` has `[data-submenu]` | classes `is-submenu-item is-<type>-submenu-item` | L44-46 | |

`Nest.Burn(menu, type)` (L52-63) removes `is-<type>-submenu`, `is-<type>-submenu-item`,
`is-<type>-submenu-parent`, `is-submenu-item`, `submenu`, `is-active`, the `data-submenu`
attribute, and inline `display` from `>li, > li > ul, .menu, .menu > li, [data-submenu] > li`.
It does NOT remove the `role` attributes Feather added, so a ResponsiveMenu swap leaves
`role="menubar"` / `menuitem` / `none` in place (they are re-applied identically anyway).

So the full nested-menu class vocabulary is:

- `submenu` (generic), `is-submenu-item` (generic)
- `is-accordion-submenu`, `is-accordion-submenu-parent`, `is-accordion-submenu-item`
- `is-drilldown-submenu`, `is-drilldown-submenu-parent`, `is-drilldown-submenu-item`
- `is-dropdown-submenu`, `is-dropdown-submenu-parent`, `is-dropdown-submenu-item`
- `is-submenu-parent-item` (only on the JS-cloned parent-link `li`, see `parentLink` options)

`docs/pages/top-bar.md` L482-484 shows the pre-Feathered form a consumer may hand-write:
`<li class="has-submenu">` with `<ul class="submenu menu vertical" data-submenu>`. Note
`has-submenu` is not read by any 6.9 JS (only `is-<type>-submenu-parent` is); the dropdown-menu
docs (L165-182) instead recommend hand-writing `is-dropdown-submenu-parent` to avoid FOUC.

### 0.3 Option parsing (applies to every plugin)

- Every plugin builds `this.options = $.extend({}, Defaults, this.$element.data(), options)`
  (`foundation.accordionMenu.js` L25, `foundation.drilldown.js` L26,
  `foundation.dropdownMenu.js` L30, `foundation.responsiveToggle.js` L178 (file 2 in the
  concatenated read; standalone line 25), `foundation.offcanvas.js` L29). jQuery `.data()`
  camelCases every `data-*` attribute, so `data-multi-open="false"` becomes `multiOpen: false`,
  `data-hide-for="large"` becomes `hideFor: 'large'`, and so on. jQuery also converts `"true"`,
  `"false"`, numbers and JSON.
- `data-options="key:value;key2:value2"` is parsed in `Foundation.reflow`
  (`FS/js/foundation.core.js` L161-166) with `parseValue` (L323-328: `'true'`/`'false'`
  to booleans, numeric strings to floats, otherwise string). The off-canvas docs use this form
  (`data-options="inCanvasOn:large;"`, `off-canvas.md` L363).
- ResponsiveMenu takes no options of its own (`ResponsiveMenu.defaults = {}`,
  `foundation.responsiveMenu.js` L151) and passes `{}` to the plugin it instantiates (L138);
  the child plugin still reads `this.$element.data()`, so `data-*` options for
  AccordionMenu / Drilldown / DropdownMenu on the same `ul` take effect.

### 0.4 Plugin base class lifecycle

`FS/js/foundation.core.plugin.js`:

- Constructor calls `_setup`, assigns `uuid`, sets `data-<plugin-name>` to the uuid if the
  attribute is empty, stores the instance under `.data('zfPlugin')`, fires
  `init.zf.<pluginName>` (L8-20). Plugin name is the hyphenated class name (L41-47):
  `accordion-menu`, `drilldown`, `dropdown-menu`, `responsive-menu`, `responsive-toggle`,
  `off-canvas`. Those are therefore the `data-*` hooks `Foundation.reflow` looks for
  (`foundation.core.js` L151) and the ones registered in `FS/js/entries/foundation.js` L63-73.
- `destroy()` calls `_destroy`, removes the `data-<plugin-name>` attribute and `zfPlugin` data,
  fires `destroyed.zf.<pluginName>`, then nulls every own property (L22-36).

Event namespace note: the `init`/`destroyed` events use the hyphenated name
(`init.zf.accordion-menu`), while plugin-specific events use the camelCase name
(`down.zf.accordionMenu`). Both appear below.

### 0.5 Keyboard utility

`FS/js/foundation.util.keyboard.js`:

- `keyCodes` map L12-23: TAB, ENTER, ESCAPE, SPACE, END, HOME, ARROW_LEFT/UP/RIGHT/DOWN. Other
  keys become the upper-cased character. Modifiers prefix `SHIFT_`, `CTRL_`, `ALT_` (L62-76).
- `Keyboard.register(component, map)` (L151-153) stores a key-to-command map per component;
  `Keyboard.handleKey(event, component, functions)` (L95-135) looks the command up, runs
  `functions[command]`, sets `event.zfIsKeyHandled = true`, then calls `functions.handled(rv)`
  (or `functions.unhandled()` when no command matched). Once `zfIsKeyHandled` is set, no other
  Foundation plugin handles the same keydown (L105).
- `trapFocus($el)` (L162-177): on TAB from the last focusable and SHIFT_TAB from the first,
  wraps. `releaseFocus` (L182-184) unbinds. `findFocusable` (L28-60) is the selector list used.

### 0.6 MediaQuery, Triggers, Motion, Box, Touch (used by the plugins below)

- MediaQuery (`FS/js/foundation.util.mediaQuery.js`): breakpoints are read from the
  `font-family` of a `meta.foundation-mq` element that Foundation's CSS fills from the Sass
  `$breakpoints` map (L89-109). `atLeast(size)` (L133-141) is a `matchMedia` min-width test.
  `_watcher` (L282-294) listens to `resize.zf.trigger` on window and fires
  `changed.zf.mediaquery` with `[newSize, oldSize]` when the named breakpoint changes.
- Triggers (`FS/js/foundation.util.triggers.js`): document-level delegated click handlers for
  `[data-open]`, `[data-close]`, `[data-toggle]` (L270-286). `[data-open="id"]` calls
  `triggerHandler('open.zf.trigger', [el])` on `#id` (no bubbling); `[data-close="id"]` uses
  `trigger('close.zf.trigger', [el])` (bubbles); a `[data-close]` with an empty value triggers
  `close.zf.trigger` on itself so it bubbles up to the nearest listening ancestor (L214-248).
  `[data-toggle]` with a value uses `triggerHandler('toggle.zf.trigger')`; empty value bubbles.
  A MutationObserver on `[data-resize], [data-scroll], [data-mutate]` elements fires
  `mutateme.zf.trigger` on the closest `[data-mutate]` for `childList` changes and inline
  `style` attribute changes (L380-421). Triggers are installed once on window load (L443-457).
- Motion (`FS/js/foundation.util.motion.js`): `animateIn/animateOut(el, cssClass, cb)` add
  `mui-enter`/`mui-leave` plus `-active` classes across two animation frames, `show()`/`hide()`
  the element, and call `cb` on `transitionend` (L349-436). Motion UI class names are consumer
  supplied strings.
- Box (`FS/js/foundation.util.box.js`): `ImNotTouchingYou(el, parent, lrOnly, tbOnly,
  ignoreBottom)` returns true when `OverlapArea === 0` (L18-20); with `parent` null it
  measures against `document.body` + scroll offset (L33-38). `GetDimensions` (L63-100)
  returns width/height/offset via `getBoundingClientRect`.
- Touch (`FS/js/foundation.util.touch.js`): defines jQuery special events `tap`, `swipe`,
  `swipeleft/right` (L23, L53-54, L92-97). A `tap` is a touchend without movement (L21-25).

---

## 1. AccordionMenu

Source: `FS/js/foundation.accordionMenu.js`. Docs: `FS/docs/pages/accordion-menu.md`.
Sass: `FS/scss/components/_accordion-menu.scss`.

### 1.1 Purpose

"Change a basic vertical Menu into a expandable accordion menu with the Accordion Menu
plugin." (`accordion-menu.md` L5). "Any `<a>` will behave like a standard link. However, any
`<a>` paired with a nested `<ul>` menu will then slide that sub-menu up and down when clicked
on." (L13).

### 1.2 Markup contract

Docs example (`accordion-menu.md` L31-40):

```html
<ul class="vertical menu accordion-menu" data-accordion-menu>
  <li>
    <a href="#">Item 1</a>
    <ul class="menu vertical nested">
      <li><a href="#">Item 1A</a></li>
      <li><a href="#">Item 1B</a></li>
    </ul>
  </li>
  <li><a href="#">Item 2</a></li>
</ul>
```

Submenu-toggle variant (L77-102): same, plus `data-submenu-toggle="true"`; the docs say the
`accordion-menu` class is required "for this to work correctly" (L74) because the toggle
button styles live under `.accordion-menu` (`_accordion-menu.scss` L134-173).

Pre-open: "add the class `.is-active` to that sub-menu" (L22), i.e. on the nested `ul`, not on
the `li`.

What the plugin adds or toggles (all in `foundation.accordionMenu.js`):

| Element | Added at init | Toggled | Line |
| --- | --- | --- | --- |
| root `ul` | Nest classes/roles (0.2), `aria-multiselectable="<multiOpen>"` | | L48, L53-55 |
| submenu `ul[data-submenu]` not `.is-active` | `slideUp(0)` (inline `display: none`) | | L52 |
| parent `li.is-accordion-submenu-parent` (no toggle) | `id`, `aria-controls="<subId>"`, `aria-expanded` | `aria-expanded` | L74-78, L250, L280 |
| parent `li` (submenuToggle) | class `has-submenu-toggle`; a `<button id class="submenu-toggle" aria-controls aria-expanded title><span class="submenu-toggle-text">` inserted after the `a` | button `aria-expanded` | L70-72, L247, L277 |
| submenu `ul` | `aria-labelledby="<linkId>"`, `aria-hidden`, `role="group"` (overrides Nest's `menubar`), `id` | class `is-active`, `aria-hidden`, jQuery `slideDown`/`slideUp` inline styles | L80-85, L242-244, L253, L271-274, L283 |
| parentLink clone | `<li data-is-parent-link class="is-submenu-parent-item is-submenu-item is-accordion-submenu-item">` wrapping a clone of the parent `a`, prepended to the submenu | | L65-68 |

Sass state hooks: `.is-accordion-submenu-parent[aria-expanded='true'] > a::after` rotates the
arrow (`_accordion-menu.scss` L116-119); `.submenu-toggle[aria-expanded='true']::after` flips
it (L166-169). The arrow itself is drawn on
`.is-accordion-submenu-parent:not(.has-submenu-toggle) > a::after` (L54-64). Open/closed
visibility is NOT a CSS class: it is jQuery slide animation setting inline `display`/`height`.
`.is-active` on the submenu carries no style of its own in `_accordion-menu.scss`; it is state
bookkeeping plus the initial-open marker.

### 1.3 Options

`AccordionMenu.defaults` L310-344, merged L25.

| Option (`data-*`) | Type | Default | Meaning (source) |
| --- | --- | --- | --- |
| `parentLink` (`data-parent-link`) | boolean | `false` | Clone the parent `a` as the first item of its submenu (L65-68, L317). |
| `slideSpeed` (`data-slide-speed`) | number (ms) | `250` | jQuery slide duration for open/close (L253, L283, L324). |
| `submenuToggle` (`data-submenu-toggle`) | boolean | `false` | Insert a separate toggle `button` so the parent `a` stays a real link (L70-72, L330). The docs call it out on L71-74. |
| `submenuToggleText` (`data-submenu-toggle-text`) | string | `'Toggle menu'` | `title` and visually-hidden text of the toggle button (L72, L336). |
| `multiOpen` (`data-multi-open`) | boolean | `true` | Allow several submenus open at once; `false` closes every active submenu outside the target's branch on `down()` (L230-240, L343). Mirrored to `aria-multiselectable` (L54). |

The docs page documents `data-submenu-toggle` only; the rest are source-only.

### 1.4 Events

Fired (all on the root element, with `[$target]` submenu as extra arg):

| Event | When | Line |
| --- | --- | --- |
| `init.zf.accordion-menu` | constructor (0.4) | plugin.js L19 |
| `down.zf.accordionMenu` | after `slideDown` completes in `down()` | L258 |
| `up.zf.accordionMenu` | after `slideUp` completes in `up()` | L288 |
| `destroyed.zf.accordion-menu` | after `destroy()` | plugin.js L30 |

Listened for: `click.zf.accordionMenu` on each parent `a` (or on `.submenu-toggle` when
`submenuToggle`), `keydown.zf.accordionMenu` on every `li` (L103-118). No window or body
listeners.

### 1.5 Public methods

| Method | Behaviour | Line |
| --- | --- | --- |
| `hideAll()` | `up()` on every `[data-submenu]` | L194-196 |
| `showAll()` | `down()` on every `[data-submenu]` | L202-204 |
| `toggle($target)` | if not mid-animation, `up` when visible else `down` | L211-220 |
| `down($target)` | close others when `!multiOpen`; add `is-active`, `aria-hidden=false`; set `aria-expanded=true` on the parent `li` or toggle button; `slideDown(slideSpeed)`; fire `down` | L227-260 |
| `up($target)` | collapse target and every nested `[data-submenu]` inside it (`slideUp(0)` on nested, `slideUp(slideSpeed)` on target); remove `is-active`, `aria-hidden=true`, `aria-expanded=false`; fire `up` | L267-290 |
| `destroy()` | `slideDown(0)` + clear inline display; unbind clicks; remove parent-link clones, toggle buttons and `has-submenu-toggle`; `Nest.Burn` | L296-307 |

### 1.6 Keyboard and ARIA behaviour

`Keyboard.register('AccordionMenu', ...)` L30-38:

| Key | Command | Effect (L146-186) |
| --- | --- | --- |
| ENTER, SPACE | `toggle` | when `submenuToggle` is off and the `li` has a submenu: `toggle()` it and preventDefault (L169-177). When `submenuToggle` is on: returns `false`, so the native link click proceeds (the toggle button handles its own click). |
| ARROW_RIGHT | `open` | if the item's submenu is hidden: `down()` it and focus its first link (L147-152) |
| ARROW_LEFT | `close` | if the item's own submenu is open: `up()` it; else if the item is inside a submenu: `up()` that submenu and focus the parent item's link (L153-160) |
| ARROW_UP | `up` | focus previous link; previous is computed to step into the last item of a preceding open submenu, or to the parent link when first in a submenu (L125-137, L161-164) |
| ARROW_DOWN | `down` | focus next link; steps into the first child of an open submenu, or to the parent's next sibling when last in a submenu (L130-140, L165-168) |
| ESCAPE | `closeAll` | `hideAll()` (L178-180) |

`handled(preventDefault)` calls `e.preventDefault()` only when the command returned `true`
(L181-185); `open`, `close`, `closeAll` return `undefined`, so arrow-left/right and Escape
do not preventDefault (they do mark the event handled).

ARIA the plugin owns: `aria-multiselectable` on root; `role="group"`, `aria-labelledby`,
`aria-hidden`, `id` on each submenu; `aria-expanded` + `aria-controls` + `id` on the parent
`li` (note: on the `li`, which Nest gave `role="none"`) or on the injected toggle `button`.
Nest gave the root `role="menubar"`, links `role="menuitem"`, `li` `role="none"`, but skipped
`aria-haspopup` for accordions (nest.js L12). Focus stays on the `a` elements; keydown is
delegated from the `li` (L118).

Focus management on `up()` from keyboard: moves to the parent link (L158). No roving
tabindex; every link is natively tabbable.

### 1.7 Dependencies

Utilities: Keyboard, Nest, `GetYoDigits` (core.utils) for ids (L2-4). jQuery animation
(`slideUp`/`slideDown`, `:animated`, `:hidden`, `:visible`). No MediaQuery, Motion, Triggers,
Box, Touch, Timer, ImageLoader. No other plugins. Used by ResponsiveMenu.

### 1.8 Sass configuration that shapes behaviour

`_accordion-menu.scss`: `$accordionmenu-arrows: true` (L19) draws the arrow pseudo-elements
and the `aria-expanded` rotation rule (L113-120); `$accordionmenu-submenu-toggle-width` /
`-height` 40px (L43-47) size the injected toggle button and the `.has-submenu-toggle > a`
right margin (L134-136). `.submenu-toggle-text` is `element-invisible` (screen-reader only,
L171-173). Everything else is theming (padding, colours, borders). Animation timing is the JS
`slideSpeed` option, not Sass.

### 1.9 Behaviour that only jQuery makes easy

- Open/close visibility is jQuery `slideUp`/`slideDown` height animation with inline styles,
  gated by `:animated` (L212). A CSS/Angular version needs its own height animation or
  `hidden` toggling, and the `is-active` class would have to become the actual visibility hook.
- `parentLink` and `submenuToggle` create DOM (`clone().prependTo().wrap()`, string HTML
  insertion, L67, L72). In a template-driven library these are structure the consumer or the
  directive template must declare.
- Arrow-key traversal relies on `:visible` checks and `parents('li')` walks (L130-140).
- Ids are random (`GetYoDigits`), so `aria-controls`/`aria-labelledby` pairs are not stable
  across renders (SSR hydration concern).

---

## 2. Drilldown

Source: `FS/js/foundation.drilldown.js`. Docs: `FS/docs/pages/drilldown-menu.md`.
Sass: `FS/scss/components/_drilldown.scss`.

### 2.1 Purpose

"Drilldown is one of Foundation's three menu patterns, which converts a series of nested lists
into a vertical drilldown menu." (`drilldown-menu.md` L131). "Clicking that `<a>` will then
open the `<ul>` that it's next to. Any `<a>` without a submenu will function like a normal
link." (L141-143). "The drilldown menu takes on the height of the tallest menu in the
hierarchy, so the menu doesn't change height as the user navigates it." (L171).

### 2.2 Markup contract

Docs example (`drilldown-menu.md` L154-167):

```html
<ul class="vertical menu drilldown" data-drilldown>
  <li><a href="#">One</a></li>
  <li>
    <a href="#">Two</a>
    <ul class="menu vertical nested">
      <li><a href="#">Two A</a></li>
      <li><a href="#">Two B</a></li>
    </ul>
  </li>
  <li><a href="#">Three</a></li>
</ul>
```

Structure the plugin creates or requires:

| Element | Added at init | Toggled | Line |
| --- | --- | --- | --- |
| wrapper `div.is-drilldown` (from `wrapper` option) around the root `ul`, unless the parent already has `.is-drilldown` | inline `min-height` (tallest menu) and `max-width` (root width); `animate-height` class when `animateHeight` | inline `height` when `autoHeight` | L122-130, L505-527 |
| root `ul` | class `drilldown` (when `autoApplyClass`), `aria-multiselectable="false"`, `data-mutate="<data-drilldown value or random id>"` | | L49-55, L64 |
| parent `li.is-drilldown-submenu-parent` | `aria-expanded="false"` (Nest) | `aria-expanded` | nest.js L30, L369, L384, L454, L485 |
| parent `a` | `href` REMOVED (saved as jQuery data `savedHref`), `tabindex="0"` | | L90 |
| submenu `ul.is-drilldown-submenu` | `role="group"` (overrides Nest `menubar`), `aria-hidden="true"`, class `invisible`; class `drilldown-submenu-cover-previous` when `!autoHeight` | classes `is-active`, `visible`, `invisible`, `is-closing`; `aria-hidden` | L57, L91-96, L117-120, L368, L383, L460-463, L484-491 |
| back button `<li class="js-drilldown-back"><a tabindex="0">Back</a></li>` prepended (`backButtonPosition: 'top'`) or appended (`'bottom'`) to each submenu unless one already exists | | | L99-115, L575 |
| parentLink clone | `<li data-is-parent-link class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="none">` wrapping a clone of the parent `a`, prepended to the submenu | | L87-89 |

CSS that gives those classes meaning (`_drilldown.scss`): `.is-drilldown` is
`position: relative; overflow: hidden` (L248-250), `.animate-height` transitions `height 0.5s`
(L256-258). `.drilldown .is-drilldown-submenu` is `position: absolute; top: 0; left: 100%;
z-index: -1; width: 100%; transition: $drilldown-transition` (L269-277); `.is-active` gives
`z-index: 1; display: block; transform: translateX(-100%)` (L279-283); `.is-closing` slides it
back out (L285-287). `.drilldown-submenu-cover-previous { min-height: 100% }` (L299-301).
`.invisible` / `.visible` are Foundation visibility utilities
(`FS/scss/components/_visibility.scss` L69-74, `visibility: hidden|visible`); the plugin uses
them so a hidden parent menu drops out of the tab order (comment L458-459).
`.js-drilldown-back > a::before` draws the back arrow when `$drilldown-arrows` (L306-311).

### 2.3 Options

`Drilldown.defaults` L560-655, merged L26.

| Option (`data-*`) | Type | Default | Meaning (source) |
| --- | --- | --- | --- |
| `autoApplyClass` (`data-auto-apply-class`) | boolean | `true` | Add `drilldown` class to the root at init (L49-51, L568). |
| `backButton` (`data-back-button`) | string (HTML) | `'<li class="js-drilldown-back"><a tabindex="0">Back</a></li>'` | Markup for the generated back item; `js-drilldown-back` class required (L570-575). |
| `backButtonPosition` (`data-back-button-position`) | string | `'top'` | `'top'` prepends, `'bottom'` appends, anything else logs `console.error` (L103-112). JSDoc says "Can be `'left'` or `'bottom'`" (L577), which is a doc bug. |
| `wrapper` (`data-wrapper`) | string (HTML) | `'<div></div>'` | Element used to wrap the root; `is-drilldown` is added by JS (L123-126, L584-589). |
| `parentLink` (`data-parent-link`) | boolean | `false` | Clone the parent `a` into its submenu (L87-89, L596). |
| `closeOnClick` (`data-close-on-click`) | boolean | `false` | Body click outside the menu returns to root via `_hideAll()`; handler is bound on each submenu open (L159-167, L603). |
| `autoHeight` (`data-auto-height`) | boolean | `false` | Wrapper takes the height of the current menu instead of `min-height` of the tallest (L118-120, L465-467, L514-521, L610). Docs L217-236. |
| `animateHeight` (`data-animate-height`) | boolean | `false` | Adds `animate-height` to the wrapper (CSS `transition: height 0.5s`) (L125, L617). |
| `scrollTop` (`data-scroll-top`) | boolean | `false` | Animate `html, body` scrollTop to the menu on `open/hide/close/closed.zf.drilldown` (L177-180, L189-200, L624). Docs L301-314. |
| `scrollTopElement` (`data-scroll-top-element`) | string (selector) | `''` | Element whose `offset().top` is scrolled to; empty means the root menu (L191, L631). |
| `scrollTopOffset` (`data-scroll-top-offset`) | number | `0` | Added to the scroll target (L192, L638). |
| `animationDuration` (`data-animation-duration`) | number (ms) | `500` | jQuery scroll animation duration (L193, L645). |
| `animationEasing` (`data-animation-easing`) | string | `'swing'` | jQuery easing, `'swing'` or `'linear'` (L193, L653). |

Commented-out `holdOpen` (L654) is dead.

### 2.4 Events

Fired:

| Event | Target | Args | When | Line |
| --- | --- | --- | --- | --- |
| `init.zf.drilldown` | root | | constructor | plugin.js L19 |
| `open.zf.drilldown` | root | `[$li]` from `_show`, `[$ul]` from `_showMenu` | submenu shown (synchronous, before CSS transition) | L473, L371 |
| `hide.zf.drilldown` | the submenu `ul` (bubbles to root) | `[$ul]` | submenu hidden (synchronous) | L496, L386 |
| `close.zf.drilldown` | root | | `_hideAll()` starts | L307 |
| `closed.zf.drilldown` | root | | `_hideAll()` transition ends | L316 |
| `scrollme.zf.drilldown` | root | | scroll animation finished (`scrollTop` option) | L198 |
| `destroyed.zf.drilldown` | root | | after destroy | plugin.js L30 |

Listened for: `click.zf.drilldown` on parent anchors (L148-168) and on `.js-drilldown-back`
(L329-341); `keydown.zf.drilldown` on menu links, back links, parent-link clones (L209);
`click.zf.drilldown` on `body` when `closeOnClick` (L161); `mutateme.zf.trigger` on root ->
`_resize()` (L181); its own `open/hide/close/closed.zf.drilldown` when `scrollTop` (L179);
`transitionend` (via `transitionend()` helper) on submenus for focus and class cleanup.

### 2.5 Public methods

Drilldown exposes only `destroy()` without a leading underscore. The underscored methods that
docs and tests treat as API:

| Method | Behaviour | Line |
| --- | --- | --- |
| `_show($li)` | `aria-expanded=true` on the `li`; parent `ul` gets `invisible`; submenu gets `is-active visible`, loses `invisible`, `aria-hidden=false`; sets wrapper height when `autoHeight`; fires `open` | L451-474 |
| `_hide($ul)` | restores wrapper height; parent `ul` loses `invisible`; `aria-expanded=false`, `aria-hidden=true`; adds `is-closing`, and on transitionend removes `is-active is-closing visible`, blurs, adds `invisible`; fires `hide` | L482-497 |
| `_hideAll()` | all `.is-drilldown-submenu.is-active` get `is-closing`; fires `close`, then `closed` on transitionend | L293-318 |
| `_showMenu($ul, autoFocus)` | jump straight to any (sub)menu: hides every expanded submenu, then re-shows every submenu on the path from root to the target; optional focus of the target's first link | L398-443 |
| `_back($ul)` | binds the back-button click: `_hide($ul)` then `_show` the grand-parent `li` if any | L326-342 |
| `_resize()` | clears and recomputes wrapper `min-height`/`max-width` (and stored `calcHeight` per menu) | L133-137 |
| `_getMaxDims()` | measures every menu with `Box.GetDimensions`; stores `calcHeight` data when `autoHeight` | L505-527 |
| `destroy()` | `_hideAll`, unwrap, remove back buttons and parent-link clones, strip classes and ARIA, restore `href`s, `Nest.Burn` | L533-557 |

`_menuLinkEvents()` (L349-358, close all on leaf click) exists but is never called
(commented out at L81-83).

### 2.6 Keyboard and ARIA behaviour

`Keyboard.register('Drilldown', ...)` L31-39; handlers L223-283, bound on every menu link,
back link and parent-link clone (L209):

| Key | Command | Effect |
| --- | --- | --- |
| ENTER, SPACE | `open` | if `parentLink` and the link has an `href`: return `false` (native navigation). Else if the link is a back button: `_hide` the submenu and focus the parent link after transitionend. Else if the link is a submenu parent: `_show` and focus the first non-back link after transitionend (L259-277). |
| ARROW_RIGHT | `next` | submenu parent only: `_show` + focus first child link (L224-232) |
| ARROW_LEFT | `previous` | `_hide` the containing submenu; focus the parent link (L233-241) |
| ARROW_UP | `up` | focus previous sibling link; returns `false` (no preventDefault) when on the first root item (L242-246) |
| ARROW_DOWN | `down` | focus next sibling link; returns `false` on the last root item (L247-251) |
| ESCAPE | `close` | if not a root item: `_hide` the containing submenu and focus the parent `a` (L252-258) |

`handled` calls `preventDefault` when the command returned `true` (L278-282).

ARIA owned by the plugin plus Nest: root `role="menubar"`, `aria-multiselectable="false"`;
links `role="menuitem"`; `li` `role="none"`; parent `a` `aria-haspopup="true"`,
`aria-label`, `tabindex="0"`, no `href`; parent `li` `aria-expanded`; submenu `role="group"`,
`aria-hidden`, `tabindex="0"` (L93-96, set on `$link.children('[data-submenu]')`, which is an
empty set because the submenu is a sibling of the link, not a child; the effective submenu
attributes are the ones from L57 and nest.js L33-41). Hidden menus rely on
`visibility: hidden` (`.invisible`) to leave the tab order; the root menu becomes `.invisible`
while a submenu is open (L460).

### 2.7 Dependencies

Keyboard, Nest, Box (`GetDimensions`), `GetYoDigits` and `transitionend` from core.utils
(L2-6). Triggers indirectly: it sets `data-mutate` and listens for `mutateme.zf.trigger`
(L64, L181), which the Triggers MutationObserver emits (triggers.js L380-421), and
ResponsiveToggle fires manually (see 5.4). jQuery `animate` for `scrollTop`. No MediaQuery,
Motion, Touch. Used by ResponsiveMenu.

### 2.8 Sass configuration that shapes behaviour

`$drilldown-transition: transform 0.15s linear` (`_drilldown.scss` L185) is the slide the
JS waits for with `transitionend`; if a theme sets it to `none`, `transitionend` never fires
and `_hide`'s cleanup / `closed` event / keyboard focus moves never run (the `transitionend()`
helper only polyfills when the browser lacks transition support, core.utils L42-65).
`.is-drilldown.animate-height { transition: height 0.5s }` (L256-258) is hard-coded.
`$drilldown-arrows: true` (L189) adds the parent and back arrows. `$drilldown-nested-margin: 0`
(L197) means `.nested` indentation is turned off inside drilldowns by default.

### 2.9 Behaviour that only jQuery makes easy

- Wrapping the root in a generated `div.is-drilldown` (`$element.wrap`, L126) and measuring
  every submenu's rendered height to size it (L505-527). The `data-mutate` MutationObserver
  re-measure is the jQuery-era answer to content changes.
- Removing `href` from parent links and restoring it on destroy (L90, L550-556).
- Generating back buttons and parent-link clones from HTML strings (L99-115, L87-89).
- `scrollTop` via `$('html, body').animate` (L193).
- All the `transitionend` + `setTimeout(..., 1)` focus sequencing (L227-239, L264-276).
- Body-click-to-close bound and unbound per open (L159-167).

---

## 3. DropdownMenu

Source: `FS/js/foundation.dropdownMenu.js`. Docs: `FS/docs/pages/dropdown-menu.md`,
`FS/docs/pages/top-bar.md`. Sass: `FS/scss/components/_dropdown-menu.scss`.

### 3.1 Purpose

"Change a basic Menu into an expandable dropdown menu with the Dropdown Menu plugin."
(`dropdown-menu.md` L3). "To create dropdown menus, nest a new `<ul>` inside an `<li>`. You can
nest further to create more levels of dropdowns." (L22). "Note that the `<ul>` goes *after* the
`<a>`, and not inside of it." (L27).

### 3.2 Markup contract

Docs example, horizontal (`dropdown-menu.md` L35-47):

```html
<ul class="dropdown menu" data-dropdown-menu>
  <li>
    <a href="#">Item 1</a>
    <ul class="menu">
      <li><a href="#">Item 1A</a></li>
    </ul>
  </li>
  <li><a href="#">Item 2</a></li>
</ul>
```

Vertical (L103-115): `<ul class="vertical dropdown menu" data-dropdown-menu>` with
`<ul class="vertical menu nested">` submenus; "Sub-menus are automatically vertical,
regardless of the orientation of the top-level menu." (L92). FOUC prevention (L165-182):
hand-write `class="is-dropdown-submenu-parent"` on parent `li`s so arrows render before JS.

Inside a top bar (`top-bar.md` L429-452): `.top-bar > .top-bar-left > ul.dropdown.menu`;
`.top-bar-right` ancestry flips the auto alignment (see `alignment` option).

What the plugin adds or toggles:

| Element | Added at init | Toggled | Line |
| --- | --- | --- | --- |
| root `ul` | Nest classes/roles (0.2) | | L54 |
| top-level submenus (`> .is-dropdown-submenu-parent > .is-dropdown-submenu`) | class `first-sub` | | L57 |
| every `ul.is-dropdown-submenu` under a top-level `li` | class from `verticalClass` (`vertical`) | | L61 |
| every `li.is-dropdown-submenu-parent` | `opens-left` (alignment right) or `opens-right` (alignment left) | `opens-left` / `opens-right` / `opens-inner` swapped on collision | L63-77, L312-318, L360-366 |
| parent `li` | | class `is-active`; attribute `data-is-click="true|false"` | L308-309, L122, L354-356 |
| submenu `ul` | | class `js-dropdown-active` (CSS `display: block`) | L308, L358 |

CSS: `.is-dropdown-submenu` is `position: absolute; top: 0; left: 100%; z-index: 1; display:
none; min-width: $dropdownmenu-min-width; border; background` (`_dropdown-menu.scss` L555-566);
`.js-dropdown-active { display: block }` (L589-591). `.dropdown.menu .no-js & ul { display:
none }` hides submenus without JS (L479-481). Horizontal direction puts top-level submenus at
`top: 100%` with `left: 0` (`opens-right`) or `right: 0` (`opens-left`) (L396-413); vertical
puts them at `top: 0` beside the item (L428-453). `.is-dropdown-submenu-parent.opens-inner >
.is-dropdown-submenu { top: 100%; left: auto }` (L533-542) is the fallback when neither side
fits. `.dropdown.menu > li.is-active > a` is the active-item style (L474-477). Arrows on
`> li.is-dropdown-submenu-parent > a::after` (down) and `.opens-left/right > a::after`
(left/right) when `$dropdownmenu-arrows` (L380-394, L414-426).

### 3.3 Options

`DropdownMenu.defaults` L394-480, merged L30.

| Option (`data-*`) | Type | Default | Meaning (source) |
| --- | --- | --- | --- |
| `disableHover` (`data-disable-hover`) | boolean | `false` | Do not open on `mouseenter` (L144, L401). |
| `disableHoverOnTouch` (`data-disable-hover-on-touch`) | boolean | `true` | On touch-capable browsers, force `disableHover = true` (L142, L408). |
| `autoclose` (`data-autoclose`) | boolean | `true` | Close on `mouseleave` after `closingTime`, unless the item was click-opened with `clickOpen` (L158-165, L415). |
| `hoverDelay` (`data-hover-delay`) | number (ms) | `50` | Delay before a hover opens a submenu (L151-153, L422). |
| `clickOpen` (`data-click-open`) | boolean | `false` | Bind click/touchstart open-toggle handlers; also implied when the browser has touch (L127-129, L429). |
| `closingTime` (`data-closing-time`) | number (ms) | `500` | Delay before `mouseleave` closes (L162-164, L437). |
| `alignment` (`data-alignment`) | string | `'auto'` | `'auto'` becomes `'right'` when the root has `rightClass`, the document is RTL, or the root is inside `.top-bar-right`; otherwise `'left'`. Drives `opens-left`/`opens-right` (L63-77, L444). |
| `closeOnClick` (`data-close-on-click`) | boolean | `true` | Body `click`/`tap` outside closes everything (L277-283, L322, L451). Also required for a second click on an open parent to close it (L109). |
| `closeOnClickInside` (`data-close-on-click-inside`) | boolean | `true` | Clicking a leaf item closes all submenus (L132-140, L458). |
| `verticalClass` (`data-vertical-class`) | string | `'vertical'` | Class applied to submenus under top-level items (L61, L465). |
| `rightClass` (`data-right-class`) | string | `'align-right'` | Class that makes `alignment: 'auto'` resolve to `'right'` (L64, L472). |
| `forceFollow` (`data-force-follow`) | boolean | `true` | On touch, a second tap on an already-open parent follows the link instead of closing (L111, L479). |

None of these are documented on the docs page; they are source-only.

### 3.4 Events

Fired:

| Event | Args | When | Line |
| --- | --- | --- | --- |
| `init.zf.dropdown-menu` | | constructor | plugin.js L19 |
| `show.zf.dropdownMenu` | `[$sub]` | a submenu was made visible (synchronous; collision already resolved) | L327 |
| `hide.zf.dropdownMenu` | `[$toClose]` | one or all submenus closed; only fires if something was actually open | L350-376 |
| `destroyed.zf.dropdown-menu` | | after destroy | plugin.js L30 |

Listened for, on `li[role="none"]` items: `click.zf.dropdownMenu touchstart.zf.dropdownMenu`
(when `clickOpen` or touch, L127-129), `click.zf.dropdownMenu` leaf-close (L133), `mouseenter`
/ `mouseleave.zf.dropdownMenu` (L145-166; leave wrapped in `ignoreMousedisappear`,
core.utils L114), `keydown.zf.dropdownMenu` (L168). On `document.body`:
`click.zf.dropdownMenu tap.zf.dropdownMenu` while something is open and `closeOnClick`
(L274-293).

### 3.5 Public methods

No non-underscore methods besides `destroy()`. Internals the tests drive:

| Method | Behaviour | Line |
| --- | --- | --- |
| `_show($sub)` | hide sibling parents at the same level (and other top-level tabs); add `js-dropdown-active` to the submenu and `is-active` to its parent `li`; run `Box.ImNotTouchingYou($sub, null, true)` (left/right only, against the viewport) and flip `opens-*` to the other side, then to `opens-inner`; add body handler; fire `show` | L302-328 |
| `_hide($elem, idx)` | with `$elem`: close it; with `idx`: close every top-level tab except index; with neither: close everything. Removes `is-active`, `data-is-click`, `js-dropdown-active`; restores `opens-*` if a collision flip happened; clears hover timer; removes body handler; fires `hide` | L338-377 |
| `_isVertical()` | computed style check: top-level `li` `display: block` or root `flex-direction: column` | L82-84 |
| `_isRtl()` | root has `align-right`, or document RTL without `align-left` | L86-88 |
| `destroy()` | unbind, remove `data-is-click` and `opens-*`/arrow classes, body off, `Nest.Burn` | L383-388 |

### 3.6 Keyboard and ARIA behaviour

`Keyboard.register('DropdownMenu', ...)` L37-45. The command-to-function map is rebuilt per
keydown depending on whether the focused item is a top-level tab, the menu is vertical, and the
menu is right-aligned/RTL (L204-263):

| Context | ARROW_DOWN | ARROW_UP | ARROW_RIGHT (`next`) | ARROW_LEFT (`previous`) |
| --- | --- | --- | --- | --- |
| top-level, horizontal, LTR | open submenu + focus first child | close (focus parent) | next tab | previous tab |
| top-level, horizontal, RTL/right | open submenu | close | previous tab | next tab |
| top-level, vertical, LTR | next tab | previous tab | open submenu | close |
| top-level, vertical, RTL/right | next tab | previous tab | close | open submenu |
| inside a submenu, LTR | next sibling | previous sibling | open child submenu | close (focus parent link) |
| inside a submenu, RTL/right | next sibling | previous sibling | close | open child submenu |

Always: ENTER / SPACE = `open` (open the child submenu and focus its first link; no-op on a
leaf, so the link's native activation proceeds, L189-195); ESCAPE = `close` everything and
focus the first top-level link (L206-210). Each function calls `e.preventDefault()` itself.

ARIA is entirely from Nest (0.2): root and every submenu `role="menubar"`, links
`role="menuitem"`, `li` `role="none"`, parent links `aria-haspopup="true"` and `aria-label`.
The plugin adds NO `aria-expanded`, `aria-controls`, or `aria-hidden` on open/close; the only
state signal is the `is-active` class on the parent `li` and `js-dropdown-active` on the `ul`.
All links stay natively tabbable (no roving tabindex).

### 3.7 Dependencies

Keyboard, Nest, Box (`ImNotTouchingYou`), Touch (`Touch.init($)` at setup L33, `tap` event
L277), `rtl` and `ignoreMousedisappear` from core.utils (L3-7). No MediaQuery, Motion,
Triggers, Timer, ImageLoader. Used by ResponsiveMenu. The top-bar `.top-bar-right` check
(L64) is the only coupling to another component.

### 3.8 Sass configuration that shapes behaviour

`$dropdownmenu-arrows: true` (`_dropdown-menu.scss` L325) gates every arrow rule and the extra
right padding on parent links (L415-418). `$dropdownmenu-min-width: 200px` (L341) sizes
submenus, which feeds the collision check. `.dropdown.menu.[bp]-horizontal` /
`.[bp]-vertical` (L491-503) let the direction change per breakpoint, and the JS reads the
resulting computed style (`_isVertical`) rather than a class, so keyboard mapping follows CSS.
Submenu open/close has no CSS transition; `display` toggles instantly.

### 3.9 Behaviour that only jQuery makes easy

- Collision detection by measuring the just-shown submenu against the viewport and flipping
  classes (`Box.ImNotTouchingYou`, L310-320). Native CSS anchor positioning or CDK overlay
  positioning is the modern replacement.
- Hover intent timers stored as jQuery data per item (`_delay`, L150-164) and the
  `ignoreMousedisappear` mouseleave wrapper.
- Body-level click/tap outside handler and the `tap` special event from the Touch utility.
- `data-is-click` bookkeeping to distinguish hover-open from click-open (L104, L122, L159).
- `_isVertical()` reading computed style each keydown (L83).

---

## 4. ResponsiveMenu

Source: `FS/js/foundation.responsiveMenu.js`. Docs: `FS/docs/pages/responsive-navigation.md`.
No Sass of its own.

### 4.1 Purpose

"Our three Menu patterns form like Voltron into one responsive Menu plugin, which allows you
to switch between patterns at different screen sizes." (`responsive-navigation.md` L185).
"With our responsive Menu plugin, you can apply a default pattern to a Menu, and then change
that pattern on other screen sizes." (L217).

### 4.2 Markup contract

Docs example (`responsive-navigation.md` L238-269):

```html
<ul class="vertical medium-horizontal menu" data-responsive-menu="drilldown medium-dropdown">
  <li>
    <a href="#">Item 1</a>
    <ul class="vertical menu">
      <li>
        <a href="#">Item 1A</a>
        <ul class="vertical menu">
          <li><a href="#">Item 1A</a></li>
        </ul>
      </li>
      <li><a href="#">Item 1B</a></li>
    </ul>
  </li>
  <li><a href="#">Item 2</a></li>
</ul>
```

Other documented combos: `data-responsive-menu="accordion medium-dropdown"` (L296) and
`data-responsive-menu="drilldown medium-accordion"` (L341). Note the consumer also sets the
matching Menu orientation classes (`vertical medium-horizontal`) by hand; the plugin does not
touch them.

`data-responsive-menu` value syntax (L65-83): space-separated rules; each rule is
`<breakpoint>-<plugin>` or bare `<plugin>` (which means breakpoint `small`). Plugin keys and the
class they add (`MenuPlugins`, L11-24):

| Key | CSS class added to the root `ul` | Plugin |
| --- | --- | --- |
| `dropdown` | `dropdown` | DropdownMenu |
| `drilldown` | `drilldown` | Drilldown |
| `accordion` | `accordion-menu` | AccordionMenu |

The parser splits on the first `-` only via `rule.split('-')` and takes `[0]` and `[1]`, so
breakpoint names containing a hyphen would break. Unknown plugin keys are not filtered: the
check `MenuPlugins[rulePlugin] !== null` (L77) is true for `undefined`, so a typo stores
`undefined` and `_checkMediaQueries` would throw at L126/L134 when that breakpoint matches.

What the plugin adds: the current pattern's CSS class (removing the other two, L128-134),
`data-mutate="<existing or random id>"` (L89), and whatever the active child plugin adds
(sections 1-3). It passes `{}` as options to the child (L138), so per-plugin `data-*` on the
same `ul` still apply via `.data()` (0.3).

### 4.3 Options

`ResponsiveMenu.defaults = {}` (L151). The only input is the `data-responsive-menu` rule string
read at setup (L47). There is no `data-options` handling beyond what the child plugins read.

### 4.4 Events

Fired: `init.zf.responsive-menu` / `destroyed.zf.responsive-menu` (base class) and, from the
active child, `init.zf.<child>` / `destroyed.zf.<child>` every time the pattern swaps (L137-138)
plus that child's own events. ResponsiveMenu fires nothing of its own.

Listened for: `changed.zf.mediaquery` on `window` (L100-102), unnamespaced to the plugin. Note
`_destroy` calls `$(window).off('.zf.ResponsiveMenu')` (L147), which does not match the
`changed.zf.mediaquery` binding, so the window listener leaks after destroy (it would then
call `_checkMediaQueries` on a nulled instance).

### 4.5 Public methods

None besides `destroy()` (destroys the current child, L146). `_checkMediaQueries()` (L113-139)
is the swap: iterate the rules in insertion order, keep the LAST whose breakpoint `atLeast`
matches (so rule order in the attribute matters when breakpoints are listed out of order),
return early if the current plugin is already that class, otherwise swap classes, `destroy()`
the old child, `new plugin($element, {})`.

### 4.6 Keyboard and ARIA behaviour

Delegated entirely to the active child plugin. Because `Nest.Burn` does not remove `role`
attributes (0.2) and each child re-Feathers, roles are stable across swaps; ARIA state
attributes differ per child (AccordionMenu adds `aria-expanded`/`aria-controls`/`role=group`,
Drilldown adds `aria-expanded`/`aria-hidden`/`role=group`, DropdownMenu adds only
`aria-haspopup`). Whatever the outgoing plugin's `_destroy` does not clean stays: AccordionMenu
`_destroy` does not remove `aria-controls`/`aria-expanded`/`aria-hidden`/`aria-labelledby`/
`role=group`/`aria-multiselectable` (L296-307), so after a drilldown->dropdown or
accordion->dropdown swap those attributes linger on elements DropdownMenu never updates.

### 4.7 Dependencies

MediaQuery (`_init`, `atLeast`, `changed.zf.mediaquery`), `GetYoDigits`, and the three menu
plugins it imports directly (L3-9). The JSDoc claims `@requires foundation.util.triggers`
(L32) but the import is commented out (L26); the `data-mutate` attribute it sets only does
something when Triggers' MutationObserver is installed.

### 4.8 Sass configuration that shapes behaviour

The breakpoint names come from the Sass `$breakpoints` map via `meta.foundation-mq`
(0.6). The consumer pairs the JS rule with the Menu orientation classes
`.[bp]-horizontal`/`.[bp]-vertical` (`_menu.scss` L407-416) and the Dropdown direction classes
(`_dropdown-menu.scss` L491-503); nothing in Sass reads `data-responsive-menu`.

### 4.9 Behaviour that only jQuery makes easy

Runtime plugin swapping on the same DOM (destroy and re-initialise a different behaviour
against the same `ul`, L137-138). In Angular this is a directive choosing a strategy, or three
directives gated by a breakpoint signal; the class-swap (`dropdown` / `drilldown` /
`accordion-menu`) is the visible contract to keep.

---

## 5. ResponsiveToggle

Source: `FS/js/foundation.responsiveToggle.js` (standalone line numbers below).
Docs: `FS/docs/pages/responsive-navigation.md` L377-506, `FS/docs/pages/top-bar.md` L462-501.
Sass: `FS/scss/components/_title-bar.scss` (markup styling only).

### 5.1 Purpose

"It's called the title bar, and it allows you to quickly setup a menu toggle on mobile. The
title bar hides itself on larger screens." (`responsive-navigation.md` L379). "By default, the
title bar will be visible on small screens, and the Menu hides. At the medium breakpoint, the
title bar disappears, and the menu is always visible." (L383).

### 5.2 Markup contract

Docs example (`responsive-navigation.md` L396-424):

```html
<div class="title-bar" data-responsive-toggle="example-menu" data-hide-for="medium">
  <button class="menu-icon" type="button" data-toggle="example-menu"></button>
  <div class="title-bar-title">Menu</div>
</div>

<div class="top-bar" id="example-menu">
  <div class="top-bar-left">
    <ul class="dropdown menu" data-dropdown-menu>
      ...
    </ul>
  </div>
</div>
```

Animated variant (L442-463): `<button class="menu-icon" type="button" data-toggle></button>`
(empty value allowed) and `data-animate="hinge-in-from-top spin-out"` on the TARGET element.

Syntax: `data-responsive-toggle="<id of target>"` on the bar (L192); the toggler(s) are
`[data-toggle]` descendants of the bar whose value equals the target id or is empty
(L198-201). "You don't even need to use Menu! Any element will work." (docs L381). If the id
is missing the plugin logs `console.error('Your tab bar needs an ID of a Menu as the value of
data-tab-bar.')` (L194, stale attribute name).

What the plugin does to the DOM: jQuery `.show()` / `.hide()` on the bar and on the target
(inline `display`), depending on breakpoint (L233-245); `toggle(0)` or Motion classes on the
target when the toggler is clicked (L252-277). No classes or ARIA are added; the toggler gets
no `aria-expanded`/`aria-controls`. The FOUC section (docs L468-506) tells consumers to add
`.no-js` CSS themselves.

### 5.3 Options

`ResponsiveToggle.defaults` L287-303, merged from the bar's `data()` (L178) and THEN from the
target element's `data()` (L202), so `data-hide-for` / `data-animate` may sit on either
element (the docs put `data-animate` on the target).

| Option (`data-*`) | Type | Default | Meaning (source) |
| --- | --- | --- | --- |
| `hideFor` (`data-hide-for`) | string (breakpoint) | `'medium'` | Breakpoint at and above which the bar is hidden and the target always shown (L235-244, L294). |
| `animate` (`data-animate`) | `false` or string `"<inClass> <outClass>"` | `false` | Motion UI classes for in and out; second token optional (L205-210, L302). |

### 5.4 Events

Fired: `init.zf.responsive-toggle`, `destroyed.zf.responsive-toggle` (base class);
`toggled.zf.responsiveToggle` on the bar after every toggle (L261, L268, L274). It also fires
`mutateme.zf.trigger` on every `[data-mutate]` inside the target after showing it
(`triggerHandler` in the animated path L262, `trigger` in the plain path L273), which is how a
Drilldown inside a just-revealed top bar re-measures its height (2.4).

Listened for: `changed.zf.mediaquery` on window -> `_update` (L223);
`click.zf.responsiveToggle` on the toggler(s) -> `toggleMenu` (L225).

### 5.5 Public methods

| Method | Behaviour | Line |
| --- | --- | --- |
| `toggleMenu()` | only below `hideFor`: with `animate`, `Motion.animateIn/animateOut` the target (choosing by `:hidden`); otherwise `toggle(0)`; fire `toggled` | L252-277 |
| `destroy()` | unbind bar, toggler and window listeners | L279-284 |

`_update()` (L233-245) is the breakpoint switch: below `hideFor` show bar / hide target; at or
above hide bar / show target.

### 5.6 Keyboard and ARIA behaviour

None. The toggler is whatever element carries `data-toggle` (a `<button>` in the docs, so
native keyboard activation). No `aria-expanded`, `aria-controls`, or focus management.

### 5.7 Dependencies

MediaQuery (`_init`, `atLeast`, `changed.zf.mediaquery`), Motion (`animateIn/animateOut`)
(L3-4). Does not use Triggers for `data-toggle` (it binds its own click, L225), but does emit
`mutateme.zf.trigger`. No Keyboard, Nest, Box, Touch.

### 5.8 Sass configuration that shapes behaviour

`_title-bar.scss` is pure theming (`$titlebar-*`, L11-35) for `.title-bar`, `.title-bar-left`,
`.title-bar-right`, `.title-bar-title`, `.menu-icon` spacing. Top bar stacking uses
`$topbar-unstack-breakpoint: medium` (`_top-bar.scss` L31) and `.stacked-for-[bp]` classes
(L137), which is a CSS-only breakpoint that should agree with `hideFor` but is not linked to it.
Visibility switching is inline `display` from JS, not a class.

### 5.9 Behaviour that only jQuery makes easy

- `show()`/`hide()`/`toggle(0)` inline display switching (L236-243, L272). The Angular
  equivalent is a breakpoint signal plus `hidden`, or CSS `show-for-*`/`hide-for-*` classes with
  no JS at all for the breakpoint part.
- Motion UI in/out class animation via `Motion` (L260-268).
- Reading options from two elements (bar then target, L178, L202).

---

## 6. OffCanvas

Source: `FS/js/foundation.offcanvas.js`. Docs: `FS/docs/pages/off-canvas.md`.
Sass: `FS/scss/components/_off-canvas.scss`.

### 6.1 Purpose

"Off-canvas panels are positioned outside of the viewport and slide in when activated."
(`off-canvas.md` L3). "It can open from any direction, left, right, top, and bottom. There are
options to allow the Off-canvas to push your page over or to overlap your page plus a few other
neat tricks." (L29).

### 6.2 Markup contract

Docs example (`off-canvas.md` L130-153):

```html
<body>
  <div class="off-canvas position-left" id="offCanvas" data-off-canvas>
    <button class="close-button" aria-label="Close menu" type="button" data-close>
      <span aria-hidden="true">&times;</span>
    </button>
    <ul class="vertical menu">
      <li><a href="#">Foundation</a></li>
    </ul>
  </div>
  <div class="off-canvas-content" data-off-canvas-content>
    <!-- Your page content lives here -->
  </div>
</body>
```

Trigger: `<button type="button" class="button" data-toggle="offCanvas">Open Menu</button>`
(L108); `data-open="id"` also works (L101). Optional `.off-canvas-wrapper` around both to hide
body scrollbars (L81-97). Positioning class required: `.position-left|right|top|bottom`
(L35-40). `.off-canvas-absolute` instead of `.off-canvas` for `position: absolute` (L159).
`data-transition="overlap"` or `"push"` (L254-268). `.reveal-for-medium|large` to keep it open
as a sidebar (L286-306). `data-options="inCanvasOn:large;"` or `.in-canvas-for-[bp]` to make it
a normal page element above a breakpoint (L351-366). Nested form: the `.off-canvas` placed
inside `.off-canvas-content` (L370-404). `data-off-canvas-scrollbox` /
`data-off-canvas-scrollbox-outer` for touch-scrollable children when `contentScroll: false`
(L408-479). `data-off-canvas-sticky` on fixed elements that must stay fixed under push (L483-498).
Multiple panels must come before `.off-canvas-content` (L233).

What the plugin adds or toggles (`foundation.offcanvas.js`):

| Element | Added at init | Toggled | Line |
| --- | --- | --- | --- |
| panel `[data-off-canvas]` | `aria-hidden="true"`; classes `is-transition-<push|overlap>` and `is-closed`; `reveal-for-<bp>` when `isRevealed`+`revealOn`; `in-canvas-for-<bp>` when `inCanvasOn`; inline `transition-duration` when `transitionTime`; `is-transition-push` removed when nested | classes `is-open` / `is-closed` (closed added on transitionend); `aria-hidden` | L69, L94-97, L131, L136, L153, L419, L501, L519 |
| triggers `[data-open=id], [data-close=id], [data-toggle=id]` (document-wide) | `aria-expanded="false"`, `aria-controls="<id>"` | `aria-expanded` | L100-103, L421, L513 |
| content `[data-off-canvas-content]` (by `contentId`, else sibling, else closest ancestor) | all `has-transition-*`/`has-position-*` classes removed | `is-open-<position>`; `has-transition-<t> has-position-<p>` while open; `has-reveal-<p>` while revealed; `tabindex="-1"` while open with `trapFocus`; inline `transition-duration` | L72-78, L161, L424, L458, L466, L503, L520, L246-249 |
| overlay `div.js-off-canvas-overlay.is-overlay-fixed|absolute` inserted after the panel (fixed) or appended to content (absolute) when `contentOverlay` | | `is-visible`, `is-closable` | L109-119, L436-441, L506-511 |
| `body` | | class `is-off-canvas-open` while open with `contentScroll: false` | L428, L528 |
| `[data-off-canvas-sticky]` inside content | | inline `top`/`width`/`transition` swapped to absolute values while open under push | L257-291 |

CSS: `.off-canvas` is `position: fixed; z-index: $offcanvas-push-zindex; transition: transform
0.5s ease; transform: translateX(-<size>)` per position and breakpoint
(`_off-canvas.scss` L141-184, L187-341); `.is-open { transform: translate(0,0) }` (L181-183);
`.is-closed { visibility: hidden }` (L167-169); `.is-transition-overlap` raises z-index and
adds `box-shadow` when open (L172-178). Content: `.off-canvas-content.is-open-left.has-
transition-push { transform: translateX(<size>) }` (L220-228) is the push. `.js-off-canvas-
overlay` (L97-131) fades with `.is-visible`, `cursor: pointer` with `.is-closable`.
`.reveal-for-[bp]` (L479-500, mixin L387-419): `transform: none; visibility: visible`, hides
`.close-button`, and `.off-canvas-content.has-reveal-<pos>` gets a matching margin.
`.in-canvas-for-[bp]` (L502-511, mixin L422-443) resets position/transform/background.
`.is-off-canvas-open { overflow: hidden }` on body (L92-94).

### 6.3 Options

`OffCanvas.defaults` L593-706, merged L29.

| Option (`data-*`) | Type | Default | Meaning (source) |
| --- | --- | --- | --- |
| `closeOnClick` (`data-close-on-click`) | boolean | `true` | Click on the overlay (or on the content when no overlay) closes (L177-180, L600). |
| `contentOverlay` (`data-content-overlay`) | boolean | `true` | Create `.js-off-canvas-overlay` (L109-119, L608). |
| `contentId` (`data-content-id`) | string or null | `null` | Id of the content container; otherwise sibling, then closest `[data-off-canvas-content]` (L72-78, L616). |
| `nested` (`data-nested`) | boolean or null | `null` | Declare the panel nested in the content; auto-detected when `contentId` is unset (no sibling content = nested); `console.warn` if `contentId` set without it (L80-88, L624). Nested forces `transition = 'overlap'` (L90-96). |
| `contentScroll` (`data-content-scroll`) | boolean | `true` | `false` locks body scroll (`is-off-canvas-open`, `touchmove` preventDefault) and installs the scrollbox touch handlers (L427-433, L632). Forced `false` when `[data-off-canvas-sticky]` exists under push (L140-145). |
| `transitionTime` (`data-transition-time`) | string with unit or null | `null` | Inline `transition-duration` on the panel (L135-137) and, for push, on sibling content (L413-417, L640). |
| `transition` (`data-transition`) | string | `'push'` | `'push'` or `'overlap'` (L97, L246, docs L255). JSDoc says "'push', 'detached' or 'slide'" (L643), a doc bug. |
| `forceTo` (`data-force-to`) | `'top'`, `'bottom'` or null | `null` | `window.scrollTo` on open (L407-411, L656). |
| `isRevealed` (`data-is-revealed`) | boolean | `false` | Keep open above `revealOn`; auto-set when a `reveal-for-*` class is present (L122-127, L664). |
| `revealOn` (`data-reveal-on`) | string (breakpoint) or null | `null` | Breakpoint for reveal; parsed from the class via `revealClass` regex (L122-133, L672). |
| `inCanvasOn` (`data-in-canvas-on`) | string (breakpoint) or null | `null` | Breakpoint above which the panel is an in-flow element; class `in-canvas-for-<bp>` wins over the option (L147-158, L680). |
| `autoFocus` (`data-auto-focus`) | boolean | `true` | After the open transition, focus `[data-autofocus]` or the first `a, button` inside (L443-455, L688). |
| `revealClass` (`data-reveal-class`) | string | `'reveal-for-'` | Prefix regex used to detect `revealOn` from the class list (L122, L697). |
| `trapFocus` (`data-trap-focus`) | boolean | `false` | `Keyboard.trapFocus` on the panel and `tabindex="-1"` on content while open (L457-460, L535-538, L705). |

Docs page documents: `data-transition`, `data-content-scroll`, `inCanvasOn` (via
`data-options`), `contentId` + `nested`, `reveal-for-*`, `data-off-canvas-sticky`.

### 6.4 Events

Fired on the panel:

| Event | When | Line |
| --- | --- | --- |
| `init.zf.off-canvas` | constructor | plugin.js L19 |
| `opened.zf.offCanvas` | synchronously at the END of `open()` setup, i.e. when the open transition STARTS (despite the past-tense name) | L472 |
| `openedEnd.zf.offCanvas` | `transitionend` after open | L478-480 |
| `close.zf.offCanvas` | synchronously at the start of `close()` | L497 |
| `closed.zf.offCanvas` | `transitionend` after close, after cleanup | L517-545 |
| `destroyed.zf.off-canvas` | after destroy | plugin.js L30 |

There is no `open.zf.offCanvas` (the source carries `@todo also trigger 'open' event?`,
L397).

Listened for on the panel: `open.zf.trigger`, `close.zf.trigger`, `toggle.zf.trigger`
(from the Triggers utility, with the trigger element as second arg) and `keydown.zf.offCanvas`
(L170-175). Reveal state rebinds only `open`/`toggle` so a revealed panel ignores open
requests but still answers `close.zf.trigger` (L303-312). Overlay or content:
`click.zf.offCanvas` -> `close` when `closeOnClick` (L177-180). Window:
`changed.zf.mediaquery` for `inCanvasOn` (L182-186) and for `revealOn` (L203-209); page load
(`onLoad`) for the initial reveal check (L197-201). Body/panel `touchstart`/`touchmove` while
open with `contentScroll: false` (L428-432).

### 6.5 Public methods

| Method | Behaviour | Line |
| --- | --- | --- |
| `open(event, trigger)` | no-op if already open, revealed or in-canvas; remember `trigger` as `$lastTrigger`; `forceTo` scroll; set transition duration; `is-open`, `aria-hidden=false`, triggers `aria-expanded=true`, content `is-open-<pos>`; scroll lock; overlay `is-visible`/`is-closable`; autoFocus after transitionend; trapFocus; fix sticky elements; content transition/position classes; fire `opened`, then `openedEnd` | L399-481 |
| `close()` | no-op if not open or revealed; fire `close`; remove `is-open`, `aria-hidden=true`, content `is-open-*`, overlay classes, triggers `aria-expanded=false`; on transitionend: `is-closed`, remove content classes, unfix sticky, unlock scroll, release focus, fire `closed` | L490-546 |
| `toggle(event, trigger)` | `close` if `is-open` else `open` | L554-561 |
| `reveal(isRevealed)` | `true`: close, `aria-hidden=false`, unbind open/toggle, remove `is-closed`; `false`: rebind, `aria-hidden=true`, add `is-closed`; update content `has-reveal-<pos>` | L298-315 |
| `destroy()` | close, unbind panel and overlay, remove onLoad listener | L585-590 |

### 6.6 Keyboard and ARIA behaviour

`Keyboard.register('OffCanvas', { 'ESCAPE': 'close' })` (L55-57); `_handleKeyboard` (L568-579)
on keydown inside the panel: `close()` then focus `$lastTrigger` (the element passed by the
Triggers utility when a `data-open`/`data-toggle` click opened it; empty jQuery set when
opened programmatically, L31, L403-405), and `preventDefault`.

Focus: `autoFocus` moves focus into the panel after the open transition (L443-455);
`trapFocus` (off by default) wraps TAB inside via `Keyboard.trapFocus` and sets
`tabindex="-1"` on the content so it can be programmatically focused (L457-460). Focus return on
close happens only through the Escape path; clicking the overlay or a `data-close` button does
not restore focus to the trigger.

ARIA: `aria-hidden` on the panel (true while closed, false while open or revealed);
`aria-expanded` + `aria-controls` on every trigger found at init (L100-103; triggers added
later are not picked up). No `role` is set on the panel (no `dialog`, no `aria-modal`); the
docs' close button carries its own `aria-label`.

### 6.7 Dependencies

Keyboard (`register`, `handleKey`, `trapFocus`, `releaseFocus`), MediaQuery (`_init`,
`atLeast`, `changed.zf.mediaquery`), Triggers (`Triggers.init($)` at setup L49; the
`open/close/toggle.zf.trigger` protocol), `onLoad`, `transitionend`, `RegExpEscape` from
core.utils (L3-7). No Nest, Motion, Box, Touch. Cooperates with Sticky via
`[data-off-canvas-sticky]` (docs L483-498) and with the Close Button component via
`data-close` (docs L111-123). Off-canvas contents are commonly a Menu or one of the three menu
plugins; no code coupling.

### 6.8 Sass configuration that shapes behaviour

- `$offcanvas-sizes: (small: 250px)` and `$offcanvas-vertical-sizes: (small: 250px)` maps
  (`_off-canvas.scss` L11-19): per-breakpoint width/height AND the closed-state `translate`
  distance AND the push distance for content (L199-228 etc.). The docs warn the maps do not
  fully work with `reveal-for-*` (docs L507-509).
- `$offcanvas-transition-length: 0.5s`, `$offcanvas-transition-timing: ease` (L55-59): the
  transition the JS waits on with `transitionend` for `openedEnd`, `closed`, `is-closed`,
  focus, scroll unlock and sticky restore. Setting it to `0` or `none` would leave those
  callbacks unfired (same caveat as Drilldown 2.8). The JS `transitionTime` option overrides
  it inline.
- z-index set `$offcanvas-overlay-zindex: 11`, `-push-zindex: 12`, `-overlap-zindex: 13`,
  `-reveal-zindex: 12` with an auto-bump so overlay < push < overlap (L37-51, L85-89).
- `$offcanvas-fixed-reveal: true` (L63): revealed panel stays `position: fixed`.
- `$maincontent-class: 'off-canvas-content'` (L70): the content class the CSS targets; the JS
  uses the `data-off-canvas-content` attribute, so renaming needs both.
- `$offcanvas-exit-background` (L67), shadows and background are theming.

### 6.9 Behaviour that only jQuery makes easy

- Document-wide discovery of triggers by id at init and the `open/close/toggle.zf.trigger`
  event protocol from the Triggers utility (L100-103, L170-175). Angular replaces this with
  template references or a service keyed by id.
- Creating the overlay `div` and inserting it after the panel or into the content (L109-119).
- Auto-detecting `nested` and the content container by DOM walking (L72-82).
- Reading `revealOn` / `inCanvasOn` back out of class names with regexes (L122-127, L147-154).
- Touch scroll locking and the scrollbox propagation logic (L322-389, L427-433).
- Sticky-element pseudo-fixing by rewriting inline `top` from `scrollTop` (L257-291).
- Every completion hook depends on `transitionend` of a CSS transition the theme controls.
- The native `<dialog>`/`popover` + `inert` platform features cover the modal, Escape,
  focus-return and scroll-lock parts of this list; the push transition (moving the content)
  and reveal/in-canvas breakpoints stay CSS.

---

## 7. Cross-plugin observations for later tickets

1. State class placement differs per plugin: AccordionMenu marks the submenu `ul.is-active`;
   Drilldown marks the submenu `ul.is-active` (plus `invisible`/`visible`/`is-closing`);
   DropdownMenu marks the parent `li.is-active` and the submenu `ul.js-dropdown-active`;
   OffCanvas marks the panel `is-open`/`is-closed` and the content `is-open-<pos>`. The Menu
   docs' `li.is-active` "current page" style (`_menu.scss` L477) collides with DropdownMenu's
   use of the same class on the open parent (`_dropdown-menu.scss` L474-477 restyles it).
2. ARIA coverage: AccordionMenu and Drilldown expose expanded/hidden state; DropdownMenu
   exposes only `aria-haspopup`. All three put `role="menubar"` on a `ul` and `menuitem` on
   links, and `aria-expanded` on `role="none"` `li`s, which does not match the APG menubar
   pattern (state belongs on the `menuitem`). None implement roving tabindex.
3. Visibility mechanics: AccordionMenu = jQuery slide (inline styles); Drilldown = CSS
   transform transition + `visibility`; DropdownMenu = `display` via class; ResponsiveToggle =
   inline `display` or Motion UI; OffCanvas = CSS transform transition + `visibility`.
4. Three plugins listen to `changed.zf.mediaquery` (ResponsiveMenu, ResponsiveToggle,
   OffCanvas), which comes from a resize listener comparing named breakpoints parsed from CSS
   (`meta.foundation-mq`). An Angular version needs one breakpoint source (CDK
   `BreakpointObserver` or `matchMedia` signals) fed from the same Sass `$breakpoints` map.
5. `data-mutate` / `mutateme.zf.trigger` is the cross-plugin "re-measure" protocol
   (Drilldown listens, ResponsiveToggle and ResponsiveMenu set or fire it).
6. Two JSDoc/documentation errors found: Drilldown `backButtonPosition` "left" (should be
   "top"); OffCanvas `transition` "detached"/"slide" (should be "overlap"). ResponsiveToggle's
   error message names `data-tab-bar`. ResponsiveMenu's destroy unbinds the wrong namespace.
