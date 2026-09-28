# Spec: Sticky

Ticket: [Spec: Sticky](../issues/28-spec-sticky.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

Foundation's Sticky Plugin keeps an element (a sidebar, a table of contents, a title bar) in view while the page scrolls past a range, and exposes that state through the State classes `.is-stuck`, `.is-anchored`, `.is-at-top`, and `.is-at-bottom` plus the `sticky.zf.stuckto:*` and `sticky.zf.unstuckfrom:*` events. It does this with a jQuery emulation of what CSS now does natively: it measures anchors on window `load`, recomputes on every scroll, switches the element to `position: fixed`, copies the container's width into an inline `max-width`, and freezes the container's height so the layout does not collapse. None of it runs on the server, so the server HTML of a Foundation page never sticks until the Plugin has measured; the Breakpoint query in `stickyOn` needs Foundation's `meta.foundation-mq` handshake, which needs a rendered stylesheet; and the element jumps between `relative` and `fixed` positioning with margins applied and removed around the switch.

An Angular developer who builds on Foundation's Sass wants Foundation's Sticky elements, Structural classes, and State classes on an Angular page without jQuery and without writing any of those classes by hand, a sticky element that already sticks in server HTML, in prerendered pages, and inside dehydrated `@defer` blocks, a class contract and outputs that report what the browser actually does, and an honest account of the Foundation Options the platform cannot honour, with a recipe for each.

## Solution

Two attribute directives on the elements the developer writes, which bind every Sticky class; the developer writes none ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)). `[nfsSticky]` sits on the sticky element, binds `.sticky`, and binds its offset from `marginTop` or `marginBottom` as an inline `top` or `bottom` in em. The Library mixin `nfs-sticky` turns `.sticky` into `position: sticky` above the `stickyOn` breakpoint, with media queries built from the consumer's own `$breakpoints` by Foundation's `breakpoint()` mixin, so the element sticks correctly at every viewport width from the server HTML alone, before any script runs. `[nfsStickyContainer]` sits on the element Foundation marks `[data-sticky-container]` and binds `.sticky-container`. Each is written beside the directive of the element it sits on (a Title Bar's `nfsTitleBar`, a grid cell's `nfsCell`), and neither hosts the other's directives nor is hosted. The browser pins the element; its Sticky range is its parent element's box.

After the first render the directive measures, in the browser, whether the element is pinned and at which end of its range it rests, and binds Foundation's State classes from that. It exposes the result as the read-only signals `isStuck` and `edge` and emits the Completion outputs `stuck` and `unstuck` with the edge as payload. Measurement uses two invisible sentinels inside the container observed by `IntersectionObserver`, a `requestAnimationFrame`-throttled scroll listener that catches instantaneous jumps the observers miss, and `ResizeObserver` for size changes, all against the element's real scroll container. Foundation's anchor Options (`anchor`, `topAnchor`, `btmAnchor`) have no counterpart, because `position: sticky` cannot bound an element by anything but its containing block; the documented recipe is to make the container span the wanted range. Sticky has no Variant class, so it has no Variant input; a developer who wants a stuck element to look different binds a class of their own from `isStuck()`.

## User Stories

1. As an Angular developer using Foundation's Sass, I want to write Foundation's Sticky elements with `nfsSticky` and `nfsStickyContainer` in place of `class="sticky" data-sticky` and `data-sticky-container`, so that I keep Foundation's docs element structure and CSS and write no Foundation class.
2. As an Angular developer, I want the directives to bind `.sticky` and `.sticky-container` for me, so that I write neither class, as Foundation's own title-bar example already leaves `.sticky` out.
3. As an Angular developer, I want the element to stick through native `position: sticky`, so that it never jumps between flow and `position: fixed` and never needs a frozen container height.
4. As a site visitor on a server-rendered or prerendered page, I want the sidebar to stick while I scroll before the application has hydrated, so that the page behaves the same whether or not scripts have loaded.
5. As a site visitor with JavaScript disabled, I want a sticky element to stick at the widths the developer chose, so that the layout still works.
6. As an Angular developer, I want `stickTo="bottom"` to pin the element to the bottom of the viewport, so that I can build sticky footers and action bars as Foundation documents.
7. As an Angular developer, I want `marginTop` and `marginBottom` in em as in Foundation, so that the gap between the stuck element and the viewport edge keeps Foundation's meaning.
8. As an Angular developer, I want `stickyOn="large"` to keep the element in normal flow below the large breakpoint, so that small screens do not lose space to a pinned element.
9. As an Angular developer, I want `stickyOn` to accept every Breakpoint query form (`medium`, `medium up`, `large only`, `medium down`, `all`), so that it reads like Tooltip's `showOn` and Equalizer's `equalizeOn`.
10. As an Angular developer who customised `$breakpoints` in Sass, I want the `stickyOn` gate to switch at my breakpoints, so that the gate agrees with the rest of my Foundation CSS.
11. As an Angular developer, I want the directive to bind `.is-stuck` while the element is pinned and `.is-anchored` otherwise, so that Foundation's Sticky CSS, and CSS I migrate from a Foundation site, keeps applying.
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
23. As an Angular developer, I want a development warning when the container is not positioned, so that I add `nfsStickyContainer` before the class contract drifts.
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
42. As an Angular developer, I want to write `nfsSticky` beside `nfsTitleBar`, `nfsTopBar`, or `nfsCallout`, and `nfsStickyContainer` beside `nfsCell`, on one element, so that a sticky bar, a sticky callout, or a sticky grid column needs no extra element and each directive keeps its own classes.
43. As an Angular developer, I want to style a stuck element (a shadow, a smaller logo) through a class of my own bound from `isStuck()`, so that my templates and stylesheets name no Foundation or library class.

## Implementation Decisions

### Foundation contract

From the Foundation inventory (Sticky section) and `Sticky.defaults` in Foundation's Sticky plugin source:

