# Foundation plugin inventory A: disclosure family

Ticket: `../issues/01-foundation-inventory-disclosure.md`
Source tree: `d:/projects/github/foundation/foundation-sites` at version 6.9.0 (`package.json:3`). Written as `F/` below.
Plugins: Accordion, Tabs, ResponsiveAccordionTabs, Toggler, Reveal.

Every claim cites `F/<path>:<line>` from the local clone. No online fetches were needed; the clone holds `js/`, `docs/pages/`, `scss/`, and `test/javascript/components/`.

## Shared machinery (read this first)

Facts that apply to all five plugins, so each plugin section only records what differs.

### Option ingestion

- Every plugin builds its options as `$.extend({}, <Plugin>.defaults, this.$element.data(), options)` (`F/js/foundation.accordion.js:23`, `F/js/foundation.tabs.js:24`, `F/js/foundation.reveal.js:30`, `F/js/foundation.toggler.js:25`, `F/js/foundation.responsiveAccordionTabs.js:53`). jQuery `.data()` converts `data-multi-expand` to `multiExpand` and coerces `"true"`/`"false"`/numeric/JSON strings to values. That is the whole mechanism behind "camelCase option = hyphenated data attribute" (`F/docs/pages/javascript.md:146-151`).
- `data-options="key: value; key2: value2"` is parsed by `Foundation.reflow` and passed as the `options` argument, so it wins over individual `data-*` attributes (`F/js/foundation.core.js:159-166`; documented at `F/docs/pages/javascript.md:155-175`). `reflow` also injects `reflow: true` into the options object (`F/js/foundation.core.js:159`).
- Plugins are found by `[data-<plugin-name>]` and skipped when `zfPlugin` data is already set (`F/js/foundation.core.js:151-154`).

### Lifecycle events from the `Plugin` base class

- `init.zf.<plugin-name>` fires from the base constructor after `_setup` (`F/js/foundation.core.plugin.js:19`); `destroyed.zf.<plugin-name>` fires from `destroy()` after `_destroy` (`F/js/foundation.core.plugin.js:30`). `<plugin-name>` is the hyphenated `className`: `accordion`, `tabs`, `responsive-accordion-tabs`, `toggler`, `reveal` (`F/js/foundation.core.plugin.js:41-47`).
- The constructor also stamps `data-<plugin-name>="<uuid>"` on the element when the attribute is empty, and stores the instance under `.data('zfPlugin')` (`F/js/foundation.core.plugin.js:11-14`). `destroy()` nulls every own property (`F/js/foundation.core.plugin.js:31-35`).

### Keyboard utility

- `Keyboard.register(componentName, map)` stores a `KEY -> commandName` map; `Keyboard.handleKey(event, componentName, functions)` parses the event to a key name (`TAB`, `ENTER`, `ESCAPE`, `SPACE`, `END`, `HOME`, `ARROW_LEFT/UP/RIGHT/DOWN`, with `SHIFT_`/`CTRL_`/`ALT_` prefixes), runs `functions[command]`, marks `event.zfIsKeyHandled = true`, then calls `functions.handled()` or `functions.unhandled()` (`F/js/foundation.util.keyboard.js:12-23, 62-76, 95-135`). Maps may have `ltr`/`rtl` sub-maps; none of the five plugins use that (`F/js/foundation.util.keyboard.js:107-114`).
- `Keyboard.findFocusable($el)` returns visible descendants matching `a[href], area[href], input/select/textarea/button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]` with tabindex >= 0, sorted by tabindex (`F/js/foundation.util.keyboard.js:28-60`).
- `Keyboard.trapFocus($el)` binds `keydown.zf.trapfocus` and wraps TAB from the last focusable to the first and SHIFT_TAB from the first to the last; the focusable list is computed once at trap time (`F/js/foundation.util.keyboard.js:162-177`). `releaseFocus` unbinds it (`:182-184`).

### Triggers utility (`data-open`, `data-close`, `data-toggle`, `data-toggle-focus`, `data-closable`)

- Document-level delegated click handlers: `[data-open]` -> `open.zf.trigger`, `[data-close]` -> `close.zf.trigger`, `[data-toggle]` -> `toggle.zf.trigger`, each dispatched to every id in the space-separated attribute value (`F/js/foundation.util.triggers.js:15-19, 29-49, 71-87`). `open` and `toggle` use `triggerHandler` (no bubbling); `close` uses `trigger` (bubbles) (`:17`).
- `[data-close]` with no value triggers `close.zf.trigger` on itself so it bubbles up to the nearest plugin (`F/js/foundation.util.triggers.js:33-41`; comment at `:77`).
- `[data-toggle-focus="id"]` fires `toggle.zf.trigger` on BOTH `focus` and `blur` (`F/js/foundation.util.triggers.js:64-67, 96-99`). It is a toggle each time, not open-on-focus/close-on-blur.
- `[data-closable]` / `[data-closeable]` answer `close.zf.trigger` by animating out with the attribute value as the Motion UI class, or `fadeOut()` when empty, then fire `closed.zf` (`F/js/foundation.util.triggers.js:50-63, 89-93`). This is what the Toggler docs call "Mark as Closable"; it is not part of the Toggler plugin.
- Global `closeme.zf.<plugin>` listener: on `closeme.zf.reveal` (and dropdown, tooltip) it sends `close.zf.trigger` to every `[data-reveal]` whose `data-yeti-box` is not the emitting id (`F/js/foundation.util.triggers.js:123-131, 135-155`).
- `[data-resize]` elements receive `resizeme.zf.trigger` on a debounced (250 ms) window resize; `[data-mutate]` elements receive `mutateme.zf.trigger` from a MutationObserver on `data-events`/`style` attribute and childList changes (`F/js/foundation.util.triggers.js:104-113, 167-172, 181-222, 235-241`).
- `Triggers.init($)` is idempotent and defers listener setup to window load (`F/js/foundation.util.triggers.js:244-258`).

### MediaQuery utility

