# Spec: Smooth Scroll

Ticket: [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

A developer building a long page on Foundation for Sites (a documentation page, a landing page with a section menu, a table of contents beside an article) wants in-page links that glide to their section instead of jumping, stop below a sticky top bar, and leave keyboard and screen reader users where they can see. Foundation's SmoothScroll Plugin does the glide with jQuery `animate()` on `html, body`, and in doing so it:

- cancels the native fragment navigation, so focus stays on the link: the next Tab starts from the menu, not from the section the user now sees;
- ignores `prefers-reduced-motion`, so users who asked for less motion still get a 500 ms animated scroll;
- computes the stopping point in JavaScript (`offset` plus half of `threshold`), which does not work before the script runs and does not reach nested scroll containers;
- accepts any jQuery selector as a target and generates an id on its container that nothing uses.

An Angular application adds three problems Foundation never had:

- Every Angular CLI application has `<base href="/">`. A Foundation-style `href="#first"` resolves against the base URL, so on any route other than the root it is a cross-document navigation to the home page whenever no script handles it: before hydration, inside `@defer (hydrate never)`, for crawlers, and on middle-click.
- In an application that uses the Router with `scrollPositionRestoration` set to `'enabled'` or `'top'`, a native fragment navigation fires `popstate`; the Router answers it with a navigation of its own whose scroll event restores a stored position or the top of the page, undoing the jump.
- Whatever the Angular layer does must be right in server HTML, must not break hydration, and must behave predictably for clicks that happen before hydration, inside dehydrated `@defer (hydrate on ...)` blocks, and inside `@defer (hydrate never)` blocks.

## Solution

One attribute directive, `nfsSmoothScroll`, placed exactly where Foundation places `data-smooth-scroll`: on a container of in-page links (Foundation's Menu) or on one link. It has one `click` host listener. For an unmodified primary click on an in-page link whose target exists, it scrolls the target into view with `scrollIntoView` (smooth, or instant when the user prefers reduced motion), moves focus to the target (adding `tabindex="-1"` for the duration of that focus when the target is not focusable), and calls `preventDefault()` as its last statement. It does not change the URL, as Foundation's Plugin did not, so no `popstate` reaches the Router. Its public `scrollTo(target)` method is the same behaviour for code, and it is what the Magellan spec reuses.

Everything else is the platform and CSS, so it holds before the directive exists in the browser:

- The stopping point is CSS: `scroll-padding-top` on the scroll container (one rule for a sticky bar, and required whenever the page has a sticky or fixed bar, so focused content is never hidden under it, WCAG 2.2 2.4.11) or `scroll-margin-top` on a target. Both are honoured by `scrollIntoView` and by native fragment navigation alike, so the offset is the same before hydration, after hydration, and inside nested scroll containers.
- Smoothness for native jumps (clicks before hydration, links inside `hydrate never`, Router-owned fragment links) is the library's opt-in `nfs-smooth-scroll` Library mixin: `scroll-behavior: smooth` on the scroll container, inside `@media (prefers-reduced-motion: no-preference)`.
- Duration and easing belong to the browser; Foundation's `animationDuration` and `animationEasing` have no counterpart.

What earns the directive a place, stated plainly: for a page without the Router's scroll restoration, the CSS alone (same-document `href`s, the mixin, and a scroll offset) already gives smooth, offset, reduced-motion-aware jumps with the platform's focus handling, and Further Notes gives that listener-free recipe. The directive earns its place with four things the CSS cannot do: it keeps in-page links from turning into Router navigations (no `popstate`, no history entry), it moves focus to targets that are not focusable, it gives Foundation's `href="#id"` markup the in-page behaviour after hydration, and it gives Magellan and application code one programmatic `scrollTo` with the same reduced-motion and focus rules.

## User Stories

1. As an application developer, I want to put `nfsSmoothScroll` on a Foundation Menu of `#section` links, so that every link in it scrolls smoothly to its section, as `data-smooth-scroll` did.
2. As an application developer, I want to put `nfsSmoothScroll` on a single in-page link, so that one "back to the form" link glides without wrapping it in a container.
3. As an application developer, I want links added later inside the container (by `@for` or `@if`) to be handled too, so that generated tables of contents need nothing extra.
4. As a keyboard user, I want focus to land on the section I scrolled to, so that the next Tab continues inside that section and not back in the menu.
5. As a screen reader user, I want the reading position to move to the target section after activating an in-page link, so that I hear the section, not the menu again.
6. As a user who prefers reduced motion, I want in-page links to jump instantly, so that the page does not animate against my system setting.
7. As a user who changes the reduced-motion setting while the page is open, I want the next click to follow the new setting, so that I do not have to reload.
8. As an application developer with a sticky top bar, I want targets to stop below the bar by writing one `scroll-padding-top` rule, so that headings are never hidden under it.
9. As an application developer, I want a per-target `scroll-margin-top`, so that one section can stop at a different distance.
10. As an application developer, I want the same offset to apply whether the jump is native or handled by the directive, so that the landing position never depends on whether the page has hydrated.
11. As an application developer, I want in-page links inside a scrollable panel (an `overflow: auto` sidebar or content area) to scroll that panel, so that smooth scrolling is not limited to the page.
12. As a user, I want Ctrl-click, middle-click, Shift-click, and "open in new tab" to keep their native meaning, so that the directive never swallows a browser gesture.
13. As an application developer, I want links to other pages, links with a `target`, and download links inside the container to behave natively, so that one directive on a whole menu is safe.
14. As an application developer, I want a link whose target does not exist to fall back to the browser's behaviour, so that a missing id never breaks the link.
15. As an application developer, I want a development-mode warning when a link's target id does not exist, so that I catch typos.
16. As an application developer on the Router, I want a development-mode warning when an `href="#id"` resolves to another document through `<base href>`, so that I learn that the link breaks before hydration and on middle-click.
17. As an application developer on the Router, I want Foundation's `href="#id"` markup to scroll in place after hydration, so that copied Foundation markup does not send users to the home page from a deep route.
18. As an application developer on the Router with `scrollPositionRestoration: 'enabled'`, I want in-page links handled by the directive not to reach the Router, so that the Router does not scroll the page back to a stored position.
19. As an application developer on the Router, I want `routerLink` links with a `fragment` inside an `nfsSmoothScroll` container to stay Router navigations, so that the Router's anchor scrolling and my link-level listeners keep ownership of their clicks.
20. As an application developer, I want the URL to stay unchanged after a directive-handled jump, so that the back button does not step through sections and the Router's state stays in step with the address bar.
21. As an application developer, I want to call `scrollTo('first')` or `scrollTo(element)` from code, so that my own features (a "next section" button, jumping to the first form error) scroll with the same rules.
22. As an application developer, I want `scrollTo` to return `false` when the target does not exist, so that I can react without try and catch.
23. As an application developer, I want to opt out of the focus move for a programmatic scroll, so that a scroll that is not user navigation does not steal focus.
24. As the Magellan spec author, I want to compose `NfsSmoothScroll` as a host directive and call its `scrollTo`, so that Magellan's link clicks scroll, focus, and respect reduced motion exactly as Smooth Scroll does.
25. As an application developer, I want `href="#"` and `href="#top"` (with no element of that id) to scroll to the top of the page, so that "back to top" links behave as the platform defines.
26. As a developer of a server-rendered application, I want the server HTML to be my markup unchanged, so that the first paint is correct and hydration changes nothing.
27. As a developer of a server-rendered application, I want an in-page link clicked before hydration to jump natively (smoothly, when I include the mixin) and land at the same offset, so that early users get working links.
28. As a developer of a server-rendered application, I want that early click to be replayed harmlessly after hydration, so that focus ends on the target and nothing scrolls twice visibly.
29. As a developer using incremental hydration, I want an in-page link inside a dehydrated block to scroll to its target, so that deferring a region never breaks its links.
30. As a developer using `@defer (hydrate never)`, I want in-page links there to keep working as native links, so that static regions need no JavaScript.
31. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
32. As a developer of a zoneless application, I want the directive to need no zone and hold no state, so that it works with zoneless change detection.
33. As an application developer, I want the smooth-scroll CSS to be one opt-in include, so that I decide whether my page's root scroller animates programmatic scrolls.
34. As an application developer on the Router, I want the docs to tell me how the Router's `withInMemoryScrolling`, `ViewportScroller.setOffset`, and the mixin interact, so that I configure both without surprises.
35. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it with the rest of the deferred content.
36. As a library maintainer, I want the behaviour asserted through scroll position, focus, the URL, and history length in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

From Foundation 6.9's `SmoothScroll.defaults`, its source, and its docs page (the Foundation inventory research, SmoothScroll section):

| Feature | Foundation | Library |
| --- | --- | --- |
| Activation | `data-smooth-scroll` on a container (delegated to `a[href^="#"]`) or on one `a[href^="#"]` | `nfsSmoothScroll` on a container or on one link |
| Scroll | `$('html, body').stop(true).animate({scrollTop})` to `offset().top - threshold / 2 - offset` | `scrollIntoView({behavior, block: 'start', inline: 'nearest'})`, the same parameters HTML uses when it scrolls to a fragment; the stopping point comes from CSS |
| Click handling | `preventDefault()` after starting the animation; no focus move; URL unchanged | `scrollTo` (scroll and focus), then `preventDefault()` last; URL unchanged |
| Static method | `SmoothScroll.scrollToLoc(loc, options, callback)`: `loc` is any jQuery selector; returns `false` when nothing matches; the callback runs when the animation ends | Instance method `scrollTo(target, options?)`: a fragment or an `Element`; returns `false` when nothing matches; no callback (native smooth scrolling reports no end inside the Browser target) |
| Container id | Own `id` or a generated `smooth-scroll` id | Dropped: nothing references it |
| Events | `init.zf.smooth-scroll`, `destroyed.zf.smooth-scroll` only | None (Angular lifecycle) |
| Sass | None | The opt-in `nfs-smooth-scroll` Library mixin (Further Notes, Sass) |

Options, each mapped or dropped:

| Option | Foundation default | Library | Reason |
| --- | --- | --- | --- |
| `animationDuration` | `500` (ms) | Dropped option | Native smooth scrolling has no duration control; the browser owns it (building-blocks 1.4 timing options) |
| `animationEasing` | `'linear'` (`'swing'` allowed) | Dropped option | Same: the easing is browser-defined |
| `offset` | `0` (px) | CSS: `scroll-padding-top` on the scroll container, or `scroll-margin-top` on the target | CSS applies to native fragment navigation and to `scrollIntoView` alike, so the landing point is identical before and after hydration and in nested scroll containers; a JavaScript offset would exist only after hydration and only for the viewport |
| `threshold` | `50` (px; SmoothScroll uses half of it as extra gap) | Folded into the same CSS value | For SmoothScroll it is only more offset (`threshold / 2` above the target); Magellan's other use of `threshold` (the activation line) belongs to the Magellan spec |

Foundation's defaults therefore stop a target 25 px below the viewport top; a consumer who wants that exact look writes `scroll-margin-top: 25px` (plus any bar height). The library default is 0, the platform's.

### CSS class to Angular mapping

None. SmoothScroll has no Structural class, no State class, no Variant class, and no Sass in Foundation; the Plugin is a behaviour on consumer markup (typically Foundation's `.menu`, whose classes stay the consumer's). The directive binds no class. Per building-blocks 1.3 the class is named after the Plugin: `NfsSmoothScroll`.

### Hierarchy and DI shape

```
[nfsSmoothScroll]                 NfsSmoothScroll on a container of in-page links
a[href][nfsSmoothScroll]          NfsSmoothScroll on one link (same class)
```

- One directive class, one selector (`[nfsSmoothScroll]`); whether it acts as a link host or a container host is decided once at construction from the host tag (`a` or not). Two classes would give two imports for one behaviour.
- No parent, no children, no Parent token, no providers, no host directives. Links are found by event delegation at click time, not registered, so links created by `@for`, `@if`, or a deferred block are handled with no bookkeeping.
- No Defaults token. Foundation's four Options are either browser-owned or CSS, so there is nothing a Defaults token could hold.
- Injection: `ElementRef` (the host), `DOCUMENT`, `NfsMediaQuery` (the Breakpoint service, for `reducedMotion` exactly as its spec defines it), and CDK `InteractivityChecker` (to decide whether a target is focusable). Nothing from `@angular/router`: the directive does not depend on the Router.
- Designed to be hosted: Magellan (and any consumer component) may list `NfsSmoothScroll` in `hostDirectives` and reach it with `inject(NfsSmoothScroll)`; the composed host then gets the same click handling and the `scrollTo` method.
- Entry point: `ngx-foundation-sites/smooth-scroll`, per building-blocks 1.3.

### API: `NfsSmoothScroll`

Selector `[nfsSmoothScroll]`; `exportAs: 'nfsSmoothScroll'`; standalone; no template.

```ts
class NfsSmoothScroll {
  /** Scrolls the target into view (instant under reduced motion) and, unless focus is false, focuses it. */
  scrollTo(target: Element | string, options?: { focus?: boolean }): boolean;
}
```

- Inputs: none. Every Foundation Option is browser-owned or CSS (Foundation contract above). The attribute takes no value; `nfsSmoothScroll=""` is the whole API in templates.
- Models, outputs: none. Foundation fires no plugin event, and a completion output would need `scrollend`, which is outside the Browser target (Further Notes).
- Method `scrollTo(target, options?)`:
  - `target` is an `Element` or a fragment string, with or without its leading `#`. A string resolves like HTML's indicated part: the element whose `id` equals the percent-decoded fragment, otherwise the first `a` element whose `name` equals it; an empty fragment, or `top` (ASCII case-insensitive) with no such element, means the top of the document.
  - Returns `false`, and does nothing, when no element matches. Returns `true` after it has started the scroll.
  - Scrolls with `target.scrollIntoView({behavior, block: 'start', inline: 'nearest'})`, where `behavior` is `'instant'` while `reducedMotion()` is `true` and `'smooth'` otherwise; the top of the document scrolls the document's scrolling element to 0 with the same `behavior`.
  - Focus (`options.focus`, default `true`; never for the top of the document, where HTML moves no focus either): if the target is not focusable (`InteractivityChecker.isFocusable`), it sets `tabindex="-1"` on it and removes that attribute again on the target's next `blur`; then it calls `target.focus({preventScroll: true})`, so the focus call neither jumps nor cancels the smooth scroll (the reason Angular's `ViewportScroller` uses the same flag).
  - Browser-only, like `focus()`: call it from an event handler or a render callback, never during server rendering.

Click handling (the `click` host listener), in this order:

1. Find the link: the host itself on a link host; on a container host, the nearest `a[href]` ancestor-or-self of the event target inside the host. Ignore the click unless it is a primary click (`button === 0`) with no modifier key, and the link has no `download` attribute and no `target` other than `_self`.
2. Container host only: ignore a click whose `defaultPrevented` is already `true`. A link-level listener (a `routerLink`, a consumer handler, a nested `nfsSmoothScroll` link host) owns that click.
3. Decide whether the link is in-page: its raw `href` attribute starts with `#`, or its resolved URL equals the document URL apart from the fragment and has a non-empty fragment. Otherwise ignore it (a native navigation follows).
4. Resolve the target as `scrollTo` does. If none matches, ignore the click: the native default happens, as it would with no directive (and a development-mode warning names the missing id once per link).
5. Call `scrollTo(target)`.
6. Last statement: call `event.preventDefault()` unless `event.defaultPrevented` is already `true`.

Why this order: every state change comes before `preventDefault()` (building-blocks 1.5 and 1.11 decision 5), and step 6's guard means a replayed click whose native default was already cancelled by Angular's dispatcher never calls the throwing `preventDefault()` of a replayed event (Rendering modes below). Why the link host skips step 2: on a link host the directive is the link's owner, and inside a dehydrated block Angular's dispatcher has already cancelled the native jump (so `defaultPrevented` is `true`) before the replayed click reaches the handler; skipping the click then would lose it.

Development-mode checks (only when `ngDevMode` is on, never on the server, never in production), in one `afterNextRender` read over the link host or the container's `a[href^="#"]` descendants at first render, and at click time for missing targets:

- An `href` that starts with `#` but resolves to a different document (the `<base href>` case): "this link leaves the page before hydration, in `hydrate never`, and on middle-click; bind the full path (`routerLink` with `fragment`, or an `href` that includes the current path)". Once per link.
- A handled link whose fragment names no element: "no element with id '<id>'". Once per link.
- A link host that is not an `a` element and contains no link: "nfsSmoothScroll on <tag> has no in-page links". Once.

### Implementation level and primitives

Implementation level: native platform. The scroll is `scrollIntoView` with options, the offset is `scroll-margin`/`scroll-padding`, smoothness is `scroll-behavior` and the `behavior` option, the motion preference is `prefers-reduced-motion`, all Baseline widely available before 2026-05-07 (the platform research, sections 9 and 18: `scrollIntoView` with `behavior` in Chromium 61, Gecko 36, WebKit 15.4 for smooth; `scroll-behavior` widely available 2024-09-14; `scroll-margin`/`scroll-padding` since 2021). The `'instant'` value of `behavior` has no separate compat entry in browser-compat-data (it sits under `options.behavior`, Safari 14), and Angular 22.2's own Router scroller passes `{behavior: 'instant'}` to the same browser set. `@angular/aria` has no link or scroll pattern; from `@angular/cdk` only `InteractivityChecker` is used (building-blocks 1.2), and CDK's `ScrollDispatcher`/`CdkScrollable` solve scroll tracking, not in-page navigation. The Angular layer is one host listener, one method, and one injected signal read; no state, no `computed`, no `effect`, no timer, no observer.

Fallback: none needed for the scroll itself. The listener-free recipe (Further Notes) is the documented alternative for consumers who do not want the directive, not a fallback. One source-derived behaviour needs running code to confirm (the Router's reaction to native fragment jumps, [Prototype needed in the ticket](../issues/29-spec-smooth-scroll.md)); the directive's own behaviour does not depend on it.

### Comparison with the Router and Material

Material has no counterpart: it ships no in-page navigation component, building-blocks Table B lists "Nothing" as the Material counterpart, and the Material reference research covers none. The Router's in-memory scrolling is the neighbour, and the two coexist:

| Concern | Router: `withInMemoryScrolling({anchorScrolling: 'enabled'})` with `routerLink` + `fragment` | `NfsSmoothScroll` |
| --- | --- | --- |
| What handles the click | `RouterLink`'s host listener; a Router navigation to the same route with a new fragment | The directive's host listener; no navigation |
| URL and history | URL gets the fragment through the Router (a history entry unless `replaceUrl`) | Unchanged |
| Scroll | `ViewportScroller.scrollToAnchor`: `window.scrollTo` to a computed position, after the navigation ends plus a macrotask or frame; viewport only | `scrollIntoView`; every ancestor scroll container |
| Offset | `ViewportScroller.setOffset([x, y])` (the `scrollOffset` option exists only on `RouterModule.forRoot`); CSS `scroll-margin`/`scroll-padding` is ignored by `window.scrollTo` | CSS `scroll-margin-top` / `scroll-padding-top` |
| Smoothness | No `behavior` passed for anchors, so the root's CSS `scroll-behavior` decides (the `nfs-smooth-scroll` mixin makes it smooth) | Explicit `behavior` from `reducedMotion` |
| Reduced motion | Only through the gated CSS | `reducedMotion` signal and the gated CSS |
| Focus | `focus({preventScroll: true})`, which does nothing on a target that is not focusable | Adds `tabindex="-1"` for the focus when needed |
| Pre-hydration | Server-rendered `href` includes the route path, so a click is a native same-document jump | Same, given a same-document `href` |
| Cross-page (`/guide#install` from another route) | Yes | No (in-page only) |

The rule for applications that use both:

1. A link is owned by exactly one of them. `routerLink` links (with `fragment`) belong to the Router; plain same-document links inside an `nfsSmoothScroll` container belong to the directive. The container yields to any click a link-level listener already cancelled, which is what `RouterLink` does (it returns `false` from its handler for `<a>`), so both kinds may sit in one menu. `nfsSmoothScroll` is not placed on an element that also carries `routerLink`: both would handle the click.
2. When the Router owns fragment links, enable `anchorScrolling`, set `ViewportScroller.setOffset` to the same distance as the CSS offset (the Router ignores `scroll-margin` and `scroll-padding`), and give targets `tabindex="-1"` if they are not focusable.
3. `scrollPositionRestoration` other than `'disabled'`: in-page links not handled by the directive (links outside any `nfsSmoothScroll`, links inside `hydrate never`, container-hosted links clicked inside a still-dehydrated block) jump natively after hydration, the browser fires `popstate`, and, reading the Router 22.2 source, the Router's popstate navigation emits a `Scroll` event with the position stored for navigation id 0 (the scroll position at bootstrap), which restores it (`'enabled'`) or scrolls to the top (`'top'`). Keep such links inside an `nfsSmoothScroll` (as link hosts inside deferred regions), or keep scroll restoration disabled on those pages. The exact outcome, including the order against a replayed click, is the ticket's Prototype needed; the e2e suite guards it.
4. The `nfs-smooth-scroll` mixin on `html` also makes the Router's forward-navigation `scrollToPosition([0, 0])` (called without a `behavior`) animate to the top on every route change when `scrollPositionRestoration` is on; Angular passes `'instant'` only for restored positions. Router applications with scroll restoration either accept that, or include the mixin with a scroller other than `html`, or skip it and rely on the directive's explicit smoothness.

### ARIA and keyboard

APG pattern: none; the Link pattern applies to the links and nothing is added to them. The APG research records the rule this spec implements: when script intercepts an in-page link to animate the scroll, it must still move focus to the target.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| In-page link | Native `a[href]`, implicit role `link`; the directive adds no attribute | APG Link pattern ("Authors are strongly encouraged to use a native host language link element") |
| Container | The consumer's element and landmark (`nav` with `aria-label` when the page has several navigation landmarks; Foundation's `ul.menu`) | APG landmark practice |
| Target | The consumer's element with a consumer-supplied `id`; gets `tabindex="-1"` only while the directive's focus is on it, when it is not focusable itself | WHATWG HTML scroll-to-the-fragment runs the focusing steps for the target; APG keyboard practice (focus persistence) |
| Target naming | Not named by the library; a `section` becomes a `region` landmark only if the consumer names it, and should only when it is meant as a landmark | APG Magellan and landmark notes |
| Current section | Not tracked here; `aria-current` is Magellan's | Magellan spec |

| Key | On an in-page link | Owner |
| --- | --- | --- |
| Enter | Activates the link; the directive scrolls, focuses the target, and cancels the native jump (without the directive, the native jump does the same through the browser) | Native activation; directive click handler |
| Space | Scrolls the page (native link behaviour); the directive does nothing | Native |
| Tab after activation | Moves into the target section, because focus is on the target | Directive focus move; native starting point otherwise |
| Shift, Ctrl, Meta, Alt + Enter or click | Native (new window, new tab, download); the directive ignores modified clicks | Native |

WCAG 2.2 AA requirements (each a requirement of the directive or of the documented consumer markup, not a recommendation; axe cannot see most of them, so the play functions and e2e assert them directly):

| Criterion | How it holds | What fails it, and the fix |
| --- | --- | --- |
| 2.1.1 Keyboard (A) | Native links: Enter activates; the directive handles the resulting `click`, so keyboard and pointer take the same path | Nothing in Foundation fails it; `href="#"` triggers are written as buttons (building-blocks 1.10) |
| 2.4.1 Bypass Blocks (A) | A "skip to content" link with `nfsSmoothScroll` scrolls to and focuses the main content | None |
| 2.4.3 Focus Order (A) | Focus moves with the scroll: the target receives focus as the scroll starts, so the next Tab continues inside the section the user now sees; native jumps before hydration run HTML's focusing steps and move the sequential focus navigation starting point to the target | Foundation's Plugin kept focus on the link (fails); fixed by the focus move (D7) |
| 2.4.7 Focus Visible (AA) | Foundation removes outlines only under `[data-whatinput='mouse']` (the `disable-mouse-outline` mixin), which never matches because the library does not load what-input, so the browser's `:focus-visible` ring shows on a keyboard-initiated focus of the target | A consumer rule removing outlines from sections fails it; the spec's stories assert a visible indicator after Enter |
| 2.4.11 Focus Not Obscured (Minimum) (AA) | With a sticky or fixed bar, `scroll-padding-top` equal to at least the bar's height on the scroll container is required markup: it places the scrolled target, and every element focused afterwards by Tab (focus-driven scrolling honours `scroll-padding` as well), below the bar | Foundation's default (`offset: 0`, and no CSS) lets a Sticky top bar cover the target and the next focused link; Foundation has no setting for the bar height, so the smallest rule is the consumer's `html { scroll-padding-top: <bar height>; }` (or on the scroll container), shown in the usage examples; `scroll-margin-top` alone fixes only the jump, not later Tab moves |
| 2.3.3 Animation from Interactions (AAA, honoured anyway) | `'instant'` under `reducedMotion`; the mixin's rule exists only under `prefers-reduced-motion: no-preference` | Foundation's Plugin ignored the preference |
| 2.2.2 Pause, Stop, Hide (A) | Not applicable: a smooth scroll is user-initiated and ends on its own | None |

Focus rules: focus lands on the target at the start of the scroll, with `preventScroll` so the focus neither jumps nor cancels the smooth scroll; the top of the document moves no focus (as in HTML); a programmatic `scrollTo` with `focus: false` moves none; the temporary `tabindex="-1"` is removed on the target's next `blur`, so later pointer clicks inside the section do not focus the whole section.

### Rendered HTML

Consumer markup and the resulting DOM. The directive has no host bindings, so the server HTML is the consumer's markup plus the `jsaction` attribute Angular's hydration annotation adds for the `click` listener; after hydration Angular removes `jsaction` and the DOM is the consumer's markup again.

```html
<!-- Container (Foundation's Menu) -->
<nav aria-label="On this page">
  <ul class="menu" nfsSmoothScroll>
    <li><a href="#first">First Arrival</a></li>
    <li><a href="#second">Second Arrival</a></li>
  </ul>
</nav>
<section id="first">...</section>
<section id="second">...</section>

<!-- Server HTML (SSR and prerender) -->
<nav aria-label="On this page">
  <ul class="menu" jsaction="click:;">
    <li><a href="#first">First Arrival</a></li>
    <li><a href="#second">Second Arrival</a></li>
  </ul>
</nav>

<!-- Hydrated DOM: the consumer's markup, no library attributes -->
<ul class="menu">...</ul>

<!-- One link -->
<a href="#exclusive" nfsSmoothScroll>Exclusive Section</a>
<!-- Server HTML -->
<a href="#exclusive" jsaction="click:;">Exclusive Section</a>

<!-- A non-focusable target while the directive's focus is on it -->
<section id="first" tabindex="-1">...</section>
<!-- ... and after focus leaves it -->
<section id="first">...</section>

<!-- Router application: same-document hrefs (base href safe) -->
<ul class="menu" nfsSmoothScroll>
  <li><a href="/guide/install#first">First Arrival</a></li>      <!-- directive-owned -->
  <li><a routerLink="." fragment="second">Second Arrival</a></li> <!-- Router-owned -->
</ul>
<!-- Server HTML: RouterLink renders href="/guide/install#second"; the RouterLink host carries its own jsaction -->
```

In an application with `<base href="/">`, `href="#first"` on the route `/guide/install` resolves to `/#first`; it is in-page only for the directive after hydration, and the development-mode check warns about it. The attribute order in server HTML is not significant.

### Animation

- Smooth scrolling is browser-owned: `scrollIntoView` with `behavior: 'smooth'` for directive jumps, CSS `scroll-behavior: smooth` for native jumps when the consumer includes `nfs-smooth-scroll`. There is no library timing, no State class, no Motion class, no `animate.enter`/`animate.leave`, and no Completion output (ADR 0003 has nothing to govern here).
- Reduced motion: the directive reads `NfsMediaQuery.reducedMotion` at the moment of each scroll (the Breakpoint service's live signal, `false` on the server and before the service goes live, which no click can precede) and passes `'instant'` while it is `true`. The mixin emits its rule only inside `@media (prefers-reduced-motion: no-preference)`, so native jumps are instant under `reduce` too. Building-blocks 1.6 rule 5's 1 ms override does not apply: no library code waits for a scroll to finish.
- No completion signal: native smooth scrolling reports its end only through `scrollend`, which is outside the Browser target (Safari 26.2). Consumers that need "scrolling settled" (Magellan's transition flag) use the Magellan spec's IntersectionObserver settling. The instant jump under reduced motion also means Sticky's sentinels see an instantaneous jump; the Sticky prototype's scroll-listener backstop covers that.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the directive renders nothing and reads nothing (rule 1). Server HTML is the consumer's markup plus `jsaction="click:;"` on the host. First paint is plain Foundation markup, correct without JavaScript as long as the `href`s resolve to the current document.
- Before hydration: nothing runs (rules 3 to 5). The early event contract does not cancel the click, so the browser performs a native fragment navigation: `scroll-behavior` from the mixin (smooth unless `reduce`), the CSS offset, the platform's focus handling (it focuses a focusable target and otherwise moves the sequential focus navigation starting point to it), and a new history entry with the fragment. The Router, not yet bootstrapped, sees no `popstate`. After hydration the queued click is replayed: the handler scrolls to the same target (already in view, so nothing visible moves), focuses it, and then calls `preventDefault()`, which throws during replay; Angular reports the error to `ErrorHandler`. This is the building-blocks rule for replayed events (state first, `preventDefault()` last, accept the logged error), decided at triage on 2026-09-26 (impact not HIGH, confidence HIGH; see the building-blocks ticket's triage). A later replay check would only add a guard that skips `preventDefault()` on replay; nothing else would change.
- Full hydration: there are no host bindings, so hydration changes nothing and there is no structure to mismatch; no `ngSkipHydration` (rule 10).
- Incremental hydration, link host inside a dehydrated block: the host `<a>` carries `jsaction`, so Angular's dispatcher cancels the native jump, hydrates the block, and replays the click. The handler (which skips step 2 on a link host) scrolls and focuses; `defaultPrevented` is already `true`, so it does not call `preventDefault()` and no error is logged. The scroll waits for the block to hydrate, including any chunk download; no `popstate`, so no Router interference.
- Incremental hydration, container host inside a dehydrated block: the `jsaction` sits on the container, not on the `<a>`, so the dispatcher does not cancel: the browser jumps natively at once, the click hydrates the block and is replayed as in the full-hydration case (scroll no-op, focus, logged `preventDefault()` error). Because the app is already hydrated, the native jump's `popstate` reaches the Router (Comparison, rule 3).
- A plain in-page link with no directive that is a root node of a `@defer (hydrate on interaction)` block gets the trigger's `click` `jsaction` and is cancelled by the dispatcher with nothing to replay it to (the Button spec's hazard); consumers wrap such links in an element, or put `nfsSmoothScroll` on them.
- Hydration boundary: the directive and the links it handles belong to one boundary (a container host handles only links that are its DOM descendants). Targets may sit anywhere, including in dehydrated blocks, because their server HTML already carries the ids; a target inside a plain `@defer` block that has not rendered yet does not exist, so the click falls back to the native default. Target ids must be consumer-supplied (building-blocks 1.5): a generated id differs between server and client.
- `@defer`: library templates contain no `@defer`; the directive is its own entry point, so a consumer can defer it with the region. Inside `@defer (hydrate never)` nothing is annotated: links jump natively, smoothly with the mixin, with the CSS offset (the residue building-blocks 1.11 decision 7 lists for SmoothScroll), and after hydration of the rest of the app those jumps reach the Router as `popstate` (Comparison, rule 3).
- Zoneless: the handler writes no signal and needs no change detection; no `NgZone`.
- Prerendering: identical to server rendering; no request token is read (rule 11).

## Testing Decisions

A good test asserts what the user observes: where the target lands relative to the viewport or its scroll container, which element has focus, whether Tab continues inside the section, the URL and `history.length`, and whether a click navigated. No test reads the directive's fields. Scroll position assertions poll with a tolerance of 1 px until the position is stable, because smooth scrolling has no completion event in the Browser target. There is no prior art in the new repository; the patterns are the building-blocks testing rule, Angular's own `renderApplication`-based SSR tests, and the Angular Components universal-app e2e.

Story ids follow `smooth-scroll--<story>`: `smooth-scroll--container`, `smooth-scroll--single-link`, `smooth-scroll--sticky-offset`, `smooth-scroll--scroll-container`, `smooth-scroll--focusable-target`, `smooth-scroll--link-filters`, `smooth-scroll--programmatic`, `smooth-scroll--back-to-top`, `smooth-scroll--router-link-fragment` (Router provided in the story).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `runOnly` set to the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), per building-blocks 1.10. Because axe does not test focus order, focus visibility, or obscured focus, the play functions below assert 2.4.3, 2.4.7, and 2.4.11 directly.

