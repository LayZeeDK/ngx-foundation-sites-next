# Spec: Off-canvas

Ticket: [Spec: Off-canvas](../issues/25-spec-off-canvas.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

A site built on Foundation for Sites uses an off-canvas panel for its mobile navigation, a filter drawer, or a sidebar that is a drawer on small screens and a permanent column on large ones. Foundation's OffCanvas plugin does this in jQuery: it finds the page content by id or by walking the DOM, generates an overlay `div` and inserts it into the page, reads the panel's position and its reveal breakpoint back out of class names with regular expressions, toggles `is-open`/`is-closed` and a family of content classes, waits for `transitionend` to finish each step, locks scrolling with a body class plus iOS touch handlers, and rewrites the inline `top` of fixed elements while the content is pushed. Its accessibility is thin: `aria-hidden` on the panel, `aria-expanded` only on the triggers that existed at initialisation, Escape only while focus is inside the panel, focus returned to the trigger only on that Escape path, no dialog semantics even when it traps focus, and a focus trap that leaves the covered page reachable by pointer. Its completion events are named backwards (`opened.zf.offCanvas` fires when the open transition starts).

An Angular developer on the next library needs the same panels without jQuery and without the generated structure, correct in every rendering mode: server HTML that hides a closed panel and shows a revealed sidebar at the right widths before any JavaScript runs, prerendered pages, incremental hydration, a hamburger tapped before the bundle arrives, and zoneless change detection. The panel must follow the WAI-ARIA disclosure pattern by default and the modal dialog pattern when it traps focus over an overlay, meet WCAG 2.2 AA (Foundation's default panel colours fail it), animate with Foundation's own transform transition, and reuse Foundation's Sass rather than restyle it.

## Solution

Three attribute directives on the markup Foundation already documents, plus the shared Triggers:

- `[nfsOffCanvas]` on the `.off-canvas` (or `.off-canvas-absolute`) panel is the Openable. It holds the `isOpen` model, implements `open()`, `close()`, and `toggle()`, emits `opened` and `closed` when Foundation's transform transition has finished, provides `nfsOpenableToken` so a bare `nfsClose` inside the panel closes it, and binds Foundation's State classes (`is-open`, `is-closed`, `is-transition-push`/`is-transition-overlap`) plus the `reveal-for-<bp>` and `in-canvas-for-<bp>` classes from its `revealOn` and `inCanvasOn` inputs.
- `[nfsOffCanvasContent]` on the `.off-canvas-content` element receives Foundation's content classes (`is-open-<position>`, `has-transition-<transition>`, `has-position-<position>`, `has-reveal-<position>`) from every panel linked to it. A panel links to it through the `content` input (the typed counterpart of `contentId`) or, for a panel nested inside the content, through dependency injection.
- `[nfsOffCanvasOverlay]="panel"` on a consumer-written `div.js-off-canvas-overlay` replaces the overlay Foundation generated: it binds `is-visible` and `is-closable` and closes the panel on click. Leaving it out is Foundation's `contentOverlay: false`.

Nothing is a `<dialog>` ([ADR 0030](../adr/0030-off-canvas-no-dialog.md), "OffCanvas panels are not `<dialog>` elements"): the same element is a revealed sidebar or an in-canvas page element at larger breakpoints, which a closed `<dialog>` cannot be. Modal mode, Foundation's `trapFocus` with an overlay present, adds `role="dialog"`, `aria-modal="true"`, `inert` on every element outside the panel's ancestor chain (the Modal inert set), and a CDK `FocusTrap`, and its Triggers render `aria-haspopup="dialog"` and `aria-controls` without `aria-expanded`; every other configuration is a disclosure whose Triggers carry `aria-expanded`. Focus moves into the panel when it opens and back to the Trigger when it closes, on every close path. Escape closes an open panel from anywhere, which also keeps a panel that covers the page from hiding the focused element (WCAG 2.2 success criterion 2.4.11, whose note exempts content the user opened and can dismiss without moving focus).

All first-paint state is host bindings: a closed panel is `is-closed` in server HTML (Foundation's `visibility: hidden`), a revealed sidebar is visible from its Foundation class at every width, and no breakpoint decides a server-bound class. The Breakpoint service only drives behaviour after the first render. The library CSS is small and documented: a reduced-motion override for Foundation's transitions, a 24 px minimum for the close button, and `overflow: clip` on `.off-canvas-wrapper` so Sticky works inside it; a compile-time check stops a build whose panel colours fail WCAG 2.2 AA, as Foundation's defaults do.

## User Stories

1. As an application developer, I want to put `nfsOffCanvas` on Foundation's `.off-canvas` markup, so that I keep Foundation's documented panel markup and classes.
2. As an application developer, I want `[nfsOpen]="nav"` or `[nfsToggle]="nav"` on my hamburger button, so that I link the button to the panel with a typed reference instead of an id string.
3. As an application developer, I want a bare `nfsClose` on the close button inside the panel, so that the button closes the panel it sits in with no reference.
4. As an application developer, I want the panel's side taken from Foundation's `.position-left`, `.position-right`, `.position-top`, or `.position-bottom` class, so that I do not state it twice.
5. As an application developer, I want `transition="overlap"` or the default push, so that Foundation's `data-transition` carries over.
6. As an application developer, I want a panel nested inside `.off-canvas-content` to find the content by itself and use the overlap transition, as Foundation's nested form does, so that one element can be an off-canvas on small screens and part of the page on large ones.
7. As an application developer, I want `[content]="page"` to link a panel to a content element elsewhere, so that Foundation's `contentId` has a typed counterpart.
8. As an application developer, I want several panels to share one content element, so that a left menu and a right filter panel work on the same page.
9. As an application developer, I want to write the overlay element myself with `[nfsOffCanvasOverlay]="nav"`, or leave it out, so that server HTML contains every element and Foundation's `contentOverlay: false` is just markup.
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
33. As a touch user, I want the close button to accept presses across at least 24 by 24 CSS px, so that I can hit it reliably next to the menu.
34. As a visitor on a 320 px wide screen or at 400 percent zoom, I want the open panel and the pushed page to cause no horizontal scrolling, so that I can use the page at any zoom.
35. As an application developer, I want a Sticky element inside the page content to keep sticking inside Foundation's off-canvas wrapper, so that combining the two needs no workaround.
36. As an application developer, I want application-wide defaults for the Options through a Defaults token, so that I set them once.
37. As an application developer, I want development-mode warnings for a missing position class, a missing content link, an unnamed modal panel, a modal panel without a close button, and a hand-written reveal class, so that I catch markup mistakes early.
38. As a developer of a server-rendered application, I want a hamburger tapped before hydration to open the panel once the page hydrates, so that early taps are not lost.
39. As a developer using incremental hydration, I want to wrap the panel, its content, its overlay, and its Triggers in one `@defer (hydrate on ...)` block, so that a tap hydrates and replays correctly.
40. As a developer using `@defer (hydrate never)`, I want to know that a revealed or in-canvas panel still works at its breakpoints and that the drawer stays closed below them, so that I choose that block type knowingly.
41. As a zoneless application developer, I want every state change to be a signal write, so that the directives need no `NgZone` or `markForCheck`.
42. As a tester, I want story ids `off-canvas--<story>` shared by play functions and Playwright, so that every layer tests the same artifact.

## Implementation Decisions

### Foundation contract

From Foundation 6.9's plugin source, Sass, and docs page (the Foundation plugin inventory B, section 6).

Markup: `.off-canvas.position-<side>` (or `.off-canvas-absolute`) with `data-off-canvas`, placed before its `.off-canvas-content[data-off-canvas-content]` sibling or nested inside it; an optional `.off-canvas-wrapper` around both hides the pushed content's overflow; Triggers are `data-open`/`data-toggle`/`data-close` with the panel id; a `.close-button` with `data-close` inside the panel. Several panels must come before the content element.

Options (`OffCanvas.defaults`), each mapped or dropped:

| Option | Type | Foundation default | Library |
| --- | --- | --- | --- |
| `closeOnClick` | boolean | `true` | `closeOnClick` input, default `true`: overlay click closes; without an overlay, a click on the linked content closes (Foundation's rule) |
| `contentOverlay` | boolean | `true` | Dropped option: the overlay is the consumer's `[nfsOffCanvasOverlay]` element; writing it is `true`, omitting it is `false` |
| `contentId` | string or null | `null` | `content` input taking an `NfsOffCanvasContent` reference; the enclosing content is found through DI when the panel is nested |
| `nested` | boolean or null | `null` | Dropped option: derived; a panel is nested when an `NfsOffCanvasContent` encloses it, and a nested panel uses the overlap transition as in Foundation |
| `contentScroll` | boolean | `true` | `contentScroll` input, default `true`; `false` binds Foundation's `is-off-canvas-open` on `body` while open, from a render callback |
| `transitionTime` | string or null | `null` | Dropped option: the transition length is Foundation's `$offcanvas-transition-length` setting (building-blocks 1.4 timing options) |
| `transition` | `'push'` or `'overlap'` | `'push'` | `transition` input, same values and default (Foundation's JSDoc names `detached` and `slide`, a doc bug) |
| `forceTo` | `'top'`, `'bottom'`, or null | `null` | `forceTo` input, same values and default; `window.scrollTo` in the open render callback |
| `isRevealed` | boolean | `false` | Dropped option: `revealOn` alone decides; Foundation sets `isRevealed` from the class or the pair |
| `revealOn` | breakpoint name or null | `null` | `revealOn` input; binds `reveal-for-<revealOn>` on the panel and reads `NfsMediaQuery.atLeast(revealOn)` for behaviour |
| `inCanvasOn` | breakpoint name or null | `null` | `inCanvasOn` input; binds `in-canvas-for-<inCanvasOn>` and reads `atLeast(inCanvasOn)` for behaviour |
| `autoFocus` | boolean | `true` | `autoFocus` input with Material's union (below), default `true` |
| `revealClass` | string | `'reveal-for-'` | Dropped option: a class-name option; the class is the contract (building-blocks 1.4) |
| `trapFocus` | boolean | `false` | `trapFocus` input, default `false`; with an overlay present it switches on modal mode |
| (none) | | | New: `closeOnEsc` input, default `true`. Foundation always closes on Escape; the input is an addition beyond Foundation (building-blocks 1.4 and audit 0002 M6) |

`position` is not an Option: Foundation reads it from the `.position-*` class (default `left`), and so does the library. `closeOnClickInside` is not an OffCanvas option (it is DropdownMenu's) and has no counterpart.

Events, all fired on the panel: `opened.zf.offCanvas` synchronously when the open transition starts (despite its name); `openedEnd.zf.offCanvas` on the open `transitionend`; `close.zf.offCanvas` at the start of `close()`; `closed.zf.offCanvas` on the close `transitionend`; `init`/`destroyed` from the base class. There is no `open.zf.offCanvas`. Mapping: `opened.zf.offCanvas` and `close.zf.offCanvas` become the `isOpenChange` output the model generates (request time); `openedEnd.zf.offCanvas` becomes `opened`; `closed.zf.offCanvas` becomes `closed`; `init`/`destroyed` have no counterpart.

Methods: `open(event, trigger)` (no-op when open, revealed, or in-canvas), `close()` (no-op when closed or revealed), `toggle(event, trigger)`, `reveal(isRevealed)`, `destroy()`. The library keeps `open(trigger?)`, `close()`, `toggle(trigger?)`; `reveal()` is internal state driven by `revealOn`.

Keyboard: `Keyboard.register('OffCanvas', {ESCAPE: 'close'})` on a panel `keydown`, unconditional, then focus to the last Trigger and `preventDefault()`.

Dropped behaviours, each with its reason under Further Notes: `aria-hidden` on the panel, the generated overlay, DOM discovery of triggers and content, the class-name regular expressions, the touch scroll handlers and `data-off-canvas-scrollbox`, `data-off-canvas-sticky`, `tabindex="-1"` on the content, the inline `transition-duration`.

### CSS class to Angular mapping

| Foundation class or attribute | Angular | Rationale |
| --- | --- | --- |
| `.off-canvas`, `.off-canvas-absolute` with `data-off-canvas` | `NfsOffCanvas` directive, selector `[nfsOffCanvas]`, on the consumer's element | Structural class names the directive (building-blocks 1.3); the consumer writes the class, so either variant works |
| `.position-left/right/top/bottom` | Read from the static `class` attribute (`HostAttributeToken`) | Foundation reads it the same way; one source |
| `.is-transition-push`, `.is-transition-overlap` | Host class binding on the panel | Foundation State class; overlap forced when nested |
| `.is-open`, `.is-closed` | Host class bindings on the panel from the phase | Foundation State classes; `is-closed` (`visibility: hidden`) is the closed first paint |
| `.reveal-for-<bp>`, `.in-canvas-for-<bp>` | Host class bindings from `revealOn`/`inCanvasOn` | Foundation's CSS shows the panel at the breakpoint before hydration (building-blocks 1.11 decision 8) |
| `.off-canvas-content` with `data-off-canvas-content` | `NfsOffCanvasContent` directive, selector `[nfsOffCanvasContent]` | Needs host bindings in server HTML |
| `.is-open-<pos>`, `.has-transition-<t>`, `.has-position-<pos>`, `.has-reveal-<pos>` on the content | Host class map on `NfsOffCanvasContent`, computed from its linked panels | Foundation State classes; the push transform and the reveal margin |
| `div.js-off-canvas-overlay.is-overlay-fixed` or `.is-overlay-absolute` (generated by Foundation) | `NfsOffCanvasOverlay` directive, selector `[nfsOffCanvasOverlay]`, on an element the consumer writes after the panel | No generated structure (ADR 0008); the consumer writes Foundation's classes, `is-overlay-fixed` after a `.off-canvas` panel, `is-overlay-absolute` after a `.off-canvas-absolute` panel |
| `.is-visible`, `.is-closable` on the overlay | Host class bindings on `NfsOffCanvasOverlay` | Foundation State classes; the fade and `cursor: pointer` are Foundation's |
| `.is-off-canvas-open` on `body` | Written from a render callback while a panel with `contentScroll: false` is open | A directive cannot bind `body`; Foundation's rule does the locking |
| `.off-canvas-wrapper` | No directive | CSS only; the library mixin changes its `overflow` (Sass) |
| `data-open`/`data-toggle`/`data-close` | `nfsOpen`, `nfsToggle`, `nfsClose` from the Triggers utility | Shared utility; the panel supplies the Trigger role |
| `.close-button` | No directive; a bare `nfsClose` on it | Close Button markup |
| `data-autofocus` on a descendant | Kept as a plain attribute that `autoFocus: true` looks for first | Foundation's marker; no directive needed |

### Hierarchy and DI shape

```
div.off-canvas-wrapper                                         (CSS only)
  div.off-canvas.position-left [nfsOffCanvas] #nav="nfsOffCanvas" [content]="page"
      provides nfsOpenableToken (useExisting)
    button.close-button nfsClose                               bare Trigger -> Nearest Openable = the panel
  div.js-off-canvas-overlay.is-overlay-fixed [nfsOffCanvasOverlay]="nav"   registers with the panel
  div.off-canvas-content [nfsOffCanvasContent] #page="nfsOffCanvasContent"
      provides nfsOffCanvasContentToken (useExisting)
    div.title-bar > button.menu-icon [nfsToggle]="nav"   24 px hit area from nfs-responsive-toggle (2.5.8)
    div.off-canvas.position-right [nfsOffCanvas]               nested: finds the content through DI, overlap forced
```

- The panel is the Openable: `providers: [{provide: nfsOpenableToken, useExisting: NfsOffCanvas}]`, so a bare `nfsClose` or `nfsToggle` inside it resolves it (Triggers spec, ADR 0013). A Trigger outside names it by reference.
- Panel to content: the `content` input wins when bound; otherwise `inject(nfsOffCanvasContentToken, {optional: true, skipSelf: true})` finds the enclosing content, which is also what makes the panel nested. A sibling panel has no enclosing content, so Foundation's sibling discovery becomes the `content` reference. The panel registers itself with its content from an `effect` whose cleanup unregisters (the reverse-link shape of the Triggers and Responsive Toggle specs, and the exception building-blocks 1.5 and 1.9 name for it: the `content` reference can change at runtime, which `ngOnInit` cannot follow, and the effect writes only the content's registry signal); it writes no DOM, so it runs on the server, and view effects run before host bindings of the same view, so the content's classes are right in the first pass when both sit in one template.
- Overlay to panel: `[nfsOffCanvasOverlay]="nav"` is a required reference; the overlay registers with the panel from an `effect` the same way, which tells the panel it has an overlay (Foundation's `contentOverlay`).
- `nfsOffCanvasContentToken = new InjectionToken<NfsOffCanvasContent>('nfsOffCanvasContentToken')` in a token file that imports only types (lightweight token). No panel token: nothing injects the panel by class; `nfsOpenableToken` serves descendants and `exportAs` serves templates.
- Defaults token, Shape B (building-blocks 1.4): `nfsOffCanvasDefaultsToken` with the all-optional `NfsOffCanvasDefaults` (`transition`, `closeOnClick`, `closeOnEsc`, `contentScroll`, `forceTo`, `autoFocus`, `trapFocus`), read with `inject(token, {optional: true})` to seed input defaults; nearest provider wins.
- Injected by the panel: `NfsMediaQuery` (Breakpoint service), `nfsAnimationsToken`, CDK `FocusTrapFactory` (only used when `trapFocus` is on), CDK `InteractivityChecker`, CDK `_IdGenerator`, `DOCUMENT`, `Renderer2` (the `body` class, the Modal inert set, the listeners added while open, and the focus containment listeners), `NgZone` (fallback timer outside the zone), `DestroyRef`, `HostAttributeToken('id')`, `HostAttributeToken('class')`, and `NfsOffCanvasScrollLock`.
- `NfsOffCanvasScrollLock`, an internal `@Service()` of the entry point (not public API), holds the Scroll lock count for the document: the open panels with `contentScroll: false`. The first to lock adds `is-off-canvas-open` to `body`, and the last to release removes it, so the class stays while a second locked panel is open. A service is allowed here for the reason building-blocks 1.5 gives, state shared across instances, as Reveal's `NfsRevealStack` holds its own count (amended 2026-09-26, audit 0005 unrecorded departure 5).
- Entry point: `ngx-foundation-sites/off-canvas`, holding the three directives, the tokens, and the types; it imports `nfsOpenableToken` from the Triggers entry point and `NfsMediaQuery` from the media-query entry point.

### API

```ts
type NfsOffCanvasTransition = 'push' | 'overlap';
type NfsOffCanvasAutoFocus = boolean | 'first-tabbable' | 'first-heading' | (string & {}); // string = CSS selector

class NfsOffCanvas implements NfsOpenable {   // selector [nfsOffCanvas], exportAs 'nfsOffCanvas'
  readonly transition: InputSignal<NfsOffCanvasTransition>;      // default 'push'
  readonly content: InputSignal<NfsOffCanvasContent | undefined>; // Foundation contentId
  readonly closeOnClick: InputSignalWithTransform<boolean, unknown>;  // default true
  readonly closeOnEsc: InputSignalWithTransform<boolean, unknown>;    // default true (new)
  readonly contentScroll: InputSignalWithTransform<boolean, unknown>; // default true
  readonly forceTo: InputSignal<'top' | 'bottom' | null>;         // default null
  readonly revealOn: InputSignal<NfsBreakpointName | null>;       // default null
  readonly inCanvasOn: InputSignal<NfsBreakpointName | null>;     // default null
  readonly autoFocus: InputSignal<NfsOffCanvasAutoFocus>;         // default true
  readonly trapFocus: InputSignalWithTransform<boolean, unknown>; // default false
  readonly isOpen: ModelSignal<boolean>;                          // default false
  readonly opened: OutputEmitterRef<void>;                        // Completion output
  readonly closed: OutputEmitterRef<void>;                        // Completion output
  readonly id: Signal<string>;
  readonly triggerRole: Signal<'disclosure' | 'modal-dialog'>;
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;                                  // result ignored
  toggle(trigger?: HTMLElement): void;
  registerTrigger(trigger: HTMLElement): () => void;
}

class NfsOffCanvasContent {   // selector [nfsOffCanvasContent], exportAs 'nfsOffCanvasContent'; no inputs or outputs
}

class NfsOffCanvasOverlay {   // selector [nfsOffCanvasOverlay], exportAs 'nfsOffCanvasOverlay'
  readonly panel: InputSignal<NfsOffCanvas>;  // alias 'nfsOffCanvasOverlay', required
}
```

| Member | Foundation | Behaviour and deltas |
| --- | --- | --- |
| `transition` | `data-transition`, `'push'` | Binds `is-transition-<t>`; a nested panel uses `overlap` whatever the input says (Foundation's rule, silent) |
| `content` | `data-content-id` | Typed reference; a bound value wins over the enclosing content. Without either, nothing is pushed or clicked to close, and a development warning fires when the configuration needs a content (push, or `closeOnClick` without an overlay); modal mode needs none, because its Modal inert set covers everything outside the panel whether a content is linked or not |
| `closeOnClick` | `data-close-on-click`, `true` | Overlay `click` closes; with no overlay registered, a `click` inside the linked content closes, except clicks inside the panel or on a registered Trigger (Foundation's content listener would also catch the Trigger's own click) |
| `closeOnEsc` | none | New, default `true` = Foundation's unconditional Escape. `false` stops Escape from closing; in modal mode a close control inside the panel is then required (2.1.2), and a non-modal panel loses the 2.4.11 escape route; both cases warn in development mode |
| `contentScroll` | `data-content-scroll`, `true` | `false` adds `is-off-canvas-open` to `body` from the open render callback until the close transition completes; Foundation's `overflow: hidden` does the locking; the touch handlers are dropped |
| `forceTo` | `data-force-to`, `null` | `window.scrollTo(0, 0)` or to the document's scroll height, in the open render callback before focus moves and before the lock |
| `revealOn` | `data-reveal-on` or `.reveal-for-<bp>`, `null` | Binds `reveal-for-<revealOn>` (server HTML included). While `atLeast(revealOn)`: `open()` is a no-op, the content gets `has-reveal-<pos>`, and crossing into the range closes an open panel. A hand-written `reveal-for-*` class warns in development mode and names the input |
| `inCanvasOn` | `data-in-canvas-on` or `.in-canvas-for-<bp>`, `null` | Binds `in-canvas-for-<inCanvasOn>`; while `atLeast(inCanvasOn)`: `open()` is a no-op and crossing into the range closes an open panel |
| `autoFocus` | `data-auto-focus`, `true` | Where focus goes when the panel opens: `true` and `'first-tabbable'` focus the first descendant carrying `data-autofocus`, else the first tabbable descendant (`InteractivityChecker`; Foundation looked only at `a, button`); `'first-heading'` focuses the first `h1`-`h6` or `[role="heading"]`; a string focuses the first match of that selector; `false` moves nothing. A heading or selector match that is not focusable gets `tabindex="-1"`, removed on blur (Material's rule). The panel element itself is never focused (building-blocks 1.10) |
| `trapFocus` | `data-trap-focus`, `false` | With an overlay registered: modal mode (below). Without one: a CDK `FocusTrap` wraps Tab inside the panel (Foundation's behaviour) but the panel stays a disclosure, and a development warning says it is not announced as modal |
| `isOpen` | the `is-open` class | `model(false)`; `true` from the moment an open is requested. It is the requested state: a panel whose `isOpen` is `true` while revealed or in-canvas shows nothing extra (see the state model) |
| `isOpenChange` | `opened.zf.offCanvas`, `close.zf.offCanvas` | Generated by the model, at request time |
| `opened` / `closed` | `openedEnd.zf.offCanvas`, `closed.zf.offCanvas` | After the panel's `transform` transition ends, or at once when none runs; an interrupted direction emits nothing |
| `open(trigger?)` | `open(event, trigger)` | No-op when already open or while revealed or in-canvas; records `trigger` for focus return |
| `close()` | `close()` | Sets `isOpen` to `false`; no veto; no result |
| `toggle(trigger?)` | `toggle(event, trigger)` | `isOpen() ? close() : open(trigger)` |
| `registerTrigger` | the document-wide trigger search at init | Records Triggers for the focus-return fallback, the content-click exclusion, and development checks; Triggers added later are included (Foundation's were not) |
| `id` | the panel id | A static `id` attribute wins; otherwise `_IdGenerator` with the prefix `nfs-off-canvas-`. Consumers set `id` statically |
| `triggerRole` | none | `'modal-dialog'` in modal mode, else `'disclosure'` |
| `panel` (overlay) | the generated overlay's owner | Required typed reference |

Modal mode is `trapFocus() && hasOverlay()`, the APG's condition (both blocking and obscuring): the panel binds `role="dialog"` and `aria-modal="true"` while it is open and not revealed or in-canvas, once focus is inside the panel, the panel sets `inert` on every element sibling of the panel and of each of its ancestors up to `body` that is not already inert, except `.js-off-canvas-overlay` elements, the CDK focus-trap anchors, elements carrying `aria-live` or `popover`, and CDK's `body` containers `.cdk-overlay-container` and `.cdk-describedby-message-container` (the Modal inert set); it records the elements it changed and removes `inert` from exactly those at the close request, before focus returns; a panel destroyed while the set is applied removes it in `DestroyRef.onDestroy`. A sibling content is in the set; the enclosing content of a nested panel is an ancestor, so it is never made inert while its other children are. The exceptions follow CDK Dialog's background hiding, which skips `aria-live` and `popover` elements: live regions stay announceable, and the overlays and description messages that controls inside the panel open or use stay reachable. A CDK `FocusTrap` wraps Tab, and the Trigger role is `modal-dialog`, because every Trigger outside the panel is inert while it is open ([Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md), its rule; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)). The panel's name comes from the consumer's `aria-labelledby` or `aria-label` on the panel element; a modal panel without either warns in development mode.

State model, all signals (no `effect` propagates state; the two registration effects above write only the target's registry signal, the reverse-link exception of building-blocks 1.5):

- `isOpen`: the model.
- `#live`: `false` until the panel's first `afterNextRender`; never set on the server.
- `#revealed` and `#inCanvas`: `computed` from `revealOn`/`inCanvasOn` and `NfsMediaQuery.atLeast()`; the Server breakpoint's answer on the server and until the service goes live (ADR 0014).
- `#active`: `computed`, `isOpen() && !#revealed() && !#inCanvas()`. Everything an open panel does to the page (overlay, content classes, `inert`, scroll lock, focus trap, Escape listener, dialog role) follows `#active`, never `isOpen` alone, so a stale `isOpen` can never leave an overlay over a sidebar.
- `#phase`: a `linkedSignal` of `#active` returning `'idle'` for the first value and while `#live` (read untracked) is `false`, else `'entering'` or `'exiting'`; completion writes `'idle'`.
- `#modal`: `computed`, `trapFocus() && #overlay() !== undefined`.
- `#focusPlaced`: a signal the open render callback sets after it has moved focus, cleared by every close.
- `#nested`: fixed at construction (an enclosing content was injected); `#transition`: `computed`, `'overlap'` when nested, else the input.
- `#position`: the `.position-*` class from the static `class` attribute, else `'left'` (Foundation's default).

| State | `#active` | `#phase` | Panel classes | Panel attributes | Content classes | Overlay classes |
| --- | --- | --- | --- | --- | --- | --- |
| Closed | `false` | idle | `is-closed` | none | none | none |
| Entering | `true` | entering | `is-open` | `role`, `aria-modal`, and the Modal inert set once focus is inside (modal) | `is-open-<pos> has-transition-<t> has-position-<pos>` | `is-visible`, `is-closable` (with `closeOnClick`) |
| Open | `true` | idle | `is-open` | as entering | as entering | as entering |
| Exiting | `false` | exiting | none | `inert` | `has-transition-<t> has-position-<pos>` | none (Foundation's fade out) |
| Revealed or in-canvas | `false` | idle | `is-closed` plus the Foundation breakpoint class, whose CSS wins at the breakpoint | none | `has-reveal-<pos>` while revealed | none |

`is-transition-<t>` and the `reveal-for-*`/`in-canvas-for-*` classes are bound in every state. The panel keeps `is-closed` while revealed or in-canvas: Foundation's `.position-<side>.reveal-for-<bp>` and `.off-canvas.in-canvas-for-<bp>` rules come later in `foundation-off-canvas` at the same specificity and set `visibility: visible`, so no class changes with the breakpoint and server HTML is identical at every width. `inert` is on the panel only while exiting, never on a closed panel (building-blocks 1.10: an `inert` there would disable the revealed sidebar).

Breakpoint reactions, in one `afterRenderEffect` that records its first values and acts only on later changes (so the first-render handoff never acts):

- Crossing into the revealed or in-canvas range while `isOpen` is `true` writes `isOpen` to `false` (Foundation's `reveal(true)` and `_checkInCanvas` both call `close()`). Focus is not moved, because the panel stays visible. This differs from the Responsive Toggle spec, whose menu keeps its state across a crossing because it looks the same either way; here an open drawer would come back as an overlay the user never reopened, and a revealed panel cannot be closed by the user.
- Crossing out of the range while focus is inside the now hidden panel moves focus to the first registered Trigger outside the panel (building-blocks 1.10 focus persistence). Foundation's CSS hides the panel at the crossing (`.reveal-for-<bp>` or `.in-canvas-for-<bp>` stops matching and `.off-canvas.is-closed { visibility: hidden }` applies) before any render callback runs, and the browser then moves focus to `<body>`, so a callback that reads `document.activeElement` is too late (building-blocks 1.5). Containment is therefore recorded continuously by `focusin`/`focusout` listeners on the panel host, which survives the crossing (the Breakpoint service's consumer rule 1, third place): `focusin` sets the record, a `focusout` whose `relatedTarget` lies outside the panel clears it, and a `focusout` without a `relatedTarget` (focus dropped to `<body>`) keeps it. The listeners are added with `Renderer2.listen` in `afterNextRender`, which first seeds the record from live focus (a focus placed in a server-rendered sidebar before hydration counts); being added in code, they put no `jsaction` in server HTML and never replay. The move runs in the `write` phase keyed on rendered state: it acts only when the record is set, the panel's computed `visibility`, read in `earlyRead`, is `hidden` (the state Foundation's CSS has rendered, not the Breakpoint service's answer), and `document.activeElement` is `<body>` or inside the panel; it then clears the record.

Development-mode checks, each once per instance, in render callbacks that exist only when `ngDevMode` is on and never on the server:

1. No `.position-*` class in the static `class` attribute, or the live class list disagrees with it (a bound position class).
2. A hand-written `reveal-for-*` or `in-canvas-for-*` class in the static `class` attribute (use the inputs).
3. No content linked when the configuration needs one (push, or `closeOnClick` without an overlay); a push panel whose content has no `.off-canvas-wrapper` parent (1.4.10).
4. Modal mode without `aria-label` or `aria-labelledby` on the panel; modal mode without a registered Trigger inside the panel (a close button, APG and 2.1.2); modal mode with `autoFocus: false`.
5. `trapFocus` without an overlay; `closeOnEsc: false` on a non-modal panel (2.4.11).
6. A registered Trigger outside the panel that is rendered while the panel is revealed or in-canvas (it would do nothing: hide it with Foundation's `.hide-for-<bp>`).
7. The panel is revealed or in-canvas by the Breakpoint service but its computed `visibility` is `hidden` (the breakpoint is outside `$breakpoint-classes` and the `nfs-off-canvas` include does not name it).
8. A revealed `position-top` or `position-bottom` panel whose computed `position` is `fixed` while the document's `scroll-padding-top` (or `-bottom`) is smaller than the panel's height (2.4.11).
9. An overlay without the `js-off-canvas-overlay` class, or placed inside an element the Modal inert set covers (the linked content, for example).

### Implementation level and primitives

Implementation level: native platform CSS and attributes (Foundation's transform transition and visibility classes, `inert`, `transitionend`) plus custom Angular directives for state, links, and focus; `@angular/cdk` supplies `FocusTrap`, `InteractivityChecker`, and `_IdGenerator`. `@angular/aria` 22.2 has no disclosure, dialog, or drawer pattern. Native `<dialog>` was weighed for the overlap and modal cases and rejected ([ADR 0030](../adr/0030-off-canvas-no-dialog.md), "OffCanvas panels are not `<dialog>` elements"): the same element must be a visible, non-dialog sidebar or page element at `revealOn`/`inCanvasOn` in server HTML, which a closed `<dialog>` (`display: none`, implicit `dialog` role) cannot be; Foundation's transform transition cannot start from `display: none` without `@starting-style`, which is outside the Browser target; and Foundation's default panel is not modal. `popover` and `CloseWatcher` are outside the target. `Directionality` is not used: Foundation's off-canvas Sass is physical (`.position-left` slides from the left in both directions), and the library keeps the class contract.

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Panel-to-content and overlay-to-panel registration | `effect` | Writes only the target's registry signal, runs on the server too, so server HTML already has the content and overlay classes; cleanup unregisters when the reference changes or the directive is destroyed (the reverse-link exception of building-blocks 1.5 and 1.9) |
| Live flag | `afterNextRender` (`write`) | Marks the end of the first render so the initial state never animates |
| Phase machine: timing, focus, scroll, lock, trap, timer | `afterRenderEffect`: `earlyRead` reads `document.activeElement` (the focus-return fallback) and the panel's computed `transition-property`, `transition-duration`, and `transition-delay` after the class change; `write` runs `forceTo`, moves focus with `preventScroll: true` then sets `#focusPlaced`, enables or disables the `FocusTrap`, applies the Modal inert set after `#focusPlaced` and removes it at the close request, adds the `body` class, returns focus on close, and starts the fallback timer outside the zone; cleanup clears the timer and removes an applied Modal inert set | Needs layout and the DOM after the classes are applied, never on the server |
| Escape listener and content-click listener | `afterRenderEffect` (`write`) adding them with `Renderer2.listen` while `#active`, removed in its cleanup | Exist only while a panel is open; not replayed, which is correct because nothing is open before hydration |
| Focus containment record | `afterNextRender` adding `focusin`/`focusout` on the panel with `Renderer2.listen`, seeded from live focus; removed on destroy | A continuous record on a host that survives a crossing (the Breakpoint service's consumer rule 1); added in code, so no `jsaction` and no replay |
| Breakpoint reactions | `afterRenderEffect`: `earlyRead` reads the panel's computed `visibility`, `write` closes or moves focus using the containment record | Reacts to the live breakpoint after the first render only, and moves focus on the state Foundation's CSS has rendered, because the CSS hides the panel before any callback runs (building-blocks 1.5) |
| Development checks | `afterRenderEffect` (`read`), only when `ngDevMode` | Reads computed style and the DOM |
| `afterEveryRender` | Not used | Nothing needs to run on renders that change none of the panel's signals |
| `injectAsync` | Not used | `FocusTrapFactory` and `InteractivityChecker` are small and must be ready in the same render pass as a replayed open, so focus moves in the first frame; each plugin's entry point already lets a consumer's `@defer` split the whole plugin |

Completion: on a `transitionend` host listener on the panel with `event.target` equal to the host and `propertyName` equal to `transform`, or on a fallback timer of the measured `transform` transition length (duration plus delay) plus 100 ms, whichever comes first. A measured zero completes at once. The length is measured, not declared, because it is the consumer's `$offcanvas-transition-length` setting, which no design-time constant knows; the case a fixed timer protects (the stylesheet or the transition is missing) measures zero and completes at once, as in the Toggler spec. This also fixes Foundation's caveat that a zero transition length leaves every completion step unfired. Revealed and in-canvas panels have `transition: none` from Foundation, so a close caused by a breakpoint crossing completes at once.

Focus rules:

- Open: after the classes are applied, in the phase machine's `write` step, focus moves to the `autoFocus` target with `preventScroll: true` (the panel is still translated off-screen, Material's guard), and only then is `#focusPlaced` set, so in modal mode the Modal inert set is applied after focus has left the Trigger and everything else outside the panel (Material's order: an `inert` applied to the focused Trigger first would drop focus to `body`). Focus moves at the start of the transition rather than after `transitionend` (Foundation), so keyboard and screen reader users can act at once and focus never depends on the transition firing.
- An initially open panel (server or first client render) moves focus only in modal mode, in the first render callback; a non-modal panel open at first paint moves nothing.
- Close, by any path (Escape, overlay, content click, a Trigger, the model, a method): in the `write` step after the classes are applied, when `document.activeElement` is inside the panel or is `body` (the panel turned `inert` while exiting, or a click on the overlay blurred), focus moves to the `trigger` passed to the last `open()`, else to the element that was focused before the panel opened, else to the first registered Trigger outside the panel. Focus elsewhere (a content link the user clicked) is left alone. A close caused by a breakpoint crossing moves nothing. The Trigger is the element passed by `open(trigger)` because WebKit does not focus a button on mouse click (the Reveal dialog prototype).

Escape: while `#active`, one `keydown` listener on `window` in the bubble phase closes the panel when `key === 'Escape'`, no modifier (`hasModifierKey`), not `isComposing`, not `defaultPrevented`, `closeOnEsc()` is `true`, and the event target is not inside a modal `<dialog>` that does not contain the panel (a Reveal opened from the page handles its own close request); it calls `preventDefault()` as its last statement. Listening on `window` rather than the panel means Escape works with focus behind a non-modal panel, and it runs after the Light dismiss registry's document listener, so an open Dropdown pane inside the panel closes first and marks the event handled (the Anchored pane spec's Escape rule).

Fallback: none needed. Every mechanism is in the Browser target (`inert`, `transitionend`, CSS transitions, `overflow: clip`, `display: flow-root`) or a Foundation class, and the CDK pieces are the ones Material's sidenav uses.

### Comparison with Angular Material

| Concern | Material `MatDrawer`/`MatSidenav` | OffCanvas |
| --- | --- | --- |
| Shape | Components: `mat-drawer-container` renders the backdrop and computes content margins; `mat-drawer`, `mat-drawer-content` | Directives on Foundation's markup; Foundation's CSS does the layout; the overlay is a consumer element |
| State | `opened` input with `openedChange`, backed by a signal | `isOpen` model (Material's `opened` renamed, building-blocks 1.3); `opened`/`closed` are the Completion outputs |
| Outputs | `opened`, `closed`, `openedStart`, `closedStart`, `positionChanged` | `opened`, `closed`, `isOpenChange`; no start events (building-blocks 1.4) |
| Mode | `mode: 'over' \| 'push' \| 'side'` | `transition: 'push' \| 'overlap'` (Foundation's option); `side` is `revealOn`; Material's `mode` is the reference only |
| Position | `position: 'start' \| 'end'`, logical | `.position-*` class, physical (Foundation) |
| Close control | `disableClose` gates Escape and backdrop together | Split: `closeOnClick` (Foundation) and `closeOnEsc` (new) |
| Focus | Trap in over/push while the backdrop shows; `autoFocus: AutoFocusTarget \| string \| boolean`; restore focus on close | Trap only in modal mode or with `trapFocus`; the same union without `'dialog'` (the panel is never focused); focus returns on every close |
| Content | `inert` on the content after the animation plus 50 ms; removed at once on close | the Modal inert set once focus is inside the panel, modal mode only; removed at close request |
| Role | None; the consumer adds `navigation`, `region`, or `dialog` | `role="dialog"` and `aria-modal` in modal mode only; otherwise the consumer's element or content supplies the landmark |
| Methods | `open(openedVia?)`, `close()`, `toggle(isOpen?, openedVia?)` returning promises | `open(trigger?)`, `close()`, `toggle(trigger?)` returning `void` (building-blocks 1.3; completion is the outputs) |
| Animation | CSS transform transition enabled after the first render; `transitionend` | Foundation's transform transition; `transitionend` plus a measured fallback; no transition before the first render |

Borrowed: the single two-way state, the `autoFocus` union, `preventScroll` while animating, the focus-then-inert order, focus restore, Escape without modifiers. Not borrowed: container components, computed margins, `fixedInViewport`, logical positions, promise returns, start events, the duplicate-position error (Foundation allows several panels per side).

### ARIA and keyboard

Patterns: WAI-ARIA APG Disclosure for every non-modal configuration, with the panel's own element or content supplying the landmark (`nav` with `aria-label` for navigation, `aside` for a sidebar); APG Dialog (Modal) in modal mode (`trapFocus` with an overlay), the research's two-mode reading.

| Element | Role | Attributes | Who renders them |
| --- | --- | --- | --- |
| Trigger (`nfsOpen`, `nfsToggle`) | native `button` | `aria-expanded`, `aria-controls` = panel id; in modal mode `aria-haspopup="dialog"` and `aria-controls` without `aria-expanded` | Triggers utility from `triggerRole` |
| `nfsClose` (close button) | native `button` | none from the Trigger; the consumer's `aria-label` ("Close menu") | Consumer |
| Panel, non-modal | the consumer's element (`nav`, `aside`, or `div` wrapping a named `nav`) | none from the library | Consumer |
| Panel, modal and open | `dialog` | `role="dialog"`, `aria-modal="true"`; name from the consumer's `aria-labelledby` or `aria-label` | `nfsOffCanvas` (role), consumer (name) |
| Panel, revealed or in-canvas | the consumer's element | none; no dialog role, no `aria-modal` | nothing |
| Everything outside the panel's ancestor chain (a sibling content included) | none | `inert` while a modal panel is open, after focus is inside; the overlay, focus-trap anchors, live regions, popovers, and CDK's overlay and description containers excepted | `nfsOffCanvas` |
| Overlay | none (an empty element) | none | nothing |

- A closed panel is hidden from assistive technology by Foundation's `.is-closed { visibility: hidden }`; `aria-hidden` is not used (building-blocks 1.10). An exiting panel is `inert`.
- Generated panel ids differ between server and client and are rewritten at hydration, since `id` and `aria-controls` are both bindings (building-blocks 1.5).
- Modal mode inerts every element outside the panel's ancestor chain, so content outside `.off-canvas-content` and the other children of a nested panel's content are unreachable, as behind a native modal dialog; the `FocusTrap` still wraps Tab through its `aria-hidden` anchors. The set is taken when focus enters the panel, so an element added outside the panel later is not made inert. While it is applied, Chromium resolves a reference from inside the panel to a rendered element outside it to nothing (an `aria-describedby` target, measured by [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)), so text that describes a control in the panel belongs inside the panel.
- Modal mode renders its Triggers in the `modal-dialog` shape (`aria-haspopup="dialog"` and `aria-controls`, no `aria-expanded`): the Modal inert set makes every Trigger outside the panel inert while it is open, so an expanded state could never be read as true, and while the panel is closed the only inferred state, Firefox's 'collapsed' in UI Automation, is true. This is the rule of [Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md), whose Off-canvas exception held only while `inert` covered the linked content alone; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md) applied it. A `nfsToggle` inside its own modal panel stays reachable while open and carries no expanded state, so the close control there is a bare `nfsClose` (development check 4).

| Key | Where | Behaviour |
| --- | --- | --- |
| Enter, Space | Trigger | Opens, closes, or toggles (native button activation; Triggers utility) |
| Tab, Shift+Tab | Open non-modal panel | Native order: through the panel, which precedes the content in the DOM, then into the content |
| Tab, Shift+Tab | Open modal panel, or `trapFocus` | Wraps inside the panel (CDK `FocusTrap` anchors); in modal mode everything outside the panel is `inert` (the Modal inert set) |
| Escape | Anywhere while a panel is open | Closes it (unless `closeOnEsc` is `false` or a control already handled the key); focus returns to the Trigger when it was inside the panel |
| Enter, Space | Close button, links with `nfsClose` | Close (native activation) |

### WCAG 2.2 AA requirements

The target is WCAG 2.2 level AA (user rule, ADR 0022). Each criterion below is a requirement with the test that proves it; none is advice.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.3 Contrast (Minimum) | Text in the panel reaches 4.5:1 against `$offcanvas-background`. The Storybook settings and every consumer on Foundation's defaults set `$offcanvas-background: $white`, which brings links to 4.65:1 | Fails: `$anchor-color` #1779ba on `$light-gray` #e6e6e6 is 3.76:1 (body text #0a0a0a passes at 15.9:1) | axe `color-contrast` in every story; the `nfs-off-canvas` mixin emits `@warn` when the ratio of `$anchor-color` against `$offcanvas-background`, computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded, is under 4.5; node-level Sass test |
| 1.4.11 Non-text Contrast | The close button's glyph (a 32 px icon, also large text) reaches 3:1 against `$offcanvas-background`: with `$offcanvas-background: $white`, `$closebutton-color` #8a8a8a reaches 3.42:1. The overlay and the panel's edge are not user interface components or states a user must identify to operate the page (the panel's appearance and the focus move convey the open state; closing also works by Escape and the close button), so the criterion sets no ratio for them | Fails: #8a8a8a on #e6e6e6 is 2.77:1 | The mixin stops the compile with `@error` naming `$closebutton-color` and `$offcanvas-background` when the ratio of `$closebutton-color` against `$offcanvas-background`, computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded, is under 3 (Foundation's `color-contrast()` is not used, because it rounds to one decimal and would pass 2.95:1; axe has no 1.4.11 rule); node-level Sass test |
| 2.4.7 Focus Visible | Every focusable element in the panel and the Triggers show the user agent's focus indicator. Foundation's `disable-mouse-outline` removes it only under `[data-whatinput='mouse']`, which needs the what-input script the library never loads | Passes | e2e: screenshot comparison before and after Tab into the open panel, three engines |
| 2.4.11 Focus Not Obscured (Minimum) | A non-modal panel that covers or pushes the page is content the user opened; while it is open, Escape closes it from anywhere without moving focus, which is the criterion's note for user-opened content, so a focused element behind it can always be revealed. Modal mode keeps focus inside the panel. A revealed top or bottom panel with `$offcanvas-fixed-reveal: true` covers scrolled content, so the consumer sets `scroll-padding-top` (or `-bottom`) on the document to the panel's height; development check 8 enforces it. Left and right revealed panels do not cover: Foundation's `has-reveal-<pos>` and sibling rules give the content a matching margin | Fails: Escape works only with focus inside the panel, so focus tabbed into content under an overlap panel stays hidden | e2e: open an overlap panel, Tab past its last element into content under it, press Escape, the focused element is unchanged and hit-tests to itself; revealed top-panel story with `scroll-padding-top`, every tabbed content element clear of the panel |
| 2.5.8 Target Size (Minimum) | The close button accepts presses across at least 24 by 24 CSS px: the mixin adds `min-width: 24px; min-height: 24px` to `.close-button` inside the panel. Its spacing exception does not hold here, because Foundation's docs place the absolutely positioned button over the first menu link. Triggers keep their own contracts (`nfsButton`). A `.title-bar .menu-icon` Trigger needs `@include nfs-responsive-toggle;` for its 24 by 24 px hit area (WCAG 2.5.8), with or without ResponsiveToggle; the include without an argument emits only that hit-area rule plus compile-time warnings. A `.menu-icon` outside `.title-bar` gets no library hit area, so it must meet 2.5.8 by the spacing exception or the consumer's own size | Fails: the medium close button is about 18.7 by 32 px next to a full-width link | axe `target-size` in every story (the WCAG 2.2 AA tags turn it on); e2e measures the button's box |
| 4.1.2 Name, Role, Value | Triggers expose `aria-expanded` and `aria-controls`; in modal mode `aria-haspopup="dialog"` and `aria-controls` without `aria-expanded`, because every Trigger outside the panel is inert while it is open; a modal panel exposes `role="dialog"`, `aria-modal="true"`, and a name; a revealed panel exposes neither dialog semantics nor a working Trigger (development check 6 asks the consumer to hide the Trigger) | Fails: no dialog semantics when trapping focus; `aria-expanded` only on triggers present at init | axe in every story (`aria-dialog-name`, `button-name`, ARIA rules); SSR smoke asserts the attributes |
| 2.4.3 Focus Order | Focus moves into the panel on open and back to the Trigger on every close; the panel precedes the content in the DOM | Fails partly: focus returns only on Escape | Stories `off-canvas--default`, `off-canvas--modal`; browser-level focus cases |
| 2.1.1 Keyboard, 2.1.2 No Keyboard Trap | Every action works from the keyboard; a modal panel is left by Escape or its close button; with `closeOnEsc: false` a close control inside the panel is required (development check 4) | Passes (Escape always closes) | Browser-level and e2e key cases |
| 1.4.10 Reflow | At 320 CSS px nothing scrolls horizontally: a push panel sits in `.off-canvas-wrapper` (development check 3), whose clip hides the pushed content's overflow; the Zero-breakpoint entry of `$offcanvas-sizes` is at most 320 px (the mixin emits `@warn` otherwise; Foundation's is 250 px); menus in the panel stack (`vertical menu`) | Passes with the wrapper | e2e at 320 by 640 px with a push panel open: `document.documentElement.scrollWidth <= 320` |
| 1.4.13 Content on Hover or Focus | Not touched: the panel opens on activation, never on hover or focus | n/a | none |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) with `parameters.a11y.test = 'error'` (building-blocks 1.10).

### Rendered HTML

Consumer markup (Foundation's docs example with the deltas: typed references, the overlay written by hand, a named `nav`, `$offcanvas-background: $white` in the settings):

```html
<div class="off-canvas-wrapper">
  <div class="off-canvas position-left" id="site-nav" nfsOffCanvas #nav="nfsOffCanvas" [content]="page">
    <button class="close-button" type="button" aria-label="Close menu" nfsClose>
      <span aria-hidden="true">&times;</span>
    </button>
    <nav aria-label="Main">
      <ul class="vertical menu">
        <li><a routerLink="/" nfsClose>Home</a></li>
      </ul>
    </nav>
  </div>
  <div class="js-off-canvas-overlay is-overlay-fixed" [nfsOffCanvasOverlay]="nav"></div>
  <div class="off-canvas-content" nfsOffCanvasContent #page="nfsOffCanvasContent">
    <button class="button" type="button" [nfsToggle]="nav">Menu</button>
    <!-- page content -->
  </div>
</div>
```

Server HTML and first paint, closed (identical at every viewport width; hydration annotations shown only for `jsaction`):

```html
<div class="off-canvas-wrapper">
  <div class="off-canvas position-left is-transition-push is-closed" id="site-nav">
    <button class="close-button" type="button" aria-label="Close menu" jsaction="click:;">...</button>
    <nav aria-label="Main">...</nav>
  </div>
  <div class="js-off-canvas-overlay is-overlay-fixed" jsaction="click:;"></div>
  <div class="off-canvas-content">
    <button class="button" type="button" aria-expanded="false" aria-controls="site-nav" jsaction="click:;">Menu</button>
  </div>
</div>
```

No `inert`, no `aria-hidden`, no `role` anywhere; the panel is hidden by `is-closed`. The panel has no `jsaction` (`transitionend` is not a replayable event type).

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

Modal mode (`trapFocus`, overlay present, `aria-labelledby` on the panel), open: the panel adds `role="dialog" aria-modal="true"`, the content, and every other element outside the panel's ancestor chain except the overlay, the focus-trap anchors, live regions, popovers, and CDK's `body` containers, adds `inert` after focus has moved into the panel, the Trigger reads `aria-haspopup="dialog" aria-controls="site-nav"` with no `aria-expanded`, closed or open, and CDK focus-trap anchors (`div.cdk-visually-hidden.cdk-focus-trap-anchor[aria-hidden="true"]`) sit before and after the panel, created on the first modal open in the browser.

Revealed sidebar (`revealOn="large"`), server HTML: `<div class="off-canvas position-left is-transition-push is-closed reveal-for-large" id="site-nav">`, content `class="off-canvas-content"`. At large and up, Foundation's `.position-left.reveal-for-large` shows the panel and its `.position-left.reveal-for-large ~ .off-canvas-content` rule gives the content its margin before hydration; after the Breakpoint service goes live on a large viewport the content also gets `has-reveal-left`, which sets the same margin, so nothing moves. A content element linked from elsewhere (not a following sibling) gets its margin only from `has-reveal-<pos>`, at hydration.

Nested panel inside the content: `class="off-canvas position-right is-transition-overlap is-closed"` whatever `transition` says.

Server HTML, open by the consumer's initial `[(isOpen)]="true"`: the open classes above with no Motion step, no `inert` outside the panel, and no `body` class (both arrive in the first client render callback).

### Animation

- Mechanism: building-blocks 1.6 rule 1 and ADR 0003. The panel, the content, and the overlay are persistent elements, so `animate.enter`/`animate.leave` do not apply; the State classes switch and Foundation's own transitions run: `transition: transform $offcanvas-transition-length $offcanvas-transition-timing` on `.off-canvas` and on `.off-canvas-content.has-transition-*`, and an opacity and visibility transition on `.js-off-canvas-overlay`. No library keyframes and no Motion class inputs.
- Enter: one render removes `is-closed` and adds `is-open` on the panel and the three content classes; the panel's `visibility` becomes visible and its transform transitions from the per-breakpoint `$offcanvas-sizes` offset to zero, and a push panel's content transitions from `none` to the offset in the same style change, exactly as Foundation's synchronous class writes do. No two-frame step is needed, because a `visibility: hidden` element keeps its computed transform.
- Exit: one render removes `is-open`, `is-open-<pos>`, and the overlay classes; the transforms transition back while the panel stays visible and `inert`; on completion one render adds `is-closed` and removes `has-transition-<t>` and `has-position-<pos>` (the content's transform goes from `translate(0, 0)` to `none` without a transition, which changes nothing visible).
- Completion: `transitionend` for `transform` on the panel, else the measured-length fallback timer; then `opened` or `closed`. An opposite request mid-transition reverses the transition from its current point (CSS reversing), restarts the timer, and emits only the final direction's output.
- Reduced motion: the `nfs-off-canvas` mixin sets `transition-duration: 1ms` on `.off-canvas`, `.off-canvas-absolute`, `.off-canvas-content.has-transition-push`, `.off-canvas-content.has-transition-overlap`, and `.js-off-canvas-overlay` under `@media (prefers-reduced-motion: reduce)` (building-blocks 1.6 rule 5), so `transitionend` still fires and the change is instant; Foundation's Sass has no reduced-motion rule.
- Tests: `nfsAnimationsToken` with `{disabled: true}` completes every phase in the same tick (the CSS still moves; stories that assert final state use it).
- Rendering modes: nothing animates before the first client render (`#live`), no class changes at hydration, so hydration plays nothing (the [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md) finding does not arise; there is no `animate.enter` here).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: every visible state is a host binding on signals that exist on the server (rule 1): the panel's `is-closed`, `is-transition-<t>`, and breakpoint classes, the content's and overlay's classes, the panel `id`, the Trigger ARIA, and the dialog role of a panel open at first paint. `revealOn` and `inCanvasOn` render as Foundation classes whose media queries show the panel at the right widths without knowing the viewport (rule 9, building-blocks 1.11 decision 8); nothing server-bound depends on the Server breakpoint except `has-reveal-<pos>` on the content, which the sibling rule already covers.
- Before hydration: the directives read no `window`, `matchMedia`, computed style, or focus, write nothing to `body`, create no focus trap, and start no timer outside render callbacks (rules 3 to 5). The registration effects run on the server and write only signals.
- First-render handoff (ADR 0014): a client whose breakpoint is at or above `revealOn` changes only `has-reveal-<pos>` on the content, with the same margin the sibling rule already applies; the breakpoint reactions record their first values without acting. The [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md) confirmed the handoff never paints the Server breakpoint's frame.
- Full hydration: host binding values equal the server's apart from generated ids and that one class, so hydration changes nothing visible and there is no structure to mismatch (rule 10). The focus-trap anchors are created later, in the browser, on the first modal open.
- Event replay: the replayable listeners are the Triggers' `click` host listeners and the overlay's `click` host listener (`jsaction="click:;"`). A tap on a Trigger before hydration is queued and replayed after hydration; `afterNextRender` runs before replay, so `#live` is `true` and the replayed open animates and moves focus in the following render callback. No library handler calls `preventDefault()` except the Escape listener, which is added in code while open and never replayed. The panel's `transitionend` and the `window` Escape listener do not replay, which is correct: nothing is open before hydration. A server-rendered initially open panel is the exception: a pre-hydration overlay click replays and closes it, a pre-hydration Escape is lost.
- Hydration boundary: the panel, its content, its overlay, and its Triggers belong to one hydration boundary; a consumer `@defer (hydrate on ...)` wraps all of them (rule 7). Template-reference scoping stops an overlay or a Trigger outside a block from naming a panel inside it, and a nested panel finds only an enclosing content.
- `@defer`: library templates contain no `@defer`; the entry point is its own, so a consumer can defer it. Inside a dehydrated block the set is its server HTML: a closed panel is hidden, a revealed or in-canvas panel is shown and usable at its breakpoint, and a tap on a Trigger hydrates the block and replays. Inside `@defer (hydrate never)` a revealed or in-canvas panel keeps working at and above its breakpoint (native links), while below it the panel stays closed and its Triggers do nothing; the spec documents that residue. Plain `@defer` renders on the client with the live breakpoint and no animation for the initial state.
- Incremental hydration triggers: `hydrate on interaction` annotates the block's root nodes with `click`, so a tap anywhere in the block hydrates it and a tap on a Trigger replays; because the block usually spans the whole page content, `hydrate on idle` or `hydrate on timer` are the practical choices for a site-wide drawer.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: every change is a signal write (model, `linkedSignal`, the live flag, `#focusPlaced`); the fallback timer and the transition listener write signals, which schedule change detection in zoneless and zone-based applications alike; the timer runs outside the Angular zone.

### Sass and custom CSS

The panel, content, overlay, reveal, and in-canvas styles are all Foundation's `foundation-off-canvas`, unchanged. The `nfs-off-canvas` Library mixin adds: the reduced-motion override for Foundation's off-canvas transitions; `overflow: clip; display: flow-root` on `.off-canvas-wrapper` in place of Foundation's `overflow: hidden`, so the wrapper clips as before without becoming a scroll container that stops Sticky; a 24 px minimum box for `.close-button` inside a panel (2.5.8); compile-time contrast checks (1.4.3, 1.4.11) that emit no CSS; and, only on request, `reveal-for-<bp>` and `in-canvas-for-<bp>` rules for breakpoints outside `$breakpoint-classes`, built with Foundation's own `off-canvas-reveal` and `in-canvas` mixins. Details and reasons in the Sass subsection of Further Notes. No directive declares `styles` or `styleUrl`.

## Testing Decisions

A good test asserts what a visitor or assistive technology observes: the panel's, content's, and overlay's State classes, `inert`, `role` and `aria-modal`, the Trigger's ARIA, whether the panel is displayed, where focus lands, whether the page scrolls, and when `opened` and `closed` fire. No test reads private fields. There is no prior art in the new repository; the patterns are the building-blocks testing rule, the Triggers, Breakpoint service, and Responsive Toggle specs, and the harness of the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).

Story ids follow `off-canvas--<story>`: `off-canvas--default` (Foundation's docs markup: push, left, overlay, close button, `nav` menu), `off-canvas--positions` (four panels, one per side, with Triggers), `off-canvas--overlap`, `off-canvas--modal` (`trapFocus`, overlay, `aria-labelledby`), `off-canvas--modal-nested` (a modal panel nested inside the content, with a `header` outside `.off-canvas-wrapper`), `off-canvas--no-overlay` (`closeOnClick` on the content), `off-canvas--nested`, `off-canvas--absolute` (two `.off-canvas-absolute` panels in wrapped grid cells), `off-canvas--reveal-for-large`, `off-canvas--reveal-top` (`revealOn` on a `position-top` panel with `scroll-padding-top`), `off-canvas--in-canvas`, `off-canvas--content-scroll-locked`, `off-canvas--two-way-binding`, `off-canvas--with-sticky` (an `nfsSticky` bar inside the content). Every story's Storybook settings include `$offcanvas-background: $white`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`, which include `target-size`, `color-contrast`, `aria-dialog-name`, and `button-name`), on the closed and the open state.

- `off-canvas--default`: the panel carries `is-closed is-transition-push`, the Trigger `aria-expanded="false"` and `aria-controls` equal to the panel id; a click sets `aria-expanded="true"`, the panel `is-open`, the content `is-open-left has-transition-push has-position-left`, the overlay `is-visible is-closable`; focus is on the first link after the panel opens (the close button is first in the DOM only when it is tabbable; the docs order puts it first); `opened` fires once; the close button closes it, focus returns to the Trigger, and `closed` fires after the panel carries `is-closed` again.
- `off-canvas--positions`: each Trigger opens its own panel and each panel's content classes name its side.
- `off-canvas--overlap`: the panel carries `is-transition-overlap`; the content gets `has-transition-overlap` and never moves.
- `off-canvas--modal`: the Trigger has `aria-haspopup="dialog"` and `aria-controls` and no `aria-expanded`, closed and open; open: the panel has `role="dialog"`, `aria-modal="true"`, and an accessible name; the content is `inert`; Tab from the last element returns to the first and Shift+Tab from the first reaches the last; Escape closes, focus returns to the Trigger, the content is no longer `inert`.
- `off-canvas--modal-nested`: after the open, focus is inside the dialog, the content has no `inert`, its other children, the Trigger, and the `header` outside the wrapper carry `inert`; after Escape none of them does and focus is on the Trigger.
- `off-canvas--no-overlay`: a click on the content closes the panel; a click inside the panel and on the Trigger does not close and reopen it.
- `off-canvas--nested`: the nested panel carries `is-transition-overlap` although its markup says nothing, and opens and closes.
- `off-canvas--absolute`: each panel stays inside its cell and its overlay covers only that wrapper.
- `off-canvas--two-way-binding`: an external checkbox bound to `[(isOpen)]` opens and closes the panel with the same classes, and a Trigger click updates the checkbox.
- `off-canvas--content-scroll-locked`: `body` has `is-off-canvas-open` while open and loses it after `closed`.
- `off-canvas--with-sticky`: the Sticky bar pins inside the wrapper while the page scrolls (the wrapper's computed `overflow` is `clip`).

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here. `MediaMatcher` is replaced with a controllable fake (the Breakpoint service spec's seam) so tests move across `revealOn` and `inCanvasOn` and toggle reduced motion.

- Phase model: the initial state never animates; `[(isOpen)]` writes, Trigger clicks, and method calls give the same class sequence on the panel, content, and overlay; an opposite request mid-transition emits only the final direction's Completion output.
- Completion: `transitionend` for `transform` on the panel completes; one bubbling from a descendant, or for another property, does not; with `transition: none` forced, the phase completes at once; with `transitionend` suppressed (a listener stopping it in capture), the fallback timer completes at the measured length plus 100 ms (fake timers).
- Links: the `content` reference wins over an enclosing content; a nested panel resolves the enclosing content and reports overlap; two panels on one content combine their classes; destroying a panel or the overlay unregisters; the classes are present in the first rendered pass with the content before, after, and around the panel.
- Modal mode: on only with `trapFocus` and a registered overlay; the Modal inert set is applied only after focus is inside the panel (a focused Trigger is never made inert while it holds focus) and removed at close request; an element outside the wrapper is `inert` while a modal panel is open and not after it closes; an element that was `inert` before the open is still `inert` after the close; the overlay, a focus-trap anchor, an `aria-live` element, a `popover` element, `.cdk-overlay-container`, and `.cdk-describedby-message-container` placed as `body` children are never made `inert`; the overlay stays clickable; a nested modal panel keeps its enclosing content free of `inert`; destroying an open modal panel (an enclosing `@if` turned false) removes `inert` from every element the set changed; `trapFocus` without an overlay traps but binds no `role`.
- Focus rules: every `autoFocus` form (`data-autofocus` first, first tabbable, first heading with a temporary `tabindex="-1"`, selector, `false`); focus returns to the `trigger` passed to `open()`, else the previously focused element, else the first registered Trigger, for Escape, overlay click, content click, a bare `nfsClose`, and the model; focus on a content link that closed a non-modal panel stays there; an initially open modal panel takes focus in the first render, a non-modal one does not.
- Escape: closes from inside the panel and from the content; ignored with a modifier, while composing, when `defaultPrevented`, with `closeOnEsc: false`, and inside a modal `<dialog>` that does not contain the panel; a Dropdown pane open inside the panel closes first.
- Breakpoints: `open()` is a no-op while revealed or in-canvas; crossing into the range closes an open panel without moving focus and with no overlay, `inert`, or lock left behind; crossing out while focus is in the panel, with a test style hiding the panel at the same step as Foundation's CSS would, moves focus to the first registered Trigger, and nothing moves while the panel stays visible or after focus has left the panel for another element; `has-reveal-<pos>` follows `atLeast(revealOn)`.
- Scroll lock and `forceTo`: the `body` class is added in the open render callback and removed after `closed`, kept while a second locked panel is open, and removed on destroy; `forceTo: 'top'` calls `window.scrollTo(0, 0)` before focus moves.
- Replay-safe handlers: dispatch a `click` on the overlay whose `eventPhase` reads 101 and whose `preventDefault` throws; the panel closes and nothing reaches `ErrorHandler`.
- Defaults token: each Option seeds from it; an element-level provider wins over a root one.
- Development checks: each of the nine warnings fires once for its case and not for Foundation's docs markup.

### 3. Node-level Vitest

- SSR smoke (runs under `npx nx test <lib>` in `off-canvas.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter): a fixture with a closed push panel, an open modal panel through the initial binding, a nested panel, a `revealOn="large"` panel, an `inCanvasOn="large"` panel, and a panel without an `id`. Assert that `whenStable()` resolves; closed panels carry `is-closed` and `is-transition-<t>` and no `inert`, `aria-hidden`, or `role`; the nested panel carries `is-transition-overlap`; the revealed and in-canvas panels carry their Foundation class and `is-closed`; the open modal panel carries `is-open`, `role="dialog"`, and `aria-modal="true"`, its content the three open classes and no `inert`, its overlay `is-visible is-closable`; every modal panel's Trigger, closed or open, carries `aria-haspopup="dialog"` and `aria-controls` and no `aria-expanded`; the generated id equals the Trigger's `aria-controls`; Triggers and overlays carry `jsaction="click:;"` and panels none; no `MediaMatcher` query was made and `body` has no class.
- Pure logic: the `autoFocus` target resolution order and the content-class derivation (panel state, transition, position, reveal to the class map) are pure functions with table-driven tests.
- Sass compile (the Sass packaging decision's node-level check): Foundation's default settings plus `@include nfs-off-canvas;` stop with the `@error` naming `$closebutton-color` and `$offcanvas-background`; with `$offcanvas-background: $white` the include emits exactly the rules listed in the Sass subsection and no copy of a Foundation rule; `$anchor-color` under 4.5:1 against the background produces the `@warn`; a Zero-breakpoint `$offcanvas-sizes` entry over 320 px produces the reflow `@warn`; `@include nfs-off-canvas($reveal-for: xlarge);` emits `.position-left.reveal-for-xlarge` and its siblings identical to Foundation's `off-canvas-reveal(left, $offcanvas-reveal-zindex, $maincontent-class, xlarge)` output inside `breakpoint(xlarge)`; a breakpoint already in `$breakpoint-classes` emits nothing; the Zero breakpoint and an unknown name fail with `@error`.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Real keys on `off-canvas--modal`: Enter on the Trigger opens and focus is inside; Tab and Shift+Tab never leave the panel; Escape closes and focus is on the Trigger (WebKit included, where a clicked button is not focused).
- Real mouse on `off-canvas--default`: click the Trigger, click the overlay; focus is on the Trigger afterwards.
- Viewport thresholds on `off-canvas--reveal-for-large`: at 1023 px the panel is hidden and the Trigger shown; at 1024 px the panel is displayed as a sidebar, the content has its margin, and no overlay shows; open at 800 px, resize to 1300 px: no overlay, no `inert`, no `body` class, `aria-expanded="false"`; resize back to 800 px: the panel is closed. With real CSS, keyboard focus on a link in the revealed sidebar at 1300 px, then a resize to 800 px: focus lands on the Trigger, never on `<body>`, in all three engines.
- `off-canvas--in-canvas` at 1300 px: the panel is in the page flow with no transform; at 800 px it is off-canvas and its Trigger opens it.
- Scroll lock on `off-canvas--content-scroll-locked`: with the page scrolled to 500 px, wheel and keyboard scrolling over the overlay and the panel leave `scrollY` at 500; after close it is still 500.
- `reducedMotion: 'reduce'` on `off-canvas--default`: `opened` fires within 150 ms of the click.
- WCAG 2.2 AA checks that need real layout: target size (2.5.8) from the close button's bounding box (at least 24 by 24); focus visible (2.4.7) by a screenshot comparison before and after Tab into the open panel; reflow (1.4.10) at 320 by 640 px with a push panel open, `scrollWidth <= 320`; focus not obscured (2.4.11) on `off-canvas--overlap` by Escape with focus behind the panel and on `off-canvas--reveal-top` by tabbing through the content with each focused element clear of the panel; `@axe-core/playwright` with the six tags on the open state after real interaction.
- Sticky inside the wrapper on `off-canvas--with-sticky`: after a real wheel scroll the bar's top equals the viewport top and it carries `is-stuck`.

Against the prerendered fixture app:

- JavaScript disabled at 375 px and at 1300 px: screenshot plus `@axe-core/playwright` with the six tags; at 375 px the panel is not displayed; at 1300 px the revealed panel is displayed with its links working and the content has its margin.
- Hydration at 375 px and at 1300 px: no NG05xx, `ngDevMode.componentsSkippedHydration === 0`, and the panel's and overlay's class attributes identical before and after hydration (the content may gain only `has-reveal-left` at 1300 px, with no layout change).
- Pre-hydration tap at 375 px with the main bundle held back: the panel opens exactly once after hydration, focus is inside it, and no error is logged.
- `@defer (hydrate on idle)` around the set: after idle the Trigger works; `@defer (hydrate never)`: at 1300 px the revealed panel's links navigate, at 375 px the Trigger does nothing and no error is logged.

What these layers cannot prove: real iOS Safari touch scrolling behind a locked panel (Foundation's `overflow: hidden` on `body` is relied on unchanged; the headless WebKit here is not iOS), headed-browser focus leaving for the browser interface, and screen reader output, which the release test below covers.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA on Firefox, Narrator on Edge, TalkBack on Chrome, and VoiceOver on Safari (macOS and iOS), open `off-canvas--modal` and `off-canvas--modal-nested` from their Triggers and confirm each Trigger is announced as a button that opens a dialog with no expanded state, that the dialog's name is spoken with focus on its first control, and that browse, swipe, or virtual cursor navigation cannot leave the panel, the header outside the wrapper included; open `off-canvas--default` and confirm its Trigger is announced as expanded and collapsed; at the large breakpoint confirm `off-canvas--reveal-for-large` is read as the 'Main' navigation with no dialog.

## Out of Scope

- The Trigger's ARIA and click handling: the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md). Breakpoint state: the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). The Light dismiss registry that a Dropdown pane inside the panel uses: the [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md).
- The menus inside the panel (AccordionMenu, Drilldown, DropdownMenu, ResponsiveMenu) and the title bar around the Triggers: their own specs and Foundation's markup.
- A `<dialog>` or `popover` panel (ADR 0030), a generated overlay, and container components computing margins (Material's shape).
- Fixed elements inside a pushed content: Foundation's `data-off-canvas-sticky` inline rewrite is dropped; a `position: fixed` element inside `.off-canvas-content` behaves as absolutely positioned while a push panel is open (the content's transform), so such elements go outside the content or the panel uses `overlap`. The next library's Sticky is `position: sticky`, which a transform does not break.
- Logical positions (`start`/`end`) and automatic RTL mirroring: Foundation's off-canvas classes are physical.
- Runtime theming; the `$offcanvas-*` settings stay compile-time Foundation settings.

## Further Notes

### Design decisions

| # | Decision | Choice | Why |
| --- | --- | --- | --- |
| D1 | Directives | `nfsOffCanvas` on the panel, `nfsOffCanvasContent` on the content, `nfsOffCanvasOverlay` on a consumer-written overlay | Foundation's markup has every element except the overlay, which becomes one plain element (ADR 0001, building-blocks 1.1) |
| D2 | `<dialog>` | Not used in any mode | A closed `<dialog>` cannot be a revealed or in-canvas panel in server HTML; the transform transition cannot start from `display: none` in target; the default panel is not modal (ADR 0030) |
| D3 | Modal mode | `trapFocus` with an overlay: `role="dialog"`, `aria-modal`, the Modal inert set, CDK `FocusTrap`, Trigger role `modal-dialog` | The APG's two-mode reading: modal only when interaction outside is blocked and the page is obscured; the Modal inert set because `inert` on the linked content alone made a nested modal panel inert with its content and left content outside the content reachable while `aria-modal` claimed otherwise, which Narrator, TalkBack, and Orca then read ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)); Trigger role `modal-dialog` because every Trigger outside the panel is then inert while it is open ([Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md)) |
| D4 | Content link | `content` reference, else the enclosing content through DI | ADR 0013 (references, never ids); DI covers Foundation's nested and closest-ancestor cases; a sibling has no DI path |
| D5 | Overlay | Consumer element, required reference to the panel; omission is `contentOverlay: false` | No generated structure (ADR 0008); Foundation's classes and fade reused |
| D6 | Position | Static `.position-*` class | Foundation reads the class; classes are the contract |
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
| D17 | Completion | `transitionend` for `transform`, else a measured fallback | The length is the consumer's Sass setting; a missing transition completes at once |
| D18 | Scroll lock | Foundation's `is-off-canvas-open` on `body` from a render callback; touch handlers dropped | Foundation's CSS locks the viewport; the Reveal dialog prototype measured that pages scroll behind overlays unless locked |
| D19 | Wrapper overflow | `overflow: clip; display: flow-root` in `nfs-off-canvas` | Same clipping and formatting context as Foundation's `overflow: hidden` without a scroll container, so Sticky works inside (Sticky spec) |
| D20 | Close button | 24 px minimum box in `nfs-off-canvas` | 2.5.8; the spacing exception fails beside the first menu link |
| D21 | Panel colours | `@error` for the close button, `@warn` for links, Storybook sets `$offcanvas-background: $white` | Foundation's defaults fail 1.4.11 and 1.4.3 (ADR 0022) |
| D22 | Positions | Physical, no `Directionality` | Foundation's Sass has no RTL handling for off-canvas |
| D23 | Methods | `void` returns | Building-blocks 1.3; completion is the outputs |
| D24 | Dropped options | `contentOverlay`, `nested`, `transitionTime`, `isRevealed`, `revealClass` | Markup, derivation, a Sass setting, or a class contract replaces each |

### Usage examples

Foundation's docs example (push from the left, with a close button):

```html
<div class="off-canvas-wrapper">
  <div class="off-canvas position-left" id="offcanvas-nav" nfsOffCanvas #nav="nfsOffCanvas" [content]="page">
    <button class="close-button" type="button" aria-label="Close menu" nfsClose>
      <span aria-hidden="true">&times;</span>
    </button>
    <nav aria-label="Main">
      <ul class="vertical menu">
        <li><a routerLink="/" nfsClose>Home</a></li>
        <li><a routerLink="/pricing" nfsClose>Pricing</a></li>
      </ul>
    </nav>
  </div>
  <div class="js-off-canvas-overlay is-overlay-fixed" [nfsOffCanvasOverlay]="nav"></div>
  <div class="off-canvas-content" nfsOffCanvasContent #page="nfsOffCanvasContent">
    <div class="title-bar">
      <div class="title-bar-left">
        <button class="menu-icon" type="button" aria-label="Open menu" [nfsOpen]="nav"></button>
        <span class="title-bar-title">Foundation</span>
      </div>
    </div>
    <router-outlet />
  </div>
</div>
```

A modal filter panel from the right, overlapping:

```html
<aside class="off-canvas position-right" id="filters" nfsOffCanvas #filters="nfsOffCanvas" [content]="page"
       transition="overlap" trapFocus aria-labelledby="filters-title" autoFocus="first-heading">
  <button class="close-button" type="button" aria-label="Close filters" nfsClose>
    <span aria-hidden="true">&times;</span>
  </button>
  <h2 id="filters-title">Filters</h2>
  ...
</aside>
<div class="js-off-canvas-overlay is-overlay-fixed" [nfsOffCanvasOverlay]="filters"></div>
```

A sidebar that is a drawer below large (hide the Trigger at large with Foundation's class):

```html
<div class="off-canvas position-left" id="sidebar" nfsOffCanvas #sidebar="nfsOffCanvas" [content]="page" revealOn="large">
  <nav aria-label="Sections">...</nav>
</div>
<div class="off-canvas-content" nfsOffCanvasContent #page="nfsOffCanvasContent">
  <button class="button hide-for-large" type="button" [nfsToggle]="sidebar">Sections</button>
  ...
</div>
```

In-canvas at large, nested, no content reference needed:

```html
<div class="off-canvas-content" nfsOffCanvasContent>
  <button class="button hide-for-large" type="button" [nfsToggle]="related">Related</button>
  <div class="off-canvas position-right" id="related" nfsOffCanvas #related="nfsOffCanvas" inCanvasOn="large">
    <div class="callout">Related articles</div>
  </div>
</div>
```

Two-way binding, completion outputs, and a locked page:

```html
<div class="off-canvas position-left" nfsOffCanvas [content]="page" [(isOpen)]="menuOpen"
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
  <div class="off-canvas-wrapper">
    <div class="off-canvas position-left" nfsOffCanvas #nav="nfsOffCanvas" [content]="page">...</div>
    <div class="js-off-canvas-overlay is-overlay-fixed" [nfsOffCanvasOverlay]="nav"></div>
    <div class="off-canvas-content" nfsOffCanvasContent #page="nfsOffCanvasContent">...</div>
  </div>
}
```

Migration from Foundation's markup: `data-off-canvas` becomes `nfsOffCanvas` with `#x="nfsOffCanvas"`; `data-off-canvas-content` becomes `nfsOffCanvasContent`, referenced from each sibling panel with `[content]`; add the overlay element (Foundation generated it); `data-toggle`/`data-open`/`data-close` become `nfsToggle`/`nfsOpen`/`nfsClose`; `.reveal-for-<bp>` becomes `revealOn`, `data-options="inCanvasOn:..."` or `.in-canvas-for-<bp>` becomes `inCanvasOn`; `data-transition-time` moves to `$offcanvas-transition-length`; `data-off-canvas-scrollbox*` and `data-off-canvas-sticky` are deleted; add `$offcanvas-background: $white` (or another passing pair) to the settings.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-off-canvas` (panel, positions, content, overlay, wrapper, reveal and in-canvas classes, `is-off-canvas-open`) and on `foundation-close-button` for the close button, plus `foundation-visibility-classes` for the recommended `.hide-for-<bp>` on Triggers of revealed panels. A `.title-bar .menu-icon` Trigger needs `@include nfs-responsive-toggle;` for its 24 by 24 px hit area (WCAG 2.5.8), with or without ResponsiveToggle; without an argument that include emits only the hit-area rule plus compile-time warnings, and the rule stays in the Responsive Toggle mixin rather than a shared one. Its documented custom CSS is the `nfs-off-canvas` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-off-canvas` and `foundation-close-button`:

1. Rules.
   (a) `@media (prefers-reduced-motion: reduce) { .off-canvas, .off-canvas-absolute, .off-canvas-content.has-transition-push, .off-canvas-content.has-transition-overlap, .js-off-canvas-overlay { transition-duration: 1ms; } }`. Reason: Foundation's off-canvas transitions have no reduced-motion rule, and the directive awaits `transitionend` (building-blocks 1.6 rule 5: 1 ms keeps the event and makes the change instant).
   (b) `.off-canvas-wrapper { overflow: clip; display: flow-root; }`, adjusting Foundation's `off-canvas-wrapper` (only `overflow` differs; `display` is added). Reason: Foundation's `overflow: hidden` makes the wrapper a scroll container, so a `position: sticky` element inside the content sticks to the wrapper instead of the window (the Sticky spec's documented clash) and a focused element pushed out of view can scroll the wrapper sideways; `overflow: clip` clips the same boxes without a scroll container, and `display: flow-root` restores the independent formatting context that `overflow: hidden` created and `clip` does not (float containment, no margin collapsing through the wrapper). Both are Baseline widely available on the target date. `overflow: clip` inside the wrapper was confirmed by the [Prototype: Sticky measurement refinements](../issues/63-prototype-sticky-measurement.md), case 3, in three engines.
   (c) `.off-canvas .close-button, .off-canvas-absolute .close-button { min-width: 24px; min-height: 24px; }`. Reason: WCAG 2.2 success criterion 2.5.8; Foundation sizes the close button by glyph (`$closebutton-size`), giving about 18.7 by 32 px, and places it over the first menu link, so the spacing exception fails. 24 px is WCAG's number, not a Foundation value. Foundation hides the button in revealed and in-canvas panels, which the rule does not change.
   (d) Compile-time checks that emit no CSS, each contrast ratio computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded (Foundation's `color-contrast()` is not used, because it rounds to one decimal and would pass 2.95:1): `@error` when the ratio of `$closebutton-color` against `$offcanvas-background` is under 3 (1.4.11 and large-text 1.4.3; Foundation's defaults give 2.77), naming `$closebutton-color` and `$offcanvas-background`; `@warn` when the ratio of `$anchor-color` against `$offcanvas-background` is under 4.5 (1.4.3; defaults give 3.76), naming both; `@warn` when the Zero-breakpoint entry of `$offcanvas-sizes` exceeds 320 px (1.4.10).
   (e) Only on request: `@include nfs-off-canvas($reveal-for: (), $in-canvas-for: ())`. For each breakpoint name not already in `$breakpoint-classes`, it emits, inside `@include breakpoint(<bp>)`, `.position-<side>.reveal-for-<bp> { @include off-canvas-reveal(<side>, $offcanvas-reveal-zindex, $maincontent-class, <bp>); }` for the four sides, and `.off-canvas.in-canvas-for-<bp> { @include in-canvas; }`: the same rules Foundation's own loops emit for the breakpoints they cover. Reason: Foundation generates these classes only for `$breakpoint-classes`, and adding a breakpoint there also generates its grid and visibility classes for every component. The Zero breakpoint and a name missing from `$breakpoints` stop the compile with `@error`. Example: `@include nfs-off-canvas($reveal-for: xlarge);`.
2. Reuses the consumer's `$offcanvas-background`, `$closebutton-color`, `$anchor-color`, `$offcanvas-sizes`, `$offcanvas-reveal-zindex`, `$maincontent-class`, `$breakpoints`, and `$breakpoint-classes`, and Foundation's `color-luminance()`, `breakpoint()`, `off-canvas-reveal()`, and `in-canvas()`; no Foundation value is copied. The `$reveal-for` and `$in-canvas-for` parameters exist because Foundation has no setting for "reveal classes for these breakpoints only". Required setting on Foundation's defaults: a passing panel pair, for example `$offcanvas-background: $white` (close button 3.42:1, links 4.65:1); the Storybook settings file sets it with the rule ids in a comment.
3. No `--nfs-off-canvas-*` property; the directives write no custom property.
4. Motion classes: none; the plugin animates only through Foundation's transitions, and (a) is its `prefers-reduced-motion` override.
5. Missing include: the compile no longer checks the panel colours; transitions run at full length under reduced motion; Sticky elements inside the wrapper stop sticking; the close button falls back to Foundation's glyph box and fails axe's `target-size` beside the menu; a revealed or in-canvas breakpoint outside `$breakpoint-classes` never shows the panel (development check 7 names the fix). Missing `foundation-off-canvas` shows every closed panel in the page flow and the directives only switch classes.

### Platform features to adopt when the browser target moves

- `CloseWatcher` (no WebKit release yet): a watcher created on open would add the Android back gesture and VoiceOver's scrub to Escape; the `window` listener stays as the fallback until every target browser has it.
- `@starting-style` and `transition-behavior: allow-discrete` (widely available in 2027): would let a modal panel enter the top layer with Foundation's transition; the revealed and in-canvas forms still rule out `<dialog>` (ADR 0030), so no change is planned.
- `scrollbar-gutter: stable` (Baseline 2024, widely available in 2027): a library rule on `.is-off-canvas-open` would stop the page shifting when the lock removes the scrollbar.
- Invoker Commands: when they reach the target, the Triggers utility may add `commandfor` with a custom command so a pre-hydration tap needs no replay (needs the static panel id this spec already recommends).
- `popover`: not adopted even then; push and revealed panels must stay in the page flow.

### Foundation behaviour changed or dropped

- `aria-hidden` on the panel becomes nothing: `.is-closed` hides it, `inert` covers the exit, and a revealed panel needs no attribute.
- The generated overlay becomes a consumer element; `contentOverlay` becomes its presence.
- Document-wide trigger discovery, `contentId` lookup, sibling and closest-ancestor walking, and `nested` auto-detection become typed references and DI.
- Reading `revealOn` and `inCanvasOn` from class names with regular expressions (and `revealClass`, `isRevealed`) becomes two inputs that bind the classes.
- The touch scroll handlers and `data-off-canvas-scrollbox`/`-outer` are dropped: they worked around mobile Safari versions before the Browser target, and Foundation's `overflow: hidden` on `body` does the locking.
- `data-off-canvas-sticky`'s inline `top` rewriting is dropped (Out of Scope), and with it the forced `contentScroll: false`.
- `tabindex="-1"` on the content under `trapFocus` is dropped; modal mode applies the Modal inert set.
- The inline `transition-duration` from `transitionTime` is dropped; `$offcanvas-transition-length` sets it.
- Escape only with focus inside the panel becomes Escape from anywhere while open; focus return only on Escape becomes focus return on every close.
- `opened.zf.offCanvas` at transition start becomes `isOpenChange` (request) and `opened` (end), removing the misleading name.
- New: dialog semantics in modal mode, the Modal inert set, a Tab wrap from CDK, `aria-expanded` on every Trigger of a non-modal panel whenever it is added (modal-mode Triggers render `aria-haspopup="dialog"` and `aria-controls` instead), `closeOnEsc`, reduced-motion support, closing on a crossing into the revealed range without leaving an overlay behind, and WCAG 2.2 AA checks in the Sass.
