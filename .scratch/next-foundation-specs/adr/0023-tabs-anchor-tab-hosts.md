---
status: accepted
---

# Tabs keep Foundation's `<a>` as the tab element, written without `href`

The library's rule is native elements first (`building-blocks.md` 1.10), and the APG tabs examples use `<button role="tab">`, so a reader expects `button[nfsTab]`. We decided that the tab directive is `a[nfsTab]` only, on the anchor of Foundation's `li.tabs-title > a`, and that the anchor carries no `href`. Foundation's `tabs-title` mixin styles only `.tabs-title > a` and keys the selected look on `a[aria-selected='true']`, so a `<button>` would get none of Foundation's tab styling and the library would have to copy Foundation's declarations for it, which the user's rule against re-implementing Foundation's Sass forbids. The `href` is dropped because Aria's tab list does not cancel link navigation on click: `href="#panel"` would jump to the panel and rewrite the hash behind `deepLink`, and it gives no-JavaScript users nothing, since Foundation hides unselected panels with `display: none`. The anchor becomes a focusable `role="tab"` element through Aria's roving `tabindex` (and the library's server-side tab stop on the selected tab); a dev-mode warning reports an `href`.

## Considered options

- `button[nfsTab]` beside `a[nfsTab]` (the building-blocks sketch): rejected because the button form has no Foundation styling without copied declarations, and two host forms double the test matrix for no behavioural gain.
- `<a href="#panel-id">` as in Foundation's docs: rejected for the navigation and hash conflict above.

## Consequences

- Consumers delete `href` and `data-tabs-target` from Foundation's docs markup and add `value`.
- A tab has no native activation before hydration; Enter, Space, and arrow keys pressed then are replayed from the strip's `keydown` listener, and clicks from its `click` listener.
- If Foundation's Sass later styles a button tab, `button[nfsTab]` can be added without breaking `a[nfsTab]`.
- 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the dev-mode warning for a tab's `href` is planned for a later milestone ([Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md)). In the first milestone the Tabs spec states the rule as documented usage: a tab carries no `href` (its usage rule 2).
