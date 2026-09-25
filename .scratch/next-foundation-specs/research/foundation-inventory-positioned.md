# Foundation plugin inventory C: Dropdown, Tooltip, Positionable, Sticky, Magellan, SmoothScroll

Ticket: `../issues/03-foundation-inventory-positioned.md`
Source clone: `d:/projects/github/foundation/foundation-sites` at tag `v6.9.0` (`git describe` reports `v6.9.0-1-g337be7a8d`; `package.json` version `6.9.0`). All paths below are relative to that clone unless they start with a URL. Line numbers are from that checkout.

Conventions used in this file:

- `js:NN` means a line in the plugin's own `js/foundation.<name>.js` file named in the section header.
- Events are named as jQuery namespaced events (`show.zf.dropdown`), which is how Foundation fires and listens for them.
- "Docs" means `docs/pages/<name>.md`. The docs pages in the clone do not contain the generated "JavaScript Reference" option tables; those are built from the `@option` JSDoc blocks in the plugin source, so the source is the primary record for options and defaults.

Sections: Shared positioning model (Positionable + Box), Dropdown, Tooltip, Sticky, Magellan, SmoothScroll, Cross-cutting utilities.

Corrected 2026-09-25 after [Audit 0001: research wave](../audits/0001-research-wave.md), findings L1, L9: fixed the `_tooltip.scss` line citation for `position: absolute` and removed a banned word from the Magellan `reflow()` bullet.

---

## Shared positioning model: Positionable and Box

`js/foundation.positionable.js` is an abstract `Plugin` subclass ("tether-like explicit positioning logic including repositioning based on overlap", js:27-35). Dropdown and Tooltip extend it. It owns the option semantics for `position`, `alignment`, `allowOverlap`, `allowBottomOverlap`, `vOffset`, `hOffset`, and delegates geometry to `js/foundation.util.box.js`.

### Vocabulary

- **position**: which side of the anchor the element sits on. `POSITIONS = ['left', 'right', 'top', 'bottom']` (positionable.js:5).
- **alignment**: which edge (or center) of the element lines up with the anchor along the other axis. For `top`/`bottom` positions the alignments are `['left', 'right', 'center']`; for `left`/`right` they are `['top', 'bottom', 'center']` (positionable.js:6-14). Docs: "Left align means left sides should line up. Right align means right sides should line up. Center align means centers should line up." (docs/pages/dropdown.md:107).
- 12 candidate placements in total (4 positions x 3 alignments).

### Resolving `auto`

`_init()` (positionable.js:37-43): if `options.position === 'auto'` call `_getDefaultPosition()`, if `options.alignment === 'auto'` call `_getDefaultAlignment()`; remember both as `originalPosition` / `originalAlignment`.

Base defaults (positionable.js:45-58):

- `_getDefaultPosition()` returns `'bottom'`.
- `_getDefaultAlignment()`: for `bottom`/`top` returns `'right'` when `Rtl()` (`html[dir="rtl"]`, `js/foundation.core.utils.js:8-10`) else `'left'`; for `left`/`right` returns `'bottom'`.

Dropdown and Tooltip override both (see their sections): legacy class names on the element (`.top`, `.left`, `.right`, `.bottom`) and, for Dropdown, `.float-left` / `.float-right` on the anchor feed the defaults.

### Coordinate model: `Box.GetDimensions(elem)` (box.js:63-100)

Returns pixel values in **document coordinates** (`getBoundingClientRect()` plus `window.pageYOffset` / `pageXOffset`):

- `width`, `height`, `offset.top`, `offset.left` of the element.
- `parentDims`: same for `elem.parentNode`.
- `windowDims`: `width` and `height` are `document.body.getBoundingClientRect()` (the body box, not the viewport), `offset` is the current scroll position (`pageYOffset`, `pageXOffset`).

Throws `"I'm sorry, Dave. I'm afraid I can't do that."` for `window` or `document` (box.js:66-68).

### Placement formulae: `Box.GetExplicitOffsets(element, anchor, position, alignment, vOffset, hOffset, isOverflow)` (box.js:116-173)

Returns `{ top, left }` in document coordinates. Let `A` be the anchor dims and `E` the element dims.

Position axis:

| position | formula |
| --- | --- |
| `top` | `top = A.top - (E.height + vOffset)` |
| `bottom` | `top = A.top + A.height + vOffset` |
| `left` | `left = A.left - (E.width + hOffset)` |
| `right` | `left = A.left + A.width + hOffset` |

Alignment axis, for `top` / `bottom` positions:

| alignment | formula |
| --- | --- |
| `left` | `left = A.left + hOffset` |
| `right` | `left = A.left + A.width - E.width - hOffset` |
| `center` | `left = A.left + A.width/2 - E.width/2 + hOffset` (or just `hOffset` when `isOverflow`; Positionable never passes `isOverflow`) |

Alignment axis, for `left` / `right` positions:

| alignment | formula |
| --- | --- |
| `top` | `top = A.top + vOffset` |
| `bottom` | `top = A.top + A.height - E.height - vOffset` |
| `center` | `top = A.top + A.height/2 - E.height/2 + vOffset` |

Note the sign asymmetry: `hOffset` / `vOffset` push the element *away* from the anchor on the position axis, but on the alignment axis they push toward the alignment's opposite edge (`right` alignment subtracts, `center` adds). The source comment at positionable.js:104-109 records an unresolved TODO about whether offsets should apply at all when centering.

The result is applied with jQuery's `$element.offset({top, left})` (positionable.js:127, 146, 152), which converts document coordinates into `top`/`left` relative to the element's offset parent. This only works because the CSS gives the element `position: absolute` (`scss/components/_dropdown.scss:43`, `scss/components/_tooltip.scss:63`).

### Collision test: `Box.OverlapArea(element, parent, lrOnly, tbOnly, ignoreBottom)` (box.js:22-54)

- With a `parent`, compares the element's document rect against the parent's document rect.
- Without a `parent`, compares against `windowDims` (see above: bounds are `[scrollX, scrollX + bodyWidth]` x `[scrollY, scrollY + bodyHeight]`). This is what "window" means for collision purposes; it is not `innerWidth` / `innerHeight`.
- Each side's overflow is clamped to `<= 0` (`Math.min(x, 0)`), so only spill-over counts. `ignoreBottom` forces the bottom term to 0.
- `lrOnly` returns `left + right`; `tbOnly` returns `top + bottom`; otherwise returns `sqrt(top^2 + bottom^2 + left^2 + right^2)`. Despite the "overlap area" name it is a Euclidean magnitude of the four overflow distances, only used to compare candidates and to test for zero.
- `Box.ImNotTouchingYou(...)` is `OverlapArea(...) === 0` (box.js:18-20).

### Reposition search: `Positionable._setPosition($anchor, $element, $parent)` (positionable.js:118-154)

1. Return early if `$anchor.attr('aria-expanded') === 'false'` (js:119). Dropdown relies on this: it sets `aria-expanded=true` before calling `_setPosition` (dropdown.js:252-257). Tooltip passes the trigger element as `$anchor`; it has no `aria-expanded`, so the guard never fires for tooltips.
2. If `!allowOverlap`, reset `position` / `alignment` to the originals (js:121-125) so every open starts from the configured placement.
3. Apply `GetExplicitOffsets` with `_getVOffset()` / `_getHOffset()` (js:127). Base implementations return the raw options (js:110-116); Tooltip overrides them to add pip size.
4. If `allowOverlap` is true, stop here: no collision handling at all.
5. Otherwise loop while `!_positionsExhausted()` (js:133-147): compute `overlap = OverlapArea($element, $parent, false, false, allowBottomOverlap)`; if 0 return; remember the smallest overlap seen and its `{position, alignment}`; call `_reposition()`; re-apply offsets.
6. After the loop (no collision-free candidate), restore the least-overlapping candidate and apply it (js:148-152).

Search order (`_reposition`, `_realign`, js:66-101): each position's alignments are tried cyclically starting from the current alignment (`nextItem` wraps, js:16-23). Once all three alignments of the current position have been tried, move to the next position in the fixed order `left -> right -> top -> bottom -> left` (wrapping) and start at that position's first alignment (`left` or `top`). So a default dropdown (`bottom`/`left`) tries `bottom-left, bottom-right, bottom-center`, then `left-top, left-bottom, left-center`, then `right-*`, then `top-*`. Between an exhausted position and the switch the code re-measures the starting alignment once more (harmless duplicate). `triedPositions` is reset only in `_init`, but the loop always ends by exhausting all 12 combinations or returning on zero overlap, so a later open starts with `triedPositions` already full only if the first open exhausted every option; in that case `_positionsExhausted()` is immediately true and the element is left at the reset original placement with no search. This is a real quirk: after one "nothing fits" open, later opens no longer search.

