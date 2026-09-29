# 132. Re-run: Nested menu (shared utility) spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81, 85
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Nested menu (shared utility)](56-spec-nested-menu.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/nested-menu.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

Also: `.submenu-toggle-text` gains its directive, and the roots bind `.menu` as the Menu spec says.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Nested menu (shared utility)](56-spec-nested-menu.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Resolved 2026-09-28, AFK under the map's override: self-grilled on both sides with `/grill-with-docs` (the `/grilling` rounds plus `/domain-modeling` for vocabulary), then the spec revised in place in the `/to-spec` shape. Sources: ADR 0039, ADR 0040, building-blocks 1.4 (the initial-state rule), 1.9, 1.10, and 1.14, the answer of [Spec: Menu](85-spec-menu.md) and `specs/menu.md`, the answers of [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md) and [Re-run: Tabs spec under the class rule](108-rerun-tabs-class-rule.md), `research/out-of-scope-triage.md` (sections 2 and 3), `research/out-of-scope-exclusions.md` (NM1 to NM9), the Foundation 6.9.0 clone (`scss/components/_menu.scss`, `_accordion-menu.scss`, `_drilldown.scss`, `_dropdown-menu.scss`; `js/foundation.dropdownMenu.js`, `foundation.accordionMenu.js`, `foundation.drilldown.js`; `docs/pages/accordion-menu.md`), and the Angular 22.2.x clone (`packages/core/src/render3/di.ts`), with one measured probe. Spec: [specs/nested-menu.md](../specs/nested-menu.md), revised in place; the dated amendment is in [Spec: Nested menu (shared utility)](56-spec-nested-menu.md) under `### Amendment, 2026-09-28 (class rule)`.

Gist: the consumer's markup keeps Foundation's element structure and carries no class. Every plugin root and every `ul[nfsSubmenu]` host the Menu directive, which binds `.menu` and the Menu's Variants from typed inputs; the submenu binds `nested` and `vertical` itself in every mode; the dropdown Base side reads the hosted Menu's `align()` instead of the root's static `align-right`; the class maps hold every class they own in every mode, so a copied Foundation class is stripped and reported; a section open at first paint is `[expanded]`; the current page is `aria-current` only; `span[nfsSubmenuToggleText]` binds `.submenu-toggle-text`. Behaviour, ARIA, keyboard tables, animation, the Mode swap rule, rendering modes, and Story ids are otherwise unchanged. Nothing is `OPEN FOR HUMAN`; no prototype is needed.

### Grilling record

Round 1 (the frontier: ADR 0039, ADR 0040, building-blocks 1.4, and the Menu spec's decisions 4 and 5 settle every prerequisite):
- Q1. Which classes did the published spec leave to the consumer? `menu`, `vertical`, and `nested` on every submenu; `vertical medium-horizontal menu` and `vertical menu` on roots; `is-active` on a submenu as the initial open state (the seed) and on a leaf as the current page (the class maps promised to keep both); `align-right` read from the root's static class for the Base side; `vertical` on dropdown submenus ("consumer-written", `verticalClass` dropped); the `submenu-toggle-text` span; `js-drilldown-back` on the back item in the examples. Source: the spec before this revision (Solution, class mapping, binding paragraph, Base side paragraph, `expanded` row, Rendered HTML, tests, usage examples).
- Q2. Who binds `.menu` on roots and submenus? The Menu directive, hosted: the roots through their own `hostDirectives`, `NfsSubmenu` through its own, exposing `align` and `iconPosition`. Applied, not reopened: the Menu spec's decision 5, measured there with Angular 22.2.0.
- Q3. How does a section open at first paint without `is-active`? `[expanded]="true"` (or a two-way `[(expanded)]`) on the item: building-blocks 1.4's initial-state rule; the seed is deleted, and with it the seed's measured two-way interplay. A bare `expanded` attribute does not compile on a model (no transform), the same mechanism the Accordion re-run recorded for Aria's model.
- Q4. How is the current page marked? `aria-current` on its link in every mode, never a class; the Menu spec's decision 4, applied. The class maps no longer need to keep a consumer's current-page `is-active`.
- Q5. What binds `.submenu-toggle-text`? A new `NfsSubmenuToggleText` on `span[nfsSubmenuToggleText]`, a static host class: ADR 0039 names this class, Foundation's element is a `span` inside the toggle, and the name stays text in the accessibility tree.

Round 2:
- Q6. `nested` and `vertical` on a submenu: inputs, per-mode bindings, or constant? Constant `true`, bound by `NfsSubmenu`'s own map, in every mode and without a root. Foundation's accordion and drilldown docs write both; `foundation.dropdownMenu.js:61` adds `verticalClass` to every dropdown submenu; `_dropdown-menu.scss:169-170` and `_drilldown.scss:121-122` reset the nested margin with `$dropdownmenu-nested-margin` and `$drilldown-nested-margin`, both 0, and `.menu.align-right .nested` is overridden by both at higher specificity or later source order; a dropdown submenu is `display: none` or `block`, so `vertical` changes nothing there. Rejected: exposing the Menu's `nested` and `orientation` (no Foundation example varies them, and a horizontal submenu breaks every mode's layout and key table).
- Q7. Where does the Base side get `align` now that no static class exists? The root's factory injects the hosted `NfsMenu` with `{self: true}` and reads `align()` in the Base side's `computed`. Angular runs a node provider's factory at the node that declares it (`getNodeInjectable` enters DI at the declaring `tNode`), so the lookup finds the root's `NfsMenu` whichever directive first asks for the token. Measured (Probe). Rejected: a `configure()` slot (a Menu Variant is not a DropdownMenu Option, and the slot would carry a second copy of one signal).
- Q8. Class maps: keys for the current mode only (the published D7) or every owned key in every mode? Every key, `true` or `false`. The published reason, keeping consumer-written `menu`, `nested`, `vertical`, and a current-page `is-active`, is gone under the class rule; building-blocks 1.4 wants copies stripped; a constant key set means a Mode swap never reveals a copied class of another mode. Measured (Probe).
- Q9. `hybrid`: a Variant input (then `nfsVariantBoolean`) or not? Not a Variant: it chooses which Foundation element the button stands for (the parent link, which had no class, or the generated `.submenu-toggle`) and switches behaviour (`has-submenu-toggle`, the drilldown keep rule for a focused Hybrid link, the name check), so building-blocks 1.4's Option rule and `booleanAttribute` stand. Changing it later breaks only templates with a misspelt value.
- Q10. Which checks does the span need? A span outside a `hybrid` toggle (it would hide the only visible label of a parent button, or name nothing), and a hybrid toggle whose name is not inside a span (no name, or visible text inside the 40 px toggle); both in development builds only.

Round 3:
- Q11. The copied-class check (building-blocks 1.4): which classes, which messages? Items, submenus, and toggles read their static `class` through `HostAttributeToken` under `ngDevMode` and report each class their map owns: `is-active` on a submenu or parent item names `[expanded]`; on a leaf, `aria-current`; `submenu-toggle` names `hybrid`; other Nest and State classes say the family binds them. A submenu's redundant `menu`, `nested`, and `vertical` merge and are not reported. Found while working it: the hosted `NfsMenu` reads the same static class on a submenu and, as the Menu spec words its check 1, would report a copied `vertical` or `nested` naming `orientation` and `nested`, inputs the submenu does not expose. A refinement for the Menu spec is proposed below (change 9).
- Q12. Does moving the current look to `nfs-menu` leave a WCAG gap inside submenus? `nfs-menu` compares the fill with `$body-background` only, but drilldown links sit on `$drilldown-background`, dropdown submenu links on `$dropdownmenu-submenu-background`, and accordion links on `$accordionmenu-item-background` when set. Each mode mixin now stops the compile when `$menu-item-background-active` is under 3:1 against its non-`null` backgrounds (1.4.1); all pass at 4.59:1 on Foundation's defaults. The dropdown top level is excluded: `.dropdown.menu > li > a` (specificity 0,2,2) outranks `nfs-menu`'s rule (0,2,1) whenever `$dropdownmenu-background` is set, which the Menu ticket already left to the Dropdown Menu re-run.
- Q13. `.top-bar-right` ancestry: DOM walk or DI? The walk stays. The triage's reason for no DI (a consumer-written `.top-bar-right`) no longer holds, since the Top Bar's right-section directive binds the class; but declaration-site DI misses a menu projected into a Top Bar section from another template, and the walk reads the rendered class in every case. The Top Bar spec may add a token as a second, server-known source.
- Q14. The roots' own classes (`accordion-menu`, `drilldown`, `dropdown`, the Drilldown root's `invisible`) and the back item's and wrapper's classes? Their specs' directives, as before; the class mapping table records the owners.
- Q15. Tests and stories? Nothing writes a class except the copied-class cases; the test root hosts `NfsMenu`; new browser-level cases for hosting, the full key sets, initial state, the `align` Base side, and each development check; the SSR smoke's fixture writes no class attribute; the Sass compile test covers the new 1.4.1 checks; the fixture e2e case opens its section with `[expanded]="true"`. Story ids unchanged.
- Q16. Rendering modes? Construction injects and registers only; the hosted Menu and the Base side are host bindings and `computed`s read in the first update pass, so the server HTML carries `.menu`, the Menu's Variants, the submenu classes, and `opens-left` for `align="right"`; no seed runs before hydration.
- Q17. Glossary or ADR? No new term and no new ADR: hosting is the Menu spec's proposed ADR, the initial-state rule is building-blocks 1.4. **Base side** is redefined (change 6). ADR 0033 and ADR 0035 get dated notes, because a reason each gives no longer applies.
- Q18. The Menu ticket's correction: host-directive de-duplication shipped in Angular 22.0.0 (commit `9c55fcb3e6`), not 22.1; corrected in the Implementation level and D3.

