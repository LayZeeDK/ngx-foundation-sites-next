# 151. Re-run: navigation family specs, In-family check lines

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) found that the specs written before ADR 0046 lack the In-family check lines, parent token descriptions, and `strictParents` effects that [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) requires of a multi-directive family. What does each spec of the navigation family (`specs/menu.md`, `specs/nested-menu.md`, `specs/drilldown-menu.md`, `specs/top-bar.md`, `specs/breadcrumbs.md`, `specs/pagination.md`) state?

## How to work it

Revise each spec in place and append a dated `### Amendment, 2026-09-29 (in-family check lines)` to the ticket the map's Decisions so far cites last for that spec. The items, evidence, and what to decide are in the audit ticket's Answer, section "Re-run tickets", item R1, and the five points above it that every re-run decides; `specs/forgotten-import-checks.md` (its family rule, the `strictParents` table, and the token-description form) and the Accordion spec's worked example are the model. Run `/grill-with-docs` (self-grilling, both sides) where a point needs deciding, and keep every other part of each spec unchanged. Propose shared-document changes as quoted text in the Answer.

## Answer

Model: Opus 5.5. Resolved 2026-09-29, AFK under the map's override: self-grilled on both sides (the `/grill-with-docs` skill is not installed in this session, so its method was followed by hand) against [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) (Answer, "Re-run tickets", R1 and the five points above it), the family rule, the `strictParents` table, the kept-optional list, M5, M7, and the parent-check and child-probe rules of `specs/forgotten-import-checks.md`, [ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md), [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), building-blocks 1.9, the architecture guide's P23 and P24, the Accordion's worked example (`accordion.md:156`), and Foundation 6.9.0's Sass for the `alone` sentences (`.menu .menu-text`, the global `.submenu-toggle-text`, `.breadcrumbs .disabled`, `.pagination` around the item layout and `.ellipsis::after`). Mid-run the orchestrator relayed the two shared-spec rules of [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md): S1 (both In-family walks also count the host record) and S2 (a DOM placement check says nothing for a parent element that carries the parent's attribute without its host class). This ticket decides consistently with both. No measurement was needed: every point follows from those records. Specs revised in place: [specs/menu.md](../specs/menu.md), [specs/nested-menu.md](../specs/nested-menu.md), [specs/drilldown-menu.md](../specs/drilldown-menu.md), [specs/top-bar.md](../specs/top-bar.md), [specs/breadcrumbs.md](../specs/breadcrumbs.md), [specs/pagination.md](../specs/pagination.md). Every other part of each spec is unchanged.

### Grilling record

- Q1. The form of the lines. For one sentence per spec: the Accordion's worked example, and T3 was dropped. Against: families of four to nine parts, with five items per part, make one sentence unreadable, and the rule says "one line per part". Settled: a lead bullet, "In-family checks" (the rule's term, and the one fixer items X1 to X5 use), with one nested line per part. Parts that share every item share one line: the Top Bar's four sections and three leaves, the Pagination's three items, and the four plugin roots.
- Q2. The parent directives of `NfsMenuText`: `NfsMenu` alone, or with its hosts? For `NfsMenu` alone: under S1 the host record finds a hosted `NfsMenu`. Against: a forgotten root import leaves a `ul[nfsDropdownMenu]` with no record, and only that attribute in the list lets the check report the forgotten parent on the ancestor. The shared API also says "its provider and every directive that hosts it". Settled: `NfsMenu`, `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, `NfsResponsiveMenu` (its `ul` carries only its own attribute), and `NfsSubmenu`. The audit's "four specs" reads as the four menu Plugin specs whose roots host `NfsMenu`.
- Q3. Does a hosted `NfsMenu` probe? The published scope ("nearest ancestor carrying one of this part's own attributes") misses it, because the root's `ul` carries the root's attribute. There were three ways to fix it: (a) every host lists `NfsMenuText` among its children, which needs edits in three specs outside this ticket and repeats the Menu's parts in every root; (b) the helper reads the Selector manifest's `hosts` in reverse, which was this ticket's first draft; (c) S1, both walks count the host record. For (c): it is one rule for library and consumer host directives, it uses data the helper already keeps, and it covers (b). Settled: `NfsMenu` probes `NfsMenuText` wherever it sits, relying on S1, and this ticket makes no proposal of its own for it.
- Q4. Who probes `NfsMenuItem`? The roots are its parent directives. Without a probe, a forgotten item import would reach only the runtime check, and a forgotten item that holds a submenu throws NG0201 through the submenu's required class lookup, which names only `_NfsMenuItem`. Settled: every plugin root probes `NfsMenuItem` across its tree, as this utility's consumer contract. `NfsSubmenu` probes its own items too, which covers a tree without a root. Under S1 the three hosted roots probe from the responsive `ul`, so `NfsResponsiveMenu` calls with its name only. The shared report function merges the duplicate probes into one report.
- Q5. The three root specs outside this ticket (Accordion Menu, Dropdown Menu, Responsive Menu). The audit counted them as single-directive specs with nothing to add. X7's corrected rule says a single-directive spec adds no line only when it has no parent, child, or peer, and each root has a child. Settled: the Nested menu's line states the contract now, and "What other specs need" quotes a line for each of the three.
- Q6. The `alone` sentences (point 2). Each existing warning about a part outside its optional parent becomes M5 plus a sentence that names the consequence, taken from Foundation's scoping or the directive's own bindings. Where the old text said only "outside X" (Breadcrumbs check 7, the Pagination items), M5's first sentence already says that. Two warnings split: the Nested menu's check 3 keeps the non-hybrid toggle case, because the parent is found there, and the Drilldown's check 3 keeps "outside any submenu", because `NfsSubmenu` stays optional.
- Q7. Point 3, the Top Bar's check 7, which reports placement from the DOM alone. With `NfsTopBar` forgotten, the bar lacks `.top-bar`, so the check would say that a section is outside the bar it sits in, next to the runtime check's M1 on the bar. Three answers were possible: keep the check as it is (two reports, one of them wrong); report the forgotten import itself (two reports while the runtime check is on); stay silent where an ancestor carries the attribute (one report, M1). Settled: silent, which is S2. With the runtime check switched off nothing reports it there, which is the consumer's choice, and the static check still sees it.
- Q8. The same question for checks that find a peer by registration: the Drilldown's check 1 (the wrapper, which stays optional, so no parent check reports its forgotten import), its check 2 (back items), and the Nested menu's check 4 (toggles). Settled: each says nothing where the element it looks for carries the peer's attribute, because the child probe (M2) or the runtime check (M1) reports that forgotten import once. P1 below proposes this as a companion to S2. Three checks already hold, because they read attributes: the Nested menu's check 2 (`span[nfsSubmenuToggleText]`), the Breadcrumbs' check 2, and the Pagination's check 2.
- Q9. Should the bars probe `NfsMenuIcon`? For: it is in the same entry point, a forgotten import leaves an invisible button in the bar, and Foundation styles `.title-bar .menu-icon`. Against: an icon may stand anywhere. The probe looks only inside a bar, so an icon elsewhere is not affected. Settled: both bars probe it.
- Q10. The token descriptions (point 4). `nfsMenuModeToken` has four providers, so its M7 text names the four roots and their entry points. A consumer's own root built on `nfsMenuRootProviders` is no documented pattern (the test root is test-only), so the list stays at four. `nfsTopBarRightToken` gets the plain M7 text. `nfsDrilldownDefaultsToken` is a Defaults token and needs none. Lookups by class (`inject(NfsMenuItem)`, `inject(NfsMenu, {self: true})`, `inject(NfsDrilldown)`) cannot carry a description; the shared spec names `inject(NfsMenuItem)` as that form.
- Q11. Point 5: no part of the six specs sits on `ng-template` or `ng-container`, so no line says it calls nothing.
- Q12. `strictParents`: the effects follow the shared table, and the kept-optional reasons follow its list (`:249` the Drilldown wrapper, `:250` `NfsMenuItem` and `NfsDrilldownBack` to `NfsSubmenu`, `:251` the root to `nfsTopBarRightToken`). Nothing new.
- Q13. Where the amendments go, by this ticket's rule ("the ticket the map's Decisions so far cites last for that spec"): the Menu to [Spec: Menu](85-spec-menu.md), because ticket 139's entry names no spec file, and the out-of-scope notes of 2026-09-28 went there too; the Nested menu to [Re-run: Nested menu (shared utility) spec under the class rule](132-rerun-nested-menu-class-rule.md); the Drilldown to [Re-run: Drilldown Menu spec under the class rule](114-rerun-drilldown-menu-class-rule.md); the Top Bar to [Re-run: Top Bar spec, out-of-scope survivors](148-rerun-top-bar-out-of-scope-survivors.md), although ticket 148's own amendment sits in [Spec: Top Bar](86-spec-top-bar.md) by that ticket's instruction; Breadcrumbs to [Spec: Breadcrumbs](88-spec-breadcrumbs.md); Pagination to [Spec: Pagination](87-spec-pagination.md).
- Q14. An ADR, a prototype, tests? No ADR: the checks are development-only and reversible, and they follow ADR 0046. No prototype. Each family check whose behaviour changed gets one test clause (the Nested menu's check 4, the Drilldown's checks 1 and 2, the Top Bar's check 7); the helper's own reports are tested in the shared spec.

The frontier is empty. Nothing is left `OPEN FOR HUMAN`, and no prototype ticket is needed.

### Decisions

Menu (`specs/menu.md`):

1. `NfsMenu`: `nfsDirectiveCheck('NfsMenu', {children: ['NfsMenuText']})`, probing on a plain menu and, hosted, on every menu Plugin root and `ul[nfsSubmenu]` (S1); no parent check; no peers; `strictParents` changes nothing.
2. `NfsMenuText`: a parent check over `NfsMenu`, `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, `NfsResponsiveMenu`, and `NfsSubmenu`, with `found` from its development-only lookup by class and the `alone` sentence "It is unstyled outside a menu."; a leaf; no peers; it throws under `strictParents`.
3. Development check 3 becomes that parent check's report; the diagram's lookup is "for its parent check".

