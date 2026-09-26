---
status: accepted
---

# Light dismiss follows the HTML popover light-dismiss model, not Foundation's body click

Foundation closes a Dropdown on a body `click` or `tap` only when `closeOnClick` is set, closes it on Escape only while focus is on the trigger or the pane, never closes a Tooltip on Escape, never closes anything when focus leaves, and closes every other instance of the same plugin on open through the window-level `closeme.zf.*` broadcast, parents included (`research/foundation-inventory-positioned.md`, Dropdown and Tooltip events; `js/foundation.util.triggers.js:123-155`). We decided that the Light dismiss registry, one `@Service()` holding the stack of open Anchored panes and submenus, applies the model the HTML standard specifies for `popover="auto"` (https://html.spec.whatwg.org/multipage/popover.html#popover-light-dismiss): a pointer press dismisses only when both its `pointerdown` and its `pointerup` land outside the entry, so a touch scroll (which ends in `pointercancel`) and a text selection dragged out of the pane never dismiss; nesting comes from containment of the child's pane or its Trigger (the popover invoker rule), so a press inside a parent closes its children and keeps the parent; a sibling of the same group opening closes the others but never an ancestor; Escape closes only the topmost entry, from a document-level listener that lets an inner control consume the key first; and focus moving outside an entry closes it. Why: it meets WCAG 2.2 AA 1.4.13 (dismissible from anywhere) and 2.4.11 (a pane never stays over the next focused control), it keeps a Trigger click a toggle (Triggers count as inside), and it is the behaviour native `popover` will give these panes when the browser target moves, so that switch will change nothing a user or a test can observe.

## Considered options

- Foundation's rules (body `click`/`tap`, host Escape, `closeme` per plugin): rejected. They fail 1.4.13 for Tooltips and hover-opened panes, close a parent pane when a nested one opens, and need a `tap` synthesis for iOS.
- CDK's `OverlayOutsideClickDispatcher` rule (capture `pointerdown` records the origin, `click` decides): the runner-up. Equivalent for mouse input, but it depends on `click` reaching the document, which CDK works around on iOS by setting `cursor: pointer` on `body`, and it is not the model the platform upgrade brings.
- `pointerdown` alone: rejected. Every touch scroll that starts outside an open pane would close it.
- One global group, as native `auto` popovers have: rejected for now. Opening a tooltip would close an open Dropdown pane; groups per kind keep Foundation's `closeme` scope, which is also what `popover="hint"` gives tooltips.

## Consequences

- Dropdown's `closeOnClick` and Tooltip's `clickOpen` switch only the pointer rule; Escape, the focus rule, and sibling groups always apply, which changes Foundation's default behaviour and is listed as a delta in the Dropdown, Tooltip, and Nested menu specs.
- Consumers receive a close reason (`'click' | 'keydown' | 'tab' | 'sibling'`, Material's `MenuCloseReason` words plus the sibling case) and return focus to the Trigger only for `'keydown'` with focus inside the pane.
- The registry's document listeners exist only while an entry is open and are never replayed, which is correct because nothing is open before hydration.
- When `popover="auto"` reaches the browser target, Dropdown panes and submenus can drop the registry without a behaviour change; tooltips wait for `popover="hint"` or keep their own group.
