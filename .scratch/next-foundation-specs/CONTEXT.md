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

**State class**:
A Foundation CSS class that expresses runtime state on an element (`.is-active`, `.is-open`, `.is-stuck`, `.is-closing`, `.js-dropdown-active`), as opposed to a Structural class.
_Avoid_: modifier, flag class, status class

**Variant class**:
A Foundation CSS class that selects a static look for a Structural class (`.small`, `.alert`, `.hollow`, `.expanded`, `.dropdown` on `.button`), as distinct from a State class, which expresses runtime state.
_Avoid_: modifier, appearance class, style class

**Option**:
A Plugin's `data-*` configuration attribute in Foundation, and its counterpart in the library.
_Avoid_: setting, config, parameter, data attribute (when meaning the input)

**Dropped option**:
An Option that exists only because of jQuery or HTML-string injection and has no counterpart in the library.
_Avoid_: unsupported option, removed feature, legacy option

**Motion class**:
A CSS animation class name given to a Plugin's animation Option (`animationIn`, `animate`, `animInFromRight`), either one of Foundation's Motion UI names or the consumer's own.
_Avoid_: Motion UI transition, mui class, animation name

**Breakpoint map**:
Foundation's named viewport breakpoints (`small`, `medium`, `large`, `xlarge`, `xxlarge`) with their minimum widths, one set shared by the library and the consumer's Sass `$breakpoints`.
_Avoid_: media query list, screen sizes, `Breakpoints` (the CDK constants)

**Breakpoint rule**:
A Foundation rule string such as `drilldown medium-dropdown` or `accordion medium-tabs` that assigns a mode per breakpoint.
_Avoid_: responsive config, mode map, query string

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

**Light dismiss**:
Closing an Anchored pane or an open submenu on an outside pointer press, on Escape, or when a sibling of the same kind opens; the replacement for Foundation's `closeme.zf.*` broadcast and body click handlers.
_Avoid_: click-outside, closeme, auto-close, backdrop click (which is Reveal's)

**Anchored pane**:
An element placed against its Trigger inside the page flow rather than in an overlay: the Dropdown pane and the Tooltip tip.
_Avoid_: overlay, popover, popup, floating element, connected overlay

**Positioner**:
The shared piece that places an Anchored pane against its Trigger using Foundation's placement rules.
_Avoid_: position strategy, tether, floating-ui, overlay position

**Nested menu**:
The shared behaviour behind every menu Plugin's nested `ul.menu` markup, varied by Menu mode; the replacement for Foundation's Nest utility.
_Avoid_: Nest, feathered menu, submenu tree, menu tree

**Menu mode**:
Which nested-menu behaviour a menu root has: `accordion`, `drilldown`, or `dropdown`; ResponsiveMenu switches it per breakpoint.
_Avoid_: menu type, plugin type, variant, strategy

**Disclosure navigation**:
The APG navigation pattern built from native lists, buttons that show and hide submenus, and `aria-current`, with no menu or tree roles; every menu Plugin implements it.
_Avoid_: menubar, ARIA menu, navigation tree, mega menu

**Lazy content**:
Panel, tab, or slide content that renders only while it is shown; distinct from a consumer's `@defer` block, which loads code.
_Avoid_: deferred content (ambiguous with `@defer`), lazy panel, on-demand content

**Defaults token**:
The per-Plugin set of application-wide defaults for its Options; the replacement for `Foundation.X.defaults`.
_Avoid_: config token, options token, global options, `MAT_*_DEFAULT_OPTIONS`

**Completion output**:
A past-tense output (`opened`, `closed`, Sticky's `stuck`, whose state signal is `isStuck`) emitted once a state change is committed and its animation has finished; the replacement for Foundation's `*.zf.*` events.
_Avoid_: event (bare), callback, hook, start event

**Server breakpoint**:
The breakpoint the library assumes while rendering on the server or prerendering (`small` by default), so server HTML is deterministic.
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

**Replayed event**:
A user event fired before hydration that reaches a library handler late, once its Hydration boundary hydrates; the reason every library handler changes state before it calls `preventDefault()`.
_Avoid_: queued click, pre-hydration event, captured event

**Browser-level test**:
The test layer that runs directive logic in a real browser outside Storybook.
_Avoid_: unit test (for this layer), component test, Vitest Browser (as the layer name)

**Story id**:
This library's story naming scheme, `<plugin>--<story>`, by which a spec's play functions, browser-level tests, and Playwright e2e address the same story.
_Avoid_: story name, test id, scenario

**Library mixin**:
A mixin of the library's Sass (`nfs-accordion`, `nfs-motion`) that prints only the documented custom CSS Foundation cannot provide, reusing the consumer's Foundation settings and mixins in the same compile; included after the matching Export mixin.
_Avoid_: `_nfs-<plugin>.scss`, custom stylesheet, theme mixin

**Breakpoint properties**:
The `--nfs-breakpoint-<name>` custom properties on `:root`, in px, that mirror the Sass `$breakpoints` the consumer compiles Foundation with, and that the Breakpoint service's drift check compares with the Breakpoint map.
_Avoid_: breakpoint variables, CSS breakpoints, breakpoint tokens