Nested menu (`specs/nested-menu.md`):

4. Every plugin root: `nfsDirectiveCheck('<Root>', {children: ['NfsMenuItem']})`, a consumer contract of the utility (the Drilldown also probes `NfsDrilldownBack`); no parent check (its injections are `self`, and `nfsTopBarRightToken` is context that stays optional); a root hosted by `NfsResponsiveMenu` probes from the responsive `ul`, so `NfsResponsiveMenu` calls with its name only; `strictParents` changes nothing.
5. `NfsMenuItem`: the shared spec's usage example, a parent check over the four roots with "It binds no Nest or mode classes; its submenu shows as a plain nested Menu.", probing `NfsSubmenu` and `NfsSubmenuToggle`; `NfsSubmenu` stays optional; it throws under `strictParents`.
6. `NfsSubmenu` and `NfsSubmenuToggle`: no parent check, because their `inject(NfsMenuItem)` is required and NG0201, which names the class, is the report. `NfsSubmenu` probes its items, and its hosted `NfsMenu` probes `NfsMenuText`; `NfsSubmenuToggle` probes `NfsSubmenuToggleText`. No peers. `strictParents` changes nothing.
7. `NfsSubmenuToggleText`: a parent check over `NfsSubmenuToggle` with "Its visually hidden text names nothing outside a hybrid toggle."; it throws under `strictParents`.
8. `nfsMenuModeToken`'s development-only description names the four roots and their entry points.
9. Development checks: check 3 keeps the non-hybrid toggle case; check 4 says nothing for an item that holds an element carrying `nfsSubmenuToggle`; check 5's item case moves to the parent check; the warning tests gain the check 4 case.