`$parent` is the bounding container: `null` for Dropdown unless `parentClass` is set (dropdown.js:63-67), always `undefined` for Tooltip (tooltip.js:123), meaning the body-box "window" bounds.

### Classes the model produces

- Dropdown: `has-position-{position}` and `has-alignment-{alignment}` on the pane (dropdown.js:118-120). No Sass in `scss/` consumes these classes (verified with `rg has-position|has-alignment scss/`: no hits).
- Tooltip: `{position}` and `align-{alignment}` on the generated tip element (tooltip.js:141-142), consumed by `scss/components/_tooltip.scss:161-231` to place the pip.

### Shared option defaults (positionable.js:158-205)

| option | type | default | meaning (from JSDoc) |
| --- | --- | --- | --- |
| `position` | string | `'auto'` | `left`, `right`, `top`, `bottom`, or `auto` |
| `alignment` | string | `'auto'` | `left`, `right`, `top`, `bottom`, `center`, or `auto` |
| `allowOverlap` | boolean | `false` | if false, try configured placement first and reposition on overflow |
| `allowBottomOverlap` | boolean | `true` (Tooltip overrides to `false`) | ignore overflow past the bottom of the container |
| `vOffset` | number (px) | `0` | vertical separation from anchor |
| `hOffset` | number (px) | `0` | horizontal separation from anchor |

`js/typescript/foundation.d.ts:276-287` declares the same six options for `IPositionableOptions` and "No public methods" for `Positionable`.

### What only jQuery makes easy here

- `$element.offset({top,left})` doing the document-to-offset-parent conversion. A replacement needs either the same conversion, `position: fixed` with viewport coordinates, the CDK Overlay (which positions in a body-level container), or CSS anchor positioning (`position-area` / `anchor()`), which makes the whole formula table declarative.
- The collision loop measures the DOM up to ~16 times per open, synchronously. CDK `FlexibleConnectedPositionStrategy` and CSS `position-try-fallbacks` both express the same "ordered list of candidate placements, pick the first that fits, else the best" idea.
- The "window" bound is the body box at the current scroll offset, not the viewport. Any replacement that uses the viewport will differ for pages whose body is shorter or taller than the viewport.

---

## Dropdown (`js/foundation.dropdown.js`, `docs/pages/dropdown.md`, `scss/components/_dropdown.scss`)

### 1. Purpose

"Dropdown panes are little happy sprites which can be revealed on click or hover." (docs:3). The docs open with a pointer that Dropdown Menu is a separate plugin (docs:9-11).

### 2. Markup contract

Docs (docs:15-17): "To create a dropdown pane, add the class `.dropdown-pane` and the attribute `data-dropdown` to an element. Give the dropdown a unique ID as well. To create the dropdown trigger, add `data-toggle` to a `<button>`. The value of `data-toggle` is the ID of the dropdown."

Docs example (docs:28-54):

```html
<button class="button" type="button" data-toggle="example-dropdown">Toggle Dropdown</button>
<div class="dropdown-pane" id="example-dropdown" data-dropdown data-auto-focus="true">
  Example form in a dropdown.
  <form>
    ...
  </form>
</div>

<button class="button" type="button" data-toggle="example-dropdown-1">Hoverable Dropdown</button>
<div class="dropdown-pane" id="example-dropdown-1" data-dropdown data-hover="true" data-hover-pane="true">
  Just some junk that needs to be said. Or not. Your choice.
</div>
```

Explicit positioning example (docs:111-116):

```html
<button class="button" type="button" data-toggle="example-dropdown-bottom-left">Toggle Dropdown</button>
<div class="dropdown-pane" data-position="bottom" data-alignment="left" id="example-dropdown-bottom-left" data-dropdown data-auto-focus="true">
  <!-- My dropdown content in here -->
</div>
```

Elements and selectors:

- Pane: `.dropdown-pane[data-dropdown][id]`. The plugin instance is created on the pane, "rather than its anchor" (js:23).
- Anchors: every `[data-toggle="<id>"]`, or if none, every `[data-open="<id>"]` (js:52). Multiple anchors are supported; the one last clicked or hovered becomes `$currentAnchor` and is the positioning reference (js:130-132, 152, 168).
- Legacy position classes on the pane: `.top`, `.right`, `.bottom`, `.left` (docs:60; js:89-97 reads the first match). No Sass rule exists for them on `.dropdown-pane`; they only feed the JS default.
- Legacy alignment classes on the anchor: `.float-left` / `.float-right` (docs:85; js:99-107 reads `float-(\S+)` from the anchor class attribute and uses the captured word as the alignment). Test `test/javascript/components/dropdown.js:116-126` asserts `float-right` yields `position bottom`, `alignment right`.
- Size classes on the pane: `.tiny` (100px), `.small` (200px), `.large` (400px) from `$dropdown-sizes` (scss:33-39, 75-81).
- Bounding container: an ancestor with the class given by `parentClass` (js:63-67).

CSS contract (scss:41-68): `.dropdown-pane` is `position: absolute; z-index: 10; display: none; visibility: hidden; width: $dropdown-width (300px)`. `.is-opening` sets `display: block` (still hidden) so the element can be measured; `.is-open` sets `display: block; visibility: visible`.

State classes and attributes toggled by the plugin:

| target | what | when |
| --- | --- | --- |
| pane | `.is-opening` added then removed | around `_setPosition()` during `open()` (js:256-258) |
| pane | `.is-open` | added in `open()` (js:258), removed in `close()` (js:290) |
| pane | `aria-hidden` | `true` at init (js:80), `false` on open (js:259), `true` on close (js:291) |
| pane | `has-position-*`, `has-alignment-*` | swapped on every `_setPosition()` (js:118-120) |
| pane | `tabindex="-1"` and focus | only in the (dead) keyboard `open` handler (js:206), see section 6 |
| anchors | `.hover` | added on open (js:252), removed on close (js:293); no Sass consumer in `scss/` (only `table.hover` exists) |
| anchors | `aria-expanded` | `false` at init (js:58), `true` on open (js:253), `false` on close (js:294) |

Attributes set once at init:

- Anchors (js:53-59): `aria-controls="<pane id>"`, `data-is-focus="false"` (never read anywhere; `rg` finds only the two writers), `data-yeti-box="<pane id>"`, `aria-haspopup="true"`, `aria-expanded="false"`.
- Pane (js:69-83): `aria-labelledby="<current anchor id>"` unless already present; the anchor gets a generated id `xxxxxx-dd-anchor` if it has none (`GetYoDigits(6, 'dd-anchor')`). Also `aria-hidden="true"`, `data-yeti-box="<id>"`, `data-resize="<id>"`.
- `data-dropdown="<uuid>"` is written by the `Plugin` base when the attribute is empty (`js/foundation.core.plugin.js:13`).

### 3. Options

Read via `$.extend({}, Dropdown.defaults, this.$element.data(), options)` (js:28): defaults, then `data-*` attributes on the pane (jQuery camel-cases `data-hover-pane` to `hoverPane` and coerces `"true"`/numbers), then programmatic options. `data-options="key: value; key2: value2"` on the element is parsed by `Foundation.reflow` and passed as programmatic options, so it wins over individual `data-*` (`js/foundation.core.js:159-165`; docs/pages/javascript.md:155-172).

Own defaults (js:332-433), plus the Positionable set above (Dropdown re-declares all six with identical defaults, js:367-404):

| option | data attribute | type | default | meaning |
| --- | --- | --- | --- | --- |
| `parentClass` | `data-parent-class` | string or null | `null` | "Class that designates bounding container of Dropdown (default: window)"; resolved with `$element.parents('.' + parentClass)` (js:64) |
| `hoverDelay` | `data-hover-delay` | number (ms) | `250` | delay before open on mouseenter and before close on mouseleave (js:173, 181, 192) |
| `hover` | `data-hover` | boolean | `false` | open on hover |
| `hoverPane` | `data-hover-pane` | boolean | `false` | keep open while hovering the pane itself (js:185-196) |
| `vOffset` | `data-v-offset` | number (px) | `0` | see shared model |
| `hOffset` | `data-h-offset` | number (px) | `0` | see shared model |
| `position` | `data-position` | string | `'auto'` | see shared model; `auto` reads legacy `.top/.left/.right/.bottom` on the pane, else `bottom` |
| `alignment` | `data-alignment` | string | `'auto'` | see shared model; `auto` reads `.float-*` on the anchor, else RTL-aware `left`/`right` for top/bottom, `bottom` for left/right |
| `allowOverlap` | `data-allow-overlap` | boolean | `false` | see shared model |
| `allowBottomOverlap` | `data-allow-bottom-overlap` | boolean | `true` | see shared model |
| `trapFocus` | `data-trap-focus` | boolean | `false` | "trap focus to the dropdown pane if opened with keyboard commands"; in practice `Keyboard.trapFocus` runs on every `open()` regardless of input method (js:270-272) |
| `autoFocus` | `data-auto-focus` | boolean | `false` | focus first focusable element in the pane on open, "regardless of method of opening" (js:261-266) |
| `closeOnClick` | `data-close-on-click` | boolean | `false` | click or tap anywhere on body outside anchors/pane closes it (js:223-237, 268) |
| `forceFollow` | `data-force-follow` | boolean | `true` | if true the anchor's default action (e.g. following an `href`) runs on click; with `hover` also true on a touch device the default is prevented on the first click and allowed on the second (js:154-162) |

