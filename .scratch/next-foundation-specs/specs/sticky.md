# Spec: Sticky

Ticket: [Spec: Sticky](../issues/28-spec-sticky.md)

## Problem Statement

Foundation's Sticky Plugin keeps an element (a sidebar, a table of contents, a title bar) in view while the page scrolls past a range, and exposes that state through the State classes `.is-stuck`, `.is-anchored`, `.is-at-top`, and `.is-at-bottom` plus the `sticky.zf.stuckto:*` and `sticky.zf.unstuckfrom:*` events. It does this with a jQuery emulation of what CSS now does natively: it measures anchors on window `load`, recomputes on every scroll, switches the element to `position: fixed`, copies the container's width into an inline `max-width`, and freezes the container's height so the layout does not collapse. None of it runs on the server, so the server HTML of a Foundation page never sticks until the Plugin has measured; the Breakpoint query in `stickyOn` needs Foundation's `meta.foundation-mq` handshake, which needs a rendered stylesheet; and the element jumps between `relative` and `fixed` positioning with margins applied and removed around the switch.

An Angular developer who builds on Foundation's Sass wants Foundation's markup and State classes on an Angular page without jQuery, a sticky element that already sticks in server HTML, in prerendered pages, and inside dehydrated `@defer` blocks, a class contract and outputs that report what the browser actually does, and an honest account of the Foundation Options the platform cannot honour, with a recipe for each.

## Solution

Two attribute directives on the markup the developer already writes. `[nfsSticky]` sits on the sticky element, adds `.sticky`, and binds its offset from `marginTop` or `marginBottom` as an inline `top` or `bottom` in em. The Library mixin `nfs-sticky` turns `.sticky` into `position: sticky` above the `stickyOn` breakpoint, with media queries built from the consumer's own `$breakpoints` by Foundation's `breakpoint()` mixin, so the element sticks correctly at every viewport width from the server HTML alone, before any script runs. `[nfsStickyContainer]` sits on the element Foundation marks `[data-sticky-container]` and adds `.sticky-container`. The browser pins the element; its Sticky range is its parent element's box.

After the first render the directive measures, in the browser, whether the element is pinned and at which end of its range it rests, and binds Foundation's State classes from that. It exposes the result as the read-only signals `isStuck` and `edge` and emits the Completion outputs `stuck` and `unstuck` with the edge as payload. Measurement uses two invisible sentinels inside the container observed by `IntersectionObserver`, a `requestAnimationFrame`-throttled scroll listener that catches instantaneous jumps the observers miss, and `ResizeObserver` for size changes, all against the element's real scroll container. Foundation's anchor Options (`anchor`, `topAnchor`, `btmAnchor`) have no counterpart, because `position: sticky` cannot bound an element by anything but its containing block; the documented recipe is to make the container span the wanted range.

## User Stories

1. As an Angular developer using Foundation's Sass, I want to write Foundation's Sticky markup with `nfsSticky` and `nfsStickyContainer` in place of `data-sticky` and `data-sticky-container`, so that I keep Foundation's docs markup and CSS.
2. As an Angular developer, I want the directive to add `.sticky` for me, so that Foundation's title-bar example, which carries no `.sticky` class, works as written.
3. As an Angular developer, I want the element to stick through native `position: sticky`, so that it never jumps between flow and `position: fixed` and never needs a frozen container height.
4. As a site visitor on a server-rendered or prerendered page, I want the sidebar to stick while I scroll before the application has hydrated, so that the page behaves the same whether or not scripts have loaded.
5. As a site visitor with JavaScript disabled, I want a sticky element to stick at the widths the developer chose, so that the layout still works.
6. As an Angular developer, I want `stickTo="bottom"` to pin the element to the bottom of the viewport, so that I can build sticky footers and action bars as Foundation documents.
7. As an Angular developer, I want `marginTop` and `marginBottom` in em as in Foundation, so that the gap between the stuck element and the viewport edge keeps Foundation's meaning.
8. As an Angular developer, I want `stickyOn="large"` to keep the element in normal flow below the large breakpoint, so that small screens do not lose space to a pinned element.
9. As an Angular developer, I want `stickyOn` to accept every Breakpoint query form (`medium`, `medium up`, `large only`, `medium down`, `all`), so that it reads like Tooltip's `showOn` and Equalizer's `equalizeOn`.
10. As an Angular developer who customised `$breakpoints` in Sass, I want the `stickyOn` gate to switch at my breakpoints, so that the gate agrees with the rest of my Foundation CSS.
11. As an Angular developer, I want `.is-stuck` while the element is pinned and `.is-anchored` otherwise, so that I can style a stuck header (a shadow, a smaller logo) with Foundation's classes.
12. As an Angular developer, I want `.is-at-top` or `.is-at-bottom` to tell me which edge the element is pinned to, or which end of its range it rests at, so that Foundation's class contract keeps its meaning.
13. As an Angular developer, I want a read-only `isStuck` signal, so that templates and `computed` state can react to the element being pinned without listening to outputs.
14. As an Angular developer, I want an `edge` signal, so that I can tell in code whether an unstuck element rests before or after its range.
15. As an Angular developer, I want a `stuck` output carrying the edge it stuck to, so that I can react when the element pins (analytics, showing a back-to-top button).
16. As an Angular developer, I want an `unstuck` output carrying the end of the range the element now rests at, so that I can tell scrolling above the range from scrolling past it, as Foundation's `unstuckfrom:top` and `unstuckfrom:bottom` do.
17. As an Angular developer, I want the class contract to be right after a large instantaneous jump (Home, End, a hash link, `scrollIntoView()`), so that the classes never keep reporting the state from before the jump.
18. As an Angular developer, I want the class contract to follow changes in the element's height, so that Foundation's `dynamicHeight` behaviour is always on without an Option.
19. As an Angular developer, I want a sticky element inside a scrollable panel (`overflow: auto`) to stick within that panel and report its state against it, so that sticky section headers in a scrolling sidebar work.
20. As an Angular developer, I want a development warning when an `overflow: hidden` ancestor stops the element from sticking, with the `overflow: clip` fix, so that I do not lose time on Foundation's off-canvas wrapper clash.
21. As an Angular developer migrating Foundation markup, I want a development warning when the container is no taller than the sticky element, so that I learn why Foundation's title-bar example does not stick and how to fix it.
22. As an Angular developer migrating Foundation markup, I want a development warning when `data-anchor`, `data-top-anchor`, or `data-btm-anchor` is still on the element, so that I learn the anchors are not honoured and see the container recipe.
23. As an Angular developer, I want a development warning when the container is not positioned, so that I add `nfsStickyContainer` or `.sticky-container` before the class contract drifts.
24. As an Angular developer, I want application-wide defaults for `stickTo`, `marginTop`, `marginBottom`, and `stickyOn` through a Defaults token, so that I can change Foundation's defaults once instead of on every element.
25. As an Angular developer, I want the directive to export itself as `nfsSticky`, so that I can read `isStuck()` through a template reference.
26. As an Angular developer, I want the directive to work in a zoneless application with OnPush components, so that State classes and signals update without `NgZone`.
27. As an Angular developer with a zone-based application, I want the scroll listener to run outside the Angular zone, so that scrolling does not start change detection on every frame.
28. As an Angular developer using SSR, I want the server HTML to carry `.sticky`, `.is-anchored`, `.is-at-top`, the offset, and the gate attribute, so that the first paint is correct and hydration changes nothing structural.
29. As an Angular developer using incremental hydration, I want a sticky element inside `@defer (hydrate on viewport)` to stick before its block hydrates and to gain its classes after, so that I can defer the directive's code freely.
30. As an Angular developer using `@defer (hydrate never)`, I want the element to keep sticking from CSS alone, so that a never-hydrated region still behaves.
31. As an Angular developer, I want the directive to add no event listeners that replay and no `jsaction` attributes, so that it adds nothing to event replay.
32. As an Angular developer, I want the directive to create no DOM before hydration, so that hydration never reports a mismatch.
33. As a keyboard user, I want a focused link never to be hidden under a stuck header, so that I can see where focus is (WCAG 2.4.11), and as an Angular developer I want the documented `scroll-padding` recipe that achieves it.
34. As a screen-reader user, I want sticking to change nothing in reading or tab order, so that the page stays predictable.
35. As an Angular developer, I want Foundation's `stickyClass`, `containerClass`, `container`, `checkEvery`, and `dynamicHeight` Options listed as Dropped options with the reason, so that I know why each is gone.
36. As an Angular developer, I want the Sass subsection to list every rule `nfs-sticky` emits, so that I know what the library adds to Foundation's CSS and what breaks if I forget the include.
37. As a library maintainer, I want the class contract derived by one pure function from measured rectangles, so that the edge cases are covered by a table-driven test with no browser.
38. As a library maintainer, I want story ids named `sticky--<story>`, so that play functions, browser-level tests, and Playwright open the same stories.
39. As an Angular developer, I want a development warning when a focused element ends up entirely hidden behind a stuck element, so that I add the `scroll-padding` WCAG 2.4.11 requires before users meet the problem.
40. As a low-vision user reading at 400% zoom, I want sticking never to add horizontal scrolling and small viewports to stay free of pinned elements by default, so that content reflows (WCAG 1.4.10).
41. As a reader, I want a stuck element that overlaps content to have an opaque background, so that neither its text nor the text under it loses contrast (WCAG 1.4.3).