- `smooth-scroll--container`: clicking "Second Arrival" brings `#second`'s top to the viewport top (within 1 px once stable); `#second` has focus and carries `tabindex="-1"`; `userEvent.tab()` then reaches the first link inside `#second`; the attribute is gone after that; the story iframe's `location.hash` is unchanged. Enter on a focused link does the same, and after Enter the target matches `:focus-visible` with a non-`none` computed `outline-style` (2.4.3, 2.4.7).
- `smooth-scroll--single-link`: the one link scrolls to `#exclusive` and focuses it; a sibling link without the directive is not handled (its native jump changes `location.hash`).
- `smooth-scroll--sticky-offset`: with `scroll-padding-top: 4rem` on the story's scroller and a sticky `.top-bar`, the target's top lands 4rem below the scroller's top and the heading is not covered by the bar; after Tab moves focus to a link inside the section, that link's rectangle does not intersect the bar's (2.4.11); a second target with `scroll-margin-top` lands at its own distance.
- `smooth-scroll--scroll-container`: links inside an `overflow: auto` panel scroll the panel, not the page.
- `smooth-scroll--focusable-target`: a target that is a focusable element (a heading with the consumer's `tabindex="-1"`, a form field) is focused without the directive adding or removing anything.
- `smooth-scroll--link-filters`: a link to another page, a `target="_blank"` link, and a `download` link are not handled (the story's click spy on a wrapper records `defaultPrevented === false`); a link to a missing id is not handled.
- `smooth-scroll--programmatic`: a story button calls `scrollTo('third')` through the `exportAs` reference and shows `true`; `scrollTo('missing')` shows `false`; `scrollTo(el, {focus: false})` scrolls without moving focus.
- `smooth-scroll--back-to-top`: `href="#top"` and `href="#"` scroll to the top and move no focus.
- `smooth-scroll--router-link-fragment`: in a menu mixing a plain same-document link and a `routerLink` with `fragment`, the plain link is directive-handled (URL unchanged), and the `routerLink` click is left to the Router (the URL gains the fragment through the Router).

### 2. Browser-level test (stack per the [browser testing stack decision](../issues/41-browser-testing-stack-decision.md); stack-neutral)

- Link filter, driven by data: button 1 and 2, each modifier key, `target="_blank"`, `target="_self"`, `download`, a cross-document `href`, a same-document absolute `href`, a `#`-only `href` under a `<base href>` that points elsewhere, an empty fragment, `#top` with and without an element of that id, a percent-encoded fragment, an `a[name]` target. Assert handled or not handled (`defaultPrevented`, scroll position, focus).
- Ownership: on a container host, a click already cancelled by a link-level listener is not handled; on a link host, an already-cancelled click is still scrolled and `preventDefault()` is not called again; nested hosts handle a click once.
- Reduced motion: with an `NfsMediaQuery` test double whose `reducedMotion` is `true`, the target is at its final position in the next frame; switching it to `false` makes the next scroll smooth (position changes over several frames).
- Focus: the temporary `tabindex="-1"` appears only on non-focusable targets and disappears on `blur`; a consumer-written `tabindex` is left untouched.
- Replay-safe handler: dispatch a click whose `eventPhase` reads 101 and whose `preventDefault` throws. With `defaultPrevented` `false` (the full-hydration case), the target is scrolled and focused before the throw, and exactly one error reaches `ErrorHandler`. With `defaultPrevented` `true` on a link host (the dehydrated-block case), the target is scrolled and focused and nothing reaches `ErrorHandler`.
- `hostDirectives` composition: a test component that composes `NfsSmoothScroll` gets the click handling and can call `scrollTo` through `inject(NfsSmoothScroll)`.
- Development-mode checks: each warning fires once for its case and not for correct markup.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture with a container host, a link host, a `routerLink` with `fragment` inside the container, and targets with ids. Assert `whenStable()` resolves; the server HTML equals the fixture markup plus `jsaction="click:;"` on both hosts; no host has any other added attribute; the `routerLink` renders its path-plus-fragment `href`; no `window`, `matchMedia`, or `scrollIntoView` access happens (an `NfsMediaQuery` spy records no live read). Runs in its own file or process because `provideServerRendering()` leaves `ngServerMode` set; whether under `@angular/build:unit-test` or a separate Vitest project is the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).
- Pure logic: the in-page decision and target resolution (raw `href`, resolved URL, document URL, fragment decoding, `top` and empty fragments) is a pure function of strings plus an id lookup; a table-driven test covers it.
- Sass compile (the library's Sass test from ADR 0012): `@include nfs-smooth-scroll;` emits `html { scroll-behavior: smooth; }` inside `@media (prefers-reduced-motion: no-preference)` and nothing else; `@include nfs-smooth-scroll($scroller: '.page-content');` moves the rule to that selector; importing the library without the include emits nothing.

### 4. Playwright e2e

Against the static Storybook build:

- Real key presses in Chromium, Firefox, and WebKit on `smooth-scroll--container`: Enter on a link, then Tab, lands inside the target section in all three engines, and the focused target shows a visible focus indicator (2.4.3, 2.4.7).
- Obscured focus in three engines on `smooth-scroll--sticky-offset`: after Enter on a link and after each following Tab, the focused element's rectangle does not intersect the sticky bar's (2.4.11).
- History API: after a directive-handled click, `location.hash` and `history.length` are unchanged and no `hashchange` or `popstate` fired; after a native jump from a link outside the directive, both changed (the control case).
- Reduced motion: `page.emulateMedia({reducedMotion: 'reduce'})` makes the jump complete within one frame, with and without the directive; `no-preference` makes it take several frames.
- Router coexistence in `smooth-scroll--router-link-fragment` with `scrollPositionRestoration: 'enabled'`: a directive-handled link stays at its target; a native in-page link outside the directive is recorded as ending at the restored position (the regression guard for the Router behaviour in Comparison rule 3 and the ticket's Prototype needed).

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype), served under `<base href="/">` on a nested route:

- JavaScript disabled: screenshot plus axe on the server HTML; a same-document link jumps to its target at the CSS offset; a `#`-only link navigates to the base URL (documents the base-href hazard the dev check warns about).
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- Pre-hydration click with the main bundle delayed: the native jump happens at once; after hydration focus is on the target, the final position equals the target position, and exactly one "`preventDefault` called during event replay" error is logged (the building-blocks replay rule, decided at triage on 2026-09-26; the assertion would flip to zero only if a replay check were added later).
- Dehydrated block, link host: inside `@defer (hydrate when hydrateNow())` with the signal held `false`, clicking the link does not jump before the block hydrates, then scrolls to and focuses the target, logs no error, and leaves the URL unchanged.
- Dehydrated block, container host: the native jump happens at once and the replay focuses the target.
- `@defer (hydrate never)`: links jump natively with the CSS offset, smoothly with the mixin included.

## Out of Scope

- Scroll spying, the active link, `aria-current`, deep linking, and URL or history updates: the Magellan spec, which composes this directive.
- Cross-page fragment navigation (`/guide#install` from another route): the Router's `anchorScrolling`.
- Configuring the Router; the spec documents the interaction only.
- A duration or easing control, and a JavaScript-computed offset (Dropped options and the CSS mapping above).
- A completion output or callback, which needs `scrollend` (Further Notes).
- Horizontal in-page scrolling as a feature: `inline: 'nearest'` keeps the platform's behaviour, nothing more.
- `area[href]` and SVG `a` hosts; Foundation's contract is `a[href^="#"]`.
- Rewriting consumer `href`s to fix `<base href>` resolution (design decision D9).
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `[nfsSmoothScroll]`, on a container or one link | Foundation's two documented placements; directive-first (ADR 0001); event delegation handles dynamic links with no registration | Documentation plus Router configuration only (cannot keep plain links out of the Router's `popstate` handling, cannot focus non-focusable targets, gives Magellan nothing to reuse); separate container and link directives (two imports, one behaviour) |
| D2 | One `click` host listener, state first and `preventDefault()` last, skipped when already prevented | The click must be cancelled to avoid `popstate` and history entries; replay needs a template or `host` listener (ADR 0008); the guard avoids the replay throw where the dispatcher already cancelled | Listener-free native navigation plus CSS as the only mechanism (kept as the documented recipe; see the proposed ADR in the ticket for why building-blocks 1.11 decision 5's no-listener rule yields here); a `Renderer2` listener (not replayed) |
| D3 | Container host yields to clicks already cancelled; link host owns its link | `RouterLink` cancels its own anchor clicks; on a link host inside a dehydrated block the dispatcher's cancellation must not suppress the replayed scroll | One rule for both (either loses the dehydrated link-host click or double-handles `routerLink` clicks) |
| D4 | Offset and threshold are CSS (`scroll-padding-top`, `scroll-margin-top`) | Same landing point for native and directive jumps, before and after hydration, and in nested scrollers | `offset`/`threshold` inputs computed in JavaScript (Foundation's formula; browser-only, viewport-only, diverges from pre-hydration jumps) |
| D5 | `animationDuration` and `animationEasing` dropped | Native smooth scrolling exposes neither | A JavaScript `requestAnimationFrame` scroll loop (JavaScript-timed animation, which the user ruled out) |
| D6 | `behavior` is `'instant'` under `reducedMotion`, `'smooth'` otherwise | Honours the setting even when the consumer's own CSS sets smooth scrolling ungated; the live signal follows setting changes | `'auto'` everywhere (depends on the consumer's CSS); ignoring the preference (Foundation) |
| D7 | Focus the target with `preventScroll`; temporary `tabindex="-1"` for non-focusable targets, removed on `blur` | APG: an intercepted in-page link must still move focus; HTML's own fragment scroll runs the focusing steps; `preventScroll` keeps the smooth scroll (Angular `ViewportScroller` comment) | No focus move (Foundation); a permanent `tabindex="-1"` (clicks inside the section would focus the whole section) |
| D8 | URL unchanged | Foundation parity; no `popstate` and no history entry, so the Router's state and scroll restoration are untouched; Magellan owns deep linking. Decided at triage (2026-09-26): impact not HIGH (an opt-in can be added later), confidence HIGH | `replaceState` of the fragment (would need to preserve the Router's `history.state`); `pushState` (a history entry without Router state, which the Router then restores as navigation id 0) |
| D9 | `#`-only `href`s are in-page even when `<base href>` resolves them elsewhere, with a development-mode warning | Foundation's markup contract (`a[href^="#"]`) works after hydration in client-rendered apps; the warning tells server-rendering consumers the link is broken without script. Still OPEN FOR HUMAN after triage (2026-09-26): HIGH impact (Magellan inherits the in-page test; narrowing it later changes where consumer links go) with NOT-HIGH confidence (sources support both; the click behaves differently before and after hydration); see the ticket | Handling only resolved same-document links (consistent across rendering modes, but Foundation's markup would leave the page in every Router app; the competing option in the ticket); the directive rewriting `href` (collides with `RouterLink`'s `href` binding, ADR 0011, and cannot reach a container's links through host bindings) |
| D10 | Public `scrollTo(target, {focus})` on the directive, returning `boolean` | Foundation's `scrollToLoc` returned `false` on a miss; Magellan composes the directive and reuses it | A root service (services are for shared state, building-blocks 1.5); a static function (loses the injected `reducedMotion` and `InteractivityChecker`) |
| D11 | No inputs, outputs, Defaults token, or host bindings | Every Option is CSS or browser-owned; no event exists without `scrollend` | Material-style config token |
| D12 | Opt-in `nfs-smooth-scroll($scroller: html)` mixin, gated by `prefers-reduced-motion: no-preference` | Foundation ships no smooth-scroll CSS; native jumps need it; `scroll-behavior` on `html` changes every programmatic root scroll, so it must be the consumer's choice (CDK's block scroll strategy resets it for the same reason) | Always-on library CSS; no CSS at all (pre-hydration and `hydrate never` jumps would be instant) |

