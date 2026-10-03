---
status: accepted
---

# The dialog is a directive on the consumer's native `<dialog>`, opened by invoker commands; its opener renders no `aria-expanded`

Adapted from [ADR 0007](../../next-foundation-specs/adr/0007-reveal-on-native-dialog.md), [ADR 0031](../../next-foundation-specs/adr/0031-reveal-dismissal.md), and [ADR 0036](../../next-foundation-specs/adr/0036-modal-dialog-trigger-role.md) of `.scratch/next-foundation-specs/`, by [Decide: which ADRs carry over](../issues/08-decide-inherited-adrs.md), once [Decide: the spec list](../issues/11-decide-spec-list.md) kept `dialog`. Those records bound nothing here.

The old records made Foundation's Reveal a directive on a consumer-written `<dialog>` with `showModal()`, ported Foundation's scroll lock, wrapped Tab itself, intercepted Escape on `window` so a veto survives repeated Escape, closed on a backdrop press only when both pointer ends land on the backdrop, and gave a modal dialog's opener no `aria-expanded`. Yeti's dialog is already the native element: "the browser opens it. A button carrying commandfor="<id>" and command="show-modal" calls showModal on that dialog itself, which is what makes the page behind it inert, holds focus inside, and closes on Escape" (`src/components/dialog/dialog.js:1-3`, read at `f52d1e8b9`). Its module adds the two things the platform does not: a backdrop click closes it, with both ends of the press outside the box, because `closedby="any"` "would, but Safari lacks it and it is not Baseline"; and focus returns to the opener recorded from the `command` event's `source`, because in WebKit a clicked button never has focus (`dialog.js:4-23`, `:29-35`). [ADR 0040](0040-package-replaces-yetis-optional-modules.md) has the package replace that module.

We decided:

1. **`yetiDialog` is a directive on the consumer's `<dialog>`** (from ADR 0007). Its opener part renders `commandfor` and `command="show-modal"` with the dialog's id ([ADR 0003](0003-directives-set-yetis-class-attributes-and-markers.md) point 5, [ADR 0013](0013-parts-name-their-targets-by-reference.md)), so the dialog opens before hydration and with no script (measured in ticket 18). Programmatic open and close call `showModal()` and `close()`. The two-way state is named `isOpen`, not `open`, so it does not collide with the dialog's own `open` attribute and property (the old record's reason).
2. **The directive does what `dialog.js` does**: backdrop closing only when both `pointerdown` and the click land outside the dialog's box (the same rule old ADR 0031 measured), and focus back on the opener taken from the `command` event's `source`.
3. **Escape stays the platform's close request.** If the `dialog` spec offers a veto (Material's `disableClose` or a `closePredicate`), it handles the Escape `keydown` on `window` before it becomes a close request and cancels it last, because repeated Escape without user activation makes `cancel` non-cancelable and the browser closes the dialog anyway (measured in the old bundle's [Prototype: Reveal on native `<dialog>`](../../next-foundation-specs/issues/42-prototype-reveal-dialog.md) in three engines; not re-measured here).
4. **The opener renders no `aria-expanded`** (from ADR 0036): HTML-AAM maps no expanded state for `command="show-modal"`, and while a modal dialog is open its opener is inert. Whether the opener also renders `aria-haspopup="dialog"` and `aria-controls`, which Yeti's example lacks, is the `dialog` spec's, as a `ledger.md` row if added.
5. **Abandoned with Foundation:** the scroll lock (Foundation's Sass did the locking, and Yeti locks nothing), the `.reveal` size classes, and the non-modal `overlay: false` mode (Yeti's dialog is opened only with `show-modal`).

## Considered options

- **CDK Dialog or an overlay service.** Rejected, as in the old record: it does not use `<dialog>`, renders nothing on the server in place, and would lose the invoker-command opening that is Yeti's no-script path.
- **`closedby="any"` for the backdrop.** Not adopted while Safari lacks it, which Yeti itself states; Baseline 2025 does not include it.
- **A Tab wrap inside the dialog**, as the old record did for WebKit. Not decided here: ticket 17 found Tab passing through the browser's own UI in Chromium and WebKit (inferred from headless runs), and whether the package adds a `FocusTrap` is [Decide: the building-blocks map](../issues/25-decide-building-blocks-map.md)'s ledger seed.

## Consequences

- The `dialog` spec's opener and dialog share one hydration boundary unless the dialog has a static `id` ([ADR 0011](0011-rendering-modes-contract-for-yeti.md) clause 7).
- A shell dialog left open across a `routerLink` navigation is closed by the navigation-close shared spec (ticket 20 measured it staying open and the page inert).
- `yeti:open` and `yeti:close` become outputs under the events shared spec; `close` is never replayed (ticket 18).
- 2026-10-02: [Decide: the building-blocks map for every ngx-yeti item](../issues/25-decide-building-blocks-map.md) decided that the dialog uses no CDK `FocusTrap` in the first milestone. Focus return is the dialog's own `command` and `close` listeners ([ADR 0043](0043-light-dismiss-additions-are-host-listeners-not-cdk-services.md)), and the Tab-wrapping gap stays [ledger](../ledger.md) row A11Y-8.
- 2026-10-03: [Prototype: subclassing Aria's directives, and `[open]` against `[attr.open]`](../issues/34-prototype-subclassing-aria-and-open-binding-forms.md) measured that a bound `open`, as a property or an attribute, is written again at hydration. On a modal dialog opened before hydration this leaves the dialog hidden while the page stays blocked. The user chose "Never bind; read once (Recommended)" (map, Standing rulings): `isOpen` is read from the element once, when the directive is created, and then follows `close` and the invoker commands. It is never bound to `open`.
