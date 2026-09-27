# 82. Spec: Button Group

Type: grilling
Status: resolved
Blocked by: 81, 128
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Button Group to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/button-group.md` and its Sass is `scss/components/_button-group.scss` in the 6.9.0 clone. Publish `specs/button-group.md`.

Known from the triage: The triage rejects a Parent token for the group cascade; re-check that under typed inputs (a group-level `size` or `stacked` input may need to reach its buttons).

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/button-group.md](../specs/button-group.md).

Read first, as the ticket lists: ADR 0039, ADR 0040, the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) as ADR 0040 and building-blocks 1.3, 1.4, 1.9, 1.10, 1.13, and 1.14 carry it, the Answer of [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md) and the revised `specs/button.md`, `research/out-of-scope-triage.md` (the Button Group row and its dissent), `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (B1, G1), `map.md` Notes, `CONTEXT.md`, ADR 0001, 0012, and 0022, and the precedent of [Spec: Close Button](83-spec-close-button.md). Sources are cited as FS (the Foundation 6.9.0 clone): `docs/pages/button-group.md`, `scss/components/_button-group.scss`, `scss/components/_button.scss`.

### Measurements made for this ticket

Throwaway files under `D:/tmp/nfs-wave-82/` (`compile.mjs` for Sass, `measure.mjs`, `hit.mjs`, `edge.mjs` for the browsers, `ratio.mjs` and `selector.mjs` for Sass checks), not committed. Foundation 6.9.0 Sass from the local clone with Dart Sass 1.104.1, under the Button spec's required `$button-palette`, with the Button spec's floor and D18 rule emulated; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0; ratios unrounded with Foundation's `color-luminance()`. The three engines agree on every result.

- Cascade: a button's `.small` inside a plain group renders at 14.4 px (the default size, because FS `_button-group.scss:59` resets it after `.button.small`); inside a `.large` group at 20 px. Group `.primary` with a button `.alert`: primary background. Hollow group `.primary` with a button `.alert`: alert label; hollow group `.alert` with a button `.primary`: alert label (the palette name later in `$button-palette` wins, FS `_button-group.scss:244-256`). Hollow group with a button `.clear`: the hollow border shows. Solid group under `$button-fill: solid` with a button `.hollow`: hollow (no group rule, FS `:233-241`).
- Arrows: under `$button-fill: solid`, the arrow of an arrow-only dropdown button is `$white` on the page, 1.00:1, in hollow, clear, hollow alert, and hollow groups whose buttons carry their own colour, because FS `_button.scss:399-411` colours the arrow only for a button's own `.hollow`/`.clear`; 4.59:1 or more in solid groups. Under `$button-fill: hollow`, a solid group's arrow is `$button-background` on its fill, 1.00:1, and 1.15:1 on an alert fill (FS `_button.scss:393-397`). With the candidate `nfs-button-group` rules: the label colour in hollow and clear groups (4.59:1 primary, 5.25:1 alert, 5.28:1 success on the page) and `$white` in solid groups.
- No gaps: a `.no-gaps.tiny` group of one-glyph buttons overlaps each button with the next by 1 px (FS `_button-group.scss:87-98`); axe `target-size` reports "Target has insufficient size because it is partially obscured (smallest space is 23px by 27.9px, should be at least 24px by 24px)" for each button but the last. With `min-width: calc(24px + 0.0625rem)` on those buttons: no violation, and pixel hit testing gives each 24 px (a standalone floored button measures the same). Keyboard focus on the middle button of a no-gaps group: the focus indicator is drawn whole (screenshots in three engines).
- Stacking: `.stacked.stacked-for-small` at 800 px is side by side. `$breakpoints: (xs: 0, md: 640px, lg: 1024px)` stops `foundation-button-group`'s own compile ("expected media condition in parentheses"), because FS `:276`, `:282`, `:288`, `:299` name `medium`, `large`, `small only`, and `medium down` literally.
- Selectors: the candidate rules nested under `#{$buttongroup-child-selector}` compile for `'> .button'` and for the list `'.button, .btn'`.
- WCAG 2.5.8 Understanding (w3c/wcag `understanding/22/target-size-minimum.html`, fetched raw from GitHub because the W3C site served a Cloudflare challenge): a target that clips another is measured by its own 24 by 24 size, and a smaller one fails when its 24 px circle meets the other target; the overlapped 23 px button meets its neighbour, and axe fails it.