## Implementation Decisions

### Foundation contract

From the Foundation inventory (Sticky section) and `Sticky.defaults` in Foundation's Sticky plugin source:

| Foundation | Kind | Library counterpart |
| --- | --- | --- |
| `.sticky[data-sticky]` | Structural class and Plugin attribute | `[nfsSticky]`, which adds `.sticky` |
| `[data-sticky-container]` and `.sticky-container` | Plugin attribute, Structural class added by the Plugin | `[nfsStickyContainer]`, which adds `.sticky-container` |
| `.is-stuck`, `.is-anchored`, `.is-at-top`, `.is-at-bottom` | State classes | Host class bindings from `isStuck` and `edge` |
| `stickTo` (`'top'`) | Option | `stickTo` input, same default |
| `marginTop` (`1`, em) | Option | `marginTop` input, same default and unit |
| `marginBottom` (`1`, em) | Option | `marginBottom` input, same default and unit |
| `stickyOn` (`'medium'`) | Option (Breakpoint query) | `stickyOn` input, same default |
| `anchor`, `topAnchor`, `btmAnchor` (`''`) | Options | Dropped options: the platform cannot honour them (recipe below) |
| `container` (`'<div data-sticky-container></div>'`) | Option (HTML string) | Dropped option (building-blocks 1.4, 1.1) |
| `stickyClass`, `containerClass` | Options (class names) | Dropped options (building-blocks 1.4) |
| `dynamicHeight` (`true`) | Option | Dropped option: `ResizeObserver` always follows the height |
| `checkEvery` (`-1`) | Option | Dropped option: replaced by the throttled scroll backstop |
| `sticky.zf.stuckto:top/bottom` | Event | `stuck` output, payload `'top' \| 'bottom'` |
| `sticky.zf.unstuckfrom:top/bottom` | Event | `unstuck` output, payload `'top' \| 'bottom'` |
| `init.zf.sticky`, `destroyed.zf.sticky`, `pause.zf.sticky` (private) | Events | None (Angular lifecycle; the pause is internal) |
| `destroy()` | Method | None (Angular lifecycle) |

Behaviour that changes, with the reason:

- The Sticky range is the sticky element's parent box, because that is the containing block `position: sticky` confines the element to. Foundation's default range is the whole document (an empty `topAnchor` means 1 px from the top, an empty `btmAnchor` the document's scroll height). To keep that, the parent must span the page. Foundation's own title-bar example (`<div data-sticky-container><div class="title-bar" data-sticky>`) has a container exactly as tall as the bar, so it does not stick until the container is changed; the development warning in the API section catches it.
- Anchor Options become a recipe: size or place the container so its top and bottom are the anchors. The [Prototype: CSS `position: sticky` with IntersectionObserver sentinels for Sticky](../issues/48-prototype-sticky-css.md) matched a container placed on the anchors to 0 px and showed that anchors outside the container cannot be honoured.
- `stickTo: 'bottom'` pins while the element's natural position is below the bottom stick line and the container's top is above it. Foundation's range (from the container top reaching the line until the container bottom reaches it) is reproduced when the element is the last child of its container; `stickTo: 'top'` reproduces Foundation's range when the element is the first child. Foundation's docs put the sticky element as the only child, which is both.
- The offset is a sticky inset (`top: 1em`), not a margin: nothing is added or removed around the switch, so there is no layout jump.
- `em` resolves against the sticky element's own font size; Foundation's `emCalc` used the body's. They are equal unless the element or an ancestor between it and `body` changes the font size.
- No `max-width` copy, no container height, no wrapping, no `transitionend` re-measure: none is needed when the element never leaves flow.
- A sticky element inside any scroll container (not only the window) sticks within it and reports its state against it; Foundation supported only the window.

### CSS class to Angular mapping

| Foundation class or attribute | Angular | Notes |
| --- | --- | --- |
| `.sticky` + `[data-sticky]` | `NfsSticky`, selector `[nfsSticky]`, host `class: 'sticky'` | The Structural class; the consumer may also write it |
| `.sticky-container` + `[data-sticky-container]` | `NfsStickyContainer`, selector `[nfsStickyContainer]`, host `class: 'sticky-container'` | Foundation's `position: relative` on it is what positions the sentinels |
| `.is-stuck` | `[class.is-stuck]="isStuck()"` | State class |
| `.is-anchored` | `[class.is-anchored]="!isStuck()"` | State class |
| `.is-at-top` | `[class.is-at-top]="edge() === 'top'"` | State class |
| `.is-at-bottom` | `[class.is-at-bottom]="edge() === 'bottom'"` | State class |
| `[data-sticky-on]` | `[attr.data-nfs-sticky-on]` carrying the canonical Breakpoint query | Library-owned attribute the `nfs-sticky` gate rules key on; a different name from Foundation's so a leftover static `data-sticky-on` never collides with the binding |

### Hierarchy and DI shape

```
[nfsStickyContainer]  (.sticky-container, position: relative from Foundation)
 '-- [nfsSticky]      (.sticky; its DOM parent is its Sticky range)
      injects: NfsMediaQuery, nfsStickyDefaultsToken (optional), ElementRef, DestroyRef, NgZone
```

- No parent token. The sticky element's range is its DOM parent, which is what CSS uses; DI would answer a different question (the declaration-site injector), and nothing else needs the instance. The building-blocks sketch named an `nfsStickyToken`; nothing injects it, so it is not created.
- `NfsStickyContainer` has no inputs, outputs, or DI. It is kept as a directive, although it only adds a class, because ADR 0001 names the sticky container as a consumer-written element with a directive on it and because it keeps Foundation's attribute-shaped markup. Writing `class="sticky-container"` instead is equivalent and documented.
- `nfsStickyDefaultsToken`: `InjectionToken<NfsStickyDefaults>` with `interface NfsStickyDefaults { stickTo?: NfsStickyEdge; marginTop?: number; marginBottom?: number; stickyOn?: string }`, injected with `{optional: true}` and used to seed the input defaults (building-blocks 1.4, Shape B). Provided at bootstrap, route, or element level; the nearest wins.
- `NfsMediaQuery` from the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md), used exactly as defined there: `canStick = computed(() => mq.is(this.stickyOn()))`.
- Entry point `ngx-foundation-sites/sticky`, which imports the Breakpoint service's entry point.

