# Architecture audit: group b

Group: b. Specs audited: `specs/callout.md`, `specs/card.md`, `specs/close-button.md`, `specs/drilldown-menu.md`, `specs/dropdown-menu.md`, `specs/dropdown.md`, `specs/equalizer.md`, `specs/flex-grid.md`, `specs/flexbox-utilities.md`. Guide version: `architecture-guide.md`, last dated change 2026-09-28. Date of this audit: 2026-09-29.

Each spec was read in full (Problem Statement through Further Notes) and checked against every principle P1-P26 from the spec's class mapping, hierarchy and DI shape, API, ARIA and keyboard tables, rendered HTML, rendering modes, Sass subsection, and Testing Decisions, per the guide's own audit instructions. ADR 0044, ADR 0045, ADR 0046, and `specs/forgotten-import-checks.md` were read first, as the ticket requires, and every multi-directive spec in this group was checked for its In-family check lines, parent token descriptions, and `strictParents` effect statements by that rule.

## Summary of the one cross-cutting cause

All nine specs in this group predate [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) (2026-09-28) in this one respect: none of them states that its directives call `nfsDirectiveCheck`, none lists the per-part In-family check line the shared [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md) requires of a spec with more than one directive, and the two families in this group that appear in that spec's eight-family `strictParents` table (Equalizer, Drilldown Menu) never state the `strictParents` effect on their optional parent injections. A search of every spec in this group for `nfsDirectiveCheck`, `strictParents`, and `NfsFamilyPeers` returns zero matches; only `specs/breakpoint-service.md`, `specs/accordion.md`, and `specs/forgotten-import-checks.md` itself (none in this group) mention them. This is recorded once per spec below, under P24, because P24 is the lowest-numbered principle each falls short of (each spec's own ad hoc development checks for copied classes, missing includes, and placement already meet P23's substance; it is specifically the ADR 0046 mechanism that is absent).

## `specs/callout.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| callout-a1 | P24 | Hierarchy and DI shape, "Injection" | "Injection: in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning (D11); the Runtime check hook of `ngx-foundation-sites/media-query`... Nothing else." | `NfsCallout` has an attribute selector, so P24 and ADR 0046 require it to call `nfsDirectiveCheck('NfsCallout')` from its constructor behind an inline `ngDevMode` guard; a single-directive spec need only state that call (spec 150), and this one does not. | Add one line under Hierarchy and DI shape: "Calls `nfsDirectiveCheck('NfsCallout')`." | yes: the same gap appears in every other spec in this group. |

## `specs/card.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| card-a1 | P24 | Hierarchy and DI shape, "Injection" | "Injection: none, in development builds too. There is no copied-class check... and no Runtime check, because there is no Variant property." | Four directives with an attribute selector (`NfsCard`, `NfsCardDivider`, `NfsCardSection`, `NfsCardImage`) each still must call `nfsDirectiveCheck` (P24: "Every library directive and component with an attribute selector calls `nfsDirectiveCheck`..."), and as a spec with more than one directive it must list one In-family-check line per part (name, parent check, child probes, peers, `strictParents` effect), even where every column reads "none"/"nothing". Neither appears. | Add a per-part line for each of the four directives naming its `nfsDirectiveCheck` call, with "none" for parent check, child probes, and peers, and "nothing" for `strictParents`. | yes |

## `specs/close-button.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| close-button-a1 | P24 | Hierarchy and DI shape, "Injection" | "Injection: `ElementRef`, read only by the development-mode checks, and the Runtime check hook of `ngx-foundation-sites/media-query`... Nothing else." | Single-directive spec omits the required statement that `NfsCloseButton` calls `nfsDirectiveCheck('NfsCloseButton')`. | Add one line. | yes |

## `specs/drilldown-menu.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| drilldown-menu-a1 | P24 | Hierarchy and DI shape; Development-mode checks | "Wrapper to root: the root registers itself with the nearest `NfsDrilldownWrapper` at construction (`skipSelf`, optional)..." / "Back to root and level: `NfsDrilldownBack` injects the nearest `NfsSubmenu`... and the nearest `NfsDrilldown`..., both optional, and registers with the root, which uses the registry only for development checks." | Drilldown Menu is one of the eight families `specs/forgotten-import-checks.md`'s `strictParents` table names by part (`li[nfsDrilldownBack]` optional injection of `NfsDrilldown` throws under `strictParents`); none of the spec's three directives (`NfsDrilldown`, `NfsDrilldownWrapper`, `NfsDrilldownBack`) is stated to call `nfsDirectiveCheck`, so the spec carries none of the per-part lines spec 150 requires, and it never states the `strictParents` throw for the back item, nor why the root's optional wrapper injection is a kept-optional form (a Responsive Menu whose rules do not name drilldown has no wrapper, and the check that would need it only runs while drilldown is the live mode, which construction cannot know -- this reasoning exists only in `forgotten-import-checks.md`, not here). | Add the three per-part lines under Hierarchy and DI shape, including the `strictParents` throw for `NfsDrilldownBack`'s optional `NfsDrilldown` injection, and one sentence carrying the wrapper's kept-optional rationale into this spec. | yes: the eight-family `strictParents` gap is shared with `equalizer.md`; the general `nfsDirectiveCheck` gap is shared with every spec in this group. |