The frontier is empty.

### Decisions

1. `NfsSubmenu` hosts `NfsMenu` with `inputs: ['align', 'iconPosition']` and binds `nested` and `vertical` itself, `true` in every mode and without a root (D26, D27).
2. Every plugin root hosts `NfsMenu` with `inputs: ['orientation', 'expanded', 'simple', 'align', 'iconPosition']` and binds no `.menu` itself; ResponsiveMenu lists no Menu input and gets one `NfsMenu` through its three roots; the spec's test root hosts it too (D26).
3. `NfsMenuRoot`'s factory injects the hosted `NfsMenu` with `{self: true}` (required); the dropdown Base side is a `computed` over `alignment`, `align()`, and `Directionality`, plus the `.top-bar-right` walk after hydration; no directive of the family reads a static class (D28, D33).
4. Each class map (item, submenu, toggle) holds every class the family binds on that kind of element in any mode, `true` or `false`; copied Foundation classes are stripped in every mode and across swaps; the consumer's own classes stay (D7 revised).
5. The initial open state is the item's `expanded` model, bound (`[expanded]="true"` or `[(expanded)]`); the static `is-active` seed is removed (D29).
6. The current page is `aria-current` on its link in every mode, never a class; menu Plugin consumers include `nfs-menu`; each mode mixin checks `$menu-item-background-active` at 3:1 against its non-`null` backgrounds (accordion `$accordionmenu-item-background`; drilldown `$drilldown-background`, `$drilldown-submenu-background`; dropdown `$dropdownmenu-submenu-background`) (D32).
7. `NfsSubmenuToggleText` (`span[nfsSubmenuToggleText]`, static `.submenu-toggle-text`, no inputs, no `exportAs`, a development-only lookup of `NfsSubmenuToggle`) (D30); `hybrid` keeps `booleanAttribute` (D31).
8. A Development checks subsection: the copied-class check with its messages; a hybrid name missing or outside the span; a span outside a hybrid toggle; a parent without a toggle; an item without a root; `expandAll()` misuse.
9. The class mapping table gains a Kind column and rows for the hosted Menu classes, `.menu-text`, the Drilldown classes, and `.top-bar-right`; the utility declares no Variant input, registry, or property; the Sass subsection gains item (6).
10. De-duplication version corrected to Angular 22.0.