`js/typescript/foundation.d.ts:146-161` lists the same 14 options.

### 4. Events

Fired on the pane (`this.$element`):

| event | args | when |
| --- | --- | --- |
| `init.zf.dropdown` | none | end of construction (`core.plugin.js:19`) |
| `closeme.zf.dropdown` | pane id | first thing in `open()` (js:251); bubbles to window where the Triggers `closeMeListener` sends `close.zf.trigger` to every other `[data-dropdown]` whose `data-yeti-box` differs (`js/foundation.util.triggers.js:123-131`, 135-155) |
| `show.zf.dropdown` | `[$element]` | end of `open()` after positioning, focus, body handler, focus trap (js:278) |
| `hide.zf.dropdown` | `[$element]` | in `close()` after classes/ARIA reset, before focus release (js:300) |
| `destroyed.zf.dropdown` | none | after `_destroy()` (`core.plugin.js:30`) |

Listened for:

| event | on | handler |
| --- | --- | --- |
| `open.zf.trigger`, `close.zf.trigger`, `toggle.zf.trigger` | pane | `open`, `close`, `toggle` (js:143-147). Sent by the Triggers utility when a `[data-open="id"]`, `[data-close="id"]`, `[data-toggle="id"]` element is clicked (`triggers.js:15-19, 29-49, 71-87`); `[data-close]` without a value closes the nearest plugin by bubbling. `close.zf.trigger` also arrives from `closeme` handling above |
| `resizeme.zf.trigger` | pane | `_setPosition` (js:147). Delivered by Triggers: debounced (250 ms) window resize sets `data-events="resize"` on every `[data-resize]` element; a MutationObserver per such element turns the attribute change into `resizeme.zf.trigger` (`triggers.js:105-113, 167-172, 181-222, 235-241`) |
| `click.zf.trigger` | anchors | sets current anchor, decides `preventDefault` per `forceFollow` (js:150-163). The Triggers document-level `[data-toggle]` click listener then fires `toggle.zf.trigger` on the pane |
| `mouseenter.zf.dropdown` / `mouseleave.zf.dropdown` | anchors (if `hover`) | delayed open/close; open only when `body` `data-whatinput` is undefined or `mouse` (js:165-184). `mouseleave` is wrapped in `ignoreMousedisappear` (`core.utils.js:114-144`) which ignores leaves with `relatedTarget === null` unless the window lost focus or the mouse re-enters outside the element |
| `mouseenter.zf.dropdown` / `mouseleave.zf.dropdown` | pane (if `hover && hoverPane`) | cancel / schedule close (js:185-196) |
| `keydown.zf.dropdown` | anchors and pane | `Keyboard.handleKey` (js:198-215), see section 6 |
| `click.zf.dropdown tap.zf.dropdown` | `document.body` (if `closeOnClick`, added on open) | close unless the target is inside an anchor or the pane; handler removes itself after closing (js:223-237) |

`tap` is a synthetic jQuery special event from `js/foundation.util.touch.js:17-30, 92-93` (touchend without movement).

### 5. Public methods

- `open()` (js:245-279): fires `closeme`, marks anchors (`.hover`, `aria-expanded=true`), adds `.is-opening`, positions, swaps to `.is-open` + `aria-hidden=false`, optional autofocus, optional body close handler, optional focus trap, fires `show`.
- `close()` (js:286-305): returns `false` if not `.is-open`; removes `.is-open`, `aria-hidden=true`, anchor reset, fires `hide`, releases focus trap.
- `toggle()` (js:311-318): if open and the anchors carry `data('hover') === true` (set by the hover-open path, js:175) do nothing; else close; else open.
- `destroy()` (base) -> `_destroy()` (js:324-329): unbinds `.zf.trigger` on the pane and hides it (`.hide()` sets inline `display: none`), unbinds `.zf.dropdown` on anchors and body.
- `_setPosition()` (js:117-121) is private but is the `resizeme` handler.

`foundation.d.ts:140-144`: `open(): void; close(): void; toggle(): void`.

### 6. Keyboard and ARIA behaviour

Registration (js:37-41): `Keyboard.register('Dropdown', { ENTER: 'toggle', SPACE: 'toggle', ESCAPE: 'close' })`.

Handler (js:198-215): `Keyboard.handleKey(e, 'Dropdown', { open: ..., close: ... })`. `handleKey` looks up `functions[command]` (`js/foundation.util.keyboard.js:95-135`); `functions.toggle` is not defined, so ENTER and SPACE do nothing through this path. Commit `bca6cf55f` (2018-04-03, "fix: toggle dropdown if there is no focusable element inside") changed the commands from `open` to `toggle` without renaming the handler. The `open` handler (open, set `tabindex=-1` on the pane, focus it, `preventDefault`, only when the target is an anchor that is not `input, textarea`) is unreachable. In practice ENTER/SPACE on a `<button>` anchor work because the browser synthesizes a `click`, which reaches the Triggers `[data-toggle]` listener and fires `toggle.zf.trigger`. The unit tests in `test/javascript/components/dropdown.js:178-215` fire synthetic keydown events and assert the pane is visible after SPACE; they also assert the anchor keeps focus, which matches the dead-handler reality.

ESCAPE (`close` handler, js:210-213): closes and focuses `this.$anchors` (all of them; jQuery focuses the first).

Focus management:

- `autoFocus`: `Keyboard.findFocusable($element)` (`keyboard.js:28-60`: `a[href], area[href], input/select/textarea/button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]`, visible, `tabindex >= 0`, sorted by tabindex) and focus the first (js:261-266).
- `trapFocus`: `Keyboard.trapFocus` wraps TAB on the last focusable and SHIFT_TAB on the first (`keyboard.js:162-177`), released on close (js:302-304).

ARIA set by the plugin (see section 2): `aria-haspopup="true"`, `aria-expanded`, `aria-controls` on anchors; `aria-hidden`, `aria-labelledby` on the pane. No `role` is set on the pane. No arrow-key navigation inside the pane. Key parsing supports `SHIFT_`/`CTRL_`/`ALT_` prefixes and an `ltr`/`rtl` command split, but Dropdown uses a plain list (`keyboard.js:62-76, 107-114`).

### 7. Dependencies

- `Positionable` (and through it `Box`, `Plugin`, `rtl`).
- `Keyboard` (`register`, `handleKey`, `findFocusable`, `trapFocus`, `releaseFocus`).
- `Triggers.init($)` (js:33): document-level `[data-open]`/`[data-close]`/`[data-toggle]`/`[data-closable]`/`[data-toggle-focus]` click listeners, the window `closeme.zf.dropdown` listener, the debounced resize/scroll broadcasters, and the MutationObserver bridge (`triggers.js:224-258`).
- `Touch.init($)` (js:32): registers the `tap` and `swipe*` jQuery special events.
- `GetYoDigits`, `ignoreMousedisappear` from core utils.
- External: `what-input` (`package.json:36`, `>=5.2.10`) for `body[data-whatinput]`, consulted only by the hover path (js:170-171).
- Module JSDoc claims `@requires foundation.util.box, keyboard, touch, triggers` (js:12-15). No dependency on MediaQuery, Motion, Nest, Timer, ImageLoader, or other plugins. Dropdown Menu is a separate plugin and does not use Dropdown.

### 8. Sass configuration that shapes behaviour

`scss/components/_dropdown.scss` is theming only: `$dropdown-padding` (1rem), `$dropdown-background`, `$dropdown-border`, `$dropdown-font-size` (1rem), `$dropdown-width` (300px), `$dropdown-radius`, `$dropdown-sizes` (`tiny: 100px, small: 200px, large: 400px`). Behaviour-relevant parts of the mixin: `position: absolute` (the JS positioning depends on it), `display: none` until `.is-opening`/`.is-open`, `z-index: 10`. `$dropdown-width` sets the measured width used in the collision loop, so it indirectly changes which placement wins. Settings file mirrors: `scss/settings/_settings.scss:399-412`.