- Breakpoint names and min-widths come from CSS: Sass serialises `$breakpoints` into `.foundation-mq { font-family: '...' }` (`F/scss/_global.scss:144-146`), and `MediaQuery._init()` injects `<meta class="foundation-mq">`, reads its computed `font-family`, and builds `queries` of `only screen and (min-width: X)` (`F/js/foundation.util.mediaQuery.js:80-113`). Default map: small 0, medium 640px, large 1024px, xlarge 1200px, xxlarge 1440px (`F/scss/settings/_settings.scss:111-117`).
- `MediaQuery.atLeast(name)` and `MediaQuery.current`; a resize watcher fires `changed.zf.mediaquery` on `window` with `[newSize, oldSize]` when the named breakpoint changes (`F/js/foundation.util.mediaQuery.js:133, 258-291`).

### Motion utility (Motion UI)

- `Motion.animateIn/animateOut(el, cssClass, cb)` add `mui-enter`/`mui-leave` then `-active` classes across two animation frames, force reflow, wait for `transitionend`, then `hide()` on out, strip classes, and run `cb` (`F/js/foundation.util.motion.js:9-20, 54-100`). Animation class names (`fade-in`, `spin-out`, `hinge-in-from-top`, ...) are provided by the separate `motion-ui` package (`F/package.json:35, 84`); docs pages that use them set `mui: true` in front matter (`F/docs/pages/reveal.md:7`, `F/docs/pages/toggler.md:5`).

### Deep-link trio (Accordion, Tabs; Reveal has the first two)

`deepLink` (read `location.hash` at init and on `hashchange`, write it on change), `updateHistory` (`pushState` instead of `replaceState`), and `deepLinkSmudge` + `deepLinkSmudgeDelay` + `deepLinkSmudgeOffset` (animate `scrollTop` so the component top is visible after a deep link). Details per plugin below.

---

## Accordion

### Purpose

"Accordions are elements that help you organize and navigate multiple documents in a single container. They can be used for switching between items in the container." (`F/docs/pages/accordion.md:3`)

### Markup contract

Docs example (`F/docs/pages/accordion.md:30-43`):

```html
<ul class="accordion" data-accordion>
  <li class="accordion-item is-active" data-accordion-item>
    <!-- Accordion tab title -->
    <a href="#" class="accordion-title">Accordion 1</a>

    <!-- Accordion tab content: it would start in the open state due to using the `is-active` state class. -->
    <div class="accordion-content" data-tab-content>
      <p>Panel 1. Lorem ipsum dolor</p>
      <a href="#">Nowhere to Go</a>
    </div>
  </li>
  <!-- ... -->
</ul>
```

- Container: `.accordion[data-accordion]`, any element (`F/docs/pages/accordion.md:11`). Optional boolean `disabled` attribute on the container blocks `toggle`/`down`/`up` (`F/js/foundation.accordion.js:185-188, 213-216, 233-236`; docs `:158-187`); Sass gives `.accordion[disabled] .accordion-title { cursor: not-allowed }` (`F/scss/components/_accordion.scss:65-69`).
- Item: direct children `[data-accordion-item]` (`F/js/foundation.accordion.js:45`), class `.accordion-item`. `.is-active` on the item is the open state, both initial and toggled (`:63, 278, 305`).
- Title: the plugin binds click/keydown on `$elem.children('a')` (`:134`) and sets ARIA on `$el.find('a:first')` (`:54`), so the title must be the first `<a>` in the item and a direct child. `.accordion-title` is styling and is also used by the HOME/END handlers (`:156, 162`).
- Content: direct child `[data-tab-content]` (`:50, 132`), class `.accordion-content`. Sass hides it with `display: none` (`F/scss/components/_accordion.scss:134`); the plugin shows it via jQuery `slideDown` inline styles, not via a class.
- Plus/minus glyph: `.accordion-title::before` shows `$accordion-plus-content`, and `.is-active > .accordion-title::before` shows `$accordion-minus-content` (`F/scss/components/_accordion.scss:112-124`). Border rules also key on `.is-active` (`:102-105`).

### Options (`F/js/foundation.accordion.js:348-406`)

| Option | data attribute | Type | Default | Meaning |
| --- | --- | --- | --- | --- |
| `slideSpeed` | `data-slide-speed` | number (ms) | `250` | jQuery `slideDown`/`slideUp` duration (`:284, 311`). |
| `multiExpand` | `data-multi-expand` | boolean | `false` | Allow several open panes; `down` uses `_openTab` instead of `_openSingleTab` (`:218-221`). Also changes arrow-key behaviour (see Keyboard). |
| `allowAllClosed` | `data-allow-all-closed` | boolean | `false` | `up` refuses to close the last open pane unless true (`:242-244`). |
| `deepLink` | `data-deep-link` | boolean | `false` | Read hash at init and on `hashchange`; write hash on toggle (`:70-116, 174-176, 195-203`). |
| `deepLinkSmudge` | `data-deep-link-smudge` | boolean | `false` | After a deep link, animate `html, body` scrollTop to the accordion's offset minus `deepLinkSmudgeOffset` (`:98-103`). |
| `deepLinkSmudgeDelay` | `data-deep-link-smudge-delay` | number (ms) | `300` | Duration of that scroll animation. |
| `deepLinkSmudgeOffset` | `data-deep-link-smudge-offset` | number (px) | `0` | Offset for a sticky header. |
| `updateHistory` | `data-update-history` | boolean | `false` | `pushState` instead of `replaceState` when writing the hash (`:198-202`). |

Cross-check: docs cover `multiExpand`, `allowAllClosed`, `disabled`, `deepLink`, `updateHistory`, `deepLinkSmudge`, `deepLinkSmudgeDelay` (`F/docs/pages/accordion.md:75-232`); `slideSpeed` and `deepLinkSmudgeOffset` appear only in the JSDoc-generated reference. The deep-link hash is the title anchor's `href` (`:66, 196`), so deep linking requires `href="#<content-id>"` and the content `id` (docs `:205-224`).

### Events

Fires (all on the container element):

