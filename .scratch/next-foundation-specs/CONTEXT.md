# ngx-foundation-sites (next)

An Angular directive library that keeps Foundation for Sites 6.9's Sass and CSS class contract and replaces every Foundation JavaScript plugin with Angular directives (components only where Foundation generated structure). This glossary is the shared language for the building-blocks map, the ADRs, and the 26 specs.

## Language

### Foundation side

**Plugin**:
One of Foundation 6.9's 21 JavaScript behaviours (Accordion, Reveal, Orbit, and so on), identified by its `data-<plugin>` attribute, that the library replaces.
_Avoid_: widget, module, component (for the Foundation thing)

**CSS-only component**:
A Foundation component that ships Sass and classes but no Plugin, such as Button, Button Group, Close Button, or Callout.
_Avoid_: static component, plain component, pure-CSS widget

**Structural class**:
A Foundation CSS class that names an element of a Plugin's or a CSS-only component's markup (`.accordion-item`, `.dropdown-pane`, `.orbit-slide`, `.button`).
_Avoid_: layout class, block class, container class

**Handle**:
A native `<input type="range">` inside a Slider that carries one of its values; the library's replacement for Foundation's `.slider-handle` span.
_Avoid_: thumb (the draggable part a Handle draws), slider input, knob

**Bar position**:
Where a value sits along a Slider's track, as a fraction from its start; equal to the value's share of the range except on a non-linear Slider, whose Handles carry it natively.
_Avoid_: percentage, pctOfBar, offset

**Watched element**:
An element whose height an Equalizer matches to the tallest element of its row; the replacement for Foundation's `data-equalizer-watch` element.
_Avoid_: watch, equalized item, equalizer child

**State class**:
A Foundation CSS class that expresses runtime state on an element (`.is-active`, `.is-open`, `.is-stuck`, `.is-closing`, `.js-dropdown-active`), as opposed to a Structural class.
_Avoid_: modifier, flag class, status class

**Variant class**:
A Foundation CSS class that selects a static look for a Structural class (`.small`, `.alert`, `.hollow`, `.expanded`, `.dropdown` on `.button`), as distinct from a State class, which expresses runtime state.
_Avoid_: modifier, appearance class, style class

**Visibility class**:
A Foundation CSS class that shows or hides an element by breakpoint of the Breakpoint map (`.show-for-medium`, `.hide-for-large`, `.show-for-small-only`), generated only for the breakpoints in `$breakpoint-classes`; distinct from a State class, which expresses runtime state.
_Avoid_: responsive class, breakpoint class, visibility helper

**Revealed panel**:
An off-canvas panel shown as a permanent sidebar at and above its `revealOn` breakpoint by Foundation's `.reveal-for-<bp>` class; distinct from the Reveal plugin.
_Avoid_: open panel, docked panel, persistent drawer, revealed modal

**In-canvas panel**:
An off-canvas panel rendered as a normal page element at and above its `inCanvasOn` breakpoint by Foundation's `.in-canvas-for-<bp>` class.
_Avoid_: inline panel, static off-canvas, docked panel

**Option**:
A Plugin's `data-*` configuration attribute in Foundation, and its counterpart in the library.
_Avoid_: setting, config, parameter, data attribute (when meaning the input)

