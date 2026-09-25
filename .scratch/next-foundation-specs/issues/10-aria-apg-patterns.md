# 10. WAI-ARIA APG patterns mapped to Foundation plugins

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which WAI-ARIA Authoring Practices pattern governs each Foundation plugin, and what exactly does that pattern require in roles, states, properties, and keyboard interaction? Where the APG says a pattern should NOT be used (for example `menu` roles for site navigation), record that too.

Patterns to read: accordion, tabs, disclosure, dialog-modal, alertdialog, tooltip, menubar, menu-button, slider, slider-multithumb, carousel, treeview, link, landmarks, toolbar, feed, button (for toggle buttons), plus the "Developing a Keyboard Interface" and "Names and Descriptions" practices. Map them to: Accordion, AccordionMenu, Drilldown, Dropdown, DropdownMenu, Equalizer (none), Interchange (none, but alt text), Magellan (navigation landmark, aria-current), OffCanvas, Orbit, ResponsiveAccordionTabs, ResponsiveMenu, ResponsiveToggle, Reveal, Slider, SmoothScroll (none), Sticky (none), Tabs, Toggler, Tooltip.

Sources: `d:/projects/github/w3c/aria-practices/content/patterns/<pattern>/<pattern>-pattern.html` and the examples under the same directory; `d:/projects/github/w3c/aria-practices/content/practices/**`; the WAI-ARIA 1.3 spec at `d:/projects/github/w3c/aria/index.html` for role definitions. Online: https://www.w3.org/WAI/ARIA/apg/patterns/.

## Deliverable

`research/aria-apg-patterns.md`: one section per Foundation plugin with the chosen pattern (or "no pattern; landmark and native semantics"), the required roles and attributes, the keyboard table, the APG's own warnings, and a link to the example that best matches Foundation's markup. Cite paths. Plain ASCII.
