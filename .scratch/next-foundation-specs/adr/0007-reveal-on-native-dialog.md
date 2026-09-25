---
status: accepted
---

# Reveal is a directive on a consumer-written `<dialog class="reveal">`, not a service, a generated overlay, or CDK Dialog

Foundation Reveal moves the modal into a generated `.reveal-overlay`, focuses the dialog element itself, traps focus on a static list, and locks scroll with `html` classes (`research/foundation-inventory-disclosure.md` Reveal), all of which the APG dialog pattern corrects (`research/aria-apg-patterns.md` Reveal). Native `<dialog>` with `showModal()`, the top layer, `::backdrop`, `:modal`, Escape as a close request, and implicit inertness of the rest of the page are all inside the browser target (`research/web-platform-features.md` 1), while CDK Dialog does not use `<dialog>`, defaults `aria-modal` off, and hides siblings with `aria-hidden` (`research/angular-cdk-inventory.md` dialog). We decided that `NfsReveal` is a directive on a `<dialog class="reveal">` the consumer writes in place: `open` is a model, `showModal()`/`show()` (for `overlay: false`) are the mechanism, `::backdrop` carries Foundation's `.reveal-overlay` styles as documented custom CSS, `closeOnEsc` maps to the `cancel` event, `closeOnClick` to a backdrop `pointerdown` (since `closedby` is out of target), and the exit animation runs before `close()`.

## Considered options

- A Material-style `NfsReveal` service that opens components or templates in an overlay: rejected because Foundation's markup is declarative and in-document, the overlay is not server-renderable, and the ref API would duplicate what a model plus outputs give.
- CDK Dialog with a custom container rendering `.reveal`: the fallback if prototype P1 shows `<dialog>` cannot carry Foundation's sizing and full-screen rules; costs the native focus containment and top layer.

## Consequences

- `html.is-reveal-open` / `zf-has-scroll` scroll locking is dropped (top layer plus `overscroll-behavior` on the dialog).
- Nested modals are nested `showModal()` calls; `multipleOpened: false` closes the open dialog first.
- The Reveal spec inherits Material's `close(result)`, `closePredicate`, `autoFocus`, `restoreFocus`, and `role: 'dialog' | 'alertdialog'` vocabulary; `deepLink` opens only after hydration.
