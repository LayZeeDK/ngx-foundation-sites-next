---
status: accepted
---

# Button declares no event listeners and owns the disabled contract

Material disables an anchor button with `aria-disabled`, `tabindex="-1"`, and a click listener that cancels navigation, and leaves a focusable disabled submit button able to submit. Under this library's rendering modes a blocking listener fails three ways: before hydration and inside `@defer (hydrate never)` it never runs, during event replay Angular calls every listener stashed on the element and treats `stopImmediatePropagation()` as `stopPropagation()`, and any `click` listener on an `<a>` gives it a `jsaction` attribute, which makes Angular's dispatcher call `preventDefault()` on clicks inside a still-dehydrated block, so every plain `href` link-button there would stop navigating. We decided that `NfsButton` has no listeners: a disabled `<a>` is an HTML placeholder link (the consumer binds `href` or `routerLink` to `null`) that the directive marks `role="link"`, `aria-disabled="true"`, and `.disabled`, with dev-mode warnings for a disabled link that still has an `href` and an enabled one that has none; a `disabledInteractive` button renders `type="button"` while disabled so the platform performs no submit or reset; and the consumer's own handlers check the disabled state, as Material documents.

## Considered options

- Material's listener-based anchor disabling: rejected for the three failures above.
- The directive owning `href` through an input so one `disabled` binding removes it: rejected because RouterLink writes `href` through its own host binding, and two directives binding one attribute on one element resolve by directive order.
- A capture-phase listener added in code: not replayed, not recorded for `jsaction`, but still absent before hydration and in `hydrate never`, so it buys little over the native contract.

## Consequences

- Disabling a link takes two bindings (the target and `disabled`); the dev-mode check catches a forgotten one.
- A single-text-field form can still submit implicitly while its only submit button is focusably disabled, because HTML then treats the form as having no submit button; the form's submit handler checks the state. Natively disabled submit buttons do not have this gap.
- Any future directive placed on `<a>` elements whose navigation must stay native inside deferred regions follows the same rule: no host `click` listener.
- 2026-09-27 ([Re-run: Button spec under the class rule](../issues/128-rerun-button-class-rule.md)): the contract also covers `<input type="submit|button|reset">` hosts, which take native `disabled` and, with `disabledInteractive`, render `type="button"` while disabled.
- 2026-09-28 ([Spec: Pagination](../issues/87-spec-pagination.md)): the placeholder link is also a pagination's disabled previous or next item, written by the consumer without `nfsButton` (`role="link"`, `aria-disabled="true"`, no `href`); `nfsPagination`'s development checks report a disabled link that keeps its `href` and a placeholder link that is not marked disabled, as `nfsButton`'s do.