Drilldown Menu (`specs/drilldown-menu.md`):

10. `NfsDrilldown`: `nfsDirectiveCheck('NfsDrilldown', {children: ['NfsMenuItem', 'NfsDrilldownBack']})`, probing from the responsive `ul` when a ResponsiveMenu hosts it; the wrapper injection stays optional, with the shared spec's reason (`:249`), so there is no parent check; no peers; `strictParents` changes nothing.
11. `NfsDrilldownWrapper`: probes `NfsDrilldown`; no parent check; no peers; `strictParents` changes nothing.
12. `NfsDrilldownBack`: a parent check over `NfsDrilldown` and `NfsResponsiveMenu` with "It stays hidden and closes no level."; `NfsSubmenu` stays optional (`:250`); a leaf; it throws under `strictParents`.
13. Check 1 says nothing for a root whose parent element carries `nfsDrilldownWrapper` without a registered wrapper (the runtime check reports it), and check 2 nothing for a level that holds an element carrying `nfsDrilldownBack` (the root's probe reports it); check 3's outside-a-root case moves to the parent check. The warning tests gain both silent cases.
14. No parent token of its own, as before; no description to add.

Top Bar (`specs/top-bar.md`):

15. `NfsTopBar` probes `NfsTopBarLeft`, `NfsTopBarRight`, `NfsTopBarTitle`, and `NfsMenuIcon`; `NfsTitleBar` probes `NfsTitleBarLeft`, `NfsTitleBarRight`, `NfsTitleBarTitle`, and `NfsMenuIcon`.
16. None of the nine injects a parent, so none has a parent check, and `strictParents` changes nothing for any of them; the sections are placed by check 7 (D13); the leaves have no probes and no peers; `nfsTopBarRightToken` stays an optional context lookup (ADR 0043).
17. `nfsTopBarRightToken` gets its development-only M7 description.
18. Check 7 counts an ancestor that carries the bar's attribute without its class as the bar and says nothing, the rule of S2; the development tests gain that case.

Breadcrumbs (`specs/breadcrumbs.md`):

19. `NfsBreadcrumbs` probes `NfsBreadcrumbsItem`; no parent check; no peers; `strictParents` changes nothing.
20. `NfsBreadcrumbsItem`: a parent check over `NfsBreadcrumbs` with "Foundation's disabled look applies only inside the trail.", replacing check 7; it throws under `strictParents`.

Pagination (`specs/pagination.md`):

21. `NfsPagination` probes `NfsPaginationPrevious`, `NfsPaginationNext`, and `NfsPaginationEllipsis`; no parent check; no peers; `strictParents` changes nothing.
22. Each of the three items: a parent check over `NfsPagination` with "Foundation lays out and draws pagination items only inside a pagination.", replacing the outside-the-pagination warning; each throws under `strictParents`.

Across the six:

23. No part sits on `ng-template` or `ng-container`; no peer is linked by reference or by value; the lookups by class stay (building-blocks 1.9, the guide's P4 as edit E1 of ticket 142 words it).
24. The hosted probes (decisions 1, 4, 6, 10) depend on S1 of ticket 154.

### Triage

| Item | Impact | Confidence | Verdict |
| --- | --- | --- | --- |
| Decisions 1 to 22, the per-part lines, `alone` sentences, and token descriptions | LOW: development-only checks and messages, no public API; the `strictParents` part list was fixed already | HIGH: ADR 0046, building-blocks 1.9, the shared spec's rule, table, kept-optional list, and M7; the sentences follow Foundation 6.9.0's selectors | Decided |
| Decisions 9, 13, and 18, the family checks that stay silent for a forgotten peer | LOW: which development message fires | HIGH: one report per defect is the shared spec's design (D8, user story 5), and ticket 154 reached S2 on its own | Decided |
| Decision 24, the reliance on S1 | LOW | HIGH: the host record already holds hosted directives (the shared spec's host-record bullet) | Decided; depends on S1 |
| Decision 4 and the three root specs' lines | LOW | HIGH: X7's corrected rule and the Nested menu's consumer table | Decided; lines proposed below |

Nothing is `OPEN FOR HUMAN`.

### Proposed shared-file changes (for the orchestrator)

P1. `specs/forgotten-import-checks.md`, In-family checks, right after the bullet S2 of [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md) adds, add its companion for checks that find a peer by registration:

> - A family's own development check that finds a peer by registration (the Drilldown's checks 1 and 2, the Nested menu's check 4) likewise says nothing where the element it looks for carries the peer directive's attribute: a forgotten child is its parent's child probe report (M2), and a forgotten parent that has no parent check, because its injection stays optional (the Drilldown wrapper), is `strictDirectiveImports`'s report (M1), so the defect is reported once and the family message never names the wrong fix.

P2. `specs/forgotten-import-checks.md`: apply S1 of ticket 154 as it proposes. This ticket's hosted probes rely on it (decision 24), and no competing text is proposed.

P3. `map.md`, Decisions so far: the gist below.

No change is proposed to `building-blocks.md`, the architecture guide, `CONTEXT.md`, or the ADRs.

### What other specs need from this one

- [Spec: Accordion Menu](20-spec-accordion-menu.md), `specs/accordion-menu.md`, Hierarchy and DI shape: after the bullet that begins "- The entry point exports only the accordion root", add:

  > - In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsAccordionMenu` calls `nfsDirectiveCheck('NfsAccordionMenu', {children: ['NfsMenuItem']})`, the probe the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) requires of every menu root, and its hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)); it has no parent check, because its injections are `self`, no peers, and `strictParents` changes nothing.

- [Spec: Dropdown Menu](21-spec-dropdown-menu.md), `specs/dropdown-menu.md`, Hierarchy and DI shape: after the bullet that begins "- The entry point exports only the root", add:

  > - In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsDropdownMenu` calls `nfsDirectiveCheck('NfsDropdownMenu', {children: ['NfsMenuItem']})`, the probe the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) requires of every menu root, and its hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)); it has no parent check, because its injections are `self` and the root handle's optional `nfsTopBarRightToken` is context, not a parent ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)); no peers; `strictParents` changes nothing.

