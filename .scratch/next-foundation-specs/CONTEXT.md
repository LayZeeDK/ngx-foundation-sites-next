# ngx-foundation-sites (next)

An Angular directive library that keeps Foundation for Sites 6.9's Sass and CSS class contract and gives every Foundation UI component, JavaScript plugin or CSS-only, and every layout system and utility family Angular directives (components only where Foundation generated structure), which set every Foundation and library class so the consumer writes none (ADR 0039). This glossary is the shared language for the building-blocks map, the ADRs, and the specs.

## Language

### Foundation side

**Plugin**:
One of Foundation 6.9's 21 JavaScript behaviours (Accordion, Reveal, Orbit, and so on), identified by its `data-<plugin>` attribute, that the library replaces.
_Avoid_: widget, module, component (for the Foundation thing)

**CSS-only component**:
A Foundation component that ships Sass and classes but no Plugin, such as Button, Button Group, Close Button, or Callout.
_Avoid_: static component, plain component, pure-CSS widget

**Menu**:
Foundation's `ul.menu` list of links: the CSS-only component whose class and Variants the Menu directive sets, and the markup of every menu Plugin's root and submenus; distinct from the ARIA `menu` role, which no menu uses.
_Avoid_: nav list, menubar, ARIA menu (for this)

**Close Button**:
Foundation's CSS-only component for the corner control drawn as a glyph, marked by the `.close-button` Structural class; distinct from a close Trigger (`nfsClose`), which does the closing and can sit on any button.
_Avoid_: close trigger (for the component), dismiss button, X button

**Top Bar**:
Foundation's CSS-only navigation bar with a left-hand and a right-hand section that stack below a breakpoint, holding menus, a title, and form controls; the wide-screen counterpart of a Title Bar.
_Avoid_: navbar, header bar, top nav

**Title Bar**:
Foundation's CSS-only compact bar holding a Menu icon and a title, shown in place of a Top Bar on small screens or beside an off-canvas panel.
_Avoid_: mobile bar, app bar, toolbar

**Menu icon**:
Foundation's three-bar button drawn in CSS (`.menu-icon`), light by default and dark as a Variant, which opens a menu or a panel through a Trigger beside it; distinct from the Menu component.
_Avoid_: hamburger (for the component), burger button, menu toggle

**Pagination**:
Foundation's CSS-only navigation through the numbered pages of a set of results: a list of page links with previous and next items and an ellipsis where pages are skipped; distinct from Material's paginator, a control that pages a table in place.
_Avoid_: paginator, pager (for the component), page navigation

**Breadcrumbs**:
Foundation's CSS-only trail of links to the parent pages of the current page, in hierarchy order, marked by the `.breadcrumbs` Structural class inside a named navigation landmark; distinct from an Open path, a menu's chain of open submenus.
_Avoid_: breadcrumb bar, trail (bare), path, crumbs

**Disabled step**:
A Breadcrumbs item for a level of the hierarchy that has no page of its own, written as text with Foundation's disabled look; not a control, so it has no disabled state for assistive technology and its text meets the text contrast minimum.
_Avoid_: disabled link, inactive crumb, unavailable item

**Split button**:
A Button Group of two buttons, a main action and an arrow-only dropdown button that opens more actions of the same kind; built from the group, the buttons, and a Trigger, with no component of its own. Distinct from a Hybrid item, whose link navigates and whose toggle opens a submenu.
_Avoid_: dropdown button (for the pair), menu button, action menu

**Callout**:
Foundation's CSS-only container for a highlighted message or aside, marked by the `.callout` Structural class and coloured from `$foundation-palette`; a coloured callout is not an alert, which only a live `role` makes it.
_Avoid_: alert (for the component), panel, notice, callout box

**Progress Bar**:
Foundation's CSS-only component that shows how far a task has come, marked by the `.progress` Structural class and exposed by the library as a `progressbar`; distinct from the native `<progress>` element, which Foundation styles by tag, and from `<meter>`, which shows a measurement, not progress.
_Avoid_: loading bar, progress indicator, meter (for the component)