### API

Types:

```ts
type NfsStickyEdge = 'top' | 'bottom';
```

`NfsSticky` (selector `[nfsSticky]`, `exportAs: 'nfsSticky'`):

| Member | Kind | Type and default | Meaning |
| --- | --- | --- | --- |
| `stickTo` | `input()` | `NfsStickyEdge`, `'top'` | Foundation `data-stick-to`. The viewport (or scroll container) edge the element pins to |
| `marginTop` | `input()` with `numberAttribute` | `number`, `1` | Foundation `data-margin-top`. Inset from the top edge while stuck, in em; used when `stickTo` is `'top'`. A value that does not parse falls back to the default |
| `marginBottom` | `input()` with `numberAttribute` | `number`, `1` | Foundation `data-margin-bottom`. Inset from the bottom edge, in em; used when `stickTo` is `'bottom'` |
| `stickyOn` | `input()` | `string` (a Breakpoint query), `'medium'` | Foundation `data-sticky-on`. Below the query the element stays in normal flow; `'all'` or `''` never gates |
| `isStuck` | read-only `Signal<boolean>` (`computed`) | `false` until measured | The element is pinned: the gate is open and the browser holds it at the stick line |
| `edge` | read-only `Signal<NfsStickyEdge>` | `'top'` until measured | While stuck, the edge it is pinned to (`stickTo`); otherwise the end of the Sticky range it rests at: `'top'` before the range, `'bottom'` after it |
| `stuck` | `output<NfsStickyEdge>()` | | Completion output when `isStuck` becomes `true`; payload is the edge it stuck to |
| `unstuck` | `output<NfsStickyEdge>()` | | Completion output when `isStuck` becomes `false`, or when an unstuck element moves from one end of its range to the other without sticking in between; payload is the end it now rests at |

No methods, no models (the browser owns the state, building-blocks 1.4), no content projection.

Rules the API follows:

- Initial state is `isStuck = false`, `edge = 'top'` on the server and on the client until the first measurement, matching Foundation's first classes (`is-anchored is-at-top`). The first measurement emits an output only when it differs from that state (a page reloaded mid-scroll emits `stuck` once).
- Outputs fire once per transition, from the measurement callback, after the signals are written, so a handler reading `isStuck()` sees the new value. No output fires on destroy.
- Changing `stickTo` or a margin at runtime updates the inline inset and the measurements in the next render callback; changing `stickyOn` updates the gate attribute (CSS switches at once) and the class contract.
- The canonical gate value bound to `data-nfs-sticky-on`: whitespace trimmed and collapsed; `''` and `'all'` become `all`; `'<name> up'` becomes `'<name>'`; `'<name> only'` and `'<name> down'` stay. A malformed value is bound as written, matches no gate rule (so the element never sticks), and `NfsMediaQuery.is()` warns about it and answers `false`, so CSS and the class contract agree.

Development-mode warnings (under `ngDevMode`, each at most once per instance, from the first render callback; stripped from production builds):

