# ngx-foundation-sites (next)

An Angular directive library that keeps Foundation for Sites 6.9's Sass and CSS class contract and replaces every Foundation JavaScript plugin with Angular directives (components only where Foundation generated structure). This glossary is the shared language for the building-blocks map, the ADRs, and the 22 specs.

## Language

### Foundation side

**Plugin**:
One of Foundation 6.9's 21 JavaScript behaviours (Accordion, Reveal, Orbit, and so on), identified by its `data-<plugin>` attribute, that the library replaces.
_Avoid_: widget, module, component (for the Foundation thing)

**Structural class**:
A Foundation CSS class that names an element of a plugin's markup (`.accordion-item`, `.dropdown-pane`, `.orbit-slide`) and therefore gets its own directive or component.
_Avoid_: layout class, block class, container class

**State class**:
A Foundation CSS class that expresses runtime state on an element (`.is-active`, `.is-open`, `.is-stuck`, `.is-closing`, `.js-dropdown-active`), bound by a directive as a host class binding, never a directive of its own.
_Avoid_: modifier, flag class, status class

**Option**:
A Foundation `data-*` configuration attribute, exposed by the library as an `input()` under the same name in camelCase.
_Avoid_: setting, config, parameter, data attribute (when meaning the input)

**Dropped option**:
An Option that exists only because of jQuery or HTML-string injection and has no counterpart in the library; listed per spec.
_Avoid_: unsupported option, removed feature, legacy option

**Motion class**:
A CSS class name passed to an animation input (`animationIn`, `animate`, `animInFromRight`) and applied through `animate.enter`/`animate.leave` or a State class; the library ships `nfs-*` keyframe classes under Foundation's Motion UI names.
_Avoid_: Motion UI transition, mui class, animation name

**Breakpoint map**:
Foundation's named viewport breakpoints (`small`, `medium`, `large`, `xlarge`, `xxlarge`) with their minimum widths, held in `nfsBreakpointsToken` and mirrored by the consumer's Sass `$breakpoints`.
_Avoid_: media query list, screen sizes, `Breakpoints` (the CDK constants)

**Breakpoint rule**:
A Foundation rule string such as `drilldown medium-dropdown` or `accordion medium-tabs` that assigns a mode per breakpoint, parsed by the shared parser.
_Avoid_: responsive config, mode map, query string

### Angular side

**Directive-first**:
The rule that a Plugin becomes attribute directives on the markup the consumer writes; a component is the exception for structure Foundation generated.
_Avoid_: headless, unstyled, wrapper-less

**Wrapper component**:
An attribute-selector component (`[nfsAccordionContent]`, `[nfsTabsPanel]`) that keeps the Foundation class on the consumer's element and renders one inner element around `<ng-content>` so CSS can animate height or defer content.
_Avoid_: panel component, content component, shell

**Implementation level**:
Which of native platform, `@angular/aria`, `@angular/cdk`, or custom Angular a spec stops at, in that order, with the reason and the fallback.
_Avoid_: tier, layer, strategy, stack

**Browser target**:
The Baseline widely-available browser set on 2026-05-07 (Chrome, Edge, Firefox 119; Safari 17) that decides whether a platform feature may be used without a fallback.
_Avoid_: browserslist, support matrix, compat target