| Event | Payload | When |
| --- | --- | --- |
| `init.zf.accordion` | - | base constructor (`F/js/foundation.core.plugin.js:19`) |
| `down.zf.accordion` | `[$content]` | after `slideDown` completes (`F/js/foundation.accordion.js:284-290`) |
| `up.zf.accordion` | `[$content]` | after `slideUp` completes (`:311-317`); when several panes close at once the callback runs per element, each time with the whole set |
| `deeplink.zf.accordion` | `[$link, $anchor]` | after the hash matched one of this accordion's title anchors, at init or on `hashchange` (`:109`) |
| `destroyed.zf.accordion` | - | base `destroy()` (`F/js/foundation.core.plugin.js:30`) |

Listens: `click.zf.accordion` and `keydown.zf.accordion` on each item's child `<a>` (`:134-138`); `hashchange` on `window` when `deepLink` (`:175`). Not integrated with Triggers: no `open/close/toggle.zf.trigger` handling.

### Public methods (`$target` is the content pane, `.accordion-content`, not the item)

- `toggle($target)`: `up` if the parent item `.is-active`, else `down`; then writes the hash when `deepLink` (`F/js/foundation.accordion.js:184-204`).
- `down($target)`: open; single-open mode closes all other active panes first (`:212-222, 255-264`).
- `up($target)`: close; no-op if already closed or if it is the only open pane and `!allowAllClosed` (`:232-247`).
- `destroy()`: `slideUp(0)`, clears inline `display`, unbinds `.zf.accordion` and `hashchange` (`:338-345`).

### Keyboard and ARIA

Registration (`F/js/foundation.accordion.js:28-35`): `ENTER`/`SPACE` -> `toggle`, `ARROW_DOWN` -> `next`, `ARROW_UP` -> `previous`, `HOME` -> `first`, `END` -> `last`. Handled keys get `preventDefault` (`:167-169`).

- `next`/`previous` focus the sibling item's `<a>` and, when `!multiExpand`, also click it, so single-expand accordions auto-open the pane the arrow lands on; multi-expand ones only move focus (`:143-154`). No wrap: at the ends `$elem.next()` is empty and focus goes nowhere. `first`/`last` use `.accordion-title` and behave the same way (`:155-166`).
- ARIA set at init (`:48-61`): title `<a>` gets `aria-controls=<content id>`, `id=<item id>-label` or `<content id>-label`, `aria-expanded=false`; content gets `role=region`, `aria-labelledby=<title id>`, `aria-hidden=true`, `id` (generated by `GetYoDigits(6, 'accordion')` when missing). Open/close flip `aria-expanded` and `aria-hidden` (`:273-318`). The variable that holds the title id is named `targetContentId` but is read from the pane's `aria-labelledby` (`:275, 302`).
- Not set: no `role=button` on the `<a href="#">`, no `aria-disabled` for the `disabled` attribute, no heading wrapper (APG accordion expects a button inside a heading).
- Tests confirm ENTER, SPACE, ARROW_DOWN/UP, HOME, END behaviour (`F/test/javascript/components/accordion.js:143-210`).

### Utility dependencies

`Keyboard` (`F/js/foundation.accordion.js:4, 9`), `onLoad` and `GetYoDigits` from core utils (`:3`). No MediaQuery, Motion, Triggers, Touch, Nest, Box, Timer, ImageLoader. jQuery `slideDown`/`slideUp`/`finish`/`animate` carry the animation.

### Sass configuration that shapes behaviour

- `.accordion-content { display: none }` is the closed state; the plugin overrides it with inline styles (`F/scss/components/_accordion.scss:134`).
- `$accordion-plusminus` (default `true`), `$accordion-plus-content` (`'\002B'`), `$accordion-minus-content` (`'\2013'`) drive the glyph and depend on `.is-active` being on the item (`:13-23, 112-124`; settings `F/scss/settings/_settings.scss:241-243`).
- No breakpoint configuration; everything else is theming.

### Behaviour that only jQuery makes easy

- Height animation via `slideDown`/`slideUp` with `finish()` to cancel in-flight animations (`:284, 311, 339`).
- `$('html, body').animate({ scrollTop })` for the smudge (`:101`).
- `.data()` option coercion and `find('a:first')` selection.
- `_closeTab` on a multi-element set (single-open mode closing "all others").

---

## Tabs

### Purpose

"Tabs are elements that help you organize and navigate multiple documents in a single container. They can be used for switching between items in the container." (`F/docs/pages/tabs.md:3`)

### Markup contract

Docs example (`F/docs/pages/tabs.md:14-18, 31-39`):

```html
<ul class="tabs" data-tabs id="example-tabs">
  <li class="tabs-title is-active"><a href="#panel1" aria-selected="true">Tab 1</a></li>
  <li class="tabs-title"><a data-tabs-target="panel2" href="#panel2">Tab 2</a></li>
</ul>

<div class="tabs-content" data-tabs-content="example-tabs">
  <div class="tabs-panel is-active" id="panel1">
    <p>...</p>
  </div>
  <div class="tabs-panel" id="panel2">
    <p>...</p>
  </div>
</div>
```

- Tab list: `.tabs[data-tabs]` with an `id`; the content container is found by `[data-tabs-content="<that id>"]` (`F/js/foundation.tabs.js:50`). Modifiers `.vertical` (on both list and content), `.simple`, `.primary` are CSS only (`F/scss/components/_tabs.scss:143-193`; docs `:83-138`).
- Tab: `li.tabs-title` (class name from `linkClass`) containing an `<a>` whose `href` hash, or `data-tabs-target`, names the panel id (`:54-58`). `.is-active` (`linkActiveClass`) on the `li` marks the selected tab (`:55, 298, 316`).
- Panel: `.tabs-panel` (`panelClass`) with matching `id`, `.is-active` (`panelActiveClass`) when shown. Visibility is CSS-driven: `.tabs-panel { display: none; &.is-active { display: block } }` (`F/scss/components/_tabs.scss:132-141`), so the JS only toggles the class.
- Active tab styling keys on the ARIA attribute, not a class: `.tabs-title > a[aria-selected='true']` and `:focus` share the active background (`F/scss/components/_tabs.scss:102-106`). The docs markup pre-sets `aria-selected="true"` for that reason.
- Keyboard navigation assumes `ul > li`: it collects `$element.parent('ul').children('li')` (`F/js/foundation.tabs.js:201`).