1. The parent element's computed `position` is `static`: "ngx-foundation-sites: the parent of an nfsSticky element is not positioned. Add nfsStickyContainer (or the sticky-container class) to the parent so the Sticky state is measured correctly."
2. The parent's content height is not larger than the element's height: "... this nfsSticky element's Sticky range is its parent, which is no taller than the element, so it never sticks. Make the parent span the range you want (Foundation's topAnchor/btmAnchor recipe)."
3. The nearest scroll container is an element with computed `overflow` `hidden` in either axis: "... an ancestor with overflow: hidden (<selector-ish description>) is the scroll container of this nfsSticky element, so it cannot stick while the page scrolls. Use overflow: clip on that ancestor if it only needs to clip."
4. The host carries `data-anchor`, `data-top-anchor`, or `data-btm-anchor`: "... Foundation's anchor Options are not supported; the Sticky range is the parent element. Size or place the parent to span the range."
5. While the element is stuck, a newly focused element (checked in the animation frame after a `focusin` on the document, so the browser's scroll-into-view has happened) lies entirely inside the stuck element's rectangle and outside the element itself: "... a focused element is hidden behind a stuck nfsSticky element (WCAG 2.4.11). Add scroll-padding-top (or scroll-padding-bottom for stickTo bottom) of at least the stuck element's height plus its inset to the scroll container." The `focusin` listener exists only in development builds and only while the element is stuck; it is added in code, so it never replays.

An unknown or malformed `stickyOn` gets the Breakpoint service's own warning.

`NfsStickyContainer` (selector `[nfsStickyContainer]`): host `class: 'sticky-container'`; no other members.

### Implementation level and primitives

Level: native platform plus a thin custom directive (building-blocks 1.2 order).

- Platform: `position: sticky` does the pinning (in the Browser target since 2022-03-19 per the web platform research, section 8). `IntersectionObserver` and `ResizeObserver` (section 10), `requestAnimationFrame`, passive `scroll` listeners, and `getBoundingClientRect`/`getComputedStyle` do the measuring. `overflow: clip` (Baseline widely available 2025-03-12, Chrome 90, Firefox 81, Safari 16, webstatus.dev `overflow-clip`) is the documented fix for clipping ancestors.
- `@angular/aria`: no pattern (Sticky has no ARIA).
- `@angular/cdk`: nothing. `ScrollDispatcher` reports scrolling only for the window and registered `cdkScrollable` elements, through RxJS with a 20 ms audit time, and cannot find an unregistered scroll container; `ViewportRuler` adds nothing the observers do not already give. CDK table's sticky rows (`StickyStyler`) confirm the approach (native `position: sticky` with inline offsets) but are table-specific. `MediaMatcher` is used only through `NfsMediaQuery`.
- Custom: the directive, the state derivation, the sentinels, and the Breakpoint service.

How the class contract is measured (the mechanism the prototype proved, with four refinements the [Prototype: Sticky measurement refinements](../issues/63-prototype-sticky-measurement.md) confirmed in three engines; that prototype also found that a bordered scroll container must be measured from its padding box, applied below):

1. Scroll container: in the first render callback the directive walks up from the parent and takes the first ancestor whose computed `overflow-x` or `overflow-y` is neither `visible` nor `clip`; `body` and the root element count as the viewport. That element (or the viewport) is the observer root and the scroll listener's target. This is the scroll container `position: sticky` itself uses, so the classes describe what the browser does: inside an `overflow: auto` panel the element sticks and reports stuck; inside an `overflow: hidden` wrapper it cannot stick and reports not stuck (instead of the prototype's window-relative "stuck" while it drifts), and warning 3 fires.
2. State derivation: one pure function of the host's rectangle, the scroll container's rectangle, the inset in px (read from the host's computed `top` or `bottom`, so the unit is the browser's), `stickTo`, and `canStick`. With the gate closed the result is always not stuck, `edge` `'top'` (Foundation unsticks to the top below `stickyOn`). For `stickTo: 'top'` the stick line is the top edge of the scroll container's padding box (its border-box top plus its top border width, which is where CSS defines the scrollport) plus the inset; the element is stuck when the gate is open and its top is within 1 px of the line; otherwise `edge` is `'top'` when its top is below the line and `'bottom'` when above. For `'bottom'` the line is the bottom edge of the scroll container's padding box minus the inset and the comparison uses the element's bottom, mirrored. Reading the host itself, rather than the sentinels' geometry as the prototype did, makes the result independent of container padding and of where the element sits in the container.
3. Sentinels: two 1 px `span` elements, `data-nfs-sticky-sentinel="top"` and `"bottom"`, `aria-hidden="true"`, with inline `position: absolute; left: 0; width: 1px; height: 1px; pointer-events: none` and `top: 0` or `bottom: 0`, appended as the last children of the parent, in the first render callback's `write` phase, and removed on destroy. Absolute positioning inside `.sticky-container` (Foundation's `position: relative`) keeps them out of layout, so the container does not grow by 2 px as it did in the prototype, flex and grid containers get no extra items, and appending keeps them behind any view Angular has yet to hydrate in the same container, whose nodes hydration finds by walking forward from earlier nodes.
4. Observers: one `IntersectionObserver` per sentinel with the scroll container as root and a `rootMargin` band at the line where the browser's constraint changes (near sentinel: the stick line; far sentinel: the stick line plus the element's height, both adjusted for the container's padding). The observers only schedule a measurement; the state always comes from step 2. A passive `scroll` listener on the scroll container, throttled to one measurement per animation frame, is the backstop for jumps larger than a band between two sampled frames, which the prototype reproduced (`window.scrollTo(0, 9027)` left the classes stale indefinitely without it). A `ResizeObserver` on the host and the parent re-measures when either changes size, which replaces `dynamicHeight` and rebuilds the far band.
5. Lifecycle: an `afterRenderEffect` keyed on `canStick`, `stickTo`, the margins, and the measured host height builds the observers and the listener with cleanup (`onCleanup`), measures once in its `read` phase, and tears everything down while the gate is closed (Foundation's pause), so a closed gate costs nothing per scroll. Closing the gate while stuck sets the state to not stuck at `'top'` and emits `unstuck` with `'top'`. The scroll listener and the observers are created in `NgZone.runOutsideAngular`; state is written to signals, which schedule change detection in zoneless and zone-based applications alike.

Render hooks and lazy loading (building-blocks 1.5 and 1.9): step 5's `afterRenderEffect` is the directive's only render hook. `afterEveryRender` is not used: the observers and the scroll backstop decide when to measure, and a callback after every change detection in the application would re-measure for renders that move nothing. `injectAsync` is not used: the directive has no service to load after an interaction (its measurements follow scrolling and resizing, not a client interaction), the pinning itself is CSS that needs no code, and the entry point is its own, so a consumer's `@defer (hydrate on viewport)` already defers the measuring code while the element sticks from CSS alone.

Fallback: if the observers misbehave in an engine, the scroll backstop alone (one measurement per scrolled frame, Foundation's `checkEvery: 0`) keeps the contract correct with the same API. No JavaScript positioning fallback exists or is needed: `position: sticky` is in every target browser.

### Comparison with Angular Material and CDK

| Concern | Material / CDK | `NfsSticky` | Why |
| --- | --- | --- | --- |
| Sticky component | None: `mat-toolbar` does "not perform any positioning of its content" (Material reference, section 9) | Directive on Foundation markup | Nothing to borrow |
| How sticking is done | CDK table `sticky` row and column inputs: native `position: sticky`, inline offsets written by `StickyStyler` | Native `position: sticky` from the Library mixin, inline inset from a host binding | Same platform choice; the offset is per instance, so it is inline in both |
| Stuck state | Not exposed; `STICKY_POSITIONING_LISTENER` reports sizes and offsets the table applied, not whether a row is pinned | `isStuck`/`edge` signals, State classes, `stuck`/`unstuck` outputs | Foundation's contract requires the state |
| Scroll events | `ScrollDispatcher.scrolled()` (RxJS, 20 ms audit, registered scrollables) | `IntersectionObserver` plus a rAF-throttled passive listener on the real scroll container | Works for unregistered containers; no RxJS |
| Configuration | Table `sticky` boolean per row definition | Foundation Options plus `nfsStickyDefaultsToken` | Foundation's Option set |

### ARIA and keyboard

Sticky has no APG pattern (ARIA APG research, Sticky: "No pattern"). It sets no role, state, or property, handles no key, and never moves focus. `position: sticky` does not change DOM order, so reading order and tab order are unchanged.

| Element | Role and ARIA | Notes |
| --- | --- | --- |
| Sticky element | None from the directive | A sticky site header is a `header` or `nav` the consumer writes; a second `nav` on the page needs a unique `aria-label` (APG landmark regions) |
| Container | None | |
| Sentinels | `aria-hidden="true"` | Empty and out of the accessibility tree |

| Key | Behaviour |
| --- | --- |
| None | The directive handles no keys. Home, End, Page Up and Page Down, and Space scroll natively; the scroll backstop keeps the classes right after such jumps |

WCAG 2.2 AA requirements (every criterion is a requirement, never a recommendation; building-blocks 1.10):

| Criterion | What Sticky requires | How it is met and checked |
| --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) | A stuck element must never entirely hide the element that has keyboard focus | Required usage, stated in the directive's documentation: when a stuck element can overlap focusable content (a page-spanning header or footer), the scroll container carries `scroll-padding-top` (for `stickTo: 'top'`) or `scroll-padding-bottom` (for `'bottom'`) of at least the stuck element's height plus its inset, so the browser scrolls focused elements clear of it. Stuck sidebars in their own column overlap nothing and need nothing. The library cannot compute this (only the consumer knows what overlaps what, and one scroll container may hold several stuck elements), so it checks instead: development warning 5 fires when a newly focused element is entirely covered by a stuck `nfsSticky`; the `sticky--navigation` story and a Playwright case assert every focused link stays visible. |
| 1.4.3 Contrast (Minimum) | Text of a stuck element that overlaps page content, and the content under it, stays readable | Required usage: a stuck element that overlaps content has an opaque background. Foundation's `.title-bar` and `.top-bar` have one (`$titlebar-background`, `$topbar-background`); Foundation's `.sticky` has none and the library cannot choose a color, so stories that overlap content set one, and the documentation states the rule. |
| 1.4.10 Reflow | Sticking never causes horizontal scrolling at 320 CSS px | The element stays in flow at its container width; `nfs-sticky` replaces Foundation's `width: 100%` on `.is-stuck` with `width: auto`, which would otherwise overflow by the element's horizontal margins (D14). The default `stickyOn: 'medium'` also keeps small viewports, which include 400% zoom of a 1280 px window, free of pinned elements. |
| 1.4.4 Resize Text | The inset scales with text | Insets are in em. |
| 2.4.7 Focus Visible | Unchanged | The directive adds no focusable element and no style to focus indicators; 2.4.11's `scroll-padding` also keeps indicators clear of a stuck bar. |
| 2.5.8 Target Size (Minimum), 2.5.7 Dragging Movements, 1.4.11 Non-text Contrast | Not applicable | Sticky adds no target, no drag, and no user-interface component; the sentinels are 1 px, `pointer-events: none`, and hidden from assistive technology. |

Stories are gated by axe with the WCAG 2.2 AA rule set (Testing Decisions); axe does not test 2.4.11 or overlap contrast, which is why the Playwright cases and warning 5 exist.

### Rendered HTML

Consumer markup (Foundation's column example):

```html
<div class="grid-x">
  <div class="cell small-6" nfsStickyContainer>
    <div nfsSticky [marginTop]="0">
      <img class="thumbnail" src="..." alt="...">
    </div>
  </div>
  <div class="cell small-6">...long content...</div>
</div>
```

Server HTML and hydrated DOM before the first measurement (identical):

```html
<div class="cell small-6 sticky-container" nfsstickycontainer="">
  <div nfssticky="" class="sticky is-anchored is-at-top"
       data-nfs-sticky-on="medium" style="top: 0em; bottom: auto;">
    <img class="thumbnail" src="..." alt="...">
  </div>
</div>
```

Hydrated, after measuring, while the element is pinned:

```html
<div class="cell small-6 sticky-container" nfsstickycontainer="">
  <div nfssticky="" class="sticky is-stuck is-at-top"
       data-nfs-sticky-on="medium" style="top: 0em; bottom: auto;">
    <img class="thumbnail" src="..." alt="...">
  </div>
  <span data-nfs-sticky-sentinel="top" aria-hidden="true"
        style="position: absolute; left: 0px; width: 1px; height: 1px; pointer-events: none; top: 0px;"></span>
  <span data-nfs-sticky-sentinel="bottom" aria-hidden="true"
        style="position: absolute; left: 0px; width: 1px; height: 1px; pointer-events: none; bottom: 0px;"></span>
</div>
```

After scrolling past the range: `class="sticky is-anchored is-at-bottom"`. With `stickTo="bottom"` the inline style is `top: auto; bottom: 1em;` and a pinned element carries `is-stuck is-at-bottom`. Below the `stickyOn` breakpoint the markup is the same and the gate rules do not match, so Foundation's `.sticky { position: relative }` applies and the element never carries `is-stuck`. The sentinels never appear in server HTML.

### Animation

None. Foundation's Sticky has no animation and no Motion class Option, and the library adds none: no `animate.enter`/`animate.leave`, no keyframes, no `transitionend` wait, no reduced-motion rule. A consumer may put a CSS transition on `.sticky.is-stuck` (a shadow, a smaller logo); the State class flips at once and no Completion output waits for it, because the pinning itself is not animated (Foundation re-measured after `transitionend`; that listener is dropped).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the host bindings (`.sticky`, `.is-anchored`, `.is-at-top`, `data-nfs-sticky-on`, the inline inset) are all signal state known on the server, and the `nfs-sticky` gate rules are media queries, so the server HTML sticks correctly at every viewport width with no script (rule 1, rule 9). None of the host bindings reads the Breakpoint service, so the Server breakpoint does not affect the first paint and there is no breakpoint swap at hydration. This is why the gate is CSS and not a `position` binding from `NfsMediaQuery`: with the default Server breakpoint (`small`) and the default `stickyOn` (`medium`), such a binding would render `position: static` on the server, so desktop visitors would get a non-sticky page until hydration and forever inside `hydrate never`.
- Before hydration: the directive creates no nodes, reads no geometry, and adds no listener outside render callbacks (rules 3 to 5). The sentinels, the scroll-container walk, the observers, the scroll listener, and the development checks all start in the first render callback; the `afterRenderEffect` that builds them never runs on the server.
- Full hydration: host binding values equal the server's, so hydration changes no attribute; the first measurement then flips State classes if the page is not at the top (a class change, not a structural one). The sentinels are appended after hydration of the container, as its last children.
- Event replay: the directive declares no template or host listeners, so it adds no `jsaction` and nothing of its own is queued or replayed; `scroll` is not a replayed event type, and the first measurement after hydration reads the scroll position the page has by then. The building-blocks rule for handlers of a Replayed event (decided at triage on 2026-09-26) does not affect Sticky.
- Incremental hydration and `@defer`: library templates contain no `@defer`; a consumer may defer the Sticky entry point. Inside a dehydrated block the element is its Dehydrated state and sticks through CSS; when the block hydrates (for example `hydrate on viewport`), the directive measures and the classes and outputs start. Inside `@defer (hydrate never)` the element keeps sticking at the right widths and its classes stay `is-anchored is-at-top` (building-blocks 1.11 decision 7: Sticky is fully functional as dehydrated HTML). Plain `@defer` renders the directive on the client, which measures in its first render callback.
- Hydration boundary: none is required. The Sticky range is the DOM parent whatever block the parent belongs to, and a block is always hydrated after the blocks around it, so the parent is hydrated when the sticky element's directive runs.
- Breakpoint handoff: the class contract reads `canStick` only inside the measurement, which runs in render callbacks after the Breakpoint service went live (ADR 0014), so it never sees the Server breakpoint on the client. The rendered-state rule of building-blocks 1.5 is met without a rendered-state signal: no change detection pass renders the gate, because the gate is a media query the browser applies at the viewport change itself and `data-nfs-sticky-on` never changes with the breakpoint, so the host rectangle the measurement reads already reflects the breakpoint `canStick` reports.
- Prerendering: identical to server rendering; no request token is read (rule 11).

### Sass and custom CSS

- Foundation's `foundation-sticky` Export mixin is reused untouched; the directives bind only classes it already styles (`.sticky`, `.sticky-container`, and the four State classes).
- The `nfs-sticky` Library mixin adds two things Foundation's Sass cannot express, each the smallest rule for its reason: the `stickyOn` gate (`position: sticky` on `.sticky[data-nfs-sticky-on=...]` inside Foundation's `breakpoint()` media queries, because Foundation has no `position: sticky` rule and no per-breakpoint sticky class), and `width: auto` on `.sticky.is-stuck` (D14). The full list, the reused settings, and what breaks without the include are in the Sass subsection under Further Notes.
- The per-instance inset is an inline style from a host binding, not library CSS; the sentinels' inline styles belong to elements the directive creates. No directive declares `styles` or `styleUrl`.

## Testing Decisions

A good test asserts what a visitor or a consumer observes: whether the element is pinned (its rectangle against the stick line), the State classes, the `isStuck` and `edge` values, the outputs and their payloads, the server HTML, and the development warnings; never private fields, observer objects, or listener bookkeeping. There is no prior art in the new repository; the patterns are the prototype's geometric Playwright suite, Angular's `renderApplication`-based SSR tests, the harness from the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md), and the node-level Sass compile test from ADR 0012.