**Trigger**:
A `<button>` (or link) carrying `nfsOpen`, `nfsClose`, or `nfsToggle` that acts on an Openable; the replacement for Foundation's `data-open`/`data-close`/`data-toggle`.
_Avoid_: anchor (Foundation's word), opener, invoker, toggler (which is the Toggler plugin)

**Openable**:
A directive that provides `nfsOpenableToken` (`open()`, `close()`, `toggle()`, an `open` signal, an id, and a trigger-role hint) so Triggers can act on it: Reveal, OffCanvas, Dropdown pane, Toggler, ResponsiveToggle, Tooltip.
_Avoid_: target, controllee, panel (in the generic sense), disclosure (when meaning the contract)

**Light dismiss**:
Closing an Anchored pane on an outside pointer press, on Escape, or when a sibling of the same kind opens; the replacement for Foundation's `closeme.zf.*` broadcast and body click handlers.
_Avoid_: click-outside, closeme, auto-close, backdrop click (which is Reveal's)

**Anchored pane**:
An element positioned against a trigger in place (`position: absolute` in Foundation's flow) by the shared positioner: the Dropdown pane and the Tooltip tip.
_Avoid_: overlay, popover, popup, floating element, connected overlay

**Positioner**:
The shared service that ports Foundation's Positionable and Box placement formulas (position, alignment, offsets, 12-candidate collision search) onto `getBoundingClientRect` measurements taken in `afterRenderEffect`.
_Avoid_: position strategy, tether, floating-ui, overlay position

**Nested menu**:
The shared directive family (`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`) applied to Foundation's nested `ul.menu` markup that emits the `is-<mode>-submenu*` classes for the active mode; the replacement for Foundation's Nest utility.
_Avoid_: Nest, feathered menu, submenu tree, menu tree

**Menu mode**:
Which nested-menu behaviour is active on a root `ul`: `accordion`, `drilldown`, or `dropdown`; fixed by the root directive or switched per breakpoint by ResponsiveMenu.
_Avoid_: menu type, plugin type, variant, strategy

**Disclosure navigation**:
The APG pattern every menu Plugin implements by default: native lists, `<button aria-expanded aria-controls>` parents (or link plus button in the hybrid form), `aria-current="page"`, no `menu`, `menubar`, `menuitem`, or `tree` roles.
_Avoid_: menubar, ARIA menu, navigation tree, mega menu

**Lazy content**:
Content inside an `ng-template` (Aria's `DeferredContent`) that renders only while its panel, tab, or slide is shown; distinct from a consumer's `@defer` block, which loads code.
_Avoid_: deferred content (ambiguous with `@defer`), lazy panel, on-demand content

**Defaults token**:
The one optional `InjectionToken` per Plugin (`nfsRevealDefaultsToken`) whose all-optional object seeds input defaults; the replacement for `Foundation.X.defaults`.
_Avoid_: config token, options token, global options, `MAT_*_DEFAULT_OPTIONS`

**Parent token**:
The lightweight `InjectionToken` (`nfsAccordionToken`) a container provides with `useExisting` so projected children can find it without retaining the class.
_Avoid_: parent injector, context token, container class injection

**Completion output**:
A past-tense `output()` (`opened`, `closed`, `stuck`) emitted once a state change is committed and its enter or leave animation has finished; the replacement for Foundation's `*.zf.*` events.
_Avoid_: event (bare), callback, hook, start event

**Server breakpoint**:
The Breakpoint map entry (`small` by default) that the Breakpoint service reports while rendering on the server or at prerender time, so server HTML is deterministic.
_Avoid_: SSR default, fallback breakpoint, mobile default

**Rendering modes**:
The set every directive must support and every spec must describe: client rendering, server-side rendering, prerendering, full hydration, incremental hydration through `@defer (hydrate on ...)`, event replay, and plain `@defer`.
_Avoid_: SSR support (as the whole set), hydration mode, universal

**Dehydrated state**:
What a directive's server HTML looks like before hydration or inside an unhydrated block: Foundation classes, State classes, ARIA, `inert`, and `hidden` from host bindings, with no JavaScript behaviour yet.
_Avoid_: static render, first paint, placeholder (which is `@placeholder`)

**Hydration boundary**:
The region that hydrates as one unit: the whole page under full hydration, or one `@defer (hydrate on ...)` block; a widget's container and items, and a Trigger and its Openable, must sit inside the same one.
_Avoid_: defer boundary, island, hydration zone

**Replayed event**:
A native event the user fired before hydration that Angular queues and re-dispatches to a template or host listener once the boundary hydrates; its `preventDefault()` throws.
_Avoid_: queued click, pre-hydration event, captured event

**Browser-level test**:
The test layer that runs directive and service logic in a real browser outside Storybook; its stack (Vitest Browser or Playwright component tests) is decided by ticket 41.
_Avoid_: unit test (for this layer), component test, Vitest Browser (as the layer name)

**Story id**:
The Storybook identifier (`<plugin>--<story>`) that a spec's play functions and Playwright e2e point at, and browser-level tests reuse if their stack mounts CSF stories.
_Avoid_: story name, test id, scenario