No breakpoint or animation settings. No transition or Motion UI hook; opening is an immediate class swap.

### 9. Behaviour that only jQuery makes easy

- `$element.data()` option harvesting and `data-options` parsing (see section 3).
- `$.extend`-based option merging with camelCase conversion.
- The `closeme` broadcast: `trigger` bubbles from the pane to `window`, where one global listener closes every sibling `[data-dropdown]` by DOM query (`triggers.js:123-131`). An Angular replacement needs a shared registry or an overlay-level "one open at a time" service instead of DOM-wide queries.
- `tap` special event and `ignoreMousedisappear` re-entry tracking on `document`.
- `Keyboard.findFocusable` uses `:visible`.
- `$body.off('click.zf.dropdown tap.zf.dropdown')` namespaced unbinding: Reveal reuses the *same* namespace for its own body click handler (`js/foundation.reveal.js:164, 371, 429`), so closing a Reveal removes any open Dropdown's `closeOnClick` handler. This is a collision, not a feature; do not carry it over.
- Multiple anchors per pane tracked via a live jQuery collection and `data('hover')` on all of them.
- `_destroy` uses `.hide()` (inline style) rather than the class contract.

---

## Tooltip (`js/foundation.tooltip.js`, `docs/pages/tooltip.md`, `scss/components/_tooltip.scss`)

### 1. Purpose

"Tooltips? More like Cooltips. But really though, tooltips are nifty for displaying extended information for a term or action on a page." (docs:3). "By default, a tooltip appears below the defined term on hover." (docs:11).

### 2. Markup contract

Docs example (docs:21-24):

```html
The <span data-tooltip tabindex="1" title="Fancy word for a beetle.">scarabaeus</span> hung quite
clear of any branches, and, if allowed to fall, would have fallen at our feet.
```

Position via legacy class (docs:39-42, 87-93): `<span data-tooltip class="top" ...>`, `.right`, `.left`. The docs add: "When using Foundation in right-to-left mode, 'right' still means right, and 'left' still means left." (docs:79-81).

Click behaviour (docs:48, 58-67): "By default, clicking on a tooltip will leave it open until you click somewhere else. However, you can disable that by adding `data-click-open="false"`".

Explicit positioning (docs:110-112):

```html
<button class="button" type="button" data-tooltip tabindex="1" title="Fancy word for a beetle." data-position="bottom" data-alignment="left">
  Bottom Left
</button>
```

Elements:

- Trigger: any element with `[data-tooltip]` and a `title` (or `data-tip-text`). The plugin instance lives on the trigger (js:21). The trigger gets `.has-tip` (`triggerClass`) which the Sass styles as `position: relative; display: inline-block; border-bottom: dotted 1px; font-weight: bold; cursor: help` (scss:135-142).
- Tip: created by the plugin, not authored. `_buildTemplate(id)` (js:105-115) makes `<div class="tooltip {templateClasses}" role="tooltip" aria-hidden="true" data-is-active="false" data-is-focus="false" id="{id}">` and `_init` appends it to `document.body` (js:49-57), filling it with `.html(tipText)` when `allowHtml` else `.text(tipText)`, then `.hide()`. A custom `template` option string replaces the generated element entirely (js:47).
- Legacy position class on the trigger: first of `\b(top|left|right|bottom)\b` in its class attribute, with SVG `className.baseVal` support (js:71-79); default `top`. Note the JSDoc says the default is "auto" but `_getDefaultPosition` resolves auto to `top`, and the docs say "appears below" (docs:11). The code wins: default position is `top` (tip above the term); the pip CSS for `.tooltip.top` points down, consistent with a tip above.
- Default alignment is always `center` (js:81-83).

Trigger attributes set at init (js:59-65): `title=""` (title is emptied so the native tooltip does not double up; restored on destroy from the tip text, js:291), `aria-describedby="{id}"` (reuses an existing `aria-describedby` value as the id, else `GetYoDigits(6, 'tooltip')`, js:44), `data-yeti-box="{id}"`, `data-toggle="{id}"`, `data-resize="{id}"`, plus class `has-tip`. `data-tooltip="<uuid>"` is added by the `Plugin` base.

State on the tip element:

| what | show (js:139-156) | hide (js:173-176) |
| --- | --- | --- |
| classes | `top/bottom/left/right` replaced with resolved position; `align-*` replaced with `align-{alignment}` | unchanged |
| `data-is-active` | `true` | `false` |
| `aria-hidden` | `false` | `true` |
| visibility | `css('visibility','hidden').show()` for measurement, then `.hide().css('visibility','')` and `fadeIn(fadeInDuration)` | `fadeOut(fadeOutDuration)`, callback resets `isActive`, `isClick` |

`data-is-focus` on the tip is written once and never read.

Sass contract (scss:144-232): `.tooltip` is `position: absolute; top: calc(100% + pip-height); z-index: 1200; max-width: $tooltip-max-width (10rem)` with a `::before` pip drawn by `css-triangle`. The pip is placed by `.bottom`/`.top`/`.left`/`.right` and `.align-center` (50% with translate), `.align-top`/`.align-bottom` (10% from the edge), `.align-left`/`.align-right` (10%).

### 3. Options

Merged as `$.extend({}, Tooltip.defaults, this.$element.data(), options)` (js:26). `data-*` attributes go on the trigger.

| option | data attribute | type | default | meaning |
| --- | --- | --- | --- | --- |
| `hoverDelay` | `data-hover-delay` | number (ms) | `200` | delay before showing on mouseenter (js:204-206); hide on mouseleave is immediate |
| `fadeInDuration` | `data-fade-in-duration` | number (ms) | `150` | jQuery `fadeIn` duration |
| `fadeOutDuration` | `data-fade-out-duration` | number (ms) | `150` | jQuery `fadeOut` duration |
| `disableHover` | `data-disable-hover` | boolean | `false` | do not bind mouseenter/mouseleave (js:200) |
| `disableForTouch` | `data-disable-for-touch` | boolean | `false` | on a touch device bind no events at all (js:198) |
| `templateClasses` | `data-template-classes` | string | `''` | extra classes on the generated tip |
| `tooltipClass` | `data-tooltip-class` | string | `'tooltip'` | base class on the generated tip |
| `triggerClass` | `data-trigger-class` | string | `'has-tip'` | class added to the trigger |
| `showOn` | `data-show-on` | string | `'small'` | minimum breakpoint (`MediaQuery.is`) at which `show()` proceeds; `'all'` skips the check (js:133-136) |
| `template` | `data-template` | string (HTML) | `''` | custom tip markup; replaces `_buildTemplate`, so the author must supply `role`, `id`, `aria-hidden` themselves |
| `tipText` | `data-tip-text` | string | `''` | tip content; falls back to the trigger's `title` (js:46) |
| `touchCloseText` | `data-touch-close-text` | string | `'Tap to close.'` | declared (js:381, no JSDoc) and in `foundation.d.ts:451`, but never read by any code in `js/` |
| `clickOpen` | `data-click-open` | boolean | `true` | a mousedown opens and keeps the tip open; with `false` the tip only follows hover/focus (js:224-240, 211) |
| `position` | `data-position` | string | `'auto'` | see shared model; `auto` reads the legacy class, else `top` |
| `alignment` | `data-alignment` | string | `'auto'` | see shared model; `auto` is `center` |
| `allowOverlap` | `data-allow-overlap` | boolean | `false` | see shared model |
| `allowBottomOverlap` | `data-allow-bottom-overlap` | boolean | `false` | Tooltip differs from Dropdown here (js:420) |
| `vOffset` | `data-v-offset` | number (px) | `0` | extra vertical distance |
| `hOffset` | `data-h-offset` | number (px) | `0` | extra horizontal distance |
| `tooltipHeight` | `data-tooltip-height` | number (px) | `14` | added to `vOffset` when position is `top`/`bottom` (js:93-99): room for the pip |
| `tooltipWidth` | `data-tooltip-width` | number (px) | `12` | added to `hOffset` when position is `left`/`right` (js:85-91) |
| `allowHtml` | `data-allow-html` | boolean | `false` | use `.html()` for the tip text; JSDoc warns about XSS (js:450-456) |

`tooltipHeight` 14 and `tooltipWidth` 12 correspond to the Sass pip: `$tooltip-pip-width: 0.75rem` (12px at 16px root) and `$tooltip-pip-height: 0.75rem * 0.866` (about 10.4px); the JS constants are not derived from the Sass and must be kept in sync by hand.

### 4. Events

Fired on the trigger (`this.$element`):