### Measurements

Probe under `D:/tmp/nfs-wave-132/ng/` (not committed): `ngc` 22.2.0 with `strictTemplates` over stand-ins for `NfsMenu` (static `menu` plus a record of every owned class), `NfsMenuRoot` (a plain class created by a `useFactory` provider, injecting `ElementRef` and `NfsMenu` with `{self: true}`, computing the Base side), dropdown and accordion roots hosting `NfsMenu`, a ResponsiveMenu-shaped root hosting both and providing its own root, `NfsMenuItem` and `NfsSubmenu` with all-key maps, and `NfsSubmenuToggleText`; then `renderApplication` on the server platform. The `node_modules` junction to the rendering-mode seam prototype's Angular 22.2.0 install was removed afterwards; nothing was left running.

- `<ul nfsDropdownMenu align="right">` rendered `menu align-right dropdown`, and its parent item `opens-left`, in server HTML: the factory read `align()` on self.
- The ResponsiveMenu-shaped root (`align="right" orientation="vertical"`, neither listed in its `hostDirectives`) rendered `menu align-right vertical dropdown`, its item `opens-left`; one root handle was created, from its own provider, and read the merged `NfsMenu`.
- `alignment="left"` beside `align="right"` gave `opens-right`.
- A submenu with a copied `class="menu vertical nested is-active"` rendered `menu nested vertical submenu is-dropdown-submenu` (the copied `is-active` stripped); a leaf's copied `is-active` was stripped; `[expanded]="true"` rendered the parent `is-active` and the submenu `js-dropdown-active`; `align="left"` on a submenu set `align-left` there.
- On an accordion root, a copied `is-dropdown-submenu-parent opens-left` on an item and `is-dropdown-submenu js-dropdown-active` on its submenu were stripped.
- `span[nfsSubmenuToggleText]` rendered `class="submenu-toggle-text"`.