### Grilling record

Round 1 (nothing settled yet).

- Q1, directive or component, which host. For a component: none of Foundation's markup is generated. For `div[nfsButtonGroup]`: Foundation's docs use `div`. Against the restriction: on any other element the directive would silently not apply, and the Forms spec's containers take any element. Settled: `[nfsButtonGroup]`, binding `.button-group` (decision 1).
- Q2, the triage's known item: does a group input need to reach its buttons under typed inputs? For a token: Material's toggle group cascades `appearance` and `disabled` through a parent token, and `nfsButton` could read a group `size`. Against: the group's Variant classes sit on the container and Foundation's descendant selectors do the rest (measured: a `.large` group sizes its buttons at 20 px); a token adds a script path absent before hydration and a Button amendment, and would disagree with Foundation's own precedence. Settled: no token, `NfsButton` unchanged (decision 2).
- Q3, which classes become which inputs. Read from the Sass: sizes and palette (Open, over `$button-sizes` and `$button-palette`), fills (Closed), `.expanded`, `.stacked`, `.stacked-for-small`, `.stacked-for-medium`, `.no-gaps`. `stackedFor` as a Class breakpoint query was weighed and rejected: Foundation writes both names and their breakpoints literally, and its compile stops without them (measured). One `stacked: true | 'small' | 'medium'` input was weighed and rejected: building-blocks 1.4 names `stackedFor` itself. Settled: seven inputs; `size`, `color`, and `fill` reuse the Button's aliases, as the Variant declaration tooling spec already expects for `color` (decision 3).
- Q4, a default `role="group"`. For: Bootstrap writes it on every group; Foundation calls groups "related action items". Against: the triage decided guidance; the APG calls naming a group discretionary and an unnamed group adds nothing; a static host role would replace a `nav`'s or `fieldset`'s semantics. Settled: no default role, no naming check; the split-button examples show the named form (decision 4).
- Q5, Aria's `Toolbar`. For: the Aria inventory names it as the pattern for a `.button-group` that wants keyboard navigation. Against: Foundation has no keyboard contract here, the APG keeps toolbars for three or more controls, a toolbar changes Tab into arrow keys, and `nfsButton` on `ngToolbarWidget` collides (the Button re-run's decision 21). Settled: not used; a different pattern, not a fallback (decision 10).
- Q6, Flexbox alignment. For an `align` input: the docs page shows it on the group. Against: `.align-*` are Flexbox Utilities classes (`foundation-flex-classes`), and one Utility family would get two owners. Settled: the Flexbox Utilities directive beside the group, written `nfsAlign` until that spec names it (decision 9).

Round 2 (Q1 to Q6 settled).

- Q7, the buttons' own Variant inputs inside a group. Measured: `size` never renders; `color` and `fill` lose to the group's, or depend on palette order. Options: document only; a group token that `nfsButton` reads to warn (a Button amendment for a development check); a development-only `contentChildren(NfsButton)` query in the group, which building-blocks 1.9 allows for validation. Settled: the query, with three warnings (decision 5).
- Q8, `stacked` with `stackedFor`. Both classes unstack from the next breakpoint (measured). Settled: a development warning, since two inputs cannot exclude each other in the type (decision 6).
- Q9, copied classes. Settled: building-blocks 1.4's initial-state check in development builds, including the docs page's four alignment classes (decision 7).
- Q10, WCAG 2.2 AA. Label, hover, and disabled pairs: the group calls `button-fill-style` with the same palette and `auto` colours as the Button (FS `_button-group.scss:238-254` against `_button.scss:369-381`), so `nfs-button`'s checks cover them. Arrows in filled groups fail 1.4.11 (measured). `.no-gaps` fails 2.5.8 for one-glyph tiny buttons (measured, axe violation). Focus in no-gaps groups passes (measured). Settled: two arrow rules and a no-gaps floor in `nfs-button-group`, no check of its own (decision 11).
- Q11, Variant properties. For writing `--nfs-button-palette` and `--nfs-button-sizes` again: a literal reading of building-blocks 1.13 and the tooling spec's example comment. Against: an empty property reads like a missing one, so a second writer would keep them present when `nfs-button` is missing and hide that include from `strictVariantProperties`; a group always has `nfsButton` hosts, so `nfs-button` is always there. Settled: `nfs-button-group` writes none; one writer per property, proposed for building-blocks 1.13 and ADR 0040 (decision 12).
- Q12, outputs, methods, models, `disabled`, `exportAs`. Settled: none; `exportAs` is additive later and nothing reads a group through a reference (the Forms spec's choice, against the Close Button's parity choice) (decision 8).

