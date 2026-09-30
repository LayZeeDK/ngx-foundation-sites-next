# 108. Re-run: Tabs spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Tabs](16-spec-tabs.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/tabs.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

Also: `.tabs-content` gains its directive (TB7), and TB9's reason is restated (Foundation has no nav-bar form of Tabs).

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Tabs](16-spec-tabs.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5.

Spec: [specs/tabs.md](../specs/tabs.md), revised in place; the dated amendment is in [Spec: Tabs](16-spec-tabs.md) under `### Amendment, 2026-09-27 (class rule)`.

Gist: the Tabs directives now bind every Foundation class, so the consumer writes none. `ul[nfsTabs]`, `li[nfsTabsTitle]`, and `[nfsTabsPanel]` bind `.tabs`, `.tabs-title`, and `.tabs-panel` as static host classes. A new `[nfsTabsContent]` binds `.tabs-content`, provides nothing, and binds `.vertical` from the group's tab list, so Aria's `orientation` on the strip alone sets both `.vertical` classes, the arrow axis, and `aria-orientation`. `.simple` and `.primary` become the closed boolean Variant inputs `simple` and `primary`. Since the library now sets those two looks, it owns their WCAG 2.2 AA results. The `nfs-tabs` mixin gives `simple` titles a 24 by 24 px minimum and gives the selected tab on a `primary` bar the panel's colours (4.65:1 where Foundation's cascade gives 1.24:1 or 1.00:1), with a compile-time check. The mixin loses its nav-bar rule: the nav bar becomes a consumer recipe of Foundation's own tabs mixins on the consumer's class (TB9 holds, reason restated). Copied Foundation classes are stripped by the bindings and reported in development builds, per building-blocks 1.4's initial-state rule. Self-grilled against the sources below, with two cheap measurements (Dart Sass 1.104.1 under `D:/tmp/nfs-wave-108/`, no junction, nothing left running). Nothing is `OPEN FOR HUMAN`, and no prototype is needed.

### Decision log

Sources: ADR 0039, ADR 0040, and the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) ("81"); `research/out-of-scope-triage.md` ("triage", rows TB7 and TB9); `research/out-of-scope-exclusions.md` (TB1 to TB11); BB = `building-blocks.md` at HEAD (commit 46b7d0a, with the initial-state rule in 1.4); Foundation = `scss/components/_tabs.scss` and `docs/pages/tabs.md` in the 6.9.0 clone; Aria = `src/aria/tabs/*.ts` in the components 22.2.x clone; Router = `packages/router/src/directives/router_link_active.ts` in the angular 22.2.x clone; Sass = the two measurement scripts, compiled against Foundation 6.9's own settings file.