**Progress meter**:
The `.progress-meter` element inside a Progress Bar whose width is the value's share of the range; distinct from the native `<meter>` element.
_Avoid_: fill (bare), bar, meter (bare), indicator

**Table**:
Foundation's CSS-only component for tabular data: the native `table` element, which Foundation styles by tag, with Variant classes for row hover, stripes, stacking, and scrolling, and a scroll wrapper marked by the `.table-scroll` Structural class; a static structure, distinct from an ARIA grid, which is an interactive widget.
_Avoid_: data table (for the component), grid, datagrid

**Stacked table**:
A Table shown with one block per row below Foundation's stack breakpoint, with its column headers listed above the rows and its footer kept; distinct from a table in a Scroll region, which keeps its columns.
_Avoid_: responsive table, mobile table, card table

**Switch**:
Foundation's CSS-only on/off control: a native checkbox or radio hidden inside a `.switch` container and drawn by its Switch paddle; distinct from the ARIA `switch` role, which a Switch carries only when the consumer writes it on a checkbox.
_Avoid_: toggle, slide toggle, toggle switch

**Switch paddle**:
The `<label>` bound `.switch-paddle` that directly follows a Switch's input, draws its track and the knob inside it, and is its pointer target.
_Avoid_: paddle (bare, which Foundation's Sass also uses for the knob), track, handle

**Inner label**:
A `.switch-active` or `.switch-inactive` word inside a Switch paddle that shows the state visually and is hidden from assistive technology.
_Avoid_: state label, switch text, on/off label

**Badge**:
Foundation's CSS-only component that shows a short count, letter, or icon beside or inside what it counts, marked by the `.badge` Structural class and coloured from `$badge-palette`; distinct from a Label, which tags content with words, and from Angular Material's badge, which decorates its host.
_Avoid_: counter, pill, notification dot, chip

**Card**:
Foundation's CSS-only container for content about one subject, marked by the `.card` Structural class and divided into Card dividers, padded card sections, and images; it has no role of its own, which the element it is written on gives it.
_Avoid_: panel, tile, box, mat-card

**Card divider**:
The shaded band of a Card (`.card-divider`) used as its title, its footer, or a break between its parts; distinct from a horizontal rule, which draws a line.
_Avoid_: card header, card footer, divider (bare), separator

**Responsive Embed**:
Foundation's CSS-only box, marked by the `.responsive-embed` Structural class, that keeps an Embedded element at a ratio from `$responsive-embed-ratios` (4:3 by default, `widescreen` 16:9) as the page narrows; Foundation's old name for it, Flex Video, survives only as the `.flex-video` alias.
_Avoid_: flex video, video wrapper, aspect-ratio box, embed container

**Embedded element**:
The `iframe`, `object`, `embed`, or `video` a Responsive Embed holds and Foundation's CSS stretches to fill it; the consumer's own element, which carries no library directive.
_Avoid_: embed (bare), media, player, frame (for all four)

**Label**:
Foundation's CSS-only inline tag that marks content with a word or a short phrase of metadata ("High priority", "Draft"), marked by the `.label` Structural class and coloured from `$label-palette`; not a control. Distinct from a Form label, which names a form control, and from a Badge, which shows a short count.
_Avoid_: tag, chip, pill, media label, label (bare, where a Form label could be meant)

**Thumbnail**:
Foundation's CSS-only framed image, marked by the `.thumbnail` Structural class on the image itself, on the link around it, or on a wrapper element around it; the image and its text alternative are the consumer's.
_Avoid_: avatar (for the component), image card, framed image, preview

**Linked thumbnail**:
A Thumbnail whose class is on the link that holds its image, the only form Foundation gives a hover and focus shadow; the image's text alternative is the link's name.
_Avoid_: thumbnail link (for a plain link around a thumbnail image), image link (bare), clickable thumbnail

**Media Object**:
Foundation's CSS-only component that sets an item, usually an image, beside content in two or three side-by-side sections, marked by the `.media-object` Structural class; a Media Object nested in a section indents it, as in a comment thread.
_Avoid_: media block, flag object, media card

**Main section**:
The section of a Media Object that takes the width the other sections leave, Foundation's `.main-section`, which only Flexbox mode styles.
_Avoid_: content section, body section, centre section

**Structural class**:
A Foundation CSS class that names an element of a Plugin's or a CSS-only component's markup (`.accordion-item`, `.dropdown-pane`, `.orbit-slide`, `.button`); bound by its directive, never written by the consumer.
_Avoid_: layout class, block class, container class

**Handle**:
A native `<input type="range">` inside a Slider that carries one of its values; the library's replacement for Foundation's `.slider-handle` span.
_Avoid_: thumb (the draggable part a Handle draws), slider input, knob

**Bar position**:
Where a value sits along a Slider's track, as a fraction from its start; equal to the value's share of the range except on a non-linear Slider, whose Handles carry it natively.
_Avoid_: percentage, pctOfBar, offset

**Fill**:
The part of a Slider that paints the selected stretch of its track, from the track's start to the one Handle or between the two; Foundation's `.slider-fill`. Distinct from the `fill` Variant input of a Button, which chooses `solid`, `hollow`, or `clear`.
_Avoid_: range, bar, progress, track fill

**Watched element**:
An element whose height an Equalizer matches to the tallest element of its row; the replacement for Foundation's `data-equalizer-watch` element.
_Avoid_: watch, equalized item, equalizer child

**State class**:
A Foundation CSS class that expresses runtime state on an element (`.is-active`, `.is-open`, `.is-stuck`, `.is-closing`, `.js-dropdown-active`), as opposed to a Structural class; a host binding of the directive that owns the state, never written by the consumer.
_Avoid_: modifier, flag class, status class

**Variant class**:
A Foundation CSS class that selects a static look for a Structural class (`.small`, `.alert`, `.hollow`, `.expanded`, `.dropdown` on `.button`), as distinct from a State class, which expresses runtime state; set by a Variant input of the directive, never written by the consumer.
_Avoid_: modifier, appearance class, style class

**Open Variant family**:
The Variant classes whose names come from a Sass setting the consumer can change (a palette, a size or ratio map, `$breakpoint-classes`, a count (a count arrives with the later milestone's families), a Prototyping list (later milestone)).
_Avoid_: dynamic variant, custom variant, open set

**Closed Variant family**:
The Variant classes whose names Foundation's Sass fixes (`solid`, `hollow`, `clear`; Reveal's sizes; a single modifier class).
_Avoid_: fixed variant, static variant, closed set

**Class breakpoint**:
A breakpoint listed in `$breakpoint-classes` (`small`, `medium`, `large` by default), the only breakpoints Foundation generates responsive classes for; a subset of the Breakpoint map.
_Avoid_: responsive breakpoint, class size, breakpoint class

**Visibility class**:
A Foundation CSS class of the Visibility Classes family that hides an element always (`.hide`, `.invisible`) or under a condition: a breakpoint range of the Breakpoint map (`.show-for-medium`, `.hide-for-large-only`, generated only for Class breakpoints), an orientation, the dark colour scheme, a stuck Sticky element, or printing (`.show-for-print`, `.hide-for-print`, from Foundation's print styles); `.show-for-sr` and `.show-on-focus` hide an element only from sight. Distinct from a State class, which expresses runtime state.
_Avoid_: responsive class, breakpoint class, visibility helper

**Visually hidden**:
Hidden from sight but kept in the accessibility tree, as Foundation's `.show-for-sr` does; distinct from hidden (`display: none`, `hidden`, `.hide`), which hides from everyone, and from `aria-hidden`, which hides from assistive technology only.
_Avoid_: screen-reader-only, sr-only, invisible (Foundation's `visibility: hidden`)

**Skip link**:
A link at the start of a page, Visually hidden until it has focus, that moves focus past repeated blocks to the main content; Foundation's `.show-on-focus` link.
_Avoid_: skip-to-content button, bypass link, jump link

**Utility class**:
A Foundation CSS class from a layout system or utility family (`.grid-x`, `.cell`, `.align-center`, `.float-left`, `.text-center`, `.margin-1`) that can style any element and names no element of a component's markup; set by its directive in the later milestone, and in the first milestone written by the consumer as a normal class (ADR 0039's exception for a family with no first-milestone spec). Visibility classes are one family of them.
_Avoid_: helper class, layout class, utility helper

**Utility family**:
The Utility classes one Foundation export mixin prints (`foundation-prototype-spacing`, `foundation-float-classes`), which one library directive sets through its Utility attributes (later milestone; in the first milestone the Foundation class itself).
_Avoid_: utility group, helper set, utility module

**Clearfix**:
Foundation's `clearfix` mixin and the `.clearfix` class it prints: two table-display pseudo-elements that make an element contain its floated children; the element itself neither floats nor clears, and on a flex or grid container the pseudo-elements become items.
_Avoid_: clear, clear-both, float container

**Prototyping Utilities**:
Foundation's opt-in Prototype mode: the Utility families of spacing, sizing, display, overflow, position, borders, corners, shadows, arrows, separators, font and list styles, and text helpers, printed only when the consumer includes them.
_Avoid_: prototype classes, helpers (bare), prototype mode (for the classes)

**Typography Helpers**:
Foundation's Utility family of text styles: the text alignment classes and their responsive forms, `.subheader`, `.lead`, `.stat`, `.no-bullet`, the Typescale classes `.h1` to `.h6`, the citation and code looks `.cite-block`, `.code-inline`, and `.code-block`, and the print helper `.print-break-inside`, which lets an element the print styles keep on one page break across pages.
_Avoid_: typography utilities, text helpers (bare), typography base (for these classes)

**Subheader**:
Foundation's lighter heading look (`.subheader`): on a paragraph grouped with its heading in an `hgroup` it marks a subtitle; on a heading it lightens the heading of a section of its own.
_Avoid_: subheading (for the look), subtitle (for the class), secondary heading

**Heading size**:
The look of a heading level (`.h1` to `.h6`) given to any element; it never changes the element's own heading level or role.
_Avoid_: heading level (for the look), typescale (for the value), header size

**Cell**:
An element of an XY Grid, marked by `.cell`, whose size and offset per breakpoint are set on it; distinct from a table cell and from the ARIA `gridcell` role, which no layout uses.
_Avoid_: column (the legacy grids' word), tile, grid item

**Block grid**:
A grid whose Cells or Columns share each row equally from a per-breakpoint count set on the grid or Row (Foundation's `.<bp>-up-<n>`), rather than from each one's own size.
_Avoid_: card grid, equal grid, up grid

**Row**:
An element of a legacy grid (the Float Grid or the Flex Grid), marked by `.row`, that holds Columns and carries the settings they share, such as a block grid count or collapsed gutters.
_Avoid_: grid (bare), line, container

**Column**:
An element of a legacy grid's Row, marked by `.column`, whose size and offset per breakpoint are set on it, and in the Float Grid also its push, pull, and centring; in the Flex Grid a Column without a size expands into the space its Row leaves.
_Avoid_: cell (the XY Grid's word), col, grid item

**Column row**:
An element that is both a Row and a Column, which Foundation draws as a centred, padded block for content rather than a Row of Columns.
_Avoid_: single-column row, row column

**Grid frame**:
An XY Grid sized to the viewport that clips whatever does not fit, so that its cell blocks scroll on their own (Foundation's `.grid-frame`).
_Avoid_: app shell, full-height grid, viewport grid

**Cell block**:
A cell that scrolls its own overflow inside a Grid frame (Foundation's `.cell-block`, `.cell-block-y`), which the XY Grid's `nfsCell` makes a Scroll region in the later milestone; in the first milestone the consumer writes the region's attributes on it (building-blocks 1.10).
_Avoid_: scroll cell, scroll pane, scroller

**Flex parent**:
An element laid out with `display: flex` whose children the Flexbox Utilities' alignment classes place: a Foundation grid, Button Group, Media Object, Card, or Menu, or any element the `.flex-container` class makes one.
_Avoid_: flex container (CSS's term, and the name of the one Foundation class that makes any element a flex parent), flexbox parent, row

**Flex child**:
An immediate child of a Flex parent, which can align itself, take a share of the space, or take another place in the visual order.
_Avoid_: flex item (CSS's term), cell (the XY Grid's element), column

**Source ordering**:
Foundation's per-breakpoint change of the visual order of a layout's items, through the Flexbox Utilities' order classes or the Float Grid's push and pull classes, which leaves the DOM order, the reading and focus order, as written.
_Avoid_: reordering (bare), sort order

**Application class**:
A CSS class the consumer defines in its own stylesheet, never a Foundation or library class; the only class a consumer writes, on its own elements or as the value of an input that applies or names one (the Toggler's `toggler`, the Tooltip's `templateClasses`, the Dropdown pane's `parentClass`, a Motion input's dot form).
_Avoid_: custom class, own class (bare), user class

**Form label**:
A `<label>` element that names a form control, styled by Foundation by tag, with one Variant class (`.middle`); distinct from Foundation's Label component (`.label`), a coloured text tag.
_Avoid_: label (bare, where the Label component could be meant), field label, caption

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
A CSS animation class that animates an element's entry, exit, or state change: one of the library's `nfs-*` keyframe classes, which a directive applies from a typed Motion name, or the consumer's own keyframe class; never a library class name written in consumer code.
_Avoid_: Motion UI transition, mui class, animation name

**Motion name**:
A Motion UI animation name (`fade-in`, `spin-out`) given as the value of a Plugin's animation Option, which the directive maps to the library's keyframe Motion class of that name; never a class name.
_Avoid_: Motion class (for the value), animation class, effect name

**Breakpoint map**:
Foundation's named viewport breakpoints (`small`, `medium`, `large`, `xlarge`, `xxlarge`) with their minimum widths, one set shared by the library and the consumer's Sass `$breakpoints`.
_Avoid_: media query list, screen sizes, `Breakpoints` (the CDK constants)

**Breakpoint rule**:
A Foundation rule string such as `drilldown medium-dropdown` or `accordion medium-tabs`, or its object form (`{small: 'drilldown', medium: 'dropdown'}`), that assigns a mode or value per breakpoint; a responsive Variant input takes only the object form, because a Variant rule string would spell Foundation class names (`medium-horizontal`).
_Avoid_: responsive config, mode map, query string

**Zero breakpoint**:
The breakpoint of the Breakpoint map whose minimum width is 0 (`small` in Foundation's defaults); a Breakpoint rule mode written without a breakpoint applies from it, and it is the default Server breakpoint.
_Avoid_: base breakpoint, mobile breakpoint, default breakpoint

**Breakpoint query**:
An Option or Variant input value that names a breakpoint with an optional `up`, `only`, or `down` modifier (`medium`, `large only`, `medium down`), as in Tooltip `showOn`, Sticky `stickyOn`, or Button `expanded`; distinct from a Breakpoint rule, which assigns modes.
_Avoid_: media query (for this), breakpoint string, size

**Named query**:
A media query addressed by a name that is not a breakpoint (`landscape`, `portrait`, `retina`, or the consumer's own), used in Interchange rules.
_Avoid_: special query (Foundation's code name), custom breakpoint

**Interchange rule**:
A `[content, query]` pair of Interchange, whose query is a name of the Breakpoint map (a Class breakpoint or not), a Named query, or a media query; in a list of them the last matching one applies.
_Avoid_: breakpoint rule (which assigns modes), responsive source, interchange query

**Export mixin**:
A Foundation Sass mixin that prints one component's CSS (`foundation-accordion`, `foundation-reveal`), included by the consumer and compiled from the consumer's settings.
_Avoid_: Foundation styles, component mixin

**Float build**:
Foundation's CSS compiled with Flexbox mode off (`foundation-everything($flex: false)`, what Foundation ships as its float CSS), the one `foundation-everything` compile that prints the Float Grid, and one without the XY Grid, the Flex Grid, and the Flexbox Utilities.
_Avoid_: float mode, legacy build, IE build

**Flexbox mode**:
Foundation compiled with `$global-flexbox: true`, its default, in which its components lay out with flexbox; with `$global-flexbox: false` they use Foundation's older float and table layouts, and some Variant classes exist in only one of the two.
_Avoid_: flex mode, flex build, Flex Grid (a layout system)

### Angular side

**Directive-first**:
The rule that a Plugin, a CSS-only component, a layout system, or a utility family becomes attribute directives on the elements the consumer writes; a component is the exception for structure Foundation generated.
_Avoid_: headless, unstyled, wrapper-less

**Wrapper component**:
A component on an element of Foundation's markup that the consumer writes without its class (`[nfsAccordionContent]` on the panel `div`), which binds that class and adds one inner element around the projected content because the element's CSS needs it.
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

**Dismissible callout**:
A Callout the user can close with a close button inside it, either hidden in place as a Toggler in Visibility mode or removed with `@if`; the replacement for Foundation's `data-closable` on a callout.
_Avoid_: closable callout, alert box, closable (the Foundation attribute)

**Class mode**:
The Toggler form that adds and removes the consumer's own class named by `toggler` on its element, or, with `toggler` written without a value, switches no class and holds the state a Foundation Variant input is bound from; its Triggers are toggle buttons; the replacement for `data-toggler=".class"`.
_Avoid_: toggle-class mode, CSS mode, active mode

**Modal mode**:
The OffCanvas configuration with `trapFocus` and an overlay present, in which the panel is a modal dialog and everything outside the panel is inert (the Modal inert set); every other configuration is a disclosure.
_Avoid_: overlay mode, trap mode, dialog mode

**Modal inert set**:
Everything on the page outside an OffCanvas panel in Modal mode that the panel makes inert while it is open; the overlay and page-level live regions and popovers stay reachable.
_Avoid_: background, page content (when meaning the set)

**Light dismiss**:
Closing an Anchored pane, an open submenu, or a non-modal Reveal on an outside pointer press, on Escape, when focus moves outside it, or when a sibling of the same kind opens; the replacement for Foundation's `closeme.zf.*` broadcast and body click handlers.
_Avoid_: click-outside, closeme, auto-close, Backdrop press (which is a modal Reveal's)

**Scroll lock**:
Keeping the page from scrolling behind an open modal Reveal, as Foundation's `html.is-reveal-open` rule does, or behind an open OffCanvas panel whose `contentScroll` is false, as Foundation's `body.is-off-canvas-open` rule does; counted per document so the lock holds while any locking Openable is open.
_Avoid_: body lock, scroll blocking, block scroll strategy (CDK's)

**Backdrop press**:
A pointer press that starts and ends on a modal Reveal's `::backdrop`, which closes it when `closeOnClick` is on; distinct from Light dismiss, which non-modal content uses.
_Avoid_: overlay click, outside click, backdrop click

**Anchored pane**:
An element placed against its Trigger inside the page flow rather than in an overlay: the Dropdown pane, the Tooltip tip, or an application's own element placed through the Positioner.
_Avoid_: overlay, popover, popup, floating element, connected overlay

**Tip**:
The `.tooltip` element a Tooltip shows beside its host, carrying the same text as the host's description; distinct from the Tooltip Plugin and from the host that triggers it.
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
A responsive Plugin's change of mode when its Breakpoint rule resolves to another mode: a class and key change on the same nodes for the menu Plugins, which drilldown mode extends with level names, a structural re-render of its own template for ResponsiveAccordionTabs, the one ADR 0008 accepts.
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

**Current link**:
The link a menu, a pagination, or a Breadcrumbs trail marks as the page the reader is on (a pagination's button, in a pager that updates in place), with `aria-current` present and neither `false` nor empty; the library gives it Foundation's active menu look, current pagination look, or current breadcrumb colour, so no class marks it.
_Avoid_: active item, is-active item, selected link, current item (for Foundation's `.current`)

**Placeholder link**:
An `<a>` without `href`, which HTML treats as a placeholder that is neither focusable nor navigable; marked `role="link"` and `aria-disabled="true"`, it is the library's disabled link (a disabled `nfsButton` link, a pagination's disabled previous or next item).
_Avoid_: disabled anchor, dead link, `href="#"` link

**Drilldown level**:
One list of a Drilldown, the root list or a submenu, shown alone in the Drilldown wrapper while it is the innermost open list.
_Avoid_: panel, pane, screen, page, current menu

**Drilldown wrapper**:
The consumer-written element around a Drilldown's root list that clips the Drilldown levels and carries their measured height; the replacement for Foundation's generated `div.is-drilldown`.
_Avoid_: wrapper component (which adds an element inside a component), container, viewport

**Base side**:
The side, left or right, toward which a dropdown-mode submenu opens before the collision check moves it; set by `alignment`, the Menu's `align` Variant, an enclosing Top Bar right-hand section, and the reading direction.
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

**Variant input**:
A directive input that sets one family of Variant classes, or of a layout system's or utility family's Utility classes, from a typed name, a boolean, a Breakpoint query, a Breakpoint rule object, or a count; with no value it sets no class, so the consumer's Sass default is the look.
_Avoid_: appearance input, style input, modifier input

**Utility attribute**:
An `nfs`-prefixed input of a Utility family's directive whose name is also one of that directive's attribute selectors (`nfsMarginTop="1"`, `nfsBordered`), written where Foundation's docs write the Utility class and typed like a Variant input (later milestone; in the first milestone the Foundation class itself).
_Avoid_: utility input, utility directive (for the attribute), helper attribute

**Variant registry**:
An empty interface the library declares for one Sass setting (`NfsButtonPaletteOverrides`) and the consumer's Variant declaration file augments, adding names (`purple: true`), removing defaults (`warning: false`), or setting a count (a count arrives with the later milestone's families), so the Variant inputs over that setting accept exactly the names the consumer's Sass generates.
_Avoid_: overrides interface, theme interface, type registry

**Variant declaration file**:
The `nfs-variants.d.ts` at the source root of a consumer's application, or of a shared library whose own programs use names Foundation's defaults lack, generated from its Sass by the library's tooling or written by hand, that augments the Variant registries; kept in step by a sync step before tasks and committed with the Sass change that changed it.
_Avoid_: theme typings, typegen output, augmentation file

**Variant manifest**:
The library's list of its Variant registries, each with its Sass setting, its Variant property, its default names or count (a count arrives with the later milestone's families), and the Variant inputs that follow it; the one list the library's Sass, types, and tooling agree on.
_Avoid_: registry list, variant config, schema

**Declaration drift**:
A difference between a Variant declaration file and the Variant properties of the Sass it mirrors: a name one has and the other lacks, or a differing count (a count arrives with the later milestone's families), which the tooling's next rewrite removes from a generated file.
_Avoid_: stale types, out of sync (Nx's word for any sync generator), mismatch

**Error-state policy**:
The rule that decides when a field's validation errors are shown (after a committed change, while typing, after leaving the field, or after a submit), as opposed to whether the field is invalid.
_Avoid_: validation mode, error matcher, validateOn (as the name of the whole rule)

**Form error**:
A message element (`.form-error`, bound by `nfsFormError`) tied to one field and, optionally, to one error kind, shown only while that field's errors are shown.
_Avoid_: error message (bare), inline error, hint (which is Help text)

**Form alert**:
The one form-level message (Foundation's `[data-abide-error]` box) shown while a submitted form is invalid.
_Avoid_: global error, error summary, abide error

**Help text**:
A `.help-text` element that describes one field through the id the field lists in its `aria-describedby`, shown at all times; distinct from a Form error, which shows only while the field's errors are shown.
_Avoid_: hint, helper text, description (for the element)

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

**Visible value**:
The text a sighted user reads for a Progress Bar's, a native progress element's, or a meter's value, in its meter text or beside it, which the library requires because the bar's graphic alone does not meet non-text contrast; distinct from `aria-valuetext`, the value assistive technology speaks.
_Avoid_: value text (ambiguous with `aria-valuetext`), label (the name), caption, percentage label

**Scroll region**:
An element whose content scrolls inside it and that the keyboard can focus, with a role and an accessible name, such as a Table's scroll wrapper, a table that scrolls itself, or an XY Grid Cell block; distinct from a scroll container in general, which the keyboard may not reach.
_Avoid_: scroll container (bare), scroller, overflow wrapper

**Fixture app**:
The prerendered Angular application, one route per entry point whose spec tests the Rendering modes there, at `/<entry point>`, that the Playwright e2e layer drives to test the Rendering modes.
_Avoid_: demo app, kitchen sink, SSR app, universal app

**Library mixin**:
A mixin of the library's Sass (`nfs-accordion`, `nfs-motion`) that prints only the documented custom CSS Foundation cannot provide, reusing the consumer's Foundation settings and mixins in the same compile; included after the matching Export mixin.
_Avoid_: `_nfs-<plugin>.scss`, custom stylesheet, theme mixin

**Breakpoint properties**:
The `--nfs-breakpoint-<name>` custom properties on `:root`, in px, that mirror the Sass `$breakpoints` the consumer compiles Foundation with, and that the `strictBreakpointSync` Runtime check compares with the Breakpoint map. A later-milestone term: the Breakpoint properties are written by the [Spec: build-time checks (later milestone)](issues/163-spec-build-time-checks-later-milestone.md) and read by the `strictBreakpointSync` Runtime check of the [Spec: Runtime checks (later milestone)](issues/162-spec-runtime-checks-later-milestone.md); in the first milestone `nfs-breakpoint-properties` writes only `--nfs-breakpoint-classes`.
_Avoid_: breakpoint variables, CSS breakpoints, breakpoint tokens

**Variant properties**:
The `--nfs-<setting>` custom properties on `:root` that a Library mixin writes to list the names (or the count; a count arrives with the later milestone's families) the consumer's Sass generates Variant classes for, such as `--nfs-button-palette` and `--nfs-breakpoint-classes`; read by the library's generator (and, in a later milestone, by the Runtime checks).
_Avoid_: theme tokens, palette variables, names property

**Runtime check**:
A check the library runs in development builds after the first render, on by default with a per-check opt-out, that reports what the compiler cannot see: a Variant value with no class in the compiled CSS, missing Variant properties, Breakpoint drift, or, through `strictDirectiveImports`, a Forgotten import on a rendered element; the Variant and Breakpoint checks can also be opted into production. A later-milestone term: the first milestone has no Runtime check ([Spec: Runtime checks (later milestone)](issues/162-spec-runtime-checks-later-milestone.md)). The `strictParents` flag beside them is not one: it is off unless the consumer opts in, and makes a missing parent throw at construction.
_Avoid_: dev check, drift warning, sanity check

**Forgotten import**:
A library attribute written in a template whose component's imports do not bring in the directive it names, so the element renders without that directive's classes, ARIA, and behaviour, with no compiler error. The first milestone reports none; the later milestone's forgotten-import checks do ([Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md)).
_Avoid_: missing import, unimported directive, dead attribute

**Selector manifest**:
The library's list of its exported directives and components that have an attribute selector, each with its class name, entry point, selector, the Structural class it always binds, and the library directives it hosts; the list the forgotten-import checks match templates and rendered elements against. A later-milestone term: [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md), planned and implemented in a later milestone ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)).
_Avoid_: directive manifest, import manifest, selector list

**In-family check**:
A development warning from one part of a directive family about a peer: an element that carries the peer's attribute with no instance of it, or a parent that dependency injection cannot reach from the part's template. A later-milestone term: [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md), planned and implemented in a later milestone ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)).
_Avoid_: peer check, family validation, sibling check

**Family check**:
A later-milestone term: a development warning from one part of a directive family, or a directive placed beside or inside another family's part, about how the consumer arranged the parts: a registration a part lacks, a part placed where the family's CSS or behaviour does not reach it, or parts in an order the family cannot use; planned and implemented in a later milestone ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)), by [Spec: family checks (later milestone)](issues/160-spec-family-checks-later-milestone.md).
_Avoid_: In-family check (a Forgotten import report), placement warning, structure check

**Misuse warning**:
A directive's own development warning about how the consumer used it, reading only its host, its inputs, its content, or the page: a copied Foundation class, a missing accessible name, a value the directive cannot use. A later-milestone term: planned and implemented in a later milestone ([specs/misuse-warnings.md](specs/misuse-warnings.md)); in the first milestone each rule it reports is documented usage in the directive's spec.
_Avoid_: dev check, lint, sanity check

**Usage rule**:
A rule of documented usage a spec states for a directive's host, numbered in its API section and stated in the directive's JSDoc; the usage examples follow it. In the first milestone the library reports no breach.
_Avoid_: constraint, validation rule
