# 07. @angular/aria 22.2 inventory

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

What does `@angular/aria` 22.2 provide, how stable is each piece, and what is its API shape? The library's implementation hierarchy puts Aria first, so every plugin spec needs to know whether an Aria pattern exists for it.

Sources: `d:/projects/github/angular/components/src/aria/**` (directives, public API, tests, README files) and the guides at `d:/projects/github/angular/angular/adev/src/content/guide/aria/*.md` (overview, accordion, tabs, listbox, combobox, select, multiselect, autocomplete, menu, menubar, toolbar, tree, grid). Online: https://angular.dev/guide/aria.

## Deliverable

`research/angular-aria-inventory.md` with, per pattern: the directive selectors, inputs, outputs, and model signals; the ARIA roles and attributes it sets; keyboard behaviour; whether it renders or expects consumer markup; how it composes with host directives; the stability label; and any Foundation plugin it obviously matches (Accordion, Tabs, DropdownMenu, AccordionMenu, and so on) or clearly does not. Also record how Aria patterns are tested in the clone (harnesses, test setup) since the specs' Testing Decisions will mirror it. Cite paths. Plain ASCII.
