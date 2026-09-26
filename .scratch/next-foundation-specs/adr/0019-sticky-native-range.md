---
status: accepted
---

# Sticky is native `position: sticky`, its range is the parent element, and its breakpoint gate is CSS

Foundation's Sticky Plugin emulates sticking with `position: fixed` and computes its range from anchors that default to the whole document (`research/foundation-inventory-positioned.md`, Sticky), so it paints nothing sticky before its JavaScript has measured. Native `position: sticky` is in the Browser target and pins correctly from server HTML, but it can only confine an element to its containing block, and the [Prototype: CSS `position: sticky` with IntersectionObserver sentinels for Sticky](../issues/48-prototype-sticky-css.md) showed that anchors outside that block cannot be honoured. We decided that `nfsSticky` uses `position: sticky`; that its Sticky range is its parent element's box, so Foundation's `anchor`, `topAnchor`, and `btmAnchor` are Dropped options replaced by a recipe (make the parent span the range) and a development warning for leftover anchor attributes; and that the `stickyOn` gate is a Library mixin rule keyed on a bound `data-nfs-sticky-on` attribute and built with Foundation's `breakpoint()` from the consumer's `$breakpoints`, with the Breakpoint service gating only the State classes and outputs. Why: server HTML, prerendered pages, and `@defer (hydrate never)` blocks stick at the right widths with no script, and the class contract describes what the browser does rather than a parallel computation.

## Considered options

- Port Foundation's `position: fixed` emulation, which could honour arbitrary anchors: rejected. No correct first paint, a scroll handler recomputing on every frame, the grid width lost while stuck (Foundation copies it into `max-width`), and a frozen container height; the whole Plugin would be JavaScript for what CSS now does.
- Keep `anchor`, `topAnchor`, and `btmAnchor` as accepted inputs that are never read, for Foundation parity: rejected. An input that does nothing promises behaviour the directive cannot give; without the input a bound value is a compile error and a static leftover attribute gets a development warning.
- Gate with an inline `position` bound from `NfsMediaQuery.is(stickyOn)`, as the building-blocks sketch had it: rejected. The binding renders the Server breakpoint, so with Foundation's defaults (`stickyOn: 'medium'`, Server breakpoint `small`) a desktop page would not stick before hydration and never inside `hydrate never`.

## Consequences

- Foundation's docs markup for a sticky title bar (a container exactly as tall as the bar) does not stick until the container spans the page; a development warning names the case.
- `stickTo: 'bottom'` reproduces Foundation's range when the sticky element is the last child of its container; `stickTo: 'top'` when it is the first.
- The library's Sass emits one `position: sticky` rule per Breakpoint query form and breakpoint; a consumer who forgets `@include nfs-sticky;` gets an element that never sticks.
- When container scroll-state queries reach the Browser target, stuck styling can move to CSS, but the range stays the containing block.
