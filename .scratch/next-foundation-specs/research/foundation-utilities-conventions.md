# Foundation for Sites 6.9: core conventions and shared utilities

Ticket: `../issues/05-foundation-utilities-conventions.md`
Source clone: `d:/projects/github/foundation/foundation-sites` (all relative paths below are under it)
Version: `js/foundation.core.js:5` declares `FOUNDATION_VERSION = '6.9.0'`

Every claim cites the file and line (or function) that owns it. Line numbers are from the clone as read on 2026-09-25.

## 1. Plugin lifecycle and option parsing

### 1.1 The `Plugin` base class

`js/foundation.core.plugin.js` defines the abstract `Plugin` class that all 21 plugins extend (`Positionable` in `js/foundation.positionable.js:26` extends it too, and `Dropdown` and `Tooltip` extend `Positionable`).

- `constructor(element, options)` (`foundation.core.plugin.js:8-20`):
  1. calls `this._setup(element, options)` (each plugin defines this);
  2. derives `pluginName = hyphenate(this.className)` (`getPluginName`, lines 45-47; `hyphenate` turns PascalCase into kebab-case, lines 41-43), so `DropdownMenu` becomes `dropdown-menu` and `OffCanvas` becomes `off-canvas`;
  3. assigns `this.uuid = GetYoDigits(6, pluginName)`;
  4. writes `data-<plugin-name>="<uuid>"` on the element if the attribute has no value yet, and stores the instance as jQuery data `zfPlugin`;
  5. fires the jQuery event `init.zf.<plugin-name>` on the element (line 19).
- `destroy()` (lines 22-36): calls `this._destroy()`, removes `data-<plugin-name>` and the `zfPlugin` data, fires `destroyed.zf.<plugin-name>`, then nulls every own property.

Because the lifecycle event names come from `hyphenate(className)`, they are `init.zf.dropdown-menu`, `init.zf.off-canvas`, `init.zf.responsive-accordion-tabs`, while the plugins' own state events use camelCase namespaces such as `closed.zf.offCanvas` (`js/foundation.offcanvas.js:544`) and `closed.zf.drilldown`. Two naming conventions coexist.

### 1.2 The per-plugin `_setup` contract

Every plugin follows one shape (for example `js/foundation.accordion.js:21-36`):

```
_setup(element, options) {
  this.$element = element;
  this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);
  this.className = 'Accordion'; // ie9 back compat
  this._init();
  this._events();
  Keyboard.register('Accordion', { ... });   // only keyboard-driven plugins
}
```

Option precedence is therefore: `X.defaults` < every `data-*` attribute on the element (jQuery `.data()`, which camelCases `data-multi-expand` into `multiExpand` and coerces `"true"`, `"false"`, numbers and JSON) < the `options` object passed to the constructor. `docs/pages/javascript.md:146-174` documents this order and the camelCase-to-kebab-case rule.

Variations found by `rg -n "this\.options = " js/`:

- `Abide` uses a deep merge, `$.extend(true, {}, Abide.defaults, this.$element.data(), options)` (`js/foundation.abide.js:21`), because its defaults hold nested `patterns` and `validators` maps.
- `ResponsiveToggle` merges a second time with the target menu's `data-*` attributes (`js/foundation.responsiveToggle.js:49`).
- `ResponsiveMenu._setup(element)` takes no options and `ResponsiveMenu.defaults = {}` (`js/foundation.responsiveMenu.js:45-50, 151`); `ResponsiveAccordionTabs.defaults = {}` as well (`js/foundation.responsiveAccordionTabs.js:289`). Both read their rules from a `data-responsive-menu="..."` / `data-responsive-accordion-tabs="..."` value instead of options.
- `Toggler` passes `element.data()` directly (`js/foundation.toggler.js:25`); same effect.

Every plugin declares `X.defaults = { ... }` with `@option`, `@type`, `@default` JSDoc per key (for example `js/foundation.reveal.js:519-620`). These JSDoc blocks are the source the Foundation docs render for each plugin's "JavaScript Reference" and are the authoritative list of `data-*` option names.

### 1.3 Registration, reflow, `data-options`

`js/foundation.core.js`:

- `Foundation.plugin(plugin, name)` (lines 26-36) stores the constructor under `Foundation[name]` and `Foundation._plugins[hyphenate(name)]`; the hyphenated key is also the identifying attribute (`data-reveal`, `data-off-canvas`). `js/entries/foundation.js:61-81` registers all 21 plugins.
- `$(document).foundation()` (`addToJquery`, lines 179-219): with no argument it removes the `.no-js` class from any element that has it, calls `MediaQuery._init()`, then `Foundation.reflow(this)`. With a string argument it invokes that method on the element's `zfPlugin` instance (`$('#reveal').foundation('open')`), throwing `ReferenceError` for unknown methods.
- `Foundation.reflow(elem, plugins)` (lines 133-176): for each registered plugin name, finds `[data-<name>]` inside `elem` (and `elem` itself) that has no `zfPlugin` data, and constructs the plugin with `opts = { reflow: true }` plus the parsed `data-options`.
- `data-options` parsing (lines 161-166): the attribute value is split on `;`, each part on `:`, both sides trimmed, and the value run through `parseValue` (lines 323-328: `'true'` and `'false'` become booleans, numeric strings become floats, everything else stays a string). The result is passed as the constructor `options` argument, so `data-options` wins over individual `data-*` attributes (`docs/pages/javascript.md:170-174` gives the `data-slide-speed="500" data-options="slideSpeed:250;"` example resolving to 250).
- Sticky exception (`docs/pages/javascript.md:160`): `topAnchor`/`btmAnchor` values have the form `id:top` / `id:bottom` (`js/foundation.sticky.js:90-104` splits them on `:`), which collides with the `key:value` syntax of `data-options`, so those two must be individual attributes.
- `Foundation.reInit(plugins)` (lines 94-126) calls `_init()` again on matching instances (by jQuery collection, plugin name string, or array); documented at `docs/pages/javascript.md:192-210`.
- `Foundation.registerPlugin` / `unregisterPlugin` (lines 46-86) are the pre-`Plugin`-class equivalents kept for compatibility.
- `Foundation.util.throttle(func, delay)` (lines 230-243) is exported and documented but no plugin in `js/` calls it (`rg -n throttle js/` finds only the TypeScript declaration). The doc section is `docs/pages/javascript-utilities.md:182-220`.

Rules stated in `docs/pages/javascript.md`: one plugin per element, plugins may nest (lines 129-131); global defaults via `Foundation.Accordion.defaults.x = ...` (139-144); methods prefixed `_` are internal API (244-246); callbacks as settings were removed in 6.0 and every hook is a DOM event (262-264); plugins on HTML added after load need `.foundation()` called on the new subtree (178-188).

### 1.4 Core utilities (`js/foundation.core.utils.js`)