### Triage

| Decision | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| 1, 2: roots and submenus host `NfsMenu`; the submenu binds `nested` and `vertical` | HIGH: consumer markup of five specs | HIGH: the Menu spec's measured decision 5; Foundation's Sass and JavaScript read; this ticket's probe | Decided |
| 3: Base side from `align()` through the root's factory | MEDIUM: one internal read, but the Dropdown Menu's documented alignment behaviour depends on it | HIGH: Angular's `getNodeInjectable` read; measured for a plain and a ResponsiveMenu-shaped root in a server render | Decided |
| 4: every-key class maps | MEDIUM: reverses D7; migration behaviour | HIGH: building-blocks 1.4; the Accordion re-run's styling-source reading; measured | Decided |
| 5: `[expanded]` replaces the seed | HIGH: the initial-state contract four plugin specs inherit | HIGH: building-blocks 1.4 names this seed; ADR 0039; a bound state was already an SSR smoke case | Decided |
| 6: `aria-current`, `nfs-menu`, the 1.4.1 fill checks | LOW for the checks (Sass, reversible); the current-page rule is the Menu spec's | HIGH: the Menu spec's 3:1 rule applied to the mode backgrounds; Foundation's defaults pass at 4.59:1; the dropdown top-level exclusion read from the specificity | Decided |
| 7: `span[nfsSubmenuToggleText]` | MEDIUM: a new public selector | HIGH: ADR 0039 names the class; Foundation's element | Decided |
| 7: `hybrid` keeps `booleanAttribute` | LOW: a transform change later breaks only typo'd templates | MEDIUM-HIGH: the glossary's Variant class definition and building-blocks 1.4's Option rule; no other spec types a behaviour boolean with `nfsVariantBoolean` | Decided |
| 8: development checks | LOW: development builds only | HIGH | Decided |
| 3: the `.top-bar-right` walk | LOW: unchanged behaviour | HIGH: projection reason from DI's declaration-site rule | Decided; the Top Bar spec may add a second source |
| 10: 22.0 correction | LOW | HIGH: the Menu ticket read the commit | Decided |

