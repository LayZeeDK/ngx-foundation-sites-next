---
status: accepted
---

# In-place measured positioning for Anchored panes

Dropdown panes and tooltips are Foundation elements positioned with `position: absolute` inside the page flow and moved by explicit `top`/`left` from the Positionable and Box formulas (`research/foundation-inventory-positioned.md`, Shared positioning model). Under the browser target (Baseline widely available 2026-05-07) neither native `popover` nor CSS anchor positioning is usable (`research/web-platform-features.md` 2 and 3), and CDK Overlay moves the pane into an overlay host that renders as a top-layer `popover="manual"` and positions it in JavaScript against the viewport (`research/angular-cdk-inventory.md` overlay), which breaks Foundation's `.dropdown-pane` and `.tooltip` CSS contract, scrolls independently of the anchor, and is not server-renderable in place. We decided on one shared positioner service that ports Foundation's formulas (4 positions x 3 alignments, offsets, least-overlap search, body-box bound) onto `getBoundingClientRect` measurements taken in `afterRenderEffect` and re-run through `ResizeObserver`, keeping the pane where the consumer wrote it.

## Considered options

- CDK `FlexibleConnectedPositionStrategy` with `withPopoverLocation('inline')`: the runner-up. Keeps DOM order but still positions against the viewport, needs a scroll strategy, and puts the pane content in a portal template rather than in the consumer's markup. Chosen as the fallback if the [Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay](../issues/44-prototype-anchored-pane.md) shows the port fails inside scrolling ancestors.
- Native `popover` plus anchor positioning behind `@supports`: rejected for the first release because it would be a second code path for a feature no target browser has; recorded as the upgrade when the target moves.

## Consequences

- The Anchored pane utility spec owns the positioner and the Light dismiss registry; Dropdown and Tooltip specs only map options onto it.
- Panes exist in server HTML (hidden by Foundation CSS) so `aria-controls` is valid before hydration.
- The anchored pane prototype must show the 12 placements, the body-box bound, RTL, and scrolling ancestors match Foundation 6.9.
