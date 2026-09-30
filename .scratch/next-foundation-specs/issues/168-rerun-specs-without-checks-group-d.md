# 168. Re-run: specs without checks, group d

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) has every spec describe, and accept, a library with no checks. What do `specs/nested-menu.md`, `specs/off-canvas.md`, `specs/orbit.md`, `specs/pagination.md`, `specs/progress-bar.md`, `specs/prototyping-utilities.md`, `specs/responsive-accordion-tabs.md`, `specs/responsive-embed.md`, `specs/responsive-menu.md` say without them?

## How to work it

Opus 5.5, AFK under the map's triage rule. For each spec, from its extraction manifest in [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and a full read: remove every check of the five kinds, its messages, its tests and stories, and every sentence that relies on one (a parent check, a probe, `strictParents`, `nfsDirectiveCheck`, a Runtime check, a Library mixin's `@error`); state each rule a check enforced as documented usage, in the spec's API text, usage section, and the JSDoc it asks for; give each injection token its plain name as its description; keep the Library mixins' CSS rules and Variant properties, the required injections, ARIA, typed inputs, and the library's own tests of its components. No spec names a deferred check or links to a deferred spec; a forgotten import, a part outside its parent, or a misuse simply gets no warning. Each changed spec gets a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` in the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`.

## Answer