No item is HIGH impact with NOT-HIGH confidence, so nothing is `OPEN FOR HUMAN`, and no prototype is needed: the one new mechanism (the factory's `self` lookup of the hosted Menu) was measured here.

### Proposed shared-file changes (for the orchestrator)

Paths are relative to the effort root; links inside each quoted text are relative to the file it goes into.

1. `building-blocks.md` Table C, the Nested menu row: replace the row with

   > | Nested menu | `li[nfsMenuItem]`, `ul[nfsSubmenu]` (hosts `NfsMenu` exposing `align` and `iconPosition`; binds `nested` and `vertical`), `button[nfsSubmenuToggle]`, `span[nfsSubmenuToggleText]`; `nfsMenuModeToken` carrying `NfsMenuRoot`, created by `nfsMenuRootProviders(mode)` in each root, which hosts `NfsMenu` too | Directives on Foundation's nested menu markup, one per Structural class (1.1, [ADR 0039](adr/0039-directives-manage-every-foundation-class.md)) | Custom Angular directive family: no Aria pattern fits disclosure navigation (ADR 0004; `ngMenu` and `ngTree` apply roles the APG rejects for site navigation) | `nfsMenuModeToken`, `hostDirectives` with `NfsMenu` (read by the root with `{self: true}` for the dropdown Base side), `inert`, Foundation's `invisible`, `Directionality`, `_IdGenerator`, `afterRenderEffect`, `HostAttributeToken` in development builds only; in dropdown mode the Anchored pane's `nfsLightDismiss`, `nfsHoverIntent`, `nfsDocumentRect`, `nfsBodyBounds`, `nfsOverlap` | Disclosure Navigation Menu |

2. `building-blocks.md` Part 3 item 4: replace "(`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`, `nfsMenuModeToken`," with "(`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`, `nfsSubmenuToggleText`, `nfsMenuModeToken`," and append after "confirmed its swap commit ([ADR 0035](adr/0035-responsive-menu-swap-commit.md))." the sentence:

   > Every root and every submenu hosts the Menu directive, which binds `.menu` and the Menu's Variants ([Spec: Menu](issues/85-spec-menu.md)).

3. `building-blocks.md` 1.4, the "Initial state is bound, never read from a class" bullet: replace "the Nested menu's `is-active` seed (and the menus built on it)," with

   > the Nested menu's `is-active` seed (removed by the [Re-run: Nested menu (shared utility) spec under the class rule](issues/132-rerun-nested-menu-class-rule.md), which binds the item's `[expanded]` and reports a copied `is-active`; the menus built on it follow),

4. `building-blocks.md` 1.9, the "Hosting a class directive" bullet the [Spec: Menu](85-spec-menu.md) proposed (treated as applied): append

   > A helper that a factory provider creates on the hosting element reads the hosted directive the same way, because Angular runs a node provider's factory at the node that declares it: the Nested menu root reads the Menu's `align()` for the dropdown Base side (measured with Angular 22.2.0 in the [Re-run: Nested menu (shared utility) spec under the class rule](issues/132-rerun-nested-menu-class-rule.md)).

5. `building-blocks.md` 1.6 rule 3 and Tables A and B: no change from this ticket; their menu rows belong to the four plugin re-runs.

6. `CONTEXT.md`, **Base side**: replace its definition line with

   > The side, left or right, toward which a dropdown-mode submenu opens before the collision check moves it; set by `alignment`, the menu's `align` Variant (Foundation's `align-right` class), a `.top-bar-right` ancestor, and the reading direction.

7. `adr/0033-nested-menu-library-state-hooks.md`, Consequences, append

   > - 2026-09-28 ([Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md)): under the class rule ([ADR 0039](0039-directives-manage-every-foundation-class.md)) no consumer writes `is-active`, and the current page is `aria-current` on its link, so the second reason given against Foundation's `is-active` on the `li` no longer applies. The first still does: `.menu .is-active > a` would paint a Hybrid item's link with Foundation's active look whenever its section is open. The decision stands. A consumer stylesheet that themes the open state selects `[data-nfs-expanded]`, an attribute, which the class rule allows.

8. `adr/0035-responsive-menu-swap-commit.md`, Consequences, append

   > - 2026-09-28 ([Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md)): a section open at first paint is now only a bound `expanded`; the static `is-active` seed named in the second considered option is gone (building-blocks 1.4). The option's rejection stands on the `expanded` case.