### Options (`F/js/foundation.tabs.js:443-549`)

| Option | data attribute | Type | Default | Meaning |
| --- | --- | --- | --- | --- |
| `deepLink` | `data-deep-link` | boolean | `false` | Read hash at init and on `hashchange`; write `pathname + search + #id` on change (`:104-147, 169-171, 270-276`). |
| `deepLinkSmudge` | `data-deep-link-smudge` | boolean | `false` | Animate scroll so the tab strip is at the top (`:131-134`). |
| `deepLinkSmudgeDelay` | `data-deep-link-smudge-delay` | number (ms) | `300` | Scroll animation duration; also reused by `autoFocus` (`:86`). |
| `deepLinkSmudgeOffset` | `data-deep-link-smudge-offset` | number (px) | `0` | Offset subtracted from the scroll target. |
| `updateHistory` | `data-update-history` | boolean | `false` | `pushState` instead of `replaceState`. |
| `autoFocus` | `data-auto-focus` | boolean | `false` | On window load, scroll to the active tab and focus its link (`:84-90`). |
| `wrapOnKeys` | `data-wrap-on-keys` | boolean | `true` | Arrow keys wrap from last to first and back (`:207-213`). |
| `matchHeight` | `data-match-height` | boolean | `false` | Set every panel's `min-height` to the tallest panel, after images load and on `changed.zf.mediaquery` (`:93-101, 163-167, 382-414`). |
| `activeCollapse` | `data-active-collapse` | boolean | `false` | Clicking the active tab collapses it (`:248-254, 333-345`). |
| `linkClass` | `data-link-class` | string | `'tabs-title'` | Class of tab `li`s. |
| `linkActiveClass` | `data-link-active-class` | string | `'is-active'` | Active class on the tab `li`. |
| `panelClass` | `data-panel-class` | string | `'tabs-panel'` | Class of panels. |
| `panelActiveClass` | `data-panel-active-class` | string | `'is-active'` | Active class on the panel. |

Cross-check: docs cover `data-active-collapse`, `data-deep-link`, `data-update-history`, `data-deep-link-smudge`, `data-deep-link-smudge-delay` (`F/docs/pages/tabs.md:142-224`); the rest is JSDoc-only.

### Events

| Event | Payload | When |
| --- | --- | --- |
| `init.zf.tabs` | - | base constructor |
| `change.zf.tabs` | `[$tabLi, $panel]` | after a different tab was activated (`F/js/foundation.tabs.js:278-282`); not fired when clicking the already-active tab |
| `collapse.zf.tabs` | `[$activeTabLi]` | after `activeCollapse` or a deep link that matched nothing closed the active tab (`:339-344`) |
| `deeplink.zf.tabs` | `[$link, $anchor]` | hash matched a tab, at init or on `hashchange` (`:136-141`) |
| `destroyed.zf.tabs` | - | base `destroy()` |

Also re-dispatches `mutateme.zf.trigger` to `[data-mutate]` descendants of the newly shown panel so nested plugins (Equalizer and friends) re-measure (`:284-285`).

Listens: delegated `click.zf.tabs` on `.<linkClass>` (`:181-186`); `keydown.zf.tabs` on each tab `li` (`:196`); `changed.zf.mediaquery` on `window` when `matchHeight` (`:166`); `hashchange` on `window` when `deepLink` (`:170`). Not integrated with Triggers for open/close/toggle.

### Public methods

- `selectTab(elem, historyHandled)`: `elem` is a panel jQuery object or an id string with or without `#`; finds the tab whose `href` ends with the hash or whose `data-tabs-target` equals the id, then `_handleTabChange` (`F/js/foundation.tabs.js:353-372`). `historyHandled=true` suppresses the history write (used from `hashchange`, `:123`).
- `_handleTabChange($tabLi, historyHandled)`, `_openTab`, `_collapseTab`, `_collapse`, `_setHeight` are marked `@function` and used by ResponsiveAccordionTabs and docs, but only `selectTab` is public by name (`:246-414`).
- `destroy()`: unbinds and calls `.hide()` on the tab titles and the panels (`:420-440`), leaving `display: none` inline.

### Keyboard and ARIA

Registration (`F/js/foundation.tabs.js:28-37`): `ENTER`/`SPACE` -> `open`; `ARROW_RIGHT` and `ARROW_DOWN` -> `next`; `ARROW_LEFT` and `ARROW_UP` -> `previous`. TAB is explicitly ignored (`:197`). No HOME/END. Both axes are always live regardless of `.vertical`; no RTL flip.

- Arrow keys move focus to the neighbouring tab's `[role=tab]` AND activate it (automatic activation), wrapping when `wrapOnKeys` (`:205-231`). `handled` calls `preventDefault` (`:232-234`).
- ARIA at init (`:48-82`): list `role=tablist`; each `li` `role=presentation`; each `<a>` `role=tab`, `aria-controls=<panel id>`, `aria-selected=<isActive>`, `id` (kept if present, else `<panel id>-label`), roving `tabindex` `0`/`-1`; panel `role=tabpanel`, `aria-labelledby=<tab id>`, and `aria-hidden=true` when inactive (removed when active, `:305-306, 323-326`).
- Not set: `aria-orientation` for `.vertical`; `tabindex=0` on the panel.
- Tests confirm ARIA and the four arrow keys (`F/test/javascript/components/tabs.js:44, 173-212`).

### Utility dependencies

`Keyboard` (`F/js/foundation.tabs.js:4`), `onImagesLoaded` from ImageLoader for `matchHeight` (`:5, 97`), `onLoad` for `autoFocus` (`:3, 85`). MediaQuery only indirectly via the `changed.zf.mediaquery` window event. Triggers only indirectly via `mutateme.zf.trigger`.

### Sass configuration that shapes behaviour

