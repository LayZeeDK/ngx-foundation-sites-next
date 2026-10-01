---
status: accepted
---

# Equalizer is CSS layout first; its optional directive writes `min-height` on every watched element except the tallest of its row

Foundation's Equalizer writes the tallest `offsetHeight` as an inline `height` on every watched element and re-measures on a debounced window resize, on child-list and `style` mutations, and after images load (`research/foundation-inventory-forms-media.md`, Equalizer). Flexbox stretch, CSS grid with `grid-auto-rows: 1fr`, and `subgrid` are all inside the browser target and equalize on the server-rendered HTML with no JavaScript, so the [Spec: Equalizer](../issues/34-spec-equalizer.md) recommends CSS first and keeps `nfsEqualizer`/`nfsEqualizerWatch` only for markup CSS cannot reach (the float grid, non-grid lists). For that directive we decided to write inline `min-height`, not `height`, and to leave the tallest element of each row without any inline value, re-measuring only when one `ResizeObserver` on the watched elements and the container reports a change. A fixed `height` clips content that grows after the pass (failing WCAG 2.2 AA 1.4.4 and 1.4.12) and hides that growth from a `ResizeObserver`, because the box no longer changes size; with `min-height` growth shows as a size change, and because the tallest element keeps its natural height its shrinkage shows too. So one observer replaces Foundation's resize listener, mutation listener, and image loader.

## Considered options

- Foundation's inline `height` plus a MutationObserver and an image loader: rejected. It clips content, misses size changes from CSS, fonts, and text enlargement, and needs three signal sources.
- `min-height` on every element, the tallest included: rejected. The tallest element's shrinkage then changes no observed size, so the group stays too tall until the next resize.
- Writing inside the `ResizeObserver` callback: rejected. Resizing observed elements there raises the "ResizeObserver loop completed with undelivered notifications" `ErrorEvent`, which `provideBrowserGlobalErrorListeners()` forwards to the `ErrorHandler`; the callback only bumps a signal and an `afterRenderEffect` runs the pass.

## Consequences

- A percentage `height` inside a watched element no longer resolves; a flex column inside the box replaces it, and the spec documents the delta.
- The directive owns the inline `min-height` of watched elements; consumer minimums go in stylesheets.
- A pass costs one forced layout (reset, measure, apply in the `mixedReadWrite` phase), and a change settles within two passes; a content change after load may paint unequal heights for one frame.
- Someone reading the code will see the tallest element skipped on purpose; this record is why.
- 2026-10-01 ([Task: remove the Float Grid and Flex Grid from the bundle](../issues/187-task-remove-float-and-flex-grids.md)): the user ruled the Float Grid out of scope, so the float grid no longer stands as an example of markup CSS cannot reach; the directive's residue is non-grid markup (inline-block lists, CMS content, boxes at unrelated depths).