| Export | Lines | Behaviour | Consumers (from `rg` over `js/`) |
| --- | --- | --- | --- |
| `rtl()` | 7-9 | `$('html').attr('dir') === 'rtl'` | Keyboard `handleKey` (ltr/rtl command merge), `Positionable._getDefaultAlignment`, DropdownMenu (`:64`, `:87`), Slider (`:388`) |
| `GetYoDigits(length = 6, namespace)` | 19-27 | random base-36 id, `<id>-<namespace>` | every plugin that needs an `id` for ARIA relations: Abide, Accordion, AccordionMenu, Drilldown, Dropdown, Equalizer, Interchange, Magellan, Orbit, ResponsiveAccordionTabs, ResponsiveMenu, Slider, SmoothScroll, Sticky, Tooltip |
| `RegExpEscape(str)` | 37-39 | escape for `new RegExp` | Toggler (`aria-controls` id check, `:74`) |
| `transitionend($elem)` | 41-64 | vendor-prefixed `transitionend` name; if transitions are unsupported it fires the event manually after 1 ms | Motion (`util.motion.js:86`), Drilldown (7 call sites), OffCanvas (`:444`, `:478`, `:517`) |
| `onLoad($elem, handler)` | 78-93 | runs `handler` once on window `load`, or on next tick if `document.readyState === 'complete'`; returns the event type string | Triggers.init, Accordion (`:99` deep link), Magellan (`:94`), OffCanvas (`:197`), Reveal (`:83`), Sticky (`:61`), Tabs (`:85`) |
| `ignoreMousedisappear(handler, {ignoreLeaveWindow, ignoreReappear})` | 113-143 | wraps a `mouseleave` handler so the mouse leaving the document to browser chrome does not count | Dropdown (`:178`, `:189`), DropdownMenu (`:155`), Tooltip (`:209`) |

## 2. Triggers (`js/foundation.util.triggers.js`)

### 2.1 Initialisation

`Triggers.init($, Foundation)` (lines 244-258) runs once (`$.triggersInitialized` guard) on window load via `onLoad`, installing:

- simple listeners (`addSimpleListeners`, 224-233): delegated `click.zf.trigger` on `document` for `[data-open]`, `[data-close]`, `[data-toggle]`; `close.zf.trigger` on `[data-closeable], [data-closable]`; `focus.zf.trigger blur.zf.trigger` on `[data-toggle-focus]`;
- global listeners (`addGlobalListeners`, 235-241): one `MutationObserver` per `[data-resize], [data-scroll], [data-mutate]` element found in `document` at that moment; a window `resize.zf.trigger` listener debounced 250 ms; a window `scroll.zf.trigger` listener debounced 10 ms (the `debounce || 10` default at line 163); and the `closeme` listener.

`Foundation.IHearYou` is kept as an alias of `addGlobalListeners` for 6.2-era code (line 256). Plugins that need the trigger bus call `Triggers.init($)` themselves in `_setup`, described as idempotent: Dropdown (`:33`), OffCanvas (`:49`), Slider (`:36`), Reveal (`:36`), Interchange (`:30`), Magellan (`:30`), Sticky (`:28`), Toggler (`:30`), Tooltip (`:33`).

Because the mutation observers are created only for elements present at window `load` (lines 181-222 run `$elem.find(...)` once), an element given `data-resize` after load never receives `resizeme.zf.trigger` from the observer path. Plugins initialised on dynamically inserted HTML therefore miss resize and scroll notifications unless the page re-runs `Triggers.Initializers.addMutationEventsListener`.

### 2.2 Click triggers

