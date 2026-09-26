---
status: accepted
---

# Reveal dismissal: modal Escape is intercepted at `window` before it becomes a close request, a Backdrop press needs both ends on the backdrop, and non-modal Reveals use Light dismiss

ADR 0007 mapped `closeOnEsc` to the dialog's `cancel` event and `closeOnClick` to a backdrop `pointerdown`. The [Prototype: Reveal on native `<dialog>` under Foundation Sass](../issues/42-prototype-reveal-dialog.md) then measured that a `cancel`-only design cannot keep a modal open: repeated Escape without user activation makes `cancel` non-cancelable and the browser closes the dialog (Chromium on the third press, Firefox and WebKit on the second), so `closeOnEsc: false` and a `closePredicate` veto fail exactly when a user is hammering Escape over a dirty form. The WHATWG close request steps fire the Escape `keydown` first and stop ("nothing further happens") when a listener cancels it, and the [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md) measured in three engines that a cancelled `keydown` leaves a modal dialog open with no `cancel`. We decided that the topmost modal Reveal handles an Escape `keydown` on `window` in the bubble phase, only when no inner handler cancelled it and it is not an IME composition, closes when `closeOnEsc` is true and `closePredicate` allows, and always cancels the key last; `cancel` remains the fallback for close requests that are not the Escape key. A Backdrop press closes only when both `pointerdown` and `pointerup` land on the backdrop, the model the HTML standard gives dialog light dismiss and ADR 0024 gives Light dismiss, so a touch swipe or a drag between content and backdrop never closes. A non-modal Reveal (`overlay: false`) registers with the Light dismiss registry while open (group `null`, `outsidePress` from `closeOnClick`, its Triggers inside), so Escape closes the topmost entry first, an outside press closes it without its Trigger reopening it, and focus leaving closes it, which is also how it meets WCAG 2.2 AA 2.4.11.

## Considered options

- `cancel` only, as ADR 0007 and the prototype had it: rejected; vetoes do not survive repeated Escape.
- A host `keydown` on the dialog: rejected; it runs before the document-level Light dismiss handler, so Escape in an open Dropdown pane inside a Reveal would close the Reveal too.
- `pointerdown` alone for the backdrop: rejected; a touch scroll that starts on the backdrop closes the dialog, and it is not the model `dialog.closedby="any"` will bring.
- Own document listeners for non-modal Reveals (the prototype's): rejected; an outside `pointerdown` closed the dialog before its Trigger's `click` reopened it, and Escape ordering with nested panes would need a second stack.

## Consequences

- Amends ADR 0007's `closeOnEsc` and `closeOnClick` mapping; `closeOnEsc: false` is reliable for the Escape key and best effort only for other close requests.
- The Light dismiss registry gains a consumer that is not an Anchored pane; its API is unchanged, and the glossary's Light dismiss entry names non-modal Reveals.
- A modal Reveal opened from inside a non-modal Reveal's DOM with `multipleOpened` is a known limit: the registry's Escape reaches the non-modal entry first.
- When `dialog.closedby` reaches the Browser target, the Backdrop press handler can be replaced without a behaviour change; the `window` Escape handler stays while `closePredicate` must veto repeated Escape.