Story ids: `sticky--basic`, `sticky--stick-to-bottom`, `sticky--margins`, `sticky--sticky-on`, `sticky--navigation`, `sticky--anchor-range-recipe`, `sticky--scroll-container`, `sticky--overflow-hidden-ancestor`, `sticky--outputs`. The Storybook preview stylesheet includes `foundation-sticky`, `nfs-sticky`, and `nfs-breakpoint-properties`. Stories other than `sticky--sticky-on` set `stickyOn="all"` so they behave at any iframe width.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `runOnly` set to the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`, building-blocks 1.10); every story whose stuck element overlaps content gives it an opaque background (1.4.3). Play functions scroll the story's own document or scroll container with `behavior: 'instant'` (the Storybook preview includes the Smooth Scroll spec's `nfs-smooth-scroll`, which makes a root scroll without a `behavior` smooth) and assert after the next animation frame:

- `sticky--basic`: at scroll 0 the element has `is-anchored is-at-top`; scrolled into the range it has `is-stuck is-at-top` and its top equals the inset; scrolled past, `is-anchored is-at-bottom`; the parent contains two `[data-nfs-sticky-sentinel]` spans and its height is unchanged from before the directive measured.
- `sticky--stick-to-bottom`: the three states with `is-stuck is-at-bottom` while pinned and the element's bottom at the viewport bottom minus the inset.
- `sticky--margins`: `marginTop="3"` pins the top at 3 em of the element's font size; `[marginTop]="0"` pins at 0.
- `sticky--sticky-on`: shows the canonical `data-nfs-sticky-on` for each control value; at the iframe's current width, `is-stuck` appears only when the computed `position` is `sticky` (the viewport sweep is Playwright's).
- `sticky--navigation`: a page-spanning container with a title bar and a `nav` landmark; one large `scrollTo` jump into the range yields `is-stuck` (the backstop); tabbing to a link far down leaves that link's rectangle clear of the stuck bar (the `scroll-padding-top` recipe).
- `sticky--anchor-range-recipe`: Foundation's two-anchor example rewritten with the container spanning the anchors; the element unsticks where the bottom anchor ends.
- `sticky--scroll-container`: inside an `overflow: auto` panel, scrolling the panel (not the window) pins the element and sets `is-stuck`; scrolling the window leaves it unchanged.
- `sticky--overflow-hidden-ancestor`: inside an ancestor carrying Foundation's `.overflow-hidden` Prototype class (the clash Foundation's `.off-canvas-wrapper` has without the `nfs-off-canvas` include) the element does not pin and never reports `is-stuck`; the same markup with that class replaced by an inline `overflow: clip` (no Foundation class exists for it) pins and reports it.
- `sticky--outputs`: a log shows `stuck: top`, `unstuck: bottom`, `stuck: top`, `unstuck: top` for a scroll down through the range and back up; `isStuck()` read through `#s="nfsSticky"` matches the log.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