### Usage examples

Without the Router (or on a page at the base URL):

```ts
@Component({
  selector: 'app-guide',
  imports: [NfsSmoothScroll],
  template: `
    <nav aria-label="On this page">
      <ul class="menu vertical" nfsSmoothScroll>
        @for (s of sections(); track s.id) {
          <li><a [href]="'#' + s.id">{{ s.title }}</a></li>
        }
      </ul>
    </nav>

    @for (s of sections(); track s.id) {
      <section [id]="s.id">
        <h2>{{ s.title }}</h2>
        <p>{{ s.body }}</p>
      </section>
    }

    <a href="#top" nfsSmoothScroll>Back to top</a>
  `,
})
export class Guide {
  protected readonly sections = input.required<readonly { id: string; title: string; body: string }[]>();
}
```

```scss
// styles.scss, after the consumer's Foundation imports and includes
@import 'ngx-foundation-sites';
@include nfs-smooth-scroll;

// A sticky top bar of 3.5rem: every in-page jump, and every later Tab, stops below it,
// native or not (required for WCAG 2.2 2.4.11 Focus Not Obscured)
html {
  scroll-padding-top: 3.5rem;
}
```

With the Router (base href safe; both link kinds in one menu):

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    provideAppInitializer(() => {
      // The Router's anchor scrolling ignores scroll-padding; keep it equal to the CSS offset (56px = 3.5rem)
      inject(ViewportScroller).setOffset([0, 56]);
    }),
  ],
};

