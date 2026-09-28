# Inputs named like HTML attributes: evidence

Evidence for [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md), steps 1 (measure) and 2 (audit). This file decides nothing: it records what was measured, cited, and found, for the reviewers and the judge.

## Header

- Question: a directive input written as a static attribute stays on the element (Angular sets the input and renders the attribute). What does each such attribute do on the elements the specs let it sit on, what exactly does the Menu family's `align` render and when, what do a host binding `'[attr.align]': 'null'` and the bound form `[align]` change under server rendering and hydration, and which names are free for a rename?
- Date: 2026-09-28. Evidence gathered AFK by one agent; the audit's inventory of inputs was swept by four read-only helper agents (one per quarter of `specs/`) and every row below that carries a consequence was re-checked against the spec text by line number.
- Earlier evidence reused and not repeated: [Spec: Media Object](../issues/91-spec-media-object.md) E6 (`align` on `div`, `p`, `li`, `article`, `section`, `figure`, `header`, `ul`, `ol`, `nav`, `h4`, `td`), [Spec: Float Classes](../issues/105-spec-float-classes.md) (`img align`, `br clear`, `table align`), [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md) (`align` on `p`, `div`, `h2`; `ol type`, `ul type`).

Sources and versions:

| Source | Version |
| --- | --- |
| Playwright | 1.63.0 (read-only use of `D:/tmp/nfs-ct-prototype`'s install): Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 |
| Foundation for Sites | 6.9.0, the local clone's compiled `dist/css/foundation.css` (flexbox build), `dist/css/foundation-float.css` (float build), `dist/css/foundation-rtl.css` (right-to-left compile), and `dist/js/foundation.js` with jQuery 3.7.1 for Foundation's own menu markup |
| Angular | 22.2.0 packages (`@angular/core`, `@angular/ssr`, `@angular/platform-server`, `@angular/build`, `@angular/compiler-cli`; read-only use of an earlier prototype's install through a junction, removed afterwards); source cited from the local clone, branch 22.2.x at `5db6fc4` |
| Angular components (Material, Aria) | local clone, branch 22.2.x at `708d4c6` (22.2.0) |
| WHATWG HTML | Living Standard as published 28 September 2026: section 15 Rendering, the Index "Attributes" table, section 16 Obsolete features |
| Blink, WebKit | `third_party/blink/renderer/core/html/html_element.cc` and `Source/WebCore/html/HTMLElement.cpp`, main branches as fetched 2026-09-28 (not the exact revisions of the tested browser builds) |
| Node | 24.18.0 |

Experiments: `D:/tmp/nfs-139/` (not committed): `m1-static-align.mjs`, `m2-menus.mjs`, `m2b-rtl.mjs`, the Angular app `app/` (probe directives `app/src/app/probes.ts`, page `probe-page.ts`, deferred block `probe-block.ts`, collision probes `app/collide/probes.ts` and `app/src/app/collide-runtime.ts`), `m3-hydration.mjs`, `m3b-frames.mjs`, `m4-other-attrs.mjs`, `m4b-dialog-descendant.mjs`, with their outputs (`*-out.txt`, `server-*.html`).

## Headline

- `align` on a `ul`: Chromium and WebKit turn it into an inherited `text-align` on the list and everything in it (Blink's and WebKit's generic `HTMLElement` code maps `align` on every HTML element); Firefox ignores it on `ul`, `li`, `section`, and `nav`. With Foundation's CSS loaded nothing changes this: Foundation sets no `text-align` on these hosts.
- In Foundation's own menu markup and JavaScript, the attribute beside the `.align-*` class that the same input sets changes the computed `text-align` of every link, submenus included, in Chromium and WebKit, but moves text in only one measured case: a vertical menu (plain, Accordion Menu, Drilldown) with `align="left"` inside a `dir="rtl"` region of Foundation's LTR compile, where the text jumps from the start (right) edge to the left edge (241 px to 16 px in a 300 px item) in Chromium and WebKit and stays in Firefox. In a horizontal dropdown menu the submenu links inherit `text-align: right` but are shrink-wrapped flex items, so nothing moves; only the attribute without the class moves submenu text (16 px to 127 px in a 198 px item).
- Host binding `'[attr.align]': 'null'` under Angular 22.2 SSR: the static attribute never reaches the server HTML, so first paint never has it; hydration writes it back onto the server node in the creation pass (Angular's `elementLikeStartShared` calls `setupStaticAttributes` for claimed nodes too) and the first update pass removes it; in 63 re-add moments across three engines and both build configurations no rendering update ever saw it. The input still receives the static value. No compile error, no NG05xx, no hydration mismatch. Works through two levels of host directives, Responsive-Menu-shaped de-duplication, `@defer`, incremental hydration (`hydrate on timer`, `hydrate on interaction`) and `hydrate never`.
- The bound form `[align]="'right'"` renders no attribute, on the server or the client.
- Angular Material 22.2 already binds `'[attr.align]': 'null'` on three components with an `align` input (MatDrawer, MatSidenav, MatHint) and leaves it on two (MatCardActions, whose source carries a TODO to rename it "as to not conflict with the native `align` attribute", and MatDialogActions).
- Audit: 72 inputs in 29 of the 52 specs are named like an HTML attribute. Six render a presentational hint (the Menu family's `align`); three render a Foundation look through an attribute selector (`.accordion[disabled]`, intended; `.slider[disabled]` and `input[readonly]`, not addressed or only partly); four render `autofocus`, which acts only on the Reveal's `dialog` (addressed there); 22 are intended native or ARIA attributes the directive also binds; 33 do nothing on their hosts; four never reach the DOM.
- Rename candidates: `alignment` collides on `nfsDropdownMenu` and `nfsResponsiveMenu` (measured: `alignment="auto"` and `"center"` fail strict templates, and one attribute reaches both inputs); `alignX` collides with the Flexbox Utilities' `nfsFlexAlign`, which that spec allows beside `nfsMenu` (measured: `alignX="justify"` fails, `alignX="right"` reaches both). An alias on the hosting roots does not survive `nfsMenu` written beside a root (measured).

## Measurements

### M1. A static `align` on eight hosts, three engines, with and without Foundation's CSS

Method: `m1-static-align.mjs`. Each host is 600 px wide and holds a text run and, for block hosts, a 100 px block child; for `img`, a 100 by 50 image before a text run inside a 600 px `div`. Values `left`, `right`, `center`, `middle`, `justify`, `top`, `bottom`, and no attribute; each case in its own `display: flow-root` box. Read: computed `text-align`, `float`, `vertical-align` on the host, computed `text-align` on a descendant, and where the text run and the block child start. Three stylesheets: none, `foundation.css`, `foundation-float.css`.

Results (identical with and without Foundation's CSS except where noted; x offsets are from the host's content box, 600 px wide):

| Host | Chromium 153 | Firefox 155 | WebKit 26.6 |
| --- | --- | --- | --- |
| `ul` | `left`, `right`, `center` (also for `middle`), `justify` on the `ul`, inherited by the `li`; text moves (right: 571 px, centre: 285 px); the block child stays at 0 | nothing | as Chromium (for `left` only the `ul` changes, the `li` already computes `left`) |
| `li` | as `ul` (right: text at 571 px) | nothing | as Chromium |
| `div` | `-webkit-left`, `-webkit-right`, `-webkit-center` (also `middle`), `justify`; text and the block child move (right: 572 and 500 px; centre: 286 and 250 px) | `-moz-left`, `-moz-right`, `-moz-center`, `justify`; text and block child move as in Chromium | as Chromium |
| `p` | `-webkit-*` as `div` (right: text at 572 px) | `-moz-*` as `div` | as Chromium |
| `section`, `nav` | plain `left`, `right`, `center`, `justify`; text moves (right: 572 px), the block child stays | nothing | as Chromium |
| `td` | `-webkit-*`; text and block child move (right: 567 and 494 px without Foundation, 551 and 479 px with its cell padding) | `-moz-*`, same offsets | as Chromium |
| `img` | `left`/`right`: `float: left`/`right` (right: image at 500 px, text at 0) and `vertical-align: top`; `center`/`middle`: `vertical-align: -webkit-baseline-middle`; `top`: `vertical-align: top`; with Foundation's CSS only the float remains, because Foundation's `img { vertical-align: middle }` outranks the hint | floats as Chromium; `center`/`middle`: `-moz-middle-with-baseline`; `top`: `top`; with Foundation only the float remains | as Chromium |

`top` and `bottom` change nothing on any host but `img`. The earlier tickets' results (Media Object E6, Float Classes, Typography Helpers) agree.

Cited, to separate the standard from the engines:

- WHATWG HTML 15.3.3 Flow content (`#flow-content-3`): `div align` (left, right, centre/middle, justify) is a presentational hint for `text-align` and "align descendants". 15.3.8 Tables (`#tables-2`): the same for `thead`, `tbody`, `tfoot`, `tr`, `td`, `th`; the user agent style sheet maps `p[align]` and `h1` to `h6[align]` to `text-align`, `table[align=left|right]` to `float`, `table[align=center]` to `margin-inline: auto`, `caption[align=bottom]` to `caption-side`, `valign` to `vertical-align`, `td[nowrap]` to `white-space: nowrap`, `table[border]` to borders. 15.4.3 (`#attributes-for-embedded-content-and-images`): `align` on `embed`, `iframe`, `img`, `object`, and image inputs maps to `float` or `vertical-align`. 15.3.11 (`#the-hr-element-2`): `hr` `align`, `color`, `noshade`, `size`, `width`. 15.3.4 (`#phrasing-content-3`): `br clear`, `font color`, `font size`. 15.3.7 Lists (`#lists`): `ol type`, `ul type`, `li type`, `li value` (as `counter-set`), `ol start` (as `counter-reset`). The standard defines no `align` hint for `ul`, `li`, `section`, or `nav`.
- Blink `html_element.cc` lines 356 to 386: `HTMLElement::IsPresentationAttribute` returns true for `align` on every HTML element, and `CollectStyleForPresentationAttribute` sets `text-align` to the attribute value (`middle` becomes `center`); a value that is not a `text-align` keyword (`top`, `bottom`) is dropped. WebKit `HTMLElement.cpp` lines 185 to 236: `hasPresentationalHintsForAttribute` and `collectPresentationalHintsForAttribute`, the same mapping. This is why `ul`, `li`, `section`, and `nav` align in Chromium and WebKit and not in Firefox. Firefox's mapping was measured only, not traced in source.

### M2. The Menu family in Foundation's own markup and JavaScript

Method: `m2-menus.mjs`. Foundation 6.9.0's own docs markup (`docs/pages/dropdown-menu.md`, a three-level dropdown), a vertical dropdown, a plain horizontal menu with a nested vertical menu, a plain vertical menu, and an Accordion Menu, initialised by `$(document).foundation()`. Submenus opened by hover in Chromium and Firefox; in WebKit Playwright's hover did not reach Foundation's handlers and the submenus were opened through the plugin's own `_show`. Each scenario twice: the `.align-*` class alone (what Foundation's markup has) and the class plus the `align` attribute (what `nfsMenu align="right"` renders, since the input sets the class and Angular keeps the attribute). Read: for every visible link, where its text starts inside its `li`, the link's width, and the computed `text-align`. Under `foundation.css` and `foundation-float.css`.

Results, flexbox build (`foundation.css`):

| Scenario | Chromium | Firefox | WebKit |
| --- | --- | --- | --- |
| Horizontal dropdown `.align-right`, submenus open (two levels) | Attribute: every link and `li` computes `text-align: right` (class alone: `start`); no text moves: submenu links are 87 to 99 px wide in 198 px items, text at 16 px either way | class and attribute alike: `left`, text at 16 px | as Chromium |
| Horizontal dropdown `.align-center` | attribute: `center` everywhere; no text moves | nothing | as Chromium |
| Vertical dropdown `.align-right`; plain vertical `.align-right`; Accordion Menu `.align-right` | the class already right-aligns every item and submenu (Foundation's `&.vertical li { text-align: right; .submenu li { text-align: right } }`); the attribute changes nothing | same | same |
| Plain horizontal `.align-right` with a nested vertical menu | attribute: `text-align: right` computed; no text moves (Foundation's `.align-right li { display: flex; justify-content: flex-end }` also reaches the nested items) | nothing | as Chromium |
| Horizontal dropdown, attribute without the class | submenu text moves from 16 px to 127 px in a 198 px item; top-level links unchanged | nothing | as Chromium |

Float build (`foundation-float.css`): with the class, Foundation's `.align-right .submenu li { text-align: left }` resets the submenus and the attribute changes nothing visible; the attribute without the class again moves submenu text to 127 px in Chromium and WebKit.

So the ticket's premise holds for computed style (a dropdown submenu's items inherit `text-align: right` in Chromium and WebKit) and not for what is drawn, as long as the `.align-*` class is on the same list, which the input guarantees.

### M2b. The case where the attribute moves text: a vertical menu in a right-to-left region

Method: `m2b-rtl.mjs`. Inside `<div dir="rtl" style="width:300px">`: a plain vertical menu, an Accordion Menu (a section opened), and a Drilldown, each with `.align-left` or `.align-right`, class alone and class plus attribute, under Foundation's LTR compile (`foundation.css`) and its RTL compile (`foundation-rtl.css`).

Results (text start inside a 300 px item; Accordion Menu submenu items are 284 px):

| Compile, class | Chromium | Firefox | WebKit |
| --- | --- | --- | --- |
| LTR compile, `.align-left` | class alone: text at 241 and 176 px (`start` is the right edge); plus `align="left"`: text at 16 px in all three menus, submenu included | 241 and 176 px either way | as Chromium |
| LTR compile, `.align-right` | 241 px either way (the class sets `text-align: right`) | same | same |
| RTL compile, `.align-left` and `.align-right` | no change with the attribute | no change | no change |

The Menu spec's note (`specs/menu.md` line 531: "inside a `dir="rtl"` region of an LTR compile, `align="left"` gives `flex-start`, the region's right edge") holds for horizontal menus and for Firefox; with the static attribute, a vertical menu's text goes to the left edge in Chromium and WebKit.

### M3. Angular 22.2: server HTML, first paint, hydration, `@defer`, incremental hydration

Method: an Angular 22.2.0 application (`app/`, `outputMode: 'server'`, `provideClientHydration(withIncrementalHydration())`, zoneless default, `strictTemplates: true`), built in development and production configurations and served by its own SSR server on ports 5440 to 5442 (stopped afterwards). Probe directives in `app/src/app/probes.ts`:

- `ul[probeMenu]`: `align = input<'left' | 'right' | 'center' | undefined>()`, host `class: 'menu'` and `[class.align-*]` bindings: `NfsMenu`'s shape.
- `ul[probeMenuNull]`: the same plus `'[attr.align]': 'null'`.
- `ul[probeDropdown]` hosting `ProbeMenuNull` (`inputs: ['align']`) and reading `align()` through `inject(ProbeMenuNull, {self: true})` for a `data-side` binding: the Dropdown Menu root's shape. `ul[probeResponsive]` hosting `ProbeDropdown` and `ProbeAccordion` (each hosting `ProbeMenuNull`): the Responsive Menu's shape. `ul[probeSubmenu]` hosting `ProbeMenuNull`: `NfsSubmenu`'s shape.
- On the page: each with a static `align="right"`; the bound form `[align]="'right'"` on both; a consumer `[attr.align]` bound to a signal (`'center'`, set to `'left'` 800 ms after stability) with and without the static attribute; a vertical `dir="rtl"` menu with `align="left"` for both probes; and a block component (plain, null, and dropdown probes) inside `@defer (on timer(300ms))`, `@defer (hydrate on timer(1500ms))`, `@defer (hydrate on interaction)`, and `@defer (hydrate never)`.

Read: the server HTML (`curl`); the page with JavaScript disabled (the server HTML as painted); a `MutationObserver` installed before any page script (`addInitScript`) logging every `align` change and insertion; the DOM after stability, after the timers, and after a click that hydrates the interaction block; `ngDevMode` hydration counters; console errors.

Server HTML (development and production identical), abbreviated:

```html
<ul id="s-plain" probemenu="" align="right" class="menu align-right">
<ul id="s-null" probemenunull="" class="menu align-right">                 <!-- input received 'right' -->
<ul id="s-bound" probemenu="" class="menu align-right">                    <!-- [align]="'right'" -->
<ul id="s-dropdown" probedropdown="" class="menu align-right dropdown" data-side="opens-left">
<ul id="s-responsive" proberesponsive="" class="menu align-right dropdown accordion-menu" data-side="opens-left">
<ul id="s-submenu" probesubmenu="" class="menu align-right nested vertical">
<ul id="s-consumer" probemenunull="" class="menu align-right">            <!-- consumer [attr.align]="'center'" lost -->
<ul id="s-consumer-only" probemenunull="" class="menu">                     <!-- consumer [attr.align] alone lost -->
<ul probemenunull="" class="menu align-right" id="ht-null">                 <!-- inside @defer (hydrate on timer) -->
<p id="d-placeholder">placeholder</p>                                        <!-- @defer (on timer): client only -->
```

Results, identical in the three engines unless noted:

1. The static attribute reaches the server HTML only without the host binding (`s-plain`, and the plain probe in every hydrate block). With `'[attr.align]': 'null'` it is absent on the server for every shape: direct, hosted, hosted through two roots (one merged instance: `data-side` was computed from the hosted `align()`), submenu, and inside incremental-hydration blocks. The template-reference read `{{ nul.align() }}` rendered `right`: the input still receives the static value.
2. First paint of hydrated HTML: with JavaScript disabled the null-bound lists have no attribute; the plain probe keeps it, and for the vertical RTL list with `align="left"` the text starts at 16 px in Chromium and WebKit (plain) against 286 px (null-bound), and at 277 and 286 px in Firefox (both at the start edge).
3. During hydration the attribute comes back for a moment. The `MutationObserver` log shows, for every null-bound element being hydrated, `align` added again with its static value in the creation pass (Chromium +136 ms in one run; Firefox +162 ms; WebKit +238 ms) and removed in the first update pass (+148, +168, +257 ms); the plain probe's attribute is rewritten with the same value. Source: `packages/core/src/render3/instructions/shared.ts` line 599, `elementLikeStartShared` calls `setupStaticAttributes` on the node `locateOrCreateNativeNode` returned, which during hydration is the claimed server node; `setupStaticAttributes` (`dom_node_manipulation.ts` lines 141 to 145) calls `setUpAttributes` (`util/attrs_utils.ts` line 42); `setElementAttribute` (`shared.ts` lines 530 to 535) removes the attribute for a `null` value. The same happens when an incremental-hydration block hydrates (`ht-null` +1637/+1639 ms, `hi-null` +2728/+2729 ms in Chromium) and when `@defer (on timer)` renders on the client (inserted with `align`, removed 2 ms later). `hydrate never` blocks are never touched.
4. M3b (`m3b-frames.mjs`) checks whether that window is ever drawn: a `ResizeObserver` on a probe element resized in every animation frame fires in each rendering update after the frame's `requestAnimationFrame` callbacks and layout, just before paint, and records which null-bound elements carry `align` there. Five loads per engine against the development build and two against the production build; each load has three re-add moments (initial hydration, the `hydrate on timer` block, the `hydrate on interaction` block) covering 10 null-bound elements: 45 moments (150 element re-adds) in the development runs and 18 moments (60 element re-adds) in the production runs, and not one rendering update saw a re-added attribute; the nearest rendering updates before and after each re-add bracket it (for example Chromium: re-add at 123 ms, last update before at 32 ms, first after at 134 ms, without the attribute). The one element seen with `align` in rendering updates is `s-consumer`, carrying its own bound value after the consumer's signal changed.
5. No compile-time conflict: a template's static `align="right"` on an element whose directive binds `'[attr.align]': 'null'` compiles under strict templates in development and production builds, and so does a consumer `[attr.align]` binding beside both. At runtime the directive's host binding runs after the template's bindings in the same pass, so it wins the first pass (both consumer cases render no attribute on the server and after hydration); a later change of the consumer's bound value is written and stays, because the host binding's value (`null`) never changes and is not written again (`s-consumer` and `s-consumer-only` read `align="left"` after the change).
6. No console errors or warnings in either build; `ngDevMode` hydration counters (development): 102 hydrated nodes, 4 hydrated components, 0 components skipped, 0 dehydrated views removed. The interaction block's click was replayed after hydration (button text "hi clicks 1").

### M3c. The bound form

`<ul probeMenu [align]="'right'">` and `<ul probeMenuNull [align]="'right'">` render no `align` attribute in the server HTML, with JavaScript disabled, after hydration, and in the `MutationObserver` log, in the three engines; the class is set. (A bound input binding writes neither an attribute nor a DOM property when a directive input consumes it.)

### M3d. Input-name collisions for the rename candidates

Method: compile-time probes in `app/collide/probes.ts` compiled with `ngc` and `strictTemplates: true`; the cases that compile rendered on the server by `app/src/app/collide-runtime.ts`.

| Case | Compile | Runtime (server HTML) |
| --- | --- | --- |
| A root with its own `alignment: 'auto' \| 'left' \| 'right'` (the Dropdown Menu's) hosting a Menu whose input is also `alignment: 'left' \| 'right' \| 'center'`, exposed under the same name; `alignment="auto"` | error TS2322: `"auto"` is not assignable to the Menu's type | n/a |
| same, `alignment="center"` | error TS2322: `"center"` is not assignable to the root's type | n/a |
| same, `alignment="right"` | compiles | both inputs receive `right` (root `right`, menu `right`) |
| The Menu's `alignment` exposed on the root under an alias (`inputs: ['alignment: menuAlignment']`) | compiles | `alignment="auto"` reaches the root, `menuAlignment="center"` the Menu |
| The aliased root with the Menu also written beside it (`<ul root menu alignment="auto">`, allowed by the Menu's D5) | error TS2322: the template-matched Menu exposes its own `alignment` again | n/a |
| A Menu input named `alignX` beside a directive shaped like the Flexbox Utilities' `NfsFlexAlign` (`alignX: 'left' \| 'right' \| 'center' \| 'justify' \| 'spaced'`), `alignX="justify"` | error TS2322: `"justify"` is not assignable to the Menu's type | n/a |
| same, `alignX="right"` | compiles | both receive `right` |

Host-directive `exportAs` references (`#am="rMenu"` on the hosted Menu) resolved in these probes, as the Menu spec's hosting tests assume.

### M4. The audit's other behaving attributes

Method: `m4-other-attrs.mjs` and `m4b-dialog-descendant.mjs`, three engines, markup written as a static input attribute renders it (HTML lowercases attribute names, so `autoFocus` becomes `autofocus`); Foundation's `foundation.css` for the CSS cases; Chromium's CDP full accessibility tree (`Accessibility.getFullAXTree`) with and without each attribute.

| Case | Chromium | Firefox | WebKit |
| --- | --- | --- | --- |
| `ul autofocus` (Tabs' list), `div autofocus="false"`, `aside autofocus` with `visibility: hidden` (a closed Off-canvas panel), each followed by `<input autofocus>` | the input is focused | same | same |
| `ul autofocus` alone | focus stays on `body` | same | same |
| `div tabindex="-1" autofocus` | the `div` is focused at load | same | same |
| a client-inserted `ul autofocus`, one frame later a client-inserted `input autofocus` | the input is focused | same | same |
| `dialog autofocus` with a `button`, `showModal()` (the Reveal's host) | the button | the dialog | the dialog |
| `dialog` without `autofocus` | the button | the button | the button |
| inside a modal `dialog`: a non-focusable `div autofocus` or `ul autofocus` before a button (a Dropdown pane or Tabs list inside a Reveal), also with `visibility: hidden` | the button | the button | the button |
| inside a modal `dialog`: `div tabindex="-1" autofocus` after a button | the `div` | the `div` | the `div` |
| `div.slider disabled` (whatever the input's value) | `opacity: 0.25`, `cursor: not-allowed` (Foundation's `.slider[disabled]`) | same | same |
| `input type=range readonly` | `background-color: #e6e6e6`, `cursor: not-allowed` (Foundation's `input[readonly]`); ArrowRight still changes the value (50 to 51) | same | same |
| `ul.accordion disabled` | the title's `cursor: not-allowed` (Foundation's `.accordion[disabled] .accordion-title`) | same | same |
| `ul.breadcrumbs li disabled` | no change (Foundation styles only `li.disabled`) | same | same |

Chromium CDP accessibility tree, with against without the attribute: identical role, name, and properties for `ul selected`, `button value` (type button), `a value`, `div role="progressbar"` with `min`/`max`/`value` beside its ARIA values, `input type=range readonly` (no read-only state exposed), `li disabled`, `div disabled`, `ul autofocus`, `span color`, `div size`, and `ul align="right"` in a `nav`. None of the audited names changes what assistive technology receives in Chromium.

### Citations for the options

- Angular Material 22.2, `src/material/sidenav/drawer.ts` line 176 and `sidenav.ts` line 56: `'[attr.align]': 'null'` with the comment "must prevent the browser from aligning text based on value" (added 2016-09-21 as "fix(sidenav): align text at start", `0e0ff0e`, when the drawer's side was still an `align` input; `align` was deprecated for `position` in 5.0.0 and removed in 6.0.0, `c1d4666`, 2018-03-13; the null binding stayed). `src/material/form-field/directives/hint.ts` lines 19 to 25: `MatHint` keeps its `align: 'start' | 'end'` input and binds `'[attr.align]': 'null'`, "Remove align attribute to prevent it from interfering with layout." `src/material/card/card.ts` lines 128 to 132: `MatCardActions` keeps `@Input() align: 'start' | 'end'` without the binding, with "TODO(jelbourn): deprecate `align` in favor of `actionPosition` or `actionAlignment` as to not conflict with the native `align` attribute." `src/material/dialog/dialog-content-directives.ts` line 177: `MatDialogActions` keeps `align?: 'start' | 'center' | 'end'` without the binding.
- Angular Aria 22.2, `src/aria/accordion/accordion-trigger.ts` line 53: `'[attr.disabled]': '_pattern.hardDisabled() ? true : null'`, which removes a static `disabled` from the trigger button unless it is hard-disabled.
- The library's own precedents: [Spec: Button](../issues/37-spec-button.md) (`specs/button.md` line 182: `[attr.disabled]` "Not written (`null`), which also removes a static `disabled` that fed the input" on `<a>` hosts); [Spec: Dropdown](../issues/26-spec-dropdown.md) D13 (`specs/dropdown.md` line 581: `autoFocus` keeps Foundation's name, is set by binding or the Defaults token, and a static attribute warns in development through `HostAttributeToken('autoFocus')`, dev check 6 at line 281; "Renaming the input (breaks the naming rule)" rejected); [Spec: Reveal](../issues/18-spec-reveal.md) D12 (`specs/reveal.md` lines 258, 279, 605: the directive removes a static `autofocus` from its host before every `showModal()`/`show()`; "renaming the input (breaks ADR 0007's vocabulary)" rejected); [Spec: Media Object](../issues/91-spec-media-object.md) D3 (renamed to `alignment`).

## Audit

Method: every spec in `specs/` (52 files; `anchored-pane.md`, `breakpoint-service.md`, and `variant-declaration-tooling.md` define no directive) was read for every directive's and component's selector and public inputs and models, including those exposed through `hostDirectives` (the Menu's inputs on the menu Plugin roots and `NfsSubmenu`, Aria's inputs on the Accordion, Tabs, and Orbit parts). A name is listed when, lowercased as an HTML document lowercases attribute names, it equals an attribute of the WHATWG index or of section 16 (208 names), or `role`, or starts with `aria-`. No input is named `valign`, `width`, `height`, `border`, `hidden`, `nowrap`, `clear`, `name`, `lang`, `dir`, `open`, `for`, `href`, `src`, `span`, `list`, `form`, `media`, `target`, or `tabindex`: the Utility attributes carry the `nfs` prefix (`nfsWidth`, `nfsFloat`, `nfsTextAlign`), and the Triggers' `target` fields are public as `nfsOpen`, `nfsToggle`, `nfsClose`. The Toggler reads a static `hidden` attribute to seed `isOpen` (`specs/toggler.md`), but has no input of that name.

Evidence codes: M1 to M4 (this file); W (WHATWG HTML as cited above: Rendering section ids, or the Index "Attributes" table for which elements an attribute applies to); A (Angular source); P (the named earlier ticket). "Nothing" means no presentational hint, no behaviour, and no Chromium accessibility-tree change for that attribute on that host, and no Foundation selector on it.

| # | Spec | Directive | Input (rendered as) | Hosts the spec allows | What the rendered static attribute does there | Evidence | Does the spec address it |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | menu | `NfsMenu` | `align` | `ul` | Chromium, WebKit: inherited `text-align` on the list, its items and links (`middle` centres; other values dropped); Firefox: nothing. Beside the `.align-*` class it moves text only in a vertical menu with `align="left"` in an RTL region of the LTR compile (Chromium, WebKit) | M1, M2, M2b, M3; Blink, WebKit source | Partly: line 248 says static input attributes render; D12 (line 426) weighs only the `alignment` collision; line 531 contradicts M2b for vertical menus |
| 2 | accordion-menu | `NfsAccordionMenu` (hosted `NfsMenu`) | `align` | `ul` | As row 1; measured: RTL `align="left"` moves item and submenu text 240 to 16 px (Chromium, WebKit) | M2, M2b | No |
| 3 | drilldown-menu | `NfsDrilldown` (hosted `NfsMenu`) | `align` | `ul` | As row 1; measured: RTL `align="left"` moves text 240 to 16 px | M2b | No |
| 4 | dropdown-menu | `NfsDropdownMenu` (hosted `NfsMenu`) | `align` | `ul` | As row 1; horizontal `.align-right`: every link, submenus included, computes `text-align: right`, nothing moves; without the class, submenu text moves 16 to 127 px | M2 | No |
| 5 | nested-menu | `NfsSubmenu` (hosted `NfsMenu`) | `align` | nested `ul` | As row 1, from the submenu down | M1, M3 | No |
| 6 | responsive-menu | `NfsResponsiveMenu` (through its roots) | `align` | `ul` | As row 1 | M3 (merged instance) | No |
| 7 | abide | `NfsAbideInput` | `aria-describedby` (alias of `userAriaDescribedBy`) | `input`, `textarea`, `select` | The ARIA description; intended: the host binding rewrites it with the consumer's ids and the visible error ids | cited | Yes (line 231) |
| 8 | abide | `NfsFormError` | `id` | any (`span`, `p`) | The element's id; intended | W | Yes, `[id]` (lines 253, 256) |
| 9 | accordion | `NfsAccordion` | `disabled` | any (`ul`) | No HTML meaning on `ul`; Foundation's `.accordion[disabled] .accordion-title { cursor: not-allowed }` applies | M4 | Yes: intended, `[attr.disabled]` from the input (line 124), which also removes a static `disabled="false"` |
| 10 | accordion | `NfsAccordionTitle` (Aria `AccordionTrigger`) | `disabled` | `button` | Native `disabled` would make the button unfocusable; Aria binds `[attr.disabled]` to `null` unless hard-disabled, so the static attribute is removed | A (Aria `accordion-trigger.ts` line 53) | Yes (line 231, soft-disabled) |
| 11 | accordion | `NfsAccordionTitle` (Aria) | `id` | `button` | Intended id | W | Yes (line 232) |
| 12 | accordion | `NfsAccordionContent` (Aria) | `id` | `div` | Intended id | W | Yes (line 233) |
| 13 | badge | `NfsBadge` | `color` | any (`span`) | Nothing (`color` is a hint only on `font` and `hr`) | W, M4 | Partly: rendered-HTML note (line 195) says it renders, no effect stated |
| 14 | breadcrumbs | `NfsBreadcrumbsItem` | `disabled` | `li` | Nothing: no HTML meaning on `li`, and Foundation styles `li.disabled`, not `li[disabled]` | M4 | Partly: line 231 lists `disabled=""` in the server HTML; line 144 "No attribute" |
| 15 | button | `NfsButton` | `disabled` | `button`, `a`, `input` | Native disabling on `button` and `input`, and Foundation's `.button[disabled]` look; intended; on `<a>` the binding writes `null` | W | Yes (line 182) |
| 16 | button | `NfsButton` | `type` | `button`, `input`; `a` | Native button type; intended `[attr.type]`; not written on `<a>` | W | Yes (line 181) |
| 17 | button | `NfsButton` | `size` | `button`, `a`, `input[type=submit\|button\|reset]` | Nothing (`size` applies to text-like inputs and `select`, and is a hint on `hr` and `font`) | W | Yes (line 543) |
| 18 | button | `NfsButton` | `color` | same | Nothing | W | Yes (line 543) |
| 19 | button-group | `NfsButtonGroup` | `size` | any (`div`) | Nothing | W | Yes (line 458) |
| 20 | button-group | `NfsButtonGroup` | `color` | any (`div`) | Nothing | W | Yes (line 458) |
| 21 | callout | `NfsCallout` | `color` | any (`div`, `aside`, `section`) | Nothing | W | Partly (line 202) |
| 22 | callout | `NfsCallout` | `size` | same | Nothing | W | Partly (line 202, general note) |
| 23 | close-button | `NfsCloseButton` | `size` | `button` | Nothing | W | No |
| 24 | close-button | `NfsCloseButton` | `type` | `button` | Native button type; intended `[attr.type]` | W | Yes (lines 128, 130) |
| 25 | dropdown | `NfsDropdownPane` | `id` | any (`div`) | Intended id, `[attr.id]` | W | Yes |
| 26 | dropdown | `NfsDropdownPane` | `role` | any (`div`) | The ARIA role; intended `[attr.role]` | cited | Yes |
| 27 | dropdown | `NfsDropdownPane` | `size` | any (`div`) | Nothing | W | Yes (line 374) |
| 28 | dropdown | `NfsDropdownPane` | `autoFocus` (`autofocus`) | any (`div`) | The pane is not focusable: nothing at load or inside a modal dialog, and a later `autofocus` still wins; it would act on a focusable host (`tabindex="-1"`) | M4 | Yes: bound form, dev check 6, D13 (lines 253, 281, 581) |
| 29 | flex-grid | `NfsColumn` | `size` | any (`div`) | Nothing | W | Yes (line 557) |
| 30 | float-grid | `NfsColumn` | `size` | any (`div`) | Nothing | W | Yes (line 586) |
| 31 | label | `NfsLabel` | `color` | any (`span`) | Nothing | W | Partly (line 204) |
| 32 | nested-menu | `NfsSubmenu` | `id` | nested `ul` | Intended id, `[id]` | W | Yes (line 251) |
| 33 | off-canvas | `NfsOffCanvas` | `autoFocus` (`autofocus`) | any (`aside`, `div`) | The panel is never focusable (line 237): nothing at load, and a later `autofocus` still wins; the spec's own example writes it static (line 661, `autoFocus="first-heading"`) | M4 | No |
| 34 | off-canvas | `NfsOffCanvas` | `content` | any | Never rendered: typed as an `NfsOffCanvasContent` reference (line 191), so only a binding compiles; `content` is `meta`'s | W | n/a |
| 35 | orbit | `NfsOrbit` | `autoPlay` (`autoplay`) | any (`div`) | Nothing (`autoplay` is `audio`'s and `video`'s) | W | No |
| 36 | orbit | `NfsOrbit` | `selected` | any (`div`) | Nothing (`option` only); the examples bind `[(selected)]` (line 577) | W, M4 | No |
| 37 | orbit | `NfsOrbitSlide` (Aria `TabPanel`) | `value` | `div` | Nothing | W | No |
| 38 | orbit | `NfsOrbitSlide` (Aria) | `id` | `div` | Intended id | W | Yes (line 205) |
| 39 | orbit | `NfsOrbitBullet` (Aria `Tab`) | `value` | `button` (`type="button"`) | A button's form value; a `type="button"` button submits nothing; accessibility tree unchanged; the examples bind `[value]` (line 375) | W, M4 | No |
| 40 | orbit | `NfsOrbitBullet` (Aria) | `id` | `button` | Intended id | W | Yes (lines 170, 211) |
| 41 | progress-bar | `NfsProgress` | `value` | any (`div`) | Nothing on `div` (`value` is `progress`'s, `meter`'s, `input`'s); the ARIA values come from `[attr.aria-valuenow]` | W, M4 | Partly (line 279) |
| 42 | progress-bar | `NfsProgress` | `min` | any (`div`) | Nothing | W, M4 | Partly (line 279) |
| 43 | progress-bar | `NfsProgress` | `max` | any (`div`) | Nothing | W, M4 | Partly (line 279 shows `max="12"`) |
| 44 | progress-bar | `NfsProgress` | `color` | any (`div`) | Nothing | W | Partly (line 279) |
| 45 | progress-bar | `NfsProgressElement` | `color` | `progress` | Nothing | W | Partly (line 279) |
| 46 | responsive-accordion-tabs | `NfsResponsiveAccordionTabs` | `rules` | `nfs-responsive-accordion-tabs` | Nothing (`rules` is an obsolete `table` attribute); examples write it static (lines 405, 421, 709) | W | No |
| 47 | responsive-accordion-tabs | `NfsResponsiveAccordionTabs` | `label` | same | Nothing (`label` is `option`'s, `optgroup`'s, `track`'s); the input feeds `aria-label` inside | W | No |
| 48 | responsive-accordion-tabs | `NfsResponsiveAccordionTabs` | `selected` | same | Nothing; example static `selected="team"` (line 709) | W | No |
| 49 | responsive-accordion-tabs | `NfsResponsiveAccordionTabsPanel` | `title` | `ng-template` | Never rendered: an `ng-template` becomes a comment node, so its attributes never reach the DOM | A | n/a |
| 50 | responsive-accordion-tabs | `NfsResponsiveAccordionTabsPanel` | `value` | `ng-template` | Never rendered | A | n/a |
| 51 | responsive-accordion-tabs | `NfsResponsiveAccordionTabsPanel` | `id` | `ng-template` | Never rendered; the value is forwarded to Aria's `id` on the rendered content | A | Yes (line 260) |
| 52 | reveal | `NfsReveal` | `id` | `dialog` | Intended id, `[attr.id]` | W | Yes (line 226) |
| 53 | reveal | `NfsReveal` | `role` | `dialog` | The ARIA role; `'alertdialog'` renders it, `'dialog'` renders none | cited | Yes (line 227) |
| 54 | reveal | `NfsReveal` | `size` | `dialog` | Nothing | W | Yes (line 400) |
| 55 | reveal | `NfsReveal` | `autoFocus` (`autofocus`) | `dialog` | On `showModal()`, Firefox and WebKit focus the dialog itself; Chromium focuses the first control | M4 | Yes: removed before every show (lines 258, 279; D12, line 605) |
| 56 | slider | `NfsSlider` | `start` | any (`div`) | Nothing (`start` is `ol`'s) | W | No |
| 57 | slider | `NfsSlider` | `step` | any (`div`) | Nothing on the container (`step` is `input`'s); the value reaches the handles' own `step` | W | No |
| 58 | slider | `NfsSlider` | `disabled` | any (`div`) | No platform meaning, but Foundation's `.slider[disabled] { opacity: 0.25; cursor: not-allowed }` matches, also when a static `disabled="false"` makes the input `false` | M4 | No: line 139 says `.slider[disabled]` "is not written" and "a `disabled` attribute on a `div` means nothing to the platform"; a static input attribute writes it |
| 59 | slider | `NfsSliderHandle` | `value` | `input[type=range]` | The native default value; intended `[attr.value]` | W | Yes (line 257) |
| 60 | slider | `NfsSliderHandle` | `disabled` | `input[type=range]` | Native disabling; intended `[attr.disabled]` | W | Yes (line 260) |
| 61 | slider | `NfsSliderHandle` | `readonly` | `input[type=range]` | HTML's `readonly` does not apply to a range input (ArrowRight still changes the value; no read-only state in the accessibility tree), but Foundation's `input[readonly]` paints `#e6e6e6` with `cursor: not-allowed` | M4 | Partly: line 233 covers the platform, not Foundation's selector |
| 62 | switch | `NfsSwitch` | `size` | any (`div`) | Nothing | W | Yes (line 253) |
| 63 | tabs | `NfsTabs` | `selected` (model) | `ul` | Nothing; example static `selected="security"` (line 633) | W, M4 | Partly (line 376, general note) |
| 64 | tabs | `NfsTabs` | `autoFocus` (`autofocus`) | `ul` | Nothing: the list is not focusable, and a later `autofocus` still wins | M4 | No |
| 65 | tabs | `NfsTab` (Aria `Tab`) | `value` | `a` | Nothing; accessibility tree unchanged | W, M4 | Partly (line 376 names `value="..."`) |
| 66 | tabs | `NfsTab` (Aria) | `id` | `a` | Intended id | W | Yes |
| 67 | tabs | `NfsTabsPanel` (Aria `TabPanel`) | `value` | any (`div`) | Nothing | W | Partly (line 376) |
| 68 | tabs | `NfsTabsPanel` (Aria) | `id` | any (`div`) | Intended id | W | Yes |
| 69 | toggler | `NfsToggler` | `id` | any | Intended id, `[attr.id]` | W | Yes (line 185) |
| 70 | toggler | `NfsClassToggler` | `id` | any | Intended id | W | Yes (line 202) |
| 71 | top-bar | `NfsMenuIcon` | `type` | `button` | Native button type; intended `[attr.type]` | W | Yes (line 184) |
| 72 | xy-grid | `NfsCell` | `size` | any (`div`) | Nothing | W | Yes (line 586) |

Totals: 72 inputs in 29 specs. By what the rendered attribute does:

- A presentational hint that draws: 6 (rows 1 to 6, `align`, Chromium and WebKit only).
- A Foundation look through an attribute selector: 3 (row 9, intended and bound; row 58, not addressed; row 61, partly addressed). Row 15 has one too, bound.
- A platform behaviour on the host: 4 (`autofocus`, rows 28, 33, 55, 64); only row 55 acts, and its spec removes the attribute.
- An intended native or ARIA attribute that the directive (or the Aria directive it hosts) also binds: 22 (rows 7, 8, 10, 11, 12, 15, 16, 24, 25, 26, 32, 38, 40, 52, 53, 59, 60, 66, 68, 69, 70, 71).
- Nothing on the hosts the spec allows: 33 (rows 13, 14, 17 to 23, 27, 29 to 31, 35 to 37, 39, 41 to 48, 54, 56, 57, 62, 63, 65, 67, 72).
- Never rendered: 4 (rows 34, 49, 50, 51).

What the specs say, from the last column: 36 rows fully addressed, 15 partly (most by a general "static input attributes render" note that states no effect), 18 not at all, 3 n/a (never rendered). Among the 18, the rows with a measured effect are the five hosting specs' `align` (rows 2 to 6) and the Slider container's `disabled` (row 58); the Off-canvas and Tabs `autoFocus` rows (33, 64) render an `autofocus` that measured to do nothing on their hosts. The six `align` rows are the only presentational hints; `size` and `color` (17 rows) are presentational only on `hr`, `font` and, for `size`, on text-like `input` and `select`, which no spec lets them sit on.

## Options for the Menu's `align`

### Names in use for alignment-like inputs

| Name | Where (public input) | Values and what it sets |
| --- | --- | --- |
| `align` | `NfsMenu`; exposed by `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, `NfsResponsiveMenu` (through its roots), `NfsSubmenu` | `'left' \| 'right' \| 'center'`: `.align-left`, `.align-right`, `.align-center`; also turns the dropdown Base side (`opens-left`) and the Accordion Menu's and Drilldown's arrows |
| `alignment` | `NfsDropdownMenu` (`'auto' \| 'left' \| 'right'`, the opening side, Foundation's `data-alignment`), and therefore on `NfsResponsiveMenu`; `NfsDropdownPane` and `NfsTooltip` (`NfsAlignment \| 'auto'`, `'top' \| 'bottom' \| 'left' \| 'right' \| 'center'`, the Positioner's alignment); `NfsMediaObjectSection` (`'middle' \| 'bottom'`) | Foundation's `alignment` Options, and the Media Object's renamed `align` |
| `alignX`, `alignY`, `alignCenterMiddle` | `NfsFlexAlign`, hosted by `NfsFlexContainer` (Flexbox Utilities) | `alignX`: `'left' \| 'right' \| 'center' \| 'justify' \| 'spaced'`, the `.align-*` classes, the same class names as the Menu's; its D7 lets `nfsFlexAlign` sit on a menu for `justify`, `spaced`, `alignY`, and `alignCenterMiddle` and warns for the Menu's three names |
| `alignSelf` | `NfsFlexChild` | `.align-self-*` |
| `nfsTextAlign` | `NfsTextAlignment` (Typography Helpers) | `.text-*` alignment classes |
| `nfsFloat` | `NfsFloatClasses` | `.float-left`, `.float-right`, `.float-center` |
| `position`, `iconPosition`, `stickTo`, `orientation` | `NfsDropdownPane`, `NfsTooltip`, `NfsOffCanvas` (`position`); `NfsMenu` (`iconPosition`, `orientation`); `NfsSticky` (`stickTo`); `NfsTabs` (`orientation`) | sides and directions, not alignment classes |

Names considered and rejected elsewhere for the same reason or a related one: `align` for the Media Object section ([Spec: Media Object](../issues/91-spec-media-object.md) D3), for the Float Classes' placements, and for the Typography Helpers' alignment ([Spec: Float Classes](../issues/105-spec-float-classes.md), [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)); `nfsAlign` in both of those; `align` with `alignY` for the Flexbox Utilities (`specs/flexbox-utilities.md` line 394, "an asymmetric pair"); an `align` input on the Button Group, the Pagination, and the Forms label (a second owner of Utility classes).

Inputs on the `ul` of `nfsDropdownMenu`: its own `alignment`, `disableHover`, `hoverDelay`, `closingTime`, `autoclose`, `closeOnClick`, `closeOnClickInside`, and the hosted Menu's `orientation`, `expanded`, `simple`, `align`, `iconPosition`. On `nfsResponsiveMenu` also `nfsResponsiveMenu`, `multiOpen`, `autoHeight`, `animateHeight`, `scrollTop`, `scrollTopElement`, `scrollTopOffset`. Written beside on the same `ul` by other specs: `nfsMenu` itself (the Menu's D5: the template match wins and exposes every Menu input), `nfsFlexAlign` (`alignX`, `alignY`, `alignCenterMiddle`), and on plain menus `nfsSmoothScroll` (no inputs) and `nfsMagellan` (`threshold`, `deepLinking`, `updateHistory`, `ariaCurrentWhenActive`, `active`). So among existing names, `alignment` collides on `nfsDropdownMenu` and `nfsResponsiveMenu`, and `alignX` collides wherever `nfsFlexAlign` is written beside a menu; the other names above collide with nothing on these elements.

Every Menu-family spec writes the static form in examples, stories, and tests: `align="..."` appears in `menu.md` (8 lines), `dropdown-menu.md` (14), `responsive-menu.md` (10), `nested-menu.md` (9), `drilldown-menu.md` (3), and `accordion-menu.md` (2). Lines naming the Menu's `align` input at all: `dropdown-menu.md` 33, `nested-menu.md` 30, `menu.md` 24, `responsive-menu.md` 17, `drilldown-menu.md` 11, `accordion-menu.md` 10, `flexbox-utilities.md` 8, `anchored-pane.md` 1; outside `specs/`, `building-blocks.md` 7, `map.md` 8, ADR 0041 2, `CONTEXT.md` 1 (counted by pattern; a few are prose about other families).

### Option 1: keep `align`, add `'[attr.align]': 'null'` to `NfsMenu`

- Measured (M3): the static attribute is absent from the server HTML and from first paint for every shape the family uses (direct, hosted by a root, hosted through two roots with one merged instance, submenu), in `@defer`, incremental hydration, and `hydrate never`; the input still receives the value and the root's `align()` read (the Base side) still works. Hydration re-adds it in the creation pass and removes it in the first update pass; in 63 re-add moments (210 element re-adds) no rendering update showed it (zoneless Angular 22.2, three engines, development and production builds).
- One binding in `NfsMenu` covers every host, because every root and `NfsSubmenu` host `NfsMenu` and `nfsMenu` written beside is the same directive.
- A consumer's own `[attr.align]` loses the first pass and wins later changes (M3 result 5).
- Cited precedents: Angular Material's MatDrawer, MatSidenav, and MatHint (the same binding for an `align` input, since 2016); Angular Aria's accordion trigger (`[attr.disabled]` to `null`); the library's Button (`[attr.disabled]` `null` on `<a>`, "which also removes a static `disabled`").
- Spec text it touches: the Menu's host line (`specs/menu.md` line 169, "No attribute, no listener") and its Rendered HTML note (line 248); nothing in the hosting specs' examples changes. The name stays the one D12 chose and the one the five hosting specs, the Flexbox Utilities, ADR 0041, and building-blocks already use.
- Not settled by the measurements: a building-blocks 1.4 rule "never name an input after a presentational attribute" would not be met by the name, only by its rendering.

### Option 2: keep `align` and document the bound form `[align]`

- Measured (M3c): `[align]="'right'"` renders no attribute anywhere. The static form keeps rendering (M1, M2, M2b, M3).
- Precedent: the Dropdown's D13 for `autoFocus` (bound form or Defaults token, and a development warning for a static attribute read through `HostAttributeToken`, dev check 6). A development warning is not seen by production users; a production page with the static form keeps the attribute.
- Spec text it touches: every static `align="..."` in the six Menu-family specs (46 lines) and the Menu's Rendered HTML; ADR 0041, building-blocks, and map lines naming `align` stay.
- The measured visible consequence of a missed static form: in Chromium and WebKit, the computed `text-align` of every item changes, and text moves only in a vertical menu with `align="left"` in an RTL region of the LTR compile (M2b); nothing in Firefox.

### Option 3: rename the input

- To `alignment`: collides on `nfsDropdownMenu` and `nfsResponsiveMenu` with the Dropdown Menu's opening side (M3d: `alignment="auto"` and `alignment="center"` fail to compile under strict templates; `left` and `right` reach both inputs, so `alignment="right"` would set both the Menu's `.align-right` and the opening side). Exposing it on the roots under an alias compiles (M3d) but gives one Menu input two names across hosts, and fails again when `nfsMenu` is written beside a root, which the Menu's D5 allows (M3d). This is the reason the Menu's D12 chose `align`.
- To `alignX`: matches the Flexbox Utilities' name for the same `.align-*` class names, but collides with `nfsFlexAlign`, which that spec allows beside `nfsMenu` for `justify` and `spaced` (M3d: `alignX="justify"` fails to compile against the Menu's type; `alignX="right"` reaches both, and the Flexbox Utilities' dev check 4 warns about exactly that pairing).
- To a name used nowhere else (for example `itemAlignment`, `menuAlignment`): no collision on any element the inventory lists; no HTML attribute of that name (lowercased: `itemalignment`, `menualignment`). Edit surface: the counts above (about 134 lines in eight specs, plus ADR 0041, building-blocks, `CONTEXT.md`, and `map.md`); the name is not Foundation's (Foundation's is the class template `.align-*`, not a `data-*` Option), so building-blocks 1.4's naming order applies.
- Any rename leaves the attribute question of the other 66 audit rows unchanged.

### Measured facts that hold for every option

- Firefox never styles `align` on `ul` (M1), so all visible consequences are Chromium's and WebKit's.
- With the `.align-*` class present, which the input always sets, the only measured visible change is M2b's; Foundation's flexbox `.align-right li { display: flex }` and its float build's `.submenu li { text-align: left }` hide the inherited value elsewhere.
- The accessibility tree does not change with `align` in Chromium (M4).

## Open questions

1. Whether the hydration window (result 3 of M3) can ever be drawn in other scheduling setups: measured only for zoneless Angular 22.2 with the default scheduler (63 re-add moments, none drawn). An application on `provideZoneChangeDetection` or with a custom scheduler was not measured.
2. Firefox's `align` mapping was measured, not traced in its source; the Blink and WebKit sources are their main branches, not the tested builds' exact revisions.
3. Visible effects were measured on text positions and computed styles; no screenshot comparison was made, and only Chromium's accessibility tree was read (no VoiceOver or NVDA run).
4. Row 61: the Slider spec's own styling of the handle was not built, so whether Foundation's `input[readonly]` background shows through the library's slider was not measured, only on a bare range input.
5. Rows 46 to 48: whether any assistive technology reads a `label` attribute on a custom element was not tested (Chromium ignores it for naming, as for every row measured in M4).
6. Whether WebKit and Blink will drop the non-standard `align` mapping for elements the standard does not list: no signal found either way.

## Correction, 2026-09-28 (row 64)

From the panel of [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md), measured by both lenses (`research/presentational-attribute-lens-api.md` X2; `research/presentational-attribute-lens-adversarial.md` X1, X1b, X1c). Row 64 is wrong: `ul[nfsTabs]` is focusable, because the hosted Aria `TabList` binds `tabindex="-1"` in its default roving mode (`specs/tabs.md` lines 316 and 380). M4's `ul autofocus` case used a bare `ul` without `tabindex`. With the host as the Tabs spec renders it, a static `autoFocus`, and `autoFocus="false"` too, focuses the `tablist` at page load and scrolls the page to it in Chromium, Firefox, and WebKit; without the attribute focus stays on `body`. In client rendering the list is focused even when the attribute is removed in the same task, in a microtask, or in the next animation frame, and in WebKit even after a script has focused the selected tab before the rendering update. Adding the attribute to a list already in the document focuses nothing. Read row 64's "What the rendered static attribute does there" cell as "The list carries Aria's `tabindex="-1"`, so the browser focuses the `tablist` at page load and scrolls to it, whatever the value; in client rendering it takes the list as an autofocus candidate at insertion, before any binding can remove the attribute", with evidence "M4 as corrected here" and "No" in the last column. The statements that follow from the row change with it: the Headline's "four render `autofocus`, which acts only on the Reveal's `dialog`" and the Totals' "only row 55 acts" read "rows 55 and 64 act", and the last Totals paragraph's "the Off-canvas and Tabs `autoFocus` rows (33, 64) render an `autofocus` that measured to do nothing on their hosts" reads "the Off-canvas row (33) renders an `autofocus` that measured to do nothing on its host, and the Tabs row (64) one that focuses the strip". Rows 28 and 33 stand: neither host gets a `tabindex`.
7. M2's WebKit dropdown scenarios opened submenus through Foundation's `_show` because Playwright's hover did not reach Foundation's handlers there; the layout read afterwards is the same code path, but the hover path itself was not exercised in WebKit.