Fixtures use a fixed-height scroll container as root so geometry is deterministic:

- Host bindings: `.sticky` added; `top` and `bottom` inline values for both `stickTo` values; `data-nfs-sticky-on` canonical values for every Breakpoint query form; inputs seeded from `nfsStickyDefaultsToken` and overridden by bound inputs; an unparsable margin falls back to the default.
- Transitions and outputs: scrolling through the range in steps and in single jumps produces the exact output sequence and payloads, one emission per transition, with signals already written when the handler runs; the first measurement after a mid-range start emits `stuck` once; destroy emits nothing.
- Backstop: a single jump across both bands updates the state within one animation frame.
- Size changes: growing the host's height moves the unstick point (far band rebuilt); growing the container extends the range.
- Gate: with a fake `MediaMatcher` below the query the state stays anchored and the observers and listener are torn down (no measurement on scroll); crossing the query re-measures without a scroll.
- Scroll container: the walk picks the nearest `auto`, `scroll`, or `hidden` ancestor, skips `clip` and `visible`, and treats `body` and the root as the viewport.
- Sentinels: appended as the last children, absolutely positioned, removed on destroy; the container's size is unchanged.
- Development warnings: each of the five fires once for its case and not for the correct case; warning 5 fires when a focused link ends up entirely under a stuck bar without `scroll-padding` and not with it, and its `focusin` listener is absent while the element is not stuck.
- Zoneless: runs with zoneless change detection and `whenStable()`; in a zone-based fixture, scrolling does not start an application tick unless a signal changed.

### 3. Node-level Vitest