@Component({
  selector: 'app-install-guide',
  imports: [NfsSmoothScroll, RouterLink],
  template: `
    <ul class="menu" nfsSmoothScroll>
      <!-- Directive-owned: same-document href, no navigation, URL unchanged -->
      <li><a [href]="path + '#requirements'">Requirements</a></li>
      <!-- Router-owned: the container yields; the Router scrolls and records the fragment -->
      <li><a routerLink="." fragment="configure">Configure</a></li>
    </ul>
    <section id="requirements" tabindex="-1">...</section>
    <section id="configure" tabindex="-1">...</section>
  `,
})
export class InstallGuide {
  // The current path without the fragment, with the base href applied, identical on server and client
  readonly #location = inject(Location);
  protected readonly path = this.#location.prepareExternalUrl(this.#location.path());
}
```

Programmatic use and composition:

```ts
@Component({
  selector: 'app-checkout',
  imports: [NfsSmoothScroll],
  template: `
    <form nfsSmoothScroll #scroller="nfsSmoothScroll" (submit)="submit(scroller)">...</form>
  `,
})
export class Checkout {
  protected submit(scroller: NfsSmoothScroll): void {
    const firstError = this.firstInvalidField(); // Element | null

    if (firstError) {
      scroller.scrollTo(firstError); // scrolls (instant under reduced motion) and focuses the field
    }
  }
  // firstInvalidField omitted
}