The shared helper `triggers(el, type)` (lines 15-19) splits the attribute value on spaces, so `data-open="a b"` targets `#a` and `#b`. It uses `triggerHandler` (non-bubbling, only the target's own handlers) for `open` and `toggle`, and `trigger` (bubbling) for `close`. The trigger element is passed as the event's extra argument.

| Attribute | Listener (lines) | Event fired | Target |
| --- | --- | --- | --- |
| `data-open="id"` | `openListener` 30-32 | `open.zf.trigger` (triggerHandler) | each `#id` |
| `data-close="id"` | `closeListener` 33-41 | `close.zf.trigger` (trigger, bubbles) | each `#id` |
| `data-close` (no value) | same | `close.zf.trigger` on the trigger element itself, bubbling to the nearest `[data-closable]` or plugin ancestor | ancestor |
| `data-toggle="id"` | `toggleListener` 42-49 | `toggle.zf.trigger` (triggerHandler) | each `#id` |
| `data-toggle` (no value) | same | `toggle.zf.trigger` on itself, bubbling | ancestor |
| `data-toggle-focus="id"` | `toggleFocusListener` 64-67, 95-99 | `toggle.zf.trigger` on `#id`, on both `focus` and `blur` | `#id` |
| `data-closable[="mui-class"]` | `closeableListener` 50-63 | on `close.zf.trigger`: `e.stopPropagation()`, then `Motion.animateOut(this, class)` if a class is given else jQuery `.fadeOut()`, then fires `closed.zf` | itself |

`data-closable` is documented for Callout (`docs/pages/callout.md:109-116`, "If no class is added, the plugin defaults to jQuery's `.fadeOut()`") and Close Button (`docs/pages/close-button.md:27-33`); `data-toggle-focus` is documented under Toggler (`docs/pages/toggler.md:114-125`). `docs/pages/javascript-utilities.md:154-180` documents the whole set, including the note that an id-less trigger "bubbles up to window".

### 2.3 Resize, scroll, mutate

Lines 104-122 and 157-222:

1. On debounced window resize, `resizeListener($nodes)` sets `data-events="resize"` on every `[data-resize]` element (and on IE 9 without `MutationObserver` calls `triggerHandler('resizeme.zf.trigger')` directly). `scrollListener` does the same with `data-events="scroll"`.
2. Each observed element's `MutationObserver` (options: `attributes: true, childList: true, subtree: true, attributeFilter: ['data-events', 'style']`) translates:
   - `data-events` attribute change with value `scroll` into `scrollme.zf.trigger` (extra args: the element, `window.pageYOffset`);
   - `data-events` attribute change with value `resize` into `resizeme.zf.trigger`;
   - any `style` attribute change or any `childList` change in the subtree into `mutateme.zf.trigger` on the closest `[data-mutate]` (also setting `data-events="mutate"` there).

Plugins also fire `mutateme.zf.trigger` by hand on nested `[data-mutate]` elements after showing content so that hidden-then-shown Equalizers, Stickies and Drilldowns recompute: Tabs (`js/foundation.tabs.js:285`), Toggler (`:119`, `:129`, `:136`), ResponsiveToggle (`:109`, `:120`).

### 2.4 `closeme.zf.<plugin>`

`addClosemeListener` (lines 135-155) installs a window listener for `closeme.zf.dropdown`, `closeme.zf.tooltip`, `closeme.zf.reveal` (plus any extra names passed) only if `[data-yeti-box]` elements exist at init. `closeMeListener` (123-131) reads the plugin name from the event namespace and fires `close.zf.trigger` on every `[data-<plugin>]` element whose `data-yeti-box` is not the id passed with the event. Dropdown (`js/foundation.dropdown.js:251`), Tooltip (`:148`) and Reveal (`:271`) fire it when opening, so one open pane closes its siblings. `data-yeti-box` is written by those three plugins on their own element (Dropdown `:56`, `:81`; Tooltip `:62`; Reveal `:71`).

### 2.5 Who listens to what

| Plugin | `open/close/toggle.zf.trigger` | `resizeme` | `scrollme` | `mutateme` | Self-attaches |
| --- | --- | --- | --- | --- | --- |
| Dropdown | open, close, toggle (`dropdown.js:144-146`); anchors are `[data-toggle="id"]` else `[data-open="id"]` (`:52`) | `:147` reposition | - | - | `data-yeti-box`, `data-resize` (`:81-82`) |
| OffCanvas | open, close, toggle (`offcanvas.js:170-173`); `[data-open|close|toggle="id"]` get `aria-expanded`, `aria-controls` (`:100-103`) | - | - | - | - |
| Reveal | open, toggle; close only when the event target is the modal itself or the `[data-closable]` ancestor passed in (`reveal.js:150-157`) | `:158`, `:346` | - | - | `data-yeti-box`, `data-resize` (`:71-72`) |
| Toggler | toggle only (`toggler.js:86`); `[data-open~=id], [data-close~=id], [data-toggle~=id]` get `aria-expanded`, `aria-controls` (`:42-43`, `:71-78`) | - | - | fires on children | - |
| Tooltip | close only (`tooltip.js:245`) | `:267` reposition | - | - | `data-toggle`, `data-resize`, `data-yeti-box` on the trigger element (`:60-65`) |
| Drilldown | - | - | - | `:181` recalc dims | `data-mutate` (`:64`) |
| Equalizer | - | `:78` | - | `:79` | `data-resize`, `data-mutate` (`:42-43`) |
| Interchange | - | `:62` reflow | - | - | `data-resize` (`:46`) |
| Magellan | - | `:97` reflow | `:98` update active | - | `data-resize`, `data-scroll` (`:45-46`) |
| Orbit | - | `:188` | - | - | `data-resize` (`:67`) |
| Sticky | - | `:141` | - | `:145` self, `:150` anchor | `data-resize`, `data-mutate` on self (`:54`), `data-mutate` on anchor (`:56`) |
| ResponsiveMenu | - | - | - | - | `data-mutate` (`:89`, "since children may need it") |
| Slider | calls `Triggers.init` (`slider.js:36`) but binds no `.zf.trigger` event | - | - | - | - |

Accordion, AccordionMenu, Abide, DropdownMenu, ResponsiveAccordionTabs, SmoothScroll and Tabs do not import Triggers at all.

## 3. MediaQuery (`js/foundation.util.mediaQuery.js`)

### 3.1 Sass source of truth

`scss/util/_breakpoint.scss`:

- `$breakpoints` (lines 14-20): `small: 0`, `medium: 640px`, `large: 1024px`, `xlarge: 1200px`, `xxlarge: 1440px`. The first key must be `0` (lines 41-46).
- `$breakpoints-hidpi` (25-31): `hidpi-1: 1`, `hidpi-1-5: 1.5`, `hidpi-2: 2`, `retina: 2`, `hidpi-3: 3`.
- `$breakpoint-classes: (small medium large)` (50) controls which names get `.small-6`-style classes.
- `$print-breakpoint: large` (35): named breakpoints up to it emit `@media print, screen and ...` (176-183).
- `breakpoint($val)` function (55-137) accepts `name`, `name up`, `name only`, `name down`, or a px/rem/em value. px is converted to em (`-zf-bp-to-em`, base `$global-font-size`). A named `down`/`only` upper bound is the next breakpoint minus `0.00125em` (0.02 px) to survive browser zoom (116-120). `landscape`/`portrait` map to orientation queries (76-78).
- `breakpoint($values...)` mixin (152-193) wraps `@content`; also exposes the current breakpoint to nested Sass via `$-zf-size`.
- `-zf-bp-serialize($map)` (201-209) turns the map into `small=0em&medium=40em&large=64em&xlarge=75em&xxlarge=90em`.
- `scss/_global.scss:144-146` inside `foundation-global-styles` emits `.foundation-mq { font-family: '<serialized>'; }` with the comment "These styles are applied to a `<meta>` tag, which is read by the Foundation JavaScript". `docs/pages/media-queries.md:194` states the JS therefore requires `foundation-everything()` or `foundation-global-styles()` to be compiled in.

### 3.2 JavaScript reader

- `MediaQuery._init()` (lines 79-113): guarded by `isInitialized`; appends `<meta class="foundation-mq" name="foundation-mq" content>` to `<head>` if absent; reads `$('.foundation-mq').css('font-family')`; `parseStyleToObject` (299-333) strips the surrounding quotes and parses the query-string; builds `queries = [{ name, value: 'only screen and (min-width: <em>)' }]` in Sass map order; sets `current`; starts `_watcher`. `_reInit()` (121-124) resets the guard for late-loaded CSS.
- Public API (all documented in `docs/pages/media-queries.md:187-236` and `docs/pages/javascript-utilities.md:87-107`):
  - `atLeast(size)` (132-140): `window.matchMedia(get(size)).matches`, `false` for unknown names.
  - `only(size)` (149-151): `size === _getCurrentSize()`.
  - `upTo(size)` (159-171): `!atLeast(next(size))`, or `true` when `size` is the last breakpoint.
  - `is(size)` (179-200): parses `"medium"`, `"medium up"`, `"medium only"`, `"medium down"`; throws on any other modifier.
  - `get(size)` (208-217): the query string or `null`.
  - `next(size)` (225-236): following breakpoint name or `null`; throws for unknown names.
  - `current` (property): name of the largest matching query (`_getCurrentSize`, 262-274); `queries` (array).
- `_watcher()` (281-293) binds `resize.zf.trigger` on `window` (this is jQuery's plain `resize` event under a namespace, not the debounced Triggers pipeline), recomputes the current size on every resize event and fires `changed.zf.mediaquery` on `$(window)` with `[newSize, oldSize]` when the name changes.
- A `window.matchMedia` polyfill (lines 19-66) is bundled for browsers older than IE 10.

### 3.3 Consumers

| Plugin | Calls | Option read | Listens to `changed.zf.mediaquery` |
| --- | --- | --- | --- |
| Equalizer | `_init` (`:39`), `is` (`:119`) | `equalizeOn` (default `''`, `:312`) | `:57` |
| Interchange | `_init` (`:42`), iterates `queries` (`:110-112`) to map rule names to media queries | rules from `data-interchange` | - (uses `resizeme`) |
| OffCanvas | `_init` (`:50`), `atLeast` (`:198`, `:204`, `:217`) | `revealOn` (null, `:672`), `inCanvasOn` (null, `:680`) | `:183`, `:203` |
| ResponsiveAccordionTabs | `_init` (`:74`), `atLeast` per rule key (`:148`) | rule string | `:136` |
| ResponsiveMenu | `_init` (`:63`), `atLeast` per rule key (`:117`) | rule string | `:100` |
| ResponsiveToggle | `_init` (`:38`), `atLeast` (`:82`, `:100`) | `hideFor` (`'medium'`, `:141`) | `:70` |
| Reveal | `_init` (`:48`), caches `current` (`:51`) | - | - |
| Sticky | `_init` (`:39`), `is` (`:305`) | `stickyOn` (`'medium'`, `:473`) | - (re-evaluated on `resizeme`) |
| Tabs | - | `matchHeight` | `:166` |
| Tooltip | `_init` (`:43`), `is` (`:133`) | `showOn` (`'small'`, `:366`) | - |

## 4. Motion UI (`js/foundation.util.motion.js`, `docs/pages/motion-ui.md`)

### 4.1 Class protocol

`animate(isIn, element, animation, cb)` (lines 54-100) is the whole engine; `Motion.animateIn` / `Motion.animateOut` (13-19) are its two entry points.

1. `reset()`: set `transitionDuration = 0` and remove `mui-enter mui-enter-active <animation>` (or the leave pair).
2. Add the `animation` class (for example `fade-in`) and inline `transition: none`.
3. First `requestAnimationFrame`: add `mui-enter` (or `mui-leave`); for `in`, `.show()`.
4. Second `requestAnimationFrame`: force layout by reading `offsetWidth`, clear inline `transition`, add `mui-enter-active` (or `mui-leave-active`).
5. On the first `transitionend` (`transitionend($elem)` from core utils, so a browser without transitions gets a synthetic event after 1 ms): for `out`, `.hide()`; `reset()`; call `cb` with the element as `this`.

Class constants: `initClasses = ['mui-enter', 'mui-leave']`, `activeClasses = ['mui-enter-active', 'mui-leave-active']` (lines 9-10). No event is fired by `Motion`; the callback is the only completion signal. Durations and easings live entirely in Motion UI's Sass; the JS only toggles classes (`docs/pages/motion-ui.md:205`; the `Foundation.Motion.animateIn/animateOut` reference is at lines 192-203).

Motion UI itself is a separate package (`npm install motion-ui`, `docs/pages/motion-ui.md:21-60`) providing `@include motion-ui-transitions; @include motion-ui-animations;`. Its built-in transition class names are listed at `docs/pages/motion-ui.md:101-155`: `slide-in-down|left|up|right`, `slide-out-down|left|up|right`, `fade-in`, `fade-out`, `hinge-in-from-top|right|bottom|left|middle-x|middle-y`, `hinge-out-from-*`, `scale-in-up|down`, `scale-out-up|down`, `spin-in`, `spin-out`, `spin-in-ccw`, `spin-out-ccw`. Custom transitions come from mixins such as `mui-hinge` (`:157-171`). The `foundation-sites` clone does not ship the Motion UI Sass (`rg mui-enter scss/` finds nothing).

### 4.2 `Move`

`Move(duration, elem, fn)` (lines 22-43) runs `fn` on every animation frame until `duration` ms have elapsed, then fires `finished.zf.animate` (both `trigger` and `triggerHandler`); `duration === 0` runs `fn` once synchronously. Only Slider uses it (`js/foundation.slider.js:267`) with `moveTime` (default `200`, `:670`) to move the handle, then fires `moved.zf.slider` on `finished.zf.animate` (`:288-293`).

### 4.3 Which plugins accept Motion UI options

| Plugin | Option(s) | Default | Call site |
| --- | --- | --- | --- |
| Reveal | `animationIn`, `animationOut` (`data-animation-in`, `data-animation-out`) | `''`, `''` (`reveal.js:526`, `:533`) | `Motion.animateIn(this.$element, animationIn)` at `:295`, overlay hard-coded `fade-in` at `:293`; `animateOut` at `:409`, overlay `fade-out` at `:406` |
| Toggler | `animate` (`data-animate="in-class out-class"`) | `false` (`toggler.js:171`) | split on space into `animationIn` / `animationOut` (`:48-52`); `_toggleAnimate` at `:126`, `:133`; `data-toggler` (class toggle) is the alternative |
| ResponsiveToggle | `animate` (`data-animate="in out"`) | not set (`responsiveToggle.js:149`) | `:52-56` parse, `:107`, `:113` |
| Orbit | `animInFromRight`, `animOutToRight`, `animInFromLeft`, `animOutToLeft`, gated by `useMUI` | `slide-in-right`, `slide-out-right`, `slide-in-left`, `slide-out-left`, `useMUI: true` (`orbit.js:445-467`, `:551`) | `:344-355` |
| Triggers `data-closable` | attribute value | jQuery `fadeOut()` when empty | `util.triggers.js:56-62` |

`docs/pages/motion-ui.md:67-71` lists Orbit as taking `data-animate`; the code has no such Orbit option. The four `animInFrom*`/`animOutTo*` options are the real ones.

Plugins that animate without Motion: Accordion and AccordionMenu use jQuery `slideDown`/`slideUp` with `slideSpeed` (default `250`, `accordion.js:355`, `accordionMenu.js:324`); Drilldown and OffCanvas rely on CSS transitions and wait for `transitionend` (Drilldown `:227-309`, OffCanvas `:444-517`, `transition` `'push'|'overlap'` and `transitionTime` options at `offcanvas.js:640-648`); SmoothScroll and Magellan use jQuery `.animate({ scrollTop })` with `animationDuration` / `animationEasing` (`smoothScroll.js:84-85`, defaults `500` / `'linear'` at `:116-124`).

## 5. Keyboard (`js/foundation.util.keyboard.js`)

### 5.1 Key map and parsing

`keyCodes` (lines 12-23): `9: TAB`, `13: ENTER`, `27: ESCAPE`, `32: SPACE`, `35: END`, `36: HOME`, `37: ARROW_LEFT`, `38: ARROW_UP`, `39: ARROW_RIGHT`, `40: ARROW_DOWN`. `Keyboard.keys` (line 79, built by `getKeyCodes` 191-197) exposes them as `Keyboard.keys.SPACE === 'SPACE'`.

`parseKey(event)` (62-76): looks up `event.which || event.keyCode` (both deprecated in modern browsers), otherwise `String.fromCharCode(which).toUpperCase()` stripped of non-word characters; prefixes `SHIFT_`, then `CTRL_`, then `ALT_` (so Ctrl+Shift+X reads `CTRL_SHIFT_X`), and trims a trailing underscore for modifier-only presses.

### 5.2 `register` and `handleKey`

- `register(componentName, cmds)` (151-153) stores `{ KEY: 'command' }` or `{ ltr: {...}, rtl: {...} }` under the component name.
- `handleKey(event, component, functions)` (95-135): warns and returns if the component was never registered; returns early if `event.zfIsKeyHandled === true` (so a nested plugin that already handled the key stops the outer one); when `ltr`/`rtl` maps exist, merges them with the document direction winning (`rtl()` from core utils); looks up `functions[command]`; if found, calls it, sets `event.zfIsKeyHandled = true`, then calls `functions.handled(returnValue)` if present; otherwise calls `functions.unhandled()` if present. Plugins use `handled` for `preventDefault()` and focus moves: AccordionMenu (`:181`), Drilldown (`:278`), Orbit (`:252`), OffCanvas (`:575`), Slider (`:547`), Accordion (`:167`), Tabs (`:232`).

### 5.3 Focus helpers

- `findFocusable($element)` (28-60): selector `a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]`, filtered to `:visible` with `tabindex >= 0`, sorted so positive `tabindex` values come first in ascending order, then `0`/absent.
- `trapFocus($element)` (162-177): computes the focusable list once, binds `keydown.zf.trapfocus`; `TAB` on the last focusable moves focus to the first, `SHIFT_TAB` on the first moves to the last. The list is not recomputed if the content changes while trapped. `releaseFocus($element)` (182-184) unbinds.
- Consumers: Reveal always traps while open (`reveal.js:290`, `:317`; release `:445`) and uses `findFocusable` for initial focus (`:297`, `:368`); Dropdown traps when `trapFocus: true` (default `false`, `dropdown.js:411`; `:270-271`, `:302-303`) and uses `findFocusable` for `autoFocus` (`:262`); OffCanvas traps when `trapFocus: true` (default `false`, `offcanvas.js:705`; `:457-459`, `:535-537`).

### 5.4 Per-plugin registrations

| Component (`register` name) | File:line | Bindings |
| --- | --- | --- |
| Accordion | `accordion.js:28-35` | ENTER, SPACE: toggle; ARROW_DOWN: next; ARROW_UP: previous; HOME: first; END: last |
| AccordionMenu | `accordionMenu.js:30-38` | ENTER, SPACE: toggle; ARROW_RIGHT: open; ARROW_UP: up; ARROW_DOWN: down; ARROW_LEFT: close; ESCAPE: closeAll |
| Drilldown | `drilldown.js:31-39` | ENTER, SPACE: open; ARROW_RIGHT: next; ARROW_UP: up; ARROW_DOWN: down; ARROW_LEFT: previous; ESCAPE: close |
| Dropdown | `dropdown.js:37-41` | ENTER, SPACE: toggle; ESCAPE: close |
| DropdownMenu | `dropdownMenu.js:37-45` | ENTER, SPACE: open; ARROW_RIGHT: next; ARROW_UP: up; ARROW_DOWN: down; ARROW_LEFT: previous; ESCAPE: close |
| OffCanvas | `offcanvas.js:55-57` | ESCAPE: close |
| Orbit | `orbit.js:38-47` | ltr: ARROW_RIGHT: next, ARROW_LEFT: previous; rtl: swapped |
| Reveal | `reveal.js:38-40` | ESCAPE: close (gated by `closeOnEsc`, default `true`, `:561`) |
| Slider | `slider.js:40-59` | ltr: ARROW_RIGHT/ARROW_UP: increase; ARROW_DOWN/ARROW_LEFT: decrease; SHIFT_ variants: increaseFast/decreaseFast; HOME: min; END: max; rtl: left/right swapped |
| Tabs | `tabs.js:28-37` | ENTER, SPACE: open; ARROW_RIGHT, ARROW_DOWN: next; ARROW_UP, ARROW_LEFT: previous (TAB bindings commented out) |

Not registered (no arrow-key model): Abide, Equalizer, Interchange, Magellan, ResponsiveAccordionTabs (delegates to Accordion/Tabs), ResponsiveMenu (delegates), ResponsiveToggle, SmoothScroll, Sticky, Toggler, Tooltip (Tooltip shows on focus/blur but imports no Keyboard, `tooltip.js:1-5`).

## 6. Nest (`js/foundation.util.nest.js`)

`Nest.Feather(menu, type = 'zf')` (lines 4-50) walks a `ul.menu` tree once at plugin init:

- the root `ul` gets `role="menubar"`; every `a` gets `role="menuitem"`; every `li` gets `role="none"`;
- an `li` that contains a child `ul` gets class `is-<type>-submenu-parent`; unless `type === 'accordion'` ("Accordions handle their own ARIA attributes", line 12) its first `a` gets `aria-haspopup="true"` and an `aria-label` (existing value or the link text); for `type === 'drilldown'` the `li` also gets `aria-expanded="false"`;
- that child `ul` gets classes `submenu is-<type>-submenu`, attribute `data-submenu=""`, and `role="menubar"`; for drilldown also `aria-hidden="true"`;
- an `li` whose parent is `[data-submenu]` gets classes `is-submenu-item is-<type>-submenu-item`.

`Nest.Burn(menu, type)` (52-63) strips `is-<type>-submenu`, `is-<type>-submenu-item`, `is-<type>-submenu-parent`, `is-submenu-item`, `submenu`, `is-active`, `data-submenu` and inline `display` from the tree.

Consumers and the resulting class families: AccordionMenu `'accordion'` (`accordionMenu.js:48`, burn `:306`), DropdownMenu `'dropdown'` (`dropdownMenu.js:54`, `:387`), Drilldown `'drilldown'` (`drilldown.js:47`, `:538`). The Sass that styles those classes: `scss/components/_accordion-menu.scss`, `scss/components/_dropdown-menu.scss`, `scss/components/_drilldown.scss` (found by `rg -l "is-dropdown-submenu|is-drilldown-submenu|is-accordion-submenu" scss/`). The CSS contract therefore expects `is-dropdown-submenu-parent`, `is-dropdown-submenu`, `is-dropdown-submenu-item`, `is-accordion-submenu-*`, `is-drilldown-submenu-*` and the shared `submenu`, `is-submenu-item`, `is-active` classes on the markup even when Foundation JS is gone.

Note for later ARIA review: Nest puts `role="menubar"` on nested submenus as well as the root, which is not the APG menubar pattern (submenus should be `role="menu"`).

## 7. Box, Touch, Timer, ImageLoader

### 7.1 Box (`js/foundation.util.box.js`)

- `GetDimensions(elem)` (63-100): throws for `window`/`document`; returns `{ width, height, offset: {top, left}, parentDims: {...}, windowDims: {...} }` in document coordinates (`getBoundingClientRect` plus `pageXOffset`/`pageYOffset`; `windowDims` is `document.body`'s rect).
- `OverlapArea(element, parent, lrOnly, tbOnly, ignoreBottom)` (22-54): negative overflow on each side against `parent` or the window; returns the left+right or top+bottom sum when an axis flag is set, else the root-sum-of-squares.
- `ImNotTouchingYou(...)` (18-20): `OverlapArea(...) === 0`.
- `GetExplicitOffsets(element, anchor, position, alignment, vOffset, hOffset, isOverflow)` (116-173): `top`/`left` for `position` in `top|bottom|left|right` and `alignment` in `left|right|center` (for top/bottom) or `top|bottom|center` (for left/right).

Consumers: `Positionable` (`js/foundation.positionable.js`), the base of Dropdown and Tooltip, whose `_setPosition` (118-154) applies `GetExplicitOffsets`, then, unless `allowOverlap`, cycles alignments and positions (`POSITIONS = ['left','right','top','bottom']`, lines 5-14) until `OverlapArea` is 0, falling back to the least-overlap candidate. Its defaults (158-204): `position: 'auto'` (resolves to `'bottom'`), `alignment: 'auto'` (left in LTR, right in RTL for top/bottom; bottom for left/right), `allowOverlap: false`, `allowBottomOverlap: true`, `vOffset: 0`, `hOffset: 0`. Dropdown also reads legacy position class names (`dropdown.js:88-95`). DropdownMenu calls `ImNotTouchingYou($sub, null, true)` to flip submenus between `opens-left`, `opens-right` and `opens-inner` (`dropdownMenu.js:310-318`). Drilldown uses `GetDimensions` to size the menu to its tallest pane (`drilldown.js:510`).

### 7.2 Touch (`js/foundation.util.touch.js`)

`Touch.init($)` (157-162), idempotent, installs two things:

- `setupSpotSwipe` (110-112): jQuery special events `swipe`, `tap`, `swipeleft`, `swiperight`, `swipeup`, `swipedown` (class `SpotSwipe`, 81-100) driven by `touchstart`/`touchmove`/`touchend`. Only horizontal swipes are computed (the vertical branch is commented out, 46-48). Thresholds on `$.spotSwipe`: `moveThreshold: 75` px, `timeThreshold: 200` ms, `preventDefault: false`, `enabled: 'ontouchstart' in document.documentElement`. A touch that never moved fires `tap`.
- `setupTouchHandler` (117-155): `$.fn.addTouch()` re-dispatches `touchstart`/`touchmove`/`touchend` as synthetic `mousedown`/`mousemove`/`mouseup` `MouseEvent`s on the touch target.

Consumers: Orbit `swipe: true` (`orbit.js:495`) binds `swipeleft.zf.orbit`/`swiperight.zf.orbit` on slides (`:192-199`); Slider `this.handles.addTouch()` (`slider.js:489`) so the mouse-drag code also serves touch; Dropdown, DropdownMenu, Reveal bind `tap.zf.*` alongside `click` on `body`/overlay for close-on-outside-click (`dropdown.js:227`, `dropdownMenu.js:277`, `reveal.js:164`, `:371`); Tooltip binds `tap.zf.tooltip touchend.zf.tooltip` (`tooltip.js:219`) for its `disableForTouch` / `touchCloseText` behaviour. Dropdown, DropdownMenu, Reveal, Slider and Orbit call `Touch.init($)` in `_setup`.

### 7.3 Timer (`js/foundation.util.timer.js`)

`new Timer($elem, { duration, infinite }, cb)` (1-43): `start()` schedules `cb` with `setTimeout` for the remaining time (full `duration` on first run), `pause()` records the remaining time, `restart()` resets it; `isPaused` flag. Fires `timerstart.zf.<ns>` and `timerpaused.zf.<ns>` on the element, where `<ns>` is the first jQuery data key of the element (line 4), which for Orbit is `orbit`. Only Orbit uses it (`orbit.js:113-124`, `geoSync`) with `timerDelay: 5000`, `autoPlay: true`, `pauseOnHover: true`, `infiniteWrap: true` (`:474-502`). `docs/pages/javascript-utilities.md:124-132`: "Similar to `setInterval`, except you can pause and resume where you left off."

### 7.4 ImageLoader (`js/foundation.util.imageLoader.js`)

`onImagesLoaded($images, callback)` (8-40): counts images already `complete` with a defined `naturalWidth`; for the rest, creates a detached `new Image()` with the same `src` and listens for `load.zf.images error.zf.images` (errors count as loaded); calls `callback` once the count reaches zero, immediately for an empty set. Consumers wait for images before measuring heights: Equalizer (`equalizer.js:63`), Orbit (`orbit.js:80`), Tabs with `matchHeight` (`tabs.js:97`).

## 8. Accessibility and JavaScript guidance in the docs

`docs/pages/accessibility.md`:

- Principles (14-17): structure with the right HTML elements; label everything (visibility classes for visually-hidden labels, `alt` on images); do not rely on visual cues alone; everything usable by keyboard, mouse and touch.
- Contrast (25): at least 4.5:1 for normal text and 3:1 for large text.
- Keyboard (30-34): Tab is primary navigation; "All of our JavaScript plugins provide advanced keyboard support by default" (arrow keys for menus, tabs, sliders).
- Plugins add required ARIA attributes automatically (44); each component page documents the markup hooks.
- Focus rings (46-55): Foundation CSS depends on `what-input` (`[data-whatinput='mouse']`) to hide outlines for mouse users only; the `disable-mouse-outline` mixin is at `scss/util/_mixins.scss:206-207` and is applied in `_global.scss:224`, `_button.scss:123`, `_close-button.scss:100`, `_dropdown-menu.scss:150`. `scss/vendor/normalize.scss:286-287` also keys on `[data-whatinput="mouse"]`, `[data-whatinput="touch"]`. Without `what-input` in the page those selectors never match and default outlines stay on, which is the safe direction.
- Links to WCAG 2.0, MDN, WAI, Section 508, WebAIM, a11yproject checklist; tools WAVE, contrast checker, ChromeVox, JAWS, NVDA (63-76).

`docs/pages/javascript.md` (covered in section 1): installation and module formats (UMD, CJS, ESM, ES6; tree shaking, 66-100), initialisation, plugin-per-attribute, one plugin per element, configuration precedence, `data-options`, adding plugins after page load, `reInit`, programmatic API and `_`-prefixed internals, events replace callbacks.

`docs/pages/javascript-utilities.md` (covered in sections 2-7): Box (11), Keyboard (46), MediaQuery (87), Motion and Move (109), Timer (124), ImageLoader (134), Touch (142), Triggers (154), Throttle (182), and Miscellaneous (223: `GetYoDigits`, `getFnName`, `transitionend`); numbers are the heading lines.

## 9. Plugin-to-utility dependency table

Compiled from the `import` lines and call sites in each `js/foundation.<plugin>.js`. "core.utils" lists the named imports. A dash means the plugin neither imports nor calls the utility.

| Plugin | Triggers | MediaQuery | Motion / Move | Keyboard | Nest | Box | Touch | Timer | ImageLoader | core.utils | Other plugins |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Abide | - | - | - | - | - | - | - | - | - | GetYoDigits | - |
| Accordion | - | - | - | register, handleKey | - | - | - | - | - | GetYoDigits, onLoad | - |
| AccordionMenu | - | - | - | register, handleKey | Feather('accordion'), Burn | - | - | - | - | GetYoDigits | - |
| Drilldown | listens mutateme; sets data-mutate | - | - | register, handleKey | Feather('drilldown'), Burn | GetDimensions | - | - | - | GetYoDigits, transitionend | - |
| Dropdown | init; open/close/toggle/resizeme; closeme; data-yeti-box, data-resize | - | - | register, handleKey, findFocusable, trapFocus | - | via Positionable | init; tap | - | - | GetYoDigits, ignoreMousedisappear, rtl (via Positionable) | extends Positionable |
| DropdownMenu | - | - | - | register, handleKey | Feather('dropdown'), Burn | ImNotTouchingYou | init; tap | - | - | rtl, ignoreMousedisappear | - |
| Equalizer | listens resizeme, mutateme; sets data-resize, data-mutate | _init, is; changed | - | - | - | - | - | - | onImagesLoaded | GetYoDigits | - |
| Interchange | init; listens resizeme; sets data-resize | _init, queries | - | - | - | - | - | - | - | GetYoDigits | - |
| Magellan | init; listens resizeme, scrollme; sets data-resize, data-scroll | - | - | - | - | - | - | - | - | GetYoDigits, onLoad | imports SmoothScroll |
| OffCanvas | init; open/close/toggle; sets aria on triggers | _init, atLeast; changed | - | register, handleKey, trapFocus | - | - | - | - | - | onLoad, transitionend | - |
| Orbit | listens resizeme; sets data-resize | - | animateIn/Out | register (ltr/rtl), handleKey | - | - | init; swipeleft/right | new Timer | onImagesLoaded | GetYoDigits | - |
| ResponsiveAccordionTabs | - | _init, atLeast; changed | - | - | - | - | - | - | - | GetYoDigits | swaps Accordion / Tabs |
| ResponsiveMenu | sets data-mutate | _init, atLeast; changed | - | - | - | - | - | - | - | GetYoDigits | swaps DropdownMenu / Drilldown / AccordionMenu |
| ResponsiveToggle | fires mutateme | _init, atLeast; changed | animateIn/Out | - | - | - | - | - | - | - | - |
| Reveal | init; open/close/toggle/resizeme; closeme; data-yeti-box, data-resize | _init, current | animateIn/Out | register, handleKey, findFocusable, trapFocus | - | - | init; tap | - | - | onLoad | - |
| Slider | init only | - | Move | register (ltr/rtl), handleKey | - | - | init; addTouch | - | - | GetYoDigits, rtl | - |
| SmoothScroll | - | - | - | - | - | - | - | - | - | GetYoDigits | - |
| Sticky | init; listens resizeme, mutateme; sets data-resize, data-mutate | _init, is | - | - | - | - | - | - | - | GetYoDigits, onLoad | - |
| Tabs | fires mutateme | changed | - | register, handleKey | - | - | - | - | onImagesLoaded | onLoad | - |
| Toggler | init; listens toggle; sets aria on triggers; fires mutateme | - | animateIn/Out | - | - | - | - | - | - | RegExpEscape | - |
| Tooltip | init; listens close, resizeme; closeme; sets data-toggle, data-resize, data-yeti-box | _init, is | - | - | - | via Positionable | tap | - | - | GetYoDigits, ignoreMousedisappear | extends Positionable |

Utility-first view:

- Triggers: 13 plugins touch it; Dropdown, OffCanvas, Reveal, Toggler, Tooltip are the ones that respond to `data-open`/`data-close`/`data-toggle`.
- MediaQuery: 10 plugins (Equalizer, Interchange, OffCanvas, ResponsiveAccordionTabs, ResponsiveMenu, ResponsiveToggle, Reveal, Sticky, Tabs, Tooltip).
- Keyboard `register`: 10 plugins (section 5.4); `trapFocus`: Reveal, Dropdown, OffCanvas.
- Motion: Reveal, Toggler, ResponsiveToggle, Orbit, plus `data-closable`; `Move`: Slider.
- Nest: AccordionMenu, DropdownMenu, Drilldown.
- Box: Dropdown and Tooltip (through Positionable), DropdownMenu, Drilldown.
- Touch: Orbit (swipe), Slider (addTouch), Dropdown, DropdownMenu, Reveal, Tooltip (tap).
- Timer: Orbit only.
- ImageLoader: Equalizer, Orbit, Tabs.

## 10. Modern counterpart candidates per utility

Listed as candidates only; the building-blocks ticket decides. Sources for the candidates are named so the deciding ticket can verify them.

| Foundation utility | What it does today | Candidates |
| --- | --- | --- |
| Plugin lifecycle (`_setup`, `_init`, `_destroy`, `init.zf.*`, `destroyed.zf.*`, `zfPlugin` data, `reflow`, `reInit`) | attribute-driven construction, jQuery data storage, lifecycle events, re-scan for new markup | Angular directive/component lifecycle (constructor + `inject()`, `afterRenderEffect`, `DestroyRef`); `input()` with `transform` for attribute coercion; the `data-<plugin>` selector as the directive selector; no `reflow` needed because Angular owns the DOM; `init`/`destroyed` events have no Angular consumer except tests |
| Option parsing (`data-*`, `data-options`, defaults, JS overrides) | three-tier merge via jQuery `.data()` and `$.extend` | signal `input()` per option with the Foundation camelCase name (map.md standing preference); `booleanAttribute` / `numberAttribute` transforms from `@angular/core` for the `"true"`/`"500"` coercion; `InjectionToken` with a default-options object for the `Foundation.X.defaults` global override (the pattern Angular Material uses, for example `MAT_DIALOG_DEFAULT_OPTIONS` in `d:/projects/github/angular/components/src/material/dialog/dialog.ts`); `data-options` has no counterpart and can be dropped |
| Triggers `data-open` / `data-close` / `data-toggle` / `data-toggle-focus` | document-level click delegation to ids, custom jQuery events | HTML `popovertarget` / `popovertargetaction="show|hide|toggle"` on `<button>` for popover-style targets (WHATWG HTML, https://html.spec.whatwg.org/multipage/popover.html); `commandfor` / `command="show-modal|close|toggle-popover|..."` invoker commands (WHATWG HTML, https://html.spec.whatwg.org/multipage/form-elements.html#attr-button-command, browser support to be checked on https://www.angular.courses/caniuse or caniuse); `<dialog>` with `form method="dialog"` for close; an Angular trigger directive that takes a template reference to the target instead of an id string (Material's `matMenuTriggerFor` in `src/material/menu/menu-trigger.ts`, CDK `cdkMenuTriggerFor`); Angular `output()` on the target plus `(click)` bindings for the cheapest version |
| Triggers `data-closable` | fade out or Motion UI class, then `closed.zf` | `animate.leave` on the element (Angular 20.2+ animations guide, `d:/projects/github/angular/angular/adev/src/content/guide/animations/`); `hidden` attribute or `@if` removal |
| Triggers `data-resize` / `data-scroll` / `data-mutate` + `resizeme` / `scrollme` / `mutateme` | debounced window events funnelled through a MutationObserver | `ResizeObserver` per element (native); `IntersectionObserver` for scroll-position work; `MutationObserver` directly if child changes matter; CDK `ViewportRuler` (`src/cdk/scrolling/viewport-ruler.ts`) for window size, CDK `ScrollDispatcher` (`src/cdk/scrolling/scroll-dispatcher.ts`) for scroll; CSS `container-type` / container queries for layout that only needs CSS; CSS `position: sticky` and `scroll-snap` remove the need for several consumers (Sticky, Orbit) |
| Triggers `closeme.zf.*` (close siblings when one opens) | window-level broadcast keyed on `data-yeti-box` | native `popover="auto"` light-dismiss, which closes other auto popovers by itself (HTML popover spec); a shared service with a signal for "currently open pane" injected by each directive; CDK Overlay's `OverlayContainer` ordering plus `cdkConnectedOverlayBackdrop`; `@angular/aria` menu/combobox primitives that own open state (`d:/projects/github/angular/components/src/aria/`) |
| MediaQuery (`atLeast`, `upTo`, `only`, `is`, `current`, `changed.zf.mediaquery`) plus the `meta.foundation-mq` handshake | Sass map serialized into a CSS `font-family` string, read back with `matchMedia` | CSS media queries and `@include breakpoint()` in Sass with no JS at all where only styling changes; CSS container queries for component-relative sizing; `window.matchMedia` wrapped in a signal (`toSignal` from `@angular/core/rxjs-interop`, or a small `effect`-free listener); CDK `BreakpointObserver` (`src/cdk/layout/breakpoints-observer.ts`) with a Foundation-named breakpoint map instead of the Material one; publishing the breakpoint values as CSS custom properties (`--nfs-breakpoint-medium`) or as an exported TypeScript constant generated from the Sass map, replacing the `font-family` trick; SSR needs a server-side default because `matchMedia` does not exist there |
| Motion (`animateIn` / `animateOut`, `mui-enter`, `mui-enter-active`, `mui-leave`, `mui-leave-active`) | class choreography over two animation frames plus `transitionend` | Angular `animate.enter` / `animate.leave` bindings (Angular animations guide under `adev/src/content/guide/animations/`), which apply enter/leave classes and wait for `animationend`/`transitionend`, so a Motion UI class name can be passed straight through; CSS `@starting-style` plus `transition-behavior: allow-discrete` for `display: none` transitions; the Web Animations API (`element.animate()`) for programmatic sequences; `View Transitions` for page-level effects; the map already rules the `motion-ui` package out as a dependency, so class names would be consumer-supplied |
| `Move` (rAF loop + `finished.zf.animate`) | frame-by-frame style updates for Slider | CSS transition on the handle's `inset-inline-start`/`transform` with `transitionend`; `<input type="range">` (the map's prototype candidate) needs no handle animation at all |
| Keyboard key map and `parseKey` | numeric `keyCode` lookup with `SHIFT_`/`CTRL_`/`ALT_` prefixes | `KeyboardEvent.key` values (`'ArrowDown'`, `'Escape'`, `'Home'`) and `event.shiftKey` etc. directly; CDK `keycodes` constants and `hasModifierKey` (`src/cdk/keycodes/`); RTL check via `Directionality` from `@angular/cdk/bidi` instead of reading `html[dir]` |
| Keyboard `register` / `handleKey` | per-component command tables with ltr/rtl merge | `@angular/aria` patterns that ship their own key handling (`src/aria/` in the components clone, for example accordion, tabs, menu, listbox, combobox); CDK `ListKeyManager` / `FocusKeyManager` (`src/cdk/a11y/key-manager/`) for roving focus and typeahead; host `(keydown)` listeners with a `switch` on `event.key` for the small cases (Escape to close) |
| Keyboard `findFocusable` / `trapFocus` / `releaseFocus` | selector-based focusable list, Tab wrap on a static list | CDK `FocusTrap` / `ConfigurableFocusTrapFactory` (`src/cdk/a11y/focus-trap/`), which re-queries on each Tab; CDK `InteractivityChecker` (`src/cdk/a11y/interactivity-checker/`) for the focusable test; native `<dialog>.showModal()` (traps focus and inerts the rest of the page by itself) and `popover` for Reveal and Dropdown; the `inert` attribute on the background |
| Nest (`Feather` / `Burn`) | class and ARIA decoration of nested `ul.menu` trees | Angular content-projection directives that add the `is-<type>-submenu*` host classes themselves (`host: { class: ... }`, `[class.is-active]`) since the markup is authored in templates; `@angular/aria` Menu / Menubar / Tree primitives for the ARIA roles, which also fixes the nested `role="menubar"` issue; a structural check in dev mode instead of runtime mutation |
| Box (`GetDimensions`, `OverlapArea`, `GetExplicitOffsets`) and Positionable | manual anchored positioning with collision fallback | CSS anchor positioning (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`, the map's prototype candidate) which gives collision flipping in CSS; native `popover` for top-layer rendering; CDK Overlay with `FlexibleConnectedPositionStrategy` (`src/cdk/overlay/position/flexible-connected-position-strategy.ts`), whose `ConnectedPosition` list maps directly onto Foundation's `position`/`alignment` pairs; `getBoundingClientRect` for the rare direct measurement (Drilldown pane height) |
| Touch (`swipe*`, `tap`, `addTouch`) | touch-to-mouse synthesis and horizontal swipe detection | Pointer Events (`pointerdown`/`pointermove`/`pointerup` unify mouse, touch and pen, which removes `addTouch`); CSS `touch-action` to control panning; CSS scroll-snap for Orbit (the map's prototype candidate), which makes swipe detection unnecessary; CDK `cdkDrag` (`src/cdk/drag-drop/`) for the Slider handle if a custom slider survives; `click` already fires for taps on modern browsers, so `tap` is redundant |
| Timer (pause/resume `setTimeout`) | Orbit autoplay with hover pause | `setTimeout`/`setInterval` inside a directive with `DestroyRef` cleanup, or `interval()` from RxJS with `takeUntilDestroyed`; `prefers-reduced-motion` and `document.visibilityState` checks that Foundation lacks; CSS `animation-play-state` for pure-CSS carousels |
| ImageLoader (`onImagesLoaded`) | wait for images before measuring | `HTMLImageElement.decode()` promises; `ResizeObserver` on the container, which fires again when images load and removes the need to wait; CSS `aspect-ratio` / explicit `width`/`height` on images so layout is stable before load (Angular `NgOptimizedImage` requires them); CSS Grid `align-items: stretch` for the Equalizer case |
| Core utils: `GetYoDigits` | random ids for ARIA relations | Angular's `_IdGenerator` from `@angular/cdk/a11y` (`src/cdk/a11y/id-generator.ts`, produces `cdk-<name>-<n>`), or a small `inject`-able counter; SSR-stable ids matter for hydration, which random ids break |
| Core utils: `rtl()` | reads `html[dir]` once per call | `Directionality` from `@angular/cdk/bidi` (signal-friendly `valueSignal` in 20+); CSS logical properties so most code needs no JS direction check |
| Core utils: `transitionend`, `onLoad`, `ignoreMousedisappear` | vendor prefix shim, window-load gate, mouseleave filtering | plain `transitionend` (no prefixes needed since 2016); `afterNextRender` / `afterRenderEffect` for "after layout" work instead of window `load`; `pointerleave` with `relatedTarget` checks or CSS `:hover` for hover-driven UI; `Foundation.util.throttle` has no consumer and needs no counterpart |
