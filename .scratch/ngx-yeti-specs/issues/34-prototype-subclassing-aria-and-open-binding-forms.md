# 34. Prototype: subclassing Aria's directives, and `[open]` against `[attr.open]`

Type: prototype
Status: claimed
Blocked by: 30, 33
Labels: wayfinder:prototype
Map: ../map.md

## Question

1. **Subclassing against composition for Aria's host bindings.** [Prototype: fitting Angular Aria to Yeti by directive composition](30-prototype-fitting-aria-by-directive-composition.md) measured composition replacing Aria's server `tabindex` (a hand-over to `active()`) and `role` (`[attr.role]`, null on `summary`, in [Research: where Angular Aria's attribute directives fit Yeti's own markup](32-research-aria-directives-on-yetis-own-markup.md)). In both cases hydration wrote a static host attribute once more before the binding won.
   - Can a package directive that `extends` an Aria directive class (for example `ToolbarWidget`, `AccordionTrigger`, `Tab`) replace a static host attribute (`role`) and a host binding (`[attr.tabindex]`) through its own `host` metadata?
   - How do Angular's inherited host attributes and bindings merge? Read `ɵɵInheritDefinitionFeature` and the compiler's handling of `host` on a subclass.
   - Does a subclass avoid the one-pass rewrite at hydration that composition shows?
   - What does a subclass depend on: protected or private members, the constructor's `inject()` calls, `exportAs`, and providers? Is subclassing an Aria directive supported or stable across Aria releases (read the package's public API and any docs or issues)?
   - Compare it with composition on server HTML, hydration, warnings, and lines of package code.
2. **`[open]` (property) against `[attr.open]` (attribute) on `details` and `dialog`.** Ticket 18 measured a `[open]` property binding closing a `details` the user opened before hydration. Ticket 30 measured the same with `[attr.open]`. Neither compared the two forms side by side, and neither tested `dialog`. For each form, on `details` and on a non-modal and a modal `dialog`, measure:
   - whether the server HTML carries the `open` attribute when the bound value is true (does the server DOM reflect the `open` property?);
   - whether hydration writes the value again;
   - whether a toggle the user made before hydration survives;
   - what a `dialog` opened by `showModal()` or a `command="show-modal"` invoker does when `open` is set as a property or an attribute;
   - whether any form keeps a pre-hydration toggle without reading the DOM.

## User instructions, 2026-10-03

The user's own messages, verbatim:

> #54 (markup-agnostic) A. Host bindings: Can directive composition or directive sub-classing be used replace for example fixed roles Angular Aria host bindings?
>   B. Similarily, can directive composition or sub-classing be used to fix server-rendered HTML for example to fix tabindex="-1" until hydration?

> 56. Did you consider that there's a difference between `[open]` (Element property binding) and `[attr.open]` (Element attribute binding)?

## How to work it

One prototype in ticket 29's workspaces (`D:/tmp/ngx-yeti-29-buttons/ws`, `D:/tmp/ngx-yeti-29-accordion/ws`), using development builds so that Angular's hydration checks run. Measure in Chromium, Firefox, and WebKit. Write `prototypes/aria-subclass-and-open/README.md`; the orchestrator appends the `## Answer`. Decide nothing.