Worked AFK on Opus 5.5 under the map's triage rule, from [research/checks-extraction-d.md](../research/checks-extraction-d.md) (the checklist) and a full read of each spec at 53144f3, following the orchestrator's conventions from the finished re-runs (its wave notes, points 1 to 4: a mixin keeps its CSS rules and Variant properties; a read or property only a check used goes; In-family bullets become "Imports (documented usage)" bullets; a former compile stop becomes a required setting). The nine specs describe and accept a library with no checks; each governing ticket holds a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` that lists what left the spec, per check: [Spec: Pagination](87-spec-pagination.md), [Spec: Progress Bar](95-spec-progress-bar.md), [Spec: Responsive Embed](96-spec-responsive-embed.md), [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md), [Re-run: Responsive Accordion Tabs spec under the class rule](111-rerun-responsive-accordion-tabs-class-rule.md), [Re-run: Responsive Menu spec under the class rule](115-rerun-responsive-menu-class-rule.md), [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md), [Re-run: Orbit spec under the class rule](125-rerun-orbit-class-rule.md), and [Re-run: Nested menu (shared utility) spec under the class rule](132-rerun-nested-menu-class-rule.md).

### Decisions

1. Every development-check subsection becomes a Documented usage subsection (or, in Responsive Accordion Tabs, a subsection after the Behaviour rules) with numbered rules at the place the checks stood. Its first sentence names which directive's JSDoc states which rule and says the directives read none of it, so markup that departs from a rule renders as written, with the result the rule names. Each rule is the manifest's "Rule as documented usage", reworded to carry the check's reason; where a spec already cited check numbers (Off-canvas 1 to 10, Orbit 1 to 8), the rule numbers follow them, so the cross-references become "Documented usage, n".
2. Every In-family bullet becomes an "Imports (documented usage)" bullet that says what a directive left out of the imports does: NG8001 for an element selector, NG8002 for a bound input, NG8003 for an `exportAs` reference, NG0201 for a missing required parent, and otherwise plain markup with no class or behaviour and no error (Pagination, Progress Bar, Prototyping Utilities, Responsive Accordion Tabs, Responsive Menu, Off-canvas, Orbit, Nested menu).
3. Four injection tokens take their plain name as their description: `nfsOrbitToken`, `nfsProgressToken`, `nfsOffCanvasContentToken`, `nfsMenuModeToken`.
4. Required parent injections stay, with NG0201 as Angular's report: the Orbit's seven behaviour parts, `NfsProgressMeter`, `NfsProgressMeterText` (its reason, a text outside a meter centred on an unrelated box, stands without the overflow check), `NfsSubmenu`, and `NfsSubmenuToggle`. Development-only lookups that served only a check go: the Pagination items' lookup of `NfsPagination`, the Orbit's five class-only directives' lookup of `nfsOrbitToken`, and `NfsSubmenuToggleText`'s lookup of its toggle; those directives now inject nothing.
5. Every `HostAttributeToken('class')` read, `ElementRef` injection, and `ngDevMode`-only render callback that existed for a check goes; the copied-class stripping by bindings stays, with its tests. The Off-canvas Scroll lock keeps removing a copied `body.is-off-canvas-open`; only its report goes.
6. Library mixin `@error` and `@warn` checks become required settings in the Sass subsection and the WCAG rows, with Foundation's default figures and the exact-formula caution, and without "the library's helper" where the helper served only a check (Progress Bar's meter text pick keeps its exact ratio, because the pick is a CSS rule). No mixin in this group held only checks, so none disappears. Each mixin's reused-settings list keeps only what its rules read (Pagination, Off-canvas, Orbit, Nested menu).
7. Runtime checks become a documented-usage rule: a Variant value names what the compiled CSS generates, the Variant declaration file is regenerated with the Sass, and the mixin is included. Every Variant property the Variant declaration tooling reads stays. The Prototyping Utilities' sixteen flag properties (`--nfs-prototype-<flag>-breakpoints`), which only the Runtime checks read and the Variant manifest never listed, go (wave note 2); D19 now records that the attribute types do not depend on the flags and that the documented usage names each family's flag.
8. User stories are rewritten in place and keep their numbers; none is deleted. Decision rows are rewritten to the documented usage or the required setting; one row is removed, Pagination D11 (the checks' render timing), and the other numbers are kept so citations from other documents stay valid.
9. A check that another spec owns and a spec of this group quoted is removed from the quoting spec, not restated as a check: the Accordion's and Tabs' checks and the `nfs-accordion` and `nfs-tabs` contrast checks (Responsive Accordion Tabs); the Menu's, Nested menu's, Drilldown's, and Dropdown Menu's checks, `nfs-top-bar`'s `@error`, and `openPath()`'s warning (Responsive Menu); the `nfs-dropdown-menu` `@warn` checks for the reflow width and the Top Bar pairs, `nfs-top-bar`'s `@error`, and the Menu's check 2 (Nested menu); the Close Button's name and page-background checks and `nfsMenuIcon`'s name and missing-include checks (Off-canvas). Where the quoted check stood for a consumer rule, the quoting spec states the rule and names the owning spec.
10. Responsive Accordion Tabs keeps `nfs-tabs` included whenever the rules have a tabs mode (R45 of the consistency review), now for its `simple` and `primary` rules alone, so turning either look on later needs no stylesheet change.
11. The library's own tests stay: the Variant typings assertion, the stories' axe gates and computed-ratio assertions, the Sass compile tests of each mixin's rules (now asserting the emitted rules on Foundation's defaults and with the stories' settings), and the manual release tests. Angular Aria's own development log for each slide (Orbit) and each panel (Responsive Accordion Tabs) stays described as upstream behaviour.
12. Each spec was scanned for the brief's terms. No hit of `nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `In-family`, `Forgotten import`, `forgotten import`, `Selector manifest`, `nfsReportForgottenPeer`, `Runtime check`, `@error`, `@warn`, `dev check`, `development check`, `Dev-mode check`, `development warning`, `console.warn`, `sync:check`, `missing-imports`, or the five deferred spec file names remains. Kept on purpose: links to [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) for the no-import-array ruling (Responsive Accordion Tabs, Prototyping Utilities), whose file name contains "checks" and names no check; Angular's `ngDevMode.componentsSkippedHydration` in the e2e hydration cases; and ticket titles such as [Resolve the assistive-technology checks](77-evidence-assistive-technology-checks.md), which are manual release tests.

### Finds the manifest missed, for the later-milestone specs

