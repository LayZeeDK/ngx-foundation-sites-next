---
status: accepted
---

# The Accordion wrapper owns Foundation's expansion policy on top of Aria

`@angular/aria`'s `AccordionGroup` defaults `multiExpandable` to `true` and has no way to keep one panel open, while Foundation's Accordion defaults `multiExpand` to `false` and `allowAllClosed` to `false`, and CDK and Material also default to single expansion. A host-directive wrapper cannot change the default of an Aria `input()` (the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md), cases 4 and 5), but it can write Aria's `model()`s and call its methods, and a `model()` emits synchronously on every internal `set` (`packages/core/src/authoring/model/model_signal.ts`). We decided that `NfsAccordion` does not expose Aria's `multiExpandable`; it declares its own `multiExpand` and `allowAllClosed` inputs with Foundation's defaults, leaves Aria in multi-expand mode, closes the other items when an item's `expanded` model emits `true` in single mode, and keeps the last open panel open by marking its title `aria-disabled="true"` (the APG rule for a panel that may not collapse) and stopping that title's `click` and Enter/Space `keydown` before they reach Aria's group listener. Why: the defaults stay Foundation's, which `building-blocks.md` 1.4 names as this plugin's example, and a later switch to Aria's default would silently change behaviour in every consumer accordion that never bound the input.

## Considered options

- Expose Aria's `multiExpandable` as `multiExpand` and record `true` as a delta from Foundation: the smallest code, rejected because it changes Foundation's documented default and differs from CDK and Material, and because `allowAllClosed` needs wrapper logic anyway.
- Subclass `AccordionGroup` and override `multiExpandable`: rejected; the base class builds its pattern from its own fields during construction, before a subclass field exists, so the override never reaches the pattern without replacing Aria's private `_pattern`.
- Re-open a panel after Aria closed it for `allowAllClosed`: rejected; it emits `expandedChange` twice per blocked click and leaves the title announcing an action that does nothing.

## Consequences

- Programmatic writes to a title's `[expanded]` binding bypass the policy, as they bypass Aria's own single mode; the library warns in dev mode when single mode starts with several open items.
- The same rule applies to any other Aria-hosted plugin whose Aria default differs from Foundation's: declare a library input, never expose the Aria one, and enforce through Aria's models, methods, and event interception.
- 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the development warning for several items bound open in single mode is planned for a later milestone ([Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md)). In the first milestone the Accordion and Accordion Menu specs state the rule as documented usage: while single mode is on, bind at most one item open per level; every item bound open renders open, and nothing warns.