- Pure logic (table-driven): the state derivation for both `stickTo` values, before, inside, and after the range, at the 1 px tolerance on each side, with the gate open and closed, and with a scroll container offset from the viewport; the gate canonicalisation (`''`, `all`, `medium`, `medium up`, `large only`, `medium down`, extra whitespace, malformed).
- SSR smoke, under `npx nx test <lib>` in `sticky.ssr.spec.ts` through the shared `renderServer()` helper (`npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not): a fixture with a top and a bottom Sticky and one with `stickyOn="large only"`. Assert `whenStable()` resolves; the server HTML carries `.sticky-container`, `.sticky`, `is-anchored is-at-top`, the canonical `data-nfs-sticky-on`, and the inline insets; no `jsaction` on the sticky elements; no sentinel spans.
- Sass compile: compiling Foundation with a custom `$breakpoints` map, then the library, then `@include foundation-sticky; @include nfs-sticky;` emits one gated `position: sticky` rule per Breakpoint query form at the custom thresholds (in em, equal to Foundation's own media queries), the `all` rule, and the `width: auto` rule, and nothing else.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Viewport sweep on `sticky--sticky-on`: at 639 px and 640 px, 1023 px and 1024 px, the computed `position` and `is-stuck` switch together for `medium`, `large only`, and `medium down`.
- Real input: `page.mouse.wheel` and keyboard End, Home, and Page Down on `sticky--navigation` keep the classes equal to the pinned geometry after every step (the prototype scrolled only programmatically).
- Hash jump: navigating to a fragment deep in the range yields `is-stuck` without further scrolling.
- Focus not obscured (2.4.11): on `sticky--navigation`, Tab forward and backward through every link while the bar is stuck; no focused link is entirely covered by the stuck bar, and no development warning is logged.
- Reflow (1.4.10): at 320 px wide with `stickyOn="all"` and a stuck element with horizontal margins, the document has no horizontal scroll.

Against the prerendered fixture app:

- JavaScript disabled: at 1280 px wide, after scrolling, the element's top equals its inset (it sticks); at 480 px it scrolls away (gate closed); axe passes on the server HTML.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; after a reload in the middle of the range the element gains `is-stuck` after hydration with no error.
- `@defer (hydrate on viewport)`: a sticky element inside the block sticks before the block hydrates, gains its classes after, and the block hydrates without NG05xx while the container holds a sibling view that has not hydrated.
- `@defer (hydrate never)`: the element sticks and keeps `is-anchored is-at-top`; no error is logged.

## Out of Scope

- Ranges set by anchors outside the Sticky range (`anchor`, `topAnchor`, `btmAnchor`), and any JavaScript `position: fixed` emulation that would honour them.
- A container generated when the consumer wrote none (`container` Option); the consumer writes the container.
- Sticking to both edges (Foundation's unimplemented `both` placeholder) and horizontal sticking (`left`/`right`).
- Shrink-on-scroll and other scroll-linked effects: consumer CSS on `.is-stuck`; scroll-driven animations are out of the Browser target.
- Setting `scroll-padding` automatically: it is required consumer CSS (2.4.11), checked by development warning 5 and the e2e case, because only the consumer knows what a stuck element overlaps and one scroll container may hold several stuck elements.
- Changing Foundation's `.off-canvas-wrapper` overflow: the [Spec: Off-canvas](../issues/25-spec-off-canvas.md) owns it; its `nfs-off-canvas` mixin sets `overflow: clip; display: flow-root` on the wrapper, confirmed by case 3 of the [Prototype: Sticky measurement refinements](../issues/63-prototype-sticky-measurement.md), so Sticky works inside it.
- Sticky table headers: CDK and Material tables already use native `position: sticky`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | `[nfsSticky]` on the sticky element and `[nfsStickyContainer]` on its parent | ADR 0001 and building-blocks Table A; Foundation's markup carries both elements | A component that generates the container (Foundation's `wrap`); dropping the container directive (ADR 0001 names it) |
| D2 | Native `position: sticky`; the Sticky range is the parent box | Correct first paint with no script, no layout jump, in the Browser target; confirmed in three engines by the prototype | Porting Foundation's `position: fixed` emulation (no server paint, re-measures on every scroll, loses the grid width) |
| D3 | `anchor`, `topAnchor`, `btmAnchor` are Dropped options with a container recipe and a development warning for leftover attributes | An input that is never read promises behaviour the directive cannot give; a bound unknown input is a compile error, which is the clearest signal | Keeping them as accepted no-op inputs for Foundation parity (the prototype's suggestion) |
| D4 | The `stickyOn` gate is CSS in `nfs-sticky`, keyed on `data-nfs-sticky-on` and built with Foundation's `breakpoint()` from the consumer's `$breakpoints`; `NfsMediaQuery.is(stickyOn)` gates only the class contract | Server HTML and `hydrate never` stick at the right widths; no breakpoint swap at hydration; CSS and JavaScript share the Breakpoint map (the Breakpoint service's drift check covers it) | An inline `position` binding from `NfsMediaQuery` (the building-blocks sketch): renders the Server breakpoint, so desktop pages do not stick before hydration |
| D5 | Offsets are inline `top`/`bottom` insets in em; the unused edge is bound `auto` | Per-instance values; inline beats Foundation's `top: 0`/`bottom: 0` on `.is-stuck`/`.is-anchored` classes, and `auto` on the other edge removes Foundation's stray `bottom: 0` from the equation | Margins as Foundation applied them (layout jump); a custom property per instance read by library CSS (more CSS for the same result) |
| D6 | State from the host's rectangle against the stick line, by one pure function | Reports what the browser did, independent of container padding and child order; testable without a browser | The prototype's sentinel-geometry thresholds (depend on padding and on the element being the first child) |
| D7 | Absolutely positioned sentinels appended at the container's end | No layout shift, no extra flex or grid items, no interference with nodes hydration has yet to claim | The prototype's in-flow sentinels inserted as first and last child (2 px growth, hydration cursor risk) |
| D8 | IntersectionObserver plus a rAF-throttled passive scroll backstop plus ResizeObserver, torn down while the gate is closed | The prototype's correctness gap for instantaneous jumps; `dynamicHeight` always on; Foundation's pause | Observers alone (stale after jumps); a scroll listener alone (misses layout-driven movement) |
| D9 | Observer root and listener target are the nearest scroll container | Classes agree with the pixels in `overflow: auto` panels and never report "stuck" under an `overflow: hidden` wrapper; the walk runs once per instance | Window only (the prototype; classes lie under any scroll container) |
| D10 | `isStuck` plus `edge` as the public state; no `isAtTop`/`isAtBottom`/`isAnchored` signals | Two values determine all four State classes; 1.3's `isX` rule for the one boolean | Four booleans, three of them derived |
| D11 | `stuck`/`unstuck` payload: the edge stuck to, and the end rested at | Foundation's `stuckto:<stickTo>` and `unstuckfrom:<rest end>` namespaces; building-blocks 1.4 mapping | `void` outputs (lose Foundation's namespace information) |
| D12 | Five development-mode warnings | Each catches a silent failure the prototype, Foundation's docs markup, or a missing 2.4.11 `scroll-padding` produces; stripped from production | Documentation only (the prototype's alternative) |
| D13 | `nfsStickyDefaultsToken`, no parent token | Building-blocks 1.4 defaults rule; nothing injects a Sticky parent | `nfsStickyToken` from the building-blocks sketch |
| D14 | `width: auto` on `.sticky.is-stuck` in `nfs-sticky` | Foundation's `width: 100%` sized a `position: fixed` element to the viewport; an in-flow element keeps its container width, and 100% plus horizontal margins would overflow (WCAG 1.4.10) | Leaving Foundation's width (overflow with margins) |
| D15 | WCAG 2.4.11 is met by required consumer `scroll-padding`, checked by development warning 5 and a Playwright case; 1.4.3 by a required opaque background on overlapping stuck elements | The overlap depends on the page, which only the consumer knows; the checks turn a silent failure into a warning and a failing test | The directive writing `scroll-padding` on the scroll container (a global write that several stuck elements would fight over); documenting it as advice only |

### Usage examples

A sticky column (Foundation's first docs example):

```html
<div class="grid-x">
  <div class="cell small-6" nfsStickyContainer>
    <div nfsSticky [marginTop]="0">
      <img class="thumbnail" src="assets/rectangle-3.jpg" alt="Product photo">
    </div>
  </div>
  <div class="cell small-6"><!-- long content --></div>
</div>
```

A sticky title bar for the whole page (Foundation's navigation example, with the container spanning the page instead of wrapping only the bar):

```html
<div nfsStickyContainer>
  <header class="title-bar" nfsSticky [marginTop]="0" stickyOn="all">
    <div class="title-bar-left">...</div>
  </header>
  <main>...</main>
</div>
```

```css
/* Focus not obscured (WCAG 2.4.11): keep focused elements clear of the stuck bar */
html { scroll-padding-top: 3.5rem; }
```

Foundation's two anchors as a container recipe (`data-top-anchor="example2:top" data-btm-anchor="foo:bottom"`): place the container so it starts at `#example2` and ends at the bottom of `#foo`, for example by making `#example2` through `#foo` the children of one wrapper and putting the sticky element first in it:

```html
<div nfsStickyContainer>
  <aside nfsSticky>...</aside>
  <section id="example2">...</section>
  <section id="foo">...</section>
</div>
```

Stick to the bottom (the element last in its container):

```html
<div nfsStickyContainer>
  <article>...</article>
  <div class="callout" nfsSticky stickTo="bottom" [marginBottom]="0">Checkout</div>
</div>
```

Reading the state:

```html
<div nfsStickyContainer>
  <nav aria-label="On this page" nfsSticky #toc="nfsSticky" (stuck)="onStuck($event)">...</nav>
</div>
@if (toc.isStuck()) {
  <button type="button" nfsButton (click)="scrollToTop()">Back to top</button>
}
```

Inside a scrolling panel:

```html
<div class="panel" style="overflow: auto; max-height: 30rem;">
  <section nfsStickyContainer>
    <h3 nfsSticky [marginTop]="0" stickyOn="all">Section A</h3>
    ...
  </section>
</div>
```

Inside Foundation's off-canvas wrapper: the Off-canvas spec's `@include nfs-off-canvas;` already replaces the wrapper's `overflow: hidden` with `overflow: clip; display: flow-root`. A consumer who uses Foundation's wrapper without that include writes the same fix:

```css
/* overflow: hidden makes the wrapper a scroll container, so nothing inside can stick to the window */
.off-canvas-wrapper { overflow: clip; display: flow-root; }
```

Application defaults:

```ts
providers: [{provide: nfsStickyDefaultsToken, useValue: {stickyOn: 'large', marginTop: 0}}]
```

Deferred:

```html
@defer (hydrate on viewport) {
  <div nfsStickyContainer><div nfsSticky>...</div></div>
}
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This Plugin relies on Foundation's Export mixin `foundation-sticky` (the `.sticky`, `.sticky-container`, and State class rules, reused untouched, including `.sticky-container { position: relative }`, `.sticky { z-index: 0; transform: translate3d(0, 0, 0) }`, and `.sticky.is-stuck { z-index: 5 }`). Its documented custom CSS is the `nfs-sticky` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-sticky`.

1. Rules the mixin emits, each with its reason:
   - The gate: `.sticky[data-nfs-sticky-on='all'] { position: sticky; }`, and for each name in the consumer's `$breakpoints`, `.sticky[data-nfs-sticky-on='<name>']` inside `breakpoint(<name>)`, `.sticky[data-nfs-sticky-on='<name> only']` inside `breakpoint(<name> only)`, and `.sticky[data-nfs-sticky-on='<name> down']` inside `breakpoint(<name> down)`, each with the single declaration `position: sticky`. Foundation's Sass has no `position: sticky` rule at all (its JavaScript emulated sticking with `position: fixed`), and no Foundation class can express "sticky from this breakpoint", so the rule is new; it is built with Foundation's `breakpoint()` mixin as building-blocks 1.11 decision 8 allows. At specificity 0,2,0 and emitted after `foundation-sticky`, it also overrides Foundation's `.sticky.is-stuck { position: fixed }` and `.sticky.is-anchored { position: relative }` at the widths where the gate is open; below it, Foundation's `.sticky { position: relative }` is the ungated state.
   - `.sticky.is-stuck { width: auto; }`, adjusting Foundation's `width: 100%`, which existed to size the `position: fixed` element to the viewport (D14).
2. Foundation settings, mixins, and functions reused: `$breakpoints` and `breakpoint()` (so the thresholds are the consumer's, in em, identical to Foundation's own media queries); no literal values are copied and the mixin has no parameters.
3. Custom properties: none. The inset is an inline `top` or `bottom` from a host binding. The sentinels' inline styles are set by the directive on elements Foundation knows nothing about (listed under Implementation level, step 3), so they need no library CSS and work even without the include.
4. Motion classes: none; no transition or animation is added or awaited, so the mixin emits no `prefers-reduced-motion` rule.
5. What visibly breaks when the include is missing: the element never sticks at any width, because Foundation's `.sticky { position: relative }` stays. The class contract reports the truth (the host never sits at the stick line, so it is never stuck), which also means Foundation's `.sticky.is-stuck { position: fixed; width: 100% }` never applies. Nothing else changes.

### Platform features to adopt when the browser target moves

- Container scroll-state queries (`container-type: scroll-state` with `@container scroll-state(stuck: top)`, Chromium 133 only, Baseline limited per webstatus.dev on 2026-09-26): when in target, consumers can style the stuck state in pure CSS, and the directive's sentinels, observers, and scroll backstop could be replaced by `scroll-state` queries for styling, keeping the directive only for the `isStuck` signal and the outputs (which CSS cannot emit). It would also make stuck styling work inside `hydrate never`.
- `scrollend` (out of target): no need; the rAF backstop already measures once per frame.

### Foundation behaviour changed or dropped

- Dropped jQuery-only behaviour: `$element.wrap()`/`unwrap()` to create the container; `$.fn.offset()` anchor positions; namespaced window scroll listeners; `data-resize`/`data-mutate` stamping and the `resizeme`/`mutateme` triggers (replaced by `ResizeObserver` and `IntersectionObserver`); the window `load` wait (render callbacks run after hydration; late image loads resize the container, which the `ResizeObserver` sees).
- Dropped emulation: `position: fixed` while stuck, inline `max-width` copied from the container, the container's inline height, margins applied on stick and removed on unstick, and the `transitionend` re-measure.
- Dropped options: `anchor`, `topAnchor`, `btmAnchor` (recipe above), `container`, `stickyClass`, `containerClass`, `dynamicHeight`, `checkEvery`.
- Changed: the Sticky range is the parent box (Foundation's default was the whole document); `em` resolves against the element's font size; any scroll container is supported, not only the window.