Round 3 (Q7 to Q12 settled).

- Q13, rendering modes. Settled: a static class and one class-list binding, no listeners, checks only in a client render callback; groups work unchanged in dehydrated and `hydrate never` blocks (decision 13).
- Q14, stories and seams. Settled: nine stories in docs order; layer 1 at 414 px sees every stacked group stacked, so the unstack points, three-engine hit testing, and the focus screenshot are e2e (decision 14).
- Q15, vocabulary. The Button spec, the Hybrid item's avoid list, and Foundation all say "split button" without a definition. Settled: a glossary term (below).

The frontier is empty.

### Decisions

1. One attribute directive, `NfsButtonGroup`, selector `[nfsButtonGroup]`, no `exportAs`, in its own entry point `ngx-foundation-sites/button-group`; it binds `.button-group` as a static host class. Its buttons are `nfsButton` hosts, whose `.button` matches Foundation's default `$buttongroup-child-selector`.
2. No token, providers, host directives, child registration, or Defaults token. The group's Variant classes reach its buttons through Foundation's descendant selectors (measured). `NfsButton` declares and reads no group token; the Button spec needs no amendment beyond wording.
3. Seven Variant inputs, one `[class]` list: `size: NfsButtonSize`, `color: NfsButtonColor`, `fill: NfsButtonFill` (the Button's aliases, imported as types from `ngx-foundation-sites/button`, over `NfsButtonSizesOverrides` and `NfsButtonPaletteOverrides`); `expanded`, `stacked`, and `noGaps` booleans through `nfsVariantBoolean`; `stackedFor: NfsButtonGroupStackedFor = 'small' | 'medium'`, closed, `'small'` setting `.stacked-for-small` and `'medium'` `.stacked-for-medium`. Unset sets no class; `size="default"` sets none. `expanded` takes no Breakpoint query, because Foundation has no responsive group class.
4. No default `role`; guidance: `role="group"` with `aria-labelledby` or `aria-label` where the grouping carries meaning, shown on every split-button example; no naming check.
5. Development-only `contentChildren(NfsButton, {descendants: true})`, read in the development read phase: a button's `size` inside a group warns (it never renders); `color` or `fill` set on both the group and a button warns (the group or palette order decides).
6. `stacked` with `stackedFor` warns in development.
7. A copied Foundation class on the host warns in development, read through `HostAttributeToken('class')` in development builds only, covering the closed names, Foundation's default size and palette names, and `align-center`, `align-right`, `align-spaced`, `align-justify` (reported as Flexbox Utilities classes); a redundant `button-group` is not reported.
8. No outputs, methods, models, group-level `disabled`, or `exportAs`.
9. Flexbox alignment is the Flexbox Utilities directive's, placed beside `nfsButtonGroup`, written `nfsAlign` until that spec names it; `.show-for-sr` in split buttons is written `nfsShowForSr`, the Button spec's placeholder.
10. Native implementation level; Aria's `Toolbar` is not used and this is not a fallback from an Aria building block (a different pattern Foundation does not have); CDK adds nothing.
11. `nfs-button-group`, included after `foundation-button-group` and `nfs-button`, nested under `$buttongroup-child-selector`: `border-top-color: currentColor` on `.button-group.hollow` and `.button-group.clear` dropdown arrows (each only while it is not `$button-fill`); `$white` on `.button-group.solid` dropdown arrows while `$button-fill` is `hollow` (1.4.11); `min-width: calc(24px + rem-calc($button-hollow-border-width))` on every no-gaps button but the last (2.5.8). No compile-time check of its own: every pair the rules produce is one `nfs-button` checks.
12. `nfs-button-group` writes no Variant property. The group reports `color` and `size` to the Variant check against `--nfs-button-palette` and `--nfs-button-sizes`, which `nfs-button` alone writes; a missing-properties report names `@include nfs-button;`. A missing `nfs-button-group` has no Runtime report; the spec lists what breaks.
13. Rendering modes: server HTML equals the hydrated DOM; no listeners and no `jsaction`; no Hydration boundary of its own; the checks never run on the server; a split button's Trigger and pane share one boundary (the Triggers rule).
14. Story ids `button-group--default`, `--sizing`, `--coloring`, `--hollow-and-clear`, `--no-gaps`, `--even-width`, `--stacking`, `--split-buttons`, `--flexbox`; e2e for the unstack points, three-engine hit testing in no-gaps groups, and the focus screenshot; the fixture app for server HTML with JavaScript disabled and clean hydration.

### Triage

- Decisions 1 and 3 (the directive and its inputs): impact HIGH (public API and type names); confidence HIGH (mechanical under ADR 0039, ADR 0040, and building-blocks 1.4, which names `stackedFor`; the closed `stackedFor` union rests on a measured compile failure). DECIDED.
- Decision 2 (no token): impact MEDIUM (adding one later would amend `nfsButton`); confidence HIGH (the triage's decision, re-checked under typed inputs and measured in three engines). DECIDED.
- Decision 4 (no default role): impact MEDIUM (a default added later changes every consumer's accessibility tree); confidence HIGH (the triage's decision; APG: naming a group is discretionary). DECIDED.
- Decisions 5 to 7 (development warnings): impact LOW (development only, additive); confidence HIGH (measured precedence; building-blocks 1.4 and 1.9). DECIDED.
- Decision 11 (the mixin rules): impact MEDIUM (library CSS every consumer ships); confidence HIGH (both failures and both fixes measured in three engines, with axe for 2.5.8). DECIDED.
- Decision 12 (one writer per Variant property): impact MEDIUM (a building-blocks rule and the manifest); confidence HIGH (follows from the measured equivalence of an empty and a missing property in the Button re-run and from how `strictVariantProperties` decides). DECIDED.
- Decision 10 (no Toolbar): impact MEDIUM; confidence HIGH (APG toolbar pattern; the Button re-run's decision 21). DECIDED; listed for the consistency review as not a fallback.
- Decision 9 (placeholders `nfsAlign`, `nfsShowForSr`): impact LOW (names in examples); confidence NOT HIGH (the Flexbox Utilities and Visibility Classes specs have not run). DECIDED as placeholders; those specs' names replace them.
- Decisions 8, 13, 14: impact LOW, confidence HIGH. DECIDED.
- Nothing is OPEN FOR HUMAN, and no prototype is needed: every open behaviour was measured here.
- Dissent recorded: the triage's native lens wanted a child check; decision 5 checks the buttons' inputs but not which children a group holds, because `$buttongroup-child-selector` is a consumer setting.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table D, the Button Group row: fill the empty cells.

   "| Button Group | `docs/pages/button-group.md` | [Spec: Button Group](issues/82-spec-button-group.md) | `[nfsButtonGroup]` (`NfsButtonGroup`: binds `.button-group`; Variant inputs `size`, `color`, `fill` over the Button's aliases and registries, `expanded`, `stacked`, `stackedFor` (`'small' \| 'medium'`), `noGaps`); its buttons are `nfsButton` hosts; the split button is a composition with a Trigger and a Dropdown pane | Directive: `.button-group` is a Structural class on a consumer-written container, and Foundation generates nothing | Native platform (CSS on a container of native buttons); Aria's Toolbar is a different pattern (roving focus) that Foundation's group does not have; CDK adds nothing | A static host class and one `computed` class list; no token (Foundation's descendant selectors carry the group's look to its buttons); a development-only `contentChildren(NfsButton)` and `HostAttributeToken('class')` for five warnings; the Variant check against `nfs-button`'s properties; `nfs-button-group` (dropdown arrows in filled groups for 1.4.11, the no-gaps floor for 2.5.8, no Variant property) | None for the group; Button for its buttons |"

2. `building-blocks.md` 1.10, a new bullet after the Close Button bullet:

   "- Button Group ([Spec: Button Group](issues/82-spec-button-group.md)): the `nfs-button-group` Library mixin colours the dropdown arrows of hollow and clear groups with `currentColor` and, under `$button-fill: hollow`, those of solid groups with `$white` (1.4.11: Foundation colours an arrow only for a button's own fill class, so a filled group's arrows measure 1.00:1), and raises the floor of every button but the last in a `.no-gaps` group to `calc(24px + rem-calc($button-hollow-border-width))` (2.5.8: Foundation's overlap leaves a floored one-glyph `.tiny` button 23 px unobscured, an axe violation in three engines). Every label and arrow pair in a group is a Button pair, so `nfs-button`'s compile-time checks cover the group."

3. `building-blocks.md` 1.13, the Variant properties bullet: after its first sentence ("... (`--nfs-button-palette: primary secondary success warning alert;`, `--nfs-grid-columns: 12;`).") insert:

   "Each property has one writer: an entry point whose Open Variant families loop over another entry point's settings reads that entry point's properties and writes none (Button Group reads `nfs-button`'s `--nfs-button-palette` and `--nfs-button-sizes`), because an empty property reads like a missing one, so a second writer would keep a property present while the first include is missing and hide it from `strictVariantProperties` ([Spec: Button Group](issues/82-spec-button-group.md), D11)."

   and replace its last sentence, "An entry point with an Open Variant family therefore always has a Library mixin (ADR 0012, dated note).", with "An entry point with an Open Variant family therefore always has a Library mixin that writes its properties, its own or, for families over another entry point's settings, that entry point's (ADR 0012, dated note)."

4. `adr/0040-variant-input-types.md`, Consequences, append after the Button re-run's dated bullet: "- 2026-09-27 ([Spec: Button Group](../issues/82-spec-button-group.md)): a Variant property has one writer. An entry point whose Open Variant families loop over another entry point's settings reads that entry point's properties and writes none, because a second writer would keep the property present while the first include is missing and hide it from `strictVariantProperties`."

5. `CONTEXT.md`, Foundation side, after **Close Button**:

   ```markdown
   **Split button**:
   A Button Group of two buttons, a main action and an arrow-only dropdown button that opens more actions of the same kind; built from the group, the buttons, and a Trigger, with no component of its own. Distinct from a Hybrid item, whose link navigates and whose toggle opens a submenu.
   _Avoid_: dropdown button (for the pair), menu button, action menu
   ```

6. `README.md`, the Plugins table, after the Close Button row:

   "| Button Group (CSS-only component) | [specs/button-group.md](specs/button-group.md) | Native platform; one listener-free container directive whose Variant classes reach its `nfsButton` hosts through Foundation's descendant selectors | No inventory: Foundation's button-group docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Button Group row) | None needed; cascade precedence, arrow contrast, no-gaps target size, and focus measured in [Spec: Button Group](issues/82-spec-button-group.md) |"

7. `map.md`, Decisions so far: the gist at the end of this Answer.

No ADR: the one-writer rule and the mixin rules are reversible and carry no public API, so they miss the "hard to reverse" test; building-blocks 1.13 and ADR 0040's Consequences record the rule.

### What other specs need from this one

- [Spec: Button](37-spec-button.md) (`specs/button.md`, revised by [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md)): no token is needed, so only wording changes.
  - Hierarchy and DI shape, second bullet: replace "`NfsButton` declares no group token of its own; the [Spec: Button Group](../issues/82-spec-button-group.md) decides whether a group's buttons read one, and proposes the amendment here if they do." with "`NfsButton` declares and reads no group token: a Button Group's Variant classes reach its buttons through Foundation's descendant selectors, and the group checks its buttons' inputs in development through a content query ([Spec: Button Group](../issues/82-spec-button-group.md), D2 and D5)."
  - D10, rationale: replace "whether a group's buttons read a group token is the Button Group spec's call under typed inputs" with "the Button Group spec found that no group token is needed (its D2)"; rejected alternative: replace "a group Parent token, or its absence, decided here" with "a group Parent token".
  - The `size` input's JSDoc can add: "Has no effect inside `nfsButtonGroup`, whose rule resets its buttons to the default size; set `size` on the group."
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the `NfsButtonPaletteOverrides` and `NfsButtonSizesOverrides` manifest entries keep `mixins: ['nfs-button']` and gain `uses` entries `{entryPoint: 'ngx-foundation-sites/button-group', directive: 'NfsButtonGroup', input: 'color', alias: 'NfsButtonColor', shape: 'name'}` and the same for `size` with `NfsButtonSize`. The `mixins` example comment `['nfs-button', 'nfs-button-group']` becomes `['nfs-button']`, and the "Known `mixins` today" sentence's "The grid, flexbox, Prototyping, and Button Group specs name theirs." becomes "`nfs-button-group` writes none, reading `nfs-button`'s (one writer per property); the grid, flexbox, and Prototyping specs name theirs." `NfsButtonGroupStackedFor` is closed and has no registry. The typings assertion covers `NfsButtonGroup`'s seven inputs.
- [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md): a directive may report values against a Variant property another entry point's mixin writes; the `strictVariantProperties` report names the mixin that writes the property (`nfs-button` for `NfsButtonGroup`), not one derived from the reporting directive's entry point. Proposed text: "A Variant report names the property and the Library mixin that writes it; a directive whose family reads another entry point's property (Button Group reads `--nfs-button-palette`) names that entry point's mixin in the missing-include report."
- [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md): Foundation's Flexbox Button Group example puts `.align-center`, `.align-right`, `.align-spaced`, and `.align-justify` on `.button-group`; your directive must compose on an `[nfsButtonGroup]` host, which binds only `.button-group` and its own Variant classes. This spec writes it `nfsAlign="center"` and its `button-group--flexbox` story uses it; replace the name when you choose it. `nfsButtonGroup`'s copied-class check reports those four classes as yours.
- [Spec: Visibility Classes](104-spec-visibility-classes.md): the split-button examples and `button-group--split-buttons` use your `.show-for-sr` directive, written `nfsShowForSr` (the Button spec's placeholder).
- [Re-run: Dropdown spec under the class rule](118-rerun-dropdown-class-rule.md): a split button's Dropdown pane goes after the group, never inside it, because Foundation's descendant selector would give the pane's `nfsButton` hosts the group's size, colour, and margins; the examples use `[nfsToggle]="pane"` with `#pane="nfsDropdownPane"` on the arrow-only button.
- [Re-run: Tooltip spec under the class rule](119-rerun-tooltip-class-rule.md): no change; the Button Group spec cites D23's sibling pseudo-class limit for grouped buttons (a 1 px right margin, and lost corner radii under `$buttongroup-radius-on-each: false`).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): list Aria's Toolbar as unused by the Button Group spec, with the reason that it is a different pattern and not a fallback; replace the `nfsAlign` and `nfsShowForSr` placeholders; `exportAs` is set on `nfsButton` and `nfsCloseButton` but not on `nfsButtonGroup` or the Forms directives, each for a stated reason; check that no spec's example sets `size` on an `nfsButton` inside `nfsButtonGroup`.

### Gist for Decisions so far

- [Spec: Button Group](issues/82-spec-button-group.md) -- one listener-free `[nfsButtonGroup]` binding `.button-group` with seven Variant inputs (`size`, `color`, `fill` on the Button's aliases, `expanded`, `stacked`, `stackedFor` as `'small' | 'medium'`, `noGaps`); no token, because Foundation's descendant selectors carry the group's look to its `nfsButton` hosts (measured), so `nfsButton` is unchanged; development warnings for a button `size` that never renders inside a group, `color` or `fill` set on both, `stacked` with `stackedFor`, and copied classes; no default role; the split button is a composition with a Trigger and a Dropdown pane; `nfs-button-group` fixes invisible dropdown arrows in filled groups (1.00:1 measured, 1.4.11) and the no-gaps overlap (23 px, an axe violation, 2.5.8) and writes no Variant property, because each property has one writer; impact HIGH, confidence HIGH; no ADR. Spec: [specs/button-group.md](specs/button-group.md).
