# Checks extraction, group d

Group: d. Files: `specs/nested-menu.md`, `specs/off-canvas.md`, `specs/orbit.md`, `specs/pagination.md`, `specs/progress-bar.md`, `specs/prototyping-utilities.md`, `specs/responsive-accordion-tabs.md`, `specs/responsive-embed.md`, `specs/responsive-menu.md`. Commit read: `ba07780`. Classification rule's source: ticket 158, [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), Decision item 1, applied through [Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md).

Kind definitions used below (verbatim from the task brief):

- `forgotten-import`: ADR 0046's four checks: In-family checks (parent checks, child probes, the out-of-reach report M4), `strictDirectiveImports`, `strictParents`, the static `missing-imports` builder; also `nfsDirectiveCheck` calls, the host record, the Selector manifest, the development-only token descriptions (M7), and `nfsReportForgottenPeer`.
- `family`: a family's own development check that reads another part of its family (its parent, a child, or a peer): registration checks, DOM-only placement checks, order checks, and the outside-the-parent warnings of building-blocks 1.9.
- `misuse`: a directive's own development warning that reads only its host, its inputs, its content, or the page (a copied Foundation class, a missing accessible name, a value it cannot use).
- `runtime`: ADR 0040's Runtime checks (a Variant value with no class in the compiled CSS, missing Variant properties, Breakpoint drift), `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, and the `NfsRuntimeChecks` keys.
- `build-time`: the Library mixins' `@error` and `@warn` checks (contrast, registry, and name checks, and presence markers read only by a check), and the Variant declaration tooling's check mode.

A note on how the group's files use `provideNfsRuntimeChecks`: the one occurrence found (orbit.md, browser-level test layer) configures `strictParents`, an ADR 0046 forgotten-import option, through that provider function, not a Runtime-check (ADR 0040) option. It is filed under forgotten-import below, with this line noted as a boundary call.

---

## specs/nested-menu.md

### forgotten-import: In-family checks (the nested-menu family)

Location: "Hierarchy and DI shape", the bullet list at lines 170-176.

Text:

````text
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part; a hosted part probes from its host's element, because the shared spec's child probe also counts the host record, and `nfsMenuModeToken`'s development-only description is under `NfsMenuRoot` and `nfsMenuModeToken` (API):
  - Each plugin root, `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, and `NfsResponsiveMenu` (the call is its spec's; this utility's consumer contract requires it): `nfsDirectiveCheck('<Root>', {children: ['NfsMenuItem']})`, probing every `NfsMenuItem` of its tree (the Drilldown also probes `NfsDrilldownBack`, its spec). No parent check: `nfsMenuModeToken` and the hosted `NfsMenu` are `self` injections of its own element, and the root handle's `nfsTopBarRightToken` is context, not a parent, and stays optional ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)). A root hosted by `NfsResponsiveMenu` probes from the responsive `ul`, so `NfsResponsiveMenu` calls `nfsDirectiveCheck('NfsResponsiveMenu')` with its name only; the hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)). No peers. `strictParents` changes nothing.
  - `NfsMenuItem`: `nfsDirectiveCheck('NfsMenuItem', {parent, children: ['NfsSubmenu', 'NfsSubmenuToggle']})`, the shared spec's usage example. Parent check over `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, and `NfsResponsiveMenu`, `found` from `nfsMenuModeToken`, with the `alone` sentence "It binds no Nest or mode classes; its submenu shows as a plain nested Menu.", which replaces development check 5's item warning, so an item without a root is reported once. Its `NfsSubmenu` injection has no parent check, because `null` means the root's level, which every root provides on purpose. It probes `NfsSubmenu` and `NfsSubmenuToggle`. No peers. `strictParents`: it throws at construction when no root is found.
  - `NfsSubmenu`: no parent check, because `inject(NfsMenuItem)` is required and NG0201 is the report (a lookup by class, which the development build names `_NfsMenuItem` and no token description reaches). It probes `NfsMenuItem`, its items; its hosted `NfsMenu` probes `NfsMenuText`. No peers. `strictParents` changes nothing.
  - `NfsSubmenuToggle`: no parent check, for the submenu's reason (a required `inject(NfsMenuItem)`). It probes `NfsSubmenuToggleText`. No peers: `aria-controls` comes from the registered submenu. `strictParents` changes nothing.
  - `NfsSubmenuToggleText`: parent check over `NfsSubmenuToggle`, its development-only `inject(NfsSubmenuToggle, {optional: true})` giving `found`, with the `alone` sentence "Its visually hidden text names nothing outside a hybrid toggle.", which replaces the outside-any-toggle half of development check 3. No child probes. No peers. `strictParents`: it throws at construction when no toggle is found.
````

Also (token description, same mechanism, M7):

````text
`nfsMenuModeToken = new InjectionToken<NfsMenuRoot>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsMenuModeToken (provided by NfsAccordionMenu from 'ngx-foundation-sites/accordion-menu', NfsDrilldown from 'ngx-foundation-sites/drilldown-menu', NfsDropdownMenu from 'ngx-foundation-sites/dropdown-menu', or NfsResponsiveMenu from 'ngx-foundation-sites/responsive-menu', on an ancestor element declared in the same template)" : '')`, its description in development builds only and naming all four roots, because each provides the token through `nfsMenuRootProviders` from its own entry point (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), in its form for a token several directives provide, as `nfsOpenableToken`'s), lives in a token file that imports `NfsMenuRoot` as a type only (building-blocks 1.9).
````

Location of the token text: "API", `#NfsMenuRoot and nfsMenuModeToken` subsection, line 218.

Tests and stories: Story `nested-menu--fixture` and the "2. Browser-level test" layer's "Dev-mode warnings" bullet (line 605): "a parent without a toggle, and no check 4 warning for a parent whose `button[nfsSubmenuToggle]` directive is not imported (the item's child probe reports it once)". "3. Node-level Vitest" runs no forgotten-import case directly (SSR smoke asserts no development warning is logged). No dedicated story exercises the probes; the probe mechanism itself is the shared forgotten-import-checks spec's own test layer (out of this file).

Needs: `nfsDirectiveCheck` (the shared forgotten-import-checks utility, out of this file); `nfsMenuModeToken`'s development-only description string (needed only by this check; used elsewhere by nothing else); `nfsMenuRootProviders(mode)` (also plumbing for DI, not check-only).

Rule as documented usage: Every part of a menu (an item, a submenu, a toggle, a toggle-text span, and each plugin root) must be declared inside the element that carries the matching root directive (`nfsAccordionMenu`, `nfsDrilldown`, `nfsDropdownMenu`, or `nfsResponsiveMenu`), in the same template, with that root's own entry point imported.

Mentions:
- Line 292 (Development checks, item 3): "A span outside any toggle is reported once, by its In-family parent check (Hierarchy and DI shape)."
- Line 294 (Development checks, item 5): "An item with no root (above) is reported once, by its In-family parent check."

### misuse: Copied Foundation classes (Development check 1)

Location: "API", "Development checks" subsection, item 1, line 290.

Text:

````text
1. Copied Foundation classes (building-blocks 1.4): `NfsMenuItem`, `NfsSubmenu`, and `NfsSubmenuToggle` read their host's static `class` through `HostAttributeToken('class')` in a field initialiser that runs only under `ngDevMode` (after render the stripped token no longer shows), and report each Foundation class their map owns: `is-active` on a submenu, or on an item with a submenu, names `[expanded]` on the item; `is-active` on an item without a submenu names `aria-current` on its link; `submenu-toggle` names `hybrid`; any other Nest or State class says the family binds it from the Menu mode and state. A submenu's redundant `menu`, `nested`, and `vertical`, and a span's redundant `submenu-toggle-text`, merge and are not reported. Foundation's back-compatibility `active` on a leaf is the Menu directive's check 2.
````

Tests and stories: Story `nested-menu--rtl` and every other story write no Foundation or library class (Testing Decisions intro); "2. Browser-level test", "Dev-mode warnings" bullet (line 605): "each copied class with its message (`is-active` on a submenu and on a parent item name `[expanded]`, on a leaf `aria-current`, `submenu-toggle` names `hybrid`), and none for a submenu's redundant `menu nested vertical`". Rendered HTML section, lines 511 and 472-479, shows the copied classes stripped and gives the exact example markup.

Needs: `HostAttributeToken('class')` (development builds only); the class map's key set (the same source used to render the classes).

Rule as documented usage: Do not copy Foundation's `is-active`, `submenu-toggle`, or any other Nest/State class from Foundation's docs onto an item, a submenu, or a toggle; bind `[expanded]`, `aria-current`, or `hybrid` instead, because the directive's own class bindings replace them on the server and in the browser.

Mentions: Rendered HTML section, lines 511, 472-479 (example markup and its explanation); the class-mapping table's Binding rule paragraph, line 125.

### misuse: Hybrid toggle missing accessible name (Development check 2)

Location: "API", "Development checks" subsection, item 2, line 291.

Text:

````text
2. A `hybrid` toggle with no `aria-label` or `aria-labelledby` whose name is not inside a `span[nfsSubmenuToggleText]`: no name, or a visible name inside the 40 px toggle (the Hybrid item's toggle must name its item, for example "Products pages").
````

Tests and stories: "2. Browser-level test", "Dev-mode warnings" bullet (line 605): "a hybrid toggle with no name, and one whose text sits outside `span[nfsSubmenuToggleText]`".

Needs: none beyond the toggle's own rendered content (no Sass/TS state; a DOM read of its own host).

Rule as documented usage: A hybrid toggle (`button[nfsSubmenuToggle][hybrid]`) must be named, either through `aria-label`/`aria-labelledby` or through a `span[nfsSubmenuToggleText]` inside it.

Mentions: none beyond the check text itself.

### family: `span[nfsSubmenuToggleText]` inside a non-hybrid toggle (Development check 3)

Location: "API", "Development checks" subsection, item 3, line 292.

Text:

````text
3. A `span[nfsSubmenuToggleText]` inside an `NfsSubmenuToggle` that is not `hybrid`: it hides the only visible label of a parent button. A span outside any toggle is reported once, by its In-family parent check (Hierarchy and DI shape).
````

Tests and stories: "2. Browser-level test", "Dev-mode warnings" bullet (line 605): "a `span[nfsSubmenuToggleText]` in a non-hybrid toggle and outside any toggle".

Needs: the toggle's own `hybrid` input, read by `NfsSubmenuToggleText` through its development-only `inject(NfsSubmenuToggle, {optional: true})` (Hierarchy and DI shape, line 172).

Rule as documented usage: Put `span[nfsSubmenuToggleText]` only inside a toggle that carries `hybrid`; a non-hybrid toggle is named by its own visible text.

Mentions: none beyond the check text.

Boundary call: this check is a `span`'s own directive (`NfsSubmenuToggleText`) reading a property (`hybrid`) of the toggle it is declared inside (`NfsSubmenuToggle`, injected without `skipSelf`) -- by wording it reads "its host" (the span's own containing toggle element), which would suggest `misuse`, but the value it reads belongs to a distinct sibling directive on an ancestor element, the pattern the `family` definition names ("reads another part of its family ... its parent"). Filed under `family`, first in the tie-break order after `forgotten-import`.

### family: Parent item with a submenu but no toggle (Development check 4)

Location: "API", "Development checks" subsection, item 4, line 293.

Text:

````text
4. A parent item with a submenu but no toggle (Foundation's `<a href="#">` parent left unmigrated). An item holding an element that carries `nfsSubmenuToggle` is not reported here: that toggle's import is forgotten, which the item's child probe reports once.
````

Tests and stories: "2. Browser-level test", "Dev-mode warnings" bullet (line 605): "a parent without a toggle, and no check 4 warning for a parent whose `button[nfsSubmenuToggle]` directive is not imported (the item's child probe reports it once)".

Needs: the item's own registered children (`submenu`, `toggleButton` signals, API table line 238), read by `NfsMenuItem` itself.

Rule as documented usage: Every parent item (one that holds a submenu) must also hold a `button[nfsSubmenuToggle]`.

Mentions: none beyond the check text.

Boundary call: reads whether the item (its own directive, `NfsMenuItem`) has a registered child toggle -- "reads another part of its family (... a child)" by the `family` definition's own wording, even though the item and toggle are both markup the same developer writes on one section. Filed under `family`.

### misuse: `expandAll()` outside accordion mode or with `multiOpen` off (Development check 5)

Location: "API", "Development checks" subsection, item 5, line 294.

Text:

````text
5. `expandAll()` outside accordion mode or with `multiOpen` off. An item with no root (above) is reported once, by its In-family parent check.
````

Tests and stories: API table, `NfsMenuRoot.expandAll()` row (line 215): "otherwise does nothing and warns in development". No dedicated story line found beyond the API table's own note.

Needs: the root's own `mode` and the accordion behaviour's `multiOpen` slot (both read from the root's own configured state).

Rule as documented usage: Call `expandAll()` only while the displayed mode is accordion and `multiOpen` is on; otherwise it is a no-op.

Mentions: none beyond the check text and the API table row it restates.

### misuse: Root DOM walk changed the dropdown Base side (Development check 6)

Location: "API", "Development checks" subsection, item 6, line 295.

Text:

````text
6. A root with a dropdown slot whose Base side the DOM walk changed: it sits in a `.top-bar-right` that dependency injection could not see (a menu projected into a Top Bar's right-hand section from another template, or a section written without `nfsTopBarRight`), so its submenus' side changed at hydration. The warning names `alignment="right"`, which puts the side in the server HTML. It fires only when the walk changes the result (`alignment` `'auto'`, `align()` not `'right'`, direction `ltr`).
````

Tests and stories: "2. Browser-level test" layer, "Dev-mode warnings" bullet (line 605): "a projected right-hand root (check 6), and none for a root declared in the section".

Needs: the DOM walk's result (`closest('.top-bar-right')`), run once in the root's first render callback (Base side paragraph, lines 220 and 329).

Rule as documented usage: A dropdown-mode root placed inside a Top Bar's right-hand section should be reachable by dependency injection (declared inside the section in the same template) or, failing that, should set `alignment="right"` itself, so the server HTML already shows the correct side.

Mentions: "API", the Base side paragraph, line 220 ("the walk can only add the section and changes only the side classes of closed submenus, and it never runs when the token was found"); D33 (Further Notes, line 687).

### build-time: Current-link fill contrast (1.4.1)

Location: "Further Notes", "Sass" subsection, the "Checks (no CSS output)" paragraph, line 838 (last two sentences); mentioned in the "WCAG 2.2 AA" table row 1.4.1, line 414.

Text:

````text
Each mixin also stops the compile when `$menu-item-background-active`, the current link's fill, is below 3:1 against a background of its mode that is not `null`: `nfs-accordion-menu` against `$accordionmenu-item-background`, `nfs-drilldown` against `$drilldown-background` and `$drilldown-submenu-background`, `nfs-dropdown-menu` against `$dropdownmenu-submenu-background` and, where it is not `null`, `$dropdownmenu-background`, on which rule 14 keeps the fill (1.4.1; `nfs-menu` checks `$body-background`; added 2026-09-28 under the class rule, the top-level pair from the Dropdown Menu spec's D21). Ratios are computed with the exact WCAG relative-luminance formula by the library's exact-luminance helper and compared unrounded (building-blocks 1.10, as amended from the [Spec: Top Bar](../issues/86-spec-top-bar.md)), because Foundation's `color-luminance()` overstates some ratios and its `color-contrast()` rounds to one decimal and lets 2.95:1 pass a 3:1 threshold.
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet (line 613): "a `$drilldown-submenu-background`, a `$dropdownmenu-submenu-background`, or a set `$accordionmenu-item-background` of `$primary-color` (1:1 against Foundation's default `$menu-item-background-active`, which is `$primary-color`) stops its mixin naming the 1.4.1 check, and `null` backgrounds are skipped; each mixin runs its 1.4.1 check before its arrow checks".

Needs: `$menu-item-background-active`, `$accordionmenu-item-background`, `$drilldown-background`, `$drilldown-submenu-background`, `$dropdownmenu-background`, `$dropdownmenu-submenu-background`, `$body-background`; the library's exact-luminance helper.

Rule as documented usage: The current link's fill (`$menu-item-background-active`) must reach 3:1 against every non-`null` background of every mode the consumer includes.

Mentions: WCAG table row 1.4.1, line 414; D32, line 686.

### build-time: Arrow contrast (1.4.11)

Location: "Further Notes", "Sass" subsection, the "Checks (no CSS output)" paragraph, line 838 (first four sentences); WCAG table row 1.4.11, line 417.

Text:

````text
Checks (no CSS output): each mixin stops the compile with `@error` naming the setting when its arrow colour is below 3:1 against its backgrounds (1.4.11) or when `$accordionmenu-submenu-toggle-width` or `-height` is below 24 px (2.5.8). Every mixin that checks the toggle size also stops the compile when `$accordionmenu-submenu-toggle-background` is not `null` and the arrow colour is below 3:1 against it, whatever the mode's arrow boolean, because Foundation draws the Hybrid item's arrow unconditionally (amended 2026-09-26 from the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), decision 37). When `$accordionmenu-submenu-toggle-background` is `null`, the Hybrid item's arrow sits on the row's background, so `nfs-dropdown-menu` also stops the compile when `$accordionmenu-arrow-color` is below 3:1 against `$dropdownmenu-background` or else `$body-background`, and against `$dropdownmenu-submenu-background` (amended 2026-09-26 from the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), decision 25). `nfs-drilldown` likewise stops the compile, when `$accordionmenu-submenu-toggle-background` is `null`, if `$accordionmenu-arrow-color` is below 3:1 against `$body-background` and `$drilldown-submenu-background` (1.4.11)... `nfs-drilldown` also stops the compile when `$dropdownmenu-arrow-color`, which Foundation uses for the `.align-left`/`.align-right` twins, is below 3:1 against `$drilldown-background` or `$drilldown-submenu-background` while `$drilldown-arrows` is on (1.4.11).
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet (line 613): "a failing arrow colour, a 20 px toggle setting, and a mode's item padding of `0.2rem 1rem` (a 22.4 px row) each stop the compile with the named setting, in each of the three mixins; with `$accordionmenu-submenu-toggle-background: null`, an `$accordionmenu-arrow-color` below 3:1 against the dropdown backgrounds stops `nfs-dropdown-menu`".