9. `specs/menu.md` (for the [Spec: Menu](85-spec-menu.md); an amendment line in that ticket): in "Development checks and runtime checks", item 1, append

   > A copied class that the host still carries after the first render although `NfsMenu`'s record sets it `false` is bound by the hosting directive and is not reported: the Nested menu's `NfsSubmenu` binds `nested` and `vertical`, so Foundation's `class="menu vertical nested"` copied onto a submenu is redundant, not stripped.

   and in the browser-level "Hosting" case, after "keeps both classes", add "and a copied `class=\"menu vertical nested\"` on it raises no warning". Without this, a consumer migrating Foundation's docs markup gets two warnings on every submenu naming inputs the submenu does not expose.

10. `README.md`, Shared utilities, the Nested menu row: replace "Nested menu (`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`, `NfsMenuRoot`)" with "Nested menu (`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`, `nfsSubmenuToggleText`, `NfsMenuRoot`)".

11. `storybook-conventions.md` section 5, the `@include nfs-menu;` comment: replace "every menu--* story and every menu Plugin story" with "every menu--* story, every nested-menu--* story, and every menu Plugin story".

12. `research/out-of-scope-triage.md`, section 2, the bullet "The native lens's cross-links are left out: ...": append a dated correction

   > (2026-09-28, [Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md): under the class rule `.top-bar-right` is bound by the Top Bar's directive, not consumer-written; the ancestry read stays for a menu projected into a Top Bar section, which declaration-site DI would miss.)

13. `map.md`, Decisions so far: the gist line below; and in the line of the [Spec: Nested menu (shared utility)](56-spec-nested-menu.md), "computed host-class maps that never remove consumer classes" is superseded; suggested replacement: "computed host-class maps holding every owned class (copied Foundation classes are stripped since the class-rule re-run)".

### What other tickets need from this one

The four menu re-runs, exactly:

- Common to [Re-run: Accordion Menu spec under the class rule](112-rerun-accordion-menu-class-rule.md), [Re-run: Dropdown Menu spec under the class rule](113-rerun-dropdown-menu-class-rule.md), [Re-run: Drilldown Menu spec under the class rule](114-rerun-drilldown-menu-class-rule.md), and [Re-run: Responsive Menu spec under the class rule](115-rerun-responsive-menu-class-rule.md):
  1. The root hosts `NfsMenu` with `hostDirectives: [{directive: NfsMenu, inputs: ['orientation', 'expanded', 'simple', 'align', 'iconPosition']}]` and binds no `.menu` itself (Responsive Menu: item 4 below). Every `class="... menu"` on a root goes; `vertical` becomes `orientation="vertical"`, `align-right` becomes `align="right"`.
  2. Submenus are `<ul nfsSubmenu>` with no class: `menu`, `nested`, and `vertical` come from `NfsSubmenu` in every mode; `align` and `iconPosition` may be bound on a submenu, nothing else of the Menu. Class-mapping rows for `.menu`, `.nested`, `.vertical` on submenus point at `NfsSubmenu`.
  3. A section open at first paint is `[expanded]="true"` (or `[(expanded)]`) on its `li[nfsMenuItem]`; every user story, contract row, Rendered HTML block, story, SSR fixture, and test that opens a section with a static `is-active` changes to the binding; a copied `is-active` is stripped in every mode and reported by the Nested menu's development check naming `[expanded]`. No spec describes the old seed's `expandedChange(true)` emission.
  4. The current page is `aria-current` on its link (`routerLinkActive ariaCurrentWhenActive="page"` with the Router), never `is-active` on a leaf; rows that call a leaf `is-active` "consumer-written" and say it "survives" become "not bound; `aria-current` (the Menu spec, D4); a copied one is stripped and reported".
  5. A Hybrid toggle's name is `<span nfsSubmenuToggleText>...</span>`; class-mapping rows for `.submenu-toggle-text` point at `NfsSubmenuToggleText`.
  6. Sass: the consumer includes `@include nfs-menu;` after `foundation-menu`; the mode mixin's new 1.4.1 check of `$menu-item-background-active` (listed once in the Nested menu's Sass subsection) is part of the mixin the spec requires, with its Sass compile case.
  7. Class mapping tables get the Kind column; stories, fixtures, and examples write no class (controls outside the menu are `nfsButton`); the root's own classes (`accordion-menu`, `drilldown`, `dropdown`, the Drilldown root's `invisible`) stay each root's host bindings, and each spec says whether a copied one is reported (under building-blocks 1.4 a copy is stripped wherever its binding is `false`, which is every non-live mode of a ResponsiveMenu).