- Visibility is CSS: `.tabs-panel` hidden unless `.is-active` (`F/scss/components/_tabs.scss:132-141`). `.tabs-content { transition: all 0.5s ease }` (`:120`).
- Selected-state styling reads `a[aria-selected='true']` (`:102-106`), so the ARIA attribute is part of the styling contract.
- `.vertical` is pure CSS (`:69-76, 123-129`). No breakpoint configuration.

### Behaviour that only jQuery makes easy

- `matchHeight`: measures hidden panels by temporarily setting `visibility: hidden; display: block` (`:395-409`) and waits for images via ImageLoader.
- `$('html, body').animate({ scrollTop })` for `autoFocus` and smudge (`:86, 133`).
- `[href$="#id"]` attribute-suffix selectors for tab lookup (`:116, 369`).
- `destroy()` hiding everything with `.hide()`.

---

## ResponsiveAccordionTabs

### Purpose

"Added in 6.3.0, use the Markup of the Accordion or Tabs components to create Responsive Accordion Tabs." (`F/docs/pages/responsive-accordion-tabs.md:3`). Tagged `tabcordion` (`:10`).

### Markup contract

Either Accordion markup or Tabs markup, plus `data-responsive-accordion-tabs="<rules>"` (docs `:36-45` and `:85-120`):

```html
<ul class="accordion" data-responsive-accordion-tabs="accordion medium-tabs large-accordion">
  <li class="accordion-item is-active" data-accordion-item>
    <a href="#" class="accordion-title">Accordion 1</a>
    <div class="accordion-content" data-tab-content>
      I would start in the open state, due to using the `is-active` state class.
    </div>
  </li>
  <!-- ... -->
</ul>
```

- Rule syntax: space-separated tokens `[<breakpoint>-]<tabs|accordion>`; a token without a breakpoint means `small` (`F/js/foundation.responsiveAccordionTabs.js:77-95`). Any order (docs `:22`). The last rule whose breakpoint `MediaQuery.atLeast` matches wins (`:147-151`).
- The element gets a generated `id` when it has none (`:60-62`); docs say content panes should have an `id` or the title `href` a hash, otherwise a random id is generated (`:17-19`; `_handleMarkup` at `:222-231`).
- On each switch the plugin removes both `tabs` and `accordion` classes and adds the new one (`:160-165`), destroys the current child plugin, rewrites the DOM, and constructs the other plugin on the same element with the same options (`:168-176`).
- DOM rewrite (`_handleMarkup`, `:180-240`): to accordion, each panel is moved back inside its `li`, given `.accordion-content[data-tab-content]`, and the `.tabs-content` container is replaced by an empty `<div id="tabs-placeholder-<id>">` (`:204-210`); to tabs, a `.tabs-content[data-tabs-content=<id>]` is created after the placeholder or after the element, panels are moved into it with ids derived from the title `href` hash or `GetYoDigits(6, 'accordion')`, and the title `href` is rewritten to point at the id (`:211-239`). The `is-active` state carries over from the `li` to the panel (`:233-236`).

### Options

`ResponsiveAccordionTabs.defaults = {}` (`F/js/foundation.responsiveAccordionTabs.js:289`). Every Accordion and Tabs option passes through: `this.options` is handed to whichever child plugin is constructed (`:175`), and `_getAllOptions` instantiates a throwaway `<ul>` of each plugin to learn the option names (`:104-127`); docs confirm "All data-options from Accordion or Tabs can be passed through" (`F/docs/pages/responsive-accordion-tabs.md:169`). The constructor returns the stored `zfPlugin` data instead of `this` when `options.reflow` is set (`:37-40`).

### Events

- `init.zf.responsive-accordion-tabs` and `destroyed.zf.responsive-accordion-tabs` from the base class.
- Listens on `window` for `changed.zf.mediaquery` and re-evaluates rules (`:134-137, 144`).
- The child plugin lives on the same element, so consumers see `down.zf.accordion` / `up.zf.accordion` or `change.zf.tabs` / `collapse.zf.tabs` depending on the current breakpoint, plus the child's own `init`/`destroyed` events on every switch.

### Public methods (`:249-277`, table at `:10-25`)

- `open(target)`: `Tabs.selectTab(target)` or `Accordion.down($(target))`.
- `close(target)`: `Accordion.up($(target))`; not supported for Tabs (`close: null`).
- `toggle(target)`: `Accordion.toggle($(target))`; not supported for Tabs.
- `destroy()`: destroys the current child and unbinds the media-query handler (`:283-286`).

### Keyboard and ARIA

Fully delegated to the active child plugin. On conversion the plugin removes `role` from the container and `role`, `aria-hidden`, `aria-labelledby` from the panels (`:191, 196`). It intends to strip `role`/`aria-controls`/`aria-selected` from the tab links too, but the selector is `$panels.children('a')` (`:197`), which targets links inside the panels, so the title anchors keep `role=tab`, `aria-controls`, `aria-selected`, and `tabindex` when the element becomes an accordion, and Accordion then adds `aria-expanded` on top. Read from source, not run.

### Utility dependencies

`MediaQuery` (`_init`, `atLeast`; `:2, 74, 148`), `GetYoDigits` (`:3`), and the `Accordion` and `Tabs` plugins (`:6-7`). The JSDoc lists `@requires foundation.util.motion` (`:31`) but Motion is not imported; treat that as stale.

### Sass configuration that shapes behaviour

- Breakpoint names come from `$breakpoints` through the `.foundation-mq` meta mechanism (see Shared machinery). Rules use those names.
- Both `scss/components/_accordion.scss` and `scss/components/_tabs.scss` must be compiled (docs front matter `:5-7`), because the element switches between `.accordion` and `.tabs` class sets.

### Behaviour that only jQuery makes easy

The whole plugin: moving panels between the `li`s and a sibling `.tabs-content`, placeholder divs, rewriting `href`s, instantiating and destroying plugins on the same element, and the dummy-plugin trick for option discovery. In a component model this collapses into one component that renders either structure from the same content.

---

## Toggler

### Purpose

