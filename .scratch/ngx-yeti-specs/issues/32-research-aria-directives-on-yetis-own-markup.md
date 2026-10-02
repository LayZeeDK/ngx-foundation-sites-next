# 32. Research: where Angular Aria's attribute directives fit Yeti's own markup

Type: research
Status: open
Blocked by: 30
Labels: wayfinder:research
Map: ../map.md

## Question

Every Angular Aria directive has an attribute selector (`[ngAccordionTrigger]`, `[ngToolbarWidget]`, `[ngTab]`, and so on), so it can sit on any element. Only the deferred-content directives require `ng-template` (`ng-template[ngAccordionContent]`, `[ngTabContent]`, `[ngMenuContent]`, `[ngComboboxPopup]`, `[ngTreeItemGroup]`). This was read in `angular/components` `708d4c6e2`, `src/aria/**`. Ticket 29's Aria variants used Aria's documented markup, not Yeti's, and its accordion's lost selectors came from that choice. Its hybrid on `<summary>` kept every Yeti selector.

The selectors leave Aria free of markup, but its host bindings are not. It writes static roles (for example `role="button"` on the accordion trigger, `accordion-trigger.ts:48`), `tabindex`, `inert`, and `aria-*` attributes, and it defers content.

For every item in the spec list ([ticket 11](11-decide-spec-list.md)), and for each Aria pattern that addresses an accessibility feature Yeti lacks ([ledger.md](../ledger.md)), can Aria's directives be applied to Yeti's own markup? Answer per item:

- which Yeti elements each directive would sit on;
- which host bindings conflict with Yeti's native semantics or CSS: a role over a native role, `inert` or `tabindex` in the server HTML (upstream bug A5), or deferred content;
- whether directive composition can settle each conflict, using [Prototype: fitting Angular Aria to Yeti by directive composition](30-prototype-fitting-aria-by-directive-composition.md)'s findings;
- whether the result meets the hydration constraints (map, Standing rulings, 2026-10-03).

## User instructions

The user's rule, 2026-10-02, verbatim:

> Generally, only reach for Angular Aria when it addresses an accesibility feature that Yeti is missing. If Angular Aria itself introduces accessibility or SSR/hydration issues or violates any other constraint, first see if it can be modified to fit using other patterns like directive composition. If fitting Angular Aria doesn't seem possible and CDK does not provide a suitable alternative either, add custom, modern Angular-native code.

The user's question, 2026-10-03, verbatim:

> accordion: 54. Isn't Angular Aria pretty much markup-agnostic? Does its directives target specific elements or only attribute selectors? If markup-agnostic, reconsider how Angular Aria can be applied to Yeti's components and other specs output by the destination.

## How to work it

Use a `/research` subagent once ticket 30 is resolved. Read Aria's source and Yeti's markup, and measure where a claim needs it. Write `research/aria-on-yeti-markup.md` with one row per item and pattern, and append an `## Answer`. Decide nothing: the building-blocks rows change only by the user's decision.