1. Q: Which classes did the spec leave to the consumer? A: The Structural classes `.tabs`, `.tabs-title`, `.tabs-content`, and `.tabs-panel` in every example; the Variant classes `.vertical` (on strip and content box), `.simple`, and `.primary`; the nav bar's `.tabs`, `.tabs-title`, and `routerLinkActive="is-active"`; and the equal-heights recipe's `.tabs-content` and `.tabs-panel` selectors. The State class `.is-active` was already a host binding. Source: `specs/tabs.md` before this revision (class mapping, Rendered HTML, Usage examples); Foundation `_tabs.scss:143-193`.
2. Q: Structural classes: how bound? A: Each directive binds its class as a static host class (`class="tabs"` and so on), so it is in the server HTML and merges with a consumer's own class. `a[nfsTab]` and `[nfsTabsGroup]` bind none, since Foundation gives neither element a class. Source: ADR 0039; BB 1.1, 1.3.
3. Q: `.tabs-content` (TB7): which directive, and what does it own? A: `[nfsTabsContent]` binds `.tabs-content`, and `.vertical` while the tab list is vertical, and provides nothing, so Aria's `TabPanel` still finds `TABS` on the group. That is the triage row's "class only, with no providers Aria can see", extended by the one Variant Foundation gives the element (`.tabs-content.vertical`, `_tabs.scss:186-188`). It injects `nfsTabsGroupToken` as a required dependency: a content box outside a group has no working panels. Source: triage section 2, TB7 row (LOW, HIGH); ADR 0039; Aria `tab-panel.ts` (injects `TABS`).
4. Q: How does the content box learn the orientation without an input of its own? A: `NfsTabs` registers with `NfsTabsGroup` in `ngOnInit`, where Aria's `TabList` registers with Aria's `Tabs` (Aria `tab-list.ts:169-170`). Aria's own reference is the underscore member `_tabList` (Aria `tabs.ts`), which the library does not use. `ngOnInit` runs before host bindings are refreshed in the same pass, so the class is right during the server render wherever the content box sits relative to the strip, and the read is a signal read. Rejected: an `orientation` input on the content box (two inputs that can disagree, which would need a check); reading Aria's `_tabList`.
5. Q: Variant families: names and types? A: Three families, all closed.
   - `.vertical` is Aria's `orientation`, `'horizontal' | 'vertical'` (81's naming rule 2, and 81 names Tabs explicitly: "Tabs: `orientation` now binds `.vertical`").
   - `.simple` and `.primary` are booleans named after their classes (rule 4), through `nfsVariantBoolean`, never `booleanAttribute`.
   - They are not one enum, because Foundation's two rules are independent and combine (`_tabs.scss:154-176`).
   - Foundation has no responsive Tabs class, so no family takes a Breakpoint query or rules object.
   - There is no registry and no Variant property, so the runtime check has nothing to read.
   - No Variant is in `nfsTabsDefaultsToken` (BB 1.4).
   - Source: ADR 0040; BB 1.4; 81, "What the 25 spec tickets and 26 re-run tickets need to know".
