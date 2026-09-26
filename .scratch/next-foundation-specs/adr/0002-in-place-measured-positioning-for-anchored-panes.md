---
status: accepted
---

# In-place measured positioning for Anchored panes

Dropdown panes and tooltips are Foundation elements positioned with `position: absolute` inside the page flow and moved by explicit `top`/`left` from the Positionable and Box formulas (`research/foundation-inventory-positioned.md`, Shared positioning model). Under the browser target (Baseline widely available 2026-05-07) neither native `popover` nor CSS anchor positioning is usable (`research/web-platform-features.md` 2 and 3), and CDK Overlay moves the pane into an overlay host that renders as a top-layer `popover="manual"` and positions it in JavaScript against the viewport (`research/angular-cdk-inventory.md` overlay), which breaks Foundation's `.dropdown-pane` and `.tooltip` CSS contract, scrolls independently of the anchor, and is not server-renderable in place. We decided on one shared Positioner, an injection-context function over pure functions that port Foundation's formulas (4 positions x 3 alignments, offsets, least-overlap search, body-box bound), measured with `getBoundingClientRect` in `afterRenderEffect` and re-run through `ResizeObserver`, keeping the pane where the consumer wrote it.

## Considered options

- CDK `FlexibleConnectedPositionStrategy` with `withPopoverLocation('inline')`: measured against the port in the [Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay](../issues/44-prototype-anchored-pane.md) and rejected, as the fallback too: the port matched Foundation 6.9 inside scrolling ancestors, while CDK bounded collisions by the viewport, has no `allowBottomOverlap`, followed a static scroller only with `cdkScrollable`, moved the `.tooltip` 209 to 254 px in the 5 placements whose `overlayY` is `bottom` (Foundation's `top: calc(100% + pip)` beats CDK's inline `bottom`), replaced the tip's `max-width`, and left no pane in server HTML. Its one advantage, a top-layer tip that no `overflow` ancestor clips, was weighed in the [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md) and not taken.
- Native `popover` plus anchor positioning behind `@supports`: rejected for the first release because it would be a second code path for a feature no target browser has; recorded as the upgrade when the target moves.

## Consequences

- The Anchored pane utility spec owns the Positioner, the Light dismiss registry, and the hover-intent helper; the Dropdown, Tooltip, and Nested menu specs only map their Options onto them.
- Panes exist in server HTML (hidden by Foundation CSS) so `aria-controls` is valid before hydration.
- The anchored pane prototype showed the port matching Foundation 6.9 to within 0.02 px on the 12 placements, the fallback order, the body-box bound, RTL, resize, and positioned and static scrolling ancestors in three engines, and it fixes Foundation's kept tried-positions set and stale tip measurement. Its one regression, a tip clipped by a positioned `overflow` ancestor (Foundation's tip lived in `body`), is accepted and documented ([Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md), Triage 2).
- No CDK Overlay is used anywhere on the Anchored pane path. The named upgrade is native `popover` plus CSS anchor positioning when the browser target moves.