| event | args | when |
| --- | --- | --- |
| `init.zf.tooltip` | none | construction (`core.plugin.js:19`) |
| `closeme.zf.tooltip` | tip id | inside `show()` after positioning (js:148); window-level Triggers listener sends `close.zf.trigger` to every other `[data-tooltip]` element whose `data-yeti-box` differs (`triggers.js:123-131`) |
| `show.zf.tooltip` | none | end of `show()` (js:163), fired synchronously before the fade completes |
| `hide.zf.tooltip` | none | in `hide()` right after `fadeOut` starts (js:184) |
| `destroyed.zf.tooltip` | none | after `_destroy()` |

Listened for on the trigger:

| event | condition | handler |
| --- | --- | --- |
| `mouseenter.zf.tooltip` | `!disableHover` | if not active, `setTimeout(show, hoverDelay)` (js:202-208) |
| `mouseleave.zf.tooltip` | `!disableHover` | clear timeout; hide unless focused, or unless it was click-opened with `clickOpen` on (js:209-214); wrapped in `ignoreMousedisappear` |
| `tap.zf.tooltip touchend.zf.tooltip` | touch device | toggle (js:217-222) |
| `mousedown.zf.tooltip` | `clickOpen` | first mousedown sets `isClick = true` and shows when (`disableHover` or no `tabindex`) and not active (js:224-235). A second mousedown does nothing (the hide branch is commented out) |
| `mousedown.zf.tooltip` | `!clickOpen` | only sets `isClick = true` (js:237-239) |
| `close.zf.trigger` | always | `hide` (js:242-246). `toggle.zf.trigger` is commented out even though `data-toggle` is set on the trigger, so the Triggers `[data-toggle]` click listener fires `toggle.zf.trigger` on the trigger element with no handler |
| `focus.zf.tooltip` | always | if `isClick`: mark focus as not-real when `!clickOpen` and return; else `show()` (js:249-259) |
| `focusout.zf.tooltip` | always | reset flags, `hide()` (js:261-265) |
| `resizeme.zf.trigger` | always | re-run `_setPosition()` if active (js:267-271) |

Nothing is bound to the tip element itself; hovering the tip does not keep it open.

### 5. Public methods

- `show()` (js:132-164): breakpoint gate, measure-and-position while `visibility: hidden`, apply position/alignment classes, fire `closeme`, set active state, `fadeIn`, fire `show`. Returns `false` when below `showOn`.
- `hide()` (js:171-185): stop animations, set inactive ARIA/data state, `fadeOut`, fire `hide`.
- `toggle()` (js:278-284): by `isActive`.
- `destroy()` -> `_destroy()` (js:290-298): restores `title` from the tip text, unbinds `.zf.trigger .zf.tooltip`, removes `triggerClass` and legacy position classes, removes `aria-describedby data-disable-hover data-resize data-toggle data-tooltip data-yeti-box`, removes the tip element.

`foundation.d.ts:433-437` declares `show(): void; hide(): void; toggle(): void` for Tooltip.

### 6. Keyboard and ARIA behaviour

No `Keyboard.register` call and no keydown handler. Keyboard support is entirely focus-driven: the tip shows on `focus` and hides on `focusout` (js:249-265). ESCAPE does not dismiss. The docs examples give triggers `tabindex="1"` etc. so spans become focusable.

ARIA: the tip gets `role="tooltip"` and `aria-hidden` (js:108-110); the trigger gets `aria-describedby` pointing at the tip id (js:61). Test `test/javascript/components/tooltip.js:57-66` asserts exactly these three. The trigger's `title` is blanked so screen readers do not read it twice. No `aria-expanded`, no `aria-live`.

Touch: `tap`/`touchend` toggles; `disableForTouch` removes all handlers.

### 7. Dependencies

- `Positionable` (and `Box`, `Plugin`).
- `MediaQuery` (`_init` at js:43, `is(showOn)` at js:133).
- `Triggers.init($)` (js:33) for `close.zf.trigger` delivery, `closeme` fan-out, and `resizeme`.
- `GetYoDigits`, `ignoreMousedisappear`.
- Module JSDoc: `@requires foundation.util.box, mediaQuery, triggers` (js:10-12). Not Keyboard, not Touch (the `tap` event only exists if some other plugin called `Touch.init`; on its own Tooltip would still get `touchend`).
- No dependency on other plugins.

### 8. Sass configuration that shapes behaviour

`scss/components/_tooltip.scss:91-133` (mirrored in `scss/settings/_settings.scss:866-873`):

- Behaviour-shaping: `$tooltip-pip-width` (0.75rem) and `$tooltip-pip-height` (`* 0.866`) set the pip size; the JS `tooltipHeight` / `tooltipWidth` defaults (14 / 12 px) exist to leave room for that pip. `$tooltip-max-width` (10rem) bounds the measured width used in collision checks. The `top: calc(100% + pip-height)` in the base mixin is a CSS-only default that the JS overrides through inline `top`/`left`.
- Theming only: `$has-tip-cursor`, `$has-tip-font-weight`, `$has-tip-border-bottom`, `$tooltip-background-color`, `$tooltip-color`, `$tooltip-padding`, `$tooltip-font-size`, `$tooltip-radius`.
- Breakpoints: `showOn` is checked against the `$breakpoints` map (`scss/util/_breakpoint.scss:14-20`: small 0, medium 640px, large 1024px, xlarge 1200px, xxlarge 1440px) serialized into `.foundation-mq { font-family: ... }` (`scss/_global.scss:143-146`) and read back by `MediaQuery._init` (`js/foundation.util.mediaQuery.js:80-114`).

### 9. Behaviour that only jQuery makes easy

- `fadeIn` / `fadeOut` with `.stop()`: the show/hide animation is jQuery's, not CSS. A replacement would use CSS transitions or `animate.enter` / `animate.leave`.
- Appending the tip to `document.body` and positioning it with `$.fn.offset`. This is the CDK Overlay use case, or native `popover` + CSS anchor positioning.
- The `visibility: hidden; display: block` measure-then-show dance.
- `closeme` fan-out via window-level query of `[data-tooltip]`.
- `$(this.options.template)` turning an HTML string into an element, and `allowHtml` injecting raw HTML. Angular would use content projection or a `TemplateRef`.
- `ignoreMousedisappear` document-level re-entry tracking.
- The `tap` special event.

---

## Sticky (`js/foundation.sticky.js`, `docs/pages/sticky.md`, `scss/components/_sticky.scss`)

### 1. Purpose

"Stick nearly anything, anywhere you like!" (docs:3). "Add the `.sticky` class and `[data-sticky]` to an element to create something that sticks. Sticky elements must be wrapped in a container, which will determine your sizing and grid layout, with `[data-sticky-container]`." (docs:10).

### 2. Markup contract

Docs examples (docs:20-34):

```html
<div class="cell small-6 right" data-sticky-container>
  <div class="sticky" data-sticky data-margin-top="0">
    <img class="thumbnail" src="assets/img/generic/rectangle-3.jpg">
    <!-- This sticky element would stick to the window, with a marginTop of 0 -->
  </div>
</div>

<div class="cell small-6 right" data-sticky-container>
  <div class="sticky" data-sticky data-anchor="foo">
    <img class="thumbnail" src="assets/img/generic/rectangle-3.jpg">
    <!-- This sticky element would stick to the window for the height of the element #foo, with a 1em marginTop -->
  </div>
</div>
```

Two anchors (docs:61, 71-77): "Using `data-top-anchor="idOfSomething"`, `data-btm-anchor="idOfSomething:[top/bottom]"`, or a set pixel number `data-top-anchor="150"`. If you use an element id with no top/bottom specified, it defaults to the top."

```html
<div class="cell small-6 right" data-sticky-container>
  <div class="sticky" data-sticky data-top-anchor="example2:top" data-btm-anchor="foo:bottom">
    <img class="thumbnail" src="assets/img/generic/rectangle-5.jpg">
  </div>
</div>
```

Stick to bottom (docs:112-118): `data-stick-to="bottom"` with two anchors.

Sticky navigation (docs:148-155, 162-168): "Please note the style `width:100%`":

```html
<div data-sticky-container>
  <div class="title-bar" data-sticky data-options="marginTop:0;" style="width:100%" data-top-anchor="1" data-btm-anchor="content:bottom">
    ...
  </div>
</div>
```

Elements:

- Sticky element: `.sticky[data-sticky]`. Gets `stickyClass` (`sticky`) added at init, plus `data-resize="{id}"` and `data-mutate="{id}"` (js:54); `id` is the element's own id or `GetYoDigits(6, 'sticky')` (js:42) but note the generated id is *not* written to the element; it is only used for the scroll listener namespace.
- Container: the direct parent `[data-sticky-container]` (js:41). If missing, the element is wrapped in `options.container` (`<div data-sticky-container></div>`) and `wasWrapped` is remembered for `_destroy` (js:45-51). The container gets `containerClass` (`sticky-container`) (js:52). The plugin sets the container's inline `height` to the element's height so the layout keeps its place while the element is `position: fixed` (js:63-64, 328-331).
- Anchor element(s): `#{anchor}` gets `data-mutate="{id}"` (js:55-57) so DOM changes inside it re-run the calculation.