"Toggler makes it easy to toggle CSS or animate any element with a click." (`F/docs/pages/toggler.md:3`)

### Markup contract

Class toggle (`F/docs/pages/toggler.md:22-34`):

```html
<ul class="menu" id="menuBar" data-toggler=".expanded">
  <li><a href="#">One</a></li>
  <li><a href="#">Two</a></li>
  <li><a href="#">Three</a></li>
  <li><a href="#">Four</a></li>
</ul>

<p><a data-toggle="menuBar">Expand!</a></p>
```

Animated toggle (`:60-67`):

```html
<p><a data-toggle="panel">Toggle Panel</a></p>

<div class="callout" id="panel" data-toggler data-animate="hinge-in-from-top spin-out">
  <h4>Hello!</h4>
  <p>...</p>
</div>
```

- Target: any element with an `id` and `data-toggler` (`:11`). No Toggler-specific CSS class exists; there is no `_toggler.scss`. The class being toggled is the consumer's (docs use `.expanded`, `.is-hidden`; `.is-hidden { display: none !important }` is a global Foundation class, `F/scss/_global.scss:254-256`).
- Triggers: any `[data-toggle="id"]` (click, `:30-36`), `[data-toggle-focus="id"]` (focus and blur, `:112-130`), with space-separated multiple ids (`:134-148`). Trigger matching for ARIA uses `~=` (word match) at init (`F/js/foundation.toggler.js:44`) but exact `=` on update (`:143`), so triggers that list several ids get `aria-expanded` set at init but never updated afterwards.
- `data-closable` examples on the same docs page (`:71-108`) are Triggers behaviour, not Toggler.

### Options (`F/js/foundation.toggler.js:158-172`)

| Option | data attribute | Type | Default | Meaning |
| --- | --- | --- | --- | --- |
| `toggler` | `data-toggler` | string | `undefined` | Class to toggle, with or without a leading `.` (`:59-64`). Required when `animate` is not set; otherwise throws `Error("The 'toggler' option containing the target class is required, ...")` (`:60-62`). |
| `animate` | `data-animate` | `false` or string `"<in> [<out>]"` | `false` | Motion UI in and out class names; when set, the plugin toggles visibility via `Motion.animateIn/Out` instead of a class (`:48-52, 96, 122-139`). |

### Events

| Event | When |
| --- | --- |
| `init.zf.toggler` / `destroyed.zf.toggler` | base class |
| `on.zf.toggler` | after toggle when the class is now present (`:103-109`) or after animate-in completes (`:126-131`) |
| `off.zf.toggler` | after toggle when the class is absent (`:110-116`) or after animate-out completes (`:133-138`) |

Also fires `mutateme.zf.trigger` on `[data-mutate]` descendants after each toggle (`:119, 129, 136`).

Listens: only `toggle.zf.trigger` on the element itself (`:86`). `data-open`/`data-close` triggers receive ARIA attributes at init (`:44`) but have no effect because no `open.zf.trigger`/`close.zf.trigger` handler is bound.

### Public methods

- `toggle()`: class or animate path depending on `animate` (`:95-97`).
- `destroy()`: unbinds `.zf.toggler` (`:153-155`); note `_events` bound `toggle.zf.trigger`, which is not in that namespace, so the trigger handler survives destroy.

### Keyboard and ARIA

- No keyboard handling of its own; activation relies on the trigger element being natively clickable (docs use `<a>` without `href` and `<button>`).
- ARIA on triggers (`:42-77, 141-147`): `aria-expanded` initialised from class presence (class mode) or from `!$el.is(':hidden')` (animate mode), and `aria-controls` gets the target id appended when missing (`RegExpEscape` word match, `:71-77`). Updated after each toggle for exact-match triggers only.
- Tests cover both modes and the ARIA attributes (`F/test/javascript/components/toggler.js:29-95, 105-160`).

### Utility dependencies

`Motion` (`:2`), `Triggers` (`:5, 30`), `RegExpEscape` (`:4`). Motion UI CSS classes for `data-animate`.

### Sass configuration that shapes behaviour

None in Foundation for Sites; Motion UI supplies the transition classes and the `mui-enter`/`mui-leave` mechanics (`F/js/foundation.util.motion.js:9-10`).

### Behaviour that only jQuery makes easy

- `:hidden` visibility test to seed `aria-expanded` and to decide animate direction (`:55, 125`).
- Document-wide trigger discovery by attribute selector (`:44, 143`).
- Motion's `show()`/`hide()` on animate paths.

---

## Reveal

### Purpose

"Modal dialogs, or pop-up windows, are handy for prototyping and production. Foundation includes Reveal, our jQuery modal plugin, to make this easy for you." (`F/docs/pages/reveal.md:3`)

### Markup contract

Docs example (`F/docs/pages/reveal.md:36-51`):

```html
<div class="reveal" id="exampleModal1" data-reveal>
  <h1>Awesome. I Have It.</h1>
  <p class="lead">Your couch. It is mine.</p>
  <p>I'm a cool paragraph that lives inside of an even cooler modal. Wins!</p>
  <button class="close-button" data-close aria-label="Close modal" type="button">
    <span aria-hidden="true">&times;</span>
  </button>
</div>

<p><button class="button" data-open="exampleModal1">Click me for a modal</button></p>
```