**Dropped option**:
An Option with no counterpart in the library, because it exists only for jQuery or HTML-string injection, or because the platform mechanism the library uses cannot honour it (Sticky's anchors).
_Avoid_: unsupported option, removed feature, legacy option

**Sticky range**:
The stretch of scrolling during which a Sticky element can be stuck: the box of its parent element (the sticky container), which is its containing block; the replacement for Foundation's anchor Options.
_Avoid_: anchor range, sticky zone, scroll range

**Motion class**:
A CSS animation class name given to a Plugin's animation Option (`animationIn`, `animationOut`, `animate`), either one of Foundation's Motion UI names or the consumer's own.
_Avoid_: Motion UI transition, mui class, animation name

**Breakpoint map**:
Foundation's named viewport breakpoints (`small`, `medium`, `large`, `xlarge`, `xxlarge`) with their minimum widths, one set shared by the library and the consumer's Sass `$breakpoints`.
_Avoid_: media query list, screen sizes, `Breakpoints` (the CDK constants)

**Breakpoint rule**:
A Foundation rule string such as `drilldown medium-dropdown` or `accordion medium-tabs` that assigns a mode per breakpoint.
_Avoid_: responsive config, mode map, query string

**Zero breakpoint**:
The breakpoint of the Breakpoint map whose minimum width is 0 (`small` in Foundation's defaults); a Breakpoint rule mode written without a breakpoint applies from it, and it is the default Server breakpoint.
_Avoid_: base breakpoint, mobile breakpoint, default breakpoint

**Breakpoint query**:
An Option value that names a breakpoint with an optional `up`, `only`, or `down` modifier (`medium`, `large only`, `medium down`), as in Tooltip `showOn` or Sticky `stickyOn`; distinct from a Breakpoint rule, which assigns modes.
_Avoid_: media query (for this), breakpoint string, size

**Named query**:
A media query addressed by a name that is not a breakpoint (`landscape`, `portrait`, `retina`, or the consumer's own), used in Interchange rules.
_Avoid_: special query (Foundation's code name), custom breakpoint

**Interchange rule**:
A `[content, query]` pair of Interchange, whose query is a breakpoint name, a Named query, or a media query; in a list of them the last matching one applies.
_Avoid_: breakpoint rule (which assigns modes), responsive source, interchange query

**Export mixin**:
A Foundation Sass mixin that prints one component's CSS (`foundation-accordion`, `foundation-reveal`), included by the consumer and compiled from the consumer's settings.
_Avoid_: Foundation styles, component mixin

### Angular side

**Directive-first**:
The rule that a Plugin becomes attribute directives on the markup the consumer writes; a component is the exception for structure Foundation generated.
_Avoid_: headless, unstyled, wrapper-less

**Wrapper component**:
A component on a consumer-written Foundation element (`[nfsAccordionContent]`) that adds one inner element around the projected content because the element's CSS needs it.
_Avoid_: panel component, content component, shell

**Implementation level**:
Which of native platform, `@angular/aria`, `@angular/cdk`, or custom Angular a Plugin is built on, taken in that order.
_Avoid_: tier, layer, strategy, stack, rung

**Browser target**:
The Baseline widely-available browser set on 2026-05-07 (Chrome, Edge, Firefox 119; Safari 17) that decides whether a platform feature may be used without a fallback.
_Avoid_: browserslist, support matrix, compat target

**Trigger**:
An element that opens, closes, or toggles an Openable; the replacement for Foundation's `data-open`/`data-close`/`data-toggle`.
_Avoid_: anchor (Foundation's word), opener, invoker, toggler (which is the Toggler plugin)

**Openable**:
Anything a Trigger can open, close, or toggle and whose open state (`isOpen`) it can read: Reveal, OffCanvas, Dropdown pane, Toggler, ResponsiveToggle, Tooltip.
_Avoid_: target, controllee, panel (in the generic sense), disclosure (when meaning the contract)

**Nearest Openable**:
The closest Openable that encloses a Trigger in the template where the Trigger is declared, which a Trigger written without a target acts on; the replacement for Foundation's bubbling empty `data-close`.
_Avoid_: parent Openable, ancestor target, bubbling target

**Trigger role**:
What an Openable declares its Triggers to be (disclosure, dialog opener, modal dialog opener, toggle button, or plain command), which decides the ARIA each Trigger renders.
_Avoid_: trigger type, ARIA mode, popup type

**Rotation control**:
The button that stops and starts an Orbit's automatic slide rotation and precedes the slides, which the APG carousel pattern requires and Foundation lacks.
_Avoid_: pause button, play button, autoplay toggle

**Visibility mode**:
The Toggler form that shows and hides its element, optionally with Motion classes, and whose Triggers are disclosure buttons; the replacement for `data-toggler` with `data-animate`.
_Avoid_: animate mode, disclosure mode, hide mode

**Class mode**:
The Toggler form that adds and removes a class named by `toggler` on its element, and whose Triggers are toggle buttons; the replacement for `data-toggler=".class"`.
_Avoid_: toggle-class mode, CSS mode, active mode

**Modal mode**:
The OffCanvas configuration with `trapFocus` and an overlay present, in which the panel is a modal dialog and the page content is inert; every other configuration is a disclosure.
_Avoid_: overlay mode, trap mode, dialog mode

**Light dismiss**:
Closing an Anchored pane, an open submenu, or a non-modal Reveal on an outside pointer press, on Escape, when focus moves outside it, or when a sibling of the same kind opens; the replacement for Foundation's `closeme.zf.*` broadcast and body click handlers.
_Avoid_: click-outside, closeme, auto-close, Backdrop press (which is a modal Reveal's)

**Scroll lock**:
Keeping the page behind an open modal Reveal from scrolling, as Foundation's `html.is-reveal-open` rule does.
_Avoid_: body lock, scroll blocking, block scroll strategy (CDK's)

**Backdrop press**:
A pointer press that starts and ends on a modal Reveal's `::backdrop`, which closes it when `closeOnClick` is on; distinct from Light dismiss, which non-modal content uses.
_Avoid_: overlay click, outside click, backdrop click

**Anchored pane**:
An element placed against its Trigger inside the page flow rather than in an overlay: the Dropdown pane and the Tooltip tip.
_Avoid_: overlay, popover, popup, floating element, connected overlay

**Tip**:
The `.tooltip` element whose text describes a Tooltip's host; distinct from the Tooltip Plugin and from the host that triggers it.
_Avoid_: bubble, popup, tooltip element, template, overlay

**Positioner**:
The shared piece that places an Anchored pane against its Trigger using Foundation's placement rules.
_Avoid_: position strategy, tether, floating-ui, overlay position

**Placement**:
One of the 12 pairs of a position (the side of its Trigger an Anchored pane sits on) and an alignment (the edge or centre that lines up), such as `bottom-left` or `top-center`, that the Positioner resolves.
_Avoid_: position (alone, which is one half), side, orientation, anchor point

**Collision bound**:
The box an Anchored pane's Placement must fit inside for the Positioner to accept it: the body box at the current scroll offset by default, as in Foundation, or a chosen ancestor.
_Avoid_: viewport (which it is not), window, boundary box, container

**Hover region**:
The Triggers of a hover-opened Anchored pane together with the pane itself; the pane stays open while the pointer is anywhere over it.
_Avoid_: hover area, hot zone, hover target

**Nested menu**:
The shared behaviour behind every menu Plugin's nested `ul.menu` markup, varied by Menu mode; the replacement for Foundation's Nest utility.
_Avoid_: Nest, feathered menu, submenu tree, menu tree

**Menu mode**:
Which nested-menu behaviour a menu root has: `accordion`, `drilldown`, or `dropdown`; ResponsiveMenu switches it per breakpoint.
_Avoid_: menu type, plugin type, variant, strategy

**Mode swap**:
A responsive Plugin's change of mode when its Breakpoint rule resolves to another mode: a class and key change on the same nodes for the menu Plugins, a structural re-render of its own template for ResponsiveAccordionTabs, the one ADR 0008 accepts.
_Avoid_: mode switch, re-init, re-render (bare), toggle

**Disclosure navigation**:
The APG navigation pattern built from native lists, buttons that show and hide submenus, and `aria-current`, with no menu or tree roles; every menu Plugin implements it.
_Avoid_: menubar, ARIA menu, navigation tree, mega menu

**Hybrid item**:
A menu item whose parent both navigates, through its link, and opens its submenu, through a separate toggle button beside it.
_Avoid_: split button, submenu toggle item, parent link

**Open path**:
The chain of open submenus from a menu root down to the innermost open one; Drilldown and DropdownMenu keep at most one per level, and a Menu mode swap keeps the one that holds focus.
_Avoid_: active branch, breadcrumb, trail

**Drilldown level**:
One list of a Drilldown, the root list or a submenu, shown alone in the Drilldown wrapper while it is the innermost open list.
_Avoid_: panel, pane, screen, page, current menu

**Drilldown wrapper**:
The consumer-written element around a Drilldown's root list that clips the Drilldown levels and carries their measured height; the replacement for Foundation's generated `div.is-drilldown`.
_Avoid_: wrapper component (which adds an element inside a component), container, viewport

**Base side**:
The side, left or right, toward which a dropdown-mode submenu opens before the collision check moves it; set by `alignment`, Foundation's `align-right`, a `.top-bar-right` ancestor, and the reading direction.
_Avoid_: alignment (the Option), default side, opening direction

**Tab group**:
The element that encloses one tab list and all of its panels, which the library requires as their common ancestor because Foundation writes the tab strip and the content box as siblings.
_Avoid_: tabs container, tabs wrapper, tab set (for the element)

**Current section**:
The section a Magellan navigation marks as the one the reader is in, at most one per navigation; its links carry `.is-active` and `aria-current`, and Magellan's `active` holds its id.
_Avoid_: active target, active link (the link is marked; the section is current), scroll-spy item

**Activation line**:
The line, `threshold` pixels below where a section lands when scrolled to, that the section's top edge must pass for it to become the Current section; the replacement for Foundation's Magellan "points".
_Avoid_: threshold (the Option), marker, point, trigger line

**Lazy content**:
Panel, tab, or slide content that renders when first shown and, unless preserved, is removed once hidden again; distinct from a consumer's `@defer` block, which loads code.
_Avoid_: deferred content (ambiguous with `@defer`), lazy panel, on-demand content

**Defaults token**:
The per-Plugin set of application-wide defaults for its Options; the replacement for `Foundation.X.defaults`.
_Avoid_: config token, options token, global options, `MAT_*_DEFAULT_OPTIONS`

**Error-state policy**:
The rule that decides when a field's validation errors are shown (after a committed change, while typing, after leaving the field, or after a submit), as opposed to whether the field is invalid.
_Avoid_: validation mode, error matcher, validateOn (as the name of the whole rule)

**Form error**:
A consumer-written message element (`.form-error`) tied to one field and, optionally, to one error kind, shown only while that field's errors are shown.
_Avoid_: error message (bare), inline error, hint (which is `.help-text`)

**Form alert**:
The one form-level message (Foundation's `[data-abide-error]` box) shown while a submitted form is invalid.
_Avoid_: global error, error summary, abide error

**Completion output**:
A past-tense output (`opened`, `closed`, Sticky's `stuck`, whose state signal is `isStuck`) emitted once a state change is committed and its animation has finished; the replacement for Foundation's `*.zf.*` events.
_Avoid_: event (bare), callback, hook, start event

**Breakpoint service**:
The shared piece that answers which breakpoint of the Breakpoint map the viewport is at, and whether the user asked for reduced motion; the replacement for Foundation's MediaQuery utility.
_Avoid_: MediaQuery (Foundation's name), breakpoint observer, media service

**Server breakpoint**:
The breakpoint the library assumes while rendering on the server or prerendering, and on the client until its first render completes (the Zero breakpoint by default), so server HTML is deterministic and hydrates unchanged.
_Avoid_: SSR default, fallback breakpoint, mobile default

**Rendering modes**:
The set every directive must support and every spec must describe: client rendering, server-side rendering, prerendering, full hydration, incremental hydration through `@defer (hydrate on ...)`, event replay, and plain `@defer`.
_Avoid_: SSR support (as the whole set), hydration mode, universal

**Dehydrated state**:
What a directive looks like as server HTML before hydration or inside an unhydrated block: Foundation classes, State classes, ARIA, `inert`, and `hidden`, with no JavaScript behaviour yet.
_Avoid_: static render, placeholder (which is `@placeholder`)

**Hydration boundary**:
The unit a widget and its Triggers must share: the whole page under full hydration, or one `@defer (hydrate on ...)` block.
_Avoid_: defer boundary, island, hydration zone

**Replay guard**:
The rule that a Replayed key event an Aria-hosted widget has handled stops at that widget's container and is not handled again by an outer widget.
_Avoid_: replay fix, stop guard, key shield

**Pre-hydration input**:
A value the user typed, checked, or selected in a server-rendered control before hydration, which hydration overwrites unless the directive adopts it.
_Avoid_: lost input, early input, queued value

**Replayed event**:
A user event fired before hydration that reaches a library handler late, once its Hydration boundary hydrates; the reason every library handler changes state before it calls `preventDefault()`.
_Avoid_: queued click, pre-hydration event, captured event

**Browser-level test**:
The test layer that renders a directive under Angular's TestBed in a real browser, outside Storybook, for the logic no story reaches.
_Avoid_: unit test (for this layer), component test, Playwright component test, Vitest Browser (as the layer name)

**Story id**:
Storybook's id of a story, `<plugin>--<story>`, where `<plugin>` is the secondary entry point folder name; a spec's play functions and its Playwright e2e tests address the same story by it.
_Avoid_: story name, test id, scenario

**Anti-pattern story**:
A story that renders markup the library tells consumers not to write, to show why; the only story allowed to switch off Accessibility gate rules, and only the ones it demonstrates.
_Avoid_: bad example, negative story, a11y exception

**Accessibility gate**:
The story-level axe run with the WCAG 2.2 AA tags that fails a story on any violation; the check that enforces the library's accessibility requirement.
_Avoid_: a11y check, axe run (as the name), lint

**Fixture app**:
The prerendered Angular application, one route per Plugin, that the Playwright e2e layer drives to test the Rendering modes.
_Avoid_: demo app, kitchen sink, SSR app, universal app

**Library mixin**:
A mixin of the library's Sass (`nfs-accordion`, `nfs-motion`) that prints only the documented custom CSS Foundation cannot provide, reusing the consumer's Foundation settings and mixins in the same compile; included after the matching Export mixin.
_Avoid_: `_nfs-<plugin>.scss`, custom stylesheet, theme mixin

**Breakpoint properties**:
The `--nfs-breakpoint-<name>` custom properties on `:root`, in px, that mirror the Sass `$breakpoints` the consumer compiles Foundation with, and that the Breakpoint service's drift check compares with the Breakpoint map.
_Avoid_: breakpoint variables, CSS breakpoints, breakpoint tokens