| Foundation | Kind | Library counterpart |
| --- | --- | --- |
| `.sticky[data-sticky]` | Structural class and Plugin attribute | `[nfsSticky]`, which binds `.sticky`; the consumer writes neither |
| `[data-sticky-container]` and `.sticky-container` | Plugin attribute, Structural class added by the Plugin | `[nfsStickyContainer]`, which binds `.sticky-container`; the consumer writes neither |
| `.is-stuck`, `.is-anchored`, `.is-at-top`, `.is-at-bottom` | State classes | Host class bindings from `isStuck` and `edge` |
| `stickTo` (`'top'`) | Option | `stickTo` input, same default |
| `marginTop` (`1`, em) | Option | `marginTop` input, same default and unit |
| `marginBottom` (`1`, em) | Option | `marginBottom` input, same default and unit |
| `stickyOn` (`'medium'`) | Option (Breakpoint query) | `stickyOn` input, same default |
| `anchor`, `topAnchor`, `btmAnchor` (`''`) | Options | Dropped options: the platform cannot honour them (recipe below). Category: `platform-or-a11y` |
| `container` (`'<div data-sticky-container></div>'`) | Option (HTML string) | Dropped option: the consumer writes the container element with `nfsStickyContainer` (building-blocks 1.4, 1.1). Category: `jquery-or-dom-plumbing` |
| `stickyClass`, `containerClass` | Options (class names) | Dropped options: the classes are the contract (building-blocks 1.4), and no Foundation or library class name is an input value ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)). Category: `variant-as-class` |
| `dynamicHeight` (`true`) | Option | Dropped option: `ResizeObserver` always follows the height. Category: `superseded` |
| `checkEvery` (`-1`) | Option | Dropped option: replaced by the throttled scroll backstop. Category: `superseded` |
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

Foundation's `foundation-sticky` Export mixin defines two Structural classes, `.sticky-container` and `.sticky`, and four State classes, which it styles only in compounds with `.sticky`; it defines no Variant class. So `NfsSticky` has no Variant input, declares no Variant registry, writes no Variant property, and requests no Runtime check ([ADR 0040](../adr/0040-variant-input-types.md)). Under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) the consumer writes none of these classes, and the classes on the elements Sticky sits on come from the directives written beside it:

| Foundation class or attribute | Kind | Element | Set by | Notes and owner |
| --- | --- | --- | --- | --- |
| `.sticky` + `[data-sticky]` | Structural class, Plugin attribute | The sticky element | `NfsSticky`, selector `[nfsSticky]`, static host `class: 'sticky'` | The consumer writes neither; a redundant `class="sticky"` merges with the host class and is not reported (building-blocks 1.4). This spec |
| `.sticky-container` + `[data-sticky-container]` | Structural class (added by Foundation's Plugin), Plugin attribute | The sticky element's parent | `NfsStickyContainer`, selector `[nfsStickyContainer]`, static host `class: 'sticky-container'` | Foundation's `position: relative` on it is what positions the sentinels; the directive is the only way to get the class (D1). This spec |
| `.is-stuck` | State class | The sticky element | `[class.is-stuck]="isStuck()"` | This spec |
| `.is-anchored` | State class | The sticky element | `[class.is-anchored]="!isStuck()"` | This spec |
| `.is-at-top` | State class | The sticky element | `[class.is-at-top]="edge() === 'top'"` | This spec |
| `.is-at-bottom` | State class | The sticky element | `[class.is-at-bottom]="edge() === 'bottom'"` | This spec |
| `[data-sticky-on]` | Plugin attribute (Option) | The sticky element | `[attr.data-nfs-sticky-on]` carrying the canonical Breakpoint query | Library-owned attribute the `nfs-sticky` gate rules key on; a different name from Foundation's so a leftover static `data-sticky-on` never collides with the binding. An attribute, not a class, so the class rule does not touch it. This spec |
| `.title-bar`, `.title-bar-left` (the title-bar usage example and `sticky--navigation`) | Structural classes of the Title Bar | A bar written with `nfsSticky` beside it, and its left section | `NfsTitleBar` (`[nfsTitleBar]`) and `NfsTitleBarLeft` (`[nfsTitleBarLeft]`) | [Spec: Top Bar](../issues/86-spec-top-bar.md) |
| `.top-bar` | Structural class of the Top Bar | A bar written with `nfsSticky` beside it | `NfsTopBar` (`[nfsTopBar]`) | [Spec: Top Bar](../issues/86-spec-top-bar.md) |
| `.callout` (the stick-to-bottom usage example) | Structural class of the Callout | A callout written with `nfsSticky` beside it | `NfsCallout` (`[nfsCallout]`) | [Spec: Callout](../issues/89-spec-callout.md) |
| `.grid-x`, `.cell`, `.small-6` (the column examples) | Utility classes of the XY Grid | The grid, the cell that is the Sticky container, and the content cell | `NfsGridX` (`[nfsGridX]`) and `NfsCell` (`[nfsCell]`) with its `size` Variant input (`size="6"`, a bare value, so the Zero breakpoint's `.small-6`), written beside `nfsStickyContainer` | [Spec: XY Grid](../issues/99-spec-xy-grid.md), open: the names are building-blocks 1.3's and 1.4's and the Magellan spec's, aligned by the class-rule consistency review if that spec names them otherwise |
| `.thumbnail` (the column examples) | Structural class of the Thumbnail | The image inside the sticky element | `img[nfsThumbnail]` | [Spec: Thumbnail](../issues/97-spec-thumbnail.md), open; the name is the Toggler spec's |

A State class written statically on the host (copied from a page Foundation's JavaScript rendered) is stripped on server and client, because each State-class binding always has a boolean value and Angular's styling resolution consults a static class only when every binding for it is `undefined`; no development check reports it (D16). `stickTo` stays an Option, not a Variant input: the classes it influences, `.is-at-top` and `.is-at-bottom`, are State classes from `edge`, which is `'bottom'` for an element with `stickTo: 'top'` once scrolled past its range.

### Hierarchy and DI shape

```
[nfsStickyContainer]  (.sticky-container, position: relative from Foundation;
 |                     on any parent element, beside nfsCell on a grid cell)
 '-- [nfsSticky]      (.sticky and the four State classes; its DOM parent is its Sticky range;
                       on any element, beside nfsTitleBar, nfsTopBar, or nfsCallout)
      injects: NfsMediaQuery, nfsStickyDefaultsToken (optional), ElementRef, DestroyRef, NgZone
```

- No parent token. The sticky element's range is its DOM parent, which is what CSS uses; DI would answer a different question (the declaration-site injector), and nothing else needs the instance. The building-blocks sketch named an `nfsStickyToken`; nothing injects it, so it is not created.
- `NfsStickyContainer` has no inputs, outputs, or DI and binds only its class, which is what ADR 0039 asks of a directive for a Structural class. Under the class rule it is the only way to get `.sticky-container`: the consumer writes no class, and a `Renderer2` write from `nfsSticky` onto its parent is not allowed, because ADR 0039's dated note permits that only for state with no first-paint value, and the container's `position: relative` is first-paint layout (D1).
- Composition by placement (building-blocks 1.9; the [Spec: Top Bar](../issues/86-spec-top-bar.md)'s D10): `nfsSticky` is written beside the class directive of the element it pins (`<header nfsTitleBar nfsSticky>`, `<div nfsTopBar nfsSticky>`, `<div nfsCallout nfsSticky>`) and `nfsStickyContainer` beside the one of the element that bounds the range (`<div nfsCell size="6" nfsStickyContainer>`). Neither hosts another directive and none hosts them, because host directives are static and Sticky may sit on any element: a bar that hosted `NfsSticky` would pin every bar (D18). None of `.title-bar`, `.top-bar`, or `.cell` sets `position`; `.callout` sets `position: relative` at the same specificity as `.sticky`, and the `nfs-sticky` gate rule (0,2,0) overrides both where it is open.
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

1. The parent element's computed `position` is `static`: "ngx-foundation-sites: the parent of an nfsSticky element is not positioned. Add nfsStickyContainer to the parent so the Sticky state is measured correctly."
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
| Sticky element | None from the directive | A sticky site header is a `header` or `nav` the consumer writes, with `nfsTitleBar` or `nfsTopBar` beside `nfsSticky` for Foundation's bars; a second `nav` on the page needs a unique `aria-label` (APG landmark regions) |
| Container | None | |
| Sentinels | `aria-hidden="true"` | Empty and out of the accessibility tree |

| Key | Behaviour |
| --- | --- |
| None | The directive handles no keys. Home, End, Page Up and Page Down, and Space scroll natively; the scroll backstop keeps the classes right after such jumps |

WCAG 2.2 AA requirements (every criterion is a requirement, never a recommendation; building-blocks 1.10):

| Criterion | What Sticky requires | How it is met and checked |
| --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) | A stuck element must never entirely hide the element that has keyboard focus | Required usage, stated in the directive's documentation: when a stuck element can overlap focusable content (a page-spanning header or footer), the scroll container carries `scroll-padding-top` (for `stickTo: 'top'`) or `scroll-padding-bottom` (for `'bottom'`) of at least the stuck element's height plus its inset, so the browser scrolls focused elements clear of it. Stuck sidebars in their own column overlap nothing and need nothing. The library cannot compute this (only the consumer knows what overlaps what, and one scroll container may hold several stuck elements), so it checks instead: development warning 5 fires when a newly focused element is entirely covered by a stuck `nfsSticky`; the `sticky--navigation` story and a Playwright case assert every focused link stays visible. |
| 1.4.3 Contrast (Minimum) | Text of a stuck element that overlaps page content, and the content under it, stays readable | Required usage: a stuck element that overlaps content has an opaque background. A Title Bar (`nfsTitleBar`) paints `$titlebar-background`, opaque on Foundation's defaults, and a Callout (`nfsCallout`) paints its callout background. A Top Bar (`nfsTopBar`) paints `$topbar-background`, so it is opaque only while that setting is. The Top Bar spec's required `$topbar-background: $white` is opaque; a transparent Top Bar, which Foundation's Sass documents (its `$topbar-submenu-background` setting exists for that case), is not, and the Top Bar spec's compile-time check composites a transparent bar over `$body-background`, which says nothing about the content a stuck bar covers. A stuck Top Bar that overlaps content therefore needs an opaque `$topbar-background`. Foundation's `.sticky` paints nothing and the library cannot choose a colour, so any other overlapping element (a plain `nav` or `aside`) gets its background from the consumer's own class or style; stories that overlap content pin a component that paints one, and the documentation states the rule. |
| 1.4.10 Reflow | Sticking never causes horizontal scrolling at 320 CSS px | The element stays in flow at its container width; `nfs-sticky` replaces Foundation's `width: 100%` on `.is-stuck` with `width: auto`, which would otherwise overflow by the element's horizontal margins (D14). The default `stickyOn: 'medium'` also keeps small viewports, which include 400% zoom of a 1280 px window, free of pinned elements. |
| 1.4.4 Resize Text | The inset scales with text | Insets are in em. |
| 2.4.7 Focus Visible | Unchanged | The directive adds no focusable element and no style to focus indicators; 2.4.11's `scroll-padding` also keeps indicators clear of a stuck bar. |
| 2.5.8 Target Size (Minimum), 2.5.7 Dragging Movements, 1.4.11 Non-text Contrast | Not applicable | Sticky adds no target, no drag, and no user-interface component; the sentinels are 1 px, `pointer-events: none`, and hidden from assistive technology. |

Stories are gated by axe with the WCAG 2.2 AA rule set (Testing Decisions); axe does not test 2.4.11 or overlap contrast, which is why the Playwright cases and warning 5 exist.

### Rendered HTML

Consumer markup (Foundation's column example, with no class written):

```html
<div nfsGridX>
  <div nfsCell size="6" nfsStickyContainer>
    <div nfsSticky [marginTop]="0">
      <img nfsThumbnail src="..." alt="...">
    </div>
  </div>
  <div nfsCell size="6">...long content...</div>
</div>
```

Server HTML and hydrated DOM before the first measurement (identical):

```html
<div nfsgridx="" class="grid-x">
  <div nfscell="" size="6" nfsstickycontainer="" class="cell sticky-container small-6">
    <div nfssticky="" class="sticky is-anchored is-at-top"
         data-nfs-sticky-on="medium" style="top: 0em; bottom: auto;">
      <img nfsthumbnail="" src="..." alt="..." class="thumbnail">
    </div>
  </div>
  <div nfscell="" size="6" class="cell small-6">...long content...</div>
</div>
```

Every class comes from a directive's host binding, so the server HTML carries all of them. Static template attributes, directive selectors included, are serialised in lowercase; the order of class tokens follows directive matching and is not part of the contract; the grid and thumbnail classes are the XY Grid and Thumbnail specs', shown with Foundation's names.

Hydrated, after measuring, while the element is pinned (the grid wrapper and the content cell are unchanged and left out):

```html
<div nfscell="" size="6" nfsstickycontainer="" class="cell sticky-container small-6">
  <div nfssticky="" class="sticky is-stuck is-at-top"
       data-nfs-sticky-on="medium" style="top: 0em; bottom: auto;">
    <img nfsthumbnail="" src="..." alt="..." class="thumbnail">
  </div>
  <span data-nfs-sticky-sentinel="top" aria-hidden="true"
        style="position: absolute; left: 0px; width: 1px; height: 1px; pointer-events: none; top: 0px;"></span>
  <span data-nfs-sticky-sentinel="bottom" aria-hidden="true"
        style="position: absolute; left: 0px; width: 1px; height: 1px; pointer-events: none; bottom: 0px;"></span>
</div>
```

After scrolling past the range: `class="sticky is-anchored is-at-bottom"`. With `stickTo="bottom"` the inline style is `top: auto; bottom: 1em;` and a pinned element carries `is-stuck is-at-bottom`. Below the `stickyOn` breakpoint the markup is the same and the gate rules do not match, so Foundation's `.sticky { position: relative }` applies and the element never carries `is-stuck`. The sentinels never appear in server HTML.

Beside a bar directive (the title-bar usage example), server HTML: `<header nfstitlebar="" nfssticky="" stickyon="all" class="title-bar sticky is-anchored is-at-top" data-nfs-sticky-on="all" style="top: 0em; bottom: auto;">`, with `<div nfstitlebarleft="" class="title-bar-left">` inside; each directive binds its own classes and neither touches the other's.

### Animation

None. Foundation's Sticky has no animation and no Motion class Option, and the library adds none: no `animate.enter`/`animate.leave`, no keyframes, no `transitionend` wait, no reduced-motion rule. A consumer may put a CSS transition on a class of its own bound from `isStuck()` (a shadow, a smaller logo; D17); that class and the State class flip at once and no Completion output waits for either, because the pinning itself is not animated (Foundation re-measured after `transitionend`; that listener is dropped).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the host bindings (`.sticky`, `.is-anchored`, `.is-at-top`, `data-nfs-sticky-on`, the inline inset) are all signal state known on the server, and the `nfs-sticky` gate rules are media queries, so the server HTML sticks correctly at every viewport width with no script (rule 1, rule 9). None of the host bindings reads the Breakpoint service, so the Server breakpoint does not affect the first paint and there is no breakpoint swap at hydration. This is why the gate is CSS and not a `position` binding from `NfsMediaQuery`: with the default Server breakpoint (`small`) and the default `stickyOn` (`medium`), such a binding would render `position: static` on the server, so desktop visitors would get a non-sticky page until hydration and forever inside `hydrate never`.
- Before hydration: the directive creates no nodes, reads no geometry, and adds no listener outside render callbacks (rules 3 to 5). The sentinels, the scroll-container walk, the observers, the scroll listener, and the development checks all start in the first render callback; the `afterRenderEffect` that builds them never runs on the server.
- Full hydration: host binding values equal the server's, so hydration changes no attribute; the first measurement then flips State classes if the page is not at the top (a class change, not a structural one). A consumer's own class bound from `isStuck()` (D17) follows the same timing: absent from server HTML, set by the first measurement that finds the element stuck. The sentinels are appended after hydration of the container, as its last children.
- Event replay: the directive declares no template or host listeners, so it adds no `jsaction` and nothing of its own is queued or replayed; `scroll` is not a replayed event type, and the first measurement after hydration reads the scroll position the page has by then. The building-blocks rule for handlers of a Replayed event (decided at triage on 2026-09-26) does not affect Sticky.
- Incremental hydration and `@defer`: library templates contain no `@defer`; a consumer may defer the Sticky entry point. Inside a dehydrated block the element is its Dehydrated state and sticks through CSS; when the block hydrates (for example `hydrate on viewport`), the directive measures and the classes and outputs start. Inside `@defer (hydrate never)` the element keeps sticking at the right widths and its classes stay `is-anchored is-at-top` (building-blocks 1.11 decision 7: Sticky is fully functional as dehydrated HTML). Plain `@defer` renders the directive on the client, which measures in its first render callback.
- Hydration boundary: none is required. The Sticky range is the DOM parent whatever block the parent belongs to, and a block is always hydrated after the blocks around it, so the parent is hydrated when the sticky element's directive runs.
- Breakpoint handoff: the class contract reads `canStick` only inside the measurement, which runs in render callbacks after the Breakpoint service went live (ADR 0014), so it never sees the Server breakpoint on the client. The rendered-state rule of building-blocks 1.5 is met without a rendered-state signal: no change detection pass renders the gate, because the gate is a media query the browser applies at the viewport change itself and `data-nfs-sticky-on` never changes with the breakpoint, so the host rectangle the measurement reads already reflects the breakpoint `canStick` reports.
- Prerendering: identical to server rendering; no request token is read (rule 11).

### Sass and custom CSS

- Foundation's `foundation-sticky` Export mixin is reused untouched; the directives bind only classes it already styles (`.sticky`, `.sticky-container`, and the four State classes), and the consumer writes none of them.
- The `nfs-sticky` Library mixin adds two things Foundation's Sass cannot express, each the smallest rule for its reason: the `stickyOn` gate (`position: sticky` on `.sticky[data-nfs-sticky-on=...]` inside Foundation's `breakpoint()` media queries, because Foundation has no `position: sticky` rule and no per-breakpoint sticky class), and `width: auto` on `.sticky.is-stuck` (D14). The full list, the reused settings, and what breaks without the include are in the Sass subsection under Further Notes.
- The per-instance inset is an inline style from a host binding, not library CSS; the sentinels' inline styles belong to elements the directive creates. No directive declares `styles` or `styleUrl`.

## Testing Decisions

A good test asserts what a visitor or a consumer observes: whether the element is pinned (its rectangle against the stick line), the State classes, the `isStuck` and `edge` values, the outputs and their payloads, the server HTML, and the development warnings; never private fields, observer objects, or listener bookkeeping. There is no prior art in the new repository; the patterns are the prototype's geometric Playwright suite, Angular's `renderApplication`-based SSR tests, the harness from the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md), and the node-level Sass compile test from ADR 0012.

Story ids: `sticky--basic`, `sticky--stick-to-bottom`, `sticky--margins`, `sticky--sticky-on`, `sticky--navigation`, `sticky--anchor-range-recipe`, `sticky--scroll-container`, `sticky--overflow-hidden-ancestor`, `sticky--outputs`. The Storybook preview stylesheet includes `foundation-sticky`, `nfs-sticky`, and `nfs-breakpoint-properties` (and, for the title bar of `sticky--navigation`, the `foundation-title-bar` and `nfs-title-bar` lines it already has). Stories other than `sticky--sticky-on` set `stickyOn="all"` so they behave at any iframe width.

Story markup follows the class rule (Storybook conventions, section 8; ADR 0039): no story element carries a Foundation or library class written in the template. Sticky elements are `nfsSticky` hosts and their parents `nfsStickyContainer` hosts; the bar in `sticky--navigation` is `nfsTitleBar` with `nfsTitleBarLeft`, the checkout bar in `sticky--stick-to-bottom` is `nfsCallout`, column layouts use the XY Grid's `nfsGridX` and `nfsCell` with `size`, images are `img[nfsThumbnail]`, and controls are `button[nfsButton]`, each imported from its own entry point. Inline `style` only for heights, tall pages, the scroll panel's `overflow: auto`, and the two overflow values `sticky--overflow-hidden-ancestor` compares (D19).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `runOnly` set to the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`, building-blocks 1.10); every story whose stuck element overlaps content pins a component that paints an opaque background, a Title Bar or a Callout (1.4.3). Play functions scroll the story's own document or scroll container with `behavior: 'instant'` (the Storybook preview includes the Smooth Scroll spec's `nfs-smooth-scroll`, which makes a root scroll without a `behavior` smooth) and assert after the next animation frame:

- `sticky--basic`: at scroll 0 the element has `is-anchored is-at-top`; scrolled into the range it has `is-stuck is-at-top` and its top equals the inset; scrolled past, `is-anchored is-at-bottom`; the parent contains two `[data-nfs-sticky-sentinel]` spans and its height is unchanged from before the directive measured.
- `sticky--stick-to-bottom`: the three states with `is-stuck is-at-bottom` while pinned and the element's bottom at the viewport bottom minus the inset.
- `sticky--margins`: `marginTop="3"` pins the top at 3 em of the element's font size; `[marginTop]="0"` pins at 0.
- `sticky--sticky-on`: shows the canonical `data-nfs-sticky-on` for each control value; at the iframe's current width, `is-stuck` appears only when the computed `position` is `sticky` (the viewport sweep is Playwright's).
- `sticky--navigation`: a page-spanning `nfsStickyContainer` holding a `header` with `nfsTitleBar` and `nfsSticky` beside each other and a `nav` landmark with links down the page; the bar carries `.title-bar` and `.sticky` with no class in the template; one large `scrollTo` jump into the range yields `is-stuck` (the backstop); tabbing to a link far down leaves that link's rectangle clear of the stuck bar (the `scroll-padding-top` recipe).
- `sticky--anchor-range-recipe`: Foundation's two-anchor example rewritten with the container spanning the anchors; the element unsticks where the bottom anchor ends.
- `sticky--scroll-container`: inside an `overflow: auto` panel, scrolling the panel (not the window) pins the element and sets `is-stuck`; scrolling the window leaves it unchanged.
- `sticky--overflow-hidden-ancestor`: inside an ancestor with an inline `overflow: hidden` (the clash Foundation's `.off-canvas-wrapper` has without the `nfs-off-canvas` include) the element does not pin and never reports `is-stuck`; the same markup with an inline `overflow: clip` instead pins and reports it. Both values are inline because the overflow value is what the story compares, Foundation has a class for only one of them, and its `.overflow-hidden` Prototype class is not written under the class rule while the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md) has not named its directive (D19).
- `sticky--outputs`: a log shows `stuck: top`, `unstuck: bottom`, `stuck: top`, `unstuck: top` for a scroll down through the range and back up; `isStuck()` read through `#s="nfsSticky"` matches the log.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

Fixtures use a fixed-height scroll container as root so geometry is deterministic:

- Host bindings: a test host that writes no class renders `.sticky` on the `nfsSticky` host and `.sticky-container` on its `nfsStickyContainer` parent; `nfsSticky` beside `nfsTitleBar` keeps `.title-bar` and adds `.sticky` and the State classes; a static `class="is-stuck"` on the host is absent while the element is not stuck, and no warning is logged (D16); `top` and `bottom` inline values for both `stickTo` values; `data-nfs-sticky-on` canonical values for every Breakpoint query form; inputs seeded from `nfsStickyDefaultsToken` and overridden by bound inputs; an unparsable margin falls back to the default.
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
- SSR smoke, under `npx nx test <lib>` in `sticky.ssr.spec.ts` through the shared `renderServer()` helper (`npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not): a fixture with a top and a bottom Sticky, one with `stickyOn="large only"`, and one `header` with `nfsTitleBar` beside `nfsSticky`, none of which writes a `class` attribute. Assert `whenStable()` resolves; the server HTML carries `.sticky-container`, `.sticky`, `is-anchored is-at-top`, the canonical `data-nfs-sticky-on`, and the inline insets, and the title-bar host carries both `title-bar` and `sticky`; no `jsaction` on the sticky elements; no sentinel spans.
- Sass compile: compiling Foundation with a custom `$breakpoints` map, then the library, then `@include foundation-sticky; @include nfs-sticky;` emits one gated `position: sticky` rule per Breakpoint query form at the custom thresholds (in em, equal to Foundation's own media queries), the `all` rule, and the `width: auto` rule, and nothing else.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Viewport sweep on `sticky--sticky-on`: at 639 px and 640 px, 1023 px and 1024 px, the computed `position` and `is-stuck` switch together for `medium`, `large only`, and `medium down`.
- Real input: `page.mouse.wheel` and keyboard End, Home, and Page Down on `sticky--navigation` keep the classes equal to the pinned geometry after every step (the prototype scrolled only programmatically).
- Hash jump: navigating to a fragment deep in the range yields `is-stuck` without further scrolling.
- Focus not obscured (2.4.11): on `sticky--navigation`, Tab forward and backward through every link while the bar is stuck; no focused link is entirely covered by the stuck bar, and no development warning is logged.
- Reflow (1.4.10): at 320 px wide with `stickyOn="all"` and a stuck element with horizontal margins, the document has no horizontal scroll.

Against the prerendered fixture app (its Sticky route writes directives only, as the stories do):

- JavaScript disabled: at 1280 px wide, after scrolling, the element's top equals its inset (it sticks); at 480 px it scrolls away (gate closed); axe passes on the server HTML.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; after a reload in the middle of the range the element gains `is-stuck` after hydration with no error.
- `@defer (hydrate on viewport)`: a sticky element inside the block sticks before the block hydrates, gains its classes after, and the block hydrates without NG05xx while the container holds a sibling view that has not hydrated.
- `@defer (hydrate never)`: the element sticks and keeps `is-anchored is-at-top`; no error is logged.

## Out of Scope

Each item carries its reason and its exclusion category.

- Ranges set by anchors outside the Sticky range (`anchor`, `topAnchor`, `btmAnchor`), and any JavaScript `position: fixed` emulation that would honour them: `position: sticky` confines an element to its containing block, so anchors outside the parent cannot be honoured ([ADR 0019](../adr/0019-sticky-native-range.md)). Category: `platform-or-a11y`.
- A container generated when the consumer wrote none (`container` Option): the consumer writes the container element with `nfsStickyContainer`, and structure injected from an HTML string is jQuery plumbing (building-blocks 1.4). Category: `jquery-or-dom-plumbing`.
- Sticking to both edges: Foundation's `both` is a comment in its Sticky source, never implemented. Category: `deprecated-upstream`.
- Horizontal sticking (`left`, `right`): Foundation's Sticky has no such Option. Category: `scope-boundary`.
- Shrink-on-scroll and other scroll-linked effects: the consumer's CSS on its own class bound from `isStuck()` covers the stuck look (D17), and scroll-driven animations are out of the Browser target. Category: `other` (a platform gap).
- Setting `scroll-padding` automatically: it is required consumer CSS (2.4.11), checked by development warning 5 and the e2e case, because only the consumer knows what a stuck element overlaps and one scroll container may hold several stuck elements. Category: `scope-boundary`.
- Changing Foundation's `.off-canvas-wrapper` overflow: the [Spec: Off-canvas](../issues/25-spec-off-canvas.md) owns it; its `nfs-off-canvas` mixin sets `overflow: clip; display: flow-root` on the `nfsOffCanvasWrapper` element, confirmed by case 3 of the [Prototype: Sticky measurement refinements](../issues/63-prototype-sticky-measurement.md), so Sticky works inside it. Category: `scope-boundary`.
- Sticky table headers: Foundation's Table has no sticky header, and CDK and Material tables already use native `position: sticky`. Category: `scope-boundary`.

## Further Notes

### Design decisions

A row whose decision leaves a Foundation feature or Option out names that item's exclusion category in its Rationale.

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | `[nfsSticky]` on the sticky element and `[nfsStickyContainer]` on its parent, binding `.sticky` and `.sticky-container`; the consumer writes neither class | ADR 0001 and building-blocks Table A; Foundation's markup carries both elements; ADR 0039 gives every Structural class its directive, and the container directive is the only way to get `.sticky-container`, whose `position: relative` is first-paint layout. Exclusion category of the generated container (`container`): `jquery-or-dom-plumbing` | A component that generates the container (Foundation's `wrap`); dropping the container directive (ADR 0001 names it); `class="sticky-container"` written by the consumer (ADR 0039); `nfsSticky` writing `.sticky-container` on its parent with `Renderer2` (ADR 0039's dated note allows that only for state with no first-paint value) |
| D2 | Native `position: sticky`; the Sticky range is the parent box | Correct first paint with no script, no layout jump, in the Browser target; confirmed in three engines by the prototype. Exclusion category of the `position: fixed` emulation: `superseded` | Porting Foundation's `position: fixed` emulation (no server paint, re-measures on every scroll, loses the grid width) |
| D3 | `anchor`, `topAnchor`, `btmAnchor` are Dropped options with a container recipe and a development warning for leftover attributes | An input that is never read promises behaviour the directive cannot give; a bound unknown input is a compile error, which is the clearest signal. Exclusion category: `platform-or-a11y` | Keeping them as accepted no-op inputs for Foundation parity (the prototype's suggestion) |
| D4 | The `stickyOn` gate is CSS in `nfs-sticky`, keyed on `data-nfs-sticky-on` and built with Foundation's `breakpoint()` from the consumer's `$breakpoints`; `NfsMediaQuery.is(stickyOn)` gates only the class contract | Server HTML and `hydrate never` stick at the right widths; no breakpoint swap at hydration; CSS and JavaScript share the Breakpoint map (the Breakpoint service's drift check covers it) | An inline `position` binding from `NfsMediaQuery` (the building-blocks sketch): renders the Server breakpoint, so desktop pages do not stick before hydration |
| D5 | Offsets are inline `top`/`bottom` insets in em; the unused edge is bound `auto` | Per-instance values; inline beats Foundation's `top: 0`/`bottom: 0` on `.is-stuck`/`.is-anchored` classes, and `auto` on the other edge removes Foundation's stray `bottom: 0` from the equation. Exclusion category of Foundation's margins applied on stick and removed on unstick: `superseded` | Margins as Foundation applied them (layout jump); a custom property per instance read by library CSS (more CSS for the same result) |
| D6 | State from the host's rectangle against the stick line, by one pure function | Reports what the browser did, independent of container padding and child order; testable without a browser | The prototype's sentinel-geometry thresholds (depend on padding and on the element being the first child) |
| D7 | Absolutely positioned sentinels appended at the container's end | No layout shift, no extra flex or grid items, no interference with nodes hydration has yet to claim | The prototype's in-flow sentinels inserted as first and last child (2 px growth, hydration cursor risk) |
| D8 | IntersectionObserver plus a rAF-throttled passive scroll backstop plus ResizeObserver, torn down while the gate is closed | The prototype's correctness gap for instantaneous jumps; `dynamicHeight` always on; Foundation's pause. Exclusion category of `dynamicHeight` and `checkEvery`: `superseded` | Observers alone (stale after jumps); a scroll listener alone (misses layout-driven movement) |
| D9 | Observer root and listener target are the nearest scroll container | Classes agree with the pixels in `overflow: auto` panels and never report "stuck" under an `overflow: hidden` wrapper; the walk runs once per instance | Window only (the prototype; classes lie under any scroll container) |
| D10 | `isStuck` plus `edge` as the public state; no `isAtTop`/`isAtBottom`/`isAnchored` signals | Two values determine all four State classes; 1.3's `isX` rule for the one boolean | Four booleans, three of them derived |
| D11 | `stuck`/`unstuck` payload: the edge stuck to, and the end rested at | Foundation's `stuckto:<stickTo>` and `unstuckfrom:<rest end>` namespaces; building-blocks 1.4 mapping | `void` outputs (lose Foundation's namespace information) |
| D12 | Five development-mode warnings | Each catches a silent failure the prototype, Foundation's docs markup, or a missing 2.4.11 `scroll-padding` produces; stripped from production | Documentation only (the prototype's alternative) |
| D13 | `nfsStickyDefaultsToken`, no parent token | Building-blocks 1.4 defaults rule; nothing injects a Sticky parent | `nfsStickyToken` from the building-blocks sketch |
| D14 | `width: auto` on `.sticky.is-stuck` in `nfs-sticky` | Foundation's `width: 100%` sized a `position: fixed` element to the viewport; an in-flow element keeps its container width, and 100% plus horizontal margins would overflow (WCAG 1.4.10). Exclusion category of Foundation's `width: 100%` on a stuck element: `superseded` | Leaving Foundation's width (overflow with margins) |
| D15 | WCAG 2.4.11 is met by required consumer `scroll-padding`, checked by development warning 5 and a Playwright case; 1.4.3 by a required opaque background on overlapping stuck elements (a Top Bar has one only while `$topbar-background` is opaque) | The overlap depends on the page, which only the consumer knows; the checks turn a silent failure into a warning and a failing test. Exclusion category of automatic `scroll-padding`: `scope-boundary` | The directive writing `scroll-padding` on the scroll container (a global write that several stuck elements would fight over); documenting it as advice only |
| D16 | No Variant input, Variant registry, Variant property, or Runtime check request; the four State classes stay host bindings; a static copy of a State class is stripped by the bindings and not reported | Foundation's `foundation-sticky` defines no Variant class (ADR 0040 has nothing to type); `stickTo` is an Option whose classes are State classes of the measured `edge`; building-blocks 1.4's report for a copied class exists to catch an initial state the consumer meant to set, and Sticky's state is measured, never set: a copy changes nothing the bindings do not already correct, and Foundation's Sticky markup carries no State class to copy | A development warning for a copied State class (it would report markup whose outcome is already correct); `stickTo` as a Variant input for `.is-at-top` and `.is-at-bottom` (an element with `stickTo: 'top'` carries `.is-at-bottom` once scrolled past its range) |
| D17 | Styling a stuck element is the consumer's own class bound from `isStuck()` or `edge()` through `#s="nfsSticky"`; no recipe selects `.is-stuck` or another Foundation or library class | Building-blocks 1.1: a spec's recipe for consumer CSS selects elements, attributes, or the consumer's own classes; the signals are public API, zoneless-safe, and false on the server exactly as the State classes are; the State classes stay Foundation's contract for Foundation's own CSS and CSS migrated from Foundation | Recipes on `.sticky.is-stuck` (a Foundation class in consumer code however the rule is read for stylesheets); a library styling attribute such as `data-nfs-stuck` (a second spelling of the State class that adds no information) |
| D18 | Composition by placement: `nfsSticky` beside `nfsTitleBar`, `nfsTopBar`, or `nfsCallout`, or on any element; `nfsStickyContainer` beside `nfsCell`, or on any parent; neither hosts another directive or is hosted | Building-blocks 1.9: a behaviour that may sit on any element is written beside the class directive; the Top Bar spec's D10; host directives are static, so a bar that hosted `NfsSticky` would pin every bar; none of the bar, callout, or cell rules sets a `position` the gate cannot override | `NfsTitleBar` or `NfsTopBar` hosting `NfsSticky`; a `sticky` boolean on the bar directives (Sticky is a Plugin with its own Options, not a Variant of the bar) |
| D19 | Examples, stories, test hosts, and fixtures write no Foundation or library class (except the one browser-level case that copies `is-stuck` onto a host to show it is stripped, D16): `nfsGridX` and `nfsCell` with `size`, `img[nfsThumbnail]`, `nfsCallout`, `nfsTitleBar` with `nfsTitleBarLeft`, `button[nfsButton]`; `sticky--overflow-hidden-ancestor` sets `overflow: hidden` and `overflow: clip` inline | ADR 0039 and the Storybook conventions' class-rule note; the names of the open XY Grid and Thumbnail specs are building-blocks 1.3's and the Magellan and Toggler specs', aligned by the class-rule consistency review; the overflow story compares two values, Foundation has a class for one, and the Prototyping Utilities spec has not named its directive | Keeping Foundation's docs classes in examples (copied into applications, they would bring back what the rule removes); Foundation's `.overflow-hidden` class in the story (a Foundation class in story markup); a guessed Prototyping Utilities directive name |
| D20 | No consumer CSS recipe for Foundation's off-canvas wrapper: `@include nfs-off-canvas;` is the fix, and development warning 3 names `overflow: clip` for any other clipping ancestor | Building-blocks 1.1 (no recipe selects a Foundation class); the Off-canvas spec's Sass subsection already lists sticking inside the wrapper among what breaks without its include | Keeping `.off-canvas-wrapper { overflow: clip; display: flow-root; }` (a Foundation class in a consumer recipe); the same rule on `[nfsOffCanvasWrapper]` (a second copy of the Off-canvas mixin's rule in consumer CSS) |

### Usage examples

Every example writes Foundation's elements and the library's directives, never a Foundation or library class (ADR 0039); each directive comes from its own entry point (`NfsSticky` and `NfsStickyContainer` from the Sticky one, `NfsTitleBar` and `NfsTitleBarLeft` from the Top Bar one, and so on).

A sticky column (Foundation's first docs example); the grid cell, which stretches to the row's height, is the Sticky container:

```html
<div nfsGridX>
  <div nfsCell size="6" nfsStickyContainer>
    <div nfsSticky [marginTop]="0">
      <img nfsThumbnail src="assets/rectangle-3.jpg" alt="Product photo">
    </div>
  </div>
  <div nfsCell size="6"><!-- long content --></div>
</div>
```

A sticky title bar for the whole page (Foundation's navigation example, with the container spanning the page instead of wrapping only the bar, and `nfsSticky` beside `nfsTitleBar`):

```html
<div nfsStickyContainer>
  <header nfsTitleBar nfsSticky [marginTop]="0" stickyOn="all">
    <div nfsTitleBarLeft>...</div>
  </header>
  <main>...</main>
</div>
```

```css
/* Focus not obscured (WCAG 2.4.11): keep focused elements clear of the stuck bar */
html { scroll-padding-top: 3.5rem; }
```

A different look while stuck (a shadow), from a class of the application's own bound from `isStuck()` (D17):

```html
<header nfsTitleBar nfsSticky #bar="nfsSticky" [class.app-bar-raised]="bar.isStuck()" [marginTop]="0" stickyOn="all">
  <div nfsTitleBarLeft>...</div>
</header>
```

```css
/* The application's own class; no Foundation or library class is selected */
.app-bar-raised { box-shadow: 0 2px 4px rgb(0 0 0 / 30%); }
```

Foundation's two anchors as a container recipe (`data-top-anchor="example2:top" data-btm-anchor="foo:bottom"`): place the container so it starts at `#example2` and ends at the bottom of `#foo`, for example by making `#example2` through `#foo` the children of one wrapper and putting the sticky element first in it:

```html
<div nfsStickyContainer>
  <aside nfsSticky>...</aside>
  <section id="example2">...</section>
  <section id="foo">...</section>
</div>
```

Stick to the bottom (the element last in its container; the Callout paints the opaque background 1.4.3 needs):

```html
<div nfsStickyContainer>
  <article>...</article>
  <div nfsCallout nfsSticky stickTo="bottom" [marginBottom]="0">Checkout</div>
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
<div style="overflow: auto; max-height: 30rem;">
  <section nfsStickyContainer>
    <h3 nfsSticky [marginTop]="0" stickyOn="all">Section A</h3>
    ...
  </section>
</div>
```

Inside the off-canvas wrapper (`nfsOffCanvasWrapper`): the Off-canvas spec's `@include nfs-off-canvas;` replaces the wrapper's `overflow: hidden` with `overflow: clip; display: flow-root`, so the sticky element needs nothing more. Without that include the wrapper is the element's scroll container, the element does not stick to the window, and development warning 3 names the wrapper; the fix is the include, not consumer CSS on Foundation's wrapper class (D20). Any other clipping ancestor of the consumer's own takes `overflow: clip` in the consumer's CSS, as warning 3 says.

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
6. Variant properties: none. Sticky has no Variant class (CSS class to Angular mapping), so the mixin writes no `--nfs-<setting>` property and no directive of this entry point requests a Runtime check.

### Platform features to adopt when the browser target moves

- Container scroll-state queries (`container-type: scroll-state` with `@container scroll-state(stuck: top)`, Chromium 133 only, Baseline limited per webstatus.dev on 2026-09-26): when in target, consumers can style the stuck state in pure CSS, and the directive's sentinels, observers, and scroll backstop could be replaced by `scroll-state` queries for styling, keeping the directive only for the `isStuck` signal and the outputs (which CSS cannot emit). It would also make stuck styling work inside `hydrate never`.
- `scrollend` (out of target): no need; the rAF backstop already measures once per frame.

### Foundation behaviour changed or dropped

- Dropped jQuery-only behaviour: `$element.wrap()`/`unwrap()` to create the container; `$.fn.offset()` anchor positions; namespaced window scroll listeners; `data-resize`/`data-mutate` stamping and the `resizeme`/`mutateme` triggers (replaced by `ResizeObserver` and `IntersectionObserver`); the window `load` wait (render callbacks run after hydration; late image loads resize the container, which the `ResizeObserver` sees). Category: `jquery-or-dom-plumbing`.
- Dropped emulation: `position: fixed` while stuck, inline `max-width` copied from the container, the container's inline height, margins applied on stick and removed on unstick, and the `transitionend` re-measure; native `position: sticky` needs none of it ([ADR 0019](../adr/0019-sticky-native-range.md)). Category: `superseded`.
- Dropped options, each with its reason in the Foundation contract table: `anchor`, `topAnchor`, `btmAnchor` (recipe above; `platform-or-a11y`), `container` (`jquery-or-dom-plumbing`), `stickyClass`, `containerClass` (`variant-as-class`), `dynamicHeight`, `checkEvery` (`superseded`).
- Changed by the class rule: Foundation's markup writes `.sticky` and its Plugin adds `.sticky-container`; here the directives bind both and the consumer writes no class ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)).
- Changed: the Sticky range is the parent box (Foundation's default was the whole document); `em` resolves against the element's font size; any scroll container is supported, not only the window.