- Modal: `.reveal[data-reveal]` with a unique `id` (`:26`). Size classes `.tiny` 30%, `.small` 50%, `.large` 90%, `.full` 100% x 100% (`:69-74`; `F/scss/components/_reveal.scss:173-180`); `.collapse` removes padding (`:168-170`). `.fast`/`.slow` on the modal are copied to the overlay for Motion UI timing (`F/js/foundation.reveal.js:257-261`).
- Overlay: the plugin creates `<div class="reveal-overlay">` (plus `additionalOverlayClasses`), appends it to `appendTo`, and MOVES the modal element inside it (`:64-66, 75-77, 91-101`). With `overlay: false` the modal is moved to `appendTo` and gets `.without-overlay` (`:78-79`; Sass `position: fixed`, `F/scss/components/_reveal.scss:186-188`).
- Attributes stamped on the modal: `role=dialog`, `aria-hidden=true`, `data-yeti-box=<id>`, `data-resize=<id>` (`:68-73`). `data-yeti-box` feeds the `closeme` logic; `data-resize` subscribes it to `resizeme.zf.trigger` for re-centering (`:158-160`).
- Anchor: `[data-open="<id>"]`, else `[data-toggle="<id>"]`; gets `aria-controls`, `aria-haspopup=dialog`, `tabindex=0` (`:53-58`). `[data-close]` inside the modal closes it (docs `:53-61`). Nested modals are just a second `[data-open]` inside the first (`:119-147`).
- Global document state while open: `html.is-reveal-open` and, when the document is taller than the viewport, `html.zf-has-scroll` (`:341-349`), paired with `html { top: -scrollTop }` (`:191-197`) and the Sass `position: fixed; overflow-y: hidden` rules (`F/scss/components/_reveal.scss:135-148`).
- Docs recommend `aria-labelledby` pointing at a heading (`F/docs/pages/reveal.md:240-258`); the plugin does not add one.

### Options (`F/js/foundation.reveal.js:519-632`)

| Option | data attribute | Type | Default | Meaning |
| --- | --- | --- | --- | --- |
| `animationIn` | `data-animation-in` | string | `''` | Motion UI class for opening; overlay gets `fade-in` (`:281-301`). Empty = jQuery `show`. |
| `animationOut` | `data-animation-out` | string | `''` | Motion UI class for closing; overlay gets `fade-out` (`:404-410`). |
| `showDelay` | `data-show-delay` | number (ms) | `0` | jQuery `show(duration)` when no animation (`:307`). |
| `hideDelay` | `data-hide-delay` | number (ms) | `0` | jQuery `hide(duration)` when no animation (`:413`). |
| `closeOnClick` | `data-close-on-click` | boolean | `true` | Click/tap on the overlay closes (`:163-172`); without overlay, click on body closes unless `fullScreen` (`:370-377`). |
| `closeOnEsc` | `data-close-on-esc` | boolean | `true` | ESC on `window` closes while open (`:379-389`). |
| `multipleOpened` | `data-multiple-opened` | boolean | `false` | When false, fires `closeme.zf.reveal` so other reveals close (`:265-272`). |
| `vOffset` | `data-v-offset` | number or `'auto'` | `'auto'` | Top position in px; auto = `min(100, vh/10)` when taller than viewport else `(vh - h)/4` (`:119-131`). |
| `hOffset` | `data-h-offset` | number or `'auto'` | `'auto'` | Left position; auto centres; explicit value also zeroes margin (`:114-118, 135-138`). |
| `fullScreen` | `data-full-screen` | boolean | `false` | Forced true by the `.full` class; forces `overlay=false` (`:60-63`). |
| `overlay` | `data-overlay` | boolean | `true` | Create the overlay (docs `:177-194`). |
| `resetOnClose` | `data-reset-on-close` | boolean | `false` | Re-assigns `innerHTML` on close to stop media (`:464-466`). |
| `deepLink` | `data-deep-link` | boolean | `false` | Open on load when `location.hash === #id`; write/remove the hash on open/close; react to `hashchange` (`:82-84, 173-185, 220-233, 469-482`). |
| `updateHistory` | `data-update-history` | boolean | `false` | `pushState` instead of `replaceState`. |
| `appendTo` | `data-append-to` | string selector | `'body'` | Where the overlay (or the modal, without overlay) is appended (`:78, 100`). |
| `additionalOverlayClasses` | `data-additional-overlay-classes` | string | `''` | Extra classes on the overlay (`:92-96`). |

Docs discrepancies: the docs say `.full` "defaults the `escClose` option to true, as well as creates a close button" (`F/docs/pages/reveal.md:74`); there is no `escClose` option (`closeOnEsc` already defaults true) and no code creates a close button. The test suite passes a `trapFocus: true` option (`F/test/javascript/components/reveal.js:158`) that does not exist; focus trapping is unconditional.

### Events

| Event | Payload | When |
| --- | --- | --- |
| `init.zf.reveal` / `destroyed.zf.reveal` | - | base class |
| `closeme.zf.reveal` | `id` | just before opening when `!multipleOpened` (`F/js/foundation.reveal.js:265-272`); Triggers' global listener converts it into `close.zf.trigger` on every other `[data-reveal]` (`F/js/foundation.util.triggers.js:123-131`) |
| `open.zf.reveal` | - | at the end of `open()`, synchronously, even while a Motion UI animation is still running (`:323-327`) |
| `closed.zf.reveal` | - | after the hide/animation completes, focus released, `aria-hidden=true` restored (`:434-458`) |

Listens on the modal (`:149-161`): `open.zf.trigger` -> `open`; `close.zf.trigger` -> `close` only when the event target is the modal itself or the `[data-closable]` ancestor of the target is the passed element (so a `data-closable` callout inside a modal does not close the modal); `toggle.zf.trigger` -> `toggle`; `resizeme.zf.trigger` -> `_updatePosition`. Overlay: `click.zf.dropdown tap.zf.dropdown` (namespace says dropdown; `:164`). Body: same events when no overlay (`:371`). Window: `keydown.zf.reveal` while open (`:380`), `hashchange.zf.reveal:<id>` when `deepLink` (`:174`), and `resizeme.zf.trigger.revealScrollbarListener` on the modal for the scrollbar class (`:346`).

### Public methods

- `open()`: writes hash, remembers the active anchor, measures and positions, fires `closeme`, disables page scroll when this is the first visible `.reveal`, animates or shows, sets `aria-hidden=false` and `tabindex=-1`, focuses the modal, traps focus, adds global classes and listeners, fires `open.zf.reveal` (`:219-328`).
- `close()`: returns `false` if not active or not visible; animates or hides, removes global listeners, then in `finishUp` removes global classes and restores scroll when no `.reveal` is visible, releases focus, sets `aria-hidden=true`, fires `closed.zf.reveal`; optionally resets content; clears the hash; refocuses the opener (`:397-485`).
- `toggle()` (`:491-497`); `destroy()` moves the modal back out of the overlay, removes the overlay, unbinds (`:503-516`).

