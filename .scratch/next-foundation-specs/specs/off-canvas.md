# Spec: Off-canvas

Ticket: [Spec: Off-canvas](../issues/25-spec-off-canvas.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA. Revised on 2026-09-28 by the [Re-run: Off-canvas spec under the class rule](../issues/117-rerun-off-canvas-class-rule.md) under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A site built on Foundation for Sites uses an off-canvas panel for its mobile navigation, a filter drawer, or a sidebar that is a drawer on small screens and a permanent column on large ones. Foundation's OffCanvas plugin does this in jQuery: it finds the page content by id or by walking the DOM, generates an overlay `div` and inserts it into the page, reads the panel's position and its reveal breakpoint back out of class names with regular expressions, toggles `is-open`/`is-closed` and a family of content classes, waits for `transitionend` to finish each step, locks scrolling with a body class plus iOS touch handlers, and rewrites the inline `top` of fixed elements while the content is pushed. Its accessibility is thin: `aria-hidden` on the panel, `aria-expanded` only on the triggers that existed at initialisation, Escape only while focus is inside the panel, focus returned to the trigger only on that Escape path, no dialog semantics even when it traps focus, and a focus trap that leaves the covered page reachable by pointer. Its completion events are named backwards (`opened.zf.offCanvas` fires when the open transition starts).

Foundation's markup is a contract of classes the developer writes by hand: `.off-canvas` or its alternative `.off-canvas-absolute`, a required `.position-<side>`, `.off-canvas-content`, the optional `.off-canvas-wrapper`, `.reveal-for-<bp>`, and the classes of the close button, title bar, and menu icon around it. A misspelt or missing class fails silently: a panel without a position class has no transform, width, or offset, and shows as a fixed box wherever it happens to sit.

An Angular developer on the next library needs the same panels without jQuery, without the generated structure, and without writing any Foundation or library class, correct in every rendering mode: server HTML that hides a closed panel and shows a revealed sidebar at the right widths before any JavaScript runs, prerendered pages, incremental hydration, a hamburger tapped before the bundle arrives, and zoneless change detection. The panel must follow the WAI-ARIA disclosure pattern by default and the modal dialog pattern when it traps focus over an overlay, meet WCAG 2.2 AA (Foundation's default panel colours fail it), animate with Foundation's own transform transition, and reuse Foundation's Sass rather than restyle it.

## Solution

Four attribute directives on the elements Foundation's markup already has, plus the shared Triggers. The directives bind every Foundation class; the developer writes elements and directive attributes, never a Foundation or library class ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)).

- `[nfsOffCanvas]` on the panel binds `.off-canvas`; `[nfsOffCanvasAbsolute]`, the same directive under a second selector, binds Foundation's alternative class `.off-canvas-absolute` instead. The panel is the Openable. Its required `position` input (`'left'`, `'right'`, `'top'`, or `'bottom'`) sets `.position-<side>`. It holds the `isOpen` model, implements `open()`, `close()`, and `toggle()`, emits `opened` and `closed` when Foundation's transform transition has finished, provides `nfsOpenableToken` so a bare `nfsClose` inside the panel closes it, and binds Foundation's State classes (`is-open`, `is-closed`, `is-transition-push`/`is-transition-overlap`) plus the `reveal-for-<bp>` and `in-canvas-for-<bp>` classes from its `revealOn` and `inCanvasOn` inputs, which take Class breakpoints.
- `[nfsOffCanvasContent]` binds `.off-canvas-content` and receives Foundation's content classes (`is-open-<position>`, `has-transition-<transition>`, `has-position-<position>`, `has-reveal-<position>`) from every panel linked to it. A panel links to it through the `content` input (the typed counterpart of `contentId`) or, for a panel nested inside the content, through dependency injection.
- `[nfsOffCanvasOverlay]="panel"` on a plain `div` the developer writes replaces the overlay Foundation generated: it binds `.js-off-canvas-overlay` and `is-overlay-fixed` or `is-overlay-absolute` from its panel, binds `is-visible` and `is-closable`, and closes the panel on click. Leaving it out is Foundation's `contentOverlay: false`.
- `[nfsOffCanvasWrapper]` binds `.off-canvas-wrapper`, the optional element around panels and content that clips the pushed content.

The close button is the [Spec: Close Button](../issues/83-spec-close-button.md)'s `button[nfsCloseButton]` with a bare `nfsClose` beside it; a title bar and its menu icon are the [Spec: Top Bar](../issues/86-spec-top-bar.md)'s `nfsTitleBar` directives and `button[nfsMenuIcon]` with a Trigger beside it; the menu inside the panel is the [Spec: Menu](../issues/85-spec-menu.md)'s `ul[nfsMenu]`.

Nothing is a `<dialog>` ([ADR 0030](../adr/0030-off-canvas-no-dialog.md), "OffCanvas panels are not `<dialog>` elements"): the same element is a revealed sidebar or an in-canvas page element at larger breakpoints, which a closed `<dialog>` cannot be. Modal mode, Foundation's `trapFocus` with an overlay present, adds `role="dialog"`, `aria-modal="true"`, `inert` on every element outside the panel's ancestor chain (the Modal inert set), and a CDK `FocusTrap`, and its Triggers render `aria-haspopup="dialog"` and `aria-controls` without `aria-expanded`; every other configuration is a disclosure whose Triggers carry `aria-expanded`. Focus moves into the panel when it opens and back to the Trigger when it closes, on every close path. Escape closes an open panel from anywhere, which also keeps a panel that covers the page from hiding the focused element (WCAG 2.2 success criterion 2.4.11, whose note exempts content the user opened and can dismiss without moving focus).

All first-paint state is host bindings: the Structural, position, and State classes are in server HTML, a closed panel is `is-closed` there (Foundation's `visibility: hidden`), a revealed sidebar is visible from its Foundation class at every width, and no breakpoint decides a server-bound class. The Breakpoint service only drives behaviour after the first render. A Foundation class copied from Foundation's markup is stripped by the directive's bindings and reported in development builds. The library CSS is small and documented: a reduced-motion override for Foundation's transitions and `overflow: clip` on `.off-canvas-wrapper` so Sticky works inside it, with `overflow-wrap: break-word` so the clip cuts off no long word; compile-time checks stop a build whose panel colours fail WCAG 2.2 AA, as Foundation's defaults do, computed with the exact WCAG formula. The close button's 24 px box and the menu icon's 24 px box come from the Close Button's and the Top Bar's Library mixins.

## User Stories

1. As an application developer, I want to put `nfsOffCanvas` on the panel element and get Foundation's `.off-canvas` panel, so that I keep Foundation's documented panel markup without writing its classes.
2. As an application developer, I want `[nfsOpen]="nav"` or `[nfsToggle]="nav"` on my hamburger button, so that I link the button to the panel with a typed reference instead of an id string.
3. As an application developer, I want a bare `nfsClose` beside `nfsCloseButton` on the close button inside the panel, so that the button closes the panel it sits in with no reference.
4. As an application developer, I want `position="left"`, `"right"`, `"top"`, or `"bottom"` to set Foundation's `.position-<side>`, and a compile error when I leave it out, so that a panel can never lose the position class Foundation's docs require.
5. As an application developer, I want `transition="overlap"` or the default push, so that Foundation's `data-transition` carries over.
6. As an application developer, I want a panel nested inside the content to find the content by itself and use the overlap transition, as Foundation's nested form does, so that one element can be an off-canvas on small screens and part of the page on large ones.
7. As an application developer, I want `[content]="page"` to link a panel to a content element elsewhere, so that Foundation's `contentId` has a typed counterpart.
8. As an application developer, I want several panels to share one content element, so that a left menu and a right filter panel work on the same page.
9. As an application developer, I want to write the overlay element myself as a plain `div` with `[nfsOffCanvasOverlay]="nav"`, or leave it out, so that server HTML contains every element and Foundation's `contentOverlay: false` is just markup.
10. As a mouse or touch user, I want a click on the overlay to close the panel when `closeOnClick` is on, so that I can dismiss it by tapping the page.
11. As a mouse user of a panel without an overlay, I want a click on the page content to close it when `closeOnClick` is on, as Foundation does, so that no overlay is needed for dismissal.
12. As a keyboard user, I want Escape to close the open panel wherever my focus is, so that I can always dismiss it and see the element I am on.
13. As an application developer, I want `closeOnEsc="false"` to keep Escape from closing a panel, so that a panel with unsaved input is not lost by one key press, knowing the library warns me when that breaks WCAG.
14. As a keyboard user, I want focus to move into the panel when it opens, so that I can use it at once without tabbing through the page.
15. As a keyboard user, I want focus to go back to the button that opened the panel when it closes, however it closes, so that I continue where I was.
16. As an application developer, I want `autoFocus` to choose the first tabbable element, the first heading, an element I mark with `data-autofocus`, a selector, or nothing, so that long panels can start at their heading.
17. As a keyboard user of a modal panel, I want Tab and Shift+Tab to stay inside the panel, and the page behind it to be unreachable, so that the modal behaves like a dialog.
18. As a screen reader user, I want a modal panel announced as a dialog with its name, and a non-modal panel's button announced with its expanded state, so that I know what opened and whether I can leave it.
19. As a screen reader user, I want a revealed sidebar announced as normal page content, with no dialog role and no expanded state, so that a permanent column is not presented as a popup.
20. As an application developer, I want `revealOn="large"` to keep the panel open as a sidebar at large and up, so that Foundation's `.reveal-for-large` carries over.
21. As a desktop visitor on a server-rendered or prerendered page, I want the revealed sidebar visible and its links usable before any JavaScript runs, so that navigation works before hydration.
22. As an application developer, I want `inCanvasOn="large"` to render the panel as a normal page element at large and up, so that Foundation's in-canvas feature carries over.
23. As a visitor who rotates a tablet, I want an open drawer to close when the layout switches to the permanent sidebar, so that the overlay and the scroll lock do not stay behind, and I want it to stay closed when I rotate back.
24. As a keyboard user whose focus is in the revealed sidebar when the window shrinks, I want focus moved to the button that opens the panel, so that it is not lost when the sidebar hides.
25. As an application developer, I want `contentScroll="false"` to stop the page from scrolling behind the open panel, so that Foundation's scroll lock carries over.
26. As an application developer, I want `forceTo="top"` to scroll the page to the top when the panel opens, so that Foundation's option carries over.
27. As an application developer, I want `opened` and `closed` emitted when the transition has finished, so that I can run code after the panel is fully shown or hidden, as Foundation's `openedEnd.zf.offCanvas` and `closed.zf.offCanvas` allowed.
28. As an application developer, I want `[(isOpen)]` two-way binding, so that I can open or close the panel from my own state and read it back.
29. As an application developer, I want `open()`, `close()`, and `toggle()` on `#nav="nfsOffCanvas"`, so that I can control the panel from code.
30. As an application developer, I want links inside the panel with `nfsClose` to close it when the visitor navigates, so that the drawer does not stay open over the new route.
31. As a visitor who asked for reduced motion, I want the panel to open and close without the slide, so that the page respects my setting.
32. As a low-vision visitor, I want text and the close button in the panel to meet WCAG AA contrast, and a compile error when the theme breaks that, so that a theme cannot silently fail.
33. As a touch user, I want the close button and the menu icon to accept presses across at least 24 by 24 CSS px, so that I can hit them reliably next to the menu.
34. As a visitor on a 320 px wide screen or at 400 percent zoom, I want the open panel and the pushed page to cause no horizontal scrolling, so that I can use the page at any zoom.
35. As an application developer, I want a Sticky element inside the page content to keep sticking inside the off-canvas wrapper, so that combining the two needs no workaround.
36. As an application developer, I want application-wide defaults for the Options through a Defaults token, so that I set them once.
37. As an application developer, I want development-mode warnings for a copied Foundation class, a missing content link, an unnamed modal panel, a modal panel without a close button, a `revealOn` or `inCanvasOn` naming the Zero breakpoint, and `inCanvasOn` on an absolute panel, so that I catch markup mistakes early.
38. As a developer of a server-rendered application, I want a hamburger tapped before hydration to open the panel once the page hydrates, so that early taps are not lost.
39. As a developer using incremental hydration, I want to wrap the panel, its content, its overlay, and its Triggers in one `@defer (hydrate on ...)` block, so that a tap hydrates and replays correctly.
40. As a developer using `@defer (hydrate never)`, I want to know that a revealed or in-canvas panel still works at its breakpoints and that the drawer stays closed below them, so that I choose that block type knowingly.
41. As a zoneless application developer, I want every state change to be a signal write, so that the directives need no `NgZone` or `markForCheck`.
42. As a tester, I want story ids `off-canvas--<story>` shared by play functions and Playwright, so that every layer tests the same artifact.
43. As an application developer, I want `nfsOffCanvasAbsolute` in place of `nfsOffCanvas` to get Foundation's absolutely positioned `.off-canvas-absolute` panel with the same API, so that a panel can open inside one region of the page as Foundation's alternative class does.
44. As an application developer, I want `nfsOffCanvasWrapper` on the element around my panels and content, so that Foundation's clipping wrapper needs no class either.
45. As an application developer, I want `revealOn` and `inCanvasOn` to accept only the breakpoints my Sass generates reveal and in-canvas classes for, so that a misspelt or class-less breakpoint fails to compile.
46. As an application developer, I want a Runtime check to report a `revealOn` or `inCanvasOn` breakpoint that my compiled CSS has no class for, or a missing `nfs-breakpoint-properties` include, so that a declaration file that drifted from my Sass does not leave a sidebar hidden without a word.
47. As an application developer migrating Foundation markup, I want classes I copied (`position-left`, `is-closed`, `reveal-for-large`) stripped where the directive binds them and reported with the input to use, so that a stale class never fights the bound state.
48. As an application developer, I want a compile error when I rename `$maincontent-class`, so that I learn that the content directive binds Foundation's `.off-canvas-content` and a renamed class would leave the push and reveal rules without an element.
49. As an application developer, I want a `body.is-off-canvas-open` copied into my page shell removed when no locked panel is open, so that a stray class never freezes the page.

## Implementation Decisions

### Foundation contract

From Foundation 6.9's plugin source, Sass, and docs page (the Foundation plugin inventory B, section 6).

Markup: `.off-canvas.position-<side>` (or `.off-canvas-absolute.position-<side>`, "the alternative class" for `position: absolute`) with `data-off-canvas`, placed before its `.off-canvas-content[data-off-canvas-content]` sibling or nested inside it; the docs say the container "requires a positioning class"; an optional `.off-canvas-wrapper` around both hides the pushed content's overflow; Triggers are `data-open`/`data-toggle`/`data-close` with the panel id; a `.close-button` with `data-close` inside the panel. Several panels must come before the content element.

Options (`OffCanvas.defaults`), each mapped or dropped:

| Option | Type | Foundation default | Library |
| --- | --- | --- | --- |
| `closeOnClick` | boolean | `true` | `closeOnClick` input, default `true`: overlay click closes; without an overlay, a click on the linked content closes (Foundation's rule) |
| `contentOverlay` | boolean | `true` | Dropped option: the overlay is the developer's `[nfsOffCanvasOverlay]` element; writing it is `true`, omitting it is `false` |
| `contentId` | string or null | `null` | `content` input taking an `NfsOffCanvasContent` reference; the enclosing content is found through DI when the panel is nested |
| `nested` | boolean or null | `null` | Dropped option: derived; a panel is nested when an `NfsOffCanvasContent` encloses it, and a nested panel uses the overlap transition as in Foundation |
| `contentScroll` | boolean | `true` | `contentScroll` input, default `true`; `false` writes Foundation's `is-off-canvas-open` on `body` while open, from a render callback |
| `transitionTime` | string or null | `null` | Dropped option: the transition length is Foundation's `$offcanvas-transition-length` setting (building-blocks 1.4 timing options) |
| `transition` | `'push'` or `'overlap'` | `'push'` | `transition` input, same values and default (Foundation's JSDoc names `detached` and `slide`, a doc bug) |
| `forceTo` | `'top'`, `'bottom'`, or null | `null` | `forceTo` input, same values and default; `window.scrollTo` in the open render callback |
| `isRevealed` | boolean | `false` | Dropped option: `revealOn` alone decides; Foundation sets `isRevealed` from the class or the pair |
| `revealOn` | breakpoint name or null | `null` | `revealOn` input typed `NfsClassBreakpoint`; binds `reveal-for-<revealOn>` on the panel and reads `NfsMediaQuery.atLeast(revealOn)` for behaviour |
| `inCanvasOn` | breakpoint name or null | `null` | `inCanvasOn` input typed `NfsClassBreakpoint`; binds `in-canvas-for-<inCanvasOn>` and reads `atLeast(inCanvasOn)` for behaviour |
| `autoFocus` | boolean | `true` | `autoFocus` input with Material's union (below), default `true` |
| `revealClass` | string | `'reveal-for-'` | Dropped option: a class-name option; the class is the contract (building-blocks 1.4) |
| `trapFocus` | boolean | `false` | `trapFocus` input, default `false`; with an overlay present it switches on modal mode |
| (none) | | | New: `closeOnEsc` input, default `true`. Foundation always closes on Escape; the input is an addition beyond Foundation (building-blocks 1.4 and audit 0002 M6) |

`position` is not an Option: Foundation reads it from the `.position-*` class and falls back to `left` for its content classes only (its CSS has no look without the class). The library makes it a required Variant input (below). `closeOnClickInside` is not an OffCanvas option (it is DropdownMenu's) and has no counterpart.

Events, all fired on the panel: `opened.zf.offCanvas` synchronously when the open transition starts (despite its name); `openedEnd.zf.offCanvas` on the open `transitionend`; `close.zf.offCanvas` at the start of `close()`; `closed.zf.offCanvas` on the close `transitionend`; `init`/`destroyed` from the base class. There is no `open.zf.offCanvas`. Mapping: `opened.zf.offCanvas` and `close.zf.offCanvas` become the `isOpenChange` output the model generates (request time); `openedEnd.zf.offCanvas` becomes `opened`; `closed.zf.offCanvas` becomes `closed`; `init`/`destroyed` have no counterpart.

Methods: `open(event, trigger)` (no-op when open, revealed, or in-canvas), `close()` (no-op when closed or revealed), `toggle(event, trigger)`, `reveal(isRevealed)`, `destroy()`. The library keeps `open(trigger?)`, `close()`, `toggle(trigger?)`; `reveal()` is internal state driven by `revealOn`.

Keyboard: `Keyboard.register('OffCanvas', {ESCAPE: 'close'})` on a panel `keydown`, unconditional, then focus to the last Trigger and `preventDefault()`.

Dropped behaviours, each with its reason under Further Notes: `aria-hidden` on the panel, the generated overlay, DOM discovery of triggers and content, the class-name regular expressions, the touch scroll handlers and `data-off-canvas-scrollbox`, `data-off-canvas-sticky`, `tabindex="-1"` on the content, the inline `transition-duration`.

### CSS class to Angular mapping

No Foundation or library class is left for the developer to write ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)); the developer writes the panel, content, overlay, and wrapper elements and the directives' attributes.

| Foundation class or element | Kind | Angular | Type, Sass setting, and Variant registry | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.off-canvas` | Structural class | `NfsOffCanvas` under its `[nfsOffCanvas]` selector, host binding | - | `off-canvas` | - |
| `.off-canvas-absolute` | Structural class, Foundation's alternative to `.off-canvas` | `NfsOffCanvas` under its `[nfsOffCanvasAbsolute]` selector, host binding in place of `.off-canvas` | - | `off-canvas-absolute` | - |
| `.position-left`, `.position-right`, `.position-top`, `.position-bottom` | Variant classes, a Closed Variant family | `position` Variant input of `NfsOffCanvas`, required | `NfsOffCanvasPosition`, closed: `'left' \| 'right' \| 'top' \| 'bottom'`; `foundation-off-canvas` writes the four classes itself and no Sass setting lists them, so there is no registry | `position-<value>` (`position="left"` sets `.position-left`); there is no unset state | none (closed) |
| `.reveal-for-<bp>` | Variant classes over Class breakpoints | `revealOn` Option of `NfsOffCanvas` | `NfsClassBreakpoint \| null`; `$breakpoint-classes`, `NfsBreakpointClassesOverrides` (Open Variant family) | `reveal-for-<value>` for a Class breakpoint above the Zero breakpoint (`revealOn="large"` sets `.reveal-for-large`); the Zero breakpoint sets none and warns in development (Foundation generates no Zero-breakpoint class); `null` sets none | `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties` |
| `.in-canvas-for-<bp>` | Variant classes over Class breakpoints | `inCanvasOn` Option of `NfsOffCanvas` | the same as `revealOn` | `in-canvas-for-<value>`, with the same Zero-breakpoint and `null` rules | `--nfs-breakpoint-classes` |
| `.is-transition-push`, `.is-transition-overlap` | Foundation's JavaScript classes for its `transition` Option | Host binding from the resolved transition (overlap when nested) | the Option's `'push' \| 'overlap'` (an Option, not a Variant input) | - | - |
| `.is-open`, `.is-closed` | State classes | Host bindings from the phase on the panel | - | - | - |
| `.off-canvas-content` | Structural class | `NfsOffCanvasContent` (`[nfsOffCanvasContent]`), static host class | - | `off-canvas-content` | - |
| `.is-open-<pos>`, `.has-transition-<t>`, `.has-position-<pos>`, `.has-reveal-<pos>` on the content | State classes | Host class record on `NfsOffCanvasContent`, computed from its linked panels | - | - | - |
| `.js-off-canvas-overlay` | Structural class of the overlay Foundation generated | `NfsOffCanvasOverlay` (`[nfsOffCanvasOverlay]`), static host class, on a plain element the developer writes after the panel | - | `js-off-canvas-overlay` | - |
| `.is-overlay-fixed`, `.is-overlay-absolute` | Foundation's JavaScript classes for the panel's positioning | Host bindings on `NfsOffCanvasOverlay` from its panel: `is-overlay-absolute` for an `nfsOffCanvasAbsolute` panel, else `is-overlay-fixed` | - | - | - |
| `.is-visible`, `.is-closable` on the overlay | State classes | Host bindings on `NfsOffCanvasOverlay` | - | - | - |
| `.off-canvas-wrapper` | Structural class | `NfsOffCanvasWrapper` (`[nfsOffCanvasWrapper]`), static host class | - | `off-canvas-wrapper` | - |
| `body.is-off-canvas-open` | State class on an element that carries no library directive | Written on `body` with `Renderer2` by the Scroll lock, from a render callback | - | - | - |
| `.close-button` | Structural class of the Close Button | `button[nfsCloseButton]` ([Spec: Close Button](../issues/83-spec-close-button.md)) with a bare `nfsClose` beside it | - | `close-button` | - |
| `.title-bar`, `.title-bar-left`, `.title-bar-right`, `.title-bar-title`, `.menu-icon` | Structural classes of the Title Bar and Menu icon | `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarRight`, `nfsTitleBarTitle`, and `button[nfsMenuIcon]` with a Trigger beside it ([Spec: Top Bar](../issues/86-spec-top-bar.md)) | - | - | - |
| `data-open`/`data-toggle`/`data-close` | Trigger attributes | `nfsOpen`, `nfsToggle`, `nfsClose` from the Triggers utility | - | - | - |
| `data-autofocus` on a descendant | attribute, not a class | Kept as a plain attribute that `autoFocus: true` looks for first | - | - | - |

Reasons, row by row:

- `.off-canvas` and `.off-canvas-absolute`: Foundation's docs call `.off-canvas-absolute` "the alternative class" and its Sass builds both from `off-canvas-base`, one `position: fixed` and one `position: absolute`; the second is not a modifier on the first, so it is a Structural class with a directive attribute of its own (building-blocks 1.1, one directive per Structural class). Both attributes select the one `NfsOffCanvas` class, which reads which attribute is present through `HostAttributeToken('nfsOffCanvasAbsolute')` at construction and binds exactly one of the two classes, so the Openable, its API, and `exportAs: 'nfsOffCanvas'` are the same (D25). A `class="off-canvas"` copied onto an `nfsOffCanvas` host merges with the binding and is not reported (building-blocks 1.4).
- `position`: Foundation's class template `position-<side>`, its Sass mixin's `$position` parameter, its JavaScript's `this.position`, and its content classes `has-position-<side>` all name the dimension, so the input is `position` (building-blocks 1.4 naming rule 3). It is required: Foundation's docs say the panel "requires a positioning class", its CSS gives a panel without one no transform, size, or offset, and no Sass setting names a default side, so ADR 0040's default rule, which lets an unset input fall back to the look the Sass settings give, has no such look to fall back to (D6). Foundation's docs also title the fixed-or-absolute section "Off-canvas Position"; the closed type rejects `position="absolute"` at compile time, and `nfsOffCanvasAbsolute` is the way to that.
- `revealOn` and `inCanvasOn`: Foundation `data-*` Options that name their families keep their names (building-blocks 1.4 naming rule 1). They set a class only for Class breakpoints, so they are typed `NfsClassBreakpoint` (building-blocks 1.7), and are Options with no Defaults token slot, as before. The breakpoint that triggers behaviour is the same name, passed to `atLeast()` unchanged, because every Class breakpoint is a key of the Breakpoint map. Foundation's loops skip the Zero breakpoint, so a panel "revealed from the Zero breakpoint" would carry no class and never show; the directive treats that value as `null` and warns (D28).
- `.is-transition-*`: the developer never wrote them in Foundation's markup; Foundation's JavaScript added them from `data-transition` and removed a written `is-transition-push` from a nested panel. The class follows the `transition` Option, which also decides the content's push, so `transition` stays an Option with a Defaults token slot, as Reveal's `overlay` does for `.without-overlay`.
- `.js-off-canvas-overlay` and `is-overlay-*`: Foundation generated the element and chose `is-overlay-fixed` or `is-overlay-absolute` from the panel's computed `position`; the library reads the panel's Structural class instead, which is known on the server, so both classes are in server HTML (D27). The directive keeps its name, `NfsOffCanvasOverlay`, rather than one built from Foundation's `js-` hook prefix.
- `.off-canvas-wrapper`: a directive that binds only its class (building-blocks 1.1; ADR 0039 names this class among those that gain directives). It provides no token: the panel's reflow check reads the wrapper as a DOM ancestor, because Foundation's clip works by DOM ancestry, and a projected content would break a DI link (D26; the Top Bar spec's D13 reasoning).
- `.off-canvas-content`: `$maincontent-class` renames it in Foundation's Sass. The directive binds `off-canvas-content`, and no input may carry a class name (ADR 0039), so `nfs-off-canvas` stops the compile when the setting is renamed (D29).
- `body.is-off-canvas-open`: `body` carries no library directive and the lock has no first-paint value, so the Scroll lock writes it with `Renderer2`, removes it on destroy, and strips a copy (the user's decision recorded by the [Re-run: Magellan spec under the class rule](../issues/122-rerun-magellan-class-rule.md); building-blocks 1.5; D31).
- Binding rule (building-blocks 1.4, initial state): the panel binds one computed class record holding both Structural classes, the four position classes, both transition classes, `is-open` and `is-closed`, and `reveal-for-<bp>` and `in-canvas-for-<bp>` for every breakpoint of `nfsBreakpointsToken`'s map above the Zero breakpoint (plus the bound value, should it be a Class breakpoint the map lacks), each `true` or `false`, so a copied Foundation class is stripped on the server and in the browser; the content binds its fourteen State classes the same way. No directive reads a static class to seed state or a Variant: the static `class` attribute is read in development builds only, to report copies (development check 1). The consumer's own classes stay.
- No Openable writes a class on its Triggers ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md), D18); the Off-canvas never did.

### Hierarchy and DI shape

```
div [nfsOffCanvasWrapper]                                         binds .off-canvas-wrapper
  div [nfsOffCanvas] position="left" #nav="nfsOffCanvas" [content]="page"
                                                                  binds .off-canvas, .position-left, State classes
      provides nfsOpenableToken (useExisting)
    button [nfsCloseButton] nfsClose                              bare Trigger -> Nearest Openable = the panel
  div [nfsOffCanvasOverlay]="nav"                                 binds .js-off-canvas-overlay, .is-overlay-fixed; registers with the panel
  div [nfsOffCanvasContent] #page="nfsOffCanvasContent"           binds .off-canvas-content and the content State classes
      provides nfsOffCanvasContentToken (useExisting)
    div [nfsTitleBar] > div [nfsTitleBarLeft] > button [nfsMenuIcon] [nfsToggle]="nav"
                                                                  24 by 24 px box from nfs-menu-icon (2.5.8)
    div [nfsOffCanvas] position="right"                           nested: finds the content through DI, overlap forced
```

- The panel is the Openable: `providers: [{provide: nfsOpenableToken, useExisting: NfsOffCanvas}]`, so a bare `nfsClose` or `nfsToggle` inside it resolves it (Triggers spec, ADR 0013). A Trigger outside names it by reference.
- Panel to content: the `content` input wins when bound; otherwise `inject(nfsOffCanvasContentToken, {optional: true, skipSelf: true})` finds the enclosing content, which is also what makes the panel nested. A sibling panel has no enclosing content, so Foundation's sibling discovery becomes the `content` reference. The panel registers itself with its content from an `effect` whose cleanup unregisters (the reverse-link shape of the Triggers and Responsive Toggle specs, and the exception building-blocks 1.5 and 1.9 name for it: the `content` reference can change at runtime, which `ngOnInit` cannot follow, and the effect writes only the content's registry signal); it writes no DOM, so it runs on the server, and view effects run before host bindings of the same view, so the content's classes are right in the first pass when both sit in one template.
- Overlay to panel: `[nfsOffCanvasOverlay]="nav"` is a required reference; the overlay registers with the panel from an `effect` the same way, which tells the panel it has an overlay (Foundation's `contentOverlay`). Its `is-overlay-*` class reads the referenced panel's `absolute` directly, so it is right in the first pass.
- `nfsOffCanvasContentToken = new InjectionToken<NfsOffCanvasContent>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsOffCanvasContentToken (provided by NfsOffCanvasContent from 'ngx-foundation-sites/off-canvas' on an ancestor element declared in the same template)" : '')`, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in a token file that imports only types (lightweight token). No panel token: nothing injects the panel by class; `nfsOpenableToken` serves descendants and `exportAs` serves templates. No wrapper token (D26).
- Defaults token, Shape B (building-blocks 1.4): `nfsOffCanvasDefaultsToken` with the all-optional `NfsOffCanvasDefaults` (`transition`, `closeOnClick`, `closeOnEsc`, `contentScroll`, `forceTo`, `autoFocus`, `trapFocus`), read with `inject(token, {optional: true})` to seed input defaults; nearest provider wins. It holds no Variant input's default (building-blocks 1.4), so `position` is not in it.
- Injected by the panel: `NfsMediaQuery` (Breakpoint service), `nfsBreakpointsToken` (the Zero breakpoint, as `nfsBreakpointForWidth(map, 0)`, and the keys of the breakpoint class record), `nfsVariantCheck('nfsOffCanvas')` (or `'nfsOffCanvasAbsolute'`, by selector) for the Runtime checks, `nfsAnimationsToken`, CDK `FocusTrapFactory` (only used when `trapFocus` is on), CDK `InteractivityChecker`, CDK `_IdGenerator`, `DOCUMENT`, `Renderer2` (the Modal inert set, the listeners added while open, the focus containment listeners, and the `body` class, which it passes to the Scroll lock), `NgZone` (fallback timer outside the zone), `DestroyRef`, `HostAttributeToken('id')`, `HostAttributeToken('nfsOffCanvasAbsolute')` (optional: which selector matched), `HostAttributeToken('class')` (in a field initialiser that exists in development builds only: the copied-class check), and `NfsOffCanvasScrollLock`.
- `NfsOffCanvasScrollLock`, an internal `@Service()` of the entry point (not public API), holds the Scroll lock count for the document: the open panels with `contentScroll: false`. The first to lock adds `is-off-canvas-open` to `body`, and the last to release removes it, each with the `Renderer2` of the panel that makes the call, so the service needs no `RendererFactory2`; so the class stays while a second locked panel is open; a locked panel destroyed while open releases its lock in `DestroyRef.onDestroy`. At the first panel's first render callback, while the count is zero, it removes an `is-off-canvas-open` it finds on `body` (a copy in the page shell) and reports it in development builds. A service is allowed here for the reason building-blocks 1.5 gives, state shared across instances, as Reveal's `NfsRevealStack` holds its own count (amended 2026-09-26, audit 0005 unrecorded departure 5).
- Entry point: `ngx-foundation-sites/off-canvas`, holding the four directives, the tokens, and the types; it imports `nfsOpenableToken` from the Triggers entry point, `NfsMediaQuery`, `nfsBreakpointsToken`, `nfsBreakpointForWidth`, and `nfsVariantCheck` from the media-query entry point, and `NfsClassBreakpoint` from the primary entry point as a type only.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsOffCanvas` calls `nfsDirectiveCheck('NfsOffCanvas')` under both selectors: no parent check, because its `nfsOffCanvasContentToken` injection stays optional with a supported `null`: a sibling panel binds `content` instead, and inputs are not set at construction, so it passes no parent. Development check 3 stays the report for a panel whose configuration needs a content and has none, the bare case the family rule's item 2 names. A panel inside an element that carries `nfsOffCanvasContent` without its directive has lost that content's import, which `strictDirectiveImports` reports with the import to add (M1), and a working wrapper's child probe (M2), so check 3 says nothing there (the shared spec's rule for a check that finds a peer by registration). No child probes: the close button, the Triggers, the title bar, and the menu inside the panel belong to other families, and an Openable probes no Trigger ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)). Peers: its `content`, by reference (`[content]="page"` with `#page="nfsOffCanvasContent"`), whose forgotten import fails to compile with NG8003, and its overlay, which reaches it by reference (below); `strictParents` changes nothing (the kept-optional list of the forgotten-import checks spec).
  - `NfsOffCanvasContent` calls `nfsDirectiveCheck('NfsOffCanvasContent', {children: ['NfsOffCanvas']})`: no parent check (it injects none); it probes the panels nested in it, which reach it through dependency injection and often through no reference, so a nested panel whose import was forgotten is reported (M2); no peers of its own (a sibling panel names it by reference); `strictParents` changes nothing.
  - `NfsOffCanvasOverlay` calls `nfsDirectiveCheck('NfsOffCanvasOverlay')`: no parent check (its panel is a required reference, not an injection); no child probes; peers: its panel, by reference (`[nfsOffCanvasOverlay]="nav"`), so a forgotten overlay import fails to compile with NG8002 and a forgotten panel import with NG8003 on `#nav="nfsOffCanvas"`; `strictParents` changes nothing.
  - `NfsOffCanvasWrapper` calls `nfsDirectiveCheck('NfsOffCanvasWrapper', {children: ['NfsOffCanvas', 'NfsOffCanvasContent']})`: no parent check (it injects none and provides nothing, D26); it probes the panels and contents inside it, so a forgotten panel or content import inside a working wrapper is reported (M2) even where no reference names the element; no peers; `strictParents` changes nothing. A wrapper written as `nfsOffCanvasWrapper` whose own import was forgotten is reported by `strictDirectiveImports` (M1) and the static check, and development check 3 leaves it to them.
  - No Off-canvas directive sits on `ng-template` or `ng-container`.

### API

```ts
type NfsOffCanvasPosition = 'left' | 'right' | 'top' | 'bottom';
type NfsOffCanvasTransition = 'push' | 'overlap';
type NfsOffCanvasAutoFocus = boolean | 'first-tabbable' | 'first-heading' | (string & {}); // string = CSS selector

class NfsOffCanvas implements NfsOpenable {   // selector [nfsOffCanvas], [nfsOffCanvasAbsolute]; exportAs 'nfsOffCanvas'
  readonly position: InputSignal<NfsOffCanvasPosition>;           // required Variant input
  readonly transition: InputSignal<NfsOffCanvasTransition>;      // default 'push'
  readonly content: InputSignal<NfsOffCanvasContent | undefined>; // Foundation contentId
  readonly closeOnClick: InputSignalWithTransform<boolean, unknown>;  // default true
  readonly closeOnEsc: InputSignalWithTransform<boolean, unknown>;    // default true (new)
  readonly contentScroll: InputSignalWithTransform<boolean, unknown>; // default true
  readonly forceTo: InputSignal<'top' | 'bottom' | null>;         // default null
  readonly revealOn: InputSignal<NfsClassBreakpoint | null>;      // default null
  readonly inCanvasOn: InputSignal<NfsClassBreakpoint | null>;    // default null
  readonly autoFocus: InputSignal<NfsOffCanvasAutoFocus>;         // default true
  readonly trapFocus: InputSignalWithTransform<boolean, unknown>; // default false
  readonly isOpen: ModelSignal<boolean>;                          // default false
  readonly opened: OutputEmitterRef<void>;                        // Completion output
  readonly closed: OutputEmitterRef<void>;                        // Completion output
  readonly absolute: boolean;                                     // true under the nfsOffCanvasAbsolute selector
  readonly id: Signal<string>;
  readonly triggerRole: Signal<'disclosure' | 'modal-dialog'>;
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;                                  // result ignored
  toggle(trigger?: HTMLElement): void;
  registerTrigger(trigger: HTMLElement): () => void;
}

class NfsOffCanvasContent {   // selector [nfsOffCanvasContent], exportAs 'nfsOffCanvasContent'; no inputs or outputs
}

class NfsOffCanvasOverlay {   // selector [nfsOffCanvasOverlay]; exportAs 'nfsOffCanvasOverlay'
  readonly panel: InputSignal<NfsOffCanvas>;  // alias 'nfsOffCanvasOverlay', required
}

class NfsOffCanvasWrapper {   // selector [nfsOffCanvasWrapper]; exportAs 'nfsOffCanvasWrapper'; no inputs, outputs, or providers
}
```

`position` is declared `input.required<NfsOffCanvasPosition>()` with the explicit type argument naming the exported alias, which the Variant typings check asserts in the emitted typings (building-blocks 1.4, authoring). `revealOn` and `inCanvasOn` declare `NfsClassBreakpoint | null` the same way.

| Member | Foundation | Behaviour and deltas |
| --- | --- | --- |
| selectors | `.off-canvas` or `.off-canvas-absolute` with `data-off-canvas` | `[nfsOffCanvas]` binds `.off-canvas` (`position: fixed`); `[nfsOffCanvasAbsolute]` binds `.off-canvas-absolute` (`position: absolute`, bounded by the nearest positioned ancestor, usually the wrapper) and nothing else changes. Both on one element: absolute wins and a development warning fires (check 2) |
| `position` | the `.position-<side>` class, required by the docs | Required: a missing binding is a template compile error under strict templates. Sets `position-<value>` and nothing for the other three; the content's `is-open-<pos>`, `has-position-<pos>`, and `has-reveal-<pos>` use the same value. A bound value may change at runtime; the classes follow |
| `transition` | `data-transition`, `'push'` | Binds `is-transition-<t>`; a nested panel uses `overlap` whatever the input says (Foundation's rule, silent) |
| `content` | `data-content-id` | Typed reference; a bound value wins over the enclosing content. Without either, nothing is pushed or clicked to close, and a development warning fires when the configuration needs a content (push, or `closeOnClick` without an overlay); modal mode needs none, because its Modal inert set covers everything outside the panel whether a content is linked or not |
| `closeOnClick` | `data-close-on-click`, `true` | Overlay `click` closes; with no overlay registered, a `click` inside the linked content closes, except clicks inside the panel or on a registered Trigger (Foundation's content listener would also catch the Trigger's own click) |
| `closeOnEsc` | none | New, default `true` = Foundation's unconditional Escape. `false` stops Escape from closing; in modal mode a close control inside the panel is then required (2.1.2), and a non-modal panel loses the 2.4.11 escape route; both cases warn in development mode |
| `contentScroll` | `data-content-scroll`, `true` | `false` adds `is-off-canvas-open` to `body` from the open render callback until the close transition completes; Foundation's `overflow: hidden` does the locking; the touch handlers are dropped |
| `forceTo` | `data-force-to`, `null` | `window.scrollTo(0, 0)` or to the document's scroll height, in the open render callback before focus moves and before the lock |
| `revealOn` | `data-reveal-on` or `.reveal-for-<bp>`, `null` | A Class breakpoint. Binds `reveal-for-<revealOn>` (server HTML included). While `atLeast(revealOn)`: `open()` is a no-op, the content gets `has-reveal-<pos>`, and crossing into the range closes an open panel. The Zero breakpoint behaves as `null` and warns in development (check 7). A copied `reveal-for-*` class is stripped and reported, naming the input (check 1) |
| `inCanvasOn` | `data-in-canvas-on` or `.in-canvas-for-<bp>`, `null` | A Class breakpoint. Binds `in-canvas-for-<inCanvasOn>`; while `atLeast(inCanvasOn)`: `open()` is a no-op and crossing into the range closes an open panel. The Zero breakpoint behaves as `null` and warns; on an `nfsOffCanvasAbsolute` panel the class does nothing, because Foundation's in-canvas rule selects `.off-canvas`, and a development warning fires (check 7) |
| `autoFocus` | `data-auto-focus`, `true` | Where focus goes when the panel opens: `true` and `'first-tabbable'` focus the first descendant carrying `data-autofocus`, else the first tabbable descendant (`InteractivityChecker`; Foundation looked only at `a, button`); `'first-heading'` focuses the first `h1`-`h6` or `[role="heading"]`; a string focuses the first match of that selector; `false` moves nothing. A heading or selector match that is not focusable gets `tabindex="-1"`, removed on blur (Material's rule). The panel element itself is never focused (building-blocks 1.10); kind `insertion` (building-blocks 1.4): a static `autoFocus` (`autoFocus="first-heading"`, as the Usage example writes it) also renders HTML's `autofocus`, which does nothing on the panel, because the panel is never focusable, so the static form stays supported; the host binds `'[attr.autofocus]': 'null'`, which keeps the attribute, not a valid value for a boolean attribute, out of the server HTML |
| `trapFocus` | `data-trap-focus`, `false` | With an overlay registered: modal mode (below). Without one: a CDK `FocusTrap` wraps Tab inside the panel (Foundation's behaviour) but the panel stays a disclosure, and a development warning says it is not announced as modal |
| `isOpen` | the `is-open` class | `model(false)`; `true` from the moment an open is requested. It is the requested state: a panel whose `isOpen` is `true` while revealed or in-canvas shows nothing extra (see the state model). A panel open at first paint is `[(isOpen)]` or `[isOpen]="true"`, never a written `is-open` class |
| `isOpenChange` | `opened.zf.offCanvas`, `close.zf.offCanvas` | Generated by the model, at request time |
| `opened` / `closed` | `openedEnd.zf.offCanvas`, `closed.zf.offCanvas` | After the panel's `transform` transition ends, or at once when none runs; an interrupted direction emits nothing |
| `open(trigger?)` | `open(event, trigger)` | No-op when already open or while revealed or in-canvas; records `trigger` for focus return |
| `close()` | `close()` | Sets `isOpen` to `false`; no veto; no result |
| `toggle(trigger?)` | `toggle(event, trigger)` | `isOpen() ? close() : open(trigger)` |
| `registerTrigger` | the document-wide trigger search at init | Records Triggers for the focus-return fallback, the content-click exclusion, and development checks; Triggers added later are included (Foundation's were not) |
| `absolute` | `.off-canvas-absolute` on the panel | Read-only, fixed at construction from the matched selector; the overlay reads it for `is-overlay-*` |
| `id` | the panel id | A static `id` attribute wins; otherwise `_IdGenerator` with the prefix `nfs-off-canvas-`. Consumers set `id` statically |
| `triggerRole` | none | `'modal-dialog'` in modal mode, else `'disclosure'` |
| `panel` (overlay) | the generated overlay's owner | Required typed reference |

Modal mode is `trapFocus() && hasOverlay()`, the APG's condition (both blocking and obscuring): the panel binds `role="dialog"` and `aria-modal="true"` while it is open and not revealed or in-canvas, once focus is inside the panel, the panel sets `inert` on every element sibling of the panel and of each of its ancestors up to `body` that is not already inert, except `.js-off-canvas-overlay` elements, the CDK focus-trap anchors, elements carrying `aria-live` or `popover`, and CDK's `body` containers `.cdk-overlay-container` and `.cdk-describedby-message-container` (the Modal inert set); it records the elements it changed and removes `inert` from exactly those at the close request, before focus returns; a panel destroyed while the set is applied removes it in `DestroyRef.onDestroy`. A sibling content is in the set; the enclosing content of a nested panel is an ancestor, so it is never made inert while its other children are. The exceptions follow CDK Dialog's background hiding, which skips `aria-live` and `popover` elements: live regions placed along the chain, such as CDK's `LiveAnnouncer` element, stay announceable, and a live region inside an inerted element is inert with it; and the overlays and description messages that controls inside the panel open or use stay reachable. The overlay exception matches the class `NfsOffCanvasOverlay` binds on every overlay, so it also spares another panel's overlay. A CDK `FocusTrap` wraps Tab, and the Trigger role is `modal-dialog`, because every Trigger outside the panel is inert while it is open, apart from the edge cases listed under ARIA and keyboard ([Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md), its rule; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)). The panel's name comes from the developer's `aria-labelledby` or `aria-label` on the panel element; a modal panel without either warns in development mode.

State model, all signals (no `effect` propagates state; the two registration effects above write only the target's registry signal, the reverse-link exception of building-blocks 1.5):

- `isOpen`: the model.
- `#live`: `false` until the panel's first `afterNextRender`; never set on the server.
- `#zero`: the Zero breakpoint, `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, fixed at construction, the same on server and client.
- `#revealOn` and `#inCanvasOn`: `computed`, the input, or `null` when it names `#zero`.
- `#revealed` and `#inCanvas`: `computed` from `#revealOn`/`#inCanvasOn` and `NfsMediaQuery.atLeast()`; the Server breakpoint's answer on the server and until the service goes live (ADR 0014).
- `#active`: `computed`, `isOpen() && !#revealed() && !#inCanvas()`. Everything an open panel does to the page (overlay, content classes, `inert`, scroll lock, focus trap, Escape listener, dialog role) follows `#active`, never `isOpen` alone, so a stale `isOpen` can never leave an overlay over a sidebar.
- `#phase`: a `linkedSignal` of `#active` returning `'idle'` for the first value and while `#live` (read untracked) is `false`, else `'entering'` or `'exiting'`; completion writes `'idle'`.
- `#modal`: `computed`, `trapFocus() && #overlay() !== undefined`.
- `#focusPlaced`: a signal the open render callback sets after it has moved focus, cleared by every close.
- `#nested`: fixed at construction (an enclosing content was injected); `#transition`: `computed`, `'overlap'` when nested, else the input.
- `absolute`: fixed at construction from the matched selector.
- `#classes`: `computed`, the panel's class record (binding rule above) from `absolute`, `position()`, `#transition()`, the phase, and `#revealOn`/`#inCanvasOn`.

| State | `#active` | `#phase` | Panel classes | Panel attributes | Content classes | Overlay classes |
| --- | --- | --- | --- | --- | --- | --- |
| Closed | `false` | idle | `is-closed` | none | none | none |
| Entering | `true` | entering | `is-open` | `role`, `aria-modal`, and the Modal inert set once focus is inside (modal) | `is-open-<pos> has-transition-<t> has-position-<pos>` | `is-visible`, `is-closable` (with `closeOnClick`) |
| Open | `true` | idle | `is-open` | as entering | as entering | as entering |
| Exiting | `false` | exiting | none | `inert` | `has-transition-<t> has-position-<pos>` | none (Foundation's fade out) |
| Revealed or in-canvas | `false` | idle | `is-closed` plus the Foundation breakpoint class, whose CSS wins at the breakpoint | none | `has-reveal-<pos>` while revealed | none |

The Structural class (`off-canvas` or `off-canvas-absolute`), `position-<pos>`, `is-transition-<t>`, and the `reveal-for-*`/`in-canvas-for-*` classes are bound in every state, and the overlay's `js-off-canvas-overlay` and `is-overlay-<fixed|absolute>` too. The panel keeps `is-closed` while revealed or in-canvas: Foundation's `.position-<side>.reveal-for-<bp>` and `.off-canvas.in-canvas-for-<bp>` rules come later in `foundation-off-canvas` at the same specificity and set `visibility: visible`, so no class changes with the breakpoint and server HTML is identical at every width. `inert` is on the panel only while exiting, never on a closed panel (building-blocks 1.10: an `inert` there would disable the revealed sidebar).

Breakpoint reactions, in one `afterRenderEffect` that records its first values and acts only on later changes (so the first-render handoff never acts):

- Crossing into the revealed or in-canvas range while `isOpen` is `true` writes `isOpen` to `false` (Foundation's `reveal(true)` and `_checkInCanvas` both call `close()`). Focus is not moved, because the panel stays visible. This differs from the Responsive Toggle spec, whose menu keeps its state across a crossing because it looks the same either way; here an open drawer would come back as an overlay the user never reopened, and a revealed panel cannot be closed by the user.
- Crossing out of the range while focus is inside the now hidden panel moves focus to the first registered Trigger outside the panel (building-blocks 1.10 focus persistence). Foundation's CSS hides the panel at the crossing (`.reveal-for-<bp>` or `.in-canvas-for-<bp>` stops matching and `.off-canvas.is-closed { visibility: hidden }` applies) before any render callback runs, and the browser then moves focus to `<body>`, so a callback that reads `document.activeElement` is too late (building-blocks 1.5). Containment is therefore recorded continuously by `focusin`/`focusout` listeners on the panel host, which survives the crossing (the Breakpoint service's consuming-directive rule 1, third place): `focusin` sets the record, a `focusout` whose `relatedTarget` lies outside the panel clears it, and a `focusout` without a `relatedTarget` (focus dropped to `<body>`) keeps it. The listeners are added with `Renderer2.listen` in `afterNextRender`, which first seeds the record from live focus (a focus placed in a server-rendered sidebar before hydration counts); being added in code, they put no `jsaction` in server HTML and never replay. The move runs in the `write` phase keyed on rendered state: it acts only when the record is set, the panel's computed `visibility`, read in `earlyRead`, is `hidden` (the state Foundation's CSS has rendered, not the Breakpoint service's answer), and `document.activeElement` is `<body>` or inside the panel; it then clears the record.

Development-mode checks, each once per instance, in render callbacks that exist only when `ngDevMode` is on and never on the server:

1. The host's static `class` holds a Foundation class the directive binds, read in a development-only field initialiser because a stripped class is gone from the element by the first render: a position class ("bind position="right""), `is-open` or `is-closed` ("bind [isOpen]"), `is-transition-*` ("bind transition"), `reveal-for-*` or `in-canvas-for-*` ("bind revealOn="large""), or the other Structural class (`off-canvas-absolute` on an `nfsOffCanvas` host: "write nfsOffCanvasAbsolute"; `off-canvas` on an `nfsOffCanvasAbsolute` host). A redundant `off-canvas` on an `nfsOffCanvas` host merges and is not reported.
2. Both `nfsOffCanvas` and `nfsOffCanvasAbsolute` on one element (absolute is used).
3. No content linked when the configuration needs one (push, or `closeOnClick` without an overlay); a panel with an ancestor that carries `nfsOffCanvasContent` without its class is not reported here, because that content's `NfsOffCanvasContent` import was forgotten, which `strictDirectiveImports` reports on the content (M1), so check 3 never names the wrong fix. A push panel whose content has no ancestor in the DOM that carries `nfsOffCanvasWrapper` or `.off-canvas-wrapper` (1.4.10), naming `nfsOffCanvasWrapper`. An ancestor that carries the attribute without the class is a wrapper whose `NfsOffCanvasWrapper` import was forgotten: `strictDirectiveImports` reports it on the wrapper with the import and the component (M1 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), so check 3 does not report it again and never asks for an attribute the developer already wrote (2026-09-29).
4. Modal mode without `aria-label` or `aria-labelledby` on the panel; modal mode without a registered Trigger inside the panel (a close button, APG and 2.1.2); modal mode with `autoFocus: false`.
5. `trapFocus` without an overlay; `closeOnEsc: false` on a non-modal panel (2.4.11).
6. A registered Trigger outside the panel that is rendered while the panel is revealed or in-canvas (it would do nothing: hide it at that breakpoint with `nfsVisibility` of the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)).
7. `revealOn` or `inCanvasOn` naming the Zero breakpoint ("Foundation generates no Zero-breakpoint reveal or in-canvas class; a panel shown at every width is not an off-canvas panel"); `inCanvasOn` on an `nfsOffCanvasAbsolute` panel ("Foundation's in-canvas rule selects .off-canvas; use nfsOffCanvas").
8. A revealed `position-top` or `position-bottom` panel whose computed `position` is `fixed` while the document's `scroll-padding-top` (or `-bottom`) is smaller than the panel's height (2.4.11).
9. An overlay placed inside an element the Modal inert set covers (the linked content, for example).
10. (The Scroll lock, at the first panel's first render) a copied `is-off-canvas-open` on `body` while no locked panel is open, removed before the report.

A breakpoint that is a Class breakpoint in the Variant declaration file but has no classes in the compiled CSS is not a development check: the Runtime check reports it (below), in development by default and in production on opt-in.

Runtime checks (ADR 0040; the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md), Runtime checks): the panel calls `nfsVariantCheck` once at construction and, when the handle is not `null`, reports from its own `afterRenderEffect` read phase, which also holds the development checks and exists only when `ngDevMode` is on or the handle exists. While `revealOn` or `inCanvasOn` is bound it calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('revealOn', value, needs)` and `value('inCanvasOn', value, needs)` for each bound one, with `needs` `[{setting: 'breakpoint-classes', name: value}]` for a Class breakpoint above the Zero breakpoint and `[]` for the Zero breakpoint (check 7 reports that one, so one mistake makes one report). With neither bound the panel reads no Variant property and calls nothing, so an application without reveal or in-canvas panels needs no `nfs-breakpoint-properties` include for this entry point. `position` is a closed family that reads no property, and the overlay, content, and wrapper have no Variant input.

### Implementation level and primitives

Implementation level: native platform CSS and attributes (Foundation's transform transition and visibility classes, `inert`, `transitionend`) plus custom Angular directives for classes, state, links, and focus; `@angular/cdk` supplies `FocusTrap`, `InteractivityChecker`, and `_IdGenerator`. `@angular/aria` 22.2 has no disclosure, dialog, or drawer pattern. Native `<dialog>` was weighed for the overlap and modal cases and rejected ([ADR 0030](../adr/0030-off-canvas-no-dialog.md), "OffCanvas panels are not `<dialog>` elements"): the same element must be a visible, non-dialog sidebar or page element at `revealOn`/`inCanvasOn` in server HTML, which a closed `<dialog>` (`display: none`, implicit `dialog` role) cannot be; Foundation's transform transition cannot start from `display: none` without `@starting-style`, which is outside the Browser target; and Foundation's default panel is not modal. `popover` and `CloseWatcher` are outside the target. `Directionality` is not used: Foundation's off-canvas Sass is physical (`.position-left` slides from the left in both directions), and the library keeps the class contract.

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Classes of the panel, content, overlay, and wrapper | Host bindings (static host classes and computed class records) | First-paint state in server HTML (building-blocks 1.11 decision 1); true or false values strip copies (building-blocks 1.4) |
| Panel-to-content and overlay-to-panel registration | `effect` | Writes only the target's registry signal, runs on the server too, so server HTML already has the content and overlay classes; cleanup unregisters when the reference changes or the directive is destroyed (the reverse-link exception of building-blocks 1.5 and 1.9) |
| Live flag | `afterNextRender` (`write`) | Marks the end of the first render so the initial state never animates |
| Phase machine: timing, focus, scroll, lock, trap, timer | `afterRenderEffect`: `earlyRead` reads `document.activeElement` (the focus-return fallback) and the panel's computed `transition-property`, `transition-duration`, and `transition-delay` after the class change; `write` runs `forceTo`, moves focus with `preventScroll: true` then sets `#focusPlaced`, enables or disables the `FocusTrap`, applies the Modal inert set after `#focusPlaced` and removes it at the close request, takes or releases the Scroll lock, returns focus on close, and starts the fallback timer outside the zone; cleanup clears the timer and removes an applied Modal inert set | Needs layout and the DOM after the classes are applied, never on the server |
| Escape listener and content-click listener | `afterRenderEffect` (`write`) adding them with `Renderer2.listen` while `#active`, removed in its cleanup | Exist only while a panel is open; not replayed, which is correct because nothing is open before hydration |
| Focus containment record | `afterNextRender` adding `focusin`/`focusout` on the panel with `Renderer2.listen`, seeded from live focus; removed on destroy | A continuous record on a host that survives a crossing (the Breakpoint service's consuming-directive rule 1); added in code, so no `jsaction` and no replay |
| Breakpoint reactions | `afterRenderEffect`: `earlyRead` reads the panel's computed `visibility`, `write` closes or moves focus using the containment record | Reacts to the live breakpoint after the first render only, and moves focus on the state Foundation's CSS has rendered, because the CSS hides the panel before any callback runs (building-blocks 1.5) |
| Development checks and Runtime check calls | `afterRenderEffect` (`read`), only when `ngDevMode` is on or the `nfsVariantCheck` handle exists; the Scroll lock's copied-class check in the first panel's `afterNextRender` | Reads computed style and the DOM, and custom properties on `:root` |
| `afterEveryRender` | Not used | Nothing needs to run on renders that change none of the panel's signals |
| `injectAsync` | Not used | `FocusTrapFactory` and `InteractivityChecker` are small and must be ready in the same render pass as a replayed open, so focus moves in the first frame; each plugin's entry point already lets a developer's `@defer` split the whole plugin |

Completion: on a `transitionend` host listener on the panel with `event.target` equal to the host and `propertyName` equal to `transform`, or on a fallback timer of the measured `transform` transition length (duration plus delay) plus 100 ms, whichever comes first. A measured zero completes at once. The length is measured, not declared, because it is the developer's `$offcanvas-transition-length` setting, which no design-time constant knows; the case a fixed timer protects (the stylesheet or the transition is missing) measures zero and completes at once, as in the Toggler spec. This also fixes Foundation's caveat that a zero transition length leaves every completion step unfired. Revealed and in-canvas panels have `transition: none` from Foundation, so a close caused by a breakpoint crossing completes at once.

Focus rules:

- Open: after the classes are applied, in the phase machine's `write` step, focus moves to the `autoFocus` target with `preventScroll: true` (the panel is still translated off-screen, Material's guard), and only then is `#focusPlaced` set, so in modal mode the Modal inert set is applied after focus has left the Trigger and everything else outside the panel (Material's order: an `inert` applied to the focused Trigger first would drop focus to `body`). Focus moves at the start of the transition rather than after `transitionend` (Foundation), so keyboard and screen reader users can act at once and focus never depends on the transition firing.
- An initially open panel (server or first client render) moves focus only in modal mode, in the first render callback; a non-modal panel open at first paint moves nothing.
- Close, by any path (Escape, overlay, content click, a Trigger, the model, a method): in the `write` step after the classes are applied, when `document.activeElement` is inside the panel or is `body` (the panel turned `inert` while exiting, or a click on the overlay blurred), focus moves to the `trigger` passed to the last `open()`, else to the element that was focused before the panel opened, else to the first registered Trigger outside the panel. Focus elsewhere (a content link the user clicked) is left alone. A close caused by a breakpoint crossing moves nothing. The Trigger is the element passed by `open(trigger)` because WebKit does not focus a button on mouse click (the Reveal dialog prototype).

Escape: while `#active`, one `keydown` listener on `window` in the bubble phase closes the panel when `key === 'Escape'`, no modifier (`hasModifierKey`), not `isComposing`, not `defaultPrevented`, `closeOnEsc()` is `true`, and the event target is not inside a modal `<dialog>` that does not contain the panel (a Reveal opened from the page handles its own close request); it calls `preventDefault()` as its last statement. Listening on `window` rather than the panel means Escape works with focus behind a non-modal panel, and it runs after the Light dismiss registry's document listener, so an open Dropdown pane inside the panel closes first and marks the event handled (the Anchored pane spec's Escape rule).

Fallback: none needed. Every mechanism is in the Browser target (`inert`, `transitionend`, CSS transitions, `overflow: clip`, `display: flow-root`) or a Foundation class, and the CDK pieces are the ones Material's sidenav uses.

### Comparison with Angular Material

| Concern | Material `MatDrawer`/`MatSidenav` | OffCanvas |
| --- | --- | --- |
| Shape | Components: `mat-drawer-container` renders the backdrop and computes content margins; `mat-drawer`, `mat-drawer-content` | Directives on the developer's elements that bind Foundation's classes; Foundation's CSS does the layout; the overlay is a developer element |
| State | `opened` input with `openedChange`, backed by a signal | `isOpen` model (Material's `opened` renamed, building-blocks 1.3); `opened`/`closed` are the Completion outputs |
| Outputs | `opened`, `closed`, `openedStart`, `closedStart`, `positionChanged` | `opened`, `closed`, `isOpenChange`; no start events (building-blocks 1.4) |
| Mode | `mode: 'over' \| 'push' \| 'side'` | `transition: 'push' \| 'overlap'` (Foundation's option); `side` is `revealOn`; Material's `mode` is the reference only |
| Position | `position: 'start' \| 'end'`, logical, default `start` | `position: 'left' \| 'right' \| 'top' \| 'bottom'`, physical (Foundation's `.position-*`), required |
| Fixed or contained | `fixedInViewport` on the sidenav | `nfsOffCanvas` (fixed) or `nfsOffCanvasAbsolute` (contained), Foundation's two Structural classes |
| Close control | `disableClose` gates Escape and backdrop together | Split: `closeOnClick` (Foundation) and `closeOnEsc` (new) |
| Focus | Trap in over/push while the backdrop shows; `autoFocus: AutoFocusTarget \| string \| boolean`; restore focus on close | Trap only in modal mode or with `trapFocus`; the same union without `'dialog'` (the panel is never focused); focus returns on every close |
| Content | `inert` on the content after the animation plus 50 ms; removed at once on close | the Modal inert set once focus is inside the panel, modal mode only; removed at close request |
| Role | None; the developer adds `navigation`, `region`, or `dialog` | `role="dialog"` and `aria-modal` in modal mode only; otherwise the developer's element or content supplies the landmark |
| Methods | `open(openedVia?)`, `close()`, `toggle(isOpen?, openedVia?)` returning promises | `open(trigger?)`, `close()`, `toggle(trigger?)` returning `void` (building-blocks 1.3; completion is the outputs) |
| Animation | CSS transform transition enabled after the first render; `transitionend` | Foundation's transform transition; `transitionend` plus a measured fallback; no transition before the first render |

Borrowed: the single two-way state, the `autoFocus` union, `preventScroll` while animating, the focus-then-inert order, focus restore, Escape without modifiers. Not borrowed: container components, computed margins, `fixedInViewport` as an input (the two selectors carry Foundation's two classes instead), logical positions, a default position, promise returns, start events, the duplicate-position error (Foundation allows several panels per side).

### ARIA and keyboard

Patterns: WAI-ARIA APG Disclosure for every non-modal configuration, with the panel's own element or content supplying the landmark (`nav` with `aria-label` for navigation, `aside` for a sidebar); APG Dialog (Modal) in modal mode (`trapFocus` with an overlay), the research's two-mode reading.

| Element | Role | Attributes | Who renders them |
| --- | --- | --- | --- |
| Trigger (`nfsOpen`, `nfsToggle`) | native `button` | `aria-expanded`, `aria-controls` = panel id; in modal mode `aria-haspopup="dialog"` and `aria-controls` without `aria-expanded` | Triggers utility from `triggerRole` |
| Close button (`nfsCloseButton` with a bare `nfsClose`) | native `button` | none from the Trigger; the developer's `aria-label` ("Close menu"), whose absence or symbol-only text `nfsCloseButton` reports in development | Developer (name), [Spec: Close Button](../issues/83-spec-close-button.md) (`type`, check) |
| Menu icon (`nfsMenuIcon` with `nfsOpen` or `nfsToggle`) | native `button` | the Trigger's attributes above; the developer's name, which `nfsMenuIcon` checks | Triggers utility, [Spec: Top Bar](../issues/86-spec-top-bar.md) |
| Panel, non-modal | the developer's element (`nav`, `aside`, or `div` wrapping a named `nav`) | none from the library | Developer |
| Panel, modal and open | `dialog` | `role="dialog"`, `aria-modal="true"`; name from the developer's `aria-labelledby` or `aria-label` | `nfsOffCanvas` (role), developer (name) |
| Panel, revealed or in-canvas | the developer's element | none; no dialog role, no `aria-modal` | nothing |
| Everything outside the panel's ancestor chain (a sibling content included) | none | `inert` while a modal panel is open, after focus is inside; the overlay, focus-trap anchors, `aria-live` elements, popovers, and CDK's overlay and description containers excepted | `nfsOffCanvas` |
| Overlay | none (an empty element) | none | nothing |
| Wrapper | none | none | nothing |

- A closed panel is hidden from assistive technology by Foundation's `.is-closed { visibility: hidden }`; `aria-hidden` is not used (building-blocks 1.10). An exiting panel is `inert`.
- Generated panel ids differ between server and client and are rewritten at hydration, since `id` and `aria-controls` are both bindings (building-blocks 1.5).
- Modal mode inerts every element outside the panel's ancestor chain, so content outside `.off-canvas-content` and the other children of a nested panel's content are unreachable, as behind a native modal dialog; the `FocusTrap` still wraps Tab through its `aria-hidden` anchors. The set is taken when focus enters the panel, so an element added outside the panel later is not made inert. While it is applied, Chromium resolves a reference from inside the panel to a rendered element outside it to nothing (an `aria-describedby` target, measured by [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)), so text that describes a control in the panel belongs inside the panel.
- Modal mode renders its Triggers in the `modal-dialog` shape (`aria-haspopup="dialog"` and `aria-controls`, no `aria-expanded`): the Modal inert set makes every Trigger outside the panel inert while it is open, so an expanded state could never be read as true, apart from the edge cases [Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md) accepts in its 2026-09-27 amendment (a Trigger inside an exception, an `nfsToggle` inside its own panel, an element added after the set was taken, a panel open by default before hydration, `autoFocus: false`), in which only Firefox's UI Automation infers 'collapsed', and while the panel is closed the only inferred state, Firefox's 'collapsed' in UI Automation, is true. This is the rule of [Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md), whose Off-canvas exception held only while `inert` covered the linked content alone; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md) applied it. A `nfsToggle` inside its own modal panel stays reachable while open and carries no expanded state, so the close control there is a bare `nfsClose` (development check 4).

| Key | Where | Behaviour |
| --- | --- | --- |
| Enter, Space | Trigger | Opens, closes, or toggles (native button activation; Triggers utility) |
| Tab, Shift+Tab | Open non-modal panel | Native order: through the panel, which precedes the content in the DOM, then into the content |
| Tab, Shift+Tab | Open modal panel, or `trapFocus` | Wraps inside the panel (CDK `FocusTrap` anchors); in modal mode everything outside the panel is `inert` (the Modal inert set) |
| Escape | Anywhere while a panel is open | Closes it (unless `closeOnEsc` is `false` or a control already handled the key); focus returns to the Trigger when it was inside the panel |
| Enter, Space | Close button, links with `nfsClose` | Close (native activation) |

### WCAG 2.2 AA requirements

The target is WCAG 2.2 level AA (user rule, ADR 0022). Each criterion below is a requirement with the test that proves it; none is advice. Every contrast ratio here and in the Library mixin is the exact WCAG relative-luminance formula, computed unrounded by the library's internal Sass helper (which composites a translucent colour over `$body-background` first), never Foundation's `color-luminance()`, whose approximate `pow()` passes failing pairs on dark backgrounds, and never Foundation's `color-contrast()`, which rounds to one decimal (building-blocks 1.10; [Spec: Top Bar](../issues/86-spec-top-bar.md), decision 8).

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.3 Contrast (Minimum) | Text in the panel reaches 4.5:1 against `$offcanvas-background`. The Storybook settings and every developer on Foundation's defaults set `$offcanvas-background: $white`, which brings Foundation's `$anchor-color` links to 4.65:1 (6.01:1 with the Callout's required `$anchor-color`, which the Storybook overrides carry) | Fails: `$anchor-color` #1779ba on `$light-gray` #e6e6e6 is 3.76:1 (body text #0a0a0a passes at 15.86:1) | axe `color-contrast` in every story; the `nfs-off-canvas` mixin emits `@warn` when the exact ratio of `$anchor-color` against `$offcanvas-background` is under 4.5; node-level Sass test |
| 1.4.11 Non-text Contrast | The close button's glyph (a 32 px icon, also large text) reaches 3:1 against `$offcanvas-background` at rest (`$closebutton-color`) and on hover and focus (`$closebutton-color-hover`): with `$offcanvas-background: $white`, `#8a8a8a` reaches 3.42:1 and `#0a0a0a` 19.63:1. The page-background check of both colours is `nfs-close-button`'s; this panel paints its own background, so `nfs-off-canvas` checks the panel pair ([Spec: Close Button](../issues/83-spec-close-button.md), decision 9). The overlay and the panel's edge are not user interface components or states a user must identify to operate the page (the panel's appearance and the focus move convey the open state; closing also works by Escape and the close button), so the criterion sets no ratio for them | Fails: #8a8a8a on #e6e6e6 is 2.77:1 (the hover colour passes at 15.86:1) | The mixin stops the compile with `@error` naming the setting and `$offcanvas-background` when the exact ratio of `$closebutton-color` or of `$closebutton-color-hover` against `$offcanvas-background` is under 3 (axe has no 1.4.11 rule and marks the glyph incomplete); node-level Sass test |
| 2.4.7 Focus Visible | Every focusable element in the panel and the Triggers show the user agent's focus indicator. Foundation's `disable-mouse-outline` removes it only under `[data-whatinput='mouse']`, which needs the what-input script the library never loads | Passes | e2e: screenshot comparison before and after Tab into the open panel, three engines |
| 2.4.11 Focus Not Obscured (Minimum) | A non-modal panel that covers or pushes the page is content the user opened; while it is open, Escape closes it from anywhere without moving focus, which is the criterion's note for user-opened content, so a focused element behind it can always be revealed. Modal mode keeps focus inside the panel. A revealed top or bottom panel with `$offcanvas-fixed-reveal: true` covers scrolled content, so the developer sets `scroll-padding-top` (or `-bottom`) on the document to the panel's height; development check 8 enforces it. Left and right revealed panels do not cover: Foundation's `has-reveal-<pos>` and sibling rules give the content a matching margin | Fails: Escape works only with focus inside the panel, so focus tabbed into content under an overlap panel stays hidden | e2e: open an overlap panel, Tab past its last element into content under it, press Escape, the focused element is unchanged and hit-tests to itself; revealed top-panel story with `scroll-padding-top`, every tabbed content element clear of the panel |
| 2.5.8 Target Size (Minimum) | The close button accepts presses across at least 24 by 24 CSS px through `nfs-close-button`'s floor, which the developer includes; its spacing exception does not hold here, because Foundation's docs place the absolutely positioned button over the first menu link. A menu-icon Trigger (`button[nfsMenuIcon]`, in a title bar or anywhere else) gets its 24 by 24 px box from `nfs-menu-icon`'s transparent border around Foundation's unchanged 20 by 16 px drawing ([Spec: Top Bar](../issues/86-spec-top-bar.md), D6); `nfs-responsive-toggle` has no menu-icon rule and requires an argument, so it is never included for this. Other Triggers keep their own contracts (`nfsButton`'s floor in `nfs-button`) | Fails: the medium close button is 18.69 by 32 px next to a full-width link; the menu icon is 20 by 16 px | axe `target-size` in every story (the WCAG 2.2 AA tags turn it on); every play function that renders a close button asserts its box is at least 24 by 24 (the Close Button spec's assertion); e2e measures the close button's box. The menu icon's geometry e2e and its missing-include warning are the Top Bar spec's (`top-bar--title-bar`, `nfsMenuIcon` development check 4) |
| 4.1.2 Name, Role, Value | Triggers expose `aria-expanded` and `aria-controls`; in modal mode `aria-haspopup="dialog"` and `aria-controls` without `aria-expanded`, because every Trigger outside the panel is inert while it is open (apart from the edge cases listed under ARIA and keyboard); a modal panel exposes `role="dialog"`, `aria-modal="true"`, and a name; a revealed panel exposes neither dialog semantics nor a working Trigger (development check 6 asks the developer to hide the Trigger) | Fails: no dialog semantics when trapping focus; `aria-expanded` only on triggers present at init; the docs' menu icons have no name | axe in every story (`aria-dialog-name`, `button-name`, ARIA rules); SSR smoke asserts the attributes |
| 2.4.3 Focus Order | Focus moves into the panel on open and back to the Trigger on every close; the panel precedes the content in the DOM | Fails partly: focus returns only on Escape | Stories `off-canvas--default`, `off-canvas--modal`; browser-level focus cases |
| 2.1.1 Keyboard, 2.1.2 No Keyboard Trap | Every action works from the keyboard; a modal panel is left by Escape or its close button; with `closeOnEsc: false` a close control inside the panel is required (development check 4) | Passes (Escape always closes) | Browser-level and e2e key cases |
| 1.4.10 Reflow | At 320 CSS px nothing scrolls horizontally: a push panel sits in an `nfsOffCanvasWrapper` (development check 3), whose clip hides the pushed content's overflow; a word wider than the viewport breaks inside the wrapper (rule (b)); the Zero-breakpoint entry of `$offcanvas-sizes` is at most 320 px (the mixin emits `@warn` otherwise; Foundation's is 250 px); menus in the panel stack (`nfsMenu orientation="vertical"`) | Passes with the wrapper | e2e at 320 by 640 px with a push panel open: `document.documentElement.scrollWidth <= 320` |
| 1.4.12 Text Spacing | No panel text runs under the close button | Passes for Foundation's example: at 320 CSS px with the text spacing, the menu links end before the absolutely positioned button in Chromium, Firefox, and WebKit (measured by [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md)); a panel whose first content is running text starts it below the button, as the recipes do | e2e: the text spacing case of `off-canvas--default` at 320 px asserts no text rectangle intersects the close button |
| 1.4.13 Content on Hover or Focus | Not touched: the panel opens on activation, never on hover or focus | n/a | none |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) with `parameters.a11y.test = 'error'` (building-blocks 1.10).

### Rendered HTML

Developer markup (Foundation's docs example with the deltas: directives in place of classes, typed references, the overlay written by hand as a plain `div`, a named `nav`, `$offcanvas-background: $white` in the settings):

```html
<div nfsOffCanvasWrapper>
  <div nfsOffCanvas position="left" id="site-nav" #nav="nfsOffCanvas" [content]="page">
    <button nfsCloseButton nfsClose aria-label="Close menu">
      <span aria-hidden="true">&times;</span>
    </button>
    <nav aria-label="Main">
      <ul nfsMenu orientation="vertical">
        <li><a routerLink="/" nfsClose>Home</a></li>
      </ul>
    </nav>
  </div>
  <div [nfsOffCanvasOverlay]="nav"></div>
  <div nfsOffCanvasContent #page="nfsOffCanvasContent">
    <button nfsButton [nfsToggle]="nav">Menu</button>
    <!-- page content -->
  </div>
</div>
```

Server HTML and first paint, closed (identical at every viewport width; hydration annotations shown only for `jsaction`; selector and static input attributes left out):

```html
<div class="off-canvas-wrapper">
  <div class="off-canvas position-left is-transition-push is-closed" id="site-nav">
    <button class="close-button" type="button" aria-label="Close menu" jsaction="click:;">...</button>
    <nav aria-label="Main"><ul class="menu vertical">...</ul></nav>
  </div>
  <div class="js-off-canvas-overlay is-overlay-fixed" jsaction="click:;"></div>
  <div class="off-canvas-content">
    <button class="button" type="button" aria-expanded="false" aria-controls="site-nav" jsaction="click:;">Menu</button>
  </div>
</div>
```

The wrapper, panel, overlay, and content classes are this spec's host bindings; `close-button` and its `type` are `nfsCloseButton`'s, `menu vertical` is `nfsMenu`'s, `button` and its `type` are `nfsButton`'s, and the Trigger attributes and `jsaction` are the Triggers utility's. No `inert`, no `aria-hidden`, no `role` anywhere; the panel is hidden by `is-closed`. The panel has no `jsaction` (`transitionend` is not a replayable event type), and neither do the wrapper and content, which declare no listeners.

Hydrated, after a click on the Trigger (push, non-modal):

```html
<!-- entering, then open -->
<div class="off-canvas position-left is-transition-push is-open" id="site-nav">
<div class="js-off-canvas-overlay is-overlay-fixed is-visible is-closable">
<div class="off-canvas-content is-open-left has-transition-push has-position-left">
<!-- exiting -->
<div class="off-canvas position-left is-transition-push" id="site-nav" inert>
<div class="js-off-canvas-overlay is-overlay-fixed">
<div class="off-canvas-content has-transition-push has-position-left">
<!-- closed again -->
<div class="off-canvas position-left is-transition-push is-closed" id="site-nav">
<div class="off-canvas-content">
```

Modal mode (`trapFocus`, overlay present, `aria-labelledby` on the panel), open: the panel adds `role="dialog" aria-modal="true"`, the content, and every other element outside the panel's ancestor chain except the overlay, the focus-trap anchors, `aria-live` elements, popovers, and CDK's `body` containers, adds `inert` after focus has moved into the panel, the Trigger reads `aria-haspopup="dialog" aria-controls="site-nav"` with no `aria-expanded`, closed or open, and CDK focus-trap anchors (`div.cdk-visually-hidden.cdk-focus-trap-anchor[aria-hidden="true"]`) sit before and after the panel, created on the first modal open in the browser.

Revealed sidebar (`revealOn="large"`), server HTML: `<div class="off-canvas position-left is-transition-push is-closed reveal-for-large" id="site-nav">`, content `class="off-canvas-content"`. At large and up, Foundation's `.position-left.reveal-for-large` shows the panel and its `.position-left.reveal-for-large ~ .off-canvas-content` rule gives the content its margin before hydration; after the Breakpoint service goes live on a large viewport the content also gets `has-reveal-left`, which sets the same margin, so nothing moves. A content element linked from elsewhere (not a following sibling) gets its margin only from `has-reveal-<pos>`, at hydration.

Nested panel inside the content: `class="off-canvas position-right is-transition-overlap is-closed"` whatever `transition` says.

Absolute panel (`<div nfsOffCanvasAbsolute position="left" id="split-1">` with its overlay): `<div class="off-canvas-absolute position-left is-transition-push is-closed" id="split-1">` and `<div class="js-off-canvas-overlay is-overlay-absolute" jsaction="click:;">`; no `off-canvas` class.

Server HTML, open by the developer's initial `[(isOpen)]="true"`: the open classes above with no Motion step, no `inert` outside the panel, and no `body` class (both arrive in the first client render callback).

Copied Foundation classes are stripped where a directive binds them, on the server and in the browser, and reported in development builds (check 1); the consumer's own classes stay:

```html
<div nfsOffCanvas position="left" class="off-canvas position-right is-closed reveal-for-large site-nav">...</div>
<div class="off-canvas position-left is-transition-push is-closed site-nav">...</div>
```

`off-canvas` merges with the binding and is not reported; `position-right` and `reveal-for-large` are stripped and reported with `position` and `revealOn`; `is-closed` is the bound state here and is reported as a State class the developer does not write.

### Animation

- Mechanism: building-blocks 1.6 rule 1 and ADR 0003. The panel, the content, and the overlay are persistent elements, so `animate.enter`/`animate.leave` do not apply; the State classes switch and Foundation's own transitions run: `transition: transform $offcanvas-transition-length $offcanvas-transition-timing` on `.off-canvas` and `.off-canvas-absolute` and on `.off-canvas-content.has-transition-*`, and an opacity and visibility transition on `.js-off-canvas-overlay`. No library keyframes and no Motion inputs.
- Enter: one render removes `is-closed` and adds `is-open` on the panel and the three content classes; the panel's `visibility` becomes visible and its transform transitions from the per-breakpoint `$offcanvas-sizes` offset to zero, and a push panel's content transitions from `none` to the offset in the same style change, exactly as Foundation's synchronous class writes do. No two-frame step is needed, because a `visibility: hidden` element keeps its computed transform.
- Exit: one render removes `is-open`, `is-open-<pos>`, and the overlay classes; the transforms transition back while the panel stays visible and `inert`; on completion one render adds `is-closed` and removes `has-transition-<t>` and `has-position-<pos>` (the content's transform goes from `translate(0, 0)` to `none` without a transition, which changes nothing visible).
- Completion: `transitionend` for `transform` on the panel, else the measured-length fallback timer; then `opened` or `closed`. An opposite request mid-transition reverses the transition from its current point (CSS reversing), restarts the timer, and emits only the final direction's output.
- Reduced motion: the `nfs-off-canvas` mixin sets `transition-duration: 1ms` on `.off-canvas`, `.off-canvas-absolute`, `.off-canvas-content.has-transition-push`, `.off-canvas-content.has-transition-overlap`, and `.js-off-canvas-overlay` under `@media (prefers-reduced-motion: reduce)` (building-blocks 1.6 rule 5), so `transitionend` still fires and the change is instant; Foundation's Sass has no reduced-motion rule.
- Tests: `nfsAnimationsToken` with `{disabled: true}` completes every phase in the same tick (the CSS still moves; stories that assert final state use it).
- Rendering modes: nothing animates before the first client render (`#live`), no class changes at hydration, so hydration plays nothing (the [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md) finding does not arise; there is no `animate.enter` here).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: every visible state is a host binding on signals that exist on the server (rule 1): the wrapper's class; the panel's Structural class, `position-<side>`, `is-closed`, `is-transition-<t>`, and breakpoint classes; the content's and overlay's classes, `is-overlay-<fixed|absolute>` included; the panel `id`; the Trigger ARIA; and the dialog role of a panel open at first paint. `revealOn` and `inCanvasOn` render as Foundation classes whose media queries show the panel at the right widths without knowing the viewport (rule 9, building-blocks 1.11 decision 8); nothing server-bound depends on the Server breakpoint except `has-reveal-<pos>` on the content, which the sibling rule already covers. A copied Foundation class is stripped in server HTML as in the browser.
- Before hydration: the directives read no `window`, `matchMedia`, computed style, or focus, write nothing to `body`, create no focus trap, and start no timer outside render callbacks (rules 3 to 5). The registration effects run on the server and write only signals. The Runtime checks and development checks run only in render callbacks, never on the server.
- First-render handoff (ADR 0014): a client whose breakpoint is at or above `revealOn` changes only `has-reveal-<pos>` on the content, with the same margin the sibling rule already applies; the breakpoint reactions record their first values without acting. The [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md) confirmed the handoff never paints the Server breakpoint's frame.
- Full hydration: host binding values equal the server's apart from generated ids and that one class, so hydration changes nothing visible and there is no structure to mismatch (rule 10). The focus-trap anchors are created later, in the browser, on the first modal open.
- Event replay: the replayable listeners are the Triggers' `click` host listeners and the overlay's `click` host listener (`jsaction="click:;"`). A tap on a Trigger before hydration is queued and replayed after hydration; `afterNextRender` runs before replay, so `#live` is `true` and the replayed open animates and moves focus in the following render callback. No library handler calls `preventDefault()` except the Escape listener, which is added in code while open and never replayed. The panel's `transitionend` and the `window` Escape listener do not replay, which is correct: nothing is open before hydration. A server-rendered initially open panel is the exception: a pre-hydration overlay click replays and closes it, a pre-hydration Escape is lost.
- Hydration boundary: the panel, its content, its overlay, its wrapper, and its Triggers belong to one hydration boundary; a developer `@defer (hydrate on ...)` wraps all of them (rule 7). Template-reference scoping stops an overlay or a Trigger outside a block from naming a panel inside it, and a nested panel finds only an enclosing content.
- `@defer`: library templates contain no `@defer`; the entry point is its own, so a developer can defer it. Inside a dehydrated block the set is its server HTML: a closed panel is hidden, a revealed or in-canvas panel is shown and usable at its breakpoint, and a tap on a Trigger hydrates the block and replays. Inside `@defer (hydrate never)` a revealed or in-canvas panel keeps working at and above its breakpoint (native links), while below it the panel stays closed and its Triggers do nothing; the spec documents that residue. Plain `@defer` renders on the client with the live breakpoint and no animation for the initial state.
- Incremental hydration triggers: `hydrate on interaction` annotates the block's root nodes with `click`, so a tap anywhere in the block hydrates it and a tap on a Trigger replays; because the block usually spans the whole page content, `hydrate on idle` or `hydrate on timer` are the practical choices for a site-wide drawer.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: every change is a signal write (model, `linkedSignal`, the live flag, `#focusPlaced`); the fallback timer and the transition listener write signals, which schedule change detection in zoneless and zone-based applications alike; the timer runs outside the Angular zone.

### Sass and custom CSS

The panel, content, overlay, wrapper, reveal, and in-canvas styles are all Foundation's `foundation-off-canvas`, unchanged. The `nfs-off-canvas` Library mixin adds: the reduced-motion override for Foundation's off-canvas transitions; `overflow: clip; display: flow-root` on `.off-canvas-wrapper` in place of Foundation's `overflow: hidden`, so the wrapper clips as before without becoming a scroll container that stops Sticky, with `overflow-wrap: break-word`, so the clip cuts off no word wider than the viewport; and compile-time checks (1.4.3, 1.4.11, 1.4.10, and the `$maincontent-class` guard) that emit no CSS. The close button's 24 px floor is `nfs-close-button`'s, the menu icon's 24 px box `nfs-menu-icon`'s, and the reveal and in-canvas classes come only from Foundation's `$breakpoint-classes` loops. Details and reasons in the Sass subsection of Further Notes. No directive declares `styles` or `styleUrl`.

## Testing Decisions

A good test asserts what a visitor or assistive technology observes: the panel's, content's, overlay's, and wrapper's classes, `inert`, `role` and `aria-modal`, the Trigger's ARIA, whether the panel is displayed, where focus lands, whether the page scrolls, and when `opened` and `closed` fire. No test reads private fields. There is no prior art in the new repository; the patterns are the building-blocks testing rule, the Triggers, Breakpoint service, Close Button, Top Bar, and Responsive Toggle specs, and the harness of the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).

Story ids follow `off-canvas--<story>`: `off-canvas--default` (Foundation's docs markup: push, left, overlay, close button, `nav` menu), `off-canvas--positions` (four panels, one per `position`, with Triggers), `off-canvas--overlap`, `off-canvas--modal` (`trapFocus`, overlay, `aria-labelledby`), `off-canvas--modal-nested` (a modal panel nested inside the content, with a `header` outside the wrapper), `off-canvas--no-overlay` (`closeOnClick` on the content), `off-canvas--nested`, `off-canvas--absolute` (two `nfsOffCanvasAbsolute` panels in wrapped grid cells), `off-canvas--reveal-for-large`, `off-canvas--reveal-top` (`revealOn` on a `position="top"` panel with `scroll-padding-top`), `off-canvas--in-canvas`, `off-canvas--content-scroll-locked`, `off-canvas--two-way-binding`, `off-canvas--with-sticky` (an `nfsSticky` bar in an `nfsStickyContainer` inside the content). Every story's Storybook settings include `$offcanvas-background: $white`. Story markup follows the class rule (Storybook conventions, section 8; ADR 0039): no story element carries a Foundation or library class written in the template. Scaffolding is each spec's directive, imported from its own entry point: close buttons are `nfsCloseButton` with a bare `nfsClose`, Triggers sit on `nfsButton`, menus are `ul[nfsMenu]` with `orientation="vertical"`, callouts `nfsCallout`, the grid cells the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s `nfsGridX` and `nfsCell`, the sticky bar the Sticky spec's directives, and a Trigger hidden at the reveal breakpoint uses `nfsVisibility hideFor` from the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). A title bar with a menu icon opening story panels is the Top Bar spec's `top-bar--title-bar`. Story ids are unchanged by the class rule.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`, which include `target-size`, `color-contrast`, `aria-dialog-name`, and `button-name`), on the closed and the open state.

- `off-canvas--default`: the wrapper carries `off-canvas-wrapper`, the panel `off-canvas position-left is-closed is-transition-push`, the overlay `js-off-canvas-overlay is-overlay-fixed`, the content `off-canvas-content`, and the Trigger `aria-expanded="false"` and `aria-controls` equal to the panel id; the close button's box is at least 24 by 24; a click sets `aria-expanded="true"`, the panel `is-open`, the content `is-open-left has-transition-push has-position-left`, the overlay `is-visible is-closable`; focus is on the first link after the panel opens (the close button is first in the DOM only when it is tabbable; the docs order puts it first); `opened` fires once; the close button closes it, focus returns to the Trigger, and `closed` fires after the panel carries `is-closed` again.
- `off-canvas--positions`: each panel carries exactly one position class, the one its `position` names; each Trigger opens its own panel and each panel's content classes name its side.
- `off-canvas--overlap`: the panel carries `is-transition-overlap`; the content gets `has-transition-overlap` and never moves.
- `off-canvas--modal`: the Trigger has `aria-haspopup="dialog"` and `aria-controls` and no `aria-expanded`, closed and open; open: the panel has `role="dialog"`, `aria-modal="true"`, and an accessible name; the content is `inert`; Tab from the last element returns to the first and Shift+Tab from the first reaches the last; Escape closes, focus returns to the Trigger, the content is no longer `inert`.
- `off-canvas--modal-nested`: after the open, focus is inside the dialog, the content has no `inert`, its other children, the Trigger, and the `header` outside the wrapper carry `inert`; after Escape none of them does and focus is on the Trigger.
- `off-canvas--no-overlay`: a click on the content closes the panel; a click inside the panel and on the Trigger does not close and reopen it.
- `off-canvas--nested`: the nested panel carries `is-transition-overlap` although its markup says nothing, and opens and closes.
- `off-canvas--absolute`: each panel carries `off-canvas-absolute` and no `off-canvas`, each overlay `is-overlay-absolute`; each panel stays inside its cell and its overlay covers only that wrapper.
- `off-canvas--two-way-binding`: an external checkbox bound to `[(isOpen)]` opens and closes the panel with the same classes, and a Trigger click updates the checkbox.
- `off-canvas--content-scroll-locked`: `body` has `is-off-canvas-open` while open and loses it after `closed`.
- `off-canvas--with-sticky`: the Sticky bar pins inside the wrapper while the page scrolls (the wrapper's computed `overflow` is `clip`).

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here. `MediaMatcher` is replaced with a controllable fake (the Breakpoint service spec's seam) so tests move across `revealOn` and `inCanvasOn` and toggle reduced motion. Test hosts write no Foundation or library class, except in the copied-class cases.

- Classes: `nfsOffCanvas` binds `off-canvas` and `nfsOffCanvasAbsolute` binds `off-canvas-absolute` and not `off-canvas`, with `absolute` reading `false` and `true`; both attributes on one element bind `off-canvas-absolute` and warn once; `position` sets exactly one of the four classes and moves it when a bound value changes; the overlay binds `js-off-canvas-overlay` with `is-overlay-fixed`, or `is-overlay-absolute` for an absolute panel; the wrapper binds `off-canvas-wrapper`; the content binds `off-canvas-content`. (A missing `position` fails the template compile under strict templates, Angular's own required-input check, so no runtime case exists for it.)
- Breakpoint classes: `revealOn` and `inCanvasOn` set `reveal-for-<bp>` and `in-canvas-for-<bp>` for every Class breakpoint above the Zero breakpoint, with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose Zero breakpoint is `xs`; the Zero breakpoint sets no class, leaves `open()` working, and warns once (check 7); `inCanvasOn` on an absolute panel warns once.
- Copied classes: a host with `class="off-canvas position-right is-closed reveal-for-large is-transition-overlap site-nav"` and `position="left"` ends with `off-canvas position-left is-transition-push is-closed site-nav` and one warning per stripped or State class, naming its input; a redundant `off-canvas` is not reported; content State classes copied onto the content are stripped.
- Phase model: the initial state never animates; `[(isOpen)]` writes, Trigger clicks, and method calls give the same class sequence on the panel, content, and overlay; an opposite request mid-transition emits only the final direction's Completion output.
- Completion: `transitionend` for `transform` on the panel completes; one bubbling from a descendant, or for another property, does not; with `transition: none` forced, the phase completes at once; with `transitionend` suppressed (a listener stopping it in capture), the fallback timer completes at the measured length plus 100 ms (fake timers).
- Links: the `content` reference wins over an enclosing content; a nested panel resolves the enclosing content and reports overlap; two panels on one content combine their classes; destroying a panel or the overlay unregisters; the classes are present in the first rendered pass with the content before, after, and around the panel.
- Modal mode: on only with `trapFocus` and a registered overlay; the Modal inert set is applied only after focus is inside the panel (a focused Trigger is never made inert while it holds focus) and removed at close request; an element outside the wrapper is `inert` while a modal panel is open and not after it closes; an element that was `inert` before the open is still `inert` after the close; the overlay, a focus-trap anchor, an `aria-live` element, a `popover` element, `.cdk-overlay-container`, and `.cdk-describedby-message-container` placed as `body` children are never made `inert`; the overlay stays clickable; a nested modal panel keeps its enclosing content free of `inert`; destroying an open modal panel (an enclosing `@if` turned false) removes `inert` from every element the set changed; `trapFocus` without an overlay traps but binds no `role`.
- Focus rules: every `autoFocus` form (`data-autofocus` first, first tabbable, first heading with a temporary `tabindex="-1"`, selector, `false`); focus returns to the `trigger` passed to `open()`, else the previously focused element, else the first registered Trigger outside the panel, for Escape, overlay click, content click, a bare `nfsClose`, and the model; focus on a content link that closed a non-modal panel stays there; an initially open modal panel takes focus in the first render, a non-modal one does not.
- Escape: closes from inside the panel and from the content; ignored with a modifier, while composing, when `defaultPrevented`, with `closeOnEsc: false`, and inside a modal `<dialog>` that does not contain the panel; a Dropdown pane open inside the panel closes first.
- Breakpoints: `open()` is a no-op while revealed or in-canvas; crossing into the range closes an open panel without moving focus and with no overlay, `inert`, or lock left behind; crossing out while focus is in the panel, with a test style hiding the panel at the same step as Foundation's CSS would, moves focus to the first registered Trigger, and nothing moves while the panel stays visible or after focus has left the panel for another element; `has-reveal-<pos>` follows `atLeast(revealOn)`.
- Scroll lock and `forceTo`: the `body` class is added in the open render callback and removed after `closed`, kept while a second locked panel is open, and removed when a locked open panel is destroyed; a `body` that carries `is-off-canvas-open` before any panel renders loses it at the first panel's first render and one warning fires; `forceTo: 'top'` calls `window.scrollTo(0, 0)` before focus moves.
- Runtime checks, one test file per case because reads and reports are once per realm (the Breakpoint service spec's rule), with test style blocks writing custom properties on `:root` only: `revealOn="large"` against `--nfs-breakpoint-classes: small medium large` is silent; `revealOn` set by a cast to `xlarge` against the same property reports once under `strictVariantNames`, naming `nfsOffCanvas`, `revealOn`, `$breakpoint-classes`, and the listed names; with no property, `revealOn` bound makes one `strictVariantProperties` report naming `nfs-breakpoint-properties`, and a panel with neither Option bound makes none; `revealOn` naming the Zero breakpoint makes no Runtime check report.
- Replay-safe handlers: dispatch a `click` on the overlay whose `eventPhase` reads 101 and whose `preventDefault` throws; the panel closes and nothing reaches `ErrorHandler`.
- Defaults token: each Option seeds from it; an element-level provider wins over a root one.
- Development checks: each of the ten warnings fires once for its case and not for Foundation's docs markup written with the directives; check 3 stays silent for a push panel inside a `div nfsOffCanvasWrapper` whose `NfsOffCanvasWrapper` import is missing from the test host, where the `strictDirectiveImports` report on the wrapper is the one warning, and for a push panel nested inside a `div nfsOffCanvasContent` whose `NfsOffCanvasContent` import is missing, where the `strictDirectiveImports` report on that element is the one warning; a push panel with no content and no element carrying `nfsOffCanvasContent` around it warns.

### 3. Node-level Vitest

- SSR smoke (runs under `npx nx test <lib>` in `off-canvas.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter): a fixture that writes no `class` attribute, with a wrapper, a closed push panel with a close button, an overlay, and a content, an open modal panel through the initial binding, a nested panel, an `nfsOffCanvasAbsolute` panel with its overlay, a `revealOn="large"` panel, an `inCanvasOn="large"` panel, and a panel without an `id`, plus one panel with a copied `class="position-right reveal-for-large"`. Assert that `whenStable()` resolves; the wrapper's class is `off-canvas-wrapper`, the content's `off-canvas-content`, and the close button's `close-button`; closed panels carry their Structural class, their one position class, `is-closed`, and `is-transition-<t>` and no `inert`, `aria-hidden`, or `role`; the absolute panel carries `off-canvas-absolute` and no `off-canvas`, and its overlay `js-off-canvas-overlay is-overlay-absolute`, the other overlay `is-overlay-fixed`; the nested panel carries `is-transition-overlap`; the revealed and in-canvas panels carry their Foundation class and `is-closed`; the copied panel carries its bound position class and no `position-right` or `reveal-for-large`; the open modal panel carries `is-open`, `role="dialog"`, and `aria-modal="true"`, its content the three open classes and no `inert`, its overlay `is-visible is-closable`; every modal panel's Trigger, closed or open, carries `aria-haspopup="dialog"` and `aria-controls` and no `aria-expanded`; the generated id equals the Trigger's `aria-controls`; Triggers and overlays carry `jsaction="click:;"` and panels, content, and wrapper none; no `MediaMatcher` query and no `getComputedStyle` call was made, no Runtime check reported, and `body` has no class; a panel written with a static `autoFocus="first-heading"` carries no `autofocus` attribute.
- Pure logic: the `autoFocus` target resolution order, the panel's class record (Structural class, position, transition, phase, and breakpoint classes, over the default map and a map whose Zero breakpoint is `xs`), and the content-class derivation (panel state, transition, position, reveal to the class map) are pure functions with table-driven tests.
- Sass compile (the Sass packaging decision's node-level check): Foundation's default settings plus `@include nfs-off-canvas;` stop with the `@error` naming `$closebutton-color` and `$offcanvas-background` (2.77:1); with `$offcanvas-background: $white` the include emits exactly rules (a) and (b) of the Sass subsection, no `.close-button` rule, no reveal or in-canvas rule, and no copy of a Foundation rule; on a dark panel, where Foundation's `color-luminance()` overstates ratios, `$offcanvas-background: #0a0a0a` with `$closebutton-color-hover: $white` and `$closebutton-color: #116666` stops the compile (2.94:1 exact, 3.01:1 by Foundation's function), `$closebutton-color-hover` left at `$black` stops it (1:1), and `$anchor-color: #1177dd` there produces the `@warn` (4.44:1 exact, 4.51:1 by Foundation's function); `$anchor-color` under 4.5:1 against the background produces the `@warn`; a Zero-breakpoint `$offcanvas-sizes` entry over 320 px produces the reflow `@warn`; `$maincontent-class: 'page-content'` stops the compile naming the setting; the mixin takes no argument, so `@include nfs-off-canvas($reveal-for: xlarge);` is a Sass argument error.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Real keys on `off-canvas--modal`: Enter on the Trigger opens and focus is inside; Tab and Shift+Tab never leave the panel; Escape closes and focus is on the Trigger (WebKit included, where a clicked button is not focused).
- Real mouse on `off-canvas--default`: click the Trigger, click the overlay; focus is on the Trigger afterwards.
- Viewport thresholds on `off-canvas--reveal-for-large`: at 1023 px the panel is hidden and the Trigger shown; at 1024 px the panel is displayed as a sidebar, the content has its margin, and no overlay shows; open at 800 px, resize to 1300 px: no overlay, no `inert`, no `body` class, `aria-expanded="false"`; resize back to 800 px: the panel is closed. With real CSS, keyboard focus on a link in the revealed sidebar at 1300 px, then a resize to 800 px: focus lands on the Trigger, never on `<body>`, in all three engines.
- `off-canvas--in-canvas` at 1300 px: the panel is in the page flow with no transform; at 800 px it is off-canvas and its Trigger opens it.
- Scroll lock on `off-canvas--content-scroll-locked`: with the page scrolled to 500 px, wheel and keyboard scrolling over the overlay and the panel leave `scrollY` at 500; after close it is still 500.
- `reducedMotion: 'reduce'` on `off-canvas--default`: `opened` fires within 150 ms of the click.
- WCAG 2.2 AA checks that need real layout: target size (2.5.8) from the close button's bounding box (at least 24 by 24); focus visible (2.4.7) by a screenshot comparison before and after Tab into the open panel; reflow (1.4.10) at 320 by 640 px with a push panel open, `scrollWidth <= 320`; text spacing (1.4.12) on `off-canvas--default` at 320 by 640 px with the text-spacing stylesheet and the panel open, no text rectangle in the panel intersecting the close button's box; focus not obscured (2.4.11) on `off-canvas--overlap` by Escape with focus behind the panel and on `off-canvas--reveal-top` by tabbing through the content with each focused element clear of the panel; `@axe-core/playwright` with the six tags on the open state after real interaction.
- Sticky inside the wrapper on `off-canvas--with-sticky`: after a real wheel scroll the bar's top equals the viewport top and it carries `is-stuck`.

Against the prerendered fixture app:

- JavaScript disabled at 375 px and at 1300 px: screenshot plus `@axe-core/playwright` with the six tags; at 375 px the panel is not displayed; at 1300 px the revealed panel is displayed with its links working and the content has its margin.
- Hydration at 375 px and at 1300 px: no NG05xx, `ngDevMode.componentsSkippedHydration === 0`, and the panel's, overlay's, and wrapper's class attributes identical before and after hydration (the content may gain only `has-reveal-left` at 1300 px, with no layout change).
- Pre-hydration tap at 375 px with the main bundle held back: the panel opens exactly once after hydration, focus is inside it, and no error is logged.
- `@defer (hydrate on idle)` around the set: after idle the Trigger works; `@defer (hydrate never)`: at 1300 px the revealed panel's links navigate, at 375 px the Trigger does nothing and no error is logged.

What these layers cannot prove: real iOS Safari touch scrolling behind a locked panel (Foundation's `overflow: hidden` on `body` is relied on unchanged; the headless WebKit here is not iOS), headed-browser focus leaving for the browser interface, and screen reader output, which the release test below covers.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA on Firefox, Narrator on Edge, TalkBack on Chrome, and VoiceOver on Safari (macOS and iOS), open `off-canvas--modal` and `off-canvas--modal-nested` from their Triggers and confirm each Trigger is announced as a button that opens a dialog with no expanded state, that the dialog's name is spoken with focus on its first control, and that browse, swipe, or virtual cursor navigation cannot leave the panel, the header outside the wrapper included; on iOS, close each modal panel once with its close button and once with VoiceOver's two-finger scrub, which WebKit dispatches as an Escape key press, and confirm focus returns to the Trigger; open `off-canvas--default` and confirm its Trigger is announced as expanded and collapsed; at the large breakpoint confirm `off-canvas--reveal-for-large` is read as the 'Main' navigation with no dialog.

## Out of Scope

- The Trigger's ARIA and click handling: the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md). Breakpoint state and the Runtime checks: the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). The Light dismiss registry that a Dropdown pane inside the panel uses: the [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md).
- The close button: the [Spec: Close Button](../issues/83-spec-close-button.md). The title bar and menu icon: the [Spec: Top Bar](../issues/86-spec-top-bar.md). The menus inside the panel (Menu, AccordionMenu, Drilldown, DropdownMenu, ResponsiveMenu): their own specs. Hiding a Trigger at the reveal breakpoint: `nfsVisibility` of the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md).
- A `<dialog>` or `popover` panel (ADR 0030), a generated overlay, and container components computing margins (Material's shape).
- Fixed elements inside a pushed content: Foundation's `data-off-canvas-sticky` inline rewrite is dropped; a `position: fixed` element inside `.off-canvas-content` behaves as absolutely positioned while a push panel is open (the content's transform), so such elements go outside the content or the panel uses `overlap`. The next library's Sticky is `position: sticky`, which a transform does not break.
- Logical positions (`start`/`end`) and automatic RTL mirroring: Foundation's off-canvas classes are physical.
- Reveal and in-canvas classes for breakpoints outside `$breakpoint-classes`: `revealOn` and `inCanvasOn` take Class breakpoints, whose classes Foundation already generates; a developer who wants `xlarge` adds it to `$breakpoint-classes` (Foundation's documented route), which the Variant declaration file then lists.
- A renamed `$maincontent-class`: the content directive binds `.off-canvas-content`, and `nfs-off-canvas` stops the compile on a rename.
- Pre-6.3 markup: `.off-canvas-wrapper-inner`, `data-off-canvas-wrapper`, and `data-position`, which Foundation 6.9's Sass and JavaScript no longer read (its docs' migration section).
- Runtime theming; the `$offcanvas-*` settings stay compile-time Foundation settings.

## Further Notes

### Design decisions

| # | Decision | Choice | Why |
| --- | --- | --- | --- |
| D1 | Directives | `nfsOffCanvas` (or `nfsOffCanvasAbsolute`) on the panel, `nfsOffCanvasContent` on the content, `nfsOffCanvasOverlay` on a developer-written overlay, `nfsOffCanvasWrapper` on the wrapper | One directive per Structural class, each binding its class; Foundation's markup has every element except the overlay, which becomes one plain element (ADR 0001, ADR 0039, building-blocks 1.1) |
| D2 | `<dialog>` | Not used in any mode | A closed `<dialog>` cannot be a revealed or in-canvas panel in server HTML; the transform transition cannot start from `display: none` in target; the default panel is not modal (ADR 0030) |
| D3 | Modal mode | `trapFocus` with an overlay: `role="dialog"`, `aria-modal`, the Modal inert set, CDK `FocusTrap`, Trigger role `modal-dialog` | The APG's two-mode reading: modal only when interaction outside is blocked and the page is obscured; the Modal inert set because `inert` on the linked content alone made a nested modal panel inert with its content and left content outside the content reachable while `aria-modal` claimed otherwise, which Narrator, TalkBack, and Orca then read ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)); Trigger role `modal-dialog` because every Trigger outside the panel is then inert while it is open ([Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md)) |
| D4 | Content link | `content` reference, else the enclosing content through DI | ADR 0013 (references, never ids); DI covers Foundation's nested and closest-ancestor cases; a sibling has no DI path |
| D5 | Overlay | Developer element, required reference to the panel; omission is `contentOverlay: false` | No generated structure (ADR 0008); Foundation's classes and fade reused |
| D6 | Position | Required `position` Variant input, the closed `NfsOffCanvasPosition`, setting `.position-<side>` | Foundation's docs require a positioning class and its CSS gives a panel without one no look; no Sass setting names a default, so ADR 0040's unset-sets-no-class default has no Sass look to fall back to, and a required input makes the missing class a compile error instead of a broken panel. Rejected: a `'left'` default (Foundation's JavaScript fallback, which fixes only its content classes and would be a runtime default setting a class, against ADR 0040); an unset state with a warning (the broken panel Foundation's docs forbid); reading the static class (building-blocks 1.4's initial-state rule) |
| D7 | `revealOn`/`inCanvasOn` | Inputs that bind Foundation's classes; the Breakpoint service only for behaviour | One typed source, correct server HTML at every width (building-blocks 1.11 decision 8); the Responsive Toggle spec's `hideFor` pattern |
| D8 | `is-closed` while revealed | Kept | Foundation's breakpoint classes win in CSS, so no server-bound class depends on the breakpoint |
| D9 | Crossing into the revealed or in-canvas range | Closes an open panel | Foundation's behaviour; an overlay, the Modal inert set, or a lock must not return on the way back; differs from Responsive Toggle's persistence for that reason |
| D10 | `#active` | Every page effect follows `isOpen && !revealed && !inCanvas` | A stale `isOpen` can never cover a sidebar |
| D11 | `closeOnEsc` | New input, default `true` | Audit 0002 M6; Foundation always closes on Escape |
| D12 | Escape listener | `window`, bubble phase, while open | Works with focus behind a non-modal panel (2.4.11 note); runs after Light dismiss so inner panes close first |
| D13 | Focus into the panel | At the start of the transition, `preventScroll: true` | Immediate for keyboard and screen reader users; independent of `transitionend` (Material) |
| D14 | Modal inert set | After focus is inside the panel; removed at the close request, or on destroy, from exactly the elements it changed | Material's order; a focused Trigger is never made inert |
| D15 | Focus return | Every close path, when focus is inside the panel or on `body` | Building-blocks 1.10 and the APG; Foundation returned focus only on Escape |
| D16 | `autoFocus` | Material's union minus `'dialog'`; `true` looks for `data-autofocus` then the first tabbable | Building-blocks 1.10 (never focus the panel); Foundation's marker kept |
| D17 | Completion | `transitionend` for `transform`, else a measured fallback | The length is the developer's Sass setting; a missing transition completes at once |
| D18 | Scroll lock | Foundation's `is-off-canvas-open` on `body` from a render callback; touch handlers dropped | Foundation's CSS locks the viewport; the Reveal dialog prototype measured that pages scroll behind overlays unless locked |
| D19 | Wrapper overflow | `overflow: clip; display: flow-root; overflow-wrap: break-word` in `nfs-off-canvas` | Same clipping and formatting context as Foundation's `overflow: hidden` without a scroll container, so Sticky works inside (Sticky spec); `overflow-wrap: break-word`, because the clip cuts off a word wider than the viewport that the page would otherwise scroll to (measured, rule (b)), and `break-word`, not the Card's `anywhere`, changes no min-content size of the page the wrapper holds (2026-09-29, [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md)) |
| D20 | Close button | The 24 px floor is `nfs-close-button`'s ([Spec: Close Button](../issues/83-spec-close-button.md)); the button is `nfsCloseButton`, which closes nothing, with a bare `nfsClose` beside it | 2.5.8; the spacing exception fails beside the first menu link; one floor for every close button replaces this spec's panel-scoped rule |
| D21 | Panel colours | `@error` for the close button at rest and on hover, `@warn` for links, Storybook sets `$offcanvas-background: $white` | Foundation's defaults fail 1.4.11 and 1.4.3 (ADR 0022); the panel paints its own background under the button, so the panel pair is this mixin's (the Close Button spec's decision 9) |
| D22 | Positions | Physical, no `Directionality` | Foundation's Sass has no RTL handling for off-canvas |
| D23 | Methods | `void` returns | Building-blocks 1.3; completion is the outputs |
| D24 | Dropped options | `contentOverlay`, `nested`, `transitionTime`, `isRevealed`, `revealClass` | Markup, derivation, a Sass setting, or a class contract replaces each |
| D25 | `.off-canvas-absolute` | A second selector of `NfsOffCanvas`, `[nfsOffCanvasAbsolute]`, binding `.off-canvas-absolute` in place of `.off-canvas`; read once from `HostAttributeToken`; same API and `exportAs` | Foundation's "alternative class" is a second Structural class built from the same base mixin, so it gets a directive attribute of its own (ADR 0039), while the Openable stays one class, as Material's button once served several attribute selectors. Rejected: a boolean `absolute` input (it would be a Variant of a class it replaces, switchable at runtime, and naming rule 4 would call it `offCanvasAbsolute`); a second directive class (a duplicated Openable or host-directive plumbing, and a union type for the overlay's reference) |
| D26 | Wrapper | `[nfsOffCanvasWrapper]` binds `.off-canvas-wrapper` and provides nothing | ADR 0039 gives every Structural class a directive; the reflow check reads the wrapper as a DOM ancestor, because Foundation's clip works by DOM ancestry and projection breaks DI (the Top Bar spec's D13). Rejected: a wrapper token (no reader needs it); a registry of panels (the triage of the original spec: references do that) |
| D27 | Overlay classes | `.js-off-canvas-overlay` static; `is-overlay-fixed` or `is-overlay-absolute` from the linked panel's `absolute` | Foundation generated both from the panel's computed `position`; the Structural class decides that position and is known on the server, so both classes are in server HTML |
| D28 | Breakpoint names | `revealOn` and `inCanvasOn` typed `NfsClassBreakpoint`; the Zero breakpoint sets no class, behaves as unset, and warns; `strictVariantNames` reports a Class breakpoint the compiled CSS lacks, and `strictVariantProperties` a missing `nfs-breakpoint-properties`, while either is bound; `nfs-off-canvas` emits no reveal or in-canvas rules of its own | ADR 0040 and building-blocks 1.7: an Option that sets a class only for Class breakpoints is typed over them, which makes the old library rules for other breakpoints unreachable and replaces the old computed-visibility check. Cost recorded: revealing at a breakpoint outside the default classes means adding it to `$breakpoint-classes`, which also generates its grid and visibility classes |
| D29 | `$maincontent-class` | The content directive binds `.off-canvas-content`; `nfs-off-canvas` stops the compile when the setting is renamed | No input may carry a class name (ADR 0039), and a renamed class would leave Foundation's push, reveal, and nested rules without an element, silently |
| D30 | Copied classes | Stripped by true-or-false bindings on the server and in the browser; development check 1 reports each with its input | Building-blocks 1.4's initial-state rule; Foundation's docs markup carries `is-closed`, position, and reveal classes |
| D31 | `body.is-off-canvas-open` | A `Renderer2` write by the Scroll lock, removed on the last release or on destroy, and stripped when copied while no locked panel is open | `body` carries no library directive and the lock has no first-paint value; the user ruled such a write satisfies the class rule ([Re-run: Magellan spec under the class rule](../issues/122-rerun-magellan-class-rule.md), User decision; building-blocks 1.5) |
| D32 | Title bar and menu icon | The Top Bar spec's directives; the menu icon's 24 px box is `nfs-menu-icon`'s | The title bar and menu icon are that spec's (its decision 6); `nfs-responsive-toggle` no longer draws a hit area and requires an argument |
| D33 | Contrast arithmetic | The exact WCAG formula through the library's internal helper, unrounded | Foundation's `color-luminance()` passes failing pairs on dark backgrounds (measured for this revision on `#0a0a0a`; the Top Bar spec's decision 8) |

### Usage examples

Foundation's docs example (push from the left, with a close button and a title bar):

```html
<div nfsOffCanvasWrapper>
  <div nfsOffCanvas position="left" id="offcanvas-nav" #nav="nfsOffCanvas" [content]="page">
    <button nfsCloseButton nfsClose aria-label="Close menu">
      <span aria-hidden="true">&times;</span>
    </button>
    <nav aria-label="Main">
      <ul nfsMenu orientation="vertical">
        <li><a routerLink="/" nfsClose>Home</a></li>
        <li><a routerLink="/pricing" nfsClose>Pricing</a></li>
      </ul>
    </nav>
  </div>
  <div [nfsOffCanvasOverlay]="nav"></div>
  <div nfsOffCanvasContent #page="nfsOffCanvasContent">
    <div nfsTitleBar>
      <div nfsTitleBarLeft>
        <button nfsMenuIcon aria-label="Open menu" [nfsOpen]="nav"></button>
        <span nfsTitleBarTitle>Foundation</span>
      </div>
    </div>
    <router-outlet />
  </div>
</div>
```

A modal filter panel from the right, overlapping:

```html
<aside nfsOffCanvas position="right" id="filters" #filters="nfsOffCanvas" [content]="page"
       transition="overlap" trapFocus aria-labelledby="filters-title" autoFocus="first-heading">
  <button nfsCloseButton nfsClose aria-label="Close filters">
    <span aria-hidden="true">&times;</span>
  </button>
  <h2 id="filters-title">Filters</h2>
  ...
</aside>
<div [nfsOffCanvasOverlay]="filters"></div>
```

A sidebar that is a drawer below large (the Trigger hidden at large by `nfsVisibility hideFor="large"`, from `ngx-foundation-sites/visibility`):

```html
<div nfsOffCanvas position="left" id="sidebar" #sidebar="nfsOffCanvas" [content]="page" revealOn="large">
  <nav aria-label="Sections">...</nav>
</div>
<div nfsOffCanvasContent #page="nfsOffCanvasContent">
  <button nfsButton nfsVisibility hideFor="large" [nfsToggle]="sidebar">Sections</button>
  ...
</div>
```

In-canvas at large, nested, no content reference needed:

```html
<div nfsOffCanvasContent>
  <button nfsButton nfsVisibility hideFor="large" [nfsToggle]="related">Related</button>
  <div nfsOffCanvas position="right" id="related" #related="nfsOffCanvas" inCanvasOn="large">
    <div nfsCallout>Related articles</div>
  </div>
</div>
```

Two absolute panels, each opening inside its own region:

```html
<div nfsOffCanvasWrapper>
  <div nfsOffCanvasAbsolute position="left" id="split-1" #split1="nfsOffCanvas" [content]="region1">...</div>
  <div [nfsOffCanvasOverlay]="split1"></div>
  <div nfsOffCanvasContent #region1="nfsOffCanvasContent">
    <button nfsButton [nfsToggle]="split1">Open left</button>
  </div>
</div>
```

Two-way binding, completion outputs, and a locked page:

```html
<div nfsOffCanvas position="left" [content]="page" [(isOpen)]="menuOpen"
     contentScroll="false" (closed)="onMenuClosed()">...</div>
```

Application-wide defaults:

```ts
providers: [
  { provide: nfsOffCanvasDefaultsToken, useValue: { transition: 'overlap', contentScroll: false } },
];
```

Incremental hydration: wrap the whole set.

```html
@defer (hydrate on idle) {
  <div nfsOffCanvasWrapper>
    <div nfsOffCanvas position="left" #nav="nfsOffCanvas" [content]="page">...</div>
    <div [nfsOffCanvasOverlay]="nav"></div>
    <div nfsOffCanvasContent #page="nfsOffCanvasContent">...</div>
  </div>
}
```

Migration from Foundation's markup: `class="off-canvas"` with `data-off-canvas` becomes `nfsOffCanvas` with `#x="nfsOffCanvas"`, and `class="off-canvas-absolute"` becomes `nfsOffCanvasAbsolute`; `.position-<side>` becomes `position="<side>"`, which is required; `.off-canvas-content` with `data-off-canvas-content` becomes `nfsOffCanvasContent`, referenced from each sibling panel with `[content]`; `.off-canvas-wrapper` becomes `nfsOffCanvasWrapper`; add the overlay element (Foundation generated it) as a plain `div` with `[nfsOffCanvasOverlay]`; `data-toggle`/`data-open`/`data-close` become `nfsToggle`/`nfsOpen`/`nfsClose`; the `.close-button` becomes `nfsCloseButton` beside a bare `nfsClose`, the title bar and menu icon the Top Bar spec's directives, and `.vertical.menu` `nfsMenu orientation="vertical"`; `.reveal-for-<bp>` becomes `revealOn`, `data-options="inCanvasOn:..."` or `.in-canvas-for-<bp>` becomes `inCanvasOn`; the docs' `is-closed` in markup is deleted (the directive binds it); `data-transition-time` moves to `$offcanvas-transition-length`; `data-off-canvas-scrollbox*` and `data-off-canvas-sticky` are deleted; add `$offcanvas-background: $white` (or another passing pair) to the settings; a renamed `$maincontent-class` goes back to its default. A copied class that survives is stripped and reported in development builds.

### Sass

Sass. The developer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-off-canvas` (panel, positions, content, overlay, wrapper, reveal and in-canvas classes, `is-off-canvas-open`), on `foundation-close-button` with `nfs-close-button` for the close button's 24 px floor and its page-background check ([Spec: Close Button](../issues/83-spec-close-button.md)), on `foundation-title-bar` and `foundation-menu-icon` with `nfs-title-bar` and `nfs-menu-icon` for a title bar and its menu icon ([Spec: Top Bar](../issues/86-spec-top-bar.md); `nfs-responsive-toggle` is not included for this: it draws no hit area and requires an argument), on `foundation-menu` with `nfs-menu` for the panel's menu, and on `nfs-breakpoint-properties`, whose `--nfs-breakpoint-classes` the Runtime checks read while `revealOn` or `inCanvasOn` is bound. Its documented custom CSS is the `nfs-off-canvas` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-off-canvas`; it takes no parameters:

1. Rules.
   (a) `@media (prefers-reduced-motion: reduce) { .off-canvas, .off-canvas-absolute, .off-canvas-content.has-transition-push, .off-canvas-content.has-transition-overlap, .js-off-canvas-overlay { transition-duration: 1ms; } }`. Reason: Foundation's off-canvas transitions have no reduced-motion rule, and the directive awaits `transitionend` (building-blocks 1.6 rule 5: 1 ms keeps the event and makes the change instant).
   (b) `.off-canvas-wrapper { overflow: clip; display: flow-root; overflow-wrap: break-word; }`, adjusting Foundation's `off-canvas-wrapper` (only `overflow` differs; `display` is added). Reason: Foundation's `overflow: hidden` makes the wrapper a scroll container, so a `position: sticky` element inside the content sticks to the wrapper instead of the window (the Sticky spec's documented clash) and a focused element pushed out of view can scroll the wrapper sideways; `overflow: clip` clips the same boxes without a scroll container, and `display: flow-root` restores the independent formatting context that `overflow: hidden` created and `clip` does not (float containment, no margin collapsing through the wrapper). Both are Baseline widely available on the target date. `overflow: clip` inside the wrapper was confirmed by the [Prototype: Sticky measurement refinements](../issues/63-prototype-sticky-measurement.md), case 3, in three engines. `overflow-wrap: break-word`: the clip cuts off a word wider than the viewport that the page would otherwise scroll to (measured at 320 CSS px: a URL in the content loses 171.8 px, 304.3 px with the 1.4.12 spacing, in Chromium and WebKit); `break-word`, not the Card's `anywhere`, because the wrapper holds the whole page and `anywhere` would lower the min-content width of every flex item, grid item, and table cell on it.
   (c) Compile-time checks that emit no CSS, each contrast ratio computed unrounded with the exact WCAG relative-luminance formula by the library's internal helper, which composites a translucent colour over `$body-background` (never Foundation's `color-luminance()`, whose approximate `pow()` passes failing pairs on dark backgrounds, nor `color-contrast()`, which rounds to one decimal): `@error` when the ratio of `$closebutton-color` or of `$closebutton-color-hover` against `$offcanvas-background` is under 3 (1.4.11 and large-text 1.4.3; Foundation's defaults give 2.77 at rest), naming the setting and `$offcanvas-background`; `@warn` when the ratio of `$anchor-color` against `$offcanvas-background` is under 4.5 (1.4.3; defaults give 3.76), naming both; `@warn` when the Zero-breakpoint entry of `$offcanvas-sizes` exceeds 320 px (1.4.10); `@error` when `$maincontent-class` is not `'off-canvas-content'`, naming the setting, because `nfsOffCanvasContent` binds Foundation's default class and a renamed one would leave the push, reveal, and nested rules without an element.
   Removed by the class-rule revision: the panel-scoped `.close-button` 24 px rule (now `nfs-close-button`'s floor on every close button) and the `$reveal-for` and `$in-canvas-for` parameters (the Options take Class breakpoints only, whose classes Foundation's own loops emit).
2. Reuses the developer's `$offcanvas-background`, `$closebutton-color`, `$closebutton-color-hover`, `$anchor-color`, `$body-background`, `$offcanvas-sizes` (its Zero-breakpoint entry), and `$maincontent-class`; no Foundation value is copied. Required setting on Foundation's defaults: a passing panel pair, for example `$offcanvas-background: $white` (close button 3.42:1 at rest and 19.63:1 on hover, links 4.65:1); the Storybook settings file sets it with the rule ids in a comment.
3. No `--nfs-off-canvas-*` property; the directives write no custom property.
4. Motion classes: none; the plugin animates only through Foundation's transitions, and (a) is its `prefers-reduced-motion` override.
5. Missing include: the compile no longer checks the panel colours or the class name; transitions run at full length under reduced motion; Sticky elements inside the wrapper stop sticking; a word wider than the viewport is cut off at the wrapper's edge. A missing `nfs-close-button` leaves the close button at Foundation's glyph box, which fails `target-size` beside the menu; a missing `nfs-menu-icon` leaves the menu icon at 20 by 16 px (its development check reports it). A missing `nfs-breakpoint-properties` is reported by `strictVariantProperties` while `revealOn` or `inCanvasOn` is bound. Missing `foundation-off-canvas` shows every closed panel in the page flow and the directives only switch classes.
6. Variant properties: none. `position` is a closed family, and the breakpoint names are read from `--nfs-breakpoint-classes`, which `nfs-breakpoint-properties` writes (one writer per property, building-blocks 1.13).

### Platform features to adopt when the browser target moves

- `CloseWatcher` (no WebKit release yet): a watcher created on open would add the Android back gesture to Escape. VoiceOver's scrub needs no watcher: WebKit dispatches it as a trusted, bubbling Escape `keydown` on the element VoiceOver is on (`performDismissAction`), which the `window` listener already handles ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)). The `window` listener stays as the fallback until every target browser has `CloseWatcher`.
- `@starting-style` and `transition-behavior: allow-discrete` (widely available in 2027): would let a modal panel enter the top layer with Foundation's transition; the revealed and in-canvas forms still rule out `<dialog>` (ADR 0030), so no change is planned.
- `scrollbar-gutter: stable` (Baseline 2024, widely available in 2027): a library rule on `.is-off-canvas-open` would stop the page shifting when the lock removes the scrollbar.
- Invoker Commands: when they reach the target, the Triggers utility may add `commandfor` with a custom command so a pre-hydration tap needs no replay (needs the static panel id this spec already recommends).
- `popover`: not adopted even then; push and revealed panels must stay in the page flow.

### Foundation behaviour changed or dropped

- `aria-hidden` on the panel becomes nothing: `.is-closed` hides it, `inert` covers the exit, and a revealed panel needs no attribute.
- The generated overlay becomes a developer element; `contentOverlay` becomes its presence; its `is-overlay-*` class comes from the panel's Structural class instead of its computed `position`.
- Document-wide trigger discovery, `contentId` lookup, sibling and closest-ancestor walking, and `nested` auto-detection become typed references and DI.
- Reading the position from the class (with a `left` fallback) becomes a required `position` input; reading `revealOn` and `inCanvasOn` from class names with regular expressions (and `revealClass`, `isRevealed`) becomes two inputs that bind the classes. Every class Foundation's markup carried is bound by a directive; a copy is stripped.
- The touch scroll handlers and `data-off-canvas-scrollbox`/`-outer` are dropped: they worked around mobile Safari versions before the Browser target, and Foundation's `overflow: hidden` on `body` does the locking.
- `data-off-canvas-sticky`'s inline `top` rewriting is dropped (Out of Scope), and with it the forced `contentScroll: false`.
- `tabindex="-1"` on the content under `trapFocus` is dropped; modal mode applies the Modal inert set.
- The inline `transition-duration` from `transitionTime` is dropped; `$offcanvas-transition-length` sets it.
- Escape only with focus inside the panel becomes Escape from anywhere while open; focus return only on Escape becomes focus return on every close.
- `opened.zf.offCanvas` at transition start becomes `isOpenChange` (request) and `opened` (end), removing the misleading name.
- New: dialog semantics in modal mode, the Modal inert set, a Tab wrap from CDK, `aria-expanded` on every Trigger of a non-modal panel whenever it is added (modal-mode Triggers render `aria-haspopup="dialog"` and `aria-controls` instead), `closeOnEsc`, reduced-motion support, closing on a crossing into the revealed range without leaving an overlay behind, the Runtime checks for reveal and in-canvas breakpoints, and WCAG 2.2 AA checks in the Sass.