Needs: `$accordionmenu-arrow-color`, `$dropdownmenu-arrow-color`, `$accordionmenu-submenu-toggle-background`, `$accordionmenu-item-background`, `$drilldown-background`, `$drilldown-submenu-background`, `$dropdownmenu-background`, `$dropdownmenu-submenu-background`, `$body-background`.

Rule as documented usage: Every mode's arrow colour (Foundation's own, and the Hybrid toggle's) must reach 3:1 against every background it can sit on in that mode.

Mentions: WCAG table row 1.4.11, line 417.

### build-time: Toggle size and row height (2.5.8)

Location: "Further Notes", "Sass" subsection, the "Checks (no CSS output)" paragraph, line 838 (middle sentences); WCAG table row 2.5.8, line 425.

Text:

````text
`nfs-accordion-menu` and `nfs-dropdown-menu` stop the compile on `nfs-drilldown`'s row condition, over `$accordionmenu-padding` or `$accordionmenu-submenu-padding` and over `$dropdownmenu-padding` or `$dropdownmenu-submenu-padding` (2.5.8; amended 2026-09-26, audit 0005 M1, recorded in the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md) and the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md)).
````

and, from WCAG row 2.5.8 (line 425):

````text
2.5.8 Target Size (Minimum) | Parent buttons and links fill their row (38 px high with `$menu-items-padding` defaults); the Hybrid item's toggle is `$accordionmenu-submenu-toggle-width` by `-height` (40 px), in every mode because the directive binds `.submenu-toggle`. The mixins fail the compile with `@error` when either toggle setting is below 24 px, and each also when a row of its mode (`1rem` plus twice the first value of the mode's item or submenu item padding, through `rem-calc()`) is below 24 px, because row height is a consumer setting the story gate never sees (Sass checks; amended 2026-09-26, audit 0005 M1) | Story axe gate (`target-size`, turned on by the `wcag22aa` tag); Sass compile test
````

Tests and stories: same Sass compile bullet as above (line 613): "a 20 px toggle setting, and a mode's item padding of `0.2rem 1rem` (a 22.4 px row) each stop the compile with the named setting, in each of the three mixins".

Needs: `$accordionmenu-submenu-toggle-width`, `$accordionmenu-submenu-toggle-height`, `$accordionmenu-padding`, `$accordionmenu-submenu-padding`, `$dropdownmenu-padding`, `$dropdownmenu-submenu-padding`, `$drilldown-padding`, `$drilldown-submenu-padding`.

Rule as documented usage: The Hybrid toggle must be at least 24 by 24 px, and every mode's row (item or submenu item, from its padding) must be at least 24 px tall.

Mentions: WCAG table row 2.5.8, line 425.

### build-time: Dropdown reflow at 320 px (1.4.10) [defined by the Dropdown Menu spec's mixin, referenced here]

