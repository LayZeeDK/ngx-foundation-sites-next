---
status: accepted
supersedes: 0034
---

# Orbit slides host Aria's `TabPanel` and override only `inert`, derived from `TabPanel.visible()`

[ADR 0034](0034-orbit-slide-contract.md) took Aria's `TabPanel` off the Orbit slides because a plain `inert` override was measured losing to Aria's own binding in server HTML, and it stated the rule as universal: no binding of the slide can keep `inert` out of server HTML. The [Decide the `@angular/aria` fallback confirmation](../issues/75-evidence-aria-fallback-confirmation.md) measured a binding that does: one derived from Aria's public `TabPanel.visible()`, which changes in every change-detection pass in which Aria's `inert` changes and is written after it, so Aria's value never stands before the Orbit is live. It holds in the server renderer in Foundation's document order with `@for` slides and bullets and with the selection changing in a later server pass (probe G), and end to end in the Orbit keyboard prototype in Chromium, Firefox, and WebKit (the `inert` gate that failed in all three engines passes in all three; hydration suite 15 of 15, keyboard suite 12 of 12, re-run by the judge). We decided that `NfsOrbitSlide` hosts Aria's `TabPanel` again (exposing `value` and `id`) and binds one thing of its own, `inert`, computed from `TabPanel.visible()` and the Orbit's live signal: absent until the directives are live, exactly Aria's value from then on. [ADR 0025](0025-orbit-live-inert.md)'s decision (no slide `inert` before the directives are live) stands; this ADR replaces ADR 0034's mechanism with ADR 0025's original one, in a form that holds.

```ts
readonly inert = computed(() => {
  const visible = this.#panel.visible(); // Aria TabPanel's public signal

  if (this.#orbit.live()) {
    return visible ? null : true; // Aria's own value once live
  }

  // null and undefined both render "no attribute". Switching between them makes
  // this binding write again in every pass in which Aria's `inert` changes, and the host's
  // binding is applied after its host directive's, so Aria's `inert` never stands before live.
  return visible ? null : undefined;
});
```

Why it holds (source, Angular and `@angular/aria` 22.2): Aria binds `'[attr.inert]': '!visible() ? true : null'` (`src/aria/tabs/tab-panel.ts:49`), so Aria's value changes only when `visible()` changes, and so does the derived value; `bindingUpdated` compares with `Object.is` (`packages/core/src/render3/bindings.ts:54`), so `null` and `undefined` count as a change; `setElementAttribute` removes the attribute for any `value == null` (`render3/instructions/shared.ts:530-535`); host directives execute before their host (`render3/features/host_directives_feature.ts:164`), so the slide writes last. The plain override lost because slides inside `@for` bind in their embedded views before the bullets' `@for` views run `ngOnInit` and register, so Aria's `inert` arrived in a later pass while the plain override's value was unchanged (probe G `g1` against static markup `g4`).

## Considered options

- The custom tab panel contract (ADR 0034): rejected now. A static role, four bindings, a slide id generator, a bullet-to-slide pairing lookup, an `aria-controls` override on every bullet, and a per-bullet development warning, all resting on a premise measured false; Aria's `TabPanel` and `Tab` render every one of those attributes.
- A plain override, `live && !selected ? true : null`: rejected, measured failing (probe G `g1`; the keyboard prototype's first run, three engines).
- Bullets before slides in the document, so Aria's `inert` is present from the first pass: rejected; it holds only until the selection changes in a later server pass (probe G `g7`), and it is the opposite of Foundation's markup.
- An override that flips from `undefined` to `null` when the Orbit's own bullet registry fills: rejected; it follows the library's registry, not Aria's value, and fails on a late selection change (probe G `g8`).
- A `Renderer2` write in a render callback, giving `TabPanel` its `value` only once live, registering slides in Aria's panel collection, dropping Aria for the bullets: rejected, as in ADR 0034.

## Consequences

- Aria renders the slide's `role`, `id` (`ng-tabpanel-` prefix; a consumer's static `id` reaches Aria through the exposed input), `tabindex`, `aria-labelledby`, and, once live, `inert`, and each bullet's `aria-controls`. `NfsOrbitBullet` drops its `aria-controls` override; the library's `nfs-orbit-slide-` id generator and the pairing lookup go.
- Development warnings: each slide logs Aria's "ngTabPanel must have an ngTabContent structural directive to render." pair (accepted, as in the Tabs spec); the per-bullet "does not have a corresponding ngTabPanel" pair is gone. Aria now reports a slide without a bullet, a bullet without a slide, and duplicate bullet values itself, so the Orbit's own pairing check keeps only duplicate slide values.
- The selection link is synchronous. Once live, a slide's `inert` and `tabindex` follow Aria's selected tab, not the Orbit's `selected` model, so the Orbit writes Aria's `selectedTab` at the same three points where mechanic 8 records a focus handoff: the `selected` model's change notification, `ngOnChanges` for a parent binding, and the live flip's reconciliation. A later write would let the live flip put `inert` on a slide adopted from a pre-hydration scroll or focus (the override turns from `undefined` to `true` while Aria still reads the old selection) and would leave the handoff target `inert` when the handoff runs.
- A client-side transient that nothing renders: in the hydration pass (or first client pass) in which the bullets register, Aria writes `inert="true"` on each unselected slide and the override removes it in the same host-binding run. The judge's probe measured the set and the removal as consecutive writes in all three engines, with focus inside an unselected slide unchanged after each; nothing between them reads layout, so the attribute is never styled, rendered, or exposed to assistive technology. A `MutationObserver` reports both writes, so the spec's tests assert presence (`hasAttribute('inert')`), never the absence of mutation records.
- ADR 0025's second consequence applies again: the slide's `inert` equals Aria's whenever both apply, now by construction.
- Two dependencies, each guarded by a required test: `bindingUpdated` telling `null` from `undefined` while both remove the attribute, and Aria's `inert` staying a function of `visible()` alone. The SSR smoke renders Foundation's order with `@for` slides and bullets, one fixture with `selected` arriving after the first server pass through a `PendingTasks` task, and asserts no slide `inert`; the live-gate browser test asserts `inert` on exactly the unselected slides after the first render callback. Either failing reopens this decision.
- Building-blocks 1.9's binding rule gains a third clause: a wrapper binding also holds when its value changes in every pass in which Aria's does, which a binding computed from the same public Aria signal guarantees. Plain overrides and document-order arrangements do not meet it.
- Evidence: `prototypes/orbit-slide-derived-inert/` (probe G, the keyboard prototype diff and results, the judge's transient probe).
- 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the Orbit's own check for duplicate slide values is planned for a later milestone ([Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md)); in the first milestone distinct slide values are documented usage. Aria's own warnings are unchanged.
