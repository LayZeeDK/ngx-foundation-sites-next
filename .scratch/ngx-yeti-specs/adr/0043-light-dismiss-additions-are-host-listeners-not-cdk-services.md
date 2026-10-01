---
status: accepted
---

# The package's light-dismiss additions, the tooltip's Escape, and focus return are host listeners on the item; CDK's document-level a11y services are not injected in the first milestone

Recorded by [Decide: the building-blocks map for every ngx-yeti item](../issues/25-decide-building-blocks-map.md). [ADR 0016](0016-light-dismiss-is-the-platforms-plus-focus-out-and-tooltip-escape.md) fixed the behaviour (a panel closes when focus leaves it and its opener; the tooltip closes on Escape) and left the building block to ticket 25. [Research: Yeti against WHATWG, WAI-ARIA, the APG](../issues/17-research-yeti-accessibility-and-standards.md) named two candidates for focus-out, CDK `FocusMonitor` or a `focusout` host listener, and for the tooltip Material's Escape predicate plus `AriaDescriber`; [building-blocks.md](../building-blocks.md) 1.2 listed `FocusMonitor`, `LiveAnnouncer`, `FocusKeyManager`, `AriaDescriber`, `InteractivityChecker`, and `FocusTrap` as candidates. Sources read in the 22.2.x clone at `708d4c6e2`.

What each CDK candidate does, against what the item needs:

- `FocusMonitor.monitor(element, true)` emits the focus origin while focus is inside the element's subtree and `null` when it leaves (`src/cdk/a11y/focus-monitor/focus-monitor.ts:178-181`). It does not say where focus went. A press on non-focusable content inside an open panel moves focus to `body`, which looks the same as focus leaving; closing then would shut the panel under the user's pointer. So a `relatedTarget` check plus a `pointerdown` guard is needed with or without `FocusMonitor`, and `FocusMonitor` adds document-level listeners run inside `NgZone` for nothing the item uses.
- `AriaDescriber` appends its own hidden message container to the document and points `aria-describedby` at it (`aria-describer.ts:41`). Yeti's tooltip bubble is the consumer's own `role="tooltip"` element (`src/components/tooltip/example.html:3`), so a second description element would duplicate it.
- `FocusTrap` wraps Tab inside an element (`focus-trap.ts:38`). The native modal dialog already keeps focus out of the page; the APG's wrap is a deviation from the HTML model that ticket 17 inferred from a headless run.
- `LiveAnnouncer` announces text through a live region (`live-announcer.ts:37`). The alert's live role is a static attribute the consumer writes, present at load as the APG alert pattern wants, and the carousel has no auto-rotation, so the APG's live region there is a static `aria-live` too.
- `InteractivityChecker` answers whether an element is focusable (`interactivity-checker.ts:31`). The dialog's initial focus is the platform's focusing steps or the consumer's `autofocus`, and Aria's `TabPanel` sets its own `tabindex`.
- `FocusKeyManager` gives a list one Tab stop and arrow keys (`key-manager/focus-key-manager.ts:22`). The APG's grouped carousel picker keeps every picker control in the Tab sequence (`content/patterns/carousel/carousel-pattern.html:182-183` in the aria-practices clone at `3f094fd`), as Yeti's dots are.

We decided:

1. **Focus-out closing is a `focusout` host listener on the item's root element**, which in Yeti's markup contains both the opener and the panel (`.dropdown`, `.nav`). It closes the panel with `hidePopover()` when `event.relatedTarget` is outside the root, as the APG's disclosure navigation example does (`disclosure/examples/js/disclosureMenu.js:87-92`), and it ignores a `focusout` whose `relatedTarget` is null that follows a `pointerdown` inside the root in the same task. For the nav it acts only while the list is `:popover-open`.
2. **The tooltip's Escape is a `keydown` host listener on the tooltip's root** for `Escape` without a modifier (`hasModifierKey`, `src/cdk/keycodes/modifiers.ts:15`), setting a `dismissed` signal that the bubble renders as `hidden`; `pointerleave` and `focusout` on the root reset it. `aria-describedby` points at the consumer's bubble, with a generated id where the consumer wrote none ([ADR 0042](0042-generated-ids-come-from-cdk-idgenerator-through-one-helper.md)).
3. **The dialog's focus return is its own `command` and `close` host listeners**, as `dialog.js` does it ([ADR 0021](0021-dialog-is-a-directive-on-the-native-dialog.md) point 2). No `FocusTrap` is added in the first milestone; the dialog spec may measure the Tab behaviour in headed browsers and reopen this point with the measurement.
4. **CDK's a11y services are not injected in the first milestone**: `FocusMonitor`, `AriaDescriber`, `FocusTrap`, `LiveAnnouncer`, `InteractivityChecker`, and `FocusKeyManager`. CDK's pure pieces stay: `_IdGenerator` (ADR 0042), `Directionality`, and `hasModifierKey`.
5. **A spec may adopt a CDK piece later** when it measures a case the listeners miss, recording the measurement and the piece in its decision log; this record then gains a dated note.

## Considered options

- **`FocusMonitor` for focus-out.** Rejected for the reason above: it answers a different question and still needs the guard.
- **A document-level `focusin` listener that closes any open panel the focused element is not inside**, the old bundle's registry shape. Rejected: ADR 0016 point 1 removed the registry, and a listener per open root is the smaller piece.
- **`popover="hint"` for the tooltip**, with the platform's own close requests. Rejected by ADR 0016: Yeti's tooltip needs no script to show, and `hint` needs one.
- **`FocusTrap` on the dialog now.** Not adopted: the gap is inferred, the page is never reached, and a trap changes the native modal's behaviour for every consumer.

## Consequences

- The dropdown and nav specs test the inside-press case in three engines (WebKit does not focus a clicked button, so its `focusout` sequence differs), and the tooltip spec tests Escape while hovered and while focused.
- Nothing is open before hydration, so a replayed `focusout` or `keydown` finds nothing to close; the handlers change state first and call no `preventDefault()`.
- `@angular/cdk/a11y` is still a dependency of the package, for `_IdGenerator`; the services this record leaves out cost no bundle size while they are not imported.