- Accordion Menu, besides: its user story 10 and the contract row "`.is-active` on a submenu at load | Seeds that item's `expanded`" become the `[expanded]` binding (Foundation's documented pre-open class is a Dropped behaviour); its Rendered HTML sentence "open at first paint from its static `.is-active`" follows; its fill check is against `$accordionmenu-item-background` when set.
- Dropdown Menu, besides: every place that reads the root's static `align-right` (user story 10, the `alignment` contract row and input row, development check (1)'s "its static `class` has no `align-right`", D9, the Rendered HTML line "With `class="dropdown menu align-right"`", the SSR fixture "a `.vertical` root with `class="... align-right"`", the browser-level Alignment case) becomes the root's `align="right"`, read by the Nested menu root from the hosted Menu; `rightClass` stays dropped. Its class-mapping row "`vertical` on submenus, consumer-written" goes (bound by `NfsSubmenu`), and `.top-bar`, `.top-bar-left`, `.top-bar-right` point at the [Spec: Top Bar](86-spec-top-bar.md)'s directives. It still decides the current top-level link's look (the Menu ticket handed it over): Foundation's `.dropdown.menu > li > a` background outranks `nfs-menu`'s rule when `$dropdownmenu-background` is set, so it chooses the look and checks that pair; a rule it adds is proposed as an amendment to the Nested menu's Sass list, the one list of menu-mixin rules. Its fill check here is against `$dropdownmenu-submenu-background`.
- Drilldown Menu, besides: the back item is `<li nfsDrilldownBack>` (its directive already binds `js-drilldown-back`) and the wrapper `<div nfsDrilldownWrapper>`, with no class; `class="vertical menu"` roots become `orientation="vertical"`; its fill check is against `$drilldown-background` and `$drilldown-submenu-background`.
- Responsive Menu, besides: its `hostDirectives` entries list no Menu input: one `NfsMenu` arrives through the three roots and a Menu input bound on the `ul` reaches it (measured in the Menu ticket and here); `class="vertical medium-horizontal menu"` becomes `[orientation]="{small: 'vertical', medium: 'horizontal'}"`; its swap stories and fixtures open sections with `[expanded]`, and its copy of ADR 0035's pre-opened-section example names only the binding.

Others:
- [Spec: Menu](85-spec-menu.md) (resolved): change 9 above, the development-check refinement for hosting directives that bind a Menu class themselves.
- [Spec: Top Bar](86-spec-top-bar.md) (in flight): the dropdown Base side reads a `.top-bar-right` ancestor after hydration, so its right-section directive must bind `.top-bar-right` as a static host class; if it also provides a lightweight token for a server-known Base side, the Nested menu root would read it as a second source for menus declared inside the section, keeping the walk for projected ones (D33).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no menu spec's example writes `menu`, `vertical`, `nested`, `is-active`, `align-*`, `submenu-toggle-text`, or `js-drilldown-back`; that every root's `hostDirectives` exposes the Menu's five inputs under the same names; that no menu spec keeps the static `is-active` seed; and that change 9 reached the Menu spec.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the Nested menu declares no Variant input, registry, or property; the Menu spec's rows cover the inputs the roots and submenus expose, so the manifest's `uses` lists them once, under `NfsMenu`.

### Gist for Decisions so far

- [Re-run: Nested menu (shared utility) spec under the class rule](issues/132-rerun-nested-menu-class-rule.md) -- every plugin root and every `ul[nfsSubmenu]` host `NfsMenu`, so the Menu binds `.menu` and its Variants (roots expose `orientation`, `expanded`, `simple`, `align`, `iconPosition`; submenus `align` and `iconPosition`) and the submenu binds `nested` and `vertical` in every mode; the dropdown Base side reads the hosted Menu's `align()` through `inject(NfsMenu, {self: true})` in the root's factory, measured in a server render; the class maps hold every owned class in every mode, so copied Foundation classes are stripped and reported; the static `is-active` seed gives way to `[expanded]`, the current page is `aria-current` only, `span[nfsSubmenuToggleText]` binds `.submenu-toggle-text`, and each mode mixin checks the current link's fill against its backgrounds (1.4.1); impact HIGH, confidence HIGH. Spec: [specs/nested-menu.md](specs/nested-menu.md).

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.