- [Spec: Responsive Menu](23-spec-responsive-menu.md), `specs/responsive-menu.md`, Hierarchy and DI shape: after the bullet that begins "- The entry point exports only `NfsResponsiveMenu`.", add:

  > - In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsResponsiveMenu` calls `nfsDirectiveCheck('NfsResponsiveMenu')` with its name only: its three hosted roots probe `NfsMenuItem`, and the hosted `NfsDrilldown` probes `NfsDrilldownBack`, from the responsive `ul`, because the child probe also counts the host record; it is a parent directive in the parent checks of `NfsMenuItem`, `NfsMenuText`, and `NfsDrilldownBack`; it has no parent check, no peers, and `strictParents` changes nothing.

- [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md): the Top Bar's check 7 follows S2 (decision 18), and the hosted `NfsMenu` probe relies on S1 (decision 24); P1 extends S2 to checks that find a peer by registration.
- [Re-run: layout system and flex utility family specs, In-family check lines](155-rerun-layout-system-and-flex-utility-family-in-family-lines.md): nothing from this ticket beyond S2, which answers its DOM checks too.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): the six specs use "In-family checks" with one nested line per part, where the Accordion writes "Forgotten imports" in one sentence, so the review may align the label and the form across the re-runs; the three root specs above need their lines, since no re-run ticket owns them; the Top Bar's amendment sits in ticket 148 by this ticket's rule, while ticket 148's own amendment sits in ticket 86.

### Gist for Decisions so far

- [Re-run: navigation family specs, In-family check lines](issues/151-rerun-navigation-family-in-family-lines.md) -- the Menu, Nested menu, Drilldown Menu, Top Bar, Breadcrumbs, and Pagination specs list their In-family checks per part: every container probes its parts (`NfsMenu` probes `NfsMenuText`, hosted too; every plugin root probes `NfsMenuItem`, which probes its submenu and toggle; the Drilldown also probes its back items and the wrapper its root; each bar probes its sections, title, and menu icon; the trail and the pagination probe their items); `NfsMenuText`, `NfsMenuItem`, `NfsSubmenuToggleText`, `NfsDrilldownBack`, `NfsBreadcrumbsItem`, and the three Pagination items get parent checks whose `alone` sentences replace their old outside-the-parent warnings, and they throw under `strictParents`; the Drilldown wrapper, the item and back item to `NfsSubmenu`, and the root to `nfsTopBarRightToken` stay optional; `nfsMenuModeToken` (naming its four roots) and `nfsTopBarRightToken` get development descriptions; the Top Bar's section check and three registration checks (Drilldown 1 and 2, Nested menu 4) say nothing for a peer that carries its attribute without its directive, a forgotten import reported once elsewhere; the hosted probes rely on ticket 154's S1; one shared-spec proposal extends S2 to registration checks, and the Accordion Menu, Dropdown Menu, and Responsive Menu specs get quoted lines; impact LOW, confidence HIGH; no ADR.
