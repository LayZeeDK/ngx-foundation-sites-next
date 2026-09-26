# Spec: Magellan

Ticket: [Spec: Magellan](../issues/30-spec-magellan.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

A developer building a long page on Foundation for Sites (a guide with a sticky table of contents, a landing page whose top bar lists its sections) wants the navigation to show which section the reader is in, to glide to a section when a link is activated, and, optionally, to keep the address bar pointing at the section being read. Foundation's Magellan Plugin does this with jQuery, and in doing so it:

- recomputes an array of pixel "points" from `offset().top` on every debounced window `scroll` event, which only ever looks at the window (an Angular app shell that scrolls an inner element gets no tracking at all), and misses layout changes until the next resize;
- marks the current link only with the `.is-active` class, on the `<a>`, so assistive technology is told nothing, and inside Foundation's own Menu (which styles `.menu .is-active > a`, the class on the list item) the marker is not even visible without custom CSS;
- delegates its link clicks to SmoothScroll's jQuery animation, so it inherits every SmoothScroll problem: focus stays on the link, `prefers-reduced-motion` is ignored, and the stopping point is a JavaScript `offset` that native jumps before the script runs never see;
- requires every section to carry both an `id` and a `data-magellan-target` attribute with the same value, and queries targets across the whole document;
- writes the URL with `history.replaceState({}, ...)` or `pushState({}, ...)`, which, in an Angular application, erases the Router's navigation id and page id from `history.state`.

An Angular application adds the problems the Smooth Scroll spec already describes (`<base href>` resolving `href="#id"` to another document, the Router answering native fragment jumps with its scroll restoration, and the rendering modes: server HTML must be right, hydration must not break, and clicks before hydration and inside deferred blocks must behave predictably). The server also cannot know the scroll position, so no section can be current in server HTML.

## Solution

One attribute directive, `nfsMagellan`, placed where Foundation places `data-magellan`: on the container of the navigation links (Foundation's Menu `ul.menu`, inside a `nav` landmark, or the `nav` itself).

- It composes `NfsSmoothScroll` through `hostDirectives`, so every in-page link in it scrolls smoothly (instantly under reduced motion), moves focus to its section, keeps the URL unchanged, and stops at the CSS offset, exactly as the Smooth Scroll spec defines.
- Its sections need no directive: each link's fragment names a section by `id`, and the directive finds the sections from its own links. Foundation's `data-magellan-target` attribute is not needed (a leftover one is harmless).
- It tracks the Current section with an `IntersectionObserver` on the page's real scroll container (the window, or the app shell's scrolling element), using an Activation line that sits `threshold` pixels below where a section lands when scrolled to. The landing position comes from the same CSS that places the scroll: `scroll-padding-top` on the scroll container and `scroll-margin-top` on a section. The line and the landing therefore never disagree.
- It marks the Current section's links with Foundation's `.is-active` (on the link, as Magellan did, and on the link's list item, so Foundation's Menu paints its own active style) and with `aria-current` (token `true` by default, configurable).
- Its `active` model holds the id of the Current section; `activeChange` replaces `update.zf.magellan`, and writing `active` scrolls to that section, so `[(active)]` works with, for example, a "Jump to section" `<select>` on small screens.
- With `deepLinking`, the address bar follows the Current section through `history.replaceState` (or `pushState` with `updateHistory`), passing the Router's `history.state` through untouched; a fragment present at load is scrolled to after the first render.

The library adds no CSS: Foundation's Menu already styles the marker, and the offset is the consumer's scroll padding, which the Smooth Scroll spec already requires for WCAG 2.2 2.4.11 when a sticky bar is present.

## User Stories

1. As an application developer, I want to put `nfsMagellan` on a Foundation Menu of `#section` links, so that the menu tracks the section the reader is in, as `data-magellan` did.
2. As an application developer, I want sections to need only an `id`, so that I do not write the same value twice in `id` and `data-magellan-target`.
3. As an application developer migrating Foundation markup, I want leftover `data-magellan-target` attributes to do no harm, so that I can migrate a page without editing every section.
4. As a reader, I want the link of the section I am reading highlighted with Foundation's Menu active style, so that I see where I am without custom CSS.
5. As an application developer with a custom navigation (bare links, no list), I want the link itself to carry `.is-active`, so that my own CSS for Magellan's class keeps working.
6. As a screen reader user, I want the current section's link to carry `aria-current`, so that I hear which section is current when I move through the navigation.
7. As an application developer building a multi-step page, I want to choose the `aria-current` token (`true`, `location`, or `step`), so that assistive technology describes the current item accurately.
8. As a reader, I want exactly one section to be current at a time, the last one whose top has passed the Activation line, so that the marker does not flicker between two visible sections.
9. As a reader, I want no section marked while I am above the first one, so that the marker does not claim I am in a section I have not reached.
10. As a reader who scrolls to the very end of the page, I want the last section marked even when it is too short to reach the Activation line, so that the last link is not unreachable.
11. As a reader, I want the section to become current slightly before its heading reaches the top (Foundation's 50 px `threshold`), so that the marker changes as I start reading the new section.
12. As an application developer, I want to set `threshold`, so that I control how early a section becomes current.
13. As an application developer with a sticky top bar, I want the Activation line to move down by my `scroll-padding-top`, so that a section becomes current when it appears below the bar, with no `offset` value repeated in the template.
14. As an application developer, I want a per-section `scroll-margin-top` to move that section's Activation line with it, so that a section that lands lower still becomes current when it lands.
15. As an application developer whose app shell scrolls an inner element, I want Magellan to track that element, so that tracking works outside window scrolling.
16. As an application developer, I want sections whose height changes after load (images, fonts, expanding content) to be tracked correctly without calling a reflow method, so that I do not manage Magellan's measurements.
17. As an application developer, I want links and sections added later (by `@for`, `@if`, or a `@defer` block that renders) to be tracked, so that generated tables of contents need nothing extra.
18. As an application developer, I want the links listed in any order, and several links to the same section, so that a table of contents and an in-text "see also" list can share one Magellan (Foundation's unordered-links case).
19. As a keyboard user, I want Enter on a link to scroll to the section and move focus into it, so that the next Tab continues inside that section.
20. As a user who prefers reduced motion, I want link jumps to be instant, so that the page does not animate against my system setting.
21. As a reader, I want the clicked link to become current at once and stay current while the page glides past the sections in between, so that the marker does not run through every intermediate link.
22. As a reader who interrupts a glide by scrolling myself, I want the marker to follow where I actually stop, so that it never stays on a section I did not reach.
23. As an application developer, I want `activeChange` with the section id (or `null`), so that I can update my own UI, such as a reading-progress label.
24. As an application developer, I want to bind `[(active)]` to a signal and set it from a `<select>`, so that a compact "Jump to section" control scrolls the page.
25. As an application developer, I want `scrollTo('install')` with focus control from code, so that my own "next section" button moves the reader and focus consistently.
26. As an application developer, I want `scrollTo` to return `false` for an unknown section, so that I can react without try and catch.
27. As an application developer, I want `deepLinking` to keep the address bar on the current section with `replaceState`, so that a shared or reloaded URL returns to the section being read without extra history entries.
28. As an application developer, I want `updateHistory` to add a history entry per section instead, so that I can reproduce Foundation's opt-in Back-button behaviour where it suits the page.
29. As an application developer on the Router, I want Magellan's history writes to keep the Router's `history.state`, so that the Router's navigation bookkeeping survives.
30. As an application developer, I want a URL with a fragment to scroll to that section after the page renders when `deepLinking` is on, so that deep links work in a client-rendered app.
31. As an application developer, I want the URL fragment removed when the reader scrolls back above the first section with `deepLinking` on, so that the address bar never names a section the reader left.
32. As an application developer, I want Magellan never to touch the URL when `deepLinking` is off, so that the default matches Foundation and keeps the Router's state untouched.
33. As an application developer, I want application-wide defaults for `threshold`, `deepLinking`, `updateHistory`, and the `aria-current` token, so that I configure every Magellan once, as `Foundation.Magellan.defaults` allowed.
34. As an application developer, I want to pair Magellan with Sticky by placing `nfsMagellan` inside an `nfsSticky` bar or sidebar, so that the documented Foundation pattern works with no link between the two directives beyond my scroll padding.
35. As an application developer on the Router, I want `routerLink` links with a `fragment` in the same menu to be tracked and marked, while the Router keeps their clicks, so that both link kinds can share one navigation.
36. As a developer of a server-rendered application, I want the server HTML to be my markup unchanged apart from Angular's event annotation, so that first paint is plain Foundation markup and hydration changes nothing.
37. As a developer of a server-rendered application, I want the marker to appear after hydration without a mismatch, so that no hydration error is caused by tracking.
38. As a developer of a server-rendered application, I want a link clicked before hydration to jump natively and the marker to settle on that section after hydration, so that early users are not left with a wrong marker.
39. As a developer using incremental hydration, I want sections inside dehydrated or `hydrate never` blocks to be tracked, so that deferring my long content does not break the navigation.
40. As a developer using `@defer (hydrate never)` around the navigation itself, I want its links to keep working natively, so that a static navigation still jumps.
41. As a developer of a zoneless application, I want Magellan to need no zone, and in a zone-based application I want scrolling not to trigger change detection, so that tracking costs nothing when nothing changes.
42. As a developer, I want a development-mode warning when the navigation is not inside a `nav` landmark, when sections sit in different scroll containers, when the container has no in-page links, when I write an unknown id to `active`, and when `updateHistory` is set without `deepLinking`, so that I catch markup mistakes.
43. As a library maintainer, I want the behaviour asserted through the marker, `aria-current`, focus, scroll position, the URL, and history length in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

From Foundation 6.9's `Magellan.defaults`, its source, its docs page, and its visual tests (the Foundation inventory research, Magellan section):

| Feature | Foundation | Library |
| --- | --- | --- |
| Activation | `data-magellan` on the link container; links are every `a` inside it, clicks delegated to `a[href^="#"]` | `nfsMagellan` on the link container; links are the in-page `a[href]` descendants (Smooth Scroll's in-page rule, so Router-safe `/path#id` hrefs count, and `#`-only hrefs that `<base href>` resolves elsewhere count after hydration, following that spec's applied default, which its ticket keeps open for a human) |
| Targets | Every `[data-magellan-target]` in the document; value must equal the link fragment and the `id` | The elements the links' fragments name, found by `id` (HTML's indicated part); no attribute, no directive |
| Tracking | Window `scroll`, debounced 10 ms through Triggers; `points[]` from `offset().top - threshold`, recomputed on `resizeme` | `IntersectionObserver` with a 1 px band at the Activation line, root = the sections' scroll container; recomputation from live rectangles |
| Current section | Before the first point: none; exactly at the bottom: last; else the last point `<= scrollY` (with `offset`, and `threshold` again when scrolling up) | Before the first Activation line: none; at the scroll end: the last target; else the last target (document order) whose top has passed its Activation line; no direction-dependent hysteresis |
| Marker | `activeClass` (`is-active`) on the `<a>` | `.is-active` on the link and on its parent `li`, `aria-current` on the link |
| Click | `preventDefault()`, then `SmoothScroll.scrollToLoc` with Magellan's duration, easing, threshold, offset; `_inTransition` until the animation callback | Composed `NfsSmoothScroll` handles the click (scroll, focus, `preventDefault()` last); Magellan's own listener marks the section at once and starts the transition, which ends when scrolling has been idle for 100 ms |
| URL | With `deepLinking`: `replaceState({}, '', '#id')` (or `pushState` with `updateHistory`) on each change; hash removed above the first section; on load and on `hashchange`, `scrollToLoc(location.hash)` | With `deepLinking`: `replaceState(history.state, '', pathname + search + '#id')` (or `pushState` with `updateHistory`); fragment removed above the first section; at first render the fragment's section is scrolled to; no `hashchange` listener |
| Methods | `calcPoints()`, `scrollToLoc(loc)`, `reflow()`, `destroy()` | `scrollTo(target, options?)`; nothing else (the observer sees layout changes) |
| Events | `init.zf.magellan`, `update.zf.magellan` `[$active]`, `destroyed.zf.magellan` | `activeChange` (the `active` model's output, the section id or `null`); no counterpart for `init`/`destroyed` |
| Container id | Own id or generated `magellan-*`, plus `data-resize`/`data-scroll` | Dropped |
| Sass | None (Foundation ships no Magellan Sass) | None; Foundation's Menu styles the marker |

Options (`Magellan.defaults` has exactly seven; audit 0001 H6: the ticket's `barOffset` does not exist in 6.9, and Foundation's own visual test still carries a dead `data-bar-offset`):

| Option | Foundation default | Library | Reason |
| --- | --- | --- | --- |
| `animationDuration` | `500` (ms) | Dropped option | The composed `NfsSmoothScroll` uses native smooth scrolling, which has no duration control (building-blocks 1.4 timing options) |
| `animationEasing` | `'linear'` | Dropped option | Same: browser-defined |
| `threshold` | `50` (px) | `threshold` input, default `50` | The Activation line's distance below the landing position; the Smooth Scroll spec left this use to Magellan. Its second Foundation use (stopping `threshold / 2` short of the target) goes: the landing position is CSS |
| `activeClass` | `'is-active'` | Dropped option | Class-name options are dropped because the classes are the contract (building-blocks 1.4) |
| `deepLinking` | `false` | `deepLinking` input, default `false` | Named after the `defaults` key; Foundation's docs say "`data-deep-link`", which jQuery maps to `deepLink`, a key Magellan never reads, so the docs sentence never worked |
| `updateHistory` | `false` | `updateHistory` input, default `false` | Foundation parity, with the Router hazard documented (Comparison, rule 4) |
| `offset` | `0` (px) | CSS: `scroll-padding-top` on the scroll container (or `scroll-margin-top` on a section), which Magellan reads for the Activation line | One value places the scroll (native and directive jumps alike, per the Smooth Scroll spec) and the line; a JavaScript `offset` would diverge from native jumps before hydration |

Library additions with no Foundation Option: `ariaCurrentWhenActive` (Foundation emits no ARIA) and the `active` model (Foundation kept the state private and exposed it only through the event).

### CSS class to Angular mapping

| Foundation class | Element | Angular | Rationale |
| --- | --- | --- | --- |
| (none) container | `ul.menu` or `nav` carrying `data-magellan` | `NfsMagellan` on `[nfsMagellan]` | Magellan has no Structural class; the class is named after the Plugin (building-blocks 1.3). The container's classes (`.menu`, `.vertical`, `.expanded`, `.simple`) stay the consumer's Variant classes (ADR 0010) |
| `.is-active` (State class) | The current section's link, and the link's parent `li` when it has one | Written by `NfsMagellan` with `Renderer2` after render | On the link: Magellan's own contract, for custom navigations and existing CSS. On the `li`: Foundation Menu's documented active state ("Add the class `.is-active` to any `<li>`", styled by `.menu .is-active > a` and Dropdown Menu's `li.is-active > a`), so the marker is visible with no library CSS |
| (none) target | `section[id]` | No directive | Targets are found from the links ([ADR 0029](../adr/0029-magellan-targets-from-links.md)) |

`aria-current` is not a class but travels with `.is-active` on the link. Neither can be a host binding: the links are consumer elements inside the host, found by query as Smooth Scroll finds them, and there is no first-paint value to bind (the server cannot know the scroll position). Angular's `RouterLinkActive` writes its classes and `aria-current` with `Renderer2` for the same reason.

### Hierarchy and DI shape

```
[nfsMagellan]                      NfsMagellan on the link container
  hostDirectives: NfsSmoothScroll  click handling, focus, reduced motion, scrollTo
  a[href="#id"] ...                consumer links, found by query (no directive)
section[id] ...                    consumer targets anywhere in the document (no directive)
```

- One directive class, `NfsMagellan`, selector `[nfsMagellan]`, `exportAs: 'nfsMagellan'`, entry point `ngx-foundation-sites/magellan`, which imports `NfsSmoothScroll` from `ngx-foundation-sites/smooth-scroll`.
- `hostDirectives: [NfsSmoothScroll]`, with no inputs or outputs to forward (it has none). Host directives run their listeners before the host's (Angular host-directive execution order), so on each click `NfsSmoothScroll` scrolls, focuses, and calls `preventDefault()` before Magellan's own listener runs; Angular runs every host listener of an element separately and reports a throwing one to `ErrorHandler` without skipping the others, so Smooth Scroll's replay error never skips Magellan's listener. Writing `nfsSmoothScroll` on the same element as well is Angular's "directive matches multiple times" error, which is the right outcome.
- No Parent token. Nothing registers with the container: links are queried, targets are looked up by id. An earlier building-blocks sketch named an `nfsMagellanToken`; it has no consumer and is not created.
- Defaults token: `nfsMagellanDefaultsToken`, an `InjectionToken<NfsMagellanDefaults>` (all-optional `threshold`, `deepLinking`, `updateHistory`, `ariaCurrentWhenActive`), injected with `{optional: true}` to seed the input defaults; provided at bootstrap, route, or element level, nearest wins (building-blocks 1.4, Material shape B).
- Injection: `ElementRef` (the host), `DOCUMENT`, `Renderer2` (marker writes), `NgZone` (`runOutsideAngular` for the scroll listener and the idle timer), `DestroyRef`, `NfsSmoothScroll` (the host-directive instance, for `scrollTo`), and CDK `ViewportRuler` (viewport resize when the scroll container is the document). Nothing from `@angular/router`.
- Target map: an id-keyed map of the tracked targets (Material `MatSort`'s id-keyed `sortables` map, filled from the links instead of by registration), each entry holding the element and its links, kept in document order of the targets (not of the links).

### API: `NfsMagellan`

Selector `[nfsMagellan]`; `exportAs: 'nfsMagellan'`; standalone; no template; no host bindings; two host-level behaviours: the composed Smooth Scroll `click` listener and Magellan's own `click` listener.

```ts
class NfsMagellan {
  readonly threshold: InputSignalWithTransform<number, unknown>;                   // default 50 (numberAttribute)
  readonly deepLinking: InputSignalWithTransform<boolean, unknown>;                // default false (booleanAttribute)
  readonly updateHistory: InputSignalWithTransform<boolean, unknown>;              // default false (booleanAttribute)
  readonly ariaCurrentWhenActive: InputSignalWithTransform<true | 'location' | 'step', true | 'true' | 'location' | 'step'>; // default true
  readonly active: ModelSignal<string | null>;                                     // default null; emits activeChange

  /** Scrolls to a tracked section (instant under reduced motion), marks it current, and, unless focus is false, focuses it. */
  scrollTo(target: string, options?: { focus?: boolean }): boolean;
}

interface NfsMagellanDefaults {
  threshold?: number;
  deepLinking?: boolean;
  updateHistory?: boolean;
  ariaCurrentWhenActive?: true | 'location' | 'step';
}
const nfsMagellanDefaultsToken: InjectionToken<NfsMagellanDefaults>;
```

Inputs:

| Input | Type | Default | Foundation | Kind | Notes |
| --- | --- | --- | --- | --- | --- |
| `threshold` | number (px) | `50` | `data-threshold` | `input()`, `numberAttribute` | Distance of the Activation line below each target's landing position |
| `deepLinking` | boolean | `false` | `data-deep-linking` | `input()`, `booleanAttribute` | URL follows the Current section; fragment scrolled to at first render |
| `updateHistory` | boolean | `false` | `data-update-history` | `input()`, `booleanAttribute` | With `deepLinking`: `pushState` instead of `replaceState`; alone: no effect (dev warning) |
| `ariaCurrentWhenActive` | `true`, `'location'`, `'step'` | `true` | none | `input()`, transform maps the attribute string `'true'` to `true` | Same name and meaning as `RouterLinkActive.ariaCurrentWhenActive`; `false` and `'page'` are excluded (a current section must be exposed, and it is not a page) |

Model:

- `active: ModelSignal<string | null>`, the id of the Current section, `null` above the first section and before tracking starts. Its generated `activeChange` output is the counterpart of `update.zf.magellan` (building-blocks 1.4 mapping) and fires once per change, with the id instead of Foundation's jQuery link collection.
- Magellan writes it from tracking, from its click listener, and from `scrollTo`. A consumer write (through `[(active)]` or `set()`) is a request to make that section current: Magellan scrolls to it without moving focus (a model write is not a link activation; code that wants focus calls `scrollTo`). A write of an id that is not tracked marks no link and scrolls nowhere, with a development-mode warning; the next tracking update replaces it. A write of `null` marks nothing and scrolls nowhere.
- Implementation: Magellan keeps a private signal with the last value it published itself. An `afterRenderEffect` reads `active()`; when it differs from that private value, the write came from outside and the effect calls `scrollTo(value, {focus: false})`. Tracking and clicks update both, so they never trigger a scroll. The effect is a render callback, so it never runs on the server.

Outputs: `activeChange` only. No Completion output: nothing animates (the glide is browser-owned and reports no end inside the Browser target).

Method `scrollTo(target, options?)`:

- `target` is a fragment string, with or without the leading `#`, naming a tracked section. Returns `false`, and does nothing, when the fragment names no tracked section; returns `true` after starting the scroll.
- Sets `active` to the section's id, starts the transition (below), then calls the composed `NfsSmoothScroll.scrollTo(element, {focus})`: `scrollIntoView` with `'smooth'`, or `'instant'` while `NfsMediaQuery.reducedMotion()` is true; focus with a temporary `tabindex="-1"` when the section is not focusable; `focus` defaults to `true`.
- Browser-only, like `focus()`: call it from a handler or a render callback.

Magellan's `click` listener (after the composed Smooth Scroll listener has run), in this order:

1. Find the link: the nearest `a[href]` ancestor-or-self of the event target inside the host. Ignore the click unless it is a primary click with no modifier key, and the link has no `download` and no `target` other than `_self` (the same filter Smooth Scroll applies; one library-internal function serves both).
2. Look the link up among the tracked links. Ignore the click if it is not one.
3. Set `active` to the link's section id and start the transition.

The listener calls no `preventDefault()` and does not look at `defaultPrevented`. Every tracked-link click it accepts ends at that link's section: either `NfsSmoothScroll` scrolled there, or a link-level listener (a `RouterLink` with `fragment`, which the Smooth Scroll container yields to) navigates to the same fragment, whose anchor scrolling goes there too. If nothing scrolls at all (a Router without `anchorScrolling`), the transition ends after 100 ms idle and tracking restores the true Current section.

Tracking:

- Scroll container: in the first render callback, the nearest ancestor of the first target (in document order) whose computed `overflow-y` is `auto`, `scroll`, or `overlay`; otherwise the document. A development-mode warning names any target in a different scroll container. Recomputed when the target set changes.
- Observer root: that element, or the owning `Document` when the scroll container is the document. Never the implicit root: for a page inside an iframe (Storybook's canvas, an embedded app) the implicit root is the top-level viewport, not the iframe's. `IntersectionObserver` accepts a `Document` root in every Browser target engine (browser-compat-data `options_root_parameter_Document`: Chromium 81, Gecko 76, Safari 14).
- Activation line for a target: its top edge must be at most `paddingTop + marginTop + threshold` pixels below the top of the scroll container's viewport, where `paddingTop` is the scroll container's resolved `scroll-padding-top` (for the document, read from the root element; a percentage resolves against the scrollport height; `auto` is 0) and `marginTop` is the target's own `scroll-margin-top`. That is where `scrollIntoView` and native fragment jumps land the target, plus `threshold`.
- The observer watches a 1 px band at `paddingTop + threshold` (`rootMargin` of `-{line}px 0px -{rootHeight - line - 1}px 0px`, `threshold: [0]`), so it reports every target whose top or bottom edge crosses the line, including crossings caused by layout changes without scrolling. It is rebuilt when the root's height changes (a `ResizeObserver` on an element root; `ViewportRuler.change()` for the document), when `threshold` changes, and when the target set changes; the scroll padding and margins are re-read at each rebuild.
- On each observer callback (and at scroll idle), Magellan recomputes the Current section from live `getBoundingClientRect()` reads of every tracked target (layout is fresh inside the callback): if the scroll container is at its scroll end (`scrollTop + clientHeight >= scrollHeight - 1`), the last target; otherwise the last target in document order whose top has passed its own Activation line; `null` when none has. The per-target line keeps a section with a larger `scroll-margin-top` correct after it lands; the shared band only decides when to recompute.
- Several visible targets: the rule above picks the one the reader has scrolled into, never merely the most visible; targets below their line do not count however much of them is visible.
- Scroll backstop: a passive `scroll` listener on the scroll container (on the `Document` for the document), added in the first render callback outside the Angular zone, restarts a 100 ms idle timer on each event. When the timer fires, Magellan ends any transition and recomputes. This catches the cases the band cannot see: an instantaneous jump (reduced motion, a native jump) that lands in a gap between targets without any edge crossing the band, and reaching the scroll end with a last target too short to reach its line. It is the pattern the Sticky prototype settled on (observer first, scroll listener as the backstop for instantaneous jumps).
- Transition: started by a tracked-link click, `scrollTo`, a consumer write to `active`, and the deep link at first render. While it lasts, observer callbacks update nothing, so the clicked section stays current while the page glides past the ones in between (Foundation's `_inTransition`). It ends at the first 100 ms without a `scroll` event, counted from its start, so an instant scroll, a scroll that does not move, and a Router that does not scroll all end it too; a reader who takes over mid-glide ends it when they stop, and the recomputation then marks where they are.
- Targets and links: after every application render (`afterEveryRender`, read phase), Magellan re-reads its host's in-page links and resolves any link whose section is missing or no longer connected; when the set changes it re-observes and recomputes. This picks up links rendered by `@for` and sections that a `@defer` block or an `@if` renders later. The check is a query of the host's links plus one `getElementById` per unresolved fragment, cheap for a navigation of a few dozen links (a ceiling stated in Design decisions D2).

Marker writes: an `afterRenderEffect` (write phase) keyed on `active()`, the tracked links, and `ariaCurrentWhenActive()` removes `.is-active` and `aria-current` from the previously marked links and list items and adds them to every link of the Current section (several links to one section are all marked) and to each such link's parent element when that parent is an `li`. On destroy, Magellan removes the classes and attributes it added, disconnects its observers, removes its listener, and clears its timer.

Deep linking (`deepLinking` true):

- At first render: if the document URL has a fragment naming a tracked section, `scrollTo(id, {focus: false})`. In a server-rendered page the browser already jumped there natively while parsing, so this scroll is a no-op; in a client-rendered page it is the jump. Focus stays put because a programmatic focus of a whole section at load shows a focus ring the native load jump would not (it only moves the sequential focus navigation starting point for a non-focusable target).
- When `active` changes by tracking or by a click (not at first render, and not while a transition lasts), and the new value differs from the URL's fragment: `history.replaceState(history.state, '', location.pathname + location.search + '#' + id)`, or `pushState` with the same arguments when `updateHistory` is true; `null` writes `location.pathname + location.search` (fragment removed). The current `history.state` object is passed through so the Router's navigation id and page id survive (the Tabs spec's rule). The write is an `afterRenderEffect`, so it is browser-only and after first render (building-blocks 1.5 and 1.11).
- No `hashchange` listener: a fragment change the reader makes (editing the address bar, Back and Forward over Magellan's own entries) is a native fragment navigation or traversal that already scrolls (and restores scroll position on traversal); tracking follows it. Foundation's listener existed only to animate.
- Magellan never writes the URL when `deepLinking` is off, and never on destroy (building-blocks 1.9 asks directives to restore globals they touched; rewriting history while a route is being torn down would corrupt the Router's navigation, so this is a recorded exception).

Development-mode checks (only with `ngDevMode`, never on the server): in the first render callback, a host with no in-page links; a host that is neither inside nor itself a `nav` element or `role="navigation"` element; `updateHistory` without `deepLinking`. When the target set changes, targets in different scroll containers. On a consumer write, an unknown id.

### Implementation level and primitives

Implementation level: native platform. `IntersectionObserver` (widely available since 2021; a `Document` root since Chromium 81, Gecko 76, Safari 14), `ResizeObserver`, the History API, `scroll-padding`/`scroll-margin` (2021), and, through the composed `NfsSmoothScroll`, `scrollIntoView` with `behavior` and `prefers-reduced-motion`, all inside the Browser target (the platform research, sections 9, 10, 18). `@angular/aria` has no scroll-spy or link pattern. From `@angular/cdk`: `ViewportRuler.change()` for viewport resizes, and `InteractivityChecker` through `NfsSmoothScroll`; CDK's `ScrollDispatcher` and `CdkScrollable` report scroll events of registered scrollables, which the observer already replaces. Angular: `model`, `input` with transforms, `hostDirectives`, `afterNextRender`, `afterRenderEffect`, `afterEveryRender`, `DestroyRef`, `Renderer2`.

Render hooks (building-blocks 1.5): `afterNextRender` is the first render callback (scroll container, observer, scroll backstop, first-render deep link, development checks); `afterRenderEffect` carries the model-write scroll, the marker writes (write phase), and the history writes, each re-running only on the signals it reads; `afterEveryRender` (read phase) only re-reads the host's links and re-resolves missing sections, because a section that another component's `@if` or `@defer` renders changes no signal Magellan reads ([ADR 0029](../adr/0029-magellan-targets-from-links.md)). None of these callbacks acts on a breakpoint-driven render, so the rendered-state rule does not apply.

`injectAsync`: not used. The composed `NfsSmoothScroll` and Magellan's own `click` listener must be live at hydration to handle a replayed click, and tracking starts in the first render callback so the marker appears right after hydration, which an awaited chunk would delay; the entry point is its own, so a consumer's `@defer (hydrate on viewport)` already defers a sidebar navigation until it appears.

Not used, and why: scroll-position maths on every animation frame (Foundation's approach with `requestAnimationFrame` instead of a debounce) reads every target's rectangle per frame, interleaved with the library's own class writes and Sticky's, and misses layout changes that happen without scrolling; the observer reports crossings, including layout-driven ones, with no per-frame work. `scrollend` (Safari 26.2) and scroll-driven animations (no Firefox release) are outside the target; the idle timer stands in for `scrollend`.

Fallback: none needed for the primitives. If the three-engine e2e suite shows the 1 px band missing crossings in an engine, the fallback is the same recomputation driven by the scroll listener on each animation frame instead of by the observer, with no API change.

### Comparison with Angular Material and the Router

Material has no scroll spy; its closest shape is `MatSort`: a directive holding the active id, children keyed by id, and a change output.

| Concern | `MatSort` | `NfsMagellan` |
| --- | --- | --- |
| Directive or component | Directive `[matSort]`; header is an attribute component | Directive `[nfsMagellan]`; no child directive |
| Active state | `matSortActive` input (id string) plus `direction` | `active` model (section id or `null`) |
| Change output | `matSortChange: Sort {active, direction}` | `activeChange: string or null` (the model's output) |
| Children | `mat-sort-header` registers with the parent by id into `sortables: Map<string, MatSortable>` | Links queried from the host; targets looked up by the links' fragments into an id-keyed map; nothing registers |
| ARIA | `aria-sort` on the header; Material recommends `LiveAnnouncer` because `aria-sort` changes are not announced | `aria-current` on the current link; no announcement (a reading-position change announced on every scroll would be noise; see ARIA) |
| Defaults | `MAT_SORT_DEFAULT_OPTIONS` | `nfsMagellanDefaultsToken` |

The Router's neighbours: `RouterLinkActive` (classes and `aria-current` for route matches, written with `Renderer2`, with the same `ariaCurrentWhenActive` input, which Magellan borrows by name) and `withInMemoryScrolling({anchorScrolling})` for fragment links (the Smooth Scroll spec's comparison applies unchanged). Rules for applications that use the Router:

1. `routerLink` links with a `fragment` inside the Magellan container are tracked and marked like plain links; their clicks belong to the Router (the composed Smooth Scroll container yields to them). Magellan's listener still marks the section and starts the transition, and the Router's anchor scrolling (with `ViewportScroller.setOffset` equal to the CSS offset, the Smooth Scroll spec's rule 2) lands on the same section.
2. `routerLinkActive` is not combined with Magellan on the same links: both would write `.is-active`.
3. With `scrollPositionRestoration` other than `'disabled'`, links that jump natively (outside any Magellan or Smooth Scroll, or inside `hydrate never`) are undone by the Router's popstate scroll (the Smooth Scroll spec's rule 3, confirmed in three engines by the [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md): the Router undoes unhandled native jumps, and a replayed handler in a dehydrated block runs last).
4. `deepLinking` with `replaceState` keeps `history.state`, fires no `popstate`, and so leaves the Router alone; `router.url` keeps the fragment of the last Router navigation until the next one. `updateHistory` pushes same-document entries that carry a copy of the current `history.state`; with the Router's scroll restoration on (which sets `history.scrollRestoration` to `manual`), a Back press is a Router popstate navigation that restores the position stored for the copied navigation id, not the section's, so `updateHistory` is documented for pages without the Router's scroll restoration. The [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md) measured that wrong position in three engines, and the e2e suite guards it. Without the Router's restoration, Back over `updateHistory` entries uses the browser's own restoration, measured exact only in Chromium; the entries are for Foundation parity, not exact positions.

### ARIA and keyboard

APG pattern: none (no widget). Composition, per the APG research: a `navigation` landmark, the Link pattern for the links, and `aria-current` on the link of the Current section.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| Navigation | The consumer's `nav` (implicit `navigation` landmark) with `aria-label` (for example "On this page") whenever the page has another `nav`; Magellan warns in development mode when it is not inside one | APG landmark practice ("each should have a unique label"); axe `landmark-unique` (best-practice) |
| Links | Native `a[href]`, role `link`; Magellan adds nothing but the current marker | APG Link pattern |
| Current section's link | `aria-current="true"` (or the `ariaCurrentWhenActive` token), on every link of that section, removed from all others; absent above the first section and in server HTML | WAI-ARIA `aria-current` (`true`: "current item within a set"; `location`: "current location within an environment or context"; `step`); unknown tokens are read as `true` |
| Current section's list item | `.is-active` only (styling), no ARIA | Foundation Menu contract |
| Targets | The consumer's elements with consumer ids; `tabindex="-1"` only while the composed Smooth Scroll's focus is on a non-focusable one | Smooth Scroll spec |
| Target naming | Not named by the library; sections become `region` landmarks only if the consumer names them, which should be done only for sections meant as landmarks | APG Magellan note |
| Announcements | None. `aria-current` changes during scrolling are not announced by screen readers and need not be: the reader is moving through the content, and the state is read when the user reaches the navigation | Material sort accessibility note (attribute changes are not announced); AT confirmation is a human check (ticket, OPEN FOR HUMAN) |

| Key | Behaviour | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Moves through the links in DOM order; the current link is announced with its `aria-current` state | Native |
| Enter on a link | The composed Smooth Scroll scrolls to the section (instant under reduced motion), focuses it, and cancels the native jump; Magellan marks the section current at once | `NfsSmoothScroll`, then `NfsMagellan` |
| Space on a link | Scrolls the page (native link behaviour); tracking follows | Native |
| Tab after activation | Continues inside the section, because focus is on it | `NfsSmoothScroll` focus move |
| Modified Enter or click | Native (new tab, window, download); Magellan ignores it | Native |

WCAG 2.2 AA requirements (each a requirement of the directive or of documented consumer markup; axe sees few of them, so the play functions and e2e assert them):

| Criterion | How it holds | What fails it, and the fix |
| --- | --- | --- |
| 1.3.1 Info and Relationships (A) | The navigation is a `nav` list of links; the current item is exposed programmatically through `aria-current`, not only visually | Foundation Magellan's class-only marker exposed nothing; fixed by `aria-current` |
| 1.4.1 Use of Color (A) | Foundation Menu's marker is a filled box (`$menu-item-background-active`, default primary `#1779ba`) behind the link, a change of area and luminance (4.65:1 against the unmarked state on `$white`), not a hue change alone | A consumer marker that only changes the text hue fails it; the stories use Foundation's filled style |
| 1.4.3 Contrast (Minimum) (AA) | Marker text: Foundation's `color-pick-contrast` picks `$white` (`#fefefe`) on `#1779ba`, 4.65:1. Unmarked links: `$anchor-color` (`#1779ba`) on `$white`, 4.65:1. Inside Foundation's default Top Bar (`$topbar-background: $light-gray`, `#e6e6e6`) the unmarked links are 3.76:1 and fail, so a Magellan navigation in a `.top-bar` requires a bar background (`$topbar-background`) on which `$anchor-color` reaches 4.5:1, for example `$topbar-background: $white;`, or a darker `$anchor-color`, the setting the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md) requires for menus in a Top Bar | A lighter `$menu-item-background-active` (or a custom palette) can drop below 4.5:1; the story gate (axe `color-contrast`) fails it; the fix is the consumer's `$menu-item-background-active` or `$menu-item-color-active` setting, never library CSS. Foundation's default Top Bar fails it for the unmarked links (`magellan--sticky-top-bar` without the Storybook setting); the fix is the `$topbar-background` setting above |
| 1.4.11 Non-text Contrast (AA) | The marker box against its surroundings: `#1779ba` on `$white` 4.65:1, on the default Top Bar (`$topbar-background: $light-gray`, `#e6e6e6`) 3.76:1, both above 3:1; with the `$topbar-background: $white` that 1.4.3 requires in a Top Bar, 4.65:1 against the bar | A consumer `$menu-item-background-active` below 3:1 against the bar or page; axe cannot measure it, so the `magellan--sticky-top-bar` and `magellan--menu` play functions compute the ratio of the marked item's background to the container's and assert at least 3:1; the fix is the setting |
| 2.1.1 Keyboard (A) | Native links; Enter produces the click both listeners handle | None |
| 2.4.1 Bypass Blocks (A) | The labelled `nav` landmark lets assistive technology skip or reach the navigation | A second unlabelled `nav`; the dev check and axe `landmark-unique` catch it |
| 2.4.3 Focus Order (A) | Link activation moves focus into the section (Smooth Scroll); a consumer write to `active` moves none; `scrollTo` moves focus by default | Foundation left focus on the link; fixed through composition. A "Jump to section" `<select>` bound with `[(active)]` moves no focus, so the usage example calls `scrollTo` from its `change` handler instead when focus should follow |
| 2.4.7 Focus Visible (AA) | Browser `:focus-visible` rings on links and on the focused section after keyboard activation (Foundation's outline removal needs what-input, which the library does not load) | A consumer rule removing outlines |
| 2.4.11 Focus Not Obscured (Minimum) (AA) | With a sticky bar (the documented Magellan plus Sticky pairing), `scroll-padding-top` of at least the bar height on the scroll container is required consumer CSS (the Smooth Scroll spec's rule); Magellan reads the same value, so it is also the tracking offset | Foundation's `offset` Option in JavaScript did not protect later Tab moves; the smallest rule is the consumer's `html { scroll-padding-top: <bar height>; }`, shown in the usage examples |
| 2.5.8 Target Size (Minimum) (AA) | Foundation Menu links: `$menu-items-padding` (`0.7rem 1rem`) with `line-height: 1` make them 38.4 px tall at a 16 px base | `.menu.simple.vertical` sets link padding to 0 and stacks 16 px targets with no spacing, which fails (axe `target-size`); the smallest consumer rule is `.menu.simple.vertical a { padding-block: 0.25rem; }` (24 px), or leave `.simple` off vertical Magellan menus; horizontal `.simple` menus pass through `$menu-simple-margin` spacing |
| 4.1.2 Name, Role, Value (A) | Links named by their text; the current state as `aria-current` | None |
| 2.3.3 Animation from Interactions (AAA, honoured) | Instant jumps under reduced motion (Smooth Scroll) | None |

Focus rules: only link activation and `scrollTo` (default) move focus, to the section, with `preventScroll`; model writes and the deep link at first render do not; nothing Magellan does on scroll moves focus.

### Rendered HTML

Magellan has no host bindings. Server HTML is the consumer's markup plus the `jsaction` attribute hydration adds for the two `click` listeners (one attribute); after hydration Angular removes it, and tracking adds the marker.

```html
<!-- Consumer markup (Foundation's docs, with the nav landmark and without data-magellan-target) -->
<nav aria-label="On this page">
  <ul class="menu expanded" nfsMagellan>
    <li><a href="#first">First Arrival</a></li>
    <li><a href="#second">Second Arrival</a></li>
    <li><a href="#third">Third Arrival</a></li>
  </ul>
</nav>
<div class="sections">
  <section id="first">First Section</section>
  <section id="second">Second Section</section>
  <section id="third">Third Section</section>
</div>

<!-- Server HTML (SSR and prerender): no marker, the scroll position is unknown -->
<nav aria-label="On this page">
  <ul class="menu expanded" jsaction="click:;">
    <li><a href="#first">First Arrival</a></li>
    <li><a href="#second">Second Arrival</a></li>
    <li><a href="#third">Third Arrival</a></li>
  </ul>
</nav>

<!-- Hydrated, reader above the first section: the consumer's markup, active = null -->
<ul class="menu expanded">...</ul>

<!-- Hydrated, reader in the second section: active = 'second' -->
<ul class="menu expanded">
  <li><a href="#first">First Arrival</a></li>
  <li class="is-active"><a href="#second" class="is-active" aria-current="true">Second Arrival</a></li>
  <li><a href="#third">Third Arrival</a></li>
</ul>

<!-- Just after Enter on "Third Arrival": marked at once, section focused while the page glides -->
<li class="is-active"><a href="#third" class="is-active" aria-current="true">Third Arrival</a></li>
<section id="third" tabindex="-1">Third Section</section>

<!-- Custom navigation without list items: the link alone carries the class -->
<nav aria-label="Steps" nfsMagellan ariaCurrentWhenActive="step">
  <a href="#shipping" class="is-active" aria-current="step">Shipping</a>
  <a href="#payment">Payment</a>
</nav>

<!-- Router application: same-document hrefs (base href safe) -->
<ul class="menu vertical" nfsMagellan>
  <li><a href="/guide/install#requirements">Requirements</a></li>      <!-- Smooth Scroll-owned click -->
  <li><a routerLink="." fragment="configure">Configure</a></li>          <!-- Router-owned click, still tracked -->
</ul>
```

With `deepLinking`, the address bar after the second state reads `/guide#second`; above the first section it reads `/guide` again. The attribute order in server HTML is not significant.

### Animation

- Scrolling is browser-owned through the composed `NfsSmoothScroll`: `scrollIntoView` with `'smooth'`, `'instant'` while `NfsMediaQuery.reducedMotion()` is true; native jumps are smooth only with the consumer's `nfs-smooth-scroll` include, gated by `prefers-reduced-motion: no-preference`. Magellan adds no timing, no State class animation, no Motion class, no `animate.enter`/`animate.leave`, and no Completion output (ADR 0003 has nothing to govern here).
- The marker switches instantly (Foundation's Menu active style has no transition); reduced motion needs nothing more.
- The 100 ms idle timer is not animation timing: it only decides when a scroll has settled, the job `scrollend` will take over when it enters the target.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: nothing is read or written (rule 1). No marker, because the scroll position is unknown on the server (the research checklist's Magellan row). First paint is plain Foundation markup with working links (given same-document `href`s).
- Before hydration: nothing runs (rules 3 to 5). A click on a link jumps natively: the CSS offset, native focus handling, the fragment in the URL, and a history entry, even with `deepLinking` off (inherent to native fragment navigation).
- Full hydration: no host bindings, so hydration compares and changes nothing; no `ngSkipHydration` (rule 10). The first render callback finds the links and targets, builds the observer, whose initial callback marks the Current section; the marker appears after hydration by `Renderer2` writes, which hydration never sees.
- Event replay: both `click` listeners live in the host metadata of the container and replay. A click made before hydration is replayed after the native jump: the Smooth Scroll listener's scroll is a no-op, it focuses the section, and its final `preventDefault()` throws and is logged (building-blocks Part 4, Decided item 3's accepted default, audit 0002 M12's wording: "the handler always scrolls the target into view, then calls `preventDefault()` last; on a replay after a native jump the scroll is a no-op and the logged error is accepted"); Magellan's listener, run separately, marks the section and starts the transition, which ends 100 ms later with the section current. Magellan's own listener calls no `preventDefault()`, so it adds no error.
- Incremental hydration, navigation inside a dehydrated block: the `jsaction` is on the container, not on the `<a>`, so the dispatcher does not cancel the native jump; the click hydrates the block and replays as above. No tracking before the block hydrates; `hydrate on viewport` for a sticky sidebar hydrates it when it appears.
- Targets may sit anywhere, including in dehydrated `@defer (hydrate ...)` blocks and in `hydrate never` blocks: Magellan only observes their server-rendered elements and never writes to them, so they are tracked before and without hydration. This is why targets have no directive (a directive in a dehydrated block is not constructed and could not register). A target inside a plain `@defer` block that has not rendered does not exist yet and is picked up when it renders.
- Hydration boundary: the container and its links share one boundary (the links are its descendants; building-blocks 1.11 decision 6). Targets are exempt from that rule for the reason above.
- `@defer`: library templates contain no `@defer`; the directive is its own entry point. Inside `@defer (hydrate never)` the navigation's links jump natively with the CSS offset (and smoothly with the mixin), with no marker ever (building-blocks 1.11 decision 7's residue for Magellan).
- Deep links apply after hydration (building-blocks 1.11 decision 9): the server never sees the fragment; the first render callback reads it. Section ids must be consumer-supplied and stable (building-blocks 1.5): Magellan generates no ids, and a generated id would change the URL between server and client and between deploys.
- Timers and listeners: the scroll listener and the idle timer run outside the Angular zone (rule 4), so scrolling triggers no change detection in zone-based applications; the observers' callbacks write signals only when the Current section changes, and signal writes schedule rendering in zoneless and zone-based applications alike.
- Prerendering: identical to server rendering; no request token is read (rule 11).

### Sass and custom CSS

No library CSS; there is no `nfs-magellan` mixin. The marker is Foundation's Menu active style (`foundation-menu`, `.menu .is-active > a`), which the list-item placement reaches; the offset is the consumer's `scroll-padding-top`, already required by the Smooth Scroll spec. No directive declares `styles` or `styleUrl`. The Sass subsection under Further Notes has the full statement.

## Testing Decisions

A good test asserts what the user observes: which link carries `.is-active` and `aria-current` (and which list item carries `.is-active`), which element has focus, where a section lands, the URL and `history.length`, and the `activeChange` values a story or test host records. No test reads the directive's fields. Scroll and marker assertions poll until stable (a smooth scroll has no completion event, and the transition ends after 100 ms of idle), with a 1 px tolerance on positions. Prior art: the Smooth Scroll and Tabs specs' layers (the Tabs deep-link cases), Angular's `renderApplication`-based SSR tests, and Angular Components' universal-app e2e.

Story ids follow `magellan--<story>`: `magellan--menu`, `magellan--sticky-top-bar` (with `nfsSticky`), `magellan--table-of-contents` (vertical sticky sidebar), `magellan--scroll-container`, `magellan--unordered-links`, `magellan--custom-nav`, `magellan--threshold`, `magellan--jump-select` (`[(active)]` with a `<select>`), `magellan--programmatic`, `magellan--deep-linking`, `magellan--router-link-fragment` (Router provided in the story).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `runOnly` set to the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`; building-blocks 1.10 and 1.12), with the marker present (the play function scrolls into a section before the run completes). Axe does not test focus order, focus visibility, obscured focus, or the marker's non-text contrast, so the play functions assert 2.4.3, 2.4.7, 2.4.11, and 1.4.11 directly.

- `magellan--menu`: at the top no link is marked and no `aria-current` exists; scrolling the story's scroller until `#second`'s top is 40 px below the top (inside the 50 px threshold) marks "Second Arrival" (`.is-active` on the link and its `li`, `aria-current="true"` on the link, nothing elsewhere) and records `activeChange('second')`; scrolling back above `#first` removes the marker and records `null`; the marked item's background against the menu's background is at least 3:1 (1.4.11).
- `magellan--menu`, click: clicking "Third Arrival" marks it at once, `#third` has focus, "Second Arrival" is never marked while the page glides (the recorded `activeChange` sequence is exactly `'third'`), and after settling `#third`'s top is at the scroller's top; Enter on a focused link does the same, and the focused section matches `:focus-visible` with a non-`none` outline (2.4.3, 2.4.7).
- `magellan--sticky-top-bar`: with a sticky `.top-bar` and `scroll-padding-top: 3.5rem`, a section becomes current when its top is within 3.5rem plus 50 px of the scroller's top; after Enter on a link and a following Tab, the focused element's rectangle does not intersect the bar's (2.4.11); the marker contrast against the bar background is at least 3:1.
- `magellan--table-of-contents`: a vertical Menu in a sticky sidebar; scrolling to the very end marks the last, short section; a section with its own `scroll-margin-top: 6rem` is current right after a click lands it.
- `magellan--scroll-container`: sections inside an `overflow: auto` panel are tracked while the story page itself does not scroll, and clicks scroll the panel.
- `magellan--unordered-links`: links in a different order from the sections, and two links to `#three`: scrolling marks sections in document order, and both links to `#three` are marked together.
- `magellan--custom-nav`: a `nav` of bare links with `ariaCurrentWhenActive="step"`: the current link carries `.is-active` and `aria-current="step"`, and no other element gets a class.
- `magellan--threshold`: with `threshold="0"`, a section becomes current only when its top reaches the scroller's top.
- `magellan--jump-select`: choosing a section in the `<select>` bound to `[(active)]` scrolls there and marks it, with focus left on the select; scrolling by hand updates the select's value.
- `magellan--programmatic`: a story button calls `scrollTo('third')` through the `exportAs` reference and shows `true`, and focus moves to `#third`; `scrollTo('missing')` shows `false`; `scrollTo('first', {focus: false})` scrolls without moving focus.
- `magellan--deep-linking`: scrolling into `#second` makes the story iframe's `location.hash` `#second` and leaves `history.length` unchanged; scrolling above the first section removes the hash.
- `magellan--router-link-fragment`: in a menu mixing a plain same-document link and a `routerLink` with `fragment`, both are marked when their sections are current; the plain link's click leaves the URL unchanged, the `routerLink` click is the Router's (the URL gains the fragment through the Router) and still marks its section at once.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Current-section rule, driven by data over a fixture of sections with known heights in a fixed-height scroll container: above the first line (`null`), exactly at a line, between lines, in a gap between sections after an instant jump (fixed by the idle recomputation), at the scroll end with a short last section, per-target `scroll-margin-top`, `scroll-padding-top` in px and in percent, `threshold` 0, 50, and a bound change.
- Transition: a tracked-link click sets `active` at once and suppresses observer updates until 100 ms without a `scroll` event; a click on a link whose `click` was already cancelled by a link-level listener still sets `active`; a scroll that does not move ends the transition after 100 ms; a user scroll after the click ends it when the user stops, with the marker where the user stopped.
- Model: a host binding `[(active)]` receives tracking updates; a host write scrolls (through an `NfsSmoothScroll` spy) with `focus: false`; an unknown id warns in development mode and marks nothing; tracking and click updates never cause a scroll.
- Marker: `.is-active` on the link and its parent `li`, not on a non-`li` parent; `aria-current` follows `ariaCurrentWhenActive` (the attribute string `"true"` becomes `true`); several links to one section are all marked; everything Magellan added is removed on destroy.
- Links and targets: links added by `@for` after the first render are tracked; a section rendered later by `@if` (and by a `@defer` block driven with `DeferBlockBehavior.Manual`) is observed after the render; a removed and re-created section is re-resolved; targets in two scroll containers warn once.
- Deep linking with a real `location` (the Tabs spec's pattern): a fragment at first render scrolls to its section without moving focus; a tracking change calls `replaceState` with the existing `history.state` object and `pathname + search + '#id'`; `updateHistory` calls `pushState`; `null` removes the fragment; nothing is written during a transition, at first render, with `deepLinking` off, or on destroy; `updateHistory` alone warns.
- Replay-safe listener: a click whose `eventPhase` reads 101 and whose `preventDefault` throws (the full-hydration replay): Smooth Scroll's error reaches `ErrorHandler` once, and Magellan's listener still sets `active` and starts the transition; nothing Magellan does calls `preventDefault()`.
- Composition: `NfsSmoothScroll` is present on the host through `hostDirectives` (link clicks scroll and focus), and `inject(NfsSmoothScroll)` in a child of the host resolves to the composed instance.
- Zone: in a zone-based test host, scrolling the container triggers no change detection until the Current section changes.
- Development-mode checks: each warning fires once for its case and not for correct markup.

### 3. Node-level Vitest

- SSR smoke, run under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter: `renderApplication` over a fixture with a Magellan Menu inside a `nav`, a `routerLink` with `fragment` inside it, and sections with ids, one of them inside `@defer (hydrate on viewport)`. Assert that `whenStable()` resolves; the server HTML equals the fixture markup plus `jsaction="click:;"` on the container; no link has `.is-active` or `aria-current`; the deferred section's server HTML carries its id; no `IntersectionObserver`, `history`, `location`, `scroll-padding` read, or `scrollIntoView` access happens (spies record none).
- Pure logic: the current-section rule as a pure function of target rectangles, per-target lines, and the scroll-end flag (table-driven, the same table as layer 2 without layout); the band margin from the root height and line; the resolution of `scroll-padding-top` values (`auto`, px, percent); the `ariaCurrentWhenActive` transform.
- Sass: none; the library ships no `nfs-magellan` mixin, and the library's Sass compile test asserts that importing the library emits nothing for Magellan.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on the Story ids above:

- Real wheel and key input in Chromium, Firefox, and WebKit on `magellan--menu`: the marker follows scrolling in all three engines; Enter on a link and then Tab lands inside the section with a visible focus indicator (2.4.3, 2.4.7); the marker never visits intermediate links during the glide.
- Obscured focus on `magellan--sticky-top-bar` in three engines: after Enter on a link and each following Tab, the focused element does not intersect the sticky bar (2.4.11).
- Reduced motion: `page.emulateMedia({reducedMotion: 'reduce'})` makes link jumps complete within one frame and the marker settle on the target 100 ms later; a jump into a gap between sections still marks the right section.
- History API on `magellan--deep-linking` through the public `iframe.html?id=magellan--deep-linking` URL: loading with `#third` scrolls to and marks Third after hydration with focus left on the body; scrolling rewrites the hash with `history.length` unchanged; with `updateHistory` (story arg), each section adds one entry and Back returns the fragment to the previous section's id, with the marker on the section where the browser's own restoration lands; the position itself is asserted in Chromium only, because the [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md) measured the browser's restoration of these entries exact only there (Firefox and WebKit landed about 1600 px off, its row 3d); no `hashchange` handler scrolls a second time.
- Router coexistence on `magellan--router-link-fragment` with `scrollPositionRestoration: 'enabled'`: deep-linking writes keep `history.state.navigationId`; a Router navigation away and Back returns to the route without a Router error; with `updateHistory`, Back after two section entries is recorded as the regression guard for Comparison rule 4 (the wrong position the [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md) measured).

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype), served under `<base href="/">` on a nested route with same-document `href`s:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags on the server HTML (no marker); links jump natively to their sections at the CSS offset.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; after hydration, with the page scrolled into the second section before hydration, the second link is marked.
- Pre-hydration click with the main bundle held back: the native jump happens at once; after hydration focus is on the section, the section's link is marked, and exactly one "`preventDefault` called during event replay" error is logged (from the composed Smooth Scroll listener; Magellan's adds none).
- Navigation inside `@defer (hydrate on viewport)` in a sticky sidebar: no marker before the block hydrates; after it hydrates, the Current section is marked.
- Sections inside `@defer (hydrate never)`: they are tracked and marked as the reader scrolls, although their block never hydrates.
- Navigation inside `@defer (hydrate never)`: its links jump natively; no marker appears.

## Out of Scope

- Scrolling, focus, reduced motion, and the CSS offset themselves: the Smooth Scroll spec, which Magellan composes.
- A target directive and any per-section markup beyond the `id`: sections are found from the links (Design decisions D2 and ADR 0029).
- Horizontal scroll spying (sections laid out side by side): the Activation line is vertical, as in Foundation.
- A reading-progress indicator (scroll-driven animations are outside the Browser target; see Further Notes).
- Announcing Current section changes through a live region (see ARIA; a consumer can use CDK `LiveAnnouncer` on `activeChange` if a product needs it).
- Deep linking under the Router's `HashLocationStrategy`, where the URL fragment holds the route: Magellan's fragment writes would replace it; such applications leave `deepLinking` off.
- Styling the marker for custom navigations: consumers who do not use Foundation's Menu style `.is-active` themselves, as Foundation's own Magellan visual tests did.
- Restoring the URL on destroy (recorded exception to building-blocks 1.9).
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `[nfsMagellan]`, on the link container | Foundation's placement; directive-first (ADR 0001); the container is where the links live and where Smooth Scroll delegates clicks | `nav[nfsMagellan]` as the only selector (Foundation puts `data-magellan` on the `ul.menu`; a `nav`-only selector would silently not match it); a component rendering the menu (the consumer owns the markup) |
| D2 | No target directive: the links' fragments name the sections, found by id; missing or disconnected sections re-resolved after each application render | Sections in dehydrated and `hydrate never` blocks are tracked (a directive there is never constructed); Foundation's `data-magellan-target` only repeated the id; no registry service and no cross-sibling DI link is needed. Ceiling: one query of the host's links and one `getElementById` per unresolved fragment per application render, fine for a navigation of a few dozen links; a registration directive is the upgrade if that ever shows in a profile | `[nfsMagellanTarget]` registering by id with the container through a typed reference or a root registry (misses dehydrated sections, adds an attribute to every section, and a registry is what ADR 0013 rejected for Triggers); a document-wide `MutationObserver` (watches every DOM change in the application) |
| D3 | Compose `NfsSmoothScroll` through `hostDirectives` | The Smooth Scroll spec's contract: one click behaviour (scroll, focus, `preventDefault()` last, Router yielding) and one `scrollTo` for every in-page link | Magellan's own scroll code (two behaviours to keep equal); consumers placing both directives (Angular rejects a double match on one element, and the composition must be automatic) |
| D4 | Magellan's own `click` listener marks a tracked link's section and starts the transition, with no `preventDefault()` | Host directives' listeners run first, so Smooth Scroll has acted; every accepted tracked-link click ends at that section (Smooth Scroll's scroll or the Router's anchor scroll), so the listener need not know which | A hook from `NfsSmoothScroll` reporting each started scroll (a change to a published spec's API, and a start event, which building-blocks 1.4 rules out); inferring from focus (indirect) |
| D5 | Tracking by `IntersectionObserver` on a 1 px band at the Activation line, recomputing from live rectangles, with a scroll-idle backstop | No per-frame work; layout changes without scrolling are seen; the backstop covers instantaneous jumps over the band and the scroll end, the pattern the Sticky prototype settled on | Scroll-position maths per animation frame (per-frame layout reads interleaved with class writes; misses layout-only changes); an observer alone (misses jumps over the band and a short last section) |
| D6 | Observer root is the sections' scroll container, or its `Document` | Works in app shells that scroll an inner element and inside iframes (the implicit root is the top-level viewport) | The implicit root (wrong inside Storybook's iframe and embedded apps); window-only tracking (Foundation) |
| D7 | Activation line = scroll container's `scroll-padding-top` + the section's `scroll-margin-top` + `threshold`; `offset` becomes that CSS | The line sits exactly `threshold` below where every jump lands, native or not, so a clicked section is current once it lands | An `offset` input (a second copy of the bar height that native jumps never see) |
| D8 | Current section: last target in document order past its line; at the scroll end the last target; `null` before the first; no direction-dependent hysteresis | Foundation's semantics minus the scroll-direction threshold doubling, which made the same position mean different sections depending on direction | "Most visible section" (flickers between two half-visible sections and ignores reading position); Foundation's hysteresis |
| D9 | Transition from click, `scrollTo`, model write, and first-render deep link until 100 ms without a `scroll` event | Keeps the clicked link marked through the glide (Foundation's `_inTransition`) without `scrollend`; also ends for instant, unmoving, and user-interrupted scrolls | Waiting for the target to reach its line (never happens for a short last section or when the Router does not scroll); no transition (the marker runs through every intermediate link) |
| D10 | `active` model holding the section id; a consumer write scrolls there without focus; `activeChange` replaces `update.zf.magellan` | Building-blocks 1.4 (`active` model); Material `MatSort` id-keyed active state; a write meaning "make this current" makes `[(active)]` useful for jump controls | A read-only signal plus output (no two-way binding); a write that only moves the marker (overwritten by the next tracking update, so meaningless) |
| D11 | `.is-active` on the link and on its parent `li`; `aria-current` on the link; `Renderer2` writes after render | Magellan's own class contract kept on the link; Foundation Menu's documented `li.is-active` makes the marker visible with no library CSS; there is no first-paint value, and `RouterLinkActive` writes the same way | Link only (Foundation Magellan; invisible in a Menu without custom CSS, which would re-implement `menu-state-active`); list item only (breaks consumers' `a.is-active` CSS and bare-link navigations); a link directive with host bindings (an attribute on every link Foundation never needed, for no first-paint gain) |
| D12 | `ariaCurrentWhenActive` input, default `true` | `true` is read correctly by every assistive technology and means "current item within a set", which a table of contents is; the input (named as in `RouterLinkActive`) lets a step list use `step` or a map-like navigation `location` | A fixed token (one wrong for some navigations); `page` (a section is not a page) |
| D13 | `deepLinking`: `replaceState` (or `pushState` with `updateHistory`) with `history.state` passed through and `pathname + search + '#id'`; first-render fragment scrolled to without focus; no `hashchange` listener; URL untouched when off and on destroy | Foundation parity with the Router's state preserved (the Tabs spec's rule); native traversal and fragment navigation already scroll; a load-time section focus would paint a ring the native jump does not | Foundation's `replaceState({}, ...)` (erases the Router's navigation id); the Router's `Location` service (the Tabs spec writes history directly, and one mechanism across specs is simpler to reason about); a `hashchange` scroll (fights the browser's scroll restoration on Back) |
| D14 | Dropped: `animationDuration`, `animationEasing`, `activeClass`, the container id, `calcPoints()`, `reflow()` | Browser-owned timing; classes are the contract; the observer re-measures by itself | Keeping `reflow()` as a no-op (a method that does nothing) |
| D15 | Defaults token `nfsMagellanDefaultsToken` | Building-blocks 1.4: global defaults replace `Foundation.Magellan.defaults` | A `provideNfsMagellan()` function (none of Aria, CDK, or Material ships one) |
| D16 | No library CSS | Foundation's Menu styles the marker; the offset is the consumer's scroll padding | A `.menu a.is-active` rule re-applying `menu-state-active` (needed only if the class stayed on the link alone) |

### Usage examples

A guide page with a sticky table of contents (Magellan inside Sticky, Foundation's documented pairing):

```ts
@Component({
  selector: 'app-guide',
  imports: [NfsMagellan, NfsSticky],
  template: `
    <div class="grid-x grid-margin-x">
      <div class="cell large-3">
        <nav class="sticky-container" aria-label="On this page">
          <div class="sticky" nfsSticky stickyOn="large">
            <ul class="vertical menu" nfsMagellan (activeChange)="current.set($event)">
              @for (s of sections(); track s.id) {
                <li><a [href]="'#' + s.id">{{ s.title }}</a></li>
              }
            </ul>
          </div>
        </nav>
      </div>
      <article class="cell large-9">
        @for (s of sections(); track s.id) {
          <section [id]="s.id">
            <h2>{{ s.title }}</h2>
            <p>{{ s.body }}</p>
          </section>
        }
      </article>
    </div>
  `,
})
export class Guide {
  readonly sections = input.required<readonly { id: string; title: string; body: string }[]>();
  protected readonly current = signal<string | null>(null);
}
```

```scss
// The application's global stylesheet, after the consumer's Foundation imports and includes (foundation-menu among them)
@import 'ngx-foundation-sites';
@include nfs-smooth-scroll; // optional: smooth native jumps (before hydration, hydrate never)

// A sticky top bar of 3.5rem: jumps stop below it, and Magellan's Activation line moves down with it
// (required for WCAG 2.2 2.4.11 Focus Not Obscured whenever a bar is sticky)
html {
  scroll-padding-top: 3.5rem;
}
```

A top bar menu with deep linking, and application-wide defaults:

```ts
export const appConfig: ApplicationConfig = {
  providers: [{ provide: nfsMagellanDefaultsToken, useValue: { threshold: 80 } }],
};

@Component({
  selector: 'app-landing',
  imports: [NfsMagellan],
  template: `
    <div class="top-bar">
      <div class="top-bar-right">
        <nav aria-label="Sections">
          <ul class="menu" nfsMagellan deepLinking>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>
      </div>
    </div>
    <section id="features">...</section>
    <section id="pricing">...</section>
    <section id="faq">...</section>
  `,
})
export class Landing {}
```

A "Jump to section" select for small screens, sharing the state two ways, with focus moved on purpose:

```ts
@Component({
  selector: 'app-docs',
  imports: [NfsMagellan],
  template: `
    <label class="hide-for-large">
      Jump to section
      <select [value]="current() ?? ''" (change)="jump(toc, $any($event.target).value)">
        @for (s of sections; track s.id) {
          <option [value]="s.id">{{ s.title }}</option>
        }
      </select>
    </label>
    <nav class="show-for-large" aria-label="On this page">
      <ul class="vertical menu" nfsMagellan #toc="nfsMagellan" [(active)]="current">
        @for (s of sections; track s.id) {
          <li><a [href]="'#' + s.id">{{ s.title }}</a></li>
        }
      </ul>
    </nav>
    <!-- sections omitted -->
  `,
})
export class Docs {
  protected readonly sections = [
    { id: 'install', title: 'Install' },
    { id: 'configure', title: 'Configure' },
  ];
  protected readonly current = signal<string | null>(null);

  protected jump(toc: NfsMagellan, id: string): void {
    toc.scrollTo(id); // scrolls, marks, and moves focus into the section (2.4.3); current() follows through [(active)]
  }
}
```

Binding `[(active)]` alone to the select (`(change)="current.set(...)"`) also scrolls, but leaves focus on the select, which suits a control the user keeps using and not a navigation.

With the Router (base href safe hrefs; both link kinds in one menu):

```ts
@Component({
  selector: 'app-install-guide',
  imports: [NfsMagellan, RouterLink],
  template: `
    <nav aria-label="On this page">
      <ul class="vertical menu" nfsMagellan deepLinking>
        <li><a [href]="path + '#requirements'">Requirements</a></li>
        <li><a routerLink="." fragment="configure">Configure</a></li>
      </ul>
    </nav>
    <section id="requirements">...</section>
    <section id="configure" tabindex="-1">...</section>
  `,
})
export class InstallGuide {
  readonly #location = inject(Location);
  protected readonly path = this.#location.prepareExternalUrl(this.#location.path());
}
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This Plugin relies on no Foundation Export mixin of its own (Foundation ships no Magellan Sass); its marker is drawn by `foundation-menu`, which the consumer includes for the Menu itself (`.menu .is-active > a` through `menu-state-active`, reading `$menu-item-background-active`, `$menu-item-color-active`, and `$menu-item-color-alt-active`). No library CSS; there is no `nfs-magellan` mixin.

1. Rules: none. The only reason a rule would be needed, a marker on the link inside a Menu, is avoided by also placing `.is-active` on the list item, where Foundation's Menu already styles it.
2. Reused Foundation settings, mixins, functions: `foundation-menu` and the three menu active settings above, from the consumer's compile. For WCAG 2.2 AA with changed settings: `$menu-item-background-active` must keep at least 3:1 against the menu's background (1.4.11), and the text color `color-pick-contrast` picks must keep at least 4.5:1 (1.4.3); Foundation's defaults give 4.65:1 for both on `$white` and 3.76:1 against the default Top Bar. Inside a `.top-bar`, the unmarked links (`$anchor-color`) are 3.76:1 against Foundation's default `$topbar-background` (`$light-gray`) and fail 1.4.3, so the consumer must set a bar background on which `$anchor-color` reaches 4.5:1, for example `$topbar-background: $white;` (4.65:1), or a darker `$anchor-color`. The Storybook preview's settings file carries that override, commented with its criterion (1.4.3 `color-contrast`, `magellan--sticky-top-bar`); it is the same line the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md) adds for its Top Bar story, so the shared preview needs it once.
3. Custom properties: none.
4. Motion classes: none; scrolling is browser-owned through `NfsSmoothScroll`, whose opt-in `nfs-smooth-scroll` mixin gates native smooth jumps under `prefers-reduced-motion: no-preference`.
5. Missing include: without `foundation-menu`, the list item's `.is-active` paints nothing (the Menu itself is unstyled too); `aria-current` and the link's `.is-active` are unaffected. Without the consumer's `scroll-padding-top` under a sticky bar, jumps end under the bar and sections become current late.

### Platform features to adopt when the browser target moves

- `scrollend` (Baseline newly available 2025-12-12, Safari 26.2): replaces the 100 ms idle timer for ending the transition and for the backstop recomputation.
- Scroll-driven animations (`animation-timeline: scroll()` and `view()`, no Firefox release): a reading-progress indicator per section, or progress styling of the current link, in CSS.
- The Navigation API (outside the target): deep-link writes and fragment traversals could go through `navigation.navigate` and its events, in step with a Router that integrates it.

### Foundation behaviour changed or dropped

- Window `scroll` events debounced through Triggers, and `points[]` from `offset().top`: replaced by an `IntersectionObserver` band on the real scroll container, recomputed from live rectangles, with a scroll-idle backstop.
- Document-wide `$('[data-magellan-target]')` with its duplicated id: sections are found from the links' fragments; the attribute is ignored.
- `.is-active` on the link only: now also on the list item, so Foundation's Menu shows it; `aria-current` added.
- Direction-dependent threshold (the threshold applied twice when scrolling up): dropped; one line per section.
- `offset` and `threshold / 2` in the scroll position: CSS `scroll-padding-top` and `scroll-margin-top`, also used for the Activation line.
- `animationDuration`, `animationEasing`, jQuery `animate()`, the animation callback: browser-owned smooth scrolling through `NfsSmoothScroll`; the transition ends on scroll idle.
- No focus move after a click: focus now moves to the section (composed Smooth Scroll).
- `prefers-reduced-motion` ignored: now honoured.
- `replaceState({}, ...)` and `pushState({}, ...)`: `history.state` is passed through; the URL keeps the path and query.
- `$(window).one('load')` deep-link scroll that never ran when the document had already loaded: the fragment is read in the first render callback.
- `hashchange` listener: dropped; native fragment navigation and traversal already scroll.
- `calcPoints()`, `reflow()`: dropped; layout changes are observed.
- The generated container id and `data-resize`/`data-scroll` attributes: dropped.
- `destroy()` trying to strip the hash (a no-op string call in Foundation): Magellan leaves the URL alone on destroy.