State classes on the sticky element (all in `scss/components/_sticky.scss:5-39`):

| class | set by | CSS |
| --- | --- | --- |
| `.sticky` | init | `position: relative; z-index: 0; transform: translate3d(0,0,0)` |
| `.is-stuck` | `_setSticky` (js:247-248) | `position: fixed; z-index: 5; width: 100%` |
| `.is-at-top` / `.is-at-bottom` | with `.is-stuck` (which edge it sticks to) or with `.is-anchored` (which end of the range it rests at) | `.is-stuck.is-at-top { top: 0 }`, `.is-stuck.is-at-bottom { bottom: 0 }`, `.is-anchored.is-at-bottom { bottom: 0 }` |
| `.is-anchored` | `_removeSticky` (js:287-288) | `position: relative; right: auto; left: auto` |
| `.sticky-container` | init on container | `position: relative` |

Inline styles the plugin writes: on stick, `margin-top` or `margin-bottom` = `{marginTop|marginBottom}em`, `{stickTo}: 0`, the other edge `auto` (js:243-249); on unstick, margin 0, `bottom: auto`, `top: 0` when resting at the top of the range or `top: <range height - element height>` when resting at the bottom (js:277-289); always `max-width: <container inner width>px` (js:321-323) and the container's `height` (js:330).

### 3. Options

Merged as `$.extend({}, Sticky.defaults, this.$element.data(), options)` (js:24). The docs note (docs/pages/javascript.md:160) that `topAnchor`/`btmAnchor` cannot go inside `data-options` because their values contain `:`.

| option | data attribute | type | default | meaning |
| --- | --- | --- | --- | --- |
| `container` | `data-container` | string (HTML) | `'<div data-sticky-container></div>'` | wrapper used when no `[data-sticky-container]` parent exists |
| `stickTo` | `data-stick-to` | string | `'top'` | `'top'` or `'bottom'` of the viewport; there is a comment placeholder for a `both` option that is not implemented (js:372-374) |
| `anchor` | `data-anchor` | string (id) | `''` | single anchor element: sticks while its box scrolls through the viewport |
| `topAnchor` | `data-top-anchor` | string (`id`, `id:top`, `id:bottom`) or number (px) | `''` | start of the sticky range; `''` means 1px from the document top (js:90) |
| `btmAnchor` | `data-btm-anchor` | same | `''` | end of the sticky range; `''` means `document.documentElement.scrollHeight` (js:91) |
| `marginTop` | `data-margin-top` | number (em) | `1` | gap from the viewport top while stuck; converted with body font-size (`emCalc`, js:508-510) |
| `marginBottom` | `data-margin-bottom` | number (em) | `1` | gap from the viewport bottom while stuck |
| `stickyOn` | `data-sticky-on` | string (breakpoint expression) | `'medium'` | `MediaQuery.is(stickyOn)`; below it the plugin unsticks and pauses its scroll listener (js:305, 161-175) |
| `stickyClass` | `data-sticky-class` | string | `'sticky'` | class added to the element |
| `containerClass` | `data-container-class` | string | `'sticky-container'` | class added to the container |
| `dynamicHeight` | `data-dynamic-height` | boolean | `true` | recompute the container height on every `_setSizes`; when false it is set once (js:326-332) |
| `checkEvery` | `data-check-every` | number | `-1` | scroll events between full recalculations of sizes and breakpoints; `0` recalculates on every scroll; `-1` never on scroll (js:128-136). The counter starts at `checkEvery` and never reaches 0 when it is `-1` |

`foundation.d.ts:386-399` lists the same 12 options and "No public methods".

Range computation (`_parsePoints`, js:89-113; `_setBreakPoints`, js:353-380):

- With `anchor`: `topPoint = $anchor.offset().top`, `bottomPoint = topPoint + anchorHeight`.
- With `topAnchor`/`btmAnchor`: each is a number (px) or `id[:top|bottom]`; `:bottom` adds the anchor's height.
- `stickTo: 'top'`: `topPoint -= marginTopPx`, `bottomPoint -= elemHeight + marginTopPx`.
- `stickTo: 'bottom'`: `topPoint -= innerHeight - (elemHeight + marginBottomPx)`, `bottomPoint -= innerHeight - marginBottomPx`.
- `_calc(checkSizes, scroll)` (js:200-227): if `!canStick` unstick; else stuck iff `topPoint <= scrollY <= bottomPoint`; above the range rest at top (`is-anchored is-at-top`), below it rest at bottom (`is-anchored is-at-bottom`).

### 4. Events

Fired on the sticky element:

| event | when |
| --- | --- |
| `init.zf.sticky` | construction |
| `sticky.zf.stuckto:top` or `sticky.zf.stuckto:bottom` | `_setSticky` (js:255); namespaced by `stickTo` |
| `sticky.zf.unstuckfrom:top` or `sticky.zf.unstuckfrom:bottom` | `_removeSticky` (js:295); namespaced by which end of the range the element now rests at |
| `pause.zf.sticky` | `_pauseListeners` when a resize shrinks the viewport below `stickyOn` (js:182-192); marked `@private` |
| `destroyed.zf.sticky` | after `_destroy()` |

Listened for:

| event | where | handler |
| --- | --- | --- |
| window `load` (via `onLoad`, `core.utils.js:79-94`; fires on next tick if already loaded) | window | the whole initial measurement: container height, anchor lookup, `_setSizes`, initial `_calc`, then `_events` (js:61-81) |
| `scroll.zf.<reversed id>` | window | `_calc` every scroll, with a full `_setSizes` every `checkEvery` scrolls (js:126-137); bound only when `canStick` |
| `resizeme.zf.trigger` | element | `_eventsHandler`: `_setSizes`, `_calc`, then start or pause the scroll listener depending on `canStick` (js:140-143, 161-175) |
| `mutateme.zf.trigger` | element and anchor | same handler (js:145-153); Triggers delivers it from a MutationObserver watching `childList` and `style` attribute changes under any `[data-mutate]` (`triggers.js:181-222`) |
| `transitionend` (and vendor variants) | element | `_setSizes` after becoming stuck (js:256-258); never unbound |

`_destroy` unbinds `change.zf.sticky` on the anchor (js:401) but nothing ever binds it.

### 5. Public methods

None beyond `destroy()` (`foundation.d.ts:382-384` "No public methods"). `_destroy` (js:388-414): unstick to top, remove classes and inline styles, unbind `resizeme`/`mutateme`/scroll/onLoad listeners, and either `unwrap()` the element (if the plugin created the container) or clear the container's class and height.

The docs page has no JavaScript Reference section in the clone for Sticky beyond the generated tables.

### 6. Keyboard and ARIA behaviour

None. Sticky sets no ARIA attributes, registers no keys, and manages no focus. The `transform: translate3d(0,0,0)` on `.sticky` creates a containing block for `position: fixed` descendants, which matters for anything with a fixed-position child (a Reveal inside a sticky bar, for example).

### 7. Dependencies

- `Plugin`, `onLoad`, `GetYoDigits`.
- `MediaQuery` (`_init` at js:39, `is(stickyOn)` at js:305).
- `Triggers.init($)` (js:28) for `resizeme.zf.trigger` (debounced 250 ms resize) and `mutateme.zf.trigger` (MutationObserver).
- Module JSDoc: `@requires foundation.util.triggers, mediaQuery` (js:10-11).
- Related plugin: Magellan docs recommend pairing with Sticky (docs/pages/magellan.md:3, 40-89); no code dependency either way.

### 8. Sass configuration that shapes behaviour

`scss/components/_sticky.scss` has no variables at all; it is the class contract listed in section 2 (`position: relative`/`fixed`, `z-index` 0/5, `width: 100%` when stuck, `transform: translate3d`). Behaviour-shaping inputs come from elsewhere:

- `$breakpoints` (`scss/util/_breakpoint.scss:14-20`) via `stickyOn`.
- Body `font-size` (root `$global-font-size` on `html`, `scss/_global.scss:148-151`) via `emCalc` for the margins.
- Any grid or cell width on the container: the element's `max-width` is copied from the container's inner width because `position: fixed` loses the grid.

No animation settings.

### 9. Behaviour that only jQuery makes easy

