# 07. @angular/aria 22.2 inventory

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

What does `@angular/aria` 22.2 provide, how stable is each piece, and what is its API shape? The library's implementation hierarchy puts Aria first, so every plugin spec needs to know whether an Aria pattern exists for it.

Sources: `d:/projects/github/angular/components/src/aria/**` (directives, public API, tests, README files) and the guides at `d:/projects/github/angular/angular/adev/src/content/guide/aria/*.md` (overview, accordion, tabs, listbox, combobox, select, multiselect, autocomplete, menu, menubar, toolbar, tree, grid). Online: https://angular.dev/guide/aria.

## Deliverable

`research/angular-aria-inventory.md` with, per pattern: the directive selectors, inputs, outputs, and model signals; the ARIA roles and attributes it sets; keyboard behaviour; whether it renders or expects consumer markup; how it composes with host directives; the stability label; and any Foundation plugin it obviously matches (Accordion, Tabs, DropdownMenu, AccordionMenu, and so on) or clearly does not. Also record how Aria patterns are tested in the clone (harnesses, test setup) since the specs' Testing Decisions will mirror it. Cite paths. Plain ASCII.

## Answer

- `@angular/aria` 22.2.0 (npm latest, 2026-09-23; peer `@angular/cdk` 22.2.0 exact, `@angular/core` ^22||^23) ships eight stable entry points: accordion, tabs, listbox, combobox, menu (Menu, MenuBar, MenuItem, MenuTrigger), toolbar, tree, grid, each with a `/testing` harness entry point, plus `@angular/aria/private` exposing the UI pattern and behavior classes. The developer-preview tag was removed in 22.0.0 (CHANGELOG #33232); no `@developerPreview`/`@experimental` tags remain in `src/aria`.
- Every directive is headless: attribute selector with `ng` prefix and matching `exportAs`, sets role and ARIA attributes on the consumer's element, handles keyboard/click/focus via a private pattern class, and renders nothing. Panels use `inert` when hidden and leave visual hiding to CSS. Popups (menu, combobox) get no positioning; adev examples use `cdkConnectedOverlay` with `usePopover: 'inline'`.
- Common inputs: `disabled`, `softDisabled` (default true: disabled items stay focusable), `wrap`, `orientation`, `focusMode` (`roving` default | `activedescendant`), `selectionMode` (`follow` | `explicit`), `typeaheadDelay` 500ms. Two-way state is `model()`: `expanded` (accordion trigger, tree item, combobox), `selectedTab` (tab list), `value` (listbox, tree, menubar, combobox), `selected` (grid cell). Outputs: `itemSelected` (menu, menubar), `activated`/`deactivated` (grid cell widget).
- Injection tokens exported in 22.2.0 (#33607): `ACCORDION_GROUP`, `TABS`, `TAB_LIST`, `LISTBOX`, `MENU_COMPONENT`, `COMBOBOX_POPUP`, `TOOLBAR_WIDGET_GROUP`, `GRID`, `GRID_ROW`, `GRID_CELL`. Toolbar and Tree children inject the class directly.
- Lazy content: `ng-template[ngAccordionContent|ngTabContent|ngMenuContent|ngTreeItemGroup]` via `DeferredContent`; `preserveContent` defaults to `false` in source (content destroyed on collapse). Surprise: the accordion and tabs guides state the opposite default; source and spec win.
- Foundation matches: Accordion -> accordion (gap: no `allowAllClosed=false`; default `multiExpandable` true vs Foundation false). Tabs -> tabs (gap: no `activeCollapse`). ResponsiveAccordionTabs -> both. AccordionMenu -> tree with `nav="true"` (APG navigation treeview; needs `ngTreeItemGroup` templates and `[parent]` inputs; `multiExpandable` forced true). DropdownMenu -> menubar+menu behaviourally (hover open via `expansionDelay`, arrows, Escape, typeahead) but `role=menu` semantics; the Aria guide says not to use menu for site navigation.
- No Aria pattern for Drilldown, Dropdown pane, Reveal, OffCanvas, Tooltip, Orbit, Slider, Toggler, Equalizer, Interchange, Magellan, SmoothScroll, Sticky, ResponsiveMenu, ResponsiveToggle, Abide. Listbox, Combobox, Toolbar, Grid have no Foundation plugin.
- Testing in the clone: Karma+Jasmine via Bazel `ng_web_test_suite`, zoneless by default (`test/angular-test.init.ts`), `provideFakeDirectionality('ltr')` + `_IdGenerator` providers, raw `KeyboardEvent`/`PointerEvent` dispatch then `await fixture.whenStable()`, attribute assertions, and `runAccessibilityChecks` (axe-core) in `afterEach`. Harnesses extend CDK `ComponentHarness`/`ContentContainerComponentHarness` and are exercised through `TestbedHarnessEnvironment.loader(fixture)`; AccordionHarness and TabHarness re-point their root loader at the controlled panel via `aria-controls`.
- Open for the specs: whether DropdownMenu should carry `role=menu` (Aria) or the APG disclosure-navigation pattern (custom); whether AccordionMenu accepts the tree's markup shape; `@angular/material` 22.2 does not consume `@angular/aria`, so there is no Material precedent to copy.

Findings: ../research/angular-aria-inventory.md
