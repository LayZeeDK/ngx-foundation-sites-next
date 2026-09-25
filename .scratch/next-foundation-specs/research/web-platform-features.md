# Native web platform features that can replace Foundation JavaScript

Ticket: `../issues/11-web-platform-features.md`
Researched: 2026-09-25. Every Baseline label and date below was read on that day from the URL cited next to it.

Corrected 2026-09-25 after [Audit 0001: research wave](../audits/0001-research-wave.md), finding H6: Foundation option names corrected against each plugin's defaults.

## How to read this file

### Baseline labels

web.dev defines three labels (https://web.dev/baseline, fetched 2026-09-25):

- Limited availability: not yet supported in every core browser.
- Newly available: supported in all core browsers (Chrome desktop and Android, Edge, Firefox desktop and Android, Safari macOS and iOS). Features are also tagged with the year they became newly available ("Baseline 2024").
- Widely available: 30 months after the newly-available date.

The MDN banner text is the primary citation for each feature. Where MDN's banner covers a whole page and the ticket needs a sub-feature (for example `closedby` inside the `<dialog>` page), the per-browser versions come from the same data MDN renders: the `web-features` package (version 3.40.0, https://unpkg.com/web-features@3.40.0/data.json) and the raw `mdn/browser-compat-data` JSON files (https://raw.githubusercontent.com/mdn/browser-compat-data/main/...). Both were downloaded on 2026-09-25.

### The support target: Baseline widely available on 2026-05-07

The library follows Angular 22's browser support, which is the Baseline widely-available set on 2026-05-07 (https://web-platform-dx.github.io/supported-browsers/?widelyAvailableOnDate=2026-05-07&includeDownstream=false). The concrete minimum versions, supplied by the user:

| Browser | Minimum version | Released |
| --- | --- | --- |
| Chrome (desktop and Android) | 119 | 2023-10-31 |
| Edge | 119 | 2023-11-02 |
| Firefox (desktop and Android) | 119 | 2023-10-24 |
| Safari (macOS and iOS) | 17 | 2023-09-18 |

A feature "meets the target" only when all seven browsers support it from those versions or earlier. In Baseline terms that is "newly available on or before roughly 2023-11-07". Each section states the minimum supporting version per engine (Chromium covers Chrome, Chrome for Android and Edge; Gecko covers Firefox and Firefox for Android; WebKit covers Safari and Safari for iOS) and grades against the table above. A feature that misses by a single version (see `<details name>` at Chrome 120 and `:has()` at Firefox 121) still misses.

### Feature summary

| Feature | Baseline label (date) | Chromium | Gecko | WebKit | Meets 2026-05-07 target |
| --- | --- | --- | --- | --- | --- |
| `<dialog>`, `showModal()`, top layer, `::backdrop`, `:modal` | Widely available (since 2022-03, widely 2024-09-14) | 37 | 98 | 15.4 | yes |
| `<dialog closedby>` / `dialog.closedBy` | Limited availability | 134 | 141 | none | no |
| `dialog.requestClose()` | Baseline 2025, newly available 2025-05-27 | 134 | 139 | 18.4 | no |
| `popover="auto"` / `"manual"`, `popovertarget`, `:popover-open`, `beforetoggle`/`toggle`, `showPopover()` etc. | Baseline 2024 (attribute, since 2024-04) / Baseline 2025 (API page, since 2025-01-27) | 114 | 125 | 17 (iOS 18.3 for the full API) | no |
| `popover="hint"` | Limited availability | 151 | 153 | none | no |
| CSS anchor positioning (`anchor-name`, `position-area`, `position-try-fallbacks`, `anchor()`) | Baseline 2026, newly available 2026-01-13 | 125 | 147 | 26 | no |
| `position-anchor` (spec-conformant `normal` initial value) | Baseline 2026, newly available 2026-09 | 151 | 151 | 27 | no |
| `<details>` / `<summary>`, `toggle` event | Widely available (since 2020-01, widely 2022-07-15) | 12 | 49 | 6 | yes |
| `<details name>` (exclusive accordion) | Baseline 2024, newly available 2024-09-03 | 120 | 130 | 17.2 | no (Chrome 120 > 119) |
| `::details-content` | Baseline 2025, newly available 2025-09-16 | 131 | 143 | 18.4 | no |
| `interpolate-size`, `calc-size()` | Limited availability (Chromium only) | 129 | none | none | no |
| `@starting-style` | Baseline 2024, newly available 2024-08-06 | 117 | 129 | 17.5 | no |
| `transition-behavior: allow-discrete` | Baseline 2024, newly available 2024-08-06 | 117 | 129 | 17.4 | no |
| `overlay` | Limited availability (Chromium only) | 117 | none | none | no |
| Scroll-driven animations (`animation-timeline`, `scroll()`, `view()`, `animation-range`) | Limited availability | 115 | flag only | 26 | no |
| `position: sticky` | Widely available (since 2019-09, widely 2022-03-19) | 56 | 32 | 13 | yes |
| Scroll snap (`scroll-snap-type`, `scroll-snap-align`, `scroll-padding`) | Widely available (since 2020-01 / 2022-04, widely 2022-07-15) | 69 | 99 (68 Android) | 11 | yes |
| `scrollIntoView()` with options | Widely available (since 2020-01) | 61 | 36 | 15.4 (smooth) | yes |
| `scroll-behavior` | Widely available (since 2022-03, widely 2024-09-14) | 61 | 36 | 15.4 | yes |
| `scroll-margin` / `scroll-padding` | Widely available (since 2021-07 / 2021-04) | 69 | 68 | 14.1 | yes |
| `scrollend` event | Baseline 2025, newly available 2025-12-12 | 114 | 109 | 26.2 | no |
| IntersectionObserver | Widely available (since 2019-03, widely 2021-09-25) | 58 | 55 | 12.1 | yes |
| ResizeObserver | Widely available (since 2020-07, widely 2023-01-28) | 64 | 69 | 13.1 | yes |
| Container size queries and `cq*` units | Widely available (since 2023-02-14, widely 2025-08-14) | 105 | 110 | 16 | yes |
| Container style queries (custom properties) | Baseline 2026, newly available 2026-05-19 | 111 | 151 | 18 | no |
| Container scroll-state queries | Limited availability (Chromium only) | 133 | none | none | no |
| `<picture>`, `srcset`, `sizes` | Widely available (since 2016-03 / 2017-03) | 38 | 38 | 9.1 / 10.1 | yes |
| `<img loading="lazy">` | Widely available for `<img>` (since 2022-03; umbrella with iframes widely 2026-06-19) | 77 | 75 (121 for iframes) | 15.4 | yes for `<img>`, no for `<iframe>` |
| `<img sizes="auto">` | Limited availability | 126 | 150 | 27 | no |
| Constraint Validation API | Widely available (since 2018-12, widely 2021-06-11) | 40 | 51 | 10.1 | yes |
| `:user-invalid` / `:user-valid` | Widely available (since 2023-11-02, widely 2026-05-02) | 119 | 88 | 16.5 | yes (Chrome 119 exactly) |
| `<input type="range">` | Widely available (since 2017-03, widely 2019-09-16) | 4 | 23 | 3.1 | yes |
| `appearance: none` | Widely available (since 2022-03, widely 2024-09-14) | 84 | 80 | 15.4 | yes |
| Vertical form controls via `writing-mode` | Baseline 2024, newly available 2024-04-18 | 124 | 120 | 17.4 | no |
| `::slider-thumb` / `::slider-track` / `::slider-fill` | Not shipped (no MDN page, no BCD entry) | none | none | none | no |
| `inert` | Widely available (since 2023-04-11, widely 2025-10-11) | 102 | 112 | 15.5 | yes |
| `:has()` | Widely available (since 2023-12-19, widely 2026-06-19) | 105 | 121 | 15.4 | no (Firefox 121 > 119) |
| Same-document View Transitions | Baseline 2025, newly available 2025-10-14 | 111 | 144 | 18 | no |
| Cross-document View Transitions (`@view-transition`) | Limited availability | 126 | none | 18.2 | no |
| `prefers-reduced-motion` | Widely available (since 2020-01, widely 2022-07-15) | 74 | 63 | 10.1 | yes |
| `inputmode` | Widely available (since 2021-12-07, widely 2024-06-07) | 66 | 95 | 12.1 | yes |
| Invoker Commands (`command`, `commandfor`, `CommandEvent`) | Baseline 2025, newly available 2025-12-12 | 135 | 144 | 26.2 | no |
| `CloseWatcher` | Limited availability | 126 | 149 | none | no |

Twenty-one of the ticket's line items are in the target set; the entire "new UI platform" wave (popover, anchor positioning, `@starting-style`, invoker commands, `closedby`, `::details-content`, view transitions, `scrollend`) is not. Those features can still be used as progressive enhancement behind feature detection, but every spec that leans on one must carry the fallback path.

## 1. `<dialog>`: modal, `closedby`, `requestClose()`, top layer, `::backdrop`

What it does. `<dialog>` represents a transitory dialog box. `dialog.show()` opens it non-modally in flow; `dialog.showModal()` promotes it to the top layer, makes the rest of the document inert, traps focus, and lets Esc (a "close request") fire `cancel` then `close`. A `<form method="dialog">` closes the dialog on submit and sets `returnValue`. The top layer is an ordered set rendered above everything else regardless of ancestors' `overflow`, `z-index` or transforms (https://drafts.csswg.org/css-position-4/#top-layer). `::backdrop` is the box painted under a top-layer element (https://drafts.csswg.org/css-position-4/#backdrop). `:modal` matches a dialog opened with `showModal()`. Spec: https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element.

The `closedby` attribute (https://html.spec.whatwg.org/multipage/interactive-elements.html#attr-dialog-closedby) is an enumerated attribute with `any` (close requests or clicks outside close it: "light dismiss", https://html.spec.whatwg.org/multipage/interactive-elements.html#dialog-light-dismiss), `closerequest` (Esc and platform back gestures only) and `none`. Without a valid value a modal dialog behaves as `closerequest`, a non-modal one as `none`. `dialog.requestClose(returnValue)` (https://html.spec.whatwg.org/multipage/interactive-elements.html#dom-dialog-requestclose) acts as if a close request was sent: fires `cancel`, and if not prevented, closes the dialog and fires `close`. The spec recommends never toggling the `open` attribute by hand.

Baseline. `<dialog>` element: "Baseline Widely available ... since March 2022" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog, banner notes some parts vary). `HTMLDialogElement`: same (https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement). `::backdrop`: widely available since March 2022 (https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop). `:modal`: widely available since September 2022 (https://developer.mozilla.org/en-US/docs/Web/CSS/:modal). `closedBy`: "Limited availability" (https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/closedBy). `requestClose()`: "Baseline 2025, Newly available, since May 2025" (https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/requestClose).

Minimum versions.

- Element, `showModal()`, `::backdrop`: Chromium 37, Gecko 98, WebKit 15.4 (web-features `dialog`, `backdrop`; widely available 2024-09-14).
- `closedby` / `closedBy`: Chromium 134, Gecko 141, WebKit none (Safari Technology Preview only; web-features `dialog-closedby`, BCD `html.elements.dialog.closedby`).
- `requestClose()`: Chromium 134, Gecko 139, WebKit 18.4 (web-features `requestclose`, newly available 2025-05-27).

Meets 2026-05-07 target. The element, modal mode, top layer, `::backdrop` and `:modal`: yes. `closedby`: no. `requestClose()`: no.

Known gaps.

- `closedby="any"` light dismiss has no WebKit release as of 2026-09-25; a click-outside-to-close behaviour needs a pointerdown listener on the backdrop as fallback.
- Without `requestClose()`, a close button must call `close()` directly and cannot share the `cancel` veto path with Esc.
- Open/close animation needs `@starting-style`, `transition-behavior: allow-discrete` and `overlay` (sections 6 and 7), none of which meet the target. Animating a dialog for the target set means toggling classes and waiting for `transitionend` before `close()`.
- `tabindex` must not be set on `<dialog>` (spec). Initial focus goes to the first focusable descendant or the dialog itself; the spec's focusing steps changed over time, so specs should set `autofocus` explicitly.

Foundation plugins it could serve. Reveal (modal and non-modal, `data-close-on-esc` = `closerequest`, `data-close-on-click` = `closedby="any"`, `data-overlay` = `::backdrop`, `data-multiple-opened` = nested `showModal()`), OffCanvas in overlay mode (`showModal()` plus `::backdrop` gives the dimmed page and Esc handling for free), Tooltip and Dropdown do not fit (they are popovers, not dialogs).

## 2. The `popover` attribute: `auto`, `manual`, `hint`, `popovertarget`, light dismiss, top layer

What it does. Any HTML element with `popover` is hidden until shown, then rendered in the top layer (https://html.spec.whatwg.org/multipage/popover.html#the-popover-attribute). States: `auto` (default; light dismiss on outside click and on close requests such as Esc; showing one auto popover hides other auto popovers that are not its ancestors), `manual` (never light-dismissed; several can be open), and `hint` (subordinate to auto popovers: showing a hint does not close an open auto popover but closes other unrelated hints; light-dismissable). Popover light dismiss is specified at https://html.spec.whatwg.org/multipage/popover.html#popover-light-dismiss. Buttons and `<input type="button">` get `popovertarget="<id>"` and `popovertargetaction="toggle|show|hide"` (https://html.spec.whatwg.org/multipage/popover.html#the-popover-target-attributes); the invoker gets `aria-expanded` and the popover becomes an ancestor for nesting and light-dismiss purposes. JS: `showPopover()`, `hidePopover()`, `togglePopover(force)`, `HTMLElement.popover`, `beforetoggle` (cancelable, fires before show) and `toggle` events carrying `ToggleEvent.oldState`/`newState`; CSS: `:popover-open`, `::backdrop`. A popover invoked through `popovertarget` gets an implicit anchor reference for CSS anchor positioning (see section 3).

Baseline. `popover` attribute: "Baseline 2024, Newly available, since April 2024; some parts of this feature may have varying levels of support" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover). Popover API landing page: "Baseline 2025, Newly available, since January 2025" (https://developer.mozilla.org/en-US/docs/Web/API/Popover_API); web-features `popover` low date 2025-01-27 because Safari on iOS reached full support only in 18.3. `:popover-open`: Baseline 2024, since April 2024 (https://developer.mozilla.org/en-US/docs/Web/CSS/:popover-open). `beforetoggle`: Baseline 2024, since April 2024 (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforetoggle_event). `hidePopover()`: Baseline 2024, since April 2024 (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/hidePopover). `popoverTargetElement`: Baseline 2024, since April 2024 (https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/popoverTargetElement). `HTMLElement.popover`: Baseline 2025, since January 2025 (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/popover). `hint`: not Baseline (web-features `popover-hint`, `baseline: false`; the attribute page describes it without a separate banner).

Minimum versions.

- `popover` (auto, manual), `popovertarget`, `:popover-open`, `beforetoggle`, `toggle`, `showPopover()`, `hidePopover()`, `togglePopover()`: Chromium 114, Gecko 125, WebKit 17 (Safari for iOS 18.3 for the API as web-features tracks it) (BCD `html.global_attributes.popover`, `html.elements.button.popovertarget`, `api.HTMLElement.showPopover`; web-features `popover`).
- `popover="hint"`: Chromium 151, Gecko 153, WebKit none (BCD `html.global_attributes.popover.hint`).
- `showPopover({ source })` / `togglePopover({ source })` (programmatic invoker for nesting and implicit anchor): Chromium 137, Gecko 144, WebKit 26 (BCD `api.HTMLElement.showPopover.options_source_parameter`).
- `ToggleEvent.source`: Chromium 140, Gecko 145, WebKit 26.5 (web-features `toggleevent-source`, newly available 2026-05-11).

Meets 2026-05-07 target. No. Firefox 119 predates popover support (Gecko 125), and the target's Safari 17 has it on macOS but iOS parity arrived later. Popover becomes widely available in late 2026 (2026-10 from the attribute's April 2024 date; 2027-07 from the API page's January 2025 date).

Known gaps.

- `hint` has no WebKit release; a tooltip built on `popover="hint"` would light-dismiss an open `auto` dropdown in Safari. Fallback for tooltips: `popover="manual"` plus explicit hover/focus handling, or `auto` and accept that opening a tooltip closes an open menu.
- Popovers are `display: none` until shown; entry animation requires `@starting-style` and exit animation requires `transition-behavior: allow-discrete` on `display` plus `overlay` to stay in the top layer while fading. None of these meet the target (sections 6 and 7).
- A popover in the top layer escapes any `overflow: hidden` or `transform` ancestor, which removes Foundation's `Box.ImNotTouchingYou` overflow checks; but it also means Foundation's `.dropdown-pane` CSS (`position: absolute` relative to the anchor's offset parent) does not apply. Positioning in the top layer needs CSS anchor positioning (section 3) or measured `position: fixed` coordinates.
- Nesting: a popover counts as another popover's child only when its invoker (`popovertarget`, or `source`) lives inside the parent, or it is a DOM descendant. Menus built from nested `auto` popovers get correct stack behaviour only via those relationships.

Foundation plugins it could serve. Dropdown (`data-hover`, `data-close-on-click` map to `auto` vs `manual`; `popovertarget` replaces `data-toggle` and `data-open`), DropdownMenu (nested auto popovers for submenus; hover-open needs script), Tooltip (`hint` is the intended state; `manual` until WebKit ships `hint`), OffCanvas (a `manual` popover in the top layer for overlay mode without a backdrop; push/reveal modes do not fit the top layer), Toggler (a `manual` popover is a class-free show/hide, but Toggler targets in-flow content, so a plain `hidden` toggle fits better), Reveal (a `<dialog>` is the better fit; a popover cannot be modal).

## 3. CSS anchor positioning: `anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`

What it does. Anchor positioning (https://drafts.csswg.org/css-anchor-position-1/, W3C Working Draft 2026-09-06) tethers an absolutely or fixed positioned box to another box. `anchor-name: --name` on the anchor; `position-anchor: --name` on the positioned element (initial value `normal`, which uses the implicit anchor when there is one); `position-area: <keywords>` places the box in one of the nine cells of the grid formed by the anchor and its containing block (`block-start`, `inline-end span-all`, `top center`, and so on); `anchor(--name top)` and `anchor-size(--name width)` give explicit lengths; `position-try-fallbacks: flip-block, flip-inline, --custom` lists alternative placements tried when the first overflows; `@position-try --custom { ... }` defines a named alternative; `position-try-order` picks the largest; `position-visibility: anchors-visible | no-overflow` hides the box when the anchor scrolls out. A popover shown through `popovertarget`, `commandfor` or `showPopover({ source })` gets that invoker as its implicit anchor, so `position-anchor` can be omitted (spec example in the introduction).

Baseline. `anchor-name`: "Baseline 2026, Newly available, since January 2026" (https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name). `position-area`: Baseline 2026, since January 2026 (https://developer.mozilla.org/en-US/docs/Web/CSS/position-area). `position-try-fallbacks`: Baseline 2026, since January 2026 (https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks). `@position-try`: Baseline 2026, since January 2026 (https://developer.mozilla.org/en-US/docs/Web/CSS/@position-try). `anchor()`: Baseline 2026, since January 2026 (https://developer.mozilla.org/en-US/docs/Web/CSS/anchor). `anchor-size()`: Baseline 2026, since January 2026 (https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-size). `position-visibility`: Baseline 2026, since January 2026 (https://developer.mozilla.org/en-US/docs/Web/CSS/position-visibility). `position-anchor`: "Baseline 2026, Newly available, since September 2026" (https://developer.mozilla.org/en-US/docs/Web/CSS/position-anchor). The web-features umbrella `anchor-positioning` still reports `baseline: false` only because the `anchors-valid` and `anchors-visible` values of `position-visibility` ship in Safari 27 alone; every other one of its 325 compat keys is Baseline 2026.

Minimum versions.

- `anchor-name`, `position-area`, `position-try-fallbacks`, `anchor()`, `anchor-size()`, `@position-try`: Chromium 125 (`position-area` 129, `position-try-fallbacks` 128), Gecko 147, WebKit 26 (BCD `css.properties.anchor-name`, `position-area`, `position-try-fallbacks`; newly available 2026-01-13).
- `position-anchor` with the spec's `normal` initial value: Chromium 151, Gecko 151, WebKit 27. Earlier engines shipped the property with a different initial value (`implicit` in Chrome 125, `auto` in Chrome 127-143 / Firefox 147-150 / Safari 26, `none` in Chrome 144-150), which BCD records as partial implementations; explicit `position-anchor: --name` works from Chromium 125 / Gecko 147 / WebKit 26.

Meets 2026-05-07 target. No. Nothing in the module reaches Chrome 119, Firefox 119 or Safari 17.

Known gaps.

- The initial-value churn on `position-anchor` (`implicit` -> `auto` -> `none` -> `normal`) means styles must set `position-anchor` explicitly instead of relying on the implicit anchor in engines before Chromium 151 / Gecko 151 / WebKit 27.
- Chromium bug 388575663: `position-area` moves absolutely positioned elements that have no anchor (BCD note on `css.properties.position-area`).
- `position-visibility: anchors-valid` / `anchors-visible` are WebKit 27 only.
- Fallback for the target set: `@supports (anchor-name: --a)` gate plus a JS positioner (CDK Overlay `FlexibleConnectedPositionStrategy`, or a small measured `position: fixed` implementation) for older browsers. The Foundation `Positionable` formula table (research/foundation-inventory-positioned.md) maps onto `position-area` keywords plus `position-try-fallbacks: flip-block, flip-inline` when the feature is available.
- The anchored element must be `position: absolute` or `fixed`; Foundation's `.dropdown-pane` already is (`position: absolute`), `.tooltip` too, so Foundation CSS and anchor positioning coexist.

Foundation plugins it could serve. Dropdown (`data-position`, `data-alignment`, `data-v-offset`, `data-h-offset`, `data-auto-focus`), DropdownMenu (submenu placement, `data-alignment`), Tooltip (`data-position`, `data-alignment`, `data-tooltip-class`), Slider (the value handle badge could anchor to the thumb only if the thumb were an element; it is a pseudo-element, so no).

## 4. `<details>` and `<summary>`, the `name` attribute, `::details-content`

What it does. `<details>` is a disclosure widget: `<summary>` is always shown and toggles the `open` attribute; the rest is hidden until open (https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element). It fires a coalesced `toggle` event after each state change. `name="group"` puts several `<details>` in an exclusive group ("details name group", https://html.spec.whatwg.org/multipage/interactive-elements.html#attr-details-name): opening one closes the others; the document must not contain two open members, nested members in the same group, and the spec asks authors to keep a group inside one containing element with a heading. `::details-content` (https://drafts.csswg.org/css-pseudo-4/#details-content-pseudo) selects the expandable part, which lets CSS animate its `height`, `opacity` or `content-visibility` on open and close. `hidden="until-found"` and find-in-page auto-open details in Chromium (`search_match_opens` in BCD; not graded here).

Baseline. `<details>`: "Baseline Widely available ... since January 2020" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details; banner notes some parts vary, which is the `name` attribute). `toggle` event: widely available since January 2020 (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event). `name`: web-features `details-name` is Baseline low, newly available 2024-09-03 (MDN keeps it inside the element page). `::details-content`: "Baseline 2025, Newly available, since September 2025" (https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content).

Minimum versions.

- `<details>`, `<summary>`, `toggle`: Chromium 12, Gecko 49, WebKit 6 (widely available 2022-07-15).
- `name`: Chromium 120, Gecko 130, WebKit 17.2 (BCD `html.elements.details.name`).
- `::details-content`: Chromium 131, Gecko 143, WebKit 18.4 (BCD `css.selectors.details-content`; Safari cannot chain further pseudo-elements after it, WebKit bug 283446).

Meets 2026-05-07 target. `<details>` / `<summary>` / `toggle`: yes. `name`: no, by one Chrome version (120 vs 119) and by Firefox 130 and Safari 17.2. `::details-content`: no.

Known gaps.

- Exclusive accordions on the target set need a `toggle` listener that closes siblings; that is a few lines, and it degrades gracefully where `name` works natively (both mechanisms agree).
- Animating open/close height on the target set: without `::details-content` there is no selector for the content box, so the content must be wrapped in an element the directive can size; without `interpolate-size` (section 5) `height: auto` cannot transition anyway, so the directive measures `scrollHeight` or uses CSS `grid-template-rows: 0fr -> 1fr` on the wrapper (grid `fr` interpolation is widely available; not in the ticket list).
- `<summary>` carries `role=button`-like semantics natively but Foundation's `.accordion-title` is styled as an `<a>`; the Sass must be applied to `<summary>` instead. Foundation's `aria-controls` / `aria-expanded` pairs are implicit in `<details>` (the summary exposes expanded state).
- ARIA APG accordion pattern expects `button` inside a heading; `<summary>` in `<h3>` is not valid HTML (summary must be the first child of details), so the heading level is expressed with `aria-level` or by placing the `<h3>` inside the summary, which browsers expose inconsistently. Specs should check the AccessibleName exposure with axe.
- Nested `<details>` for AccordionMenu are allowed only when nested items do not share the parent's `name` group.

Foundation plugins it could serve. Accordion (`data-multi-expand` false = `name` group, true = independent details; `data-allow-all-closed` true is the native default and false needs a `toggle` guard), AccordionMenu (nested details with `data-multi-open`), ResponsiveAccordionTabs in its accordion form, Drilldown does not fit (it replaces the whole panel rather than expanding in place), Toggler (a single details is a disclosure toggle when the content sits below the trigger).

## 5. `interpolate-size` and `calc-size()` for height animations

What it does. `interpolate-size: allow-keywords` (https://drafts.csswg.org/css-values-5/#interpolate-size) opts an element (inherited) into interpolating between a length and an intrinsic sizing keyword such as `auto`, `fit-content` or `max-content`, so `height: 0 -> height: auto` transitions work. `calc-size(auto, size * 0.5)` (https://drafts.csswg.org/css-values-5/#calc-size) does math on intrinsic sizes.

Baseline. `interpolate-size`: "Limited availability ... Experimental" (https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size). `calc-size()`: "Limited availability" (https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size).

Minimum versions. Chromium 129; Gecko none; WebKit none (BCD `css.properties.interpolate-size`, `css.types.calc-size`, both flagged experimental).

Meets 2026-05-07 target. No, and no Baseline date is in sight.

Known gaps. Chromium-only as of 2026-09-25. Fallbacks that do meet the target: `grid-template-rows: 0fr` to `1fr` on a wrapper with `overflow: hidden` on the child; `max-height` to a measured value; or the Web Animations API with a measured `scrollHeight`. Motion UI's slide classes already animate fixed transforms, not height.

Foundation plugins it could serve. Accordion, AccordionMenu, Drilldown (panel height), ResponsiveAccordionTabs, Toggler with `data-animate` slide effects. All need the fallback.

## 6. `@starting-style`, `transition-behavior: allow-discrete`, and `overlay`

What it does. `@starting-style { ... }` (https://drafts.csswg.org/css-transitions-2/#defining-before-change-style) supplies the "before-change" style for an element that has just been rendered (first paint, or `display: none -> block`, or entering the top layer), so a transition can run on entry. `transition-behavior: allow-discrete` (https://drafts.csswg.org/css-transitions-2/#transition-behavior-property) lets discrete properties (`display`, `content-visibility`, `overlay`) take part in a transition; `display: none` is then applied at the end instead of at the 50 percent mark, so exit animations can run before the element disappears. `overlay: auto | none` (https://drafts.csswg.org/css-position-4/#overlay) is a user-agent-controlled property that says whether an element is in the top layer; transitioning it with `allow-discrete` keeps a popover or dialog in the top layer until its exit transition ends. Authors cannot set `overlay`, only transition it.

Baseline. `@starting-style`: "Baseline 2024, Newly available, since August 2024" (https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style). `transition-behavior`: "Baseline 2024, Newly available, since August 2024; some parts vary" (https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior). `overlay`: "Limited availability" (https://developer.mozilla.org/en-US/docs/Web/CSS/overlay).

Minimum versions.

- `@starting-style`: Chromium 117, Gecko 129, WebKit 17.5 (widely available due 2027-02-06).
- `transition-behavior`: Chromium 117, Gecko 129, WebKit 17.4.
- `overlay`: Chromium 117, Gecko none, WebKit none (experimental).

Meets 2026-05-07 target. No for all three (Firefox 129 and Safari 17.4/17.5 are past the target; `overlay` is Chromium-only).

Known gaps.

- Without `overlay`, a top-layer element (dialog, popover) leaves the top layer at the moment `display: none` applies; in Firefox and Safari the exit fade of a popover is therefore cut short unless the directive delays `hidePopover()` / `close()` until `transitionend`.
- Without `@starting-style`, entry animations need the classic two-frame dance (apply the start class, force a reflow or `requestAnimationFrame`, then apply the end class), which is what Foundation's Motion UI `animateIn` already does.
- `transition-behavior` on `display` is the part that "varies" in MDN's banner; check `transitionable_display` in BCD before relying on it in Safari 17.4.

Foundation plugins it could serve. Reveal (`data-animation-in`, `data-animation-out`), Dropdown, DropdownMenu, Tooltip (fade), OffCanvas (`data-transition`), Toggler (`data-animate`), Orbit (`data-anim-in-from-right`, `data-anim-out-to-right`, `data-anim-in-from-left`, `data-anim-out-to-left`), Accordion (Motion UI slide). Every animated open/close in the library. For the target set the Motion UI class toggle path stays; `@starting-style` is a progressive enhancement.

## 7. Scroll-driven animations

What it does. `animation-timeline: scroll(<scroller> <axis>)` or `view(<axis> <inset>)` (https://drafts.csswg.org/scroll-animations-1/#scroll-timelines, #view-timelines) drives a CSS animation by the scroll progress of a scroll container or by an element's progress through the scrollport, instead of by time. `scroll-timeline-name` / `view-timeline-name` create named timelines; `animation-range: entry 0% cover 50%` selects the part of the timeline. The JS side is `ScrollTimeline` and `ViewTimeline` for the Web Animations API.

Baseline. `animation-timeline`: "Limited availability" (https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline). Same for `scroll-timeline`, `view-timeline` and `animation-range` (https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline, /view-timeline, /animation-range). Module page has no banner (https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations).

Minimum versions. Chromium 115; Gecko none in release (Firefox Nightly behind a flag, BCD "preview"); WebKit 26 (web-features `scroll-driven-animations`, `baseline: false`).

Meets 2026-05-07 target. No.

Known gaps. Firefox has not shipped as of 2026-09-25, so anything built on scroll timelines needs an IntersectionObserver or scroll-listener fallback. The scroll-driven progress could drive Magellan's active-link highlight or Orbit's bullets, but IntersectionObserver (section 10) already covers those on the target set.

Foundation plugins it could serve. Magellan (progress-based highlighting), Sticky (shrink-on-scroll headers), Orbit (parallax between slides). None require it.

## 8. `position: sticky`

What it does. A sticky box stays in normal flow until its scroll container reaches the inset threshold (`top: 0`), then is pinned inside its containing block; it unsticks when the containing block scrolls past (https://drafts.csswg.org/css-position-3/#stickypos-insets). Works in nested scroll containers, needs no script, and honours `scroll-padding`.

Baseline. `position`: "Baseline Widely available ... since July 2015" (https://developer.mozilla.org/en-US/docs/Web/CSS/position); web-features `sticky-positioning`: newly available 2019-09-19, widely available 2022-03-19.

Minimum versions. Chromium 56, Gecko 32 (59 for table parts), WebKit 13 (BCD `css.properties.position.sticky`).

Meets 2026-05-07 target. Yes.

Known gaps.

- No native "is stuck" state: styling a stuck header (Foundation's `.is-stuck`, `.is-at-top`, `.is-at-bottom` classes) needs an IntersectionObserver sentinel or the Chromium-only `@container scroll-state(stuck: top)` query (section 11).
- A sticky element is confined to its containing block; Foundation's `data-anchor` / `data-top-anchor` / `data-btm-anchor` semantics (stick between two arbitrary elements' offsets) only map when those anchors bound the same containing block. Otherwise a script computes the range.
- `overflow: hidden|auto` on any ancestor between the sticky element and the viewport creates a new scroll container and breaks the expected stickiness; Foundation's `.off-canvas-wrapper` uses `overflow: hidden`, which is a known clash.
- Sticky boxes do not change document flow, so Foundation's placeholder-height technique (`.sticky-container` sizing) is unnecessary.

Foundation plugins it could serve. Sticky (the whole plugin, except the anchor range and the state classes), Magellan (sticky navigation), Reveal and OffCanvas no.

## 9. Scroll snap, `scrollIntoView()`, `scroll-behavior`, `scroll-margin`, `scrollend`

What it does.

- Scroll snap (https://drafts.csswg.org/css-scroll-snap-1/): `scroll-snap-type: x mandatory` on the container, `scroll-snap-align: start|center` on children, `scroll-snap-stop: always`, `scroll-padding` on the container and `scroll-margin` on children to offset snap positions; the browser snaps after user scrolling and after programmatic scrolls.
- `element.scrollIntoView({ behavior, block, inline })` (https://drafts.csswg.org/cssom-view-1/#dom-element-scrollintoview) scrolls every ancestor scroll container so the element is visible; `scroll-margin` on the target offsets the final position (for example under a sticky header).
- `scroll-behavior: smooth` (https://drafts.csswg.org/css-overflow-3/#smooth-scrolling) makes navigation-triggered and programmatic scrolls animate; user agents honour `prefers-reduced-motion` by default in some engines but the stylesheet should gate it itself.
- `scrollend` (https://drafts.csswg.org/cssom-view-1/#eventdef-document-scrollend) fires once scrolling (user or programmatic, including smooth) has settled; it does not fire when nothing moved.

Baseline. `scroll-snap-type`: "Baseline Widely available ... since April 2022" (https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type). `scroll-snap-align`: widely available since January 2020 (https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-align). `scroll-padding`: widely available since April 2021 (https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding). `scroll-margin`: widely available since July 2021 (https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin). `scrollIntoView()`: widely available since January 2020, some parts vary (https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView). `scroll-behavior`: widely available since March 2022 (https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior). `scrollend`: "Baseline 2025, Newly available, since December 2025" (https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event). `scroll` event: widely available since July 2015 (https://developer.mozilla.org/en-US/docs/Web/API/Element/scroll_event).

Minimum versions.

- `scroll-snap-type` / `scroll-snap-align`: Chromium 69, Gecko 99 (68 on Android), WebKit 11 (BCD `css.properties.scroll-snap-type`; web-features `scroll-snap` widely available 2022-07-15).
- `scrollIntoView()` with `behavior: smooth`: Chromium 61, Gecko 36, WebKit 15.4.
- `scroll-behavior`: Chromium 61, Gecko 36, WebKit 15.4 (widely available 2024-09-14).
- `scroll-margin` / `scroll-padding`: Chromium 69, Gecko 68, WebKit 14.1.
- `scrollend`: Chromium 114, Gecko 109, WebKit 26.2 (web-features `scrollend`, newly available 2025-12-12).
- Scroll snap events `snapchanging` / `snapchanged`: Chromium 129 only (web-features `scroll-snap-events`, not Baseline).

Meets 2026-05-07 target. Scroll snap, `scrollIntoView()`, `scroll-behavior`, `scroll-margin`, `scroll-padding`: yes. `scrollend`: no (Safari 26.2). Snap events: no.

Known gaps.

- Without `scrollend` on the target set, detecting "the carousel settled on slide N" needs a debounced `scroll` listener or an IntersectionObserver with `threshold: 0.5` per slide; the latter is the more robust option and meets the target.
- `scrollIntoView()` on a horizontal snap container also scrolls the page vertically when the container is partly off-screen; pass `block: 'nearest'` or use `container.scrollTo({ left })`.
- Programmatic `scrollTo` inside a `scroll-snap-type: mandatory` container snaps to the nearest position after the scroll, which is desired for Orbit but can fight a "scroll to arbitrary offset" use.
- `scroll-behavior: smooth` on `html` changes `window.scrollTo` and anchor navigation globally; apply it to the specific container, and wrap in `@media (prefers-reduced-motion: no-preference)`.

Foundation plugins it could serve. Orbit (snap container replaces slide translation, `scrollIntoView` for bullets and arrows, IntersectionObserver for active slide, `prefers-reduced-motion` for autoplay), SmoothScroll (`scroll-behavior` plus `scrollIntoView` and `scroll-margin` replace `data-offset`, `data-animation-duration` and `data-animation-easing`), Magellan (`scrollIntoView` for link clicks, `scroll-margin` for `data-offset`; Magellan has no `barOffset` option, only `offset`), Tabs and Drilldown no.

## 10. IntersectionObserver and ResizeObserver

What it does. `IntersectionObserver` (https://w3c.github.io/IntersectionObserver/) reports asynchronously when a target crosses a visibility threshold relative to a root (viewport or scroll container) with `rootMargin` and `threshold` options. `ResizeObserver` (https://drafts.csswg.org/resize-observer-1/) reports content-box, border-box or device-pixel-content-box size changes of observed elements after layout, without polling or window `resize` events.

Baseline. Intersection Observer API: "Baseline Widely available ... since March 2019; some parts vary" (https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API, https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver). ResizeObserver: "Baseline Widely available ... since July 2020" (https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).

Minimum versions. IntersectionObserver: Chromium 58, Gecko 55, WebKit 12.1 (widely available 2021-09-25). ResizeObserver: Chromium 64, Gecko 69, WebKit 13.1 (widely available 2023-01-28). IntersectionObserver v2 `trackVisibility` / `isVisible`: Chromium 74 only (web-features `intersection-observer-v2`, not Baseline). The `scrollMargin` option is the "varying" part MDN mentions; not graded.

Meets 2026-05-07 target. Yes for both (v1 API).

Known gaps.

- IntersectionObserver reports intersection ratios, not scroll direction; Magellan's "which section is active" rule (the one whose top passed the offset) needs `rootMargin` tuned like `-<offset>px 0px -<100 - offset>% 0px` and a tie-break on `boundingClientRect.top`.
- ResizeObserver fires after layout of the same frame; writing sizes back inside the callback can trigger "ResizeObserver loop completed with undelivered notifications" in dev consoles, so batch writes in `requestAnimationFrame` or use `contentBoxSize` with equalizer heights applied via a CSS variable.
- Both are unavailable during SSR; directives must observe in `afterNextRender`.

Foundation plugins it could serve. Magellan (active section), Sticky (stuck state via sentinel, container bounds), Equalizer (`ResizeObserver` replaces the `resizeme.zf.trigger` listener; CSS flex `align-items: stretch` or grid removes most of the need), Orbit (active slide), Interchange (`ResizeObserver` is not needed; container queries serve it), Tooltip and Dropdown (reposition on size change when anchor positioning is unavailable), Tabs (`data-match-height`, again better served by CSS grid).

## 11. Container queries and container units

What it does. `container-type: inline-size | size` on an element makes it a query container; `@container (min-width: 40em) { ... }` (https://drafts.csswg.org/css-conditional-5/#container-queries) styles descendants by the container's size; `container-name` scopes queries; `cqw`, `cqh`, `cqi`, `cqb`, `cqmin`, `cqmax` are lengths relative to the nearest query container (https://drafts.csswg.org/css-contain-3/, https://developer.mozilla.org/en-US/docs/Web/CSS/length#container_query_length_units). Style queries `@container style(--variant: compact)` test custom property values. Scroll-state queries `@container scroll-state(stuck: top)` / `snapped` / `scrollable` expose sticky, snap and overflow state to CSS.

Baseline. `@container`: "Baseline Widely available ... since February 2023; some parts vary" (https://developer.mozilla.org/en-US/docs/Web/CSS/@container). `<length>` (cq units within it): widely available banner on the type page (https://developer.mozilla.org/en-US/docs/Web/CSS/length). Guide pages carry no banner. web-features: `container-queries` widely available 2025-08-14; `container-style-queries` newly available 2026-05-19; `container-scroll-state-queries` not Baseline.

Minimum versions.

- Size queries and `cq*` units: Chromium 105, Gecko 110, WebKit 16 (BCD `css.at-rules.container`, `css.types.length.container_query_length_units`).
- Style queries for custom properties: Chromium 111, Gecko 151, WebKit 18 (the root element cannot be a container in WebKit, bug 271040).
- Scroll-state queries: Chromium 133; Gecko none; WebKit none.

Meets 2026-05-07 target. Size queries and units: yes. Style queries: no. Scroll-state queries: no.

Known gaps.

- `container-type: inline-size` applies size containment on the inline axis, so the container can no longer size itself from its children in that axis; wrap the queried content in an extra element rather than making Foundation's grid cell the container.
- Foundation's breakpoints (`small`, `medium`, `large`, `xlarge`, `xxlarge` from `$breakpoints`) are viewport media queries; the JS `MediaQuery` utility mirrors them with `matchMedia`. Container queries are a different axis and do not replace `MediaQuery` for plugins whose behaviour is documented per viewport breakpoint (ResponsiveMenu, ResponsiveToggle, ResponsiveAccordionTabs, Interchange with `data-interchange` rules that use Foundation breakpoint names). `matchMedia` and `MediaQueryList.change` are widely available (not in the ticket list) and are the direct replacement there.
- Container queries change styles only; switching a component's behaviour (accordion versus tabs) still needs script to read the state (a `ResizeObserver` on the container, or `getComputedStyle` of a sentinel custom property set inside the `@container` block).

Foundation plugins it could serve. ResponsiveMenu and ResponsiveAccordionTabs (component-level breakpoints instead of viewport ones, where the spec chooses that), Equalizer (`data-equalize-on` breakpoint gates), Interchange for non-image content, Sticky (`data-sticky-on`), Tabs (`data-match-height`), Orbit (per-container sizing with `cqw`).

## 12. `<picture>`, `srcset`, `sizes`, and `loading="lazy"`

What it does. `<img srcset="a.jpg 400w, b.jpg 800w" sizes="(min-width: 40em) 50vw, 100vw">` lets the browser pick a candidate by layout width and device pixel ratio (https://html.spec.whatwg.org/multipage/embedded-content.html#attr-img-srcset, https://html.spec.whatwg.org/multipage/images.html#sizes-attribute). `<picture><source media="..." srcset="..." type="..."><img></picture>` adds art direction and format negotiation (https://html.spec.whatwg.org/multipage/embedded-content.html#the-picture-element). `loading="lazy"` on `<img>` and `<iframe>` defers the fetch until the element nears the viewport, using a user-agent IntersectionObserver (https://html.spec.whatwg.org/multipage/urls-and-fetching.html#lazy-loading-attributes); it is only honoured with scripting enabled. `sizes="auto"` on a lazy image uses the laid-out width as the source size.

Baseline. `<picture>`: "Baseline Widely available ... since March 2016" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture). `<img>`: widely available since July 2015, some parts vary (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img; `loading` and `sizes="auto"` are documented there, the `Attributes/loading` URL is a 404). web-features: `srcset` widely available 2019-09-27; `loading-lazy` (images and iframes) newly available 2023-12-19, widely available 2026-06-19; `sizes-auto` not Baseline.

Minimum versions.

- `<picture>`: Chromium 38, Gecko 38, WebKit 9.1. `srcset` / `sizes`: Chromium 38, Gecko 38, WebKit 10.1.
- `<img loading="lazy">`: Chromium 77, Gecko 75, WebKit 15.4 (BCD `html.elements.img.loading`). The web-features umbrella waits for `<iframe loading="lazy">` in Gecko 121.
- `sizes="auto"`: Chromium 126, Gecko 150, WebKit 27 (BCD `html.elements.img.sizes.auto`).

Meets 2026-05-07 target. `<picture>`, `srcset`, `sizes`, `<img loading="lazy">`: yes. `<iframe loading="lazy">`: no (Firefox 121). `sizes="auto"`: no.

Known gaps.

- `srcset` selects by width and DPR, never by named breakpoint. Foundation Interchange rules (`[image.jpg, small], [image-large.jpg, large]`) map to `<picture><source media="(min-width: 64em)">` using the same media queries Foundation's Sass emits for `large`; the mapping is mechanical but the media query strings must match `$breakpoints` exactly.
- Interchange's HTML-partial mode (`[partial.html, medium]`) has no platform equivalent; that is an Angular `@defer` or `NgComponentOutlet` concern, not a platform one.
- Angular's `NgOptimizedImage` already emits `srcset`, `sizes` and `loading="lazy"`; the spec for Interchange should decide whether to wrap it or leave images to it.

Foundation plugins it could serve. Interchange (images: the platform covers it outright), Orbit (lazy slides), Reveal (`data-deep-link` content no).

## 13. Constraint Validation API and `:user-invalid`

What it does. Form controls with `required`, `pattern`, `min`, `max`, `step`, `minlength`, `maxlength`, `type=email|url|number` carry validity states (`validity.valueMissing`, `patternMismatch`, `tooLong`, `rangeUnderflow`, `customError`, `valid`) (https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api). `checkValidity()` fires `invalid` events; `reportValidity()` also shows the browser's bubble; `setCustomValidity(message)` adds an author error; `validationMessage` is the localised text; `novalidate` on the form and `formnovalidate` on a button skip interactive validation on submit. `:invalid` matches immediately; `:user-invalid` / `:user-valid` (https://drafts.csswg.org/selectors-4/#user-pseudos) match only after the user has interacted with the control (typed and blurred, or attempted submit), which is the timing form libraries want.

Baseline. Constraint validation: web-features `constraint-validation` widely available 2021-06-11 (the MDN page at /Web/API/Constraint_validation redirects to the Learn guide, which has no banner). `setCustomValidity()`: "Baseline Widely available ... since July 2015" (https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setCustomValidity). `:invalid`: widely available since July 2015 (https://developer.mozilla.org/en-US/docs/Web/CSS/:invalid). `:user-invalid`: "Baseline Widely available ... since November 2023" (https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid); web-features `user-pseudos` low 2023-11-02, high 2026-05-02. Note that web.dev/baseline's copy says the Constraint Validation API became newly available in March 2023 and `:user-valid`/`:user-invalid` in October 2023; the dataset dates above are the ones MDN renders.

Minimum versions. Constraint Validation API: Chromium 40, Gecko 51, WebKit 10.1. `:user-invalid`: Chromium 119, Gecko 88, WebKit 16.5 (BCD `css.selectors.user-invalid`).

Meets 2026-05-07 target. Constraint Validation API: yes. `:user-invalid`: yes, on the last possible version (Chrome 119) and five days before the target date (widely available 2026-05-02).

Known gaps.

- The browser's `reportValidity()` bubble is not styleable and is announced inconsistently by screen readers; Foundation Abide renders its own `.form-error` element with `aria-describedby`. The platform supplies the validity state; the directive still renders Foundation's error markup (`.is-invalid-input`, `.is-invalid-label`, `.form-error.is-visible`) from it.
- `:user-invalid` timing differs slightly per engine (Chromium requires a change and blur; Gecko historically matched on the first keystroke). Specs that use it purely for styling are fine; state for `aria-invalid` should come from the directive.
- Abide's `data-live-validate`, `data-validate-on-blur`, equal-to and custom validators map onto `setCustomValidity()` plus `input`/`blur` listeners; Angular Signal Forms (research/angular-22-api-survey.md) is the framework-level replacement, and it can read `validity` from native controls.
- `pattern` uses the `v` flag (Unicode sets) since Chromium 112 / Gecko 116 / WebKit 17; Abide's regex patterns (`alpha`, `email`, `url`, `number`, `card`, `cvv`, `color`, ...) were written for JS `RegExp` and some may need escaping changes under the `v` flag.

Foundation plugins it could serve. Abide only.

## 14. `<input type="range">`: styling limits and multi-thumb

What it does. A slider for an inexact numeric value between `min` and `max` in `step` increments (https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range)). `list="<datalist id>"` renders tick marks. It fires `input` during drag and `change` on release, supports keyboard (arrows, Home, End, Page Up/Down), exposes `role=slider` with `aria-valuenow` natively, and is form-associated. Styling: `appearance: none` then the vendor pseudo-elements `::-webkit-slider-thumb`, `::-webkit-slider-runnable-track`, `::-moz-range-thumb`, `::-moz-range-track`, `::-moz-range-progress`; the standard `::slider-thumb`, `::slider-track` and `::slider-fill` pseudo-elements are in CSS Forms 1 (https://drafts.csswg.org/css-forms-1/#slider-pseudos). Vertical orientation: `writing-mode: vertical-lr` (standard) or the non-standard `orient="vertical"` in Gecko.

Baseline. `<input type="range">`: "Baseline Widely available ... since March 2017; some parts vary" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range). `appearance`: widely available since March 2022 (https://developer.mozilla.org/en-US/docs/Web/CSS/appearance). `::slider-thumb`: the MDN URL returns "Page not found" and BCD has no `css.selectors.slider-thumb` key as of 2026-09-25, so it is unshipped. Vertical form controls: web-features `vertical-form-controls` newly available 2024-04-18.

Minimum versions. `type=range`: Chromium 4, Gecko 23, WebKit 3.1. `appearance: none`: Chromium 84, Gecko 80, WebKit 15.4. Vertical via `writing-mode`: Chromium 124, Gecko 120, WebKit 17.4. `::slider-*`: none.

Meets 2026-05-07 target. `type=range` and `appearance: none`: yes. Vertical via `writing-mode`: no (Chrome 124, Firefox 120, Safari 17.4). Standard slider pseudo-elements: no.

Known gaps.

- No multi-thumb: the `multiple` attribute does not apply to range ("the following input attributes do not apply to the input range: ... `multiple`", MDN; the spec's attribute table lists `multiple` for email and file only). Foundation Slider's `doubleSided` (`data-double-sided`; two handles, `.slider-handle` x2, one fill) needs two overlapping `<input type="range">` elements with `pointer-events` juggling, or a custom ARIA slider. `@angular/aria` has no slider (see research/angular-aria-inventory.md); Angular Material's `MatSlider` implements range mode with two native inputs, which is the reference design.
- The fill (Foundation `.slider-fill`) is a pseudo-element only in Gecko (`::-moz-range-progress`); Chromium and WebKit need a gradient background on the track computed from the value, which is a `style` binding per `input` event.
- Foundation's slider CSS targets `.slider`, `.slider-handle` (a `<span role=slider>`) and `.slider-fill`; none of it applies to a native range. A native-range Slider keeps the `.slider` container class and must rewrite the handle and fill styles against the vendor pseudo-elements. That is documented custom CSS, not a Foundation class contract.
- `data-vertical` on the target set needs `transform: rotate(-90deg)` or the custom ARIA slider; `writing-mode` is the clean path once the target moves.
- `data-binding` (text input linked to the slider) is a plain two-way `value` sync.

Foundation plugins it could serve. Slider (single-handle: the platform covers it; double-handle: two natives or custom). Also the value badge could use `<output for="...">`.

## 15. The `inert` attribute

What it does. `inert` (https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute) makes an element and its flat-tree descendants non-interactive: not focusable, not clickable, skipped by find-in-page and by assistive technology, as if `pointer-events: none` plus `aria-hidden="true"` plus focus removal. Modal `<dialog>` and fullscreen elements make the rest of the document inert implicitly (https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees).

Baseline. "Baseline Widely available ... since April 2023; some parts vary" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert); web-features `inert` widely available 2025-10-11.

Minimum versions. Chromium 102, Gecko 112, WebKit 15.5. The varying part is `ignores_find_in_page` (BCD subfeature; not graded).

Meets 2026-05-07 target. Yes.

Known gaps.

- `inert` applies to subtrees, so trapping focus inside an off-canvas panel that is a sibling of the page content means setting `inert` on the content wrapper, not on `body`. Foundation's `.off-canvas-wrapper` / `.off-canvas-content` split fits this.
- Hidden accordion, tab and drilldown panels should use `hidden` (or `display: none`) rather than `inert`; `inert` keeps the element rendered.
- CDK's `FocusTrap` / `CdkTrapFocus` and `A11yModule` predate `inert`; a modal `<dialog>` needs neither. For non-dialog overlays (`popover="manual"` off-canvas), `inert` on the siblings is the platform way to trap focus without a focus-trap loop.

Foundation plugins it could serve. OffCanvas (`data-trap-focus` and `data-content-overlay` via `inert` on the content wrapper), Reveal (implicit through `showModal()`), Drilldown (inert the hidden parent menus while a submenu is open, if they stay rendered for animation), ResponsiveToggle (inert the collapsed menu while hidden and animating).

## 16. `:has()`

What it does. The relational pseudo-class `:has(<relative-selector-list>)` (https://drafts.csswg.org/selectors-4/#relational) matches an element when any of the arguments matches something relative to it: a parent selector (`.menu:has(> .is-active)`), a previous-sibling selector (`.accordion-item:has(+ .is-active)`) and state propagation upward (`.form-group:has(:user-invalid)`).

Baseline. "Baseline Widely available ... since December 2023" (https://developer.mozilla.org/en-US/docs/Web/CSS/:has); web-features `has` low 2023-12-19, high 2026-06-19.

Minimum versions. Chromium 105, Gecko 121, WebKit 15.4 (BCD `css.selectors.has`).

Meets 2026-05-07 target. No. Firefox 121 (2023-12-19) is two versions past the target's Firefox 119. It becomes widely available on 2026-06-19, six weeks after the target date.

Known gaps.

- Until the target moves, class bindings on the parent (`[class.is-active]`) do what `:has()` would; Foundation's state classes are already parent-level (`.accordion-item.is-active`, `.is-dropdown-submenu-parent.is-active`), so `:has()` saves little.
- `:has()` cannot contain `:has()`, pseudo-elements, or (in some engines) `:visited`.

Foundation plugins it could serve. Abide (`.form-group:has(:user-invalid)` styling the label), DropdownMenu and AccordionMenu (parent highlight when a child is active), Tabs (panel-to-tab styling), Sticky (`body:has(.is-stuck)`). All optional.

## 17. View Transitions

What it does. `document.startViewTransition(updateCallback)` (https://drafts.csswg.org/css-view-transitions-1/) snapshots the old state, runs the callback that changes the DOM, snapshots the new state and animates between them via `::view-transition-old(name)` / `::view-transition-new(name)` pseudo-elements; `view-transition-name` on elements pairs old and new; `view-transition-class` shares styles; `startViewTransition({ update, types })` adds typed transitions and `:active-view-transition-type()`. Cross-document transitions between same-origin navigations opt in with `@view-transition { navigation: auto }` (https://drafts.csswg.org/css-view-transitions-2/#cross-doc-opt-in). Angular's router exposes `withViewTransitions()`.

Baseline. `startViewTransition()`: "Baseline 2025, Newly available, since October 2025" (https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition); web-features `view-transitions` low 2025-10-14. Module and API landing pages carry no banner (https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API, https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_view_transitions). Cross-document: web-features `cross-document-view-transitions` not Baseline. `view-transition-class`: newly available 2025-10-14. Types and `startViewTransition({ update, types })`: newly available 2026-01-13. Element-scoped view transitions: Chromium 147 only.

Minimum versions. Same-document: Chromium 111, Gecko 144, WebKit 18. Typed/options form: Chromium 125, Gecko 147, WebKit 18.2. Cross-document `@view-transition`: Chromium 126, Gecko none, WebKit 18.2.

Meets 2026-05-07 target. No (Firefox 144 and Safari 18 for same-document; Firefox has no cross-document support at all).

Known gaps.

- Feature-detect with `if (document.startViewTransition)` and call the update function directly otherwise; that fallback is trivial, so view transitions are a safe enhancement even off-target.
- A view transition freezes the whole document during capture; a carousel that also runs `scroll-snap` scrolling or an open popover in the top layer is captured as-is. Same-document transitions also interact badly with in-flight CSS transitions on the same elements.
- Drilldown's slide-between-panels is the best fit (old panel out, new panel in with `view-transition-name` on the menu), but the target set means the Motion UI class path remains the primary implementation.

Foundation plugins it could serve. Drilldown (panel change), Tabs (`data-deep-link` panel switch), Orbit (slide change when not using scroll snap), ResponsiveAccordionTabs (mode switch), Reveal (rarely; `<dialog>` animation is better done with `@starting-style`).

## 18. `prefers-reduced-motion`

What it does. `@media (prefers-reduced-motion: reduce)` (https://drafts.csswg.org/mediaqueries-5/#prefers-reduced-motion) matches when the OS setting to minimise non-essential motion is on; `window.matchMedia('(prefers-reduced-motion: reduce)')` exposes it to script with `change` events.

Baseline. "Baseline Widely available ... since January 2020" (https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion); web-features widely available 2022-07-15.

Minimum versions. Chromium 74, Gecko 63, WebKit 10.1.

Meets 2026-05-07 target. Yes.

Known gaps. The query says nothing about which motion is essential; Foundation's Motion UI transitions, Orbit autoplay and smooth scrolling should be disabled under `reduce`, while state changes still happen instantly. WCAG 2.3.3 (AAA) and the AA-relevant 2.2.2 (pause, stop, hide for auto-playing content over five seconds) make Orbit's `data-auto-play` the one plugin where this is a compliance matter, not a nicety.

Foundation plugins it could serve. Orbit (`data-auto-play` off under reduce), SmoothScroll (`scroll-behavior: auto` under reduce), every animated plugin (Reveal, OffCanvas, Toggler, Dropdown, Tooltip, Accordion) via a shared Motion UI gate.

## 19. `inputmode`

What it does. The `inputmode` global attribute (https://html.spec.whatwg.org/multipage/interaction.html#attr-inputmode) hints which virtual keyboard to show for a text control or editing host: `none`, `text`, `decimal`, `numeric`, `tel`, `search`, `email`, `url`. It does not validate or change the value type. `enterkeyhint` is its sibling.

Baseline. "Baseline Widely available ... since December 2021" (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode); web-features widely available 2024-06-07.

Minimum versions. Chromium 66, Gecko 95, WebKit 12.1 (Safari for iOS 12.2; `inputmode="none"` had no effect before iOS 13).

Meets 2026-05-07 target. Yes.

Known gaps. Desktop browsers ignore it. Only meaningful on touch keyboards. `type="number"` already implies a numeric keyboard but rejects non-numeric input and has spinner semantics; `inputmode="decimal"` on `type="text"` with a `pattern` is the recommended combination for things like card numbers.

Foundation plugins it could serve. Abide (card, cvv, number patterns; Abide has no phone pattern), Slider (`data-binding` text input as `inputmode="decimal"`).

## 20. Invoker Commands API: `command`, `commandfor`

What it does. A `<button commandfor="<id>" command="<keyword>">` invokes an action on the target element without script (https://html.spec.whatwg.org/multipage/form-elements.html#attr-button-command). Built-in keywords: `toggle-popover`, `show-popover`, `hide-popover` (any popover), `close`, `request-close`, `show-modal` (dialogs), and custom keywords that start with `--` (for example `--toggle-menu`), which only dispatch a `command` event. Every invocation dispatches a cancelable `CommandEvent` on the target with `event.command` and `event.source` (the button) (https://html.spec.whatwg.org/multipage/interaction.html#the-commandevent-interface). The button becomes the popover's invoker for nesting and for the implicit anchor, like `popovertarget`. `HTMLButtonElement.command` and `commandForElement` reflect the attributes. The spec also defines command keywords for `<details>` (`toggle`, `open`, `close`), `<select>` (`show-picker`), `<input>` (`show-picker`, `step-up`, `step-down`) and media elements (`play-pause`, `toggle-muted`) in the section's "is valid command steps"; those are not graded here and are newer than the core set.

Baseline. Invoker Commands API: "Baseline 2025, Newly available, since December 2025" (https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API). `HTMLButtonElement.command`: Baseline 2025, since December 2025 (https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/command). `CommandEvent`: Baseline 2025, since December 2025 (https://developer.mozilla.org/en-US/docs/Web/API/CommandEvent).

Minimum versions. Chromium 135, Gecko 144, WebKit 26.2 (web-features `invoker-commands`, newly available 2025-12-12).

Meets 2026-05-07 target. No.

Known gaps.

- Widely available date would be 2028-06-12; for the whole life of the target set this is enhancement only.
- Custom commands (`--open-drilldown`) are the declarative equivalent of Foundation's Triggers utility (`data-open`, `data-close`, `data-toggle`), but on the target set an Angular directive binding `(click)` on the trigger does the same, so there is little to gain from the platform here until 2028.
- `command="show-modal"` plus `commandfor` on a `<dialog>` is the one-line Reveal trigger; the directive can set those attributes when supported and fall back to a click handler that calls `showModal()`.

Foundation plugins it could serve. Reveal (open and close triggers), Dropdown and Tooltip (`toggle-popover`), OffCanvas (`toggle-popover` or custom), Toggler (custom `--toggle`), Drilldown back buttons (custom), and the Triggers utility in general.

## 21. `CloseWatcher`

What it does. `new CloseWatcher()` (https://html.spec.whatwg.org/multipage/interaction.html#the-closewatcher-interface) lets custom UI respond to the platform's close request (Esc on desktop, the back button or gesture on Android, VoiceOver's two-finger scrub on iOS; https://html.spec.whatwg.org/multipage/interaction.html#close-requests) with `cancel` (cancelable, only when the page has history-action activation) and `close` events; `requestClose()` runs the same path from script; `destroy()` detaches. Watchers created without user activation are grouped so one close request closes them all (anti-abuse rule in the spec). `<dialog>` and popovers use the same close-request machinery internally.

Baseline. "Limited availability" (https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher).

Minimum versions. Chromium 126, Gecko 149, WebKit none (Safari Technology Preview only; BCD `api.CloseWatcher`).

Meets 2026-05-07 target. No.

Known gaps. WebKit has not shipped it. Anything that is a dialog or a popover already gets close-request handling from the element itself, which does meet the target (section 1) or nearly (section 2). Only in-flow custom overlays (OffCanvas push mode, Drilldown, ResponsiveToggle menus) would need `CloseWatcher`, and for them a `keydown` Escape listener remains the fallback; the Android back gesture is simply not intercepted on the target set.

Foundation plugins it could serve. OffCanvas (push and reveal modes), Drilldown (Esc closes the open submenu; `data-close-on-click`), ResponsiveToggle (Esc closes an expanded menu), Tooltip (`data-disable-hover` keyboard dismissal is handled by popover light dismiss instead).

## Plugin table

"Platform alone covers" answers whether native HTML and CSS, with Foundation's Sass applied, can replace the plugin with at most a thin attribute directive that sets attributes and relays events. "Meets 2026-05-07 target" says whether the features that plausible replacement depends on are all in the target set; "partial" lists what is in and what is out.

| Plugin | Platform features that apply | Platform alone covers | Meets 2026-05-07 target |
| --- | --- | --- | --- |
| Abide | Constraint Validation API, `:user-invalid`, `inputmode`, `:has()` | Validation state: yes. Error rendering (`.form-error`, `aria-describedby`, live validation options): no, directive. | Yes (Constraint Validation, `:user-invalid`, `inputmode`); `:has()` is out |
| Accordion | `<details name>`, `toggle` event, `::details-content`, `interpolate-size`, `@starting-style`, `prefers-reduced-motion` | Structure and exclusivity: yes with `<details>`. Height animation: no. | Partial: `<details>` and `toggle` in; `name` (Chrome 120), `::details-content`, `interpolate-size`, `@starting-style` out |
| AccordionMenu | Nested `<details>`, `toggle`, `:has()`, `inert` | Disclosure: yes. APG menu keyboard (arrow navigation across items): no, directive or `@angular/aria`. | Partial: `<details>` and `inert` in; `name`, `:has()` out |
| Drilldown | `inert`, View Transitions, `CloseWatcher`, custom `command` | No; panel stack, focus management and back navigation are script. | Partial: `inert` in; View Transitions, `CloseWatcher`, commands out |
| Dropdown | `popover="auto"`, `popovertarget`, anchor positioning, `@starting-style`, `overlay`, `command="toggle-popover"` | Yes where popover and anchor positioning exist (a thin directive maps `data-*` to attributes). | No: popover (Firefox 125), anchor positioning (2026), `@starting-style` all out; needs CDK Overlay or a measured positioner as fallback |
| DropdownMenu | Nested `popover="auto"`, anchor positioning, `:has()`, `inert` | Show/hide and stacking: yes with popovers. Hover intent, APG menubar keyboard: no. | No: popover and anchor positioning out; `inert` in |
| Equalizer | `ResizeObserver`, container queries, CSS grid/flex stretch (outside the ticket list) | Yes: `display: grid` / flex `align-items: stretch` removes the need; `ResizeObserver` covers `data-equalize-by-row` with measured heights. | Yes (`ResizeObserver`, container queries) |
| Interchange | `<picture>`, `srcset`, `sizes`, `loading="lazy"`, container queries, `matchMedia` | Images: yes outright. HTML partials: no, Angular `@defer`. | Yes for images (`sizes="auto"` and `<iframe loading="lazy">` out) |
| Magellan | `IntersectionObserver`, `scrollIntoView()`, `scroll-margin`, `scroll-behavior`, `position: sticky`, `scrollend` | Scrolling to targets: yes. Active-link tracking: `IntersectionObserver` in a thin directive; URL hash sync is script. | Yes (`scrollend` out, but not needed) |
| OffCanvas | `<dialog>` modal, `::backdrop`, `inert`, `popover="manual"`, `closedby`, `@starting-style`, `transition-behavior`, `CloseWatcher` | Overlay mode: yes with `showModal()` and `::backdrop`. Push and reveal modes (content moves): no, in-flow layout with `inert`. | Partial: `<dialog>`, `::backdrop`, `inert` in; popover, `closedby`, animation at-rules, `CloseWatcher` out |
| Orbit | Scroll snap, `scrollIntoView()`, `IntersectionObserver`, `scrollend`, `prefers-reduced-motion`, `loading="lazy"`, View Transitions | Slide layout, swipe, and snapping: yes. Bullets, arrows, autoplay, `aria-live`: thin directive. | Yes (scroll snap, `scrollIntoView`, `IntersectionObserver`, reduced motion in; `scrollend`, View Transitions out) |
| ResponsiveAccordionTabs | Container queries, `<details name>`, `matchMedia`, View Transitions | No; switching between two ARIA patterns is script. Container queries can drive the CSS side. | Partial: container queries in; `name`, View Transitions out |
| ResponsiveMenu | Container queries, `matchMedia`, `:has()` | Style switching: yes. Plugin swap (dropdown vs drilldown vs accordion): script. | Partial: container queries in; `:has()` out |
| ResponsiveToggle | `matchMedia`, container queries, `inert`, `popover="manual"`, `CloseWatcher` | Show/hide of the toggled bar: `hidden` attribute and a click handler; animation via Motion UI. | Partial: `inert`, container queries in; popover, `CloseWatcher` out |
| Reveal | `<dialog>` modal and non-modal, `::backdrop`, `closedby`, `requestClose()`, `inert` (implicit), `@starting-style`, `transition-behavior`, `overlay`, `command="show-modal"`, View Transitions | Yes: `<dialog>` covers open/close, Esc, focus trap, backdrop and stacking. Click-outside and animations need a few lines on the target set. | Partial: `<dialog>`, `::backdrop`, `:modal`, `inert` in; `closedby`, `requestClose()`, animation at-rules, commands out |
| Slider | `<input type="range">`, `appearance: none`, `list`/`datalist`, `inputmode`, `writing-mode` vertical, `::slider-*` | Single handle: yes with vendor pseudo-element styling. Double handle (`doubleSided`/`data-double-sided`): no, two natives or custom ARIA slider. Vertical: rotate or custom. | Partial: `type=range`, `appearance` in; `writing-mode` vertical (Chrome 124 / Firefox 120 / Safari 17.4), `::slider-*` out |
| SmoothScroll | `scroll-behavior`, `scrollIntoView()`, `scroll-margin`, `prefers-reduced-motion` | Yes outright; `data-offset` becomes `scroll-margin-top`, duration and easing are not controllable (browser-defined). | Yes |
| Sticky | `position: sticky`, `IntersectionObserver`, container queries, scroll-state queries | Sticking: yes. `.is-stuck` / `.is-at-top` / `.is-at-bottom` classes and `data-top-anchor` / `data-btm-anchor` ranges: thin directive with `IntersectionObserver`. | Yes (`position: sticky`, `IntersectionObserver` in; scroll-state queries out) |
| Tabs | `:has()`, `scrollIntoView()`, View Transitions, `hidden` | No native tabs; `@angular/aria` Tabs is the building block. Platform only assists (deep-link scroll, panel switch animation). | Yes for what applies (`scrollIntoView`); `:has()`, View Transitions out |
| Toggler | `hidden`, `<details>`, `popover="manual"`, custom `command`, `@starting-style`, `transition-behavior` | Class toggle: trivially script (`[class.x]` binding); `<details>` when the trigger sits above the content. Animation: Motion UI on target set. | Partial: `<details>` in; popover, commands, animation at-rules out |
| Tooltip | `popover="hint"`, `popover="manual"`, anchor positioning, `@starting-style`, `overlay`, `prefers-reduced-motion` | Yes where `hint` and anchor positioning exist; on the target set a directive positions and shows a `role=tooltip` element itself (CDK Overlay or measured). | No: popover, `hint` (no WebKit), anchor positioning, `@starting-style` all out |

Plugins the platform covers outright on the 2026-05-07 target set: SmoothScroll, Interchange (images), Equalizer (via CSS layout), Magellan (with a thin `IntersectionObserver` directive), Sticky (same), Orbit (scroll snap plus a thin directive), Reveal (`<dialog>` minus click-outside and animation sugar), Slider single-handle. Plugins whose natural platform replacement is entirely outside the target set: Dropdown, DropdownMenu, Tooltip (all three wait on popover and anchor positioning; the fallback is CDK Overlay or an equivalent positioner behind `@supports (anchor-name: --x)` and `'popover' in HTMLElement.prototype` checks).

## Sources

All fetched 2026-09-25 through markdown.new unless noted.

- Baseline definitions: https://web.dev/baseline
- Support target page: https://web-platform-dx.github.io/supported-browsers/?widelyAvailableOnDate=2026-05-07&includeDownstream=false (JS-rendered; the version table comes from the user, and matches the browser releases current on 2023-11-07 in the web-features release data: Chrome 119 2023-10-31, Edge 119 2023-11-02, Firefox 119 2023-10-24, Safari 17.1 2023-10-25)
- web-features 3.40.0: https://unpkg.com/web-features@3.40.0/data.json (curl)
- browser-compat-data (main branch, 2026-09-25): https://raw.githubusercontent.com/mdn/browser-compat-data/main/{html/elements/dialog,html/elements/details,html/elements/img,html/elements/button,html/elements/input,html/global_attributes,api/CloseWatcher,api/HTMLDialogElement,api/HTMLButtonElement,api/CommandEvent,api/Document,api/ViewTransition,api/HTMLElement,css/properties/interpolate-size,css/types/calc-size,css/properties/overlay,css/properties/animation-timeline,css/properties/animation-range,css/properties/position-anchor,css/properties/anchor-name,css/properties/position-area,css/properties/position-try-fallbacks,css/at-rules/starting-style,css/properties/transition-behavior,css/selectors/details-content,css/selectors/has,css/at-rules/container,css/types/length,css/properties/position,css/at-rules/view-transition,css/properties/scroll-snap-type,css/properties/field-sizing,css/selectors/user-invalid,css/properties/scroll-behavior,css/at-rules/media,css/properties/scroll-timeline,css/properties/view-timeline,css/properties/appearance,css/selectors/backdrop,css/selectors/popover-open}.json (curl)
- MDN pages: cited inline per feature.
- WHATWG HTML: https://html.spec.whatwg.org/multipage/interactive-elements.html, /popover.html, /interaction.html, /form-elements.html, /form-control-infrastructure.html, /input.html, /embedded-content.html, /images.html, /urls-and-fetching.html
- CSSWG: https://drafts.csswg.org/css-anchor-position-1/, /css-values-5/, /css-transitions-2/, /css-position-3/, /css-position-4/, /css-scroll-snap-1/, /scroll-animations-1/, /css-contain-3/, /css-conditional-5/ (via web-features links), /cssom-view-1/, /css-view-transitions-1/, /css-view-transitions-2/, /mediaqueries-5/, /selectors-4/, /css-forms-1/, /css-pseudo-4/ (via web-features link), /resize-observer-1/
- W3C: https://w3c.github.io/IntersectionObserver/
- Sibling research consulted for plugin option names: research/foundation-inventory-positioned.md, research/angular-22-api-survey.md (browser baseline line), research/angular-aria-inventory.md (no slider).