- Off-canvas, development check 8 (a revealed fixed `position-top` or `position-bottom` panel whose document `scroll-padding` is smaller than the panel, 2.4.11): a misuse warning (it reads its host and the page) absent from the group d manifest. Its rule is Off-canvas Documented usage 8. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md) takes it from `specs/off-canvas.md` at 53144f3, API, "Development-mode checks", item 8.
- Orbit, "an unknown value is ignored with a dev-mode warning" (API, the `selected` bullet, and the browser-level movement case): a misuse warning absent from the manifest; now Orbit Documented usage 9. For ticket 161.
- Nested menu, the item-without-a-root warning in Hierarchy and DI shape ("a development-mode warning names the missing root"), which the In-family parent check had replaced: the forgotten-import spec's parent-check entry already covers it; noted so [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md) keeps the sentence.
- Prototyping Utilities, the sixteen flag properties `--nfs-prototype-<flag>-breakpoints` (Sass item 6, the mapping table's last column, D19) and the Out of Scope item on detecting Foundation's export mixins: the Runtime checks' presence design, for [Spec: Runtime checks (later milestone)](162-spec-runtime-checks-later-milestone.md); the flag properties return with those checks.
- Quoted checks whose owners' manifests must carry them (confirm in groups a to f): the Breakpoint service's shared rule parser warnings for invalid tokens (quoted by Responsive Accordion Tabs and Responsive Menu); the Drilldown Menu's `openPath()` warning outside drilldown mode and its checks for a missing wrapper or back item, and the Menu's copied-class check naming `orientation` (Responsive Menu); the Menu's check 2 for Foundation's `active` on a leaf and the `nfs-dropdown-menu` `@warn` checks for `$dropdownmenu-min-width` and the Top Bar pairs (Nested menu, as the orchestrator's boundary note says); the Accordion's dev check 7 and heading check, the Tabs copied-class check, the `nfs-accordion` contrast `@warn`, and the `nfs-tabs` checks of Tabs D26 (Responsive Accordion Tabs); the Close Button's name report and page-background check and `nfsMenuIcon`'s development check 4 (Off-canvas).
- Design notes on checks that were never specified, which the misuse-warnings spec may want as recorded alternatives: Responsive Embed's Out of Scope items (checks for captions, autoplay, and fallback length; a check for the second load at hydration) and its D5 and D8 rejected alternatives (a `MutationObserver` re-check; a fallback-length check); Prototyping Utilities' D7, D15, and D18 rejected alternatives (a warning for overlapping attributes, a check for a doubled name, checks on widths and heights); Progress Bar's D7 optional check parameter for text-less bars and D14's presence-marker upgrade path.
- The Prototyping Utilities' Utility directive rule, clauses 0 and 7, which the [Spec: Float Classes](105-spec-float-classes.md) and the [Spec: Typography Helpers](106-spec-typography-helpers.md) follow, now speaks of documented usage instead of development checks and compile-time checks; those specs' re-runs align with it.

### Triage

- The removed Prototyping Utilities flag properties: impact LOW (additive again with the later milestone; the Variant manifest never listed them), confidence HIGH (wave note 2 names the same case).
- Pagination D11 removed with its number left unused: impact LOW, confidence HIGH (brief: removed where nothing is left to decide).
- `nfs-tabs` still included for every tabs mode in Responsive Accordion Tabs: impact LOW, confidence HIGH (R45 stands; if the Tabs re-run narrows its own include rule, this spec follows it in the wave audit).
- `NfsProgressMeterText` keeps its required injection of `NfsProgressMeter`: impact LOW, confidence HIGH (ticket 158, decision 3: required parent injections stay).
- The Prototyping Utilities arrow colour, a `@warn` before, is a required setting only for an arrow that shows a menu's presence, as D17 always reasoned: impact LOW, confidence HIGH.

Nothing is OPEN FOR HUMAN.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md):

- `building-blocks.md` 1.10, the Progress Bar bullet: replace "`nfs-progress-bar` gives the meter text `$black` wherever it contrasts more than Foundation's fixed `$white` (success and warning), stops the compile when a fill leaves the meter text under 4.5:1, and needs `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` on Foundation's defaults (4.498:1 with `$white`, 4.36:1 with `$black`), mirrored in the Storybook settings overrides; `NfsProgressMeterText` warns in development when its text is wider than its meter, which axe marks incomplete. The Slider keeps its fill-against-track check, because its value has no text." with:

  > `nfs-progress-bar` gives the meter text `$black` wherever it contrasts more than Foundation's fixed `$white` (success and warning); every fill keeps its meter text at 4.5:1, a required setting that on Foundation's defaults is `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` (4.498:1 with `$white`, 4.36:1 with `$black`), mirrored in the Storybook settings overrides; a meter text goes only where the meter is always wider than its text, because axe marks a spilled text incomplete. The Slider keeps its fill-against-track requirement, because its value has no text.

- `building-blocks.md` 1.10, the Responsive Embed bullet: replace "and stays focusable (2.4.11), which the directive reports in development." with:

  > and stays focusable (2.4.11), so the documented usage writes nothing else in the box.

- `building-blocks.md` 1.10, the Prototyping Utilities bullet: replace from "and `NfsPrototypeOverflow` warns in development;" through "against `$body-background`;" with:

  > ; a `fixed-top` or `fixed-bottom` bar needs `scroll-padding` of its height on the scrolling element (2.4.11), as Sticky's does; an `nfsTextHide` element holds a visible replacement for its text (2.4.7, 2.5.8); `nfsBordered` and `nfsBorderNone` stay off form fields, whose 3:1 boundary they undo (1.4.11); an arrow that shows a menu's presence keeps `$prototype-arrow-color` at 3:1 against `$body-background`;

- `building-blocks.md` Table B, the OffCanvas row: replace "`revealOn` and `inCanvasOn` take Class breakpoints (`NfsClassBreakpoint`) and report through the Runtime checks, so" with:

  > `revealOn` and `inCanvasOn` take Class breakpoints (`NfsClassBreakpoint`), so

- `building-blocks.md` Table B, the Orbit row: replace "the five class-only directives inject nothing in production (an optional development-only lookup)" with:

  > the five class-only directives inject nothing

- `building-blocks.md` 1.9, the Ordered children bullet: replace "`contentChildren` is used only for dev-mode validation." with:

  > `contentChildren` is used only where a component renders its template from its content (Responsive Accordion Tabs' sections).

- `building-blocks.md` 1.13: wherever it describes the Prototyping Utilities' flag properties or a flag-gated property read by the Runtime checks, the group d specs no longer write them (Decision 7).
- `architecture-guide.md`, the DI rule ("a child injects it, required when it cannot exist alone and optional with a development warning when it can"): replace "optional with a development warning when it can" with:

  > optional when it can, with its documented usage stating where it belongs

- `storybook-conventions.md`, the include list: replace "@include nfs-off-canvas; // Off-canvas: reduced motion, the wrapper clip, panel contrast checks; every off-canvas--* story" with:

  > @include nfs-off-canvas; // Off-canvas: reduced motion and the wrapper clip; every off-canvas--* story

- The glossary (`CONTEXT.md`) and the README rows of these nine specs name no check of this group. The ADR notes stay ticket 171's own list; of the ADRs these specs cite, 0004, 0011, 0034, 0037, 0042, and 0043 are on it.

### Gist for Decisions so far

- [Re-run: specs without checks, group d](issues/168-rerun-specs-without-checks-group-d.md) -- Nested menu, Off-canvas, Orbit, Pagination, Progress Bar, Prototyping Utilities, Responsive Accordion Tabs, Responsive Embed, and Responsive Menu now describe a library with no checks: every development check becomes a numbered Documented usage rule stated in the JSDoc, every In-family line an "Imports (documented usage)" bullet naming Angular's own report (NG8001, NG8002, NG8003, NG0201) or plain markup, every Library mixin `@error` and `@warn` a required setting, and every Runtime check a rule to bind compiled names and include the mixin; four tokens take their plain name, required injections stay, development-only lookups and the Prototyping Utilities' flag properties go, quotes of other specs' checks are removed, and two missed checks (Off-canvas check 8, Orbit's unknown `selected` warning) go to the misuse-warnings spec; impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.