- `$element.wrap(...)` / `.unwrap()` to synthesize the container.
- `$.fn.offset().top` for anchor document positions.
- Namespaced window scroll listeners (`scroll.zf.<id>`) with `.off()` by namespace.
- Everything else is plain DOM. More important for the next ticket: the whole plugin is a JavaScript emulation of what CSS `position: sticky` gives natively for the `stickTo: 'top'`, single-container case (the sticky range is the containing block; `top: <margin>` is the offset). What CSS sticky does not give: arbitrary `topAnchor`/`btmAnchor` ids outside the container, `stickTo: 'bottom'` with a range that starts above the viewport, the `stuckto`/`unstuckfrom` events, the `is-stuck`/`is-anchored` classes, and breakpoint gating (though `@media` plus `position: static` covers gating). Map notes list this as a candidate prototype ticket.

---

## Magellan (`js/foundation.magellan.js`, `docs/pages/magellan.md`)

### 1. Purpose

"Magellan allows you to create navigation that tracks the active section of a page your user is in. Pair it with our Sticky plugin to create a fixed navigation element." (docs:3).

### 2. Markup contract

Docs (docs:12): "You can use Magellan with any navigation element, like our Menu or your own custom component. Just add the attribute `data-magellan` to the container, and links to specific sections of your page. Each section needs a unique ID."

Docs example (docs:22-36):

```html
<!-- Add a Menu -->
<ul class="menu expanded" data-magellan>
  <li><a href="#first">First Arrival</a></li>
  <li><a href="#second">Second Arrival</a></li>
  <li><a href="#third">Third Arrival</a></li>
</ul>

<!-- Add content where magellan will be linked -->
<div class="sections">
  <section id="first" data-magellan-target="first">First Section</section>
  <section id="second" data-magellan-target="second">Second Section</section>
  <section id="third" data-magellan-target="third">Third Section</section>
</div>
```

Sticky pairing (docs:48-72, 77-89): the `data-magellan` menu sits inside a `data-sticky` element; nothing else changes.

Elements:

- Container: `[data-magellan]`; gets `data-resize="{id}"`, `data-scroll="{id}"`, and `id` (own id or `GetYoDigits(6, 'magellan')`) (js:41-48).
- Links: every `a` inside the container (`this.$links`, js:43); click handling is delegated to `a[href^="#"]` (js:100).
- Targets: every `[data-magellan-target]` **in the whole document** (`$('[data-magellan-target]')`, js:42), not scoped to the container. The active link is found by matching `href="#" + target.data('magellan-target')` (js:176), so the `data-magellan-target` value must equal the link fragment (and, for scrolling to work, the element's `id`).
- Active class: `activeClass` (`is-active`) on the active `<a>` (js:186-187). Foundation's menu Sass styles `.menu .is-active > a` (`scss/components/_menu.scss:478`) and Dropdown Menu styles `li.is-active > a` (`scss/components/_dropdown-menu.scss:160`); since Magellan puts the class on the `<a>` itself rather than the `<li>`, the menu's active styling does not apply without extra CSS or a different `activeClass` target.

### 3. Options

Merged as `$.extend({}, Magellan.defaults, this.$element.data(), options)` (js:26).

| option | data attribute | type | default | meaning |
| --- | --- | --- | --- | --- |
| `animationDuration` | `data-animation-duration` | number (ms) | `500` | duration of the animated scroll |
| `animationEasing` | `data-animation-easing` | string | `'linear'` | jQuery `animate` easing: `'swing'` or `'linear'` |
| `threshold` | `data-threshold` | number (px) | `50` | "Number of pixels to use as a marker for location changes": each target's activation point is `offset().top - threshold` (js:71); when scrolling up the threshold is applied again (js:161, 167); `scrollToLoc` stops `threshold / 2` short of the target (smoothScroll.js:82) |
| `activeClass` | `data-active-class` | string | `'is-active'` | class on the active link |
| `deepLinking` | `data-deep-link` (JSDoc name `deepLinking`; the docs say "the `data-deep-link` option", docs:95, which jQuery maps to `deepLink`, not `deepLinking`; use `data-deep-linking` or `data-options="deepLinking:true"`) | boolean | `false` | update the URL hash to the active section and scroll to `location.hash` on load and on `hashchange` |
| `updateHistory` | `data-update-history` | boolean | `false` | with deep linking, `pushState` instead of `replaceState` (js:195-199; docs:95-97: "In the latter case, the browser's back button will track each section Magellan has gone through (in most case, this is not recommended).") |
| `offset` | `data-offset` | number (px) | `0` | "Number of pixels to offset the scroll of the page on item click if using a sticky nav bar"; also subtracted when deciding which section is active (js:161, 167) |

`foundation.d.ts:214-222` lists the same seven.

Open question on the `data-deep-link` naming: jQuery's `.data()` turns `data-deep-link` into the key `deepLink`, which does not match `deepLinking`. The docs sentence is therefore misleading unless the Panini docs build used `data-options`. A later spec should pick one input name (`deepLinking`) and note the mismatch.

### 4. Events

Fired on the container:

| event | args | when |
| --- | --- | --- |
| `init.zf.magellan` | none | construction |
| `update.zf.magellan` | `[$active]` (may be empty) | end of `_updateActive` when the active link changed (js:205-211) |
| `destroyed.zf.magellan` | none | after `_destroy()` |

Listened for:

| event | where | handler |
| --- | --- | --- |
| window `load` (`$(window).one('load')`, js:84-92) | window | if deep linking and `location.hash`, `scrollToLoc(hash)`; then `calcPoints()` and `_updateActive()`. Note this uses a bare `one('load')`, which never fires if the document already loaded before the plugin ran; the `onLoad` helper at js:94 handles that case for the listeners below |
| `resizeme.zf.trigger` | container | `reflow` (js:97) |
| `scrollme.zf.trigger` | container | `_updateActive` (js:98). Delivered by Triggers: window scroll debounced 10 ms sets `data-events="scroll"` on every `[data-scroll]` element and the MutationObserver bridge fires `scrollme.zf.trigger` (`triggers.js:114-122, 174-179, 192-194`) |
| `click.zf.magellan` on `a[href^="#"]` | container (delegated) | `preventDefault`, `scrollToLoc(href)` (js:100-104) |
| `hashchange` | window | `scrollToLoc(location.hash)` when deep linking (js:107-113) |

### 5. Public methods

- `calcPoints()` (js:60-75): recompute `winHeight`, `docHeight`, and `points[]` (one activation point per target, `round(offset().top - threshold)`).
- `scrollToLoc(loc)` (js:121-135): set `_inTransition`, delegate to `SmoothScroll.scrollToLoc(loc, {animationEasing, animationDuration, threshold, offset}, cb)`; `_inTransition` suppresses `_updateActive` until the animation completes (js:153).
- `reflow()` (js:141-144): `calcPoints` + `_updateActive`; bound to `resizeme`.
- `destroy()` -> `_destroy()` (js:218-229): unbind, remove active class, attempt to strip the hash (`window.location.hash.replace(hash, '')` is a no-op string call; the hash is not actually changed), unbind `hashchange` and onLoad.

`foundation.d.ts:208-212`: `calcPoints(): void; scrollToLoc(location: string): void; reflow(): void`.

Active-section algorithm (`_updateActive`, js:152-212): scroll position `p`; direction detected by comparing with the previous position. Before `points[0] - offset - (up ? threshold : 0)`: no active link. If `p + winHeight === docHeight` (exactly at the bottom): last link. Else: the last point whose `point - offset - (up ? threshold : 0) <= p`. Then swap the class, update the hash (only when `deepLinking` and the hash differs; with no active link the hash is removed by writing `pathname + search`), and fire `update` when the active link changed.

### 6. Keyboard and ARIA behaviour

None. Magellan sets no ARIA attributes (no `aria-current`), registers no keys, and manages no focus. Links remain ordinary anchors; keyboard activation works because the delegated click handler fires for keyboard-initiated clicks too, but focus is not moved to the target section after the animated scroll (the native fragment navigation that would have moved focus is prevented).

### 7. Dependencies

- `Plugin`, `onLoad`, `GetYoDigits`.
- `SmoothScroll` (static `scrollToLoc`), so Magellan imports the SmoothScroll module (js:4, 132).
- `Triggers.init($)` (js:30) for `resizeme` and `scrollme`.
- Module JSDoc: `@requires foundation.smoothScroll, foundation.util.triggers` (js:11-12).
- No Sass for Magellan (`rg magellan scss/` finds nothing).

### 8. Sass configuration that shapes behaviour

None. There is no `_magellan.scss`. The `is-active` class is the only styling hook and, as noted, lands on the `<a>`.

### 9. Behaviour that only jQuery makes easy

- Animated scrolling via `$('html, body').stop(true).animate({scrollTop})` with jQuery easings (through SmoothScroll). Native replacement: `element.scrollIntoView({behavior: 'smooth'})` or `window.scrollTo({top, behavior: 'smooth'})` plus CSS `scroll-margin-top` for the offset; but there is no completion callback for native smooth scroll, which Magellan needs to lift `_inTransition` (a `scrollend` event exists in modern browsers).
- Document-wide `$('[data-magellan-target]')` query and `href` matching. An Angular version would register targets through a directive and DI.
- Scroll-position bookkeeping on every scroll event. `IntersectionObserver` is the platform answer, though it does not reproduce the "last point above the fold plus threshold" semantics exactly.
- Hash and history updates are plain `history.pushState` / `replaceState` already.

---

## SmoothScroll (`js/foundation.smoothScroll.js`, `docs/pages/smooth-scroll.md`)

### 1. Purpose

"Allows internal links smooth scrolling." (docs:3). "To enable SmoothScroll on internal links, just add the attribute `data-smooth-scroll` to the parent container like our Menu. Please note that each section needs a unique ID." (docs:115).

### 2. Markup contract

Docs examples (docs:122-132, 141-143):

```html
<ul class="menu" data-smooth-scroll>
  <li><a href="#first">First Arrival</a></li>
  <li><a href="#second">Second Arrival</a></li>
  <li><a href="#third">Third Arrival</a></li>
</ul>
<div class="sections">
  <section id="first">First Section</section>
  <section id="second">Second Section</section>
  <section id="third">Third Section</section>
</div>
```

```html
<a href="#exclusive" data-smooth-scroll>Exclusive Section</a>
<section id="exclusive">The Exclusive Section</section>
```

Elements: `[data-smooth-scroll]` on a container or directly on an `a[href^="#"]`. The element gets an `id` (own or `GetYoDigits(6, 'smooth-scroll')`, js:16-17). Targets are plain elements with matching `id`s. No classes, no state classes, no Sass.

### 3. Options

Merged as `$.extend({}, SmoothScroll.defaults, this.$element.data(), options)` (js:20).

| option | data attribute | type | default | meaning |
| --- | --- | --- | --- | --- |
| `animationDuration` | `data-animation-duration` | number (ms) | `500` | scroll animation duration |
| `animationEasing` | `data-animation-easing` | string | `'linear'` | jQuery easing, `'swing'` or `'linear'` |
| `threshold` | `data-threshold` | number (px) | `50` | scroll stops `threshold / 2` above the target (js:82) |
| `offset` | `data-offset` | number (px) | `0` | extra distance to stop above the target, "if using a sticky nav bar" |

Same four in `foundation.d.ts:374-379`. Magellan's options are a superset with identical defaults.

### 4. Events

Fired: only `init.zf.smooth-scroll` and `destroyed.zf.smooth-scroll` from the `Plugin` base (the plugin name is hyphenated from `className = 'SmoothScroll'`, `core.plugin.js:41-47`). No plugin-specific events; no completion event after the scroll.

Listened for: `click.zf.smoothScroll` on the element itself and delegated to `a[href^="#"]` inside it (js:42-45). The handler (js:53-66) returns without action unless `e.currentTarget` is an `a[href^="#"]`, otherwise sets `_inTransition`, calls the static `scrollToLoc`, and `preventDefault()`s the click.

### 5. Public methods

- `static scrollToLoc(loc, options = SmoothScroll.defaults, callback)` (js:76-94): `$(loc)`; return `false` if the target does not exist (test `test/javascript/components/magellan.js:71` covers "fails gracefully when target does not exist"); `scrollPos = round(target.offset().top - threshold/2 - offset)`; `$('html, body').stop(true).animate({scrollTop}, duration, easing, callback)`.
- `destroy()` -> `_destroy()` (js:100-103): unbind both click handlers.

`foundation.d.ts:369-372` declares `scrollToLoc(loc, options, callback): boolean`.

### 6. Keyboard and ARIA behaviour

None. Keyboard activation of a link produces a click, so the handler runs; the native fragment navigation is prevented, so focus does not move to the target and the URL hash does not change. No ARIA attributes are set.

### 7. Dependencies

`Plugin`, `GetYoDigits`, jQuery. No utilities, no Triggers, no MediaQuery. Magellan depends on this module.

### 8. Sass configuration that shapes behaviour

None; no Sass file.

### 9. Behaviour that only jQuery makes easy

- `$('html, body').animate({scrollTop})` with named easings and a completion callback. Native: `window.scrollTo({ top, behavior: 'smooth' })` or `scrollIntoView`, with CSS `scroll-behavior: smooth` and `scroll-margin-top` / `scroll-padding-top` for the offset; completion via the `scrollend` event. The duration and easing are not configurable natively.
- `$(loc)` accepting any selector string (the docs say "a properly formatted jQuery id selector", js:71).

---

## Cross-cutting utilities these five plugins rely on

### Triggers (`js/foundation.util.triggers.js`)

Initialized once per page on window load (`triggers.js:244-258`). Provides:

- Simple delegated click listeners on `document`: `[data-open]`, `[data-close]`, `[data-toggle]`, `[data-closable]`, `[data-toggle-focus]` (`triggers.js:71-99, 224-233`). `data-toggle="a b"` may name several ids separated by spaces (`triggers.js:15-19`). `open` and `toggle` use `triggerHandler` (no bubbling), `close` uses `trigger` (bubbles).
- Global `closeme.zf.{dropdown|tooltip|reveal}` listener on `window` closing every other instance of the same plugin type (`triggers.js:123-131, 135-155`). Only elements with `[data-yeti-box]` on the page enable it.
- Debounced window `resize` (250 ms) and `scroll` (10 ms) broadcasters that set `data-events` on `[data-resize]` / `[data-scroll]` elements; one MutationObserver per element turns that attribute write into `resizeme.zf.trigger` / `scrollme.zf.trigger`, and `childList`/`style` mutations under `[data-mutate]` into `mutateme.zf.trigger` (`triggers.js:157-222`). The MutationObserver route exists so that handlers run per element without a jQuery event per element; the IE9 fallback triggers directly.

Used by: Dropdown (open/close/toggle/resizeme/closeme), Tooltip (close/resizeme/closeme), Sticky (resizeme/mutateme), Magellan (resizeme/scrollme). SmoothScroll does not use it.

### Keyboard (`js/foundation.util.keyboard.js`)

Key map limited to TAB, ENTER, ESCAPE, SPACE, END, HOME, ARROW_* (`keyboard.js:12-23`); other keys map to their uppercase character. `register(component, commands)` and `handleKey(event, component, functions)` with `handled`/`unhandled` callbacks and an `event.zfIsKeyHandled` flag to stop double handling (`keyboard.js:95-135`). `findFocusable`, `trapFocus`, `releaseFocus`. Only Dropdown among the five uses it.

### MediaQuery (`js/foundation.util.mediaQuery.js`)

Reads the breakpoint map from the `font-family` of a generated `<meta class="foundation-mq">` (`mediaQuery.js:80-114`, `scss/_global.scss:143-146`), exposes `is('medium')`, `is('medium only')`, `is('medium down')`, `atLeast`, `only`, `upTo`, `next`, and fires `changed.zf.mediaquery` on `window` with `[newSize, oldSize]` when the breakpoint changes on resize (`mediaQuery.js:282-294`). Used by Tooltip (`showOn`) and Sticky (`stickyOn`).

### Core utils (`js/foundation.core.utils.js`)

- `rtl()`: `html[dir="rtl"]` (used by Positionable defaults and Keyboard).
- `GetYoDigits(6, ns)`: random base-36 id `xxxxxx-ns`.
- `onLoad($elem, handler)`: run after window load, or on the next tick if already loaded.
- `ignoreMousedisappear(handler)`: filters `mouseleave` events whose `relatedTarget` is `null` (mouse went to browser chrome), re-arming on `document` `mouseenter`.

### Option plumbing (`js/foundation.core.js:133-172`)

`Foundation.reflow` finds `[data-<plugin>]` elements without a `zfPlugin` instance, parses `data-options="k: v; k2: v2"` with `parseValue` (`"true"`/`"false"`/numbers coerced), and constructs the plugin with `{ reflow: true, ...parsedOptions }`. Individual `data-*` attributes are read inside each plugin via `$element.data()`. Precedence, lowest to highest: plugin defaults, `data-*` attributes, `data-options`, programmatic options (docs/pages/javascript.md:170-172).

### what-input

Foundation lists `what-input >= 5.2.10` as a dependency (`package.json:36`) and its starter HTML loads it (`docs/pages/installation.md:226`). Among these five plugins only Dropdown reads it (`body[data-whatinput]`), to suppress hover-open when the last input was keyboard or touch.