### Amendment, 2026-09-29 (in-family check lines)

From [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), building-blocks 1.9, and the family rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/nested-menu.md` was revised in place. The re-run's Answer holds the decisions and the triage.

- Hierarchy and DI shape gains the In-family lines. Every plugin root probes `NfsMenuItem` (a consumer contract of this utility; a root hosted by `NfsResponsiveMenu` probes from the responsive `ul`, because the child probe also counts the host record, so `NfsResponsiveMenu` calls with its name only). `NfsMenuItem` has a parent check over the four roots with the shared spec's sentence and probes `NfsSubmenu` and `NfsSubmenuToggle`; `NfsSubmenu` probes its items; `NfsSubmenuToggle` probes `NfsSubmenuToggleText`; `NfsSubmenuToggleText` has a parent check over `NfsSubmenuToggle`. `NfsMenuItem` and `NfsSubmenuToggleText` throw under `strictParents`; the required class lookups of the submenu and the toggle keep NG0201 as their report; `NfsMenuItem` to `NfsSubmenu` and the root to `nfsTopBarRightToken` stay optional.
- `nfsMenuModeToken` gets its development-only description, naming the four roots and their entry points.
- Development checks: check 3 keeps the non-hybrid toggle case, and a span outside any toggle is the parent check's report; check 4 says nothing for an item that holds an element carrying `nfsSubmenuToggle`, whose forgotten import the item's child probe reports; check 5's item case is the parent check's report. The browser-level warning cases gain the check 4 case.
- No API, class, ARIA, keyboard, rendering, or Sass change. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group d, applying the coordinator's decisions in [research/consistency-review-decisions.md](../research/consistency-review-decisions.md) and the forgotten-import checks spec's rules for family checks; `specs/nested-menu.md` was revised in place. The reviewer's record is [research/consistency-review-group-d.md](../research/consistency-review-group-d.md).

- R26: Library mixin rule 9 (`nfs-drilldown` on `.is-drilldown`) gains `overflow-wrap: break-word` beside `overflow: clip`, with its measured reason (a 27-letter word in a 250 px panel lost 31.3 px with the 1.4.12 spacing in three engines).
- R47: the 1.4.1 row says that an open nested Hybrid item's link in dropdown mode keeps Foundation's `.menu .is-active > a` fill, the Current link look, and shows its open state through its toggle's `aria-expanded` and the visible submenu (ADR 0042, dated note).
- R52: the family diagram's "consumers (other specs):" reads "consuming specs:", and the header cell of "What each consuming spec maps" reads "Consuming spec".
- R57: "an Application class" in the class-map test.
- CR-B: the mapping rows of the Nest and State classes point at the per-mode host tables under API (`NfsMenuItem`, `NfsSubmenu`), which stay the one copy.
- `nfsMenuModeToken`'s development description drops "a menu root:" and takes M7's form for a token several directives provide, as `nfsOpenableToken`'s does (the disclosure and carousel re-run asked the review to align the two).
- Unchanged, confirmed: R3, R4 (the exact-formula sentences; 4.65:1, with Foundation's 4.59:1 kept as its labelled false pass), R66, R69/R70, CR-A, CR-C, CR-D (no component example), and the navigation re-run's In-family lines (check 4 already says nothing for a toggle whose import was forgotten).

### Amendment, 2026-09-29 (audit 0008)

- L4, [Audit 0008: the class-rule wave](../audits/0008-class-rule-wave.md): `NfsSubmenuToggle` loses its `exportAs` (`nfsSubmenuToggle`); its only member is the `hybrid` input, no state or method to read (building-blocks 1.3).

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsSubmenuToggle` regains `exportAs: 'nfsSubmenuToggle'` (removed by audit 0008 L4) and `NfsSubmenuToggleText` gains `exportAs: 'nfsSubmenuToggleText'`.
