# 10. WAI-ARIA APG patterns mapped to Foundation plugins

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which WAI-ARIA Authoring Practices pattern governs each Foundation plugin, and what exactly does that pattern require in roles, states, properties, and keyboard interaction? Where the APG says a pattern should NOT be used (for example `menu` roles for site navigation), record that too.

Patterns to read: accordion, tabs, disclosure, dialog-modal, alertdialog, tooltip, menubar, menu-button, slider, slider-multithumb, carousel, treeview, link, landmarks, toolbar, feed, button (for toggle buttons), plus the "Developing a Keyboard Interface" and "Names and Descriptions" practices. Map them to: Accordion, AccordionMenu, Drilldown, Dropdown, DropdownMenu, Equalizer (none), Interchange (none, but alt text), Magellan (navigation landmark, aria-current), OffCanvas, Orbit, ResponsiveAccordionTabs, ResponsiveMenu, ResponsiveToggle, Reveal, Slider, SmoothScroll (none), Sticky (none), Tabs, Toggler, Tooltip.

Sources: `d:/projects/github/w3c/aria-practices/content/patterns/<pattern>/<pattern>-pattern.html` and the examples under the same directory; `d:/projects/github/w3c/aria-practices/content/practices/**`; the WAI-ARIA 1.3 spec at `d:/projects/github/w3c/aria/index.html` for role definitions. Online: https://www.w3.org/WAI/ARIA/apg/patterns/.

## Deliverable

`research/aria-apg-patterns.md`: one section per Foundation plugin with the chosen pattern (or "no pattern; landmark and native semantics"), the required roles and attributes, the keyboard table, the APG's own warnings, and a link to the example that best matches Foundation's markup. Cite paths. Plain ASCII.

## Answer

- Every menu plugin (AccordionMenu, DropdownMenu, Drilldown, ResponsiveMenu) maps to the Disclosure Navigation Menu pattern by default, not `menubar`/`menu`. The APG says this in three places: the disclosure-navigation example ("does not use the WAI-ARIA menu role because it does not provide the complex functionality that assistive technologies expect"), the menubar-navigation example ("Caution! ... unnecessary for typical site navigation") and the treeview-navigation example (same caution for `tree`). Menubar and Tree View become opt-in modes with their full key tables recorded.
- Foundation's Nest utility stamps `menubar`/`menuitem`/`none` on every nested `ul` (submenus should be `menu`), copies link text into `aria-label`, and puts Drilldown's `aria-expanded` on `li[role=none]`, which the spec says user agents must ignore. None of that survives.
- Foundation's `data-submenu-toggle="true"` AccordionMenu is exactly the APG's disclosure-navigation-hybrid example (top-level link plus separate disclosure button).
- Drilldown has no APG pattern; the vertical Menu pattern's Right/Left/Escape keys fit it, but only with `menu` submenus and roving tabindex; the default is disclosure per level with explicit focus handoff.
- Dropdown's `aria-haspopup="true"` means "menu" per spec (`true` == `menu`, and the value MUST match the popup's role); a `.dropdown-pane` holding a form must drop it or use `aria-haspopup="dialog"` + `role=dialog`.
- Reveal: APG dialog example says "Please DO NOT make the element with role dialog focusable!" and Foundation focuses exactly that element; `aria-modal="true"` is missing; alertdialog covers confirmations. OffCanvas is a modal dialog only when it traps focus AND obscures the page (APG: mark modal only when both hold); otherwise disclosure plus landmark.
- Orbit fails the carousel pattern in five ways: no rotation control, no pause on keyboard focus, `aria-live="polite"` on the slide while auto-rotating (APG: "the page would become unusable"), a focusable wrapper with arrow keys that matches no pattern, and `nav` around the bullets. Tabbed carousel style recommended.
- Tabs: Foundation's roles and roving tabindex are already right; Up/Down must be vertical-only, and `activeCollapse` has no APG support. Accordion needs `hN > button` instead of `a[href=#]`, `aria-disabled` on the un-collapsible open header, and `region` only for few panels (APG: about 6 max).
- Slider: name is required (Foundation sets none); the APG's touch-AT warning on custom sliders is a concrete argument for native `<input type="range">`. Page Up/Down are the conventional big-step keys, not Shift+Arrow.
- Tooltip: the APG pattern is explicitly "work in progress; does not yet have task force consensus" with no example (issues 127/128). Minimum rules: `role=tooltip`, `aria-describedby`, Escape dismiss (Foundation lacks it), focus stays on trigger, never focusable, name prohibited on the tooltip.
- Magellan: `nav[aria-label]` + native links + `aria-current`. OPEN FOR HUMAN: `aria-current="location"` vs `"true"` for in-page scroll spies; APG only shows `page`, which is wrong for same-page sections.
- OPEN FOR HUMAN: whether tooltips may be attached to non-interactive `span`s made focusable with tabindex (Foundation's default demo); the APG never shows it and a focusable `generic` cannot be named.
- Surprise: `tabindex="1"` appears in Foundation's slider and tooltip docs; the keyboard practice says values above 0 are "strongly advised NOT" to be used.
- Feed and Toolbar map to nothing; Button, Link and Landmarks serve as building blocks only.

Findings: ../research/aria-apg-patterns.md

### Triage (auto-trap quadrant), 2026-09-26

Both OPEN FOR HUMAN items in this answer were carried into [Building-blocks map and cross-cutting architecture decisions](14-building-blocks-map.md) (its OPEN FOR HUMAN items 1 and 2) and are triaged there, once:

1. Magellan's `aria-current` token (`true` or `location`): DECIDED there, `true`.
2. Tooltip on non-interactive text (a `span` made focusable with `tabindex`): DECIDED there, interactive hosts only.

The [Spec: Magellan](30-spec-magellan.md) and [Spec: Tooltip](27-spec-tooltip.md) tickets were not yet resolved at triage time; they inherit these decisions.
