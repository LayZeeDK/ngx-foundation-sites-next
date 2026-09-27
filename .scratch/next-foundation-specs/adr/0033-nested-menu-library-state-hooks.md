---
status: accepted
---

# Library CSS keys on `data-nfs-*` attributes when Foundation's markup has no class for a state

AccordionMenu's height animation needs an "expanded" hook on the parent `li` (a grid on the `li` is the only in-target way to animate the multi-child submenu), and Foundation has none: its JavaScript put `aria-expanded` on the `li`, which is invalid on a `listitem` and which the library moves to the toggle button. We decided that when the library's Sass must key on a state that no Foundation class expresses, on an element the consumer writes, the directive binds a `data-nfs-<state>` attribute (`data-nfs-expanded` on the parent item, `data-nfs-shown` on a settled submenu) and the Library mixin selects on it; library-owned elements inside a Wrapper component may carry `nfs-`-prefixed classes instead (the Accordion spec's `nfs-accordion-content-shown`). Why: the glossary defines a State class as a Foundation class, so an unprefixed library class such as `is-expanded` would pass for Foundation vocabulary; Foundation's own selector for this state is attribute-keyed (`.is-accordion-submenu-parent[aria-expanded='true']`); and the Sticky spec's `data-nfs-sticky-on` already set the pattern.

## Considered options

- A library class `is-expanded` (the nested menu prototype's choice): rejected, it reads as a Foundation State class and would need the glossary to admit library classes.
- Foundation's `is-active` on the `li`: rejected, `.menu .is-active > a` paints a Hybrid item's link as the current page, and the binding would strip a consumer's current-page `is-active`.
- An inline style or `--nfs-*` custom property binding: rejected, consumers could override it only with `!important`, and building-blocks 1.13 limits custom properties to measured values.
- `aria-expanded` on the `li`: rejected, invalid on `listitem` (axe `aria-allowed-attr`).

## Consequences

- Consumers who theme the open state target `[data-nfs-expanded]`, a stable, documented, prefixed hook.
- When `:has()` enters the browser target, `li:has(> [aria-expanded='true'])` can replace `data-nfs-expanded` without a visible change.
- 2026-09-27 ([Spec: Callout](../issues/89-spec-callout.md)): the rule also covers a structural condition Foundation has no class for: `NfsCallout` binds `data-nfs-close-button` while its content holds a close button, from a content query, and `nfs-callout` reserves room on that side for WCAG 1.4.12. `.callout:has(.close-button)` replaces it once `:has()` enters the Browser target.