### Keyboard and ARIA

- `Keyboard.register('Reveal', { ESCAPE: 'close' })` (`:38-40`); the handler is bound on `window` while open and honours `closeOnEsc` (`:379-389`).
- Focus: modal receives `tabindex=-1` and `.focus()` (`:311-316`); `Keyboard.trapFocus` cycles TAB/SHIFT_TAB between first and last focusable, computed once (`:317`; util `:162-177`); on close focus returns to `$activeAnchor`, the element that was focused when `open()` ran if it is one of the anchors, else the first anchor (`:236, 484`).
- ARIA set: modal `role=dialog`, `aria-hidden` toggled; anchors `aria-controls`, `aria-haspopup=dialog`. Not set: `aria-modal`, `inert`/`aria-hidden` on page content behind the modal, `aria-labelledby` (consumer's job per docs).
- Touch: `Touch.init($)` so `tap` events exist for the overlay/body close handlers (`:8, 35`).

### Utility dependencies

`Keyboard`, `MediaQuery` (`_init` and `current` cached at init, otherwise unused; `:5, 48-51`), `Motion` (only when animation options are set), `Triggers` (`open/close/toggle.zf.trigger`, `closeme`, `resizeme` via `data-resize`), `Touch`, `onLoad` (`:2-8, 34-36`). Motion UI CSS for `animationIn`/`animationOut`, `fade-in`/`fade-out` on the overlay.

### Sass configuration that shapes behaviour

- Breakpoint `medium` (640px) is the behaviour boundary: below it every modal is full-screen (`F/scss/components/_reveal.scss:182-184`; docs `:67`); at medium and up the width mixins apply (`:45-51, 103-113`). `$reveal-width: 600px`, `$reveal-max-width: $global-width` (`:15-19`).
- `$reveal-zindex: 1005` for the overlay, `+1` for the modal (`:33-35, 62, 72`).
- `.reveal { display: none; position: relative; top: 100px; overflow-y: auto }` (`:156-165`); the JS overrides `top`/`left`/`margin` inline from `_updatePosition`.
- `html.is-reveal-open` / `.zf-has-scroll` scroll-lock rules (`:134-148`) are half of a JS+CSS contract with `_disableScroll`/`_enableScroll`.
- `$reveal-overlay-background: rgba($black, 0.45)` and `.reveal-overlay { position: fixed; display: none; overflow-y: auto }` (`:37-39, 56-68`).

### Behaviour that only jQuery makes easy

- Relocating the modal into a generated overlay under `appendTo` and back on destroy (`:75-79, 505`).
- `show(delay)`/`hide(delay)` fades, `:visible` checks, and the global `$('.reveal:visible').length === 0` count that decides when to unlock scroll (`:274, 441, 449, 513`).
- Measuring with `visibility: hidden; display: block` before positioning (`:240-253`).
- `resetOnClose` re-parsing `innerHTML` to kill media (`:465`).
- Document-wide anchor discovery by `[data-open="id"]` (`:53`).

---

## Common versus different across the family

| Aspect | Accordion | Tabs | ResponsiveAccordionTabs | Toggler | Reveal |
| --- | --- | --- | --- | --- | --- |
| Open state class | `.is-active` on item | `.is-active` on `li` and panel (names configurable) | delegates | consumer class or visibility | none on modal; `html.is-reveal-open` |
| Hidden content mechanism | inline `display` via slideUp/Down; `aria-hidden` | CSS `.tabs-panel.is-active`; `aria-hidden` | delegates | class or Motion show/hide | inline `display` via show/hide or Motion; `aria-hidden` |
| Trigger discovery | child `<a>` of item | delegated click on `.tabs-title` | delegates | Triggers `data-toggle`/`data-toggle-focus` | Triggers `data-open`/`data-toggle`/`data-close` |
| Keyboard map | ENTER/SPACE, UP/DOWN, HOME/END | ENTER/SPACE, all four arrows, wrap | delegates | none | ESCAPE |
| Arrow semantics | move focus; auto-open unless multiExpand; no wrap | move focus and activate; wrap by default | delegates | - | - |
| Deep link | yes, hash from title `href`, smudge | yes, hash from panel id, smudge | inherited | no | yes, hash = modal id, no smudge |
| Events fired | `down`, `up`, `deeplink` | `change`, `collapse`, `deeplink` | child's | `on`, `off` | `closeme`, `open`, `closed` |
| Event timing | after animation | synchronous | child's | after animation | `open` synchronous, `closed` after animation |
| MediaQuery | no | only for matchHeight | yes, drives plugin swap | no | init only |
| Motion UI | no | no | no | `data-animate` | `animationIn/Out` |
| Sass behaviour hooks | plus/minus glyph on `.is-active` | `a[aria-selected=true]` styling | both | none | medium breakpoint = full-screen below; z-index; scroll-lock classes |

Naming inconsistency worth recording for the output-naming rule: past-tense (`closed`, `destroyed`) sits beside present-tense (`open`, `change`, `collapse`, `down`, `up`, `on`, `off`, `deeplink`) and imperative (`closeme`). Accordion's `down`/`up` are the only direction-named pair.

## Open questions for later tickets

- Whether Accordion's single-expand arrow-key auto-open (a Foundation choice, not APG) carries over; APG accordion arrows only move focus.
- Whether Tabs' automatic activation on arrow keys is kept or made configurable (APG allows both).
- Whether Reveal's `closeme` cross-instance protocol, `resetOnClose`, `appendTo`, and manual `vOffset`/`hOffset` positioning survive a native `<dialog>` implementation.
- Whether the ResponsiveAccordionTabs DOM-rewrite becomes a single component with two render modes, and whether the rule string syntax (`medium-tabs`) is kept as the input format.
- Whether `data-toggle-focus` toggle-on-both-focus-and-blur semantics are wanted or replaced by open-on-focus/close-on-blur.