// How the Magellan spec composes it (sketch; Magellan owns its own API)
@Directive({
  selector: '[nfsMagellan]',
  hostDirectives: [NfsSmoothScroll],
})
export class NfsMagellan {
  readonly #smoothScroll = inject(NfsSmoothScroll);
}
```

### Listener-free recipe (when the directive is not needed)

A page whose in-page links are same-document `href`s, in an application without the Router's scroll restoration, gets smooth, offset, reduced-motion-aware jumps with no directive: include `nfs-smooth-scroll`, write `scroll-padding-top` (required with a sticky or fixed bar, WCAG 2.2 2.4.11), and give targets `tabindex="-1"` so HTML's fragment scroll focuses them (for a non-focusable target it only moves the sequential focus navigation starting point, so focus itself stays behind, 2.4.3). What it does not give: a URL without the fragment and without a history entry per click, the Router-safe handling, focus on targets without `tabindex`, and a `scrollTo` for code.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This Plugin relies on no Foundation Export mixin: Foundation ships no SmoothScroll Sass, and the Menu classes on a typical container belong to `foundation-menu`, which the consumer includes for the menu itself. Its documented custom CSS is the `nfs-smooth-scroll` Library mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation); it has no ordering constraint against any Foundation include.

1. Rules: one, `#{$scroller} { scroll-behavior: smooth; }` inside `@media (prefers-reduced-motion: no-preference)`. Reason: Foundation's CSS has no smooth-scrolling rule (its JavaScript animated `scrollTop`), and without one every native fragment jump (clicks before hydration, links inside `@defer (hydrate never)`, Router-owned fragment links) is instant. The rule sits on the scroll container, not on the link container, because `scroll-behavior` applies to the scrolling box.
2. Reused Foundation settings, mixins, functions: none; Foundation has no setting for this. One library parameter, `$scroller` (default `html`, the page's scrolling box), because Foundation has no setting that names the scroll container and because `scroll-behavior` on `html` also changes every programmatic root scroll (Comparison, rule 4).
3. Custom properties: none.
4. Motion classes: none. The reduced-motion handling is the `no-preference` media query around the one rule; there is no transition or animation to shorten, so no 1 ms override.
5. Missing include: native jumps are instant; the directive's own jumps are still smooth (it passes `behavior` explicitly), and offsets, focus, and reduced motion are unaffected.

The offset rules (`scroll-padding-top`, `scroll-margin-top`) are the consumer's, because their value is the consumer's own sticky bar height; the mixin does not emit them.

### Platform features to adopt when the browser target moves

- `scrollend` (Baseline newly available 2025-12-12, outside the target): a `scrolled` Completion output, and a promise-returning `scrollTo`, emitted when the directive's scroll settles; Magellan's "in transition" flag can then use it instead of IntersectionObserver settling.
- The Navigation API's `navigate` event (outside the target): same-document fragment navigations could be intercepted in one place, which would keep native `:target` and history semantics while avoiding the Router's `popstate` reaction; it would replace the per-host click listener, and so the replay caveats, if Angular's Router integrates with it.

### Foundation behaviour changed or dropped

- `$('html, body').stop(true).animate({scrollTop}, duration, easing, callback)`: replaced by `scrollIntoView` with browser-owned timing; the animation queue, easing names, duration, and callback go.
- `$(loc)` accepting any jQuery selector: `scrollTo` takes a fragment or an `Element`, resolved like HTML's indicated part.
- The `threshold / 2 + offset` stopping point: CSS `scroll-margin-top` / `scroll-padding-top`, default 0 instead of Foundation's effective 25 px.
- The generated container id: dropped; nothing references it.
- No focus move after the animated scroll: focus now moves to the target.
- `prefers-reduced-motion` ignored: now honoured by both the directive and the mixin.
- `href="#"` placeholder links, which Foundation's handler passed to `$('#')`: scroll to the top as HTML defines; Foundation's docs use such links as triggers, which the library writes as buttons (building-blocks 1.10).
- `:target` styling: unchanged from Foundation, a directive-handled jump does not update `:target` (no fragment navigation happens); native jumps before hydration and in `hydrate never` do.
