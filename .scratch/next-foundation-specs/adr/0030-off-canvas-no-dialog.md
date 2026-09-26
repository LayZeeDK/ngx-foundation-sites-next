---
status: accepted
---

# OffCanvas panels are not `<dialog>` elements, in any mode; modal mode makes the content inert instead

Reveal became a directive on a native `<dialog>` (ADR 0007), and the building-blocks map asked whether OffCanvas's overlap mode should follow while push stays custom. We decided that both transitions stay one custom directive on the consumer's `.off-canvas` element, and that modal mode (Foundation's `trapFocus` with an overlay present) is built from `role="dialog"`, `aria-modal="true"`, `inert` on the linked `.off-canvas-content`, and a CDK `FocusTrap`. Why: the same element is a sidebar at and above `revealOn` or a plain page element at and above `inCanvasOn`, and Foundation's `.reveal-for-<bp>` and `.in-canvas-for-<bp>` show it there from server HTML (building-blocks 1.11 decision 8); a closed `<dialog>` is `display: none` by the user-agent stylesheet and always has the implicit `dialog` role, which the APG says a permanently revealed panel must not carry. Foundation's transform transition cannot start from `display: none` without `@starting-style`, which is outside the Browser target, so a top-layer panel would need either a two-frame class dance or new keyframes that copy Foundation's per-breakpoint `$offcanvas-sizes` distances. And Foundation's default panel is not modal (`trapFocus: false`), so a `<dialog>` would serve only the non-default case while splitting consumer markup by an Option value.

## Considered options

- Overlap mode on `<dialog>` with `showModal()` and `::backdrop`, push mode custom: rejected for the reasons above; it also turns the `transition` input into a choice of element type and replaces Foundation's `.js-off-canvas-overlay` fade (a transition on the consumer's own element) with `::backdrop` keyframes the library would have to write.
- Every panel on `<dialog>`, `show()` for non-modal panels: rejected; a non-modal dialog gets no Escape handling and no containment, so it adds nothing but the display and role problems.
- `popover="manual"` for the overlap panel: out of the Browser target, and it would leave the page flow the same way the top layer does.

## Consequences

- Consumer markup keeps Foundation's `div.off-canvas` for every configuration; the Reveal dialog prototype's CSS rules 1 to 6 do not apply to OffCanvas.
- The library, not the browser, makes the rest of the page inert and wraps Tab in modal mode; elements outside both the panel and `.off-canvas-content` stay reachable except through the focus trap, which is why the spec requires page content inside `.off-canvas-content`.
- When `@starting-style` and `CloseWatcher` reach the Browser target the decision can be revisited for the modal case only; the revealed and in-canvas forms keep the element a non-dialog.