## `specs/dropdown-menu.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| dropdown-menu-a1 | P24 | Further Notes, D22 | "D22 \| The root has no development check of its own and reports no copied `dropdown` (2026-09-28) \| The projected right-hand section's warning is the Nested menu root's... The hosted Menu and the Nested menu report every other copied class" | Even a directive with no family-specific checks of its own must still call `nfsDirectiveCheck` (P24: universal, independent of whether the directive has its own In-family checks), for the host record and the `strictDirectiveImports` check to see it. The spec never states this call for `NfsDropdownMenu`. | Add one line stating `NfsDropdownMenu` calls `nfsDirectiveCheck('NfsDropdownMenu')` with no family argument, consistent with D22's "no development check of its own". | yes |

## `specs/dropdown.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| dropdown-a1 | P24 | Hierarchy and DI shape | "`InteractivityChecker` and `FocusTrapFactory` are resolved with `Injector.get`... [Injection list ends with] `HostAttributeToken('autoFocus')` and `HostAttributeToken('class')` (optional, development builds only)" | Single-directive spec never states that `NfsDropdownPane` calls `nfsDirectiveCheck('NfsDropdownPane')`. | Add one line. | yes |

## `specs/equalizer.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| equalizer-a1 | P24 | Hierarchy and DI shape | "Parent handle: `nfsEqualizerToken`, an `InjectionToken<NfsEqualizer>` declared with a type-only import of the class (building-blocks 1.9). `NfsEqualizer` provides it with `useExisting`." / "An `nfsEqualizerWatch` with no equalizer warns once in development mode ('nfsEqualizerWatch found no nfsEqualizer among the element injectors of its template') and does nothing." | Equalizer is one of the eight families `forgotten-import-checks.md`'s `strictParents` table names (`[nfsEqualizerWatch]`'s optional injection of `nfsEqualizerToken` "warns; does nothing" without the flag and "throws" with it); `nfsEqualizerToken` is exactly the kind of lightweight parent token ADR 0046 requires to carry a development-only description naming the providing directive, its entry point, and the same-template rule (so NG0201/the thrown error names more than the token). Neither the `strictParents` effect nor the token's development description appears anywhere in this spec, and neither `NfsEqualizer` nor `NfsEqualizerWatch` is stated to call `nfsDirectiveCheck`. | Add `nfsEqualizerToken`'s development-only description; add the two per-part `nfsDirectiveCheck` lines, stating that `strictParents` turns the "no equalizer" warning into a throw. | yes: the eight-family gap is shared with `drilldown-menu.md`; the general gap with every spec in this group. |

## `specs/flex-grid.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| flex-grid-a1 | P24 | Hierarchy and DI shape | "Two standalone directives with no template, no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a row or a column through DI... it reads the DOM in a development render callback (building-blocks 1.9, Ancestry that projection can hide)." | As a spec with more than one directive it needs one line per part naming its `nfsDirectiveCheck` call, even where parent check, child probes, and peers are all "none" and `strictParents` is "nothing" (this family has no DI parent-child relationship at all, unlike Equalizer or Drilldown Menu, but the call itself is still required by P24). Neither `NfsRow` nor `NfsColumn` is stated to call it. | Add two lines. | yes |

## `specs/flexbox-utilities.md`

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| flexbox-utilities-a1 | P24 | Hierarchy and DI shape | "No token, no providers, no parent discovery through DI, and no Defaults token: no directive of this family needs another's state... `NfsFlexChild` reads its parent element only in its development checks." | Same gap for `NfsFlexContainer`, `NfsFlexAlign`, and `NfsFlexChild`: none is stated to call `nfsDirectiveCheck`, and the spec (more than one directive) lists no per-part In-family-check line. | Add three lines. | yes |

## Guide problems

None found. P24's rule (and the ticket's explicit instruction to check every multi-directive spec against it) is itself sound, testable, and restates a recorded decision (ADR 0046); the gap above is a spec-currency problem -- nine specs written or last revised before 2026-09-28 that ADR 0046's spec (150) has not yet been back-ported into -- not a defect in the guide or in P24 itself.

## Principles checked hardest but yielding no further findings in this group

Beyond P24, the following received close attention because this group concentrates the library's utility families, legacy grids, and Anchored-pane-based menus, and turned up no shortfall: P2 (one directive per Structural class -- Card's four directives, Close Button, Callout), P6/P8 (hosting `NfsMenu` in Drilldown Menu and Dropdown Menu, hosting `NfsFlexAlign` in Flexbox Utilities), P9 (utility-family input shapes and the same-element name collisions each spec reports: Flex Grid's Notes, Flexbox Utilities' D2/D7), P13 (naming: `NfsDropdownMenu` on `ul.dropdown.menu`, `NfsCloseButton`, Plugin-named `NfsEqualizer`/`NfsDrilldown` with no class of their own), P16 (native-first implementation levels and the CDK pieces Dropdown Pane and Drilldown Menu use), P17/WCAG tables (contrast and target-size compile-time checks in Callout, Card, Close Button, Drilldown Menu, Dropdown Menu, Dropdown), P19 (animation via State classes, never `animate.enter`/`animate.leave`, in every spec that animates), and P22 (entry-point boundaries and type-only imports of `nfsEqualizerToken`, `nfsCloseButtonToken`, `nfsTopBarRightToken`).
