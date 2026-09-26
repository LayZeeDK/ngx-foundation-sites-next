---
status: accepted
---

# In-place measured positioning for Anchored panes

Dropdown panes and tooltips are Foundation elements positioned with `position: absolute` inside the page flow and moved by explicit `top`/`left` from the Positionable and Box formulas (`research/foundation-inventory-positioned.md`, Shared positioning model). Under the browser target (Baseline widely available 2026-05-07) neither native `popover` nor CSS anchor positioning is usable (`research/web-platform-features.md` 2 and 3), and CDK Overlay moves the pane into an overlay host that renders as a top-layer `popover="manual"` and positions it in JavaScript against the viewport (`research/angular-cdk-inventory.md` overlay), which breaks Foundation's `.dropdown-pane` and `.tooltip` CSS contract, scrolls independently of the anchor, and is not server-renderable in place. We decided on one shared positioner service that ports Foundation's formulas (4 positions x 3 alignments, offsets, least-overlap search, body-box bound) onto `getBoundingClientRect` measurements taken in `afterRenderEffect` and re-run through `ResizeObserver`, keeping the pane where the consumer wrote it.

## Considered options

- CDK `FlexibleConnectedPositionStrategy` with `withPopoverLocation('inline')`: measured against the port by the [Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay](../issues/44-prototype-anchored-pane.md) and not adopted: it bounds collisions by the viewport instead of Foundation's body box, has no `allowBottomOverlap`, follows a static scroller only when it carries `cdkScrollable`, breaks Foundation's `.tooltip` CSS (`top`/`bottom` and `max-width` conflicts), and is not server-rendered. It remains the alternative not taken, not a scrolling-ancestor fallback: the in-place port matched Foundation in every scrolling-ancestor case the prototype measured, including a positioned and a static scroller.
- Native `popover` plus anchor positioning behind `@supports`: rejected for the first release because it would be a second code path for a feature no target browser has; recorded as the upgrade when the target moves.

## Consequences

- The Anchored pane utility spec owns the positioner and the Light dismiss registry; Dropdown and Tooltip specs only map options onto it.
- Panes exist in server HTML (hidden by Foundation CSS) so `aria-controls` is valid before hydration.
- The anchored pane prototype confirmed the 12 placements, the body-box bound, RTL, and scrolling ancestors match Foundation 6.9 within 0.02 px, with one accepted regression: a tooltip inside a positioned `overflow` ancestor is clipped, where Foundation's `body`-appended tip is not (OPEN FOR HUMAN).