Location: "WCAG 2.2 AA" table, row 1.4.10, line 416. (This check's mixin, `nfs-dropdown-menu`, belongs to the Dropdown Menu spec, not to this file; captured here because nested-menu.md states it in its own WCAG table.)

Text:

````text
1.4.10 Reflow | Dropdown mode: at 320 CSS px no submenu makes the page scroll sideways. Foundation's default `$dropdownmenu-min-width: 200px` fails, because a submenu from a narrow item between about 120 and 200 px from the left fits neither side and `opens-inner` keeps its left edge; the consumer must set `$dropdownmenu-min-width: min(200px, 45vw);`, and `nfs-dropdown-menu` warns at compile time when the setting is a fixed length over 160 px ([Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), decision 24) | e2e at 320 px (Dropdown Menu spec); Sass compile test
````

Tests and stories: as stated in the row, "e2e at 320 px (Dropdown Menu spec); Sass compile test" -- both owned by the Dropdown Menu spec, out of this file.

Needs: `$dropdownmenu-min-width`.

Rule as documented usage: A dropdown-mode menu must keep `$dropdownmenu-min-width` at or under `min(200px, 45vw)` (or otherwise no more than a 160 px fixed length).

Mentions: none further in this file.

### Kept (not a check)

- Required parent injections and Angular's NG0201 (`NfsSubmenu` and `NfsSubmenuToggle`'s required `inject(NfsMenuItem)`; `NfsMenuItem`'s required root lookup under `strictParents`) -- Angular's own compile/runtime error, not a library check.
- ARIA and focus behaviour: the whole "ARIA and keyboard" section, the key tables, the focus-loss guard, the Mode swap's focus rules.
- Typed inputs and their compile errors: `NfsMenuMode`, `NfsAccordionMenuBehaviour`, `NfsDrilldownBehaviour`, `NfsDropdownMenuBehaviour`, `hybrid`'s `booleanAttribute`.
- The Library mixins' CSS rules (Sass subsection, rules 1-14) and the Variant properties `nfs-breakpoint-properties` writes for the Menu's `orientation`/`expanded` (owned by the Menu spec, not this file).
- The library's own tests: every item under "Testing Decisions" (stories, browser-level tests, node-level tests, e2e) that is not itself asserting one of the checks above.

---

## specs/off-canvas.md

### forgotten-import: In-family checks (the off-canvas family)

Location: "Hierarchy and DI shape", the bullet list at lines 180-185.

Text:

````text
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsOffCanvas` calls `nfsDirectiveCheck('NfsOffCanvas')` under both selectors: no parent check, because its `nfsOffCanvasContentToken` injection stays optional with a supported `null`: a sibling panel binds `content` instead, and inputs are not set at construction, so it passes no parent. Development check 3 stays the report for a panel whose configuration needs a content and has none, the bare case the family rule's item 2 names. A panel inside an element that carries `nfsOffCanvasContent` without its directive has lost that content's import, which `strictDirectiveImports` reports with the import to add (M1), and a working wrapper's child probe (M2), so check 3 says nothing there (the shared spec's rule for a check that finds a peer by registration). No child probes: the close button, the Triggers, the title bar, and the menu inside the panel belong to other families, and an Openable probes no Trigger ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)). Peers: its `content`, by reference (`[content]="page"` with `#page="nfsOffCanvasContent"`), whose forgotten import fails to compile with NG8003, and its overlay, which reaches it by reference (below); `strictParents` changes nothing (the kept-optional list of the forgotten-import checks spec).
  - `NfsOffCanvasContent` calls `nfsDirectiveCheck('NfsOffCanvasContent', {children: ['NfsOffCanvas']})`: no parent check (it injects none); it probes the panels nested in it, which reach it through dependency injection and often through no reference, so a nested panel whose import was forgotten is reported (M2); no peers of its own (a sibling panel names it by reference); `strictParents` changes nothing.
  - `NfsOffCanvasOverlay` calls `nfsDirectiveCheck('NfsOffCanvasOverlay')`: no parent check (its panel is a required reference, not an injection); no child probes; peers: its panel, by reference (`[nfsOffCanvasOverlay]="nav"`), so a forgotten overlay import fails to compile with NG8002 and a forgotten panel import with NG8003 on `#nav="nfsOffCanvas"`; `strictParents` changes nothing.
  - `NfsOffCanvasWrapper` calls `nfsDirectiveCheck('NfsOffCanvasWrapper', {children: ['NfsOffCanvas', 'NfsOffCanvasContent']})`: no parent check (it injects none and provides nothing, D26); it probes the panels and contents inside it, so a forgotten panel or content import inside a working wrapper is reported (M2) even where no reference names the element; no peers; `strictParents` changes nothing. A wrapper written as `nfsOffCanvasWrapper` whose own import was forgotten is reported by `strictDirectiveImports` (M1) and the static check, and development check 3 leaves it to them.
  - No Off-canvas directive sits on `ng-template` or `ng-container`.
````

Also (token description, M7):

````text
`nfsOffCanvasContentToken = new InjectionToken<NfsOffCanvasContent>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsOffCanvasContentToken (provided by NfsOffCanvasContent from 'ngx-foundation-sites/off-canvas' on an ancestor element declared in the same template)" : '')`, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in a token file that imports only types (lightweight token).
````

Location of the token text: "Hierarchy and DI shape", line 175.

Tests and stories: "2. Browser-level test" layer, "Development checks" bullet (line 550): "check 3 stays silent for a push panel inside a `div nfsOffCanvasWrapper` whose `NfsOffCanvasWrapper` import is missing from the test host, where the `strictDirectiveImports` report on the wrapper is the one warning, and for a push panel nested inside a `div nfsOffCanvasContent` whose `NfsOffCanvasContent` import is missing, where the `strictDirectiveImports` report on that element is the one warning".

Needs: `nfsDirectiveCheck`; `nfsOffCanvasContentToken`'s development-only description string.

Rule as documented usage: A panel's linked content, its overlay, and any wrapper around it must be declared with their directives imported, in the same template as the panel (a sibling by reference, a wrapper or an enclosing content by dependency injection).

Mentions: Development check 3's text (line 293) points back at this check twice ("that content's `NfsOffCanvasContent` import was forgotten, which `strictDirectiveImports` reports on the content (M1)"; "An ancestor that carries the attribute without the class is a wrapper whose `NfsOffCanvasWrapper` import was forgotten: `strictDirectiveImports` reports it on the wrapper with the import and the component (M1...)").

### misuse: Copied Foundation classes (Development check 1)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 1, line 291.

Text:

````text
1. The host's static `class` holds a Foundation class the directive binds, read in a development-only field initialiser because a stripped class is gone from the element by the first render: a position class ("bind position="right""), `is-open` or `is-closed` ("bind [isOpen]"), `is-transition-*` ("bind transition"), `reveal-for-*` or `in-canvas-for-*` ("bind revealOn="large""), or the other Structural class (`off-canvas-absolute` on an `nfsOffCanvas` host: "write nfsOffCanvasAbsolute"; `off-canvas` on an `nfsOffCanvasAbsolute` host). A redundant `off-canvas` on an `nfsOffCanvas` host merges and is not reported.
````

Tests and stories: "2. Browser-level test", "Copied classes" bullet (line 538): "a host with `class="off-canvas position-right is-closed reveal-for-large is-transition-overlap site-nav"` and `position="left"` ends with `off-canvas position-left is-transition-push is-closed site-nav` and one warning per stripped or State class, naming its input; a redundant `off-canvas` is not reported; content State classes copied onto the content are stripped." Rendered HTML section, lines 472-479, gives the worked example.

Needs: `HostAttributeToken('class')` (development builds only).

Rule as documented usage: Do not copy `position-<side>`, `is-open`/`is-closed`, `is-transition-*`, `reveal-for-*`/`in-canvas-for-*`, or `off-canvas`/`off-canvas-absolute` from Foundation's docs; bind `position`, `[isOpen]`, `transition`, `revealOn`/`inCanvasOn`, or use `nfsOffCanvasAbsolute` instead.

Mentions: user story 47, line 76; D30, line 629.

### misuse: Both `nfsOffCanvas` and `nfsOffCanvasAbsolute` on one element (Development check 2)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 2, line 292.

Text:

````text
2. Both `nfsOffCanvas` and `nfsOffCanvasAbsolute` on one element (absolute is used).
````

Tests and stories: "2. Browser-level test", "Classes" bullet (line 536): "both attributes on one element bind `off-canvas-absolute` and warn once".

Needs: `HostAttributeToken('nfsOffCanvasAbsolute')` (which selector matched, read at construction).

Rule as documented usage: Do not write both `nfsOffCanvas` and `nfsOffCanvasAbsolute` on the same panel element; choose one.

Mentions: table row "selectors", line 233.

### misuse: No content linked when the configuration needs one (Development check 3, part a)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 3, line 293 (first sentence).

Text:

````text
3. No content linked when the configuration needs one (push, or `closeOnClick` without an overlay); a panel with an ancestor that carries `nfsOffCanvasContent` without its class is not reported here, because that content's `NfsOffCanvasContent` import was forgotten, which `strictDirectiveImports` reports on the content (M1), so check 3 never names the wrong fix.
````

Tests and stories: "2. Browser-level test", "Development checks" bullet (line 550): "a push panel with no content and no element carrying `nfsOffCanvasContent` around it warns".

Needs: the panel's own resolved `content` (its input, or the DI lookup result).

Rule as documented usage: Every panel whose configuration needs a content (a push panel, or `closeOnClick` with no overlay) must be linked to a content, either through `[content]` or by being nested inside one.

Mentions: user story 37, line 66.

### family: Push panel with no wrapper ancestor (Development check 3, part b)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 3, line 293 (second and third sentences).

Text:

````text
A push panel whose content has no ancestor in the DOM that carries `nfsOffCanvasWrapper` or `.off-canvas-wrapper` (1.4.10), naming `nfsOffCanvasWrapper`. An ancestor that carries the attribute without the class is a wrapper whose `NfsOffCanvasWrapper` import was forgotten: `strictDirectiveImports` reports it on the wrapper with the import and the component (M1 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), so check 3 does not report it again and never asks for an attribute the developer already wrote (2026-09-29).
````

Tests and stories: "2. Browser-level test", "Development checks" bullet (line 550): "check 3 stays silent for a push panel inside a `div nfsOffCanvasWrapper` whose `NfsOffCanvasWrapper` import is missing from the test host, where the `strictDirectiveImports` report on the wrapper is the one warning".

Needs: a DOM-ancestor read for `nfsOffCanvasWrapper` or `.off-canvas-wrapper` from the panel's linked content.

Rule as documented usage: A push panel's content must sit inside an element that carries `nfsOffCanvasWrapper` (1.4.10, Reflow).

Mentions: development check 3 (part a, above) shares its number; D26, line 625.

Boundary call: reads whether an ancestor element carries the wrapper directive -- a DOM-ancestor placement check, the `family` definition's own example ("DOM-only placement checks"). Filed under `family`, distinct from the same numbered check's other half, which is `misuse` (reads only the panel's own resolved `content`).

### misuse: Modal mode's name, close control, and `autoFocus` (Development check 4)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 4, line 294.

Text:

````text
4. Modal mode without `aria-label` or `aria-labelledby` on the panel; modal mode without a registered Trigger inside the panel (a close button, APG and 2.1.2); modal mode with `autoFocus: false`.
````

Tests and stories: "2. Browser-level test", "Development checks" bullet (line 550) covers the ten warnings as a set; ARIA and keyboard section (line 375) explains the case a `nfsToggle` inside its own modal panel is the exception ("the close control there is a bare `nfsClose` (development check 4)").

Needs: the panel's `registerTrigger` list (its own registered Triggers), `autoFocus()`, and its `aria-label`/`aria-labelledby`.

Rule as documented usage: A modal panel (`trapFocus` with an overlay) must carry `aria-label` or `aria-labelledby`, must contain at least one registered Trigger (typically a close button), and should not combine modal mode with `autoFocus: false`.

Mentions: none beyond the ARIA section's reference above.

### misuse: `trapFocus` without an overlay; `closeOnEsc` false on a non-modal panel (Development check 5)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 5, line 295.

Text:

````text
5. `trapFocus` without an overlay; `closeOnEsc: false` on a non-modal panel (2.4.11).
````

Tests and stories: table row `trapFocus`, line 244 ("Without one: a CDK `FocusTrap` wraps Tab inside the panel (Foundation's behaviour) but the panel stays a disclosure, and a development warning says it is not announced as modal"); table row `closeOnEsc`, line 238 ("both cases warn in development mode").

Needs: `trapFocus()`, `hasOverlay()` (`#overlay()`), `closeOnEsc()`, and the panel's own modal-mode computation.

Rule as documented usage: `trapFocus` without a registered overlay is a disclosure, not a dialog, and is reported; `closeOnEsc: false` on a non-modal panel removes its 2.4.11 escape route and is reported.

Mentions: user story 13, line 42.

### misuse: Registered Trigger rendered while revealed or in-canvas (Development check 6)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 6, line 296.

Text:

````text
6. A registered Trigger outside the panel that is rendered while the panel is revealed or in-canvas (it would do nothing: hide it at that breakpoint with `nfsVisibility` of the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)).
````

Tests and stories: WCAG table row 4.1.2, line 396: "a revealed panel exposes neither dialog semantics nor a working Trigger (development check 6 asks the developer to hide the Trigger)".

Needs: the panel's own `#revealed`/`#inCanvas` state and its `registerTrigger` list.

Rule as documented usage: Hide a panel's own Triggers at the breakpoints where the panel is revealed or in-canvas (for example with `nfsVisibility hideFor`), since they do nothing there.

Mentions: WCAG table row 4.1.2, line 396.

### misuse: `revealOn`/`inCanvasOn` naming the Zero breakpoint; `inCanvasOn` on an absolute panel (Development check 7)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 7, line 297.

Text:

````text
7. `revealOn` or `inCanvasOn` naming the Zero breakpoint ("Foundation generates no Zero-breakpoint reveal or in-canvas class; a panel shown at every width is not an off-canvas panel"); `inCanvasOn` on an `nfsOffCanvasAbsolute` panel ("Foundation's in-canvas rule selects .off-canvas; use nfsOffCanvas").
````

Tests and stories: "2. Browser-level test", "Breakpoint classes" bullet (line 537): "the Zero breakpoint sets no class, leaves `open()` working, and warns once (check 7); `inCanvasOn` on an absolute panel warns once."

Needs: `#zero` (the directive's own resolved Zero breakpoint), `absolute` (fixed at construction).

Rule as documented usage: Do not bind `revealOn` or `inCanvasOn` to the Zero breakpoint, and do not bind `inCanvasOn` on an `nfsOffCanvasAbsolute` panel.

Mentions: user stories 37 and 42, lines 66 and 75-76 (46 mentions the paired Runtime check, not this one); table rows `revealOn`/`inCanvasOn`, lines 241-242.

### family: Overlay placed inside an element the Modal inert set covers (Development check 9)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 9, line 299.

Text:

````text
9. An overlay placed inside an element the Modal inert set covers (the linked content, for example).
````

Tests and stories: no dedicated bullet found beyond the check's own line; the Modal inert set's exceptions ("Modal mode" paragraph, line 257) list the overlay as one of the elements spared from `inert`, which this check protects.

Needs: the panel's own Modal inert set membership test (whether the overlay's ancestor chain is inside a covered element).

Rule as documented usage: Do not place a panel's overlay element inside content the Modal inert set would otherwise cover (typically the linked content); write it as a sibling.

Mentions: "Modal mode" paragraph, line 257 (the overlay exception the Modal inert set carves out for every panel's own overlay class).

Boundary call: reads the DOM placement of one family member (the overlay, `NfsOffCanvasOverlay`) relative to another (the content the panel's Modal inert set covers) -- a DOM-only placement check within the same family, the `family` definition's own example.

### misuse: Copied `body.is-off-canvas-open` (Scroll lock check, Development check 10)

Location: "API: NfsOffCanvas", "Development-mode checks" list, item 10, line 300.

Text:

````text
10. (The Scroll lock, at the first panel's first render) a copied `is-off-canvas-open` on `body` while no locked panel is open, removed before the report.
````

Tests and stories: "2. Browser-level test", "Scroll lock and forceTo" bullet (line 546): "a `body` that carries `is-off-canvas-open` before any panel renders loses it at the first panel's first render and one warning fires".

Needs: `NfsOffCanvasScrollLock`'s own count (zero at the time of the read) and `body`'s class list.

Rule as documented usage: Do not ship `body.is-off-canvas-open` in the page shell; the library removes a stray copy when no locked panel is open, and reports it.

Mentions: user story 49, line 78; D31, line 630.

### runtime: Runtime check for `revealOn`/`inCanvasOn` (ADR 0040)

Location: "API: NfsOffCanvas", the paragraph after "Development-mode checks", line 304.

Text:

````text
A breakpoint that is a Class breakpoint in the Variant declaration file but has no classes in the compiled CSS is not a development check: the Runtime check reports it (below), in development by default and in production on opt-in.

Runtime checks (ADR 0040; the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md), Runtime checks): the panel calls `nfsVariantCheck` once at construction and, when the handle is not `null`, reports from its own `afterRenderEffect` read phase, which also holds the development checks and exists only when `ngDevMode` is on or the handle exists. While `revealOn` or `inCanvasOn` is bound it calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('revealOn', value, needs)` and `value('inCanvasOn', value, needs)` for each bound one, with `needs` `[{setting: 'breakpoint-classes', name: value}]` for a Class breakpoint above the Zero breakpoint and `[]` for the Zero breakpoint (check 7 reports that one, so one mistake makes one report). With neither bound the panel reads no Variant property and calls nothing, so an application without reveal or in-canvas panels needs no `nfs-breakpoint-properties` include for this entry point. `position` is a closed family that reads no property, and the overlay, content, and wrapper have no Variant input.
````

Tests and stories: "2. Browser-level test", "Runtime checks" bullet (line 547): "`revealOn="large"` against `--nfs-breakpoint-classes: small medium large` is silent; `revealOn` set by a cast to `xlarge` against the same property reports once under `strictVariantNames`, naming `nfsOffCanvas`, `revealOn`, `$breakpoint-classes`, and the listed names; with no property, `revealOn` bound makes one `strictVariantProperties` report naming `nfs-breakpoint-properties`, and a panel with neither Option bound makes none; `revealOn` naming the Zero breakpoint makes no Runtime check report."

Needs: `nfsVariantCheck('nfsOffCanvas')`/`nfsVariantCheck('nfsOffCanvasAbsolute')` (the panel's own handle, by selector); the compiled `--nfs-breakpoint-classes` custom property that `nfs-breakpoint-properties` writes.

Rule as documented usage: Only bind `revealOn`/`inCanvasOn` to a Class breakpoint that the consumer's compiled CSS actually generates (through `$breakpoint-classes`), and include `nfs-breakpoint-properties` when either is bound.

Mentions: user story 46, line 75; D28, line 627.

### build-time: Close button colours (1.4.11, 1.4.3)

Location: "Further Notes", "Sass" subsection, item 1(c), line 749 (first clause); WCAG table row 1.4.11, line 392.

Text:

````text
`@error` when the ratio of `$closebutton-color` or of `$closebutton-color-hover` against `$offcanvas-background` is under 3 (1.4.11 and large-text 1.4.3; Foundation's defaults give 2.77 at rest), naming the setting and `$offcanvas-background`
````

and, from the WCAG row:

````text
1.4.11 Non-text Contrast | The close button's glyph (a 32 px icon, also large text) reaches 3:1 against `$offcanvas-background` at rest (`$closebutton-color`) and on hover and focus (`$closebutton-color-hover`): with `$offcanvas-background: $white`, `#8a8a8a` reaches 3.42:1 and `#0a0a0a` 19.63:1. The page-background check of both colours is `nfs-close-button`'s; this panel paints its own background, so `nfs-off-canvas` checks the panel pair ([Spec: Close Button](../issues/83-spec-close-button.md), decision 9). ... | Fails: #8a8a8a on #e6e6e6 is 2.77:1 (the hover colour passes at 15.86:1) | The mixin stops the compile with `@error` naming the setting and `$offcanvas-background` when the exact ratio of `$closebutton-color` or of `$closebutton-color-hover` against `$offcanvas-background` is under 3 (axe has no 1.4.11 rule and marks the glyph incomplete); node-level Sass test
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet (line 556): "Foundation's default settings plus `@include nfs-off-canvas;` stop with the `@error` naming `$closebutton-color` and `$offcanvas-background` (2.77:1); ... on a dark panel ... `$closebutton-color-hover: $white` and `$closebutton-color: #116666` stops the compile (2.94:1 exact, 3.01:1 by Foundation's function), `$closebutton-color-hover` left at `$black` stops it (1:1)".

Needs: `$closebutton-color`, `$closebutton-color-hover`, `$offcanvas-background`; the library's internal exact-contrast helper.

Rule as documented usage: The close button's glyph colour, at rest and on hover/focus, must reach 3:1 against `$offcanvas-background`.

Mentions: WCAG table row 1.4.11, line 392; D21, line 620.

### build-time: Anchor colour against the panel background (1.4.3)

Location: "Further Notes", "Sass" subsection, item 1(c), line 749 (second clause); WCAG table row 1.4.3, line 391.

Text:

````text
`@warn` when the ratio of `$anchor-color` against `$offcanvas-background` is under 4.5 (1.4.3; defaults give 3.76), naming both
````

and, from the WCAG row:

````text
1.4.3 Contrast (Minimum) | Text in the panel reaches 4.5:1 against `$offcanvas-background`. ... | Fails: `$anchor-color` #1779ba on `$light-gray` #e6e6e6 is 3.76:1 (body text #0a0a0a passes at 15.86:1) | axe `color-contrast` in every story; the `nfs-off-canvas` mixin emits `@warn` when the exact ratio of `$anchor-color` against `$offcanvas-background` is under 4.5; node-level Sass test
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet (line 556): "`$anchor-color: #1177dd` there produces the `@warn` (4.44:1 exact, 4.51:1 by Foundation's function); `$anchor-color` under 4.5:1 against the background produces the `@warn`".

Needs: `$anchor-color`, `$offcanvas-background`.

Rule as documented usage: Links in the panel (`$anchor-color`) should reach 4.5:1 against `$offcanvas-background`.

Mentions: WCAG table row 1.4.3, line 391.

### build-time: Reflow, `$offcanvas-sizes` Zero-breakpoint entry (1.4.10)

Location: "Further Notes", "Sass" subsection, item 1(c), line 749 (third clause); WCAG table row 1.4.10, line 399.

Text:

````text
`@warn` when the Zero-breakpoint entry of `$offcanvas-sizes` exceeds 320 px (1.4.10)
````

and, from the WCAG row:

````text
1.4.10 Reflow | At 320 CSS px nothing scrolls horizontally: a push panel sits in an `nfsOffCanvasWrapper` (development check 3), whose clip hides the pushed content's overflow; a word wider than the viewport breaks inside the wrapper (rule (b)); the Zero-breakpoint entry of `$offcanvas-sizes` is at most 320 px (the mixin emits `@warn` otherwise; Foundation's is 250 px); menus in the panel stack (`nfsMenu orientation="vertical"`) | Passes with the wrapper | e2e at 320 by 640 px with a push panel open: `document.documentElement.scrollWidth <= 320`
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet (line 556): "a Zero-breakpoint `$offcanvas-sizes` entry over 320 px produces the reflow `@warn`".

Needs: `$offcanvas-sizes` (its Zero-breakpoint entry).

Rule as documented usage: Keep the Zero-breakpoint entry of `$offcanvas-sizes` at or under 320 px.

Mentions: WCAG table row 1.4.10, line 399.

### build-time: `$maincontent-class` rename (presence marker)

Location: "Further Notes", "Sass" subsection, item 1(c), line 749 (fourth clause); D29, line 628.

Text:

````text
`@error` when `$maincontent-class` is not `'off-canvas-content'`, naming the setting, because `nfsOffCanvasContent` binds Foundation's default class and a renamed one would leave the push, reveal, and nested rules without an element.
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet (line 556): "`$maincontent-class: 'page-content'` stops the compile naming the setting".

Needs: `$maincontent-class`.

Rule as documented usage: Do not rename `$maincontent-class`; `NfsOffCanvasContent` always binds Foundation's default `.off-canvas-content`.

Mentions: user story 48, line 77; D29, line 628.

### Kept (not a check)

- Required parent injections and NG0201 are not raised here: no Off-canvas directive has a required parent injection (`content` stays optional).
- ARIA and focus behaviour: modal-dialog semantics, the Modal inert set (its mechanics, not the placement check above), focus rules, Escape handling.
- Typed inputs and their compile errors: `NfsOffCanvasPosition` (required), `NfsOffCanvasTransition`, `NfsOffCanvasAutoFocus`, `NfsClassBreakpoint` for `revealOn`/`inCanvasOn`.
- The Library mixin's CSS rules (reduced-motion override, `overflow: clip`/`display: flow-root`) and its Variant properties (none: off-canvas has no Open Variant family).
- The library's own tests otherwise not asserting one of the checks above.

---

## specs/orbit.md

### forgotten-import: In-family checks (the Orbit family)

Location: "Hierarchy and DI shape", the bullet list at lines 178-182.

Text:

````text
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsOrbit` calls `nfsDirectiveCheck('NfsOrbit', {children: ['NfsOrbitRotation', 'NfsOrbitWrapper', 'NfsOrbitControls', 'NfsOrbitPrevious', 'NfsOrbitNext', 'NfsOrbitContainer', 'NfsOrbitSlide', 'NfsOrbitFigure', 'NfsOrbitImage', 'NfsOrbitCaption', 'NfsOrbitBullets', 'NfsOrbitBullet']})`: no parent check (it has no parent); it probes all twelve parts, because each depends on the root (the seven with behaviour inject its token, the five class-only ones look it up in development), a nested Orbit inside a slide keeping its own; no peers; `strictParents` changes nothing. Dev checks 1 and 3 (no rotation control, no bullets) stay the report for an Orbit that has no such element, and say nothing where the element they look for carries the part's attribute without its directive (a `button` carrying `nfsOrbitRotation`, an element carrying `nfsOrbitBullets`, or a bullet carrying `nfsOrbitBullet`): that is a forgotten import, which this probe reports once with the import to add (M2), so the defect is reported once and the Orbit's message never names the wrong fix (the shared spec's rule for a check that finds a peer by registration). The rotation control's `nfsButton` and the arrows' and bullets' `nfsShowForSr` belong to other families and are not probed.
  - `NfsOrbitRotation`, `NfsOrbitPrevious`, `NfsOrbitNext`, `NfsOrbitContainer`, `NfsOrbitSlide`, `NfsOrbitBullets`, and `NfsOrbitBullet` each call `nfsDirectiveCheck` with their class name (`nfsDirectiveCheck('NfsOrbitSlide')`): parent check none, because their `nfsOrbitToken` injection is required and NG0201 is the report, with the token's description; no child probes (the root probes every part); peers: each slide and the bullet of the same `value`, which no probe pairs (Aria reports a slide without a bullet and a bullet without a slide, and dev check 6 a repeated slide value); `strictParents` changes nothing. The slide, the bullets, and the bullet host Aria's `TabPanel`, `TabList`, and `Tab`, which inject Aria's `TABS` or `TAB_LIST` without `optional`, and Angular runs a host directive's constructor before its host's (the directive composition guide). With the root missing or its import forgotten, a part earlier in Foundation's markup order that hosts nothing (the rotation control, an arrow, or at the latest the container) throws first, with the description; a bullet inside an `nfsOrbitBullets` element whose import was forgotten throws Aria's NG0201 for `TAB_LIST`, which names no library directive, and the static check reports that import (NFS9001).
  - `NfsOrbitWrapper`, `NfsOrbitControls`, `NfsOrbitFigure`, `NfsOrbitImage`, and `NfsOrbitCaption` each call `nfsDirectiveCheck('<Class>', {parent: {directives: ['NfsOrbit'], found}})`, where `found` says whether their development-only `inject(nfsOrbitToken, {optional: true})` returned an Orbit, and the caption adds `alone`, "Outside an Orbit its caption band is positioned against whatever ancestor is positioned, so it can cover unrelated content.": the parent check replaces dev check 8, so a part outside any Orbit reports once (M5, with the caption's sentence), a part inside an Orbit element but declared in another template reports M4, and a part inside an `nfsOrbit` element whose `NfsOrbit` import was forgotten reports the root (M2); no child probes; no peers; under `strictParents` each throws M8 at construction when the lookup found no Orbit, in development builds only. M4 and the throw hold for a class-only part projected from another template although it needs nothing from the Orbit in production, as the shared spec's `strictParents` table says of class-only parts: every Orbit part with behaviour must be declared inside the `[nfsOrbit]` element in the same template (Rendering modes), so a projected Orbit already needs the template-outlet pattern, which gives the class-only parts the Orbit's injector too (the Slider fill's reasoning).
  - No Orbit directive sits on `ng-template` or `ng-container`.
````

Also (token description, M7):

````text
`nfsOrbitToken = new InjectionToken<NfsOrbit>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsOrbitToken (provided by NfsOrbit from 'ngx-foundation-sites/orbit' on an ancestor element declared in the same template)" : '')`, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in the plugin's token file with an `import type` of the class; `NfsOrbit` provides it with `useExisting`.
````

Location of the token text: "Hierarchy and DI shape", line 169.

Tests and stories: "2. Browser-level test", "Dev-mode checks" bullet, line 495: "checks 1 and 3 stay silent for an Orbit whose `button[nfsOrbitRotation]`, or whose `nav[nfsOrbitBullets]` and its bullets, have their directives left out of the test host's imports, where the root's probe report (M2) is the one warning for each element; the class-only directives' In-family parent check (check 8) reports `nfsOrbitCaption` on a `figcaption` outside any Orbit once, with the caption's sentence, and not one inside a nested Orbit's slide; with `provideNfsRuntimeChecks({strictParents: true})` that caption throws M8 at construction; and none of the five class-only directives injects `nfsOrbitToken` in a production build."

Needs: `nfsDirectiveCheck`; `nfsOrbitToken`'s development-only description string; `provideNfsRuntimeChecks({strictParents: true})` (the configuration call the browser-level test uses to turn on the throwing form).

Rule as documented usage: Every Orbit part (the rotation control, the wrapper, controls, arrows, container, each slide with its figure/image/caption, the bullets directive, and each bullet) must be declared inside the element that carries `nfsOrbit`, in the same template, with `ngx-foundation-sites/orbit` imported.

Mentions: D23, line 571 (the five class-only directives' In-family parent check, "through the five directives' In-family parent check, which throws under `strictParents`"); Development checks list, item 8's note (line 249, "since 2026-09-29 not a check of its own but the five directives' In-family parent check").

Boundary note: the browser-level test's `provideNfsRuntimeChecks({strictParents: true})` call configures the forgotten-import `strictParents` option, not an ADR 0040 Runtime check, even though the function name overlaps with the `runtime` kind's `provideNfsRuntimeChecks` term.

### misuse: `autoPlay` with no rotation control (Development check 1)

Location: "API", "Dev-mode checks" paragraph, line 249 (first clause).

Text:

````text
(1) `autoPlay` on and no rotation control (WCAG 2.2.2), not given when the root holds a `button` carrying `nfsOrbitRotation` that registered no control;
````

Tests and stories: WCAG table row 2.2.2, line 342: "Dev check 1; stories `orbit--autoplay`, e2e timing cases". User story 42, line 71.

Needs: the root's own registered rotation control (or absence of one) and its own `autoPlay()`.

Rule as documented usage: When `autoPlay` is on, the carousel must have a rotation control (`button[nfsOrbitRotation]`).

Mentions: WCAG table row 2.2.2, line 342.

### misuse: Rotation control after the container in DOM order (Development check 2)

Location: "API", "Dev-mode checks" paragraph, line 249 (second clause).

Text:

````text
(2) the rotation control after the container in DOM order (the APG requires it to precede the rotating content);
````

Tests and stories: no dedicated test bullet found beyond the check's own text; ARIA and keyboard table, "Rotation control" row (line 316): "first focusable element inside the root".

Needs: the root's own registered parts' DOM order (`compareDocumentPosition`).

Rule as documented usage: Place the rotation control before the slide container in the document.

Mentions: none beyond the ARIA table row above.

### misuse: No bullets (Development check 3)

Location: "API", "Dev-mode checks" paragraph, line 249 (third clause).

Text:

````text
(3) no `[nfsOrbitBullets]` or no bullets (the slides are tab panels that no tab controls, so Aria renders them without `aria-labelledby`, and the carousel is not the tabbed style this spec implements), not given when the root holds an element carrying `nfsOrbitBullets`, or a bullets element holds one carrying `nfsOrbitBullet`, that registered nothing. In both exceptions the element's import was forgotten, which the root's In-family probe reports once (M2; Hierarchy and DI shape), so checks 1 and 3 keep their messages for an Orbit that has no such element at all;
````

Tests and stories: "2. Browser-level test", "Dev-mode checks" bullet, line 495 (quoted above under the forgotten-import entry, for the exception case).

Needs: the root's own registered bullets directive and bullet list.

Rule as documented usage: Every Orbit must have a `[nfsOrbitBullets]` element holding at least one `button[nfsOrbitBullet]`.

Mentions: user story 42, line 71; Out of Scope, line 534 (the basic-carousel alternative this check assumes is not offered).

### misuse: No name or role description (Development check 4)

Location: "API", "Dev-mode checks" paragraph, line 249 (fourth clause).

Text:

````text
(4) the root has no `aria-label`/`aria-labelledby` or no `aria-roledescription`, or a slide has no `aria-roledescription`;
````

Tests and stories: WCAG table row 4.1.2, line 353: "axe in every story; dev checks 4 and 5". ARIA table, "Root .orbit" row, line 315: "dev check 4".

Needs: the root's own `aria-label`/`aria-labelledby`/`aria-roledescription`; each slide's own `aria-roledescription`.

Rule as documented usage: Name the carousel with `aria-label` or `aria-labelledby`, give the root `aria-roledescription="carousel"`, and give every slide `aria-roledescription="slide"`.

Mentions: WCAG table row 4.1.2, line 353; D22, line 570.

### misuse: Bullets directive has no accessible name (Development check 5)

Location: "API", "Dev-mode checks" paragraph, line 249 (fifth clause).

Text:

````text
(5) the bullets directive has no accessible name;
````

Tests and stories: WCAG table row 4.1.2, line 353 (shared with check 4); ARIA table, "Bullets" row, line 320: "label consumer markup".

Needs: the bullets element's own `aria-label`/`aria-labelledby`.

Rule as documented usage: Name the bullets list (`nfsOrbitBullets`), for example `aria-label="Choose slide to display"`.

Mentions: none beyond the ARIA table row above.

### family: Two slides with one `value` (Development check 6)

Location: "API", "Dev-mode checks" paragraph, line 249 (sixth clause).

Text:

````text
(6) two slides with one `value` (Aria's panel map keeps only the last; Aria itself reports a slide without a bullet, a bullet without a slide, and duplicate bullet values).
````

Tests and stories: no dedicated bullet found beyond the check's own text.

Needs: the root's own registered slide list, compared pairwise by `value`.

Rule as documented usage: Give every slide a unique `value` (paired against the bullet of the same `value`).

Mentions: In-family checks bullet, line 179 ("peers: each slide and the bullet of the same `value`, which no probe pairs ... and dev check 6 a repeated slide value").

Boundary call: reads across sibling slides (peers within the same family) to find a duplicate `value` -- the `family` definition's "a peer" case. Filed under `family` rather than `misuse`, since it reads more than the one slide's own content.

### misuse: Copied `is-active` on a slide or bullet (Development check 7)

Location: "API", "Dev-mode checks" paragraph, line 249 (seventh clause, after the semicolon that starts "Two more run...").

Text:

````text
Two more run in the directive's own field initialiser under `ngDevMode`, each warning once per element: (7) a slide or a bullet whose static `class` holds `is-active` (Foundation's docs mark the first slide and bullet with it), read through `HostAttributeToken('class')` as a whole token, because the binding strips it and it would otherwise change nothing silently; the message names `[selected]` on the Orbit. A redundant Structural class (`orbit-slide`) is not reported.
````

Tests and stories: "2. Browser-level test", "Initial state" bullet, line 494: "a copied `class="is-active"` on the second slide and on the second bullet is stripped on both (the elements carry `.is-active` only once selected) and warns once per element, naming `[selected]` (dev check 7)."

Needs: `HostAttributeToken('class')` (development builds only), read in each slide's and bullet's own field initialiser.

Rule as documented usage: Do not copy Foundation's `is-active` onto a slide or a bullet; bind `[selected]` on the Orbit instead.

Mentions: user story 46, line 75; D24, line 572; Rendered HTML section, line 428.

### build-time: Bullet and selected-bullet contrast (1.4.11, 1.4.1)

Location: "Sass" subsection, rule 0a, line 654; WCAG table rows 1.4.11 and "1.4.11 Non-text Contrast, forced colours", lines 348-349.

Text:

````text
| 0a | None (compile-time check) | `@error` naming the setting when the ratio of `$orbit-bullet-background` against `$body-background`, of `$orbit-bullet-background-active` against `$body-background`, or of `$orbit-bullet-background-active` against `$orbit-bullet-background` is below 3, each ratio computed with the exact WCAG relative-luminance formula by the library's internal contrast helper (`math.pow`) and compared unrounded (rule 0b's ratios likewise); Foundation's `color-luminance()`, whose approximate power passes pairs the exact formula fails, and its `color-contrast()`, which rounds to one decimal, are not used | WCAG 1.4.11 (and 1.4.1 for the selected state); Foundation's `$medium-gray` bullets reach 1.63:1 on `$white`; axe has no 1.4.11 rule |
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet, line 503: "compiling Foundation 6.9 plus the library with Foundation's default Orbit colours stops with the `@error` naming `$orbit-bullet-background`; ... Two cases pin the exact formula and the backdrop: `$body-background: #0a0a0a` with `$orbit-bullet-background: #116666` stops naming `$orbit-bullet-background` (2.94:1 by the exact formula, where Foundation's `color-luminance()` gives 3.01:1 ...)".

Needs: `$orbit-bullet-background`, `$orbit-bullet-background-active`, `$body-background`; the library's internal contrast helper.

Rule as documented usage: The bullets must reach 3:1 against the page, and the selected bullet must reach 3:1 against both the page and the unselected bullets.

Mentions: WCAG table rows 1.4.11 and its forced-colours row, lines 348-349; user story 32, line 61; D17, line 565.

### build-time: Caption text and arrow background contrast (1.4.3, 1.4.11)

Location: "Sass" subsection, rule 0b, line 655; WCAG table rows 1.4.3 and 1.4.11, lines 347-348.

Text:

````text
| 0b | None (compile-time check) | `@error` when the caption text colour (`color-pick-contrast($orbit-caption-background)`, the colour Foundation's `.orbit-caption` rule paints) is below 4.5:1 against `$orbit-caption-background` composited with Sass `mix()` over `#fff` and over `#000`, the lightest and darkest colours an image can hold, or `$white` is below 3:1 against `$orbit-control-background-hover` composited the same way, naming the setting; the composited colours are opaque, so the helper's own compositing over `$body-background` does not apply | WCAG 1.4.3 and 1.4.11 over arbitrary images; Foundation's `rgba($black, 0.5)` caption band gives 3.68:1; axe marks text over images incomplete |
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet, line 503: "with all fixed it emits the `nfs-orbit` rules ... ; with the stories' bullet settings, `$white: #f0f0f0` with `$orbit-caption-background: rgba($black, 0.58)` stops naming `$orbit-caption-background` (4.29:1 for the `$white` text composited over `#fff`, where compositing over `$white` would give 4.70:1)."

Needs: `$orbit-caption-background`, `$orbit-control-background-hover`, `$white`, `$black`; Foundation's `color-pick-contrast()`; the library's internal contrast helper.

Rule as documented usage: The caption's text colour must reach 4.5:1 against the caption band composited over both a white and a black image extreme, and the arrow's `$white` glyph must reach 3:1 against its hover background composited the same way.

Mentions: WCAG table rows 1.4.3 and 1.4.11, lines 347-348; D17, line 565.

### Kept (not a check)

- Required parent injections and NG0201: the seven behaviour parts' required `inject(nfsOrbitToken)`; Aria's own `TABS`/`TAB_LIST` required injections.
- ARIA and focus behaviour: the whole "ARIA and keyboard" section, the focus-handoff mechanics, the live-gate mechanics.
- Typed inputs and their compile errors: `NfsOrbitDefaults`, the Orbit has no Variant input at all (Foundation's Orbit has no Variant class).
- Aria's own development-mode logging ("`ngTabPanel must have an ngTabContent structural directive to render.`" twice per slide, line 172) -- accepted upstream behaviour, not a check this library defines.
- The Library mixin's CSS rules (rules 1-14 of the Sass subsection) and the statement that Orbit has no Variant property, so no Runtime check exists for it (line 681: "no Orbit directive calls `nfsVariantCheck`").
- The library's own tests otherwise not asserting one of the checks above.

---

## specs/pagination.md

### forgotten-import: In-family checks (the Pagination family)

Location: "Hierarchy and DI shape", the bullet list at lines 121-123.

Text:

````text
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsPagination`: `nfsDirectiveCheck('NfsPagination', {children: ['NfsPaginationPrevious', 'NfsPaginationNext', 'NfsPaginationEllipsis']})`; no parent check, because it injects none; it probes the three item directives; no peers; `strictParents` changes nothing. The Typography Helpers' `nfsTextAlign` written beside it belongs to another family and is not probed; the runtime and static checks decide it on its own.
  - `NfsPaginationPrevious`, `NfsPaginationNext`, `NfsPaginationEllipsis`: each calls `nfsDirectiveCheck` with its class name and a parent, its development-only `inject(NfsPagination, {optional: true})` giving `found`. Parent check over `NfsPagination`, with the `alone` sentence "Foundation lays out and draws pagination items only inside a pagination." (its item layout and `.ellipsis` glyph are scoped under `.pagination`), which replaces their outside-the-pagination warning, so an item outside a pagination is reported once. No child probes. No peers. `strictParents`: each throws at construction when no pagination is found.
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 327: "an item directive outside `nfsPagination` warns once".

Needs: `nfsDirectiveCheck`; the item directives' development-only `inject(NfsPagination, {optional: true})`.

Rule as documented usage: `nfsPaginationPrevious`, `nfsPaginationNext`, and `nfsPaginationEllipsis` must be declared inside a `ul[nfsPagination]` element in the same template.

Mentions: line 158 ("`NfsPaginationPrevious`, `NfsPaginationNext`, and `NfsPaginationEllipsis` with no `NfsPagination` above them in the injector tree are reported once, by their In-family parent check").

### misuse: Pagination not inside a named landmark (Development check 1)

Location: "Development checks" subsection, item 1, line 152.

Text:

````text
1. Landmark: the host has no `nav` or `[role=navigation]` ancestor, or that ancestor has neither `aria-label` nor `aria-labelledby`: "nfsPagination: wrap the pagination in a named navigation landmark, for example <nav aria-label="Pagination">".
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 327: "a pagination outside any `nav`, and inside an unnamed `nav`, warns once; inside `nav aria-label` and `nav aria-labelledby` it is silent".

Needs: a DOM-ancestor read for `nav`/`[role=navigation]` and its name, from `NfsPagination`'s own `afterEveryRender` check.

Rule as documented usage: Wrap a pagination in a named navigation landmark, for example `<nav aria-label="Pagination">`.

Mentions: user story 12, line 38; D13, line 387.

### misuse: Copied Foundation classes on the items (Development check 2)

Location: "Development checks" subsection, item 2, line 153.

Text:

````text
2. Copied Foundation classes on the items: `current` or `disabled` on any `li` (no directive binds them, so they still draw a look with no ARIA state behind it): "class="current" has no ARIA state: remove it and put aria-current="page" on the page's link"; "class="disabled" disables nothing: remove it and write the item as a placeholder link (no href, role="link", aria-disabled="true") or a disabled button". `ellipsis`, `pagination-previous`, or `pagination-next` on an `li` without the matching directive attribute: names the directive (an ellipsis copied without it is read aloud, because it lacks `aria-hidden`). Redundant classes on a directive's own host merge with its static class and are not reported.
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 327: "`li.current` and `li.disabled` warn naming `aria-current` and the placeholder link; `li.ellipsis` without the directive warns naming `nfsPaginationEllipsis`, and `li[nfsPaginationEllipsis] class="ellipsis"` does not warn".

Needs: the host's static `class`, read by `NfsPagination`'s own `afterEveryRender` check (line 101: "`.current` and `.disabled` are never bound, so a copied one is not stripped; it is reported in development builds").

Rule as documented usage: Do not write `current`, `disabled`, `ellipsis`, `pagination-previous`, or `pagination-next` on a pagination item; use `aria-current`, the placeholder-link/disabled-button pattern, or the matching item directive.

Mentions: line 101; user story 13, line 39; Rendered HTML section, lines 281-284; D13, line 387.

### misuse: `aria-current` not on a link or button (Development check 3)

Location: "Development checks" subsection, item 3, line 154.

Text:

````text
3. Current page placement: `aria-current`, present and neither `false` nor empty, on an element inside the host that is not an `a` or a `button`: "aria-current here gets no current-page look: put it on the page's link or button".
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 327: "`aria-current="page"` on an `li` or `span` warns and on an `a` or `button` does not, and `aria-current="false"` warns nowhere".

Needs: a DOM read of every element inside the pagination's host carrying `aria-current`.

Rule as documented usage: Put `aria-current` only on the page's link or button, never on the `li` or another wrapping element.

Mentions: user story 14, line 40.

### misuse: Disabled-link contract (Development check 4)

Location: "Development checks" subsection, item 4, line 155.

Text:

````text
4. Disabled contract (ADR 0011's placeholder link, the Button spec's checks for its own hosts): an `a` with `aria-disabled="true"` and an `href`: "a disabled link still navigates: bind its href or routerLink to null"; an `a` with `aria-disabled="true"` and no `role="link"`: "a placeholder link with aria-disabled needs role="link" to be announced as an unavailable link"; an `a` with neither `href` nor `aria-disabled="true"`: "a link without href is not focusable: add an href, or mark it disabled with role="link" and aria-disabled="true"".
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 327: "an `a` with `aria-disabled="true"` and `href` warns, one without `role="link"` warns, one with neither `href` nor `aria-disabled` warns, and a correct placeholder link does not".

Needs: a DOM read of every `a` inside the host for `href`, `role`, and `aria-disabled`.

Rule as documented usage: A disabled item's link must have no `href`, must carry `role="link"` with `aria-disabled="true"`, and must not have `href` without one of those states.

Mentions: user story 15, line 41; D5, line 379.

### misuse: Missing include, transparent current link (Development check 5)

Location: "Development checks" subsection, item 5, line 156.

Text:

````text
5. Missing include: the first link or button with `aria-current` has a fully transparent computed `background-color`: "the current page has no look: @include nfs-pagination; after foundation-pagination". Foundation's CSS gives a resting link no background, and `nfs-pagination` stops the compile for a current fill under 3:1 against the page, so a transparent one means the include (or Foundation's pagination CSS) is missing (measured: without the include the current link's background is `rgba(0, 0, 0, 0)` in three engines).
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 327: "a current link with a transparent background (no `nfs-pagination` in the test stylesheet) warns once naming the include, and with the include's rule in the test stylesheet does not".

Needs: `getComputedStyle` of the first `aria-current` link/button's `background-color`.

Rule as documented usage: Include `@include nfs-pagination;` after `foundation-pagination`, or the current page renders with no fill.

Mentions: user story 16, line 42; D13, line 387.

Note: the file explicitly states there is no Runtime check ("Runtime checks ([ADR 0040](../adr/0040-variant-input-types.md)): none. Pagination has no Variant input and its mixin writes no Variant property, so there is nothing for `strictVariantNames` or `strictVariantProperties` to read; check 5 covers the missing include instead.", line 160) -- recorded here because it explains why development check 5 exists in place of a Runtime check.

### build-time: Item, current, and ellipsis text contrast (1.4.3)

Location: "Sass" subsection, "Checks (no CSS output)" paragraph, line 516 (first clause); WCAG table row 1.4.3, line 212.

Text:

````text
Checks (no CSS output), one `@error` listing every failing pair with its setting, its criterion, and its exact unrounded ratio from the library's helper (a translucent colour composited over `$body-background` first): `$pagination-item-color` on `$body-background` and on `$pagination-item-background-hover`, `$pagination-item-color-current` on `$pagination-item-background-current`, and `$pagination-ellipsis-color` on `$body-background` under 4.5:1 (1.4.3); ...
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet, line 335: "`$pagination-item-color: #777777` (4.44:1 on the page, 3.588:1 on hover, and 2.732:1 from the disabled colour, all three in one message); `$pagination-item-background-hover: #767676` (4.358:1); ... `$pagination-ellipsis-color: #999999` (2.824:1)".

Needs: `$pagination-item-color`, `$pagination-item-background-hover`, `$pagination-item-color-current`, `$pagination-item-background-current`, `$pagination-ellipsis-color`, `$body-background`.

Rule as documented usage: Item text must reach 4.5:1 on the page and on the hover background, the current page's text 4.5:1 on its fill, and the ellipsis 4.5:1 on the page.

Mentions: WCAG table row 1.4.3, line 212; D8, line 382.

### build-time: Current fill and disabled-text contrast (1.4.1)

Location: "Sass" subsection, "Checks (no CSS output)" paragraph, line 516 (second clause); WCAG table row 1.4.1, line 211.

Text:

````text
`$pagination-item-background-current` against `$body-background`, and `$pagination-item-color-disabled` against `$pagination-item-color`, under 3:1 (1.4.1). Over Foundation 6.9.0's defaults: 19.6304, 15.8630, 4.6473, and 19.6304:1; 4.6473 and 12.0791:1. Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal.
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet, line 335: "`$pagination-item-background-current: #8a8a8a` (text 3.422:1); `$pagination-item-background-current: #f0f0f0; $pagination-item-color-current: $black` (fill 1.129:1)".

Needs: `$pagination-item-background-current`, `$body-background`, `$pagination-item-color-disabled`, `$pagination-item-color`.

Rule as documented usage: The current page's fill must reach 3:1 against the page, and the disabled item's text must differ from enabled text by at least 3:1.

Mentions: WCAG table row 1.4.1, line 211; D8, line 382.

### build-time: `$pagination-mobile-current-item` drift warning (D9)

Location: "Sass" subsection, "Checks (no CSS output)" paragraph, line 516 (last sentence); D9, line 383.

Text:

````text
One `@warn` when `$pagination-mobile-current-item` is `true` and `$pagination-mobile-items` is `false` (D9).
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet, line 337: "`$pagination-mobile-current-item: true` compiles with one `@warn` naming the setting; with `$pagination-mobile-items: true` as well there is no warning."

Needs: `$pagination-mobile-current-item`, `$pagination-mobile-items`.

Rule as documented usage: `$pagination-mobile-current-item: true` has no effect on the library's markup (the current page's item carries no class to select) unless `$pagination-mobile-items` is also `true`.

Mentions: user story 19, line 45; D9, line 383.

### Kept (not a check)

- No Runtime check exists for this file (explicitly stated, line 160); recorded above as context for development check 5, not as a runtime entry.
- Required parent injections and NG0201: none apply (Pagination's items have no directive at all, D3).
- ARIA and focus behaviour: the "ARIA and keyboard" section, the disabled-link semantics, focus after an in-place page change (D12).
- Typed inputs: not applicable (Pagination has no Variant class).
- The library's own tests otherwise not asserting one of the checks above.

---

## specs/progress-bar.md

### forgotten-import: In-family checks (the Progress Bar family)

Location: "Hierarchy and DI shape", the bullet list at lines 118-123.

Text:

````text
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsProgress` calls `nfsDirectiveCheck('NfsProgress', {children: ['NfsProgressMeter']})`: no parent check; it probes the meter; no peers; `strictParents` changes nothing.
  - `NfsProgressMeter` calls `nfsDirectiveCheck('NfsProgressMeter', {children: ['NfsProgressMeterText']})`: parent check none, because its `nfsProgressToken` injection is required and NG0201 is the report, with the token's description; it probes the meter text; no peers; `strictParents` changes nothing.
  - `NfsProgressMeterText` calls `nfsDirectiveCheck('NfsProgressMeterText')`: parent check none, because its injection of `NfsProgressMeter` is required; being by class, its NG0201 prints the class name (`_NfsProgressMeter` in a development build), the one form no token description reaches, which stays, because the name already says which directive to import and a token would add a public name for one message; no child probes; no peers; `strictParents` changes nothing.
  - `NfsProgressElement` calls `nfsDirectiveCheck('NfsProgressElement')`, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
  - `<meter>` has no directive, and no part sits on `ng-template` or `ng-container`. The development checks read their own host, and the meter text reads its meter's host through DI, so no check infers a part from its class, and a forgotten part changes none of their messages.
````

Also (token description, M7):

````text
`nfsProgressToken`, an `InjectionToken<NfsProgress>` in the entry point's tokens file with `import type`, provided by `NfsProgress` with `useExisting` and exported, so a consumer can provide an alternative (AGENTS.md). `NfsProgressMeter` injects it required, because a meter outside a progress bar has no value to show; outside one it fails with Angular's missing-provider error (NG0201), which prints the token's description, in development builds only "nfsProgressToken (provided by NfsProgress from 'ngx-foundation-sites/progress-bar' on an ancestor element declared in the same template)" (`typeof ngDevMode === 'undefined' || ngDevMode ? "..." : ''`, M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)).
````

Location of the token text: "Hierarchy and DI shape", line 112.

Tests and stories: "2. Browser-level test", "DI" bullet, line 359: "`nfsProgressMeter` outside a progress bar fails with the missing-provider error naming `nfsProgressToken`; `nfsProgressMeterText` outside a meter fails the same way".

Needs: `nfsDirectiveCheck`; `nfsProgressToken`'s development-only description string.

Rule as documented usage: `nfsProgressMeter` must sit inside a `[nfsProgress]` element, and `nfsProgressMeterText` inside a `[nfsProgressMeter]` element, both in the same template.

Mentions: none beyond the text above.

### misuse: No accessible name, `NfsProgress` (Development check 1)

Location: "API: NfsProgress", "Development-mode checks" list, item 1, line 169.

Text:

````text
1. No accessible name (D12). A `progressbar` takes its name from the author only (WAI-ARIA: "Name From: author"), so its content never names it. The name, in accessible-name order from the text of the elements `aria-labelledby` references, or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` in them (building-blocks 1.10, Names), then a non-blank `aria-label`, then a non-blank `title`, is empty: "nfsProgress: this progress bar has no accessible name; point aria-labelledby at its visible label or add aria-label (WCAG 1.1.1, 4.1.2). Its text content does not name it." The check runs at the first render, because the name must be in server HTML.
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 360: "each name source (`aria-labelledby` at text, `aria-label`, `title`) is silent, and so is `aria-labelledby` at an element that holds only an `img` with a non-blank `alt` ...; no name warns once, and so do `aria-label=""` and `aria-labelledby` at a missing id".

Needs: `ElementRef` (the host's own accessible-name sources).

Rule as documented usage: Name every progress bar with `aria-labelledby` pointing at its visible label, or with `aria-label`.

Mentions: WCAG table row 4.1.2/1.1.1, line 276; D12, line 422.

### misuse: Copied palette classes, `NfsProgress` (Development check 2)

Location: "API: NfsProgress", "Development-mode checks" list, item 2, line 170.

Text:

````text
2. Copied classes (D13): a static class list that holds Foundation's default palette names warns, naming each class with its input, for example "class="secondary" is set by nfsProgress: bind color="secondary" instead". A copied Variant class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `progress` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared names are left to the Variant check (the Button spec's D22 rule).
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 360: "`class="secondary progress"` warns once naming `color`, and a redundant `class="progress"` does not".

Needs: `HostAttributeToken('class')` (optional, development builds only).

Rule as documented usage: Do not copy Foundation's palette class names (`primary`, `secondary`, `success`, `warning`, `alert`) onto a progress bar; bind `color` instead.

Mentions: user story 20, line 51; D13, line 423.

### misuse: `max` not above `min` (Development check 3)

Location: "API: NfsProgress", "Development-mode checks" list, item 3, line 171.

Text:

````text
3. Range (D18): `max` not above `min` warns "nfsProgress: max (<max>) is not above min (<min>), so the bar shows no progress; set max above min".
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 360: "`max` equal to `min` warns once".

Needs: `min()`, `max()` (the directive's own inputs).

Rule as documented usage: `max` must be greater than `min`.

Mentions: D18, line 428.

### runtime: Runtime check, `NfsProgress`

Location: "API: NfsProgress", the paragraph after "Development-mode checks", line 172.

Text:

````text
Runtime check: in the same read phase, on every run, `NfsProgress` calls `include('nfs-progress-bar', ['foundation-palette'])` whether or not `color` is bound, then `value('color', color, needs)` with the need `{setting: 'foundation-palette', name: color}` for a one-token value and `null` otherwise (D14). `strictVariantNames` compares a bound `color` with `--nfs-foundation-palette`; `strictVariantProperties` reports a missing `@include nfs-progress-bar;` when that property reads empty. `nfs-callout` writes the same property, so in an application that includes `nfs-callout`, a missing `nfs-progress-bar` is not reported (D14). The report shape, the per-realm read, and the configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).
````

Tests and stories: "2. Browser-level test", "Runtime check" bullet, line 362: "with `--nfs-foundation-palette: primary secondary success warning alert` on the test document, a listed `color` is silent and an unlisted one bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$foundation-palette`; ... with the property absent, a bar with no `color` reports `strictVariantProperties` once, naming `@include nfs-progress-bar;`."

Needs: `nfsVariantCheck('nfsProgress')`; the compiled `--nfs-foundation-palette` custom property, which both `nfs-progress-bar` and `nfs-callout` write.

Rule as documented usage: Only bind `color` to a name the consumer's compiled `$foundation-palette` actually lists, and include `@include nfs-progress-bar;` (or `nfs-callout`, which writes the same property).

Mentions: user story 21, line 52; D14, line 424.

### misuse: Meter text wider than its meter (D6)

Location: "API: NfsProgressMeterText", the "Development-mode check (D6)" paragraph, line 190.

Text:

````text
Development-mode check (D6), in one `afterRenderEffect` read phase that exists only when `ngDevMode` is on (never on the server, never in production): at the first render and after each render in which its progress bar's `percentage()` changed, it compares its host's horizontal extent with its meter's, and warns once, then stops checking: "nfsProgressMeterText: the meter text "<text>" is wider than its meter at <percentage> percent, so part of it sits on the track or the page, where it can fall under 4.5:1 (WCAG 1.4.3); show the value beside the bar while the meter can be narrower than its text". Only the horizontal extent counts: the text's line box is 18 px against Foundation's 16 px bar at the default size, and its glyphs fit.
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 360: "a meter text wider than its meter (at 0) warns once and never again, and one inside its meter (at 50) is silent".

Needs: `getComputedStyle`/geometry of the meter text's host and its meter's host; the meter's `percentage()` (to know when to re-check).

Rule as documented usage: Use a meter text (`nfsProgressMeterText`) only where the meter is always wider than its text; otherwise show the value beside the bar.

Mentions: user story 14, line 45; WCAG table row 1.4.3, line 272; D6, line 416.

### misuse: No accessible name, `NfsProgressElement`

Location: "API: NfsProgressElement", "Development-mode checks" paragraph, line 209 (first clause).

Text:

````text
Development-mode checks, in the same kind of read phase as `NfsProgress`, warning once per instance: no accessible name, from `aria-labelledby` text, a non-blank `aria-label`, the text of the element's `labels` (a `<label for>` or a wrapping label), or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` in the referenced elements or the labels, or a non-blank `title`: "nfsProgressElement: this progress element has no accessible name; give it a <label for>, aria-labelledby, or aria-label (WCAG 1.1.1, 4.1.2)". axe has no rule for this: its `aria-progressbar-name` selects only an explicit `role="progressbar"`.
````

Tests and stories: no dedicated bullet found beyond the story `progress-bar--native-progress`'s naming assertion (line 350: "Each is found by `getByRole('progressbar', {name})` through its `<label for>`").

Needs: `ElementRef`'s own accessible-name sources, including the native `.labels` property.

Rule as documented usage: Name every native `progress[nfsProgressElement]` with a `<label for>`, `aria-labelledby`, or `aria-label`.

Mentions: user story 16, line 47; WCAG table row 4.1.2/1.1.1, line 276; D12, line 422.

### misuse: Copied palette classes, `NfsProgressElement`

Location: "API: NfsProgressElement", "Development-mode checks" paragraph, line 209 (last sentence).

Text:

````text
Copied palette classes warn as on `NfsProgress`.
````

Tests and stories: same as `NfsProgress`'s copied-class check (line 360, applied to the native element by the shared mechanism).

Needs: `HostAttributeToken('class')` (optional, development builds only).

Rule as documented usage: Do not copy Foundation's palette class names onto a native `progress[nfsProgressElement]`; bind `color` instead.

Mentions: none beyond the text above.

### runtime: Runtime check, `NfsProgressElement`

Location: "API: NfsProgressElement", the "Runtime check" sentence, line 210.

Text:

````text
Runtime check: `include('nfs-progress-bar', ['foundation-palette'])` and `value('color', ...)`, as `NfsProgress` does.
````

Tests and stories: shared with `NfsProgress`'s Runtime check test bullet, line 362.

Needs: `nfsVariantCheck('nfsProgressElement')`; the compiled `--nfs-foundation-palette` custom property.

Rule as documented usage: Only bind `color` to a name the consumer's compiled `$foundation-palette` lists, and include `@include nfs-progress-bar;`.

Mentions: none beyond the text above.

### build-time: Meter text contrast (1.4.3, D9)

Location: "Sass" subsection, item 1(c), line 516; WCAG table row 1.4.3, line 272.

Text:

````text
(c) Compile-time checks that emit no CSS, D9: one `@error` listing every fill (`$progress-meter-background` and each palette colour) whose picked meter text is under 4.5:1, each with the setting, the name, the colour, and the ratio. Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal.
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet, line 369: "Foundation's defaults plus `@include nfs-progress-bar;` stop with one `@error` naming `$foundation-palette` alert `#cc4b37` with its meter text at 4.498:1."; "A palette colour that leaves the text under 4.5:1 with both candidates stops the compile: `#777777` (4.44:1 with `$white`), and `#1177dd` (4.437:1 with `$black` by the exact formula, ...)".

Needs: `$progress-meter-background`, `$foundation-palette`, `$white`, `$black`; the library's internal contrast helper; the picked text colour from rule (b) (D8's `$black`-or-`$white` choice).

Rule as documented usage: Every fill (the default and every palette colour) must give its meter text at least 4.5:1, whichever of `$white`/`$black` the mixin picks.

Mentions: WCAG table row 1.4.3, line 272; D9, line 419.

### Kept (not a check)

- Required parent injections and NG0201: `NfsProgressMeter`'s and `NfsProgressMeterText`'s required parent injections.
- ARIA and focus behaviour: the "ARIA and keyboard" section (the `progressbar`'s presentational children, the `status`/`alert` region guidance).
- Typed inputs and their compile errors: `NfsProgressColor` (declared with explicit type arguments).
- The Library mixin's CSS rules (rule (b), the `$black`/`$white` pick) and its Variant property (`--nfs-foundation-palette`, shared with `nfs-callout`).
- The library's own tests otherwise not asserting one of the checks above.

---

## specs/prototyping-utilities.md

### forgotten-import: In-family checks (the eighteen Prototyping Utility directives)

Location: "Hierarchy and DI shape", line 193.

Text:

````text
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): each of the eighteen directives calls `nfsDirectiveCheck` with its class name (`nfsDirectiveCheck('NfsPrototypeSpacing')`), with no parent check, no child probes, and no peers, because no directive of the family needs another on any element, and `strictParents` changes nothing.
````

Tests and stories: none dedicated beyond the general Runtime-check test bullet (line 436); no forgotten-import case is called out in the test layers because there is no parent/child relationship to probe.

Needs: `nfsDirectiveCheck`.

Rule as documented usage: none -- each of the eighteen directives is fully self-contained; the check has no consumer-facing rule to state (it only guards against the directive class itself not being imported, which a template compile error already catches for an attribute selector reachable no other way, per D2's "no import array" reasoning).

Mentions: D2, line 483 ("no import array ([ADR 0046]...): a component lists the directive of each family it uses, and the forgotten-import checks name the directive of an attribute written without its import").

### misuse: Copied classes (Development check 1, all eighteen directives)

Location: "API", "Development-mode checks" list, item 1, line 262.

Text:

````text
1. Copied classes, every directive (D11): a static class list that holds a class of the directive's own family with Foundation's default names warns, naming the attribute to write ("class="margin-top-1" is set by nfsMarginTop: write nfsMarginTop="1" instead"). A copied class is not stripped, because the `[class]` list binds only the classes it sets, so it keeps styling until removed. The consumer's own classes and consumer-declared names are not reported (the Button spec's D22 rule).
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 435: "the copied-class check for one class of each family (warns once, naming the attribute) and silence for a consumer class".

Needs: `HostAttributeToken('class')` (optional, development builds only), per directive.

Rule as documented usage: Do not copy any Prototyping Utility class from Foundation's docs; use the matching attribute (for example `nfsMarginTop="1"` instead of `class="margin-top-1"`).

Mentions: user story 24, line 53; D11, line 492.

### misuse: Unreachable scroll region (Development check 2, `NfsPrototypeOverflow`)

Location: "API", "Development-mode checks" list, item 2, line 263.

Text:

````text
2. Unreachable scroll region, `NfsPrototypeOverflow` (D13): for each axis whose computed `overflow-x` or `overflow-y` is `scroll` or `auto` and whose scroll size exceeds its client size, when the host has no `tabindex` attribute and no focusable descendant (`a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` other than `-1`, `[contenteditable]`, none disabled): "nfsOverflowY: this region scrolls but a keyboard cannot reach it; add tabindex="0", role="region", and aria-label or aria-labelledby, or put focusable content in it (WCAG 2.1.1; axe scrollable-region-focusable)". When the host has `tabindex` of 0 or more and no non-blank `aria-label` or `aria-labelledby`: "... a focusable region needs a name (WCAG 4.1.2)".
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 435: "the overflow check for an overflowing region without `tabindex` and without focusable content (warns), with a link inside (silent), with `tabindex="0"` and no name (warns about the name), with `tabindex="0"`, `role="region"`, and `aria-labelledby` (silent), and for content that fits (silent)".

Needs: `getComputedStyle` (`overflow-x`/`overflow-y`, scroll size vs. client size) and a DOM read of the host and its descendants, from `NfsPrototypeOverflow`'s own `afterRenderEffect`.

Rule as documented usage: A scroll region created with `nfsOverflow`/`nfsOverflowX`/`nfsOverflowY` must be keyboard-reachable: give it `tabindex="0"`, `role="region"`, and a name (`aria-label`/`aria-labelledby`), or put focusable content inside it.

Mentions: user stories 26 and 27, lines 55-56; WCAG table rows 2.1.1 and 4.1.2, lines 317-318; D13, line 494.

### misuse: Fixed bar with no reserved `scroll-padding` (Development check 3, `NfsPrototypePosition`)

Location: "API", "Development-mode checks" list, item 3, line 264.

Text:

````text
3. Fixed bar, `NfsPrototypePosition` (D14): when the host's computed position is `fixed` with `top` (or `bottom`) at `0px` and `left` and `right` at `0px`, and the document element's computed `scroll-padding-top` (or `-bottom`) is smaller than the host's height: "nfsPosition="fixed-top": this bar is <h> px tall and covers focused content; set scroll-padding-top: <h>px or more on the scrolling element (WCAG 2.4.11)". The check reads the document scroller only.
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 435: "the fixed bar check with no `scroll-padding` (warns, naming the height) and with enough (silent)".

Needs: `getComputedStyle` of the host (position, `top`/`bottom`, `left`/`right`, height) and of the document element (`scroll-padding-top`/`-bottom`).

Rule as documented usage: When using `nfsPosition="fixed-top"` or `"fixed-bottom"`, set `scroll-padding-top`/`-bottom` on the document's scrolling element to at least the bar's height.

Mentions: user story 28, line 57; WCAG table row 2.4.11, line 319; D14, line 495.

### misuse: Hidden text with nothing visible in its place (Development check 4, `NfsPrototypeTextUtilities`)

Location: "API", "Development-mode checks" list, item 4, line 265.

Text:

````text
4. Nothing replaces hidden text, `NfsPrototypeTextUtilities` (D15): when the host's computed `font-size` is `0px` because of `nfsTextHide`, it has no `img`, `svg`, `picture`, `canvas`, or `video` descendant, and its computed `background-image` is `none`: "nfsTextHide: nothing visible takes the place of this element's hidden text; add the image it replaces, or use nfsShowForSr for text that should only be read (WCAG 2.4.7, 2.5.8)". `nfsShowForSr` is the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive.
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 435: "the text-hide check with only text (warns), with an `img` (silent), and with a background image (silent)".

Needs: `getComputedStyle` (`font-size`, `background-image`) and a DOM read of the host's media descendants.

Rule as documented usage: When using `nfsTextHide`, the element must hold a visible replacement (an image, or a `background-image`); otherwise use `nfsShowForSr` for text that should only be read.

Mentions: user story 29, line 58; WCAG table row 2.4.7/2.5.8, line 320; D15, line 496.

### misuse: Border utility on a form field (Development check 5, `NfsPrototypeBordered`/`NfsPrototypeBorderNone`)

Location: "API", "Development-mode checks" list, item 5, line 266.

Text:

````text
5. Border utility on a form field, `NfsPrototypeBordered` and `NfsPrototypeBorderNone` (D16): the host is an `input`, `select`, or `textarea`: "nfsBordered on a form field replaces its $input-border with $prototype-border-color, about 1.6:1 on Foundation's defaults, and nfsBorderNone removes it; a field boundary needs 3:1 (WCAG 1.4.11). Style the field through the Forms settings instead."
````

Tests and stories: "2. Browser-level test", "Development checks" bullet, line 435: "the field check for `nfsBordered` and `nfsBorderNone` on `input`, `select`, and `textarea` (warns) and on a `div` (silent)".

Needs: the host's own tag name, read by `NfsPrototypeBordered`/`NfsPrototypeBorderNone`.

Rule as documented usage: Do not write `nfsBordered` or `nfsBorderNone` on an `input`, `select`, or `textarea`; style the field's boundary through the Forms spec's settings.

Mentions: user story 30, line 59; WCAG table row 1.4.11, line 322; D16, line 497.

### runtime: Runtime check (D19, every directive)

Location: "API", the paragraph after "Development-mode checks", line 267.

Text:

````text
Runtime check (D19): in the same read phase, on every run, each directive calls `include('nfs-prototyping-utilities', ['prototype-spacers-count', <its own registry settings>])`, never a `prototype-<flag>-breakpoints` flag property, which is empty while its flag is off, whether or not an attribute is bound, then `value(<attribute>, value, needs)` for each bound attribute, with `needs` from the same mapping that sets its classes: `{setting: 'prototype-spacers-count', name: n}` for each spacing class, the registry setting and name for each named class (none for the closed separator and the fixed position forms), and `{setting: 'prototype-<flag>-breakpoints', name: bp}` for each class above the Zero breakpoint. `strictVariantNames` reports a name or count its property lacks, and a responsive class while its flag's property is empty, naming the flag (`$prototype-spacing-breakpoints`); `strictVariantProperties` reports a missing `@include nfs-prototyping-utilities;`. The handle is created as `nfsVariantCheck('nfsPrototypeSpacing')`, the camelCase of the directive's class, because several attributes create one instance; each report names the attribute as its input.
````

Also referenced at line 164 (Overlap resolution): "A key the token's map lacks sorts after the map's breakpoints; the `strictBreakpointSync` Runtime check already reports that drift." -- note: `strictBreakpointSync` names Breakpoint drift (ADR 0040's third Runtime-check case), distinct from the `strictVariantNames`/`strictVariantProperties` pair the main paragraph names; both are the same `runtime` kind.

Tests and stories: "2. Browser-level test", "Runtime check" bullet, line 436: "with a style block standing in for the `nfs-prototyping-utilities` Variant properties on Foundation's defaults with every flag on, every default value is silent; a count above `--nfs-prototype-spacers-count` bound through a cast reports `strictVariantNames` once, naming `nfsPrototypeSpacing`, the attribute, the value, and `$prototype-spacers-count`; with `--nfs-prototype-spacing-breakpoints` empty, `[nfsMargin]="{medium: 1}"` reports once, naming `$prototype-spacing-breakpoints`; ... one `strictVariantProperties` report names `@include nfs-prototyping-utilities;` however many directives render." "3. Node-level Vitest", Sass compile bullets, line 444-449, give the compiled property shapes these checks read.

Needs: `nfsVariantCheck('<directive>')` (per directive, camelCase of the class); the ten registry properties and sixteen flag properties `nfs-prototyping-utilities` writes (Sass subsection, item 6, line 592).

Rule as documented usage: Only bind a Prototyping Utility attribute to a name, count, or breakpoint that the consumer's compiled CSS and Variant declaration file actually generate, and include `@include nfs-prototyping-utilities;` (plus the matching flag settings for any responsive form used).

Mentions: user stories 20 and 25, lines 49 and 54; D19, line 500; Overlap resolution paragraph, line 164 (`strictBreakpointSync`).

### build-time: Arrow colour contrast (D17)

Location: "Sass" subsection, item 1(c), line 587; WCAG table row 1.4.11, line 322.

Text:

````text
(c) A compile-time check that emits no CSS: `@warn` when `$prototype-arrow-color` is under 3:1 against `$body-background`, naming both colours and the ratio (D17). Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal.
````

Tests and stories: "3. Node-level Vitest", Sass compile bullet, line 448: "`$prototype-arrow-color: #bbbbbb` set after `@import 'foundation'` warns once, naming the setting, the colour, `$body-background`, and the ratio (1.90:1); the default compiles silently."; `prototyping-utilities--arrows-and-separators`'s story assertion, line 422 ("computed width 0 and the arrow colour on the pointing border").

Needs: `$prototype-arrow-color`, `$body-background`; the library's internal contrast helper.

Rule as documented usage: `$prototype-arrow-color` should reach 3:1 against `$body-background` (a decorative arrow may fall below it deliberately, hence `@warn` rather than `@error`).

Mentions: WCAG table row 1.4.11, line 322; D17, line 498.

### Kept (not a check)

- Required parent injections and NG0201: none (all eighteen directives are standalone, no parent, no children).
- ARIA and focus behaviour: the "ARIA and keyboard" section (scroll-region semantics beyond the check above, key handling of native scrolling).
- Typed inputs and their compile errors: every Utility attribute's typed value (D5).
- The Library mixin's CSS rules (rule (a), the responsive-spacing reprint) and its Variant properties (item 6 of the Sass subsection).
- The Variant declaration tooling's generate mode (out of scope, line 473).
- The library's own tests otherwise not asserting one of the checks above.

---

## specs/responsive-accordion-tabs.md

This spec's own entry point declares no forgotten-import checks of its own (stated explicitly, "Hierarchy and DI shape", line 186: "In-family checks ... none of the entry point's own. `NfsResponsiveAccordionTabs` has an element selector, so a forgotten import fails to compile (NG8001), and `NfsResponsiveAccordionTabsPanel` sits on `ng-template` and calls nothing, so only the static check sees a forgotten panel import (the component then renders no section and dev check 3 warns). The Accordion and Tabs directives the component's own template renders make their calls and probes by their specs' In-family lines, and the component imports every one of them."). No entry is filed for this file under `forgotten-import`; the composed Accordion and Tabs directives' own In-family checks belong to their own specs, out of this group.

This spec also has no Runtime check and no build-time check of its own: "The component has no Open Variant family of its own, so it has no runtime-check case." (Testing Decisions intro) and "No library CSS: there is no `nfs-responsive-accordion-tabs` mixin and the component declares no `styles`." (Sass subsection, line 520).

### misuse: No `label` or `labelledBy` (Development check 1)

Location: "API", "Behaviour rules", "Dev-mode checks" list, item 1, line 284.

Text:

````text
Dev-mode checks (one `afterNextRender`, `ngDevMode` only, each once per instance): (1) neither `label` nor `labelledBy` set; ...
````

Tests and stories: "2. Browser-level test", "Dev-mode warnings" bullet, line 559: "each fires once for its case (no name, duplicate values, no sections, heading level out of range, deep link without ids, no Zero-breakpoint rule, and a host that copies `class="tabs simple"` or `class="accordion"`, naming the fix) and not for correct markup."

Needs: `label()`, `labelledBy()` (the component's own inputs).

Rule as documented usage: Set `label` or `labelledBy` on `nfs-responsive-accordion-tabs`.

Mentions: user story 16, line 49.

### misuse: Duplicate section values (Development check 2)

Location: "API", "Behaviour rules", "Dev-mode checks" list, item 2, line 284.

Text:

````text
(2) two sections with the same `value`;
````

Tests and stories: same test bullet as check 1 (line 559).

Needs: `contentChildren(NfsResponsiveAccordionTabsPanel)`'s own list, compared pairwise by `value`.

Rule as documented usage: Give every `ng-template[nfsResponsiveAccordionTabsPanel]` section a unique `value`.

Mentions: table row "Panel `value`", line 260 ("duplicate values warn in dev mode").

### misuse: No section (Development check 3)

Location: "API", "Behaviour rules", "Dev-mode checks" list, item 3, line 284.

Text:

````text
(3) no section;
````

Tests and stories: same test bullet as check 1 (line 559).

Needs: `contentChildren(NfsResponsiveAccordionTabsPanel)`'s own list (empty case).

Rule as documented usage: A `nfs-responsive-accordion-tabs` element must contain at least one `ng-template[nfsResponsiveAccordionTabsPanel]` section.

Mentions: none beyond the check text and its forgotten-import cross-reference above (a missing panel import also reaches this check, per line 186).

### misuse: `headingLevel` outside 1 to 6 (Development check 4)

Location: "API", "Behaviour rules", "Dev-mode checks" list, item 4, line 284.

Text:

````text
(4) `headingLevel` outside 1 to 6;
````

Tests and stories: "2. Browser-level test", "Pass-through" bullet, line 554: "`headingLevel` (1, 6, 0 and 7 clamped with warnings)".

Needs: `headingLevel()` (the component's own input).

Rule as documented usage: Bind `headingLevel` to a value between 1 and 6; out-of-range values clamp to the nearest and are reported.

Mentions: table row `headingLevel`, line 246 ("other values clamp to the nearest and warn in dev mode").

### misuse: `deepLink` on a section without an `id` (Development check 5)

Location: "API", "Behaviour rules", "Dev-mode checks" list, item 5, line 284.

Text:

````text
(5) `deepLink` with a section without `id`;
````

Tests and stories: same test bullet as check 1 (line 559).

Needs: `deepLink()` and each section's own `id()`.

Rule as documented usage: When `deepLink` is set, give every section an `id`.

Mentions: table row Panel `id`, line 261 ("Required for `deepLink` (dev warning otherwise)").

### misuse: Rules with no mode at the Zero breakpoint (Development check 6)

Location: "API", "Behaviour rules", "Dev-mode checks" list, item 6, line 284.

Text:

````text
(6) at parse time, rules with no mode at the Zero breakpoint ("accordion is rendered below `<first rule breakpoint>`") next to the shared parser's own warnings;
````

Tests and stories: same test bullet as check 1 (line 559).

Needs: `rules()` (the component's own input), parsed through `parseNfsBreakpointRules`.

Rule as documented usage: A `rules` value that names no mode at the Zero breakpoint renders `accordion` below the first named breakpoint; a bare mode at the Zero breakpoint avoids the warning.

Mentions: D15, line 626.

### misuse: Foundation class copied onto the host (Development check 7)

Location: "API", "Behaviour rules", "Dev-mode checks" list, item 7, line 284.

Text:

````text
(7) a Foundation class copied onto the host: the host's static `class` list holds `accordion`, `tabs`, `vertical`, `simple`, or `primary` as a whole token (the classes Foundation's markup puts on the plugin's element). The host binds no class, so, unlike a directive's copied class, such a class is not stripped: it styles the host itself, and a copied `tabs` draws a second border and background around the whole widget (measured in Chromium, Firefox, and WebKit against Foundation 6.9's CSS). The message names the fix: `accordion` or `tabs`, "the component renders the accordion and the tab list itself; remove the class"; `simple` or `primary`, "bind `simple` or `primary` on the component"; `vertical`, "vertical tabs are not supported; remove the class". The list is read with `inject(new HostAttributeToken('class'), {optional: true})` in a field initialiser that runs only when `ngDevMode` is on, the Accordion spec's dev check 7 mechanism; the consumer's own classes are never reported.
````

Tests and stories: same test bullet as check 1 (line 559); "2. Browser-level test", "Class rule" bullet, line 555: "an Application class on the host is kept and not reported."

Needs: `HostAttributeToken('class')` (optional, development builds only).

Rule as documented usage: Do not copy `accordion`, `tabs`, `vertical`, `simple`, or `primary` onto `nfs-responsive-accordion-tabs`; bind `simple`/`primary`, and rely on the component's own rendering for the rest.

Mentions: user story 50, line 83; D23, line 634.

### Kept (not a check)

- No forgotten-import, Runtime, or build-time check of this file's own (see the note above the checks).
- The composed Accordion and Tabs directives' own checks (their copied-class checks, their In-family checks, their Runtime checks) -- explicitly out of scope of this file, owned by their own specs.
- `NG8001` for a forgotten `NfsResponsiveAccordionTabs` import, and the static check for a forgotten `NfsResponsiveAccordionTabsPanel` import -- compile errors / the static forgotten-import builder, not this file's own runtime development check.
- ARIA and focus behaviour: the Mode swap's focus rules, the APG Accordion/Tabs tables.
- Typed inputs and their compile errors: `simple`/`primary` (Variant inputs), `selectionMode`.
- The library's own tests otherwise not asserting one of the checks above.

---

## specs/responsive-embed.md

This spec has one directive with no parent and no children (`Hierarchy and DI shape`, line 87-96), so it declares no In-family (forgotten-import) check of its own; none is mentioned in the file. It has no build-time check: its Sass section's rules (a)/(b) carry no `@error`/`@warn`, only CSS declarations (`display: flow-root`, `overflow: visible`); item 5, "Missing include", only describes consequences.

### misuse: `iframe`/`object`/`embed` with no accessible name (Development check 1)

Location: "API: NfsResponsiveEmbed", "Development checks" list, item 1, line 132.

Text:

````text
1. Name: every `iframe`, `object`, and `embed` child of the host has an accessible name from `aria-labelledby` (an id of an element with text, the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` counting as text, building-blocks 1.10, Names), `aria-label`, or `title`, none of them empty after trimming. Otherwise: "nfsResponsiveEmbed: the iframe has no accessible name. Give it a title that says what it shows, for example title="Video: Foundation for Sites 6 overview"." A `video` is not checked (neither WCAG nor axe requires it a name). axe reports `frame-title` and `object-alt` too, but only where axe runs, and axe has no rule for `embed`, so the check is the only one that sees an unnamed `embed`.
````

Tests and stories: "2. Browser-level test", "Development check 1 (name)" bullet, line 297: "an `iframe`, an `object`, and an `embed` with no name each warn once, naming the element; each named by `title`, by `aria-label`, and by `aria-labelledby` pointing at an element with text is silent, ...; `aria-labelledby` pointing at a missing id and `title="  "` warn; a `video` with no name is silent."

Needs: `ElementRef` (development builds only; a DOM read of the box's own embedded children).

Rule as documented usage: Name every `iframe`, `object`, or `embed` inside a Responsive Embed box, for example with `title`.

Mentions: user story 7, line 36; WCAG table row 4.1.2, line 188; D4, line 353.

### misuse: Content beside the embedded element (Development check 2)

Location: "API: NfsResponsiveEmbed", "Development checks" list, item 2, line 133.

Text:

````text
2. Placement: when at least one element child of the host is an `iframe`, `object`, `embed`, or `video`, the host has no other element child. Otherwise: "nfsResponsiveEmbed: the embedded element fills the box and covers the other content in it (a p). Move captions and links outside the box, for example into a figcaption." Two embedded elements report the same way, because the second covers the first. A host with no embedded child at its first render is not checked, because its content is still to come: a `@defer` placeholder, or a component that creates its frame later such as `youtube-player`.
````

Tests and stories: "2. Browser-level test", "Development check 2 (placement)" bullet, line 298: "an `iframe` beside a `p`, and two `iframe`s, each warn once; a box holding only a `@defer` placeholder, or only a test component whose frame is created after the first render, is silent; comment nodes and text between elements do not count."

Needs: `ElementRef` (development builds only; a DOM read of the box's own element children).

Rule as documented usage: Put nothing else inside a Responsive Embed box beside the one embedded element; write captions, transcripts, and links outside it (for example in a `figcaption`).

Mentions: user story 8, line 37; WCAG table row 2.4.11, line 191; D5, line 354.

### misuse: Copied classes (Development check 3)

Location: "API: NfsResponsiveEmbed", "Development checks" list, item 3, line 134.

Text:

````text
3. Copied classes: a static class list holding `widescreen` warns "class="widescreen" is set by nfsResponsiveEmbed: bind ratio="widescreen" instead"; `flex-video` warns "class="flex-video" is Foundation's old name for the Responsive Embed: remove it; nfsResponsiveEmbed binds .responsive-embed". A copied class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `responsive-embed` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared ratio names are not known without the Variant properties and are left to the Variant check (the Button spec's D22 rule, as the Callout applies it).
````

Tests and stories: "2. Browser-level test", "Development check 3 (copied classes)" bullet, line 299: "a static `class="widescreen"` warns naming `ratio`; `class="flex-video"` warns naming the alias; `class="responsive-embed"` and the consumer's own class are silent; each warning is made once per instance."

Needs: `HostAttributeToken('class')` (optional, development builds only).

Rule as documented usage: Do not copy `widescreen` or `flex-video` from Foundation's docs; bind `ratio="widescreen"`, and drop `flex-video` entirely (the alias binds nothing).

Mentions: user story 9, line 38; D7, line 356.

### runtime: Runtime check

Location: "API: NfsResponsiveEmbed", the paragraph after "Development checks", line 136.

Text:

````text
Runtime check: in its own `afterRenderEffect` read callback, created only when the handle is not `null`, `NfsResponsiveEmbed` calls `include('nfs-responsive-embed', ['responsive-embed-ratios'])` on every run, whether or not `ratio` is bound, because the mixin holds the focus rule every box needs; then `value('ratio', ratio, needs)` with the need `{setting: 'responsive-embed-ratios', name: ratio}` for a one-token value other than `'default'`, `[]` for no value and `'default'`, and `null` for anything else. `strictVariantNames` compares a bound `ratio` with `--nfs-responsive-embed-ratios` and reports a value that is not one class token; `strictVariantProperties` reports a missing `@include nfs-responsive-embed;` when the property reads empty. A consumer whose map keeps only `default` has an empty property and opts `strictVariantProperties` out, as the Callout's consumer without sizes does. The report shape, the per-realm read, and the configuration are the Runtime checks' ([ADR 0040](../adr/0040-variant-input-types.md)).
````

Tests and stories: "2. Browser-level test", "Runtime check" bullet, line 301: "with `--nfs-responsive-embed-ratios: widescreen` on the test document, `ratio="widescreen"` and `'default'` are silent; an unlisted `ratio` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$responsive-embed-ratios`; in a test file of its own, with the property absent, a box with no `ratio` bound reports `strictVariantProperties` once, naming `@include nfs-responsive-embed;`."

Needs: `nfsVariantCheck('nfsResponsiveEmbed')`; the compiled `--nfs-responsive-embed-ratios` custom property.

Rule as documented usage: Only bind `ratio` to a key the consumer's compiled `$responsive-embed-ratios` actually lists (or `'default'`), and include `@include nfs-responsive-embed;`.

Mentions: user story 11, line 40; D2, line 351.

### Kept (not a check)

- No forgotten-import check of this file's own (single directive, no parent/child); no build-time check (the Sass rules carry no `@error`/`@warn`).
- ARIA and focus behaviour: the "ARIA and keyboard" section, the release-the-clip focus rule (D6, a Library CSS rule, not a check).
- Typed inputs and their compile errors: `NfsResponsiveEmbedRatio`.
- The library's own tests otherwise not asserting one of the checks above.

---

## specs/responsive-menu.md

### forgotten-import: In-family checks (`NfsResponsiveMenu`)

Location: "Hierarchy and DI shape", line 176.

Text:

````text
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsResponsiveMenu` calls `nfsDirectiveCheck('NfsResponsiveMenu')` with its name only: its three hosted roots probe `NfsMenuItem`, and the hosted `NfsDrilldown` probes `NfsDrilldownBack`, from the responsive `ul`, because the child probe also counts the host record; it is a parent directive in the parent checks of `NfsMenuItem`, `NfsMenuText`, and `NfsDrilldownBack`; it has no parent check, no peers, and `strictParents` changes nothing.
````

Tests and stories: none dedicated beyond the general "2. Browser-level test" layer's development-warning bullet (line 530), which covers this file's own checks 1-4, not this forgotten-import entry directly; the hosted roots' own probes are tested by their specs (Nested menu, Accordion Menu, Drilldown Menu, Dropdown Menu), out of this file.

Needs: `nfsDirectiveCheck`; the hosted roots' own probes (composed, not this file's own code).

Rule as documented usage: Every item, submenu, toggle, and back item of a responsive menu must be declared inside the `ul[nfsResponsiveMenu]` element, in the same template, with the Nested menu and (for a drilldown rule) Drilldown Menu entry points imported.

Mentions: none beyond the text above.

### family: Zero-breakpoint dropdown with a non-vertical Menu `orientation` (Development check 3)

Location: "API", "Development-mode checks" list, item 3, line 256.

Text:

````text
3. The Zero-breakpoint mode is `dropdown` and the Menu's `orientation` is not vertical at the Zero breakpoint (it is neither `'vertical'` nor a rules object whose Zero-breakpoint key is `'vertical'`): a horizontal dropdown bar at 320 CSS px can scroll the page sideways (WCAG 1.4.10). The check reads the hosted Menu's `orientation()` through `inject(NfsMenu, {self: true})` and the Zero breakpoint as `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, both in development builds only, never a class (D20).
````

Tests and stories: "2. Browser-level test", "Development warnings" bullet, line 530: "check 3 fires for `dropdown medium-drilldown` with no `orientation`, with `orientation="horizontal"`, and with `[orientation]="{medium: 'vertical'}"`, and not with `orientation="vertical"` or `[orientation]="{small: 'vertical', medium: 'horizontal'}"`, also under a test `nfsBreakpointsToken` whose Zero breakpoint is `xs` (`{xs: 'vertical'}` silences it)".

Needs: `inject(NfsMenu, {self: true})`'s `orientation()` (the hosted Menu directive this directive itself composes); `nfsBreakpointsToken` (the Zero breakpoint's name).

Rule as documented usage: When the Zero-breakpoint mode is `dropdown`, bind the Menu's `orientation` to `'vertical'` at the Zero breakpoint (WCAG 1.4.10).

Mentions: WCAG table row 1.4.10, line 354; D20, line 610; table row `orientation`, line 229 ("a Zero-breakpoint dropdown mode needs `vertical` at the Zero breakpoint (check 3; WCAG 1.4.10)").

Boundary call: `NfsResponsiveMenu` reads `orientation()` from `NfsMenu`, a directive it hosts on the same element through `hostDirectives` rather than a directive on a separate ancestor/descendant element. It is still "another part of its family" by the `family` definition's wording (the one Menu instance the three roots share), so it is filed under `family` rather than `misuse`, distinct from checks 1, 2, and 4 below, which read only the directive's own input state.

### misuse: Rules give no mode at the Zero breakpoint (Development check 1)

Location: "API", "Development-mode checks" list, item 1, line 254.

Text:

````text
1. The rules give no mode at the Zero breakpoint: "`<mode>` (the smallest rule's) applies below `<breakpoint>`; add a bare mode for the Zero breakpoint".
````

Tests and stories: "2. Browser-level test", "Resolution" bullet, line 515: "rules with no Zero-breakpoint mode (the smallest rule's mode below it, one warning)".

Needs: `rules()` (the directive's own input), parsed through the shared parser.

Rule as documented usage: Give the `rules` value a bare mode for the Zero breakpoint, or the smallest rule's mode applies below it (reported).

Mentions: D5, line 595.

### misuse: Rules name no valid mode (Development check 2)

Location: "API", "Development-mode checks" list, item 2, line 255.

Text:

````text
2. The rules name no valid mode: "`accordion` applies"; the shared parser has already warned about each invalid token.
````

Tests and stories: "2. Browser-level test", "Resolution" bullet, line 515: "an empty rule string (`accordion`, one warning), and `tabs` and `accordion-menu` tokens (the parser's warnings, skipped)".

Needs: `rules()`, parsed through the shared parser (which reports each invalid token itself, out of this file).

Rule as documented usage: Name at least one valid mode (`accordion`, `drilldown`, or `dropdown`) in `rules`, or `accordion` applies (reported).

Mentions: D4 and D5, lines 594-595.

### misuse: A root directive attribute written beside `nfsResponsiveMenu` (Development check 4)

Location: "Hierarchy and DI shape", line 173, restated as the (renumbered) fourth development check at line 257-259.

Text:

````text
A root directive attribute written next to `nfsResponsiveMenu` (`<ul nfsResponsiveMenu nfsDrilldown>`) is not supported: Angular keeps the selector match of that directive and drops its host directive match, and its own `nfsMenuRootProviders` then competes with this directive's provider on the same element. A development warning names it.
````

and, in the "Development-mode checks" list:

````text
4. A static `nfsAccordionMenu`, `nfsDrilldown`, or `nfsDropdownMenu` attribute on the same element (read from the host element in this render callback).

Removed 2026-09-28 under the class rule: the published check 4, a mode class (`accordion-menu`, `drilldown`, `dropdown`) written on the root. Its reason, that a static one would apply in every mode, no longer holds: each hosted root binds its class `false` in the other modes, which strips the copy, and `true` in its own, where the copy merges, so a copy can change nothing; the three root specs report none on a standalone root for the same reason, and a responsive root follows them (D22). The former check 5 is now check 4.
````

Tests and stories: no dedicated test bullet found for this specific case beyond the "Development warnings" bullet's general "each of checks 1 to 4 fires once for its case and none for correct markup" (line 530).

Needs: a static-attribute read of the host element (`nfsAccordionMenu`/`nfsDrilldown`/`nfsDropdownMenu` written directly, not through `hostDirectives`).

Rule as documented usage: Do not write `nfsAccordionMenu`, `nfsDrilldown`, or `nfsDropdownMenu` directly beside `nfsResponsiveMenu` on the same element; the responsive directive already hosts all three.

Mentions: Hierarchy and DI shape, line 173.

### Kept (not a check)

- No Runtime check and no build-time check of this file's own: "Variant properties: none of its own." (Sass subsection, item 6, line 768) and "No library CSS: there is no `nfs-responsive-menu` mixin and the directive declares no `styles`." (Sass and custom CSS intro, line 486-488).
- The composed Nested menu, Accordion Menu, Drilldown Menu, Dropdown Menu, and Menu directives' own checks (their copied-class checks, their In-family checks, their build-time checks) -- explicitly restated as applying but out of scope of this file (line 261: "The Menu's, the Nested menu's, and the three roots' checks also apply").
- ARIA and focus behaviour: the Mode swap's focus rules, the key tables, the Base-side mechanics.
- Typed inputs and their compile errors: `rules` (`NfsMenuMode`), the Menu's Variant inputs bound on the same `ul`.
- The library's own tests otherwise not asserting one of the checks above.

---

## Counts

Per kind (all 9 files):

| Kind | Count |
| --- | --- |
| `forgotten-import` | 9 (one In-family entry per file, each covering that file's whole family; nested-menu.md's and off-canvas.md's and orbit.md's and progress-bar.md's entries also each cover one M7 token description folded into the same entry) |
| `family` | 6 (nested-menu.md: 2; off-canvas.md: 2; orbit.md: 1; responsive-menu.md: 1) |
| `misuse` | 41 (nested-menu.md: 4; off-canvas.md: 8; orbit.md: 6; pagination.md: 5; progress-bar.md: 6; prototyping-utilities.md: 5; responsive-accordion-tabs.md: 7; responsive-embed.md: 3; responsive-menu.md: 3, minus the one family-classified check 3 already counted above -- see per-file counts) |
| `runtime` | 6 (off-canvas.md: 1; progress-bar.md: 2; prototyping-utilities.md: 1; responsive-embed.md: 1; nested-menu.md and pagination.md: 0 explicit runtime check of their own) |
| `build-time` | 15 (nested-menu.md: 4 [plus the one Dropdown-Menu-owned reflow check referenced in its table]; off-canvas.md: 4; orbit.md: 2; pagination.md: 3; progress-bar.md: 1; prototyping-utilities.md: 1) |

Per file (checks only, not counting "Kept" bullets):

- `specs/nested-menu.md`: 1 forgotten-import, 2 family, 4 misuse, 5 build-time (including the Dropdown-Menu-owned reflow check quoted from this file's own WCAG table) = 12
- `specs/off-canvas.md`: 1 forgotten-import, 2 family, 8 misuse, 1 runtime, 4 build-time = 16
- `specs/orbit.md`: 1 forgotten-import, 1 family, 6 misuse, 2 build-time = 10
- `specs/pagination.md`: 1 forgotten-import, 5 misuse, 3 build-time = 9
- `specs/progress-bar.md`: 1 forgotten-import, 6 misuse, 2 runtime, 1 build-time = 10
- `specs/prototyping-utilities.md`: 1 forgotten-import, 5 misuse, 1 runtime, 1 build-time = 8
- `specs/responsive-accordion-tabs.md`: 7 misuse (no forgotten-import, runtime, or build-time of its own) = 7
- `specs/responsive-embed.md`: 3 misuse, 1 runtime (no forgotten-import or build-time) = 4
- `specs/responsive-menu.md`: 1 forgotten-import, 1 family, 3 misuse (no runtime or build-time of its own) = 5

Total checks catalogued: 81.

## Boundary calls (all, collected)

1. nested-menu.md, Development check 3 (`span[nfsSubmenuToggleText]` inside a non-hybrid toggle): filed `family`, not `misuse`, because it reads a property (`hybrid`) of a distinct sibling directive (`NfsSubmenuToggle`) rather than only its own host.
2. nested-menu.md, Development check 4 (parent item with a submenu but no toggle): filed `family` because it reads a child's presence (the toggle), matching the `family` definition's own wording, even though item and toggle are markup on one section.
3. off-canvas.md, Development check 3 (split in two): part a (no content linked) filed `misuse` (reads only the panel's own resolved `content`); part b (push panel with no wrapper ancestor) filed `family` (a DOM-only placement check against a distinct family member, the wrapper).
4. off-canvas.md, Development check 9 (overlay inside an element the Modal inert set covers): filed `family` as a DOM-only placement check between two family members (the overlay and the linked content).
5. orbit.md, Development check 6 (two slides with one `value`): filed `family` because it reads across sibling slides (peers), not only the one slide's own state.
6. orbit.md, In-family checks entry: the browser-level test's `provideNfsRuntimeChecks({strictParents: true})` call is noted as configuring the forgotten-import `strictParents` option, not an ADR 0040 Runtime check, despite the function name's overlap with the `runtime` kind's own `provideNfsRuntimeChecks` term.
7. responsive-menu.md, Development check 3 (Zero-breakpoint dropdown with non-vertical `orientation`): filed `family` because it reads the hosted `NfsMenu` directive's own input, a distinct directive this one composes through `hostDirectives`, rather than only its own state.

## Unsure how to classify

None left genuinely unresolved after the tie-break rule (reads-what, forgotten-import first); every ambiguous case is recorded above as a boundary call with its reasoning. The one open question forwarded to the orchestrator: whether nested-menu.md's "Dropdown reflow at 320 px" build-time check (WCAG table row 1.4.10, `nfs-dropdown-menu`'s own `@warn`) belongs in THIS manifest at all, since its owning mixin and spec (Dropdown Menu) are outside this group's nine files -- it is included here because the text appears verbatim in nested-menu.md's own WCAG table, but the later re-run for build-time checks may prefer to source it from wherever the Dropdown Menu group files it, to avoid duplication.