6. Q: Does the authoring rule (explicit alias type arguments, the typings assertion) apply to `orientation`? A: No. Aria declares that input, and the library only exposes it through `hostDirectives`, so its emitted type is Aria's literal union and names no library alias. The rule applies to inputs the library declares (`simple`, `primary`: `input<boolean, NfsVariantBoolean>`). A building-blocks note is proposed below, so that the tooling spec's assertion skips such inputs.
7. Q: What happens to the dev check that compared a written `.vertical` with `orientation`? A: It is dropped as a comparison (81: "its development check for a disagreeing class goes away"). It is replaced by the copied-class check of BB 1.4's initial-state rule (item 8).
8. Q: Initial state and copied classes (the coordinator's new rule, BB 1.4, from the Accordion re-run)? A: Initial state is bound: `selected` or the first-tab default for the tab, and the three Variant inputs for the looks. No directive reads a static Foundation class.
   - A class copied from Foundation's markup that a directive binds dynamically is stripped on server and client: `is-active` on a title or a panel, `vertical`, `simple`, or `primary` on the strip, or `vertical` on the content box.
   - `NfsTabs`, `NfsTabsTitle`, `NfsTabsContent`, and `NfsTabsPanel` read their host's static `class` through `HostAttributeToken('class')` in development builds only, and each warns once, naming the input to bind.
   - Redundant Structural classes merge and are not reported.
   - Source: BB 1.4 (commit 46b7d0a); `specs/accordion.md` dev check 7 and D25.
9. Q: Does the library now own the `simple` look's target size? A: Yes. ADR 0039 has each directive own the WCAG 2.2 AA work its documented markup lacks, and the map's accessibility rule forbids leaving a criterion as a recommendation.
   - Measured: Foundation compiles `.tabs.simple > li > a { padding: 0; }` over `.tabs-title > a { font-size: 0.75rem; line-height: 1; }`, so titles are 12 px tall. Stacked vertically they have no spacing, and 2.5.8 fails outright.
   - Decided: `nfs-tabs` emits `.tabs.simple > li > a { min-width: 24px; min-height: 24px; }`, meeting the criterion by size as BB 1.10 asks. These are the same two declarations as the Button's `.button` floor.
   - Rejected: the spacing exception (fails vertically; horizontally it depends on neighbouring targets above and below); a transparent hit-area pseudo-element (stacked 12 px titles leave no room for one per title).
10. Q: The `primary` look's contrast? A: Measured with Dart Sass 1.104.1 against Foundation's settings file.
    - Foundation's cascade paints the selected tab on a primary bar `$tab-background-active` behind `color-pick-contrast($primary-color)`, because `.tabs.primary > li > a` sets the colour at higher specificity.
    - Under Foundation's defaults that is `#fefefe` on `#e6e6e6`, 1.237:1 text (1.4.3 fails), and 3.755:1 against the bar.
    - Under the required settings (D17) it is 4.647:1 text but 1.000:1 against the bar (1.4.11 fails).
    - A single `$tab-background-active` that passes both strips must be at least 3:1 against `$primary-color` and still carry white text at 4.5:1, so only dark values work (`$black`: about 4.2:1 against the bar). That changes every consumer's selected tab.
    - Decided: `nfs-tabs` emits `.tabs.primary > li > a[aria-selected='true'] { background: $tab-content-background; color: $tab-color; }`, 4.647:1 for text and 4.647:1 against the bar under both setting sets, so D17 stays for plain strips.
    - The mixin stops the compile with `@error` when `$tab-content-background` is under 3:1 against `$primary-color`, by the unrounded `color-luminance()` ratio (BB 1.10 for a state pair; ADR 0022). A draft of the mixin compiled cleanly and stopped at 1:1 for `$tab-content-background: $primary-color`.
    - The rule's specificity equals Foundation's `.tabs.primary > li > a:focus`, and the rule comes later, so a focused selected tab keeps the selected look plus the browser outline. An unselected focused tab keeps Foundation's `smart-scale` background: 5.058:1 text.
    - Rejected: the stricter setting above; the old sentence that left `.primary` to the consumer's own axe run.
11. Q: The nav bar (TB9) under the class rule? A: TB9 holds: there is no nav-bar directive, because Foundation has no nav-bar form of Tabs (its Tabs page documents only the tab pattern).
    - The old recipe wrote `.tabs`, `.tabs-title`, and `is-active`, which the consumer may no longer write, and the library's `nfs-tabs` rule was keyed on `.tabs-title`.
    - Decided: the recipe becomes consumer Sass. Foundation's documented `tabs-container` and `tabs-title` mixins go on the consumer's own class (`_tabs.scss:57-108`), plus the recipe's own `a[aria-current]:not([aria-current='false'])` rule with `$tab-background-active` and `$tab-active-color` (4.65:1 under the required settings).
    - The links use a bare `routerLinkActive` with `ariaCurrentWhenActive="page"`, which sets no class (Router `:209-215` filters empty class tokens) and only `aria-current` (`:241-245`).
    - The library's nav-bar rule is removed.
    - Rejected: a nav-bar directive binding `.tabs` and `.tabs-title` (the triage's native and accessibility lenses; library API for a form Foundation does not document); dropping the recipe (loses the use case, and the recipe costs the library nothing).
    - Source: triage section 3, TB9 row (LOW, HIGH); Foundation `docs/pages/tabs.md:9-13`.
12. Q: Does Tabs still have a Library mixin? A: Yes. `nfs-tabs` keeps two rules and one compile-time check, both for Variant looks. It writes no Variant properties (every family is closed), and plain strips do not depend on it. Source: ADR 0012, dated notes; BB 1.13.
13. Q: The equal-heights recipe (TB2's replacement)? A: The consumer's own class goes on `[nfsTabsContent]`, and the selectors are `.equal-heights > [role='tabpanel']` and `[inert]`, so the recipe names no Foundation class. Specificity (0,2,0) beats Foundation's `.tabs-panel { display: none; }`, and `role` and `inert` are in the server HTML.
14. Q: The grid in Foundation's vertical layout? A: The XY Grid spec is still open, so the examples and `tabs--vertical` use the names BB 1.3 and 1.4 give (`nfsGridX`, `nfsCell` with `[size]="{medium: 3}"`), flagged as pending the [Spec: XY Grid](99-spec-xy-grid.md). `nfsTabsGroup` sits on the row's element.
15. Q: Tests? A: Two stories are added, `tabs--simple` (24 px boxes) and `tabs--primary` (3:1 against the bar, axe `color-contrast`). No story, host, or fixture writes a class, except the copied-class case.
    - Browser level: the class bindings, a consumer class kept, `.vertical` following `orientation` at runtime with the content box on either side, `simple`/`primary` values, the content box outside a group, initial state with `selected`, and the copied-class check.
    - SSR smoke: every bound class, with a vertical set whose content box precedes its strip and a set with `simple` and `primary`.
    - Node level: the copied-class token test, and a Sass compile of `nfs-tabs`.
    - e2e: `tabs--simple` horizontal and vertical box geometry in three engines, because axe reports roving-tabindex targets only as incomplete (BB 1.10).
    - No runtime-check case, since there is no open family.
16. Q: Glossary or ADR? A: Neither.
    - Glossary: no new term; **Tab group** still reads exactly.
    - ADR: no decision here meets all three bars. The content box's derivation, the nav-bar recipe, and the two Sass rules are reversible without breaking consumers, and each follows from ADR 0039, ADR 0040, BB 1.4, or BB 1.10 rather than a fresh trade-off. ADR 0023 still holds as written.

### Triage

| Item | Impact | Confidence | Result and evidence |
| --- | --- | --- | --- |
| `[nfsTabsContent]` binds `.tabs-content` and `.vertical`, provides nothing | HIGH: consumer markup | HIGH: ADR 0039; the triage's TB7 row; Aria's `TABS` lookup unchanged | Decided |
| `orientation` binds `.vertical` on strip and content; `simple` and `primary` are closed booleans | HIGH: public API | HIGH: ADR 0040 naming rules 2 and 4; 81's explicit Tabs line; Foundation's Sass shows the classes combine | Decided |
| Copied-class check replacing the `.vertical` comparison | LOW: development builds only | HIGH: BB 1.4 initial-state rule; the Accordion spec's dev check 7 | Decided |
| `simple` 24 px floor in `nfs-tabs` | LOW: one Sass rule, reversible | HIGH: compiled 12 px titles; BB 1.10 (by size); the Button's floor | Decided |
| `primary` selected-tab rule and its compile-time check | LOW: Sass, reversible, no API | HIGH: Dart Sass 1.104.1 ratios; specificity read from the compiled CSS; the draft mixin compiled and stopped as specified | Decided |
| Nav bar as a consumer recipe of Foundation's mixins; no directive, no library rule | LOW: no API; a directive can be added later without breaking | HIGH: TB9 holds (triage); the class rule forbids the old recipe's classes; Foundation's mixins are public | Decided |
| XY Grid directive names in examples | LOW: examples only | MEDIUM: names derived from BB 1.3 and 1.4 before the XY Grid spec exists | Decided; the consistency review aligns them |

No trap-quadrant item. Nothing is `OPEN FOR HUMAN`.

### Dissent

- The triage's native and accessibility lenses (TB9): a class directive for the nav bar. Not adopted. Foundation has no nav-bar form of Tabs, so such a directive is library API with no Foundation contract behind it, and the consumer recipe gives the same look with no library code. Reopens if the Menu or Top Bar specs find page navigation that needs the tabs look inside a library-owned structure.
- Against D23, the plain strip's own principle ("settings, never library CSS", D17): the `primary` rule is the one place where library CSS fixes contrast. No single setting serves both strips without turning every selected tab dark. Reopens if Foundation adds a setting for the selected tab on a primary bar.

### Prototype needed

None. The two open measurements, the `simple` title boxes in three engines and the `primary` computed backgrounds, are the new e2e and play-function cases.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table A, Tabs row: replace the second and third cells with:

   "`[nfsTabsGroup]` on a consumer element enclosing strip and content (hosts `ngTabs`); `ul[nfsTabs]` (hosts `ngTabList`; binds `.tabs`, and `.vertical` from Aria's `orientation`; Variant inputs `simple` and `primary`); `li[nfsTabsTitle]` (binds `.tabs-title`, and `.is-active` from its child tab); `a[nfsTab]` (hosts `ngTab`, `value` required, no `href`); `[nfsTabsContent]` (binds `.tabs-content`, and `.vertical` from the group's tab list; provides nothing); `[nfsTabsPanel]` (a directive hosting `ngTabPanel`, `value`; binds `.tabs-panel` and `.is-active`); optional `ng-template[nfsTabsLazyContent]`"

   and

   "Directives only (1.1 case 2 resolved: `[nfsTabsPanel]` is a directive), one per Structural class (ADR 0039); the group wrapper exists because Aria requires a common ancestor and Foundation's list and content are siblings"

2. `building-blocks.md`, Table B, Tabs row: replace the DI shape cell with:

   "`nfsTabsGroupToken` (hosts Aria `TABS`; registry of the tab list, for `[nfsTabsContent]`'s `.vertical`, and of the panels, for deep links), `nfsTabsToken` (hosts `TAB_LIST`, tab stop); `nfsTabsTitle` reads its child `nfsTab` via `contentChild` for `.is-active`; panels pair by `value`; `nfsTabsDefaultsToken` with library-owned options only, never a Variant"

   and in the Material counterpart cell replace "nav bar as links with `aria-current` and one `nfs-tabs` rule (no `focusMode`)" with "nav bar as links with `aria-current`, a consumer recipe of Foundation's `tabs-container` and `tabs-title` mixins with no library rule (no `focusMode`)".

3. `building-blocks.md` 1.13, replace "Tabs has an `nfs-tabs` Library mixin with one nav-bar rule (the `aria-current` link state, [Spec: Tabs](issues/16-spec-tabs.md))." with:

   "Tabs has an `nfs-tabs` Library mixin with two Variant rules, a 24 by 24 px minimum for `simple` titles and the selected tab's colours on a `primary` bar, and a compile-time contrast check of that bar pair; its nav bar is a consumer recipe of Foundation's `tabs-container` and `tabs-title` mixins with no library rule ([Spec: Tabs](issues/16-spec-tabs.md))."

4. `building-blocks.md` 1.4, the Authoring sub-bullet of Variant inputs, append:

   "An `@angular/aria` input that a wrapper exposes through `hostDirectives` as a Variant input (Tabs `orientation`) keeps Aria's declared type: the library does not declare it, so the alias rule and the typings assertion apply only to the inputs the library declares ([Spec: Tabs](issues/16-spec-tabs.md))."

5. `building-blocks.md` 1.10, the state-indicator bullet: replace "(Tabs: `$tab-background-active: $primary-color; $tab-active-color: $white;`, checked for 3:1 between selected and unselected tab backgrounds)" with:

   "(Tabs: `$tab-background-active: $primary-color; $tab-active-color: $white;`, checked for 3:1 between selected and unselected tab backgrounds; on a `primary` bar the `nfs-tabs` rule gives the selected tab the panel's colours, and its compile-time check covers the pair against the bar)"

6. `storybook-conventions.md` section 5, after the bullet on `_settings-overrides.scss`, a new bullet:

   "- Recipe CSS: a spec that documents consumer CSS and shows it in a story puts it in `preview.scss` after the Library mixins, one block per recipe on the recipe's own classes (never a Foundation or NFS class), with a comment naming the spec and the story. Tabs: `tabs--nav-bar` (`.account-tabs`, Foundation's `tabs-container` and `tabs-title` mixins plus the recipe's `aria-current` rule) and `tabs--equal-heights` (`.equal-heights`)."

7. No change to `CONTEXT.md`, the ADRs, `README.md`, or the map beyond the Decisions-so-far line below.

### What other specs need from this one

- [Re-run: Responsive Accordion Tabs spec under the class rule](111-rerun-responsive-accordion-tabs-class-rule.md):
  - Its tabs-mode template writes `div[nfsTabsContent]` in place of `div.tabs-content`, and no class on the Tabs directives' hosts, which bind `.tabs`, `.tabs-title`, `.tabs-content`, and `.tabs-panel` themselves.
  - Its class-mapping row "the `.tabs-content` class" becomes `NfsTabsContent`.
  - Its Sass sentence "its `nfs-tabs` mixin only styles nav bars and is not needed here" becomes "its `nfs-tabs` mixin styles only the `simple` and `primary` looks, which this component does not expose, so it is not needed here". If the re-run exposes either look, it passes it to `NfsTabs` and requires `nfs-tabs`.
  - Its out-of-scope line on vertical tabs keeps its reason; `orientation` alone would now set both `.vertical` classes.
- [Spec: XY Grid](99-spec-xy-grid.md): Tabs' vertical examples and `tabs--vertical` put `nfsTabsGroup` on the row's element and use `nfsGridX`, `nfsCell`, and `[size]="{medium: 3}"`, as BB 1.3 and 1.4 name them. The row directive must provide nothing that shadows `nfsTabsGroupToken` or Aria's `TABS`. If the XY Grid spec names its directives otherwise, the consistency review aligns Tabs.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): Tabs declares no registry and writes no Variant property. `ngx-foundation-sites/tabs` imports `nfsVariantBoolean` at run time from the primary entry point. The typings assertion skips `orientation`, an Aria input exposed through `hostDirectives` (change 4).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check the XY Grid names in the Tabs examples and the recipe-CSS convention (change 6). One gap predates this ticket and is not changed here: ADR 0022's first consequence promises a compile-time signal to a consumer who keeps a failing Foundation default, but `nfs-tabs` checks only the `primary` pair, not D17's plain-strip pairs. The review decides whether `nfs-tabs` adds that check.

### Gist for Decisions so far

- [Re-run: Tabs spec under the class rule](issues/108-rerun-tabs-class-rule.md) -- the Tabs directives bind `.tabs`, `.tabs-title`, `.tabs-content` (new `[nfsTabsContent]`, providing nothing), and `.tabs-panel`. Aria's `orientation` alone sets `.vertical` on the strip and the content box; `simple` and `primary` are closed boolean Variant inputs. `nfs-tabs` now gives `simple` titles a 24 px floor and the selected tab on a `primary` bar the panel's colours (4.65:1, compile-time check), and drops its nav-bar rule: the nav bar is a consumer recipe of Foundation's tabs mixins (TB9 holds). Copied Foundation classes are stripped and reported in development. All decided, confidence HIGH.

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.

### Amendment, 2026-09-29 (in-family check lines)

From [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) and the family rule of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/tabs.md` was revised in place. The API, the markup, ARIA, keyboard, rendering modes, and Story ids do not change.

- Hierarchy and DI shape gains the In-family lines: `NfsTabsGroup` probes `NfsTabs`, `NfsTabsContent`, and `NfsTabsPanel`; `NfsTabs` probes `NfsTabsTitle` and `NfsTab`; the title, the tab, the content box, and the panel probe nothing. Every parent injection is required, so no part has a parent check and `strictParents` changes nothing. Tabs and panels are peers paired by `value`. `NfsTabsLazyContent` sits on `ng-template` and calls nothing.
- `nfsTabsGroupToken` and `nfsTabsToken` carry development-only descriptions naming `NfsTabsGroup` and `NfsTabs` and `ngx-foundation-sites/tabs`.
- Recorded: the strip, the tab, and the panel host Aria's `TabList`, `Tab`, and `TabPanel`, which require Aria's `TABS` or `TAB_LIST`, and host directives are constructed before their host, so a missing or forgotten group or strip throws Aria's NG0201, which names no library directive; the library's descriptions are printed where its injection fails first (`NfsTabsContent` outside a group, or a part under a consumer's own Aria `ngTabs` or `ngTabList`), and the static check names the import.
- The tab's warning for a parent element that is not an `li[nfsTabsTitle]` reads the element and the attribute, so a title whose import was forgotten is reported once, by the strip's probe; a browser-level case asserts it.

Triage: impact LOW (development-only checks and messages), confidence HIGH (ADR 0046, building-blocks 1.9, the shared spec's rule, the directive composition guide's execution order, and Aria's `tab-list.ts`, `tab.ts`, and `tab-panel.ts`, which inject `TABS` and `TAB_LIST` without `optional`). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group e, applying [its decisions](../research/consistency-review-decisions.md) and the review's checks CR-A to CR-D; `specs/tabs.md` was revised in place, and [the group's report](../research/consistency-review-group-e.md) lists every edit.

- R4: the bar pair's check names the exact unrounded ratio of the library's internal contrast helper (the 1.4.11 row and the Sass subsection); `color-luminance()` leaves the reused functions; the canonical sentence S1 joins the Sass subsection. Figures stand.
- R45: `nfs-tabs` also stops the compile on every strip (`$tab-color` against `$tab-background`, its hover colour against `$tab-item-background-hover`, `$tab-active-color` against `$tab-background-active`, `$tab-background-active` against `$tab-background`, and the `primary` bar's picked text against the bar), so every application with a tab strip includes it: the Sass items (1), (2), and (5), the 1.4.3 and 1.4.11 rows, the Solution and the Sass summary, the compile test, D17, and new D26.
- R57: "application class" is written "Application class".
- The DOM-placement rule of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md): the tab-title warning's In-family sentence names the rule it follows (an `li` that carries `nfsTabsTitle` without `.tabs-title` is a forgotten import, which the strip's probe reports once).
- CR-D: `app-product`'s `imports` also list the two components its template writes (`AppReviewList`, `AppStatsChart`).
- Unchanged (confirmed): R27, R44, R46, R69/R70; CR-A and CR-C hold.

Triage: impact LOW (a library-internal Sass check and an include line; no API, ADR 0045), confidence HIGH (ADR 0022's first consequence, building-blocks 1.10). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review, closing pass)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), closing pass:

- `specs/tabs.md`: `NfsTabsGroup`, which has no inputs, outputs, or public methods, has no `exportAs`, by R17's rule, which the closing pass extends to every directive whose public members are only inputs and outputs (building-blocks 1.3, 2026-09-29).

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsTabsGroup` regains `exportAs: 'nfsTabsGroup'` (removed by the consistency review's closing pass, above); `NfsTabsTitle`, `NfsTabsContent`, and `NfsTabsLazyContent` gain one for the first time (`nfsTabsTitle`, `nfsTabsContent`, `nfsTabsLazyContent`); `NfsTabs`, `NfsTab`, and `NfsTabsPanel` already had theirs.

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group e](169-rerun-specs-without-checks-group-e.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/tabs.md` was revised in place. The spec describes and accepts a Tabs family with no checks: each rule a check enforced is now documented usage in its API text and its six usage rules.

What left the spec, per check, and where its rule now stands:

- Forgotten-import: the In-family lines of all seven directives (their `nfsDirectiveCheck` calls, the strip's and group's probes, `strictParents`), the `NfsTabsLazyContent` note, and the static check's NFS9001 -- usage rule 1: `[nfsTabsGroup]` encloses the strip, the content box, and every panel, and every tab sits inside the strip. The NG0201 facts stay in Hierarchy and DI shape as Angular's report: Aria's `TabList`, `Tab`, and `TabPanel` inject `TABS` or `TAB_LIST` without `optional`, so a part outside its parent throws Aria's NG0201, and the library's tokens name themselves where their injection fails first. [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md)
- Forgotten-import: the development-only descriptions of `nfsTabsGroupToken` and `nfsTabsToken` (M7) -- each token's description is now its plain name (`new InjectionToken<NfsTabsGroup>('nfsTabsGroupToken')`). [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md)
- Family check: the `NfsTab` warning for a tab whose parent element is not an `li[nfsTabsTitle]` -- usage rule 2 and the `NfsTab` bullet: every `a[nfsTab]` is the direct child of an `li[nfsTabsTitle]`. [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md)
- Misuse warning: `href` on a tab -- usage rule 2 and the `NfsTab` bullet: a tab carries no `href`. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse warning: a tab list with no accessible name -- usage rule 3 (WCAG 4.1.2); the ARIA table and the 4.1.2 row cite it. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse warning: a generated panel id under `deepLink` -- usage rule 4 and Deep linking item 4, which now gives the reason (a generated id differs between the server and the browser). [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse warning: a static `autoFocus` attribute on the strip, with its development-only `HostAttributeToken('autoFocus')` read -- usage rule 5, the `autoFocus` API row (unchanged), and D25, whose rationale now carries the WebKit and client-rendering hazard that its rejected alternative "the null binding without the report" used to state. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse warning: the copied-class check on `NfsTabs`, `NfsTabsTitle`, `NfsTabsContent`, and `NfsTabsPanel`, with its development-only `HostAttributeToken('class')` reads -- usage rule 6 names the input for each copied class; the bindings still strip a copy. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Build-time check: the `nfs-tabs` `@error` checks (`$tab-content-background` against `$primary-color`, D23; every strip's text, hover, selected-text, and selected-look pairs and the primary bar's picked text, D26) -- the Sass section's required settings now list every pair, the 1.4.3 and 1.4.11 rows state them as documented usage for a consumer's own theme, D17, D23, and D26 decide the pairs instead of the checks, and `nfs-tabs` keeps its two rules. [Spec: build-time checks (later milestone)](163-spec-build-time-checks-later-milestone.md)
- Mentions rewritten: the Solution's `nfs-tabs` sentence (the plain strip no longer needs the include; an application that uses neither `simple` nor `primary` may leave it out); user story 24 (now asks for the documented rules); the `.is-active` mapping row, the Variant paragraph, and the "nothing for the runtime check to read" clause; the `NfsTabsContent` API text, the primitives list, the render-hooks paragraph, and the before-hydration bullet (the development-only reads); the Sass and custom CSS paragraph; the testing preamble's copied-class and runtime-check sentences; the browser-level copied-class case (now asserts stripping only) and the removed development-warning case; the pure-logic copied-class test (removed: only the check used it); the Sass compile test (now asserts the two rules only); the Out of Scope line on static classes; D2's and D21's rejected alternatives; D24; the Sass section's items (1) and (5); Foundation behaviour changed or dropped.

Kept: the required injections and their NG0201 (Aria's and the library's), the ARIA and keyboard tables, the typed Variant inputs, the `nfs-tabs` rules, Aria's own duplicate-value warning, and every story, browser-level, node-level, and e2e case of behaviour and accessibility, the play functions' 3:1 assertions included.

Triage: impact LOW (development messages and compile stops become documented usage; `nfs-tabs` becomes optional for a plain strip, a narrowing of when to include it that changes no emitted CSS; no API, behaviour, or story changes), confidence HIGH (the ruling; the group e manifest). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-30 (later-milestone families)

From [Re-run: specs without the later-milestone families, group c](178-rerun-specs-without-later-families-group-c.md), under [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md); `specs/tabs.md` was revised in place.

- Rendered HTML and Usage examples: both vertical-tabs examples write Foundation's `grid-x`, `cell medium-3`, and `cell medium-9` as normal classes (Foundation's docs layout) with `nfsTabsGroup` on the `grid-x` row, in place of the XY Grid directives and their `size` rules objects; the link to the XY Grid spec is gone.
- Story `tabs--vertical`: the XY Grid classes are written as normal classes, the story's only Foundation classes.
- Sass: the vertical layout's grid classes come from Foundation's global styles, `foundation-xy-grid-classes` among them.

Triage: impact LOW (examples, stories, and documented usage change; no input, default, or rule of this spec changes), confidence HIGH (the ruling's decisions 2 and 3: a family with no first-milestone spec is written as Foundation's normal classes, with Foundation's global styles loaded). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-30 (audit 0010)

From [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md); `specs/tabs.md` was revised in place:

- L1: the headline no-class sentence is narrowed to families with a first-milestone spec, naming the vertical layout's XY Grid classes written as normal classes.
