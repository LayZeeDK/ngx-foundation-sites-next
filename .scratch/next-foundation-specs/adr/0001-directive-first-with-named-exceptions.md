---
status: accepted
---

# Directive-first, with three named component exceptions

Foundation's docs markup already carries every element a plugin needs, and `@angular/aria` proves an all-directive shape works for accordions, tabs, and menus (`research/angular-aria-inventory.md` 1.4). We decided that every plugin becomes attribute directives on the consumer's Foundation markup, and that a component is allowed only where Foundation's JavaScript generated structure the consumer never wrote and that structure is not a single plain element: `ResponsiveAccordionTabs` (renders one of two markup trees and must swap heading-plus-button semantics for tab semantics), the `.accordion-content` wrapper component (one inner element around `<ng-content>`, which the grid-row height animation needs), and the Tooltip tip (created on first show and kept, never authored). `[nfsTabsPanel]` is a directive, resolved by the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md): Aria's tab panel works without a template child it cannot get otherwise, and Tabs has no height animation and its panel content is projected (ADR 0008). Everything else Foundation generated is either a platform feature (`::backdrop`), one plain consumer-written element with a directive on it (off-canvas overlay, drilldown back button, sticky container, submenu toggle), or dropped (parent-link clones, HTML-string options).

## Considered options

- The repo skill's table ("container = component, item = component if complex"): rejected because it predates the user's directive preference and would re-render Foundation markup the consumer already owns, which also fights hydration (server HTML must be the consumer's markup).
- Components everywhere with content projection (Material's shape): rejected for the same reasons and because Material's own headless layer (Aria) went the other way.

## Consequences

- 2026-09-27: the Tooltip exception also covers the tip's hidden description element, created in the first client render callback and never authored ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).
- Consumers write Foundation's markup with small documented deltas (`<a href="#">` triggers become `<button>`, `<div class="reveal">` becomes `<dialog class="reveal">`).
- No directive creates DOM before hydration; measurements and observers wait for render callbacks.
- Specs that find they need generated structure must first look for a platform feature or a one-element consumer authoring step before proposing a component.
